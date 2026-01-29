import tar from 'tar';
import { existsSync, promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import { logger } from './logger.js';

const ALWAYS_SKIP = [
  '.git/',
  '.github/',
  'node_modules/',
  '*.test.js',
  '*.test.ts',
  '*.spec.js',
  '*.spec.ts',
  'coverage/',
  '.nyc_output/',
  '__tests__/'
];

const PRIORITY_FILES = [
  '_bmad/',
  '.claude/',
  'src/utility/tools/',
  'CLAUDE.md'
];

const OPTIONAL_FILES = {
  withDocs: ['Docs/'],
  withDev: ['dev-tools/']
};

/**
 * Extracts framework files from a tarball to the target directory
 * @description Extracts files from a downloaded tarball, filtering out unnecessary files
 * (tests, node_modules, etc.) and optionally handling file conflicts with existing files.
 * @param {string} tarballPath - Path to the tarball file to extract
 * @param {string} targetDir - Target directory to extract files into
 * @param {Object} [options={}] - Extraction options
 * @param {boolean} [options.overwrite=false] - Whether to overwrite existing files without prompting
 * @param {boolean} [options.force=false] - Force extraction without conflict checking
 * @param {boolean} [options.withDocs=false] - Include documentation files in extraction
 * @param {boolean} [options.withDev=false] - Include development tools in extraction
 * @param {boolean} [options.dryRun=false] - List files without extracting
 * @returns {Promise<Object>} Extraction result object
 * @returns {boolean} [returns.success] - True if extraction completed successfully
 * @returns {boolean} [returns.cancelled] - True if user cancelled the operation
 * @returns {boolean} [returns.dryRun] - True if this was a dry run
 * @returns {number} returns.filesExtracted - Number of files extracted (0 for dry run or cancel)
 * @returns {string[]} [returns.files] - List of files (only in dry run mode)
 * @throws {Error} If tarball extraction fails
 * @example
 * // Basic extraction
 * const result = await extractFramework('./release.tar.gz', './my-project');
 *
 * @example
 * // Dry run to preview files
 * const result = await extractFramework('./release.tar.gz', './my-project', { dryRun: true });
 * console.log(result.files);
 */
export async function extractFramework(tarballPath, targetDir, options = {}) {
  const {
    overwrite = false,
    force = false,
    withDocs = false,
    withDev = false,
    dryRun = false
  } = options;

  const spinner = ora();

  // 1. Build file filter
  const filter = buildFilter({ withDocs, withDev });

  // 2. If not force, check for conflicts
  if (!force && !dryRun) {
    spinner.start('Checking for existing files...');
    const conflicts = await findConflicts(tarballPath, targetDir, filter);
    spinner.stop();

    if (conflicts.length > 0) {
      const action = await promptOverwrite(conflicts);
      if (action === 'cancel') {
        return { cancelled: true, filesExtracted: 0 };
      }
      if (action === 'skip') {
        // Add conflicts to skip list
        filter.skipFiles = conflicts;
      }
    }
  }

  // 3. Dry run - just list files
  if (dryRun) {
    spinner.start('Analyzing tarball contents...');
    const files = await listTarballContents(tarballPath, filter);
    spinner.stop();

    logger.info('\nFiles that would be extracted:');
    files.forEach(f => logger.info(`  ${f}`));
    logger.info(`\nTotal: ${files.length} files`);

    return { dryRun: true, files, filesExtracted: 0 };
  }

  // 4. Extract
  spinner.start('Extracting framework files...');
  let fileCount = 0;

  await tar.extract({
    file: tarballPath,
    cwd: targetDir,
    strip: 1, // Remove top-level directory
    filter: (path) => {
      if (shouldExtract(path, filter)) {
        fileCount++;
        return true;
      }
      return false;
    },
    onentry: (entry) => {
      // Preserve permissions
      if (entry.mode) {
        entry.mode = entry.mode;
      }
    }
  });

  spinner.succeed(`Extracted ${fileCount} files`);

  return { success: true, filesExtracted: fileCount };
}

function buildFilter({ withDocs, withDev }) {
  const skip = [...ALWAYS_SKIP];
  const include = [...PRIORITY_FILES];

  if (withDocs) {
    include.push(...OPTIONAL_FILES.withDocs);
  } else {
    skip.push('Docs/');
  }

  if (withDev) {
    include.push(...OPTIONAL_FILES.withDev);
  } else {
    skip.push('dev-tools/');
  }

  return { skip, include, skipFiles: [] };
}

function shouldExtract(path, filter) {
  // Normalize path
  const normalizedPath = path.replace(/\\/g, '/');

  // Check explicit skip files
  if (filter.skipFiles.includes(normalizedPath)) {
    return false;
  }

  // Check always-skip patterns
  for (const pattern of filter.skip) {
    if (pattern.endsWith('/')) {
      if (normalizedPath.includes(pattern) || normalizedPath.startsWith(pattern)) {
        return false;
      }
    } else if (pattern.startsWith('*')) {
      const ext = pattern.slice(1);
      if (normalizedPath.endsWith(ext)) {
        return false;
      }
    } else if (normalizedPath === pattern || normalizedPath.includes(`/${pattern}`)) {
      return false;
    }
  }

  return true;
}

async function findConflicts(tarballPath, targetDir, filter) {
  const conflicts = [];

  // List tarball contents
  const entries = [];
  await tar.list({
    file: tarballPath,
    onentry: (entry) => {
      if (entry.type === 'File' && shouldExtract(entry.path, filter)) {
        // Remove top-level directory from path
        const parts = entry.path.split('/');
        parts.shift();
        const relativePath = parts.join('/');
        if (relativePath) {
          entries.push(relativePath);
        }
      }
    }
  });

  // Check for existing files
  for (const entry of entries) {
    const fullPath = join(targetDir, entry);
    if (existsSync(fullPath)) {
      conflicts.push(entry);
    }
  }

  return conflicts;
}

async function promptOverwrite(conflicts) {
  console.log('\n');
  logger.warn(`Found ${conflicts.length} existing files that would be overwritten:`);

  // Show first 10 conflicts
  const shown = conflicts.slice(0, 10);
  shown.forEach(f => logger.info(`  - ${f}`));
  if (conflicts.length > 10) {
    logger.info(`  ... and ${conflicts.length - 10} more`);
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'How would you like to handle existing files?',
      choices: [
        { name: 'Overwrite all', value: 'overwrite' },
        { name: 'Skip existing files', value: 'skip' },
        { name: 'Cancel installation', value: 'cancel' }
      ]
    }
  ]);

  return action;
}

async function listTarballContents(tarballPath, filter) {
  const files = [];

  await tar.list({
    file: tarballPath,
    onentry: (entry) => {
      if (entry.type === 'File' && shouldExtract(entry.path, filter)) {
        const parts = entry.path.split('/');
        parts.shift();
        const relativePath = parts.join('/');
        if (relativePath) {
          files.push(relativePath);
        }
      }
    }
  });

  return files.sort();
}
