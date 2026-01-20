# P1 Security Fixes - Test Plan, QA & Security Validation

**Document:** Test Plan for P1 Security Mitigations
**Date:** 2026-01-16
**Scope:** TOCTOU Fix + Token Validation Enforcement
**Status:** Ready for Execution

---

## 1. Test Categories

### 1.1 Unit Tests
| Test Suite | File | Purpose |
|------------|------|---------|
| Override Manager | `test_override_manager.py` | Verify TOCTOU fix with concurrent access |
| Token Validator | `test_token_validator.py` | Verify token validation logic |

### 1.2 Integration Tests
| Test | Purpose |
|------|---------|
| SessionStart Hook Chain | Verify hooks execute in correct order |
| Token → Session Init Flow | Verify token validation blocks before session init |
| Override Consumption Flow | Verify overrides work end-to-end |

### 1.3 Security Tests
| Test | Purpose |
|------|---------|
| Race Condition Exploitation | Attempt to consume same override from multiple processes |
| Token Bypass Attempts | Attempt to bypass token validation |
| Permission Escalation | Attempt RBAC bypass |

### 1.4 Performance Tests
| Test | Target |
|------|--------|
| Lock Acquisition | < 5s timeout |
| Token Validation | < 100ms |
| Session Cache Hit | < 10ms |

---

## 2. Test Execution Matrix

### 2.1 P1 Fix #1: TOCTOU in Override System

#### Unit Tests
- [x] `test_concurrent_override_consumption` - Only 1 of 10 threads succeeds
- [x] `test_override_expiration` - Overrides expire after timeout
- [x] `test_double_consume_fails` - Second consume fails
- [x] `test_override_not_set` - Missing env var returns false
- [x] `test_get_override_status` - Status reporting works
- [x] `test_atomic_write_integrity` - State file never corrupted
- [x] `test_lock_released_on_success` - Lock released after success
- [x] `test_lock_released_on_failure` - Lock released after failure

#### Security Tests
- [ ] `test_race_multiprocess` - Multiple Python processes race
- [ ] `test_lock_file_tampering` - Lock file deletion during operation
- [ ] `test_state_file_tampering` - State file corruption recovery

### 2.2 P1 Fix #2: Token Validation to Hooks

#### Unit Tests
- [x] `test_enforcement_disabled` - BMAD_TOKEN_REQUIRED=false works
- [x] `test_missing_token_fails` - Missing token blocks session
- [x] `test_session_not_validated_initially` - Cache empty initially
- [x] `test_mark_session_validated` - Cache marking works
- [x] `test_session_claims_persistence` - Claims saved/loaded correctly
- [x] `test_admin_always_authorized` - Admin bypasses RBAC
- [x] `test_missing_role_fails` - Missing role blocked
- [x] `test_matching_role_succeeds` - Matching role allowed
- [x] `test_security_lead_elevated_access` - Role hierarchy works
- [x] `test_secure_permissions` - 600 permissions pass
- [x] `test_insecure_permissions` - 644 permissions flagged
- [x] `test_missing_file` - Missing file error

#### Integration Tests
- [ ] `test_session_start_with_valid_token` - Full flow with token
- [ ] `test_session_start_without_token` - Full flow blocked
- [ ] `test_session_start_enforcement_disabled` - Full flow with bypass

#### Security Tests
- [ ] `test_expired_token_rejected` - Expired tokens blocked
- [ ] `test_tampered_token_rejected` - Modified tokens blocked
- [ ] `test_wrong_key_rejected` - Wrong encryption key blocked

---

## 3. Test Scripts

### 3.1 Concurrent Race Test (Multi-Process)

```bash
#!/bin/bash
# test_race_multiprocess.sh
# Spawns 10 processes simultaneously trying to consume same override

export BMAD_ALLOW_RACE_TEST=true
RESULTS_FILE="/tmp/race_test_results_$$"

for i in {1..10}; do
    python3 -c "
import sys
sys.path.insert(0, '.claude/validators')
from security_common import OverrideManager
result, reason = OverrideManager.check_and_consume_override('RACE_TEST')
print('SUCCESS' if result else 'FAILED')
" >> "$RESULTS_FILE" &
done

wait

SUCCESS_COUNT=$(grep -c SUCCESS "$RESULTS_FILE")
echo "Successes: $SUCCESS_COUNT (expected: 1)"
rm -f "$RESULTS_FILE"

if [ "$SUCCESS_COUNT" -eq 1 ]; then
    echo "PASS: Race condition fixed"
    exit 0
else
    echo "FAIL: Race condition still exists!"
    exit 1
fi
```

### 3.2 Session Start Integration Test

```bash
#!/bin/bash
# test_session_integration.sh
# Tests the full SessionStart hook chain

cd "$(dirname "$0")/.."
export CLAUDE_PROJECT_DIR="$(pwd)"

echo "=== Test 1: Token validation blocks without token ==="
export BMAD_TOKEN_REQUIRED=true
rm -f .bmad-token 2>/dev/null
python3 .claude/validators/token_validator.py 2>&1
RESULT=$?
if [ $RESULT -eq 2 ]; then
    echo "PASS: Session blocked without token (exit code 2)"
else
    echo "FAIL: Expected exit code 2, got $RESULT"
fi

echo ""
echo "=== Test 2: Token validation passes when disabled ==="
export BMAD_TOKEN_REQUIRED=false
python3 .claude/validators/token_validator.py 2>&1
RESULT=$?
if [ $RESULT -eq 0 ]; then
    echo "PASS: Session allowed when enforcement disabled"
else
    echo "FAIL: Expected exit code 0, got $RESULT"
fi

echo ""
echo "=== Test 3: Session init runs after token validation ==="
node .claude/hooks/session-security-init.ts 2>&1
RESULT=$?
if [ $RESULT -eq 0 ]; then
    echo "PASS: Session init completed"
else
    echo "FAIL: Session init failed with exit code $RESULT"
fi
```

---

## 4. Expected Results

### 4.1 TOCTOU Fix Validation

| Scenario | Expected Result |
|----------|-----------------|
| 10 threads consume same override | Exactly 1 succeeds |
| 10 processes consume same override | Exactly 1 succeeds |
| Lock timeout after 5s | TimeoutError raised |
| Lock released on exception | Subsequent operations succeed |
| State file corruption | JSON remains valid |

### 4.2 Token Validation

| Scenario | Expected Result |
|----------|-----------------|
| No token, enforcement ON | Exit code 2 (blocked) |
| No token, enforcement OFF | Exit code 0 (allowed) |
| Valid token | Exit code 0, claims cached |
| Expired token | Exit code 2 (blocked) |
| Session cache hit | Validation skipped, fast path |

---

## 5. Rollback Plan

If tests fail:

1. **TOCTOU Fix**: Revert `security_common.py` to previous version
   ```bash
   git checkout HEAD~1 -- .claude/validators/security_common.py
   ```

2. **Token Validation**: Remove from hook chain
   ```bash
   # Edit .claude/settings.json to remove token_validator.py from SessionStart
   ```

3. **Emergency Bypass**: Set environment variable
   ```bash
   export BMAD_TOKEN_REQUIRED=false
   ```

---

## 6. Sign-off Checklist

- [ ] All unit tests pass (21 tests)
- [ ] Race condition test passes (multi-process)
- [ ] Integration tests pass
- [ ] Security regression tests pass
- [ ] Performance within targets
- [ ] No functionality regression
- [ ] Documentation updated

---

**Test Plan Version:** 1.0
**Created:** 2026-01-16
