#!/bin/bash
#
# BMAD Framework Integrity Verification Script
#
# Verifies the cryptographic signature of the manifest and checks
# that all critical files match their recorded hashes.
#
# Usage: ./verify-integrity.sh [--quiet] [--import-key]
#
# Exit codes:
#   0 - All checks passed
#   1 - Signature verification failed
#   2 - File hash mismatch detected
#   3 - Missing files detected
#   4 - Setup error (missing manifest, key, etc.)
#

set -uo pipefail

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SECURITY_DIR="$SCRIPT_DIR"

MANIFEST_FILE="$SECURITY_DIR/MANIFEST.sha256"
SIGNATURE_FILE="$SECURITY_DIR/MANIFEST.sha256.asc"
PUBLIC_KEY_FILE="$SECURITY_DIR/bmad-public-key.asc"
KEY_ID="bmad-signing@internal"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

QUIET=false
IMPORT_KEY=false

# Counters
TOTAL_FILES=0
VERIFIED_FILES=0
FAILED_FILES=0
MISSING_FILES=0
VERIFICATION_RESULT=0

# =============================================================================
# Functions
# =============================================================================

log_info() {
    [[ "$QUIET" == "false" ]] && echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_status() {
    [[ "$QUIET" == "false" ]] && echo -e "${CYAN}[...]${NC} $1"
}

# Import public key if not already in keyring
import_public_key() {
    if ! gpg --list-keys "$KEY_ID" &>/dev/null; then
        log_status "Importing BMAD public key..."
        if [[ ! -f "$PUBLIC_KEY_FILE" ]]; then
            log_error "Public key not found: $PUBLIC_KEY_FILE"
            exit 4
        fi
        gpg --import "$PUBLIC_KEY_FILE" 2>/dev/null
        log_info "Public key imported"
    fi
}

# Verify manifest signature
verify_signature() {
    log_status "Verifying manifest signature..."

    if [[ ! -f "$MANIFEST_FILE" ]]; then
        log_error "Manifest not found: $MANIFEST_FILE"
        log_error "Run sign-manifest.sh first to generate and sign the manifest."
        exit 4
    fi

    if [[ ! -f "$SIGNATURE_FILE" ]]; then
        log_error "Signature not found: $SIGNATURE_FILE"
        log_error "Run sign-manifest.sh first to sign the manifest."
        exit 4
    fi

    local gpg_output
    gpg_output=$(gpg --verify "$SIGNATURE_FILE" "$MANIFEST_FILE" 2>&1) || true

    if echo "$gpg_output" | grep -q "Good signature"; then
        log_info "Manifest signature is valid"

        # Extract signature date
        local sig_date
        sig_date=$(echo "$gpg_output" | grep "Signature made" | head -1 || echo "")
        if [[ -n "$sig_date" ]]; then
            [[ "$QUIET" == "false" ]] && echo -e "    ${BLUE}$sig_date${NC}"
        fi
        return 0
    elif echo "$gpg_output" | grep -q "BAD signature"; then
        log_error "MANIFEST SIGNATURE IS INVALID!"
        log_error "The manifest may have been tampered with."
        exit 1
    else
        log_error "Signature verification failed"
        log_error "$gpg_output"
        exit 1
    fi
}

# Verify individual file hashes
verify_files() {
    log_status "Verifying file integrity..."

    cd "$PROJECT_ROOT"

    local line_num=0
    while IFS= read -r line; do
        ((line_num++))

        # Skip comments and empty lines
        [[ -z "$line" || "$line" =~ ^# ]] && continue

        # Parse hash and filename
        local expected_hash file_path
        expected_hash=$(echo "$line" | awk '{print $1}')
        file_path=$(echo "$line" | awk '{print $2}')

        # Validate line format
        if [[ -z "$expected_hash" || -z "$file_path" ]]; then
            continue
        fi

        ((TOTAL_FILES++))

        # Check if file exists
        if [[ ! -f "$file_path" ]]; then
            log_error "MISSING: $file_path"
            ((MISSING_FILES++))
            continue
        fi

        # Calculate current hash
        local current_hash
        current_hash=$(shasum -a 256 "$file_path" | awk '{print $1}')

        # Compare
        if [[ "$current_hash" == "$expected_hash" ]]; then
            ((VERIFIED_FILES++))
            [[ "$QUIET" == "false" ]] && echo -e "    ${GREEN}✓${NC} $file_path"
        else
            log_error "MODIFIED: $file_path"
            log_error "  Expected: $expected_hash"
            log_error "  Actual:   $current_hash"
            ((FAILED_FILES++))
        fi

    done < "$MANIFEST_FILE"
}

# Print summary
print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "                    INTEGRITY CHECK SUMMARY"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo -e "  Total files checked:  ${CYAN}$TOTAL_FILES${NC}"
    echo -e "  Verified (OK):        ${GREEN}$VERIFIED_FILES${NC}"

    if [[ $FAILED_FILES -gt 0 ]]; then
        echo -e "  Modified (FAIL):      ${RED}$FAILED_FILES${NC}"
    else
        echo -e "  Modified (FAIL):      ${GREEN}0${NC}"
    fi

    if [[ $MISSING_FILES -gt 0 ]]; then
        echo -e "  Missing files:        ${RED}$MISSING_FILES${NC}"
    else
        echo -e "  Missing files:        ${GREEN}0${NC}"
    fi

    echo ""

    if [[ $FAILED_FILES -eq 0 && $MISSING_FILES -eq 0 ]]; then
        echo -e "  ${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "  ${GREEN}║            ALL INTEGRITY CHECKS PASSED                         ║${NC}"
        echo -e "  ${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        VERIFICATION_RESULT=0
        return 0
    else
        echo -e "  ${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "  ${RED}║          INTEGRITY CHECK FAILED - FILES MAY BE TAMPERED        ║${NC}"
        echo -e "  ${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "  Actions:"
        echo "  1. Check git status for unexpected changes"
        echo "  2. If changes are legitimate, re-run sign-manifest.sh"
        echo "  3. If changes are unexpected, investigate immediately"
        echo ""

        if [[ $FAILED_FILES -gt 0 ]]; then
            VERIFICATION_RESULT=2
            return 2
        else
            VERIFICATION_RESULT=3
            return 3
        fi
    fi
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --quiet|-q)
                QUIET=true
                shift
                ;;
            --import-key)
                IMPORT_KEY=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--quiet] [--import-key]"
                echo ""
                echo "Options:"
                echo "  --quiet       Minimal output (only errors and summary)"
                echo "  --import-key  Import public key before verification"
                echo ""
                echo "Exit codes:"
                echo "  0 - All checks passed"
                echo "  1 - Signature verification failed"
                echo "  2 - File hash mismatch detected"
                echo "  3 - Missing files detected"
                echo "  4 - Setup error"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 4
                ;;
        esac
    done
}

# =============================================================================
# Main
# =============================================================================

main() {
    parse_args "$@"

    if [[ "$QUIET" == "false" ]]; then
        echo ""
        echo "╔══════════════════════════════════════════════════════════════════╗"
        echo "║           BMAD Framework Integrity Verification                   ║"
        echo "╚══════════════════════════════════════════════════════════════════╝"
        echo ""
    fi

    # Import key if requested or if not in keyring
    if [[ "$IMPORT_KEY" == "true" ]] || ! gpg --list-keys "$KEY_ID" &>/dev/null 2>&1; then
        import_public_key
    fi

    # Step 1: Verify signature
    verify_signature

    # Step 2: Verify file hashes
    verify_files

    # Step 3: Print summary and exit with appropriate code
    print_summary

    # Exit with appropriate code
    if [[ $FAILED_FILES -eq 0 && $MISSING_FILES -eq 0 ]]; then
        exit 0
    elif [[ $FAILED_FILES -gt 0 ]]; then
        exit 2
    else
        exit 3
    fi
}

main "$@"
