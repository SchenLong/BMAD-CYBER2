# BMAD Module Comparison Matrix

> **Version:** 1.0
> **Last Updated:** 2026-01-26
> **Audience:** All users evaluating or selecting BMAD modules

---

## Overview

BMAD-CYBER2 is a modular AI agent platform with 9 specialized modules. This guide helps you understand what each module offers and choose the right combination for your needs.

---

## Quick Reference Matrix

| Module | Code | Agents | Workflows | Default | Target Audience |
|--------|------|--------|-----------|---------|-----------------|
| **BMAD Core** | `core` | 2 | 24 | Required | Everyone |
| **BMAD Method** | `bmm` | 9 | 58 | Yes | Product/Dev Teams |
| **Intel Team** | `intel-team` | 11 | 38 | No | Intelligence Professionals |
| **Legal Team** | `legal-team` | 13 | 16 | No | Legal/Compliance Teams |
| **Strategy Team** | `strategy-team` | 14 | 46 | No | Executives/Strategists |
| **Cybersec Team** | `cybersec-team` | 15 | 36 | No | Security Teams |
| **Creative Studio** | `cis` | 6 | 4 | No | Innovators/Creatives |
| **Game Dev** | `bmgd` | 6 | 42 | No | Game Developers |
| **BMAD Builder** | `bmb` | 3 | 26 | No | Module Creators |

**Total Available:** 79 agents, 290 workflows across 9 modules

---

## Module Deep Dive

### 1. BMAD Core Infrastructure (Required)

**Code:** `core`
**Status:** Always installed (required)
**Version:** 6.0.0

#### Purpose
The foundation of BMAD that provides orchestration, cross-module coordination, and shared infrastructure.

#### Agents
| Agent | Role | Key Capability |
|-------|------|----------------|
| Abdul | Master Project Manager | Cross-module task coordination |
| BMAD Master | System Orchestrator | Module initialization & routing |

#### Key Workflows
- **Party Mode** - Multi-agent collaborative discussions
- **Project Status** - Dashboard and progress tracking
- **Team Orchestration** - Cross-module workflow coordination
- **Brainstorming** - Creative ideation sessions
- **Phase Gates** - Quality checkpoints

#### When to Use
Always active. Provides the backbone for all other modules.

---

### 2. BMAD Method (BMM) - Business & Product Development

**Code:** `bmm`
**Status:** Default selected
**Version:** 6.0.0

#### Purpose
Complete software development lifecycle coverage from business analysis through deployment.

#### Agents
| Agent | Role | Specialty |
|-------|------|-----------|
| John | Product Manager | PRD creation, product vision |
| Sarah | Business Analyst | Requirements discovery |
| Emma | UX Designer | User experience design |
| Winston | Architect | System design, tech specs |
| Devon | Developer | Implementation, coding |
| Murat | Test Engineer | Quality assurance, testing |
| Alex | Scrum Master | Sprint management |
| Clara | Tech Writer | Documentation |
| Solo Dev | Quick Flow | Rapid prototyping |

#### Key Workflows
- **create-prd** - Product requirements documents
- **create-architecture** - System architecture design
- **create-epics-and-stories** - Agile story creation
- **dev-story** - Story implementation
- **sprint-planning** - Sprint management
- **quick-dev** - Rapid development flow

#### Best For
- Software development teams
- Product managers
- Startups building MVPs
- Enterprise product development

#### Outputs
- Product briefs
- PRDs
- Architecture documents
- User stories
- Technical specifications

---

### 3. Intelligence Operations Team

**Code:** `intel-team`
**Status:** Optional (not default)
**Version:** 1.1.0

#### Purpose
Multi-discipline intelligence operations for accredited professionals requiring OSINT, HUMINT, SIGINT, and analysis capabilities.

#### Agents
| Agent | Role | Specialty |
|-------|------|-----------|
| Vector | Intelligence Director | All-source fusion, coordination |
| Resolver | Domain Specialist | DNS, infrastructure recon |
| Echo | Social Media Analyst | SOCMINT, influence detection |
| Shadow | Dark Web Analyst | Underground operations |
| Atlas | Geospatial Analyst | Imagery, location analysis |
| Probe | Technical Researcher | Tech fingerprinting, APIs |
| Dossier | Threat Profiler | APT attribution, MITRE ATT&CK |
| Proxy | Corporate Intel | Business registries, financials |
| Viper | HUMINT Specialist | Elicitation, source recruitment |
| Sigil | SIGINT Specialist | RF analysis, comms patterns |
| Specter | Field Operative | Surveillance, tactical intel |

#### Key Workflows
- **operation-mosaic** - Full spectrum target package
- **flash-assessment** - Rapid 15-minute triage
- **attribution-chain** - Actor attribution analysis
- **breach-archaeology** - Data exposure assessment
- **pattern-of-life** - Behavioral analysis
- **campaign-planner-org/person** - OSINT campaign planning

#### Best For
- Intelligence analysts
- Corporate security teams
- Threat intelligence researchers
- Due diligence investigators

#### Requirements
- Accredited professional context
- Understanding of legal/ethical boundaries

---

### 4. Legal Team - Multi-Jurisdictional Advisory

**Code:** `legal-team`
**Status:** Optional (not default)
**Version:** 1.0.0

#### Purpose
Comprehensive legal advisory across US, EU, Spain, and Estonia jurisdictions for corporate and civil matters.

#### Agents
| Agent | Role | Jurisdiction/Specialty |
|-------|------|------------------------|
| Counsel | General Counsel | Director, routing, intake |
| Liberty | US Counsel | Federal/state corporate & civil |
| Europa | EU Counsel | EU law, cross-border |
| Castile | Spain Corporate | Spanish business law |
| Iberia | Spain Civil | Family, property, inheritance |
| Gremio | Spain Labor | Employment law |
| Baltic | Estonia Counsel | E-residency, digital business |
| Covenant | Contract Specialist | Drafting, review, negotiation |
| Advocate | Litigation Strategist | Dispute resolution |
| Tribute | Tax Counsel | Cross-jurisdictional tax |
| Charter | Governance | Board matters, fiduciary |
| Insignia | IP Counsel | Trademarks, patents, copyright |
| Deed | Real Estate | Property transactions |

#### Key Workflows
- **legal-matter-intake** - Initial case routing
- **contract-review** - Contract analysis
- **contract-drafting** - Contract creation
- **corporate-formation** - Entity structuring
- **dispute-strategy** - Litigation planning
- **tax-planning** - Tax optimization

#### Best For
- Business owners needing legal guidance
- Entrepreneurs with multi-jurisdiction operations
- Contract-heavy businesses
- Companies with Spain/EU/Estonia presence

#### Important Notes
- NOT a substitute for licensed attorneys
- NO criminal law coverage
- Disclaimer included in all outputs

---

### 5. Strategic Advisory Team

**Code:** `strategy-team`
**Status:** Optional (not default)
**Version:** 1.0.0

#### Purpose
Executive-level strategic advisory with diverse perspectives from historical strategists and modern specialists.

#### Agents
| Agent | Archetype | Strategic Focus |
|-------|-----------|-----------------|
| Sun Tzu | Master Strategist | Competitive strategy, positioning |
| Cicero | Debate Coach | Rigorous analysis, argumentation |
| Sophia | Ethics Advisor | Principled decision-making |
| Augustus | Policy Analyst | Evidence-based policy |
| Magnus | Political Strategist | Power dynamics, influence |
| Geneva | Stakeholder Mediator | Conflict resolution |
| Giuseppe | Communications Dir | Crisis communications |
| Edmund Burke | The Conservative | Tradition, stability |
| Maximilien | The Revolutionary | Disruption, transformation |
| Lee | Strategist-Warrior | Military-style strategy |
| Otto | The Realist | Pragmatic power politics |
| Dwight | Principled Commander | Values-based leadership |
| Ataturk | The Liberator | Modernization, reform |
| Herbert | The Technocrat | Data-driven decisions |

#### Key Workflows
- **strategic-decision-workshop** - Multi-perspective analysis
- **board-presentation-prep** - Executive presentations
- **crisis-response-planning** - Crisis management
- **competitive-warfare** - Competitive strategy
- **ethical-dilemma-resolution** - Ethics analysis
- **ma-due-diligence** - M&A evaluation

#### Best For
- C-suite executives
- Board members
- Strategic planners
- Crisis managers
- Political advisors

---

### 6. Cybersecurity Operations Team

**Code:** `cybersec-team`
**Status:** Optional (not default)
**Version:** 1.3.0

#### Purpose
Comprehensive cybersecurity coverage from threat analysis to incident response, compliance, and security architecture.

#### Agents
| Agent | Role | Specialty |
|-------|------|-----------|
| Cipher | Threat Intelligence | APT analysis, threat landscape |
| Bastion | Security Architect | Zero trust, security design |
| Sentinel | Compliance Guardian | GRC, regulatory compliance |
| Trace | Forensic Investigator | Evidence preservation, analysis |
| Phoenix | Incident Commander | Crisis management, IR |
| Spectre | Penetration Tester | Red team, offensive security |
| Watchman | SOC Analyst | Detection, monitoring |
| Nimbus | Cloud Security | AWS/Azure/GCP security |
| Ledger | Blockchain Security | Web3, smart contracts |
| Weaver | Web App Security | OWASP, web vulnerabilities |
| Gateway | API Security | OAuth, API protection |
| Oracle | AI/ML Security | LLM security, AI safety |
| Shield | Blue Team Lead | Defensive security |
| Phantom | Mobile Security | iOS/Android security |
| Ghost | Social Engineer | Awareness training |

#### Key Workflows
- **threat-modeling** - Threat analysis
- **incident-response-playbook** - IR procedures
- **security-architecture-review** - Architecture assessment
- **vulnerability-management** - Vuln lifecycle
- **compliance-audit-prep** - Audit preparation
- **penetration-testing** - Security testing

#### Best For
- Security operations centers
- CISOs and security leadership
- DevSecOps teams
- Compliance officers
- Red/Blue team operators

---

### 7. Creative Innovation Studio (CIS)

**Code:** `cis`
**Status:** Optional (not default)
**Version:** 1.0.0

#### Purpose
Structured creativity and innovation facilitation using proven methodologies and creative thinking frameworks.

#### Agents
| Agent | Role | Specialty |
|-------|------|-----------|
| Victor | Innovation Strategist | Strategic innovation |
| Dr. Quinn | Problem Solver | Lateral thinking, TRIZ |
| Maya | Design Thinking Coach | Human-centered design |
| Marcus | Storyteller | Narrative craft |
| Aria | Presentation Master | Visual communication |
| Alex | Brainstorming Coach | Ideation facilitation |

#### Key Workflows
- **brainstorming** - Facilitated ideation sessions
- **design-thinking** - HCD methodology
- **innovation-strategy** - Innovation planning
- **storytelling** - Narrative development

#### Best For
- Innovation teams
- Design thinkers
- Marketing creatives
- Product ideation
- Presentation designers

---

### 8. BMAD Game Development (BMGD)

**Code:** `bmgd`
**Status:** Optional (not default)
**Version:** 1.0.0

#### Purpose
Game development lifecycle from concept to launch, supporting Unity, Unreal Engine, and Godot.

#### Agents
| Agent | Role | Specialty |
|-------|------|-----------|
| Samus Shepard | Game Designer | GDD, mechanics design |
| Max | Game Scrum Master | Sprint management |
| Winston | Game Architect | Engine, systems design |
| Devon | Game Developer | Implementation |
| GLaDOS | Game QA | Testing, certification |
| Solo Dev | Game Solo Dev | Rapid prototyping |

#### Supported Engines
- Unity (C#)
- Unreal Engine (C++/Blueprints)
- Godot (GDScript/C#)
- Custom engines

#### Key Workflows
- **game-brief** - Initial concept
- **gdd-creation** - Game design documents
- **technical-design** - Engine architecture
- **sprint-planning** - Game dev sprints
- **qa-certification** - Launch readiness

#### Best For
- Indie game developers
- Game studios
- Game design students
- Rapid prototyping

---

### 9. BMAD Builder (BMB)

**Code:** `bmb`
**Status:** Optional (not default)
**Version:** 1.0.0

#### Purpose
Create custom agents, workflows, and modules to extend the BMAD ecosystem.

#### Agents
| Agent | Role | Creates |
|-------|------|---------|
| Agent Builder | Agent Creator | New BMAD agents |
| Workflow Builder | Workflow Designer | Workflow definitions |
| Module Builder | Module Packager | Complete modules |

#### Key Workflows
- **create-agent** - Design new agents
- **create-workflow** - Build workflows
- **package-module** - Bundle for distribution

#### Best For
- BMAD power users
- Organizations customizing BMAD
- Module contributors
- Workflow designers

---

## Module Selection Guide

### By Role

| Your Role | Recommended Modules |
|-----------|---------------------|
| **Software Developer** | Core + BMM |
| **Product Manager** | Core + BMM + CIS |
| **Security Professional** | Core + Cybersec + Intel |
| **Executive/CEO** | Core + Strategy + Legal |
| **Game Developer** | Core + BMGD |
| **Intelligence Analyst** | Core + Intel + Cybersec |
| **Legal Professional** | Core + Legal |
| **Innovation Lead** | Core + CIS + Strategy |
| **Full Stack** | Core + BMM + Cybersec |

### By Use Case

| Use Case | Modules |
|----------|---------|
| Build a SaaS product | Core + BMM |
| Conduct security assessment | Core + Cybersec |
| Legal contract review | Core + Legal |
| Strategic planning | Core + Strategy |
| Competitive intelligence | Core + Intel + Strategy |
| Game development | Core + BMGD |
| Brainstorming session | Core + CIS |
| Custom module creation | Core + BMB |

---

## Module Dependencies

```
Core (Required)
  │
  ├── BMM (Standalone)
  ├── Intel-Team (Standalone)
  ├── Legal-Team (Standalone)
  ├── Strategy-Team (Standalone)
  ├── Cybersec-Team (Standalone)
  ├── CIS (Standalone)
  ├── BMGD (Standalone)
  └── BMB (Standalone)
```

All modules depend only on Core. No inter-module dependencies.

---

## Installation

```bash
# Install with specific modules
bmad install --modules core,bmm,cybersec-team

# Interactive installation (choose modules)
bmad install

# Install all modules
bmad install --all
```

---

## Cross-Module Integration

Modules can work together through Core's orchestration:

1. **Party Mode** - Assemble agents from multiple modules
2. **Abdul Coordination** - Cross-module task routing
3. **Shared Schemas** - Common data formats
4. **Unified Outputs** - Consistent artifact structure

### Example: Security-Aware Development
Combine BMM + Cybersec for secure development:
- Use BMM for architecture
- Use Cybersec for threat modeling
- Use Party Mode for joint review

---

## Summary

| Choosing... | Consider... |
|-------------|-------------|
| **BMM** | Full development lifecycle needed |
| **Intel-Team** | Professional intelligence operations |
| **Legal-Team** | Multi-jurisdiction legal guidance |
| **Strategy-Team** | Executive decision support |
| **Cybersec-Team** | Security operations and compliance |
| **CIS** | Innovation and creative processes |
| **BMGD** | Game development projects |
| **BMB** | Extending BMAD capabilities |

---

*Document generated: 2026-01-26*
*Location: Docs/02-user-guides/MODULE-COMPARISON-MATRIX.md*
