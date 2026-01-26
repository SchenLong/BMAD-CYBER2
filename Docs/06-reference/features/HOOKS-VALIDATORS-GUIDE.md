# BMAD Hooks and Validators Guide

Technical reference for the security hook validators that provide hard guardrails in BMAD-CYBER2.

---

## Overview

BMAD-CYBER2 implements a two-layer security defense:

| Layer | Type | Description |
|-------|------|-------------|
| **Layer 1** | Soft Guardrails | System prompt instructions in agent personas |
| **Layer 2** | Hard Guardrails | PreToolUse hooks that execute before each tool operation |

Hard guardrails are **deterministic** - they execute as Node.js scripts before any tool operation and cannot be bypassed by prompt injection.

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

Validators are located at: `.claude/validators-node/bin/`

### Available Validators (19)

#### Core Security Validators

| Validator | Tool Coverage | Protection | OWASP |
|-----------|---------------|------------|-------|
| `bash-safety.js` | Bash | Dangerous command detection | - |
| `secret.js` | Write, Edit | Hardcoded secret detection | LLM06 |
| `env-protection.js` | Write, Edit | Sensitive file protection | LLM06 |
| `production.js` | Bash | Production environment detection | - |
| `outside-repo.js` | Read, Write, Edit, Glob, Grep | Repository boundary enforcement | - |
| `pii.js` | Write, Edit | PII detection | LLM06 |
| `prompt-injection.js` | Write, Edit, UserPromptSubmit | Prompt injection defense | **LLM01** |
| `jailbreak.js` | UserPromptSubmit | Jailbreak detection | **LLM01** |
| `token-validator.js` | SessionStart | Session validation | - |
| `token-validator.js` | SessionStart | Authentication enforcement | - |
| `security-common.js` | (Library) | Shared utilities | - |

#### OWASP Remediation Validators (NEW - Phase 1-4)

| Validator | Tool Coverage | Protection | OWASP |
|-----------|---------------|------------|-------|
| `rate-limiter.js` | All tools | DoS protection (sliding window) | **LLM04** |
| `plugin-permissions.js` | All tools | Capability-based security | **LLM07** |
| `supply-chain.js` | Skill loading | SHA256+GPG verification | **LLM05** |
| `context-manager.js` | All tools | Context window management | **LLM04** |
| `recursion-guard.js` | Bash, Read | Recursion/depth limits | **LLM04** |
| `resource-limits.js` | Bash, Task | Memory/process limits | **LLM04** |
| `confidence-tracker.js` | PostToolUse | Uncertainty detection | **LLM09** |
| `telemetry.js` | All hooks | SIEM telemetry export | - |

---

## Validator Details

### bash-safety.js

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

### secret.js

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

### env-protection.js

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

### production.js

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

### outside-repo.js

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

### pii.js

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

### prompt-injection.js

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

### jailbreak.js

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

### rate-limiter.js (NEW - Phase 1)

**Purpose:** Prevents denial-of-service attacks by limiting the rate of tool invocations.

**OWASP Reference:** LLM04 - Model Denial of Service

#### Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Global | 150 | 60s |
| Bash | 60 | 60s |
| Write/Edit | 100 | 60s |
| Read | 400 | 60s |
| Task | 40 | 60s |
| Glob/Grep | 200 | 60s |
| WebFetch/Search | 30/20 | 60s |

#### Features

- **Sliding window algorithm** - Accurate request counting
- **Exponential backoff** - 1s base, 2x multiplier, 60s max
- **Whitelist bypass** - Critical operations exempt
- **State persistence** - Survives validator restarts

#### Whitelist Patterns

```javascript
'read': ['.claude/settings.json', '.claude/validators-node/', 'CLAUDE.md']
'bash': ['git status', 'git log', 'git diff']
```

#### CLI Commands

```bash
# Check status
node .claude/validators-node/bin/rate-limiter.js status

# Reset limits
node .claude/validators-node/bin/rate-limiter.js reset

# Reset specific operation
node .claude/validators-node/bin/rate-limiter.js reset bash
```

#### No Override Available

Rate limiting cannot be bypassed - this is a security feature.

---

### plugin-permissions.js (NEW - Phase 1)

**Purpose:** Implements capability-based security for BMAD plugins/modules.

**OWASP Reference:** LLM07 - Insecure Plugin Design

#### Capabilities

| Capability | Operations | Description |
|------------|------------|-------------|
| `filesystem` | read, write, delete, list | File system access |
| `network` | fetch, search, api_call | Network operations |
| `shell` | execute, spawn | Command execution |
| `sensitive_data` | read, process | PII/sensitive data |

#### Plugin Manifest

Each plugin declares permissions in `_bmad/{plugin}/manifest.yaml`:

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

#### Default Permissions

Plugins without manifests get restrictive defaults:

- Filesystem: Own directory + docs
- Network: Denied
- Shell: All blocked except safe commands
- Sensitive data: Denied

#### RBAC Integration

Permission checking integrates with roles:

| Role | Shell | Network | Sensitive |
|------|-------|---------|-----------|
| admin | All | Yes | Yes |
| developer | dev tools | Yes | No |
| analyst | recon tools | Yes | No |
| viewer | None | No | No |

**Important:** Plugin manifests take precedence over RBAC grants.

#### CLI Commands

```bash
# List plugins
node .claude/validators-node/bin/plugin-permissions.js list

# Check permission
node .claude/validators-node/bin/plugin-permissions.js check intel-team shell execute "curl https://example.com"

# Generate manifests
node .claude/validators-node/bin/plugin-permissions.js generate _bmad/
```

#### No Override Available

Plugin permissions cannot be bypassed - this is enforced at the manifest level.

---

### supply-chain.js (NEW - Phase 2)

**Purpose:** Verifies integrity and authenticity of skills and plugins before loading.

**OWASP Reference:** LLM05 - Supply Chain Vulnerabilities

#### Features

- **SHA256 Checksums:** Verifies file integrity against manifest
- **GPG Signatures:** Validates manifest authenticity
- **Verification Modes:** strict (block), warn (log), disabled

#### Verification Flow

```
Skill Request → Load Manifest → Verify GPG Signature
                                      ↓
                              VALID → Verify SHA256 Checksums
                                            ↓
                                    MATCH → Execute Skill
                                    MISMATCH → BLOCK + LOG
                              INVALID → BLOCK + LOG
```

#### CLI Commands

```bash
# Verify a plugin
node .claude/validators-node/bin/supply-chain.js verify _bmad/intel-team

# Generate checksums
node .claude/validators-node/bin/supply-chain.js generate _bmad/intel-team
```

---

### context-manager.js (NEW - Phase 2)

**Purpose:** Tracks and manages context window usage to prevent overflow.

**OWASP Reference:** LLM04 - Model Denial of Service

#### Features

- **Token Estimation:** Estimates tokens for text, files, and operations
- **Thresholds:** Warning at 75%, blocking at 95%
- **Session Tracking:** Automatic reset on new session

#### Configuration

```javascript
const CHARS_PER_TOKEN = 4;
const MAX_CONTEXT_TOKENS = 200000;
const WARNING_THRESHOLD = 0.75;
const BLOCK_THRESHOLD = 0.95;
```

#### CLI Commands

```bash
# Check context usage
node .claude/validators-node/bin/context-manager.js status

# Reset context tracking
node .claude/validators-node/bin/context-manager.js reset
```

---

### recursion-guard.js (NEW - Phase 2)

**Purpose:** Prevents infinite loops and excessive recursion.

**OWASP Reference:** LLM04 - Model Denial of Service

#### Features

- **Directory Depth:** Limits traversal depth (default: 10)
- **Call Stack:** Limits nested operations (default: 20)
- **Circular References:** Detects and blocks circular paths
- **Symlink Tracking:** Follows symlinks with depth limit

#### Configuration

| Limit | Default | Description |
|-------|---------|-------------|
| `MAX_DIRECTORY_DEPTH` | 10 | Maximum directory traversal |
| `MAX_NESTED_CALLS` | 20 | Maximum nested operations |
| `MAX_SYMLINK_DEPTH` | 5 | Maximum symlink follows |

---

### resource-limits.js (NEW - Phase 3)

**Purpose:** Enforces memory and process limits to prevent resource exhaustion.

**OWASP Reference:** LLM04 - Model Denial of Service

#### Features

- **Memory Limits:** Per-session maximum (default: 4GB, configurable via BMAD_MAX_MEMORY_MB)
- **Child Processes:** Limits concurrent spawned processes
- **File Size:** Limits output file sizes
- **Process Timeout:** Enforces operation timeouts

#### Configuration (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `BMAD_MAX_MEMORY_MB` | 4096 | Memory limit in MB (4GB) |
| `BMAD_MAX_CHILD_PROCS` | 10 | Maximum child processes |
| `BMAD_MAX_FILE_SIZE_MB` | 100 | Maximum output file size |
| `BMAD_PROCESS_TIMEOUT` | 300 | Process timeout in seconds |

---

### confidence-tracker.js (NEW - Phase 3)

**Purpose:** Tracks output confidence and detects uncertainty in responses.

**OWASP Reference:** LLM09 - Overreliance

#### Features

- **Uncertainty Detection:** Detects hedging language (might, maybe, perhaps)
- **Confidence Scoring:** Assigns HIGH/MEDIUM/LOW/VERY_LOW levels
- **Source Attribution:** Tracks sources for claims
- **Code Warnings:** Detects TODO, FIXME, HACK patterns

#### Confidence Levels

| Level | Score | Indicators |
|-------|-------|------------|
| HIGH | 0.9+ | No uncertainty markers |
| MEDIUM | 0.7-0.9 | Some hedging language |
| LOW | 0.5-0.7 | Multiple uncertainty markers |
| VERY_LOW | <0.5 | Significant uncertainty |

#### Display Configuration

```bash
# Enable confidence display
export BMAD_SHOW_CONFIDENCE=true
```

---

### telemetry.js (NEW - Phase 4)

**Purpose:** Collects structured telemetry for SIEM/dashboard integration.

#### Features

- **JSONL Output:** Structured telemetry files
- **Event Types:** Security events, rate limits, permissions, resources
- **File Rotation:** Automatic rotation at 50MB
- **External Integration:** Designed for Splunk, ELK, Grafana

#### Telemetry Location

```
docs/TestingLogs/security/AuditLogs/telemetry/
├── security_events.jsonl
├── rate_limit_metrics.jsonl
├── permission_audit.jsonl
├── resource_usage.jsonl
├── supply_chain_verification.jsonl
├── confidence_analysis.jsonl
└── TELEMETRY-SCHEMA.md
```

---

### token-validator.js (Session Initialization)

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

### security-common.js

Shared utilities for all validators.

#### AuditLogger

Provides secure audit logging for all security events.

```javascript
// Log a blocked operation
AuditLogger.logBlocked(validator, reason, command, additional);

// Log an allowed operation
AuditLogger.logAllowed(validator, reason, additional);

// Log override usage
AuditLogger.logOverrideUsed(validator, overrideVar, target);
```

#### OverrideManager

Manages single-use override tokens with timeout.

```javascript
// Check and consume override
const { valid, reason } = OverrideManager.checkAndConsumeOverride('DANGEROUS');

// Get override status
const status = OverrideManager.getOverrideStatus();
```

#### Path Utilities

```javascript
// Resolve path to absolute
const resolved = resolvePath(path, cwd);

// Check if path is in repository
const inRepo = isPathInRepo(path, cwd, projectDir);
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
        "command": ".claude/validators-node/bin/bash-safety.js"
      },
      {
        "tool": "Write",
        "command": ".claude/validators-node/bin/secret.js"
      },
      {
        "tool": "Edit",
        "command": ".claude/validators-node/bin/env-protection.js"
      },
      {
        "tool": "Read",
        "command": ".claude/validators-node/bin/outside-repo.js"
      }
    ],
    "UserPromptSubmit": [
      {
        "command": ".claude/validators-node/bin/prompt-injection.js"
      },
      {
        "command": ".claude/validators-node/bin/jailbreak.js"
      }
    ],
    "SessionStart": [
      {
        "command": ".claude/validators-node/bin/token-validator.js"
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

1. Check validator exists: `ls .claude/validators-node/bin/`
2. Check executable: `node .claude/validators-node/bin/bash-safety.js`
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
