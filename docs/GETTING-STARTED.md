# Getting Started

Complete guide to installing and using BMAD modules.

---

## Prerequisites

- [BMAD Framework](https://github.com/bmad-code-org/BMAD-METHOD) installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- Git (for cloning)

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/BMAD-CYBER2.git
cd BMAD-CYBER2

# The modules are ready to use!
# Agents and workflows are pre-configured
```

---

## Quick Start

### 1. Launch an Agent

```bash
# Open Claude Code CLI and invoke any agent:

# Cyber-Ops Agents
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

# Exec-Ops Agents
/exec-ops:policy-analyst         # Augustus - Evidence-based policy
/exec-ops:the-realist            # Niccolo - Realpolitik perspective
/exec-ops:the-master-strategist  # Sun - Strategic wisdom
/exec-ops:the-principled-commander # Jean-Luc - Principled leadership

# Intel-Team Agents
/intel-team:osint-lead           # Vector - Intelligence Director
/intel-team:domain-intel-specialist # Resolver - Domain Intelligence
/intel-team:social-media-analyst # Echo - SOCMINT
/intel-team:dark-web-analyst     # Shadow - DARKINT
```

### 2. Run a Workflow

**From an agent:**
```
> Select workflow from agent menu
> Or type workflow command (e.g., "SR" for Security Review)
```

**Direct workflow loading:**
```
Load workflow: _bmad/cyber-ops/workflows/virtual-ciso-consulting/workflow.md
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
/exec-ops:the-master-strategist

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
# _bmad/_config/agents/cyber-ops-security-architect.customize.yaml
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

---

## Troubleshooting

### Common Issues

**Agent not loading:**
```bash
# Check agent path
ls _bmad/cyber-ops/agents/

# Verify Claude commands exist
ls .claude/commands/bmad/cyber-ops/agents/
```

**Workflow not found:**
```bash
# Check workflow path
ls _bmad/cyber-ops/workflows/

# Load directly
Load workflow: _bmad/cyber-ops/workflows/[workflow-name]/workflow.md
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

1. **Explore Agents:** Read [AGENTS.md](./AGENTS.md) for complete agent details
2. **Review Workflows:** See [WORKFLOWS.md](./WORKFLOWS.md) for all workflow documentation
3. **Try Party Mode:** Combine agents for complex scenarios
4. **Customize:** Adjust agent preferences for your needs

---

## Module-Specific Documentation

- **Cyber-Ops:** [_bmad/cyber-ops/README.md](../_bmad/cyber-ops/README.md)
- **Intel-Team:** [_bmad/intel-team/README.md](../_bmad/intel-team/README.md)
- **Exec-Ops:** [_bmad/exec-ops/README.md](../_bmad/exec-ops/README.md)

---

## External Resources

- [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) - Main BMAD framework
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [CIS Controls](https://www.cisecurity.org/controls)
