# Story 10.8: Test Coverage Enhancement

**ID:** 10-8-coverage-enhancement
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** Medium
**Estimate:** 6 hours
**Dependencies:** 10-1-fix-test-failures

---

## DESCRIPTION

Achieve minimum 80% code coverage on all critical security paths and establish coverage thresholds to prevent regression.

## COVERAGE TARGETS

| Component | Line Coverage | Branch Coverage | Function Coverage |
|-----------|---------------|-----------------|-------------------|
| Security Modules | 100% | 95% | 100% |
| Authentication | 95% | 90% | 95% |
| Authorization | 95% | 90% | 95% |
| CLI Bridge | 90% | 85% | 90% |
| API Routes | 85% | 80% | 85% |
| Components | 70% | 65% | 70% |

## ACCEPTANCE CRITERIA

- [ ] Coverage report generated
- [ ] Security modules achieve 100% line coverage
- [ ] Authentication achieves 95% line coverage
- [ ] CLI Bridge achieves 90% line coverage
- [ ] Coverage thresholds enforced in jest.config.json
- [ ] No critical paths below 80% coverage

## IMPLEMENTATION STEPS

### Step 1: Generate Current Coverage Report

```bash
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui
npm run test:coverage
open coverage/index.html
```

Document current coverage in `docs/testing/COVERAGE-BASELINES.md`:

```markdown
# Coverage Baseline - 2025-02-18

## Current Coverage

| Component | Lines | Branches | Functions | Target | Gap |
|-----------|-------|----------|-----------|--------|-----|
| src/lib/security/ | TBD | TBD | TBD | 100% | TBD |
| src/lib/auth/ | TBD | TBD | TBD | 95% | TBD |
| src/lib/cli-bridge/ | TBD | TBD | TBD | 90% | TBD |
| src/middleware/ | TBD | TBD | TBD | 90% | TBD |
| src/lib/validation/ | TBD | TBD | TBD | 85% | TBD |
```

### Step 2: Identify Coverage Gaps

From coverage report, identify:
1. Files with < 80% coverage
2. Files with critical security functions but < 100% coverage
3. Uncovered edge cases

### Step 3: Add Missing Tests

For each uncovered critical path, create tests:

```typescript
// Example: Adding coverage for error path
describe('handleAuthError', () => {
  it('should handle token expired error', () => {
    const expiredError = new TokenExpiredError();
    const result = handleAuthError(expiredError);
    expect(result).toEqual({ code: 'TOKEN_EXPIRED', message: 'Session expired' });
  });

  it('should handle invalid token error', () => {
    const invalidError = new InvalidTokenError();
    const result = handleAuthError(invalidError);
    expect(result).toEqual({ code: 'INVALID_TOKEN', message: 'Invalid token' });
  });
});
```

### Step 4: Enforce Coverage Thresholds

Update `jest.config.json`:

```json
{
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**"
  ],
  "coverageThreshold": {
    "src/lib/security/": {
      "lines": 100,
      "branches": 95,
      "functions": 100
    },
    "src/lib/auth/": {
      "lines": 95,
      "branches": 90,
      "functions": 95
    },
    "src/lib/cli-bridge/": {
      "lines": 90,
      "branches": 85,
      "functions": 90
    },
    "src/middleware/": {
      "lines": 90,
      "branches": 85,
      "functions": 90
    },
    "src/lib/validation/": {
      "lines": 85,
      "branches": 80,
      "functions": 85
    },
    "src/components/": {
      "lines": 70,
      "branches": 65,
      "functions": 70
    }
  }
}
```

### Step 5: Create Coverage Utilities

Create `tests/helpers/coverage.ts`:

```typescript
/**
 * Helper to identify uncovered lines from istanbul reports
 */
export function findUncoveredLines(coverageData: any, filePath: string) {
  const fileCoverage = coverageData[filePath];
  if (!fileCoverage) return [];

  return Object.entries(fileCoverage.s)
    .filter(([_, stats]) => !stats)
    .map(([lineNum, _]) => parseInt(lineNum));
}

/**
 * Generate coverage report for specific module
 */
export function generateModuleCoverageReport(modulePath: string) {
  // Implementation to generate focused coverage report
}
```

### Step 6: Add Tests for Common Edge Cases

Create template tests for common patterns:

```typescript
// tests/helpers/common-tests.ts
export const nullUndefinedTests = {
  describe: 'handles null input',
  test: (fn: Function) => {
    it('should handle null', () => {
      expect(() => fn(null)).not.toThrow();
    });
    it('should handle undefined', () => {
      expect(() => fn(undefined)).not.toThrow();
    });
  }
};

export const emptyStringTests = {
  describe: 'handles empty string',
  test: (fn: Function) => {
    it('should handle empty string', () => {
      expect(() => fn('')).not.toThrow();
    });
  }
};
```

### Step 7: Run Coverage Report

```bash
npm run test:coverage
```

Verify thresholds are met. If not, continue adding tests.

### Step 8: Document Final Coverage

Update `docs/testing/COVERAGE-BASELINES.md` with final results.

## FILES TO CREATE

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/docs/testing/COVERAGE-BASELINES.md`
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/helpers/coverage.ts`
3. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/tests/helpers/common-tests.ts`

## FILES TO MODIFY

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/jest.config.json`

## TESTING

```bash
# Run coverage
npm run test:coverage

# Check HTML report
open coverage/index.html

# Verify thresholds
# All should show ✓达标
```

## RISKS

| Risk | Mitigation |
|------|------------|
| Hard to reach 100% on some modules | Focus on critical security paths |
| False sense of security from coverage | Prioritize meaningful tests over empty tests |
| Coverage causes slow tests | Balance between coverage and performance |

## DEFINITION OF DONE

- [ ] Coverage report generated
- [ ] Coverage gaps identified
- [ ] Critical paths have 100% coverage
- [ ] Coverage thresholds enforced in config
- [ ] All thresholds pass
- [ ] Coverage documented
- [ ] Future tests checked against thresholds
