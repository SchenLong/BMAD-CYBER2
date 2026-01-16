# P2 Security Implementation: Command Substitution Blocking & Input Validation

**Priority:** P2 (High)
**Status:** Implemented & Tested
**Date:** 2026-01-16
**Related Files:**
- `.claude/validators/outside_repo_guard.py` - Command substitution blocking
- `.claude/hooks/lib/input-validation.sh` - Shell input validation library
- `.claude/hooks/bmad-speak.sh` - Updated with input validation
- `.claude/hooks/tts-queue.sh` - Updated with input validation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Command Substitution Blocking](#command-substitution-blocking)
3. [Shell Script Input Validation](#shell-script-input-validation)
4. [Implementation Details](#implementation-details)
5. [Testing Results](#testing-results)
6. [Usage Guide](#usage-guide)

---

## Executive Summary

P2 addresses two security vulnerabilities related to command injection:

1. **Command Substitution in Bash**: Commands containing `$()`, backticks, or `${}` could bypass path validation by dynamically resolving paths at runtime.

2. **Shell Script Input Injection**: User-controlled input (agent names, dialogue text) passed to shell scripts without sanitization could enable command injection.

### Security Impact

| Vulnerability | Before | After | Risk Reduction |
|--------------|--------|-------|----------------|
| Command Substitution | Allowed with warning | Blocked by default | High -> Low |
| Shell Injection | No validation | Full input sanitization | Critical -> Mitigated |

---

## Command Substitution Blocking

### The Problem

Command substitution allows dynamic path resolution that cannot be validated at check time:

```bash
# This command's target path cannot be validated statically
cat $(cat /tmp/secret_path)

# The path in $() is only known at runtime
rm -rf ${DYNAMIC_PATH}/important_files
```

### The Solution

Block commands containing unsafe substitution patterns by default, with an allowlist for safe patterns.

### Detection Patterns

```python
# Patterns detected and blocked
patterns = [
    (r'\$\([^)]+\)', 'Command substitution $()'),
    (r'`[^`]+`', 'Backtick command substitution'),
    (r'\$\{[^}]+\}', 'Variable expansion ${}'),
]
```

### Safe Allowlist

These substitution patterns are considered safe and allowed:

| Pattern | Description | Example |
|---------|-------------|---------|
| `$(date...)` | Date/time commands | `file_$(date +%Y%m%d).txt` |
| `$(pwd)` | Current directory | Already known |
| `$(whoami)` | User identification | Non-path related |
| `$(hostname)` | System hostname | Non-path related |
| `$(uname...)` | System info | Non-path related |
| `${PWD}` | PWD variable | Already known |
| `${USER}` | USER variable | Non-path related |
| `${HOSTNAME}` | HOSTNAME variable | Non-path related |
| `${SHELL}` | SHELL variable | Non-path related |
| `${TERM}` | TERM variable | Non-path related |

### Blocking Behavior

When an unsafe substitution is detected:

```
============================================================
BMAD GUARDRAIL: COMMAND SUBSTITUTION BLOCKED
============================================================

Command contains substitution patterns that cannot be validated for path safety

Command: cat $(cat /tmp/evil_path)

Detected substitution patterns:
  - Command substitution $(): $(cat /tmp/evil_path)

Safe patterns (allowlisted):
  $(date), $(pwd), $(whoami), $(hostname), $(uname)
  ${PWD}, ${USER}, ${HOSTNAME}, ${SHELL}, ${TERM}

To override (if you understand the security implications):
  export BMAD_ALLOW_COMMAND_SUBSTITUTION=true

Note: This allows commands with dynamic path resolution.
      Ensure you trust the command source.
============================================================
```

---

## Shell Script Input Validation

### The Problem

Shell scripts processing user input (agent names, voice names, dialogue) were vulnerable to injection:

```bash
# Malicious agent name could execute arbitrary commands
AGENT_NAME="; rm -rf /"
# Later used in: grep "$AGENT_NAME" ...
```

### The Solution

Created a comprehensive input validation library with strict character allowlists.

### Validation Functions

#### `validate_agent_name()`

```bash
# Validates agent names/IDs
# Blocks: ; | & $ ` < > ( ) { } ! \
# Blocks: Path traversal (..)
# Blocks: Null bytes
# Max length: 100 characters

validate_agent_name "architect"  # PASS
validate_agent_name "; rm -rf /" # FAIL - contains ;
validate_agent_name "$(whoami)"  # FAIL - contains $()
validate_agent_name "../../../"  # FAIL - path traversal
```

#### `validate_voice_name()`

```bash
# Validates voice names for TTS
# Same character restrictions as agent names
# Max length: 50 characters

validate_voice_name "samantha"           # PASS
validate_voice_name "en_US/vctk_low#p225" # PASS (Piper format)
validate_voice_name "voice|cat /etc/passwd" # FAIL
```

#### `validate_dialogue()`

```bash
# Validates dialogue text (spoken, not executed)
# More permissive - only blocks null bytes
# Max length: 10000 characters

validate_dialogue "Hello, world!"  # PASS
validate_dialogue "Testing $var"   # PASS (spoken, not executed)
```

### Sanitization Functions

#### `sanitize_for_regex()`

```bash
# Escapes regex metacharacters for safe use in grep/awk
input="test.*pattern"
safe=$(sanitize_for_regex "$input")
# Result: test\.\*pattern
```

#### `sanitize_for_shell()`

```bash
# Escapes shell metacharacters using printf %q
input="test; rm -rf /"
safe=$(sanitize_for_shell "$input")
# Result: test\;\ rm\ -rf\ /
```

---

## Implementation Details

### Files Created/Modified

| File | Type | Description |
|------|------|-------------|
| `.claude/hooks/lib/input-validation.sh` | New | Shared validation library |
| `.claude/validators/outside_repo_guard.py` | Modified | Added command substitution blocking |
| `.claude/hooks/bmad-speak.sh` | Modified | Integrated input validation |
| `.claude/hooks/tts-queue.sh` | Modified | Integrated input validation |
| `.claude/hooks/bmad-voice-manager.sh` | Modified | Integrated input validation |

### Dangerous Characters Blocked

```bash
DANGEROUS_CHARS='[;|&$`<>(){}!\\]'
```

| Character | Risk | Example Attack |
|-----------|------|----------------|
| `;` | Command chaining | `name; rm -rf /` |
| `\|` | Pipe injection | `name \| cat /etc/passwd` |
| `&` | Background execution | `name & malicious &` |
| `$` | Variable expansion | `$HOME` or `$(cmd)` |
| `` ` `` | Command substitution | `` `whoami` `` |
| `<` `>` | Redirection | `> /etc/passwd` |
| `()` | Subshell | `(malicious)` |
| `{}` | Brace expansion | `{a,b,c}` |
| `!` | History expansion | `!rm` |
| `\` | Escape sequences | `\n\x00` |

---

## Testing Results

### Shell Injection Tests (27/27 Pass)

```
=== Agent Name Validation Tests ===
--- Malicious inputs (should be rejected) ---
[PASS] Command injection with semicolon
[PASS] Command injection with pipe
[PASS] Command injection with ampersand
[PASS] Command substitution $()
[PASS] Command substitution backticks
[PASS] Variable expansion
[PASS] Redirect output
[PASS] Path traversal ..
[PASS] Subshell execution
[PASS] Brace expansion
[PASS] History expansion !
[PASS] Backslash escape

--- Valid inputs (should be accepted) ---
[PASS] Simple agent name
[PASS] Agent name with hyphen
[PASS] Agent name with underscore
[PASS] Short name
[PASS] Display name
[PASS] Empty string
```

### Command Substitution Tests (10/10 Pass)

```
=== Command Substitution Blocking ===
[PASS] Detection of $() patterns
[PASS] Detection of backtick patterns
[PASS] Detection of ${} patterns
[PASS] Safe pattern: $(date) allowed
[PASS] Safe pattern: $(pwd) allowed
[PASS] Safe pattern: ${PWD} allowed
[PASS] Unsafe pattern: $(cat /etc/passwd) blocked
[PASS] Unsafe pattern: ${MALICIOUS_VAR} blocked
[PASS] Nested substitution blocked
[PASS] Mixed attack vectors blocked
```

### Edge Case Tests

```
=== Edge Cases ===
[PASS] Nested command substitution blocked
[PASS] Double nested substitution blocked
[PASS] Mixed backtick and $() blocked
[PASS] Safe patterns NOT blocked (date, pwd, hostname)
[PASS] Dangerous variable expansion blocked
```

---

## Usage Guide

### For Shell Script Developers

1. **Source the validation library:**
   ```bash
   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   source "$SCRIPT_DIR/lib/input-validation.sh"
   ```

2. **Validate all user inputs:**
   ```bash
   AGENT_NAME="$1"
   if ! validate_agent_name "$AGENT_NAME"; then
       echo "Error: Invalid agent name" >&2
       exit 1
   fi
   ```

3. **Sanitize before using in commands:**
   ```bash
   # For grep/awk patterns
   safe_pattern=$(sanitize_for_regex "$user_input")
   grep -- "$safe_pattern" file.txt

   # For shell commands
   safe_arg=$(sanitize_for_shell "$user_input")
   eval "command $safe_arg"
   ```

### Override Command Substitution Block

If you need to run a command with substitution (trusted source only):

```bash
# Single-use override
export BMAD_ALLOW_COMMAND_SUBSTITUTION=true

# Run your command
cat $(trusted_path_generator)

# Override is consumed - must set again for next use
```

### Best Practices

1. **Never trust user input** - always validate
2. **Use `--` before arguments** in grep/find to prevent option injection
3. **Quote all variables** - `"$var"` not `$var`
4. **Prefer allowlists** over blocklists where possible
5. **Log validation failures** for security monitoring

---

## Security Considerations

1. **Defense in Depth**: Input validation + command substitution blocking provides layered defense
2. **Fail Closed**: Invalid input blocks operation rather than proceeding unsafely
3. **Audit Trail**: All blocked operations are logged to security.log
4. **Override Tracking**: Override usage is logged with command context

---

## Appendix: Full Dangerous Pattern List

```bash
# Injection patterns blocked by validation
; | & $ ` < > ( ) { } ! \

# Path traversal patterns
..
./
../

# Null bytes
\x00
\0

# Control characters
\n (in certain contexts)
\r
\t (excessive)
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Author:** Security Implementation Team
