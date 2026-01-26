# BMAD Framework File Integrity Verification

## Overview

The BMAD Framework includes a GPG-based file integrity verification system that detects unauthorized modifications to critical framework files (agents, workflows, configurations, and security hooks).

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FILE INTEGRITY SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   SIGNING (After Changes)                                               │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Critical    │───▶│   SHA-256    │───▶│   MANIFEST       │         │
│   │   Files      │    │    Hash      │    │  .sha256 file    │         │
│   │  (679 files) │    │              │    │                  │         │
│   └──────────────┘    └──────────────┘    └────────┬─────────┘         │
│                                                     │                   │
│                                                     ▼                   │
│                                           ┌──────────────────┐         │
│                                           │   GPG Sign       │         │
│                                           │  (RSA-4096)      │         │
│                                           └────────┬─────────┘         │
│                                                     │                   │
│                                                     ▼                   │
│                                           ┌──────────────────┐         │
│                                           │  MANIFEST.asc    │         │
│                                           │  (signature)     │         │
│                                           └──────────────────┘         │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   VERIFICATION (Before Sessions)                                        │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐         │
│   │  Verify      │───▶│   Verify     │───▶│  ✓ All OK or     │         │
│   │  Signature   │    │   Hashes     │    │  ✗ Alert         │         │
│   └──────────────┘    └──────────────┘    └──────────────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Verify Integrity (Recommended Before Each Session)

```bash
./_bmad/core/security/verify-integrity.sh
```

### After Making Legitimate Changes

```bash
./_bmad/core/security/sign-manifest.sh
```

## Files Protected

The system monitors **679 critical files**:

| Category | Pattern | Count |
|----------|---------|-------|
| Agents | `_bmad/*/agents/*.md` | ~80 |
| Workflows | `workflow.md`, `workflow.xml` | ~50 |
| Workflow Steps | `*/steps/step-*.md` | ~500 |
| Configuration | `config.yaml`, `config.yml` | ~10 |
| Security Hooks | `.claude/hooks/*.sh`, `*.py` | ~10 |
| Core Tasks | `_bmad/core/tasks/*` | ~5 |

## Command Reference

### verify-integrity.sh

Verifies the manifest signature and all file hashes.

```bash
# Full verification with output
./_bmad/core/security/verify-integrity.sh

# Quiet mode (only errors and summary)
./_bmad/core/security/verify-integrity.sh --quiet

# Import public key if needed
./_bmad/core/security/verify-integrity.sh --import-key
```

**Exit Codes:**
- `0` - All checks passed
- `1` - Signature verification failed
- `2` - File hash mismatch detected (tampering)
- `3` - Missing files detected
- `4` - Setup error (missing manifest, key, etc.)

### sign-manifest.sh

Generates a new manifest and signs it.

```bash
# Generate and sign
./_bmad/core/security/sign-manifest.sh

# Verbose output (shows each file)
./_bmad/core/security/sign-manifest.sh --verbose

# Verify existing signature only
./_bmad/core/security/sign-manifest.sh --verify-only
```

## Example Output

### Successful Verification

```
╔══════════════════════════════════════════════════════════════════╗
║           BMAD Framework Integrity Verification                   ║
╚══════════════════════════════════════════════════════════════════╝

[OK] Manifest signature is valid
    gpg: Signature made Wed 15 Jan 18:25:19 2026 CET
[...] Verifying file integrity...
    ✓ _bmad/core/agents/abdul.md
    ✓ _bmad/core/agents/bmad-master.md
    ... (679 files)

═══════════════════════════════════════════════════════════════════
                    INTEGRITY CHECK SUMMARY
═══════════════════════════════════════════════════════════════════

  Total files checked:  679
  Verified (OK):        679
  Modified (FAIL):      0
  Missing files:        0

  ╔════════════════════════════════════════════════════════════════╗
  ║            ALL INTEGRITY CHECKS PASSED                         ║
  ╚════════════════════════════════════════════════════════════════╝
```

### Tamper Detected

```
[FAIL] MODIFIED: _bmad/core/agents/abdul.md
[FAIL]   Expected: 0d3049113b2cff276a19374884e55beb...
[FAIL]   Actual:   1156ab62f4cdb5fa82af02c0323acd4c...

═══════════════════════════════════════════════════════════════════
                    INTEGRITY CHECK SUMMARY
═══════════════════════════════════════════════════════════════════

  Total files checked:  679
  Verified (OK):        678
  Modified (FAIL):      1
  Missing files:        0

  ╔════════════════════════════════════════════════════════════════╗
  ║          INTEGRITY CHECK FAILED - FILES MAY BE TAMPERED        ║
  ╚════════════════════════════════════════════════════════════════╝

  Actions:
  1. Check git status for unexpected changes
  2. If changes are legitimate, re-run sign-manifest.sh
  3. If changes are unexpected, investigate immediately
```

## GPG Key Information

| Property | Value |
|----------|-------|
| **Key ID** | `5528FA32356DA698` |
| **Algorithm** | RSA-4096 |
| **Created** | 2026-01-15 |
| **Expires** | 2028-01-15 |
| **User ID** | `BMAD Framework <bmad-signing@internal>` |

### Key Files

| File | Location | Purpose |
|------|----------|---------|
| Public Key | `_bmad/core/security/bmad-public-key.asc` | Verify signatures |
| Private Key | `_bmad/core/security/bmad-private-key.asc` | Sign manifests (keep secure) |
| Key Info | `_bmad/core/security/KEY-INFO.md` | Key documentation |

### Importing the Key

If verification fails with "key not found":

```bash
gpg --import _bmad/core/security/bmad-public-key.asc
```

## Workflow Integration

### Recommended Practice

1. **Before starting work:** Run `verify-integrity.sh`
2. **After making changes:** Run `sign-manifest.sh`
3. **Before committing:** Run `verify-integrity.sh` to confirm

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Verify BMAD Integrity
  run: |
    gpg --import _bmad/core/security/bmad-public-key.asc
    ./_bmad/core/security/verify-integrity.sh --quiet
```

## Security Considerations

### What This Protects Against

- Unauthorized file modifications
- Supply chain attacks on framework files
- Accidental corruption
- Malware that modifies agent/workflow files

### What This Does NOT Protect Against

- Compromise of the signing key
- Modifications made before signing
- Files not in the critical files list
- Runtime attacks that don't modify files

### Private Key Security

The private key (`bmad-private-key.asc`) should be:
- Stored securely (encrypted backup recommended)
- Never committed to public repositories
- Access restricted to authorized signers only

## Troubleshooting

### "Signature verification failed"

1. Check if the public key is imported: `gpg --list-keys bmad-signing@internal`
2. Import if missing: `gpg --import _bmad/core/security/bmad-public-key.asc`

### "Manifest not found"

Run the signing script to generate the initial manifest:
```bash
./_bmad/core/security/sign-manifest.sh
```

### "File hash mismatch"

1. Check `git status` for changes
2. If changes are legitimate, re-sign: `./_bmad/core/security/sign-manifest.sh`
3. If unexpected, investigate the modification

## Related Documentation

- [Security Audit Logging](Security-Audit-Logging.md)
- [Security YOLO Mode Restrictions](Security-YOLO-Mode-Restrictions.md)
- [BMAD Security Audit Report](/_bmad-output/BMAD-Security-Review/BMAD-Security-Audit-Report.md)
