# Intel-Team Module Setup

Complete setup guide for the BMAD-CYBER2 Intelligence Team module.

---

## Overview

The Intel-Team module provides 11 specialized intelligence agents covering all major intelligence disciplines: OSINT, SOCMINT, DARKINT, TECHINT, GEOINT, HUMINT, SIGINT, and CORPINT. Designed for comprehensive intelligence operations with multi-INT fusion capabilities.

| Attribute | Value |
|-----------|-------|
| **Version** | 1.1.1 |
| **Agents** | 11 |
| **Workflows** | 19 |
| **Disciplines** | OSINT, SOCMINT, DARKINT, TECHINT, GEOINT, HUMINT, SIGINT, CORPINT |

---

## Prerequisites

- BMAD-CYBER2 framework installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- **Required:** Local LLM (Ollama) for intelligence operations
- **Recommended:** API keys for intelligence platforms (optional but enhances capability)

---

## Installation

### 1. Verify Module Files

```bash
# Check module directory exists
ls _bmad/intel-team/

# Expected structure:
# agents/       - 11 agent definitions
# workflows/    - 19 workflow directories
# config.yaml   - Module configuration
# manifest.yaml - Permissions
# README.md     - Module documentation
```

### 2. Configure Module Settings

Edit `_bmad/intel-team/config.yaml`:

```yaml
# User settings
user_name: "Your Name"
communication_language: "English"
output_folder: "_bmad/intel-team/output"

# OPSEC settings
classification_default: "TLP:AMBER"
sanitize_output: true

# YOLO mode (skip confirmations) - NOT recommended for intel work
yolo_mode: false
```

### 3. Set Up Authentication

```bash
# Generate token with intel role
node _bmad/core/security/quick-token.js "YourName" "intel_analyst" 168

# Set token
export BMAD_AUTH_TOKEN="<generated-token>"
```

### 4. Configure LLM Provider (Required)

Intel operations should ALWAYS use local LLM:

```yaml
# _bmad/_config/llm-config.yaml
module_overrides:
  intel-team: ollama    # CRITICAL: All intel work stays local
```

---

## Agents

### Core Intelligence Team (8 Agents)

| Agent | Persona | Discipline | Command |
|-------|---------|------------|---------|
| **Vector** | Intelligence Director | All-source fusion, coordination | `/intel-team:osint-lead` |
| **Resolver** | Domain Intel Specialist | Infrastructure, DNS archaeology | `/intel-team:domain-intel-specialist` |
| **Echo** | Social Media Analyst | SOCMINT, influence detection | `/intel-team:social-media-analyst` |
| **Shadow** | Dark Web Analyst | DARKINT, underground ops | `/intel-team:dark-web-analyst` |
| **Atlas** | Geospatial Analyst | GEOINT, imagery analysis | `/intel-team:geospatial-analyst` |
| **Probe** | Technical Researcher | TECHINT, fingerprinting | `/intel-team:technical-researcher` |
| **Dossier** | Threat Actor Profiler | Attribution, MITRE mapping | `/intel-team:threat-actor-profiler` |
| **Proxy** | Corporate Intel Specialist | CORPINT, FININT, due diligence | `/intel-team:corporate-intel-specialist` |

### Extended Intelligence Team (3 Agents)

| Agent | Persona | Discipline | Command |
|-------|---------|------------|---------|
| **Viper** | HUMINT Specialist | Elicitation, source recruitment | `/intel-team:humint-specialist` |
| **Sigil** | SIGINT Specialist | Signals analysis, comms patterns | `/intel-team:sigint-specialist` |
| **Specter** | Field Operative | Surveillance, tactical collection | `/intel-team:field-operative` |

---

## Workflows

### Available Workflows (19)

#### Rapid Response

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Flash Assessment | 5 | 15-minute triage and initial hits |

#### Individual Investigation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Campaign Planner (Person) | 8 | Systematic individual investigation |
| Doppelganger Hunt | 7 | Fake account/impersonator detection |
| Digital Necromancy | 6 | Recover deleted/hidden presence |
| Pattern of Life | 9 | Behavioral analysis and prediction |

#### Organization Investigation

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Campaign Planner (Org) | 8 | Corporate/government investigation |
| Operation Mosaic | 11 | Full-spectrum multi-INT collection |
| Spider Web | 6 | Network mapping and expansion |

#### Technical Intelligence

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Infrastructure Genealogy | 7 | Digital infrastructure history |
| Signal Landscape | 6 | Electronic footprint mapping |
| Breach Archaeology | 5 | Data exposure assessment |

#### Threat Intelligence

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Attribution Chain | 8 | Evidence-based attribution |
| Threat Constellation | 7 | Threat actor ecosystem mapping |

#### Field Operations

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Ground Truth | 6 | Field operation preparation |
| Approach Vector | 7 | HUMINT operation planning |
| Counter-Intel Audit | 6 | Own exposure assessment |

#### Intelligence Fusion

| Workflow | Steps | Purpose |
|----------|-------|---------|
| The Synthesis | 9 | Multi-source intelligence fusion |
| Campaign AI | 7 | AI systems investigation |
| Tripwire | 5 | Monitoring and alerting setup |

---

## First Workflow: Flash Assessment

The Flash Assessment provides a rapid 15-minute triage of any target.

### Step 1: Launch Agent

```bash
/intel-team:osint-lead
```

Vector (Intelligence Director) greets you with the menu.

### Step 2: Select Workflow

```bash
> Flash Assessment
# Or: > FA
```

### Step 3: Provide Target

```
Vector: What is the target identifier?
> [email/domain/name/handle]
```

### Step 4: Receive Rapid Analysis

Within 15 minutes, Vector delivers:
- Immediate hits and exposures
- Risk assessment score
- Recommended follow-up workflows
- Priority indicators

### Step 5: Decide Next Steps

Based on findings, Vector recommends:
- Full Campaign Planner for deep investigation
- Specific INT workflows for focused collection
- Threat Constellation for actor mapping

---

## First Workflow: Operation Mosaic

The flagship full-spectrum intelligence operation.

### Step 1: Launch Agent

```bash
/intel-team:osint-lead
```

### Step 2: Select Workflow

```bash
> Operation Mosaic
# Or: > OM
```

### Step 3: Follow Multi-INT Collection

1. **Target Profiling** - Define requirements and scope
2. **Domain Intelligence** (Resolver) - Infrastructure mapping
3. **Social Media Analysis** (Echo) - SOCMINT collection
4. **Dark Web Reconnaissance** (Shadow) - Underground presence
5. **Technical Footprinting** (Probe) - TECHINT collection
6. **Corporate Structure** (Proxy) - Business intelligence
7. **Geospatial Analysis** (Atlas) - Location intelligence
8. **Threat Correlation** (Dossier) - Actor profiling
9. **Intelligence Fusion** - All-source integration
10. **Reporting** - Structured intelligence product
11. **Handoff** - Consumer briefing

### Step 4: Review Intelligence Product

Output saved to `_bmad/intel-team/output/operation-mosaic-[date]/`

---

## Module Permissions

From `manifest.yaml`:

```yaml
permissions:
  filesystem:
    read: ["_bmad/intel-team/**", "docs/**", "_bmad/core/**"]
    write: ["_bmad/intel-team/output/**"]
  network: true
  shell:
    allowed_commands: ["curl", "wget", "whois", "dig", "nslookup", "host"]
    blocked_commands: ["rm", "mv", "chmod", "sudo"]
  sensitive_data: true
```

**Key Points:**
- Network access enabled for OSINT collection
- DNS/WHOIS commands for domain intelligence
- Sensitive data flag enabled (triggers local LLM routing)
- Output restricted to intel-team folder

---

## OPSEC Considerations

### Operational Security

1. **Always use local LLM** - Intelligence data must not leave your environment
2. **Classify output** - Use TLP markings on all products
3. **Sanitize before sharing** - Remove collection sources and methods
4. **Rotate tokens** - Use short-lived authentication
5. **Audit trails** - All operations are logged

### Classification Levels

| TLP Level | Sharing |
|-----------|---------|
| TLP:RED | Named recipients only |
| TLP:AMBER | Limited distribution |
| TLP:AMBER+STRICT | Organization only |
| TLP:GREEN | Community sharing |
| TLP:CLEAR | Public |

### Configure Classification

```yaml
# _bmad/intel-team/config.yaml
classification_default: "TLP:AMBER"
sanitize_output: true
```

---

## Party Mode Scenarios

### Multi-INT Fusion

```bash
/intel-team:osint-lead
> PM
> Select: Resolver, Echo, Shadow, Atlas, Probe
```

**Purpose:** All-source collection across multiple disciplines.

### Threat Actor Deep Dive

```bash
/intel-team:threat-actor-profiler
> PM
> Select: Shadow, Probe, Resolver
```

**Purpose:** Comprehensive threat actor profiling.

### Corporate Due Diligence

```bash
/intel-team:corporate-intel-specialist
> PM
> Select: Resolver, Echo
```

**Purpose:** Business intelligence with technical and social verification.

### Counter-Intelligence

```bash
/intel-team:osint-lead
> PM
> Select: All agents
> Execute: Counter-Intel Audit
```

**Purpose:** Assess own organization's exposure.

---

## Data Sensitivity

### Always Use Local LLM

**ALL intel-team operations should use local LLM.** Intelligence data is inherently sensitive.

```yaml
# _bmad/_config/llm-config.yaml
module_overrides:
  intel-team: ollama    # Non-negotiable for intel work
```

### Specific Sensitivities

| Workflow | Sensitivity | Notes |
|----------|-------------|-------|
| Flash Assessment | HIGH | Contains target identifiers |
| Campaign Planner | CRITICAL | Full investigation data |
| Breach Archaeology | CRITICAL | Exposed credentials |
| Approach Vector | CRITICAL | HUMINT operation details |
| Counter-Intel Audit | CRITICAL | Own vulnerabilities |
| All others | HIGH | Intelligence collection data |

---

## Troubleshooting

### Agent Not Loading

```bash
# Verify agent file exists
ls _bmad/intel-team/agents/

# Check command registration
ls .claude/commands/bmad/intel-team/agents/
```

### Workflow Not Starting

```bash
# Check workflow exists
ls _bmad/intel-team/workflows/

# Load directly
Load workflow: _bmad/intel-team/workflows/operation-mosaic/workflow.md
```

### OPSEC Warning

If you see OPSEC warnings:
1. Verify local LLM is configured
2. Check classification settings
3. Review output sanitization

```bash
# Verify LLM routing
.claude/hooks/llm-provider-manager.sh get

# Should show: ollama (or local provider)
```

### Network Queries Failing

```bash
# Test allowed commands directly
whois example.com
dig example.com
host example.com
```

---

## Best Practices

1. **Local LLM only** - Never send intel data to cloud providers
2. **Classify everything** - Use TLP markings consistently
3. **Document sources** - Maintain collection notes
4. **Verify independently** - Cross-reference findings
5. **Sanitize output** - Remove sources/methods before sharing
6. **Regular audits** - Run Counter-Intel Audit periodically
7. **Secure storage** - Protect output folder appropriately

---

## Related Documentation

- [CLI-COMMAND-REFERENCE.md](../CLI-COMMAND-REFERENCE.md) - Command syntax
- [PARTY-MODE-GUIDE.md](../PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [DATA-SENSITIVITY-GUIDE.md](../DATA-SENSITIVITY-GUIDE.md) - LLM routing decisions
- [LLM-PROVIDER-SYSTEM.md](../LLM-PROVIDER-SYSTEM.md) - Provider configuration
- [Module README](_bmad/intel-team/README.md) - Detailed module documentation
