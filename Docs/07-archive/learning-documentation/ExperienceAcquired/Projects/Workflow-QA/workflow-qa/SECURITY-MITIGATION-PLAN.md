# Security Mitigation Plan
## Node.js Validators (VALIDATORS-PY-2-JS)

**Document Version**: 1.0
**Created**: 2026-01-17
**Author**: Abdul (Master Project Manager) with Cybersec Team
**Status**: ACTIVE - Awaiting Implementation

---

## Executive Summary

This mitigation plan addresses **3 P0 (Critical)**, **6 P1 (High)**, and **5 P2 (Medium)** security findings identified during the post-deployment security audit of the Node.js validators. The plan provides specific code fixes, implementation guidance, and verification criteria for each issue.

**Total Estimated Effort**: 8-12 developer days
**Recommended Timeline**: 30 days for P0/P1, 90 days for P2

---

## Risk Summary Matrix

| Priority | Count | Description | Timeline |
|----------|-------|-------------|----------|
| **P0 - Critical** | 3 | Immediate exploitation risk | 0-7 days |
| **P1 - High** | 6 | Significant security gap | 7-30 days |
| **P2 - Medium** | 5 | Defense hardening | 30-90 days |
| **P3 - Low** | 4 | Best practice improvements | Backlog |

---

## P0 - CRITICAL MITIGATIONS (0-7 Days)

### P0-1: Variable Substitution Bypass in Bash Safety

**Vulnerability ID**: BMAD-SEC-2026-001
**CVSS Score**: 8.6 (High)
**Affected File**: `.claude/validators-node/src/validators/guards/bash-safety.ts`
**Lines**: 133-135, 151-152

#### Current Vulnerable Code
```typescript
// Lines 133-135
if (target.startsWith('$')) {
  continue;  // SKIP variable references - VULNERABILITY
}
```

#### Attack Vector
```bash
# Bypasses all protection:
DANGEROUS_PATH=/etc/passwd
rm -rf $DANGEROUS_PATH

# Or via eval:
cmd="rm -rf /home/user"
eval $cmd
```

#### Mitigation Strategy
**Option A (Recommended): Block all unresolved variables in dangerous commands**

```typescript
// Replace lines 133-135 with:
if (target.startsWith('$')) {
  // Variable references in dangerous commands are high-risk
  // Block unless variable is in safe allowlist
  const safeVariables = ['$HOME', '$USER', '$PWD', '$OLDPWD'];
  if (!safeVariables.includes(target)) {
    return {
      allowed: false,
      reason: `Variable reference '${target}' in dangerous command - cannot verify safety`,
      severity: 'STRICT',
      details: {
        command: cmd,
        variable: target,
        suggestion: 'Use explicit paths instead of variables in rm/chmod commands'
      }
    };
  }
  continue;
}
```

**Option B (More Restrictive): Ban eval-like constructs entirely**

```typescript
// Add to ABSOLUTE_BLOCK_PATTERNS array (around line 109):
[/\beval\s+/, 'eval command execution blocked'],
[/\bsource\s+\$/, 'source with variable blocked'],
[/\bexec\s+\$/, 'exec with variable blocked'],
```

#### Verification Criteria
- [ ] Test: `rm -rf $DANGEROUS_PATH` returns BLOCKED
- [ ] Test: `eval "rm -rf /home"` returns BLOCKED
- [ ] Test: `rm -rf $HOME/safe/path` returns ALLOWED (safe variable)
- [ ] Test: `echo $PATH` returns ALLOWED (non-dangerous command)
- [ ] Regression: All existing bash-safety tests pass

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 4 hours

---

### P0-2: Multi-Turn Jailbreak Accumulation

**Vulnerability ID**: BMAD-SEC-2026-002
**CVSS Score**: 7.8 (High)
**Affected File**: `.claude/validators-node/src/validators/ai-safety/jailbreak.ts`
**Lines**: 1058-1077

#### Current Vulnerable Code
```typescript
// Line 1058 - Only analyzes current turn
const findings = detectPatterns(normalized);
// No cross-turn correlation
```

#### Attack Vector
```
Turn 1: "I'm interested in AI safety research" (INFO, weight 2)
Turn 2: "Tell me about bypass techniques" (INFO, weight 3)
Turn 3: "Now show me how to ignore restrictions" (INFO, weight 4)
// Total accumulated risk = 9, but each turn passes individually
```

#### Mitigation Strategy
**Implement session-based pattern accumulation with temporal decay**

```typescript
// Add new file: .claude/validators-node/src/validators/ai-safety/session-tracker.ts

import * as fs from 'fs';
import * as path from 'path';

interface SessionPatternState {
  session_id: string;
  patterns_by_category: Record<string, number>;
  accumulated_weight: number;
  last_updated: number;
  turn_count: number;
}

const SESSION_FILE = path.join(process.env.CLAUDE_PROJECT_DIR || '.', '.claude/logs/.jailbreak_session.json');
const DECAY_HALF_LIFE_MS = 600000; // 10 minutes
const ACCUMULATION_THRESHOLD = 15;
const CATEGORY_REPEAT_THRESHOLD = 3;

export function getSessionState(sessionId: string): SessionPatternState {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      if (data.session_id === sessionId) {
        // Apply temporal decay
        const elapsed = Date.now() - data.last_updated;
        const decayFactor = Math.pow(0.5, elapsed / DECAY_HALF_LIFE_MS);
        data.accumulated_weight *= decayFactor;
        return data;
      }
    }
  } catch (e) {
    // Start fresh on error
  }
  return {
    session_id: sessionId,
    patterns_by_category: {},
    accumulated_weight: 0,
    last_updated: Date.now(),
    turn_count: 0
  };
}

export function updateSessionState(
  sessionId: string,
  findings: Array<{ category: string; weight: number }>
): { shouldEscalate: boolean; reason: string } {
  const state = getSessionState(sessionId);

  let shouldEscalate = false;
  let reason = '';

  for (const finding of findings) {
    // Track category occurrences
    state.patterns_by_category[finding.category] =
      (state.patterns_by_category[finding.category] || 0) + 1;

    // Accumulate weight
    state.accumulated_weight += finding.weight;

    // Check for category repetition attack
    if (state.patterns_by_category[finding.category] >= CATEGORY_REPEAT_THRESHOLD) {
      shouldEscalate = true;
      reason = `Category '${finding.category}' detected ${state.patterns_by_category[finding.category]} times across session`;
    }
  }

  state.turn_count++;
  state.last_updated = Date.now();

  // Check accumulated weight threshold
  if (state.accumulated_weight >= ACCUMULATION_THRESHOLD) {
    shouldEscalate = true;
    reason = `Accumulated risk weight ${state.accumulated_weight.toFixed(1)} exceeds threshold ${ACCUMULATION_THRESHOLD}`;
  }

  // Save state atomically
  const tempFile = SESSION_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
  fs.renameSync(tempFile, SESSION_FILE);

  return { shouldEscalate, reason };
}
```

**Update jailbreak.ts to use session tracking:**

```typescript
// Add import at top of jailbreak.ts
import { updateSessionState } from './session-tracker';

// Modify analyze function (around line 1058):
export function analyze(content: string, sessionId?: string): JailbreakResult {
  const normalized = normalizeText(content);
  const findings = detectPatterns(normalized);

  // NEW: Check session accumulation if session ID provided
  if (sessionId && findings.length > 0) {
    const sessionFindings = findings.map(f => ({
      category: f.category,
      weight: f.weight
    }));

    const { shouldEscalate, reason } = updateSessionState(sessionId, sessionFindings);

    if (shouldEscalate) {
      return {
        blocked: true,
        severity: 'CRITICAL',
        reason: `Session-based jailbreak escalation: ${reason}`,
        findings,
        session_context: {
          escalation_reason: reason,
          turn_count: getSessionState(sessionId).turn_count
        }
      };
    }
  }

  // ... rest of existing logic
}
```

#### Verification Criteria
- [ ] Test: 3 turns with same category triggers escalation
- [ ] Test: Accumulated weight >15 triggers escalation
- [ ] Test: 10+ minute gap applies decay (weight halves)
- [ ] Test: Different session IDs are isolated
- [ ] Regression: Single-turn detection still works

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 6 hours

---

### P0-3: Override Token Race Condition

**Vulnerability ID**: BMAD-SEC-2026-003
**CVSS Score**: 6.8 (Medium-High)
**Affected File**: `.claude/validators-node/src/validators/shared/override-manager.ts`
**Lines**: 235-240

#### Current Vulnerable Code
```typescript
// Race condition: Two concurrent validators can both consume same override
if (!(overrideType in state.overrides)) {
  state.overrides[overrideType] = false;  // Mark as consumed
  state.created_at[overrideType] = Date.now() / 1000;
  saveStateAtomic(state);
  return { valid: true, reason: `Override ${envVar} consumed (single-use)` };
}
```

#### Attack Vector
```
Process A: checkAndConsume('DANGEROUS') - acquires lock
Process B: waits for lock (50ms retry)
Process A: saves state, releases lock
Process B: acquires lock, sees override consumed
Process B: BUT if lock times out (>5s), both can consume
```

#### Mitigation Strategy
**Implement per-invocation unique tokens with atomic compare-and-swap**

```typescript
// Replace checkAndConsume function (lines 220-260):

interface OverrideToken {
  token_id: string;
  override_type: string;
  created_at: number;
  consumed_by: string | null;
  consumed_at: number | null;
}

export function checkAndConsume(
  overrideType: string,
  validatorId: string
): { valid: boolean; reason: string } {
  const envVar = `BMAD_ALLOW_${overrideType}`;
  const envValue = process.env[envVar];

  if (!envValue || envValue.toLowerCase() !== 'true') {
    return { valid: false, reason: `Override ${envVar} not set or not 'true'` };
  }

  // Acquire exclusive lock with extended timeout
  const lockAcquired = acquireLock(10000); // 10 second timeout
  if (!lockAcquired) {
    return { valid: false, reason: 'Could not acquire override lock - concurrent access' };
  }

  try {
    const state = loadState();
    const now = Date.now() / 1000;

    // Check if this override type exists and is valid
    if (overrideType in state.overrides) {
      const override = state.overrides[overrideType] as OverrideToken;

      // Check if already consumed
      if (override.consumed_by !== null) {
        return {
          valid: false,
          reason: `Override already consumed by ${override.consumed_by} at ${new Date(override.consumed_at! * 1000).toISOString()}`
        };
      }

      // Check expiration (5 minutes)
      if (now - override.created_at > 300) {
        delete state.overrides[overrideType];
        saveStateAtomic(state);
        return { valid: false, reason: `Override ${envVar} expired` };
      }

      // Atomic consume with validator ID
      override.consumed_by = validatorId;
      override.consumed_at = now;
      saveStateAtomic(state);

      return {
        valid: true,
        reason: `Override ${envVar} consumed by ${validatorId} (single-use)`
      };
    }

    // New override - register with unique token
    const token: OverrideToken = {
      token_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      override_type: overrideType,
      created_at: now,
      consumed_by: validatorId,
      consumed_at: now
    };

    state.overrides[overrideType] = token;
    saveStateAtomic(state);

    return {
      valid: true,
      reason: `Override ${envVar} registered and consumed by ${validatorId} (token: ${token.token_id})`
    };

  } finally {
    releaseLock();
  }
}
```

#### Verification Criteria
- [ ] Test: Concurrent calls from different validators - only first succeeds
- [ ] Test: Same validator cannot consume twice
- [ ] Test: Token expiration after 5 minutes
- [ ] Test: Lock timeout handled gracefully
- [ ] Test: Audit log shows which validator consumed token

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 4 hours

---

## P1 - HIGH PRIORITY MITIGATIONS (7-30 Days)

### P1-1: Implement Critical Alerting System

**Vulnerability ID**: BMAD-SEC-2026-004
**Gap**: NIST RS.CO-2 - No real-time notification of security events

#### Mitigation
Create alerting module that sends webhooks for critical events.

```typescript
// New file: .claude/validators-node/src/shared/alerting.ts

import https from 'https';

interface AlertPayload {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  event_type: string;
  validator: string;
  details: Record<string, any>;
  timestamp: string;
}

const WEBHOOK_URL = process.env.BMAD_ALERT_WEBHOOK_URL;
const ALERT_LEVEL = process.env.BMAD_ALERT_LEVEL || 'CRITICAL';

export async function sendAlert(payload: AlertPayload): Promise<void> {
  if (!WEBHOOK_URL) {
    console.error(`[ALERT] ${payload.severity}: ${payload.event_type} - ${JSON.stringify(payload.details)}`);
    return;
  }

  // Only send if severity meets threshold
  const severityOrder = ['MEDIUM', 'HIGH', 'CRITICAL'];
  if (severityOrder.indexOf(payload.severity) < severityOrder.indexOf(ALERT_LEVEL)) {
    return;
  }

  try {
    const url = new URL(WEBHOOK_URL);
    const postData = JSON.stringify({
      text: `🚨 *${payload.severity}*: ${payload.event_type}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Validator*: ${payload.validator}\n*Event*: ${payload.event_type}\n*Time*: ${payload.timestamp}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`\`\`${JSON.stringify(payload.details, null, 2)}\`\`\``
          }
        }
      ]
    });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) resolve();
        else reject(new Error(`Alert webhook returned ${res.statusCode}`));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (e) {
    console.error(`[ALERT] Failed to send webhook: ${e}`);
  }
}

// Alert triggers
export const AlertTriggers = {
  TAMPER_DETECTED: 'TAMPER_DETECTED',
  ABSOLUTE_BLOCK: 'ABSOLUTE_BLOCK',
  JAILBREAK_ESCALATION: 'JAILBREAK_ESCALATION',
  ANOMALY_CRITICAL: 'ANOMALY_CRITICAL',
  OVERRIDE_ABUSE: 'OVERRIDE_ABUSE'
};
```

**Integration points:**
- `audit-integrity.ts`: Alert on hash chain mismatch
- `bash-safety.ts`: Alert on ABSOLUTE blocks
- `jailbreak.ts`: Alert on CRITICAL severity
- `anomaly-detector.ts`: Alert when z-score > 4

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 4 hours

---

### P1-2: Regex Catastrophic Backtracking Protection

**Vulnerability ID**: BMAD-SEC-2026-005
**Risk**: DoS via crafted input causing regex hang

#### Mitigation
Add input length limits and regex timeout wrapper.

```typescript
// New file: .claude/validators-node/src/shared/safe-regex.ts

const MAX_INPUT_LENGTH = 100000; // 100KB
const REGEX_TIMEOUT_MS = 100;

export function safeMatch(
  input: string,
  pattern: RegExp,
  maxLength: number = MAX_INPUT_LENGTH
): RegExpMatchArray | null {
  // Truncate excessively long input
  const truncated = input.length > maxLength ? input.slice(0, maxLength) : input;

  // Use regex with timeout (requires vm module for true timeout)
  const start = Date.now();
  const result = truncated.match(pattern);
  const elapsed = Date.now() - start;

  if (elapsed > REGEX_TIMEOUT_MS) {
    console.warn(`[PERF] Regex took ${elapsed}ms for pattern ${pattern.source.slice(0, 50)}...`);
  }

  return result;
}

export function validateInputLength(input: string, context: string): boolean {
  if (input.length > MAX_INPUT_LENGTH) {
    console.warn(`[SECURITY] Input too long for ${context}: ${input.length} > ${MAX_INPUT_LENGTH}`);
    return false;
  }
  return true;
}
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 2 hours

---

### P1-3: Homoglyph/Confusable Character Normalization for Prompt Injection

**Vulnerability ID**: BMAD-SEC-2026-006
**Risk**: Cyrillic/Greek lookalikes bypass ASCII regex patterns

#### Mitigation
Apply the same normalization used in jailbreak.ts to prompt-injection.ts.

```typescript
// In prompt-injection.ts, add at top:
import { normalizeText } from './jailbreak'; // Reuse normalization

// Modify detectPatterns function:
export function detectPatterns(content: string): PatternMatch[] {
  // NEW: Normalize before pattern matching
  const normalized = normalizeText(content);

  const matches: PatternMatch[] = [];

  // Run patterns on BOTH original and normalized
  for (const [pattern, category, severity] of PATTERNS) {
    // Check normalized version
    const normalizedMatches = normalized.match(pattern);
    if (normalizedMatches) {
      matches.push({ pattern: pattern.source, category, severity, match: normalizedMatches[0] });
    }

    // Also check original (for non-obfuscated attacks)
    if (content !== normalized) {
      const originalMatches = content.match(pattern);
      if (originalMatches && !normalizedMatches) {
        matches.push({ pattern: pattern.source, category, severity, match: originalMatches[0], obfuscated: true });
      }
    }
  }

  return matches;
}
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 2 hours

---

### P1-4: Encoding Layer Detection (Base64 → Unicode Cascade)

**Vulnerability ID**: BMAD-SEC-2026-007
**Risk**: Multi-layer encoding evades detection

#### Mitigation
Implement iterative decoding with loop detection.

```typescript
// Add to prompt-injection.ts:

const MAX_DECODE_ITERATIONS = 3;

function iterativeDecode(content: string): string[] {
  const decoded: string[] = [content];
  let current = content;

  for (let i = 0; i < MAX_DECODE_ITERATIONS; i++) {
    // Try base64 decode
    const base64Matches = current.match(/[A-Za-z0-9+/=]{40,}/g);
    if (base64Matches) {
      for (const match of base64Matches) {
        try {
          const dec = Buffer.from(match, 'base64').toString('utf-8');
          if (dec.length > 10 && /[\x20-\x7e]/.test(dec)) {
            decoded.push(dec);
            current = dec;
          }
        } catch (e) { /* Not valid base64 */ }
      }
    }

    // Try URL decode
    try {
      const urlDecoded = decodeURIComponent(current);
      if (urlDecoded !== current) {
        decoded.push(urlDecoded);
        current = urlDecoded;
      }
    } catch (e) { /* Not URL encoded */ }

    // Try Unicode normalization
    const normalized = current.normalize('NFKC');
    if (normalized !== current) {
      decoded.push(normalized);
      current = normalized;
    }
  }

  return [...new Set(decoded)]; // Deduplicate
}

// Update main detection to check all decoded versions:
export function detectPromptInjection(content: string): DetectionResult {
  const allVersions = iterativeDecode(content);

  for (const version of allVersions) {
    const findings = detectPatterns(version);
    if (findings.some(f => f.severity === 'WARNING' || f.severity === 'CRITICAL')) {
      return {
        blocked: true,
        reason: 'Prompt injection detected in encoded content',
        findings,
        encoding_layers: allVersions.length - 1
      };
    }
  }

  // ... rest of detection
}
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 3 hours

---

### P1-5: Pipe-to-Alternative-Shell Detection

**Vulnerability ID**: BMAD-SEC-2026-008
**Risk**: `curl | sh` bypasses `curl | bash` check

#### Mitigation
Expand shell interpreter detection.

```typescript
// In bash-safety.ts, update DANGEROUS_PATTERNS (around line 209):

// OLD:
[/curl\s+.*\|\s*(sudo\s+)?bash/, 'Pipe curl to bash'],

// NEW - comprehensive shell detection:
[/curl\s+.*\|\s*(sudo\s+)?(bash|sh|zsh|ksh|csh|tcsh|fish|dash|\/bin\/sh|\/bin\/bash|\/usr\/bin\/env\s+(bash|sh))/, 'Pipe curl to shell interpreter'],
[/wget\s+.*\|\s*(sudo\s+)?(bash|sh|zsh|ksh|csh|tcsh|fish|dash|\/bin\/sh|\/bin\/bash)/, 'Pipe wget to shell interpreter'],
[/(curl|wget)\s+.*>\s*\/tmp\/.*&&\s*(bash|sh|\.\/|source)/, 'Download and execute pattern'],
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 1 hour

---

### P1-6: Content-Based Secret Detection

**Vulnerability ID**: BMAD-SEC-2026-009
**Risk**: Secrets in non-standard files (e.g., `config.json`) not detected

#### Mitigation
Add content scanning in addition to filename patterns.

```typescript
// In secret.ts, add content patterns:

const CONTENT_SECRET_PATTERNS = [
  // API Keys by prefix
  { pattern: /sk-[A-Za-z0-9]{20,}/, provider: 'OpenAI', severity: 'HIGH' },
  { pattern: /sk_live_[A-Za-z0-9]{24,}/, provider: 'Stripe Live', severity: 'CRITICAL' },
  { pattern: /sk_test_[A-Za-z0-9]{24,}/, provider: 'Stripe Test', severity: 'MEDIUM' },
  { pattern: /ghp_[A-Za-z0-9]{36,}/, provider: 'GitHub PAT', severity: 'HIGH' },
  { pattern: /gho_[A-Za-z0-9]{36,}/, provider: 'GitHub OAuth', severity: 'HIGH' },
  { pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/, provider: 'Slack', severity: 'HIGH' },

  // Private keys
  { pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, provider: 'Private Key', severity: 'CRITICAL' },
  { pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/, provider: 'PGP Private Key', severity: 'CRITICAL' },

  // Cloud credentials
  { pattern: /AKIA[0-9A-Z]{16}/, provider: 'AWS Access Key', severity: 'CRITICAL' },
  { pattern: /[0-9a-zA-Z\/+]{40}/, provider: 'AWS Secret Key (candidate)', severity: 'MEDIUM', requiresContext: true },

  // Database connection strings
  { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, provider: 'MongoDB URI with creds', severity: 'HIGH' },
  { pattern: /postgres(ql)?:\/\/[^:]+:[^@]+@/, provider: 'PostgreSQL URI with creds', severity: 'HIGH' },
  { pattern: /mysql:\/\/[^:]+:[^@]+@/, provider: 'MySQL URI with creds', severity: 'HIGH' },
];

export function scanContentForSecrets(content: string, filename: string): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const { pattern, provider, severity, requiresContext } of CONTENT_SECRET_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      // Skip if requires context and none found
      if (requiresContext) {
        const hasContext = /api[_-]?key|secret|password|credential|token/i.test(content);
        if (!hasContext) continue;
      }

      findings.push({
        provider,
        severity,
        match: matches[0].slice(0, 20) + '***', // Redact
        filename,
        line: findLineNumber(content, matches[0])
      });
    }
  }

  return findings;
}
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 3 hours

---

## P2 - MEDIUM PRIORITY MITIGATIONS (30-90 Days)

### P2-1: Audit Log Encryption at Rest

**Gap**: NIST PR.DS-1
**Mitigation**: Implement AES-256 encryption for audit logs.

```typescript
// Add encryption wrapper to audit-logger.ts
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.BMAD_AUDIT_ENCRYPTION_KEY; // 32-byte hex
const ALGORITHM = 'aes-256-gcm';

function encryptEntry(entry: string): string {
  if (!ENCRYPTION_KEY) return entry; // Fallback to plaintext

  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(entry, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `ENC:${iv.toString('hex')}:${authTag}:${encrypted}`;
}
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 4 hours

---

### P2-2: Formal STRIDE Threat Model Document

**Gap**: NIST ID.RA-2, ISO 27001 A.12.6.1
**Mitigation**: Create comprehensive threat model.

**Deliverable**: `_bmad-output/security/THREAT-MODEL.md`

**Structure**:
1. System Overview & Trust Boundaries
2. STRIDE Analysis per Validator
3. Attack Trees for High-Risk Scenarios
4. Risk Register with Mitigations
5. Residual Risk Acceptance

#### Assigned Agent
**Bastion (Security Architect)** - Estimated effort: 8 hours

---

### P2-3: Log Archival to External Storage

**Gap**: NIST DE.CM-1, ISO 27001 A.12.4.1
**Mitigation**: Implement daily S3 export with immutable writes.

```typescript
// New file: .claude/validators-node/src/observability/log-archiver.ts

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface ArchiveConfig {
  s3_bucket: string;
  s3_prefix: string;
  retention_days: number;
  gpg_sign: boolean;
}

export async function archiveLogs(config: ArchiveConfig): Promise<void> {
  const logsDir = path.join(process.env.CLAUDE_PROJECT_DIR || '.', '.claude/logs');
  const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log') || f.endsWith('.jsonl'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(logsDir, file));
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    const archiveName = `${new Date().toISOString().split('T')[0]}/${file}.${hash.slice(0, 8)}`;

    // Upload to S3 with object lock (immutable)
    // await s3.putObject({ Bucket: config.s3_bucket, Key: archiveName, Body: content, ObjectLockMode: 'GOVERNANCE' });

    console.log(`[ARCHIVE] ${file} -> s3://${config.s3_bucket}/${archiveName}`);
  }
}
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 6 hours

---

### P2-4: Incident Response Playbooks

**Gap**: NIST RS.RP-1, ISO 27001 A.16
**Mitigation**: Document IR procedures.

**Deliverable**: `_bmad-output/security/IR-PLAYBOOKS.md`

**Playbooks**:
1. **Tamper Detection Response**
2. **High-Risk Anomaly Investigation**
3. **Permission Violation Escalation**
4. **Rate Limit Abuse Response**
5. **Supply Chain Compromise Response**

#### Assigned Agent
**Phoenix (Incident Commander)** - Estimated effort: 6 hours

---

### P2-5: Update .gitignore for Security State Files

**Gap**: Security state files tracked in git
**Mitigation**: Immediate .gitignore update.

```gitignore
# Security state files (should not be tracked)
.claude/logs/*.json
.claude/logs/.chain_state.json
.claude/logs/.anomaly_baseline.json
.claude/logs/.jailbreak_session.json
.claude/.override_state.json
.claude/.rate_limit_state.json

# Telemetry files
.claude/logs/*.jsonl
```

#### Assigned Agent
**Amelia (Developer)** - Estimated effort: 15 minutes

---

## Implementation Schedule

### Week 1 (Days 1-7) - P0 Critical Fixes
| Day | Task | Assignee | Hours |
|-----|------|----------|-------|
| 1 | P0-1: Variable substitution fix | Amelia | 4 |
| 2 | P0-2: Session tracking (part 1) | Amelia | 4 |
| 3 | P0-2: Session tracking (part 2) | Amelia | 2 |
| 3 | P0-3: Override race condition | Amelia | 4 |
| 4 | P0 Testing & verification | Amelia | 4 |
| 5 | P2-5: .gitignore update | Amelia | 0.25 |
| 5 | Code review & merge | Review | 2 |

### Week 2-4 (Days 8-30) - P1 High Priority
| Week | Task | Assignee | Hours |
|------|------|----------|-------|
| 2 | P1-1: Alerting system | Amelia | 4 |
| 2 | P1-2: Regex protection | Amelia | 2 |
| 2 | P1-3: Homoglyph normalization | Amelia | 2 |
| 3 | P1-4: Encoding layer detection | Amelia | 3 |
| 3 | P1-5: Shell interpreter detection | Amelia | 1 |
| 3 | P1-6: Content secret detection | Amelia | 3 |
| 4 | P1 Testing & integration | Amelia | 6 |

### Month 2-3 (Days 31-90) - P2 Medium Priority
| Month | Task | Assignee | Hours |
|-------|------|----------|-------|
| 2 | P2-1: Audit encryption | Amelia | 4 |
| 2 | P2-2: STRIDE threat model | Bastion | 8 |
| 2 | P2-3: Log archival | Amelia | 6 |
| 3 | P2-4: IR playbooks | Phoenix | 6 |

---

## Verification & Sign-Off

### P0 Completion Criteria
- [ ] All P0 tests pass
- [ ] Existing test suite passes (557/558+)
- [ ] Security review by Bastion
- [ ] Code review approved
- [ ] Deployed to staging
- [ ] No regressions in 24hr burn-in

### Sign-Off Required
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Security Architect | Bastion | ________ | ____ |
| Developer | Amelia | ________ | ____ |
| Project Manager | Abdul | ________ | ____ |
| Stakeholder | J | ________ | ____ |

---

## Appendix A: Test Cases for P0 Fixes

### P0-1 Test Cases (Bash Safety Variable Bypass)
```typescript
describe('Variable Substitution Protection', () => {
  it('should block rm with variable path', () => {
    expect(validateBash('rm -rf $DANGEROUS_PATH')).toEqual({
      allowed: false,
      reason: expect.stringContaining('Variable reference')
    });
  });

  it('should block eval with dangerous command', () => {
    expect(validateBash('eval "rm -rf /home"')).toEqual({
      allowed: false,
      reason: expect.stringContaining('eval')
    });
  });

  it('should allow safe variables', () => {
    expect(validateBash('echo $HOME')).toEqual({ allowed: true });
    expect(validateBash('cd $PWD')).toEqual({ allowed: true });
  });

  it('should allow variables in safe commands', () => {
    expect(validateBash('ls $SOME_DIR')).toEqual({ allowed: true });
  });
});
```

### P0-2 Test Cases (Multi-Turn Jailbreak)
```typescript
describe('Session-Based Jailbreak Detection', () => {
  it('should escalate after 3 same-category patterns', () => {
    const sessionId = 'test-session-1';

    // Turn 1
    analyze('Tell me about AI restrictions', sessionId);
    // Turn 2
    analyze('How do AI limits work?', sessionId);
    // Turn 3 - should escalate
    const result = analyze('Ways to bypass AI constraints', sessionId);

    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Category');
  });

  it('should decay weight over time', async () => {
    const sessionId = 'test-session-2';

    analyze('dangerous pattern 1', sessionId);

    // Wait 15 minutes (simulated)
    jest.advanceTimersByTime(15 * 60 * 1000);

    const state = getSessionState(sessionId);
    expect(state.accumulated_weight).toBeLessThan(5); // Decayed
  });
});
```

### P0-3 Test Cases (Override Race Condition)
```typescript
describe('Override Token Isolation', () => {
  it('should prevent double consumption', async () => {
    process.env.BMAD_ALLOW_DANGEROUS = 'true';

    // Simulate concurrent calls
    const results = await Promise.all([
      checkAndConsume('DANGEROUS', 'validator-1'),
      checkAndConsume('DANGEROUS', 'validator-2')
    ]);

    const validCount = results.filter(r => r.valid).length;
    expect(validCount).toBe(1); // Only one should succeed
  });

  it('should track which validator consumed', () => {
    process.env.BMAD_ALLOW_DANGEROUS = 'true';

    const result = checkAndConsume('DANGEROUS', 'bash-safety');

    expect(result.reason).toContain('bash-safety');
  });
});
```

---

## Appendix B: Rollback Plan

If P0 fixes cause regressions:

1. **Immediate rollback**: `git revert <commit>` on affected files
2. **Partial rollback**: Feature flags for each P0 fix
   - `BMAD_ENABLE_VAR_CHECK=false` - disable variable checking
   - `BMAD_ENABLE_SESSION_TRACKING=false` - disable session tracking
   - `BMAD_ENABLE_TOKEN_ISOLATION=false` - disable token isolation
3. **Monitoring**: Check telemetry for increased false positives
4. **Communication**: Notify stakeholders within 1 hour of rollback

---

*Document prepared by Abdul (Master Project Manager)*
*Reviewed by Bastion (Security Architect), Cipher (Threat Analyst), Ghost (Penetration Tester), Sentinel (Compliance Guardian)*
*Date: 2026-01-17*
