/**
 * Resource Optimizer
 * Epic 5.7 - Build Performance Optimization
 *
 * Intelligent resource management and optimization for build processes,
 * including memory management, CPU allocation, and I/O optimization.
 */

import { EventEmitter } from 'events';
import * as os from 'os';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ResourceSnapshot {
  timestamp: number;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  process: ProcessMetrics;
}

export interface CpuMetrics {
  usage: number;
  userTime: number;
  systemTime: number;
  idleTime: number;
  loadAverage: number[];
  coreUsage: number[];
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  rss: number;
  buffers: number;
  cached: number;
}

export interface DiskMetrics {
  readBytes: number;
  writeBytes: number;
  readOps: number;
  writeOps: number;
  utilizationPercent: number;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  connections: number;
}

export interface ProcessMetrics {
  pid: number;
  uptime: number;
  cpuUsage: NodeJS.CpuUsage;
  memoryUsage: NodeJS.MemoryUsage;
  handles: number;
  threads: number;
}

export interface ResourceAllocation {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network';
  amount: number;
  priority: number;
  owner: string;
  startTime: number;
  timeout: number;
  exclusive: boolean;
}

export interface ResourceBudget {
  cpu: { maxUsage: number; reserved: number };
  memory: { maxUsage: number; reserved: number; gcThreshold: number };
  disk: { maxReadMBps: number; maxWriteMBps: number; reserved: number };
  network: { maxBandwidthMBps: number; reserved: number };
}

export interface OptimizationRule {
  id: string;
  name: string;
  condition: (snapshot: ResourceSnapshot) => boolean;
  action: (optimizer: ResourceOptimizer) => Promise<OptimizationResult>;
  cooldown: number;
  enabled: boolean;
  priority: number;
}

export interface OptimizationResult {
  rule: string;
  action: string;
  success: boolean;
  impact: ResourceImpact;
  message: string;
}

export interface ResourceImpact {
  cpuChange: number;
  memoryChange: number;
  diskChange: number;
  networkChange: number;
}

export interface ResourceLimit {
  type: 'soft' | 'hard';
  resource: 'cpu' | 'memory' | 'disk' | 'network';
  limit: number;
  action: 'warn' | 'throttle' | 'reject' | 'gc';
}

export interface ResourceOptimizerConfig {
  samplingInterval: number;
  historySize: number;
  enableAutoOptimization: boolean;
  cpuThrottleThreshold: number;
  memoryThreshold: number;
  gcTriggerThreshold: number;
  diskIoThreshold: number;
  networkThreshold: number;
  enablePrediction: boolean;
  predictionWindow: number;
}

export interface ResourceForecast {
  timestamp: number;
  cpu: number;
  memory: number;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ThrottleState {
  isThrottled: boolean;
  reason: string;
  level: number;
  startTime: number;
  estimatedDuration: number;
}

// ============================================================================
// Resource Optimizer Implementation
// ============================================================================

export class ResourceOptimizer extends EventEmitter {
  private config: ResourceOptimizerConfig;
  private history: ResourceSnapshot[] = [];
  private allocations: Map<string, ResourceAllocation> = new Map();
  private budget: ResourceBudget;
  private rules: Map<string, OptimizationRule> = new Map();
  private limits: ResourceLimit[] = [];
  private throttleState: ThrottleState;
  private samplingTimer: NodeJS.Timeout | null = null;
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private ruleLastExecution: Map<string, number> = new Map();

  constructor(config: Partial<ResourceOptimizerConfig> = {}) {
    super();
    this.config = {
      samplingInterval: 1000,
      historySize: 300,
      enableAutoOptimization: true,
      cpuThrottleThreshold: 90,
      memoryThreshold: 85,
      gcTriggerThreshold: 80,
      diskIoThreshold: 80,
      networkThreshold: 80,
      enablePrediction: true,
      predictionWindow: 60,
      ...config
    };
    this.budget = this.createDefaultBudget();
    this.throttleState = { isThrottled: false, reason: '', level: 0, startTime: 0, estimatedDuration: 0 };
    this.initializeDefaultRules();
  }

  /**
   * Start resource monitoring
   */
  public start(): void {
    if (this.samplingTimer) return;

    this.lastCpuUsage = process.cpuUsage();
    this.samplingTimer = setInterval(async () => {
      const snapshot = await this.collectSnapshot();
      this.history.push(snapshot);

      if (this.history.length > this.config.historySize) {
        this.history.shift();
      }

      this.emit('snapshot', snapshot);
      this.checkLimits(snapshot);

      if (this.config.enableAutoOptimization) {
        await this.runOptimizationRules(snapshot);
      }
    }, this.config.samplingInterval);

    this.emit('started');
  }

  /**
   * Stop resource monitoring
   */
  public stop(): void {
    if (this.samplingTimer) {
      clearInterval(this.samplingTimer);
      this.samplingTimer = null;
    }
    this.emit('stopped');
  }

  /**
   * Get current resource snapshot
   */
  public async getSnapshot(): Promise<ResourceSnapshot> {
    return this.collectSnapshot();
  }

  /**
   * Get resource history
   */
  public getHistory(duration?: number): ResourceSnapshot[] {
    if (!duration) return [...this.history];

    const cutoff = Date.now() - duration;
    return this.history.filter(s => s.timestamp >= cutoff);
  }

  /**
   * Request resource allocation
   */
  public requestAllocation(request: Omit<ResourceAllocation, 'id' | 'startTime'>): string | null {
    const id = `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const available = this.getAvailableResource(request.type);

    if (available < request.amount) {
      this.emit('allocation:denied', { request, available });
      return null;
    }

    // Check for exclusive resource conflicts
    if (request.exclusive) {
      const conflicts = this.findExclusiveConflicts(request.type);
      if (conflicts.length > 0) {
        this.emit('allocation:conflict', { request, conflicts });
        return null;
      }
    }

    const allocation: ResourceAllocation = {
      ...request,
      id,
      startTime: Date.now()
    };

    this.allocations.set(id, allocation);
    this.updateBudget(request.type, request.amount);
    this.emit('allocation:granted', { allocation });

    // Set timeout for allocation
    if (request.timeout > 0) {
      setTimeout(() => this.releaseAllocation(id), request.timeout);
    }

    return id;
  }

  /**
   * Release resource allocation
   */
  public releaseAllocation(id: string): boolean {
    const allocation = this.allocations.get(id);
    if (!allocation) return false;

    this.allocations.delete(id);
    this.restoreBudget(allocation.type, allocation.amount);
    this.emit('allocation:released', { allocation });

    return true;
  }

  /**
   * Set resource budget
   */
  public setBudget(budget: Partial<ResourceBudget>): void {
    this.budget = { ...this.budget, ...budget };
    this.emit('budget:updated', { budget: this.budget });
  }

  /**
   * Add resource limit
   */
  public addLimit(limit: ResourceLimit): void {
    this.limits.push(limit);
    this.emit('limit:added', { limit });
  }

  /**
   * Remove resource limit
   */
  public removeLimit(resource: string, type: string): boolean {
    const idx = this.limits.findIndex(l => l.resource === resource && l.type === type);
    if (idx >= 0) {
      this.limits.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Add optimization rule
   */
  public addRule(rule: OptimizationRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule:added', { ruleId: rule.id });
  }

  /**
   * Remove optimization rule
   */
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Trigger garbage collection
   */
  public triggerGC(): void {
    if (global.gc) {
      const before = process.memoryUsage().heapUsed;
      global.gc();
      const after = process.memoryUsage().heapUsed;
      this.emit('gc:triggered', { freed: before - after });
    } else {
      this.emit('gc:unavailable');
    }
  }

  /**
   * Get resource forecast
   */
  public getForecast(): ResourceForecast[] {
    if (!this.config.enablePrediction || this.history.length < 10) {
      return [];
    }

    const forecasts: ResourceForecast[] = [];
    const windowSize = Math.min(this.config.predictionWindow, this.history.length);
    const recent = this.history.slice(-windowSize);

    // Simple linear regression for prediction
    const cpuTrend = this.calculateTrend(recent.map(s => s.cpu.usage));
    const memTrend = this.calculateTrend(recent.map(s => s.memory.used / s.memory.total * 100));

    for (let i = 1; i <= 5; i++) {
      const futureTime = Date.now() + i * this.config.samplingInterval * 10;
      forecasts.push({
        timestamp: futureTime,
        cpu: Math.max(0, Math.min(100, cpuTrend.predict(i))),
        memory: Math.max(0, Math.min(100, memTrend.predict(i))),
        confidence: Math.max(0, 1 - i * 0.15),
        trend: cpuTrend.slope > 0.5 ? 'increasing' : cpuTrend.slope < -0.5 ? 'decreasing' : 'stable'
      });
    }

    return forecasts;
  }

  /**
   * Get throttle state
   */
  public getThrottleState(): ThrottleState {
    return { ...this.throttleState };
  }

  /**
   * Set throttle state
   */
  public setThrottle(enabled: boolean, reason: string = '', level: number = 1): void {
    const wasThrottled = this.throttleState.isThrottled;
    this.throttleState = {
      isThrottled: enabled,
      reason,
      level,
      startTime: enabled ? Date.now() : 0,
      estimatedDuration: enabled ? 30000 : 0
    };

    if (enabled && !wasThrottled) {
      this.emit('throttle:enabled', this.throttleState);
    } else if (!enabled && wasThrottled) {
      this.emit('throttle:disabled');
    }
  }

  /**
   * Get resource utilization summary
   */
  public getUtilizationSummary(): Record<string, number> {
    const snapshot = this.history[this.history.length - 1];
    if (!snapshot) return { cpu: 0, memory: 0, disk: 0, network: 0 };

    return {
      cpu: snapshot.cpu.usage,
      memory: (snapshot.memory.used / snapshot.memory.total) * 100,
      disk: snapshot.disk.utilizationPercent,
      network: 0 // Would need baseline to calculate
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async collectSnapshot(): Promise<ResourceSnapshot> {
    const cpuUsage = process.cpuUsage(this.lastCpuUsage || undefined);
    this.lastCpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();

    const cpuInfo = os.cpus();
    const totalCpu = cpuInfo.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0);

    return {
      timestamp: Date.now(),
      cpu: {
        usage: totalCpu / cpuInfo.length,
        userTime: cpuUsage.user,
        systemTime: cpuUsage.system,
        idleTime: cpuInfo.reduce((acc, cpu) => acc + cpu.times.idle, 0),
        loadAverage: os.loadavg(),
        coreUsage: cpuInfo.map(cpu => {
          const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
          return ((total - cpu.times.idle) / total) * 100;
        })
      },
      memory: {
        total: os.totalmem(),
        used: os.totalmem() - os.freemem(),
        free: os.freemem(),
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        rss: memUsage.rss,
        buffers: 0,
        cached: 0
      },
      disk: {
        readBytes: 0,
        writeBytes: 0,
        readOps: 0,
        writeOps: 0,
        utilizationPercent: 0
      },
      network: {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0,
        connections: 0
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        cpuUsage,
        memoryUsage: memUsage,
        handles: 0,
        threads: 0
      }
    };
  }

  private checkLimits(snapshot: ResourceSnapshot): void {
    for (const limit of this.limits) {
      let currentValue: number;

      switch (limit.resource) {
        case 'cpu':
          currentValue = snapshot.cpu.usage;
          break;
        case 'memory':
          currentValue = (snapshot.memory.used / snapshot.memory.total) * 100;
          break;
        case 'disk':
          currentValue = snapshot.disk.utilizationPercent;
          break;
        case 'network':
          currentValue = 0;
          break;
        default:
          continue;
      }

      if (currentValue > limit.limit) {
        this.handleLimitExceeded(limit, currentValue);
      }
    }
  }

  private handleLimitExceeded(limit: ResourceLimit, current: number): void {
    this.emit('limit:exceeded', { limit, current });

    switch (limit.action) {
      case 'warn':
        // Just emit event, already done above
        break;
      case 'throttle':
        this.setThrottle(true, `${limit.resource} limit exceeded`, 1);
        break;
      case 'gc':
        if (limit.resource === 'memory') {
          this.triggerGC();
        }
        break;
      case 'reject':
        // Reject new allocations - handled in requestAllocation
        break;
    }
  }

  private async runOptimizationRules(snapshot: ResourceSnapshot): Promise<void> {
    const now = Date.now();
    const sortedRules = Array.from(this.rules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const lastRun = this.ruleLastExecution.get(rule.id) || 0;
      if (now - lastRun < rule.cooldown) continue;

      if (rule.condition(snapshot)) {
        try {
          const result = await rule.action(this);
          this.ruleLastExecution.set(rule.id, now);
          this.emit('optimization:applied', { rule: rule.id, result });
        } catch (error) {
          this.emit('optimization:error', { rule: rule.id, error });
        }
      }
    }
  }

  private initializeDefaultRules(): void {
    // High CPU usage rule
    this.addRule({
      id: 'high-cpu',
      name: 'High CPU Usage Handler',
      condition: (s) => s.cpu.usage > this.config.cpuThrottleThreshold,
      action: async () => {
        this.setThrottle(true, 'High CPU usage', 1);
        return { rule: 'high-cpu', action: 'throttle', success: true, impact: { cpuChange: -10, memoryChange: 0, diskChange: 0, networkChange: 0 }, message: 'Throttling enabled' };
      },
      cooldown: 10000,
      enabled: true,
      priority: 10
    });

    // High memory usage rule
    this.addRule({
      id: 'high-memory',
      name: 'High Memory Usage Handler',
      condition: (s) => (s.memory.heapUsed / s.memory.heapTotal) * 100 > this.config.memoryThreshold,
      action: async () => {
        this.triggerGC();
        return { rule: 'high-memory', action: 'gc', success: true, impact: { cpuChange: 0, memoryChange: -5, diskChange: 0, networkChange: 0 }, message: 'GC triggered' };
      },
      cooldown: 30000,
      enabled: true,
      priority: 9
    });

    // Recovery rule
    this.addRule({
      id: 'recovery',
      name: 'Resource Recovery Handler',
      condition: (s) => this.throttleState.isThrottled && s.cpu.usage < this.config.cpuThrottleThreshold * 0.7,
      action: async () => {
        this.setThrottle(false);
        return { rule: 'recovery', action: 'unthrottle', success: true, impact: { cpuChange: 0, memoryChange: 0, diskChange: 0, networkChange: 0 }, message: 'Throttling disabled' };
      },
      cooldown: 5000,
      enabled: true,
      priority: 8
    });
  }

  private getAvailableResource(type: 'cpu' | 'memory' | 'disk' | 'network'): number {
    const allocated = Array.from(this.allocations.values())
      .filter(a => a.type === type)
      .reduce((sum, a) => sum + a.amount, 0);

    switch (type) {
      case 'cpu':
        return 100 - this.budget.cpu.reserved - allocated;
      case 'memory':
        return this.budget.memory.maxUsage - this.budget.memory.reserved - allocated;
      case 'disk':
        return this.budget.disk.maxReadMBps - this.budget.disk.reserved - allocated;
      case 'network':
        return this.budget.network.maxBandwidthMBps - this.budget.network.reserved - allocated;
      default:
        return 0;
    }
  }

  private findExclusiveConflicts(type: 'cpu' | 'memory' | 'disk' | 'network'): ResourceAllocation[] {
    return Array.from(this.allocations.values()).filter(a => a.type === type && a.exclusive);
  }

  private updateBudget(type: 'cpu' | 'memory' | 'disk' | 'network', amount: number): void {
    switch (type) {
      case 'cpu':
        this.budget.cpu.reserved += amount;
        break;
      case 'memory':
        this.budget.memory.reserved += amount;
        break;
      case 'disk':
        this.budget.disk.reserved += amount;
        break;
      case 'network':
        this.budget.network.reserved += amount;
        break;
    }
  }

  private restoreBudget(type: 'cpu' | 'memory' | 'disk' | 'network', amount: number): void {
    switch (type) {
      case 'cpu':
        this.budget.cpu.reserved = Math.max(0, this.budget.cpu.reserved - amount);
        break;
      case 'memory':
        this.budget.memory.reserved = Math.max(0, this.budget.memory.reserved - amount);
        break;
      case 'disk':
        this.budget.disk.reserved = Math.max(0, this.budget.disk.reserved - amount);
        break;
      case 'network':
        this.budget.network.reserved = Math.max(0, this.budget.network.reserved - amount);
        break;
    }
  }

  private calculateTrend(values: number[]): { slope: number; intercept: number; predict: (x: number) => number } {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept, predict: (x: number) => slope * (n + x) + intercept };
  }

  private createDefaultBudget(): ResourceBudget {
    return {
      cpu: { maxUsage: 90, reserved: 10 },
      memory: { maxUsage: os.totalmem() * 0.8, reserved: os.totalmem() * 0.1, gcThreshold: 0.8 },
      disk: { maxReadMBps: 500, maxWriteMBps: 300, reserved: 50 },
      network: { maxBandwidthMBps: 100, reserved: 10 }
    };
  }

  public destroy(): void {
    this.stop();
    this.allocations.clear();
    this.rules.clear();
    this.history = [];
    this.emit('destroyed');
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

let defaultOptimizer: ResourceOptimizer | null = null;

export function getDefaultOptimizer(config?: Partial<ResourceOptimizerConfig>): ResourceOptimizer {
  if (!defaultOptimizer) defaultOptimizer = new ResourceOptimizer(config);
  return defaultOptimizer;
}

export function createOptimizer(config?: Partial<ResourceOptimizerConfig>): ResourceOptimizer {
  return new ResourceOptimizer(config);
}

export default ResourceOptimizer;
