#!/usr/bin/env python3
"""
BMAD Guardrails: Token Validator
================================
Validates authentication tokens at session start and optionally on each tool use.

This validator enforces token-based authentication for BMAD sessions,
ensuring only authorized users can interact with the system.

Exit Codes:
- 0: Token valid, session authorized
- 2: Token invalid or missing, block operation

Environment Variables:
- BMAD_AUTH_TOKEN: Token string (optional, uses file if not set)
- BMAD_TOKEN_REQUIRED: Set to 'false' to disable enforcement (default: true)

Token File Locations:
- .bmad-token: Token file (600 permissions required)
- .bmad-key: Encryption key file (600 permissions required)
"""

import json
import sys
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, Optional, Any

# Import shared utilities
try:
    from security_common import AuditLogger, PROJECT_DIR
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    class AuditLogger:
        @classmethod
        def log(cls, *args, **kwargs): pass
        @classmethod
        def log_blocked(cls, *args, **kwargs): pass

VALIDATOR_NAME = 'token_validator'
TOKEN_FILE = os.path.join(PROJECT_DIR, '.bmad-token')
KEY_FILE = os.path.join(PROJECT_DIR, '.bmad-key')
VALIDATION_SCRIPT = os.path.join(PROJECT_DIR, '_bmad/core/security/validate-token.js')

# Cache validated session to avoid re-validation on every hook
SESSION_VALIDATED_FILE = os.path.join(PROJECT_DIR, '.claude', '.session_validated')
SESSION_CLAIMS_FILE = os.path.join(PROJECT_DIR, '.claude', '.session_claims.json')
SESSION_VALIDITY_SECONDS = 3600  # Re-validate after 1 hour


def is_session_recently_validated() -> bool:
    """Check if session was validated recently (within validity window)."""
    try:
        if os.path.exists(SESSION_VALIDATED_FILE):
            stat = os.stat(SESSION_VALIDATED_FILE)
            age = datetime.now().timestamp() - stat.st_mtime
            if age < SESSION_VALIDITY_SECONDS:
                return True
    except Exception:
        pass
    return False


def mark_session_validated() -> None:
    """Mark current session as validated."""
    try:
        os.makedirs(os.path.dirname(SESSION_VALIDATED_FILE), exist_ok=True)
        Path(SESSION_VALIDATED_FILE).touch()
    except Exception:
        pass


def get_cached_claims() -> Optional[Dict]:
    """Get claims from cached session."""
    try:
        if os.path.exists(SESSION_CLAIMS_FILE):
            with open(SESSION_CLAIMS_FILE, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return None


def save_session_claims(claims: Dict) -> None:
    """Save claims for other validators to use."""
    try:
        os.makedirs(os.path.dirname(SESSION_CLAIMS_FILE), exist_ok=True)
        with open(SESSION_CLAIMS_FILE, 'w') as f:
            json.dump(claims, f)
        os.chmod(SESSION_CLAIMS_FILE, 0o600)
    except Exception:
        pass


def check_file_permissions(file_path: str) -> Tuple[bool, str]:
    """
    Check that a security file has appropriate permissions.

    Returns:
        Tuple of (is_ok, message)
    """
    try:
        stat = os.stat(file_path)
        mode = stat.st_mode & 0o777

        # Should be owner-only read/write (600) or at least not world-readable
        if mode & 0o077:  # Group or world permissions set
            return False, f"Insecure permissions {oct(mode)} on {file_path} - should be 600"
        return True, f"Permissions OK: {oct(mode)}"
    except FileNotFoundError:
        return False, f"File not found: {file_path}"
    except Exception as e:
        return False, f"Could not check permissions: {e}"


def validate_token_with_script() -> Tuple[bool, Optional[str], Dict]:
    """
    Validate token using the existing Node.js validation script.

    Returns:
        Tuple of (is_valid, error_message, claims)
    """
    if not os.path.exists(VALIDATION_SCRIPT):
        # Fail open if validation script missing (configurable behavior)
        AuditLogger.log(VALIDATOR_NAME, 'WARNING',
                       {'reason': 'Validation script not found', 'path': VALIDATION_SCRIPT},
                       severity='WARNING')
        return True, None, {}

    try:
        # Run validation script in JSON output mode
        result = subprocess.run(
            ['node', VALIDATION_SCRIPT],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=PROJECT_DIR
        )

        # Script outputs test results - check for "All validation tests passed"
        if 'All validation tests passed' in result.stdout:
            # Parse claims from output
            claims = parse_claims_from_output(result.stdout)
            return True, None, claims
        else:
            # Extract error from output
            error_msg = extract_error_from_output(result.stdout, result.stderr)
            return False, error_msg, {}

    except subprocess.TimeoutExpired:
        return False, 'Token validation timed out', {}
    except Exception as e:
        return False, f'Token validation error: {e}', {}


def parse_claims_from_output(output: str) -> Dict:
    """Parse token claims from validation script output."""
    claims = {}

    lines = output.split('\n')
    in_details = False

    for line in lines:
        if 'Token Details' in line:
            in_details = True
            continue

        if in_details and ':' in line:
            # Parse "  Key:       Value" format
            parts = line.split(':', 1)
            if len(parts) == 2:
                key = parts[0].strip().lower().replace(' ', '_')
                value = parts[1].strip()

                # Handle special cases
                if key == 'roles' or key == 'modules':
                    value = [v.strip() for v in value.split(',')]
                elif key == 'user_id':
                    key = 'sub'
                elif key == 'token_id':
                    key = 'jti'

                if value and value != '(not set)':
                    claims[key] = value

    return claims


def extract_error_from_output(stdout: str, stderr: str) -> str:
    """Extract meaningful error message from script output."""
    # Look for [FAIL] lines
    for line in stdout.split('\n'):
        if '[FAIL]' in line:
            return line.replace('[FAIL]', '').strip()

    # Check stderr
    if stderr.strip():
        return stderr.strip()[:200]

    return 'Token validation failed (see output for details)'


def validate_token() -> Tuple[bool, Optional[str], Dict]:
    """
    Validate the authentication token.

    Checks:
    1. Token enforcement setting
    2. Token file existence and permissions
    3. Key file existence and permissions
    4. Token validity via validation script

    Returns:
        Tuple of (is_valid, error_message, token_claims)
    """
    # Check if token enforcement is disabled
    if os.environ.get('BMAD_TOKEN_REQUIRED', 'true').lower() == 'false':
        AuditLogger.log(VALIDATOR_NAME, 'SKIPPED',
                       {'reason': 'Token enforcement disabled via BMAD_TOKEN_REQUIRED=false'},
                       severity='WARNING')
        return True, None, {'enforcement_disabled': True}

    # Check for token via environment variable
    token = os.environ.get('BMAD_AUTH_TOKEN', '')

    # If not in env, check token file
    if not token:
        if not os.path.exists(TOKEN_FILE):
            return False, f'No token found. Expected at {TOKEN_FILE} or BMAD_AUTH_TOKEN env var', {}

        # Check token file permissions
        perms_ok, perms_msg = check_file_permissions(TOKEN_FILE)
        if not perms_ok:
            AuditLogger.log(VALIDATOR_NAME, 'PERMISSION_WARNING',
                          {'file': TOKEN_FILE, 'message': perms_msg},
                          severity='WARNING')

        try:
            with open(TOKEN_FILE, 'r') as f:
                token = f.read().strip()
        except Exception as e:
            return False, f'Could not read token file: {e}', {}

    if not token:
        return False, 'Token file is empty', {}

    # Check key file exists
    if not os.path.exists(KEY_FILE):
        return False, f'Encryption key not found at {KEY_FILE}', {}

    # Check key file permissions
    perms_ok, perms_msg = check_file_permissions(KEY_FILE)
    if not perms_ok:
        AuditLogger.log(VALIDATOR_NAME, 'PERMISSION_WARNING',
                      {'file': KEY_FILE, 'message': perms_msg},
                      severity='WARNING')

    # Validate using the script
    return validate_token_with_script()


def validate_rbac(claims: Dict, required_role: str = None) -> Tuple[bool, Optional[str]]:
    """
    Validate RBAC permissions from token claims.

    Args:
        claims: Token claims dictionary
        required_role: Optional role required for the operation

    Returns:
        Tuple of (is_authorized, error_message)
    """
    if not required_role:
        return True, None

    user_roles = claims.get('roles', [])
    if isinstance(user_roles, str):
        user_roles = [user_roles]

    # Admin always authorized
    if 'admin' in user_roles:
        return True, None

    # security_lead has elevated access
    if 'security_lead' in user_roles and required_role in ['security_analyst', 'intel_analyst', 'developer']:
        return True, None

    if required_role not in user_roles:
        return False, f'Role "{required_role}" required, user has: {", ".join(user_roles)}'

    return True, None


def print_auth_failure(error: str) -> None:
    """Print formatted authentication failure message."""
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: AUTHENTICATION REQUIRED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\n{error}", file=sys.stderr)
    print(f"\nTo authenticate:", file=sys.stderr)
    print(f"  1. Generate a token:", file=sys.stderr)
    print(f"     node _bmad/core/security/quick-token.js \"YourName\" \"role\" 168", file=sys.stderr)
    print(f"", file=sys.stderr)
    print(f"  2. Or set environment variable:", file=sys.stderr)
    print(f"     export BMAD_AUTH_TOKEN=<your-token>", file=sys.stderr)
    print(f"", file=sys.stderr)
    print(f"  3. Validate your token:", file=sys.stderr)
    print(f"     node _bmad/core/security/validate-token.js", file=sys.stderr)
    print(f"\nTo disable enforcement (NOT RECOMMENDED for production):", file=sys.stderr)
    print(f"  export BMAD_TOKEN_REQUIRED=false", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)


def main():
    """Main entry point for SessionStart hook."""

    # Check if already validated recently (performance optimization)
    if is_session_recently_validated():
        cached_claims = get_cached_claims()
        if cached_claims:
            AuditLogger.log(VALIDATOR_NAME, 'CACHED',
                           {'reason': 'Session recently validated',
                            'user': cached_claims.get('name', 'unknown')},
                           severity='INFO')
            sys.exit(0)

    # Validate token
    is_valid, error, claims = validate_token()

    if not is_valid:
        AuditLogger.log_blocked(VALIDATOR_NAME, error, 'session_start',
                               {'action': 'authentication_failed'})
        print_auth_failure(error)
        sys.exit(2)

    # Check for enforcement disabled
    if claims.get('enforcement_disabled'):
        print(f"  [!!] Token enforcement DISABLED - running without authentication",
              file=sys.stderr)
        mark_session_validated()
        save_session_claims({'enforcement_disabled': True, 'roles': ['guest']})
        sys.exit(0)

    # Log successful authentication
    user_name = claims.get('name', 'unknown')
    user_roles = claims.get('roles', [])
    if isinstance(user_roles, str):
        user_roles = [user_roles]

    AuditLogger.log(VALIDATOR_NAME, 'AUTHENTICATED',
                   {'user': user_name, 'roles': user_roles},
                   severity='INFO')

    # Mark session as validated and save claims
    mark_session_validated()
    save_session_claims(claims)

    print(f"  [OK] Session authenticated: {user_name} (roles: {', '.join(user_roles)})",
          file=sys.stderr)
    sys.exit(0)


if __name__ == '__main__':
    main()
