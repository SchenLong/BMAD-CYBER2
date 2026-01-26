# BMAD Security Remediation Roadmap

**Project:** BMAD-Security-Review
**Date:** 2026-01-15
**Version:** 5.0 (Phase 1 Complete - Authentication Implemented)

---

## Executive Summary

This roadmap prioritizes security implementations based on:
1. **Immediate impact** - Quick wins that improve security today
2. **User experience** - Minimize friction while maximizing protection
3. **Dependencies** - Logical ordering based on technical requirements

### Implementation Status

| Priority | Solution | Effort | User Impact | Status |
|----------|----------|--------|-------------|--------|
| Phase 1 | 1.3 YOLO Restrictions | 1 day | Zero friction | ✅ **COMPLETE** |
| Phase 1 | 2.2 Audit Logging | 1 day | Zero friction | ✅ **COMPLETE** |
| Phase 1 | 1.1 File Integrity | 1 day | Zero friction | ✅ **COMPLETE** |
| Phase 1 | 1.2 Authentication | 1 day | One-time setup | ✅ **COMPLETE** |
| Phase 2 | 2.1 RBAC | 2 weeks | Medium friction | ⏳ Next |

### Phase Completion

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 1** | ✅ **COMPLETE** | 2026-01-15 |
| **Phase 2** | ⏳ Not Started | - |
| **Phase 3** | ⏳ Not Started | - |
| **Phase 4** | ⏳ Not Started | - |

---

## Completed Implementations

### 1.3 YOLO Mode Restrictions - IMPLEMENTED

**Date Implemented:** 2026-01-13

**Files Modified:**
| File | Changes |
|------|---------|
| `_bmad/core/config.yaml` | Added `security.yolo_mode` configuration section |
| `_bmad/core/tasks/workflow.xml` | Added YOLO restriction security directive |

**Configuration Added:**
```yaml
security:
  yolo_mode:
    enabled: false           # Disabled by default
    require_explicit_flag: true
    log_invocations: true
    allowed_workflows: []    # None allowed by default
    show_warning_banner: true
```

**Security Controls:**
- YOLO mode disabled by default (master switch)
- Explicit acknowledgment required even if enabled
- Workflow allowlist restricts which workflows can use YOLO
- All YOLO attempts logged (blocked or allowed)
- Clear user messages explain restrictions

---

### 2.2 Audit Logging System - IMPLEMENTED

**Date Implemented:** 2026-01-13

**Files Modified:**
| File | Changes |
|------|---------|
| `_bmad/core/config.yaml` | Added `security.audit` configuration section |
| `_bmad/core/tasks/workflow.xml` | Added audit-logging security directive |
| `_bmad-output/.audit/` | Created audit log directory |

**Configuration Added:**
```yaml
security:
  audit:
    enabled: true
    log_file: "{project-root}/_bmad-output/.audit/audit.log"
    hash_chain_enabled: true
    events:
      workflow_start: true
      workflow_complete: true
      workflow_error: true
      yolo_invoked: true      # Always logged
      yolo_blocked: true      # Always logged
      agent_activation: true
      agent_tool_use: true
      file_write: true
      file_delete: true
      security_warning: true
      security_violation: true
    retention_days: 90
    format: json
```

**Security Controls:**
- Tamper-evident hash chain (SHA-256)
- JSON format for machine parsing
- Configurable event types
- 90-day retention default
- Automatic directory creation

---

### 1.1 File Integrity Verification - IMPLEMENTED

**Date Implemented:** 2026-01-15

**Files Created:**
| File | Purpose |
|------|---------|
| `_bmad/core/security/bmad-public-key.asc` | GPG public key for verification |
| `_bmad/core/security/bmad-private-key.asc` | GPG private key for signing (gitignored) |
| `_bmad/core/security/sign-manifest.sh` | Generate and sign manifest |
| `_bmad/core/security/verify-integrity.sh` | Verify manifest and file hashes |
| `_bmad/core/security/MANIFEST.sha256` | SHA-256 hashes of 679 critical files |
| `_bmad/core/security/MANIFEST.sha256.asc` | GPG signature of manifest |
| `_bmad/core/security/KEY-INFO.md` | Key documentation |
| `docs/Features/Security-File-Integrity.md` | User documentation |

**Security Controls:**
- Manifest-based approach (single signed file lists all hashes)
- RSA-4096 GPG key for cryptographic signing
- SHA-256 hashes for each critical file
- 679 files protected (agents, workflows, configs, hooks)
- Clear tamper detection with actionable error messages
- Exit codes for CI/CD integration

**GPG Key Details:**
- Key ID: `5528FA32356DA698`
- Algorithm: RSA-4096
- Expires: 2028-01-15
- User ID: `BMAD Framework <bmad-signing@internal>`

**Usage:**
```bash
# Verify integrity (run before sessions)
./_bmad/core/security/verify-integrity.sh

# Re-sign after legitimate changes
./_bmad/core/security/sign-manifest.sh
```

---

### 1.2 Authentication System - IMPLEMENTED

**Date Implemented:** 2026-01-15

**Files Created:**
| File | Purpose |
|------|---------|
| `_bmad/core/security/auth-config.yaml` | Authentication configuration |
| `_bmad/core/security/generate-token.js` | Interactive token generator |
| `_bmad/core/security/quick-token.js` | Non-interactive token generator |
| `_bmad/core/security/validate-token.js` | 12-point validation test suite |
| `_bmad/core/security/session-manager.ts` | Session management module |
| `docs/Features/Security-Authentication.md` | User documentation |

**Security Controls:**
- AES-256-GCM encrypted tokens (no external dependencies)
- Token format: `bmad.v1.<base64url-encoded-encrypted-payload>`
- 8 predefined roles with module access mappings
- 7-day token validity with 24-hour expiration warnings
- 8-hour session timeout with activity refresh
- File permissions enforced (0600 for .bmad-key, .bmad-token)

**Available Roles:**
| Role | Default Modules |
|------|-----------------|
| admin | * (all) |
| security_lead | cybersec-team, intel-team, core |
| security_analyst | cybersec-team, core |
| intel_analyst | intel-team, core |
| developer | bmm, bmgd, bmb, cis, core |
| product_manager | bmm, cis, core |
| viewer | core |
| guest | core |

**Usage:**
```bash
# Generate token (non-interactive)
node _bmad/core/security/quick-token.js "YourName" "admin" 168

# Generate token (interactive)
node _bmad/core/security/generate-token.js

# Validate token
node _bmad/core/security/validate-token.js
```

**Validation Tests (12 checks):**
- Key exists, permissions, size
- Token exists, permissions, format
- Decryption success
- Required claims present
- Not expired, issued date valid
- Roles valid, UUID format valid

---

## Future Implementation Phases

### Phase 2: Access Control & Audit (Next)

#### 2.1 Role-Based Access Control (RBAC)

**Solution Reference:** Phase2-Detailed-Implementation-Guide.md, Section 2

**Why Next:**
- Authentication infrastructure now complete
- Roles already defined in tokens
- Need enforcement layer to gate access

**Estimated Effort:** 2 weeks

**Key Deliverables:**
- RBAC configuration with permission mappings
- Authorization module with permission checking
- Role hierarchy with inheritance
- Integration in all agents and workflows
- Clear access denied messages

---

## Detailed Documentation

### Available Guides

| Document | Contents |
|----------|----------|
| [BMAD-Security-Audit-Report.md](BMAD-Security-Audit-Report.md) | Full security assessment with findings |
| [BMAD-Security-Implementation-Plan.md](BMAD-Security-Implementation-Plan.md) | Original 12-week implementation plan |
| [Phase1-Detailed-Implementation-Guide.md](Phase1-Detailed-Implementation-Guide.md) | File Integrity, Authentication, YOLO |
| [Phase2-Detailed-Implementation-Guide.md](Phase2-Detailed-Implementation-Guide.md) | RBAC, Audit Logging |
| [NEXT-IMPLEMENTATION-1.3-YOLO-Restrictions.md](NEXT-IMPLEMENTATION-1.3-YOLO-Restrictions.md) | YOLO implementation details (now complete) |

---

## Risk Assessment

### Current State (After Phase 1 Complete)

| Risk | Likelihood | Impact | Status |
|------|------------|--------|--------|
| YOLO mode bypass | Low | High | ✅ **MITIGATED** |
| No audit trail | Low | Medium | ✅ **MITIGATED** |
| File tampering | Low | Critical | ✅ **MITIGATED** |
| No authentication | Low | High | ✅ **MITIGATED** |
| No access control | Medium | High | ⏳ Future (RBAC) |

### Risk Reduction Summary

| Before | After Phase 1 | Change |
|--------|---------------|--------|
| 3 Critical risks | 0 Critical risks | -100% |
| 3 High risks | 1 High risk | -67% |
| 6 Total active | 1 Total active | -83% |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-13 | Implement 1.3 YOLO + 2.2 Audit first | Zero friction, immediate security value |
| 2026-01-13 | Defer 1.2 Auth to future | Requires user workflow changes |
| 2026-01-13 | Defer 2.1 RBAC to future | Depends on authentication |
| 2026-01-15 | Implement 1.1 File Integrity | Manifest-based approach, GPG signing |
| 2026-01-15 | Use manifest instead of individual .asc files | Cleaner repo, single signature file |
| 2026-01-15 | Implement 1.2 Authentication | AES-256-GCM instead of PASETO for simplicity |
| 2026-01-15 | Use Node.js for token utilities | No external dependencies, works anywhere |
| 2026-01-15 | 8 predefined roles | Covers all module access patterns |
| 2026-01-15 | 7-day token validity | Balance security with user convenience |

---

## How to Enable YOLO for Specific Workflows

If needed, administrators can enable YOLO for specific workflows:

```yaml
# In _bmad/core/config.yaml
security:
  yolo_mode:
    enabled: true              # Enable YOLO system
    require_explicit_flag: true
    allowed_workflows:
      - "create-story"         # Allow YOLO for story creation
      - "sprint-planning"      # Allow YOLO for sprint planning
      - "quick-dev"            # Allow YOLO for quick development
```

**Warning:** Only add trusted, low-risk workflows to the allowlist.

---

## How to View Audit Logs

Audit logs are stored in `_bmad-output/.audit/audit.log` in JSON format.

```bash
# View recent logs
tail -50 _bmad-output/.audit/audit.log

# Search for YOLO events
grep "yolo" _bmad-output/.audit/audit.log

# Verify hash chain integrity (future feature)
# bmad audit-verify
```

---

## How to Verify File Integrity

Run before each session to ensure framework files haven't been tampered with:

```bash
# Full verification
./_bmad/core/security/verify-integrity.sh

# Quiet mode (CI/CD)
./_bmad/core/security/verify-integrity.sh --quiet
```

After making legitimate changes to agents/workflows/configs:

```bash
./_bmad/core/security/sign-manifest.sh
```

---

## How to Generate Authentication Token

```bash
# Quick setup (non-interactive)
node _bmad/core/security/quick-token.js "YourName" "admin" 168

# Validate your token
node _bmad/core/security/validate-token.js
```

---

*Roadmap maintained by: Bastion (Security Architect)*
*Last updated: 2026-01-15*
*Status: Phase 1 Complete (4/4 implementations)*
