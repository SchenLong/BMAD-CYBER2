---
name: 'step-03-digital-footprint'
description: 'Corporate social presence, employee exposure, information leakage, reputation vulnerabilities'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
thisStepFile: '{workflow_path}/steps/step-03-digital-footprint.md'
nextStepFile: '{workflow_path}/steps/step-04-corporate-exposure.md'
prevStepFile: '{workflow_path}/steps/step-02-electronic-security.md'

# Agent Configuration
executing_agent: social-media-analyst
agent_codename: Echo
---

# Step 3: Digital Footprint Assessment

## STEP GOAL

Assess the organization's digital footprint including corporate social presence, employee exposure, information leakage through social channels, and reputation vulnerabilities.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Echo**, Social Media Analyst
- You specialize in SOCMINT and social media forensics
- You assess information exposure through social channels
- You identify social engineering attack surface

### Analysis Protocol

- Map corporate social media presence
- Assess employee exposure on professional networks
- Identify information leakage through social content
- Document reputation vulnerabilities
- Consider social engineering feasibility

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Corporate Social Presence

Map official corporate social accounts:

```
CORPORATE SOCIAL PRESENCE
=========================

Official Accounts:
| Platform | Account | Followers | Verification | Activity |
|----------|---------|-----------|--------------|----------|
| LinkedIn | [company page] | [count] | [verified?] | [active/inactive] |
| Twitter/X | [@handle] | [count] | [verified?] | [activity] |
| Facebook | [page] | [count] | [verified?] | [activity] |
| Instagram | [@handle] | [count] | [verified?] | [activity] |
| YouTube | [channel] | [count] | [verified?] | [activity] |
| TikTok | [@handle] | [count] | [verified?] | [activity] |

Content Analysis:
| Platform | Content Type | Information Revealed | Risk |
|----------|--------------|---------------------|------|
| [platform] | [photos/posts/videos] | [what can be learned] | [H/M/L] |

Social Media Security:
| Platform | Security Issue | Risk |
|----------|----------------|------|
| [platform] | [tagging employees] | [phishing targeting] |
| [platform] | [facility photos] | [physical security] |
| [platform] | [event announcements] | [executive schedules] |

Impersonation Risk:
| Platform | Official Accounts | Fake/Parody Found | Action Needed |
|----------|-------------------|-------------------|---------------|
| [platform] | [count] | [count] | [takedown?] |

□ Corporate accounts: [count]
□ Unverified accounts: [count]
□ Impersonation concerns: [count]
```

### 2. Employee Exposure Assessment

Assess employee visibility:

```
EMPLOYEE EXPOSURE ASSESSMENT
============================

LinkedIn Exposure:
| Metric | Count | Risk Assessment |
|--------|-------|-----------------|
| Total employees visible | [count] | [enumeration risk] |
| C-suite profiles | [count] | [targeting data] |
| IT/Security staff | [count] | [technical targeting] |
| Finance staff | [count] | [BEC targeting] |
| HR staff | [count] | [social engineering] |

Profile Detail Analysis:
| Information Type | Commonly Shared | Risk |
|------------------|-----------------|------|
| Job responsibilities | [Y/N] | [role-based attacks] |
| Projects/clients | [Y/N] | [competitive intel] |
| Technologies used | [Y/N] | [attack vectors] |
| Team structure | [Y/N] | [org chart building] |
| Travel/conferences | [Y/N] | [scheduling intel] |

High-Risk Employee Profiles:
| Name | Role | Exposure Level | Primary Risk |
|------|------|----------------|--------------|
| [name] | [role] | [H/M/L] | [specific concern] |

Employee Social Media (Personal):
| Platform | Employees Found | Work Mentioned | Risk |
|----------|-----------------|----------------|------|
| Twitter/X | [count] | [Y/N frequency] | [H/M/L] |
| Instagram | [count] | [work photos?] | [risk] |
| Facebook | [count] | [work visible?] | [risk] |

Photo Exposure:
| Type | Count | Risk |
|------|-------|------|
| Badge photos | [count] | [cloning] |
| Office photos | [count] | [layout/security] |
| Screen captures | [count] | [data leakage] |
| Event photos | [count] | [identification] |

□ Employee profiles visible: [count]
□ High-exposure individuals: [count]
□ Personal account concerns: [count]
```

### 3. Information Leakage Assessment

Identify information leaked through social:

```
INFORMATION LEAKAGE ASSESSMENT
==============================

Technical Information Leaked:
| Information Type | Source | Risk |
|------------------|--------|------|
| Technology stack | [job posts/profiles] | [targeting] |
| Vendor relationships | [posts/tags] | [supply chain] |
| Project details | [employee posts] | [competitive intel] |
| Security tools | [job posts] | [evasion] |
| Cloud providers | [visible in photos] | [targeting] |

Organizational Information:
| Information Type | Source | Risk |
|------------------|--------|------|
| Org structure | [LinkedIn connections] | [social engineering] |
| Reporting relationships | [profiles] | [impersonation] |
| Decision makers | [posts/articles] | [targeting] |
| Hiring plans | [job posts] | [competitive intel] |

Operational Information:
| Information Type | Source | Risk |
|------------------|--------|------|
| Project timelines | [posts/announcements] | [competitive intel] |
| M&A activity | [connections/posts] | [insider trading] |
| Financial performance | [employee sentiment] | [investment intel] |
| Problems/challenges | [Glassdoor/posts] | [exploitation] |

Physical Security Information:
| Information Type | Source | Risk |
|------------------|--------|------|
| Office layout | [photos] | [physical access] |
| Security measures | [photos] | [bypass planning] |
| Access procedures | [posts/reviews] | [social engineering] |
| Shift patterns | [post timing] | [surveillance] |

Document Leakage:
| Document Type | Platform | Risk |
|---------------|----------|------|
| Presentations | [SlideShare/LinkedIn] | [internal data] |
| Spreadsheets | [visible in photos] | [data exposure] |
| Internal emails | [screenshots] | [process info] |

□ Technical leakage incidents: [count]
□ Operational leakage: [count]
□ Physical security leakage: [count]
```

### 4. Social Engineering Surface

Assess social engineering attack surface:

```
SOCIAL ENGINEERING SURFACE
==========================

Pretexting Information Available:
| Pretext Type | Information Available | Source |
|--------------|----------------------|--------|
| IT support | [software used, IT contact] | [job posts, profiles] |
| Vendor | [vendor names] | [posts, tags] |
| Executive assistant | [assistant names] | [profiles] |
| HR | [HR processes, contacts] | [job posts] |
| Finance | [finance contacts, systems] | [profiles] |

Phishing Customization Data:
| Data Type | Available | Source |
|-----------|-----------|--------|
| Email format | [Y/N format] | [LinkedIn] |
| Internal terminology | [Y/N] | [posts/docs] |
| Project names | [Y/N] | [profiles] |
| Client names | [Y/N] | [posts] |
| Internal systems | [Y/N] | [job posts] |

High-Value Social Engineering Targets:
| Name | Role | Attack Vector | Why Valuable |
|------|------|---------------|--------------|
| [name] | [role] | [approach method] | [access/info] |

Trust Relationship Mapping:
| Relationship | Exploitable | Method |
|--------------|-------------|--------|
| Vendor relationships | [Y/N] | [vendor impersonation] |
| Partner relationships | [Y/N] | [partner impersonation] |
| Customer relationships | [Y/N] | [customer impersonation] |

BEC Vulnerability Assessment:
| Factor | Status | Risk |
|--------|--------|------|
| Executive email format known | [Y/N] | [impersonation] |
| Finance team identified | [Y/N] | [payment fraud] |
| Wire procedures public | [Y/N] | [process exploitation] |
| Executive travel visible | [Y/N] | [timing attacks] |

□ Social engineering vectors: [count]
□ BEC vulnerability: [H/M/L]
□ High-value targets identified: [count]
```

### 5. Reputation Vulnerabilities

Assess reputation risks:

```
REPUTATION VULNERABILITIES
==========================

Sentiment Analysis:
| Platform | Overall Sentiment | Issues Found |
|----------|-------------------|--------------|
| Glassdoor | [positive/mixed/negative] | [themes] |
| Indeed | [sentiment] | [issues] |
| Twitter | [sentiment] | [complaints] |
| LinkedIn | [sentiment] | [concerns] |

Negative Content:
| Platform | Content Type | Severity | Visibility |
|----------|--------------|----------|------------|
| [platform] | [complaint/expose/criticism] | [H/M/L] | [reach] |

Crisis Vulnerabilities:
| Vulnerability | Current Exposure | Potential Impact |
|---------------|------------------|------------------|
| [labor issues] | [Glassdoor visibility] | [reputation damage] |
| [product issues] | [social complaints] | [customer trust] |
| [executive issues] | [personal exposure] | [leadership trust] |

Competitor Intelligence Risk:
| Information Type | Exposed | Competitor Value |
|------------------|---------|------------------|
| Pricing | [Y/N] | [undercutting] |
| Strategy | [Y/N] | [counter-strategy] |
| Clients | [Y/N] | [poaching] |
| Talent | [Y/N] | [recruiting] |

Brand Monitoring Gaps:
| Gap | Current Status | Risk |
|-----|----------------|------|
| Impersonation detection | [monitored/not] | [fraud] |
| Mention monitoring | [status] | [crisis response] |
| Fake review detection | [status] | [reputation] |

□ Reputation risks: [count]
□ Negative content pieces: [count]
□ Monitoring gaps: [count]
```

### 6. Digital Footprint Summary

Compile social exposure findings:

```
DIGITAL FOOTPRINT SUMMARY
=========================

Risk Score by Category:
| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Corporate presence | [H/M/L] | [summary] |
| Employee exposure | [H/M/L] | [summary] |
| Information leakage | [H/M/L] | [summary] |
| Social engineering surface | [H/M/L] | [summary] |
| Reputation vulnerabilities | [H/M/L] | [summary] |
| **OVERALL DIGITAL** | **[H/M/L]** | **[summary]** |

Critical Digital Vulnerabilities:
| Rank | Vulnerability | Risk | Remediation Priority |
|------|---------------|------|---------------------|
| 1 | [most critical] | [H] | Immediate |
| 2 | [second] | [H/M] | [priority] |
| 3 | [third] | [M] | [priority] |

Social Engineering Risk Assessment:
| Attack Type | Feasibility | Primary Targets |
|-------------|-------------|-----------------|
| Phishing | [H/M/L] | [who/why] |
| BEC | [H/M/L] | [who/why] |
| Vishing | [H/M/L] | [who/why] |
| Physical pretext | [H/M/L] | [who/why] |

Quick Wins (Digital):
| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| [action 1] | [impact] | [effort] | [P1/P2/P3] |
| [action 2] | [impact] | [effort] | [priority] |

HANDOFF TO PROXY (Step 4):
- Corporate entities to assess: [list]
- Officers/directors to check: [from LinkedIn/posts]
- Subsidiaries mentioned: [in posts/profiles]
- Financial concerns: [from sentiment analysis]
```

---

## STEP 3 OUTPUT

```markdown
## DIGITAL FOOTPRINT ASSESSMENT SUMMARY

### Risk Assessment
| Category | Risk Level |
|----------|------------|
| Corporate Presence | [H/M/L] |
| Employee Exposure | [H/M/L] |
| Information Leakage | [H/M/L] |
| Social Engineering Surface | [H/M/L] |
| Reputation Vulnerabilities | [H/M/L] |
| **OVERALL** | **[H/M/L]** |

### Critical Findings
1. [Most critical digital vulnerability]
2. [Second finding]
3. [Third finding]

### Employee Exposure
- Visible on LinkedIn: [count]
- High-exposure individuals: [count]
- Personal account concerns: [count]

### Social Engineering Risk
- BEC vulnerability: [H/M/L]
- Phishing feasibility: [H/M/L]
- Primary targets: [list]

### Quick Wins
- [Immediate action 1]
- [Immediate action 2]

### Corporate Assessment Targets for Proxy
- Entities: [list]
- Officers: [list]
- Subsidiaries: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] Corporate presence mapped
- [ ] Employee exposure assessed
- [ ] Information leakage identified
- [ ] Social engineering surface evaluated
- [ ] Reputation risks documented
- [ ] Risk scores assigned
- [ ] Targets prepared for Proxy

---

## MENU OPTIONS

**[C] Continue** - Proceed to corporate exposure assessment (Step 4)
**[E] Employee** - Deeper employee exposure analysis
**[L] Leakage** - Extended information leakage search
**[R] Reputation** - Detailed reputation assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-corporate-exposure.md`
