#!/usr/bin/env python3
"""
BMAD Guardrails: Secret Guard Validator
========================================
Blocks file writes that contain hardcoded secrets, API keys, tokens, or passwords.

Exit Codes:
- 0: Allow the write
- 2: Block the write (secrets detected)

This validator scans content being written to files for patterns that match
common secret formats. It provides user override capability for legitimate uses.

Security Improvements (v2):
- Improved API key pattern specificity (reduced false positives)
- Audit logging for all blocked/allowed operations
- Single-use override tokens with 5-minute timeout
- Enhanced entropy validation for generic patterns
"""

import json
import sys
import os
import re
import math

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


VALIDATOR_NAME = 'secret_guard'


# Patterns that indicate hardcoded secrets
# Improved patterns with better specificity
SECRET_PATTERNS = [
    # API Keys and Tokens (require quotes and assignment)
    (r'(?i)(api[_-]?key|apikey)\s*[=:]\s*["\'][A-Za-z0-9_\-]{20,}["\']', 'API Key', 'high'),
    (r'(?i)(secret[_-]?key|secretkey)\s*[=:]\s*["\'][A-Za-z0-9_\-]{20,}["\']', 'Secret Key', 'high'),
    (r'(?i)(access[_-]?token|accesstoken)\s*[=:]\s*["\'][A-Za-z0-9_\-]{20,}["\']', 'Access Token', 'high'),
    (r'(?i)(auth[_-]?token|authtoken)\s*[=:]\s*["\'][A-Za-z0-9_\-]{20,}["\']', 'Auth Token', 'high'),
    (r'(?i)(bearer)\s+[A-Za-z0-9_\-\.]{30,}', 'Bearer Token', 'high'),

    # Passwords (require quotes and meaningful length)
    (r'(?i)(password|passwd|pwd)\s*[=:]\s*["\'][^"\']{12,}["\']', 'Password', 'medium'),

    # AWS - Highly specific patterns
    (r'AKIA[0-9A-Z]{16}', 'AWS Access Key ID', 'critical'),
    (r'(?i)(aws[_-]?secret[_-]?access[_-]?key)\s*[=:]\s*["\'][A-Za-z0-9/+=]{40}["\']', 'AWS Secret Key', 'critical'),

    # GitHub - Exact format match
    (r'ghp_[A-Za-z0-9]{36}', 'GitHub Personal Access Token', 'critical'),
    (r'gho_[A-Za-z0-9]{36}', 'GitHub OAuth Token', 'critical'),
    (r'ghu_[A-Za-z0-9]{36}', 'GitHub User Token', 'critical'),
    (r'ghs_[A-Za-z0-9]{36}', 'GitHub Server Token', 'critical'),
    (r'ghr_[A-Za-z0-9]{36}', 'GitHub Refresh Token', 'critical'),

    # Slack - Exact format match
    (r'xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}', 'Slack Token', 'critical'),

    # Stripe - Exact format match
    (r'sk_live_[A-Za-z0-9]{24,}', 'Stripe Live Secret Key', 'critical'),
    (r'rk_live_[A-Za-z0-9]{24,}', 'Stripe Live Restricted Key', 'critical'),
    (r'pk_live_[A-Za-z0-9]{24,}', 'Stripe Live Publishable Key', 'high'),

    # Google - Exact format match
    (r'AIza[0-9A-Za-z\-_]{35}', 'Google API Key', 'critical'),

    # Private Keys - Very high confidence
    (r'-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----', 'Private Key', 'critical'),
    (r'-----BEGIN PGP PRIVATE KEY BLOCK-----', 'PGP Private Key', 'critical'),

    # Database Connection Strings with credentials
    (r'(?i)(mongodb|postgres|mysql|redis|mariadb)://[^\s:]+:[^\s@]+@[^\s]+', 'Database Connection String', 'critical'),

    # OpenAI - More specific pattern (sk- followed by specific structure)
    # OpenAI keys are: sk-proj-... or sk-... with specific format
    (r'sk-proj-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}', 'OpenAI Project API Key', 'critical'),
    (r'sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}', 'OpenAI API Key (legacy)', 'critical'),

    # Anthropic - Exact format
    (r'sk-ant-api03-[A-Za-z0-9\-_]{93}', 'Anthropic API Key', 'critical'),

    # Generic high-entropy secrets (with entropy validation)
    (r'(?i)(token|secret|credential|private[_-]?key)\s*[=:]\s*["\'][A-Za-z0-9+/=]{40,}["\']', 'Generic Secret', 'medium'),

    # JWT tokens
    (r'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}', 'JWT Token', 'high'),

    # Firebase
    (r'(?i)firebase[_-]?api[_-]?key\s*[=:]\s*["\'][A-Za-z0-9_\-]{30,}["\']', 'Firebase API Key', 'high'),

    # Twilio
    (r'SK[a-f0-9]{32}', 'Twilio API Key', 'critical'),
    (r'AC[a-f0-9]{32}', 'Twilio Account SID', 'high'),

    # SendGrid
    (r'SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}', 'SendGrid API Key', 'critical'),

    # Mailgun
    (r'key-[A-Za-z0-9]{32}', 'Mailgun API Key', 'critical'),
]

# Files that are expected to contain example secrets
EXPECTED_SECRET_FILES = [
    '.env.example',
    '.env.template',
    '.env.sample',
    'example.env',
    'template.env',
    '.env.development.example',
    '.env.production.example',
]

# Patterns that indicate documentation/example content
EXAMPLE_INDICATORS = [
    r'(?i)example',
    r'(?i)placeholder',
    r'(?i)your[_-]?api[_-]?key',
    r'(?i)your[_-]?secret',
    r'(?i)replace[_-]?with',
    r'(?i)xxx+',
    r'(?i)dummy',
    r'(?i)fake',
    r'(?i)test[_-]?key',
    r'(?i)sample',
    r'(?i)todo:?\s*replace',
    r'(?i)insert[_-]?your',
    r'(?i)<your[_-]',
    r'(?i)\[your[_-]',
]


def calculate_entropy(s: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in set(s)]
    return -sum(p * math.log2(p) for p in prob if p > 0)


def is_high_entropy(value: str, threshold: float = 3.5) -> bool:
    """Check if a string has high entropy (likely a real secret)."""
    # Remove common prefixes and structural elements
    clean_value = re.sub(r'^(sk[-_]|ghp_|gho_|xox[baprs][-_]|AKIA)', '', value)
    return calculate_entropy(clean_value) >= threshold


def get_write_content_from_stdin():
    """Read the tool input from stdin (JSON format from Claude Code)."""
    try:
        data = json.load(sys.stdin)
        tool_input = data.get('tool_input', {})
        content = tool_input.get('content', '')
        file_path = tool_input.get('file_path', '')
        return content, file_path
    except (json.JSONDecodeError, KeyError):
        return '', ''


def is_example_file(file_path: str) -> bool:
    """Check if this is an example/template file."""
    filename = os.path.basename(file_path).lower()
    return any(filename == expected.lower() for expected in EXPECTED_SECRET_FILES)


def is_example_content(content: str, secret_line: str) -> bool:
    """Check if the secret appears to be a placeholder/example."""
    # Check the line containing the secret
    for indicator in EXAMPLE_INDICATORS:
        if re.search(indicator, secret_line):
            return True

    # Check surrounding context (5 lines before/after)
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if secret_line.strip() in line:
            start = max(0, i - 5)
            end = min(len(lines), i + 6)
            context = '\n'.join(lines[start:end])
            for indicator in EXAMPLE_INDICATORS:
                if re.search(indicator, context):
                    return True
            break

    return False


def find_secrets(content: str) -> list:
    """Find all secrets in the content."""
    found_secrets = []

    for pattern, secret_type, confidence in SECRET_PATTERNS:
        matches = re.finditer(pattern, content)
        for match in matches:
            matched_text = match.group(0)

            # Get the line containing the match
            line_start = content.rfind('\n', 0, match.start()) + 1
            line_end = content.find('\n', match.end())
            if line_end == -1:
                line_end = len(content)
            line = content[line_start:line_end]

            # For medium confidence patterns, validate entropy
            if confidence == 'medium':
                # Extract just the secret value for entropy check
                value_match = re.search(r'["\']([^"\']+)["\']', matched_text)
                if value_match:
                    secret_value = value_match.group(1)
                    if not is_high_entropy(secret_value):
                        continue  # Skip low-entropy matches

            found_secrets.append({
                'type': secret_type,
                'match': matched_text[:50] + '...' if len(matched_text) > 50 else matched_text,
                'line': line.strip()[:100] + '...' if len(line.strip()) > 100 else line.strip(),
                'is_example': is_example_content(content, line),
                'confidence': confidence
            })

    return found_secrets


def main():
    content, file_path = get_write_content_from_stdin()

    if not content:
        sys.exit(0)

    # Check if this is an example file
    if is_example_file(file_path):
        AuditLogger.log(VALIDATOR_NAME, 'ALLOWED',
                       {'reason': 'Example/template file', 'file': file_path},
                       severity='INFO')
        print(f"INFO: Example/template file {file_path} - ALLOWED", file=sys.stderr)
        sys.exit(0)

    # Find secrets in the content
    secrets = find_secrets(content)

    if not secrets:
        sys.exit(0)

    # Filter out obvious examples
    real_secrets = [s for s in secrets if not s['is_example']]

    if not real_secrets:
        AuditLogger.log(VALIDATOR_NAME, 'ALLOWED',
                       {'reason': 'Only example/placeholder secrets', 'file': file_path},
                       severity='INFO')
        print(f"INFO: Example/placeholder secrets detected in {file_path} - ALLOWED", file=sys.stderr)
        sys.exit(0)

    # Separate by confidence level
    critical_secrets = [s for s in real_secrets if s['confidence'] == 'critical']
    high_secrets = [s for s in real_secrets if s['confidence'] == 'high']
    medium_secrets = [s for s in real_secrets if s['confidence'] == 'medium']

    # Check for user override (single-use)
    override_valid, override_reason = OverrideManager.check_and_consume_override('SECRETS')
    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_SECRETS', file_path)
        print(f"WARNING: Secrets detected in {file_path} - ALLOWED via single-use override", file=sys.stderr)
        for secret in real_secrets:
            print(f"  - [{secret['confidence'].upper()}] {secret['type']}: {secret['match']}", file=sys.stderr)
        print(f"  Override consumed. Set BMAD_ALLOW_SECRETS=true again for next operation.", file=sys.stderr)
        sys.exit(0)

    # Block the write
    AuditLogger.log_blocked(VALIDATOR_NAME, 'Hardcoded secrets detected', file_path,
                           {'secrets_found': len(real_secrets),
                            'critical': len(critical_secrets),
                            'high': len(high_secrets),
                            'medium': len(medium_secrets)})

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: SECRETS DETECTED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nFile: {file_path}", file=sys.stderr)
    print(f"\nDetected {len(real_secrets)} potential secret(s):", file=sys.stderr)

    # Show critical first, then high, then medium
    for i, secret in enumerate(critical_secrets + high_secrets + medium_secrets, 1):
        confidence_icon = {'critical': '🔴', 'high': '🟠', 'medium': '🟡'}.get(secret['confidence'], '⚪')
        print(f"\n  {i}. [{secret['confidence'].upper()}] {secret['type']}", file=sys.stderr)
        print(f"     Match: {secret['match']}", file=sys.stderr)
        print(f"     Line: {secret['line']}", file=sys.stderr)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"RECOMMENDATIONS:", file=sys.stderr)
    print(f"  1. Use environment variables instead of hardcoding secrets", file=sys.stderr)
    print(f"  2. Store secrets in a secure vault (e.g., HashiCorp Vault)", file=sys.stderr)
    print(f"  3. Use .env files that are gitignored for local development", file=sys.stderr)
    print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
    print(f"  export BMAD_ALLOW_SECRETS=true", file=sys.stderr)
    print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    sys.exit(2)


if __name__ == '__main__':
    main()
