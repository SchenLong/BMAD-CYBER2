# BMAD Configuration Guide

Complete guide to configuring the BMAD-CYBER2 framework.

---

## Configuration Files Overview

| File | Purpose | Location |
|------|---------|----------|
| `config.yaml` | Main framework configuration | `_bmad/core/config.yaml` |
| `llm-config.yaml` | LLM provider configuration | `_bmad/_config/llm-config.yaml` |
| `auth-config.yaml` | Authentication settings | `_bmad/core/security/auth-config.yaml` |
| `rbac-config.yaml` | Role-based access control | `_bmad/core/security/rbac-config.yaml` |
| `settings.json` | Hook configuration | `.claude/settings.json` |
| `module.yaml` | Per-module configuration | `_bmad/[module]/module.yaml` |

---

## Main Configuration

**File:** `_bmad/core/config.yaml`

### User Settings

```yaml
user:
  name: "YourName"           # Display name in outputs
  email: "user@example.com"  # Optional email
```

### Output Settings

```yaml
output:
  folder: "_bmad-output"     # Where generated documents are saved
  format: "markdown"         # Output format: markdown, json
```

### YOLO Mode Settings

```yaml
yolo_mode:
  enabled: false             # Master switch (default: disabled)
  require_explicit_flag: true
  log_invocations: true      # Cannot be disabled
  allowed_workflows: []      # Empty = no YOLO allowed
```

### Audit Logging Settings

```yaml
audit:
  enabled: true
  log_file: "_bmad-output/.audit/audit.log"
  format: "json"             # json or text
  retention_days: 90
  hash_chain: true           # Tamper-evident linking
```

---

## LLM Provider Configuration

**File:** `_bmad/_config/llm-config.yaml`

### Active Provider

```yaml
version: "1.0"
active_provider: claude      # Default provider
```

### Provider Definitions

```yaml
providers:
  # Claude (native via Claude Code CLI)
  claude:
    type: anthropic
    description: "Claude API via Claude Code CLI (native)"
    native: true
    capabilities:
      tool_use: true
      streaming: true
      context_window: 200000

  # Ollama (local)
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

  # LM Studio (local)
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

  # vLLM (local, high performance)
  vllm:
    type: vllm
    description: "High-performance local LLM"
    base_url: "http://localhost:8000"
    api_format: openai
    capabilities:
      tool_use: true
      streaming: true

  # OpenAI (cloud)
  openai:
    type: openai
    description: "OpenAI API"
    model: "gpt-4"
    capabilities:
      tool_use: true
      streaming: true

  # Groq (cloud, fast)
  groq:
    type: groq
    description: "Ultra-fast Groq API"
    model: "mixtral-8x7b"
    capabilities:
      tool_use: true
      streaming: true
```

### Module-Level Routing

Route specific modules to different providers:

```yaml
module_overrides:
  # High-risk modules -> local LLM
  cybersec-team: ollama      # Security data stays on-premise
  intel-team: ollama         # Intelligence data stays on-premise
  legal-team: ollama         # Attorney-client privilege protected
  strategy-team: ollama      # Trade secrets protected

  # Development modules -> cloud or local
  bmm: claude                # Software dev
  bmgd: claude               # Game dev
```

### Agent-Level Routing

Route specific agents to different providers:

```yaml
agent_overrides:
  # Format: module/agent-name: provider
  cybersec-team/forensic-investigator: ollama   # Forensics always local
  cybersec-team/incident-commander: ollama      # IR data stays local
  intel-team/dark-web-analyst: ollama           # Dark web intel local
  intel-team/humint-specialist: ollama          # HUMINT always local
  legal-team/counsel: ollama                    # General counsel local
  strategy-team/the-realist: claude             # Needs Claude quality
```

### Priority Order

Provider selection follows this priority (highest to lowest):

1. Agent-level override (`agent_overrides`)
2. Module-level override (`module_overrides`)
3. Project override (`.claude/llm-provider.txt`)
4. Global override (`~/.claude/llm-provider.txt`)
5. Config default (`active_provider`)
6. Fallback (`claude`)

---

## Authentication Configuration

**File:** `_bmad/core/security/auth-config.yaml`

```yaml
authentication:
  # Authentication method
  method: "token"            # token, none

  # Token settings
  token:
    validity_days: 7         # Token expiration
    algorithm: "AES-256-GCM" # Encryption algorithm
    key_file: ".bmad-key"    # Encryption key location
    token_file: ".bmad-token" # Token location

  # Session settings
  session:
    timeout_hours: 8         # Inactivity timeout
    refresh_threshold_hours: 24  # Auto-refresh window

  # Default role for new users
  default_role: "viewer"
```

---

## RBAC Configuration

**File:** `_bmad/core/security/rbac-config.yaml`

### Basic Settings

```yaml
rbac:
  enabled: true              # Enable/disable RBAC
  default_role: viewer       # Default role for authenticated users
  deny_by_default: true      # Deny access unless explicitly granted
```

### Role Definitions

```yaml
roles:
  admin:
    description: "Full system administrator"
    inherits: []
    permissions:
      agents: ["*"]
      workflows: ["*"]
      modules: ["*"]
      actions: ["read", "write", "execute", "admin"]

  developer:
    description: "Software developer"
    inherits: []
    permissions:
      agents: ["bmm/*", "bmgd/*", "core/*"]
      workflows: ["create-*", "dev-*", "sprint-*"]
      modules: ["bmm", "bmgd", "core"]
      actions: ["read", "write", "execute"]
```

### Module Restrictions

```yaml
module_restrictions:
  intel-team:
    description: "Intelligence operations require verification"
    require_roles: ["intel_analyst", "security_lead", "admin"]
    require_credential_verification: true
    audit_level: full
```

### Workflow Restrictions

```yaml
workflow_restrictions:
  operation-mosaic:
    description: "Full-spectrum intelligence"
    require_roles: ["intel_analyst", "security_lead", "admin"]
    require_credential_verification: true
    audit_level: full
```

### Agent Restrictions

```yaml
agent_restrictions:
  intel-team/field-operative:
    description: "Field operations specialist"
    require_roles: ["intel_analyst", "security_lead", "admin"]
    require_credential_verification: true
    warning_message: |
      Field operative provides tactical intelligence collection
      guidance. Use only with proper authorization.
```

---

## Hook Configuration

**File:** `.claude/settings.json`

### Security Validators

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "tool": "Bash",
        "command": ".claude/hooks/bash_safety.py"
      },
      {
        "tool": "Write",
        "command": ".claude/hooks/secret_guard.py"
      },
      {
        "tool": "Edit",
        "command": ".claude/hooks/env_protection.py"
      },
      {
        "tool": "Read",
        "command": ".claude/hooks/outside_repo_guard.py"
      }
    ],
    "UserPromptSubmit": [
      {
        "command": ".claude/hooks/prompt_injection_guard.py"
      },
      {
        "command": ".claude/hooks/jailbreak_guard.py"
      }
    ],
    "SessionStart": [
      {
        "command": ".claude/hooks/session-security-init.py"
      }
    ]
  }
}
```

### Available Hooks

| Hook | Tools | Purpose |
|------|-------|---------|
| `bash_safety.py` | Bash | Dangerous command detection |
| `secret_guard.py` | Write, Edit | Hardcoded secret detection |
| `env_protection.py` | Write, Edit | Sensitive file protection |
| `production_guard.py` | Bash | Production environment detection |
| `outside_repo_guard.py` | Read, Write, Edit, Glob, Grep | Repository boundary enforcement |
| `pii_guard.py` | Write, Edit | PII detection |
| `prompt_injection_guard.py` | UserPromptSubmit | Prompt injection defense |
| `jailbreak_guard.py` | UserPromptSubmit | Jailbreak detection |
| `session-security-init.py` | SessionStart | Session validation |

---

## Module Configuration

**File:** `_bmad/[module]/module.yaml`

Each module has its own configuration:

```yaml
# Example: _bmad/cybersec-team/module.yaml
module:
  name: "cybersec-team"
  version: "1.3.1"
  description: "Professional-grade cybersecurity operations"

  # Agent list
  agents:
    - security-architect
    - threat-analyst
    - penetration-tester
    # ...

  # Workflow list
  workflows:
    - incident-response
    - security-architecture-review
    # ...

  # Dependencies
  requires:
    - core
```

---

## Agent Customization

**File:** `_bmad/_config/agents/[module]-[agent].customize.yaml`

Customize individual agent behavior:

```yaml
# Example: _bmad/_config/agents/cybersec-team-security-architect.customize.yaml
preferences:
  verbosity: high            # low, medium, high
  output_format: markdown    # markdown, json
  default_framework: NIST_CSF  # Preferred framework

communication:
  style: professional        # casual, professional, formal
  detail_level: comprehensive  # brief, moderate, comprehensive
```

---

## Environment Variables

Some settings can be configured via environment variables:

| Variable | Purpose |
|----------|---------|
| `BMAD_CONFIG_PATH` | Custom config file location |
| `BMAD_OUTPUT_DIR` | Output directory |
| `BMAD_LOG_LEVEL` | Logging verbosity |
| `OLLAMA_HOST` | Ollama server URL |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Claude API key |

---

## Provider Commands

Quick commands for provider management:

```bash
# Check current provider
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

# Clear override (use config default)
.claude/hooks/llm-provider-manager.sh clear
```

---

## Configuration Best Practices

### For Security

1. **Keep YOLO disabled** unless specifically needed
2. **Enable audit logging** for sensitive operations
3. **Use local LLM** for sensitive modules
4. **Enable all security hooks** in production

### For Performance

1. **Route development to local** to save API costs
2. **Use Claude for complex** reasoning tasks
3. **Use Groq for speed** when quality isn't critical

### For Organizations

1. **Customize RBAC** for your team structure
2. **Set module overrides** based on data sensitivity
3. **Configure audit retention** per compliance requirements
4. **Maintain integrity manifest** after legitimate changes

---

## Related Documentation

- [LLM-PROVIDER-SYSTEM.md](LLM-PROVIDER-SYSTEM.md) - Provider setup and routing
- [DATA-SENSITIVITY-GUIDE.md](DATA-SENSITIVITY-GUIDE.md) - Data handling guidelines
- [SECURITY-OVERVIEW.md](SECURITY-OVERVIEW.md) - Security architecture
- [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) - Role configuration
