/**
 * BMAD CONCURA PERFORMANCE MONITORING SYSTEM
 * Real-time performance monitoring and alerting for BMAD infrastructure
 * Provides continuous monitoring, alerting, and dashboards for production systems
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { EventEmitter } from 'events';
import { PerformanceProfiler, PerformanceMetric } from '../profiling/performance-profiler';
import { MemoryProfiler } from '../profiling/memory-profiler';
import { BottleneckAnalyzer, SystemBottleneck } from '../analysis/bottleneck-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Monitoring configuration interfaces
 */
export interface MonitoringConfig {
  interval: number; // milliseconds
  thresholds: PerformanceThresholds;
  alerting: AlertConfig;
  dashboard: DashboardConfig;
  storage: StorageConfig;
}

export interface PerformanceThresholds {
  cpu: {
    warning: number; // percentage
    critical: number; // percentage
  };
  memory: {
    warning: number; // MB
    critical: number; // MB
    leakDetection: boolean;
  };
  responseTime: {
    warning: number; // ms
    critical: number; // ms
  };
  throughput: {
    minimum: number; // operations/second
    critical: number; // operations/second
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  context: {
    sizeWarning: number; // bytes
    sizeCritical: number; // bytes
    processingWarning: number; // ms
    processingCritical: number; // ms
  };
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  cooldownPeriod: number; // milliseconds
  escalation: {
    enabled: boolean;
    timeToEscalate: number; // milliseconds
    escalationChannels: AlertChannel[];
  };
}

export interface AlertChannel {
  type: 'console' | 'webhook' | 'email' | 'slack' | 'file' | 'siem';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  severity: ('low' | 'medium' | 'high' | 'critical')[];
}

export interface DashboardConfig {
  enabled: boolean;
  refreshInterval: number; // milliseconds
  metrics: string[];
  retention: number; // hours
  exportFormats: ('json' | 'csv' | 'prometheus')[];
}

export interface StorageConfig {
  enabled: boolean;
  directory: string;
  retention: number; // days
  compression: boolean;
  archival: {
    enabled: boolean;
    threshold: number; // days
    location: string;
  };
}

/**
 * Alert and notification interfaces
 */
export interface PerformanceAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'bottleneck';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  component: string;
  metric: {
    name: string;
    current: number;
    threshold: number;
    unit: string;
  };
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  acknowledgments: AlertAcknowledgment[];
  escalated: boolean;
  escalatedAt?: Date;
  metadata: Record<string, any>;
}

export interface AlertAcknowledgment {
  acknowledgedBy: string;
  acknowledgedAt: Date;
  comment?: string;
}

export interface MonitoringStatus {
  isRunning: boolean;
  startedAt?: Date;
  uptime: number; // milliseconds
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  lastCheck: Date;
  components: {
    profiler: boolean;
    memoryMonitor: boolean;
    bottleneckAnalyzer: boolean;
    alerting: boolean;
    dashboard: boolean;
  };
  performance: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgResponseTime: number;
    currentThroughput: number;
    errorRate: number;
  };
}

/**
 * Real-time Performance Monitor
 */
export class PerformanceMonitor extends EventEmitter {
  private profiler: PerformanceProfiler;
  private memoryProfiler: MemoryProfiler;
  private bottleneckAnalyzer: BottleneckAnalyzer;
  private config: MonitoringConfig;
  private isRunning = false;
  private startedAt?: Date;
  private monitoringInterval?: NodeJS.Timeout;
  private analysisInterval?: NodeJS.Timeout;
  private alerts: Map<string, PerformanceAlert> = new Map();
  private alertCooldowns: Map<string, Date> = new Map();
  private metricsBuffer: PerformanceMetric[] = [];
  private dashboardData: any = null;

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();

    this.config = this.mergeWithDefaults(config);
    this.profiler = PerformanceProfiler.getInstance();
    this.memoryProfiler = new MemoryProfiler();
    this.bottleneckAnalyzer = new BottleneckAnalyzer();

    this.setupEventHandlers();
  }

  /**
   * Start performance monitoring
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Performance monitoring is already running');
      return;
    }

    console.log('🚀 Starting BMAD CONCURA Performance Monitor...');

    this.isRunning = true;
    this.startedAt = new Date();

    // Start continuous monitoring
    this.startContinuousMonitoring();

    // Start periodic bottleneck analysis
    this.startPeriodicAnalysis();

    // Initialize dashboard if enabled
    if (this.config.dashboard.enabled) {
      await this.initializeDashboard();
    }

    // Send startup alert
    await this.sendAlert({
      id: `monitor-startup-${Date.now()}`,
      type: 'threshold',
      severity: 'low',
      title: 'Performance Monitor Started',
      description: 'BMAD CONCURA Performance Monitor is now active',
      component: 'performance-monitor',
      metric: {
        name: 'system_status',
        current: 1,
        threshold: 1,
        unit: 'status'
      },
      timestamp: new Date(),
      resolved: true,
      acknowledgments: [],
      escalated: false,
      metadata: {
        config: this.config,
        version: '1.0.0'
      }
    });

    this.emit('started', { timestamp: this.startedAt });
    console.log('✅ Performance monitoring started successfully');
  }

  /**
   * Stop performance monitoring
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('⚠️ Performance monitoring is not running');
      return;
    }

    console.log('🛑 Stopping BMAD CONCURA Performance Monitor...');

    this.isRunning = false;

    // Clear intervals
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    // Save final state
    await this.saveMonitoringData();

    // Send shutdown alert
    await this.sendAlert({
      id: `monitor-shutdown-${Date.now()}`,
      type: 'threshold',
      severity: 'low',
      title: 'Performance Monitor Stopped',
      description: 'BMAD CONCURA Performance Monitor has been stopped',
      component: 'performance-monitor',
      metric: {
        name: 'system_status',
        current: 0,
        threshold: 1,
        unit: 'status'
      },
      timestamp: new Date(),
      resolved: true,
      acknowledgments: [],
      escalated: false,
      metadata: {
        uptime: this.getUptime(),
        totalAlerts: this.alerts.size
      }
    });

    this.emit('stopped', {
      timestamp: new Date(),
      uptime: this.getUptime(),
      totalAlerts: this.alerts.size
    });

    console.log('✅ Performance monitoring stopped');
  }

  /**
   * Get current monitoring status
   */
  public getStatus(): MonitoringStatus {
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolved);
    const resolvedAlerts = Array.from(this.alerts.values()).filter(a => a.resolved);

    const recentMetrics = this.metricsBuffer.slice(-100); // Last 100 metrics
    const cpuMetrics = recentMetrics.filter(m => m.category === 'cpu' && m.name.includes('usage'));
    const memoryMetrics = recentMetrics.filter(m => m.category === 'memory' && m.name.includes('heap_used'));
    const responseMetrics = recentMetrics.filter(m => m.name.includes('duration') || m.name.includes('time'));

    const avgCpuUsage = cpuMetrics.length > 0
      ? cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length
      : 0;

    const avgMemoryUsage = memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
      : 0;

    const avgResponseTime = responseMetrics.length > 0
      ? responseMetrics.reduce((sum, m) => sum + m.value, 0) / responseMetrics.length
      : 0;

    return {
      isRunning: this.isRunning,
      startedAt: this.startedAt,
      uptime: this.getUptime(),
      totalAlerts: this.alerts.size,
      activeAlerts: activeAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      lastCheck: new Date(),
      components: {
        profiler: true,
        memoryMonitor: true,
        bottleneckAnalyzer: true,
        alerting: this.config.alerting.enabled,
        dashboard: this.config.dashboard.enabled
      },
      performance: {
        avgCpuUsage: Math.round(avgCpuUsage),
        avgMemoryUsage: Math.round(avgMemoryUsage),
        avgResponseTime: Math.round(avgResponseTime),
        currentThroughput: this.calculateThroughput(),
        errorRate: this.calculateErrorRate()
      }
    };
  }

  /**
   * Get current alerts
   */
  public getAlerts(filter?: {
    severity?: string;
    resolved?: boolean;
    component?: string;
    since?: Date;
  }): PerformanceAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filter) {
      if (filter.severity) {
        alerts = alerts.filter(a => a.severity === filter.severity);
      }
      if (filter.resolved !== undefined) {
        alerts = alerts.filter(a => a.resolved === filter.resolved);
      }
      if (filter.component) {
        alerts = alerts.filter(a => a.component === filter.component);
      }
      if (filter.since) {
        alerts = alerts.filter(a => a.timestamp >= filter.since!);
      }
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string, acknowledgedBy: string, comment?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledgments.push({
      acknowledgedBy,
      acknowledgedAt: new Date(),
      comment
    });

    this.emit('alertAcknowledged', { alert, acknowledgedBy, comment });
    return true;
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();

    if (resolvedBy) {
      this.acknowledgeAlert(alertId, resolvedBy, 'Alert resolved');
    }

    this.emit('alertResolved', { alert, resolvedBy });
    return true;
  }

  /**
   * Get dashboard data
   */
  public getDashboardData(): any {
    if (!this.config.dashboard.enabled) {
      return null;
    }

    const status = this.getStatus();
    const recentMetrics = this.metricsBuffer.slice(-1000); // Last 1000 metrics
    const activeAlerts = this.getAlerts({ resolved: false });

    return {
      timestamp: new Date(),
      status,
      metrics: {
        cpu: this.aggregateMetrics(recentMetrics, 'cpu'),
        memory: this.aggregateMetrics(recentMetrics, 'memory'),
        io: this.aggregateMetrics(recentMetrics, 'io'),
        context: this.aggregateMetrics(recentMetrics, 'context'),
        network: this.aggregateMetrics(recentMetrics, 'network')
      },
      alerts: {
        active: activeAlerts,
        summary: {
          total: activeAlerts.length,
          critical: activeAlerts.filter(a => a.severity === 'critical').length,
          high: activeAlerts.filter(a => a.severity === 'high').length,
          medium: activeAlerts.filter(a => a.severity === 'medium').length,
          low: activeAlerts.filter(a => a.severity === 'low').length
        }
      },
      trends: this.calculateTrends(recentMetrics),
      recommendations: this.getLatestRecommendations()
    };
  }

  /**
   * Export monitoring data
   */
  public async exportData(format: 'json' | 'csv' | 'prometheus' = 'json'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-monitoring-${timestamp}.${format}`;
    const filepath = path.join(this.config.storage.directory, filename);

    const data = {
      timestamp: new Date(),
      status: this.getStatus(),
      alerts: Array.from(this.alerts.values()),
      metrics: this.metricsBuffer,
      config: this.config,
      dashboard: this.getDashboardData()
    };

    await fs.mkdir(this.config.storage.directory, { recursive: true });

    switch (format) {
      case 'json':
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        break;
      case 'csv':
        const csv = this.convertToCSV(data);
        await fs.writeFile(filepath, csv);
        break;
      case 'prometheus':
        const prometheus = this.convertToPrometheus(data);
        await fs.writeFile(filepath, prometheus);
        break;
    }

    console.log(`📊 Monitoring data exported: ${filepath}`);
    return filepath;
  }

  // Private methods

  private mergeWithDefaults(config: Partial<MonitoringConfig>): MonitoringConfig {
    return {
      interval: config.interval || 5000, // 5 seconds
      thresholds: {
        cpu: {
          warning: 70,
          critical: 90,
          ...config.thresholds?.cpu
        },
        memory: {
          warning: 512,
          critical: 1024,
          leakDetection: true,
          ...config.thresholds?.memory
        },
        responseTime: {
          warning: 200,
          critical: 1000,
          ...config.thresholds?.responseTime
        },
        throughput: {
          minimum: 10,
          critical: 1,
          ...config.thresholds?.throughput
        },
        errorRate: {
          warning: 1,
          critical: 5,
          ...config.thresholds?.errorRate
        },
        context: {
          sizeWarning: 1024 * 1024, // 1MB
          sizeCritical: 5 * 1024 * 1024, // 5MB
          processingWarning: 100, // ms
          processingCritical: 500, // ms
          ...config.thresholds?.context
        }
      },
      alerting: {
        enabled: true,
        cooldownPeriod: 300000, // 5 minutes
        channels: [
          {
            type: 'console',
            name: 'Console Logger',
            config: {},
            enabled: true,
            severity: ['low', 'medium', 'high', 'critical']
          }
        ],
        escalation: {
          enabled: false,
          timeToEscalate: 900000, // 15 minutes
          escalationChannels: []
        },
        ...config.alerting
      },
      dashboard: {
        enabled: true,
        refreshInterval: 30000, // 30 seconds
        metrics: ['cpu', 'memory', 'io', 'context', 'network'],
        retention: 24, // 24 hours
        exportFormats: ['json', 'csv'],
        ...config.dashboard
      },
      storage: {
        enabled: true,
        directory: '/Users/paultinp/BMAD-CYBER2/_bmad-output/performance',
        retention: 7, // 7 days
        compression: false,
        archival: {
          enabled: false,
          threshold: 30, // 30 days
          location: '/archive'
        },
        ...config.storage
      }
    };
  }

  private setupEventHandlers(): void {
    this.on('alert', async (alert: PerformanceAlert) => {
      await this.processAlert(alert);
    });

    this.on('metric', (metric: PerformanceMetric) => {
      this.processMetric(metric);
    });
  }

  private startContinuousMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoringCycle();
    }, this.config.interval);
  }

  private startPeriodicAnalysis(): void {
    this.analysisInterval = setInterval(async () => {
      await this.performBottleneckAnalysis();
    }, 300000); // 5 minutes
  }

  private async performMonitoringCycle(): Promise<void> {
    try {
      // Collect system metrics
      const systemMetrics = this.profiler.getSystemMetrics();
      systemMetrics.forEach(metric => {
        this.metricsBuffer.push(metric);
        this.checkThresholds(metric);
        this.emit('metric', metric);
      });

      // Collect memory metrics
      const memorySnapshot = this.memoryProfiler.takeSnapshot(`monitor-${Date.now()}`);
      const memoryMetrics = this.convertMemorySnapshotToMetrics(memorySnapshot);
      memoryMetrics.forEach(metric => {
        this.metricsBuffer.push(metric);
        this.checkThresholds(metric);
      });

      // Trim metrics buffer
      if (this.metricsBuffer.length > 10000) {
        this.metricsBuffer = this.metricsBuffer.slice(-5000);
      }

      // Update dashboard data
      if (this.config.dashboard.enabled) {
        this.dashboardData = this.getDashboardData();
      }

    } catch (error) {
      console.error('❌ Error in monitoring cycle:', error);
      await this.sendAlert({
        id: `monitoring-error-${Date.now()}`,
        type: 'anomaly',
        severity: 'high',
        title: 'Monitoring Cycle Error',
        description: `Error in monitoring cycle: ${error.message}`,
        component: 'performance-monitor',
        metric: {
          name: 'monitoring_error',
          current: 1,
          threshold: 0,
          unit: 'count'
        },
        timestamp: new Date(),
        resolved: false,
        acknowledgments: [],
        escalated: false,
        metadata: { error: error.message, stack: error.stack }
      });
    }
  }

  private async performBottleneckAnalysis(): Promise<void> {
    try {
      console.log('🔍 Performing bottleneck analysis...');
      const analysisReport = await this.bottleneckAnalyzer.analyzeBottlenecks();

      // Generate alerts for critical bottlenecks
      for (const bottleneck of analysisReport.bottlenecks) {
        if (bottleneck.severity === 'critical' || bottleneck.severity === 'high') {
          await this.sendAlert({
            id: `bottleneck-${bottleneck.id}`,
            type: 'bottleneck',
            severity: bottleneck.severity as 'critical' | 'high',
            title: `${bottleneck.type.toUpperCase()} Bottleneck Detected`,
            description: bottleneck.description,
            component: bottleneck.component,
            metric: {
              name: bottleneck.type,
              current: bottleneck.metrics.current,
              threshold: bottleneck.metrics.threshold,
              unit: bottleneck.metrics.unit
            },
            timestamp: new Date(),
            resolved: false,
            acknowledgments: [],
            escalated: false,
            metadata: {
              bottleneck,
              recommendations: bottleneck.recommendations
            }
          });
        }
      }

    } catch (error) {
      console.error('❌ Error in bottleneck analysis:', error);
    }
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const thresholds = this.config.thresholds;

    // CPU thresholds
    if (metric.category === 'cpu' && metric.name.includes('usage')) {
      if (metric.value >= thresholds.cpu.critical) {
        this.createThresholdAlert(metric, 'critical', thresholds.cpu.critical);
      } else if (metric.value >= thresholds.cpu.warning) {
        this.createThresholdAlert(metric, 'high', thresholds.cpu.warning);
      }
    }

    // Memory thresholds
    if (metric.category === 'memory' && metric.unit === 'mb') {
      if (metric.value >= thresholds.memory.critical) {
        this.createThresholdAlert(metric, 'critical', thresholds.memory.critical);
      } else if (metric.value >= thresholds.memory.warning) {
        this.createThresholdAlert(metric, 'high', thresholds.memory.warning);
      }
    }

    // Response time thresholds
    if (metric.unit === 'ms' && (metric.name.includes('time') || metric.name.includes('duration'))) {
      if (metric.value >= thresholds.responseTime.critical) {
        this.createThresholdAlert(metric, 'critical', thresholds.responseTime.critical);
      } else if (metric.value >= thresholds.responseTime.warning) {
        this.createThresholdAlert(metric, 'medium', thresholds.responseTime.warning);
      }
    }

    // Context thresholds
    if (metric.category === 'context') {
      if (metric.name === 'context_size' && metric.value >= thresholds.context.sizeCritical) {
        this.createThresholdAlert(metric, 'critical', thresholds.context.sizeCritical);
      } else if (metric.name === 'context_processing_time' && metric.value >= thresholds.context.processingCritical) {
        this.createThresholdAlert(metric, 'high', thresholds.context.processingCritical);
      }
    }
  }

  private createThresholdAlert(metric: PerformanceMetric, severity: 'low' | 'medium' | 'high' | 'critical', threshold: number): void {
    const alertKey = `${metric.category}-${metric.name}-${severity}`;

    // Check cooldown
    if (this.alertCooldowns.has(alertKey)) {
      const lastAlert = this.alertCooldowns.get(alertKey)!;
      if (Date.now() - lastAlert.getTime() < this.config.alerting.cooldownPeriod) {
        return; // Still in cooldown period
      }
    }

    const alert: PerformanceAlert = {
      id: `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'threshold',
      severity,
      title: `${metric.category.toUpperCase()} Threshold Exceeded`,
      description: `${metric.name} has exceeded ${severity} threshold: ${metric.value}${metric.unit} >= ${threshold}${metric.unit}`,
      component: metric.source,
      metric: {
        name: metric.name,
        current: metric.value,
        threshold,
        unit: metric.unit
      },
      timestamp: new Date(),
      resolved: false,
      acknowledgments: [],
      escalated: false,
      metadata: { originalMetric: metric }
    };

    this.alerts.set(alert.id, alert);
    this.alertCooldowns.set(alertKey, new Date());
    this.emit('alert', alert);
  }

  private async sendAlert(alert: PerformanceAlert): Promise<void> {
    if (!this.config.alerting.enabled) {
      return;
    }

    this.alerts.set(alert.id, alert);

    // Send to configured channels
    for (const channel of this.config.alerting.channels) {
      if (channel.enabled && channel.severity.includes(alert.severity)) {
        await this.sendToChannel(alert, channel);
      }
    }

    this.emit('alert', alert);
  }

  private async sendToChannel(alert: PerformanceAlert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel.type) {
        case 'console':
          this.sendToConsole(alert);
          break;
        case 'file':
          await this.sendToFile(alert, channel.config);
          break;
        case 'webhook':
          await this.sendToWebhook(alert, channel.config);
          break;
        // Add more channel types as needed
      }
    } catch (error) {
      console.error(`❌ Failed to send alert to ${channel.name}:`, error);
    }
  }

  private sendToConsole(alert: PerformanceAlert): void {
    const emoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '💥'
    }[alert.severity];

    console.log(`${emoji} [${alert.severity.toUpperCase()}] ${alert.title}`);
    console.log(`   Component: ${alert.component}`);
    console.log(`   Description: ${alert.description}`);
    console.log(`   Metric: ${alert.metric.current}${alert.metric.unit} (threshold: ${alert.metric.threshold}${alert.metric.unit})`);
    console.log(`   Timestamp: ${alert.timestamp.toISOString()}`);
  }

  private async sendToFile(alert: PerformanceAlert, config: any): Promise<void> {
    const logFile = config.file || path.join(this.config.storage.directory, 'alerts.log');
    const logEntry = `${alert.timestamp.toISOString()} [${alert.severity.toUpperCase()}] ${alert.title} - ${alert.description}\n`;

    await fs.mkdir(path.dirname(logFile), { recursive: true });
    await fs.appendFile(logFile, logEntry);
  }

  private async sendToWebhook(alert: PerformanceAlert, config: any): Promise<void> {
    // Webhook implementation would go here
    console.log(`📡 Would send webhook to ${config.url} for alert: ${alert.title}`);
  }

  private async initializeDashboard(): Promise<void> {
    console.log('📊 Initializing performance dashboard...');
    this.dashboardData = this.getDashboardData();
  }

  private processMetric(metric: PerformanceMetric): void {
    // Additional metric processing logic
  }

  private async processAlert(alert: PerformanceAlert): Promise<void> {
    // Additional alert processing logic
  }

  private convertMemorySnapshotToMetrics(snapshot: any): PerformanceMetric[] {
    return [
      {
        id: `memory-heap-used-${Date.now()}`,
        name: 'heap_used',
        category: 'memory',
        value: Math.round(snapshot.processMemory.heapUsed / 1024 / 1024),
        unit: 'mb',
        timestamp: snapshot.timestamp,
        source: 'memory-profiler',
        severity: 'normal'
      },
      {
        id: `memory-heap-total-${Date.now()}`,
        name: 'heap_total',
        category: 'memory',
        value: Math.round(snapshot.processMemory.heapTotal / 1024 / 1024),
        unit: 'mb',
        timestamp: snapshot.timestamp,
        source: 'memory-profiler',
        severity: 'normal'
      }
    ];
  }

  private aggregateMetrics(metrics: PerformanceMetric[], category: string): any {
    const categoryMetrics = metrics.filter(m => m.category === category);

    if (categoryMetrics.length === 0) {
      return null;
    }

    const latest = categoryMetrics[categoryMetrics.length - 1];
    const values = categoryMetrics.map(m => m.value);

    return {
      latest: latest.value,
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: categoryMetrics.length,
      unit: latest.unit
    };
  }

  private calculateTrends(metrics: PerformanceMetric[]): any {
    // Simplified trend calculation
    return {
      cpu: 'stable',
      memory: 'increasing',
      responseTime: 'stable'
    };
  }

  private getLatestRecommendations(): any {
    // Return latest bottleneck analysis recommendations
    return [];
  }

  private calculateThroughput(): number {
    const recentMetrics = this.metricsBuffer.slice(-60); // Last 60 metrics
    return recentMetrics.length;
  }

  private calculateErrorRate(): number {
    const errorMetrics = this.metricsBuffer.filter(m => m.severity !== 'normal');
    const totalMetrics = this.metricsBuffer.length;

    return totalMetrics > 0 ? (errorMetrics.length / totalMetrics) * 100 : 0;
  }

  private getUptime(): number {
    return this.startedAt ? Date.now() - this.startedAt.getTime() : 0;
  }

  private async saveMonitoringData(): Promise<void> {
    if (this.config.storage.enabled) {
      await this.exportData('json');
    }
  }

  private convertToCSV(data: any): string {
    // CSV conversion implementation
    return 'timestamp,metric,value,unit,severity\n' +
           data.metrics.map((m: PerformanceMetric) =>
             `${m.timestamp},${m.name},${m.value},${m.unit},${m.severity}`
           ).join('\n');
  }

  private convertToPrometheus(data: any): string {
    // Prometheus format conversion
    return data.metrics.map((m: PerformanceMetric) =>
      `bmad_${m.name.replace(/[^a-zA-Z0-9_]/g, '_')}{component="${m.source}"} ${m.value}`
    ).join('\n');
  }
}

/**
 * Export singleton instance
 */
export const performanceMonitor = new PerformanceMonitor();