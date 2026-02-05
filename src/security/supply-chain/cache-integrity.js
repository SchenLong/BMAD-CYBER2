/**
 * CACHE INTEGRITY - Build Cache Security (Story 103 - VAL-09-006)
 * Implements cache integrity verification to prevent cache poisoning attacks
 *
 * Fixes:
 * - GH-103-001: Cache poisoning attack prevention
 * - GH-103-003: Symlink attack protection on cache directory
 * - BA-103-002: Cache integrity not verified
 * - SE-103-001: NIST data integrity requirements
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Hash algorithms supported
 */
const HASH_ALGORITHMS = {
  SHA256: 'sha256',
  SHA384: 'sha384',
  SHA512: 'sha512'
};

/**
 * Cache entry status
 */
const CACHE_STATUS = {
  VALID: 'valid',
  INVALID: 'invalid',
  CORRUPTED: 'corrupted',
  EXPIRED: 'expired',
  MISSING: 'missing'
};

class CacheIntegrity extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = this._mergeConfig(config);
    this.manifest = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize cache integrity system
   */
  async initialize(options = {}) {
    console.log('🔒 Initializing Cache Integrity System...');

    // Ensure cache directory exists
    await this._ensureCacheDir();

    // Load existing manifest
    await this._loadManifest();

    // Verify cache directory is not a symlink (security)
    await this._verifyCacheDirectory();

    this.isInitialized = true;
    console.log('✅ Cache Integrity System initialized');

    this.emit('initialized', {
      cacheDir: this.config.cacheDir,
      entries: this.manifest.size
    });

    return true;
  }

  /**
   * Add an item to cache with integrity hash
   * @param {string} key - Cache key
   * @param {Buffer|string} content - Content to cache
   * @param {object} metadata - Additional metadata
   */
  async cacheItem(key, content, metadata = {}) {
    this._ensureInitialized();

    const itemPath = this._getItemPath(key);

    try {
      // Calculate content hash
      const hash = this._calculateHash(content);

      // Verify cache directory hasn't been tampered with
      await this._verifyCacheDirectory();

      // Check for existing symlink attack
      await this._checkForSymlink(itemPath);

      // Write content atomically
      const tempPath = `${itemPath}.${crypto.randomBytes(8).toString('hex')}.tmp`;

      try {
        await fs.writeFile(tempPath, content);

        // Verify written content matches
        const writtenContent = await fs.readFile(tempPath);
        const writtenHash = this._calculateHash(writtenContent);

        if (writtenHash !== hash) {
          throw new Error('Cache write verification failed: hash mismatch');
        }

        // Atomic rename
        await fs.rename(tempPath, itemPath);

      } catch (error) {
        // Clean up temp file
        try { await fs.remove(tempPath); } catch {}
        throw error;
      }

      // Create manifest entry
      const entry = {
        key,
        hash,
        algorithm: this.config.hashAlgorithm,
        size: content.length,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.ttl).toISOString(),
        metadata
      };

      this.manifest.set(key, entry);

      // Save updated manifest
      await this._saveManifest();

      console.log(`📦 Cached: ${key} (${hash.slice(0, 16)}...)`);

      this.emit('item-cached', { key, hash, size: content.length });

      return entry;

    } catch (error) {
      console.error(`❌ Cache write failed: ${key}`, error);
      this.emit('cache-error', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Retrieve an item from cache with integrity verification
   * @param {string} key - Cache key
   * @returns {object} Cache result with content and status
   */
  async getItem(key) {
    this._ensureInitialized();

    const entry = this.manifest.get(key);
    const itemPath = this._getItemPath(key);

    // Check manifest
    if (!entry) {
      return { status: CACHE_STATUS.MISSING, key };
    }

    // Check expiry
    if (new Date(entry.expiresAt) < new Date()) {
      await this.invalidateItem(key);
      return { status: CACHE_STATUS.EXPIRED, key };
    }

    try {
      // Verify no symlink attack
      await this._checkForSymlink(itemPath);

      // Check file exists
      if (!await fs.pathExists(itemPath)) {
        await this._removeFromManifest(key);
        return { status: CACHE_STATUS.MISSING, key };
      }

      // Read content
      const content = await fs.readFile(itemPath);

      // Verify integrity
      const currentHash = this._calculateHash(content);

      if (currentHash !== entry.hash) {
        console.warn(`⚠️ Cache integrity violation: ${key}`);
        console.warn(`   Expected: ${entry.hash}`);
        console.warn(`   Actual:   ${currentHash}`);

        await this.invalidateItem(key);

        this.emit('integrity-violation', {
          key,
          expected: entry.hash,
          actual: currentHash
        });

        return {
          status: CACHE_STATUS.CORRUPTED,
          key,
          expectedHash: entry.hash,
          actualHash: currentHash
        };
      }

      console.log(`✅ Cache hit: ${key}`);

      return {
        status: CACHE_STATUS.VALID,
        key,
        content,
        hash: entry.hash,
        metadata: entry.metadata,
        createdAt: entry.createdAt
      };

    } catch (error) {
      console.error(`❌ Cache read failed: ${key}`, error);
      return {
        status: CACHE_STATUS.INVALID,
        key,
        error: error.message
      };
    }
  }

  /**
   * Invalidate a cache item
   */
  async invalidateItem(key) {
    const itemPath = this._getItemPath(key);

    try {
      // Remove file
      if (await fs.pathExists(itemPath)) {
        await fs.remove(itemPath);
      }

      // Remove from manifest
      await this._removeFromManifest(key);

      console.log(`🗑️ Cache invalidated: ${key}`);

      this.emit('item-invalidated', { key });

      return true;

    } catch (error) {
      console.error(`❌ Cache invalidation failed: ${key}`, error);
      return false;
    }
  }

  /**
   * Verify integrity of entire cache
   * @returns {object} Verification results
   */
  async verifyCache() {
    console.log('🔍 Verifying cache integrity...');

    const results = {
      total: this.manifest.size,
      valid: 0,
      corrupted: 0,
      missing: 0,
      expired: 0,
      errors: []
    };

    for (const [key, entry] of this.manifest) {
      try {
        const itemPath = this._getItemPath(key);

        // Check expiry
        if (new Date(entry.expiresAt) < new Date()) {
          results.expired++;
          continue;
        }

        // Check file exists
        if (!await fs.pathExists(itemPath)) {
          results.missing++;
          continue;
        }

        // Check for symlink
        const stat = await fs.lstat(itemPath);
        if (stat.isSymbolicLink()) {
          results.corrupted++;
          results.errors.push({
            key,
            error: 'Symlink detected - possible attack'
          });
          continue;
        }

        // Verify hash
        const content = await fs.readFile(itemPath);
        const hash = this._calculateHash(content);

        if (hash === entry.hash) {
          results.valid++;
        } else {
          results.corrupted++;
          results.errors.push({
            key,
            expected: entry.hash,
            actual: hash,
            error: 'Hash mismatch'
          });
        }

      } catch (error) {
        results.corrupted++;
        results.errors.push({
          key,
          error: error.message
        });
      }
    }

    console.log(`✅ Cache verification: ${results.valid}/${results.total} valid`);

    if (results.corrupted > 0) {
      console.warn(`⚠️ ${results.corrupted} corrupted entries detected`);
    }

    this.emit('verification-complete', results);

    return results;
  }

  /**
   * Clean expired and corrupted cache entries
   */
  async cleanCache() {
    console.log('🧹 Cleaning cache...');

    const verification = await this.verifyCache();
    let cleaned = 0;

    // Remove corrupted entries
    for (const error of verification.errors) {
      await this.invalidateItem(error.key);
      cleaned++;
    }

    // Remove expired entries
    for (const [key, entry] of this.manifest) {
      if (new Date(entry.expiresAt) < new Date()) {
        await this.invalidateItem(key);
        cleaned++;
      }
    }

    console.log(`✅ Cleaned ${cleaned} cache entries`);

    return { cleaned };
  }

  /**
   * Get cache statistics
   */
  getStatistics() {
    let totalSize = 0;
    let oldestEntry = null;
    let newestEntry = null;

    for (const [key, entry] of this.manifest) {
      totalSize += entry.size || 0;

      if (!oldestEntry || entry.createdAt < oldestEntry.createdAt) {
        oldestEntry = entry;
      }
      if (!newestEntry || entry.createdAt > newestEntry.createdAt) {
        newestEntry = entry;
      }
    }

    return {
      totalEntries: this.manifest.size,
      totalSize,
      hashAlgorithm: this.config.hashAlgorithm,
      cacheDir: this.config.cacheDir,
      oldestEntry: oldestEntry?.createdAt,
      newestEntry: newestEntry?.createdAt
    };
  }

  /**
   * Check if an item is in cache and valid
   */
  async hasValidItem(key) {
    const result = await this.getItem(key);
    return result.status === CACHE_STATUS.VALID;
  }

  // Private methods

  _mergeConfig(userConfig) {
    return {
      cacheDir: path.join(process.cwd(), '.bmad-cache'),
      hashAlgorithm: HASH_ALGORITHMS.SHA256,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      manifestFile: 'manifest.json',
      ...userConfig
    };
  }

  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Cache integrity system not initialized');
    }
  }

  async _ensureCacheDir() {
    await fs.ensureDir(this.config.cacheDir);
  }

  async _verifyCacheDirectory() {
    const stat = await fs.lstat(this.config.cacheDir);

    if (stat.isSymbolicLink()) {
      throw new Error(
        'SECURITY: Cache directory is a symlink. Possible attack detected. ' +
        'Remove the symlink and recreate the cache directory.'
      );
    }

    if (!stat.isDirectory()) {
      throw new Error('Cache path exists but is not a directory');
    }
  }

  async _checkForSymlink(filePath) {
    if (await fs.pathExists(filePath)) {
      const stat = await fs.lstat(filePath);
      if (stat.isSymbolicLink()) {
        throw new Error(`SECURITY: Symlink detected at ${filePath}. Possible attack.`);
      }
    }
  }

  _getItemPath(key) {
    // Sanitize key to prevent path traversal
    const safeKey = key
      .replace(/\.\./g, '_')
      .replace(/[/\\]/g, '_')
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    return path.join(this.config.cacheDir, safeKey);
  }

  _calculateHash(content) {
    return crypto
      .createHash(this.config.hashAlgorithm)
      .update(content)
      .digest('hex');
  }

  async _loadManifest() {
    const manifestPath = path.join(this.config.cacheDir, this.config.manifestFile);

    try {
      if (await fs.pathExists(manifestPath)) {
        const data = await fs.readJson(manifestPath);

        // Verify manifest integrity
        if (data.checksum) {
          const entriesHash = this._calculateHash(JSON.stringify(data.entries));
          if (entriesHash !== data.checksum) {
            console.warn('⚠️ Manifest integrity check failed - rebuilding');
            return;
          }
        }

        for (const [key, entry] of Object.entries(data.entries || {})) {
          this.manifest.set(key, entry);
        }

        console.log(`📋 Loaded ${this.manifest.size} cache entries from manifest`);
      }
    } catch (error) {
      console.warn('Could not load cache manifest:', error.message);
    }
  }

  async _saveManifest() {
    const manifestPath = path.join(this.config.cacheDir, this.config.manifestFile);

    const entries = Object.fromEntries(this.manifest);
    const checksum = this._calculateHash(JSON.stringify(entries));

    const data = {
      version: '1.0.0',
      algorithm: this.config.hashAlgorithm,
      checksum,
      entries,
      updatedAt: new Date().toISOString()
    };

    // Write atomically
    const tempPath = `${manifestPath}.tmp`;
    await fs.writeJson(tempPath, data, { spaces: 2 });
    await fs.rename(tempPath, manifestPath);
  }

  async _removeFromManifest(key) {
    this.manifest.delete(key);
    await this._saveManifest();
  }
}

// Export constants
CacheIntegrity.HASH_ALGORITHMS = HASH_ALGORITHMS;
CacheIntegrity.CACHE_STATUS = CACHE_STATUS;

module.exports = CacheIntegrity;
