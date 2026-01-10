---
name: 'approach-vector'
description: 'HUMINT Operation Planning - Identify vulnerabilities, social entry points, physical access, cover stories'
version: '1.0.0'
classification: 'OPERATIONAL PLANNING'

# Workflow Configuration
workflow_path: '{project-root}/_bmad/intel-team/workflows/approach-vector'
steps_path: '{workflow_path}/steps'
output_path: '{project-root}/_bmad-output/approach-vector'

# Agent Sequence
agents:
  - humint-specialist     # Viper - Step 1: Target Assessment
  - social-media-analyst  # Echo - Step 2: Social Entry Point Mapping
  - geospatial-analyst    # Atlas - Step 3: Physical Access Analysis
  - field-operative       # Specter - Step 4: Approach Planning

# Execution Mode
execution_mode: 'sequential'
estimated_duration: '60 minutes'
---

# Approach Vector Analysis

## PURPOSE

Plan human intelligence approach to target - identify psychological vulnerabilities, social entry points, physical access opportunities, and develop cover stories for engagement.

## WORKFLOW SEQUENCE

```
INPUT: Target Profile + Collection Requirements
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: TARGET ASSESSMENT (Viper)                           │
│ MICE analysis (Money, Ideology, Coercion, Ego)              │
│ Vulnerability identification, access assessment             │
│ Recruitment potential scoring                               │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: SOCIAL ENTRY POINT MAPPING (Echo)                   │
│ Social network analysis, interest/hobby identification      │
│ Event attendance patterns, online community memberships     │
│ Influencer connections                                      │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: PHYSICAL ACCESS ANALYSIS (Atlas)                    │
│ Location patterns, frequented venues                        │
│ Travel patterns, residence/workplace mapping                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: APPROACH PLANNING (Specter)                         │
│ Cover story development, approach scenario design           │
│ Risk assessment, contingency planning                       │
│ Operational security considerations                         │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: HUMINT Approach Plan
```

## MICE FRAMEWORK

The MICE framework assesses motivation and vulnerability factors:

| Factor | Indicators | Approach Strategy |
|--------|------------|-------------------|
| **Money** | Financial stress, lifestyle gaps, debt | Business opportunity, consulting offer |
| **Ideology** | Grievances, strong beliefs, causes | Shared values, activism alignment |
| **Coercion** | Vulnerabilities, secrets, compromising info | Leverage (use ethically) |
| **Ego** | Recognition needs, expertise pride, undervalued | Flattery, expert consultation request |

## OUTPUT ARTIFACTS

- **Target Psychological Profile** (vulnerabilities, motivations)
- **Approach Vectors** (ranked by feasibility and risk)
- **Cover Story Package** (legend, backstory, props)
- **Risk Assessment Matrix** (detection, compromise, legal)
- **Contingency Plans** (abort triggers, recovery procedures)
- **Social Entry Point Map** (ranked opportunities)
- **Physical Access Windows** (timing and location)

## USE CASES

1. **Intelligence Collection** - Developing sources for ongoing collection
2. **Elicitation** - One-time information extraction
3. **Influence Operations** - Shaping target behavior/decisions
4. **Protective Intelligence** - Understanding adversary approach vectors
5. **Competitive Intelligence** - Ethical business intelligence gathering

---

## EXECUTION

To begin this workflow, load and execute: `{workflow_path}/steps/step-01-target-assessment.md`

---

## STEP NAVIGATION

| Step | Agent | Step File |
|------|-------|-----------|
| 1 | Viper | step-01-target-assessment.md |
| 2 | Echo | step-02-social-entry-points.md |
| 3 | Atlas | step-03-physical-access.md |
| 4 | Specter | step-04-approach-planning.md |
