# Secret Management Procedures

**Version**: 1.0.0
**Date**: 2026-02-12
**Risk**: R-014 (CVSS 4.8)
**Remediation**: REM-006

---

## Secret Inventory

| Secret | Purpose | Storage | Rotation Frequency |
|--------|---------|---------|-------------------|
| `AUDIT_PRIVATE_KEY` | HMAC-SHA256 signing of audit log entries | Environment variable | Quarterly |
| `.bmad-token` | Session authentication token | Local file (600 perms) | Per-session |
| `SIEM_API_KEY` | SIEM provider authentication | Environment variable | Quarterly |
| `SIEM_ENDPOINT` | SIEM receiver URL | Environment variable | On infrastructure change |

## Key Generation

### AUDIT_PRIVATE_KEY

Generate a cryptographically secure random key (minimum 32 bytes):

```bash
# Generate 64-character hex key
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Requirements**:

- Minimum 32 characters
- Must not be empty, null, or whitespace (enforced by constructor validation)
- Should be unique per deployment environment

### .bmad-token

Generated automatically by `session-security-init.ts` during session start.
File permissions set to `600` (owner read/write only).

## Storage Recommendations

### Current (Local CLI)

- Environment variables via `.env` file (not committed to Git)
- `.env` is listed in `.gitignore`
- Token files stored with restrictive permissions (600)

### Production (Recommended)

| Provider | Integration | Notes |
|----------|------------|-------|
| **HashiCorp Vault** | `vault kv get secret/bmad/audit-key` | Recommended for enterprise |
| **AWS Secrets Manager** | `aws secretsmanager get-secret-value` | For AWS deployments |
| **Azure Key Vault** | `az keyvault secret show` | For Azure deployments |
| **1Password CLI** | `op read "op://vault/bmad/audit-key"` | For team use |

## Rotation Procedure

### Step 1: Generate New Key

```bash
NEW_KEY=$(openssl rand -hex 32)
echo "New key generated (do not log this value)"
```

### Step 2: Update Environment

```bash
# Update .env file
sed -i "s/^AUDIT_PRIVATE_KEY=.*/AUDIT_PRIVATE_KEY=${NEW_KEY}/" .env
```

### Step 3: Verify New Key Works

```bash
# Start a new session and verify audit logging
# Check that new entries are signed correctly
node -e "
const crypto = require('crypto');
const key = process.env.AUDIT_PRIVATE_KEY;
const testData = 'rotation-test-' + Date.now();
const sig = crypto.createHmac('sha256', key).update(testData).digest('hex');
console.log('Signature test:', sig.length === 64 ? 'PASS' : 'FAIL');
"
```

### Step 4: Archive Old Logs

Old log entries signed with the previous key remain verifiable only with that key.
Store the old key securely for historical verification:

```bash
# Archive old key with timestamp
echo "RETIRED_$(date +%Y%m%d)=${OLD_KEY}" >> .env.key-archive
chmod 600 .env.key-archive
```

## Emergency Rotation

If a key is compromised:

1. **Immediately** generate and deploy a new key
2. **Rotate** the `.bmad-token` by restarting the session
3. **Review** audit logs for unauthorized entries since last known good state
4. **Verify** hash chain integrity: entries signed with compromised key are suspect
5. **Document** the incident in the IR playbook

## Monitoring

- `settings-integrity.js` verifies hook file hashes on every session start
- `audit-integrity.js` validates hash chain on session end
- Hash baseline drift detected by CI (`quality-gate.yml`)

## Current Risk Assessment

| Risk | Mitigation | Residual |
|------|-----------|----------|
| Key in environment variable | Local-only access, 600 perms | LOW |
| No automatic rotation | Documented manual procedure | MEDIUM |
| Key in memory during runtime | Process isolation, no logging | LOW |
| Historical log verification | Archive old keys securely | LOW |

---

*Generated 2026-02-12 | Remediation: REM-006 | Risk: R-014*
