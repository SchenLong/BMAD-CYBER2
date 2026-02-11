#!/usr/bin/env node
/**
 * BMAD Guardrails: Log Archival CLI
 * =================================
 * Command-line interface for managing log archival operations.
 *
 * Commands:
 * - config: Check and validate archival configuration
 * - status: Show archival system status and health
 * - archive: Manually trigger log archival
 * - verify: Verify integrity of archived logs
 * - list: List available archives
 * - setup: Interactive setup wizard
 * - health: Run system health check
 */

import { Command } from 'commander';
import { createLogArchiver } from '../src/observability/log-archiver.js';
import {
  checkConfiguration,
  createConfigManager,
} from '../src/observability/archival-config.js';
import {
  getArchivalScheduler,
  getArchivalStatus,
  initializeArchivalScheduling,
  triggerArchival,
} from '../src/observability/archival-scheduler.js';

const program = new Command();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Colorize text for console output.
 */
function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Print formatted table.
 */
function printTable(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map(row => (row[i] || '').toString().length))
  );

  // Header
  const headerRow = headers.map((header, i) => header.padEnd(colWidths[i])).join(' | ');
  console.log(colorize(headerRow, 'bold'));
  console.log('-'.repeat(headerRow.length));

  // Rows
  rows.forEach(row => {
    const formattedRow = row.map((cell, i) => (cell || '').toString().padEnd(colWidths[i])).join(' | ');
    console.log(formattedRow);
  });
}

/**
 * Format bytes for human reading.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
}

/**
 * Format duration for human reading.
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Config command - check and validate configuration.
 */
program
  .command('config')
  .description('Check and validate archival configuration')
  .option('-v, --verbose', 'Show detailed configuration information')
  .option('-e, --example', 'Show example configuration')
  .action(async (options) => {
    try {
      if (options.example) {
        const manager = createConfigManager();
        const example = manager.generateExampleConfig();

        console.log(colorize('\n=== Example Configuration ===\n', 'bold'));
        console.log('Environment variables:');
        console.log(`export BMAD_S3_ARCHIVE_BUCKET="${example.bucket}"`);
        console.log(`export BMAD_S3_ARCHIVE_PREFIX="${example.prefix}"`);
        console.log(`export BMAD_S3_ARCHIVE_REGION="${example.region}"`);
        console.log(`export BMAD_LOG_RETENTION_DAYS="${example.retentionDays}"`);
        console.log(`export BMAD_GPG_SIGNING_KEY="${example.gpgSigningKey}"`);
        console.log(`export BMAD_ARCHIVE_SCHEDULE_CRON="${example.scheduleExpression}"`);
        console.log(`export BMAD_ENABLE_OBJECT_LOCK="${example.enableObjectLock}"`);
        console.log(`export BMAD_S3_ENCRYPTION_TYPE="${example.encryptionType}"`);

        console.log('\nSetup instructions:');
        console.log(manager.generateSetupInstructions());
        return;
      }

      await checkConfiguration();

      if (options.verbose) {
        const manager = createConfigManager();
        const result = await manager.loadConfiguration();

        if (result.config) {
          console.log('\n=== Current Configuration ===\n');
          console.log(`Bucket: ${result.config.bucket}`);
          console.log(`Prefix: ${result.config.prefix}`);
          console.log(`Region: ${result.config.region}`);
          console.log(`Retention: ${result.config.retentionDays} days`);
          console.log(`GPG Key: ${result.config.gpgSigningKey || 'Not configured'}`);
          console.log(`Schedule: ${result.config.scheduleExpression}`);
          console.log(`Object Lock: ${result.config.enableObjectLock ? 'Enabled' : 'Disabled'}`);
          console.log(`Encryption: ${result.config.encryptionType}`);
        }
      }

    } catch (error) {
      console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

/**
 * Status command - show system status and health.
 */
program
  .command('status')
  .description('Show archival system status and health')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {
      const status = await getArchivalStatus();

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }

      console.log(colorize('\n=== BMAD Log Archival Status ===\n', 'bold'));

      // System Health
      const healthIcon = status.health.healthy ? colorize('✓', 'green') : colorize('✗', 'red');
      console.log(`System Health: ${healthIcon} ${status.health.healthy ? 'Healthy' : 'Issues detected'}`);

      if (status.health.issues.length > 0) {
        console.log(colorize('\nIssues:', 'red'));
        status.health.issues.forEach(issue => console.log(`  • ${issue}`));
      }

      if (status.health.recommendations.length > 0) {
        console.log(colorize('\nRecommendations:', 'yellow'));
        status.health.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }

      // Job Status
      console.log(colorize('\n=== Job Status ===', 'bold'));
      console.log(`Currently Running: ${status.status.isRunning ? colorize('Yes', 'yellow') : colorize('No', 'green')}`);
      console.log(`Last Success: ${status.status.lastSuccess ? new Date(status.status.lastSuccess).toLocaleString() : 'Never'}`);
      console.log(`Last Failure: ${status.status.lastFailure ? new Date(status.status.lastFailure).toLocaleString() : 'None'}`);
      console.log(`Next Scheduled: ${status.health.nextArchival ? new Date(status.health.nextArchival).toLocaleString() : 'Unknown'}`);
      console.log(`Consecutive Failures: ${status.status.consecutiveFailures}`);
      console.log(`Total Runs: ${status.status.totalRuns}`);
      console.log(`Success Rate: ${status.status.totalRuns > 0 ? Math.round((status.status.totalSuccess / status.status.totalRuns) * 100) : 0}%`);

      // Recent Jobs
      if (status.recentJobs.length > 0) {
        console.log(colorize('\n=== Recent Jobs ===', 'bold'));
        const headers = ['Time', 'Status', 'Duration', 'Files', 'Size', 'Archive ID'];
        const rows = status.recentJobs.map(job => [
          new Date(job.startTime).toLocaleString(),
          job.success ? colorize('Success', 'green') : colorize('Failed', 'red'),
          formatDuration(job.duration),
          job.filesArchived?.toString() || '0',
          job.bytesArchived ? formatBytes(job.bytesArchived) : '0 B',
          job.archiveId || 'N/A',
        ]);
        printTable(headers, rows);
      }

    } catch (error) {
      console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

/**
 * Archive command - manually trigger archival.
 */
program
  .command('archive')
  .description('Manually trigger log archival')
  .option('-f, --force', 'Force archival even if one is already running')
  .action(async (options) => {
    try {
      console.log(colorize('Starting log archival...', 'cyan'));

      if (!options.force) {
        const status = await getArchivalStatus();
        if (status.status.isRunning) {
          console.error(colorize('Error: Archival job is already running. Use --force to override.', 'red'));
          process.exit(1);
        }
      }

      const startTime = Date.now();
      const result = await triggerArchival();
      const duration = Date.now() - startTime;

      console.log(colorize('✓ Archival completed successfully!', 'green'));
      console.log(`\nResults:`);
      console.log(`  Archive ID: ${result.archiveId}`);
      console.log(`  Files Archived: ${result.filesArchived || 0}`);
      console.log(`  Bytes Archived: ${result.bytesArchived ? formatBytes(result.bytesArchived) : '0 B'}`);
      console.log(`  Duration: ${formatDuration(duration)}`);

      if (result.error) {
        console.log(colorize(`  Error: ${result.error}`, 'red'));
      }

    } catch (error) {
      console.error(colorize(`✗ Archival failed: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

/**
 * Verify command - verify archive integrity.
 */
program
  .command('verify')
  .description('Verify integrity of archived logs')
  .argument('[archiveId]', 'Specific archive ID to verify (defaults to all recent archives)')
  .option('-a, --all', 'Verify all archives')
  .option('-l, --limit <number>', 'Limit number of archives to verify', '10')
  .action(async (archiveId, options) => {
    try {
      const archiver = createLogArchiver();

      if (archiveId) {
        console.log(colorize(`Verifying archive: ${archiveId}`, 'cyan'));
        const result = await archiver.verifyArchiveIntegrity(archiveId);

        if (result.isValid) {
          console.log(colorize('✓ Archive integrity verified', 'green'));
        } else {
          console.log(colorize(`✗ Archive integrity check failed: ${result.error}`, 'red'));
          process.exit(1);
        }
      } else {
        const archives = await archiver.listArchives();
        const limit = options.all ? archives.length : parseInt(options.limit);
        const toVerify = archives.slice(0, limit);

        console.log(colorize(`Verifying ${toVerify.length} archives...`, 'cyan'));

        let verified = 0;
        let failed = 0;

        for (const archive of toVerify) {
          process.stdout.write(`Verifying ${archive.archiveId}... `);

          const result = await archiver.verifyArchiveIntegrity(archive.archiveId);

          if (result.isValid) {
            console.log(colorize('✓', 'green'));
            verified++;
          } else {
            console.log(colorize(`✗ ${result.error}`, 'red'));
            failed++;
          }
        }

        console.log(`\nResults: ${colorize(`${verified} verified`, 'green')}, ${colorize(`${failed} failed`, failed > 0 ? 'red' : 'green')}`);

        if (failed > 0) {
          process.exit(1);
        }
      }

    } catch (error) {
      console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

/**
 * List command - list available archives.
 */
program
  .command('list')
  .description('List available archives')
  .option('-l, --limit <number>', 'Limit number of archives to show', '20')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {
      const archiver = createLogArchiver();
      const archives = await archiver.listArchives();
      const limit = parseInt(options.limit);
      const toShow = archives.slice(0, limit);

      if (options.json) {
        console.log(JSON.stringify(toShow, null, 2));
        return;
      }

      if (toShow.length === 0) {
        console.log(colorize('No archives found.', 'yellow'));
        return;
      }

      console.log(colorize(`\n=== Archives (showing ${toShow.length} of ${archives.length}) ===\n`, 'bold'));

      const headers = ['Archive ID', 'Date', 'Files', 'Size', 'Compressed', 'Ratio', 'GPG'];
      const rows = toShow.map(archive => [
        archive.archiveId,
        new Date(archive.timestamp).toLocaleDateString(),
        archive.logFileCount.toString(),
        formatBytes(archive.totalSize),
        formatBytes(archive.compressedSize),
        `${(archive.compressionRatio * 100).toFixed(1)}%`,
        archive.gpgSignature ? colorize('✓', 'green') : colorize('-', 'yellow'),
      ]);

      printTable(headers, rows);

    } catch (error) {
      console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

/**
 * Setup command - interactive setup wizard.
 */
program
  .command('setup')
  .description('Interactive setup wizard for archival configuration')
  .action(async () => {
    console.log(colorize('\n=== BMAD Log Archival Setup Wizard ===\n', 'bold'));

    try {
      // Import readline for interactive input
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const question = (prompt: string): Promise<string> => {
        return new Promise(resolve => {
          rl.question(prompt, resolve);
        });
      };

      console.log('This wizard will help you configure log archival to S3.\n');

      // Basic configuration
      const bucket = await question('S3 bucket name: ');
      const region = await question('AWS region [us-east-1]: ') || 'us-east-1';
      const prefix = await question('S3 prefix [bmad-audit-logs/]: ') || 'bmad-audit-logs/';
      const retention = await question('Retention days [2557]: ') || '2557';

      // Optional configuration
      const enableGpg = await question('Enable GPG signing? (y/n) [n]: ');
      let gpgKey = '';
      if (enableGpg.toLowerCase() === 'y') {
        gpgKey = await question('GPG key ID: ');
      }

      const schedule = await question('Cron schedule [0 2 * * *]: ') || '0 2 * * *';

      rl.close();

      // Generate configuration commands
      console.log(colorize('\n=== Configuration Commands ===\n', 'bold'));
      console.log('Add these to your shell configuration (.bashrc, .zshrc, etc.):\n');

      console.log(`export BMAD_S3_ARCHIVE_BUCKET="${bucket}"`);
      console.log(`export BMAD_S3_ARCHIVE_REGION="${region}"`);
      console.log(`export BMAD_S3_ARCHIVE_PREFIX="${prefix}"`);
      console.log(`export BMAD_LOG_RETENTION_DAYS="${retention}"`);
      console.log(`export BMAD_ARCHIVE_SCHEDULE_CRON="${schedule}"`);

      if (gpgKey) {
        console.log(`export BMAD_GPG_SIGNING_KEY="${gpgKey}"`);
      }

      console.log(colorize('\n=== Next Steps ===\n', 'bold'));
      console.log('1. Set the environment variables above');
      console.log('2. Configure your S3 bucket with Object Lock');
      console.log('3. Set up AWS credentials');
      console.log('4. Run: bmad-archival config --verbose');
      console.log('5. Run: bmad-archival archive (to test)');

      const manager = createConfigManager();
      console.log('\nFor detailed setup instructions, see:');
      console.log(manager.generateSetupInstructions());

    } catch (error) {
      console.error(colorize(`Setup failed: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

/**
 * Health command - run comprehensive health check.
 */
program
  .command('health')
  .description('Run comprehensive health check')
  .option('-f, --fix', 'Attempt to fix detected issues')
  .action(async (options) => {
    try {
      console.log(colorize('Running health check...', 'cyan'));

      const scheduler = getArchivalScheduler();
      const health = await scheduler.healthCheck();

      console.log(colorize('\n=== Health Check Results ===\n', 'bold'));

      const statusIcon = health.healthy ? colorize('✓', 'green') : colorize('✗', 'red');
      console.log(`Overall Health: ${statusIcon} ${health.healthy ? 'Healthy' : 'Issues detected'}`);

      if (health.issues.length > 0) {
        console.log(colorize('\nIssues Found:', 'red'));
        health.issues.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue}`);
        });
      }

      if (health.recommendations.length > 0) {
        console.log(colorize('\nRecommendations:', 'yellow'));
        health.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }

      if (health.lastArchival) {
        const lastArchivalDate = new Date(health.lastArchival);
        const hoursAgo = (Date.now() - lastArchivalDate.getTime()) / (1000 * 60 * 60);
        console.log(`\nLast Archival: ${lastArchivalDate.toLocaleString()} (${Math.floor(hoursAgo)} hours ago)`);
      }

      if (health.nextArchival) {
        console.log(`Next Archival: ${new Date(health.nextArchival).toLocaleString()}`);
      }

      if (options.fix && !health.healthy) {
        console.log(colorize('\nAttempting to fix issues...', 'cyan'));

        // Initialize scheduling if not already done
        try {
          await initializeArchivalScheduling();
          console.log(colorize('✓ Archival scheduling initialized', 'green'));
        } catch (error) {
          console.log(colorize(`✗ Failed to initialize scheduling: ${error instanceof Error ? error.message : String(error)}`, 'red'));
        }
      }

      if (!health.healthy) {
        process.exit(1);
      }

    } catch (error) {
      console.error(colorize(`Health check failed: ${error instanceof Error ? error.message : String(error)}`, 'red'));
      process.exit(1);
    }
  });

// Main program setup
program
  .name('bmad-archival')
  .description('BMAD Log Archival Management CLI')
  .version('1.0.0')
  .option('-v, --verbose', 'Verbose output')
  .hook('preAction', async (thisCommand) => {
    // Global setup before any command
    if (thisCommand.opts().verbose) {
      console.log(colorize(`Running command: ${thisCommand.name()}`, 'cyan'));
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(colorize(`Unknown command: ${program.args.join(' ')}`, 'red'));
  console.log('See --help for available commands.');
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}