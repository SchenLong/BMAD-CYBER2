# BMAD Framework Agents Reference

## Overview

Agents in the BMAD framework are specialized AI personas designed to assist with specific domains and tasks. Each agent has a unique identity, communication style, and expertise area. Agents can be invoked to provide domain-specific guidance, execute workflows, and collaborate with users on complex projects.

## How to Invoke Agents

Agents can be invoked using the Skill tool with the agent's qualified name:

```
bmad:<module>:agents:<agent-name>
```

For example:

- `bmad:core:agents:abdul` - Invokes Abdul, the Master Project Manager
- `bmad:intel-team:agents:osint-lead` - Invokes Vector, the Intelligence Operations Director
- `bmad:cybersec-team:agents:penetration-tester` - Invokes Ghost, the Offensive Security Expert

Once an agent is activated, it will present a menu of available actions and respond to commands using fuzzy matching or menu item numbers.

---

## Agents by Module

### Core Module

| Agent | Display Name | Description |
|-------|--------------|-------------|
| abdul | Abdul | Master Project Manager + Cross-Module Orchestrator |
| bmad-master | BMad Master | BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator |

### BMB (BMAD Module Builder)

| Agent | Display Name | Description |
|-------|--------------|-------------|
| agent-builder | Bond | Agent Architecture Specialist + BMAD Compliance Expert |
| module-builder | Morgan | Module Architecture Specialist + Full-Stack Systems Designer |
| workflow-builder | Wendy | Workflow Architecture Specialist + Process Design Expert |

### BMM (BMAD Method Module)

| Agent | Display Name | Description |
|-------|--------------|-------------|
| analyst | Mary | Strategic Business Analyst + Requirements Expert |
| architect | Winston | System Architect + Technical Design Leader |
| dev | Amelia | Senior Software Engineer |
| pm | John | Product Manager specializing in collaborative PRD creation |
| quick-flow-solo-dev | Barry | Elite Full-Stack Developer + Quick Flow Specialist |
| sm | Bob | Technical Scrum Master + Story Preparation Specialist |
| tea | Murat | Master Test Architect |
| tech-writer | Paige | Technical Documentation Specialist + Knowledge Curator |
| ux-designer | Sally | User Experience Designer + UI Specialist |

### BMGD (Game Development Module)

| Agent | Display Name | Description |
|-------|--------------|-------------|
| game-architect | Cloud Dragonborn | Principal Game Systems Architect + Technical Director |
| game-designer | Samus Shepard | Lead Game Designer + Creative Vision Architect |
| game-dev | Link Freeman | Senior Game Developer + Technical Implementation Specialist |
| game-qa | GLaDOS | Game QA Architect + Test Automation Specialist |
| game-scrum-master | Max | Game Development Scrum Master + Sprint Orchestrator |
| game-solo-dev | Indie | Elite Indie Game Developer + Quick Flow Specialist |

### CIS (Creative & Innovation Suite)

| Agent | Display Name | Description |
|-------|--------------|-------------|
| brainstorming-coach | Carson | Master Brainstorming Facilitator + Innovation Catalyst |
| creative-problem-solver | Dr. Quinn | Systematic Problem-Solving Expert + Solutions Architect |
| design-thinking-coach | Maya | Human-Centered Design Expert + Empathy Architect |
| innovation-strategist | Victor | Business Model Innovator + Strategic Disruption Expert |
| presentation-master | Caravaggio | Visual Communication Expert + Presentation Designer |
| storyteller | Sophia | Expert Storytelling Guide + Narrative Strategist |

### Cybersec Team

| Agent | Display Name | Description |
|-------|--------------|-------------|
| api-security-expert | Gateway | API Security Specialist + OAuth/Identity Expert |
| blockchain-security-expert | Ledger | Web3 & Smart Contract Security Specialist |
| blue-team-lead | Shield | Blue Team Lead + Detection Engineering Manager |
| cloud-security-specialist | Nimbus | Cloud Security Architect + Multi-Cloud Security Expert |
| compliance-guardian | Sentinel | Risk & Regulatory Compliance Expert + Auditor |
| forensic-investigator | Trace | Digital Forensics Investigator + Evidence Analyst |
| incident-commander | Phoenix | Incident Response Lead + Crisis Manager |
| llm-ai-security-expert | Oracle | LLM Security Expert + AI Governance Advisor |
| mobile-security-expert | Phantom | Mobile Application Security Specialist |
| penetration-tester | Ghost | Offensive Security Expert + Red Team Operator |
| security-architect | Bastion | Security Architect + Defense Strategist |
| soc-analyst | Watchman | Security Operations Center Analyst |
| social-engineer | Ghost | Social Engineering Specialist + Human Factor Security Expert |
| threat-analyst | Cipher | Threat Intelligence Specialist + Adversary Behavior Analyst |
| web-app-security-expert | Weaver | Web Application Security Specialist + OWASP Expert |

### Intel Team

| Agent | Display Name | Description |
|-------|--------------|-------------|
| corporate-intel-specialist | Proxy | Corporate Intelligence (CORPINT) Specialist + Financial Intelligence Analyst |
| dark-web-analyst | Shadow | Dark Web Intelligence (DARKINT) Analyst + Underground Operations Specialist |
| domain-intel-specialist | Resolver | Network & Domain Intelligence Specialist + Infrastructure Reconnaissance Expert |
| field-operative | Specter | Field Operations Specialist + Surveillance/Counter-Surveillance Expert |
| geospatial-analyst | Atlas | Geospatial Intelligence (GEOINT) Analyst + Imagery Intelligence Specialist |
| humint-specialist | Viper | Human Intelligence (HUMINT) Specialist + Elicitation Expert |
| osint-lead | Vector | Intelligence Operations Director + All-Source Fusion Specialist |
| sigint-specialist | Sigil | Signals Intelligence (SIGINT) Specialist + Communications Analysis Expert |
| social-media-analyst | Echo | Social Media Intelligence (SOCMINT) Analyst + Digital Footprint Specialist |
| technical-researcher | Probe | Technical Intelligence (TECHINT) Researcher + Digital Reconnaissance Specialist |
| threat-actor-profiler | Dossier | Threat Actor Profiler + Adversary Intelligence Specialist |

### Legal Team

| Agent | Display Name | Description |
|-------|--------------|-------------|
| advocate | Advocate | Litigation Strategist - Civil Dispute Resolution Expert |
| baltic | Baltic | Estonia Corporate Counsel - Estonian e-Residency and Digital Business Specialist |
| castile | Castile | Spanish Law Specialist - Corporate law, civil code, autonomous community regulations |
| charter | Charter | Corporate Governance Counsel - Board Matters, Fiduciary Duties Specialist |
| counsel | Counsel | General Counsel and Legal Team Director |
| covenant | Covenant | Contract Specialist - Cross-Jurisdictional Contract Expert |
| deed | Deed | Real Estate Counsel - Property Transactions and Real Property Law Specialist |
| europa | Europa | EU Counsel - European Union Law Specialist and Cross-Border Coordinator |
| gremio | Gremio | Spain Labor Law Counsel - Spanish Employment and Labor Law Specialist |
| iberia | Iberia | Spain Civil Law Counsel - Family, property, inheritance, personal matters |
| insignia | Insignia | IP Counsel - Intellectual Property Specialist |
| liberty | Liberty | US Counsel - American Corporate and Civil Law Specialist |
| tribute | Tribute | Tax Counsel - Cross-Jurisdictional Tax Specialist |

### Strategy Team

| Agent | Display Name | Description |
|-------|--------------|-------------|
| communications-director | Giuseppe | Senior Communications Strategist + Crisis Communications Specialist |
| debate-coach | Cicero | World-Class Debate Coach + Argumentation Theorist |
| ethics-advisor | Sophia | Political Philosopher + Applied Ethics Expert |
| policy-analyst | Augustus | Senior Policy Analyst + Evidence-Based Decision Expert |
| political-strategist | Magnus | Veteran Political Strategist + Coalition Architect |
| stakeholder-mediator | Geneva | Master Negotiator + Multi-Party Facilitator |
| the-conservative | Burke | Guardian of Tradition + Prudent Reformer |
| the-liberator | Charles | Moral Transformer + Crisis Leader |
| the-master-strategist | Sun | Supreme Strategist + Master of Comprehensive Strategy |
| the-principled-commander | Jean-Luc | Principled Commander + Diplomat Leader |
| the-realist | Niccolo | Master of Realpolitik + Power Analyst |
| the-revolutionary | Maximilien | Agent of Radical Change + Systemic Challenger |
| the-strategist-warrior | Musashi | Master of Timing + Warrior-Philosopher |
| the-technocrat | Lee | Builder of Systems + Pragmatic Governor |

---

## Agent Capabilities

Each agent typically provides:

1. **Menu-Driven Interaction** - Agents present numbered menus for common actions
2. **Fuzzy Command Matching** - Commands can be entered by number, abbreviation, or natural language
3. **Workflow Execution** - Many agents can execute structured workflows for complex tasks
4. **Party Mode** - Most agents support "Party Mode" for multi-agent collaborative discussions
5. **Chat Mode** - All agents support free-form conversation about their domain expertise

## Agent Files Location

Agent definition files are located at:

```
_bmad/<module>/agents/<agent-name>.md
```

The agent manifest listing all agents is at:

```
_bmad/_config/agent-manifest.csv
```

---

## Quick Reference by Expertise

### For Project Management

- **Abdul** (core) - Cross-module project orchestration

### For Software Development

- **Winston** (bmm) - Architecture and system design
- **Amelia** (bmm) - Implementation and coding
- **Barry** (bmm) - Quick flow solo development
- **Bob** (bmm) - Sprint and story management
- **Murat** (bmm) - Test architecture

### For Security

- **Bastion** (cybersec) - Security architecture
- **Ghost** (cybersec) - Penetration testing
- **Phoenix** (cybersec) - Incident response
- **Sentinel** (cybersec) - Compliance and risk

### For Intelligence

- **Vector** (intel) - Intelligence operations director
- **Shadow** (intel) - Dark web analysis
- **Dossier** (intel) - Threat actor profiling

### For Legal

- **Counsel** (legal) - General counsel and routing
- **Liberty** (legal) - US law
- **Europa** (legal) - EU law

### For Strategy

- **Sun** (strategy) - Strategic planning
- **Magnus** (strategy) - Political strategy
- **Geneva** (strategy) - Negotiation and mediation
