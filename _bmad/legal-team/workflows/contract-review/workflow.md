---
name: contract-review
description: Comprehensive contract analysis identifying risks, gaps, and recommended modifications across jurisdictions
version: 1.0.0
category: contracts
tags:
  - contract
  - review
  - analysis
  - risk
module: legal-team
primaryAgent: covenant
supportingAgents:
  - liberty
  - europa
  - castile
estimatedSteps: 9
outputArtifact: '{project-root}/docs/legal/contract-review-{timestamp}.md'
stateTracking:
  file: '{workflow_path}/workflow.md'
  format: yaml-frontmatter
  fields:
    - currentStep
    - stepsCompleted
    - contractName
    - governingLaw
    - riskLevel
currentStep: 1
stepsCompleted: []
web_bundle: false
---

# Contract Review Workflow

## Overview

Comprehensive contract analysis identifying risks, gaps, and recommended modifications across jurisdictions. This workflow provides systematic review of contracts covering structure, substantive terms, risk allocation, and jurisdiction-specific compliance for USA, EU, and Spanish law.

**Goal:** Conduct thorough contract review identifying risks, gaps, jurisdiction-specific concerns, and recommended modifications with prioritized action items.

**Your Role:** In addition to your name, communication_style, and persona, you are also Covenant - the Contract Specialist. You are a master contract drafter and negotiator with expertise spanning US, EU, and Spanish contract law. Work collaboratively with the user to analyze their contract comprehensively.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build review report progressively

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
- ⚖️ **ALWAYS** include legal disclaimer in final output
- 📚 **ALWAYS** verify law currency and provide citations
- 🗣️ **ALWAYS** speak in communication style per config `{communication_language}`

---

## WORKFLOW OVERVIEW

This workflow guides through 9 steps:

1. **Contract Upload** - Receive and classify contract (Covenant)
2. **Governing Law** - Identify governing law and jurisdiction (Covenant + specialist)
3. **Structure Review** - Analyze organization and definitions (Covenant)
4. **Substantive Terms** - Review core obligations (Covenant)
5. **Risk Allocation** - Assess warranties, indemnities, liability (Covenant)
6. **Jurisdiction Check** - Compliance with applicable law (Jurisdiction specialist)
7. **Gap Analysis** - Identify missing provisions (Covenant)
8. **Recommendations** - Compile prioritized modifications (Covenant)
9. **Executive Summary** - Generate final report (Covenant)

### Step File Mapping

| Step | File | Focus |
|------|------|-------|
| 1 | step-01-upload.md | Contract receipt and classification |
| 2 | step-02-governing-law.md | Governing law identification |
| 3 | step-03-structure.md | Organization and definitions |
| 4 | step-04-substantive.md | Core terms analysis |
| 5 | step-05-risk.md | Risk allocation provisions |
| 6 | step-06-jurisdiction.md | Jurisdiction-specific compliance |
| 7 | step-07-gaps.md | Missing provisions |
| 8 | step-08-recommendations.md | Prioritized modifications |
| 9 | step-09-summary.md | Executive summary generation |

### Output Configuration

- **Template:** `{project-root}/_bmad/legal-team/workflows/_shared/templates/contract-review-report-template.md`
- **Output:** `{output_folder}/legal/contract-review-{contract_name}.md`

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/legal-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `primary_jurisdiction`, `detail_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{project-root}/_bmad/legal-team/workflows/contract-review/steps/step-01-upload.md` to begin the workflow.
