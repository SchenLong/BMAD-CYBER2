/**
 * Offline Installation Support Module
 * Provides offline installation capabilities for BMAD framework
 *
 * Addresses: VAL-03-008 - Offline Installation Support
 *
 * Features:
 * - Bundled dependencies caching
 * - --offline flag support
 * - Local tarball extraction
 * - Offline-first installation strategy
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Default offline configuration
 */
const OFFLINE_CONFIG = {
  cacheDir: '.bmad-offline-cache',
  bundleDir: 'bundled-modules',
  maxCacheAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  checksumAlgorithm: 'sha256'
};

/**
 * Offline Support Manager
 * Handles offline installation scenarios
 */
class OfflineSupport {
  constructor(options = {}) {
    this.config = {
      ...OFFLINE_CONFIG,
      projectRoot: options.projectRoot || process.cwd(),
      ...options
    };

    this.cacheDir = path.join(this.config.projectRoot, this.config.cacheDir);
    this.bundleDir = path.join(this.config.projectRoot, this.config.bundleDir);

    // Track cached packages
    this.cachedPackages = new Map();
    this.initialized = false;
  }

  /**
   * Initialize offline support
   */
  async initialize() {
    try {
      // Ensure cache directory exists
      await fs.mkdir(this.cacheDir, { recursive: true });

      // Load cache manifest if exists
      await this.loadCacheManifest();

      this.initialized = true;
      console.log('[OfflineSupport] Initialized successfully');
      return true;
    } catch (error) {
      console.warn(`[OfflineSupport] Initialization warning: ${error.message}`);
      return false;
    }
  }

  /**
   * Load cache manifest from disk
   */
  async loadCacheManifest() {
    const manifestPath = path.join(this.cacheDir, 'manifest.json');

    try {
      const content = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(content);

      for (const [key, value] of Object.entries(manifest.packages || {})) {
        this.cachedPackages.set(key, value);
      }

      console.log(`[OfflineSupport] Loaded ${this.cachedPackages.size} cached packages`);
    } catch (error) {
      // Manifest doesn't exist yet - that's OK
      if (error.code !== 'ENOENT') {
        console.warn(`[OfflineSupport] Could not load manifest: ${error.message}`);
      }
    }
  }

  /**
   * Save cache manifest to disk
   */
  async saveCacheManifest() {
    const manifestPath = path.join(this.cacheDir, 'manifest.json');

    const manifest = {
      version: '1.0.0',
      created: new Date().toISOString(),
      packages: Object.fromEntries(this.cachedPackages)
    };

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  /**
   * Check if a package is available offline
   * @param {string} packageName - Package name
   * @param {string} version - Package version
   * @returns {Promise<boolean>} - Whether package is cached
   */
  async isPackageCached(packageName, version) {
    const cacheKey = `${packageName}@${version}`;

    if (!this.cachedPackages.has(cacheKey)) {
      return false;
    }

    const cacheEntry = this.cachedPackages.get(cacheKey);
    const tarballPath = path.join(this.cacheDir, cacheEntry.tarball);

    try {
      await fs.access(tarballPath);
      return true;
    } catch {
      // Remove stale cache entry
      this.cachedPackages.delete(cacheKey);
      return false;
    }
  }

  /**
   * Get cached package tarball path
   * @param {string} packageName - Package name
   * @param {string} version - Package version
   * @returns {string|null} - Path to cached tarball or null
   */
  async getCachedPackagePath(packageName, version) {
    const cacheKey = `${packageName}@${version}`;

    if (await this.isPackageCached(packageName, version)) {
      const cacheEntry = this.cachedPackages.get(cacheKey);
      return path.join(this.cacheDir, cacheEntry.tarball);
    }

    return null;
  }

  /**
   * Cache a package for offline use
   * @param {string} packageName - Package name
   * @param {string} version - Package version
   * @param {string} tarballUrl - URL to download tarball from
   * @returns {Promise<Object>} - Cache result
   */
  async cachePackage(packageName, version, tarballUrl) {
    const cacheKey = `${packageName}@${version}`;
    const tarballName = `${packageName.replace('/', '-')}-${version}.tgz`;
    const tarballPath = path.join(this.cacheDir, tarballName);

    try {
      // Download tarball using npm pack or fetch
      await this.downloadTarball(tarballUrl, tarballPath);

      // Calculate checksum
      const checksum = await this.calculateChecksum(tarballPath);

      // Record in cache
      const cacheEntry = {
        packageName,
        version,
        tarball: tarballName,
        checksum,
        cachedAt: new Date().toISOString(),
        source: tarballUrl
      };

      this.cachedPackages.set(cacheKey, cacheEntry);
      await this.saveCacheManifest();

      console.log(`[OfflineSupport] Cached ${cacheKey}`);

      return {
        success: true,
        cacheKey,
        path: tarballPath,
        checksum
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download a tarball to local cache
   * @param {string} url - Tarball URL
   * @param {string} destPath - Destination path
   */
  async downloadTarball(url, destPath) {
    // Use npm pack for NPM packages
    if (url.includes('registry.npmjs.org')) {
      const packageSpec = url.split('/').slice(-1)[0].replace('.tgz', '');
      await execAsync(`npm pack ${packageSpec} --pack-destination="${path.dirname(destPath)}"`);
      return;
    }

    // Use curl/wget for other URLs
    try {
      await execAsync(`curl -L -o "${destPath}" "${url}"`);
    } catch {
      await execAsync(`wget -O "${destPath}" "${url}"`);
    }
  }

  /**
   * Calculate SHA256 checksum of a file
   * @param {string} filePath - File path
   * @returns {Promise<string>} - Hex checksum
   */
  async calculateChecksum(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash(this.config.checksumAlgorithm).update(content).digest('hex');
  }

  /**
   * Verify cached package integrity
   * @param {string} packageName - Package name
   * @param {string} version - Package version
   * @returns {Promise<boolean>} - Whether package is valid
   */
  async verifyPackageIntegrity(packageName, version) {
    const cacheKey = `${packageName}@${version}`;

    if (!this.cachedPackages.has(cacheKey)) {
      return false;
    }

    const cacheEntry = this.cachedPackages.get(cacheKey);
    const tarballPath = path.join(this.cacheDir, cacheEntry.tarball);

    try {
      const currentChecksum = await this.calculateChecksum(tarballPath);
      return currentChecksum === cacheEntry.checksum;
    } catch {
      return false;
    }
  }

  /**
   * Install a package from offline cache
   * @param {string} packageName - Package name
   * @param {string} version - Package version
   * @param {string} targetDir - Installation target directory
   * @returns {Promise<Object>} - Installation result
   */
  async installFromCache(packageName, version, targetDir) {
    const tarballPath = await this.getCachedPackagePath(packageName, version);

    if (!tarballPath) {
      return {
        success: false,
        error: `Package ${packageName}@${version} not found in offline cache`
      };
    }

    // Verify integrity
    if (!await this.verifyPackageIntegrity(packageName, version)) {
      return {
        success: false,
        error: `Package ${packageName}@${version} failed integrity check`
      };
    }

    try {
      // Install from tarball using npm
      await execAsync(`npm install "${tarballPath}"`, {
        cwd: targetDir
      });

      return {
        success: true,
        installedFrom: 'offline-cache',
        tarball: tarballPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to install from cache: ${error.message}`
      };
    }
  }

  /**
   * Get list of bundled dependencies from package.json
   * @returns {Promise<Array>} - List of bundled dependencies
   */
  async getBundledDependencies() {
    const packageJsonPath = path.join(this.config.projectRoot, 'package.json');

    try {
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);

      return packageJson.bundledDependencies || packageJson.bundleDependencies || [];
    } catch {
      return [];
    }
  }

  /**
   * Check if bundled dependencies are available
   * @returns {Promise<Object>} - Bundled dependencies status
   */
  async checkBundledDependencies() {
    const bundled = await this.getBundledDependencies();
    const results = {
      total: bundled.length,
      available: 0,
      missing: [],
      packages: []
    };

    for (const packageName of bundled) {
      const packagePath = path.join(this.config.projectRoot, 'node_modules', packageName);

      try {
        await fs.access(packagePath);
        results.available++;
        results.packages.push({ name: packageName, status: 'available' });
      } catch {
        results.missing.push(packageName);
        results.packages.push({ name: packageName, status: 'missing' });
      }
    }

    return results;
  }

  /**
   * Prepare for offline installation by caching all dependencies
   * @returns {Promise<Object>} - Preparation result
   */
  async prepareOfflineInstallation() {
    const packageJsonPath = path.join(this.config.projectRoot, 'package.json');

    try {
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.optionalDependencies
      };

      const results = {
        total: Object.keys(allDeps).length,
        cached: 0,
        failed: [],
        packages: []
      };

      for (const [name, version] of Object.entries(allDeps)) {
        const cleanVersion = version.replace(/^[\^~]/, '');

        if (await this.isPackageCached(name, cleanVersion)) {
          results.cached++;
          results.packages.push({ name, version: cleanVersion, status: 'cached' });
        } else {
          // Try to cache using npm pack
          try {
            await execAsync(`npm pack ${name}@${cleanVersion} --pack-destination="${this.cacheDir}"`);
            results.cached++;
            results.packages.push({ name, version: cleanVersion, status: 'cached' });
          } catch (error) {
            results.failed.push({ name, version: cleanVersion, error: error.message });
            results.packages.push({ name, version: cleanVersion, status: 'failed' });
          }
        }
      }

      await this.saveCacheManifest();

      return results;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean old cache entries
   * @returns {Promise<Object>} - Cleanup result
   */
  async cleanCache() {
    const now = Date.now();
    const maxAge = this.config.maxCacheAge;
    let removed = 0;

    for (const [cacheKey, entry] of this.cachedPackages) {
      const cachedAt = new Date(entry.cachedAt).getTime();

      if (now - cachedAt > maxAge) {
        const tarballPath = path.join(this.cacheDir, entry.tarball);

        try {
          await fs.unlink(tarballPath);
          this.cachedPackages.delete(cacheKey);
          removed++;
        } catch {
          // File may already be removed
        }
      }
    }

    await this.saveCacheManifest();

    return {
      removed,
      remaining: this.cachedPackages.size
    };
  }

  /**
   * Get offline support status summary
   * @returns {Object} - Status summary
   */
  getStatus() {
    return {
      initialized: this.initialized,
      cacheDir: this.cacheDir,
      cachedPackages: this.cachedPackages.size,
      config: {
        maxCacheAge: this.config.maxCacheAge,
        checksumAlgorithm: this.config.checksumAlgorithm
      }
    };
  }
}

/**
 * Check if --offline flag was passed
 * @returns {boolean} - Whether offline mode is requested
 */
const isOfflineFlagSet = () => {
  return process.argv.includes('--offline') ||
         process.env.BMAD_OFFLINE === 'true' ||
         process.env.npm_config_offline === 'true';
};

/**
 * Create offline support instance
 */
const createOfflineSupport = (options = {}) => {
  return new OfflineSupport(options);
};

module.exports = {
  OfflineSupport,
  createOfflineSupport,
  isOfflineFlagSet,
  OFFLINE_CONFIG
};
