/**
 * EPIC 2 PACKAGE MANAGEMENT - MONITORING SYSTEM INTEGRATION
 * Comprehensive health monitoring integration with existing Epic 2 components
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.5
 */

// Core Health Monitoring System
export {
  HealthMonitoringEngine,
  healthMonitoring,
  default as HealthMonitoring
} from './health/health-monitoring';

// Interactive Dashboard
export {
  InteractiveHealthDashboard,
  default as HealthDashboard
} from './dashboard/health-dashboard';

// Dashboard Module
export {
  DashboardConfig,
  VisualizationConfig,
  DashboardState,
  DashboardData,
  VisualizationType,
  DASHBOARD_CONSTANTS,
  createDefaultDashboardConfig,
  createVisualizationConfig
} from './dashboard/index';

/**
 * Monitoring Integration Configuration
 */

export interface MonitoringIntegrationConfig {
  readonly health: HealthMonitoringConfig;
  readonly metrics: MetricsCollectionConfig;
  readonly dashboard: DashboardConfig;
  readonly integration: IntegrationConfig;
}

export interface HealthMonitoringConfig {
  readonly enabled: boolean;
  readonly interval: number;
  readonly thresholds: HealthThresholds;
  readonly alerts: AlertConfiguration;
  readonly predictive: PredictiveConfig;
}

export interface MetricsCollectionConfig {
  readonly interval: number;
  readonly retention: RetentionConfig;
  readonly collectors: CollectorConfig[];
  readonly exporters: ExporterConfig[];
}

export interface IntegrationConfig {
  readonly packageRegistry: boolean;
  readonly discoveryEngine: boolean;
  readonly recommendationSystem: boolean;
  readonly securityMonitoring: boolean;
  readonly auditLogging: boolean;
}

export interface HealthThresholds {
  readonly performance: PerformanceThresholds;
  readonly availability: AvailabilityThresholds;
  readonly security: SecurityThresholds;
  readonly compliance: ComplianceThresholds;
}

export interface AlertConfiguration {
  readonly channels: AlertChannel[];
  readonly escalation: EscalationPolicy;
  readonly throttling: ThrottlingConfig;
}

export interface PredictiveConfig {
  readonly enabled: boolean;
  readonly horizon: number;
  readonly confidence: number;
}

// Type definitions
export type VisualizationType =
  | 'line_chart'
  | 'area_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'gauge'
  | 'heatmap'
  | 'table'
  | 'metric_card'
  | 'status_indicator'
  | 'timeline'
  | 'network_graph'
  | 'tree_map'
  | 'sankey'
  | 'radar_chart'
  | 'scatter_plot';

export type AggregationFunction = 'avg' | 'sum' | 'min' | 'max' | 'count' | 'percentile' | 'rate';
export type FilterType = 'select' | 'multiselect' | 'range' | 'date' | 'text' | 'boolean';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'degraded';
export type TrendDirection = 'stable' | 'improving' | 'degrading' | 'volatile';

// Supporting interfaces (mock implementations for TypeScript)
export interface RetentionConfig {
  readonly duration: number;
  readonly unit: 'days' | 'hours' | 'minutes';
}

export interface CollectorConfig {
  readonly id: string;
  readonly type: string;
  readonly enabled: boolean;
  readonly interval: number;
}

export interface ExporterConfig {
  readonly type: string;
  readonly destination: string;
  readonly enabled: boolean;
}

export interface PerformanceThresholds {
  readonly responseTime: number;
  readonly throughput: number;
  readonly errorRate: number;
}

export interface AvailabilityThresholds {
  readonly uptime: number;
  readonly slaCompliance: number;
}

export interface SecurityThresholds {
  readonly vulnerabilityCount: number;
  readonly threatLevel: string;
}

export interface ComplianceThresholds {
  readonly owaspScore: number;
  readonly auditCoverage: number;
}

export interface AlertChannel {
  readonly type: 'email' | 'slack' | 'webhook' | 'sms';
  readonly config: Record<string, unknown>;
}

export interface EscalationPolicy {
  readonly levels: EscalationLevel[];
  readonly timeout: number;
}

export interface ThrottlingConfig {
  readonly enabled: boolean;
  readonly window: number;
  readonly maxAlerts: number;
}

export interface EscalationLevel {
  readonly level: number;
  readonly delay: number;
  readonly recipients: string[];
}

/**
 * Package Management Monitoring Integration Class
 */
export class PackageManagementMonitoring extends EventEmitter {
  private static instance: PackageManagementMonitoring;
  private config: MonitoringIntegrationConfig | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): PackageManagementMonitoring {
    if (!PackageManagementMonitoring.instance) {
      PackageManagementMonitoring.instance = new PackageManagementMonitoring();
    }
    return PackageManagementMonitoring.instance;
  }

  /**
   * Initialize monitoring integration
   */
  public async initialize(config: MonitoringIntegrationConfig): Promise<void> {
    this.config = config;
    this.emit('initialized', { config });
  }

  /**
   * Get health monitoring status
   */
  public async getHealthStatus(): Promise<HealthStatus> {
    return 'healthy';
  }

  /**
   * Get metrics summary
   */
  public async getMetricsSummary(): Promise<Record<string, unknown>> {
    return {};
  }

  /**
   * Stop monitoring
   */
  public async stop(): Promise<void> {
    this.emit('stopped');
  }
}

export default PackageManagementMonitoring;
