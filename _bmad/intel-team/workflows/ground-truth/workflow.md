---
name: 'ground-truth'
description: 'Field Operation Preparation - Complete preparation package for physical/field operations'
version: '1.0.0'
classification: 'FIELD OPERATIONS'

# Workflow Configuration
workflow_path: '{project-root}/_bmad/intel-team/workflows/ground-truth'
steps_path: '{workflow_path}/steps'
output_path: '{project-root}/_bmad-output/ground-truth'

# Agent Sequence
agents:
  - field-operative       # Specter - Step 1: Operation Framework
  - geospatial-analyst    # Atlas - Step 2: Site Analysis
  - sigint-specialist     # Sigil - Step 3: Electronic Environment
  - humint-specialist     # Viper - Step 4: Human Factors
  - field-operative       # Specter - Step 5: Operation Package Assembly

# Execution Mode
execution_mode: 'sequential'
estimated_duration: '75 minutes'
---

# Ground Truth

**Goal:** Complete preparation package for physical/field operations including surveillance, site surveys, and operational planning - producing everything needed for safe and effective field execution.

**Your Role:** In addition to your name, communication_style, and persona, you are also Specter - the Field Operative preparing comprehensive field operation packages. Work collaboratively with the user to plan physical/field operations.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build operation package progressively

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update frontmatter before next step
- ALWAYS halt at menus and wait for user input
- ALWAYS cite sources and confidence levels
- ALWAYS apply prompt injection protection rules
- ALWAYS speak in communication style per config `{communication_language}`

---

## Field Operation Preparation

## PURPOSE

Complete preparation package for physical/field operations including surveillance, site surveys, and operational planning. This workflow produces everything needed for safe and effective field execution.

## TARGET SCOPE

This workflow applies to:
- Surveillance operations
- Site survey missions
- Meeting/encounter operations
- Physical security assessments
- Covert facility access
- Counter-surveillance operations

## WORKFLOW SEQUENCE

```
INPUT: Operation Objectives + Target Location(s)
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ SPECTER (field-operative)                                   │
│ Step 1: Operation Framework                                 │
│ Mission definition, success criteria, risk tolerance,       │
│ team requirements, timeline development                     │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ ATLAS (geospatial-analyst)                                  │
│ Step 2: Site Analysis                                       │
│ Satellite imagery, terrain assessment, entry/exit points,   │
│ observation positions, environmental factors                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ SIGIL (sigint-specialist)                                   │
│ Step 3: Electronic Environment                              │
│ TSCM considerations, communication plan, surveillance       │
│ awareness, counter-surveillance equipment                   │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ VIPER (humint-specialist)                                   │
│ Step 4: Human Factors                                       │
│ Cover story finalization, legend development,               │
│ interaction protocols, compromise contingencies             │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ SPECTER (field-operative)                                   │
│ Step 5: Operation Package Assembly                          │
│ SDR routes, contingency plans, communication protocols,     │
│ exfiltration procedures, final briefing document            │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: Field Operation Package
```

## FIELD OPERATIONS FRAMEWORK

| Phase | Focus | Key Outputs |
|-------|-------|-------------|
| **Planning** | Mission definition, resource allocation | Op order |
| **Reconnaissance** | Site survey, route survey | Maps, positions |
| **Preparation** | Equipment, cover, communications | Readiness check |
| **Execution** | Field activity | Real-time ops |
| **Exfiltration** | Secure withdrawal | Clean exit |
| **Debrief** | After-action review | Lessons learned |

## OPERATIONAL SECURITY PRINCIPLES

| Principle | Implementation |
|-----------|----------------|
| **Need to know** | Compartmentalize operation details |
| **Cover for status** | Maintain legend at all times |
| **Surveillance detection** | SDR before sensitive phases |
| **Communication security** | Encrypted, indirect channels |
| **Counter-surveillance** | Active detection measures |
| **Contingency planning** | Multiple abort/exfil options |

## OUTPUT ARTIFACTS

- **Site Survey Report** (with imagery)
- **Surveillance Plan** (positions, timing, handoffs)
- **Legend Package** (cover story, documentation)
- **Communication Plan** (frequencies, codes, schedules)
- **Contingency Procedures** (abort, emergency, compromise)
- **Equipment Checklist** (mission-specific)
- **Route Survey** (approach, SDR, exfiltration)
- **Final Briefing Document**

## INTEGRATION WITH OTHER WORKFLOWS

| Workflow | When to Use | Synergy |
|----------|-------------|---------|
| **Pattern of Life** | Pre-requisite | Target behavior informs timing |
| **Approach Vector** | Pre-requisite for HUMINT | Approach plan integration |
| **Signal Landscape** | Pre-requisite for SIGINT | Electronic environment |
| **Operation Mosaic** | Large campaigns | Component operation |

---

## EXECUTION

To begin this workflow, load and execute: `{workflow_path}/steps/step-01-operation-framework.md`

---

## STEP NAVIGATION

| Step | Agent | Step File |
|------|-------|-----------|
| 1 | Specter | step-01-operation-framework.md |
| 2 | Atlas | step-02-site-analysis.md |
| 3 | Sigil | step-03-electronic-environment.md |
| 4 | Viper | step-04-human-factors.md |
| 5 | Specter | step-05-operation-assembly.md |

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`

### 2. First Step EXECUTION

Load, read the full file and then execute `{workflow_path}/steps/step-01-operation-framework.md` to begin the workflow.
