# BMAD Prompt Database

**Purpose**: Help users provide quality inputs to get quality outputs. Better prompts = better results.

---

## Quick Reference

| Module | Best For | Start With |
|--------|----------|------------|
| **Cybersec** | Security assessments, incidents, compliance | Incident Response or Security Architecture |
| **Intel** | Research, investigations, threat analysis | Flash Assessment or Campaign Planner |
| **Legal** | Contracts, compliance, disputes | Legal Matter Intake |
| **Strategy** | Decisions, negotiations, planning | Strategic Decision Workshop |

---

## CYBERSEC MODULE

### Incident Response Prompts

**Incident Response Playbook**
```
Incident type: [Malware, ransomware, data breach, unauthorized access, DDoS, insider threat]
Detection source: [SIEM alert, user report, external notification, threat intel]
Affected systems: [Servers, endpoints, cloud services, networks - be specific]
Current containment: [What's been done so far, if anything]
Business impact: [Critical systems affected, data at risk, operational disruption]
Timeline: [When detected, when started (if known)]
```

**Forensic Investigation**
```
Incident reference: [Ticket/case number if exists]
Evidence sources: [Logs, disk images, memory dumps, network captures]
Chain of custody: [Who has handled evidence, storage location]
Legal hold: [Is litigation anticipated? Preservation requirements?]
Key questions: [What specifically needs to be determined]
Timeline constraints: [Reporting deadlines, legal requirements]
```

### Security Assessment Prompts

**Security Architecture Review**
```
System/application: [Name and brief description]
Architecture type: [Monolith, microservices, serverless, hybrid]
Data classification: [What sensitive data is processed/stored]
Current controls: [Existing security measures]
Compliance requirements: [PCI, HIPAA, SOC2, GDPR, etc.]
Concerns: [Specific areas you want scrutinized]
```

**STRIDE Threat Modeling**
```
Application: [Name and purpose]
Architecture diagram: [Provide or describe data flows]
Trust boundaries: [Where do trust levels change]
Entry points: [User inputs, APIs, file uploads, etc.]
Assets to protect: [Data, credentials, functionality]
Threat actors: [Who might attack - script kiddies to nation-states]
```

**Penetration Testing Scope**
```
Target: [Applications, networks, APIs - be specific]
Test type: [Black box, gray box, white box]
Environment: [Production, staging, dedicated test]
In-scope: [IP ranges, domains, applications]
Out-of-scope: [Systems/methods explicitly excluded]
Rules of engagement: [Testing windows, notification requirements, stop conditions]
Credentials provided: [User accounts, API keys if gray/white box]
```

### Compliance Prompts

**Compliance Audit Preparation**
```
Framework: [SOC2, ISO 27001, PCI-DSS, HIPAA, GDPR, NIST, etc.]
Audit type: [Initial certification, renewal, surveillance]
Scope: [Systems, processes, locations in scope]
Current state: [Last audit results, known gaps]
Timeline: [When is the audit]
Evidence needed: [Specific controls or documentation gaps]
```

**Virtual CISO Consulting**
```
Organization: [Size, industry, maturity level]
Current security posture: [Brief assessment or unknown]
Budget: [Annual security budget or constraints]
Immediate concerns: [What triggered this engagement]
Strategic goals: [Where do you want to be in 1-3 years]
Regulatory environment: [Applicable compliance requirements]
```

### Technical Assessment Prompts

**Cloud Security Assessment**
```
Cloud provider: [AWS, Azure, GCP, multi-cloud]
Services used: [Compute, storage, databases, serverless, etc.]
Architecture: [Single account, multi-account, landing zone]
Current controls: [IAM policies, network security, encryption]
Compliance requirements: [Industry-specific requirements]
Concerns: [Data exposure, misconfigurations, cost optimization]
```

**Web Application Security Testing**
```
Application URL: [Target application]
Technology stack: [Frontend, backend, database, frameworks]
Authentication: [Type - SSO, OAuth, custom, none]
User roles: [Different access levels to test]
Sensitive functions: [Payments, PII handling, admin functions]
Previous findings: [Known vulnerabilities or past assessments]
```

**Network Security Assessment**
```
Network scope: [IP ranges, VLANs, segments]
Network type: [Corporate, OT/ICS, cloud, hybrid]
Critical assets: [Domain controllers, databases, crown jewels]
Current segmentation: [Flat network vs segmented]
Remote access: [VPN, jump hosts, direct access methods]
Known concerns: [Legacy systems, shadow IT, recent changes]
```

### Specialized Security Prompts

**Blockchain Security Assessment**
```
Platform: [Ethereum, Solana, private chain, etc.]
Contract addresses: [If auditing deployed contracts]
Codebase: [Repository link or paste code]
Token economics: [If applicable - tokenomics model]
Previous audits: [Past findings, fixes applied]
Deployment timeline: [When going to mainnet]
```

**Mobile Security Testing**
```
Platform: [iOS, Android, or both]
App distribution: [App Store, enterprise, sideload]
Backend APIs: [Endpoints the app communicates with]
Sensitive data: [What's stored on device, transmitted]
Authentication: [Biometrics, PIN, passwords, tokens]
Offline functionality: [What works without connectivity]
```

---

## INTEL MODULE

### Investigation Prompts

**Flash Assessment** (15-min quick scan)
```
Target: [Full name / Company name / Domain]
Context: [Why investigating - business deal, hiring, threat, etc.]
Priority: [What matters most - reputation, financial, security, connections]
```

**Campaign Planner - Individual**
```
Subject: [Name, known aliases]
Known identifiers: [Email, phone, social handles, location]
Investigation goal: [Background check, locate, threat assessment, due diligence]
Scope limits: [Jurisdictions, time period, budget constraints]
Legal basis: [Employment screening, litigation, security clearance, etc.]
```

**Campaign Planner - Organization**
```
Entity: [Company name, registration jurisdiction]
Known details: [Website, executives, industry, subsidiaries]
Investigation goal: [M&A due diligence, competitor analysis, vendor vetting, threat assessment]
Depth required: [Surface scan, standard, comprehensive, forensic]
```

**Campaign Planner - AI Systems**
```
Target: [AI company/model/system name]
Focus areas: [Training data, capabilities, safety, ownership, deployment]
Concern type: [Competitive intel, security risk, partnership evaluation, regulatory]
```

### Threat Analysis Prompts

**Attribution Chain**
```
Incident: [Brief description of what happened]
Available indicators: [IPs, domains, malware hashes, TTPs observed]
Suspected origin: [Region, actor type, motivation if known]
Confidence threshold: [How certain do we need to be before acting]
```

**Threat Constellation**
```
Known actor: [Name or identifier]
Observed activity: [What they've done]
Infrastructure: [Domains, IPs, tools seen]
Question: [What's their full capability? Who are they connected to?]
```

**Doppelganger Hunt**
```
Authentic account: [Real person/entity being impersonated]
Suspected fakes: [Links to suspicious accounts if any]
Platform focus: [LinkedIn, Twitter, Telegram, etc.]
Urgency: [Active fraud, reputation damage, monitoring only]
```

### Digital Forensics Prompts

**Breach Archaeology**
```
Entity to check: [Domain, email pattern, company name]
Known breaches: [Any already aware of]
Time scope: [How far back to search]
Risk priority: [Credentials, PII, financial, strategic]
```

**Digital Necromancy**
```
Target: [Person or entity]
What's missing: [Deleted posts, removed pages, historical presence]
Last known: [When/where content existed]
Purpose: [Evidence preservation, pattern analysis, due diligence]
```

**Infrastructure Genealogy**
```
Domain/IP: [Starting point]
Question: [Who owned it? What was it used for? What's connected?]
Time range: [Historical scope needed]
```

### Field Operations Prompts

**Ground Truth** (Physical operation prep)
```
Location: [Address or area]
Objective: [What needs to be observed/verified]
Constraints: [Legal limits, time window, cover requirements]
Risk level: [Low profile, standard, high security environment]
```

**Approach Vector** (Social engineering assessment)
```
Target: [Individual or organization]
Objective: [Information needed, access required]
Ethical bounds: [Authorized pentest, awareness training, threat simulation]
```

---

## LEGAL MODULE

### Contract Prompts

**Contract Review**
```
Document: [Paste contract or attach file]
My role: [Which party am I?]
Concerns: [Specific clauses, risks, or terms to scrutinize]
Jurisdiction: [Governing law]
Deal context: [Strategic importance, negotiation leverage, timeline]
```

**Contract Drafting**
```
Contract type: [NDA, SaaS, employment, partnership, etc.]
Parties: [Who's involved and their roles]
Key terms: [Duration, payment, deliverables, exclusivity]
Jurisdiction: [Where enforceable]
Special requirements: [IP assignment, non-compete, data protection]
```

### Corporate Prompts

**Corporate Formation**
```
Business type: [What the company will do]
Founders: [Who, where located, ownership split]
Jurisdictions: [Where to incorporate, where operating]
Goals: [Tax efficiency, liability protection, investor readiness, privacy]
Capital: [Initial funding, future fundraising plans]
```

**Tax Planning**
```
Current structure: [Existing entities, jurisdictions]
Revenue sources: [Where money comes from]
Operations: [Where work happens]
Goals: [Reduce burden, repatriation, compliance, restructuring]
Constraints: [Substance requirements, timeline, budget]
```

### Dispute Prompts

**Dispute Strategy**
```
Situation: [What happened]
Parties: [Who's involved]
Damages: [What's at stake - money, reputation, rights]
Evidence: [What you have]
Goals: [Settlement, litigation, preservation, deterrence]
Constraints: [Budget, publicity concerns, relationships to preserve]
```

**Legal Matter Intake** (When unsure where to start)
```
Situation: [Describe what's happening]
Jurisdiction: [Where this is happening]
Urgency: [Timeline pressures]
Budget: [Resources available]
Desired outcome: [What does success look like]
```

---

## STRATEGY MODULE

### Decision Making Prompts

**Strategic Decision Workshop**
```
Decision: [What needs to be decided]
Options: [Known alternatives - or ask for options]
Stakeholders: [Who's affected, who decides]
Constraints: [Time, money, political, ethical]
Success criteria: [How to measure good outcome]
Risks you're worried about: [What keeps you up at night]
```

**Ethical Dilemma Resolution**
```
Situation: [Describe the dilemma]
Competing values: [What principles are in tension]
Stakeholders: [Who's affected]
Constraints: [Legal, cultural, organizational]
Your instinct: [What you're leaning toward and why]
```

**Political Risk Assessment**
```
Initiative: [What you're planning]
Jurisdictions: [Where it operates]
Timeline: [When implementation, how long running]
Dependencies: [Regulatory approvals, government contracts, public opinion]
Scenario to stress-test: [Election change, policy shift, international tension]
```

### Negotiation Prompts

**Stakeholder Negotiation Prep**
```
Negotiation: [What you're negotiating]
Counterparty: [Who and what you know about them]
Your position: [What you want, BATNA, walk-away point]
Their likely position: [What they want, their constraints]
Relationship: [One-time, ongoing, power dynamics]
```

**Conflict Resolution**
```
Conflict: [What's the dispute]
Parties: [Who's involved, their roles]
History: [How it escalated]
Desired outcome: [Resolution, containment, separation]
Constraints: [Can't fire anyone, public visibility, legal exposure]
```

### Leadership Prompts

**Board Presentation Prep**
```
Topic: [What you're presenting]
Ask: [What you need from the board - approval, funding, guidance]
Board composition: [Types of directors, their concerns]
Controversial elements: [What might get pushback]
Q&A concerns: [Questions you're dreading]
```

**Crisis Response Planning**
```
Crisis type: [Data breach, PR disaster, executive departure, etc.]
Current status: [Brewing, active, post-incident]
Stakeholders to manage: [Employees, customers, media, regulators]
Constraints: [Legal exposure, ongoing investigation, NDA]
Spokesperson: [Who will communicate]
```

**Leadership Transition Planning**
```
Role: [Position transitioning]
Timeline: [When transition happens]
Incumbent: [Departing leader's tenure, relationships, knowledge]
Successor: [Internal/external, identified/searching]
Risks: [Key relationships, institutional knowledge, team stability]
```

### Competitive Prompts

**Competitive Warfare**
```
Competitor: [Who]
Battlefield: [Market, talent, technology, regulation]
Your position: [Strengths, weaknesses, resources]
Their position: [What you know about their strategy]
Objective: [Defend, attack, flank, retreat]
Rules of engagement: [Legal/ethical boundaries]
```

**M&A Due Diligence**
```
Target: [Company name]
Deal type: [Acquisition, merger, investment, partnership]
Strategic rationale: [Why this target]
Known risks: [What you're already worried about]
Integration concerns: [Culture, technology, people, customers]
Timeline: [Deal velocity]
```

---

## Tips for Better Results

### Be Specific
- Bad: "Research this company"
- Good: "Assess XYZ Corp's financial stability and litigation history for vendor due diligence, focusing on the past 3 years"

### State Your Goal
- Bad: "Review this contract"
- Good: "Review this SaaS agreement from vendor's perspective, flag terms that expose us to unlimited liability or allow unilateral changes"

### Provide Context
- Bad: "Plan for the board meeting"
- Good: "Prepare board presentation for Q1 results. Revenue missed by 15%, but pipeline is strong. Board includes 2 VCs who may push for cost cuts."

### Set Boundaries
- Include jurisdiction, budget, timeline, ethical limits
- State what you can't do (fire people, break contracts, etc.)
- Mention relationships to preserve

### Ask for Options
- Instead of "Tell me what to do"
- Try "Give me 3 options with tradeoffs"

---

## Common Workflows by Scenario

| Scenario | Start Here | Then Consider |
|----------|------------|---------------|
| **Security & Incidents** | | |
| Active breach | Incident Response Playbook | Forensic Investigation |
| Security assessment needed | Security Architecture Review | Penetration Testing |
| Compliance audit coming | Compliance Audit Prep | Virtual CISO |
| Cloud migration security | Cloud Security Assessment | Security Architecture Review |
| New application launch | STRIDE Threat Modeling | Web App Security Testing |
| **Intelligence & Research** | | |
| New business partner | Flash Assessment | Campaign Planner - Org |
| Hiring executive | Campaign Planner - Individual | Ground Truth |
| Security incident attribution | Attribution Chain | Threat Constellation |
| Competitor threat | Threat Constellation | Competitive Warfare |
| **Legal & Compliance** | | |
| Contract negotiation | Contract Review | Stakeholder Negotiation Prep |
| New entity setup | Corporate Formation | Tax Planning |
| Regulatory inquiry | Legal Matter Intake | Dispute Strategy |
| **Strategy & Leadership** | | |
| Major decision pending | Strategic Decision Workshop | Political Risk Assessment |
| Entering new market | Political Risk Assessment | Corporate Formation |
| Board conflict | Conflict Resolution | Board Relations Management |
| M&A opportunity | M&A Due Diligence | Contract Review |
| Executive departure | Leadership Transition | Crisis Response Planning |
| Crisis unfolding | Crisis Response Planning | Incident Response Playbook |
