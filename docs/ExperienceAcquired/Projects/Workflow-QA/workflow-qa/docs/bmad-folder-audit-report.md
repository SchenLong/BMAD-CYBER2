# BMAD Folder Documentation Audit Report

**Date:** 2026-01-17
**Branch:** VALIDATORS-PY-2-JS
**Purpose:** Identify documentation requiring updates after Python to Node.js validator migration

---

## Executive Summary

This audit scans the `_bmad/` folder for documentation that references Python validators, hooks, or related infrastructure that may need updates following the validator migration from Python to Node.js.

### Key Findings

| Category | Files Found | Update Priority |
|----------|-------------|-----------------|
| Direct Python Validator References | 3 | CRITICAL |
| Python Code Examples (Non-Validator) | 9 | LOW |
| Hook/Validator Mentions (Generic) | 20+ | REVIEW |
| No Updates Needed | 1185+ | N/A |

---

## 1. Documentation Structure in _bmad

### Directory Overview

```
_bmad/
├── _config/           # Configuration files
├── _memory/           # Memory/persistence
├── bmb/               # Workflow Builder Module
│   └── docs/workflows/  # Workflow documentation (11 files)
├── bmgd/              # Game Development Module
├── bmm/               # Method Module
├── cis/               # Configuration/Infrastructure
├── core/              # Core Module (CRITICAL)
│   ├── agents/        # Agent definitions
│   ├── security/      # Security documentation (CRITICAL)
│   ├── workflows/     # Core workflows
│   └── schemas/       # Data schemas
├── cybersec-team/     # Cybersecurity workflows
├── intel-team/        # Intelligence workflows
├── legal-team/        # Legal workflows
└── strategy-team/     # Strategy workflows
```

**Total Markdown Files:** 1,198 files

---

## 2. Files Referencing Validators/Python - CRITICAL UPDATES NEEDED

### 2.1 OWASP Security Documentation (CRITICAL)

These files extensively reference Python validators and need significant updates:

#### File: `_bmad/core/security/OWASP-REMEDIATION-PLAN.md`

**References Found:** 47 direct `.py` references

**Content Requiring Updates:**
- Line 31: `**Target File:** .claude/validators/rate_limiter.py`
- Line 86: `**Target Files:** .claude/validators/plugin_permissions.py`
- Line 136: `**Target Files:** .claude/validators/supply_chain_verifier.py`
- Line 175: `**Target File:** .claude/validators/context_manager.py`
- Line 218: `**Target File:** .claude/validators/recursion_guard.py`
- Line 245: `**Target File:** .claude/validators/confidence_tracker.py`
- Line 317: `**Target File:** .claude/validators/resource_limits.py`
- Line 343: `**Target File:** .claude/validators/audit_integrity.py`
- Lines 373-374: CLI commands reference `python3 audit_integrity.py`
- Line 391: `**Implementation:** .claude/validators/telemetry_collector.py`
- Line 446: `**Target File:** .claude/validators/anomaly_detector.py`
- Line 470: CLI reference `python3 anomaly_detector.py status`

**Python Code Examples:** Multiple Python code blocks showing validator implementations

**Update Action:**
- Update all file paths from `.py` to `.js` or `.ts`
- Replace Python code examples with TypeScript/Node.js equivalents
- Update CLI commands from `python3 script.py` to `npx ts-node script.ts` or `node script.js`

**Priority:** CRITICAL

---

#### File: `_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md`

**References Found:** 2 direct validator references

**Content Requiring Updates:**
- References to `.claude/validators/` Python files in the Validator File Reference tables
- Python validator file names throughout the document

**Update Action:**
- Update Validator File Reference tables (lines 477-507) to reflect Node.js file names
- Verify all validator paths are current

**Priority:** CRITICAL

---

#### File: `_bmad/core/security/PLUGIN-ISOLATION-RESEARCH.md`

**References Found:** Multiple Python code examples

**Content Type:** Research document with Python POC code

**Assessment:** This document discusses plugin isolation strategies and includes Python code examples for subprocess isolation. However, the Python code here represents **research/POC content**, not production validators.

**Update Action:**
- No immediate update required
- Consider adding a note that production validators are now Node.js-based
- POC examples can remain Python as they demonstrate concepts, not production code

**Priority:** LOW (informational context update only)

---

### 2.2 Summary Table - Critical Security Docs

| File | Python Refs | Update Priority | Effort |
|------|-------------|-----------------|--------|
| `OWASP-REMEDIATION-PLAN.md` | 47+ | CRITICAL | HIGH |
| `OWASP-AI-SECURITY-CHECKLIST.md` | 15+ | CRITICAL | MEDIUM |
| `PLUGIN-ISOLATION-RESEARCH.md` | 20+ | LOW | LOW |

---

## 3. Files with Python Code Examples (Non-Validator)

These files contain Python code examples that are **NOT** validator-related and do **NOT** need updates:

| File | Context | Update Needed |
|------|---------|---------------|
| `_bmad/cybersec-team/workflows/infrastructure-security-testing/steps/step-06-secrets-management.md` | Example showing good vs bad secret handling patterns | NO |
| `_bmad/bmm/testarch/knowledge/selector-resilience.md` | Playwright/test examples (TypeScript) | NO |
| `_bmad/bmgd/gametest/knowledge/regression-testing.md` | Game testing Python examples | NO |
| `_bmad/bmm/workflows/3-solutioning/create-architecture/steps/step-03-starter.md` | Architecture examples | NO |
| `_bmad/bmm/workflows/generate-project-context/steps/step-02-generate.md` | Project context examples | NO |
| `_bmad/bmm/workflows/testarch/framework/instructions.md` | Test framework setup (Playwright) | NO |
| `_bmad/bmm/workflows/document-project/workflows/full-scan-instructions.md` | Documentation workflow | NO |
| `_bmad/intel-team/workflows/campaign-planner-org/steps/step-03-technology.md` | OSINT technology examples | NO |
| `_bmad/core/workflows/project-manager/create-project/instructions.md` | LLM provider health check (bash) | NO |

**Assessment:** These files reference Python in educational/example contexts unrelated to the validator migration.

---

## 4. Files Mentioning Hooks/Validators (Generic)

The following files mention "hook" or "validator" in generic contexts:

| File | Context | Update Priority |
|------|---------|-----------------|
| `_bmad/core/agents/abdul.md` | References `.claude/hooks/bmad-speak.sh` and `.claude/hooks/llm-provider-manager.sh` | REVIEW |
| `_bmad/core/agents/bmad-master.md` | References hook scripts | REVIEW |
| `_bmad/core/workflows/party-mode/workflow.md` | References validation logic | REVIEW |
| `_bmad/intel-team/workflows/tripwire/*` | Mentions alerting/validation hooks | NO CHANGE |
| Various intel-team agent files | Generic "hook" term usage | NO CHANGE |

**Assessment:** Most "hook" references are to bash scripts or generic concepts, not Python validators.

---

## 5. Updates Needed - Prioritized Action Plan

### Priority 1: CRITICAL (Immediate)

| File | Action | Estimated Effort |
|------|--------|------------------|
| `_bmad/core/security/OWASP-REMEDIATION-PLAN.md` | Full update - replace all Python paths with Node.js equivalents | 2-3 hours |
| `_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md` | Update validator reference tables | 1-2 hours |

### Priority 2: MEDIUM (Within 1 Week)

| File | Action | Estimated Effort |
|------|--------|------------------|
| `_bmad/core/security/PLUGIN-ISOLATION-RESEARCH.md` | Add note that validators are now Node.js | 15 minutes |

### Priority 3: LOW (Optional)

No additional documentation updates identified as necessary.

---

## 6. Specific Content Updates Required

### OWASP-REMEDIATION-PLAN.md Updates

**File Path Updates (47 instances):**

| Old Path | New Path |
|----------|----------|
| `.claude/validators/rate_limiter.py` | `.claude/validators-node/dist/rate_limiter.js` |
| `.claude/validators/plugin_permissions.py` | `.claude/validators-node/dist/plugin_permissions.js` |
| `.claude/validators/supply_chain_verifier.py` | `.claude/validators-node/dist/supply_chain_verifier.js` |
| `.claude/validators/context_manager.py` | `.claude/validators-node/dist/context_manager.js` |
| `.claude/validators/recursion_guard.py` | `.claude/validators-node/dist/recursion_guard.js` |
| `.claude/validators/confidence_tracker.py` | `.claude/validators-node/dist/confidence_tracker.js` |
| `.claude/validators/resource_limits.py` | `.claude/validators-node/dist/resource_limits.js` |
| `.claude/validators/security_common.py` | `.claude/validators-node/dist/security_common.js` |
| `.claude/validators/audit_integrity.py` | `.claude/validators-node/dist/audit_integrity.js` |
| `.claude/validators/telemetry_collector.py` | `.claude/validators-node/dist/telemetry_collector.js` |
| `.claude/validators/anomaly_detector.py` | `.claude/validators-node/dist/anomaly_detector.js` |
| `tests/test_*.py` | `.claude/validators-node/tests/*.test.ts` |

**CLI Command Updates:**

| Old Command | New Command |
|-------------|-------------|
| `python3 audit_integrity.py verify` | `npx ts-node src/audit_integrity.ts verify` |
| `python3 audit_integrity.py sign` | `npx ts-node src/audit_integrity.ts sign` |
| `python3 anomaly_detector.py status` | `npx ts-node src/anomaly_detector.ts status` |

**Code Example Updates:**
- Replace Python implementation examples with TypeScript equivalents
- Update import statements and syntax

---

## 7. Files Confirmed - No Updates Needed

The following documentation categories were reviewed and confirmed to require **NO updates**:

- **Workflow Builder Docs** (`_bmad/bmb/docs/workflows/`) - Pure workflow architecture, no validator references
- **Game Development Module** (`_bmad/bmgd/`) - No validator dependencies
- **Legal Team Workflows** (`_bmad/legal-team/`) - No validator references
- **Strategy Team Workflows** (`_bmad/strategy-team/`) - No validator references
- **Intel Team Workflows** (`_bmad/intel-team/`) - Generic "hook" usage only, not validator-related
- **Cybersec Team Workflows** (`_bmad/cybersec-team/`) - Security testing examples (non-validator)

---

## 8. Recommendations

### Immediate Actions

1. **Update OWASP-REMEDIATION-PLAN.md** - This is the primary documentation of the security validator system and needs comprehensive updates to reflect the Node.js migration.

2. **Update OWASP-AI-SECURITY-CHECKLIST.md** - Update the validator file reference tables to reflect new paths.

3. **Add Migration Note** - Add a note at the top of security docs indicating:
   > **Note:** Validators migrated from Python to Node.js (TypeScript) on 2026-01-17. See `.claude/validators-node/` for current implementation.

### Future Considerations

1. **Create Architecture Doc** - Consider creating a dedicated `VALIDATOR-ARCHITECTURE.md` document describing the Node.js validator system.

2. **Update Module READMEs** - If any module README files reference validators, update them.

3. **Maintain Consistency** - Ensure new documentation follows the Node.js/TypeScript convention.

---

## 9. Conclusion

The validator migration from Python to Node.js has minimal impact on BMAD documentation:

- **3 files** require significant updates (all in `_bmad/core/security/`)
- **1,195+ files** require no changes
- Total estimated effort: **3-5 hours**

The security documentation in `_bmad/core/security/` is the primary focus for updates, as it contains detailed references to validator implementation files and CLI commands.

---

*Report generated: 2026-01-17*
*Auditor: Claude Opus 4.5*
