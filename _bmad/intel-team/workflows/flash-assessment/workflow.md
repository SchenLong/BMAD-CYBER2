---
name: flash-assessment
description: 'Rapid 15-minute OSINT triage providing immediate hits, exposures, and risk assessment'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/flash-assessment'
output_path: '{output_folder}/flash-assessments'

# Workflow Configuration
primary_agent: osint-lead
parallel_agents: [technical-researcher, social-media-analyst, dark-web-analyst, corporate-intel-specialist]
estimated_duration: '15 minutes'
classification: 'RAPID RESPONSE'

# Step Files
steps:
  - steps/step-01-triage.md
  - steps/step-02-parallel-collection.md
  - steps/step-03-synthesis.md
---

# Flash Assessment Workflow

## Purpose

Quick 15-minute assessment providing immediate OSINT hits, obvious exposures, and first-look risk assessment. Designed for rapid triage when time is critical.

## When to Use

- Initial target assessment before deeper investigation
- Time-sensitive intelligence requirements
- Quick due diligence checks
- Incident response initial triage
- Go/no-go decision support

## Workflow Overview

```
INPUT: Target Identifier(s) + Urgency Flag
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: TRIAGE COORDINATION (Vector)           ~2 min  │
│ - Validate identifiers                                  │
│ - Dispatch parallel collection                          │
│ - Set collection boundaries                             │
└─────────────────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬───────────┐
    ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ PROBE   │ │  ECHO   │ │ SHADOW  │ │ LEDGER  │
│Technical│ │ Social  │ │Dark Web │ │Corporate│
│ ~5 min  │ │ ~5 min  │ │ ~5 min  │ │ ~5 min  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     └───────────┴─────┬─────┴───────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: RAPID SYNTHESIS (Vector)               ~3 min  │
│ - Aggregate findings                                    │
│ - Assign risk score                                     │
│ - Flag critical findings                                │
│ - Recommend deep-dives                                  │
└─────────────────────────────────────────────────────────┘
                │
                ▼
OUTPUT: Flash Assessment Report (15 min turnaround)
```

## Input Requirements

- **Required**: At least one target identifier
  - Email address
  - Domain name
  - Username/handle
  - Phone number
  - IP address
  - Full name + context

- **Optional**:
  - Urgency level (ROUTINE / PRIORITY / IMMEDIATE)
  - Scope limitations
  - Specific concerns to prioritize

## Output Artifacts

- **Flash Assessment Report** (markdown)
  - Risk score (HIGH / MEDIUM / LOW)
  - Critical findings summary
  - Quick hits by category
  - Recommended deep-dive workflows

## Agents Involved

| Agent | Role | Phase |
|-------|------|-------|
| Vector (osint-lead) | Coordination, synthesis | 1, 3 |
| Probe (technical-researcher) | Technical recon | 2 (parallel) |
| Echo (social-media-analyst) | Social presence | 2 (parallel) |
| Shadow (dark-web-analyst) | Breach/exposure check | 2 (parallel) |
| Proxy (corporate-intel-specialist) | Entity verification, registry lookup | 2 (parallel) |

## Execution

To start this workflow:
1. Invoke Vector agent
2. Request: "Flash Assessment on [target identifier]"
3. Provide any scope limitations or priority concerns
4. Workflow will guide through steps automatically

## Step Navigation

- **Step 1**: [Triage Coordination](steps/step-01-triage.md)
- **Step 2**: [Parallel Collection](steps/step-02-parallel-collection.md)
- **Step 3**: [Rapid Synthesis](steps/step-03-synthesis.md)
