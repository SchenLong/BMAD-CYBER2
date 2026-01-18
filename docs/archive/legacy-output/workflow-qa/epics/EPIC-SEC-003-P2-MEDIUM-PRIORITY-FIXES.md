# Epic: P2 Medium Priority Security Fixes

**Epic ID**: EPIC-SEC-003
**Priority**: P2 - MEDIUM
**Timeline**: Days 31-90
**Status**: Pending (Blocked by EPIC-SEC-002)

---

## Epic Summary

Address five medium-priority security improvements focused on defense hardening, compliance documentation, and operational security. These enhance security posture but do not represent immediate exploitation risks.

## Business Value

- **Compliance**: NIST PR.DS-1 (data at rest), NIST RS.RP-1 (response planning)
- **Forensics**: Log immutability for incident investigation
- **Operational Readiness**: Documented response procedures
- **Defense Depth**: Comprehensive threat modeling

## Success Criteria

- [ ] Audit logs encrypted at rest
- [ ] STRIDE threat model documented
- [ ] Log archival to external storage operational
- [ ] 5 IR playbooks complete
- [ ] All P2 improvements deployed

## Dependencies

- **EPIC-SEC-002** should be completed
- S3 bucket for log archival
- GPG key for optional log signing

## Team Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Developer | Amelia | Encryption, archival implementation |
| Security Architect | Bastion | STRIDE threat model creation |
| Incident Commander | Phoenix | IR playbook development |
| Compliance Review | Sentinel | NIST/ISO verification |

---

## Stories

### Story SEC-003-1: Audit Log Encryption at Rest

**Priority**: P2
**Estimated Effort**: 4 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want audit logs encrypted at rest so that sensitive security event data is protected if the filesystem is compromised.

#### Acceptance Criteria
- [ ] AES-256-GCM encryption for all audit log entries
- [ ] Encryption key via `BMAD_AUDIT_ENCRYPTION_KEY` environment variable
- [ ] Graceful fallback to plaintext if key not configured
- [ ] IV and auth tag stored with each encrypted entry
- [ ] Decryption utility function available for authorized access
- [ ] Format: `ENC:<iv>:<authTag>:<ciphertext>`

#### Technical Details
- **File**: `.claude/validators-node/src/observability/audit-logger.ts`
- **Algorithm**: `aes-256-gcm`
- **Key**: 32-byte hex string from environment
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P2-1

#### Definition of Done
- [ ] Encryption wrapper implemented
- [ ] Decryption utility tested
- [ ] Fallback to plaintext works
- [ ] Code reviewed by Bastion
- [ ] Merged to branch

---

### Story SEC-003-2: STRIDE Threat Model Document

**Priority**: P2
**Estimated Effort**: 8 hours
**Assigned To**: Bastion (Security Architect)

#### User Story
As a security team member, I want a formal STRIDE threat model for the validator system so that we have documented analysis of all threat categories and mitigations.

#### Acceptance Criteria
- [ ] System overview with trust boundaries diagram
- [ ] STRIDE analysis for each validator category
- [ ] Attack trees for 5 high-risk scenarios
- [ ] Risk register with severity and status
- [ ] Residual risk documentation with acceptance criteria
- [ ] Alignment with NIST ID.RA-2 and ISO 27001 A.12.6.1

#### Deliverable
**Output File**: `_bmad-output/security/THREAT-MODEL.md`

#### Structure
1. Executive Summary
2. System Architecture & Trust Boundaries
3. STRIDE Analysis by Validator
4. Attack Trees (Detailed)
5. Risk Register
6. Mitigation Status Matrix
7. Residual Risk Acceptance

#### Definition of Done
- [ ] Document complete and peer-reviewed
- [ ] Reviewed by Cipher and Sentinel
- [ ] Stored in security output folder
- [ ] Linked from main security documentation

---

### Story SEC-003-3: Log Archival to External Storage

**Priority**: P2
**Estimated Effort**: 6 hours
**Assigned To**: Amelia

#### User Story
As a security operations team member, I want daily log archival to S3 with immutable writes so that logs cannot be tampered with and are preserved for forensic analysis.

#### Acceptance Criteria
- [ ] Daily archive job for all .log and .jsonl files
- [ ] SHA-256 hash included in archive filename
- [ ] S3 Object Lock (GOVERNANCE mode) for immutability
- [ ] Configurable retention period
- [ ] Optional GPG signing of archives
- [ ] Archive manifest with file list and hashes

#### Technical Details
- **New File**: `.claude/validators-node/src/observability/log-archiver.ts`
- **Configuration**:
  - `s3_bucket`: Target bucket
  - `s3_prefix`: Path prefix
  - `retention_days`: Log retention
  - `gpg_sign`: Boolean for optional signing
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P2-3

#### Definition of Done
- [ ] Archival module implemented
- [ ] S3 integration tested (or mocked)
- [ ] Manifest generation working
- [ ] Code reviewed
- [ ] Merged to branch

---

### Story SEC-003-4: Incident Response Playbooks

**Priority**: P2
**Estimated Effort**: 6 hours
**Assigned To**: Phoenix (Incident Commander)

#### User Story
As an incident responder, I want documented playbooks for security events so that response is consistent and effective regardless of who is on-call.

#### Acceptance Criteria
- [ ] 5 playbooks covering major incident types
- [ ] Each playbook includes: detection, triage, containment, eradication, recovery, post-incident
- [ ] Severity classification criteria
- [ ] Communication templates
- [ ] Escalation paths
- [ ] NIST RS.RP-1 and ISO 27001 A.16 alignment

#### Deliverable
**Output File**: `_bmad-output/security/IR-PLAYBOOKS.md`

#### Playbooks
1. **Tamper Detection Response** - Hash chain mismatch, file modification
2. **High-Risk Anomaly Investigation** - z-score alerts, unusual patterns
3. **Permission Violation Escalation** - Override abuse, bypass attempts
4. **Rate Limit Abuse Response** - Sustained attack patterns
5. **Supply Chain Compromise Response** - Dependency vulnerabilities

#### Definition of Done
- [ ] All 5 playbooks documented
- [ ] Reviewed by Bastion and Sentinel
- [ ] Communication templates tested
- [ ] Stored in security output folder

---

### Story SEC-003-5: P2 Integration Testing & Validation

**Priority**: P2
**Estimated Effort**: 4 hours
**Assigned To**: Murat

#### User Story
As the test architect, I want validation of all P2 security improvements so that we confirm encryption, archival, and documentation are complete.

#### Acceptance Criteria
- [ ] Encryption/decryption round-trip tests
- [ ] Archive verification (mock S3 or local)
- [ ] Threat model completeness review
- [ ] Playbook walkthrough exercise
- [ ] Compliance checklist verification

#### Definition of Done
- [ ] All P2 validations passing
- [ ] Sentinel compliance review complete
- [ ] Documentation indexed
- [ ] Ready for production deployment

---

## Metrics

- **Encryption Coverage**: 100% of audit logs
- **Threat Coverage**: All validators analyzed in STRIDE model
- **Playbook Completeness**: 5/5 incident types documented
- **Log Retention**: Configurable, default 90 days

---

*Epic created by Abdul (Master Project Manager)*
*Date: 2026-01-18*
