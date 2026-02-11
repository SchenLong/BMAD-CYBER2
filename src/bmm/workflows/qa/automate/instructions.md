<!-- Powered by BMAD-CORE -->

# QA Automate - Rapid Test Generation

**Workflow ID**: `src/bmm/qa/automate`
**Version**: 1.0

---

## Overview

Generates tests rapidly for existing features using a lightweight, pragmatic approach. Unlike the full Test Architect (TEA) workflows, QA Automate focuses on speed and coverage over ceremony.

**Core Principle**: Get tests written fast. Fill coverage gaps. Keep it simple.

---

## Preflight Requirements

### Required

- Test framework installed and configured (Vitest, Jest, Mocha, Playwright, etc.)
- Source code to analyze

### Optional

- Existing test suite (for gap analysis)
- Project context file (`**/project-context.md`)

---

## Step 1: Detect Test Framework

### Actions

1. **Scan Project Configuration**

   Check for test framework indicators:
   - `vitest.config.*` or `vite.config.*` with test config -> Vitest
   - `jest.config.*` or `package.json` jest section -> Jest
   - `playwright.config.*` -> Playwright
   - `.mocharc.*` or `mocha` in package.json -> Mocha
   - `cypress.config.*` -> Cypress

2. **Identify Test Patterns**

   Scan existing test files to determine:
   - File naming convention (`.test.ts`, `.spec.ts`, etc.)
   - Test directory structure (`tests/`, `__tests__/`, `src/**/*.test.*`)
   - Import patterns (`import { describe, it }` vs `import { test }`)
   - Assertion library (expect, assert, chai)

3. **Document Framework Configuration**

   Record:
   - Framework name and version
   - Test file pattern
   - Test directory
   - Run command (`npm test`, `npx vitest`, etc.)

---

## Step 2: Identify Features Needing Test Coverage

### Actions

1. **Analyze Source Code**

   Scan `{source_dir}` for:
   - Exported functions and classes
   - API route handlers
   - Business logic modules
   - Utility functions

2. **Map Existing Coverage**

   For each source file:
   - Check if corresponding test file exists
   - If test exists, identify untested exports
   - Flag files with zero test coverage

3. **Prioritize Coverage Gaps**

   Rank uncovered features by:
   - **Critical**: Security functions, authentication, data validation
   - **High**: Core business logic, API endpoints
   - **Medium**: Utility functions, helpers
   - **Low**: Configuration, constants, types

4. **Present Coverage Plan**

   Show user a summary:
   - Files with no tests (highest priority)
   - Files with partial coverage
   - Recommended test count per file

---

## Step 3: Generate API/Unit Tests

### Actions

1. **For Each Priority Feature**

   Generate tests following the project's existing patterns:
   - Match file naming convention
   - Match import style
   - Match assertion patterns
   - Place tests in correct directory

2. **Test Structure**

   Each test file should include:
   - Describe block matching the module/function name
   - Happy path tests (valid inputs, expected outputs)
   - Error path tests (invalid inputs, edge cases)
   - Boundary tests (empty values, null, undefined)

3. **Test Quality Rules**

   - One assertion per test (atomic)
   - Clear, descriptive test names
   - No hardcoded values where factories/fixtures exist
   - Mock external dependencies
   - No shared mutable state between tests

---

## Step 4: Generate E2E Tests (If Applicable)

### Actions

1. **Identify Critical User Flows**

   Only generate E2E tests for:
   - Authentication flows (login, logout, signup)
   - Core business workflows
   - Payment/checkout flows
   - Data creation/deletion flows

2. **Keep E2E Tests Minimal**

   - Test the happy path only at E2E level
   - Use API/unit tests for variations and edge cases
   - Avoid duplicate coverage across test levels

3. **Follow Framework Patterns**

   Use the detected E2E framework (Playwright, Cypress, etc.) patterns:
   - Network-first approach (intercept before navigate)
   - Explicit waits (no hard waits/sleeps)
   - data-testid selectors for stability

---

## Step 5: Run Tests and Create Summary

### Actions

1. **Execute Generated Tests**

   Run the test suite:
   - Execute all generated test files
   - Capture pass/fail results
   - Record any failures with error messages

2. **Fix Failing Tests**

   For each failure:
   - Analyze error message
   - Fix the test (not the source code)
   - Re-run to verify fix
   - Maximum 3 fix attempts per test

3. **Generate Coverage Summary**

   Create summary document at `{default_output_file}`:

   ```markdown
   # QA Automation Summary

   **Date**: {date}
   **Framework**: {framework_name}
   **Coverage Target**: {coverage_target}

   ## Tests Created

   | File | Tests | Pass | Fail |
   |------|-------|------|------|
   | ... | ... | ... | ... |

   ## Coverage Gaps Remaining

   - List any features still uncovered
   - Recommend next steps

   ## Run Command

   {run_command}
   ```

4. **Report Results to User**

   Provide concise summary:
   - Total tests created
   - Pass/fail counts
   - Any remaining coverage gaps
   - Command to run tests

---

## Validation

After completing all steps, verify:

- [ ] Test framework detected correctly
- [ ] Source code analyzed for coverage gaps
- [ ] Tests generated following project patterns
- [ ] Test naming convention matches existing tests
- [ ] Tests placed in correct directories
- [ ] All generated tests pass
- [ ] No duplicate coverage across test levels
- [ ] Summary document created
- [ ] User informed of results

Refer to `checklist.md` for comprehensive validation criteria.
