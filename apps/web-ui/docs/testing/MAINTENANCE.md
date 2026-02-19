# Test Maintenance Guide

**Project:** BMAD Web UI / Web Server
**Version:** 1.0.0
**Last Updated:** 2026-02-19

---

## INDEX

| Section | Description |
|---------|-------------|
| [Regular Tasks](#regular-tasks) | Scheduled maintenance |
| [Handling Flaky Tests](#handling-flaky-tests) | Fixing unreliable tests |
| [Updating Test Data](#updating-test-data) | Managing test fixtures |
| [Adding New Test Categories](#adding-new-test-categories) | Extending test coverage |
| [Coverage Management](#coverage-management) | Monitoring coverage trends |

---

## REGULAR TASKS

### Weekly Tasks

- [ ] **Review failed tests in CI**
  - Check GitHub Actions for test failures
  - Identify flaky tests
  - Fix or skip with documented reason

- [ ] **Update flaky tests**
  - Run suspect tests multiple times
  - Add retries or stabilize tests
  - Update test data if needed

- [ ] **Check coverage trends**
  - Compare with previous week
  - Identify significant drops
  - Investigate uncovered code

### Monthly Tasks

- [ ] **Review and update test documentation**
  - Update test counts in README.md
  - Update coverage thresholds
  - Add new test patterns to documentation

- [ ] **Audit test coverage**
  - Run full coverage report
  - Identify gaps in critical paths
  - Create tickets for missing tests

- [ ] **Update benchmark baselines**
  - Run performance tests
  - Update baselines in PERFORMANCE-BASELINES.md
  - Investigate regressions

### Per Release Tasks

- [ ] **Update test data**
  - Review fixture files for outdated data
  - Update test scenarios
  - Add test data for new features

- [ ] **Add tests for new features**
  - Ensure new code has test coverage
  - Add security tests for new endpoints
  - Add integration tests for new workflows

- [ ] **Remove tests for deprecated features**
  - Delete obsolete test files
  - Update test inventory
  - Remove from CI pipeline

- [ ] **Update coverage thresholds**
  - Review coverage targets
  - Adjust thresholds in jest.config.json
  - Document new targets

---

## HANDLING FLAKY TESTS

### Identifying Flaky Tests

A flaky test is one that:
- Passes sometimes, fails sometimes
- Fails due to timing issues
- Fails due to external dependencies
- Fails inconsistently across runs

### Isolation Process

1. **Identify the flaky test**
   ```bash
   # Run the specific test multiple times
   npm test -- --testNamePattern="flaky test name"
   ```

2. **Add `.only` to isolate it**
   ```typescript
   describe.only('Flaky Test Suite', () => {
     it('flaky test', () => {
       // Test code
     });
   });
   ```

3. **Run multiple times to confirm**
   ```bash
   # Run 10 times
   for i in {1..10}; do npm test -- flaky.test.ts; done
   ```

### Fix or Skip

**Option 1: Fix the flaky test**
- Add explicit waits/await for async operations
- Use `waitFor()` instead of fixed timeouts
- Mock external dependencies
- Stabilize test data

**Option 2: Skip with documented reason**
```typescript
describe.skip('Flaky Test Suite - Skipped pending fix', () => {
  // GitHub Issue: #1234
  // Reason: Race condition in SSE stream
  // Fix scheduled: v1.1.0
});
```

### Common Flaky Test Patterns

```typescript
// BAD: Fixed timeout
it('waits for async operation', async () => {
  await doAsyncWork();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Flaky!
  expect(result).toBe('done');
});

// GOOD: Wait for condition
it('waits for async operation', async () => {
  await doAsyncWork();
  await waitFor(() => expect(result).toBe('done'));
});
```

---

## UPDATING TEST DATA

### Test Data Locations

```
tests/
├── fixtures/              # Static test data
│   ├── users.json
│   ├── projects.json
│   └── responses.json
├── integration/
│   └── __tests__/
│       └── helpers/
│           └── test-helpers.ts  # Dynamic test data generators
└── e2e/
    └── helpers/
        └── test-data.ts    # E2E test data
```

### Update Process

1. **Modify fixture files**
   ```bash
   # Edit fixture file
   vi tests/fixtures/users.json
   ```

2. **Run affected tests**
   ```bash
   npm test -- --testPathPattern=integration
   ```

3. **Verify changes**
   ```bash
   # Run tests that use the fixture
   npm test -- user-auth
   ```

4. **Commit changes**
   ```bash
   git add tests/fixtures/users.json
   git commit -m "test: update user fixture for new role"
   ```

### Test Data Best Practices

- **Use realistic data** that mirrors production
- **Cover edge cases** in fixtures
- **Document fixture purpose** in comments
- **Keep fixtures small** and focused
- **Version fixtures** if used across teams

---

## ADDING NEW TEST CATEGORIES

### Step 1: Create Directory Structure

```bash
# Create new test directory
mkdir -p tests/new-category

# Add to .gitignore if needed (e.g., for test outputs)
echo "tests/new-category/temp/" >> .gitignore
```

### Step 2: Update Jest Configuration

Edit `jest.config.json`:

```json
{
  "testMatch": [
    "**/tests/new-category/**/*.test.ts"
  ],
  "testPathIgnorePatterns": [
    "tests/new-category/temp/"
  ]
}
```

### Step 3: Create Test Helper

```typescript
// tests/new-category/helpers/setup.ts
export function setupNewCategoryTest() {
  // Common setup for this category
  return {
    mockData: {},
    cleanup: () => {}
  };
}
```

### Step 4: Add NPM Script

Edit `package.json`:

```json
{
  "scripts": {
    "test:new-category": "jest --testPathPattern=new-category"
  }
}
```

### Step 5: Update Documentation

Edit this file (MAINTENANCE.md):

```markdown
## Test Categories

| Category | Command | Purpose |
|----------|---------|---------|
| New Category | `npm run test:new-category` | Description |
```

---

## COVERAGE MANAGEMENT

### Generating Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# View report
open coverage/index.html
```

### Coverage Thresholds

Edit `jest.config.json`:

```json
{
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "branches": 75,
      "functions": 80,
      "statements": 80
    },
    "src/lib/security/": {
      "lines": 100,
      "branches": 95
    },
    "src/lib/auth/": {
      "lines": 95,
      "branches": 90
    }
  }
}
```

### Tracking Coverage Trends

```bash
# Save coverage snapshot
npm run test:coverage
cp coverage/coverage-final.json coverage-history/$(date +%Y%m%d).json

# Compare with previous
# Use coverage-diff tool or custom script
```

### Improving Coverage

1. **Run coverage report**
   ```bash
   npm run test:coverage
   ```

2. **Identify uncovered files**
   ```bash
   # View HTML report
   open coverage/lcov-report/index.html
   ```

3. **Add tests for uncovered lines**
   ```typescript
   // Focus on:
   // - Error handling paths
   // - Edge cases
   // - Security-related code
   ```

4. **Re-run coverage**
   ```bash
   npm run test:coverage
   ```

### Coverage Goals by Priority

| Priority | Module | Target | Current |
|----------|--------|--------|---------|
| Critical | Security | 100% | ___% |
| Critical | Auth | 95% | ___% |
| High | CLI Bridge | 90% | ___% |
| High | API Routes | 85% | ___% |
| Medium | Components | 70% | ___% |

---

## TEST PERFORMANCE

### Identifying Slow Tests

```bash
# Run tests with timing
npm test -- --verbose --no-coverage

# Look for tests taking > 1000ms
```

### Optimizing Slow Tests

1. **Mock expensive operations**
   ```typescript
   // Instead of real database call
   // Use mocked response
   jest.mock('@/lib/db', () => ({
     query: jest.fn().mockResolvedValue(mockData)
   }));
   ```

2. **Parallelize independent tests**
   ```bash
   # Increase workers (default: 1 for this project)
   npm test -- --maxWorkers=4
   ```

3. **Use `beforeAll` for expensive setup**
   ```typescript
   beforeAll(async () => {
     // Expensive setup runs once
     testDb = await setupTestDatabase();
   });
   ```

---

## CI/CD MAINTENANCE

### Updating CI Configuration

Edit `.github/workflows/web-ui-ci.yml`:

```yaml
# Add new test job
new-test-category:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - run: npm ci
    - run: npm run test:new-category
```

### Monitoring CI Failures

- [ ] Check CI daily for failures
- [ ] Fix flaky CI tests promptly
- [ ] Update CI dependencies monthly

---

## DOCUMENTATION MAINTENANCE

### Update Schedule

| Document | Update Frequency | Owner |
|----------|------------------|-------|
| README.md | Per release | Tech Lead |
| TEST-EXECUTION-GUIDE.md | Monthly | QA |
| COMPREHENSIVE-TESTING-STRATEGY.md | Quarterly | Architect |
| PERFORMANCE-BASELINES.md | Monthly | Performance |
| This file (MAINTENANCE.md) | Quarterly | QA |

### Documentation Review Checklist

- [ ] Test commands still work
- [ ] File paths are correct
- [ ] Coverage numbers are current
- [ ] New test categories documented
- [ ] Examples are accurate

---

## TROUBLESHOOTING

### Jest Cache Issues

```bash
# Clear Jest cache
npm test -- --clearCache

# Clear all caches
rm -rf node_modules/.cache
```

### Test Database Issues

```bash
# Reset test database
npm run db:reset:test

# Recreate test database
npm run db:recreate:test
```

### Port Conflicts

```bash
# Find and kill process on port
lsof -ti:42001 | xargs kill -9
```

---

**Document Status:** Active
**Last Updated:** 2026-02-19
**Maintained By:** QA Team
