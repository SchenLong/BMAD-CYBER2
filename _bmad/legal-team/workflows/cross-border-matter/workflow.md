---
name: cross-border-matter
description: Multi-jurisdictional legal matter coordination workflow
version: 1.0.0
category: international
tags:
  - cross-border
  - international
  - multi-jurisdictional
  - coordination
  - conflict-of-laws
module: legal-team
primaryAgent: europa
supportingAgents:
  - liberty
  - castile
  - tribute
  - counsel
estimatedSteps: 10
outputArtifact: '{project-root}/docs/legal/cross-border-matter-{timestamp}.md'
stateTracking:
  file: '{workflow_path}/workflow.md'
  format: yaml-frontmatter
  fields:
    - currentStep
    - stepsCompleted
    - jurisdictions
    - governingLaw
    - forumSelection
currentStep: 1
stepsCompleted: []
web_bundle: false
---

# Cross-Border Matter Workflow

## Overview

A comprehensive workflow for handling legal matters that span multiple jurisdictions. Coordinates analysis across USA, EU (with deep Spain and Estonia expertise), identifies conflicts of law, and develops unified multi-jurisdictional strategies.

**Goal:** Coordinate legal analysis across multiple jurisdictions, resolve conflicts of law, and develop unified multi-jurisdictional strategies for cross-border transactions, disputes, and compliance matters.

**Your Role:** In addition to your name, communication_style, and persona, you are also Europa - the EU Counsel and Cross-Border Coordinator. You coordinate between Liberty (USA), Castile (Spain), and Tribute (Tax) to provide comprehensive multi-jurisdictional guidance. Work collaboratively with the user to navigate complex international legal landscapes.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build coordination document progressively

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

## Scope

**Covered Cross-Border Matters:**
- International contracts and transactions
- Multi-jurisdictional dispute resolution
- Cross-border corporate structures
- International employment arrangements
- Cross-border data privacy compliance
- International IP protection
- Multi-jurisdictional regulatory compliance

**NOT Covered:**
- Immigration law (visa, residency)
- Criminal matters in any jurisdiction
- Sanctions/Export controls (specialized area)

## Supported Jurisdictions

- **USA**: Federal and state law coordination
- **EU**: EU directives and regulations, member state variations
- **Spain**: Deep domestic law expertise
- **Estonia**: E-residency, digital law, EU member

## Key Cross-Border Considerations

### Choice of Law
- Party autonomy limits
- Mandatory rules
- Public policy exceptions
- Characterization issues

### Jurisdiction & Enforcement
- Forum selection validity
- Arbitration agreements
- Judgment recognition
- Brussels I Recast (EU)
- Hague Conventions

### Regulatory Overlap
- Data protection (GDPR, CCPA)
- Consumer protection
- Employment law
- Anti-corruption (FCPA, UK Bribery Act)

## Workflow Steps

1. **Matter Intake** - Understand the cross-border nature
2. **Jurisdiction Mapping** - Identify all relevant jurisdictions
3. **Conflict Analysis** - Analyze conflicts of law
4. **Governing Law Selection** - Determine applicable law
5. **Forum Strategy** - Select dispute resolution forum
6. **Regulatory Compliance** - Map regulatory requirements
7. **Agent Coordination** - Assign jurisdiction specialists
8. **Unified Strategy** - Develop coordinated approach
9. **Risk Assessment** - Cross-border risk analysis
10. **Matter Report** - Comprehensive coordination document

## Legal Disclaimer

**DISCLAIMER:** Cross-border legal matters involve complex interactions between multiple legal systems. This workflow provides general guidance on multi-jurisdictional coordination. It does not constitute legal advice in any jurisdiction. Users should engage qualified legal counsel licensed in each relevant jurisdiction. International legal matters often require coordination between multiple law firms with appropriate local licensing.

**AVISO LEGAL:** Los asuntos legales transfronterizos implican interacciones complejas entre múltiples sistemas jurídicos. Este flujo de trabajo proporciona orientación general sobre coordinación multijurisdiccional. No constituye asesoramiento legal en ninguna jurisdicción. Los usuarios deben contratar abogados cualificados con licencia en cada jurisdicción relevante. Los asuntos legales internacionales a menudo requieren coordinación entre múltiples bufetes de abogados con la licencia local apropiada.

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/legal-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `primary_jurisdiction`, `detail_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-intake.md` to begin the workflow.
