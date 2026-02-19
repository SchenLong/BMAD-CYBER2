# Story 10.1: Fix Existing Test Failures

**ID:** 10-1-fix-test-failures
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** Critical
**Estimate:** 4 hours
**Dependencies:** None

---

## DESCRIPTION

Fix the 103 currently failing tests to achieve 100% pass rate before adding new test infrastructure. Current test results show:
- **Test Suites:** 23 passed, 17 failed (40 total)
- **Tests:** 709 passed, 103 failed, 1 skipped (813 total)
- **Pass Rate:** ~87%

## ACCEPTANCE CRITERIA

- [ ] All 709 passing tests continue to pass
- [ ] All 103 failing tests are fixed or properly skipped
- [ ] Memory issues in prompt-injection tests are resolved
- [ ] Validation error handling is fixed
- [ ] Empty test suites are addressed
- [ ] Final test run shows 100% pass rate

## IMPLEMENTATION STEPS

### Step 1: Fix Memory Issues (2 files, ~50 tests)

**Files Affected:**
- `src/lib/security/__tests__/prompt-injection.test.ts`
- `src/middleware/__tests__/prompt-injection-middleware.test.ts`

**Solution:** Update `jest.config.json` to handle memory:

```json
{
  "maxWorkers": 1,
  "testTimeout": 30000,
  "globalSetup": "<rootDir>/jest.setup.js",
  "logHeapUsage": true
}
```

Or split large test files into smaller modules.

**Verification:**
```bash
npm test -- prompt-injection
```

### Step 2: Fix Validation Error Handling (4 tests)

**File Affected:** `src/lib/validation/__tests__/middleware.test.ts`

**Error:** `Cannot read properties of undefined (reading 'map')`

**Solution:** Add null check in `src/lib/validation/errors.ts`:

```typescript
export function formatValidationErrors(
  errors: z.ZodError | undefined,
  includeReceived = false
): ValidationError[] {
  // Add null check
  if (!errors || !errors.issues) {
    return [];
  }
  return errors.issues.map((error) => ({
    path: error.path.map(String),
    message: formatErrorMessage(error),
    code: error.code,
    ...
  }));
}
```

**Verification:**
```bash
npm test -- middleware.test
```

### Step 3: Fix Output Filter Tests (2 tests)

**File Affected:** `src/lib/security/__tests__/output-filter-integration.test.ts`

**Issue:** Flagging behavior not matching expectations

**Solution:** Review test expectations at lines ~359 and ~372. Either:
1. Update test expectations to match actual behavior, OR
2. Fix the output filter logic to match expected behavior

**Verification:**
```bash
npm test -- output-filter-integration
```

### Step 4: Fix Empty Test Suite (1 file)

**File Affected:** `src/lib/openapi/spec.ts`

**Issue:** Test suite must contain at least one test

**Solution:** Either add tests or exclude from discovery:

**Option A - Add tests:**
```typescript
describe('OpenAPI Spec', () => {
  it('should have valid spec structure', () => {
    expect(spec).toBeDefined();
    expect(spec.openapi).toBe('3.0.0');
  });
});
```

**Option B - Exclude from Jest:**
Update `jest.config.json`:
```json
{
  "testMatch": [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
    "**/?(*.)+(spec|test).ts",
    "**/?(*.)+(spec|test).tsx",
    "!**/openapi/**"  // Exclude openapi from tests
  ]
}
```

**Verification:**
```bash
npm test -- openapi
```

### Step 5: Run Full Test Suite

```bash
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui
npm test
```

**Expected Result:** All tests pass, no failures

### Step 6: Document Results

Update `team/lessonslearned.md` with:
- Tests fixed
- How memory was resolved
- Any unexpected issues found

## FILES TO MODIFY

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/jest.config.json` - Memory configuration
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/src/lib/validation/errors.ts` - Null checks
3. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/src/lib/security/__tests__/output-filter-integration.test.ts` - Expectations or add tests to `src/lib/openapi/spec.ts`

## RISKS

| Risk | Mitigation |
|------|------------|
| Fixing tests changes behavior | Verify with product owner |
| Memory limit increase doesn't help | Split test files as backup |
| Validation fix masks real issue | Review why errors is undefined |

## DEFINITION OF DONE

- [ ] All tests pass when running `npm test`
- [ ] No test suites skipped without documentation
- [ ] CI pipeline would pass (if configured)
- [ ] Changes committed and pushed
- [ ] Lessons learned documented
