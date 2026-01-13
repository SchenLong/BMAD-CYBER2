#!/usr/bin/env python3
"""
BMAD Guardrails: Environment File Protection Validator
========================================================
Blocks modifications to sensitive environment and credential files.

Exit Codes:
- 0: Allow the operation
- 2: Block the operation (sensitive file)

Protected files include:
- .env files (all variants)
- Credential files (credentials.*, secrets.*, etc.)
- Key files (*.pem, *.key, *.p12, etc.)
- SSH configuration

Security Improvements (v2):
- Audit logging for all blocked/allowed operations
- Single-use override tokens with 5-minute timeout
- Improved cloud provider config detection
"""

import json
import sys
import os
import re
import fnmatch

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


VALIDATOR_NAME = 'env_protection'


# Patterns for protected files (glob-style)
PROTECTED_FILE_PATTERNS = [
    # Environment files
    '.env',
    '.env.*',
    '*.env',
    '.envrc',

    # Credential files
    'credentials.*',
    'secrets.*',
    '*credentials*',
    '*secrets*',

    # Key files
    '*.pem',
    '*.key',
    '*.p12',
    '*.pfx',
    '*.jks',
    '*.keystore',
    'id_rsa',
    'id_rsa.*',
    'id_ed25519',
    'id_ed25519.*',
    'id_dsa',
    'id_ecdsa',

    # SSH configuration
    'ssh_config',
    'sshd_config',
    'known_hosts',
    'authorized_keys',

    # AWS credentials
    'aws_credentials',
    '.aws/credentials',
    '.aws/config',

    # Docker secrets
    '.docker/config.json',

    # Kubernetes secrets
    'kubeconfig',
    '.kube/config',

    # GPG
    '*.gpg',
    'secring.gpg',
    'trustdb.gpg',

    # Password files
    '.htpasswd',
    '.netrc',
    '.pgpass',

    # Token files
    '.npmrc',
    '.pypirc',
]

# Cloud provider config patterns - check path components
CLOUD_CONFIG_PATTERNS = [
    ('.gcloud', 'Google Cloud configuration'),
    ('.azure', 'Azure configuration'),
    ('.config/gcloud', 'Google Cloud configuration'),
    ('.config/azure', 'Azure configuration'),
]

# Files that are explicitly allowed (e.g., examples)
ALLOWED_FILE_PATTERNS = [
    '*.example',
    '*.template',
    '*.sample',
    '.env.example',
    '.env.template',
    '.env.sample',
    'example.*',
    'template.*',
    'sample.*',
    '*.example.*',
    '*.template.*',
    '*.sample.*',
]


def get_file_path_from_stdin():
    """Read the tool input from stdin (JSON format from Claude Code)."""
    try:
        data = json.load(sys.stdin)
        tool_input = data.get('tool_input', {})
        file_path = tool_input.get('file_path', '')
        return file_path
    except (json.JSONDecodeError, KeyError):
        return ''


def matches_pattern(filename: str, patterns: list) -> tuple:
    """Check if filename matches any pattern. Returns (matches, matched_pattern)."""
    filename_lower = filename.lower()

    for pattern in patterns:
        # Check the full path and just the filename
        if fnmatch.fnmatch(filename_lower, pattern.lower()):
            return True, pattern
        if fnmatch.fnmatch(os.path.basename(filename_lower), pattern.lower()):
            return True, pattern

    return False, None


def check_cloud_config_path(file_path: str) -> tuple:
    """Check if path contains cloud provider config directories."""
    path_lower = file_path.lower()
    path_parts = path_lower.split(os.sep)

    for config_dir, description in CLOUD_CONFIG_PATTERNS:
        config_parts = config_dir.split('/')
        # Check if all parts of config_dir appear in sequence in path
        for i in range(len(path_parts) - len(config_parts) + 1):
            if path_parts[i:i+len(config_parts)] == config_parts:
                return True, f"Cloud config: {description}"

    return False, None


def is_protected_file(file_path: str) -> tuple:
    """Check if the file is protected. Returns (is_protected, reason)."""
    filename = os.path.basename(file_path)
    full_path = file_path.lower()

    # First check if it's explicitly allowed (example/template)
    is_allowed, _ = matches_pattern(filename, ALLOWED_FILE_PATTERNS)
    if is_allowed:
        return False, "Allowed (example/template file)"

    # Check against protected patterns
    is_protected, pattern = matches_pattern(file_path, PROTECTED_FILE_PATTERNS)
    if is_protected:
        return True, f"Matches protected pattern: {pattern}"

    # Check cloud config paths
    is_cloud, cloud_reason = check_cloud_config_path(file_path)
    if is_cloud:
        return True, cloud_reason

    # Additional checks for hidden sensitive files
    sensitive_keywords = ['secret', 'cred', 'key', 'token', 'auth', 'pass', 'private']
    if filename.startswith('.') and any(kw in filename.lower() for kw in sensitive_keywords):
        return True, f"Hidden file with sensitive keyword: {filename}"

    return False, "Not a protected file"


def main():
    file_path = get_file_path_from_stdin()

    if not file_path:
        sys.exit(0)

    # Check if file is protected
    is_protected, reason = is_protected_file(file_path)

    if not is_protected:
        sys.exit(0)

    # Check for user override (single-use)
    override_valid, override_reason = OverrideManager.check_and_consume_override('SENSITIVE_FILES')
    if override_valid:
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_SENSITIVE_FILES', file_path)
        print(f"WARNING: Modifying protected file {file_path} - ALLOWED via single-use override", file=sys.stderr)
        print(f"  Reason would have been: {reason}", file=sys.stderr)
        print(f"  Override consumed. Set BMAD_ALLOW_SENSITIVE_FILES=true again for next operation.", file=sys.stderr)
        sys.exit(0)

    # Block the operation
    AuditLogger.log_blocked(VALIDATOR_NAME, reason, file_path)

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: PROTECTED FILE", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nFile: {file_path}", file=sys.stderr)
    print(f"Reason: {reason}", file=sys.stderr)
    print(f"\nThis file is protected because it may contain sensitive", file=sys.stderr)
    print(f"information such as API keys, passwords, or credentials.", file=sys.stderr)
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"RECOMMENDATIONS:", file=sys.stderr)
    print(f"  1. Use environment variables instead of files for secrets", file=sys.stderr)
    print(f"  2. If this is a template/example file, rename it to include", file=sys.stderr)
    print(f"     .example, .template, or .sample in the filename", file=sys.stderr)
    print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
    print(f"  export BMAD_ALLOW_SENSITIVE_FILES=true", file=sys.stderr)
    print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    sys.exit(2)


if __name__ == '__main__':
    main()
