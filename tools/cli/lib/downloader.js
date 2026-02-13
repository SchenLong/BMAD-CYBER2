import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, readFile, rm } from 'fs/promises';
import { createSpinner } from './prompts.js';
import { CONFIG } from './config.js';
import { logger } from './logger.js';

const GITHUB_API = 'https://api.github.com';

/**
 * Allowed URL hosts for SSRF protection
 * Only URLs from these domains are permitted for downloads
 */
const ALLOWED_HOSTS = [
  'api.github.com',
  'github.com',
  'objects.githubusercontent.com',
  'github-releases.githubusercontent.com',
  'release-assets.githubusercontent.com',
  'codeload.github.com'
];

/**
 * Validates a URL against the allowed hosts to prevent SSRF attacks
 * @param {string} urlString - The URL to validate
 * @returns {{ valid: boolean, error?: string }}
 */
/**
 * Pattern to detect IP literal hostnames (IPv4 and IPv6) — FINDING-19
 * IP literals can bypass domain-based allowlists via DNS rebinding or SSRF.
 */
const IP_LITERAL_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$|^\[.*\]$/;

function validateDownloadUrl(urlString) {
  try {
    const url = new URL(urlString);

    // Must be HTTPS
    if (url.protocol !== 'https:') {
      return {
        valid: false,
        error: `Only HTTPS URLs are allowed. Received: ${url.protocol}`
      };
    }

    // Security: Reject IP literal hostnames (FINDING-19)
    // IP addresses can bypass domain allowlists and enable SSRF via DNS rebinding
    const hostname = url.hostname.toLowerCase();
    if (IP_LITERAL_PATTERN.test(hostname)) {
      return {
        valid: false,
        error: `IP literal hostnames are not allowed: "${hostname}". Use domain names only.`
      };
    }

    // Must be from allowed host (exact match only — no subdomain wildcards)
    const isAllowed = ALLOWED_HOSTS.some(allowed => hostname === allowed);

    if (!isAllowed) {
      return {
        valid: false,
        error: `URL host "${hostname}" is not in the allowed list: ${ALLOWED_HOSTS.join(', ')}`
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `Invalid URL format: ${urlString}`
    };
  }
}

/**
 * Validates and fetches from a URL with SSRF protection
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 * @throws {Error} If URL validation fails
 */
async function safeFetch(url, options = {}) {
  const validation = validateDownloadUrl(url);
  if (!validation.valid) {
    throw new Error(`Security: ${validation.error}`);
  }

  // Follow redirects manually to revalidate each target URL
  const MAX_REDIRECTS = 5;
  let currentUrl = url;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const response = await fetch(currentUrl, { ...options, redirect: 'manual' });

    // Not a redirect — return the final response
    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    // Redirect — revalidate the target URL before following
    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Security: Redirect response missing Location header');
    }

    // Resolve relative redirects against current URL
    const redirectUrl = new URL(location, currentUrl).href;
    const redirectValidation = validateDownloadUrl(redirectUrl);
    if (!redirectValidation.valid) {
      throw new Error(`Security: Redirect blocked — ${redirectValidation.error}`);
    }

    currentUrl = redirectUrl;
  }

  throw new Error(`Security: Too many redirects (max ${MAX_REDIRECTS})`);
}

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
  const spinner = createSpinner();

  try {
    // 1. Get release info from GitHub API
    spinner.start('Fetching release information...');
    const release = await fetchReleaseInfo(version);
    spinner.stop(`Found release: ${release.tag_name}`);

    // 2. Find tarball and checksum assets
    const tarballAsset = release.assets.find(a => a.name.endsWith('.tar.gz'));
    const checksumAsset = release.assets.find(a => a.name.endsWith('.sha256'));

    if (!tarballAsset) {
      // Fallback to source tarball — no checksum available
      logger.warn('Security: No release tarball found. Falling back to source archive WITHOUT checksum verification.');
      logger.warn('Use --from-git for a verified clone if integrity is a concern.');
      return await downloadSourceTarball(release.tarball_url, release.tag_name);
    }

    // 3. Download with progress
    spinner.start(`Downloading ${tarballAsset.name}...`);
    const tarballPath = await downloadWithProgress(
      tarballAsset.browser_download_url,
      tarballAsset.name,
      tarballAsset.size
    );
    spinner.stop('Download complete');

    // 4. Verify checksum - MANDATORY for release assets
    if (checksumAsset) {
      spinner.start('Verifying checksum...');
      await verifyChecksum(tarballPath, checksumAsset.browser_download_url);
      spinner.stop('Checksum verified');
    } else {
      // Security: Checksum verification is MANDATORY for release tarballs
      spinner.stop('Security: No checksum file found');
      await rm(tarballPath, { force: true });
      throw new Error(
        'Security: Checksum verification is mandatory for release downloads. ' +
        'The release is missing a .sha256 checksum file. ' +
        'Use --from-git to clone directly if this is intentional.'
      );
    }

    return tarballPath;

  } catch (error) {
    spinner.stop(`Download failed: ${error.message}`);
    throw error;
  }
}

/**
 * Validates version parameter format (FINDING-21)
 * Only allows semver-like tags (v1.2.3, 1.2.3, v1.2.3-beta.1) or 'latest'
 */
const VERSION_PATTERN = /^(?:latest|v?\d+\.\d+\.\d+(?:-[\w.]+)?)$/;

async function fetchReleaseInfo(version) {
  // Security: Validate version format before URL interpolation (FINDING-21)
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Invalid version format: "${version}". Expected semver (e.g., v1.2.3) or "latest".`);
  }

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

  const safeTagName = tagName.replace(/[/\\]/g, '_');
  const filename = `${safeTagName}.tar.gz`;
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

  // Download checksum file (with SSRF protection)
  const response = await safeFetch(checksumUrl, { headers });
  if (!response.ok) {
    throw new Error(`Failed to download checksum file: ${response.status}`);
  }
  const checksumContent = await response.text();
  const expectedHash = checksumContent.split(' ')[0].trim();

  // Validate hash format (should be 64 hex characters for SHA256)
  if (!/^[a-fA-F0-9]{64}$/.test(expectedHash)) {
    throw new Error('Invalid checksum format in checksum file');
  }

  // Calculate actual hash
  const fileBuffer = await readFile(filePath);
  const hash = createHash('sha256').update(fileBuffer).digest('hex');

  if (hash.toLowerCase() !== expectedHash.toLowerCase()) {
    await rm(filePath);
    throw new Error('Checksum verification failed. File may be corrupted or tampered with.');
  }
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use safeFetch for SSRF protection
      return await safeFetch(url, options);
    } catch (error) {
      // Don't retry security validation errors
      if (error.message.startsWith('Security:')) {
        throw error;
      }
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
