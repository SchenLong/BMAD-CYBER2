/**
 * BMAD CONCURA DATABASE PERFORMANCE MONITORING
 * Real-time database monitoring with advanced analytics and alerting
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

export {
  DatabasePerformanceMonitor,
  bmadDatabaseMonitor,
  type MonitoringConfiguration,
  type PerformanceMetrics,
  type AlertRule,
  type MonitoringAlert
} from './performance-monitor';

export {
  QueryPerformanceTracker,
  type QueryMetrics,
  type QueryPerformanceReport,
  type SlowQueryAlert
} from './query-tracker';

export {
  DatabaseMetricsCollector,
  type DatabaseMetrics,
  type SystemMetrics,
  type ResourceUsage
} from './metrics-collector';

export {
  PerformanceAnalyzer,
  type TrendAnalysis,
  type PerformanceInsight,
  type BottleneckAnalysis
} from './performance-analyzer';

export {
  AlertingSystem,
  type AlertConfiguration,
  type AlertChannel,
  type AlertHistory
} from './alerting-system';

/**
 * Initialize comprehensive database monitoring
 */
export async function initializeDatabaseMonitoring(config?: {
  monitoring?: any;
  alerting?: any;
  analytics?: any;
  performance?: any;
}): Promise<DatabasePerformanceMonitor> {
  const monitor = new DatabasePerformanceMonitor(config);
  await monitor.initialize();
  return monitor;
}

/**
 * Quick start database monitoring
 */
export async function quickStartDatabaseMonitoring(): Promise<DatabasePerformanceMonitor> {
  const monitor = new DatabasePerformanceMonitor({
    monitoring: {
      enabled: true,
      interval: 10000,
      metricsRetention: 86400000, // 24 hours
      realTimeUpdates: true
    },
    alerting: {
      enabled: true,
      channels: [
        { type: 'console', name: 'Console Alerts' },
        { type: 'webhook', name: 'Performance Webhook', url: 'http://localhost:3000/alerts' }
      ],
      thresholds: {
        slowQuery: 1000,
        highCpuUsage: 80,
        highMemoryUsage: 85,
        connectionPoolUtilization: 90,
        errorRate: 5
      }
    },
    analytics: {
      enabled: true,
      trendAnalysis: true,
      predictiveAnalysis: false,
      bottleneckDetection: true
    },
    performance: {
      targetResponseTime: 100,
      targetThroughput: 1000,
      targetErrorRate: 1,
      targetUtilization: 70
    }
  });

  await monitor.initialize();
  console.log('✅ BMAD Database Performance Monitoring started');

  return monitor;
}