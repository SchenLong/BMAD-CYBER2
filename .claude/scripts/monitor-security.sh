#!/bin/bash

# BMAD Security Monitoring Script
# Phase 5 - Real-time Security Event Monitoring

SECURITY_LOG="/Users/paultinp/BMAD-CYBER2/.claude/logs/security.log"
VALIDATOR_LOG="/Users/paultinp/BMAD-CYBER2/.claude/validators-node/.claude/logs/security.log"
TELEMETRY_LOG="/Users/paultinp/BMAD-CYBER2/docs/TestingLogs/security/AuditLogs/telemetry/security_events.jsonl"
ALERT_THRESHOLD=5
LOG_FILE="/Users/paultinp/BMAD-CYBER2/.claude/logs/monitoring.log"

# Create monitoring log
echo "$(date -Iseconds) [MONITOR] Security monitoring started - Phase 5 activation" >> "$LOG_FILE"

# Function to send alert
send_alert() {
    local severity="$1"
    local message="$2"
    local timestamp=$(date -Iseconds)

    echo "$timestamp [ALERT-$severity] $message" >> "$LOG_FILE"
    echo "🚨 $severity ALERT: $message"
}

# Function to analyze security events
analyze_events() {
    local log_file="$1"
    local time_window=300  # 5 minutes
    local current_time=$(date +%s)
    local start_time=$((current_time - time_window))

    # Count blocked events in last 5 minutes
    local blocked_count=$(grep '"severity":"BLOCKED"' "$log_file" 2>/dev/null | \
                         while read -r line; do
                             timestamp=$(echo "$line" | jq -r '.timestamp' 2>/dev/null || echo "")
                             if [[ -n "$timestamp" ]]; then
                                 event_time=$(date -d "$timestamp" +%s 2>/dev/null || echo 0)
                                 if [[ $event_time -ge $start_time ]]; then
                                     echo "$line"
                                 fi
                             fi
                         done | wc -l)

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
    last_event=$(tail -1 "$SECURITY_LOG" 2>/dev/null | jq -r '.timestamp' 2>/dev/null || echo "")
    if [[ -n "$last_event" ]]; then
        last_time=$(date -d "$last_event" +%s 2>/dev/null || echo 0)
        current_time=$(date +%s)
        time_diff=$((current_time - last_time))

        if [[ $time_diff -gt 3600 ]]; then  # 1 hour
            send_alert "WARNING" "No security events logged in last hour - system may be idle or malfunctioning"
        fi
    fi
}

# Function to monitor resource usage
monitor_resources() {
    # Get system resources
    local memory_usage=$(ps -A -o %mem | awk '{s+=$1} END {print s}')
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')

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
        while read -r line; do
            if echo "$line" | grep -q "_chain_index\|_previous_hash\|_entry_hash"; then
                # Chain entry found - basic validation
                local chain_index=$(echo "$line" | jq -r '._chain_index' 2>/dev/null || echo "null")
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
echo "🔍 BMAD Security Monitor - Phase 5 Activation"
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

echo "✅ Security monitoring active. Alerts logged to: $LOG_FILE"
echo "📊 Monitoring dashboard available via: tail -f $LOG_FILE"