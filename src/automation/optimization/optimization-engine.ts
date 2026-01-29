/**
 * BMAD OPTIMIZATION ENGINE - EPIC 5.7
 * Intelligent build optimization recommendations and automation
 *
 * @module automation/optimization
 * @version 1.0.0
 * @epic Epic 5 - Story 5.7: Build Performance Optimization
 */

import { EventEmitter } from 'events';

export interface OptimizationConfig {
  enableAutoOptimization?: boolean;
  analysisInterval?: number;
  minSampleSize?: number;
  targetImprovement?: number;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'caching' | 'parallelization' | 'incremental' | 'dependency' | 'configuration';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: string;
  automated: boolean;
  applied?: boolean;
}

export interface BuildProfile {
  targetId: string;
  avgDuration: number;
  cacheHitRate: number;
  parallelizationFactor: number;
  dependencyCount: number;
  samples: number;
}

export class OptimizationEngine extends EventEmitter {
  private config: Required<OptimizationConfig>;
  private profiles: Map<string, BuildProfile> = new Map();
  private recommendations: Map<string, OptimizationRecommendation> = new Map();
  private buildHistory: Array<{
    targetId: string;
    duration: number;
    cached: boolean;
    timestamp: number;
  }> = [];

  constructor(config: OptimizationConfig = {}) {
    super();
    this.config = {
      enableAutoOptimization: config.enableAutoOptimization ?? false,
      analysisInterval: config.analysisInterval ?? 60000,
      minSampleSize: config.minSampleSize ?? 5,
      targetImprovement: config.targetImprovement ?? 0.2
    };
  }

  recordBuild(targetId: string, duration: number, metadata: { cached?: boolean; dependencies?: number } = {}): void {
    this.buildHistory.push({
      targetId,
      duration,
      cached: metadata.cached ?? false,
      timestamp: Date.now()
    });

    // Update profile
    const profile = this.profiles.get(targetId) || {
      targetId,
      avgDuration: 0,
      cacheHitRate: 0,
      parallelizationFactor: 1,
      dependencyCount: metadata.dependencies ?? 0,
      samples: 0
    };

    const targetHistory = this.buildHistory.filter(b => b.targetId === targetId);
    profile.samples = targetHistory.length;
    profile.avgDuration = targetHistory.reduce((sum, b) => sum + b.duration, 0) / targetHistory.length;
    profile.cacheHitRate = targetHistory.filter(b => b.cached).length / targetHistory.length;

    this.profiles.set(targetId, profile);

    // Analyze if enough samples
    if (profile.samples >= this.config.minSampleSize) {
      this.analyzeTarget(targetId);
    }
  }

  analyzeTarget(targetId: string): OptimizationRecommendation[] {
    const profile = this.profiles.get(targetId);
    if (!profile) return [];

    const newRecommendations: OptimizationRecommendation[] = [];

    // Cache optimization
    if (profile.cacheHitRate < 0.5) {
      const rec: OptimizationRecommendation = {
        id: `cache-${targetId}`,
        category: 'caching',
        priority: profile.cacheHitRate < 0.2 ? 'high' : 'medium',
        title: `Enable caching for ${targetId}`,
        description: `Cache hit rate is ${(profile.cacheHitRate * 100).toFixed(1)}%. Enabling caching could reduce build times by up to ${((1 - profile.cacheHitRate) * 50).toFixed(0)}%.`,
        estimatedImpact: `${((1 - profile.cacheHitRate) * 50).toFixed(0)}% time reduction`,
        automated: true
      };
      newRecommendations.push(rec);
      this.recommendations.set(rec.id, rec);
    }

    // Parallelization opportunity
    if (profile.dependencyCount > 3 && profile.parallelizationFactor < 2) {
      const rec: OptimizationRecommendation = {
        id: `parallel-${targetId}`,
        category: 'parallelization',
        priority: 'medium',
        title: `Increase parallelization for ${targetId}`,
        description: `Target has ${profile.dependencyCount} dependencies that could potentially build in parallel.`,
        estimatedImpact: '20-40% time reduction',
        automated: false
      };
      newRecommendations.push(rec);
      this.recommendations.set(rec.id, rec);
    }

    // Long build detection
    if (profile.avgDuration > 60000) {
      const rec: OptimizationRecommendation = {
        id: `incremental-${targetId}`,
        category: 'incremental',
        priority: 'high',
        title: `Enable incremental builds for ${targetId}`,
        description: `Average build time is ${(profile.avgDuration / 1000).toFixed(1)}s. Incremental builds could significantly reduce rebuild times.`,
        estimatedImpact: '50-80% time reduction on subsequent builds',
        automated: true
      };
      newRecommendations.push(rec);
      this.recommendations.set(rec.id, rec);
    }

    this.emit('recommendations:updated', { targetId, recommendations: newRecommendations });
    return newRecommendations;
  }

  analyzeAll(): OptimizationRecommendation[] {
    const allRecommendations: OptimizationRecommendation[] = [];

    for (const targetId of this.profiles.keys()) {
      allRecommendations.push(...this.analyzeTarget(targetId));
    }

    // Global recommendations
    const avgCacheRate = this.calculateGlobalCacheRate();
    if (avgCacheRate < 0.3) {
      const rec: OptimizationRecommendation = {
        id: 'global-cache',
        category: 'caching',
        priority: 'high',
        title: 'Global cache optimization needed',
        description: `Overall cache hit rate is ${(avgCacheRate * 100).toFixed(1)}%. Consider implementing shared cache storage.`,
        estimatedImpact: 'Significant build time reduction across all targets',
        automated: false
      };
      this.recommendations.set(rec.id, rec);
      allRecommendations.push(rec);
    }

    return allRecommendations;
  }

  applyRecommendation(recommendationId: string): boolean {
    const rec = this.recommendations.get(recommendationId);
    if (!rec || !rec.automated) {
      return false;
    }

    rec.applied = true;
    this.emit('recommendation:applied', { recommendationId, recommendation: rec });
    console.log(`[OPTIMIZER] Applied recommendation: ${rec.title}`);
    return true;
  }

  private calculateGlobalCacheRate(): number {
    if (this.buildHistory.length === 0) return 0;
    return this.buildHistory.filter(b => b.cached).length / this.buildHistory.length;
  }

  getRecommendations(filter?: { category?: string; priority?: string; applied?: boolean }): OptimizationRecommendation[] {
    let recs = Array.from(this.recommendations.values());

    if (filter?.category) {
      recs = recs.filter(r => r.category === filter.category);
    }
    if (filter?.priority) {
      recs = recs.filter(r => r.priority === filter.priority);
    }
    if (filter?.applied !== undefined) {
      recs = recs.filter(r => r.applied === filter.applied);
    }

    return recs;
  }

  getProfiles(): BuildProfile[] {
    return Array.from(this.profiles.values());
  }

  getStats(): {
    totalBuilds: number;
    avgDuration: number;
    cacheHitRate: number;
    recommendations: number;
    appliedRecommendations: number;
  } {
    const recs = Array.from(this.recommendations.values());
    return {
      totalBuilds: this.buildHistory.length,
      avgDuration: this.buildHistory.length > 0
        ? this.buildHistory.reduce((sum, b) => sum + b.duration, 0) / this.buildHistory.length
        : 0,
      cacheHitRate: this.calculateGlobalCacheRate(),
      recommendations: recs.length,
      appliedRecommendations: recs.filter(r => r.applied).length
    };
  }

  performHealthCheck(): { status: string; stats: ReturnType<OptimizationEngine['getStats']> } {
    return {
      status: 'healthy',
      stats: this.getStats()
    };
  }

  shutdown(): void {
    this.removeAllListeners();
    console.log('[OPTIMIZER] Optimization engine shutdown');
  }
}
