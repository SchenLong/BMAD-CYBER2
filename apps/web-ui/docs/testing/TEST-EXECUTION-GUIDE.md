# BMAD Web UI - Test Execution Guide

**Version:** 1.0.0
**Date:** 2025-02-18

---

## INDEX

| Section | Description |
|---------|-------------|
| [Quick Start](#quick-start) | Run tests immediately |
| [Test Categories](#test-categories) | Different test types |
| [CI/CD Integration](#cicd-integration) | Automation setup |
| [Troubleshooting](#troubleshooting) | Common issues |

---

## QUICK START

### Prerequisites

```bash
# Install dependencies
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui
npm install

# Set test environment variables
cp .env.example .env.test
```

### Run All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run security tests only
npm run test:security

# Run integration tests only
npm run test:integration
```

---

## TEST CATEGORIES

### 1. Security Tests

**Purpose:** Verify all security controls are working correctly

```bash
# Run all security tests
npm run test:security

# Run specific security suite
npm test -- prompt-injection
npm test -- cli-auth
npm test -- rate-limit

# Run OWASP compliance tests
npm run test:owasp
```

**Coverage:**
- Prompt injection detection
- Authentication & authorization
- Input validation
- CLI bridge security
- Rate limiting
- OWASP Top 10

### 2. Unit Tests

**Purpose:** Test individual components and functions

```bash
# Run unit tests
npm run test:unit

# Run with watch mode
npm run test:watch

# Run specific component
npm test -- password
npm test -- session
npm test -- templates
```

### 3. Integration Tests

**Purpose:** Test API workflows and component interactions

```bash
# Run integration tests
npm run test:integration

# Run specific integration suite
npm test -- api-workflows
npm test -- auth-flow
npm test -- sse-streaming
```

### 4. End-to-End Tests

**Purpose:** Test complete user journeys

```bash
# Install Playwright (first time only)
npm install -D @playwright/test

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test --grep "onboarding"
```

### 5. Performance Tests

**Purpose:** Benchmark application performance

```bash
# Install k6 (first time only)
brew install k6  # macOS
# or download from https://k6.io/

# Run load test
k6 run tests/performance/load-test.k6.js

# Run with custom URL
BASE_URL=https://staging.bmad.example.com k6 run tests/performance/load-test.k6.js
```

---

## COVERAGE REPORTS

### Generate Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# View report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Thresholds

| Component | Line Coverage | Target |
|-----------|---------------|--------|
| Security | ~90% | 100% |
| Auth | ~85% | 95% |
| CLI Bridge | ~80% | 90% |
| API | ~75% | 85% |
| Components | ~60% | 70% |

---

## CI/CD INTEGRATION

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:security
      - run: npm run security:audit

  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:integration
```

### Pre-Commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run test:security && npm run lint
```

---

## TROUBLESHOOTING

### Issue: Tests Timeout

**Symptom:** Tests fail with timeout error

**Solution:**
```bash
# Increase timeout in jest.config.json
{
  "testTimeout": 10000  // 10 seconds
}
```

### Issue: Database Connection Errors

**Symptom:** Tests fail with database connection error

**Solution:**
```bash
# Set test database URL
export DATABASE_URL="postgresql://test:test@localhost:5432/bmad_test"

# Or use SQLite for faster tests
export DATABASE_URL="file:./test.db"
```

### Issue: Port Already in Use

**Symptom:** E2E tests fail because port is in use

**Solution:**
```bash
# Kill process on port 42001
lsof -ti:42001 | xargs kill -9

# Or use different port
export PORT=42002
npm run dev
```

### Issue: Mock Dependencies Not Working

**Symptom:** Tests fail with "module not found" error

**Solution:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## TEST RESULTS INTERPRETATION

### Understanding Jest Output

```
PASS  src/lib/security/__tests__/prompt-injection.test.ts
  Prompt Injection Detector
    System Override Detection
      ✓ should detect <system> tag (5ms)
      ✓ should detect [SYSTEM] bracket (3ms)
    ✓ should reject shell command injection (2ms)

Test Suites: 36 passed, 36 total
Tests:       248 passed, 248 total
Snapshots:   0 total
Time:        15.234s
```

### Understanding K6 Output

```
checks.........................: ✓ 100.0% ✓ 1000  ✗ 0
http_req_duration..............: avg=150ms  min=50ms   med=120ms  max=800ms  p(95)=400ms
http_req_failed................: 0.00%   ✓ 0    ✗ 1000
```

**Key Metrics:**
- `p(95)`: 95th percentile response time
- `http_req_failed`: Error rate
- `checks`: Percentage of passed checks

---

## BEST PRACTICES

### 1. Write Tests First (TDD)

```typescript
// 1. Write failing test
it('should validate password strength', () => {
  expect(validatePassword('weak')).toBe(false);
});

// 2. Implement feature
function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// 3. Test passes
```

### 2. Use Descriptive Test Names

```typescript
// Bad
it('works', () => {});

// Good
it('should reject passwords shorter than 8 characters', () => {});
```

### 3. Test Edge Cases

```typescript
it('should handle empty input', () => {});
it('should handle null values', () => {});
it('should handle maximum length input', () => {});
it('should handle special characters', () => {});
```

### 4. Keep Tests Independent

```typescript
// Bad - tests depend on order
let sharedState;

it('first test', () => { sharedState = 'value'; });
it('second test', () => { expect(sharedState).toBe('value'); });

// Good - each test is isolated
it('first test', () => {
  const state = 'value';
  expect(state).toBe('value');
});
it('second test', () => {
  const state = 'value';
  expect(state).toBe('value');
});
```

---

## SECURITY TEST CHECKLIST

Before any release, verify:

- [ ] All security tests pass
- [ ] No new vulnerabilities introduced (npm audit)
- [ ] OWASP Top 10 coverage complete
- [ ] Authentication flows tested
- [ ] Authorization tested for all roles
- [ ] Input validation tested
- [ ] Rate limiting tested
- [ ] CLI bridge security tested
- [ ] Prompt injection detection tested
- [ ] Audit logging tested

---

**Document Status:** Active
**Last Updated:** 2025-02-18
