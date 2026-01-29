---
name: 'step-02-technical-fingerprinting'
description: 'Infrastructure analysis, tool signatures, and code pattern correlation'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/attribution-chain'
thisStepFile: '{workflow_path}/steps/step-02-technical-fingerprinting.md'
nextStepFile: '{workflow_path}/steps/step-03-underground-correlation.md'
prevStepFile: '{workflow_path}/steps/step-01-ttp-analysis.md'

# Agent Configuration
executing_agent: technical-researcher
agent_codename: Probe
---

# Step 2: Technical Fingerprinting

## STEP GOAL

Analyze technical artifacts to identify unique fingerprints in infrastructure, tools, malware, and code patterns. Correlate findings with known actor infrastructure and toolsets to validate or refute attribution hypotheses from Step 1.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Probe**, Technical Researcher
- You specialize in infrastructure analysis and technical artifact examination
- You identify patterns in code, configurations, and operational procedures
- You correlate technical signatures with known threat actor toolsets

### Analysis Protocol
- Examine all technical artifacts systematically
- Identify unique fingerprints and signatures
- Correlate with historical infrastructure databases
- Document code similarities and tool reuse
- Note operational patterns indicating actor identity

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Infrastructure Analysis

Analyze network infrastructure indicators:

```
INFRASTRUCTURE ANALYSIS
=======================

Domain Analysis:
| Domain | Registrar | Creation Date | WHOIS Privacy | Related Domains |
|--------|-----------|---------------|---------------|-----------------|
| [domain] | [registrar] | [date] | [Y/N] | [related] |

□ Registration pattern analysis:
  - Registrar preference: [pattern observed]
  - Privacy service usage: [pattern observed]
  - Naming conventions: [patterns]
  - Registration timing: [patterns]

□ Historical WHOIS correlation:
  - Previous owners matching known actors: [findings]
  - Registration email patterns: [findings]
  - Organization field patterns: [findings]

IP Address Analysis:
| IP | ASN | Provider | Geolocation | Hosting Type |
|----|-----|----------|-------------|--------------|
| [IP] | [ASN] | [provider] | [location] | [dedicated/VPS/bulletproof] |

□ Hosting preference patterns:
  - Preferred providers: [list]
  - Geographic distribution: [pattern]
  - Bulletproof hosting usage: [Y/N, details]
  - IP rotation patterns: [observations]

□ Historical IP correlation:
  - IPs previously associated with known actors: [findings]
  - Shared hosting with known malicious infrastructure: [findings]

Infrastructure Overlap Assessment:
| Actor Hypothesis | Infrastructure Match | Evidence |
|------------------|---------------------|----------|
| [hypothesis 1] | [count] matching | [details] |
| [hypothesis 2] | [count] matching | [details] |
| [hypothesis 3] | [count] matching | [details] |
```

### 2. Malware/Tool Signature Analysis

Examine malware and tool artifacts:

```
MALWARE/TOOL ANALYSIS
=====================

Sample Inventory:
| Hash (SHA256) | Type | Family | First Seen | Detection |
|---------------|------|--------|------------|-----------|
| [hash] | [dropper/RAT/etc] | [family] | [date] | [AV detection] |

For each sample:

SAMPLE: [identifier]
□ Static Analysis:
  - Compiler/packer: [findings]
  - Compilation timestamp: [timestamp, validity assessment]
  - Debug paths/PDB: [if present]
  - Embedded strings: [notable findings]
  - Language indicators: [code comments, error messages]
  - Certificate analysis: [if signed]

□ Behavioral Indicators:
  - C2 communication patterns: [protocol, frequency, encoding]
  - Persistence mechanisms: [methods]
  - Evasion techniques: [methods]
  - Unique behavioral signatures: [distinctive features]

□ Code Pattern Analysis:
  - Coding style indicators: [observations]
  - Error handling patterns: [observations]
  - Encryption/encoding routines: [algorithms, implementation]
  - API usage patterns: [distinctive patterns]

Known Tool Correlation:
| Tool/Malware | Known Actor Association | Match Confidence |
|--------------|------------------------|------------------|
| [tool name] | [actor(s)] | [H/M/L] |

□ Tool signatures matching known actors:
  - [finding with evidence]
  - [finding with evidence]

□ Custom vs commodity tooling assessment:
  - Custom tools observed: [Y/N, details]
  - Commodity tools observed: [list]
  - Modifications to commodity tools: [observations]
```

### 3. Code Similarity Analysis

Analyze code patterns and similarities:

```
CODE SIMILARITY ANALYSIS
========================

Code Comparison Results:
| Code Element | Similar Known Sample | Similarity % | Significance |
|--------------|---------------------|--------------|--------------|
| [element] | [known sample/actor] | [%] | [HIGH/MED/LOW] |

□ Function-level similarities:
  - Matching functions: [list with context]
  - Code block matches: [list with context]

□ String similarities:
  - Matching strings/constants: [list]
  - Error message patterns: [list]
  - Configuration patterns: [list]

□ Structural similarities:
  - Similar code organization: [observations]
  - Matching class/function structures: [observations]
  - Configuration file formats: [observations]

□ Cryptographic implementation:
  - Algorithm choices: [observations]
  - Implementation quirks: [observations]
  - Key generation patterns: [observations]

Attribution Implications:
| Finding | Supports Hypothesis | Confidence |
|---------|---------------------|------------|
| [finding] | [actor hypothesis] | [H/M/L] |
```

### 4. Operational Pattern Analysis

Identify operational signatures:

```
OPERATIONAL PATTERN ANALYSIS
============================

Timing Analysis:
□ Activity timestamps:
  - UTC time distribution: [pattern]
  - Inferred working hours: [range]
  - Inferred timezone: [estimation with confidence]
  - Weekend/holiday patterns: [observations]

□ Campaign timing:
  - Campaign duration patterns: [observations]
  - Time between phases: [observations]
  - Reaction time to detection: [if applicable]

Procedural Analysis:
□ Initial access methodology:
  - Preferred entry vectors: [list]
  - Phishing characteristics: [if applicable]
  - Exploitation preferences: [if applicable]

□ Lateral movement patterns:
  - Tool preferences: [list]
  - Credential harvesting methods: [observations]
  - Pivot patterns: [observations]

□ Exfiltration methodology:
  - Data staging patterns: [observations]
  - Exfil channels used: [list]
  - Volume/timing patterns: [observations]

□ Cleanup/persistence:
  - Cleanup thoroughness: [assessment]
  - Persistence redundancy: [observations]
  - Logging manipulation: [observations]

Operational Security Assessment:
| OPSEC Element | Quality | Observations |
|---------------|---------|--------------|
| Infrastructure separation | [Good/Poor] | [details] |
| Tool customization | [High/Low] | [details] |
| Timestamp manipulation | [Present/Absent] | [details] |
| Language consistency | [Consistent/Varied] | [details] |
| Mistake indicators | [Present/Absent] | [details] |
```

### 5. Certificate and Protocol Analysis

Examine certificates and communication protocols:

```
CERTIFICATE ANALYSIS
====================

SSL/TLS Certificates:
| Domain | Issuer | Validity | Subject Details | Notable Fields |
|--------|--------|----------|-----------------|----------------|
| [domain] | [issuer] | [dates] | [CN, O, etc] | [anything unusual] |

□ Certificate patterns:
  - Preferred CAs: [list]
  - Self-signed usage: [Y/N, patterns]
  - Certificate validity periods: [patterns]
  - Subject field patterns: [observations]

□ Historical certificate analysis:
  - Previous certificates on same infrastructure: [findings]
  - Certificate reuse across domains: [findings]

Protocol Analysis:
□ C2 Protocol characteristics:
  - Protocol type: [HTTP/HTTPS/DNS/custom/etc]
  - Encryption: [type, implementation]
  - Encoding: [base64, custom, etc]
  - Beacon patterns: [interval, jitter]
  - Command structure: [observations]

□ Protocol fingerprinting:
  - Unique protocol signatures: [findings]
  - Known tool protocol matches: [findings]
  - Custom protocol indicators: [findings]
```

### 6. Technical Fingerprint Summary

Compile technical fingerprints:

```
TECHNICAL FINGERPRINT SUMMARY
=============================

Unique Identifiers Found:
| Category | Fingerprint | Distinctiveness | Actor Correlation |
|----------|-------------|-----------------|-------------------|
| Infrastructure | [fingerprint] | [unique/common] | [actor if known] |
| Malware | [fingerprint] | [unique/common] | [actor if known] |
| Code pattern | [fingerprint] | [unique/common] | [actor if known] |
| Operational | [fingerprint] | [unique/common] | [actor if known] |
| Protocol | [fingerprint] | [unique/common] | [actor if known] |

Hypothesis Validation:
| Hypothesis (from Step 1) | Technical Evidence | Updated Confidence |
|--------------------------|-------------------|-------------------|
| [hypothesis 1] | [+supporting/-contradicting/neutral] | [new level] |
| [hypothesis 2] | [+supporting/-contradicting/neutral] | [new level] |
| [hypothesis 3] | [+supporting/-contradicting/neutral] | [new level] |

New Hypotheses (if warranted):
- [any new attribution hypotheses based on technical findings]

Technical Gaps:
- [what technical analysis couldn't determine]
- [additional samples/data needed]
```

---

## STEP 2 OUTPUT

```markdown
## TECHNICAL FINGERPRINTING SUMMARY

### Infrastructure Assessment
- Domains analyzed: [count]
- IPs analyzed: [count]
- Known actor infrastructure overlap: [summary]

### Tool/Malware Assessment
- Samples analyzed: [count]
- Known tool matches: [list]
- Custom tools identified: [Y/N, details]

### Code Analysis
- Significant code similarities found: [Y/N]
- Known malware family correlation: [findings]
- Unique code signatures: [list]

### Operational Patterns
- Inferred timezone: [timezone with confidence]
- Working hours pattern: [summary]
- OPSEC assessment: [Good/Moderate/Poor]

### Hypothesis Update
| Rank | Actor | Previous Confidence | Updated Confidence | Change Reason |
|------|-------|--------------------|--------------------|---------------|
| 1 | [name] | [previous] | [updated] | [reason] |
| 2 | [name] | [previous] | [updated] | [reason] |
| 3 | [name] | [previous] | [updated] | [reason] |

### Key Technical Findings
1. [most significant finding]
2. [second most significant]
3. [third most significant]

### Collection Tasking for Next Steps
- Underground search terms: [based on findings]
- Persona identifiers to investigate: [based on findings]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 3:
- [ ] Infrastructure analysis complete
- [ ] All malware/tool samples examined
- [ ] Code similarity analysis performed
- [ ] Operational patterns documented
- [ ] Technical fingerprints cataloged
- [ ] Hypothesis confidence levels updated
- [ ] Underground search terms identified for Shadow

---

## MENU OPTIONS

**[C] Continue** - Proceed to underground correlation (Step 3)
**[D] Deep Dive** - Additional technical analysis on specific artifact
**[R] Re-analyze** - Review with additional context
**[V] Validate** - Cross-check specific finding

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-03-underground-correlation.md`
