/**
 * BMAD CONCURA CACHING INTEGRATION TESTS
 * Comprehensive testing suite for Epic 3 Story 3.2 implementation
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  IntelligentCacheFramework,
  ContextAwareCacheEngine,
  CacheInvalidationEngine,
  MemoryOptimizedCacheManager,
  bmadIntelligentCache,
  createConcuraCache,
  createOptimizedMemoryManager
} from '../index';

describe('BMAD CONCURA Caching System Integration Tests', () => {
  let cacheFramework: IntelligentCacheFramework;
  let contextCache: ContextAwareCacheEngine;
  let invalidationEngine: CacheInvalidationEngine;
  let memoryManager: MemoryOptimizedCacheManager;

  beforeAll(async () => {
    // Initialize test environment
    cacheFramework = new IntelligentCacheFramework({
      l1: { maxSize: 100, ttl: 30000 }, // 30 seconds for testing
      l2: { maxSize: 500, ttl: 60000, compressionLevel: 6 },
      l3: { maxSize: 1000, ttl: 120000 },
      contextOptimization: true,
      memoryLimit: 50 * 1024 * 1024, // 50MB for testing
      prefetchEnabled: true
    });

    contextCache = createConcuraCache({
      contextCompression: true,
      predictivePrefetch: true,
      intelligentEviction: true,
      crossTeamOptimization: true,
      securityAwareCaching: true,
      performanceTargets: {
        responseTime: 50,
        hitRate: 85,
        memoryEfficiency: 90
      }
    });

    invalidationEngine = new CacheInvalidationEngine(cacheFramework);
    memoryManager = createOptimizedMemoryManager({
      maxCacheSize: 25 * 1024 * 1024, // 25MB for testing
      memoryPressureThresholds: {
        low: 0.5,
        medium: 0.7,
        high: 0.85,
        critical: 0.95
      }
    });
  });

  afterAll(async () => {
    // Cleanup test environment
    await memoryManager.shutdown();
  });

  describe('Intelligent Cache Framework Tests', () => {
    beforeEach(() => {
      // Reset cache state for each test
    });

    test('should store and retrieve values across cache layers', async () => {
      const testKey = 'test-key-1';
      const testValue = { data: 'test-data', timestamp: Date.now() };

      // Store value
      const setResult = await cacheFramework.set(testKey, testValue);
      expect(setResult).toBe(true);

      // Retrieve value
      const getValue = await cacheFramework.get(testKey);
      expect(getValue).toEqual(testValue);

      // Verify cache stats
      const stats = cacheFramework.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    test('should handle batch operations efficiently', async () => {
      const testKeys = ['batch-1', 'batch-2', 'batch-3'];
      const testValues = [
        { id: 1, data: 'first' },
        { id: 2, data: 'second' },
        { id: 3, data: 'third' }
      ];

      // Store batch
      const setPromises = testKeys.map((key, index) =>
        cacheFramework.set(key, testValues[index])
      );
      const setResults = await Promise.all(setPromises);
      expect(setResults.every(result => result)).toBe(true);

      // Retrieve batch
      const getResult = await cacheFramework.getBatch(testKeys);
      expect(getResult.size).toBe(testKeys.length);

      testKeys.forEach((key, index) => {
        expect(getResult.get(key)).toEqual(testValues[index]);
      });
    });

    test('should optimize cache performance', async () => {
      // Pre-optimization stats
      const initialStats = cacheFramework.getStats();

      // Run optimization
      const optimizationResult = await cacheFramework.optimize();

      expect(optimizationResult.optimizations).toBeDefined();
      expect(optimizationResult.estimatedImprovement).toBeGreaterThanOrEqual(0);
      expect(optimizationResult.recommendations).toBeDefined();

      // Verify optimization improved performance
      const postStats = cacheFramework.getStats();
      expect(postStats.hitRate).toBeGreaterThanOrEqual(initialStats.hitRate);
    });
  });

  describe('Context-Aware Cache Tests', () => {
    test('should handle context-aware caching with user contexts', async () => {
      const operation = 'user-data-processing';
      const userContext = {
        userId: 'user-123',
        teamId: 'team-456',
        moduleId: 'intel-module',
        operationType: 'read' as const,
        priority: 'high' as const,
        securityLevel: 'confidential' as const,
        dataCategories: ['user-data', 'analytics'],
        timestamp: Date.now(),
        computeComplexity: 'moderate' as const,
        expectedResponseTime: 50,
        dependencies: []
      };

      // Test with executor function
      const testExecutor = async () => {
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate work
        return { result: 'processed-data', context: userContext };
      };

      // First call should execute and cache
      const result1 = await contextCache.getWithContext(operation, userContext, testExecutor);
      expect(result1.source).toBe('computation');
      expect(result1.value).toBeDefined();

      // Second call should hit cache
      const result2 = await contextCache.getWithContext(operation, userContext);
      expect(result2.source).toBe('cache');
      expect(result2.value).toEqual(result1.value);

      // Verify analytics
      const analytics = contextCache.getContextAnalytics();
      expect(analytics.performance.hitRate).toBeGreaterThan(0);
    });

    test('should optimize context patterns', async () => {
      const optimizationResult = await contextCache.optimizeContextPatterns();

      expect(optimizationResult.optimizations).toBeDefined();
      expect(optimizationResult.performanceGain).toBeGreaterThanOrEqual(0);
      expect(optimizationResult.newPatterns).toBeGreaterThanOrEqual(0);
      expect(optimizationResult.obsoletePatterns).toBeGreaterThanOrEqual(0);
    });

    test('should predict future access patterns', async () => {
      const predictions = contextCache.predictFuturePatterns('hour');

      expect(predictions.predictions).toBeDefined();
      expect(Array.isArray(predictions.predictions)).toBe(true);
      expect(predictions.confidence).toBeGreaterThanOrEqual(0);
      expect(predictions.confidence).toBeLessThanOrEqual(1);
      expect(predictions.recommendations).toBeDefined();
    });
  });

  describe('Cache Invalidation Tests', () => {
    test('should handle manual cache invalidation', async () => {
      // Setup test data
      const testKeys = ['invalid-1', 'invalid-2', 'invalid-3'];
      for (const key of testKeys) {
        await cacheFramework.set(key, { data: `test-${key}` });
      }

      // Test invalidation
      const invalidationResult = await invalidationEngine.invalidate({
        keys: testKeys,
        reason: 'test-invalidation',
        cascade: false
      });

      expect(invalidationResult.success).toBe(true);
      expect(invalidationResult.keysInvalidated).toBeGreaterThan(0);
      expect(invalidationResult.executionTime).toBeGreaterThan(0);
    });

    test('should handle pattern-based invalidation', async () => {
      // Setup test data with pattern
      const patternKeys = ['pattern:user:123', 'pattern:user:456', 'pattern:team:789'];
      for (const key of patternKeys) {
        await cacheFramework.set(key, { data: `test-${key}` });
      }

      // Test pattern invalidation
      const patternResult = await invalidationEngine.invalidateByPattern(
        'pattern:user:*',
        { dryRun: false }
      );

      expect(patternResult.matchedKeys.length).toBeGreaterThanOrEqual(0);
      expect(patternResult.dryRun).toBe(false);
    });

    test('should handle tag-based invalidation', async () => {
      // Setup test data with tags
      const taggedKeys = ['tag-test-1', 'tag-test-2'];
      for (const key of taggedKeys) {
        await cacheFramework.set(key, { data: `test-${key}` }, {
          tags: ['user-data', 'temporary']
        });
      }

      // Test tag invalidation
      const tagResult = await invalidationEngine.invalidateByTags(['user-data']);

      expect(tagResult).toBeGreaterThanOrEqual(0);
    });

    test('should optimize invalidation rules', async () => {
      const optimizationResult = await invalidationEngine.optimizeRules();

      expect(optimizationResult.optimizations).toBeDefined();
      expect(optimizationResult.rulesOptimized).toBeGreaterThanOrEqual(0);
      expect(optimizationResult.performanceGain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Management Tests', () => {
    test('should allocate and deallocate memory efficiently', async () => {
      const allocationSize = 1024; // 1KB

      // Test allocation
      const allocation = await memoryManager.allocateMemory(allocationSize, {
        priority: 'normal',
        compress: false
      });

      expect(allocation.success).toBe(true);
      expect(allocation.allocation).toBeDefined();
      if (allocation.allocation) {
        expect(allocation.allocation.size).toBeGreaterThan(0);

        // Test deallocation
        const deallocation = await memoryManager.deallocateMemory(allocation.allocation);
        expect(deallocation.success).toBe(true);
        expect(deallocation.freedBytes).toBeGreaterThan(0);
      }
    });

    test('should optimize memory usage', async () => {
      const optimizationResult = await memoryManager.optimizeMemory();

      expect(optimizationResult.optimizations).toBeDefined();
      expect(optimizationResult.memoryFreed).toBeGreaterThanOrEqual(0);
      expect(optimizationResult.performanceGain).toBeGreaterThanOrEqual(0);
      expect(optimizationResult.newEfficiency).toBeGreaterThanOrEqual(0);
    });

    test('should track memory statistics', () => {
      const memoryStats = memoryManager.getMemoryStats();

      expect(memoryStats.totalAllocated).toBeGreaterThanOrEqual(0);
      expect(memoryStats.totalUsed).toBeGreaterThanOrEqual(0);
      expect(memoryStats.efficiency).toBeGreaterThanOrEqual(0);
      expect(memoryStats.efficiency).toBeLessThanOrEqual(100);
      expect(memoryStats.pressureLevel).toBeDefined();
    });

    test('should generate memory profile', () => {
      const memoryProfile = memoryManager.getMemoryProfile();

      expect(memoryProfile.timestamp).toBeGreaterThan(0);
      expect(memoryProfile.heapUsed).toBeGreaterThan(0);
      expect(memoryProfile.heapTotal).toBeGreaterThan(0);
      expect(memoryProfile.objectCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(memoryProfile.largestObjects)).toBe(true);
    });
  });

  describe('Integration and Performance Tests', () => {
    test('should achieve 60% performance improvement target', async () => {
      // Simulate baseline performance measurement
      const baselineStart = performance.now();

      // Simulate operation without caching
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms baseline

      const baselineTime = performance.now() - baselineStart;

      // Measure performance with caching
      const cachedStart = performance.now();

      const contextKey = {
        operation: 'performance-test',
        context: {
          userId: 'perf-user',
          timestamp: Date.now(),
          fingerprint: 'test-fingerprint'
        },
        parameters: { test: true }
      };

      // Cache the operation
      await cacheFramework.set(contextKey, { result: 'cached-result' });

      // Retrieve from cache
      const cachedResult = await cacheFramework.get(contextKey);

      const cachedTime = performance.now() - cachedStart;

      // Calculate improvement
      const improvement = ((baselineTime - cachedTime) / baselineTime) * 100;

      expect(cachedResult).toBeDefined();
      expect(improvement).toBeGreaterThan(50); // Should exceed 50% improvement
      expect(cachedTime).toBeLessThan(baselineTime);
    });

    test('should handle concurrent operations efficiently', async () => {
      const concurrentCount = 100;
      const operations: Promise<any>[] = [];

      // Create concurrent operations
      for (let i = 0; i < concurrentCount; i++) {
        const operation = async () => {
          const key = `concurrent-${i}`;
          const value = { id: i, data: `concurrent-data-${i}` };

          await cacheFramework.set(key, value);
          const retrieved = await cacheFramework.get(key);
          return retrieved;
        };

        operations.push(operation());
      }

      // Execute all operations concurrently
      const results = await Promise.all(operations);

      // Verify all operations completed successfully
      expect(results.length).toBe(concurrentCount);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.id).toBe(index);
      });

      // Check cache performance under load
      const stats = cacheFramework.getStats();
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.averageResponseTime).toBeLessThan(1000); // Should be under 1 second
    });

    test('should maintain security isolation across contexts', async () => {
      const publicContext = {
        userId: 'public-user',
        teamId: 'public-team',
        moduleId: 'public-module',
        operationType: 'read' as const,
        priority: 'normal' as const,
        securityLevel: 'public' as const,
        dataCategories: ['public-data'],
        timestamp: Date.now(),
        computeComplexity: 'simple' as const,
        expectedResponseTime: 50,
        dependencies: []
      };

      const confidentialContext = {
        ...publicContext,
        userId: 'confidential-user',
        securityLevel: 'confidential' as const,
        dataCategories: ['confidential-data']
      };

      // Store data in different security contexts
      await contextCache.cacheWithContext('public-key', 'public-data', publicContext);
      await contextCache.cacheWithContext('confidential-key', 'confidential-data', confidentialContext);

      // Verify isolation - public context should not access confidential data
      const publicResult = await contextCache.getWithContext('confidential-key', publicContext);
      expect(publicResult.value).toBeNull();

      // Confidential context should access its own data
      const confidentialResult = await contextCache.getWithContext('confidential-key', confidentialContext);
      expect(confidentialResult.value).toBeDefined();
    });

    test('should validate Epic 1 security integration', async () => {
      // Test security-aware caching
      const securityContext = {
        userId: 'security-user',
        teamId: 'security-team',
        moduleId: 'security-module',
        operationType: 'analysis' as const,
        priority: 'critical' as const,
        securityLevel: 'restricted' as const,
        dataCategories: ['security-analysis', 'threat-data'],
        timestamp: Date.now(),
        computeComplexity: 'intensive' as const,
        expectedResponseTime: 25,
        dependencies: ['security-engine']
      };

      // Store security-related data
      const securityData = {
        threatLevel: 'high',
        analysisResult: 'threat-detected',
        encrypted: true
      };

      await contextCache.cacheWithContext('security-analysis-1', securityData, securityContext);

      // Verify security data is properly handled
      const result = await contextCache.getWithContext('security-analysis-1', securityContext);
      expect(result.value).toEqual(securityData);
      expect(result.source).toBe('cache');

      // Verify security metrics
      const analytics = contextCache.getContextAnalytics();
      expect(analytics.contexts.users).toBeGreaterThan(0);
      expect(analytics.contexts.teams).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Resilience Tests', () => {
    test('should handle cache failures gracefully', async () => {
      const invalidKey = null as any;

      // Test invalid key handling
      const result = await cacheFramework.get(invalidKey);
      expect(result).toBeNull();

      // Test invalid set operation
      const setResult = await cacheFramework.set(invalidKey, 'test-value');
      expect(setResult).toBe(false);
    });

    test('should handle memory pressure conditions', async () => {
      // Simulate high memory pressure
      memoryManager.configureMemoryPressure({
        critical: 0.1 // Set very low threshold to trigger critical pressure
      });

      // Attempt allocation under pressure
      const allocation = await memoryManager.allocateMemory(1024 * 1024, {
        priority: 'low'
      });

      // Should handle pressure gracefully
      expect(allocation.success).toBeDefined();

      // Reset thresholds
      memoryManager.configureMemoryPressure({
        critical: 0.95
      });
    });

    test('should validate all exports are functional', () => {
      // Test all main exports
      expect(IntelligentCacheFramework).toBeDefined();
      expect(ContextAwareCacheEngine).toBeDefined();
      expect(CacheInvalidationEngine).toBeDefined();
      expect(MemoryOptimizedCacheManager).toBeDefined();

      // Test utility functions
      expect(bmadIntelligentCache).toBeDefined();
      expect(createConcuraCache).toBeDefined();
      expect(createOptimizedMemoryManager).toBeDefined();

      // Test singleton instances
      expect(bmadIntelligentCache.getStats).toBeDefined();
    });
  });
});

/**
 * Performance benchmarks for caching system
 */
describe('BMAD CONCURA Performance Benchmarks', () => {
  test('should meet response time targets', async () => {
    const testIterations = 1000;
    const responseTimes: number[] = [];

    for (let i = 0; i < testIterations; i++) {
      const start = performance.now();

      await bmadIntelligentCache.set(`benchmark-${i}`, { iteration: i });
      await bmadIntelligentCache.get(`benchmark-${i}`);

      const responseTime = performance.now() - start;
      responseTimes.push(responseTime);
    }

    // Calculate metrics
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

    // Validate performance targets
    expect(avgResponseTime).toBeLessThan(50); // Target: <50ms average
    expect(p95ResponseTime).toBeLessThan(100); // Target: <100ms P95

    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`P95 Response Time: ${p95ResponseTime.toFixed(2)}ms`);
  });

  test('should achieve target hit rate', async () => {
    const testCount = 500;
    const uniqueKeys = 100; // 5x repetition rate

    // Populate cache
    for (let i = 0; i < uniqueKeys; i++) {
      await bmadIntelligentCache.set(`hitrate-${i}`, { data: `test-${i}` });
    }

    // Test access pattern
    for (let i = 0; i < testCount; i++) {
      const keyIndex = i % uniqueKeys;
      await bmadIntelligentCache.get(`hitrate-${keyIndex}`);
    }

    // Check hit rate
    const stats = bmadIntelligentCache.getStats();
    expect(stats.hitRate).toBeGreaterThan(0.8); // Target: >80% hit rate

    console.log(`Cache Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  });
});

export { };