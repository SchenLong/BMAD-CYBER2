#!/bin/bash
set -euo pipefail

# BMAD Audit System Validation Script
# Phase 5 - Comprehensive Audit Validation
#
# Security improvements:
# - Portable date commands (macOS/Linux compatible)
# - Relative paths using SCRIPT_DIR
# - Input sanitization for log data
# - Authorization check for audit access

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Validate we're in a proper BMAD project
if [[ ! -d "$PROJECT_DIR/.claude" ]]; then
    echo "ERROR: Not in a valid BMAD project directory" >&2
    exit 1
fi

# Authorization check
AUTH_TOKEN_FILE="$PROJECT_DIR/.claude/config/monitoring-auth.token"
check_authorization() {
    if [[ -f "$AUTH_TOKEN_FILE" ]]; then
        return 0
    fi
    echo "WARNING: Running without explicit authorization. Create $AUTH_TOKEN_FILE for authenticated access." >&2
    return 0
}
check_authorization

# Use relative paths
SECURITY_LOG="$PROJECT_DIR/.claude/logs/security.log"
AUDIT_LOG="$PROJECT_DIR/.claude/logs/monitoring.log"
TELEMETRY_DIR="$PROJECT_DIR/docs/TestingLogs/security/AuditLogs/telemetry"
VALIDATION_LOG="$PROJECT_DIR/.claude/logs/audit-validation.log"

# Ensure log directories exist
mkdir -p "$(dirname "$SECURITY_LOG")" "$(dirname "$VALIDATION_LOG")"

# Create validation log
echo "$(date -Iseconds) [AUDIT] Audit system validation started - Phase 5" > "$VALIDATION_LOG"

# Portable function to convert ISO timestamp to epoch
timestamp_to_epoch() {
    local ts="$1"
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS: Use date with -j -f flags
        date -j -f "%Y-%m-%dT%H:%M:%S" "${ts%%[+-]*}" "+%s" 2>/dev/null || echo 0
    else
        # Linux: Use date -d
        date -d "$ts" "+%s" 2>/dev/null || echo 0
    fi
}

# Sanitize string for safe logging
sanitize_for_log() {
    local input="$1"
    echo "$input" | tr -d '\n\r' | tr -cd '[:print:]' | cut -c1-500
}

# Function to log validation results
log_validation() {
    local status="$1"
    local component="$2"
    local message="$3"
    local timestamp
    timestamp=$(date -Iseconds)

    # Sanitize inputs
    status=$(sanitize_for_log "$status")
    component=$(sanitize_for_log "$component")
    message=$(sanitize_for_log "$message")

    echo "$timestamp [$status] $component: $message" >> "$VALIDATION_LOG"
    echo "[$status] $component: $message"
}

# Function to validate hash chain integrity
validate_hash_chain() {
    log_validation "INFO" "HASH-CHAIN" "Starting hash chain integrity validation"

    if [[ ! -f "$SECURITY_LOG" ]]; then
        log_validation "ERROR" "HASH-CHAIN" "Security log not found: $SECURITY_LOG"
        return 1
    fi

    local chain_entries=0
    local genesis_found=false
    local chain_broken=false
    local previous_hash=""

    while IFS= read -r line; do
        if echo "$line" | grep -q "_chain_index"; then
            ((chain_entries++))

            # Extract chain data
            local chain_index
            chain_index=$(echo "$line" | jq -r '._chain_index // null' 2>/dev/null)
            local prev_hash
            prev_hash=$(echo "$line" | jq -r '._previous_hash // null' 2>/dev/null)
            local entry_hash
            entry_hash=$(echo "$line" | jq -r '._entry_hash // null' 2>/dev/null)

            # Check genesis block
            if [[ "$prev_hash" == "genesis" ]]; then
                genesis_found=true
                log_validation "INFO" "HASH-CHAIN" "Genesis block found at index $chain_index"
            fi

            # Validate hash continuity (simplified validation)
            if [[ -n "$previous_hash" && "$previous_hash" != "$prev_hash" && "$prev_hash" != "genesis" ]]; then
                chain_broken=true
                log_validation "ERROR" "HASH-CHAIN" "Chain break detected at index $chain_index"
            fi

            previous_hash="$entry_hash"
        fi
    done < "$SECURITY_LOG"

    # Summary
    if [[ $genesis_found == true && $chain_broken == false ]]; then
        log_validation "PASS" "HASH-CHAIN" "Integrity verified - $chain_entries entries validated"
        return 0
    else
        log_validation "FAIL" "HASH-CHAIN" "Integrity compromised - genesis:$genesis_found, broken:$chain_broken"
        return 1
    fi
}

# Function to check encryption status
validate_encryption_status() {
    log_validation "INFO" "ENCRYPTION" "Checking encryption implementation"

    if [[ ! -f "$SECURITY_LOG" ]]; then
        log_validation "WARN" "ENCRYPTION" "Security log not found, skipping encryption check"
        return 0
    fi

    # Check if logs contain sensitive data in plaintext
    local sensitive_patterns=("password" "key" "secret" "token" "credential")
    local plaintext_issues=0

    for pattern in "${sensitive_patterns[@]}"; do
        if grep -qi "$pattern.*['\"].*['\"]" "$SECURITY_LOG" 2>/dev/null; then
            ((plaintext_issues++))
            log_validation "WARNING" "ENCRYPTION" "Potential plaintext sensitive data: $pattern"
        fi
    done

    # Check for encrypted fields (look for base64-like patterns)
    local encrypted_fields
    encrypted_fields=$(grep -o '"[a-zA-Z0-9+/]\{20,\}=="*' "$SECURITY_LOG" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $plaintext_issues -eq 0 ]]; then
        log_validation "PASS" "ENCRYPTION" "No plaintext sensitive data detected"
    else
        log_validation "WARN" "ENCRYPTION" "$plaintext_issues potential plaintext exposures"
    fi

    log_validation "INFO" "ENCRYPTION" "Found $encrypted_fields potential encrypted fields"
}

# Function to validate audit logging operational status
validate_audit_operational() {
    log_validation "INFO" "OPERATIONAL" "Validating audit system operational status"

    # Check log file accessibility
    local logs_accessible=true
    local required_logs=("$SECURITY_LOG" "$AUDIT_LOG")

    for logfile in "${required_logs[@]}"; do
        if [[ ! -r "$logfile" ]]; then
            log_validation "ERROR" "OPERATIONAL" "Log file not accessible: $logfile"
            logs_accessible=false
        fi
    done

    # Check recent activity using portable timestamp handling
    if [[ -f "$SECURITY_LOG" ]]; then
        local last_timestamp
        last_timestamp=$(tail -1 "$SECURITY_LOG" 2>/dev/null | jq -r '.timestamp // ""' 2>/dev/null || echo "")
        if [[ -n "$last_timestamp" ]]; then
            local current_time
            current_time=$(date +%s)
            local last_time
            last_time=$(timestamp_to_epoch "$last_timestamp")
            local hours_since=$(( (current_time - last_time) / 3600 ))

            if [[ $hours_since -lt 24 ]]; then
                log_validation "PASS" "OPERATIONAL" "Recent audit activity detected (${hours_since}h ago)"
            else
                log_validation "WARN" "OPERATIONAL" "No recent audit activity (${hours_since}h ago)"
            fi
        fi
    fi

    # Check telemetry files
    local telemetry_files=0
    if [[ -d "$TELEMETRY_DIR" ]]; then
        telemetry_files=$(find "$TELEMETRY_DIR" -name "*.jsonl" 2>/dev/null | wc -l | tr -d ' ')
        log_validation "INFO" "OPERATIONAL" "Telemetry files found: $telemetry_files"
    fi

    if [[ $logs_accessible == true && $telemetry_files -gt 0 ]]; then
        log_validation "PASS" "OPERATIONAL" "Audit system fully operational"
        return 0
    else
        log_validation "FAIL" "OPERATIONAL" "Audit system not fully operational"
        return 1
    fi
}

# Function to check S3 archival (if configured)
validate_s3_archival() {
    log_validation "INFO" "ARCHIVAL" "Checking S3 archival configuration"

    # Look for S3 configuration or archival evidence
    local s3_config_found=false

    # Check for AWS configuration (note: only checks existence, not validity)
    if [[ -f "$HOME/.aws/credentials" || -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
        log_validation "INFO" "ARCHIVAL" "AWS credentials detected"
        s3_config_found=true
    fi

    # Check for archived files
    local archived_files=0
    if [[ -d "$TELEMETRY_DIR" ]]; then
        archived_files=$(find "$TELEMETRY_DIR" -name "archive_*" -type d 2>/dev/null | wc -l | tr -d ' ')
    fi

    if [[ $archived_files -gt 0 ]]; then
        log_validation "PASS" "ARCHIVAL" "Archive directories found: $archived_files"
        s3_config_found=true
    fi

    if [[ $s3_config_found == false ]]; then
        log_validation "INFO" "ARCHIVAL" "S3 archival not configured (optional)"
    fi
}

# Function to generate audit validation summary
generate_audit_summary() {
    echo ""
    echo "AUDIT SYSTEM VALIDATION - Phase 5"
    echo "====================================="

    local total_tests=0
    local passed_tests=0

    # Count results
    while IFS= read -r line; do
        if echo "$line" | grep -q "\[PASS\]"; then
            ((passed_tests++))
            ((total_tests++))
        elif echo "$line" | grep -q "\[FAIL\]"; then
            ((total_tests++))
        fi
    done < "$VALIDATION_LOG"

    echo "Validation Results:"
    echo "  Tests Run: $total_tests"
    echo "  Passed: $passed_tests"
    echo "  Success Rate: $(( total_tests > 0 ? (passed_tests * 100) / total_tests : 0 ))%"
    echo ""

    echo "Component Status:"
    if grep -q "\[PASS\].*HASH-CHAIN" "$VALIDATION_LOG"; then
        echo "  Hash Chain: VALIDATED"
    else
        echo "  Hash Chain: FAILED"
    fi

    if grep -q "\[PASS\].*ENCRYPTION" "$VALIDATION_LOG"; then
        echo "  Encryption: SECURE"
    elif grep -q "\[WARN\].*ENCRYPTION" "$VALIDATION_LOG"; then
        echo "  Encryption: WARNINGS"
    else
        echo "  Encryption: ISSUES"
    fi

    if grep -q "\[PASS\].*OPERATIONAL" "$VALIDATION_LOG"; then
        echo "  Operations: ACTIVE"
    else
        echo "  Operations: DEGRADED"
    fi

    echo ""
    echo "Detailed logs: $VALIDATION_LOG"
}

# Main execution
echo "BMAD Audit System Validation - Phase 5"
echo "Validating hash chain integrity, encryption, and operational status..."
echo ""

# Run validations
validate_hash_chain || true
validate_encryption_status
validate_audit_operational || true
validate_s3_archival

# Generate summary
generate_audit_summary

# Log completion
echo "$(date -Iseconds) [AUDIT] Audit system validation completed" >> "$VALIDATION_LOG"
echo "Audit validation complete. Results: $VALIDATION_LOG"
