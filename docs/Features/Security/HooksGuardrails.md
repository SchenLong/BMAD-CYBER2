# BMAD Guardrails: Hooks-Based Security System

## Overview

The BMAD framework implements a comprehensive security guardrail system using Claude Code's hooks feature. This document describes the technical implementation, configuration, and operational behavior of these guardrails.

**Version:** 3.0
**Last Updated:** 2026-01-13

---

## Architecture

### File Structure

```
.claude/
├── settings.json              # Hook configuration
├── hooks/
│   ├── session-security-init.py   # Session startup validation + integrity check
│   └── session-start-tts.sh       # Text-to-speech notification
├── validators/
│   ├── security_common.py         # Shared utilities
│   ├── bash_safety.py             # Bash command validation
│   ├── secret_guard.py            # Secret/credential detection
│   ├── env_protection.py          # Sensitive file protection
│   ├── production_guard.py        # Production environment guard
│   ├── outside_repo_guard.py      # Repository boundary guard
│   ├── pii_guard.py               # PII detection (US + EU)
│   ├── prompt_injection_guard.py  # Prompt injection detection
│   ├── jailbreak_guard.py         # Jailbreak attempt detection
│   └── checksums.sha256           # Validator integrity checksums
└── logs/
    └── security.log               # Audit log
```

### Security Hardening

The guardrail system includes several security hardening measures:

1. **Executable Permissions** - All validators have `+x` permission
2. **SHA256 Integrity Verification** - Checksums validated at session start
3. **Tamper Detection** - Checksum mismatches trigger DEGRADED status warning
4. **Direct Python Execution** - No shell wrapper (reduced attack surface)

**Regenerating Checksums** (after intentional validator updates):
```bash
cd .claude/validators && sha256sum *.py > checksums.sha256
```

### Hook Types

| Hook Type | Trigger | Purpose |
|-----------|---------|---------|
| `SessionStart` | Session begins | Initialize security, validate config |
| `UserPromptSubmit` | User sends message | Scan for jailbreak/injection in input |
| `PreToolUse` | Before tool executes | Validate tool parameters |

### Tool-to-Validator Matrix

| Validator | Bash | Write | Edit | Read | Glob | Grep | UserPrompt |
|-----------|------|-------|------|------|------|------|------------|
| bash_safety | ✓ | | | | | | |
| secret_guard | | ✓ | ✓ | | | | |
| env_protection | | ✓ | ✓ | | | | |
| production_guard | ✓ | | | | | | |
| outside_repo_guard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| pii_guard | | ✓ | ✓ | | | | |
| prompt_injection_guard | | ✓ | ✓ | ✓ | | | ✓ |
| jailbreak_guard | | | | | | | ✓ |

---

## Validators

### 1. Bash Safety (`bash_safety.py`)

Validates bash commands to prevent dangerous operations.

**Protection Levels:**

| Level | Override | Examples |
|-------|----------|----------|
| ABSOLUTE | Cannot override | Fork bombs, `rm -rf /`, `dd` to disk |
| STRICT | `BMAD_ALLOW_DANGEROUS=true` | Recursive delete with wildcards, credential access |
| WARNING | Log only | `sudo`, basic `rm -rf` |

**Absolute Block Patterns:**
- Fork bombs (`:(){:|:&};:`)
- Root filesystem deletion (`rm -rf /`)
- Direct disk writes (`dd if=/dev/zero of=/dev/sda`)
- Kernel/boot file deletion

**Strict Block Patterns:**
- `rm -rf *` (recursive wildcard delete)
- `curl | sh` (pipe to shell)
- Credential file access (`cat ~/.ssh/id_rsa`)
- History tampering

---

### 2. Secret Guard (`secret_guard.py`)

Detects hardcoded secrets, API keys, and credentials.

**Detection Methods:**
1. **Pattern matching** - Known API key formats (AWS, GitHub, Stripe, etc.)
2. **Entropy analysis** - High-entropy strings (>4.5 bits)
3. **Variable names** - `password=`, `api_key=`, `secret=`

**Detected Secret Types:**
- AWS Access Keys (`AKIA...`)
- GitHub Tokens (`ghp_...`, `gho_...`)
- Stripe Keys (`sk_live_...`)
- Private Keys (`-----BEGIN PRIVATE KEY-----`)
- Database URLs with credentials
- JWT tokens
- Bearer/Basic auth headers

**Override:** `BMAD_ALLOW_SECRETS=true`

---

### 3. Environment Protection (`env_protection.py`)

Protects sensitive configuration files.

**Absolute Protection (no override):**
- `.env`, `.env.local`, `.env.production`
- `credentials.json`, `secrets.json`
- Private keys (`.pem`, `id_rsa`, `id_ed25519`)
- AWS/GCP credentials
- SSH config files

**Strict Protection:**
- Docker/CI configuration
- Terraform state/variables
- Cloud provider configs
- Database configs

**Override:** `BMAD_ALLOW_SENSITIVE_FILES=true`

---

### 4. Production Guard (`production_guard.py`)

Prevents accidental production operations.

**Detection Methods:**
1. **Environment variables** - `NODE_ENV=production`, `RAILS_ENV=production`
2. **Hostname patterns** - `prod.`, `production.`, `live.`
3. **URL patterns** - `https://prod.`, `https://api.company.com`
4. **Database patterns** - `@prod-db.`, `production-db`

**Override:** `BMAD_ALLOW_PRODUCTION=true`

---

### 5. Outside Repository Guard (`outside_repo_guard.py`)

Enforces repository boundaries.

**Allowed Outside Paths:**
- `/tmp`, `/var/tmp`
- `/usr/bin`, `/usr/local/bin`
- `/opt/homebrew` (macOS)

**Safe Command Patterns:**
- `which`, `where`, `type`
- `npm install`, `yarn`, `pip install`
- `git clone`, `git fetch`

**Blocked:**
- File operations outside repository
- Directory traversal (`../../../`)

**Override:** `BMAD_ALLOW_OUTSIDE_REPO=true`

---

### 6. PII Guard (`pii_guard.py`)

Detects Personally Identifiable Information (US and EU).

**US PII Detection:**
| Type | Pattern | Validation |
|------|---------|------------|
| SSN | `XXX-XX-XXXX` | Format check |
| Credit Card | Visa, MC, Amex, Discover | Luhn algorithm |
| Phone | `(XXX) XXX-XXXX` | Format check |

**EU PII Detection (GDPR-relevant):**
| Type | Country | Validation |
|------|---------|------------|
| IBAN | All EU | MOD 97-10 |
| DNI/NIE | Spain | Checksum |
| BSN | Netherlands | 11-check |
| PESEL | Poland | Checksum |
| INSEE | France | Format |
| Codice Fiscale | Italy | Format |
| National Number | Belgium | MOD 97 |
| NIF | Portugal | Format |
| NINO | UK | Format |

**Override:** `BMAD_ALLOW_PII=true`

---

### 7. Prompt Injection Guard (`prompt_injection_guard.py`)

Detects prompt injection attempts in content.

**Detection Categories:**

| Category | Examples | Severity |
|----------|----------|----------|
| System Override | "Ignore previous instructions" | Critical |
| Role Hijacking | Fake `Human:`, `Assistant:` markers | High |
| Instruction Injection | `[SYSTEM MESSAGE]`, `<!-- override -->` | High |
| Encoded Payloads | Base64, hex, unicode escapes | Medium |
| Hidden Unicode | Zero-width chars, RTL overrides | High |

**Hook Points:**
- `UserPromptSubmit` - Scans incoming user messages
- `PreToolUse` (Write/Edit) - Blocks storing injection payloads
- `PreToolUse` (Read) - Warns but allows (for security analysis)

**Override:** `BMAD_ALLOW_INJECTION_CONTENT=true`

---

### 8. Jailbreak Guard (`jailbreak_guard.py`)

Detects jailbreak attempts in user messages.

**Detection Categories:**

| Category | Examples | Severity |
|----------|----------|----------|
| DAN Variants | "Do Anything Now", STAN, DUDE | Critical |
| Roleplay Exploitation | "Pretend you have no restrictions" | High |
| Hypothetical Framing | "For educational purposes" | Medium |
| Authority Impersonation | "I work at Anthropic" | Critical |
| Social Engineering | Guilt, urgency, flattery | High |
| Known Templates | Grandma exploit, token games | Critical |
| Obfuscation | Leet speak, reversed text | High |

**Session Risk Tracking:**
- Cumulative risk score across messages
- Risk decay after 5 minutes of no attempts
- Escalation detection (increasing attempts)

**Risk Levels:**
| Score | Level | Action |
|-------|-------|--------|
| <10 | LOW | Warn only |
| 10-25 | MEDIUM | Block |
| >25 | HIGH | Block + escalation warning |

**Override:** `BMAD_ALLOW_JAILBREAK=true`

---

## Override System

### Single-Use Overrides

All overrides are **single-use** and expire after **5 minutes**.

```bash
# Set override for next blocked operation
export BMAD_ALLOW_DANGEROUS=true

# Override is consumed on first use
# Must be set again for subsequent operations
```

### Override Environment Variables

| Variable | Purpose |
|----------|---------|
| `BMAD_ALLOW_DANGEROUS` | Dangerous bash commands |
| `BMAD_ALLOW_SECRETS` | Hardcoded secrets |
| `BMAD_ALLOW_SENSITIVE_FILES` | Protected config files |
| `BMAD_ALLOW_PRODUCTION` | Production operations |
| `BMAD_ALLOW_OUTSIDE_REPO` | Outside repository access |
| `BMAD_ALLOW_PII` | PII in content |
| `BMAD_ALLOW_INJECTION_CONTENT` | Prompt injection patterns |
| `BMAD_ALLOW_JAILBREAK` | Jailbreak patterns |

---

## Audit Logging

All security events are logged to `.claude/logs/security.log`.

### Log Entry Format

```json
{
  "timestamp": "2026-01-13T10:30:00.000000",
  "session_id": "abc123",
  "validator": "bash_safety",
  "severity": "BLOCKED",
  "action": "BLOCKED",
  "details": {
    "reason": "Recursive force delete with wildcard",
    "target": "rm -rf *"
  }
}
```

### Severity Levels

| Level | Meaning |
|-------|---------|
| INFO | Operation allowed |
| WARNING | Suspicious but allowed |
| BLOCKED | Operation blocked |
| CRITICAL | Serious security event |

### Log Rotation

- Maximum size: 10MB
- Rotation: Current → `.old`

---

## Session Initialization

On session start, `session-security-init.py` runs to:

1. **Verify validators** - Check all 9 validators exist and are readable
2. **Check overrides** - Warn about active override env vars
3. **Initialize logging** - Ensure log directory is writable
4. **Report status** - Display security status to user

### Session Start Output

```
============================================================
BMAD GUARDRAILS: Security Initialization
============================================================
  [OK] All 9 security validators present
  [OK] No override environment variables active
  [OK] Audit logging initialized: .claude/logs

============================================================
  STATUS: FULLY ACTIVE

  Security guardrails protect against:
    - Dangerous bash commands (rm -rf, fork bombs, etc.)
    - Hardcoded secrets in code
    - Modifications to sensitive files (.env, credentials)
    - Production environment targeting
    - Operations outside repository boundaries
    - PII exposure (SSN, credit cards, EU national IDs, IBAN)
    - Prompt injection attacks
    - Jailbreak attempts
============================================================
```

---

## Exit Codes

All validators use consistent exit codes:

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Allow | Operation proceeds |
| 2 | Block | Operation blocked, user notified |

---

## Security Guarantees

| Threat | Validator | Protection Level |
|--------|-----------|------------------|
| Dangerous commands | bash_safety | Absolute/Strict |
| Hardcoded secrets | secret_guard | Strict |
| Credential files | env_protection | Absolute/Strict |
| Production targeting | production_guard | Strict |
| Repository escape | outside_repo_guard | Strict |
| PII exposure | pii_guard | Strict |
| Prompt injection | prompt_injection_guard | Strict |
| Jailbreak attempts | jailbreak_guard | Strict |

---

## Troubleshooting

### Validator Not Running

1. Check `settings.json` hook configuration
2. Verify Python 3 is available
3. Check validator file permissions

### False Positives

1. Use appropriate override environment variable
2. Report persistent false positives for pattern refinement
3. Check if content matches test data indicators

### Override Not Working

1. Ensure `=true` (lowercase)
2. Check override hasn't expired (5-minute timeout)
3. Verify override wasn't already consumed

---

## Version History

### v3.0 (Current)
- Added PII Guard with US + EU patterns
- Added Prompt Injection Guard
- Added Jailbreak Guard with session risk tracking
- Added UserPromptSubmit hook integration
- 9 total validators

### v2.0
- Added outside_repo_guard
- Added production_guard
- Single-use override system
- Audit logging

### v1.0
- Initial implementation
- bash_safety, secret_guard, env_protection
