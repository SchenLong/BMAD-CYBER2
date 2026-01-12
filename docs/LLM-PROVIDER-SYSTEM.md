# BMAD LLM Provider System

## Overview

The BMAD framework supports multiple LLM providers, allowing you to route agent requests to different backends including local models (Ollama, LM Studio, vLLM, llama.cpp) and cloud APIs (Claude, OpenAI, Groq, Together).

This enables:
- **Privacy**: Run sensitive workloads on local models
- **Cost optimization**: Use local models for development/testing
- **Flexibility**: Choose the best model for each task
- **Offline operation**: Work without internet using local LLMs

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BMAD Agents                               │
│  (strategy-team, cybersec-team, bmm, etc.)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LLM Provider Manager                           │
│            .claude/hooks/llm-provider-manager.sh                │
│                                                                  │
│  - Reads active provider from config                            │
│  - Supports project & global overrides                          │
│  - Routes requests to appropriate endpoint                      │
│  - NO prompt/response logging (privacy by design)               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   LOCAL LLMs    │ │   LOCAL LLMs    │ │   CLOUD APIs    │
│                 │ │                 │ │                 │
│ • Ollama        │ │ • LM Studio     │ │ • Claude        │
│   localhost:    │ │   localhost:    │ │ • OpenAI        │
│   11434         │ │   1234          │ │ • Groq          │
│                 │ │                 │ │ • Together      │
│ • vLLM          │ │ • llama.cpp     │ │                 │
│   localhost:    │ │   localhost:    │ │                 │
│   8000          │ │   8080          │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
     127.0.0.1           127.0.0.1          Internet
```

## Configuration

### Central Config File

Location: `_bmad/_config/llm-config.yaml`

```yaml
version: "1.0"

# Active provider (can be overridden)
active_provider: claude

# Provider definitions
providers:
  claude:
    type: anthropic
    description: "Claude API via Claude Code CLI (native)"
    native: true
    capabilities:
      tool_use: true
      streaming: true
      context_window: 200000

  ollama:
    type: ollama
    description: "Local LLM via Ollama"
    base_url: "http://localhost:11434"
    model: "nemotron-mini"
    parameters:
      temperature: 0.7
      top_p: 0.9
    capabilities:
      tool_use: false
      streaming: true
      context_window: 128000

  lmstudio:
    type: lmstudio
    description: "Local LLM via LM Studio"
    base_url: "http://localhost:1234"
    model: "local-model"
    api_format: openai
    capabilities:
      tool_use: false
      streaming: true
      context_window: 8192

  # Additional providers: vllm, llamacpp, openai, groq, together
```

### Override Hierarchy

Provider selection follows this priority (highest to lowest):

1. **Module-specific override** (in config `module_overrides:`)
2. **Project override** (`.claude/llm-provider.txt`)
3. **Global override** (`~/.claude/llm-provider.txt`)
4. **Config default** (`active_provider:` in yaml)
5. **Fallback** (`claude`)

## Usage

### Provider Manager Commands

```bash
# Show active provider
.claude/hooks/llm-provider-manager.sh get

# Set provider (project scope)
.claude/hooks/llm-provider-manager.sh set ollama

# Set provider (global scope)
.claude/hooks/llm-provider-manager.sh set ollama global

# List all providers
.claude/hooks/llm-provider-manager.sh list

# Check provider health
.claude/hooks/llm-provider-manager.sh health ollama

# Check all providers
.claude/hooks/llm-provider-manager.sh health-all

# Get provider config as JSON
.claude/hooks/llm-provider-manager.sh config ollama

# Show detailed provider info
.claude/hooks/llm-provider-manager.sh info lmstudio

# Clear override (revert to config default)
.claude/hooks/llm-provider-manager.sh clear
```

### Quick Provider Switch

```bash
# Switch to local Ollama
.claude/hooks/llm-provider-manager.sh set ollama

# Switch to LM Studio
.claude/hooks/llm-provider-manager.sh set lmstudio

# Switch back to Claude
.claude/hooks/llm-provider-manager.sh set claude
```

## Supported Providers

### Local Providers

| Provider | Port | API Format | Tool Use | Notes |
|----------|------|------------|----------|-------|
| Ollama | 11434 | Native | No* | Easy setup, many models |
| LM Studio | 1234 | OpenAI | No | GUI, model browser |
| vLLM | 8000 | OpenAI | Yes | High performance |
| llama.cpp | 8080 | Native | No | Lightweight |

*Some Ollama models support tool use with specific configurations

### Cloud Providers

| Provider | Tool Use | Notes |
|----------|----------|-------|
| Claude | Yes | Native via Claude Code |
| OpenAI | Yes | GPT-4, GPT-3.5 |
| Groq | Yes | Ultra-fast inference |
| Together | Yes | Many open models |

## Data Isolation & Privacy

### Critical: Local vs Cloud Data Flow

```
LOCAL PROVIDERS (Ollama, LM Studio, vLLM, llama.cpp)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Prompt ──► localhost:PORT ──► Local LLM ──► Response
                     │
                     └── NEVER leaves your machine
                         NO internet required
                         NO external logging

CLOUD PROVIDERS (Claude, OpenAI, Groq, Together)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Prompt ──► Internet ──► Cloud API ──► Response
                   │
                   └── Subject to provider's data policies
                       Requires internet connection
```

### What the Provider Manager Stores

The provider manager stores **ONLY** the provider name:

```
.claude/llm-provider.txt
├── Contains: "ollama" or "claude" or "lmstudio" etc.
├── NO prompts
├── NO responses
└── NO conversation history
```

### Isolation Verification Test

The following test was conducted on 2026-01-11:

| Step | Provider | Test Marker | Endpoint | Result |
|------|----------|-------------|----------|--------|
| 1 | Ollama | `ISOLATION_TEST_OLLAMA_7X9K2` | localhost:11434 | Local only |
| 2 | LM Studio | `ISOLATION_TEST_LMSTUDIO_3M8P1` | localhost:1234 | Local only |
| 3 | Claude | (switched back) | Anthropic API | Cloud |

**Verification:**
- Network traffic confirmed local ports only for Ollama/LM Studio
- Test markers sent to local LLMs were NOT transmitted to Claude API
- Provider switch changes routing, not data storage

### Privacy Recommendations

1. **Sensitive data**: Use local providers (Ollama, LM Studio)
2. **Development/testing**: Use local providers to save API costs
3. **Production/quality**: Use Claude or other cloud providers
4. **Air-gapped environments**: Use local providers exclusively

## Setting Up Local Providers

### Ollama

```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Start server
ollama serve

# Pull a model
ollama pull nemotron-mini
ollama pull mistral:7b
ollama pull codellama:34b

# Verify
curl http://localhost:11434/api/tags
```

### LM Studio

1. Download from https://lmstudio.ai/
2. Launch application
3. Download models from built-in browser
4. Start local server (Settings → Local Server → Start)
5. Verify: `curl http://localhost:1234/v1/models`

### vLLM

```bash
# Install
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-70B-Instruct \
  --port 8000

# Verify
curl http://localhost:8000/v1/models
```

### llama.cpp

```bash
# Build
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make

# Start server
./server -m models/your-model.gguf --port 8080

# Verify
curl http://localhost:8080/health
```

## Module-Specific Routing

You can route specific modules to different providers:

```yaml
# In _bmad/_config/llm-config.yaml
module_overrides:
  # High-risk modules → local recommended
  cybersec-team: ollama      # Security data stays on-premise
  intel-team: ollama         # Intelligence data stays on-premise
  legal-team: ollama         # Attorney-client privilege protected
  strategy-team: ollama      # Trade secrets protected

  # Low-risk modules → cloud default (or local if preferred)
  # bmm: claude              # Software dev
  # bmgd: claude             # Game dev
```

### Security Considerations by Module

| Module | Typical Data | Risk Level | Suggested Provider |
|--------|--------------|------------|-------------------|
| cybersec-team | Breach data, IOCs, vulnerabilities | HIGH | Local |
| intel-team | PII, targets, operations | HIGH | Local |
| legal-team | Privileged communications | HIGH | Local |
| strategy-team | M&A, trade secrets | MEDIUM-HIGH | Local |
| bmm/bmgd | Code, designs | LOW | Either |
| cis/bmb | Creative, framework | LOW | Either |

Users can always override with `.claude/hooks/llm-provider-manager.sh set <provider>`

### Agent-Level Routing (Granular Control)

For even finer control, route individual agents to specific providers:

```yaml
# In _bmad/_config/llm-config.yaml
agent_overrides:
  # Format: module/agent-name: provider
  cybersec-team/forensic-investigator: ollama   # Forensics always local
  cybersec-team/incident-commander: ollama      # IR data stays local
  intel-team/dark-web-analyst: ollama           # Dark web intel local
  intel-team/humint-specialist: ollama          # HUMINT always local
  legal-team/counsel: ollama                    # General counsel local
  strategy-team/the-realist: claude             # Exception: needs Claude quality
```

Check provider for a specific agent:

```bash
# Check at agent level
.claude/hooks/llm-provider-manager.sh get cybersec-team forensic-investigator

# Priority: agent_override > module_override > project > global > config
```

## Troubleshooting

### Provider Not Responding

```bash
# Check health
.claude/hooks/llm-provider-manager.sh health ollama

# Common fixes:
# Ollama: ollama serve
# LM Studio: Start local server in app
# vLLM: Check if model loaded
```

### Wrong Provider Active

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Check override status
.claude/hooks/llm-provider-manager.sh list

# Clear overrides
.claude/hooks/llm-provider-manager.sh clear
.claude/hooks/llm-provider-manager.sh clear global
```

### Model Not Found

```bash
# Ollama - list available models
curl http://localhost:11434/api/tags

# LM Studio - list loaded models
curl http://localhost:1234/v1/models

# Pull/download the model you need
```

## API Reference

### Direct API Calls

**Ollama:**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "nemotron-mini",
  "prompt": "Hello",
  "stream": false
}'
```

**LM Studio (OpenAI-compatible):**
```bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**vLLM (OpenAI-compatible):**
```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.1-70B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Related Documentation

- [Data Sensitivity Guide](DATA-SENSITIVITY-GUIDE.md) - When to use local vs cloud
- [Getting Started](GETTING-STARTED.md) - Initial setup and usage
- [Agents Overview](AGENTS.md) - All 78 agents
- [Workflows Overview](WORKFLOWS.md) - All 88 workflows
