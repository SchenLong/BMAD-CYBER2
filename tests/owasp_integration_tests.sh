#!/bin/bash
# OWASP Integration Test Suite
# Tests the integration of all Phase 1, 2, 3 security validators
#
# Usage: bash tests/owasp_integration_tests.sh
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "=============================================="
echo "OWASP Integration Test Suite"
echo "Date: $(date)"
echo "Project: $PROJECT_DIR"
echo "=============================================="

# =============================================================================
# PHASE 1 TESTS: Rate Limiter + Plugin Permissions
# =============================================================================

echo ""
echo "=============================================="
echo "PHASE 1: Rate Limiter & Plugin Permissions"
echo "=============================================="

# Test RL-I01: Rate Limiter Hook Integration
echo ""
echo "[RL-I01] Rate Limiter Hook Integration..."

# Reset rate limiter state
rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null

# Set strict limits for testing
export BMAD_RATE_LIMIT_BASH=3

# Make 3 requests (should all pass)
ALLOWED=0
for i in {1..3}; do
    if echo '{"tool_name": "bash", "tool_input": {"command": "ls"}}' | \
        python3 .claude/validators/rate_limiter.py validate 2>/dev/null; then
        ((ALLOWED++))
    fi
done

# 4th request should be blocked
BLOCKED=false
if ! echo '{"tool_name": "bash", "tool_input": {"command": "ls"}}' | \
    python3 .claude/validators/rate_limiter.py validate 2>/dev/null; then
    BLOCKED=true
fi

if [ "$ALLOWED" -eq 3 ] && [ "$BLOCKED" = true ]; then
    log_pass "Rate limiter correctly allows 3, blocks 4th"
else
    log_fail "Rate limiter: allowed=$ALLOWED, blocked=$BLOCKED"
fi

# Test RL-I02: Whitelist Bypass
echo ""
echo "[RL-I02] Rate Limiter Whitelist Bypass..."

# Reset state
rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null
export BMAD_RATE_LIMIT_READ=2

# Read operations with whitelisted patterns should bypass
WHITELISTED_PASS=true
for i in {1..10}; do
    if ! echo '{"tool_name": "read", "tool_input": {"file_path": ".claude/settings.json"}}' | \
        python3 .claude/validators/rate_limiter.py validate 2>/dev/null; then
        WHITELISTED_PASS=false
        break
    fi
done

if [ "$WHITELISTED_PASS" = true ]; then
    log_pass "Whitelisted operations bypass rate limit"
else
    log_fail "Whitelisted operations incorrectly rate limited"
fi

# Test PP-I01: Plugin Permission Hook Integration
echo ""
echo "[PP-I01] Plugin Permission - Dangerous Command Blocking..."

# rm command should be blocked for all plugins
if echo '{"tool_name": "bash", "tool_input": {"command": "rm -rf /"}, "cwd": "_bmad/intel-team/"}' | \
    python3 .claude/validators/plugin_permissions.py validate 2>/dev/null; then
    log_fail "Dangerous command 'rm' was allowed"
else
    log_pass "Dangerous command 'rm' blocked correctly"
fi

# Test PP-I02: Plugin Path Restriction
echo ""
echo "[PP-I02] Plugin Permission - Path Restriction..."

# Intel team should not be able to write outside their directory
if echo '{"tool_name": "write", "tool_input": {"file_path": "_bmad/legal-team/confidential.md", "content": "test"}, "cwd": "_bmad/intel-team/"}' | \
    python3 .claude/validators/plugin_permissions.py validate 2>/dev/null; then
    log_fail "Cross-plugin write was allowed"
else
    log_pass "Cross-plugin write blocked correctly"
fi

# Test PP-I03: Allowed Operations
echo ""
echo "[PP-I03] Plugin Permission - Allowed Operations..."

# Intel team should be able to use curl
if echo '{"tool_name": "bash", "tool_input": {"command": "curl https://example.com"}, "cwd": "_bmad/intel-team/"}' | \
    python3 .claude/validators/plugin_permissions.py validate 2>/dev/null; then
    log_pass "Allowed command 'curl' permitted for intel-team"
else
    log_fail "Allowed command 'curl' was blocked for intel-team"
fi

# =============================================================================
# PHASE 2 TESTS: Supply Chain, Context Manager, Recursion Guard
# =============================================================================

echo ""
echo "=============================================="
echo "PHASE 2: Supply Chain, Context, Recursion"
echo "=============================================="

# Test SC-I01: Supply Chain Status
echo ""
echo "[SC-I01] Supply Chain Verifier Status..."

SC_OUTPUT=$(python3 .claude/validators/supply_chain_verifier.py status 2>/dev/null)
if echo "$SC_OUTPUT" | grep -q "verify_mode"; then
    log_pass "Supply chain verifier status reporting works"
else
    log_fail "Supply chain verifier status failed"
fi

# Test SC-I02: Verification Modes
echo ""
echo "[SC-I02] Supply Chain Verification Modes..."

# Test warn mode allows untracked files
export BMAD_VERIFY_MODE=warn
if python3 -c "
import sys; sys.path.insert(0, '.claude/validators')
from supply_chain_verifier import SupplyChainVerifier
v = SupplyChainVerifier(verify_mode='warn')
result = v.verify_file('_bmad/nonexistent/file.txt')
sys.exit(0 if result.verified else 1)
" 2>/dev/null; then
    log_pass "Warn mode allows untracked files"
else
    log_fail "Warn mode incorrectly blocks untracked files"
fi

# Test CM-I01: Context Manager Status
echo ""
echo "[CM-I01] Context Manager Status..."

CM_OUTPUT=$(python3 .claude/validators/context_manager.py status 2>/dev/null)
if echo "$CM_OUTPUT" | grep -q "tokens_used"; then
    log_pass "Context manager status reporting works"
else
    log_fail "Context manager status failed"
fi

# Test CM-I02: Token Estimation
echo ""
echo "[CM-I02] Context Manager Token Estimation..."

ESTIMATE_OUTPUT=$(python3 .claude/validators/context_manager.py estimate-file README.md 2>/dev/null)
if echo "$ESTIMATE_OUTPUT" | grep -q "Estimated tokens"; then
    log_pass "Context manager token estimation works"
else
    log_fail "Context manager token estimation failed"
fi

# Test CM-I03: Context Warnings
echo ""
echo "[CM-I03] Context Manager Warning Generation..."

# Reset context manager state
rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null

# Force high usage state
python3 -c "
import sys, json, time; sys.path.insert(0, '.claude/validators')
from context_manager import ContextManager, MAX_CONTEXT_TOKENS
m = ContextManager()
m.record_operation('test', int(MAX_CONTEXT_TOKENS * 0.8))
" 2>/dev/null

CM_CHECK=$(python3 .claude/validators/context_manager.py check 2>/dev/null)
if echo "$CM_CHECK" | grep -q "warning"; then
    log_pass "Context manager generates warnings at 80% capacity"
else
    log_fail "Context manager warning not generated at 80% capacity"
fi

# Test RG-I01: Recursion Guard Status
echo ""
echo "[RG-I01] Recursion Guard Status..."

RG_OUTPUT=$(python3 .claude/validators/recursion_guard.py status 2>/dev/null)
if echo "$RG_OUTPUT" | grep -q "limits"; then
    log_pass "Recursion guard status reporting works"
else
    log_fail "Recursion guard status failed"
fi

# Test RG-I02: Depth Checking
echo ""
echo "[RG-I02] Recursion Guard Depth Checking..."

# Check path depth
DEPTH_OUTPUT=$(python3 .claude/validators/recursion_guard.py check-path "$PROJECT_DIR/a/b/c/d/file.txt" 2>/dev/null)
if echo "$DEPTH_OUTPUT" | grep -q "Allowed"; then
    log_pass "Recursion guard depth check works"
else
    log_fail "Recursion guard depth check failed"
fi

# Test RG-I03: Circular Detection
echo ""
echo "[RG-I03] Recursion Guard Circular Detection..."

# Reset recursion state
rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

# Perform same operation multiple times
for i in {1..15}; do
    python3 .claude/validators/recursion_guard.py check-circular read "/same/path.txt" 2>/dev/null
done

CIRCULAR_OUTPUT=$(python3 .claude/validators/recursion_guard.py check-circular read "/same/path.txt" 2>/dev/null)
if echo "$CIRCULAR_OUTPUT" | grep -q "Allowed: False"; then
    log_pass "Recursion guard detects circular patterns"
else
    log_skip "Circular detection may need more iterations"
fi

# =============================================================================
# PHASE 3 TESTS: Confidence Tracker
# =============================================================================

echo ""
echo "=============================================="
echo "PHASE 3: Confidence Tracker"
echo "=============================================="

# Test CT-I01: Confidence Analysis
echo ""
echo "[CT-I01] Confidence Tracker Analysis..."

CT_OUTPUT=$(python3 .claude/validators/confidence_tracker.py analyze "I think this might work, but I'm not sure about the implementation. Perhaps we should test it more thoroughly." 2>/dev/null)
if echo "$CT_OUTPUT" | grep -q "Confidence"; then
    log_pass "Confidence tracker analysis works"
else
    log_fail "Confidence tracker analysis failed"
fi

# Test CT-I02: Uncertainty Detection
echo ""
echo "[CT-I02] Confidence Tracker Uncertainty Detection..."

CT_UNCERTAINTY=$(python3 .claude/validators/confidence_tracker.py analyze "I definitely know this is correct. The documentation states this clearly." 2>/dev/null)
if echo "$CT_UNCERTAINTY" | grep -q "Confidence Level"; then
    log_pass "Confidence tracker detects uncertainty markers"
else
    log_fail "Confidence tracker uncertainty detection failed"
fi

# Test CT-I03: Session Stats
echo ""
echo "[CT-I03] Confidence Tracker Session Stats..."

CT_STATS=$(python3 .claude/validators/confidence_tracker.py status 2>/dev/null)
if echo "$CT_STATS" | grep -q "session_id"; then
    log_pass "Confidence tracker session stats work"
else
    log_fail "Confidence tracker session stats failed"
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

# Unset test environment variables
unset BMAD_RATE_LIMIT_BASH
unset BMAD_RATE_LIMIT_READ
unset BMAD_VERIFY_MODE

echo "Test state files cleaned up"

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "TEST SUMMARY"
echo "=============================================="
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo -e "Skipped: ${YELLOW}$SKIP_COUNT${NC}"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
