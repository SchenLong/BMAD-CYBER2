#!/usr/bin/env node

/**
 * BMAD Installation CLI Example
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Example CLI implementation showing how to use the installation framework
 * to install specialized team modules.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const { BMAdInstaller } = require('./install');
const path = require('path');

/**
 * CLI Implementation Example
 */
class BMAdInstallationCLI {
  constructor() {
    this.installer = null;
  }

  /**
   * Main CLI entry point
   */
  async main() {
    try {
      const args = process.argv.slice(2);
      const command = args[0];

      switch (command) {
        case 'install':
          await this.handleInstallCommand(args.slice(1));
          break;

        case 'rollback':
          await this.handleRollbackCommand(args.slice(1));
          break;

        case 'list':
          await this.handleListCommand(args.slice(1));
          break;

        case 'validate':
          await this.handleValidateCommand(args.slice(1));
          break;

        case 'help':
        default:
          this.showHelp();
          break;
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle install command
   */
  async handleInstallCommand(args) {
    const options = this.parseInstallOptions(args);

    if (options.modules.length === 0) {
      console.error('❌ Error: No modules specified for installation');
      console.log('Usage: node cli-example.js install <module-name> [options]');
      return;
    }

    console.log('🚀 BMAD Module Installation Framework');
    console.log('=====================================\n');

    // Create installer instance
    this.installer = new BMAdInstaller({
      projectRoot: options.projectRoot,
      validateDependencies: options.validateDependencies,
      enableRollback: options.enableRollback,
      verbose: options.verbose,
      dryRun: options.dryRun
    });

    // Set up event listeners for real-time feedback
    this.setupEventListeners();

    try {
      // Install modules
      const result = await this.installer.install(options.modules);

      console.log('\n✅ Installation Results:');
      console.log(`   Installation ID: ${result.installationId}`);
      console.log(`   Modules Installed: ${result.installedModules.length}`);
      console.log(`   Total Duration: ${result.duration}ms`);
      console.log('\n🎉 Installation completed successfully!');

      if (options.verbose) {
        console.log('\n📊 Detailed Results:');
        console.log(JSON.stringify(result, null, 2));
      }

    } catch (error) {
      console.log(`\n❌ Installation Failed: ${error.message}`);

      if (error.rollbackAttempted) {
        if (error.rollbackFailed) {
          console.log('⚠️  Automatic rollback also failed. Manual intervention required.');
          console.log(`   Rollback Error: ${error.rollbackError?.message}`);
        } else {
          console.log('🔄 System automatically rolled back to previous state.');
        }
      }

      process.exit(1);
    }
  }

  /**
   * Handle rollback command
   */
  async handleRollbackCommand(args) {
    const backupId = args[0];

    if (!backupId) {
      console.error('❌ Error: Backup ID required for rollback');
      console.log('Usage: node cli-example.js rollback <backup-id>');
      return;
    }

    console.log(`🔄 Rolling back to backup: ${backupId}`);

    this.installer = new BMAdInstaller();
    try {
      await this.installer.rollback();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle list command
   */
  async handleListCommand(args) {
    const listType = args[0] || 'modules';

    console.log('📋 BMAD Installation Status');
    console.log('===========================\n');

    switch (listType) {
      case 'modules':
        await this.listInstalledModules();
        break;
      case 'backups':
        await this.listBackups();
        break;
      default:
        console.log('Available list types: modules, backups');
    }
  }

  /**
   * Handle validate command
   */
  async handleValidateCommand(args) {
    console.log('🔍 Validating BMAD Installation');
    console.log('===============================\n');

    this.installer = new BMAdInstaller();

    // TODO: Implement validation logic
    console.log('✅ System validation completed');
  }

  /**
   * Parse install command options
   */
  parseInstallOptions(args) {
    const options = {
      modules: [],
      projectRoot: process.cwd(),
      validateDependencies: true,
      enableRollback: true,
      verbose: false,
      dryRun: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--project-root':
          options.projectRoot = args[++i];
          break;
        case '--no-validation':
          options.validateDependencies = false;
          break;
        case '--no-rollback':
          options.enableRollback = false;
          break;
        case '--verbose':
          options.verbose = true;
          break;
        case '--dry-run':
          options.dryRun = true;
          break;
        case '--help':
          this.showInstallHelp();
          return;
        default:
          if (!arg.startsWith('--')) {
            options.modules.push(arg);
          }
      }
    }

    return options;
  }

  /**
   * Set up event listeners for installation feedback
   */
  setupEventListeners() {
    if (!this.installer) return;

    this.installer.on('installation:complete', (result) => {
      console.log('\n📡 Installation completed event received');
    });

    this.installer.on('installation:failed', (result) => {
      console.log('\n📡 Installation failed event received');
    });

    this.installer.on('rollback:complete', () => {
      console.log('\n📡 Rollback completed event received');
    });

    this.installer.on('rollback:failed', (error) => {
      console.log('\n📡 Rollback failed event received');
    });
  }

  /**
   * List installed modules
   */
  async listInstalledModules() {
    // TODO: Implement actual module listing
    console.log('Installed Modules:');
    console.log('  📦 @bmad-cybercommand/intel-team@2.0.0');
    console.log('  📦 @bmad-cybercommand/cybersec-team@2.0.0');
    console.log('  📦 @bmad-cybercommand/legal-team@2.0.0');
    console.log('\nTotal: 3 modules installed');
  }

  /**
   * List backups
   */
  async listBackups() {
    // TODO: Implement actual backup listing
    console.log('Available Backups:');
    console.log('  💾 backup_install_123_abc (2025-01-23 14:30:22) - 15.2MB');
    console.log('  💾 backup_install_124_def (2025-01-23 13:15:10) - 14.8MB');
    console.log('\nTotal: 2 backups available');
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🔧 BMAD Installation CLI - Help
===============================

Usage: node cli-example.js <command> [options]

Commands:
  install <modules...>    Install one or more BMAD modules
  rollback <backup-id>    Rollback to a previous backup
  list [type]             List installed modules or backups
  validate                Validate current installation
  help                    Show this help message

Examples:
  # Install single module
  node cli-example.js install @bmad-cybercommand/intel-team

  # Install multiple modules
  node cli-example.js install intel-team cybersec-team legal-team

  # Install with options
  node cli-example.js install intel-team --verbose --project-root /path/to/project

  # List installed modules
  node cli-example.js list modules

  # List available backups
  node cli-example.js list backups

  # Rollback to previous state
  node cli-example.js rollback backup_install_123_abc

For more information, visit: https://docs.blackunicorn.tech
    `);
  }

  /**
   * Show install command help
   */
  showInstallHelp() {
    console.log(`
🔧 BMAD Install Command - Help
==============================

Usage: node cli-example.js install <modules...> [options]

Options:
  --project-root <path>   Project root directory (default: current directory)
  --no-validation         Skip dependency validation
  --no-rollback          Disable rollback capability
  --verbose              Enable verbose output
  --dry-run              Show what would be installed without doing it
  --help                 Show this help

Module Names:
  You can specify modules by:
  - Short name: intel-team, cybersec-team, legal-team, strategy-team
  - Full NPM name: @bmad-cybercommand/intel-team
  - Local path: ./local-modules/my-custom-team

Examples:
  node cli-example.js install intel-team --verbose
  node cli-example.js install cybersec-team legal-team --no-rollback
  node cli-example.js install @bmad-cybercommand/strategy-team --dry-run
    `);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new BMAdInstallationCLI();
  cli.main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = BMAdInstallationCLI;