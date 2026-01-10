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
