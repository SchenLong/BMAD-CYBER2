---
name: 'step-01-seed-analysis'
description: 'Analyze seed node, identify expansion vectors, set scope boundaries'
estimated_duration: '5-10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/spider-web'
thisStepFile: '{workflow_path}/steps/step-01-seed-analysis.md'
nextStepFile: '{workflow_path}/steps/step-02-expansion.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 1: Seed Analysis

## STEP GOAL

Analyze the seed node to understand its nature, identify all possible expansion vectors, and establish scope boundaries for the network mapping operation.

## EXECUTION TIME: ~5-10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, Intelligence Operations Director
- You analyze the seed and plan the expansion strategy
- You set boundaries to prevent scope creep
- You identify the most promising expansion vectors

### Step-Specific Rules
- Fully characterize the seed before expanding
- Identify ALL potential expansion vectors
- Set realistic depth and node limits
- Document assumptions and boundaries

---

## SEED ANALYSIS SEQUENCE

### 1. Validate & Characterize Seed Node

Determine seed type and extract metadata:

| Seed Type | Characterization Tasks |
|-----------|----------------------|
| **Email** | Extract domain, identify provider type (corporate/personal), check format patterns |
| **Domain** | Identify registrar, hosting, purpose (corporate/personal/service) |
| **Username** | Determine platform origin, pattern analysis, uniqueness assessment |
| **Phone** | Country code, carrier type, VoIP indicators |
| **IP Address** | Geolocation, ASN, hosting/residential classification |
| **Organization** | Industry, size estimate, geographic presence |

### 2. Identify Expansion Vectors

For each seed type, map available expansion paths:

#### Email Seed Expansion
```
email@domain.com
    │
    ├── Domain → RESOLVER
    │   ├── WHOIS (registrant, admin, tech contacts)
    │   ├── DNS (MX, NS, TXT records)
    │   ├── Subdomains
    │   └── SSL certificates (SANs)
    │
    ├── Username (before @) → ECHO
    │   ├── Social platform search
    │   ├── Code repository search
    │   └── Forum/community search
    │
    └── Breach lookup → SHADOW (if follow-up)
        ├── Associated passwords (existence only)
        ├── Other emails in same breaches
        └── Related accounts
```

#### Domain Seed Expansion
```
example.com
    │
    ├── Registration → RESOLVER
    │   ├── WHOIS history
    │   ├── Registrant correlation
    │   └── Related domains (same registrant)
    │
    ├── Infrastructure → PROBE
    │   ├── IP addresses (current/historical)
    │   ├── Hosting provider
    │   ├── Technology stack
    │   └── APIs/services
    │
    ├── DNS → RESOLVER
    │   ├── MX records → email infrastructure
    │   ├── TXT records → services (SPF, DKIM)
    │   └── Subdomains → additional services
    │
    └── Social → ECHO
        ├── Corporate social accounts
        ├── Employee LinkedIn
        └── Mentions/references
```

#### Username Seed Expansion
```
username123
    │
    ├── Platform Search → ECHO
    │   ├── All major social platforms
    │   ├── Dating sites
    │   ├── Gaming platforms
    │   └── Forums/communities
    │
    ├── Code Repositories → PROBE
    │   ├── GitHub/GitLab
    │   ├── Commit history
    │   └── Collaborators
    │
    └── Variations → ECHO
        ├── Common modifications (123, _official)
        ├── Platform-specific formats
        └── Historical handles
```

### 3. Define Scope Boundaries

Establish limits to prevent infinite expansion:

```
SCOPE CONFIGURATION
==================
Maximum Depth: [1-3, default: 2]
  └── Depth 1: Direct connections to seed
  └── Depth 2: Connections of connections
  └── Depth 3: Three degrees of separation

Maximum Nodes: [50-500, default: 100]
  └── Total entities to discover before stopping

Time Budget: [30-120 minutes, default: 60]
  └── Hard stop for expansion phase

Geographic Scope: [Global/Regional/Local]
  └── Limit to specific regions if relevant

Exclusions:
  └── [List any domains/platforms to skip]
  └── [Privacy-protected entities to respect]
```

### 4. Prioritize Expansion Vectors

Rank vectors by expected value:

| Priority | Criteria |
|----------|----------|
| **HIGH** | Likely to yield multiple new nodes, unique data |
| **MEDIUM** | May yield new nodes, confirmatory data |
| **LOW** | Unlikely to expand network significantly |

### 5. Initialize Network Document

Create the working network map:

```markdown
# SPIDER WEB ANALYSIS

**Seed Node:** [identifier]
**Seed Type:** [email/domain/username/etc.]
**Started:** [timestamp]

---

## SCOPE PARAMETERS
- **Max Depth:** [value]
- **Max Nodes:** [value]
- **Time Budget:** [value]
- **Geographic Scope:** [value]

---

## EXPANSION VECTORS (Prioritized)

### HIGH Priority
1. [Vector 1] - [Agent: Resolver/Probe/Echo]
2. [Vector 2] - [Agent]

### MEDIUM Priority
3. [Vector 3] - [Agent]
4. [Vector 4] - [Agent]

### LOW Priority
5. [Vector 5] - [Agent]

---

## NODE INVENTORY

| ID | Type | Value | Source | Depth | Status |
|----|------|-------|--------|-------|--------|
| N001 | [seed type] | [seed value] | SEED | 0 | Analyzed |

---

## RELATIONSHIP MATRIX

(To be populated during expansion)

---
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Seed node fully characterized
- [ ] All expansion vectors identified
- [ ] Vectors prioritized by value
- [ ] Scope boundaries established
- [ ] Network document initialized

---

## MENU OPTIONS

**[C] Continue** - Proceed to expansion (Step 2)
**[A] Adjust Scope** - Modify boundaries or priorities
**[X] Cancel** - Abort workflow

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/step-02-expansion.md`
