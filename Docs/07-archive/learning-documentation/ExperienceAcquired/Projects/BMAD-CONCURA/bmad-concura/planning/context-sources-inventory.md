# BMAD Context Sources Inventory

**Project:** BMAD-CONCURA
**Story:** CONCURA-1.1 - Context Source Inventory
**Date:** 2026-01-17
**Author:** Winston (System Architect)

---

## Executive Summary

This inventory documents all context sources in the BMAD framework that contribute to token consumption. The analysis reveals **10.9M+ total characters** (~2.7M tokens) of potential context across the framework, with workflows being the dominant consumer.

### Key Findings

| Category | Characters | Est. Tokens | % of Total |
|----------|------------|-------------|------------|
| Workflows | 7,941,439 | ~1,985,360 | 72.5% |
| Testarch Knowledge | 909,752 | ~227,438 | 8.3% |
| Agents | 662,154 | ~165,539 | 6.0% |
| Security | 304,764 | ~76,191 | 2.8% |
| Config/Manifests | 231,214 | ~57,804 | 2.1% |
| Docs | 83,094 | ~20,774 | 0.8% |
| Reference | 63,211 | ~15,803 | 0.6% |
| Data (non-workflow) | 43,049 | ~10,762 | 0.4% |
| Teams | 25,083 | ~6,271 | 0.2% |
| Memory | 705 | ~176 | <0.1% |
| **TOTAL** | **10,956,701** | **~2,739,175** | 100% |

---

## 1. Manifest Files (AC1)

### Primary Manifests

| Manifest | Location | Characters | Est. Tokens | Entries |
|----------|----------|------------|-------------|---------|
| files-manifest.csv | `_bmad/_config/` | 102,423 | ~25,606 | 657 files |
| agent-manifest.csv | `_bmad/_config/` | 64,458 | ~16,115 | 79 agents |
| workflow-manifest.csv | `_bmad/_config/` | 29,615 | ~7,404 | 138 workflows |
| task-manifest.csv | `_bmad/_config/` | 927 | ~232 | - |
| tool-manifest.csv | `_bmad/_config/` | 52 | ~13 | - |
| **Subtotal** | | **197,475** | **~49,369** | |

### Manifest Purpose
- **files-manifest.csv**: Index of all files with content hashes for integrity verification
- **agent-manifest.csv**: Agent metadata including name, role, identity, communication style, principles
- **workflow-manifest.csv**: Workflow index with name, description, module, path
- **task-manifest.csv**: Task definitions for automation
- **tool-manifest.csv**: External tool registrations

---

## 2. Configuration Files (AC2)

### Core Configuration

| Config File | Location | Characters | Est. Tokens | Purpose |
|-------------|----------|------------|-------------|---------|
| manifest.yaml | `_bmad/_config/` | 387 | ~97 | Module registration |
| llm-config.yaml | `_bmad/_config/` | 5,043 | ~1,261 | LLM provider settings |
| claude-code.yaml | `_bmad/_config/ides/` | 161 | ~40 | IDE integration |
| config.yaml | `_bmad/_memory/` | 705 | ~176 | Memory config |

### Agent Customization Files

| Pattern | Count | Total Chars | Est. Tokens |
|---------|-------|-------------|-------------|
| `*.customize.yaml` | 36 | 32,688 | ~8,172 |

**Location:** `_bmad/_config/agents/`

Each customize.yaml is ~908 chars and provides agent-specific overrides.

### Configuration Totals

| Category | Characters | Est. Tokens |
|----------|------------|-------------|
| Manifests | 197,475 | ~49,369 |
| Core Config | 6,296 | ~1,574 |
| Agent Customization | 32,688 | ~8,172 |
| **Total Config** | **236,459** | **~59,115** |

---

## 3. Agent Files (AC3)

### Agent Count by Module

| Module | Agent Count | Characters | Est. Tokens |
|--------|-------------|------------|-------------|
| legal-team | 13 | 169,854 | ~42,464 |
| cybersec-team | 15 | 126,654 | ~31,664 |
| strategy-team | 14 | 109,681 | ~27,420 |
| intel-team | 11 | 90,081 | ~22,520 |
| bmm | 9 | 56,338 | ~14,085 |
| bmgd | 6 | 40,798 | ~10,200 |
| cis | 6 | 29,493 | ~7,373 |
| core | 2 | 17,026 | ~4,257 |
| bmb | 3 | 15,106 | ~3,777 |
| **TOTAL** | **79** | **662,154** | **~165,539** |

### Top 15 Largest Agents

| Rank | Agent | Module | Characters | Est. Tokens |
|------|-------|--------|------------|-------------|
| 1 | gremio.md | legal-team | 13,972 | ~3,493 |
| 2 | deed.md | legal-team | 13,801 | ~3,450 |
| 3 | tribute.md | legal-team | 13,720 | ~3,430 |
| 4 | baltic.md | legal-team | 13,645 | ~3,411 |
| 5 | advocate.md | legal-team | 13,517 | ~3,379 |
| 6 | iberia.md | legal-team | 13,257 | ~3,314 |
| 7 | insignia.md | legal-team | 13,251 | ~3,313 |
| 8 | castile.md | legal-team | 13,227 | ~3,307 |
| 9 | covenant.md | legal-team | 13,088 | ~3,272 |
| 10 | charter.md | legal-team | 12,906 | ~3,227 |
| 11 | abdul.md | core | 12,097 | ~3,024 |
| 12 | europa.md | legal-team | 12,041 | ~3,010 |
| 13 | corporate-intel-specialist.md | intel-team | 11,854 | ~2,964 |
| 14 | counsel.md | legal-team | 11,814 | ~2,954 |
| 15 | liberty.md | legal-team | 11,615 | ~2,904 |

**Observation:** Legal team agents are notably larger (avg ~12,700 chars) due to jurisdiction-specific legal knowledge embedded in each agent.

---

## 4. Workflow Files (AC4)

### Workflow File Type Breakdown

| File Type | Count | Characters | Est. Tokens | % of Workflows |
|-----------|-------|------------|-------------|----------------|
| Step files (step-*.md) | 631 | 5,059,715 | ~1,264,929 | 63.7% |
| Instruction files | 54 | 728,628 | ~182,157 | 9.2% |
| Main workflow.md/.yaml | 143 | 544,117 | ~136,029 | 6.9% |
| Checklist files | 35 | 223,314 | ~55,829 | 2.8% |
| Data files (yaml) | 29 | 186,258 | ~46,565 | 2.3% |
| Template files | 7 | 16,251 | ~4,063 | 0.2% |
| Other workflow files | - | 1,183,156 | ~295,789 | 14.9% |
| **TOTAL** | **899** | **7,941,439** | **~1,985,360** | 100% |

### Workflows by Module

| Module | File Count | Characters | Est. Tokens |
|--------|------------|------------|-------------|
| intel-team | 137 | 1,546,611 | ~386,653 |
| bmm | 153 | 1,365,271 | ~341,318 |
| cybersec-team | 166 | 1,250,624 | ~312,656 |
| strategy-team | 182 | 1,164,352 | ~291,088 |
| bmgd | 131 | 782,554 | ~195,639 |
| bmb | 125 | 652,290 | ~163,073 |
| legal-team | 85 | 258,282 | ~64,571 |
| core | 28 | 223,415 | ~55,854 |
| cis | 13 | 58,486 | ~14,622 |

### YAML vs Markdown Workflows

| Module | YAML Files | YAML Chars | MD Files | MD Chars |
|--------|------------|------------|----------|----------|
| core | 20 | 141,392 | 28 | 82,023 |
| bmm | 34 | 70,668 | 153 | 1,294,603 |
| bmgd | 32 | 67,210 | 131 | 715,344 |
| cis | 4 | 4,485 | 13 | 54,001 |
| bmb | 1 | 1,644 | 125 | 650,646 |
| cybersec-team | 0 | 0 | 166 | 1,250,624 |
| intel-team | 0 | 0 | 137 | 1,546,611 |
| legal-team | 0 | 0 | 85 | 258,282 |
| strategy-team | 0 | 0 | 182 | 1,164,352 |

**Observation:** Specialized teams (cybersec, intel, legal, strategy) use pure markdown workflows, while platform modules (core, bmm, bmgd) use a mix of YAML+MD.

### Top 20 Largest Workflow Files

| Rank | File | Module | Characters | Est. Tokens |
|------|------|--------|------------|-------------|
| 1 | retrospective/instructions.md | bmm | 60,618 | ~15,155 |
| 2 | retrospective/instructions.md | bmgd | 60,600 | ~15,150 |
| 3 | cross-module-groups.yaml | core | 43,929 | ~10,982 |
| 4 | testarch/automate/instructions.md | bmm | 44,221 | ~11,055 |
| 5 | full-scan-instructions.md | bmm | 42,971 | ~10,743 |
| 6 | step-07b-recovery-and-closure.md | cybersec | 42,356 | ~10,589 |
| 7 | testarch/trace/instructions.md | bmm | 35,974 | ~8,994 |
| 8 | step-07a-post-incident.md | cybersec | 33,686 | ~8,422 |
| 9 | game-architecture/instructions.md | bmgd | 29,020 | ~7,255 |
| 10 | step-06a-recovery.md | cybersec | 28,336 | ~7,084 |
| 11 | step-05a-eradication.md | cybersec | 28,171 | ~7,043 |
| 12 | party-mode-synergies.yaml | core | 27,851 | ~6,963 |
| 13 | step-06b-eradication.md | cybersec | 27,767 | ~6,942 |
| 14 | osint-knowledgebase.md | intel-team | 25,469 | ~6,367 |
| 15 | campaign-ai/workflow.md | intel-team | 15,157 | ~3,789 |
| 16 | campaign-planner-person/workflow.md | intel-team | 15,050 | ~3,763 |
| 17 | campaign-planner-org/workflow.md | intel-team | 14,394 | ~3,599 |
| 18 | operation-mosaic/workflow.md | intel-team | 12,986 | ~3,247 |
| 19 | counter-intel-audit/workflow.md | intel-team | 12,774 | ~3,194 |
| 20 | threat-constellation/workflow.md | intel-team | 11,970 | ~2,993 |

---

## 5. Skill Registration Mechanism (AC5)

### How Skills Are Registered

Skills in BMAD are registered through the Claude Code Skill tool, which provides a dynamic list of available skills in its description. Based on the system context, the skill list includes:

**Skill List Token Cost Estimate:**
- The skill list in the Skill tool description contains ~251 skills
- Visible in system prompt: 112 skills shown (truncated)
- Each skill entry contains: name, description, module path
- Average skill entry: ~150 characters

**Estimated Skill List Context:**
```
251 skills x ~150 chars = ~37,650 characters
Est. Tokens: ~9,413
```

### Skill Categories

| Module | Skill Count | Description |
|--------|-------------|-------------|
| core | 14 | Project management, orchestration |
| intel-team | 34 | OSINT, attribution, surveillance |
| legal-team | 20 | Contracts, compliance, jurisdictions |
| strategy-team | 28 | Decision making, negotiation |
| bmm | 24 | Software development workflows |
| bmgd | 18 | Game development workflows |
| bmb | 6 | Module/agent/workflow building |
| cis | 4 | Creative innovation |
| cybersec-team | ~100+ | Security assessments |

### Skill Loading Pattern

Skills are loaded **on-demand** when invoked via the Skill tool:
1. Skill list is included in Skill tool description (always present)
2. When skill is invoked, its workflow.md is loaded
3. Workflow may load additional step files, data, templates

**Context Impact:**
- Base overhead: ~9,413 tokens (skill list in tool description)
- Per-invocation: Varies by workflow complexity (500-15,000 tokens)

---

## 6. CLAUDE.md and Project Context Loading (AC6)

### CLAUDE.md Status

**Finding:** No CLAUDE.md file exists at the project root or in any subdirectory.

```bash
find /Users/paultinp/BMAD-CYBER2 -name "CLAUDE.md"
# Result: No files found
```

However, the system context shows a `claudeMd` section containing project instructions from `/Users/paultinp/CLAUDE.md` - this appears to be a user-level CLAUDE.md loaded from the home directory, not the project.

### Project Context Loading Patterns

1. **Home Directory CLAUDE.md** (if exists)
   - Loaded at session start
   - Contains project-specific guidelines
   - Current size: ~35,000+ characters visible in prompt

2. **settings.json / settings.local.json**
   - Location: `.claude/`
   - Contains hook configurations
   - settings.json: 7,855 chars
   - settings.local.json: 18,321 chars

3. **Validator/Hook Scripts**
   - Python validators: 429,852 chars
   - Node validators: 412,972 chars
   - **NOT loaded into LLM context** - executed as subprocess hooks

4. **Git Status**
   - Automatically included at session start
   - Shows branch, modified files, recent commits
   - Typically 1,000-5,000 characters

---

## 7. Context Source Map - Load Order and Dependencies (AC7)

### Context Loading Sequence

```
SESSION START
    |
    v
+-------------------+
| 1. System Prompt  | (Claude Code's base instructions)
|    ~15,000 chars  |
+-------------------+
    |
    v
+-------------------+
| 2. CLAUDE.md      | (Home dir + project if exists)
|    ~35,000 chars  |
+-------------------+
    |
    v
+-------------------+
| 3. Tool Defs      | (All tool descriptions + Skill list)
|    ~50,000 chars  |
+-------------------+
    |
    v
+-------------------+
| 4. Git Status     | (Current branch, changes, commits)
|    ~3,000 chars   |
+-------------------+
    |
    |
    v (ON SKILL INVOCATION)
+-------------------+
| 5. Workflow Entry | (workflow.md or workflow.yaml)
|    3,000-15,000   |
+-------------------+
    |
    v (DURING WORKFLOW)
+-------------------+
| 6. Step Files     | (step-01.md, step-02.md, etc.)
|    2,000-10,000   |
+-------------------+
    |
    v (AS NEEDED)
+-------------------+
| 7. Data/Templates | (CSV, YAML, templates)
|    Variable       |
+-------------------+
    |
    v (FOR AGENTS)
+-------------------+
| 8. Agent File     | (agent.md)
|    5,000-14,000   |
+-------------------+
```

### Dependency Graph

```
manifest.yaml
    |
    +---> agent-manifest.csv ---> Individual agent.md files
    |
    +---> workflow-manifest.csv ---> workflow.md/yaml
    |                                    |
    |                                    +---> step-*.md files
    |                                    |
    |                                    +---> data/*.yaml
    |                                    |
    |                                    +---> templates/*.md
    |                                    |
    |                                    +---> knowledge/*.md
    |
    +---> files-manifest.csv (integrity verification)
    |
    +---> llm-config.yaml (provider routing)
```

### Context Accumulation Example

**Scenario:** User invokes `/campaign-planner-person` (intel-team workflow)

| Load Stage | What's Added | Cumulative Est. Tokens |
|------------|--------------|------------------------|
| Base | System + CLAUDE.md + Tools | ~25,000 |
| + Skill list | Tool descriptions | ~34,000 |
| + Git status | Branch/changes | ~34,800 |
| + Workflow | campaign-planner-person/workflow.md | ~38,500 |
| + Step 1 | Init step | ~40,500 |
| + Agent | osint-lead.md | ~42,500 |
| + Knowledge | osint-knowledgebase.md | ~48,900 |
| ... | Additional steps | ~60,000+ |

---

## 8. Top 10 Largest Token Consumers

### Single Files

| Rank | File | Category | Characters | Est. Tokens |
|------|------|----------|------------|-------------|
| 1 | files-manifest.csv | Config | 102,423 | ~25,606 |
| 2 | MANIFEST.sha256 | Security | 96,126 | ~24,032 |
| 3 | agent-manifest.csv | Config | 64,458 | ~16,115 |
| 4 | retrospective/instructions.md | Workflow | 60,618 | ~15,155 |
| 5 | retrospective/instructions.md | Workflow | 60,600 | ~15,150 |
| 6 | testarch/automate/instructions.md | Workflow | 44,221 | ~11,055 |
| 7 | cross-module-groups.yaml | Workflow | 43,929 | ~10,982 |
| 8 | full-scan-instructions.md | Workflow | 42,971 | ~10,743 |
| 9 | step-07b-recovery-and-closure.md | Workflow | 42,356 | ~10,589 |
| 10 | testarch/trace/instructions.md | Workflow | 35,974 | ~8,994 |

### Categories Ranked by Total Size

| Rank | Category | Characters | Est. Tokens |
|------|----------|------------|-------------|
| 1 | Workflows | 7,941,439 | ~1,985,360 |
| 2 | Testarch Knowledge | 909,752 | ~227,438 |
| 3 | Agents | 662,154 | ~165,539 |
| 4 | Security | 304,764 | ~76,191 |
| 5 | Config/Manifests | 231,214 | ~57,804 |
| 6 | Docs | 83,094 | ~20,774 |
| 7 | Reference | 63,211 | ~15,803 |
| 8 | Data (non-workflow) | 43,049 | ~10,762 |
| 9 | Teams | 25,083 | ~6,271 |
| 10 | Memory | 705 | ~176 |

---

## 9. Additional Context Sources

### Validators (NOT loaded into LLM context)

These are executed as subprocess hooks, not loaded into the prompt:

| Category | Files | Total Chars | Purpose |
|----------|-------|-------------|---------|
| Python validators | 22 | 429,852 | Security checks |
| Node validators | ~15 | 412,972 | Security checks |
| **Total** | **~37** | **842,824** | - |

### Hook Configuration

| File | Location | Chars | Purpose |
|------|----------|-------|---------|
| settings.json | `.claude/` | 7,855 | Hook definitions |
| settings.local.json | `.claude/` | 18,321 | Local overrides |

### Testarch Knowledge Base

Specialized testing knowledge (loaded on-demand):

| Content Type | Files | Characters | Est. Tokens |
|--------------|-------|------------|-------------|
| Test knowledge | 48 | 634,998 | ~158,750 |
| Testarch workflows | 16 | 274,754 | ~68,689 |
| **Total** | **64** | **909,752** | **~227,438** |

---

## 10. Optimization Recommendations

Based on this inventory, key optimization targets:

### High Impact (Reduce Base Load)
1. **Skill list optimization** - 9,413 tokens always present
2. **Manifest size reduction** - files-manifest.csv alone is 25,606 tokens
3. **Agent-manifest.csv** - Contains full persona text, could be lazy-loaded

### Medium Impact (Reduce Per-Invocation Load)
4. **Step file consolidation** - 631 step files totaling 1.2M tokens
5. **Instruction file optimization** - 54 files, 182K tokens
6. **Duplicate content** (e.g., two identical retrospective/instructions.md)

### Low-Hanging Fruit
7. **Remove MANIFEST.sha256 from manifest** - 24K tokens, integrity file not needed in context
8. **Lazy-load knowledge bases** - 227K tokens in testarch alone
9. **Compress cross-module-groups.yaml** - Single file at 11K tokens

---

## Appendix A: File Type Distribution

| Extension | Count | Primary Use |
|-----------|-------|-------------|
| .md | 1,198 | Workflows, agents, docs |
| .yaml | 162 | Config, workflow data |
| .csv | 37 | Manifests, data tables |
| .xml | 12 | Unknown |
| .js | 6 | Tooling |
| .ts | 3 | Validators |
| .asc | 3 | Keys/signatures |
| .sh | 2 | Scripts |
| .json | 2 | Config |
| .sha256 | 1 | Integrity |

---

## Appendix B: Module Summary

| Module | Agents | Workflows | Total Chars | Est. Tokens |
|--------|--------|-----------|-------------|-------------|
| cybersec-team | 15 | 166 | 1,377,278 | ~344,320 |
| intel-team | 11 | 137 | 1,636,692 | ~409,173 |
| bmm | 9 | 153 | 1,421,609 | ~355,402 |
| strategy-team | 14 | 182 | 1,274,033 | ~318,508 |
| bmgd | 6 | 131 | 823,352 | ~205,838 |
| bmb | 3 | 125 | 667,396 | ~166,849 |
| legal-team | 13 | 85 | 428,136 | ~107,034 |
| core | 2 | 28 | 240,441 | ~60,110 |
| cis | 6 | 13 | 87,979 | ~21,995 |

---

*Document generated by Winston, System Architect*
*BMAD-CONCURA Project - Context Optimization Initiative*
