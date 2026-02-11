# BMAD-CYBERSEC Data Sensitivity & Provider Selection Guide

## Overview

BMAD-CYBERSEC supports multiple LLM providers. Users choose between local (on-premise) and cloud providers based on their data sensitivity requirements.

**Abdul handles provider setup** when opening a project. This guide is for reference.

---

## Quick Reference

### Local LLM (Ollama, LM Studio, vLLM)

| Characteristic | Value |
|----------------|-------|
| Data location | On-premise (127.0.0.1) |
| Internet required | No |
| External logging | None |
| Best for | Sensitive data, compliance, air-gapped |

**Recommended for:**

- Security incidents, breach data, IOCs
- Vulnerability details, CVEs, target info
- Intelligence operations, PII
- Legal matters (attorney-client privilege)
- Trade secrets, M&A, strategic plans
- Customer data (GDPR, HIPAA, CCPA)

### Cloud LLM (Claude, OpenAI, Groq)

| Characteristic | Value |
|----------------|-------|
| Data location | External API |
| Internet required | Yes |
| External logging | Per provider policy |
| Best for | Quality, general use, public info |

**Fine for:**

- Public information research
- Generic development (no secrets)
- Creative content
- Training with synthetic data

---

## Provider Commands

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Switch to local
.claude/hooks/llm-provider-manager.sh set ollama

# Switch to cloud
.claude/hooks/llm-provider-manager.sh set claude

# Check all provider health
.claude/hooks/llm-provider-manager.sh health-all

# Clear override (use config default)
.claude/hooks/llm-provider-manager.sh clear
```

---

## Routing Configuration (Optional)

Organizations can set default providers at module or agent level in `_bmad/_config/llm-config.yaml`:

### Module-Level Routing

```yaml
module_overrides:
  cybersec-team: ollama    # All security agents use local
  intel-team: ollama       # All intel agents use local
  legal-team: ollama       # All legal agents use local
  strategy-team: ollama    # All strategy agents use local
```

### Agent-Level Routing (Granular)

```yaml
agent_overrides:
  # Format: module/agent-name: provider
  cybersec-team/forensic-investigator: ollama   # Forensics always local
  cybersec-team/incident-commander: ollama      # IR data stays local
  intel-team/dark-web-analyst: ollama           # Dark web intel local
  intel-team/humint-specialist: ollama          # HUMINT always local
  legal-team/counsel: ollama                    # General counsel local
  strategy-team/the-realist: claude             # Override: needs Claude quality
```

### Check Provider for Specific Agent

```bash
# Module level
.claude/hooks/llm-provider-manager.sh get cybersec-team

# Agent level (most specific)
.claude/hooks/llm-provider-manager.sh get cybersec-team forensic-investigator
```

### Priority Order

1. `agent_overrides` (per-agent) - highest
2. `module_overrides` (per-module)
3. Project override (`.claude/llm-provider.txt`)
4. Global override (`~/.claude/llm-provider.txt`)
5. `active_provider` (config default) - lowest

Users can always override for a session using the provider commands above.

---

## Decision Flow

```
Processing sensitive data?
│
├─ Yes → Check provider: .claude/hooks/llm-provider-manager.sh get
│        │
│        ├─ Shows "ollama" (local) → Proceed
│        │
│        └─ Shows "claude" (cloud) → Consider switching:
│                                    .claude/hooks/llm-provider-manager.sh set ollama
│
└─ No → Either provider is fine
```

---

## Related Documentation

- [LLM Provider System](LLM-PROVIDER-SYSTEM.md) - Full provider configuration
- [Getting Started](GETTING-STARTED.md) - Initial setup

---

*The choice between local and cloud is always yours.*
