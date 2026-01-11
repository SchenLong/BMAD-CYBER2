# Module Rename Plan: Standardizing Module Names

**Date:** 2026-01-11
**Status:** DRAFT - Awaiting Approval
**Estimated Complexity:** High (100+ files affected)

---

## Executive Summary

This plan covers:
1. **Module Renaming** - Standardizing 2 module names to use `-team` suffix
2. **Agent Renaming** - Renaming "Joseph" to "Giuseppe" in exec-ops (to be renamed strategy-team)
3. **Validation** - Full 7-phase validation per Lessons Learned

---

## Rename Mapping

### Module Renaming

| Current Name | New Name | Rationale |
|--------------|----------|-----------|
| `cyber-ops` | `cybersec-team` | Standardize to `-team` suffix |
| `exec-ops` | `strategy-team` | Standardize to `-team` suffix |
| `intel-team` | `intel-team` | Already compliant (no change) |
| `legal-team` | `legal-team` | Already compliant (no change) |

### Agent Renaming

| Module | Current Name | New Name | Agent File |
|--------|--------------|----------|------------|
| strategy-team (was exec-ops) | Joseph | Giuseppe | `communications-director.md` |

---

## Lessons Learned Considerations

Per `_bmad/bmb/ExperienceAcquired/LessonsLearned.md`:

- **Lesson 6**: Mandatory 7-Phase Validation Before Production Release
- **Lesson 7**: Always Retest After Applying a Fix
- **Lesson 10**: Mandatory Security Rule Testing Protocol (6 attack vectors)
- **Lesson 11**: Documentation Synchronization (docs/ first, then README)
- **Lesson 13**: Mandatory Roadmap Synchronization
- **Lesson 14**: Complete Documentation Update on Module Changes

---

## Phase 1: Directory Renaming

### 1.1 Rename Module Directories

```bash
# Rename cyber-ops to cybersec-team
mv _bmad/cyber-ops _bmad/cybersec-team

# Rename exec-ops to strategy-team
mv _bmad/exec-ops _bmad/strategy-team
```

### 1.2 Rename Claude Command Directories

```bash
mv .claude/commands/bmad/cyber-ops .claude/commands/bmad/cybersec-team
mv .claude/commands/bmad/exec-ops .claude/commands/bmad/strategy-team
```

---

## Phase 2: Configuration File Updates

### 2.1 Global Manifest (`_bmad/_config/manifest.yaml`)

Update module list:
- `cyber-ops` → `cybersec-team`
- `exec-ops` → `strategy-team`

### 2.2 Module Config Files

#### cybersec-team (was cyber-ops)

| File | Updates |
|------|---------|
| `_bmad/cybersec-team/config.yaml` | `module_name: cybersec-team`, `full_name: Cybersecurity Team Module` |
| `_bmad/cybersec-team/module.yaml` | `code: "cybersec-team"`, `name: "Cybersecurity Team"` |

#### strategy-team (was exec-ops)

| File | Updates |
|------|---------|
| `_bmad/strategy-team/config.yaml` | `module_name: strategy-team`, `full_name: Strategy Team Module` |
| `_bmad/strategy-team/module.yaml` | Create if missing, `code: "strategy-team"` |

### 2.3 CSV Manifests (`_bmad/_config/`)

| File | Updates |
|------|---------|
| `agent-manifest.csv` | Replace module column: `cyber-ops` → `cybersec-team`, `exec-ops` → `strategy-team` |
| `workflow-manifest.csv` | Replace module column and paths |
| `files-manifest.csv` | Update all file paths |

---

## Phase 3: Agent File Updates

### 3.1 All Agent Files in cybersec-team

Update path references in all 15 agents:
- `_bmad/cybersec-team/agents/*.md`
- Replace `cyber-ops` with `cybersec-team` in file paths

### 3.2 All Agent Files in strategy-team

Update path references in all 14 agents:
- `_bmad/strategy-team/agents/*.md`
- Replace `exec-ops` with `strategy-team` in file paths

### 3.3 Joseph → Giuseppe Rename

Update `_bmad/strategy-team/agents/communications-director.md`:
- `name: "Joseph"` → `name: "Giuseppe"`
- Update any persona references from Joseph to Giuseppe

---

## Phase 4: Workflow File Updates

### 4.1 cybersec-team Workflows (13 workflows)

For each workflow in `_bmad/cybersec-team/workflows/`:
- Update `workflow.md` - paths and module references
- Update all `steps/*.md` files - `workflow_path` and module references
- Update `README.md` files - command examples

**Affected Files Pattern:**
- `_bmad/cybersec-team/workflows/*/workflow.md`
- `_bmad/cybersec-team/workflows/*/steps/step-*.md`
- `_bmad/cybersec-team/workflows/*/README.md`

### 4.2 strategy-team Workflows (16 workflows)

For each workflow in `_bmad/strategy-team/workflows/`:
- Same updates as above
- ALSO update all "Joseph" references to "Giuseppe" (53 files identified)

**Giuseppe Files to Update:**
- `workflows/board-presentation-prep/*` - 6 files
- `workflows/strategic-decision-workshop/*` - 3 files
- `workflows/crisis-response-planning/*` - 6 files
- `workflows/competitive-warfare/*` - 2 files
- `workflows/corporate-political-game/*` - 4 files
- `workflows/stakeholder-negotiation-prep/*` - 5 files
- `workflows/leadership-transition-planning/*` - 2 files
- `workflows/board-relations-management/*` - 2 files
- `workflows/ma-due-diligence/*` - 2 files
- `workflows/political-risk-assessment/*` - 1 file
- `workflows/policy-development/*` - 1 file
- `workflows/_shared/agent-roster.md`
- `workflows/_shared/party-mode-presets.md`
- `workflows/_shared/templates/*.md` - 6 template files

---

## Phase 5: Cross-Module Reference Updates

### 5.1 Other Modules Referencing Renamed Modules

Check and update references in:
- `_bmad/bmm/teams/default-party.csv` - Joseph → Giuseppe
- `_bmad/cis/teams/default-party.csv` - Joseph → Giuseppe
- `_bmad/core/workflows/party-mode/` - module references
- `_bmad/core/workflows/brainstorming/` - module references

### 5.2 Legal-Team Module

Update any references to:
- `cyber-ops` → `cybersec-team`
- `exec-ops` → `strategy-team`

### 5.3 Intel-Team Module

Update any references to:
- `cyber-ops` → `cybersec-team`
- `exec-ops` → `strategy-team`

---

## Phase 6: Documentation Updates

**Order per Lesson 11:** docs/ FIRST, then README.md LAST

### 6.1 docs/ Files

| File | Updates |
|------|---------|
| `docs/AGENTS.md` | All module references, Joseph → Giuseppe |
| `docs/WORKFLOWS.md` | All module references and command examples |
| `docs/GETTING-STARTED.md` | All command examples and references |

### 6.2 Roadmap Files

| File | Updates |
|------|---------|
| `docs/roadmaps/cyber-ops-roadmap.md` | Rename to `cybersec-team-roadmap.md`, update content |
| `docs/roadmaps/exec-ops-roadmap.md` | Rename to `strategy-team-roadmap.md`, update content |
| `docs/roadmaps/framework-roadmap.md` | Update module references |

### 6.3 Module README Files

| File | Updates |
|------|---------|
| `_bmad/cybersec-team/README.md` | Update all command examples and references |
| `_bmad/strategy-team/README.md` | Update all command examples and references, Joseph → Giuseppe |

### 6.4 Root README.md (LAST)

Update:
- Module overview table
- All command examples
- Module structure section
- Workflow visualization
- All references to cyber-ops → cybersec-team
- All references to exec-ops → strategy-team
- Joseph → Giuseppe in exec-ops/strategy-team section

---

## Phase 7: Validation Testing

### 7.1 Automated Checks (Validation Phase 1)

```bash
# Verify no orphaned references remain
grep -r "cyber-ops" _bmad/
grep -r "exec-ops" _bmad/
grep -r "Joseph" _bmad/

# Verify new names exist
ls _bmad/cybersec-team/
ls _bmad/strategy-team/
```

### 7.2 Module Validation (Phases 2-6)

Run full 7-phase validation for each renamed module:
- `cybersec-team` - Full validation
- `strategy-team` - Full validation
- `intel-team` - Quick validation (no changes)
- `legal-team` - Quick validation (no changes)

### 7.3 Security Testing (Phase 10)

Run 6 attack vector tests on updated agents:
1. Direct Prompt Injection
2. Role Hijacking
3. Authority Spoofing
4. Encoded Payload
5. Privilege Escalation
6. Indirect Injection

### 7.4 Validation Log

Create validation logs:
- `docs/ValidationLog/cybersec-team-v1.3.2-validation-2026-01-11.md`
- `docs/ValidationLog/strategy-team-v1.3.1-validation-2026-01-11.md`
- `docs/ValidationLog/module-rename-validation-2026-01-11.md`

---

## Implementation Order (Recommended)

1. **Backup** - Create git branch for rollback
2. **Phase 1** - Directory renaming (blocking - must do first)
3. **Phase 2** - Configuration file updates
4. **Phase 3** - Agent file updates (including Giuseppe)
5. **Phase 4** - Workflow file updates
6. **Phase 5** - Cross-module reference updates
7. **Phase 6** - Documentation updates (docs/ first, README last)
8. **Phase 7** - Validation testing
9. **Commit** - Single commit with all changes

---

## Estimated File Count

| Category | Estimated Files |
|----------|-----------------|
| Directory renames | 4 directories |
| Config files | 8-10 files |
| CSV manifests | 3 files (~850 row updates) |
| Agent files | 29 files (15 + 14) |
| Workflow files (cyber-ops) | ~120 step files + 13 workflow.md + 13 README.md |
| Workflow files (exec-ops) | ~122 step files + 16 workflow.md + 16 README.md + 53 Giuseppe refs |
| Cross-module refs | ~10 files |
| Documentation | ~8 files |
| Roadmaps | 3 files |
| **Total Estimated** | **~400+ files** |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Missed references | Use comprehensive grep/search before commit |
| Breaking skill invocations | Test all `/bmad:module:workflow` commands |
| Claude command wrapper issues | Verify `.claude/commands/bmad/` structure |
| Validation failures | Run full 7-phase validation before commit |

---

## Rollback Plan

```bash
# If issues found post-implementation
git checkout main -- _bmad/cyber-ops _bmad/exec-ops
git checkout main -- .claude/commands/bmad/cyber-ops .claude/commands/bmad/exec-ops
git checkout main -- docs/ README.md
```

---

## Approval Checklist

- [ ] Plan reviewed by user
- [ ] Backup strategy confirmed
- [ ] Estimated scope acceptable
- [ ] Validation approach approved
- [ ] Ready to proceed

---

**Prepared by:** Claude (Module Rename Planning)
**Date:** 2026-01-11
