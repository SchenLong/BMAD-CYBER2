# Epic: P0 Critical Security Fixes

**Epic ID**: EPIC-SEC-001
**Priority**: P0 - CRITICAL
**Timeline**: Days 1-7
**Status**: Ready for Development

---

## Epic Summary

Address three critical security vulnerabilities with immediate exploitation risk identified in the Node.js validators security audit. These fixes must be completed within 7 days as they represent active attack vectors.

## Business Value

- **Risk Mitigation**: Closes 3 exploitable attack vectors
- **Compliance**: Addresses NIST DE.AE-1 (anomaly detection), NIST RS.AN-3 (severity assignment)
- **Security Posture**: Prevents bash command injection, multi-turn jailbreak accumulation, and override token race conditions

## Success Criteria

- [ ] All 3 P0 vulnerabilities patched with tests
- [ ] Existing test suite passes (557+ tests)
- [ ] Security review approved by Bastion
- [ ] 24-hour burn-in with no regressions
- [ ] Telemetry shows no false positive increase

## Dependencies

- None - can start immediately
- Requires access to `.claude/validators-node/` codebase

## Team Assignment

| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead Developer | Amelia | Code implementation |
| Security Reviewer | Bastion | Code review & threat validation |
| Test Validation | Murat | Test coverage verification |
| Offensive Testing | Ghost | Attack simulation |

---

## Stories

### Story SEC-001-1: Variable Substitution Bypass Fix

**Priority**: P0
**Estimated Effort**: 4 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want bash commands with unresolved variables in dangerous operations to be blocked so that attackers cannot bypass path protections using environment variables.

#### Acceptance Criteria
- [ ] `rm -rf $DANGEROUS_PATH` returns BLOCKED
- [ ] `eval "rm -rf /home"` returns BLOCKED
- [ ] `rm -rf $HOME/safe/path` returns ALLOWED (safe variable allowlist)
- [ ] `echo $PATH` returns ALLOWED (non-dangerous command)
- [ ] All existing bash-safety tests pass
- [ ] New test file with 10+ test cases for variable bypass scenarios

#### Technical Details
- **File**: `.claude/validators-node/src/validators/guards/bash-safety.ts`
- **Lines**: 133-135, 151-152
- **Approach**: Implement safe variable allowlist; block unresolved variables in rm/chmod/chown commands
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P0-1

#### Definition of Done
- [ ] Code implemented per mitigation plan
- [ ] Unit tests written and passing
- [ ] Code reviewed by Bastion
- [ ] Merged to branch

---

### Story SEC-001-2: Multi-Turn Jailbreak Session Tracking

**Priority**: P0
**Estimated Effort**: 6 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want the jailbreak detector to track patterns across conversation turns so that gradual escalation attacks are detected before reaching dangerous thresholds.

#### Acceptance Criteria
- [ ] 3 turns with same jailbreak category triggers escalation
- [ ] Accumulated weight >15 triggers escalation
- [ ] 10+ minute gap applies temporal decay (weight halves)
- [ ] Different session IDs are isolated
- [ ] Single-turn detection still works correctly
- [ ] Session state persists across validator invocations

#### Technical Details
- **New File**: `.claude/validators-node/src/validators/ai-safety/session-tracker.ts`
- **Modified File**: `.claude/validators-node/src/validators/ai-safety/jailbreak.ts`
- **Key Constants**:
  - `DECAY_HALF_LIFE_MS = 600000` (10 minutes)
  - `ACCUMULATION_THRESHOLD = 15`
  - `CATEGORY_REPEAT_THRESHOLD = 3`
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P0-2

#### Definition of Done
- [ ] Session tracker module implemented
- [ ] Jailbreak.ts integrated with session tracking
- [ ] Unit tests for all acceptance criteria
- [ ] Code reviewed by Bastion + Cipher
- [ ] Merged to branch

---

### Story SEC-001-3: Override Token Race Condition Fix

**Priority**: P0
**Estimated Effort**: 4 hours
**Assigned To**: Amelia

#### User Story
As a security engineer, I want override tokens to be atomically consumed with validator identification so that concurrent processes cannot both claim the same single-use override.

#### Acceptance Criteria
- [ ] Concurrent calls from different validators - only first succeeds
- [ ] Same validator cannot consume twice
- [ ] Token expiration after 5 minutes works correctly
- [ ] Lock timeout (>10s) handled gracefully with clear error
- [ ] Audit log shows which validator consumed token
- [ ] No deadlock possible in concurrent scenarios

#### Technical Details
- **File**: `.claude/validators-node/src/validators/shared/override-manager.ts`
- **Lines**: 235-240 (replace checkAndConsume function)
- **Key Changes**:
  - Add `OverrideToken` interface with `consumed_by` tracking
  - Extend lock timeout to 10 seconds
  - Implement atomic compare-and-swap pattern
- **Reference**: SECURITY-MITIGATION-PLAN.md Section P0-3

#### Definition of Done
- [ ] Override manager updated with token isolation
- [ ] Concurrent access tests passing
- [ ] Code reviewed by Bastion
- [ ] Merged to branch

---

### Story SEC-001-4: P0 Integration Testing & Verification

**Priority**: P0
**Estimated Effort**: 4 hours
**Assigned To**: Murat (with Ghost)

#### User Story
As the test architect, I want comprehensive integration tests validating all P0 fixes so that we can verify the fixes work together without regressions.

#### Acceptance Criteria
- [ ] Integration test suite covering all P0 scenarios
- [ ] Attack simulation tests by Ghost pass
- [ ] Full test suite passes (557+ tests)
- [ ] No new false positives in baseline commands
- [ ] Performance benchmarks within acceptable range (<10ms overhead)
- [ ] 24-hour burn-in log shows no anomalies

#### Technical Details
- Run existing test suite + new tests
- Ghost performs manual attack simulations
- Verify telemetry/logging captures all blocked attempts
- Reference: Appendix A test cases in mitigation plan

#### Definition of Done
- [ ] Integration tests written and passing
- [ ] Ghost attack simulation report submitted
- [ ] Sign-off from Murat, Ghost, Bastion
- [ ] Ready for staging deployment

---

### Story SEC-001-5: .gitignore Security State Files Update

**Priority**: P0 (Quick Win)
**Estimated Effort**: 15 minutes
**Assigned To**: Amelia

#### User Story
As a security engineer, I want security state files excluded from git so that sensitive session data and rate limit states are not accidentally committed.

#### Acceptance Criteria
- [ ] All security state files listed in .gitignore
- [ ] Existing tracked files removed from git index
- [ ] Verification that `git status` no longer shows state files

#### Technical Details
Add to `.claude/.gitignore`:
```gitignore
# Security state files
logs/*.json
logs/.chain_state.json
logs/.anomaly_baseline.json
logs/.jailbreak_session.json
.override_state.json
.rate_limit_state.json
logs/*.jsonl
```

#### Definition of Done
- [ ] .gitignore updated
- [ ] `git rm --cached` run on any tracked state files
- [ ] Committed to branch

---

## Rollback Plan

If P0 fixes cause regressions:
1. **Immediate rollback**: `git revert <commit>` on affected files
2. **Feature flags available**:
   - `BMAD_ENABLE_VAR_CHECK=false`
   - `BMAD_ENABLE_SESSION_TRACKING=false`
   - `BMAD_ENABLE_TOKEN_ISOLATION=false`
3. **Communication**: Notify J within 1 hour of rollback decision

---

## Metrics

- **Vulnerability Closure**: 3/3 P0 issues resolved
- **Test Coverage**: Maintain >85% on modified files
- **False Positive Rate**: <1% increase from baseline
- **Performance**: <10ms additional latency per validation

---

*Epic created by Abdul (Master Project Manager)*
*Date: 2026-01-18*
