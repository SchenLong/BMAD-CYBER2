---
name: 'step-04-network-synthesis'
description: 'Final network analysis, visualization, and report generation'
estimated_duration: '10-15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/spider-web'
thisStepFile: '{workflow_path}/steps/step-04-network-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-03-correlation.md'
outputFile: '{output_path}/spider-web-{target}-{timestamp}.md'

# Agent Configuration
executing_agents:
  - osint-lead           # Vector - synthesis
  - threat-actor-profiler # Dossier - threat assessment
---

# Step 4: Network Synthesis

## STEP GOAL

Perform final network analysis, assess threats, generate visualization data, and produce the comprehensive Spider Web report.

## EXECUTION TIME: ~10-15 minutes

## MANDATORY EXECUTION RULES

### Agent Roles
- **Vector** (osint-lead): Final synthesis and report generation
- **Dossier** (threat-actor-profiler): Threat assessment of key nodes

### Step-Specific Rules
- Produce actionable intelligence
- Identify vulnerabilities and opportunities
- Generate visualization-ready data
- Provide clear recommendations

---

## SYNTHESIS SEQUENCE

### 1. Network Analysis (Vector)

#### Centrality Metrics

Calculate importance metrics for key nodes:

```
CENTRALITY ANALYSIS
===================

Degree Centrality (Most connected):
1. [Node] - [X] direct connections
2. [Node] - [X] direct connections
3. [Node] - [X] direct connections

Betweenness Centrality (Bridge positions):
1. [Node] - Controls [X]% of shortest paths
2. [Node] - Controls [X]% of shortest paths

Closeness Centrality (Information flow):
1. [Node] - Average [X] hops to all nodes
2. [Node] - Average [X] hops to all nodes

INTERPRETATION:
- [Node] is the most connected entity
- [Node] is critical for network cohesion
- Removing [Node] would fragment the network
```

#### Vulnerability Assessment

```
NETWORK VULNERABILITIES
=======================

Single Points of Failure:
□ [Node] - If compromised/removed: [Impact]
□ [Node] - If compromised/removed: [Impact]

Weak Links:
□ [Relationship] - Low confidence, critical position
□ [Relationship] - Unverified but significant

Information Choke Points:
□ [Node] - Controls flow between [Cluster A] and [Cluster B]

Exposed Assets:
□ [Node] - Publicly accessible, high value
□ [Node] - Minimal security indicators
```

### 2. Threat Assessment (Dossier)

Evaluate threat implications for high-priority nodes:

```
THREAT ASSESSMENT
=================

For each HIGH PRIORITY node:

[Node Name/ID]
├── Known Threat Associations: [Yes/No]
│   └── [Details if yes]
├── Targeting Indicators: [None/Low/Medium/High]
│   └── [Evidence]
├── Compromise Indicators: [None/Suspected/Confirmed]
│   └── [Evidence]
└── Risk Level: [LOW/MEDIUM/HIGH/CRITICAL]
    └── [Justification]

OVERALL NETWORK THREAT LEVEL: [Assessment]
```

### 3. Generate Visualization Data

Create structured data for network visualization:

```json
{
  "nodes": [
    {
      "id": "N001",
      "label": "seed.com",
      "type": "domain",
      "priority": "seed",
      "depth": 0,
      "connections": 8
    },
    {
      "id": "N002",
      "label": "John Smith",
      "type": "person",
      "priority": "high",
      "depth": 1,
      "connections": 12
    }
  ],
  "edges": [
    {
      "source": "N001",
      "target": "N002",
      "type": "owned_by",
      "confidence": 5,
      "strength": 5
    }
  ],
  "clusters": [
    {
      "id": "C1",
      "name": "Infrastructure",
      "nodes": ["N001", "N004", "N005"]
    }
  ],
  "metadata": {
    "seed": "seed.com",
    "generated": "2026-01-10T12:00:00Z",
    "total_nodes": 25,
    "total_edges": 42,
    "max_depth": 2
  }
}
```

### 4. Identify Opportunities

```
OPERATIONAL OPPORTUNITIES
=========================

Intelligence Collection:
□ [Node] - Good target for further OSINT
□ [Relationship] - May reveal additional connections

Approach Vectors:
□ Via [Node] - [Reason this is a good entry point]
□ Via [Relationship] - [Opportunity description]

Monitoring Targets:
□ [Node] - Changes here would be significant
□ [Relationship] - Watch for changes in this connection

Follow-up Investigations:
□ [Recommended workflow] for [Node/Cluster]
□ [Recommended workflow] for [specific question]
```

---

## OUTPUT: SPIDER WEB REPORT

Generate the comprehensive report:

```markdown
# SPIDER WEB ANALYSIS REPORT

**Seed Node:** [identifier]
**Generated:** [timestamp]
**Analyst:** Vector (Intel Team)
**Duration:** [total time]

---

## EXECUTIVE SUMMARY

[2-3 paragraph summary of key findings]

- **Network Size:** [X] nodes, [Y] relationships
- **Key Finding 1:** [One sentence]
- **Key Finding 2:** [One sentence]
- **Key Finding 3:** [One sentence]
- **Overall Risk Assessment:** [LOW/MEDIUM/HIGH]

---

## NETWORK OVERVIEW

### Statistics
| Metric | Value |
|--------|-------|
| Total Nodes | [X] |
| Total Relationships | [Y] |
| Maximum Depth | [Z] |
| Clusters Identified | [N] |

### Node Distribution
| Type | Count | % |
|------|-------|---|
| Domains | [X] | [%] |
| People | [X] | [%] |
| Accounts | [X] | [%] |
| Infrastructure | [X] | [%] |
| Organizations | [X] | [%] |

---

## KEY ENTITIES

### High-Priority Targets

#### 1. [Node Name]
- **Type:** [type]
- **Identifier:** [value]
- **Connections:** [count]
- **Centrality:** [metric]
- **Significance:** [why this node matters]
- **Threat Level:** [assessment]

#### 2. [Node Name]
[Same format]

#### 3. [Node Name]
[Same format]

---

## NETWORK STRUCTURE

### Clusters Identified

#### Cluster: [Name]
- **Nodes:** [list]
- **Theme:** [what binds them]
- **Key Entity:** [central node]
- **Significance:** [why this cluster matters]

#### Cluster: [Name]
[Same format]

### Bridge Connections
| Bridge Node | Connects | Significance |
|-------------|----------|--------------|
| [Node] | [Cluster A] ↔ [Cluster B] | [Why important] |

---

## THREAT ASSESSMENT

### Threat Indicators
| Node | Threat Level | Indicators | Notes |
|------|--------------|------------|-------|
| [Node] | HIGH | [indicators] | [notes] |
| [Node] | MEDIUM | [indicators] | [notes] |

### Vulnerabilities Identified
1. **[Vulnerability]** - [Description and impact]
2. **[Vulnerability]** - [Description and impact]

---

## VISUALIZATION DATA

[JSON block or reference to separate file]

---

## COMPLETE NODE INVENTORY

| ID | Type | Value | Depth | Connections | Priority |
|----|------|-------|-------|-------------|----------|
| N001 | Domain | seed.com | 0 | 8 | SEED |
| N002 | Person | John Smith | 1 | 12 | HIGH |
| ... | ... | ... | ... | ... | ... |

---

## COMPLETE RELATIONSHIP MATRIX

| Source | Target | Type | Confidence | Strength |
|--------|--------|------|------------|----------|
| N001 | N002 | owned_by | 5 | 5 |
| ... | ... | ... | ... | ... |

---

## RECOMMENDATIONS

### Immediate Actions
1. [Action] - [Reason]
2. [Action] - [Reason]

### Follow-up Investigations
1. **[Workflow]** - [Target/Question]
2. **[Workflow]** - [Target/Question]

### Monitoring Recommendations
1. [What to monitor] - [Why]
2. [What to monitor] - [Why]

---

## COLLECTION GAPS

Areas not fully explored:
1. [Gap] - [Limitation/Reason]
2. [Gap] - [Limitation/Reason]

---

## ANALYST NOTES

[Additional observations, caveats, or context]

---

*Generated by Intel Team Spider Web Workflow v1.0*
*Classification: [as appropriate]*
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] Network analysis complete
- [ ] Threat assessment performed
- [ ] Visualization data generated
- [ ] All recommendations documented
- [ ] Report generated and saved

---

## WORKFLOW COMPLETE

**Spider Web analysis finished.**

### Output Files
1. Report: `{output_path}/spider-web-[seed]-[timestamp].md`
2. Visualization: `{output_path}/spider-web-[seed]-[timestamp].json`

### Next Actions

**[S] Save & Exit** - Save report and complete workflow
**[V] Visualize** - Generate network graph (if tooling available)
**[D] Deep-Dive** - Launch recommended follow-up workflow
**[PM] Party Mode** - Convene Intel Team for discussion

---

*Spider Web Workflow v1.0 - Intel Team Module*
