#!/usr/bin/env node

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import path from 'path';
import { existsSync } from 'fs';
import { versionCommand } from './commands/version.js';
import { installCommand } from './commands/install.js';
import { updateCommand } from './commands/update.js';
import { statusCommand } from './commands/status.js';
import { CONFIG } from './lib/config.js';

// Get package root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '../..');

/**
 * Resolve a path to a tool script within the package
 * @param {string} toolPath - Relative path from package root
 * @returns {string} Absolute path to the tool
 */
function resolveToolPath(toolPath) {
  const absolutePath = path.join(packageRoot, toolPath);
  if (!existsSync(absolutePath)) {
    console.error(`Error: Tool not found at ${absolutePath}`);
    console.error('This may indicate a corrupted installation. Try reinstalling:');
    console.error('  npm uninstall bmad-cybersec && npm install bmad-cybersec');
    process.exit(1);
  }
  return absolutePath;
}

/**
 * Dynamically import and run a tool
 * @param {string} toolPath - Path to tool module
 * @param {string[]} [extraArgs] - Extra arguments to prepend to process.argv
 * @returns {Promise<void>}
 */
async function runTool(toolPath, extraArgs = []) {
  const absolutePath = resolveToolPath(toolPath);
  const toolUrl = pathToFileURL(absolutePath).href;
  const toolModule = await import(toolUrl);

  // If extra args provided, prepend them to process.argv for the tool
  const originalArgv = process.argv.slice();
  if (extraArgs.length > 0) {
    process.argv = [
      process.argv[0],
      absolutePath,
      ...extraArgs,
      ...process.argv.slice(2)
    ];
  }

  try {
    // Tools may export a main function, run function, or handle execution themselves
    if (toolModule.default && typeof toolModule.default === 'function') {
      await toolModule.default();
    } else if (toolModule.main && typeof toolModule.main === 'function') {
      await toolModule.main();
    } else if (toolModule.run && typeof toolModule.run === 'function') {
      await toolModule.run();
    }
    // If none of above, tool may have its own entry point detection
  } finally {
    // Restore original argv
    if (extraArgs.length > 0) {
      process.argv = originalArgv;
    }
  }
}

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

program
  .command('status')
  .description('Show BMAD-CYBER installation status')
  .action(statusCommand);

// Configuration commands
program
  .command('setup')
  .description('Run BMAD setup wizard')
  .action(async () => {
    await runTool('src/utility/tools/installer/bin/setup-wizard.mjs');
  });

program
  .command('modules')
  .description('Configure BMAD modules')
  .option('--offline', 'Run in offline mode')
  .action(async (options) => {
    const extraArgs = options.offline ? ['--offline'] : [];
    await runTool('src/utility/tools/module-selector/index.js', extraArgs);
  });

program
  .command('security:config')
  .description('Configure security settings')
  .action(async () => {
    await runTool('src/utility/tools/security-config/index.js');
  });

program
  .command('llm:setup')
  .description('Configure LLM provider')
  .action(async () => {
    await runTool('src/utility/tools/llm-setup/index.js');
  });

program
  .command('health')
  .description('Run health check')
  .action(async () => {
    await runTool('src/utility/tools/health-check/index.js');
  });

program
  .command('pgp:setup')
  .description('Configure PGP keys')
  .action(async () => {
    await runTool('src/utility/tools/pgp-setup/index.js');
  });

program
  .command('validate:refs')
  .description('Validate reference configuration')
  .action(async () => {
    await runTool('src/utility/tools/reference-validator/cli.js');
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}`);
  program.help();
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nOperation cancelled.');
  process.exit(130);
});

// Show help if no args
if (process.argv.length === 2) {
  program.help();
}

program.parse();
