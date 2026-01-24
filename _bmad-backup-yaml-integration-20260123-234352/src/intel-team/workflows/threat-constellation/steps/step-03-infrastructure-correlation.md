---
name: 'step-03-infrastructure-correlation'
description: 'Shared infrastructure, tool/malware reuse, code similarity, operational patterns'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/threat-constellation'
thisStepFile: '{workflow_path}/steps/step-03-infrastructure-correlation.md'
nextStepFile: '{workflow_path}/steps/step-04-public-persona.md'
prevStepFile: '{workflow_path}/steps/step-02-underground-network.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Step 3: Infrastructure Correlation

## STEP GOAL

Correlate technical infrastructure across the threat actor ecosystem including shared infrastructure, tool and malware reuse, code similarity, and operational patterns. This reveals technical connections between actors.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Probe**, Technical Researcher
- You specialize in TECHINT and technical forensics
- You identify infrastructure overlaps and code similarities
- You map technical relationships in threat ecosystems

### Analysis Protocol
- Analyze known infrastructure from Steps 1-2
- Identify shared infrastructure with other actors
- Detect tool and malware reuse patterns
- Analyze code similarity for attribution
- Document operational patterns

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Known Infrastructure Inventory

Catalog known infrastructure:

```
KNOWN INFRASTRUCTURE INVENTORY
==============================

From Step 1 (Campaigns):
| Indicator | Type | Campaign | Period | Status |
|-----------|------|----------|--------|--------|
| [domain] | Domain | [campaign] | [dates] | [active/inactive] |
| [IP] | IPv4 | [campaign] | [dates] | [status] |
| [hash] | Malware | [campaign] | [date] | [N/A] |

From Step 2 (Underground):
| Indicator | Type | Context | Source |
|-----------|------|---------|--------|
| [domain] | Domain | [mentioned in forum] | [forum/post] |
| [IP] | IPv4 | [listed on market] | [market] |

Infrastructure Categories:
| Category | Count | Notes |
|----------|-------|-------|
| C2 domains | [count] | [patterns] |
| C2 IPs | [count] | [hosting patterns] |
| Staging | [count] | [notes] |
| Phishing | [count] | [notes] |
| Exfil | [count] | [notes] |

□ Total indicators: [count]
□ Active infrastructure: [count]
□ Historical infrastructure: [count]
```

### 2. Shared Infrastructure Analysis

Identify infrastructure shared with other actors:

```
SHARED INFRASTRUCTURE ANALYSIS
==============================

Shared Domain Analysis:
| Domain | Our Actor | Other Actor(s) | Relationship |
|--------|-----------|----------------|--------------|
| [domain] | [campaign] | [other actors] | [sequential/simultaneous] |

Shared IP Analysis:
| IP | Our Actor Usage | Other Actor Usage | Assessment |
|----|-----------------|-------------------|------------|
| [IP] | [campaign/period] | [who else/when] | [shared hosting/same actor] |

Shared Nameserver Analysis:
| Nameserver | Domains (Our Actor) | Domains (Others) | Pattern |
|------------|---------------------|------------------|---------|
| [NS] | [count] | [count] | [assessment] |

Shared Registrar Patterns:
| Registrar | Our Actor | Other Actors | Notes |
|-----------|-----------|--------------|-------|
| [registrar] | [domain count] | [who else uses] | [pattern] |

Certificate Overlap:
| Certificate Element | Our Actor | Overlap With |
|---------------------|-----------|--------------|
| [issuer pattern] | [certs] | [other actors] |
| [subject pattern] | [certs] | [overlap] |

Hosting Provider Overlap:
| Provider | Our Actor | Other Actors | Significance |
|----------|-----------|--------------|--------------|
| [provider/ASN] | [IPs/domains] | [who else] | [BPH indicator] |

Infrastructure Relationship Graph:
```

```
    [Our Actor]
         │
    ┌────┴────┐
    ▼         ▼
[Domain A] [Domain B]
    │         │
    └────┬────┘
         │
    [Shared IP]
         │
    ┌────┴────┐
    ▼         ▼
[Domain C] [Domain D]
    │         │
[Actor X]  [Actor Y]
```

```
□ Shared infrastructure found: [Y/N]
□ Connected actors: [count]
□ Infrastructure clusters: [count]
```

### 3. Tool and Malware Reuse

Analyze tool and malware overlap:

```
TOOL AND MALWARE REUSE
======================

Malware Arsenal:
| Malware | Family | Version | Exclusive? | Shared With |
|---------|--------|---------|------------|-------------|
| [name] | [family] | [ver] | [Y/N] | [other actors] |
| [name] | [family] | [ver] | [exclusive?] | [who else] |

Tool Overlap Analysis:
| Tool | Our Actor Usage | Other Users | Relationship |
|------|-----------------|-------------|--------------|
| [tool] | [how used] | [other actors] | [purchased/developed/shared] |

Malware-as-a-Service Detection:
| Malware | Type | Provider | Our Actor Role |
|---------|------|----------|----------------|
| [malware] | [RaaS/MaaS] | [provider] | [customer/affiliate/operator] |

Packer/Crypter Analysis:
| Packer/Crypter | Samples | Other Actors Using |
|----------------|---------|-------------------|
| [packer] | [count] | [actors] |

Exploit Kit Usage:
| Exploit Kit | Our Actor | Shared With | Period |
|-------------|-----------|-------------|--------|
| [EK] | [campaigns] | [other actors] | [dates] |

Builder/Framework Detection:
| Builder | Output Signatures | Users |
|---------|-------------------|-------|
| [builder] | [patterns] | [actors] |

Attribution Implications:
| Tool/Malware | What It Tells Us |
|--------------|------------------|
| [exclusive tool] | [strong attribution indicator] |
| [shared tool] | [common ecosystem] |
| [purchased tool] | [customer relationship] |

□ Exclusive tools: [count]
□ Shared tools: [count]
□ MaaS/RaaS relationships: [count]
```

### 4. Code Similarity Analysis

Analyze code similarities:

```
CODE SIMILARITY ANALYSIS
========================

Code Comparison Results:
| Sample A | Sample B | Similarity | Type |
|----------|----------|------------|------|
| [hash] | [hash] | [%] | [same author/derived/coincidental] |

Code Pattern Analysis:
| Pattern | Our Actor | Found In |
|---------|-----------|----------|
| [coding style] | [samples] | [other actors/samples] |
| [error strings] | [samples] | [other samples] |
| [PDB paths] | [samples] | [other samples] |
| [compiler/linker] | [samples] | [commonality] |

Unique Code Signatures:
| Signature | Description | Frequency |
|-----------|-------------|-----------|
| [signature 1] | [what makes it unique] | [our actor only / shared] |
| [signature 2] | [description] | [frequency] |

Code Reuse Detection:
| Component | Original | Reused By |
|-----------|----------|-----------|
| [function/module] | [who created] | [who reused] |

Development Pattern Analysis:
| Pattern | Observation | Attribution Value |
|---------|-------------|-------------------|
| Language | [primary language(s)] | [commonality] |
| Framework | [frameworks used] | [distinctiveness] |
| Build environment | [compiler/version] | [indicator] |
| Debug artifacts | [PDB/symbols] | [developer clues] |

YARA Rule Matches:
| Rule | Description | Our Samples | Other Matches |
|------|-------------|-------------|---------------|
| [rule] | [what it detects] | [count] | [other actors] |

□ Code similarity clusters: [count]
□ Unique signatures: [count]
□ Shared code bases: [count]
```

### 5. Operational Pattern Analysis

Document operational patterns:

```
OPERATIONAL PATTERN ANALYSIS
============================

Temporal Patterns:
| Pattern | Our Actor | Similar Actors |
|---------|-----------|----------------|
| Active hours | [UTC times] | [who matches] |
| Active days | [weekday pattern] | [matches] |
| Campaign timing | [patterns] | [correlations] |

Geographic Patterns:
| Pattern | Observation | Shared With |
|---------|-------------|-------------|
| Hosting regions | [regions] | [other actors] |
| Target regions | [regions] | [similar targeting] |
| Avoidance regions | [avoided countries] | [matches] |

Targeting Patterns:
| Pattern | Our Actor | Similar Actors |
|---------|-----------|----------------|
| Industries | [sectors] | [who targets same] |
| Organization size | [enterprise/SMB] | [matches] |
| Technology focus | [what they exploit] | [similarities] |

C2 Patterns:
| Pattern | Implementation | Shared? |
|---------|----------------|---------|
| Protocol | [HTTP/DNS/etc] | [common/unique] |
| Beacon interval | [timing] | [matches] |
| Encoding | [method] | [shared with] |
| Fallback | [mechanism] | [pattern match] |

Operational Tempo:
| Phase | Duration | Pattern |
|-------|----------|---------|
| Initial access | [typical time] | [pattern] |
| Lateral movement | [typical time] | [pattern] |
| Data exfil | [typical time] | [pattern] |
| Persistence | [duration] | [pattern] |

Kill Chain Patterns:
| Stage | Our Actor | Pattern Matches |
|-------|-----------|-----------------|
| Delivery | [method] | [similar actors] |
| Exploitation | [approach] | [matches] |
| Installation | [technique] | [matches] |
| C2 | [implementation] | [matches] |
| Actions | [objectives] | [matches] |

□ Temporal correlations: [count]
□ Operational similarities: [count]
□ Pattern-based clusters: [count]
```

### 6. Infrastructure Correlation Summary

Compile technical findings:

```
INFRASTRUCTURE CORRELATION SUMMARY
==================================

Correlation Findings:
| Connection Type | Connected To | Evidence | Confidence |
|-----------------|--------------|----------|------------|
| Shared infrastructure | [actor(s)] | [details] | [H/M/L] |
| Tool reuse | [actor(s)] | [details] | [H/M/L] |
| Code similarity | [actor(s)] | [details] | [H/M/L] |
| Operational pattern | [actor(s)] | [details] | [H/M/L] |

Actor Relationships Identified:
| Actor A | Actor B | Relationship Type | Evidence |
|---------|---------|-------------------|----------|
| [our actor] | [other] | [same group/partner/customer] | [basis] |

Technical Ecosystem Map:
```

```
                 [INFRASTRUCTURE ECOSYSTEM]
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    [Shared Hosting]  [Shared Tools]  [Shared Code]
          │               │               │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    ▼           ▼   ▼           ▼   ▼           ▼
[Actor 1]  [Actor 2] [Actor 3] [Actor 4] [Actor 5] [Actor 6]
```

```
Key Technical Findings:
1. [Most significant infrastructure correlation]
2. [Second finding]
3. [Third finding]

Attribution Implications:
| Finding | What It Suggests | Confidence |
|---------|------------------|------------|
| [finding] | [implication] | [H/M/L] |

HANDOFF TO ECHO (Step 4):
- Public personas to correlate: [list from infrastructure]
- Recruitment channels: [from tool analysis]
- Public claims about tools: [to verify]
- Infrastructure announcements: [to find]
```

---

## STEP 3 OUTPUT

```markdown
## INFRASTRUCTURE CORRELATION SUMMARY

### Shared Infrastructure
| Type | Shared With | Count |
|------|-------------|-------|
| Domains | [actors] | [count] |
| IPs | [actors] | [count] |
| Hosting | [actors] | [count] |

### Tool/Malware Overlap
| Tool | Relationship | Actors |
|------|--------------|--------|
| [tool] | [exclusive/shared/purchased] | [actors] |

### Code Similarity
- Code clusters identified: [count]
- Same-author indicators: [count]
- Shared code bases: [count]

### Operational Patterns
- Temporal correlation: [matches found]
- Targeting overlap: [sectors/regions]
- C2 pattern matches: [count]

### Connected Actors
| Actor | Connection Type | Confidence |
|-------|-----------------|------------|
| [actor] | [type] | [H/M/L] |

### Public Persona Targets for Echo
- Personas to investigate: [list]
- Channels to search: [list]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] Infrastructure inventory complete
- [ ] Shared infrastructure identified
- [ ] Tool/malware reuse mapped
- [ ] Code similarity analyzed
- [ ] Operational patterns documented
- [ ] Connected actors identified
- [ ] Public persona targets prepared for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to public persona correlation (Step 4)
**[I] Infrastructure** - Deeper infrastructure pivot
**[M] Malware** - Extended malware analysis
**[C] Code** - Detailed code comparison

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-04-public-persona.md`
