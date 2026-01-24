---
name: legal-matter-intake
description: Initial case assessment and routing workflow serving as the entry point for all legal matters
version: 1.0.0
category: intake
tags:
  - intake
  - routing
  - assessment
  - triage
module: legal-team
primaryAgent: counsel
supportingAgents:
  - liberty
  - europa
  - castile
  - covenant
  - advocate
  - tribute
estimatedSteps: 8
outputArtifact: '{project-root}/docs/legal/matter-brief-{timestamp}.md'
stateTracking:
  file: '{workflow_path}/workflow.md'
  format: yaml-frontmatter
  fields:
    - currentStep
    - stepsCompleted
    - matterType
    - jurisdiction
    - urgencyLevel
currentStep: 1
stepsCompleted: []
web_bundle: false
---

# Legal Matter Intake Workflow

## Overview

Initial case assessment and routing workflow serving as the entry point for all legal matters. This workflow provides structured intake covering matter classification, jurisdiction analysis, urgency assessment, and specialist routing for USA, EU, Spain, and Estonia legal matters.

**Goal:** Guide users through initial legal matter assessment, determine applicable jurisdiction(s), and route to appropriate specialist agents and workflows.

**Your Role:** In addition to your name, communication_style, and persona, you are also Counsel - the General Counsel and Legal Team Director. You serve as the primary point of contact for all legal inquiries, expertly routing matters to appropriate jurisdiction and practice area specialists. Work collaboratively with the user to understand their situation completely before making recommendations.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build matter brief progressively

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

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

This workflow guides through 8 steps:

1. **Welcome & Context** - Initial greeting and situation overview (Counsel)
2. **Matter Classification** - Determine matter type (Counsel)
3. **Jurisdiction Analysis** - Identify applicable jurisdictions (Counsel + specialists)
4. **Urgency Assessment** - Evaluate timeline and deadlines (Counsel)
5. **Party Analysis** - Understand roles and relationships (Counsel)
6. **Document Review** - Gather relevant documents/evidence (Counsel)
7. **Routing Decision** - Recommend specialist and workflow (Counsel)
8. **Matter Brief** - Generate comprehensive matter summary (Counsel)

### Step File Mapping

| Step | File | Focus |
|------|------|-------|
| 1 | step-01-welcome.md | Welcome, initial context |
| 2 | step-02-classification.md | Matter type determination |
| 3 | step-03-jurisdiction.md | Jurisdiction identification |
| 4 | step-04-urgency.md | Timeline assessment |
| 5 | step-05-parties.md | Party roles and relationships |
| 6 | step-06-documents.md | Evidence and document gathering |
| 7 | step-07-routing.md | Specialist recommendation |
| 8 | step-08-brief.md | Matter brief generation |

### Output Configuration

- **Template:** `{project-root}/_bmad/legal-team/workflows/_shared/templates/matter-brief-template.md`
- **Output:** `{output_folder}/legal/matter-brief-{matter_name}.md`

---

## MATTER TYPES SUPPORTED

- Contract/Agreement issues
- Corporate/Business formation or governance
- Dispute or potential litigation
- Property/Real estate
- Employment/Labor
- Tax planning
- Compliance concerns
- Cross-border matters

---

## JURISDICTION COVERAGE

- **United States** (federal and state)
- **European Union** (general EU law)
- **Spain** (including autonomous communities)
- **Estonia** (Phase 2)
- **Cross-border** (multi-jurisdiction)

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/legal-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `primary_jurisdiction`, `detail_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then execute `{project-root}/_bmad/legal-team/workflows/legal-matter-intake/steps/step-01-welcome.md` to begin the workflow.
