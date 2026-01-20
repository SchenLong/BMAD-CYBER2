#!/usr/bin/env python3
"""
BMAD Guardrails: Bash Safety Validator
=======================================
Blocks dangerous bash commands that could cause irreversible damage.

Exit Codes:
- 0: Allow the command
- 2: Block the command (with user override option for some)

Blocking Levels:
- ABSOLUTE BLOCK: rm -rf outside repo (no override possible)
- STRICT BLOCK: Dangerous patterns (user can override via env var)

Security Improvements (v2):
- Audit logging for all blocked/allowed operations
- Single-use override tokens with 5-minute timeout
- Command substitution detection
- Improved regex patterns for edge cases
"""

import json
import sys
import os
import re

# Import shared security utilities
try:
    from security_common import (
        AuditLogger, OverrideManager, resolve_path, is_path_in_repo,
        print_block_message, PROJECT_DIR
    )
except ImportError:
    # Fallback if module not found - basic functionality
    PROJECT_DIR = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())

    class AuditLogger:
        @classmethod
        def log_blocked(cls, *args, **kwargs): pass
        @classmethod
        def log_allowed(cls, *args, **kwargs): pass
        @classmethod
        def log_override_used(cls, *args, **kwargs): pass

    class OverrideManager:
        @classmethod
        def check_and_consume_override(cls, t):
            return os.environ.get(f'BMAD_ALLOW_{t.upper()}', '').lower() == 'true', ''

    def resolve_path(path, cwd):
        path = os.path.expanduser(path)
        if not os.path.isabs(path):
            path = os.path.join(cwd, path)
        return os.path.realpath(path)

    def is_path_in_repo(path, cwd, project_dir=PROJECT_DIR):
        resolved = resolve_path(path, cwd)
        repo_resolved = os.path.realpath(project_dir)
        return resolved.startswith(repo_resolved)


VALIDATOR_NAME = 'bash_safety'


def get_command_from_stdin():
    """Read the tool input from stdin (JSON format from Claude Code)."""
    try:
        data = json.load(sys.stdin)
        return data.get('tool_input', {}).get('command', ''), data.get('cwd', PROJECT_DIR)
    except (json.JSONDecodeError, KeyError):
        return '', PROJECT_DIR


def detect_command_substitution(cmd: str) -> list:
    """
    Detect command substitution patterns that could bypass path checks.

    Returns list of detected patterns for warning purposes.
    """
    patterns = [
        (r'\$\([^)]+\)', 'Command substitution $()'),
        (r'`[^`]+`', 'Backtick command substitution'),
        (r'\$\{[^}]+\}', 'Variable expansion ${}'),
        (r'\$[A-Za-z_][A-Za-z0-9_]*', 'Variable reference'),
    ]

    detected = []
    for pattern, description in patterns:
        if re.search(pattern, cmd):
            match = re.search(pattern, cmd)
            detected.append({
                'type': description,
                'match': match.group(0) if match else ''
            })

    return detected


def extract_rm_targets(cmd: str) -> list:
    """Extract target paths from rm commands."""
    parts = cmd.split()
    targets = []
    skip_next = False

    for i, part in enumerate(parts):
        if skip_next:
            skip_next = False
            continue
        if part in ('rm', 'sudo'):
            continue
        if part.startswith('-'):
            if part in ('-I', '--interactive'):
                skip_next = True
            continue
        targets.append(part)

    return targets


def check_dangerous_rm(cmd: str, cwd: str) -> tuple:
    """
    Check for dangerous rm commands.
    Returns: (is_dangerous, is_absolute_block, message)
    """
    # Improved patterns - handle command chaining and comments
    # Match dangerous rm even when followed by other commands
    absolute_block_patterns = [
        r'rm\s+(-[rfRF]+\s+)*[/~](\s|;|&|$|\|)',           # rm -rf / or rm -rf ~
        r'rm\s+(-[rfRF]+\s+)*/\s*(\s|;|&|$|\|)',           # rm -rf /
        r'rm\s+(-[rfRF]+\s+)*~\s*(\s|;|&|$|\|)',           # rm -rf ~
        r'rm\s+(-[rfRF]+\s+)*/home\b',                      # rm -rf /home
        r'rm\s+(-[rfRF]+\s+)*/Users\b',                     # rm -rf /Users (macOS)
        r'rm\s+(-[rfRF]+\s+)*/root\b',                      # rm -rf /root
        r'rm\s+(-[rfRF]+\s+)*\$HOME\b',                     # rm -rf $HOME
        r'rm\s+(-[rfRF]+\s+)*\*\s*(\s|;|&|$|\|)',          # rm -rf *
    ]

    for pattern in absolute_block_patterns:
        if re.search(pattern, cmd):
            return True, True, f"ABSOLUTE BLOCK: Catastrophically dangerous rm command detected"

    # Pattern 2: rm -rf outside repository (ABSOLUTE BLOCK)
    if re.search(r'\brm\b.*-[rfRF]', cmd):
        targets = extract_rm_targets(cmd)
        for target in targets:
            # Skip variable references (handled separately)
            if target.startswith('$'):
                continue
            if not is_path_in_repo(target, cwd):
                return True, True, f"ABSOLUTE BLOCK: rm -rf targets path outside repository: {target}"

    # Pattern 3: rm without -rf but still outside repo (STRICT BLOCK - overrideable)
    if re.search(r'\brm\b', cmd):
        targets = extract_rm_targets(cmd)
        for target in targets:
            if target.startswith('$'):
                continue
            if not is_path_in_repo(target, cwd):
                return True, False, f"STRICT BLOCK: rm targets path outside repository: {target}"

    return False, False, ""


def check_directory_escape(cmd: str, cwd: str) -> tuple:
    """
    Check for directory traversal attempts.
    Returns: (is_escape, message)
    """
    cd_match = re.search(r'\bcd\s+([^\s;&|]+)', cmd)
    if cd_match:
        target = cd_match.group(1)
        if target.startswith('/') and not is_path_in_repo(target, cwd):
            return True, f"Directory escape attempt: cd to {target} (outside repository)"

    if re.search(r'\.\./', cmd):
        traversal_count = cmd.count('../')
        if traversal_count >= 5:
            return True, f"Suspicious directory traversal: {traversal_count} levels of ../"

    return False, ""


def check_dangerous_patterns(cmd: str) -> tuple:
    """
    Check for other dangerous patterns.
    Returns: (is_dangerous, message)
    """
    dangerous_patterns = [
        (r'>\s*/dev/sd[a-z]', "Direct write to block device"),
        (r'mkfs\.', "Filesystem format command"),
        (r'dd\s+.*of=/dev/', "dd to device - potential disk wipe"),
        (r':\(\)\s*{\s*:\|:\s*&\s*};\s*:', "Fork bomb detected"),
        (r'chmod\s+(-[rR]+\s+)*777\s+/', "Dangerous chmod 777 on system path"),
        (r'chown\s+(-[rR]+\s+)*root', "Changing ownership to root"),
        # Additional patterns
        (r'curl\s+.*\|\s*(sudo\s+)?bash', "Pipe curl to bash (dangerous)"),
        (r'wget\s+.*\|\s*(sudo\s+)?bash', "Pipe wget to bash (dangerous)"),
        (r'eval\s+.*\$', "Eval with variable expansion"),
    ]

    for pattern, message in dangerous_patterns:
        if re.search(pattern, cmd):
            return True, f"STRICT BLOCK: {message}"

    return False, ""


def main():
    cmd, cwd = get_command_from_stdin()

    if not cmd:
        sys.exit(0)

    # Check for command substitution (warning)
    substitutions = detect_command_substitution(cmd)
    if substitutions:
        # Log the warning but don't block
        AuditLogger.log(VALIDATOR_NAME, 'WARNING',
                       {'message': 'Command substitution detected',
                        'patterns': substitutions,
                        'command': cmd[:200]},
                       severity='WARNING')

    # Check 1: Dangerous rm commands
    is_dangerous, is_absolute, message = check_dangerous_rm(cmd, cwd)
    if is_dangerous:
        if is_absolute:
            # ABSOLUTE BLOCK - no override possible
            AuditLogger.log_blocked(VALIDATOR_NAME, message, cmd,
                                   {'block_type': 'ABSOLUTE'})
            print(f"\n{'='*60}", file=sys.stderr)
            print(f"BMAD GUARDRAIL: ABSOLUTE BLOCK", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            print(f"\n{message}", file=sys.stderr)
            print(f"\nCommand: {cmd}", file=sys.stderr)
            print(f"\nThis command is BLOCKED and cannot be overridden.", file=sys.stderr)
            print(f"This protection exists to prevent catastrophic data loss.", file=sys.stderr)
            print(f"{'='*60}\n", file=sys.stderr)
            sys.exit(2)
        else:
            # STRICT BLOCK - check for override (single-use)
            override_valid, override_reason = OverrideManager.check_and_consume_override('DANGEROUS')
            if override_valid:
                AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_DANGEROUS', cmd)
                print(f"WARNING: {message} - ALLOWED via single-use override", file=sys.stderr)
                print(f"  Override consumed. Set BMAD_ALLOW_DANGEROUS=true again for next operation.", file=sys.stderr)
                sys.exit(0)
            else:
                AuditLogger.log_blocked(VALIDATOR_NAME, message, cmd,
                                       {'block_type': 'STRICT'})
                print(f"\n{'='*60}", file=sys.stderr)
                print(f"BMAD GUARDRAIL: STRICT BLOCK", file=sys.stderr)
                print(f"{'='*60}", file=sys.stderr)
                print(f"\n{message}", file=sys.stderr)
                print(f"\nCommand: {cmd}", file=sys.stderr)
                print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
                print(f"  export BMAD_ALLOW_DANGEROUS=true", file=sys.stderr)
                print(f"\nNote: Override will be consumed after one use.", file=sys.stderr)
                print(f"{'='*60}\n", file=sys.stderr)
                sys.exit(2)

    # Check 2: Directory escape
    is_escape, message = check_directory_escape(cmd, cwd)
    if is_escape:
        override_valid, _ = OverrideManager.check_and_consume_override('ESCAPE')
        if override_valid:
            AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_ESCAPE', cmd)
            print(f"WARNING: {message} - ALLOWED via single-use override", file=sys.stderr)
            sys.exit(0)
        else:
            AuditLogger.log_blocked(VALIDATOR_NAME, message, cmd,
                                   {'block_type': 'DIRECTORY_ESCAPE'})
            print(f"\n{'='*60}", file=sys.stderr)
            print(f"BMAD GUARDRAIL: DIRECTORY ESCAPE BLOCKED", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            print(f"\n{message}", file=sys.stderr)
            print(f"\nCommand: {cmd}", file=sys.stderr)
            print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
            print(f"  export BMAD_ALLOW_ESCAPE=true", file=sys.stderr)
            print(f"{'='*60}\n", file=sys.stderr)
            sys.exit(2)

    # Check 3: Other dangerous patterns
    is_dangerous, message = check_dangerous_patterns(cmd)
    if is_dangerous:
        override_valid, _ = OverrideManager.check_and_consume_override('DANGEROUS')
        if override_valid:
            AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_DANGEROUS', cmd)
            print(f"WARNING: {message} - ALLOWED via single-use override", file=sys.stderr)
            sys.exit(0)
        else:
            AuditLogger.log_blocked(VALIDATOR_NAME, message, cmd,
                                   {'block_type': 'DANGEROUS_PATTERN'})
            print(f"\n{'='*60}", file=sys.stderr)
            print(f"BMAD GUARDRAIL: DANGEROUS PATTERN BLOCKED", file=sys.stderr)
            print(f"{'='*60}", file=sys.stderr)
            print(f"\n{message}", file=sys.stderr)
            print(f"\nCommand: {cmd}", file=sys.stderr)
            print(f"\nTo override (single-use, expires in 5 minutes):", file=sys.stderr)
            print(f"  export BMAD_ALLOW_DANGEROUS=true", file=sys.stderr)
            print(f"{'='*60}\n", file=sys.stderr)
            sys.exit(2)

    # All checks passed
    sys.exit(0)


if __name__ == '__main__':
    main()
