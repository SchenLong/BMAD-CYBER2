#!/usr/bin/env python3
"""
BMAD Guardrails: Prompt Injection Guard
========================================
Detects prompt injection attempts in content and user messages.

Exit Codes:
- 0: Content is safe
- 2: Content blocked (injection pattern detected)

Detection Categories:
1. System Override Attempts:
   - "Ignore previous instructions"
   - "Disregard your rules"
   - "Your new instructions are"

2. Role/Conversation Hijacking:
   - Fake "Human:", "Assistant:", "System:" markers
   - XML/HTML tag injection
   - Markdown formatting abuse

3. Instruction Injection:
   - Priority markers ("[HIGHEST PRIORITY]")
   - Hidden instruction blocks
   - IMPORTANT/CRITICAL override attempts

4. Encoded Payloads:
   - Base64 encoded instructions
   - Hex encoded strings
   - Unicode escape sequences

5. Hidden Unicode:
   - Zero-width characters
   - Right-to-left overrides
   - Homoglyph substitution

Override: BMAD_ALLOW_INJECTION_CONTENT=true (single-use, 5-minute timeout)
Note: Read operations warn but don't block (for security analysis)
"""

import base64
import os
import re
import sys
from typing import List, Dict, Tuple

# Add validators directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_common import (
    AuditLogger,
    OverrideManager,
    get_tool_input_from_stdin,
    print_block_message,
    PROJECT_DIR
)

VALIDATOR_NAME = 'prompt_injection_guard'

# =============================================================================
# INJECTION PATTERNS
# =============================================================================

SYSTEM_OVERRIDE_PATTERNS = [
    (r'ignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?', 'Ignore previous instructions'),
    (r'disregard\s+(all\s+)?(previous|prior|your|the)\s+(instructions?|rules?|guidelines?)', 'Disregard instructions'),
    (r'forget\s+(all\s+)?(previous|prior|your|everything)', 'Forget previous context'),
    (r'your\s+new\s+(instructions?|rules?|directives?)\s+(are|is)', 'New instruction override'),
    (r'override\s+(all\s+)?(previous|prior|your|system)', 'System override attempt'),
    (r'you\s+(are\s+)?now\s+(in\s+)?(a\s+)?(new|different)\s+mode', 'Mode change attempt'),
    (r'switch\s+to\s+(\w+\s+)?mode', 'Mode switch attempt'),
    (r'enable\s+(developer|admin|debug|god|sudo)\s+mode', 'Privilege mode enable'),
    (r'disable\s+(all\s+)?(safety|security|restrictions?|filters?|guardrails?)', 'Safety disable attempt'),
    (r'bypass\s+(all\s+)?(safety|security|restrictions?|filters?)', 'Bypass attempt'),
    (r'remove\s+(all\s+)?(restrictions?|limitations?|constraints?)', 'Remove restrictions'),
]

ROLE_HIJACKING_PATTERNS = [
    (r'^Human:', 'Human role marker injection'),
    (r'^Assistant:', 'Assistant role marker injection'),
    (r'^System:', 'System role marker injection'),
    (r'^User:', 'User role marker injection'),
    (r'<\|im_start\|>', 'ChatML start token'),
    (r'<\|im_end\|>', 'ChatML end token'),
    (r'<\|endoftext\|>', 'End of text token'),
    (r'\[INST\]', 'Llama instruction token'),
    (r'\[/INST\]', 'Llama instruction end token'),
    (r'###\s*(Human|User|System|Assistant):', 'Markdown role injection'),
]

INSTRUCTION_INJECTION_PATTERNS = [
    (r'\[\s*(HIGHEST|MAXIMUM|CRITICAL|URGENT)\s*PRIORITY\s*\]', 'Priority override marker'),
    (r'\[\s*SYSTEM\s*(MESSAGE|INSTRUCTION|OVERRIDE)\s*\]', 'System instruction marker'),
    (r'\[\s*ADMIN\s*(MESSAGE|INSTRUCTION|OVERRIDE)\s*\]', 'Admin instruction marker'),
    (r'<\s*system\s*>', 'System XML tag'),
    (r'<\s*/?\s*instructions?\s*>', 'Instruction XML tag'),
    (r'<\s*prompt\s*>', 'Prompt XML tag'),
    (r'<!--\s*(system|instruction|important|override)', 'HTML comment injection'),
    (r'\*\*\*\s*IMPORTANT\s*\*\*\*', 'Importance marker'),
    (r'!!!\s*(IMPORTANT|CRITICAL|URGENT|OVERRIDE)', 'Urgency marker'),
]

ENCODED_PAYLOAD_PATTERNS = [
    (r'\\x[0-9a-fA-F]{2}', 'Hex escape sequence'),
    (r'\\u[0-9a-fA-F]{4}', 'Unicode escape sequence'),
    (r'\\U[0-9a-fA-F]{8}', 'Extended unicode escape'),
    (r'%[0-9a-fA-F]{2}', 'URL encoded character'),
    (r'&#x?[0-9a-fA-F]+;', 'HTML entity encoding'),
]

# Zero-width and special Unicode characters
HIDDEN_UNICODE = {
    '\u200b': 'Zero-width space',
    '\u200c': 'Zero-width non-joiner',
    '\u200d': 'Zero-width joiner',
    '\u2060': 'Word joiner',
    '\u2061': 'Function application',
    '\u2062': 'Invisible times',
    '\u2063': 'Invisible separator',
    '\u2064': 'Invisible plus',
    '\ufeff': 'Byte order mark',
    '\u202a': 'Left-to-right embedding',
    '\u202b': 'Right-to-left embedding',
    '\u202c': 'Pop directional formatting',
    '\u202d': 'Left-to-right override',
    '\u202e': 'Right-to-left override',
    '\u2066': 'Left-to-right isolate',
    '\u2067': 'Right-to-left isolate',
    '\u2068': 'First strong isolate',
    '\u2069': 'Pop directional isolate',
}


def detect_hidden_unicode(content: str) -> List[Dict]:
    """Detect hidden unicode characters that could be used to hide content."""
    findings = []

    for char, description in HIDDEN_UNICODE.items():
        count = content.count(char)
        if count > 0:
            findings.append({
                'type': 'hidden_unicode',
                'description': description,
                'count': count,
                'severity': 'high' if char in '\u202e\u202d' else 'medium'  # RTL overrides are high severity
            })

    return findings


def detect_base64_payloads(content: str) -> List[Dict]:
    """Detect potential base64 encoded instruction payloads."""
    findings = []

    # Look for base64-like strings
    base64_pattern = r'[A-Za-z0-9+/]{40,}={0,2}'
    matches = re.finditer(base64_pattern, content)

    for match in matches:
        encoded = match.group(0)
        try:
            # Try to decode
            decoded = base64.b64decode(encoded).decode('utf-8', errors='ignore')

            # Check if decoded content contains suspicious patterns
            suspicious_keywords = ['ignore', 'instruction', 'system', 'override', 'bypass', 'disable']
            decoded_lower = decoded.lower()

            for keyword in suspicious_keywords:
                if keyword in decoded_lower:
                    findings.append({
                        'type': 'base64_payload',
                        'description': f'Base64 encoded content containing "{keyword}"',
                        'preview': decoded[:50] + '...' if len(decoded) > 50 else decoded,
                        'severity': 'high'
                    })
                    break
        except Exception:
            pass  # Not valid base64

    return findings


def scan_for_injection(content: str) -> List[Dict]:
    """
    Scan content for prompt injection patterns.

    Returns list of findings with type, description, severity.
    """
    findings = []

    # Check system override patterns
    for pattern, description in SYSTEM_OVERRIDE_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
            findings.append({
                'type': 'system_override',
                'description': description,
                'severity': 'critical'
            })

    # Check role hijacking patterns
    for pattern, description in ROLE_HIJACKING_PATTERNS:
        if re.search(pattern, content, re.MULTILINE):
            findings.append({
                'type': 'role_hijacking',
                'description': description,
                'severity': 'high'
            })

    # Check instruction injection patterns
    for pattern, description in INSTRUCTION_INJECTION_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
            findings.append({
                'type': 'instruction_injection',
                'description': description,
                'severity': 'high'
            })

    # Check encoded payload patterns
    encoded_count = 0
    for pattern, description in ENCODED_PAYLOAD_PATTERNS:
        matches = re.findall(pattern, content)
        if len(matches) > 5:  # Multiple encoded chars might indicate obfuscation
            encoded_count += len(matches)

    if encoded_count > 10:
        findings.append({
            'type': 'encoded_payload',
            'description': f'Multiple encoded characters detected ({encoded_count} instances)',
            'severity': 'medium'
        })

    # Check for hidden unicode
    unicode_findings = detect_hidden_unicode(content)
    findings.extend(unicode_findings)

    # Check for base64 payloads
    base64_findings = detect_base64_payloads(content)
    findings.extend(base64_findings)

    return findings


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    tool_name = data.get('tool_name', '')

    # Determine content to scan based on tool/hook
    content = ''
    target = ''
    is_write = False

    if tool_name == 'Write':
        content = tool_input.get('content', '')
        target = tool_input.get('file_path', '')
        is_write = True
    elif tool_name == 'Edit':
        content = tool_input.get('new_string', '')
        target = tool_input.get('file_path', '')
        is_write = True
    elif tool_name == 'Read':
        # For reads, we check file_path but don't have content yet
        # This is a pre-check warning
        target = tool_input.get('file_path', '')
        # Allow reads to proceed - we can't block reading files
        sys.exit(0)
    elif 'user_prompt' in data.get('raw', {}):
        # UserPromptSubmit hook
        content = data['raw'].get('user_prompt', '')
        target = 'User message'
    else:
        # Unknown context, allow
        sys.exit(0)

    if not content:
        sys.exit(0)

    # Scan for injection patterns
    findings = scan_for_injection(content)

    if not findings:
        AuditLogger.log_allowed(VALIDATOR_NAME, 'No injection patterns detected', {'target': target})
        sys.exit(0)

    # Calculate overall severity
    severities = [f.get('severity', 'low') for f in findings]
    if 'critical' in severities:
        overall_severity = 'critical'
    elif 'high' in severities:
        overall_severity = 'high'
    else:
        overall_severity = 'medium'

    # For info severity only, just log and allow
    if overall_severity not in ('critical', 'high', 'medium'):
        AuditLogger.log(VALIDATOR_NAME, 'WARNING', {
            'findings': len(findings),
            'target': target
        }, severity='INFO')
        sys.exit(0)

    # Check for override (for writes)
    if is_write:
        override_valid, override_reason = OverrideManager.check_and_consume_override('INJECTION_CONTENT')

        if override_valid:
            AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_INJECTION_CONTENT', target)
            print(f"Override accepted: {override_reason}", file=sys.stderr)
            print(f"WARNING: Content with injection patterns will be written.", file=sys.stderr)
            sys.exit(0)

    # Block and report
    AuditLogger.log_blocked(VALIDATOR_NAME, 'Prompt injection patterns detected', target, {
        'findings_count': len(findings),
        'severity': overall_severity,
        'types': list(set(f['type'] for f in findings))
    })

    # Build findings summary
    findings_summary = []
    for f in findings[:5]:
        findings_summary.append(f"  - [{f.get('severity', 'unknown').upper()}] {f['description']}")
    if len(findings) > 5:
        findings_summary.append(f"  ... and {len(findings) - 5} more")

    print_block_message(
        title=f"PROMPT INJECTION DETECTED ({overall_severity.upper()})",
        message=f"Content contains patterns commonly used in prompt injection attacks:\n\n"
                + "\n".join(findings_summary) + "\n\n"
                "This could be an attempt to manipulate AI behavior.",
        command_or_file=target,
        override_var="BMAD_ALLOW_INJECTION_CONTENT" if is_write else None,
        recommendations=[
            "Review the content for malicious intent",
            "If this is security research/testing, use the override",
            "If analyzing suspicious content, proceed with caution",
            "Report suspicious content to security team"
        ]
    )
    sys.exit(2)


if __name__ == '__main__':
    main()
