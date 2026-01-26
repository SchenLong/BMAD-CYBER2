/**
 * EPIC 2 PACKAGE MANAGEMENT - METRICS MODULE EXPORTS
 * Unified exports for performance metrics collection system
 *
 * @author Performance Metrics Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.5
 */

// Core Performance Metrics Engine
export {
  PerformanceMetricsEngine,
  performanceMetrics,
  default as PerformanceMetrics
} from './performance-metrics';

// Performance Metrics Interfaces
export type {
  MetricsCollectionConfig,
  RetentionConfig,
  SamplingConfig,
  AggregationConfig,
  AlertConfig,
  ExporterConfig,
  CollectorConfig,
  PerformanceSnapshot,
  SnapshotMetadata,
  ResourceUsage,
  CPUUsage,
  MemoryUsage,
  HeapUsage,
  DiskUsage,
  IOStats,
  SpaceUsage,
  IOPSStats,
  LatencyStats,
  NetworkUsage,
  NetworkInterface,
  ConnectionStats,
  ProtocolStats,
  BandwidthStats,
  PacketStats,
  HandleUsage,
  NetworkStats,
  BandwidthUsage,
  NetworkLatency,
  NetworkErrors,
  ApplicationStats,
  RequestStats,
  DatabaseStats,
  ConnectionPool,
  QueryStats,
  TransactionStats,
  LockStats,
  CacheStats,
  QueueStats,
  WorkerStats,
  ProcessCPU,
  MetricTimeSeries,
  Datapoint,
  AggregatedData,
  PerformanceBaseline,
  PerformanceAnomaly,
  AnomalyContext,
  ThresholdConfig,
  AlertAction,
  ExporterCredentials,
  CollectorParameters,
  CustomMetric,
  RootCause
} from './performance-metrics';

// Type Definitions
export type {
  SamplingStrategy,
  AggregationWindow,
  AggregationFunction,
  MetricFormat,
  ExporterType,
  CollectorType,
  DataQuality,
  AnomalySeverity,
  AnomalyPattern,
  AlertSeverity
} from './performance-metrics';

// Specialized Metrics Collectors
export { SystemMetricsCollector } from './collectors/system-metrics';
export { ApplicationMetricsCollector } from './collectors/application-metrics';
export { DatabaseMetricsCollector } from './collectors/database-metrics';
export { NetworkMetricsCollector } from './collectors/network-metrics';
export { SecurityMetricsCollector } from './collectors/security-metrics';

// Metrics Aggregators and Analyzers
export { MetricsAggregator } from './aggregators/metrics-aggregator';
export { AnomalyDetector } from './analyzers/anomaly-detector';
export { TrendAnalyzer } from './analyzers/trend-analyzer';
export { BaselineCalculator } from './analyzers/baseline-calculator';

// Metrics Exporters
export { PrometheusExporter } from './exporters/prometheus-exporter';
export { InfluxDBExporter } from './exporters/influxdb-exporter';
export { JSONExporter } from './exporters/json-exporter';
export { CSVExporter } from './exporters/csv-exporter';

// Utilities
export { MetricsValidator } from './utils/metrics-validator';
export { MetricsFormatter } from './utils/metrics-formatter';
export { MetricsCache } from './utils/metrics-cache';

// Constants
export const METRICS_CONSTANTS = {
  DEFAULT_COLLECTION_INTERVAL: 60000, // 1 minute
  DEFAULT_RETENTION_PERIOD: 86400000, // 24 hours
  DEFAULT_AGGREGATION_WINDOWS: ['1m', '5m', '15m', '1h', '24h'] as const,
  DEFAULT_PERCENTILES: [50, 90, 95, 99] as const,
  MAX_DATAPOINTS_PER_SERIES: 10000,
  MAX_ANOMALY_HISTORY: 1000,
  DEFAULT_SAMPLING_RATE: 1.0,
  ALERT_COOLDOWN_PERIOD: 300000, // 5 minutes
} as const;

// Metric Categories
export const METRIC_CATEGORIES = {
  SYSTEM: 'system',
  APPLICATION: 'application',
  DATABASE: 'database',
  NETWORK: 'network',
  SECURITY: 'security',
  COMPLIANCE: 'compliance'
} as const;

// Standard Metric Names
export const STANDARD_METRICS = {
  // Performance Metrics
  RESPONSE_TIME: 'response_time',
  THROUGHPUT: 'throughput',
  LATENCY: 'latency',
  ERROR_RATE: 'error_rate',

  // Resource Metrics
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  DISK_IO: 'disk_io',
  NETWORK_IO: 'network_io',

  // Application Metrics
  REQUEST_COUNT: 'request_count',
  ACTIVE_CONNECTIONS: 'active_connections',
  QUEUE_SIZE: 'queue_size',
  CACHE_HIT_RATIO: 'cache_hit_ratio',

  // Database Metrics
  QUERY_TIME: 'query_time',
  CONNECTION_POOL: 'connection_pool',
  TRANSACTION_RATE: 'transaction_rate',
  LOCK_CONTENTION: 'lock_contention',

  // Security Metrics
  FAILED_LOGINS: 'failed_logins',
  VULNERABILITY_COUNT: 'vulnerability_count',
  SECURITY_SCORE: 'security_score',
  COMPLIANCE_SCORE: 'compliance_score'
} as const;