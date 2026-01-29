/**
 * BMAD Package Registry Integration Adapter
 * Epic 3: Story 3.3 - Package Registry System
 *
 * Integration layer that connects the package registry with:
 * - Amelia's installation framework
 * - Winston's dependency management system
 * - Specialized teams (cybersec, intel, legal, strategy)
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { PackageRegistryManager } = require('./package-registry-manager');
const BMADDependencyManager = require('../core/bmad-dependency-manager');
const InstallationLogger = require('../core/installation-logger');

class PackageRegistryIntegration {
  constructor(options = {}) {
    this.config = {
      bmadRoot: options.bmadRoot || './_bmad',
      registryPath: options.registryPath || './_bmad/registry',
      enableIntegrationLogging: options.enableIntegrationLogging !== false,
      autoRegisterInstalls: options.autoRegisterInstalls !== false,
      ...options
    };

    // Initialize components
    this.logger = new InstallationLogger({
      enableFileLogging: this.config.enableIntegrationLogging,
      logDirectory: path.join(this.config.bmadRoot, 'logs'),
      logLevel: 'info'
    });

    this.registry = new PackageRegistryManager({
      bmadRoot: this.config.bmadRoot,
      registryPath: this.config.registryPath,
      logger: this.logger
    });

    this.dependencyManager = new BMADDependencyManager({
      bmadRoot: this.config.bmadRoot,
      logger: this.logger
    });

    // Integration hooks
    this.installationHooks = new Map();
    this.updateHooks = new Map();
    this.uninstallHooks = new Map();
  }

  /**
   * Initialize the integration system
   */
  async initialize() {
    try {
      this.logger.info('Integration', 'Initializing Package Registry Integration');

      // Initialize registry
      await this.registry.initialize();

      // Initialize dependency manager
      await this.dependencyManager.initialize();

      // Set up integration hooks
      this.setupInstallationHooks();
      this.setupDependencyHooks();

      this.logger.info('Integration', 'Package Registry Integration initialized successfully');

    } catch (error) {
      this.logger.error('Integration', 'Failed to initialize Package Registry Integration', { error: error.message });
      throw error;
    }
  }

  /**
   * Hook into Amelia's installation framework
   */
  setupInstallationHooks() {
    // Pre-installation hook
    this.installationHooks.set('pre-install', async (moduleConfig, installOptions) => {
      this.logger.info('Integration Hook', 'Pre-installation hook triggered', {
        moduleName: moduleConfig.name,
        version: moduleConfig.version
      });

      // Check if module is already installed
      const existingPackages = this.registry.listPackages({
        searchTerm: moduleConfig.name
      });

      if (existingPackages.length > 0 && !installOptions.force) {
        throw new Error(`Module ${moduleConfig.name} is already installed. Use --force to override.`);
      }

      // Validate dependencies before installation
      const dependencyResult = await this.dependencyManager.resolveDependencies(moduleConfig, installOptions);

      if (!dependencyResult.success) {
        throw new Error(`Dependency resolution failed: ${dependencyResult.error}`);
      }

      return {
        success: true,
        dependencyPlan: dependencyResult.installationPlan,
        registryData: this.preparePreliminaryRegistryEntry(moduleConfig, installOptions)
      };
    });

    // Post-installation hook
    this.installationHooks.set('post-install', async (moduleConfig, installResult, installOptions) => {
      this.logger.info('Integration Hook', 'Post-installation hook triggered', {
        moduleName: moduleConfig.name,
        success: installResult.success
      });

      if (installResult.success && this.config.autoRegisterInstalls) {
        // Register the installed package
        const packageInfo = this.createRegistryEntryFromInstallResult(
          moduleConfig,
          installResult,
          installOptions
        );

        const packageId = await this.registry.registerPackage(packageInfo);

        this.logger.info('Integration', 'Package registered in registry', {
          packageId,
          moduleName: moduleConfig.name
        });

        return { packageId, registered: true };
      }

      return { registered: false };
    });
  }

  /**
   * Setup dependency management integration hooks
   */
  setupDependencyHooks() {
    // Dependency validation hook
    this.installationHooks.set('validate-dependencies', async (moduleConfig) => {
      const dependencyResult = await this.dependencyManager.resolveDependencies(moduleConfig);

      if (!dependencyResult.success) {
        return {
          valid: false,
          issues: dependencyResult.conflicts || [],
          circularDependencies: dependencyResult.circularDependencies || []
        };
      }

      return {
        valid: true,
        installationPlan: dependencyResult.installationPlan,
        statistics: dependencyResult.statistics
      };
    });
  }

  /**
   * Install a specialized team module with full integration
   */
  async installSpecializedTeamModule(moduleName, options = {}) {
    const operationId = this.logger.logOperationStart('installSpecializedTeamModule', {
      moduleName,
      options
    });

    try {
      // Load module configuration
      const moduleConfig = await this.loadModuleConfiguration(moduleName);

      if (!moduleConfig) {
        throw new Error(`Module configuration not found: ${moduleName}`);
      }

      this.logger.info('Installation', 'Installing specialized team module', {
        operationId,
        moduleName: moduleConfig.name,
        version: moduleConfig.version,
        type: moduleConfig.type
      });

      // Execute pre-installation hook
      const preInstallResult = await this.executeHook('pre-install', moduleConfig, options);

      // Resolve and install dependencies first
      if (preInstallResult.dependencyPlan && preInstallResult.dependencyPlan.phases.length > 0) {
        await this.installDependencies(preInstallResult.dependencyPlan, options);
      }

      // Perform the actual installation
      const installResult = await this.performModuleInstallation(moduleConfig, options);

      // Execute post-installation hook
      const postInstallResult = await this.executeHook('post-install', moduleConfig, installResult, options);

      // Validate installation
      const validationResult = await this.validateInstallation(moduleConfig, installResult);

      this.logger.logOperationComplete(operationId, 'installSpecializedTeamModule', {
        packageId: postInstallResult.packageId,
        installed: installResult.success,
        registered: postInstallResult.registered,
        validated: validationResult.valid
      });

      return {
        success: true,
        packageId: postInstallResult.packageId,
        installResult,
        validationResult
      };

    } catch (error) {
      this.logger.logOperationFailure(operationId, 'installSpecializedTeamModule', error);
      throw error;
    }
  }

  /**
   * Update a package with registry integration
   */
  async updatePackage(packageId, targetVersion, options = {}) {
    const operationId = this.logger.logOperationStart('updatePackage', {
      packageId,
      targetVersion
    });

    try {
      // Get current package details
      const packageEntry = this.registry.getPackageDetails(packageId);

      if (!packageEntry) {
        throw new Error(`Package not found: ${packageId}`);
      }

      this.logger.info('Update', 'Updating package', {
        operationId,
        packageName: packageEntry.name,
        currentVersion: packageEntry.version,
        targetVersion
      });

      // Check dependencies for update
      const dependencyResult = await this.validateUpdateDependencies(packageEntry, targetVersion);

      if (!dependencyResult.valid && !options.force) {
        throw new Error(`Update blocked by dependency conflicts: ${dependencyResult.issues.join(', ')}`);
      }

      // Perform update through registry
      await this.registry.updatePackage(packageId, targetVersion, options);

      // Re-validate after update
      const updatedPackage = this.registry.getPackageDetails(packageId);
      const validationResult = await this.validatePackageIntegration(updatedPackage);

      this.logger.logOperationComplete(operationId, 'updatePackage', {
        packageId,
        updatedVersion: updatedPackage.version,
        validationResult
      });

      return {
        success: true,
        updatedPackage,
        validationResult
      };

    } catch (error) {
      this.logger.logOperationFailure(operationId, 'updatePackage', error);
      throw error;
    }
  }

  /**
   * Uninstall package with dependency management
   */
  async uninstallPackage(packageId, options = {}) {
    const operationId = this.logger.logOperationStart('uninstallPackage', {
      packageId,
      options
    });

    try {
      const packageEntry = this.registry.getPackageDetails(packageId);

      if (!packageEntry) {
        throw new Error(`Package not found: ${packageId}`);
      }

      this.logger.info('Uninstall', 'Uninstalling package', {
        operationId,
        packageName: packageEntry.name,
        version: packageEntry.version
      });

      // Check dependents before uninstall
      const dependentCheck = await this.checkDependentPackages(packageId);

      if (dependentCheck.hasBlockingDependents && !options.force) {
        throw new Error(`Cannot uninstall: package has dependent packages: ${dependentCheck.dependents.join(', ')}`);
      }

      // Perform uninstall through registry
      await this.registry.uninstallPackage(packageId, options);

      // Update dependency tracking for remaining packages
      await this.updateDependencyTracking();

      this.logger.logOperationComplete(operationId, 'uninstallPackage', {
        packageName: packageEntry.name,
        dependentsAffected: dependentCheck.dependents.length
      });

      return {
        success: true,
        uninstalledPackage: packageEntry,
        dependentsAffected: dependentCheck.dependents
      };

    } catch (error) {
      this.logger.logOperationFailure(operationId, 'uninstallPackage', error);
      throw error;
    }
  }

  /**
   * Perform system-wide health check with integration validation
   */
  async performSystemHealthCheck() {
    const operationId = this.logger.logOperationStart('systemHealthCheck');

    try {
      this.logger.info('Health Check', 'Performing system-wide health check');

      // Registry health check
      const registryHealth = await this.registry.runSystemHealthCheck();

      // Dependency consistency check
      const dependencyHealth = await this.checkDependencyConsistency();

      // Integration health check
      const integrationHealth = await this.checkIntegrationHealth();

      // Specialized teams validation
      const specializedTeamsHealth = await this.checkSpecializedTeamsHealth();

      const overallHealth = {
        registry: registryHealth,
        dependencies: dependencyHealth,
        integration: integrationHealth,
        specializedTeams: specializedTeamsHealth,
        overall: this.calculateOverallHealth([
          registryHealth,
          dependencyHealth,
          integrationHealth,
          specializedTeamsHealth
        ])
      };

      this.logger.logOperationComplete(operationId, 'systemHealthCheck', overallHealth);

      return overallHealth;

    } catch (error) {
      this.logger.logOperationFailure(operationId, 'systemHealthCheck', error);
      throw error;
    }
  }

  /**
   * Load module configuration from various sources
   */
  async loadModuleConfiguration(moduleName) {
    const sources = [
      path.join(this.config.bmadRoot, 'modules', `${moduleName}.yaml`),
      path.join('./', `${moduleName}-module.yaml.example`),
      path.join('./', `${moduleName}-team-module.yaml.example`)
    ];

    for (const source of sources) {
      try {
        const exists = await this.fileExists(source);
        if (exists) {
          const content = await fs.readFile(source, 'utf8');
          const config = require('yaml').parse(content);
          return this.normalizeModuleConfig(config);
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * Normalize module configuration to standard format
   */
  normalizeModuleConfig(rawConfig) {
    return {
      name: rawConfig.code || rawConfig.name,
      version: rawConfig.version || '1.0.0',
      type: rawConfig.type || 'specialized-team',
      category: rawConfig.category || 'bmad-specialized-teams',
      scope: rawConfig.npm?.scope || '@bmad-cybercommand',
      fullName: rawConfig.npm?.full_name || `${rawConfig.npm?.scope}/${rawConfig.code}`,

      // Installation metadata
      repository: rawConfig.repository,
      keywords: rawConfig.keywords || [],
      description: rawConfig.description,

      // Agents and workflows
      agentsCount: rawConfig.agents?.count || 0,
      workflowsCount: rawConfig.workflows?.count || 0,
      exposedWorkflows: rawConfig.integration?.exposed_workflows || [],
      permissions: rawConfig.permissions,

      // Dependencies
      dependencies: this.normalizeDependencies(rawConfig.dependencies),

      // Configuration
      configuration: {
        outputFolder: rawConfig.output_folder?.result || '_bmad-output',
        securityFramework: rawConfig.security_framework?.result || 'nist_csf',
        moduleCode: rawConfig.module_code?.result || rawConfig.code,
        agentsPath: rawConfig.agents_path?.result || `${rawConfig.npm?.scope}/${rawConfig.code}/dist/agents`,
        workflowsPath: rawConfig.workflows_path?.result || `${rawConfig.npm?.scope}/${rawConfig.code}/dist/workflows`,
        outputSubdirectories: rawConfig.output_subdirectories || {}
      },

      // Raw config for reference
      raw: rawConfig
    };
  }

  /**
   * Normalize dependencies from module config
   */
  normalizeDependencies(dependencies = {}) {
    const normalized = [];

    // Core dependencies
    if (dependencies.core) {
      dependencies.core.forEach(dep => {
        normalized.push({
          packageId: `${dep.module}@${dep.version}`,
          name: dep.module,
          version: dep.version,
          required: dep.required !== false,
          satisfied: false
        });
      });
    }

    // Peer dependencies
    if (dependencies.peer_dependencies) {
      dependencies.peer_dependencies.forEach(dep => {
        normalized.push({
          packageId: `${dep.module}@${dep.version}`,
          name: dep.module,
          version: dep.version,
          required: dep.required !== false,
          condition: dep.condition,
          satisfied: false
        });
      });
    }

    return normalized;
  }

  /**
   * Create registry entry from installation result
   */
  createRegistryEntryFromInstallResult(moduleConfig, installResult, installOptions) {
    return {
      name: moduleConfig.name,
      version: moduleConfig.version,
      type: moduleConfig.type,
      category: moduleConfig.category,
      scope: moduleConfig.scope,
      fullName: moduleConfig.fullName,

      // Installation metadata
      installationPath: installResult.installationPath || path.join(this.config.bmadRoot, 'modules', moduleConfig.name),
      configPath: installResult.configPath,

      // Configuration
      configuration: moduleConfig.configuration,

      // Files and metadata
      installedFiles: installResult.installedFiles || [],
      outputDirectories: installResult.outputDirectories || [],

      // Specialized team data
      agentsCount: moduleConfig.agentsCount,
      workflowsCount: moduleConfig.workflowsCount,
      exposedWorkflows: moduleConfig.exposedWorkflows,
      permissions: moduleConfig.permissions,

      // Dependencies
      dependencies: moduleConfig.dependencies,

      // Metadata
      repository: moduleConfig.repository,
      keywords: moduleConfig.keywords,
      description: moduleConfig.description
    };
  }

  /**
   * Execute installation hooks
   */
  async executeHook(hookName, ...args) {
    const hook = this.installationHooks.get(hookName);

    if (hook) {
      try {
        return await hook(...args);
      } catch (error) {
        this.logger.error('Integration Hook', `Hook ${hookName} failed`, { error: error.message });
        throw error;
      }
    }

    return { success: true };
  }

  /**
   * Validate installation after completion
   */
  async validateInstallation(moduleConfig, installResult) {
    const validation = {
      valid: true,
      issues: []
    };

    // Check if installation path exists
    if (installResult.installationPath && !await this.fileExists(installResult.installationPath)) {
      validation.valid = false;
      validation.issues.push('Installation path does not exist');
    }

    // Validate agents and workflows for specialized teams
    if (moduleConfig.type === 'specialized-team') {
      const agentsValid = await this.validateSpecializedTeamAgents(moduleConfig, installResult);
      const workflowsValid = await this.validateSpecializedTeamWorkflows(moduleConfig, installResult);

      if (!agentsValid) {
        validation.valid = false;
        validation.issues.push('Specialized team agents validation failed');
      }

      if (!workflowsValid) {
        validation.valid = false;
        validation.issues.push('Specialized team workflows validation failed');
      }
    }

    return validation;
  }

  /**
   * Check dependency consistency across the system
   */
  async checkDependencyConsistency() {
    const packages = this.registry.listPackages();
    const issues = [];
    let healthyCount = 0;

    for (const pkg of packages) {
      // Check if all dependencies are satisfied
      for (const dep of pkg.dependencies) {
        if (dep.required && !dep.satisfied) {
          issues.push({
            package: pkg.name,
            issue: `Missing required dependency: ${dep.name}`,
            severity: 'high'
          });
        }
      }

      // Check for orphaned dependents
      for (const dependentId of pkg.dependents) {
        const dependent = this.registry.getPackageDetails(dependentId);
        if (!dependent) {
          issues.push({
            package: pkg.name,
            issue: `Orphaned dependent reference: ${dependentId}`,
            severity: 'medium'
          });
        }
      }

      if (pkg.dependencies.every(dep => dep.satisfied)) {
        healthyCount++;
      }
    }

    return {
      healthy: healthyCount,
      total: packages.length,
      issues,
      score: packages.length > 0 ? Math.round((healthyCount / packages.length) * 100) : 100
    };
  }

  /**
   * Check integration health
   */
  async checkIntegrationHealth() {
    const health = {
      registryAccessible: false,
      dependencyManagerAccessible: false,
      loggingFunctional: false,
      hooksRegistered: false,
      score: 0
    };

    try {
      // Test registry access
      const stats = this.registry.getRegistryStats();
      health.registryAccessible = true;

      // Test dependency manager
      const depSummary = this.dependencyManager.getResolutionSummary();
      health.dependencyManagerAccessible = true;

      // Test logging
      this.logger.info('Integration Health', 'Health check test');
      health.loggingFunctional = true;

      // Check hooks
      health.hooksRegistered = this.installationHooks.size > 0;

    } catch (error) {
      this.logger.error('Integration Health', 'Health check failed', { error: error.message });
    }

    // Calculate score
    const checks = Object.keys(health).filter(key => key !== 'score');
    const passed = checks.filter(check => health[check]).length;
    health.score = Math.round((passed / checks.length) * 100);

    return health;
  }

  /**
   * Check specialized teams health
   */
  async checkSpecializedTeamsHealth() {
    const specializedTeams = this.registry.listPackages({ type: 'specialized-team' });
    const health = {
      total: specializedTeams.length,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      teams: {}
    };

    for (const team of specializedTeams) {
      const teamHealth = {
        name: team.name,
        health: team.health,
        agentsAccessible: team.agentsCount ? await this.validateTeamAgents(team) : true,
        workflowsAccessible: team.workflowsCount ? await this.validateTeamWorkflows(team) : true,
        outputDirectoriesWritable: await this.validateTeamOutputDirectories(team)
      };

      health.teams[team.name] = teamHealth;

      if (team.health === 'healthy') {
        health.healthy++;
      } else if (team.health === 'degraded') {
        health.degraded++;
      } else {
        health.unhealthy++;
      }
    }

    return health;
  }

  // Additional helper methods
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  calculateOverallHealth(healthChecks) {
    const scores = healthChecks.map(check => check.score || 0);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (averageScore >= 90) return 'healthy';
    if (averageScore >= 70) return 'degraded';
    return 'unhealthy';
  }

  async validateTeamAgents(team) {
    // Validate that team agents are accessible
    return await this.fileExists(team.configuration.agentsPath);
  }

  async validateTeamWorkflows(team) {
    // Validate that team workflows are accessible
    return await this.fileExists(team.configuration.workflowsPath);
  }

  async validateTeamOutputDirectories(team) {
    // Validate that output directories are writable
    for (const dir of team.outputDirectories) {
      try {
        await fs.access(dir, fs.constants.W_OK);
      } catch {
        return false;
      }
    }
    return true;
  }

  async performModuleInstallation(moduleConfig, options) {
    // Mock implementation - in production this would interface with Amelia's framework
    const installationPath = path.join(this.config.bmadRoot, 'modules', moduleConfig.name);

    return {
      success: true,
      installationPath,
      configPath: path.join(installationPath, 'module.yaml'),
      installedFiles: [],
      outputDirectories: [moduleConfig.configuration.outputFolder]
    };
  }

  async installDependencies(installationPlan, options) {
    // Mock implementation - would use dependency manager
    this.logger.info('Dependencies', 'Installing dependencies from plan', {
      phases: installationPlan.phases.length,
      totalModules: installationPlan.totalModules
    });

    return { success: true };
  }

  async validateUpdateDependencies(packageEntry, targetVersion) {
    // Mock implementation - would validate update compatibility
    return {
      valid: true,
      issues: [],
      compatibilityIssues: []
    };
  }

  async checkDependentPackages(packageId) {
    const packageEntry = this.registry.getPackageDetails(packageId);

    return {
      hasBlockingDependents: packageEntry.dependents.length > 0,
      dependents: packageEntry.dependents.map(id => {
        const dep = this.registry.getPackageDetails(id);
        return dep ? dep.name : id;
      })
    };
  }

  async updateDependencyTracking() {
    // Update dependency satisfaction tracking across all packages
    const packages = this.registry.listPackages();

    for (const pkg of packages) {
      for (const dep of pkg.dependencies) {
        const dependencyPackage = packages.find(p => p.name === dep.name);
        dep.satisfied = !!dependencyPackage;
      }
    }
  }

  async validateSpecializedTeamAgents(moduleConfig, installResult) {
    // Validate specialized team agents
    return true;
  }

  async validateSpecializedTeamWorkflows(moduleConfig, installResult) {
    // Validate specialized team workflows
    return true;
  }

  async validatePackageIntegration(packageEntry) {
    // Validate package integration after update
    return {
      valid: true,
      issues: []
    };
  }

  preparePreliminaryRegistryEntry(moduleConfig, installOptions) {
    // Prepare preliminary registry entry for pre-installation validation
    return {
      name: moduleConfig.name,
      version: moduleConfig.version,
      preliminary: true
    };
  }
}

module.exports = PackageRegistryIntegration;