# Cybersec-Team Module Setup

Complete setup guide for the BMAD-CYBER2 Cybersecurity Team module.

---

## Overview

The Cybersec-Team module provides 15 specialized security agents covering defensive architecture, offensive testing, incident response, compliance, and specialized domains including cloud, blockchain, and AI security.

| Attribute | Value |
|-----------|-------|
| **Version** | 1.3.1 |
| **Agents** | 15 |
| **Workflows** | 13 |
| **Frameworks** | NIST CSF, MITRE ATT&CK, STRIDE, OWASP, CIS, ISO 27001, SOC 2, PCI-DSS, HIPAA, GDPR |

---

## Prerequisites

- BMAD-CYBER2 framework installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- **Recommended:** Local LLM (Ollama) for sensitive security data
- **Optional:** API access for reconnaissance tools (Shodan, VirusTotal, etc.)

---

## Installation

### 1. Verify Module Files

```bash
# Check module directory exists
ls _bmad/cybersec-team/

# Expected structure:
# agents/       - 15 agent definitions
# workflows/    - 13 workflow directories
# config.yaml   - Module configuration
# manifest.yaml - Permissions
# README.md     - Module documentation
```

### 2. Configure Module Settings

Edit `_bmad/cybersec-team/config.yaml`:

```yaml
# User settings
user_name: "Your Name"
communication_language: "English"
output_folder: "_bmad/cybersec-team/output"

# Default framework preference
default_framework: "NIST_CSF"

# YOLO mode (skip confirmations) - use cautiously
yolo_mode: false
```

### 3. Set Up Authentication

```bash
# Generate token with security role
node _bmad/core/security/quick-token.cjs "YourName" "security_analyst" 168

# Set token
export BMAD_AUTH_TOKEN="<generated-token>"
```

### 4. Configure LLM Provider (Recommended)

For security work, route to local LLM:

```yaml
# _bmad/_config/llm-config.yaml
module_overrides:
  cybersec-team: ollama    # All security work stays local
```

---

## Agents

### Core Security Team (6 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Bastion** | Security Architect | Defense architecture, zero-trust, security design | `/security-architect` |
| **Cipher** | Threat Analyst | Threat intelligence, MITRE ATT&CK, IOC analysis | `/threat-analyst` |
| **Ghost** | Penetration Tester | Offensive security, red team, vulnerability exploitation | `/penetration-tester` |
| **Phoenix** | Incident Commander | Incident response, crisis management, recovery | `/incident-commander` |
| **Sentinel** | Compliance Guardian | GRC, regulatory compliance, audit preparation | `/compliance-guardian` |
| **Trace** | Forensic Investigator | Digital forensics, evidence collection, chain of custody | `/forensic-investigator` |

### Extended Security Team (9 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Watchman** | SOC Analyst | Security operations, monitoring, alert triage | `/soc-analyst` |
| **Nimbus** | Cloud Security | AWS/Azure/GCP security, cloud-native defense | `/cloud-security` |
| **Ledger** | Blockchain Security | Smart contracts, Web3, DeFi security | `/blockchain-security` |
| **Weaver** | Web App Security | OWASP Top 10, web vulnerabilities, WAF | `/webapp-security` |
| **Gateway** | API Security | REST/GraphQL security, API gateway, OAuth | `/api-security` |
| **Oracle** | LLM Security | AI/ML security, prompt injection, model attacks | `/llm-security` |
| **Shield** | Blue Team Lead | Defensive operations, detection engineering | `/blue-team-lead` |
| **Phantom** | Mobile Security | iOS/Android security, mobile app testing | `/mobile-security` |
| **Specter** | Social Engineer | Phishing, pretexting, awareness training | `/social-engineer` |

---

## Workflows

### Available Workflows (13)

| # | Workflow | Steps | Lead Agent | Purpose |
|---|----------|-------|------------|---------|
| 1 | Incident Response Playbook | 19 | Phoenix | Active incident handling |
| 2 | Security Architecture Review | 8 | Bastion | Architecture assessment |
| 3 | STRIDE Threat Modeling | 11 | Bastion | Threat identification |
| 4 | Compliance Audit Prep | 10 | Sentinel | Audit readiness |
| 5 | Virtual CISO Consulting | 11 | Bastion | Strategic security guidance |
| 6 | Blockchain Security Assessment | 9 | Ledger | Smart contract audit |
| 7 | Mobile Security Testing | 9 | Phantom | Mobile app assessment |
| 8 | Web Application Security Testing | 8 | Weaver | Web app pentest |
| 9 | Network Assessment | 8 | Ghost | Network security testing |
| 10 | Infrastructure Security Testing | 9 | Nimbus | Infrastructure review |
| 11 | Cloud Security Assessment | 9 | Nimbus | Cloud configuration audit |
| 12 | Vulnerability Management | 8 | Cipher | Vuln lifecycle management |
| 13 | Security Awareness Training | 7 | Specter | Training program design |

---

## First Workflow: Security Architecture Review

### Step 1: Launch Agent

```bash
/security-architect
```

Bastion greets you with the menu.

### Step 2: Select Workflow

```bash
> SR
# Or: > 1
# Or: > Security Review
```

### Step 3: Follow Guided Steps

1. **Architecture Documentation** - Gather existing documentation
2. **STRIDE Threat Modeling** - Identify threats per component
3. **Control Assessment** - Map existing controls
4. **Attack Surface Analysis** - Identify exposure points
5. **Zero-Trust Validation** - Verify zero-trust principles
6. **Recommendations** - Prioritized remediation
7. **Executive Report** - Summary for leadership
8. **Roadmap** - Implementation timeline

### Step 4: Review Output

Output saved to `_bmad/cybersec-team/output/security-review-[date]/`

---

## Module Permissions

From `manifest.yaml`:

```yaml
permissions:
  filesystem:
    read: ["_bmad/cybersec-team/**", "docs/**", "_bmad/core/**"]
    write: ["_bmad/cybersec-team/output/**"]
  network: true
  shell:
    allowed_commands: ["curl", "wget", "whois", "dig", "nslookup", "host"]
    blocked_commands: ["rm", "mv", "chmod", "sudo"]
  sensitive_data: true
```

**Key Points:**
- Network access enabled for reconnaissance
- Limited shell commands for DNS/network queries
- Destructive commands blocked
- Sensitive data flag enabled (triggers local LLM routing)

---

## Party Mode Scenarios

### Security Review Team

```bash
/security-architect
> PM
> Select: Ghost, Nimbus
```

**Purpose:** Defensive design with offensive validation and cloud expertise.

### Incident Response Team

```bash
/incident-commander
> PM
> Select: Trace, Cipher, Watchman
```

**Purpose:** Command + forensics + threat intel + SOC operations.

### Purple Team Exercise

```bash
/blue-team-lead
> PM
> Select: Ghost, Watchman, Cipher
```

**Purpose:** Blue team + red team + SOC + threat intel collaboration.

### Compliance Assessment

```bash
/compliance-guardian
> PM
> Select: Bastion, Nimbus
```

**Purpose:** Compliance + architecture + cloud compliance review.

---

## Data Sensitivity

### When to Use Local LLM

| Data Type | Provider | Rationale |
|-----------|----------|-----------|
| Active incident data | Local (Ollama) | Contains breach details |
| Forensic evidence | Local (Ollama) | Chain of custody |
| Vulnerability reports | Local (Ollama) | Pre-disclosure |
| Pentest findings | Local (Ollama) | Attack vectors |
| Architecture diagrams | Either | Depends on classification |
| Training content | Either | Generally non-sensitive |

### Configure Automatic Routing

```yaml
# _bmad/_config/llm-config.yaml
agent_overrides:
  cybersec-team/forensic-investigator: ollama   # Always local
  cybersec-team/incident-commander: ollama      # Always local
  cybersec-team/penetration-tester: ollama      # Always local
```

---

## Troubleshooting

### Agent Not Loading

```bash
# Verify agent file exists
ls _bmad/cybersec-team/agents/security-architect.md

# Check command symlink
ls .claude/commands/bmad/cybersec-team/agents/
```

### Workflow Steps Missing

```bash
# Check workflow structure
ls _bmad/cybersec-team/workflows/security-architecture-review/
# Should contain: workflow.md, README.md, steps/
```

### Permission Denied

```bash
# Check your role has cybersec-team access
node _bmad/core/security/check-authorization.js

# Verify token includes security_analyst or admin role
```

### Network Commands Blocked

```bash
# Only these commands are allowed:
# curl, wget, whois, dig, nslookup, host

# For other tools, use them outside BMAD
# Then import results as artifacts
```

---

## Best Practices

1. **Use Local LLM** for sensitive security work
2. **Document everything** - workflows create audit trails
3. **Party Mode** for complex assessments requiring multiple perspectives
4. **Follow frameworks** - agents reference NIST, MITRE, OWASP automatically
5. **Save artifacts** - configure output folder before starting workflows
6. **Session continuation** - workflows can pause and resume

---

## Related Documentation

- [CLI-COMMAND-REFERENCE.md](../CLI-COMMAND-REFERENCE.md) - Command syntax
- [PARTY-MODE-GUIDE.md](../PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [DATA-SENSITIVITY-GUIDE.md](../DATA-SENSITIVITY-GUIDE.md) - LLM routing decisions
- [LLM-PROVIDER-SYSTEM.md](../LLM-PROVIDER-SYSTEM.md) - Provider configuration
- [Module README](_bmad/cybersec-team/README.md) - Detailed module documentation
