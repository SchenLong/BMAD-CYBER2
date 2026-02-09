# BMAD CYBERCOMMAND

<div align="center">

**AI-powered operations platform for cybersecurity, intelligence, legal, and strategic teams**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/node-20%2B-brightgreen.svg)](https://nodejs.org)
[![Claude Code](https://img.shields.io/badge/claude--code-compatible-purple.svg)](https://github.com/anthropics/claude-code)

[Quick Start](#quick-start) · [Teams](#specialized-teams) · [Documentation](Docs/) · [Contributing](CONTRIBUTING.md)

</div>

---

## What is BMAD?

BMAD CYBERCOMMAND is a production-ready framework that brings together **79 specialized AI agents** organized into expert teams. Each agent has deep domain knowledge and can collaborate with others through coordinated workflows.

**Abdul**, the Master Project Manager, orchestrates everything — routing your requests to the right specialists and coordinating multi-team operations.

```
You → Abdul → Right Team → Expert Agent(s) → Results
```

---

## Quick Start

### Install via NPX (Recommended)

```bash
npx bmad-cybersec install
```

### Or Clone the Repository

```bash
git clone https://github.com/SchenLong/BMAD-CYBERSEC.git
cd BMAD-CYBERSEC && git checkout BMAD-CYBEROPS-RP
```

### Launch

```bash
claude-code /agents/abdul
```

That's it. Abdul will guide you from there.

---

## Specialized Teams

<table>
<tr>
<td width="50%" valign="top">

### 🔐 Cybersecurity
**15 specialists** — penetration testing, incident response, security architecture, compliance auditing, threat analysis

```bash
/agents/penetration-tester
/workflows/incident-response-playbook
```

</td>
<td width="50%" valign="top">

### 🕵️ Intelligence
**11 analysts** — OSINT, corporate intel, threat actor profiling, dark web research, geospatial analysis

```bash
/agents/osint-lead
/workflows/flash-assessment
```

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ⚖️ Legal
**13 attorneys** — contract review, corporate formation, cross-border matters, tax planning, dispute resolution

```bash
/agents/counsel
/workflows/contract-review
```

</td>
<td width="50%" valign="top">

### 👔 Strategy
**14 advisors** — executive decisions, board presentations, M&A due diligence, crisis response, stakeholder negotiations

```bash
/agents/the-master-strategist
/workflows/strategic-decision-workshop
```

</td>
</tr>
</table>

**Plus:** BMM (software development), BMB (module building), BMGD (game development), and CIS (creative innovation).

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Agent Orchestration** | Abdul coordinates specialists across teams for complex operations |
| **135 Production Workflows** | Battle-tested automations for real scenarios |
| **Security-First Design** | OWASP AI compliant, zero-trust architecture, tamper-evident audit logs |
| **Multi-LLM Support** | Claude, OpenAI, Groq, Ollama, LM Studio, vLLM |
| **Party Mode** | Spawn multiple agents working in parallel |

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](Docs/02-user-guides/GETTING-STARTED.md) | Full setup and first workflow |
| [Agents Reference](Docs/02-user-guides/AGENTS-REFERENCE.md) | All 79 agents by team |
| [Workflows Reference](Docs/02-user-guides/WORKFLOWS-REFERENCE.md) | All 135 workflows |
| [Security Overview](Docs/02-user-guides/SECURITY-OVERVIEW.md) | Security architecture and hardening |
| [Troubleshooting](Docs/02-user-guides/TROUBLESHOOTING.md) | Common issues and solutions |

---

## Requirements

- [Claude Code CLI](https://github.com/anthropics/claude-code)
- Node.js 20+
- Git (for clone install)

---

## License

[MIT](LICENSE) — Built with the BMAD Method and Claude Code.

