# Chain of Custody Procedures

**Document ID:** BMAD-SEC-COC-001
**Version:** 1.0.0
**Last Updated:** 2026-01-31
**Classification:** INTERNAL
**Status:** Active

---

## 1. Purpose

This document defines the procedures for handling, storing, transferring, and maintaining the integrity of validation evidence and security artifacts within the BMAD system. These procedures ensure that evidence collected during security operations maintains its evidentiary value and can withstand scrutiny during audits, compliance reviews, and potential legal proceedings.

The Chain of Custody (CoC) establishes a documented chronological history that tracks the sequence of custody, control, transfer, analysis, and disposition of physical or electronic evidence.

---

## 2. Scope

### 2.1 Artifacts Covered

This document covers the following types of evidence and artifacts:

| Category | Artifacts | Storage Location |
|----------|-----------|------------------|
| **Validation Logs** | Token validation events, authorization decisions, RBAC checks | `.claude/logs/security.log` |
| **Security Scan Results** | OWASP compliance scans, vulnerability assessments, anomaly detection reports | `docs/ValidationLog/` |
| **Audit Trails** | Tamper-evident hash-chained logs, signed audit entries | `docs/ValidationLog/Audit Logs/` |
| **Evidence Manifests** | Directory hashes, file integrity manifests | Generated via `evidence-integrity.js` |
| **Compliance Reports** | SOC2, ISO 27001, NIST 800-53 reports | `docs/compliance/` |
| **Incident Records** | Security incident documentation, forensic artifacts | `docs/incidents/` |
| **Configuration Snapshots** | RBAC configs, security settings at time of event | `_bmad/core/security/` |
| **Artifact Signatures** | SLSA provenance, artifact signing bundles | Generated via `artifact-signer.js` |

### 2.2 Exclusions

This document does not cover:

- Transient runtime data not persisted to logs
- User personal data (covered by separate privacy policies)
- Third-party API responses (covered by vendor agreements)

---

## 3. Procedures

### 3.1 Evidence Collection

#### 3.1.1 Automated Collection

The BMAD system automatically collects evidence through the following components:

**Audit Logger** (`src/security/audit/audit-logger.ts`)

```typescript
// All security events are automatically captured with:
{
  id: string;           // Unique event identifier (UUID)
  timestamp: Date;      // ISO 8601 timestamp
  userId?: string;      // Associated user/session
  action: string;       // Action performed
  resource: string;     // Resource accessed
  outcome: string;      // success | failure | warning
  severity: string;     // low | medium | high | critical
  category: string;     // authentication | authorization | data_access | configuration | security
  hash: string;         // SHA256 hash for chain integrity
  previousHash: string; // Link to previous entry
  signature: string;    // Digital signature
}
```

**Evidence Integrity Module** (`src/security/evidence-integrity.js`)

```javascript
// Generate evidence manifest for a directory
const manifest = await createEvidenceManifest(
  '/path/to/evidence',
  '/path/to/manifest.json',
  { exclude: ['*.tmp'], includeHidden: false }
);
```

#### 3.1.2 Manual Collection Procedures

When collecting evidence manually:

1. **Document the context**: Record why evidence is being collected, the incident/event reference, and the collector's identity
2. **Timestamp the collection**: Use ISO 8601 format with timezone: `YYYY-MM-DDTHH:mm:ss.sssZ`
3. **Calculate hashes immediately**: Use SHA256 for all artifacts
4. **Create chain entry**: Log the collection event in the audit system

**Collection Script Example:**

```bash
#!/bin/bash
# Manual evidence collection with chain of custody

EVIDENCE_DIR="docs/incidents/$(date +%Y%m%d_%H%M%S)"
COLLECTOR="${USER}"
INCIDENT_ID="${1:-UNKNOWN}"

mkdir -p "$EVIDENCE_DIR"

# Copy evidence
cp -r /path/to/source "$EVIDENCE_DIR/artifacts/"

# Generate manifest with hashes
node -e "
const { createEvidenceManifest } = require('./src/security/evidence-integrity.js');
createEvidenceManifest(
  '${EVIDENCE_DIR}/artifacts',
  '${EVIDENCE_DIR}/manifest.json',
  { includeHidden: true }
).then(manifest => {
  console.log('Manifest created:', manifest.fileCount, 'files');
});
"

# Create collection record
cat > "$EVIDENCE_DIR/collection-record.json" << EOF
{
  "incidentId": "${INCIDENT_ID}",
  "collectedBy": "${COLLECTOR}",
  "collectedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sourceLocation": "/path/to/source",
  "hostname": "$(hostname)",
  "purpose": "Evidence collection for incident investigation"
}
EOF

echo "Evidence collected to: $EVIDENCE_DIR"
```

### 3.2 Evidence Storage

#### 3.2.1 Storage Locations

| Evidence Type | Primary Location | Backup Location | Retention |
|--------------|------------------|-----------------|-----------|
| Real-time logs | `.claude/logs/` | Remote SIEM | 90 days |
| Audit trails | `docs/ValidationLog/Audit Logs/` | Encrypted archive | 7 years |
| Incident evidence | `docs/incidents/` | Offline secure storage | 7 years |
| Compliance reports | `docs/compliance/` | Document management system | 7 years |
| Configuration snapshots | `_bmad/core/security/` | Version control | Indefinite |

#### 3.2.2 Access Controls

Evidence storage adheres to the following access control requirements:

**Role-Based Access (RBAC)**

| Role | Read Access | Write Access | Delete Access |
|------|-------------|--------------|---------------|
| Admin | All evidence | All evidence | Archived only |
| Security Analyst | Security logs, incidents | Incident notes | None |
| Compliance Officer | Compliance reports, audits | Reports | None |
| Developer | Own session logs only | None | None |
| Auditor (External) | Specified scope only | None | None |

**Access is controlled via:**

- RBAC configuration: `_bmad/core/security/rbac-config.yaml`
- Token validation: `src/security/encryption/generate-token.ts`
- Session management: `src/security/session-manager.ts`

#### 3.2.3 Storage Integrity

All stored evidence must maintain integrity through:

1. **Hash verification**: Regular verification against stored manifests
2. **File system permissions**: Read-only for archived evidence
3. **Tamper detection**: Hash chain verification on audit logs
4. **Encryption at rest**: Sensitive evidence encrypted with AES-256

### 3.3 Evidence Transfer

#### 3.3.1 Internal Transfer

When transferring evidence between internal systems or personnel:

1. **Verify recipient authorization**: Confirm RBAC permissions
2. **Create transfer record**: Log the transfer event
3. **Use secure channels**: Encrypted file transfer (SFTP, SCP)
4. **Verify integrity post-transfer**: Compare hashes before and after

**Transfer Record Format:**

```json
{
  "transferId": "uuid-v4",
  "evidenceRef": "manifest-hash or incident-id",
  "transferredFrom": {
    "userId": "sender-id",
    "role": "Security Analyst",
    "system": "source-hostname"
  },
  "transferredTo": {
    "userId": "recipient-id",
    "role": "Compliance Officer",
    "system": "destination-hostname"
  },
  "transferMethod": "SFTP",
  "transferredAt": "ISO-8601-timestamp",
  "hashBeforeTransfer": "sha256-hash",
  "hashAfterTransfer": "sha256-hash",
  "verificationStatus": "VERIFIED"
}
```

#### 3.3.2 External Transfer

External evidence transfer (to auditors, legal counsel, regulators) requires:

1. **Written authorization**: Approved by Security Lead or Legal
2. **Data classification review**: Ensure no unauthorized data included
3. **Formal chain of custody form**: Physical or digital signature
4. **Secure delivery method**: Encrypted transfer with delivery confirmation
5. **Acknowledgment of receipt**: Documented acceptance by recipient

#### 3.3.3 Transfer Prohibition

Evidence must **never** be transferred via:

- Unencrypted email
- Personal storage devices without encryption
- Public file sharing services
- Unauthenticated channels

### 3.4 Evidence Integrity

#### 3.4.1 Hash Verification

The `evidence-integrity.js` module provides core integrity functions:

```javascript
import {
  hashFile,
  hashDirectory,
  createEvidenceManifest,
  verifyEvidence,
  verifyFileHash,
  generateVerificationReport
} from './src/security/evidence-integrity.js';

// Verify a single file
const isValid = await verifyFileHash('/path/to/file', expectedHash);

// Verify entire evidence directory against manifest
const result = await verifyEvidence('/path/to/manifest.json');
console.log(generateVerificationReport(result));
```

**Verification Report Output:**

```
═══════════════════════════════════════════════════════════════
                EVIDENCE INTEGRITY VERIFICATION REPORT
═══════════════════════════════════════════════════════════════

Status: VERIFIED
Verified: 2026-01-31T12:00:00.000Z
Manifest: /path/to/manifest.json

───────────────────────────────────────────────────────────────
Files Checked:  42
Files Passed:   42
Files Failed:   0
Files Missing:  0
Manifest OK:    YES

═══════════════════════════════════════════════════════════════
              VERIFICATION PASSED
═══════════════════════════════════════════════════════════════
```

#### 3.4.2 Tamper-Evident Audit Logs

The audit logger (`src/security/audit/audit-logger.ts`) implements a cryptographic hash chain:

- Each log entry contains a hash of its content + the previous entry's hash
- Digital signatures using SHA256 with the audit private key
- Chain verification detects any modification or deletion

```typescript
// Verify audit log integrity
const logger = getAuditLogger();
const isIntact = await logger.verifyIntegrity(startDate, endDate);
```

#### 3.4.3 Artifact Signing

For build artifacts and releases, the `artifact-signer.js` provides SLSA-compatible signing:

```javascript
const ArtifactSigner = require('./src/security/supply-chain/artifact-signer.js');

const signer = new ArtifactSigner();
await signer.initialize({ generateKeys: true });

// Sign artifact with provenance
const bundle = await signer.signArtifact('/path/to/artifact', {
  builderId: 'bmad-ci/v1',
  dependencies: ['dep1@1.0.0', 'dep2@2.0.0']
});

// Verify artifact
const result = await signer.verifyArtifact('/path/to/artifact');
console.log(result.valid ? 'VALID' : 'INVALID');
```

---

## 4. Roles and Responsibilities

### 4.1 Security Team

| Responsibility | Owner |
|----------------|-------|
| Maintain evidence collection systems | Security Engineer |
| Monitor evidence integrity | Security Analyst |
| Respond to integrity violations | Security Lead |
| Review and approve external transfers | Security Lead |
| Manage encryption keys for evidence | Security Engineer |

### 4.2 QA Team

| Responsibility | Owner |
|----------------|-------|
| Generate validation evidence during testing | QA Engineer |
| Maintain test evidence manifests | QA Lead |
| Ensure evidence completeness for releases | QA Lead |

### 4.3 Compliance Team

| Responsibility | Owner |
|----------------|-------|
| Define retention requirements | Compliance Officer |
| Coordinate with auditors | Compliance Officer |
| Verify evidence meets regulatory requirements | Compliance Officer |
| Approve evidence destruction | Compliance Lead |

### 4.4 All Personnel

| Responsibility | Owner |
|----------------|-------|
| Report evidence handling anomalies | All Staff |
| Follow transfer procedures | All Staff |
| Protect credentials for evidence systems | All Staff |

---

## 5. Retention Policy

### 5.1 Retention Periods

| Evidence Category | Retention Period | Legal Basis |
|-------------------|------------------|-------------|
| Security incident evidence | 7 years | Legal/regulatory requirements |
| Compliance audit evidence | 7 years | SOC2, ISO 27001, regulatory |
| Validation logs | 90 days (rolling) | Operational requirements |
| Authentication logs | 1 year | Security best practices |
| Configuration snapshots | Indefinite | Version controlled |
| Signed artifacts | Duration of software support | Software lifecycle |

### 5.2 Retention Procedures

1. **Active retention**: Evidence remains readily accessible for the first 90 days
2. **Archive retention**: After 90 days, evidence moves to archived storage with compressed format
3. **Secure destruction**: At end of retention period, evidence is securely deleted with verification

### 5.3 Legal Hold

When a legal hold is in effect:

- Normal retention periods are suspended
- Evidence must not be destroyed regardless of age
- Legal team must explicitly release the hold

---

## 6. Audit Trail Requirements

### 6.1 Mandatory Logging Events

The following events must always be logged to the audit trail:

| Event Category | Events |
|----------------|--------|
| **Authentication** | Login success, login failure, logout, token generation, token validation |
| **Authorization** | Permission grants, permission denials, role changes, RBAC updates |
| **Evidence Handling** | Evidence collection, transfer, access, modification, deletion |
| **Configuration** | Security config changes, RBAC updates, key rotation |
| **Incidents** | Incident creation, status changes, evidence attachment |
| **Compliance** | Report generation, audit access, finding updates |
| **Integrity** | Hash verification, tampering detection, signature validation |

### 6.2 Audit Entry Requirements

Each audit entry must contain:

| Field | Description | Required |
|-------|-------------|----------|
| `id` | Unique identifier (UUID v4) | Yes |
| `timestamp` | ISO 8601 with timezone | Yes |
| `eventType` | Category of event | Yes |
| `action` | Specific action performed | Yes |
| `userId` | User or system performing action | Yes |
| `sessionId` | Session identifier | If applicable |
| `resource` | Resource affected | Yes |
| `outcome` | success, failure, warning | Yes |
| `severity` | low, medium, high, critical | Yes |
| `details` | Additional context (JSON) | If applicable |
| `sourceIP` | Origin IP address | If applicable |
| `hash` | Entry hash for chain | Yes |
| `previousHash` | Previous entry hash | Yes |
| `signature` | Digital signature | Yes |

### 6.3 Audit Log Protection

Audit logs are protected through:

1. **Append-only access**: No modification or deletion of historical entries
2. **Hash chain integrity**: Each entry cryptographically linked
3. **Digital signatures**: Entries signed with audit private key
4. **Separate storage**: Audit logs stored independently from application data
5. **SIEM forwarding**: Critical events forwarded to SIEM in real-time
6. **Backup**: Regular encrypted backups to separate location

### 6.4 Audit Verification

Regular verification schedule:

| Verification Type | Frequency | Responsible |
|-------------------|-----------|-------------|
| Hash chain integrity | Daily (automated) | Security monitoring |
| Full audit verification | Weekly | Security Analyst |
| External audit sample | Quarterly | Compliance Officer |
| Complete audit review | Annually | External Auditor |

---

## 7. References

### 7.1 Related Documents

- [AUDIT-LOG-GUIDE.md](AUDIT-LOG-GUIDE.md) - Detailed audit logging operations
- [RBAC-OPERATIONS-GUIDE.md](RBAC-OPERATIONS-GUIDE.md) - Role-based access control
- [TOKEN-MANAGEMENT-GUIDE.md](TOKEN-MANAGEMENT-GUIDE.md) - Token lifecycle management
- [SECURITY-MAINTENANCE-CHECKLIST.md](SECURITY-MAINTENANCE-CHECKLIST.md) - Ongoing security tasks

### 7.2 Implementation Files

| Component | File Path |
|-----------|-----------|
| Evidence Integrity | `src/security/evidence-integrity.js` |
| Audit Logger | `src/security/audit/audit-logger.ts` |
| Compliance Reporter | `src/security/audit/compliance-reporter.ts` |
| Artifact Signer | `src/security/supply-chain/artifact-signer.js` |
| Session Manager | `src/security/session-manager.ts` |

### 7.3 Standards Compliance

This document supports compliance with:

- SOC 2 Type II (CC6.1, CC7.2, CC7.3)
- ISO 27001:2022 (A.5.33, A.8.15, A.8.16)
- NIST 800-53 (AU-2, AU-3, AU-9, AU-10, AU-11)
- GDPR Article 30 (Records of processing activities)

---

## 8. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-31 | Security Team | Initial release |

---

**Document Owner:** Security Team
**Review Cycle:** Annual
**Next Review:** 2027-01-31
