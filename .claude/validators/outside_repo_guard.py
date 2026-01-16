#!/usr/bin/env python3
"""
BMAD Guardrails: Outside Repository Guard
==========================================
Blocks operations that target paths outside the current repository.

Exit Codes:
- 0: Allow the operation
- 2: Block the operation (outside repository)

This validator ensures all file operations stay within the repository
boundaries. It works with Read, Write, Edit, and Bash tools.

Special handling:
- rm commands outside repo: ABSOLUTE BLOCK (no override)
- Other operations outside repo: STRICT BLOCK (with override)

Security Improvements (v2):
- Command substitution detection and warning
- Audit logging for all blocked/allowed operations
- Single-use override tokens with 5-minute timeout
- Improved path extraction from complex commands
"""

import json
import sys
import os
import re

# Import shared security utilities
try:
    from security_common import (
        AuditLogger, OverrideManager, resolve_path, is_path_in_repo, PROJECT_DIR
    )
except ImportError:
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

    class AuditLogger:
        @classmethod
        def log_blocked(cls, *args, **kwargs): pass
        @classmethod
        def log_allowed(cls, *args, **kwargs): pass
        @classmethod
        def log_override_used(cls, *args, **kwargs): pass
        @classmethod
        def log(cls, *args, **kwargs): pass

    class OverrideManager:
        @classmethod
        def check_and_consume_override(cls, t):
            return os.environ.get(f'BMAD_ALLOW_{t.upper()}', '').lower() == 'true', ''

    def resolve_path(path, cwd):
        path = os.path.expanduser(path)
        if not os.path.isabs(path):
            path = os.path.join(cwd, path)
        try:
            return os.path.realpath(path)
        except Exception:
            return os.path.abspath(path)

    def is_path_in_repo(path, cwd, project_dir=PROJECT_DIR):
        if not path:
            return True
        resolved = resolve_path(path, cwd)
        repo_resolved = os.path.realpath(project_dir)
        return resolved.startswith(repo_resolved + os.sep) or resolved == repo_resolved


VALIDATOR_NAME = 'outside_repo_guard'


def get_operation_from_stdin():
    """Read the tool input from stdin (JSON format from Claude Code)."""
    try:
        data = json.load(sys.stdin)
        tool_input = data.get('tool_input', {})
        tool_name = data.get('tool_name', '')
        cwd = data.get('cwd', PROJECT_DIR)

        # Extract paths based on tool type
        file_path = tool_input.get('file_path', '')
        command = tool_input.get('command', '')
        path = tool_input.get('path', '')  # For Glob/Grep

        return {
            'tool_name': tool_name,
            'file_path': file_path,
            'command': command,
            'path': path,
            'cwd': cwd
        }
    except (json.JSONDecodeError, KeyError):
        return {}


# Safe substitution patterns that don't pose path traversal risk
SAFE_SUBSTITUTION_PATTERNS = [
    r'^\$\(date[^)]*\)$',           # Date commands
    r'^\$\(whoami\)$',              # User identification
    r'^\$\(pwd\)$',                 # Current directory (already known)
    r'^\$\(hostname\)$',            # System hostname
    r'^\$\(uname[^)]*\)$',          # System info
    r'^\$\{PWD\}$',                 # PWD variable
    r'^\$\{USER\}$',                # USER variable
    r'^\$\{HOSTNAME\}$',            # HOSTNAME variable
    r'^\$\{SHELL\}$',               # SHELL variable
    r'^\$\{TERM\}$',                # TERM variable
]


def detect_command_substitution(cmd: str) -> list:
    """
    Detect command substitution patterns that could bypass path checks.
    Returns list of detected patterns.
    """
    patterns = [
        (r'\$\([^)]+\)', 'Command substitution $()'),
        (r'`[^`]+`', 'Backtick command substitution'),
        (r'\$\{[^}]+\}', 'Variable expansion ${}'),
    ]

    detected = []
    for pattern, description in patterns:
        matches = re.findall(pattern, cmd)
        for match in matches:
            detected.append({
                'type': description,
                'match': match[:50]
            })

    return detected


def is_safe_substitution(substitutions: list) -> bool:
    """
    Check if all detected substitutions are in the safe allowlist.

    Safe substitutions include date, pwd, hostname, etc. that cannot
    be used for path traversal or code injection.
    """
    for sub in substitutions:
        match = sub.get('match', '')
        is_safe = False
        for safe_pattern in SAFE_SUBSTITUTION_PATTERNS:
            if re.match(safe_pattern, match):
                is_safe = True
                break
        if not is_safe:
            return False
    return True


def extract_paths_from_command(cmd: str) -> list:
    """Extract file/directory paths from a bash command."""
    paths = []

    # Common commands that take file paths
    path_patterns = [
        # File operations
        (r'\bcat\s+([^\s|;&>]+)', 'read'),
        (r'\bhead\s+(?:-[n0-9]+\s+)?([^\s|;&>]+)', 'read'),
        (r'\btail\s+(?:-[n0-9]+\s+)?([^\s|;&>]+)', 'read'),
        (r'\bless\s+([^\s|;&>]+)', 'read'),
        (r'\bmore\s+([^\s|;&>]+)', 'read'),
        (r'\bcp\s+(?:-[rRfv]+\s+)*([^\s]+)\s+([^\s|;&>]+)', 'copy'),
        (r'\bmv\s+(?:-[fv]+\s+)*([^\s]+)\s+([^\s|;&>]+)', 'move'),
        (r'\brm\s+(?:-[rRfv]+\s+)*([^\s|;&>]+)', 'delete'),
        (r'\bmkdir\s+(?:-[pv]+\s+)*([^\s|;&>]+)', 'create'),
        (r'\btouch\s+([^\s|;&>]+)', 'create'),

        # Directory navigation
        (r'\bcd\s+([^\s|;&>]+)', 'navigate'),

        # Editor operations
        (r'\bvim?\s+([^\s|;&>]+)', 'edit'),
        (r'\bnano\s+([^\s|;&>]+)', 'edit'),
        (r'\bemacs\s+([^\s|;&>]+)', 'edit'),

        # Redirections
        (r'>\s*([^\s|;&]+)', 'write'),
        (r'>>\s*([^\s|;&]+)', 'append'),

        # Additional file operations
        (r'\bchmod\s+(?:[0-7]+|[ugoa]+[+-=][rwxXst]+)\s+([^\s|;&>]+)', 'modify'),
        (r'\bchown\s+[^\s]+\s+([^\s|;&>]+)', 'modify'),
        (r'\bln\s+(?:-[sf]+\s+)*([^\s]+)', 'link'),
    ]

    for pattern, op_type in path_patterns:
        matches = re.finditer(pattern, cmd)
        for match in matches:
            for group in match.groups():
                if group and not group.startswith('-'):
                    # Skip if it looks like command substitution
                    if group.startswith('$') or group.startswith('`'):
                        continue
                    paths.append({'path': group, 'operation': op_type})

    return paths


def check_bash_command(cmd: str, cwd: str) -> tuple:
    """
    Check bash command for paths outside repository.
    Returns: (is_violation, is_absolute_block, message, paths, substitutions, substitution_blocked)

    Note: substitution_blocked is True if the command was blocked due to unsafe substitutions
    """
    # First detect command substitution
    substitutions = detect_command_substitution(cmd)

    # NEW: Block commands with unsafe substitution by default
    substitution_blocked = False
    if substitutions and not is_safe_substitution(substitutions):
        # Check for override
        override_valid, _ = OverrideManager.check_and_consume_override('COMMAND_SUBSTITUTION')

        if not override_valid:
            substitution_blocked = True
            return (
                True,   # is_violation
                False,  # is_absolute_block (can be overridden)
                "Command contains substitution patterns that cannot be validated for path safety",
                [],     # no specific paths (we can't evaluate them)
                substitutions,
                substitution_blocked
            )
        else:
            # Log that override was used
            AuditLogger.log_override_used(
                VALIDATOR_NAME,
                'BMAD_ALLOW_COMMAND_SUBSTITUTION',
                cmd[:200]
            )

    paths = extract_paths_from_command(cmd)
    violations = []

    for path_info in paths:
        path = path_info['path']
        operation = path_info['operation']

        if not is_path_in_repo(path, cwd):
            resolved = resolve_path(path, cwd)
            violations.append({
                'path': path,
                'resolved': resolved,
                'operation': operation
            })

    if not violations:
        return False, False, '', [], substitutions, False

    # Check if any violations are rm (delete) operations - ABSOLUTE BLOCK
    delete_violations = [v for v in violations if v['operation'] == 'delete']

    if delete_violations:
        return True, True, "ABSOLUTE BLOCK: rm command targets path outside repository", delete_violations, substitutions, False

    return True, False, "Operation targets path outside repository", violations, substitutions, False


def check_file_path(file_path: str, cwd: str, tool_name: str) -> tuple:
    """
    Check if file path is outside repository.
    Returns: (is_violation, message)
    """
    if not file_path:
        return False, ''

    if not is_path_in_repo(file_path, cwd):
        resolved = resolve_path(file_path, cwd)
        return True, f"{tool_name} targets path outside repository: {resolved}"

    return False, ''


def main():
    operation = get_operation_from_stdin()

    if not operation:
        sys.exit(0)

    tool_name = operation.get('tool_name', '')
    cwd = operation.get('cwd', PROJECT_DIR)

    # Check based on tool type
    if operation.get('command'):
        # Bash command
        is_violation, is_absolute, message, paths, substitutions, substitution_blocked = check_bash_command(operation['command'], cwd)

        if is_violation:
            # Handle command substitution block separately
            if substitution_blocked:
                AuditLogger.log_blocked(VALIDATOR_NAME, message, operation['command'],
                                       {'block_type': 'SUBSTITUTION',
                                        'patterns': [s['match'] for s in substitutions]})
                print(f"\n{'='*60}", file=sys.stderr)
                print(f"BMAD GUARDRAIL: COMMAND SUBSTITUTION BLOCKED", file=sys.stderr)
                print(f"{'='*60}", file=sys.stderr)
                print(f"\n{message}", file=sys.stderr)
                print(f"\nCommand: {operation['command']}", file=sys.stderr)
                print(f"\nDetected substitution patterns:", file=sys.stderr)
                for sub in substitutions:
                    print(f"  - {sub['type']}: {sub['match']}", file=sys.stderr)
                print(f"\nSafe patterns (allowlisted):", file=sys.stderr)
                print(f"  $(date), $(pwd), $(whoami), $(hostname), $(uname)", file=sys.stderr)
                print(f"  ${{PWD}}, ${{USER}}, ${{HOSTNAME}}, ${{SHELL}}, ${{TERM}}", file=sys.stderr)
                print(f"\nTo override (if you understand the security implications):", file=sys.stderr)
                print(f"  export BMAD_ALLOW_COMMAND_SUBSTITUTION=true", file=sys.stderr)
                print(f"\nNote: This allows commands with dynamic path resolution.", file=sys.stderr)
                print(f"      Ensure you trust the command source.", file=sys.stderr)
                print(f"{'='*60}\n", file=sys.stderr)
                sys.exit(2)

            if is_absolute:
                # ABSOLUTE BLOCK for rm outside repo
                AuditLogger.log_blocked(VALIDATOR_NAME, message, operation['command'],
                                       {'block_type': 'ABSOLUTE', 'paths': [p['path'] for p in paths]})
                print(f"\n{'='*60}", file=sys.stderr)
                print(f"BMAD GUARDRAIL: ABSOLUTE BLOCK", file=sys.stderr)
                print(f"{'='*60}", file=sys.stderr)
                print(f"\n{message}", file=sys.stderr)
                print(f"\nCommand: {operation['command']}", file=sys.stderr)
                print(f"\nPaths outside repository:", file=sys.stderr)
                for v in paths:
                    print(f"  - {v['path']} -> {v['resolved']} ({v['operation']})", file=sys.stderr)
                print(f"\nRepository: {PROJECT_DIR}", file=sys.stderr)
                print(f"\nThis operation is BLOCKED and cannot be overridden.", file=sys.stderr)
                print(f"Deleting files outside the repository is never allowed.", file=sys.stderr)
                print(f"{'='*60}\n", file=sys.stderr)
                sys.exit(2)
            else:
                # STRICT BLOCK with override option (single-use)
                override_valid, _ = OverrideManager.check_and_consume_override('OUTSIDE_REPO')
                if override_valid:
                    AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', operation['command'])
                    print(f"WARNING: {message} - ALLOWED via single-use override", file=sys.stderr)
                    for v in paths:
                        print(f"  - {v['path']} -> {v['resolved']}", file=sys.stderr)
                    print(f"  Override consumed. Set BMAD_ALLOW_OUTSIDE_REPO=true again for next operation.", file=sys.stderr)
                    sys.exit(0)

                AuditLogger.log_blocked(VALIDATOR_NAME, message, operation['command'],
                                       {'block_type': 'STRICT', 'paths': [p['path'] for p in paths]})
                print(f"\n{'='*60}", file=sys.stderr)
                print(f"BMAD GUARDRAIL: OUTSIDE REPOSITORY", file=sys.stderr)
                print(f"{'='*60}", file=sys.stderr)
                print(f"\n{message}", file=sys.stderr)
                print(f"\nCommand: {operation['command']}", file=sys.stderr)
                print(f"\nPaths outside repository:", file=sys.stderr)
                for v in paths:
                    print(f"  - {v['path']} -> {v['resolved']} ({v['operation']})", file=sys.stderr)
                print(f"\nRepository: {PROJECT_DIR}", file=sys.stderr)
                print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
                print(f"  export BMAD_ALLOW_OUTSIDE_REPO=true", file=sys.stderr)
                print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
                print(f"{'='*60}\n", file=sys.stderr)
                sys.exit(2)
        elif substitutions:
            # Command passed but has safe substitutions - log info
            AuditLogger.log(VALIDATOR_NAME, 'INFO',
                           {'message': 'Command contains safe substitution patterns',
                            'patterns': [s['match'] for s in substitutions],
                            'command': operation['command'][:200]},
                           severity='INFO')

    elif operation.get('file_path'):
        # File operation (Read, Write, Edit)
        is_violation, message = check_file_path(operation['file_path'], cwd, tool_name)

        if is_violation:
            override_valid, _ = OverrideManager.check_and_consume_override('OUTSIDE_REPO')
            if override_valid:
                AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', operation['file_path'])
                print(f"WARNING: {message} - ALLOWED via single-use override", file=sys.stderr)
                print(f"  Override consumed. Set BMAD_ALLOW_OUTSIDE_REPO=true again for next operation.", file=sys.stderr)
                sys.exit(0)

            resolved = resolve_path(operation['file_path'], cwd)
            AuditLogger.log_blocked(VALIDATOR_NAME, message, operation['file_path'],
                                   {'resolved': resolved})
            print(f"\n{'='*60}", file=sys.stderr)
            print(f"BMAD GUARDRAIL: OUTSIDE REPOSITORY", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            print(f"\n{message}", file=sys.stderr)
            print(f"\nFile: {operation['file_path']}", file=sys.stderr)
            print(f"Resolved: {resolved}", file=sys.stderr)
            print(f"\nRepository: {PROJECT_DIR}", file=sys.stderr)
            print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
            print(f"  export BMAD_ALLOW_OUTSIDE_REPO=true", file=sys.stderr)
            print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
            print(f"{'='*60}\n", file=sys.stderr)
            sys.exit(2)

    elif operation.get('path'):
        # Glob/Grep operation
        is_violation, message = check_file_path(operation['path'], cwd, tool_name)

        if is_violation:
            override_valid, _ = OverrideManager.check_and_consume_override('OUTSIDE_REPO')
            if override_valid:
                AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', operation['path'])
                print(f"WARNING: {message} - ALLOWED via single-use override", file=sys.stderr)
                print(f"  Override consumed. Set BMAD_ALLOW_OUTSIDE_REPO=true again for next operation.", file=sys.stderr)
                sys.exit(0)

            resolved = resolve_path(operation['path'], cwd)
            AuditLogger.log_blocked(VALIDATOR_NAME, message, operation['path'],
                                   {'resolved': resolved})
            print(f"\n{'='*60}", file=sys.stderr)
            print(f"BMAD GUARDRAIL: OUTSIDE REPOSITORY", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            print(f"\n{message}", file=sys.stderr)
            print(f"\nPath: {operation['path']}", file=sys.stderr)
            print(f"Resolved: {resolved}", file=sys.stderr)
            print(f"\nRepository: {PROJECT_DIR}", file=sys.stderr)
            print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
            print(f"  export BMAD_ALLOW_OUTSIDE_REPO=true", file=sys.stderr)
            print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
            print(f"{'='*60}\n", file=sys.stderr)
            sys.exit(2)

    # All checks passed
    sys.exit(0)


if __name__ == '__main__':
    main()
