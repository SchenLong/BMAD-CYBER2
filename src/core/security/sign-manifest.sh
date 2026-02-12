#!/bin/bash
#
# BMAD Framework Manifest Signing Script
#
# Generates a SHA-256 manifest of critical framework files and signs it.
# This provides tamper detection for agents, workflows, and configurations.
#
# Usage: ./sign-manifest.sh [--verify-only] [--verbose]
#
# Options:
#   --verify-only  Only verify existing signature, don't regenerate
#   --verbose      Show detailed output
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SECURITY_DIR="$SCRIPT_DIR"

MANIFEST_FILE="$SECURITY_DIR/MANIFEST.sha256"
SIGNATURE_FILE="$SECURITY_DIR/MANIFEST.sha256.asc"
KEY_ID="bmad-signing@internal"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERBOSE=false
VERIFY_ONLY=false

# =============================================================================
# Functions
# =============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Check if GPG key is available
check_key() {
    if ! gpg --list-secret-keys "$KEY_ID" &>/dev/null; then
        log_error "Signing key '$KEY_ID' not found in GPG keyring"
        log_error "Import the key: gpg --import $SECURITY_DIR/bmad-private-key.asc"
        exit 1
    fi
    log_debug "Signing key found: $KEY_ID"
}

# Generate manifest of critical files
generate_manifest() {
    log_info "Generating manifest of critical files..."

    local temp_manifest=$(mktemp)
    local file_count=0

    cd "$PROJECT_ROOT"

    # Header
    echo "# BMAD Framework File Integrity Manifest" > "$temp_manifest"
    echo "# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$temp_manifest"
    echo "# Key ID: $KEY_ID" >> "$temp_manifest"
    echo "#" >> "$temp_manifest"
    echo "# Format: SHA256 hash  filepath" >> "$temp_manifest"
    echo "" >> "$temp_manifest"

    # ---------------------------------------------------------------------
    # CRITICAL FILES: Agents (all .md files in agents directories)
    # ---------------------------------------------------------------------
    echo "# === AGENTS ===" >> "$temp_manifest"
    while IFS= read -r -d '' file; do
        shasum -a 256 "$file" >> "$temp_manifest"
        ((file_count++))
        log_debug "Added: $file"
    done < <(find _bmad -path "*/agents/*.md" -type f -print0 2>/dev/null | sort -z)
    echo "" >> "$temp_manifest"

    # ---------------------------------------------------------------------
    # CRITICAL FILES: Workflows (workflow.md and workflow.xml)
    # ---------------------------------------------------------------------
    echo "# === WORKFLOWS ===" >> "$temp_manifest"
    while IFS= read -r -d '' file; do
        shasum -a 256 "$file" >> "$temp_manifest"
        ((file_count++))
        log_debug "Added: $file"
    done < <(find _bmad -name "workflow.md" -o -name "workflow.xml" -type f -print0 2>/dev/null | sort -z)
    echo "" >> "$temp_manifest"

    # ---------------------------------------------------------------------
    # CRITICAL FILES: Workflow steps (step-*.md files)
    # ---------------------------------------------------------------------
    echo "# === WORKFLOW STEPS ===" >> "$temp_manifest"
    while IFS= read -r -d '' file; do
        shasum -a 256 "$file" >> "$temp_manifest"
        ((file_count++))
        log_debug "Added: $file"
    done < <(find _bmad -path "*/steps/step-*.md" -type f -print0 2>/dev/null | sort -z)
    echo "" >> "$temp_manifest"

    # ---------------------------------------------------------------------
    # CRITICAL FILES: Configuration files
    # ---------------------------------------------------------------------
    echo "# === CONFIGURATION ===" >> "$temp_manifest"
    while IFS= read -r -d '' file; do
        shasum -a 256 "$file" >> "$temp_manifest"
        ((file_count++))
        log_debug "Added: $file"
    done < <(find _bmad -name "config.yaml" -o -name "config.yml" -type f -print0 2>/dev/null | sort -z)
    echo "" >> "$temp_manifest"

    # ---------------------------------------------------------------------
    # CRITICAL FILES: Hook scripts (.sh files in .claude/hooks)
    # ---------------------------------------------------------------------
    echo "# === SECURITY HOOKS ===" >> "$temp_manifest"
    if [[ -d ".claude/hooks" ]]; then
        while IFS= read -r -d '' file; do
            shasum -a 256 "$file" >> "$temp_manifest"
            ((file_count++))
            log_debug "Added: $file"
        done < <(find .claude/hooks -name "*.sh" -o -name "*.py" -type f -print0 2>/dev/null | sort -z)
    fi
    echo "" >> "$temp_manifest"

    # ---------------------------------------------------------------------
    # CRITICAL FILES: Core task definitions
    # ---------------------------------------------------------------------
    echo "# === CORE TASKS ===" >> "$temp_manifest"
    while IFS= read -r -d '' file; do
        shasum -a 256 "$file" >> "$temp_manifest"
        ((file_count++))
        log_debug "Added: $file"
    done < <(find _bmad/core/tasks -type f \( -name "*.xml" -o -name "*.md" -o -name "*.yaml" \) -print0 2>/dev/null | sort -z)
    echo "" >> "$temp_manifest"

    # Footer
    echo "" >> "$temp_manifest"
    echo "# Total files: $file_count" >> "$temp_manifest"
    echo "# End of manifest" >> "$temp_manifest"

    # Move to final location
    mv "$temp_manifest" "$MANIFEST_FILE"

    log_info "Manifest generated: $file_count critical files"
}

# Sign the manifest
sign_manifest() {
    log_info "Signing manifest..."

    # Remove old signature
    [[ -f "$SIGNATURE_FILE" ]] && rm "$SIGNATURE_FILE"

    # Create detached signature
    if gpg --armor --detach-sign --local-user "$KEY_ID" --output "$SIGNATURE_FILE" "$MANIFEST_FILE" 2>/dev/null; then
        log_info "Manifest signed successfully"
        log_info "Signature: $SIGNATURE_FILE"
    else
        log_error "Failed to sign manifest"
        exit 1
    fi
}

# Verify signature
verify_signature() {
    log_info "Verifying manifest signature..."

    if [[ ! -f "$MANIFEST_FILE" ]]; then
        log_error "Manifest file not found: $MANIFEST_FILE"
        return 1
    fi

    if [[ ! -f "$SIGNATURE_FILE" ]]; then
        log_error "Signature file not found: $SIGNATURE_FILE"
        return 1
    fi

    if gpg --verify "$SIGNATURE_FILE" "$MANIFEST_FILE" 2>&1 | grep -q "Good signature"; then
        log_info "Signature verification: ${GREEN}PASSED${NC}"
        return 0
    else
        log_error "Signature verification: ${RED}FAILED${NC}"
        return 1
    fi
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --verify-only)
                VERIFY_ONLY=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--verify-only] [--verbose]"
                echo ""
                echo "Options:"
                echo "  --verify-only  Only verify existing signature"
                echo "  --verbose      Show detailed output"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

# =============================================================================
# Main
# =============================================================================

main() {
    parse_args "$@"

    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║              BMAD Framework Manifest Signing                      ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""

    if [[ "$VERIFY_ONLY" == "true" ]]; then
        verify_signature
        exit $?
    fi

    check_key
    generate_manifest
    sign_manifest
    verify_signature

    echo ""
    log_info "Done! Manifest is ready."
    echo ""
}

main "$@"
