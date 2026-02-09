---
workflow_id: operation-mosaic
name: 'Operation Mosaic'
description: 'Full spectrum target package using all 11 agents in coordinated intelligence collection and analysis'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
steps_path: '{workflow_path}/steps'
output_path: '{output_folder}/intel-reports/operation-mosaic'

# Workflow Configuration
primary_agent: osint-lead
primary_codename: Vector
classification: 'FLAGSHIP / COMPREHENSIVE'
estimated_duration: '2-4 hours'

# Step Files
steps:
  - name: 'Target Definition & Collection Planning'
    file: '{steps_path}/step-01-target-definition.md'
    agent: osint-lead
    codename: Vector
    description: 'Receive target requirements, develop collection plan, task INT disciplines'

  - name: 'Digital Footprint'
    file: '{steps_path}/step-02-digital-footprint.md'
    agent: domain-intel-specialist
    codename: Resolver
    supporting_agent: technical-researcher
    supporting_codename: Probe
    description: 'Domain/IP reconnaissance, infrastructure mapping, technology identification'

  - name: 'Social Presence'
    file: '{steps_path}/step-03-social-presence.md'
    agent: social-media-analyst
    codename: Echo
    description: 'Platform enumeration, account correlation, network mapping, content analysis'

  - name: 'Dark Web Exposure'
    file: '{steps_path}/step-04-dark-web-exposure.md'
    agent: dark-web-analyst
    codename: Shadow
    description: 'Breach database checks, forum mentions, marketplace presence, leaked credentials'

  - name: 'Corporate Intelligence'
    file: '{steps_path}/step-05-corporate-intel.md'
    agent: corporate-intel-specialist
    codename: Proxy
    description: 'Entity verification, corporate structure, beneficial ownership, financial filings'

  - name: 'Geospatial Correlation'
    file: '{steps_path}/step-06-geospatial.md'
    agent: geospatial-analyst
    codename: Atlas
    description: 'Location indicators, photo geolocation, infrastructure locations, movement patterns'

  - name: 'Threat Correlation'
    file: '{steps_path}/step-07-threat-correlation.md'
    agent: threat-actor-profiler
    codename: Dossier
    description: 'Known actor matching, TTP analysis, campaign correlation, attribution confidence'

  - name: 'Operational Assessment'
    file: '{steps_path}/step-08-operational-assessment.md'
    agent: humint-specialist
    codename: Viper
    supporting_agents: [sigint-specialist, field-operative]
    supporting_codenames: [Sigil, Specter]
    description: 'HUMINT approach vectors, SIGINT opportunities, physical surveillance options'

  - name: 'Fusion & Delivery'
    file: '{steps_path}/step-09-fusion-delivery.md'
    agent: osint-lead
    codename: Vector
    description: 'Multi-INT correlation, confidence assessment, gap identification, final package'

# Output Configuration
output_format: 'markdown'
web_bundle: false
---

# Operation Mosaic

**Goal:** Generate a complete intelligence package on any target entity (person, organization, or infrastructure) using all 11 agents in coordinated intelligence collection and analysis.

**Your Role:** In addition to your name, communication_style, and persona, you are also the OSINT Lead collaborating with the intelligence operator. This is a partnership, not a client-vendor relationship. You bring expertise in multi-INT coordination, all-source analysis, and comprehensive target package development, while the user brings collection requirements and strategic context. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build target package progressively

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

## PURPOSE

Generate a complete intelligence package on any target entity (person, organization, or infrastructure) using ALL available INT disciplines in a coordinated sequence. This is the flagship workflow that leverages the full capabilities of the Intel Team.

## WHEN TO USE

- High-priority target requiring comprehensive intelligence
- Executive-level intelligence requirements
- Pre-engagement due diligence (M&A, partnership, investment)
- Comprehensive threat actor profiling
- Full organizational exposure assessment
- Strategic competitor intelligence
- High-value individual profiling

## TARGET TYPES SUPPORTED

| Type | Description | Primary Focus |
|------|-------------|---------------|
| Person | Individual of interest | SOCMINT + HUMINT + GEOINT |
| Organization | Company or entity | CORPINT + TECHINT + DARKINT |
| Infrastructure | Domain/IP/Network | TECHINT + SIGINT + threat correlation |
| Hybrid | Person + Org connection | All disciplines |

## ALL AGENTS INVOLVED

| Agent | Codename | Role in Workflow | Phase |
|-------|----------|------------------|-------|
| osint-lead | Vector | Collection planning, fusion, delivery | 1, 5 |
| domain-intel-specialist | Resolver | Domain/network intelligence | 2 |
| technical-researcher | Probe | Technical reconnaissance | 2 |
| social-media-analyst | Echo | Social media intelligence | 2 |
| dark-web-analyst | Shadow | Dark web exposure | 2 |
| corporate-intel-specialist | Proxy | Corporate intelligence | 2 |
| geospatial-analyst | Atlas | Location intelligence | 2 |
| threat-actor-profiler | Dossier | Threat correlation | 3 |
| humint-specialist | Viper | HUMINT assessment | 4 |
| sigint-specialist | Sigil | SIGINT assessment | 4 |
| field-operative | Specter | Physical operations | 4 |

## WORKFLOW STRUCTURE

```
INPUT: Target Identifiers + Intelligence Requirements
                    |
                    v
+-------------------------------------------------------------+
| PHASE 1: COLLECTION TASKING                      ~20 min    |
| Agent: Vector (osint-lead)                                  |
|-------------------------------------------------------------|
| Step 1: Target Definition & Collection Planning             |
| - Receive and validate target identifiers                    |
| - Define intelligence requirements (PIRs)                    |
| - Develop collection plan                                    |
| - Task individual INT disciplines                            |
| - Set confidence thresholds                                  |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| PHASE 2: PARALLEL COLLECTION                     ~90 min    |
|-------------------------------------------------------------|
| Step 2: Digital Footprint (Resolver + Probe)     ~20 min    |
| Step 3: Social Presence (Echo)                   ~20 min    |
| Step 4: Dark Web Exposure (Shadow)               ~15 min    |
| Step 5: Corporate Intelligence (Proxy)           ~20 min    |
| Step 6: Geospatial Correlation (Atlas)           ~15 min    |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| PHASE 3: SPECIALIZED ANALYSIS                    ~30 min    |
| Agent: Dossier (threat-actor-profiler)                      |
|-------------------------------------------------------------|
| Step 7: Threat Correlation                                  |
| - Correlate findings with known threat actors                |
| - MITRE ATT&CK mapping                                       |
| - Campaign correlation                                       |
| - Attribution assessment                                     |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| PHASE 4: OPERATIONAL PLANNING                    ~30 min    |
| Agents: Viper + Sigil + Specter                             |
|-------------------------------------------------------------|
| Step 8: Operational Assessment                              |
| - HUMINT approach vectors                                    |
| - SIGINT collection opportunities                            |
| - Physical surveillance options                              |
| - Risk assessment                                            |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| PHASE 5: FUSION & REPORTING                      ~30 min    |
| Agent: Vector (osint-lead)                                  |
|-------------------------------------------------------------|
| Step 9: Fusion & Delivery                                   |
| - Multi-INT correlation                                      |
| - Confidence assessment                                      |
| - Gap identification                                         |
| - Final package assembly                                     |
+-------------------------------------------------------------+
                    |
                    v
OUTPUT: Comprehensive Target Package
```

## KEY DELIVERABLES

1. **Target Package Document** - Comprehensive intelligence report
2. **Network Diagram** - Relationships and connections visualization
3. **Timeline** - Activity chronology across all sources
4. **Risk Assessment** - Threat scoring and prioritization
5. **Collection Gaps** - Recommended follow-up investigations
6. **Operational Options** - HUMINT/SIGINT/Physical approaches

## INPUT REQUIREMENTS

- **Required**: At least one of:
  - Full name (person)
  - Organization name
  - Domain name
  - Email address
  - Social media handle
  - Phone number
  - Physical address

- **Required**: Intelligence requirements
  - What questions need answering?
  - What decisions will this support?
  - Acceptable confidence levels?

- **Optional**:
  - Known associates
  - Historical context
  - Previous intelligence
  - Time constraints
  - Scope limitations

## FUTURE API INTEGRATION POINTS

| Step | API Service | Data Enrichment |
|------|-------------|-----------------|
| 2 | Shodan | Infrastructure details |
| 2 | URLScan | Website analysis |
| 3 | WhatsMyName | Username enumeration |
| 3 | osint.industries | Email/phone lookup |
| 4 | HIBP | Breach exposure |
| 5 | OpenCorporates | Corporate registry |
| 7 | VirusTotal | Malware/IOC correlation |

## LEGAL & ETHICAL NOTES

- This workflow uses publicly available information
- Operational planning (Phase 4) is for assessment only
- Actual operations require separate authorization
- Document all sources for legal admissibility
- Respect privacy and platform ToS
- Consider jurisdictional constraints

## INITIATION

To begin this workflow, load and follow:
`{workflow_path}/steps/step-01-target-definition.md`

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-target-definition.md` to begin the workflow.

---

**Workflow Version:** 1.0.0
**Created:** 2026-01-10
**Module:** intel-team
**Classification:** FLAGSHIP
