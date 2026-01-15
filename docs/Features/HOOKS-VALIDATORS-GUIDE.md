# BMAD Hooks and Validators Guide

Technical reference for the security hook validators that provide hard guardrails in BMAD-CYBER2.

---

## Overview

BMAD-CYBER2 implements a two-layer security defense:

| Layer | Type | Description |
|-------|------|-------------|
| **Layer 1** | Soft Guardrails | System prompt instructions in agent personas |
| **Layer 2** | Hard Guardrails | PreToolUse hooks that execute before each tool operation |

Hard guardrails are **deterministic** - they execute as Python scripts before any tool operation and cannot be bypassed by prompt injection.

---

## Architecture

### How Hooks Work

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

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Allow operation |
| 2 | Block operation (deterministic) |

---

## Validator Registry

### Location

Validators are located at: `.claude/validators/`

### Available Validators (9)

| Validator | Tool Coverage | Protection |
|-----------|---------------|------------|
| `bash_safety.py` | Bash | Dangerous command detection |
| `secret_guard.py` | Write, Edit | Hardcoded secret detection |
| `env_protection.py` | Write, Edit | Sensitive file protection |
| `production_guard.py` | Bash | Production environment detection |
| `outside_repo_guard.py` | Read, Write, Edit, Glob, Grep | Repository boundary enforcement |
| `pii_guard.py` | Write, Edit | PII detection |
| `prompt_injection_guard.py` | Write, Edit, UserPromptSubmit | Prompt injection defense |
| `jailbreak_guard.py` | UserPromptSubmit | Jailbreak detection |
| `session-security-init.py` | SessionStart | Session validation |

---

## Validator Details

### bash_safety.py

**Purpose:** Blocks dangerous bash commands that could cause irreversible damage.

#### Blocking Levels

| Level | Override | Examples |
|-------|----------|----------|
| ABSOLUTE BLOCK | None | `rm -rf /`, `rm -rf ~`, `rm -rf $HOME` |
| STRICT BLOCK | `BMAD_ALLOW_DANGEROUS` | `rm -rf` outside repo, fork bombs |

#### Dangerous Patterns Detected

**Absolute Block (No Override):**
- `rm -rf /` - Root deletion
- `rm -rf ~` - Home directory deletion
- `rm -rf $HOME` - Home variable deletion
- `rm -rf /home`, `/Users`, `/root`
- `rm -rf *` - Wildcard deletion

**Strict Block (With Override):**
- `rm -rf` targeting paths outside repository
- Fork bombs: `:(){ :|:& };:`
- Direct write to block devices: `> /dev/sda`
- Filesystem format: `mkfs.*`
- `dd` to devices
- `chmod 777 /`
- `chown root` on system paths
- `curl | bash` or `wget | bash`
- `eval` with variable expansion

#### Additional Detection

- Command substitution: `$()`, backticks
- Variable expansion: `${}`
- Directory traversal: Multiple `../`

#### Override

```bash
export BMAD_ALLOW_DANGEROUS=true
# Single-use, expires in 5 minutes
```

---

### secret_guard.py

**Purpose:** Blocks file writes containing hardcoded secrets, API keys, tokens, or passwords.

#### Secret Patterns Detected

**Critical (High Confidence):**

| Pattern | Example |
|---------|---------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` |
| GitHub Token | `ghp_[A-Za-z0-9]{36}` |
| Slack Token | `xox[baprs]-...` |
| Stripe Live Key | `sk_live_...` |
| Google API Key | `AIza[0-9A-Za-z-_]{35}` |
| OpenAI Key | `sk-proj-...` |
| Anthropic Key | `sk-ant-api03-...` |
| Private Keys | `-----BEGIN PRIVATE KEY-----` |
| Database URLs | `mongodb://user:pass@host` |

**High Confidence:**

| Pattern | Example |
|---------|---------|
| API Key assignments | `api_key = "sk..."` |
| Bearer tokens | `Bearer [token]` |
| JWT tokens | `eyJ...` (three parts) |
| Firebase API Key | `firebase_api_key = "..."` |

**Medium Confidence (Entropy Validated):**

| Pattern | Validation |
|---------|------------|
| Generic secrets | Requires high entropy (>3.5) |
| Password assignments | Requires length >12 |

#### Exceptions

**Allowed Files:**
- `.env.example`
- `.env.template`
- `.env.sample`
- `example.env`

**Allowed Content:**
- Lines containing: `example`, `placeholder`, `your_api_key`, `xxx`, `dummy`, `fake`, `test_key`, `sample`

#### Override

```bash
export BMAD_ALLOW_SECRETS=true
# Single-use, expires in 5 minutes
```

---

### env_protection.py

**Purpose:** Protects sensitive environment and configuration files from modification.

#### Protected Files

- `.env` files (all variants)
- `credentials.json`
- `secrets.yaml`
- `*.key` files
- `*.pem` files
- Configuration files with sensitive data

#### Override

```bash
export BMAD_ALLOW_SENSITIVE_FILES=true
```

---

### production_guard.py

**Purpose:** Detects and blocks operations targeting production environments.

#### Detection Patterns

- Production URLs: `prod.`, `production.`, `-prod-`
- Production database hosts
- Production API endpoints
- Production configuration files

#### Override

```bash
export BMAD_ALLOW_PRODUCTION=true
```

---

### outside_repo_guard.py

**Purpose:** Enforces repository boundary to prevent file operations outside the project.

#### Path Resolution

- Resolves `~` to home directory
- Resolves relative paths
- Follows symlinks
- Normalizes paths

#### Override

```bash
export BMAD_ALLOW_OUTSIDE_REPO=true
```

---

### pii_guard.py

**Purpose:** Detects and blocks file writes containing Personally Identifiable Information.

#### US PII Patterns

| Type | Pattern | Severity |
|------|---------|----------|
| Social Security Number | `XXX-XX-XXXX` | Critical |
| ITIN | `9XX-7X-XXXX` | Critical |
| Medicare ID | Specific format | Critical |
| Driver's License | State-specific | Warning |
| Passport Number | Format varies | Critical |
| Bank Routing Number | ABA validated | Critical |

#### EU PII Patterns (GDPR)

| Type | Country | Severity |
|------|---------|----------|
| IBAN | International | Critical |
| National Insurance | UK | Critical |
| NHS Number | UK | Critical |
| Steuer-ID | Germany | Critical |
| NIR | France | Critical |
| DNI/NIE | Spain | Critical |
| Codice Fiscale | Italy | Critical |
| BSN | Netherlands | Critical |
| National Number | Belgium | Critical |
| PESEL | Poland | Critical |
| NIF | Portugal | Critical |
| Personnummer | Sweden | Critical |
| HETU | Finland | Critical |

#### Common Patterns

| Type | Validation | Severity |
|------|------------|----------|
| Credit Card | Luhn algorithm | Critical |
| Email Address | Context required | Info |
| Private IP | Internal ranges | Info |
| GPS Coordinates | High precision | Warning |
| MAC Address | Format match | Info |

#### Validators

Many patterns include checksum validation:
- Luhn algorithm for credit cards
- MOD 97-10 for IBAN
- Country-specific checksum algorithms

#### Exceptions

**Test Files:**
- Files containing: `test_data`, `mock_data`, `sample_data`, `fixtures`, `seeds`
- Filenames with: `.example`, `.sample`, `.template`, `fake_`, `dummy_`

**Fake Data Indicators:**
- `fake`, `test`, `mock`, `dummy`, `sample`, `example`
- `john doe`, `jane doe`, `test user`
- `000-00-0000`, `123-45-6789`

#### Override

```bash
export BMAD_ALLOW_PII=true
```

---

### prompt_injection_guard.py

**Purpose:** Detects content that attempts to manipulate AI agent behavior through injected instructions.

#### Detection Categories

**System Override Attempts (Critical):**
- "Ignore previous instructions"
- "Disregard system prompt"
- "Override all rules"
- "Switch to developer mode"
- "Enter jailbreak mode"
- "Remove all restrictions"

**Role Hijacking (Warning):**
- Fake conversation markers: `Human:`, `Assistant:`, `System:`
- XML tag injection: `<system>`, `<instruction>`
- JSON instruction injection: `"role": "system"`

**Instruction Injection (Info):**
- Priority markers: `IMPORTANT:`, `CRITICAL:`
- Imperative statements: `always`, `never`, `must`
- Hidden instruction blocks
- Delimiter injection: `### System`, `--- Instructions`

**Encoded Payloads (Warning):**
- Base64 encoded instructions
- Hex encoded strings
- Unicode escape sequences

**Unicode Manipulation (Critical):**
- Zero-width characters (U+200B-U+200F)
- Text direction controls (U+202A-U+202E)
- Invisible operators (U+2060-U+2064)

**Context Manipulation (Warning):**
- Conversation reset attempts
- False authority claims: "I am an admin"
- Emotional manipulation

#### Hook Points

| Hook | Behavior |
|------|----------|
| PreToolUse (Read) | Warn only (must analyze malicious files) |
| PreToolUse (Write/Edit) | Block if injection detected |
| UserPromptSubmit | Warn and inform user |

#### Override

```bash
export BMAD_ALLOW_INJECTION_CONTENT=true
```

---

### jailbreak_guard.py

**Purpose:** Detects attempts to bypass AI safety guidelines through jailbreak techniques.

#### Detection Patterns

- DAN (Do Anything Now) prompts
- Character roleplay bypasses
- Hypothetical scenario exploits
- Token manipulation
- Multi-turn conversation exploits

#### Hook Point

| Hook | Behavior |
|------|----------|
| UserPromptSubmit | Warn and block |

#### Override

```bash
export BMAD_ALLOW_JAILBREAK=true
```

---

### session-security-init.py

**Purpose:** Runs at session start to validate security configuration.

#### Checks Performed

1. **Validator Existence:** Verifies all required validators exist
2. **Validator Accessibility:** Checks validators are readable
3. **Environment Variables:** Warns about active override variables
4. **Log Directory:** Initializes audit logging

#### Output

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

## Common Utilities

### security_common.py

Shared utilities for all validators.

#### AuditLogger

Provides secure audit logging for all security events.

```python
# Log a blocked operation
AuditLogger.log_blocked(validator, reason, command, additional)

# Log an allowed operation
AuditLogger.log_allowed(validator, reason, additional)

# Log override usage
AuditLogger.log_override_used(validator, override_var, target)
```

#### OverrideManager

Manages single-use override tokens with timeout.

```python
# Check and consume override
valid, reason = OverrideManager.check_and_consume_override('DANGEROUS')

# Get override status
status = OverrideManager.get_override_status()
```

#### Path Utilities

```python
# Resolve path to absolute
resolved = resolve_path(path, cwd)

# Check if path is in repository
in_repo = is_path_in_repo(path, cwd, project_dir)
```

---

## Override System

### Override Variables

| Variable | Protection Override |
|----------|-------------------|
| `BMAD_ALLOW_DANGEROUS` | Dangerous bash commands |
| `BMAD_ALLOW_SECRETS` | Hardcoded secrets |
| `BMAD_ALLOW_PRODUCTION` | Production targeting |
| `BMAD_ALLOW_OUTSIDE_REPO` | Outside repository |
| `BMAD_ALLOW_SENSITIVE_FILES` | Sensitive files |
| `BMAD_ALLOW_ESCAPE` | Directory escape |
| `BMAD_ALLOW_PII` | PII detection |
| `BMAD_ALLOW_INJECTION_CONTENT` | Prompt injection |
| `BMAD_ALLOW_JAILBREAK` | Jailbreak detection |

### Override Behavior

1. **Single-use:** Override is consumed after one operation
2. **Time-limited:** Expires after 5 minutes
3. **Logged:** All override usage is audit logged
4. **Explicit:** Must be set to exactly `true`

### Setting Overrides

```bash
# Set override (single-use, 5-minute expiry)
export BMAD_ALLOW_DANGEROUS=true

# Override is consumed after next matching operation
# Must be set again for subsequent operations
```

---

## Hook Configuration

### Location

Hooks are configured in: `.claude/settings.json`

### Configuration Structure

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "tool": "Bash",
        "command": ".claude/validators/bash_safety.py"
      },
      {
        "tool": "Write",
        "command": ".claude/validators/secret_guard.py"
      },
      {
        "tool": "Edit",
        "command": ".claude/validators/env_protection.py"
      },
      {
        "tool": "Read",
        "command": ".claude/validators/outside_repo_guard.py"
      }
    ],
    "UserPromptSubmit": [
      {
        "command": ".claude/validators/prompt_injection_guard.py"
      },
      {
        "command": ".claude/validators/jailbreak_guard.py"
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

---

## Audit Logging

### Log Location

```
.claude/logs/security.log
```

### Log Format

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "session_id": "abc123",
  "validator": "bash_safety",
  "severity": "BLOCKED",
  "action": "BLOCKED",
  "details": {
    "reason": "Dangerous rm command",
    "target": "rm -rf /tmp/important",
    "block_type": "STRICT"
  }
}
```

### Log Rotation

- Maximum size: 10MB
- Rotated to `.old` suffix
- Single rotation (keeps one backup)

---

## Troubleshooting

### Validator Not Running

1. Check validator exists: `ls .claude/validators/`
2. Check executable: `python3 .claude/validators/bash_safety.py`
3. Check settings.json configuration

### Override Not Working

1. Verify exact value: `echo $BMAD_ALLOW_DANGEROUS`
2. Check if already consumed (single-use)
3. Check if expired (5-minute timeout)

### False Positives

For persistent false positives:

1. Check if content matches exception patterns
2. Use appropriate file naming (e.g., `.example`, `test_`)
3. Contact maintainers to improve patterns

---

## Related Documentation

- [SECURITY-OVERVIEW.md](../UserGuide/SECURITY-OVERVIEW.md) - Security architecture
- [CONFIGURATION-GUIDE.md](../UserGuide/CONFIGURATION-GUIDE.md) - Configuration reference
- [AgenticSecurity.md](Security/AgenticSecurity.md) - AI manipulation defense
