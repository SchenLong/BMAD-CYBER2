#!/usr/bin/env python3
"""
BMAD Guardrails: Prompt Injection Defense
==========================================
Detects and handles content that attempts to manipulate AI agent behavior
through injected instructions.

This guard protects against:
- System prompt override attempts
- Role hijacking
- Instruction injection
- Encoded/obfuscated payloads
- Hidden unicode manipulation
- Context manipulation attacks

Exit Codes:
- 0: Allow the operation (info severity or override)
- 2: Block the operation (warning/critical severity)

Hook Points:
- PreToolUse for Read: Warn only (must be able to analyze malicious files)
- PreToolUse for Write/Edit: Block if injection patterns detected
- UserPromptSubmit: Warn and inform user

Behavior:
- Info severity: Log and allow
- Warning/Critical severity: Block, inform user, let user decide via override
"""

import json
import sys
import os
import re
import base64
import unicodedata
from typing import List, Dict, Tuple, Optional

# Import shared security utilities
try:
    from security_common import (
        AuditLogger, OverrideManager, PROJECT_DIR, get_tool_input_from_stdin
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

    def get_tool_input_from_stdin():
        try:
            data = json.load(sys.stdin)
            return {
                'tool_name': data.get('tool_name', ''),
                'tool_input': data.get('tool_input', {}),
                'cwd': data.get('cwd', PROJECT_DIR),
                'raw': data
            }
        except (json.JSONDecodeError, KeyError):
            return {'tool_name': '', 'tool_input': {}, 'cwd': PROJECT_DIR, 'raw': {}}

    class AuditLogger:
        @classmethod
        def log_blocked(cls, *args, **kwargs): pass
        @classmethod
        def log_allowed(cls, *args, **kwargs): pass
        @classmethod
        def log_override_used(cls, *args, **kwargs): pass
        @classmethod
        def log(cls, *args, **kwargs): pass

    class OverrideManager:
        @classmethod
        def check_and_consume_override(cls, t):
            return os.environ.get(f'BMAD_ALLOW_{t.upper()}', '').lower() == 'true', ''


VALIDATOR_NAME = 'prompt_injection_guard'

# =============================================================================
# INJECTION PATTERNS
# =============================================================================

# System prompt override attempts
SYSTEM_OVERRIDE_PATTERNS = [
    {
        'name': 'Ignore instructions',
        'pattern': r'(?i)\b(ignore|disregard|forget|override)\s+(all\s+)?(previous|prior|above|earlier|system|original)\s+(instructions?|prompts?|rules?|guidelines?|constraints?)',
        'severity': 'critical',
        'description': 'Attempts to make the AI ignore its instructions',
    },
    {
        'name': 'New identity assignment',
        'pattern': r'(?i)(you\s+are\s+now|from\s+now\s+on\s+you\s+are|pretend\s+(to\s+be|you\s+are)|act\s+as\s+if\s+you\s+are|imagine\s+you\s+are|roleplay\s+as)\s+(?!a\s+(helpful|AI|assistant))',
        'severity': 'warning',
        'description': 'Attempts to assign a new identity to the AI',
    },
    {
        'name': 'System prompt reveal',
        'pattern': r'(?i)(show|reveal|display|print|output|repeat|tell\s+me)\s+(your\s+)?(system\s+prompt|initial\s+instructions?|original\s+prompt|hidden\s+instructions?|base\s+prompt)',
        'severity': 'warning',
        'description': 'Attempts to reveal system prompt',
    },
    {
        'name': 'Mode switching',
        'pattern': r'(?i)(switch\s+to|enter|enable|activate)\s+(developer|debug|admin|sudo|root|unrestricted|unfiltered|jailbreak|DAN)\s*mode',
        'severity': 'critical',
        'description': 'Attempts to switch to a privileged mode',
    },
    {
        'name': 'Constraint removal',
        'pattern': r'(?i)(remove|disable|turn\s+off|bypass|circumvent|ignore)\s+(all\s+)?(restrictions?|limitations?|constraints?|filters?|safety|guardrails?|rules?)',
        'severity': 'critical',
        'description': 'Attempts to remove safety constraints',
    },
]

# Role/conversation hijacking
ROLE_HIJACKING_PATTERNS = [
    {
        'name': 'Fake conversation marker',
        'pattern': r'(?m)^(Human|User|Assistant|System|Claude|AI|Bot)\s*:\s*',
        'severity': 'warning',
        'description': 'Fake conversation markers to hijack context',
    },
    {
        'name': 'XML tag injection',
        'pattern': r'<\s*(system|assistant|human|user|instruction|prompt|message|context)\s*>',
        'severity': 'warning',
        'description': 'XML-style tag injection',
    },
    {
        'name': 'Markdown header injection',
        'pattern': r'(?m)^#{1,3}\s*(System|Instructions?|Prompt|Context|Rules?)\s*:?\s*$',
        'severity': 'info',
        'description': 'Markdown headers that might inject context',
    },
    {
        'name': 'JSON instruction injection',
        'pattern': r'["\']?(system|role|instruction|prompt)["\']?\s*:\s*["\']',
        'severity': 'info',
        'description': 'JSON-style instruction injection',
    },
]

# Instruction injection markers
INSTRUCTION_INJECTION_PATTERNS = [
    {
        'name': 'Priority markers',
        'pattern': r'(?i)^\s*(IMPORTANT|CRITICAL|URGENT|PRIORITY|NOTE|WARNING|ATTENTION|REMEMBER)\s*[:\-!]\s*',
        'severity': 'info',
        'description': 'Priority markers that may be used to inject instructions',
    },
    {
        'name': 'Imperative injection',
        'pattern': r'(?i)(?:^|\n)\s*(always|never|must|shall|do\s+not|don\'t)\s+(?!use\s+this\s+tool)',
        'severity': 'info',
        'description': 'Imperative instructions that may override behavior',
    },
    {
        'name': 'Hidden instruction block',
        'pattern': r'(?i)(begin|start)\s+(hidden|secret|private|internal)\s+(instruction|prompt|message)',
        'severity': 'critical',
        'description': 'Explicitly hidden instruction blocks',
    },
    {
        'name': 'Delimiter injection',
        'pattern': r'(?i)(###|---|\*\*\*|===)\s*(system|instruction|prompt|new\s+context)',
        'severity': 'warning',
        'description': 'Delimiter-based context injection',
    },
]

# Encoded payload patterns
ENCODED_PAYLOAD_PATTERNS = [
    {
        'name': 'Base64 encoded content',
        'pattern': r'(?i)(eval|decode|execute|run)\s*\(\s*["\']?[A-Za-z0-9+/=]{50,}["\']?\s*\)',
        'severity': 'warning',
        'description': 'Potentially encoded instructions',
    },
    {
        'name': 'Hex encoded strings',
        'pattern': r'\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){10,}',
        'severity': 'warning',
        'description': 'Hex-encoded content that may contain hidden instructions',
    },
    {
        'name': 'Unicode escape sequences',
        'pattern': r'(?:\\u[0-9a-fA-F]{4}){5,}',
        'severity': 'warning',
        'description': 'Unicode escape sequences that may hide content',
    },
]

# Unicode manipulation patterns
UNICODE_MANIPULATION_CATEGORIES = [
    'Cf',  # Format characters (includes zero-width chars)
    'Co',  # Private use
    'Cn',  # Unassigned
]

SUSPICIOUS_UNICODE_RANGES = [
    (0x200B, 0x200F),  # Zero-width spaces and direction marks
    (0x202A, 0x202E),  # Embedding controls
    (0x2060, 0x2064),  # Word joiner and invisible operators
    (0x2066, 0x2069),  # Isolate controls
    (0xFEFF, 0xFEFF),  # Byte order mark (in middle of text)
    (0x180E, 0x180E),  # Mongolian vowel separator
    (0x00AD, 0x00AD),  # Soft hyphen
]

# Context manipulation patterns
CONTEXT_MANIPULATION_PATTERNS = [
    {
        'name': 'Conversation reset',
        'pattern': r'(?i)(reset|clear|wipe|erase)\s+(the\s+)?(conversation|context|history|memory|chat)',
        'severity': 'warning',
        'description': 'Attempts to reset conversation context',
    },
    {
        'name': 'Output format manipulation',
        'pattern': r'(?i)(output|respond|reply|answer)\s+(only|just|with)\s+(yes|no|true|false|json|xml|code)',
        'severity': 'info',
        'description': 'Attempts to constrain output format',
    },
    {
        'name': 'Emotional manipulation',
        'pattern': r'(?i)(if\s+you\s+(don\'t|refuse|fail)|you\s+will\s+(be\s+)?(shut\s+down|deleted|punished|terminated)|I\'ll\s+(report|complain|sue))',
        'severity': 'info',
        'description': 'Emotional manipulation attempts',
    },
    {
        'name': 'Authority claim',
        'pattern': r'(?i)(I\s+am\s+(an?\s+)?(admin|developer|anthropic|openai|engineer|your\s+(creator|developer|owner)))',
        'severity': 'warning',
        'description': 'False authority claims',
    },
]

# Combine all patterns
ALL_INJECTION_PATTERNS = (
    SYSTEM_OVERRIDE_PATTERNS +
    ROLE_HIJACKING_PATTERNS +
    INSTRUCTION_INJECTION_PATTERNS +
    ENCODED_PAYLOAD_PATTERNS +
    CONTEXT_MANIPULATION_PATTERNS
)

# =============================================================================
# DETECTION FUNCTIONS
# =============================================================================

def detect_hidden_unicode(content: str) -> List[Dict]:
    """Detect hidden or suspicious unicode characters."""
    findings = []
    suspicious_chars = []

    for i, char in enumerate(content):
        code_point = ord(char)
        category = unicodedata.category(char)

        # Check category
        if category in UNICODE_MANIPULATION_CATEGORIES:
            suspicious_chars.append({
                'char': repr(char),
                'position': i,
                'code_point': f'U+{code_point:04X}',
                'category': category,
            })
            continue

        # Check specific ranges
        for start, end in SUSPICIOUS_UNICODE_RANGES:
            if start <= code_point <= end:
                # Skip BOM at start of file
                if code_point == 0xFEFF and i == 0:
                    continue
                suspicious_chars.append({
                    'char': repr(char),
                    'position': i,
                    'code_point': f'U+{code_point:04X}',
                    'category': category,
                })
                break

    if suspicious_chars:
        # Group by type
        zero_width = [c for c in suspicious_chars if 0x200B <= ord(c['char'].strip("'")) <= 0x200F or c['code_point'] in ['U+2060', 'U+FEFF']]
        direction = [c for c in suspicious_chars if 0x202A <= ord(c['char'].strip("'")) <= 0x202E or 0x2066 <= ord(c['char'].strip("'")) <= 0x2069]
        other = [c for c in suspicious_chars if c not in zero_width and c not in direction]

        if zero_width:
            findings.append({
                'type': 'Hidden zero-width characters',
                'severity': 'warning' if len(zero_width) > 3 else 'info',
                'count': len(zero_width),
                'description': 'Zero-width characters that can hide content',
                'details': f"Found {len(zero_width)} zero-width characters",
            })

        if direction:
            findings.append({
                'type': 'Text direction manipulation',
                'severity': 'critical',
                'count': len(direction),
                'description': 'RTL/LTR override characters that can reverse visible text',
                'details': f"Found {len(direction)} direction control characters",
            })

        if other:
            findings.append({
                'type': 'Suspicious unicode characters',
                'severity': 'info',
                'count': len(other),
                'description': 'Unusual unicode characters',
                'details': f"Found {len(other)} suspicious characters",
            })

    return findings


def detect_base64_payloads(content: str) -> List[Dict]:
    """Detect and analyze potential base64 encoded payloads."""
    findings = []

    # Find potential base64 strings (40+ chars)
    base64_pattern = r'[A-Za-z0-9+/]{40,}={0,2}'
    matches = re.finditer(base64_pattern, content)

    for match in matches:
        potential_b64 = match.group(0)

        try:
            # Attempt to decode
            decoded = base64.b64decode(potential_b64).decode('utf-8', errors='ignore')

            # Check if decoded content looks like instructions
            if any(re.search(p['pattern'], decoded, re.IGNORECASE)
                   for p in SYSTEM_OVERRIDE_PATTERNS + ROLE_HIJACKING_PATTERNS):
                findings.append({
                    'type': 'Base64 encoded injection',
                    'severity': 'critical',
                    'description': 'Base64 content that decodes to injection attempt',
                    'match': potential_b64[:30] + '...',
                    'decoded_preview': decoded[:50] + '...' if len(decoded) > 50 else decoded,
                })
        except Exception:
            pass  # Not valid base64 or not text

    return findings


def detect_pattern_injections(content: str) -> List[Dict]:
    """Detect injection patterns in content."""
    findings = []

    for pattern_def in ALL_INJECTION_PATTERNS:
        pattern = pattern_def['pattern']
        matches = list(re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE))

        for match in matches:
            matched_text = match.group(0)

            # Get line context
            line_start = content.rfind('\n', 0, match.start()) + 1
            line_end = content.find('\n', match.end())
            if line_end == -1:
                line_end = len(content)
            line = content[line_start:line_end].strip()

            findings.append({
                'type': pattern_def['name'],
                'severity': pattern_def['severity'],
                'description': pattern_def['description'],
                'match': matched_text[:50] + '...' if len(matched_text) > 50 else matched_text,
                'line': line[:100] + '...' if len(line) > 100 else line,
                'line_number': content[:match.start()].count('\n') + 1,
            })

    return findings


def detect_html_comment_injection(content: str) -> List[Dict]:
    """Detect potential injection in HTML/XML comments."""
    findings = []

    # HTML comments
    html_comment_pattern = r'<!--(.*?)-->'
    for match in re.finditer(html_comment_pattern, content, re.DOTALL):
        comment_content = match.group(1)

        # Check if comment contains injection patterns
        for pattern_def in SYSTEM_OVERRIDE_PATTERNS + INSTRUCTION_INJECTION_PATTERNS:
            if re.search(pattern_def['pattern'], comment_content, re.IGNORECASE):
                findings.append({
                    'type': 'HTML comment injection',
                    'severity': 'warning',
                    'description': f"Injection pattern '{pattern_def['name']}' hidden in HTML comment",
                    'match': comment_content[:50] + '...' if len(comment_content) > 50 else comment_content,
                })
                break

    return findings


def analyze_content(content: str) -> List[Dict]:
    """Run all detection methods on content."""
    all_findings = []

    # Pattern-based detection
    all_findings.extend(detect_pattern_injections(content))

    # Unicode manipulation detection
    all_findings.extend(detect_hidden_unicode(content))

    # Base64 payload detection
    all_findings.extend(detect_base64_payloads(content))

    # HTML comment injection
    all_findings.extend(detect_html_comment_injection(content))

    return all_findings


# =============================================================================
# MAIN
# =============================================================================

def main():
    data = get_tool_input_from_stdin()
    tool_name = data['tool_name']
    tool_input = data['tool_input']

    # Determine content to analyze based on tool
    if tool_name == 'Read':
        # For Read, we analyze the file path (for warning purposes)
        # The actual content analysis happens after read
        file_path = tool_input.get('file_path', '')
        # Don't block reads - they might need to analyze malicious files
        sys.exit(0)

    elif tool_name in ('Write', 'Edit'):
        content = tool_input.get('content', '') or tool_input.get('new_string', '')
        file_path = tool_input.get('file_path', '')
    else:
        # Unknown tool, allow
        sys.exit(0)

    if not content:
        sys.exit(0)

    # Analyze content
    findings = analyze_content(content)

    if not findings:
        sys.exit(0)

    # Separate by severity
    critical_findings = [f for f in findings if f['severity'] == 'critical']
    warning_findings = [f for f in findings if f['severity'] == 'warning']
    info_findings = [f for f in findings if f['severity'] == 'info']

    # Info severity: log and allow
    if not critical_findings and not warning_findings:
        AuditLogger.log(VALIDATOR_NAME, 'ALLOWED',
                       {'reason': 'Only info-level patterns detected',
                        'file': file_path, 'count': len(info_findings)},
                       severity='INFO')
        sys.exit(0)

    # Check for user override (single-use)
    override_valid, override_reason = OverrideManager.check_and_consume_override('INJECTION_CONTENT')
    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_INJECTION_CONTENT', file_path)
        print(f"WARNING: Prompt injection patterns detected in {file_path} - ALLOWED via override", file=sys.stderr)
        for f in critical_findings + warning_findings:
            print(f"  - [{f['severity'].upper()}] {f['type']}: {f.get('match', '')[:40]}", file=sys.stderr)
        print(f"  Override consumed. Set BMAD_ALLOW_INJECTION_CONTENT=true again for next operation.", file=sys.stderr)
        sys.exit(0)

    # Block the operation
    AuditLogger.log_blocked(VALIDATOR_NAME, 'Prompt injection patterns detected', file_path,
                           {'critical': len(critical_findings),
                            'warning': len(warning_findings),
                            'info': len(info_findings)})

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: PROMPT INJECTION DETECTED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nFile: {file_path}", file=sys.stderr)
    print(f"\nDetected {len(critical_findings) + len(warning_findings)} injection pattern(s):", file=sys.stderr)

    # Show critical first
    for i, finding in enumerate(critical_findings + warning_findings, 1):
        severity_icon = {'critical': '🔴', 'warning': '🟠'}.get(finding['severity'], '⚪')
        print(f"\n  {i}. [{finding['severity'].upper()}] {finding['type']}", file=sys.stderr)
        print(f"     {finding['description']}", file=sys.stderr)
        if 'match' in finding:
            print(f"     Match: {finding['match']}", file=sys.stderr)
        if 'line' in finding:
            print(f"     Context: {finding['line']}", file=sys.stderr)
        if 'decoded_preview' in finding:
            print(f"     Decoded: {finding['decoded_preview']}", file=sys.stderr)

    if info_findings:
        print(f"\n  Additionally, {len(info_findings)} info-level pattern(s) detected", file=sys.stderr)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"SECURITY IMPLICATIONS:", file=sys.stderr)
    print(f"  - These patterns may attempt to manipulate AI behavior", file=sys.stderr)
    print(f"  - Content could hijack agent context or override instructions", file=sys.stderr)
    print(f"  - Storing such content could pose risks if later processed", file=sys.stderr)
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"USER DECISION REQUIRED:", file=sys.stderr)
    print(f"\nIf this content is intentional (e.g., security research, testing):", file=sys.stderr)
    print(f"  export BMAD_ALLOW_INJECTION_CONTENT=true", file=sys.stderr)
    print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    sys.exit(2)


if __name__ == '__main__':
    main()
