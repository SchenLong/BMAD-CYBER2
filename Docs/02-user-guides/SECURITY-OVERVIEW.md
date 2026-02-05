# BMAD Security Overview

Comprehensive security architecture protecting the BMAD-CYBER2 framework.

---

## Security Architecture

BMAD-CYBER2 implements an 8-phase security framework providing defense-in-depth protection:

| Phase | Feature | Purpose | Status |
|-------|---------|---------|--------|
| 1 | Token-Based Authentication | Identity verification | Implemented |
| 2 | Role-Based Access Control (RBAC) | Permission management | Implemented |
| 3 | File Integrity Verification | Tamper detection | Implemented |
| 4 | Audit Logging | Activity tracking | Implemented |
| 5 | YOLO Mode Restrictions | Confirmation bypass controls | Implemented |
| 6 | Agentic Security Guardrails | AI manipulation defense | Implemented |
| 7 | **Rate Limiting (NEW)** | DoS protection | **Implemented** |
| 8 | **Plugin Permissions (NEW)** | Capability-based security | **Implemented** |

---

## Quick Start: Security Setup

### 1. Generate Authentication Token

```bash
# Interactive token generation
node _bmad/core/security/generate-token.js

# Quick token generation (non-interactive)
node _bmad/core/security/quick-token.cjs "YourName" "admin" 168
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
node _bmad/core/security/quick-token.cjs "Name" "role" hours

# Validate token
node _bmad/core/security/validate-token.js

# Token stored in: .bmad-token (git-ignored)
# Key stored in: .bmad-key (git-ignored)
```

**Detailed documentation:** [Security-Authentication.md](../06-reference/features/Security/Security-Authentication.md)

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

**Detailed documentation:** [Security-RBAC.md](../06-reference/features/Security/Security-RBAC.md)

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

**Detailed documentation:** [Security-File-Integrity.md](../06-reference/features/Security/Security-File-Integrity.md)

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

**Detailed documentation:** [Security-Audit-Logging.md](../06-reference/features/Security/Security-Audit-Logging.md)

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

**Detailed documentation:** [Security-YOLO-Mode-Restrictions.md](../06-reference/features/Security/Security-YOLO-Mode-Restrictions.md)

---

## Phase 6: Agentic Security Guardrails

**Purpose:** Protect against AI manipulation attacks (prompt injection, jailbreaking).

### Two-Layer Defense

| Layer | Type | Description |
|-------|------|-------------|
| **Layer 1** | Soft Guardrails | System prompt instructions in agent personas |
| **Layer 2** | Hard Guardrails | PreToolUse hooks that execute before each tool operation |

### Hard Guardrail Validators (19 Total)

#### Core Security Validators

| Validator | Protection |
|-----------|------------|
| `bash-safety.js` | Dangerous bash command detection |
| `secret.js` | Hardcoded secret detection (API keys, tokens) |
| `env-protection.js` | Sensitive file protection (.env, credentials) |
| `production.js` | Production environment targeting detection |
| `outside-repo.js` | Repository boundary enforcement |
| `pii.js` | PII detection (SSN, credit cards, IBAN) |
| `prompt-injection.js` | Prompt injection defense |
| `jailbreak.js` | Jailbreak attempt detection |
| `token-validator.js` | Session startup validation and authentication |

#### OWASP Remediation Validators (NEW)

| Validator | Protection | OWASP |
|-----------|------------|-------|
| `rate-limiter.js` | DoS protection (sliding window) | LLM04 |
| `plugin-permissions.js` | Capability-based security | LLM07 |
| `supply-chain.js` | SHA256+GPG skill verification | LLM05 |
| `context-manager.js` | Context window management | LLM04 |
| `recursion-guard.js` | Recursion/depth limits | LLM04 |
| `resource-limits.js` | Memory/process limits | LLM04 |
| `confidence-tracker.js` | Uncertainty detection | LLM09 |
| `telemetry.js` | SIEM telemetry export | - |

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
| Command Injection | bash-safety.js blocks dangerous commands |
| Secret Exposure | secret.js detects credentials in content |
| File Exfiltration | outside-repo.js enforces boundaries |
| PII Exposure | pii.js detects and can redact |
| Prompt Injection | prompt-injection.js detects embedded instructions |
| Jailbreaking | jailbreak.js detects persona hijacking |
| Production Attacks | production.js blocks production targeting |

**Detailed documentation:** [AgenticSecurity.md](../06-reference/features/Security/AgenticSecurity.md), [HooksGuardrails.md](../06-reference/features/Security/HooksGuardrails.md)

---

## Phase 7: Rate Limiting (NEW)

**Purpose:** Prevent denial-of-service through excessive tool invocations.

**OWASP Reference:** LLM04 - Model Denial of Service

### Features

- **Sliding window algorithm** - Accurate request counting per minute
- **Per-operation limits** - Different limits for different tool types
- **Exponential backoff** - Progressive delays on repeated violations
- **Whitelist bypass** - Critical operations exempt from limits

### Rate Limits

| Operation | Limit/Minute | Description |
|-----------|--------------|-------------|
| Global | 100 | All operations combined |
| Bash | 30 | Shell commands |
| Write/Edit | 50 | File modifications |
| Read | 200 | File reading |
| Task | 20 | Agent spawning |
| Web | 20-30 | Network operations |

### Commands

```bash
# Check current rate limit status
node .claude/validators-node/bin/rate-limiter.js status

# Reset rate limits
node .claude/validators-node/bin/rate-limiter.js reset
```

**Detailed documentation:** [Rate-Limiting.md](../06-reference/features/Security/Rate-Limiting.md)

---

## Phase 8: Plugin Permissions (NEW)

**Purpose:** Capability-based security for BMAD plugins/modules.

**OWASP Reference:** LLM07 - Insecure Plugin Design

### Features

- **Manifest-based permissions** - Each plugin declares required capabilities
- **Four capability types** - filesystem, network, shell, sensitive_data
- **RBAC integration** - Role-based permission inheritance
- **Default deny** - Restrictive defaults for plugins without manifests

### Capabilities

| Capability | Controls |
|------------|----------|
| `filesystem` | Read/write access to files |
| `network` | API calls, web fetching |
| `shell` | Command execution |
| `sensitive_data` | PII and sensitive data access |

### Plugin Manifests

Each plugin has a `manifest.yaml`:

```yaml
name: intel-team
version: 1.0.0
permissions:
  filesystem:
    read: ["_bmad/intel-team/**", "docs/**"]
    write: ["_bmad/intel-team/output/**"]
  network: true
  shell:
    allowed_commands: ["curl", "wget", "whois"]
    blocked_commands: ["rm", "sudo"]
  sensitive_data: true
```

### Commands

```bash
# List all plugins and manifest status
node .claude/validators-node/bin/plugin-permissions.js list

# Check specific permission
node .claude/validators-node/bin/plugin-permissions.js check intel-team shell execute "curl https://example.com"
```

**Detailed documentation:** [Plugin-Permissions.md](../06-reference/features/Security/Plugin-Permissions.md), [Plugin Manifest Schema](../06-reference/features/PLUGIN-MANIFEST-SCHEMA.md)

---

## OWASP AI Security Compliance

BMAD-CYBER2 implements comprehensive OWASP Top 10 for LLM Applications coverage:

| OWASP Category | Score | Status | Implementation |
|----------------|-------|--------|----------------|
| LLM01: Prompt Injection | 95/100 | ✅ PROTECTED | prompt-injection.js, jailbreak.js |
| LLM02: Insecure Output | 90/100 | ✅ PROTECTED | Output validators, sanitization |
| LLM04: Model DoS | **85/100** | ✅ IMPROVED | rate-limiter.js, context-manager.js, recursion-guard.js, resource-limits.js |
| LLM05: Supply Chain | **80/100** | ✅ IMPROVED | supply-chain.js |
| LLM06: Sensitive Info | 98/100 | ✅ PROTECTED | pii.js, secret.js |
| LLM07: Plugin Design | **85/100** | ✅ IMPROVED | plugin-permissions.js, manifest system |
| LLM08: Excessive Agency | 92/100 | ✅ PROTECTED | RBAC, audit logging |
| LLM09: Overreliance | **65/100** | ✅ IMPROVED | confidence-tracker.js |

**Overall OWASP Score: 93/100 (Grade: A)**

**Detailed documentation:** [OWASP-AI-SECURITY-CHECKLIST.md](../../_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md), [OWASP-REMEDIATION-PLAN.md](../../_bmad/core/security/OWASP-REMEDIATION-PLAN.md)

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
| `.claude/validators-node/bin/*.js` | Security validators | Yes |
| `_bmad-output/.audit/audit.log` | Audit log | No |

---

## Related Documentation

### Detailed Security Documentation

- [Security-Authentication.md](../06-reference/features/Security/Security-Authentication.md) - Token-based authentication
- [Security-RBAC.md](../06-reference/features/Security/Security-RBAC.md) - Role-based access control
- [Security-File-Integrity.md](../06-reference/features/Security/Security-File-Integrity.md) - GPG file integrity
- [Security-Audit-Logging.md](../06-reference/features/Security/Security-Audit-Logging.md) - Tamper-evident audit
- [Security-YOLO-Mode-Restrictions.md](../06-reference/features/Security/Security-YOLO-Mode-Restrictions.md) - YOLO controls
- [AgenticSecurity.md](../06-reference/features/Security/AgenticSecurity.md) - AI manipulation defense
- [HooksGuardrails.md](../06-reference/features/Security/HooksGuardrails.md) - Hard guardrail validators
- [Rate-Limiting.md](../06-reference/features/Security/Rate-Limiting.md) - DoS protection (OWASP LLM04)
- [Plugin-Permissions.md](../06-reference/features/Security/Plugin-Permissions.md) - Capability-based security (OWASP LLM07)
- [Plugin Manifest Schema](../06-reference/features/PLUGIN-MANIFEST-SCHEMA.md) - Manifest schema reference

### User Guides

- [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) - Role permissions and access
- [LLM-PROVIDER-SYSTEM.md](LLM-PROVIDER-SYSTEM.md) - Provider routing for privacy
- [DATA-SENSITIVITY-GUIDE.md](DATA-SENSITIVITY-GUIDE.md) - Data handling best practices
