# Branch Protection Configuration

This document describes the GitHub branch protection rules for the BMAD Web UI project.

## Purpose

Branch protection rules ensure that:
- All code changes pass automated quality checks
- Security tests pass before merging
- Pull requests are reviewed before merging
- The main branch is always stable

## Required Status Checks

The following GitHub Actions workflows must pass before merging:

### Required Checks (Block Merge)

| Check Name | Workflow | Description |
|------------|----------|-------------|
| `Security Tests` | `.github/workflows/web-ui-ci.yml` | OWASP Top 10, security audit, security tests |
| `Unit & Integration Tests` | `.github/workflows/web-ui-ci.yml` | All unit and integration tests with coverage |
| `Lint & Build` | `.github/workflows/web-ui-ci.yml` | ESLint and build verification |
| `Quality Gate` | `.github/workflows/web-ui-ci.yml` | Final gate that all required jobs passed |

### Optional Checks (Do Not Block Merge)

| Check Name | Workflow | Description |
|------------|----------|-------------|
| `E2E Tests` | `.github/workflows/web-ui-ci.yml` | Playwright end-to-end tests |
| `Performance Tests` | `.github/workflows/web-ui-ci.yml` | K6 performance/load tests |

## Branch Protection Rules

### Main Branch (`main`)

**Required:**
- [x] Require a pull request before merging
  - [x] Require approvals: 1
  - [x] Dismiss stale reviews when new commits are pushed
- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - Required checks:
    - `Security Tests`
    - `Unit & Integration Tests`
    - `Lint & Type Check`
    - `Quality Gate`
- [x] Do not allow bypassing the above settings
- [x] Require conversation resolution before merging

**Optional:**
- [ ] Restrict who can push to matching branches
- [ ] Require signed commits
- [ ] Require linear history
- [ ] Restrict deployments

### Development Branch (`develop`)

Same rules as main branch, with:
- Required approvals: 1 (can be from team members)
- All required status checks must pass

### Feature Branches (`WEB-UI`, `feature/*`)

No branch protection rules - these are for development work.

## Setting Up Branch Protection

### Via GitHub UI

1. Go to **Settings** > **Branches**
2. Click **Add branch protection rule**
3. Enter branch name pattern: `main` or `develop`
4. Configure the settings as above
5. Click **Create**

### Via GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh

# Login to GitHub
gh auth login

# Apply branch protection to main branch
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/OWNER/REPO/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["Security Tests","Unit & Integration Tests","Lint & Type Check","Quality Gate"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f allow_deletions=false
```

Replace `OWNER/REPO` with your repository owner and name.

## Pre-Merge Checklist

Before creating a pull request, ensure:

1. **Tests Pass Locally**
   ```bash
   cd team/bmad-web-ui
   npm run test:security
   npm run test:integration
   npm run lint
   ```

2. **Build succeeds**
   ```bash
   npm run build
   ```

3. **No new security vulnerabilities**
   ```bash
   npm audit --audit-level=high
   ```

4. **Code is reviewed**
   - Self-review your changes
   - Request review from a teammate

## CI/CD Workflow Triggers

The CI workflow runs on:

- **Push** to `main`, `develop`, or `WEB-UI` branches
- **Pull Request** to `main`, `develop`, or `BMAD-CYBEROPS-RP` branches
- **Manual Dispatch** via GitHub Actions UI

### Manual Workflow Dispatch

To run CI manually:
1. Go to **Actions** tab in GitHub
2. Select **BMAD Web UI CI/CD** workflow
3. Click **Run workflow**
4. Select branch and options:
   - Run E2E tests: `true`/`false`
   - Run performance tests: `true`/`false`

## Troubleshooting

### Status Check Not Appearing

If a status check doesn't appear:
1. Check the workflow file exists at `.github/workflows/web-ui-ci.yml` (root) or `team/bmad-web-ui/.github/workflows/ci.yml`
2. Verify the working directory is set correctly
3. Check that the workflow completes successfully
4. Wait a few minutes for GitHub to update

### Flaky Tests

If tests fail intermittently:
1. Check the test logs in the Actions tab
2. Run tests locally with same Node version (`20`)
3. Check for race conditions or timing issues
4. Consider increasing test timeouts

### Coverage Requirements

Current coverage targets:
- Security modules: 100%
- Authentication: 95%
- Authorization: 95%
- CLI Bridge: 90%

## Security Best Practices

1. **Never bypass branch protection** for security fixes
2. **Always require review** for any code change
3. **Keep dependencies updated** and audit regularly
4. **Rotate secrets** used in CI/CD
5. **Review access** to branch protection settings

## References

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [BMAD Web UI CI/CD Workflow](./ci.yml)
- [Comprehensive Testing Strategy](./COMPREHENSIVE-TESTING-STRATEGY.md)
