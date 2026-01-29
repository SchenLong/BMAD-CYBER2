/**
 * BMAD BUILD ORCHESTRATOR - EPIC 5.1
 * Multi-language build coordination system with dependency management
 *
 * @module automation/build-scripts/orchestrator
 * @version 1.0.0
 * @epic Epic 5 - Story 5.1: Build Orchestration Export
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const crypto = require('crypto');

/**
 * Build Orchestrator - Multi-language build coordination
 */
class BuildOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxParallelBuilds: config.maxParallelBuilds || 4,
      buildTimeout: config.buildTimeout || 300000,
      retryLimit: config.retryLimit || 3,
      cacheEnabled: config.cacheEnabled !== false,
      ...config
    };

    this.targets = new Map();
    this.buildQueue = [];
    this.activeBuilds = new Map();
    this.cache = new Map();
    this.dependencyGraph = new Map();

    this.metrics = {
      totalBuilds: 0,
      successfulBuilds: 0,
      failedBuilds: 0,
      totalDuration: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.logger = {
      info: (msg) => console.log(`[BUILD] ${msg}`),
      warn: (msg) => console.warn(`[BUILD] ${msg}`),
      error: (msg) => console.error(`[BUILD] ${msg}`)
    };
  }

  /**
   * Register a build target
   */
  registerTarget(target) {
    if (!target.id || !target.sourceDir) {
      throw new Error('Build target requires id and sourceDir');
    }

    const normalizedTarget = {
      id: target.id,
      name: target.name || target.id,
      language: target.language || 'javascript',
      sourceDir: path.resolve(target.sourceDir),
      outputDir: path.resolve(target.outputDir || `dist/${target.id}`),
      dependencies: target.dependencies || [],
      buildScript: target.buildScript || this._getDefaultBuildScript(target.language),
      priority: target.priority || 5,
      timeout: target.timeout || this.config.buildTimeout,
      retries: target.retries || this.config.retryLimit,
      env: target.env || {},
      metadata: target.metadata || {}
    };

    this.targets.set(target.id, normalizedTarget);
    this._updateDependencyGraph();
    this.logger.info(`Registered build target: ${target.id}`);
    this.emit('target:registered', normalizedTarget);
    return this;
  }

  /**
   * Execute builds for specified targets
   */
  async build(targetIds) {
    const targets = targetIds
      ? targetIds.map(id => this.targets.get(id)).filter(Boolean)
      : Array.from(this.targets.values());

    if (targets.length === 0) {
      throw new Error('No valid build targets specified');
    }

    this.logger.info(`Starting build for ${targets.length} targets`);
    this.emit('build:started', { targets: targets.map(t => t.id) });

    const startTime = Date.now();
    const results = new Map();

    // Topological sort for dependency ordering
    const sortedTargets = this._topologicalSort(targets);
    const buildLevels = this._groupByDependencyLevel(sortedTargets);

    for (const level of buildLevels) {
      const levelResults = await this._executeBuildLevel(level);
      for (const [id, result] of levelResults) {
        results.set(id, result);
        if (!result.success) {
          this.logger.error(`Build failed for ${id}: ${result.error}`);
          const dependents = this._getDependentTargets(id);
          for (const depId of dependents) {
            if (!results.has(depId)) {
              results.set(depId, {
                success: false, duration: 0, artifacts: [],
                error: `Skipped due to dependency failure: ${id}`, metrics: {}
              });
            }
          }
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    this.metrics.totalDuration += totalDuration;
    this.emit('build:completed', { results: Object.fromEntries(results), duration: totalDuration });
    return results;
  }

  async _executeBuildLevel(targets) {
    const results = new Map();
    const chunks = this._chunkArray(targets, this.config.maxParallelBuilds);

    for (const chunk of chunks) {
      const promises = chunk.map(target => this._executeBuild(target));
      const chunkResults = await Promise.allSettled(promises);
      chunkResults.forEach((result, index) => {
        const target = chunk[index];
        if (result.status === 'fulfilled') {
          results.set(target.id, result.value);
        } else {
          results.set(target.id, {
            success: false, duration: 0, artifacts: [],
            error: result.reason?.message || 'Unknown error', metrics: {}
          });
        }
      });
    }
    return results;
  }

  async _executeBuild(target) {
    const startTime = Date.now();
    this.logger.info(`Building ${target.id}...`);
    this.emit('target:building', { targetId: target.id });

    try {
      if (this.config.cacheEnabled) {
        const cached = await this._checkCache(target);
        if (cached) {
          this.metrics.cacheHits++;
          this.logger.info(`Cache hit for ${target.id}`);
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      await fs.mkdir(target.outputDir, { recursive: true });

      let lastError;
      for (let attempt = 1; attempt <= target.retries; attempt++) {
        try {
          await this._runBuildCommand(target);
          const artifacts = await this._collectArtifacts(target);

          const buildResult = {
            success: true,
            duration: Date.now() - startTime,
            artifacts,
            metrics: { attempt, sourceFiles: await this._countFiles(target.sourceDir) }
          };

          if (this.config.cacheEnabled) await this._updateCache(target, buildResult);
          this.metrics.totalBuilds++;
          this.metrics.successfulBuilds++;
          this.emit('target:built', { targetId: target.id, result: buildResult });
          return buildResult;

        } catch (error) {
          lastError = error;
          this.logger.warn(`Build attempt ${attempt} failed for ${target.id}: ${error.message}`);
          if (attempt < target.retries) await this._delay(1000 * attempt);
        }
      }
      throw lastError;

    } catch (error) {
      this.metrics.totalBuilds++;
      this.metrics.failedBuilds++;
      const result = { success: false, duration: Date.now() - startTime, artifacts: [], error: error.message, metrics: {} };
      this.emit('target:failed', { targetId: target.id, error: error.message });
      return result;
    }
  }

  async _runBuildCommand(target) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = target.buildScript.split(' ');
      const proc = spawn(cmd, args, { cwd: target.sourceDir, env: { ...process.env, ...target.env }, shell: true });

      let stdout = '', stderr = '';
      proc.stdout.on('data', data => { stdout += data; });
      proc.stderr.on('data', data => { stderr += data; });

      const timeout = setTimeout(() => { proc.kill(); reject(new Error(`Build timeout`)); }, target.timeout);

      proc.on('close', code => {
        clearTimeout(timeout);
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Build failed with code ${code}: ${stderr}`));
      });
      proc.on('error', error => { clearTimeout(timeout); reject(error); });
    });
  }

  _topologicalSort(targets) {
    const sorted = [], visited = new Set(), visiting = new Set();
    const visit = (target) => {
      if (visited.has(target.id)) return;
      if (visiting.has(target.id)) throw new Error(`Circular dependency: ${target.id}`);
      visiting.add(target.id);
      for (const depId of target.dependencies) {
        const dep = this.targets.get(depId);
        if (dep && targets.includes(dep)) visit(dep);
      }
      visiting.delete(target.id);
      visited.add(target.id);
      sorted.push(target);
    };
    const prioritySorted = [...targets].sort((a, b) => b.priority - a.priority);
    for (const target of prioritySorted) visit(target);
    return sorted;
  }

  _groupByDependencyLevel(sortedTargets) {
    const levels = [], processed = new Set();
    while (processed.size < sortedTargets.length) {
      const currentLevel = [];
      for (const target of sortedTargets) {
        if (processed.has(target.id)) continue;
        const depsResolved = target.dependencies.every(depId => processed.has(depId) || !this.targets.has(depId));
        if (depsResolved) currentLevel.push(target);
      }
      if (currentLevel.length === 0) throw new Error('Unable to resolve dependencies');
      currentLevel.forEach(t => processed.add(t.id));
      levels.push(currentLevel);
    }
    return levels;
  }

  _getDefaultBuildScript(language) {
    const scripts = { typescript: 'npm run build', javascript: 'npm run build', python: 'python -m build' };
    return scripts[language] || 'npm run build';
  }

  async _collectArtifacts(target) {
    try {
      const files = await fs.readdir(target.outputDir, { recursive: true });
      return files.map(f => path.join(target.outputDir, f));
    } catch { return []; }
  }

  async _checkCache(target) {
    const hash = await this._calculateSourceHash(target.sourceDir);
    return this.cache.get(`${target.id}:${hash}`) || null;
  }

  async _updateCache(target, result) {
    const hash = await this._calculateSourceHash(target.sourceDir);
    this.cache.set(`${target.id}:${hash}`, result);
  }

  async _calculateSourceHash(dir) {
    const hash = crypto.createHash('sha256');
    try {
      const files = await fs.readdir(dir, { recursive: true });
      for (const file of files.slice(0, 100)) {
        const stat = await fs.stat(path.join(dir, file)).catch(() => null);
        if (stat?.isFile()) hash.update(`${file}:${stat.mtime.getTime()}`);
      }
    } catch { hash.update(Date.now().toString()); }
    return hash.digest('hex').substring(0, 16);
  }

  async _countFiles(dir) {
    try { return (await fs.readdir(dir, { recursive: true })).length; } catch { return 0; }
  }

  _updateDependencyGraph() {
    this.dependencyGraph.clear();
    for (const [id, target] of this.targets) this.dependencyGraph.set(id, new Set(target.dependencies));
  }

  _getDependentTargets(targetId) {
    const dependents = [];
    for (const [id, deps] of this.dependencyGraph) if (deps.has(targetId)) dependents.push(id);
    return dependents;
  }

  _chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
    return chunks;
  }

  _delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalBuilds > 0 ? (this.metrics.successfulBuilds / this.metrics.totalBuilds * 100).toFixed(2) + '%' : 'N/A',
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0 ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) + '%' : 'N/A'
    };
  }

  async performHealthCheck() {
    return { status: 'healthy', targets: this.targets.size, activeBuilds: this.activeBuilds.size, metrics: this.getMetrics() };
  }

  async shutdown() {
    this.logger.info('Shutting down build orchestrator');
    for (const [id, build] of this.activeBuilds) build.cancel?.();
    this.removeAllListeners();
  }
}

module.exports = { BuildOrchestrator };
