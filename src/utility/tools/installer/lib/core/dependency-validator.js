/**
 * Dependency Validator
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Validates and resolves dependencies between BMAD modules.
 * Integrates with the installation validation logic and compatibility matrix.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const semver = require('semver');
const path = require('path');
const fs = require('fs').promises;

/**
 * Dependency Validation and Resolution Engine
 * Handles complex dependency graphs, version conflicts, and compatibility checks
 */
class DependencyValidator {
  constructor(options = {}) {
    this.options = {
      strictValidation: options.strictValidation !== false,
      allowPrerelease: options.allowPrerelease || false,
      compatibilityMatrixPath: options.compatibilityMatrixPath,
      coreModulePath: options.coreModulePath || 'src/core',
      ...options
    };

    // Cached data
    this.compatibilityMatrix = null;
    this.installedModules = null;
    this.coreVersion = null;
  }

  /**
   * Validate dependency graph for a set of modules
   * @param {Map} moduleGraph - Map of module names to module info
   * @returns {Promise<ValidationResult>} Validation result with any issues
   */
  async validateGraph(moduleGraph) {
    try {
      const validationResult = {
        valid: true,
        errors: [],
        warnings: [],
        resolutions: [],
        dependencyOrder: []
      };

      // Load required data
      await this.loadDependencyData();

      // Validate each module's dependencies
      for (const [moduleName, moduleInfo] of moduleGraph) {
        const moduleValidation = await this.validateModuleDependencies(moduleName, moduleInfo, moduleGraph);
        this.mergeValidationResults(validationResult, moduleValidation);
      }

      // Check for circular dependencies
      const circularDeps = await this.detectCircularDependencies(moduleGraph);
      if (circularDeps.length > 0) {
        validationResult.valid = false;
        validationResult.errors.push({
          type: 'CIRCULAR_DEPENDENCY',
          message: 'Circular dependencies detected',
          cycles: circularDeps
        });
      }

      // Calculate installation order
      if (validationResult.valid) {
        validationResult.dependencyOrder = await this.calculateInstallationOrder(moduleGraph);
      }

      return validationResult;

    } catch (error) {
      throw new Error(`Dependency validation failed: ${error.message}`);
    }
  }

  /**
   * Resolve version conflicts in dependency graph
   * @param {Map} moduleGraph - Module dependency graph
   * @returns {Promise<Map>} Resolved dependency graph
   */
  async resolveConflicts(moduleGraph) {
    try {
      const resolvedGraph = new Map(moduleGraph);
      const conflicts = await this.detectVersionConflicts(moduleGraph);

      for (const conflict of conflicts) {
        const resolution = await this.resolveVersionConflict(conflict, resolvedGraph);
        if (resolution) {
          // Apply resolution to graph
          this.applyResolution(resolvedGraph, resolution);
        }
      }

      return resolvedGraph;

    } catch (error) {
      throw new Error(`Conflict resolution failed: ${error.message}`);
    }
  }

  /**
   * Load dependency-related data
   */
  async loadDependencyData() {
    // Load compatibility matrix
    if (!this.compatibilityMatrix) {
      this.compatibilityMatrix = await this.loadCompatibilityMatrix();
    }

    // Load installed modules
    if (!this.installedModules) {
      this.installedModules = await this.loadInstalledModules();
    }

    // Get BMAD core version
    if (!this.coreVersion) {
      this.coreVersion = await this.getBmadCoreVersion();
    }
  }

  /**
   * Validate dependencies for a single module
   * @param {string} moduleName - Name of the module
   * @param {Object} moduleInfo - Module information
   * @param {Map} moduleGraph - Complete module graph for context
   * @returns {Promise<ValidationResult>} Module-specific validation result
   */
  async validateModuleDependencies(moduleName, moduleInfo, moduleGraph) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      module: moduleName
    };

    try {
      // Validate core dependency
      const coreValidation = await this.validateCoreDependency(moduleInfo);
      this.mergeValidationResults(result, coreValidation);

      // Validate peer dependencies
      const peerValidation = await this.validatePeerDependencies(moduleInfo, moduleGraph);
      this.mergeValidationResults(result, peerValidation);

      // Check compatibility matrix
      const compatibilityValidation = await this.validateCompatibility(moduleName, moduleInfo);
      this.mergeValidationResults(result, compatibilityValidation);

      // Validate against installed modules
      const installedValidation = await this.validateAgainstInstalled(moduleInfo);
      this.mergeValidationResults(result, installedValidation);

    } catch (error) {
      result.valid = false;
      result.errors.push({
        type: 'VALIDATION_ERROR',
        message: `Failed to validate ${moduleName}: ${error.message}`
      });
    }

    return result;
  }

  /**
   * Validate BMAD core dependency
   */
  async validateCoreDependency(moduleInfo) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!moduleInfo.dependencies || !moduleInfo.dependencies.core) {
      result.errors.push({
        type: 'MISSING_CORE_DEPENDENCY',
        message: 'Module must specify BMAD core dependency'
      });
      result.valid = false;
      return result;
    }

    const coreDep = moduleInfo.dependencies.core;
    const requiredVersion = coreDep.version;

    if (!this.coreVersion) {
      result.errors.push({
        type: 'CORE_VERSION_UNKNOWN',
        message: 'Cannot determine BMAD core version'
      });
      result.valid = false;
      return result;
    }

    // Check version compatibility
    if (!semver.satisfies(this.coreVersion, requiredVersion)) {
      result.errors.push({
        type: 'CORE_VERSION_INCOMPATIBLE',
        message: `Core version ${this.coreVersion} doesn't satisfy requirement ${requiredVersion}`,
        current: this.coreVersion,
        required: requiredVersion
      });
      result.valid = false;
    } else if (semver.prerelease(this.coreVersion) && !this.options.allowPrerelease) {
      result.warnings.push({
        type: 'CORE_PRERELEASE',
        message: `Using prerelease core version ${this.coreVersion}`,
        recommendation: 'Consider using stable release for production'
      });
    }

    // Validate required core agents
    if (coreDep.agents && coreDep.agents.length > 0) {
      const missingAgents = await this.checkRequiredAgents(coreDep.agents);
      if (missingAgents.length > 0) {
        result.errors.push({
          type: 'MISSING_CORE_AGENTS',
          message: `Required core agents not found: ${missingAgents.join(', ')}`,
          missingAgents: missingAgents
        });
        result.valid = false;
      }
    }

    // Validate required core workflows
    if (coreDep.workflows && coreDep.workflows.length > 0) {
      const missingWorkflows = await this.checkRequiredWorkflows(coreDep.workflows);
      if (missingWorkflows.length > 0) {
        result.errors.push({
          type: 'MISSING_CORE_WORKFLOWS',
          message: `Required core workflows not found: ${missingWorkflows.join(', ')}`,
          missingWorkflows: missingWorkflows
        });
        result.valid = false;
      }
    }

    return result;
  }

  /**
   * Validate peer dependencies
   */
  async validatePeerDependencies(moduleInfo, moduleGraph) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!moduleInfo.dependencies || !moduleInfo.dependencies.peer_dependencies) {
      return result; // No peer dependencies is fine
    }

    const peerDeps = moduleInfo.dependencies.peer_dependencies;

    for (const peerDep of peerDeps) {
      const peerModuleName = peerDep.module;
      const requiredVersion = peerDep.version;
      const isRequired = peerDep.required !== false;
      const condition = peerDep.condition;

      // Check if peer module is being installed
      let peerModule = moduleGraph.get(peerModuleName);

      // Check if peer module is already installed
      if (!peerModule && this.installedModules) {
        peerModule = this.installedModules.find(m => m.name === peerModuleName);
      }

      if (!peerModule) {
        if (isRequired) {
          result.errors.push({
            type: 'MISSING_PEER_DEPENDENCY',
            message: `Required peer dependency not found: ${peerModuleName}`,
            peerModule: peerModuleName,
            required: requiredVersion
          });
          result.valid = false;
        } else {
          result.warnings.push({
            type: 'OPTIONAL_PEER_MISSING',
            message: `Optional peer dependency not available: ${peerModuleName}`,
            impact: 'Some functionality may be limited'
          });
        }
        continue;
      }

      // Validate version compatibility
      const peerVersion = peerModule.version;
      if (peerVersion && requiredVersion) {
        if (!semver.satisfies(peerVersion, requiredVersion)) {
          if (isRequired) {
            result.errors.push({
              type: 'PEER_VERSION_INCOMPATIBLE',
              message: `Peer dependency version mismatch: ${peerModuleName}@${peerVersion} doesn't satisfy ${requiredVersion}`,
              peerModule: peerModuleName,
              currentVersion: peerVersion,
              requiredVersion: requiredVersion
            });
            result.valid = false;
          } else {
            result.warnings.push({
              type: 'PEER_VERSION_SKEW',
              message: `Optional peer dependency version skew: ${peerModuleName}@${peerVersion} vs required ${requiredVersion}`,
              impact: 'Cross-module functionality may be limited'
            });
          }
        }
      }

      // Check conditional dependencies
      if (condition) {
        const conditionMet = await this.evaluateCondition(condition, moduleGraph);
        if (conditionMet && !peerModule) {
          result.warnings.push({
            type: 'CONDITIONAL_DEPENDENCY_UNMET',
            message: `Condition '${condition}' is met but peer dependency ${peerModuleName} is not available`,
            condition: condition
          });
        }
      }
    }

    return result;
  }

  /**
   * Validate against compatibility matrix
   */
  async validateCompatibility(moduleName, moduleInfo) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!this.compatibilityMatrix) {
      result.warnings.push({
        type: 'NO_COMPATIBILITY_MATRIX',
        message: 'Compatibility matrix not available, skipping compatibility checks'
      });
      return result;
    }

    // Check module compatibility with core
    const coreCompatibility = this.compatibilityMatrix.core?.[moduleName];
    if (coreCompatibility) {
      const compatible = await this.checkCompatibilityEntry(
        moduleName,
        moduleInfo.version,
        'bmad:core',
        this.coreVersion,
        coreCompatibility
      );

      if (!compatible.compatible) {
        result.errors.push({
          type: 'CORE_COMPATIBILITY_ISSUE',
          message: compatible.reason || 'Module not compatible with current core version',
          moduleName,
          moduleVersion: moduleInfo.version,
          coreVersion: this.coreVersion
        });
        result.valid = false;
      } else if (compatible.warnings) {
        result.warnings.push(...compatible.warnings);
      }
    }

    // Check compatibility with other modules
    if (this.installedModules) {
      for (const installedModule of this.installedModules) {
        const compatibility = this.compatibilityMatrix.modules?.[moduleName]?.[installedModule.name];
        if (compatibility) {
          const compatible = await this.checkCompatibilityEntry(
            moduleName,
            moduleInfo.version,
            installedModule.name,
            installedModule.version,
            compatibility
          );

          if (!compatible.compatible) {
            result.errors.push({
              type: 'MODULE_COMPATIBILITY_ISSUE',
              message: compatible.reason || `Module not compatible with ${installedModule.name}@${installedModule.version}`,
              moduleName,
              conflictingModule: installedModule.name,
              conflictingVersion: installedModule.version
            });
            result.valid = false;
          } else if (compatible.warnings) {
            result.warnings.push(...compatible.warnings);
          }
        }
      }
    }

    return result;
  }

  /**
   * Detect circular dependencies in module graph
   */
  async detectCircularDependencies(moduleGraph) {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (moduleName, path = []) => {
      if (recursionStack.has(moduleName)) {
        // Found cycle
        const cycleStart = path.indexOf(moduleName);
        const cycle = path.slice(cycleStart).concat([moduleName]);
        cycles.push(cycle);
        return;
      }

      if (visited.has(moduleName)) {
        return;
      }

      visited.add(moduleName);
      recursionStack.add(moduleName);
      path.push(moduleName);

      const moduleInfo = moduleGraph.get(moduleName);
      if (moduleInfo && moduleInfo.dependencies) {
        // Check peer dependencies
        if (moduleInfo.dependencies.peer_dependencies) {
          for (const peerDep of moduleInfo.dependencies.peer_dependencies) {
            if (moduleGraph.has(peerDep.module)) {
              dfs(peerDep.module, [...path]);
            }
          }
        }

        // Check other module dependencies
        if (moduleInfo.dependencies.modules) {
          for (const moduleDep of moduleInfo.dependencies.modules) {
            if (moduleGraph.has(moduleDep.module)) {
              dfs(moduleDep.module, [...path]);
            }
          }
        }
      }

      recursionStack.delete(moduleName);
      path.pop();
    };

    for (const moduleName of moduleGraph.keys()) {
      if (!visited.has(moduleName)) {
        dfs(moduleName);
      }
    }

    return cycles;
  }

  /**
   * Calculate optimal installation order based on dependencies
   */
  async calculateInstallationOrder(moduleGraph) {
    const order = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (moduleName) => {
      if (temp.has(moduleName)) {
        throw new Error(`Circular dependency detected involving ${moduleName}`);
      }
      if (visited.has(moduleName)) {
        return;
      }

      temp.add(moduleName);

      const moduleInfo = moduleGraph.get(moduleName);
      if (moduleInfo && moduleInfo.dependencies) {
        // Visit peer dependencies first
        if (moduleInfo.dependencies.peer_dependencies) {
          for (const peerDep of moduleInfo.dependencies.peer_dependencies) {
            if (moduleGraph.has(peerDep.module) && peerDep.required !== false) {
              visit(peerDep.module);
            }
          }
        }
      }

      temp.delete(moduleName);
      visited.add(moduleName);
      order.push(moduleName);
    };

    for (const moduleName of moduleGraph.keys()) {
      if (!visited.has(moduleName)) {
        visit(moduleName);
      }
    }

    return order;
  }

  /**
   * Detect version conflicts between modules
   */
  async detectVersionConflicts(moduleGraph) {
    const conflicts = [];
    const moduleVersions = new Map();

    // Build version map
    for (const [moduleName, moduleInfo] of moduleGraph) {
      moduleVersions.set(moduleName, moduleInfo.version);
    }

    // Check for conflicts
    for (const [moduleName, moduleInfo] of moduleGraph) {
      if (moduleInfo.dependencies && moduleInfo.dependencies.peer_dependencies) {
        for (const peerDep of moduleInfo.dependencies.peer_dependencies) {
          const peerModuleName = peerDep.module;
          const requiredVersion = peerDep.version;
          const actualVersion = moduleVersions.get(peerModuleName);

          if (actualVersion && requiredVersion) {
            if (!semver.satisfies(actualVersion, requiredVersion)) {
              conflicts.push({
                type: 'VERSION_CONFLICT',
                requestingModule: moduleName,
                dependencyModule: peerModuleName,
                requiredVersion: requiredVersion,
                actualVersion: actualVersion,
                severity: peerDep.required !== false ? 'error' : 'warning'
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve a version conflict
   */
  async resolveVersionConflict(conflict, moduleGraph) {
    // Strategy 1: Find compatible version that satisfies all requirements
    const compatibleVersions = await this.findCompatibleVersions(
      conflict.dependencyModule,
      moduleGraph
    );

    if (compatibleVersions.length > 0) {
      return {
        type: 'VERSION_UPGRADE',
        module: conflict.dependencyModule,
        fromVersion: conflict.actualVersion,
        toVersion: compatibleVersions[0], // Use highest compatible version
        reason: `Resolves version conflict for ${conflict.requestingModule}`
      };
    }

    // Strategy 2: Check if conflict can be downgraded to warning
    if (conflict.severity === 'error') {
      const canDowngrade = await this.canDowngradeConflict(conflict, moduleGraph);
      if (canDowngrade) {
        return {
          type: 'CONFLICT_DOWNGRADE',
          conflict: conflict,
          reason: 'Conflict severity reduced based on usage analysis'
        };
      }
    }

    // Strategy 3: Suggest alternative module versions
    const alternatives = await this.findAlternativeVersions(conflict.requestingModule);
    if (alternatives.length > 0) {
      return {
        type: 'ALTERNATIVE_VERSION',
        module: conflict.requestingModule,
        alternatives: alternatives,
        reason: 'Alternative module versions that may resolve conflict'
      };
    }

    return null; // No resolution found
  }

  /**
   * Merge validation results
   */
  mergeValidationResults(target, source) {
    if (!source.valid) {
      target.valid = false;
    }
    if (source.errors) {
      target.errors.push(...source.errors);
    }
    if (source.warnings) {
      target.warnings.push(...source.warnings);
    }
    if (source.resolutions) {
      target.resolutions = target.resolutions || [];
      target.resolutions.push(...source.resolutions);
    }
  }

  // Placeholder methods for external data loading and system integration
  async loadCompatibilityMatrix() {
    // TODO: Load from module-compatibility-matrix.md or external source
    return null;
  }

  async loadInstalledModules() {
    // TODO: Load from installed modules registry
    return [];
  }

  async getBmadCoreVersion() {
    // TODO: Determine BMAD core version from installation
    return '2.0.0';
  }

  async checkRequiredAgents(agents) {
    // TODO: Check if required agents exist in core installation
    return [];
  }

  async checkRequiredWorkflows(workflows) {
    // TODO: Check if required workflows exist in core installation
    return [];
  }

  async evaluateCondition(condition, moduleGraph) {
    // TODO: Evaluate dependency condition
    return false;
  }

  async checkCompatibilityEntry(module1, version1, module2, version2, compatibility) {
    // TODO: Check specific compatibility matrix entry
    return { compatible: true, warnings: [] };
  }

  async findCompatibleVersions(moduleName, moduleGraph) {
    // TODO: Find versions that satisfy all requirements
    return [];
  }

  async canDowngradeConflict(conflict, moduleGraph) {
    // TODO: Analyze if conflict can be safely downgraded
    return false;
  }

  async findAlternativeVersions(moduleName) {
    // TODO: Find alternative versions of a module
    return [];
  }

  applyResolution(moduleGraph, resolution) {
    // TODO: Apply conflict resolution to module graph
    console.log(`Applied resolution: ${resolution.type}`);
  }
}

module.exports = DependencyValidator;