# Story 10.7: CI/CD Pipeline Integration

**ID:** 10-7-ci-cd-integration
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** High
**Estimate:** 4 hours
**Dependencies:** 10-1-fix-test-failures, 10-2-owasp-security-tests

---

## DESCRIPTION

Configure GitHub Actions for automated testing on all pull requests to ensure code quality and security before merging.

## ACCEPTANCE CRITERIA

- [ ] CI pipeline runs on all PRs to main/develop
- [ ] Security tests must pass before merge
- [ ] Coverage reports generated and uploaded
- [ ] Failed tests block merge
- [ ] Status checks visible in PR

## IMPLEMENTATION STEPS

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

jobs:
  # Security Tests - Must Pass
  security:
    name: Security Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      - name: Install dependencies
        working-directory: ./team/bmad-web-ui
        run: npm ci

      - name: Run security tests
        working-directory: ./team/bmad-web-ui
        run: npm run test:security

      - name: Run security audit
        working-directory: ./team/bmad-web-ui
        run: npm run security:audit

  # Unit Tests with Coverage
  unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./team/bmad-web-ui
        run: npm ci

      - name: Run tests with coverage
        working-directory: ./team/bmad-web-ui
        run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./team/bmad-web-ui/coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

  # Integration Tests
  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:14-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: bmad_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./team/bmad-web-ui
        run: npm ci

      - name: Run integration tests
        working-directory: ./team/bmad-web-ui
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/bmad_test
        run: npm run test:integration

  # OWASP Compliance
  owasp:
    name: OWASP Compliance
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./team/bmad-web-ui
        run: npm ci

      - name: Run OWASP tests
        working-directory: ./team/bmad-web-ui
        run: npm run test:owasp

  # Build Verification
  build:
    name: Build Verification
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./team/bmad-web-ui
        run: npm ci

      - name: Build application
        working-directory: ./team/bmad-web-ui
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: team/bmad-web-ui/.next
```

### Step 2: Create Branch Protection Rules

**In GitHub Repository Settings:**

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - Required status checks:
     - Security Tests
     - Unit Tests
     - Integration Tests
     - OWASP Compliance
     - Build Verification

3. Repeat for `develop` branch

### Step 3: Create Pre-Merge Checklist

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
# PR Description

## Changes
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation update

## Testing
- [ ] All tests pass locally (`npm test`)
- [ ] Security tests pass (`npm run test:security`)
- [ ] New tests added for changes
- [ ] Coverage maintained or improved

## Security
- [ ] No new vulnerabilities introduced
- [ ] Input validation added where needed
- [ ] Authentication/authorization considered

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

### Step 4: Test CI Pipeline

Create a test PR to verify:

```bash
# Create and push test branch
git checkout -b test/ci-pipeline
git touch test.txt
git commit -am "Test CI pipeline"
git push origin test/ci-pipeline

# Create PR on GitHub
# Verify all jobs run successfully
```

### Step 5: Configure Status Badges

Add to `README.md`:

```markdown
## CI/CD Status

[![Security Tests](https://github.com/[org]/[repo]/actions/workflows/Test%20Suite/badge.svg)](https://github.com/[org]/[repo]/actions/workflows/Test%20Suite)
[![Coverage](https://codecov.io/gh/[org]/[repo]/branch/main/graph/badge.svg)](https://codecov.io/gh/[org]/[repo])
```

## FILES TO CREATE

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.github/workflows/test.yml`
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.github/PULL_REQUEST_TEMPLATE.md`

## FILES TO MODIFY

1. `/Users/paultinp/BMAD-CYBER2/README.md` - Add CI badges

## TESTING

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Push to trigger CI
git push origin test/ci-pipeline

# Check GitHub Actions tab for results
```

## RISKS

| Risk | Mitigation |
|------|------------|
| CI timeout on slow tests | Increase timeout-minutes |
| Flaky tests in CI | Add retry logic |
| Coverage reporting fails | Use fail_ci_if_error: false |

## DEFINITION OF DONE

- [ ] GitHub Actions workflow created
- [ ] Workflow runs successfully on push
- [ ] All status checks required for merge
- [ ] Branch protection rules configured
- [ ] PR template created
- [ ] CI badges added to README
- [ ] Test PR verifies pipeline works
