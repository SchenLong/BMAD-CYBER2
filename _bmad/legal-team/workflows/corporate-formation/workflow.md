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
---

# Corporate Formation Workflow

## Overview

A comprehensive multi-agent workflow for forming corporate entities across supported jurisdictions. Coordinates specialized agents for USA (Liberty), EU general (Europa), Spain (Castile), and tax optimization (Tribute).

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

*Legal Team Module - Corporate Formation Workflow*
