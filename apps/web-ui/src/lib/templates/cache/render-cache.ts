/**
 * Render Cache
 * Story 7.5: Template Rendering Engine - Task 7
 *
 * In-memory cache for rendered template outputs with TTL
 * and size-based eviction policies.
 */

import type { CacheEntry, CacheConfig, OutputFormat } from '@/types/template-render'

/**
 * Simple hash function for cache keys (browser-compatible)
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 60 * 60 * 1000, // 1 hour in milliseconds
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 1000,
}

/**
 * Render Cache class
 */
export class RenderCache {
  private cache: Map<string, CacheEntry> = new Map()
  private config: CacheConfig
  private currentSize = 0
  private cleanupInterval: NodeJS.Timeout | null = null
  private hits = 0
  private misses = 0

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }

    // Start periodic cleanup
    if (this.config.enabled) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, 60 * 1000) // Every minute
    }
  }

  /**
   * Generate cache key from template ID, data hash, and format
   */
  generateKey(templateId: string, data: unknown, format: OutputFormat): string {
    const dataHash = this.hashData(data)
    return `${templateId}:${dataHash}:${format}`
  }

  /**
   * Hash data for cache key (browser-compatible)
   */
  private hashData(data: unknown): string {
    const str = JSON.stringify(data, Object.keys(data as Record<string, unknown>).sort())
    return simpleHash(str)
  }

  /**
   * Get cached entry
   */
  get(templateId: string, data: unknown, format: OutputFormat): CacheEntry | null {
    if (!this.config.enabled) {
      return null
    }

    const key = this.generateKey(templateId, data, format)
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return null
    }

    // Check if expired
    if (entry.expiresAt < new Date()) {
      this.delete(key)
      this.misses++
      return null
    }

    this.hits++
    return entry
  }

  /**
   * Set cache entry
   */
  set(
    templateId: string,
    data: unknown,
    format: OutputFormat,
    rendered: string
  ): CacheEntry {
    if (!this.config.enabled) {
      throw new Error('Cache is disabled')
    }

    const key = this.generateKey(templateId, data, format)
    // Use TextEncoder for size calculation (works in both browser and Node.js)
    const size = new TextEncoder().encode(rendered).length
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.config.ttl)

    // Check if we need to evict entries
    this.ensureCapacity(size)

    const entry: CacheEntry = {
      key,
      templateId,
      dataHash: this.hashData(data),
      format,
      rendered,
      generatedAt: now,
      expiresAt,
      size,
    }

    // Remove old entry if exists
    const oldEntry = this.cache.get(key)
    if (oldEntry) {
      this.currentSize -= oldEntry.size || 0
    }

    // Add new entry
    this.cache.set(key, entry)
    this.currentSize += size

    return entry
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size || 0
      return this.cache.delete(key)
    }
    return false
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.currentSize = 0
    this.hits = 0
    this.misses = 0
  }

  /**
   * Ensure cache has capacity for new entry
   */
  private ensureCapacity(requiredSize: number): void {
    // Check entry count
    while (this.cache.size >= this.config.maxEntries) {
      this.evictLRU()
    }

    // Check size
    while (this.currentSize + requiredSize > this.config.maxSize) {
      if (this.cache.size === 0) {
        break // Can't evict more
      }
      this.evictLRU()
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.generatedAt.getTime() < oldestTime) {
        oldestTime = entry.generatedAt.getTime()
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = new Date()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.delete(key)
    }
  }

  /**
   * Invalidate cache for a specific template
   */
  invalidateTemplate(templateId: string): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.templateId === templateId) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.delete(key)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number
    size: number
    sizeFormatted: string
    hitRate: number
    hits: number
    misses: number
    config: CacheConfig
  } {
    const total = this.hits + this.misses
    return {
      entries: this.cache.size,
      size: this.currentSize,
      sizeFormatted: `${(this.currentSize / 1024).toFixed(2)} KB`,
      hitRate: total > 0 ? this.hits / total : 0,
      hits: this.hits,
      misses: this.misses,
      config: this.config,
    }
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

/**
 * Global cache instance
 */
let globalCache: RenderCache | null = null

/**
 * Get or create global cache instance
 */
export function getRenderCache(config?: Partial<CacheConfig>): RenderCache {
  if (!globalCache) {
    globalCache = new RenderCache(config)
  }
  return globalCache
}

/**
 * Reset global cache instance
 */
export function resetRenderCache(): void {
  if (globalCache) {
    globalCache.destroy()
  }
  globalCache = null
}

/**
 * Memoization decorator for render functions
 */
export function memoizeRender<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  keyGenerator: (...args: Args) => string,
  ttl = 60 * 60 * 1000
): (...args: Args) => Return {
  const cache = new Map<string, { value: Return; expiresAt: Date }>()

  return (...args: Args): Return => {
    const key = keyGenerator(...args)
    const now = new Date()
    const cached = cache.get(key)

    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    const result = fn(...args)
    cache.set(key, {
      value: result,
      expiresAt: new Date(now.getTime() + ttl),
    })

    // Cleanup old entries
    if (cache.size > 1000) {
      for (const [k, v] of cache.entries()) {
        if (v.expiresAt < now) {
          cache.delete(k)
        }
      }
    }

    return result
  }
}
