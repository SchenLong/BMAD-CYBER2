# BMAD Security Documentation

**Last Updated:** 2026-01-16
**Status:** Phase 4 Complete - Production Ready
**Version:** 2.0

---

## Overview

This directory contains documentation for the BMAD security guardrail system. The security implementation follows a prioritized approach based on the security audit findings.

## Security Implementation Status

| Priority | Component | Status | Documentation |
|----------|-----------|--------|---------------|
| P1 | TOCTOU Race Condition Fix | ✅ Complete | [P1-TOCTOU-Token-Validation.md](P1-TOCTOU-Token-Validation.md) |
| P1 | Token Validation System | ✅ Complete | [P1-TOCTOU-Token-Validation.md](P1-TOCTOU-Token-Validation.md) |
| P2 | Command Substitution Blocking | ✅ Complete | [P2-Command-Substitution-Input-Validation.md](P2-Command-Substitution-Input-Validation.md) |
| P2 | Shell Input Validation | ✅ Complete | [P2-Command-Substitution-Input-Validation.md](P2-Command-Substitution-Input-Validation.md) |
| P3 | Jailbreak Detection Enhancement | ✅ Complete | [P3-Jailbreak-Detection-Enhancements.md](P3-Jailbreak-Detection-Enhancements.md) |
| P4.1 | OWASP LLM04 (DoS) Mitigations | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md) |
| P4.1 | OWASP LLM05 (Supply Chain) | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md) |
| P4.1 | OWASP LLM07 (Plugin Security) | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md) |
| P4.1 | OWASP LLM09 (Overreliance) | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md) |
| P4.2 | Audit Integrity (Hash Chain) | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md#8-audit-integrity-audit_integritypy) |
| P4.2 | Telemetry Collector | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md#9-telemetry-collector-telemetry_collectorpy) |
| P4.2 | Anomaly Detector | ✅ Complete | [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md#10-anomaly-detector-anomaly_detectorpy) |

### OWASP Score: 95/100 (Grade: A+)

---

## Quick Start

### 1. Token Authentication

Generate and set a token before starting Claude Code:

```bash
# Generate token (valid for 168 hours)
node _bmad/core/security/quick-token.js "YourName" "developer" 168

# Set token
export BMAD_AUTH_TOKEN="<generated-token>"

# Start Claude Code
claude
```

### 2. Understanding Blocks

When a security guardrail blocks an operation, you'll see a message like:

```
============================================================
BMAD GUARDRAIL: [BLOCK TYPE]
============================================================
[Details of why the operation was blocked]

To override (single-use):
  export BMAD_ALLOW_[TYPE]=true
============================================================
```

### 3. Override Tokens

Override tokens are:
- **Single-use**: Consumed after one operation
- **Time-limited**: Expire after 5 minutes
- **Logged**: All uses are recorded in security.log

---

## Document Index

### Implementation Guides

| Document | Description |
|----------|-------------|
| [P1-TOCTOU-Token-Validation.md](P1-TOCTOU-Token-Validation.md) | TOCTOU fix and token validation details |
| [P2-Command-Substitution-Input-Validation.md](P2-Command-Substitution-Input-Validation.md) | Command substitution and input validation |
| [P3-Jailbreak-Detection-Enhancements.md](P3-Jailbreak-Detection-Enhancements.md) | Enhanced jailbreak detection system |
| [P4-OWASP-Remediation.md](P4-OWASP-Remediation.md) | OWASP AI security compliance (8 new validators) |

### Related Documents

| Document | Location | Description |
|----------|----------|-------------|
| Security Audit Report | `docs/Planification/security-audits/` | Original audit findings |
| Mitigation Plan | `docs/Planification/security-audits/BMAD-Security-Mitigation-Plan.md` | Detailed fix plans |
| Test Results | `Docs/testing/` | Test execution logs |
| OWASP Checklist | `_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md` | Security compliance tracking |
| OWASP Remediation Plan | `_bmad/core/security/OWASP-REMEDIATION-PLAN.md` | Phase-by-phase implementation |

---

## Security Components

### Core Validators (`.claude/validators-node/bin/`)

| File | Purpose |
|------|---------|
| `security-common.js` | Shared utilities, override manager, audit logger |
| `token-validator.js` | Token authentication and RBAC |
| `outside-repo.js` | Path validation and command substitution blocking |
| `jailbreak.js` | Jailbreak pattern detection |

### Phase 4.1 - OWASP Remediation Validators

| File | Purpose | OWASP |
|------|---------|-------|
| `rate-limiter.js` | DoS protection with sliding window | LLM04 |
| `plugin-permissions.js` | Capability-based plugin security | LLM07 |
| `supply-chain.js` | Plugin/skill integrity verification | LLM05 |
| `context-manager.js` | Context window protection | LLM04 |
| `recursion-guard.js` | Infinite loop prevention | LLM04 |
| `resource-limits.js` | Memory/process/file limits | LLM04 |
| `confidence-tracker.js` | AI overreliance mitigation | LLM09 |

### Phase 4.2 - Long-Term Security Controls (NEW)

| File | Purpose | Category |
|------|---------|----------|
| `audit-integrity.js` | Cryptographic hash chain for logs | Audit & Accountability |
| `telemetry.js` | Security event telemetry & SIEM | Monitoring & Alerting |
| `anomaly-detector.js` | Statistical anomaly detection | Threat Detection |

**Total Validators: 21** (11 core + 7 OWASP + 3 Long-Term)

### Hooks (`.claude/hooks/`)

| File | Purpose |
|------|---------|
| `lib/input-validation.sh` | Shell input validation library |
| `bmad-speak.sh` | TTS with input validation |
| `tts-queue.sh` | TTS queue with validation |

### Configuration

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Hook configuration |
| `_bmad/core/security/rbac-config.yaml` | RBAC role definitions |

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                             │
├─────────────────────────────────────────────────────────────┤
│  Hooks Layer                                                 │
│  ├── SessionStart → token-validator.js                       │
│  ├── PreToolUse → outside-repo.js, jailbreak.js             │
│  └── UserPromptSubmit → jailbreak.js                         │
├─────────────────────────────────────────────────────────────┤
│  Shared Security Layer                                       │
│  ├── AuditLogger (all operations logged)                     │
│  ├── OverrideManager (atomic, single-use tokens)             │
│  └── RBAC (role-based access control)                        │
├─────────────────────────────────────────────────────────────┤
│  Detection Layers                                            │
│  ├── Path Validation (inside repo check)                     │
│  ├── Command Analysis (substitution detection)               │
│  ├── Input Validation (injection prevention)                 │
│  └── Jailbreak Detection (multi-layer)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing

### Run All Security Tests

```bash
# P1 tests
bash tests/run_all_p1_tests.sh

# P2 tests
bash tests/test-shell-injection.sh
python3 -c "..." # Command substitution tests

# P3 tests
python3 tests/test_jailbreak_detection.py

# Full regression
python3 tests/test_security_regression.py

# Performance
python3 tests/test_performance.py
```

### Test Results Location

- `Docs/testing/` - Security test results and execution logs
- See `Docs/05-project-management/planning/security-audits/` for audit reports

---

## Audit Logs

Security events are logged to:

- `.claude/logs/security.log` - Primary security log
- `docs/ValidationLog/Audit Logs/audit.log` - Validation audit log

Log format:
```json
{
  "timestamp": "2026-01-16T12:00:00Z",
  "validator": "outside_repo_guard",
  "action": "BLOCKED",
  "details": {...},
  "severity": "WARNING"
}
```

---

## Environment Variables Reference

### Authentication & Authorization

| Variable | Description | Default |
|----------|-------------|---------|
| `BMAD_AUTH_TOKEN` | Authentication token | None |
| `BMAD_TOKEN_REQUIRED` | Enable token enforcement | `true` |

### Override Flags (Single-Use)

| Variable | Description | Default |
|----------|-------------|---------|
| `BMAD_ALLOW_OUTSIDE_REPO` | Allow path outside repo | `false` |
| `BMAD_ALLOW_COMMAND_SUBSTITUTION` | Allow command substitution | `false` |
| `BMAD_ALLOW_JAILBREAK` | Allow jailbreak patterns | `false` |

### Phase 4.1 - OWASP Validators

| Variable | Description | Default |
|----------|-------------|---------|
| `BMAD_RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `BMAD_MAX_MEMORY_MB` | Memory limit for operations | `4096` (4GB) |
| `BMAD_MAX_PROCESSES` | Process limit | `50` |
| `BMAD_MAX_FILE_SIZE_MB` | Max file size for writes | `100` |
| `BMAD_SHOW_CONFIDENCE` | Display confidence scores | `true` |
| `BMAD_VERIFY_SUPPLY_CHAIN` | Enable supply chain checks | `true` |

### Rate Limits (LLM04)

| Operation | Limit (per minute) |
|-----------|-------------------|
| Bash | 60 |
| Write/Edit | 100 |
| Read | 400 |
| Task | 40 |
| Global | 150 |
| Glob/Grep | 200 |
| WebFetch | 30 |
| WebSearch | 20 |

### Phase 4.2 - Long-Term Controls

| Variable | Description | Default |
|----------|-------------|---------|
| `BMAD_AUDIT_SIGNING` | Enable hash chain signing | `true` |
| `BMAD_AUDIT_GPG_KEY` | GPG key ID for file signing | - |
| `BMAD_AUDIT_ALERT_TAMPERING` | Alert on tampering detection | `true` |
| `BMAD_TELEMETRY_ENABLED` | Enable telemetry collection | `true` |
| `BMAD_TELEMETRY_ROTATE_MB` | File rotation size (MB) | `50` |
| `BMAD_ANOMALY_DETECTION` | Enable anomaly detection | `true` |
| `BMAD_ANOMALY_THRESHOLD_STD` | Std dev threshold | `3.0` |
| `BMAD_ANOMALY_ALERT_LEVEL` | Minimum alert level | `WARNING` |

---

## Support

For security issues or questions:

1. Check the relevant documentation above
2. Review the audit logs for details
3. Consult the mitigation plan for known issues
4. File a security issue if needed

---

**Maintained by:** Security Implementation Team
**Version:** 2.0
**Phase 4.2 Complete:** 2026-01-16
