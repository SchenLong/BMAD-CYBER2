---
name: 'step-03-correlation'
description: 'Correlate discovered nodes, identify overlaps, score relationships'
estimated_duration: '10-15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/spider-web'
thisStepFile: '{workflow_path}/steps/step-03-correlation.md'
nextStepFile: '{workflow_path}/steps/step-04-network-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-02-expansion.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 3: Node Correlation

## STEP GOAL

Merge discovered nodes from all expansion agents, identify overlaps and duplicates, score relationship strengths, and prepare the network for final synthesis.

## EXECUTION TIME: ~10-15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Vector**, Intelligence Operations Director
- You correlate findings from Resolver, Probe, and Echo
- You identify hidden connections between nodes
- You score relationship confidence and strength

### Step-Specific Rules

- Merge duplicate nodes carefully
- Look for non-obvious connections
- Score all relationships consistently
- Flag high-value targets for synthesis

---

## CORRELATION SEQUENCE

### 1. Node Deduplication

Identify and merge duplicate nodes discovered by different agents:

```
DEDUPLICATION RULES
===================

Same Entity Indicators:
□ Exact match (same identifier)
□ Email variations (john.smith@ vs jsmith@)
□ Domain variations (www.example.com vs example.com)
□ Username variations (@johnsmith vs johnsmith)
□ Name variations (John Smith vs J. Smith vs Smith, John)

Merge Actions:
1. Keep earliest discovered as primary
2. Add alternate identifiers as attributes
3. Combine relationship data
4. Note discovery sources
```

#### Deduplication Table

| Primary Node | Merged From | Evidence |
|--------------|-------------|----------|
| N004 (<admin@seed.com>) | N007 (dev email) | Same domain, admin contact |
| ... | ... | ... |

### 2. Cross-Agent Correlation

Look for connections between nodes discovered by different agents:

```
CORRELATION MATRIX
==================

        │ Resolver │  Probe  │  Echo   │
────────┼──────────┼─────────┼─────────┤
Resolver│    -     │ IP↔Svc  │ Org↔Ppl │
Probe   │ IP↔Svc   │    -    │ Git↔Dev │
Echo    │ Org↔Ppl  │ Git↔Dev │    -    │

Key Correlations:
□ Domain registrant ↔ LinkedIn profile
□ Git commit email ↔ Social account
□ Company website ↔ Employee list
□ IP infrastructure ↔ Service accounts
□ API keys/tokens ↔ Developer accounts
```

### 3. Relationship Scoring

Score each relationship on two dimensions:

#### Confidence Score (How certain is this connection?)

| Score | Label | Criteria |
|-------|-------|----------|
| 5 | Confirmed | Direct evidence, verified |
| 4 | High | Strong indicators, multiple sources |
| 3 | Medium | Reasonable inference, single source |
| 2 | Low | Weak indicators, circumstantial |
| 1 | Speculative | Possible but unverified |

#### Strength Score (How significant is this connection?)

| Score | Label | Criteria |
|-------|-------|----------|
| 5 | Critical | Core relationship, operational dependency |
| 4 | Strong | Significant relationship, regular interaction |
| 3 | Moderate | Notable connection, periodic interaction |
| 2 | Weak | Loose connection, minimal interaction |
| 1 | Tenuous | Distant connection, historical only |

### 4. Build Relationship Matrix

Create comprehensive relationship table:

```markdown
## RELATIONSHIP MATRIX

| Source | Target | Type | Confidence | Strength | Evidence |
|--------|--------|------|------------|----------|----------|
| N001 (seed.com) | N002 (John Smith) | owns | 5 | 5 | WHOIS registrant |
| N002 (John Smith) | N003 (@jsmith) | controls | 4 | 4 | Bio + email match |
| N001 (seed.com) | N004 (1.2.3.4) | hosted_on | 5 | 4 | DNS A record |
| N004 (1.2.3.4) | N005 (other.com) | co-hosted | 4 | 2 | Same IP |
| N002 (John Smith) | N006 (Jane Doe) | employs | 3 | 3 | LinkedIn connection |

### Relationship Types:
- owns / owned_by
- controls / controlled_by
- employs / employed_by
- hosted_on / hosts
- co-hosted
- associated_with
- member_of
- created_by / created
- communicates_with
- linked_to (generic)
```

### 5. Identify Key Patterns

Look for significant patterns in the network:

#### Centrality Analysis

```
HIGH CENTRALITY NODES (Many connections):
1. [Node] - [X connections] - [Significance]
2. [Node] - [X connections] - [Significance]
3. [Node] - [X connections] - [Significance]

These nodes are potential:
□ Key decision makers
□ Critical infrastructure
□ Information hubs
□ Single points of failure
```

#### Cluster Detection

```
IDENTIFIED CLUSTERS:

Cluster A: [Name/Theme]
- Nodes: N001, N004, N005, N008
- Binding factor: [What connects them]
- Significance: [Why this matters]

Cluster B: [Name/Theme]
- Nodes: N002, N003, N006
- Binding factor: [What connects them]
- Significance: [Why this matters]
```

#### Bridge Nodes

```
BRIDGE NODES (Connect clusters):

[Node] connects:
- Cluster A via [relationship]
- Cluster B via [relationship]
- Significance: [Why this matters]
```

### 6. Flag Priority Targets

Identify nodes warranting special attention:

```markdown
## PRIORITY TARGETS

### HIGH PRIORITY
| Node | Reason | Recommended Action |
|------|--------|-------------------|
| N002 | Central figure, controls multiple assets | Deep profile |
| N004 | Shared infrastructure, potential pivot point | Technical analysis |

### MEDIUM PRIORITY
| Node | Reason | Recommended Action |
|------|--------|-------------------|
| N006 | Bridge between clusters | Monitor |

### WATCH LIST
| Node | Reason | Recommended Action |
|------|--------|-------------------|
| N010 | Incomplete data, potentially significant | Further collection |
```

---

## CORRELATION OUTPUT

### Updated Node Inventory

```markdown
## NODE INVENTORY (Post-Correlation)

Total Nodes: [count]
Merged Duplicates: [count]
New Correlations Found: [count]

| ID | Type | Value | Depth | Connections | Priority |
|----|------|-------|-------|-------------|----------|
| N001 | Domain | seed.com | 0 | 8 | SEED |
| N002 | Person | John Smith | 1 | 12 | HIGH |
| N003 | Account | @jsmith | 1 | 5 | MEDIUM |
| ... | ... | ... | ... | ... | ... |
```

### Network Statistics

```
NETWORK METRICS
===============
Total Nodes: [X]
Total Relationships: [Y]
Average Connections: [Z]
Maximum Depth Reached: [D]

Node Types:
- Domains: [count]
- People: [count]
- Accounts: [count]
- Infrastructure: [count]
- Organizations: [count]

Relationship Types:
- Ownership: [count]
- Employment: [count]
- Technical: [count]
- Social: [count]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:

- [ ] All nodes deduplicated
- [ ] Cross-agent correlations identified
- [ ] All relationships scored
- [ ] Key patterns documented
- [ ] Priority targets flagged

---

## MENU OPTIONS

**[C] Continue** - Proceed to network synthesis (Step 4)
**[E] Expand More** - Return to Step 2 for additional expansion
**[R] Review** - Review correlation findings
**[A] Adjust** - Modify relationship scores or priorities

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-network-synthesis.md`
