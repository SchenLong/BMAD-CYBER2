"use strict";
/**
 * BMAD Package Registry CLI
 * Epic 3: Story 3.3 - Package Registry System
 *
 * Command-line interface for managing the BMAD package registry,
 * providing administrators with tools to monitor and manage installed modules.
 *
 * @author Morgan (Module Builder)
 * @version 1.0.0
 */
const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { table } = require('table');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');
// Import the registry manager (would be properly compiled from TypeScript)
const { PackageRegistryManager } = require('./package-registry-manager');
class PackageRegistryCLI {
    constructor() {
        this.program = new Command();
        this.registry = new PackageRegistryManager({
            logger: this.createLogger()
        });
        this.setupCommands();
    }
    createLogger() {
        return {
            info: (category, message, metadata) => {
                console.log(chalk.blue(`[INFO] [${category}]`), message);
                if (metadata)
                    console.log(chalk.gray(JSON.stringify(metadata, null, 2)));
            },
            warn: (category, message, metadata) => {
                console.log(chalk.yellow(`[WARN] [${category}]`), message);
                if (metadata)
                    console.log(chalk.gray(JSON.stringify(metadata, null, 2)));
            },
            error: (category, message, metadata) => {
                console.log(chalk.red(`[ERROR] [${category}]`), message);
                if (metadata)
                    console.log(chalk.gray(JSON.stringify(metadata, null, 2)));
            },
            debug: (category, message, metadata) => {
                console.log(chalk.gray(`[DEBUG] [${category}]`), message);
                if (metadata)
                    console.log(chalk.gray(JSON.stringify(metadata, null, 2)));
            }
        };
    }
    setupCommands() {
        this.program
            .name('bmad-registry')
            .description('BMAD Package Registry Management CLI')
            .version('1.0.0');
        // Initialize command
        this.program
            .command('init')
            .description('Initialize the package registry system')
            .action(async () => {
            await this.handleInit();
        });
        // List packages command
        this.program
            .command('list')
            .description('List all installed packages')
            .option('-t, --type <type>', 'Filter by package type')
            .option('-s, --status <status>', 'Filter by package status')
            .option('-h, --health <health>', 'Filter by package health')
            .option('--updates', 'Show only packages with available updates')
            .option('--format <format>', 'Output format (table, json)', 'table')
            .action(async (options) => {
            await this.handleList(options);
        });
        // Show package details command
        this.program
            .command('show <packageId>')
            .description('Show detailed information about a package')
            .action(async (packageId) => {
            await this.handleShow(packageId);
        });
        // Health check commands
        this.program
            .command('health')
            .description('Health check commands')
            .addCommand(this.createHealthCommands());
        // Update commands
        this.program
            .command('update')
            .description('Update commands')
            .addCommand(this.createUpdateCommands());
        // Backup commands
        this.program
            .command('backup')
            .description('Backup and restore commands')
            .addCommand(this.createBackupCommands());
        // Uninstall command
        this.program
            .command('uninstall <packageId>')
            .description('Uninstall a package')
            .option('--force', 'Force uninstall even if dependencies exist')
            .option('--skip-backup', 'Skip creating backup before uninstall')
            .action(async (packageId, options) => {
            await this.handleUninstall(packageId, options);
        });
        // Stats command
        this.program
            .command('stats')
            .description('Show registry statistics')
            .action(async () => {
            await this.handleStats();
        });
        // Interactive mode command
        this.program
            .command('interactive')
            .alias('i')
            .description('Start interactive registry management mode')
            .action(async () => {
            await this.handleInteractive();
        });
    }
    createHealthCommands() {
        const healthCommand = new Command('health');
        healthCommand
            .command('check')
            .description('Run health check on all packages')
            .option('--package <packageId>', 'Check specific package only')
            .action(async (options) => {
            await this.handleHealthCheck(options);
        });
        healthCommand
            .command('report')
            .description('Generate detailed health report')
            .option('--output <file>', 'Save report to file')
            .action(async (options) => {
            await this.handleHealthReport(options);
        });
        healthCommand
            .command('fix')
            .description('Attempt to auto-fix health issues')
            .option('--package <packageId>', 'Fix specific package only')
            .option('--dry-run', 'Show what would be fixed without making changes')
            .action(async (options) => {
            await this.handleHealthFix(options);
        });
        return healthCommand;
    }
    createUpdateCommands() {
        const updateCommand = new Command('update');
        updateCommand
            .command('check')
            .description('Check for available updates')
            .action(async () => {
            await this.handleUpdateCheck();
        });
        updateCommand
            .command('install <packageId> [version]')
            .description('Update a package to specific version')
            .option('--force', 'Force update even if compatibility issues exist')
            .option('--skip-backup', 'Skip creating backup before update')
            .action(async (packageId, version, options) => {
            await this.handleUpdateInstall(packageId, version, options);
        });
        updateCommand
            .command('all')
            .description('Update all packages with available updates')
            .option('--force', 'Force all updates')
            .option('--skip-backup', 'Skip creating backups')
            .action(async (options) => {
            await this.handleUpdateAll(options);
        });
        return updateCommand;
    }
    createBackupCommands() {
        const backupCommand = new Command('backup');
        backupCommand
            .command('create <packageId>')
            .description('Create backup of a package')
            .option('--type <type>', 'Backup type (manual, automatic)', 'manual')
            .action(async (packageId, options) => {
            await this.handleBackupCreate(packageId, options);
        });
        backupCommand
            .command('list')
            .description('List all backups')
            .option('--package <packageId>', 'Show backups for specific package')
            .action(async (options) => {
            await this.handleBackupList(options);
        });
        backupCommand
            .command('restore <packageId> [backupId]')
            .description('Restore package from backup')
            .action(async (packageId, backupId) => {
            await this.handleBackupRestore(packageId, backupId);
        });
        backupCommand
            .command('clean')
            .description('Clean old backups')
            .option('--days <days>', 'Remove backups older than X days', '30')
            .action(async (options) => {
            await this.handleBackupClean(options);
        });
        return backupCommand;
    }
    async handleInit() {
        try {
            console.log(chalk.blue('🚀 Initializing BMAD Package Registry...'));
            await this.registry.initialize();
            console.log(chalk.green('✅ Package Registry initialized successfully!'));
            const stats = this.registry.getRegistryStats();
            console.log(`\nFound ${stats.totalPackages} existing packages`);
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to initialize registry:'), error.message);
            process.exit(1);
        }
    }
    async handleList(options) {
        try {
            await this.registry.initialize();
            const filter = {
                type: options.type,
                status: options.status,
                health: options.health,
                updateAvailable: options.updates ? true : undefined
            };
            const packages = this.registry.listPackages(filter);
            if (options.format === 'json') {
                console.log(JSON.stringify(packages, null, 2));
                return;
            }
            if (packages.length === 0) {
                console.log(chalk.yellow('📦 No packages found matching criteria'));
                return;
            }
            // Create table
            const data = [
                ['Name', 'Version', 'Type', 'Status', 'Health', 'Updates']
            ];
            packages.forEach(pkg => {
                data.push([
                    pkg.name,
                    pkg.version,
                    pkg.type,
                    this.formatStatus(pkg.status),
                    this.formatHealth(pkg.health),
                    pkg.updateAvailable ? chalk.yellow('Available') : chalk.green('None')
                ]);
            });
            console.log('\n📦 Installed Packages:\n');
            console.log(table(data));
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to list packages:'), error.message);
            process.exit(1);
        }
    }
    async handleShow(packageId) {
        try {
            await this.registry.initialize();
            const pkg = this.registry.getPackageDetails(packageId);
            if (!pkg) {
                console.error(chalk.red(`❌ Package not found: ${packageId}`));
                process.exit(1);
            }
            console.log(`\n📦 ${chalk.bold(pkg.fullName)} v${pkg.version}\n`);
            console.log(chalk.blue('Basic Information:'));
            console.log(`  Type: ${pkg.type}`);
            console.log(`  Category: ${pkg.category}`);
            console.log(`  Status: ${this.formatStatus(pkg.status)}`);
            console.log(`  Health: ${this.formatHealth(pkg.health)}`);
            console.log(`  Installed: ${pkg.installedAt.toLocaleString()}`);
            console.log(`  Installed By: ${pkg.installedBy}`);
            console.log(`  Installation Path: ${pkg.installationPath}`);
            if (pkg.description) {
                console.log(`\n${chalk.blue('Description:')} ${pkg.description}`);
            }
            if (pkg.keywords.length > 0) {
                console.log(`\n${chalk.blue('Keywords:')} ${pkg.keywords.join(', ')}`);
            }
            console.log(`\n${chalk.blue('Dependencies:')}`);
            if (pkg.dependencies.length > 0) {
                pkg.dependencies.forEach(dep => {
                    const status = dep.satisfied ? chalk.green('✓') : chalk.red('✗');
                    console.log(`  ${status} ${dep.name}@${dep.version} ${dep.required ? '(required)' : '(optional)'}`);
                });
            }
            else {
                console.log('  None');
            }
            console.log(`\n${chalk.blue('Files:')} ${pkg.installedFiles.length} files`);
            console.log(`${chalk.blue('Output Directories:')} ${pkg.outputDirectories.length} directories`);
            if (pkg.type === 'specialized-team') {
                console.log(`\n${chalk.blue('Specialized Team Details:')}`);
                console.log(`  Agents: ${pkg.agentsCount || 0}`);
                console.log(`  Workflows: ${pkg.workflowsCount || 0}`);
                if (pkg.exposedWorkflows && pkg.exposedWorkflows.length > 0) {
                    console.log(`  Exposed Workflows:`);
                    pkg.exposedWorkflows.forEach(workflow => {
                        console.log(`    - ${workflow.workflowId} (${workflow.trigger})`);
                    });
                }
            }
            if (pkg.healthDetails) {
                console.log(`\n${chalk.blue('Health Details:')}`);
                console.log(`  Score: ${pkg.healthDetails.score}/100`);
                console.log(`  Last Checked: ${pkg.healthDetails.lastChecked.toLocaleString()}`);
                if (pkg.healthDetails.issues.length > 0) {
                    console.log(`  Issues:`);
                    pkg.healthDetails.issues.forEach(issue => {
                        const severity = this.formatSeverity(issue.severity);
                        console.log(`    ${severity} ${issue.description}`);
                        if (issue.resolution) {
                            console.log(`      Resolution: ${issue.resolution}`);
                        }
                    });
                }
            }
            if (pkg.updateAvailable) {
                console.log(`\n${chalk.yellow('🔄 Update Available:')} ${pkg.version} → ${pkg.latestVersion}`);
            }
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to show package details:'), error.message);
            process.exit(1);
        }
    }
    async handleHealthCheck(options) {
        try {
            await this.registry.initialize();
            console.log(chalk.blue('🏥 Running health check...'));
            if (options.package) {
                const pkg = this.registry.getPackageDetails(options.package);
                if (!pkg) {
                    console.error(chalk.red(`❌ Package not found: ${options.package}`));
                    process.exit(1);
                }
                const result = await this.registry.performHealthCheck(pkg);
                this.displayHealthResult(pkg.name, result);
            }
            else {
                const results = await this.registry.runSystemHealthCheck();
                console.log(chalk.green(`\n✅ Health check completed:`));
                console.log(`  Healthy: ${results.healthy}`);
                console.log(`  Degraded: ${results.degraded}`);
                console.log(`  Unhealthy: ${results.unhealthy}`);
                console.log(`  Total: ${results.total}`);
            }
        }
        catch (error) {
            console.error(chalk.red('❌ Health check failed:'), error.message);
            process.exit(1);
        }
    }
    async handleUpdateCheck() {
        try {
            await this.registry.initialize();
            console.log(chalk.blue('🔍 Checking for updates...'));
            const updates = await this.registry.checkForUpdates();
            if (updates.length === 0) {
                console.log(chalk.green('✅ All packages are up to date!'));
                return;
            }
            console.log(`\n📦 ${updates.length} updates available:\n`);
            const data = [
                ['Package', 'Current', 'Available', 'Type', 'Security']
            ];
            updates.forEach(update => {
                data.push([
                    update.packageId,
                    update.currentVersion,
                    update.availableVersion,
                    update.updateType,
                    update.securityUpdate ? chalk.red('Yes') : 'No'
                ]);
            });
            console.log(table(data));
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to check updates:'), error.message);
            process.exit(1);
        }
    }
    async handleUninstall(packageId, options) {
        try {
            await this.registry.initialize();
            const pkg = this.registry.getPackageDetails(packageId);
            if (!pkg) {
                console.error(chalk.red(`❌ Package not found: ${packageId}`));
                process.exit(1);
            }
            console.log(chalk.yellow(`⚠️  About to uninstall: ${pkg.fullName} v${pkg.version}`));
            if (!options.force && pkg.dependents.length > 0) {
                console.log(chalk.red('❌ Cannot uninstall: package has dependents'));
                console.log('Use --force to override');
                return;
            }
            const { confirmed } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmed',
                    message: 'Are you sure you want to uninstall this package?',
                    default: false
                }
            ]);
            if (!confirmed) {
                console.log('Uninstall cancelled');
                return;
            }
            console.log(chalk.blue('🗑️  Uninstalling package...'));
            await this.registry.uninstallPackage(packageId, options);
            console.log(chalk.green('✅ Package uninstalled successfully!'));
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to uninstall package:'), error.message);
            process.exit(1);
        }
    }
    async handleStats() {
        try {
            await this.registry.initialize();
            const stats = this.registry.getRegistryStats();
            console.log(chalk.blue('\n📊 Registry Statistics:\n'));
            console.log(`${chalk.bold('Total Packages:')} ${stats.totalPackages}`);
            console.log(`${chalk.bold('Healthy Packages:')} ${stats.healthyPackages}`);
            console.log(`${chalk.bold('Updates Available:')} ${stats.updatesAvailable}`);
            console.log(`${chalk.bold('Total Installation Size:')} ${this.formatBytes(stats.totalInstallationSize)}`);
            console.log(`\n${chalk.blue('By Type:')}`);
            Object.entries(stats.packagesByType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
            console.log(`\n${chalk.blue('By Status:')}`);
            Object.entries(stats.packagesByStatus).forEach(([status, count]) => {
                console.log(`  ${this.formatStatus(status)}: ${count}`);
            });
            console.log(`\n${chalk.blue('By Health:')}`);
            Object.entries(stats.packagesByHealth).forEach(([health, count]) => {
                console.log(`  ${this.formatHealth(health)}: ${count}`);
            });
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to get stats:'), error.message);
            process.exit(1);
        }
    }
    async handleInteractive() {
        try {
            await this.registry.initialize();
            console.log(chalk.blue('🎯 Welcome to Interactive Registry Management\n'));
            while (true) {
                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: 'What would you like to do?',
                        choices: [
                            'List packages',
                            'Show package details',
                            'Run health check',
                            'Check for updates',
                            'View statistics',
                            'Exit'
                        ]
                    }
                ]);
                switch (action) {
                    case 'List packages':
                        await this.handleList({ format: 'table' });
                        break;
                    case 'Show package details':
                        await this.interactiveShowPackage();
                        break;
                    case 'Run health check':
                        await this.handleHealthCheck({});
                        break;
                    case 'Check for updates':
                        await this.handleUpdateCheck();
                        break;
                    case 'View statistics':
                        await this.handleStats();
                        break;
                    case 'Exit':
                        console.log(chalk.green('👋 Goodbye!'));
                        return;
                }
                console.log('\n' + '─'.repeat(50) + '\n');
            }
        }
        catch (error) {
            console.error(chalk.red('❌ Interactive mode failed:'), error.message);
            process.exit(1);
        }
    }
    async interactiveShowPackage() {
        const packages = this.registry.listPackages();
        if (packages.length === 0) {
            console.log(chalk.yellow('No packages found'));
            return;
        }
        const { packageId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'packageId',
                message: 'Select a package:',
                choices: packages.map(pkg => ({
                    name: `${pkg.name} v${pkg.version} (${pkg.type})`,
                    value: pkg.id
                }))
            }
        ]);
        await this.handleShow(packageId);
    }
    // Helper methods for formatting
    formatStatus(status) {
        const colors = {
            installed: chalk.green,
            installing: chalk.blue,
            failed: chalk.red,
            corrupted: chalk.red,
            outdated: chalk.yellow,
            uninstalling: chalk.yellow
        };
        return (colors[status] || chalk.gray)(status);
    }
    formatHealth(health) {
        const colors = {
            healthy: chalk.green,
            degraded: chalk.yellow,
            unhealthy: chalk.red,
            unknown: chalk.gray
        };
        return (colors[health] || chalk.gray)(health);
    }
    formatSeverity(severity) {
        const colors = {
            critical: chalk.red,
            high: chalk.red,
            medium: chalk.yellow,
            low: chalk.blue
        };
        return (colors[severity] || chalk.gray)(`[${severity.toUpperCase()}]`);
    }
    formatBytes(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0)
            return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
    displayHealthResult(packageName, result) {
        console.log(`\n${chalk.blue('Health Check Result:')} ${packageName}`);
        console.log(`Overall: ${this.formatHealth(result.overall)}`);
        console.log(`Score: ${result.score}/100`);
        if (result.issues.length > 0) {
            console.log(`\nIssues:`);
            result.issues.forEach(issue => {
                const severity = this.formatSeverity(issue.severity);
                console.log(`  ${severity} ${issue.description}`);
            });
        }
        else {
            console.log(chalk.green('No issues found!'));
        }
    }
    async run() {
        await this.program.parseAsync(process.argv);
    }
}
// Make CLI available as standalone script
if (require.main === module) {
    const cli = new PackageRegistryCLI();
    cli.run().catch(error => {
        console.error(chalk.red('❌ CLI Error:'), error.message);
        process.exit(1);
    });
}
module.exports = PackageRegistryCLI;
//# sourceMappingURL=package-registry-cli.js.map