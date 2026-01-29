import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from './logger.js';

// BMAD scripts to add (with bmad: prefix)
const BMAD_SCRIPTS = {
  'bmad:modules': 'node src/utility/tools/module-selector/index.js',
  'bmad:security': 'node src/utility/tools/security-config/index.js',
  'bmad:llm': 'node src/utility/tools/llm-setup/index.js',
  'bmad:health': 'node src/utility/tools/health-check/index.js',
  'bmad:setup': 'node src/utility/tools/setup-wizard/index.js'
};

// BMAD dependencies to add
const BMAD_DEPENDENCIES = {
  'chalk': '^5.3.0',
  'inquirer': '^9.2.0',
  'zod': '^3.22.0',
  'commander': '^12.0.0',
  'ora': '^8.0.0'
};

const BMAD_DEV_DEPENDENCIES = {
  'typescript': '^5.3.0',
  '@types/node': '^20.0.0',
  'vitest': '^1.0.0'
};

/**
 * Merges BMAD framework dependencies and scripts into existing package.json
 * @description Creates a new package.json if none exists, or merges BMAD-specific
 * scripts (prefixed with 'bmad:'), dependencies, and devDependencies into an existing one.
 * Creates a backup before modifying existing files.
 * @param {string} targetDir - Target directory containing or to contain package.json
 * @param {Object} [options={}] - Merge options
 * @param {boolean} [options.yes=false] - Skip confirmation prompts and apply changes automatically
 * @param {boolean} [options.dryRun=false] - Preview changes without writing to disk
 * @returns {Promise<Object>} Merge result object
 * @returns {boolean} [returns.success] - True if merge completed successfully
 * @returns {boolean} [returns.cancelled] - True if user cancelled the operation
 * @returns {boolean} [returns.created] - True if a new package.json was created
 * @returns {boolean} [returns.noChanges] - True if no changes were needed
 * @returns {boolean} [returns.dryRun] - True if this was a dry run
 * @returns {Object} [returns.diff] - Object containing added and modified entries
 * @returns {string} [returns.backupPath] - Path to backup file (if existing file was modified)
 * @throws {Error} If file operations fail
 * @example
 * // Interactive merge
 * const result = await mergePackageJson('./my-project');
 *
 * @example
 * // Non-interactive merge
 * const result = await mergePackageJson('./my-project', { yes: true });
 *
 * @example
 * // Preview changes
 * const result = await mergePackageJson('./my-project', { dryRun: true });
 */
export async function mergePackageJson(targetDir, options = {}) {
  const { yes = false, dryRun = false } = options;

  const targetPath = join(targetDir, 'package.json');
  const hasExisting = existsSync(targetPath);

  if (!hasExisting) {
    // No existing package.json - create new one
    logger.info('No existing package.json found. Creating new one...');

    const newPackage = createNewPackageJson(targetDir);

    if (dryRun) {
      logger.info('\nWould create package.json:');
      console.log(JSON.stringify(newPackage, null, 2));
      return { dryRun: true, created: true };
    }

    await fs.writeFile(targetPath, JSON.stringify(newPackage, null, 2) + '\n');
    logger.success('Created package.json');

    return { success: true, created: true };
  }

  // Merge with existing package.json
  logger.info('Merging with existing package.json...');

  const existing = JSON.parse(await fs.readFile(targetPath, 'utf-8'));
  const merged = mergePackages(existing);

  // Calculate diff
  const diff = calculateDiff(existing, merged);

  if (Object.keys(diff.added).length === 0 &&
      Object.keys(diff.modified).length === 0) {
    logger.info('No changes needed to package.json');
    return { success: true, noChanges: true };
  }

  // Show diff
  if (!yes) {
    showDiff(diff);

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Apply these changes?',
        default: true
      }
    ]);

    if (!proceed) {
      return { cancelled: true };
    }
  }

  if (dryRun) {
    logger.info('\nDry run - no changes made');
    return { dryRun: true, diff };
  }

  // Create backup
  const backupPath = `${targetPath}.backup.${Date.now()}`;
  await fs.copyFile(targetPath, backupPath);
  logger.info(`Backup created: ${backupPath}`);

  // Write merged package.json
  await fs.writeFile(targetPath, JSON.stringify(merged, null, 2) + '\n');
  logger.success('Package.json updated');

  return { success: true, diff, backupPath };
}

function createNewPackageJson(targetDir) {
  const dirName = targetDir.split('/').pop() || 'my-project';

  return {
    name: dirName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      ...BMAD_SCRIPTS,
      'start': 'node index.js',
      'build': 'tsc',
      'test': 'vitest'
    },
    dependencies: {
      ...BMAD_DEPENDENCIES
    },
    devDependencies: {
      ...BMAD_DEV_DEPENDENCIES
    },
    engines: {
      node: '>=18.0.0'
    }
  };
}

function mergePackages(existing) {
  const merged = { ...existing };

  // Merge dependencies (don't override existing)
  merged.dependencies = {
    ...BMAD_DEPENDENCIES,
    ...existing.dependencies
  };

  // Merge devDependencies (don't override existing)
  merged.devDependencies = {
    ...BMAD_DEV_DEPENDENCIES,
    ...existing.devDependencies
  };

  // Merge scripts (add bmad: prefixed scripts)
  merged.scripts = {
    ...existing.scripts,
    ...BMAD_SCRIPTS
  };

  // Update engines if needed
  if (!merged.engines) {
    merged.engines = {};
  }
  if (!merged.engines.node || !meetsMinVersion(merged.engines.node, '18.0.0')) {
    merged.engines.node = '>=18.0.0';
  }

  // Ensure type is module if not set
  if (!merged.type) {
    merged.type = 'module';
  }

  return merged;
}

function meetsMinVersion(versionSpec, minVersion) {
  // Simple check - extract version number
  const match = versionSpec.match(/(\d+)/);
  if (!match) return false;
  const majorVersion = parseInt(match[1], 10);
  const minMajor = parseInt(minVersion.split('.')[0], 10);
  return majorVersion >= minMajor;
}

function calculateDiff(original, merged) {
  const diff = {
    added: {},
    modified: {},
    unchanged: {}
  };

  // Compare scripts
  for (const [key, value] of Object.entries(merged.scripts || {})) {
    if (!original.scripts?.[key]) {
      diff.added[`scripts.${key}`] = value;
    } else if (original.scripts[key] !== value) {
      diff.modified[`scripts.${key}`] = { from: original.scripts[key], to: value };
    }
  }

  // Compare dependencies
  for (const [key, value] of Object.entries(merged.dependencies || {})) {
    if (!original.dependencies?.[key]) {
      diff.added[`dependencies.${key}`] = value;
    }
  }

  // Compare devDependencies
  for (const [key, value] of Object.entries(merged.devDependencies || {})) {
    if (!original.devDependencies?.[key]) {
      diff.added[`devDependencies.${key}`] = value;
    }
  }

  // Check engines
  if (merged.engines?.node !== original.engines?.node) {
    diff.modified['engines.node'] = {
      from: original.engines?.node || 'not set',
      to: merged.engines.node
    };
  }

  return diff;
}

function showDiff(diff) {
  console.log('\n');
  logger.info('Changes to package.json:');
  console.log('');

  if (Object.keys(diff.added).length > 0) {
    console.log(chalk.green('+ Added:'));
    for (const [key, value] of Object.entries(diff.added)) {
      console.log(chalk.green(`  + ${key}: ${JSON.stringify(value)}`));
    }
  }

  if (Object.keys(diff.modified).length > 0) {
    console.log(chalk.yellow('~ Modified:'));
    for (const [key, change] of Object.entries(diff.modified)) {
      console.log(chalk.yellow(`  ~ ${key}:`));
      console.log(chalk.red(`    - ${change.from}`));
      console.log(chalk.green(`    + ${change.to}`));
    }
  }

  console.log('');
}
