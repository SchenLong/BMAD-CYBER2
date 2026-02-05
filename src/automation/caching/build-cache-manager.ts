/**
 * Build Cache Manager
 * Epic 5.7 - Build Performance Optimization
 *
 * Content-addressable build caching system with intelligent invalidation,
 * multi-tier storage, and distributed cache support.
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface CacheEntry {
  key: string;
  contentHash: string;
  data: Buffer | null;
  metadata: CacheMetadata;
  size: number;
  compressed: boolean;
  tier: CacheTier;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
  ttl: number;
  dependencies: string[];
}

export interface CacheMetadata {
  sourceFiles: string[];
  inputHash: string;
  outputFiles: string[];
  buildConfig: Record<string, unknown>;
  environment: Record<string, string>;
  version: string;
  tags: string[];
}

export type CacheTier = 'memory' | 'disk' | 'remote';

export interface CacheConfig {
  memoryMaxSize: number;
  diskMaxSize: number;
  diskCachePath: string;
  enableCompression: boolean;
  compressionLevel: number;
  defaultTtl: number;
  enableRemoteCache: boolean;
  remoteEndpoint?: string;
  remoteApiKey?: string;
  cleanupInterval: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
  enableHashValidation: boolean;
  parallelWrites: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  memorySize: number;
  diskSize: number;
  entryCount: number;
  evictions: number;
  compressionRatio: number;
  averageAccessTime: number;
}

export interface InvalidationRule {
  id: string;
  pattern: string | RegExp;
  type: 'glob' | 'regex' | 'prefix' | 'tag';
  action: 'delete' | 'expire' | 'refresh';
  cascadeToDependent: boolean;
}

export interface CacheLookupResult {
  found: boolean;
  entry?: CacheEntry;
  tier?: CacheTier;
  accessTime: number;
  fromRemote: boolean;
}

// ============================================================================
// Build Cache Manager Implementation
// ============================================================================

export class BuildCacheManager extends EventEmitter {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private diskIndex: Map<string, CacheEntry> = new Map();
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;
  // Reserved for future parallel write batching
  // private writeQueue: Promise<void>[] = [];
  private invalidationRules: Map<string, InvalidationRule> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();

  constructor(config: Partial<CacheConfig> = {}) {
    super();
    this.config = {
      memoryMaxSize: 512 * 1024 * 1024, // 512MB
      diskMaxSize: 10 * 1024 * 1024 * 1024, // 10GB
      diskCachePath: '.build-cache',
      enableCompression: true,
      compressionLevel: 6,
      defaultTtl: 7 * 24 * 60 * 60 * 1000, // 7 days
      enableRemoteCache: false,
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      evictionPolicy: 'lru',
      enableHashValidation: true,
      parallelWrites: 4,
      ...config
    };
    this.stats = this.createEmptyStats();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.ensureCacheDirectory();
    await this.loadDiskIndex();
    this.startCleanupTimer();
    this.emit('initialized');
  }

  /**
   * Store a build artifact in cache
   */
  public async set(
    key: string,
    data: Buffer,
    metadata: Partial<CacheMetadata> = {},
    options: { ttl?: number; tags?: string[]; dependencies?: string[] } = {}
  ): Promise<void> {
    const contentHash = this.computeHash(data);
    const fullMetadata: CacheMetadata = {
      sourceFiles: [],
      inputHash: '',
      outputFiles: [],
      buildConfig: {},
      environment: {},
      version: '1.0.0',
      tags: options.tags || [],
      ...metadata
    };

    let processedData = data;
    let compressed = false;
    if (this.config.enableCompression && data.length > 1024) {
      processedData = await this.compress(data);
      compressed = true;
    }

    const entry: CacheEntry = {
      key,
      contentHash,
      data: null,
      metadata: fullMetadata,
      size: processedData.length,
      compressed,
      tier: 'memory',
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 0,
      ttl: options.ttl || this.config.defaultTtl,
      dependencies: options.dependencies || []
    };

    // Register dependencies
    for (const dep of entry.dependencies) {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep)!.add(key);
    }

    // Store based on size and available space
    if (processedData.length <= this.config.memoryMaxSize * 0.1) {
      entry.data = processedData;
      entry.tier = 'memory';
      await this.storeInMemory(key, entry);
    } else {
      entry.tier = 'disk';
      await this.storeToDisk(key, entry, processedData);
    }

    this.emit('set', { key, size: processedData.length, tier: entry.tier });
  }

  /**
   * Retrieve a build artifact from cache
   */
  public async get(key: string): Promise<Buffer | null> {
    const startTime = Date.now();
    const result = await this.lookup(key);

    if (!result.found || !result.entry) {
      this.stats.misses++;
      this.updateHitRate();
      this.emit('miss', { key, accessTime: Date.now() - startTime });
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();

    let data: Buffer | null = null;

    if (result.entry.tier === 'memory' && result.entry.data) {
      data = result.entry.data;
    } else if (result.entry.tier === 'disk') {
      data = await this.readFromDisk(key);
    } else if (this.config.enableRemoteCache && result.tier === 'remote') {
      data = await this.fetchFromRemote(key);
    }

    if (!data) {
      this.stats.misses++;
      return null;
    }

    // Decompress if needed
    if (result.entry.compressed) {
      data = await this.decompress(data);
    }

    // Validate hash
    if (this.config.enableHashValidation) {
      const hash = this.computeHash(data);
      if (hash !== result.entry.contentHash) {
        this.emit('corruption', { key, expected: result.entry.contentHash, actual: hash });
        await this.delete(key);
        return null;
      }
    }

    // Update access stats
    result.entry.accessedAt = Date.now();
    result.entry.accessCount++;

    // Promote to faster tier if frequently accessed
    if (result.entry.tier === 'disk' && result.entry.accessCount > 5) {
      await this.promoteToMemory(key, result.entry, data);
    }

    const accessTime = Date.now() - startTime;
    this.updateAverageAccessTime(accessTime);
    this.emit('hit', { key, tier: result.tier, accessTime });

    return data;
  }

  /**
   * Check if key exists without loading data
   */
  public async has(key: string): Promise<boolean> {
    const result = await this.lookup(key);
    return result.found;
  }

  /**
   * Delete a cache entry
   */
  public async delete(key: string): Promise<boolean> {
    let deleted = false;

    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      this.stats.memorySize -= entry.size;
      this.memoryCache.delete(key);
      deleted = true;
    }

    if (this.diskIndex.has(key)) {
      const filePath = this.getCacheFilePath(key);
      try {
        await fs.promises.unlink(filePath);
        const entry = this.diskIndex.get(key)!;
        this.stats.diskSize -= entry.size;
        this.diskIndex.delete(key);
        deleted = true;
      } catch (error) {
        // File might not exist
      }
    }

    // Cascade to dependent entries
    const dependents = this.dependencyGraph.get(key);
    if (dependents) {
      for (const dependent of dependents) {
        await this.delete(dependent);
      }
      this.dependencyGraph.delete(key);
    }

    if (deleted) {
      this.stats.entryCount--;
      this.emit('delete', { key });
    }

    return deleted;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  public async invalidate(pattern: string | RegExp, _options: { cascade?: boolean } = {}): Promise<number> {
    const keys = this.getMatchingKeys(pattern);
    let invalidated = 0;

    for (const key of keys) {
      const deleted = await this.delete(key);
      if (deleted) invalidated++;
    }

    this.emit('invalidate', { pattern: pattern.toString(), count: invalidated });
    return invalidated;
  }

  /**
   * Invalidate by content hash (for when source files change)
   */
  public async invalidateByHash(hash: string): Promise<number> {
    const keysToInvalidate: string[] = [];

    for (const [key, entry] of this.memoryCache) {
      if (entry.metadata.inputHash === hash) {
        keysToInvalidate.push(key);
      }
    }

    for (const [key, entry] of this.diskIndex) {
      if (entry.metadata.inputHash === hash && !keysToInvalidate.includes(key)) {
        keysToInvalidate.push(key);
      }
    }

    let invalidated = 0;
    for (const key of keysToInvalidate) {
      if (await this.delete(key)) invalidated++;
    }

    return invalidated;
  }

  /**
   * Add an invalidation rule
   */
  public addInvalidationRule(rule: InvalidationRule): void {
    this.invalidationRules.set(rule.id, rule);
    this.emit('rule:added', { ruleId: rule.id });
  }

  /**
   * Remove an invalidation rule
   */
  public removeInvalidationRule(ruleId: string): boolean {
    return this.invalidationRules.delete(ruleId);
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    this.diskIndex.clear();
    this.dependencyGraph.clear();

    try {
      const files = await fs.promises.readdir(this.config.diskCachePath);
      await Promise.all(
        files.map(f => fs.promises.unlink(path.join(this.config.diskCachePath, f)))
      );
    } catch (error) {
      // Directory might not exist
    }

    this.stats = this.createEmptyStats();
    this.emit('clear');
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Warm the cache with pre-computed entries
   */
  public async warmCache(entries: Array<{ key: string; data: Buffer; metadata?: Partial<CacheMetadata> }>): Promise<void> {
    const batchSize = this.config.parallelWrites;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await Promise.all(batch.map(e => this.set(e.key, e.data, e.metadata)));
    }
    this.emit('warm', { count: entries.length });
  }

  /**
   * Export cache manifest
   */
  public exportManifest(): Record<string, CacheMetadata> {
    const manifest: Record<string, CacheMetadata> = {};
    for (const [key, entry] of this.memoryCache) {
      manifest[key] = entry.metadata;
    }
    for (const [key, entry] of this.diskIndex) {
      if (!manifest[key]) {
        manifest[key] = entry.metadata;
      }
    }
    return manifest;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async lookup(key: string): Promise<CacheLookupResult> {
    const startTime = Date.now();

    // Check memory first
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      if (!this.isExpired(entry)) {
        return { found: true, entry, tier: 'memory', accessTime: Date.now() - startTime, fromRemote: false };
      }
      await this.delete(key);
    }

    // Check disk
    if (this.diskIndex.has(key)) {
      const entry = this.diskIndex.get(key)!;
      if (!this.isExpired(entry)) {
        return { found: true, entry, tier: 'disk', accessTime: Date.now() - startTime, fromRemote: false };
      }
      await this.delete(key);
    }

    // Check remote if enabled
    if (this.config.enableRemoteCache) {
      const remoteEntry = await this.checkRemoteCache(key);
      if (remoteEntry) {
        return { found: true, entry: remoteEntry, tier: 'remote', accessTime: Date.now() - startTime, fromRemote: true };
      }
    }

    return { found: false, accessTime: Date.now() - startTime, fromRemote: false };
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.createdAt + entry.ttl;
  }

  private async storeInMemory(key: string, entry: CacheEntry): Promise<void> {
    // Evict if necessary
    while (this.stats.memorySize + entry.size > this.config.memoryMaxSize) {
      await this.evictFromMemory();
    }

    this.memoryCache.set(key, entry);
    this.stats.memorySize += entry.size;
    this.stats.entryCount++;
  }

  private async storeToDisk(key: string, entry: CacheEntry, data: Buffer): Promise<void> {
    // Evict if necessary
    while (this.stats.diskSize + entry.size > this.config.diskMaxSize) {
      await this.evictFromDisk();
    }

    const filePath = this.getCacheFilePath(key);
    const metaPath = `${filePath}.meta`;

    await fs.promises.writeFile(filePath, data);
    await fs.promises.writeFile(metaPath, JSON.stringify(entry));

    this.diskIndex.set(key, entry);
    this.stats.diskSize += entry.size;
    this.stats.entryCount++;
  }

  private async readFromDisk(key: string): Promise<Buffer | null> {
    const filePath = this.getCacheFilePath(key);
    try {
      return await fs.promises.readFile(filePath);
    } catch {
      return null;
    }
  }

  private async promoteToMemory(key: string, entry: CacheEntry, data: Buffer): Promise<void> {
    if (data.length > this.config.memoryMaxSize * 0.1) return;

    const memoryEntry = { ...entry, data, tier: 'memory' as CacheTier };
    await this.storeInMemory(key, memoryEntry);
  }

  private async evictFromMemory(): Promise<void> {
    const candidate = this.selectEvictionCandidate(this.memoryCache);
    if (candidate) {
      const entry = this.memoryCache.get(candidate)!;
      this.stats.memorySize -= entry.size;
      this.memoryCache.delete(candidate);
      this.stats.evictions++;
      this.emit('evict', { key: candidate, tier: 'memory' });
    }
  }

  private async evictFromDisk(): Promise<void> {
    const candidate = this.selectEvictionCandidate(this.diskIndex);
    if (candidate) {
      await this.delete(candidate);
      this.stats.evictions++;
      this.emit('evict', { key: candidate, tier: 'disk' });
    }
  }

  private selectEvictionCandidate(cache: Map<string, CacheEntry>): string | null {
    if (cache.size === 0) return null;

    let candidate: string | null = null;
    let candidateScore = Infinity;

    for (const [key, entry] of cache) {
      let score: number;
      switch (this.config.evictionPolicy) {
        case 'lru':
          score = entry.accessedAt;
          break;
        case 'lfu':
          score = entry.accessCount;
          break;
        case 'fifo':
          score = entry.createdAt;
          break;
        default:
          score = entry.accessedAt;
      }
      if (score < candidateScore) {
        candidateScore = score;
        candidate = key;
      }
    }

    return candidate;
  }

  private getMatchingKeys(pattern: string | RegExp): string[] {
    const keys: string[] = [];
    const regex = typeof pattern === 'string' ? new RegExp(pattern.replace(/\*/g, '.*')) : pattern;

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) keys.push(key);
    }
    for (const key of this.diskIndex.keys()) {
      if (regex.test(key) && !keys.includes(key)) keys.push(key);
    }

    return keys;
  }

  private computeHash(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async compress(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      zlib.gzip(data, { level: this.config.compressionLevel }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  private async decompress(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      zlib.gunzip(data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  private getCacheFilePath(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.config.diskCachePath, `${hash.slice(0, 2)}`, `${hash}`);
  }

  private async ensureCacheDirectory(): Promise<void> {
    await fs.promises.mkdir(this.config.diskCachePath, { recursive: true });
    for (let i = 0; i < 256; i++) {
      const subdir = i.toString(16).padStart(2, '0');
      await fs.promises.mkdir(path.join(this.config.diskCachePath, subdir), { recursive: true });
    }
  }

  private async loadDiskIndex(): Promise<void> {
    try {
      const subdirs = await fs.promises.readdir(this.config.diskCachePath);
      for (const subdir of subdirs) {
        const subdirPath = path.join(this.config.diskCachePath, subdir);
        const stat = await fs.promises.stat(subdirPath);
        if (!stat.isDirectory()) continue;

        const files = await fs.promises.readdir(subdirPath);
        for (const file of files) {
          if (file.endsWith('.meta')) {
            const metaPath = path.join(subdirPath, file);
            try {
              const content = await fs.promises.readFile(metaPath, 'utf-8');
              const entry = JSON.parse(content) as CacheEntry;
              this.diskIndex.set(entry.key, entry);
              this.stats.diskSize += entry.size;
              this.stats.entryCount++;
            } catch {
              // Skip invalid entries
            }
          }
        }
      }
    } catch {
      // Cache directory might not exist yet
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup();
    }, this.config.cleanupInterval);
  }

  private async cleanup(): Promise<void> {
    let cleaned = 0;

    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry)) {
        await this.delete(key);
        cleaned++;
      }
    }

    for (const [key, entry] of this.diskIndex) {
      if (this.isExpired(entry)) {
        await this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.emit('cleanup', { cleaned });
    }
  }

  private async checkRemoteCache(_key: string): Promise<CacheEntry | null> {
    if (!this.config.remoteEndpoint) return null;
    // Placeholder for remote cache implementation
    return null;
  }

  private async fetchFromRemote(_key: string): Promise<Buffer | null> {
    if (!this.config.remoteEndpoint) return null;
    // Placeholder for remote fetch implementation
    return null;
  }

  private createEmptyStats(): CacheStats {
    return { hits: 0, misses: 0, hitRate: 0, memorySize: 0, diskSize: 0, entryCount: 0, evictions: 0, compressionRatio: 1, averageAccessTime: 0 };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private updateAverageAccessTime(time: number): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.averageAccessTime = (this.stats.averageAccessTime * (total - 1) + time) / total;
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.emit('destroy');
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

let defaultCacheManager: BuildCacheManager | null = null;

export function getDefaultCacheManager(config?: Partial<CacheConfig>): BuildCacheManager {
  if (!defaultCacheManager) {
    defaultCacheManager = new BuildCacheManager(config);
  }
  return defaultCacheManager;
}

export function createCacheManager(config?: Partial<CacheConfig>): BuildCacheManager {
  return new BuildCacheManager(config);
}

export default BuildCacheManager;
