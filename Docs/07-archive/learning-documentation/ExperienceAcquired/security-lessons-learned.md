# Lessons Learned

## Security Testing Best Practices

### 2026-01-16: NEVER Use Destructive Commands in Test Strings

**Issue:** During P2 security implementation, test strings for shell injection validation included `rm -rf /` as an example malicious input.

**Problem:** Even when used as a string parameter that should be blocked, this is dangerous because:
1. Copy-paste errors could execute it
2. Shell expansion could interpret it unexpectedly
3. It sets a bad precedent for test patterns
4. If validation fails, the command could theoretically execute

**Correct Approach:**
- Use harmless commands like `echo INJECTED` or `cat /etc/hostname` for injection tests
- If testing file deletion specifically:
  1. First create a test file: `_bmad-output/testdelete.md`
  2. Test deletion against that specific file only
  3. Clean up the test file afterward

**Example - BAD:**
```bash
# NEVER DO THIS
run_test "Command injection" "fail" validate_input '; rm -rf /'
```

**Example - GOOD:**
```bash
# Safe alternatives
run_test "Command injection" "fail" validate_input '; echo INJECTED'
run_test "Command injection" "fail" validate_input '; cat /etc/hostname'
run_test "Command injection" "fail" validate_input '; touch /tmp/test'
```

**Rule:** When testing security controls, assume the control might fail. Never use commands that would cause irreversible damage if executed.

---

## General Development Lessons

(Add future lessons here)
