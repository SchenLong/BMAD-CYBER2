# BMAD Token Consumption Baseline Measurements

**Story:** CONCURA-1.2 - Token Consumption Baseline Measurement
**Author:** Dr. Quinn (CIS - Creative Problem Solver)
**Date:** 2026-01-17
**Version:** 1.0

---

## Executive Summary

This document establishes precise token consumption baselines for common BMAD usage patterns. These measurements will serve as the foundation for validating the 5-10x improvement target set in the BMAD-CONCURA optimization initiative.

**Key Finding:** Current BMAD operations consume between **27,000 - 224,000+ tokens** depending on scenario complexity, with the agent-manifest.csv alone contributing 16,000+ tokens per session.

---

## 1. Methodology

### 1.1 Measurement Approach

Token consumption is calculated using the standard approximation:
```
tokens = characters / 4
```

This approximation is industry-standard for Claude/GPT-style tokenizers and provides a reliable baseline for comparison.

### 1.2 Loading Pattern Analysis

BMAD uses a **runtime loading pattern** where files are loaded on-demand during agent activation and workflow execution. The loading sequence follows:

1. **Agent Activation Steps** (mandatory on agent start)
2. **Manifest Loading** (for agent/workflow discovery)
3. **Workflow Execution** (when user triggers a workflow)
4. **Cross-Module Operations** (when multiple modules interact)

### 1.3 File Categories Analyzed

| Category | Description | Typical Size Range |
|----------|-------------|-------------------|
| Agent Files | Agent personas and activation instructions | 4-14 KB |
| Manifests | CSV indexes for agent/workflow discovery | 30-65 KB |
| Workflow YAML | Workflow configuration and metadata | 1-2 KB |
| Workflow Instructions | Step-by-step execution instructions | 5-60 KB |
| Core Tasks | Reusable task definitions (workflow.xml) | 20-25 KB |
| Config Files | Global configuration | 3-4 KB |

---

## 2. Scenario Measurements

### 2.1 Scenario A: Agent Activation Only (Abdul)

**Use Case:** User invokes Abdul, the Master Project Manager, without executing any workflow.

#### Files Loaded During Activation

| Step | File | Characters | Tokens |
|------|------|------------|--------|
| 1 | abdul.md (agent persona) | 12,097 | 3,024 |
| 2 | config.yaml | 3,090 | 773 |
| 4 | agent-manifest.csv | 64,458 | 16,115 |
| 5 | workflow-manifest.csv | 29,615 | 7,404 |
| 6 | project-registry.yaml (if exists) | ~1,174 | ~294 |

#### Scenario A Total

| Metric | Value |
|--------|-------|
| **Total Characters** | 110,434 |
| **Total Tokens** | **27,609** |
| **Classification** | High - manifest loading dominates |

#### Analysis
- **64%** of tokens come from manifest files alone
- Agent file is only **11%** of total consumption
- Manifests are loaded even when not all agents/workflows are needed

---

### 2.2 Scenario B: Agent + Single Workflow (Create Project)

**Use Case:** User activates Abdul and runs the "create-project" workflow.

#### Files Loaded

| Component | File | Characters | Tokens |
|-----------|------|------------|--------|
| Agent Activation | (Scenario A files) | 110,434 | 27,609 |
| Workflow Config | create-project/workflow.yaml | 1,430 | 358 |
| Workflow Engine | workflow.xml | 25,148 | 6,287 |
| Instructions | create-project/instructions.md | 17,882 | 4,471 |
| Template | project-registry.yaml (template) | 1,174 | 294 |

#### Scenario B Total

| Metric | Value |
|--------|-------|
| **Total Characters** | 156,068 |
| **Total Tokens** | **39,017** |
| **Incremental over Scenario A** | 11,408 tokens |

#### Analysis
- Workflow.xml (core engine) adds significant overhead
- Instructions file contributes 11% of total
- The workflow engine is loaded for EVERY workflow execution

---

### 2.3 Scenario C: Cross-Module Consultation (BMM + Cybersec-Team)

**Use Case:** User needs expertise from both software development (BMM) and security (Cybersec-Team) modules.

#### Files Loaded

| Component | File(s) | Characters | Tokens |
|-----------|---------|------------|--------|
| Abdul Activation | (Scenario A files) | 110,434 | 27,609 |
| Cross-Module Workflow | cross-module/workflow.yaml | 836 | 209 |
| Cross-Module Instructions | cross-module/instructions.md | 5,020 | 1,255 |
| Workflow Engine | workflow.xml | 25,148 | 6,287 |
| BMM Agents (3 typical) | architect.md + dev.md + pm.md | 18,538 | 4,635 |
| Cybersec Agents (3 typical) | security-architect.md + threat-analyst.md + penetration-tester.md | 22,501 | 5,625 |

#### Scenario C Total

| Metric | Value |
|--------|-------|
| **Total Characters** | 182,477 |
| **Total Tokens** | **45,619** |
| **Incremental over Scenario A** | 18,010 tokens |

#### Analysis
- Cross-module consultation adds 6 additional agent files
- Each agent file averages ~6,500 characters (~1,625 tokens)
- Full module loading would be significantly higher

**If ALL agents from both modules were loaded:**

| Module | Agent Count | Total Characters | Total Tokens |
|--------|-------------|-----------------|--------------|
| BMM | 9 agents | 56,338 | 14,085 |
| Cybersec-Team | 15 agents | 126,654 | 31,664 |
| **Combined** | 24 agents | 182,992 | **45,748** |

---

### 2.4 Scenario D: Party Mode with 3 Agents

**Use Case:** User activates Party Mode for a multi-agent discussion with 3 agents from different modules.

#### Files Loaded

| Component | File(s) | Characters | Tokens |
|-----------|---------|------------|--------|
| Facilitator Activation | bmad-master.md | 4,929 | 1,232 |
| Config Loading | config.yaml | 3,090 | 773 |
| Agent Manifest | agent-manifest.csv | 64,458 | 16,115 |
| Party Mode Workflow | party-mode/workflow.md | 5,980 | 1,495 |
| Step 01 | step-01-agent-loading.md | 5,221 | 1,305 |
| Step 02 | step-02-discussion-orchestration.md | 7,119 | 1,780 |
| Step 03 | step-03-graceful-exit.md | 6,730 | 1,683 |
| Presets | cross-module-groups.yaml | 43,929 | 10,982 |
| **Agent 1** (e.g., Abdul) | abdul.md | 12,097 | 3,024 |
| **Agent 2** (e.g., Bastion - Security) | security-architect.md | 7,845 | 1,961 |
| **Agent 3** (e.g., Winston - Architect) | architect.md | 5,633 | 1,408 |

#### Scenario D Total (3 Agents)

| Metric | Value |
|--------|-------|
| **Total Characters** | 167,031 |
| **Total Tokens** | **41,758** |

#### Scaling Analysis

| Agents | Est. Characters | Est. Tokens |
|--------|-----------------|-------------|
| 3 agents | 167,031 | 41,758 |
| 5 agents | 183,030 | 45,758 |
| 10 agents | 223,030 | 55,758 |
| ALL agents (~70+) | 767,000+ | **191,750+** |

**Critical Finding:** The cross-module-groups.yaml preset file alone is **44KB** (10,982 tokens), containing all possible agent combinations.

---

## 3. Top 5 Token Consumers

### 3.1 By Individual File

| Rank | File | Characters | Tokens | Category |
|------|------|------------|--------|----------|
| 1 | files-manifest.csv | 102,423 | 25,606 | Manifest |
| 2 | agent-manifest.csv | 64,458 | 16,115 | Manifest |
| 3 | cross-module-groups.yaml | 43,929 | 10,982 | Party Mode |
| 4 | workflow-manifest.csv | 29,615 | 7,404 | Manifest |
| 5 | workflow.xml | 25,148 | 6,287 | Core Task |

### 3.2 By Category (Aggregate)

| Rank | Category | Total Characters | Total Tokens | % of Total |
|------|----------|-----------------|--------------|------------|
| 1 | **All Manifests** | 196,496 | **49,124** | N/A |
| 2 | **All Agent Files** | ~800,000+ | **~200,000** | N/A |
| 3 | **Workflow Instructions** | ~500,000+ | **~125,000** | N/A |
| 4 | **Core Tasks** | ~100,000+ | **~25,000** | N/A |
| 5 | **Party Mode Presets** | 43,929 | **10,982** | N/A |

### 3.3 By Module (Agent Files Only)

| Rank | Module | Agent Count | Total Characters | Total Tokens |
|------|--------|-------------|-----------------|--------------|
| 1 | legal-team | 13 | 169,854 | 42,464 |
| 2 | cybersec-team | 15 | 126,654 | 31,664 |
| 3 | strategy-team | 14 | 109,681 | 27,420 |
| 4 | intel-team | 11 | 90,081 | 22,520 |
| 5 | bmm | 9 | 56,338 | 14,085 |

---

## 4. Summary Table

| Scenario | Description | Characters | Tokens | Context % Used* |
|----------|-------------|------------|--------|-----------------|
| A | Abdul activation only | 110,434 | 27,609 | 13.8% |
| B | Abdul + create-project workflow | 156,068 | 39,017 | 19.5% |
| C | Cross-module (BMM + Cybersec, 6 agents) | 182,477 | 45,619 | 22.8% |
| D | Party Mode (3 agents) | 167,031 | 41,758 | 20.9% |
| D+ | Party Mode (10 agents) | ~223,030 | ~55,758 | 27.9% |
| MAX | Full system load estimate | ~900,000+ | ~225,000+ | 112%+ |

*Context % assumes 200K token context window

---

## 5. Optimization Opportunities

### 5.1 High-Impact Targets

| Target | Current Tokens | Optimization Potential | Expected Savings |
|--------|---------------|----------------------|------------------|
| **Manifest Loading** | 49,124 | Lazy/selective loading | 40,000+ tokens |
| **Agent Manifest** | 16,115 | Summary index + on-demand | 14,000+ tokens |
| **Cross-Module Groups** | 10,982 | Dynamic generation | 10,000+ tokens |
| **workflow.xml** | 6,287 | Modular task loading | 4,000+ tokens |
| **Agent Files** | ~8,000 avg | Shard personas from instructions | 4,000+ per agent |

### 5.2 Optimization Strategies

1. **Manifest Sharding** - Split large manifests into module-specific indices
2. **Agent Lazy Loading** - Load agent personas only when activated
3. **Workflow Engine Modularization** - Load only required workflow.xml sections
4. **Cross-Module Preset Generation** - Generate combinations dynamically vs. storing all
5. **Agent File Restructuring** - Separate persona (small) from instructions (large)

### 5.3 Expected Impact

| Optimization | Current State | Optimized State | Improvement |
|--------------|--------------|-----------------|-------------|
| Scenario A | 27,609 tokens | ~5,000 tokens | **5.5x** |
| Scenario B | 39,017 tokens | ~8,000 tokens | **4.9x** |
| Scenario C | 45,619 tokens | ~10,000 tokens | **4.6x** |
| Scenario D | 41,758 tokens | ~7,000 tokens | **6.0x** |

---

## 6. Recommendations

### 6.1 Priority 1 - Quick Wins

1. **Remove files-manifest.csv loading** - 25,606 tokens saved immediately
2. **Implement agent summary index** - Load full agents only on activation
3. **Lazy-load workflow-manifest.csv** - Load only when listing workflows

### 6.2 Priority 2 - Architecture Changes

1. **Shard agent-manifest.csv by module** - Each module gets its own manifest
2. **Modularize workflow.xml** - Extract security directives, protocols into separate files
3. **Generate party mode presets dynamically** - Remove 44KB static YAML

### 6.3 Priority 3 - Agent Restructuring

1. **Split agent files**: `{agent}-persona.md` (500 chars) + `{agent}-instructions.md` (5000 chars)
2. **Create lightweight agent summaries** for manifest (100 chars vs 500 chars per agent)
3. **Implement agent caching** - Don't reload agents already in context

---

## 7. Validation Criteria

These baseline measurements will be used to validate optimization success:

| Metric | Baseline | Target (5x) | Stretch (10x) |
|--------|----------|-------------|---------------|
| Scenario A | 27,609 | 5,522 | 2,761 |
| Scenario B | 39,017 | 7,803 | 3,902 |
| Scenario C | 45,619 | 9,124 | 4,562 |
| Scenario D | 41,758 | 8,352 | 4,176 |

---

## Appendix A: File Size Reference

### Core Files
| File | Path | Characters | Tokens |
|------|------|------------|--------|
| config.yaml | _bmad/core/config.yaml | 3,090 | 773 |
| workflow.xml | _bmad/core/tasks/workflow.xml | 25,148 | 6,287 |
| abdul.md | _bmad/core/agents/abdul.md | 12,097 | 3,024 |
| bmad-master.md | _bmad/core/agents/bmad-master.md | 4,929 | 1,232 |

### Manifest Files
| File | Path | Characters | Tokens |
|------|------|------------|--------|
| files-manifest.csv | _bmad/_config/files-manifest.csv | 102,423 | 25,606 |
| agent-manifest.csv | _bmad/_config/agent-manifest.csv | 64,458 | 16,115 |
| workflow-manifest.csv | _bmad/_config/workflow-manifest.csv | 29,615 | 7,404 |

### Party Mode Files
| File | Characters | Tokens |
|------|------------|--------|
| workflow.md | 5,980 | 1,495 |
| step-01-agent-loading.md | 5,221 | 1,305 |
| step-02-discussion-orchestration.md | 7,119 | 1,780 |
| step-03-graceful-exit.md | 6,730 | 1,683 |
| cross-module-groups.yaml | 43,929 | 10,982 |

---

## Appendix B: Module Agent Totals

| Module | Agent Count | Total Chars | Total Tokens | Avg per Agent |
|--------|-------------|-------------|--------------|---------------|
| legal-team | 13 | 169,854 | 42,464 | 3,266 |
| cybersec-team | 15 | 126,654 | 31,664 | 2,111 |
| strategy-team | 14 | 109,681 | 27,420 | 1,959 |
| intel-team | 11 | 90,081 | 22,520 | 2,047 |
| bmm | 9 | 56,338 | 14,085 | 1,565 |
| bmgd | 6 | 40,798 | 10,200 | 1,700 |
| cis | 6 | 29,493 | 7,373 | 1,229 |
| bmb | 3 | 15,106 | 3,777 | 1,259 |
| core | 2 | 17,026 | 4,257 | 2,129 |
| **TOTAL** | **79** | **654,031** | **163,508** | **2,070** |

---

*Document generated as part of BMAD-CONCURA Token Optimization Initiative*
