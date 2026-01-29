# BMAD Workflows Reference

Complete reference for all 143 workflows across the BMAD-CYBER2 framework.

---

## Quick Navigation

- [Core Workflows](#core-workflows-15)
- [Cybersec-Team Workflows](#cybersec-team-workflows-13)
- [Intel-Team Workflows](#intel-team-workflows-19)
- [Strategy-Team Workflows](#strategy-team-workflows-17)
- [Legal-Team Workflows](#legal-team-workflows-8)
- [BMM Workflows](#bmm-workflows-32)
- [BMGD Workflows](#bmgd-workflows-29)
- [BMB Workflows](#bmb-workflows-8)
- [CIS Workflows](#cis-workflows-4)

---

## Workflow Types

| Type | Description |
|------|-------------|
| **Linear** | Sequential step execution |
| **Iterative-Linear** | Steps with component iteration |
| **Dual-Mode** | Creation mode + guided execution mode |
| **Interactive** | User choices at decision points |

---

## Core Workflows (15)

The Core module provides project management and team orchestration workflows.

### Project Management

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `assign-task` | 3 | Delegate task to appropriate agent with context |
| `whats-next` | 3 | Analyze project state and recommend next action |
| `project-status` | 4 | Generate comprehensive project status dashboard |
| `create-project` | 5 | Initialize new project with module selection |

### Team Orchestration

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `party-mode` | 3 | Multi-agent collaboration with preset teams |
| `select-preset` | 2 | Select pre-configured agent group for Party Mode |
| `select-template` | 3 | Select team orchestration template |
| `cross-module` | 4 | Identify and invoke cross-module expertise |
| `brainstorming` | 5 | Facilitate interactive brainstorming sessions |

### Validation & Compliance

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `phase-gate` | 4 | Validate phase gate requirements before transitions |
| `conflict-resolution` | 5 | Resolve conflicts between modules or teams |

### Multi-Module Workflows

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `secure-software` | 6 | Security-aware software development |
| `incident-response` | 7 | Coordinated multi-team incident response |
| `strategic-decision` | 5 | Multi-perspective strategic decision making |
| `compliance-first` | 6 | Compliance-driven architecture and development |

### Documentation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `index-docs` | 2 | Generate index of documents in directory |

---

## Cybersec-Team Workflows (13)

Professional-grade cybersecurity workflows powered by specialized agents.

---

### 1. Incident Response Playbook

**Type:** Dual-Mode (Creation + Execution)
**Complexity:** 19 steps
**Output:** Professional incident response playbook (50-150 pages)

**Modes:**
- **Playbook Creation:** Design custom IR playbooks for your organization
- **Guided Execution:** Step-by-step incident response during active events

**Frameworks:** NIST IR (SP 800-61), MITRE ATT&CK
**Compliance:** GDPR, PCI-DSS, HIPAA, SOC 2, ISO 27001

**Perfect for:**
- Building organizational IR capabilities
- Executing live incident response
- Meeting compliance requirements
- Training security teams

**Command:** `/bmad:cybersec-team:workflows:incident-response`

---

### 2. Security Architecture Review

**Type:** Linear
**Complexity:** 8 steps
**Output:** Comprehensive architecture security assessment

**Capabilities:**
- STRIDE-based threat modeling
- Zero-trust validation
- Cloud security review (AWS/Azure/GCP)
- Attack surface analysis
- Control effectiveness assessment

**Frameworks:** STRIDE, NIST CSF, CIS Controls, OWASP ASVS, Zero Trust

**Perfect for:**
- Pre-deployment security reviews
- Architecture security validation
- Security design consultations

**Command:** `/bmad:cybersec-team:workflows:security-architecture-review`

---

### 3. STRIDE Threat Modeling

**Type:** Iterative-Linear
**Complexity:** 11 steps (with component iteration)
**Output:** Detailed threat model with prioritized mitigations

**Coverage:**
- **S**poofing threats
- **T**ampering threats
- **R**epudiation threats
- **I**nformation Disclosure threats
- **D**enial of Service threats
- **E**levation of Privilege threats

**Frameworks:** STRIDE (Microsoft), NIST SP 800-30

**Perfect for:**
- Application security design
- System architecture threat analysis
- Security requirements generation

**Command:** `/bmad:cybersec-team:workflows:threat-modeling`

---

### 4. Compliance Audit Preparation

**Type:** Linear
**Complexity:** 10 steps
**Output:** Audit-ready compliance package with evidence inventory

**Supported Frameworks (20+):**

| Region | Frameworks |
|--------|-----------|
| **US** | NIST 800-53, SOC 2, PCI-DSS, HIPAA, FedRAMP, CMMC |
| **EU** | GDPR, NIS2, Cyber Resilience Act, DORA, AI Act |
| **Global** | ISO 27001/27017/27018, CIS Controls, CSA STAR |
| **Industry** | SWIFT CSP, NERC CIP, TISAX |

**Perfect for:**
- Pre-audit preparation
- Gap assessment and remediation
- Compliance program management

**Command:** `/bmad:cybersec-team:workflows:compliance-audit-prep`

---

### 5. Virtual CISO Consulting

**Type:** Linear
**Complexity:** 11 steps
**Output:** Comprehensive vCISO engagement document (50-100 pages)

**Deliverables:**
- Strategic security planning & roadmaps
- Budget optimization with ROI framework
- Security maturity assessment
- Governance framework design
- Board/executive reporting templates
- Vendor risk management program

**Frameworks:** NIST CSF, ISO 27001, CIS Controls, NIST 800-53

**Perfect for:**
- vCISO service engagements
- Security program development
- Executive security advisory

**Command:** `/bmad:cybersec-team:workflows:virtual-ciso-consulting`

---

### 6. Blockchain Security Assessment

**Type:** Linear
**Complexity:** 9 steps
**Output:** Smart contract audit report with vulnerability analysis

**Coverage:**
- Smart contract code review (Solidity, Vyper, Rust)
- DeFi protocol security analysis
- Token economics review
- Access control and privilege analysis
- Cross-chain bridge security
- Oracle manipulation risks

**Frameworks:** SWC Registry, DeFi Security Best Practices

**Command:** `/bmad:cybersec-team:workflows:blockchain-security-assessment`

---

### 7. Mobile Security Testing

**Type:** Linear
**Complexity:** 9 steps
**Output:** Mobile application security assessment report

**Coverage:**
- Static analysis (SAST)
- Dynamic analysis (DAST)
- Binary protection analysis
- Local data storage security
- Network communication security
- Platform-specific security controls

**Frameworks:** OWASP MSTG, MASVS

**Command:** `/bmad:cybersec-team:workflows:mobile-security-testing`

---

### 8. Web Application Security Testing

**Type:** Linear
**Complexity:** 8 steps
**Output:** Web application penetration test report

**Coverage:**
- OWASP Top 10 vulnerability assessment
- Authentication and authorization testing
- Session management analysis
- Input validation and injection testing
- Business logic testing
- API security assessment

**Frameworks:** OWASP Testing Guide, OWASP Top 10, ASVS, WSTG

**Command:** `/bmad:cybersec-team:workflows:web-app-security-testing`

---

### 9. Network Assessment

**Type:** Linear
**Complexity:** 8 steps
**Output:** Network penetration test report

**Coverage:**
- External and internal network testing
- Active Directory security assessment
- Network segmentation analysis
- Vulnerability scanning and validation
- Privilege escalation paths
- Lateral movement analysis

**Frameworks:** PTES, NIST SP 800-115, OSSTMM

**Command:** `/bmad:cybersec-team:workflows:network-assessment`

---

### 10. Infrastructure Security Testing

**Type:** Linear
**Complexity:** 9 steps
**Output:** Infrastructure security assessment report

**Coverage:**
- Server hardening assessment
- Container security (Docker, Kubernetes)
- CI/CD pipeline security
- Secrets management review
- Infrastructure as Code (IaC) analysis
- Configuration management security

**Frameworks:** CIS Benchmarks, NIST 800-123

**Command:** `/bmad:cybersec-team:workflows:infrastructure-security-testing`

---

### 11. Cloud Security Assessment

**Type:** Linear
**Complexity:** 9 steps
**Output:** Cloud security posture assessment report

**Coverage:**
- IAM and identity governance
- Network security configuration
- Data protection and encryption
- Logging and monitoring
- Compute security (VM, container, serverless)
- Compliance mapping

**Frameworks:** CIS Benchmarks (AWS/Azure/GCP), CSA CCM, Well-Architected

**Command:** `/bmad:cybersec-team:workflows:cloud-security-assessment`

---

### 12. Vulnerability Management

**Type:** Linear
**Complexity:** 8 steps
**Output:** Vulnerability management program documentation

**Coverage:**
- Asset inventory and criticality
- Scanning strategy and tooling
- Vulnerability prioritization (CVSS, EPSS)
- Remediation planning and tracking
- Metrics and reporting
- Program maturity assessment

**Frameworks:** NIST, FIRST EPSS, ISO 27001

**Command:** `/bmad:cybersec-team:workflows:vulnerability-management`

---

### 13. Security Awareness Training

**Type:** Linear
**Complexity:** 7 steps
**Output:** Security awareness program design document

**Coverage:**
- Risk assessment and threat analysis
- Training content development
- Phishing simulation design
- Delivery strategy planning
- Metrics and measurement
- Continuous improvement roadmap

**Frameworks:** NIST 800-50, SANS Security Awareness

**Command:** `/bmad:cybersec-team:workflows:security-awareness-training`

---

## Intel-Team Workflows (19)

Multi-discipline intelligence operations workflows.

---

### Rapid Response

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `flash-assessment` | 3 | Quick 15-minute OSINT assessment with immediate hits and risk |

### Individual Investigation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `campaign-planner-person` | 5 | Full intelligence campaign against individual targets |
| `doppelganger-hunt` | 4 | Fake account, sock puppet, and impersonator detection |
| `digital-necromancy` | 4 | Recover deleted/hidden digital presence and history |
| `pattern-of-life` | 4 | Behavioral analysis and temporal pattern development |

### Organization Investigation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `campaign-planner-org` | 9 | Comprehensive organizational intelligence campaign |
| `operation-mosaic` | 9 | Full-spectrum organizational assessment using all 11 agents |
| `spider-web` | 4 | Network relationship mapping starting from single node |

### Technical Intelligence

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `infrastructure-genealogy` | 5 | Trace infrastructure ownership history and evolution |
| `signal-landscape` | 4 | SIGINT opportunity mapping and communications analysis |
| `breach-archaeology` | 4 | Historical breach and data exposure analysis |

### Threat Intelligence

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `attribution-chain` | 6 | Evidence-based attribution from indicators to actor identity |
| `threat-constellation` | 5 | Map threat actor ecosystem and relationships |

### Field Operations

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `ground-truth` | 5 | Field operation preparation and site reconnaissance |
| `approach-vector` | 4 | HUMINT operation planning - entry points, cover stories |
| `counter-intel-audit` | 6 | Assess organization's own exposure and OPSEC gaps |

### Intelligence Fusion

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `the-synthesis` | 4 | Multi-source intelligence fusion and product creation |
| `campaign-ai` | 4 | AI-augmented intelligence analysis |
| `tripwire` | 5 | Configure monitoring and alerting for target changes |

---

## Strategy-Team Workflows (17)

Executive leadership and strategic decision-making workflows.

---

### Core Strategic Workflows

| Workflow | Output | Description |
|----------|--------|-------------|
| `strategic-decision-workshop` | Decision Brief | Multi-perspective decision analysis with all archetypes |
| `stakeholder-negotiation-prep` | Negotiation Playbook | High-stakes negotiation preparation |
| `board-presentation-prep` | Presentation Outline | Board presentation crafting with Q&A prep |
| `crisis-response-planning` | Crisis Response Plan | Crisis communication and response strategy |
| `strategic-planning-session` | Strategic Plan | Long-term strategic planning |

### Governance & Policy

| Workflow | Output | Description |
|----------|--------|-------------|
| `policy-development` | Policy Document | Evidence-based policy creation |
| `conflict-resolution` | Resolution Plan | Workplace conflict navigation |
| `competitive-warfare` | Warfare Plan | Competitive business strategy |
| `corporate-political-game` | Political Playbook | Internal corporate politics navigation |

### Advanced Analysis

| Workflow | Output | Description |
|----------|--------|-------------|
| `political-risk-assessment` | Risk Assessment | Political risk evaluation |
| `ethical-dilemma-resolution` | Ethical Resolution | Complex ethical navigation |
| `leadership-philosophy` | Leadership Philosophy | Personal leadership development |

### Executive Operations

| Workflow | Output | Description |
|----------|--------|-------------|
| `ma-due-diligence` | Due Diligence Report | M&A target evaluation and integration |
| `leadership-transition-planning` | Transition Plan | Succession and leadership handover |
| `board-relations-management` | Board Relations Plan | Board engagement strategy |
| `performance-review-preparation` | Performance Review | Executive performance review prep |

### Cross-Module Integration

8 workflows support cross-module collaboration with optional steps for cybersec, intel, and legal input.

---

## Legal-Team Workflows (8)

> **DISCLAIMER**: Legal-Team workflows are designed for Party Mode support only. Always consult qualified legal counsel for actual legal matters.

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `legal-matter-intake` | 8 | Entry point for all legal matters with jurisdiction routing |
| `contract-review` | 9 | Comprehensive contract analysis for risks and obligations |
| `contract-drafting` | 9 | Create jurisdiction-appropriate contracts |
| `dispute-strategy` | 10 | Dispute analysis and resolution strategy |
| `corporate-formation` | 10 | Multi-jurisdictional entity formation |
| `tax-planning` | 10 | Tax optimization and compliance planning |
| `cross-border-matter` | 10 | Multi-jurisdictional legal coordination |

**Jurisdictions Covered:** USA, European Union, Spain, Estonia, Cross-Border

---

## BMM Workflows (32)

Full-stack software product development workflows.

---

### Product Planning

| Workflow | Purpose |
|----------|---------|
| `create-product-brief` | Product vision and brief creation |
| `create-prd` | PRD through collaborative discovery |
| `create-architecture` | Architectural decision facilitation |
| `create-ux-design` | UX patterns and design planning |
| `research` | Research and exploration |

### Implementation

| Workflow | Purpose |
|----------|---------|
| `create-epics-and-stories` | Epic and story breakdown from PRD |
| `sprint-planning` | Sprint status tracking and management |
| `create-story` | Individual story creation with context |
| `dev-story` | Story implementation execution |
| `quick-dev` | Flexible development with optional planning |
| `code-review` | Adversarial code review |
| `correct-course` | Navigate significant project changes |
| `retrospective` | Post-epic lessons learned |

### Validation

| Workflow | Purpose |
|----------|---------|
| `check-implementation-readiness` | PRD/Architecture validation before implementation |
| `workflow-status` | Check workflow document status |
| `document-project` | Project documentation generation |

### TestArch (Testing)

| Workflow | Purpose |
|----------|---------|
| `testarch-test-design` | Test planning and design |
| `testarch-framework` | Test framework initialization |
| `testarch-atdd` | Acceptance test generation |
| `testarch-automate` | Test automation expansion |
| `testarch-test-review` | Test quality review |
| `testarch-ci` | CI/CD pipeline scaffolding |
| `testarch-trace` | Requirements traceability |
| `testarch-nfr` | Non-functional requirements testing |

### Visualization (Excalidraw)

| Workflow | Purpose |
|----------|---------|
| `create-excalidraw-diagram` | System architecture diagrams |
| `create-excalidraw-dataflow` | Data flow diagrams (DFD) |
| `create-excalidraw-flowchart` | Process flowcharts |
| `create-excalidraw-wireframe` | Website/app wireframes |

---

## BMGD Workflows (29)

Game development workflows for Unity, Unreal, and Godot.

---

### Planning

| Workflow | Purpose |
|----------|---------|
| `create-game-brief` | Game vision capture |
| `gdd` | Game Design Document creation |
| `game-architecture` | Game architecture decisions |
| `narrative` | Narrative design and story |
| `brainstorm-game` | Game brainstorming sessions |

### Implementation

| Workflow | Purpose |
|----------|---------|
| `sprint-planning` | Game sprint tracking |
| `dev-story` | Game story implementation |
| `quick-prototype` | Rapid prototyping |
| `code-review` | Game code review |
| `retrospective` | Post-milestone retrospective |

### GameTest (Testing)

| Workflow | Purpose |
|----------|---------|
| `gametest-test-design` | Game test scenario design |
| `gametest-framework` | Game test framework setup |
| `gametest-automate` | Automated game testing |
| `gametest-performance` | Performance testing |
| `gametest-playtest-plan` | Playtesting session design |

---

## BMB Workflows (8)

Module, agent, and workflow creation workflows.

| Workflow | Purpose |
|----------|---------|
| `agent` | Create, edit, or validate agents |
| `create-workflow` | Design new workflows |
| `edit-workflow` | Modify existing workflows |
| `create-module` | Build complete modules |
| `workflow-compliance-check` | Validate against standards |

---

## CIS Workflows (4)

Creative innovation and brainstorming workflows.

| Workflow | Purpose |
|----------|---------|
| `design-thinking` | Design thinking methodology |
| `innovation-strategy` | Innovation strategy development |
| `problem-solving` | Creative problem-solving |
| `storytelling` | Narrative development |

---

## Workflow Access Control

Some workflows have additional restrictions beyond module access:

### Restricted Workflows (Require Credential Verification)

| Workflow | Module | Required Roles |
|----------|--------|----------------|
| `operation-mosaic` | intel-team | intel_analyst, security_lead, admin |
| `approach-vector` | intel-team | intel_analyst, admin |
| `ground-truth` | intel-team | intel_analyst, security_lead, admin |

### Restricted Workflows (Require Approval)

| Workflow | Module | Required Roles |
|----------|--------|----------------|
| `competitive-warfare` | strategy-team | strategist, admin |

### Restricted Workflows (Full Audit)

| Workflow | Module | Required Roles |
|----------|--------|----------------|
| `incident-response` | cybersec-team | security_lead, admin |
| `counter-intel-audit` | intel-team | security_lead, admin |
| `doppelganger-hunt` | intel-team | intel_analyst, security_lead, admin |
| `attribution-chain` | intel-team | intel_analyst, security_lead, admin |

See [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) for complete access control details.

---

## Running Workflows

### From Agent Menu

```
# Launch an agent
/security-architect

# Select workflow from menu or type command
> SR   # Security Review
```

### Direct Workflow Loading

```
Load workflow: _bmad/cybersec-team/workflows/virtual-ciso-consulting/workflow.md
```

### Multi-Session Continuation

All workflows support pausing and resuming:
- Start a workflow, work for hours, then stop
- Later: Resume from exactly where you left off
- Automatically detects existing document and continues

---

## Related Documentation

- [MODULES-OVERVIEW.md](MODULES-OVERVIEW.md) - Module descriptions
- [AGENTS-REFERENCE.md](AGENTS-REFERENCE.md) - Complete agent catalog
- [PARTY-MODE-GUIDE.md](PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [GETTING-STARTED.md](GETTING-STARTED.md) - Quick start guide
