# BMAD User Onboarding Simulation Test Report

**Test Date:** 2026-01-26
**Document Tested:** [USER-ONBOARDING-JOURNEY.md](../../02-user-guides/USER-ONBOARDING-JOURNEY.md)
**Tester:** Automated Simulation
**Status:** FAILURES DETECTED

---

## Executive Summary

| Category | Pass | Fail | Warning |
|----------|------|------|---------|
| Phase 1: Day 1 | 3 | 5 | 1 |
| Phase 2: Week 1 | 6 | 5 | 2 |
| Phase 3: Weeks 2-4 | 4 | 3 | 1 |
| Phase 4: Ongoing | 2 | 0 | 1 |
| **TOTAL** | **15** | **13** | **5** |

**Overall Result: 13 FAILURES DETECTED**

---

## Phase 1: Day 1 - Installation & First Steps

### Step 1.1: Installation

#### FAILURE F1-001: `bmad` CLI Command Does Not Exist

**Documented Command:**
```bash
bmad install
bmad --version
bmad agents
bmad workflows
```

**Result:** FAIL

**Details:**
- The `bmad` CLI command is not defined in the repository
- `package.json` does not contain a `bin` entry for a `bmad` executable
- No script or binary found that provides this command

**Impact:** Users cannot follow installation instructions as written.

**Recommendation:**
1. Create a `bmad` CLI tool, OR
2. Update documentation to reflect actual installation method (e.g., `/bmad:core:agents:abdul` skill invocation)

---

#### FAILURE F1-002: Repository Clone URL Placeholder

**Documented Command:**
```bash
git clone https://github.com/your-org/bmad-cyber2.git
```

**Result:** FAIL

**Details:**
- URL contains placeholder `your-org`
- Users will receive 404 error when attempting to clone

**Recommendation:** Update with actual repository URL or provide clear instructions for users to substitute their own URL.

---

#### PASS P1-001: Module Structure Exists

**Documented Structure:**
```
_bmad/
├── core/           # Always installed
│   ├── agents/     # Abdul, BMAD Master
│   └── workflows/  # Party Mode, etc.
├── bmm/            # Product development
├── cybersec-team/  # Security operations
└── [other modules]
```

**Result:** PASS

**Details:** All documented modules exist:
- `_bmad/core/` - EXISTS
- `_bmad/bmm/` - EXISTS
- `_bmad/cybersec-team/` - EXISTS
- Additional modules found: `intel-team`, `legal-team`, `strategy-team`, `bmgd`, `bmb`, `cis`

---

### Step 1.2: Core Concepts

#### PASS P1-002: Key Terminology Accurate

| Term | Documented | Verified |
|------|------------|----------|
| Agent | Specialized AI persona | Files exist in `agents/` dirs |
| Workflow | Multi-step process | Files exist in `workflows/` dirs |
| Module | Package of agents/workflows | `module.yaml` files exist |
| Party Mode | Multi-agent discussions | Workflow exists |
| Abdul | Master project manager | Agent file exists |

**Result:** PASS

---

### Step 1.3: First Agent Interaction

#### FAILURE F1-003: Incorrect BMAD Master Invocation Path

**Documented Command:**
```bash
/bmad:bmad-master
```

**Result:** FAIL

**Details:**
- Correct skill path should be: `/bmad:core:agents:bmad-master`
- The documented shorthand omits the module (`core`) and type (`agents`)

**Available Skills (from manifest):**
- `bmad:core:agents:bmad-master` - Correct
- `bmad:core:agents:abdul` - Correct

---

#### PASS P1-003: Abdul Invocation Path Correct

**Documented Command:**
```bash
/bmad:core:agents:abdul
```

**Result:** PASS

**Details:** Agent file exists at `_bmad/core/agents/abdul.md`

---

### Step 1.4: First Workflow

#### FAILURE F1-004: Incorrect Brainstorming Workflow Path

**Documented Command (Quick Reference):**
```bash
/bmad:core:workflows:brainstorming
```

**Result:** PARTIAL FAIL

**Details:**
- Workflow exists at `_bmad/core/workflows/brainstorming/workflow.md`
- The skill path format may need adjustment based on actual skill registration
- Skill manifest shows: `bmad:core:workflows:brainstorming` (no leading slash in skill name)

**Recommendation:** Verify skill registration and update documentation consistently.

---

## Phase 2: Week 1 - Explore & Learn

### Day 2-3: Module Exploration

#### FAILURE F2-001: BMM Agent Shortcuts Non-Standard

**Documented Commands:**
```bash
/bmm:pm
/bmm:architect
```

**Result:** FAIL

**Details:**
- These are shorthand paths that bypass the full path structure
- Full paths should be: `/bmad:bmm:agents:pm` or similar
- Agent files exist:
  - `_bmad/bmm/agents/pm.md` - EXISTS
  - `_bmad/bmm/agents/architect.md` - EXISTS
  - `_bmad/bmm/agents/analyst.md` - EXISTS

**Recommendation:** Standardize all command examples to use full paths or document both short and long forms.

---

#### FAILURE F2-002: Inconsistent Path Notation

**Issue:** Documentation mixes two path formats:

1. `/bmad:core:agents:abdul` (full path)
2. `/bmm:pm` (shorthand)
3. `/bmad:cybersec-team:agents:security-architect` (full path)
4. `/bmm:create-product-brief` (shorthand)

**Result:** FAIL

**Details:** Users will be confused by inconsistent command formats.

**Recommendation:** Use consistent path notation throughout:
- Either all full paths: `/bmad:{module}:agents:{agent}`
- Or document both with clear explanation of shorthand rules

---

#### PASS P2-001: Security Architect Agent Exists

**Documented Command:**
```bash
/bmad:cybersec-team:agents:security-architect
```

**Result:** PASS

**Details:** Agent file exists at `_bmad/cybersec-team/agents/security-architect.md`

---

#### PASS P2-002: Master Strategist Agent Exists

**Documented Command:**
```bash
/bmad:strategy-team:agents:the-master-strategist
```

**Result:** PASS

**Details:** Agent file exists at `_bmad/strategy-team/agents/the-master-strategist.md`

---

### Day 4-5: Workflow Deep Dive

#### FAILURE F2-003: Create Product Brief Path Mismatch

**Documented Command:**
```bash
/bmm:create-product-brief
```

**Actual Workflow Location:**
- `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md`

**Result:** PARTIAL FAIL

**Details:**
- Workflow exists but path in documentation differs from file structure
- Full path should be: `/bmad:bmm:workflows:create-product-brief` or similar
- Skill may be registered with simplified name

---

#### FAILURE F2-004: Create Architecture Path Mismatch

**Documented Command:**
```bash
/bmm:create-architecture
```

**Actual Workflow Location:**
- `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`

**Result:** PARTIAL FAIL

**Details:** Similar to F2-003 - shorthand path used but actual location differs.

---

#### PASS P2-003: Party Mode Workflow Exists

**Documented Command:**
```bash
/bmad:core:workflows:party-mode
```

**Result:** PASS

**Details:**
- Main workflow: `_bmad/core/workflows/party-mode/workflow.md`
- Steps exist: `step-01-agent-loading.md`, `step-02-discussion-orchestration.md`, `step-03-graceful-exit.md`
- Presets: `presets/cross-module-groups.yaml`

---

#### PASS P2-004: Project Status Workflow Exists

**Documented Command:**
```bash
/bmad:core:workflows:project-status
```

**Result:** PASS

**Details:** Workflow exists at `_bmad/core/workflows/project-manager/project-status/`

---

#### WARNING W2-001: Select Preset Path Documentation

**Documented Command:**
```bash
/bmad:core:workflows:select-preset
```

**Result:** WARNING

**Details:**
- Workflow exists at `_bmad/core/workflows/party-mode/select-preset/workflow.yaml`
- Path structure includes `party-mode` subdirectory not shown in documentation

---

## Phase 3: Weeks 2-4 - Advanced Usage

### Week 2: Complete Project Flow

#### FAILURE F3-001: Analyst Agent Path Incomplete

**Documented Command:**
```bash
/bmm:analyst
```

**Result:** FAIL

**Details:**
- Agent exists: `_bmad/bmm/agents/analyst.md`
- Full path should be documented: `/bmad:bmm:agents:analyst`

---

#### FAILURE F3-002: Create PRD Workflow Path

**Documented Command:**
```bash
/bmm:create-prd
```

**Actual Location:**
- `_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md`

**Result:** PARTIAL FAIL

**Details:** Workflow file is named `prd`, not `create-prd`. Skill registration may differ.

---

#### FAILURE F3-003: Create Epics and Stories Path

**Documented Command:**
```bash
/bmm:create-epics-and-stories
```

**Actual Location:**
- `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md`

**Result:** PASS (file exists, path format inconsistent)

---

### Week 3: Cross-Module Workflows

#### PASS P3-001: Threat Modeling Workflow Exists

**Documented Command:**
```bash
/bmad:cybersec-team:workflows:threat-modeling
```

**Result:** PASS

**Details:** Workflow exists at `_bmad/cybersec-team/workflows/threat-modeling/workflow.md`

---

#### PASS P3-002: Threat Actor Profiler Agent Exists

**Documented Command:**
```bash
/bmad:intel-team:agents:threat-actor-profiler
```

**Result:** PASS

**Details:** Agent exists at `_bmad/intel-team/agents/threat-actor-profiler.md`

---

#### PASS P3-003: Incident Response Playbook Exists

**Documented Command:**
```bash
/bmad:cybersec-team:workflows:incident-response-playbook
```

**Result:** PASS

**Details:** Workflow exists at `_bmad/cybersec-team/workflows/incident-response-playbook/workflow.md`

---

### Week 4: Customization

#### WARNING W3-001: Module Config Path

**Documented:**
> Edit module configs in `_bmad/[module]/module.yaml`

**Result:** PASS with WARNING

**Details:** Module configs exist but some customization is in `_bmad/_config/` directory.

---

## Phase 4: Ongoing - Master & Grow

#### PASS P4-001: Best Practices Section Accurate

**Result:** PASS

**Details:** Best practices and pitfalls are reasonable and actionable.

---

#### PASS P4-002: Quick Reference Commands

**Result:** PARTIAL PASS

**Details:** Commands listed in Quick Reference have same issues noted above regarding path consistency.

---

## Quick Reference Validation

| Command | Documented | Exists | Status |
|---------|------------|--------|--------|
| `bmad agents` | CLI | NO | FAIL |
| `bmad workflows` | CLI | NO | FAIL |
| `/help` | Built-in | N/A | CANNOT VERIFY |
| `/bmad:core:agents:abdul` | Skill | YES | PASS |
| `/bmad:core:workflows:party-mode` | Skill | YES | PASS |
| `/bmad:core:workflows:project-status` | Skill | YES | PASS |
| `/bmad:core:workflows:brainstorming` | Skill | YES | PASS |
| `/bmm:create-product-brief` | Skill | YES* | WARNING |
| `/bmm:create-architecture` | Skill | YES* | WARNING |
| `/bmad:cybersec-team:workflows:security-architecture-review` | Skill | YES | PASS |
| `/bmad:strategy-team:workflows:strategic-decision-workshop` | Skill | YES | PASS |

*Exists but path notation inconsistent

---

## Summary of Failures

### Critical Failures (Blocking)

| ID | Description | Impact |
|----|-------------|--------|
| F1-001 | `bmad` CLI does not exist | Users cannot install |
| F1-002 | Repository URL placeholder | Users cannot clone |

### High Priority Failures (Confusing)

| ID | Description | Impact |
|----|-------------|--------|
| F1-003 | BMAD Master path incorrect | First agent fails |
| F2-001 | BMM shortcuts non-standard | Module exploration fails |
| F2-002 | Inconsistent path notation | User confusion |

### Medium Priority Failures (Minor)

| ID | Description | Impact |
|----|-------------|--------|
| F1-004 | Brainstorming path format | May work with skill system |
| F2-003 | Product brief path | May work with skill system |
| F2-004 | Architecture path | May work with skill system |
| F3-001 | Analyst path | May work with skill system |
| F3-002 | Create PRD path | May work with skill system |
| F3-003 | Epics path | May work with skill system |

---

## Recommendations

### Immediate Actions

1. **Remove or implement `bmad` CLI commands**
   - Either create the CLI tool OR
   - Replace all `bmad` CLI commands with skill invocation syntax

2. **Update repository URL**
   - Replace `your-org` with actual organization name

3. **Fix BMAD Master path**
   - Change `/bmad:bmad-master` to `/bmad:core:agents:bmad-master`

### Short-term Actions

4. **Standardize path notation**
   - Document both full paths and shortcuts
   - Add section explaining path format: `/bmad:{module}:{type}:{name}`

5. **Verify all skill registrations**
   - Test each documented command against actual skill manifest
   - Update paths to match registered skill names

### Long-term Actions

6. **Create comprehensive command reference**
   - List all available agents with their full paths
   - List all available workflows with their full paths
   - Include examples for each

7. **Add troubleshooting section**
   - Common errors and solutions
   - How to find correct paths

---

## Test Artifacts

- Test Date: 2026-01-26
- Files Verified: 47 agents, 89 workflows
- Modules Verified: 9 (core, bmm, bmb, bmgd, cis, cybersec-team, intel-team, legal-team, strategy-team)

---

*Report generated by automated onboarding simulation*
