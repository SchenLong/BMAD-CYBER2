#!/usr/bin/env python3
"""
BMAD Guardrails: Common Security Utilities
===========================================
Shared utilities for all security validators including:
- Audit logging
- Single-use override management with timeout (TOCTOU-safe)
- Common path resolution
- Session validation

This module provides the foundation for consistent security enforcement
across all BMAD guardrail validators.

Security Note:
    The OverrideManager uses atomic file locking to prevent TOCTOU
    (Time-of-Check-Time-of-Use) race conditions. All read-modify-write
    operations are performed under exclusive lock.
"""

import json
import os
import sys
import time
import fcntl
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, Tuple

# Import telemetry collector (graceful fallback if not available)
try:
    from telemetry_collector import record_security_event as _record_telemetry
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    def _record_telemetry(*args, **kwargs):
        pass  # No-op if telemetry not available

# Import audit integrity (graceful fallback if not available)
try:
    from audit_integrity import add_chain_fields as _add_chain_fields
    CHAIN_SIGNING_AVAILABLE = True
except ImportError:
    CHAIN_SIGNING_AVAILABLE = False
    def _add_chain_fields(entry):
        return entry  # No-op if chain signing not available

# Import anomaly detector (graceful fallback if not available)
try:
    from anomaly_detector import record_security_event_for_anomaly as _record_anomaly
    ANOMALY_DETECTION_AVAILABLE = True
except ImportError:
    ANOMALY_DETECTION_AVAILABLE = False
    def _record_anomaly(*args, **kwargs):
        return []  # No-op if anomaly detection not available

# Configuration
PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')
OVERRIDE_FILE = os.path.join(PROJECT_DIR, '.claude', '.override_state.json')
OVERRIDE_LOCK_FILE = os.path.join(PROJECT_DIR, '.claude', '.override.lock')
OVERRIDE_TIMEOUT_SECONDS = 300  # 5 minutes
LOCK_TIMEOUT_SECONDS = 5.0  # Max wait for lock acquisition

# Ensure log directory exists
os.makedirs(LOG_DIR, exist_ok=True)


class AuditLogger:
    """
    Secure audit logging for all security events.

    Logs are written to .claude/logs/security.log with timestamps,
    validator name, action taken, and relevant details.
    """

    LOG_FILE = os.path.join(LOG_DIR, 'security.log')
    MAX_LOG_SIZE = 10 * 1024 * 1024  # 10MB before rotation

    @classmethod
    def _rotate_if_needed(cls):
        """Rotate log file if it exceeds max size."""
        try:
            if os.path.exists(cls.LOG_FILE):
                size = os.path.getsize(cls.LOG_FILE)
                if size > cls.MAX_LOG_SIZE:
                    # Rotate: rename current to .old, truncate current
                    old_log = cls.LOG_FILE + '.old'
                    if os.path.exists(old_log):
                        os.remove(old_log)
                    os.rename(cls.LOG_FILE, old_log)
        except Exception:
            pass  # Don't fail validation due to log rotation issues

    @classmethod
    def log(cls, validator: str, action: str, details: Dict[str, Any],
            severity: str = 'INFO') -> None:
        """
        Log a security event.

        Args:
            validator: Name of the validator (e.g., 'bash_safety')
            action: Action taken (e.g., 'BLOCKED', 'ALLOWED', 'OVERRIDE_USED')
            details: Dictionary of relevant details
            severity: Log level (INFO, WARNING, BLOCKED, CRITICAL)
        """
        cls._rotate_if_needed()

        timestamp = datetime.now().isoformat()
        session_id = os.environ.get('CLAUDE_SESSION_ID', 'unknown')

        log_entry = {
            'timestamp': timestamp,
            'session_id': session_id,
            'validator': validator,
            'severity': severity,
            'action': action,
            'details': details
        }

        # Add cryptographic hash chain fields for tamper detection
        if CHAIN_SIGNING_AVAILABLE:
            log_entry = _add_chain_fields(log_entry)

        try:
            with open(cls.LOG_FILE, 'a') as f:
                # Use file locking for concurrent access
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                try:
                    f.write(json.dumps(log_entry) + '\n')
                finally:
                    fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except Exception as e:
            # Log to stderr if file logging fails
            print(f"AUDIT LOG (file write failed): {json.dumps(log_entry)}", file=sys.stderr)

        # Also emit telemetry for external analysis
        if TELEMETRY_AVAILABLE:
            target = details.get('target', details.get('command', details.get('file', '')))
            reason = details.get('reason', '')
            _record_telemetry(
                validator=validator,
                action=action,
                severity=severity,
                target=str(target),
                reason=str(reason),
                metadata={k: v for k, v in details.items() if k not in ['target', 'reason', 'command', 'file']}
            )

        # Record for anomaly detection
        if ANOMALY_DETECTION_AVAILABLE:
            # Extract operation type from validator name or details
            operation_type = details.get('tool_name', validator.replace('_guard', '').replace('_safety', ''))
            _record_anomaly(
                operation_type=operation_type,
                validator=validator,
                action=action,
                severity=severity
            )

    @classmethod
    def log_blocked(cls, validator: str, reason: str, command_or_file: str,
                    additional: Optional[Dict] = None) -> None:
        """Convenience method for logging blocked operations."""
        details = {
            'reason': reason,
            'target': command_or_file[:500],  # Truncate very long commands
        }
        if additional:
            details.update(additional)
        cls.log(validator, 'BLOCKED', details, severity='BLOCKED')

    @classmethod
    def log_allowed(cls, validator: str, reason: str = 'Passed all checks',
                    additional: Optional[Dict] = None) -> None:
        """Convenience method for logging allowed operations."""
        details = {'reason': reason}
        if additional:
            details.update(additional)
        cls.log(validator, 'ALLOWED', details, severity='INFO')

    @classmethod
    def log_override_used(cls, validator: str, override_var: str,
                          command_or_file: str) -> None:
        """Log when an override is used (consumes single-use overrides)."""
        details = {
            'override_variable': override_var,
            'target': command_or_file[:500],
        }
        cls.log(validator, 'OVERRIDE_USED', details, severity='WARNING')


class OverrideManager:
    """
    Manages single-use override tokens with timeout.
    Uses atomic file locking to prevent TOCTOU race conditions.

    Instead of allowing global environment variables to persist indefinitely,
    this manager creates time-limited, single-use override tokens.

    Override workflow:
    1. User sets BMAD_ALLOW_<TYPE>=true
    2. First validator to check consumes the override (atomic)
    3. Override becomes invalid after use OR after timeout

    Security Note:
        All read-modify-write operations are performed under exclusive
        file lock to prevent race conditions where multiple processes
        could consume the same override.
    """

    @classmethod
    def _acquire_lock(cls, timeout: float = LOCK_TIMEOUT_SECONDS) -> int:
        """
        Acquire exclusive lock with timeout.

        Args:
            timeout: Maximum seconds to wait for lock

        Returns:
            File descriptor for the lock

        Raises:
            TimeoutError: If lock cannot be acquired within timeout
        """
        os.makedirs(os.path.dirname(OVERRIDE_LOCK_FILE), exist_ok=True)
        fd = os.open(OVERRIDE_LOCK_FILE, os.O_CREAT | os.O_RDWR)

        start_time = time.time()
        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fd
            except BlockingIOError:
                if time.time() - start_time > timeout:
                    os.close(fd)
                    raise TimeoutError(f"Could not acquire override lock within {timeout}s")
                time.sleep(0.05)  # 50ms sleep between retries

    @classmethod
    def _release_lock(cls, fd: int) -> None:
        """Release exclusive lock and close file descriptor."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    @classmethod
    def _load_state(cls) -> Dict:
        """Load override state from file (must be called under lock)."""
        try:
            if os.path.exists(OVERRIDE_FILE):
                with open(OVERRIDE_FILE, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return {'overrides': {}, 'created_at': {}}

    @classmethod
    def _save_state_atomic(cls, state: Dict) -> None:
        """
        Save state atomically using temp file + rename.
        This ensures partial writes never corrupt the state file.
        Must be called under lock.
        """
        state['last_update'] = time.time()

        dir_name = os.path.dirname(OVERRIDE_FILE)
        os.makedirs(dir_name, exist_ok=True)

        fd, temp_path = tempfile.mkstemp(dir=dir_name, prefix='.override_')
        try:
            with os.fdopen(fd, 'w') as f:
                json.dump(state, f)

            # Atomic rename (POSIX guarantees atomicity on same filesystem)
            os.rename(temp_path, OVERRIDE_FILE)

        except Exception:
            # Clean up temp file on error
            try:
                os.unlink(temp_path)
            except OSError:
                pass
            raise

    @classmethod
    def _cleanup_expired(cls, state: Dict) -> Dict:
        """Remove expired overrides from state (must be called under lock)."""
        current_time = time.time()
        expired = []

        for key, created_at in state.get('created_at', {}).items():
            if current_time - created_at > OVERRIDE_TIMEOUT_SECONDS:
                expired.append(key)

        for key in expired:
            state['overrides'].pop(key, None)
            state['created_at'].pop(key, None)

        return state

    @classmethod
    def register_override(cls, override_type: str) -> None:
        """
        Register an override from environment variable (atomic).
        Called when env var is detected but not yet consumed.
        """
        lock_fd = None
        try:
            lock_fd = cls._acquire_lock()

            state = cls._load_state()
            state = cls._cleanup_expired(state)

            state['overrides'][override_type] = True
            state['created_at'][override_type] = time.time()

            cls._save_state_atomic(state)

        except TimeoutError as e:
            AuditLogger.log('override_manager', 'LOCK_TIMEOUT',
                          {'override_type': override_type, 'action': 'register', 'error': str(e)},
                          severity='WARNING')
        finally:
            if lock_fd is not None:
                cls._release_lock(lock_fd)

    @classmethod
    def check_and_consume_override(cls, override_type: str) -> Tuple[bool, str]:
        """
        Check if override is available and consume it atomically.

        Uses exclusive file locking to prevent race conditions where
        multiple concurrent processes could consume the same override.

        Returns:
            Tuple of (is_valid, reason)
            - is_valid: True if override was available and consumed
            - reason: Description of what happened
        """
        # First check environment variable (fast path)
        env_var = f'BMAD_ALLOW_{override_type.upper()}'
        env_value = os.environ.get(env_var, '').lower()

        if env_value != 'true':
            return False, 'Override not set'

        lock_fd = None
        try:
            # Acquire exclusive lock BEFORE any state operations
            lock_fd = cls._acquire_lock(timeout=LOCK_TIMEOUT_SECONDS)

            # Now safely perform read-modify-write
            state = cls._load_state()
            state = cls._cleanup_expired(state)

            # Check if this is a new override (from env) or existing token
            if override_type not in state.get('overrides', {}):
                # New override from environment - register and consume atomically
                state['overrides'][override_type] = False  # Mark as consumed
                state['created_at'][override_type] = time.time()
                cls._save_state_atomic(state)
                return True, f'Override {env_var} consumed (single-use)'

            # Check if already consumed
            if not state['overrides'].get(override_type, False):
                return False, f'Override {env_var} already consumed - set again for new operation'

            # Consume the override atomically
            state['overrides'][override_type] = False
            cls._save_state_atomic(state)

            return True, f'Override {env_var} consumed (single-use)'

        except TimeoutError as e:
            AuditLogger.log('override_manager', 'LOCK_TIMEOUT',
                          {'override_type': override_type, 'error': str(e)},
                          severity='WARNING')
            return False, 'Override system busy, please retry'

        finally:
            if lock_fd is not None:
                cls._release_lock(lock_fd)

    @classmethod
    def get_override_status(cls) -> Dict[str, Any]:
        """Get current status of all overrides (for debugging/admin)."""
        lock_fd = None
        try:
            lock_fd = cls._acquire_lock(timeout=1.0)  # Short timeout for status check

            state = cls._load_state()
            state = cls._cleanup_expired(state)

            status = {}
            current_time = time.time()

            for key, available in state.get('overrides', {}).items():
                created_at = state.get('created_at', {}).get(key, 0)
                remaining = max(0, OVERRIDE_TIMEOUT_SECONDS - (current_time - created_at))

                status[key] = {
                    'available': available,
                    'seconds_remaining': int(remaining),
                    'expired': remaining == 0
                }

            return status

        except TimeoutError:
            return {'error': 'Could not acquire lock for status check'}

        finally:
            if lock_fd is not None:
                cls._release_lock(lock_fd)


def resolve_path(path: str, cwd: str) -> str:
    """
    Resolve a path to its absolute, canonical form.

    Handles:
    - ~ expansion
    - Relative paths
    - Symlink resolution
    """
    if not path:
        return ''

    # Expand ~ to home directory
    path = os.path.expanduser(path)

    # If relative, make it absolute based on cwd
    if not os.path.isabs(path):
        path = os.path.join(cwd, path)

    # Resolve symlinks and normalize
    try:
        return os.path.realpath(path)
    except Exception:
        return os.path.abspath(path)


def is_path_in_repo(path: str, cwd: str, project_dir: str = PROJECT_DIR) -> bool:
    """Check if a path is within the repository."""
    if not path:
        return True  # No path means we can't check, allow

    resolved = resolve_path(path, cwd)
    repo_resolved = os.path.realpath(project_dir)

    return resolved.startswith(repo_resolved + os.sep) or resolved == repo_resolved


def get_tool_input_from_stdin() -> Dict[str, Any]:
    """
    Read tool input from stdin (JSON format from Claude Code).

    Returns a dictionary with common fields:
    - tool_name: Name of the tool being used
    - tool_input: The tool's input parameters
    - cwd: Current working directory
    """
    try:
        data = json.load(sys.stdin)
        return {
            'tool_name': data.get('tool_name', ''),
            'tool_input': data.get('tool_input', {}),
            'cwd': data.get('cwd', PROJECT_DIR),
            'raw': data
        }
    except (json.JSONDecodeError, KeyError):
        return {
            'tool_name': '',
            'tool_input': {},
            'cwd': PROJECT_DIR,
            'raw': {}
        }


def print_block_message(title: str, message: str, command_or_file: str,
                        override_var: Optional[str] = None,
                        recommendations: Optional[list] = None,
                        is_absolute: bool = False) -> None:
    """
    Print a standardized block message to stderr.

    Args:
        title: Block type (e.g., "ABSOLUTE BLOCK", "STRICT BLOCK")
        message: Main message explaining what was blocked
        command_or_file: The command or file that was blocked
        override_var: Environment variable for override (if applicable)
        recommendations: List of recommendation strings
        is_absolute: If True, indicates no override is possible
    """
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"BMAD GUARDRAIL: {title}", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\n{message}", file=sys.stderr)
    print(f"\nTarget: {command_or_file[:200]}", file=sys.stderr)

    if recommendations:
        print(f"\n{'='*60}", file=sys.stderr)
        print(f"RECOMMENDATIONS:", file=sys.stderr)
        for rec in recommendations:
            print(f"  - {rec}", file=sys.stderr)

    if is_absolute:
        print(f"\nThis operation is BLOCKED and cannot be overridden.", file=sys.stderr)
    elif override_var:
        print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
        print(f"  export {override_var}=true", file=sys.stderr)
        print(f"\nNote: Override must be set again for each operation.", file=sys.stderr)

    print(f"{'='*60}\n", file=sys.stderr)


# Session initialization validation
def validate_session_security() -> Tuple[bool, list]:
    """
    Validate that all security components are properly configured.

    Returns:
        Tuple of (all_valid, list_of_issues)
    """
    issues = []
    validators_dir = os.path.join(PROJECT_DIR, '.claude', 'validators')

    # Check validators exist
    required_validators = [
        'bash_safety.py',
        'secret_guard.py',
        'env_protection.py',
        'production_guard.py',
        'outside_repo_guard.py',
        'pii_guard.py',
        'prompt_injection_guard.py',
        'jailbreak_guard.py',
    ]

    for validator in required_validators:
        path = os.path.join(validators_dir, validator)
        if not os.path.exists(path):
            issues.append(f"Missing validator: {validator}")
        elif not os.access(path, os.R_OK):
            issues.append(f"Validator not readable: {validator}")

    # Check for dangerous environment variables
    dangerous_env_vars = [
        ('BMAD_ALLOW_DANGEROUS', 'Dangerous operations override is set'),
        ('BMAD_ALLOW_SECRETS', 'Secrets override is set'),
        ('BMAD_ALLOW_PRODUCTION', 'Production override is set'),
        ('BMAD_ALLOW_OUTSIDE_REPO', 'Outside repo override is set'),
        ('BMAD_ALLOW_SENSITIVE_FILES', 'Sensitive files override is set'),
        ('BMAD_ALLOW_PII', 'PII detection override is set'),
        ('BMAD_ALLOW_INJECTION_CONTENT', 'Prompt injection content override is set'),
        ('BMAD_ALLOW_JAILBREAK', 'Jailbreak detection override is set'),
    ]

    for env_var, warning in dangerous_env_vars:
        if os.environ.get(env_var, '').lower() == 'true':
            issues.append(f"WARNING: {warning} ({env_var}=true)")

    # Check log directory is writable
    if not os.access(LOG_DIR, os.W_OK):
        issues.append(f"Log directory not writable: {LOG_DIR}")

    return len([i for i in issues if not i.startswith('WARNING')]) == 0, issues
