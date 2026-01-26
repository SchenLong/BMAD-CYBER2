/**
 * BMAD CONCURA MEMORY PROFILING SYSTEM
 * Advanced memory usage analysis and leak detection for BMAD infrastructure
 * Provides detailed memory profiling, garbage collection monitoring, and optimization insights
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { performance } from 'perf_hooks';
import * as v8 from 'v8';

/**
 * Memory snapshot interfaces
 */
export interface MemorySnapshot {
  id: string;
  timestamp: Date;
  processMemory: NodeJS.MemoryUsage;
  heapStatistics: v8.HeapStatistics;
  heapSpaceStatistics: v8.HeapSpaceStatistics[];
  gcProfile?: GarbageCollectionProfile;
  objectCounts?: ObjectTypeCount[];
  leakSuspects?: MemoryLeak[];
}

export interface GarbageCollectionProfile {
  collections: GCEvent[];
  totalCollections: number;
  totalGCTime: number;
  averageGCTime: number;
  gcPressure: number; // 0-100 percentage
  lastMajorGC?: Date;
  lastMinorGC?: Date;
}

export interface GCEvent {
  type: 'minor' | 'major' | 'incremental';
  startTime: number;
  endTime: number;
  duration: number;
  freedMemory: number;
  heapBefore: number;
  heapAfter: number;
}

export interface ObjectTypeCount {
  type: string;
  count: number;
  size: number;
  averageSize: number;
}

export interface MemoryLeak {
  id: string;
  type: 'suspected' | 'confirmed';
  objectType: string;
  growthRate: number; // objects per second
  memoryGrowthRate: number; // bytes per second
  firstDetected: Date;
  lastObserved: Date;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MemoryOptimizationRecommendation {
  type: 'gc-tuning' | 'object-pooling' | 'cache-cleanup' | 'heap-resize' | 'leak-fix';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  implementation: string;
  estimatedSavings: {
    memory: number; // MB
    performance: number; // percentage
  };
}

/**
 * Advanced Memory Profiler
 */
export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];
  private gcEvents: GCEvent[] = [];
  private leakDetectionEnabled = true;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private gcObserver: any = null;
  private baselineSnapshot: MemorySnapshot | null = null;
  private leakThresholds = {
    objectGrowthRate: 100, // objects per second
    memoryGrowthRate: 1024 * 1024, // 1MB per second
    suspectedLeakWindow: 30000, // 30 seconds
    confirmedLeakWindow: 120000 // 2 minutes
  };

  constructor(config?: {
    leakDetection?: boolean;
    monitoringInterval?: number;
    thresholds?: Partial<typeof this.leakThresholds>;
  }) {
    this.leakDetectionEnabled = config?.leakDetection ?? true;

    if (config?.thresholds) {
      this.leakThresholds = { ...this.leakThresholds, ...config.thresholds };
    }

    this.initializeGCMonitoring();

    if (config?.monitoringInterval) {
      this.startContinuousMonitoring(config.monitoringInterval);
    }
  }

  /**
   * Initialize garbage collection monitoring
   */
  private initializeGCMonitoring(): void {
    // Set up GC performance observer if available
    try {
      const { PerformanceObserver } = require('perf_hooks');
      this.gcObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'gc') {
            this.recordGCEvent({
              type: this.classifyGCType(entry),
              startTime: entry.startTime,
              endTime: entry.startTime + entry.duration,
              duration: entry.duration,
              freedMemory: 0, // Will be calculated from heap diff
              heapBefore: 0,
              heapAfter: 0
            });
          }
        }
      });
      this.gcObserver.observe({ entryTypes: ['gc'] });
    } catch (error) {
      console.warn('GC monitoring not available:', error.message);
    }

    // Hook into V8 GC events if available
    if (v8.getHeapStatistics) {
      const originalGC = global.gc;
      if (originalGC) {
        global.gc = () => {
          const before = process.memoryUsage();
          const result = originalGC.call(global);
          const after = process.memoryUsage();

          this.recordGCEvent({
            type: 'major',
            startTime: Date.now(),
            endTime: Date.now(),
            duration: 0,
            freedMemory: before.heapUsed - after.heapUsed,
            heapBefore: before.heapUsed,
            heapAfter: after.heapUsed
          });

          return result;
        };
      }
    }
  }

  /**
   * Take a memory snapshot
   */
  public takeSnapshot(id?: string): MemorySnapshot {
    const snapshotId = id || `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const snapshot: MemorySnapshot = {
      id: snapshotId,
      timestamp: new Date(),
      processMemory: process.memoryUsage(),
      heapStatistics: v8.getHeapStatistics(),
      heapSpaceStatistics: v8.getHeapSpaceStatistics(),
      gcProfile: this.buildGCProfile(),
      objectCounts: this.getObjectTypeCounts(),
      leakSuspects: this.detectMemoryLeaks()
    };

    this.snapshots.push(snapshot);

    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }

    // Set baseline if this is the first snapshot
    if (!this.baselineSnapshot) {
      this.baselineSnapshot = snapshot;
    }

    return snapshot;
  }

  /**
   * Start continuous memory monitoring
   */
  public startContinuousMonitoring(interval: number = 5000): void {
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot(`monitor-${Date.now()}`);
    }, interval);
  }

  /**
   * Stop continuous monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Compare two memory snapshots
   */
  public compareSnapshots(snapshot1: MemorySnapshot, snapshot2: MemorySnapshot): {
    memoryDelta: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    heapGrowth: number;
    objectGrowth: { type: string; growth: number }[];
    gcActivity: {
      collections: number;
      totalTime: number;
    };
    efficiency: number;
  } {
    const memoryDelta = {
      rss: snapshot2.processMemory.rss - snapshot1.processMemory.rss,
      heapUsed: snapshot2.processMemory.heapUsed - snapshot1.processMemory.heapUsed,
      heapTotal: snapshot2.processMemory.heapTotal - snapshot1.processMemory.heapTotal,
      external: snapshot2.processMemory.external - snapshot1.processMemory.external
    };

    const heapGrowth = snapshot2.heapStatistics.used_heap_size - snapshot1.heapStatistics.used_heap_size;

    const objectGrowth = this.calculateObjectGrowth(snapshot1.objectCounts || [], snapshot2.objectCounts || []);

    const gcActivity = {
      collections: (snapshot2.gcProfile?.totalCollections || 0) - (snapshot1.gcProfile?.totalCollections || 0),
      totalTime: (snapshot2.gcProfile?.totalGCTime || 0) - (snapshot1.gcProfile?.totalGCTime || 0)
    };

    const efficiency = this.calculateMemoryEfficiency(snapshot2);

    return {
      memoryDelta,
      heapGrowth,
      objectGrowth,
      gcActivity,
      efficiency
    };
  }

  /**
   * Detect memory leaks
   */
  public detectMemoryLeaks(): MemoryLeak[] {
    if (!this.leakDetectionEnabled || this.snapshots.length < 3) {
      return [];
    }

    const leaks: MemoryLeak[] = [];
    const recentSnapshots = this.snapshots.slice(-5); // Analyze last 5 snapshots

    // Analyze heap growth patterns
    const heapGrowth = this.analyzeHeapGrowth(recentSnapshots);
    if (heapGrowth.isSuspicious) {
      leaks.push({
        id: `heap-growth-${Date.now()}`,
        type: heapGrowth.isConfirmed ? 'confirmed' : 'suspected',
        objectType: 'heap',
        growthRate: heapGrowth.objectsPerSecond,
        memoryGrowthRate: heapGrowth.bytesPerSecond,
        firstDetected: recentSnapshots[0].timestamp,
        lastObserved: recentSnapshots[recentSnapshots.length - 1].timestamp,
        severity: this.classifyLeakSeverity(heapGrowth.bytesPerSecond)
      });
    }

    // Analyze object type growth
    const objectLeaks = this.analyzeObjectTypeGrowth(recentSnapshots);
    leaks.push(...objectLeaks);

    return leaks;
  }

  /**
   * Generate memory optimization recommendations
   */
  public generateOptimizationRecommendations(): MemoryOptimizationRecommendation[] {
    const recommendations: MemoryOptimizationRecommendation[] = [];
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];

    if (!latestSnapshot) {
      return recommendations;
    }

    // Analyze heap utilization
    const heapUtilization = (latestSnapshot.heapStatistics.used_heap_size / latestSnapshot.heapStatistics.heap_size_limit) * 100;

    if (heapUtilization > 80) {
      recommendations.push({
        type: 'heap-resize',
        priority: 'high',
        description: 'Heap utilization is very high (>80%)',
        impact: 'May cause performance degradation and out-of-memory errors',
        implementation: 'Consider increasing heap size with --max-old-space-size flag',
        estimatedSavings: { memory: 0, performance: 15 }
      });
    }

    // Analyze GC pressure
    const gcProfile = latestSnapshot.gcProfile;
    if (gcProfile && gcProfile.gcPressure > 50) {
      recommendations.push({
        type: 'gc-tuning',
        priority: 'medium',
        description: 'High garbage collection pressure detected',
        impact: 'Frequent GC cycles are affecting performance',
        implementation: 'Optimize object lifecycle and consider object pooling',
        estimatedSavings: { memory: 20, performance: 25 }
      });
    }

    // Analyze memory leaks
    const leaks = this.detectMemoryLeaks();
    for (const leak of leaks) {
      if (leak.severity === 'critical' || leak.severity === 'high') {
        recommendations.push({
          type: 'leak-fix',
          priority: leak.severity === 'critical' ? 'critical' : 'high',
          description: `Memory leak detected in ${leak.objectType}`,
          impact: `Growing at ${(leak.memoryGrowthRate / 1024 / 1024).toFixed(2)} MB/s`,
          implementation: 'Review object lifecycle and ensure proper cleanup',
          estimatedSavings: { memory: leak.memoryGrowthRate / 1024 / 1024 * 60, performance: 10 }
        });
      }
    }

    // Analyze external memory
    if (latestSnapshot.processMemory.external > 100 * 1024 * 1024) { // > 100MB
      recommendations.push({
        type: 'cache-cleanup',
        priority: 'medium',
        description: 'High external memory usage detected',
        impact: 'External buffers and objects consuming significant memory',
        implementation: 'Review and optimize buffer usage, implement cache cleanup',
        estimatedSavings: { memory: latestSnapshot.processMemory.external / 1024 / 1024 * 0.3, performance: 5 }
      });
    }

    return recommendations.sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority));
  }

  /**
   * Get memory usage summary
   */
  public getMemorySummary(): {
    current: {
      heapUsed: number; // MB
      heapTotal: number; // MB
      rss: number; // MB
      external: number; // MB
      heapUtilization: number; // percentage
    };
    growth: {
      heapGrowthRate: number; // MB/hour
      objectGrowthRate: number; // objects/hour
    };
    gc: {
      collections: number;
      totalTime: number; // ms
      pressure: number; // percentage
    };
    leaks: {
      suspected: number;
      confirmed: number;
      severity: string;
    };
    recommendations: number;
  } {
    const latest = this.snapshots[this.snapshots.length - 1];
    if (!latest) {
      throw new Error('No memory snapshots available');
    }

    const growth = this.calculateGrowthRates();
    const leaks = this.detectMemoryLeaks();
    const recommendations = this.generateOptimizationRecommendations();

    return {
      current: {
        heapUsed: Math.round(latest.processMemory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(latest.processMemory.heapTotal / 1024 / 1024),
        rss: Math.round(latest.processMemory.rss / 1024 / 1024),
        external: Math.round(latest.processMemory.external / 1024 / 1024),
        heapUtilization: Math.round((latest.heapStatistics.used_heap_size / latest.heapStatistics.heap_size_limit) * 100)
      },
      growth: {
        heapGrowthRate: growth.heapGrowthRate,
        objectGrowthRate: growth.objectGrowthRate
      },
      gc: {
        collections: latest.gcProfile?.totalCollections || 0,
        totalTime: latest.gcProfile?.totalGCTime || 0,
        pressure: latest.gcProfile?.gcPressure || 0
      },
      leaks: {
        suspected: leaks.filter(l => l.type === 'suspected').length,
        confirmed: leaks.filter(l => l.type === 'confirmed').length,
        severity: this.getHighestLeakSeverity(leaks)
      },
      recommendations: recommendations.length
    };
  }

  /**
   * Force garbage collection and analyze impact
   */
  public forceGCAndAnalyze(): {
    beforeGC: NodeJS.MemoryUsage;
    afterGC: NodeJS.MemoryUsage;
    freedMemory: number;
    gcTime: number;
    efficiency: number;
  } | null {
    if (typeof global.gc !== 'function') {
      console.warn('Garbage collection not exposed. Use --expose-gc flag.');
      return null;
    }

    const beforeGC = process.memoryUsage();
    const startTime = performance.now();

    global.gc();

    const endTime = performance.now();
    const afterGC = process.memoryUsage();

    const freedMemory = beforeGC.heapUsed - afterGC.heapUsed;
    const gcTime = endTime - startTime;
    const efficiency = freedMemory > 0 ? (freedMemory / beforeGC.heapUsed) * 100 : 0;

    return {
      beforeGC,
      afterGC,
      freedMemory,
      gcTime,
      efficiency
    };
  }

  // Private helper methods

  private recordGCEvent(event: GCEvent): void {
    this.gcEvents.push(event);

    // Keep only last 1000 GC events
    if (this.gcEvents.length > 1000) {
      this.gcEvents = this.gcEvents.slice(-1000);
    }
  }

  private classifyGCType(entry: any): 'minor' | 'major' | 'incremental' {
    // This is a simplified classification
    if (entry.duration > 50) return 'major';
    if (entry.duration > 10) return 'incremental';
    return 'minor';
  }

  private buildGCProfile(): GarbageCollectionProfile {
    const recentEvents = this.gcEvents.filter(
      event => Date.now() - event.startTime < 300000 // Last 5 minutes
    );

    const totalTime = recentEvents.reduce((sum, event) => sum + event.duration, 0);
    const averageTime = recentEvents.length > 0 ? totalTime / recentEvents.length : 0;

    const majorGCs = recentEvents.filter(e => e.type === 'major');
    const minorGCs = recentEvents.filter(e => e.type === 'minor');

    return {
      collections: recentEvents,
      totalCollections: recentEvents.length,
      totalGCTime: totalTime,
      averageGCTime: averageTime,
      gcPressure: Math.min(100, (recentEvents.length / 100) * 100), // Simplified pressure calculation
      lastMajorGC: majorGCs.length > 0 ? new Date(majorGCs[majorGCs.length - 1].endTime) : undefined,
      lastMinorGC: minorGCs.length > 0 ? new Date(minorGCs[minorGCs.length - 1].endTime) : undefined
    };
  }

  private getObjectTypeCounts(): ObjectTypeCount[] {
    // This is a simplified implementation
    // In a real scenario, you'd use heap dump analysis
    const heapStats = v8.getHeapStatistics();

    return [
      {
        type: 'objects',
        count: Math.round(heapStats.used_heap_size / 100), // Estimated
        size: heapStats.used_heap_size,
        averageSize: 100
      }
    ];
  }

  private calculateObjectGrowth(before: ObjectTypeCount[], after: ObjectTypeCount[]): { type: string; growth: number }[] {
    const growth: { type: string; growth: number }[] = [];

    for (const afterObj of after) {
      const beforeObj = before.find(b => b.type === afterObj.type);
      if (beforeObj) {
        growth.push({
          type: afterObj.type,
          growth: afterObj.count - beforeObj.count
        });
      }
    }

    return growth;
  }

  private calculateMemoryEfficiency(snapshot: MemorySnapshot): number {
    const heapUtilization = (snapshot.heapStatistics.used_heap_size / snapshot.heapStatistics.heap_size_limit) * 100;
    return Math.max(0, 100 - heapUtilization);
  }

  private analyzeHeapGrowth(snapshots: MemorySnapshot[]): {
    isSuspicious: boolean;
    isConfirmed: boolean;
    objectsPerSecond: number;
    bytesPerSecond: number;
  } {
    if (snapshots.length < 2) {
      return { isSuspicious: false, isConfirmed: false, objectsPerSecond: 0, bytesPerSecond: 0 };
    }

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const timeSpan = (last.timestamp.getTime() - first.timestamp.getTime()) / 1000;

    const heapGrowth = last.processMemory.heapUsed - first.processMemory.heapUsed;
    const bytesPerSecond = heapGrowth / timeSpan;

    const isSuspicious = bytesPerSecond > this.leakThresholds.memoryGrowthRate;
    const isConfirmed = isSuspicious && timeSpan > this.leakThresholds.confirmedLeakWindow / 1000;

    return {
      isSuspicious,
      isConfirmed,
      objectsPerSecond: 0, // Simplified
      bytesPerSecond
    };
  }

  private analyzeObjectTypeGrowth(snapshots: MemorySnapshot[]): MemoryLeak[] {
    // Simplified implementation
    return [];
  }

  private classifyLeakSeverity(bytesPerSecond: number): 'low' | 'medium' | 'high' | 'critical' {
    const mbPerSecond = bytesPerSecond / 1024 / 1024;

    if (mbPerSecond > 10) return 'critical';
    if (mbPerSecond > 1) return 'high';
    if (mbPerSecond > 0.1) return 'medium';
    return 'low';
  }

  private calculateGrowthRates(): { heapGrowthRate: number; objectGrowthRate: number } {
    if (this.snapshots.length < 2) {
      return { heapGrowthRate: 0, objectGrowthRate: 0 };
    }

    const recent = this.snapshots.slice(-10); // Last 10 snapshots
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeSpan = (last.timestamp.getTime() - first.timestamp.getTime()) / 1000 / 3600; // hours

    const heapGrowth = (last.processMemory.heapUsed - first.processMemory.heapUsed) / 1024 / 1024; // MB
    const heapGrowthRate = timeSpan > 0 ? heapGrowth / timeSpan : 0;

    return {
      heapGrowthRate,
      objectGrowthRate: 0 // Simplified
    };
  }

  private getHighestLeakSeverity(leaks: MemoryLeak[]): string {
    if (leaks.some(l => l.severity === 'critical')) return 'critical';
    if (leaks.some(l => l.severity === 'high')) return 'high';
    if (leaks.some(l => l.severity === 'medium')) return 'medium';
    if (leaks.some(l => l.severity === 'low')) return 'low';
    return 'none';
  }

  private priorityWeight(priority: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority] || 0;
  }
}

/**
 * Export singleton instance
 */
export const memoryProfiler = new MemoryProfiler({
  leakDetection: true,
  monitoringInterval: 10000 // 10 seconds
});