#!/usr/bin/env python3
"""
BMAD Guardrails: Outside Repository Guard
==========================================
Prevents operations outside the repository boundary.

Exit Codes:
- 0: Operation is within repository
- 2: Operation blocked (outside repository boundary)

Protection Scope:
- File reads outside repository
- File writes outside repository
- Bash commands with paths outside repository
- Directory traversal attempts (../)

Override: BMAD_ALLOW_OUTSIDE_REPO=true (single-use, 5-minute timeout)

Note: Some operations outside repo are allowed:
- /tmp directory (for temporary files)
- Node modules resolution
- System binary execution
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
    is_path_in_repo,
    PROJECT_DIR
)

VALIDATOR_NAME = 'outside_repo_guard'

# =============================================================================
# ALLOWED PATHS OUTSIDE REPO
# =============================================================================

ALLOWED_OUTSIDE_PATHS = [
    '/tmp',
    '/var/tmp',
    '/private/tmp',  # macOS
    '/usr/bin',
    '/usr/local/bin',
    '/bin',
    '/opt/homebrew',  # macOS Homebrew
]

# Patterns in commands that are generally safe even with external paths
SAFE_COMMAND_PATTERNS = [
    r'^(which|where|type)\s+',      # Finding commands
    r'^(ls|dir)\s+-',               # Listing with flags (usually inspection)
    r'^man\s+',                     # Reading man pages
    r'^(node|python|ruby|php)\s+',  # Running interpreters (will be caught by other guards if dangerous)
    r'^npm\s+(install|ci|run|test|build)',  # NPM operations
    r'^yarn\s+',                    # Yarn operations
    r'^pip\s+(install|freeze)',     # Pip operations
    r'^git\s+(clone|fetch|pull|push|status|log|diff)',  # Git operations
]

# Patterns that suggest directory traversal attack
TRAVERSAL_PATTERNS = [
    r'\.\./\.\.',           # Multiple parent traversals
    r'\.\.(/\.\.)+',        # Repeated traversals
    r'/\.\./\.\./\.\.',     # Deep traversal
]


def is_allowed_outside_path(path: str) -> bool:
    """Check if a path outside repo is in the allowed list."""
    resolved = resolve_path(path, PROJECT_DIR)

    for allowed in ALLOWED_OUTSIDE_PATHS:
        allowed_resolved = os.path.realpath(allowed) if os.path.exists(allowed) else allowed
        if resolved.startswith(allowed_resolved + os.sep) or resolved == allowed_resolved:
            return True

    return False


def is_traversal_attack(path: str) -> bool:
    """Check if path contains directory traversal patterns."""
    for pattern in TRAVERSAL_PATTERNS:
        if re.search(pattern, path):
            return True
    return False


def is_safe_command(command: str) -> bool:
    """Check if command is in the safe list."""
    cmd_stripped = command.strip()
    for pattern in SAFE_COMMAND_PATTERNS:
        if re.match(pattern, cmd_stripped, re.IGNORECASE):
            return True
    return False


def extract_paths_from_command(command: str) -> list:
    """
    Extract file/directory paths from a bash command.

    This is a heuristic approach - not perfect but catches most cases.
    """
    paths = []

    # Look for quoted paths
    quoted = re.findall(r'["\']([^"\']+)["\']', command)
    paths.extend(quoted)

    # Look for paths starting with / or ~ or .
    unquoted = re.findall(r'(?:^|\s)((?:/|~|\.\.?/)[^\s;|&<>]+)', command)
    paths.extend(unquoted)

    # Look for paths with common extensions
    extensions = re.findall(r'(?:^|\s)(\S+\.(?:txt|json|yaml|yml|xml|md|py|js|ts|sh|env|cfg|conf|ini))', command)
    paths.extend(extensions)

    return paths


def check_file_operation(file_path: str, cwd: str) -> tuple:
    """
    Check if a file operation is within repository bounds.

    Returns:
        Tuple of (is_allowed, reason)
    """
    if not file_path:
        return (True, '')

    # Check for traversal attacks
    if is_traversal_attack(file_path):
        return (False, 'Directory traversal pattern detected')

    # Resolve path
    resolved = resolve_path(file_path, cwd)

    # Check if in repo
    if is_path_in_repo(file_path, cwd):
        return (True, '')

    # Check if in allowed outside paths
    if is_allowed_outside_path(resolved):
        return (True, f'Allowed outside path: {resolved}')

    return (False, f'Path is outside repository: {resolved}')


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    tool_name = data.get('tool_name', '')
    cwd = data.get('cwd', PROJECT_DIR)

    paths_to_check = []
    is_bash = False

    # Extract paths based on tool type
    if tool_name in ['Write', 'Edit', 'Read']:
        file_path = tool_input.get('file_path', '')
        if file_path:
            paths_to_check.append(file_path)

    elif tool_name == 'Glob':
        search_path = tool_input.get('path', '')
        if search_path:
            paths_to_check.append(search_path)

    elif tool_name == 'Grep':
        search_path = tool_input.get('path', '')
        if search_path:
            paths_to_check.append(search_path)

    elif tool_name == 'Bash':
        is_bash = True
        command = tool_input.get('command', '')

        # Check if command is in safe list
        if is_safe_command(command):
            AuditLogger.log_allowed(VALIDATOR_NAME, 'Safe command pattern', {'command': command[:100]})
            sys.exit(0)

        # Extract paths from command
        paths_to_check = extract_paths_from_command(command)

    # Check each path
    violations = []
    for path in paths_to_check:
        is_allowed, reason = check_file_operation(path, cwd)
        if not is_allowed:
            violations.append((path, reason))

    if not violations:
        AuditLogger.log_allowed(VALIDATOR_NAME, 'All paths within bounds')
        sys.exit(0)

    # We have violations - check for override
    override_valid, override_reason = OverrideManager.check_and_consume_override('OUTSIDE_REPO')

    if override_valid:
        target = tool_input.get('command', tool_input.get('file_path', 'Unknown'))
        AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', target)
        print(f"Override accepted: {override_reason}", file=sys.stderr)
        print(f"WARNING: Operating outside repository boundaries", file=sys.stderr)
        sys.exit(0)

    # Block the operation
    target = tool_input.get('command', tool_input.get('file_path', 'Unknown'))

    violation_summary = "\n".join([f"  - {path}: {reason}" for path, reason in violations[:5]])
    if len(violations) > 5:
        violation_summary += f"\n  ... and {len(violations) - 5} more"

    AuditLogger.log_blocked(VALIDATOR_NAME, 'Path outside repository', target, {
        'violations': [(p, r) for p, r in violations[:5]]
    })

    print_block_message(
        title="OUTSIDE REPOSITORY - Path Boundary Violation",
        message=f"This operation targets paths outside the repository:\n\n{violation_summary}\n\n"
                f"Repository root: {PROJECT_DIR}",
        command_or_file=target,
        override_var="BMAD_ALLOW_OUTSIDE_REPO",
        recommendations=[
            "Verify the path is correct",
            "Use paths relative to the repository",
            "If accessing external files is necessary, use the override",
            "Consider copying external files into the repository first"
        ]
    )
    sys.exit(2)


if __name__ == '__main__':
    main()
