/**
 * BMAD Artifact Manager - Epic 5.1
 * Manages build artifacts, caching, and artifact lifecycle.
 *
 * @module ArtifactManager
 * @version 1.0.0
 */

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Artifact types enumeration
 */
const ArtifactType = {
  BINARY: 'binary',
  LIBRARY: 'library',
  EXECUTABLE: 'executable',
  BUNDLE: 'bundle',
  SOURCEMAP: 'sourcemap',
  DOCUMENTATION: 'documentation',
  TEST_RESULTS: 'test_results',
  COVERAGE: 'coverage',
  METADATA: 'metadata'
};

/**
 * Cache strategies
 */
const CacheStrategy = {
  NONE: 'none',
  CONTENT_HASH: 'content_hash',
  TIMESTAMP: 'timestamp',
  AGGRESSIVE: 'aggressive'
};

/**
 * Artifact Manager class
 * Handles build artifact collection, caching, and lifecycle management
 */
class ArtifactManager extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      cacheEnabled: config.cacheEnabled !== false,
      cacheDir: config.cacheDir || path.join(process.cwd(), '.build-cache'),
      artifactDir: config.artifactDir || path.join(process.cwd(), 'artifacts'),
      retentionDays: config.retentionDays || 30,
      maxCacheSize: config.maxCacheSize || 5 * 1024 * 1024 * 1024, // 5GB
      compressionEnabled: config.compressionEnabled !== false,
      compressionLevel: config.compressionLevel || 6,
      cacheStrategy: config.cacheStrategy || CacheStrategy.CONTENT_HASH,
      checksumAlgorithm: config.checksumAlgorithm || 'sha256',
      workspaceRoot: config.workspaceRoot || process.cwd(),
      ...config
    };

    // Caches
    this.artifactCache = new Map();
    this.checksumCache = new Map();
    this.metadataCache = new Map();

    // Index storage
    this.artifactIndex = new Map();
    this.buildArtifactMap = new Map();

    // Statistics
    this.stats = {
      totalArtifacts: 0,
      totalSize: 0,
      cacheHits: 0,
      cacheMisses: 0,
      compressionSavings: 0,
      cleanupRuns: 0,
      artifactsCollected: 0,
      artifactsExpired: 0
    };

    this.isInitialized = false;
  }

  /**
   * Initialize the artifact manager
   */
  async initialize() {
    // Create necessary directories
    await this._ensureDirectories();

    // Load existing artifact index
    await this._loadArtifactIndex();

    // Start cleanup scheduler if retention is configured
    if (this.config.retentionDays > 0) {
      this._scheduleCleanup();
    }

    this.isInitialized = true;
    this.emit('initialized', { timestamp: new Date() });

    return this;
  }

  /**
   * Ensure required directories exist
   * @private
   */
  async _ensureDirectories() {
    const dirs = [
      this.config.cacheDir,
      this.config.artifactDir,
      path.join(this.config.cacheDir, 'builds'),
      path.join(this.config.cacheDir, 'metadata'),
      path.join(this.config.artifactDir, 'builds'),
      path.join(this.config.artifactDir, 'reports')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Load artifact index from disk
   * @private
   */
  async _loadArtifactIndex() {
    const indexPath = path.join(this.config.cacheDir, 'artifact-index.json');

    try {
      const data = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(data);

      for (const [key, value] of Object.entries(index)) {
        this.artifactIndex.set(key, value);
      }

      this.stats.totalArtifacts = this.artifactIndex.size;
    } catch (error) {
      // Index doesn't exist yet, that's fine
    }
  }

  /**
   * Save artifact index to disk
   * @private
   */
  async _saveArtifactIndex() {
    const indexPath = path.join(this.config.cacheDir, 'artifact-index.json');
    const index = Object.fromEntries(this.artifactIndex);
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Check cache for existing build artifacts
   * @param {string} targetId - Build target ID
   * @param {Object} target - Build target configuration
   * @returns {Promise<Object|null>} Cached artifacts or null
   */
  async checkCache(targetId, target) {
    if (!this.config.cacheEnabled) {
      return null;
    }

    const cacheKey = await this._generateCacheKey(targetId, target);
    const cached = this.artifactCache.get(cacheKey);

    if (cached) {
      // Validate cached artifacts still exist
      const valid = await this._validateCachedArtifacts(cached);
      if (valid) {
        this.stats.cacheHits++;
        this.emit('cacheHit', { targetId, cacheKey, timestamp: new Date() });
        return cached;
      }
    }

    // Check disk cache
    const diskCached = await this._checkDiskCache(cacheKey);
    if (diskCached) {
      this.artifactCache.set(cacheKey, diskCached);
      this.stats.cacheHits++;
      this.emit('cacheHit', { targetId, cacheKey, fromDisk: true, timestamp: new Date() });
      return diskCached;
    }

    this.stats.cacheMisses++;
    return null;
  }

  /**
   * Update cache with new artifacts
   * @param {string} targetId - Build target ID
   * @param {Object} target - Build target configuration
   * @param {Array<string>} artifacts - Artifact paths
   */
  async updateCache(targetId, target, artifacts) {
    if (!this.config.cacheEnabled || !artifacts?.length) {
      return;
    }

    const cacheKey = await this._generateCacheKey(targetId, target);

    const cacheEntry = {
      targetId,
      cacheKey,
      artifacts,
      checksums: await this._calculateChecksums(artifacts),
      timestamp: Date.now(),
      size: await this._calculateTotalSize(artifacts),
      metadata: {
        language: target.language,
        sourceDir: target.sourceDir,
        outputDir: target.outputDir
      }
    };

    // Store in memory cache
    this.artifactCache.set(cacheKey, cacheEntry);

    // Store on disk
    await this._writeDiskCache(cacheKey, cacheEntry);

    // Update index
    this.artifactIndex.set(cacheKey, {
      targetId,
      timestamp: cacheEntry.timestamp,
      size: cacheEntry.size,
      artifactCount: artifacts.length
    });

    await this._saveArtifactIndex();

    this.emit('cacheUpdated', { targetId, cacheKey, artifactCount: artifacts.length, timestamp: new Date() });
  }

  /**
   * Collect artifacts from build output
   * @param {Object} target - Build target
   * @returns {Promise<Array<string>>} Collected artifact paths
   */
  async collectArtifacts(target) {
    const artifacts = [];
    const outputDir = target.outputDir;

    try {
      const files = await this._listFilesRecursive(outputDir);

      for (const file of files) {
        const artifactInfo = await this._analyzeArtifact(file);
        artifacts.push(file);

        // Store artifact metadata
        this.metadataCache.set(file, {
          ...artifactInfo,
          targetId: target.id,
          collectedAt: Date.now()
        });
      }

      this.stats.artifactsCollected += artifacts.length;
      this.emit('artifactsCollected', { targetId: target.id, count: artifacts.length, timestamp: new Date() });

    } catch (error) {
      // Output directory might not exist if build failed
      console.warn(`Failed to collect artifacts from ${outputDir}: ${error.message}`);
    }

    return artifacts;
  }

  /**
   * Process build artifacts after successful build
   * @param {Map<string, Object>} results - Build results map
   */
  async processBuildArtifacts(results) {
    const processedArtifacts = [];

    for (const [targetId, result] of results) {
      if (result.success && result.artifacts?.length) {
        for (const artifactPath of result.artifacts) {
          try {
            const processed = await this._processArtifact(targetId, artifactPath);
            processedArtifacts.push(processed);
          } catch (error) {
            console.warn(`Failed to process artifact ${artifactPath}: ${error.message}`);
          }
        }
      }
    }

    // Update build artifact map
    const buildId = Date.now().toString();
    this.buildArtifactMap.set(buildId, {
      timestamp: Date.now(),
      artifacts: processedArtifacts,
      targetCount: results.size
    });

    this.emit('artifactsProcessed', {
      buildId,
      count: processedArtifacts.length,
      timestamp: new Date()
    });

    return processedArtifacts;
  }

  /**
   * Process individual artifact
   * @private
   */
  async _processArtifact(targetId, artifactPath) {
    const stat = await fs.stat(artifactPath);
    const checksum = await this._calculateChecksum(artifactPath);

    const artifactInfo = {
      path: artifactPath,
      targetId,
      size: stat.size,
      checksum,
      type: this._determineArtifactType(artifactPath),
      processedAt: Date.now()
    };

    // Compress if enabled and artifact is large enough
    if (this.config.compressionEnabled && stat.size > 1024) {
      artifactInfo.compressed = true;
      artifactInfo.originalSize = stat.size;
    }

    return artifactInfo;
  }

  /**
   * Analyze artifact file
   * @private
   */
  async _analyzeArtifact(filePath) {
    const stat = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return {
      path: filePath,
      name: path.basename(filePath),
      extension: ext,
      size: stat.size,
      type: this._determineArtifactType(filePath),
      mtime: stat.mtime.getTime()
    };
  }

  /**
   * Determine artifact type from file
   * @private
   */
  _determineArtifactType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const name = path.basename(filePath).toLowerCase();

    // By extension
    const extensionTypes = {
      '.js': ArtifactType.BUNDLE,
      '.mjs': ArtifactType.BUNDLE,
      '.cjs': ArtifactType.BUNDLE,
      '.css': ArtifactType.BUNDLE,
      '.map': ArtifactType.SOURCEMAP,
      '.d.ts': ArtifactType.LIBRARY,
      '.so': ArtifactType.LIBRARY,
      '.dll': ArtifactType.LIBRARY,
      '.dylib': ArtifactType.LIBRARY,
      '.a': ArtifactType.LIBRARY,
      '.exe': ArtifactType.EXECUTABLE,
      '.jar': ArtifactType.LIBRARY,
      '.war': ArtifactType.BUNDLE,
      '.whl': ArtifactType.LIBRARY,
      '.html': ArtifactType.DOCUMENTATION,
      '.md': ArtifactType.DOCUMENTATION
    };

    if (extensionTypes[ext]) {
      return extensionTypes[ext];
    }

    // By name pattern
    if (name.includes('test') || name.includes('spec')) {
      return ArtifactType.TEST_RESULTS;
    }
    if (name.includes('coverage') || name.includes('lcov')) {
      return ArtifactType.COVERAGE;
    }

    return ArtifactType.BINARY;
  }

  /**
   * Generate cache key for target
   * @private
   */
  async _generateCacheKey(targetId, target) {
    const keyData = {
      targetId,
      language: target.language,
      buildScript: target.buildScript
    };

    // Add source hash based on strategy
    switch (this.config.cacheStrategy) {
      case CacheStrategy.CONTENT_HASH:
        keyData.sourceHash = await this._calculateSourceHash(target.sourceDir);
        break;

      case CacheStrategy.TIMESTAMP:
        keyData.sourceMtime = await this._getLatestMtime(target.sourceDir);
        break;

      case CacheStrategy.AGGRESSIVE:
        // Only use target ID and build script
        break;
    }

    const hash = crypto.createHash(this.config.checksumAlgorithm);
    hash.update(JSON.stringify(keyData));
    return hash.digest('hex').substring(0, 32);
  }

  /**
   * Calculate source directory hash
   * @private
   */
  async _calculateSourceHash(sourceDir) {
    const hash = crypto.createHash('md5');
    const files = await this._listFilesRecursive(sourceDir, 5);

    // Sort files for consistent hashing
    files.sort();

    for (const file of files.slice(0, 200)) { // Limit for performance
      try {
        const stat = await fs.stat(file);
        if (stat.isFile()) {
          hash.update(`${file}:${stat.size}:${stat.mtime.getTime()}`);
        }
      } catch {
        // Skip inaccessible files
      }
    }

    return hash.digest('hex').substring(0, 16);
  }

  /**
   * Get latest modification time in directory
   * @private
   */
  async _getLatestMtime(dir) {
    let latestMtime = 0;
    const files = await this._listFilesRecursive(dir, 3);

    for (const file of files.slice(0, 100)) {
      try {
        const stat = await fs.stat(file);
        if (stat.mtime.getTime() > latestMtime) {
          latestMtime = stat.mtime.getTime();
        }
      } catch {
        // Skip
      }
    }

    return latestMtime;
  }

  /**
   * Calculate checksum for file
   * @private
   */
  async _calculateChecksum(filePath) {
    // Check cache first
    if (this.checksumCache.has(filePath)) {
      return this.checksumCache.get(filePath);
    }

    const hash = crypto.createHash(this.config.checksumAlgorithm);
    const content = await fs.readFile(filePath);
    hash.update(content);
    const checksum = hash.digest('hex');

    this.checksumCache.set(filePath, checksum);
    return checksum;
  }

  /**
   * Calculate checksums for multiple files
   * @private
   */
  async _calculateChecksums(filePaths) {
    const checksums = {};
    for (const filePath of filePaths) {
      try {
        checksums[filePath] = await this._calculateChecksum(filePath);
      } catch {
        checksums[filePath] = null;
      }
    }
    return checksums;
  }

  /**
   * Calculate total size of files
   * @private
   */
  async _calculateTotalSize(filePaths) {
    let total = 0;
    for (const filePath of filePaths) {
      try {
        const stat = await fs.stat(filePath);
        total += stat.size;
      } catch {
        // Skip
      }
    }
    return total;
  }

  /**
   * Validate cached artifacts exist
   * @private
   */
  async _validateCachedArtifacts(cached) {
    if (!cached?.artifacts?.length) {
      return false;
    }

    for (const artifactPath of cached.artifacts) {
      try {
        await fs.access(artifactPath);
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Check disk cache
   * @private
   */
  async _checkDiskCache(cacheKey) {
    const cachePath = path.join(this.config.cacheDir, 'builds', `${cacheKey}.json`);

    try {
      const data = await fs.readFile(cachePath, 'utf8');
      const cached = JSON.parse(data);

      // Decompress if needed
      if (cached.compressed) {
        cached.artifacts = JSON.parse(
          (await gunzip(Buffer.from(cached.artifacts, 'base64'))).toString()
        );
      }

      return cached;
    } catch {
      return null;
    }
  }

  /**
   * Write to disk cache
   * @private
   */
  async _writeDiskCache(cacheKey, cacheEntry) {
    const cachePath = path.join(this.config.cacheDir, 'builds', `${cacheKey}.json`);

    let dataToWrite = { ...cacheEntry };

    // Compress artifact list if enabled
    if (this.config.compressionEnabled) {
      const compressed = await gzip(JSON.stringify(cacheEntry.artifacts));
      dataToWrite.artifacts = compressed.toString('base64');
      dataToWrite.compressed = true;
    }

    await fs.writeFile(cachePath, JSON.stringify(dataToWrite, null, 2));
  }

  /**
   * List files recursively
   * @private
   */
  async _listFilesRecursive(dir, maxDepth = 10, currentDepth = 0) {
    if (currentDepth >= maxDepth) return [];

    const results = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip hidden directories and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this._listFilesRecursive(fullPath, maxDepth, currentDepth + 1);
          results.push(...subFiles);
        } else if (entry.isFile()) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore permission errors
    }

    return results;
  }

  /**
   * Schedule periodic cleanup
   * @private
   */
  _scheduleCleanup() {
    // Run cleanup every 6 hours
    this.cleanupTimer = setInterval(() => {
      this.runCleanup().catch(err => {
        console.error('Artifact cleanup failed:', err.message);
      });
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Run cleanup to remove expired artifacts
   */
  async runCleanup() {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    let expiredCount = 0;
    let freedSize = 0;

    for (const [cacheKey, info] of this.artifactIndex) {
      if (info.timestamp < cutoffTime) {
        // Remove from disk
        const cachePath = path.join(this.config.cacheDir, 'builds', `${cacheKey}.json`);
        try {
          await fs.unlink(cachePath);
          freedSize += info.size || 0;
          expiredCount++;
        } catch {
          // File already removed
        }

        // Remove from index and cache
        this.artifactIndex.delete(cacheKey);
        this.artifactCache.delete(cacheKey);
      }
    }

    await this._saveArtifactIndex();

    this.stats.cleanupRuns++;
    this.stats.artifactsExpired += expiredCount;

    this.emit('cleanupCompleted', {
      expiredCount,
      freedSize,
      timestamp: new Date()
    });

    return { expiredCount, freedSize };
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    this.artifactCache.clear();
    this.checksumCache.clear();
    this.metadataCache.clear();
    this.artifactIndex.clear();

    // Clear disk cache
    try {
      const cacheDir = path.join(this.config.cacheDir, 'builds');
      const files = await fs.readdir(cacheDir);
      for (const file of files) {
        await fs.unlink(path.join(cacheDir, file));
      }
    } catch {
      // Directory might not exist
    }

    await this._saveArtifactIndex();
    this.emit('cacheCleared', { timestamp: new Date() });
  }

  /**
   * Get artifact by path
   * @param {string} artifactPath - Artifact path
   * @returns {Object|null} Artifact metadata
   */
  getArtifactInfo(artifactPath) {
    return this.metadataCache.get(artifactPath) || null;
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const cacheTotal = this.stats.cacheHits + this.stats.cacheMisses;
    return {
      ...this.stats,
      cacheHitRate: cacheTotal > 0
        ? ((this.stats.cacheHits / cacheTotal) * 100).toFixed(2) + '%'
        : 'N/A',
      indexSize: this.artifactIndex.size,
      memoryCacheSize: this.artifactCache.size
    };
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    // Check cache directory is writable
    let cacheWritable = false;
    try {
      const testFile = path.join(this.config.cacheDir, '.health-check');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      cacheWritable = true;
    } catch {
      cacheWritable = false;
    }

    return {
      status: cacheWritable ? 'healthy' : 'warning',
      cacheEnabled: this.config.cacheEnabled,
      cacheWritable,
      indexedArtifacts: this.artifactIndex.size,
      cacheHitRate: this.getStats().cacheHitRate,
      cleanupRuns: this.stats.cleanupRuns
    };
  }

  /**
   * Shutdown
   */
  async shutdown() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    await this._saveArtifactIndex();

    this.artifactCache.clear();
    this.checksumCache.clear();
    this.metadataCache.clear();
    this.isInitialized = false;

    this.emit('shutdown', { timestamp: new Date() });
  }
}

module.exports = ArtifactManager;
module.exports.ArtifactType = ArtifactType;
module.exports.CacheStrategy = CacheStrategy;
