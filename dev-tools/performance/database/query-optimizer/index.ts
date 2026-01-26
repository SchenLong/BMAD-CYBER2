/**
 * BMAD CONCURA DATABASE QUERY OPTIMIZER
 * Advanced intelligent query optimization for BMAD systems performance acceleration
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

export {
  DatabaseQueryOptimizer,
  bmadQueryOptimizer,
  type QueryAnalysis,
  type QueryOptimization,
  type QueryPlan,
  type IndexRecommendation,
  type QueryPerformanceProfile
} from './query-optimizer';

export {
  QueryAnalysisEngine,
  type QueryPattern,
  type QueryComplexity,
  type QueryMetrics
} from './analysis-engine';

export {
  QueryPlanOptimizer,
  type ExecutionPlan,
  type OptimizationStrategy,
  type PlanComparison
} from './plan-optimizer';

export {
  IndexOptimizer,
  type IndexStrategy,
  type IndexAnalysis,
  type IndexRecommendations
} from './index-optimizer';

export {
  QueryCacheOptimizer,
  type CacheableQuery,
  type CacheStrategy,
  type QueryCacheStats
} from './cache-optimizer';

/**
 * Initialize complete database query optimization suite
 */
export async function initializeDatabaseOptimization(config?: {
  queryAnalysis?: any;
  indexOptimization?: any;
  cacheOptimization?: any;
  performanceTargets?: any;
}): Promise<DatabaseQueryOptimizer> {
  const optimizer = new DatabaseQueryOptimizer(config);
  await optimizer.initialize();
  return optimizer;
}

/**
 * Quick start for basic database optimization
 */
export async function quickStartDatabaseOptimization(): Promise<DatabaseQueryOptimizer> {
  const optimizer = new DatabaseQueryOptimizer({
    queryAnalysis: {
      enabled: true,
      realtimeMonitoring: true,
      slowQueryThreshold: 100,
      analysisDepth: 'detailed'
    },
    indexOptimization: {
      enabled: true,
      autoCreateIndexes: false,
      analysisInterval: 300000
    },
    cacheOptimization: {
      enabled: true,
      maxCacheSize: 100,
      ttl: 300000
    },
    performanceTargets: {
      queryResponseTime: 50,
      throughputImprovement: 50,
      cacheHitRate: 80,
      connectionEfficiency: 90
    }
  });

  await optimizer.initialize();
  console.log('✅ BMAD Database Query Optimization started');

  return optimizer;
}