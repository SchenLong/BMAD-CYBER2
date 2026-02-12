# BMAD Modules Overview

Complete guide to all 9 modules in the BMAD-CYBER2 framework.

---

## What is a Module?

A **module** is a self-contained collection of specialized AI agents and workflows designed for a specific domain. Each module provides:

- **Agents**: Specialized AI personas with domain expertise
- **Workflows**: Structured step-by-step processes
- **Knowledge**: Domain-specific frameworks, standards, and best practices
- **Integration**: Cross-module collaboration through Party Mode

---

## Module Summary

| Module | Agents | Workflows | Focus Area |
|--------|--------|-----------|------------|
| [core](#core-infrastructure) | 2 | 15 | Project management & orchestration |
| [cybersec-team](#cybersec-team) | 15 | 13 | Cybersecurity operations |
| [intel-team](#intel-team) | 11 | 19 | Intelligence operations |
| [strategy-team](#strategy-team) | 14 | 17 | Executive leadership & strategy |
| [legal-team](#legal-team) | 13 | 8 | Legal support (Party Mode) |
| [bmm](#bmm-bmad-method) | 9 | 32 | Software product development |
| [bmgd](#bmgd-game-development) | 6 | 29 | Game development |
| [bmb](#bmb-builder) | 3 | 8 | Module/agent creation |
| [cis](#cis-creative-innovation) | 6 | 4 | Creative innovation |

**Totals: 80 agents, 143 workflows, 27 party mode presets**

---

## Operational Modules

These modules provide specialized agents for professional operations.

---

### Core Infrastructure

**Required module - always installed**

The Core module provides project management and cross-module orchestration capabilities.

| Component | Description |
|-----------|-------------|
| **Agents** | Abdul (Project Manager), BMAD Master (System Orchestrator) |
| **Workflows** | Party Mode, Project Manager, Team Orchestration, Brainstorming, Index Docs, and 10+ more |
| **Party Presets** | 27 pre-configured agent team combinations |

**Key Capabilities:**

- **Abdul**: Cross-module task assignment, "What's Next" routing, project creation
- **Party Mode**: Multi-agent collaboration with preset teams
- **Team Orchestration**: Workflows for secure software, incident response, strategic decisions
- **Phase Gates**: Validation checkpoints for project progression

**Invoke:**

```
/bmad:core:agents:abdul
/bmad:core:agents:bmad-master
```

---

### Cybersec-Team

**Professional-grade cybersecurity operations**

Enterprise security capabilities through 15 specialized agents covering the complete security lifecycle.

| Category | Agents |
|----------|--------|
| **Core Security (6)** | Bastion (Architect), Cipher (Threat Intel), Ghost (Pentester), Phoenix (IR), Sentinel (Compliance), Trace (Forensics) |
| **Extended Security (9)** | Watchman (SOC), Nimbus (Cloud), Ledger (Blockchain), Weaver (Web), Gateway (API), Oracle (AI/LLM), Shield (Blue Team), Phantom (Mobile), Specter (Social Engineering) |

**Workflows (13):**

1. Incident Response Playbook (19 steps)
2. Security Architecture Review (8 steps)
3. STRIDE Threat Modeling (11 steps)
4. Compliance Audit Preparation (10 steps)
5. Virtual CISO Consulting (11 steps)
6. Blockchain Security Assessment (9 steps)
7. Mobile Security Testing (9 steps)
8. Web Application Security Testing (8 steps)
9. Network Assessment (8 steps)
10. Infrastructure Security Testing (9 steps)
11. Cloud Security Assessment (9 steps)
12. Vulnerability Management (8 steps)
13. Security Awareness Training (7 steps)

**Frameworks Supported:** NIST CSF, NIST 800-53, MITRE ATT&CK, STRIDE, OWASP, CIS Controls, ISO 27001, SOC 2, PCI-DSS, HIPAA, GDPR, and 20+ more

**Built for:** Security Consultants, CISOs, Compliance Officers, IR Teams, Penetration Testers, Red/Blue Teams

**Invoke:**

```
/security-architect           # Bastion
/threat-analyst              # Cipher
/penetration-tester          # Ghost
/incident-commander          # Phoenix
/compliance-guardian         # Sentinel
/forensic-investigator       # Trace
```

---

### Intel-Team

**Multi-discipline intelligence operations for accredited professionals**

Comprehensive intelligence collection, analysis, and reporting through 11 specialized agents.

| Category | Agents |
|----------|--------|
| **Core Intelligence (8)** | Vector (Director), Resolver (Domain Intel), Echo (SOCMINT), Shadow (DARKINT), Atlas (GEOINT), Probe (TECHINT), Dossier (Threat Profiler), Proxy (CORPINT) |
| **Extended Disciplines (3)** | Viper (HUMINT), Sigil (SIGINT), Specter (Field Operations) |

**Workflows (19):**

| Category | Workflows |
|----------|-----------|
| **Rapid Response** | Flash Assessment (15 min) |
| **Individual Investigation** | Campaign Planner (Person), Doppelganger Hunt, Digital Necromancy, Pattern of Life |
| **Organization Investigation** | Campaign Planner (Org), Operation Mosaic, Spider Web |
| **Technical Intelligence** | Infrastructure Genealogy, Signal Landscape, Breach Archaeology |
| **Threat Intelligence** | Attribution Chain, Threat Constellation |
| **Field Operations** | Ground Truth, Approach Vector, Counter-Intel Audit |
| **Intelligence Fusion** | The Synthesis, Campaign AI, Tripwire |

**Intelligence Disciplines:** OSINT, SOCMINT, DARKINT, TECHINT, GEOINT, HUMINT, SIGINT, CORPINT/FININT

**Built for:** Intelligence Professionals, Investigators, Security Researchers, Threat Intelligence Analysts

**Invoke:**

```
/intel-team:osint-lead              # Vector
/intel-team:domain-intel-specialist # Resolver
/intel-team:social-media-analyst    # Echo
/intel-team:dark-web-analyst        # Shadow
```

**Note:** Intel-team requires credential verification for access. See [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md).

---

### Strategy-Team

**Executive leadership and strategic decision-making**

Strategic counsel through 14 advisors including 6 modern professionals and 8 historical archetypes.

| Category | Agents |
|----------|--------|
| **Modern Professional Advisors (6)** | Augustus (Policy), Magnus (Political Strategy), Cicero (Debate), Geneva (Mediation), Sophia (Ethics), Giuseppe (Communications) |
| **Historical Archetypes (8)** | Niccolo/Machiavelli (Realist), Charles/Lincoln (Liberator), Maximilien/Robespierre (Revolutionary), Burke (Conservative), Lee Kuan Yew (Technocrat), Musashi (Warrior-Strategist), Sun Tzu (Master Strategist), Jean-Luc/Picard (Principled Commander) |

**Workflows (17):**

| Category | Workflows |
|----------|-----------|
| **Core Strategy** | Strategic Decision Workshop, Stakeholder Negotiation Prep, Board Presentation Prep, Crisis Response Planning, Strategic Planning Session |
| **Governance** | Policy Development, Conflict Resolution, Competitive Warfare, Corporate Political Game |
| **Advanced** | Political Risk Assessment, Ethical Dilemma Resolution, Leadership Philosophy |
| **Executive Operations** | M&A Due Diligence, Leadership Transition Planning, Board Relations Management, Performance Review Preparation |

**Built for:** C-Suite Executives, Board Members, Strategic Planners, Policy Makers, Crisis Managers

**Invoke:**

```
/strategy-team:the-master-strategist      # Sun Tzu
/strategy-team:political-strategist       # Magnus
/strategy-team:the-principled-commander   # Jean-Luc
/strategy-team:ethics-advisor             # Sophia
```

---

### Legal-Team

**Cross-jurisdictional legal coordination for team orchestration**

> **IMPORTANT DISCLAIMER**: The Legal Team module is designed **exclusively for supporting other modules** in Party Mode / team orchestration scenarios. It provides legal perspective during multi-agent discussions but is **NOT intended as a standalone legal framework**. The module creator is not a legal professional. Always consult qualified legal counsel for actual legal matters.

| Category | Agents |
|----------|--------|
| **Core Legal Team (7)** | Counsel (General Counsel), Liberty (US Law), Europa (EU Law), Castile (Spanish Law), Covenant (Contracts), Tribute (Tax), Advocate (Litigation) |
| **Extended Legal Team (6)** | Iberia (Spain Civil), Gremio (Spain Labor), Baltic (Estonia Corporate), Charter (Governance), Insignia (IP), Deed (Real Estate) |

**Workflows (8):**

1. Legal Matter Intake (8 steps)
2. Contract Review (9 steps)
3. Contract Drafting (9 steps)
4. Dispute Strategy (10 steps)
5. Corporate Formation (10 steps)
6. Tax Planning (10 steps)
7. Cross-Border Matter (10 steps)

**Jurisdictions Covered:** USA, European Union, Spain, Estonia, Cross-Border Matters

**Primary Use Case:** Providing legal perspective in Party Mode when other modules require legal input:

- **Cybersec-Team:** Compliance considerations during security assessments
- **Intel-Team:** Contractual implications in corporate intelligence
- **Strategy-Team:** Regulatory concerns in executive strategy sessions

**Invoke (Party Mode only):**

```
/legal-team:counsel    # General Counsel
/legal-team:europa     # EU/GDPR Specialist
/legal-team:covenant   # Contract Specialist
```

---

## Development Modules

These modules support software engineering and creative workflows.

---

### BMM (BMAD Method)

**Full-stack software product development from idea to deployment**

The core BMAD Method module covering the complete product development lifecycle.

> **Module Origin:** This module is from the [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) framework with minimal modifications: added security rules and workflow count adjustments.

| Category | Agents |
|----------|--------|
| **Product & Business** | John (PM), Sarah (Analyst), Emma (UX Designer) |
| **Technical** | Winston (Architect), Devon (Developer), Murat (Test Engineer) |
| **Delivery** | Alex (Scrum Master), Clara (Tech Writer), Solo Dev (Quick Flow) |

**Workflows (32):**

| Category | Workflows |
|----------|-----------|
| **Product Planning** | Product Brief, PRD Creation, Architecture, UX Design |
| **Implementation** | Epics & Stories, Sprint Planning, Create Story, Dev Story, Quick Dev |
| **Quality** | Code Review, Tech Spec, Check Implementation Readiness |
| **Testing (TestArch)** | Test Design, Framework, ATDD, Automate, Test Review, CI, Trace, NFR |
| **Documentation** | Workflow Status, Document Project, Index Docs |
| **Visualization** | Excalidraw Diagram, Dataflow, Flowchart, Wireframe |

**Built for:** Product Managers, Developers, Architects, Scrum Masters, Tech Writers

**Invoke:**

```
/bmad:bmm:agents:pm         # John
/bmad:bmm:agents:architect  # Winston
/bmad:bmm:agents:dev        # Devon
```

---

### BMGD (Game Development)

**Game development from concept to launch**

Specialized game development workflows supporting Unity, Unreal Engine, and Godot.

> **Module Origin:** From [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) with expanded workflow count for comprehensive game development coverage.

| Category | Agents |
|----------|--------|
| **Design & Production** | Samus Shepard (Game Designer), Max (Game Scrum Master) |
| **Technical** | Winston (Game Architect), Devon (Game Developer), GLaDOS (Game QA) |
| **Solo** | Solo Dev (Game Solo Developer) |

**Workflows (29):**

| Category | Workflows |
|----------|-----------|
| **Planning** | Game Brief, GDD, Game Architecture, Narrative |
| **Implementation** | Sprint Planning, Dev Story, Quick Prototype, Code Review |
| **Testing (GameTest)** | Test Design, Framework, Automate, Performance, Playtest Plan |
| **Other** | Brainstorm Game, Retrospective, Workflow Status |

**Engines Supported:** Unity, Unreal Engine, Godot, Custom

**Built for:** Game Designers, Game Developers, QA Engineers, Indie Developers

**Invoke:**

```
/bmad:bmgd:agents:game-designer  # Samus Shepard
/bmad:bmgd:agents:game-architect # Winston
/bmad:bmgd:agents:game-qa        # GLaDOS
```

---

### BMB (Builder)

**Create custom BMAD modules, agents, and workflows**

Meta-module for extending the BMAD ecosystem.

> **Module Origin:** From [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) with expanded workflows and LessonsLearned.md for capturing best practices.

| Agents |
|--------|
| Agent Builder, Workflow Builder, Module Builder |

**Workflows (8):**

1. Create Agent
2. Create Workflow
3. Edit Workflow
4. Create Module
5. Workflow Compliance Check
6. Agent Validation

**Built for:** BMAD Developers, Framework Contributors

**Invoke:**

```
/bmad:bmb:agents:agent-builder
/bmad:bmb:agents:workflow-builder
/bmad:bmb:agents:module-builder
```

---

### CIS (Creative Innovation)

**Creative problem-solving and innovation facilitation**

Brainstorming, design thinking, and innovation methodology.

> **Module Origin:** From [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) with minimal modifications.

| Category | Agents |
|----------|--------|
| **Innovation** | Carson (Brainstorming Coach), Victor (Innovation Strategist), Dr. Quinn (Creative Problem Solver), Maya (Design Thinking Coach) |
| **Communication** | Sophia (Storyteller), Caravaggio (Presentation Master) |

**Workflows (4):**

1. Design Thinking
2. Innovation Strategy
3. Problem Solving
4. Storytelling

**Built for:** Innovation Teams, Product Designers, Marketing, Leadership

**Invoke:**

```
/bmad:cis:agents:brainstorming-coach  # Carson
/bmad:cis:agents:innovation-strategist # Victor
```

---

## Module Access Control

Access to modules is controlled by RBAC (Role-Based Access Control). Each role has specific module access:

| Role | Module Access |
|------|---------------|
| admin | All modules |
| security_lead | cybersec-team, intel-team, core |
| security_analyst | cybersec-team, core |
| intel_analyst | intel-team, core |
| legal_counsel | legal-team, core |
| developer | bmm, bmgd, bmb, cis, core |
| product_manager | bmm, cis, core |
| strategist | strategy-team, core |
| viewer | core (read-only) |
| guest | core (limited) |

See [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) for complete access control details.

---

## Cross-Module Collaboration

Modules can work together through **Party Mode**, which enables multi-agent collaboration across modules.

### Common Cross-Module Scenarios

| Scenario | Modules Involved | Preset |
|----------|------------------|--------|
| Security Architecture Review | BMM + Cybersec | `security-review-team` |
| Incident Response War Room | Cybersec + Intel + Strategy + Legal | `incident-war-room` |
| Compliance Audit | Legal + Cybersec + BMM | `compliance-audit-team` |
| Strategic Decision | Strategy + Legal + Intel | `strategic-advisors` |
| Game Launch | BMGD + Legal + Strategy | `game-launch-team` |
| Product Security Launch | BMM + Cybersec | `product-security-launch` |

See [PARTY-MODE-GUIDE.md](PARTY-MODE-GUIDE.md) for all 27 presets and custom team assembly.

---

## Module Configuration

Each module has configuration files:

```
_bmad/
├── [module-name]/
│   ├── agents/           # Agent definitions
│   ├── workflows/        # Workflow definitions
│   ├── module.yaml       # Module metadata
│   └── config.yaml       # Runtime configuration
```

Global configuration:

- `_bmad/_config/llm-config.yaml` - LLM provider routing per module
- `_bmad/core/security/rbac-config.yaml` - Access control per module

---

## Related Documentation

- [PROMPT-DATABASE.md](PROMPT-DATABASE.md) - **Prompt templates for effective module engagement**
- [AGENTS-REFERENCE.md](AGENTS-REFERENCE.md) - Complete agent catalog
- [WORKFLOWS-REFERENCE.md](WORKFLOWS-REFERENCE.md) - Complete workflow reference
- [PARTY-MODE-GUIDE.md](PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) - Access control by role
- [LLM-PROVIDER-SYSTEM.md](LLM-PROVIDER-SYSTEM.md) - Module-level LLM routing
