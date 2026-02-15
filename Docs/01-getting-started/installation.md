# Installation Guide

Complete guide to installing BMAD-CYBER in your project.

---

## Prerequisites

Before installing BMAD-CYBER, ensure your system meets the following requirements:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | >= 20.0.0 | Required for the installer and runtime |
| **npm** or **npx** | >= 10.0.0 | Comes with Node.js |
| **Git** | Any | Optional, only needed for `--from-git` installation |

### Verifying Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v20.0.0 or higher

# Check npm version
npm --version
# Should output: 10.0.0 or higher

# Check Git (optional)
git --version
```

---

## Installation Methods

### Method 1: NPX (Recommended)

The simplest way to install BMAD-CYBER using the NPX installer:

```bash
# Navigate to your project directory (or create a new one)
cd your-project

# Run the installer
npx @blackunicorn/bmad-cybersec install
```

The installer will:

1. Download the latest BMAD-CYBER release
2. Extract framework files to your project
3. Configure package.json with required dependencies
4. Run npm install
5. Launch the setup wizard
6. Verify installation with a health check

### Method 2: Git Clone (Manual)

For development or when you need full repository access:

```bash
# Clone the repository
git clone https://github.com/SchenLong/BMAD-CYBER2.git
cd BMAD-CYBER2

# Install dependencies
npm install

# Run setup wizard manually
npm run modules
npm run security:config
```

---

## Installation Options Reference

The `npx @blackunicorn/bmad-cybersec install` command supports the following options:

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --version <tag>` | Install a specific version | `latest` |
| `-b, --branch <name>` | Install from a specific branch | - |
| `--from-git` | Clone from Git instead of downloading release | `false` |
| `--modules <list>` | Pre-select modules (comma-separated) | - |
| `--security-tier <tier>` | Pre-select security tier | - |
| `-y, --yes` | Accept all defaults (non-interactive) | `false` |
| `--skip-wizard` | Skip the setup wizard | `false` |
| `--skip-npm-install` | Skip npm install step | `false` |
| `--with-docs` | Include documentation files | `false` |
| `--with-dev` | Include development tools | `false` |
| `--force` | Overwrite existing files without prompting | `false` |
| `--dry-run` | Show what would be installed without making changes | `false` |

### Examples

```bash
# Install with default settings
npx @blackunicorn/bmad-cybersec install

# Install a specific version
npx @blackunicorn/bmad-cybersec install --version v2.0.0

# Install from a specific branch
npx @blackunicorn/bmad-cybersec install --from-git --branch develop

# Non-interactive installation with pre-selected modules
npx @blackunicorn/bmad-cybersec install -y --modules cybersec-team,intel-team --security-tier standard

# Preview installation without making changes
npx @blackunicorn/bmad-cybersec install --dry-run

# Install with documentation and dev tools
npx @blackunicorn/bmad-cybersec install --with-docs --with-dev

# Force reinstall over existing files
npx @blackunicorn/bmad-cybersec install --force
```

---

## Step-by-Step Guide

### Creating a New Project

1. **Create project directory:**

   ```bash
   mkdir my-project
   cd my-project
   ```

2. **Initialize npm (optional):**

   ```bash
   npm init -y
   ```

3. **Run BMAD-CYBER installer:**

   ```bash
   npx @blackunicorn/bmad-cybersec install
   ```

4. **Follow the setup wizard:**
   - Select modules to install (cybersec-team, intel-team, strategy-team, legal-team)
   - Choose security tier (minimal, standard, hardened, paranoid)
   - Configure LLM provider preferences

### Installing in an Existing Project

1. **Navigate to your project:**

   ```bash
   cd your-existing-project
   ```

2. **Run the installer:**

   ```bash
   npx @blackunicorn/bmad-cybersec install
   ```

   The installer will:
   - Detect existing package.json
   - Merge BMAD-CYBER dependencies without overwriting your existing dependencies
   - Create backup of package.json before modification
   - Preserve your existing project structure

3. **Review merged package.json:**

   The installer preserves your existing configuration while adding:
   - Required BMAD-CYBER dependencies
   - Utility scripts (`npm run health`, `npm run modules`, etc.)

### Non-Interactive Installation (CI/CD)

For automated deployments and CI/CD pipelines:

```bash
# Full non-interactive install with all defaults
npx @blackunicorn/bmad-cybersec install -y

# Non-interactive with specific configuration
npx @blackunicorn/bmad-cybersec install -y \
  --modules cybersec-team,intel-team \
  --security-tier standard \
  --skip-wizard
```

**CI/CD Example (GitHub Actions):**

```yaml
- name: Install BMAD-CYBER
  run: npx @blackunicorn/bmad-cybersec install -y --skip-wizard
```

---

## Post-Installation

### Verifying Installation

After installation, verify that BMAD-CYBER is correctly installed:

```bash
# Check for required directories
ls -la _bmad .claude

# Verify CLAUDE.md exists
cat CLAUDE.md | head -20
```

Expected directory structure:

```
your-project/
├── _bmad/                  # BMAD framework core
│   ├── core/               # Core utilities and security
│   ├── cybersec-team/      # Security agents (if selected)
│   ├── intel-team/         # Intelligence agents (if selected)
│   ├── strategy-team/      # Strategy agents (if selected)
│   └── legal-team/         # Legal agents (if selected)
├── .claude/                # Claude Code integration
│   ├── commands/           # Slash commands
│   ├── hooks/              # Hooks and validators
│   └── settings.json       # Claude settings
├── CLAUDE.md               # Claude instructions
└── package.json            # Updated with BMAD dependencies
```

### Running Health Check

Run the built-in health check to verify all components:

```bash
npm run health
```

The health check verifies:

- Required directories exist
- Configuration files are valid
- Dependencies are installed
- Security validators are operational

### Next Steps

1. **Open in Claude Code:**

   ```bash
   claude .
   ```

2. **Start with the master orchestrator:**

   ```
   /agents/abdul
   ```

3. **Or explore available agents:**

   ```
   /help
   ```

4. **Configure additional options:**

   ```bash
   # Select active modules
   npm run modules

   # Configure security tier
   npm run security:config

   # Set up LLM provider
   npm run llm:setup
   ```

---

## Updating BMAD-CYBER

### Check for Updates

Check if a newer version is available without installing:

```bash
npx @blackunicorn/bmad-cybersec update --check
```

### Update to Latest Version

Update your installation to the latest version:

```bash
npx @blackunicorn/bmad-cybersec update
```

The update process:

1. Detects current version
2. Downloads the latest release
3. Backs up your configurations
4. Installs the update
5. Restores your configurations
6. Updates dependencies

### Update Options

| Option | Description |
|--------|-------------|
| `-v, --version <tag>` | Update to a specific version |
| `--check` | Only check for updates, do not install |
| `--force` | Force reinstall even if on latest version |
| `--with-docs` | Include documentation in update |
| `--with-dev` | Include development tools in update |

### Examples

```bash
# Check for available updates
npx @blackunicorn/bmad-cybersec update --check

# Update to latest version
npx @blackunicorn/bmad-cybersec update

# Update to a specific version
npx @blackunicorn/bmad-cybersec update --version v2.1.0

# Force reinstall current version
npx @blackunicorn/bmad-cybersec update --force
```

### Preserved During Updates

The following configurations are automatically preserved during updates:

- `_bmad/core/config.yaml`
- `_bmad/_config/` (all custom configurations)
- `.claude/settings.local.json`
- `.env` and `.env.local`

---

## Uninstallation

To completely remove BMAD-CYBER from your project:

### Manual Removal Steps

1. **Remove BMAD directories:**

   ```bash
   rm -rf _bmad
   rm -rf .claude
   ```

2. **Remove CLAUDE.md:**

   ```bash
   rm CLAUDE.md
   ```

3. **Clean up package.json:**

   Edit `package.json` to remove BMAD-specific scripts and dependencies:

   **Scripts to remove:**

   ```json
   {
     "scripts": {
       "modules": "...",
       "security:config": "...",
       "llm:setup": "...",
       "health": "...",
       "pgp:setup": "..."
     }
   }
   ```

   **Dependencies to remove:**

   ```json
   {
     "dependencies": {
       "@bmad/validators": "..."
     }
   }
   ```

4. **Remove backup directory (if exists):**

   ```bash
   rm -rf .bmad-backup
   ```

5. **Reinstall dependencies:**

   ```bash
   npm install
   ```

---

## Related Documentation

- [Quick Start Guide](./quick-start.md) - Get up and running quickly
- [Troubleshooting](../02-user-guides/TROUBLESHOOTING.md) - Common issues and solutions
- [Module Selection](../02-user-guides/MODULES-OVERVIEW.md) - Detailed module configuration
- [Security Configuration](../02-user-guides/SECURITY-OVERVIEW.md) - Security tier details
