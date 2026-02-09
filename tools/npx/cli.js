#!/usr/bin/env node

import { Command } from 'commander';
import { versionCommand } from './commands/version.js';
import { installCommand } from './commands/install.js';
import { updateCommand } from './commands/update.js';
import { CONFIG } from './lib/config.js';

// Check Node.js version
const nodeVersion = parseInt(process.version.slice(1).split('.')[0], 10);
if (nodeVersion < 20) {
  console.error(`Error: Node.js 20+ required. Current version: ${process.version}`);
  process.exit(1);
}

const program = new Command();

program
  .name('bmad-cyber')
  .description('Install and manage BMAD-CYBER operations framework')
  .version(CONFIG.VERSION);

program
  .command('install')
  .description('Install BMAD-CYBER framework')
  .option('-v, --version <tag>', 'Install specific version', 'latest')
  .option('-b, --branch <name>', 'Install from specific branch')
  .option('--from-git', 'Clone from git instead of release')
  .option('--modules <list>', 'Pre-select modules (comma-separated)')
  .option('--security-tier <tier>', 'Pre-select security tier')
  .option('-y, --yes', 'Accept all defaults')
  .option('--skip-wizard', 'Skip the setup wizard')
  .option('--skip-npm-install', 'Skip npm install')
  .option('--with-docs', 'Include documentation')
  .option('--with-dev', 'Include development tools')
  .option('--force', 'Overwrite existing files')
  .option('--dry-run', 'Show what would be installed')
  .option('--allow-scripts', 'Allow npm postinstall scripts (default: blocked for security)')
  .action((options) => {
    installCommand(options);
  });

program
  .command('update')
  .description('Update existing BMAD-CYBER installation')
  .option('-v, --version <tag>', 'Update to specific version')
  .option('--check', 'Only check for updates')
  .option('--force', 'Clean reinstall')
  .option('--with-docs', 'Include documentation in update')
  .option('--with-dev', 'Include development tools in update')
  .action((options) => {
    updateCommand(options);
  });

program
  .command('version')
  .description('Display version information')
  .action(versionCommand);

// Handle unknown commands
program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}`);
  program.help();
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nInstallation cancelled.');
  process.exit(130);
});

// Show help if no args
if (process.argv.length === 2) {
  program.help();
}

program.parse();
