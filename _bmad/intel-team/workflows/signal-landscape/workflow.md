---
name: 'signal-landscape'
description: 'SIGINT Opportunity Mapping - Map target electronic footprint and collection opportunities'
version: '1.0.0'
classification: 'SIGINT PLANNING'

# Workflow Configuration
workflow_path: '{project-root}/_bmad/intel-team/workflows/signal-landscape'
steps_path: '{workflow_path}/steps'
output_path: '{project-root}/_bmad-output/signal-landscape'

# Agent Sequence
agents:
  - sigint-specialist     # Sigil - Step 1: Communications Mapping
  - technical-researcher  # Probe - Step 2: Technical Vulnerability Assessment
  - domain-intel-specialist # Resolver - Step 3: Infrastructure Signal Points
  - geospatial-analyst    # Atlas - Step 4: Geographic Signal Mapping

# Execution Mode
execution_mode: 'sequential'
estimated_duration: '60 minutes'
web_bundle: false
---

# Signal Landscape

**Goal:** Map target's complete electronic footprint and identify signals intelligence collection opportunities, producing a comprehensive assessment of communication patterns, technical vulnerabilities, infrastructure signals, and geographic collection positions.

**Your Role:** In addition to your name, communication_style, and persona, you are also a SIGINT Specialist collaborating with the intelligence operator. This is a partnership, not a client-vendor relationship. You bring expertise in signals analysis, electronic footprint mapping, and communications pattern analysis, while the user brings target context and collection priorities. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build signal map progressively

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

## SIGINT Opportunity Mapping

## PURPOSE

Map target's complete electronic footprint and identify signals intelligence collection opportunities. This workflow produces a comprehensive assessment of communication patterns, technical vulnerabilities, infrastructure signals, and geographic collection positions.

## TARGET SCOPE

This workflow applies to:
- Individual targets with significant electronic presence
- Organizations with network infrastructure
- Facilities requiring electronic surveillance planning
- Networks of interest for communication analysis

## WORKFLOW SEQUENCE

```
INPUT: Target Identifiers + Geographic Focus
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ SIGIL (sigint-specialist)                                   │
│ Step 1: Communications Mapping                              │
│ Known communication platforms, device identification,       │
│ encryption assessment, pattern analysis, RF opportunities   │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ PROBE (technical-researcher)                                │
│ Step 2: Technical Vulnerability Assessment                  │
│ Service enumeration, protocol analysis, API exposure,       │
│ cloud services, IoT device identification                   │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ RESOLVER (domain-intel-specialist)                          │
│ Step 3: Infrastructure Signal Points                        │
│ Email server config, DNS leaks, network topology,           │
│ CDN/proxy identification                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ ATLAS (geospatial-analyst)                                  │
│ Step 4: Geographic Signal Mapping                           │
│ Physical infrastructure, cell coverage, WiFi environment,   │
│ collection position analysis                                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: SIGINT Collection Plan
```

## SIGNALS INTELLIGENCE FRAMEWORK

| Category | Collection Focus | Sources |
|----------|------------------|---------|
| **COMINT** | Communications content | Intercept, metadata |
| **ELINT** | Electronic emissions | Radar, RF emissions |
| **FISINT** | Instrumentation signals | Telemetry, data links |
| **SIGINT Metadata** | Traffic analysis | Patterns, relationships |

## LEGAL CONSIDERATIONS

| Jurisdiction | Authorization Required | Key Constraints |
|--------------|----------------------|-----------------|
| Domestic | Warrant/Court Order | Constitutional protections |
| Foreign | FISA/Intelligence authorities | Minimization procedures |
| International | Bilateral agreements | Host nation law |
| Commercial | Varies | Privacy regulations (GDPR, etc.) |

**CRITICAL:** All collection must be authorized and legal. This workflow produces planning intelligence only.

## OUTPUT ARTIFACTS

- **Signal Environment Map**
- **Collection Opportunities** (ranked by feasibility/value)
- **Equipment Requirements**
- **Legal/Authorization Considerations**
- **Operational Security Assessment**

## INTEGRATION WITH OTHER WORKFLOWS

| Workflow | When to Use | Synergy |
|----------|-------------|---------|
| **Pattern of Life** | Pre-requisite | Behavioral patterns inform timing |
| **Ground Truth** | Post-SIGINT planning | Electronic environment assessment |
| **Operation Mosaic** | Large campaigns | SIGINT as component |
| **Tripwire** | Monitoring phase | Signals for alerting |

---

## EXECUTION

To begin this workflow, load and follow: `{workflow_path}/steps/step-01-communications-mapping.md`

---

## STEP NAVIGATION

| Step | Agent | Step File |
|------|-------|-----------|
| 1 | Sigil | step-01-communications-mapping.md |
| 2 | Probe | step-02-technical-vulnerability.md |
| 3 | Resolver | step-03-infrastructure-signals.md |
| 4 | Atlas | step-04-geographic-mapping.md |

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-communications-mapping.md` to begin the workflow.
