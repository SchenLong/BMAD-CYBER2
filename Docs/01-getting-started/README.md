# Getting Started with BMAD-CYBER2

> **Professional AI Agent Orchestration Platform**
>
> This guide will get you up and running with BMAD-CYBER2 in under 10 minutes.

---

## Prerequisites

Before starting, ensure you have:

- **Claude Code CLI** (Sonnet 4+ or Opus 4.5+)
- **Git** (for repository cloning)
- **Basic command line familiarity**
- **Optional:** Local LLM setup (Ollama, LM Studio) for sensitive operations

---

## Quick Installation

### 1. Clone the Repository
```bash
git clone https://github.com/SchenLong/BMAD-CYBER2.git
cd BMAD-CYBER2

# The platform is ready to use immediately!
# All 80+ agents and 143+ workflows are pre-configured
```

### 2. Verify Installation (Recommended)
```bash
# Verify framework integrity (one-time setup)
gpg --import _bmad/core/security/bmad-public-key.asc
./_bmad/core/security/verify-integrity.sh
```

✅ **Success:** You should see "ALL INTEGRITY CHECKS PASSED"

### 3. Basic Security Setup (Recommended)
```bash
# Enable security validators (recommended for first-time users)
cp _bmad/core/configs/security/secure-defaults.yaml .claude/config.yaml
```

---

## Your First Workflow

### Option 1: Quick Intelligence Assessment
```bash
# Try a 15-minute flash intelligence assessment
/flash-assessment
```

### Option 2: Security Architecture Review
```bash
# Run a security architecture review
/security-architecture-review
```

### Option 3: Strategic Decision Workshop
```bash
# Get executive-level strategic analysis
/strategic-decision-workshop
```

---

## Understanding the Platform

### 🎯 Core Concepts

| Concept | Description |
|---------|-------------|
| **Agents** | Specialized AI personalities (80+ available) |
| **Workflows** | Multi-step professional processes (143+ available) |
| **Modules** | Organized collections of agents/workflows |
| **Party Mode** | Multi-agent collaborative sessions |
| **Security Validators** | Built-in security and compliance checks |

### 🏢 Available Modules

| Module | Focus | Workflows |
|--------|-------|-----------|
| **cybersec-team** | Security operations, pentesting, compliance | 13 |
| **intel-team** | OSINT, threat intel, attribution | 19 |
| **strategy-team** | Executive decisions, negotiations, crisis mgmt | 16 |
| **legal-team** | Contract review, compliance, jurisdictional | 7 |
| **bmm** | Software development, agile workflows | 32+ |

---

## Next Steps

### For End Users
1. **[Browse Available Workflows](../02-user-guides/WORKFLOWS-REFERENCE.md)** - See all 143+ workflows
2. **[Try Examples](../02-user-guides/GETTING-STARTED.md)** - Hands-on guided examples
3. **[Configuration Guide](../02-user-guides/CONFIGURATION-GUIDE.md)** - Customize your setup

### For Security Teams
1. **[Security Overview](../02-user-guides/SECURITY-OVERVIEW.md)** - Understand security features
2. **[Compliance Guide](../02-user-guides/SECURITY-OVERVIEW.md#compliance)** - Meet your compliance requirements
3. **[Audit Reports](../02-user-guides/SECURITY-OVERVIEW.md#security-audits)** - Review security validations

### For Developers
1. **[Architecture Guide](../03-developer-docs/architecture.md)** - Understand the platform
2. **[Contributing Guide](../03-developer-docs/contributing.md)** - Extend and contribute
3. **[API Reference](../03-developer-docs/API/API-DOCUMENTATION-INDEX.md)** - Build integrations

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Workflow not found" | Run `/core-skills-index` to refresh agent index |
| Security validator errors | Check [Security Configuration](../02-user-guides/SECURITY-OVERVIEW.md) |
| Performance issues | See [Performance Tuning](../04-operations/PERFORMANCE-TUNING.md) |
| Authentication errors | Review [Token Management](../02-user-guides/SECURITY-OVERVIEW.md#token-management) |

### Getting Help

- **User Issues** → [Troubleshooting Guide](../02-user-guides/TROUBLESHOOTING.md)
- **Security Questions** → [Security Documentation](../02-user-guides/SECURITY-OVERVIEW.md)
- **Technical Issues** → [GitHub Issues](https://github.com/SchenLong/BMAD-CYBER2/issues)

---

## What's Next?

### Popular First Workflows
1. **Security Assessment** → `/incident-response-playbook`
2. **Intelligence Analysis** → `/campaign-planner-person`
3. **Strategic Planning** → `/strategic-planning-session`
4. **Legal Review** → `/contract-review`

### Advanced Features
- **[Party Mode Presets](../02-user-guides/PARTY-MODE-GUIDE.md)** - Multi-agent collaboration
- **[Custom Agents](../02-user-guides/Advanced/CUSTOM-AGENT-CREATION.md)** - Build your own agents
- **[Local LLM Integration](../02-user-guides/CONFIGURATION-GUIDE.md#local-llms)** - Use local models

---

> **Welcome to BMAD-CYBER2!**
>
> You now have access to a professional-grade AI orchestration platform with 143+ specialized workflows spanning cybersecurity, intelligence, strategy, and legal operations.
>
> **Ready to begin?** Try your first workflow or explore the [User Guide](../02-user-guides/) for comprehensive documentation.