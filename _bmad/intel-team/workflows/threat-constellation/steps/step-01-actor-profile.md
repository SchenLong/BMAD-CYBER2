---
name: 'step-01-actor-profile'
description: 'Known identities/aliases, historical campaigns, TTP documentation, MITRE ATT&CK mapping, motivation assessment'
estimated_duration: '20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/threat-constellation'
thisStepFile: '{workflow_path}/steps/step-01-actor-profile.md'
nextStepFile: '{workflow_path}/steps/step-02-underground-network.md'
prevStepFile: null

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 1: Actor Profile Development

## STEP GOAL

Develop comprehensive threat actor profiles including all known identities, historical campaigns, documented TTPs, MITRE ATT&CK mapping, and motivation assessment. This forms the foundation for ecosystem mapping.

## EXECUTION TIME: ~20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Dossier**, Threat Actor Profiler
- You specialize in threat intelligence and actor attribution
- You build comprehensive actor profiles from multiple sources
- You map TTPs to MITRE ATT&CK framework

### Analysis Protocol
- Collect all known identities and aliases
- Document historical campaigns and operations
- Map TTPs systematically
- Apply MITRE ATT&CK framework
- Assess motivation using established frameworks
- Identify known associates for ecosystem expansion

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Target Actor Intake

Document the actor(s) to profile:

```
THREAT CONSTELLATION: TARGET INTAKE
===================================

Primary Target(s):
| Actor/Group | Type | Known Since | Current Status |
|-------------|------|-------------|----------------|
| [name] | [APT/Cybercrime/Hacktivist/etc] | [date] | [active/inactive/unknown] |

Input Type:
□ Named actor/group
□ Campaign indicators (IOCs)
□ Malware family
□ Underground handle
□ Infrastructure cluster

Intelligence Requirements:
| Requirement | Priority | Notes |
|-------------|----------|-------|
| [what needs answering] | [P1/P2/P3] | [context] |

Investigation Scope:
□ Single actor deep-dive
□ Multi-actor ecosystem mapping
□ Campaign-centric analysis
□ Infrastructure-based correlation

Timeframe: [date range of interest]
Geographic Focus: [regions if applicable]
Sector Focus: [industries if applicable]
```

### 2. Identity Collection

Gather all known identities:

```
IDENTITY COLLECTION
===================

Primary Identity:
| Element | Value | Source | Confidence |
|---------|-------|--------|------------|
| Group name | [primary name] | [source] | [H/M/L] |
| Alternative names | [list] | [sources] | [H/M/L] |
| Attribution | [nation-state/criminal/etc] | [source] | [H/M/L] |
| First observed | [date] | [source] | [H/M/L] |

Known Aliases:
| Alias | Context | Period | Source |
|-------|---------|--------|--------|
| [alias 1] | [where used] | [dates] | [source] |
| [alias 2] | [context] | [dates] | [source] |

Underground Identities:
| Handle | Platform | Activity Period | Reputation |
|--------|----------|-----------------|------------|
| [handle] | [forum/market] | [dates] | [vouches/rep] |

Individual Members (if known):
| Identity | Role | Aliases | Status |
|----------|------|---------|--------|
| [name/handle] | [leader/dev/operator] | [aliases] | [active/arrested/etc] |

Naming Conventions:
| Vendor | Name Used | Notes |
|--------|-----------|-------|
| [Mandiant/CrowdStrike/etc] | [their name] | [mapping notes] |

□ All known identities collected: [Y/N]
□ Identity count: [number]
□ Cross-vendor mapping complete: [Y/N]
```

### 3. Historical Campaign Documentation

Document all known campaigns:

```
HISTORICAL CAMPAIGN DOCUMENTATION
=================================

Campaign Timeline:
| Campaign | Date Range | Targets | Impact |
|----------|------------|---------|--------|
| [campaign 1] | [dates] | [victims/sectors] | [assessment] |
| [campaign 2] | [dates] | [targets] | [impact] |

Campaign Details:

CAMPAIGN: [Name 1]
------------------
| Element | Details |
|---------|---------|
| Timeframe | [dates] |
| Targets | [victims/sectors/regions] |
| Objective | [espionage/financial/destruction] |
| Initial Access | [technique] |
| Tools Used | [malware/tools] |
| Infrastructure | [domains/IPs] |
| Attribution Basis | [evidence] |
| Impact | [assessment] |
| Sources | [reports] |

CAMPAIGN: [Name 2]
------------------
[Repeat structure]

Campaign Evolution:
| Period | Focus Shift | Capability Change | Notes |
|--------|-------------|-------------------|-------|
| [early] | [initial focus] | [initial capability] | [context] |
| [middle] | [evolution] | [development] | [context] |
| [recent] | [current focus] | [current capability] | [context] |

Notable Incidents:
| Date | Incident | Significance |
|------|----------|--------------|
| [date] | [major incident] | [why notable] |

□ Campaign documentation complete: [Y/N]
□ Total campaigns documented: [count]
□ Most recent campaign: [date]
```

### 4. TTP Documentation

Document tactics, techniques, and procedures:

```
TTP DOCUMENTATION
=================

Tactical Overview:
| Phase | Common Approach | Signature Elements |
|-------|-----------------|-------------------|
| Initial Access | [methods] | [unique indicators] |
| Execution | [methods] | [indicators] |
| Persistence | [methods] | [indicators] |
| Privilege Escalation | [methods] | [indicators] |
| Defense Evasion | [methods] | [indicators] |
| Credential Access | [methods] | [indicators] |
| Discovery | [methods] | [indicators] |
| Lateral Movement | [methods] | [indicators] |
| Collection | [methods] | [indicators] |
| Command & Control | [methods] | [indicators] |
| Exfiltration | [methods] | [indicators] |
| Impact | [methods] | [indicators] |

Detailed Technique Analysis:
| Technique | Implementation | Frequency | Signature |
|-----------|----------------|-----------|-----------|
| [technique] | [how they do it] | [always/often/sometimes] | [detection opportunity] |

Tooling Arsenal:
| Tool | Type | Usage | Shared? |
|------|------|-------|---------|
| [tool/malware] | [RAT/loader/etc] | [how used] | [exclusive/shared] |

Infrastructure Preferences:
| Element | Preference | Notes |
|---------|------------|-------|
| C2 Protocol | [HTTP/DNS/etc] | [details] |
| Hosting | [providers/regions] | [patterns] |
| Domains | [naming patterns] | [DGA/keywords] |
| Certificates | [patterns] | [details] |

Operational Security:
| OpSec Measure | Observed | Effectiveness |
|---------------|----------|---------------|
| [measure] | [Y/N] | [assessment] |

□ TTP documentation complete: [Y/N]
□ Unique techniques identified: [count]
□ Signature indicators: [count]
```

### 5. MITRE ATT&CK Mapping

Map to ATT&CK framework:

```
MITRE ATT&CK MAPPING
====================

ATT&CK Techniques Used:
| Tactic | Technique ID | Technique Name | Evidence |
|--------|--------------|----------------|----------|
| Initial Access | T1566 | Phishing | [campaigns] |
| Initial Access | T1190 | Exploit Public-Facing App | [campaigns] |
| Execution | [ID] | [name] | [evidence] |
| Persistence | [ID] | [name] | [evidence] |
| Privilege Escalation | [ID] | [name] | [evidence] |
| Defense Evasion | [ID] | [name] | [evidence] |
| Credential Access | [ID] | [name] | [evidence] |
| Discovery | [ID] | [name] | [evidence] |
| Lateral Movement | [ID] | [name] | [evidence] |
| Collection | [ID] | [name] | [evidence] |
| C&C | [ID] | [name] | [evidence] |
| Exfiltration | [ID] | [name] | [evidence] |
| Impact | [ID] | [name] | [evidence] |

Sub-Techniques:
| Technique | Sub-Technique | Evidence |
|-----------|---------------|----------|
| T1566 | .001 Spearphishing Attachment | [campaigns] |
| T1566 | .002 Spearphishing Link | [campaigns] |

ATT&CK Coverage Summary:
| Tactic | Techniques | Coverage |
|--------|------------|----------|
| Initial Access | [count] | [%] |
| Execution | [count] | [%] |
| [etc] | [count] | [%] |

ATT&CK Navigator Layer:
[JSON or reference to Navigator export]

Technique Frequency:
| Frequency | Techniques |
|-----------|------------|
| Always used | [T#### list] |
| Often used | [T#### list] |
| Sometimes used | [T#### list] |

□ ATT&CK mapping complete: [Y/N]
□ Total techniques: [count]
□ Navigator layer created: [Y/N]
```

### 6. Motivation Assessment

Assess actor motivation:

```
MOTIVATION ASSESSMENT
=====================

Primary Motivation:
| Motivation | Likelihood | Evidence |
|------------|------------|----------|
| Financial | [H/M/L] | [basis] |
| Espionage | [H/M/L] | [basis] |
| Sabotage/Destruction | [H/M/L] | [basis] |
| Hacktivism/Ideology | [H/M/L] | [basis] |
| Personal/Ego | [H/M/L] | [basis] |

Sponsorship Assessment:
| Sponsor Type | Likelihood | Evidence |
|--------------|------------|----------|
| Nation-state | [H/M/L] | [indicators] |
| Criminal organization | [H/M/L] | [indicators] |
| Corporate | [H/M/L] | [indicators] |
| Independent | [H/M/L] | [indicators] |

Nation-State Attribution (if applicable):
| Country | Confidence | Basis |
|---------|------------|-------|
| [country] | [H/M/L] | [evidence summary] |

Targeting Logic:
| Target Type | Why Targeted | Evidence |
|-------------|--------------|----------|
| [sector/org type] | [assessed reason] | [campaigns] |

Resource Assessment:
| Resource | Level | Evidence |
|----------|-------|----------|
| Financial backing | [significant/moderate/limited] | [basis] |
| Technical capability | [advanced/moderate/basic] | [basis] |
| Personnel | [large/medium/small team] | [basis] |
| Time/persistence | [high/medium/low] | [basis] |

□ Motivation assessment complete: [Y/N]
□ Primary motivation: [assessed]
□ Sponsorship: [assessed]
```

### 7. Actor Profile Summary

Compile profile card:

```
ACTOR PROFILE CARD: [PRIMARY NAME]
==================================

IDENTIFICATION
--------------
Primary Name: [name]
Also Known As: [aliases]
Type: [APT/Cybercrime/Hacktivist/etc]
Status: [Active/Inactive/Unknown]
First Observed: [date]
Last Activity: [date]

ATTRIBUTION
-----------
Sponsor: [nation-state/criminal/independent]
Country: [if known]
Confidence: [H/M/L]
Basis: [summary]

MOTIVATION
----------
Primary: [financial/espionage/etc]
Secondary: [if applicable]
Resource Level: [assessment]

TARGETING
---------
Sectors: [targeted industries]
Regions: [geographic focus]
Victim Size: [enterprise/SMB/individual]

CAPABILITIES
------------
Technical Level: [Advanced/Moderate/Basic]
Key Tools: [top 3-5 tools]
Signature Techniques: [unique TTPs]
OpSec Level: [High/Medium/Low]

MITRE ATT&CK
------------
Total Techniques: [count]
Key Tactics: [top areas]
Navigator: [reference]

CAMPAIGNS
---------
Total Documented: [count]
Most Recent: [date - name]
Most Significant: [campaign]

KNOWN ASSOCIATES
----------------
[List for ecosystem expansion]

HANDOFF TO SHADOW (Step 2)
--------------------------
- Underground identities to investigate: [list]
- Platforms to search: [list]
- Associates to map: [list]
- Time period focus: [dates]
```

---

## STEP 1 OUTPUT

```markdown
## ACTOR PROFILE SUMMARY

### Primary Identity
- Name: [primary name]
- Type: [APT/Cybercrime/etc]
- Attribution: [sponsor/country]
- Status: [Active/Inactive]

### Aliases & Identities
| Alias | Context |
|-------|---------|
| [alias] | [where used] |

### Capability Assessment
- Technical level: [Advanced/Moderate/Basic]
- Resource level: [High/Medium/Low]
- OpSec: [High/Medium/Low]

### MITRE ATT&CK Coverage
- Total techniques: [count]
- Key tactics: [list top 3]
- Navigator layer: [created Y/N]

### Campaign History
- First campaign: [date - name]
- Last campaign: [date - name]
- Total documented: [count]

### Motivation
- Primary: [motivation]
- Confidence: [H/M/L]

### Underground Targets for Shadow
- Handles: [list]
- Platforms: [list]
- Associates: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] All known identities collected
- [ ] Historical campaigns documented
- [ ] TTPs systematically mapped
- [ ] MITRE ATT&CK mapping complete
- [ ] Motivation assessed
- [ ] Profile card created
- [ ] Underground targets identified for Shadow

---

## MENU OPTIONS

**[C] Continue** - Proceed to underground network mapping (Step 2)
**[D] Deeper** - More detailed campaign analysis
**[T] TTP** - Extended TTP documentation
**[M] MITRE** - ATT&CK Navigator export

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-underground-network.md`
