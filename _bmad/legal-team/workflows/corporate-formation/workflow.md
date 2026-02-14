---
name: corporate-formation
description: Multi-jurisdictional corporate formation and structuring workflow
version: 1.0.0
category: corporate
tags:
  - corporate
  - formation
  - incorporation
  - company
  - multi-agent
module: legal-team
primaryAgent: liberty
supportingAgents:
  - europa
  - castile
  - tribute
estimatedSteps: 10
outputArtifact: '{project-root}/docs/legal/corporate-formation-{timestamp}.md'
stateTracking:
  file: '{workflow_path}/workflow.md'
  format: yaml-frontmatter
  fields:
    - currentStep
    - stepsCompleted
    - selectedJurisdiction
    - entityType
    - structuringOptions
currentStep: 1
stepsCompleted: []
web_bundle: false
---

# Corporate Formation Workflow

## Overview

A comprehensive multi-agent workflow for forming corporate entities across supported jurisdictions. Coordinates specialized agents for USA (Liberty), EU general (Europa), Spain (Castile), and tax optimization (Tribute).

**Goal:** Guide users through multi-jurisdictional corporate formation, selecting optimal entity type and jurisdiction while coordinating specialized legal and tax agents for comprehensive formation documentation.

**Your Role:** In addition to your name, communication_style, and persona, you are also Liberty - US Corporate Counsel coordinating with Europa, Castile, and Tribute for cross-jurisdictional expertise. Work collaboratively with the user to form their corporate entity with full legal and tax consideration.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build formation package progressively

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

## Supported Entity Types

### USA (Liberty)
- LLC (Single-member, Multi-member)
- C-Corporation
- S-Corporation
- Limited Partnership (LP)
- Series LLC (where available)

### EU General (Europa)
- Private Limited Company equivalents
- Branch registration
- Representative office

### Spain (Castile)
- Sociedad Limitada (SL)
- Sociedad Anónima (SA)
- Sociedad Limitada Nueva Empresa (SLNE)
- Branch (Sucursal)

### Estonia (Europa)
- OÜ (Private Limited Company)
- AS (Public Limited Company)
- e-Residency company

## Workflow Steps

1. **Initial Consultation** - Understand business needs and goals
2. **Jurisdiction Selection** - Guide selection of optimal jurisdiction
3. **Entity Type Selection** - Recommend appropriate entity structure
4. **Agent Assignment** - Route to jurisdiction specialist
5. **Tax Implications Review** - Tribute analyzes tax considerations
6. **Document Requirements** - Compile formation documents needed
7. **Capital & Ownership Structure** - Define shareholding and capital
8. **Compliance Requirements** - Outline ongoing obligations
9. **Formation Package** - Generate complete formation documentation
10. **Post-Formation Guidance** - Next steps and ongoing support

## Agent Coordination

This workflow demonstrates multi-agent collaboration:
- **Counsel** provides initial routing (via legal-matter-intake)
- **Liberty** handles USA formations
- **Europa** handles EU/Estonia formations
- **Castile** handles Spain-specific formations
- **Tribute** provides tax analysis for all jurisdictions

## Legal Disclaimer

**DISCLAIMER:** This workflow provides general guidance on corporate formation procedures. It does not constitute legal advice. Corporate formation involves complex legal, tax, and regulatory considerations. Users should engage qualified legal and tax professionals in the relevant jurisdiction before proceeding with entity formation.

**AVISO LEGAL:** Este flujo de trabajo proporciona orientación general sobre procedimientos de constitución de sociedades. No constituye asesoramiento legal. La constitución de sociedades implica consideraciones legales, fiscales y regulatorias complejas. Los usuarios deben contratar profesionales legales y fiscales cualificados en la jurisdicción correspondiente antes de proceder con la constitución de entidades.

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/legal-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `primary_jurisdiction`, `detail_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-consultation.md` to begin the workflow.
