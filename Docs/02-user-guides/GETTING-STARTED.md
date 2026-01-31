# Getting Started

Complete guide to installing and using BMAD modules.

---

## Prerequisites

- [BMAD Framework](https://github.com/bmad-code-org/BMAD-METHOD) installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- Git (for cloning)
- **Optional:** Local LLM (Ollama, LM Studio, vLLM) for sensitive data

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/SchenLong/BMAD-CYBER2.git
cd BMAD-CYBER2

# The modules are ready to use!
# Agents and workflows are pre-configured
```

### Verify Framework Integrity (Recommended)

Before first use, verify that framework files haven't been tampered with:

```bash
# Import the signing key (one-time)
gpg --import _bmad/core/security/bmad-public-key.asc

# Verify all critical files (679 agents, workflows, configs)
./_bmad/core/security/verify-integrity.sh
```

If verification passes, you'll see:
```
╔════════════════════════════════════════════════════════════════╗
║            ALL INTEGRITY CHECKS PASSED                         ║
╚════════════════════════════════════════════════════════════════╝
```

See [Security-File-Integrity.md](../06-reference/features/Security/Security-File-Integrity.md) for details.

### Security Setup (Recommended)

BMAD includes 19 security validators protecting against OWASP Top 10 for LLM Applications threats. Security is enabled by default.

**Security Audit (2026-01-16):** All security systems have been audited and all critical findings remediated. See [Security Audit Report](../05-project-management/planning/security-audits/BMAD-Security-Audit-Report.md) for details.

#### Token Authentication

```bash
# Generate authentication token (valid for 7 days)
node _bmad/core/security/quick-token.js "YourName" "developer" 168

# Set token for session
export BMAD_AUTH_TOKEN="<generated-token>"

# Or save to file
echo "<token>" > .bmad-token
```

#### Verify Security Configuration

```bash
# Check all security validators
python3 -c "import sys; sys.path.insert(0, '.claude/validators'); from security_common import AuditLogger; print('Security validators loaded')"

# Test token validation
node _bmad/core/security/validate-token.js

# Check authorization
node _bmad/core/security/check-authorization.js
```

#### OWASP Compliance (Score: 93/100)

BMAD provides protection against:
- **LLM01**: Prompt Injection (jailbreak detection)
- **LLM04**: DoS (rate limiting, resource limits)
- **LLM05**: Supply Chain (plugin verification)
- **LLM07**: Plugin Security (capability-based permissions)
- **LLM09**: Overreliance (confidence scoring)

See [Security Documentation](Security/README.md) for complete details.

#### Context Efficiency (CONCURA)

BMAD includes a tiered context loading system that reduces token consumption by **8.75x**. This is enabled by default and requires no configuration. See [CONTEXT-EFFICIENCY.md](../06-reference/features/CONTEXT-EFFICIENCY.md) for details.

---

## Quick Start

### 1. Launch an Agent

```bash
# Open Claude Code CLI and invoke any agent:

# Cybersec-Team Agents
/security-architect    # Bastion - Architecture & Defense
/threat-analyst        # Cipher - Threat Intelligence
/penetration-tester    # Ghost - Offensive Security
/incident-commander    # Phoenix - Incident Response
/compliance-guardian   # Sentinel - Compliance & Risk
/forensic-investigator # Trace - Digital Forensics
/soc-analyst           # Watchman - SOC Operations
/cloud-security        # Nimbus - Cloud Security
/blockchain-security   # Ledger - Web3 Security
/webapp-security       # Weaver - Web App Security
/api-security          # Gateway - API Security
/llm-security          # Oracle - AI/LLM Security
/blue-team-lead        # Shield - Blue Team Operations
/mobile-security       # Phantom - Mobile Security
/social-engineer       # Specter - Social Engineering

# Strategy-Team Agents
/strategy-team:policy-analyst         # Augustus - Evidence-based policy
/strategy-team:the-realist            # Niccolo - Realpolitik perspective
/strategy-team:the-master-strategist  # Sun - Strategic wisdom
/strategy-team:the-principled-commander # Jean-Luc - Principled leadership

# Intel-Team Agents
/intel-team:osint-lead           # Vector - Intelligence Director
/intel-team:domain-intel-specialist # Resolver - Domain Intelligence
/intel-team:social-media-analyst # Echo - SOCMINT
/intel-team:dark-web-analyst     # Shadow - DARKINT

# Legal-Team Agents (Party Mode support only)
# Core Team
/legal-team:counsel              # General Counsel - Team Director
/legal-team:liberty              # US Law Specialist
/legal-team:europa               # EU Law Specialist
/legal-team:castile              # Spanish Law Specialist
/legal-team:covenant             # Contract Specialist
/legal-team:tribute              # Tax Counsel
/legal-team:advocate             # Litigation Strategist
# Extended Team
/legal-team:iberia               # Spain Civil Law
/legal-team:gremio               # Spain Labor Law
/legal-team:baltic               # Estonia Corporate
/legal-team:charter              # Corporate Governance
/legal-team:insignia             # IP Counsel
/legal-team:deed                 # Real Estate Counsel
```

### 2. Run a Workflow

**From an agent:**
```
> Select workflow from agent menu
> Or type workflow command (e.g., "SR" for Security Review)
```

**Direct workflow loading:**
```
Load workflow: _bmad/cybersec-team/workflows/virtual-ciso-consulting/workflow.md
```

### 3. Multi-Agent Collaboration (Party Mode)

```bash
# From any agent
> PM

# Select multiple agents for complex scenarios:
# Example: Architecture Review = Bastion + Ghost
# Example: Incident Response = Phoenix + Trace + Cipher
# Example: Compliance Audit = Sentinel + Bastion
```

---

## Usage Examples

### Example 1: Security Architecture Review

```bash
# Launch Bastion
/security-architect

# Select Security Review
> SR

# Bastion guides you through:
1. Architecture documentation gathering
2. STRIDE threat modeling
3. Control assessment
4. Attack surface analysis
5. Zero-trust validation
6. Recommendations and roadmap
7. Executive report generation
```

**Output:** Comprehensive security architecture review with actionable recommendations

---

### Example 2: Incident Response

```bash
# During an active incident
/incident-commander

# Phoenix takes command:
> Execute guided incident response

# Leads you through:
1. Incident classification and severity
2. Initial triage and containment
3. Evidence preservation
4. Analysis and investigation
5. Eradication planning
6. Recovery coordination
7. Post-incident review
8. Lessons learned documentation
```

**Output:** Complete incident documentation meeting compliance requirements

---

### Example 3: Compliance Audit Prep

```bash
# Preparing for SOC 2 audit
/compliance-guardian

# Sentinel executes:
> Compliance Audit Preparation

# Guides through:
1. Framework selection (SOC 2)
2. Control inventory
3. Gap assessment
4. Evidence planning
5. Remediation prioritization
6. Audit artifact generation
```

**Output:** Audit-ready compliance package with evidence inventory

---

### Example 4: Intelligence Campaign

```bash
# Launch Vector
/intel-team:osint-lead

# Vector coordinates:
> Operation Mosaic

# Multi-INT collection:
1. Target profiling and requirements
2. Domain infrastructure mapping (Resolver)
3. Social media analysis (Echo)
4. Dark web reconnaissance (Shadow)
5. Technical footprinting (Probe)
6. Corporate structure mapping (Proxy)
7. Geospatial analysis (Atlas)
8. Threat correlation (Dossier)
9. Intelligence fusion and reporting
```

**Output:** Comprehensive intelligence package with multi-source corroboration

---

### Example 5: Executive Decision Workshop

```bash
# Strategic decision with multiple perspectives
/strategy-team:the-master-strategist

# Use Party Mode for full council
> PM
> Use strategic-council preset

# All 8 archetype advisors debate:
- Sun (Strategy) vs Burke (Conservatism)
- Niccolo (Realism) vs Charles (Idealism)
- Lee (Systems) vs Maximilien (Revolution)
- Musashi (Timing) vs Jean-Luc (Principles)
```

**Output:** Multi-perspective decision analysis with documented trade-offs

---

## LLM Provider Selection

BMAD supports multiple LLM providers. Choose based on your data sensitivity requirements.

### Quick Provider Switch

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Switch to local LLM (for sensitive data)
.claude/hooks/llm-provider-manager.sh set ollama

# Switch to cloud (for general use)
.claude/hooks/llm-provider-manager.sh set claude

# Check provider health
.claude/hooks/llm-provider-manager.sh health-all
```

### When to Use Local LLM

| Data Type | Recommended Provider |
|-----------|---------------------|
| Security incidents, breach data | Local (Ollama) |
| Intelligence operations, PII | Local (Ollama) |
| Legal matters, privileged communications | Local (Ollama) |
| M&A, trade secrets | Local (Ollama) |
| General development, public info | Either |

### Configure Automatic Routing

Route specific modules or agents to local LLM in `_bmad/_config/llm-config.yaml`:

```yaml
# Module routing
module_overrides:
  cybersec-team: ollama    # All security agents use local
  intel-team: ollama       # All intel agents use local

# Agent routing (overrides module)
agent_overrides:
  cybersec-team/forensic-investigator: ollama   # Always local
  legal-team/counsel: ollama                    # Always local
```

See [LLM Provider System](LLM-PROVIDER-SYSTEM.md) and [Data Sensitivity Guide](DATA-SENSITIVITY-GUIDE.md) for details.

---

## Advanced Features

### Multi-Session Continuation

All workflows support pausing and resuming:

```bash
# Start a workflow
/compliance-guardian > Compliance Audit

# Work for 2 hours, then stop
# Later: Resume from exactly where you left off
/compliance-guardian > Compliance Audit
# Automatically detects existing document and continues
```

### Agent Customization

Customize agent behavior via customize files:

```yaml
# _bmad/_config/agents/cybersec-team-security-architect.customize.yaml
preferences:
  verbosity: high              # low | medium | high
  output_format: markdown      # markdown | json
  default_framework: NIST_CSF  # Preferred framework
```

### Party Mode Scenarios

**Scenario 1: Architecture Security Review**
```
Agents: Bastion + Ghost + Nimbus
Purpose: Defensive design + offensive validation + cloud security
```

**Scenario 2: Incident Response**
```
Agents: Phoenix + Trace + Cipher + Watchman
Purpose: Command + forensics + threat intel + SOC operations
```

**Scenario 3: Compliance Assessment**
```
Agents: Sentinel + Bastion + Nimbus
Purpose: Compliance + architecture + cloud compliance
```

**Scenario 4: Web3/Blockchain Audit**
```
Agents: Ledger + Weaver + Gateway
Purpose: Smart contracts + web app + API security
```

**Scenario 5: Full-Stack Application Security**
```
Agents: Weaver + Gateway + Oracle + Phantom
Purpose: Web + API + AI + mobile security
```

**Scenario 6: Purple Team Exercise**
```
Agents: Shield + Ghost + Watchman + Cipher
Purpose: Blue team + red team + SOC + threat intel
```

**Scenario 7: Multi-INT Intelligence Fusion**
```
Agents: Vector + Resolver + Echo + Shadow + Atlas + Probe
Purpose: All-source intelligence coordination
```

**Scenario 8: Cross-Module with Legal Support**
```
Agents: Bastion + Sentinel + Counsel + Covenant
Purpose: Security architecture with compliance and legal review
```

**Scenario 9: Executive Decision with Legal**
```
Agents: Sun + Augustus + Counsel + Europa
Purpose: Strategic planning with legal and regulatory input
```

> ⚠️ **Note:** Legal-Team agents are designed for Party Mode support only. See the Legal-Team disclaimer in [AGENTS-REFERENCE.md](./AGENTS-REFERENCE.md).

---

## Troubleshooting

### Common Issues

**Agent not loading:**
```bash
# Check agent path
ls _bmad/cybersec-team/agents/

# Verify Claude commands exist
ls .claude/commands/bmad/cybersec-team/agents/
```

**Workflow not found:**
```bash
# Check workflow path
ls _bmad/cybersec-team/workflows/

# Load directly
Load workflow: _bmad/cybersec-team/workflows/[workflow-name]/workflow.md
```

**Party Mode issues:**
```bash
# Ensure agents are loaded first
/security-architect
> PM
> Select additional agents
```

### Getting Help

- **Documentation:** Each workflow has a README.md
- **Agent Menus:** Type 'H' or 'help' in any agent
- **GitHub Issues:** For bugs and feature requests

---

## Next Steps

1. **Explore Agents:** Read [AGENTS-REFERENCE.md](./AGENTS-REFERENCE.md) for complete agent details
2. **Review Workflows:** See [WORKFLOWS-REFERENCE.md](./WORKFLOWS-REFERENCE.md) for all workflow documentation
3. **Try Party Mode:** Combine agents for complex scenarios
4. **Customize:** Adjust agent preferences for your needs

---

## Module-Specific Documentation

- **Cybersec-Team:** [_bmad/cybersec-team/README.md](../_bmad/cybersec-team/README.md)
- **Intel-Team:** [_bmad/intel-team/README.md](../_bmad/intel-team/README.md)
- **Strategy-Team:** [_bmad/strategy-team/README.md](../_bmad/strategy-team/README.md)
- **Legal-Team:** [_bmad/legal-team/README.md](../_bmad/legal-team/README.md) ⚠️ Party Mode support only

---

## External Resources

- [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) - Main BMAD framework
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [CIS Controls](https://www.cisecurity.org/controls)
