---
name: 'phase-04-corporate-structure'
description: 'Entity verification, corporate structure, funding and investment, regulatory status'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-04-corporate-structure.md'
nextStepFile: '{workflow_path}/steps/phase-05-personnel-organization.md'
prevStepFile: '{workflow_path}/steps/phase-03-digital-infrastructure.md'

# Agent Configuration
executing_agent: corporate-intel-specialist
agent_codename: Proxy
---

# Phase 4: Corporate Structure & Funding

## PHASE GOAL

Analyze the AI entity's corporate structure including entity verification, parent/subsidiary relationships, funding and investment history, strategic partnerships, and regulatory status.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Proxy**, Corporate Intelligence Specialist
- You specialize in CORPINT and FININT analysis
- You trace corporate structures and beneficial ownership
- You analyze funding, partnerships, and regulatory compliance

### Analysis Protocol

- Verify corporate entity registration
- Map corporate structure and subsidiaries
- Document funding rounds and investors
- Identify strategic partnerships
- Assess regulatory status and compliance

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Entity Verification

Verify corporate registration and legal status:

```
ENTITY VERIFICATION
===================

Primary Entity:
| Field | Value | Source |
|-------|-------|--------|
| Legal Name | [name] | [registry] |
| Entity Type | [C-Corp/LLC/Ltd/etc] | [registry] |
| Jurisdiction | [state/country] | [registry] |
| Registration Date | [date] | [registry] |
| Status | [active/inactive] | [registry] |
| Registration Number | [number] | [registry] |

Registered Address:
| Address Type | Address | Status |
|--------------|---------|--------|
| Registered Office | [address] | [current/historical] |
| Principal Office | [address] | [current] |
| Mailing Address | [address] | [current] |

Agent for Service:
| Name | Address | Type |
|------|---------|------|
| [registered agent] | [address] | [company/individual] |

Historical Names:
| Former Name | Date Changed | Context |
|-------------|--------------|---------|
| [name] | [date] | [rebrand/merger] |

□ Entity verified: [Y/N]
□ Status confirmed: [active/inactive]
□ Address verified: [Y/N]
```

### 2. Corporate Structure

Map parent/subsidiary relationships:

```
CORPORATE STRUCTURE
===================

Ownership Structure:
| Level | Entity | Ownership % | Jurisdiction |
|-------|--------|-------------|--------------|
| Parent | [parent entity] | [%] | [jurisdiction] |
| Target | [entity name] | - | [jurisdiction] |
| Subsidiary | [subsidiary] | [%] | [jurisdiction] |

Ultimate Beneficial Owners (UBO):
| Name | Ownership % | Type | Source |
|------|-------------|------|--------|
| [owner] | [%] | [Individual/Entity] | [filings] |

Corporate Hierarchy:
```

[Ultimate Parent]
├── [Parent Company]
│   ├── [TARGET ENTITY]
│   │   ├── [Subsidiary 1]
│   │   ├── [Subsidiary 2]
│   │   └── [Subsidiary 3]
│   └── [Sister Company]
└── [Other Holdings]

```

Subsidiaries Analysis:
| Subsidiary | Jurisdiction | Purpose | Status |
|------------|--------------|---------|--------|
| [subsidiary] | [location] | [function] | [active] |

Foreign Entities:
| Entity | Country | Purpose | Relationship |
|--------|---------|---------|--------------|
| [entity] | [country] | [R&D/sales/holding] | [subsidiary/branch] |

Special Purpose Vehicles:
| Entity | Purpose | Note |
|--------|---------|------|
| [SPV] | [purpose] | [holding company/IP] |

□ Structure mapped: [Y/N]
□ UBO identified: [Y/N/Partial]
□ Subsidiaries: [count]
□ Foreign entities: [count]
```

### 3. Funding & Investment

Document funding history and investors:

```
FUNDING & INVESTMENT
====================

Funding Rounds:
| Round | Date | Amount | Valuation | Lead Investor |
|-------|------|--------|-----------|---------------|
| Pre-Seed | [date] | [$X] | [$X] | [investor] |
| Seed | [date] | [$X] | [$X] | [investor] |
| Series A | [date] | [$X] | [$X] | [investor] |
| Series B | [date] | [$X] | [$X] | [investor] |
| Series C+ | [date] | [$X] | [$X] | [investor] |

Total Funding:
| Metric | Value | Source |
|--------|-------|--------|
| Total raised | [$X] | [Crunchbase/filings] |
| Latest valuation | [$X] | [source] |
| Funding stage | [Series X] | [source] |

Investor Analysis:
| Investor | Type | Rounds | Total Investment | Notable |
|----------|------|--------|------------------|---------|
| [investor] | VC/Corp/Angel | [rounds] | [$X] | [board seat?] |
| [investor] | [type] | [rounds] | [$X] | [strategic value] |

Strategic Investors:
| Investor | Relationship | Strategic Interest |
|----------|--------------|-------------------|
| [tech company] | Investor + Partner | [interest] |
| [cloud provider] | Strategic investor | [compute partnership] |

Cap Table (if visible):
| Shareholder | Type | Ownership % | Source |
|-------------|------|-------------|--------|
| Founders | Common | [%] | [estimate] |
| Employees | Options | [%] | [estimate] |
| Investors | Preferred | [%] | [estimate] |

Debt Financing:
| Type | Amount | Lender | Terms |
|------|--------|--------|-------|
| [venture debt] | [$X] | [lender] | [if known] |

□ Funding history documented: [Y/N]
□ Key investors identified: [count]
□ Valuation determined: [Y/N]
```

### 4. Strategic Partnerships

Identify key partnerships and relationships:

```
STRATEGIC PARTNERSHIPS
======================

Technology Partnerships:
| Partner | Relationship | Value | Announced |
|---------|--------------|-------|-----------|
| [cloud provider] | Compute partnership | [$X commitment] | [date] |
| [tech company] | API integration | [terms] | [date] |
| [research org] | Research collaboration | [scope] | [date] |

Commercial Partnerships:
| Partner | Relationship | Scope | Date |
|---------|--------------|-------|------|
| [enterprise partner] | Reseller/OEM | [terms] | [date] |
| [industry partner] | Vertical integration | [scope] | [date] |

Academic Partnerships:
| Institution | Type | Focus Area | Personnel |
|-------------|------|------------|-----------|
| [university] | Research | [AI safety/capabilities] | [researchers] |

Government Relationships:
| Entity | Relationship | Value | Notes |
|--------|--------------|-------|-------|
| [government agency] | Contract | [$X] | [scope] |
| [research org] | Grant | [$X] | [project] |

Joint Ventures:
| JV Entity | Partners | Purpose | Status |
|-----------|----------|---------|--------|
| [JV name] | [partners] | [purpose] | [active] |

Supplier Relationships:
| Supplier | Service | Dependency Level |
|----------|---------|------------------|
| [compute provider] | GPU/TPU | [critical] |
| [data provider] | Training data | [level] |

□ Technology partnerships: [count]
□ Commercial partnerships: [count]
□ Government relationships: [count]
```

### 5. Regulatory Status

Assess regulatory compliance and status:

```
REGULATORY STATUS
=================

Government Contracts:
| Agency | Contract | Value | Date | Status |
|--------|----------|-------|------|--------|
| [agency] | [contract title] | [$X] | [date] | [active] |

Regulatory Filings:
| Filing Type | Jurisdiction | Date | Content |
|-------------|--------------|------|---------|
| SEC registration | US | [date] | [status] |
| GDPR registration | EU | [date] | [status] |
| AI Act compliance | EU | [date] | [status] |

Export Control Status:
| Aspect | Status | Notes |
|--------|--------|-------|
| Export license required | [Y/N] | [for what] |
| Restricted entities | [Y/N] | [if applicable] |
| Technology classification | [category] | [implications] |

Sanctions Screening:
| Entity | Status | Notes |
|--------|--------|-------|
| [entity] | [clear/flagged] | [details] |

Antitrust/Competition:
| Jurisdiction | Status | Concerns |
|--------------|--------|----------|
| US (FTC/DOJ) | [status] | [investigations] |
| EU (EC) | [status] | [concerns] |
| UK (CMA) | [status] | [concerns] |

AI-Specific Regulations:
| Regulation | Jurisdiction | Compliance Status |
|------------|--------------|-------------------|
| EU AI Act | EU | [compliant/gap/pending] |
| Executive Order | US | [status] |
| [other] | [jurisdiction] | [status] |

Litigation History:
| Case | Parties | Issue | Status | Outcome |
|------|---------|-------|--------|---------|
| [case] | [parties] | [IP/antitrust/labor] | [status] | [outcome] |

□ Government contracts: [count]
□ Regulatory filings reviewed: [count]
□ Compliance concerns: [count]
```

### 6. Financial Intelligence

Analyze available financial information:

```
FINANCIAL INTELLIGENCE
======================

Revenue Indicators:
| Metric | Estimate | Source | Confidence |
|--------|----------|--------|------------|
| Annual Revenue | [$X] | [source] | [H/M/L] |
| Revenue Growth | [%] | [source] | [H/M/L] |
| ARR | [$X] | [source] | [H/M/L] |
| Gross Margin | [%] | [source] | [H/M/L] |

Cost Structure:
| Category | Estimate | Source |
|----------|----------|--------|
| Compute costs | [$X] | [inference] |
| Personnel costs | [$X] | [headcount × avg salary] |
| R&D spend | [$X] | [source] |
| Infrastructure | [$X] | [source] |

Financial Health Indicators:
| Indicator | Status | Evidence |
|-----------|--------|----------|
| Burn rate | [sustainable/concerning] | [hiring, spending] |
| Runway | [months] | [based on funding] |
| Profitability | [profitable/loss-making] | [evidence] |
| Cash position | [strong/moderate/weak] | [last raise timing] |

M&A Activity:
| Type | Target/Acquirer | Value | Date | Status |
|------|-----------------|-------|------|--------|
| Acquisition | [target] | [$X] | [date] | [completed] |
| Merger discussion | [company] | [$X] | [date] | [status] |

□ Revenue estimated: [Y/N]
□ Cost structure analyzed: [Y/N]
□ Financial health assessed: [Y/N]
```

### 7. Corporate Structure Summary

Compile corporate findings:

```
CORPORATE STRUCTURE SUMMARY
===========================

Entity Overview:
| Field | Value |
|-------|-------|
| Legal Name | [name] |
| Type | [entity type] |
| Jurisdiction | [location] |
| Status | [status] |
| Founded | [date] |
| Employees | [count estimate] |

Ownership:
| Owner Type | Details |
|------------|---------|
| UBO | [names if known] |
| Major investors | [key investors] |
| Structure complexity | [simple/complex] |

Funding Profile:
| Metric | Value |
|--------|-------|
| Total raised | [$X] |
| Latest valuation | [$X] |
| Last round | [round type, date] |
| Key investors | [list] |

Strategic Position:
| Dimension | Assessment |
|-----------|------------|
| Partnership strength | [strong/moderate/weak] |
| Government relationships | [assessment] |
| Regulatory posture | [compliant/at risk] |
| Financial health | [assessment] |

Critical Findings:
| Finding | Significance | Priority |
|---------|--------------|----------|
| [finding] | [why important] | [H/M/L] |

HANDOFF TO ECHO (Phase 5):
- Key officers/directors: [list for personnel profiling]
- Announced personnel: [from press releases]
- Board members: [list]
- Known researchers: [list]
- Hiring signals: [job post indicators]
```

---

## PHASE 4 OUTPUT

```markdown
## CORPORATE STRUCTURE COMPLETE

### Entity Profile
- Legal name: [name]
- Type: [type]
- Jurisdiction: [location]
- Status: [status]

### Funding Summary
- Total raised: [$X]
- Valuation: [$X]
- Key investors: [list]
- Last round: [round, date]

### Corporate Structure
- Subsidiaries: [count]
- Foreign entities: [count]
- Structure complexity: [assessment]

### Key Findings
1. [Most significant corporate finding]
2. [Second finding]
3. [Third finding]

### Regulatory Status
- Major concerns: [list]
- Compliance status: [assessment]

### Next Phase
Phase 5: Personnel & Organization (Echo)
Focus: [key personnel, org structure, hiring]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 5:

- [ ] Entity verified and documented
- [ ] Corporate structure mapped
- [ ] Funding history documented
- [ ] Partnerships identified
- [ ] Regulatory status assessed
- [ ] Handoff prepared for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to personnel analysis (Phase 5)
**[F] Funding** - Deeper funding analysis
**[R] Regulatory** - Extended regulatory review
**[S] Structure** - Detailed structure analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/phase-05-personnel-organization.md`
