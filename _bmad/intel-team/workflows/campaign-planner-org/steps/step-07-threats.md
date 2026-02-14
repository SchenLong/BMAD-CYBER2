---
name: 'step-07-threats'
description: 'Industry threats, targeting history, supply chain risks'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-07-threats.md'
nextStepFile: '{workflow_path}/steps/step-08-human-surface.md'
prevStepFile: '{workflow_path}/steps/step-06-underground.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Phase 7: Threat Landscape Assessment

## STEP GOAL

Assess the threat landscape relevant to this organization including industry-specific threat actors, historical targeting, supply chain risks, and geopolitical factors. Provide context for the organization's threat exposure.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Dossier**, Threat Actor Profiler
- You specialize in threat actor analysis and attribution
- You assess industry-specific and organization-specific threats
- You identify threat patterns and predict likely adversaries

### Assessment Protocol
- Identify threat actors active in the organization's sector
- Review historical targeting of the organization
- Assess supply chain and third-party risks
- Evaluate geopolitical threat factors
- Correlate underground findings with known actors

---

## ASSESSMENT EXECUTION SEQUENCE

### 1. Industry Threat Landscape

Identify threats specific to the organization's industry:

```
INDUSTRY THREAT LANDSCAPE
=========================

Organization Profile:
□ Primary Industry: [industry]
□ Sub-sector: [if applicable]
□ Geographic Markets: [countries]
□ Industry Risk Tier: [High/Medium/Low]

Threat Actors Active in Industry:
| Actor Name | Type | Motivation | Activity Level | Sophistication |
|------------|------|------------|----------------|----------------|
| [APT name] | Nation-state | [espionage/IP theft] | [Active/Historical] | [High/Med] |
| [Group name] | Ransomware | Financial | [Active/Historical] | [Med/Low] |
| [Group name] | Criminal | [motivation] | [Active/Historical] | [level] |

Industry-Specific TTPs:
| Technique | Actor(s) | MITRE ID | Prevalence |
|-----------|----------|----------|------------|
| [technique] | [actors] | [T1xxx] | [Common/Occasional] |

Recent Industry Incidents:
| Date | Victim (Industry Peer) | Actor | Impact |
|------|----------------------|-------|--------|
| [date] | [similar company] | [actor if known] | [impact] |

INDUSTRY RISK ASSESSMENT:
- Overall industry threat level: [High/Medium/Low]
- Primary threat type: [espionage/ransomware/fraud/etc]
- Trending threat: [emerging threat in sector]
- Sector-specific concerns: [list]
```

### 2. Historical Targeting Analysis

Review if organization has been targeted before:

```
HISTORICAL TARGETING ANALYSIS
=============================

Known Previous Incidents:
| Date | Incident Type | Actor (if known) | Outcome |
|------|---------------|------------------|---------|
| [date] | [breach/attack/attempt] | [actor] | [outcome] |

Public Breach Disclosures:
| Date | Disclosure Source | Incident Summary |
|------|-------------------|------------------|
| [date] | [SEC filing/news/etc] | [summary] |

Threat Intelligence Matches:
| Source | Reference to Organization | Context |
|--------|--------------------------|---------|
| [intel source] | [mention type] | [context] |

Underground Activity (from Phase 6):
| Finding | Actor Connection | Threat Assessment |
|---------|------------------|-------------------|
| [finding] | [actor if identified] | [assessment] |

Attack Surface Evolution:
□ Historical infrastructure changes: [significant changes]
□ Previous vulnerabilities disclosed: [if known]
□ Security incidents made public: [list]

HISTORICAL TARGETING SUMMARY:
- Known previous targeting: [Y/N]
- Attack frequency: [frequent/occasional/rare/none known]
- Most likely previous attackers: [actors if known]
- Lessons from history: [observations]
```

### 3. Nation-State Threat Assessment

Evaluate nation-state threat exposure:

```
NATION-STATE THREAT ASSESSMENT
==============================

Geographic Risk Factors:
| Country of Operation | Threat Level | Relevant APTs |
|---------------------|--------------|---------------|
| [country] | [High/Med/Low] | [APT names] |

Industry + Geography Intersection:
| Risk Factor | Assessment |
|-------------|------------|
| Strategic industry to nation-states | [Y/N, which] |
| Defense/government supplier | [Y/N] |
| Critical infrastructure | [Y/N] |
| IP valuable to nation-states | [Y/N, which] |
| Geopolitical tension exposure | [Y/N, where] |

Relevant APT Groups:
| APT | Sponsor | Motivation | Historical Targeting |
|-----|---------|------------|---------------------|
| [APT name] | [country] | [espionage/IP theft] | [similar orgs targeted] |

APT TTP Overlap with Organization:
| APT | Technologies They Target | Org Uses | Risk |
|-----|------------------------|----------|------|
| [APT] | [tech list] | [Y/N] | [H/M/L] |

NATION-STATE RISK SUMMARY:
- Primary nation-state threat: [country/APT]
- Secondary threats: [list]
- Espionage risk: [High/Medium/Low]
- Critical consideration: [key concern]
```

### 4. Criminal Threat Assessment

Evaluate criminal threat exposure:

```
CRIMINAL THREAT ASSESSMENT
==========================

Ransomware Risk:
| Factor | Assessment | Notes |
|--------|------------|-------|
| Industry targeting | [High/Med/Low] | [which groups target sector] |
| Revenue visibility | [known/estimated] | [attractiveness factor] |
| Security posture | [Strong/Moderate/Weak] | [from Phase 3/6] |
| Previous incidents | [Y/N] | [details] |
| Access broker activity | [Y/N] | [from Phase 6] |

Ransomware Groups Most Likely:
| Group | Industry Focus | Recent Activity | Estimated Risk |
|-------|---------------|-----------------|----------------|
| [group] | [sectors] | [recent victims] | [High/Med/Low] |

Financial Crime Risk:
| Threat Type | Likelihood | Factors |
|-------------|------------|---------|
| BEC/Wire Fraud | [H/M/L] | [executive exposure, financial operations] |
| Invoice Fraud | [H/M/L] | [supplier relationships] |
| Credential Theft | [H/M/L] | [breach exposure from Phase 6] |

Fraud Indicators:
□ Typosquat domains registered: [Y/N]
□ Executive impersonation attempts: [Y/N]
□ Supplier compromise indicators: [Y/N]

CRIMINAL THREAT SUMMARY:
- Ransomware risk: [High/Medium/Low]
- Financial crime risk: [High/Medium/Low]
- Most likely criminal actors: [list]
- Key criminal concern: [primary threat]
```

### 5. Supply Chain Threat Assessment

Evaluate third-party and supply chain risks:

```
SUPPLY CHAIN THREAT ASSESSMENT
==============================

Key Third-Party Dependencies (from Phases 2-3):
| Vendor/Service | Type | Criticality | Risk Level |
|----------------|------|-------------|------------|
| [vendor] | [SaaS/hosting/etc] | [High/Med/Low] | [risk] |

Third-Party Breach History:
| Vendor | Breach Date | Impact to Similar Orgs |
|--------|-------------|----------------------|
| [vendor] | [date] | [impact assessment] |

Software Supply Chain:
| Software | Type | Known Vulnerabilities | Targeting |
|----------|------|----------------------|-----------|
| [software] | [library/platform] | [CVEs] | [by whom] |

Island Hopping Risk:
□ High-value supplier relationships: [list]
□ Suppliers previously compromised: [Y/N]
□ Supplier access to org systems: [extent]
□ Managed service providers: [list]

SUPPLY CHAIN SUMMARY:
- Overall supply chain risk: [High/Medium/Low]
- Highest risk third-party: [vendor]
- Software supply chain concerns: [list]
- Island hopping probability: [assessment]
```

### 6. Threat Actor Prioritization

Prioritize threat actors for the organization:

```
THREAT ACTOR PRIORITIZATION
===========================

Priority Threat Actors:
| Rank | Actor | Type | Motivation | Likelihood | Impact |
|------|-------|------|------------|------------|--------|
| 1 | [name] | [type] | [motivation] | [H/M/L] | [H/M/L] |
| 2 | [name] | [type] | [motivation] | [H/M/L] | [H/M/L] |
| 3 | [name] | [type] | [motivation] | [H/M/L] | [H/M/L] |
| 4 | [name] | [type] | [motivation] | [H/M/L] | [H/M/L] |
| 5 | [name] | [type] | [motivation] | [H/M/L] | [H/M/L] |

Threat Matrix:
| Threat Type | Likelihood | Impact | Overall Risk |
|-------------|------------|--------|--------------|
| Nation-state espionage | [H/M/L] | [H/M/L] | [H/M/L] |
| Ransomware | [H/M/L] | [H/M/L] | [H/M/L] |
| BEC/Fraud | [H/M/L] | [H/M/L] | [H/M/L] |
| Hacktivism | [H/M/L] | [H/M/L] | [H/M/L] |
| Insider threat | [H/M/L] | [H/M/L] | [H/M/L] |
| Supply chain | [H/M/L] | [H/M/L] | [H/M/L] |

MITRE ATT&CK Priority Techniques:
| Technique | ID | Priority Actors | Defense Priority |
|-----------|-----|----------------|------------------|
| [technique] | T1xxx | [actors] | [High/Med/Low] |

PRIORITIZATION SUMMARY:
- Primary threat: [actor/type]
- Secondary threat: [actor/type]
- Tertiary threat: [actor/type]
- Monitoring priorities: [list]
```

### 7. Threat Landscape Summary

Compile threat landscape findings:

```
THREAT LANDSCAPE SUMMARY
========================

Overall Threat Assessment:
| Category | Rating | Key Factors |
|----------|--------|-------------|
| Industry Risk | [H/M/L] | [factors] |
| Geographic Risk | [H/M/L] | [factors] |
| Historical Targeting | [Y/N/Unknown] | [details] |
| Nation-State Exposure | [H/M/L] | [factors] |
| Criminal Exposure | [H/M/L] | [factors] |
| Supply Chain Risk | [H/M/L] | [factors] |

Priority Threats:
1. [Most likely/impactful threat]
2. [Second priority threat]
3. [Third priority threat]

Threat Intelligence Gaps:
- [Gap in understanding]
- [Additional collection needed]

PIR Contribution:
| PIR | Threat Assessment Contribution | Status |
|-----|------------------------------|--------|
| PIR-1 | [contribution] | [status] |
| PIR-2 | [contribution] | [status] |
| PIR-3 | [contribution] | [status] |
| PIR-4 | [contribution] | [status] |

Handoff to Viper (Phase 8):
- Key personnel at risk: [list]
- Social engineering vectors: [list]
- Physical security concerns: [list]
```

---

## PHASE 7 OUTPUT

```markdown
## THREAT LANDSCAPE SUMMARY

### Industry Context
- Industry: [industry]
- Industry threat level: [High/Medium/Low]
- Active threat actors: [count]

### Targeting History
- Previously targeted: [Y/N]
- Known incidents: [count]
- Actor attribution: [if known]

### Nation-State Risk
- Exposure level: [High/Medium/Low]
- Primary APT concern: [actor]
- Espionage risk: [assessment]

### Criminal Risk
- Ransomware risk: [High/Medium/Low]
- Financial crime risk: [High/Medium/Low]
- Most likely groups: [list]

### Supply Chain
- Third-party risk: [High/Medium/Low]
- Key vulnerabilities: [list]

### Priority Threats
1. [#1 threat]
2. [#2 threat]
3. [#3 threat]

### Ready for Human Attack Surface Analysis
Threat landscape assessed. Proceed to HUMINT vulnerability analysis.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 8:
- [ ] Industry threats mapped
- [ ] Historical targeting reviewed
- [ ] Nation-state threats assessed
- [ ] Criminal threats assessed
- [ ] Supply chain analyzed
- [ ] Threats prioritized
- [ ] Human targets identified for Viper

---

## MENU OPTIONS

**[C] Continue** - Proceed to human attack surface (Phase 8)
**[A] APT** - Deeper nation-state analysis
**[R] Ransomware** - Extended ransomware assessment
**[S] Supply Chain** - Detailed supply chain review

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-08-human-surface.md`
