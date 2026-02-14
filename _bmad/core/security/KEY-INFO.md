# BMAD Framework Signing Key Information

## Key Details

| Property | Value |
|----------|-------|
| **Key ID** | `5528FA32356DA698` |
| **Full Fingerprint** | `A78C 5611 ADC0 CDF8 8726 683E 5528 FA32 356D A698` |
| **Algorithm** | RSA-4096 |
| **Created** | 2026-01-15 |
| **Expires** | 2028-01-15 |
| **User ID** | `BMAD Framework <bmad-signing@internal>` |
| **Usage** | Sign [SC] |

## Files in This Directory

| File | Purpose | Security |
|------|---------|----------|
| `bmad-public-key.asc` | Verify signatures | Safe to distribute |
| `bmad-private-key.asc` | Create signatures | **KEEP SECRET** |
| `KEY-INFO.md` | This documentation | Safe to distribute |
| `MANIFEST.sha256` | Hash list of critical files | Generated, signed |
| `MANIFEST.sha256.asc` | Signature of manifest | Generated |

## Security Notes

### Private Key Protection

The private key (`bmad-private-key.asc`) should be:
- Stored securely (encrypted backup recommended)
- Never committed to public repositories
- Access restricted to authorized signers only

### Key Backup

To restore this key on another machine:
```bash
gpg --import bmad-private-key.asc
gpg --import bmad-public-key.asc
```

### Key Rotation

This key expires on 2028-01-15. Before expiration:
1. Generate a new key
2. Re-sign all manifests
3. Update this documentation
4. Distribute new public key

## Verification Commands

```bash
# Import public key (one-time)
gpg --import _bmad/core/security/bmad-public-key.asc

# Verify manifest signature
gpg --verify _bmad/core/security/MANIFEST.sha256.asc

# Full verification (run script)
./_bmad/core/security/verify-integrity.sh
```

## Signing Commands

```bash
# Generate new manifest and sign
./_bmad/core/security/sign-manifest.sh

# Sign only (if manifest exists)
gpg --armor --detach-sign --local-user "bmad-signing@internal" \
    _bmad/core/security/MANIFEST.sha256
```
