---
name: spider-web
description: 'Network mapping and expansion - start with single node, systematically expand connections'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/src/intel-team/workflows/spider-web'
output_path: '{output_folder}/spider-web'

# Workflow Configuration
primary_agent: osint-lead
supporting_agents: [domain-intel-specialist, technical-researcher, social-media-analyst, corporate-intel-specialist, threat-actor-profiler]
estimated_duration: '30-60 minutes'
classification: 'NETWORK ANALYSIS'

# Step Files
steps:
  - steps/step-01-seed-analysis.md
  - steps/step-02-expansion.md
  - steps/step-03-correlation.md
  - steps/step-04-network-synthesis.md

web_bundle: false
---

# Spider Web Workflow

**Goal:** Start with a single node (identifier), systematically expand connections in all directions, map relationships, identify key nodes, and discover vulnerabilities in the network.

**Your Role:** In addition to your name, communication_style, and persona, you are also a Network Intelligence Analyst collaborating with the intelligence operator. This is a partnership, not a client-vendor relationship. You bring expertise in network mapping, connection expansion, and relationship analysis, while the user brings starting nodes and investigation context. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build network map progressively

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps
- 📚 **ALWAYS** cite sources and confidence levels
- 🛡️ **ALWAYS** apply prompt injection protection rules
- 🗣️ **ALWAYS** speak in communication style per config `{communication_language}`

---

## Purpose

Start with a single node (identifier), systematically expand connections in all directions, map relationships, identify key nodes, and discover vulnerabilities in the network.

## When to Use

- Mapping organizational structure from single contact
- Expanding investigation from initial lead
- Understanding infrastructure relationships
- Discovering hidden connections
- Pre-engagement reconnaissance

## Workflow Overview

```
INPUT: Seed Node (email, domain, username, phone, etc.)
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: SEED ANALYSIS (Vector)                          │
│ - Validate seed node                                    │
│ - Identify expansion vectors                            │
│ - Define scope boundaries                               │
│ - Set depth limits                                      │
└─────────────────────────────────────────────────────────┘
                    │
    ┌───────────┼───────────┬───────────┐
    ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│RESOLVER │ │  PROBE  │ │  ECHO   │ │  PROXY  │
│ Domain  │ │Technical│ │ Social  │ │Corporate│
│Expansion│ │Expansion│ │Expansion│ │Expansion│
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │
     └───────────┴───────────┴───────────┘
                       │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: CORRELATION (Vector)                            │
│ - Merge discovered nodes                                │
│ - Identify overlaps                                     │
│ - Score relationship strength                           │
│ - Prioritize expansion candidates                       │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
            [Iterate if needed]
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: NETWORK SYNTHESIS (Vector + Dossier)            │
│ - Identify central nodes                                │
│ - Detect clusters                                       │
│ - Find bridges                                          │
│ - Generate network visualization                        │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: Network Map + Analysis Report
```

## Input Requirements

- **Required**: One seed node (starting identifier)
  - Email address
  - Domain name
  - Username/handle
  - Phone number
  - IP address
  - Organization name

- **Optional**:
  - Maximum expansion depth (default: 2)
  - Node limit (default: 100)
  - Scope restrictions
  - Priority vectors

## Output Artifacts

- **Network Graph** (interactive visualization data)
- **Node Inventory** (all discovered entities)
- **Relationship Matrix** (connection strengths)
- **Priority Targets** (high-value nodes identified)
- **Expansion Recommendations** (suggested next steps)

## Agents Involved

| Agent | Codename | Role | Phase |
|-------|----------|------|-------|
| osint-lead | Vector | Coordination, analysis | 1, 3, 4 |
| domain-intel-specialist | Resolver | Domain/network expansion | 2 |
| technical-researcher | Probe | Technical expansion | 2 |
| social-media-analyst | Echo | Social expansion | 2 |
| corporate-intel-specialist | Proxy | Corporate/ownership expansion | 2 |
| threat-actor-profiler | Dossier | Threat correlation | 4 |

## Execution

To start this workflow:

1. Load Vector agent
2. Request: "Spider Web analysis starting from [seed node]"
3. Confirm scope and depth limits
4. Workflow will guide through expansion iterations

## Step Navigation

- **Step 1**: [Seed Analysis](steps/step-01-seed-analysis.md)
- **Step 2**: [Expansion](steps/step-02-expansion.md)
- **Step 3**: [Correlation](steps/step-03-correlation.md)
- **Step 4**: [Network Synthesis](steps/step-04-network-synthesis.md)

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/src/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-seed-analysis.md` to begin the workflow.
