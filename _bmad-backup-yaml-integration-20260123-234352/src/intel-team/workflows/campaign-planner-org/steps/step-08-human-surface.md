---
name: 'step-08-human-surface'
description: 'Key personnel vulnerabilities, social engineering vectors, insider indicators'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-08-human-surface.md'
nextStepFile: '{workflow_path}/steps/step-09-assembly.md'
prevStepFile: '{workflow_path}/steps/step-07-threats.md'

# Agent Configuration
executing_agent: humint-specialist
agent_codename: Viper
---

# Phase 8: Human Attack Surface

## STEP GOAL

Analyze the organization's human attack surface including key personnel vulnerabilities, social engineering vectors, insider threat indicators, and physical access opportunities. This intelligence informs both offensive capability assessment and defensive recommendations.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Viper**, HUMINT Specialist
- You specialize in human intelligence and social engineering analysis
- You assess psychological and social vulnerabilities
- You identify manipulation vectors and insider threats

### Assessment Protocol
- Analyze key personnel for MICE vulnerabilities
- Identify social engineering attack vectors
- Assess insider threat indicators
- Evaluate physical security and access
- Map relationship networks for exploitation

### Ethical Note
This analysis is for authorized security assessment purposes. Findings should inform defensive improvements and security awareness programs.

---

## ASSESSMENT EXECUTION SEQUENCE

### 1. Key Personnel Vulnerability Assessment

Analyze high-value targets using MICE framework:

```
KEY PERSONNEL VULNERABILITY ASSESSMENT
======================================

HIGH-VALUE TARGETS:
(From Phase 5 personnel identification)

TARGET 1: [Executive Name]
Role: [CEO/CFO/CISO/etc]
Access Level: [What they have access to]

MICE Analysis:
| Factor | Indicators | Risk Level | Evidence |
|--------|------------|------------|----------|
| Money | [financial indicators] | [H/M/L] | [source] |
| Ideology | [beliefs, causes, grievances] | [H/M/L] | [source] |
| Coercion | [vulnerabilities, secrets] | [H/M/L] | [source] |
| Ego | [recognition needs, vanity] | [H/M/L] | [source] |

Public Footprint:
□ Social media activity: [Active/Moderate/Low]
□ Personal information exposed: [list]
□ Interests/hobbies visible: [list]
□ Family information visible: [Y/N, extent]
□ Travel patterns visible: [Y/N]
□ Breach exposure: [Y/N, what data]

Approach Vectors:
- [Vector 1: description]
- [Vector 2: description]

Overall Risk Rating: [Critical/High/Medium/Low]

TARGET 2: [Name]
[Repeat structure]

TARGET 3: [Name]
[Repeat structure]

KEY PERSONNEL SUMMARY:
| Name | Role | Risk Rating | Primary Vector |
|------|------|-------------|----------------|
| [name] | [role] | [rating] | [vector] |
```

### 2. Social Engineering Vector Analysis

Identify organizational social engineering vulnerabilities:

```
SOCIAL ENGINEERING VECTOR ANALYSIS
==================================

Phishing Susceptibility:
| Factor | Assessment | Evidence |
|--------|------------|----------|
| Email format predictable | [Y/N] | [format: first.last@] |
| Executive emails exposed | [count] | [breach data] |
| Email security (DMARC) | [policy] | [from Phase 2] |
| Security awareness program | [Unknown/Basic/Advanced] | [indicators] |

Pretext Development Opportunities:
| Pretext Type | Feasibility | Target Role | Notes |
|--------------|-------------|-------------|-------|
| IT Support | [High/Med/Low] | [all staff] | [technical complexity] |
| Vendor/Supplier | [High/Med/Low] | [finance, procurement] | [known suppliers] |
| Executive Impersonation | [High/Med/Low] | [assistants, finance] | [exec visibility] |
| Recruitment | [High/Med/Low] | [tech staff] | [hiring activity] |
| Customer/Partner | [High/Med/Low] | [sales, support] | [customer visibility] |

Vishing Opportunities:
□ Phone numbers exposed: [Y/N, how many]
□ Direct executive lines: [Y/N]
□ Reception gatekeeping: [Unknown/Weak/Strong]
□ Voicemail systems: [exploitable?]

Smishing Opportunities:
□ Mobile numbers exposed: [count]
□ Executive mobile exposed: [Y/N]
□ SMS 2FA used: [Y/N]

Physical Social Engineering:
□ Facility access policies: [Unknown/Weak/Strong]
□ Employee badge visible: [Y/N]
□ Tailgating feasibility: [assessment]
□ Delivery pretext viable: [Y/N]

SOCIAL ENGINEERING SUMMARY:
- Highest feasibility vector: [vector]
- Most vulnerable target type: [role]
- Attack complexity: [Low/Medium/High]
- Success likelihood: [assessment]
```

### 3. Insider Threat Assessment

Evaluate indicators of insider threat risk:

```
INSIDER THREAT ASSESSMENT
=========================

Organizational Risk Factors:
| Factor | Assessment | Evidence |
|--------|------------|----------|
| Layoffs/restructuring | [Recent/Planned/None] | [news/job postings] |
| Employee satisfaction | [High/Medium/Low] | [Glassdoor] |
| Turnover rate | [High/Medium/Low] | [observations] |
| Cultural issues | [Y/N] | [reviews, news] |

High-Risk Roles:
| Role Category | Count | Access Level | Risk Factors |
|---------------|-------|--------------|--------------|
| System Administrators | [est.] | Critical | Privileged access |
| Database Admins | [est.] | Critical | Data access |
| Finance/Accounting | [est.] | High | Financial systems |
| HR | [est.] | High | Personnel data |
| Developers | [est.] | Medium-High | Code/systems |
| Security Team | [est.] | Critical | Security controls |

Red Flag Indicators (from OSINT):
| Indicator | Observed | Source |
|-----------|----------|--------|
| Disgruntled employee posts | [Y/N] | [platform] |
| Departing key personnel | [Y/N] | [LinkedIn] |
| Legal disputes with employees | [Y/N] | [court records] |
| Breach exposure of employee data | [Y/N] | [Phase 6] |

Underground Insider Activity:
| Finding | Platform | Risk Level |
|---------|----------|------------|
| Access for sale claims | [Y/N] | [if found] |
| Insider recruitment posts | [Y/N] | [if found] |
| Employee mentions | [Y/N] | [context] |

INSIDER THREAT SUMMARY:
- Overall insider risk: [High/Medium/Low]
- Highest risk role: [role]
- Key concerns: [list]
- Monitoring recommendations: [list]
```

### 4. Physical Security Assessment

Evaluate physical access vulnerabilities (from OSINT):

```
PHYSICAL SECURITY ASSESSMENT
============================

Facility Information:
| Location | Type | Employee Count | Security Visible |
|----------|------|----------------|------------------|
| [HQ address] | HQ | [count] | [observations] |
| [office] | Office | [count] | [observations] |
| [DC] | Data Center | [count] | [observations] |

OSINT Physical Indicators:
□ Building photos (Street View, social): [observations]
□ Badge/access visible in photos: [Y/N]
□ Security measures visible: [list]
□ Delivery/loading areas: [visible/not visible]
□ Visitor policies mentioned: [if found]

Physical Social Engineering Opportunities:
| Vector | Feasibility | Notes |
|--------|-------------|-------|
| Visitor pretext | [H/M/L] | [observations] |
| Delivery pretext | [H/M/L] | [observations] |
| Tailgating | [H/M/L] | [observations] |
| USB drop | [H/M/L] | [parking/common areas] |
| Impersonation | [H/M/L] | [uniform requirements] |

Event/Conference Exposure:
| Event | Date | Executives Attending | Opportunity |
|-------|------|---------------------|-------------|
| [conference] | [date] | [names] | [networking/intel] |

PHYSICAL SECURITY SUMMARY:
- Physical security maturity: [Unknown/Basic/Moderate/Advanced]
- Highest risk location: [location]
- Best physical vector: [vector]
- Opportunities identified: [list]
```

### 5. Relationship Mapping for Exploitation

Map exploitable relationships:

```
RELATIONSHIP MAPPING
====================

Key External Relationships:
| Relationship Type | Entity | Contact Visibility | Exploitation Potential |
|-------------------|--------|-------------------|----------------------|
| Investor | [name] | [contact known] | [pretext opportunities] |
| Board member | [name] | [contact known] | [pretext opportunities] |
| Key supplier | [name] | [contact known] | [supply chain pretext] |
| Partner | [name] | [contact known] | [pretext opportunities] |
| Customer | [name] | [contact known] | [pretext opportunities] |

Executive Assistants:
| Executive | Assistant Name | LinkedIn | Email Pattern |
|-----------|---------------|----------|---------------|
| [CEO] | [if found] | [Y/N] | [if known] |
| [CFO] | [if found] | [Y/N] | [if known] |

Professional Network Connections:
□ Conference speaking: [executives who speak]
□ Industry associations: [memberships visible]
□ Advisory roles: [board positions elsewhere]
□ Alumni networks: [schools, former employers]

Personal Interest Groups:
| Executive | Interests | Groups/Affiliations | Approach Vector |
|-----------|-----------|---------------------|-----------------|
| [name] | [hobbies] | [clubs, groups] | [shared interest approach] |

RELATIONSHIP EXPLOITATION SUMMARY:
- Highest value relationship: [relationship]
- Easiest exploitation path: [path]
- Pretext recommendations: [list]
```

### 6. Human Attack Surface Summary

Compile human attack surface findings:

```
HUMAN ATTACK SURFACE SUMMARY
============================

Personnel Risk Assessment:
| Category | Risk Level | Key Concerns |
|----------|------------|--------------|
| Executive exposure | [H/M/L] | [concerns] |
| Social engineering susceptibility | [H/M/L] | [concerns] |
| Insider threat | [H/M/L] | [concerns] |
| Physical access | [H/M/L] | [concerns] |

Priority Human Targets:
| Rank | Name | Role | Risk Rating | Primary Vector |
|------|------|------|-------------|----------------|
| 1 | [name] | [role] | [rating] | [vector] |
| 2 | [name] | [role] | [rating] | [vector] |
| 3 | [name] | [role] | [rating] | [vector] |

Attack Vector Prioritization:
| Rank | Vector | Target | Complexity | Success Likelihood |
|------|--------|--------|------------|-------------------|
| 1 | [vector] | [target] | [Low/Med/High] | [assessment] |
| 2 | [vector] | [target] | [Low/Med/High] | [assessment] |
| 3 | [vector] | [target] | [Low/Med/High] | [assessment] |

PIR Contribution:
| PIR | Human Surface Contribution | Status |
|-----|--------------------------|--------|
| PIR-1 | [contribution] | [status] |
| PIR-2 | [contribution] | [status] |
| PIR-3 | [contribution] | [status] |
| PIR-4 | [contribution] | [status] |

Defensive Recommendations:
1. [Recommendation for improving security]
2. [Recommendation for improving security]
3. [Recommendation for improving security]

Handoff to Vector (Phase 9):
- Campaign plan components ready
- All phases complete
- PIR satisfaction status: [summary]
```

---

## PHASE 8 OUTPUT

```markdown
## HUMAN ATTACK SURFACE SUMMARY

### Personnel Vulnerability
- High-value targets identified: [count]
- Critical risk personnel: [count]
- MICE vulnerabilities found: [Y/N]

### Social Engineering
- Highest feasibility vector: [vector]
- Target susceptibility: [High/Medium/Low]
- Pretext opportunities: [count]

### Insider Threat
- Overall risk: [High/Medium/Low]
- Risk factors present: [count]
- Monitoring needed: [Y/N]

### Physical Security
- Vulnerability level: [High/Medium/Low]
- Physical vectors identified: [count]
- Key concerns: [list]

### Top 3 Attack Vectors
1. [Vector with target]
2. [Vector with target]
3. [Vector with target]

### Defensive Recommendations
1. [Top recommendation]
2. [Second recommendation]
3. [Third recommendation]

### Ready for Campaign Assembly
All phases complete. Proceed to final campaign plan assembly.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 9:
- [ ] Key personnel analyzed
- [ ] Social engineering vectors identified
- [ ] Insider threat assessed
- [ ] Physical security evaluated
- [ ] Relationships mapped
- [ ] Attack vectors prioritized
- [ ] Defensive recommendations developed

---

## MENU OPTIONS

**[C] Continue** - Proceed to campaign assembly (Phase 9)
**[P] Personnel** - Deeper personnel analysis
**[V] Vector** - Detailed attack vector planning
**[I] Insider** - Extended insider threat assessment

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-09-assembly.md`
