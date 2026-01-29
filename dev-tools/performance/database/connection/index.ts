/**
 * BMAD CONCURA DATABASE CONNECTION OPTIMIZATION
 * Advanced connection pool management with intelligent optimization
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

export {
  DatabaseConnectionManager,
  bmadConnectionManager,
  type ConnectionConfig,
  type PoolStats,
  type ConnectionMetrics,
  type ConnectionOptimization
} from './connection-manager';

export {
  IntelligentConnectionPool,
  type PoolConfiguration,
  type ConnectionHealth,
  type PoolPerformance
} from './connection-pool';

export {
  ConnectionOptimizer,
  type OptimizationStrategy,
  type ConnectionAnalysis,
  type PerformanceTarget
} from './connection-optimizer';

export {
  ConnectionMonitor,
  type MonitoringConfig,
  type ConnectionEvent,
  type AlertThreshold
} from './connection-monitor';

/**
 * Initialize comprehensive database connection optimization
 */
export async function initializeConnectionOptimization(config?: {
  poolConfig?: any;
  optimization?: any;
  monitoring?: any;
  performance?: any;
}): Promise<DatabaseConnectionManager> {
  const manager = new DatabaseConnectionManager(config);
  await manager.initialize();
  return manager;
}

/**
 * Quick start for connection optimization
 */
export async function quickStartConnectionOptimization(): Promise<DatabaseConnectionManager> {
  const manager = new DatabaseConnectionManager({
    poolConfig: {
      minConnections: 5,
      maxConnections: 20,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 60000,
      createRetryIntervalMillis: 200,
      createTimeoutMillis: 30000
    },
    optimization: {
      enabled: true,
      autoScaling: true,
      loadBalancing: true,
      connectionValidation: true,
      performanceTuning: true
    },
    monitoring: {
      enabled: true,
      realtime: true,
      metricsInterval: 10000,
      alerting: true
    },
    performance: {
      targetUtilization: 70,
      maxResponseTime: 100,
      targetThroughput: 1000,
      efficiency: 90
    }
  });

  await manager.initialize();
  console.log('✅ BMAD Database Connection Optimization started');

  return manager;
}