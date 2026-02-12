# Workflow Selection Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Applies To:** BMAD-CYBER2 v1.x

---

## Overview

BMAD-CYBER2 contains **140+ workflows** organized across specialized modules. This guide helps you quickly identify the right workflow for your task through decision trees, comparison matrices, and selection criteria.

---

## Quick Selection Matrix

| **I Need To...** | **Module** | **Primary Workflow** | **Invocation** |
|-----------------|-----------|---------------------|----------------|
| Start a new project | Core | `create-project` | `/bmad:core:workflows:create-project` |
| Respond to security incident | Cybersec | `incident-response-playbook` | `/bmad:cybersec-team:workflows:incident-response-playbook` |
| Investigate a threat actor | Intel | `attribution-chain` | `/bmad:intel-team:workflows:attribution-chain` |
| Review a contract | Legal | `contract-review` | `/bmad:legal-team:workflows:contract-review` |
| Make strategic decision | Strategy | `strategic-decision-workshop` | `/bmad:strategy-team:workflows:strategic-decision-workshop` |
| Create product requirements | BMM | `create-prd` | `/bmad:bmm:workflows:create-prd` |
| Build custom agent | BMB | `agent` | `/bmad:bmb:workflows:agent` |
| Multi-agent collaboration | Core | `party-mode` | `/bmad:core:workflows:party-mode` |

---

## Decision Trees by Domain

### Security Operations

```
What's your security need?
├── Active Incident?
│   ├── YES → incident-response-playbook
│   │         └── Need multi-team coordination? → incident-response (core)
│   └── NO → Continue below
│
├── Assessment Needed?
│   ├── Web Application → web-app-security-testing
│   ├── Mobile App → mobile-security-testing
│   ├── API/Integration → (use Gateway agent directly)
│   ├── Cloud Environment → cloud-security-assessment
│   ├── Blockchain/DeFi → blockchain-security-assessment
│   ├── Network/Infra → network-assessment
│   └── AI/LLM System → (use Oracle agent directly)
│
├── Architecture/Design?
│   ├── New System → security-architecture-review
│   ├── Threat Analysis → threat-modeling
│   └── Zero-Trust Design → security-architecture-review
│
├── Compliance?
│   ├── Audit Preparation → compliance-audit-prep
│   └── Ongoing Program → vulnerability-management
│
└── Advisory/Consulting?
    ├── vCISO Engagement → virtual-ciso-consulting
    └── Training Program → security-awareness-training
```

### Intelligence Operations

```
What type of intelligence work?
├── Quick Assessment?
│   └── flash-assessment (15-minute triage)
│
├── Target Investigation?
│   ├── Individual Person → campaign-planner-person
│   ├── Organization → campaign-planner-org
│   ├── AI/Tech Company → campaign-ai
│   └── Full Spectrum → operation-mosaic (all 11 agents)
│
├── Threat Intelligence?
│   ├── Actor Attribution → attribution-chain
│   ├── Ecosystem Mapping → threat-constellation
│   └── TTP Analysis → (use Dossier agent)
│
├── Technical Intelligence?
│   ├── Infrastructure History → infrastructure-genealogy
│   ├── Breach/Exposure → breach-archaeology
│   ├── SIGINT Mapping → signal-landscape
│   └── Network Mapping → spider-web
│
├── Human Intelligence?
│   ├── Social Analysis → doppelganger-hunt
│   ├── Behavior Patterns → pattern-of-life
│   ├── Approach Planning → approach-vector
│   └── Field Prep → ground-truth
│
├── Recovery/Historical?
│   └── digital-necromancy (deleted content recovery)
│
├── Defensive/Internal?
│   ├── Own Exposure → counter-intel-audit
│   └── Monitoring Setup → tripwire
│
└── Fusion/Synthesis?
    └── the-synthesis (multi-source fusion)
```

### Legal Operations

```
What type of legal matter?
├── New Matter (Unknown Type)?
│   └── legal-matter-intake (routing entry point)
│
├── Contracts?
│   ├── Review Existing → contract-review
│   ├── Draft New → contract-drafting
│   └── Negotiation Support → (use Covenant agent)
│
├── Corporate?
│   ├── New Entity → corporate-formation
│   ├── Governance → (use Charter agent)
│   └── M&A → (use strategic-decision with legal team)
│
├── Disputes?
│   └── dispute-strategy
│
├── Tax?
│   └── tax-planning
│
├── Multi-Jurisdiction?
│   └── cross-border-matter
│
└── Specialized Areas?
    ├── IP/Trademark → (use Insignia agent)
    ├── Real Estate → (use Deed agent)
    ├── Employment (Spain) → (use Gremio agent)
    └── e-Residency (Estonia) → (use Baltic agent)
```

### Strategic Planning

```
What strategic context?
├── Major Decision?
│   ├── Board-Level → strategic-decision-workshop (14 advisors)
│   ├── Validated/High-Stakes → Use "strategic-decision-validated" preset
│   └── Quick Strategic Input → (use Sun or Magnus agent)
│
├── Crisis?
│   └── crisis-response-planning
│
├── Negotiations?
│   └── stakeholder-negotiation-prep
│
├── Corporate Politics?
│   └── corporate-political-game
│
├── Competition?
│   └── competitive-warfare
│
├── M&A?
│   ├── Due Diligence → ma-due-diligence
│   └── Integration → (use Lee technocrat agent)
│
├── Governance?
│   ├── Board Presentation → board-presentation-prep
│   ├── Board Relations → board-relations-management
│   └── Performance Review → performance-review-preparation
│
├── Policy?
│   ├── New Policy → policy-development
│   ├── Political Risk → political-risk-assessment
│   └── Ethics Review → ethical-dilemma-resolution
│
├── Leadership?
│   ├── Philosophy Development → leadership-philosophy
│   └── Succession → leadership-transition-planning
│
└── Conflict?
    └── conflict-resolution
```

### Product Development (BMM)

```
What phase of development?
├── Phase 1: Analysis
│   ├── New Idea → create-product-brief
│   └── Research Needed → research
│
├── Phase 2: Planning
│   ├── Requirements → create-prd (11 steps)
│   └── UX Design → create-ux-design
│
├── Phase 3: Solutioning
│   ├── Architecture → create-architecture
│   ├── Epic/Story Breakdown → create-epics-and-stories
│   └── Readiness Check → check-implementation-readiness
│
├── Phase 4: Implementation
│   ├── Story Creation → create-story
│   ├── Development → dev-story (TDD)
│   ├── Code Review → code-review
│   ├── Sprint Planning → sprint-planning
│   ├── Sprint Status → sprint-status
│   ├── Retrospective → retrospective
│   └── Course Correction → correct-course
│
├── Quick Development?
│   ├── Direct Implementation → quick-dev
│   └── Tech Spec → create-tech-spec
│
├── Diagrams?
│   ├── Architecture/UML/ERD → create-excalidraw-diagram
│   ├── Data Flow → create-excalidraw-dataflow
│   ├── Flowchart → create-excalidraw-flowchart
│   └── Wireframe → create-excalidraw-wireframe
│
└── Testing?
    ├── Framework Setup → testarch-framework
    ├── Test Design → testarch-test-design
    ├── ATDD → testarch-atdd
    ├── Automation → testarch-automate
    ├── CI/CD → testarch-ci
    ├── Quality Review → testarch-test-review
    ├── Traceability → testarch-trace
    └── NFR Assessment → testarch-nfr
```

---

## Workflow Categories Explained

### By Complexity

| Category | Workflows | Description | Typical Duration |
|----------|-----------|-------------|------------------|
| **Quick Tasks** | `flash-assessment`, `quick-dev` | Single-step or rapid execution | 5-15 minutes |
| **Standard Workflows** | Most workflows | Multi-step with checkpoints | 30-90 minutes |
| **Complex Workflows** | `operation-mosaic`, `create-prd`, `strategic-decision-workshop` | Many steps, multiple agents | 2-4 hours |
| **Extended Engagements** | `virtual-ciso-consulting`, `incident-response-playbook` | Multi-session programs | Days to weeks |

### By Team Size

| Category | Workflows | Agent Count |
|----------|-----------|-------------|
| **Solo Agent** | `flash-assessment`, `quick-dev`, most direct agent work | 1 |
| **Small Team** | `contract-review`, `threat-modeling` | 2-3 |
| **Department** | `incident-response-playbook`, `ma-due-diligence` | 4-6 |
| **Cross-Module** | `incident-response`, `strategic-decision`, `operation-mosaic` | 6-14 |

### By Output Type

| Output | Workflows |
|--------|-----------|
| **Assessment Report** | `security-architecture-review`, `flash-assessment`, `counter-intel-audit` |
| **Action Plan** | `incident-response-playbook`, `crisis-response-planning`, `dispute-strategy` |
| **Requirements Document** | `create-prd`, `create-product-brief`, `game-brief` |
| **Architecture Document** | `create-architecture`, `game-architecture`, `security-architecture-review` |
| **Implementation Artifacts** | `dev-story`, `create-story`, `create-epics-and-stories` |
| **Legal Document** | `contract-drafting`, `contract-review`, `legal-matter-intake` |
| **Strategic Brief** | `strategic-decision-workshop`, `board-presentation-prep`, `policy-development` |
| **Intelligence Product** | `attribution-chain`, `the-synthesis`, `campaign-planner-*` |

---

## Module-Specific Guidance

### When to Use Core Module

Use Core workflows for:

- **Project initiation**: `create-project`
- **Task routing**: `assign-task`, `whats-next`
- **Cross-module coordination**: `cross-module`, `select-template`
- **Multi-agent discussions**: `party-mode`, `select-preset`
- **Phase transitions**: `phase-gate`
- **Conflict resolution**: `conflict-resolution`

### When to Use Cybersec Module

Use Cybersec workflows for:

- **Active security incidents** requiring immediate response
- **Security assessments** of applications, infrastructure, or processes
- **Compliance preparation** for audits (NIST, SOC2, PCI-DSS, HIPAA, GDPR)
- **Threat modeling** and architecture reviews
- **Security program development** (vCISO, training)

**Key Indicators:**

- Risk to confidentiality, integrity, or availability
- Regulatory compliance requirements
- Pre-launch security validation
- Post-incident forensics

### When to Use Intel Module

Use Intel workflows for:

- **Investigation** of individuals, organizations, or threat actors
- **Exposure assessment** (breach archaeology, counter-intel)
- **Technical reconnaissance** (infrastructure, SIGINT)
- **Behavioral analysis** (pattern-of-life, doppelganger-hunt)
- **Intelligence fusion** (synthesis, operation-mosaic)

**Key Indicators:**

- Need to understand external entities
- Threat actor attribution required
- Due diligence on third parties
- Monitoring/alerting requirements

### When to Use Legal Module

Use Legal workflows for:

- **Any legal matter** (start with `legal-matter-intake`)
- **Contracts** (drafting, review, negotiation)
- **Corporate formation** across jurisdictions
- **Dispute resolution** planning
- **Tax optimization** strategies

**Key Indicators:**

- Contractual obligations or rights
- Regulatory compliance (GDPR, employment, etc.)
- Multi-jurisdiction considerations
- Potential litigation or disputes

### When to Use Strategy Module

Use Strategy workflows for:

- **Major decisions** requiring multiple perspectives
- **Crisis situations** requiring coordinated response
- **Stakeholder management** and negotiations
- **Competitive dynamics** and market positioning
- **Leadership and governance** matters

**Key Indicators:**

- Board-level visibility
- High-stakes outcomes
- Political complexity
- Values/ethics considerations

### When to Use BMM Module

Use BMM workflows for:

- **New product development** (brief through implementation)
- **Agile execution** (sprints, stories, retrospectives)
- **Architecture decisions** for software systems
- **Testing strategy** and automation
- **Documentation** and diagramming

**Key Indicators:**

- Software development lifecycle
- Product/feature definition
- Technical implementation
- Quality assurance requirements

---

## Multi-Workflow Patterns

### Security Incident Response Chain

```
incident-response-playbook (Cybersec)
    ↓
attribution-chain (Intel)
    ↓
dispute-strategy (Legal, if applicable)
    ↓
crisis-response-planning (Strategy)
```

### Product Launch Chain

```
create-product-brief (BMM)
    ↓
create-prd (BMM)
    ↓
create-architecture (BMM)
    ↓
security-architecture-review (Cybersec)
    ↓
legal-matter-intake (Legal) → contract-drafting
    ↓
create-epics-and-stories (BMM)
    ↓
dev-story (BMM, iterative)
    ↓
code-review (BMM)
```

### Due Diligence Chain

```
flash-assessment (Intel)
    ↓
campaign-planner-org (Intel)
    ↓
ma-due-diligence (Strategy)
    ↓
legal-matter-intake (Legal)
    ↓
strategic-decision-workshop (Strategy)
```

---

## Workflow Selection Checklist

Before selecting a workflow, consider:

- [ ] **Domain**: Which module owns this type of work?
- [ ] **Urgency**: Is this time-critical (use quick workflows)?
- [ ] **Scope**: Single agent or multi-agent collaboration?
- [ ] **Output**: What deliverable is expected?
- [ ] **Cross-Module**: Does this span multiple domains?
- [ ] **Sensitivity**: What classification level applies?

---

## Quick Reference: All Workflows by Module

### Core (10 workflows)

- `create-project`, `assign-task`, `cross-module`, `project-status`, `whats-next`
- `strategic-decision`, `incident-response`, `secure-software`, `compliance-first`, `phase-gate`
- `conflict-resolution`, `select-template`, `party-mode`, `select-preset`

### Cybersec (13 workflows)

- `threat-modeling`, `security-architecture-review`, `vulnerability-management`, `compliance-audit-prep`
- `web-app-security-testing`, `mobile-security-testing`, `cloud-security-assessment`, `blockchain-security-assessment`
- `network-assessment`, `infrastructure-security-testing`, `incident-response-playbook`
- `virtual-ciso-consulting`, `security-awareness-training`

### Intel (19 workflows)

- `flash-assessment`, `campaign-planner-person`, `campaign-planner-org`, `campaign-ai`
- `attribution-chain`, `threat-constellation`, `breach-archaeology`, `infrastructure-genealogy`
- `signal-landscape`, `spider-web`, `operation-mosaic`
- `doppelganger-hunt`, `digital-necromancy`, `pattern-of-life`, `approach-vector`, `ground-truth`
- `counter-intel-audit`, `tripwire`, `the-synthesis`

### Legal (7 workflows)

- `legal-matter-intake`, `contract-review`, `contract-drafting`
- `corporate-formation`, `dispute-strategy`, `tax-planning`, `cross-border-matter`

### Strategy (16 workflows)

- `strategic-decision-workshop`, `strategic-planning-session`, `crisis-response-planning`
- `stakeholder-negotiation-prep`, `competitive-warfare`, `corporate-political-game`
- `ma-due-diligence`, `board-presentation-prep`, `board-relations-management`
- `performance-review-preparation`, `leadership-transition-planning`, `leadership-philosophy`
- `policy-development`, `political-risk-assessment`, `ethical-dilemma-resolution`, `conflict-resolution`

### BMM (25+ workflows)

- **Analysis**: `create-product-brief`, `research`
- **Planning**: `create-prd`, `create-ux-design`
- **Solutioning**: `create-architecture`, `create-epics-and-stories`, `check-implementation-readiness`
- **Implementation**: `create-story`, `dev-story`, `code-review`, `sprint-planning`, `sprint-status`, `retrospective`, `correct-course`
- **Quick Flow**: `quick-dev`, `create-tech-spec`
- **Diagrams**: `create-excalidraw-diagram`, `create-excalidraw-dataflow`, `create-excalidraw-flowchart`, `create-excalidraw-wireframe`
- **Testing**: `testarch-framework`, `testarch-test-design`, `testarch-atdd`, `testarch-automate`, `testarch-ci`, `testarch-test-review`, `testarch-trace`, `testarch-nfr`

---

## See Also

- [Workflow Chaining Guide](WORKFLOW-CHAINING-GUIDE.md) - Combining workflows for complex operations
- [Party Mode Examples](Examples/PARTY-MODE-EXAMPLES.md) - Multi-agent collaboration examples
- [Module Setup Guides](ModuleSetup/) - Per-module installation and configuration
- [CLI Command Reference](CLI-COMMAND-REFERENCE.md) - Complete command documentation
