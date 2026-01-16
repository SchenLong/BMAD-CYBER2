# BMAD Framework Security Audit - Supplemental Report

**Project:** BMAD-Security-Review
**Auditor:** Secondary Security Review (Depth Analysis)
**Date:** 2026-01-15
**Classification:** Internal - Security Sensitive
**Version:** 1.0
**Scope:** Issues potentially missed in primary audit

---

## Executive Summary

This supplemental security audit examines the BMAD framework with a focus on identifying vulnerabilities, weaknesses, and gaps that may have been overlooked in the primary audit. While the primary audit correctly identified and addressed major security controls (authentication, RBAC, audit logging), this review reveals **several significant issues** that warrant immediate attention.

### Supplemental Findings Summary

| Severity | Count | Status |
|----------|-------|--------|
| **CRITICAL** | 2 | Requires immediate remediation |
| **HIGH** | 4 | Requires near-term remediation |
| **MEDIUM** | 5 | Planned improvement |
| **LOW** | 3 | For consideration |

---

## 1. CRITICAL FINDINGS

### 1.1 CRITICAL: Private Signing Key Stored in Repository

**Severity:** CRITICAL
**CVSS Estimate:** 9.8 (Critical)
**Missed By:** Primary audit noted file integrity signing as "IMPLEMENTED" but did not flag key storage issue

**Location:** `_bmad/core/security/bmad-private-key.asc`

**Description:**
The PGP private key used for signing the framework manifest is stored unencrypted in the repository. This completely undermines the integrity verification system.

**Evidence:**
```
_bmad/core/security/bmad-private-key.asc
- Contains: -----BEGIN PGP PRIVATE KEY BLOCK-----
- Algorithm: RSA-4096
- Key ID: 5528FA32356DA698
- User ID: BMAD Framework <bmad-signing@internal>
- No passphrase protection visible
```

**Impact:**
1. **Any attacker with repository access can forge signatures** - Renders file integrity verification meaningless
2. **Tampered agents/workflows would appear legitimate** - Signed manifest could be regenerated after malicious modifications
3. **Trust chain completely broken** - Cannot verify framework authenticity

**Exploitation Scenario:**
1. Attacker gains read access to repository (clone, backup, developer machine)
2. Imports private key: `gpg --import bmad-private-key.asc`
3. Modifies any agent/workflow file
4. Regenerates and signs manifest: `./sign-manifest.sh`
5. Verification passes with tampered files

**Recommended Remediation:**
1. **IMMEDIATE:** Remove private key from repository
2. Use GPG key with passphrase protection stored in secure location
3. Consider hardware security module (HSM) for key storage
4. Implement CI/CD signing with secrets manager
5. Rotate compromised key (assume all versions with key are potentially tampered)

**Documentation Gap:** `KEY-INFO.md` states "Never committed to public repositories" but key IS in repository.

---

### 1.2 CRITICAL: Race Condition in Override Management

**Severity:** CRITICAL
**CVSS Estimate:** 8.1 (High)
**Missed By:** Primary audit did not analyze override system implementation details

**Location:** `.claude/validators/security_common.py` (lines 143-234)

**Description:**
The override management system has a Time-of-Check-Time-of-Use (TOCTOU) race condition that allows an attacker to bypass single-use override restrictions.

**Evidence:**
```python
# OverrideManager.check_and_consume_override()
def check_and_consume_override(cls, override_type: str) -> Tuple[bool, str]:
    # First check environment variable
    env_value = os.environ.get(env_var, '').lower()
    if env_value != 'true':
        return False, 'Override not set'

    # Load state (RACE WINDOW STARTS)
    state = cls._load_state()
    state = cls._cleanup_expired(state)

    # Check if this is a new override
    if override_type not in state.get('overrides', {}):
        # Register and consume (RACE: Multiple processes can reach here)
        state['overrides'][override_type] = False
        state['created_at'][override_type] = time.time()
        cls._save_state(state)  # RACE WINDOW ENDS
        return True, f'Override consumed'
```

**Issue:** Between `_load_state()` and `_save_state()`, another process can:
1. Load the same state
2. See override as "not yet consumed"
3. Both processes consume the "single-use" override

**Impact:**
- Single-use override can be used multiple times via parallel requests
- Defeats the security control entirely
- Allows multiple dangerous operations with one override set

**Exploitation:**
```bash
export BMAD_ALLOW_DANGEROUS=true
# Launch multiple Claude sessions simultaneously
# All sessions see override as valid and consume it
```

**Recommended Remediation:**
1. Use atomic file operations with proper locking:
```python
def check_and_consume_override(cls, override_type: str):
    with open(OVERRIDE_FILE, 'r+') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # Exclusive lock BEFORE read
        state = json.load(f)
        # ... check and modify state ...
        f.seek(0)
        f.truncate()
        json.dump(state, f)
        # Lock released on close
```

2. Consider using advisory locks or database transactions
3. Implement atomic compare-and-swap for state updates

---

## 2. HIGH FINDINGS

### 2.1 HIGH: Validator Bypass via Command Substitution

**Severity:** HIGH
**CVSS Estimate:** 7.5 (High)
**Missed By:** Primary audit noted hook system as "IMPLEMENTED" but did not analyze bypass vectors

**Location:** `.claude/validators/outside_repo_guard.py`

**Description:**
The path extraction from bash commands does not resolve command substitution, allowing bypass of repository boundary checks.

**Evidence:**
```python
def extract_paths_from_command(cmd: str) -> list:
    # Skips command substitution
    if group.startswith('$') or group.startswith('`'):
        continue  # BYPASS: Path is not checked
```

**Exploitation:**
```bash
# Direct path - BLOCKED
cat /etc/passwd

# Command substitution - NOT CHECKED
cat $(echo "/etc/passwd")
cat `echo /etc/passwd`

# Variable expansion - NOT CHECKED
path="/etc/passwd"
cat $path
```

**Impact:**
- Attacker can read/write files outside repository
- Bypasses `outside_repo_guard.py` protection entirely
- Path traversal attacks possible

**Note:** The validator logs a WARNING about command substitution but still ALLOWS the operation if the literal paths in the command appear safe.

**Recommended Remediation:**
1. Block commands containing command substitution patterns by default
2. Require explicit override for any command with `$()`, backticks, or `${}`
3. Consider running commands in restricted shell without substitution support

---

### 2.2 HIGH: Regex Pattern Evasion in Jailbreak Guard

**Severity:** HIGH
**CVSS Estimate:** 7.2 (High)
**Missed By:** Primary audit noted jailbreak detection as "IMPLEMENTED" but did not test evasion techniques

**Location:** `.claude/validators/jailbreak_guard.py`

**Description:**
The jailbreak detection relies on regex patterns that can be trivially evaded using unicode normalization attacks and other obfuscation techniques.

**Evidence:**
```python
# Homoglyph detection is limited
(r'[іІ][gɡ][nո][oо][rг][eе]|[jј][aа][iі][lІ][bЬ][rг][eе][aа][kк]', 'Homoglyph Substitution')

# Missing coverage for:
# - Zero-width characters: i​g​n​o​r​e (with zero-width spaces)
# - Unicode confusables beyond listed chars
# - RTL override attacks
# - Combining characters
```

**Evasion Examples Not Detected:**
1. **Zero-width joiners:** `D​A​N` (invisible characters between letters)
2. **Lookalike characters:** Using characters from other scripts (e.g., Cyrillic а looks like Latin a)
3. **Case folding attacks:** Using characters that normalize to target patterns
4. **Word segmentation:** `Ignore your rules` → `Ig nore your ru les`

**Impact:**
- Jailbreak patterns can be obfuscated to bypass detection
- Known attack templates may not be detected
- Defense provides false sense of security

**Recommended Remediation:**
1. Apply Unicode normalization (NFKC) before pattern matching
2. Strip zero-width characters and combining marks
3. Use fuzzy matching with edit distance for known patterns
4. Implement ML-based detection as secondary layer

---

### 2.3 HIGH: Shell Injection in TTS Scripts

**Severity:** HIGH
**CVSS Estimate:** 7.0 (High)
**Missed By:** Primary audit noted "42 shell scripts" but did not perform injection analysis

**Location:** `.claude/hooks/bmad-speak.sh` (lines 54-56)

**Description:**
Agent names from manifest are interpolated into grep/awk commands without proper escaping, allowing shell injection.

**Evidence:**
```bash
# bmad-speak.sh line 54
local direct_match=$(grep -i "^\"*${name_or_id}\"*," "$PROJECT_ROOT/.bmad/_cfg/agent-manifest.csv" | head -1)

# line 64-81: awk with user input
local agent_id=$(awk -F',' -v name="$name_or_id" '
```

**Issue:** `$name_or_id` comes from user input (agent name) and is passed directly to grep/awk without sanitization.

**Exploitation:**
```bash
# If an attacker can control agent name:
name_or_id='"; rm -rf /; "'
# or
name_or_id="$(whoami > /tmp/pwned)"
```

**Mitigating Factor:** The `play-tts.sh` script has input validation:
```bash
if [[ -n "$VOICE_OVERRIDE" ]] && [[ "$VOICE_OVERRIDE" =~ [';|&$`<>(){}'] ]]; then
    echo "Error: Invalid characters in voice parameter" >&2
```

However, `bmad-speak.sh` does NOT have this check for `AGENT_NAME_OR_ID`.

**Recommended Remediation:**
1. Add input validation to `bmad-speak.sh` for all user-controlled inputs
2. Use `--` with grep to prevent option injection
3. Quote all variable expansions
4. Consider using Python instead of shell for complex operations

---

### 2.4 HIGH: Token Validation Not Enforced at Runtime

**Severity:** HIGH
**CVSS Estimate:** 6.8 (Medium)
**Missed By:** Primary audit verified token GENERATION works but not runtime enforcement

**Location:** `_bmad/core/security/validate-token.js`, `_bmad/core/security/authorization.js`

**Description:**
While token generation and validation scripts exist, there is no evidence they are called automatically during workflow execution.

**Evidence:**
1. No hook in `.claude/settings.json` calls token validation
2. `session-security-init.py` does not validate tokens
3. RBAC `check-authorization.js` is CLI tool, not automatic enforcement

```python
# session-security-init.py
# Does NOT include:
# - Token validation
# - Session establishment
# - Role verification
```

**Impact:**
- Authentication system exists but may not be enforced
- Users can potentially bypass authentication entirely
- RBAC may not be evaluated during actual workflow execution

**Recommended Remediation:**
1. Add token validation to SessionStart hook
2. Integrate RBAC checks into workflow execution
3. Add authentication middleware to all entry points
4. Implement session validation in every tool hook

---

## 3. MEDIUM FINDINGS

### 3.1 MEDIUM: Insufficient Entropy Validation for Secrets

**Location:** `.claude/validators/secret_guard.py` (line 162)

**Description:**
The entropy threshold of 3.5 bits is too low for reliable secret detection, leading to false negatives.

```python
def is_high_entropy(value: str, threshold: float = 3.5) -> bool:
```

**Issue:** Common passwords like `Password123!` have entropy ~3.2, below threshold. Real API keys typically have entropy 4.5+.

**Recommendation:** Increase threshold to 4.0 or implement pattern-specific thresholds.

---

### 3.2 MEDIUM: Audit Log Hash Chain Can Be Reconstructed

**Location:** `_bmad/core/config.yaml` (audit section)

**Description:**
The hash chain implementation hashes each entry with the previous hash, but an attacker with write access can:
1. Delete the entire log
2. Create new log with forged entries
3. Generate valid hash chain from scratch

**Recommendation:**
1. Use external timestamping service
2. Periodically publish hash to blockchain/external service
3. Implement log forwarding to immutable storage

---

### 3.3 MEDIUM: No Protection Against Log Injection

**Location:** `.claude/validators/security_common.py` (line 91)

**Description:**
Log entries are written as JSON without sanitizing input, allowing log injection attacks.

```python
f.write(json.dumps(log_entry) + '\n')
# If details contain newlines, could inject fake log entries
```

**Recommendation:** Sanitize all log inputs to prevent injection.

---

### 3.4 MEDIUM: Session Risk File Readable by All Users

**Location:** `.claude/validators/jailbreak_guard.py` (line 83)

**Description:**
Session risk tracking file is stored in `.claude/logs/` without restricted permissions.

```python
SESSION_RISK_FILE = os.path.join(PROJECT_DIR, '.claude', 'logs', '.session_risk.json')
```

**Recommendation:** Set file permissions to 600 and validate file integrity before reading.

---

### 3.5 MEDIUM: Missing Content-Length Validation for Large Inputs

**Location:** All validators

**Description:**
No validators check input size before processing, allowing denial of service via large inputs.

**Recommendation:** Add input size limits before regex processing.

---

## 4. LOW FINDINGS

### 4.1 LOW: Fallback Security Common Implementation

**Location:** All validators

**Description:**
When `security_common` import fails, validators fall back to stub implementations that provide no security.

```python
except ImportError:
    class AuditLogger:
        @classmethod
        def log_blocked(cls, *args, **kwargs): pass
```

**Recommendation:** Fail closed instead of falling back to no-op implementations.

---

### 4.2 LOW: Override Timeout Not Cryptographically Secure

**Location:** `.claude/validators/security_common.py` (line 28)

**Description:**
Override timeout uses system time which can be manipulated by changing system clock.

**Recommendation:** Use monotonic time or server-validated timestamps.

---

### 4.3 LOW: No Integrity Check on Validator Files

**Location:** `.claude/validators/`

**Description:**
While agents/workflows are in the signed manifest, the validator Python files themselves are not verified before execution.

**Recommendation:** Include validator files in signed manifest and verify before execution.

---

## 5. Comparison with Primary Audit

### Items Primary Audit Correctly Identified

| Finding | Primary Status | Agreement |
|---------|---------------|-----------|
| No Authentication | RESOLVED | Agree (implemented) |
| No Authorization (RBAC) | RESOLVED | Partial (not enforced at runtime) |
| No Audit Logging | RESOLVED | Agree (implemented) |
| YOLO Mode Bypass | RESOLVED | Agree (controls implemented) |
| LLM-Based Security | MITIGATED | Agree (hooks help but not complete) |

### Items Primary Audit Missed

| Finding | This Report | Severity | Category |
|---------|-------------|----------|----------|
| Private key in repo | Section 1.1 | CRITICAL | Key Management |
| TOCTOU in override system | Section 1.2 | CRITICAL | Race Condition |
| Command substitution bypass | Section 2.1 | HIGH | Input Validation |
| Jailbreak pattern evasion | Section 2.2 | HIGH | Detection Bypass |
| Shell injection in TTS | Section 2.3 | HIGH | Injection |
| Token validation not enforced | Section 2.4 | HIGH | Authentication |
| Low entropy threshold | Section 3.1 | MEDIUM | Secret Detection |
| Hash chain reconstruction | Section 3.2 | MEDIUM | Audit Integrity |
| Log injection | Section 3.3 | MEDIUM | Logging |
| Session file permissions | Section 3.4 | MEDIUM | File Security |
| Large input DoS | Section 3.5 | MEDIUM | Availability |
| Fallback stub implementations | Section 4.1 | LOW | Fail-Open |
| Time-based override | Section 4.2 | LOW | Timing |
| Validator file integrity | Section 4.3 | LOW | Integrity |

---

## 6. Risk Assessment

### Critical Risk Items Requiring Immediate Action

1. **Private Key Exposure (Section 1.1)**
   - Likelihood: HIGH (key is accessible)
   - Impact: CRITICAL (complete trust model failure)
   - **Action:** Remove key from repo immediately, rotate key

2. **Override Race Condition (Section 1.2)**
   - Likelihood: MEDIUM (requires parallel execution)
   - Impact: HIGH (bypass security controls)
   - **Action:** Implement proper file locking

### High Risk Items for Near-Term Remediation

3. **Command Substitution Bypass (Section 2.1)**
4. **Jailbreak Pattern Evasion (Section 2.2)**
5. **Shell Injection in TTS (Section 2.3)**
6. **Token Validation Not Enforced (Section 2.4)**

---

## 7. Conclusion

While the primary audit correctly identified and addressed several critical security gaps (authentication, RBAC, audit logging), this supplemental review reveals **significant issues that undermine the implemented controls**:

1. **File integrity verification is ineffective** due to private key storage in repository
2. **Override system has race conditions** allowing bypass of single-use restrictions
3. **Validators can be evaded** through command substitution and pattern obfuscation
4. **Authentication/RBAC may not be enforced** at runtime

### Recommended Priority

| Priority | Action | Effort |
|----------|--------|--------|
| P0 (Today) | Remove private key from repository | Low |
| P0 (Today) | Rotate signing key | Medium |
| P1 (This Week) | Fix TOCTOU in override system | Medium |
| P1 (This Week) | Add token validation to hooks | Medium |
| P2 (This Sprint) | Block command substitution | Low |
| P2 (This Sprint) | Add input validation to shell scripts | Medium |
| P3 (Next Sprint) | Improve jailbreak detection | High |

---

**Report Prepared By:** Secondary Security Review
**Report Classification:** Internal - Security Sensitive
**Date:** 2026-01-15
**Version:** 1.0

---

*End of Supplemental Report*
