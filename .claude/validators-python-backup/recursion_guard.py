#!/usr/bin/env python3
"""
BMAD Guardrails: Recursion Guard
=================================
Implements recursion limits to prevent stack overflow and infinite loops.

Features:
- Track recursive operation depth
- Limit directory traversal depth (default: 10)
- Limit nested function calls (default: 20)
- Detect circular references
- Full audit logging integration

OWASP Reference: LLM04 - Model Denial of Service
Requirements: REQ-2.3.1 through REQ-2.3.5

Usage:
    from recursion_guard import RecursionGuard, check_recursion_limit

    guard = RecursionGuard()
    allowed, message = guard.check_depth('directory_traversal', current_depth=5)
"""

import json
import os
import sys
import time
import fcntl
import tempfile
import hashlib
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple, Any
from datetime import datetime
from collections import defaultdict

# Import shared security utilities
try:
    from security_common import (
        AuditLogger,
        PROJECT_DIR,
        LOG_DIR,
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    LOG_DIR = os.path.join(PROJECT_DIR, '.claude', 'logs')

    class AuditLogger:
        @classmethod
        def log(cls, validator: str, action: str, details: Dict, severity: str = 'INFO'):
            timestamp = datetime.now().isoformat()
            entry = {'timestamp': timestamp, 'validator': validator, 'action': action,
                     'details': details, 'severity': severity}
            print(f"AUDIT: {json.dumps(entry)}", file=sys.stderr)


# ============================================================================
# Configuration
# ============================================================================

# State file for tracking recursion
RECURSION_STATE_FILE = os.path.join(PROJECT_DIR, '.claude', '.recursion_state.json')
RECURSION_LOCK_FILE = os.path.join(PROJECT_DIR, '.claude', '.recursion.lock')

# Recursion limits
LIMITS = {
    'directory_traversal': int(os.environ.get('BMAD_MAX_DIR_DEPTH', 10)),
    'nested_calls': int(os.environ.get('BMAD_MAX_NESTED_CALLS', 20)),
    'task_depth': int(os.environ.get('BMAD_MAX_TASK_DEPTH', 5)),
    'include_depth': int(os.environ.get('BMAD_MAX_INCLUDE_DEPTH', 10)),
    'symlink_follows': int(os.environ.get('BMAD_MAX_SYMLINK_FOLLOWS', 5)),
}

# Lock timeout
LOCK_TIMEOUT_SECONDS = 5.0

# State cleanup interval
STATE_CLEANUP_SECONDS = 300  # 5 minutes

# Circular reference detection window
CIRCULAR_WINDOW_SIZE = 50


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class RecursionState:
    """State for tracking recursion within a session."""
    call_stack: List[str] = field(default_factory=list)
    path_history: List[str] = field(default_factory=list)
    depth_counters: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    circular_refs_detected: int = 0
    last_update: float = field(default_factory=time.time)


@dataclass
class RecursionCheckResult:
    """Result of a recursion check."""
    allowed: bool
    reason: str
    recursion_type: str
    current_depth: int
    max_depth: int
    is_circular: bool = False


# ============================================================================
# Recursion Guard Implementation
# ============================================================================

class RecursionGuard:
    """
    Guards against excessive recursion and circular references.

    Tracks operation depth across multiple dimensions and detects
    circular patterns that could indicate infinite loops.
    """

    def __init__(self):
        self.state_file = RECURSION_STATE_FILE
        self.lock_file = RECURSION_LOCK_FILE
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
                    raise TimeoutError(f"Could not acquire recursion lock within {timeout}s")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release file lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _load_state(self) -> Dict[str, Any]:
        """Load recursion state from file."""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    # Check if state is stale
                    last_update = state.get('last_update', 0)
                    if time.time() - last_update > STATE_CLEANUP_SECONDS:
                        return self._initial_state()
                    return state
        except (json.JSONDecodeError, IOError):
            pass
        return self._initial_state()

    def _initial_state(self) -> Dict[str, Any]:
        """Return initial state."""
        return {
            'call_stack': [],
            'path_history': [],
            'depth_counters': {},
            'circular_refs_detected': 0,
            'last_update': time.time(),
            'session_id': os.environ.get('CLAUDE_SESSION_ID', str(int(time.time()))),
        }

    def _save_state(self, state: Dict[str, Any]) -> None:
        """Save state atomically."""
        state['last_update'] = time.time()

        dir_name = os.path.dirname(self.state_file)
        fd, temp_path = tempfile.mkstemp(dir=dir_name, prefix='.recursion_')
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

    def _hash_operation(self, operation: str, target: str) -> str:
        """Create a hash for an operation to track in history."""
        content = f"{operation}:{target}"
        return hashlib.md5(content.encode()).hexdigest()[:16]

    def _detect_circular_pattern(self, history: List[str], new_hash: str) -> Tuple[bool, int]:
        """
        Detect circular patterns in operation history.

        Looks for repeated sequences that could indicate infinite loops.

        Args:
            history: List of operation hashes
            new_hash: Hash of new operation

        Returns:
            Tuple of (is_circular, pattern_length)
        """
        if new_hash not in history:
            return False, 0

        # Find all occurrences
        indices = [i for i, h in enumerate(history) if h == new_hash]

        if len(indices) < 2:
            return False, 0

        # Check for repeating patterns
        for i in range(len(indices) - 1):
            pattern_start = indices[i]
            pattern_end = indices[i + 1]
            pattern_length = pattern_end - pattern_start

            if pattern_length < 2:
                continue

            # Check if pattern repeats
            if pattern_end + pattern_length <= len(history):
                pattern = history[pattern_start:pattern_end]
                next_segment = history[pattern_end:pattern_end + pattern_length]

                if pattern == next_segment:
                    return True, pattern_length

        # Simple check: same operation appearing too frequently
        recent_history = history[-20:] if len(history) > 20 else history
        count = recent_history.count(new_hash)
        if count >= 5:  # Same operation 5+ times in last 20
            return True, 1

        return False, 0

    def check_depth(self, recursion_type: str, current_depth: int = 0,
                    target: str = "") -> RecursionCheckResult:
        """
        Check if current recursion depth is within limits.

        Args:
            recursion_type: Type of recursion (directory_traversal, nested_calls, etc.)
            current_depth: Current depth to check
            target: Target path or identifier for circular detection

        Returns:
            RecursionCheckResult with check details
        """
        max_depth = LIMITS.get(recursion_type, 10)

        # Check depth limit
        if current_depth >= max_depth:
            AuditLogger.log('recursion_guard', 'DEPTH_EXCEEDED', {
                'type': recursion_type,
                'depth': current_depth,
                'max': max_depth,
                'target': target[:200] if target else '',
            }, severity='BLOCKED')

            return RecursionCheckResult(
                allowed=False,
                reason=f"Maximum {recursion_type} depth ({max_depth}) exceeded",
                recursion_type=recursion_type,
                current_depth=current_depth,
                max_depth=max_depth,
            )

        return RecursionCheckResult(
            allowed=True,
            reason="Within recursion limits",
            recursion_type=recursion_type,
            current_depth=current_depth,
            max_depth=max_depth,
        )

    def check_circular(self, operation: str, target: str) -> RecursionCheckResult:
        """
        Check for circular references.

        Args:
            operation: Operation type
            target: Target path or identifier

        Returns:
            RecursionCheckResult indicating if circular reference detected
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            # Get history
            history = state.get('path_history', [])

            # Create hash for this operation
            op_hash = self._hash_operation(operation, target)

            # Check for circular pattern
            is_circular, pattern_length = self._detect_circular_pattern(history, op_hash)

            if is_circular:
                state['circular_refs_detected'] = state.get('circular_refs_detected', 0) + 1
                self._save_state(state)

                AuditLogger.log('recursion_guard', 'CIRCULAR_DETECTED', {
                    'operation': operation,
                    'target': target[:200],
                    'pattern_length': pattern_length,
                    'history_length': len(history),
                }, severity='WARNING')

                return RecursionCheckResult(
                    allowed=False,
                    reason=f"Circular reference detected (pattern length: {pattern_length})",
                    recursion_type='circular',
                    current_depth=len(history),
                    max_depth=CIRCULAR_WINDOW_SIZE,
                    is_circular=True,
                )

            # Add to history (keep last N entries)
            history.append(op_hash)
            state['path_history'] = history[-CIRCULAR_WINDOW_SIZE:]
            self._save_state(state)

            return RecursionCheckResult(
                allowed=True,
                reason="No circular reference detected",
                recursion_type='circular',
                current_depth=len(history),
                max_depth=CIRCULAR_WINDOW_SIZE,
            )

        except TimeoutError:
            return RecursionCheckResult(
                allowed=True,
                reason="Could not check (lock timeout)",
                recursion_type='circular',
                current_depth=0,
                max_depth=CIRCULAR_WINDOW_SIZE,
            )
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def push_call(self, call_id: str) -> RecursionCheckResult:
        """
        Push a call onto the stack and check depth.

        Args:
            call_id: Identifier for the call

        Returns:
            RecursionCheckResult indicating if call is allowed
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            call_stack = state.get('call_stack', [])

            # Check depth
            max_depth = LIMITS['nested_calls']
            if len(call_stack) >= max_depth:
                return RecursionCheckResult(
                    allowed=False,
                    reason=f"Maximum nested call depth ({max_depth}) exceeded",
                    recursion_type='nested_calls',
                    current_depth=len(call_stack),
                    max_depth=max_depth,
                )

            # Check for circular call
            if call_id in call_stack:
                state['circular_refs_detected'] = state.get('circular_refs_detected', 0) + 1
                self._save_state(state)

                return RecursionCheckResult(
                    allowed=False,
                    reason=f"Circular call detected: {call_id}",
                    recursion_type='nested_calls',
                    current_depth=len(call_stack),
                    max_depth=max_depth,
                    is_circular=True,
                )

            # Push call
            call_stack.append(call_id)
            state['call_stack'] = call_stack
            self._save_state(state)

            return RecursionCheckResult(
                allowed=True,
                reason="Call allowed",
                recursion_type='nested_calls',
                current_depth=len(call_stack),
                max_depth=max_depth,
            )

        except TimeoutError:
            return RecursionCheckResult(
                allowed=True,
                reason="Could not check (lock timeout)",
                recursion_type='nested_calls',
                current_depth=0,
                max_depth=LIMITS['nested_calls'],
            )
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def pop_call(self, call_id: str) -> None:
        """
        Pop a call from the stack.

        Args:
            call_id: Identifier for the call to pop
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            call_stack = state.get('call_stack', [])
            if call_id in call_stack:
                call_stack.remove(call_id)
                state['call_stack'] = call_stack
                self._save_state(state)

        except TimeoutError:
            pass
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def check_directory_depth(self, path: str, base_path: str = PROJECT_DIR) -> RecursionCheckResult:
        """
        Check if directory traversal depth is within limits.

        Args:
            path: Path being accessed
            base_path: Base path to calculate relative depth from

        Returns:
            RecursionCheckResult with depth check details
        """
        try:
            # Normalize paths
            path = os.path.normpath(os.path.abspath(path))
            base_path = os.path.normpath(os.path.abspath(base_path))

            # Calculate depth
            rel_path = os.path.relpath(path, base_path)
            depth = len(rel_path.split(os.sep))

            # Don't count parent references
            if rel_path.startswith('..'):
                depth = 0

            return self.check_depth('directory_traversal', depth, path)

        except Exception as e:
            return RecursionCheckResult(
                allowed=True,
                reason=f"Could not calculate depth: {e}",
                recursion_type='directory_traversal',
                current_depth=0,
                max_depth=LIMITS['directory_traversal'],
            )

    def check_symlink_depth(self, path: str) -> RecursionCheckResult:
        """
        Check symlink following depth.

        Args:
            path: Path that may contain symlinks

        Returns:
            RecursionCheckResult with symlink depth check
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            counters = state.get('depth_counters', {})
            symlink_count = counters.get('symlinks', 0)

            # Check if this path involves a symlink
            if os.path.islink(path):
                symlink_count += 1
                counters['symlinks'] = symlink_count
                state['depth_counters'] = counters
                self._save_state(state)

            max_follows = LIMITS['symlink_follows']
            if symlink_count > max_follows:
                return RecursionCheckResult(
                    allowed=False,
                    reason=f"Maximum symlink follows ({max_follows}) exceeded",
                    recursion_type='symlink_follows',
                    current_depth=symlink_count,
                    max_depth=max_follows,
                )

            return RecursionCheckResult(
                allowed=True,
                reason="Symlink depth within limits",
                recursion_type='symlink_follows',
                current_depth=symlink_count,
                max_depth=max_follows,
            )

        except TimeoutError:
            return RecursionCheckResult(
                allowed=True,
                reason="Could not check (lock timeout)",
                recursion_type='symlink_follows',
                current_depth=0,
                max_depth=LIMITS['symlink_follows'],
            )
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def get_status(self) -> Dict[str, Any]:
        """Get current recursion guard status."""
        try:
            state = self._load_state()
            return {
                'call_stack_depth': len(state.get('call_stack', [])),
                'path_history_length': len(state.get('path_history', [])),
                'circular_refs_detected': state.get('circular_refs_detected', 0),
                'depth_counters': state.get('depth_counters', {}),
                'limits': LIMITS,
                'session_id': state.get('session_id'),
            }
        except Exception:
            return {'error': 'Could not load state'}

    def reset(self) -> None:
        """Reset recursion tracking."""
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._initial_state()
            self._save_state(state)

            AuditLogger.log('recursion_guard', 'RECURSION_RESET', {
                'session_id': state['session_id'],
            }, severity='INFO')

        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)


# ============================================================================
# Convenience Functions
# ============================================================================

_recursion_guard: Optional[RecursionGuard] = None


def get_recursion_guard() -> RecursionGuard:
    """Get or create the global recursion guard instance."""
    global _recursion_guard
    if _recursion_guard is None:
        _recursion_guard = RecursionGuard()
    return _recursion_guard


def check_recursion_limit(recursion_type: str, current_depth: int = 0,
                          target: str = "") -> Tuple[bool, str]:
    """
    Check if recursion is within limits.

    Args:
        recursion_type: Type of recursion
        current_depth: Current depth
        target: Target for circular detection

    Returns:
        Tuple of (allowed, message)
    """
    guard = get_recursion_guard()
    result = guard.check_depth(recursion_type, current_depth, target)
    return result.allowed, result.reason


def check_circular_reference(operation: str, target: str) -> Tuple[bool, str]:
    """
    Check for circular references.

    Args:
        operation: Operation type
        target: Target identifier

    Returns:
        Tuple of (allowed, message)
    """
    guard = get_recursion_guard()
    result = guard.check_circular(operation, target)
    return result.allowed, result.reason


# ============================================================================
# Hook Integration
# ============================================================================

def validate_recursion() -> int:
    """
    Validate recursion limits as a pre-tool hook.

    Returns:
        Exit code: 0 for allowed, 1 for blocked
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        return 0  # Allow if can't parse input

    tool_name = data.get('tool_name', '').lower()
    tool_input = data.get('tool_input', {})
    cwd = data.get('cwd', PROJECT_DIR)

    guard = get_recursion_guard()

    # Check for directory operations
    if tool_name in ('read', 'write', 'edit', 'glob'):
        path = tool_input.get('file_path', '') or tool_input.get('path', cwd)
        if path:
            # Check directory depth
            result = guard.check_directory_depth(path)
            if not result.allowed:
                _print_block_message(result)
                return 1

            # Check symlink depth
            result = guard.check_symlink_depth(path)
            if not result.allowed:
                _print_block_message(result)
                return 1

            # Check for circular patterns
            result = guard.check_circular(tool_name, path)
            if not result.allowed:
                _print_block_message(result)
                return 1

    # Check for nested task calls
    if tool_name == 'task':
        prompt = tool_input.get('prompt', '')[:50]
        result = guard.push_call(f"task:{prompt}")
        if not result.allowed:
            _print_block_message(result)
            return 1

    return 0


def _print_block_message(result: RecursionCheckResult) -> None:
    """Print standardized block message."""
    print(f"\n{'='*60}", file=sys.stderr)
    print("BMAD GUARDRAIL: RECURSION LIMIT EXCEEDED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nType: {result.recursion_type}", file=sys.stderr)
    print(f"Current depth: {result.current_depth}", file=sys.stderr)
    print(f"Maximum depth: {result.max_depth}", file=sys.stderr)

    if result.is_circular:
        print(f"\n⚠️  Circular reference detected!", file=sys.stderr)

    print(f"\nReason: {result.reason}", file=sys.stderr)
    print(f"\nTo increase limits, set environment variables:", file=sys.stderr)
    print(f"  BMAD_MAX_DIR_DEPTH={LIMITS['directory_traversal']}", file=sys.stderr)
    print(f"  BMAD_MAX_NESTED_CALLS={LIMITS['nested_calls']}", file=sys.stderr)
    print(f"\n{'='*60}\n", file=sys.stderr)


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            guard = get_recursion_guard()
            status = guard.get_status()
            print(json.dumps(status, indent=2))

        elif command == 'check-depth':
            if len(sys.argv) < 4:
                print("Usage: recursion_guard.py check-depth <type> <depth>")
                sys.exit(1)
            recursion_type = sys.argv[2]
            depth = int(sys.argv[3])
            allowed, message = check_recursion_limit(recursion_type, depth)
            print(f"Allowed: {allowed}")
            print(f"Message: {message}")
            sys.exit(0 if allowed else 1)

        elif command == 'check-circular':
            if len(sys.argv) < 4:
                print("Usage: recursion_guard.py check-circular <operation> <target>")
                sys.exit(1)
            operation = sys.argv[2]
            target = sys.argv[3]
            allowed, message = check_circular_reference(operation, target)
            print(f"Allowed: {allowed}")
            print(f"Message: {message}")
            sys.exit(0 if allowed else 1)

        elif command == 'check-path':
            if len(sys.argv) < 3:
                print("Usage: recursion_guard.py check-path <path>")
                sys.exit(1)
            path = sys.argv[2]
            guard = get_recursion_guard()
            result = guard.check_directory_depth(path)
            print(f"Allowed: {result.allowed}")
            print(f"Depth: {result.current_depth}/{result.max_depth}")
            print(f"Message: {result.reason}")
            sys.exit(0 if result.allowed else 1)

        elif command == 'reset':
            guard = get_recursion_guard()
            guard.reset()
            print("Recursion tracking reset")

        elif command == 'validate':
            sys.exit(validate_recursion())

        else:
            print(f"Usage: {sys.argv[0]} [status|check-depth|check-circular|check-path|reset|validate]")
            sys.exit(1)
    else:
        # Run as validator hook
        sys.exit(validate_recursion())