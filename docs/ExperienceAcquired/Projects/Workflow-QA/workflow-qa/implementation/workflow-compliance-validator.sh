#!/bin/bash
# =============================================================================
# Workflow Compliance Validator
# =============================================================================
# Purpose: Validate all workflow.md files across BMAD modules for compliance
#          with the standard workflow template requirements.
#
# Usage:   ./workflow-compliance-validator.sh [--module MODULE_NAME] [--fix]
#
# Options:
#   --module MODULE_NAME  Validate only a specific module (e.g., intel-team)
#   --fix                 Attempt to fix common issues (future enhancement)
#   --verbose             Show detailed output for each workflow
#   --json                Output results as JSON
#
# Exit codes:
#   0 - All workflows compliant
#   1 - Non-compliant workflows found
#   2 - Script error
# =============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_ROOT="${SCRIPT_DIR}/../../../_bmad"
TARGET_MODULES=("intel-team" "legal-team" "cybersec-team" "strategy-team")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_WORKFLOWS=0
COMPLIANT_WORKFLOWS=0
NON_COMPLIANT_WORKFLOWS=0
declare -a NON_COMPLIANT_LIST=()

# Parse arguments
VERBOSE=false
JSON_OUTPUT=false
TARGET_MODULE=""
FIX_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --module)
            TARGET_MODULE="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --fix)
            FIX_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 2
            ;;
    esac
done

# Override target modules if specific module requested
if [[ -n "$TARGET_MODULE" ]]; then
    TARGET_MODULES=("$TARGET_MODULE")
fi

# =============================================================================
# Validation Functions
# =============================================================================

validate_frontmatter() {
    local file="$1"
    local errors=0

    # Check for web_bundle field
    if ! grep -q "^web_bundle:" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: web_bundle field"
        ((errors++))
    fi

    # Check for name field
    if ! grep -q "^name:" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: name field"
        ((errors++))
    fi

    # Check for description field
    if ! grep -q "^description:" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: description field"
        ((errors++))
    fi

    return $errors
}

validate_role_description() {
    local file="$1"
    local errors=0

    # Check for partnership language
    if ! grep -q "In addition to your name, communication_style, and persona" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: Partnership language in role description"
        ((errors++))
    fi

    return $errors
}

validate_architecture_section() {
    local file="$1"
    local errors=0

    # Check for Step Processing Rules section
    if ! grep -q "### Step Processing Rules" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: '### Step Processing Rules' section"
        ((errors++))
    fi

    # Check for Critical Rules with stop emoji
    if ! grep -q "🛑" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: Critical rules with 🛑 emoji"
        ((errors++))
    fi

    return $errors
}

validate_initialization() {
    local file="$1"
    local errors=0

    # Check for communication language reminder
    if ! grep -q "YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style" "$file" 2>/dev/null; then
        [[ "$VERBOSE" == true ]] && echo "  - Missing: Communication style reminder"
        ((errors++))
    fi

    return $errors
}

validate_workflow() {
    local file="$1"
    local workflow_name
    workflow_name=$(echo "$file" | sed 's|.*/\([^/]*/[^/]*/[^/]*\)/workflow.md|\1|')

    [[ "$VERBOSE" == true ]] && echo -e "\n${BLUE}Validating:${NC} $workflow_name"

    local total_errors=0
    local frontmatter_errors=0
    local role_errors=0
    local arch_errors=0
    local init_errors=0

    # Run all validations
    validate_frontmatter "$file" || frontmatter_errors=$?
    validate_role_description "$file" || role_errors=$?
    validate_architecture_section "$file" || arch_errors=$?
    validate_initialization "$file" || init_errors=$?

    total_errors=$((frontmatter_errors + role_errors + arch_errors + init_errors))

    ((TOTAL_WORKFLOWS++))

    if [[ $total_errors -eq 0 ]]; then
        ((COMPLIANT_WORKFLOWS++))
        [[ "$VERBOSE" == true ]] && echo -e "  ${GREEN}PASS${NC}"
    else
        ((NON_COMPLIANT_WORKFLOWS++))
        NON_COMPLIANT_LIST+=("$workflow_name|frontmatter:$frontmatter_errors|role:$role_errors|arch:$arch_errors|init:$init_errors")
        [[ "$VERBOSE" == true ]] && echo -e "  ${RED}FAIL${NC} ($total_errors issues)"
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  BMAD Workflow Compliance Validator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Target modules: ${TARGET_MODULES[*]}"
echo "BMAD root: $BMAD_ROOT"
echo ""

# Validate each module
for module in "${TARGET_MODULES[@]}"; do
    module_path="$BMAD_ROOT/$module/workflows"

    if [[ ! -d "$module_path" ]]; then
        echo -e "${YELLOW}Warning: Module path not found: $module_path${NC}"
        continue
    fi

    echo -e "${BLUE}Module: $module${NC}"

    # Find all workflow.md files
    while IFS= read -r -d '' workflow_file; do
        validate_workflow "$workflow_file"
    done < <(find "$module_path" -name "workflow.md" -type f -print0 2>/dev/null)
done

# =============================================================================
# Results Summary
# =============================================================================

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Validation Results Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Total workflows validated: $TOTAL_WORKFLOWS"
echo -e "Compliant: ${GREEN}$COMPLIANT_WORKFLOWS${NC}"
echo -e "Non-compliant: ${RED}$NON_COMPLIANT_WORKFLOWS${NC}"
echo ""

if [[ $NON_COMPLIANT_WORKFLOWS -gt 0 ]]; then
    echo -e "${YELLOW}Non-compliant workflows:${NC}"
    echo ""
    printf "%-50s | %-12s | %-8s | %-8s | %-8s\n" "Workflow" "Frontmatter" "Role" "Arch" "Init"
    printf "%-50s-+-%-12s-+-%-8s-+-%-8s-+-%-8s\n" "$(printf '%0.s-' {1..50})" "$(printf '%0.s-' {1..12})" "$(printf '%0.s-' {1..8})" "$(printf '%0.s-' {1..8})" "$(printf '%0.s-' {1..8})"

    for item in "${NON_COMPLIANT_LIST[@]}"; do
        IFS='|' read -r name frontmatter role arch init <<< "$item"
        # Extract just the error counts
        f_err=${frontmatter#*:}
        r_err=${role#*:}
        a_err=${arch#*:}
        i_err=${init#*:}

        # Color code: green if 0, red if >0
        [[ $f_err -eq 0 ]] && f_col="${GREEN}PASS${NC}" || f_col="${RED}FAIL ($f_err)${NC}"
        [[ $r_err -eq 0 ]] && r_col="${GREEN}PASS${NC}" || r_col="${RED}FAIL ($r_err)${NC}"
        [[ $a_err -eq 0 ]] && a_col="${GREEN}PASS${NC}" || a_col="${RED}FAIL ($a_err)${NC}"
        [[ $i_err -eq 0 ]] && i_col="${GREEN}PASS${NC}" || i_col="${RED}FAIL ($i_err)${NC}"

        printf "%-50s | %-12b | %-8b | %-8b | %-8b\n" "$name" "$f_col" "$r_col" "$a_col" "$i_col"
    done
    echo ""
fi

# Calculate compliance percentage
if [[ $TOTAL_WORKFLOWS -gt 0 ]]; then
    COMPLIANCE_PCT=$(awk "BEGIN {printf \"%.1f\", ($COMPLIANT_WORKFLOWS / $TOTAL_WORKFLOWS) * 100}")
    echo -e "Compliance rate: ${BLUE}${COMPLIANCE_PCT}%${NC}"
fi

echo ""

# Exit with appropriate code
if [[ $NON_COMPLIANT_WORKFLOWS -gt 0 ]]; then
    exit 1
else
    echo -e "${GREEN}All workflows are compliant!${NC}"
    exit 0
fi
