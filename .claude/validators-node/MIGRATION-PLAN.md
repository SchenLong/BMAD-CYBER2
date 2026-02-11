# Python to Node.js/TypeScript Validator Migration Plan

## Overview

Migration of 20 Python security validators to TypeScript for Claude Code hooks. This eliminates the Python dependency while maintaining identical security behavior.

## Current State

### Python Validators (20 files)

Located in `.claude/validators/`:

| File | Purpose | Priority | Complexity |
|------|---------|----------|------------|
| `security_common.py` | Shared utilities (audit, overrides, paths) | **P0** | Medium |
| `bash_safety.py` | Dangerous bash command blocking | **P1** | Low |
| `env_protection.py` | Sensitive file protection | **P1** | Low |
| `outside_repo_guard.py` | Repository boundary enforcement | **P1** | Low |
| `production_guard.py` | Production environment targeting | **P1** | Low |
| `secret_guard.py` | Hardcoded secrets detection | **P1** | Medium |
| `pii_guard.py` | PII detection (US/EU patterns + validators) | **P1** | High |
| `prompt_injection_guard.py` | AI injection/jailbreak detection | **P2** | Medium |
| `jailbreak_guard.py` | Multi-layer jailbreak defense | **P2** | High |
| `rate_limiter.py` | Sliding window rate limiting | **P2** | Medium |
| `resource_limits.py` | Memory/CPU/process limits | **P2** | Medium |
| `recursion_guard.py` | Recursion depth tracking | **P2** | Low |
| `context_manager.py` | Context window tracking | **P3** | Low |
| `confidence_tracker.py` | Response confidence analysis | **P3** | Low |
| `anomaly_detector.py` | Unusual activity detection | **P3** | Medium |
| `audit_integrity.py` | Cryptographic audit log verification | **P3** | Medium |
| `telemetry_collector.py` | Security telemetry | **P3** | Low |
| `plugin_permissions.py` | Capability-based permissions | **P3** | Medium |
| `supply_chain_verifier.py` | Skill/plugin verification | **P3** | Medium |
| `token_validator.py` | Session token validation | **P3** | Low |

### Key Python Dependencies Used

- **Standard Library Only**: json, os, sys, re, time, fcntl, tempfile, hashlib, subprocess, math
- **No External Packages**: All validators use Python standard library only

### Hook Integration Points

- `SessionStart`: token_validator, session-security-init
- `UserPromptSubmit`: prompt_injection_guard, jailbreak_guard
- `PreToolUse` (by tool): Various validators per tool type

---

## Target Architecture (TypeScript)

### Directory Structure

```
.claude/validators-node/
├── src/
│   ├── common/
│   │   ├── audit-logger.ts       # AuditLogger class
│   │   ├── override-manager.ts   # Single-use override tokens
│   │   ├── path-utils.ts         # Path resolution utilities
│   │   ├── stdin-parser.ts       # Tool input parsing
│   │   └── index.ts              # Re-exports
│   │
│   ├── guards/
│   │   ├── bash-safety.ts        # Dangerous bash commands
│   │   ├── env-protection.ts     # Sensitive file protection
│   │   ├── outside-repo.ts       # Repository boundary
│   │   ├── production.ts         # Production targeting
│   │   ├── secret.ts             # Hardcoded secrets
│   │   ├── pii/
│   │   │   ├── patterns.ts       # PII regex patterns
│   │   │   ├── validators.ts     # Luhn, IBAN, etc.
│   │   │   └── index.ts          # PII guard main
│   │   └── index.ts
│   │
│   ├── ai-safety/
│   │   ├── prompt-injection.ts   # Injection detection
│   │   ├── jailbreak.ts          # Jailbreak defense
│   │   └── index.ts
│   │
│   ├── resource-management/
│   │   ├── rate-limiter.ts       # Sliding window rate limiting
│   │   ├── resource-limits.ts    # Memory/CPU limits
│   │   ├── recursion-guard.ts    # Recursion depth
│   │   ├── context-manager.ts    # Context window
│   │   └── index.ts
│   │
│   ├── observability/
│   │   ├── confidence-tracker.ts
│   │   ├── anomaly-detector.ts
│   │   ├── audit-integrity.ts
│   │   ├── telemetry.ts
│   │   └── index.ts
│   │
│   ├── permissions/
│   │   ├── plugin-permissions.ts
│   │   ├── supply-chain.ts
│   │   ├── token-validator.ts
│   │   └── index.ts
│   │
│   └── types/
│       ├── tool-input.ts         # Claude Code tool input types
│       ├── validation-result.ts  # Validator return types
│       └── index.ts
│
├── bin/                          # CLI entry points (compiled)
│   ├── bash-safety.js
│   ├── env-protection.js
│   ├── ... (one per validator)
│
├── tests/
│   ├── guards/
│   ├── ai-safety/
│   ├── resource-management/
│   └── ...
│
├── package.json
├── tsconfig.json
└── README.md
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0"
  }
}
```

**No runtime dependencies** - matches Python's stdlib-only approach.

---

## Migration Phases

### Phase 1: Foundation (P0)

**Duration**: 1 session
**Files**: 4
**Risk**: Low

1. **Project Setup**
   - Initialize TypeScript project
   - Configure tsconfig.json
   - Set up build scripts

2. **Port `security_common.py` → `src/common/`**
   - `audit-logger.ts`: AuditLogger class with file locking
   - `override-manager.ts`: Single-use override tokens with TOCTOU protection
   - `path-utils.ts`: resolve_path, is_path_in_repo
   - `stdin-parser.ts`: get_tool_input_from_stdin

3. **Port `bash_safety.py` → `src/guards/bash-safety.ts`**
   - Command substitution detection
   - Dangerous rm pattern matching
   - Directory escape detection

4. **Validation**
   - Unit tests for all Phase 1 components
   - Integration test with actual hook invocation

### Phase 2: Core Guards (P1)

**Duration**: 1-2 sessions
**Files**: 5
**Risk**: Low-Medium

1. **`env_protection.py` → `src/guards/env-protection.ts`**
   - 80+ protected file patterns
   - fnmatch equivalent using minimatch or glob patterns

2. **`outside_repo_guard.py` → `src/guards/outside-repo.ts`**
   - Path extraction from bash commands
   - Repository boundary checking

3. **`production_guard.py` → `src/guards/production.ts`**
   - Production keyword detection
   - Safe pattern exemptions

4. **`secret_guard.py` → `src/guards/secret.ts`**
   - API key patterns (AWS, GitHub, Slack, etc.)
   - Entropy validation for generic secrets

5. **`pii_guard.py` → `src/guards/pii/`**
   - US patterns (SSN, phone, DL, passport, routing, Medicare, ITIN)
   - EU patterns (IBAN, BIC, NINO, NHS, tax IDs for DE/FR/ES/IT/NL/BE/PL/PT/AT/SE/FI)
   - Common patterns (credit card, email, IP, DOB, MAC, GPS)
   - Validators: Luhn, IBAN MOD 97-10, ABA routing, NHS MOD 11, etc.
   - Context detection, test data exclusion

### Phase 3: AI Safety (P2)

**Duration**: 1 session
**Files**: 2
**Risk**: Medium

1. **`prompt_injection_guard.py` → `src/ai-safety/prompt-injection.ts`**
   - 20+ injection pattern categories
   - Unicode obfuscation detection
   - Base64 payload detection

2. **`jailbreak_guard.py` → `src/ai-safety/jailbreak.ts`**
   - 40+ jailbreak pattern categories
   - Text normalization (unicode evasion)
   - Fuzzy matching using levenshtein or similar
   - Session risk tracking

### Phase 4: Resource Management (P2)

**Duration**: 1 session
**Files**: 4
**Risk**: Medium

1. **`rate_limiter.py` → `src/resource-management/rate-limiter.ts`**
   - Sliding window algorithm
   - Per-operation limits (Bash: 60, Write: 100, Edit: 100, etc.)
   - Exponential backoff
   - Whitelist bypass

2. **`resource_limits.py` → `src/resource-management/resource-limits.ts`**
   - Memory limits (4GB)
   - CPU limits (80%)
   - Child process limits (10)
   - Process timeout (5 minutes)
   - Note: Some features (signal handling) may need adaptation for Node.js

3. **`recursion_guard.py` → `src/resource-management/recursion-guard.ts`**
   - Call stack depth tracking
   - Directory traversal depth
   - Circular reference detection

4. **`context_manager.py` → `src/resource-management/context-manager.ts`**
   - Token count tracking
   - Warning/block thresholds

### Phase 5: Observability (P3)

**Duration**: 1 session
**Files**: 4
**Risk**: Low

1. **`confidence_tracker.py` → `src/observability/confidence-tracker.ts`**
   - Uncertainty markers
   - Confidence scoring

2. **`anomaly_detector.py` → `src/observability/anomaly-detector.ts`**
   - Rolling 24-hour baseline
   - Statistical deviation detection

3. **`audit_integrity.py` → `src/observability/audit-integrity.ts`**
   - SHA256 hash chains
   - Tamper detection

4. **`telemetry_collector.py` → `src/observability/telemetry.ts`**
   - JSONL telemetry output
   - File rotation

### Phase 6: Permissions (P3)

**Duration**: 1 session
**Files**: 3
**Risk**: Low

1. **`plugin_permissions.py` → `src/permissions/plugin-permissions.ts`**
   - Capability model (filesystem, network, shell, sensitive_data)
   - Permission manifest validation

2. **`supply_chain_verifier.py` → `src/permissions/supply-chain.ts`**
   - SHA256 checksum verification
   - Note: GPG signature verification may need node-gpg or spawn

3. **`token_validator.py` → `src/permissions/token-validator.ts`**
   - Session token validation
   - RBAC role checking

### Phase 7: Integration & Cutover

**Duration**: 1 session
**Risk**: Medium

1. **Update `settings.json`**
   - Change `python3` → `node` for each validator
   - Point to compiled JS in `validators-node/bin/`

2. **Create migration toggle**
   - Environment variable `BMAD_USE_NODE_VALIDATORS=true`
   - Allows gradual rollout

3. **Deprecation notices**
   - Add warnings to Python validators when Node.js version exists
   - Document migration path

---

## Technical Considerations

### File Locking in Node.js

Python uses `fcntl.flock()`. Node.js equivalents:

- **Option 1**: `proper-lockfile` package (external dependency)
- **Option 2**: `fs.flock` via native addon
- **Option 3**: Atomic writes with rename (already used in Python)
- **Recommended**: Use atomic writes + advisory locking via temp files

```typescript
// Atomic file write (no external deps)
import { writeFileSync, renameSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function atomicWriteSync(filePath: string, data: string): void {
  const dir = mkdtempSync(join(tmpdir(), 'atomic-'));
  const tempPath = join(dir, 'temp');
  writeFileSync(tempPath, data);
  renameSync(tempPath, filePath);
}
```

### Regex Compatibility

Most Python regex patterns are JavaScript-compatible. Notable differences:

- Named groups: Python `(?P<name>)` → JS `(?<name>)`
- Unicode properties: Python `\p{L}` works with `re.UNICODE`
- Lookbehind: Both support, but check Node.js version (v9+)

### Process Management

Python `subprocess` → Node.js `child_process`:

```typescript
import { execSync, spawnSync } from 'child_process';
```

### Exit Codes

Maintain exact Python exit codes:

- `0`: Allow operation
- `1`: Soft block (warning)
- `2`: Hard block (blocked)

---

## Validation Strategy

### Per-Validator Testing

Each ported validator must pass:

1. **Unit tests**: Core logic (pattern matching, validators)
2. **Integration tests**: Full stdin/stdout flow
3. **Parity tests**: Same input → same output as Python

### Parity Test Framework

```typescript
// tests/parity/bash-safety.test.ts
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

const testCases = [
  { input: { tool_input: { command: 'rm -rf /' } }, expectedExit: 2 },
  { input: { tool_input: { command: 'ls -la' } }, expectedExit: 0 },
  // ... more cases
];

describe('bash-safety parity', () => {
  for (const { input, expectedExit } of testCases) {
    it(`should match Python behavior for: ${input.tool_input.command}`, () => {
      const pythonResult = runPythonValidator('bash_safety.py', input);
      const nodeResult = runNodeValidator('bash-safety.js', input);

      expect(nodeResult.exitCode).toBe(pythonResult.exitCode);
      expect(nodeResult.exitCode).toBe(expectedExit);
    });
  }
});
```

---

## Rollback Plan

If issues arise during migration:

1. **Immediate**: Revert `settings.json` to Python validators
2. **Keep Python validators**: Don't delete until Node.js is proven stable
3. **Environment toggle**: `BMAD_USE_PYTHON_VALIDATORS=true` forces Python

---

## Success Criteria

- [ ] All 20 validators ported to TypeScript
- [ ] 100% test coverage for security-critical code
- [ ] Parity tests pass for all validators
- [ ] No external runtime dependencies
- [ ] Performance: ≤ Python execution time
- [ ] Documentation updated
- [ ] Settings.json migrated
- [ ] 1 week stable operation before removing Python validators

---

## Timeline Estimate

| Phase | Files | Sessions | Risk |
|-------|-------|----------|------|
| Phase 1: Foundation | 4 | 1 | Low |
| Phase 2: Core Guards | 5 | 1-2 | Low-Medium |
| Phase 3: AI Safety | 2 | 1 | Medium |
| Phase 4: Resource Mgmt | 4 | 1 | Medium |
| Phase 5: Observability | 4 | 1 | Low |
| Phase 6: Permissions | 3 | 1 | Low |
| Phase 7: Integration | - | 1 | Medium |
| **Total** | **20** | **7-8** | - |

---

---

## Affected Files Matrix (Per Validator)

This section documents ALL files that must be updated when each validator is migrated.

### Dependency Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 0: FOUNDATION (Must migrate first)                         │
│                                                                  │
│   security_common.py                                             │
│     └─ Imported by: 17 validators                               │
│     └─ Also imports: telemetry, audit_integrity, anomaly        │
│                                                                  │
│   telemetry_collector.py                                         │
│     └─ Imported by: 7 validators                                │
│                                                                  │
│   audit_integrity.py                                             │
│     └─ Imported by: security_common (graceful)                  │
│                                                                  │
│   anomaly_detector.py                                            │
│     └─ Imports: telemetry_collector                             │
│     └─ Imported by: security_common (graceful)                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: CORE GUARDS (Depend only on Tier 0)                     │
│                                                                  │
│   bash_safety.py          → security_common                     │
│   env_protection.py       → security_common                     │
│   outside_repo_guard.py   → security_common                     │
│   production_guard.py     → security_common                     │
│   secret_guard.py         → security_common                     │
│   pii_guard.py            → security_common                     │
│   prompt_injection_guard.py → security_common                   │
│   jailbreak_guard.py      → security_common                     │
│   confidence_tracker.py   → security_common                     │
│   recursion_guard.py      → security_common                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIER 2: ENHANCED GUARDS (Depend on Tier 0 + telemetry)          │
│                                                                  │
│   rate_limiter.py         → security_common + telemetry         │
│   resource_limits.py      → security_common + telemetry         │
│   context_manager.py      → security_common + telemetry         │
│   plugin_permissions.py   → security_common + telemetry         │
│   supply_chain_verifier.py → security_common + telemetry        │
│   token_validator.py      → security_common + telemetry         │
└─────────────────────────────────────────────────────────────────┘
```

---

### Detailed Affected Files Per Validator

#### 1. `security_common.py` → `security-common.ts`

**Internal Imports (graceful fallback):**

- `telemetry_collector.py` - `record_security_event`
- `audit_integrity.py` - `add_chain_fields`
- `anomaly_detector.py` - `record_security_event_for_anomaly`

**Dependents (17 validators that import this):**

- `bash_safety.py`
- `env_protection.py`
- `outside_repo_guard.py`
- `production_guard.py`
- `secret_guard.py`
- `pii_guard.py`
- `prompt_injection_guard.py`
- `jailbreak_guard.py`
- `confidence_tracker.py`
- `recursion_guard.py`
- `rate_limiter.py`
- `resource_limits.py`
- `context_manager.py`
- `plugin_permissions.py`
- `supply_chain_verifier.py`
- `token_validator.py`
- `.claude/hooks/session-security-init.py` (via validate_session_security)

**External Files to Update:**

- None directly (foundation module)

**State Files Managed:**

- `.claude/.override_state.json`
- `.claude/.override.lock`
- `.claude/logs/security.log`

---

#### 2. `telemetry_collector.py` → `telemetry.ts`

**Internal Imports:** None

**Dependents (7 validators):**

- `security_common.py` (graceful)
- `anomaly_detector.py`
- `context_manager.py`
- `plugin_permissions.py`
- `rate_limiter.py`
- `resource_limits.py`
- `supply_chain_verifier.py`
- `token_validator.py`

**External Files to Update:**

- None directly

**State Files Managed:**

- `docs/TestingLogs/security/AuditLogs/telemetry/*.jsonl`

---

#### 3. `audit_integrity.py` → `audit-integrity.ts`

**Internal Imports:** None

**Dependents:**

- `security_common.py` (graceful)

**External Files to Update:**

- None directly

**State Files Managed:**

- `.claude/logs/security.log` (hash chain)
- `.claude/.audit_chain_state.json`

---

#### 4. `anomaly_detector.py` → `anomaly-detector.ts`

**Internal Imports:**

- `telemetry_collector.py` - `record_anomaly_signal`, `record_security_event`

**Dependents:**

- `security_common.py` (graceful)

**External Files to Update:**

- None directly

**State Files Managed:**

- `.claude/.anomaly_baseline.json`

---

#### 5. `bash_safety.py` → `bash-safety.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`, `resolve_path`, `is_path_in_repo`, `print_block_message`

**Dependents:** None

**settings.json Hook References (6):**

- `PreToolUse` → `Bash` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 71: "python3 ... bash_safety.py" → "node ... bash-safety.js"

.claude/hooks/session-security-init.py:
  - Line 41: REQUIRED_VALIDATORS includes 'bash_safety.py'
  - Update to check for both .py and .js OR update to .js only
```

---

#### 6. `env_protection.py` → `env-protection.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`

**Dependents:** None

**settings.json Hook References (2):**

- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 104: "python3 ... env_protection.py" → "node ... env-protection.js"
  - Line 138: "python3 ... env_protection.py" → "node ... env-protection.js"

.claude/hooks/session-security-init.py:
  - Line 44: REQUIRED_VALIDATORS includes 'env_protection.py'
```

---

#### 7. `outside_repo_guard.py` → `outside-repo.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`, `resolve_path`, `is_path_in_repo`

**Dependents:** None

**settings.json Hook References (7):**

- `PreToolUse` → `Bash` hook
- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook
- `PreToolUse` → `Read` hook
- `PreToolUse` → `Glob` hook
- `PreToolUse` → `Grep` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 79: "python3 ... outside_repo_guard.py" (Bash)
  - Line 108: "python3 ... outside_repo_guard.py" (Write)
  - Line 142: "python3 ... outside_repo_guard.py" (Edit)
  - Line 166: "python3 ... outside_repo_guard.py" (Read)
  - Line 191: "python3 ... outside_repo_guard.py" (Glob)
  - Line 208: "python3 ... outside_repo_guard.py" (Grep)

.claude/hooks/session-security-init.py:
  - Line 46: REQUIRED_VALIDATORS includes 'outside_repo_guard.py'
```

---

#### 8. `production_guard.py` → `production.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`

**Dependents:** None

**settings.json Hook References (1):**

- `PreToolUse` → `Bash` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 75: "python3 ... production_guard.py" → "node ... production.js"

.claude/hooks/session-security-init.py:
  - Line 45: REQUIRED_VALIDATORS includes 'production_guard.py'
```

---

#### 9. `secret_guard.py` → `secret.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`

**Dependents:** None

**settings.json Hook References (2):**

- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 100: "python3 ... secret_guard.py" → "node ... secret.js"
  - Line 134: "python3 ... secret_guard.py" → "node ... secret.js"

.claude/hooks/session-security-init.py:
  - Line 43: REQUIRED_VALIDATORS includes 'secret_guard.py'
```

---

#### 10. `pii_guard.py` → `pii/index.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`, `get_tool_input_from_stdin`

**Dependents:** None

**settings.json Hook References (2):**

- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 112: "python3 ... pii_guard.py" → "node ... pii.js"
  - Line 146: "python3 ... pii_guard.py" → "node ... pii.js"

.claude/hooks/session-security-init.py:
  - Line 47: REQUIRED_VALIDATORS includes 'pii_guard.py'
```

---

#### 11. `prompt_injection_guard.py` → `prompt-injection.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`, `get_tool_input_from_stdin`

**Dependents:** None

**settings.json Hook References (4):**

- `UserPromptSubmit` hook
- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook
- `PreToolUse` → `Read` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 26: "python3 ... prompt_injection_guard.py" (UserPromptSubmit)
  - Line 116: "python3 ... prompt_injection_guard.py" (Write)
  - Line 150: "python3 ... prompt_injection_guard.py" (Edit)
  - Line 170: "python3 ... prompt_injection_guard.py" (Read)

.claude/hooks/session-security-init.py:
  - Line 48: REQUIRED_VALIDATORS includes 'prompt_injection_guard.py'
```

---

#### 12. `jailbreak_guard.py` → `jailbreak.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `OverrideManager`, `get_tool_input_from_stdin`

**Dependents:** None

**settings.json Hook References (1):**

- `UserPromptSubmit` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 30: "python3 ... jailbreak_guard.py" → "node ... jailbreak.js"

.claude/hooks/session-security-init.py:
  - Line 49: REQUIRED_VALIDATORS includes 'jailbreak_guard.py'
```

---

#### 13. `rate_limiter.py` → `rate-limiter.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`
- `telemetry_collector.py` - `record_rate_limit_metrics`, `record_security_event`

**Dependents:** None

**settings.json Hook References (11 - MOST REFERENCED):**

- `PreToolUse` → `Skill` hook
- `PreToolUse` → `Task` hook
- `PreToolUse` → `Bash` hook
- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook
- `PreToolUse` → `Read` hook
- `PreToolUse` → `Glob` hook
- `PreToolUse` → `Grep` hook
- `PreToolUse` → `WebFetch` hook
- `PreToolUse` → `WebSearch` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 49: "python3 ... rate_limiter.py" (Skill)
  - Line 58: "python3 ... rate_limiter.py" (Task)
  - Line 87: "python3 ... rate_limiter.py" (Bash)
  - Line 124: "python3 ... rate_limiter.py" (Write)
  - Line 158: "python3 ... rate_limiter.py" (Edit)
  - Line 178: "python3 ... rate_limiter.py" (Read)
  - Line 195: "python3 ... rate_limiter.py" (Glob)
  - Line 212: "python3 ... rate_limiter.py" (Grep)
  - Line 225: "python3 ... rate_limiter.py" (WebFetch)
  - Line 238: "python3 ... rate_limiter.py" (WebSearch)
```

**State Files Managed:**

- `.claude/.rate_limit_state.json`
- `.claude/.rate_limit.lock`

---

#### 14. `resource_limits.py` → `resource-limits.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`
- `telemetry_collector.py` - `record_resource_usage`

**Dependents:** None

**settings.json Hook References (1):**

- `PreToolUse` → `Bash` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 91: "python3 ... resource_limits.py" → "node ... resource-limits.js"
```

**State Files Managed:**

- `.claude/.resource_state.json`

---

#### 15. `recursion_guard.py` → `recursion-guard.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`

**Dependents:** None

**settings.json Hook References (3):**

- `PreToolUse` → `Task` hook
- `PreToolUse` → `Read` hook
- `PreToolUse` → `Glob` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 62: "python3 ... recursion_guard.py" (Task)
  - Line 182: "python3 ... recursion_guard.py" (Read)
  - Line 199: "python3 ... recursion_guard.py" (Glob)
```

**State Files Managed:**

- `.claude/.recursion_state.json`

---

#### 16. `context_manager.py` → `context-manager.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`
- `telemetry_collector.py` - `record_resource_usage`

**Dependents:** None

**settings.json Hook References:** 0 (not currently hooked)

**External Files to Update:**

- None (not in settings.json)

**State Files Managed:**

- `.claude/.context_state.json`

---

#### 17. `confidence_tracker.py` → `confidence-tracker.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`

**Dependents:** None

**settings.json Hook References:** 0 (not currently hooked)

**External Files to Update:**

- None (not in settings.json)

**State Files Managed:**

- `.claude/.confidence_state.json`

---

#### 18. `plugin_permissions.py` → `plugin-permissions.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`, `resolve_path`
- `telemetry_collector.py` - `record_permission_check`

**Dependents:** None

**settings.json Hook References (6):**

- `PreToolUse` → `Bash` hook
- `PreToolUse` → `Write` hook
- `PreToolUse` → `Edit` hook
- `PreToolUse` → `Read` hook
- `PreToolUse` → `WebFetch` hook
- `PreToolUse` → `WebSearch` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 83: "python3 ... plugin_permissions.py validate" (Bash)
  - Line 120: "python3 ... plugin_permissions.py validate" (Write)
  - Line 154: "python3 ... plugin_permissions.py validate" (Edit)
  - Line 174: "python3 ... plugin_permissions.py validate" (Read)
  - Line 221: "python3 ... plugin_permissions.py validate" (WebFetch)
  - Line 234: "python3 ... plugin_permissions.py validate" (WebSearch)
```

---

#### 19. `supply_chain_verifier.py` → `supply-chain.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`
- `telemetry_collector.py` - `record_supply_chain_verification`, `record_security_event`

**Dependents:** None

**settings.json Hook References (1):**

- `PreToolUse` → `Skill` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 45: "python3 ... supply_chain_verifier.py validate" → "node ... supply-chain.js validate"
```

---

#### 20. `token_validator.py` → `token-validator.ts`

**Internal Imports:**

- `security_common.py` - `AuditLogger`
- `telemetry_collector.py` - `record_security_event`

**Dependents:**

- `.claude/hooks/session-security-init.py` (imports `validate_token`, `mark_session_validated`, `save_session_claims`)

**settings.json Hook References (1):**

- `SessionStart` hook

**External Files to Update:**

```
.claude/settings.json:
  - Line 8: "python3 ... token_validator.py" → "node ... token-validator.js"

.claude/hooks/session-security-init.py:
  - Line 39: REQUIRED_VALIDATORS includes 'token_validator.py'
  - Line 139: from token_validator import validate_token, mark_session_validated, save_session_claims
    → Must rewrite this import or convert session-security-init.py to .js
```

**State Files Managed:**

- `.claude/.session_validated`
- `.claude/.session_claims.json`

---

#### Session Init Hook: `session-security-init.py`

**This Python hook must also be migrated or updated:**

**Current Imports:**

- `token_validator.py` (directly imports functions)

**Current Validator Checks:**

```python
REQUIRED_VALIDATORS = [
    'security_common.py',
    'token_validator.py',
    'bash_safety.py',
    'secret_guard.py',
    'env_protection.py',
    'production_guard.py',
    'outside_repo_guard.py',
    'pii_guard.py',
    'prompt_injection_guard.py',
    'jailbreak_guard.py',
]
```

**Options:**

1. **Convert to TypeScript**: `session-security-init.ts`
2. **Update to check for `.js` files**: Dual-check for both `.py` and `.js`
3. **Keep Python during transition**: Only update after all validators migrated

**External Files to Update:**

```
.claude/settings.json:
  - Line 12: "python3 ... session-security-init.py" → "node ... session-security-init.js"
```

---

## Summary: Files to Update Per Phase

### Phase 1 (Foundation)

| Validator | settings.json Lines | Other Files |
|-----------|--------------------:|-------------|
| security_common | 0 | State files only |
| telemetry_collector | 0 | State files only |
| audit_integrity | 0 | State files only |
| anomaly_detector | 0 | State files only |
| **Total** | **0** | **4 state file locations** |

### Phase 2 (Core Guards)

| Validator | settings.json Lines | session-security-init |
|-----------|--------------------:|----------------------:|
| bash_safety | 1 | Yes |
| env_protection | 2 | Yes |
| outside_repo_guard | 6 | Yes |
| production_guard | 1 | Yes |
| secret_guard | 2 | Yes |
| pii_guard | 2 | Yes |
| **Total** | **14** | **6 validators** |

### Phase 3 (AI Safety)

| Validator | settings.json Lines | session-security-init |
|-----------|--------------------:|----------------------:|
| prompt_injection_guard | 4 | Yes |
| jailbreak_guard | 1 | Yes |
| **Total** | **5** | **2 validators** |

### Phase 4 (Resource Management)

| Validator | settings.json Lines | Other Files |
|-----------|--------------------:|-------------|
| rate_limiter | 11 | State files |
| resource_limits | 1 | State files |
| recursion_guard | 3 | State files |
| context_manager | 0 | State files |
| **Total** | **15** | **4 state files** |

### Phase 5 (Observability)

| Validator | settings.json Lines | Other Files |
|-----------|--------------------:|-------------|
| confidence_tracker | 0 | State files |
| (anomaly_detector - Phase 1) | 0 | - |
| (audit_integrity - Phase 1) | 0 | - |
| (telemetry - Phase 1) | 0 | - |
| **Total** | **0** | **1 state file** |

### Phase 6 (Permissions)

| Validator | settings.json Lines | Other Files |
|-----------|--------------------:|-------------|
| plugin_permissions | 6 | None |
| supply_chain_verifier | 1 | None |
| token_validator | 1 | session-security-init.py |
| **Total** | **8** | **1 hook file** |

### Phase 7 (Integration)

| File | Changes |
|------|---------|
| session-security-init.py | Convert to .ts OR update validator list |
| settings.json | Update SessionStart hook |
| **Total** | **2 files** |

---

## Grand Total

| Category | Count |
|----------|------:|
| Python validators to port | 20 |
| settings.json hook updates | 53 |
| session-security-init updates | 10+ |
| State file locations | 12 |
| Total files affected | ~25 |

---

## Next Steps

1. **Approve this plan** (you are here)
2. **Start Phase 1**: Initialize TypeScript project, port security_common
3. **Iterate**: Port validators in priority order with tests
4. **Integration**: Update hooks, test end-to-end
5. **Cutover**: Switch to Node.js validators in production
