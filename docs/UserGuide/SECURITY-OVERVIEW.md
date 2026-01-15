# BMAD Security Overview

Comprehensive security architecture protecting the BMAD-CYBER2 framework.

---

## Security Architecture

BMAD-CYBER2 implements a 6-phase security framework providing defense-in-depth protection:

| Phase | Feature | Purpose |
|-------|---------|---------|
| 1 | Token-Based Authentication | Identity verification |
| 2 | Role-Based Access Control (RBAC) | Permission management |
| 3 | File Integrity Verification | Tamper detection |
| 4 | Audit Logging | Activity tracking |
| 5 | YOLO Mode Restrictions | Confirmation bypass controls |
| 6 | Agentic Security Guardrails | AI manipulation defense |

---

## Quick Start: Security Setup

### 1. Generate Authentication Token

```bash
# Interactive token generation
node _bmad/core/security/generate-token.js

# Quick token generation (non-interactive)
node _bmad/core/security/quick-token.js "YourName" "admin" 168
```

### 2. Validate Token

```bash
node _bmad/core/security/validate-token.js
```

### 3. Verify File Integrity

```bash
# Import signing key (one-time)
gpg --import _bmad/core/security/bmad-public-key.asc

# Verify all protected files
./_bmad/core/security/verify-integrity.sh
```

### 4. Check Your Permissions

```bash
node _bmad/core/security/check-authorization.js
```

---

## Phase 1: Authentication

**Purpose:** Verify user identity before granting access.

### How It Works

1. User generates an encrypted authentication token
2. Token contains identity claims (name, roles, modules)
3. Token is validated at session start
4. Invalid/expired tokens are rejected

### Token Contents

| Claim | Description |
|-------|-------------|
| `sub` | Unique user identifier (UUID) |
| `name` | User's display name |
| `email` | User's email (optional) |
| `roles` | Assigned roles (e.g., `admin`, `developer`) |
| `modules` | Accessible modules |
| `exp` | Expiration timestamp |
| `jti` | Unique token ID |

### Token Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Token validity | 7 days | How long token remains valid |
| Session timeout | 8 hours | Inactivity timeout |
| Encryption | AES-256-GCM | Token encryption algorithm |

### Commands

```bash
# Generate token (interactive)
node _bmad/core/security/generate-token.js

# Generate token (quick)
node _bmad/core/security/quick-token.js "Name" "role" hours

# Validate token
node _bmad/core/security/validate-token.js

# Token stored in: .bmad-token (git-ignored)
# Key stored in: .bmad-key (git-ignored)
```

**Detailed documentation:** [Security-Authentication.md](../Features/Security/Security-Authentication.md)

---

## Phase 2: Role-Based Access Control (RBAC)

**Purpose:** Control access to agents, workflows, and modules based on user roles.

### Security Model

- **Deny by default**: Access denied unless explicitly granted
- **Role inheritance**: Roles can inherit from other roles
- **Wildcard patterns**: Flexible permission grants (`cybersec-team/*`)
- **Fine-grained restrictions**: Per-workflow and per-agent controls

### Available Roles

| Role | Description | Module Access |
|------|-------------|---------------|
| `admin` | Full system administrator | All modules |
| `security_lead` | Security team lead | cybersec-team, intel-team, core |
| `security_analyst` | Security analyst | cybersec-team, core |
| `intel_analyst` | Intelligence analyst | intel-team, core |
| `legal_counsel` | Legal team member | legal-team, core |
| `developer` | Software developer | bmm, bmgd, bmb, cis, core |
| `product_manager` | Product manager | bmm, cis, core |
| `strategist` | Strategic advisor | strategy-team, core |
| `viewer` | Read-only access | core |
| `guest` | Minimal guest access | core (limited) |

### Commands

```bash
# Check your permissions
node _bmad/core/security/check-authorization.js

# Check specific access
node _bmad/core/security/check-authorization.js workflow operation-mosaic
node _bmad/core/security/check-authorization.js agent intel-team/osint-lead
node _bmad/core/security/check-authorization.js module cybersec-team

# List all roles
node _bmad/core/security/check-authorization.js roles
```

**Detailed documentation:** [Security-RBAC.md](../Features/Security/Security-RBAC.md)

---

## Phase 3: File Integrity Verification

**Purpose:** Detect tampering with critical framework files.

### Protection Scope

| Category | Files Protected |
|----------|-----------------|
| Agents | ~80 agent definition files |
| Workflows | ~50 workflow files + ~500 step files |
| Configurations | ~10 configuration files |
| Security hooks | ~10 validator files |
| **Total** | **679 protected files** |

### How It Works

1. SHA-256 hashes computed for all protected files
2. Manifest signed with GPG (RSA-4096)
3. Before session: verify signature and hashes
4. Any mismatch triggers alert and blocks execution

### Commands

```bash
# Import signing key (one-time setup)
gpg --import _bmad/core/security/bmad-public-key.asc

# Verify integrity
./_bmad/core/security/verify-integrity.sh

# After legitimate changes, regenerate manifest
./_bmad/core/security/sign-manifest.sh
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Signature verification failed |
| 2 | Hash mismatch detected (tampering) |
| 3 | Missing files detected |
| 4 | Setup error |

**Detailed documentation:** [Security-File-Integrity.md](../Features/Security/Security-File-Integrity.md)

---

## Phase 4: Audit Logging

**Purpose:** Track all operations with tamper-evident logs.

### Features

- **JSON format**: Structured, parseable logs
- **Hash chain**: SHA-256 linking between entries (tamper-evident)
- **90-day retention**: Configurable retention period
- **Mandatory logging**: Critical events cannot be disabled

### Events Logged

| Event Type | Description |
|------------|-------------|
| `workflow_start` | Workflow execution begins |
| `workflow_complete` | Workflow execution completes |
| `workflow_error` | Workflow execution fails |
| `agent_activation` | Agent is activated |
| `agent_tool_use` | Agent uses a tool |
| `file_write` | File is written |
| `file_delete` | File is deleted |
| `yolo_invocation` | YOLO mode used (always logged) |
| `security_warning` | Security event detected |
| `security_violation` | Security rule violated |

### Log Location

```
_bmad-output/.audit/audit.log
```

### Log Entry Format

```json
{
  "timestamp": "2026-01-15T10:30:00.000Z",
  "event_type": "workflow_start",
  "workflow": "security-architecture-review",
  "user_id": "abc-123",
  "user_roles": ["security_analyst"],
  "details": { ... },
  "prev_hash": "sha256...",
  "hash": "sha256..."
}
```

**Detailed documentation:** [Security-Audit-Logging.md](../Features/Security/Security-Audit-Logging.md)

---

## Phase 5: YOLO Mode Restrictions

**Purpose:** Control workflow execution mode that skips confirmations.

### Default Configuration

```yaml
yolo_mode:
  enabled: false              # Disabled by default (safest)
  require_explicit_flag: true # Must explicitly request
  log_invocations: true       # Always logged (cannot disable)
  allowed_workflows: []       # Empty = no YOLO allowed
```

### How It Works

1. YOLO mode is **disabled by default**
2. If enabled, requires explicit acknowledgment
3. Only allowlisted workflows can use YOLO
4. All YOLO invocations are logged (cannot be disabled)

### Risk Levels

| Configuration | Risk Level |
|---------------|------------|
| `enabled: false` | Safest - YOLO never allowed |
| `enabled: true` + empty allowlist | Safe - requires explicit workflow allowlist |
| `enabled: true` + specific workflows | Moderate - only listed workflows |
| `enabled: true` + `*` allowlist | Highest risk - not recommended |

**Detailed documentation:** [Security-YOLO-Mode-Restrictions.md](../Features/Security/Security-YOLO-Mode-Restrictions.md)

---

## Phase 6: Agentic Security Guardrails

**Purpose:** Protect against AI manipulation attacks (prompt injection, jailbreaking).

### Two-Layer Defense

| Layer | Type | Description |
|-------|------|-------------|
| **Layer 1** | Soft Guardrails | System prompt instructions in agent personas |
| **Layer 2** | Hard Guardrails | PreToolUse hooks that execute before each tool operation |

### Hard Guardrail Validators (9 Total)

| Validator | Protection |
|-----------|------------|
| `bash_safety.py` | Dangerous bash command detection |
| `secret_guard.py` | Hardcoded secret detection (API keys, tokens) |
| `env_protection.py` | Sensitive file protection (.env, credentials) |
| `production_guard.py` | Production environment targeting detection |
| `outside_repo_guard.py` | Repository boundary enforcement |
| `pii_guard.py` | PII detection (SSN, credit cards, IBAN) |
| `prompt_injection_guard.py` | Prompt injection defense |
| `jailbreak_guard.py` | Jailbreak attempt detection |
| `session-security-init.py` | Session startup validation |

### How Hard Guardrails Work

```
User Request
    │
    ▼
┌─────────────────┐
│  Agent decides  │
│  to use a tool  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PreToolUse     │◄─── Hard guardrails execute HERE
│  Hooks run      │     BEFORE the tool runs
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ ALLOW │ │ BLOCK │  Exit code 2 = deterministic block
│ (0)   │ │ (2)   │  Cannot be bypassed by prompt injection
└───────┘ └───────┘
```

### Protection Categories

| Attack Type | Protection |
|-------------|------------|
| Command Injection | bash_safety.py blocks dangerous commands |
| Secret Exposure | secret_guard.py detects credentials in content |
| File Exfiltration | outside_repo_guard.py enforces boundaries |
| PII Exposure | pii_guard.py detects and can redact |
| Prompt Injection | prompt_injection_guard.py detects embedded instructions |
| Jailbreaking | jailbreak_guard.py detects persona hijacking |
| Production Attacks | production_guard.py blocks production targeting |

**Detailed documentation:** [AgenticSecurity.md](../Features/Security/AgenticSecurity.md), [HooksGuardrails.md](../Features/Security/HooksGuardrails.md)

---

## Security Best Practices

### For All Users

1. **Generate a token** before starting sessions
2. **Verify integrity** before working on sensitive projects
3. **Use appropriate roles** - don't use admin if not needed
4. **Keep YOLO disabled** unless specifically required

### For Sensitive Data

1. **Route to local LLM** for sensitive modules (see [LLM-PROVIDER-SYSTEM.md](LLM-PROVIDER-SYSTEM.md))
2. **Use credential verification** for intel-team access
3. **Review audit logs** for unusual activity
4. **Follow data sensitivity guide** (see [DATA-SENSITIVITY-GUIDE.md](DATA-SENSITIVITY-GUIDE.md))

### For Administrators

1. **Customize RBAC** for your organization's needs
2. **Monitor audit logs** regularly
3. **Re-sign manifest** after legitimate changes
4. **Review hook configurations** in `.claude/settings.json`

---

## Security Files Reference

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `.bmad-token` | Encrypted auth token | No (gitignored) |
| `.bmad-key` | AES-256 encryption key | No (gitignored) |
| `_bmad/core/security/auth-config.yaml` | Authentication settings | Yes |
| `_bmad/core/security/rbac-config.yaml` | RBAC role definitions | Yes |
| `_bmad/core/security/file-integrity-manifest.txt` | File hashes | Yes |
| `_bmad/core/security/file-integrity-manifest.txt.sig` | GPG signature | Yes |
| `_bmad/core/security/bmad-public-key.asc` | GPG public key | Yes |
| `.claude/settings.json` | Hook configuration | Yes |
| `.claude/hooks/*.py` | Security validators | Yes |
| `_bmad-output/.audit/audit.log` | Audit log | No |

---

## Related Documentation

### Detailed Security Documentation

- [Security-Authentication.md](../Features/Security/Security-Authentication.md) - Token-based authentication
- [Security-RBAC.md](../Features/Security/Security-RBAC.md) - Role-based access control
- [Security-File-Integrity.md](../Features/Security/Security-File-Integrity.md) - GPG file integrity
- [Security-Audit-Logging.md](../Features/Security/Security-Audit-Logging.md) - Tamper-evident audit
- [Security-YOLO-Mode-Restrictions.md](../Features/Security/Security-YOLO-Mode-Restrictions.md) - YOLO controls
- [AgenticSecurity.md](../Features/Security/AgenticSecurity.md) - AI manipulation defense
- [HooksGuardrails.md](../Features/Security/HooksGuardrails.md) - Hard guardrail validators

### User Guides

- [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) - Role permissions and access
- [LLM-PROVIDER-SYSTEM.md](LLM-PROVIDER-SYSTEM.md) - Provider routing for privacy
- [DATA-SENSITIVITY-GUIDE.md](DATA-SENSITIVITY-GUIDE.md) - Data handling best practices
