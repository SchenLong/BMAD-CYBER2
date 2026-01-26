# UserGuide Documentation Audit Report

**Generated:** 2026-01-17
**Branch:** VALIDATORS-PY-2-JS
**Auditor:** Claude Code QA

---

## Executive Summary

This audit identifies documentation in the `docs/UserGuide` folder that references Python validators (`.py`) and needs updating to reflect the migration to Node.js validators.

### Key Findings

| Category | Count |
|----------|-------|
| Total Files in UserGuide | 45 |
| Files Needing Updates | 14 |
| P0 (Critical) Updates | 3 |
| P1 (High) Updates | 5 |
| P2 (Medium/Low) Updates | 6 |

---

## Complete File Listing

### All UserGuide Files (45 total)

```
docs/UserGuide/
├── AGENTS-REFERENCE.md
├── CLI-COMMAND-REFERENCE.md
├── CONFIGURATION-GUIDE.md                    [P0 - NEEDS UPDATE]
├── DATA-EXPORT-GUIDE.md                      [P2 - NEEDS UPDATE]
├── DATA-SENSITIVITY-GUIDE.md
├── GETTING-STARTED.md                        [P0 - NEEDS UPDATE]
├── GLOSSARY.md                               [P1 - NEEDS UPDATE]
├── LLM-PROVIDER-SYSTEM.md
├── MODULES-OVERVIEW.md
├── PARTY-MODE-GUIDE.md
├── PROMPT-DATABASE.md
├── RBAC-ROLES-GUIDE.md
├── SECURITY-OVERVIEW.md                      [P0 - NEEDS UPDATE]
├── TROUBLESHOOTING.md                        [P1 - NEEDS UPDATE]
├── WORKFLOW-CHAINING-GUIDE.md
├── WORKFLOW-SELECTION-GUIDE.md
├── WORKFLOWS-REFERENCE.md
├── Advanced/
│   ├── CUSTOM-AGENT-CREATION.md
│   ├── CUSTOM-PARTY-PRESETS.md               [P2 - NEEDS UPDATE]
│   ├── CUSTOM-WORKFLOW-CREATION.md           [P2 - NEEDS UPDATE]
│   └── LLM-PROVIDER-ADVANCED.md              [P2 - NEEDS UPDATE]
├── Examples/
│   ├── BMM-WORKFLOW-EXAMPLES.md
│   ├── CYBERSEC-WORKFLOW-EXAMPLES.md
│   ├── INTEL-WORKFLOW-EXAMPLES.md
│   ├── LEGAL-WORKFLOW-EXAMPLES.md
│   ├── PARTY-MODE-EXAMPLES.md
│   └── STRATEGY-WORKFLOW-EXAMPLES.md
├── Integration/
│   └── INTEGRATION-GUIDE.md                  [P2 - NEEDS UPDATE]
├── ModuleSetup/
│   ├── BMM-SETUP.md                          [P2 - NEEDS UPDATE]
│   ├── CYBERSEC-TEAM-SETUP.md
│   ├── INTEL-TEAM-SETUP.md
│   ├── LEGAL-TEAM-SETUP.md
│   └── STRATEGY-TEAM-SETUP.md
├── Operations/
│   ├── INCIDENT-RESPONSE-RUNBOOK.md          [P1 - NEEDS UPDATE]
│   ├── OPERATIONAL-RUNBOOKS.md               [P1 - NEEDS UPDATE]
│   └── PERFORMANCE-TUNING.md
└── Security/
    ├── AUDIT-LOG-GUIDE.md
    ├── P1-TOCTOU-Token-Validation.md
    ├── P2-Command-Substitution-Input-Validation.md
    ├── P3-Jailbreak-Detection-Enhancements.md
    ├── P4-OWASP-Remediation.md
    ├── RBAC-OPERATIONS-GUIDE.md
    ├── README.md
    ├── SECURITY-MAINTENANCE-CHECKLIST.md     [P1 - NEEDS UPDATE]
    └── TOKEN-MANAGEMENT-GUIDE.md
```

---

## Detailed Findings by Priority

### P0 - Critical (Must Update Before Release)

These files contain primary user-facing documentation about validators and security hooks.

---

#### 1. CONFIGURATION-GUIDE.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/CONFIGURATION-GUIDE.md`

**Issue:** Contains explicit Python validator references in hook configuration examples and validator tables.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 296-328 | Hook configuration with `.py` extensions | Change all `.py` to `.js` |
| 300 | `".claude/hooks/bash_safety.py"` | `".claude/validators-node/bash_safety.js"` |
| 304 | `".claude/hooks/secret_guard.py"` | `".claude/validators-node/secret_guard.js"` |
| 308 | `".claude/hooks/env_protection.py"` | `".claude/validators-node/env_protection.js"` |
| 312 | `".claude/hooks/outside_repo_guard.py"` | `".claude/validators-node/outside_repo_guard.js"` |
| 317 | `".claude/hooks/prompt_injection_guard.py"` | `".claude/validators-node/prompt_injection_guard.js"` |
| 320 | `".claude/hooks/jailbreak_guard.py"` | `".claude/validators-node/jailbreak_guard.js"` |
| 325 | `".claude/hooks/session-security-init.py"` | `".claude/validators-node/session-security-init.js"` |
| 336-346 | Validator table with `.py` extensions | Change all `.py` to `.js` |
| 352-359 | OWASP validator table with `.py` extensions | Change all `.py` to `.js` |
| 361 | "Total Validators: 19" | Update count if changed |

**Sample Change:**
```diff
- "command": ".claude/hooks/bash_safety.py"
+ "command": ".claude/validators-node/bash_safety.js"
```

---

#### 2. SECURITY-OVERVIEW.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/SECURITY-OVERVIEW.md`

**Issue:** Core security documentation with extensive Python validator references.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 167 | "Security hooks \| ~10 validator files" | Update description |
| 298 | "Hard Guardrails \| PreToolUse hooks" | Update to validators-node |
| 306-315 | Core validator table with `.py` | All `.py` to `.js` |
| 321-328 | OWASP validator table with `.py` | All `.py` to `.js` |
| 360-366 | Protection categories with `.py` | All `.py` to `.js` |
| 400 | `python3 .claude/validators/rate_limiter.py status` | `node .claude/validators-node/rate_limiter.js status` |
| 403 | `python3 .claude/validators/rate_limiter.py reset` | `node .claude/validators-node/rate_limiter.js reset` |
| 454 | `python3 .claude/validators/plugin_permissions.py list` | `node .claude/validators-node/plugin_permissions.js list` |
| 457 | `python3 .claude/validators/plugin_permissions.py check...` | `node .claude/validators-node/plugin_permissions.js check...` |
| 470-477 | OWASP score table with `.py` references | All `.py` to `.js` |
| 522 | `.claude/hooks/*.py` | `.claude/validators-node/*.js` |
| 537 | "Hard guardrail validators" | Update reference |

**Sample Change:**
```diff
- python3 .claude/validators/rate_limiter.py status
+ node .claude/validators-node/rate_limiter.js status
```

---

#### 3. GETTING-STARTED.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/GETTING-STARTED.md`

**Issue:** First user touchpoint with validator verification commands.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 51 | "19 security validators protecting against OWASP" | Verify count is correct |
| 71-72 | Python import command to verify validators | Replace with Node.js check |

**Current (Line 71-72):**
```bash
# Check all security validators
python3 -c "import sys; sys.path.insert(0, '.claude/validators'); from security_common import AuditLogger; print('Security validators loaded')"
```

**Required Replacement:**
```bash
# Check all security validators
node -e "const validators = require('./.claude/validators-node'); console.log('Security validators loaded:', Object.keys(validators).length, 'modules')"
```

---

### P1 - High Priority

These files contain operational procedures that reference Python validators.

---

#### 4. TROUBLESHOOTING.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/TROUBLESHOOTING.md`

**Issue:** User troubleshooting guide with Python-based diagnostic commands.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 713 | Reference to `HOOKS-VALIDATORS-GUIDE.md` | Verify link still valid |
| 714 | `HOOKS-CONFIGURATION-REFERENCE.md` | Verify link still valid |

**Note:** This file has minimal direct Python references but links to validator documentation that may need updating.

---

#### 5. GLOSSARY.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/GLOSSARY.md`

**Issue:** Terminology definitions reference Python validators.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 32 | "Used by `plugin_permissions.py`" | "Used by `plugin_permissions.js`" |
| 225 | "Mitigated by `jailbreak_guard.py`" | "Mitigated by `jailbreak_guard.js`" |
| 231 | "Mitigated by `supply_chain_verifier.py`" | "Mitigated by `supply_chain_verifier.js`" |
| 234 | "Mitigated by `plugin_permissions.py`" | "Mitigated by `plugin_permissions.js`" |
| 237 | "Mitigated by `confidence_tracker.py`" | "Mitigated by `confidence_tracker.js`" |
| 266 | "Implemented via sliding window algorithm in `rate_limiter.py`" | Change to `.js` |
| 342 | "Validator - Python script that validates operations" | "Validator - JavaScript module that validates operations" |

---

#### 6. Security/SECURITY-MAINTENANCE-CHECKLIST.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Security/SECURITY-MAINTENANCE-CHECKLIST.md`

**Issue:** Maintenance procedures with Python validator commands.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 63-66 | Python syntax check for validators | Node.js syntax check |
| 71-72 | `ls -la .claude/validators/*.py` | `ls -la .claude/validators-node/*.js` |
| 77-80 | Python test command for bash_safety | Node.js test command |
| 220-222 | `bandit -r .claude/validators/` Python security scanner | Remove or replace with Node.js equivalent |
| 410-413 | Python validator test command | Node.js test command |

**Current (Line 63-66):**
```bash
for f in .claude/validators/*.py; do
  python3 -c "import ast; ast.parse(open('$f').read())" 2>/dev/null && echo "OK: $f" || echo "ERROR: $f"
done
```

**Required Replacement:**
```bash
for f in .claude/validators-node/*.js; do
  node --check "$f" 2>/dev/null && echo "OK: $f" || echo "ERROR: $f"
done
```

---

#### 7. Operations/INCIDENT-RESPONSE-RUNBOOK.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Operations/INCIDENT-RESPONSE-RUNBOOK.md`

**Issue:** Incident response procedures with Python validator verification.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 218-223 | Validator integrity check with `.py` | Change to `.js` |
| 227-228 | Python test command | Node.js test command |

**Current (Line 218-223):**
```bash
for f in .claude/validators/*.py; do
    md5sum "$f"
done > /tmp/current-validators.md5
```

**Required Replacement:**
```bash
for f in .claude/validators-node/*.js; do
    md5sum "$f"
done > /tmp/current-validators.md5
```

---

#### 8. Operations/OPERATIONAL-RUNBOOKS.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Operations/OPERATIONAL-RUNBOOKS.md`

**Issue:** Operational procedures reference validator counts.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 50 | "Security validators: active (21/21)" | Verify count matches Node.js validators |

---

### P2 - Medium/Low Priority

These files have minimal Python references or are in advanced/integration sections.

---

#### 9. DATA-EXPORT-GUIDE.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/DATA-EXPORT-GUIDE.md`

**Issue:** Python script examples for data export verification.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 546-548 | Python script for hash chain verification | Optional: Convert to Node.js or keep as utility |
| 566 | Python YAML validation command | Optional: Convert to Node.js |

**Note:** These are utility scripts, not validators. Lower priority.

---

#### 10. Advanced/CUSTOM-PARTY-PRESETS.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Advanced/CUSTOM-PARTY-PRESETS.md`

**Issue:** Contains Python/validator references in advanced content.

**Updates Required:** Minimal - review for any validator references.

---

#### 11. Advanced/CUSTOM-WORKFLOW-CREATION.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Advanced/CUSTOM-WORKFLOW-CREATION.md`

**Issue:** May reference validators in workflow creation examples.

**Updates Required:** Minimal - review for any validator references.

---

#### 12. Advanced/LLM-PROVIDER-ADVANCED.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Advanced/LLM-PROVIDER-ADVANCED.md`

**Issue:** Python references in LLM provider configuration.

**Updates Required:** Review and update if validator paths referenced.

---

#### 13. Integration/INTEGRATION-GUIDE.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/Integration/INTEGRATION-GUIDE.md`

**Issue:** Python code examples for API integration.

**Updates Required:**

| Line Numbers | Current Content | Required Change |
|--------------|-----------------|-----------------|
| 721-722 | Python API export example | Optional: Keep as example or add Node.js alternative |
| 775-776 | Python GraphQL example | Optional: Keep as example or add Node.js alternative |

**Note:** These are integration examples, not validator documentation. Lower priority.

---

#### 14. ModuleSetup/BMM-SETUP.md

**File:** `/Users/paultinp/BMAD-CYBER2/docs/UserGuide/ModuleSetup/BMM-SETUP.md`

**Issue:** May reference Python validators in setup instructions.

**Updates Required:** Review and update if validator paths referenced.

---

## Summary of Changes Required

### Global Search/Replace Patterns

For efficient updates, the following search/replace patterns can be used:

| Find | Replace |
|------|---------|
| `.claude/validators/*.py` | `.claude/validators-node/*.js` |
| `.claude/hooks/bash_safety.py` | `.claude/validators-node/bash_safety.js` |
| `.claude/hooks/secret_guard.py` | `.claude/validators-node/secret_guard.js` |
| `.claude/hooks/env_protection.py` | `.claude/validators-node/env_protection.js` |
| `.claude/hooks/outside_repo_guard.py` | `.claude/validators-node/outside_repo_guard.js` |
| `.claude/hooks/prompt_injection_guard.py` | `.claude/validators-node/prompt_injection_guard.js` |
| `.claude/hooks/jailbreak_guard.py` | `.claude/validators-node/jailbreak_guard.js` |
| `.claude/hooks/session-security-init.py` | `.claude/validators-node/session-security-init.js` |
| `python3 .claude/validators/` | `node .claude/validators-node/` |
| `_guard.py` | `_guard.js` |
| `_limiter.py` | `_limiter.js` |
| `_verifier.py` | `_verifier.js` |
| `_tracker.py` | `_tracker.js` |
| `_manager.py` | `_manager.js` |
| `_collector.py` | `_collector.js` |

### Command Pattern Changes

| Original Python Command | New Node.js Command |
|------------------------|---------------------|
| `python3 -c "import sys; sys.path.insert(0, '.claude/validators')..."` | `node -e "const v = require('./.claude/validators-node')..."` |
| `python3 .claude/validators/rate_limiter.py status` | `node .claude/validators-node/rate_limiter.js status` |
| `python3 .claude/validators/plugin_permissions.py list` | `node .claude/validators-node/plugin_permissions.js list` |

---

## Verification Checklist

After updates, verify:

- [ ] All validator file extensions changed from `.py` to `.js`
- [ ] All validator directory paths changed from `validators` or `hooks` to `validators-node`
- [ ] All Python execution commands changed to Node.js
- [ ] Validator counts are accurate
- [ ] Links to related documentation are valid
- [ ] Example commands work correctly

---

## Files NOT Needing Updates

The following files were reviewed and contain no Python validator references:

- AGENTS-REFERENCE.md
- CLI-COMMAND-REFERENCE.md (contains hook references but uses correct paths)
- DATA-SENSITIVITY-GUIDE.md
- MODULES-OVERVIEW.md
- PARTY-MODE-GUIDE.md
- PROMPT-DATABASE.md
- RBAC-ROLES-GUIDE.md
- WORKFLOW-CHAINING-GUIDE.md
- WORKFLOW-SELECTION-GUIDE.md
- WORKFLOWS-REFERENCE.md
- All Example files (workflow examples)
- Most Security/ files (focus on Node.js token management)
- LLM-PROVIDER-SYSTEM.md (references shell scripts, not Python validators)

---

## Recommendations

1. **Prioritize P0 files first** - These are the main user-facing documentation
2. **Use search/replace carefully** - Some Python references may be intentional (utility scripts, examples)
3. **Update related features documentation** - Check `/docs/Features/Security/` folder as well
4. **Test commands after updating** - Ensure all example commands work
5. **Consider adding migration notes** - Document the Python to Node.js transition for users
