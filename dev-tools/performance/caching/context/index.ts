/**
 * BMAD CONCURA CONTEXT-AWARE CACHING MODULE
 * Export interface for context-aware caching capabilities
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

// Core Context-Aware Cache
export {
  ContextAwareCacheEngine,
  createConcuraCache,
  type ContextMetadata,
  type ContextPattern,
  type ConcuraOptimization
} from './context-aware-cache';

// Context Optimization Utilities
export {
  ContextOptimizer,
  type OptimizationStrategy,
  type PerformanceMetrics
} from './context-optimizer';

// Context Pattern Analysis
export {
  ContextPatternAnalyzer,
  type PatternInsight,
  type AccessPattern
} from './pattern-analyzer';

/**
 * Quick start for CONCURA context optimization
 */
export function initializeConcuraContextCache(config?: {
  targetImprovement?: number;
  enablePredictive?: boolean;
  securityLevel?: 'standard' | 'high' | 'maximum';
}) {
  console.log('🚀 Initializing CONCURA Context Cache...');

  const cache = createConcuraCache({
    contextCompression: true,
    predictivePrefetch: config?.enablePredictive ?? true,
    intelligentEviction: true,
    crossTeamOptimization: true,
    securityAwareCaching: config?.securityLevel !== 'standard',
    performanceTargets: {
      responseTime: 50,
      hitRate: 85,
      memoryEfficiency: 90
    }
  });

  console.log(`✅ CONCURA Context Cache initialized`);
  console.log(`   🎯 Target Improvement: ${config?.targetImprovement || 60}%`);
  console.log(`   🔮 Predictive Prefetch: ${config?.enablePredictive ? 'Enabled' : 'Disabled'}`);
  console.log(`   🔒 Security Level: ${config?.securityLevel || 'standard'}`);

  return cache;
}

/**
 * CONCURA Context Cache singleton for global use
 */
export const concuraContextCache = createConcuraCache();