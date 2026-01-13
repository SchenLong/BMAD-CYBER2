# BMAD Step-File Module Compliance Remediation Plan

**Date:** 2026-01-12
**Scope:** Step-File Architecture Modules Only
**Target:** 90%+ Compliance for Production Release

---

## Executive Summary

After analyzing the Step-File architecture modules with proper architectural awareness (excluding YAML+XML engine modules per Lesson 18), the following remediation is needed:

| Module | Current | Target | Status |
|--------|---------|--------|--------|
| BMB | 100% | 100% | ✅ COMPLETE |
| cybersec-team | 100% | 100% | ✅ COMPLETE |
| strategy-team | 100% | 100% | ✅ COMPLETE |
| legal-team | 43% | 100% | ⚠️ NEEDS WORK |
| intel-team | 0% | 100% | ⚠️ NEEDS WORK |

**Note:** BMB was at 95% before this session. The edit-workflow Lessons Learned section was added, bringing it to 100%.

---

## Module Analysis

### LEGAL-TEAM (7 Workflows)

**Compliant Workflows (3):**
1. `contract-review/workflow.md` - Full compliance
2. `contract-drafting/workflow.md` - Full compliance
3. `legal-matter-intake/workflow.md` - Full compliance

**Non-Compliant Workflows (4):**
1. `corporate-formation/workflow.md`
2. `tax-planning/workflow.md`
3. `dispute-strategy/workflow.md`
4. `cross-border-matter/workflow.md`

**Issue Pattern:** These 4 workflows use a **simplified documentation format**:
- Have YAML frontmatter with name, description, version ✅
- Have Overview section ✅
- Have Workflow Steps list ✅
- Have Legal Disclaimer ✅
- **MISSING:** Goal statement (embedded in Overview, not explicit)
- **MISSING:** Your Role section
- **MISSING:** WORKFLOW ARCHITECTURE section with Critical Rules
- **MISSING:** INITIALIZATION SEQUENCE section
- **MISSING:** Reference to step files (they list steps conceptually but don't point to `steps/*.md` files)

---

### INTEL-TEAM (19 Workflows)

**Issue Pattern:** Intel-team workflows use a **custom INTEL format**:
- Have detailed YAML frontmatter ✅
- Have PURPOSE section instead of Goal ✅
- Have WORKFLOW STRUCTURE diagrams ✅
- Have step file references in YAML ✅
- **MISSING:** Your Role section
- **MISSING:** WORKFLOW ARCHITECTURE section with Core Principles
- **MISSING:** Critical Rules (NO EXCEPTIONS) section
- **MISSING:** INITIALIZATION SEQUENCE section

**All 19 Intel Workflows:**
1. `flash-assessment/workflow.md`
2. `campaign-planner-person/workflow.md`
3. `campaign-planner-org/workflow.md`
4. `campaign-ai/workflow.md`
5. `breach-archaeology/workflow.md`
6. `infrastructure-genealogy/workflow.md`
7. `doppelganger-hunt/workflow.md`
8. `attribution-chain/workflow.md`
9. `digital-necromancy/workflow.md`
10. `spider-web/workflow.md`
11. `ground-truth/workflow.md`
12. `threat-constellation/workflow.md`
13. `the-synthesis/workflow.md`
14. `signal-landscape/workflow.md`
15. `counter-intel-audit/workflow.md`
16. `approach-vector/workflow.md`
17. `tripwire/workflow.md`
18. `operation-mosaic/workflow.md`
19. `pattern-of-life/workflow.md`

---

## Detailed Remediation Steps

### PHASE 1: Legal-Team Remediation (4 Workflows)

#### Step 1.1: corporate-formation/workflow.md

**Current Structure:**
```markdown
---
name: corporate-formation
description: ...
version: 1.0.0
...
---
# Corporate Formation Workflow
## Overview
## Supported Entity Types
## Workflow Steps (numbered list)
## Agent Coordination
## Legal Disclaimer
```

**Required Changes:**
1. Add explicit `**Goal:**` line after # heading
2. Add `**Your Role:**` section
3. Add `## WORKFLOW ARCHITECTURE` section with:
   - Core Principles (Micro-file Design, Just-In-Time Loading, etc.)
   - Step Processing Rules
   - Critical Rules (NO EXCEPTIONS)
4. Add `## INITIALIZATION SEQUENCE` section with:
   - Configuration Loading
   - First Step EXECUTION reference

**Action:**
```
File: _bmad/legal-team/workflows/corporate-formation/workflow.md
Changes: Add Goal, Your Role, WORKFLOW ARCHITECTURE, INITIALIZATION SEQUENCE
Verify: steps/ directory exists with step files
Test: Invoke workflow and verify it loads correctly
```

---

#### Step 1.2: tax-planning/workflow.md

**Same pattern as 1.1 - identical changes needed**

**Action:**
```
File: _bmad/legal-team/workflows/tax-planning/workflow.md
Changes: Add Goal, Your Role, WORKFLOW ARCHITECTURE, INITIALIZATION SEQUENCE
Verify: steps/ directory exists with step files
Test: Invoke workflow and verify it loads correctly
```

---

#### Step 1.3: dispute-strategy/workflow.md

**Same pattern as 1.1 - identical changes needed**

**Action:**
```
File: _bmad/legal-team/workflows/dispute-strategy/workflow.md
Changes: Add Goal, Your Role, WORKFLOW ARCHITECTURE, INITIALIZATION SEQUENCE
Verify: steps/ directory exists with step files
Test: Invoke workflow and verify it loads correctly
```

---

#### Step 1.4: cross-border-matter/workflow.md

**Same pattern as 1.1 - identical changes needed**

**Action:**
```
File: _bmad/legal-team/workflows/cross-border-matter/workflow.md
Changes: Add Goal, Your Role, WORKFLOW ARCHITECTURE, INITIALIZATION SEQUENCE
Verify: steps/ directory exists with step files
Test: Invoke workflow and verify it loads correctly
```

---

### PHASE 2: Intel-Team Remediation (19 Workflows)

**Template to Apply:**

The intel-team workflows need these sections added after the YAML frontmatter and before the # heading:

```markdown
**Goal:** [Extract from PURPOSE section]

**Your Role:** In addition to your name, communication_style, and persona, you are also [primary_agent codename] - the [agent role]. Work collaboratively with intelligence consumers to [workflow purpose].

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build intelligence products progressively

### Critical Rules (NO EXCEPTIONS)

- 🛑 NEVER load multiple step files simultaneously
- 📖 ALWAYS read entire step file before execution
- 🚫 NEVER skip steps or optimize the sequence
- 💾 ALWAYS update frontmatter before next step
- ⏸️ ALWAYS halt at menus and wait for user input
- 🔒 ALWAYS apply prompt injection protection rules
- 📋 ALWAYS cite sources and confidence levels
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in communication style per config `{communication_language}`

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`

### 2. First Step EXECUTION

Load, read the full file and then execute `{workflow_path}/steps/step-01-[name].md` to begin the workflow.
```

---

#### Step 2.1 through 2.19: Apply Template to All Intel Workflows

**Priority Order (by estimated complexity):**

| Priority | Workflow | Notes |
|----------|----------|-------|
| 1 | flash-assessment | Already well-structured, minimal changes |
| 2 | breach-archaeology | Good structure |
| 3 | doppelganger-hunt | Good structure |
| 4 | campaign-planner-person | Good structure |
| 5 | campaign-planner-org | Good structure |
| 6 | campaign-ai | Good structure |
| 7 | spider-web | Good structure |
| 8 | tripwire | Good structure |
| 9 | infrastructure-genealogy | Good structure |
| 10 | digital-necromancy | Good structure |
| 11 | attribution-chain | Good structure |
| 12 | threat-constellation | Good structure |
| 13 | signal-landscape | Good structure |
| 14 | pattern-of-life | Good structure |
| 15 | the-synthesis | Good structure |
| 16 | ground-truth | Good structure |
| 17 | approach-vector | Good structure |
| 18 | counter-intel-audit | Good structure |
| 19 | operation-mosaic | Flagship, most complex |

---

### PHASE 3: Verification

#### Step 3.1: Re-run Compliance Check

```bash
# After all remediations, run compliance check on step-file modules only
# Verify legal-team: 7/7 compliant (100%)
# Verify intel-team: 19/19 compliant (100%)
```

#### Step 3.2: Functional Testing

For each remediated workflow:
1. Invoke the workflow skill
2. Verify configuration loads correctly
3. Verify first step file loads
4. Verify step navigation works
5. Document any issues

#### Step 3.3: Update Validation Log

Create validation log entry:
```
docs/ValidationLog/step-file-compliance-remediation-2026-01-12.md
```

---

## Estimated Effort

| Phase | Workflows | Time Estimate | Notes |
|-------|-----------|---------------|-------|
| Phase 1 | 4 | 1-2 hours | Legal-team workflows |
| Phase 2 | 19 | 3-4 hours | Intel-team workflows (batch process) |
| Phase 3 | - | 1 hour | Verification and testing |
| **Total** | **23** | **5-7 hours** | |

---

## Decision Point: Custom INTEL Format

Before proceeding with Phase 2, consider this alternative:

**Option A: Full Step-File Compliance**
- Add all missing sections to intel-team workflows
- Achieve 100% compliance with BMB templates
- Consistent format across all step-file modules

**Option B: Document INTEL Format as Valid Variant**
- Add Lesson 19: Intel-Team Custom Format
- Define INTEL format as valid alternative
- Only require: Goal, PURPOSE, WORKFLOW STRUCTURE, step references
- Accept intel-team as "compliant with INTEL format"

**Recommendation:** Option A (Full Compliance) for consistency, but Option B is defensible if the INTEL format serves a specific purpose (e.g., easier reading by intelligence consumers).

---

## Execution Checklist

- [ ] **Phase 1.1:** Fix corporate-formation/workflow.md
- [ ] **Phase 1.2:** Fix tax-planning/workflow.md
- [ ] **Phase 1.3:** Fix dispute-strategy/workflow.md
- [ ] **Phase 1.4:** Fix cross-border-matter/workflow.md
- [ ] **Phase 1 Complete:** Verify legal-team 100%
- [ ] **Phase 2.1-2.19:** Fix all 19 intel-team workflows
- [ ] **Phase 2 Complete:** Verify intel-team 100%
- [ ] **Phase 3.1:** Run compliance check
- [ ] **Phase 3.2:** Functional testing
- [ ] **Phase 3.3:** Create validation log

---

*Generated: 2026-01-12*
*Architecture: Step-File Modules Only (per Lesson 18)*
