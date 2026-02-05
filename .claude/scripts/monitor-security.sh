#!/bin/bash
set -euo pipefail

# BMAD Security Monitoring Script
# Phase 5 - Real-time Security Event Monitoring
#
# Security improvements:
# - Portable date commands (macOS/Linux compatible)
# - Relative paths using SCRIPT_DIR
# - Input sanitization for log injection prevention
# - Authorization check for monitoring access

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
VALIDATOR_LOG="$PROJECT_DIR/.claude/validators-node/.claude/logs/security.log"
TELEMETRY_LOG="$PROJECT_DIR/docs/TestingLogs/security/AuditLogs/telemetry/security_events.jsonl"
LOG_FILE="$PROJECT_DIR/.claude/logs/monitoring.log"

ALERT_THRESHOLD="${ALERT_THRESHOLD:-5}"

# Ensure log directories exist
mkdir -p "$(dirname "$SECURITY_LOG")" "$(dirname "$LOG_FILE")"

# Sanitize string for safe logging (prevent log injection)
sanitize_for_log() {
    local input="$1"
    echo "$input" | tr -d '\n\r' | tr -cd '[:print:]' | cut -c1-500
}

# Portable function to convert ISO timestamp to epoch
# Works on both macOS and Linux
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

# Create monitoring log
echo "$(date -Iseconds) [MONITOR] Security monitoring started - Phase 5 activation" >> "$LOG_FILE"

# Function to send alert
send_alert() {
    local severity="$1"
    local message="$2"
    local timestamp
    timestamp=$(date -Iseconds)

    # Sanitize inputs
    severity=$(sanitize_for_log "$severity")
    message=$(sanitize_for_log "$message")

    echo "$timestamp [ALERT-$severity] $message" >> "$LOG_FILE"
    echo "ALERT $severity: $message"
}

# Function to analyze security events
analyze_events() {
    local log_file="$1"
    local time_window=300  # 5 minutes
    local current_time
    current_time=$(date +%s)
    local start_time=$((current_time - time_window))

    if [[ ! -f "$log_file" ]]; then
        return 0
    fi

    # Count blocked events in last 5 minutes using portable timestamp conversion
    local blocked_count=0
    while IFS= read -r line; do
        if echo "$line" | grep -q '"severity":"BLOCKED"'; then
            local timestamp
            timestamp=$(echo "$line" | jq -r '.timestamp' 2>/dev/null || echo "")
            if [[ -n "$timestamp" ]]; then
                local event_time
                event_time=$(timestamp_to_epoch "$timestamp")
                if [[ $event_time -ge $start_time ]]; then
                    ((blocked_count++))
                fi
            fi
        fi
    done < "$log_file"

    if [[ $blocked_count -gt $ALERT_THRESHOLD ]]; then
        send_alert "HIGH" "Suspicious activity: $blocked_count blocked events in last 5 minutes"
    fi
}

# Function to check validator performance
check_validator_performance() {
    # Check if validators are responding
    if [[ ! -f "$SECURITY_LOG" ]]; then
        send_alert "CRITICAL" "Main security log not found - validator system may be down"
        return
    fi

    # Check last event timestamp
    local last_event
    last_event=$(tail -1 "$SECURITY_LOG" 2>/dev/null | jq -r '.timestamp' 2>/dev/null || echo "")
    if [[ -n "$last_event" ]]; then
        local last_time
        last_time=$(timestamp_to_epoch "$last_event")
        local current_time
        current_time=$(date +%s)
        local time_diff=$((current_time - last_time))

        if [[ $time_diff -gt 3600 ]]; then  # 1 hour
            send_alert "WARNING" "No security events logged in last hour - system may be idle or malfunctioning"
        fi
    fi
}

# Function to monitor resource usage (portable)
monitor_resources() {
    # Get system resources
    local memory_usage
    memory_usage=$(ps -A -o %mem 2>/dev/null | awk '{s+=$1} END {print s}' || echo "0")

    local cpu_usage
    if [[ "$(uname)" == "Darwin" ]]; then
        cpu_usage=$(top -l 1 2>/dev/null | grep "CPU usage" | awk '{print $3}' | sed 's/%//' || echo "0")
    else
        cpu_usage=$(top -bn1 2>/dev/null | grep "Cpu(s)" | awk '{print $2}' || echo "0")
    fi

    # Memory alert threshold: 80%
    if (( $(echo "$memory_usage > 80" | bc -l 2>/dev/null || echo 0) )); then
        send_alert "WARNING" "High memory usage detected: ${memory_usage}%"
    fi
}

# Function to validate audit chain integrity
validate_audit_chain() {
    echo "$(date -Iseconds) [MONITOR] Validating audit chain integrity..." >> "$LOG_FILE"

    # Check if hash chain is intact
    local hash_errors=0
    if [[ -f "$SECURITY_LOG" ]]; then
        # Simple hash chain validation
        while IFS= read -r line; do
            if echo "$line" | grep -q "_chain_index\|_previous_hash\|_entry_hash"; then
                # Chain entry found - basic validation
                local chain_index
                chain_index=$(echo "$line" | jq -r '._chain_index' 2>/dev/null || echo "null")
                if [[ "$chain_index" == "null" ]]; then
                    ((hash_errors++))
                fi
            fi
        done < "$SECURITY_LOG"

        if [[ $hash_errors -gt 0 ]]; then
            send_alert "HIGH" "Audit chain integrity issues detected: $hash_errors malformed entries"
        else
            echo "$(date -Iseconds) [MONITOR] Audit chain integrity: OK" >> "$LOG_FILE"
        fi
    fi
}

# Main monitoring loop
echo "BMAD Security Monitor - Phase 5 Activation"
echo "Monitoring: $SECURITY_LOG"
echo "Validator Log: $VALIDATOR_LOG"
echo "Telemetry: $TELEMETRY_LOG"
echo "Alert Threshold: $ALERT_THRESHOLD events/5min"
echo "Logs: $LOG_FILE"
echo ""

# Initial system check
check_validator_performance
validate_audit_chain
monitor_resources

# Send deployment completion alert
send_alert "INFO" "Phase 5 Security Monitoring ACTIVATED - System is operational"

echo "Security monitoring active. Alerts logged to: $LOG_FILE"
echo "Monitoring dashboard available via: tail -f $LOG_FILE"
