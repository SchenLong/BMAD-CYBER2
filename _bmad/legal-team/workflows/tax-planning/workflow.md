---
name: tax-planning
description: Tax planning and optimization analysis workflow
version: 1.0.0
category: tax
tags:
  - tax
  - planning
  - optimization
  - compliance
  - international
module: legal-team
primaryAgent: tribute
supportingAgents:
  - liberty
  - europa
  - castile
estimatedSteps: 10
outputArtifact: '{project-root}/docs/legal/tax-planning-{timestamp}.md'
stateTracking:
  file: '{workflow_path}/workflow.md'
  format: yaml-frontmatter
  fields:
    - currentStep
    - stepsCompleted
    - taxJurisdictions
    - entityStructure
    - planningHorizon
currentStep: 1
stepsCompleted: []
---

# Tax Planning Workflow

## Overview

A comprehensive workflow for analyzing tax positions and developing optimization strategies. Covers individual, corporate, and international tax planning across supported jurisdictions.

## Scope

**Covered Areas:**
- Corporate tax planning
- Individual tax planning (business-related)
- International tax structures
- Entity selection tax implications
- Transfer pricing considerations
- Tax treaty benefits
- Compliance optimization
- Exit planning/Succession

**NOT Covered:**
- Tax return preparation
- Audit representation
- Tax litigation
- Criminal tax matters

## Supported Jurisdictions

- **USA**: Federal and state tax planning
- **EU**: General EU tax directives and frameworks
- **Spain**: Deep expertise - IRPF, IS, IVA, IP
- **Estonia**: E-residency tax planning, CIT system

## Key Tax Considerations by Jurisdiction

### USA
- C-Corp vs. Pass-through taxation
- State tax nexus and apportionment
- SALT deduction limitations
- Qualified Business Income deduction
- International provisions (GILTI, FDII, BEAT)

### Spain
- Impuesto sobre Sociedades (Corporate Tax)
- IRPF for individuals
- Beckham Law regime
- Patent Box regime
- Holding company structures (ETVE)

### Estonia
- 0% retained earnings model
- 20% distribution tax
- Reduced rate (14%) for regular dividends
- No withholding on outbound dividends
- CFC considerations for owners

## Workflow Steps

1. **Situation Analysis** - Current tax position and structure
2. **Goals Definition** - Tax planning objectives
3. **Jurisdiction Analysis** - Tax implications by location
4. **Entity Structure Review** - Optimal structuring options
5. **Income Optimization** - Income timing and characterization
6. **Deduction Maximization** - Available deductions and credits
7. **International Considerations** - Cross-border tax planning
8. **Compliance Mapping** - Ongoing compliance requirements
9. **Risk Assessment** - Tax risk analysis
10. **Planning Report** - Comprehensive tax plan document

## Legal Disclaimer

**DISCLAIMER:** This workflow provides general tax information and planning concepts. It does not constitute tax advice. Tax law is complex and constantly changing. All tax planning should be reviewed and implemented with the assistance of qualified tax professionals licensed in the relevant jurisdictions. Users are responsible for their own tax compliance.

**AVISO LEGAL:** Este flujo de trabajo proporciona información fiscal general y conceptos de planificación. No constituye asesoramiento fiscal. La legislación fiscal es compleja y está en constante cambio. Toda planificación fiscal debe ser revisada e implementada con la asistencia de profesionales fiscales cualificados con licencia en las jurisdicciones correspondientes. Los usuarios son responsables de su propio cumplimiento fiscal.

*Legal Team Module - Tax Planning Workflow*
