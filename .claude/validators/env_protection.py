#!/usr/bin/env python3
"""
BMAD Guardrails: Environment File Protection
=============================================
Prevents modifications to sensitive environment and configuration files.

Exit Codes:
- 0: Operation allowed
- 2: Operation blocked (sensitive file targeted)

Protected Files:
1. ABSOLUTE PROTECTION (cannot override):
   - .env files (any variant)
   - credentials.json, secrets.json
   - *_credentials.*, *_secrets.*
   - Private keys

2. STRICT PROTECTION (override with BMAD_ALLOW_SENSITIVE_FILES=true):
   - Config files with potential secrets
   - Docker/CI configuration
   - Cloud provider configs
"""

import os
import re
import sys
from pathlib import Path

# Add validators directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_common import (
    AuditLogger,
    OverrideManager,
    get_tool_input_from_stdin,
    print_block_message,
    resolve_path,
    PROJECT_DIR
)

VALIDATOR_NAME = 'env_protection'

# =============================================================================
# ABSOLUTE PROTECTION - Cannot be overridden
# =============================================================================

ABSOLUTE_PROTECTED_PATTERNS = [
    # Environment files
    (r'\.env$', '.env file'),
    (r'\.env\.local$', '.env.local file'),
    (r'\.env\.production$', '.env.production file'),
    (r'\.env\.prod$', '.env.prod file'),
    (r'\.env\.[a-z]+$', '.env.* file'),

    # Explicit credentials files
    (r'credentials\.json$', 'credentials.json'),
    (r'secrets\.json$', 'secrets.json'),
    (r'_credentials\.(json|yaml|yml|xml)$', 'credentials file'),
    (r'_secrets\.(json|yaml|yml|xml)$', 'secrets file'),

    # Private keys
    (r'\.pem$', 'PEM private key'),
    (r'id_rsa$', 'RSA private key'),
    (r'id_ed25519$', 'Ed25519 private key'),
    (r'id_ecdsa$', 'ECDSA private key'),
    (r'id_dsa$', 'DSA private key'),
    (r'\.key$', 'Private key file'),

    # AWS credentials
    (r'\.aws/credentials$', 'AWS credentials'),
    (r'\.aws/config$', 'AWS config'),

    # GCP credentials
    (r'gcloud.*credentials', 'GCP credentials'),
    (r'application_default_credentials\.json$', 'GCP ADC'),

    # SSH
    (r'\.ssh/config$', 'SSH config'),
    (r'known_hosts$', 'SSH known hosts'),
    (r'authorized_keys$', 'SSH authorized keys'),

    # GPG
    (r'\.gnupg/', 'GPG directory'),
]

# =============================================================================
# STRICT PROTECTION - Can be overridden
# =============================================================================

STRICT_PROTECTED_PATTERNS = [
    # Docker/Container
    (r'docker-compose.*\.ya?ml$', 'Docker Compose file'),
    (r'\.docker/config\.json$', 'Docker config'),
    (r'Dockerfile', 'Dockerfile'),

    # CI/CD
    (r'\.github/workflows/.*\.ya?ml$', 'GitHub Actions workflow'),
    (r'\.gitlab-ci\.yml$', 'GitLab CI config'),
    (r'\.travis\.yml$', 'Travis CI config'),
    (r'Jenkinsfile$', 'Jenkinsfile'),
    (r'\.circleci/config\.yml$', 'CircleCI config'),

    # Cloud configs
    (r'terraform\.tfvars$', 'Terraform variables'),
    (r'\.tfstate$', 'Terraform state'),
    (r'serverless\.ya?ml$', 'Serverless config'),
    (r'cloudformation.*\.ya?ml$', 'CloudFormation template'),

    # Application configs with potential secrets
    (r'config/production\.(js|ts|json|ya?ml)$', 'Production config'),
    (r'config/secrets\.(js|ts|json|ya?ml)$', 'Secrets config'),
    (r'settings/production\.py$', 'Django production settings'),

    # Database configs
    (r'database\.ya?ml$', 'Database config'),
    (r'db\.json$', 'Database config'),

    # Package manager auth
    (r'\.npmrc$', 'npm config (may contain auth tokens)'),
    (r'\.pypirc$', 'PyPI config'),
    (r'\.netrc$', 'netrc file'),
]


def check_file_protection(file_path: str) -> tuple:
    """
    Check if a file is protected.

    Returns:
        Tuple of (protection_level, reason)
        protection_level: 'none', 'absolute', 'strict'
    """
    if not file_path:
        return ('none', '')

    # Normalize path for matching
    normalized = file_path.replace('\\', '/')

    # Check absolute protection
    for pattern, reason in ABSOLUTE_PROTECTED_PATTERNS:
        if re.search(pattern, normalized, re.IGNORECASE):
            return ('absolute', reason)

    # Check strict protection
    for pattern, reason in STRICT_PROTECTED_PATTERNS:
        if re.search(pattern, normalized, re.IGNORECASE):
            return ('strict', reason)

    return ('none', '')


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    tool_name = data.get('tool_name', '')
    cwd = data.get('cwd', PROJECT_DIR)

    # Get file path based on tool
    file_path = tool_input.get('file_path', '')

    if not file_path:
        sys.exit(0)

    # Resolve to absolute path
    resolved_path = resolve_path(file_path, cwd)

    # Check protection level
    protection_level, reason = check_file_protection(resolved_path)

    if protection_level == 'none':
        AuditLogger.log_allowed(VALIDATOR_NAME, 'File not protected', {'file_path': file_path})
        sys.exit(0)

    elif protection_level == 'absolute':
        AuditLogger.log_blocked(VALIDATOR_NAME, f'Absolute protection: {reason}', file_path)
        print_block_message(
            title="ABSOLUTE BLOCK - Protected File",
            message=f"This file is protected and cannot be modified: {reason}\n\n"
                    "Sensitive files like environment configs and credentials must be "
                    "managed manually to prevent accidental exposure.",
            command_or_file=file_path,
            is_absolute=True,
            recommendations=[
                "Edit this file manually outside of this interface",
                "Use secure secret management practices",
                "Never commit secrets to version control",
                "Consider using a secrets manager"
            ]
        )
        sys.exit(2)

    elif protection_level == 'strict':
        # Check for override
        override_valid, override_reason = OverrideManager.check_and_consume_override('SENSITIVE_FILES')

        if override_valid:
            AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_SENSITIVE_FILES', file_path)
            print(f"Override accepted: {override_reason}", file=sys.stderr)
            sys.exit(0)

        AuditLogger.log_blocked(VALIDATOR_NAME, f'Strict protection: {reason}', file_path)
        print_block_message(
            title="STRICT BLOCK - Sensitive Configuration File",
            message=f"This file may contain sensitive configuration: {reason}\n\n"
                    "Modifications to configuration files should be reviewed carefully.",
            command_or_file=file_path,
            override_var="BMAD_ALLOW_SENSITIVE_FILES",
            recommendations=[
                "Review changes carefully for security implications",
                "Ensure no secrets are hardcoded",
                "Consider using environment variables for sensitive values",
                "If certain, use the override shown below"
            ]
        )
        sys.exit(2)


if __name__ == '__main__':
    main()
