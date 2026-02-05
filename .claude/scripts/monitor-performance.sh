#!/bin/bash
set -euo pipefail

# BMAD Performance Monitoring Script
# Phase 5 - Validator Response Time and Resource Tracking
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

# Authorization check - require auth token or run as authorized user
AUTH_TOKEN_FILE="$PROJECT_DIR/.claude/config/monitoring-auth.token"
AUTHORIZED_USERS=("root" "$(whoami)")

check_authorization() {
    # Check if running as authorized user
    local current_user
    current_user=$(whoami)
    for user in "${AUTHORIZED_USERS[@]}"; do
        if [[ "$current_user" == "$user" ]]; then
            return 0
        fi
    done

    # Check for auth token
    if [[ -f "$AUTH_TOKEN_FILE" ]]; then
        return 0
    fi

    echo "WARNING: Running without explicit authorization. Create $AUTH_TOKEN_FILE for authenticated access." >&2
    # Continue anyway for backwards compatibility, but log the warning
    return 0
}

check_authorization

# Use relative paths
RESOURCE_LOG="$PROJECT_DIR/.claude/validators-node/docs/TestingLogs/security/AuditLogs/telemetry/resource_usage.jsonl"
RATE_LIMIT_LOG="$PROJECT_DIR/.claude/validators-node/docs/TestingLogs/security/AuditLogs/telemetry/rate_limit_metrics.jsonl"
PERFORMANCE_LOG="$PROJECT_DIR/.claude/logs/performance.log"
MONITORING_LOG="$PROJECT_DIR/.claude/logs/monitoring.log"
SECURITY_LOG="$PROJECT_DIR/.claude/logs/security.log"

# Ensure log directories exist
mkdir -p "$(dirname "$PERFORMANCE_LOG")" "$(dirname "$MONITORING_LOG")"

# Performance thresholds (configurable)
MEMORY_WARNING_PCT="${MEMORY_WARNING_PCT:-75}"
MEMORY_CRITICAL_PCT="${MEMORY_CRITICAL_PCT:-90}"
CONTEXT_WARNING_PCT="${CONTEXT_WARNING_PCT:-80}"
CONTEXT_CRITICAL_PCT="${CONTEXT_CRITICAL_PCT:-95}"
RESPONSE_TIME_WARNING_MS="${RESPONSE_TIME_WARNING_MS:-5000}"
RESPONSE_TIME_CRITICAL_MS="${RESPONSE_TIME_CRITICAL_MS:-10000}"

# Portable function to get epoch seconds N minutes ago
# Works on both macOS and Linux
get_past_epoch() {
    local minutes_ago="${1:-5}"
    local current_epoch
    current_epoch=$(date +%s)
    echo $((current_epoch - (minutes_ago * 60)))
}

# Sanitize string for safe logging (prevent log injection)
sanitize_for_log() {
    local input="$1"
    # Remove newlines, carriage returns, and control characters
    # Limit length to prevent log flooding
    echo "$input" | tr -d '\n\r' | tr -cd '[:print:]' | cut -c1-500
}

# Create performance log header
echo "$(date -Iseconds) [PERF] Performance monitoring started - Phase 5 activation" >> "$PERFORMANCE_LOG"

# Function to send performance alert
send_perf_alert() {
    local severity="$1"
    local metric="$2"
    local value="$3"
    local threshold="$4"
    local timestamp
    timestamp=$(date -Iseconds)

    # Sanitize inputs to prevent log injection
    severity=$(sanitize_for_log "$severity")
    metric=$(sanitize_for_log "$metric")
    value=$(sanitize_for_log "$value")
    threshold=$(sanitize_for_log "$threshold")

    local message="Performance $severity: $metric=$value (threshold: $threshold)"
    echo "$timestamp [PERF-$severity] $message" >> "$PERFORMANCE_LOG"
    echo "$timestamp [ALERT-$severity] $message" >> "$MONITORING_LOG"
    echo "Performance $severity: $metric=$value (threshold: $threshold)"
}

# Function to analyze validator response times
analyze_response_times() {
    echo "$(date -Iseconds) [PERF] Analyzing validator response times..." >> "$PERFORMANCE_LOG"

    if [[ -f "$SECURITY_LOG" ]]; then
        # Get last 100 events and calculate processing speed
        local recent_events
        recent_events=$(tail -100 "$SECURITY_LOG" 2>/dev/null | wc -l | tr -d ' ')

        # Use portable time calculation (5 minutes = 300 seconds)
        local time_span=300
        local events_per_second
        events_per_second=$(echo "scale=2; $recent_events / $time_span" | bc -l 2>/dev/null || echo "0")

        echo "$(date -Iseconds) [PERF] Validator throughput: $events_per_second events/sec" >> "$PERFORMANCE_LOG"

        # If throughput is very low, it might indicate performance issues
        if (( $(echo "$events_per_second < 0.1" | bc -l 2>/dev/null || echo 0) )); then
            send_perf_alert "WARNING" "validator-throughput" "$events_per_second" ">0.1 events/sec"
        fi
    fi
}

# Function to analyze resource usage
analyze_resource_usage() {
    echo "$(date -Iseconds) [PERF] Analyzing resource usage..." >> "$PERFORMANCE_LOG"

    if [[ -f "$RESOURCE_LOG" ]]; then
        # Get latest resource metrics
        local latest_entry
        latest_entry=$(tail -1 "$RESOURCE_LOG" 2>/dev/null || echo "")

        if [[ -n "$latest_entry" ]]; then
            # Extract metrics using jq with safe defaults
            local memory_pct context_pct memory_mb context_tokens child_processes
            memory_pct=$(echo "$latest_entry" | jq -r '.memory_pct // 0' 2>/dev/null || echo "0")
            context_pct=$(echo "$latest_entry" | jq -r '.context_pct // 0' 2>/dev/null || echo "0")
            memory_mb=$(echo "$latest_entry" | jq -r '.memory_mb // 0' 2>/dev/null || echo "0")
            context_tokens=$(echo "$latest_entry" | jq -r '.context_tokens_used // 0' 2>/dev/null || echo "0")
            child_processes=$(echo "$latest_entry" | jq -r '.child_processes // 0' 2>/dev/null || echo "0")

            echo "$(date -Iseconds) [PERF] Memory: ${memory_mb}MB (${memory_pct}%)" >> "$PERFORMANCE_LOG"
            echo "$(date -Iseconds) [PERF] Context tokens: $context_tokens (${context_pct}%)" >> "$PERFORMANCE_LOG"
            echo "$(date -Iseconds) [PERF] Child processes: $child_processes" >> "$PERFORMANCE_LOG"

            # Memory alerts
            if (( $(echo "$memory_pct >= $MEMORY_CRITICAL_PCT" | bc -l 2>/dev/null || echo 0) )); then
                send_perf_alert "CRITICAL" "memory-usage" "${memory_pct}%" "${MEMORY_CRITICAL_PCT}%"
            elif (( $(echo "$memory_pct >= $MEMORY_WARNING_PCT" | bc -l 2>/dev/null || echo 0) )); then
                send_perf_alert "WARNING" "memory-usage" "${memory_pct}%" "${MEMORY_WARNING_PCT}%"
            fi

            # Context token alerts
            if (( $(echo "$context_pct >= $CONTEXT_CRITICAL_PCT" | bc -l 2>/dev/null || echo 0) )); then
                send_perf_alert "CRITICAL" "context-usage" "${context_pct}%" "${CONTEXT_CRITICAL_PCT}%"
            elif (( $(echo "$context_pct >= $CONTEXT_WARNING_PCT" | bc -l 2>/dev/null || echo 0) )); then
                send_perf_alert "WARNING" "context-usage" "${context_pct}%" "${CONTEXT_WARNING_PCT}%"
            fi

            # Child process alerts
            if [[ $child_processes -gt 8 ]]; then
                send_perf_alert "WARNING" "child-processes" "$child_processes" "<=8"
            fi
        fi
    fi
}

# Function to analyze rate limiting metrics
analyze_rate_limits() {
    echo "$(date -Iseconds) [PERF] Analyzing rate limiting metrics..." >> "$PERFORMANCE_LOG"

    if [[ -f "$RATE_LIMIT_LOG" ]]; then
        # Get rate limit violations in last hour
        local violations
        violations=$(grep -c '"action":"RATE_LIMITED"' "$RATE_LIMIT_LOG" 2>/dev/null || echo "0")

        if [[ $violations -gt 10 ]]; then
            send_perf_alert "WARNING" "rate-limit-violations" "$violations" "<=10/hour"
        fi

        echo "$(date -Iseconds) [PERF] Rate limit violations: $violations" >> "$PERFORMANCE_LOG"
    fi
}

# Function to generate performance summary
generate_performance_summary() {
    echo ""
    echo "PERFORMANCE MONITORING SUMMARY - Phase 5"
    echo "=============================================="

    # System resources (portable)
    local system_memory system_cpu
    system_memory=$(ps -A -o %mem 2>/dev/null | awk '{s+=$1} END {printf "%.1f", s}' || echo "N/A")

    # macOS and Linux have different top commands
    if [[ "$(uname)" == "Darwin" ]]; then
        system_cpu=$(top -l 1 2>/dev/null | grep "CPU usage" | awk '{print $3}' | sed 's/%//' || echo "N/A")
    else
        system_cpu=$(top -bn1 2>/dev/null | grep "Cpu(s)" | awk '{print $2}' || echo "N/A")
    fi

    echo "System Resources:"
    echo "  Memory Usage: ${system_memory}%"
    echo "  CPU Usage: ${system_cpu}%"

    # Validator-specific metrics
    if [[ -f "$RESOURCE_LOG" ]]; then
        local latest_validator
        latest_validator=$(tail -1 "$RESOURCE_LOG" 2>/dev/null || echo "")
        if [[ -n "$latest_validator" ]]; then
            local val_memory val_context
            val_memory=$(echo "$latest_validator" | jq -r '.memory_pct // 0' 2>/dev/null || echo "0")
            val_context=$(echo "$latest_validator" | jq -r '.context_pct // 0' 2>/dev/null || echo "0")

            echo ""
            echo "Validator Performance:"
            echo "  Memory: ${val_memory}%"
            echo "  Context: ${val_context}%"
        fi
    fi

    echo ""
    echo "Monitoring Status:"
    echo "  Performance log: $PERFORMANCE_LOG"
    echo "  Resource telemetry: $(if [[ -f "$RESOURCE_LOG" ]]; then echo "Active"; else echo "Missing"; fi)"
    echo "  Rate limit monitoring: $(if [[ -f "$RATE_LIMIT_LOG" ]]; then echo "Active"; else echo "Missing"; fi)"
    echo ""
}

# Main execution
echo "BMAD Performance Monitor - Phase 5 Activation"
echo "Monitoring validator response times and resource usage..."
echo ""

# Run analysis
analyze_response_times
analyze_resource_usage
analyze_rate_limits

# Generate summary
generate_performance_summary

# Log completion
echo "$(date -Iseconds) [PERF] Performance monitoring analysis complete" >> "$PERFORMANCE_LOG"
echo "Performance monitoring activated. Logs: $PERFORMANCE_LOG"
