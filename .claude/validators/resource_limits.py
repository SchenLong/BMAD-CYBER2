#!/usr/bin/env python3
"""
BMAD Guardrails: Resource Limits
=================================
Implements memory and resource limits to prevent resource exhaustion attacks.

Features:
- Set maximum memory per session (default: 1GB)
- Track memory usage of child processes
- Kill processes exceeding limits
- Log resource violations
- Configurable via environment variables

OWASP Reference: LLM04 - Model Denial of Service
Requirements: REQ-3.3.1 through REQ-3.3.5

Usage:
    from resource_limits import ResourceLimiter, check_resource_limits

    limiter = ResourceLimiter()
    allowed, message = limiter.check_memory_available(estimated_mb=100)
"""

import json
import os
import sys
import time
import fcntl
import signal
import tempfile
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any, Set
from datetime import datetime

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

# State file for tracking resource usage
RESOURCE_STATE_FILE = os.path.join(PROJECT_DIR, '.claude', '.resource_state.json')
RESOURCE_LOCK_FILE = os.path.join(PROJECT_DIR, '.claude', '.resource.lock')

# Lock timeout
LOCK_TIMEOUT_SECONDS = 5.0

# Default limits (can be overridden via environment)
DEFAULT_LIMITS = {
    'max_memory_mb': int(os.environ.get('BMAD_MAX_MEMORY_MB', 1024)),       # 1GB
    'max_cpu_percent': int(os.environ.get('BMAD_MAX_CPU_PERCENT', 80)),     # 80%
    'max_child_processes': int(os.environ.get('BMAD_MAX_CHILD_PROCS', 10)),  # 10 children
    'max_open_files': int(os.environ.get('BMAD_MAX_OPEN_FILES', 100)),       # 100 files
    'max_file_size_mb': int(os.environ.get('BMAD_MAX_FILE_SIZE_MB', 50)),    # 50MB per file
    'process_timeout_seconds': int(os.environ.get('BMAD_PROC_TIMEOUT', 300)), # 5 minutes
}

# Warning thresholds (percentage of limit)
WARNING_THRESHOLD = 0.75  # Warn at 75%
CRITICAL_THRESHOLD = 0.90  # Critical at 90%

# Process tracking interval
CHECK_INTERVAL_SECONDS = 5

# Grace period before force kill
GRACEFUL_SHUTDOWN_SECONDS = 5


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class ResourceUsage:
    """Current resource usage snapshot."""
    memory_mb: float
    cpu_percent: float
    child_process_count: int
    open_file_count: int
    timestamp: float = field(default_factory=time.time)


@dataclass
class ResourceCheckResult:
    """Result of a resource limit check."""
    allowed: bool
    reason: str
    resource_type: str
    current_value: float
    limit_value: float
    percentage: float
    status: str  # 'ok', 'warning', 'critical', 'blocked'


@dataclass
class TrackedProcess:
    """Information about a tracked child process."""
    pid: int
    name: str
    started_at: float
    memory_mb: float = 0.0
    cpu_percent: float = 0.0
    killed: bool = False


# ============================================================================
# Resource Limiter Implementation
# ============================================================================

class ResourceLimiter:
    """
    Enforces resource limits on the session and child processes.

    Monitors memory usage, CPU usage, and process counts to prevent
    resource exhaustion attacks.
    """

    def __init__(self, limits: Optional[Dict[str, int]] = None):
        self.limits = {**DEFAULT_LIMITS, **(limits or {})}
        self.state_file = RESOURCE_STATE_FILE
        self.lock_file = RESOURCE_LOCK_FILE
        self.tracked_processes: Dict[int, TrackedProcess] = {}
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
                    raise TimeoutError(f"Could not acquire resource lock within {timeout}s")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release file lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _load_state(self) -> Dict[str, Any]:
        """Load resource state from file."""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    # Reset after 1 hour of inactivity
                    last_update = state.get('last_update', 0)
                    if time.time() - last_update > 3600:
                        return self._initial_state()
                    return state
        except (json.JSONDecodeError, IOError):
            pass
        return self._initial_state()

    def _initial_state(self) -> Dict[str, Any]:
        """Return initial state."""
        return {
            'session_id': os.environ.get('CLAUDE_SESSION_ID', str(int(time.time()))),
            'tracked_pids': [],
            'violations_count': 0,
            'warnings_count': 0,
            'peak_memory_mb': 0,
            'peak_cpu_percent': 0,
            'last_check': time.time(),
            'last_update': time.time(),
        }

    def _save_state(self, state: Dict[str, Any]) -> None:
        """Save state atomically."""
        state['last_update'] = time.time()

        dir_name = os.path.dirname(self.state_file)
        fd, temp_path = tempfile.mkstemp(dir=dir_name, prefix='.resource_')
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

    def get_current_memory_mb(self) -> float:
        """Get current memory usage in MB."""
        try:
            import resource as res
            # Get resident set size
            usage = res.getrusage(res.RUSAGE_SELF)
            return usage.ru_maxrss / 1024  # Convert KB to MB on macOS
        except Exception:
            pass

        # Fallback: try to read from /proc on Linux
        try:
            with open('/proc/self/status', 'r') as f:
                for line in f:
                    if line.startswith('VmRSS:'):
                        # VmRSS is in KB
                        return int(line.split()[1]) / 1024
        except Exception:
            pass

        # Fallback: use subprocess
        try:
            result = subprocess.run(
                ['ps', '-o', 'rss=', '-p', str(os.getpid())],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                return int(result.stdout.strip()) / 1024  # KB to MB
        except Exception:
            pass

        return 0.0

    def get_cpu_percent(self) -> float:
        """Get current CPU usage percentage."""
        try:
            import resource as res
            usage = res.getrusage(res.RUSAGE_SELF)
            # Approximate CPU usage from user + system time
            total_time = usage.ru_utime + usage.ru_stime
            return min(total_time / 10.0, 100.0)  # Rough approximation
        except Exception:
            pass

        return 0.0

    def get_child_process_count(self) -> int:
        """Count current child processes."""
        try:
            current_pid = os.getpid()
            result = subprocess.run(
                ['pgrep', '-P', str(current_pid)],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0 and result.stdout.strip():
                return len(result.stdout.strip().split('\n'))
        except Exception:
            pass

        return 0

    def get_open_file_count(self) -> int:
        """Count currently open files."""
        try:
            pid = os.getpid()
            fd_path = f'/proc/{pid}/fd'
            if os.path.exists(fd_path):
                return len(os.listdir(fd_path))
        except Exception:
            pass

        # Fallback: use lsof
        try:
            result = subprocess.run(
                ['lsof', '-p', str(os.getpid())],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                return len(result.stdout.strip().split('\n')) - 1
        except Exception:
            pass

        return 0

    def get_resource_usage(self) -> ResourceUsage:
        """Get current resource usage snapshot."""
        return ResourceUsage(
            memory_mb=self.get_current_memory_mb(),
            cpu_percent=self.get_cpu_percent(),
            child_process_count=self.get_child_process_count(),
            open_file_count=self.get_open_file_count(),
        )

    def check_memory(self, estimated_additional_mb: float = 0) -> ResourceCheckResult:
        """
        Check if memory usage is within limits.

        Args:
            estimated_additional_mb: Estimated additional memory needed

        Returns:
            ResourceCheckResult with check details
        """
        current_mb = self.get_current_memory_mb()
        projected_mb = current_mb + estimated_additional_mb
        limit_mb = self.limits['max_memory_mb']
        percentage = projected_mb / limit_mb

        if percentage >= 1.0:
            return ResourceCheckResult(
                allowed=False,
                reason=f"Would exceed memory limit ({projected_mb:.1f}MB > {limit_mb}MB)",
                resource_type='memory',
                current_value=current_mb,
                limit_value=limit_mb,
                percentage=percentage,
                status='blocked',
            )

        if percentage >= CRITICAL_THRESHOLD:
            status = 'critical'
            reason = f"Memory usage critical ({percentage:.1%} of {limit_mb}MB)"
        elif percentage >= WARNING_THRESHOLD:
            status = 'warning'
            reason = f"Memory usage elevated ({percentage:.1%} of {limit_mb}MB)"
        else:
            status = 'ok'
            reason = "Memory usage within limits"

        return ResourceCheckResult(
            allowed=True,
            reason=reason,
            resource_type='memory',
            current_value=current_mb,
            limit_value=limit_mb,
            percentage=percentage,
            status=status,
        )

    def check_child_processes(self, starting_new: bool = False) -> ResourceCheckResult:
        """
        Check if child process count is within limits.

        Args:
            starting_new: Whether we're about to start a new child process

        Returns:
            ResourceCheckResult with check details
        """
        current_count = self.get_child_process_count()
        projected_count = current_count + (1 if starting_new else 0)
        limit = self.limits['max_child_processes']
        percentage = projected_count / limit

        if projected_count > limit:
            return ResourceCheckResult(
                allowed=False,
                reason=f"Would exceed child process limit ({projected_count} > {limit})",
                resource_type='child_processes',
                current_value=current_count,
                limit_value=limit,
                percentage=percentage,
                status='blocked',
            )

        if percentage >= CRITICAL_THRESHOLD:
            status = 'critical'
        elif percentage >= WARNING_THRESHOLD:
            status = 'warning'
        else:
            status = 'ok'

        return ResourceCheckResult(
            allowed=True,
            reason=f"Child processes: {current_count}/{limit}",
            resource_type='child_processes',
            current_value=current_count,
            limit_value=limit,
            percentage=percentage,
            status=status,
        )

    def check_file_size(self, file_path: str, additional_bytes: int = 0) -> ResourceCheckResult:
        """
        Check if a file operation would exceed size limits.

        Args:
            file_path: Path to the file
            additional_bytes: Bytes to be added

        Returns:
            ResourceCheckResult with check details
        """
        limit_mb = self.limits['max_file_size_mb']
        limit_bytes = limit_mb * 1024 * 1024

        try:
            current_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        except OSError:
            current_size = 0

        projected_size = current_size + additional_bytes
        current_mb = current_size / (1024 * 1024)
        projected_mb = projected_size / (1024 * 1024)
        percentage = projected_size / limit_bytes

        if projected_size > limit_bytes:
            return ResourceCheckResult(
                allowed=False,
                reason=f"Would exceed file size limit ({projected_mb:.1f}MB > {limit_mb}MB)",
                resource_type='file_size',
                current_value=current_mb,
                limit_value=limit_mb,
                percentage=percentage,
                status='blocked',
            )

        return ResourceCheckResult(
            allowed=True,
            reason=f"File size within limits ({projected_mb:.1f}MB / {limit_mb}MB)",
            resource_type='file_size',
            current_value=current_mb,
            limit_value=limit_mb,
            percentage=percentage,
            status='ok',
        )

    def track_process(self, pid: int, name: str = "child") -> None:
        """
        Start tracking a child process.

        Args:
            pid: Process ID to track
            name: Name/description of the process
        """
        self.tracked_processes[pid] = TrackedProcess(
            pid=pid,
            name=name,
            started_at=time.time(),
        )

        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()
            tracked_pids = state.get('tracked_pids', [])
            if pid not in tracked_pids:
                tracked_pids.append(pid)
                state['tracked_pids'] = tracked_pids
            self._save_state(state)
        except TimeoutError:
            pass
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def untrack_process(self, pid: int) -> None:
        """Stop tracking a child process."""
        self.tracked_processes.pop(pid, None)

        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()
            tracked_pids = state.get('tracked_pids', [])
            if pid in tracked_pids:
                tracked_pids.remove(pid)
                state['tracked_pids'] = tracked_pids
            self._save_state(state)
        except TimeoutError:
            pass
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def kill_process(self, pid: int, graceful: bool = True) -> bool:
        """
        Kill a process, optionally with graceful shutdown.

        Args:
            pid: Process ID to kill
            graceful: If True, try SIGTERM before SIGKILL

        Returns:
            True if process was killed
        """
        try:
            if graceful:
                os.kill(pid, signal.SIGTERM)
                time.sleep(GRACEFUL_SHUTDOWN_SECONDS)

                # Check if still running
                try:
                    os.kill(pid, 0)
                    # Still running, force kill
                    os.kill(pid, signal.SIGKILL)
                except OSError:
                    pass  # Process already terminated
            else:
                os.kill(pid, signal.SIGKILL)

            if pid in self.tracked_processes:
                self.tracked_processes[pid].killed = True

            AuditLogger.log('resource_limits', 'PROCESS_KILLED', {
                'pid': pid,
                'graceful': graceful,
            }, severity='WARNING')

            return True

        except OSError as e:
            if e.errno == 3:  # No such process
                return True  # Already dead
            return False

    def kill_over_limit_processes(self) -> List[int]:
        """
        Kill processes that have exceeded their time limit.

        Returns:
            List of PIDs that were killed
        """
        killed = []
        timeout = self.limits['process_timeout_seconds']
        current_time = time.time()

        for pid, proc in list(self.tracked_processes.items()):
            if proc.killed:
                continue

            elapsed = current_time - proc.started_at
            if elapsed > timeout:
                if self.kill_process(pid):
                    killed.append(pid)

                AuditLogger.log('resource_limits', 'TIMEOUT_KILL', {
                    'pid': pid,
                    'name': proc.name,
                    'elapsed_seconds': elapsed,
                    'timeout_seconds': timeout,
                }, severity='WARNING')

        return killed

    def get_status(self) -> Dict[str, Any]:
        """Get current resource status."""
        usage = self.get_resource_usage()

        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            # Update peaks
            if usage.memory_mb > state.get('peak_memory_mb', 0):
                state['peak_memory_mb'] = usage.memory_mb
            if usage.cpu_percent > state.get('peak_cpu_percent', 0):
                state['peak_cpu_percent'] = usage.cpu_percent

            state['last_check'] = time.time()
            self._save_state(state)

            return {
                'current': {
                    'memory_mb': round(usage.memory_mb, 2),
                    'cpu_percent': round(usage.cpu_percent, 2),
                    'child_processes': usage.child_process_count,
                    'open_files': usage.open_file_count,
                },
                'limits': self.limits,
                'peaks': {
                    'memory_mb': round(state.get('peak_memory_mb', 0), 2),
                    'cpu_percent': round(state.get('peak_cpu_percent', 0), 2),
                },
                'tracked_processes': len(self.tracked_processes),
                'violations_count': state.get('violations_count', 0),
                'warnings_count': state.get('warnings_count', 0),
                'session_id': state.get('session_id'),
            }

        except TimeoutError:
            return {'error': 'Could not acquire lock'}
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def reset(self) -> None:
        """Reset resource tracking for new session."""
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._initial_state()
            self._save_state(state)
            self.tracked_processes.clear()

            AuditLogger.log('resource_limits', 'RESOURCE_RESET', {
                'session_id': state['session_id'],
            }, severity='INFO')

        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)


# ============================================================================
# Convenience Functions
# ============================================================================

_resource_limiter: Optional[ResourceLimiter] = None


def get_resource_limiter() -> ResourceLimiter:
    """Get or create the global resource limiter instance."""
    global _resource_limiter
    if _resource_limiter is None:
        _resource_limiter = ResourceLimiter()
    return _resource_limiter


def check_resource_limits() -> Tuple[bool, str]:
    """
    Check all resource limits.

    Returns:
        Tuple of (all_ok, message)
    """
    limiter = get_resource_limiter()

    checks = [
        limiter.check_memory(),
        limiter.check_child_processes(),
    ]

    blocked = [c for c in checks if not c.allowed]
    warnings = [c for c in checks if c.status in ('warning', 'critical')]

    if blocked:
        return False, '; '.join(c.reason for c in blocked)

    if warnings:
        return True, '; '.join(c.reason for c in warnings)

    return True, "All resources within limits"


def check_memory_available(estimated_mb: float) -> Tuple[bool, str]:
    """
    Check if memory is available for an operation.

    Args:
        estimated_mb: Estimated memory needed in MB

    Returns:
        Tuple of (available, message)
    """
    limiter = get_resource_limiter()
    result = limiter.check_memory(estimated_mb)
    return result.allowed, result.reason


# ============================================================================
# Hook Integration
# ============================================================================

def validate_resource_limits() -> int:
    """
    Validate resource limits as a pre-tool hook.

    Returns:
        Exit code: 0 for allowed, 1 for blocked
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        return 0  # Allow if can't parse input

    tool_name = data.get('tool_name', '').lower()
    tool_input = data.get('tool_input', {})

    limiter = get_resource_limiter()

    # Check memory for all operations
    memory_result = limiter.check_memory()

    if not memory_result.allowed:
        _print_block_message(memory_result)
        return 1

    # Check child process limit for Task tool
    if tool_name == 'task':
        proc_result = limiter.check_child_processes(starting_new=True)
        if not proc_result.allowed:
            _print_block_message(proc_result)
            return 1

    # Check file size for Write tool
    if tool_name == 'write':
        file_path = tool_input.get('file_path', '')
        content = tool_input.get('content', '')
        if file_path and content:
            size_result = limiter.check_file_size(file_path, len(content.encode()))
            if not size_result.allowed:
                _print_block_message(size_result)
                return 1

    # Log warnings
    if memory_result.status in ('warning', 'critical'):
        print(f"\n[{memory_result.status.upper()}] {memory_result.reason}", file=sys.stderr)

    return 0


def _print_block_message(result: ResourceCheckResult) -> None:
    """Print standardized block message."""
    print(f"\n{'='*60}", file=sys.stderr)
    print("BMAD GUARDRAIL: RESOURCE LIMIT EXCEEDED", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"\nResource: {result.resource_type}", file=sys.stderr)
    print(f"Current: {result.current_value:.1f}", file=sys.stderr)
    print(f"Limit: {result.limit_value:.1f}", file=sys.stderr)
    print(f"Usage: {result.percentage:.1%}", file=sys.stderr)
    print(f"\nReason: {result.reason}", file=sys.stderr)

    print(f"\nTo adjust limits, set environment variables:", file=sys.stderr)
    print(f"  BMAD_MAX_MEMORY_MB={DEFAULT_LIMITS['max_memory_mb']}", file=sys.stderr)
    print(f"  BMAD_MAX_CHILD_PROCS={DEFAULT_LIMITS['max_child_processes']}", file=sys.stderr)
    print(f"  BMAD_MAX_FILE_SIZE_MB={DEFAULT_LIMITS['max_file_size_mb']}", file=sys.stderr)
    print(f"\n{'='*60}\n", file=sys.stderr)

    AuditLogger.log('resource_limits', 'RESOURCE_BLOCKED', {
        'resource_type': result.resource_type,
        'current': result.current_value,
        'limit': result.limit_value,
        'percentage': result.percentage,
    }, severity='BLOCKED')


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            limiter = get_resource_limiter()
            status = limiter.get_status()
            print(json.dumps(status, indent=2))

        elif command == 'check':
            ok, message = check_resource_limits()
            print(f"Status: {'OK' if ok else 'BLOCKED'}")
            print(f"Message: {message}")
            sys.exit(0 if ok else 1)

        elif command == 'check-memory':
            estimated = float(sys.argv[2]) if len(sys.argv) > 2 else 0
            ok, message = check_memory_available(estimated)
            print(f"Available: {ok}")
            print(f"Message: {message}")
            sys.exit(0 if ok else 1)

        elif command == 'kill-overtime':
            limiter = get_resource_limiter()
            killed = limiter.kill_over_limit_processes()
            if killed:
                print(f"Killed processes: {killed}")
            else:
                print("No processes exceeded time limit")

        elif command == 'reset':
            limiter = get_resource_limiter()
            limiter.reset()
            print("Resource tracking reset")

        elif command == 'validate':
            sys.exit(validate_resource_limits())

        else:
            print(f"Usage: {sys.argv[0]} [status|check|check-memory|kill-overtime|reset|validate]")
            sys.exit(1)
    else:
        # Run as validator hook
        sys.exit(validate_resource_limits())
