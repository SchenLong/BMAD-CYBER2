---
name: 'pattern-of-life'
description: 'Behavioral Analysis & Prediction through Multi-Source Pattern Analysis'
version: '1.0.0'
classification: 'BEHAVIORAL ANALYSIS'

# Workflow Configuration
workflow_path: '{project-root}/_bmad/intel-team/workflows/pattern-of-life'
steps_path: '{workflow_path}/steps'
output_path: '{project-root}/_bmad-output/pattern-of-life'

# Agent Sequence
agents:
  - social-media-analyst  # Echo - Step 1: Digital Behavior Patterns
  - geospatial-analyst    # Atlas - Step 2: Physical Movement Patterns
  - sigint-specialist     # Sigil - Step 3: Communication Patterns
  - field-operative       # Specter - Step 4: Operational Assessment

# Execution Mode
execution_mode: 'sequential'
estimated_duration: '60 minutes'
---

# Pattern of Life

**Goal:** Build comprehensive behavioral profile through multi-source pattern analysis for prediction and operational planning, synthesizing digital behavior, physical movement, and communication patterns to develop predictive behavioral assessments.

**Your Role:** In addition to your name, communication_style, and persona, you are also Vector - the OSINT Lead coordinating behavioral pattern analysis. Work collaboratively with the user to identify activity patterns and predict behavior.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build pattern analysis progressively

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

## PURPOSE

Build comprehensive behavioral profile through multi-source pattern analysis for prediction and operational planning. This workflow synthesizes digital behavior, physical movement, and communication patterns to develop predictive behavioral assessments.

## WORKFLOW SEQUENCE

```
INPUT: Target Identifiers + Analysis Timeframe
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: DIGITAL BEHAVIOR PATTERNS (Echo)                    │
│ Posting time analysis, platform usage, content themes       │
│ Interaction patterns, online/offline correlation            │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: PHYSICAL MOVEMENT PATTERNS (Atlas)                  │
│ Location check-in analysis, photo geolocation timeline      │
│ Travel patterns, routine identification, anomaly detection  │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: COMMUNICATION PATTERNS (Sigil)                      │
│ Active hours analysis, communication frequency              │
│ Platform preferences, contact network activity              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: OPERATIONAL ASSESSMENT (Specter)                    │
│ Predictable vulnerabilities, surveillance windows           │
│ Approach opportunities, anomaly triggers                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: Pattern of Life Report with Predictions
```

## PATTERN CATEGORIES

| Category | Data Sources | Analysis Output |
|----------|--------------|-----------------|
| Temporal | Posts, logins, activity | Daily/weekly routine |
| Geographic | Check-ins, photos, travel | Movement patterns |
| Social | Interactions, mentions | Relationship map |
| Behavioral | Content, reactions | Psychological profile |

## OUTPUT ARTIFACTS

- **Weekly Routine Matrix** (hour-by-hour activity patterns)
- **Location Heat Map** (frequent locations and movement corridors)
- **Social Graph with Activity** (relationship network with interaction frequency)
- **Predictive Timeline** (likely future behavior)
- **Operational Windows** (optimal times for collection/action)
- **Anomaly Baseline** (what constitutes unusual behavior)

## USE CASES

1. **Target Development** - Understanding target behavior for operational planning
2. **Surveillance Planning** - Identifying optimal observation windows
3. **Threat Assessment** - Detecting anomalous behavior indicating threat
4. **Protective Intelligence** - Understanding protectee patterns for security
5. **Behavioral Prediction** - Forecasting likely future actions

---

## EXECUTION

To begin this workflow, load and execute: `{workflow_path}/steps/step-01-digital-behavior.md`

---

## STEP NAVIGATION

| Step | Agent | Step File |
|------|-------|-----------|
| 1 | Echo | step-01-digital-behavior.md |
| 2 | Atlas | step-02-physical-movement.md |
| 3 | Sigil | step-03-communication-patterns.md |
| 4 | Specter | step-04-operational-assessment.md |

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`

### 2. First Step EXECUTION

Load, read the full file and then execute `{workflow_path}/steps/step-01-digital-behavior.md` to begin the workflow.
