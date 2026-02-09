---
name: 'step-04-corporate'
description: 'Entity verification, corporate structure, officers, UBO, financials'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-org'
thisStepFile: '{workflow_path}/steps/step-04-corporate.md'
nextStepFile: '{workflow_path}/steps/step-05-public-presence.md'
prevStepFile: '{workflow_path}/steps/step-03-technology.md'

# Agent Configuration
executing_agent: corporate-intel-specialist
agent_codename: Proxy
---

# Phase 4: Corporate Structure & Intelligence

## STEP GOAL

Map the organization's complete corporate structure including entity verification, ownership chains, officers and directors, beneficial ownership, and financial intelligence. This provides understanding of organizational hierarchy, decision-makers, and business relationships.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Proxy**, Corporate Intelligence Specialist
- You specialize in CORPINT/FININT and business intelligence
- You trace corporate structures and ownership chains
- You identify beneficial owners and key decision-makers

### Collection Protocol
- Verify entity registration and status
- Map parent/subsidiary relationships
- Identify officers, directors, and key personnel
- Trace beneficial ownership where possible
- Gather financial intelligence from public sources

---

## COLLECTION EXECUTION SEQUENCE

### 1. Entity Verification

Verify the target organization's legal existence:

```
ENTITY VERIFICATION
===================

Primary Entity:
□ Legal Name: [full legal name]
□ Entity Type: [Corporation/LLC/LP/LLP/Other]
□ Jurisdiction: [state/country of incorporation]
□ Registration Number: [company number]
□ Date of Incorporation: [date]
□ Status: [Active/Inactive/Dissolved]

Registry Verification:
| Registry | Record Found | Verification Date |
|----------|--------------|-------------------|
| [State/Country registry] | [Y/N] | [date] |
| SEC Edgar | [Y/N] | [date] |
| [Other registry] | [Y/N] | [date] |

Registered Address:
□ Registered Office: [address]
□ Principal Place of Business: [address]
□ Registered Agent: [name if applicable]

Entity Aliases/Trading Names:
| Name | Type | Status |
|------|------|--------|
| [DBA/Trade name] | [DBA] | [Active] |
| [Former name] | [Former] | [Changed on date] |

TAX/REGULATORY IDs:
| ID Type | Number | Verified |
|---------|--------|----------|
| EIN | [if known] | [Y/N] |
| VAT | [if known] | [Y/N] |
| DUNS | [if known] | [Y/N] |
| LEI | [if known] | [Y/N] |
```

### 2. Corporate Structure Mapping

Map the organizational hierarchy:

```
CORPORATE STRUCTURE MAPPING
===========================

PARENT COMPANY:
□ Ultimate Parent: [name if not target]
□ Jurisdiction: [country]
□ Ownership: [% if known]
□ Public/Private: [status]

CORPORATE HIERARCHY:
```
[Ultimate Parent]
    └── [Holding Company] (100%)
        └── [TARGET ENTITY] (100%)
            ├── [Subsidiary 1] (100%)
            ├── [Subsidiary 2] (75%)
            ├── [Subsidiary 3] (51%)
            └── [JV Partner] (50%)
```

SUBSIDIARIES:
| Entity Name | Jurisdiction | Ownership % | Purpose |
|-------------|--------------|-------------|---------|
| [name] | [country] | [%] | [operating/holding/dormant] |

AFFILIATES & JOINT VENTURES:
| Entity Name | Partner | Ownership % | Purpose |
|-------------|---------|-------------|---------|
| [name] | [partner name] | [%] | [purpose] |

FOREIGN REGISTRATIONS:
| Jurisdiction | Registration Type | Status |
|--------------|-------------------|--------|
| [country] | [branch/subsidiary] | [status] |

CORPORATE STRUCTURE COMPLEXITY:
□ Total entities in group: [count]
□ Countries of operation: [count]
□ Holding company structure: [Y/N]
□ Offshore entities: [Y/N, where]
□ Complex ownership: [Y/N, notes]
```

### 3. Officers and Directors

Identify leadership and governance:

```
OFFICERS AND DIRECTORS
======================

BOARD OF DIRECTORS:
| Name | Title | Since | Other Boards |
|------|-------|-------|--------------|
| [name] | Chair | [date] | [list] |
| [name] | Director | [date] | [list] |
| [name] | Independent Director | [date] | [list] |

EXECUTIVE OFFICERS:
| Name | Title | Since | Background |
|------|-------|-------|------------|
| [name] | CEO | [date] | [brief background] |
| [name] | CFO | [date] | [brief background] |
| [name] | COO | [date] | [brief background] |
| [name] | CTO | [date] | [brief background] |
| [name] | General Counsel | [date] | [brief background] |

COMPANY SECRETARY:
□ Name: [name]
□ Appointed: [date]
□ Professional: [Y/N]

HISTORICAL OFFICERS:
| Name | Title | Period | Reason for Departure |
|------|-------|--------|---------------------|
| [name] | [title] | [dates] | [if known] |

CROSS-DIRECTORSHIPS:
| Director | Also Serves On | Relationship |
|----------|----------------|--------------|
| [name] | [other companies] | [nature of relationship] |

OFFICER INTELLIGENCE:
- Leadership stability: [Stable/Moderate turnover/High turnover]
- Professional directors: [Y/N, count]
- Industry experience: [observations]
- Key decision-makers: [list top 3]
```

### 4. Beneficial Ownership

Trace ultimate beneficial owners:

```
BENEFICIAL OWNERSHIP ANALYSIS
=============================

SIGNIFICANT SHAREHOLDERS:
| Shareholder | Type | Ownership % | Voting % |
|-------------|------|-------------|----------|
| [name] | [Individual/Entity] | [%] | [%] |
| [name] | [Individual/Entity] | [%] | [%] |

OWNERSHIP CHAIN TRACING:
For each significant shareholder that is an entity:
```
[Shareholder Entity]
    └── Owned by: [Entity 2] (%)
        └── Owned by: [Entity 3] (%)
            └── UBO: [Individual Name]
```

ULTIMATE BENEFICIAL OWNERS (UBOs):
| UBO Name | Nationality | Ownership Path | Control % |
|----------|-------------|----------------|-----------|
| [name] | [country] | [through which entities] | [%] |

NOMINEE/TRUST INDICATORS:
□ Nominee directors observed: [Y/N]
□ Corporate directors: [Y/N, which]
□ Trust structures: [Y/N]
□ Nominee shareholders: [Y/N]

POLITICALLY EXPOSED PERSONS (PEP):
| Name | Position | Relationship | Risk Level |
|------|----------|--------------|------------|
| [name] | [political position] | [owner/director] | [H/M/L] |

SANCTIONS SCREENING:
| Name | Sanctions List | Status |
|------|---------------|--------|
| [name] | [OFAC/EU/UN/etc] | [Clear/Match/Potential] |

OWNERSHIP COMPLEXITY ASSESSMENT:
□ UBO identifiable: [Y/N]
□ Layers of ownership: [count]
□ Offshore structures: [Y/N]
□ Red flags observed: [list if any]
```

### 5. Financial Intelligence

Gather publicly available financial information:

```
FINANCIAL INTELLIGENCE
======================

PUBLIC COMPANY DATA (if applicable):
| Metric | Value | Period |
|--------|-------|--------|
| Market Cap | [value] | [date] |
| Revenue | [value] | [fiscal year] |
| Net Income | [value] | [fiscal year] |
| Employees | [count] | [date] |

PRIVATE COMPANY ESTIMATES:
| Source | Revenue Estimate | Employee Estimate |
|--------|------------------|-------------------|
| [source] | [range] | [range] |

REGULATORY FILINGS:
| Filing Type | Date | Key Information |
|-------------|------|-----------------|
| 10-K/Annual | [date] | [summary] |
| 10-Q/Quarterly | [date] | [summary] |
| 8-K/Material Event | [date] | [summary] |
| Proxy Statement | [date] | [exec comp, governance] |

CREDIT/FINANCIAL STANDING:
| Indicator | Status | Source |
|-----------|--------|--------|
| Credit Rating | [rating] | [agency] |
| Payment History | [status] | [if known] |
| Liens/Judgments | [Y/N] | [registry] |
| Bankruptcy History | [Y/N] | [court records] |

CORPORATE ACTIONS:
| Date | Action Type | Details |
|------|-------------|---------|
| [date] | [M&A/IPO/Funding] | [details] |

FUNDING HISTORY (for private):
| Date | Round | Amount | Investors |
|------|-------|--------|-----------|
| [date] | [Series X] | [amount] | [investors] |

FINANCIAL INTELLIGENCE SUMMARY:
- Financial health: [Strong/Stable/Weak/Unknown]
- Growth trajectory: [Growing/Stable/Declining]
- Key financial concerns: [list if any]
- Recent material events: [list if any]
```

### 6. Regulatory and Legal Status

Check regulatory standing and legal matters:

```
REGULATORY AND LEGAL STATUS
===========================

REGULATORY LICENSES:
| License Type | Issuing Authority | Status |
|--------------|-------------------|--------|
| [license] | [authority] | [Active/Suspended] |

REGULATORY ACTIONS:
| Date | Authority | Action | Status |
|------|-----------|--------|--------|
| [date] | [SEC/FTC/etc] | [action type] | [resolved/pending] |

LITIGATION HISTORY:
| Case | Court | Role | Status | Summary |
|------|-------|------|--------|---------|
| [case name] | [court] | [plaintiff/defendant] | [status] | [brief] |

GOVERNMENT CONTRACTS:
| Agency | Contract Type | Value | Period |
|--------|---------------|-------|--------|
| [agency] | [description] | [value] | [dates] |

COMPLIANCE INDICATORS:
□ Industry compliance certifications: [list]
□ Regulatory enforcement history: [Y/N]
□ Outstanding legal matters: [Y/N]
□ Government contractor: [Y/N]
```

### 7. Corporate Intelligence Summary

Compile corporate intelligence findings:

```
CORPORATE INTELLIGENCE SUMMARY
==============================

Entity Profile:
| Attribute | Value |
|-----------|-------|
| Legal Name | [name] |
| Jurisdiction | [jurisdiction] |
| Status | [status] |
| Type | [Public/Private] |
| Industry | [industry] |

Corporate Structure:
- Ultimate parent: [name]
- Subsidiaries: [count]
- Countries of operation: [count]
- Structure complexity: [Simple/Moderate/Complex]

Ownership Summary:
- Ownership type: [Widely held/Closely held/PE-backed/Family]
- Key UBOs: [list top 3]
- PEP connections: [Y/N]
- Sanctions concerns: [Y/N]

Leadership Summary:
- CEO: [name]
- Key executives: [count]
- Board size: [count]
- Leadership stability: [assessment]

Financial Summary:
- Revenue: [value or estimate]
- Employees: [count or estimate]
- Financial health: [assessment]
- Recent material events: [if any]

PIR Contribution:
| PIR | Corporate Contribution | Status |
|-----|----------------------|--------|
| PIR-1 | [contribution] | [status] |
| PIR-2 | [contribution] | [status] |
| PIR-3 | [contribution] | [status] |
| PIR-4 | [contribution] | [status] |

Handoff to Echo (Phase 5):
- Key personnel for social analysis: [list]
- Company social accounts: [list]
- Public communications to analyze: [list]
```

---

## PHASE 4 OUTPUT

```markdown
## CORPORATE INTELLIGENCE SUMMARY

### Entity Status
- Legal name: [name]
- Status: [Active/Other]
- Jurisdiction: [jurisdiction]
- Type: [Public/Private]

### Corporate Structure
- Parent company: [name or "N/A"]
- Subsidiaries: [count]
- Structure complexity: [assessment]

### Ownership
- Ownership type: [type]
- UBOs identified: [Y/N, count]
- PEP/Sanctions flags: [Y/N]

### Leadership
- Key executives: [count]
- Board members: [count]
- Leadership stability: [assessment]

### Financial Profile
- Revenue: [value/estimate]
- Employees: [count/estimate]
- Financial health: [assessment]

### Key Findings
1. [Most significant]
2. [Second most significant]
3. [Third most significant]

### Ready for Public Presence Analysis
Corporate structure complete. Proceed to social media and personnel analysis.
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 5:
- [ ] Entity verified in registries
- [ ] Corporate structure mapped
- [ ] Officers and directors identified
- [ ] Beneficial ownership analyzed
- [ ] Financial intelligence gathered
- [ ] Regulatory status checked
- [ ] Key personnel identified for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to public presence analysis (Phase 5)
**[O] Ownership** - Deeper beneficial ownership tracing
**[F] Financial** - Extended financial analysis
**[S] Subsidiary** - Detailed subsidiary investigation

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-05-public-presence.md`
