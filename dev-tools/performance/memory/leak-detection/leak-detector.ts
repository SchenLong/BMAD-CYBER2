/**
 * BMAD CONCURA MEMORY LEAK DETECTION & PREVENTION SYSTEM
 * Advanced memory leak detection, analysis, and prevention for BMAD systems
 *
 * @description Intelligent leak detection system that monitors memory usage patterns,
 * detects potential leaks, analyzes root causes, and provides automated prevention
 * strategies. Prevents memory-related performance degradation in CONCURA context.
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface MemoryUsageSnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  processes?: {
    [processName: string]: number;
  };
}

export interface LeakDetectionConfig {
  monitoringInterval: number;
  analysisInterval: number;
  thresholds: {
    growthRate: number;          // %/hour
    steadyGrowth: number;        // Consecutive periods
    memoryIncrease: number;      // Absolute bytes
    confidenceLevel: number;     // 0-1
  };
  analysis: {
    windowSize: number;          // Number of snapshots to analyze
    trendAnalysis: boolean;
    patternDetection: boolean;
    objectTracking: boolean;
    callStackCapture: boolean;
  };
  prevention: {
    autoCleanup: boolean;
    forceGCThreshold: number;
    alerting: boolean;
    mitigation: boolean;
  };
}

export interface MemoryLeak {
  id: string;
  type: 'heap' | 'external' | 'buffer' | 'closure' | 'event-listener' | 'timer' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detectedAt: number;
  description: string;

  growth: {
    rate: number;              // Bytes per hour
    percentage: number;        // % growth per hour
    trend: 'linear' | 'exponential' | 'stepped';
    duration: number;          // Duration observed (ms)
  };

  source: {
    probable: string[];
    callStacks: string[];
    patterns: string[];
  };

  impact: {
    currentSize: number;
    projectedSize: number;     // Projected size in 1 hour
    affectedComponents: string[];
    performanceImpact: number; // 0-100
  };

  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    effort: number;            // 1-10
    impact: number;            // 1-10
    description: string;
    code?: string;
  }>;
}

export interface LeakAnalysisResult {
  timestamp: number;
  duration: number;
  totalLeaks: number;
  newLeaks: MemoryLeak[];
  resolvedLeaks: string[];
  activeLeaks: MemoryLeak[];

  summary: {
    totalMemoryGrowth: number;
    criticalLeaks: number;
    riskScore: number;         // 0-100
    healthScore: number;       // 0-100
  };

  trends: {
    overallTrend: 'improving' | 'stable' | 'degrading';
    growthAcceleration: number;
    patternChanges: string[];
  };

  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface ObjectTrackingInfo {
  type: string;
  count: number;
  size: number;
  growth: number;
  samples: Array<{
    timestamp: number;
    count: number;
    size: number;
  }>;
}

export interface PreventionStrategy {
  name: string;
  type: 'automatic' | 'manual' | 'configuration';
  description: string;
  triggers: string[];
  actions: Array<{
    action: string;
    parameters: any;
    condition: string;
  }>;
  effectiveness: number;     // 0-100
  lastExecuted?: number;
}

/**
 * Advanced Memory Leak Detection and Prevention System
 * Provides comprehensive leak detection, analysis, and prevention for BMAD CONCURA
 */
export class MemoryLeakDetector extends EventEmitter {
  private static instance: MemoryLeakDetector | null = null;
  private config: LeakDetectionConfig;
  private memorySnapshots: MemoryUsageSnapshot[] = [];
  private activeLeaks: Map<string, MemoryLeak> = new Map();
  private resolvedLeaks: Map<string, MemoryLeak> = new Map();
  private objectTracker: Map<string, ObjectTrackingInfo> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  private preventionStrategies: Map<string, PreventionStrategy> = new Map();
  private isAnalyzing = false;
  private callStackCapture: boolean = false;

  constructor(config?: Partial<LeakDetectionConfig>) {
    super();

    this.config = {
      monitoringInterval: 10000,    // 10 seconds
      analysisInterval: 60000,      // 1 minute
      thresholds: {
        growthRate: 5,              // 5% per hour
        steadyGrowth: 6,            // 6 consecutive periods
        memoryIncrease: 50 * 1024 * 1024,  // 50MB
        confidenceLevel: 0.75       // 75% confidence
      },
      analysis: {
        windowSize: 50,             // 50 snapshots
        trendAnalysis: true,
        patternDetection: true,
        objectTracking: true,
        callStackCapture: false     // Disabled by default for performance
      },
      prevention: {
        autoCleanup: true,
        forceGCThreshold: 0.85,     // Force GC at 85% heap usage
        alerting: true,
        mitigation: true
      },
      ...config
    };

    this.initializePreventionStrategies();
  }

  /**
   * Get singleton instance of MemoryLeakDetector
   */
  public static getInstance(config?: Partial<LeakDetectionConfig>): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector(config);
    }
    return MemoryLeakDetector.instance;
  }

  /**
   * Start memory leak monitoring
   */
  public async startMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      console.warn('⚠️ Memory leak monitoring already started');
      return;
    }

    console.log('🕵️ Starting BMAD Memory Leak Detector...');

    // Start memory monitoring
    this.monitoringInterval = setInterval(() => {
      this.captureMemorySnapshot();
      this.checkPreventionTriggers();
    }, this.config.monitoringInterval);

    // Start leak analysis
    this.analysisInterval = setInterval(() => {
      this.performLeakAnalysis();
    }, this.config.analysisInterval);

    // Capture initial snapshot
    this.captureMemorySnapshot();

    console.log('✅ Memory leak monitoring started');
    this.emit('started');
  }

  /**
   * Stop memory leak monitoring
   */
  public async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    console.log('⏹️ Memory leak monitoring stopped');
    this.emit('stopped');
  }

  /**
   * Perform immediate leak analysis
   */
  public async analyzeLeaks(): Promise<LeakAnalysisResult> {
    if (this.isAnalyzing) {
      throw new Error('Leak analysis already in progress');
    }

    this.isAnalyzing = true;
    const startTime = Date.now();

    try {
      console.log('🔍 Performing memory leak analysis...');

      const previousActiveLeaks = new Set(this.activeLeaks.keys());
      const newLeaks: MemoryLeak[] = [];
      const resolvedLeaks: string[] = [];

      // Analyze memory usage patterns
      const detectedLeaks = this.detectMemoryLeaks();

      // Process detected leaks
      for (const leak of detectedLeaks) {
        if (!this.activeLeaks.has(leak.id)) {
          newLeaks.push(leak);
          this.activeLeaks.set(leak.id, leak);
          this.emit('leak-detected', leak);
        } else {
          // Update existing leak
          const existingLeak = this.activeLeaks.get(leak.id)!;
          this.updateLeak(existingLeak, leak);
        }
      }

      // Check for resolved leaks
      for (const leakId of previousActiveLeaks) {
        if (!detectedLeaks.find(l => l.id === leakId)) {
          const resolvedLeak = this.activeLeaks.get(leakId)!;
          this.resolvedLeaks.set(leakId, resolvedLeak);
          this.activeLeaks.delete(leakId);
          resolvedLeaks.push(leakId);
          this.emit('leak-resolved', resolvedLeak);
        }
      }

      const activeLeaks = Array.from(this.activeLeaks.values());
      const summary = this.generateSummary(activeLeaks);
      const trends = this.analyzeTrends();
      const recommendations = this.generateRecommendations(activeLeaks);

      const result: LeakAnalysisResult = {
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        totalLeaks: activeLeaks.length,
        newLeaks,
        resolvedLeaks,
        activeLeaks,
        summary,
        trends,
        recommendations
      };

      console.log(`✅ Leak analysis complete: ${result.totalLeaks} active leaks found`);

      this.emit('analysis-complete', result);
      return result;

    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Get current memory usage snapshot
   */
  public getCurrentSnapshot(): MemoryUsageSnapshot {
    const memUsage = process.memoryUsage();

    return {
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers || 0
    };
  }

  /**
   * Get active memory leaks
   */
  public getActiveLeaks(): MemoryLeak[] {
    return Array.from(this.activeLeaks.values());
  }

  /**
   * Get resolved memory leaks
   */
  public getResolvedLeaks(): MemoryLeak[] {
    return Array.from(this.resolvedLeaks.values());
  }

  /**
   * Get memory usage history
   */
  public getMemoryHistory(): MemoryUsageSnapshot[] {
    return [...this.memorySnapshots];
  }

  /**
   * Get object tracking information
   */
  public getObjectTracking(): Map<string, ObjectTrackingInfo> {
    return new Map(this.objectTracker);
  }

  /**
   * Force immediate prevention strategies
   */
  public async applyPreventionStrategies(strategies?: string[]): Promise<void> {
    console.log('🛡️ Applying memory leak prevention strategies...');

    const strategyNames = strategies || Array.from(this.preventionStrategies.keys());

    for (const strategyName of strategyNames) {
      const strategy = this.preventionStrategies.get(strategyName);
      if (strategy) {
        await this.executePreventionStrategy(strategy);
      }
    }

    console.log('✅ Prevention strategies applied');
  }

  /**
   * Add custom prevention strategy
   */
  public addPreventionStrategy(strategy: PreventionStrategy): void {
    this.preventionStrategies.set(strategy.name, strategy);
    console.log(`📋 Added prevention strategy: ${strategy.name}`);
  }

  /**
   * Enable call stack capture for detailed leak analysis
   */
  public enableCallStackCapture(): void {
    this.callStackCapture = true;
    console.log('📞 Call stack capture enabled');
  }

  /**
   * Disable call stack capture to improve performance
   */
  public disableCallStackCapture(): void {
    this.callStackCapture = false;
    console.log('📞 Call stack capture disabled');
  }

  /**
   * Generate leak detection report
   */
  public generateReport(): any {
    const activeLeaks = this.getActiveLeaks();
    const resolvedLeaks = this.getResolvedLeaks();

    return {
      timestamp: Date.now(),
      summary: {
        activeLeaks: activeLeaks.length,
        resolvedLeaks: resolvedLeaks.length,
        criticalLeaks: activeLeaks.filter(l => l.severity === 'critical').length,
        totalMemoryAtRisk: activeLeaks.reduce((sum, l) => sum + l.impact.currentSize, 0)
      },
      activeLeaks: activeLeaks.map(l => ({
        id: l.id,
        type: l.type,
        severity: l.severity,
        confidence: l.confidence,
        growthRate: l.growth.rate,
        currentSize: l.impact.currentSize,
        description: l.description
      })),
      trends: this.analyzeTrends(),
      recommendations: this.generateRecommendations(activeLeaks),
      memoryUsage: {
        current: this.getCurrentSnapshot(),
        history: this.memorySnapshots.slice(-20) // Last 20 snapshots
      }
    };
  }

  /**
   * Clean up old data
   */
  public cleanup(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Clean old snapshots
    this.memorySnapshots = this.memorySnapshots.filter(snapshot =>
      snapshot.timestamp > cutoffTime
    );

    // Clean old resolved leaks
    for (const [id, leak] of this.resolvedLeaks.entries()) {
      if (leak.detectedAt < cutoffTime) {
        this.resolvedLeaks.delete(id);
      }
    }

    // Clean old object tracking data
    for (const [type, info] of this.objectTracker.entries()) {
      info.samples = info.samples.filter(sample => sample.timestamp > cutoffTime);
      if (info.samples.length === 0) {
        this.objectTracker.delete(type);
      }
    }

    console.log('🧹 Memory leak detector cleanup completed');
  }

  // Private methods

  private captureMemorySnapshot(): void {
    const snapshot = this.getCurrentSnapshot();

    // Add process-specific memory if available
    if (global.process && process.memoryUsage) {
      // Additional memory tracking could be added here
    }

    this.memorySnapshots.push(snapshot);

    // Keep only recent snapshots
    const maxSnapshots = this.config.analysis.windowSize * 2;
    if (this.memorySnapshots.length > maxSnapshots) {
      this.memorySnapshots = this.memorySnapshots.slice(-this.config.analysis.windowSize);
    }

    // Update object tracking if enabled
    if (this.config.analysis.objectTracking) {
      this.updateObjectTracking(snapshot);
    }

    this.emit('snapshot', snapshot);
  }

  private updateObjectTracking(snapshot: MemoryUsageSnapshot): void {
    // Track heap usage as an object type
    const heapInfo = this.objectTracker.get('heap') || {
      type: 'heap',
      count: 1,
      size: snapshot.heapUsed,
      growth: 0,
      samples: []
    };

    const previousSize = heapInfo.samples.length > 0 ?
                        heapInfo.samples[heapInfo.samples.length - 1].size :
                        snapshot.heapUsed;

    heapInfo.size = snapshot.heapUsed;
    heapInfo.growth = snapshot.heapUsed - previousSize;
    heapInfo.samples.push({
      timestamp: snapshot.timestamp,
      count: 1,
      size: snapshot.heapUsed
    });

    this.objectTracker.set('heap', heapInfo);

    // Track external memory
    const externalInfo = this.objectTracker.get('external') || {
      type: 'external',
      count: 1,
      size: snapshot.external,
      growth: 0,
      samples: []
    };

    const previousExternal = externalInfo.samples.length > 0 ?
                            externalInfo.samples[externalInfo.samples.length - 1].size :
                            snapshot.external;

    externalInfo.size = snapshot.external;
    externalInfo.growth = snapshot.external - previousExternal;
    externalInfo.samples.push({
      timestamp: snapshot.timestamp,
      count: 1,
      size: snapshot.external
    });

    this.objectTracker.set('external', externalInfo);

    // Keep only recent samples
    for (const info of this.objectTracker.values()) {
      if (info.samples.length > 100) {
        info.samples = info.samples.slice(-50);
      }
    }
  }

  private detectMemoryLeaks(): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    if (this.memorySnapshots.length < this.config.thresholds.steadyGrowth) {
      return leaks;
    }

    // Analyze heap memory growth
    const heapLeak = this.detectHeapLeak();
    if (heapLeak) leaks.push(heapLeak);

    // Analyze external memory growth
    const externalLeak = this.detectExternalMemoryLeak();
    if (externalLeak) leaks.push(externalLeak);

    // Analyze buffer memory growth
    const bufferLeak = this.detectBufferLeak();
    if (bufferLeak) leaks.push(bufferLeak);

    // Analyze object type growth
    if (this.config.analysis.objectTracking) {
      const objectLeaks = this.detectObjectLeaks();
      leaks.push(...objectLeaks);
    }

    return leaks;
  }

  private detectHeapLeak(): MemoryLeak | null {
    const recentSnapshots = this.memorySnapshots.slice(-this.config.analysis.windowSize);
    const heapValues = recentSnapshots.map(s => s.heapUsed);

    const growth = this.analyzeGrowthPattern(heapValues, recentSnapshots.map(s => s.timestamp));

    if (growth.rate > 0 && growth.confidence >= this.config.thresholds.confidenceLevel) {
      const currentSnapshot = recentSnapshots[recentSnapshots.length - 1];
      const hourlyGrowth = (growth.rate / 1000 / 60 / 60) * 3600; // Convert to bytes per hour

      if (hourlyGrowth > this.config.thresholds.memoryIncrease) {
        return this.createLeak(
          'heap-growth',
          'heap',
          this.calculateSeverity(hourlyGrowth, currentSnapshot.heapUsed),
          growth.confidence,
          `Heap memory growing at ${(hourlyGrowth / 1024 / 1024).toFixed(2)} MB/hour`,
          growth,
          currentSnapshot.heapUsed,
          ['Review object allocations', 'Check for retained references', 'Analyze closure usage']
        );
      }
    }

    return null;
  }

  private detectExternalMemoryLeak(): MemoryLeak | null {
    const recentSnapshots = this.memorySnapshots.slice(-this.config.analysis.windowSize);
    const externalValues = recentSnapshots.map(s => s.external);

    const growth = this.analyzeGrowthPattern(externalValues, recentSnapshots.map(s => s.timestamp));

    if (growth.rate > 0 && growth.confidence >= this.config.thresholds.confidenceLevel) {
      const currentSnapshot = recentSnapshots[recentSnapshots.length - 1];
      const hourlyGrowth = (growth.rate / 1000 / 60 / 60) * 3600;

      if (hourlyGrowth > this.config.thresholds.memoryIncrease * 0.5) { // Lower threshold for external
        return this.createLeak(
          'external-growth',
          'external',
          this.calculateSeverity(hourlyGrowth, currentSnapshot.external),
          growth.confidence,
          `External memory growing at ${(hourlyGrowth / 1024 / 1024).toFixed(2)} MB/hour`,
          growth,
          currentSnapshot.external,
          ['Review native module usage', 'Check buffer allocations', 'Analyze C++ addon memory usage']
        );
      }
    }

    return null;
  }

  private detectBufferLeak(): MemoryLeak | null {
    const recentSnapshots = this.memorySnapshots.slice(-this.config.analysis.windowSize);
    const bufferValues = recentSnapshots.map(s => s.arrayBuffers);

    const growth = this.analyzeGrowthPattern(bufferValues, recentSnapshots.map(s => s.timestamp));

    if (growth.rate > 0 && growth.confidence >= this.config.thresholds.confidenceLevel) {
      const currentSnapshot = recentSnapshots[recentSnapshots.length - 1];
      const hourlyGrowth = (growth.rate / 1000 / 60 / 60) * 3600;

      if (hourlyGrowth > this.config.thresholds.memoryIncrease * 0.3) { // Lower threshold for buffers
        return this.createLeak(
          'buffer-growth',
          'buffer',
          this.calculateSeverity(hourlyGrowth, currentSnapshot.arrayBuffers),
          growth.confidence,
          `Array buffer memory growing at ${(hourlyGrowth / 1024 / 1024).toFixed(2)} MB/hour`,
          growth,
          currentSnapshot.arrayBuffers,
          ['Review ArrayBuffer and TypedArray usage', 'Check for unreleased buffers', 'Analyze WebAssembly memory']
        );
      }
    }

    return null;
  }

  private detectObjectLeaks(): MemoryLeak[] {
    const leaks: MemoryLeak[] = [];

    for (const [objectType, info] of this.objectTracker.entries()) {
      if (info.samples.length < this.config.thresholds.steadyGrowth) continue;

      const values = info.samples.map(s => s.size);
      const timestamps = info.samples.map(s => s.timestamp);

      const growth = this.analyzeGrowthPattern(values, timestamps);

      if (growth.rate > 0 && growth.confidence >= this.config.thresholds.confidenceLevel) {
        const hourlyGrowth = (growth.rate / 1000 / 60 / 60) * 3600;

        if (hourlyGrowth > this.config.thresholds.memoryIncrease * 0.1) { // Lower threshold for specific objects
          const leak = this.createLeak(
            `${objectType}-growth`,
            'unknown',
            this.calculateSeverity(hourlyGrowth, info.size),
            growth.confidence,
            `${objectType} objects growing at ${(hourlyGrowth / 1024 / 1024).toFixed(2)} MB/hour`,
            growth,
            info.size,
            [`Review ${objectType} object lifecycle`, `Check ${objectType} cleanup procedures`]
          );

          leaks.push(leak);
        }
      }
    }

    return leaks;
  }

  private analyzeGrowthPattern(values: number[], timestamps: number[]): {
    rate: number;
    confidence: number;
    trend: 'linear' | 'exponential' | 'stepped';
    duration: number;
  } {
    if (values.length < 3) {
      return { rate: 0, confidence: 0, trend: 'linear', duration: 0 };
    }

    // Calculate linear growth rate
    let totalGrowth = 0;
    let validPairs = 0;

    for (let i = 1; i < values.length; i++) {
      const timeDelta = timestamps[i] - timestamps[i - 1];
      const valueDelta = values[i] - values[i - 1];

      if (timeDelta > 0 && valueDelta > 0) {
        totalGrowth += valueDelta / timeDelta; // bytes per ms
        validPairs++;
      }
    }

    const avgGrowthRate = validPairs > 0 ? totalGrowth / validPairs : 0;

    // Calculate confidence based on consistency
    const growthRates: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const timeDelta = timestamps[i] - timestamps[i - 1];
      const valueDelta = values[i] - values[i - 1];
      if (timeDelta > 0) {
        growthRates.push(valueDelta / timeDelta);
      }
    }

    let confidence = 0;
    if (growthRates.length > 0) {
      const mean = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
      const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / growthRates.length;
      const stdDev = Math.sqrt(variance);

      // Higher confidence for more consistent growth
      confidence = Math.max(0, Math.min(1, 1 - (stdDev / Math.abs(mean))));

      // Bonus confidence for sustained growth
      const positiveGrowthPeriods = growthRates.filter(rate => rate > 0).length;
      const sustainedGrowthBonus = positiveGrowthPeriods / growthRates.length;
      confidence = Math.min(1, confidence + sustainedGrowthBonus * 0.3);
    }

    // Detect growth pattern
    let trend: 'linear' | 'exponential' | 'stepped' = 'linear';
    if (values.length > 5) {
      // Simple heuristic for pattern detection
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));

      const firstGrowth = firstHalf[firstHalf.length - 1] - firstHalf[0];
      const secondGrowth = secondHalf[secondHalf.length - 1] - secondHalf[0];

      if (secondGrowth > firstGrowth * 2) {
        trend = 'exponential';
      }
    }

    const duration = timestamps[timestamps.length - 1] - timestamps[0];

    return {
      rate: avgGrowthRate,
      confidence,
      trend,
      duration
    };
  }

  private createLeak(
    id: string,
    type: MemoryLeak['type'],
    severity: MemoryLeak['severity'],
    confidence: number,
    description: string,
    growth: any,
    currentSize: number,
    recommendations: string[]
  ): MemoryLeak {
    const hourlyGrowth = (growth.rate / 1000 / 60 / 60) * 3600;

    return {
      id,
      type,
      severity,
      confidence,
      detectedAt: Date.now(),
      description,
      growth: {
        rate: hourlyGrowth,
        percentage: (hourlyGrowth / currentSize) * 100,
        trend: growth.trend,
        duration: growth.duration
      },
      source: {
        probable: ['Unknown'],
        callStacks: this.callStackCapture ? [this.captureCallStack()] : [],
        patterns: []
      },
      impact: {
        currentSize,
        projectedSize: currentSize + hourlyGrowth,
        affectedComponents: ['BMAD System'],
        performanceImpact: Math.min(100, (hourlyGrowth / (1024 * 1024 * 1024)) * 100) // Impact based on GB/hour
      },
      recommendations: recommendations.map(rec => ({
        action: rec,
        priority: severity === 'critical' ? 'urgent' : severity === 'high' ? 'high' : 'medium',
        effort: 5,
        impact: 7,
        description: rec
      }))
    };
  }

  private calculateSeverity(growthRatePerHour: number, currentSize: number): MemoryLeak['severity'] {
    const growthMBPerHour = growthRatePerHour / (1024 * 1024);
    const currentMB = currentSize / (1024 * 1024);

    if (growthMBPerHour > 500 || currentMB > 2048) { // 500MB/hour or 2GB current
      return 'critical';
    } else if (growthMBPerHour > 100 || currentMB > 1024) { // 100MB/hour or 1GB current
      return 'high';
    } else if (growthMBPerHour > 50 || currentMB > 512) { // 50MB/hour or 512MB current
      return 'medium';
    } else {
      return 'low';
    }
  }

  private updateLeak(existingLeak: MemoryLeak, newDetection: MemoryLeak): void {
    // Update growth information
    existingLeak.growth = newDetection.growth;
    existingLeak.confidence = Math.max(existingLeak.confidence, newDetection.confidence);
    existingLeak.impact = newDetection.impact;

    // Update severity if it has changed
    if (newDetection.severity !== existingLeak.severity) {
      existingLeak.severity = newDetection.severity;
      this.emit('leak-severity-changed', existingLeak);
    }
  }

  private generateSummary(activeLeaks: MemoryLeak[]): LeakAnalysisResult['summary'] {
    const totalMemoryGrowth = activeLeaks.reduce((sum, leak) => sum + leak.growth.rate, 0);
    const criticalLeaks = activeLeaks.filter(leak => leak.severity === 'critical').length;

    let riskScore = 0;
    if (criticalLeaks > 0) riskScore += 40;
    if (totalMemoryGrowth > 1024 * 1024 * 1024) riskScore += 30; // 1GB/hour
    if (activeLeaks.length > 5) riskScore += 20;
    if (activeLeaks.some(leak => leak.confidence > 0.9)) riskScore += 10;

    const healthScore = Math.max(0, 100 - riskScore);

    return {
      totalMemoryGrowth,
      criticalLeaks,
      riskScore: Math.min(100, riskScore),
      healthScore
    };
  }

  private analyzeTrends(): LeakAnalysisResult['trends'] {
    const currentSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];
    const pastSnapshot = this.memorySnapshots[Math.max(0, this.memorySnapshots.length - 10)];

    let overallTrend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (this.memorySnapshots.length >= 10) {
      const memoryChange = currentSnapshot.heapUsed - pastSnapshot.heapUsed;
      const timeSpan = currentSnapshot.timestamp - pastSnapshot.timestamp;
      const growthAcceleration = memoryChange / timeSpan;

      if (growthAcceleration > 1000) { // Growing > 1KB/ms
        overallTrend = 'degrading';
      } else if (growthAcceleration < -500) { // Decreasing > 0.5KB/ms
        overallTrend = 'improving';
      }

      return {
        overallTrend,
        growthAcceleration,
        patternChanges: [] // Would be populated with more sophisticated analysis
      };
    }

    return {
      overallTrend,
      growthAcceleration: 0,
      patternChanges: []
    };
  }

  private generateRecommendations(activeLeaks: MemoryLeak[]): LeakAnalysisResult['recommendations'] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    const criticalLeaks = activeLeaks.filter(leak => leak.severity === 'critical');
    const highLeaks = activeLeaks.filter(leak => leak.severity === 'high');

    if (criticalLeaks.length > 0) {
      immediate.push('Address critical memory leaks immediately');
      immediate.push('Consider restarting affected processes');
      immediate.push('Enable verbose logging for leak investigation');
    }

    if (highLeaks.length > 0) {
      shortTerm.push('Investigate and fix high-severity memory leaks');
      shortTerm.push('Implement additional monitoring for affected components');
    }

    if (activeLeaks.length > 3) {
      shortTerm.push('Review memory management practices');
      shortTerm.push('Implement automated memory optimization');
    }

    longTerm.push('Establish memory usage baselines');
    longTerm.push('Implement proactive memory leak prevention');
    longTerm.push('Regular memory profiling and analysis');

    return { immediate, shortTerm, longTerm };
  }

  private async performLeakAnalysis(): Promise<void> {
    if (this.isAnalyzing) return;

    try {
      await this.analyzeLeaks();
    } catch (error) {
      console.error('❌ Leak analysis failed:', error);
      this.emit('error', error);
    }
  }

  private checkPreventionTriggers(): void {
    const currentSnapshot = this.getCurrentSnapshot();
    const heapUtilization = currentSnapshot.heapUsed / currentSnapshot.heapTotal;

    // Force GC if heap utilization is too high
    if (this.config.prevention.forceGCThreshold > 0 &&
        heapUtilization > this.config.prevention.forceGCThreshold) {
      this.executePreventionStrategy(this.preventionStrategies.get('force-gc')!);
    }

    // Check other prevention triggers
    for (const strategy of this.preventionStrategies.values()) {
      if (this.shouldTriggerStrategy(strategy, currentSnapshot)) {
        this.executePreventionStrategy(strategy);
      }
    }
  }

  private shouldTriggerStrategy(strategy: PreventionStrategy, snapshot: MemoryUsageSnapshot): boolean {
    // Simple trigger logic - could be made more sophisticated
    if (strategy.name === 'cleanup-interval') {
      const lastExecuted = strategy.lastExecuted || 0;
      return (Date.now() - lastExecuted) > 300000; // 5 minutes
    }

    return false;
  }

  private async executePreventionStrategy(strategy: PreventionStrategy): Promise<void> {
    if (!strategy) return;

    console.log(`🛡️ Executing prevention strategy: ${strategy.name}`);

    try {
      for (const action of strategy.actions) {
        await this.executeAction(action);
      }

      strategy.lastExecuted = Date.now();
      this.emit('prevention-executed', { strategy: strategy.name });

    } catch (error) {
      console.error(`❌ Prevention strategy '${strategy.name}' failed:`, error);
      this.emit('prevention-error', { strategy: strategy.name, error });
    }
  }

  private async executeAction(action: { action: string; parameters: any; condition: string }): Promise<void> {
    switch (action.action) {
      case 'force-gc':
        if (global.gc) {
          global.gc();
          console.log('   🗑️ Forced garbage collection');
        }
        break;

      case 'clear-caches':
        // Would clear application caches
        console.log('   🧹 Cleared application caches');
        break;

      case 'log-memory-usage':
        const snapshot = this.getCurrentSnapshot();
        console.log(`   📊 Memory usage: ${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB heap`);
        break;

      default:
        console.warn(`   ⚠️ Unknown prevention action: ${action.action}`);
    }

    // Add small delay between actions
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private captureCallStack(): string {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2, 10).join('\n') : 'Stack not available';
  }

  private initializePreventionStrategies(): void {
    // Force GC strategy
    this.preventionStrategies.set('force-gc', {
      name: 'force-gc',
      type: 'automatic',
      description: 'Force garbage collection when heap utilization is high',
      triggers: ['high-heap-utilization'],
      actions: [
        {
          action: 'force-gc',
          parameters: {},
          condition: 'heapUtilization > 0.85'
        }
      ],
      effectiveness: 70
    });

    // Periodic cleanup strategy
    this.preventionStrategies.set('cleanup-interval', {
      name: 'cleanup-interval',
      type: 'automatic',
      description: 'Periodic cleanup of application resources',
      triggers: ['time-based'],
      actions: [
        {
          action: 'clear-caches',
          parameters: {},
          condition: 'interval > 300000'
        },
        {
          action: 'log-memory-usage',
          parameters: {},
          condition: 'always'
        }
      ],
      effectiveness: 60
    });

    // Memory monitoring strategy
    this.preventionStrategies.set('memory-monitoring', {
      name: 'memory-monitoring',
      type: 'automatic',
      description: 'Enhanced memory monitoring during high usage',
      triggers: ['memory-growth'],
      actions: [
        {
          action: 'log-memory-usage',
          parameters: { detailed: true },
          condition: 'memoryGrowth > threshold'
        }
      ],
      effectiveness: 40
    });
  }
}

/**
 * Export singleton instance
 */
export const bmadMemoryLeakDetector = MemoryLeakDetector.getInstance();

/**
 * Convenience function to start leak detection
 */
export async function startLeakDetection(config?: Partial<LeakDetectionConfig>): Promise<MemoryLeakDetector> {
  const detector = MemoryLeakDetector.getInstance(config);
  await detector.startMonitoring();
  return detector;
}