/**
 * BMAD Dependency Manager - Epic 5.1
 * Build dependency management with topological sorting and cycle detection.
 *
 * @module DependencyManager
 * @version 1.0.0
 */

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Dependency resolution status
 */
const DependencyStatus = {
  UNRESOLVED: 'unresolved',
  RESOLVING: 'resolving',
  RESOLVED: 'resolved',
  FAILED: 'failed',
  CIRCULAR: 'circular'
};

/**
 * Dependency Manager class
 * Handles build target dependencies with topological sorting
 */
class DependencyManager extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      strictMode: config.strictMode !== false,
      maxDepth: config.maxDepth || 50,
      allowOptionalDeps: config.allowOptionalDeps !== false,
      cacheEnabled: config.cacheEnabled !== false,
      workspaceRoot: config.workspaceRoot || process.cwd(),
      ...config
    };

    // Dependency graph storage
    this.graph = new Map();
    this.reverseGraph = new Map();
    this.dependencyCache = new Map();
    this.resolutionCache = new Map();

    // Metadata storage
    this.targetMetadata = new Map();
    this.versionConstraints = new Map();

    // State tracking
    this.isInitialized = false;
    this.lastResolution = null;

    // Statistics
    this.stats = {
      totalDependencies: 0,
      resolvedDependencies: 0,
      failedResolutions: 0,
      circularDetections: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Initialize the dependency manager
   */
  async initialize() {
    this.isInitialized = true;
    this.emit('initialized', { timestamp: new Date() });
    return this;
  }

  /**
   * Register dependencies for a target
   * @param {string} targetId - Target identifier
   * @param {Array<string|Object>} dependencies - Array of dependency IDs or objects
   */
  registerDependencies(targetId, dependencies = []) {
    if (!targetId) {
      throw new Error('Target ID is required');
    }

    // Normalize dependencies to array of objects
    const normalizedDeps = dependencies.map(dep => {
      if (typeof dep === 'string') {
        return { id: dep, optional: false, version: '*' };
      }
      return {
        id: dep.id || dep,
        optional: dep.optional || false,
        version: dep.version || '*',
        condition: dep.condition || null
      };
    });

    // Store in graph
    this.graph.set(targetId, normalizedDeps);

    // Update reverse graph (dependents)
    for (const dep of normalizedDeps) {
      if (!this.reverseGraph.has(dep.id)) {
        this.reverseGraph.set(dep.id, new Set());
      }
      this.reverseGraph.get(dep.id).add(targetId);
    }

    // Update statistics
    this.stats.totalDependencies += normalizedDeps.length;

    // Invalidate caches
    this.resolutionCache.clear();

    this.emit('dependenciesRegistered', {
      targetId,
      dependencies: normalizedDeps,
      timestamp: new Date()
    });

    return this;
  }

  /**
   * Get topologically sorted build order
   * @param {Array<string>} targetIds - Target IDs to sort
   * @returns {Promise<Array<string>>} Sorted target IDs
   */
  async getTopologicalOrder(targetIds) {
    // Check cache
    const cacheKey = this._generateCacheKey(targetIds);
    if (this.config.cacheEnabled && this.resolutionCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.resolutionCache.get(cacheKey);
    }
    this.stats.cacheMisses++;

    // Perform topological sort using Kahn's algorithm
    const result = [];
    const visited = new Set();
    const visiting = new Set();
    const targetSet = new Set(targetIds);

    // Include all dependencies recursively
    const allTargets = await this._expandDependencies(targetIds);

    // DFS-based topological sort
    const visit = async (nodeId) => {
      if (visited.has(nodeId)) {
        return;
      }

      if (visiting.has(nodeId)) {
        this.stats.circularDetections++;
        const cycle = this._findCycle(nodeId, visiting);
        throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`);
      }

      visiting.add(nodeId);

      const deps = this.graph.get(nodeId) || [];
      for (const dep of deps) {
        // Only visit if it's in our target set or we need it
        if (allTargets.has(dep.id)) {
          await visit(dep.id);
        }
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    // Visit all targets
    for (const targetId of allTargets) {
      await visit(targetId);
    }

    // Cache result
    if (this.config.cacheEnabled) {
      this.resolutionCache.set(cacheKey, result);
    }

    this.lastResolution = {
      targets: targetIds,
      order: result,
      timestamp: new Date()
    };

    this.emit('dependencyResolved', {
      order: result,
      timestamp: new Date()
    });

    return result;
  }

  /**
   * Expand dependencies recursively
   * @private
   */
  async _expandDependencies(targetIds, depth = 0) {
    if (depth > this.config.maxDepth) {
      throw new Error(`Maximum dependency depth exceeded: ${this.config.maxDepth}`);
    }

    const expanded = new Set(targetIds);
    const queue = [...targetIds];

    while (queue.length > 0) {
      const current = queue.shift();
      const deps = this.graph.get(current) || [];

      for (const dep of deps) {
        if (!expanded.has(dep.id)) {
          expanded.add(dep.id);
          queue.push(dep.id);
        }
      }
    }

    return expanded;
  }

  /**
   * Find cycle in dependency graph
   * @private
   */
  _findCycle(nodeId, visiting) {
    const cycle = [nodeId];
    const deps = this.graph.get(nodeId) || [];

    for (const dep of deps) {
      if (visiting.has(dep.id)) {
        cycle.push(dep.id);
        return cycle;
      }
    }

    return cycle;
  }

  /**
   * Get parallel groups for building
   * @param {Array<string>} sortedOrder - Topologically sorted targets
   * @returns {Array<Array<string>>} Groups that can be built in parallel
   */
  getParallelGroups(sortedOrder) {
    const groups = [];
    const completed = new Set();

    let remaining = [...sortedOrder];

    while (remaining.length > 0) {
      const currentGroup = [];

      for (const targetId of remaining) {
        const deps = this.graph.get(targetId) || [];
        const depsResolved = deps.every(dep =>
          completed.has(dep.id) || !remaining.includes(dep.id)
        );

        if (depsResolved) {
          currentGroup.push(targetId);
        }
      }

      if (currentGroup.length === 0) {
        throw new Error('Unable to resolve dependency groups - possible circular dependency');
      }

      groups.push(currentGroup);
      currentGroup.forEach(id => completed.add(id));
      remaining = remaining.filter(id => !completed.has(id));
    }

    return groups;
  }

  /**
   * Check if target has dependencies
   * @param {string} targetId - Target ID
   * @returns {boolean} True if target has dependencies
   */
  hasDependencies(targetId) {
    const deps = this.graph.get(targetId);
    return deps && deps.length > 0;
  }

  /**
   * Get direct dependencies of a target
   * @param {string} targetId - Target ID
   * @returns {Array} Array of dependency objects
   */
  getDependencies(targetId) {
    return this.graph.get(targetId) || [];
  }

  /**
   * Get all transitive dependencies
   * @param {string} targetId - Target ID
   * @returns {Promise<Set<string>>} Set of all dependency IDs
   */
  async getTransitiveDependencies(targetId) {
    const result = new Set();
    const queue = [targetId];
    const visited = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = this.graph.get(current) || [];
      for (const dep of deps) {
        result.add(dep.id);
        if (!visited.has(dep.id)) {
          queue.push(dep.id);
        }
      }
    }

    return result;
  }

  /**
   * Get targets that depend on the given target
   * @param {string} targetId - Target ID
   * @returns {Set<string>} Set of dependent target IDs
   */
  getDependents(targetId) {
    return this.reverseGraph.get(targetId) || new Set();
  }

  /**
   * Check for circular dependencies
   * @param {Array<string>} targetIds - Targets to check
   * @returns {Object} Result with any detected cycles
   */
  async detectCircularDependencies(targetIds = null) {
    const targets = targetIds || Array.from(this.graph.keys());
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const pathStack = [];

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      pathStack.push(nodeId);

      const deps = this.graph.get(nodeId) || [];
      for (const dep of deps) {
        if (!visited.has(dep.id)) {
          const result = dfs(dep.id);
          if (result) return result;
        } else if (recursionStack.has(dep.id)) {
          // Found a cycle
          const cycleStart = pathStack.indexOf(dep.id);
          const cycle = pathStack.slice(cycleStart);
          cycle.push(dep.id);
          cycles.push(cycle);
        }
      }

      pathStack.pop();
      recursionStack.delete(nodeId);
      return null;
    };

    for (const targetId of targets) {
      if (!visited.has(targetId)) {
        dfs(targetId);
      }
    }

    return {
      hasCycles: cycles.length > 0,
      cycles,
      checkedTargets: targets.length
    };
  }

  /**
   * Validate dependency graph
   * @returns {Object} Validation result
   */
  async validateGraph() {
    const issues = [];
    const warnings = [];

    // Check for missing dependencies
    for (const [targetId, deps] of this.graph) {
      for (const dep of deps) {
        if (!this.graph.has(dep.id) && !dep.optional) {
          if (this.config.strictMode) {
            issues.push({
              type: 'missing_dependency',
              target: targetId,
              dependency: dep.id,
              message: `Missing required dependency: ${dep.id}`
            });
          } else {
            warnings.push({
              type: 'missing_dependency',
              target: targetId,
              dependency: dep.id,
              message: `Optional dependency not found: ${dep.id}`
            });
          }
        }
      }
    }

    // Check for circular dependencies
    const cycleCheck = await this.detectCircularDependencies();
    if (cycleCheck.hasCycles) {
      for (const cycle of cycleCheck.cycles) {
        issues.push({
          type: 'circular_dependency',
          cycle,
          message: `Circular dependency: ${cycle.join(' -> ')}`
        });
      }
    }

    // Check for orphan targets (no dependents and no dependencies)
    for (const targetId of this.graph.keys()) {
      const deps = this.graph.get(targetId) || [];
      const dependents = this.reverseGraph.get(targetId) || new Set();

      if (deps.length === 0 && dependents.size === 0 && this.graph.size > 1) {
        warnings.push({
          type: 'orphan_target',
          target: targetId,
          message: `Target has no dependencies and no dependents: ${targetId}`
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      summary: {
        totalTargets: this.graph.size,
        totalDependencies: this.stats.totalDependencies,
        issueCount: issues.length,
        warningCount: warnings.length
      }
    };
  }

  /**
   * Remove a target and its dependencies
   * @param {string} targetId - Target to remove
   */
  removeTarget(targetId) {
    // Remove from graph
    this.graph.delete(targetId);

    // Remove from reverse graph
    this.reverseGraph.delete(targetId);

    // Remove references in other targets
    for (const [id, deps] of this.graph) {
      const filtered = deps.filter(d => d.id !== targetId);
      if (filtered.length !== deps.length) {
        this.graph.set(id, filtered);
      }
    }

    for (const [id, dependents] of this.reverseGraph) {
      dependents.delete(targetId);
    }

    // Clear caches
    this.resolutionCache.clear();

    this.emit('targetRemoved', { targetId, timestamp: new Date() });
  }

  /**
   * Get critical path (longest dependency chain)
   * @returns {Array<string>} Critical path target IDs
   */
  getCriticalPath() {
    const distances = new Map();
    const predecessors = new Map();

    // Initialize
    for (const targetId of this.graph.keys()) {
      distances.set(targetId, 0);
      predecessors.set(targetId, null);
    }

    // Calculate longest paths
    const sorted = this._topologicalSortSync(Array.from(this.graph.keys()));

    for (const targetId of sorted) {
      const deps = this.graph.get(targetId) || [];
      for (const dep of deps) {
        if (this.graph.has(dep.id)) {
          const newDist = distances.get(targetId) + 1;
          if (newDist > distances.get(dep.id)) {
            distances.set(dep.id, newDist);
            predecessors.set(dep.id, targetId);
          }
        }
      }
    }

    // Find endpoint with longest distance
    let maxDist = 0;
    let endpoint = null;
    for (const [targetId, dist] of distances) {
      if (dist >= maxDist) {
        maxDist = dist;
        endpoint = targetId;
      }
    }

    // Reconstruct path
    const path = [];
    let current = endpoint;
    while (current !== null) {
      path.unshift(current);
      current = predecessors.get(current);
    }

    return path;
  }

  /**
   * Synchronous topological sort helper
   * @private
   */
  _topologicalSortSync(targetIds) {
    const result = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      if (visiting.has(nodeId)) return; // Skip cycles

      visiting.add(nodeId);
      const deps = this.graph.get(nodeId) || [];
      for (const dep of deps) {
        if (targetIds.includes(dep.id)) {
          visit(dep.id);
        }
      }
      visiting.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    for (const targetId of targetIds) {
      visit(targetId);
    }

    return result;
  }

  /**
   * Generate cache key for resolution
   * @private
   */
  _generateCacheKey(targetIds) {
    const sorted = [...targetIds].sort();
    return crypto.createHash('md5').update(sorted.join(':')).digest('hex');
  }

  /**
   * Export dependency graph as DOT format
   * @returns {string} DOT format string
   */
  exportAsDot() {
    let dot = 'digraph dependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';

    for (const [targetId, deps] of this.graph) {
      dot += `  "${targetId}";\n`;
      for (const dep of deps) {
        const style = dep.optional ? ' [style=dashed]' : '';
        dot += `  "${targetId}" -> "${dep.id}"${style};\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Get statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      totalTargets: this.graph.size,
      cacheSize: this.resolutionCache.size
    };
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const validation = await this.validateGraph();

    return {
      status: validation.valid ? 'healthy' : 'warning',
      targets: this.graph.size,
      dependencies: this.stats.totalDependencies,
      issues: validation.issues.length,
      warnings: validation.warnings.length,
      cacheHitRate: this.stats.cacheHits + this.stats.cacheMisses > 0
        ? ((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.dependencyCache.clear();
    this.resolutionCache.clear();
    this.emit('cacheCleared', { timestamp: new Date() });
  }

  /**
   * Shutdown
   */
  async shutdown() {
    this.clearCache();
    this.graph.clear();
    this.reverseGraph.clear();
    this.isInitialized = false;
    this.emit('shutdown', { timestamp: new Date() });
  }
}

module.exports = DependencyManager;
module.exports.DependencyStatus = DependencyStatus;
