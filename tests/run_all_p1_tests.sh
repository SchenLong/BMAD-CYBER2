#!/bin/bash
#
# BMAD P1 Security Fixes - Complete Test Suite
# =============================================
# Runs all tests for TOCTOU fix and Token Validation
#
# Usage: bash tests/run_all_p1_tests.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "========================================================================"
echo "  BMAD P1 Security Fixes - Test Suite"
echo "  Date: $(date)"
echo "========================================================================"
echo ""

TOTAL_PASSED=0
TOTAL_FAILED=0
RESULTS=""

run_test() {
    local name="$1"
    local cmd="$2"

    echo "------------------------------------------------------------------------"
    echo "Running: $name"
    echo "------------------------------------------------------------------------"

    if eval "$cmd"; then
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
        RESULTS+="[PASS] $name\n"
        echo ""
        echo ">>> $name: PASSED"
    else
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
        RESULTS+="[FAIL] $name\n"
        echo ""
        echo ">>> $name: FAILED"
    fi
    echo ""
}

# Test 1: Unit Tests - Override Manager
run_test "Unit Tests: Override Manager (TOCTOU Fix)" \
    "python3 tests/test_override_manager.py"

# Test 2: Unit Tests - Token Validator
run_test "Unit Tests: Token Validator" \
    "python3 tests/test_token_validator.py"

# Test 3: Security Regression Tests
run_test "Security Regression Tests" \
    "python3 tests/test_security_regression.py"

# Test 4: Performance Tests
run_test "Performance Tests" \
    "python3 tests/test_performance.py"

# Test 5: Syntax Validation
run_test "Syntax Validation" \
    "node .claude/validators-node/bin/token-validator.js --test && \
     python3 -m py_compile .claude/hooks/session-security-init.py && \
     python3 -c 'import json; json.load(open(\".claude/settings.json\"))' && \
     echo 'All syntax checks passed'"

# Test 6: Integration - Token Validation Flow
echo "------------------------------------------------------------------------"
echo "Running: Integration - Token Validation Flow"
echo "------------------------------------------------------------------------"
export CLAUDE_PROJECT_DIR="$PROJECT_DIR"

# Test with enforcement disabled
export BMAD_TOKEN_REQUIRED=false
if node .claude/validators-node/bin/token-validator.js 2>&1 | grep -q "enforcement disabled\|enforcement DISABLED"; then
    echo "  Subtest 1: Enforcement disabled - PASS"
    SUBTEST1=0
else
    echo "  Subtest 1: Enforcement disabled - FAIL"
    SUBTEST1=1
fi

# Clean session cache
rm -f "$PROJECT_DIR/.claude/.session_validated" 2>/dev/null
rm -f "$PROJECT_DIR/.claude/.session_claims.json" 2>/dev/null

# Test session init
if python3 .claude/hooks/session-security-init.py 2>&1 | grep -q "BMAD GUARDRAILS"; then
    echo "  Subtest 2: Session init runs - PASS"
    SUBTEST2=0
else
    echo "  Subtest 2: Session init runs - FAIL"
    SUBTEST2=1
fi

if [ $SUBTEST1 -eq 0 ] && [ $SUBTEST2 -eq 0 ]; then
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
    RESULTS+="[PASS] Integration - Token Validation Flow\n"
    echo ""
    echo ">>> Integration - Token Validation Flow: PASSED"
else
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    RESULTS+="[FAIL] Integration - Token Validation Flow\n"
    echo ""
    echo ">>> Integration - Token Validation Flow: FAILED"
fi

# Summary
echo ""
echo "========================================================================"
echo "  TEST SUMMARY"
echo "========================================================================"
echo -e "$RESULTS"
echo "------------------------------------------------------------------------"
echo "  Total Passed: $TOTAL_PASSED"
echo "  Total Failed: $TOTAL_FAILED"
echo "------------------------------------------------------------------------"

if [ $TOTAL_FAILED -eq 0 ]; then
    echo ""
    echo "  ✓ ALL TESTS PASSED - P1 Security Fixes Validated"
    echo ""
    exit 0
else
    echo ""
    echo "  ✗ SOME TESTS FAILED - Review required"
    echo ""
    exit 1
fi
