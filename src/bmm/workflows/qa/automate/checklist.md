# QA Automate Validation Checklist

## Framework Detection

- [ ] Test framework identified correctly
- [ ] Test file naming convention detected
- [ ] Test directory structure mapped
- [ ] Run command determined

## Coverage Analysis

- [ ] Source files scanned for exports
- [ ] Existing test coverage mapped
- [ ] Coverage gaps identified and prioritized
- [ ] Coverage plan presented to user

## Test Generation

- [ ] Tests follow project naming conventions
- [ ] Tests placed in correct directories
- [ ] Tests match existing import patterns
- [ ] Tests match existing assertion patterns
- [ ] Happy path tests included
- [ ] Error path tests included
- [ ] Boundary tests included where appropriate

## Test Quality

- [ ] One assertion per test (atomic)
- [ ] Clear, descriptive test names
- [ ] No hardcoded test data where avoidable
- [ ] External dependencies mocked
- [ ] No shared mutable state between tests
- [ ] No hard waits or sleeps

## E2E Tests (If Generated)

- [ ] Only critical user flows covered
- [ ] No duplicate coverage with unit/API tests
- [ ] Network-first approach used
- [ ] Explicit waits used (no hard waits)
- [ ] Stable selectors used (data-testid)

## Execution

- [ ] All generated tests executed
- [ ] Failing tests fixed (max 3 attempts)
- [ ] Pass/fail results recorded
- [ ] Coverage summary document created

## Output

- [ ] Summary includes test counts
- [ ] Summary includes pass/fail status
- [ ] Summary includes remaining gaps
- [ ] Summary includes run command
- [ ] Summary saved to output folder
