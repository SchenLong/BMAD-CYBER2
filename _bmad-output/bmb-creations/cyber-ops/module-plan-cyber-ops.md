---
moduleName: cyber-ops
creator: J
createdDate: 2026-01-08
inputDocuments:
  - /Users/paultinp/BMAD-CYBERSEC/_bmad/cyber/README.md
  - /Users/paultinp/BMAD-CYBERSEC/_bmad/cyber/AGENTS.md
  - /Users/paultinp/BMAD-CYBERSEC/_bmad/cyber/module.yaml
  - /Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-agents-conversion-summary.md
stepsCompleted:
  - step-01-init
  - step-02-concept
  - step-03-components
  - step-04-structure
  - step-05-config
  - step-06-agents
  - step-07-workflows
  - step-08-installer
  - step-09-documentation
---

# Module Plan: cyber-ops

## Module Foundation

**Module Name:** cyber-ops
**Creator:** J
**Date:** 2026-01-08

### Existing Assets Discovered

This module creation is based on an **existing cybersecurity agent implementation** that has been thoroughly validated and converted to BMAD standards.

**Existing Documentation:**
- **README.md** - Comprehensive overview of the Cybersecurity Expert Council with 6 specialized agents
- **AGENTS.md** - Agent manifest with quick reference and capabilities matrix
- **module.yaml** - Module configuration file
- **cyber-agents-conversion-summary.md** - Complete validation and conversion report

**6 Fully-Developed Agents:**
1. **Bastion** (security-architect) - Defense & Infrastructure Design 🏰
2. **Cipher** (threat-analyst) - Threat Intelligence Specialist 🔍
3. **Ghost** (penetration-tester) - Offensive Security Expert 💀
4. **Phoenix** (incident-commander) - Incident Response Lead 🚨
5. **Sentinel** (compliance-guardian) - Risk & Regulatory Compliance 📋
6. **Trace** (forensic-investigator) - Digital Forensics & Evidence 🔬

**Current Status:**
- ✅ All 6 agents converted to standard BMAD format
- ✅ Persona validation complete (exceptional quality)
- ✅ Menu structure standardized
- ✅ TTS support added
- ✅ Comprehensive documentation exists
- ⚠️ Module packaging and installation infrastructure needed

---

## Module Concept

**Module Name:** Cybersecurity Operations (Cyber-Ops)
**Module Code:** cyber-ops
**Category:** Technical - Security
**Type:** Standard Module (6 agents, multiple domain workflows)

**Purpose Statement:**

Provides comprehensive cybersecurity expertise through a council of 6 specialized security agents covering architecture, threat intelligence, offensive security, incident response, compliance, and forensics - enabling security-by-design and operational excellence throughout the BMAD development lifecycle.

**Target Audience:**

**Primary:**
- Security professionals conducting internal security operations
- Security consultants performing client engagements
- Development teams requiring security guidance
- Organizations managing incident response and compliance

**Secondary:**
- Technical architects integrating security into system design
- Risk and compliance managers
- Forensic investigators and incident responders

**Skill Level:** Intermediate to Advanced

**Scope Definition:**

**In Scope:**

- **6 Specialized Security Agents:**
  - Security Architecture (Bastion) - Zero-trust design, threat modeling, cloud security
  - Threat Intelligence (Cipher) - MITRE ATT&CK, adversary analysis, threat hunting
  - Offensive Security (Ghost) - Attack surface analysis, penetration testing, vulnerability assessment
  - Incident Response (Phoenix) - PICERL methodology, crisis management, containment planning
  - Compliance & Risk (Sentinel) - NIST/SOC2/PCI/HIPAA/GDPR, risk quantification, audit preparation
  - Digital Forensics (Trace) - Evidence analysis, timeline reconstruction, malware triage

- **Multi-Agent Collaboration:**
  - Party Mode for complex security scenarios requiring multiple experts
  - Cross-functional security workflows (architecture + pentest + compliance)

- **Integration with BMAD Method:**
  - Security consultation across all BMAD phases (Discovery, Planning, Solutioning, Implementation)
  - Team collaboration with BMM development agents

- **Domain Workflows (Planned):**
  - Security architecture review workflows
  - Threat assessment and modeling workflows
  - Incident response playbooks
  - Compliance audit preparation workflows

**Out of Scope:**

- Automated security scanning or tool execution (agents provide guidance, not automation)
- Real-time security monitoring or SIEM integration
- Vulnerability database management
- Security tool configuration (agents advise, users implement)
- Non-security domain expertise (limited to cybersecurity operations)

**Success Criteria:**

- All 6 agents installable and operational via BMAD CLI
- Agents provide expert-level guidance validated against industry standards
- Party Mode enables effective multi-agent collaboration on complex scenarios
- Module integrates seamlessly with existing BMAD Method workflows
- Documentation enables users to quickly identify which agent to consult for specific security needs
- Users report high satisfaction with agent expertise quality and practical guidance

**Key Differentiators:**

- **Comprehensive Coverage:** 6 specialized domains vs single-purpose security tools
- **Expert Personas:** Each agent embodies deep domain expertise with authentic voice and perspective
- **Collaborative Intelligence:** Party Mode enables multi-disciplinary security analysis
- **BMAD Integration:** Native integration with development workflow, not bolt-on security
- **Guidance Over Automation:** Focus on expert consultation and decision support

---

## Module Components

### Agent Architecture

**Status:** 6 Expert Agents (Existing, Validated, BMAD-Compliant)

All agents follow BMAD standards with:
- Four-field persona system (role, identity, communication_style, principles)
- Standardized menu structure with CH (Chat) and PM (Party Mode)
- TTS integration via AgentVibes
- `exec` handler for workflow invocation

| Agent ID | Name | Icon | Domain | Primary Capabilities |
|----------|------|------|--------|---------------------|
| `security-architect` | Bastion | 🏰 | Defense & Infrastructure | Zero-trust design, threat modeling (STRIDE), cloud security (AWS/Azure/GCP), network segmentation, IAM architecture |
| `threat-analyst` | Cipher | 🔍 | Threat Intelligence | MITRE ATT&CK mapping, threat actor profiling, threat hunting, intelligence briefings, TTP analysis |
| `penetration-tester` | Ghost | 💀 | Offensive Security | Attack surface analysis, exploit chain mapping, pentest scoping, vulnerability assessment, red team ops |
| `incident-commander` | Phoenix | 🚨 | Incident Response | PICERL methodology, incident triage, containment planning, crisis communications, post-mortems |
| `compliance-guardian` | Sentinel | 📋 | Risk & Compliance | NIST/SOC2/PCI/HIPAA/GDPR, risk quantification, control mapping, gap assessments, vendor risk |
| `forensic-investigator` | Trace | 🔬 | Digital Forensics | Disk/memory/network forensics, timeline reconstruction, artifact analysis, malware triage, evidence handling |

**Agent Integration Pattern:**
- Individual consultation via direct invocation: `/bmad:cyber-ops:agents:{agent-id}`
- Multi-agent collaboration via Party Mode for complex scenarios
- Cross-domain workflows leverage multiple agents automatically

### Workflow Architecture

**Status:** Planned (10 workflows identified)

#### High Priority Workflows (Core Operations)

1. **Security Architecture Review** (`workflows/security-architecture-review/workflow.md`)
   - **Lead Agent:** Bastion
   - **Input:** Architecture docs, threat models, design diagrams
   - **Output:** Security assessment report, threat model, recommendations
   - **Collaboration:** Can invoke Ghost for attack surface analysis
   - **Use Cases:** New system design review, cloud migration assessment, zero-trust planning

2. **Threat Assessment** (`workflows/threat-assessment/workflow.md`)
   - **Lead Agent:** Cipher
   - **Input:** Organization profile, threat landscape context
   - **Output:** Threat intelligence briefing, MITRE ATT&CK mapping, adversary profiles
   - **Collaboration:** Can pull Phoenix for incident correlation analysis
   - **Use Cases:** Annual threat landscape review, pre-pentest intelligence, incident context

3. **Incident Response Playbook** (`workflows/incident-response-playbook/workflow.md`)
   - **Lead Agent:** Phoenix
   - **Input:** Incident type, severity, environment details
   - **Output:** PICERL execution plan, containment strategy, recovery steps
   - **Collaboration:** Pulls Trace for forensics, Cipher for threat context
   - **Use Cases:** Active incident response, IR drill planning, post-mortem analysis

4. **Compliance Audit Preparation** (`workflows/compliance-audit-prep/workflow.md`)
   - **Lead Agent:** Sentinel
   - **Input:** Framework selection (NIST/SOC2/PCI/HIPAA/GDPR), scope
   - **Output:** Gap assessment, control mapping, remediation plan, audit artifacts
   - **Collaboration:** Can invoke Bastion for architecture control validation
   - **Use Cases:** Annual compliance audits, certification preparation, framework adoption

5. **Penetration Test Planning** (`workflows/pentest-planning/workflow.md`)
   - **Lead Agent:** Ghost
   - **Input:** Scope, objectives, environment details, rules of engagement
   - **Output:** Test plan, attack surface analysis, methodology, success criteria
   - **Collaboration:** Works with Bastion on defense validation approach
   - **Use Cases:** Annual pentest planning, red team exercise design, security validation

#### Medium Priority Workflows (Specialized Operations)

6. **Forensic Investigation** (`workflows/forensic-investigation/workflow.md`)
   - **Lead Agent:** Trace
   - **Input:** Evidence artifacts, investigation scope, chain of custody
   - **Output:** Forensic analysis report, timeline reconstruction, findings
   - **Collaboration:** Coordinates with Phoenix on incident context
   - **Use Cases:** Post-breach investigation, malware analysis, legal evidence collection

7. **Risk Analysis** (`workflows/risk-analysis/workflow.md`)
   - **Lead Agent:** Sentinel
   - **Input:** Asset inventory, threat landscape, business context
   - **Output:** Risk register, quantified risk scores, mitigation priorities
   - **Collaboration:** Pulls Cipher for threat data, Bastion for control assessment
   - **Use Cases:** Annual risk assessment, new project risk evaluation, vendor risk

#### Optional Workflows (Enhanced Capabilities)

8. **Security Requirements Definition** (`workflows/security-requirements/workflow.md`)
   - **Multi-Agent (Party Mode):** Bastion + Sentinel
   - **Input:** Project requirements, compliance constraints
   - **Output:** Security requirements document, acceptance criteria
   - **Use Cases:** New project kickoff, procurement security requirements

9. **Post-Incident Review** (`workflows/post-incident-review/workflow.md`)
   - **Multi-Agent (Party Mode):** Phoenix + Trace + Cipher
   - **Input:** Incident timeline, evidence, response actions
   - **Output:** Root cause analysis, lessons learned, preventive measures
   - **Use Cases:** Major incident retrospective, IR process improvement

10. **Zero Trust Architecture Design** (`workflows/zero-trust-design/workflow.md`)
    - **Multi-Agent (Party Mode):** Bastion + Ghost
    - **Input:** Current architecture, business requirements, threat model
    - **Output:** Zero trust design, implementation roadmap, validation plan
    - **Use Cases:** Enterprise architecture transformation, cloud security modernization

### Integration Patterns

**Party Mode Collaboration:**
- **Architecture + Security Testing:** Bastion designs → Ghost validates → Iterate
- **Incident Response + Forensics:** Phoenix leads coordination → Trace investigates → Report
- **Threat Analysis + Incident Response:** Cipher identifies threats → Phoenix responds → Remediate
- **Compliance + Architecture:** Sentinel maps controls → Bastion implements → Validate

**BMAD Method Integration:**
- **Discovery Phase:** Sentinel (compliance requirements), Cipher (threat landscape analysis)
- **Planning Phase:** Bastion (security architecture), Ghost (security testing strategy), Sentinel (risk assessment)
- **Solutioning Phase:** All agents available for security design decisions and trade-off analysis
- **Implementation Phase:** Phoenix (incident response readiness), Trace (logging/monitoring design)

**Cross-Module Collaboration:**
- BMM dev agents can consult cyber-ops agents for security guidance during development
- Cyber-ops workflows can be triggered as sub-processes from BMM workflows (e.g., security review gate)
- Shared party mode enables mixed teams (dev + security) for architecture reviews

### Task/Utility Architecture

**Status:** Not Required

The module does not require custom tasks or utilities. All agent operations are consultation-based using:
- Built-in BMAD tools (file operations, web search, command execution)
- Party Mode workflow (core BMAD feature)
- Standard workflow execution patterns

---

## Module Structure

**Module Type:** Standard Module
**Location:** `/Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops`

**Directory Structure Created:**
- ✅ `agents/` - Agent definition files
- ✅ `workflows/` - Workflow folders
- ✅ `tasks/` - Task files (empty - not required for this module)
- ✅ `templates/` - Shared templates
- ✅ `data/` - Module data files
- ✅ `_module-installer/` - Installation configuration
  - ✅ `assets/` - Install assets subdirectory
- ✅ `README.md` - Placeholder documentation

**Rationale for Standard Module Classification:**

This module is classified as **Standard** based on:

1. **Agent Count (6):** Exceeds Simple Module threshold of 1-2 agents
2. **Workflow Count (10 planned):** Within Standard Module range, organized into:
   - 5 high-priority core operational workflows
   - 2 medium-priority specialized workflows
   - 3 optional enhanced capability workflows
3. **Complexity Level:** Moderate complexity with:
   - Multi-agent collaboration patterns (Party Mode)
   - Cross-domain workflow orchestration
   - Shared resources and integration patterns
   - No external system dependencies (would require Complex classification)
4. **Agent Types:** All Expert-type agents, no Module-type agents (Complex indicator)

The Standard classification provides the right balance of structure for a comprehensive security operations suite while remaining maintainable and extensible.

---

## Configuration Planning

### Configuration Approach

**Strategy:** Simple single-folder configuration with automatic subdirectory organization

This approach provides the best balance of user-friendliness and organizational structure. Users configure one main output location during installation, and the module automatically organizes artifacts into logical subdirectories.

### Required Configuration Fields

#### 1. output_folder
- **Type:** INTERACTIVE (text input)
- **Purpose:** Primary location for all security artifacts and documentation
- **Prompt:** "Where should cyber-ops save security artifacts and documentation?"
- **Default:** `{project-root}/_bmad-output/security`
- **Result Template:** `{project-root}/{value}`
- **Input Type:** text

**Automatic Subdirectory Structure:**

The module will automatically create and use these subdirectories within the output_folder:

```
{output_folder}/
├── planning/              # Security planning artifacts
│   ├── threat-models/     # Threat modeling outputs
│   ├── architecture/      # Security architecture reviews
│   └── risk-assessments/  # Risk analysis results
├── operations/            # Operational security artifacts
│   ├── incidents/         # Incident response reports
│   ├── forensics/         # Forensic investigation outputs
│   └── audits/           # Compliance audit results
└── docs/                  # Reference documentation
    ├── policies/          # Security policies
    ├── procedures/        # Security procedures
    └── playbooks/         # Operational playbooks
```

#### 2. module_code (STATIC)
- **Type:** STATIC
- **Value:** `cyber-ops`
- **Purpose:** Module identifier for BMAD system

#### 3. module_version (STATIC)
- **Type:** STATIC
- **Value:** `1.0.0`
- **Purpose:** Module version tracking

### Installation Questions Flow

When users run `bmad install cyber-ops`, they will experience:

1. **Welcome Message**
   ```
   🔒 Installing Cybersecurity Operations (Cyber-Ops) Module

   This module provides 6 specialized security agents:
   - Bastion (Security Architecture)
   - Cipher (Threat Intelligence)
   - Ghost (Penetration Testing)
   - Phoenix (Incident Response)
   - Sentinel (Compliance & Risk)
   - Trace (Digital Forensics)
   ```

2. **Configuration Question**
   ```
   ⚙️  Where should cyber-ops save security artifacts and documentation?

   Default: {project-root}/_bmad-output/security

   [Press Enter to use default, or type custom path]
   > _
   ```

3. **Installation Confirmation**
   ```
   ✅ Configuration complete

   Output folder: /Users/username/project/_bmad-output/security

   Subdirectories will be created automatically:
   - planning/ (threat models, architecture reviews, risk assessments)
   - operations/ (incidents, forensics, audits)
   - docs/ (policies, procedures, playbooks)

   Installing agents and workflows...
   ```

### Result Configuration Structure

**Generated config.yaml location:** `_bmad/cyber-ops/config.yaml`

**Config file contents:**

```yaml
# Cyber-Ops Module Configuration
# Generated by BMAD installer
# Version: 1.0.0

project_name: [user's project name]
user_skill_level: intermediate
output_folder: "{project-root}/_bmad-output/security"

# Automatic subdirectories (created on first use)
planning_artifacts: "{output_folder}/planning"
operational_artifacts: "{output_folder}/operations"
documentation: "{output_folder}/docs"

# Core Configuration Values
user_name: [from global config]
communication_language: [from global config]
document_output_language: [from global config]

# Module Information
module_code: cyber-ops
module_version: 1.0.0
agents_path: "{project-root}/_bmad/cyber-ops/agents"
workflows_path: "{project-root}/_bmad/cyber-ops/workflows"
```

### Configuration Rationale

**Why single folder with subdirectories?**

1. **Simplicity:** Users answer one question instead of three during installation
2. **Flexibility:** Users can still organize by accepting the default or specifying a custom location
3. **Automatic Organization:** Module handles subdirectory structure internally
4. **Maintenance:** Easier to back up, migrate, or share (single root folder)
5. **Discoverability:** All security artifacts in one place, organized logically

**Why these subdirectories?**

- **planning/**: Aligns with BMAD Method's planning phase and proactive security design
- **operations/**: Houses time-sensitive operational outputs (incidents, forensics, audits)
- **docs/**: Persistent reference materials that accumulate over time

This structure mirrors how security teams actually organize their work while remaining simple enough for individual developers or small teams.

---

## Agent Migration

### Migration Summary

**Status:** ✅ Complete - All 6 agents successfully migrated to module structure

**Source Location:** `/Users/paultinp/BMAD-CYBERSEC/_bmad/cyber/agents/`
**Target Location:** `/Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops/agents/`

### Agents Migrated

| Agent File | Agent Name | Icon | Status |
|------------|------------|------|---------|
| `security-architect.md` | Bastion | 🏰 | ✅ Migrated & Updated |
| `threat-analyst.md` | Cipher | 🔍 | ✅ Migrated & Updated |
| `penetration-tester.md` | Ghost | 💀 | ✅ Migrated & Updated |
| `incident-commander.md` | Phoenix | 🚨 | ✅ Migrated & Updated |
| `compliance-guardian.md` | Sentinel | 📋 | ✅ Migrated & Updated |
| `forensic-investigator.md` | Trace | 🔬 | ✅ Migrated & Updated |

### Path Updates Applied

All agents updated with correct module paths:

**Config Path:**
- ❌ Old: `{project-root}/_bmad/cyber/config.yaml`
- ✅ New: `{project-root}/_bmad/cyber-ops/config.yaml`

**Workflow References:**
- ✅ Party Mode: `{project-root}/_bmad/core/workflows/party-mode/workflow.md` (unchanged - correct)
- ⏳ Agent workflows: Currently `exec="todo"` - will be replaced with actual workflow paths in Phase 2

### Agent Features Retained

All agents maintain their validated, BMAD-compliant structure:

✅ **Four-field persona system** (role, identity, communication_style, principles)
✅ **Standardized menu structure** with CH (Chat) and PM (Party Mode) items
✅ **TTS integration** via AgentVibes (`.claude/hooks/bmad-speak.sh`)
✅ **exec handler** for workflow invocation
✅ **Config loading** on activation
✅ **Exceptional persona quality** (validated in conversion summary)

### Workflow Placeholders

Each agent has placeholder menu items with `exec="todo"` that will be replaced with actual workflows:

**Bastion (Security Architect):**
- Security Review → Will link to `workflows/security-architecture-review/workflow.md`

**Cipher (Threat Analyst):**
- Threat Briefing → Will link to `workflows/threat-assessment/workflow.md`

**Ghost (Penetration Tester):**
- Attack Surface Analysis → Will link to `workflows/pentest-planning/workflow.md`

**Phoenix (Incident Commander):**
- Incident Response → Will link to `workflows/incident-response-playbook/workflow.md`

**Sentinel (Compliance Guardian):**
- Compliance Audit → Will link to `workflows/compliance-audit-prep/workflow.md`
- Risk Analysis → Will link to `workflows/risk-analysis/workflow.md`

**Trace (Forensic Investigator):**
- Forensic Investigation → Will link to `workflows/forensic-investigation/workflow.md`

These workflow files will be created in Phase 2 (Core Workflows development).

### Migration Method

**Approach Used:** Direct Copy with Path Updates

- Agents copied from validated source to module structure
- Critical paths updated for module context
- All agent files remain independent and distributable
- No symlinks or external dependencies
- Module can be packaged and shared as standalone unit

---

## Workflow Planning

### Planning Summary

**Status:** ✅ Complete - All 10 workflow README placeholders created with comprehensive implementation plans

**Location:** `/Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops/workflows/`

### Workflows Created

#### High Priority Workflows (Core Operations)

1. **Security Architecture Review** (`security-architecture-review/`)
   - **Lead Agent:** Bastion (security-architect)
   - **Purpose:** Comprehensive security analysis of system architectures using STRIDE threat modeling
   - **Output:** Security assessment report with threat model and recommendations
   - **Status:** ✅ README created, ready for workflow implementation

2. **Threat Assessment** (`threat-assessment/`)
   - **Lead Agent:** Cipher (threat-analyst)
   - **Purpose:** Threat intelligence briefings with MITRE ATT&CK mapping and adversary profiling
   - **Output:** Threat intelligence briefing with heat maps and defensive priorities
   - **Status:** ✅ README created, ready for workflow implementation

3. **Incident Response Playbook** (`incident-response-playbook/`)
   - **Lead Agent:** Phoenix (incident-commander)
   - **Purpose:** Structured incident response using PICERL methodology
   - **Output:** Incident response playbook with containment, eradication, and recovery plans
   - **Collaboration:** Trace (forensics) + Cipher (threat intel)
   - **Status:** ✅ README created, ready for workflow implementation

4. **Compliance Audit Preparation** (`compliance-audit-prep/`)
   - **Lead Agent:** Sentinel (compliance-guardian)
   - **Purpose:** Gap assessment and audit preparation for NIST, SOC2, PCI, HIPAA, GDPR frameworks
   - **Output:** Compliance audit preparation package with gap assessment and remediation roadmap
   - **Status:** ✅ README created, ready for workflow implementation

5. **Penetration Test Planning** (`pentest-planning/`)
   - **Lead Agent:** Ghost (penetration-tester)
   - **Purpose:** Comprehensive pentest engagement planning with scope, methodology, and RoE
   - **Output:** Penetration test plan with attack surface analysis and rules of engagement
   - **Status:** ✅ README created, ready for workflow implementation

#### Medium Priority Workflows (Specialized Operations)

6. **Forensic Investigation** (`forensic-investigation/`)
   - **Lead Agent:** Trace (forensic-investigator)
   - **Purpose:** Digital forensics including evidence collection, analysis, and timeline reconstruction
   - **Output:** Forensic investigation report with chain of custody and IOCs
   - **Collaboration:** Phoenix (incident context) + Cipher (threat attribution)
   - **Status:** ✅ README created, ready for workflow implementation

7. **Risk Analysis** (`risk-analysis/`)
   - **Lead Agent:** Sentinel (compliance-guardian)
   - **Purpose:** Comprehensive risk assessments with asset inventory, threat analysis, and quantification
   - **Output:** Risk assessment report with risk register and mitigation recommendations
   - **Collaboration:** Cipher (threat data) + Bastion (control assessment)
   - **Status:** ✅ README created, ready for workflow implementation

#### Optional Workflows (Enhanced Capabilities - Party Mode)

8. **Security Requirements Definition** (`security-requirements/`)
   - **Multi-Agent:** Bastion + Sentinel (Party Mode)
   - **Purpose:** Collaborative requirements definition for new projects
   - **Output:** Security requirements document with acceptance criteria
   - **Status:** ✅ README created, ready for workflow implementation

9. **Post-Incident Review** (`post-incident-review/`)
   - **Multi-Agent:** Phoenix + Trace + Cipher (Party Mode)
   - **Purpose:** Structured post-mortem to extract lessons learned
   - **Output:** Post-incident review report with action plan
   - **Status:** ✅ README created, ready for workflow implementation

10. **Zero Trust Architecture Design** (`zero-trust-design/`)
    - **Multi-Agent:** Bastion + Ghost (Party Mode)
    - **Purpose:** Collaborative zero-trust architecture design with attack validation
    - **Output:** Zero-trust architecture design document with implementation roadmap
    - **Status:** ✅ README created, ready for workflow implementation

### Workflow README Structure

Each workflow README contains:

✅ **Purpose** - Clear description of workflow objectives
✅ **Trigger** - Lead agent and menu command
✅ **Key Steps** - Detailed workflow execution steps (7-10 steps)
✅ **Expected Output** - Artifacts generated with format and location
✅ **Collaboration Pattern** - Multi-agent coordination details
✅ **Use Cases** - 5 practical application scenarios
✅ **Implementation Notes** - Technical requirements and considerations
✅ **Integration with Agents** - Agent menu item update instructions

### Implementation Strategy

**Phase 2 Implementation Plan:**

When ready to implement workflows, use the `/bmad:bmb:workflows:create-workflow` command for each workflow folder. The comprehensive README files serve as implementation blueprints containing:

- Detailed step-by-step execution flow
- Agent collaboration patterns
- Output specifications
- Use case guidance

**Agent Menu Updates:**

After workflow implementation, update agent menu items to replace `exec="todo"` with actual workflow paths:

```xml
<!-- Example for Bastion agent -->
<item cmd="SR" exec="{project-root}/_bmad/cyber-ops/workflows/security-architecture-review/workflow.md">[SR] Security Review</item>
```

### Workflow Organization

**Directory Structure:**
```
workflows/
├── compliance-audit-prep/
│   └── README.md
├── forensic-investigation/
│   └── README.md
├── incident-response-playbook/
│   └── README.md
├── pentest-planning/
│   └── README.md
├── post-incident-review/
│   └── README.md
├── risk-analysis/
│   └── README.md
├── security-architecture-review/
│   └── README.md
├── security-requirements/
│   └── README.md
├── threat-assessment/
│   └── README.md
└── zero-trust-design/
    └── README.md
```

Each folder ready for workflow.md and step files creation using create-workflow workflow.

---

## Installer Configuration

### Installation Overview

**File:** `module.yaml`
**Module Code:** `cyber-ops`
**Module Name:** Cybersecurity Operations (Cyber-Ops)
**Default Selected:** false (user must explicitly choose to install)

### Configuration Fields

#### Interactive Fields (User Input Required)

1. **output_folder**
   - **Prompt:** "Where should cyber-ops save security artifacts and documentation?"
   - **Default:** `_bmad-output/security`
   - **Result:** `{project-root}/{value}`
   - **Purpose:** Primary location for all security artifacts with automatic subdirectory organization

#### Static Fields (Auto-configured)

2. **module_code:** `cyber-ops`
3. **module_version:** `1.0.0`
4. **agents_path:** `{project-root}/_bmad/cyber-ops/agents`
5. **workflows_path:** `{project-root}/_bmad/cyber-ops/workflows`
6. **planning_artifacts:** `{output_folder}/planning` (auto-derived)
7. **operational_artifacts:** `{output_folder}/operations` (auto-derived)
8. **documentation:** `{output_folder}/docs` (auto-derived)
9. **user_skill_level:** `intermediate`

### Custom Installation Logic

**Custom installer.js:** Not required

The cyber-ops module uses standard BMAD installation procedures:
- File copying (agents, workflows)
- Config generation from user inputs
- Directory structure creation
- No special setup or external dependencies needed

### Installation Process

When users run `bmad install cyber-ops`, the following occurs:

1. **Welcome Message Display**
   ```
   🔒 Installing Cybersecurity Operations (Cyber-Ops) Module

   This module provides 6 specialized security agents:
     - Bastion (Security Architecture)
     - Cipher (Threat Intelligence)
     - Ghost (Penetration Testing)
     - Phoenix (Incident Response)
     - Sentinel (Compliance & Risk)
     - Trace (Digital Forensics)

   Expert cybersecurity guidance integrated into your BMAD workflow.
   ```

2. **Configuration Question**
   ```
   ⚙️  Where should cyber-ops save security artifacts and documentation?
   Default: _bmad-output/security

   [Press Enter to use default, or type custom path]
   > _
   ```

3. **Installation Actions**
   - Create `_bmad/cyber-ops/` directory structure
   - Copy 6 agent files to `_bmad/cyber-ops/agents/`
   - Copy 10 workflow folders to `_bmad/cyber-ops/workflows/`
   - Generate `_bmad/cyber-ops/config.yaml` with user settings
   - Create output folder structure (if doesn't exist)

4. **Post-Installation**
   - Users can invoke agents via: `/bmad:cyber-ops:agents:{agent-id}`
   - Configuration loaded from: `_bmad/cyber-ops/config.yaml`
   - Artifacts saved to user-configured output folder

### Configuration File Generated

**Location:** `_bmad/cyber-ops/config.yaml`

**Contents:**
```yaml
# Cyber-Ops Module Configuration
# Generated by BMAD installer
# Version: 1.0.0

project_name: [user's project name]
user_skill_level: intermediate
output_folder: "{project-root}/_bmad-output/security"

# Automatic subdirectories (created on first use)
planning_artifacts: "{output_folder}/planning"
operational_artifacts: "{output_folder}/operations"
documentation: "{output_folder}/docs"

# Core Configuration Values
user_name: [from global config]
communication_language: [from global config]
document_output_language: [from global config]

# Module Information
module_code: cyber-ops
module_version: 1.0.0
agents_path: "{project-root}/_bmad/cyber-ops/agents"
workflows_path: "{project-root}/_bmad/cyber-ops/workflows"
```

### Validation

✅ **YAML Syntax:** Valid (standard YAML format)
✅ **Required Fields:** All fields defined
✅ **Path Templates:** Properly templated with `{project-root}` and `{output_folder}`
✅ **Welcome Message:** Clear and informative
✅ **Configuration Question:** Single, simple question
✅ **Custom Logic:** Not needed - standard installation sufficient

### Installation Testing

To test installation (when module is ready):
```bash
# From module location
bmad install /Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops

# Or after publishing
bmad install cyber-ops
```

---

## Documentation

### README.md Created

**Location:** `/Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops/README.md`

**Sections Included:**
1. ✅ **Overview** - Clear purpose and value proposition with 5 key benefits
2. ✅ **Installation** - Simple bmad install command with configuration prompt details
3. ✅ **Components** - Comprehensive agent table (6 agents) and workflow list (10 workflows)
4. ✅ **Quick Start** - 4-step getting started guide (load agent → view commands → run workflow → party mode)
5. ✅ **Module Structure** - Complete directory tree visualization
6. ✅ **Configuration** - Settings explanation with all 5 key configuration fields
7. ✅ **Examples** - 3 detailed usage examples:
   - Security Architecture Review (Bastion)
   - Incident Response Planning (Phoenix with multi-agent coordination)
   - Compliance Audit Preparation (Sentinel)
8. ✅ **Development Status** - Current implementation state with phased checklist
9. ✅ **Contributing** - Module extension guidance
10. ✅ **Requirements** - BMAD version and optional integrations
11. ✅ **Module Details** - Technical metadata

**Content Highlights:**

- **Clear Installation Instructions:** Single command with explanation of configuration prompt
- **Component Overview:**
  - 6-column agent table with persona, domain, and capabilities
  - 10 workflows organized by priority (5 high, 2 medium, 3 optional)
  - Task and template placeholders for Phase 2
- **Quick Start Guide:**
  - Agent invocation examples for all 6 agents
  - Menu navigation instructions
  - Workflow triggering example
  - Party Mode collaboration example
- **Configuration Details:** All 5 configuration fields explained with paths
- **Usage Examples:**
  - Step-by-step walkthroughs
  - Expected outputs clearly defined
  - Multi-agent coordination demonstrated
- **Development Status:** Honest representation of current implementation phase (Foundation complete, workflows in planning)

**Documentation Quality:**

✅ Comprehensive coverage of all module aspects
✅ Accurate reflection of current module structure
✅ Clear agent → workflow → output pathways
✅ Realistic development status (no over-promising)
✅ Practical examples demonstrating real security scenarios
✅ Professional tone matching security domain
✅ User-friendly formatting with tables, code blocks, and structure visualization

---

## Development Roadmap

### TODO.md Created

**Location:** `/Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops/TODO.md`

**Phases Defined:** 4

1. **Phase 1: Core Workflows (MVP)** - 5 high-priority workflows + integration tasks
2. **Phase 2: Specialized Workflows** - 2 medium-priority workflows (Forensic, Risk Analysis)
3. **Phase 3: Party Mode Workflows** - 3 optional multi-agent collaboration workflows
4. **Phase 4: Polish and Launch** - Testing, documentation enhancements, release preparation

**Immediate Tasks Prioritized:**

**Top 3 Next Steps:**
1. **Security Architecture Review** (Bastion) - Most fundamental workflow, tests core capability
2. **Incident Response Playbook** (Phoenix) - Tests multi-agent coordination (Phoenix→Trace→Cipher)
3. **Threat Assessment** (Cipher) - Intelligence foundation, demonstrates MITRE ATT&CK integration

**Quick Reference Commands Included:**
- `/bmad:bmb:workflows:create-workflow` - Convert README blueprints to executable workflows
- Agent invocation commands for all 6 agents
- Menu command reference (AR, IRP, TA, PTP, CAP, etc.)
- Party Mode invocation for multi-agent scenarios
- Installation testing commands

**Development Notes:**
- **Agent Coordination:** Documented multi-agent handoff patterns (IR→Forensics→ThreatIntel)
- **Output Organization:** Planning vs Operational artifacts separation explained
- **Configuration Usage:** Path template usage documented ({output_folder}, {planning_artifacts})
- **README to workflow.md:** Conversion process clarified (blueprints → executable workflows)
- **Dependencies:** BMAD 6.0.0+ required, optional AgentVibes/BMM integrations
- **Implementation Strategy:** Iterative development recommended (one workflow at a time, test before next)

**Completion Criteria:**
- Phase 1: All 5 core workflows + integration testing
- Phase 2: 2 specialized workflows operational
- Phase 3: 3 Party Mode workflows functional
- Module 1.0: Full testing + documentation + real-world validation

---

## Component Development Priorities

### Phase 1: Foundation (Immediate)
1. ✅ Agent validation and conversion (COMPLETE)
2. ✅ Module concept definition (COMPLETE)
3. ✅ Component architecture planning (COMPLETE)
4. ✅ Module structure creation (COMPLETE)
5. ✅ Configuration planning (COMPLETE)
6. ✅ Agent migration (COMPLETE)
7. ✅ Workflow planning (COMPLETE)
8. ✅ Installation infrastructure setup (COMPLETE)
9. ✅ Module documentation (COMPLETE)
10. ✅ Development roadmap (COMPLETE)

### Phase 2: Core Workflows (Near-term)
1. Security Architecture Review workflow
2. Incident Response Playbook workflow
3. Compliance Audit Preparation workflow
4. Penetration Test Planning workflow
5. Threat Assessment workflow

### Phase 3: Enhanced Workflows (Future)
1. Forensic Investigation workflow
2. Risk Analysis workflow
3. Multi-agent Party Mode workflows (3 specialized scenarios)

### Phase 4: Documentation & Testing (Final)
1. Module README with quick start guide
2. Agent invocation reference
3. Workflow usage examples
4. Integration testing with BMM modules

---

## Next Steps

This module plan will guide the creation of:
1. ✅ Module concept definition (COMPLETE)
2. ✅ Component architecture planning (COMPLETE)
3. ⏳ Module structure creation (NEXT - Step 4)
4. ⏳ Workflow development (Phase 2-3)
5. ⏳ Installation and deployment infrastructure (Phase 1)
6. ⏳ Documentation and user guides (Phase 4)

