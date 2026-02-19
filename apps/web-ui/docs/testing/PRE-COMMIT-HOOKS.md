# Git Hooks Documentation

## Overview

BMAD Web UI uses [Husky](https://github.com/typicode/husky) to manage Git hooks automatically. Hooks are installed in the repository root at `.husky/` and run quality checks before commits and pushes.

## Installed Hooks

### Pre-Commit Hook

Runs **fast quality checks** before each commit:

1. **BMAD Security Validation**
   - Validates repository security (if `security-validation.js` exists)
   - Blocks commits of sensitive files (`.bmad-key`, `.bmad-token`)

2. **BMAD Web UI Quality Checks** (only if web-ui files changed)
   - **ESLint**: Runs static code analysis
   - **Security Audit**: Checks for high/critical vulnerabilities in dependencies

**Execution Time**: ~10-20 seconds

### Pre-Push Hook

Runs **full test suite** before each push:

1. **Security Tests**: `npm run test:security`
2. **Integration Tests**: `npm run test:integration`

**Execution Time**: ~1-2 minutes

## Usage

### Normal Workflow

```bash
# Make changes to code
git add .

# Commit - hooks run automatically
git commit -m "feat: add new feature"

# Push - hooks run automatically
git push
```

### Bypassing Hooks

**Warning**: Bypassing hooks is not recommended for production code.

```bash
# Bypass pre-commit hook
git commit --no-verify -m "WIP: work in progress"

# Bypass pre-push hook
git push --no-verify
```

### Hook Output

When hooks run successfully:

```
🔐 Running pre-commit checks...
✅ BMAD security validation passed
📦 BMAD Web UI files changed, running quality checks...
🔍 Running ESLint...
✅ ESLint passed
🔒 Running security audit...
✅ Security audit passed (no high/critical vulnerabilities)
✅ All pre-commit checks passed!
```

## Troubleshooting

### ESLint Errors

If ESLint fails, fix the issues manually:

```bash
cd team/bmad-web-ui
npm run lint
```

Common fixes:
- Unescaped quotes in JSX: Use `&apos;` instead of `'`
- Unused variables: Remove or prefix with `_`
- Explicit `any` types: Use proper TypeScript types

### Security Audit Failures

If security audit fails:

```bash
cd team/bmad-web-ui
npm audit fix          # Attempt automatic fixes
npm audit              # Review issues manually
```

### Test Failures

If tests fail in pre-push:

```bash
cd team/bmad-web-ui
npm run test:security      # Run security tests
npm run test:integration   # Run integration tests
```

### Hooks Not Running

If hooks don't run automatically:

```bash
# Reinstall Husky from repository root
cd /path/to/BMAD-CYBER2  # Replace with your actual path
npm run prepare

# Verify hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

## Configuration

### Modifying Hooks

Edit hooks in `.husky/` directory at repository root:

```bash
# Edit pre-commit hook
nano .husky/pre-commit

# Edit pre-push hook
nano .husky/pre-push
```

### Disabling Hooks Temporarily

To disable hooks temporarily (not recommended):

```bash
# From repository root
git config core.hooksPath .git/hooks-old  # Rename hooks folder first
```

To re-enable:

```bash
git config core.hooksPath .husky
```

## CI/CD Integration

The hooks complement the CI/CD pipeline:

- **Pre-commit**: Fast feedback during development
- **Pre-push**: Full validation before sharing code
- **CI/CD**: Final validation with coverage reports

All three layers use the same test commands to ensure consistent behavior.

## Files

- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script
- `package.json` - Contains `prepare: "husky"` script

## References

- [Husky Documentation](https://github.com/typicode/husky)
- [ESLint Documentation](https://eslint.org/)
- [npm audit Documentation](https://docs.npmjs.com/cli/audit)
