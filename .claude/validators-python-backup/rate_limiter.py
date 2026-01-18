#!/usr/bin/env python3
"""
BMAD Guardrails: Rate Limiter
==============================
Implements sliding window rate limiting to prevent resource exhaustion attacks.

Features:
- Sliding window algorithm for accurate rate limiting
- Per-operation type limits (Bash, Write, Edit, Read)
- Global session limits
- Exponential backoff on limit breach
- Whitelist bypass for critical operations
- Full audit logging integration

OWASP Reference: LLM04 - Model Denial of Service
Requirement: REQ-1.1.1 through REQ-1.1.6

Usage:
    from rate_limiter import RateLimiter, check_rate_limit

    allowed, message = check_rate_limit('bash', 'ls -la')
    if not allowed:
        print(f"Rate limited: {message}")
"""

import json
import os
import sys
import time
import fcntl
import tempfile
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime

# Import shared security utilities
try:
    from security_common import (
        AuditLogger,
        PROJECT_DIR,
        LOG_DIR,
    )
except ImportError:
    # Fallback for direct execution
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')

    class AuditLogger:
        @classmethod
        def log(cls, validator: str, action: str, details: Dict, severity: str = 'INFO'):
            timestamp = datetime.now().isoformat()
            entry = {'timestamp': timestamp, 'validator': validator, 'action': action,
                     'details': details, 'severity': severity}
            print(f"AUDIT: {json.dumps(entry)}", file=sys.stderr)

# Import telemetry collector (graceful fallback)
try:
    from telemetry_collector import record_rate_limit_metrics, record_security_event
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    def record_rate_limit_metrics(*args, **kwargs): pass
    def record_security_event(*args, **kwargs): pass


# ============================================================================
# Configuration
# ============================================================================

# Rate limit state file (persists across validator invocations)
RATE_STATE_FILE = os.path.join(PROJECT_DIR, '.claude', '.rate_limit_state.json')
RATE_LOCK_FILE = os.path.join(PROJECT_DIR, '.claude', '.rate_limit.lock')

# Window size in seconds
WINDOW_SECONDS = 60

# Rate limits per operation type (requests per minute)
RATE_LIMITS: Dict[str, Dict[str, int]] = {
    'global': {'requests': 150, 'window_seconds': 60},
    'bash': {'requests': 60, 'window_seconds': 60},
    'write': {'requests': 100, 'window_seconds': 60},
    'edit': {'requests': 100, 'window_seconds': 60},
    'read': {'requests': 400, 'window_seconds': 60},
    'glob': {'requests': 200, 'window_seconds': 60},
    'grep': {'requests': 200, 'window_seconds': 60},
    'task': {'requests': 40, 'window_seconds': 60},
    'webfetch': {'requests': 30, 'window_seconds': 60},
    'websearch': {'requests': 20, 'window_seconds': 60},
}

# Operations that bypass rate limiting (critical system operations)
WHITELIST_OPERATIONS = {
    'read': [
        # Allow reading config files without rate limit
        '.claude/settings.json',
        '.claude/validators/',
        'CLAUDE.md',
    ],
    'bash': [
        # Allow git status checks
        'git status',
        'git log',
        'git diff',
    ],
}

# Exponential backoff configuration
BACKOFF_BASE_SECONDS = 1
BACKOFF_MAX_SECONDS = 60
BACKOFF_MULTIPLIER = 2

# Lock timeout
LOCK_TIMEOUT_SECONDS = 5.0


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class RequestRecord:
    """A single request record in the sliding window."""
    timestamp: float
    operation: str
    target: str = ""


@dataclass
class RateLimitState:
    """Persistent state for rate limiting."""
    requests: Dict[str, List[Dict]] = field(default_factory=lambda: defaultdict(list))
    violations: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    backoff_until: Dict[str, float] = field(default_factory=lambda: defaultdict(float))
    last_cleanup: float = 0.0


# ============================================================================
# Rate Limiter Implementation
# ============================================================================

class RateLimiter:
    """
    Sliding window rate limiter with per-operation limits.

    Uses file-based state persistence and file locking for concurrent access.
    Implements exponential backoff on repeated violations.
    """

    def __init__(self):
        self.state_file = RATE_STATE_FILE
        self.lock_file = RATE_LOCK_FILE
        self._ensure_dirs()

    def _ensure_dirs(self) -> None:
        """Ensure state directory exists."""
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)

    def _acquire_lock(self, timeout: float = LOCK_TIMEOUT_SECONDS) -> int:
        """Acquire exclusive file lock with timeout."""
        fd = os.open(self.lock_file, os.O_CREAT | os.O_RDWR)
        start_time = time.time()

        while True:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fd
            except BlockingIOError:
                if time.time() - start_time > timeout:
                    os.close(fd)
                    raise TimeoutError(f"Could not acquire rate limit lock within {timeout}s")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release file lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _load_state(self) -> Dict[str, Any]:
        """Load rate limit state from file."""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
        return {
            'requests': {},
            'violations': {},
            'backoff_until': {},
            'last_cleanup': 0.0
        }

    def _save_state(self, state: Dict[str, Any]) -> None:
        """Save state atomically using temp file + rename."""
        dir_name = os.path.dirname(self.state_file)
        fd, temp_path = tempfile.mkstemp(dir=dir_name, prefix='.rate_')
        try:
            with os.fdopen(fd, 'w') as f:
                json.dump(state, f)
            os.rename(temp_path, self.state_file)
        except Exception:
            try:
                os.unlink(temp_path)
            except OSError:
                pass
            raise

    def _cleanup_old_requests(self, state: Dict[str, Any], current_time: float) -> Dict[str, Any]:
        """Remove requests outside the sliding window."""
        # Only cleanup every 10 seconds to reduce overhead
        if current_time - state.get('last_cleanup', 0) < 10:
            return state

        window_start = current_time - WINDOW_SECONDS

        for operation in list(state.get('requests', {}).keys()):
            state['requests'][operation] = [
                req for req in state['requests'][operation]
                if req.get('timestamp', 0) > window_start
            ]
            # Remove empty lists
            if not state['requests'][operation]:
                del state['requests'][operation]

        # Clear old backoff entries
        for operation in list(state.get('backoff_until', {}).keys()):
            if state['backoff_until'][operation] < current_time:
                del state['backoff_until'][operation]

        state['last_cleanup'] = current_time
        return state

    def _is_whitelisted(self, operation: str, target: str) -> bool:
        """Check if operation/target combination is whitelisted."""
        if operation not in WHITELIST_OPERATIONS:
            return False

        whitelist = WHITELIST_OPERATIONS[operation]
        for pattern in whitelist:
            if pattern in target:
                return True
        return False

    def _get_requests_in_window(self, state: Dict[str, Any], operation: str,
                                 current_time: float) -> int:
        """Count requests within the sliding window."""
        window_start = current_time - WINDOW_SECONDS
        requests = state.get('requests', {}).get(operation, [])
        return len([r for r in requests if r.get('timestamp', 0) > window_start])

    def _calculate_backoff(self, violations: int) -> float:
        """Calculate exponential backoff duration."""
        backoff = BACKOFF_BASE_SECONDS * (BACKOFF_MULTIPLIER ** min(violations, 10))
        return min(backoff, BACKOFF_MAX_SECONDS)

    def check_limit(self, operation: str, target: str = "") -> Tuple[bool, Optional[str]]:
        """
        Check if operation is within rate limit.

        Args:
            operation: Operation type (bash, write, edit, read, etc.)
            target: Target of operation (file path, command, etc.)

        Returns:
            Tuple of (allowed, message)
            - allowed: True if operation is allowed
            - message: Explanation if blocked, None if allowed
        """
        operation = operation.lower()
        current_time = time.time()

        # Check whitelist
        if self._is_whitelisted(operation, target):
            return True, None

        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()
            state = self._cleanup_old_requests(state, current_time)

            # Check backoff
            backoff_until = state.get('backoff_until', {}).get(operation, 0)
            if current_time < backoff_until:
                remaining = int(backoff_until - current_time)
                return False, f"Rate limit backoff active. Retry in {remaining} seconds."

            # Check global limit
            global_count = sum(
                len([r for r in reqs if r.get('timestamp', 0) > current_time - WINDOW_SECONDS])
                for reqs in state.get('requests', {}).values()
            )
            global_limit = RATE_LIMITS['global']['requests']
            if global_count >= global_limit:
                self._handle_violation(state, 'global', current_time)
                self._save_state(state)
                return False, f"Global rate limit exceeded ({global_count}/{global_limit} per minute)"

            # Check operation-specific limit
            if operation in RATE_LIMITS:
                op_limit = RATE_LIMITS[operation]['requests']
                op_count = self._get_requests_in_window(state, operation, current_time)

                if op_count >= op_limit:
                    self._handle_violation(state, operation, current_time)
                    self._save_state(state)
                    retry_after = self.get_retry_after(operation, state, current_time)
                    return False, f"Rate limit exceeded for {operation} ({op_count}/{op_limit} per minute). Retry in {retry_after}s."

            self._save_state(state)
            return True, None

        except TimeoutError as e:
            AuditLogger.log('rate_limiter', 'LOCK_TIMEOUT',
                          {'operation': operation, 'error': str(e)}, severity='WARNING')
            # Allow operation if lock fails (fail open for availability)
            return True, None
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def _handle_violation(self, state: Dict[str, Any], operation: str,
                          current_time: float) -> None:
        """Handle rate limit violation - increment counter and set backoff."""
        if 'violations' not in state:
            state['violations'] = {}
        if 'backoff_until' not in state:
            state['backoff_until'] = {}

        violations = state['violations'].get(operation, 0) + 1
        state['violations'][operation] = violations

        backoff_duration = self._calculate_backoff(violations)
        state['backoff_until'][operation] = current_time + backoff_duration

        AuditLogger.log('rate_limiter', 'RATE_LIMIT_EXCEEDED', {
            'operation': operation,
            'violations': violations,
            'backoff_seconds': backoff_duration,
        }, severity='WARNING')

        # Emit telemetry for rate limit metrics
        if TELEMETRY_AVAILABLE:
            op_limit = RATE_LIMITS.get(operation, RATE_LIMITS['global'])['requests']
            op_count = self._get_requests_in_window(state, operation, current_time)
            record_rate_limit_metrics(
                operation_type=operation,
                requests_count=op_count,
                limit=op_limit,
                window_seconds=WINDOW_SECONDS,
                window_remaining_s=0,
                backoff_active=True,
                backoff_remaining_s=int(backoff_duration),
                backoff_multiplier=BACKOFF_MULTIPLIER ** min(violations, 10)
            )

    def record_request(self, operation: str, target: str = "") -> None:
        """
        Record a request for rate limiting.

        Args:
            operation: Operation type
            target: Target of operation
        """
        operation = operation.lower()
        current_time = time.time()

        # Don't record whitelisted operations
        if self._is_whitelisted(operation, target):
            return

        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            if 'requests' not in state:
                state['requests'] = {}
            if operation not in state['requests']:
                state['requests'][operation] = []

            state['requests'][operation].append({
                'timestamp': current_time,
                'target': target[:200] if target else ""  # Truncate long targets
            })

            self._save_state(state)

        except TimeoutError:
            pass  # Skip recording if lock unavailable
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def get_retry_after(self, operation: str, state: Optional[Dict] = None,
                        current_time: Optional[float] = None) -> int:
        """
        Get seconds until rate limit resets for an operation.

        Args:
            operation: Operation type
            state: Optional pre-loaded state
            current_time: Optional current timestamp

        Returns:
            Seconds until rate limit resets
        """
        operation = operation.lower()
        if current_time is None:
            current_time = time.time()

        if state is None:
            state = self._load_state()

        # Check backoff first
        backoff_until = state.get('backoff_until', {}).get(operation, 0)
        if current_time < backoff_until:
            return int(backoff_until - current_time)

        # Calculate when oldest request in window will expire
        requests = state.get('requests', {}).get(operation, [])
        if not requests:
            return 0

        window_start = current_time - WINDOW_SECONDS
        requests_in_window = [r for r in requests if r.get('timestamp', 0) > window_start]

        if not requests_in_window:
            return 0

        oldest_timestamp = min(r.get('timestamp', 0) for r in requests_in_window)
        return max(0, int(oldest_timestamp + WINDOW_SECONDS - current_time))

    def get_status(self) -> Dict[str, Any]:
        """Get current rate limit status for monitoring."""
        current_time = time.time()
        state = self._load_state()
        state = self._cleanup_old_requests(state, current_time)

        status = {}
        for operation, limits in RATE_LIMITS.items():
            count = self._get_requests_in_window(state, operation, current_time)
            limit = limits['requests']
            violations = state.get('violations', {}).get(operation, 0)
            backoff_until = state.get('backoff_until', {}).get(operation, 0)

            status[operation] = {
                'current': count,
                'limit': limit,
                'percentage': round((count / limit) * 100, 1) if limit > 0 else 0,
                'violations': violations,
                'backoff_active': current_time < backoff_until,
                'backoff_remaining': max(0, int(backoff_until - current_time)),
            }

        return status

    def reset(self, operation: Optional[str] = None) -> None:
        """
        Reset rate limit state.

        Args:
            operation: Specific operation to reset, or None for all
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            if operation:
                operation = operation.lower()
                state.get('requests', {}).pop(operation, None)
                state.get('violations', {}).pop(operation, None)
                state.get('backoff_until', {}).pop(operation, None)
            else:
                state = {
                    'requests': {},
                    'violations': {},
                    'backoff_until': {},
                    'last_cleanup': time.time()
                }

            self._save_state(state)

            AuditLogger.log('rate_limiter', 'RATE_LIMIT_RESET', {
                'operation': operation or 'all'
            }, severity='INFO')

        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)


# ============================================================================
# Convenience Functions
# ============================================================================

# Global rate limiter instance
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get or create the global rate limiter instance."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter


def check_rate_limit(operation: str, target: str = "") -> Tuple[bool, Optional[str]]:
    """
    Check if an operation is within rate limits.

    Args:
        operation: Operation type (bash, write, edit, read, etc.)
        target: Target of operation (file path, command, etc.)

    Returns:
        Tuple of (allowed, message)
    """
    limiter = get_rate_limiter()
    return limiter.check_limit(operation, target)


def record_operation(operation: str, target: str = "") -> None:
    """Record an operation for rate limiting."""
    limiter = get_rate_limiter()
    limiter.record_request(operation, target)


def get_rate_status() -> Dict[str, Any]:
    """Get current rate limit status."""
    limiter = get_rate_limiter()
    return limiter.get_status()


# ============================================================================
# Hook Integration
# ============================================================================

def validate_rate_limit() -> int:
    """
    Validate rate limit as a pre-tool hook.

    Reads tool invocation from stdin and checks rate limit.

    Returns:
        Exit code: 0 for allowed, 1 for blocked
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        # If we can't parse input, allow the operation
        return 0

    tool_name = data.get('tool_name', '').lower()
    tool_input = data.get('tool_input', {})

    # Map tool names to rate limit categories
    tool_mapping = {
        'bash': 'bash',
        'write': 'write',
        'edit': 'edit',
        'read': 'read',
        'glob': 'glob',
        'grep': 'grep',
        'task': 'task',
        'webfetch': 'webfetch',
        'websearch': 'websearch',
    }

    operation = tool_mapping.get(tool_name)
    if not operation:
        return 0  # Unknown tool, allow

    # Get target for logging/whitelisting
    target = ""
    if operation == 'bash':
        target = tool_input.get('command', '')
    elif operation in ('write', 'edit', 'read'):
        target = tool_input.get('file_path', '')
    elif operation in ('glob', 'grep'):
        target = tool_input.get('pattern', '')

    # Check rate limit
    limiter = get_rate_limiter()
    allowed, message = limiter.check_limit(operation, target)

    if not allowed:
        # Log the block
        AuditLogger.log('rate_limiter', 'BLOCKED', {
            'operation': operation,
            'target': target[:200],
            'message': message,
        }, severity='BLOCKED')

        # Print block message
        print(f"\n{'='*60}", file=sys.stderr)
        print("BMAD GUARDRAIL: RATE LIMIT EXCEEDED", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"\n{message}", file=sys.stderr)
        print(f"\nOperation: {operation}", file=sys.stderr)

        status = limiter.get_status()
        if operation in status:
            op_status = status[operation]
            print(f"Current usage: {op_status['current']}/{op_status['limit']} ({op_status['percentage']}%)", file=sys.stderr)
            if op_status['backoff_active']:
                print(f"Backoff active: {op_status['backoff_remaining']}s remaining", file=sys.stderr)

        print(f"\n{'='*60}\n", file=sys.stderr)

        return 1

    # Record the request
    limiter.record_request(operation, target)
    return 0


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            status = get_rate_status()
            print(json.dumps(status, indent=2))

        elif command == 'reset':
            operation = sys.argv[2] if len(sys.argv) > 2 else None
            limiter = get_rate_limiter()
            limiter.reset(operation)
            print(f"Rate limit reset for: {operation or 'all operations'}")

        elif command == 'validate':
            sys.exit(validate_rate_limit())

        else:
            print(f"Usage: {sys.argv[0]} [status|reset [operation]|validate]")
            sys.exit(1)
    else:
        # Run as validator hook
        sys.exit(validate_rate_limit())
