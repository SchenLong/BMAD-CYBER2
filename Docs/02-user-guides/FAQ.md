# Frequently Asked Questions (FAQ)

## General Questions

### What is BMAD CYBERCOMMAND?
BMAD CYBERCOMMAND is a production-ready AI operations framework with security-first design. It provides 53 specialized AI agents across 4 teams (Cybersecurity, Intelligence, Legal, and Strategy) with 57 production workflows for automated task execution.

### What does BMAD stand for?
BMAD stands for "Build, Manage, Automate, Deliver" - a methodology for AI-assisted project execution.

### Who is Abdul?
Abdul is the Master Project Manager - a cross-team orchestrator agent that coordinates tasks across all specialized teams and serves as the primary entry point for most users.

---

## Installation

### What are the system requirements?
- [Claude Code CLI](https://github.com/anthropics/claude-code) (Sonnet 4.5+ recommended)
- Node.js 20+ (for TypeScript components and security validators)
- Git (optional, for full clone installation)

### How do I install BMAD?
**Option A: NPX Install (Recommended)**
```bash
npx bmad-cybersec install
```

**Option B: Clone Repository**
```bash
git clone https://github.com/SchenLong/BMAD-CYBERSEC.git
cd BMAD-CYBERSEC
git checkout BMAD-CYBEROPS-RP
```

### Can I install BMAD in an existing project?
Yes! The NPX installer is designed for this use case. Run `npx bmad-cybersec install` in your existing project directory.

---

## Agents

### How many agents are available?
53 agents across 4 specialized teams:
- **Cybersec Team**: 15 security specialists
- **Strategy Team**: 14 executive advisors
- **Legal Team**: 13 multi-jurisdictional attorneys
- **Intel Team**: 11 OSINT & analysis experts

### How do I invoke an agent?
```bash
# Via slash command
/agents/abdul

# Or specify team agent
/agents/cybersec-team/penetration-tester
```

### Can agents work together?
Yes! Use Party Mode for multi-agent collaboration:
```bash
/party-mode
```

---

## Workflows

### How many workflows are available?
57 production workflows:
- Intel Team: 19 workflows
- Strategy Team: 17 workflows
- Cybersec Team: 13 workflows
- Legal Team: 8 workflows

### How do I run a workflow?
```bash
# Via slash command
/workflow-name

# Or through an agent
/agents/abdul
> Run the security-assessment workflow
```

### Can I create custom workflows?
Yes! See [Custom Workflow Creation](Advanced/CUSTOM-WORKFLOW-CREATION.md) for detailed instructions.

---

## Security

### Is BMAD secure for enterprise use?
Yes. BMAD achieves a 95/100 OWASP AI security score and includes:
- Supply chain security modules
- Hook sandboxing
- Token encryption
- Audit logging

### How do I verify installation integrity?
```bash
./_bmad/core/security/verify-integrity.sh
```

### Where can I find security documentation?
See [Security Overview](SECURITY-OVERVIEW.md) for comprehensive security information.

---

## Troubleshooting

### Where can I get help?
1. Check [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review [Getting Started](GETTING-STARTED.md)
3. Open an issue on [GitHub](https://github.com/SchenLong/BMAD-CYBERSEC/issues)

### How do I report a bug?
Open an issue on GitHub with:
- Reproduction steps
- Expected vs actual behavior
- Environment details (OS, Node version, Claude Code version)

---

## Contributing

### How can I contribute?
See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on:
- Reporting issues
- Submitting pull requests
- Adding agents or workflows

### What license is BMAD under?
MIT License. See [LICENSE](../../LICENSE) for details.
