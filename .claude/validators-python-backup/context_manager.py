#!/usr/bin/env python3
"""
BMAD Guardrails: Context Window Management
===========================================
Implements context size tracking and management to prevent context overflow.

Features:
- Token count estimation per session
- Warning at 75% context capacity
- Blocking at 95% context capacity
- Token estimation for requests
- Summarization suggestions when approaching limits
- Full audit logging integration

OWASP Reference: LLM04 - Model Denial of Service
Requirements: REQ-2.2.1 through REQ-2.2.6

Usage:
    from context_manager import ContextManager, check_context_capacity

    manager = ContextManager()
    status, percentage, message = manager.check_capacity()
"""

import json
import os
import sys
import time
import fcntl
import tempfile
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
    from telemetry_collector import record_resource_usage
    TELEMETRY_AVAILABLE = True
except ImportError:
    TELEMETRY_AVAILABLE = False
    def record_resource_usage(*args, **kwargs): pass


# ============================================================================
# Configuration
# ============================================================================

# State file for tracking context usage
CONTEXT_STATE_FILE = os.path.join(PROJECT_DIR, '.claude', '.context_state.json')
CONTEXT_LOCK_FILE = os.path.join(PROJECT_DIR, '.claude', '.context.lock')

# Token estimation
CHARS_PER_TOKEN = 4  # Approximate character to token ratio
BYTES_PER_TOKEN = 4  # For binary content

# Context limits (Claude's context window)
MAX_CONTEXT_TOKENS = int(os.environ.get('BMAD_MAX_CONTEXT_TOKENS', 200000))

# Thresholds
WARNING_THRESHOLD = float(os.environ.get('BMAD_CONTEXT_WARNING', 0.75))  # 75%
BLOCK_THRESHOLD = float(os.environ.get('BMAD_CONTEXT_BLOCK', 0.95))      # 95%

# Lock timeout
LOCK_TIMEOUT_SECONDS = 5.0

# Estimated base overhead for each interaction
BASE_OVERHEAD_TOKENS = 500  # System prompts, tool formatting, etc.

# File type multipliers for token estimation (some file types are more verbose)
FILE_TYPE_MULTIPLIERS = {
    '.json': 1.2,    # JSON tends to have more tokens per character
    '.xml': 1.3,     # XML has lots of tags
    '.yaml': 1.0,
    '.yml': 1.0,
    '.py': 1.0,
    '.js': 1.0,
    '.ts': 1.0,
    '.md': 0.9,      # Markdown is slightly more compact
    '.txt': 0.9,
    '.css': 1.1,
    '.html': 1.2,
}


# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class TokenEstimate:
    """Token count estimation for content."""
    tokens: int
    source: str  # 'file', 'text', 'command'
    path: Optional[str] = None
    truncated: bool = False
    original_tokens: Optional[int] = None  # Before truncation


@dataclass
class ContextStatus:
    """Current context window status."""
    status: str  # 'ok', 'warning', 'critical', 'blocked'
    percentage: float
    tokens_used: int
    tokens_remaining: int
    max_tokens: int
    message: Optional[str] = None


# ============================================================================
# Context Manager Implementation
# ============================================================================

class ContextManager:
    """
    Manages context window usage tracking.

    Estimates token counts for operations and tracks cumulative usage
    within a session to prevent context overflow.
    """

    def __init__(self):
        self.state_file = CONTEXT_STATE_FILE
        self.lock_file = CONTEXT_LOCK_FILE
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
                    raise TimeoutError(f"Could not acquire context lock within {timeout}s")
                time.sleep(0.01)

    def _release_lock(self, fd: int) -> None:
        """Release file lock."""
        try:
            fcntl.flock(fd, fcntl.LOCK_UN)
        finally:
            os.close(fd)

    def _load_state(self) -> Dict[str, Any]:
        """Load context state from file."""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    # Check if session is still valid (reset after 1 hour of inactivity)
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
            'tokens_used': 0,
            'operations': [],
            'warnings_issued': 0,
            'last_update': time.time(),
            'created_at': time.time(),
        }

    def _save_state(self, state: Dict[str, Any]) -> None:
        """Save state atomically."""
        state['last_update'] = time.time()

        dir_name = os.path.dirname(self.state_file)
        fd, temp_path = tempfile.mkstemp(dir=dir_name, prefix='.context_')
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

    def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count for a text string.

        Args:
            text: Text content to estimate

        Returns:
            Estimated token count
        """
        if not text:
            return 0
        return max(1, len(text) // CHARS_PER_TOKEN)

    def estimate_file_tokens(self, file_path: str) -> TokenEstimate:
        """
        Estimate token count for a file.

        Args:
            file_path: Path to the file

        Returns:
            TokenEstimate with details
        """
        try:
            abs_path = file_path if os.path.isabs(file_path) else os.path.join(PROJECT_DIR, file_path)

            if not os.path.exists(abs_path):
                return TokenEstimate(tokens=0, source='file', path=file_path)

            file_size = os.path.getsize(abs_path)

            # Get file extension for multiplier
            ext = os.path.splitext(file_path)[1].lower()
            multiplier = FILE_TYPE_MULTIPLIERS.get(ext, 1.0)

            # Estimate tokens
            tokens = int((file_size / BYTES_PER_TOKEN) * multiplier)

            return TokenEstimate(
                tokens=tokens,
                source='file',
                path=file_path,
            )
        except Exception:
            return TokenEstimate(tokens=0, source='file', path=file_path)

    def estimate_operation_tokens(self, tool_name: str, tool_input: Dict[str, Any]) -> TokenEstimate:
        """
        Estimate tokens for a tool operation.

        Args:
            tool_name: Name of the tool
            tool_input: Tool input parameters

        Returns:
            TokenEstimate with details
        """
        tokens = BASE_OVERHEAD_TOKENS

        if tool_name == 'read':
            file_path = tool_input.get('file_path', '')
            file_estimate = self.estimate_file_tokens(file_path)
            tokens += file_estimate.tokens
            return TokenEstimate(
                tokens=tokens,
                source='file',
                path=file_path,
            )

        elif tool_name in ('write', 'edit'):
            content = tool_input.get('content', '') or tool_input.get('new_string', '')
            tokens += self.estimate_tokens(content)
            return TokenEstimate(
                tokens=tokens,
                source='text',
            )

        elif tool_name == 'bash':
            command = tool_input.get('command', '')
            tokens += self.estimate_tokens(command)
            # Add estimated output tokens (conservative estimate)
            tokens += 500
            return TokenEstimate(
                tokens=tokens,
                source='command',
            )

        elif tool_name in ('glob', 'grep'):
            # Search results can vary widely
            tokens += 1000  # Conservative estimate for results
            return TokenEstimate(
                tokens=tokens,
                source='text',
            )

        elif tool_name in ('webfetch', 'websearch'):
            # Web content tends to be large
            tokens += 2000
            return TokenEstimate(
                tokens=tokens,
                source='text',
            )

        elif tool_name == 'task':
            # Sub-agents consume significant context
            prompt = tool_input.get('prompt', '')
            tokens += self.estimate_tokens(prompt)
            tokens += 5000  # Estimated agent overhead
            return TokenEstimate(
                tokens=tokens,
                source='text',
            )

        # Default estimate for unknown tools
        return TokenEstimate(
            tokens=tokens + 500,
            source='text',
        )

    def record_operation(self, tool_name: str, tokens: int) -> None:
        """
        Record a completed operation's token usage.

        Args:
            tool_name: Name of the tool
            tokens: Actual or estimated tokens used
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            state['tokens_used'] = state.get('tokens_used', 0) + tokens

            # Keep last 100 operations for debugging
            operations = state.get('operations', [])
            operations.append({
                'tool': tool_name,
                'tokens': tokens,
                'timestamp': time.time(),
            })
            state['operations'] = operations[-100:]

            self._save_state(state)

        except TimeoutError:
            pass
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def check_capacity(self) -> ContextStatus:
        """
        Check current context capacity.

        Returns:
            ContextStatus with current usage information
        """
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._load_state()

            tokens_used = state.get('tokens_used', 0)
            percentage = tokens_used / MAX_CONTEXT_TOKENS
            tokens_remaining = MAX_CONTEXT_TOKENS - tokens_used

            if percentage >= BLOCK_THRESHOLD:
                status = 'blocked'
                message = f"Context window at {percentage:.1%} capacity. Operations blocked to prevent overflow."
            elif percentage >= WARNING_THRESHOLD:
                status = 'warning'
                message = f"Context window at {percentage:.1%} capacity. Consider summarizing or starting a new session."

                # Track warning
                state['warnings_issued'] = state.get('warnings_issued', 0) + 1
                self._save_state(state)
            else:
                status = 'ok'
                message = None

            return ContextStatus(
                status=status,
                percentage=percentage,
                tokens_used=tokens_used,
                tokens_remaining=tokens_remaining,
                max_tokens=MAX_CONTEXT_TOKENS,
                message=message,
            )

        except TimeoutError:
            # If we can't check, assume OK
            return ContextStatus(
                status='ok',
                percentage=0,
                tokens_used=0,
                tokens_remaining=MAX_CONTEXT_TOKENS,
                max_tokens=MAX_CONTEXT_TOKENS,
            )
        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def can_accommodate(self, estimated_tokens: int) -> Tuple[bool, str]:
        """
        Check if context can accommodate additional tokens.

        Args:
            estimated_tokens: Number of tokens to add

        Returns:
            Tuple of (can_accommodate, message)
        """
        status = self.check_capacity()

        projected_tokens = status.tokens_used + estimated_tokens
        projected_percentage = projected_tokens / MAX_CONTEXT_TOKENS

        if projected_percentage >= BLOCK_THRESHOLD:
            return False, f"Operation would exceed context limit ({projected_percentage:.1%} of {MAX_CONTEXT_TOKENS:,} tokens)"

        if projected_percentage >= WARNING_THRESHOLD:
            return True, f"Warning: Operation will bring context to {projected_percentage:.1%} capacity"

        return True, "OK"

    def get_status(self) -> Dict[str, Any]:
        """Get current context status as dictionary."""
        status = self.check_capacity()

        state = self._load_state()

        result = {
            'status': status.status,
            'percentage': round(status.percentage * 100, 1),
            'tokens_used': status.tokens_used,
            'tokens_remaining': status.tokens_remaining,
            'max_tokens': status.max_tokens,
            'operations_count': len(state.get('operations', [])),
            'warnings_issued': state.get('warnings_issued', 0),
            'session_id': state.get('session_id'),
            'session_age_seconds': int(time.time() - state.get('created_at', time.time())),
        }

        # Emit telemetry for resource usage
        if TELEMETRY_AVAILABLE:
            record_resource_usage(
                context_tokens_used=status.tokens_used,
                context_tokens_max=status.max_tokens,
                context_status=status.status,
            )

        return result

    def reset(self) -> None:
        """Reset context tracking for new session."""
        lock_fd = None
        try:
            lock_fd = self._acquire_lock()
            state = self._initial_state()
            self._save_state(state)

            AuditLogger.log('context_manager', 'CONTEXT_RESET', {
                'session_id': state['session_id'],
            }, severity='INFO')

        finally:
            if lock_fd is not None:
                self._release_lock(lock_fd)

    def suggest_actions(self) -> List[str]:
        """
        Suggest actions when approaching context limit.

        Returns:
            List of suggested actions
        """
        status = self.check_capacity()

        suggestions = []

        if status.percentage >= WARNING_THRESHOLD:
            suggestions.append("Consider starting a new conversation to reset context")
            suggestions.append("Use /compact to summarize the current conversation")
            suggestions.append("Avoid reading large files - use grep/glob to find specific content")
            suggestions.append("Break complex tasks into smaller subtasks")

        if status.percentage >= 0.5:
            suggestions.append("Be specific in requests to reduce back-and-forth")
            suggestions.append("Use targeted searches instead of broad exploration")

        return suggestions


# ============================================================================
# Convenience Functions
# ============================================================================

_context_manager: Optional[ContextManager] = None


def get_context_manager() -> ContextManager:
    """Get or create the global context manager instance."""
    global _context_manager
    if _context_manager is None:
        _context_manager = ContextManager()
    return _context_manager


def check_context_capacity() -> Tuple[str, float, Optional[str]]:
    """
    Check current context capacity.

    Returns:
        Tuple of (status, percentage, message)
    """
    manager = get_context_manager()
    status = manager.check_capacity()
    return status.status, status.percentage, status.message


def estimate_operation_cost(tool_name: str, tool_input: Dict[str, Any]) -> Tuple[int, str]:
    """
    Estimate token cost of an operation.

    Args:
        tool_name: Name of the tool
        tool_input: Tool input parameters

    Returns:
        Tuple of (estimated_tokens, description)
    """
    manager = get_context_manager()
    estimate = manager.estimate_operation_tokens(tool_name, tool_input)
    return estimate.tokens, f"Estimated {estimate.tokens:,} tokens from {estimate.source}"


# ============================================================================
# Hook Integration
# ============================================================================

def validate_context_capacity() -> int:
    """
    Validate context capacity as a pre-tool hook.

    Returns:
        Exit code: 0 for allowed, 1 for blocked
    """
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, IOError):
        return 0  # Allow if can't parse input

    tool_name = data.get('tool_name', '').lower()
    tool_input = data.get('tool_input', {})

    manager = get_context_manager()

    # Estimate operation cost
    estimate = manager.estimate_operation_tokens(tool_name, tool_input)

    # Check if we can accommodate
    can_proceed, message = manager.can_accommodate(estimate.tokens)

    if not can_proceed:
        status = manager.check_capacity()

        print(f"\n{'='*60}", file=sys.stderr)
        print("BMAD GUARDRAIL: CONTEXT LIMIT EXCEEDED", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"\nCurrent usage: {status.tokens_used:,} / {status.max_tokens:,} tokens ({status.percentage:.1%})", file=sys.stderr)
        print(f"Estimated operation cost: {estimate.tokens:,} tokens", file=sys.stderr)
        print(f"\n{message}", file=sys.stderr)

        suggestions = manager.suggest_actions()
        if suggestions:
            print(f"\nSuggested actions:", file=sys.stderr)
            for suggestion in suggestions[:3]:
                print(f"  - {suggestion}", file=sys.stderr)

        print(f"\n{'='*60}\n", file=sys.stderr)

        AuditLogger.log('context_manager', 'CONTEXT_BLOCKED', {
            'tool': tool_name,
            'estimated_tokens': estimate.tokens,
            'current_tokens': status.tokens_used,
            'percentage': status.percentage,
        }, severity='BLOCKED')

        return 1

    # Check for warning
    status = manager.check_capacity()
    if status.status == 'warning' and status.message:
        print(f"\n[WARNING] {status.message}", file=sys.stderr)

        suggestions = manager.suggest_actions()
        if suggestions:
            print(f"Suggestions:", file=sys.stderr)
            for suggestion in suggestions[:2]:
                print(f"  - {suggestion}", file=sys.stderr)
        print("", file=sys.stderr)

        AuditLogger.log('context_manager', 'CONTEXT_WARNING', {
            'tool': tool_name,
            'estimated_tokens': estimate.tokens,
            'current_tokens': status.tokens_used,
            'percentage': status.percentage,
        }, severity='WARNING')

    # Record the operation (will be updated with actual tokens later)
    manager.record_operation(tool_name, estimate.tokens)

    return 0


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'status':
            manager = get_context_manager()
            status = manager.get_status()
            print(json.dumps(status, indent=2))

        elif command == 'check':
            status, percentage, message = check_context_capacity()
            print(f"Status: {status}")
            print(f"Usage: {percentage:.1%}")
            if message:
                print(f"Message: {message}")
            sys.exit(0 if status != 'blocked' else 1)

        elif command == 'estimate':
            if len(sys.argv) < 4:
                print("Usage: context_manager.py estimate <tool_name> <json_input>")
                sys.exit(1)
            tool_name = sys.argv[2]
            try:
                tool_input = json.loads(sys.argv[3])
            except json.JSONDecodeError:
                tool_input = {'content': sys.argv[3]}

            tokens, description = estimate_operation_cost(tool_name, tool_input)
            print(f"Estimated tokens: {tokens:,}")
            print(f"Description: {description}")

        elif command == 'estimate-file':
            if len(sys.argv) < 3:
                print("Usage: context_manager.py estimate-file <file_path>")
                sys.exit(1)
            file_path = sys.argv[2]
            manager = get_context_manager()
            estimate = manager.estimate_file_tokens(file_path)
            print(f"Estimated tokens: {estimate.tokens:,}")
            print(f"File: {estimate.path}")

        elif command == 'reset':
            manager = get_context_manager()
            manager.reset()
            print("Context tracking reset")

        elif command == 'suggest':
            manager = get_context_manager()
            suggestions = manager.suggest_actions()
            if suggestions:
                print("Suggested actions:")
                for suggestion in suggestions:
                    print(f"  - {suggestion}")
            else:
                print("No suggestions - context usage is healthy")

        elif command == 'validate':
            sys.exit(validate_context_capacity())

        else:
            print(f"Usage: {sys.argv[0]} [status|check|estimate|estimate-file|reset|suggest|validate]")
            sys.exit(1)
    else:
        # Run as validator hook
        sys.exit(validate_context_capacity())
