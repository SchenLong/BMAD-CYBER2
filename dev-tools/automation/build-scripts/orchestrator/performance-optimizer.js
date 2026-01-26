/**
 * BMAD BUILD PERFORMANCE OPTIMIZER - EPIC 5.1 / 5.7
 * Build-time performance optimization with profiling, build plan optimization,
 * and resource management.
 *
 * @module automation/build-scripts/orchestrator/performance-optimizer
 * @version 2.0.0
 * @epic Epic 5 - Story 5.1: Build Orchestration, Story 5.7: Build Performance
 */

const EventEmitter = require('events');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

/**
 * Optimization strategies
 */
const OptimizationStrategy = {
  NONE: 'none',
  CONSERVATIVE: 'conservative',
  BALANCED: 'balanced',
  AGGRESSIVE: 'aggressive',
  ADAPTIVE: 'adaptive'
};

/**
 * Resource allocation modes
 */
const ResourceMode = {
  FIXED: 'fixed',
  DYNAMIC: 'dynamic',
  AUTO: 'auto'
};

/**
 * Performance Optimizer - Build performance analysis and optimization
 */
class PerformanceOptimizer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      enableProfiling: config.enableProfiling !== false,
      sampleInterval: config.sampleInterval || 100,
      memoryThreshold: config.memoryThreshold || 0.85,
      cpuThreshold: config.cpuThreshold || 0.90,
      autoOptimize: config.autoOptimize !== false,
      strategy: config.strategy || OptimizationStrategy.BALANCED,
      resourceMode: config.resourceMode || ResourceMode.AUTO,
      maxParallelBuilds: config.maxParallelBuilds || Math.max(1, os.cpus().length - 1),
      buildTimeBudget: config.buildTimeBudget || 300000,
      historySize: config.historySize || 100,
      adaptiveWindowSize: config.adaptiveWindowSize || 10,
      ...config
    };

    this.profiles = new Map();
    this.optimizations = [];
    this.targetMetrics = new Map();
    this.buildHistory = [];
    this.resourceHistory = [];

    this.currentLoad = {
      cpu: 0,
      memory: 0,
      activeBuilds: 0
    };

    this.optimizationState = {
      currentStrategy: this.config.strategy,
      parallelLimit: this.config.maxParallelBuilds,
      lastOptimization: null,
      adaptations: 0
    };

    this.metrics = {
      totalOptimizations: 0,
      memoryReclaimed: 0,
      timeOptimized: 0,
      cacheOptimizations: 0,
      parallelOptimizations: 0,
      averageBuildTime: 0,
      buildTimeReduction: 0
    };

    this.isInitialized = false;
    this.monitoringInterval = null;

    this.logger = {
      info: (msg) => console.log(`[PERF] ${msg}`),
      warn: (msg) => console.warn(`[PERF] ${msg}`),
      error: (msg) => console.error(`[PERF] ${msg}`)
    };
  }

  /**
   * Initialize the optimizer
   */
  async initialize() {
    if (this.config.enableProfiling) {
      this._startResourceMonitoring();
    }
    await this._loadHistoricalData();
    this.isInitialized = true;
    this.emit('initialized', { timestamp: new Date() });
    return this;
  }

  /**
   * Start resource monitoring
   * @private
   */
  _startResourceMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this._updateResourceMetrics();
    }, 5000);
  }

  /**
   * Update resource metrics
   * @private
   */
  _updateResourceMetrics() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    const memUsage = 1 - (os.freemem() / os.totalmem());

    this.currentLoad = {
      cpu: Math.min(1, cpuUsage),
      memory: memUsage,
      activeBuilds: this.currentLoad.activeBuilds
    };

    this.resourceHistory.push({
      timestamp: Date.now(),
      ...this.currentLoad
    });

    if (this.resourceHistory.length > 1000) {
      this.resourceHistory = this.resourceHistory.slice(-500);
    }

    if (memUsage > this.config.memoryThreshold) {
      this.emit('memoryPressure', { usage: memUsage, timestamp: new Date() });
    }
  }

  /**
   * Load historical performance data
   * @private
   */
  async _loadHistoricalData() {
    try {
      const historyPath = path.join(process.cwd(), '.build-cache', 'performance-history.json');
      const data = await fs.readFile(historyPath, 'utf8');
      const history = JSON.parse(data);
      this.buildHistory = history.builds || [];
    } catch {
      // No history file
    }
  }

  /**
   * Save historical performance data
   * @private
   */
  async _saveHistoricalData() {
    try {
      const historyPath = path.join(process.cwd(), '.build-cache', 'performance-history.json');
      await fs.mkdir(path.dirname(historyPath), { recursive: true });
      await fs.writeFile(historyPath, JSON.stringify({
        builds: this.buildHistory.slice(-this.config.historySize),
        stats: this.metrics,
        lastUpdated: Date.now()
      }, null, 2));
    } catch {
      // Ignore save errors
    }
  }

  /**
   * Optimize build plan for Epic 5.1 Build Orchestrator
   * @param {Array<string>} buildOrder - Topologically sorted build order
   * @param {Array<Object>} targets - Build targets
   * @returns {Promise<Object>} Optimized build plan
   */
  async optimizeBuildPlan(buildOrder, targets) {
    const startTime = Date.now();
    const targetMap = new Map(targets.map(t => [t.id, t]));

    // Analyze build graph
    const analysis = this._analyzeBuildGraph(buildOrder, targetMap);

    // Calculate parallel groups
    const parallelGroups = this._calculateParallelGroups(buildOrder, targetMap);

    // Estimate build times
    const timeEstimates = this._estimateBuildTimes(buildOrder, targetMap);

    // Apply strategy-specific optimizations
    const optimizedGroups = this._applyStrategyOptimizations(parallelGroups, analysis, timeEstimates);

    // Create phases
    const phases = optimizedGroups.map((targets, index) => ({
      name: `phase-${index + 1}`,
      targets,
      parallelCount: targets.length
    }));

    this.metrics.totalOptimizations++;
    this.optimizationState.lastOptimization = Date.now();

    const plan = {
      phases,
      parallelGroups: optimizedGroups,
      analysis,
      timeEstimates,
      metadata: {
        strategy: this.config.strategy,
        maxParallel: this.optimizationState.parallelLimit,
        estimatedTotalTime: this._calculateEstimatedTime(phases, timeEstimates),
        optimizationTime: Date.now() - startTime
      }
    };

    this.emit('planOptimized', { targetCount: buildOrder.length, phaseCount: phases.length });
    this.emit('optimizationApplied', { plan, timestamp: new Date() });

    return plan;
  }

  /**
   * Analyze build graph
   * @private
   */
  _analyzeBuildGraph(buildOrder, targetMap) {
    const analysis = {
      totalTargets: buildOrder.length,
      maxDepth: 0,
      criticalPath: [],
      heavyTargets: [],
      independentTargets: []
    };

    const depths = new Map();

    for (const targetId of buildOrder) {
      const target = targetMap.get(targetId);
      const deps = target?.dependencies || [];

      if (deps.length === 0) {
        depths.set(targetId, 0);
        analysis.independentTargets.push(targetId);
      } else {
        const maxDepDep = Math.max(...deps.map(d => depths.get(d) ?? 0));
        depths.set(targetId, maxDepDep + 1);
      }
    }

    analysis.maxDepth = Math.max(...depths.values(), 0);
    return analysis;
  }

  /**
   * Calculate parallel groups
   * @private
   */
  _calculateParallelGroups(buildOrder, targetMap) {
    const groups = [];
    const scheduled = new Set();
    const remaining = new Set(buildOrder);

    while (remaining.size > 0) {
      const currentGroup = [];

      for (const targetId of remaining) {
        const target = targetMap.get(targetId);
        const deps = target?.dependencies || [];
        const depsScheduled = deps.every(d => scheduled.has(d) || !remaining.has(d));

        if (depsScheduled) {
          currentGroup.push(targetId);
        }

        if (currentGroup.length >= this.optimizationState.parallelLimit) break;
      }

      if (currentGroup.length === 0) break;

      groups.push(currentGroup);
      currentGroup.forEach(id => { scheduled.add(id); remaining.delete(id); });
    }

    return groups;
  }

  /**
   * Estimate build times
   * @private
   */
  _estimateBuildTimes(buildOrder, targetMap) {
    const estimates = new Map();

    for (const targetId of buildOrder) {
      const target = targetMap.get(targetId);
      const metrics = this.targetMetrics.get(targetId);

      if (metrics?.avgBuildTime) {
        estimates.set(targetId, metrics.avgBuildTime);
        continue;
      }

      let baseTime = 30000;
      switch (target?.language?.toLowerCase()) {
        case 'typescript': baseTime = 45000; break;
        case 'rust': baseTime = 120000; break;
        case 'java': baseTime = 60000; break;
        case 'go': baseTime = 20000; break;
        case 'python': baseTime = 15000; break;
      }

      estimates.set(targetId, baseTime + (target?.dependencies?.length || 0) * 5000);
    }

    return estimates;
  }

  /**
   * Apply strategy-specific optimizations
   * @private
   */
  _applyStrategyOptimizations(parallelGroups, analysis, timeEstimates) {
    switch (this.config.strategy) {
      case OptimizationStrategy.CONSERVATIVE:
        return parallelGroups.map(g => g.slice(0, Math.max(1, Math.floor(this.optimizationState.parallelLimit / 2))));
      case OptimizationStrategy.AGGRESSIVE:
        return this._mergeSmallGroups(parallelGroups, timeEstimates);
      case OptimizationStrategy.ADAPTIVE:
        return this._adaptGroups(parallelGroups);
      default:
        return parallelGroups;
    }
  }

  /**
   * Merge small groups for aggressive optimization
   * @private
   */
  _mergeSmallGroups(groups, timeEstimates) {
    const merged = [];
    let currentGroup = [];

    for (const group of groups) {
      currentGroup.push(...group);
      if (currentGroup.length >= this.optimizationState.parallelLimit) {
        merged.push(currentGroup.splice(0, this.optimizationState.parallelLimit));
      }
    }

    if (currentGroup.length > 0) merged.push(currentGroup);
    return merged;
  }

  /**
   * Adapt groups based on current load
   * @private
   */
  _adaptGroups(groups) {
    let effectiveParallel = this.optimizationState.parallelLimit;
    if (this.currentLoad.cpu > 0.8) effectiveParallel = Math.max(1, Math.floor(effectiveParallel * 0.7));
    if (this.currentLoad.memory > 0.85) effectiveParallel = Math.max(1, Math.floor(effectiveParallel * 0.6));
    return groups.map(g => g.slice(0, effectiveParallel));
  }

  /**
   * Calculate estimated total time
   * @private
   */
  _calculateEstimatedTime(phases, timeEstimates) {
    return phases.reduce((total, phase) => {
      return total + Math.max(...phase.targets.map(id => timeEstimates.get(id) || 30000));
    }, 0);
  }

  /**
   * Record build metrics for a target
   */
  recordBuildMetrics(targetId, result) {
    let metrics = this.targetMetrics.get(targetId) || {
      buildCount: 0, totalTime: 0, avgBuildTime: 0, successCount: 0, failureCount: 0
    };

    metrics.buildCount++;
    metrics.totalTime += result.duration || 0;
    metrics.avgBuildTime = metrics.totalTime / metrics.buildCount;
    result.success ? metrics.successCount++ : metrics.failureCount++;

    this.targetMetrics.set(targetId, metrics);
    this.buildHistory.push({ targetId, duration: result.duration, success: result.success, timestamp: Date.now() });

    if (this.buildHistory.length > this.config.historySize) {
      this.buildHistory = this.buildHistory.slice(-this.config.historySize);
    }

    if (this.buildHistory.length % 10 === 0) this._saveHistoricalData();
  }

  /**
   * Start profiling a build
   */
  startProfiling(buildId) {
    const profile = {
      buildId,
      startTime: Date.now(),
      samples: [],
      phases: [],
      currentPhase: null,
      peakMemory: 0,
      avgCpu: 0
    };

    this.profiles.set(buildId, profile);

    if (this.config.enableProfiling) {
      profile.timer = setInterval(() => this._collectSample(buildId), this.config.sampleInterval);
    }

    this.logger.info(`Started profiling build: ${buildId}`);
    this.emit('profiling:started', { buildId });
    return this;
  }

  /**
   * Stop profiling and generate report
   */
  stopProfiling(buildId) {
    const profile = this.profiles.get(buildId);
    if (!profile) return null;

    if (profile.timer) {
      clearInterval(profile.timer);
    }

    profile.endTime = Date.now();
    profile.duration = profile.endTime - profile.startTime;

    // Calculate aggregates
    if (profile.samples.length > 0) {
      profile.avgCpu = profile.samples.reduce((sum, s) => sum + s.cpu, 0) / profile.samples.length;
      profile.avgMemory = profile.samples.reduce((sum, s) => sum + s.memory, 0) / profile.samples.length;
    }

    const report = this._generateReport(profile);
    this.emit('profiling:stopped', { buildId, report });

    return report;
  }

  /**
   * Mark a phase in the build
   */
  markPhase(buildId, phaseName) {
    const profile = this.profiles.get(buildId);
    if (!profile) return;

    const now = Date.now();

    // End current phase
    if (profile.currentPhase) {
      profile.currentPhase.endTime = now;
      profile.currentPhase.duration = now - profile.currentPhase.startTime;
      profile.phases.push(profile.currentPhase);
    }

    // Start new phase
    profile.currentPhase = {
      name: phaseName,
      startTime: now,
      samples: []
    };

    this.emit('phase:marked', { buildId, phase: phaseName });
  }

  /**
   * Analyze build and suggest optimizations
   */
  analyzeAndOptimize(buildId) {
    const profile = this.profiles.get(buildId);
    if (!profile) return [];

    const suggestions = [];

    // Check memory usage
    if (profile.peakMemory > this.config.memoryThreshold * os.totalmem()) {
      suggestions.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected',
        recommendation: 'Consider enabling streaming builds or increasing memory limits',
        impact: 'Could reduce memory by 20-30%'
      });
    }

    // Check CPU usage
    if (profile.avgCpu > this.config.cpuThreshold * 100) {
      suggestions.push({
        type: 'cpu',
        severity: 'medium',
        message: 'High CPU utilization',
        recommendation: 'Consider reducing parallel tasks or optimizing compute-heavy operations',
        impact: 'Could improve build stability'
      });
    }

    // Check phase durations
    const slowPhases = profile.phases.filter(p => p.duration > 30000);
    for (const phase of slowPhases) {
      suggestions.push({
        type: 'timing',
        severity: 'medium',
        message: `Slow phase detected: ${phase.name} (${(phase.duration / 1000).toFixed(1)}s)`,
        recommendation: `Consider caching or parallelizing ${phase.name}`,
        impact: 'Could reduce build time significantly'
      });
    }

    // Check for cache opportunities
    if (!profile.cacheHit && profile.duration > 10000) {
      suggestions.push({
        type: 'caching',
        severity: 'high',
        message: 'Build could benefit from caching',
        recommendation: 'Enable build caching for repeated builds',
        impact: 'Could reduce subsequent builds by 50-80%'
      });
    }

    this.optimizations.push(...suggestions);
    this.emit('analysis:complete', { buildId, suggestions });

    return suggestions;
  }

  /**
   * Apply automatic optimizations
   */
  async applyOptimizations(buildId) {
    if (!this.config.autoOptimize) return { applied: 0 };

    const suggestions = this.analyzeAndOptimize(buildId);
    let applied = 0;

    for (const suggestion of suggestions) {
      if (suggestion.type === 'memory' && suggestion.severity === 'high') {
        // Trigger garbage collection if available
        if (global.gc) {
          const before = process.memoryUsage().heapUsed;
          global.gc();
          const after = process.memoryUsage().heapUsed;
          this.metrics.memoryReclaimed += (before - after);
          applied++;
        }
      }
    }

    this.metrics.totalOptimizations += applied;
    this.emit('optimizations:applied', { buildId, count: applied });

    return { applied, suggestions };
  }

  /**
   * Get optimization metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeProfiles: this.profiles.size,
      totalSuggestions: this.optimizations.length
    };
  }

  /**
   * Private: Collect performance sample
   */
  _collectSample(buildId) {
    const profile = this.profiles.get(buildId);
    if (!profile) return;

    const memUsage = process.memoryUsage();
    const cpus = os.cpus();

    let cpuUsage = 0;
    for (const cpu of cpus) {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      cpuUsage += ((total - cpu.times.idle) / total) * 100;
    }
    cpuUsage /= cpus.length;

    const sample = {
      timestamp: Date.now(),
      memory: memUsage.heapUsed,
      memoryTotal: memUsage.heapTotal,
      cpu: cpuUsage,
      rss: memUsage.rss
    };

    profile.samples.push(sample);
    profile.peakMemory = Math.max(profile.peakMemory, sample.memory);

    if (profile.currentPhase) {
      profile.currentPhase.samples.push(sample);
    }

    // Check thresholds
    if (sample.memory > this.config.memoryThreshold * os.totalmem()) {
      this.emit('threshold:exceeded', { buildId, type: 'memory', value: sample.memory });
    }
  }

  /**
   * Private: Generate profiling report
   */
  _generateReport(profile) {
    return {
      buildId: profile.buildId,
      duration: profile.duration,
      startTime: new Date(profile.startTime).toISOString(),
      endTime: new Date(profile.endTime).toISOString(),
      samples: profile.samples.length,
      phases: profile.phases.map(p => ({
        name: p.name,
        duration: p.duration,
        percentage: ((p.duration / profile.duration) * 100).toFixed(1)
      })),
      memory: {
        peak: profile.peakMemory,
        peakMB: (profile.peakMemory / (1024 * 1024)).toFixed(2),
        average: profile.avgMemory,
        averageMB: (profile.avgMemory / (1024 * 1024)).toFixed(2)
      },
      cpu: {
        average: profile.avgCpu?.toFixed(2),
        peak: Math.max(...profile.samples.map(s => s.cpu)).toFixed(2)
      },
      recommendations: this.analyzeAndOptimize(profile.buildId)
    };
  }

  /**
   * Health check - Compatible with Build Orchestrator interface
   */
  async healthCheck() {
    return {
      status: 'healthy',
      strategy: this.config.strategy,
      parallelLimit: this.optimizationState.parallelLimit,
      currentLoad: { ...this.currentLoad },
      averageBuildTime: this.metrics.averageBuildTime,
      totalOptimizations: this.metrics.totalOptimizations,
      adaptations: this.optimizationState.adaptations,
      activeProfiles: this.profiles.size,
      metrics: this.getMetrics()
    };
  }

  /**
   * Legacy health check for backward compatibility
   */
  performHealthCheck() {
    return this.healthCheck();
  }

  /**
   * Get current optimizer state
   */
  getState() {
    return {
      ...this.optimizationState,
      currentLoad: { ...this.currentLoad },
      targetCount: this.targetMetrics.size,
      buildHistorySize: this.buildHistory.length
    };
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.metrics.averageBuildTime > this.config.buildTimeBudget) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average build time exceeds budget',
        suggestion: 'Consider increasing parallelism or optimizing slow targets'
      });
    }

    if (this.currentLoad.memory > this.config.memoryThreshold) {
      recommendations.push({
        type: 'resource',
        priority: 'high',
        message: 'High memory usage detected',
        suggestion: 'Reduce parallel builds or increase system memory'
      });
    }

    return recommendations;
  }

  /**
   * Adjust parallelism dynamically
   */
  adjustParallelism(delta) {
    const newLimit = Math.max(1, Math.min(os.cpus().length, this.optimizationState.parallelLimit + delta));
    if (newLimit !== this.optimizationState.parallelLimit) {
      this.optimizationState.parallelLimit = newLimit;
      this.optimizationState.adaptations++;
      this.emit('parallelismAdjusted', { oldLimit: newLimit - delta, newLimit });
    }
  }

  /**
   * Shutdown
   */
  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    for (const [buildId, profile] of this.profiles) {
      if (profile.timer) {
        clearInterval(profile.timer);
      }
    }

    await this._saveHistoricalData();

    this.profiles.clear();
    this.targetMetrics.clear();
    this.buildHistory = [];
    this.resourceHistory = [];
    this.isInitialized = false;

    this.logger.info('Performance optimizer shutdown');
    this.emit('shutdown', { timestamp: new Date() });
    this.removeAllListeners();
  }
}

module.exports = PerformanceOptimizer;
module.exports.PerformanceOptimizer = PerformanceOptimizer;
module.exports.OptimizationStrategy = OptimizationStrategy;
module.exports.ResourceMode = ResourceMode;
