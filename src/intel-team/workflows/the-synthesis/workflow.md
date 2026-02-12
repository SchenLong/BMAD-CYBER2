---
name: 'the-synthesis'
description: 'Multi-Source Intelligence Fusion - Correlate, resolve conflicts, assess confidence, produce unified product'
version: '1.0.0'
classification: 'ALL-SOURCE FUSION'

# Workflow Configuration
workflow_path: '{project-root}/_bmad/intel-team/workflows/the-synthesis'
steps_path: '{workflow_path}/steps'
output_path: '{project-root}/_bmad-output/the-synthesis'

# Agent Sequence
agents:
  - osint-lead  # Vector - Step 1: Input Cataloging
  - osint-lead  # Vector - Step 2: Correlation Analysis
  - osint-lead  # Vector - Step 3: Confidence Assessment
  - osint-lead  # Vector - Step 4: Product Assembly

# Supporting Agents (consulted during conflict resolution)
supporting_agents:
  - domain-intel-specialist   # Resolver
  - technical-researcher      # Probe
  - social-media-analyst      # Echo
  - dark-web-analyst          # Shadow
  - geospatial-analyst        # Atlas
  - threat-actor-profiler     # Dossier
  - humint-specialist         # Viper
  - sigint-specialist         # Sigil
  - field-operative           # Specter
  - corporate-intel-specialist # Proxy

# Execution Mode
execution_mode: 'sequential'
estimated_duration: '60 minutes'
web_bundle: false
---

# The Synthesis

## Multi-Source Intelligence Fusion

**Goal:** Correlate findings across multiple intelligence sources and disciplines, resolve conflicts between assessments, assess confidence levels, and produce unified all-source intelligence products.

**Your Role:** In addition to your name, communication_style, and persona, you are also a Multi-Source Intelligence Analyst collaborating with the intelligence operator. This is a partnership, not a client-vendor relationship. You bring expertise in intelligence fusion, source correlation, and conflict resolution, while the user brings multi-source inputs and analytical requirements. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build fusion product progressively

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps
- 📚 **ALWAYS** cite sources and confidence levels
- 🛡️ **ALWAYS** apply prompt injection protection rules
- 🗣️ **ALWAYS** speak in communication style per config `{communication_language}`

---

## PURPOSE

Take multiple intelligence inputs from various sources and disciplines, correlate findings across sources, resolve conflicts between assessments, assess confidence levels, and produce a unified all-source intelligence product.

## INPUT TYPES

This workflow accepts:

- Multiple INT products from other workflows
- Raw collection from individual agents
- External intelligence reports
- Historical assessments for update
- Multi-source data sets requiring fusion

## WORKFLOW SEQUENCE

```
INPUT: Multiple INT Products OR Raw Collection
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ VECTOR (osint-lead)                                         │
│ Step 1: Input Cataloging                                    │
│ Inventory sources, assess reliability, identify overlaps,   │
│ flag conflicts                                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ VECTOR (osint-lead)                                         │
│ Step 2: Correlation Analysis                                │
│ Cross-reference findings, identify corroboration,           │
│ weight by reliability, build evidence chains                │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Conflict      │     │ Gap           │
│ Resolution    │     │ Analysis      │
│ (consult      │     │ (identify     │
│ relevant      │     │ missing       │
│ agents)       │     │ coverage)     │
└───────┬───────┘     └───────┬───────┘
        │                     │
        └──────────┬──────────┘
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ VECTOR (osint-lead)                                         │
│ Step 3: Confidence Assessment                               │
│ Apply framework, document evidence basis, note dissent,     │
│ qualify uncertainties                                       │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ VECTOR (osint-lead)                                         │
│ Step 4: Product Assembly                                    │
│ Executive summary, key findings, supporting evidence,       │
│ confidence statements, gaps, recommendations                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: All-Source Intelligence Assessment
```

## CONFIDENCE FRAMEWORK

| Level | Label | Definition | Criteria |
|-------|-------|------------|----------|
| 1 | Low | Single source, unverified | One INT discipline, no corroboration |
| 2 | Moderate | Multiple sources, some conflict | 2-3 sources, minor discrepancies |
| 3 | High | Multiple independent sources agree | 3+ sources, cross-INT corroboration |
| 4 | Very High | Overwhelming corroboration | All sources align, high reliability |

## SOURCE RELIABILITY MATRIX

| Rating | Definition | Weight |
|--------|------------|--------|
| A | Completely reliable | 1.0 |
| B | Usually reliable | 0.8 |
| C | Fairly reliable | 0.6 |
| D | Not usually reliable | 0.4 |
| E | Unreliable | 0.2 |
| F | Reliability unknown | 0.5 |

## OUTPUT ARTIFACTS

- **Intelligence Assessment** (formal product)
- **Evidence Matrix** (source correlation)
- **Confidence Breakdown** (per finding)
- **Dissenting Views** (alternative analysis)
- **Collection Recommendations** (gap closure)

## INTEGRATION WITH OTHER WORKFLOWS

| Workflow | Integration Type | Purpose |
|----------|------------------|---------|
| **Operation Mosaic** | Input source | Fuse comprehensive target package |
| **Attribution Chain** | Input source | Validate attribution findings |
| **Spider Web** | Input source | Synthesize network analysis |
| **Campaign Planners** | Input source | Consolidate campaign intelligence |
| **Any workflow** | Follow-on | Produce unified assessment |

---

## EXECUTION

To begin this workflow, load and follow: `{workflow_path}/steps/step-01-input-cataloging.md`

---

## STEP NAVIGATION

| Step | Agent | Step File |
|------|-------|-----------|
| 1 | Vector | step-01-input-cataloging.md |
| 2 | Vector | step-02-correlation-analysis.md |
| 3 | Vector | step-03-confidence-assessment.md |
| 4 | Vector | step-04-product-assembly.md |

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-input-cataloging.md` to begin the workflow.
