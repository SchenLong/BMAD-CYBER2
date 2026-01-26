/**
 * Build Time Profiler
 * Epic 5.7 - Build Performance Optimization
 *
 * Comprehensive build time analysis and profiling system for tracking
 * build performance, identifying bottlenecks, and generating optimization insights.
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BuildPhase {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage: MemorySnapshot;
  cpuUsage: CpuSnapshot;
  children: BuildPhase[];
  metadata: Record<string, unknown>;
  status: 'running' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: number;
}

export interface CpuSnapshot {
  user: number;
  system: number;
  timestamp: number;
}

export interface BuildProfile {
  id: string;
  buildId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  phases: BuildPhase[];
  aggregatedMetrics: AggregatedMetrics;
  bottlenecks: Bottleneck[];
  recommendations: Recommendation[];
  environment: EnvironmentInfo;
  status: 'in_progress' | 'completed' | 'failed';
}

export interface AggregatedMetrics {
  totalBuildTime: number;
  averagePhaseTime: number;
  longestPhase: string;
  shortestPhase: string;
  memoryPeak: number;
  memoryAverage: number;
  cpuPeak: number;
  cpuAverage: number;
  phaseCount: number;
  parallelizationFactor: number;
  cacheHitRate: number;
  incrementalBuildSavings: number;
}

export interface Bottleneck {
  phase: string;
  duration: number;
  percentage: number;
  type: 'cpu' | 'memory' | 'io' | 'network' | 'compilation' | 'linking';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedFix: string;
}

export interface Recommendation {
  id: string;
  category: 'caching' | 'parallelization' | 'incremental' | 'resource' | 'configuration';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  estimatedSavings: number;
  implementation: string;
}

export interface EnvironmentInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  cpuCount: number;
  totalMemory: number;
  freeMemory: number;
  cwd: string;
  env: Record<string, string | undefined>;
}

export interface ProfilerConfig {
  enableMemoryTracking: boolean;
  enableCpuTracking: boolean;
  samplingInterval: number;
  maxHistorySize: number;
  enableAutoAnalysis: boolean;
  bottleneckThreshold: number;
  warningThreshold: number;
}

export interface PhaseTimeline {
  phase: string;
  start: number;
  end: number;
  overlaps: string[];
}

// ============================================================================
// Build Time Profiler Implementation
// ============================================================================

export class BuildTimeProfiler extends EventEmitter {
  private config: ProfilerConfig;
  private currentProfile: BuildProfile | null = null;
  private phaseStack: BuildPhase[] = [];
  private profileHistory: BuildProfile[] = [];
  private samplingTimer: NodeJS.Timeout | null = null;
  private memorySnapshots: MemorySnapshot[] = [];
  private cpuSnapshots: CpuSnapshot[] = [];
  private lastCpuUsage: NodeJS.CpuUsage | null = null;

  constructor(config: Partial<ProfilerConfig> = {}) {
    super();
    this.config = {
      enableMemoryTracking: true,
      enableCpuTracking: true,
      samplingInterval: 100,
      maxHistorySize: 100,
      enableAutoAnalysis: true,
      bottleneckThreshold: 0.2,
      warningThreshold: 0.1,
      ...config
    };
  }

  public startBuild(buildId: string): string {
    const profileId = this.generateProfileId();
    this.currentProfile = {
      id: profileId,
      buildId,
      startTime: Date.now(),
      phases: [],
      aggregatedMetrics: this.createEmptyMetrics(),
      bottlenecks: [],
      recommendations: [],
      environment: this.captureEnvironment(),
      status: 'in_progress'
    };
    this.phaseStack = [];
    this.memorySnapshots = [];
    this.cpuSnapshots = [];
    this.lastCpuUsage = process.cpuUsage();
    if (this.config.enableMemoryTracking || this.config.enableCpuTracking) {
      this.startSampling();
    }
    this.emit('build:start', { profileId, buildId });
    return profileId;
  }

  public endBuild(success: boolean = true): BuildProfile | null {
    if (!this.currentProfile) throw new Error('No build in progress');
    this.stopSampling();
    this.currentProfile.endTime = Date.now();
    this.currentProfile.totalDuration = this.currentProfile.endTime - this.currentProfile.startTime;
    this.currentProfile.status = success ? 'completed' : 'failed';
    while (this.phaseStack.length > 0) this.endPhase('auto_completed');
    if (this.config.enableAutoAnalysis) this.analyzeProfile(this.currentProfile);
    this.profileHistory.unshift(this.currentProfile);
    if (this.profileHistory.length > this.config.maxHistorySize) this.profileHistory.pop();
    const completedProfile = this.currentProfile;
    this.emit('build:end', completedProfile);
    this.currentProfile = null;
    return completedProfile;
  }

  public startPhase(name: string, metadata: Record<string, unknown> = {}): void {
    if (!this.currentProfile) throw new Error('No build in progress');
    const phase: BuildPhase = {
      name,
      startTime: Date.now(),
      memoryUsage: this.captureMemory(),
      cpuUsage: this.captureCpu(),
      children: [],
      metadata,
      status: 'running'
    };
    if (this.phaseStack.length > 0) {
      this.phaseStack[this.phaseStack.length - 1].children.push(phase);
    } else {
      this.currentProfile.phases.push(phase);
    }
    this.phaseStack.push(phase);
    this.emit('phase:start', { name, metadata });
  }

  public endPhase(status: 'completed' | 'failed' | 'auto_completed' = 'completed', errorMessage?: string): void {
    if (this.phaseStack.length === 0) throw new Error('No phase in progress');
    const phase = this.phaseStack.pop()!;
    phase.endTime = Date.now();
    phase.duration = phase.endTime - phase.startTime;
    phase.status = status === 'auto_completed' ? 'completed' : status;
    phase.errorMessage = errorMessage;
    this.emit('phase:end', { name: phase.name, duration: phase.duration, status: phase.status });
  }

  public checkpoint(name: string, data: Record<string, unknown> = {}): void {
    if (!this.currentProfile || this.phaseStack.length === 0) return;
    const currentPhase = this.phaseStack[this.phaseStack.length - 1];
    currentPhase.children.push({
      name: `checkpoint:${name}`,
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      memoryUsage: this.captureMemory(),
      cpuUsage: this.captureCpu(),
      children: [],
      metadata: { ...data, isCheckpoint: true },
      status: 'completed'
    });
    this.emit('checkpoint', { name, phase: currentPhase.name, data });
  }

  private analyzeProfile(profile: BuildProfile): void {
    this.calculateAggregatedMetrics(profile);
    this.identifyBottlenecks(profile);
    this.generateRecommendations(profile);
  }

  private calculateAggregatedMetrics(profile: BuildProfile): void {
    const phases = this.flattenPhases(profile.phases);
    if (phases.length === 0) return;
    const durations = phases.map(p => p.duration || 0);
    const totalTime = durations.reduce((a, b) => a + b, 0);
    const longestPhase = phases.reduce((a, b) => (a.duration || 0) > (b.duration || 0) ? a : b);
    const shortestPhase = phases.reduce((a, b) => (a.duration || 0) < (b.duration || 0) ? a : b);
    const memoryValues = this.memorySnapshots.map(s => s.heapUsed);
    const cpuValues = this.cpuSnapshots.map(s => s.user + s.system);
    profile.aggregatedMetrics = {
      totalBuildTime: profile.totalDuration || 0,
      averagePhaseTime: totalTime / phases.length,
      longestPhase: longestPhase.name,
      shortestPhase: shortestPhase.name,
      memoryPeak: memoryValues.length > 0 ? Math.max(...memoryValues) : 0,
      memoryAverage: memoryValues.length > 0 ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length : 0,
      cpuPeak: cpuValues.length > 0 ? Math.max(...cpuValues) : 0,
      cpuAverage: cpuValues.length > 0 ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length : 0,
      phaseCount: phases.length,
      parallelizationFactor: this.calculateParallelizationFactor(phases),
      cacheHitRate: this.extractCacheHitRate(phases),
      incrementalBuildSavings: this.calculateIncrementalSavings(phases)
    };
  }

  private identifyBottlenecks(profile: BuildProfile): void {
    const phases = this.flattenPhases(profile.phases);
    const totalTime = profile.totalDuration || 1;
    for (const phase of phases) {
      const duration = phase.duration || 0;
      const percentage = duration / totalTime;
      if (percentage >= this.config.bottleneckThreshold) {
        profile.bottlenecks.push({
          phase: phase.name,
          duration,
          percentage,
          type: this.classifyBottleneckType(phase),
          severity: percentage >= 0.4 ? 'critical' : percentage >= 0.3 ? 'high' : 'medium',
          description: `Phase "${phase.name}" took ${(percentage * 100).toFixed(1)}% of total build time`,
          suggestedFix: this.suggestBottleneckFix(phase)
        });
      }
    }
    profile.bottlenecks.sort((a, b) => b.percentage - a.percentage);
  }

  private generateRecommendations(profile: BuildProfile): void {
    const metrics = profile.aggregatedMetrics;
    if (metrics.cacheHitRate < 0.5) {
      profile.recommendations.push({
        id: crypto.randomUUID(),
        category: 'caching',
        priority: 'high',
        title: 'Improve Cache Hit Rate',
        description: `Cache hit rate is ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        estimatedSavings: metrics.totalBuildTime * (0.5 - metrics.cacheHitRate),
        implementation: 'Enable persistent build caching'
      });
    }
    if (metrics.parallelizationFactor < 0.6) {
      profile.recommendations.push({
        id: crypto.randomUUID(),
        category: 'parallelization',
        priority: 'high',
        title: 'Increase Build Parallelization',
        description: `Parallelization factor is ${(metrics.parallelizationFactor * 100).toFixed(1)}%`,
        estimatedSavings: metrics.totalBuildTime * 0.3,
        implementation: 'Use parallel build coordinator'
      });
    }
    profile.recommendations.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority] || b.estimatedSavings - a.estimatedSavings;
    });
  }

  public getCurrentProfile(): BuildProfile | null { return this.currentProfile; }
  public getHistory(): BuildProfile[] { return [...this.profileHistory]; }

  public compareProfiles(id1: string, id2: string): ProfileComparison | null {
    const p1 = this.profileHistory.find(p => p.id === id1);
    const p2 = this.profileHistory.find(p => p.id === id2);
    if (!p1 || !p2) return null;
    return {
      profile1Id: id1, profile2Id: id2,
      timeDifference: (p1.totalDuration || 0) - (p2.totalDuration || 0),
      percentageChange: ((p1.totalDuration || 0) - (p2.totalDuration || 0)) / (p2.totalDuration || 1) * 100,
      memoryDifference: p1.aggregatedMetrics.memoryPeak - p2.aggregatedMetrics.memoryPeak,
      phaseComparisons: this.comparePhases(p1.phases, p2.phases),
      improvements: this.identifyImprovements(p1, p2),
      regressions: this.identifyRegressions(p1, p2)
    };
  }

  public getTimeline(): PhaseTimeline[] {
    if (!this.currentProfile) return [];
    const phases = this.flattenPhases(this.currentProfile.phases);
    return phases.map(phase => ({
      phase: phase.name,
      start: phase.startTime - this.currentProfile!.startTime,
      end: (phase.endTime || Date.now()) - this.currentProfile!.startTime,
      overlaps: this.findOverlappingPhases(phase, phases)
    }));
  }

  public exportProfile(profileId?: string): string {
    const profile = profileId ? this.profileHistory.find(p => p.id === profileId) : this.currentProfile;
    if (!profile) throw new Error('Profile not found');
    return JSON.stringify(profile, null, 2);
  }

  private generateProfileId(): string { return `profile_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`; }
  private createEmptyMetrics(): AggregatedMetrics {
    return { totalBuildTime: 0, averagePhaseTime: 0, longestPhase: '', shortestPhase: '', memoryPeak: 0, memoryAverage: 0, cpuPeak: 0, cpuAverage: 0, phaseCount: 0, parallelizationFactor: 0, cacheHitRate: 0, incrementalBuildSavings: 0 };
  }
  private captureEnvironment(): EnvironmentInfo {
    const os = require('os');
    return { nodeVersion: process.version, platform: process.platform, arch: process.arch, cpuCount: os.cpus().length, totalMemory: os.totalmem(), freeMemory: os.freemem(), cwd: process.cwd(), env: { NODE_ENV: process.env.NODE_ENV, CI: process.env.CI } };
  }
  private captureMemory(): MemorySnapshot {
    const mem = process.memoryUsage();
    return { heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external, rss: mem.rss, timestamp: Date.now() };
  }
  private captureCpu(): CpuSnapshot {
    const usage = process.cpuUsage(this.lastCpuUsage || undefined);
    this.lastCpuUsage = process.cpuUsage();
    return { user: usage.user, system: usage.system, timestamp: Date.now() };
  }
  private startSampling(): void {
    this.samplingTimer = setInterval(() => {
      if (this.config.enableMemoryTracking) this.memorySnapshots.push(this.captureMemory());
      if (this.config.enableCpuTracking) this.cpuSnapshots.push(this.captureCpu());
    }, this.config.samplingInterval);
  }
  private stopSampling(): void { if (this.samplingTimer) { clearInterval(this.samplingTimer); this.samplingTimer = null; } }
  private flattenPhases(phases: BuildPhase[]): BuildPhase[] {
    const result: BuildPhase[] = [];
    const flatten = (items: BuildPhase[]) => { for (const item of items) { if (!item.metadata?.isCheckpoint) result.push(item); if (item.children.length > 0) flatten(item.children); } };
    flatten(phases);
    return result;
  }
  private calculateParallelizationFactor(phases: BuildPhase[]): number {
    if (phases.length === 0) return 0;
    const total = phases.reduce((sum, p) => sum + (p.duration || 0), 0);
    const actual = this.currentProfile?.totalDuration || total;
    return actual > 0 ? Math.min(1, total / actual / phases.length) : 0;
  }
  private extractCacheHitRate(phases: BuildPhase[]): number {
    const cachePhases = phases.filter(p => p.metadata?.cacheHit !== undefined || p.name.toLowerCase().includes('cache'));
    if (cachePhases.length === 0) return 0;
    return cachePhases.filter(p => p.metadata?.cacheHit === true).length / cachePhases.length;
  }
  private calculateIncrementalSavings(phases: BuildPhase[]): number {
    return phases.reduce((sum, p) => sum + (typeof p.metadata?.incrementalSavings === 'number' ? p.metadata.incrementalSavings : 0), 0);
  }
  private classifyBottleneckType(phase: BuildPhase): Bottleneck['type'] {
    const name = phase.name.toLowerCase();
    if (name.includes('compile') || name.includes('transpile')) return 'compilation';
    if (name.includes('link') || name.includes('bundle')) return 'linking';
    if (name.includes('copy') || name.includes('file')) return 'io';
    if (name.includes('download') || name.includes('npm')) return 'network';
    if (phase.memoryUsage.heapUsed > 512 * 1024 * 1024) return 'memory';
    return 'cpu';
  }
  private suggestBottleneckFix(phase: BuildPhase): string {
    const fixes: Record<string, string> = {
      compilation: 'Enable incremental compilation or parallel workers',
      linking: 'Use code splitting or tree shaking',
      io: 'Enable file system caching',
      network: 'Use local package cache',
      memory: 'Implement streaming processing',
      cpu: 'Use worker threads'
    };
    return fixes[this.classifyBottleneckType(phase)];
  }
  private comparePhases(p1: BuildPhase[], p2: BuildPhase[]): PhaseComparisonResult[] {
    const flat1 = this.flattenPhases(p1), flat2 = this.flattenPhases(p2);
    return flat1.filter(a => flat2.find(b => b.name === a.name)).map(a => {
      const b = flat2.find(x => x.name === a.name)!;
      return { phase: a.name, duration1: a.duration || 0, duration2: b.duration || 0, difference: (a.duration || 0) - (b.duration || 0), percentageChange: ((a.duration || 0) - (b.duration || 0)) / (b.duration || 1) * 100 };
    });
  }
  private identifyImprovements(p1: BuildProfile, p2: BuildProfile): string[] {
    const result: string[] = [];
    if (p1.aggregatedMetrics.totalBuildTime < p2.aggregatedMetrics.totalBuildTime) result.push('Build time improved');
    if (p1.aggregatedMetrics.memoryPeak < p2.aggregatedMetrics.memoryPeak) result.push('Memory usage reduced');
    return result;
  }
  private identifyRegressions(p1: BuildProfile, p2: BuildProfile): string[] {
    const result: string[] = [];
    if (p1.aggregatedMetrics.totalBuildTime > p2.aggregatedMetrics.totalBuildTime * 1.1) result.push('Build time increased');
    if (p1.aggregatedMetrics.memoryPeak > p2.aggregatedMetrics.memoryPeak * 1.2) result.push('Memory usage increased');
    return result;
  }
  private findOverlappingPhases(phase: BuildPhase, all: BuildPhase[]): string[] {
    const start = phase.startTime, end = phase.endTime || Date.now();
    return all.filter(o => o.name !== phase.name && start < (o.endTime || Date.now()) && end > o.startTime).map(o => o.name);
  }
}

export interface ProfileComparison { profile1Id: string; profile2Id: string; timeDifference: number; percentageChange: number; memoryDifference: number; phaseComparisons: PhaseComparisonResult[]; improvements: string[]; regressions: string[]; }
export interface PhaseComparisonResult { phase: string; duration1: number; duration2: number; difference: number; percentageChange: number; }

let defaultProfiler: BuildTimeProfiler | null = null;
export function getDefaultProfiler(config?: Partial<ProfilerConfig>): BuildTimeProfiler { if (!defaultProfiler) defaultProfiler = new BuildTimeProfiler(config); return defaultProfiler; }
export function createProfiler(config?: Partial<ProfilerConfig>): BuildTimeProfiler { return new BuildTimeProfiler(config); }
export default BuildTimeProfiler;
