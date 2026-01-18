# Epic: P1 High Priority Security Fixes

**Epic ID**: EPIC-SEC-002
**Priority**: P1 - HIGH
**Timeline**: Days 8-30
**Status**: Pending (Blocked by EPIC-SEC-001)

---

## Epic Summary

Address six high-priority security gaps that represent significant risks requiring resolution within 30 days. These include alerting infrastructure, regex DoS protection, encoding bypass prevention, and enhanced secret detection.

## Business Value

- **Observability**: Real-time alerting for critical security events
- **Resilience**: Protection against DoS via crafted inputs
- **Defense Depth**: Multiple layers of bypass prevention
- **Compliance**: NIST RS.CO-2 (notification of security events)

## Success Criteria

- [ ] All 6 P1 vulnerabilities addressed
- [ ] Alerting system functional with webhook integration
- [ ] Encoding bypass tests passing
- [ ] Secret detection covers API keys in any file type
- [ ] Performance remains within acceptable limits

## Dependencies

- **EPIC-SEC-001** must be completed first
- Webhook URL for alerting (provided by infrastructure team)

## Team Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead Developer | Amelia | Code implementation |
| Security Reviewer | Weaver | Injection mitigation review |
| Threat Validation | Cipher | Pattern bypass testing |
| Test Architect | Murat | Test coverage |

---

## Stories

### Story SEC-002-1: Critical Event Alerting System

**Priority**: P1
**Estimated Effort**: 4 hours
**Assigned To**: Amelia

#### User Story
As a security operations team member, I want to receive real-time alerts when critical security events occur so that I can respond to threats immediately.

#### Acceptance Criteria
- [ ] Alerting module sends webhooks for CRITICAL events
- [ ] Configurable alert level threshold via `BMAD_ALERT_LEVEL`
- [ ] Slack-compatible message format with structured blocks
- [ ] Fallback to console.error when webhook unavailable
- [ ] Integration points in: audit-integrity, bash-safety, jailbreak, anomaly-detector
- [ ] Alert includes: timestamp, severity, event type, validator name, details

#### Technical Details
- **New File**: `.claude/validators-node/src/shared/alerting.ts`
- **Integration Points**:
  - `audit-integrity.ts`: Alert on hash chain mismatch
  - `bash-safety.ts`: Alert on ABSOLUTE blocks
  - `jailbreak.ts`: Alert on CRITICAL severity
  - `anomaly-detector.ts`: Alert when z-score > 4
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P1-1

#### Definition of Done
- [ ] Alerting module implemented
- [ ] All integration points connected
- [ ] Mock webhook tests passing
- [ ] Code reviewed
- [ ] Merged to branch

---

### Story SEC-002-2: Regex Catastrophic Backtracking Protection

**Priority**: P1
**Estimated Effort**: 2 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want input length limits and regex timeout protection so that crafted inputs cannot cause validator hangs via regex backtracking.

#### Acceptance Criteria
- [ ] Input truncated at 100KB before regex processing
- [ ] Regex execution time logged if >100ms
- [ ] `safeMatch` wrapper available for all validators
- [ ] Performance warning in logs for slow regexes
- [ ] No functionality changes for normal-sized inputs

#### Technical Details
- **New File**: `.claude/validators-node/src/shared/safe-regex.ts`
- **Constants**:
  - `MAX_INPUT_LENGTH = 100000` (100KB)
  - `REGEX_TIMEOUT_MS = 100`
- **Usage**: Replace direct `.match()` calls with `safeMatch()` in high-risk validators
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P1-2

#### Definition of Done
- [ ] Safe regex module implemented
- [ ] Integration in prompt-injection and jailbreak validators
- [ ] Performance tests passing
- [ ] Code reviewed
- [ ] Merged to branch

---

### Story SEC-002-3: Homoglyph/Confusable Character Normalization

**Priority**: P1
**Estimated Effort**: 2 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want prompt injection detection to normalize confusable characters so that Cyrillic/Greek lookalikes cannot bypass ASCII pattern matching.

#### Acceptance Criteria
- [ ] Prompt injection uses same normalization as jailbreak.ts
- [ ] Both original and normalized content checked
- [ ] Obfuscated attacks flagged with `obfuscated: true`
- [ ] Cyrillic "а" (U+0430) normalized to ASCII "a"
- [ ] Greek "ο" (U+03BF) normalized to ASCII "o"
- [ ] No false positives on legitimate Unicode text

#### Technical Details
- **File**: `.claude/validators-node/src/validators/ai-safety/prompt-injection.ts`
- **Import**: `normalizeText` from `./jailbreak`
- **Approach**: Run patterns on both original and normalized, flag obfuscated attacks
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P1-3

#### Definition of Done
- [ ] Normalization applied to prompt-injection
- [ ] Test cases for Cyrillic/Greek bypass attempts
- [ ] Code reviewed by Cipher
- [ ] Merged to branch

---

### Story SEC-002-4: Multi-Layer Encoding Detection

**Priority**: P1
**Estimated Effort**: 3 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want iterative decoding of base64, URL, and Unicode encodings so that multi-layer encoded payloads are detected.

#### Acceptance Criteria
- [ ] Base64 encoded payloads detected up to 3 layers deep
- [ ] URL encoded payloads decoded and checked
- [ ] Unicode NFKC normalization applied
- [ ] Loop detection prevents infinite decode cycles
- [ ] `encoding_layers` count included in detection result
- [ ] Minimum 40-character base64 strings checked (avoid false positives)

#### Technical Details
- **File**: `.claude/validators-node/src/validators/ai-safety/prompt-injection.ts`
- **New Function**: `iterativeDecode(content: string): string[]`
- **Constants**:
  - `MAX_DECODE_ITERATIONS = 3`
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P1-4

#### Definition of Done
- [ ] Iterative decode function implemented
- [ ] Integration in prompt injection detector
- [ ] Test cases for nested encoding
- [ ] Code reviewed
- [ ] Merged to branch

---

### Story SEC-002-5: Expanded Shell Interpreter Detection

**Priority**: P1
**Estimated Effort**: 1 hour
**Assigned To**: Amelia

#### User Story
As a security engineer, I want `curl | sh` and other shell variants blocked so that attackers cannot bypass `curl | bash` detection using alternative interpreters.

#### Acceptance Criteria
- [ ] `curl ... | sh` blocked
- [ ] `wget ... | zsh` blocked
- [ ] `curl ... | /bin/sh` blocked
- [ ] `wget ... | /usr/bin/env bash` blocked
- [ ] Download-and-execute patterns blocked (`curl > /tmp/x && ./x`)
- [ ] Existing `curl | bash` tests still pass

#### Technical Details
- **File**: `.claude/validators-node/src/validators/guards/bash-safety.ts`
- **Update**: `DANGEROUS_PATTERNS` array (around line 209)
- **New Patterns**:
  - Expanded shell list: `bash|sh|zsh|ksh|csh|tcsh|fish|dash`
  - Path variants: `/bin/sh|/bin/bash|/usr/bin/env`
  - Download-execute: `>.*&&.*(bash|sh|\.\/|source)`
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P1-5

#### Definition of Done
- [ ] Pattern list expanded
- [ ] Test cases for all variants
- [ ] No regressions in existing tests
- [ ] Merged to branch

---

### Story SEC-002-6: Content-Based Secret Detection

**Priority**: P1
**Estimated Effort**: 3 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want secrets detected by content pattern regardless of filename so that API keys in `config.json` or arbitrary files are caught.

#### Acceptance Criteria
- [ ] OpenAI `sk-` keys detected
- [ ] Stripe live/test keys detected
- [ ] GitHub PAT/OAuth tokens detected
- [ ] Slack tokens detected
- [ ] Private keys (RSA, EC, PGP) detected
- [ ] AWS access keys detected
- [ ] Database URIs with credentials detected
- [ ] Partial matches redacted in output (`sk-abc***`)
- [ ] Context-required patterns (e.g., AWS secret) only trigger near keywords

#### Technical Details
- **File**: `.claude/validators-node/src/validators/guards/secret.ts`
- **New Function**: `scanContentForSecrets(content: string, filename: string): SecretFinding[]`
- **Patterns**: 13 provider-specific patterns with severity levels
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P1-6

#### Definition of Done
- [ ] Content scanning function implemented
- [ ] Integration in file write validator
- [ ] Test cases for each provider pattern
- [ ] Code reviewed by Weaver
- [ ] Merged to branch

---

### Story SEC-002-7: P1 Integration Testing

**Priority**: P1
**Estimated Effort**: 6 hours
**Assigned To**: Murat

#### User Story
As the test architect, I want comprehensive integration tests for all P1 fixes so that we verify the security improvements work correctly together.

#### Acceptance Criteria
- [ ] Alerting system integration tests
- [ ] Regex protection performance benchmarks
- [ ] Encoding bypass test suite
- [ ] Secret detection test matrix by provider
- [ ] Full regression suite passes
- [ ] Attack simulation by Cipher/Ghost

#### Definition of Done
- [ ] All integration tests passing
- [ ] Attack simulation report from Ghost
- [ ] Sign-off from Murat, Weaver
- [ ] Ready for staging deployment

---

## Metrics

- **Vulnerability Closure**: 6/6 P1 issues resolved
- **Alert Coverage**: 100% of CRITICAL events
- **Regex Performance**: <100ms per validation
- **Secret Detection**: 95%+ recall on known patterns

---

*Epic created by Abdul (Master Project Manager)*
*Date: 2026-01-18*
