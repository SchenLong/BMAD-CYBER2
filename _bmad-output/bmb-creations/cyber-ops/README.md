# Cybersecurity Operations (Cyber-Ops)

Provides comprehensive cybersecurity expertise through a council of 6 specialized security agents covering architecture, threat intelligence, offensive security, incident response, compliance, and forensics - enabling security-by-design and operational excellence throughout the BMAD development lifecycle.

## Overview

This module provides:

- **6 Specialized Security Agents** with deep domain expertise
- **Expert Consultation** across all cybersecurity disciplines
- **Multi-Agent Collaboration** via Party Mode for complex scenarios
- **Integration with BMAD Method** for security-by-design workflows
- **Comprehensive Coverage** from threat modeling to incident response

## Installation

Install the module using BMAD:

```bash
bmad install cyber-ops
```

During installation, you'll be prompted for:
- **Output Folder**: Where security artifacts and documentation should be saved (default: `_bmad-output/security`)

## Components

### Agents (6)

| Agent | Persona | Domain | Key Capabilities |
|-------|---------|--------|-----------------|
| **Bastion** 🏰 | Security Architect | Defense & Infrastructure | Zero-trust design, threat modeling (STRIDE), cloud security (AWS/Azure/GCP), network segmentation, IAM architecture |
| **Cipher** 🔍 | Threat Analyst | Threat Intelligence | MITRE ATT&CK mapping, threat actor profiling, threat hunting, intelligence briefings, TTP analysis |
| **Ghost** 💀 | Penetration Tester | Offensive Security | Attack surface analysis, exploit chain mapping, pentest scoping, vulnerability assessment, red team ops |
| **Phoenix** 🚨 | Incident Commander | Incident Response | PICERL methodology, incident triage, containment planning, crisis communications, post-mortems |
| **Sentinel** 📋 | Compliance Guardian | Risk & Compliance | NIST/SOC2/PCI/HIPAA/GDPR, risk quantification, control mapping, gap assessments, vendor risk |
| **Trace** 🔬 | Forensic Investigator | Digital Forensics | Disk/memory/network forensics, timeline reconstruction, artifact analysis, malware triage, evidence handling |

### Workflows (10 Planned)

**High Priority (Core Operations):**
1. **Security Architecture Review** - Comprehensive architecture security assessment with threat modeling
2. **Threat Assessment** - Intelligence briefings and adversary analysis using MITRE ATT&CK
3. **Incident Response Playbook** - PICERL-based incident response planning and execution
4. **Compliance Audit Preparation** - Regulatory compliance gap analysis and remediation planning
5. **Penetration Test Planning** - Comprehensive pentest scoping and execution planning

**Medium Priority (Specialized Operations):**
6. **Forensic Investigation** - Digital forensics workflow for evidence collection and analysis
7. **Risk Analysis** - Comprehensive risk assessment with threat/vulnerability/impact analysis

**Optional (Party Mode Workflows):**
8. **Security Requirements Definition** - Collaborative security requirements with architecture + compliance
9. **Post-Incident Review** - Multi-agent retrospective for incident lessons learned
10. **Zero Trust Architecture Design** - Collaborative zero-trust design with architect + penetration tester

### Tasks

Tasks are workflow-specific and located within individual workflow folders.

## Quick Start

### 1. Load a Security Agent

Start with the agent that matches your security need:

```bash
# For architecture and design questions
/bmad:cyber-ops:agents:security-architect

# For threat intelligence
/bmad:cyber-ops:agents:threat-analyst

# For penetration testing guidance
/bmad:cyber-ops:agents:penetration-tester

# For incident response
/bmad:cyber-ops:agents:incident-commander

# For compliance and risk
/bmad:cyber-ops:agents:compliance-guardian

# For digital forensics
/bmad:cyber-ops:agents:forensic-investigator
```

### 2. View Available Commands

Each agent has a standard menu system:

```
*help
```

Common menu items:
- **CH** - Chat mode for general consultation
- **PM** - Party Mode for multi-agent collaboration
- **Agent-specific workflows** - Domain-specific operations (see agent menu)

### 3. Run a Workflow

Workflows are triggered through agent menus. Example:

```
# Load Bastion (security architect)
/bmad:cyber-ops:agents:security-architect

# Select "AR" for Architecture Review workflow
AR
```

### 4. Multi-Agent Collaboration

For complex scenarios requiring multiple security perspectives:

```
# Start Party Mode from any agent
PM

# Select multiple agents, e.g.:
# - Bastion (architecture)
# - Ghost (offensive perspective)
# - Sentinel (compliance requirements)
```

## Module Structure

```
cyber-ops/
├── agents/                       # 6 Expert security agents
│   ├── security-architect.md     # Bastion - Defense & Infrastructure
│   ├── threat-analyst.md         # Cipher - Threat Intelligence
│   ├── penetration-tester.md     # Ghost - Offensive Security
│   ├── incident-commander.md     # Phoenix - Incident Response
│   ├── compliance-guardian.md    # Sentinel - Risk & Compliance
│   └── forensic-investigator.md  # Trace - Digital Forensics
├── workflows/                    # 10 Planned workflow folders
│   ├── security-architecture-review/
│   │   └── README.md            # Workflow documentation
│   ├── threat-assessment/
│   ├── incident-response-playbook/
│   ├── compliance-audit-prep/
│   ├── pentest-planning/
│   ├── forensic-investigation/
│   ├── risk-analysis/
│   ├── security-requirements/
│   ├── post-incident-review/
│   └── zero-trust-design/
├── tasks/                        # Workflow-specific tasks (TBD)
├── templates/                    # Security document templates (TBD)
├── data/                         # Reference data (frameworks, checklists)
├── _module-installer/            # Installation infrastructure
│   └── module.yaml              # Installation configuration
└── README.md                     # This file
```

## Configuration

The module is configured in `_bmad/cyber-ops/config.yaml` (auto-generated during installation).

**Key Settings:**

- **output_folder**: Base directory for security artifacts (default: `_bmad-output/security`)
- **planning_artifacts**: Architecture reviews, threat models, compliance reports → `{output_folder}/planning`
- **operational_artifacts**: Incident reports, forensic findings, pentest results → `{output_folder}/operations`
- **documentation**: Security documentation and guidelines → `{output_folder}/docs`
- **user_skill_level**: Expected user proficiency (default: `intermediate`)

## Examples

### Example 1: Security Architecture Review

**Scenario:** You're designing a new microservices architecture and need security validation.

1. **Load Bastion (Security Architect):**
   ```
   /bmad:cyber-ops:agents:security-architect
   ```

2. **Select Architecture Review workflow:**
   ```
   AR
   ```

3. **Provide architecture context:**
   - Upload architecture diagrams
   - Describe data flows and trust boundaries
   - Share technology stack details

4. **Receive comprehensive analysis:**
   - Threat model (STRIDE methodology)
   - Zero-trust validation
   - Security control recommendations
   - Implementation roadmap

**Output:** Security Architecture Review Report saved to `{output_folder}/planning/architecture/`

### Example 2: Incident Response Planning

**Scenario:** Active security incident requiring coordinated response.

1. **Load Phoenix (Incident Commander):**
   ```
   /bmad:cyber-ops:agents:incident-commander
   ```

2. **Trigger Incident Response Playbook:**
   ```
   IRP
   ```

3. **Classify and assess incident:**
   - Phoenix guides through PICERL methodology
   - Automatically coordinates with Trace for forensics
   - Pulls in Cipher for threat intelligence context

4. **Execute coordinated response:**
   - Containment strategy
   - Evidence preservation
   - Recovery planning
   - Stakeholder communications

**Output:** Incident Response Report saved to `{output_folder}/operations/incidents/`

### Example 3: Compliance Audit Preparation

**Scenario:** Preparing for SOC 2 Type II audit.

1. **Load Sentinel (Compliance Guardian):**
   ```
   /bmad:cyber-ops:agents:compliance-guardian
   ```

2. **Select Compliance Audit Prep workflow:**
   ```
   CAP
   ```

3. **Sentinel conducts gap analysis:**
   - Maps SOC 2 controls to current state
   - Identifies control gaps and deficiencies
   - Recommends remediation priorities

4. **Receive audit readiness package:**
   - Control compliance matrix
   - Gap remediation roadmap
   - Evidence collection checklist
   - Audit timeline

**Output:** Compliance Audit Preparation Report saved to `{output_folder}/planning/compliance/`

## Development Status

This module is currently:

- [x] Structure created
- [x] Installer configured
- [x] 6 Agents migrated and validated
- [x] 10 Workflows planned and documented
- [ ] High-priority workflows implemented (5 workflows)
- [ ] Medium-priority workflows implemented (2 workflows)
- [ ] Optional Party Mode workflows implemented (3 workflows)
- [ ] Full integration testing complete

**Note:** Workflow README files have been created as implementation blueprints. Each workflow folder contains a comprehensive README with execution steps, expected outputs, and integration requirements. Workflow implementation (Phase 2) will convert these blueprints into executable workflow.md files.

## Contributing

To extend this module:

1. **Add new agents:** Use `/bmad:bmb:workflows:create-agent` workflow
2. **Add new workflows:** Use `/bmad:bmb:workflows:create-workflow` workflow
3. **Update installer:** Modify `module.yaml` if new configuration fields needed
4. **Test thoroughly:** Validate agent interactions and workflow outputs

## Requirements

- **BMAD Method:** Version 6.0.0 or higher
- **Dependencies:** None (self-contained module)
- **Optional Integrations:**
  - AgentVibes (for enhanced TTS experience)
  - BMM Module (for development workflow integration)

## Author

Created by J on 2026-01-08

## License

[Add license information if applicable]

---

## Module Details

**Module Code:** cyber-ops
**Category:** Technical - Security
**Type:** Standard Module (6 agents, 10 workflows)
**Version:** 1.0.0
**Target Audience:** Security professionals, consultants, development teams, compliance managers
**Skill Level:** Intermediate to Advanced

**Last Updated:** 2026-01-08
