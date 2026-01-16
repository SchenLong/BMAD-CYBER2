#!/bin/bash
# OWASP Complete Test Suite Runner
# Runs all unit, integration, security, and performance tests
#
# Usage: bash tests/run_owasp_tests.sh [--unit] [--integration] [--security] [--performance] [--all]
#
# Options:
#   --unit         Run unit tests only
#   --integration  Run integration tests only
#   --security     Run security tests only
#   --performance  Run performance benchmarks only
#   --all          Run all tests (default)
#
# Exit codes:
#   0 - All selected tests passed
#   1 - One or more tests failed

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

# Default to running all tests
RUN_UNIT=false
RUN_INTEGRATION=false
RUN_SECURITY=false
RUN_PERFORMANCE=false
RUN_ALL=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            RUN_UNIT=true
            RUN_ALL=false
            shift
            ;;
        --integration)
            RUN_INTEGRATION=true
            RUN_ALL=false
            shift
            ;;
        --security)
            RUN_SECURITY=true
            RUN_ALL=false
            shift
            ;;
        --performance)
            RUN_PERFORMANCE=true
            RUN_ALL=false
            shift
            ;;
        --all)
            RUN_ALL=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--unit] [--integration] [--security] [--performance] [--all]"
            exit 1
            ;;
    esac
done

# If --all, enable all test types
if [ "$RUN_ALL" = true ]; then
    RUN_UNIT=true
    RUN_INTEGRATION=true
    RUN_SECURITY=true
    RUN_PERFORMANCE=true
fi

echo "=============================================="
echo "OWASP Complete Test Suite"
echo "Date: $(date)"
echo "=============================================="
echo ""
echo "Test Selection:"
echo "  Unit Tests:        $RUN_UNIT"
echo "  Integration Tests: $RUN_INTEGRATION"
echo "  Security Tests:    $RUN_SECURITY"
echo "  Performance Tests: $RUN_PERFORMANCE"
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0
UNIT_RESULT=0
INTEGRATION_RESULT=0
SECURITY_RESULT=0
PERFORMANCE_RESULT=0

# =============================================================================
# UNIT TESTS
# =============================================================================

if [ "$RUN_UNIT" = true ]; then
    echo ""
    echo -e "${CYAN}=============================================="
    echo "RUNNING UNIT TESTS"
    echo -e "==============================================${NC}"
    echo ""

    # Check if pytest is available
    if command -v pytest &> /dev/null; then
        PYTEST_CMD="python3 -m pytest"
    else
        PYTEST_CMD="python3"
    fi

    # Run each test file
    TEST_FILES=(
        "tests/test_rate_limiter.py"
        "tests/test_plugin_permissions.py"
        "tests/test_supply_chain_verifier.py"
        "tests/test_context_manager.py"
        "tests/test_recursion_guard.py"
        "tests/test_confidence_tracker.py"
    )

    UNIT_PASS=0
    UNIT_FAIL=0

    for test_file in "${TEST_FILES[@]}"; do
        if [ -f "$test_file" ]; then
            echo ""
            echo -e "${YELLOW}Running: $test_file${NC}"
            echo "----------------------------------------------"

            if $PYTEST_CMD "$test_file" -v 2>/dev/null; then
                echo -e "${GREEN}[PASS]${NC} $test_file"
                ((UNIT_PASS++))
            else
                echo -e "${RED}[FAIL]${NC} $test_file"
                ((UNIT_FAIL++))
            fi
        else
            echo -e "${YELLOW}[SKIP]${NC} $test_file (not found)"
        fi
    done

    echo ""
    echo "Unit Test Summary: $UNIT_PASS passed, $UNIT_FAIL failed"

    if [ "$UNIT_FAIL" -gt 0 ]; then
        UNIT_RESULT=1
    fi

    TOTAL_PASS=$((TOTAL_PASS + UNIT_PASS))
    TOTAL_FAIL=$((TOTAL_FAIL + UNIT_FAIL))
fi

# =============================================================================
# INTEGRATION TESTS
# =============================================================================

if [ "$RUN_INTEGRATION" = true ]; then
    echo ""
    echo -e "${CYAN}=============================================="
    echo "RUNNING INTEGRATION TESTS"
    echo -e "==============================================${NC}"
    echo ""

    if [ -x "$SCRIPT_DIR/owasp_integration_tests.sh" ]; then
        if bash "$SCRIPT_DIR/owasp_integration_tests.sh"; then
            INTEGRATION_RESULT=0
            echo -e "${GREEN}[PASS]${NC} Integration tests"
        else
            INTEGRATION_RESULT=1
            echo -e "${RED}[FAIL]${NC} Integration tests"
        fi
    else
        echo -e "${YELLOW}[SKIP]${NC} Integration tests (script not found)"
    fi
fi

# =============================================================================
# SECURITY TESTS
# =============================================================================

if [ "$RUN_SECURITY" = true ]; then
    echo ""
    echo -e "${CYAN}=============================================="
    echo "RUNNING SECURITY TESTS"
    echo -e "==============================================${NC}"
    echo ""

    if [ -x "$SCRIPT_DIR/owasp_security_tests.sh" ]; then
        if bash "$SCRIPT_DIR/owasp_security_tests.sh"; then
            SECURITY_RESULT=0
            echo -e "${GREEN}[PASS]${NC} Security tests"
        else
            SECURITY_RESULT=1
            echo -e "${RED}[FAIL]${NC} Security tests"
        fi
    else
        echo -e "${YELLOW}[SKIP]${NC} Security tests (script not found)"
    fi
fi

# =============================================================================
# PERFORMANCE TESTS
# =============================================================================

if [ "$RUN_PERFORMANCE" = true ]; then
    echo ""
    echo -e "${CYAN}=============================================="
    echo "RUNNING PERFORMANCE TESTS"
    echo -e "==============================================${NC}"
    echo ""

    if [ -x "$SCRIPT_DIR/owasp_performance_tests.sh" ]; then
        if bash "$SCRIPT_DIR/owasp_performance_tests.sh"; then
            PERFORMANCE_RESULT=0
            echo -e "${GREEN}[PASS]${NC} Performance tests"
        else
            PERFORMANCE_RESULT=1
            echo -e "${RED}[FAIL]${NC} Performance tests"
        fi
    else
        echo -e "${YELLOW}[SKIP]${NC} Performance tests (script not found)"
    fi
fi

# =============================================================================
# FINAL SUMMARY
# =============================================================================

echo ""
echo "=============================================="
echo "FINAL TEST SUITE SUMMARY"
echo "=============================================="
echo ""

# Calculate overall results
TOTAL_SUITES=0
PASSED_SUITES=0

if [ "$RUN_UNIT" = true ]; then
    ((TOTAL_SUITES++))
    if [ "$UNIT_RESULT" -eq 0 ]; then
        echo -e "  Unit Tests:        ${GREEN}PASS${NC}"
        ((PASSED_SUITES++))
    else
        echo -e "  Unit Tests:        ${RED}FAIL${NC}"
    fi
fi

if [ "$RUN_INTEGRATION" = true ]; then
    ((TOTAL_SUITES++))
    if [ "$INTEGRATION_RESULT" -eq 0 ]; then
        echo -e "  Integration Tests: ${GREEN}PASS${NC}"
        ((PASSED_SUITES++))
    else
        echo -e "  Integration Tests: ${RED}FAIL${NC}"
    fi
fi

if [ "$RUN_SECURITY" = true ]; then
    ((TOTAL_SUITES++))
    if [ "$SECURITY_RESULT" -eq 0 ]; then
        echo -e "  Security Tests:    ${GREEN}PASS${NC}"
        ((PASSED_SUITES++))
    else
        echo -e "  Security Tests:    ${RED}FAIL${NC}"
    fi
fi

if [ "$RUN_PERFORMANCE" = true ]; then
    ((TOTAL_SUITES++))
    if [ "$PERFORMANCE_RESULT" -eq 0 ]; then
        echo -e "  Performance Tests: ${GREEN}PASS${NC}"
        ((PASSED_SUITES++))
    else
        echo -e "  Performance Tests: ${RED}FAIL${NC}"
    fi
fi

echo ""
echo "=============================================="
echo "Suites: $PASSED_SUITES/$TOTAL_SUITES passed"
echo "=============================================="

# Determine exit code
if [ "$PASSED_SUITES" -eq "$TOTAL_SUITES" ]; then
    echo ""
    echo -e "${GREEN}ALL TESTS PASSED${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}SOME TESTS FAILED${NC}"
    exit 1
fi
