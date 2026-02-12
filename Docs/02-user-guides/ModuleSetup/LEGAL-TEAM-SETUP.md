# Legal-Team Module Setup

Complete setup guide for the BMAD-CYBER2 Legal Team module.

---

## Important Disclaimer

> **The Legal-Team module is designed for Party Mode support and team orchestration only.**
>
> The module creator is NOT a legal professional. This module:
>
> - Does NOT provide legal advice
> - Does NOT replace qualified legal counsel
> - Is intended for workflow orchestration and document drafting assistance
> - Should be used alongside actual legal professionals
>
> Always consult qualified legal professionals for legal matters.

---

## Overview

The Legal-Team module provides 13 specialized legal agents covering US, EU, Spanish, and Estonian jurisdictions. Designed for multi-jurisdictional legal workflow support with Party Mode integration.

| Attribute | Value |
|-----------|-------|
| **Version** | 1.1.0 |
| **Agents** | 13 |
| **Workflows** | 7 |
| **Jurisdictions** | US, EU, Spain, Estonia, Cross-Border |

---

## Prerequisites

- BMAD-CYBER2 framework installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- **Required:** Local LLM (Ollama) for privileged communications
- Understanding that this is NOT legal advice

---

## Installation

### 1. Verify Module Files

```bash
# Check module directory exists
ls _bmad/legal-team/

# Expected structure:
# agents/       - 13 agent definitions
# workflows/    - 7 workflow directories
# config.yaml   - Module configuration
# manifest.yaml - Permissions
# README.md     - Module documentation
```

### 2. Configure Module Settings

Edit `_bmad/legal-team/config.yaml`:

```yaml
# User settings
user_name: "Your Name"
communication_language: "English"
output_folder: "_bmad/legal-team/output"

# Jurisdiction preferences
primary_jurisdiction: "US"
secondary_jurisdictions: ["EU", "ES"]

# YOLO mode - NEVER enable for legal work
yolo_mode: false
```

### 3. Set Up Authentication

```bash
# Generate token with legal role
node _bmad/core/security/quick-token.cjs "YourName" "legal_analyst" 168

# Set token
export BMAD_AUTH_TOKEN="<generated-token>"
```

### 4. Configure LLM Provider (Required)

Legal communications should ALWAYS use local LLM:

```yaml
# _bmad/_config/llm-config.yaml
module_overrides:
  legal-team: ollama    # CRITICAL: Privileged communications stay local
```

---

## Agents

### Core Legal Team (7 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Counsel** | General Counsel | Case intake, jurisdiction routing, team coordination | `/legal-team:counsel` |
| **Liberty** | US Counsel | Federal and state US law, corporate law, civil matters | `/legal-team:liberty` |
| **Europa** | EU Counsel | EU law, cross-border coordination, GDPR | `/legal-team:europa` |
| **Castile** | Spain Corporate Counsel | Spanish business law, corporate, M&A | `/legal-team:castile` |
| **Covenant** | Contract Specialist | Contract drafting, review, negotiation | `/legal-team:covenant` |
| **Tribute** | Tax Counsel | US, EU, Spain, Estonia tax planning | `/legal-team:tribute` |
| **Advocate** | Litigation Strategist | Dispute resolution, pre-litigation, settlement | `/legal-team:advocate` |

### Extended Legal Team (6 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Iberia** | Spain Civil Law Counsel | Family, property, inheritance, personal matters | `/legal-team:iberia` |
| **Gremio** | Spain Labor Law Counsel | Employment and labor law | `/legal-team:gremio` |
| **Baltic** | Estonia Corporate Counsel | e-Residency, digital business, EU gateway | `/legal-team:baltic` |
| **Charter** | Corporate Governance | Board matters, fiduciary duties, compliance | `/legal-team:charter` |
| **Insignia** | IP Counsel | Trademarks, patents, copyrights, licensing | `/legal-team:insignia` |
| **Deed** | Real Estate Counsel | Property transactions, leases, real property | `/legal-team:deed` |

---

## Workflows

### Available Workflows (7)

| # | Workflow | Steps | Purpose |
|---|----------|-------|---------|
| 1 | Legal Matter Intake | 8 | Initial case assessment and routing |
| 2 | Contract Review | 9 | Comprehensive contract analysis |
| 3 | Contract Drafting | 9 | Create jurisdiction-appropriate contracts |
| 4 | Dispute Strategy | 10 | Dispute analysis and resolution planning |
| 5 | Corporate Formation | 10 | Multi-jurisdictional entity structuring |
| 6 | Tax Planning | 10 | Cross-jurisdictional tax optimization |
| 7 | Cross-Border Matter | 10 | Multi-jurisdictional coordination |

---

## First Workflow: Legal Matter Intake

All legal matters should begin with intake to ensure proper routing.

### Step 1: Launch Agent

```bash
/legal-team:counsel
```

Counsel (General Counsel) greets you with the menu.

### Step 2: Select Workflow

```bash
> Legal Matter Intake
# Or: > LI
```

### Step 3: Describe the Matter

```
Counsel: Please describe the legal matter.
> [Describe your situation]
```

### Step 4: Receive Routing

Counsel analyzes and routes to appropriate:

- Jurisdiction specialist(s)
- Practice area expert(s)
- Recommended workflow(s)

### Step 5: Proceed with Specialized Workflow

Based on routing, Counsel may recommend:

- Contract Review for agreement analysis
- Dispute Strategy for conflict situations
- Corporate Formation for entity structuring
- Cross-Border Matter for multi-jurisdiction issues

---

## Party Mode Usage

The Legal-Team is primarily designed for Party Mode collaboration with other modules.

### Cross-Module with Security

```bash
/security-architect
> PM
> Select: legal-team:counsel, legal-team:covenant
```

**Purpose:** Security architecture with legal review of policies and contracts.

### Cross-Module with Strategy

```bash
/strategy-team:the-master-strategist
> PM
> Select: legal-team:counsel, legal-team:europa
```

**Purpose:** Strategic planning with legal and regulatory input.

### Cross-Module with Intel

```bash
/intel-team:corporate-intel-specialist
> PM
> Select: legal-team:counsel
```

**Purpose:** Due diligence with legal framework guidance.

### Multi-Jurisdiction Legal

```bash
/legal-team:counsel
> PM
> Select: liberty, europa, castile, baltic
```

**Purpose:** Cross-border matter requiring multiple jurisdiction expertise.

---

## Module Permissions

From `manifest.yaml`:

```yaml
permissions:
  filesystem:
    read: ["_bmad/legal-team/**", "docs/**", "_bmad/core/**"]
    write: ["_bmad/legal-team/output/**", "docs/legal/**"]
  network: true
  shell:
    allowed_commands: []
    blocked_commands: ["*"]
  sensitive_data: true
```

**Key Points:**

- No shell commands allowed (security restriction)
- Network access for legal research
- Sensitive data flag enabled (triggers local LLM routing)
- Can write to both output and docs/legal folders

---

## Data Sensitivity

### Always Use Local LLM

**ALL legal-team operations should use local LLM.** Legal communications may be privileged.

```yaml
# _bmad/_config/llm-config.yaml
module_overrides:
  legal-team: ollama    # Non-negotiable for legal work
```

### Privilege Considerations

| Content Type | Sensitivity | Notes |
|--------------|-------------|-------|
| Attorney-client communications | CRITICAL | Privileged |
| Work product | CRITICAL | Protected |
| Contract drafts | HIGH | Business confidential |
| Dispute strategy | CRITICAL | Litigation privilege |
| Tax planning | HIGH | Confidential |
| Due diligence findings | HIGH | Business confidential |

---

## Jurisdiction Coverage

### United States (Liberty)

- Federal law
- State law (general principles)
- Corporate law
- Civil litigation
- Regulatory compliance

### European Union (Europa)

- EU regulations and directives
- GDPR and data protection
- Cross-border coordination
- EU corporate law
- Competition law

### Spain (Castile, Iberia, Gremio)

- **Castile:** Commercial, corporate, M&A
- **Iberia:** Civil code, family, inheritance
- **Gremio:** Labor and employment

### Estonia (Baltic)

- e-Residency programs
- Digital business structures
- EU gateway operations
- Tech startup formation

---

## Troubleshooting

### Agent Not Loading

```bash
# Verify agent file exists
ls _bmad/legal-team/agents/

# Check command registration
ls .claude/commands/bmad/legal-team/agents/
```

### Workflow Not Starting

```bash
# Check workflow exists
ls _bmad/legal-team/workflows/

# Load directly
Load workflow: _bmad/legal-team/workflows/legal-matter-intake/workflow.md
```

### Shell Commands Blocked

This is by design. Legal agents cannot execute shell commands for security reasons.

### Multi-Jurisdiction Confusion

Always start with Legal Matter Intake. Counsel will route to the appropriate jurisdiction specialists.

```bash
/legal-team:counsel
> Legal Matter Intake
```

---

## Best Practices

1. **Start with Intake** - Always begin with Legal Matter Intake for routing
2. **Use Local LLM** - Legal communications must stay local
3. **Party Mode preferred** - Combine with other modules for context
4. **Not legal advice** - Always involve qualified legal professionals
5. **Document everything** - Workflows create audit trails
6. **Multi-jurisdiction matters** - Use Cross-Border workflow
7. **Privilege protection** - Treat all output as potentially privileged

---

## Related Documentation

- [CLI-COMMAND-REFERENCE.md](../CLI-COMMAND-REFERENCE.md) - Command syntax
- [PARTY-MODE-GUIDE.md](../PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [DATA-SENSITIVITY-GUIDE.md](../DATA-SENSITIVITY-GUIDE.md) - LLM routing decisions
- [LLM-PROVIDER-SYSTEM.md](../LLM-PROVIDER-SYSTEM.md) - Provider configuration
- [Module README](_bmad/legal-team/README.md) - Detailed module documentation
