import { execFile } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { cp, mkdir, readdir, rm, stat } from 'fs/promises';
import { createSpinner } from './prompts.js';
import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { assertValidRepoUrl } from './url-validator.js';

const execFileAsync = promisify(execFile);

const DEFAULT_REPO_URL = `https://github.com/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}.git`;

/**
 * Clones the BMAD framework repository from GitHub
 * @description Performs a shallow clone of the repository to a temporary directory.
 * Checks for git availability first and provides helpful error messages.
 * @param {Object} [options={}] - Clone options
 * @param {string} [options.branch='main'] - Branch name to clone
 * @param {number} [options.depth=1] - Clone depth (1 for shallow clone)
 * @param {string} [options.repoUrl] - Custom repository URL (defaults to BMAD-CYBERSEC repo)
 * @returns {Promise<string>} Path to the cloned repository in temp directory
 * @throws {Error} If git is not installed or not in PATH
 * @throws {Error} If the specified branch is not found
 * @throws {Error} If clone operation times out (120 second limit)
 * @example
 * // Clone main branch
 * const repoPath = await cloneRepository();
 *
 * @example
 * // Clone specific branch
 * const repoPath = await cloneRepository({ branch: 'develop' });
 */
export async function cloneRepository(options = {}) {
  const {
    branch = 'main',
    depth = 1,
    repoUrl = DEFAULT_REPO_URL
  } = options;

  const spinner = createSpinner();

  try {
    // 0. Validate repository URL to prevent command injection
    assertValidRepoUrl(repoUrl);

    // 1. Check git availability
    spinner.start('Checking git availability...');
    if (!await isGitAvailable()) {
      spinner.stop('Git is not installed');
      throw new Error(
        'Git is not installed or not in PATH.\n' +
        'Please install git or use the default download method (without --from-git).'
      );
    }
    spinner.stop('Git is available');

    // 2. Create temp directory
    const tempDir = join(tmpdir(), `${CONFIG.TEMP_DIR_PREFIX}-clone-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // 3. Validate branch name to prevent command injection
    // Branch names can contain alphanumeric, -, _, ., and /
    // See: https://git-scm.com/docs/git-check-ref-format
    const SAFE_BRANCH_PATTERN = /^[a-zA-Z0-9][\w.\-/]*$/;
    if (!SAFE_BRANCH_PATTERN.test(branch)) {
      throw new Error(
        `Invalid branch name: "${branch}". Branch names must start with alphanumeric ` +
        `and contain only letters, numbers, hyphens, underscores, dots, and forward slashes.`
      );
    }

    // 4. Clone repository using execFile for safer execution (no shell injection)
    spinner.start(`Cloning from ${branch} branch...`);
    // Use execFile with array arguments - no shell interpolation, prevents command injection
    const gitArgs = [
      'clone',
      '--depth', String(depth),
      '--branch', branch,
      repoUrl,
      tempDir
    ];

    try {
      await execFileAsync('git', gitArgs, { timeout: 120000 }); // 2 min timeout
    } catch (error) {
      if (error.message.includes('not found') || error.stderr?.includes('not found')) {
        throw new Error(`Branch '${branch}' not found in repository`);
      }
      throw error;
    }

    spinner.stop('Repository cloned');

    return tempDir;

  } catch (error) {
    spinner.stop(`Clone failed: ${error.message}`);
    throw error;
  }
}

async function isGitAvailable() {
  try {
    await execFileAsync('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies relevant framework files from source to target directory
 * @description Recursively copies files while excluding unnecessary items like
 * .git, node_modules, tests, and optionally docs/dev-tools.
 * @param {string} sourceDir - Source directory (cloned repository)
 * @param {string} targetDir - Target directory to copy files into
 * @param {Object} [options={}] - Copy options
 * @param {boolean} [options.withDocs=false] - Include documentation files
 * @param {boolean} [options.withDev=false] - Include development tools
 * @returns {Promise<number>} Number of files copied
 * @example
 * const fileCount = await copyRelevantFiles('./temp-clone', './my-project');
 * console.log(`Copied ${fileCount} files`);
 */
export async function copyRelevantFiles(sourceDir, targetDir, options = {}) {
  const spinner = createSpinner();
  spinner.start('Copying framework files...');

  const excludePatterns = [
    '.git',
    'node_modules',
    '.github',
    '__tests__',
    '*.test.js',
    '*.test.ts',
    '*.spec.js',
    '*.spec.ts',
    'coverage',
    '.nyc_output'
  ];

  // If not including docs/dev
  if (!options.withDocs) {
    excludePatterns.push('Docs');
  }
  if (!options.withDev) {
    excludePatterns.push('dev-tools');
  }

  const filesCopied = await copyRecursive(sourceDir, targetDir, excludePatterns);

  spinner.stop(`Copied ${filesCopied} files`);
  return filesCopied;
}

async function copyRecursive(src, dest, excludePatterns, count = { files: 0 }) {
  const entries = await readdir(src, { withFileTypes: true });

  await mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    // Check exclusions
    if (shouldExclude(entry.name, excludePatterns)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath, excludePatterns, count);
    } else {
      await cp(srcPath, destPath);
      count.files++;
    }
  }

  return count.files;
}

function shouldExclude(name, patterns) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(name);
    }
    return name === pattern;
  });
}

/**
 * Cleans up a cloned repository directory
 * @description Removes the temporary directory created during clone operation.
 * Silently ignores any cleanup errors.
 * @param {string} tempDir - Path to the temporary clone directory to remove
 * @returns {Promise<void>}
 * @example
 * await cleanupClone('/tmp/bmad-cyber-install-clone-123456');
 */
export async function cleanupClone(tempDir) {
  try {
    await rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
