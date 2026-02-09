# BMAD Workflows Reference

Complete reference for all workflows across the BMAD-CYBER2 framework.

**Last Updated:** 2026-01-31
**Total Workflows:** 55 (Core Teams)

---

## Quick Navigation

- [Overview](#overview)
- [Intel-Team Workflows (19)](#intel-team-workflows-19)
- [Legal-Team Workflows (7)](#legal-team-workflows-7)
- [Strategy-Team Workflows (16)](#strategy-team-workflows-16)
- [Cybersec-Team Workflows (13)](#cybersec-team-workflows-13)
- [Workflow Usage](#workflow-usage)
- [Workflow Architecture](#workflow-architecture)

---

## Overview

The BMAD system provides **55 specialized workflows** organized across four professional teams:

| Team | Count | Focus Area |
|------|-------|------------|
| Intel Team | 19 | Open source intelligence, threat analysis, field operations |
| Legal Team | 7 | Contract law, corporate formation, tax planning, disputes |
| Strategy Team | 16 | Executive decision-making, leadership, negotiations |
| Cybersecurity Team | 13 | Security testing, compliance, incident response |

### Workflow Types

| Type | Description |
|------|-------------|
| **Linear** | Sequential step execution |
| **Iterative-Linear** | Steps with component iteration |
| **Dual-Mode** | Creation mode + guided execution mode |
| **Interactive** | User choices at decision points |

---

## Intel-Team Workflows (19)

**Module Path:** `src/intel-team/workflows/`
**Focus:** Open source intelligence (OSINT), threat analysis, field operations, and investigative workflows.

### Summary Table

| # | Workflow | Classification | Duration | Steps |
|---|----------|----------------|----------|-------|
| 1 | approach-vector | Operational Planning | ~60 min | 4 |
| 2 | attribution-chain | Threat Intelligence | 2-3 hrs | 6 |
| 3 | breach-archaeology | Technical Intelligence | 45-60 min | 4 |
| 4 | campaign-ai | Campaign Planning | ~120 min | 8 |
| 5 | campaign-planner-org | Organization Investigation | 2-3 hrs | 9 |
| 6 | campaign-planner-person | Individual Investigation | 1-2 hrs | 5 |
| 7 | counter-intel-audit | Defensive / Counter-Intelligence | 60-90 min | 6 |
| 8 | digital-necromancy | Individual Investigation | 1-2 hrs | 4 |
| 9 | doppelganger-hunt | Individual Investigation | 45-60 min | 4 |
| 10 | flash-assessment | Rapid Response | ~15 min | 3 |
| 11 | ground-truth | Field Operations | ~75 min | 5 |
| 12 | infrastructure-genealogy | Technical Intelligence | 1-2 hrs | 5 |
| 13 | operation-mosaic | Flagship / Comprehensive | 2-4 hrs | 9 |
| 14 | pattern-of-life | Behavioral Analysis | ~60 min | 4 |
| 15 | signal-landscape | Technical Intelligence | 1-2 hrs | 4 |
| 16 | spider-web | Organization Investigation | 1-2 hrs | 4 |
| 17 | the-synthesis | All-Source Fusion | ~60 min | 4 |
| 18 | threat-constellation | Threat Intelligence | 2-3 hrs | 5 |
| 19 | tripwire | Monitoring | ~45 min | 5 |

---

### approach-vector

**Path:** `src/intel-team/workflows/approach-vector/`
**Primary Agent:** Viper (HUMINT Specialist)
**Supporting Agents:** Echo, Atlas, Specter

HUMINT operation planning for target engagement covering psychological vulnerability identification (MICE framework), social entry point mapping, physical access analysis, and cover story development.

**Steps:**
1. Target Assessment - MICE analysis, vulnerability identification, recruitment potential
2. Social Entry Point Mapping - Social network analysis, interests, events, communities
3. Physical Access Analysis - Location patterns, frequented venues, travel patterns
4. Approach Planning - Cover story development, risk assessment, contingencies

**Outputs:** Target psychological profile, approach vectors, cover story package, risk matrix

---

### attribution-chain

**Path:** `src/intel-team/workflows/attribution-chain/`
**Primary Agent:** Dossier (Threat Actor Profiler)
**Supporting Agents:** Resolver, Probe, Shadow, Echo, Atlas

Rigorous threat actor attribution using multiple intelligence sources for APT attribution, criminal actor identification, campaign attribution, and false flag detection.

**Steps:**
1. Indicator Collection - IOC gathering, TTP documentation
2. Infrastructure Attribution - Domain/IP actor correlation
3. Technical Attribution - Malware and tooling analysis
4. Underground Attribution - Dark web persona correlation
5. SOCMINT Attribution - Social media actor correlation
6. Attribution Synthesis - Confidence assessment, final attribution

**Outputs:** Attribution assessment with confidence levels, Diamond Model analysis, MITRE ATT&CK mapping

---

### breach-archaeology

**Path:** `src/intel-team/workflows/breach-archaeology/`
**Primary Agent:** Shadow (Dark Web Analyst)
**Supporting Agents:** Probe, Resolver, Echo

Comprehensive breach and data exposure history analysis including credential exposure assessment, breach database analysis, historical leak identification, and exposure timeline construction.

**Steps:**
1. Target Setup - Identifier validation, search preparation
2. Breach Database Search - HIBP, breach databases
3. Paste Site Analysis - Paste/dump discovery
4. Exposure Synthesis - Timeline and risk assessment

**Outputs:** Breach exposure report, credential inventory, exposure timeline, risk assessment

---

### campaign-ai

**Path:** `src/intel-team/workflows/campaign-ai/`
**Primary Agent:** Vector (OSINT Lead)
**Supporting Agents:** Probe, Resolver, Proxy, Echo, Shadow, Dossier

Specialized OSINT campaign planning targeting AI entities including AI companies, models, applications, infrastructure, and researchers.

**Steps:**
1. Campaign Initialization - AI-specific intelligence requirements
2. Technical Intelligence - Model analysis, infrastructure, code research
3. Digital Infrastructure - Domains, API endpoints, cloud footprint
4. Corporate Structure & Funding - Entity verification, investment, regulatory
5. Personnel & Organization - Key personnel, organization analysis
6. Underground & Exposure - Credential exposures, leaks
7. Threat & Risk Assessment - Nation-state interest, competitive threats
8. Campaign Plan Assembly - Final profile, monitoring plan

**Outputs:** AI entity campaign plan, technical capability assessment, model profile, organization map

---

### campaign-planner-org

**Path:** `src/intel-team/workflows/campaign-planner-org/`
**Primary Agent:** Vector (OSINT Lead)
**Supporting Agents:** Resolver, Echo, Shadow, Proxy, Probe, Atlas, Dossier

Comprehensive organizational intelligence campaign for corporate due diligence, competitor intelligence, threat actor profiling, and M&A support.

**Steps:**
1. Target Definition - Organization validation, requirements
2. Infrastructure Mapping - Domain/network reconnaissance
3. Technology Stack - Technology identification
4. Social Presence - Corporate social footprint
5. Dark Web Exposure - Breach and leak assessment
6. Corporate Structure - Entity relationships, ownership
7. Geospatial Analysis - Locations, facilities
8. Threat Assessment - Risk and threat correlation
9. Campaign Assembly - Final intelligence package

**Outputs:** Organizational intelligence package, corporate structure map, technical infrastructure assessment

---

### campaign-planner-person

**Path:** `src/intel-team/workflows/campaign-planner-person/`
**Primary Agent:** Vector (OSINT Lead)
**Supporting Agents:** Resolver, Echo, Shadow, Probe, Atlas

Full intelligence campaign against individual targets for person of interest investigations, background investigations, threat actor attribution, and due diligence.

**Steps:**
1. Target Profile - Identity validation, collection requirements
2. Pivot Mapping - Digital infrastructure connections
3. Social Footprint - Social media presence analysis
4. Exposure Assessment - Dark web exposure check
5. Campaign Synthesis - Findings integration, assessment

**Outputs:** Individual target dossier, digital footprint map, exposure assessment, relationship network

---

### counter-intel-audit

**Path:** `src/intel-team/workflows/counter-intel-audit/`
**Primary Agent:** Specter (Field Operative)
**Supporting Agents:** Sigil, Echo, Proxy, Shadow, Vector

Turn intelligence capabilities inward to assess organizational exposure and operational security gaps.

**Steps:**
1. Physical Security Assessment - Facility exposure, personnel identification risk
2. Electronic Security Assessment - Communications security, RF emissions, network security
3. Digital Footprint Assessment - Corporate social presence, employee exposure
4. Corporate Exposure Assessment - Registry exposure, officer data, financial filings
5. Underground Exposure Assessment - Credential exposure, breach impact
6. Risk Synthesis & Remediation - Prioritized vulnerabilities, remediation roadmap

**Outputs:** Vulnerability inventory, risk heat map, remediation roadmap, quick wins list

---

### digital-necromancy

**Path:** `src/intel-team/workflows/digital-necromancy/`
**Primary Agent:** Resolver (Domain Intel)
**Supporting Agents:** Echo, Shadow, Probe

Recover deleted, historical, or obscured digital presence through archive discovery, social archaeology, and timeline assembly.

**Steps:**
1. Archive Discovery - Wayback Machine, cached content
2. Social Archaeology - Deleted posts, old profiles
3. Breach History - Historical breach exposure
4. Timeline Assembly - Chronological reconstruction

**Outputs:** Historical digital timeline, recovered content inventory, identity evolution map

---

### doppelganger-hunt

**Path:** `src/intel-team/workflows/doppelganger-hunt/`
**Primary Agent:** Echo (Social Media Analyst)
**Supporting Agents:** Probe, Atlas, Viper

Detect and analyze fake, impersonation, or sock puppet accounts through behavioral, technical, and psychological analysis.

**Steps:**
1. Behavioral Analysis - Posting patterns, engagement analysis
2. Technical Analysis - Image forensics, metadata analysis
3. Location Analysis - Geographic consistency verification
4. Psychological Assessment - Persona consistency, motivation

**Outputs:** Authenticity assessment score, behavioral anomaly report, true identity hypothesis

---

### flash-assessment

**Path:** `src/intel-team/workflows/flash-assessment/`
**Primary Agent:** Vector (OSINT Lead)
**Supporting Agents:** Probe, Echo, Shadow, Proxy

Rapid 15-minute OSINT triage for time-critical intelligence requirements, initial assessments, and incident response support.

**Steps:**
1. Triage Coordination - Validate identifiers, dispatch parallel collection
2. Parallel Collection - Simultaneous data gathering across disciplines
3. Synthesis - Integrate findings, produce rapid assessment

**Outputs:** First-look risk assessment, immediate OSINT hits, exposure identification, follow-on recommendations

---

### ground-truth

**Path:** `src/intel-team/workflows/ground-truth/`
**Primary Agent:** Specter (Field Operative)
**Supporting Agents:** Atlas, Sigil, Viper

Complete preparation package for physical/field operations including surveillance, site surveys, and operational planning.

**Steps:**
1. Operation Framework - Mission definition, success criteria, risk tolerance
2. Site Analysis - Satellite imagery, terrain, entry/exit points
3. Electronic Environment - TSCM considerations, communication plan
4. Human Factors - Cover story finalization, interaction protocols
5. Operation Package Assembly - SDR routes, contingencies, final briefing

**Outputs:** Site survey report, surveillance plan, legend package, communication plan, contingency procedures

---

### infrastructure-genealogy

**Path:** `src/intel-team/workflows/infrastructure-genealogy/`
**Primary Agent:** Resolver (Domain Intel)
**Supporting Agents:** Probe, Proxy, Shadow, Dossier

Trace infrastructure ownership and changes over time including domain ownership history, IP allocation tracking, and hosting changes.

**Steps:**
1. Ownership Archaeology - WHOIS history, registrant tracking
2. Technical Evolution - IP history, technology changes
3. Corporate Ownership - Entity ownership chain
4. Underground Connections - Abuse history, threat correlation
5. Threat Timeline - Attribution and timeline synthesis

**Outputs:** Infrastructure genealogy report, ownership timeline, attribution assessment

---

### operation-mosaic

**Path:** `src/intel-team/workflows/operation-mosaic/`
**Primary Agent:** Vector (OSINT Lead)
**All Agents:** Vector, Resolver, Echo, Shadow, Proxy, Probe, Atlas, Dossier, Viper

Full spectrum target package using all 11 intelligence agents in coordinated sequence. The flagship comprehensive workflow.

**Steps:**
1. Target Definition & Collection Planning - Requirements, collection plan, tasking
2. Digital Footprint - Domain/IP recon, infrastructure mapping
3. Social Presence - Platform enumeration, account correlation
4. Dark Web Exposure - Breach checks, forum mentions, credentials
5. Corporate Intelligence - Entity structure, financials, relationships
6. Geospatial Analysis - Location intelligence, pattern of life
7. Threat Correlation - Actor attribution, TTP analysis
8. HUMINT Assessment - Approach vectors, relationship mapping
9. Intelligence Fusion - Multi-INT synthesis, final package

**Outputs:** Comprehensive target dossier, multi-source corroborated findings, risk assessment

---

### pattern-of-life

**Path:** `src/intel-team/workflows/pattern-of-life/`
**Primary Agent:** Echo (Social Media Analyst)
**Supporting Agents:** Atlas, Sigil, Specter

Behavioral analysis and prediction through multi-source pattern analysis for operational planning.

**Steps:**
1. Digital Behavior Patterns - Posting time analysis, platform usage, content themes
2. Physical Movement Patterns - Location check-ins, photo geolocation, travel patterns
3. Communication Patterns - Active hours, communication frequency, contact network
4. Operational Assessment - Predictable vulnerabilities, surveillance windows

**Outputs:** Weekly routine matrix, location heat map, social graph, predictive timeline

---

### signal-landscape

**Path:** `src/intel-team/workflows/signal-landscape/`
**Primary Agent:** Sigil (SIGINT Specialist)
**Supporting Agents:** Probe, Resolver, Atlas

SIGINT opportunity mapping and communications analysis including protocol identification and vulnerability assessment.

**Steps:**
1. Communications Mapping - Channel identification, protocol analysis
2. Technical Vulnerability - Encryption assessment, weaknesses
3. Infrastructure Signals - DNS/network signal analysis
4. Geographic Mapping - Signal geographic correlation

**Outputs:** Communications landscape map, signal opportunity assessment, vulnerability identification

---

### spider-web

**Path:** `src/intel-team/workflows/spider-web/`
**Primary Agent:** Proxy (Corporate Intel)
**Supporting Agents:** Resolver, Echo, Dossier

Network relationship mapping and affiliation analysis including corporate relationships, beneficial ownership chains, and influence networks.

**Steps:**
1. Seed Analysis - Initial entity analysis
2. Expansion - Network node discovery
3. Correlation - Relationship validation
4. Network Synthesis - Complete network map

**Outputs:** Network relationship diagram, entity connection matrix, influence mapping

---

### the-synthesis

**Path:** `src/intel-team/workflows/the-synthesis/`
**Primary Agent:** Vector (OSINT Lead)
**Supporting Agents:** All intelligence agents (for conflict resolution)

Multi-source intelligence fusion for unified assessments with correlation, conflict resolution, and confidence assessment.

**Steps:**
1. Input Cataloging - Inventory sources, assess reliability, identify overlaps
2. Correlation Analysis - Cross-reference findings, identify corroboration
3. Confidence Assessment - Apply confidence framework, document evidence basis
4. Product Assembly - Executive summary, key findings, recommendations

**Outputs:** Intelligence assessment (formal product), evidence matrix, confidence breakdown

---

### threat-constellation

**Path:** `src/intel-team/workflows/threat-constellation/`
**Primary Agent:** Dossier (Threat Actor Profiler)
**Supporting Agents:** Shadow, Resolver, Probe, Echo

Map the complete ecosystem around a threat actor including relationships, infrastructure clustering, campaign correlation, and evolution tracking.

**Steps:**
1. Actor Profile - Known actor documentation
2. Infrastructure Cluster - Related infrastructure discovery
3. Underground Network - Forum/marketplace connections
4. Tooling Analysis - Shared tools and malware
5. Ecosystem Synthesis - Complete constellation map

**Outputs:** Threat actor ecosystem map, relationship network, campaign timeline

---

### tripwire

**Path:** `src/intel-team/workflows/tripwire/`
**Primary Agent:** Vector (OSINT Lead)
**Supporting Agents:** Resolver, Proxy, Echo, Shadow

Configure comprehensive monitoring for target changes with alerting thresholds and notification rules.

**Steps:**
1. Monitoring Strategy - Objectives, priorities, thresholds, notification workflow
2. Infrastructure Monitoring - Domain changes, DNS, certificates, subdomains
3. Corporate Monitoring - Officer changes, status updates, M&A activity
4. Social Monitoring - Post alerts, mentions, sentiment, new accounts
5. Dark Web Monitoring - Breach alerts, forum mentions, credential dumps

**Outputs:** Monitoring configuration, alert rules, escalation procedures, dashboard setup

---

## Legal-Team Workflows (7)

**Module Path:** `src/legal-team/workflows/`
**Focus:** Contract law, corporate formation, tax planning, dispute resolution, and cross-jurisdictional legal matters.

> **DISCLAIMER**: Legal-Team workflows provide general guidance only and do not constitute legal advice. Always consult qualified legal counsel.

### Summary Table

| # | Workflow | Type | Primary Agent |
|---|----------|------|---------------|
| 1 | contract-drafting | Document | Covenant |
| 2 | contract-review | Document | Covenant |
| 3 | corporate-formation | Interactive | Liberty, Castile, Baltic |
| 4 | cross-border-matter | Interactive | Europa |
| 5 | dispute-strategy | Interactive | Advocate |
| 6 | legal-matter-intake | Interactive | Counsel |
| 7 | tax-planning | Interactive | Tribute |

**Jurisdictions Covered:** USA, European Union, Spain, Estonia, Cross-Border

---

### contract-drafting

**Path:** `src/legal-team/workflows/contract-drafting/`
**Primary Agent:** Covenant (Contract Specialist)

Create jurisdiction-appropriate contracts from scratch or modify existing templates based on requirements.

**Contract Types Supported:**
- Service agreements
- Sales/purchase agreements
- NDAs/Confidentiality agreements
- Employment contracts (coordinates with Gremio for Spain)
- Licensing agreements
- Partnership/JV agreements
- Corporate documents (shareholder agreements, etc.)

**Outputs:** Draft contract, explanatory notes, jurisdiction adaptations, negotiation guidance

---

### contract-review

**Path:** `src/legal-team/workflows/contract-review/`
**Primary Agent:** Covenant (Contract Specialist)
**Supporting Agents:** Liberty, Europa, Castile (jurisdiction specialists)

Comprehensive contract analysis identifying risks, gaps, and recommended modifications across jurisdictions.

**Outputs:** Risk assessment report (HIGH/MEDIUM/LOW), clause-by-clause analysis, jurisdiction concerns, negotiation talking points

---

### corporate-formation

**Path:** `src/legal-team/workflows/corporate-formation/`
**Primary Agents:** Liberty (US), Castile (Spain), Baltic (Estonia), Tribute (Tax)

Guide users through entity setup across US, EU, Spain, and Estonia with appropriate structure recommendations.

**Jurisdictions Covered:**
- **United States:** Delaware LLC/Corp, Wyoming LLC, state considerations
- **Spain:** Sociedad Limitada (S.L.), Sociedad Anónima (S.A.), Sucursal
- **Estonia:** Osaühing (OÜ), e-Residency pathway
- **EU General:** Branch vs. subsidiary analysis, holding company jurisdictions

**Outputs:** Entity type recommendation, formation checklist, draft documents, compliance calendar

---

### cross-border-matter

**Path:** `src/legal-team/workflows/cross-border-matter/`
**Primary Agent:** Europa (EU Counsel)
**Supporting Agents:** Liberty, Castile, Tribute, Counsel

Multi-jurisdictional legal matter coordination for cross-border transactions, disputes, and compliance.

**Coverage:**
- International contracts and transactions
- Multi-jurisdictional dispute resolution
- Cross-border corporate structures
- International employment arrangements
- Cross-border data privacy compliance
- Multi-jurisdictional regulatory compliance

**Key Considerations:** Choice of law, party autonomy, Brussels I Recast, Hague Conventions

---

### dispute-strategy

**Path:** `src/legal-team/workflows/dispute-strategy/`
**Primary Agent:** Advocate (Litigation Strategist)
**Supporting Agents:** Covenant (contract disputes)

Pre-litigation analysis and planning for civil disputes including settlement strategy and litigation preparation.

**Dispute Types Covered:**
- Contract disputes
- Business/commercial disputes
- Property disputes
- Partnership/shareholder disputes
- Consumer disputes
- Debt collection matters
- Professional liability

**Outputs:** Dispute assessment memo, legal position analysis, settlement range, litigation budget estimate

---

### legal-matter-intake

**Path:** `src/legal-team/workflows/legal-matter-intake/`
**Primary Agent:** Counsel (General Counsel)

Initial case assessment and routing workflow serving as the entry point for all legal matters.

**Steps:**
1. Welcome and context gathering
2. Matter type classification
3. Jurisdiction identification
4. Urgency assessment
5. Party role determination
6. Initial document/evidence review
7. Specialist routing recommendation
8. Next steps guidance

**Outputs:** Matter brief, jurisdiction determination, specialist assignment, workflow routing

---

### tax-planning

**Path:** `src/legal-team/workflows/tax-planning/`
**Primary Agent:** Tribute (Tax Counsel)
**Supporting Agents:** Jurisdiction specialists, Counsel

Cross-jurisdiction tax optimization for businesses and individuals with operations in US, EU, Spain, and Estonia.

**Tax Areas Covered:**
- **Corporate Tax:** Entity selection, holding structures, profit repatriation
- **International Tax:** Transfer pricing, permanent establishment, CFC rules
- **Personal Tax:** Residency planning, income sourcing, estate planning

**Jurisdiction Specifics:**
- USA: Federal/state optimization, pass-through vs. C-corp, GILTI/FDII
- Spain: ETVE regime, patent box
- Estonia: Retained earnings advantage, distribution timing

**Outputs:** Tax strategy memo, structure recommendations, compliance checklist, implementation roadmap

---

## Strategy-Team Workflows (16)

**Module Path:** `src/strategy-team/workflows/`
**Focus:** Executive decision-making, leadership development, negotiations, corporate governance, and strategic planning.

### Summary Table

| # | Workflow | Steps | Primary Focus |
|---|----------|-------|---------------|
| 1 | board-presentation-prep | 7 | Board communications |
| 2 | board-relations-management | 6 | Governance |
| 3 | competitive-warfare | 9 | Competitive strategy |
| 4 | conflict-resolution | 8 | Workplace mediation |
| 5 | corporate-political-game | 9 | Internal politics |
| 6 | crisis-response-planning | 7 | Crisis management |
| 7 | ethical-dilemma-resolution | 8 | Ethics |
| 8 | leadership-philosophy | 7 | Leadership development |
| 9 | leadership-transition-planning | 7 | Succession |
| 10 | ma-due-diligence | 8 | M&A |
| 11 | performance-review-preparation | 6 | Performance management |
| 12 | policy-development | 8 | Policy creation |
| 13 | political-risk-assessment | 7 | Risk assessment |
| 14 | stakeholder-negotiation-prep | 8 | Negotiations |
| 15 | strategic-decision-workshop | 9 | Strategic decisions |
| 16 | strategic-planning-session | 8 | Strategic planning |

---

### board-presentation-prep

**Path:** `src/strategy-team/workflows/board-presentation-prep/`
**Primary Agents:** Giuseppe (Communications), Cicero (Debate Coach), Augustus (Policy Analyst)

Prepare compelling board presentations with strategic messaging and comprehensive Q&A preparation.

**Coverage:**
- Audience analysis (board composition, priorities, concerns)
- Narrative structure (story arc, key messages, call-to-action)
- Evidence compilation (data points, benchmarks)
- Visual design (slide structure, data visualization)
- Q&A preparation (anticipated questions, difficult scenarios)
- Final review (rehearsal, timing, refinement)

---

### board-relations-management

**Path:** `src/strategy-team/workflows/board-relations-management/`
**Primary Agents:** Magnus (Political Strategist), Giuseppe (Communications), Geneva (Stakeholder Mediator)

Develop and maintain effective board relationships with governance improvement.

**Use Cases:**
- New executive onboarding with board
- Board relationship improvement
- Pre-meeting preparation
- Annual board engagement planning
- Crisis communication with board

---

### competitive-warfare

**Path:** `src/strategy-team/workflows/competitive-warfare/`
**Primary Agents:** Sun (Master Strategist), Musashi (Strategist-Warrior), Niccolo (The Realist)

Strategic competitive warfare planning for high-stakes business battles using military strategy principles.

**Strategic Frameworks:**
- Sun Tzu's Art of War principles
- Porter's Competitive Strategy
- OODA Loop (Observe, Orient, Decide, Act)

**Coverage:** Intelligence gathering, terrain analysis, force assessment, strategy selection, tactical planning, contingency planning

---

### conflict-resolution

**Path:** `src/strategy-team/workflows/conflict-resolution/`
**Primary Agent:** Geneva (Stakeholder Mediator)
**Supporting Agents:** Sophia (Ethics), Jean-Luc (Principled Commander)

Navigate workplace conflicts with structured mediation and resolution strategies.

**Conflict Types:**
- Interpersonal conflicts
- Team dynamics issues
- Cross-departmental disputes
- Leadership disagreements
- Resource allocation conflicts
- Cultural and value clashes

---

### corporate-political-game

**Path:** `src/strategy-team/workflows/corporate-political-game/`
**Primary Agents:** Niccolo (The Realist), Magnus (Political Strategist), Giuseppe (Communications)

Navigate internal corporate politics with comprehensive political strategy.

**Coverage:**
- Power mapping (formal and informal structures)
- Alliance analysis (allies, opponents, fence-sitters)
- Political landscape (decision-making, gatekeepers)
- Influence strategy (persuasion, coalition, leverage)
- Coalition building and opposition management

---

### crisis-response-planning

**Path:** `src/strategy-team/workflows/crisis-response-planning/`
**Primary Agents:** Giuseppe (Communications), Geneva (Stakeholder Mediator), Sophia (Ethics)

Develop crisis communication and response strategies.

**Crisis Types:**
- Reputational crises
- Operational failures
- Leadership crises
- Financial emergencies
- Legal/regulatory issues
- Public relations incidents
- Cybersecurity incidents

---

### ethical-dilemma-resolution

**Path:** `src/strategy-team/workflows/ethical-dilemma-resolution/`
**Primary Agent:** Sophia (Ethics Advisor)
**Supporting Agents:** Jean-Luc (Principled Commander), Burke (Conservative), Charles (Liberator)

Navigate complex ethical dilemmas through structured multi-perspective analysis.

**Ethical Frameworks Applied:**
- Utilitarian analysis (greatest good)
- Deontological ethics (duty-based)
- Virtue ethics (character-based)
- Care ethics (relationship-based)
- Justice/fairness principles
- Rights-based analysis

---

### leadership-philosophy

**Path:** `src/strategy-team/workflows/leadership-philosophy/`
**Agents:** All 8 historical archetypes, Sophia (Ethics), Cicero (Debate Coach)

Develop personal leadership philosophy through dialogue with historical leader archetypes.

**Historical Archetypes:**
- Niccolo (The Realist), Charles (The Liberator), Maximilien (The Revolutionary)
- Burke (The Conservative), Lee (The Technocrat), Musashi (The Warrior)
- Sun (The Strategist), Jean-Luc (The Commander)

---

### leadership-transition-planning

**Path:** `src/strategy-team/workflows/leadership-transition-planning/`
**Primary Agents:** Jean-Luc (Principled Commander), Geneva (Stakeholder Mediator), Burke (Conservative)

Plan and execute leadership transitions ensuring smooth handovers.

**Transition Types:**
- Planned succession (retirement, term completion)
- Unexpected departure (resignation, termination, health)
- Organizational restructuring
- Interim leadership
- Development transition (promotion, role expansion)

---

### ma-due-diligence

**Path:** `src/strategy-team/workflows/ma-due-diligence/`
**Primary Agents:** Lee (Technocrat), Augustus (Policy Analyst), Magnus (Political Strategist), Sun (Master Strategist)

Comprehensive merger and acquisition evaluation using strategic advisors.

**Coverage:**
- Deal thesis and strategic rationale
- Strategic fit analysis
- Financial assessment and valuation
- Operational diligence
- Risk identification
- Integration planning (Day 1, 100-day plan)
- Stakeholder communications
- Board-ready recommendation

---

### performance-review-preparation

**Path:** `src/strategy-team/workflows/performance-review-preparation/`
**Primary Agents:** Jean-Luc (Principled Commander), Sophia (Ethics), Geneva (Stakeholder Mediator)

Prepare executive performance reviews with balanced assessments and development focus.

**Review Types:**
- Annual performance reviews
- Mid-year check-ins
- Probation assessments
- Performance improvement plans
- Promotion discussions
- 360-degree feedback synthesis

---

### policy-development

**Path:** `src/strategy-team/workflows/policy-development/`
**Primary Agents:** Augustus (Policy Analyst), Sophia (Ethics), Lee (Technocrat)

Develop internal policies with evidence-based analysis and ethics review.

**Policy Types:**
- HR policies
- Operational policies
- Governance policies
- Compliance policies
- Technology policies
- Ethics and conduct policies

---

### political-risk-assessment

**Path:** `src/strategy-team/workflows/political-risk-assessment/`
**Primary Agents:** Magnus (Political Strategist), Niccolo (The Realist), Augustus (Policy Analyst)

Evaluate political risks in strategic decisions and initiatives.

**Risk Categories:**
- Regulatory/policy changes
- Leadership transitions
- Stakeholder opposition
- Coalition instability
- Reputation threats
- External political events

---

### stakeholder-negotiation-prep

**Path:** `src/strategy-team/workflows/stakeholder-negotiation-prep/`
**Primary Agents:** Geneva (Stakeholder Mediator), Niccolo (The Realist), Sun (Master Strategist)

Prepare comprehensive negotiation playbooks.

**Negotiation Types:**
- Contract negotiations
- Partnership agreements
- M&A discussions
- Labor negotiations
- Vendor/supplier deals
- Regulatory negotiations

**Coverage:** Stakeholder analysis, interest mapping, BATNA analysis, scenario planning, tactical preparation

---

### strategic-decision-workshop

**Path:** `src/strategy-team/workflows/strategic-decision-workshop/`
**Agents:** All 14 strategy team advisors

Multi-perspective strategic decision analysis for high-stakes decisions requiring diverse viewpoints.

**Modern Professionals:** Augustus, Magnus, Cicero, Geneva, Sophia, Giuseppe
**Historical Archetypes:** Niccolo, Charles, Maximilien, Burke, Lee, Musashi, Sun, Jean-Luc

---

### strategic-planning-session

**Path:** `src/strategy-team/workflows/strategic-planning-session/`
**Primary Agents:** Sun (Master Strategist), Lee (Technocrat), Niccolo (The Realist)

Long-term strategic planning incorporating diverse strategic philosophies.

**Strategic Philosophies Applied:**
- Sun Tzu (strategic positioning)
- Clausewitz (concentration of force)
- Porter (competitive strategy)
- Blue Ocean (market creation)
- McKinsey 7S (organizational alignment)
- Balanced Scorecard (measurement)

---

## Cybersec-Team Workflows (13)

**Module Path:** `src/cybersec-team/workflows/`
**Focus:** Security testing, compliance auditing, incident response, vulnerability management, and security architecture.

### Summary Table

| # | Workflow | Steps | Primary Agent |
|---|----------|-------|---------------|
| 1 | blockchain-security-assessment | 8 | Ledger |
| 2 | cloud-security-assessment | 9 | Nimbus |
| 3 | compliance-audit-prep | 7 | Sentinel |
| 4 | incident-response-playbook | 8+ | Phoenix |
| 5 | infrastructure-security-testing | 8 | Nimbus/Spectre |
| 6 | mobile-security-testing | 8 | Phantom |
| 7 | network-assessment | 8 | Spectre |
| 8 | security-architecture-review | 7 | Bastion |
| 9 | security-awareness-training | 7 | Sentinel/Shield |
| 10 | threat-modeling | 9 | Bastion |
| 11 | virtual-ciso-consulting | 8 | Leadership |
| 12 | vulnerability-management | 8 | Watchman/Shield |
| 13 | web-app-security-testing | 8 | Weaver |

---

### blockchain-security-assessment

**Path:** `src/cybersec-team/workflows/blockchain-security-assessment/`
**Primary Agent:** Ledger (Blockchain Expert)
**Supporting Agents:** Gateway (API), Weaver (Web App), Cipher (Threat Intel)

Audit blockchain applications, smart contracts, DeFi protocols, and Web3 infrastructure.

**Platforms:** Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Solana

**Coverage:**
- Smart contract security (reentrancy, overflow, access control)
- Access control and centralization risks
- Economic security and tokenomics
- DeFi-specific vulnerabilities (flash loans, oracle manipulation)
- Infrastructure security (RPC, frontend, key management)

---

### cloud-security-assessment

**Path:** `src/cybersec-team/workflows/cloud-security-assessment/`
**Primary Agent:** Nimbus (Cloud Security Specialist)
**Supporting Agents:** Shield (Blue Team), Watchman (SOC), Spectre (Pentest)

Comprehensive cloud security assessment across AWS, Azure, and GCP.

**Coverage:**
- IAM security (root accounts, MFA, least privilege)
- Network security (VPC, security groups, WAF)
- Data protection (encryption, key management, secrets)
- Logging and monitoring (CloudTrail, SIEM)
- Compute security (VM, container, serverless)
- Compliance mapping (CIS Benchmarks, SOC 2, PCI-DSS)

---

### compliance-audit-prep

**Path:** `src/cybersec-team/workflows/compliance-audit-prep/`
**Primary Agent:** Sentinel (Compliance Guardian)
**Duration:** 6-12 hours

Prepare for compliance audits supporting 20+ frameworks.

**Supported Frameworks:**
- **Global:** NIST 800-53, ISO 27001, CIS Controls v8
- **US:** SOC 2, PCI-DSS, HIPAA, FedRAMP, CMMC
- **EU:** GDPR, NIS2, CRA, CSA, DORA, AI Act
- **Industry:** TISAX, SWIFT CSP, NERC CIP

**Outputs:** Audit overview, control mapping matrix, gap analysis, evidence plan, remediation roadmap

---

### incident-response-playbook

**Path:** `src/cybersec-team/workflows/incident-response-playbook/`
**Primary Agent:** Phoenix (Incident Commander)
**Supporting Agents:** Trace (Forensics), Cipher (Threat Intel), Watchman (SOC)

Dual-mode workflow for playbook creation (Mode A) and guided incident execution (Mode B).

**Frameworks:** NIST SP 800-61 Rev 2, MITRE ATT&CK, SANS
**Compliance:** GDPR (72-hour), PCI-DSS, HIPAA (60-day), SOC 2

**Coverage:**
- Preparation (IR team, tools, communication)
- Detection & Analysis (alert triage, IOC identification)
- Containment (short-term, long-term strategies)
- Eradication and recovery
- Post-incident lessons learned

---

### infrastructure-security-testing

**Path:** `src/cybersec-team/workflows/infrastructure-security-testing/`
**Primary Agents:** Nimbus (Cloud), Shield (Blue Team), Spectre (Pentest)

Infrastructure security assessment following CIS benchmarks.

**Coverage:**
- Server hardening (CIS benchmarks for Linux/Windows)
- Container security (image scanning, Dockerfile, runtime)
- Kubernetes (RBAC, pod security, network policies)
- CI/CD security (pipeline, runners, supply chain)
- Secrets management (Vault, scanning, lifecycle)
- Infrastructure as Code (Terraform, CloudFormation security)

**Tools:** Checkov, tfsec, KICS, Trivy, Kube-bench, Trufflehog

---

### mobile-security-testing

**Path:** `src/cybersec-team/workflows/mobile-security-testing/`
**Primary Agent:** Phantom (Mobile Security)
**Supporting Agents:** Weaver (Web App), Gateway (API)
**Frameworks:** OWASP MSTG, Mobile Top 10

Mobile application security testing for iOS and Android.

**Coverage:**
- Static analysis (binary protections, hardcoded secrets)
- Dynamic analysis (runtime hooking, cert pinning bypass)
- Data storage (Keychain/Keystore, local databases)
- Network security (TLS, certificate pinning)
- Authentication and authorization
- Platform-specific vulnerabilities

**Tools:** Frida, objection, jadx, apktool, MobSF, Burp Suite

---

### network-assessment

**Path:** `src/cybersec-team/workflows/network-assessment/`
**Primary Agent:** Spectre (Pentest Lead)
**Supporting Agents:** Shield (Blue Team), Nimbus (Cloud), Watchman (SOC)
**Frameworks:** PTES, NIST SP 800-115, OSSTMM

Network penetration testing covering internal and external assessment.

**Coverage:**
- Reconnaissance (DNS, topology, host identification)
- Scanning (TCP/UDP, service enumeration, OS fingerprinting)
- Vulnerability assessment (automated scanning, manual verification)
- Network services (SMB, AD, databases, remote access)
- Wireless security (WPA/WPA2, WPS, rogue AP)
- Segmentation testing (VLAN, firewall, lateral movement)

**Tools:** Nmap, Masscan, Nessus, Metasploit, CrackMapExec, BloodHound

---

### security-architecture-review

**Path:** `src/cybersec-team/workflows/security-architecture-review/`
**Primary Agent:** Bastion (Security Architect)
**Duration:** 4-6 hours

STRIDE threat modeling and security control assessment with zero-trust validation.

**Steps:**
1. Initialization & Context Gathering
2. STRIDE Threat Modeling
3. Security Control Assessment
4. Attack Surface Analysis (optional with Ghost)
5. Zero-Trust Validation
6. Recommendations & Remediation
7. Final Report Generation

**Frameworks:** STRIDE, NIST CSF, CIS Controls, OWASP ASVS, Zero Trust (NIST SP 800-207)

---

### security-awareness-training

**Path:** `src/cybersec-team/workflows/security-awareness-training/`
**Primary Agents:** Sentinel (Compliance), Shield (Blue Team Lead)
**Frameworks:** NIST CSF, CIS Controls, SANS Security Awareness

Develop comprehensive security awareness training programs.

**Coverage:**
- Human risk assessment (threats, high-risk populations)
- Training content development (role-based tracks)
- Phishing simulation strategy
- Delivery and LMS integration
- Metrics and measurement (KPIs, reporting)
- Continuous improvement roadmap

---

### threat-modeling

**Path:** `src/cybersec-team/workflows/threat-modeling/`
**Primary Agent:** Bastion (Security Architect)
**Supporting Agents:** Cipher (Threat Analyst), Weaver (Web App), Gateway (API)
**Frameworks:** Microsoft STRIDE, NIST SP 800-30, OWASP

Systematic STRIDE threat modeling for applications, systems, and architectures.

**STRIDE Categories:**
- **S**poofing (Authentication)
- **T**ampering (Integrity)
- **R**epudiation (Non-repudiation)
- **I**nformation Disclosure (Confidentiality)
- **D**enial of Service (Availability)
- **E**levation of Privilege (Authorization)

---

### virtual-ciso-consulting

**Path:** `src/cybersec-team/workflows/virtual-ciso-consulting/`
**Duration:** 5-9 hours across multiple sessions
**Output:** 50-100 page vCISO engagement document

Complete vCISO engagement lifecycle for security consultants.

**Deliverables:**
1. Engagement overview and RACI
2. Budget and resource plan (3-year projection)
3. Current state assessment (maturity scoring)
4. Strategic security roadmap (3-year vision)
5. Governance framework design
6. Board/executive reporting templates
7. Vendor risk program
8. Advisory schedule and QBR structure

**Frameworks:** NIST CSF, ISO 27001, CIS Controls, NIST 800-53

---

### vulnerability-management

**Path:** `src/cybersec-team/workflows/vulnerability-management/`
**Primary Agents:** Watchman (SOC Analyst), Shield (Blue Team Lead), Ghost (Pentest)
**Frameworks:** CVSS, EPSS, CISA KEV, CIS Controls

Establish comprehensive vulnerability management program.

**Coverage:**
- Asset inventory with criticality ratings
- Scanning strategy and schedules
- Vulnerability assessment and validation
- Risk-based prioritization (CVSS/EPSS)
- Remediation planning with ownership
- Tracking, reporting, and metrics
- Program maturity assessment

---

### web-app-security-testing

**Path:** `src/cybersec-team/workflows/web-app-security-testing/`
**Primary Agent:** Weaver (Web App Security)
**Supporting Agents:** Gateway (API), Spectre (Pentest)
**Frameworks:** OWASP Testing Guide v4.2, OWASP Top 10 (2021), ASVS

Web application penetration testing covering OWASP Top 10.

**OWASP Top 10 Coverage:**
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection (SQL, XSS, Command)
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Authentication Failures
- A08: Data Integrity Failures
- A09: Logging Failures
- A10: SSRF

**Tools:** Burp Suite, OWASP ZAP, SQLMap, Nikto, Nuclei, ffuf

---

## Workflow Usage

### Invocation Methods

#### 1. Slash Command Invocation
```bash
/bmad:<module>:workflows:<workflow-name>

# Examples:
/bmad:intel-team:workflows:operation-mosaic
/bmad:cybersec-team:workflows:security-architecture-review
/bmad:strategy-team:workflows:strategic-decision-workshop
/bmad:legal-team:workflows:contract-review
```

#### 2. Agent Menu Selection
Most workflows can be accessed through the primary agent's action menu:
```bash
# Start the agent
/bmad:<module>:agents:<agent-name>

# Select workflow from menu options
```

#### 3. Direct Workflow Loading
```bash
Load and follow: src/<module>/workflows/<workflow-name>/workflow.md
```

### Multi-Session Support

All workflows support pausing and resuming:

1. **State Tracking:** Progress tracked via `stepsCompleted` in frontmatter
2. **Automatic Detection:** Workflows detect existing progress on restart
3. **Continuation Handler:** `step-01b-continue.md` manages resumption
4. **No Data Loss:** All progress saved after each step completion

### Output Locations

Workflows generate output documents in configured locations:
```
{output_folder}/
├── intelligence/     # Intel team outputs
├── legal/           # Legal team outputs
├── strategy/        # Strategy team outputs
├── security/        # Cybersec team outputs
└── planning/        # Cross-team planning documents
```

---

## Workflow Architecture

### Standard Step Structure

Each workflow follows a consistent architecture:

```
<workflow-name>/
├── workflow.md           # Main configuration and initialization
├── README.md             # Documentation and usage guide
├── steps/
│   ├── step-01-init.md          # Initialization step
│   ├── step-01b-continue.md     # Continuation handler
│   ├── step-02-<phase>.md       # Phase-specific steps
│   ├── step-03-<phase>.md
│   └── step-NN-<final>.md       # Final output generation
└── templates/            # Optional output templates
    └── <template>.md
```

### Step Processing Rules

1. **READ COMPLETELY:** Always read entire step file before execution
2. **FOLLOW SEQUENCE:** Execute all numbered sections in order
3. **WAIT FOR INPUT:** Halt at menus and wait for user selection
4. **CHECK CONTINUATION:** Only proceed when user confirms
5. **SAVE STATE:** Update `stepsCompleted` before loading next step
6. **LOAD NEXT:** When directed, load and follow next step file

### Collaboration Tools

Workflows integrate with BMAD collaboration tools:

- **Party Mode:** Multi-agent collaboration on complex analysis
- **Advanced Elicitation:** Enhanced quality review and validation
- **Brainstorming:** Creative ideation and scenario generation

---

## Related Documentation

- [AGENTS-REFERENCE.md](./AGENTS-REFERENCE.md) - Complete agent documentation
- [MODULES-OVERVIEW.md](./MODULES-OVERVIEW.md) - Module descriptions
- [PARTY-MODE-GUIDE.md](./PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [GETTING-STARTED.md](./GETTING-STARTED.md) - Quick start guide

---

*This reference is maintained as part of the BMAD multi-agent system documentation.*
