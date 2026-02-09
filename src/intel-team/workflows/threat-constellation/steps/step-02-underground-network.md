---
name: 'step-02-underground-network'
description: 'Forum presence, marketplace activity, communication channels, known associates, service providers'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/threat-constellation'
thisStepFile: '{workflow_path}/steps/step-02-underground-network.md'
nextStepFile: '{workflow_path}/steps/step-03-infrastructure-correlation.md'
prevStepFile: '{workflow_path}/steps/step-01-actor-profile.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 2: Underground Network Mapping

## STEP GOAL

Map the threat actor's underground presence including forum activity, marketplace operations, communication channels, known associates, and service providers used. This reveals the actor's position within the criminal ecosystem.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground source exploitation
- You map underground networks and relationships
- You identify service providers and associates

### Analysis Protocol
- Search all relevant underground forums
- Track marketplace activity and reputation
- Identify communication channels
- Map known associates and collaborators
- Document service providers used
- Build relationship network from underground activity

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Forum Presence Mapping

Map forum activity:

```
FORUM PRESENCE MAPPING
======================

Forum Search Results:
| Forum | Handle(s) Used | Status | Join Date | Last Active |
|-------|----------------|--------|-----------|-------------|
| [forum 1] | [handle] | [active/banned/inactive] | [date] | [date] |
| [forum 2] | [handle] | [status] | [date] | [date] |

Forum Profile Analysis:

FORUM: [Forum Name 1]
---------------------
| Element | Value |
|---------|-------|
| Handle | [username] |
| Join Date | [date] |
| Post Count | [count] |
| Reputation | [score/vouches] |
| Status/Rank | [rank] |
| Avatar | [description] |
| Signature | [text] |
| Bio | [content] |
| Contact Info | [jabber/tox/etc] |
| Last Active | [date] |

Post Analysis:
| Date Range | Post Count | Primary Topics |
|------------|------------|----------------|
| [period] | [count] | [topics] |

Notable Posts:
| Date | Thread | Content Summary | Significance |
|------|--------|-----------------|--------------|
| [date] | [topic] | [summary] | [why important] |

Reputation History:
| Date | Action | Details |
|------|--------|---------|
| [date] | [vouch/complaint/ban] | [context] |

[Repeat for each forum]

Cross-Forum Identity Correlation:
| Forum A | Forum B | Evidence of Same Actor |
|---------|---------|------------------------|
| [handle] | [handle] | [correlation basis] |

□ Forums searched: [count]
□ Active presence confirmed: [count]
□ Forum reputation: [good/mixed/poor]
```

### 2. Marketplace Activity

Track marketplace operations:

```
MARKETPLACE ACTIVITY
====================

Marketplace Presence:
| Marketplace | Role | Handle | Period | Status |
|-------------|------|--------|--------|--------|
| [market 1] | [vendor/buyer/both] | [name] | [dates] | [active/inactive] |
| [market 2] | [role] | [name] | [dates] | [status] |

Vendor Profile Analysis:

MARKETPLACE: [Market Name]
--------------------------
| Element | Value |
|---------|-------|
| Vendor Name | [name] |
| Active Since | [date] |
| Product Categories | [types] |
| Total Sales | [if known] |
| Rating | [score] |
| Disputes | [count] |
| PGP Key | [fingerprint] |

Product Listings:
| Product | Category | Price | Sales | Period |
|---------|----------|-------|-------|--------|
| [product 1] | [malware/access/data] | [price] | [count] | [dates] |
| [product 2] | [category] | [price] | [count] | [dates] |

Product Categories Sold:
| Category | Count | Revenue Est. | Notes |
|----------|-------|--------------|-------|
| Ransomware | [count] | [estimate] | [notable] |
| Initial Access | [count] | [estimate] | [notable] |
| Stolen Data | [count] | [estimate] | [notable] |
| Credentials | [count] | [estimate] | [notable] |
| Tools/Services | [count] | [estimate] | [notable] |

Buyer Activity (if known):
| Marketplace | Purchases | Categories | Period |
|-------------|-----------|------------|--------|
| [market] | [count] | [what bought] | [dates] |

Escrow/Transaction History:
| Date | Market | Transaction Type | Amount | Counterparty |
|------|--------|------------------|--------|--------------|
| [date] | [market] | [sale/purchase] | [amount] | [if known] |

□ Marketplaces searched: [count]
□ Vendor presence: [Y/N]
□ Buyer activity: [Y/N]
□ Revenue assessment: [estimate]
```

### 3. Communication Channels

Identify communication methods:

```
COMMUNICATION CHANNELS
======================

Identified Channels:
| Platform | Identifier | Type | Status |
|----------|------------|------|--------|
| Jabber/XMPP | [JID] | [personal/group] | [active/inactive] |
| TOX | [ID] | [personal] | [status] |
| Telegram | [handle/channel] | [personal/group/channel] | [status] |
| Discord | [server/handle] | [server/DM] | [status] |
| IRC | [nick/channel] | [personal/channel] | [status] |
| Session | [ID] | [personal] | [status] |
| Wire | [handle] | [personal/group] | [status] |

Telegram Analysis:
| Channel/Group | Role | Members | Activity |
|---------------|------|---------|----------|
| [channel] | [owner/admin/member] | [count] | [frequency] |

Content from Channels:
| Date | Channel | Content Summary | Intelligence Value |
|------|---------|-----------------|-------------------|
| [date] | [channel] | [summary] | [significance] |

IRC Presence:
| Network | Channel | Nick | Role | Period |
|---------|---------|------|------|--------|
| [network] | [#channel] | [nick] | [op/voice/user] | [dates] |

Communication Patterns:
| Pattern | Observation | Notes |
|---------|-------------|-------|
| Active hours | [times/timezone] | [timezone inference] |
| Language | [primary language] | [variations] |
| Encryption use | [always/sometimes/never] | [tools used] |
| OpSec level | [high/medium/low] | [assessment] |

Contact Information Advertised:
| Forum/Market | Contact Offered | Current Validity |
|--------------|-----------------|------------------|
| [platform] | [contact method] | [works Y/N] |

□ Communication channels identified: [count]
□ Active channels: [count]
□ Encryption habits: [assessed]
```

### 4. Known Associates Mapping

Map relationships and associates:

```
KNOWN ASSOCIATES MAPPING
========================

Direct Associates:
| Associate | Relationship | Evidence | Confidence |
|-----------|--------------|----------|------------|
| [handle/name] | [partner/customer/supplier] | [interaction evidence] | [H/M/L] |
| [handle/name] | [relationship] | [evidence] | [H/M/L] |

Relationship Types:
| Type | Associates | Notes |
|------|------------|-------|
| Business partners | [handles] | [joint operations] |
| Customers | [handles] | [purchased what] |
| Suppliers | [handles] | [supplied what] |
| Developers | [handles] | [coded what] |
| Affiliates | [handles] | [RaaS/MaaS] |
| Competing | [handles] | [rivalry context] |

Interaction Evidence:
| Date | Platform | Actors | Interaction Type | Details |
|------|----------|--------|------------------|---------|
| [date] | [forum/channel] | [handles] | [collaboration/deal/vouch] | [summary] |

Group Membership:
| Group | Role | Period | Evidence |
|-------|------|--------|----------|
| [group name] | [member/leader/affiliate] | [dates] | [basis] |

Network Diagram Elements:
```

```
                    [TARGET ACTOR]
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    [Partner 1]     [Partner 2]     [Supplier]
          │               │               │
    ┌─────┴─────┐         │         ┌─────┴─────┐
    ▼           ▼         ▼         ▼           ▼
[Customer] [Customer] [Shared]  [Developer] [Provider]
                      [Contact]
```

```
Associate Profiles (Brief):
| Associate | Type | Activity | Current Status |
|-----------|------|----------|----------------|
| [handle 1] | [criminal/state/hybrid] | [summary] | [active/arrested/etc] |
| [handle 2] | [type] | [activity] | [status] |

□ Associates identified: [count]
□ Network depth: [levels mapped]
□ Key relationships: [count]
```

### 5. Service Providers

Document service providers used:

```
SERVICE PROVIDERS USED
======================

Hosting Providers:
| Provider | Service | Period | Evidence |
|----------|---------|--------|----------|
| [provider] | [bulletproof hosting] | [dates] | [source] |
| [provider] | [VPS] | [dates] | [source] |

Payment Services:
| Service | Type | Usage | Evidence |
|---------|------|-------|----------|
| [crypto exchange] | [exchange] | [deposits/withdrawals] | [source] |
| [mixing service] | [tumbler] | [laundering] | [source] |

Proxy/VPN Services:
| Service | Type | Usage Period |
|---------|------|--------------|
| [service] | [VPN/proxy] | [dates] |

Development Services:
| Provider | Service | Product |
|----------|---------|---------|
| [handle] | [custom dev] | [what built] |

Crypter/Packer Services:
| Service | Type | Period |
|---------|------|--------|
| [service/provider] | [crypter/packer] | [dates] |

Traffic Services:
| Service | Type | Usage |
|---------|------|-------|
| [TDS provider] | [traffic distribution] | [campaigns] |

Spam/Distribution Services:
| Service | Type | Volume |
|---------|------|--------|
| [provider] | [spam/botnet access] | [assessment] |

Service Provider Relationships:
| Provider | Relationship | Exclusive? |
|----------|--------------|------------|
| [provider] | [customer/partner] | [Y/N] |

□ Infrastructure providers: [count]
□ Financial services: [count]
□ Technical services: [count]
```

### 6. Underground Network Summary

Compile underground findings:

```
UNDERGROUND NETWORK SUMMARY
===========================

Ecosystem Position Assessment:
| Dimension | Assessment | Evidence |
|-----------|------------|----------|
| Forum status | [well-known/emerging/peripheral] | [reputation/posts] |
| Market presence | [major vendor/minor/buyer only] | [sales/ratings] |
| Network centrality | [hub/connected/peripheral] | [associate count] |
| Service dependencies | [self-sufficient/dependent] | [providers used] |

Underground Reputation:
| Platform | Reputation | Basis |
|----------|------------|-------|
| [forum 1] | [excellent/good/mixed/poor] | [details] |
| [forum 2] | [reputation] | [basis] |

Financial Activity Assessment:
| Metric | Estimate | Confidence |
|--------|----------|------------|
| Revenue (lifetime) | [range] | [H/M/L] |
| Revenue (recent) | [range] | [H/M/L] |
| Transaction volume | [count] | [H/M/L] |

Key Underground Findings:
1. [Most significant underground finding]
2. [Second finding]
3. [Third finding]

Operational Security Assessment:
| Measure | Observed | Effectiveness |
|---------|----------|---------------|
| Identity separation | [Y/N] | [assessment] |
| Communication security | [level] | [assessment] |
| Financial OpSec | [level] | [assessment] |

HANDOFF TO PROBE (Step 3):
- Infrastructure to correlate: [domains/IPs from forum posts]
- Tools/malware mentioned: [for technical analysis]
- Shared infrastructure claims: [what they share]
- Development patterns: [code repositories, samples]
```

---

## STEP 2 OUTPUT

```markdown
## UNDERGROUND NETWORK SUMMARY

### Forum Presence
| Forum | Handle | Reputation | Status |
|-------|--------|------------|--------|
| [forum] | [handle] | [score] | [active/inactive] |

### Marketplace Activity
- Role: [Vendor/Buyer/Both]
- Products: [categories]
- Revenue estimate: [range]

### Communication Channels
| Platform | Identifier | Status |
|----------|------------|--------|
| [platform] | [contact] | [active Y/N] |

### Known Associates
| Associate | Relationship | Confidence |
|-----------|--------------|------------|
| [handle] | [type] | [H/M/L] |

### Service Providers
| Type | Provider |
|------|----------|
| Hosting | [provider] |
| Payment | [service] |

### Ecosystem Position
- Forum status: [assessment]
- Network centrality: [assessment]
- OpSec level: [assessment]

### Infrastructure for Probe
- Domains mentioned: [list]
- IPs discussed: [list]
- Tools/malware: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Forum presence mapped
- [ ] Marketplace activity documented
- [ ] Communication channels identified
- [ ] Associates mapped
- [ ] Service providers documented
- [ ] Network position assessed
- [ ] Infrastructure targets identified for Probe

---

## MENU OPTIONS

**[C] Continue** - Proceed to infrastructure correlation (Step 3)
**[F] Forum** - Deeper forum analysis
**[M] Market** - Extended marketplace investigation
**[A] Associates** - Expand associate network

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-03-infrastructure-correlation.md`
