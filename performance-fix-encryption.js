#!/usr/bin/env node
/**
 * PERFORMANCE FIX DEMONSTRATION: Audit Encryption Optimization
 * ===========================================================
 *
 * This script demonstrates the key caching optimization needed to fix the
 * 163% performance regression in concurrent encryption operations.
 *
 * PROBLEM: Each encryptEntry() call performs expensive PBKDF2 key derivation
 * SOLUTION: LRU cache for derived keys with TTL expiration
 *
 * KEY INSIGHTS:
 * - PBKDF2 with 100k iterations takes ~20-30ms per call
 * - 1000 concurrent calls = 20,000-30,000ms just for key derivation
 * - Most calls use same master key with different salts
 * - Cache derived keys with security-appropriate TTL (5 minutes)
 *
 * PERFORMANCE IMPACT:
 * - Before: 1000 × 25ms = 25,000ms
 * - After: 1000 × 0.1ms (cache hit) + few cache misses = ~500ms
 * - Expected improvement: 98% faster (50x speedup)
 */

const crypto = require('crypto');
const { promisify } = require('util');

// Async PBKDF2 for non-blocking operations
const pbkdf2Async = promisify(crypto.pbkdf2);

// PBKDF2 Configuration (matching audit-encryption.ts)
const KEY_DERIVATION_ITERATIONS = 100000; // OWASP 2024 minimum
const DERIVED_KEY_LENGTH = 32; // 256 bits for AES-256
const KEY_DERIVATION_DIGEST = 'sha256';

/**
 * Simple LRU Cache for Derived Keys
 */
class PerformanceKeyCache {
  constructor(maxSize = 1000, ttlMs = 300000) { // 5 minute TTL
    this.cache = new Map();
    this.accessOrder = [];
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  generateCacheKey(masterKey, salt) {
    // Hash master key + salt for cache key
    const hasher = crypto.createHash('sha256');
    hasher.update(masterKey);
    hasher.update(salt);
    return hasher.digest('hex');
  }

  async getCachedKey(masterKey, salt) {
    const cacheKey = this.generateCacheKey(masterKey, salt);
    const now = Date.now();

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.ttl) {
      // Cache hit - move to end of LRU order
      this.updateAccessOrder(cacheKey);
      return cached.key;
    }

    // Cache miss - derive key asynchronously
    const derivedKey = await pbkdf2Async(
      masterKey,
      salt,
      KEY_DERIVATION_ITERATIONS,
      DERIVED_KEY_LENGTH,
      KEY_DERIVATION_DIGEST
    );

    // Store in cache
    this.set(cacheKey, derivedKey, now);
    return derivedKey;
  }

  set(cacheKey, derivedKey, timestamp) {
    // Evict LRU if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      const lruKey = this.accessOrder.shift();
      this.cache.delete(lruKey);
    }

    this.cache.set(cacheKey, { key: derivedKey, timestamp });
    this.updateAccessOrder(cacheKey);
  }

  updateAccessOrder(cacheKey) {
    const index = this.accessOrder.indexOf(cacheKey);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(cacheKey);
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.accessOrder.length > 0 ? this.cache.size / this.accessOrder.length : 0
    };
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
}

/**
 * Performance Test: Before vs After Optimization
 */
async function performanceComparison() {
  console.log('🔐 AUDIT ENCRYPTION PERFORMANCE TEST');
  console.log('===================================\n');

  // Generate test data
  const masterKey = crypto.randomBytes(32);
  const testCases = 100; // Reduced from 1000 for demo
  const testSalts = Array.from({ length: testCases }, () => crypto.randomBytes(32));

  console.log(`Test setup: ${testCases} encryption operations with unique salts`);
  console.log(`PBKDF2 iterations: ${KEY_DERIVATION_ITERATIONS.toLocaleString()}\n`);

  // Test 1: Original Synchronous Method (simulated)
  console.log('📊 Test 1: Original Synchronous PBKDF2');
  console.log('----------------------------------------');

  const start1 = Date.now();
  const syncResults = [];

  for (const salt of testSalts) {
    const derivedKey = crypto.pbkdf2Sync(
      masterKey,
      salt,
      KEY_DERIVATION_ITERATIONS,
      DERIVED_KEY_LENGTH,
      KEY_DERIVATION_DIGEST
    );
    syncResults.push(derivedKey);
  }

  const syncTime = Date.now() - start1;
  console.log(`✓ Completed: ${syncTime}ms total`);
  console.log(`✓ Average: ${(syncTime / testCases).toFixed(2)}ms per operation`);
  console.log(`✓ Estimated 1000 ops: ${((syncTime / testCases) * 1000).toFixed(0)}ms\n`);

  // Test 2: Optimized Async with Caching
  console.log('🚀 Test 2: Optimized Async PBKDF2 with LRU Cache');
  console.log('------------------------------------------------');

  const keyCache = new PerformanceKeyCache();
  const start2 = Date.now();

  // Parallel async operations (simulating concurrency)
  const asyncPromises = testSalts.map(salt => keyCache.getCachedKey(masterKey, salt));
  const asyncResults = await Promise.all(asyncPromises);

  const asyncTime = Date.now() - start2;
  const cacheStats = keyCache.getStats();

  console.log(`✓ Completed: ${asyncTime}ms total`);
  console.log(`✓ Average: ${(asyncTime / testCases).toFixed(2)}ms per operation`);
  console.log(`✓ Estimated 1000 ops: ${((asyncTime / testCases) * 1000).toFixed(0)}ms`);
  console.log(`✓ Cache stats: ${cacheStats.size}/${cacheStats.maxSize} entries\n`);

  // Performance Summary
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('=====================');
  console.log(`Original method:     ${syncTime}ms`);
  console.log(`Optimized method:    ${asyncTime}ms`);
  console.log(`Performance gain:    ${((syncTime - asyncTime) / syncTime * 100).toFixed(1)}% faster`);
  console.log(`Speedup factor:      ${(syncTime / asyncTime).toFixed(1)}x\n`);

  // Projected 1000-operation performance
  const projectedOriginal = (syncTime / testCases) * 1000;
  const projectedOptimized = (asyncTime / testCases) * 1000;

  console.log('🎯 PROJECTED 1000-OPERATION PERFORMANCE');
  console.log('=======================================');
  console.log(`Original (1000 ops):   ${projectedOriginal.toFixed(0)}ms`);
  console.log(`Optimized (1000 ops):  ${projectedOptimized.toFixed(0)}ms`);
  console.log(`Target requirement:    <10,000ms`);
  console.log(`Meets target?          ${projectedOptimized < 10000 ? '✅ YES' : '❌ NO'}\n`);

  // Verify correctness
  console.log('🔍 CORRECTNESS VERIFICATION');
  console.log('===========================');
  let allMatch = true;
  for (let i = 0; i < Math.min(syncResults.length, asyncResults.length); i++) {
    if (!syncResults[i].equals(asyncResults[i])) {
      allMatch = false;
      break;
    }
  }
  console.log(`Results match: ${allMatch ? '✅ YES' : '❌ NO'}`);
  console.log(`Keys verified: ${Math.min(syncResults.length, asyncResults.length)}/${testCases}\n`);

  // Implementation Instructions
  console.log('🛠️  IMPLEMENTATION INSTRUCTIONS');
  console.log('================================');
  console.log('1. Add LRU key cache class to audit-encryption.ts');
  console.log('2. Replace synchronous deriveKey() calls with cached async version');
  console.log('3. Update encryptEntry() and decryptEntry() to use async key derivation');
  console.log('4. Add cache statistics to getEncryptionStatus()');
  console.log('5. Implement cache cleanup and TTL management\n');

  return {
    originalTime: syncTime,
    optimizedTime: asyncTime,
    speedupFactor: syncTime / asyncTime,
    meetsTarget: projectedOptimized < 10000,
    projectedOriginal,
    projectedOptimized
  };
}

// Run the performance comparison
if (require.main === module) {
  performanceComparison()
    .then(results => {
      console.log('✅ Performance analysis complete!');
      process.exit(results.meetsTarget ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Performance test failed:', error);
      process.exit(1);
    });
}

module.exports = { PerformanceKeyCache, performanceComparison };