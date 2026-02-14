# Test Skips Documentation

**Generated:** 2026-02-14
**Current Skip Count:** 84 tests
**Files with Skips:** 10

## Summary

| Category | Count | Percentage |
|----------|-------|------------|
| **Post-migration** | 50 | 59.5% |
| **Security - Not Implemented** | 13 | 15.5% |
| **Archived Content** | 7 | 8.3% |
| **ESLint Violations** | 2 | 2.4% |
| **Network-Dependent** | 3 | 3.6% |
| **Module Resolution Issues** | 3 | 3.6% |
| **Mock Infrastructure** | 4 | 4.8% |
| **Race Conditions** | 1 | 1.2% |
| **Removed Obsolete Tests** | 1 | 1.2% |

---

## Legitimate Skips (84 tests)

### Post-Migration Tests (50 tests)

**File:** `tests/migration/directory-migration.test.js`
**Count:** 48
**Reason:** _bmad/ module directories moved to src/ in previous migration
**Status:** NEVER - These tests verify completed work
**Tests:** All describe blocks and it tests under "Post-migration — _bmad/ module directories no longer exist (moved to src/)"

---

**File:** `tests/migration/directory-structure.test.js`
**Count:** 2
**Reason:** Post-migration verification
**Status:** NEVER - Tests for old _bmad/ directory structure
**Tests:**
- should not have any module directories under _bmad/
- should only have preserved directories under _bmad/

---

### Security - Not Implemented (13 tests)

**File:** `tests/security-assessment/sa05-repo-cicd-security.test.js`
**Count:** 13
**Reason:** Manual gh auth required, Sigstore not implemented
**Status:** PENDING-FEATURE - Waiting for Sigstore implementation
**Tests:**
- Branch protection (manual verification required)
- npm publish security (consolidated into release.yml)
- Sigstore for signing (not implemented)
- Sigstore action SHA-pinning (not implemented)
- Signing step continue-on-error (not implemented)
- Quality gate before release (release triggered by tag push)
- Sigstore bundles upload (not implemented)
- Quality-gate required by release (release triggered by tag push)

---

### Archived Content (7 tests)

**File:** `tests/security-assessment/sa06-compliance-gap.test.ts`
**Count:** 7
**Reason:** Files archived to ~/bmad-archives/v2.3.0-pre-audit-20260213/
**Status:** NEVER - Content preserved in archive
**Tests:**
- 6.19.1 Backup tags (public release)
- 6.21 Provenance generated — SLSA L2
- 6.23 Evidence index exists (ARCHIVED)
- 6.24 Compliance assessment document (ARCHIVED)
- 3 additional describe blocks (lines 416, 441, 457)

---

### ESLint Violations (2 tests)

**File:** `tests/quality/eslint-config.test.js`
**Count:** 1
**Reason:** Codebase has 78 ESLint violations (76 errors, 2 warnings) to be resolved
**Status:** PENDING - See team/test-skip-review-plan.md Step 1
**Skip Comment Added:** Yes
**Test:** npm run lint exits with 0 (no errors, no warnings)

---

**File:** `tests/security-assessment/sa02-static-analysis.test.js`
**Count:** 1
**Reason:** Codebase has 78 ESLint violations (76 errors, 2 warnings) to be resolved
**Status:** PENDING - See team/test-skip-review-plan.md Step 1
**Skip Comment Added:** Yes
**Test:** npx eslint src/ exits with 0 (no violations)

---

### Network-Dependent (3 tests)

**File:** `tools/npx/__tests__/install.e2e.test.js`
**Count:** 3
**Reason:** Network-dependent, run on-demand only
**Status:** ON-DEMAND - Requires network access to npm registry
**Tests:**
- Complete install in new directory
- 2 additional it tests within skipped describe block

---

### Module Resolution Issues (3 tests)

**File:** `dev-tools/validators-node/common/session-context.test.ts`
**Count:** 3
**Reason:** Module resolution issues in vitest
**Status:** PENDING - Requires vitest config fix for .ts files in dev-tools/
**Tests:**
- Integration with OverrideManager (entire describe block)
- 2 additional it tests within skipped describe block

---

### Mock Infrastructure Issue (4 tests)

**File:** `tools/npx/__tests__/extractor.test.js`
**Count:** 4
**Reason:** Tests timeout because vi.mock() on select doesn't prevent actual prompts
**Status:** BREAKER - Cannot re-enable without fixing mock setup
**Skip Comments Added:** Yes
**Tests:**
- detects existing files
- prompts user when conflicts exist and force is false
- overwrites files when user selects overwrite
- cancels extraction when user selects cancel

**Issue Detail:** The vi.mock() on '../../../src/utility/cli/prompts.js' select function doesn't properly mock the import, causing tests to wait for actual terminal input (30s timeout).

---

### Race Condition (1 test)

**File:** `dev-tools/validators-node/ai-safety/session-tracker-p0-verification.test.ts`
**Count:** 1
**Reason:** Race condition in test environment
**Status:** PENDING - Needs test isolation fix
**Test:** should work end-to-end with jailbreak analyzer

---

## Change Log

### 2026-02-14 - Test Skip Review
- **Before:** 87 skips
- **After:** 84 skips
- **Changes:**
  - setup-wizard.test.js: Removed 3 obsolete tests, re-enabled 1 (net -2)
  - eslint-config.test.js: Added standardized skip comment
  - sa02-static-analysis.test.js: Added standardized skip comment
  - extractor.test.js: Added standardized skip comments to all 4 tests
  - Created team/test-skips.md

---

## Standardized Skip Format

For any new skips, use this format:

```javascript
// SKIP: [CATEGORY]
// STATUS: [PENDING | NEVER | ON-DEMAND | BREAKER | PENDING-FEATURE]
// LAST_REVIEWED: YYYY-MM-DD
// ISSUE: [Brief explanation if applicable]
it.skip('test name', () => {
```

---

## Next Steps

1. **ESLint Violations (2 tests):** Fix 78 ESLint violations to re-enable
2. **Mock Infrastructure (4 tests):** Fix vitest mock setup for extractor prompts
3. **Module Resolution (3 tests):** Fix vitest.tsconfig for dev-tools/ tests
4. **Sigstore Implementation (13 tests):** Implement Sigstore signing to re-enable

---

## References

- Test skip review plan: `team/test-skip-review-plan.md`
- Lessons learned: `team/lessonslearned.md`
- Test config: `vitest.config.ts`
