# Documentation Update Plan: Python → Node.js Validator Migration

**Project:** Workflow-QA
**Created:** 2026-01-17
**Status:** Ready for Execution

---

## Executive Summary

The validator system has been migrated from Python (`.claude/validators/*.py`) to Node.js (`.claude/validators-node/`). This plan identifies **all documentation files** requiring updates to reflect this migration, organized by priority and update type.

---

## Migration Mapping Reference

### File Name Changes

| Old Python File | New Node.js File |
|----------------|-----------------|
| `bash_safety.py` | `bin/bash-safety.js` |
| `secret_guard.py` | `bin/secret.js` |
| `env_protection.py` | `bin/env-protection.js` |
| `production_guard.py` | `bin/production.js` |
| `outside_repo_guard.py` | `bin/outside-repo.js` |
| `pii_guard.py` | `bin/pii.js` |
| `prompt_injection_guard.py` | `bin/prompt-injection.js` |
| `jailbreak_guard.py` | `bin/jailbreak.js` |
| `session-security-init.py` | `hooks/session-security-init.ts` (converted) |
| `add-provider-awareness.py` | `scripts/add-provider-awareness.ts` (converted) |
| `token_validator.py` | `bin/token-validator.js` |
| `rate_limiter.py` | `bin/rate-limiter.js` |
| `plugin_permissions.py` | `bin/plugin-permissions.js` |
| `supply_chain_verifier.py` | `bin/supply-chain.js` |
| `context_manager.py` | `bin/context-manager.js` |
| `recursion_guard.py` | `bin/recursion-guard.js` |
| `resource_limits.py` | `bin/resource-limits.js` |
| `confidence_tracker.py` | `bin/confidence-tracker.js` |
| `telemetry_collector.py` | `bin/telemetry.js` |
| `anomaly_detector.py` | `bin/anomaly-detector.js` |
| `audit_integrity.py` | `bin/audit-integrity.js` |
| `security_common.py` | (TypeScript library in `src/`) |

### Path Changes

| Description | Old | New |
|-------------|-----|-----|
| Validator directory | `.claude/validators/` | `.claude/validators-node/bin/` |
| Hook interpreter | `python3` | `node` |
| Common utilities | `security_common.py` | TypeScript modules in `src/` |

---

## Priority 1: Critical Documentation (Must Update)

These files directly describe the validator system and will be misleading if not updated.

### 1.1 README.md
**Location:** `/README.md`
**Lines:** 1208-1220
**Update Type:** Replace validator file list

**Current Content (WRONG):**
```markdown
- **NEW:** `bash_safety.py` - Dangerous bash command detection
- **NEW:** `secret_guard.py` - Hardcoded secret detection
- **NEW:** `env_protection.py` - Sensitive file protection
- **NEW:** `production_guard.py` - Production environment targeting detection
- **NEW:** `outside_repo_guard.py` - Repository boundary enforcement
- **NEW:** `pii_guard.py` - PII detection
- **NEW:** `prompt_injection_guard.py` - Prompt injection defense
- **NEW:** `jailbreak_guard.py` - Jailbreak attempt detection
- **NEW:** `session-security-init.ts` - Session startup security validation
```

**Replacement:**
```markdown
- `bash-safety.js` - Dangerous bash command detection with absolute blocking
- `secret.js` - Hardcoded secret detection (AWS, GitHub, OpenAI, Anthropic, etc.)
- `env-protection.js` - Sensitive file protection (.env, credentials, SSH keys)
- `production.js` - Production environment targeting detection
- `outside-repo.js` - Repository boundary enforcement
- `pii.js` - PII detection (SSN, credit cards, IBAN, EU national IDs)
- `prompt-injection.js` - Prompt injection defense with encoded payload detection
- `jailbreak.js` - Jailbreak attempt detection with session-level tracking
- `token-validator.js` - Authentication and session startup validation
- `rate-limiter.js` - DoS protection with sliding window rate limiting
- `plugin-permissions.js` - Capability-based security for plugins
- `supply-chain.js` - SHA256+GPG integrity verification
- `context-manager.js` - Context window management
- `recursion-guard.js` - Recursion and depth limits
- `resource-limits.js` - Memory and process limits
- `confidence-tracker.js` - Uncertainty detection
- `telemetry.js` - SIEM telemetry export
- `anomaly-detector.js` - Behavioral anomaly detection
- `audit-integrity.js` - Audit log integrity verification
```

---

### 1.2 HOOKS-VALIDATORS-GUIDE.md
**Location:** `docs/Features/HOOKS-VALIDATORS-GUIDE.md`
**Update Type:** Full rewrite of validator registry and examples

**Changes Required:**
1. Line 16: Change "Python scripts" → "Node.js scripts"
2. Lines 59-61: Update validator location from `.claude/validators/` → `.claude/validators-node/bin/`
3. Lines 67-93: Update entire validator registry table (all `.py` → `.js`)
4. All code examples: Update from Python to Node.js
5. Update architecture diagram if showing Python interpreter

---

### 1.3 HOOKS-CONFIGURATION-REFERENCE.md
**Location:** `docs/Features/Security/HOOKS-CONFIGURATION-REFERENCE.md`
**Update Type:** Replace all validator file references

**Changes Required:**
1. Lines 30-32: Update SessionStart hooks table (`.py` → `.js`)
2. Lines 40-41: Update UserPromptSubmit hooks table
3. Lines 47-100: Update all PreToolUse hooks tables (every `.py` → `.js`)
4. Add note about Node.js runtime requirement

---

## Priority 2: Security Documentation

Files that discuss security validators in context of security features.

### 2.1 Files Requiring Updates (26 files)

| File | Type of Update |
|------|----------------|
| `docs/Features/Security/Rate-Limiting.md` | Update `rate_limiter.py` → `rate-limiter.js` |
| `docs/Features/Security/AgenticSecurity.md` | Update validator references |
| `docs/Features/Security/HooksGuardrails.md` | Update all validator references |
| `docs/Features/Security/Plugin-Permissions.md` | Update `plugin_permissions.py` → `plugin-permissions.js` |
| `docs/Features/Security/Security-File-Integrity.md` | Update validator references |
| `docs/Features/Security/Security-Authentication.md` | Update `token_validator.py` → `token-validator.js` |
| `docs/Features/Security/Security-RBAC.md` | Update authorization references |
| `docs/UserGuide/Security/README.md` | Update security overview |
| `docs/UserGuide/Security/SECURITY-MAINTENANCE-CHECKLIST.md` | Update maintenance steps |
| `docs/UserGuide/Security/AUDIT-LOG-GUIDE.md` | Update audit references |
| `docs/UserGuide/Security/TOKEN-MANAGEMENT-GUIDE.md` | Update token validator references |
| `docs/UserGuide/Security/RBAC-OPERATIONS-GUIDE.md` | Update RBAC references |
| `docs/UserGuide/Security/P1-TOCTOU-Token-Validation.md` | Update token validator |
| `docs/UserGuide/Security/P2-Command-Substitution-Input-Validation.md` | Update bash safety |
| `docs/UserGuide/Security/P3-Jailbreak-Detection-Enhancements.md` | Update jailbreak guard |
| `docs/UserGuide/Security/P4-OWASP-Remediation.md` | Update all OWASP validators |
| `docs/UserGuide/SECURITY-OVERVIEW.md` | Update validator references |

---

## Priority 3: User Guide Documentation

Files that users interact with during setup and operations.

### 3.1 Setup & Configuration (10 files)

| File | Type of Update |
|------|----------------|
| `docs/UserGuide/GETTING-STARTED.md` | Update setup instructions |
| `docs/UserGuide/CONFIGURATION-GUIDE.md` | Update hook configuration examples |
| `docs/UserGuide/CLI-COMMAND-REFERENCE.md` | Update if CLI references validators |
| `docs/UserGuide/TROUBLESHOOTING.md` | Update troubleshooting for Node.js validators |
| `docs/UserGuide/ModuleSetup/BMM-SETUP.md` | Update setup references |
| `docs/UserGuide/ModuleSetup/STRATEGY-TEAM-SETUP.md` | Update setup references |
| `docs/UserGuide/ModuleSetup/LEGAL-TEAM-SETUP.md` | Update setup references |
| `docs/UserGuide/ModuleSetup/INTEL-TEAM-SETUP.md` | Update setup references |
| `docs/UserGuide/ModuleSetup/CYBERSEC-TEAM-SETUP.md` | Update setup references |
| `docs/UserGuide/GLOSSARY.md` | Update terminology if validator-related |

### 3.2 Operations (5 files)

| File | Type of Update |
|------|----------------|
| `docs/UserGuide/Operations/PERFORMANCE-TUNING.md` | Update performance references |
| `docs/UserGuide/Operations/INCIDENT-RESPONSE-RUNBOOK.md` | Update incident handling |
| `docs/UserGuide/Operations/OPERATIONAL-RUNBOOKS.md` | Update runbook references |
| `docs/UserGuide/Integration/INTEGRATION-GUIDE.md` | Update integration details |
| `docs/UserGuide/DATA-EXPORT-GUIDE.md` | Update if referencing telemetry |

---

## Priority 4: Developer Documentation

Technical documentation for contributors.

### 4.1 Developer Files (4 files)

| File | Type of Update |
|------|----------------|
| `docs/Developer/ARCHITECTURE-DEEP-DIVE.md` | Update architecture diagrams |
| `docs/Developer/CONTRIBUTING-GUIDE.md` | Update contribution instructions |
| `docs/Developer/TESTING-FRAMEWORK.md` | Update testing references |
| `docs/Features/PLUGIN-MANIFEST-SCHEMA.md` | Update schema references |

---

## Priority 5: Testing & Validation Logs

Historical documentation - add notes but preserve history.

### 5.1 Testing Logs (18 files)

These should be marked as historical with a note about the migration:

```markdown
> **Note:** This document references the Python-based validators (`.py`).
> As of 2026-01-17, validators have been migrated to Node.js (`.js`).
> See `.claude/validators-node/` for current implementation.
```

**Files:**
- `docs/TestingLogs/README.md`
- `docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/*.md` (8 files)
- `docs/TestingLogs/security/2026-01-16/*.md` (2 files)
- `docs/TestingLogs/security/P1-TOCTOU-Token/*.md` (2 files)
- `docs/TestingLogs/security/P2-CommandSubstitution-InputValidation/README.md`
- `docs/TestingLogs/security/P3-JailbreakDetection/README.md`
- `docs/ValidationLog/*.md` (3 files)

---

## Priority 6: Planification Documents

Planning documents - add migration completion notes.

### 6.1 Planning Files (6 files)

| File | Update |
|------|--------|
| `docs/Planification/security-audits/BMAD-Security-Mitigation-Plan.md` | Add completion note |
| `docs/Planification/security-audits/BMAD-Security-Audit-Report.md` | Add completion note |
| `docs/Planification/security-audits/BMAD-Security-Audit-Supplemental-Report.md` | Add completion note |
| `docs/Planification/security-audits/BMAD-Security-Implementation-Plan.md` | Mark as completed |
| `docs/Planification/security-audits/Security-Roadmap.md` | Update roadmap status |
| `docs/Planification/security-audits/Phase2-Detailed-Implementation-Guide.md` | Mark as completed |

---

## Execution Strategy

### Workstream Assignment

| Workstream | Agent | Files | Priority |
|------------|-------|-------|----------|
| **WS-1** | Agent 1 | README.md + HOOKS-VALIDATORS-GUIDE.md + HOOKS-CONFIGURATION-REFERENCE.md | P1 |
| **WS-2** | Agent 2 | `docs/Features/Security/*.md` (8 files) | P2 |
| **WS-3** | Agent 3 | `docs/UserGuide/Security/*.md` (10 files) | P2 |
| **WS-4** | Agent 4 | `docs/UserGuide/*.md` (setup & config, 10 files) | P3 |
| **WS-5** | Agent 5 | `docs/UserGuide/Operations/*.md` + `docs/UserGuide/ModuleSetup/*.md` (10 files) | P3 |
| **WS-6** | Agent 6 | `docs/Developer/*.md` (4 files) | P4 |
| **WS-7** | Agent 7 | `docs/TestingLogs/**/*.md` (add historical notes, 18 files) | P5 |
| **WS-8** | Agent 8 | `docs/Planification/**/*.md` (6 files) | P6 |

### Update Rules

1. **DO NOT** change document structure or design
2. **DO NOT** remove historical information
3. **DO** replace `.py` extensions with `.js` in validator references
4. **DO** update paths from `.claude/validators/` to `.claude/validators-node/bin/`
5. **DO** update "Python" → "Node.js" where referring to validator runtime
6. **DO** preserve markdown formatting exactly
7. **DO** add historical notes to testing logs
8. **DO** preserve all existing section headers

### Verification Checklist

After updates, verify:
- [ ] No `.py` references remain in documentation (except historical notes)
- [ ] All validator paths point to `.claude/validators-node/bin/`
- [ ] README structure unchanged
- [ ] All links still functional
- [ ] No broken code examples

---

## Files Summary

| Category | Count |
|----------|-------|
| Priority 1 (Critical) | 3 |
| Priority 2 (Security) | 17 |
| Priority 3 (User Guide) | 15 |
| Priority 4 (Developer) | 4 |
| Priority 5 (Testing Logs) | 18 |
| Priority 6 (Planning) | 6 |
| **Total Files** | **63** |

---

## Approval Required

This plan is ready for execution pending your approval. Shall I proceed with launching parallel workstreams to execute these updates?
