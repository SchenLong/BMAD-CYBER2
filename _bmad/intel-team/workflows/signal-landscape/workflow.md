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
---

# Signal Landscape
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

To begin this workflow, load and execute: `{workflow_path}/steps/step-01-communications-mapping.md`

---

## STEP NAVIGATION

| Step | Agent | Step File |
|------|-------|-----------|
| 1 | Sigil | step-01-communications-mapping.md |
| 2 | Probe | step-02-technical-vulnerability.md |
| 3 | Resolver | step-03-infrastructure-signals.md |
| 4 | Atlas | step-04-geographic-mapping.md |

