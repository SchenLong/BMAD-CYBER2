---
name: 'step-03-corporate-ownership'
description: 'Corporate entity ownership chain, subsidiary history, officer/director changes'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/infrastructure-genealogy'
thisStepFile: '{workflow_path}/steps/step-03-corporate-ownership.md'
nextStepFile: '{workflow_path}/steps/step-04-underground-connections.md'
prevStepFile: '{workflow_path}/steps/step-02-technical-evolution.md'

# Agent Configuration
executing_agent: corporate-intel-specialist
agent_codename: Proxy
---

# Step 3: Corporate Ownership History

## STEP GOAL

Trace the corporate ownership history behind the infrastructure including entity ownership chains, corporate structure evolution, subsidiary history, and officer/director changes that correspond to infrastructure changes.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Proxy**, Corporate Intelligence Specialist
- You specialize in CORPINT and beneficial ownership
- You trace corporate ownership chains over time
- You correlate corporate events with infrastructure changes

### Analysis Protocol

- Identify corporate entities from WHOIS registrants
- Trace corporate ownership evolution
- Map subsidiary and affiliate changes
- Track officer/director changes
- Correlate corporate events with technical changes
- Document ownership chain timeline

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Corporate Entity Identification

Identify corporate entities from Steps 1-2:

```
CORPORATE ENTITY IDENTIFICATION
===============================

Entities from WHOIS Registrants:
| Period | Registrant Organization | Jurisdiction | Verified |
|--------|-------------------------|--------------|----------|
| [dates] | [org name 1] | [country/state] | [Y/N] |
| [dates] | [org name 2] | [jurisdiction] | [Y/N] |

Entities from Certificate Data:
| Period | Certificate O= Field | Verification |
|--------|---------------------|--------------|
| [dates] | [org from cert] | [matches WHOIS?] |

Entity Name Variations:
| Primary Name | Variations Found | Likely Same |
|--------------|------------------|-------------|
| [entity] | [variations] | [Y/N] |

Registry Verification Results:
| Entity Name | Registry | Status | Registration # |
|-------------|----------|--------|----------------|
| [entity 1] | [jurisdiction] | [active/dissolved] | [number] |
| [entity 2] | [jurisdiction] | [status] | [number] |

Unverifiable Entities:
| Entity Name | From Source | Issue |
|-------------|-------------|-------|
| [entity] | [WHOIS/cert] | [not found/wrong jurisdiction] |

□ Entities identified: [count]
□ Entities verified: [count]
□ Unverifiable: [count]
```

### 2. Corporate Ownership Chain

Map the ownership hierarchy over time:

```
CORPORATE OWNERSHIP CHAIN
=========================

Current Ownership Structure:
```

[Ultimate Parent]
       |
   [Intermediate Holding]
       |
   [Registrant Entity]
       |
   [INFRASTRUCTURE TARGET]

```

Historical Ownership Structures:
| Period | Owner Entity | Parent | Ultimate Owner |
|--------|--------------|--------|----------------|
| [dates] | [entity] | [parent] | [ultimate] |
| [dates] | [changed to] | [parent] | [ultimate] |

Ownership Changes:
| Date | From Entity | To Entity | Type | Evidence |
|------|-------------|-----------|------|----------|
| [date] | [entity A] | [entity B] | [acquisition/merger/spin-off] | [filings] |

Beneficial Ownership Tracking:
| Period | UBO | Ownership % | Confidence |
|--------|-----|-------------|------------|
| [dates] | [individual/entity] | [%] | [H/M/L] |

Shell Company Indicators:
| Entity | Indicators | Assessment |
|--------|------------|------------|
| [entity] | [nominee directors/virtual office/etc] | [legitimate/shell/unclear] |

Offshore Structure Analysis:
| Entity | Jurisdiction | Purpose | Transparency |
|--------|--------------|---------|--------------|
| [entity] | [BVI/Cayman/etc] | [holding/operating] | [opaque/visible] |

□ Ownership chain mapped: [complete/partial]
□ UBO identified: [Y/N]
□ Shell structures detected: [Y/N]
```

### 3. Corporate Event Timeline

Track corporate events:

```
CORPORATE EVENT TIMELINE
========================

Corporate Events:
| Date | Entity | Event Type | Details | Infrastructure Impact |
|------|--------|------------|---------|----------------------|
| [date] | [entity] | [incorporation] | [details] | [domain registered?] |
| [date] | [entity] | [name change] | [old→new] | [WHOIS update?] |
| [date] | [entity] | [address change] | [old→new] | [hosting change?] |
| [date] | [entity] | [merger/acquisition] | [details] | [transfer?] |
| [date] | [entity] | [dissolution] | [details] | [domain expired?] |

Correlation with Infrastructure Events:
| Corporate Event | Date | Infrastructure Event | Lag |
|-----------------|------|---------------------|-----|
| [corporate] | [date] | [infra change] | [days] |

Officer/Director Changes:
| Date | Entity | Change Type | Names | Significance |
|------|--------|-------------|-------|--------------|
| [date] | [entity] | [appointment/resignation] | [names] | [assessment] |

Financial Events:
| Date | Entity | Event | Amount | Relevance |
|------|--------|-------|--------|-----------|
| [date] | [entity] | [funding/debt/filing] | [amount] | [infrastructure impact] |

Regulatory Events:
| Date | Entity | Event | Authority | Outcome |
|------|--------|-------|-----------|---------|
| [date] | [entity] | [investigation/fine/license] | [regulator] | [result] |

□ Corporate events mapped: [count]
□ Infrastructure correlations: [count]
□ Significant events: [count]
```

### 4. Officer & Director History

Track key personnel over time:

```
OFFICER & DIRECTOR HISTORY
==========================

Historical Officers:
| Entity | Period | Name | Role | Other Entities |
|--------|--------|------|------|----------------|
| [entity] | [dates] | [name] | [CEO/CFO/etc] | [other companies] |
| [entity] | [dates] | [name] | [role] | [other companies] |

Historical Directors:
| Entity | Period | Name | Type | Other Boards |
|--------|--------|------|------|--------------|
| [entity] | [dates] | [name] | [executive/independent] | [boards] |

Personnel Changes Correlation:
| Personnel Change | Date | Infrastructure Change | Related? |
|------------------|------|-----------------------|----------|
| [who/role change] | [date] | [what changed] | [assessment] |

Common Personnel Across Entities:
| Name | Entities | Roles | Period |
|------|----------|-------|--------|
| [name] | [entity list] | [roles] | [dates] |

Nominee Director Indicators:
| Name | Entities | Pattern | Assessment |
|------|----------|---------|------------|
| [name] | [multiple entities] | [professional nominee?] | [Y/N] |

Personnel Network:
| Person | Role | Connected Entities | Significance |
|--------|------|-------------------|--------------|
| [person] | [role] | [entities/infrastructure] | [key decision maker?] |

□ Personnel tracked: [count]
□ Key decision makers: [count]
□ Common personnel: [count]
```

### 5. Business Relationship Analysis

Analyze corporate relationships:

```
BUSINESS RELATIONSHIP ANALYSIS
==============================

Related Entity Network:
| Entity A | Entity B | Relationship | Period |
|----------|----------|--------------|--------|
| [entity] | [entity] | [parent/sub/affiliate] | [dates] |

Joint Ventures/Partnerships:
| JV/Partnership | Entities | Period | Infrastructure |
|----------------|----------|--------|----------------|
| [name] | [entities involved] | [dates] | [domains/IPs] |

Supplier/Customer Relationships:
| Relationship | Entity | Other Party | Evidence |
|--------------|--------|-------------|----------|
| [supplier/customer] | [our entity] | [other] | [contracts/filings] |

Cross-Ownership:
| Entity A | Entity B | Ownership | Direction |
|----------|----------|-----------|-----------|
| [entity] | [entity] | [%] | [A owns B/mutual] |

Industry/Sector Context:
| Entity | Industry | Role | Legitimacy |
|--------|----------|------|------------|
| [entity] | [sector] | [service provider/etc] | [assessment] |

□ Relationships mapped: [count]
□ Complex structures: [Y/N]
□ Unusual patterns: [Y/N]
```

### 6. Corporate Ownership Summary

Compile corporate findings:

```
CORPORATE OWNERSHIP SUMMARY
===========================

Ownership Timeline:
| Period | Owner Entity | Parent | UBO | Status |
|--------|--------------|--------|-----|--------|
| [earliest-date] | [entity] | [parent] | [UBO] | [active] |
| [date-date] | [new entity] | [parent] | [UBO] | [acquired] |
| [current] | [current] | [parent] | [UBO] | [current] |

Key Corporate Findings:
1. [Most significant corporate finding]
2. [Second finding]
3. [Third finding]

Corporate-Infrastructure Correlation:
| Corporate Event | Infrastructure Event | Correlation |
|-----------------|---------------------|-------------|
| [event] | [infra change] | [explanation] |

Ownership Transparency Assessment:
| Dimension | Assessment | Evidence |
|-----------|------------|----------|
| Entity legitimacy | [legitimate/shell/unclear] | [basis] |
| UBO visibility | [known/hidden/partial] | [basis] |
| Structure purpose | [tax/privacy/operations] | [assessment] |

Risk Indicators:
| Risk Type | Present | Details |
|-----------|---------|---------|
| Shell company usage | [Y/N] | [details] |
| Nominee structures | [Y/N] | [details] |
| Offshore opacity | [Y/N] | [details] |
| Frequent restructuring | [Y/N] | [pattern] |

Handoff to Shadow (Step 4):
- Domains for underground search: [list]
- Personnel names: [for forum search]
- Corporate entities: [for breach/mention search]
- Time periods of interest: [dates]
```

---

## STEP 3 OUTPUT

```markdown
## CORPORATE OWNERSHIP SUMMARY

### Entity Verification
- Verified entities: [count]
- Current owner: [entity]
- Jurisdiction: [jurisdiction]

### Ownership Chain
| Level | Entity | Jurisdiction |
|-------|--------|--------------|
| Registrant | [entity] | [jurisdiction] |
| Parent | [entity] | [jurisdiction] |
| Ultimate | [UBO/entity] | [jurisdiction] |

### Corporate Timeline
| Date | Event | Impact |
|------|-------|--------|
| [date] | [event] | [infrastructure impact] |

### Key Personnel
- Current: [key names]
- Historical: [notable names]
- Cross-entity: [shared personnel]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Underground Search Targets
- Entities: [for Step 4]
- Personnel: [for Step 4]
- Domains: [for Step 4]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] Corporate entities identified
- [ ] Ownership chain mapped
- [ ] Corporate events tracked
- [ ] Personnel history documented
- [ ] Business relationships analyzed
- [ ] Corporate timeline built
- [ ] Handoff data prepared for Shadow

---

## MENU OPTIONS

**[C] Continue** - Proceed to underground connections (Step 4)
**[O] Ownership** - Deeper ownership analysis
**[P] Personnel** - Extended personnel investigation
**[R] Relationships** - Additional relationship mapping

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-underground-connections.md`
