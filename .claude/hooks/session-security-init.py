#!/usr/bin/env python3
"""
BMAD Guardrails: Session Security Initialization
=================================================
Runs at session start to validate security configuration and environment.

This hook:
1. Validates authentication token (P1 Security Fix)
2. Verifies all validators exist and are readable
3. Checks for dangerous environment variables
4. Initializes the audit log
5. Reports security status to the user

Exit Codes:
- 0: Security initialized successfully (with warnings if any)
- 2: Authentication failed (blocks session start)

Security Note:
    Token validation is now enforced at session start to ensure
    only authorized users can interact with the system.
"""

import os
import sys
import json
from datetime import datetime

# Get the project directory
PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
VALIDATORS_DIR = os.path.join(PROJECT_DIR, '.claude', 'validators')
LOGS_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')

# Add validators to path for import
sys.path.insert(0, VALIDATORS_DIR)

# Required validators
REQUIRED_VALIDATORS = [
    'security_common.py',
    'token_validator.py',  # P1 Security Fix: Token authentication
    'bash_safety.py',
    'secret_guard.py',
    'env_protection.py',
    'production_guard.py',
    'outside_repo_guard.py',
    'pii_guard.py',
    'prompt_injection_guard.py',
    'jailbreak_guard.py',
]

# Dangerous environment variables to check
DANGEROUS_ENV_VARS = [
    ('BMAD_ALLOW_DANGEROUS', 'Dangerous operations override'),
    ('BMAD_ALLOW_SECRETS', 'Secrets override'),
    ('BMAD_ALLOW_PRODUCTION', 'Production operations override'),
    ('BMAD_ALLOW_OUTSIDE_REPO', 'Outside repository override'),
    ('BMAD_ALLOW_SENSITIVE_FILES', 'Sensitive files override'),
    ('BMAD_ALLOW_ESCAPE', 'Directory escape override'),
    ('BMAD_ALLOW_PII', 'PII detection override'),
    ('BMAD_ALLOW_INJECTION_CONTENT', 'Prompt injection content override'),
    ('BMAD_ALLOW_JAILBREAK', 'Jailbreak detection override'),
]


def check_validators() -> tuple:
    """Check that all required validators exist and are readable."""
    missing = []
    unreadable = []

    for validator in REQUIRED_VALIDATORS:
        path = os.path.join(VALIDATORS_DIR, validator)
        if not os.path.exists(path):
            missing.append(validator)
        elif not os.access(path, os.R_OK):
            unreadable.append(validator)

    return missing, unreadable


def check_dangerous_env_vars() -> list:
    """Check for active dangerous environment variables."""
    active = []

    for env_var, description in DANGEROUS_ENV_VARS:
        value = os.environ.get(env_var, '').lower()
        if value == 'true':
            active.append((env_var, description))

    return active


def initialize_logs() -> bool:
    """Ensure log directory exists and is writable."""
    try:
        os.makedirs(LOGS_DIR, exist_ok=True)

        # Test write access
        test_file = os.path.join(LOGS_DIR, '.write_test')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)

        return True
    except Exception as e:
        return False


def log_session_start(status: str, issues: list) -> None:
    """Log session initialization to audit log."""
    log_file = os.path.join(LOGS_DIR, 'security.log')

    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'session_id': os.environ.get('CLAUDE_SESSION_ID', 'unknown'),
        'validator': 'session_init',
        'severity': 'WARNING' if issues else 'INFO',
        'action': 'SESSION_START',
        'details': {
            'status': status,
            'issues': issues,
            'project_dir': PROJECT_DIR
        }
    }

    try:
        with open(log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception:
        pass  # Don't fail session start due to logging issues


def validate_authentication() -> tuple:
    """
    Validate authentication token (P1 Security Fix).

    Returns:
        Tuple of (is_valid, user_info, error_message)
    """
    try:
        from token_validator import validate_token, mark_session_validated, save_session_claims
    except ImportError as e:
        return False, None, f"Could not import token_validator: {e}"

    is_valid, error, claims = validate_token()

    if is_valid:
        mark_session_validated()
        save_session_claims(claims)

        user_name = claims.get('name', 'unknown')
        user_roles = claims.get('roles', [])
        if isinstance(user_roles, str):
            user_roles = [user_roles]

        return True, {'name': user_name, 'roles': user_roles}, None

    return False, None, error


def main():
    issues = []
    warnings = []

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAILS: Security Initialization", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)

    # Check 0: Token Authentication (P1 Security Fix)
    token_required = os.environ.get('BMAD_TOKEN_REQUIRED', 'true').lower() != 'false'

    if token_required:
        auth_valid, user_info, auth_error = validate_authentication()
        if auth_valid:
            if user_info and not user_info.get('enforcement_disabled'):
                user_name = user_info.get('name', 'unknown')
                roles = ', '.join(user_info.get('roles', []))
                print(f"  [OK] Authenticated: {user_name} (roles: {roles})", file=sys.stderr)
            else:
                print(f"  [!!] Token enforcement disabled - running as guest", file=sys.stderr)
                warnings.append("Token enforcement disabled")
        else:
            # Authentication failed - this is a blocking error
            print(f"  [!!] Authentication FAILED: {auth_error}", file=sys.stderr)
            print(f"\n{'='*60}", file=sys.stderr)
            print(f"  To authenticate, generate a token:", file=sys.stderr)
            print(f"    node _bmad/core/security/quick-token.js \"Name\" \"role\" 168", file=sys.stderr)
            print(f"\n  Or disable token requirement (NOT RECOMMENDED):", file=sys.stderr)
            print(f"    export BMAD_TOKEN_REQUIRED=false", file=sys.stderr)
            print(f"{'='*60}\n", file=sys.stderr)
            sys.exit(2)
    else:
        print(f"  [!!] Token validation SKIPPED (BMAD_TOKEN_REQUIRED=false)", file=sys.stderr)
        warnings.append("Token validation disabled")

    # Check 1: Validators
    missing, unreadable = check_validators()
    if missing:
        issues.append(f"Missing validators: {', '.join(missing)}")
    if unreadable:
        issues.append(f"Unreadable validators: {', '.join(unreadable)}")

    if not missing and not unreadable:
        print(f"  [OK] All {len(REQUIRED_VALIDATORS)} security validators present", file=sys.stderr)
    else:
        print(f"  [!!] Validator issues detected", file=sys.stderr)
        for issue in issues:
            print(f"       {issue}", file=sys.stderr)

    # Check 2: Environment variables
    active_overrides = check_dangerous_env_vars()
    if active_overrides:
        print(f"\n  [!!] Active override environment variables:", file=sys.stderr)
        for env_var, description in active_overrides:
            print(f"       {env_var}=true ({description})", file=sys.stderr)
            warnings.append(f"Override active: {env_var}")
        print(f"\n       These overrides will apply to the next blocked operation.", file=sys.stderr)
        print(f"       Overrides are single-use and expire after 5 minutes.", file=sys.stderr)
    else:
        print(f"  [OK] No override environment variables active", file=sys.stderr)

    # Check 3: Log directory
    logs_ok = initialize_logs()
    if logs_ok:
        print(f"  [OK] Audit logging initialized: {LOGS_DIR}", file=sys.stderr)
    else:
        warnings.append("Could not initialize audit logging")
        print(f"  [!!] Could not initialize audit logging", file=sys.stderr)

    # Summary
    print(f"\n{'='*60}", file=sys.stderr)
    if issues:
        print(f"  STATUS: DEGRADED - Some security features may not work", file=sys.stderr)
        status = 'DEGRADED'
    elif warnings:
        print(f"  STATUS: ACTIVE (with warnings)", file=sys.stderr)
        status = 'ACTIVE_WITH_WARNINGS'
    else:
        print(f"  STATUS: FULLY ACTIVE", file=sys.stderr)
        status = 'ACTIVE'

    print(f"\n  Security guardrails protect against:", file=sys.stderr)
    print(f"    - Dangerous bash commands (rm -rf, fork bombs, etc.)", file=sys.stderr)
    print(f"    - Hardcoded secrets in code", file=sys.stderr)
    print(f"    - Modifications to sensitive files (.env, credentials)", file=sys.stderr)
    print(f"    - Production environment targeting", file=sys.stderr)
    print(f"    - Operations outside repository boundaries", file=sys.stderr)
    print(f"    - PII exposure (SSN, credit cards, EU national IDs, IBAN)", file=sys.stderr)
    print(f"    - Prompt injection attacks", file=sys.stderr)
    print(f"    - Jailbreak attempts", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    # Log the session start
    log_session_start(status, issues + warnings)

    # Always exit 0 to not block session start
    # Security validation happens per-operation
    sys.exit(0)


if __name__ == '__main__':
    main()
