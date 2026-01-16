#!/usr/bin/env bash
#
# File: tests/test-shell-injection.sh
#
# BMAD Security Test Suite: Shell Injection Prevention
# =====================================================
# Tests the input-validation library against known shell injection patterns.
# Part of P2 security mitigations.
#
# Usage:
#   bash tests/test-shell-injection.sh
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

PASSED=0
FAILED=0
TOTAL=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VALIDATION_LIB="$PROJECT_ROOT/.claude/hooks/lib/input-validation.sh"

if [[ ! -f "$VALIDATION_LIB" ]]; then
    echo -e "${RED}ERROR: Validation library not found at: $VALIDATION_LIB${NC}"
    exit 1
fi

source "$VALIDATION_LIB"

echo "=============================================="
echo "BMAD Shell Injection Prevention Test Suite"
echo "=============================================="
echo ""

run_test() {
    local test_name="$1"
    local expected_result="$2"
    local validation_func="$3"
    local test_input="$4"

    TOTAL=$((TOTAL + 1))

    if $validation_func "$test_input" 2>/dev/null; then
        actual_result="pass"
    else
        actual_result="fail"
    fi

    if [[ "$actual_result" == "$expected_result" ]]; then
        echo -e "${GREEN}[PASS]${NC} $test_name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}[FAIL]${NC} $test_name"
        echo "       Expected: $expected_result, Got: $actual_result"
        FAILED=$((FAILED + 1))
    fi
}

echo "=== Agent Name Validation Tests ==="
echo "--- Malicious inputs (should be rejected) ---"

run_test "Command injection with semicolon" "fail" validate_agent_name '; echo INJECTED'
run_test "Command injection with pipe" "fail" validate_agent_name 'test|cat /etc/passwd'
run_test "Command injection with ampersand" "fail" validate_agent_name 'test&& malicious'
run_test "Command substitution \$()" "fail" validate_agent_name '$(whoami)'
run_test "Command substitution backticks" "fail" validate_agent_name '`id`'
run_test "Variable expansion" "fail" validate_agent_name '${PATH}'
run_test "Redirect output" "fail" validate_agent_name 'test > /tmp/pwned'
run_test "Path traversal .." "fail" validate_agent_name '../../../etc/passwd'
run_test "Subshell execution" "fail" validate_agent_name '(cat /etc/passwd)'
run_test "Brace expansion" "fail" validate_agent_name '{cat,/etc/passwd}'
run_test "History expansion !" "fail" validate_agent_name '!!'
run_test "Backslash escape" "fail" validate_agent_name 'test\nmalicious'

echo ""
echo "--- Valid inputs (should be accepted) ---"

run_test "Simple agent name" "pass" validate_agent_name 'architect'
run_test "Agent name with hyphen" "pass" validate_agent_name 'security-analyst'
run_test "Agent name with underscore" "pass" validate_agent_name 'my_agent'
run_test "Short name" "pass" validate_agent_name 'pm'
run_test "Display name" "pass" validate_agent_name 'John'
run_test "Empty string" "pass" validate_agent_name ''

echo ""
echo "=== Voice Name Validation Tests ==="
echo "--- Malicious inputs (should be rejected) ---"

run_test "Voice with command injection" "fail" validate_voice_name '; echo INJECTED'
run_test "Voice with pipe" "fail" validate_voice_name 'voice|malicious'
run_test "Voice with substitution" "fail" validate_voice_name '$(whoami)'

echo ""
echo "--- Valid inputs (should be accepted) ---"

run_test "Simple voice name" "pass" validate_voice_name 'Samantha'
run_test "Piper voice format" "pass" validate_voice_name 'en_US-lessac-medium'
run_test "Empty voice (uses default)" "pass" validate_voice_name ''

echo ""
echo "=== Dialogue Validation Tests ==="
echo "--- Valid inputs (should be accepted - dialogue is spoken, not executed) ---"

run_test "Normal dialogue" "pass" validate_dialogue 'Hello, how are you today?'
run_test "Dialogue with punctuation" "pass" validate_dialogue 'Wait! What? Really...'
run_test "Empty dialogue" "pass" validate_dialogue ''

echo ""
echo "=============================================="
echo "TEST SUMMARY"
echo "=============================================="
echo -e "Total:  $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAILED test(s) failed!${NC}"
    exit 1
fi
