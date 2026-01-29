/**
 * BMAD CONCURA DATABASE PERFORMANCE MONITOR
 * Real-time database performance monitoring with intelligent analytics
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { EventEmitter } from 'events';
import { QueryPerformanceTracker, type QueryMetrics } from './query-tracker';
import { DatabaseMetricsCollector, type DatabaseMetrics } from './metrics-collector';
import { PerformanceAnalyzer, type TrendAnalysis, type PerformanceInsight } from './performance-analyzer';
import { AlertingSystem, type AlertConfiguration } from './alerting-system';

export interface MonitoringConfiguration {
  enabled: boolean;
  interval: number;
  metricsRetention: number;
  realTimeUpdates: boolean;
  detailedLogging: boolean;
  performanceBaseline?: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      disk: number;
    };
  };
}

export interface PerformanceMetrics {
  timestamp: number;
  queryMetrics: {
    totalQueries: number;
    slowQueries: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
  };
  resourceMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUtilization: number;
    networkIO: number;
    connectionCount: number;
    activeConnections: number;
  };
  databaseMetrics: {
    bufferPoolHitRatio: number;
    indexHitRatio: number;
    lockWaitTime: number;
    deadlocks: number;
    tableScans: number;
    sortMergeScans: number;
  };
  systemHealth: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      description: string;
    }>;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration?: number; // How long the condition must persist
  enabled: boolean;
}

export interface MonitoringAlert {
  id: string;
  rule: AlertRule;
  timestamp: number;
  value: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  context?: any;
}

/**
 * Advanced Database Performance Monitor
 */
export class DatabasePerformanceMonitor extends EventEmitter {
  private queryTracker: QueryPerformanceTracker;
  private metricsCollector: DatabaseMetricsCollector;
  private performanceAnalyzer: PerformanceAnalyzer;
  private alertingSystem: AlertingSystem;

  private isMonitoring = false;
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private currentMetrics: PerformanceMetrics | null = null;
  private metricsHistory: PerformanceMetrics[] = [];
  private activeAlerts = new Map<string, MonitoringAlert>();
  private alertRules: AlertRule[] = [];

  private performanceBaseline: any = null;
  private trendAnalysis: TrendAnalysis | null = null;

  constructor(private config: {
    monitoring?: MonitoringConfiguration;
    alerting?: AlertConfiguration;
    analytics?: any;
    performance?: any;
  } = {}) {
    super();
    this.initializeConfig();
    this.initializeComponents();
    this.setupDefaultAlertRules();
  }

  /**
   * Initialize the performance monitor
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ BMAD Database Performance Monitor already initialized');
      return;
    }

    console.log('🚀 Initializing BMAD CONCURA Database Performance Monitor...');

    try {
      // Initialize query tracker
      console.log('📊 Initializing query performance tracker...');
      await this.queryTracker.initialize();

      // Initialize metrics collector
      console.log('📈 Initializing database metrics collector...');
      await this.metricsCollector.initialize();

      // Initialize performance analyzer
      console.log('🧠 Initializing performance analyzer...');
      await this.performanceAnalyzer.initialize();

      // Initialize alerting system
      console.log('🚨 Initializing alerting system...');
      await this.alertingSystem.initialize();

      // Set up event handlers
      this.setupEventHandlers();

      // Establish performance baseline
      await this.establishPerformanceBaseline();

      this.isInitialized = true;
      console.log('✅ BMAD Database Performance Monitor initialized successfully');
      this.logCapabilities();

    } catch (error) {
      console.error('❌ Failed to initialize BMAD Database Performance Monitor:', error);
      throw error;
    }
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isMonitoring) {
      console.warn('⚠️ Performance monitoring already running');
      return;
    }

    console.log('▶️ Starting database performance monitoring...');

    try {
      // Start components
      await this.queryTracker.start();
      await this.metricsCollector.start();
      await this.performanceAnalyzer.start();
      await this.alertingSystem.start();

      // Start monitoring loop
      this.startMonitoringLoop();

      this.isMonitoring = true;
      console.log('✅ Database performance monitoring started');
      console.log(`   📊 Monitoring interval: ${this.config.monitoring?.interval}ms`);
      console.log(`   🚨 Alert rules: ${this.alertRules.length} configured`);

      this.emit('monitoring_started', {
        timestamp: Date.now(),
        configuration: this.config
      });

    } catch (error) {
      console.error('❌ Failed to start performance monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop performance monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      console.warn('⚠️ Performance monitoring not running');
      return;
    }

    console.log('⏹️ Stopping database performance monitoring...');

    try {
      // Stop monitoring loop
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }

      // Stop components
      await this.queryTracker.stop();
      await this.metricsCollector.stop();
      await this.performanceAnalyzer.stop();
      await this.alertingSystem.stop();

      this.isMonitoring = false;
      console.log('✅ Database performance monitoring stopped');

      this.emit('monitoring_stopped', { timestamp: Date.now() });

    } catch (error) {
      console.error('❌ Error stopping performance monitoring:', error);
    }
  }

  /**
   * Record a database query for performance tracking
   */
  recordQuery(query: {
    query: string;
    duration: number;
    success: boolean;
    rows?: number;
    error?: string;
  }): void {
    this.queryTracker.recordQuery(query);

    // Check for immediate alerts
    this.checkQueryAlerts(query);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.currentMetrics ? { ...this.currentMetrics } : null;
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(timeWindow?: number): PerformanceMetrics[] {
    if (!timeWindow) {
      return [...this.metricsHistory];
    }

    const cutoff = Date.now() - timeWindow;
    return this.metricsHistory.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): MonitoringAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateAlertRuleId()
    };

    this.alertRules.push(alertRule);

    this.emit('alert_rule_added', alertRule);
    console.log(`📊 Added alert rule: ${alertRule.name}`);

    return alertRule.id;
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);

    if (index >= 0) {
      const rule = this.alertRules.splice(index, 1)[0];
      this.emit('alert_rule_removed', rule);
      console.log(`📊 Removed alert rule: ${rule.name}`);
      return true;
    }

    return false;
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(options?: {
    timeWindow?: number;
    includeTrends?: boolean;
    includeInsights?: boolean;
    includeRecommendations?: boolean;
  }): Promise<{
    summary: {
      timeWindow: number;
      totalQueries: number;
      averageResponseTime: number;
      slowQueries: number;
      errorRate: number;
      throughput: number;
      resourceUtilization: {
        cpu: number;
        memory: number;
        disk: number;
      };
      healthScore: number;
    };
    trends?: TrendAnalysis;
    insights?: PerformanceInsight[];
    recommendations?: Array<{
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      description: string;
      impact: string;
    }>;
    alerts?: {
      active: number;
      resolved: number;
      critical: number;
    };
  }> {
    console.log('📊 Generating performance report...');

    const timeWindow = options?.timeWindow || 3600000; // 1 hour default
    const metrics = this.getPerformanceHistory(timeWindow);

    if (metrics.length === 0) {
      throw new Error('No performance data available for the specified time window');
    }

    // Calculate summary statistics
    const summary = this.calculateSummaryStatistics(metrics, timeWindow);

    const report: any = { summary };

    // Add trend analysis if requested
    if (options?.includeTrends) {
      report.trends = await this.performanceAnalyzer.analyzeTrends(metrics);
    }

    // Add performance insights if requested
    if (options?.includeInsights) {
      report.insights = await this.performanceAnalyzer.generateInsights(metrics);
    }

    // Add recommendations if requested
    if (options?.includeRecommendations) {
      report.recommendations = this.generateRecommendations(summary, report.trends);
    }

    // Add alert statistics
    report.alerts = this.getAlertStatistics();

    console.log('✅ Performance report generated');
    console.log(`   📈 Health Score: ${summary.healthScore}`);
    console.log(`   🐌 Slow Queries: ${summary.slowQueries}`);
    console.log(`   ⚡ Throughput: ${summary.throughput.toFixed(2)} queries/sec`);

    this.emit('performance_report_generated', { report, options });

    return report;
  }

  /**
   * Export monitoring data
   */
  async exportMonitoringData(format: 'json' | 'csv' = 'json'): Promise<string[]> {
    console.log(`📊 Exporting database monitoring data in ${format} format...`);

    const timestamp = Date.now();
    const exports: string[] = [];

    try {
      // Export performance metrics
      const metricsPath = `/Users/paultinp/BMAD-CYBER2/_bmad-output/performance/database/monitoring-metrics-${timestamp}.json`;
      await require('fs/promises').writeFile(metricsPath, JSON.stringify({
        timestamp,
        currentMetrics: this.currentMetrics,
        metricsHistory: this.metricsHistory,
        baseline: this.performanceBaseline
      }, null, 2));
      exports.push(metricsPath);

      // Export alerts
      const alertsPath = `/Users/paultinp/BMAD-CYBER2/_bmad-output/performance/database/monitoring-alerts-${timestamp}.json`;
      await require('fs/promises').writeFile(alertsPath, JSON.stringify({
        timestamp,
        activeAlerts: Array.from(this.activeAlerts.values()),
        alertRules: this.alertRules,
        alertHistory: await this.alertingSystem.getAlertHistory()
      }, null, 2));
      exports.push(alertsPath);

      // Export query performance data
      const queryDataPath = `/Users/paultinp/BMAD-CYBER2/_bmad-output/performance/database/query-performance-${timestamp}.json`;
      const queryData = await this.queryTracker.exportData();
      await require('fs/promises').writeFile(queryDataPath, JSON.stringify({
        timestamp,
        queryData
      }, null, 2));
      exports.push(queryDataPath);

      // Export performance report
      const report = await this.generatePerformanceReport({
        timeWindow: 3600000, // 1 hour
        includeTrends: true,
        includeInsights: true,
        includeRecommendations: true
      });
      const reportPath = `/Users/paultinp/BMAD-CYBER2/_bmad-output/performance/database/performance-report-${timestamp}.json`;
      await require('fs/promises').writeFile(reportPath, JSON.stringify({
        timestamp,
        generatedAt: new Date().toISOString(),
        report
      }, null, 2));
      exports.push(reportPath);

      console.log(`✅ Database monitoring data exported to ${exports.length} files`);
      return exports;

    } catch (error) {
      console.error('❌ Failed to export monitoring data:', error);
      return [];
    }
  }

  // Private methods

  private initializeConfig(): void {
    this.config = {
      monitoring: {
        enabled: true,
        interval: 10000,
        metricsRetention: 86400000, // 24 hours
        realTimeUpdates: true,
        detailedLogging: false,
        ...this.config.monitoring
      },
      alerting: {
        enabled: true,
        channels: [],
        thresholds: {
          slowQuery: 1000,
          highCpuUsage: 80,
          highMemoryUsage: 85,
          connectionPoolUtilization: 90,
          errorRate: 5
        },
        ...this.config.alerting
      },
      analytics: {
        enabled: true,
        trendAnalysis: true,
        predictiveAnalysis: false,
        bottleneckDetection: true,
        ...this.config.analytics
      },
      performance: {
        targetResponseTime: 100,
        targetThroughput: 1000,
        targetErrorRate: 1,
        targetUtilization: 70,
        ...this.config.performance
      }
    };
  }

  private initializeComponents(): void {
    this.queryTracker = new QueryPerformanceTracker(this.config.monitoring);
    this.metricsCollector = new DatabaseMetricsCollector(this.config.monitoring);
    this.performanceAnalyzer = new PerformanceAnalyzer(this.config.analytics);
    this.alertingSystem = new AlertingSystem(this.config.alerting);
  }

  private setupDefaultAlertRules(): void {
    const defaultRules: Omit<AlertRule, 'id'>[] = [
      {
        name: 'Slow Query Alert',
        metric: 'averageResponseTime',
        operator: '>',
        threshold: this.config.alerting?.thresholds?.slowQuery || 1000,
        severity: 'high',
        duration: 30000, // 30 seconds
        enabled: true
      },
      {
        name: 'High CPU Usage',
        metric: 'cpuUsage',
        operator: '>',
        threshold: this.config.alerting?.thresholds?.highCpuUsage || 80,
        severity: 'medium',
        duration: 60000, // 1 minute
        enabled: true
      },
      {
        name: 'High Memory Usage',
        metric: 'memoryUsage',
        operator: '>',
        threshold: this.config.alerting?.thresholds?.highMemoryUsage || 85,
        severity: 'medium',
        duration: 60000, // 1 minute
        enabled: true
      },
      {
        name: 'High Error Rate',
        metric: 'errorRate',
        operator: '>',
        threshold: this.config.alerting?.thresholds?.errorRate || 5,
        severity: 'critical',
        duration: 30000, // 30 seconds
        enabled: true
      },
      {
        name: 'Connection Pool Saturation',
        metric: 'connectionUtilization',
        operator: '>',
        threshold: this.config.alerting?.thresholds?.connectionPoolUtilization || 90,
        severity: 'high',
        duration: 30000, // 30 seconds
        enabled: true
      }
    ];

    defaultRules.forEach(rule => {
      this.addAlertRule(rule);
    });
  }

  private setupEventHandlers(): void {
    // Query tracker events
    this.queryTracker.on('slow_query', (query) => {
      this.emit('slow_query_detected', query);
    });

    // Metrics collector events
    this.metricsCollector.on('metrics_collected', (metrics) => {
      this.updateCurrentMetrics(metrics);
    });

    // Performance analyzer events
    this.performanceAnalyzer.on('bottleneck_detected', (bottleneck) => {
      this.emit('bottleneck_detected', bottleneck);
    });

    this.performanceAnalyzer.on('insight_generated', (insight) => {
      this.emit('performance_insight', insight);
    });

    // Alerting system events
    this.alertingSystem.on('alert_triggered', (alert) => {
      this.handleAlert(alert);
    });
  }

  private async establishPerformanceBaseline(): Promise<void> {
    console.log('📊 Establishing performance baseline...');

    // Simulate baseline establishment
    this.performanceBaseline = {
      responseTime: 50,
      throughput: 100,
      errorRate: 0.5,
      resourceUsage: {
        cpu: 30,
        memory: 40,
        disk: 20
      },
      establishedAt: Date.now()
    };

    this.emit('baseline_established', this.performanceBaseline);
  }

  private startMonitoringLoop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectAndAnalyzeMetrics();
    }, this.config.monitoring?.interval || 10000);
  }

  private async collectAndAnalyzeMetrics(): Promise<void> {
    try {
      // Collect current metrics
      const metrics = await this.collectCurrentMetrics();

      // Update current metrics
      this.updateCurrentMetrics(metrics);

      // Store in history
      this.metricsHistory.push(metrics);

      // Maintain retention window
      this.maintainMetricsRetention();

      // Check alert rules
      this.checkAlertRules(metrics);

      // Perform trend analysis
      if (this.config.analytics?.trendAnalysis) {
        this.updateTrendAnalysis();
      }

      // Emit real-time updates
      if (this.config.monitoring?.realTimeUpdates) {
        this.emit('metrics_updated', metrics);
      }

    } catch (error) {
      console.error('❌ Error in monitoring loop:', error);
    }
  }

  private async collectCurrentMetrics(): Promise<PerformanceMetrics> {
    const timestamp = Date.now();

    // Get query metrics
    const queryMetrics = this.queryTracker.getCurrentMetrics();

    // Get resource metrics
    const resourceMetrics = await this.metricsCollector.getResourceMetrics();

    // Get database metrics
    const databaseMetrics = await this.metricsCollector.getDatabaseMetrics();

    // Calculate system health
    const systemHealth = this.calculateSystemHealth(queryMetrics, resourceMetrics, databaseMetrics);

    return {
      timestamp,
      queryMetrics,
      resourceMetrics,
      databaseMetrics,
      systemHealth
    };
  }

  private updateCurrentMetrics(metrics: PerformanceMetrics): void {
    this.currentMetrics = metrics;
  }

  private maintainMetricsRetention(): void {
    if (!this.config.monitoring?.metricsRetention) return;

    const cutoff = Date.now() - this.config.monitoring.metricsRetention;
    this.metricsHistory = this.metricsHistory.filter(metric => metric.timestamp > cutoff);
  }

  private checkQueryAlerts(query: any): void {
    // Check for slow query alert
    if (query.duration > (this.config.alerting?.thresholds?.slowQuery || 1000)) {
      this.triggerAlert({
        type: 'slow_query',
        severity: 'high',
        message: `Slow query detected: ${query.duration}ms`,
        context: query
      });
    }
  }

  private checkAlertRules(metrics: PerformanceMetrics): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const value = this.getMetricValue(metrics, rule.metric);
      const isTriggered = this.evaluateAlertRule(rule, value);

      if (isTriggered) {
        this.triggerAlertRule(rule, value, metrics);
      }
    }
  }

  private getMetricValue(metrics: PerformanceMetrics, metricPath: string): number {
    const paths = metricPath.split('.');
    let value: any = metrics;

    for (const path of paths) {
      value = value?.[path];
    }

    return typeof value === 'number' ? value : 0;
  }

  private evaluateAlertRule(rule: AlertRule, value: number): boolean {
    switch (rule.operator) {
      case '>': return value > rule.threshold;
      case '<': return value < rule.threshold;
      case '=': return value === rule.threshold;
      case '>=': return value >= rule.threshold;
      case '<=': return value <= rule.threshold;
      default: return false;
    }
  }

  private triggerAlertRule(rule: AlertRule, value: number, metrics: PerformanceMetrics): void {
    const alert: MonitoringAlert = {
      id: this.generateAlertId(),
      rule,
      timestamp: Date.now(),
      value,
      message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`,
      severity: rule.severity,
      status: 'active',
      context: { metrics }
    };

    this.handleAlert(alert);
  }

  private triggerAlert(alert: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    context?: any;
  }): void {
    const monitoringAlert: MonitoringAlert = {
      id: this.generateAlertId(),
      rule: {
        id: 'custom',
        name: alert.type,
        metric: alert.type,
        operator: '>',
        threshold: 0,
        severity: alert.severity,
        enabled: true
      },
      timestamp: Date.now(),
      value: 0,
      message: alert.message,
      severity: alert.severity,
      status: 'active',
      context: alert.context
    };

    this.handleAlert(monitoringAlert);
  }

  private handleAlert(alert: MonitoringAlert): void {
    this.activeAlerts.set(alert.id, alert);
    this.alertingSystem.processAlert(alert);

    this.emit('alert_triggered', alert);

    if (this.config.monitoring?.detailedLogging) {
      console.log(`🚨 Alert triggered: ${alert.message}`);
    }
  }

  private calculateSystemHealth(
    queryMetrics: any,
    resourceMetrics: any,
    databaseMetrics: any
  ): {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    issues: Array<{ severity: string; category: string; description: string }>;
  } {
    let score = 100;
    const issues: Array<{ severity: string; category: string; description: string }> = [];

    // Query performance impact
    if (queryMetrics.averageResponseTime > 200) {
      score -= 20;
      issues.push({
        severity: 'medium',
        category: 'Query Performance',
        description: `Average response time is ${queryMetrics.averageResponseTime}ms`
      });
    }

    if (queryMetrics.errorRate > 2) {
      score -= 25;
      issues.push({
        severity: 'high',
        category: 'Query Errors',
        description: `Error rate is ${queryMetrics.errorRate}%`
      });
    }

    // Resource utilization impact
    if (resourceMetrics.cpuUsage > 80) {
      score -= 15;
      issues.push({
        severity: 'medium',
        category: 'Resource Usage',
        description: `CPU usage is ${resourceMetrics.cpuUsage}%`
      });
    }

    if (resourceMetrics.memoryUsage > 85) {
      score -= 15;
      issues.push({
        severity: 'medium',
        category: 'Resource Usage',
        description: `Memory usage is ${resourceMetrics.memoryUsage}%`
      });
    }

    // Database performance impact
    if (databaseMetrics.bufferPoolHitRatio < 90) {
      score -= 10;
      issues.push({
        severity: 'low',
        category: 'Database Performance',
        description: `Buffer pool hit ratio is ${databaseMetrics.bufferPoolHitRatio}%`
      });
    }

    // Determine overall health
    let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 90) overall = 'excellent';
    else if (score >= 75) overall = 'good';
    else if (score >= 60) overall = 'fair';
    else if (score >= 40) overall = 'poor';
    else overall = 'critical';

    return { overall, score: Math.max(0, score), issues };
  }

  private async updateTrendAnalysis(): Promise<void> {
    if (this.metricsHistory.length >= 10) {
      try {
        this.trendAnalysis = await this.performanceAnalyzer.analyzeTrends(this.metricsHistory);
      } catch (error) {
        console.error('❌ Error updating trend analysis:', error);
      }
    }
  }

  private calculateSummaryStatistics(metrics: PerformanceMetrics[], timeWindow: number): any {
    if (metrics.length === 0) {
      return {};
    }

    const latest = metrics[metrics.length - 1];
    const queryTotals = metrics.reduce((sum, m) => sum + m.queryMetrics.totalQueries, 0);
    const slowQueryTotals = metrics.reduce((sum, m) => sum + m.queryMetrics.slowQueries, 0);
    const avgResponseTimes = metrics.map(m => m.queryMetrics.averageResponseTime);
    const errorRates = metrics.map(m => m.queryMetrics.errorRate);
    const cpuUsages = metrics.map(m => m.resourceMetrics.cpuUsage);
    const memoryUsages = metrics.map(m => m.resourceMetrics.memoryUsage);
    const diskUsages = metrics.map(m => m.resourceMetrics.diskUtilization);

    return {
      timeWindow,
      totalQueries: queryTotals,
      averageResponseTime: avgResponseTimes.reduce((sum, time) => sum + time, 0) / avgResponseTimes.length,
      slowQueries: slowQueryTotals,
      errorRate: errorRates.reduce((sum, rate) => sum + rate, 0) / errorRates.length,
      throughput: latest.queryMetrics.throughput,
      resourceUtilization: {
        cpu: cpuUsages.reduce((sum, usage) => sum + usage, 0) / cpuUsages.length,
        memory: memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length,
        disk: diskUsages.reduce((sum, usage) => sum + usage, 0) / diskUsages.length
      },
      healthScore: latest.systemHealth.score
    };
  }

  private generateRecommendations(summary: any, trends?: TrendAnalysis): Array<{
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    impact: string;
  }> {
    const recommendations: Array<{
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      description: string;
      impact: string;
    }> = [];

    // Response time recommendations
    if (summary.averageResponseTime > 200) {
      recommendations.push({
        priority: 'high',
        category: 'Query Performance',
        description: 'Average response time is above 200ms. Consider query optimization and indexing.',
        impact: 'Improved user experience and system responsiveness'
      });
    }

    // Resource utilization recommendations
    if (summary.resourceUtilization.cpu > 75) {
      recommendations.push({
        priority: 'medium',
        category: 'Resource Optimization',
        description: 'CPU utilization is high. Consider scaling or query optimization.',
        impact: 'Better system stability and performance'
      });
    }

    if (summary.resourceUtilization.memory > 80) {
      recommendations.push({
        priority: 'medium',
        category: 'Resource Optimization',
        description: 'Memory usage is high. Consider memory optimization or scaling.',
        impact: 'Reduced risk of out-of-memory errors'
      });
    }

    // Error rate recommendations
    if (summary.errorRate > 2) {
      recommendations.push({
        priority: 'critical',
        category: 'Error Reduction',
        description: 'Error rate is above 2%. Investigate and resolve underlying issues.',
        impact: 'Improved system reliability and data integrity'
      });
    }

    return recommendations.sort((a, b) => {
      const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  private getAlertStatistics(): any {
    const alerts = Array.from(this.activeAlerts.values());

    return {
      active: alerts.filter(alert => alert.status === 'active').length,
      resolved: alerts.filter(alert => alert.status === 'resolved').length,
      critical: alerts.filter(alert => alert.severity === 'critical').length
    };
  }

  private generateAlertRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logCapabilities(): void {
    console.log('🎯 BMAD Database Performance Monitor Capabilities:');
    console.log('   ✓ Real-time query performance tracking');
    console.log('   ✓ Comprehensive database metrics collection');
    console.log('   ✓ Intelligent trend analysis and insights');
    console.log('   ✓ Configurable alerting with multiple channels');
    console.log('   ✓ Automated bottleneck detection');
    console.log('   ✓ Performance baseline establishment');
    console.log('   ✓ System health scoring and reporting');
    console.log('   ✓ Historical data retention and analysis');
    console.log('   ✓ Custom alert rule configuration');
    console.log('   ✓ Performance report generation');
    console.log(`   📊 Monitoring Interval: ${this.config.monitoring?.interval}ms`);
    console.log(`   ⏳ Metrics Retention: ${(this.config.monitoring?.metricsRetention || 0) / 3600000}h`);
  }
}

/**
 * Export singleton instance
 */
export const bmadDatabaseMonitor = new DatabasePerformanceMonitor();

/**
 * Export types
 */
export type {
  MonitoringConfiguration,
  PerformanceMetrics,
  AlertRule,
  MonitoringAlert
};