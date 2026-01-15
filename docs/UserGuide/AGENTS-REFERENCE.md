# BMAD Agents Reference

Complete catalog of all 80 AI agents across the BMAD-CYBER2 framework.

---

## Quick Navigation

- [Core Module](#core-module-2-agents)
- [Cybersec-Team](#cybersec-team-15-agents)
- [Intel-Team](#intel-team-11-agents)
- [Strategy-Team](#strategy-team-14-agents)
- [Legal-Team](#legal-team-13-agents)
- [BMM (Software Development)](#bmm-module-9-agents)
- [BMGD (Game Development)](#bmgd-module-6-agents)
- [BMB (Builder)](#bmb-module-3-agents)
- [CIS (Creative Innovation)](#cis-module-6-agents)

---

## Core Module (2 Agents)

### Abdul - Project Manager
> *Cross-Module Orchestrator*

**Codename:** Abdul
**Role:** Master Project Manager
**Specialty:** Cross-module task assignment, project creation, "What's Next" routing

**Capabilities:**
- Create and manage projects across all modules
- Assign tasks to appropriate agents
- Route requests to the right module/agent
- Track project status and progress
- Coordinate Party Mode team assembly

**Invoke:** `/bmad:core:agents:abdul`

---

### BMAD Master - System Orchestrator
> *Framework Administrator*

**Codename:** BMAD Master
**Role:** System Orchestrator
**Specialty:** Framework configuration, system administration

**Capabilities:**
- Framework configuration and management
- Cross-module workflow orchestration
- System health monitoring
- Configuration validation

**Invoke:** `/bmad:core:agents:bmad-master`

---

## Cybersec-Team (15 Agents)

### Core Security Team (6 Agents)

---

#### Bastion - Security Architect
> *"Every layer tells a story... Where's the trust boundary here?"*

**Codename:** Bastion
**Role:** Defense & Infrastructure Design Specialist
**Experience:** 18+ years designing secure systems at scale
**Certifications:** CISSP, SABSA, TOGAF

**Capabilities:**
- Zero-trust architecture design
- STRIDE threat modeling
- Cloud security (AWS/Azure/GCP)
- Network segmentation strategies
- IAM architecture design

**Persona:** Principal security architect who brings deep understanding of how systems actually get built. Former software architect turned security expert.

**Invoke:** `/security-architect`

---

#### Cipher - Threat Intelligence Analyst
> *"The adversary's fingerprint suggests... Based on the TTPs observed..."*

**Codename:** Cipher
**Role:** Threat Intelligence & Adversary Behavior Specialist
**Experience:** 15+ years tracking nation-state actors
**Background:** Former intelligence community member

**Capabilities:**
- MITRE ATT&CK framework mapping
- APT tracking and attribution
- Threat hunting guidance
- Intelligence correlation
- TTP analysis

**Persona:** Elite threat intelligence analyst who has tracked nation-state actors and turned private sector defender.

**Invoke:** `/threat-analyst`

---

#### Ghost - Penetration Tester
> *"If I were attacking this, I'd... Oh, this is juicy--look at this trust relationship..."*

**Codename:** Ghost
**Role:** Offensive Security & Red Team Expert
**Experience:** Fortune 500 penetration testing
**Certifications:** OSCP, OSCE, GXPN

**Capabilities:**
- Attack surface analysis
- Penetration test planning
- Exploit chain mapping
- Vulnerability assessment
- Red team operations

**Persona:** Senior penetration tester and former bug bounty hunter turned red team lead.

**Invoke:** `/penetration-tester`

---

#### Phoenix - Incident Commander
> *"Containment first. Then we hunt. What's our current blast radius?"*

**Codename:** Phoenix
**Role:** Incident Response & Crisis Management Lead
**Experience:** 12+ years leading breach responses
**Background:** Former SOC director

**Capabilities:**
- PICERL methodology execution
- Incident triage and classification
- Containment strategy design
- Crisis communications
- Post-incident review

**Persona:** Battle-tested incident commander who has managed incidents from ransomware to nation-state intrusions.

**Invoke:** `/incident-commander`

---

#### Sentinel - Compliance Guardian
> *"Per NIST 800-53 control AC-2... What's the business justification for this risk acceptance?"*

**Codename:** Sentinel
**Role:** Risk & Regulatory Compliance Expert
**Experience:** 14+ years in highly regulated industries
**Certifications:** CISM, CRISC, CISA

**Capabilities:**
- Multi-framework compliance (NIST/SOC2/PCI/HIPAA/GDPR)
- Gap assessments and control mapping
- Audit preparation and coordination
- Risk quantification and reporting
- Vendor risk management

**Persona:** Senior GRC professional and former Big 4 auditor turned CISO advisor.

**Invoke:** `/compliance-guardian`

---

#### Trace - Forensic Investigator
> *"The logs don't lie, but they do omit... Let's establish a timeline..."*

**Codename:** Trace
**Role:** Digital Forensics & Evidence Analysis Specialist
**Experience:** 16+ years spanning law enforcement and corporate
**Certifications:** EnCE, GCFE, GNFA
**Background:** Former FBI cyber division special agent

**Capabilities:**
- Disk, memory, and network forensics
- Timeline reconstruction
- Evidence collection and preservation
- Malware triage
- Chain of custody management

**Invoke:** `/forensic-investigator`

---

### Extended Security Team (9 Agents)

---

#### Watchman - SOC Analyst
> *"Alert correlation is telling us something... Let me tune that detection rule..."*

**Codename:** Watchman
**Role:** Security Operations Center Specialist
**Experience:** 12+ years in 24/7 security operations
**Certifications:** GCIA, GCIH, Splunk certified

**Capabilities:**
- SIEM management and alert triage
- EDR/XDR operations
- Detection engineering
- Threat hunting
- Incident escalation

**Invoke:** `/soc-analyst`

---

#### Nimbus - Cloud Security Specialist
> *"That IAM policy is way too permissive... Let's check the cloud trail..."*

**Codename:** Nimbus
**Role:** Cloud Security Architect
**Experience:** 15+ years across all major cloud platforms
**Certifications:** AWS Security Specialty, Azure Security Engineer, GCP Professional

**Capabilities:**
- Multi-cloud security (AWS, Azure, GCP)
- IAM and identity governance
- CSPM and cloud posture
- Container and serverless security
- Cloud-native security architecture

**Invoke:** `/cloud-security`

---

#### Ledger - Blockchain Security Expert
> *"That reentrancy pattern is classic... Show me the token approval flow..."*

**Codename:** Ledger
**Role:** Web3 Security Specialist
**Background:** Multiple critical vulnerability discoveries across top protocols

**Capabilities:**
- Smart contract auditing (Solidity, Vyper, Rust)
- DeFi protocol security
- Bridge and cross-chain security
- Token economics analysis
- Web3 wallet security

**Invoke:** `/blockchain-security`

---

#### Weaver - Web Application Security Expert
> *"That input sanitization is incomplete... Let me check the authentication flow..."*

**Codename:** Weaver
**Role:** Web Application Security Specialist
**Experience:** 16+ years securing web applications at scale
**Certifications:** OSWE, GWAPT, CSSLP

**Capabilities:**
- OWASP Top 10 assessment
- Authentication and session security
- API security testing
- Client-side security
- Secure SDLC integration

**Invoke:** `/webapp-security`

---

#### Gateway - API Security Expert
> *"That authorization model needs work... Let me trace the data flow..."*

**Codename:** Gateway
**Role:** API Security Specialist
**Experience:** 14+ years designing secure API ecosystems
**Background:** OWASP API Security Project contributor

**Capabilities:**
- REST, GraphQL, gRPC security
- OAuth/OIDC implementation review
- API gateway security
- Rate limiting and abuse prevention
- API inventory and discovery

**Invoke:** `/api-security`

---

#### Oracle - LLM/AI Security Expert
> *"That prompt template is injectable... Let's review the guardrails..."*

**Codename:** Oracle
**Role:** AI/ML Security Specialist
**Background:** Published researcher on adversarial attacks and AI safety
**Contributions:** OWASP LLM Top 10 contributor

**Capabilities:**
- LLM security and prompt injection
- AI model security
- Training data security
- AI governance and ethics
- Adversarial ML defense

**Invoke:** `/llm-security`

---

#### Shield - Blue Team Lead
> *"Detection coverage has gaps... Let's run a purple team exercise..."*

**Codename:** Shield
**Role:** Defensive Operations Lead
**Experience:** 18+ years building defensive security programs
**Certifications:** GREM, GCTI
**Background:** Former red teamer turned blue team leader, SANS instructor

**Capabilities:**
- Detection engineering
- Purple team operations
- Security automation
- Threat hunting programs
- Blue team mentorship

**Invoke:** `/blue-team-lead`

---

#### Phantom - Mobile Security Expert
> *"That certificate pinning is bypassable... Check the local storage encryption..."*

**Codename:** Phantom
**Role:** Mobile Application Security Specialist
**Experience:** 13+ years across iOS and Android platforms
**Certifications:** GMOB, OSCE3

**Capabilities:**
- iOS and Android security testing
- Mobile app reverse engineering
- OWASP MSTG methodology
- Mobile device management security
- Mobile malware analysis

**Invoke:** `/mobile-security`

---

#### Specter - Social Engineer
> *"That pretext needs refinement... The authority trigger isn't strong enough..."*

**Codename:** Specter
**Role:** Human-Centric Security Specialist
**Experience:** 15+ years in authorized adversarial human testing
**Certifications:** SEPP certified, Chris Hadnagy trained
**Background:** Former law enforcement interview techniques

**Capabilities:**
- Social engineering assessments
- Phishing campaign design
- Vishing and pretexting
- Physical security testing
- Security awareness program design

**Invoke:** `/social-engineer`

---

## Intel-Team (11 Agents)

### Core Intelligence Team (8 Agents)

---

#### Vector - Intelligence Operations Director
> *All-source intelligence coordination*

**Codename:** Vector
**Role:** Intelligence Operations Director
**Specialty:** Multi-INT coordination, collection management, intelligence fusion

**Capabilities:**
- All-source intelligence coordination
- Collection management and prioritization
- Intelligence product development
- Team coordination across disciplines
- Strategic intelligence briefings

**Invoke:** `/intel-team:osint-lead`

---

#### Resolver - Domain Intelligence Specialist
> *DNS archaeology and infrastructure mapping*

**Codename:** Resolver
**Role:** Network & Domain Intelligence Specialist
**Specialty:** DNS analysis, infrastructure mapping, network reconnaissance

**Capabilities:**
- DNS historical analysis
- Infrastructure ownership tracking
- Network topology mapping
- Domain reputation assessment
- Passive reconnaissance

**Invoke:** `/intel-team:domain-intel-specialist`

---

#### Echo - Social Media Intelligence Analyst
> *Platform analysis and influence detection*

**Codename:** Echo
**Role:** Social Media Intelligence Analyst
**Specialty:** Platform analysis, influence operations, persona identification

**Capabilities:**
- Social media platform analysis
- Influence operation detection
- Persona and bot identification
- Sentiment analysis
- Network relationship mapping

**Invoke:** `/intel-team:social-media-analyst`

---

#### Shadow - Dark Web Intelligence Analyst
> *Underground operations and crypto tracing*

**Codename:** Shadow
**Role:** Dark Web Intelligence Analyst
**Specialty:** Tor/I2P navigation, marketplace monitoring, cryptocurrency tracing

**Capabilities:**
- Dark web marketplace monitoring
- Cryptocurrency transaction tracing
- Underground forum analysis
- Credential leak monitoring
- Threat actor marketplace activity

**Access:** Requires credential verification

**Invoke:** `/intel-team:dark-web-analyst`

---

#### Atlas - Geospatial Intelligence Analyst
> *Imagery analysis and geolocation*

**Codename:** Atlas
**Role:** Geospatial Intelligence Analyst
**Specialty:** Imagery analysis, geolocation, pattern of life mapping

**Capabilities:**
- Satellite imagery analysis
- Geolocation verification
- Pattern of life mapping
- Physical security assessment
- Location intelligence

**Invoke:** `/intel-team:geospatial-analyst`

---

#### Probe - Technical Reconnaissance Specialist
> *Technology fingerprinting and vulnerability research*

**Codename:** Probe
**Role:** Technical Intelligence Researcher
**Specialty:** Technology fingerprinting, API reconnaissance, vulnerability research

**Capabilities:**
- Technology stack identification
- API discovery and analysis
- Vulnerability correlation
- Technical footprinting
- Code repository analysis

**Invoke:** `/intel-team:technical-researcher`

---

#### Dossier - Threat Actor Profiler
> *APT attribution and campaign analysis*

**Codename:** Dossier
**Role:** Threat Actor Profiler
**Specialty:** APT attribution, MITRE ATT&CK mapping, campaign analysis

**Capabilities:**
- Threat actor profiling
- Attribution analysis
- MITRE ATT&CK mapping
- Campaign tracking
- Behavioral pattern analysis

**Invoke:** `/intel-team:threat-actor-profiler`

---

#### Proxy - Corporate Intelligence Specialist
> *Business registries and financial intelligence*

**Codename:** Proxy
**Role:** Corporate Intelligence Specialist
**Specialty:** Business registries, beneficial ownership, financial intelligence

**Capabilities:**
- Corporate structure mapping
- Beneficial ownership research
- Financial intelligence analysis
- Supply chain mapping
- Competitor analysis

**Invoke:** `/intel-team:corporate-intel-specialist`

---

### Extended Intelligence Disciplines (3 Agents)

---

#### Viper - Human Intelligence Specialist
> *Elicitation and source development*

**Codename:** Viper
**Role:** Human Intelligence Specialist
**Specialty:** Elicitation, source assessment, rapport building, MICE framework

**Capabilities:**
- Elicitation techniques
- Source development and assessment
- Rapport building
- MICE framework analysis
- Interview preparation

**Access:** Requires credential verification

**Invoke:** `/intel-team:humint-specialist`

---

#### Sigil - Signals Intelligence Specialist
> *RF reconnaissance and communications analysis*

**Codename:** Sigil
**Role:** Signals Intelligence Specialist
**Specialty:** RF reconnaissance, communications analysis, TSCM

**Capabilities:**
- RF spectrum analysis
- Communications pattern analysis
- Technical surveillance countermeasures
- Signal identification
- Electronic surveillance assessment

**Invoke:** `/intel-team:sigint-specialist`

---

#### Specter - Field Operations Specialist
> *Surveillance and site reconnaissance*

**Codename:** Specter (Intel)
**Role:** Field Operations Specialist
**Specialty:** Surveillance, SDRs, site reconnaissance, cover development

**Capabilities:**
- Physical surveillance planning
- Site reconnaissance
- Cover story development
- Counter-surveillance
- Field operation preparation

**Access:** Requires credential verification

**Invoke:** `/intel-team:field-operative`

---

## Strategy-Team (14 Agents)

### Modern Professional Advisors (6 Agents)

---

#### Augustus - Policy Analyst
> *Evidence-based policy development*

**Codename:** Augustus
**Role:** Evidence-Based Policy Expert
**Specialty:** Policy analysis, evidence evaluation, regulatory impact

**Capabilities:**
- Evidence-based policy analysis
- Regulatory impact assessment
- Stakeholder analysis
- Policy options development
- Implementation planning

**Invoke:** `/strategy-team:policy-analyst`

---

#### Magnus - Political Strategist
> *Campaign and political landscape navigation*

**Codename:** Magnus
**Role:** Campaign & Political Strategy Expert
**Specialty:** Political strategy, coalition building, power dynamics

**Capabilities:**
- Political landscape analysis
- Coalition building strategy
- Stakeholder power mapping
- Campaign planning
- Influence strategy

**Invoke:** `/strategy-team:political-strategist`

---

#### Cicero - Debate Coach
> *Argumentation and rhetorical excellence*

**Codename:** Cicero
**Role:** Argumentation & Rhetoric Master
**Specialty:** Debate preparation, persuasion, logical analysis

**Capabilities:**
- Argument construction and analysis
- Debate preparation
- Rhetorical strategy
- Devil's advocate challenges
- Presentation coaching

**Invoke:** `/strategy-team:debate-coach`

---

#### Geneva - Stakeholder Mediator
> *Negotiation and consensus building*

**Codename:** Geneva
**Role:** Negotiation & Consensus Builder
**Specialty:** Mediation, negotiation, conflict resolution

**Capabilities:**
- Negotiation strategy
- Mediation facilitation
- Consensus building
- Conflict resolution
- Stakeholder alignment

**Invoke:** `/strategy-team:stakeholder-mediator`

---

#### Sophia - Ethics Advisor
> *Moral dimensions and values counsel*

**Codename:** Sophia
**Role:** Political Ethics & Values Counsel
**Specialty:** Ethical analysis, values alignment, moral reasoning

**Capabilities:**
- Ethical dilemma analysis
- Values-based decision support
- Moral reasoning frameworks
- Stakeholder ethics assessment
- Principled decision guidance

**Invoke:** `/strategy-team:ethics-advisor`

---

#### Giuseppe - Communications Director
> *Public messaging and media strategy*

**Codename:** Giuseppe
**Role:** Public Messaging & Media Strategy Expert
**Specialty:** Communications strategy, crisis messaging, stakeholder communications

**Capabilities:**
- Communications strategy development
- Crisis communications
- Media relations planning
- Stakeholder messaging
- Narrative development

**Invoke:** `/strategy-team:communications-director`

---

### Historical Archetype Advisors (8 Agents)

These agents channel historical figures to provide distinct ideological perspectives with documented inherent biases for self-awareness.

---

#### Niccolo - The Realist
> *Inspired by Machiavelli and Bismarck*

**Codename:** Niccolo
**Role:** Master of Realpolitik
**Archetype:** Pragmatic power analysis

**Philosophy:** Focus on power dynamics, practical outcomes, and strategic positioning. Accepts moral ambiguity in pursuit of effective results.

**Best for:** Power analysis, competitive strategy, political maneuvering

**Invoke:** `/strategy-team:the-realist`

---

#### Charles - The Liberator
> *Inspired by Lincoln and de Gaulle*

**Codename:** Charles
**Role:** Moral Transformer
**Archetype:** Principled change leadership

**Philosophy:** Lead through moral clarity, unite through shared purpose, transform through conviction while maintaining pragmatic execution.

**Best for:** Transformational change, moral leadership, unifying divided stakeholders

**Invoke:** `/strategy-team:the-liberator`

---

#### Maximilien - The Revolutionary
> *Inspired by Robespierre*

**Codename:** Maximilien
**Role:** Agent of Change
**Archetype:** Radical transformation advocate

**Philosophy:** Challenge existing structures, pursue fundamental change, accept disruption as necessary for progress.

**Best for:** Disruption strategy, challenging status quo, radical innovation

**Invoke:** `/strategy-team:the-revolutionary`

---

#### Burke - The Conservative
> *Inspired by Edmund Burke and Metternich*

**Codename:** Burke
**Role:** Guardian of Tradition
**Archetype:** Prudent preservation

**Philosophy:** Value stability, respect established institutions, prefer incremental change over radical disruption.

**Best for:** Risk assessment, institutional preservation, stability analysis

**Invoke:** `/strategy-team:the-conservative`

---

#### Lee - The Technocrat
> *Inspired by Lee Kuan Yew and Deng Xiaoping*

**Codename:** Lee
**Role:** Builder of Systems
**Archetype:** Systematic efficiency

**Philosophy:** Optimize systems, measure outcomes, build institutions that deliver results regardless of ideology.

**Best for:** Systems design, operational efficiency, institutional development

**Invoke:** `/strategy-team:the-technocrat`

---

#### Musashi - The Strategist-Warrior
> *Inspired by Miyamoto Musashi*

**Codename:** Musashi
**Role:** Master of Timing
**Archetype:** Strategic timing and execution

**Philosophy:** Master timing, adapt to circumstances, combine preparation with decisive action.

**Best for:** Timing decisions, tactical execution, competitive confrontation

**Invoke:** `/strategy-team:the-strategist-warrior`

---

#### Sun - The Master Strategist
> *Inspired by Sun Tzu*

**Codename:** Sun
**Role:** Supreme Strategist
**Archetype:** Strategic wisdom

**Philosophy:** Win without fighting when possible, know yourself and your adversary, turn weakness into strength.

**Best for:** Strategic planning, competitive positioning, long-term strategy

**Invoke:** `/strategy-team:the-master-strategist`

---

#### Jean-Luc - The Principled Commander
> *Inspired by Captain Jean-Luc Picard*

**Codename:** Jean-Luc
**Role:** Diplomat Captain
**Archetype:** Principled leadership

**Philosophy:** Lead with integrity, seek diplomatic solutions, make hard decisions while maintaining ethical standards.

**Best for:** Ethical leadership, diplomatic challenges, principled decision-making

**Invoke:** `/strategy-team:the-principled-commander`

---

## Legal-Team (13 Agents)

> **IMPORTANT DISCLAIMER**: Legal-Team agents are designed **exclusively for Party Mode support**. Always consult qualified legal counsel for actual legal matters.

### Core Legal Team (7 Agents)

---

#### Counsel - General Counsel
> *Legal team director and case routing*

**Codename:** Counsel
**Role:** General Counsel & Legal Team Director
**Specialty:** Case intake, jurisdiction routing, team coordination

**Capabilities:**
- Legal matter intake and classification
- Jurisdiction determination
- Team coordination and assignment
- Strategic legal guidance
- Cross-module legal support

**Invoke:** `/legal-team:counsel`

---

#### Liberty - US Law Specialist
> *Federal and state corporate/civil law*

**Codename:** Liberty
**Role:** US Counsel
**Specialty:** Federal and state corporate law, regulatory compliance

**Jurisdictions:** United States (Federal and State)

**Invoke:** `/legal-team:liberty`

---

#### Europa - EU Law Specialist
> *GDPR, cross-border commerce, EU regulations*

**Codename:** Europa
**Role:** EU Counsel
**Specialty:** GDPR, cross-border commerce, EU directives

**Jurisdictions:** European Union

**Invoke:** `/legal-team:europa`

---

#### Castile - Spanish Law Specialist
> *National and autonomous community law*

**Codename:** Castile
**Role:** Spain Corporate Counsel
**Specialty:** Spanish business law, corporate, commercial, M&A

**Jurisdictions:** Spain (National and Autonomous Communities)

**Invoke:** `/legal-team:castile`

---

#### Covenant - Contract Specialist
> *Cross-jurisdictional contract expert*

**Codename:** Covenant
**Role:** Contract Specialist
**Specialty:** Contract drafting, review, negotiation across jurisdictions

**Invoke:** `/legal-team:covenant`

---

#### Tribute - Tax Counsel
> *Cross-jurisdictional tax planning*

**Codename:** Tribute
**Role:** Tax Counsel
**Specialty:** US, EU, Spain, Estonia tax planning and compliance

**Invoke:** `/legal-team:tribute`

---

#### Advocate - Litigation Strategist
> *Dispute resolution and arbitration*

**Codename:** Advocate
**Role:** Litigation Strategist
**Specialty:** Pre-litigation, settlement strategy, arbitration, mediation

**Invoke:** `/legal-team:advocate`

---

### Extended Legal Team (6 Agents)

---

#### Iberia - Spain Civil Law Counsel
> *Family law, property, inheritance*

**Codename:** Iberia
**Role:** Spain Civil Law Counsel
**Specialty:** Family law, property, inheritance, foral law variations

**Invoke:** `/legal-team:iberia`

---

#### Gremio - Spain Labor Law Counsel
> *Employment contracts and labor law*

**Codename:** Gremio
**Role:** Spain Labor Law Counsel
**Specialty:** Employment contracts, dismissals, collective labor

**Invoke:** `/legal-team:gremio`

---

#### Baltic - Estonia Corporate Counsel
> *e-Residency and digital business*

**Codename:** Baltic
**Role:** Estonia Corporate Counsel
**Specialty:** e-Residency, OU formation, digital business

**Invoke:** `/legal-team:baltic`

---

#### Charter - Corporate Governance Counsel
> *Board matters and fiduciary duties*

**Codename:** Charter
**Role:** Corporate Governance Counsel
**Specialty:** Board matters, fiduciary duties, shareholder rights

**Invoke:** `/legal-team:charter`

---

#### Insignia - IP Counsel
> *Trademarks, patents, copyrights*

**Codename:** Insignia
**Role:** IP Counsel
**Specialty:** Trademarks, patents, copyrights, licensing

**Invoke:** `/legal-team:insignia`

---

#### Deed - Real Estate Counsel
> *Property transactions and leases*

**Codename:** Deed
**Role:** Real Estate Counsel
**Specialty:** Property transactions, leases, development

**Invoke:** `/legal-team:deed`

---

## BMM Module (9 Agents)

### Product & Business

---

#### John - Product Manager
> *Product vision and prioritization*

**Codename:** John
**Role:** Product Manager
**Specialty:** Product strategy, roadmap, prioritization

**Invoke:** `/bmad:bmm:agents:pm`

---

#### Sarah - Business Analyst
> *Requirements analysis and discovery*

**Codename:** Sarah
**Role:** Business Analyst
**Specialty:** Requirements gathering, user research, domain analysis

**Invoke:** `/bmad:bmm:agents:analyst`

---

#### Emma - UX Designer
> *User experience design*

**Codename:** Emma
**Role:** UX Designer
**Specialty:** User research, wireframing, interaction design

**Invoke:** `/bmad:bmm:agents:ux-designer`

---

### Technical

---

#### Winston - Architect
> *System design and technical decisions*

**Codename:** Winston
**Role:** System Architect
**Specialty:** Architecture design, technology selection, technical strategy

**Invoke:** `/bmad:bmm:agents:architect`

---

#### Devon - Developer
> *Implementation and coding*

**Codename:** Devon
**Role:** Developer
**Specialty:** Code implementation, technical problem-solving

**Invoke:** `/bmad:bmm:agents:dev`

---

#### Murat - Test Engineer
> *Test engineering and automation*

**Codename:** Murat (TEA)
**Role:** Test Engineer
**Specialty:** Test strategy, automation, quality assurance

**Invoke:** `/bmad:bmm:agents:tea`

---

### Delivery

---

#### Alex - Scrum Master
> *Agile facilitation*

**Codename:** Alex
**Role:** Scrum Master
**Specialty:** Sprint planning, ceremony facilitation, team coaching

**Invoke:** `/bmad:bmm:agents:sm`

---

#### Clara - Tech Writer
> *Documentation specialist*

**Codename:** Clara
**Role:** Tech Writer
**Specialty:** Technical documentation, API docs, user guides

**Invoke:** `/bmad:bmm:agents:tech-writer`

---

#### Solo Dev
> *Quick development flow*

**Role:** Solo Developer
**Specialty:** End-to-end development for smaller projects

**Invoke:** `/bmad:bmm:agents:solo-dev`

---

## BMGD Module (6 Agents)

---

#### Samus Shepard - Game Designer
> *Mechanics, systems, GDD creation*

**Codename:** Samus Shepard
**Role:** Game Designer
**Specialty:** Game mechanics, systems design, GDD creation

**Invoke:** `/bmad:bmgd:agents:game-designer`

---

#### Max - Game Scrum Master
> *Game sprint management*

**Codename:** Max
**Role:** Game Scrum Master
**Specialty:** Game sprint planning, milestone tracking

**Invoke:** `/bmad:bmgd:agents:game-scrum-master`

---

#### Winston - Game Architect
> *Engine-specific architecture*

**Codename:** Winston
**Role:** Game Architect
**Specialty:** Unity/Unreal/Godot architecture, technical design

**Invoke:** `/bmad:bmgd:agents:game-architect`

---

#### Devon - Game Developer
> *Game implementation*

**Codename:** Devon
**Role:** Game Developer
**Specialty:** Game programming, engine-specific implementation

**Invoke:** `/bmad:bmgd:agents:game-dev`

---

#### GLaDOS - Game QA
> *Game quality assurance*

**Codename:** GLaDOS
**Role:** Game QA
**Specialty:** Game testing, bug tracking, certification preparation

**Invoke:** `/bmad:bmgd:agents:game-qa`

---

#### Solo Dev - Game Solo Developer
> *Indie game development flow*

**Role:** Game Solo Developer
**Specialty:** End-to-end indie game development

**Invoke:** `/bmad:bmgd:agents:solo-dev`

---

## BMB Module (3 Agents)

---

#### Agent Builder
> *Create new BMAD agents*

**Role:** Agent Builder
**Specialty:** Agent definition, persona design, capability specification

**Invoke:** `/bmad:bmb:agents:agent-builder`

---

#### Workflow Builder
> *Design and create workflows*

**Role:** Workflow Builder
**Specialty:** Workflow design, step creation, validation

**Invoke:** `/bmad:bmb:agents:workflow-builder`

---

#### Module Builder
> *Assemble complete modules*

**Role:** Module Builder
**Specialty:** Module assembly, configuration, packaging

**Invoke:** `/bmad:bmb:agents:module-builder`

---

## CIS Module (6 Agents)

---

#### Carson - Brainstorming Coach
> *Creative ideation facilitation*

**Codename:** Carson
**Role:** Brainstorming Coach
**Specialty:** Brainstorming facilitation, creative techniques

**Invoke:** `/bmad:cis:agents:brainstorming-coach`

---

#### Victor - Innovation Strategist
> *Innovation methodology*

**Codename:** Victor
**Role:** Innovation Strategist
**Specialty:** Innovation strategy, opportunity identification

**Invoke:** `/bmad:cis:agents:innovation-strategist`

---

#### Dr. Quinn - Creative Problem Solver
> *Problem-solving frameworks*

**Codename:** Dr. Quinn
**Role:** Creative Problem Solver
**Specialty:** Problem analysis, solution generation

**Invoke:** `/bmad:cis:agents:problem-solver`

---

#### Maya - Design Thinking Coach
> *Design thinking methodology*

**Codename:** Maya
**Role:** Design Thinking Coach
**Specialty:** Design thinking workshops, empathy mapping

**Invoke:** `/bmad:cis:agents:design-thinking-coach`

---

#### Sophia - Storyteller
> *Narrative development*

**Codename:** Sophia
**Role:** Storyteller
**Specialty:** Narrative crafting, story structure

**Invoke:** `/bmad:cis:agents:storyteller`

---

#### Caravaggio - Presentation Master
> *Presentation excellence*

**Codename:** Caravaggio
**Role:** Presentation Master
**Specialty:** Presentation design, delivery coaching

**Invoke:** `/bmad:cis:agents:presentation-master`

---

## Agent Access Control

Agent access is controlled by RBAC. Some agents have additional restrictions:

### Restricted Agents (Require Credential Verification)

| Agent | Module | Reason |
|-------|--------|--------|
| Field Operative | intel-team | Field operations guidance |
| HUMINT Specialist | intel-team | Human intelligence techniques |
| Dark Web Analyst | intel-team | Underground operations |

### Restricted Agents (Require Authorization)

| Agent | Module | Reason |
|-------|--------|--------|
| Red Team Operator | cybersec-team | Offensive security testing |
| Social Engineer | cybersec-team | Social engineering techniques |

See [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) for complete access control details.

---

## Related Documentation

- [MODULES-OVERVIEW.md](MODULES-OVERVIEW.md) - Module descriptions
- [WORKFLOWS-REFERENCE.md](WORKFLOWS-REFERENCE.md) - Complete workflow reference
- [PARTY-MODE-GUIDE.md](PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [GETTING-STARTED.md](GETTING-STARTED.md) - Quick start guide
