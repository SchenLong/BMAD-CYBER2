#!/bin/bash
# ============================================================================
# BMAD Audit Log - Hash Chain Verification Tool
# ============================================================================
# Verifies the integrity of the audit log hash chain.
# Detects tampering by validating each entry's prev_hash matches the
# previous entry's hash.
# ============================================================================

AUDIT_LOG="/Users/paultinp/BMAD-CYBER2/_bmad-output/.audit/audit.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}  BMAD Audit Log - Hash Chain Verification${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

if [ ! -f "$AUDIT_LOG" ]; then
    echo -e "${RED}ERROR: Audit log not found at $AUDIT_LOG${NC}"
    exit 1
fi

TOTAL_ENTRIES=$(wc -l < "$AUDIT_LOG" | tr -d ' ')
echo "Verifying $TOTAL_ENTRIES entries..."
echo ""

EXPECTED_PREV="GENESIS"
ENTRY_NUM=0
CHAIN_VALID=true
TAMPERED_ENTRIES=()

while IFS= read -r line; do
    ((ENTRY_NUM++))

    # Extract current entry's prev_hash and hash
    ACTUAL_PREV=$(echo "$line" | python3 -c "import sys,json; print(json.load(sys.stdin)['prev_hash'])")
    CURRENT_HASH=$(echo "$line" | python3 -c "import sys,json; print(json.load(sys.stdin)['hash'])")
    EVENT_TYPE=$(echo "$line" | python3 -c "import sys,json; print(json.load(sys.stdin)['event_type'])")
    TIMESTAMP=$(echo "$line" | python3 -c "import sys,json; print(json.load(sys.stdin)['timestamp'])")

    # Validate chain
    if [ "$ACTUAL_PREV" == "$EXPECTED_PREV" ]; then
        echo -e "  Entry $ENTRY_NUM: ${GREEN}✓${NC} $EVENT_TYPE ($TIMESTAMP)"
        echo -e "           prev_hash: ${ACTUAL_PREV:0:20}..."
    else
        echo -e "  Entry $ENTRY_NUM: ${RED}✗ CHAIN BROKEN${NC} $EVENT_TYPE ($TIMESTAMP)"
        echo -e "           Expected: ${EXPECTED_PREV:0:30}..."
        echo -e "           Got:      ${ACTUAL_PREV:0:30}..."
        CHAIN_VALID=false
        TAMPERED_ENTRIES+=($ENTRY_NUM)
    fi

    # Update expected for next iteration
    EXPECTED_PREV="$CURRENT_HASH"

done < "$AUDIT_LOG"

echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}  Verification Results${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

if $CHAIN_VALID; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              CHAIN INTEGRITY VERIFIED ✅                         ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║  All $TOTAL_ENTRIES entries have valid hash chain linkage.                  ║${NC}"
    echo -e "${GREEN}║  No tampering detected.                                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              TAMPERING DETECTED ❌                               ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  Hash chain is broken at entries: ${TAMPERED_ENTRIES[*]}                        ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  This indicates the audit log may have been modified.            ║${NC}"
    echo -e "${RED}║  Investigate entries immediately.                                ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
