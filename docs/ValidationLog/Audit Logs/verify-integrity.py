#!/usr/bin/env python3
"""
BMAD Audit Log - Full Integrity Verification Tool
=================================================
Validates:
1. Hash chain linkage (prev_hash matches previous entry's hash)
2. Content integrity (entry hash matches computed hash of entry content)

This detects BOTH chain breaks AND content tampering.
"""

import json
import hashlib
import sys
from pathlib import Path

# Colors for terminal output
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

AUDIT_LOG = Path("/Users/paultinp/BMAD-CYBER2/_bmad-output/.audit/audit.log")


def compute_hash(timestamp: str, event_type: str, user: str, workflow: str, details: dict) -> str:
    """Compute SHA-256 hash of entry content (matches audit-test.sh implementation)."""
    # Hash input: timestamp + event_type + user + workflow + details
    details_str = json.dumps(details, separators=(',', ':'))
    hash_input = f"{timestamp}{event_type}{user}{workflow}{details_str}"
    hash_value = hashlib.sha256(hash_input.encode()).hexdigest()
    return f"sha256:{hash_value}"


def verify_audit_log():
    """Verify the audit log for both chain integrity and content integrity."""
    print(f"{BLUE}============================================================================{NC}")
    print(f"{BLUE}  BMAD Audit Log - Full Integrity Verification{NC}")
    print(f"{BLUE}============================================================================{NC}")
    print()

    if not AUDIT_LOG.exists():
        print(f"{RED}ERROR: Audit log not found at {AUDIT_LOG}{NC}")
        return False

    entries = []
    with open(AUDIT_LOG, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                entries.append(json.loads(line))

    print(f"Verifying {len(entries)} entries...")
    print()

    expected_prev_hash = "GENESIS"
    chain_valid = True
    content_valid = True
    tampered_entries = []
    chain_broken_entries = []

    for i, entry in enumerate(entries):
        entry_num = i + 1
        event_type = entry.get('event_type', 'unknown')
        timestamp = entry.get('timestamp', 'unknown')
        user = entry.get('user', '')
        workflow = entry.get('workflow', '')
        details = entry.get('details', {})
        stored_hash = entry.get('hash', '')
        prev_hash = entry.get('prev_hash', '')

        # Check 1: Chain linkage
        chain_ok = prev_hash == expected_prev_hash

        # Check 2: Content integrity (recompute hash and compare)
        computed_hash = compute_hash(timestamp, event_type, user, workflow, details)
        content_ok = computed_hash == stored_hash

        # Report results
        if chain_ok and content_ok:
            print(f"  Entry {entry_num}: {GREEN}✓{NC} {event_type} ({timestamp})")
            print(f"           chain: {GREEN}OK{NC}  content: {GREEN}OK{NC}")
        elif not chain_ok and content_ok:
            print(f"  Entry {entry_num}: {RED}✗ CHAIN BROKEN{NC} {event_type} ({timestamp})")
            print(f"           Expected prev_hash: {expected_prev_hash[:30]}...")
            print(f"           Got prev_hash:      {prev_hash[:30]}...")
            chain_valid = False
            chain_broken_entries.append(entry_num)
        elif chain_ok and not content_ok:
            print(f"  Entry {entry_num}: {RED}✗ CONTENT TAMPERED{NC} {event_type} ({timestamp})")
            print(f"           Stored hash:   {stored_hash[:40]}...")
            print(f"           Computed hash: {computed_hash[:40]}...")
            content_valid = False
            tampered_entries.append(entry_num)
        else:
            print(f"  Entry {entry_num}: {RED}✗ CHAIN BROKEN + CONTENT TAMPERED{NC} {event_type} ({timestamp})")
            chain_valid = False
            content_valid = False
            chain_broken_entries.append(entry_num)
            tampered_entries.append(entry_num)

        # Update expected for next iteration
        expected_prev_hash = stored_hash

    print()
    print(f"{BLUE}============================================================================{NC}")
    print(f"{BLUE}  Verification Results{NC}")
    print(f"{BLUE}============================================================================{NC}")
    print()

    if chain_valid and content_valid:
        print(f"{GREEN}╔══════════════════════════════════════════════════════════════════╗{NC}")
        print(f"{GREEN}║              FULL INTEGRITY VERIFIED ✅                          ║{NC}")
        print(f"{GREEN}║                                                                  ║{NC}")
        print(f"{GREEN}║  • Chain linkage: VALID                                          ║{NC}")
        print(f"{GREEN}║  • Content integrity: VALID                                      ║{NC}")
        print(f"{GREEN}║  • Total entries verified: {len(entries):<35}║{NC}")
        print(f"{GREEN}║  • No tampering detected                                         ║{NC}")
        print(f"{GREEN}╚══════════════════════════════════════════════════════════════════╝{NC}")
        return True
    else:
        print(f"{RED}╔══════════════════════════════════════════════════════════════════╗{NC}")
        print(f"{RED}║              INTEGRITY VIOLATION DETECTED ❌                     ║{NC}")
        print(f"{RED}╠══════════════════════════════════════════════════════════════════╣{NC}")
        if not chain_valid:
            print(f"{RED}║  Chain broken at entries: {str(chain_broken_entries):<38}║{NC}")
        if not content_valid:
            print(f"{RED}║  Content tampered at entries: {str(tampered_entries):<34}║{NC}")
        print(f"{RED}║                                                                  ║{NC}")
        print(f"{RED}║  IMMEDIATE INVESTIGATION REQUIRED                                ║{NC}")
        print(f"{RED}╚══════════════════════════════════════════════════════════════════╝{NC}")
        return False


if __name__ == "__main__":
    success = verify_audit_log()
    sys.exit(0 if success else 1)
