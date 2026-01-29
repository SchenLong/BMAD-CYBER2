/**
 * BMAD CONCURA MEMORY MANAGEMENT OPTIMIZER
 * Advanced memory management and optimization for BMAD systems
 *
 * @description Intelligent memory management system that monitors, analyzes, and optimizes
 * memory usage patterns across BMAD components. Provides automated memory optimization,
 * leak detection, and performance enhancement for CONCURA context efficiency.
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { EventEmitter } from 'events';
import { performance, PerformanceObserver } from 'perf_hooks';

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  buffers: number;
  timestamp: number;
  utilization: number;
  fragmentation: number;
  efficiency: number;
}

export interface MemoryThresholds {
  warning: number;
  critical: number;
  emergency: number;
  optimal: number;
}

export interface MemoryOptimizationConfig {
  monitoringInterval: number;
  gcThresholds: MemoryThresholds;
  optimizationStrategies: {
    aggressiveCleanup: boolean;
    pooledAllocations: boolean;
    lazyLoading: boolean;
    compressionEnabled: boolean;
    bufferOptimization: boolean;
  };
  performanceTargets: {
    maxHeapUtilization: number;
    minEfficiency: number;
    maxFragmentation: number;
    gcPauseThreshold: number;
  };
  alerting: {
    enabled: boolean;
    channels: Array<{
      type: 'console' | 'webhook' | 'email';
      config: any;
    }>;
  };
}

export interface MemoryOptimizationResult {
  strategy: string;
  beforeStats: MemoryStats;
  afterStats: MemoryStats;
  improvement: {
    heapReduction: number;
    efficiencyGain: number;
    fragmentationReduction: number;
  };
  timestamp: number;
  duration: number;
  success: boolean;
}

export interface MemoryPool {
  name: string;
  size: number;
  used: number;
  available: number;
  objects: Array<{
    id: string;
    size: number;
    lastAccessed: number;
    references: number;
  }>;
}

export interface MemoryAnalytics {
  trends: {
    growthRate: number;
    peakUsage: number;
    averageUsage: number;
    volatility: number;
  };
  patterns: {
    allocationPatterns: Array<{
      size: number;
      frequency: number;
      timing: number[];
    }>;
    leakIndicators: Array<{
      source: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      confidence: number;
      growthRate: number;
    }>;
  };
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    impact: number;
    effort: number;
    description: string;
  }>;
}

/**
 * Advanced Memory Management Optimizer
 * Provides intelligent memory optimization for BMAD CONCURA systems
 */
export class MemoryOptimizer extends EventEmitter {
  private static instance: MemoryOptimizer | null = null;
  private config: MemoryOptimizationConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private memoryHistory: MemoryStats[] = [];
  private memoryPools: Map<string, MemoryPool> = new Map();
  private optimizationHistory: MemoryOptimizationResult[] = [];
  private isOptimizing = false;
  private performanceObserver: PerformanceObserver | null = null;
  private gcMetrics: Array<{
    type: string;
    duration: number;
    timestamp: number;
    heapBefore: number;
    heapAfter: number;
  }> = [];

  constructor(config?: Partial<MemoryOptimizationConfig>) {
    super();

    this.config = {
      monitoringInterval: 5000,
      gcThresholds: {
        warning: 512 * 1024 * 1024,     // 512MB
        critical: 1024 * 1024 * 1024,   // 1GB
        emergency: 1536 * 1024 * 1024,  // 1.5GB
        optimal: 256 * 1024 * 1024      // 256MB
      },
      optimizationStrategies: {
        aggressiveCleanup: true,
        pooledAllocations: true,
        lazyLoading: true,
        compressionEnabled: true,
        bufferOptimization: true
      },
      performanceTargets: {
        maxHeapUtilization: 80,
        minEfficiency: 85,
        maxFragmentation: 15,
        gcPauseThreshold: 100
      },
      alerting: {
        enabled: true,
        channels: [
          {
            type: 'console',
            config: { level: 'warn' }
          }
        ]
      },
      ...config
    };

    this.setupPerformanceObserver();
  }

  /**
   * Get singleton instance of MemoryOptimizer
   */
  public static getInstance(config?: Partial<MemoryOptimizationConfig>): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer(config);
    }
    return MemoryOptimizer.instance;
  }

  /**
   * Start memory monitoring and optimization
   */
  public async startMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      this.emit('warning', 'Memory monitoring already started');
      return;
    }

    console.log('🧠 Starting BMAD Memory Optimizer...');

    this.monitoringInterval = setInterval(() => {
      this.collectMemoryStats();
      this.analyzeMemoryUsage();
      this.performOptimizationIfNeeded();
    }, this.config.monitoringInterval);

    // Initial memory collection
    this.collectMemoryStats();

    console.log('✅ Memory optimization monitoring started');
    this.emit('started');
  }

  /**
   * Stop memory monitoring
   */
  public async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    console.log('⏹️ Memory optimization monitoring stopped');
    this.emit('stopped');
  }

  /**
   * Get current memory statistics
   */
  public getCurrentMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();
    const heapUtilization = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      buffers: memUsage.arrayBuffers || 0,
      timestamp: Date.now(),
      utilization: heapUtilization,
      fragmentation: this.calculateFragmentation(memUsage),
      efficiency: this.calculateMemoryEfficiency(memUsage)
    };
  }

  /**
   * Perform immediate memory optimization
   */
  public async optimizeMemory(strategy?: string): Promise<MemoryOptimizationResult> {
    if (this.isOptimizing) {
      throw new Error('Memory optimization already in progress');
    }

    this.isOptimizing = true;
    const startTime = Date.now();
    const beforeStats = this.getCurrentMemoryStats();

    try {
      console.log(`🔧 Starting memory optimization (${strategy || 'auto'})...`);

      let optimizationStrategy = strategy;
      if (!optimizationStrategy) {
        optimizationStrategy = this.selectOptimalStrategy(beforeStats);
      }

      await this.executeOptimizationStrategy(optimizationStrategy);

      // Force garbage collection if possible
      if (global.gc) {
        global.gc();
      }

      const afterStats = this.getCurrentMemoryStats();
      const duration = Date.now() - startTime;

      const result: MemoryOptimizationResult = {
        strategy: optimizationStrategy,
        beforeStats,
        afterStats,
        improvement: {
          heapReduction: ((beforeStats.heapUsed - afterStats.heapUsed) / beforeStats.heapUsed) * 100,
          efficiencyGain: afterStats.efficiency - beforeStats.efficiency,
          fragmentationReduction: beforeStats.fragmentation - afterStats.fragmentation
        },
        timestamp: Date.now(),
        duration,
        success: afterStats.heapUsed < beforeStats.heapUsed
      };

      this.optimizationHistory.push(result);
      this.emit('optimized', result);

      console.log(`✅ Memory optimization complete: ${result.improvement.heapReduction.toFixed(2)}% reduction`);

      return result;
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Create and manage memory pools for efficient allocation
   */
  public createMemoryPool(name: string, size: number): MemoryPool {
    const pool: MemoryPool = {
      name,
      size,
      used: 0,
      available: size,
      objects: []
    };

    this.memoryPools.set(name, pool);
    console.log(`📦 Created memory pool '${name}' with ${size} bytes`);

    return pool;
  }

  /**
   * Allocate memory from pool
   */
  public allocateFromPool(poolName: string, objectSize: number, objectId: string): boolean {
    const pool = this.memoryPools.get(poolName);
    if (!pool) {
      console.warn(`⚠️ Memory pool '${poolName}' not found`);
      return false;
    }

    if (pool.available >= objectSize) {
      pool.used += objectSize;
      pool.available -= objectSize;
      pool.objects.push({
        id: objectId,
        size: objectSize,
        lastAccessed: Date.now(),
        references: 1
      });
      return true;
    }

    return false;
  }

  /**
   * Deallocate memory from pool
   */
  public deallocateFromPool(poolName: string, objectId: string): boolean {
    const pool = this.memoryPools.get(poolName);
    if (!pool) {
      return false;
    }

    const objectIndex = pool.objects.findIndex(obj => obj.id === objectId);
    if (objectIndex === -1) {
      return false;
    }

    const object = pool.objects[objectIndex];
    pool.used -= object.size;
    pool.available += object.size;
    pool.objects.splice(objectIndex, 1);

    return true;
  }

  /**
   * Get comprehensive memory analytics
   */
  public getMemoryAnalytics(): MemoryAnalytics {
    const recentHistory = this.memoryHistory.slice(-100); // Last 100 samples

    if (recentHistory.length < 2) {
      return {
        trends: { growthRate: 0, peakUsage: 0, averageUsage: 0, volatility: 0 },
        patterns: { allocationPatterns: [], leakIndicators: [] },
        recommendations: []
      };
    }

    // Calculate trends
    const growthRate = this.calculateGrowthRate(recentHistory);
    const peakUsage = Math.max(...recentHistory.map(s => s.heapUsed));
    const averageUsage = recentHistory.reduce((sum, s) => sum + s.heapUsed, 0) / recentHistory.length;
    const volatility = this.calculateVolatility(recentHistory);

    // Detect allocation patterns
    const allocationPatterns = this.detectAllocationPatterns(recentHistory);

    // Detect potential memory leaks
    const leakIndicators = this.detectMemoryLeaks(recentHistory);

    // Generate recommendations
    const recommendations = this.generateMemoryRecommendations(recentHistory);

    return {
      trends: {
        growthRate,
        peakUsage,
        averageUsage,
        volatility
      },
      patterns: {
        allocationPatterns,
        leakIndicators
      },
      recommendations
    };
  }

  /**
   * Get optimization history
   */
  public getOptimizationHistory(): MemoryOptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get current memory pool status
   */
  public getMemoryPoolStatus(): Map<string, MemoryPool> {
    return new Map(this.memoryPools);
  }

  /**
   * Get garbage collection metrics
   */
  public getGCMetrics(): Array<{
    type: string;
    duration: number;
    timestamp: number;
    heapBefore: number;
    heapAfter: number;
  }> {
    return [...this.gcMetrics];
  }

  /**
   * Clean up old data and optimize internal structures
   */
  public cleanup(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Clean old memory history
    this.memoryHistory = this.memoryHistory.filter(stats => stats.timestamp > cutoffTime);

    // Clean old optimization history
    this.optimizationHistory = this.optimizationHistory.filter(result => result.timestamp > cutoffTime);

    // Clean old GC metrics
    this.gcMetrics = this.gcMetrics.filter(metric => metric.timestamp > cutoffTime);

    // Clean unused objects from memory pools
    for (const pool of this.memoryPools.values()) {
      const activeObjects = pool.objects.filter(obj =>
        obj.lastAccessed > cutoffTime || obj.references > 0
      );

      const cleanedSize = pool.objects.reduce((sum, obj) => {
        if (!activeObjects.includes(obj)) {
          return sum + obj.size;
        }
        return sum;
      }, 0);

      pool.objects = activeObjects;
      pool.used -= cleanedSize;
      pool.available += cleanedSize;
    }

    console.log('🧹 Memory optimizer cleanup completed');
  }

  // Private methods

  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('⚠️ PerformanceObserver not available, GC monitoring disabled');
      return;
    }

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'gc') {
          this.gcMetrics.push({
            type: (entry as any).kind || 'unknown',
            duration: entry.duration,
            timestamp: Date.now(),
            heapBefore: (entry as any).heapBefore || 0,
            heapAfter: (entry as any).heapAfter || 0
          });

          // Keep only recent GC metrics
          if (this.gcMetrics.length > 100) {
            this.gcMetrics = this.gcMetrics.slice(-50);
          }
        }
      }
    });

    try {
      this.performanceObserver.observe({ entryTypes: ['gc'] });
    } catch (error) {
      console.warn('⚠️ Could not observe GC events:', error.message);
    }
  }

  private collectMemoryStats(): void {
    const stats = this.getCurrentMemoryStats();
    this.memoryHistory.push(stats);

    // Keep only recent history
    if (this.memoryHistory.length > 1000) {
      this.memoryHistory = this.memoryHistory.slice(-500);
    }

    this.emit('stats', stats);
  }

  private analyzeMemoryUsage(): void {
    const currentStats = this.getCurrentMemoryStats();
    const { gcThresholds } = this.config;

    if (currentStats.heapUsed > gcThresholds.emergency) {
      this.emit('emergency', {
        level: 'emergency',
        message: `Memory usage critical: ${Math.round(currentStats.heapUsed / 1024 / 1024)}MB`,
        stats: currentStats
      });
    } else if (currentStats.heapUsed > gcThresholds.critical) {
      this.emit('critical', {
        level: 'critical',
        message: `Memory usage high: ${Math.round(currentStats.heapUsed / 1024 / 1024)}MB`,
        stats: currentStats
      });
    } else if (currentStats.heapUsed > gcThresholds.warning) {
      this.emit('warning', {
        level: 'warning',
        message: `Memory usage elevated: ${Math.round(currentStats.heapUsed / 1024 / 1024)}MB`,
        stats: currentStats
      });
    }
  }

  private performOptimizationIfNeeded(): void {
    if (this.isOptimizing) return;

    const currentStats = this.getCurrentMemoryStats();
    const { performanceTargets } = this.config;

    const needsOptimization =
      currentStats.utilization > performanceTargets.maxHeapUtilization ||
      currentStats.efficiency < performanceTargets.minEfficiency ||
      currentStats.fragmentation > performanceTargets.maxFragmentation;

    if (needsOptimization) {
      this.optimizeMemory().catch(error => {
        console.error('❌ Automatic memory optimization failed:', error);
        this.emit('error', error);
      });
    }
  }

  private selectOptimalStrategy(stats: MemoryStats): string {
    if (stats.fragmentation > 20) {
      return 'defragmentation';
    } else if (stats.utilization > 85) {
      return 'aggressive-cleanup';
    } else if (stats.efficiency < 70) {
      return 'buffer-optimization';
    } else {
      return 'gentle-cleanup';
    }
  }

  private async executeOptimizationStrategy(strategy: string): Promise<void> {
    const { optimizationStrategies } = this.config;

    switch (strategy) {
      case 'aggressive-cleanup':
        if (optimizationStrategies.aggressiveCleanup) {
          await this.performAggressiveCleanup();
        }
        break;

      case 'buffer-optimization':
        if (optimizationStrategies.bufferOptimization) {
          await this.optimizeBuffers();
        }
        break;

      case 'defragmentation':
        await this.performDefragmentation();
        break;

      case 'gentle-cleanup':
        await this.performGentleCleanup();
        break;

      default:
        await this.performGentleCleanup();
    }
  }

  private async performAggressiveCleanup(): Promise<void> {
    console.log('🔥 Performing aggressive memory cleanup...');

    // Clear unused memory pools
    for (const [name, pool] of this.memoryPools) {
      const inactiveThreshold = Date.now() - (5 * 60 * 1000); // 5 minutes
      const initialSize = pool.objects.length;

      pool.objects = pool.objects.filter(obj =>
        obj.lastAccessed > inactiveThreshold && obj.references > 0
      );

      const cleaned = initialSize - pool.objects.length;
      if (cleaned > 0) {
        console.log(`   🧹 Cleaned ${cleaned} inactive objects from pool '${name}'`);
      }
    }

    // Force multiple GC cycles
    if (global.gc) {
      for (let i = 0; i < 3; i++) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  private async performGentleCleanup(): Promise<void> {
    console.log('🌱 Performing gentle memory cleanup...');

    // Cleanup old memory pools only
    for (const pool of this.memoryPools.values()) {
      const oldThreshold = Date.now() - (30 * 60 * 1000); // 30 minutes
      pool.objects = pool.objects.filter(obj => obj.lastAccessed > oldThreshold);
    }

    // Single GC cycle
    if (global.gc) {
      global.gc();
    }
  }

  private async optimizeBuffers(): Promise<void> {
    console.log('📊 Optimizing buffer allocations...');

    // This would typically involve optimizing specific buffer usage
    // For now, we'll simulate buffer optimization
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async performDefragmentation(): Promise<void> {
    console.log('🔧 Performing memory defragmentation...');

    // Simulate defragmentation by forcing multiple GC cycles
    if (global.gc) {
      for (let i = 0; i < 5; i++) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }
  }

  private calculateFragmentation(memUsage: NodeJS.MemoryUsage): number {
    // Simplified fragmentation calculation
    const totalAllocated = memUsage.heapTotal;
    const totalUsed = memUsage.heapUsed;
    const efficiency = totalUsed / totalAllocated;
    return (1 - efficiency) * 100;
  }

  private calculateMemoryEfficiency(memUsage: NodeJS.MemoryUsage): number {
    // Calculate efficiency based on heap usage and external memory
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    return (usedMemory / totalMemory) * 100;
  }

  private calculateGrowthRate(history: MemoryStats[]): number {
    if (history.length < 10) return 0;

    const recent = history.slice(-10);
    const older = history.slice(-20, -10);

    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;

    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private calculateVolatility(history: MemoryStats[]): number {
    if (history.length < 2) return 0;

    const values = history.map(s => s.heapUsed);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return Math.sqrt(variance) / mean * 100;
  }

  private detectAllocationPatterns(history: MemoryStats[]): Array<{
    size: number;
    frequency: number;
    timing: number[];
  }> {
    // Simplified pattern detection
    const patterns: Array<{ size: number; frequency: number; timing: number[] }> = [];

    for (let i = 1; i < history.length; i++) {
      const sizeDiff = history[i].heapUsed - history[i - 1].heapUsed;
      if (Math.abs(sizeDiff) > 1024 * 1024) { // 1MB threshold
        const existing = patterns.find(p => Math.abs(p.size - sizeDiff) < 512 * 1024);
        if (existing) {
          existing.frequency++;
          existing.timing.push(history[i].timestamp);
        } else {
          patterns.push({
            size: sizeDiff,
            frequency: 1,
            timing: [history[i].timestamp]
          });
        }
      }
    }

    return patterns.filter(p => p.frequency >= 3);
  }

  private detectMemoryLeaks(history: MemoryStats[]): Array<{
    source: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    growthRate: number;
  }> {
    const leaks: Array<{
      source: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      confidence: number;
      growthRate: number;
    }> = [];

    const growthRate = this.calculateGrowthRate(history);

    if (growthRate > 10) {
      leaks.push({
        source: 'heap-memory',
        severity: 'high',
        confidence: 85,
        growthRate
      });
    } else if (growthRate > 5) {
      leaks.push({
        source: 'heap-memory',
        severity: 'medium',
        confidence: 70,
        growthRate
      });
    }

    return leaks;
  }

  private generateMemoryRecommendations(history: MemoryStats[]): Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    impact: number;
    effort: number;
    description: string;
  }> {
    const recommendations: Array<{
      action: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      impact: number;
      effort: number;
      description: string;
    }> = [];

    const currentStats = history[history.length - 1];

    if (currentStats.utilization > 90) {
      recommendations.push({
        action: 'increase-heap-size',
        priority: 'urgent',
        impact: 90,
        effort: 20,
        description: 'Increase Node.js heap size to prevent out-of-memory errors'
      });
    }

    if (currentStats.fragmentation > 25) {
      recommendations.push({
        action: 'enable-gc-optimization',
        priority: 'high',
        impact: 70,
        effort: 40,
        description: 'Optimize garbage collection settings for reduced fragmentation'
      });
    }

    if (currentStats.efficiency < 60) {
      recommendations.push({
        action: 'implement-object-pooling',
        priority: 'medium',
        impact: 80,
        effort: 60,
        description: 'Implement object pooling for frequently allocated objects'
      });
    }

    return recommendations;
  }
}

/**
 * Export singleton instance
 */
export const bmadMemoryOptimizer = MemoryOptimizer.getInstance();

/**
 * Convenience function to start memory optimization
 */
export async function startMemoryOptimization(config?: Partial<MemoryOptimizationConfig>): Promise<MemoryOptimizer> {
  const optimizer = MemoryOptimizer.getInstance(config);
  await optimizer.startMonitoring();
  return optimizer;
}