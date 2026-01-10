---
name: breach-archaeology
description: 'Comprehensive data exposure assessment across all breach sources with timeline and risk scoring'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/breach-archaeology'
output_path: '{output_folder}/breach-archaeology'

# Workflow Configuration
primary_agent: dark-web-analyst
supporting_agents: [technical-researcher, domain-intel-specialist, threat-actor-profiler]
estimated_duration: '30-45 minutes'
classification: 'EXPOSURE ANALYSIS'

# Step Files
steps:
  - steps/step-01-target-setup.md
  - steps/step-02-exposure-scan.md
  - steps/step-03-threat-correlation.md
  - steps/step-04-risk-assessment.md
---

# Breach Archaeology Workflow

## Purpose

Complete assessment of data exposure across all breach sources with timeline reconstruction, threat actor correlation, and risk scoring. Unearth the full history of compromised data.

## When to Use

- Post-incident exposure assessment
- Pre-employment/partnership due diligence
- Personal security audit
- Credential hygiene evaluation
- Threat actor targeting research
- M&A security assessment

## Workflow Overview

```
INPUT: Target Identifiers (email, username, domain, etc.)
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: TARGET SETUP (Shadow)                           │
│ - Validate identifiers                                  │
│ - Enumerate related selectors                           │
│ - Set search parameters                                 │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: EXPOSURE SCAN (Shadow + Probe + Resolver)       │
│ - Breach database queries                               │
│ - Dark web monitoring                                   │
│ - Paste site analysis                                   │
│ - Technical exposure check                              │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: THREAT CORRELATION (Dossier)                    │
│ - Actor attribution for breaches                        │
│ - Campaign correlation                                  │
│ - Exploitation likelihood                               │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: RISK ASSESSMENT (Shadow)                        │
│ - Timeline reconstruction                               │
│ - Risk scoring                                          │
│ - Remediation recommendations                           │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: Exposure Assessment Report with Risk Scoring
```

## Input Requirements

- **Required**: At least one target identifier
  - Email address (primary)
  - Username
  - Domain
  - Phone number
  - Full name + context

- **Optional**:
  - Known aliases/variations
  - Time range focus
  - Specific breach concerns
  - Password samples (for pattern analysis only)

## Output Artifacts

- **Exposure Timeline** (breach chronology)
- **Data Type Inventory** (what was exposed)
- **Risk Score Matrix** (prioritized concerns)
- **Threat Actor Correlation** (who has the data)
- **Remediation Recommendations** (action items)

## Agents Involved

| Agent | Codename | Role | Phase |
|-------|----------|------|-------|
| dark-web-analyst | Shadow | Lead, breach queries | 1, 2, 4 |
| technical-researcher | Probe | Technical exposure | 2 |
| domain-intel-specialist | Resolver | Infrastructure exposure | 2 |
| threat-actor-profiler | Dossier | Threat correlation | 3 |

## Execution

To start this workflow:
1. Invoke Shadow agent
2. Request: "Breach Archaeology on [identifier]"
3. Provide any known aliases or concerns
4. Workflow will guide through assessment

## Step Navigation

- **Step 1**: [Target Setup](steps/step-01-target-setup.md)
- **Step 2**: [Exposure Scan](steps/step-02-exposure-scan.md)
- **Step 3**: [Threat Correlation](steps/step-03-threat-correlation.md)
- **Step 4**: [Risk Assessment](steps/step-04-risk-assessment.md)
