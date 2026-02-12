# BMAD-CYBERSEC NPX Installer

**One-command installation for BMAD-CYBERSEC framework**

```bash
npx bmad-cybersec install
```

## Overview

The NPX installer provides a streamlined way to add BMAD-CYBER framework to any existing project without manual file copying or complex setup procedures.

## Installation Methods

### Quick Install (Recommended)

```bash
# Install latest release to current directory
npx bmad-cybersec install

# Install to a specific directory
npx bmad-cybersec install ./my-project

# Install specific version
npx bmad-cybersec install --version v2.0.0
```

### From Git (Development)

```bash
# Install from main branch
npx bmad-cybersec install --from-git

# Install from specific branch
npx bmad-cybersec install --from-git --branch develop
```

### Non-Interactive Mode

```bash
# Skip all prompts and use defaults
npx bmad-cybersec install --yes

# Force overwrite existing files
npx bmad-cybersec install --force
```

## Command Reference

### `install` Command

Installs BMAD-CYBER framework files to a target directory.

```
npx bmad-cybersec install [target-dir] [options]
```

**Arguments:**

- `target-dir` - Target directory (defaults to current directory)

**Options:**

| Option | Description |
|--------|-------------|
| `-v, --version <tag>` | Install specific version (e.g., `v2.0.0`) |
| `--from-git` | Clone from Git instead of downloading release |
| `--branch <name>` | Git branch to clone (default: `main`) |
| `--force` | Overwrite existing files without prompting |
| `--yes, -y` | Skip confirmation prompts |
| `--dry-run` | Preview files without installing |
| `--with-docs` | Include documentation files |
| `--with-dev` | Include development tools |
| `--verbose` | Enable verbose logging |

**Examples:**

```bash
# Preview what would be installed
npx bmad-cybersec install --dry-run

# Install with documentation
npx bmad-cybersec install --with-docs

# CI/CD installation (non-interactive)
npx bmad-cybersec install --yes --force
```

### `version` Command

Display the installer version.

```bash
npx bmad-cybersec --version
```

### `help` Command

Display help information.

```bash
npx bmad-cybersec --help
npx bmad-cybersec install --help
```

## What Gets Installed

### Core Files (Always)

- `_bmad/` - BMAD agent configurations and workflows
- `.claude/` - Claude Code MCP configuration
- `src/utility/tools/` - Framework utility scripts
- `CLAUDE.md` - Project instructions for Claude

### Optional Files

- `Docs/` - Documentation (with `--with-docs`)
- `dev-tools/` - Development utilities (with `--with-dev`)

### Excluded Files (Never Installed)

- `.git/` - Git repository data
- `node_modules/` - Dependencies
- `*.test.js`, `*.spec.js` - Test files
- `coverage/` - Code coverage data
- `.github/` - GitHub workflows

### Package.json Updates

The installer automatically merges BMAD dependencies into your `package.json`:

**Scripts added:**

```json
{
  "scripts": {
    "bmad:setup": "node src/utility/tools/setup-wizard/index.js",
    "bmad:modules": "node src/utility/tools/module-selector/index.js",
    "bmad:security": "node src/utility/tools/security-config/index.js",
    "bmad:llm": "node src/utility/tools/llm-setup/index.js",
    "bmad:health": "node src/utility/tools/health-check/index.js"
  }
}
```

**Dependencies added:**

- `chalk` - Terminal styling
- `inquirer` - Interactive prompts
- `zod` - Schema validation
- `commander` - CLI framework
- `ora` - Terminal spinners

## Troubleshooting

### Installation Issues

#### "Release not found" Error

```
Error: Release v99.99.99 not found
```

**Cause:** The specified version doesn't exist.

**Solution:**

1. Check available releases: <https://github.com/SchenLong/BMAD-CYBERSEC/releases>
2. Use `latest` or omit version flag for latest release
3. Verify the version tag format (e.g., `v2.0.0` not `2.0.0`)

#### "GitHub API rate limit exceeded" Error

```
Error: GitHub API rate limit exceeded. Set GITHUB_TOKEN or try again later.
```

**Cause:** Too many requests to GitHub API without authentication.

**Solutions:**

1. Wait 1 hour for rate limit reset
2. Set a GitHub token:

   ```bash
   export GITHUB_TOKEN=your_personal_access_token
   npx bmad-cybersec install
   ```

3. Use Git clone method instead:

   ```bash
   npx bmad-cybersec install --from-git
   ```

#### "Checksum verification failed" Error

```
Error: Checksum verification failed. File may be corrupted.
```

**Cause:** Downloaded file doesn't match expected checksum.

**Solutions:**

1. Retry the installation (network issue):

   ```bash
   npx bmad-cybersec install
   ```

2. Clear npm cache and retry:

   ```bash
   npm cache clean --force
   npx bmad-cybersec install
   ```

3. Use Git clone as fallback:

   ```bash
   npx bmad-cybersec install --from-git
   ```

#### "Git is not installed" Error

```
Error: Git is not installed or not in PATH.
```

**Cause:** Using `--from-git` without Git installed.

**Solutions:**

1. Install Git: <https://git-scm.com/downloads>
2. Use release download method (without `--from-git`):

   ```bash
   npx bmad-cybersec install
   ```

#### "Download failed: 500" Error

```
Error: Download failed: 500
```

**Cause:** GitHub server error.

**Solutions:**

1. Wait a few minutes and retry
2. Check GitHub status: <https://www.githubstatus.com/>
3. Use Git clone as fallback:

   ```bash
   npx bmad-cybersec install --from-git
   ```

### File Conflict Issues

#### Existing Files Would Be Overwritten

```
Found 5 existing files that would be overwritten:
  - _bmad/core/config.yaml
  - .claude/settings.json
  ...
```

**Options:**

1. **Overwrite all** - Replace all existing files
2. **Skip existing** - Only install new files
3. **Cancel** - Abort installation

**To avoid prompt:**

```bash
# Skip existing files automatically
npx bmad-cybersec install --yes

# Overwrite all files automatically
npx bmad-cybersec install --force
```

### Package.json Issues

#### Backup Created But Installation Failed

If you see a backup file like `package.json.backup.1706547200000`:

1. Your original `package.json` is safe in the backup
2. To restore:

   ```bash
   cp package.json.backup.* package.json
   ```

#### Merge Conflicts with Existing Dependencies

The installer preserves your existing dependency versions. If you need BMAD's exact versions:

1. Check the diff shown during installation
2. Manually update versions in `package.json` if needed
3. Run `npm install` to update

### Network Issues

#### Slow Download or Timeout

```bash
# Increase timeout (default is 2 minutes for git clone)
npx bmad-cybersec install --from-git

# Or use release download which has automatic retries
npx bmad-cybersec install
```

#### Behind Corporate Proxy

```bash
# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Then install
npx bmad-cybersec install
```

### Environment Issues

#### Node.js Version Too Old

```
Error: BMAD-CYBER requires Node.js >= 18.0.0
```

**Solution:** Upgrade Node.js to version 18 or later:

- <https://nodejs.org/>
- Using nvm: `nvm install 18 && nvm use 18`

#### Permission Denied

```
Error: EACCES: permission denied
```

**Solutions:**

1. Don't use `sudo` with npm/npx
2. Fix npm permissions: <https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally>
3. Install to a directory you own:

   ```bash
   npx bmad-cybersec install ~/my-project
   ```

### Getting More Information

#### Enable Verbose Logging

```bash
npx bmad-cybersec install --verbose
```

This shows:

- Detailed progress information
- File-by-file extraction
- Network request details

#### Preview Before Installing

```bash
npx bmad-cybersec install --dry-run
```

This shows:

- All files that would be extracted
- Changes to package.json
- No actual modifications made

## Security

### For Maintainers

#### NPM Publishing Requirements

**Two-Factor Authentication (2FA) is REQUIRED** for publishing to npm.

Before publishing any release:

1. Enable 2FA on your npm account: <https://docs.npmjs.com/configuring-two-factor-authentication>
2. Use an authentication app (not SMS) for security
3. The npm account must have **publish** 2FA level enabled

```bash
# Verify 2FA is enabled before publishing
npm profile get

# Should show:
# two-factor auth: auth-and-writes
```

#### Token Security

- NPM tokens are stored in GitHub Secrets (never in code)
- Tokens are never logged or displayed in workflow outputs
- Use scoped tokens with minimal permissions
- Rotate tokens periodically (recommended: every 90 days)

#### Release Signing

All releases include:

- SHA256 checksums for tarball verification
- Provenance attestation via `--provenance` flag
- Git tags for version tracking

### For Users

#### Download Verification

The installer automatically verifies downloads:

- **Mandatory checksum verification** - all downloads are validated against SHA256 checksums
- **HTTPS only** - all network requests use secure connections
- **Trusted hosts only** - downloads restricted to github.com domains

#### Safe Installation Practices

```bash
# Always verify the package source
npm view bmad-cybersec

# Check package integrity
npm audit

# Review what will be installed before proceeding
npx bmad-cybersec install --dry-run
```

#### Reporting Security Issues

For security vulnerabilities, please:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to the maintainers directly
3. Include reproduction steps and impact assessment

---

## Development

### Running Tests

```bash
cd tools/npx
npm install
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

Coverage thresholds: 80% for lines, functions, branches, and statements.

### Project Structure

```
tools/npx/
├── cli.js              # CLI entry point
├── index.js            # Main export
├── commands/
│   └── install.js      # Install command implementation
├── lib/
│   ├── config.js       # Configuration constants
│   ├── downloader.js   # GitHub release downloader
│   ├── extractor.js    # Tarball extraction
│   ├── git-clone.js    # Git clone functionality
│   ├── logger.js       # Logging utilities
│   ├── package-merger.js # Package.json merging
│   └── utils.js        # Helper utilities
├── __tests__/
│   ├── downloader.test.js
│   ├── extractor.test.js
│   ├── git-clone.test.js
│   ├── install.e2e.test.js
│   ├── package-merger.test.js
│   └── fixtures/
├── scripts/
│   └── postinstall.js  # Post-installation script
├── package.json
├── vitest.config.js
└── README.md
```

## Support

For issues with the NPX installer:

1. Check this troubleshooting guide
2. Search existing issues: <https://github.com/SchenLong/BMAD-CYBERSEC/issues>
3. Create a new issue with:
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Operating system
   - Full error message
   - Command used

## License

MIT License - See [LICENSE](../../LICENSE) for details.
