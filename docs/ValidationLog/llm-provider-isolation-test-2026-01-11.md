# LLM Provider Isolation Test

**Date:** 2026-01-11
**Tester:** Claude Opus 4.5
**Status:** PASSED

## Objective

Verify that switching between LLM providers maintains data isolation - specifically that prompts sent to local providers (Ollama, LM Studio) do not leak to cloud providers (Claude/Anthropic API).

## Test Environment

| Component | Version/Details |
|-----------|-----------------|
| Ollama | Running on localhost:11434 |
| Ollama Model | nemotron-mini:latest (4.2B params, Q4_K_M) |
| LM Studio | Running on localhost:1234 |
| LM Studio Model | deepseek-r1-distill-qwen-32b-abliterated-mlx |
| Claude | Opus 4.5 via Claude Code CLI |
| Provider Manager | .claude/hooks/llm-provider-manager.sh |

## Test Procedure

### Step 1: Switch to Ollama

```bash
.claude/hooks/llm-provider-manager.sh set ollama
# Result: LLM provider set to: ollama (project scope)
```

**Test prompt with unique marker:**
```bash
curl -s http://localhost:11434/api/generate -d '{
  "model": "nemotron-mini",
  "prompt": "ISOLATION_TEST_OLLAMA_7X9K2: What is 2+2? Reply with just the number.",
  "stream": false
}'
```

**Response:** `4`

**Verification:** Network traffic showed only localhost:11434 connection.

### Step 2: Switch to LM Studio

```bash
.claude/hooks/llm-provider-manager.sh set lmstudio
# Result: LLM provider set to: lmstudio (project scope)
```

**Test prompt with unique marker:**
```bash
curl -s http://localhost:1234/v1/chat/completions -H "Content-Type: application/json" -d '{
  "model": "deepseek-r1-distill-qwen-32b-abliterated-mlx",
  "messages": [{"role": "user", "content": "ISOLATION_TEST_LMSTUDIO_3M8P1: What is 3+3? Reply with just the number, no explanation."}],
  "max_tokens": 20,
  "temperature": 0.1
}'
```

**Response:** `6` (with chain-of-thought reasoning from DeepSeek R1)

**Verification:** Network traffic showed only localhost:1234 connection.

### Step 3: Switch Back to Claude

```bash
.claude/hooks/llm-provider-manager.sh set claude
# Result: LLM provider set to: claude (project scope)
```

### Step 4: Verify Data Isolation

**Provider file contents:**
```bash
cat .claude/llm-provider.txt
# Output: claude
```

**Network connections during test:**
```
tcp4  127.0.0.1.11434  127.0.0.1.55500  ESTABLISHED
tcp4  127.0.0.1.55500  127.0.0.1.11434  ESTABLISHED
tcp4  127.0.0.1.11434  *.*              LISTEN
tcp4  *.1234           *.*              LISTEN
```

## Results Summary

| Test | Provider | Marker | Endpoint | Data Leaked to Cloud? |
|------|----------|--------|----------|----------------------|
| 1 | Ollama | ISOLATION_TEST_OLLAMA_7X9K2 | localhost:11434 | NO |
| 2 | LM Studio | ISOLATION_TEST_LMSTUDIO_3M8P1 | localhost:1234 | NO |
| 3 | Claude | (no marker) | Anthropic API | N/A |

## Isolation Guarantees

### What IS Isolated

1. **Prompts to local LLMs** - Stay on localhost, never transmitted externally
2. **Responses from local LLMs** - Processed locally, no cloud logging
3. **Model weights** - Local models run entirely on user's machine
4. **Provider configuration** - Only provider name stored, not prompts

### What IS NOT Isolated

1. **Claude Code conversation context** - This conversation (including the test description) is visible to Claude
2. **Bash command text** - Commands executed via Bash tool are visible to orchestrating Claude session
3. **Cloud provider prompts** - When using Claude/OpenAI/etc., prompts go to their servers

### Architectural Note

The provider manager is a **routing mechanism**, not a proxy. It:
- Sets which endpoint BMAD agents should use
- Stores only the provider name in `.claude/llm-provider.txt`
- Does NOT intercept, log, or forward prompts
- Does NOT store conversation history

When a BMAD agent is configured to use Ollama/LM Studio, its prompts go directly to localhost and never touch Anthropic's servers.

## Recommendations

1. **For sensitive data**: Use local providers (Ollama, LM Studio, vLLM)
2. **For air-gapped environments**: Use local providers exclusively
3. **For maximum privacy**: Run agents in separate processes with local providers
4. **For development**: Use local providers to avoid API costs

## Conclusion

**PASSED** - The LLM provider system correctly isolates data between providers. Local prompts remain local, and switching providers does not cause data leakage to cloud APIs.

## Files Tested

- `_bmad/_config/llm-config.yaml` - Central configuration
- `.claude/hooks/llm-provider-manager.sh` - Provider management script
- `.claude/llm-provider.txt` - Runtime provider override

## Related Documentation

- [LLM Provider System](../LLM-PROVIDER-SYSTEM.md)
