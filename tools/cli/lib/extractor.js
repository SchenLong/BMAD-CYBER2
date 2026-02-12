import * as tar from 'tar';
import { existsSync, promises as fs, realpathSync } from 'fs';
import { basename, dirname, join, normalize, relative, resolve } from 'path';
import { createSpinner, isCancel, select } from './prompts.js';
import { logger } from './logger.js';

/**
 * Validates that a path does not escape the target directory (zip-slip protection)
 * @param {string} targetDir - The target extraction directory (absolute path)
 * @param {string} entryPath - The path from the archive entry
 * @returns {{ safe: boolean, resolvedPath?: string, error?: string }}
 */
function validatePathSafety(targetDir, entryPath) {
  // Normalize and resolve the full path
  const normalizedEntry = normalize(entryPath).replace(/\\/g, '/');

  // Reject paths with suspicious patterns BEFORE resolution
  if (normalizedEntry.includes('..') ||
      normalizedEntry.startsWith('/') ||
      normalizedEntry.includes('//')) {
    return {
      safe: false,
      error: `Path traversal detected: "${entryPath}"`
    };
  }

  // Resolve to absolute path
  const resolvedPath = resolve(targetDir, normalizedEntry);

  // Ensure the resolved path is within the target directory
  const relativePath = relative(targetDir, resolvedPath);
  if (relativePath.startsWith('..') || resolve(targetDir, relativePath) !== resolvedPath) {
    return {
      safe: false,
      error: `Path escapes target directory: "${entryPath}" resolves to "${resolvedPath}"`
    };
  }

  return { safe: true, resolvedPath };
}

/**
 * Validates that a symlink target stays within the extraction directory
 * @param {string} targetDir - The target extraction directory
 * @param {string} linkPath - The path where the symlink will be created
 * @param {string} linkTarget - The target of the symlink
 * @returns {{ safe: boolean, error?: string }}
 */
function validateSymlinkSafety(targetDir, linkPath, linkTarget) {
  // Resolve the symlink target relative to the link's directory
  const linkDir = dirname(linkPath);
  const resolvedTarget = resolve(linkDir, linkTarget);

  // Ensure the target stays within the extraction directory
  const relativePath = relative(targetDir, resolvedTarget);
  if (relativePath.startsWith('..')) {
    return {
      safe: false,
      error: `Symlink "${linkPath}" points outside target directory to "${linkTarget}"`
    };
  }

  return { safe: true };
}

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

  const spinner = createSpinner();

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

  // 4. Extract with security validations
  spinner.start('Extracting framework files...');
  let fileCount = 0;
  const securityViolations = [];
  const absoluteTargetDir = resolve(targetDir);

  await tar.extract({
    file: tarballPath,
    cwd: targetDir,
    strip: 1, // Remove top-level directory
    filter: (path, entry) => {
      // First check normal filtering
      if (!shouldExtract(path, filter)) {
        return false;
      }

      // Security: Validate path does not escape target directory (zip-slip protection)
      // After strip:1, we need to check the resulting path
      const parts = path.split('/');
      parts.shift(); // Remove top-level directory (strip: 1)
      const strippedPath = parts.join('/');

      if (strippedPath) {
        const pathValidation = validatePathSafety(absoluteTargetDir, strippedPath);
        if (!pathValidation.safe) {
          securityViolations.push(pathValidation.error);
          logger.warn(`Security: Skipping unsafe path - ${pathValidation.error}`);
          return false;
        }

        // Security: Reject ALL symlinks during extraction (FINDING-14)
        // Symlinks have no legitimate use in framework files and create
        // TOCTOU vulnerabilities where the link target can change between
        // validation and use. Rejecting entirely eliminates the attack surface.
        if (entry.type === 'SymbolicLink') {
          const msg = `Symlink rejected: "${strippedPath}" → "${entry.linkpath}" (symlinks not allowed in framework archives)`;
          securityViolations.push(msg);
          logger.warn(`Security: ${msg}`);
          return false;
        }
      }

      fileCount++;
      return true;
    },
    chmod: true,
    onReadEntry: (entry) => {
      // Strip setuid (4000), setgid (2000), sticky (1000) bits for security
      // Only preserve standard permission bits (owner/group/other rwx)
      if (entry.mode) {
        entry.mode = entry.mode & 0o0777;
      }
    }
  });

  if (securityViolations.length > 0) {
    logger.warn(`\nSecurity: ${securityViolations.length} potentially malicious entries were blocked during extraction.`);
  }

  spinner.stop(`Extracted ${fileCount} files`);

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
    onReadEntry: (entry) => {
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

  const action = await select({
    message: 'How would you like to handle existing files?',
    options: [
      { label: 'Overwrite all', value: 'overwrite' },
      { label: 'Skip existing files', value: 'skip' },
      { label: 'Cancel installation', value: 'cancel' }
    ]
  });

  // Handle cancellation (Ctrl+C)
  if (isCancel(action)) {
    return 'cancel';
  }

  return action;
}

async function listTarballContents(tarballPath, filter) {
  const files = [];

  await tar.list({
    file: tarballPath,
    onReadEntry: (entry) => {
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
