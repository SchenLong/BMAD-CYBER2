# LLM Provider Advanced Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** Advanced users, DevOps, cost-conscious teams

---

## Overview

BMAD-CYBER2 supports multiple LLM providers, enabling you to optimize for cost, privacy, performance, or capability requirements. This guide covers advanced configuration including provider selection strategies, cost optimization, model tuning, failover chains, and local deployment options.

---

## Provider Architecture

### Configuration Hierarchy

LLM provider selection follows a hierarchical override system:

```
1. Agent Override    (most specific)
      ↓
2. Module Override
      ↓
3. Runtime Override  (.claude/llm-provider.txt)
      ↓
4. Global Default    (active_provider in llm-config.yaml)
```

### Configuration File

Location: `_bmad/_config/llm-config.yaml`

```yaml
version: "1.0"

# Global default provider
active_provider: claude

# Provider definitions
providers:
  claude:
    type: anthropic
    native: true
    capabilities:
      tool_use: true
      streaming: true
      context_window: 200000

  ollama:
    type: ollama
    base_url: "http://localhost:11434"
    model: "nemotron-mini"
    # ...

# Override hierarchy
module_overrides:
  # cybersec-team: ollama

agent_overrides:
  # cybersec-team/forensic-investigator: ollama

# Failover chain
fallback_chain:
  - claude
```

---

## Available Providers

### Claude (Anthropic)

**Best for:** Complex reasoning, nuanced analysis, tool use

```yaml
claude:
  type: anthropic
  native: true    # Uses Claude Code's native integration
  capabilities:
    tool_use: true
    streaming: true
    context_window: 200000
```

**Strengths:**
- Excellent reasoning and analysis
- Native tool/function calling
- Large context window (200K tokens)
- Best for legal, strategy, and complex security analysis

**Considerations:**
- API costs
- Data leaves local environment
- Requires internet connection

### Ollama (Local)

**Best for:** Privacy-sensitive operations, cost reduction

```yaml
ollama:
  type: ollama
  base_url: "http://localhost:11434"
  model: "nemotron-mini"
  parameters:
    temperature: 0.7
    top_p: 0.9
  capabilities:
    tool_use: false
    streaming: true
    context_window: 128000
```

**Recommended Models:**

| Model | Size | Use Case |
|-------|------|----------|
| `nemotron-mini` | 4B | Fast, general purpose |
| `mistral:7b` | 7B | Good balance |
| `codellama:34b` | 34B | Code-heavy tasks |
| `mixtral:8x7b` | 46B | Complex analysis |
| `qwen2.5:72b` | 72B | High quality, slower |
| `deepseek-coder-v2` | 236B | Best for code |

**Installation:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull nemotron-mini
ollama pull mixtral:8x7b

# Start server (usually automatic)
ollama serve
```

### vLLM (High-Performance Local)

**Best for:** Production local deployments, high throughput

```yaml
vllm:
  type: vllm
  base_url: "http://localhost:8000"
  model: "meta-llama/Llama-3.1-70B-Instruct"
  api_format: openai
  parameters:
    temperature: 0.7
    max_tokens: 4096
  capabilities:
    tool_use: true
    streaming: true
    context_window: 128000
```

**Installation:**
```bash
# Requires CUDA-capable GPU
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-3.1-70B-Instruct \
    --tensor-parallel-size 2
```

**Advantages:**
- Supports function calling
- High throughput with PagedAttention
- Efficient GPU memory usage

### LM Studio (Desktop Local)

**Best for:** Easy local setup, GUI-based model management

```yaml
lmstudio:
  type: lmstudio
  base_url: "http://localhost:1234"
  model: "local-model"
  api_format: openai
  capabilities:
    tool_use: false
    streaming: true
    context_window: 8192
```

**Setup:**
1. Download LM Studio from lmstudio.ai
2. Download models through the UI
3. Start local server (Server tab)
4. BMAD connects automatically

### llama.cpp (Lightweight Local)

**Best for:** Minimal dependencies, ARM/CPU inference

```yaml
llamacpp:
  type: llamacpp
  base_url: "http://localhost:8080"
  model: "default"
  api_format: llamacpp
  parameters:
    temperature: 0.7
    n_predict: 4096
  capabilities:
    tool_use: false
    streaming: true
    context_window: 8192
```

**Installation:**
```bash
# Build llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Start server
./server -m models/llama-3-8b.gguf -c 8192 --host 0.0.0.0 --port 8080
```

### OpenAI

**Best for:** GPT-4 quality, existing OpenAI integrations

```yaml
openai:
  type: openai
  base_url: "https://api.openai.com/v1"
  model: "gpt-4-turbo"
  api_key_env: "OPENAI_API_KEY"
  parameters:
    temperature: 0.7
    max_tokens: 4096
  capabilities:
    tool_use: true
    streaming: true
    context_window: 128000
```

**Setup:**
```bash
export OPENAI_API_KEY="sk-..."
```

### Groq (Ultra-Fast Cloud)

**Best for:** Speed-critical operations, real-time analysis

```yaml
groq:
  type: groq
  base_url: "https://api.groq.com/openai/v1"
  model: "llama-3.1-70b-versatile"
  api_key_env: "GROQ_API_KEY"
  api_format: openai
  capabilities:
    tool_use: true
    streaming: true
    context_window: 128000
```

**Advantages:**
- Extremely fast inference
- Competitive pricing
- Open model access

### Together AI

**Best for:** Wide model selection, serverless scaling

```yaml
together:
  type: together
  base_url: "https://api.together.xyz/v1"
  model: "meta-llama/Llama-3.1-70B-Instruct-Turbo"
  api_key_env: "TOGETHER_API_KEY"
  api_format: openai
  capabilities:
    tool_use: true
    streaming: true
    context_window: 128000
```

---

## Provider Selection Strategies

### By Use Case

| Use Case | Recommended Provider | Reason |
|----------|---------------------|--------|
| Legal analysis | Claude | Nuanced reasoning |
| Strategic decisions | Claude | Complex judgment |
| Code generation | vLLM/Ollama | Cost efficiency |
| Incident response | Local (Ollama) | Privacy |
| Dark web analysis | Local (Ollama) | OPSEC |
| General workflows | Groq | Speed + cost |
| Compliance-sensitive | Local only | Data sovereignty |

### By Cost Priority

```yaml
# Cost-optimized configuration
active_provider: ollama

module_overrides:
  legal-team: claude       # Legal needs quality
  strategy-team: claude    # Strategy needs quality

# Everything else uses local
```

### By Privacy Priority

```yaml
# Privacy-maximized configuration
active_provider: ollama

module_overrides:
  # Force everything local
  cybersec-team: ollama
  intel-team: ollama
  legal-team: ollama
  strategy-team: ollama
  bmm: ollama

# Only fallback to cloud if local fails and user confirms
fallback_chain:
  - ollama
  - vllm
  - lmstudio
```

### By Performance Priority

```yaml
# Performance-optimized configuration
active_provider: groq      # Fastest cloud

module_overrides:
  # Complex analysis still on Claude
  legal-team: claude
  strategy-team: claude

agent_overrides:
  # Specific agents needing speed
  cybersec-team/incident-commander: groq
  intel-team/osint-lead: groq
```

---

## Override Configuration

### Module Overrides

Apply provider settings to all agents in a module:

```yaml
module_overrides:
  cybersec-team: ollama     # All security agents use local
  intel-team: ollama        # All intel agents use local
  legal-team: claude        # Legal needs Claude quality
  strategy-team: claude     # Strategy needs Claude quality
  bmm: groq                 # Dev workflows prioritize speed
```

### Agent Overrides

Override specific agents (takes precedence over module):

```yaml
agent_overrides:
  # Format: module/agent-name: provider

  # Security team exceptions
  cybersec-team/forensic-investigator: ollama   # Always local
  cybersec-team/incident-commander: groq        # Needs speed

  # Intel team exceptions
  intel-team/dark-web-analyst: ollama           # OPSEC critical
  intel-team/humint-specialist: ollama          # Privacy critical

  # Strategy team exceptions
  strategy-team/the-realist: claude             # Needs Claude quality
```

### Runtime Override

Temporarily switch all agents to a different provider:

```bash
# Set runtime override
echo "ollama" > .claude/llm-provider.txt

# Check current setting
cat .claude/llm-provider.txt

# Remove override (return to config default)
rm .claude/llm-provider.txt
```

### Provider Manager Commands

Use the provider manager script:

```bash
# List all providers and current settings
.claude/hooks/llm-provider-manager.sh list

# Set global provider
.claude/hooks/llm-provider-manager.sh set ollama

# Get provider for specific agent
.claude/hooks/llm-provider-manager.sh get cybersec-team forensic-investigator

# Reset to config default
.claude/hooks/llm-provider-manager.sh reset
```

---

## Cost Optimization

### Cost Comparison

| Provider | Input (per 1M tokens) | Output (per 1M tokens) | Notes |
|----------|----------------------|------------------------|-------|
| Claude Sonnet | $3.00 | $15.00 | Best quality |
| Claude Haiku | $0.25 | $1.25 | Fast, cheaper |
| GPT-4 Turbo | $10.00 | $30.00 | OpenAI flagship |
| Groq Llama 70B | $0.59 | $0.79 | Ultra fast |
| Together Llama 70B | $0.88 | $0.88 | Good balance |
| Ollama (local) | $0.00 | $0.00 | Hardware costs only |
| vLLM (local) | $0.00 | $0.00 | Hardware costs only |

### Cost Reduction Strategies

#### 1. Tiered Provider Usage

```yaml
# Use cheaper providers for routine tasks
module_overrides:
  bmm: ollama              # Routine dev work
  cybersec-team: groq      # Good enough, fast

# Reserve Claude for high-value tasks
agent_overrides:
  legal-team/counsel: claude           # Legal advice critical
  strategy-team/the-master-strategist: claude  # Strategy critical
```

#### 2. Local First with Cloud Fallback

```yaml
active_provider: ollama

fallback_chain:
  - ollama
  - groq       # Cheaper cloud option
  - claude     # Premium fallback
```

#### 3. Time-Based Switching

```bash
#!/bin/bash
# cost-aware-provider.sh

HOUR=$(date +%H)

# Off-peak hours: use cloud (cheaper batch processing)
# Peak hours: use local (responsive, no API costs)
if [ $HOUR -ge 22 ] || [ $HOUR -lt 6 ]; then
    echo "groq" > .claude/llm-provider.txt
else
    echo "ollama" > .claude/llm-provider.txt
fi
```

### Cost Monitoring

Track API usage:

```bash
#!/bin/bash
# monitor-costs.sh

# Log each API call (add to hook)
log_api_call() {
    echo "$(date -Is),${PROVIDER},${TOKENS_IN},${TOKENS_OUT}" >> .claude/logs/api-usage.csv
}

# Daily cost report
daily_report() {
    awk -F',' '
    {
        provider[$2] += ($3 * input_cost[$2]) + ($4 * output_cost[$2])
    }
    END {
        for (p in provider) {
            printf "%s: $%.2f\n", p, provider[p] / 1000000
        }
    }
    ' .claude/logs/api-usage.csv
}
```

---

## Model Tuning

### Temperature Settings

| Temperature | Use Case | Example |
|-------------|----------|---------|
| 0.0-0.3 | Factual, deterministic | Code generation, analysis |
| 0.4-0.6 | Balanced | General workflows |
| 0.7-0.9 | Creative | Brainstorming, writing |
| 1.0+ | Highly creative | Exploring alternatives |

```yaml
providers:
  ollama:
    parameters:
      temperature: 0.5    # More deterministic for security work

  claude:
    parameters:
      temperature: 0.7    # Balanced for general use
```

### Context Window Management

```yaml
# Adjust based on workflow needs
providers:
  ollama:
    parameters:
      num_ctx: 32768     # Increase for large document analysis

  vllm:
    parameters:
      max_model_len: 65536  # For very long contexts
```

### Response Length

```yaml
providers:
  ollama:
    parameters:
      num_predict: 8192   # Max response tokens

  openai:
    parameters:
      max_tokens: 4096    # Cap response length
```

### Sampling Parameters

```yaml
providers:
  ollama:
    parameters:
      temperature: 0.7
      top_p: 0.9          # Nucleus sampling
      top_k: 40           # Top-k sampling
      repeat_penalty: 1.1 # Reduce repetition
```

---

## Failover Configuration

### Basic Failover Chain

```yaml
fallback_chain:
  - claude     # Primary
  - groq       # Fast fallback
  - ollama     # Local fallback
```

### Intelligent Failover

```yaml
# Failover with capability matching
fallback_chain:
  - claude     # Full capabilities
  - openai     # Also has tool use
  - groq       # Has tool use
  # Note: ollama excluded - lacks tool_use

required_capabilities:
  tool_use: true
  streaming: true
  min_context_window: 32000
```

### Failover Script

```bash
#!/bin/bash
# smart-failover.sh

check_provider() {
    local provider=$1
    case $provider in
        claude)
            # Check Claude Code availability
            claude --version > /dev/null 2>&1
            ;;
        ollama)
            curl -s http://localhost:11434/api/tags > /dev/null 2>&1
            ;;
        vllm)
            curl -s http://localhost:8000/health > /dev/null 2>&1
            ;;
        groq)
            [ -n "$GROQ_API_KEY" ]
            ;;
    esac
}

# Try providers in order
for provider in claude groq ollama; do
    if check_provider $provider; then
        echo $provider
        exit 0
    fi
done

echo "No providers available" >&2
exit 1
```

---

## Local Deployment

### Hardware Requirements

| Model Size | VRAM Required | Recommended GPU |
|------------|---------------|-----------------|
| 7B | 8GB | RTX 3070, RTX 4060 |
| 13B | 16GB | RTX 4080, A4000 |
| 34B | 24GB | RTX 4090, A5000 |
| 70B | 48GB | A100 40GB (2x A6000) |

### Ollama Setup

```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended models
ollama pull nemotron-mini     # 4GB - fast general
ollama pull mistral:7b        # 7GB - balanced
ollama pull mixtral:8x7b      # 26GB - high quality

# Configure for BMAD
cat >> ~/.ollama/config << EOF
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=2
EOF

# Start with custom settings
OLLAMA_NUM_PARALLEL=4 ollama serve
```

### vLLM Production Setup

```bash
# Install
pip install vllm

# Start production server
python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-3.1-70B-Instruct \
    --tensor-parallel-size 2 \
    --max-model-len 65536 \
    --gpu-memory-utilization 0.9 \
    --host 0.0.0.0 \
    --port 8000

# For multiple models
# Use separate ports or model router
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  vllm:
    image: vllm/vllm-openai:latest
    command: --model meta-llama/Llama-3.1-70B-Instruct --tensor-parallel-size 2
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 2
              capabilities: [gpu]

volumes:
  ollama_data:
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Provider not responding | Service not running | Check service status |
| Slow responses | Model too large | Use smaller model or more GPU |
| Out of memory | Context too long | Reduce context or model size |
| Tool use failing | Provider doesn't support | Switch to Claude/OpenAI/vLLM |
| API key invalid | Wrong env variable | Check `api_key_env` setting |
| Override not working | Wrong syntax | Check YAML formatting |

### Diagnostic Commands

```bash
# Check provider availability
.claude/hooks/llm-provider-manager.sh list

# Test Ollama connection
curl http://localhost:11434/api/tags

# Test vLLM connection
curl http://localhost:8000/health

# Check API key presence
[ -n "$OPENAI_API_KEY" ] && echo "OpenAI key set" || echo "OpenAI key missing"
[ -n "$GROQ_API_KEY" ] && echo "Groq key set" || echo "Groq key missing"

# View current override
cat .claude/llm-provider.txt 2>/dev/null || echo "No override set"
```

### Performance Testing

```bash
#!/bin/bash
# benchmark-providers.sh

PROMPT="Explain the concept of defense in depth in cybersecurity."

for provider in claude ollama groq; do
    echo "Testing $provider..."
    start=$(date +%s.%N)

    # Run test query
    # (Implementation depends on your setup)

    end=$(date +%s.%N)
    runtime=$(echo "$end - $start" | bc)
    echo "$provider: ${runtime}s"
done
```

---

## Security Considerations

### Data Privacy

| Provider | Data Location | Recommended For |
|----------|--------------|-----------------|
| Ollama | Local only | Highly sensitive data |
| vLLM | Local only | Highly sensitive data |
| LM Studio | Local only | Highly sensitive data |
| Claude | Anthropic servers | General use |
| OpenAI | OpenAI servers | General use |
| Groq | Groq servers | Speed-critical |

### Compliance Requirements

For regulated environments:

```yaml
# Compliance-focused configuration
active_provider: ollama    # Default to local

# Explicit allowlist for cloud
module_overrides:
  # Only non-sensitive modules can use cloud
  bmm: groq

# All sensitive modules stay local
agent_overrides:
  legal-team/counsel: ollama
  intel-team/dark-web-analyst: ollama
  cybersec-team/forensic-investigator: ollama
```

### API Key Management

```bash
# Store keys securely
# Option 1: Environment file (not in git)
cat > ~/.bmad-secrets << EOF
export OPENAI_API_KEY="sk-..."
export GROQ_API_KEY="gsk_..."
export TOGETHER_API_KEY="..."
EOF
chmod 600 ~/.bmad-secrets
source ~/.bmad-secrets

# Option 2: Secret manager
export OPENAI_API_KEY=$(aws secretsmanager get-secret-value --secret-id bmad/openai --query SecretString --output text)
```

---

## Related Documentation

- [LLM Provider System](../LLM-PROVIDER-SYSTEM.md) (basic guide)
- [Configuration Guide](../CONFIGURATION-GUIDE.md)
- [Security Overview](../SECURITY-OVERVIEW.md)
- [Integration Guide](../Integration/INTEGRATION-GUIDE.md)

---

## Appendix: Provider Comparison Matrix

| Provider | Tool Use | Streaming | Max Context | Local | Cost |
|----------|----------|-----------|-------------|-------|------|
| Claude | Yes | Yes | 200K | No | $$$ |
| Ollama | No* | Yes | Varies | Yes | Free |
| vLLM | Yes | Yes | Varies | Yes | Free |
| LM Studio | No | Yes | Varies | Yes | Free |
| llama.cpp | No | Yes | Varies | Yes | Free |
| OpenAI | Yes | Yes | 128K | No | $$$ |
| Groq | Yes | Yes | 128K | No | $ |
| Together | Yes | Yes | 128K | No | $ |

*Some Ollama models support tool use with additional configuration
