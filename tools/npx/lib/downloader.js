import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, rm, readFile } from 'fs/promises';
import ora from 'ora';
import { CONFIG } from './config.js';
import { logger } from './logger.js';

const GITHUB_API = 'https://api.github.com';

/**
 * Downloads a release tarball from GitHub
 * @description Fetches release information from GitHub API, downloads the tarball asset,
 * and optionally verifies the checksum. Falls back to source tarball if no release asset found.
 * @param {Object} [options={}] - Download options
 * @param {string} [options.version='latest'] - Release version tag (e.g., 'v2.0.0' or 'latest')
 * @param {string|null} [options.branch=null] - Branch name for development builds (currently unused)
 * @returns {Promise<string>} Path to the downloaded tarball in the temp directory
 * @throws {Error} If release not found, download fails, or checksum verification fails
 * @example
 * // Download latest release
 * const tarballPath = await downloadRelease();
 *
 * @example
 * // Download specific version
 * const tarballPath = await downloadRelease({ version: 'v2.0.0' });
 */
export async function downloadRelease(options = {}) {
  const { version = 'latest', branch = null } = options;
  const spinner = ora();

  try {
    // 1. Get release info from GitHub API
    spinner.start('Fetching release information...');
    const release = await fetchReleaseInfo(version);
    spinner.succeed(`Found release: ${release.tag_name}`);

    // 2. Find tarball and checksum assets
    const tarballAsset = release.assets.find(a => a.name.endsWith('.tar.gz'));
    const checksumAsset = release.assets.find(a => a.name.endsWith('.sha256'));

    if (!tarballAsset) {
      // Fallback to source tarball
      logger.info('No release tarball found, using source archive');
      return await downloadSourceTarball(release.tarball_url, release.tag_name);
    }

    // 3. Download with progress
    spinner.start(`Downloading ${tarballAsset.name}...`);
    const tarballPath = await downloadWithProgress(
      tarballAsset.browser_download_url,
      tarballAsset.name,
      tarballAsset.size
    );
    spinner.succeed('Download complete');

    // 4. Verify checksum if available
    if (checksumAsset) {
      spinner.start('Verifying checksum...');
      await verifyChecksum(tarballPath, checksumAsset.browser_download_url);
      spinner.succeed('Checksum verified');
    } else {
      logger.warn('No checksum file found, skipping verification');
    }

    return tarballPath;

  } catch (error) {
    spinner.fail(`Download failed: ${error.message}`);
    throw error;
  }
}

async function fetchReleaseInfo(version) {
  const endpoint = version === 'latest'
    ? `${GITHUB_API}/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/releases/latest`
    : `${GITHUB_API}/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/releases/tags/${version}`;

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'bmad-cyber-installer'
  };

  // Add auth token if available
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetchWithRetry(endpoint, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Release ${version} not found`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN or try again later.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

async function downloadSourceTarball(url, tagName) {
  const tempDir = join(tmpdir(), CONFIG.TEMP_DIR_PREFIX);
  await mkdir(tempDir, { recursive: true });

  const filename = `${tagName}.tar.gz`;
  const filePath = join(tempDir, filename);

  const headers = {
    'User-Agent': 'bmad-cyber-installer'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetchWithRetry(url, { headers });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const fileStream = createWriteStream(filePath);
  await pipeline(response.body, fileStream);

  return filePath;
}

async function downloadWithProgress(url, filename, expectedSize) {
  const tempDir = join(tmpdir(), CONFIG.TEMP_DIR_PREFIX);
  await mkdir(tempDir, { recursive: true });

  const filePath = join(tempDir, filename);

  const headers = {
    'User-Agent': 'bmad-cyber-installer'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetchWithRetry(url, { headers });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const fileStream = createWriteStream(filePath);
  await pipeline(response.body, fileStream);

  return filePath;
}

async function verifyChecksum(filePath, checksumUrl) {
  const headers = {
    'User-Agent': 'bmad-cyber-installer'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  // Download checksum file
  const response = await fetch(checksumUrl, { headers });
  const checksumContent = await response.text();
  const expectedHash = checksumContent.split(' ')[0].trim();

  // Calculate actual hash
  const fileBuffer = await readFile(filePath);
  const hash = createHash('sha256').update(fileBuffer).digest('hex');

  if (hash !== expectedHash) {
    await rm(filePath);
    throw new Error('Checksum verification failed. File may be corrupted.');
  }
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      logger.info(`Retry ${attempt}/${retries} after ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Cleans up temporary download files
 * @description Removes the temporary directory used for storing downloaded tarballs.
 * Silently ignores any cleanup errors.
 * @returns {Promise<void>}
 * @example
 * await cleanup();
 */
export async function cleanup() {
  const tempDir = join(tmpdir(), CONFIG.TEMP_DIR_PREFIX);
  try {
    await rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
