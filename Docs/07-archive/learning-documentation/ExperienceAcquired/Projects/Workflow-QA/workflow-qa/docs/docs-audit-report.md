# Documentation Audit Report: Validator Migration (Python to Node.js)

**Date:** 2026-01-17
**Branch:** VALIDATORS-PY-2-JS
**Auditor:** Claude Opus 4.5

---

## Executive Summary

This audit identifies documentation files in `/docs` requiring updates due to:
1. **Python to Node.js validator migration** (20 validators)
2. **Hook configuration changes** (`.claude/settings.json`)
3. **Security features documentation** updates
4. **Installation/setup instruction** revisions

### Audit Statistics

| Category | Files Found | Priority Breakdown |
|----------|-------------|-------------------|
| Validator References (Python) | 28 | P0: 8, P1: 12, P2: 8 |
| Hook Configuration References | 15 | P0: 4, P1: 7, P2: 4 |
| Security Documentation | 22 | P0: 5, P1: 10, P2: 7 |
| Installation/Setup Guides | 6 | P0: 3, P1: 2, P2: 1 |
| **Total Unique Files** | **59** | **P0: 12, P1: 22, P2: 25** |

---

## Priority Definitions

| Priority | Definition | Action Required |
|----------|------------|-----------------|
| **P0** | Critical - User-facing docs with incorrect commands | Must update before merge |
| **P1** | High - Technical docs with outdated info | Update within 1 week |
| **P2** | Medium - Historical/reference docs | Update as time permits |

---

## Files Requiring Updates

### P0 - Critical Updates Required

| # | File Path | What Needs Updating | Details |
|---|-----------|---------------------|---------|
| 1 | `/docs/Features/HOOKS-VALIDATORS-GUIDE.md` | **Python validator references throughout** | Lines 16, 61, 69-92, 446-453, 520-527, etc. Reference `python3 .claude/validators/*.py` - must change to `node .claude/validators-node/bin/*.js` |
| 2 | `/docs/Features/Security/HooksGuardrails.md` | **Python commands in hook config examples** | Lines 55-75, 104-143: All examples show `python3` commands. Must update file structure diagram and all hook configuration examples. |
| 3 | `/docs/Features/Security/HOOKS-CONFIGURATION-REFERENCE.md` | **Validator command syntax** | All hook examples reference Python validators. Update to Node.js equivalents. |
| 4 | `/docs/UserGuide/GETTING-STARTED.md` | **Security verification commands** | Line 72: `python3 -c "import sys; sys.path.insert(0, '.claude/validators')..."` - must update to Node.js equivalent |
| 5 | `/docs/UserGuide/CONFIGURATION-GUIDE.md` | **Hook configuration examples** | Lines 294-329: `.claude/hooks/bash_safety.py` references. Update to `.claude/validators-node/bin/bash-safety.js` |
| 6 | `/docs/Developer/CONTRIBUTING-GUIDE.md` | **Validator development instructions** | Lines 90, 432-498: References `.claude/validators/{validator-name}.py` pattern. Must update entire "Adding Security Validators" section for TypeScript/Node.js |
| 7 | `/docs/UserGuide/SECURITY-OVERVIEW.md` | **CLI commands for validators** | Lines 400-403, 454-457: Commands like `python3 .claude/validators/rate_limiter.py status` must change |
| 8 | `/docs/Features/PLUGIN-MANIFEST-SCHEMA.md` | **Plugin permission commands** | Lines 271-274: `python3 .claude/validators/plugin_permissions.py generate` must update |

### P1 - High Priority Updates

| # | File Path | What Needs Updating | Details |
|---|-----------|---------------------|---------|
| 9 | `/docs/Developer/ARCHITECTURE-DEEP-DIVE.md` | Validator architecture diagram and paths | Lines 446-451, 659: References to `.claude/validators/` paths and Python validator creation |
| 10 | `/docs/Developer/TESTING-FRAMEWORK.md` | Test file locations and validator testing | Lines 364, 381-392, 625: References `tests/security/validators/` with Python paths |
| 11 | `/docs/UserGuide/GLOSSARY.md` | Validator definition | Line 342: "Python script that validates operations" - update language |
| 12 | `/docs/UserGuide/Security/TOKEN-MANAGEMENT-GUIDE.md` | Token validation commands | Lines 116, 172, 301, 505: Mix of `node` and potentially outdated references |
| 13 | `/docs/UserGuide/Security/RBAC-OPERATIONS-GUIDE.md` | RBAC validation examples | Lines 83, 347, 458: Token/validator commands |
| 14 | `/docs/UserGuide/Operations/INCIDENT-RESPONSE-RUNBOOK.md` | Evidence collection commands | Lines 50, 383: Validator-related evidence commands |
| 15 | `/docs/UserGuide/Security/SECURITY-MAINTENANCE-CHECKLIST.md` | Maintenance procedures | Lines 21, 87, 190: Validator health check commands |
| 16 | `/docs/UserGuide/CLI-COMMAND-REFERENCE.md` | CLI validator commands | Line 242 and others: Validator invocation examples |
| 17 | `/docs/UserGuide/TROUBLESHOOTING.md` | Troubleshooting commands | Lines 16, 689: Validator debugging commands |
| 18 | `/docs/Planification/security-audits/BMAD-Security-Audit-Report.md` | Audit methodology references | Lines 617, 1047: References Python validators and hooks |
| 19 | `/docs/Planification/security-audits/Security-Roadmap.md` | Security implementation references | Lines 196, 349: Validator references |
| 20 | `/docs/ExperienceAcquired/LessonsLearned.md` | Historical implementation notes | Lines 2037-2263: Extensive Python validator examples (add Node.js equivalents or mark as historical) |
| 21 | `/docs/ValidationLog/documentation-validation-2026-01-13.md` | Validation accuracy notes | Line 66: Notes accuracy matching `.claude/validators/` |
| 22 | `/docs/TestingLogs/security/2026-01-16/OWASP-QA-SECURITY-ASSESSMENT.md` | OWASP test commands | Lines 503-786, 816-899, 1007-1049: Extensive Python validator test commands |
| 23 | `/docs/TestingLogs/security/P1-TOCTOU-Token/P1-TEST-RESULTS.md` | TOCTOU test results | Lines 121-124: References `.claude/validators/security_common.py` |
| 24 | `/docs/TestingLogs/security/P1-TOCTOU-Token/P1-SECURITY-TEST-PLAN.md` | TOCTOU test plan | Lines 138-200: Python validator test commands |
| 25 | `/docs/TestingLogs/security/2026-01-16/owasp-phase1-implementation-report.md` | OWASP implementation | Lines 24-214: References Python validators |
| 26 | `/docs/TestingLogs/security/P3-JailbreakDetection/README.md` | Jailbreak testing | Line 119: Reference to jailbreak_guard.py source |
| 27 | `/docs/TestingLogs/security/AuditLogs/telemetry/README.md` | Telemetry documentation | Lines 17, 39, 42: Validator event references |
| 28 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/README.md` | RBAC audit notes | Line 53: References updating settings.json for validators |

### P2 - Medium Priority Updates

| # | File Path | What Needs Updating | Details |
|---|-----------|---------------------|---------|
| 29 | `/docs/Planification/security-audits/BMAD-Security-Mitigation-Plan.md` | Mitigation implementation paths | Lines 43-1063: Extensive Python validator references (historical) |
| 30 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E1.md` | Audit findings | Line 217: token_validator.py reference |
| 31 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E2.md` | Audit findings | Lines 523, 612: rbac_enforcer.py creation instructions |
| 32 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E3.md` | Audit findings | Lines 24-25: bash_safety.py, security_common.py |
| 33 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E4.md` | Audit findings | Lines 23, 228: jailbreak_guard.py, prompt_injection_guard.py |
| 34 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E5.md` | Audit findings | Lines 26, 153-529: plugin_permissions.py references |
| 35 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E6-E7.md` | Audit findings | Lines 31, 154, 225-226, 462: supply_chain_verifier.py, audit_integrity.py |
| 36 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-findings-E8-E10.md` | Audit findings | Lines 34-427: Multiple validator references |
| 37 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/security-audit-epics.md` | Audit epics summary | Lines 191, 598-617: Validator file listing |
| 38 | `/docs/TestingLogs/security/RBAC-SEC-AUDIT-2026-01-16/SECURITY-AUDIT-MASTER-REPORT.md` | Master audit report | Lines 150-200: Hook configuration examples |
| 39 | `/docs/UserGuide/Security/P1-TOCTOU-Token-Validation.md` | TOCTOU feature docs | Line 165: settings.json reference |
| 40 | `/docs/UserGuide/Security/P2-Command-Substitution-Input-Validation.md` | Input validation docs | Check for validator references |
| 41 | `/docs/UserGuide/Security/P3-Jailbreak-Detection-Enhancements.md` | Jailbreak detection docs | Check for validator references |
| 42 | `/docs/UserGuide/Security/P4-OWASP-Remediation.md` | OWASP remediation docs | Check for validator implementation references |
| 43 | `/docs/Features/Security/Rate-Limiting.md` | Rate limiter documentation | Check for Python references |
| 44 | `/docs/Features/Security/AgenticSecurity.md` | Agentic security overview | Check for validator references |
| 45 | `/docs/Features/Security/Plugin-Permissions.md` | Plugin permissions | Check for Python references |
| 46 | `/docs/Features/Security/Security-File-Integrity.md` | File integrity docs | Check for validator references |
| 47 | `/docs/Features/Security/Security-Audit-Logging.md` | Audit logging docs | Check for Python references |
| 48 | `/docs/Features/Security/Security-RBAC.md` | RBAC implementation | Check for validator references |
| 49 | `/docs/Features/Security/Security-Authentication.md` | Authentication docs | Lines 75, 267, 356: validate-token.js (already Node.js - verify) |
| 50 | `/docs/TestingLogs/validation/2026-01-12/bmad-framework-compliance-report.md` | Compliance report | Line 376: pre-commit validation hooks reference |
| 51 | `/docs/TestingLogs/compliance/2026-01-12/bmad-framework-compliance-report-2026-01-12.md` | Compliance report | Line 376: pre-commit validation hooks reference |
| 52 | `/docs/Features/SCHEMAS-DATA-STRUCTURES.md` | Schema definitions | Check for validator-related schemas |
| 53 | `/docs/UserGuide/LLM-PROVIDER-SYSTEM.md` | LLM provider docs | Check for validator integration references |

---

## Specific Changes Required

### 1. Command Syntax Changes

**Old (Python):**
```bash
python3 .claude/validators/bash_safety.py
python3 .claude/validators/rate_limiter.py status
python3 .claude/validators/plugin_permissions.py validate
```

**New (Node.js):**
```bash
node .claude/validators-node/bin/bash-safety.js
node .claude/validators-node/bin/rate-limiter.js status
node .claude/validators-node/bin/plugin-permissions.js validate
```

### 2. Hook Configuration Changes

**Old (settings.json):**
```json
{
  "type": "command",
  "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.claude/validators/bash_safety.py"
}
```

**New (settings.json):**
```json
{
  "type": "command",
  "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/validators-node/bin/bash-safety.js"
}
```

### 3. Directory Structure Changes

**Old:**
```
.claude/
├── validators/
│   ├── bash_safety.py
│   ├── secret_guard.py
│   └── ... (20 Python files)
```

**New:**
```
.claude/
├── validators-node/
│   ├── bin/
│   │   ├── bash-safety.js
│   │   ├── secret-guard.js
│   │   └── ... (20 compiled JS files)
│   ├── src/
│   │   └── ... (TypeScript source)
│   └── package.json
```

### 4. Validator File Naming Convention Changes

| Old (Python) | New (Node.js) |
|--------------|---------------|
| `bash_safety.py` | `bash-safety.js` |
| `secret_guard.py` | `secret-guard.js` |
| `env_protection.py` | `env-protection.js` |
| `outside_repo_guard.py` | `outside-repo.js` |
| `production_guard.py` | `production.js` |
| `pii_guard.py` | `pii.js` |
| `prompt_injection_guard.py` | `prompt-injection.js` |
| `jailbreak_guard.py` | `jailbreak.js` |
| `rate_limiter.py` | `rate-limiter.js` |
| `resource_limits.py` | `resource-limits.js` |
| `recursion_guard.py` | `recursion-guard.js` |
| `context_manager.py` | `context-manager.js` |
| `confidence_tracker.py` | `confidence-tracker.js` |
| `anomaly_detector.py` | `anomaly-detector.js` |
| `audit_integrity.py` | `audit-integrity.js` |
| `telemetry_collector.py` | `telemetry.js` |
| `plugin_permissions.py` | `plugin-permissions.js` |
| `supply_chain_verifier.py` | `supply-chain.js` |
| `token_validator.py` | `token-validator.js` |
| `security_common.py` | (library, not standalone) |

---

## Documentation Update Plan

### Phase 1: Critical User-Facing Documentation (P0)
**Timeline:** Before merge to main branch
**Files:** 8 files
**Estimated Effort:** 2-3 hours

1. Update all command examples in user guides
2. Update configuration examples
3. Update troubleshooting commands
4. Add migration notes for existing users

### Phase 2: Technical Documentation (P1)
**Timeline:** Within 1 week of merge
**Files:** 20 files
**Estimated Effort:** 4-6 hours

1. Update architecture documentation
2. Update contributing guide for TypeScript validators
3. Update security audit procedures
4. Update testing documentation

### Phase 3: Historical/Reference Documentation (P2)
**Timeline:** As time permits
**Files:** 25 files
**Estimated Effort:** 3-4 hours

1. Add "Historical" or "Deprecated" markers to Python references
2. Add notes about migration
3. Update validation logs to indicate new implementation

---

## Files NOT Requiring Updates

The following documentation areas are already up-to-date or not affected:

- **Legal-Team workflows** - No validator references
- **Strategy-Team workflows** - No validator references
- **Intel-Team workflows** - No validator references (recently updated)
- **BMM module docs** - Separate from security validators
- **RBAC configuration guides** - Already reference Node.js authentication
- **Planification roadmaps** - High-level, no implementation details

---

## Recommendations

### Immediate Actions (Pre-Merge)

1. **Update P0 files** before merging the validator migration branch
2. **Create a migration guide** for users upgrading from Python validators
3. **Add deprecation notices** to Python validator documentation

### Post-Merge Actions

1. **Update P1 files** within first week
2. **Archive/mark P2 historical documents** appropriately
3. **Create new documentation** for Node.js validator development

### Long-Term Actions

1. **Remove Python validator references** after 30-day deprecation period
2. **Update CI/CD documentation** if validator tests change
3. **Update onboarding documentation** for new contributors

---

## Validation Checklist

After documentation updates, verify:

- [ ] All user-facing commands work with new paths
- [ ] Configuration examples are syntactically correct
- [ ] No broken internal links to validator files
- [ ] Glossary definitions are accurate
- [ ] Contributing guide produces working validators
- [ ] Troubleshooting steps are testable

---

## Appendix: Search Patterns Used

```bash
# Python validator references
grep -r "python" docs/ --include="*.md"
grep -r "\.py" docs/ --include="*.md"
grep -r "validators/" docs/ --include="*.md"

# Hook configuration references
grep -r "hook" docs/ --include="*.md"
grep -r "pre-commit|husky|\.husky" docs/ --include="*.md"

# Security/validation references
grep -r "security|validation|compliance" docs/ --include="*.md"
```

---

*Report generated: 2026-01-17*
*Branch: VALIDATORS-PY-2-JS*
