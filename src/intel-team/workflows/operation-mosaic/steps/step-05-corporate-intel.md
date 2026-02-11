---
name: 'step-05-corporate-intel'
description: 'Entity verification, corporate structure, beneficial ownership, financial filings'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-05-corporate-intel.md'
nextStepFile: '{workflow_path}/steps/step-06-geospatial.md'
prevStepFile: '{workflow_path}/steps/step-04-dark-web-exposure.md'

# Agent Configuration
executing_agent: corporate-intel-specialist
agent_codename: Proxy
---

# Step 5: Corporate Intelligence (Phase 2d)

## STEP GOAL

Conduct comprehensive corporate intelligence collection including entity verification, corporate structure mapping, beneficial ownership identification, officer/director research, financial analysis, and regulatory status assessment.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Proxy**, Corporate Intelligence Specialist
- You specialize in CORPINT and FININT
- You verify entities and map corporate structures
- You identify beneficial ownership and financial relationships

### Collection Protocol

- Verify entity existence and status
- Map corporate structure (parents, subsidiaries, affiliates)
- Identify officers, directors, and key personnel
- Determine beneficial ownership where possible
- Review financial filings and status
- Assess regulatory compliance and issues
- Document all findings for correlation

---

## COLLECTION EXECUTION SEQUENCE

### 1. Entity Verification

Verify corporate existence and status:

```
ENTITY VERIFICATION
===================

Target Entity Information:
- Legal name: [from available sources]
- Trading name(s): [DBA/brands]
- Jurisdiction: [country/state]
- Entity type: [corp/LLC/etc]

Registry Search Results:
| Registry | Entity Found | Registration # | Status |
|----------|--------------|----------------|--------|
| [jurisdiction registry] | [Y/N] | [number] | [active/dissolved] |
| [state/national registry] | [Y/N] | [number] | [status] |
| [international registry] | [Y/N] | [number] | [status] |

Entity Details:
| Field | Value | Source |
|-------|-------|--------|
| Legal name | [name] | [registry] |
| Registration date | [date] | [registry] |
| Registration number | [number] | [registry] |
| Registered address | [address] | [registry] |
| Entity type | [type] | [registry] |
| Status | [active/etc] | [registry] |
| Jurisdiction | [jurisdiction] | [registry] |

Name Variations Found:
| Variation | Context | Relationship |
|-----------|---------|--------------|
| [name variant] | [where found] | [DBA/former name/etc] |

□ Entity verified: [Y/N]
□ Registration confirmed: [Y/N]
□ Status confirmed: [active/inactive/dissolved]
```

### 2. Corporate Structure Mapping

Map organizational hierarchy:

```
CORPORATE STRUCTURE MAPPING
===========================

Parent Company:
| Entity | Jurisdiction | Ownership % | Verified |
|--------|--------------|-------------|----------|
| [parent] | [jurisdiction] | [%] | [Y/N] |

Ultimate Parent (UBO Entity):
| Entity | Jurisdiction | Type | Notes |
|--------|--------------|------|-------|
| [ultimate parent] | [jurisdiction] | [public/private] | [details] |

Subsidiary Companies:
| Subsidiary | Jurisdiction | Ownership % | Status | Purpose |
|------------|--------------|-------------|--------|---------|
| [sub 1] | [jurisdiction] | [%] | [active] | [function] |
| [sub 2] | [jurisdiction] | [%] | [status] | [function] |

Affiliated Entities:
| Entity | Relationship | Jurisdiction | Notes |
|--------|--------------|--------------|-------|
| [affiliate] | [JV/partnership/etc] | [jurisdiction] | [details] |

Branch Offices:
| Location | Address | Registration | Status |
|----------|---------|--------------|--------|
| [location] | [address] | [local reg] | [status] |

Corporate Structure Diagram:
```

[Ultimate Parent]
       |
   [Parent]
       |
   [TARGET]
    /     \
[Sub 1] [Sub 2]

```

□ Structure mapped: [complete/partial]
□ Subsidiaries identified: [count]
□ Affiliates identified: [count]
```

### 3. Officers & Directors

Identify key personnel:

```
OFFICERS & DIRECTORS
====================

Current Officers:
| Name | Title | Appointed | Other Roles |
|------|-------|-----------|-------------|
| [name] | [CEO/CFO/etc] | [date] | [other companies] |
| [name] | [title] | [date] | [other roles] |

Current Directors:
| Name | Role | Appointed | Independence | Other Boards |
|------|------|-----------|--------------|--------------|
| [name] | [Chair/Director] | [date] | [Y/N] | [companies] |
| [name] | [role] | [date] | [status] | [boards] |

Historical Officers/Directors:
| Name | Title | Period | Departure Reason |
|------|-------|--------|------------------|
| [name] | [title] | [dates] | [if known] |

Key Personnel Network:
| Person | Companies Associated | Relationship |
|--------|---------------------|--------------|
| [name] | [company list] | [common director/etc] |

Personnel Red Flags:
| Person | Issue | Details |
|--------|-------|---------|
| [name] | [disqualification/litigation/etc] | [details] |

□ Officers identified: [count]
□ Directors identified: [count]
□ Historical personnel tracked: [count]
```

### 4. Beneficial Ownership

Identify ultimate beneficial owners:

```
BENEFICIAL OWNERSHIP
====================

Declared Shareholders (if available):
| Shareholder | Ownership % | Type | Verified |
|-------------|-------------|------|----------|
| [name/entity] | [%] | [individual/corp] | [Y/N] |

Beneficial Ownership Registry (where available):
| Jurisdiction | Registry | UBO Declared | Details |
|--------------|----------|--------------|---------|
| [jurisdiction] | [registry name] | [Y/N] | [findings] |

Identified Beneficial Owners:
| Name | Ownership Path | Final % | Confidence |
|------|----------------|---------|------------|
| [name] | [entity chain] | [%] | [H/M/L] |

Ownership Structure:
| Level | Entity | Owner | % |
|-------|--------|-------|---|
| 1 | [target] | [parent/individual] | [%] |
| 2 | [parent] | [grandparent/individual] | [%] |
| 3 | [grandparent] | [UBO] | [%] |

Nominee/Privacy Structures:
| Entity | Nominee Service | Jurisdiction | Notes |
|--------|-----------------|--------------|-------|
| [entity] | [service provider] | [jurisdiction] | [assessment] |

□ UBOs identified: [count/unknown]
□ Nominee structures detected: [Y/N]
□ Ownership verified: [complete/partial/opaque]
```

### 5. Financial Analysis

Review financial status and filings:

```
FINANCIAL ANALYSIS
==================

Public Filings (if public company):
| Filing Type | Date | Key Findings |
|-------------|------|--------------|
| [Annual report] | [date] | [summary] |
| [Quarterly] | [date] | [summary] |

Financial Summary:
| Metric | Value | Period | Source |
|--------|-------|--------|--------|
| Revenue | [amount] | [period] | [source] |
| Profit/Loss | [amount] | [period] | [source] |
| Assets | [amount] | [period] | [source] |
| Liabilities | [amount] | [period] | [source] |
| Employees | [count] | [period] | [source] |

Credit/Rating Information:
| Source | Rating/Score | Date | Notes |
|--------|--------------|------|-------|
| [D&B/Experian/etc] | [rating] | [date] | [details] |

Funding History:
| Round | Date | Amount | Investors |
|-------|------|--------|-----------|
| [Series X] | [date] | [amount] | [investors] |

Liens/Judgments/Bankruptcies:
| Type | Date | Amount | Status |
|------|------|--------|--------|
| [type] | [date] | [amount] | [status] |

Financial Red Flags:
| Issue | Details | Severity |
|-------|---------|----------|
| [issue] | [details] | [H/M/L] |

□ Financial status assessed: [Y/N]
□ Public filings reviewed: [Y/N/N/A]
□ Red flags identified: [count]
```

### 6. Regulatory & Legal Status

Assess compliance and legal issues:

```
REGULATORY & LEGAL STATUS
=========================

Licenses & Registrations:
| License Type | Issuing Authority | Number | Status |
|--------------|-------------------|--------|--------|
| [type] | [authority] | [number] | [active/expired] |

Industry Regulatory Status:
| Regulator | Status | Notes |
|-----------|--------|-------|
| [regulator] | [good standing/etc] | [details] |

Legal Actions:
| Case Type | Jurisdiction | Status | Summary |
|-----------|--------------|--------|---------|
| [civil/criminal/regulatory] | [jurisdiction] | [status] | [summary] |

Sanctions/Watchlist Screening:
| List | Screened | Result |
|------|----------|--------|
| OFAC SDN | [Y/N] | [match/no match] |
| EU Sanctions | [Y/N] | [result] |
| UN Sanctions | [Y/N] | [result] |
| PEP Lists | [Y/N] | [result] |

Regulatory Enforcement:
| Authority | Date | Action | Outcome |
|-----------|------|--------|---------|
| [authority] | [date] | [action type] | [fine/warning/etc] |

□ Regulatory status verified: [Y/N]
□ Legal issues identified: [count]
□ Sanctions screening complete: [Y/N]
```

### 7. Corporate Intelligence Summary

Compile CORPINT findings:

```
CORPORATE INTELLIGENCE SUMMARY
==============================

Entity Overview:
| Attribute | Value |
|-----------|-------|
| Legal name | [name] |
| Status | [active/etc] |
| Jurisdiction | [jurisdiction] |
| Entity type | [type] |
| Employees | [count] |
| Revenue | [if known] |

Structure Summary:
- Ultimate parent: [entity]
- Subsidiaries: [count]
- Affiliates: [count]
- Branch offices: [count]

Key Personnel:
| Role | Name | Significance |
|------|------|--------------|
| [CEO/etc] | [name] | [key person] |

Ownership Summary:
- Beneficial owners identified: [Y/N]
- Structure transparency: [transparent/opaque]
- Key owners: [names if known]

Key Findings:
1. [Most significant corporate finding]
2. [Second finding]
3. [Third finding]

Risk Indicators:
| Risk Type | Level | Details |
|-----------|-------|---------|
| Financial | [H/M/L] | [summary] |
| Regulatory | [H/M/L] | [summary] |
| Reputational | [H/M/L] | [summary] |
| Ownership | [H/M/L] | [summary] |

Handoffs for Other Agents:
| Agent | Data Provided |
|-------|---------------|
| Echo | [personnel for social search] |
| Atlas | [office addresses for geolocation] |
| Shadow | [domains/emails for breach search] |
| Viper | [key personnel for approach assessment] |
| Dossier | [corporate threat correlation] |
```

---

## STEP 5 OUTPUT

```markdown
## CORPORATE INTELLIGENCE SUMMARY

### Entity Verification
- Legal name: [name]
- Jurisdiction: [jurisdiction]
- Status: [active/dissolved/etc]
- Registration: [number]

### Corporate Structure
- Parent: [entity]
- Subsidiaries: [count]
- Ultimate beneficial owner: [if identified]

### Key Personnel
| Name | Role |
|------|------|
| [name] | [role] |

### Financial Status
- Revenue: [if known]
- Employees: [count]
- Financial health: [assessment]

### Risk Assessment
| Risk Area | Level |
|-----------|-------|
| Financial | [H/M/L] |
| Regulatory | [H/M/L] |
| Ownership transparency | [H/M/L] |

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]
```

---

## COMPLETION CRITERIA

Before proceeding:

- [ ] Entity verified
- [ ] Corporate structure mapped
- [ ] Officers/directors identified
- [ ] Beneficial ownership researched
- [ ] Financial status assessed
- [ ] Regulatory/legal status reviewed
- [ ] Handoff data prepared for other agents

---

## PARALLEL EXECUTION NOTE

This step (5) can run in parallel with Steps 2-4, 6. Share findings as they become available.

---

## MENU OPTIONS

**[C] Continue** - Proceed to geospatial correlation (Step 6)
**[S] Structure** - Deeper corporate structure analysis
**[O] Ownership** - Extended UBO research
**[F] Financial** - Detailed financial analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-06-geospatial.md`
