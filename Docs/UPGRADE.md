# BMAD CYBERCOMMAND Upgrade Guide

This guide provides comprehensive instructions for upgrading BMAD CYBERCOMMAND between versions. Whether you are performing a patch, minor, or major upgrade, follow the appropriate sections to ensure a smooth transition.

**Current Version**: 2.0.0
**Documentation Version**: 1.0.0
**Last Updated**: January 2025

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Supported Upgrade Paths](#supported-upgrade-paths)
3. [Pre-Upgrade Checklist](#pre-upgrade-checklist)
4. [Upgrade Instructions](#upgrade-instructions)
5. [Breaking Changes by Version](#breaking-changes-by-version)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

For most upgrades, follow these 5 steps:

```bash
# 1. Check your current version
npx bmad-cybersec --version

# 2. Create a backup
npx bmad-cybersec backup create --name "pre-upgrade-$(date +%Y%m%d)"

# 3. Run the upgrade
npx bmad-cybersec update

# 4. Verify the installation
npx bmad-cybersec validate

# 5. Run post-upgrade tests
npx bmad-cybersec test --scope=smoke
```

> **Note**: Major version upgrades (e.g., 1.x to 2.x) require additional steps. See [Major Upgrades](#major-version-upgrades-1x--2x) below.

---

## Supported Upgrade Paths

### Version Compatibility Matrix

| From Version | To Version | Upgrade Type | Supported | Manual Steps Required |
|--------------|------------|--------------|-----------|----------------------|
| 2.0.x | 2.0.y | Patch | Yes | No |
| 2.0.x | 2.1.x | Minor | Yes | Minimal |
| 2.x.x | 2.y.x | Minor | Yes | Minimal |
| 1.x.x | 2.0.0 | Major | Yes | **Yes - See below** |
| 0.x.x | 2.0.0 | Major | No | Fresh install required |

### Module Compatibility

All team modules require BMAD Core >= 6.0.0:

| Module | Current Version | Core Requirement | NPM Package |
|--------|-----------------|------------------|-------------|
| cybersec-team | 1.3.0 | >= 6.0.0 | @bmad-cybercommand/cybersec-team |
| intel-team | 1.1.0 | >= 6.0.0 | @bmad-cybercommand/intel-team |
| legal-team | 1.0.0 | >= 6.0.0 | @bmad-cybercommand/legal-team |
| strategy-team | 1.0.0 | >= 6.0.0 | @bmad-cybercommand/strategy-team |

### Cross-Module Compatibility Rules

- **Same major version**: Modules with the same major version are always compatible
- **Mixed major versions**: Warning will be displayed; cross-module features may not work correctly
- **Pre-1.0 versions**: Not compatible with any 1.x or 2.x modules

---

## Pre-Upgrade Checklist

Complete this checklist before starting any upgrade:

### 1. Backup Verification

```bash
# Create a full backup
npx bmad-cybersec backup create --full

# Verify backup was created successfully
npx bmad-cybersec backup list
npx bmad-cybersec backup verify --latest
```

**Critical files to backup manually**:
- `_bmad/core/config.yaml` - Core configuration
- `_bmad/*/config.yaml` - Team-specific configurations
- `.claude/settings.json` - Claude Code settings
- `.claude/validators/` - Custom validators (if any)
- Any custom Party Mode presets

### 2. Version Requirements Check

```bash
# Check Node.js version (must be >= 18.0.0)
node --version

# Check npm version (must be >= 9.0.0)
npm --version

# Check current BMAD installation
npx bmad-cybersec doctor
```

### 3. Dependency Verification

```bash
# Verify all modules are compatible
npx bmad-cybersec check-compatibility

# List installed modules and versions
npx bmad-cybersec list
```

### 4. Pre-flight Checks

- [ ] No active workflows or Party Mode sessions running
- [ ] All pending changes committed to version control
- [ ] Sufficient disk space (>= 500MB recommended)
- [ ] Network connectivity for package downloads
- [ ] Read release notes for target version

---

## Upgrade Instructions

### Patch Upgrades (2.0.0 to 2.0.1)

Patch upgrades contain bug fixes, documentation updates, and security patches. These are safe and require no manual intervention.

**Risk Level**: Minimal
**Downtime**: None
**Rollback**: Automatic on failure

```bash
# Option 1: Automatic upgrade (recommended)
npx bmad-cybersec update --patch

# Option 2: Specific version
npx bmad-cybersec update --version 2.0.1

# Verify upgrade
npx bmad-cybersec validate
```

**What happens during patch upgrade**:
1. Downloads new version
2. Replaces module files
3. Verifies no breaking changes
4. Activates new version
5. Automatic rollback if validation fails

### Minor Upgrades (2.0.x to 2.1.0)

Minor upgrades add new features, agents, or workflows while maintaining backward compatibility.

**Risk Level**: Low
**Downtime**: Brief (< 1 minute)
**Rollback**: Manual (see [Rollback Procedures](#rollback-procedures))

```bash
# Step 1: Create recovery point
npx bmad-cybersec backup create --type pre_migration

# Step 2: Run pre-upgrade compatibility check
npx bmad-cybersec check-compatibility --target 2.1.0

# Step 3: Install new version
npx bmad-cybersec update --minor

# Step 4: Run post-install validation
npx bmad-cybersec validate --comprehensive

# Step 5: Update documentation references (if needed)
npx bmad-cybersec update-docs
```

**What to expect**:
- New agents available (non-conflicting)
- New workflows added (non-breaking)
- New Party Mode presets available
- Existing configurations preserved

### Major Version Upgrades (1.x to 2.x)

Major upgrades contain breaking changes and require coordinated module upgrades.

> **WARNING**: Major upgrades may modify configurations and data formats. Always backup before proceeding.

**Risk Level**: High
**Downtime**: Planned (15-30 minutes)
**Rollback**: Full restore required

#### Pre-Upgrade Steps

```bash
# 1. Stop all BMAD processes
pkill -f "bmad"

# 2. Create full system backup
npx bmad-cybersec backup create --full --name "v1-final-backup"

# 3. Export current configurations
npx bmad-cybersec config export --output ./backup/config-export.json
```

#### Upgrade Process

```bash
# 4. Upgrade BMAD Core first
npx bmad-cybersec update core --major

# 5. Run migration scripts
npx bmad-cybersec migrate --from 1.x --to 2.x

# 6. Upgrade all team modules together
npx bmad-cybersec update cybersec-team intel-team legal-team strategy-team --major

# 7. Validate all integrations
npx bmad-cybersec validate --comprehensive --cross-module

# 8. Run post-upgrade tests
npx bmad-cybersec test --scope=full
```

#### Post-Upgrade Verification

```bash
# Verify agents are accessible
npx bmad-cybersec agent list

# Verify Party Mode presets
npx bmad-cybersec party-mode list

# Verify cross-module workflows
npx bmad-cybersec workflow validate --cross-module
```

#### Upgrade Order (Important)

For major upgrades, follow this dependency order:

1. **BMAD Core** (always first)
2. **Specialized Teams** (any order, but upgrade together)
3. **Custom Plugins** (after all core modules)

---

## Breaking Changes by Version

### Version 2.0.0 (from 1.x)

#### Configuration Changes

| Change | Migration Action |
|--------|------------------|
| Party Mode preset schema v2.0 | Run `migrate --preset-schema` |
| Abdul orchestration API changes | Update custom integrations |
| Cross-module workflow trigger framework | Review workflow definitions |
| Agent parameter schema changes | Run `migrate --agent-schemas` |
| Workflow output format changes | Update output parsers |

#### Removed Features

- Pre-1.0 agent naming conventions
- Legacy workflow syntax
- Core 5.x compatibility layer

#### New Requirements

- BMAD Core >= 6.0.0 required for all team modules
- Node.js >= 18.0.0 required
- Updated Claude Code hooks format

#### Migration Script

```bash
# Run comprehensive migration from 1.x to 2.x
npx bmad-cybersec migrate \
  --from 1.x \
  --to 2.x \
  --include-configs \
  --include-presets \
  --dry-run  # Remove --dry-run when ready to execute
```

### Version 1.0.0 (Initial Release)

No breaking changes (initial release).

---

## Rollback Procedures

BMAD CYBERCOMMAND includes a sophisticated RollbackManager that supports multiple rollback strategies.

### Rollback Strategies

| Strategy | Speed | Safety | Use Case |
|----------|-------|--------|----------|
| **Conservative** | Slow | Highest | Standard rollbacks |
| **Balanced** | Medium | High | Time-sensitive situations |
| **Fast** | Fast | Medium | Quick recovery needed |
| **Emergency** | Fastest | Basic | Critical failures |

### Automatic Rollback

For patch upgrades, rollback happens automatically on failure:

```bash
# Automatic rollback is enabled by default
npx bmad-cybersec update --patch
# If validation fails, system automatically restores previous version
```

### Manual Rollback

For minor and major upgrades, use manual rollback:

```bash
# List available recovery points
npx bmad-cybersec rollback list

# Rollback to specific recovery point
npx bmad-cybersec rollback --to <recovery-point-id>

# Rollback to previous version (latest recovery point)
npx bmad-cybersec rollback --latest

# Force rollback (skip validation)
npx bmad-cybersec rollback --latest --strategy emergency
```

### Rollback from Major Upgrade

If a 1.x to 2.x upgrade fails:

```bash
# 1. Stop all BMAD processes
pkill -f "bmad"

# 2. Restore from backup
npx bmad-cybersec backup restore --name "v1-final-backup"

# 3. Reinstall packages
npm ci

# 4. Verify restoration
npx bmad-cybersec validate
```

### Emergency Recovery

If standard rollback fails:

```bash
# Emergency recovery (minimal validation, force restore)
npx bmad-cybersec rollback --emergency

# If emergency recovery fails, manual restore required:
# 1. Remove node_modules
rm -rf node_modules

# 2. Restore package.json from backup
cp backup/package.json .

# 3. Restore package-lock.json from backup
cp backup/package-lock.json .

# 4. Fresh install
npm ci

# 5. Restore configurations
cp -r backup/_bmad .
```

### Downgrade Support

| Downgrade Type | Supported | Notes |
|----------------|-----------|-------|
| Patch (2.0.2 to 2.0.1) | Yes | Reverse of patch upgrade |
| Minor (2.1.0 to 2.0.x) | Limited | Only if new features not used |
| Major (2.x to 1.x) | No | Restore from backup required |

---

## Troubleshooting

### Common Issues

#### COMPAT_001: Core Version Too Low

**Error**: `Core version X.Y.Z is below minimum required X.Y.Z`

**Solution**:
```bash
# Upgrade BMAD Core first
npx bmad-cybersec update core
```

#### COMPAT_002: Agent Name Conflict

**Error**: `Agent name 'X' exists in both module1 and module2`

**Solution**:
1. Check if conflict is intentional (same agent in different modules)
2. If unintentional, contact support or rename agent in custom module
3. Update all references to renamed agent

#### COMPAT_003: Workflow ID Conflict

**Error**: `Workflow ID 'X' is duplicated`

**Solution**:
```bash
# List conflicting workflows
npx bmad-cybersec workflow list --conflicts

# Update workflow naming to use unique IDs
# Format: {module_code}:{workflow-name}
```

#### VER_001: Mixed Major Versions

**Warning**: `Mixed major versions detected: [versions]`

**Solution**:
```bash
# Upgrade all modules to same major version
npx bmad-cybersec update --all --major
```

#### VER_003: Security Vulnerability

**Error**: `Security vulnerability in module X version Y`

**Solution**:
```bash
# Upgrade affected module immediately
npx bmad-cybersec update <module-name> --security
```

### Upgrade Fails at Validation

```bash
# Check validation logs
npx bmad-cybersec logs --validation

# Run detailed diagnostics
npx bmad-cybersec doctor --verbose

# Attempt repair
npx bmad-cybersec repair
```

### Module Not Loading After Upgrade

```bash
# Verify module paths exist
npx bmad-cybersec verify-paths

# Check for missing dependencies
npx bmad-cybersec check-deps

# Reinstall specific module
npx bmad-cybersec reinstall <module-name>
```

### Party Mode Presets Not Working

```bash
# Validate presets
npx bmad-cybersec party-mode validate

# Check cross-module references
npx bmad-cybersec party-mode check-refs

# Regenerate preset cache
npx bmad-cybersec party-mode rebuild-cache
```

### Getting Help

1. **Check Documentation**:
   - `Docs/02-user-guides/BMAD-DEPENDENCY-MANAGEMENT-GUIDE.md`
   - `Docs/02-user-guides/module-compatibility-matrix.md`

2. **Run Diagnostics**:
   ```bash
   npx bmad-cybersec doctor --full-report > diagnostic-report.txt
   ```

3. **Contact Support**:
   - GitHub Issues: https://github.com/blackunicorn-tech/bmad-cybercommand/issues
   - Include diagnostic report and version information

4. **Community Resources**:
   - Discord: [BMAD Community]
   - Documentation: [Official Docs]

---

## Additional Resources

- [CHANGELOG.md](./CHANGELOG.md) - Full version history
- [Module Compatibility Matrix](./Docs/02-user-guides/module-compatibility-matrix.md) - Detailed compatibility information
- [Version Compatibility Rules](./src/config/version-compatibility-rules.yaml) - Technical specifications
- [Operational Runbooks](./Docs/02-user-guides/Operations/OPERATIONAL-RUNBOOKS.md) - Operational procedures

---

**Document Control**:
- Author: BlackUnicorn.Tech
- Version: 1.0.0
- Last Updated: January 2025
- Review Schedule: Quarterly
