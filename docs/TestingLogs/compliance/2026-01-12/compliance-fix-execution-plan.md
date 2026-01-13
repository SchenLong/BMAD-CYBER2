# BMAD Compliance Fix Execution Plan

**Created:** 2026-01-12
**Status:** READY FOR EXECUTION
**Approach:** Module-by-module, fix-by-fix with verification

---

## Execution Strategy

We'll work through fixes in this order:
1. **Start with highest-impact, lowest-risk** fixes first
2. **Test after each fix** before moving to next
3. **Complete one module** before moving to next
4. **Re-run compliance check** after each module

---

## PHASE 1: BMB Module (95% → 100%)

*Starting with BMB because it's closest to compliant and will validate our process*

### Step 1.1: Add Lessons Learned Check to edit-workflow

**File:** `_bmad/bmb/workflows/edit-workflow/workflow.md`

**Action:** Add section 1.5 to INITIALIZATION SEQUENCE

**What to add after "### 1. Configuration Loading":**
```markdown
### 1.5. Lessons Learned Check (MANDATORY)

Load and read `{project-root}/_bmad/bmb/ExperienceAcquired/LessonsLearned.md` before proceeding. Apply any relevant lessons to the current edit operation.
```

**Test:**
- [ ] Invoke `/bmad:bmb:workflows:edit-workflow`
- [ ] Verify it mentions loading Lessons Learned

**Ready to execute?** Reply "1.1 GO" to proceed

---

### Step 1.2: Standardize Agent Workflow Path Variables

**Files:** Agent workflow step files using relative paths

**Action:** Find and replace relative paths with `{workflow_path}` format

**Test:**
- [ ] Test agent create mode
- [ ] Test agent edit mode

**Ready to execute?** Reply "1.2 GO" to proceed

---

### Step 1.3: Document Step Files by Mode

**File:** `_bmad/bmb/workflows/agent/workflow.md`

**Action:** Add documentation section listing all step files

**Test:**
- [ ] Verify documentation accuracy

**Ready to execute?** Reply "1.3 GO" to proceed

---

### Step 1.4: BMB Module Verification

**Action:** Run compliance check on BMB module

**Test:**
- [ ] Compliance score = 100%
- [ ] Zero violations

**Ready to execute?** Reply "1.4 GO" to proceed

---

## PHASE 2: Cybersec-Team Module (93% → 100%)

### Step 2.1: Expand web-app-security-testing workflow.md

**File:** `_bmad/cybersec-team/workflows/web-app-security-testing/workflow.md`

**Action:** Add missing sections to match peer workflows

**Test:**
- [ ] Workflow loads correctly
- [ ] First 3 steps execute

**Ready to execute?** Reply "2.1 GO" to proceed

---

### Step 2.2: Expand web-app-security-testing step-01-init.md

**File:** `_bmad/cybersec-team/workflows/web-app-security-testing/steps/step-01-init.md`

**Action:** Add EXECUTION PROTOCOLS, CONTEXT BOUNDARIES, CRITICAL STEP COMPLETION NOTE, SUCCESS/FAILURE METRICS

**Test:**
- [ ] Step loads and executes
- [ ] OWASP methodology preserved

**Ready to execute?** Reply "2.2 GO" to proceed

---

### Step 2.3: Add Related Agents to 3 Workflows

**Files:**
- security-awareness-training/workflow.md
- vulnerability-management/workflow.md
- network-assessment/workflow.md

**Action:** Add Related Agents section

**Test:**
- [ ] Agent references correct

**Ready to execute?** Reply "2.3 GO" to proceed

---

### Step 2.4: Cybersec-Team Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score = 100%

**Ready to execute?** Reply "2.4 GO" to proceed

---

## PHASE 3: BMM Module (82% → 95%+)

### Step 3.1: Add Critical Rules to create-ux-design

**File:** `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md`

**Action:** Add "Critical Rules (NO EXCEPTIONS)" section

**Test:**
- [ ] Workflow still functions

**Ready to execute?** Reply "3.1 GO" to proceed

---

### Step 3.2: Add Critical Rules to create-architecture

**File:** `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`

**Action:** Add "Critical Rules (NO EXCEPTIONS)" section

**Test:**
- [ ] Workflow still functions

**Ready to execute?** Reply "3.2 GO" to proceed

---

### Step 3.3: Add Critical Rules to generate-project-context

**File:** `_bmad/bmm/workflows/generate-project-context/workflow.md`

**Action:** Add "Critical Rules (NO EXCEPTIONS)" section

**Test:**
- [ ] Workflow still functions

**Ready to execute?** Reply "3.3 GO" to proceed

---

### Step 3.4: Fix quick-dev - Add Goal and Architecture

**File:** `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md`

**Action:**
1. Add formal "Goal:" statement
2. Add "WORKFLOW ARCHITECTURE" with Core Principles
3. Add "Critical Rules (NO EXCEPTIONS)" section

**Test:**
- [ ] Mode switching still works
- [ ] Tech-spec generation works

**Ready to execute?** Reply "3.4 GO" to proceed

---

### Step 3.5: Standardize research "Your Role:" Section

**File:** `_bmad/bmm/workflows/1-analysis/research/workflow.md`

**Action:** Move role description to formal "Your Role:" section

**Test:**
- [ ] Research routing works

**Ready to execute?** Reply "3.5 GO" to proceed

---

### Step 3.6: BMM Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "3.6 GO" to proceed

---

## PHASE 4: Core Module (48% → 95%+)

### Step 4.1: Add Critical Rules to party-mode

**File:** `_bmad/core/workflows/party-mode/workflow.md`

**Action:** Add "Critical Rules (NO EXCEPTIONS)" section with 7 rules

**Test:**
- [ ] Multi-agent discussion works

**Ready to execute?** Reply "4.1 GO" to proceed

---

### Step 4.2: Add Critical Rules to brainstorming

**File:** `_bmad/core/workflows/brainstorming/workflow.md`

**Action:** Add "Critical Rules (NO EXCEPTIONS)" section

**Test:**
- [ ] Technique execution works

**Ready to execute?** Reply "4.2 GO" to proceed

---

### Step 4.3: Restructure WORKFLOW ARCHITECTURE in Both

**Files:** party-mode/workflow.md, brainstorming/workflow.md

**Action:** Add formal "Core Principles" and "Step Processing Rules" subsections

**Test:**
- [ ] Step transitions work

**Ready to execute?** Reply "4.3 GO" to proceed

---

### Step 4.4: Add web_bundle to Frontmatter

**Files:** Both workflow.md files

**Action:** Add `web_bundle: false`

**Test:**
- [ ] YAML parses

**Ready to execute?** Reply "4.4 GO" to proceed

---

### Step 4.5: Add CRITICAL STEP COMPLETION NOTE to All Steps

**Files:** 11 step files across both workflows

**Action:** Add completion note section

**Test:**
- [ ] Completion criteria work

**Ready to execute?** Reply "4.5 GO" to proceed

---

### Step 4.6: Core Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "4.6 GO" to proceed

---

## PHASE 5: BMGD Module (42% → 95%+)

### Step 5.1: Add Frontmatter to brainstorm-game

**File:** `_bmad/bmgd/workflows/1-preproduction/brainstorm-game/workflow.md`

**Action:** Add YAML frontmatter with name, description, web_bundle

**Test:**
- [ ] YAML parses
- [ ] Workflow loads

**Ready to execute?** Reply "5.1 GO" to proceed

---

### Step 5.2: Add Frontmatter to narrative

**File:** `_bmad/bmgd/workflows/2-design/narrative/workflow.md`

**Action:** Add YAML frontmatter

**Test:**
- [ ] Workflow loads

**Ready to execute?** Reply "5.2 GO" to proceed

---

### Step 5.3: Add Frontmatter to game-architecture

**File:** `_bmad/bmgd/workflows/3-technical/game-architecture/workflow.md`

**Action:** Add YAML frontmatter

**Test:**
- [ ] Workflow loads

**Ready to execute?** Reply "5.3 GO" to proceed

---

### Step 5.4: Replace "Agent Role" with "Your Role:" (3 files)

**Files:** brainstorm-game, narrative, game-architecture workflow.md

**Action:** Rename section and add partnership language

**Test:**
- [ ] Partnership framing appears

**Ready to execute?** Reply "5.4 GO" to proceed

---

### Step 5.5: Add WORKFLOW ARCHITECTURE to 3 Workflows

**Files:** Same 3 workflow.md files

**Action:** Add Core Principles and Step Processing Rules

**Test:**
- [ ] Step transitions work

**Ready to execute?** Reply "5.5 GO" to proceed

---

### Step 5.6: Add INITIALIZATION SEQUENCE to 3 Workflows

**Files:** Same 3 workflow.md files

**Action:** Rename "Starting the Workflow" to formal sequence

**Test:**
- [ ] Config loads
- [ ] First step executes

**Ready to execute?** Reply "5.6 GO" to proceed

---

### Step 5.7: BMGD Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "5.7 GO" to proceed

---

## PHASE 6: Strategy-Team Module (62% → 95%+)

### Step 6.1: Add Step Processing Rules to 11 Workflows

**Files:**
- board-presentation-prep
- competitive-warfare
- conflict-resolution
- corporate-political-game
- crisis-response-planning
- ethical-dilemma-resolution
- leadership-philosophy
- policy-development
- political-risk-assessment
- stakeholder-negotiation-prep
- strategic-planning-session

**Action:** Add Step Processing Rules section to each

**Test:**
- [ ] Step transitions honor rules
- [ ] Menu halt behavior works

**Ready to execute?** Reply "6.1 GO" to proceed

---

### Step 6.2: Add Communication Language Enforcement to 11 Workflows

**Action:** Add to INITIALIZATION SEQUENCE of same 11 workflows

**Test:**
- [ ] Language setting respected

**Ready to execute?** Reply "6.2 GO" to proceed

---

### Step 6.3: Add Missing Sections to 36 Step Files

**Files:** Step files in board-relations-management, corporate-political-game, leadership-transition-planning, crisis-response-planning, and continuation steps

**Action:** Add EXECUTION PROTOCOLS, CONTEXT BOUNDARIES, CRITICAL STEP COMPLETION NOTE

**Test:**
- [ ] Run 1 workflow from each affected group

**Ready to execute?** Reply "6.3 GO" to proceed

---

### Step 6.4: Strategy-Team Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "6.4 GO" to proceed

---

## PHASE 7: CIS Module (62% → 95%+)

### Step 7.1: Convert workflow.yaml to workflow.md (4 workflows)

**Files:** problem-solving, design-thinking, innovation-strategy, storytelling

**Action:** Create new workflow.md with standard sections, preserve workflow.yaml as backup

**Test:**
- [ ] Each workflow loads correctly
- [ ] Agent activation works
- [ ] First 3 steps work

**Ready to execute?** Reply "7.1 GO" to proceed

---

### Step 7.2: Add Frontmatter to instructions.md Files

**Files:** 4 instructions.md files

**Action:** Add YAML frontmatter

**Test:**
- [ ] Instructions load correctly

**Ready to execute?** Reply "7.2 GO" to proceed

---

### Step 7.3: Add Required Sections to instructions.md

**Action:** Add CONTEXT BOUNDARIES, CRITICAL STEP COMPLETION NOTE, SUCCESS/FAILURE METRICS

**Test:**
- [ ] Creative session works
- [ ] Energy checkpoints work

**Ready to execute?** Reply "7.3 GO" to proceed

---

### Step 7.4: Verify Agents Still Work

**Action:** Test all 5 CIS agents

**Test:**
- [ ] All agents function
- [ ] Menu systems work

**Ready to execute?** Reply "7.4 GO" to proceed

---

### Step 7.5: CIS Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "7.5 GO" to proceed

---

## PHASE 8: Legal-Team Module (43% → 95%+)

### Step 8.1: Restructure tax-planning workflow.md

**File:** `_bmad/legal-team/workflows/tax-planning/workflow.md`

**Action:** Convert from YAML metadata to narrative format with all standard sections

**Test:**
- [ ] Workflow loads
- [ ] Tribute agent activates
- [ ] First 3 steps work

**Ready to execute?** Reply "8.1 GO" to proceed

---

### Step 8.2: Restructure cross-border-matter workflow.md

**File:** `_bmad/legal-team/workflows/cross-border-matter/workflow.md`

**Action:** Same conversion

**Test:**
- [ ] Multi-jurisdictional flow works

**Ready to execute?** Reply "8.2 GO" to proceed

---

### Step 8.3: Restructure dispute-strategy workflow.md

**File:** `_bmad/legal-team/workflows/dispute-strategy/workflow.md`

**Action:** Same conversion

**Test:**
- [ ] Advocate agent activates

**Ready to execute?** Reply "8.3 GO" to proceed

---

### Step 8.4: Restructure corporate-formation workflow.md

**File:** `_bmad/legal-team/workflows/corporate-formation/workflow.md`

**Action:** Same conversion

**Test:**
- [ ] Workflow loads correctly

**Ready to execute?** Reply "8.4 GO" to proceed

---

### Step 8.5: Add BMAD Sections to All 66 Step Files

**Action:** Add MANDATORY EXECUTION RULES, EXECUTION PROTOCOLS, CONTEXT BOUNDARIES, CRITICAL STEP COMPLETION NOTE, SUCCESS/FAILURE METRICS to all step files

**Test:**
- [ ] Legal context requirements enforced
- [ ] Jurisdiction behavior works
- [ ] Disclaimers appear

**Ready to execute?** Reply "8.5 GO" to proceed

---

### Step 8.6: Legal-Team Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "8.6 GO" to proceed

---

## PHASE 9: Intel-Team Module (35% → 95%+)

### Step 9.1: Add web_bundle to All 19 Workflows

**Action:** Add `web_bundle: false` to frontmatter of all workflow.md files

**Test:**
- [ ] YAML parses correctly

**Ready to execute?** Reply "9.1 GO" to proceed

---

### Step 9.2: Add "Your Role:" Section to All 19 Workflows

**Action:** Add partnership language section after PURPOSE

**Test:**
- [ ] Agent introduces partnership framing
- [ ] Domain expertise maintained

**Ready to execute?** Reply "9.2 GO" to proceed

---

### Step 9.3: Add WORKFLOW ARCHITECTURE to All 19 Workflows

**Action:** Add Core Principles and Step Processing Rules

**Test:**
- [ ] Step transitions work
- [ ] Agent waits at menus

**Ready to execute?** Reply "9.3 GO" to proceed

---

### Step 9.4: Add Critical Rules to All 19 Workflows

**Action:** Add 8 critical rules with emoji indicators

**Test:**
- [ ] Rules respected during execution

**Ready to execute?** Reply "9.4 GO" to proceed

---

### Step 9.5: Add INITIALIZATION SEQUENCE to All 19 Workflows

**Action:** Rename EXECUTION to INITIALIZATION SEQUENCE, add config loading

**Test:**
- [ ] Config loads correctly
- [ ] First step loads properly

**Ready to execute?** Reply "9.5 GO" to proceed

---

### Step 9.6: Add Required Sections to All Step Files (~95 files)

**Action:** Add EXECUTION PROTOCOLS, CONTEXT BOUNDARIES, CRITICAL STEP COMPLETION NOTE, SUCCESS/FAILURE METRICS

**Test:**
- [ ] Run 5 complete workflows end-to-end

**Ready to execute?** Reply "9.6 GO" to proceed

---

### Step 9.7: Intel-Team Module Verification

**Action:** Run compliance check

**Test:**
- [ ] Compliance score ≥ 95%

**Ready to execute?** Reply "9.7 GO" to proceed

---

## PHASE 10: Final Framework Verification

### Step 10.1: Run Full Framework Compliance Check

**Action:** Run compliance check on ALL modules

**Test:**
- [ ] Overall score ≥ 95%
- [ ] Zero Critical violations
- [ ] All modules at target

**Ready to execute?** Reply "10.1 GO" to proceed

---

### Step 10.2: Update Compliance Report

**Action:** Generate new compliance report

**Test:**
- [ ] Report shows all improvements

**Ready to execute?** Reply "10.2 GO" to proceed

---

### Step 10.3: Document in Validation Log

**Action:** Create validation log entry

**Test:**
- [ ] Log saved to docs/ValidationLog/

**Ready to execute?** Reply "10.3 GO" to proceed

---

## Quick Commands

**To start:** Reply with the step number + "GO" (e.g., "1.1 GO")

**To skip a step:** Reply "SKIP [step]"

**To run multiple steps:** Reply "GO [start] to [end]" (e.g., "GO 1.1 to 1.4")

**To check status:** Reply "STATUS"

**To pause:** Reply "PAUSE"

---

## Current Progress Tracker

| Phase | Module | Steps | Status |
|-------|--------|-------|--------|
| 1 | BMB | 1.1-1.4 | PENDING |
| 2 | Cybersec-Team | 2.1-2.4 | PENDING |
| 3 | BMM | 3.1-3.6 | PENDING |
| 4 | Core | 4.1-4.6 | PENDING |
| 5 | BMGD | 5.1-5.7 | PENDING |
| 6 | Strategy-Team | 6.1-6.4 | PENDING |
| 7 | CIS | 7.1-7.5 | PENDING |
| 8 | Legal-Team | 8.1-8.6 | PENDING |
| 9 | Intel-Team | 9.1-9.7 | PENDING |
| 10 | Final | 10.1-10.3 | PENDING |

---

**Ready to begin? Reply "1.1 GO" to start with BMB module!**
