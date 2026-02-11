# BMM Module Setup

Complete setup guide for the BMAD-CYBER2 BMM (BMAD Method) development module.

---

## Overview

The BMM module provides 9 specialized software development agents covering the full product lifecycle from ideation through delivery. Based on the BMAD-METHOD framework with integrated security rules for BMAD-CYBER2.

| Attribute | Value |
|-----------|-------|
| **Version** | 6.0.0 |
| **Agents** | 9 |
| **Workflows** | 32 |
| **Focus** | Product development, agile delivery, testing |

---

## Prerequisites

- BMAD-CYBER2 framework installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- Development environment (Node.js, Python, etc. as needed)
- Git for version control

---

## Installation

### 1. Verify Module Files

```bash
# Check module directory exists
ls _bmad/bmm/

# Expected structure:
# agents/       - 9 agent definitions
# workflows/    - 32 workflow directories
# config.yaml   - Module configuration
# manifest.yaml - Permissions
# README.md     - Module documentation
```

### 2. Configure Module Settings

Edit `_bmad/bmm/config.yaml`:

```yaml
# User settings
user_name: "Your Name"
communication_language: "English"
output_folder: "docs"

# Project settings
project_root: "."
test_directory: "tests"
source_directory: "src"

# YOLO mode (skip confirmations) - for experienced users
yolo_mode: false
```

### 3. Set Up Authentication

```bash
# Generate token with developer role
node _bmad/core/security/quick-token.cjs "YourName" "developer" 168

# Set token
export BMAD_AUTH_TOKEN="<generated-token>"
```

### 4. Configure LLM Provider

BMM can use cloud LLM for most development work:

```yaml
# _bmad/_config/llm-config.yaml
# Default cloud is fine for development
# No special overrides needed
```

---

## Agents

### Product & Business (3 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **John** | Product Manager | Product strategy, PRD creation, prioritization | `/bmad:bmm:agents:pm` |
| **Sarah** | Business Analyst | Requirements gathering, user stories, analysis | `/bmad:bmm:agents:analyst` |
| **Emma** | UX Designer | User experience, wireframes, prototypes | `/bmad:bmm:agents:ux-designer` |

### Technical (3 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Winston** | Architect | System design, technical decisions, patterns | `/bmad:bmm:agents:architect` |
| **Devon** | Developer | Implementation, coding, refactoring | `/bmad:bmm:agents:developer` |
| **Murat** | Test Engineer | Testing strategy, automation, quality | `/bmad:bmm:agents:test-engineer` |

### Delivery (3 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Alex** | Scrum Master | Sprint management, ceremonies, facilitation | `/bmad:bmm:agents:scrum-master` |
| **Clara** | Tech Writer | Documentation, guides, API docs | `/bmad:bmm:agents:tech-writer` |
| **Solo Dev** | Solo Developer | Quick development flow for individual work | `/bmad:bmm:agents:solo-dev` |

---

## Workflows

### Product Planning (5 Workflows)

| Workflow | Lead Agent | Purpose |
|----------|------------|---------|
| Create Product Brief | Sarah | Initial product ideation |
| Create PRD | John + Sarah | Comprehensive requirements |
| Create Architecture | Winston | Technical design decisions |
| Create UX Design | Emma | User experience design |
| Check Implementation Readiness | All | Pre-implementation validation |

### Implementation (5 Workflows)

| Workflow | Lead Agent | Purpose |
|----------|------------|---------|
| Create Epics and Stories | Sarah | Break down into stories |
| Sprint Planning | Alex | Sprint scope and capacity |
| Create Story | Sarah | Individual story creation |
| Dev Story | Devon | Story implementation |
| Quick Dev | Solo Dev | Rapid development |

### Quality (2 Workflows)

| Workflow | Lead Agent | Purpose |
|----------|------------|---------|
| Code Review | Winston | Code quality review |
| Tech Spec | Winston | Technical specification |

### Testing - TestArch (10 Workflows)

| Workflow | Lead Agent | Purpose |
|----------|------------|---------|
| Test Design | Murat | Test strategy design |
| Test Framework | Murat | Framework setup |
| ATDD | Murat | Acceptance test design |
| Test Automate | Murat | Automation implementation |
| Test Review | Murat | Test quality review |
| Test CI | Murat | CI/CD integration |
| Test Trace | Murat | Requirement traceability |
| Test NFR | Murat | Non-functional requirements |
| Test Performance | Murat | Performance testing |
| Test Security | Murat | Security testing |

### Documentation (3 Workflows)

| Workflow | Lead Agent | Purpose |
|----------|------------|---------|
| Workflow Status | Alex | Project status tracking |
| Document Project | Clara | Project documentation |
| Index Docs | Clara | Documentation index |

### Visualization (4 Workflows)

| Workflow | Lead Agent | Purpose |
|----------|------------|---------|
| Create Excalidraw Diagram | Winston | Architecture diagrams |
| Create Excalidraw Dataflow | Winston | Data flow diagrams |
| Create Excalidraw Flowchart | Winston | Process flowcharts |
| Create Excalidraw Wireframe | Emma | UI wireframes |

---

## First Workflow: Quick Dev

For rapid individual development tasks.

### Step 1: Launch Agent

```bash
/bmad:bmm:agents:solo-dev
```

Solo Dev is ready for quick development work.

### Step 2: Select Workflow

```bash
> Quick Dev
```

### Step 3: Describe the Task

```
Solo Dev: What would you like to build?
> [Describe your development task]
```

### Step 4: Development Flow

Solo Dev guides you through:

1. **Requirements clarification**
2. **Quick design** (if needed)
3. **Implementation**
4. **Basic testing**
5. **Documentation** (minimal)

---

## First Workflow: Create PRD

Full product requirements document workflow.

### Step 1: Launch PM Agent

```bash
/bmad:bmm:agents:pm
```

John (Product Manager) is ready.

### Step 2: Select PRD Workflow

```bash
> Create PRD
```

### Step 3: Collaborative Discovery

John and Sarah work together through:

1. **Vision and Goals** - What problem are we solving?
2. **User Personas** - Who are the users?
3. **User Stories** - What do users need?
4. **Functional Requirements** - What features?
5. **Non-Functional Requirements** - Performance, security?
6. **Success Metrics** - How do we measure success?
7. **Timeline and Phases** - When and how?
8. **Risks and Dependencies** - What could go wrong?

### Step 4: Review PRD

Output saved to configured output folder.

---

## Module Permissions

From `manifest.yaml`:

```yaml
permissions:
  filesystem:
    read: ["**"]
    write: ["src/**", "tests/**", "docs/**"]
  network: true
  shell:
    allowed_commands: ["git", "npm", "python", "pytest", "node"]
    blocked_commands: ["rm -rf", "sudo"]
  sensitive_data: false
```

**Key Points:**

- Full read access to codebase
- Write access to src, tests, docs
- Development commands allowed (git, npm, python, pytest, node)
- Dangerous commands blocked
- Cloud LLM acceptable (sensitive_data: false)

---

## Development Workflow Patterns

### Full Product Development

```
1. /bmad:bmm:agents:analyst → Create Product Brief
2. /bmad:bmm:agents:pm → Create PRD
3. /bmad:bmm:agents:architect → Create Architecture
4. /bmad:bmm:agents:ux-designer → Create UX Design
5. /bmad:bmm:agents:analyst → Create Epics and Stories
6. /bmad:bmm:agents:scrum-master → Sprint Planning
7. /bmad:bmm:agents:developer → Dev Story (repeat per story)
8. /bmad:bmm:agents:test-engineer → Test workflows
9. /bmad:bmm:agents:tech-writer → Document Project
```

### Quick Feature Development

```
1. /bmad:bmm:agents:solo-dev → Quick Dev
```

### Test-Driven Development

```
1. /bmad:bmm:agents:test-engineer → Test Design
2. /bmad:bmm:agents:test-engineer → ATDD
3. /bmad:bmm:agents:developer → Dev Story
4. /bmad:bmm:agents:test-engineer → Test Automate
```

---

## Party Mode Scenarios

### Architecture Review

```bash
/bmad:bmm:agents:architect
> PM
> Select: developer, test-engineer
```

**Purpose:** Technical review with implementation and testing perspective.

### Sprint Planning

```bash
/bmad:bmm:agents:scrum-master
> PM
> Select: pm, developer, analyst
```

**Purpose:** Full team sprint planning.

### Cross-Module: Development with Security

```bash
/bmad:bmm:agents:architect
> PM
> Select: cybersec-team:security-architect, cybersec-team:webapp-security
```

**Purpose:** Secure architecture design.

### Cross-Module: Development with Legal

```bash
/bmad:bmm:agents:pm
> PM
> Select: legal-team:insignia
```

**Purpose:** Product planning with IP considerations.

---

## Shell Commands

BMM agents can execute development commands:

| Command | Purpose |
|---------|---------|
| `git` | Version control operations |
| `npm` | Node.js package management |
| `node` | Node.js execution |
| `python` | Python execution |
| `pytest` | Python testing |

**Blocked:**

- `rm -rf` - Prevent accidental deletion
- `sudo` - Prevent privilege escalation

---

## Project Structure Convention

BMM follows standard project structure:

```
/project
├── src/           # Source code (BMM write access)
├── tests/         # Test code (BMM write access)
├── docs/          # Documentation (BMM write access)
├── _bmad/         # BMAD framework
│   └── bmm/
│       └── output/ # Workflow artifacts
└── package.json   # Project config
```

---

## Troubleshooting

### Agent Not Loading

```bash
# Verify agent file exists
ls _bmad/bmm/agents/

# Check command registration
ls .claude/commands/bmad/bmm/agents/
```

### Workflow Not Starting

```bash
# Check workflow exists
ls _bmad/bmm/workflows/

# Load directly
Load workflow: _bmad/bmm/workflows/create-prd/workflow.md
```

### Shell Commands Failing

```bash
# Verify commands are in allowed list
# Only git, npm, python, pytest, node are allowed

# For other commands, run manually outside BMAD
```

### Permission Denied on File Write

```bash
# BMM can only write to:
# - src/**
# - tests/**
# - docs/**

# For other locations, adjust manifest.yaml or move output folder
```

---

## Best Practices

1. **Start with planning** - Use Product Brief and PRD before coding
2. **Architecture first** - Run Create Architecture before implementation
3. **Test early** - Use TestArch workflows throughout development
4. **Document as you go** - Use tech writer for ongoing documentation
5. **Sprint rhythm** - Use Sprint Planning for organized delivery
6. **Quick Dev for small tasks** - Solo Dev is efficient for individual work
7. **Cross-module for security** - Add cybersec agents for secure development

---

## Related Documentation

- [CLI-COMMAND-REFERENCE.md](../CLI-COMMAND-REFERENCE.md) - Command syntax
- [PARTY-MODE-GUIDE.md](../PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [CONFIGURATION-GUIDE.md](../CONFIGURATION-GUIDE.md) - Configuration options
- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) - Original framework
- [Module README](_bmad/bmm/README.md) - Detailed module documentation
