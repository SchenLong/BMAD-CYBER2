#!/bin/bash

# BMAD Performance Monitoring Script
# Phase 5 - Validator Response Time and Resource Tracking

RESOURCE_LOG="/Users/paultinp/BMAD-CYBER2/.claude/validators-node/docs/TestingLogs/security/AuditLogs/telemetry/resource_usage.jsonl"
RATE_LIMIT_LOG="/Users/paultinp/BMAD-CYBER2/.claude/validators-node/docs/TestingLogs/security/AuditLogs/telemetry/rate_limit_metrics.jsonl"
PERFORMANCE_LOG="/Users/paultinp/BMAD-CYBER2/.claude/logs/performance.log"
MONITORING_LOG="/Users/paultinp/BMAD-CYBER2/.claude/logs/monitoring.log"

# Performance thresholds
MEMORY_WARNING_PCT=75
MEMORY_CRITICAL_PCT=90
CONTEXT_WARNING_PCT=80
CONTEXT_CRITICAL_PCT=95
RESPONSE_TIME_WARNING_MS=5000
RESPONSE_TIME_CRITICAL_MS=10000

# Create performance log header
echo "$(date -Iseconds) [PERF] Performance monitoring started - Phase 5 activation" >> "$PERFORMANCE_LOG"

# Function to send performance alert
send_perf_alert() {
    local severity="$1"
    local metric="$2"
    local value="$3"
    local threshold="$4"
    local timestamp=$(date -Iseconds)

    local message="Performance $severity: $metric=$value (threshold: $threshold)"
    echo "$timestamp [PERF-$severity] $message" >> "$PERFORMANCE_LOG"
    echo "$timestamp [ALERT-$severity] $message" >> "$MONITORING_LOG"
    echo "📊 $severity: $metric=$value (threshold: $threshold)"
}

# Function to analyze validator response times
analyze_response_times() {
    echo "$(date -Iseconds) [PERF] Analyzing validator response times..." >> "$PERFORMANCE_LOG"

    # Calculate average response time from recent security events
    local security_log="/Users/paultinp/BMAD-CYBER2/.claude/logs/security.log"

    if [[ -f "$security_log" ]]; then
        # Get last 100 events and calculate processing speed
        local recent_events=$(tail -100 "$security_log" | wc -l)
        local time_span=$(( $(date +%s) - $(date -d "5 minutes ago" +%s) ))
        local events_per_second=$(echo "scale=2; $recent_events / $time_span" | bc -l 2>/dev/null || echo "0")

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
        local latest_entry=$(tail -1 "$RESOURCE_LOG")

        if [[ -n "$latest_entry" ]]; then
            # Extract metrics using jq
            local memory_pct=$(echo "$latest_entry" | jq -r '.memory_pct // 0' 2>/dev/null || echo "0")
            local context_pct=$(echo "$latest_entry" | jq -r '.context_pct // 0' 2>/dev/null || echo "0")
            local memory_mb=$(echo "$latest_entry" | jq -r '.memory_mb // 0' 2>/dev/null || echo "0")
            local context_tokens=$(echo "$latest_entry" | jq -r '.context_tokens_used // 0' 2>/dev/null || echo "0")
            local child_processes=$(echo "$latest_entry" | jq -r '.child_processes // 0' 2>/dev/null || echo "0")

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
                send_perf_alert "WARNING" "child-processes" "$child_processes" "≤8"
            fi
        fi
    fi
}

# Function to analyze rate limiting metrics
analyze_rate_limits() {
    echo "$(date -Iseconds) [PERF] Analyzing rate limiting metrics..." >> "$PERFORMANCE_LOG"

    if [[ -f "$RATE_LIMIT_LOG" ]]; then
        # Get rate limit violations in last hour
        local violations=$(grep -c '"action":"RATE_LIMITED"' "$RATE_LIMIT_LOG" 2>/dev/null || echo "0")

        if [[ $violations -gt 10 ]]; then
            send_perf_alert "WARNING" "rate-limit-violations" "$violations" "≤10/hour"
        fi

        echo "$(date -Iseconds) [PERF] Rate limit violations: $violations" >> "$PERFORMANCE_LOG"
    fi
}

# Function to generate performance summary
generate_performance_summary() {
    echo ""
    echo "📊 PERFORMANCE MONITORING SUMMARY - Phase 5"
    echo "=============================================="

    # System resources
    local system_memory=$(ps -A -o %mem | awk '{s+=$1} END {printf "%.1f", s}')
    local system_cpu=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "N/A")

    echo "System Resources:"
    echo "  Memory Usage: ${system_memory}%"
    echo "  CPU Usage: ${system_cpu}%"

    # Validator-specific metrics
    if [[ -f "$RESOURCE_LOG" ]]; then
        local latest_validator=$(tail -1 "$RESOURCE_LOG")
        if [[ -n "$latest_validator" ]]; then
            local val_memory=$(echo "$latest_validator" | jq -r '.memory_pct // 0' 2>/dev/null || echo "0")
            local val_context=$(echo "$latest_validator" | jq -r '.context_pct // 0' 2>/dev/null || echo "0")

            echo ""
            echo "Validator Performance:"
            echo "  Memory: ${val_memory}%"
            echo "  Context: ${val_context}%"
        fi
    fi

    echo ""
    echo "Monitoring Status:"
    echo "  Performance log: $PERFORMANCE_LOG"
    echo "  Resource telemetry: $(if [[ -f "$RESOURCE_LOG" ]]; then echo "✅ Active"; else echo "❌ Missing"; fi)"
    echo "  Rate limit monitoring: $(if [[ -f "$RATE_LIMIT_LOG" ]]; then echo "✅ Active"; else echo "❌ Missing"; fi)"
    echo ""
}

# Main execution
echo "🔧 BMAD Performance Monitor - Phase 5 Activation"
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
echo "✅ Performance monitoring activated. Logs: $PERFORMANCE_LOG"