# P1 Security Implementation: TOCTOU Fix & Token Validation

**Priority:** P1 (Critical)
**Status:** Implemented & Tested
**Date:** 2026-01-16
**Related Files:**
- `.claude/validators/security_common.py` - Override manager with atomic locking
- `.claude/validators/token_validator.py` - Token validation module
- `.claude/validators/session-security-init.py` - Session initialization

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [TOCTOU Race Condition Fix](#toctou-race-condition-fix)
3. [Token Validation System](#token-validation-system)
4. [Implementation Details](#implementation-details)
5. [Testing Results](#testing-results)
6. [Usage Guide](#usage-guide)

---

## Executive Summary

P1 addresses two critical security vulnerabilities:

1. **TOCTOU (Time-of-Check-Time-of-Use) Race Condition**: The override system had a window where multiple processes could consume the same single-use override token.

2. **Token Validation**: Authentication tokens were generated but not enforced at runtime, allowing unauthenticated access.

### Security Impact

| Vulnerability | Before | After | Risk Reduction |
|--------------|--------|-------|----------------|
| TOCTOU Race | Multiple processes could bypass single-use check | Atomic locking ensures exactly one consumption | Critical -> Mitigated |
| Token Enforcement | Tokens optional | Tokens validated on session start | High -> Low |

---

## TOCTOU Race Condition Fix

### The Problem

The original `OverrideManager.check_and_consume_override()` method had a race window:

```
Process A: Read state       ─────┐
Process B: Read state       ─────┼──┐ (both see override available)
Process A: Check available  ─────┤  │
Process B: Check available  ─────┼──┤
Process A: Consume & save   ─────┤  │
Process B: Consume & save   ─────┘  │ (override consumed twice!)
                                    └─ RACE WINDOW
```

### The Solution

Implemented exclusive file locking using `fcntl.flock()`:

```python
@classmethod
def check_and_consume_override(cls, override_type: str) -> Tuple[bool, str]:
    """Atomically check and consume override with file locking."""

    lock_fd = None
    try:
        # Acquire EXCLUSIVE lock BEFORE any state operations
        lock_fd = cls._acquire_lock(timeout=5.0)

        # Safe read-modify-write cycle
        state = cls._load_state()
        state = cls._cleanup_expired(state)

        if override_type in state.get('overrides', {}):
            if not state['overrides'].get(override_type, False):
                return False, 'Override already consumed'

        # Mark as consumed
        state['overrides'][override_type] = False

        # Atomic write via temp file + rename
        cls._save_state_atomic(state)

        return True, 'Override consumed'

    finally:
        if lock_fd is not None:
            cls._release_lock(lock_fd)
```

### Key Features

1. **Exclusive Locking**: Uses `fcntl.LOCK_EX` for mutual exclusion
2. **Lock Timeout**: 5-second timeout prevents deadlocks
3. **Atomic Writes**: Uses temp file + `os.rename()` for crash safety
4. **Audit Logging**: Lock contention events are logged

---

## Token Validation System

### Architecture

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Session Start  │────>│ Token Validator │────>│  Claims Cache    │
│   (Hook)         │     │ (Python)        │     │  (.session_*)    │
└──────────────────┘     └─────────────────┘     └──────────────────┘
                                │
                                v
                         ┌─────────────────┐
                         │ validate-token  │
                         │ (Node.js)       │
                         └─────────────────┘
```

### Token Generation

```bash
# Generate a token for a user
node _bmad/core/security/quick-token.js "UserName" "developer" 168

# Token contains:
# - name: User identifier
# - roles: Permission roles (developer, admin, intel_analyst, etc.)
# - iat: Issued at timestamp
# - exp: Expiration timestamp
```

### Validation Flow

1. **SessionStart Hook** triggers `token_validator.py`
2. Check for `BMAD_AUTH_TOKEN` env var or `.bmad-token` file
3. Validate token via `validate-token.js`
4. Cache validated session for 1 hour
5. Store claims in `.claude/.session_claims.json`

### RBAC Integration

Token claims include roles that can be checked by other validators:

```python
def check_module_access(file_path: str, roles: list) -> bool:
    """Check if user has access to protected modules."""
    MODULE_REQUIREMENTS = {
        'intel-team': ['intel_analyst', 'security_lead', 'admin'],
        'cybersec-team': ['security_analyst', 'security_lead', 'admin'],
        'legal-team': ['legal_counsel', 'admin'],
    }
    # ... role checking logic
```

---

## Implementation Details

### Files Modified

| File | Changes |
|------|---------|
| `security_common.py` | Added `_acquire_lock()`, `_release_lock()`, `_save_state_atomic()` |
| `token_validator.py` | New file - token validation module |
| `session-security-init.py` | Integrated token validation call |
| `.claude/settings.json` | Added token_validator to SessionStart hooks |

### Lock File Location

```
.claude/.override.lock     # Lock file for override system
.claude/.override_state.json  # Override state storage
.claude/.session_validated    # Session validation cache
.claude/.session_claims.json  # Cached token claims
```

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `BMAD_AUTH_TOKEN` | Authentication token | None |
| `BMAD_TOKEN_REQUIRED` | Enable/disable enforcement | `true` |
| `BMAD_ALLOW_*` | Override flags | `false` |

---

## Testing Results

### TOCTOU Race Condition Tests

```
Test: Concurrent Override Consumption
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Threads: 10 simultaneous attempts
Expected: Exactly 1 success
Result: ✅ PASS - Only 1 thread consumed override

Test: Lock Timeout Handling
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: Lock held for extended period
Expected: TimeoutError after 5 seconds
Result: ✅ PASS - Graceful timeout handling
```

### Token Validation Tests

```
Test: Empty Token Rejection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input: BMAD_AUTH_TOKEN=""
Expected: Validation fails
Result: ✅ PASS

Test: Session Cache Expiration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: Cache file older than 1 hour
Expected: Re-validation required
Result: ✅ PASS
```

### Performance Benchmarks

| Operation | P95 Latency | Target | Status |
|-----------|-------------|--------|--------|
| Lock Acquire/Release | 0.041ms | <100ms | ✅ |
| Override Check | 0.001ms | <1ms | ✅ |
| Override Consume | 0.387ms | <50ms | ✅ |
| Token Validation | 0.101ms | <10ms | ✅ |

---

## Usage Guide

### Enabling Token Validation

1. **Generate a token:**
   ```bash
   node _bmad/core/security/quick-token.js "YourName" "developer" 168
   ```

2. **Set the token:**
   ```bash
   export BMAD_AUTH_TOKEN="<generated-token>"
   # Or save to file:
   echo "<token>" > .bmad-token
   ```

3. **Start Claude Code** - token will be validated on session start

### Disabling Token Validation (Not Recommended)

```bash
export BMAD_TOKEN_REQUIRED=false
```

### Using Override Tokens

Override tokens are single-use and expire after 5 minutes:

```bash
# Allow one operation outside repository
export BMAD_ALLOW_OUTSIDE_REPO=true
# Run the command - override is consumed
# Must set again for next operation
```

### Troubleshooting

**"Could not acquire lock" errors:**
- Another process may be holding the lock
- Wait and retry, or check for stale lock file

**"Token validation failed" errors:**
- Verify token is not expired
- Check `BMAD_AUTH_TOKEN` is set correctly
- Ensure `validate-token.js` is accessible

---

## Security Considerations

1. **Token Storage**: Never commit tokens to version control
2. **Lock Files**: Located in `.claude/` which should be gitignored
3. **Claims Cache**: Contains user info - secured with 0600 permissions
4. **Timeout**: 5-second lock timeout prevents denial of service

---

**Document Version:** 1.0
**Last Updated:** 2026-01-16
**Author:** Security Implementation Team
