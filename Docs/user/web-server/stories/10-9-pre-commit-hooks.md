# Story 10.9: Pre-Commit Hooks Setup

**ID:** 10-9-pre-commit-hooks
**Epic:** 10 - Testing & Quality Assurance
**Status:** ready-for-dev
**Priority:** Low
**Estimate:** 2 hours
**Dependencies:** 10-1-fix-test-failures

---

## DESCRIPTION

Set up git hooks using Husky to run tests and linting before committing, ensuring only quality code enters the repository.

## ACCEPTANCE CRITERIA

- [ ] Pre-commit hook runs security tests
- [ ] Pre-commit hook runs linter
- [ ] Pre-push hook runs full test suite
- [ ] Hooks can be bypassed with --no-verify
- [ ] Documentation explains hook usage

## IMPLEMENTATION STEPS

### Step 1: Install Husky

```bash
cd /Users/paultinp/BMAD-CYBER2/team/bmad-web-ui
npm install -D husky
npx husky install
```

### Step 2: Create Pre-Commit Hook

```bash
npx husky add .husky/pre-commit "npm run test:security && npm run lint"
```

The `.husky/pre-commit` file should contain:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running security tests..."
npm run test:security
SECURITY_EXIT=$?

echo "Running linter..."
npm run lint
LINT_EXIT=$?

if [ $SECURITY_EXIT -ne 0 ] || [ $LINT_EXIT -ne 0 ]; then
  echo ""
  echo "❌ Pre-commit checks failed!"
  echo "Security tests: $([ $SECURITY_EXIT -eq 0 ] && echo '✓' || echo '✗')"
  echo "Linter: $([ $LINT_EXIT -eq 0 ] && echo '✓' || echo '✗')"
  echo ""
  echo "Use 'git commit --no-verify' to bypass (not recommended)"
  exit 1
fi

echo "✓ All pre-commit checks passed!"
```

### Step 3: Create Pre-Push Hook

```bash
npx husky add .husky/pre-push "npm run test:suite"
```

The `.husky/pre-push` file should contain:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running full test suite..."
npm run test:suite

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Tests failed!"
  echo ""
  echo "Fix failing tests before pushing."
  echo "Use 'git push --no-verify' to bypass (not recommended)"
  exit 1
fi

echo "✓ All tests passed!"
```

### Step 4: Create Commit Message Hook (Optional)

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

Requires commitlint:

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

Create `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // New feature
      'fix',      // Bug fix
      'docs',     // Documentation only
      'style',    // Code style changes
      'refactor', // Code refactoring
      'test',     // Adding tests
      'chore',    // Maintenance
      'security', // Security fix
    ]],
    'scope-enum': [2, 'always', [
      'auth',
      'cli',
      'security',
      'api',
      'ui',
      'tests',
      'docs',
    ]],
  },
};
```

### Step 5: Update package.json

Add prepare script:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

Add hook management scripts:

```json
{
  "scripts": {
    "hooks:install": "husky install",
    "hooks:uninstall": "husky uninstall",
    "hooks:list": "ls -la .husky/"
  }
}
```

### Step 6: Create Hook Documentation

Create `docs/git-hooks.md`:

```markdown
# Git Hooks

## Hooks Configured

### Pre-Commit
Runs before each commit:
- Security tests
- Linter

**Bypass:** `git commit --no-verify`

### Pre-Push
Runs before each push:
- Full test suite (security + integration)

**Bypass:** `git push --no-verify`

### Commit Message
Validates commit message format:
- Must start with type: (feat, fix, docs, etc.)
- Must include scope if applicable

**Examples:**
- `feat(auth): add OAuth support`
- `fix(security): patch prompt injection vulnerability`
- `docs: update API documentation`

## Troubleshooting

### Hooks not running
```bash
npm run hooks:install
```

### Skip hooks (not recommended)
```bash
git commit --no-verify -m "message"
git push --no-verify
```

### List hooks
```bash
npm run hooks:list
```
```

### Step 7: Test Hooks

```bash
# Test pre-commit
echo "test" > test.txt
git add test.txt
git commit -m "test commit"
# Should run security tests and linter

# Test pre-push
git push origin HEAD:test-hooks
# Should run full test suite
```

## FILES TO CREATE

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.husky/pre-commit`
2. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.husky/pre-push`
3. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/.husky/commit-msg` (optional)
4. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/commitlint.config.js` (optional)
5. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/docs/git-hooks.md`

## FILES TO MODIFY

1. `/Users/paultinp/BMAD-CYBER2/team/bmad-web-ui/package.json`

## OPTIONAL ENHANCEMENTS

### lint-staged for faster runs

```bash
npm install -D lint-staged
```

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

Update pre-commit hook:

```bash
npx husky set .husky/pre-commit "npx lint-staged"
```

## RISKS

| Risk | Mitigation |
|------|------------|
| Hooks slow down development | Only run critical checks in pre-commit |
| Hooks bypassed frequently | Document why bypassing is bad |
| Hooks don't work after npm install | Use prepare script |

## DEFINITION OF DONE

- [ ] Husky installed
- [ ] Pre-commit hook created and tested
- [ ] Pre-push hook created and tested
- [ ] Commit message hook created (optional)
- [ ] Documentation created
- [ ] Hooks prevent bad commits
- [ ] Team trained on hook usage
