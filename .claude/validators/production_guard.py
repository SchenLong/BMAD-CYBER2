#!/usr/bin/env python3
"""
BMAD Guardrails: Production Environment Guard
==============================================
Prevents accidental operations targeting production environments.

Exit Codes:
- 0: Operation allowed (not targeting production)
- 2: Operation blocked (production environment detected)

Detection Methods:
1. Environment variable checks (NODE_ENV, RAILS_ENV, etc.)
2. Hostname patterns (prod, production, prd)
3. URL patterns in commands
4. Database connection strings

Override: BMAD_ALLOW_PRODUCTION=true (single-use, 5-minute timeout)
"""

import os
import re
import sys

# Add validators directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_common import (
    AuditLogger,
    OverrideManager,
    get_tool_input_from_stdin,
    print_block_message,
    PROJECT_DIR
)

VALIDATOR_NAME = 'production_guard'

# =============================================================================
# PRODUCTION INDICATORS
# =============================================================================

# Environment variables that indicate production
PRODUCTION_ENV_VARS = [
    ('NODE_ENV', 'production'),
    ('RAILS_ENV', 'production'),
    ('FLASK_ENV', 'production'),
    ('DJANGO_SETTINGS_MODULE', 'production'),
    ('APP_ENV', 'production'),
    ('ENVIRONMENT', 'production'),
    ('ENV', 'production'),
    ('DEPLOY_ENV', 'production'),
]

# Hostname patterns that suggest production
PRODUCTION_HOSTNAME_PATTERNS = [
    r'prod\.',
    r'production\.',
    r'prd\.',
    r'live\.',
    r'-prod\.',
    r'-production\.',
    r'-prd\.',
    r'-live\.',
    r'\.prod\.',
    r'\.production\.',
]

# URL patterns that suggest production
PRODUCTION_URL_PATTERNS = [
    r'https?://prod[\.-]',
    r'https?://production[\.-]',
    r'https?://prd[\.-]',
    r'https?://live[\.-]',
    r'https?://[^/]*\.prod\.',
    r'https?://[^/]*\.production\.',
    r'https?://api\.((?!dev|test|staging)[a-z]+\.)?[a-z]+\.[a-z]+',  # api.company.com (not api.dev.company.com)
]

# Database patterns suggesting production
PRODUCTION_DB_PATTERNS = [
    r'@prod[\.-]',
    r'@production[\.-]',
    r'@prd[\.-]',
    r'@live[\.-]',
    r'prod-db',
    r'production-db',
    r'prd-db',
    r'live-db',
    r'-prod\.rds\.',
    r'-production\.rds\.',
]

# Commands that are especially dangerous in production
DANGEROUS_PRODUCTION_COMMANDS = [
    (r'migrate\s+--run', 'Database migration'),
    (r'db:migrate', 'Rails database migration'),
    (r'syncdb', 'Django syncdb'),
    (r'dropdb', 'Drop database'),
    (r'drop\s+database', 'SQL drop database'),
    (r'truncate\s+table', 'SQL truncate'),
    (r'delete\s+from\s+\w+\s*;?\s*$', 'SQL delete without WHERE'),
    (r'deploy\s+--force', 'Force deploy'),
    (r'rollback\s+--force', 'Force rollback'),
]


def is_production_environment() -> tuple:
    """
    Check if current environment appears to be production.

    Returns:
        Tuple of (is_production, reason)
    """
    # Check environment variables
    for env_var, prod_value in PRODUCTION_ENV_VARS:
        actual_value = os.environ.get(env_var, '').lower()
        if actual_value == prod_value:
            return (True, f'{env_var}={actual_value}')

    # Check hostname
    hostname = os.environ.get('HOSTNAME', '')
    if not hostname:
        try:
            import socket
            hostname = socket.gethostname()
        except Exception:
            hostname = ''

    hostname_lower = hostname.lower()
    for pattern in PRODUCTION_HOSTNAME_PATTERNS:
        if re.search(pattern, hostname_lower):
            return (True, f'Hostname matches production pattern: {hostname}')

    return (False, '')


def check_command_for_production(command: str) -> tuple:
    """
    Check if a command targets production.

    Returns:
        Tuple of (targets_production, reason)
    """
    cmd_lower = command.lower()

    # Check for production URLs
    for pattern in PRODUCTION_URL_PATTERNS:
        if re.search(pattern, cmd_lower):
            return (True, 'Command contains production URL pattern')

    # Check for production database connections
    for pattern in PRODUCTION_DB_PATTERNS:
        if re.search(pattern, cmd_lower):
            return (True, 'Command contains production database pattern')

    # Check for dangerous production commands
    for pattern, description in DANGEROUS_PRODUCTION_COMMANDS:
        if re.search(pattern, cmd_lower, re.IGNORECASE):
            # Only flag if also targeting production
            for url_pattern in PRODUCTION_URL_PATTERNS + PRODUCTION_DB_PATTERNS:
                if re.search(url_pattern, cmd_lower):
                    return (True, f'{description} targeting production')

    return (False, '')


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    tool_name = data.get('tool_name', '')

    # First check if we're in a production environment
    in_production, env_reason = is_production_environment()

    if in_production:
        # Check for override
        override_valid, override_reason = OverrideManager.check_and_consume_override('PRODUCTION')

        if override_valid:
            AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_PRODUCTION', env_reason)
            print(f"Override accepted: {override_reason}", file=sys.stderr)
            print(f"WARNING: Operating in production environment ({env_reason})", file=sys.stderr)
            sys.exit(0)

        AuditLogger.log_blocked(VALIDATOR_NAME, f'Production environment detected: {env_reason}', '')
        print_block_message(
            title="PRODUCTION ENVIRONMENT DETECTED",
            message=f"This appears to be a production environment:\n{env_reason}\n\n"
                    "Operations in production environments are blocked by default.",
            command_or_file=tool_input.get('command', tool_input.get('file_path', 'Unknown')),
            override_var="BMAD_ALLOW_PRODUCTION",
            recommendations=[
                "Verify you intend to operate in production",
                "Use staging/development environment for testing",
                "If certain, use the override shown below"
            ]
        )
        sys.exit(2)

    # For Bash commands, also check command content for production targets
    if tool_name == 'Bash':
        command = tool_input.get('command', '')
        targets_production, cmd_reason = check_command_for_production(command)

        if targets_production:
            # Check for override
            override_valid, override_reason = OverrideManager.check_and_consume_override('PRODUCTION')

            if override_valid:
                AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_PRODUCTION', command)
                print(f"Override accepted: {override_reason}", file=sys.stderr)
                print(f"WARNING: {cmd_reason}", file=sys.stderr)
                sys.exit(0)

            AuditLogger.log_blocked(VALIDATOR_NAME, cmd_reason, command)
            print_block_message(
                title="PRODUCTION TARGET DETECTED",
                message=f"This command appears to target production:\n{cmd_reason}\n\n"
                        "Commands targeting production systems are blocked by default.",
                command_or_file=command,
                override_var="BMAD_ALLOW_PRODUCTION",
                recommendations=[
                    "Verify the target environment is correct",
                    "Use staging/development URLs for testing",
                    "If certain, use the override shown below"
                ]
            )
            sys.exit(2)

    # No production indicators found
    AuditLogger.log_allowed(VALIDATOR_NAME, 'No production indicators detected')
    sys.exit(0)


if __name__ == '__main__':
    main()
