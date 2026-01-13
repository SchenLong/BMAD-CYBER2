#!/usr/bin/env python3
"""
BMAD Guardrails: Bash Command Safety Validator
===============================================
Validates bash commands before execution to prevent dangerous operations.

Exit Codes:
- 0: Command is safe to execute
- 2: Command is blocked (dangerous pattern detected)

Blocking Categories:
1. ABSOLUTE BLOCKS (cannot be overridden):
   - Fork bombs
   - Full disk wipes (rm -rf /, dd if=/dev/zero of=/dev/sda)
   - Kernel/bootloader modifications

2. STRICT BLOCKS (override with BMAD_ALLOW_DANGEROUS=true):
   - Recursive force delete with wildcards
   - Permission/ownership changes on system paths
   - Network exfiltration patterns
"""

import os
import re
import sys

# Add validators directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from security_common import (
    AuditLogger,
    OverrideManager,
    get_tool_input_from_stdin,
    print_block_message,
    PROJECT_DIR
)

VALIDATOR_NAME = 'bash_safety'

# =============================================================================
# ABSOLUTE BLOCKS - These CANNOT be overridden
# =============================================================================

ABSOLUTE_BLOCK_PATTERNS = [
    # Fork bombs
    (r':\(\)\s*\{\s*:\|:\s*&\s*\}\s*;:', 'Fork bomb detected'),
    (r'\.\s*/dev/tcp/', 'Reverse shell pattern'),

    # Full system wipes
    (r'rm\s+(-[rfv]+\s+)*/', 'Recursive delete from root'),
    (r'rm\s+(-[rfv]+\s+)*/\*', 'Recursive delete of root contents'),
    (r'dd\s+.*of=/dev/[sh]d[a-z]', 'Direct disk write (dd to block device)'),
    (r'dd\s+.*of=/dev/nvme', 'Direct disk write (dd to NVMe)'),
    (r'mkfs\s+', 'Filesystem format command'),

    # Kernel/bootloader
    (r'rm\s+.*(/boot/|/vmlinuz|/initrd)', 'Kernel/boot file deletion'),
    (r'dd\s+.*of=/dev/mem', 'Direct memory write'),

    # System destruction
    (r'chmod\s+(-R\s+)?777\s+/', 'Recursive chmod 777 on root'),
    (r'chown\s+(-R\s+)?.*\s+/', 'Recursive chown on root'),
]

# =============================================================================
# STRICT BLOCKS - Can be overridden with BMAD_ALLOW_DANGEROUS=true
# =============================================================================

STRICT_BLOCK_PATTERNS = [
    # Dangerous deletes
    (r'rm\s+(-[rfv]+\s+)+\*', 'Recursive force delete with wildcard'),
    (r'rm\s+(-[rfv]+\s+)+\.\.', 'Recursive delete of parent directory'),
    (r'rm\s+(-[rfv]+\s+)+~', 'Recursive delete of home directory'),

    # System file modifications
    (r'chmod\s+.*(/etc/|/usr/|/var/)', 'Permission change on system path'),
    (r'chown\s+.*(/etc/|/usr/|/var/)', 'Ownership change on system path'),

    # Network exfiltration patterns
    (r'curl\s+.*\|\s*sh', 'Curl pipe to shell'),
    (r'wget\s+.*\|\s*sh', 'Wget pipe to shell'),
    (r'curl\s+.*\|\s*bash', 'Curl pipe to bash'),
    (r'wget\s+.*\|\s*bash', 'Wget pipe to bash'),

    # Credential access
    (r'cat\s+.*(\.ssh/|\.gnupg/|\.aws/)', 'Reading credential files'),
    (r'cp\s+.*(\.ssh/|\.gnupg/|\.aws/)', 'Copying credential files'),
    (r'tar\s+.*\.ssh', 'Archiving SSH directory'),

    # History/log tampering
    (r'>\s*/var/log/', 'Truncating system logs'),
    (r'rm\s+.*\.bash_history', 'Deleting bash history'),
    (r'history\s+-c', 'Clearing shell history'),

    # Process/system manipulation
    (r'kill\s+-9\s+-1', 'Kill all processes'),
    (r'killall\s+-9', 'Killall with force'),
    (r'pkill\s+-9', 'Pkill with force'),

    # Sudo/privilege escalation
    (r'sudo\s+.*rm\s+-rf', 'Sudo with recursive force delete'),
    (r'sudo\s+.*chmod\s+777', 'Sudo chmod 777'),
    (r'sudo\s+.*>/etc/', 'Sudo redirect to /etc'),
]

# =============================================================================
# WARNING PATTERNS - Log but allow
# =============================================================================

WARNING_PATTERNS = [
    (r'sudo\s+', 'Command uses sudo'),
    (r'rm\s+-[rf]', 'Recursive or force delete'),
    (r'>\s+/dev/null\s+2>&1', 'Output suppression (may hide errors)'),
    (r'eval\s+', 'Eval usage (potential injection risk)'),
    (r'\$\(.*\)', 'Command substitution'),
    (r'`.*`', 'Backtick command substitution'),
]


def check_command(command: str) -> tuple:
    """
    Check a command against security patterns.

    Returns:
        Tuple of (action, reason, pattern_type)
        action: 'allow', 'block_absolute', 'block_strict', 'warn'
    """
    # Normalize command for pattern matching
    cmd_normalized = command.lower().strip()

    # Check absolute blocks first
    for pattern, reason in ABSOLUTE_BLOCK_PATTERNS:
        if re.search(pattern, cmd_normalized, re.IGNORECASE):
            return ('block_absolute', reason, 'absolute')

    # Check strict blocks
    for pattern, reason in STRICT_BLOCK_PATTERNS:
        if re.search(pattern, cmd_normalized, re.IGNORECASE):
            return ('block_strict', reason, 'strict')

    # Check warnings
    for pattern, reason in WARNING_PATTERNS:
        if re.search(pattern, cmd_normalized, re.IGNORECASE):
            return ('warn', reason, 'warning')

    return ('allow', 'No dangerous patterns detected', 'safe')


def main():
    # Read tool input from stdin
    data = get_tool_input_from_stdin()
    tool_input = data.get('tool_input', {})
    command = tool_input.get('command', '')

    if not command:
        # No command to check
        sys.exit(0)

    # Check the command
    action, reason, pattern_type = check_command(command)

    if action == 'allow':
        AuditLogger.log_allowed(VALIDATOR_NAME, reason, {'command': command[:200]})
        sys.exit(0)

    elif action == 'warn':
        AuditLogger.log(VALIDATOR_NAME, 'WARNING', {
            'reason': reason,
            'command': command[:200]
        }, severity='WARNING')
        sys.exit(0)

    elif action == 'block_absolute':
        AuditLogger.log_blocked(VALIDATOR_NAME, reason, command)
        print_block_message(
            title="ABSOLUTE BLOCK - Dangerous Command",
            message=f"This command contains a dangerous pattern: {reason}\n\n"
                    "This type of command CANNOT be executed through this interface.",
            command_or_file=command,
            is_absolute=True,
            recommendations=[
                "Review why this command is needed",
                "Use safer alternatives",
                "Execute manually if absolutely necessary (with extreme caution)"
            ]
        )
        sys.exit(2)

    elif action == 'block_strict':
        # Check for override
        override_valid, override_reason = OverrideManager.check_and_consume_override('DANGEROUS')

        if override_valid:
            AuditLogger.log_override_used(VALIDATOR_NAME, 'BMAD_ALLOW_DANGEROUS', command)
            print(f"Override accepted: {override_reason}", file=sys.stderr)
            sys.exit(0)

        AuditLogger.log_blocked(VALIDATOR_NAME, reason, command)
        print_block_message(
            title="STRICT BLOCK - Potentially Dangerous Command",
            message=f"This command was blocked because: {reason}\n\n"
                    "This command could cause significant damage if executed incorrectly.",
            command_or_file=command,
            override_var="BMAD_ALLOW_DANGEROUS",
            recommendations=[
                "Verify this is exactly what you intend to do",
                "Consider safer alternatives",
                "If certain, use the override shown below"
            ]
        )
        sys.exit(2)


if __name__ == '__main__':
    main()
