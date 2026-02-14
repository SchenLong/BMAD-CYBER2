# Plan: Review and Re-enable Skipped Tests

**Created:** 2026-02-14
**Status:** Pending
**Target:** Reduce 87 skipped tests to ~79 by re-enabling questionable skips

---

## Context

The codebase currently has **87 skipped tests** across 11 test files. Analysis shows that most skips are legitimate (post-migration, archived content, environment-dependent), but **8 tests (9%) are questionable** and should either be re-enabled or properly justified.

## Current State

### Skip Breakdown

| Category | Count | Percentage |
|----------|-------|------------|
| **Legitimate skips** | 79 | 91% |
| **Questionable skips** | 8 | 9% |

### Legitimate Skips (79 tests)

| File | Skips | Reason |
|------|-------|--------|
| `tests/migration/directory-migration.test.js` | 48 | Post-migration - _bmad/ directories moved to src/ |
| `tests/migration/directory-structure.test.js` | 2 | Post-migration verification |
| `tests/security-assessment/sa05-repo-cicd-security.test.js` | 13 | Manual gh auth required, Sigstore not implemented |
| `tests/security-assessment/sa06-compliance-gap.test.ts` | 7 | Archived files, provenance not implemented |
| `tools/npx/__tests__/install.e2e.test.js` | 3 | Network-dependent, run on-demand only |
| `dev-tools/validators-node/common/session-context.test.ts` | 3 | Module resolution issues in vitest |
| `dev-tools/validators-node/ai-safety/session-tracker-p0-verification.test.ts` | 1 | Race condition in test environment |

### Questionable Skips Requiring Action (8 tests)

| File | Tests | Issue | Priority |
|------|-------|-------|----------|
| `tests/utility/tools/installer/bin/setup-wizard.test.js` | 4 | Tests expect failures but wizard now succeeds | Medium |
| `tools/npx/__tests__/extractor.test.js` | 4 | Tests outdated for simplified interaction model | Medium |
| `tests/quality/eslint-config.test.js` | 1 | Critical quality test skipped with no clear reason | **High** |
| `tests/security-assessment/sa02-static-analysis.test.js` | 1 | Critical security test skipped | **High** |

---

## Implementation Plan

### Step 1: Investigate Critical Skipped Tests (High Priority)

**Files:**
- `tests/quality/eslint-config.test.js`
- `tests/security-assessment/sa02-static-analysis.test.js`

**Actions:**
1. Read both test files to understand skip reasons
2. Run `npm run lint` to verify ESLint status
3. If lint passes: Re-enable tests
4. If lint fails: Document specific violations and why they're tolerated

**Expected outcome:** Both critical tests re-enabled and passing

### Step 2: Update setup-wizard Tests (Medium Priority)

**File:** `tests/utility/tools/installer/bin/setup-wizard.test.js`

**Issue:** 4 tests skipped because they expect failure scenarios, but the wizard now succeeds in force mode.

**Actions:**
1. Locate the 4 skipped test cases (search for `.skip(`)
2. Update test expectations from failure to success
3. Remove `.skip()` directives
4. Run tests to verify

**Expected outcome:** 4 tests re-enabled and passing

### Step 3: Update extractor Tests (Medium Priority)

**File:** `tools/npx/__tests__/extractor.test.js`

**Issue:** 4 tests skipped due to "simplified user interaction" - conflict detection tests no longer prompt users.

**Actions:**
1. Read the skipped conflict detection tests
2. Update tests to reflect new interaction model (no prompts, direct handling)
3. Remove `.skip()` directives
4. Run tests to verify

**Expected outcome:** 4 tests re-enabled and passing

### Step 4: Document All Legitimate Skips

**File to create:** `team/test-skips.md`

**Template:**
```markdown
# Test Skips Documentation

## Legitimate Skips (79 tests)

### Post-Migration Tests (50 tests)
- **File:** tests/migration/directory-migration.test.js
- **Count:** 48
- **Reason:** _bmad/ module directories moved to src/ in previous migration
- **Status:** NEVER - These tests verify completed work

### Archived Content (7 tests)
- **File:** tests/security-assessment/sa06-compliance-gap.test.ts
- **Count:** 7
- **Reason:** Files archived to ~/bmad-archives/v2.3.0-pre-audit-20260213/
- **Status:** NEVER - Content preserved in archive

[... continue for all skip categories ...]
```

**Actions:**
1. Document all 79 legitimate skips
2. Include file paths, test names, and reasons
3. Add expected resolution (NEVER, PENDING-FEATURE, etc.)

### Step 5: Add Standardized Skip Comments

For any remaining skips, add standardized comments:

```javascript
describe.skip('feature name', () => {
  // SKIP: [ARCHIVED | POST-MIGRATION | NETWORK-DEPENDENT | ENV-DEPENDENT]
  // STATUS: [NEVER | PENDING | WONT-FIX]
  // LAST_REVIEWED: 2026-02-14
});
```

---

## Files to Modify

1. `tests/quality/eslint-config.test.js` - Re-enable or document skip
2. `tests/security-assessment/sa02-static-analysis.test.js` - Re-enable or document skip
3. `tests/utility/tools/installer/bin/setup-wizard.test.js` - Update 4 tests
4. `tools/npx/__tests__/extractor.test.js` - Update 4 tests
5. `team/test-skips.md` - **CREATE** - Document all legitimate skips

---

## Verification

After completing all steps:

1. Run full test suite: `npm test`
2. Verify skip count reduced from 87 to ~79
3. Verify no new test failures
4. Verify the 8 previously-questionable tests now pass
5. Review `team/test-skips.md` for completeness

---

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| Total skips | 87 | 79 |
| Passing tests | 7485 | 7493 |
| Questionable skips | 8 | 0 |
| Documented skips | 0 | 79 |

---

## References

- Test config: `vitest.config.ts`
- Test setup: `tests/vitest-setup.js`
- Lessons learned: `team/lessonslearned.md`
