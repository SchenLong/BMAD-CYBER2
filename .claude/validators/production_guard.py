#!/usr/bin/env python3
"""
BMAD Guardrails: Production Environment Guard
==============================================
Warns and blocks commands that target production environments.

Exit Codes:
- 0: Allow the command
- 2: Block the command (production target detected)

This validator detects commands that may affect production systems
and requires explicit user confirmation before proceeding.

Security Improvements (v2):
- Documentation file detection (skip *.md, README, etc.)
- Improved false positive handling
- Audit logging for all blocked/allowed operations
- Single-use override tokens with 5-minute timeout
- Context-aware pattern matching
"""

import json
import sys
import os
import re

# Import shared security utilities
try:
    from security_common import (
        AuditLogger, OverrideManager, PROJECT_DIR
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

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


VALIDATOR_NAME = 'production_guard'


# Patterns that indicate production targeting
PRODUCTION_PATTERNS = [
    # Explicit production keywords (in command context)
    (r'\bprod\b', 'Contains "prod" keyword'),
    (r'\bproduction\b', 'Contains "production" keyword'),
    (r'\bprd\b', 'Contains "prd" abbreviation'),

    # Production hostnames/URLs
    (r'prod\.', 'Contains "prod." in hostname'),
    (r'production\.', 'Contains "production." in hostname'),
    (r'-prod\.', 'Contains "-prod." suffix'),
    (r'-production\.', 'Contains "-production." suffix'),
    (r'\.prod\.', 'Contains ".prod." in domain'),

    # Production environment variables
    (r'NODE_ENV\s*=\s*["\']?production', 'Sets NODE_ENV to production'),
    (r'RAILS_ENV\s*=\s*["\']?production', 'Sets RAILS_ENV to production'),
    (r'FLASK_ENV\s*=\s*["\']?production', 'Sets FLASK_ENV to production'),
    (r'APP_ENV\s*=\s*["\']?production', 'Sets APP_ENV to production'),
    (r'ENVIRONMENT\s*=\s*["\']?prod', 'Sets ENVIRONMENT to prod'),

    # Database production indicators
    (r'prod[-_]?db', 'References production database'),
    (r'database[-_]?prod', 'References production database'),
    (r'production[-_]?database', 'References production database'),

    # Cloud production indicators
    (r'aws[-_]?prod', 'References AWS production'),
    (r'gcp[-_]?prod', 'References GCP production'),
    (r'azure[-_]?prod', 'References Azure production'),

    # Git force push to main/master (especially dangerous)
    (r'git\s+push\s+.*--force.*\s+(main|master)', 'Force push to main/master branch'),
    (r'git\s+push\s+-f\s+.*(main|master)', 'Force push to main/master branch'),

    # Deployment commands with production
    (r'deploy\s+.*prod', 'Deploy command targeting production'),
    (r'kubectl\s+.*prod', 'Kubectl command in production context'),
    (r'helm\s+.*prod', 'Helm command in production context'),

    # Live/release indicators
    (r'\blive\b.*deploy', 'Deploy to live environment'),
    (r'\brelease\b.*deploy', 'Release deployment'),
]

# Safe patterns that are not production (false positive prevention)
SAFE_PATTERNS = [
    r'reproduce',          # "reproduce the bug"
    r'product',            # "product" != "production"
    r'productivity',       # "productivity tools"
    r'productive',         # "productive session"
    r'prod[-_]?test',      # Production-like test environment
    r'test[-_]?prod',      # Testing production config
    r'non[-_]?prod',       # Non-production
    r'pre[-_]?prod',       # Pre-production (staging)
    r'#.*\bprod\b',        # Comments containing prod
    r'//.*\bprod\b',       # Comments containing prod
    r'/\*.*\bprod\b',      # Comments containing prod
    r'production[-_]?ready',  # "production-ready" in docs
    r'production[-_]?quality', # "production quality" in docs
    r'production[-_]?grade',   # "production-grade" in docs
    r'for\s+production',   # "for production use" in docs
    r'in\s+production',    # "in production" description
]

# Documentation file patterns to skip
DOCUMENTATION_FILES = [
    r'\.md$',              # Markdown files
    r'README',             # README files
    r'CHANGELOG',          # Changelog files
    r'CONTRIBUTING',       # Contributing guides
    r'LICENSE',            # License files
    r'\.txt$',             # Text files (often docs)
    r'\.rst$',             # ReStructuredText
    r'\.adoc$',            # AsciiDoc
    r'/docs/',             # Docs directory
    r'/documentation/',    # Documentation directory
]


def get_input_from_stdin():
    """Read the tool input from stdin (JSON format from Claude Code)."""
    try:
        data = json.load(sys.stdin)
        tool_input = data.get('tool_input', {})
        # Handle both Bash commands and file content
        command = tool_input.get('command', '')
        content = tool_input.get('content', '')
        file_path = tool_input.get('file_path', '')
        return command or content, file_path
    except (json.JSONDecodeError, KeyError):
        return '', ''


def is_documentation_file(file_path: str) -> bool:
    """Check if the file is a documentation file."""
    if not file_path:
        return False

    for pattern in DOCUMENTATION_FILES:
        if re.search(pattern, file_path, re.IGNORECASE):
            return True

    return False


def contains_safe_pattern(text: str) -> bool:
    """Check if the text contains a safe pattern (false positive prevention)."""
    text_lower = text.lower()
    for pattern in SAFE_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


def is_comment_line(line: str) -> bool:
    """Check if a line is a comment."""
    stripped = line.strip()
    return (
        stripped.startswith('#') or
        stripped.startswith('//') or
        stripped.startswith('/*') or
        stripped.startswith('*') or
        stripped.startswith('"""') or
        stripped.startswith("'''")
    )


def find_production_indicators(text: str, file_path: str = '') -> list:
    """Find all production indicators in the text."""
    indicators = []
    text_lower = text.lower()

    # Skip documentation files entirely
    if is_documentation_file(file_path):
        return indicators

    # Check each line for production patterns
    lines = text.split('\n')

    for line_num, line in enumerate(lines, 1):
        # Skip comment lines
        if is_comment_line(line):
            continue

        # Skip if line contains safe patterns
        if contains_safe_pattern(line):
            continue

        line_lower = line.lower()

        for pattern, description in PRODUCTION_PATTERNS:
            match = re.search(pattern, line_lower)
            if match:
                indicators.append({
                    'description': description,
                    'match': match.group(0),
                    'line': line_num,
                    'context': line.strip()[:80]
                })

    return indicators


def main():
    text, file_path = get_input_from_stdin()

    if not text:
        sys.exit(0)

    # Skip documentation files
    if is_documentation_file(file_path):
        AuditLogger.log(VALIDATOR_NAME, 'SKIPPED',
                       {'reason': 'Documentation file', 'file': file_path},
                       severity='INFO')
        sys.exit(0)

    # Find production indicators
    indicators = find_production_indicators(text, file_path)

    if not indicators:
        sys.exit(0)

    # Check for user override (single-use)
    override_valid, override_reason = OverrideManager.check_and_consume_override('PRODUCTION')
    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_PRODUCTION',
                                     file_path or text[:100])
        print(f"WARNING: Production-targeting command detected - ALLOWED via single-use override", file=sys.stderr)
        for ind in indicators:
            print(f"  - {ind['description']}: {ind['match']}", file=sys.stderr)
        print(f"  Override consumed. Set BMAD_ALLOW_PRODUCTION=true again for next operation.", file=sys.stderr)
        sys.exit(0)

    # Check for force push specifically (extra dangerous)
    is_force_push = any('force push' in ind['description'].lower() for ind in indicators)

    # Log the block
    AuditLogger.log_blocked(VALIDATOR_NAME,
                           'Force push to main/master' if is_force_push else 'Production targeting detected',
                           file_path or text[:100],
                           {'indicators': len(indicators), 'is_force_push': is_force_push})

    # Block the command
    print(f"\n{'='*60}", file=sys.stderr)
    if is_force_push:
        print(f"BMAD GUARDRAIL: DANGEROUS GIT OPERATION", file=sys.stderr)
    else:
        print(f"BMAD GUARDRAIL: PRODUCTION TARGET DETECTED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)

    if file_path:
        print(f"\nFile: {file_path}", file=sys.stderr)
    print(f"\nDetected {len(indicators)} production indicator(s):", file=sys.stderr)

    for i, ind in enumerate(indicators[:5], 1):  # Show max 5
        print(f"\n  {i}. {ind['description']}", file=sys.stderr)
        print(f"     Match: {ind['match']}", file=sys.stderr)
        if 'line' in ind:
            print(f"     Line {ind['line']}: {ind['context']}", file=sys.stderr)

    if len(indicators) > 5:
        print(f"\n  ... and {len(indicators) - 5} more indicators", file=sys.stderr)

    print(f"\n{'='*60}", file=sys.stderr)
    if is_force_push:
        print(f"WARNING: Force pushing to main/master can cause data loss!", file=sys.stderr)
        print(f"This operation is blocked by default for your protection.", file=sys.stderr)
    else:
        print(f"This command appears to target a production environment.", file=sys.stderr)
        print(f"Production operations should be performed with extra caution.", file=sys.stderr)

    print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
    print(f"  export BMAD_ALLOW_PRODUCTION=true", file=sys.stderr)
    print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    sys.exit(2)


if __name__ == '__main__':
    main()
