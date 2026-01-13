#!/usr/bin/env python3
"""
BMAD Guardrails: Secret/Credential Guard
=========================================
Prevents hardcoding of secrets, API keys, and credentials in files.

Exit Codes:
- 0: Content is safe (no secrets detected)
- 2: Content blocked (potential secret detected)

Detection Methods:
1. Pattern matching for known secret formats (API keys, tokens, etc.)
2. Entropy analysis for high-entropy strings
3. Variable name heuristics (password=, secret=, api_key=, etc.)

Override: BMAD_ALLOW_SECRETS=true (single-use, 5-minute timeout)
"""

import math
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

VALIDATOR_NAME = 'secret_guard'

# =============================================================================
# SECRET PATTERNS
# =============================================================================

SECRET_PATTERNS = [
    # AWS
    (r'AKIA[0-9A-Z]{16}', 'AWS Access Key ID'),
    (r'(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])', 'AWS Secret Access Key (40-char base64)'),

    # GitHub
    (r'ghp_[A-Za-z0-9]{36}', 'GitHub Personal Access Token'),
    (r'gho_[A-Za-z0-9]{36}', 'GitHub OAuth Token'),
    (r'ghu_[A-Za-z0-9]{36}', 'GitHub User-to-Server Token'),
    (r'ghs_[A-Za-z0-9]{36}', 'GitHub Server-to-Server Token'),
    (r'ghr_[A-Za-z0-9]{36}', 'GitHub Refresh Token'),

    # GitLab
    (r'glpat-[A-Za-z0-9\-]{20,}', 'GitLab Personal Access Token'),

    # Slack
    (r'xox[baprs]-[0-9A-Za-z\-]{10,}', 'Slack Token'),

    # Stripe
    (r'sk_live_[0-9a-zA-Z]{24,}', 'Stripe Live Secret Key'),
    (r'rk_live_[0-9a-zA-Z]{24,}', 'Stripe Live Restricted Key'),

    # Google
    (r'AIza[0-9A-Za-z\-_]{35}', 'Google API Key'),

    # Twilio
    (r'SK[0-9a-fA-F]{32}', 'Twilio API Key'),

    # SendGrid
    (r'SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}', 'SendGrid API Key'),

    # Mailchimp
    (r'[0-9a-f]{32}-us[0-9]{1,2}', 'Mailchimp API Key'),

    # Heroku
    (r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', 'Heroku API Key (UUID)'),

    # Generic tokens (must be careful with these)
    (r'Bearer\s+[A-Za-z0-9\-_\.]+', 'Bearer Token'),
    (r'Basic\s+[A-Za-z0-9+/=]{20,}', 'Basic Auth Credentials'),

    # Private keys
    (r'-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----', 'Private Key'),
    (r'-----BEGIN PGP PRIVATE KEY BLOCK-----', 'PGP Private Key'),

    # JWT (only if it looks like a real token, not a placeholder)
    (r'eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+', 'JWT Token'),

    # Database connection strings with credentials
    (r'postgres://[^:]+:[^@]+@', 'PostgreSQL Connection String with Password'),
    (r'mysql://[^:]+:[^@]+@', 'MySQL Connection String with Password'),
    (r'mongodb://[^:]+:[^@]+@', 'MongoDB Connection String with Password'),
    (r'redis://:[^@]+@', 'Redis Connection String with Password'),
]

# Variable name patterns that suggest secrets
SECRET_VARIABLE_PATTERNS = [
    (r'(?i)(password|passwd|pwd)\s*[=:]\s*["\'][^"\']{8,}["\']', 'Hardcoded password'),
    (r'(?i)(secret|api_?key|apikey|auth_?token|access_?token)\s*[=:]\s*["\'][^"\']{8,}["\']', 'Hardcoded secret/token'),
    (r'(?i)(private_?key|priv_?key)\s*[=:]\s*["\'][^"\']{20,}["\']', 'Hardcoded private key'),
    (r'(?i)(client_?secret|app_?secret)\s*[=:]\s*["\'][^"\']{8,}["\']', 'Hardcoded client secret'),
    (r'(?i)(database_?url|db_?url|connection_?string)\s*[=:]\s*["\'][^"\']*:[^"\']*@', 'Database URL with credentials'),
]

# Files to skip (test files, example files, documentation)
SKIP_PATTERNS = [
    r'\.example$',
    r'\.sample$',
    r'\.template$',
    r'test.*\.py$',
    r'.*_test\.py$',
    r'.*\.test\.(js|ts)$',
    r'.*\.spec\.(js|ts)$',
    r'mock.*\.',
    r'fixture.*\.',
]

# Content patterns that indicate this is example/placeholder content
PLACEHOLDER_INDICATORS = [
    'your_',
    'your-',
    'example',
    'placeholder',
    'xxx',
    'yyy',
    'zzz',
    'replace_me',
    'change_me',
    'todo',
    'fixme',
    '<your',
    '[your',
    '{your',
]


def calculate_entropy(data: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not data:
        return 0.0

    entropy = 0.0
    for char in set(data):
        p = data.count(char) / len(data)
        if p > 0:
            entropy -= p * math.log2(p)

    return entropy


def is_high_entropy_secret(value: str, threshold: float = 4.5) -> bool:
    """
    Check if a string has high entropy suggesting it might be a secret.

    Typical entropy values:
    - English text: ~4.0 bits
    - Random alphanumeric: ~5.7 bits
    - Random base64: ~6.0 bits
    """
    if len(value) < 16:
        return False

    # Skip if it looks like a placeholder
    value_lower = value.lower()
    for indicator in PLACEHOLDER_INDICATORS:
        if indicator in value_lower:
            return False

    entropy = calculate_entropy(value)
    return entropy >= threshold


def should_skip_file(file_path: str) -> bool:
    """Check if file should be skipped (test files, examples, etc.)."""
    if not file_path:
        return False

    for pattern in SKIP_PATTERNS:
        if re.search(pattern, file_path, re.IGNORECASE):
            return True

    return False


def is_placeholder_value(value: str) -> bool:
    """Check if a value is clearly a placeholder."""
    value_lower = value.lower()
    for indicator in PLACEHOLDER_INDICATORS:
        if indicator in value_lower:
            return True
    return False


def scan_content(content: str, file_path: str = '') -> List[Dict]:
    """
    Scan content for potential secrets.

    Returns list of findings, each with:
    - pattern_name: Name of the matched pattern
    - matched_text: The actual matched text (truncated)
    - line_number: Approximate line number
    - severity: 'high', 'medium', 'low'
    """
    findings = []

    # Skip if this is a test/example file
    if should_skip_file(file_path):
        return findings

    lines = content.split('\n')

    for line_num, line in enumerate(lines, 1):
        # Skip comment lines in code (basic heuristic)
        stripped = line.strip()
        if stripped.startswith('#') and 'password' not in stripped.lower():
            continue
        if stripped.startswith('//') and 'password' not in stripped.lower():
            continue

        # Check against secret patterns
        for pattern, pattern_name in SECRET_PATTERNS:
            matches = re.finditer(pattern, line)
            for match in matches:
                matched_text = match.group(0)

                # Skip placeholders
                if is_placeholder_value(matched_text):
                    continue

                findings.append({
                    'pattern_name': pattern_name,
                    'matched_text': matched_text[:50] + '...' if len(matched_text) > 50 else matched_text,
                    'line_number': line_num,
                    'severity': 'high'
                })

        # Check variable name patterns
        for pattern, pattern_name in SECRET_VARIABLE_PATTERNS:
            matches = re.finditer(pattern, line)
            for match in matches:
                matched_text = match.group(0)

                # Skip placeholders
                if is_placeholder_value(matched_text):
                    continue

                findings.append({
                    'pattern_name': pattern_name,
                    'matched_text': matched_text[:50] + '...' if len(matched_text) > 50 else matched_text,
                    'line_number': line_num,
                    'severity': 'high'
                })

        # Check for high-entropy strings in assignments
        assignment_match = re.search(r'["\']([A-Za-z0-9+/=\-_]{20,})["\']', line)
        if assignment_match:
            value = assignment_match.group(1)
            if is_high_entropy_secret(value) and not is_placeholder_value(value):
                findings.append({
                    'pattern_name': 'High-entropy string (potential secret)',
                    'matched_text': value[:30] + '...',
                    'line_number': line_num,
                    'severity': 'medium'
                })

    return findings


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    tool_name = data.get('tool_name', '')

    # Get content and file path based on tool
    content = ''
    file_path = ''

    if tool_name == 'Write':
        content = tool_input.get('content', '')
        file_path = tool_input.get('file_path', '')
    elif tool_name == 'Edit':
        content = tool_input.get('new_string', '')
        file_path = tool_input.get('file_path', '')
    else:
        # Unknown tool, allow
        sys.exit(0)

    if not content:
        sys.exit(0)

    # Scan for secrets
    findings = scan_content(content, file_path)

    if not findings:
        AuditLogger.log_allowed(VALIDATOR_NAME, 'No secrets detected', {'file_path': file_path})
        sys.exit(0)

    # Check for override
    override_valid, override_reason = OverrideManager.check_and_consume_override('SECRETS')

    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_SECRETS', file_path)
        print(f"Override accepted: {override_reason}", file=sys.stderr)
        print(f"WARNING: {len(findings)} potential secret(s) will be written.", file=sys.stderr)
        sys.exit(0)

    # Block and report
    AuditLogger.log_blocked(VALIDATOR_NAME, 'Potential secrets detected', file_path, {
        'findings_count': len(findings),
        'patterns': [f['pattern_name'] for f in findings[:5]]
    })

    findings_summary = "\n".join([
        f"  Line {f['line_number']}: {f['pattern_name']}"
        for f in findings[:5]
    ])
    if len(findings) > 5:
        findings_summary += f"\n  ... and {len(findings) - 5} more"

    print_block_message(
        title="SECRET DETECTION - Potential Credentials Found",
        message=f"Potential secrets/credentials detected in content:\n\n{findings_summary}\n\n"
                "Hardcoding secrets in source files is a security risk.",
        command_or_file=file_path,
        override_var="BMAD_ALLOW_SECRETS",
        recommendations=[
            "Use environment variables for secrets",
            "Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)",
            "Add secrets to .env files (and ensure .env is in .gitignore)",
            "If this is test/example data, rename the file to include 'test', 'example', or 'mock'"
        ]
    )
    sys.exit(2)


if __name__ == '__main__':
    main()
