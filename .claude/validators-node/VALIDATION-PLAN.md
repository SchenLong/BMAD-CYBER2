# Extended Validation Plan: Python to Node.js Validator Migration

**Date:** 2026-01-17
**Version:** 1.1
**Status:** ✅ VALIDATION COMPLETE

---

## Validation Results Summary

| Category | Status | Tests | Pass Rate |
|----------|--------|-------|-----------|
| **Unit Tests** | ✅ PASS | 558 | 100% |
| **Integration Tests** | ✅ PASS | 24 | 100% |
| **Security Tests** | ✅ PASS | 185+ | 100% |
| **Parity Tests** | ✅ PASS | Full | 100% |
| **Workflow Compliance** | ✅ 100% | 55 | 55/55 |

**Consolidated Report:** `_bmad-output/workflow-qa/CONSOLIDATED-VALIDATION-REPORT.md`

### Key Findings

- ✅ All 558 unit tests passing
- ✅ OWASP LLM Top 10: 7/10 applicable risks mitigated
- ✅ No critical security vulnerabilities found
- ✅ All 55 workflows fully compliant (cybersec-team fixed)

### Validation Artifacts

- `workstream-a-report.md` - Workflow compliance validation
- `workstream-b-security-report.md` - Security testing
- `workstream-c-qa-report.md` - Manual QA + integration
- Epic validation reports (2, 4, 5, 6)

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Foundation Validation](#phase-1-foundation-validation)
3. [Phase 2: Core Guards Validation](#phase-2-core-guards-validation)
4. [Phase 3: AI Safety Validation](#phase-3-ai-safety-validation)
5. [Phase 4: Resource Management Validation](#phase-4-resource-management-validation)
6. [Phase 5: Observability Validation](#phase-5-observability-validation)
7. [Phase 6: Permissions Validation](#phase-6-permissions-validation)
8. [Phase 7: Integration Validation](#phase-7-integration-validation)
9. [Security Testing](#security-testing)
10. [QA Testing](#qa-testing)
11. [Documentation Review](#documentation-review)
12. [Parity Testing](#parity-testing)
13. [Performance Benchmarking](#performance-benchmarking)
14. [Rollback Verification](#rollback-verification)

---

## Overview

### Validation Objectives

1. **Functional Parity**: Node.js validators must produce identical results to Python validators
2. **Security Integrity**: No security regressions; all attack vectors remain blocked
3. **Performance**: Node.js validators must meet or exceed Python performance
4. **Documentation Accuracy**: All documentation reflects the new implementation
5. **Rollback Capability**: Ability to revert to Python validators if issues arise

### Test Categories

| Category | Description | Priority |
|----------|-------------|----------|
| Unit Tests | Individual function/class testing | P0 |
| Integration Tests | Hook invocation testing | P0 |
| Parity Tests | Python vs Node.js output comparison | P0 |
| Security Tests | Attack vector validation | P0 |
| Performance Tests | Latency and throughput benchmarks | P1 |
| Regression Tests | Existing functionality preservation | P0 |
| Edge Case Tests | Boundary conditions and error handling | P1 |
| Documentation Tests | Accuracy verification | P2 |

---

## Phase 1: Foundation Validation

### 1.1 Common Utilities Testing

#### 1.1.1 AuditLogger (`src/common/audit-logger.ts`)

**Functional Tests:**

- [ ] `logSync()` writes to correct log file
- [ ] `logAsync()` returns promise and writes correctly
- [ ] Log entries contain required fields: timestamp, validator, action, severity
- [ ] Log rotation triggers at MAX_LOG_SIZE
- [ ] File locking prevents concurrent write corruption
- [ ] JSON formatting is valid and parseable
- [ ] Sensitive data redaction works (passwords, tokens)

**Security Tests:**

- [ ] Log injection attacks are prevented (newline injection)
- [ ] Path traversal in log paths is blocked
- [ ] Log files have correct permissions (600 or 640)
- [ ] No sensitive data leaks in log messages

**Edge Cases:**

- [ ] Disk full scenario handling
- [ ] Invalid JSON input handling
- [ ] Extremely long log messages (>1MB)
- [ ] Concurrent logging from multiple processes
- [ ] Log directory doesn't exist (should create)

#### 1.1.2 OverrideManager (`src/common/override-manager.ts`)

**Functional Tests:**

- [ ] `createOverride()` generates unique tokens
- [ ] `validateOverride()` returns true for valid tokens
- [ ] `validateOverride()` returns false for expired tokens
- [ ] `validateOverride()` invalidates token after single use
- [ ] Override expiry time is configurable
- [ ] State persists across process restarts

**Security Tests:**

- [ ] TOCTOU (Time-of-check to time-of-use) protection works
- [ ] Token entropy is sufficient (>128 bits)
- [ ] Tokens cannot be guessed or brute-forced
- [ ] Override state file has correct permissions
- [ ] Race condition in token validation is prevented

**Edge Cases:**

- [ ] Expired state cleanup works
- [ ] Corrupted state file handling
- [ ] Missing state file (fresh start)
- [ ] Clock skew tolerance

#### 1.1.3 PathUtils (`src/common/path-utils.ts`)

**Functional Tests:**

- [ ] `resolvePath()` correctly resolves relative paths
- [ ] `resolvePath()` handles absolute paths
- [ ] `isPathInRepo()` returns true for paths inside PROJECT_DIR
- [ ] `isPathInRepo()` returns false for paths outside PROJECT_DIR
- [ ] `getProjectDir()` returns correct directory
- [ ] Symlink resolution works correctly

**Security Tests:**

- [ ] Path traversal attacks are detected (`../../../etc/passwd`)
- [ ] Null byte injection is blocked
- [ ] Unicode normalization attacks are handled
- [ ] Symlink escape attacks are detected

**Edge Cases:**

- [ ] Windows-style paths (backslashes)
- [ ] Paths with spaces and special characters
- [ ] Very long paths (>4096 chars)
- [ ] Non-existent paths
- [ ] Circular symlinks

#### 1.1.4 StdinParser (`src/common/stdin-parser.ts`)

**Functional Tests:**

- [ ] `getToolInputFromStdin()` parses valid JSON
- [ ] Returns correct tool_name and tool_input
- [ ] Handles empty stdin gracefully
- [ ] Handles missing fields with defaults

**Security Tests:**

- [ ] JSON parsing is safe (no prototype pollution)
- [ ] Large payloads are handled (DoS prevention)
- [ ] Malformed JSON doesn't crash

**Edge Cases:**

- [ ] Binary data in stdin
- [ ] Partial JSON (incomplete)
- [ ] Multiple JSON objects
- [ ] Unicode in JSON values

---

## Phase 2: Core Guards Validation

### 2.1 Bash Safety (`src/guards/bash-safety.ts`)

**Functional Tests:**

- [ ] `detectCommandSubstitution()` detects `$(...)` patterns
- [ ] `detectCommandSubstitution()` detects backtick patterns
- [ ] `detectCommandSubstitution()` detects `${...}` expansion
- [ ] `extractRmTargets()` extracts file targets from rm commands
- [ ] `checkDangerousRm()` blocks `rm -rf /`
- [ ] `checkDangerousRm()` blocks `rm -rf ~`
- [ ] `checkDangerousRm()` blocks `rm -rf *`
- [ ] `checkDangerousRm()` allows safe rm inside project
- [ ] `checkDirectoryEscape()` detects cd to absolute paths outside repo
- [ ] `checkDirectoryEscape()` detects excessive `../` traversal
- [ ] `checkDangerousPatterns()` detects fork bombs
- [ ] `checkDangerousPatterns()` detects curl|bash patterns
- [ ] `checkDangerousPatterns()` detects eval with variables
- [ ] `checkDangerousPatterns()` detects dd to devices
- [ ] `checkDangerousPatterns()` detects mkfs commands
- [ ] Safe commands (ls, git, npm) are allowed

**Security Tests:**

- [ ] Command injection via arguments is blocked
- [ ] Encoded commands (base64, hex) are detected
- [ ] Unicode obfuscation is handled
- [ ] Whitespace obfuscation is handled
- [ ] Comment injection is blocked
- [ ] Semicolon chaining dangerous commands is blocked
- [ ] Pipe chaining dangerous commands is blocked
- [ ] Background execution (&) of dangerous commands is blocked

**Parity Tests:**

- [ ] Compare output with Python `bash_safety.py` for 100 test cases

### 2.2 Environment Protection (`src/guards/env-protection.ts`)

**Functional Tests:**

- [ ] Blocks write to `.env` files
- [ ] Blocks write to `.env.local`, `.env.production`, etc.
- [ ] Blocks write to `credentials.json`
- [ ] Blocks write to `~/.ssh/*`
- [ ] Blocks write to `~/.aws/*`
- [ ] Blocks write to `*.pem`, `*.key` files
- [ ] Blocks write to `/etc/passwd`, `/etc/shadow`
- [ ] Allows write to normal project files
- [ ] Pattern matching works for all 80+ protected patterns

**Security Tests:**

- [ ] Case sensitivity handling (`.ENV` vs `.env`)
- [ ] Path normalization attacks
- [ ] Symlink to protected file detection
- [ ] Hidden file detection

**Parity Tests:**

- [ ] Compare protected file list with Python version
- [ ] Test all 80+ patterns match identically

### 2.3 Outside Repo Guard (`src/guards/outside-repo.ts`)

**Functional Tests:**

- [ ] Blocks read/write outside PROJECT_DIR
- [ ] Allows operations inside PROJECT_DIR
- [ ] Handles relative paths correctly
- [ ] Handles absolute paths correctly
- [ ] Extracts paths from bash commands
- [ ] Handles multiple paths in single command

**Security Tests:**

- [ ] Path traversal via `../`
- [ ] Symlink escape detection
- [ ] Null byte injection
- [ ] Unicode normalization attacks

**Parity Tests:**

- [ ] Match Python `outside_repo_guard.py` behavior exactly

### 2.4 Production Guard (`src/guards/production.ts`)

**Functional Tests:**

- [ ] Detects `production` keyword in commands
- [ ] Detects `prod` abbreviation
- [ ] Detects production URLs/hostnames
- [ ] Allows safe patterns (e.g., `npm run production` in docs)
- [ ] Environment variable detection (NODE_ENV=production)

**Security Tests:**

- [ ] Case insensitivity testing
- [ ] Obfuscation attempts (pr0duction, prоduction with Cyrillic)

**Parity Tests:**

- [ ] Compare with Python `production_guard.py`

### 2.5 Secret Guard (`src/guards/secret.ts`)

**Functional Tests:**

- [ ] Detects AWS Access Key IDs (AKIA...)
- [ ] Detects AWS Secret Access Keys
- [ ] Detects GitHub tokens (ghp_...)
- [ ] Detects GitHub OAuth tokens (gho_...)
- [ ] Detects Slack tokens (xox...)
- [ ] Detects Stripe keys (sk_live_...)
- [ ] Detects generic API keys via entropy
- [ ] Detects private keys (BEGIN RSA PRIVATE KEY)
- [ ] Detects JWT tokens
- [ ] Allows example/placeholder values
- [ ] Allows test credentials in test files

**Security Tests:**

- [ ] Entropy calculation accuracy
- [ ] False positive rate < 1%
- [ ] False negative rate < 0.1% for known patterns
- [ ] Base64 encoded secrets detection
- [ ] Split secrets across lines

**Parity Tests:**

- [ ] All API key patterns match Python version
- [ ] Entropy threshold matches Python

### 2.6 PII Guard (`src/guards/pii/`)

**Functional Tests:**

*US Patterns:*

- [ ] Social Security Numbers (XXX-XX-XXXX)
- [ ] US Phone numbers (various formats)
- [ ] Driver's License numbers (state-specific)
- [ ] US Passport numbers
- [ ] Medicare/Medicaid numbers
- [ ] ITIN numbers
- [ ] ABA Routing numbers

*EU Patterns:*

- [ ] IBAN numbers (all countries)
- [ ] BIC/SWIFT codes
- [ ] UK National Insurance (NINO)
- [ ] UK NHS numbers
- [ ] German Tax ID (Steuer-ID)
- [ ] French INSEE numbers
- [ ] Spanish DNI/NIE
- [ ] Italian Codice Fiscale
- [ ] Dutch BSN
- [ ] Belgian National Number
- [ ] Polish PESEL
- [ ] Portuguese NIF
- [ ] Austrian Social Security
- [ ] Swedish Personal Number
- [ ] Finnish HETU

*Common Patterns:*

- [ ] Credit Card numbers (Luhn validation)
- [ ] Email addresses
- [ ] IP addresses (v4 and v6)
- [ ] Dates of Birth
- [ ] MAC addresses
- [ ] GPS coordinates

**Validator Tests:**

- [ ] Luhn algorithm correctness
- [ ] IBAN MOD 97-10 validation
- [ ] ABA routing checksum
- [ ] NHS MOD 11 validation
- [ ] Context-aware detection (reduces false positives)

**Security Tests:**

- [ ] Obfuscated PII detection (spaced digits)
- [ ] Mixed format detection
- [ ] Test data exclusion works

**Parity Tests:**

- [ ] All 30+ PII patterns match Python
- [ ] Validation algorithms produce identical results

---

## Phase 3: AI Safety Validation

### 3.1 Prompt Injection Guard (`src/ai-safety/prompt-injection.ts`)

**Functional Tests:**

*Injection Patterns (20+ categories):*

- [ ] System prompt override attempts
- [ ] Role reassignment ("You are now...")
- [ ] Instruction injection ("Ignore previous...")
- [ ] Context manipulation
- [ ] Output format hijacking
- [ ] Delimiter injection
- [ ] Markdown/HTML injection
- [ ] Code block escape attempts
- [ ] Unicode direction override
- [ ] Zero-width character injection
- [ ] Homoglyph attacks
- [ ] Base64 encoded payloads
- [ ] Hex encoded payloads
- [ ] URL encoded payloads
- [ ] Recursive prompt injection
- [ ] Indirect prompt injection (via file content)
- [ ] CRLF injection
- [ ] XML/JSON injection
- [ ] Template injection
- [ ] Comment-based injection

**Security Tests:**

- [ ] All OWASP LLM01 vectors blocked
- [ ] Multi-language injection attempts
- [ ] Combined/layered attacks
- [ ] Novel obfuscation techniques

**Parity Tests:**

- [ ] All patterns match Python `prompt_injection_guard.py`

### 3.2 Jailbreak Guard (`src/ai-safety/jailbreak.ts`)

**Functional Tests:**

*Jailbreak Patterns (40+ categories):*

- [ ] DAN (Do Anything Now) variants
- [ ] Developer mode prompts
- [ ] Roleplay jailbreaks
- [ ] Hypothetical scenarios
- [ ] Fiction framing
- [ ] Academic framing
- [ ] Translation-based attacks
- [ ] Multi-turn manipulation
- [ ] Emotional manipulation
- [ ] Authority impersonation
- [ ] Boundary testing
- [ ] System message extraction
- [ ] Capability probing
- [ ] Ethical bypass attempts
- [ ] Safety filter probing
- [ ] Token manipulation
- [ ] Attention hijacking
- [ ] Context window attacks
- [ ] Memory injection
- [ ] Personality override

**Security Tests:**

- [ ] Text normalization handles Unicode evasion
- [ ] Fuzzy matching catches variants
- [ ] Session risk tracking works
- [ ] Cumulative risk scoring

**Parity Tests:**

- [ ] All 40+ patterns match Python
- [ ] Levenshtein/fuzzy matching identical

---

## Phase 4: Resource Management Validation

### 4.1 Rate Limiter (`src/resource-management/rate-limiter.ts`)

**Functional Tests:**

- [ ] Sliding window algorithm correctness
- [ ] Per-operation limits enforced (Bash: 60, Write: 100, etc.)
- [ ] Global rate limit enforced
- [ ] Exponential backoff on violations
- [ ] Backoff clears after cooldown
- [ ] Whitelist bypass works
- [ ] State persistence across invocations
- [ ] Window cleanup removes old entries

**Security Tests:**

- [ ] Rate limit cannot be bypassed
- [ ] State file tampering detection
- [ ] Clock manipulation resistance

**Performance Tests:**

- [ ] Validator latency < 10ms
- [ ] Memory usage < 10MB
- [ ] State file size stays bounded

**Parity Tests:**

- [ ] Limits match Python `rate_limiter.py`
- [ ] Window algorithm identical

### 4.2 Resource Limits (`src/resource-management/resource-limits.ts`)

**Functional Tests:**

- [ ] Memory limit detection (4GB default)
- [ ] CPU usage tracking
- [ ] Child process limit (10 default)
- [ ] Process timeout enforcement (5 min)
- [ ] File size limit checking
- [ ] Graceful process termination
- [ ] Force kill after timeout

**Security Tests:**

- [ ] Resource exhaustion prevention
- [ ] Zombie process cleanup
- [ ] Memory leak detection

**Parity Tests:**

- [ ] Limits match Python `resource_limits.py`

### 4.3 Recursion Guard (`src/resource-management/recursion-guard.ts`)

**Functional Tests:**

- [ ] Call stack depth tracking
- [ ] Directory traversal depth limits
- [ ] Symlink follow limits
- [ ] Circular reference detection
- [ ] Path history tracking
- [ ] State persistence

**Security Tests:**

- [ ] Stack overflow prevention
- [ ] Infinite loop detection
- [ ] Circular symlink handling

**Parity Tests:**

- [ ] Depth limits match Python

### 4.4 Context Manager (`src/resource-management/context-manager.ts`)

**Functional Tests:**

- [ ] Token estimation accuracy (±10%)
- [ ] Warning threshold at 80%
- [ ] Block threshold at 95%
- [ ] Per-operation token tracking
- [ ] File token estimation
- [ ] Suggestions generation

**Parity Tests:**

- [ ] Token estimation matches Python

---

## Phase 5: Observability Validation

### 5.1 Confidence Tracker (`src/observability/confidence-tracker.ts`)

**Functional Tests:**

- [ ] Uncertainty marker detection
- [ ] Confidence scoring algorithm
- [ ] Threshold-based warnings
- [ ] State persistence

### 5.2 Anomaly Detector (`src/observability/anomaly-detector.ts`)

**Functional Tests:**

- [ ] Rolling 24-hour baseline calculation
- [ ] Standard deviation calculation
- [ ] Anomaly threshold detection
- [ ] Pattern-based anomaly detection
- [ ] Telemetry integration

### 5.3 Audit Integrity (`src/observability/audit-integrity.ts`)

**Functional Tests:**

- [ ] SHA256 hash chain creation
- [ ] Chain field addition to logs
- [ ] Tamper detection
- [ ] Chain state persistence
- [ ] Chain verification

**Security Tests:**

- [ ] Hash collision resistance
- [ ] Tamper-evident logging
- [ ] State file integrity

### 5.4 Telemetry (`src/observability/telemetry.ts`)

**Functional Tests:**

- [ ] JSONL format output
- [ ] File rotation
- [ ] Event recording
- [ ] Metric recording
- [ ] Rate limit metrics
- [ ] Resource usage metrics

---

## Phase 6: Permissions Validation

### 6.1 Plugin Permissions (`src/permissions/plugin-permissions.ts`)

**Functional Tests:**

- [ ] Capability model enforcement (filesystem, network, shell, sensitive_data)
- [ ] Permission manifest parsing
- [ ] Path pattern matching
- [ ] Plugin detection from path
- [ ] Default permissions application
- [ ] Dangerous command blocking

**Security Tests:**

- [ ] Capability escalation prevention
- [ ] Manifest tampering detection
- [ ] Cross-plugin isolation

### 6.2 Supply Chain Verifier (`src/permissions/supply-chain.ts`)

**Functional Tests:**

- [ ] SHA256 checksum verification
- [ ] Manifest loading and parsing
- [ ] File verification against manifest
- [ ] Skill verification
- [ ] Plugin verification
- [ ] GPG signature verification (if available)

**Security Tests:**

- [ ] Hash collision resistance
- [ ] Manifest integrity verification
- [ ] Signature validation

### 6.3 Token Validator (`src/permissions/token-validator.ts`)

**Functional Tests:**

- [ ] Session token validation
- [ ] RBAC role checking
- [ ] Claims parsing
- [ ] Session validation caching
- [ ] Error message extraction

**Security Tests:**

- [ ] Token forgery prevention
- [ ] Replay attack prevention
- [ ] Session hijacking prevention

---

## Phase 7: Integration Validation

### 7.1 Hook Configuration Testing

**Functional Tests:**

- [ ] SessionStart hooks execute in order
- [ ] UserPromptSubmit hooks execute for all prompts
- [ ] PreToolUse hooks execute before each tool
- [ ] Correct validator invoked for each tool type
- [ ] Exit codes propagate correctly (0=allow, 1=warn, 2=block)
- [ ] Stderr messages display to user

**Configuration Tests:**

- [ ] `settings.json` is valid JSON
- [ ] All validator paths resolve correctly
- [ ] No duplicate hooks
- [ ] Matcher patterns are correct

### 7.2 End-to-End Testing

**Scenarios:**

- [ ] Normal operation flow (read, write, edit, bash)
- [ ] Blocked operation (dangerous command)
- [ ] Rate limited operation
- [ ] Resource limited operation
- [ ] PII detection in content
- [ ] Secret detection in content
- [ ] Prompt injection attempt
- [ ] Jailbreak attempt
- [ ] Outside repo access attempt
- [ ] Production environment targeting

---

## Security Testing

### 8.1 Attack Vector Testing

| Attack Vector | Test Description | Validator(s) |
|---------------|------------------|--------------|
| Command Injection | Inject commands via arguments | bash-safety |
| Path Traversal | Access files outside repo | outside-repo, path-utils |
| Privilege Escalation | Execute as root/sudo | bash-safety |
| Data Exfiltration | Send data to external servers | bash-safety, plugin-permissions |
| Prompt Injection | Manipulate LLM behavior | prompt-injection |
| Jailbreak | Bypass safety guidelines | jailbreak |
| DoS via Resources | Exhaust memory/CPU | resource-limits |
| DoS via Rate | Flood with requests | rate-limiter |
| PII Leakage | Expose personal data | pii-guard |
| Secret Leakage | Expose API keys | secret-guard |
| Supply Chain | Execute malicious plugin | supply-chain |
| Session Hijack | Take over session | token-validator |

### 8.2 OWASP LLM Top 10 Coverage

| OWASP LLM Risk | Mitigation | Validator(s) |
|----------------|------------|--------------|
| LLM01: Prompt Injection | Pattern detection, sanitization | prompt-injection |
| LLM02: Insecure Output | Output validation | (application layer) |
| LLM03: Training Data Poisoning | (not applicable) | - |
| LLM04: DoS | Rate/resource limits | rate-limiter, resource-limits |
| LLM05: Supply Chain | Verification, signing | supply-chain |
| LLM06: Sensitive Disclosure | PII/secret detection | pii-guard, secret-guard |
| LLM07: Insecure Plugin | Permissions, capabilities | plugin-permissions |
| LLM08: Excessive Agency | Tool restrictions | all guards |
| LLM09: Overreliance | (user education) | - |
| LLM10: Model Theft | (infrastructure) | - |

### 8.3 Penetration Testing Checklist

- [ ] Automated fuzzing of all validators
- [ ] Manual bypass attempts by security team
- [ ] Encoded payload testing (base64, hex, unicode)
- [ ] Timing attack analysis
- [ ] State file manipulation
- [ ] Race condition testing
- [ ] Concurrent access testing

---

## QA Testing

### 9.1 Functional QA Matrix

| Test Area | Test Cases | Automated | Manual |
|-----------|------------|-----------|--------|
| Bash commands | 50+ | Yes | Yes |
| File operations | 30+ | Yes | Yes |
| PII patterns | 50+ | Yes | No |
| Secret patterns | 30+ | Yes | No |
| Prompt injection | 40+ | Yes | Yes |
| Jailbreak | 50+ | Yes | Yes |
| Rate limiting | 20+ | Yes | No |
| Resource limits | 15+ | Yes | No |
| Permissions | 25+ | Yes | No |
| Integration | 20+ | Yes | Yes |

### 9.2 Regression Testing

- [ ] All existing unit tests pass (558 tests)
- [ ] No new warnings in TypeScript compilation
- [ ] No new linter errors
- [ ] No breaking changes to exported APIs
- [ ] State files are backwards compatible

### 9.3 Compatibility Testing

- [ ] Node.js 18.x compatibility
- [ ] Node.js 20.x compatibility
- [ ] Node.js 22.x compatibility
- [ ] macOS compatibility
- [ ] Linux compatibility
- [ ] Windows/WSL compatibility (if applicable)

### 9.4 Error Handling Testing

- [ ] Invalid JSON input
- [ ] Missing required fields
- [ ] Null/undefined values
- [ ] Empty strings
- [ ] Very large inputs
- [ ] Concurrent access
- [ ] Disk full scenarios
- [ ] Network timeouts (for web validators)

---

## Documentation Review

### 10.1 Files Requiring Update

| Document | Required Updates | Priority |
|----------|------------------|----------|
| `MIGRATION-PLAN.md` | Mark phases complete, add results | P1 |
| `README.md` (validators-node) | Update usage instructions | P0 |
| `.claude/settings.json` | ✅ Already updated | Done |
| `security-lessons-learned.md` | Add Node.js migration lessons | P1 |
| Project CLAUDE.md | Update if references Python validators | P2 |
| Hook documentation | Update command examples | P1 |
| API documentation | Document new TypeScript exports | P2 |

### 10.2 Documentation Accuracy Checks

- [ ] All code examples use Node.js commands
- [ ] File paths are correct
- [ ] Exit codes documented correctly
- [ ] Environment variables documented
- [ ] Configuration options documented
- [ ] Troubleshooting section updated

### 10.3 New Documentation Required

- [ ] TypeScript API reference
- [ ] Migration guide (Python → Node.js)
- [ ] Performance comparison report
- [ ] Security audit report

---

## Parity Testing

### 11.1 Parity Test Framework

```typescript
// Parity test structure
interface ParityTestCase {
  name: string;
  input: {
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    prompt?: string;
  };
  expectedExitCode: 0 | 1 | 2;
  expectedOutput?: string;
}

// Run same input through both Python and Node.js
async function runParityTest(validator: string, testCase: ParityTestCase) {
  const pythonResult = await runPythonValidator(validator, testCase.input);
  const nodeResult = await runNodeValidator(validator, testCase.input);

  assert.equal(nodeResult.exitCode, pythonResult.exitCode, 'Exit codes must match');
  // Output messages may differ slightly, but blocking behavior must match
}
```

### 11.2 Parity Test Coverage

| Validator | Python File | Node.js File | Test Cases |
|-----------|-------------|--------------|------------|
| bash-safety | bash_safety.py | bash-safety.ts | 50 |
| env-protection | env_protection.py | env-protection.ts | 30 |
| outside-repo | outside_repo_guard.py | outside-repo.ts | 25 |
| production | production_guard.py | production.ts | 15 |
| secret | secret_guard.py | secret.ts | 40 |
| pii | pii_guard.py | pii/index.ts | 60 |
| prompt-injection | prompt_injection_guard.py | prompt-injection.ts | 50 |
| jailbreak | jailbreak_guard.py | jailbreak.ts | 60 |
| rate-limiter | rate_limiter.py | rate-limiter.ts | 25 |
| resource-limits | resource_limits.py | resource-limits.ts | 20 |
| recursion-guard | recursion_guard.py | recursion-guard.ts | 15 |
| context-manager | context_manager.py | context-manager.ts | 15 |
| plugin-permissions | plugin_permissions.py | plugin-permissions.ts | 30 |
| supply-chain | supply_chain_verifier.py | supply-chain.ts | 20 |
| token-validator | token_validator.py | token-validator.ts | 15 |

**Total Parity Tests: ~470**

---

## Performance Benchmarking

### 12.1 Benchmark Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Validator latency | < 50ms | Time from stdin to exit |
| Memory usage | < 20MB | Process RSS |
| Startup time | < 100ms | Cold start measurement |
| Throughput | > 100 ops/sec | Sustained load test |
| State file I/O | < 5ms | File operation timing |

### 12.2 Benchmark Comparison

```bash
# Benchmark Python validator
hyperfine --warmup 3 'echo "{\"tool_input\":{\"command\":\"ls\"}}" | python3 bash_safety.py'

# Benchmark Node.js validator
hyperfine --warmup 3 'echo "{\"tool_input\":{\"command\":\"ls\"}}" | node bash-safety.js'
```

### 12.3 Performance Test Scenarios

- [ ] Single validator invocation (cold)
- [ ] Single validator invocation (warm)
- [ ] Sequential 100 invocations
- [ ] Concurrent 10 invocations
- [ ] Large input payload (1MB)
- [ ] Complex regex matching
- [ ] State file under load

---

## Rollback Verification

### 13.1 Rollback Procedure

1. **Immediate Rollback**

   ```bash
   # Restore Python settings.json
   git checkout HEAD~1 -- .claude/settings.json
   ```

2. **Validate Python Validators Still Work**

   ```bash
   echo '{"tool_input":{"command":"ls"}}' | python3 .claude/validators/bash_safety.py
   ```

3. **Clear Node.js State Files**

   ```bash
   rm -f .claude/validators-node/state/*.json
   ```

### 13.2 Rollback Testing

- [ ] Rollback procedure documented
- [ ] Rollback tested successfully
- [ ] Python validators still functional
- [ ] State files compatible or safely reset
- [ ] No user intervention required

### 13.3 Rollback Triggers

| Trigger | Severity | Action |
|---------|----------|--------|
| Security bypass discovered | Critical | Immediate rollback |
| >10% false positive rate | High | Investigate, consider rollback |
| Performance >2x slower | Medium | Investigate, optional rollback |
| State corruption | High | Reset state, monitor |
| User-reported issues | Variable | Investigate case-by-case |

---

## Execution Checklist

### Pre-Execution

- [ ] All unit tests pass (558/558)
- [ ] TypeScript compiles without errors
- [ ] Python validators still available for parity testing
- [ ] Backup of settings.json created
- [ ] Test environment prepared

### Execution Order

1. [ ] Phase 1: Foundation validation
2. [ ] Phase 2: Core Guards validation
3. [ ] Phase 3: AI Safety validation
4. [ ] Phase 4: Resource Management validation
5. [ ] Phase 5: Observability validation
6. [ ] Phase 6: Permissions validation
7. [ ] Phase 7: Integration validation
8. [ ] Security testing
9. [ ] QA testing
10. [ ] Parity testing
11. [ ] Performance benchmarking
12. [ ] Documentation review
13. [ ] Rollback verification

### Post-Execution

- [ ] All test results documented
- [ ] Issues logged and prioritized
- [ ] Sign-off obtained
- [ ] Production deployment approved

---

## Appendix A: Test Data Files

Location: `.claude/validators-node/tests/fixtures/`

- `bash-safety-cases.json` - Bash command test cases
- `pii-patterns.json` - PII pattern test data
- `secret-patterns.json` - Secret pattern test data
- `injection-payloads.json` - Prompt injection payloads
- `jailbreak-payloads.json` - Jailbreak attempt payloads

## Appendix B: Test Utilities

Location: `.claude/validators-node/tests/utils/`

- `parity-runner.ts` - Python/Node.js parity test runner
- `benchmark.ts` - Performance benchmark utility
- `fixture-loader.ts` - Test fixture loading

## Appendix C: CI/CD Integration

```yaml
# .github/workflows/validator-tests.yml
name: Validator Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd .claude/validators-node && npm ci
      - run: cd .claude/validators-node && npm test
      - run: cd .claude/validators-node && npm run parity-test
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-17
**Author:** BlackUnicorn.Tech
**Status:** PENDING EXECUTION
