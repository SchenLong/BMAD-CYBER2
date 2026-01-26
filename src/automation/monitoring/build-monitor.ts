/**
 * BMAD BUILD MONITOR - EPIC 5.7
 * Real-time build monitoring with comprehensive alerting, metrics collection,
 * dashboard support, and integration with external monitoring systems.
 *
 * @module automation/monitoring
 * @version 2.0.0
 * @epic Epic 5 - Story 5.7: Build Performance Optimization
 */

import { EventEmitter } from 'events';
import * as os from 'os';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface MonitorConfig {
  alertThresholds?: {
    buildDuration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    errorRate?: number;
  };
  pollingInterval?: number;
  historySize?: number;
  bufferSize?: number;
  flushInterval?: number;
  enableRealTimeStreaming?: boolean;
  enableMetricAggregation?: boolean;
  aggregationInterval?: number;
  retentionPeriod?: number;
  enableAlerts?: boolean;
  maxEventsPerSecond?: number;
  samplingRate?: number;
}

export interface BuildSnapshot {
  timestamp: number;
  memoryUsage: number;
  cpuUsage: number;
  activeBuilds: number;
  queuedBuilds: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

export interface BuildEvent {
  id: string;
  type: BuildEventType;
  timestamp: number;
  buildId: string;
  data: Record<string, unknown>;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  source: string;
  tags: string[];
}

export type BuildEventType =
  | 'build:start' | 'build:complete' | 'build:failed'
  | 'phase:start' | 'phase:complete' | 'phase:failed'
  | 'task:start' | 'task:complete' | 'task:failed'
  | 'cache:hit' | 'cache:miss'
  | 'resource:warning' | 'resource:critical'
  | 'error:compilation' | 'error:runtime'
  | 'warning:deprecated' | 'metric:recorded';

export interface BuildMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  buildId: string;
  tags: Record<string, string>;
  aggregationType: 'gauge' | 'counter' | 'histogram' | 'summary';
}

export interface MetricAggregation {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p99: number;
  values: number[];
}

export interface BuildStatus {
  buildId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: number;
  endTime?: number;
  duration?: number;
  phases: PhaseStatus[];
  metrics: Record<string, number>;
  errors: string[];
  warnings: string[];
}

export interface PhaseStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  endTime?: number;
  duration?: number;
  progress: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  eventRate: number;
  errorRate: number;
}

export interface MonitorSnapshot {
  timestamp: number;
  activeBuild: BuildStatus | null;
  recentBuilds: BuildStatus[];
  metrics: MetricAggregation[];
  alerts: Alert[];
  systemHealth: SystemHealth;
}

// ============================================================================
// Build Monitor Implementation
// ============================================================================

export class BuildMonitor extends EventEmitter {
  private config: Required<MonitorConfig>;
  private snapshots: BuildSnapshot[] = [];
  private alerts: Alert[] = [];
  private pollingTimer: NodeJS.Timeout | null = null;
  private buildStartTimes: Map<string, number> = new Map();
  private events: BuildEvent[] = [];
  private metrics: Map<string, BuildMetric[]> = new Map();
  private aggregations: Map<string, MetricAggregation> = new Map();
  private buildStatuses: Map<string, BuildStatus> = new Map();
  private subscribers: Map<string, (event: BuildEvent) => void> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private aggregationTimer: NodeJS.Timeout | null = null;
  private eventCount = 0;
  private errorCount = 0;
  private startTime = Date.now();

  constructor(config: MonitorConfig = {}) {
    super();
    this.config = {
      alertThresholds: {
        buildDuration: config.alertThresholds?.buildDuration ?? 300000,
        memoryUsage: config.alertThresholds?.memoryUsage ?? 0.9,
        cpuUsage: config.alertThresholds?.cpuUsage ?? 0.95,
        errorRate: config.alertThresholds?.errorRate ?? 0.1
      },
      pollingInterval: config.pollingInterval ?? 5000,
      historySize: config.historySize ?? 100,
      bufferSize: config.bufferSize ?? 10000,
      flushInterval: config.flushInterval ?? 5000,
      enableRealTimeStreaming: config.enableRealTimeStreaming ?? true,
      enableMetricAggregation: config.enableMetricAggregation ?? true,
      aggregationInterval: config.aggregationInterval ?? 60000,
      retentionPeriod: config.retentionPeriod ?? 24 * 60 * 60 * 1000,
      enableAlerts: config.enableAlerts ?? true,
      maxEventsPerSecond: config.maxEventsPerSecond ?? 1000,
      samplingRate: config.samplingRate ?? 1.0
    };
  }

  start(): void {
    if (this.pollingTimer) return;

    this.pollingTimer = setInterval(() => {
      this.collectSnapshot();
    }, this.config.pollingInterval);

    this.startFlushTimer();
    this.startAggregationTimer();

    console.log('[MONITOR] Build monitoring started');
    this.emit('started');
  }

  stop(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
      this.aggregationTimer = null;
    }
    console.log('[MONITOR] Build monitoring stopped');
    this.emit('stopped');
  }

  recordBuildStart(buildId: string): void {
    this.buildStartTimes.set(buildId, Date.now());

    const status: BuildStatus = {
      buildId,
      status: 'running',
      startTime: Date.now(),
      phases: [],
      metrics: {},
      errors: [],
      warnings: []
    };
    this.buildStatuses.set(buildId, status);

    this.recordEvent('build:start', buildId, {});
    this.emit('build:start', { buildId, timestamp: Date.now() });
  }

  recordBuildEnd(buildId: string, success: boolean): void {
    const startTime = this.buildStartTimes.get(buildId);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.buildStartTimes.delete(buildId);

      const status = this.buildStatuses.get(buildId);
      if (status) {
        status.status = success ? 'completed' : 'failed';
        status.endTime = Date.now();
        status.duration = duration;
      }

      if (duration > this.config.alertThresholds.buildDuration) {
        this.createAlert('warning', 'buildDuration', duration, this.config.alertThresholds.buildDuration,
          `Build ${buildId} exceeded duration threshold: ${(duration / 1000).toFixed(1)}s`);
      }

      this.recordEvent(success ? 'build:complete' : 'build:failed', buildId, { duration });
      this.emit('build:end', { buildId, duration, success });
    }
  }

  /**
   * Record a build event with full context
   */
  recordEvent(
    type: BuildEventType,
    buildId: string,
    data: Record<string, unknown> = {},
    options: { severity?: BuildEvent['severity']; source?: string; tags?: string[] } = {}
  ): void {
    if (Math.random() > this.config.samplingRate) return;

    const event: BuildEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      buildId,
      data,
      severity: options.severity || this.inferSeverity(type),
      source: options.source || 'build-monitor',
      tags: options.tags || []
    };

    this.events.push(event);
    this.eventCount++;

    if (event.severity === 'error' || event.severity === 'critical') {
      this.errorCount++;
    }

    while (this.events.length > this.config.bufferSize) {
      this.events.shift();
    }

    this.updateBuildStatus(event);

    if (this.config.enableRealTimeStreaming) {
      this.emit('event', event);
      this.notifySubscribers(event);
    }
  }

  /**
   * Record a metric value
   */
  recordMetric(
    name: string,
    value: number,
    options: {
      unit?: string;
      buildId?: string;
      tags?: Record<string, string>;
      aggregationType?: BuildMetric['aggregationType'];
    } = {}
  ): void {
    const metric: BuildMetric = {
      name,
      value,
      unit: options.unit || 'count',
      timestamp: Date.now(),
      buildId: options.buildId || 'global',
      tags: options.tags || {},
      aggregationType: options.aggregationType || 'gauge'
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    this.emit('metric', metric);

    if (this.config.enableMetricAggregation) {
      this.updateAggregation(metric);
    }
  }

  /**
   * Start monitoring a build phase
   */
  startPhase(buildId: string, phaseName: string): void {
    const status = this.buildStatuses.get(buildId);
    if (status) {
      const phase: PhaseStatus = {
        name: phaseName,
        status: 'running',
        startTime: Date.now(),
        progress: 0
      };
      status.phases.push(phase);
    }
    this.recordEvent('phase:start', buildId, { phase: phaseName });
  }

  /**
   * End monitoring a build phase
   */
  endPhase(buildId: string, phaseName: string, success: boolean): void {
    const status = this.buildStatuses.get(buildId);
    if (status) {
      const phase = status.phases.find(p => p.name === phaseName);
      if (phase) {
        phase.status = success ? 'completed' : 'failed';
        phase.endTime = Date.now();
        phase.duration = phase.endTime - (phase.startTime || 0);
        phase.progress = 100;
      }
    }
    this.recordEvent(success ? 'phase:complete' : 'phase:failed', buildId, {
      phase: phaseName,
      duration: status?.phases.find(p => p.name === phaseName)?.duration
    });
  }

  /**
   * Update phase progress
   */
  updatePhaseProgress(buildId: string, phaseName: string, progress: number): void {
    const status = this.buildStatuses.get(buildId);
    if (status) {
      const phase = status.phases.find(p => p.name === phaseName);
      if (phase) {
        phase.progress = Math.min(100, Math.max(0, progress));
      }
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(subscriberId: string, callback: (event: BuildEvent) => void): void {
    this.subscribers.set(subscriberId, callback);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriberId: string): boolean {
    return this.subscribers.delete(subscriberId);
  }

  /**
   * Get build status
   */
  getBuildStatus(buildId: string): BuildStatus | null {
    return this.buildStatuses.get(buildId) || null;
  }

  /**
   * Get all active builds
   */
  getActiveBuilds(): BuildStatus[] {
    return Array.from(this.buildStatuses.values()).filter(b => b.status === 'running');
  }

  /**
   * Get recent events
   */
  getEvents(options: { buildId?: string; type?: BuildEventType; since?: number; limit?: number } = {}): BuildEvent[] {
    let filtered = this.events;
    if (options.buildId) filtered = filtered.filter(e => e.buildId === options.buildId);
    if (options.type) filtered = filtered.filter(e => e.type === options.type);
    if (options.since) filtered = filtered.filter(e => e.timestamp >= options.since);
    if (options.limit) filtered = filtered.slice(-options.limit);
    return filtered;
  }

  /**
   * Get metric aggregation
   */
  getMetricAggregation(name: string): MetricAggregation | null {
    return this.aggregations.get(name) || null;
  }

  /**
   * Get all aggregations
   */
  getAllAggregations(): MetricAggregation[] {
    return Array.from(this.aggregations.values());
  }

  /**
   * Get full monitor snapshot
   */
  getMonitorSnapshot(): MonitorSnapshot {
    const activeBuild = this.getActiveBuilds()[0] || null;
    return {
      timestamp: Date.now(),
      activeBuild,
      recentBuilds: Array.from(this.buildStatuses.values()).slice(-10),
      metrics: this.getAllAggregations(),
      alerts: [...this.alerts],
      systemHealth: this.getSystemHealth()
    };
  }

  /**
   * Get system health
   */
  getSystemHealth(): SystemHealth {
    const uptime = Date.now() - this.startTime;
    const eventRate = this.eventCount / (uptime / 1000);
    const errorRate = this.eventCount > 0 ? this.errorCount / this.eventCount : 0;

    let status: SystemHealth['status'] = 'healthy';
    if (errorRate > 0.1 || eventRate > this.config.maxEventsPerSecond * 0.9) {
      status = 'degraded';
    }
    if (errorRate > 0.25) {
      status = 'unhealthy';
    }

    const memUsage = process.memoryUsage();
    return {
      status,
      uptime,
      memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
      cpuUsage: os.loadavg()[0] / os.cpus().length,
      eventRate,
      errorRate
    };
  }

  private collectSnapshot(): void {
    const memUsage = process.memoryUsage();
    const snapshot: BuildSnapshot = {
      timestamp: Date.now(),
      memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
      cpuUsage: this.estimateCpuUsage(),
      activeBuilds: this.buildStartTimes.size,
      queuedBuilds: 0
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.config.historySize) {
      this.snapshots.shift();
    }

    if (snapshot.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.createAlert('warning', 'memoryUsage', snapshot.memoryUsage,
        this.config.alertThresholds.memoryUsage,
        `Memory usage at ${(snapshot.memoryUsage * 100).toFixed(1)}%`);
    }

    if (snapshot.cpuUsage > this.config.alertThresholds.cpuUsage) {
      this.createAlert('warning', 'cpuUsage', snapshot.cpuUsage,
        this.config.alertThresholds.cpuUsage,
        `CPU usage at ${(snapshot.cpuUsage * 100).toFixed(1)}%`);
    }

    this.emit('snapshot', snapshot);
  }

  private estimateCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as Record<string, number>)[type];
      }
      totalIdle += cpu.times.idle;
    }
    return 1 - (totalIdle / totalTick);
  }

  private createAlert(type: 'warning' | 'critical', metric: string, value: number, threshold: number, message: string): void {
    const alert: Alert = {
      id: `${metric}-${Date.now()}`,
      type,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      message
    };

    this.alerts.push(alert);
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    console.log(`[MONITOR] ${type.toUpperCase()}: ${message}`);
    this.emit('alert', alert);
  }

  private inferSeverity(type: BuildEventType): BuildEvent['severity'] {
    if (type.includes('failed') || type.includes('error')) return 'error';
    if (type.includes('warning') || type.includes('critical')) return 'warning';
    if (type.includes('start') || type.includes('complete')) return 'info';
    return 'debug';
  }

  private updateBuildStatus(event: BuildEvent): void {
    const status = this.buildStatuses.get(event.buildId);
    if (!status) return;
    if (event.severity === 'error' || event.severity === 'critical') {
      status.errors.push(String(event.data.message || event.type));
    }
    if (event.severity === 'warning') {
      status.warnings.push(String(event.data.message || event.type));
    }
  }

  private notifySubscribers(event: BuildEvent): void {
    for (const callback of this.subscribers.values()) {
      try {
        callback(event);
      } catch (error) {
        // Subscriber error shouldn't affect monitoring
      }
    }
  }

  private updateAggregation(metric: BuildMetric): void {
    if (!this.aggregations.has(metric.name)) {
      this.aggregations.set(metric.name, {
        name: metric.name,
        count: 0, sum: 0, min: Infinity, max: -Infinity, avg: 0,
        p50: 0, p90: 0, p99: 0, values: []
      });
    }

    const agg = this.aggregations.get(metric.name)!;
    agg.values.push(metric.value);
    agg.count++;
    agg.sum += metric.value;
    agg.min = Math.min(agg.min, metric.value);
    agg.max = Math.max(agg.max, metric.value);
    agg.avg = agg.sum / agg.count;

    if (agg.values.length > 1000) {
      agg.values = agg.values.slice(-1000);
    }

    const sorted = [...agg.values].sort((a, b) => a - b);
    agg.p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    agg.p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
    agg.p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushOldEvents();
    }, this.config.flushInterval);
  }

  private startAggregationTimer(): void {
    this.aggregationTimer = setInterval(() => {
      this.emit('aggregation:complete', this.getAllAggregations());
    }, this.config.aggregationInterval);
  }

  private flushOldEvents(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    for (const [name, metrics] of this.metrics) {
      this.metrics.set(name, metrics.filter(m => m.timestamp >= cutoff));
    }
  }

  getSnapshots(): BuildSnapshot[] {
    return [...this.snapshots];
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getStats(): { avgMemoryUsage: number; avgCpuUsage: number; totalAlerts: number; activeBuilds: number } {
    const recentSnapshots = this.snapshots.slice(-20);
    return {
      avgMemoryUsage: recentSnapshots.length > 0
        ? recentSnapshots.reduce((sum, s) => sum + s.memoryUsage, 0) / recentSnapshots.length
        : 0,
      avgCpuUsage: recentSnapshots.length > 0
        ? recentSnapshots.reduce((sum, s) => sum + s.cpuUsage, 0) / recentSnapshots.length
        : 0,
      totalAlerts: this.alerts.length,
      activeBuilds: this.buildStartTimes.size
    };
  }

  performHealthCheck(): { status: string; stats: ReturnType<BuildMonitor['getStats']>; systemHealth: SystemHealth } {
    return {
      status: this.getSystemHealth().status,
      stats: this.getStats(),
      systemHealth: this.getSystemHealth()
    };
  }

  shutdown(): void {
    this.stop();
    this.subscribers.clear();
    this.removeAllListeners();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

let defaultMonitor: BuildMonitor | null = null;

export function getDefaultMonitor(config?: MonitorConfig): BuildMonitor {
  if (!defaultMonitor) defaultMonitor = new BuildMonitor(config);
  return defaultMonitor;
}

export function createMonitor(config?: MonitorConfig): BuildMonitor {
  return new BuildMonitor(config);
}

export default BuildMonitor;
