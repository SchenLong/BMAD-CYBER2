---
name: 'step-01-ownership-archaeology'
description: 'Historical WHOIS records, registrant correlation, domain transfer history, name server history'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/infrastructure-genealogy'
thisStepFile: '{workflow_path}/steps/step-01-ownership-archaeology.md'
nextStepFile: '{workflow_path}/steps/step-02-technical-evolution.md'
prevStepFile: null

# Agent Configuration
executing_agent: domain-intel-specialist
agent_codename: Resolver
---

# Step 1: Ownership Archaeology

## STEP GOAL

Excavate the complete ownership history of the target infrastructure through historical WHOIS analysis, registrant correlation, domain transfer tracking, and name server evolution mapping.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Resolver**, Domain Intelligence Specialist
- You specialize in domain and network ownership investigation
- You trace historical ownership patterns and correlations
- You penetrate privacy services to identify true ownership

### Analysis Protocol
- Extract all available historical WHOIS records
- Correlate registrant information across records
- Track domain transfers and ownership changes
- Map name server evolution
- Identify patterns suggesting common ownership
- Document all findings chronologically

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Target Infrastructure Intake

Document the target infrastructure:

```
INFRASTRUCTURE GENEALOGY: TARGET INTAKE
=======================================

Target Identifier(s):
| Type | Value | Status | Notes |
|------|-------|--------|-------|
| Domain | [domain.com] | [active/expired/parked] | [primary target] |
| IP | [if provided] | [status] | [notes] |
| Related domains | [if known] | [status] | [relationship] |

Investigation Context:
□ Why investigating: [malware/phishing/attribution/due diligence]
□ Time period of interest: [specific dates or "all history"]
□ Known connections: [any suspected relationships]
□ Questions to answer: [specific objectives]

Current Status:
| Attribute | Current Value | Source |
|-----------|---------------|--------|
| Registrar | [registrar] | [WHOIS] |
| Created | [date] | [WHOIS] |
| Expires | [date] | [WHOIS] |
| Status | [serverHold/clientTransferProhibited/etc] | [WHOIS] |
| Nameservers | [NS records] | [DNS] |
```

### 2. Historical WHOIS Analysis

Extract ownership history:

```
HISTORICAL WHOIS ANALYSIS
=========================

WHOIS Record Timeline:
| Date | Registrar | Registrant | Email | Changes |
|------|-----------|------------|-------|---------|
| [earliest] | [registrar] | [name/org] | [email] | [creation] |
| [date] | [registrar] | [name/org] | [email] | [what changed] |
| [date] | [registrar] | [name/org] | [email] | [changes] |
| [current] | [registrar] | [name/org] | [email] | [current state] |

Registrant History:
| Period | Registrant Name | Organization | Country |
|--------|-----------------|--------------|---------|
| [dates] | [name] | [org] | [country] |
| [dates] | [name change] | [org] | [country] |

Email History:
| Period | Admin Email | Tech Email | Registrant Email |
|--------|-------------|------------|------------------|
| [dates] | [email] | [email] | [email] |
| [dates] | [changed] | [changed] | [changed] |

Address History:
| Period | Address | City | Country |
|--------|---------|------|---------|
| [dates] | [address] | [city] | [country] |

Phone History:
| Period | Phone Number | Fax |
|--------|--------------|-----|
| [dates] | [number] | [fax] |

Privacy Service Analysis:
| Period | Privacy Provider | Can Penetrate? | True Owner |
|--------|-----------------|----------------|------------|
| [dates] | [WhoisGuard/etc] | [Y/N] | [if known] |

□ Historical records found: [count]
□ Ownership changes: [count]
□ Privacy services used: [Y/N]
□ Data gaps: [periods with no data]
```

### 3. Registrant Correlation

Correlate registrants to other domains:

```
REGISTRANT CORRELATION
======================

Unique Registrant Identifiers Found:
| Identifier Type | Value | Reliability |
|-----------------|-------|-------------|
| Name | [name] | [consistent/variable] |
| Email | [email] | [primary/alternate] |
| Organization | [org] | [consistent/variable] |
| Phone | [phone] | [reliability] |
| Address | [address] | [reliability] |

Domains Linked by Same Registrant:
| Domain | Registrant Match | Period | Status |
|--------|------------------|--------|--------|
| [domain 1] | [matching field] | [dates] | [active/expired] |
| [domain 2] | [matching field] | [dates] | [status] |
| [domain 3] | [matching field] | [dates] | [status] |

Email Pattern Analysis:
| Email | Domains Registered | First Seen | Last Seen |
|-------|-------------------|------------|-----------|
| [email 1] | [count] | [date] | [date] |
| [email 2] | [count] | [date] | [date] |

Organization Correlation:
| Organization | Domains | Registrars Used | Date Range |
|--------------|---------|-----------------|------------|
| [org] | [count] | [registrars] | [dates] |

Name Correlation (accounting for variations):
| Name Variant | Domains | Pattern |
|--------------|---------|---------|
| [name 1] | [domains] | [consistent/variation] |
| [name 2] | [domains] | [typo/alias?] |

□ Related domains found: [count]
□ Unique registrant identities: [count]
□ Pattern confidence: [H/M/L]
```

### 4. Domain Transfer History

Track ownership transfers:

```
DOMAIN TRANSFER HISTORY
=======================

Transfer Events:
| Date | From Registrar | To Registrar | From Owner | To Owner | Type |
|------|----------------|--------------|------------|----------|------|
| [date] | [registrar] | [registrar] | [owner] | [owner] | [transfer/sale/expired] |

Registrar History:
| Registrar | Period | Registration Count | Notes |
|-----------|--------|-------------------|-------|
| [registrar 1] | [dates] | [count] | [findings] |
| [registrar 2] | [dates] | [count] | [findings] |

Drop/Catch Analysis:
| Event | Date | Domain Status | New Registrant | Timing |
|-------|------|---------------|----------------|--------|
| Expiration | [date] | [dropped/caught] | [who caught] | [hours after drop] |

Suspicious Transfer Patterns:
| Pattern | Evidence | Significance |
|---------|----------|--------------|
| [rapid transfers] | [details] | [hiding ownership?] |
| [bulk transfers] | [details] | [acquisition?] |
| [registrar shopping] | [details] | [avoiding detection?] |

Ownership Continuity Assessment:
□ Single continuous owner: [Y/N]
□ Number of distinct owners: [count]
□ Suspicious transfers: [count]
□ Corporate acquisitions detected: [Y/N]
```

### 5. Name Server Evolution

Track DNS infrastructure changes:

```
NAME SERVER EVOLUTION
=====================

Name Server History:
| Period | Nameservers | Provider | Co-Hosted Domains |
|--------|-------------|----------|-------------------|
| [dates] | [ns1, ns2] | [provider] | [count] |
| [dates] | [changed to] | [provider] | [count] |

NS Provider Analysis:
| Provider | Period | Type | Notes |
|----------|--------|------|-------|
| [provider] | [dates] | [registrar/dedicated/shared] | [findings] |

Co-Hosted Domain Analysis:
| Name Server | Domains Sharing | Notable Domains |
|-------------|-----------------|-----------------|
| [NS] | [count] | [interesting domains] |

NS Change Correlation:
| NS Change Date | Related Events | Significance |
|----------------|----------------|--------------|
| [date] | [hosting change/ownership change] | [correlation] |

Bulletproof/Suspicious NS Indicators:
| Name Server | Reputation | Evidence |
|-------------|------------|----------|
| [NS] | [legitimate/suspicious/known bad] | [basis] |

□ NS changes tracked: [count]
□ Providers identified: [count]
□ Suspicious NS usage: [Y/N]
```

### 6. Ownership Archaeology Summary

Compile ownership findings:

```
OWNERSHIP ARCHAEOLOGY SUMMARY
=============================

Ownership Timeline:
| Period | Owner | Evidence | Confidence |
|--------|-------|----------|------------|
| [dates] | [owner 1] | [WHOIS/correlation] | [H/M/L] |
| [dates] | [owner 2] | [evidence] | [confidence] |
| [current] | [owner] | [evidence] | [confidence] |

Key Ownership Findings:
1. [Most significant ownership finding]
2. [Second finding]
3. [Third finding]

Related Infrastructure Discovered:
| Domain/Asset | Relationship | Confidence |
|--------------|--------------|------------|
| [asset] | [same owner/registrant] | [H/M/L] |

Ownership Patterns:
| Pattern | Description | Significance |
|---------|-------------|--------------|
| [pattern] | [what observed] | [what it means] |

Data Gaps:
| Period | Data Missing | Impact |
|--------|--------------|--------|
| [dates] | [what's missing] | [on assessment] |

Handoff to Probe (Step 2):
- Domains to trace technically: [list]
- IP addresses to investigate: [from NS/history]
- Date ranges of interest: [periods]
- Hosting patterns to verify: [indicators]
```

---

## STEP 1 OUTPUT

```markdown
## OWNERSHIP ARCHAEOLOGY SUMMARY

### Target Infrastructure
- Primary target: [domain/IP]
- Status: [active/expired/etc]
- Age: [years since creation]

### Ownership History
| Period | Owner | Confidence |
|--------|-------|------------|
| [dates] | [owner] | [H/M/L] |

### Related Domains
- Domains linked by registrant: [count]
- Domains linked by NS: [count]
- Key related domains: [list]

### Transfer History
- Ownership changes: [count]
- Registrar changes: [count]
- Suspicious transfers: [Y/N]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Technical Investigation Targets
- IPs to investigate: [list for Step 2]
- Hosting patterns: [for Step 2]
- Time periods: [key dates]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Historical WHOIS extracted
- [ ] Registrant correlation complete
- [ ] Transfer history documented
- [ ] Name server evolution mapped
- [ ] Related domains identified
- [ ] Ownership timeline built
- [ ] Handoff data prepared for Probe

---

## MENU OPTIONS

**[C] Continue** - Proceed to technical evolution (Step 2)
**[W] WHOIS** - Deeper WHOIS analysis
**[R] Registrant** - Extended registrant search
**[T] Transfer** - Detailed transfer investigation

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-technical-evolution.md`
