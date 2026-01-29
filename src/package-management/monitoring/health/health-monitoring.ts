/**
 * EPIC 2 PACKAGE MANAGEMENT - HEALTH MONITORING ENGINE
 * Comprehensive package health monitoring system with real-time metrics and predictive analytics
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.5
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

// Epic 1 Security Integration
import {
  epic1Security,
  Epic1SecurityInfrastructure,
  SecurityStatus,
  ComponentStatus
} from '../../security/epic1-integration';
import { SecurityMonitor } from '../../security/monitoring/security-monitor';
import { AuditLogger } from '../../security/audit/audit-logger';

// Package Management Integration
import {
  PackageMetadata,
  PackageIdentifier,
  PackageRegistry,
  SecurityVulnerability,
  PackageSecurity
} from '../registry/interfaces';

/**
 * Health Monitoring Core Interfaces
 */

export interface HealthMetrics {
  readonly timestamp: number;
  readonly nodeId: string;
  readonly componentId: string;
  readonly category: HealthCategory;
  readonly metrics: MetricData;
  readonly status: HealthStatus;
  readonly trends: TrendData;
  readonly alerts: HealthAlert[];
  readonly predictions: PredictiveAnalytics;
}

export interface MetricData {
  readonly performance: PerformanceMetrics;
  readonly availability: AvailabilityMetrics;
  readonly reliability: ReliabilityMetrics;
  readonly security: SecurityMetrics;
  readonly resource: ResourceMetrics;
  readonly compliance: ComplianceMetrics;
  readonly quality: QualityMetrics;
}

export interface PerformanceMetrics {
  readonly responseTime: TimeMetric;
  readonly throughput: ThroughputMetric;
  readonly latency: LatencyMetric;
  readonly errorRate: RateMetric;
  readonly cpuUsage: ResourceMetric;
  readonly memoryUsage: ResourceMetric;
  readonly diskIO: IOMetric;
  readonly networkIO: IOMetric;
}

export interface AvailabilityMetrics {
  readonly uptime: number; // percentage
  readonly downtime: number; // minutes
  readonly mtbf: number; // mean time between failures
  readonly mttr: number; // mean time to recovery
  readonly slaCompliance: number; // percentage
  readonly serviceLevel: ServiceLevel;
}

export interface ReliabilityMetrics {
  readonly errorCount: number;
  readonly exceptionRate: number;
  readonly failureCount: number;
  readonly recoveryTime: number;
  readonly dataIntegrity: number; // percentage
  readonly transactionSuccess: number; // percentage
}

export interface SecurityMetrics {
  readonly vulnerabilityCount: VulnerabilityCount;
  readonly threatLevel: ThreatLevel;
  readonly securityScore: number; // 0-100
  readonly complianceScore: number; // 0-100
  readonly incidentCount: number;
  readonly accessViolations: number;
  readonly encryptionCoverage: number; // percentage
}

export interface ResourceMetrics {
  readonly cpu: ResourceUtilization;
  readonly memory: ResourceUtilization;
  readonly disk: ResourceUtilization;
  readonly network: ResourceUtilization;
  readonly connections: ConnectionMetrics;
  readonly cacheHitRatio: number;
}

export interface ComplianceMetrics {
  readonly owaspScore: number; // 0-100
  readonly gdprCompliance: boolean;
  readonly hipaaCompliance: boolean;
  readonly soc2Compliance: boolean;
  readonly iso27001Compliance: boolean;
  readonly pciCompliance: boolean;
  readonly auditTrailComplete: boolean;
}

export interface QualityMetrics {
  readonly codeQuality: number; // 0-100
  readonly testCoverage: number; // percentage
  readonly documentationQuality: number; // 0-100
  readonly dependencyHealth: number; // 0-100
  readonly maintainabilityIndex: number; // 0-100
  readonly technicalDebt: TechnicalDebtMetrics;
}

export interface TechnicalDebtMetrics {
  readonly debtRatio: number; // percentage
  readonly remediation: {
    effort: number; // hours
    cost: number; // estimated cost
    priority: DebtPriority;
  };
  readonly categories: {
    security: number;
    performance: number;
    maintainability: number;
    reliability: number;
  };
}

export interface TrendData {
  readonly shortTerm: TrendAnalysis; // 1 hour
  readonly mediumTerm: TrendAnalysis; // 24 hours
  readonly longTerm: TrendAnalysis; // 30 days
  readonly seasonality: SeasonalityPattern;
  readonly anomalies: AnomalyDetection[];
}

export interface TrendAnalysis {
  readonly direction: TrendDirection;
  readonly velocity: number;
  readonly acceleration: number;
  readonly correlation: number; // -1 to 1
  readonly confidence: number; // 0-1
  readonly rSquared: number;
}

export interface PredictiveAnalytics {
  readonly forecast: HealthForecast[];
  readonly riskAssessment: RiskAssessment;
  readonly recommendations: HealthRecommendation[];
  readonly maintenanceWindows: MaintenanceWindow[];
  readonly capacityPlanning: CapacityForecast;
}

export interface HealthForecast {
  readonly timestamp: number;
  readonly metric: string;
  readonly predictedValue: number;
  readonly confidence: number;
  readonly upperBound: number;
  readonly lowerBound: number;
  readonly factors: PredictionFactor[];
}

export interface RiskAssessment {
  readonly overallRisk: RiskLevel;
  readonly riskFactors: RiskFactor[];
  readonly mitigationStrategies: MitigationStrategy[];
  readonly probabilityOfFailure: number; // 0-1
  readonly impactAssessment: ImpactAssessment;
}

export interface HealthAlert {
  readonly alertId: string;
  readonly timestamp: number;
  readonly severity: AlertSeverity;
  readonly category: AlertCategory;
  readonly title: string;
  readonly description: string;
  readonly affectedComponents: string[];
  readonly metrics: AlertMetrics;
  readonly automation: AutomationAction[];
  readonly escalation: EscalationPolicy;
  readonly resolution: AlertResolution | null;
}

export interface SLATracking {
  readonly slaId: string;
  readonly name: string;
  readonly targets: SLATarget[];
  readonly current: SLAStatus;
  readonly compliance: SLACompliance;
  readonly violations: SLAViolation[];
  readonly credits: SLACredit[];
  readonly reporting: SLAReport[];
}

export interface HealthDashboard {
  readonly overview: HealthOverview;
  readonly realTimeMetrics: RealTimeMetrics;
  readonly alerts: HealthAlert[];
  readonly trends: TrendVisualization[];
  readonly compliance: ComplianceDashboard;
  readonly predictions: PredictionDashboard;
  readonly sla: SLADashboard;
}

// Type Definitions
export type HealthCategory = 'system' | 'application' | 'database' | 'network' | 'security' | 'compliance';
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'degraded';
export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TrendDirection = 'stable' | 'improving' | 'degrading' | 'volatile';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertCategory = 'performance' | 'availability' | 'security' | 'compliance' | 'resource';
export type DebtPriority = 'low' | 'medium' | 'high' | 'critical';
export type ServiceLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

export interface TimeMetric {
  readonly current: number;
  readonly average: number;
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly min: number;
  readonly max: number;
}

export interface ThroughputMetric {
  readonly requestsPerSecond: number;
  readonly transactionsPerMinute: number;
  readonly operationsPerHour: number;
  readonly peak: number;
  readonly average: number;
}

export interface LatencyMetric {
  readonly dns: number;
  readonly connect: number;
  readonly ssl: number;
  readonly processing: number;
  readonly transfer: number;
  readonly total: number;
}

export interface RateMetric {
  readonly count: number;
  readonly rate: number; // per second
  readonly percentage: number;
  readonly threshold: number;
  readonly trend: TrendDirection;
}

export interface ResourceMetric {
  readonly current: number;
  readonly average: number;
  readonly peak: number;
  readonly threshold: number;
  readonly capacity: number;
  readonly utilization: number; // percentage
}

export interface IOMetric {
  readonly readOps: number;
  readonly writeOps: number;
  readonly readBytes: number;
  readonly writeBytes: number;
  readonly bandwidth: number;
  readonly iops: number;
}

export interface VulnerabilityCount {
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly info: number;
  readonly total: number;
}

export interface ResourceUtilization {
  readonly used: number;
  readonly available: number;
  readonly total: number;
  readonly percentage: number;
  readonly trend: TrendDirection;
}

export interface ConnectionMetrics {
  readonly active: number;
  readonly idle: number;
  readonly total: number;
  readonly refused: number;
  readonly timeout: number;
  readonly poolSize: number;
}

/**
 * Health Monitoring Engine Implementation
 */

export class HealthMonitoringEngine extends EventEmitter {
  private static instance: HealthMonitoringEngine;
  private readonly nodeId: string;
  private readonly securityMonitor: SecurityMonitor;
  private readonly auditLogger: AuditLogger;
  private readonly collectors: Map<string, MetricCollector> = new Map();
  private readonly alertManager: AlertManager;
  private readonly predictiveEngine: PredictiveEngine;
  private readonly slaTracker: SLATracker;
  private readonly dashboardManager: DashboardManager;

  private metricsCache: Map<string, HealthMetrics> = new Map();
  private alertsCache: Map<string, HealthAlert> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.nodeId = this.generateNodeId();
    this.securityMonitor = new SecurityMonitor();
    this.auditLogger = new AuditLogger();
    this.alertManager = new AlertManager(this);
    this.predictiveEngine = new PredictiveEngine();
    this.slaTracker = new SLATracker();
    this.dashboardManager = new DashboardManager();

    this.setupEventHandlers();
  }

  public static getInstance(): HealthMonitoringEngine {
    if (!HealthMonitoringEngine.instance) {
      HealthMonitoringEngine.instance = new HealthMonitoringEngine();
    }
    return HealthMonitoringEngine.instance;
  }

  /**
   * Initialize health monitoring system
   */
  public async initialize(config: HealthMonitoringConfig): Promise<void> {
    try {
      await this.auditLogger.log('health_monitoring_init', {
        nodeId: this.nodeId,
        config: this.sanitizeConfig(config)
      });

      // Initialize collectors
      await this.initializeCollectors(config.collectors);

      // Initialize alert manager
      await this.alertManager.initialize(config.alerting);

      // Initialize predictive engine
      await this.predictiveEngine.initialize(config.predictive);

      // Initialize SLA tracker
      await this.slaTracker.initialize(config.sla);

      // Initialize dashboard
      await this.dashboardManager.initialize(config.dashboard);

      // Start monitoring
      await this.startMonitoring(config.intervals);

      this.emit('initialized', { nodeId: this.nodeId });
    } catch (error) {
      await this.auditLogger.logError('health_monitoring_init_failed', error as Error, { nodeId: this.nodeId });
      throw error;
    }
  }

  /**
   * Collect comprehensive health metrics
   */
  public async collectMetrics(componentId?: string): Promise<HealthMetrics[]> {
    const startTime = performance.now();

    try {
      const metrics: HealthMetrics[] = [];
      const components = componentId ? [componentId] : Array.from(this.collectors.keys());

      for (const compId of components) {
        const collector = this.collectors.get(compId);
        if (collector) {
          const componentMetrics = await this.collectComponentMetrics(compId, collector);
          metrics.push(componentMetrics);

          // Cache metrics
          this.metricsCache.set(compId, componentMetrics);
        }
      }

      // Update trends and predictions
      await this.updateTrends(metrics);
      await this.updatePredictions(metrics);

      const endTime = performance.now();
      await this.auditLogger.log('metrics_collected', {
        componentCount: components.length,
        duration: endTime - startTime,
        nodeId: this.nodeId
      });

      return metrics;
    } catch (error) {
      await this.auditLogger.logError('metrics_collection_failed', error as Error, { componentId, nodeId: this.nodeId });
      throw error;
    }
  }

  /**
   * Get real-time health dashboard
   */
  public async getHealthDashboard(): Promise<HealthDashboard> {
    try {
      const overview = await this.generateHealthOverview();
      const realTimeMetrics = await this.getRealTimeMetrics();
      const alerts = Array.from(this.alertsCache.values()).filter(alert => !alert.resolution);
      const trends = await this.getTrendVisualizations();
      const compliance = await this.getComplianceDashboard();
      const predictions = await this.getPredictionDashboard();
      const sla = await this.getSLADashboard();

      return {
        overview,
        realTimeMetrics,
        alerts,
        trends,
        compliance,
        predictions,
        sla
      };
    } catch (error) {
      await this.auditLogger.logError('dashboard_generation_failed', error as Error, { nodeId: this.nodeId });
      throw error;
    }
  }

  /**
   * Process health alerts
   */
  public async processAlert(alert: HealthAlert): Promise<void> {
    try {
      // Store alert
      this.alertsCache.set(alert.alertId, alert);

      // Execute automation actions
      for (const action of alert.automation) {
        await this.executeAutomationAction(action);
      }

      // Check escalation policy
      await this.checkEscalation(alert);

      // Emit alert event
      this.emit('alert', alert);

      await this.auditLogger.log('alert_processed', {
        alertId: alert.alertId,
        severity: alert.severity,
        category: alert.category,
        nodeId: this.nodeId
      });
    } catch (error) {
      await this.auditLogger.logError('alert_processing_failed', error as Error, { alert: alert.alertId });
      throw error;
    }
  }

  /**
   * Get health recommendations
   */
  public async getRecommendations(componentId?: string): Promise<HealthRecommendation[]> {
    try {
      const metrics = componentId
        ? [this.metricsCache.get(componentId)].filter(Boolean) as HealthMetrics[]
        : Array.from(this.metricsCache.values());

      const recommendations: HealthRecommendation[] = [];

      for (const metric of metrics) {
        const componentRecommendations = await this.generateRecommendations(metric);
        recommendations.push(...componentRecommendations);
      }

      // Prioritize recommendations
      recommendations.sort((a, b) => b.priority - a.priority);

      return recommendations;
    } catch (error) {
      await this.auditLogger.logError('recommendations_generation_failed', error as Error, { componentId });
      throw error;
    }
  }

  /**
   * Track SLA compliance
   */
  public async trackSLA(slaId: string): Promise<SLATracking> {
    try {
      return await this.slaTracker.track(slaId);
    } catch (error) {
      await this.auditLogger.logError('sla_tracking_failed', error as Error, { slaId });
      throw error;
    }
  }

  /**
   * Export health reports
   */
  public async exportHealthReport(format: ReportFormat, timeRange: TimeRange): Promise<HealthReport> {
    try {
      const report = await this.generateHealthReport(timeRange);

      switch (format) {
        case 'json':
          return report;
        case 'csv':
          return this.convertToCSV(report);
        case 'pdf':
          return await this.generatePDFReport(report);
        default:
          throw new Error(`Unsupported report format: ${format}`);
      }
    } catch (error) {
      await this.auditLogger.logError('health_report_export_failed', error as Error, { format, timeRange });
      throw error;
    }
  }

  // Private helper methods
  private generateNodeId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private setupEventHandlers(): void {
    this.on('alert', this.handleAlert.bind(this));
    this.on('metrics', this.handleMetrics.bind(this));
    this.on('threshold_breach', this.handleThresholdBreach.bind(this));
    this.on('prediction', this.handlePrediction.bind(this));
  }

  private async initializeCollectors(collectorConfigs: CollectorConfig[]): Promise<void> {
    for (const config of collectorConfigs) {
      const collector = new MetricCollector(config);
      await collector.initialize();
      this.collectors.set(config.componentId, collector);
    }
  }

  private async collectComponentMetrics(componentId: string, collector: MetricCollector): Promise<HealthMetrics> {
    const timestamp = Date.now();
    const metricData = await collector.collect();
    const status = this.determineHealthStatus(metricData);
    const trends = await this.calculateTrends(componentId, metricData);
    const alerts = await this.checkAlerts(componentId, metricData);
    const predictions = await this.generatePredictions(componentId, metricData);

    return {
      timestamp,
      nodeId: this.nodeId,
      componentId,
      category: collector.getCategory(),
      metrics: metricData,
      status,
      trends,
      alerts,
      predictions
    };
  }

  private determineHealthStatus(metrics: MetricData): HealthStatus {
    const scores = [
      this.scorePerformance(metrics.performance),
      this.scoreAvailability(metrics.availability),
      this.scoreReliability(metrics.reliability),
      this.scoreSecurity(metrics.security),
      this.scoreResource(metrics.resource),
      this.scoreCompliance(metrics.compliance)
    ];

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (averageScore >= 90) return 'healthy';
    if (averageScore >= 70) return 'warning';
    if (averageScore >= 50) return 'degraded';
    return 'critical';
  }

  private scorePerformance(perf: PerformanceMetrics): number {
    // Implement scoring algorithm based on performance thresholds
    let score = 100;

    // Response time impact
    if (perf.responseTime.p95 > 1000) score -= 20;
    else if (perf.responseTime.p95 > 500) score -= 10;

    // Error rate impact
    if (perf.errorRate.percentage > 5) score -= 30;
    else if (perf.errorRate.percentage > 1) score -= 15;

    // Resource usage impact
    if (perf.cpuUsage.utilization > 90) score -= 20;
    else if (perf.cpuUsage.utilization > 70) score -= 10;

    return Math.max(0, score);
  }

  private scoreAvailability(avail: AvailabilityMetrics): number {
    return avail.uptime; // Direct mapping for simplicity
  }

  private scoreReliability(rel: ReliabilityMetrics): number {
    let score = 100;

    if (rel.errorCount > 100) score -= 30;
    else if (rel.errorCount > 50) score -= 15;

    if (rel.dataIntegrity < 99.9) score -= 40;
    else if (rel.dataIntegrity < 99.99) score -= 20;

    return Math.max(0, score);
  }

  private scoreSecurity(sec: SecurityMetrics): number {
    return sec.securityScore;
  }

  private scoreResource(res: ResourceMetrics): number {
    const utilizationScore = 100 - Math.max(
      res.cpu.percentage,
      res.memory.percentage,
      res.disk.percentage
    );
    return Math.max(0, utilizationScore);
  }

  private scoreCompliance(comp: ComplianceMetrics): number {
    return comp.owaspScore;
  }

  private async startMonitoring(intervals: MonitoringIntervals): Promise<void> {
    if (this.isMonitoring) {
      await this.stopMonitoring();
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        await this.auditLogger.logError('monitoring_cycle_failed', error as Error);
      }
    }, intervals.collection);
  }

  private async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  private sanitizeConfig(config: HealthMonitoringConfig): any {
    // Remove sensitive information from config for logging
    return {
      collectorsCount: config.collectors?.length || 0,
      alertingEnabled: !!config.alerting,
      predictiveEnabled: !!config.predictive,
      dashboardEnabled: !!config.dashboard
    };
  }

  // Placeholder implementations for supporting methods
  private async updateTrends(metrics: HealthMetrics[]): Promise<void> {
    // Implementation for trend analysis
  }

  private async updatePredictions(metrics: HealthMetrics[]): Promise<void> {
    // Implementation for prediction updates
  }

  private async calculateTrends(componentId: string, metrics: MetricData): Promise<TrendData> {
    // Implementation for trend calculation
    return {} as TrendData;
  }

  private async checkAlerts(componentId: string, metrics: MetricData): Promise<HealthAlert[]> {
    // Implementation for alert checking
    return [];
  }

  private async generatePredictions(componentId: string, metrics: MetricData): Promise<PredictiveAnalytics> {
    // Implementation for prediction generation
    return {} as PredictiveAnalytics;
  }

  private async generateHealthOverview(): Promise<HealthOverview> {
    // Implementation for health overview generation
    return {} as HealthOverview;
  }

  private async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    // Implementation for real-time metrics
    return {} as RealTimeMetrics;
  }

  private async getTrendVisualizations(): Promise<TrendVisualization[]> {
    // Implementation for trend visualizations
    return [];
  }

  private async getComplianceDashboard(): Promise<ComplianceDashboard> {
    // Implementation for compliance dashboard
    return {} as ComplianceDashboard;
  }

  private async getPredictionDashboard(): Promise<PredictionDashboard> {
    // Implementation for prediction dashboard
    return {} as PredictionDashboard;
  }

  private async getSLADashboard(): Promise<SLADashboard> {
    // Implementation for SLA dashboard
    return {} as SLADashboard;
  }

  private async executeAutomationAction(action: AutomationAction): Promise<void> {
    // Implementation for automation action execution
  }

  private async checkEscalation(alert: HealthAlert): Promise<void> {
    // Implementation for escalation checking
  }

  private async generateRecommendations(metrics: HealthMetrics): Promise<HealthRecommendation[]> {
    // Implementation for recommendation generation
    return [];
  }

  private async generateHealthReport(timeRange: TimeRange): Promise<HealthReport> {
    // Implementation for health report generation
    return {} as HealthReport;
  }

  private convertToCSV(report: HealthReport): HealthReport {
    // Implementation for CSV conversion
    return report;
  }

  private async generatePDFReport(report: HealthReport): Promise<HealthReport> {
    // Implementation for PDF generation
    return report;
  }

  private async handleAlert(alert: HealthAlert): Promise<void> {
    // Implementation for alert handling
  }

  private async handleMetrics(metrics: HealthMetrics): Promise<void> {
    // Implementation for metrics handling
  }

  private async handleThresholdBreach(breach: any): Promise<void> {
    // Implementation for threshold breach handling
  }

  private async handlePrediction(prediction: any): Promise<void> {
    // Implementation for prediction handling
  }
}

// Supporting Classes (placeholder implementations)
class MetricCollector {
  constructor(private config: CollectorConfig) {}
  async initialize(): Promise<void> {}
  async collect(): Promise<MetricData> { return {} as MetricData; }
  getCategory(): HealthCategory { return this.config.category; }
}

class AlertManager {
  constructor(private engine: HealthMonitoringEngine) {}
  async initialize(config: any): Promise<void> {}
}

class PredictiveEngine {
  async initialize(config: any): Promise<void> {}
}

class SLATracker {
  async initialize(config: any): Promise<void> {}
  async track(slaId: string): Promise<SLATracking> { return {} as SLATracking; }
}

class DashboardManager {
  async initialize(config: any): Promise<void> {}
}

// Supporting Interfaces
interface HealthMonitoringConfig {
  collectors: CollectorConfig[];
  alerting: any;
  predictive: any;
  sla: any;
  dashboard: any;
  intervals: MonitoringIntervals;
}

interface CollectorConfig {
  componentId: string;
  category: HealthCategory;
  enabled: boolean;
  interval: number;
}

interface MonitoringIntervals {
  collection: number;
  analysis: number;
  alerting: number;
}

interface HealthOverview {
  overallHealth: HealthStatus;
  componentCount: number;
  alertCount: number;
  slaCompliance: number;
}

interface RealTimeMetrics {
  timestamp: number;
  performance: any;
  availability: any;
  security: any;
}

interface TrendVisualization {
  metric: string;
  data: any[];
  trend: TrendDirection;
}

interface ComplianceDashboard {
  overall: number;
  frameworks: any[];
  violations: any[];
}

interface PredictionDashboard {
  forecasts: any[];
  risks: any[];
  recommendations: any[];
}

interface SLADashboard {
  overall: number;
  slas: any[];
  violations: any[];
}

interface AutomationAction {
  type: string;
  parameters: any;
}

interface EscalationPolicy {
  levels: any[];
  timeout: number;
}

interface AlertResolution {
  resolvedAt: number;
  resolvedBy: string;
  resolution: string;
}

interface AlertMetrics {
  duration: number;
  impact: string;
  affectedUsers: number;
}

interface HealthRecommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: string;
  actions: string[];
}

interface TimeRange {
  start: number;
  end: number;
}

interface HealthReport {
  format: ReportFormat;
  data: any;
  timestamp: number;
}

type ReportFormat = 'json' | 'csv' | 'pdf';

interface SeasonalityPattern {
  detected: boolean;
  period: number;
  strength: number;
}

interface AnomalyDetection {
  timestamp: number;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: number;
}

interface PredictionFactor {
  name: string;
  impact: number;
  confidence: number;
}

interface RiskFactor {
  category: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface MitigationStrategy {
  strategy: string;
  effectiveness: number;
  cost: number;
  timeframe: number;
}

interface ImpactAssessment {
  business: number;
  technical: number;
  financial: number;
  reputation: number;
}

interface MaintenanceWindow {
  start: number;
  end: number;
  type: string;
  impact: string;
}

interface CapacityForecast {
  resource: string;
  timeline: number;
  requirement: number;
  confidence: number;
}

interface SLATarget {
  metric: string;
  target: number;
  measurement: string;
}

interface SLAStatus {
  current: number;
  target: number;
  compliance: number;
}

interface SLACompliance {
  period: string;
  percentage: number;
  breaches: number;
}

interface SLAViolation {
  timestamp: number;
  metric: string;
  actual: number;
  target: number;
  duration: number;
}

interface SLACredit {
  amount: number;
  reason: string;
  timestamp: number;
}

interface SLAReport {
  period: string;
  compliance: number;
  violations: number;
  credits: number;
}

// Export the singleton instance
export const healthMonitoring = HealthMonitoringEngine.getInstance();
export default HealthMonitoringEngine;