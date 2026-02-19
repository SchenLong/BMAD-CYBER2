# Testing Onboarding for New Developers

**Project:** BMAD Web UI / Web Server
**Version:** 1.0.0
**Last Updated:** 2026-02-19

---

## INDEX

| Section | Description |
|---------|-------------|
| [First Time Setup](#first-time-setup) | Initial environment configuration |
| [Running Your First Tests](#running-your-first-tests) | Basic test execution |
| [Writing Your First Test](#writing-your-first-test) | Test authoring guide |
| [Test Structure](#test-structure) | Project organization |
| [Common Commands](#common-commands) | Quick reference |
| [Getting Help](#getting-help) | Support resources |

---

## FIRST TIME SETUP

### Prerequisites

Ensure you have the following installed:
- **Node.js** v20 or higher
- **npm** v10 or higher
- **Git** for version control

### Installation

```bash
# Navigate to the project directory
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui

# Install dependencies
npm install

# Verify installation
npm --version
node --version
```

### Environment Setup

```bash
# Copy environment template (if .env.example exists)
cp .env.example .env.test

# The following test environment variables are automatically set in jest.setup.js:
# - JWT_SECRET, SESSION_SECRET, ENCRYPTION_KEY
# - DATABASE_URL (uses test database)
# - NEXT_PUBLIC_API_URL
```

### Install Pre-Commit Hooks (Optional but Recommended)

```bash
# Husky is installed automatically via npm install
# Manually initialize if needed:
npx husky install
```

---

## RUNNING YOUR FIRST TESTS

### Quick Verification

After setup, run all tests to verify your environment:

```bash
# Run all tests
npm test

# Expected output:
# Test Suites: 36 passed, 1 skipped
# Tests:       921 passed, 82 skipped
# Time:        ~60 seconds
```

### Run Specific Test Categories

```bash
# Security tests only
npm run test:security

# OWASP compliance tests
npm run test:owasp

# Integration tests
npm run test:integration

# With coverage report
npm run test:coverage
```

---

## WRITING YOUR FIRST TEST

### Unit Test Example

Unit tests verify individual functions and components. Place them next to the source file in `__tests__` directories.

**File:** `src/lib/utils/__tests__/my-function.test.ts`

```typescript
import { myFunction } from '../my-function';

describe('myFunction', () => {
  it('should return expected output for valid input', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBeNull();
  });
});
```

### Security Test Example

Security tests verify that security controls work correctly.

**File:** `src/lib/security/__tests__/my-security.test.ts`

```typescript
import { sanitizeInput } from '../input-sanitizer';

describe('Security: Input Sanitization', () => {
  it('should remove script tags', () => {
    const malicious = '<script>alert("xss")</script>';
    const result = sanitizeInput(malicious);
    expect(result).not.toContain('<script>');
  });

  it('should escape HTML entities', () => {
    const input = '<div>Hello</div>';
    const result = sanitizeInput(input);
    expect(result).toContain('&lt;div&gt;');
  });
});
```

### Integration Test Example

Integration tests verify API workflows and component interactions.

**File:** `tests/integration/__tests__/my-workflow.test.ts`

```typescript
import { createMockRequest } from './helpers/mocks';
import { POST } from '@/app/api/v1/projects/route';

describe('Project Creation API', () => {
  it('should create a new project', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { name: 'Test Project', type: 'assessment' }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.project).toBeDefined();
    expect(data.project.name).toBe('Test Project');
  });
});
```

---

## TEST STRUCTURE

### Directory Organization

```
team/bmad-web-ui/
├── src/
│   ├── lib/
│   │   ├── security/__tests__/     # Security unit tests
│   │   ├── auth/__tests__/         # Auth unit tests
│   │   ├── cli-bridge/__tests__/   # CLI bridge unit tests
│   │   └── validation/__tests__/   # Validation unit tests
│   ├── middleware/__tests__/       # Middleware tests
│   └── components/
│       └── __tests__/              # Component tests
├── tests/
│   ├── integration/
│   │   └── __tests__/
│   │       ├── helpers/            # Test utilities
│   │       └── api-workflows.test.ts
│   ├── e2e/
│   │   ├── helpers/                # E2E utilities
│   │   └── user-journeys.spec.ts
│   └── performance/
│       └── load-test.k6.js
└── jest.setup.js                   # Global test configuration
```

### Test File Naming

- **Unit tests:** `*.test.ts` or `*.test.tsx`
- **E2E tests:** `*.spec.ts` (Playwright)
- **Skipped tests:** `*.test.skip.ts` (for future implementation)
- **Performance tests:** `*.k6.js`

---

## COMMON COMMANDS

### Test Execution

| Command | Purpose | Duration |
|---------|---------|----------|
| `npm test` | Run all tests | ~60s |
| `npm test -- --watch` | Watch mode (re-run on changes) | Continuous |
| `npm test -- myTest` | Run specific test pattern | ~5s |
| `npm test -- --coverage` | Generate coverage report | ~90s |

### Test Categories

| Command | Purpose |
|---------|---------|
| `npm run test:security` | All security tests |
| `npm run test:owasp` | OWASP Top 10 compliance |
| `npm run test:integration` | API workflow tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:perf:smoke` | Performance smoke test |

### Debugging

| Command | Purpose |
|---------|---------|
| `npm test -- --verbose` | Detailed output |
| `npm test -- --no-coverage` | Skip coverage |
| `npm test -- --clearCache` | Clear Jest cache |
| `npm test -- --maxWorkers=1` | Single worker (debugging) |

---

## TESTING BEST PRACTICES

### 1. Test Behavior, Not Implementation

```typescript
// Bad - tests implementation detail
it('should set isValid property to true', () => {
  const result = validator.validate('valid@email.com');
  expect(result.isValid).toBe(true);
});

// Good - tests behavior
it('should accept valid email addresses', () => {
  const result = validator.validate('valid@email.com');
  expect(result).toBe(true);
});
```

### 2. Use Descriptive Test Names

```typescript
// Bad
it('works', () => {});

// Good
it('should reject passwords shorter than 8 characters', () => {});
```

### 3. Follow AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate total with tax', () => {
  // Arrange - Set up test data
  const price = 100;
  const taxRate = 0.1;

  // Act - Execute the function
  const total = calculateTotal(price, taxRate);

  // Assert - Verify the result
  expect(total).toBe(110);
});
```

### 4. Test Edge Cases

```typescript
describe('validateInput', () => {
  it('should handle empty strings', () => {
    expect(validateInput('')).toBe(false);
  });

  it('should handle null values', () => {
    expect(validateInput(null)).toBe(false);
  });

  it('should handle special characters', () => {
    expect(validateInput('<script>')).toBe(false);
  });

  it('should accept valid input', () => {
    expect(validateInput('valid-input')).toBe(true);
  });
});
```

### 5. Keep Tests Independent

Each test should be able to run in isolation. Don't rely on:
- Test execution order
- Shared state between tests
- External file system (use mocks)

---

## SECURITY TESTING REQUIREMENTS

### All Security Tests Must Pass

Before committing code, verify:
```bash
npm run test:security
```

### Security Test Categories

| Category | Test Command | Status Required |
|----------|-------------|-----------------|
| OWASP Top 10 | `npm run test:owasp` | ✅ 100% Pass |
| Prompt Injection | `npm test -- prompt-injection` | ✅ 100% Pass |
| Authentication | `npm test -- cli-auth` | ✅ 100% Pass |
| Authorization | `npm test -- cli-authorization` | ✅ 100% Pass |
| Input Validation | `npm test -- schemas` | ✅ 100% Pass |

---

## GETTING HELP

### Documentation

- **[Test Execution Guide](./TEST-EXECUTION-GUIDE.md)** - Detailed test commands
- **[Comprehensive Testing Strategy](./COMPREHENSIVE-TESTING-STRATEGY.md)** - Testing philosophy
- **[Troubleshooting](./TEST-EXECUTION-GUIDE.md#troubleshooting)** - Common issues

### Test Examples

- **Unit tests:** `src/lib/security/__tests__/owasp-top10.test.ts`
- **Integration tests:** `tests/integration/__tests__/api-workflows.test.ts`
- **E2E tests:** `tests/e2e/user-journeys.spec.ts`

### Support Channels

- **Slack:** #bmad-testing (internal)
- **Issues:** GitHub Issues (tag: `testing`)
- **Code Review:** Request review from QA team

---

## CHECKLIST FOR NEW CONTRIBUTORS

Before your first commit:

- [ ] Completed environment setup
- [ ] Run `npm test` successfully
- [ ] Read [Comprehensive Testing Strategy](./COMPREHENSIVE-TESTING-STRATEGY.md)
- [ ] Reviewed existing test examples
- [ ] Written tests for new code (if applicable)
- [ ] All security tests pass
- [ ] Code follows existing test patterns

---

**Document Status:** Active
**Last Updated:** 2026-02-19
**Maintained By:** QA Team
