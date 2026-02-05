#!/usr/bin/env bash
#
# File: .claude/hooks/lib/audit-logging.sh
#
# Common audit logging library for manager scripts
# Provides standardized logging for security-sensitive operations
#
# Usage:
#   source "$SCRIPT_DIR/lib/audit-logging.sh"
#   init_audit_logging "script-name"
#   audit_log "ACTION" "Details of the operation"
#   audit_log_sensitive "CONFIG_CHANGE" "Setting X changed to Y"
#
# Log format: ISO8601 timestamp | severity | script | action | details | user | pid

# Don't set strict mode here - this is a library meant to be sourced
# The calling script should set strict mode

# Determine log file location
_AUDIT_LOG_DIR="${AUDIT_LOG_DIR:-${PROJECT_DIR:-$(pwd)}/.claude/logs}"
_AUDIT_LOG_FILE="${_AUDIT_LOG_DIR}/manager-audit.log"
_AUDIT_SCRIPT_NAME="unknown"
_AUDIT_INITIALIZED=false

# Initialize audit logging for a script
init_audit_logging() {
    local script_name="${1:-unknown}"
    _AUDIT_SCRIPT_NAME="$script_name"

    # Create log directory if it doesn't exist
    mkdir -p "$_AUDIT_LOG_DIR" 2>/dev/null || true

    # Create log file with secure permissions if it doesn't exist
    if [[ ! -f "$_AUDIT_LOG_FILE" ]]; then
        touch "$_AUDIT_LOG_FILE" 2>/dev/null || true
        chmod 600 "$_AUDIT_LOG_FILE" 2>/dev/null || true
    fi

    _AUDIT_INITIALIZED=true

    # Log script start
    audit_log "SCRIPT_START" "Initialized $script_name"
}

# Main audit logging function
# Usage: audit_log "ACTION_TYPE" "Details"
audit_log() {
    local action="${1:-UNKNOWN}"
    local details="${2:-}"
    local severity="${3:-INFO}"

    # Skip if logging not initialized or log file not writable
    if [[ "$_AUDIT_INITIALIZED" != "true" ]]; then
        return 0
    fi

    if [[ ! -w "$_AUDIT_LOG_FILE" ]] && [[ -f "$_AUDIT_LOG_FILE" ]]; then
        return 0
    fi

    local timestamp
    timestamp=$(date -Iseconds 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S")

    local user
    user=$(whoami 2>/dev/null || echo "unknown")

    local pid="$$"

    # Sanitize inputs - remove newlines and limit length
    action=$(echo "$action" | tr -d '\n\r' | cut -c1-50)
    details=$(echo "$details" | tr -d '\n\r' | cut -c1-200)

    # Write log entry
    echo "$timestamp|$severity|$_AUDIT_SCRIPT_NAME|$action|$details|$user|$pid" >> "$_AUDIT_LOG_FILE" 2>/dev/null || true
}

# Log sensitive operations with WARNING severity
audit_log_sensitive() {
    local action="${1:-SENSITIVE_OP}"
    local details="${2:-}"
    audit_log "$action" "$details" "WARNING"
}

# Log errors with ERROR severity
audit_log_error() {
    local action="${1:-ERROR}"
    local details="${2:-}"
    audit_log "$action" "$details" "ERROR"
}

# Log script completion
audit_log_complete() {
    local status="${1:-SUCCESS}"
    local details="${2:-}"
    audit_log "SCRIPT_COMPLETE" "$status: $details"
}

# Audit wrapper for config changes
# Usage: audit_config_change "config_file" "setting" "old_value" "new_value"
audit_config_change() {
    local config_file="${1:-unknown}"
    local setting="${2:-unknown}"
    local old_value="${3:-}"
    local new_value="${4:-}"

    # Mask sensitive values
    if [[ "$setting" =~ (password|secret|key|token|api) ]]; then
        old_value="[REDACTED]"
        new_value="[REDACTED]"
    fi

    audit_log_sensitive "CONFIG_CHANGE" "File: $config_file, Setting: $setting, Old: $old_value, New: $new_value"
}

# Audit wrapper for file operations
# Usage: audit_file_operation "read|write|delete" "filepath" "details"
audit_file_operation() {
    local operation="${1:-unknown}"
    local filepath="${2:-unknown}"
    local details="${3:-}"

    case "$operation" in
        write|delete)
            audit_log_sensitive "FILE_$operation" "Path: $filepath, $details"
            ;;
        *)
            audit_log "FILE_$operation" "Path: $filepath, $details"
            ;;
    esac
}

# Check if audit logging is working
audit_is_enabled() {
    [[ "$_AUDIT_INITIALIZED" == "true" ]] && [[ -w "$_AUDIT_LOG_FILE" || ! -f "$_AUDIT_LOG_FILE" ]]
}

# Export functions if running in bash 4+
if [[ "${BASH_VERSION%%.*}" -ge 4 ]]; then
    export -f init_audit_logging audit_log audit_log_sensitive audit_log_error audit_log_complete audit_config_change audit_file_operation audit_is_enabled 2>/dev/null || true
fi
