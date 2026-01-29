import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { downloadRelease, cleanup as cleanupDownload } from '../lib/downloader.js';
import { cloneRepository, copyRelevantFiles, cleanupClone } from '../lib/git-clone.js';
import { extractFramework } from '../lib/extractor.js';
import { mergePackageJson } from '../lib/package-merger.js';
import { logger } from '../lib/logger.js';

const execAsync = promisify(exec);

// Track installation state for rollback
const installState = {
  downloadPath: null,
  extractedFiles: [],
  packageJsonBackup: null,
  npmInstalled: false
};

export async function installCommand(options) {
  const startTime = Date.now();
  const spinner = ora();

  // Set up graceful shutdown
  const cleanupHandler = async () => {
    console.log('\n');
    spinner.fail('Installation interrupted');
    await rollback();
    process.exit(130);
  };
  process.on('SIGINT', cleanupHandler);

  try {
    const targetDir = process.cwd();

    // Validate target directory
    logger.info(`Installing BMAD-CYBER to: ${targetDir}\n`);

    // Step 1: Download or clone
    spinner.start('Step 1/6: Downloading BMAD-CYBER framework...');

    let sourcePath;
    if (options.fromGit) {
      sourcePath = await cloneRepository({
        branch: options.branch || 'main',
        repoUrl: options.repo
      });
      installState.downloadPath = sourcePath;

      if (!options.dryRun) {
        await copyRelevantFiles(sourcePath, targetDir, {
          withDocs: options.withDocs,
          withDev: options.withDev
        });
      }
    } else {
      sourcePath = await downloadRelease({
        version: options.version,
        branch: options.branch
      });
      installState.downloadPath = sourcePath;
    }

    spinner.succeed('Step 1/6: Download complete');

    // Step 2: Extract (if tarball)
    if (!options.fromGit) {
      spinner.start('Step 2/6: Extracting framework files...');

      const extractResult = await extractFramework(sourcePath, targetDir, {
        force: options.force,
        withDocs: options.withDocs,
        withDev: options.withDev,
        dryRun: options.dryRun
      });

      if (extractResult.cancelled) {
        spinner.fail('Installation cancelled by user');
        process.exit(0);
      }

      installState.extractedFiles = extractResult.files || [];
      spinner.succeed(`Step 2/6: Extracted ${extractResult.filesExtracted} files`);
    } else {
      spinner.succeed('Step 2/6: Files copied from repository');
    }

    // Step 3: Merge package.json
    spinner.start('Step 3/6: Configuring package.json...');

    const mergeResult = await mergePackageJson(targetDir, {
      yes: options.yes,
      dryRun: options.dryRun
    });

    if (mergeResult.cancelled) {
      spinner.fail('Installation cancelled by user');
      await rollback();
      process.exit(0);
    }

    if (mergeResult.backupPath) {
      installState.packageJsonBackup = mergeResult.backupPath;
    }

    spinner.succeed('Step 3/6: Package.json configured');

    // Step 4: npm install
    if (!options.skipNpmInstall && !options.dryRun) {
      spinner.start('Step 4/6: Installing dependencies (this may take a moment)...');

      try {
        await execAsync('npm install', {
          cwd: targetDir,
          timeout: 300000 // 5 min timeout
        });
        installState.npmInstalled = true;
        spinner.succeed('Step 4/6: Dependencies installed');
      } catch (error) {
        spinner.warn('Step 4/6: npm install had issues (you may need to run manually)');
        logger.warn(`npm install error: ${error.message}`);
      }
    } else {
      spinner.succeed('Step 4/6: Skipped npm install' +
        (options.dryRun ? ' (dry run)' : ''));
    }

    // Step 5: Setup wizard
    if (!options.skipWizard && !options.yes && !options.dryRun) {
      spinner.succeed('Step 5/6: Starting setup wizard...');
      console.log('');

      await runSetupWizard({
        modules: options.modules?.split(','),
        securityTier: options.securityTier
      });
    } else {
      spinner.succeed('Step 5/6: Skipped setup wizard' +
        (options.dryRun ? ' (dry run)' : ''));
    }

    // Step 6: Health check
    if (!options.dryRun) {
      spinner.start('Step 6/6: Running health check...');

      const healthResult = await runHealthCheck(targetDir);

      if (healthResult.success) {
        spinner.succeed('Step 6/6: Installation verified');
      } else {
        spinner.warn('Step 6/6: Health check had warnings');
        healthResult.warnings.forEach(w => logger.warn(`  - ${w}`));
      }
    } else {
      spinner.succeed('Step 6/6: Skipped health check (dry run)');
    }

    // Cleanup temp files
    await cleanupDownload();
    if (options.fromGit && installState.downloadPath) {
      await cleanupClone(installState.downloadPath);
    }

    // Remove SIGINT handler
    process.off('SIGINT', cleanupHandler);

    // Calculate elapsed time
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Show success and quick start
    console.log('\n');
    showQuickStart(options.dryRun);
    logger.success(`\nInstallation completed in ${elapsed}s`);

  } catch (error) {
    spinner.fail(`Installation failed: ${error.message}`);
    logger.error('\nError details:', error.stack);

    await rollback();
    process.exit(1);
  }
}

async function rollback() {
  logger.info('\nRolling back changes...');

  // Cleanup downloaded files
  if (installState.downloadPath) {
    try {
      await cleanupDownload();
      await cleanupClone(installState.downloadPath);
    } catch {
      // Ignore cleanup errors
    }
  }

  // Note: We don't remove extracted files to be safe
  // User can manually clean up if needed

  logger.info('Rollback complete. Your original files are preserved.');

  if (installState.packageJsonBackup) {
    logger.info(`Package.json backup: ${installState.packageJsonBackup}`);
  }
}

async function runSetupWizard(preselect) {
  // Import and run setup wizard from extracted files
  try {
    const { runWizard } = await import(
      join(process.cwd(), 'src/utility/tools/setup-wizard/index.js')
    );
    await runWizard(preselect);
  } catch (error) {
    logger.warn('Setup wizard not available. Run `npm run bmad:setup` later.');
  }
}

async function runHealthCheck(targetDir) {
  const warnings = [];

  // Check for required directories
  const requiredDirs = ['_bmad', '.claude'];
  for (const dir of requiredDirs) {
    const dirPath = join(targetDir, dir);
    if (!existsSync(dirPath)) {
      warnings.push(`Missing directory: ${dir}`);
    }
  }

  // Check for CLAUDE.md
  if (!existsSync(join(targetDir, 'CLAUDE.md'))) {
    warnings.push('Missing CLAUDE.md');
  }

  return {
    success: warnings.length === 0,
    warnings
  };
}

function showQuickStart(isDryRun) {
  if (isDryRun) {
    console.log(chalk.cyan.bold('='.repeat(60)));
    console.log(chalk.cyan.bold('  DRY RUN COMPLETE'));
    console.log(chalk.cyan.bold('='.repeat(60)));
    console.log('');
    console.log('Run without --dry-run to actually install.');
    return;
  }

  console.log(chalk.green.bold('='.repeat(60)));
  console.log(chalk.green.bold('  BMAD-CYBER INSTALLED SUCCESSFULLY'));
  console.log(chalk.green.bold('='.repeat(60)));
  console.log('');
  console.log(chalk.white.bold('Quick Start:'));
  console.log('');
  console.log('  1. Open this project in Claude Code:');
  console.log(chalk.cyan('     claude .'));
  console.log('');
  console.log('  2. Start with the master orchestrator:');
  console.log(chalk.cyan('     /agents/abdul'));
  console.log('');
  console.log('  3. Or explore available modules:');
  console.log(chalk.cyan('     /help'));
  console.log('');
  console.log(chalk.white.bold('Useful Commands:'));
  console.log('');
  console.log('  npm run bmad:modules   - Select active modules');
  console.log('  npm run bmad:security  - Configure security tier');
  console.log('  npm run bmad:health    - Run system health check');
  console.log('');
  console.log(chalk.dim('Documentation: https://github.com/SchenLong/BMAD-CYBERSEC'));
  console.log('');
}
