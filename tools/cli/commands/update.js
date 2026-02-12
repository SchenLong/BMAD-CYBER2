import { existsSync, promises as fs } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { confirm, createSpinner, isCancel } from '../lib/prompts.js';
import pc from 'picocolors';
import { downloadRelease } from '../lib/downloader.js';
import { extractFramework } from '../lib/extractor.js';
import { logger } from '../lib/logger.js';
import { CONFIG } from '../lib/config.js';

const execAsync = promisify(exec);

// Files to preserve during update
const PRESERVE_FILES = [
  'src/core/config.yaml',
  '_bmad/_config/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  '.claude/hooks/',
  '.claude/validators-node/',
  '.claude/commands/',
  '.env',
  '.env.local'
];

export async function updateCommand(options) {
  const spinner = createSpinner();
  const targetDir = process.cwd();
  let backupDir = null;

  try {
    // 1. Detect current version (AC-007.1)
    spinner.start('Checking current version...');
    const currentVersion = await getCurrentVersion(targetDir);

    if (!currentVersion) {
      spinner.stop('BMAD-CYBER not detected in current directory');
      logger.error('Run this command from a directory with BMAD-CYBER installed.');
      logger.info('You can install BMAD-CYBER with: npx bmad-cybersec install');
      process.exit(1);
    }

    spinner.stop(`Current version: ${currentVersion}`);

    // Security: Validate version format if specific version requested
    if (options.version && options.version !== 'latest') {
      if (!isValidVersionFormat(options.version)) {
        spinner.stop('Invalid version format');
        logger.error('Version must be in format: v1.2.3 or 1.2.3');
        process.exit(1);
      }
    }

    // 2. Check for updates (AC-007.2)
    spinner.start('Checking for updates...');
    const latestRelease = await getLatestVersion(options.version);
    spinner.stop(`Latest version: ${latestRelease.tag}`);

    // Security: Prevent downgrade attacks (GH-093-001)
    if (options.version && options.version !== 'latest' && currentVersion !== 'unknown') {
      if (isDowngrade(latestRelease.tag, currentVersion)) {
        logger.warn('\n⚠️  SECURITY WARNING: Downgrade detected!');
        logger.warn(`You are attempting to install ${latestRelease.tag} which is OLDER than your current version ${currentVersion}.`);
        logger.warn('Downgrading to older versions may expose you to known security vulnerabilities.\n');

        if (!options.force) {
          const confirmDowngrade = await confirm({
            message: 'Are you SURE you want to downgrade? (This is not recommended)',
            initialValue: false
          });

          if (isCancel(confirmDowngrade) || !confirmDowngrade) {
            logger.info('Downgrade cancelled for security reasons.');
            return;
          }

          logger.warn('Proceeding with downgrade at user request...');
        }
      }
    }

    // 3. --check flag only checks without installing (AC-007.3)
    if (options.check) {
      showVersionComparison(currentVersion, latestRelease);

      if (isNewerVersion(latestRelease.tag, currentVersion)) {
        logger.info('\nRun `npx bmad-cybersec update` to update.');
      } else {
        logger.success('\nYou are on the latest version!');
      }
      return;
    }

    // 4. Show version comparison and changelog (AC-007.4)
    showVersionComparison(currentVersion, latestRelease);

    // Check if update needed
    if (!isNewerVersion(latestRelease.tag, currentVersion) && !options.force) {
      logger.success('You are already on the latest version!');

      const forceUpdate = await confirm({
        message: 'Would you like to reinstall anyway?',
        initialValue: false
      });

      if (isCancel(forceUpdate) || !forceUpdate) return;
    }

    // Show changelog
    await showChangelog(currentVersion, latestRelease);

    // Confirm update
    const proceed = await confirm({
      message: `Update from ${currentVersion} to ${latestRelease.tag}?`,
      initialValue: true
    });

    if (isCancel(proceed) || !proceed) {
      logger.info('Update cancelled.');
      return;
    }

    // 5. Backup configurations (AC-007.5)
    spinner.start('Backing up configurations...');
    backupDir = await backupConfigurations(targetDir);
    spinner.stop(`Configurations backed up to: ${backupDir}`);

    // 6. Download new version
    spinner.start('Downloading new version...');
    const tarballPath = await downloadRelease({
      version: options.version || 'latest'
    });
    spinner.stop('Download complete');

    // 7. Extract with force overwrite (AC-007.7)
    spinner.start('Installing update...');
    await extractFramework(tarballPath, targetDir, {
      force: true,
      withDocs: options.withDocs,
      withDev: options.withDev
    });
    spinner.stop('Update installed');

    // 8. Restore configurations (AC-007.6)
    spinner.start('Restoring configurations...');
    await restoreConfigurations(backupDir, targetDir);
    spinner.stop('Configurations restored');

    // 9. Run npm install if needed
    spinner.start('Updating dependencies...');
    try {
      await execAsync('npm install', { cwd: targetDir });
      spinner.stop('Dependencies updated');
    } catch {
      spinner.stop('Dependencies may need manual update');
    }

    // 10. Show what changed (AC-007.10)
    console.log('\n');
    logger.success(`Successfully updated to ${latestRelease.tag}!`);
    await showWhatChanged(currentVersion, latestRelease.tag);

  } catch (error) {
    spinner.stop(`Update failed: ${error.message}`);

    // AC-007.9: Rollback on failure
    if (backupDir) {
      logger.info('Attempting to restore previous configuration...');
      try {
        await restoreConfigurations(backupDir, targetDir);
        logger.success('Previous configuration restored.');
      } catch (restoreError) {
        logger.error(`Failed to restore backup: ${restoreError.message}`);
        logger.info(`Backup files are at: ${backupDir}`);
      }
    }

    logger.error('\nYour previous installation should be intact.');
    process.exit(1);
  }
}

async function getCurrentVersion(targetDir) {
  // Check _bmad/version.json first
  const versionPath = join(targetDir, '_bmad', 'version.json');

  if (existsSync(versionPath)) {
    try {
      const version = JSON.parse(await fs.readFile(versionPath, 'utf-8'));
      return version.version;
    } catch {
      // Fall through to package.json check
    }
  }

  // Try package.json
  const packagePath = join(targetDir, 'package.json');
  if (existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
      if (pkg.bmadVersion) return pkg.bmadVersion;
    } catch {
      // Ignore parsing errors
    }
  }

  // Check for _bmad directory as fallback (means BMAD is installed but version unknown)
  const bmadDir = join(targetDir, '_bmad');
  if (existsSync(bmadDir)) {
    return 'unknown';
  }

  return null;
}

async function getLatestVersion(specificVersion) {
  const GITHUB_API = 'https://api.github.com';
  const endpoint = specificVersion && specificVersion !== 'latest'
    ? `${GITHUB_API}/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/releases/tags/${specificVersion}`
    : `${GITHUB_API}/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/releases/latest`;

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'bmad-cyber-installer'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(endpoint, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Release ${specificVersion || 'latest'} not found`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN or try again later.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const release = await response.json();

  return {
    tag: release.tag_name,
    publishedAt: release.published_at,
    body: release.body
  };
}

/**
 * Compares two semver versions
 * @param {string} latest - Latest version string
 * @param {string} current - Current version string
 * @returns {boolean} True if latest is newer than current
 */
function isNewerVersion(latest, current) {
  if (current === 'unknown') return true;

  // Simple semver comparison
  const latestParts = latest.replace('v', '').split('.').map(Number);
  const currentParts = current.replace('v', '').split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  return false;
}

/**
 * Security: Checks if a version would be a downgrade
 * Prevents downgrade attacks where attacker tricks user into installing older vulnerable version
 * @param {string} targetVersion - Version to install
 * @param {string} currentVersion - Currently installed version
 * @returns {boolean} True if this would be a downgrade
 */
function isDowngrade(targetVersion, currentVersion) {
  if (currentVersion === 'unknown') return false;

  const targetParts = targetVersion.replace('v', '').split('.').map(Number);
  const currentParts = currentVersion.replace('v', '').split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const targetPart = targetParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    if (targetPart < currentPart) return true;
    if (targetPart > currentPart) return false;
  }
  return false;
}

/**
 * Security: Validates that the version format is legitimate
 * Prevents injection via malformed version strings
 * @param {string} version - Version string to validate
 * @returns {boolean} True if version format is valid
 */
function isValidVersionFormat(version) {
  if (!version || typeof version !== 'string') return false;

  // Must be either 'latest' or a valid semver-like format (v1.2.3 or 1.2.3)
  if (version === 'latest') return true;

  // Check for valid semver pattern (with optional 'v' prefix)
  const semverPattern = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
  return semverPattern.test(version);
}

function showVersionComparison(current, latest) {
  console.log('\n');
  console.log(pc.bold('Version Comparison:'));
  console.log(`  Current:  ${pc.yellow(current)}`);
  console.log(`  Latest:   ${pc.green(latest.tag)}`);
  console.log(`  Released: ${new Date(latest.publishedAt).toLocaleDateString()}`);
}

async function showChangelog(fromVersion, release) {
  console.log('\n');
  console.log(pc.bold("What's New:"));
  console.log(pc.dim('-'.repeat(40)));

  // Parse and display release notes
  if (release.body) {
    const lines = release.body.split('\n').slice(0, 15);
    lines.forEach(line => console.log(`  ${  line}`));
    if (release.body.split('\n').length > 15) {
      console.log(pc.dim('  ... (see full changelog on GitHub)'));
    }
  } else {
    console.log('  No changelog available.');
  }

  console.log('');
}

async function backupConfigurations(targetDir) {
  const timestamp = Date.now();
  const backupDir = join(targetDir, '.bmad-backup', `backup-${timestamp}`);
  await fs.mkdir(backupDir, { recursive: true });

  for (const file of PRESERVE_FILES) {
    const sourcePath = join(targetDir, file);

    if (existsSync(sourcePath)) {
      const destPath = join(backupDir, file);
      await fs.mkdir(dirname(destPath), { recursive: true });

      // Check if it's a directory
      const stat = await fs.stat(sourcePath);
      if (stat.isDirectory()) {
        await copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  return backupDir;
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function restoreConfigurations(backupDir, targetDir) {
  for (const file of PRESERVE_FILES) {
    const backupPath = join(backupDir, file);

    if (existsSync(backupPath)) {
      const destPath = join(targetDir, file);
      await fs.mkdir(dirname(destPath), { recursive: true });

      // Check if it's a directory
      const stat = await fs.stat(backupPath);
      if (stat.isDirectory()) {
        await copyDirectory(backupPath, destPath);
      } else {
        await fs.copyFile(backupPath, destPath);
      }
    }
  }
}

async function showWhatChanged(_fromVersion, toVersion) {
  console.log(pc.bold('\nUpdate Summary:'));
  console.log(`  Updated to ${pc.green(toVersion)}`);
  console.log('');
  console.log('  Your configurations have been preserved.');
  console.log('  Run `npm run bmad:health` to verify installation.');
  console.log('');
}
