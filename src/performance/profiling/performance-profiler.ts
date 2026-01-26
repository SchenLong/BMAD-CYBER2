/**
 * BMAD CONCURA PERFORMANCE PROFILING FRAMEWORK
 * Advanced performance profiling system for BMAD infrastructure optimization
 * Provides comprehensive performance metrics, bottleneck detection, and optimization insights
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Performance Metric Types
 */
export interface PerformanceMetric {
  id: string;
  name: string;
  category: 'memory' | 'cpu' | 'io' | 'network' | 'database' | 'security' | 'context';
  value: number;
  unit: 'ms' | 'mb' | 'percent' | 'count' | 'bytes/sec' | 'ops/sec';
  timestamp: Date;
  context?: Record<string, any>;
  source: string;
  severity: 'normal' | 'warning' | 'critical';
}

export interface ProfiledOperation {
  operationId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage: {
    before: NodeJS.MemoryUsage;
    after?: NodeJS.MemoryUsage;
    delta?: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  cpuProfile?: CPUProfile;
  metrics: PerformanceMetric[];
  children: ProfiledOperation[];
  parent?: string;
  metadata: Record<string, any>;
}

export interface CPUProfile {
  samples: number[];
  timeDeltas: number[];
  startTime: number;
  endTime: number;
  totalTime: number;
  cpuUsage: number; // percentage
}

export interface PerformanceThresholds {
  memory: {
    heapUsed: number; // MB
    rss: number; // MB
    heapUtilization: number; // percentage
  };
  timing: {
    operationTimeout: number; // ms
    slowOperation: number; // ms
    criticalOperation: number; // ms
  };
  io: {
    fileReadTimeout: number; // ms
    fileWriteTimeout: number; // ms
    networkTimeout: number; // ms
  };
  context: {
    maxContextSize: number; // bytes
    maxContextDepth: number;
    contextProcessingTime: number; // ms
  };
}

/**
 * Advanced Performance Profiler
 * Provides comprehensive performance monitoring and profiling capabilities
 */
export class PerformanceProfiler {
  private static instance: PerformanceProfiler | null = null;
  private profiles: Map<string, ProfiledOperation> = new Map();
  private activeOperations: Set<string> = new Set();
  private observer: PerformanceObserver | null = null;
  private isEnabled = true;
  private thresholds: PerformanceThresholds;
  private outputDirectory: string;
  private sessionId: string;
  private metricsBuffer: PerformanceMetric[] = [];
  private samplingInterval: NodeJS.Timeout | null = null;

  constructor(config?: {
    outputDir?: string;
    thresholds?: Partial<PerformanceThresholds>;
    enabled?: boolean;
    samplingRate?: number; // ms
  }) {
    this.outputDirectory = config?.outputDir || '/Users/paultinp/BMAD-CYBER2/_bmad-output/performance';
    this.sessionId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.isEnabled = config?.enabled ?? true;

    this.thresholds = {
      memory: {
        heapUsed: 256, // MB
        rss: 512, // MB
        heapUtilization: 85, // percentage
        ...config?.thresholds?.memory
      },
      timing: {
        operationTimeout: 5000, // ms
        slowOperation: 100, // ms
        criticalOperation: 1000, // ms
        ...config?.thresholds?.timing
      },
      io: {
        fileReadTimeout: 1000, // ms
        fileWriteTimeout: 2000, // ms
        networkTimeout: 3000, // ms
        ...config?.thresholds?.io
      },
      context: {
        maxContextSize: 1024 * 1024, // 1MB
        maxContextDepth: 10,
        contextProcessingTime: 50, // ms
        ...config?.thresholds?.context
      }
    };

    if (this.isEnabled) {
      this.initializeProfiler();
      this.startSystemMetricsCollection(config?.samplingRate || 1000);
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: any): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler(config);
    }
    return PerformanceProfiler.instance;
  }

  /**
   * Initialize the performance profiler
   */
  private initializeProfiler(): void {
    // Set up performance observer for Node.js performance APIs
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        this.processPerformanceEntry(entry);
      }
    });

    this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });

    // Hook into process events
    process.on('warning', (warning) => {
      if (warning.name === 'MaxListenersExceededWarning' ||
          warning.name === 'DeprecationWarning') {
        this.addMetric({
          id: `warning-${Date.now()}`,
          name: 'process_warning',
          category: 'cpu',
          value: 1,
          unit: 'count',
          timestamp: new Date(),
          source: 'process',
          severity: 'warning',
          context: { warning: warning.message, stack: warning.stack }
        });
      }
    });
  }

  /**
   * Start profiling an operation
   */
  public startProfiling(operationName: string, metadata: Record<string, any> = {}): string {
    if (!this.isEnabled) return '';

    const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();

    const operation: ProfiledOperation = {
      operationId,
      name: operationName,
      startTime,
      memoryUsage: {
        before: memoryBefore
      },
      metrics: [],
      children: [],
      metadata: {
        ...metadata,
        pid: process.pid,
        ppid: process.ppid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    this.profiles.set(operationId, operation);
    this.activeOperations.add(operationId);

    // Start CPU profiling if available
    if (process.cpuUsage) {
      const cpuStart = process.cpuUsage();
      operation.cpuProfile = {
        samples: [],
        timeDeltas: [],
        startTime: Date.now(),
        endTime: 0,
        totalTime: 0,
        cpuUsage: 0
      };
    }

    // Mark the start in Node.js performance API
    performance.mark(`${operationName}-start`);

    return operationId;
  }

  /**
   * Stop profiling an operation
   */
  public stopProfiling(operationId: string): ProfiledOperation | null {
    if (!this.isEnabled || !this.profiles.has(operationId)) return null;

    const operation = this.profiles.get(operationId)!;
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage();

    operation.endTime = endTime;
    operation.duration = endTime - operation.startTime;
    operation.memoryUsage.after = memoryAfter;
    operation.memoryUsage.delta = {
      rss: memoryAfter.rss - operation.memoryUsage.before.rss,
      heapUsed: memoryAfter.heapUsed - operation.memoryUsage.before.heapUsed,
      heapTotal: memoryAfter.heapTotal - operation.memoryUsage.before.heapTotal,
      external: memoryAfter.external - operation.memoryUsage.before.external
    };

    // Complete CPU profiling
    if (operation.cpuProfile && process.cpuUsage) {
      const cpuEnd = process.cpuUsage();
      operation.cpuProfile.endTime = Date.now();
      operation.cpuProfile.totalTime = operation.cpuProfile.endTime - operation.cpuProfile.startTime;
      operation.cpuProfile.cpuUsage = (cpuEnd.user + cpuEnd.system) / (operation.cpuProfile.totalTime * 1000) * 100;
    }

    // Mark the end and measure
    performance.mark(`${operation.name}-end`);
    performance.measure(operation.name, `${operation.name}-start`, `${operation.name}-end`);

    this.activeOperations.delete(operationId);

    // Generate performance metrics
    this.generateOperationMetrics(operation);

    // Check for performance violations
    this.checkPerformanceThresholds(operation);

    return operation;
  }

  /**
   * Profile a function execution
   */
  public async profileFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; profile: ProfiledOperation }> {
    const operationId = this.startProfiling(name, metadata);

    try {
      const result = await fn();
      const profile = this.stopProfiling(operationId)!;
      return { result, profile };
    } catch (error) {
      const profile = this.stopProfiling(operationId);
      if (profile) {
        this.addMetric({
          id: `error-${Date.now()}`,
          name: 'operation_error',
          category: 'cpu',
          value: 1,
          unit: 'count',
          timestamp: new Date(),
          source: name,
          severity: 'critical',
          context: { error: error.message, stack: error.stack }
        });
      }
      throw error;
    }
  }

  /**
   * Profile context processing (CONCURA optimization focus)
   */
  public profileContext(contextData: any, operationName: string = 'context_processing'): PerformanceMetric[] {
    if (!this.isEnabled) return [];

    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Analyze context size and complexity
    const contextJson = JSON.stringify(contextData);
    const contextSize = Buffer.byteLength(contextJson, 'utf8');
    const contextDepth = this.getObjectDepth(contextData);

    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const processingTime = endTime - startTime;

    const metrics: PerformanceMetric[] = [
      {
        id: `context-size-${Date.now()}`,
        name: 'context_size',
        category: 'context',
        value: contextSize,
        unit: 'bytes/sec',
        timestamp: new Date(),
        source: operationName,
        severity: contextSize > this.thresholds.context.maxContextSize ? 'critical' : 'normal'
      },
      {
        id: `context-depth-${Date.now()}`,
        name: 'context_depth',
        category: 'context',
        value: contextDepth,
        unit: 'count',
        timestamp: new Date(),
        source: operationName,
        severity: contextDepth > this.thresholds.context.maxContextDepth ? 'warning' : 'normal'
      },
      {
        id: `context-processing-time-${Date.now()}`,
        name: 'context_processing_time',
        category: 'context',
        value: processingTime,
        unit: 'ms',
        timestamp: new Date(),
        source: operationName,
        severity: processingTime > this.thresholds.context.contextProcessingTime ? 'warning' : 'normal'
      },
      {
        id: `context-memory-delta-${Date.now()}`,
        name: 'context_memory_delta',
        category: 'memory',
        value: endMemory.heapUsed - startMemory.heapUsed,
        unit: 'bytes/sec',
        timestamp: new Date(),
        source: operationName,
        severity: 'normal'
      }
    ];

    metrics.forEach(metric => this.addMetric(metric));
    return metrics;
  }

  /**
   * Add a custom metric
   */
  public addMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metricsBuffer.push(metric);

    // Auto-flush if buffer is getting large
    if (this.metricsBuffer.length > 1000) {
      this.flushMetrics();
    }
  }

  /**
   * Get current system metrics
   */
  public getSystemMetrics(): PerformanceMetric[] {
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const now = new Date();

    return [
      {
        id: `system-heap-used-${Date.now()}`,
        name: 'system_heap_used',
        category: 'memory',
        value: Math.round(memory.heapUsed / 1024 / 1024),
        unit: 'mb',
        timestamp: now,
        source: 'system',
        severity: memory.heapUsed > this.thresholds.memory.heapUsed * 1024 * 1024 ? 'warning' : 'normal'
      },
      {
        id: `system-heap-total-${Date.now()}`,
        name: 'system_heap_total',
        category: 'memory',
        value: Math.round(memory.heapTotal / 1024 / 1024),
        unit: 'mb',
        timestamp: now,
        source: 'system',
        severity: 'normal'
      },
      {
        id: `system-rss-${Date.now()}`,
        name: 'system_rss',
        category: 'memory',
        value: Math.round(memory.rss / 1024 / 1024),
        unit: 'mb',
        timestamp: now,
        source: 'system',
        severity: memory.rss > this.thresholds.memory.rss * 1024 * 1024 ? 'warning' : 'normal'
      },
      {
        id: `system-external-${Date.now()}`,
        name: 'system_external',
        category: 'memory',
        value: Math.round(memory.external / 1024 / 1024),
        unit: 'mb',
        timestamp: now,
        source: 'system',
        severity: 'normal'
      },
      {
        id: `system-uptime-${Date.now()}`,
        name: 'system_uptime',
        category: 'cpu',
        value: Math.round(uptime),
        unit: 'count',
        timestamp: now,
        source: 'system',
        severity: 'normal'
      }
    ];
  }

  /**
   * Get profiling summary
   */
  public getSummary(): {
    totalOperations: number;
    activeOperations: number;
    totalMetrics: number;
    averageOperationTime: number;
    memoryEfficiency: number;
    performanceIssues: number;
    sessionId: string;
  } {
    const operations = Array.from(this.profiles.values());
    const completedOperations = operations.filter(op => op.duration !== undefined);

    const averageTime = completedOperations.length > 0
      ? completedOperations.reduce((sum, op) => sum + (op.duration || 0), 0) / completedOperations.length
      : 0;

    const memoryEfficiency = this.calculateMemoryEfficiency();
    const performanceIssues = this.metricsBuffer.filter(m => m.severity !== 'normal').length;

    return {
      totalOperations: operations.length,
      activeOperations: this.activeOperations.size,
      totalMetrics: this.metricsBuffer.length,
      averageOperationTime: Math.round(averageTime),
      memoryEfficiency: Math.round(memoryEfficiency),
      performanceIssues,
      sessionId: this.sessionId
    };
  }

  /**
   * Export performance data
   */
  public async exportData(format: 'json' | 'csv' | 'flamegraph' = 'json'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-profile-${this.sessionId}-${timestamp}.${format}`;
    const filepath = path.join(this.outputDirectory, filename);

    await fs.mkdir(this.outputDirectory, { recursive: true });

    const data = {
      sessionId: this.sessionId,
      timestamp: new Date(),
      summary: this.getSummary(),
      operations: Array.from(this.profiles.values()),
      metrics: this.metricsBuffer,
      thresholds: this.thresholds,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime()
      }
    };

    switch (format) {
      case 'json':
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        break;
      case 'csv':
        const csv = this.convertToCSV(data);
        await fs.writeFile(filepath, csv);
        break;
      case 'flamegraph':
        const flamegraph = this.generateFlamegraph(data);
        await fs.writeFile(filepath, flamegraph);
        break;
    }

    return filepath;
  }

  /**
   * Reset profiler state
   */
  public reset(): void {
    this.profiles.clear();
    this.activeOperations.clear();
    this.metricsBuffer = [];
    this.sessionId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown profiler
   */
  public shutdown(): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
    }

    this.flushMetrics();
    this.isEnabled = false;
  }

  // Private helper methods

  private processPerformanceEntry(entry: PerformanceEntry): void {
    this.addMetric({
      id: `perf-entry-${Date.now()}`,
      name: entry.name,
      category: 'cpu',
      value: entry.duration,
      unit: 'ms',
      timestamp: new Date(),
      source: 'performance-api',
      severity: entry.duration > this.thresholds.timing.slowOperation ? 'warning' : 'normal',
      context: {
        entryType: entry.entryType,
        startTime: entry.startTime
      }
    });
  }

  private generateOperationMetrics(operation: ProfiledOperation): void {
    const metrics: PerformanceMetric[] = [
      {
        id: `op-duration-${operation.operationId}`,
        name: 'operation_duration',
        category: 'cpu',
        value: operation.duration || 0,
        unit: 'ms',
        timestamp: new Date(),
        source: operation.name,
        severity: (operation.duration || 0) > this.thresholds.timing.slowOperation ? 'warning' : 'normal'
      }
    ];

    if (operation.memoryUsage.delta) {
      metrics.push({
        id: `op-memory-delta-${operation.operationId}`,
        name: 'operation_memory_delta',
        category: 'memory',
        value: Math.round(operation.memoryUsage.delta.heapUsed / 1024),
        unit: 'bytes/sec',
        timestamp: new Date(),
        source: operation.name,
        severity: 'normal'
      });
    }

    metrics.forEach(metric => {
      operation.metrics.push(metric);
      this.addMetric(metric);
    });
  }

  private checkPerformanceThresholds(operation: ProfiledOperation): void {
    const duration = operation.duration || 0;
    const memoryDelta = operation.memoryUsage.delta?.heapUsed || 0;

    if (duration > this.thresholds.timing.criticalOperation) {
      this.addMetric({
        id: `threshold-violation-${Date.now()}`,
        name: 'critical_operation_time',
        category: 'cpu',
        value: duration,
        unit: 'ms',
        timestamp: new Date(),
        source: operation.name,
        severity: 'critical',
        context: { threshold: this.thresholds.timing.criticalOperation }
      });
    }

    if (memoryDelta > 50 * 1024 * 1024) { // 50MB
      this.addMetric({
        id: `memory-leak-${Date.now()}`,
        name: 'potential_memory_leak',
        category: 'memory',
        value: Math.round(memoryDelta / 1024 / 1024),
        unit: 'mb',
        timestamp: new Date(),
        source: operation.name,
        severity: 'critical',
        context: { memoryDelta }
      });
    }
  }

  private startSystemMetricsCollection(interval: number): void {
    this.samplingInterval = setInterval(() => {
      const systemMetrics = this.getSystemMetrics();
      systemMetrics.forEach(metric => this.addMetric(metric));
    }, interval);
  }

  private getObjectDepth(obj: any, depth = 0): number {
    if (depth > 20 || obj === null || typeof obj !== 'object') {
      return depth;
    }

    const depths = Object.values(obj).map(value =>
      this.getObjectDepth(value, depth + 1)
    );

    return Math.max(depth, ...depths);
  }

  private calculateMemoryEfficiency(): number {
    const memory = process.memoryUsage();
    const heapUtilization = (memory.heapUsed / memory.heapTotal) * 100;
    return Math.max(0, 100 - heapUtilization);
  }

  private flushMetrics(): void {
    // In a production environment, this would send metrics to a monitoring system
    // For now, we keep them in memory and include them in exports
  }

  private convertToCSV(data: any): string {
    const headers = ['timestamp', 'name', 'category', 'value', 'unit', 'source', 'severity'];
    const rows = [headers.join(',')];

    for (const metric of data.metrics) {
      const row = [
        metric.timestamp,
        metric.name,
        metric.category,
        metric.value,
        metric.unit,
        metric.source,
        metric.severity
      ];
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  private generateFlamegraph(data: any): string {
    // Simplified flamegraph format for visualization
    const stacks: string[] = [];

    for (const operation of data.operations) {
      if (operation.duration) {
        const stack = `${operation.name} ${operation.duration}`;
        stacks.push(stack);
      }
    }

    return stacks.join('\n');
  }
}

/**
 * Profiler decorator for methods
 */
export function ProfileMethod(target: any, propertyName: string, descriptor: PropertyDescriptor): void {
  const method = descriptor.value;
  const profiler = PerformanceProfiler.getInstance();

  descriptor.value = async function (...args: any[]) {
    const className = target.constructor.name;
    const operationName = `${className}.${propertyName}`;

    return await profiler.profileFunction(
      operationName,
      () => method.apply(this, args),
      { className, methodName: propertyName, args: args.length }
    );
  };
}

/**
 * Export singleton instance
 */
export const performanceProfiler = PerformanceProfiler.getInstance();