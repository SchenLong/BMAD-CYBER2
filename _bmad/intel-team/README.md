# Intelligence Operations Team

A comprehensive intelligence operations module providing specialized agents for OSINT, HUMINT, SIGINT, GEOINT, and field operations, enabling coordinated multi-discipline intelligence collection, analysis, and reporting for accredited professionals.

## Overview

This module provides:

- **11 Elite Intelligence Agents** - Specialized personas with authentic military/IC backgrounds
- **20 Production Workflows** - Complete intelligence operations from rapid triage to full campaigns
- **Multi-INT Coordination** - All agents collaborate via Party Mode for intelligence fusion
- **Comprehensive Tradecraft** - Integrated knowledgebase covering all intelligence disciplines
- **OSINT Specialization** - Deep digital intelligence capabilities (domain, SOCMINT, DARKINT, TECHINT)
- **Traditional INT Disciplines** - HUMINT, SIGINT, GEOINT expertise
- **Field Operations** - Surveillance, counter-surveillance, and site reconnaissance

**Target Audience:** Intelligence professionals, investigators, security researchers, red team operators, and threat intelligence analysts with appropriate authorization.

## Installation

Install the module using BMAD:

```bash
bmad install intel-team
```

## Components

### Agents (11)

| Codename | Title | Specialty |
|----------|-------|-----------|
| **Vector** | Intelligence Operations Director | All-source intelligence coordination, collection management |
| **Resolver** | Domain Intelligence Specialist | DNS analysis, infrastructure mapping, network reconnaissance |
| **Echo** | Social Media Intelligence Analyst | Platform analysis, influence operations, persona identification |
| **Shadow** | Dark Web Intelligence Analyst | Tor/I2P navigation, marketplace monitoring, crypto tracing |
| **Atlas** | Geospatial Intelligence Analyst | Imagery analysis, geolocation, pattern of life mapping |
| **Probe** | Technical Reconnaissance Specialist | Technology fingerprinting, vulnerability research, TECHINT |
| **Dossier** | Threat Actor Profiler | APT attribution, MITRE ATT&CK mapping, campaign analysis |
| **Viper** | Human Intelligence Specialist | Elicitation, source assessment, rapport building, MICE framework |
| **Sigil** | Signals Intelligence Specialist | RF reconnaissance, communications analysis, TSCM |
| **Specter** | Field Operations Specialist | Surveillance, SDRs, site reconnaissance, cover development |
| **Proxy** | Corporate Intelligence Specialist | Business registries, beneficial ownership, financial intelligence |

### Workflows (20)

#### Rapid Response

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **flash-assessment** | 3 | Quick 15-minute assessment with immediate OSINT hits and first-look risk |

#### Individual Investigation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **campaign-planner-person** | 5 | Full intelligence campaign against individual targets |
| **doppelganger-hunt** | 4 | Behavioral pattern analysis and identity verification |
| **digital-necromancy** | 4 | Historical digital footprint recovery and timeline reconstruction |

#### Organization Investigation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **campaign-planner-org** | 9 | Comprehensive organizational intelligence campaign |
| **operation-mosaic** | 9 | Full-spectrum organizational assessment |
| **spider-web** | 4 | Network relationship mapping and affiliation analysis |

#### Technical Intelligence

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **infrastructure-genealogy** | 5 | Infrastructure ownership history and evolution tracking |
| **signal-landscape** | 4 | SIGINT opportunity mapping and communications analysis |
| **breach-archaeology** | 4 | Historical breach and exposure analysis |

#### Threat Intelligence

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **attribution-chain** | 6 | Multi-source threat actor attribution |
| **threat-constellation** | 5 | Threat actor ecosystem mapping |

#### Behavioral Analysis

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **pattern-of-life** | 4 | Temporal, spatial, and behavioral baseline development |
| **approach-vector** | 4 | Target approach planning and HUMINT preparation |

#### Field Operations

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **ground-truth** | 5 | Field operation preparation and site reconnaissance planning |
| **counter-intel-audit** | 6 | Counter-intelligence vulnerability assessment |

#### Intelligence Fusion

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **the-synthesis** | 4 | All-source intelligence fusion and product assembly |
| **campaign-ai** | 8 | AI-driven autonomous intelligence campaign |

#### Monitoring & Alerting

| Workflow | Steps | Purpose |
|----------|-------|---------|
| **tripwire** | 5 | Continuous monitoring and alerting configuration |

## Quick Start

1. **Load the primary agent (Vector):**

   ```
   /bmad:intel-team:agents:osint-lead
   ```

2. **Or load any specialist directly:**

   ```
   /bmad:intel-team:agents:humint-specialist    # Viper - HUMINT
   /bmad:intel-team:agents:sigint-specialist    # Sigil - SIGINT
   /bmad:intel-team:agents:field-operative      # Specter - Field Ops
   /bmad:intel-team:agents:corporate-intel-specialist  # Proxy - CORPINT
   ```

3. **Run a workflow:**

   ```
   /bmad:intel-team:workflows:flash-assessment   # Rapid triage
   /bmad:intel-team:workflows:campaign-ai        # Full AI campaign
   /bmad:intel-team:workflows:the-synthesis      # Intelligence fusion
   /bmad:intel-team:workflows:tripwire           # Monitoring setup
   ```

4. **Collaborate with multiple agents:**

   Load any agent and select **[PM] Intel Team Roundtable** from the menu to initiate Party Mode for multi-INT fusion discussions.

## Workflow Categories

### By Use Case

| Use Case | Recommended Workflow |
|----------|---------------------|
| Quick triage on new target | flash-assessment |
| Full person investigation | campaign-planner-person |
| Organization deep-dive | campaign-planner-org or operation-mosaic |
| Threat actor analysis | attribution-chain or threat-constellation |
| Infrastructure research | infrastructure-genealogy |
| Pre-HUMINT planning | approach-vector + pattern-of-life |
| Field operation prep | ground-truth |
| Continuous monitoring | tripwire |
| Final product assembly | the-synthesis |

### By Intelligence Discipline

| Discipline | Primary Workflows |
|------------|------------------|
| OSINT | flash-assessment, operation-mosaic, spider-web |
| SOCMINT | doppelganger-hunt, pattern-of-life |
| TECHINT | infrastructure-genealogy, signal-landscape |
| DARKINT | breach-archaeology, threat-constellation |
| HUMINT | approach-vector, campaign-planner-person |
| SIGINT | signal-landscape, counter-intel-audit |
| GEOINT | ground-truth, pattern-of-life |
| CORPINT | spider-web, campaign-planner-org |

## Module Structure

```
intel-team/
├── agents/                    # Agent definitions (11 agents)
│   ├── osint-lead.md
│   ├── domain-intel-specialist.md
│   ├── social-media-analyst.md
│   ├── dark-web-analyst.md
│   ├── geospatial-analyst.md
│   ├── technical-researcher.md
│   ├── threat-actor-profiler.md
│   ├── humint-specialist.md
│   ├── sigint-specialist.md
│   ├── field-operative.md
│   └── corporate-intel-specialist.md
├── workflows/                 # Workflow folders (20 workflows)
│   ├── flash-assessment/
│   ├── campaign-planner-person/
│   ├── campaign-planner-org/
│   ├── operation-mosaic/
│   ├── spider-web/
│   ├── doppelganger-hunt/
│   ├── digital-necromancy/
│   ├── infrastructure-genealogy/
│   ├── signal-landscape/
│   ├── breach-archaeology/
│   ├── attribution-chain/
│   ├── threat-constellation/
│   ├── pattern-of-life/
│   ├── approach-vector/
│   ├── ground-truth/
│   ├── counter-intel-audit/
│   ├── the-synthesis/
│   ├── campaign-ai/
│   ├── tripwire/
│   └── intel-team-workflow-designs.md
├── tasks/                     # Task files
├── templates/                 # Shared templates
├── data/                      # Knowledgebase and data files
├── _module-installer/         # Installation scripts
├── module.yaml                # Config and install questions
├── README.md                  # This file
└── TODO.md                    # Development roadmap
```

## Configuration

The module can be configured in `_bmad/intel-team/config.yaml`

**Key Settings:**

- **output_folder**: Where intelligence reports and outputs are saved (default: `_bmad-output/intel-team`)
- **collection_artifacts**: Collection-phase outputs
- **analysis_artifacts**: Analysis and synthesis outputs
- **reports**: Final intelligence reports

## Examples

### Example 1: Rapid Triage on New Target

```
1. Run: /bmad:intel-team:workflows:flash-assessment
2. Provide target identifier
3. Get immediate OSINT hits in 15 minutes
4. Decide on follow-up investigation scope
```

### Example 2: Full Organizational Campaign

```
1. Run: /bmad:intel-team:workflows:campaign-ai
2. AI-driven 8-phase campaign executes
3. All 11 agents contribute to phases
4. Produces comprehensive intelligence package
```

### Example 3: Multi-INT Fusion Analysis

```
1. Load Vector: /bmad:intel-team:agents:osint-lead
2. Select [PM] Intel Team Roundtable
3. Brief the team on your intelligence requirement
4. Specialists provide discipline-specific insights
5. Run: /bmad:intel-team:workflows:the-synthesis
6. Vector synthesizes into all-source assessment
```

### Example 4: Threat Actor Attribution

```
1. Run: /bmad:intel-team:workflows:attribution-chain
2. Provide indicators and TTPs
3. 6-step attribution process executes
4. Receive confidence-weighted attribution assessment
```

### Example 5: Continuous Monitoring Setup

```
1. Run: /bmad:intel-team:workflows:tripwire
2. Configure monitoring across 5 domains
3. Set alert thresholds and notification rules
4. Receive ongoing intelligence updates
```

## Development Status

This module is currently at v1.1:

- [x] Module structure created
- [x] Installer configured (module.yaml)
- [x] 11 agents implemented with full personas
- [x] Agent menus and prompts defined
- [x] 20 workflows implemented
- [ ] Service integrations (v1.2)
- [ ] MCP architecture (v1.3)
- [ ] Cross-module integration (v1.4)

## Version Roadmap

| Version | Focus | Status |
|---------|-------|--------|
| v1.0 | 11 Agents | ✅ Complete |
| **v1.1** | **20 Workflows** | ✅ **Current** |
| v1.2 | osint.industries API, WhatsMyName | Planned |
| v1.3 | MCP architecture | Planned |
| v1.4 | cybersec-team integration | Planned |

## Contributing

To extend this module:

1. Add new agents using `/bmad:bmb:workflows:agent`
2. Add new workflows using `/bmad:bmb:workflows:create-workflow`
3. Update the installer configuration if needed
4. Test thoroughly with Party Mode coordination

## Requirements

- BMAD Method version 6.0.0 or higher
- No external dependencies for v1.1

## Author

Created by J on 2026-01-10

---

## Module Details

**Module Code:** intel-team
**Category:** Domain-Specific / Security
**Type:** Complex Module
**Version:** 1.1.0

**Last Updated:** 2026-01-10
