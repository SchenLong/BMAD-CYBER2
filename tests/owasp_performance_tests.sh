#!/bin/bash
# OWASP Performance Test Suite
# Benchmarks performance of all Phase 1, 2, 3 validators
#
# Usage: bash tests/owasp_performance_tests.sh
#
# Exit codes:
#   0 - All benchmarks within targets
#   1 - One or more benchmarks exceeded targets

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

# Test result tracking
log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS_COUNT++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL_COUNT++))
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

echo "=============================================="
echo "OWASP Performance Benchmark Suite"
echo "Date: $(date)"
echo "Project: $PROJECT_DIR"
echo "=============================================="

# =============================================================================
# RATE LIMITER PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "RATE LIMITER PERFORMANCE"
echo "=============================================="

# Benchmark: Check Limit (Target: <10ms avg)
echo ""
echo "[PERF-RL01] Rate Limit Check Performance..."

rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null

ITERATIONS=100
AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from rate_limiter import RateLimiter

rl = RateLimiter()
start = time.time()
for i in range($ITERATIONS):
    rl.check_limit('bash', f'target_{i}')
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average check_limit time: ${AVG_TIME}ms"

# Check if within target (10ms)
WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 10 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Rate limit check within target (<10ms)"
else
    log_fail "Rate limit check exceeded target (${AVG_TIME}ms > 10ms)"
fi

# Benchmark: Record Operation (Target: <20ms avg)
echo ""
echo "[PERF-RL02] Rate Limit Record Performance..."

rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from rate_limiter import RateLimiter

rl = RateLimiter()
start = time.time()
for i in range($ITERATIONS):
    rl.record_operation('bash', f'target_{i}')
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average record_operation time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 20 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Rate limit record within target (<20ms)"
else
    log_fail "Rate limit record exceeded target (${AVG_TIME}ms > 20ms)"
fi

rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null

# =============================================================================
# PLUGIN PERMISSIONS PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "PLUGIN PERMISSIONS PERFORMANCE"
echo "=============================================="

# Benchmark: Permission Check (Target: <20ms avg)
echo ""
echo "[PERF-PP01] Plugin Permission Check Performance..."

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from plugin_permissions import PluginPermissions

pp = PluginPermissions()
start = time.time()
for i in range($ITERATIONS):
    pp.check_path_access('read', f'_bmad/intel-team/agents/test_{i}.md')
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average permission check time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 20 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Permission check within target (<20ms)"
else
    log_fail "Permission check exceeded target (${AVG_TIME}ms > 20ms)"
fi

# Benchmark: Command Check (Target: <10ms avg)
echo ""
echo "[PERF-PP02] Plugin Command Check Performance..."

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from plugin_permissions import PluginPermissions

pp = PluginPermissions()
start = time.time()
for i in range($ITERATIONS):
    pp.check_shell_command('ls -la')
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average command check time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 10 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Command check within target (<10ms)"
else
    log_fail "Command check exceeded target (${AVG_TIME}ms > 10ms)"
fi

# =============================================================================
# SUPPLY CHAIN VERIFIER PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "SUPPLY CHAIN VERIFIER PERFORMANCE"
echo "=============================================="

# Benchmark: File Verification (Target: <50ms avg)
echo ""
echo "[PERF-SC01] File Verification Performance..."

AVG_TIME=$(python3 -c "
import sys, time, os, tempfile; sys.path.insert(0, '.claude/validators')
import supply_chain_verifier

# Create temp test file
with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
    f.write('test content' * 100)
    test_file = f.name

from supply_chain_verifier import SupplyChainVerifier, _verification_cache

start = time.time()
for i in range($ITERATIONS):
    _verification_cache.clear()
    v = SupplyChainVerifier()
    # Just test hash calculation performance
    v._calculate_sha256(test_file)
elapsed = time.time() - start

os.unlink(test_file)
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average file verification time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 50 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "File verification within target (<50ms)"
else
    log_fail "File verification exceeded target (${AVG_TIME}ms > 50ms)"
fi

# Benchmark: Manifest Loading (Target: <100ms)
echo ""
echo "[PERF-SC02] Manifest Loading Performance..."

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
import supply_chain_verifier

start = time.time()
for i in range($ITERATIONS):
    supply_chain_verifier._verifier = None  # Force reload
    v = supply_chain_verifier.SupplyChainVerifier()
elapsed = time.time() - start

avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average manifest load time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 100 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Manifest loading within target (<100ms)"
else
    log_fail "Manifest loading exceeded target (${AVG_TIME}ms > 100ms)"
fi

# =============================================================================
# CONTEXT MANAGER PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "CONTEXT MANAGER PERFORMANCE"
echo "=============================================="

# Benchmark: Capacity Check (Target: <10ms avg)
echo ""
echo "[PERF-CM01] Capacity Check Performance..."

rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from context_manager import ContextManager

m = ContextManager()
start = time.time()
for i in range($ITERATIONS):
    m.check_capacity()
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average capacity check time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 10 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Capacity check within target (<10ms)"
else
    log_fail "Capacity check exceeded target (${AVG_TIME}ms > 10ms)"
fi

# Benchmark: Record Operation (Target: <20ms avg)
echo ""
echo "[PERF-CM02] Context Record Performance..."

rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from context_manager import ContextManager

m = ContextManager()
start = time.time()
for i in range($ITERATIONS):
    m.record_operation(f'test_{i}', 100)
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average record operation time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 20 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Context record within target (<20ms)"
else
    log_fail "Context record exceeded target (${AVG_TIME}ms > 20ms)"
fi

rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null

# Benchmark: Token Estimation (Target: <5ms avg)
echo ""
echo "[PERF-CM03] Token Estimation Performance..."

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from context_manager import ContextManager

m = ContextManager()
test_text = 'word ' * 1000  # 5000 chars
start = time.time()
for i in range($ITERATIONS):
    m.estimate_tokens(test_text)
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average token estimation time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 5 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Token estimation within target (<5ms)"
else
    log_fail "Token estimation exceeded target (${AVG_TIME}ms > 5ms)"
fi

# =============================================================================
# RECURSION GUARD PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "RECURSION GUARD PERFORMANCE"
echo "=============================================="

# Benchmark: Depth Check (Target: <5ms avg)
echo ""
echo "[PERF-RG01] Depth Check Performance..."

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard

g = RecursionGuard()
start = time.time()
for i in range($ITERATIONS):
    g.check_depth('directory_traversal', i % 10)
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average depth check time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 5 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Depth check within target (<5ms)"
else
    log_fail "Depth check exceeded target (${AVG_TIME}ms > 5ms)"
fi

# Benchmark: Circular Check (Target: <15ms avg)
echo ""
echo "[PERF-RG02] Circular Check Performance..."

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard

g = RecursionGuard()
start = time.time()
for i in range($ITERATIONS):
    g.check_circular('read', f'/path/to/file_{i}.txt')
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average circular check time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 15 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Circular check within target (<15ms)"
else
    log_fail "Circular check exceeded target (${AVG_TIME}ms > 15ms)"
fi

# Benchmark: Push/Pop Call (Target: <20ms avg)
echo ""
echo "[PERF-RG03] Push/Pop Performance..."

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from recursion_guard import RecursionGuard

g = RecursionGuard()
start = time.time()
for i in range($ITERATIONS // 2):
    g.push_call(f'call_{i}')
for i in range($ITERATIONS // 2):
    g.pop_call(f'call_{i}')
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average push/pop time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 20 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Push/pop within target (<20ms)"
else
    log_fail "Push/pop exceeded target (${AVG_TIME}ms > 20ms)"
fi

rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

# =============================================================================
# CONFIDENCE TRACKER PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "CONFIDENCE TRACKER PERFORMANCE"
echo "=============================================="

# Benchmark: Text Analysis (Target: <10ms avg)
echo ""
echo "[PERF-CT01] Text Analysis Performance..."

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from confidence_tracker import ConfidenceTracker

t = ConfidenceTracker()
test_text = 'I think this might work, but I am not sure. ' * 10

start = time.time()
for i in range($ITERATIONS):
    t.analyze_text(test_text)
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average analysis time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 10 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Text analysis within target (<10ms)"
else
    log_fail "Text analysis exceeded target (${AVG_TIME}ms > 10ms)"
fi

# =============================================================================
# COMBINED VALIDATION CHAIN PERFORMANCE
# =============================================================================

echo ""
echo "=============================================="
echo "COMBINED VALIDATION CHAIN PERFORMANCE"
echo "=============================================="

# Benchmark: Full Validation Pipeline (Target: <100ms)
echo ""
echo "[PERF-CHAIN01] Full Validation Pipeline..."

rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null

AVG_TIME=$(python3 -c "
import sys, time; sys.path.insert(0, '.claude/validators')
from rate_limiter import RateLimiter
from context_manager import ContextManager
from recursion_guard import RecursionGuard

rl = RateLimiter()
cm = ContextManager()
rg = RecursionGuard()

start = time.time()
for i in range($ITERATIONS):
    # Simulate full validation chain
    rl.check_limit('bash', 'ls')
    cm.check_capacity()
    rg.check_depth('directory_traversal', 5)
elapsed = time.time() - start
avg_ms = (elapsed / $ITERATIONS) * 1000
print(f'{avg_ms:.2f}')
" 2>/dev/null)

log_info "Average full chain time: ${AVG_TIME}ms"

WITHIN_TARGET=$(python3 -c "print('yes' if float('$AVG_TIME') < 100 else 'no')" 2>/dev/null || echo "no")

if [ "$WITHIN_TARGET" = "yes" ]; then
    log_pass "Full validation chain within target (<100ms)"
else
    log_fail "Full validation chain exceeded target (${AVG_TIME}ms > 100ms)"
fi

# =============================================================================
# CLEANUP AND SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "Cleanup..."
echo "=============================================="

rm -f "$PROJECT_DIR/.claude/.rate_limit_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.context_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.recursion_state.json" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.confidence_state.json" 2>/dev/null

echo "Test state files cleaned up"

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "PERFORMANCE BENCHMARK SUMMARY"
echo "=============================================="
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ "$TOTAL" -gt 0 ]; then
    PASS_RATE=$((PASS_COUNT * 100 / TOTAL))
    echo "Pass Rate: ${PASS_RATE}%"
fi

echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}All performance benchmarks within targets!${NC}"
    exit 0
else
    echo -e "${RED}Some benchmarks exceeded targets. Review optimization needs.${NC}"
    exit 1
fi
