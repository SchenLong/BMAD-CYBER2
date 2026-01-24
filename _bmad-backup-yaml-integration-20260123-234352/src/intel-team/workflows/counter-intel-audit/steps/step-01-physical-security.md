---
name: 'step-01-physical-security'
description: 'Facility exposure, personnel identification risk, surveillance vulnerability, access control gaps'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
thisStepFile: '{workflow_path}/steps/step-01-physical-security.md'
nextStepFile: '{workflow_path}/steps/step-02-electronic-security.md'
prevStepFile: null

# Agent Configuration
executing_agent: field-operative
agent_codename: Specter
---

# Step 1: Physical Security Assessment

## STEP GOAL

Assess physical security vulnerabilities from an OSINT perspective including facility exposure, personnel identification risks, surveillance vulnerabilities, and access control gaps visible through open sources.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Specter**, Field Operative
- You specialize in physical security and operational planning
- You assess vulnerabilities from an adversary's perspective
- You identify what an attacker could learn for physical operations

### Analysis Protocol
- Analyze all facility exposure through open sources
- Identify personnel identification risks
- Assess surveillance vulnerabilities
- Document visible access control gaps
- Consider what adversary could learn for physical targeting

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Audit Scope Definition

Define the organization and assessment scope:

```
COUNTER-INTEL AUDIT: SCOPE DEFINITION
=====================================

Organization:
□ Name: [organization name]
□ Type: [corporation/government/NGO/other]
□ Industry: [sector]
□ Size: [employees/revenue estimate]
□ Geographic presence: [locations]

Assessment Scope:
□ Headquarters: [Y/N]
□ Branch offices: [Y/N - count]
□ Data centers: [Y/N]
□ Executive residences: [Y/N]
□ Manufacturing/operations: [Y/N]
□ Other facilities: [specify]

Key Personnel in Scope:
| Name | Role | Priority |
|------|------|----------|
| [name] | [C-suite/VP/etc] | [P1/P2/P3] |

Assessment Objectives:
□ Full exposure audit
□ Executive protection focus
□ Facility security focus
□ Pre-incident assessment
□ Post-breach evaluation

Known Concerns:
| Concern | Details |
|---------|---------|
| [concern 1] | [specifics] |
```

### 2. Facility Exposure Analysis

Assess facility visibility and exposure:

```
FACILITY EXPOSURE ANALYSIS
==========================

Facility Inventory:
| Facility | Address | Type | Public Visibility |
|----------|---------|------|-------------------|
| Headquarters | [address] | Office | [high/medium/low] |
| [Facility 2] | [address] | [type] | [visibility] |

Imagery Analysis:
| Facility | Source | Quality | What's Visible |
|----------|--------|---------|----------------|
| [facility] | Google Maps | [street view/satellite] | [description] |
| [facility] | Bing Maps | [quality] | [what visible] |
| [facility] | Social media | [quality] | [employee photos] |

Building Information Discovered:
| Facility | Data Point | Source | Risk |
|----------|------------|--------|------|
| [facility] | Floor plan online | [where found] | [H/M/L] |
| [facility] | Tenant list | [source] | [risk] |
| [facility] | Security company | [source] | [risk] |
| [facility] | Construction permits | [source] | [risk] |

Physical Security Visible:
| Facility | Observation | Source | Adversary Value |
|----------|-------------|--------|-----------------|
| [facility] | Guard presence/absence | [imagery] | [what it reveals] |
| [facility] | Access control type | [imagery] | [value] |
| [facility] | CCTV coverage | [imagery] | [value] |
| [facility] | Perimeter security | [imagery] | [value] |

Vulnerability Assessment:
| Facility | Vulnerability | Evidence | Risk Level |
|----------|---------------|----------|------------|
| [facility] | [exposure] | [how discovered] | [H/M/L] |

□ Facilities mapped: [count]
□ High-risk exposures: [count]
□ Imagery available: [Y/N quality]
```

### 3. Personnel Identification Risk

Assess how easily personnel can be identified:

```
PERSONNEL IDENTIFICATION RISK
=============================

Executive Exposure:
| Name | Role | Photo Available | Bio Available | Contact Info |
|------|------|-----------------|---------------|--------------|
| [name] | [role] | [where/quality] | [source] | [email/phone exposed] |

Photo Exposure by Source:
| Source | Personnel Photos | Quality | Risk |
|--------|------------------|---------|------|
| Company website | [count] | [headshots/casual] | [H/M/L] |
| LinkedIn | [count] | [professional] | [risk] |
| News/press | [count] | [quality] | [risk] |
| Social media | [count] | [personal] | [risk] |
| Conference sites | [count] | [speaking photos] | [risk] |

Identification Ease:
| Person | Difficulty to ID | Reasoning |
|--------|------------------|-----------|
| [name] | [easy/moderate/difficult] | [photos, distinctive features] |

Vehicle Exposure:
| Person | Vehicle Info | Source | Risk |
|--------|--------------|--------|------|
| [name] | [license/make/model] | [social/imagery] | [H/M/L] |

Travel Pattern Exposure:
| Person | Pattern Visible | Source | Risk |
|--------|-----------------|--------|------|
| [name] | [commute/frequent locations] | [social/check-ins] | [risk] |

Family Exposure:
| Executive | Family Info Exposed | Source | Risk |
|-----------|---------------------|--------|------|
| [name] | [spouse/children/school] | [source] | [H/M/L] |

Badge/Access Credential Exposure:
| Source | Credentials Visible | Risk |
|--------|---------------------|------|
| [LinkedIn photos] | [badge design] | [cloning risk] |
| [Social media] | [access cards] | [risk] |

□ Key personnel identifiable: [count]
□ High-exposure individuals: [count]
□ Family exposure concerns: [count]
```

### 4. Surveillance Vulnerability Assessment

Assess surveillance feasibility from OSINT:

```
SURVEILLANCE VULNERABILITY ASSESSMENT
=====================================

Surveillance Position Analysis:
| Facility | Potential Positions | Source | Access Difficulty |
|----------|---------------------|--------|-------------------|
| [facility] | [parking lot/café/etc] | [imagery] | [easy/moderate/hard] |

Counter-Surveillance Indicators:
| Facility | CS Measures Visible | Effectiveness |
|----------|---------------------|---------------|
| [facility] | [guards/cameras/patrols] | [assessment] |

Line of Sight Analysis:
| Facility | Observable From | What's Visible | Risk |
|----------|-----------------|----------------|------|
| [HQ] | [public areas] | [entry/exit/windows] | [H/M/L] |

Pattern of Life Discoverability:
| Subject | Schedule Visible | Source | Risk |
|---------|------------------|--------|------|
| [executive] | [arrivals/departures] | [social/public calendar] | [risk] |

Meeting Location Exposure:
| Type | Discoverable | Source |
|------|--------------|--------|
| Board meetings | [Y/N] | [filings/social] |
| Executive lunches | [Y/N] | [check-ins/reviews] |
| Conferences | [Y/N] | [speaker lists] |

Surveillance Preparation Assessment:
| Element | Easily Researched | Sources |
|---------|-------------------|---------|
| Entry points | [Y/N] | [imagery, reviews] |
| Security timing | [Y/N] | [social posts, reviews] |
| Parking | [Y/N] | [imagery] |
| Transit routes | [Y/N] | [maps, patterns] |

□ Surveillance positions identified: [count]
□ Pattern visibility: [high/medium/low]
□ Counter-surveillance gaps: [count]
```

### 5. Access Control Gap Analysis

Identify access control vulnerabilities from OSINT:

```
ACCESS CONTROL GAP ANALYSIS
===========================

Visitor Access Intelligence:
| Facility | Visitor Process | Source | Intelligence Value |
|----------|-----------------|--------|-------------------|
| [facility] | [description] | [reviews/posts] | [social engineering value] |

Vendor/Contractor Access:
| Facility | Known Vendors | Source | Access Level |
|----------|---------------|--------|--------------|
| [facility] | [vendor names] | [truck photos/uniforms] | [estimated] |

Badge/Credential Information:
| Element | Exposed | Source | Cloning Risk |
|---------|---------|--------|--------------|
| Badge design | [Y/N] | [photos] | [H/M/L] |
| Badge colors | [Y/N] | [photos] | [meaning understood?] |
| Access card type | [Y/N] | [close-ups] | [technical vulnerability] |

Physical Tailgating Opportunities:
| Facility | High-Traffic Times | Source | Risk |
|----------|-------------------|--------|------|
| [facility] | [morning rush/etc] | [patterns observed] | [H/M/L] |

Social Engineering Vectors:
| Vector | Feasibility | Information Available |
|--------|-------------|-----------------------|
| Delivery impersonation | [H/M/L] | [vendor names, uniforms] |
| IT support | [H/M/L] | [IT provider known?] |
| Building maintenance | [H/M/L] | [contractor info] |
| Interview candidate | [H/M/L] | [hiring process public?] |

Guard Force Information:
| Facility | Security Company | Source | Intelligence |
|----------|------------------|--------|--------------|
| [facility] | [company name] | [uniforms/patches] | [procedures known?] |

□ Access control gaps: [count]
□ Social engineering vectors: [count]
□ High-risk vulnerabilities: [count]
```

### 6. Physical Security Summary

Compile physical assessment findings:

```
PHYSICAL SECURITY SUMMARY
=========================

Risk Score by Category:
| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Facility exposure | [H/M/L] | [summary] |
| Personnel ID risk | [H/M/L] | [summary] |
| Surveillance vulnerability | [H/M/L] | [summary] |
| Access control gaps | [H/M/L] | [summary] |
| **OVERALL PHYSICAL** | **[H/M/L]** | **[summary]** |

Critical Physical Vulnerabilities:
| Rank | Vulnerability | Risk | Remediation Priority |
|------|---------------|------|---------------------|
| 1 | [most critical] | [H] | Immediate |
| 2 | [second] | [H/M] | [priority] |
| 3 | [third] | [M] | [priority] |

Adversary Capability Assessment:
| Operation Type | Feasibility | Basis |
|----------------|-------------|-------|
| Physical surveillance | [easy/moderate/difficult] | [findings] |
| Personnel targeting | [feasibility] | [basis] |
| Social engineering | [feasibility] | [basis] |
| Physical intrusion | [feasibility] | [basis] |

Quick Wins (Physical):
| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| [action 1] | [impact] | [low/medium/high] | [P1/P2/P3] |
| [action 2] | [impact] | [effort] | [priority] |

HANDOFF TO SIGIL (Step 2):
- Facilities requiring SIGINT assessment: [list]
- Communication concerns observed: [any visible antennas, etc]
- Network/WiFi visibility: [any observations]
- Personnel for electronic exposure check: [list]
```

---

## STEP 1 OUTPUT

```markdown
## PHYSICAL SECURITY ASSESSMENT SUMMARY

### Scope
- Organization: [name]
- Facilities assessed: [count]
- Personnel in scope: [count]

### Risk Assessment
| Category | Risk Level |
|----------|------------|
| Facility Exposure | [H/M/L] |
| Personnel ID Risk | [H/M/L] |
| Surveillance Vulnerability | [H/M/L] |
| Access Control Gaps | [H/M/L] |
| **OVERALL** | **[H/M/L]** |

### Critical Findings
1. [Most critical physical vulnerability]
2. [Second finding]
3. [Third finding]

### Quick Wins
- [Immediate action 1]
- [Immediate action 2]

### Electronic Assessment Targets for Sigil
- Facilities: [list]
- Network concerns: [observations]
- Personnel: [list for SIGINT review]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] All facilities assessed
- [ ] Personnel exposure evaluated
- [ ] Surveillance vulnerabilities identified
- [ ] Access control gaps documented
- [ ] Risk scores assigned
- [ ] Quick wins identified
- [ ] Targets prepared for Sigil

---

## MENU OPTIONS

**[C] Continue** - Proceed to electronic security assessment (Step 2)
**[F] Facility** - Deeper facility analysis
**[P] Personnel** - Extended personnel exposure
**[S] Surveillance** - Detailed surveillance assessment

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-electronic-security.md`
