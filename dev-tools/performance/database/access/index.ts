/**
 * BMAD CONCURA DATA ACCESS OPTIMIZATION
 * Advanced data access patterns optimized for CONCURA context efficiency
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

export {
  DataAccessOptimizer,
  bmadDataAccessOptimizer,
  type AccessPattern,
  type OptimizedQuery,
  type DataAccessMetrics,
  type ConcuraContext
} from './data-access-optimizer';

export {
  QueryPatternAnalyzer,
  type QueryPattern,
  type PatternOptimization,
  type AccessFrequency
} from './pattern-analyzer';

export {
  ConcuraDataCache,
  type CachePolicy,
  type DataCacheEntry,
  type CacheEvictionStrategy
} from './concura-cache';

export {
  IntelligentPrefetcher,
  type PrefetchStrategy,
  type PrefetchPrediction,
  type DataRelationship
} from './intelligent-prefetcher';

export {
  DataAccessSecurityManager,
  type SecurityContext,
  type AccessControl,
  type DataClassification
} from './security-manager';

/**
 * Initialize complete data access optimization
 */
export async function initializeDataAccessOptimization(config?: {
  optimization?: any;
  caching?: any;
  prefetching?: any;
  security?: any;
}): Promise<DataAccessOptimizer> {
  const optimizer = new DataAccessOptimizer(config);
  await optimizer.initialize();
  return optimizer;
}

/**
 * Quick start data access optimization
 */
export async function quickStartDataAccessOptimization(): Promise<DataAccessOptimizer> {
  const optimizer = new DataAccessOptimizer({
    optimization: {
      enabled: true,
      patternDetection: true,
      queryRewriting: true,
      concuraIntegration: true,
      performanceTargets: {
        responseTime: 50,
        throughputImprovement: 40,
        cacheHitRate: 80
      }
    },
    caching: {
      enabled: true,
      strategy: 'adaptive',
      maxSize: '512MB',
      ttl: 300000,
      compression: true
    },
    prefetching: {
      enabled: true,
      strategy: 'predictive',
      confidence: 0.7,
      maxPrefetchSize: 10
    },
    security: {
      enabled: true,
      dataClassification: true,
      accessLogging: true,
      encryptSensitive: true
    }
  });

  await optimizer.initialize();
  console.log('✅ BMAD Data Access Optimization started');

  return optimizer;
}