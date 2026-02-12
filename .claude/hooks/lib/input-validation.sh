#!/usr/bin/env bash
#
# File: .claude/hooks/lib/input-validation.sh
#
# BMAD Input Validation Library
# =============================
# Provides functions for sanitizing user input in shell scripts.
# This library prevents shell injection attacks by validating and sanitizing
# user-controlled input before use in commands.
#
# Usage:
#   source "$SCRIPT_DIR/lib/input-validation.sh"
#   validate_agent_name "$AGENT_NAME" || exit 1
#
# Security Note:
#   This library is part of the BMAD security guardrails system.
#   All validation functions return 0 for valid input, 1 for invalid.

# Dangerous characters that could enable command injection
# Matches: ; | & $ ` < > ( ) { } ! \
DANGEROUS_CHARS='[;|&$`<>(){}!\\]'

# Path traversal pattern
PATH_TRAVERSAL_PATTERN='\.\.'

# Maximum input lengths (prevent buffer overflow / DoS)
MAX_AGENT_NAME_LENGTH=100
MAX_DIALOGUE_LENGTH=10000
MAX_VOICE_NAME_LENGTH=50
MAX_PATH_LENGTH=4096

#######################################
# Log validation failure to audit log
# Globals:
#   PROJECT_ROOT (optional)
# Arguments:
#   $1 - Validator name
#   $2 - Input type (agent_name, dialogue, etc.)
#   $3 - Reason for rejection
# Outputs:
#   Appends to security log if available
# Returns:
#   Always 0
#######################################
_log_validation_failure() {
    local validator="$1"
    local input_type="$2"
    local reason="$3"
    local log_dir="${PROJECT_ROOT:-.}/.claude/logs"
    local log_file="$log_dir/security.log"

    # Only log if directory exists and is writable
    if [[ -d "$log_dir" ]] && [[ -w "$log_dir" ]]; then
        local timestamp
        timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        # SAST-006: Sanitize values for JSON interpolation — escape backslashes,
        # double quotes, and control characters to prevent JSON malformation.
        # All callers currently use hardcoded strings, but this is defense-in-depth.
        local safe_validator safe_input_type safe_reason
        safe_validator=$(printf '%s' "$validator" | sed 's/[\\"]/\\&/g' | tr -d '\n\r')
        safe_input_type=$(printf '%s' "$input_type" | sed 's/[\\"]/\\&/g' | tr -d '\n\r')
        safe_reason=$(printf '%s' "$reason" | sed 's/[\\"]/\\&/g' | tr -d '\n\r')
        local entry="{\"timestamp\":\"$timestamp\",\"validator\":\"$safe_validator\",\"action\":\"INPUT_VALIDATION_FAILED\",\"details\":{\"input_type\":\"$safe_input_type\",\"reason\":\"$safe_reason\"}}"
        echo "$entry" >> "$log_file" 2>/dev/null || true
    fi
}

#######################################
# Validate agent name/ID
# Globals:
#   MAX_AGENT_NAME_LENGTH
#   DANGEROUS_CHARS
#   PATH_TRAVERSAL_PATTERN
# Arguments:
#   $1 - Agent name or ID to validate
# Outputs:
#   Writes error to stderr if invalid
# Returns:
#   0 if valid, 1 if invalid
#######################################
validate_agent_name() {
    local input="$1"

    # Allow empty (uses default)
    if [[ -z "$input" ]]; then
        return 0
    fi

    # Check length
    if [[ ${#input} -gt $MAX_AGENT_NAME_LENGTH ]]; then
        echo "Error: Agent name exceeds maximum length ($MAX_AGENT_NAME_LENGTH)" >&2
        _log_validation_failure "input_validation" "agent_name" "length_exceeded"
        return 1
    fi

    # Check for dangerous characters
    if [[ "$input" =~ $DANGEROUS_CHARS ]]; then
        echo "Error: Agent name contains invalid characters" >&2
        _log_validation_failure "input_validation" "agent_name" "dangerous_chars"
        return 1
    fi

    # Check for null bytes (use printf to detect - bash strings can't contain nulls directly)
    # If the string length differs when passed through printf, it may contain embedded nulls
    local printf_len
    printf_len=$(printf '%s' "$input" | wc -c)
    if [[ "$printf_len" -ne "${#input}" ]]; then
        echo "Error: Agent name contains null bytes" >&2
        _log_validation_failure "input_validation" "agent_name" "null_bytes"
        return 1
    fi

    # Check for path traversal
    if [[ "$input" =~ $PATH_TRAVERSAL_PATTERN ]]; then
        echo "Error: Agent name contains path traversal sequence" >&2
        _log_validation_failure "input_validation" "agent_name" "path_traversal"
        return 1
    fi

    # Check for newlines (could split commands)
    if [[ "$input" == *$'\n'* ]] || [[ "$input" == *$'\r'* ]]; then
        echo "Error: Agent name contains newline characters" >&2
        _log_validation_failure "input_validation" "agent_name" "newline_chars"
        return 1
    fi

    return 0
}

#######################################
# Validate dialogue/text content
# Globals:
#   MAX_DIALOGUE_LENGTH
# Arguments:
#   $1 - Dialogue text to validate
# Outputs:
#   Writes error to stderr if invalid
# Returns:
#   0 if valid, 1 if invalid
#######################################
validate_dialogue() {
    local input="$1"

    # Allow empty
    if [[ -z "$input" ]]; then
        return 0
    fi

    # Check length
    if [[ ${#input} -gt $MAX_DIALOGUE_LENGTH ]]; then
        echo "Error: Dialogue exceeds maximum length ($MAX_DIALOGUE_LENGTH)" >&2
        _log_validation_failure "input_validation" "dialogue" "length_exceeded"
        return 1
    fi

    # Dialogue is spoken text, so we're less restrictive
    # Null byte check removed - bash strings cannot contain literal nulls
    # and the check was causing false positives

    return 0
}

#######################################
# Validate voice name
# Globals:
#   MAX_VOICE_NAME_LENGTH
#   DANGEROUS_CHARS
# Arguments:
#   $1 - Voice name to validate
# Outputs:
#   Writes error to stderr if invalid
# Returns:
#   0 if valid, 1 if invalid
#######################################
validate_voice_name() {
    local input="$1"

    # Empty is OK (uses default voice)
    if [[ -z "$input" ]]; then
        return 0
    fi

    # Check length
    if [[ ${#input} -gt $MAX_VOICE_NAME_LENGTH ]]; then
        echo "Error: Voice name exceeds maximum length ($MAX_VOICE_NAME_LENGTH)" >&2
        _log_validation_failure "input_validation" "voice_name" "length_exceeded"
        return 1
    fi

    # Check for dangerous characters
    if [[ "$input" =~ $DANGEROUS_CHARS ]]; then
        echo "Error: Voice name contains invalid characters" >&2
        _log_validation_failure "input_validation" "voice_name" "dangerous_chars"
        return 1
    fi

    # Null byte check removed - bash strings cannot contain literal nulls

    return 0
}

#######################################
# Validate file path
# Globals:
#   MAX_PATH_LENGTH
#   PATH_TRAVERSAL_PATTERN
#   DANGEROUS_CHARS
# Arguments:
#   $1 - File path to validate
# Outputs:
#   Writes error to stderr if invalid
# Returns:
#   0 if valid, 1 if invalid
#######################################
validate_file_path() {
    local input="$1"

    # Allow empty
    if [[ -z "$input" ]]; then
        return 0
    fi

    # Check length
    if [[ ${#input} -gt $MAX_PATH_LENGTH ]]; then
        echo "Error: File path exceeds maximum length ($MAX_PATH_LENGTH)" >&2
        _log_validation_failure "input_validation" "file_path" "length_exceeded"
        return 1
    fi

    # Check for dangerous characters (except / which is valid in paths)
    # Modified pattern for paths - allow slashes and dashes
    local path_dangerous='[;|&$`<>(){}!\\]'
    if [[ "$input" =~ $path_dangerous ]]; then
        echo "Error: File path contains invalid characters" >&2
        _log_validation_failure "input_validation" "file_path" "dangerous_chars"
        return 1
    fi

    # Null byte check removed - bash strings cannot contain literal nulls

    return 0
}

#######################################
# Sanitize string for use in grep/awk
# Escapes regex metacharacters
# Globals:
#   None
# Arguments:
#   $1 - String to sanitize
# Outputs:
#   Writes sanitized string to stdout
# Returns:
#   0 always
#######################################
sanitize_for_regex() {
    local input="$1"
    # Escape regex metacharacters: [ \ . * ^ $ ( ) + ? { | ]
    printf '%s' "$input" | sed 's/[[\.*^$()+?{|]/\\&/g'
}

#######################################
# Sanitize string for safe shell use
# Uses printf %q for proper escaping
# Globals:
#   None
# Arguments:
#   $1 - String to sanitize
# Outputs:
#   Writes sanitized string to stdout
# Returns:
#   0 always
#######################################
sanitize_for_shell() {
    local input="$1"
    printf '%q' "$input"
}

#######################################
# Validate and return sanitized agent name
# Combines validation and sanitization
# Globals:
#   None
# Arguments:
#   $1 - Agent name to validate and sanitize
# Outputs:
#   Writes sanitized name to stdout, or error to stderr
# Returns:
#   0 if valid, 1 if invalid
#######################################
get_safe_agent_name() {
    local input="$1"

    if ! validate_agent_name "$input"; then
        return 1
    fi

    # Return sanitized version for extra safety
    sanitize_for_shell "$input"
    return 0
}

#######################################
# Check if input looks like a file path
# Used to detect potential path injection
# Globals:
#   None
# Arguments:
#   $1 - String to check
# Outputs:
#   None
# Returns:
#   0 if looks like path, 1 otherwise
#######################################
looks_like_path() {
    local input="$1"

    # Check for common path indicators
    if [[ "$input" == /* ]] || \
       [[ "$input" == ~* ]] || \
       [[ "$input" == ./* ]] || \
       [[ "$input" == ../* ]] || \
       [[ "$input" == */* ]]; then
        return 0
    fi

    return 1
}

#######################################
# Validate that a value is from an expected set
# Use for validating against known-good values
# Globals:
#   None
# Arguments:
#   $1 - Value to check
#   $@ - Remaining args are allowed values
# Outputs:
#   None
# Returns:
#   0 if value is in allowed set, 1 otherwise
#######################################
validate_from_set() {
    local value="$1"
    shift

    for allowed in "$@"; do
        if [[ "$value" == "$allowed" ]]; then
            return 0
        fi
    done

    return 1
}

# Export functions for use in subshells
export -f validate_agent_name
export -f validate_dialogue
export -f validate_voice_name
export -f validate_file_path
export -f sanitize_for_regex
export -f sanitize_for_shell
export -f get_safe_agent_name
export -f looks_like_path
export -f validate_from_set
export -f _log_validation_failure
