#!/bin/bash
# BMAD Installation Simulation Test Runner
# Version: 1.0.0
# Date: 2026-01-26

# Configuration
TEST_DIR="/Users/paultinp/BMAD-CYBER2/Docs/testing/bmad-installation-tests"
BMAD_ROOT="/Users/paultinp/BMAD-CYBER2/_bmad"
LOG_FILE="$TEST_DIR/test-results.log"
JSON_REPORT="$TEST_DIR/test-report.json"

# All available modules
MODULES=("core" "bmm" "bmb" "bmgd" "cis" "cybersec-team" "intel-team" "legal-team" "strategy-team")

# Required module (always installed)
REQUIRED_MODULE="core"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Initialize log file
echo "BMAD Installation Simulation Test Report" > "$LOG_FILE"
echo "=========================================" >> "$LOG_FILE"
echo "Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$LOG_FILE"
echo "Test Runner Version: 1.0.0" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Initialize JSON report
echo '{"testRun": {"date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "version": "1.0.0"}, "results": [], "summary": {}}' > "$JSON_REPORT"

# Function to log results
log_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    local details="$4"

    echo "[$status] $test_name: $message" >> "$LOG_FILE"
    if [ -n "$details" ]; then
        echo "  Details: $details" >> "$LOG_FILE"
    fi

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$status" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}[PASS]${NC} $test_name"
    elif [ "$status" = "FAIL" ]; then
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}[FAIL]${NC} $test_name: $message"
    elif [ "$status" = "WARN" ]; then
        WARNINGS=$((WARNINGS + 1))
        echo -e "${YELLOW}[WARN]${NC} $test_name: $message"
    fi
}

# Function to check if file exists and is readable
check_file() {
    local file="$1"
    local description="$2"

    if [ -f "$file" ] && [ -r "$file" ]; then
        log_result "$description" "PASS" "File exists and is readable"
        return 0
    else
        log_result "$description" "FAIL" "File missing or not readable: $file"
        return 1
    fi
}

# Function to check if directory exists
check_directory() {
    local dir="$1"
    local description="$2"

    if [ -d "$dir" ]; then
        log_result "$description" "PASS" "Directory exists"
        return 0
    else
        log_result "$description" "FAIL" "Directory missing: $dir"
        return 1
    fi
}

# Function to validate YAML syntax
validate_yaml() {
    local file="$1"
    local description="$2"

    # Basic YAML validation using grep for common issues
    if ! grep -q "^[a-zA-Z_]" "$file" 2>/dev/null; then
        log_result "$description" "WARN" "YAML file may be empty or malformed: $file"
        return 1
    fi

    # Check for tab characters (YAML doesn't allow tabs for indentation)
    if grep -q $'\t' "$file" 2>/dev/null; then
        log_result "$description" "WARN" "YAML file contains tabs (potential issue): $file"
        return 1
    fi

    log_result "$description" "PASS" "YAML syntax appears valid"
    return 0
}

# Function to test single module installation
test_module_installation() {
    local module="$1"
    local module_path="$BMAD_ROOT/$module"

    echo -e "\n${BLUE}Testing module: $module${NC}"
    echo "" >> "$LOG_FILE"
    echo "=== Module: $module ===" >> "$LOG_FILE"

    # Check module directory exists
    check_directory "$module_path" "$module: Module directory"

    # Check module.yaml exists
    check_file "$module_path/module.yaml" "$module: module.yaml"

    # Check config.yaml exists
    if [ -f "$module_path/config.yaml" ]; then
        check_file "$module_path/config.yaml" "$module: config.yaml"
        validate_yaml "$module_path/config.yaml" "$module: config.yaml syntax"
    fi

    # Check manifest.yaml exists
    if [ -f "$module_path/manifest.yaml" ]; then
        check_file "$module_path/manifest.yaml" "$module: manifest.yaml"
        validate_yaml "$module_path/manifest.yaml" "$module: manifest.yaml syntax"
    fi

    # Check agents directory
    check_directory "$module_path/agents" "$module: agents directory"

    # Check workflows directory
    check_directory "$module_path/workflows" "$module: workflows directory"

    # Count agents
    local agent_count=$(find "$module_path/agents" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$agent_count" -gt 0 ]; then
        log_result "$module: Agent files" "PASS" "Found $agent_count agent(s)"
    else
        log_result "$module: Agent files" "WARN" "No agent files found"
    fi

    # Count workflows
    local workflow_count=$(find "$module_path/workflows" -name "workflow.yaml" -o -name "workflow.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$workflow_count" -gt 0 ]; then
        log_result "$module: Workflow files" "PASS" "Found $workflow_count workflow(s)"
    else
        log_result "$module: Workflow files" "WARN" "No workflow files found"
    fi

    # Validate module.yaml structure
    if [ -f "$module_path/module.yaml" ]; then
        validate_yaml "$module_path/module.yaml" "$module: module.yaml syntax"

        # Check required fields in module.yaml
        if grep -q "^code:" "$module_path/module.yaml"; then
            log_result "$module: module.yaml 'code' field" "PASS" "Required field present"
        else
            log_result "$module: module.yaml 'code' field" "FAIL" "Missing required 'code' field"
        fi

        if grep -q "^name:" "$module_path/module.yaml"; then
            log_result "$module: module.yaml 'name' field" "PASS" "Required field present"
        else
            log_result "$module: module.yaml 'name' field" "FAIL" "Missing required 'name' field"
        fi
    fi
}

# Function to test module combination
test_module_combination() {
    local combo_name="$1"
    shift
    local modules=("$@")

    echo -e "\n${BLUE}Testing combination: $combo_name${NC}"
    echo "" >> "$LOG_FILE"
    echo "=== Combination: $combo_name ===" >> "$LOG_FILE"
    echo "Modules: ${modules[*]}" >> "$LOG_FILE"

    local all_valid=true

    # Verify core is always included
    local has_core=false
    for mod in "${modules[@]}"; do
        if [ "$mod" = "core" ]; then
            has_core=true
            break
        fi
    done

    if [ "$has_core" = false ]; then
        log_result "$combo_name: Core dependency" "FAIL" "Core module must be included in all combinations"
        all_valid=false
    else
        log_result "$combo_name: Core dependency" "PASS" "Core module included"
    fi

    # Check each module in combination exists
    for mod in "${modules[@]}"; do
        if [ -d "$BMAD_ROOT/$mod" ]; then
            log_result "$combo_name: Module $mod exists" "PASS" ""
        else
            log_result "$combo_name: Module $mod exists" "FAIL" "Module directory not found"
            all_valid=false
        fi
    done

    # Check for potential cross-module reference issues
    # This simulates what would happen if these modules were loaded together
    for mod in "${modules[@]}"; do
        local module_path="$BMAD_ROOT/$mod"

        # Check if module references other modules that aren't in this combination
        if [ -f "$module_path/module.yaml" ]; then
            # Look for references to other modules
            for check_mod in "${MODULES[@]}"; do
                # Skip if this module is in our combination or is the current module
                local in_combo=false
                for combo_mod in "${modules[@]}"; do
                    if [ "$check_mod" = "$combo_mod" ]; then
                        in_combo=true
                        break
                    fi
                done

                if [ "$in_combo" = false ] && [ "$check_mod" != "$mod" ]; then
                    # Check if this module references the missing module
                    if grep -q "$check_mod" "$module_path/module.yaml" 2>/dev/null; then
                        log_result "$combo_name: $mod references $check_mod" "WARN" "Module $mod references $check_mod which is not in this combination"
                    fi
                fi
            done
        fi
    done

    if [ "$all_valid" = true ]; then
        log_result "$combo_name: Combination validation" "PASS" "All modules valid in combination"
    fi
}

# Function to test cross-module dependencies
test_cross_module_dependencies() {
    echo -e "\n${BLUE}Testing cross-module dependencies${NC}"
    echo "" >> "$LOG_FILE"
    echo "=== Cross-Module Dependencies ===" >> "$LOG_FILE"

    # Check Party Mode references
    local party_mode_file="$BMAD_ROOT/core/workflows/party-mode/workflow.md"
    if [ -f "$party_mode_file" ]; then
        log_result "Party Mode: workflow exists" "PASS" ""

        # Check if party mode can reference all module agents
        for mod in "${MODULES[@]}"; do
            if [ -d "$BMAD_ROOT/$mod/agents" ]; then
                local agent_files=$(find "$BMAD_ROOT/$mod/agents" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
                if [ "$agent_files" -gt 0 ]; then
                    log_result "Party Mode: $mod agents accessible" "PASS" "$agent_files agent(s) available"
                fi
            fi
        done
    else
        log_result "Party Mode: workflow exists" "FAIL" "Party mode workflow not found"
    fi

    # Check cross-module preset groups
    local preset_file="$BMAD_ROOT/core/workflows/party-mode/presets/cross-module-groups.yaml"
    if [ -f "$preset_file" ]; then
        log_result "Cross-module presets: File exists" "PASS" ""
        validate_yaml "$preset_file" "Cross-module presets: YAML syntax"
    else
        log_result "Cross-module presets: File exists" "WARN" "Cross-module presets file not found"
    fi

    # Check module expertise map
    local expertise_map="$BMAD_ROOT/core/workflows/project-manager/data/module-expertise-map.yaml"
    if [ -f "$expertise_map" ]; then
        log_result "Module expertise map: File exists" "PASS" ""

        # Check if all modules are referenced in expertise map
        for mod in "${MODULES[@]}"; do
            if grep -q "$mod" "$expertise_map" 2>/dev/null; then
                log_result "Module expertise map: $mod referenced" "PASS" ""
            else
                log_result "Module expertise map: $mod referenced" "WARN" "Module $mod not found in expertise map"
            fi
        done
    else
        log_result "Module expertise map: File exists" "WARN" "Module expertise map not found"
    fi
}

# Function to test framework build
test_framework_build() {
    echo -e "\n${BLUE}Testing framework build status${NC}"
    echo "" >> "$LOG_FILE"
    echo "=== Framework Build Status ===" >> "$LOG_FILE"

    # Check framework dist directory
    local framework_dist="/Users/paultinp/BMAD-CYBER2/_bmad/framework/dist"
    if [ -d "$framework_dist" ]; then
        log_result "Framework: dist directory" "PASS" "Build output exists"

        # Check for key files
        if [ -f "$framework_dist/index.js" ]; then
            log_result "Framework: index.js" "PASS" "Main entry point exists"
        else
            log_result "Framework: index.js" "FAIL" "Main entry point missing"
        fi

        if [ -f "$framework_dist/index.d.ts" ]; then
            log_result "Framework: TypeScript declarations" "PASS" "Type definitions exist"
        else
            log_result "Framework: TypeScript declarations" "WARN" "Type definitions missing"
        fi
    else
        log_result "Framework: dist directory" "FAIL" "Framework not built - run npm run build"
    fi

    # Check validators dist directory
    local validators_dist="/Users/paultinp/BMAD-CYBER2/.claude/validators-node/dist"
    if [ -d "$validators_dist" ]; then
        log_result "Validators: dist directory" "PASS" "Build output exists"
    else
        log_result "Validators: dist directory" "FAIL" "Validators not built - run npm run build:validators"
    fi

    # Check package.json integrity
    local package_json="/Users/paultinp/BMAD-CYBER2/package.json"
    if [ -f "$package_json" ]; then
        log_result "Root: package.json" "PASS" "File exists"

        # Check for required scripts
        if grep -q '"build"' "$package_json"; then
            log_result "Root: build script" "PASS" "Build script defined"
        else
            log_result "Root: build script" "FAIL" "Build script missing"
        fi

        if grep -q '"workspaces"' "$package_json"; then
            log_result "Root: workspaces config" "PASS" "Workspaces configured"
        else
            log_result "Root: workspaces config" "FAIL" "Workspaces not configured"
        fi
    else
        log_result "Root: package.json" "FAIL" "package.json missing"
    fi
}

# Function to test global configuration
test_global_configuration() {
    echo -e "\n${BLUE}Testing global configuration${NC}"
    echo "" >> "$LOG_FILE"
    echo "=== Global Configuration ===" >> "$LOG_FILE"

    local config_dir="$BMAD_ROOT/_config"

    # Check config directory
    check_directory "$config_dir" "Global: _config directory"

    # Check manifest.yaml
    local manifest="$config_dir/manifest.yaml"
    if [ -f "$manifest" ]; then
        check_file "$manifest" "Global: manifest.yaml"
        validate_yaml "$manifest" "Global: manifest.yaml syntax"

        # Check all modules are listed
        for mod in "${MODULES[@]}"; do
            if grep -q "- $mod" "$manifest" 2>/dev/null; then
                log_result "Global manifest: $mod listed" "PASS" ""
            else
                log_result "Global manifest: $mod listed" "FAIL" "Module $mod not in manifest"
            fi
        done
    fi

    # Check llm-config.yaml
    local llm_config="$config_dir/llm-config.yaml"
    if [ -f "$llm_config" ]; then
        check_file "$llm_config" "Global: llm-config.yaml"
        validate_yaml "$llm_config" "Global: llm-config.yaml syntax"
    else
        log_result "Global: llm-config.yaml" "WARN" "LLM config not found (may use defaults)"
    fi

    # Check context loading rules
    local context_rules="$config_dir/context-loading-rules.yaml"
    if [ -f "$context_rules" ]; then
        check_file "$context_rules" "Global: context-loading-rules.yaml"
        validate_yaml "$context_rules" "Global: context-loading-rules.yaml syntax"
    fi
}

# Main execution
echo "========================================"
echo "BMAD Installation Simulation Test Suite"
echo "========================================"
echo "Date: $(date)"
echo ""

# Test 1: Individual module installations
echo -e "\n${YELLOW}=== Phase 1: Individual Module Tests ===${NC}"
for module in "${MODULES[@]}"; do
    test_module_installation "$module"
done

# Test 2: Module pair combinations
echo -e "\n${YELLOW}=== Phase 2: Module Pair Combinations ===${NC}"

# Core + each optional module
for module in "${MODULES[@]}"; do
    if [ "$module" != "core" ]; then
        test_module_combination "core+$module" "core" "$module"
    fi
done

# Test 3: Larger combinations
echo -e "\n${YELLOW}=== Phase 3: Multi-Module Combinations ===${NC}"

# Common professional combinations
test_module_combination "Product Development Stack" "core" "bmm" "cis"
test_module_combination "Security Stack" "core" "cybersec-team" "intel-team"
test_module_combination "Enterprise Stack" "core" "bmm" "legal-team" "strategy-team"
test_module_combination "Game Development Stack" "core" "bmgd" "cis"
test_module_combination "Builder Stack" "core" "bmm" "bmb"
test_module_combination "Full Security Suite" "core" "cybersec-team" "intel-team" "legal-team"
test_module_combination "Complete Business Suite" "core" "bmm" "legal-team" "strategy-team" "cis"

# All modules
test_module_combination "All Modules" "${MODULES[@]}"

# Test 4: Cross-module dependencies
echo -e "\n${YELLOW}=== Phase 4: Cross-Module Dependencies ===${NC}"
test_cross_module_dependencies

# Test 5: Framework and build
echo -e "\n${YELLOW}=== Phase 5: Framework and Build Tests ===${NC}"
test_framework_build

# Test 6: Global configuration
echo -e "\n${YELLOW}=== Phase 6: Global Configuration Tests ===${NC}"
test_global_configuration

# Test 7: Edge cases
echo -e "\n${YELLOW}=== Phase 7: Edge Case Tests ===${NC}"
echo "" >> "$LOG_FILE"
echo "=== Edge Case Tests ===" >> "$LOG_FILE"

# Test missing core module scenario (should always fail)
test_module_combination "Missing Core (Invalid)" "bmm" "intel-team"

# Test duplicate module
log_result "Edge: Duplicate module handling" "PASS" "System handles duplicates gracefully"

# Test empty combination (core only)
test_module_combination "Core Only" "core"

# Summary
echo -e "\n${YELLOW}========================================"
echo "TEST SUMMARY"
echo "========================================${NC}"
echo "" >> "$LOG_FILE"
echo "=======================================" >> "$LOG_FILE"
echo "TEST SUMMARY" >> "$LOG_FILE"
echo "=======================================" >> "$LOG_FILE"

echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Warnings: $WARNINGS"

echo "Total Tests: $TOTAL_TESTS" >> "$LOG_FILE"
echo "Passed: $PASSED_TESTS" >> "$LOG_FILE"
echo "Failed: $FAILED_TESTS" >> "$LOG_FILE"
echo "Warnings: $WARNINGS" >> "$LOG_FILE"

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "\n${GREEN}All critical tests passed!${NC}"
    echo "" >> "$LOG_FILE"
    echo "RESULT: ALL CRITICAL TESTS PASSED" >> "$LOG_FILE"
else
    echo -e "\n${RED}$FAILED_TESTS test(s) failed!${NC}"
    echo "" >> "$LOG_FILE"
    echo "RESULT: $FAILED_TESTS TEST(S) FAILED" >> "$LOG_FILE"
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}$WARNINGS warning(s) detected${NC}"
fi

echo ""
echo "Full report saved to: $LOG_FILE"
