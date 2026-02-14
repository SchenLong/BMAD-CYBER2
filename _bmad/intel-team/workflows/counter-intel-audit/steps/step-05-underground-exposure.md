---
name: 'step-05-underground-exposure'
description: 'Credential exposure, data breach impact, threat actor interest, targeting indicators'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
thisStepFile: '{workflow_path}/steps/step-05-underground-exposure.md'
nextStepFile: '{workflow_path}/steps/step-06-risk-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-04-corporate-exposure.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 5: Underground Exposure Assessment

## STEP GOAL

Assess the organization's exposure in underground channels including credential breaches, data breach impact, threat actor interest, and targeting indicators.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground source exploitation
- You assess exposure in breach databases and dark web
- You identify threat actor interest in the organization

### Analysis Protocol
- Search breach databases for credential exposure
- Assess impact of known data breaches
- Search for threat actor interest indicators
- Identify targeting in underground forums/markets
- Document access for sale or data listings

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Credential Exposure Assessment

Search for exposed credentials:

```
CREDENTIAL EXPOSURE ASSESSMENT
==============================

Domain Breach Search:
| Domain | Breaches Found | Records | Severity |
|--------|----------------|---------|----------|
| [domain] | [breach list] | [count] | [H/M/L] |

Breach Details:
| Breach | Date | Data Types | Org Records | Status |
|--------|------|------------|-------------|--------|
| [breach name] | [date] | [email/pwd/etc] | [count] | [stale/current] |

Email Exposure by Domain:
| Domain | Emails Exposed | Breaches | Password Exposure |
|--------|----------------|----------|-------------------|
| [domain] | [count] | [count] | [count with passwords] |

High-Risk Individual Exposure:
| Name | Email | Breaches | Password Exposed | Current Employee? |
|------|-------|----------|------------------|-------------------|
| [name] | [email] | [count] | [Y/N] | [Y/N] |

Password Pattern Analysis:
| Pattern | Occurrences | Risk |
|---------|-------------|------|
| [common pattern] | [count] | [password guessing] |
| [company name in pwd] | [count] | [predictability] |

Credential Reuse Risk:
| Assessment | Status |
|------------|--------|
| Same passwords across breaches | [evidence] |
| Patterns suggest current use | [assessment] |
| High-value accounts exposed | [list] |

□ Total emails exposed: [count]
□ Passwords exposed: [count]
□ Executive exposure: [count]
```

### 2. Data Breach Impact Assessment

Assess impact of breaches involving the organization:

```
DATA BREACH IMPACT ASSESSMENT
=============================

Direct Breaches:
| Breach | Date | Data Exposed | Source | Circulation |
|--------|------|--------------|--------|-------------|
| [organization breach] | [date] | [customer/employee/etc] | [how occurred] | [where found] |

Data Types Exposed:
| Data Type | Count | Sensitivity | Circulation Status |
|-----------|-------|-------------|-------------------|
| Customer PII | [count] | [H] | [actively traded/archived] |
| Employee data | [count] | [H] | [status] |
| Financial data | [count] | [H] | [status] |
| Internal documents | [count] | [varies] | [status] |
| Source code | [Y/N] | [H] | [status] |
| Credentials | [count] | [H] | [status] |

Third-Party Breach Exposure:
| Third Party | Breach | Org Data Exposed |
|-------------|--------|------------------|
| [vendor/partner] | [breach name] | [what was exposed] |

Breach Data Availability:
| Location | Data Available | Access Level |
|----------|----------------|--------------|
| Public paste sites | [Y/N] | [free] |
| Breach forums | [Y/N] | [free/paid] |
| Private collections | [Y/N] | [restricted] |

Data Monetization:
| Data Type | Currently For Sale | Price Range |
|-----------|-------------------|-------------|
| [type] | [Y/N] | [price if known] |

□ Direct breaches: [count]
□ Third-party exposure: [count]
□ Data currently circulating: [Y/N]
```

### 3. Threat Actor Interest Assessment

Assess whether threat actors are interested in the organization:

```
THREAT ACTOR INTEREST ASSESSMENT
================================

Forum Mentions:
| Forum | Date | Context | Threat Level |
|-------|------|---------|--------------|
| [forum] | [date] | [how mentioned] | [H/M/L] |

Mention Categories:
| Category | Count | Examples |
|----------|-------|----------|
| Target discussion | [count] | [context] |
| Successful attack claims | [count] | [context] |
| Data for sale | [count] | [context] |
| Vulnerability discussion | [count] | [context] |
| Recruitment (insider) | [count] | [context] |

Access for Sale Search:
| Marketplace | Access Type | Date | Status |
|-------------|-------------|------|--------|
| [market] | [RDP/VPN/email/etc] | [date] | [sold/available] |

Initial Access Broker Activity:
| Broker | Listing | Date | Price | Status |
|--------|---------|------|-------|--------|
| [handle] | [access description] | [date] | [price] | [status] |

Ransomware Group Attention:
| Group | Activity | Date | Evidence |
|-------|----------|------|----------|
| [group] | [listed/attacked/targeting] | [date] | [source] |

Industry Targeting:
| Threat Actor | Targets Industry | Risk to Org |
|--------------|------------------|-------------|
| [actor] | [Y/N] | [H/M/L] |

□ Threat actor mentions: [count]
□ Access for sale found: [Y/N]
□ Ransomware interest: [Y/N]
```

### 4. Targeting Indicators

Identify specific targeting indicators:

```
TARGETING INDICATORS
====================

Active Targeting Evidence:
| Indicator | Date | Source | Severity |
|-----------|------|--------|----------|
| [indicator type] | [date] | [where found] | [H/M/L] |

Phishing Infrastructure:
| Domain | Similarity | Active | Target |
|--------|------------|--------|--------|
| [lookalike domain] | [typosquat/combosquat] | [Y/N] | [brand/exec] |

Credential Harvesting Sites:
| Site | Targeting | Discovered | Status |
|------|-----------|------------|--------|
| [url] | [login page clone] | [date] | [active/down] |

Social Engineering Campaigns:
| Campaign | Target | Method | Evidence |
|----------|--------|--------|----------|
| [campaign] | [employees/customers] | [phishing/vishing] | [samples] |

Reconnaissance Indicators:
| Indicator | Observed | Risk |
|-----------|----------|------|
| Job posting scraping | [evidence] | [employee targeting] |
| LinkedIn harvesting | [evidence] | [spearphishing] |
| Website scanning | [evidence] | [attack prep] |
| DNS enumeration | [evidence] | [infrastructure mapping] |

Malware Targeting:
| Malware | Targeting Org | Evidence |
|---------|---------------|----------|
| [malware family] | [Y/N] | [configuration/strings] |

□ Active targeting: [Y/N]
□ Phishing infrastructure: [count domains]
□ Reconnaissance activity: [Y/N]
```

### 5. Insider Threat Indicators

Assess insider threat activity:

```
INSIDER THREAT INDICATORS
=========================

Insider Recruitment:
| Forum | Type | Targeting Org | Date |
|-------|------|---------------|------|
| [forum] | [recruitment post] | [explicit/industry] | [date] |

Data Theft Offers:
| Location | Offer Type | Org Specific | Status |
|----------|------------|--------------|--------|
| [market/forum] | [data type offered] | [Y/N] | [current/historical] |

Disgruntled Employee Posts:
| Platform | Content | Risk | Date |
|----------|---------|------|------|
| [Glassdoor/forum] | [complaint type] | [insider risk] | [date] |

Access Sale by Likely Insider:
| Evidence | Access Type | Price | Assessment |
|----------|-------------|-------|------------|
| [indicator of insider] | [what access] | [price] | [current/past employee?] |

Credential Type Suggesting Insider:
| Credential | Type | Insider Indicator |
|------------|------|-------------------|
| [account type] | [admin/service account] | [why suggests insider] |

□ Insider recruitment targeting: [Y/N]
□ Possible insider activity: [Y/N]
□ Data theft indicators: [Y/N]
```

### 6. Underground Exposure Summary

Compile underground assessment findings:

```
UNDERGROUND EXPOSURE SUMMARY
============================

Risk Score by Category:
| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Credential exposure | [H/M/L] | [summary] |
| Data breach impact | [H/M/L] | [summary] |
| Threat actor interest | [H/M/L] | [summary] |
| Active targeting | [H/M/L] | [summary] |
| Insider threat indicators | [H/M/L] | [summary] |
| **OVERALL UNDERGROUND** | **[H/M/L]** | **[summary]** |

Critical Underground Vulnerabilities:
| Rank | Vulnerability | Risk | Remediation Priority |
|------|---------------|------|---------------------|
| 1 | [most critical] | [H] | Immediate |
| 2 | [second] | [H/M] | [priority] |
| 3 | [third] | [M] | [priority] |

Immediate Threats:
| Threat | Evidence | Response Required |
|--------|----------|-------------------|
| [threat type] | [evidence] | [action needed] |

Quick Wins (Underground):
| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| [action 1] | [impact] | [effort] | [P1/P2/P3] |
| [action 2] | [impact] | [effort] | [priority] |

HANDOFF TO VECTOR (Step 6):
- All vulnerability categories: [summary counts]
- Critical findings across all steps: [list]
- Quick wins from all steps: [compiled list]
- Immediate actions required: [list]
```

---

## STEP 5 OUTPUT

```markdown
## UNDERGROUND EXPOSURE ASSESSMENT SUMMARY

### Risk Assessment
| Category | Risk Level |
|----------|------------|
| Credential Exposure | [H/M/L] |
| Data Breach Impact | [H/M/L] |
| Threat Actor Interest | [H/M/L] |
| Active Targeting | [H/M/L] |
| Insider Threat Indicators | [H/M/L] |
| **OVERALL** | **[H/M/L]** |

### Critical Findings
1. [Most critical underground vulnerability]
2. [Second finding]
3. [Third finding]

### Credential Exposure
- Total emails exposed: [count]
- Passwords available: [count]
- Executive exposure: [count]

### Threat Activity
- Threat actor mentions: [count]
- Access for sale: [Y/N]
- Active targeting: [Y/N]

### Immediate Threats
- [Threat requiring immediate action]

### Quick Wins
- [Immediate action 1]
- [Immediate action 2]

### Risk Synthesis Data for Vector
- Total vulnerabilities: [count across all steps]
- Critical items: [count]
- Quick wins identified: [count]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 6:
- [ ] Credential exposure assessed
- [ ] Data breach impact evaluated
- [ ] Threat actor interest analyzed
- [ ] Targeting indicators identified
- [ ] Insider threat assessed
- [ ] Risk scores assigned
- [ ] Data compiled for Vector

---

## MENU OPTIONS

**[C] Continue** - Proceed to risk synthesis (Step 6)
**[B] Breaches** - Deeper breach analysis
**[T] Threats** - Extended threat actor search
**[A] Access** - Access for sale investigation

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-06-risk-synthesis.md`
