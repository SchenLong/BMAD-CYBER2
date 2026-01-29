#!/usr/bin/env node
/**
 * BMAD Semantic Version Manager
 * Semantic versioning integration for Module Packaging Workflow Engine
 *
 * Manages version numbers for BMAD modules following semantic versioning.
 * Provides automated version bumping, changelog generation, and release tagging.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

/**
 * BMAD Semantic Version Manager Class
 * Handles semantic versioning for multi-module BMAD packages
 */
class BMAdVersionManager {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      outputRoot: options.outputRoot || '/Users/paultinp/BMAD-CYBER2/_bmad-output/dist',
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      ...options
    };

    this.currentVersions = {};
    this.versionHistory = [];
    this.changeLog = [];
  }

  /**
   * Initialize version management system
   */
  async initialize() {
    console.log('🏷️  BMAD Semantic Version Manager v1.0.0');
    console.log('='.repeat(45));

    // Load current versions
    await this.loadCurrentVersions();

    // Load version history if available
    await this.loadVersionHistory();

    console.log('✅ Version manager initialized');
  }

  /**
   * Load current versions from module configurations
   */
  async loadCurrentVersions() {
    const modules = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

    for (const module of modules) {
      const modulePath = path.join(this.options.sourceRoot, module, 'module.yaml');

      try {
        const content = await fs.readFile(modulePath, 'utf8');
        const config = yaml.load(content);

        this.currentVersions[module] = {
          current: config.module_version || '1.0.0',
          name: config.name || module,
          lastUpdated: new Date().toISOString()
        };

      } catch (error) {
        console.warn(`⚠️  Could not load version for ${module}: ${error.message}`);
        this.currentVersions[module] = {
          current: '1.0.0',
          name: module,
          lastUpdated: new Date().toISOString()
        };
      }
    }

    if (this.options.verbose) {
      console.log('📊 Current versions:');
      Object.entries(this.currentVersions).forEach(([module, info]) => {
        console.log(`  ${module}: v${info.current}`);
      });
    }
  }

  /**
   * Load version history from file
   */
  async loadVersionHistory() {
    const historyFile = path.join(this.options.outputRoot, 'VERSION_HISTORY.json');

    try {
      const content = await fs.readFile(historyFile, 'utf8');
      this.versionHistory = JSON.parse(content);
    } catch {
      // History file doesn't exist yet
      this.versionHistory = [];
    }
  }

  /**
   * Calculate next version based on change type
   */
  calculateNextVersion(currentVersion, changeType = 'patch') {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (changeType.toLowerCase()) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        throw new Error(`Invalid change type: ${changeType}. Use major, minor, or patch.`);
    }
  }

  /**
   * Bump version for specific module
   */
  async bumpModuleVersion(module, changeType = 'patch', description = null) {
    if (!this.currentVersions[module]) {
      throw new Error(`Module ${module} not found`);
    }

    const currentVersion = this.currentVersions[module].current;
    const newVersion = this.calculateNextVersion(currentVersion, changeType);

    console.log(`🔄 Bumping ${module}: v${currentVersion} → v${newVersion} (${changeType})`);

    if (!this.options.dryRun) {
      // Update module.yaml
      await this.updateModuleVersion(module, newVersion);

      // Update package.json if exists
      await this.updatePackageJsonVersion(module, newVersion);

      // Record change
      this.recordVersionChange(module, currentVersion, newVersion, changeType, description);
    }

    this.currentVersions[module].current = newVersion;
    this.currentVersions[module].lastUpdated = new Date().toISOString();

    return newVersion;
  }

  /**
   * Bump versions for all modules
   */
  async bumpAllVersions(changeType = 'patch', description = null) {
    console.log(`\n🚀 Bumping all module versions (${changeType})`);

    const modules = Object.keys(this.currentVersions);
    const results = {};

    for (const module of modules) {
      try {
        const newVersion = await this.bumpModuleVersion(module, changeType, description);
        results[module] = newVersion;
      } catch (error) {
        console.error(`❌ Failed to bump ${module}: ${error.message}`);
        results[module] = null;
      }
    }

    // Update meta-package version
    await this.updateMetaPackageVersion(changeType);

    return results;
  }

  /**
   * Update module.yaml version
   */
  async updateModuleVersion(module, newVersion) {
    const modulePath = path.join(this.options.sourceRoot, module, 'module.yaml');

    try {
      const content = await fs.readFile(modulePath, 'utf8');
      const config = yaml.load(content);

      config.module_version = newVersion;
      config.version = newVersion; // Also update version field if present

      const updatedContent = yaml.dump(config, { indent: 2 });
      await fs.writeFile(modulePath, updatedContent, 'utf8');

      if (this.options.verbose) {
        console.log(`  📝 Updated ${modulePath}`);
      }

    } catch (error) {
      throw new Error(`Failed to update module.yaml for ${module}: ${error.message}`);
    }
  }

  /**
   * Update package.json version if it exists
   */
  async updatePackageJsonVersion(module, newVersion) {
    const packagePath = path.join(this.options.outputRoot, 'src', module, 'package.json');

    try {
      await fs.access(packagePath);
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      packageJson.version = newVersion;

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');

      if (this.options.verbose) {
        console.log(`  📦 Updated ${packagePath}`);
      }

    } catch {
      // Package.json doesn't exist yet, skip
    }
  }

  /**
   * Update meta-package version
   */
  async updateMetaPackageVersion(changeType) {
    const packagePath = path.join(this.options.outputRoot, 'package.json');

    try {
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      const currentVersion = packageJson.version || '2.0.0';
      const newVersion = this.calculateNextVersion(currentVersion, changeType);

      packageJson.version = newVersion;

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');

      console.log(`📦 Meta-package version: v${currentVersion} → v${newVersion}`);

    } catch (error) {
      console.warn(`⚠️  Could not update meta-package version: ${error.message}`);
    }
  }

  /**
   * Record version change in history
   */
  recordVersionChange(module, fromVersion, toVersion, changeType, description) {
    const change = {
      module,
      fromVersion,
      toVersion,
      changeType,
      description,
      timestamp: new Date().toISOString(),
      author: process.env.USER || 'bmad-packager'
    };

    this.versionHistory.push(change);
    this.changeLog.push(change);
  }

  /**
   * Generate changelog
   */
  generateChangelog(format = 'markdown') {
    if (format === 'markdown') {
      return this.generateMarkdownChangelog();
    } else if (format === 'json') {
      return JSON.stringify(this.changeLog, null, 2);
    } else {
      throw new Error(`Unsupported changelog format: ${format}`);
    }
  }

  /**
   * Generate markdown changelog
   */
  generateMarkdownChangelog() {
    const changelog = ['# BMAD Specialized Teams Changelog', ''];

    // Group changes by date
    const changesByDate = {};
    this.changeLog.forEach(change => {
      const date = change.timestamp.split('T')[0];
      if (!changesByDate[date]) {
        changesByDate[date] = [];
      }
      changesByDate[date].push(change);
    });

    // Generate changelog entries
    Object.entries(changesByDate)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
      .forEach(([date, changes]) => {
        changelog.push(`## ${date}`, '');

        const changesByType = {
          major: changes.filter(c => c.changeType === 'major'),
          minor: changes.filter(c => c.changeType === 'minor'),
          patch: changes.filter(c => c.changeType === 'patch')
        };

        if (changesByType.major.length > 0) {
          changelog.push('### 🚨 Breaking Changes');
          changesByType.major.forEach(change => {
            changelog.push(`- **${change.module}**: v${change.fromVersion} → v${change.toVersion}`);
            if (change.description) {
              changelog.push(`  ${change.description}`);
            }
          });
          changelog.push('');
        }

        if (changesByType.minor.length > 0) {
          changelog.push('### ✨ New Features');
          changesByType.minor.forEach(change => {
            changelog.push(`- **${change.module}**: v${change.fromVersion} → v${change.toVersion}`);
            if (change.description) {
              changelog.push(`  ${change.description}`);
            }
          });
          changelog.push('');
        }

        if (changesByType.patch.length > 0) {
          changelog.push('### 🐛 Bug Fixes');
          changesByType.patch.forEach(change => {
            changelog.push(`- **${change.module}**: v${change.fromVersion} → v${change.toVersion}`);
            if (change.description) {
              changelog.push(`  ${change.description}`);
            }
          });
          changelog.push('');
        }
      });

    return changelog.join('\n');
  }

  /**
   * Create Git tag for release
   */
  async createGitTag(tagName, message = null) {
    if (this.options.dryRun) {
      console.log(`🏷️  Would create Git tag: ${tagName}`);
      return;
    }

    try {
      const tagMessage = message || `Release ${tagName}`;
      execSync(`git tag -a "${tagName}" -m "${tagMessage}"`, {
        cwd: this.options.outputRoot
      });

      console.log(`🏷️  Created Git tag: ${tagName}`);

    } catch (error) {
      console.error(`❌ Failed to create Git tag: ${error.message}`);
    }
  }

  /**
   * Create release tags for all modules
   */
  async createReleaseTags() {
    console.log('\n🏷️  Creating release tags...');

    // Create individual module tags
    for (const [module, info] of Object.entries(this.currentVersions)) {
      const tagName = `${module}-v${info.current}`;
      await this.createGitTag(tagName, `${info.name} v${info.current}`);
    }

    // Create meta-package tag
    const metaPackagePath = path.join(this.options.outputRoot, 'package.json');
    try {
      const content = await fs.readFile(metaPackagePath, 'utf8');
      const packageJson = JSON.parse(content);
      const metaTagName = `v${packageJson.version}`;
      await this.createGitTag(metaTagName, `BMAD Specialized Teams ${packageJson.version}`);
    } catch {
      console.warn('⚠️  Could not create meta-package tag');
    }
  }

  /**
   * Save version history and changelog
   */
  async saveVersionArtifacts() {
    console.log('\n💾 Saving version artifacts...');

    // Save version history
    const historyFile = path.join(this.options.outputRoot, 'VERSION_HISTORY.json');
    await fs.writeFile(historyFile, JSON.stringify(this.versionHistory, null, 2), 'utf8');

    // Save changelog
    const changelogFile = path.join(this.options.outputRoot, 'CHANGELOG.md');
    const changelogContent = this.generateChangelog('markdown');
    await fs.writeFile(changelogFile, changelogContent, 'utf8');

    // Save current versions snapshot
    const versionsFile = path.join(this.options.outputRoot, 'VERSIONS.json');
    const versionsSnapshot = {
      generated: new Date().toISOString(),
      modules: this.currentVersions
    };
    await fs.writeFile(versionsFile, JSON.stringify(versionsSnapshot, null, 2), 'utf8');

    console.log('✅ Version artifacts saved');
  }

  /**
   * Validate version consistency
   */
  validateVersions() {
    console.log('\n🔍 Validating version consistency...');

    const issues = [];

    // Check that all modules have valid semantic versions
    Object.entries(this.currentVersions).forEach(([module, info]) => {
      if (!this.isValidSemanticVersion(info.current)) {
        issues.push(`${module}: Invalid semantic version '${info.current}'`);
      }
    });

    // Check for version conflicts in dependencies
    // (This would be expanded based on actual dependency relationships)

    if (issues.length > 0) {
      console.error('❌ Version validation failed:');
      issues.forEach(issue => console.error(`  - ${issue}`));
      return false;
    }

    console.log('✅ All versions are valid and consistent');
    return true;
  }

  /**
   * Check if version string is valid semantic version
   */
  isValidSemanticVersion(version) {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
    return semverRegex.test(version);
  }

  /**
   * Generate version report
   */
  generateVersionReport() {
    const report = {
      timestamp: new Date().toISOString(),
      manager_version: '1.0.0',
      current_versions: this.currentVersions,
      recent_changes: this.changeLog.slice(-10), // Last 10 changes
      validation_status: this.validateVersions() ? 'VALID' : 'INVALID',
      artifacts_generated: [
        'VERSION_HISTORY.json',
        'CHANGELOG.md',
        'VERSIONS.json'
      ]
    };

    console.log('\n📊 Version Report');
    console.log('='.repeat(30));
    console.log(`Status: ${report.validation_status}`);
    console.log(`Modules: ${Object.keys(this.currentVersions).length}`);
    console.log(`Recent changes: ${this.changeLog.length}`);

    return report;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  let command = null;
  let module = null;
  let changeType = 'patch';
  let description = null;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case 'bump':
        command = 'bump';
        break;
      case 'bump-all':
        command = 'bump-all';
        break;
      case 'tag':
        command = 'tag';
        break;
      case 'changelog':
        command = 'changelog';
        break;
      case 'validate':
        command = 'validate';
        break;
      case '--module':
      case '-m':
        module = args[++i];
        break;
      case '--type':
      case '-t':
        changeType = args[++i];
        break;
      case '--description':
      case '-d':
        description = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--source':
      case '-s':
        options.sourceRoot = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputRoot = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
BMAD Semantic Version Manager v1.0.0

Usage: node bmad-version-manager.js <command> [options]

Commands:
  bump              Bump version for specific module
  bump-all          Bump versions for all modules
  tag               Create Git tags for current versions
  changelog         Generate changelog
  validate          Validate version consistency

Options:
  -m, --module <name>       Module name (for bump command)
  -t, --type <type>         Change type: major, minor, patch (default: patch)
  -d, --description <desc>  Change description
  -s, --source <path>       Source directory path
  -o, --output <path>       Output directory path
  -v, --verbose             Verbose output
      --dry-run             Show what would be done without making changes
  -h, --help               Show help

Examples:
  node bmad-version-manager.js bump -m cybersec-team -t minor
  node bmad-version-manager.js bump-all -t patch -d "Bug fixes"
  node bmad-version-manager.js tag
  node bmad-version-manager.js changelog
`);
        process.exit(0);
        break;
    }
  }

  if (!command) {
    console.error('Error: No command specified. Use --help for usage information.');
    process.exit(1);
  }

  // Run version manager
  const versionManager = new BMAdVersionManager(options);

  (async () => {
    try {
      await versionManager.initialize();

      switch (command) {
        case 'bump':
          if (!module) {
            console.error('Error: Module name required for bump command. Use -m option.');
            process.exit(1);
          }
          await versionManager.bumpModuleVersion(module, changeType, description);
          await versionManager.saveVersionArtifacts();
          break;

        case 'bump-all':
          await versionManager.bumpAllVersions(changeType, description);
          await versionManager.saveVersionArtifacts();
          break;

        case 'tag':
          await versionManager.createReleaseTags();
          break;

        case 'changelog':
          const changelog = versionManager.generateChangelog();
          console.log(changelog);
          break;

        case 'validate':
          const isValid = versionManager.validateVersions();
          process.exit(isValid ? 0 : 1);
          break;
      }

      const report = versionManager.generateVersionReport();

    } catch (error) {
      console.error('❌ Version management failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = BMAdVersionManager;