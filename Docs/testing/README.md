# BMAD CYBER2 Test Structure

This directory contains all testing files organized according to the BMAD METHOD testing standards.

## Directory Structure

```
test/
├── unit/                    # Unit tests for individual components
│   ├── abdul/              # Abdul Master Project Manager tests
│   │   ├── abdul-validation-test-suite.js
│   │   └── abdul-validation-enhanced.js
│   └── registry/           # Package registry unit tests
│       └── package-registry-test-suite.js
├── integration/            # Integration tests for cross-module functionality
│   ├── bmad-cross-module-integration-tests.js
│   ├── final-integration-test-suite.js
│   ├── test-bmad-installation.js
│   └── verify-installation.js
├── benchmarks/             # Performance and benchmark tests
│   └── bmad-performance-benchmark.js
├── fixtures/              # Test data and mock files
│   ├── cybersec-team/     # Test team data
│   ├── intel-team/
│   ├── legal-team/
│   ├── strategy-team/
│   └── samples/           # Sample configurations
├── validators/            # Test validation utilities
│   └── bmad-agent-communication-validator.js
├── config/               # Test configuration files
│   ├── jest.config.js    # Jest configuration
│   ├── mocha.opts        # Mocha configuration
│   ├── test-setup.js     # Common test setup
│   └── index.js          # Central test configuration
├── output/               # Test output files (auto-generated)
├── reports/              # Test reports (auto-generated)
└── coverage/             # Coverage reports (auto-generated)
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance benchmarks
npm run test:benchmarks

# Abdul validation specifically
npm run test:abdul
npm run test:abdul-enhanced

# Package registry tests
npm run test:registry

# Validator utilities
npm run test:validators
```

### Test Options
```bash
# With coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# Verbose output
npm run test:verbose
```

## Test Configuration

- **Jest**: Primary test runner with coverage reporting
- **Mocha**: Alternative test runner for specialized tests
- **Babel**: ES6+ transpilation for tests
- **Coverage**: HTML and LCOV reports generated

## Test Standards

All tests follow BMAD METHOD standards:

1. **Isolation**: Each test is independent and can run in any order
2. **Validation**: Tests validate actual functionality, not just syntax
3. **Coverage**: Minimum 80% coverage requirement
4. **Performance**: Benchmarks ensure performance standards
5. **Documentation**: Each test file includes clear descriptions

## Fixtures and Test Data

Test data is organized in the `fixtures/` directory:
- Team module examples
- Agent configurations
- Workflow definitions
- Sample installation data

## Configuration

Test configuration is centralized in `test/config/`:
- Environment setup
- Path configurations
- Validation rules
- Timeout settings

## Reports

Test reports are automatically generated:
- HTML test reports in `test/reports/`
- Coverage reports in `test/coverage/`
- Performance benchmarks in `test/output/`