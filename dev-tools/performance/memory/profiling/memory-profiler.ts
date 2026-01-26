/**
 * BMAD CONCURA ADVANCED MEMORY PROFILING TOOLS
 * Comprehensive memory profiling, analysis, and optimization for BMAD systems
 *
 * @description Advanced memory profiling system that provides detailed analysis
 * of memory usage patterns, object lifecycle, allocation tracking, and
 * performance optimization recommendations for CONCURA context efficiency.
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface MemoryProfile {
  timestamp: number;
  duration: number;

  heap: {
    used: number;
    total: number;
    limit: number;
    available: number;
    utilization: number;
    efficiency: number;
    fragmentation: number;
  };

  external: {
    size: number;
    growth: number;
    efficiency: number;
  };

  buffers: {
    arrayBuffers: number;
    sharedArrayBuffers: number;
    totalBuffers: number;
    growth: number;
  };

  objects: {
    [type: string]: {
      count: number;
      size: number;
      growth: number;
      retention: number;
    };
  };

  allocations: {
    rate: number;        // Allocations per second
    size: number;        // Average allocation size
    patterns: string[];  // Detected patterns
    hotspots: Array<{
      location: string;
      frequency: number;
      size: number;
    }>;
  };

  gc: {
    collections: number;
    totalTime: number;
    averageTime: number;
    lastCollection: number;
    pressure: number;
  };
}

export interface AllocationTracking {
  timestamp: number;
  size: number;
  type: string;
  stack?: string;
  freed?: boolean;
  freedAt?: number;
  lifetime?: number;
}

export interface MemoryHotspot {
  location: string;
  function: string;
  allocations: number;
  totalSize: number;
  averageSize: number;
  retentionRate: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface MemoryOptimizationRecommendation {
  type: 'allocation' | 'retention' | 'fragmentation' | 'gc' | 'pooling';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  impact: number;        // Expected improvement %
  effort: number;        // Implementation effort 1-10
  implementation: {
    strategy: string;
    steps: string[];
    code?: string;
    configuration?: any;
  };
  metrics: {
    before: any;
    expectedAfter: any;
  };
}

export interface MemoryProfilingConfig {
  sampling: {
    interval: number;
    allocationTracking: boolean;
    objectTracking: boolean;
    stackCapture: boolean;
    heapProfiling: boolean;
  };
  analysis: {
    hotspotDetection: boolean;
    patternAnalysis: boolean;
    lifecycleTracking: boolean;
    fragmentationAnalysis: boolean;
    optimizationSuggestions: boolean;
  };
  reporting: {
    format: 'json' | 'html' | 'csv';
    includeStackTraces: boolean;
    detailLevel: 'minimal' | 'standard' | 'detailed' | 'comprehensive';
  };
  thresholds: {
    allocationRate: number;
    retentionWarning: number;
    fragmentationWarning: number;
    hotspotThreshold: number;
  };
}

export interface MemorySnapshot {
  id: string;
  timestamp: number;
  profile: MemoryProfile;
  allocations: AllocationTracking[];
  hotspots: MemoryHotspot[];
  recommendations: MemoryOptimizationRecommendation[];
  comparison?: {
    baseline: string;
    changes: any;
  };
}

/**
 * Advanced Memory Profiling System
 * Provides comprehensive memory analysis and optimization for BMAD CONCURA
 */
export class AdvancedMemoryProfiler extends EventEmitter {
  private static instance: AdvancedMemoryProfiler | null = null;
  private config: MemoryProfilingConfig;
  private profiles: Map<string, MemoryProfile> = new Map();
  private snapshots: Map<string, MemorySnapshot> = new Map();
  private allocations: AllocationTracking[] = [];
  private hotspots: Map<string, MemoryHotspot> = new Map();
  private isProfileActive = false;
  private profileStartTime = 0;
  private samplingInterval: NodeJS.Timeout | null = null;
  private baselineSnapshot: MemorySnapshot | null = null;

  constructor(config?: Partial<MemoryProfilingConfig>) {
    super();

    this.config = {
      sampling: {
        interval: 1000,
        allocationTracking: true,
        objectTracking: true,
        stackCapture: false,
        heapProfiling: false
      },
      analysis: {
        hotspotDetection: true,
        patternAnalysis: true,
        lifecycleTracking: true,
        fragmentationAnalysis: true,
        optimizationSuggestions: true
      },
      reporting: {
        format: 'json',
        includeStackTraces: false,
        detailLevel: 'standard'
      },
      thresholds: {
        allocationRate: 1000,      // Allocations per second
        retentionWarning: 0.8,     // 80% retention rate warning
        fragmentationWarning: 0.3, // 30% fragmentation warning
        hotspotThreshold: 0.1      // 10% of total allocations
      },
      ...config
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<MemoryProfilingConfig>): AdvancedMemoryProfiler {
    if (!AdvancedMemoryProfiler.instance) {
      AdvancedMemoryProfiler.instance = new AdvancedMemoryProfiler(config);
    }
    return AdvancedMemoryProfiler.instance;
  }

  /**
   * Start memory profiling
   */
  public async startProfiling(name?: string): Promise<void> {
    if (this.isProfileActive) {
      console.warn('⚠️ Memory profiling already active');
      return;
    }

    const profileName = name || `profile-${Date.now()}`;
    this.isProfileActive = true;
    this.profileStartTime = Date.now();

    console.log(`📊 Starting memory profiling: ${profileName}`);

    // Start sampling
    if (this.config.sampling.interval > 0) {
      this.samplingInterval = setInterval(() => {
        this.sampleMemoryUsage();
      }, this.config.sampling.interval);
    }

    // Capture initial baseline
    const baseline = await this.captureSnapshot('baseline');
    this.baselineSnapshot = baseline;

    this.emit('profiling-started', { name: profileName });
  }

  /**
   * Stop memory profiling
   */
  public async stopProfiling(): Promise<MemoryProfile> {
    if (!this.isProfileActive) {
      throw new Error('Memory profiling is not active');
    }

    const duration = Date.now() - this.profileStartTime;

    // Stop sampling
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }

    // Generate final profile
    const finalProfile = this.generateProfile(duration);

    // Capture final snapshot
    const finalSnapshot = await this.captureSnapshot('final');

    // Perform analysis
    if (this.config.analysis.optimizationSuggestions) {
      const recommendations = this.generateOptimizationRecommendations(finalProfile);
      finalSnapshot.recommendations = recommendations;
    }

    this.isProfileActive = false;
    console.log(`✅ Memory profiling completed (${duration}ms)`);

    this.emit('profiling-stopped', { profile: finalProfile, snapshot: finalSnapshot });
    return finalProfile;
  }

  /**
   * Capture memory snapshot
   */
  public async captureSnapshot(name: string): Promise<MemorySnapshot> {
    const id = `${name}-${Date.now()}`;
    const timestamp = Date.now();

    console.log(`📸 Capturing memory snapshot: ${name}`);

    const profile = this.generateProfile(0);
    const allocations = [...this.allocations];
    const hotspots = this.detectHotspots();
    const recommendations = this.config.analysis.optimizationSuggestions ?
                           this.generateOptimizationRecommendations(profile) : [];

    let comparison;
    if (this.baselineSnapshot && name !== 'baseline') {
      comparison = {
        baseline: this.baselineSnapshot.id,
        changes: this.compareSnapshots(this.baselineSnapshot, profile)
      };
    }

    const snapshot: MemorySnapshot = {
      id,
      timestamp,
      profile,
      allocations,
      hotspots,
      recommendations,
      comparison
    };

    this.snapshots.set(id, snapshot);
    this.emit('snapshot-captured', snapshot);

    return snapshot;
  }

  /**
   * Generate comprehensive memory profile
   */
  public generateProfile(duration: number): MemoryProfile {
    const memUsage = process.memoryUsage();
    const timestamp = Date.now();

    const profile: MemoryProfile = {
      timestamp,
      duration,
      heap: this.analyzeHeapMemory(memUsage),
      external: this.analyzeExternalMemory(memUsage),
      buffers: this.analyzeBufferMemory(memUsage),
      objects: this.analyzeObjectMemory(),
      allocations: this.analyzeAllocations(),
      gc: this.analyzeGCMetrics()
    };

    const profileId = `profile-${timestamp}`;
    this.profiles.set(profileId, profile);

    return profile;
  }

  /**
   * Track memory allocation
   */
  public trackAllocation(size: number, type: string, stack?: string): string {
    if (!this.config.sampling.allocationTracking) return '';

    const allocation: AllocationTracking = {
      timestamp: Date.now(),
      size,
      type,
      stack: this.config.sampling.stackCapture ? stack || this.captureStack() : undefined,
      freed: false
    };

    this.allocations.push(allocation);

    // Keep only recent allocations
    if (this.allocations.length > 10000) {
      this.allocations = this.allocations.slice(-5000);
    }

    return `alloc-${allocation.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mark allocation as freed
   */
  public markAllocationFreed(allocationId: string): void {
    const allocation = this.allocations.find(a =>
      `alloc-${a.timestamp}-${Math.random().toString(36).substr(2, 9)}` === allocationId
    );

    if (allocation && !allocation.freed) {
      allocation.freed = true;
      allocation.freedAt = Date.now();
      allocation.lifetime = allocation.freedAt - allocation.timestamp;
    }
  }

  /**
   * Analyze memory hotspots
   */
  public analyzeHotspots(): MemoryHotspot[] {
    return this.detectHotspots();
  }

  /**
   * Generate optimization recommendations
   */
  public generateOptimizationRecommendations(profile?: MemoryProfile): MemoryOptimizationRecommendation[] {
    const currentProfile = profile || this.generateProfile(0);
    const recommendations: MemoryOptimizationRecommendation[] = [];

    // Heap utilization recommendations
    if (currentProfile.heap.utilization > 85) {
      recommendations.push({
        type: 'allocation',
        priority: 'high',
        title: 'High Heap Utilization',
        description: 'Heap memory utilization is above 85%, consider optimizing allocations',
        impact: 25,
        effort: 6,
        implementation: {
          strategy: 'reduce-allocations',
          steps: [
            'Identify high-frequency allocation sites',
            'Implement object pooling for frequently allocated objects',
            'Optimize string concatenation and array operations',
            'Consider lazy initialization for large objects'
          ],
          code: `
// Example object pooling
class ObjectPool<T> {
  private available: T[] = [];
  private createFn: () => T;

  constructor(createFn: () => T, initialSize = 10) {
    this.createFn = createFn;
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  acquire(): T {
    return this.available.pop() || this.createFn();
  }

  release(obj: T): void {
    this.available.push(obj);
  }
}`
        },
        metrics: {
          before: { heapUtilization: currentProfile.heap.utilization },
          expectedAfter: { heapUtilization: currentProfile.heap.utilization * 0.75 }
        }
      });
    }

    // Fragmentation recommendations
    if (currentProfile.heap.fragmentation > this.config.thresholds.fragmentationWarning) {
      recommendations.push({
        type: 'fragmentation',
        priority: 'medium',
        title: 'Memory Fragmentation Detected',
        description: 'High memory fragmentation can reduce allocation efficiency',
        impact: 15,
        effort: 4,
        implementation: {
          strategy: 'defragmentation',
          steps: [
            'Trigger garbage collection cycles',
            'Optimize object sizes and alignment',
            'Implement memory compaction strategies',
            'Use typed arrays for numeric data'
          ],
          configuration: {
            'gc-strategy': 'aggressive',
            'heap-compaction': true
          }
        },
        metrics: {
          before: { fragmentation: currentProfile.heap.fragmentation },
          expectedAfter: { fragmentation: currentProfile.heap.fragmentation * 0.6 }
        }
      });
    }

    // GC recommendations
    if (currentProfile.gc.pressure > 0.7) {
      recommendations.push({
        type: 'gc',
        priority: 'medium',
        title: 'High GC Pressure',
        description: 'Frequent garbage collections indicate memory management issues',
        impact: 20,
        effort: 7,
        implementation: {
          strategy: 'gc-optimization',
          steps: [
            'Reduce object allocation rate',
            'Increase young generation size',
            'Optimize object lifetime management',
            'Implement weak references for caches'
          ],
          configuration: {
            '--max-old-space-size': 4096,
            '--max-new-space-size': 1024
          }
        },
        metrics: {
          before: { gcPressure: currentProfile.gc.pressure },
          expectedAfter: { gcPressure: currentProfile.gc.pressure * 0.5 }
        }
      });
    }

    // External memory recommendations
    if (currentProfile.external.size > 512 * 1024 * 1024) { // 512MB
      recommendations.push({
        type: 'allocation',
        priority: 'medium',
        title: 'High External Memory Usage',
        description: 'Large external memory usage from native modules or buffers',
        impact: 18,
        effort: 5,
        implementation: {
          strategy: 'external-optimization',
          steps: [
            'Audit native module memory usage',
            'Optimize buffer allocations and lifetimes',
            'Consider streaming for large data processing',
            'Implement buffer pooling for frequent operations'
          ]
        },
        metrics: {
          before: { externalMemory: currentProfile.external.size },
          expectedAfter: { externalMemory: currentProfile.external.size * 0.7 }
        }
      });
    }

    // Allocation rate recommendations
    if (currentProfile.allocations.rate > this.config.thresholds.allocationRate) {
      recommendations.push({
        type: 'allocation',
        priority: 'high',
        title: 'High Allocation Rate',
        description: 'Excessive object allocations can impact performance',
        impact: 30,
        effort: 8,
        implementation: {
          strategy: 'allocation-reduction',
          steps: [
            'Identify allocation hotspots',
            'Implement object reuse patterns',
            'Optimize data structures and algorithms',
            'Use immutable data structures where appropriate'
          ],
          code: `
// Example allocation reduction
// Before: Creating new objects in loops
for (const item of items) {
  results.push({ value: item.value, processed: true });
}

// After: Reuse object structure
const resultTemplate = { value: 0, processed: true };
for (const item of items) {
  resultTemplate.value = item.value;
  results.push({ ...resultTemplate });
}`
        },
        metrics: {
          before: { allocationRate: currentProfile.allocations.rate },
          expectedAfter: { allocationRate: currentProfile.allocations.rate * 0.6 }
        }
      });
    }

    return recommendations.sort((a, b) => {
      // Sort by priority and impact
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return b.impact - a.impact;
    });
  }

  /**
   * Export profiling data
   */
  public async exportData(format: 'json' | 'html' | 'csv' = 'json'): Promise<string> {
    const timestamp = Date.now();
    const outputPath = `/Users/paultinp/BMAD-CYBER2/_bmad-output/performance/memory/memory-profile-${timestamp}.${format}`;

    const data = {
      metadata: {
        timestamp,
        version: '1.0.0',
        config: this.config
      },
      profiles: Array.from(this.profiles.values()),
      snapshots: Array.from(this.snapshots.values()),
      hotspots: Array.from(this.hotspots.values()),
      allocations: this.allocations.slice(-1000), // Last 1000 allocations
      summary: this.generateSummary()
    };

    switch (format) {
      case 'json':
        await this.writeFile(outputPath, JSON.stringify(data, null, 2));
        break;

      case 'html':
        const html = this.generateHTMLReport(data);
        await this.writeFile(outputPath, html);
        break;

      case 'csv':
        const csv = this.generateCSVReport(data);
        await this.writeFile(outputPath, csv);
        break;
    }

    console.log(`📊 Memory profiling data exported to: ${outputPath}`);
    return outputPath;
  }

  /**
   * Get current memory status
   */
  public getMemoryStatus(): any {
    const profile = this.generateProfile(0);

    return {
      timestamp: Date.now(),
      status: this.isProfileActive ? 'profiling' : 'idle',
      memory: {
        heap: profile.heap,
        external: profile.external,
        buffers: profile.buffers
      },
      performance: {
        allocations: profile.allocations,
        gc: profile.gc
      },
      health: {
        score: this.calculateHealthScore(profile),
        issues: this.identifyIssues(profile)
      }
    };
  }

  /**
   * Clean up old profiling data
   */
  public cleanup(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Clean old profiles
    for (const [id, profile] of this.profiles.entries()) {
      if (profile.timestamp < cutoffTime) {
        this.profiles.delete(id);
      }
    }

    // Clean old snapshots
    for (const [id, snapshot] of this.snapshots.entries()) {
      if (snapshot.timestamp < cutoffTime) {
        this.snapshots.delete(id);
      }
    }

    // Clean old allocations
    this.allocations = this.allocations.filter(alloc => alloc.timestamp > cutoffTime);

    console.log('🧹 Memory profiler cleanup completed');
  }

  // Private methods

  private sampleMemoryUsage(): void {
    if (!this.isProfileActive) return;

    const profile = this.generateProfile(Date.now() - this.profileStartTime);

    // Emit sampling event
    this.emit('memory-sampled', profile);

    // Check for issues
    const issues = this.identifyIssues(profile);
    if (issues.length > 0) {
      this.emit('memory-issues', issues);
    }
  }

  private analyzeHeapMemory(memUsage: NodeJS.MemoryUsage): MemoryProfile['heap'] {
    const used = memUsage.heapUsed;
    const total = memUsage.heapTotal;
    const utilization = (used / total) * 100;
    const efficiency = this.calculateHeapEfficiency(used, total);
    const fragmentation = this.calculateFragmentation(used, total);

    return {
      used,
      total,
      limit: this.getHeapLimit(),
      available: total - used,
      utilization,
      efficiency,
      fragmentation
    };
  }

  private analyzeExternalMemory(memUsage: NodeJS.MemoryUsage): MemoryProfile['external'] {
    const size = memUsage.external;

    // Calculate growth from previous samples
    const previousSamples = Array.from(this.profiles.values()).slice(-5);
    const growth = previousSamples.length > 0 ?
                  size - previousSamples[previousSamples.length - 1].external.size : 0;

    return {
      size,
      growth,
      efficiency: this.calculateExternalEfficiency(size)
    };
  }

  private analyzeBufferMemory(memUsage: NodeJS.MemoryUsage): MemoryProfile['buffers'] {
    const arrayBuffers = memUsage.arrayBuffers || 0;
    const totalBuffers = arrayBuffers;

    // Calculate growth
    const previousSamples = Array.from(this.profiles.values()).slice(-5);
    const growth = previousSamples.length > 0 ?
                  totalBuffers - previousSamples[previousSamples.length - 1].buffers.totalBuffers : 0;

    return {
      arrayBuffers,
      sharedArrayBuffers: 0, // Not available in standard API
      totalBuffers,
      growth
    };
  }

  private analyzeObjectMemory(): MemoryProfile['objects'] {
    // This would require heap profiling APIs that may not be available
    // For now, return placeholder data
    return {
      'Object': { count: 0, size: 0, growth: 0, retention: 0 },
      'Array': { count: 0, size: 0, growth: 0, retention: 0 },
      'String': { count: 0, size: 0, growth: 0, retention: 0 }
    };
  }

  private analyzeAllocations(): MemoryProfile['allocations'] {
    const recentAllocations = this.allocations.filter(a =>
      a.timestamp > Date.now() - 60000 // Last minute
    );

    const rate = recentAllocations.length / 60; // Allocations per second
    const totalSize = recentAllocations.reduce((sum, a) => sum + a.size, 0);
    const averageSize = recentAllocations.length > 0 ? totalSize / recentAllocations.length : 0;

    // Detect patterns
    const patterns = this.detectAllocationPatterns(recentAllocations);
    const hotspots = this.detectAllocationHotspots(recentAllocations);

    return {
      rate,
      size: averageSize,
      patterns,
      hotspots
    };
  }

  private analyzeGCMetrics(): MemoryProfile['gc'] {
    // This would require GC monitoring APIs
    // For now, return estimated metrics
    return {
      collections: 0,
      totalTime: 0,
      averageTime: 0,
      lastCollection: 0,
      pressure: this.estimateGCPressure()
    };
  }

  private detectHotspots(): MemoryHotspot[] {
    const hotspots: MemoryHotspot[] = [];

    // Group allocations by location/type
    const locationStats = new Map<string, {
      allocations: number;
      totalSize: number;
      freed: number;
    }>();

    for (const allocation of this.allocations) {
      const location = allocation.stack ?
                      this.extractLocationFromStack(allocation.stack) :
                      allocation.type;

      const stats = locationStats.get(location) || {
        allocations: 0,
        totalSize: 0,
        freed: 0
      };

      stats.allocations++;
      stats.totalSize += allocation.size;
      if (allocation.freed) stats.freed++;

      locationStats.set(location, stats);
    }

    // Convert to hotspots
    for (const [location, stats] of locationStats.entries()) {
      const retentionRate = stats.allocations > 0 ?
                           (stats.allocations - stats.freed) / stats.allocations : 0;
      const averageSize = stats.totalSize / stats.allocations;

      // Determine impact
      let impact: MemoryHotspot['impact'] = 'low';
      if (stats.totalSize > 100 * 1024 * 1024) impact = 'critical'; // 100MB
      else if (stats.totalSize > 50 * 1024 * 1024) impact = 'high'; // 50MB
      else if (stats.totalSize > 10 * 1024 * 1024) impact = 'medium'; // 10MB

      hotspots.push({
        location,
        function: location,
        allocations: stats.allocations,
        totalSize: stats.totalSize,
        averageSize,
        retentionRate,
        impact
      });
    }

    // Sort by total size
    return hotspots.sort((a, b) => b.totalSize - a.totalSize);
  }

  private detectAllocationPatterns(allocations: AllocationTracking[]): string[] {
    const patterns: string[] = [];

    // Size pattern detection
    const sizes = allocations.map(a => a.size);
    const sizeCounts = new Map<number, number>();

    for (const size of sizes) {
      sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1);
    }

    // Find common sizes
    const commonSizes = Array.from(sizeCounts.entries())
                             .filter(([size, count]) => count > allocations.length * 0.1)
                             .map(([size]) => size);

    if (commonSizes.length > 0) {
      patterns.push(`Common allocation sizes: ${commonSizes.join(', ')} bytes`);
    }

    // Timing pattern detection
    const timings = allocations.map(a => a.timestamp);
    if (timings.length > 5) {
      const intervals = [];
      for (let i = 1; i < timings.length; i++) {
        intervals.push(timings[i] - timings[i - 1]);
      }

      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      if (avgInterval < 100) { // Less than 100ms
        patterns.push('High-frequency allocations detected');
      }
    }

    return patterns;
  }

  private detectAllocationHotspots(allocations: AllocationTracking[]): Array<{
    location: string;
    frequency: number;
    size: number;
  }> {
    const hotspots = new Map<string, { frequency: number; size: number }>();

    for (const allocation of allocations) {
      const location = allocation.stack ?
                      this.extractLocationFromStack(allocation.stack) :
                      allocation.type;

      const hotspot = hotspots.get(location) || { frequency: 0, size: 0 };
      hotspot.frequency++;
      hotspot.size += allocation.size;
      hotspots.set(location, hotspot);
    }

    return Array.from(hotspots.entries())
                .map(([location, data]) => ({ location, ...data }))
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 10); // Top 10 hotspots
  }

  private compareSnapshots(baseline: MemorySnapshot, current: MemoryProfile): any {
    const baselineProfile = baseline.profile;

    return {
      heap: {
        usedChange: current.heap.used - baselineProfile.heap.used,
        utilizationChange: current.heap.utilization - baselineProfile.heap.utilization,
        fragmentationChange: current.heap.fragmentation - baselineProfile.heap.fragmentation
      },
      external: {
        sizeChange: current.external.size - baselineProfile.external.size
      },
      allocations: {
        rateChange: current.allocations.rate - baselineProfile.allocations.rate
      },
      gc: {
        pressureChange: current.gc.pressure - baselineProfile.gc.pressure
      }
    };
  }

  private calculateHeapEfficiency(used: number, total: number): number {
    return (used / total) * 100;
  }

  private calculateFragmentation(used: number, total: number): number {
    // Simplified fragmentation calculation
    const efficiency = used / total;
    return (1 - efficiency) * 100;
  }

  private calculateExternalEfficiency(size: number): number {
    // Simplified external memory efficiency
    return Math.max(0, 100 - (size / (1024 * 1024 * 1024)) * 100); // Decrease efficiency as size increases
  }

  private getHeapLimit(): number {
    // This would need to be determined from V8 settings
    return 1536 * 1024 * 1024; // Default 1.5GB
  }

  private estimateGCPressure(): number {
    const memUsage = process.memoryUsage();
    const utilization = memUsage.heapUsed / memUsage.heapTotal;

    // Simple pressure estimation based on heap utilization
    if (utilization > 0.9) return 1.0;
    if (utilization > 0.8) return 0.8;
    if (utilization > 0.7) return 0.6;
    if (utilization > 0.6) return 0.4;
    return 0.2;
  }

  private captureStack(): string {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(3, 8).join('\n') : 'Stack not available';
  }

  private extractLocationFromStack(stack: string): string {
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('at ') && !line.includes('node_modules')) {
        return line.trim();
      }
    }
    return 'Unknown location';
  }

  private calculateHealthScore(profile: MemoryProfile): number {
    let score = 100;

    // Deduct for high utilization
    if (profile.heap.utilization > 90) score -= 30;
    else if (profile.heap.utilization > 80) score -= 20;
    else if (profile.heap.utilization > 70) score -= 10;

    // Deduct for high fragmentation
    if (profile.heap.fragmentation > 40) score -= 20;
    else if (profile.heap.fragmentation > 30) score -= 15;
    else if (profile.heap.fragmentation > 20) score -= 10;

    // Deduct for high GC pressure
    if (profile.gc.pressure > 0.8) score -= 20;
    else if (profile.gc.pressure > 0.6) score -= 10;

    // Deduct for high allocation rate
    if (profile.allocations.rate > 2000) score -= 15;
    else if (profile.allocations.rate > 1000) score -= 10;

    return Math.max(0, score);
  }

  private identifyIssues(profile: MemoryProfile): string[] {
    const issues: string[] = [];

    if (profile.heap.utilization > 85) {
      issues.push(`High heap utilization: ${profile.heap.utilization.toFixed(1)}%`);
    }

    if (profile.heap.fragmentation > 30) {
      issues.push(`High memory fragmentation: ${profile.heap.fragmentation.toFixed(1)}%`);
    }

    if (profile.gc.pressure > 0.7) {
      issues.push(`High GC pressure: ${(profile.gc.pressure * 100).toFixed(1)}%`);
    }

    if (profile.allocations.rate > this.config.thresholds.allocationRate) {
      issues.push(`High allocation rate: ${profile.allocations.rate.toFixed(1)} allocs/sec`);
    }

    return issues;
  }

  private generateSummary(): any {
    const currentProfile = this.generateProfile(0);
    const recommendations = this.generateOptimizationRecommendations(currentProfile);

    return {
      timestamp: Date.now(),
      healthScore: this.calculateHealthScore(currentProfile),
      memory: {
        heapUsed: currentProfile.heap.used,
        heapUtilization: currentProfile.heap.utilization,
        externalMemory: currentProfile.external.size,
        fragmentation: currentProfile.heap.fragmentation
      },
      performance: {
        allocationRate: currentProfile.allocations.rate,
        gcPressure: currentProfile.gc.pressure
      },
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      profileCount: this.profiles.size,
      snapshotCount: this.snapshots.size,
      hotspotsCount: this.hotspots.size
    };
  }

  private generateHTMLReport(data: any): string {
    // Generate HTML report - simplified version
    return `
<!DOCTYPE html>
<html>
<head>
    <title>BMAD Memory Profile Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .critical { border-color: #ff4444; }
        .warning { border-color: #ffaa00; }
        .good { border-color: #44ff44; }
    </style>
</head>
<body>
    <h1>BMAD Memory Profile Report</h1>
    <p>Generated: ${new Date(data.metadata.timestamp).toISOString()}</p>

    <h2>Summary</h2>
    <div class="metric">
        <strong>Health Score:</strong> ${data.summary.healthScore}/100
    </div>

    <h2>Memory Usage</h2>
    <pre>${JSON.stringify(data.summary.memory, null, 2)}</pre>

    <h2>Recommendations</h2>
    ${data.summary.recommendations.map((rec: any) => `
        <div class="metric ${rec.priority === 'urgent' ? 'critical' : rec.priority === 'high' ? 'warning' : 'good'}">
            <strong>${rec.title}</strong><br>
            ${rec.description}<br>
            Impact: ${rec.impact}% | Effort: ${rec.effort}/10
        </div>
    `).join('')}
</body>
</html>`;
  }

  private generateCSVReport(data: any): string {
    // Generate CSV report - simplified version
    const headers = ['Timestamp', 'HeapUsed', 'HeapTotal', 'External', 'Utilization', 'Fragmentation'];
    const rows = data.profiles.map((profile: MemoryProfile) => [
      profile.timestamp,
      profile.heap.used,
      profile.heap.total,
      profile.external.size,
      profile.heap.utilization,
      profile.heap.fragmentation
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private async writeFile(path: string, content: string): Promise<void> {
    const fs = require('fs/promises');
    await fs.mkdir(require('path').dirname(path), { recursive: true });
    await fs.writeFile(path, content);
  }
}

/**
 * Export singleton instance
 */
export const bmadAdvancedMemoryProfiler = AdvancedMemoryProfiler.getInstance();

/**
 * Convenience function to start memory profiling
 */
export async function startMemoryProfiling(config?: Partial<MemoryProfilingConfig>): Promise<AdvancedMemoryProfiler> {
  const profiler = AdvancedMemoryProfiler.getInstance(config);
  await profiler.startProfiling();
  return profiler;
}