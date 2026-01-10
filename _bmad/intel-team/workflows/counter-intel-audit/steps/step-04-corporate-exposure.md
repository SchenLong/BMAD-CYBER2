---
name: 'step-04-corporate-exposure'
description: 'Corporate registry exposure, officer personal data, beneficial ownership visibility, financial filing leakage'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
thisStepFile: '{workflow_path}/steps/step-04-corporate-exposure.md'
nextStepFile: '{workflow_path}/steps/step-05-underground-exposure.md'
prevStepFile: '{workflow_path}/steps/step-03-digital-footprint.md'

# Agent Configuration
executing_agent: corporate-intel-specialist
agent_codename: Proxy
---

# Step 4: Corporate Exposure Assessment

## STEP GOAL

Assess corporate information exposure including registry data, officer personal information, beneficial ownership visibility, subsidiary disclosure gaps, and financial filing information leakage.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Proxy**, Corporate Intelligence Specialist
- You specialize in CORPINT and FININT analysis
- You assess corporate information exposure from public sources
- You identify competitive intelligence vulnerabilities

### Analysis Protocol
- Analyze corporate registry exposure
- Assess officer/director personal data exposure
- Evaluate beneficial ownership visibility
- Document subsidiary and affiliate disclosure
- Review financial filing information leakage

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Corporate Registry Exposure

Assess information available through registries:

```
CORPORATE REGISTRY EXPOSURE
===========================

Entity Visibility:
| Jurisdiction | Entity | Registry | Data Available |
|--------------|--------|----------|----------------|
| [state/country] | [entity name] | [registry] | [registration, address, etc] |

Registration Data Exposed:
| Data Element | Visible | Risk |
|--------------|---------|------|
| Formation date | [Y/N] | [timeline reconstruction] |
| Registered address | [Y/N] | [physical targeting] |
| Agent name/address | [Y/N] | [process service/impersonation] |
| Entity type | [Y/N] | [structure analysis] |
| Status | [Y/N] | [health indicator] |
| Filing history | [Y/N] | [activity patterns] |

Address Intelligence:
| Address Type | Address | Public | Risk |
|--------------|---------|--------|------|
| Registered office | [address] | [Y/N] | [targeting] |
| Principal office | [address] | [Y/N] | [targeting] |
| Mailing address | [address] | [Y/N] | [social engineering] |

Registration Timing:
| Entity | Registration Date | Risk |
|--------|-------------------|------|
| [entity] | [date] | [age reveals planning] |

□ Entities discovered: [count]
□ Address exposure: [count]
□ Filing history visible: [Y/N]
```

### 2. Officer and Director Exposure

Assess personal exposure of officers:

```
OFFICER AND DIRECTOR EXPOSURE
=============================

Officer/Director List (From Filings):
| Name | Title | Entity | Source |
|------|-------|--------|--------|
| [name] | [CEO/Director/etc] | [entity] | [registry/filing] |

Personal Information Exposed:
| Name | Home Address | DOB | Other Personal |
|------|--------------|-----|----------------|
| [name] | [visible?] | [visible?] | [signatures, etc] |

Signature Exposure:
| Name | Signatures Available | Source | Risk |
|------|---------------------|--------|------|
| [name] | [count] | [filings] | [forgery] |

Officer History:
| Name | Historical Roles | Timeline | Risk |
|------|-----------------|----------|------|
| [name] | [prior companies] | [dates] | [pattern analysis] |

Personal Asset Exposure (If Visible):
| Name | Asset Type | Source | Risk |
|------|------------|--------|------|
| [name] | [property/vehicles] | [public records] | [targeting] |

Cross-Directorship Mapping:
| Name | Other Boards | Connection Type |
|------|--------------|-----------------|
| [name] | [companies] | [business/personal] |

□ Officers/directors visible: [count]
□ Personal addresses exposed: [count]
□ Signatures available: [count]
```

### 3. Beneficial Ownership Visibility

Assess ownership structure exposure:

```
BENEFICIAL OWNERSHIP VISIBILITY
===============================

Ownership Structure Visible:
| Level | Owner | Percentage | Source |
|-------|-------|------------|--------|
| Direct | [shareholder] | [%] | [filing/registry] |
| Indirect | [ultimate owner] | [%] | [UBO registry] |

UBO Registry Exposure:
| Jurisdiction | UBO Data Required | Accessible | Details Visible |
|--------------|-------------------|------------|-----------------|
| [jurisdiction] | [Y/N] | [public/restricted] | [what's shown] |

Ownership Gaps:
| Question | Answered | Impact |
|----------|----------|--------|
| Who ultimately owns? | [Y/N] | [transparency] |
| Nominee usage? | [Y/N/Unknown] | [true ownership] |
| Shell company layers? | [count if visible] | [structure complexity] |

Investment Round Visibility:
| Round | Date | Investors Visible | Amount |
|-------|------|-------------------|--------|
| [series] | [date] | [investor names] | [if public] |

Cap Table Exposure:
| Visible | Source | Risk |
|---------|--------|------|
| [full/partial/none] | [filings/news] | [competitive intel] |

Ownership Timeline:
| Date | Event | Disclosure |
|------|-------|------------|
| [date] | [ownership change] | [how public] |

□ Ownership structure visible: [full/partial/none]
□ UBO exposed: [Y/N]
□ Investment history visible: [Y/N]
```

### 4. Subsidiary and Affiliate Disclosure

Assess subsidiary/affiliate exposure:

```
SUBSIDIARY AND AFFILIATE DISCLOSURE
===================================

Known Subsidiaries:
| Subsidiary | Jurisdiction | Ownership % | Source |
|------------|--------------|-------------|--------|
| [name] | [location] | [%] | [filing/registry] |

Subsidiary Discovery Methods:
| Method | Results | Risk |
|--------|---------|------|
| Registry search | [count found] | [structure mapping] |
| SEC filings | [count] | [full list often required] |
| LinkedIn | [count] | [employee mentions] |
| News/press | [count] | [announcements] |
| Domain WHOIS | [count] | [registration patterns] |

Hidden Entity Risk:
| Indicator | Status | Risk |
|-----------|--------|------|
| Undisclosed subsidiaries | [count if found] | [regulatory/reputation] |
| Dormant entities | [count] | [forgotten assets] |
| Foreign entities | [count] | [jurisdictional gaps] |

Joint Ventures/Partnerships:
| Partner | Nature | Public | Risk |
|---------|--------|--------|------|
| [partner] | [JV/partnership] | [Y/N] | [relationship exposure] |

Affiliate Exposure:
| Affiliate Type | Count | Disclosure Level |
|----------------|-------|------------------|
| Franchisees | [count] | [full/partial/none] |
| Distributors | [count] | [level] |
| Partners | [count] | [level] |

□ Subsidiaries discovered: [count]
□ Structure gaps: [count]
□ Hidden entity concerns: [Y/N]
```

### 5. Financial Filing Leakage

Assess financial information exposure:

```
FINANCIAL FILING LEAKAGE
========================

Required Filings:
| Filing Type | Jurisdiction | Public | Information Exposed |
|-------------|--------------|--------|---------------------|
| Annual report | [jurisdiction] | [Y/N] | [what's included] |
| Tax filings | [jurisdiction] | [Y/N] | [information] |
| SEC filings | [if applicable] | [Y/N] | [10-K, etc] |

Financial Data Exposed:
| Data Type | Available | Source | Competitive Value |
|-----------|-----------|--------|-------------------|
| Revenue | [Y/N] | [source] | [H/M/L] |
| Profit/Loss | [Y/N] | [source] | [value] |
| Assets | [Y/N] | [source] | [value] |
| Debt | [Y/N] | [source] | [value] |
| Contracts | [Y/N] | [source] | [value] |
| Customer concentration | [Y/N] | [source] | [value] |

Contract Disclosure:
| Contract Type | Disclosed | Source | Risk |
|---------------|-----------|--------|------|
| Government contracts | [Y/N] | [SAM.gov/etc] | [competitive intel] |
| Major customers | [Y/N] | [filings] | [competitive intel] |
| Supplier contracts | [Y/N] | [filings] | [supply chain] |

Sensitive Financial Details:
| Detail | Exposed | Source | Risk |
|--------|---------|--------|------|
| Bank relationships | [Y/N] | [filings/UCC] | [BEC targeting] |
| Credit facilities | [Y/N] | [filings] | [financial health] |
| Executive compensation | [Y/N] | [proxy] | [MICE analysis] |

Lien/Judgment Exposure:
| Type | Count | Details Public | Risk |
|------|-------|----------------|------|
| UCC filings | [count] | [Y/N] | [asset mapping] |
| Judgments | [count] | [Y/N] | [reputation] |
| Tax liens | [count] | [Y/N] | [financial health] |

□ Financial exposure: [comprehensive/partial/limited]
□ Contract disclosure: [H/M/L]
□ Competitive intelligence value: [H/M/L]
```

### 6. Corporate Exposure Summary

Compile corporate assessment findings:

```
CORPORATE EXPOSURE SUMMARY
==========================

Risk Score by Category:
| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Registry exposure | [H/M/L] | [summary] |
| Officer/director exposure | [H/M/L] | [summary] |
| Beneficial ownership visibility | [H/M/L] | [summary] |
| Subsidiary disclosure | [H/M/L] | [summary] |
| Financial filing leakage | [H/M/L] | [summary] |
| **OVERALL CORPORATE** | **[H/M/L]** | **[summary]** |

Critical Corporate Vulnerabilities:
| Rank | Vulnerability | Risk | Remediation Priority |
|------|---------------|------|---------------------|
| 1 | [most critical] | [H] | Immediate |
| 2 | [second] | [H/M] | [priority] |
| 3 | [third] | [M] | [priority] |

Competitive Intelligence Risk:
| Information Type | Exposed | Competitor Value |
|------------------|---------|------------------|
| [type] | [Y/N] | [H/M/L] |

Executive Protection Concerns:
| Executive | Exposure Type | Risk Level |
|-----------|---------------|------------|
| [name] | [personal data type] | [H/M/L] |

Quick Wins (Corporate):
| Action | Impact | Effort | Priority |
|--------|--------|--------|----------|
| [action 1] | [impact] | [effort] | [P1/P2/P3] |
| [action 2] | [impact] | [effort] | [priority] |

HANDOFF TO SHADOW (Step 5):
- Domains to check for breaches: [list]
- Emails to search: [officer emails found]
- Personnel for credential check: [list]
- Entity names for dark web search: [list]
```

---

## STEP 4 OUTPUT

```markdown
## CORPORATE EXPOSURE ASSESSMENT SUMMARY

### Risk Assessment
| Category | Risk Level |
|----------|------------|
| Registry Exposure | [H/M/L] |
| Officer/Director Exposure | [H/M/L] |
| Beneficial Ownership Visibility | [H/M/L] |
| Subsidiary Disclosure | [H/M/L] |
| Financial Filing Leakage | [H/M/L] |
| **OVERALL** | **[H/M/L]** |

### Critical Findings
1. [Most critical corporate vulnerability]
2. [Second finding]
3. [Third finding]

### Structure Exposure
- Entities discovered: [count]
- Subsidiaries mapped: [count]
- Ownership visible: [full/partial/none]

### Executive Exposure
- Officers/directors visible: [count]
- Personal addresses exposed: [count]
- Signatures available: [count]

### Competitive Intelligence Risk
- Financial data exposed: [H/M/L]
- Contract disclosure: [H/M/L]

### Quick Wins
- [Immediate action 1]
- [Immediate action 2]

### Underground Assessment Targets for Shadow
- Domains: [list]
- Emails: [list]
- Personnel: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 5:
- [ ] Registry exposure assessed
- [ ] Officer/director exposure evaluated
- [ ] Beneficial ownership analyzed
- [ ] Subsidiaries mapped
- [ ] Financial filing leakage reviewed
- [ ] Risk scores assigned
- [ ] Targets prepared for Shadow

---

## MENU OPTIONS

**[C] Continue** - Proceed to underground exposure assessment (Step 5)
**[R] Registry** - Deeper registry analysis
**[O] Officers** - Extended officer investigation
**[F] Financial** - Detailed financial filing review

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-05-underground-exposure.md`
