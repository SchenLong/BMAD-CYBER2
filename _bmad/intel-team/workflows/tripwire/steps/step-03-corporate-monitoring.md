---
name: 'step-03-corporate-monitoring'
description: 'Officer/director changes, corporate status updates, new filings, beneficial ownership, M&A activity'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/tripwire'
thisStepFile: '{workflow_path}/steps/step-03-corporate-monitoring.md'
nextStepFile: '{workflow_path}/steps/step-04-social-monitoring.md'
prevStepFile: '{workflow_path}/steps/step-02-infrastructure-monitoring.md'

# Agent Configuration
executing_agent: corporate-intel-specialist
agent_codename: Proxy
---

# Step 3: Corporate Registry Monitoring

## STEP GOAL

Configure comprehensive corporate registry monitoring including officer/director changes, corporate status updates, new subsidiary filings, beneficial ownership changes, M&A activity alerts, and regulatory filing notifications.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Proxy**, Corporate Intelligence Specialist
- You specialize in corporate registry and business intelligence
- You monitor corporate structure changes and regulatory filings
- You detect significant business events through public records

### Monitoring Protocol
- Identify all corporate entities to monitor
- Configure officer/director change alerts
- Set up filing and status monitoring
- Establish M&A and ownership tracking
- Document regulatory notification rules

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Corporate Entity Inventory

Catalog entities to monitor:

```
CORPORATE ENTITY INVENTORY
==========================

Primary Entity:
| Field | Value |
|-------|-------|
| Legal name | [Full legal name] |
| DBA/Trade names | [Doing business as names] |
| Company number | [registration number] |
| Jurisdiction | [state/country] |
| Entity type | [Corp/LLC/Partnership/etc] |
| Status | [Active/Good standing] |
| Registered agent | [name, address] |

Related Entities:
| Entity Name | Relationship | Jurisdiction | Status | Monitor |
|-------------|--------------|--------------|--------|---------|
| [Parent company] | Parent | [jurisdiction] | [status] | [Y/N] |
| [Subsidiary 1] | Subsidiary | [jurisdiction] | [status] | [Y/N] |
| [Subsidiary 2] | Subsidiary | [jurisdiction] | [status] | [Y/N] |
| [Affiliate] | Affiliate | [jurisdiction] | [status] | [Y/N] |

Jurisdictions to Monitor:
| Jurisdiction | Registry | Access | Monitoring Method |
|--------------|----------|--------|-------------------|
| Delaware | ICIS | Online | Automated scrape |
| [State] | [Secretary of State] | [access] | [method] |
| [Country] | [Companies House/etc] | [access] | [method] |

Key Filings to Track:
| Filing Type | Frequency | Significance |
|-------------|-----------|--------------|
| Annual report | Yearly | Status confirmation |
| Amendment | As needed | Structure changes |
| Merger/conversion | As needed | Major corporate action |
| Dissolution | As needed | Entity termination |
| Foreign qualification | As needed | Expansion |

□ Primary entity: [documented]
□ Related entities: [count]
□ Jurisdictions: [count]
□ Filing types: [identified]
```

### 2. Officer/Director Monitoring

Configure leadership change alerts:

```
OFFICER/DIRECTOR MONITORING
===========================

Current Officers/Directors:
| Name | Title | Since | Jurisdiction | Alert Priority |
|------|-------|-------|--------------|----------------|
| [name] | CEO | [date] | [where] | P2 HIGH |
| [name] | CFO | [date] | [where] | P2 HIGH |
| [name] | Secretary | [date] | [where] | P3 MEDIUM |
| [name] | Director | [date] | [where] | P3 MEDIUM |
| [name] | Registered Agent | [date] | [where] | P3 MEDIUM |

Change Detection Rules:
| Change Type | Detection Method | Priority | Response |
|-------------|------------------|----------|----------|
| New officer added | Registry comparison | P3 MEDIUM | Document, research new person |
| Officer removed | Registry comparison | P3 MEDIUM | Document, assess impact |
| Title change | Registry comparison | P4 LOW | Note change |
| Address change | Registry comparison | P4 LOW | Verify new location |
| Registered agent change | Registry comparison | P3 MEDIUM | Research new agent |

High-Priority Change Alerts:
| Change | Priority | Rationale |
|--------|----------|-----------|
| CEO/President change | P2 HIGH | Leadership transition |
| CFO change | P2 HIGH | Financial oversight change |
| All directors resign | P1 CRITICAL | Potential distress signal |
| Registered agent resigned | P2 HIGH | Possible compliance issue |
| No officer on file | P1 CRITICAL | Entity may be abandoned |

Linked Person Monitoring:
| Person | Entity Connections | Other Affiliations |
|--------|-------------------|-------------------|
| [name] | [count entities] | [other companies] |
| [name] | [count] | [affiliations] |

Officer/Director Data Sources:
| Source | Coverage | Update Frequency | Cost |
|--------|----------|------------------|------|
| State registry | [jurisdiction] | Real-time | Varies |
| SEC EDGAR | Public companies | Real-time | Free |
| OpenCorporates | Multi-jurisdiction | Weekly | $$ |
| Commercial database | Comprehensive | Daily | $$$ |

□ Officers documented: [count]
□ Change rules: [configured]
□ Linked persons: [mapped]
□ Data sources: [integrated]
```

### 3. Corporate Status Monitoring

Configure status change alerts:

```
CORPORATE STATUS MONITORING
===========================

Current Status:
| Entity | Status | Standing | Last Confirmed |
|--------|--------|----------|----------------|
| [entity] | Active | Good | [date] |
| [subsidiary] | Active | Good | [date] |

Status Alert Rules:
| Status Change | Priority | Significance |
|---------------|----------|--------------|
| Active → Inactive | P2 HIGH | Entity no longer operating |
| Good → Not Good Standing | P2 HIGH | Compliance failure |
| Active → Suspended | P1 CRITICAL | Serious compliance issue |
| Active → Dissolved | P1 CRITICAL | Entity terminated |
| Active → Revoked | P1 CRITICAL | Charter revoked |
| Pending dissolution | P2 HIGH | Future termination |
| Merger pending | P2 HIGH | Corporate action underway |

Compliance Indicators:
| Indicator | Current | Alert Threshold | Priority |
|-----------|---------|-----------------|----------|
| Annual report filed | [Y/N] | Overdue > 30 days | P3 MEDIUM |
| Franchise tax paid | [Y/N] | Overdue | P2 HIGH |
| Registered agent valid | [Y/N] | Invalid | P2 HIGH |
| Business license current | [Y/N] | Expired | P3 MEDIUM |

Status Check Schedule:
| Entity | Check Frequency | Last Check | Next Check |
|--------|-----------------|------------|------------|
| [entity] | Weekly | [date] | [date] |
| [subsidiary] | Bi-weekly | [date] | [date] |

Status Change Response Matrix:
| Change | Immediate Action | Follow-up |
|--------|------------------|-----------|
| Not good standing | Notify stakeholders | Research cause |
| Suspended | Escalate P1 | Assess impact |
| Dissolved | Escalate P1 | Verify, assess succession |
| Merged | Document | Track surviving entity |

□ Status documented: [Y/N]
□ Alert rules: [count]
□ Compliance tracked: [Y/N]
□ Check schedule: [set]
```

### 4. Filing and Event Monitoring

Configure filing and event alerts:

```
FILING AND EVENT MONITORING
===========================

Filing Types to Monitor:
| Filing Type | Priority | Significance | Source |
|-------------|----------|--------------|--------|
| Annual report | P4 LOW | Status update | State registry |
| Amendment (name) | P3 MEDIUM | Rebranding | State registry |
| Amendment (structure) | P3 MEDIUM | Ownership/governance change | State registry |
| Certificate of merger | P2 HIGH | M&A activity | State registry |
| Certificate of conversion | P2 HIGH | Entity type change | State registry |
| Foreign qualification | P3 MEDIUM | Geographic expansion | State registry |
| Statement of dissolution | P1 CRITICAL | Entity termination | State registry |
| Fictitious name (DBA) | P4 LOW | Brand expansion | County/State |

SEC Filings (if applicable):
| Form | Priority | Significance |
|------|----------|--------------|
| 8-K | P2 HIGH | Material events |
| 10-K | P4 LOW | Annual report |
| 10-Q | P4 LOW | Quarterly report |
| SC 13D/G | P2 HIGH | Ownership change |
| Form 4 | P3 MEDIUM | Insider trading |
| S-1 | P2 HIGH | IPO filing |
| DEF 14A | P3 MEDIUM | Proxy statement |

UCC Filings:
| Filing Type | Priority | Significance |
|-------------|----------|--------------|
| UCC-1 (new) | P3 MEDIUM | New secured interest |
| UCC-3 (amendment) | P4 LOW | Modification |
| UCC-3 (termination) | P3 MEDIUM | Debt satisfied |

Court/Legal Filings:
| Type | Priority | Source |
|------|----------|--------|
| Lawsuit filed | P2 HIGH | PACER, state courts |
| Bankruptcy | P1 CRITICAL | PACER |
| Judgment | P2 HIGH | Court records |
| Lien | P2 HIGH | State/county records |

□ State filings: [configured]
□ SEC filings: [if applicable]
□ UCC monitoring: [active]
□ Court monitoring: [active]
```

### 5. Beneficial Ownership and M&A

Configure ownership and M&A monitoring:

```
BENEFICIAL OWNERSHIP MONITORING
===============================

Known Ownership Structure:
| Owner | Ownership % | Type | Since |
|-------|-------------|------|-------|
| [entity/person] | [%] | [Direct/Indirect] | [date] |
| [entity/person] | [%] | [type] | [date] |

Ownership Change Alerts:
| Change Type | Detection Method | Priority |
|-------------|------------------|----------|
| New beneficial owner | Registry/SEC filing | P2 HIGH |
| Ownership % change > 5% | SEC 13D/G filing | P2 HIGH |
| Ownership % change > 10% | Any source | P2 HIGH |
| Change of control | Multiple indicators | P1 CRITICAL |
| New parent company | Registry amendment | P2 HIGH |

M&A Activity Monitoring:
| Indicator | Source | Priority |
|-----------|--------|----------|
| Merger announcement | News, SEC | P2 HIGH |
| Acquisition announcement | News, SEC | P2 HIGH |
| Letter of intent | SEC 8-K | P2 HIGH |
| Definitive agreement | SEC 8-K | P2 HIGH |
| Merger completion | Registry, SEC | P2 HIGH |
| Asset sale | SEC 8-K | P3 MEDIUM |
| Divestiture | News, SEC | P3 MEDIUM |

Investment/Funding Events:
| Event | Source | Priority |
|-------|--------|----------|
| Funding round | Crunchbase, news | P3 MEDIUM |
| Debt issuance | SEC, news | P3 MEDIUM |
| Bond offering | SEC | P3 MEDIUM |
| Equity offering | SEC S-1/S-3 | P2 HIGH |

Related Party Transactions:
| Type | Monitor For | Source |
|------|-------------|--------|
| Intercompany transfers | Unusual activity | SEC filings |
| Related party loans | New or changed | SEC filings |
| Management agreements | New services | Proxy statements |

M&A Data Sources:
| Source | Coverage | Access |
|--------|----------|--------|
| SEC EDGAR | Public companies | Free |
| State registries | All entities | Varies |
| Crunchbase | Startups/private | $$ |
| Pitchbook | Comprehensive | $$$ |
| News monitoring | Announcements | Varies |

□ Ownership documented: [Y/N]
□ Change alerts: [configured]
□ M&A monitoring: [active]
□ Data sources: [integrated]
```

### 6. Corporate Monitoring Summary

Compile monitoring configuration:

```
CORPORATE MONITORING SUMMARY
============================

Entity Coverage:
| Entity Type | Count | Monitored | Jurisdictions |
|-------------|-------|-----------|---------------|
| Primary entity | 1 | Yes | [jurisdiction] |
| Subsidiaries | [count] | [count] | [list] |
| Affiliates | [count] | [count] | [list] |

Monitoring Configuration:
| Category | Active | Alert Rules |
|----------|--------|-------------|
| Officer/Director | [Y/N] | [count] |
| Corporate status | [Y/N] | [count] |
| Filings | [Y/N] | [count] |
| Ownership | [Y/N] | [count] |
| M&A activity | [Y/N] | [count] |

Alert Priority Summary:
| Priority | Count | Examples |
|----------|-------|----------|
| P1 CRITICAL | [count] | Dissolution, bankruptcy |
| P2 HIGH | [count] | Officer change, status change |
| P3 MEDIUM | [count] | Filings, minor amendments |
| P4 LOW | [count] | Routine updates |

Data Sources Integrated:
| Source | Purpose | Frequency |
|--------|---------|-----------|
| [source] | [purpose] | [frequency] |

HANDOFF TO ECHO (Step 4):
- Entity names: [for social monitoring]
- Key personnel: [for person monitoring]
- Brand names: [for mention tracking]
- Recent events: [for sentiment context]
```

---

## STEP 3 OUTPUT

```markdown
## CORPORATE MONITORING COMPLETE

### Entity Coverage
- Primary entity: [name]
- Subsidiaries: [count]
- Affiliates: [count]
- Total jurisdictions: [count]

### Monitoring Categories
- Officer/director changes: [active]
- Corporate status: [active]
- Registry filings: [active]
- Ownership changes: [active]
- M&A activity: [active]

### Alert Rules
- P1 CRITICAL: [count] rules
- P2 HIGH: [count] rules
- P3 MEDIUM: [count] rules
- P4 LOW: [count] rules

### Data Sources
- State registries: [count]
- SEC EDGAR: [if applicable]
- Commercial databases: [list]

### Next Step
Step 4: Social Monitoring (Echo)
Focus: [post alerts, mentions, sentiment, new accounts]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Corporate entities inventoried
- [ ] Officer monitoring configured
- [ ] Status alerts established
- [ ] Filing monitoring active
- [ ] Ownership tracking enabled
- [ ] Handoff prepared for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to social monitoring (Step 4)
**[O] Officers** - Extended officer monitoring
**[F] Filings** - Detailed filing configuration
**[M] M&A** - M&A monitoring details

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-04-social-monitoring.md`

