---
workflow_id: threat-constellation
name: 'Threat Constellation'
description: 'Map complete threat actor ecosystem - relationships, shared infrastructure, tool reuse, and evolution over time'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/threat-constellation'
steps_path: '{workflow_path}/steps'
output_path: '{output_folder}/intel-reports/threat-constellation'

# Workflow Configuration
primary_agent: threat-actor-profiler
primary_codename: Dossier
classification: 'THREAT INTELLIGENCE'
estimated_duration: '60-90 minutes'

# Step Files
steps:
  - name: 'Actor Profile Development'
    file: '{steps_path}/step-01-actor-profile.md'
    agent: threat-actor-profiler
    codename: Dossier
    description: 'Known identities/aliases, historical campaigns, TTP documentation, MITRE ATT&CK mapping, motivation assessment'

  - name: 'Underground Network Mapping'
    file: '{steps_path}/step-02-underground-network.md'
    agent: dark-web-analyst
    codename: Shadow
    description: 'Forum presence, marketplace activity, communication channels, known associates, service providers'

  - name: 'Infrastructure Correlation'
    file: '{steps_path}/step-03-infrastructure-correlation.md'
    agent: technical-researcher
    codename: Probe
    description: 'Shared infrastructure, tool/malware reuse, code similarity, operational patterns'

  - name: 'Public Persona Correlation'
    file: '{steps_path}/step-04-public-persona.md'
    agent: social-media-analyst
    codename: Echo
    description: 'Public claims/announcements, recruitment activity, propaganda channels, sympathizer networks'

  - name: 'Ecosystem Synthesis'
    file: '{steps_path}/step-05-ecosystem-synthesis.md'
    agent: threat-actor-profiler
    codename: Dossier
    description: 'Relationship mapping, hierarchy identification, evolution timeline, predictive analysis'

# Output Configuration
output_format: 'markdown'
---

# Threat Constellation

## PURPOSE

Map the complete threat actor ecosystem including relationships between actors, shared infrastructure, tool reuse, operational patterns, and evolution over time. This workflow reveals the hidden connections within threat actor communities and produces actionable intelligence for attribution and defense.

## WHEN TO USE

- Investigating known threat actor(s)
- Analyzing campaign indicators for attribution
- Understanding threat actor relationships
- Tracking threat actor evolution
- Mapping criminal/APT ecosystems
- Building threat intelligence products
- Supporting incident response attribution
- Developing defensive strategies

## TARGET TYPES

| Type | Description | Key Analysis |
|------|-------------|--------------|
| Named Actor | Known threat actor/group | Profile expansion, network mapping |
| Campaign Indicators | IOCs from incident | Attribution, actor identification |
| Malware Family | Specific malware | Operators, infrastructure, customers |
| Underground Handle | Forum/marketplace identity | Real identity, associations |
| Infrastructure Cluster | Related malicious infrastructure | Operators, campaigns |

## AGENTS INVOLVED

| Agent | Codename | Role in Workflow |
|-------|----------|------------------|
| threat-actor-profiler | Dossier | Actor profiling, ecosystem synthesis |
| dark-web-analyst | Shadow | Underground network mapping |
| technical-researcher | Probe | Infrastructure correlation |
| social-media-analyst | Echo | Public persona correlation |

## WORKFLOW STRUCTURE

```
INPUT: Known Threat Actor(s) OR Campaign Indicators
                    |
                    v
+-------------------------------------------------------------+
| STEP 1: ACTOR PROFILE DEVELOPMENT               ~20 min     |
| Agent: Dossier (threat-actor-profiler)                      |
|-------------------------------------------------------------|
| - Known identities and aliases                               |
| - Historical campaigns                                       |
| - TTP documentation                                          |
| - MITRE ATT&CK mapping                                       |
| - Motivation assessment                                      |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 2: UNDERGROUND NETWORK MAPPING             ~20 min     |
| Agent: Shadow (dark-web-analyst)                            |
|-------------------------------------------------------------|
| - Forum presence and reputation                              |
| - Marketplace activity                                       |
| - Communication channels                                     |
| - Known associates                                           |
| - Service providers used                                     |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 3: INFRASTRUCTURE CORRELATION              ~15 min     |
| Agent: Probe (technical-researcher)                         |
|-------------------------------------------------------------|
| - Shared infrastructure                                      |
| - Tool/malware reuse                                         |
| - Code similarity                                            |
| - Operational patterns                                       |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 4: PUBLIC PERSONA CORRELATION              ~15 min     |
| Agent: Echo (social-media-analyst)                          |
|-------------------------------------------------------------|
| - Public claims and announcements                            |
| - Recruitment activity                                       |
| - Propaganda channels                                        |
| - Sympathizer networks                                       |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 5: ECOSYSTEM SYNTHESIS                     ~20 min     |
| Agent: Dossier (threat-actor-profiler)                      |
|-------------------------------------------------------------|
| - Relationship mapping                                       |
| - Hierarchy identification                                   |
| - Evolution timeline                                         |
| - Predictive analysis                                        |
| - Final ecosystem report                                     |
+-------------------------------------------------------------+
                    |
                    v
OUTPUT: Threat Ecosystem Report
```

## KEY DELIVERABLES

1. **Actor Profile Cards** - Individual actor dossiers
2. **Relationship Network Graph** - Visual ecosystem map
3. **Shared Infrastructure Map** - Common infrastructure
4. **TTP Overlap Matrix** - Technique correlations
5. **Evolution Timeline** - How ecosystem changed over time
6. **MITRE Navigator Layers** - Per actor/group ATT&CK coverage
7. **Predictive Assessment** - Future activity likelihood

## INPUT REQUIREMENTS

- **Required**: At least one of:
  - Named threat actor/group
  - Campaign indicators (IOCs)
  - Malware sample/family
  - Underground identity/handle
  - Related infrastructure

- **Optional**:
  - Timeframe of interest
  - Geographic focus
  - Sector/industry focus
  - Known associates for expansion
  - Specific TTPs to track

## DATA SOURCES

| Source Type | Examples | Data Available |
|-------------|----------|----------------|
| Threat Intel | MISP, OTX, VirusTotal | IOCs, campaigns |
| Underground | Forums, markets, channels | Actor activity |
| Technical | Malware repos, YARA rules | Code analysis |
| Public | News, claims, propaganda | Public activity |
| Academic | Reports, papers | Analysis |

## THREAT ACTOR CATEGORIES

| Category | Examples | Focus Areas |
|----------|----------|-------------|
| APT | Nation-state actors | Espionage, capabilities |
| Cybercrime | Ransomware groups, BEC | Financial, operations |
| Hacktivism | Anonymous, political | Ideology, targets |
| Insider | Disgruntled employees | Access, motivation |
| Terrorism | Cyber-enabled groups | Propaganda, recruitment |

## LEGAL & ETHICAL NOTES

- All data sources are publicly available or commercially licensed
- Underground research conducted passively
- No active engagement with threat actors
- Document all sources for chain of custody
- Consider operational security in reporting
- Sensitive attribution handled appropriately

## INITIATION

To begin this workflow, load and execute:
`{workflow_path}/steps/step-01-actor-profile.md`

---

**Workflow Version:** 1.0.0
**Created:** 2026-01-10
**Module:** intel-team
