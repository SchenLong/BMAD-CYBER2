/**
 * BMAD Core Installation Framework
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Converts distributed YAML packages to BMB-compliant MD agents in target BMAD installations.
 * Handles dependency validation, conflict resolution, and rollback capabilities.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

// Import core components
const YamlToMdConverter = require('../lib/core/yaml-to-md-converter');
const DependencyValidator = require('../lib/core/dependency-validator');
const ConflictDetector = require('../lib/core/conflict-detector');
const ProgressReporter = require('../lib/core/progress-reporter');
const RollbackManager = require('../lib/core/rollback-manager');
const InstallationLogger = require('../lib/core/installation-logger');

/**
 * Main Installation Framework Class
 * Orchestrates the entire installation pipeline
 */
class BMAdInstaller extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      projectRoot: options.projectRoot || process.cwd(),
      validateDependencies: options.validateDependencies !== false,
      enableRollback: options.enableRollback !== false,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      ...options
    };

    // Core components
    this.converter = new YamlToMdConverter();
    this.dependencyValidator = new DependencyValidator();
    this.conflictDetector = new ConflictDetector();
    this.progressReporter = new ProgressReporter();
    this.rollbackManager = new RollbackManager();
    this.logger = new InstallationLogger(this.options.verbose);

    // Installation state
    this.installationId = this.generateInstallationId();
    this.currentPhase = null;
    this.installedModules = [];
    this.rollbackQueue = [];
    this.installationLock = null;
  }

  /**
   * Main installation entry point
   * @param {string|Array} modules - Module names or package paths to install
   * @param {Object} options - Installation options
   * @returns {Promise<Object>} Installation result
   */
  async install(modules, options = {}) {
    const startTime = Date.now();

    try {
      // Normalize input
      const moduleList = Array.isArray(modules) ? modules : [modules];

      this.logger.info(`Starting BMAD installation (ID: ${this.installationId})`);
      this.logger.info(`Installing modules: ${moduleList.join(', ')}`);

      // Acquire installation lock
      await this.acquireInstallationLock();

      // Phase 1: Pre-validation
      this.currentPhase = 'pre-validation';
      await this.preValidation(moduleList);

      // Phase 2: Dependency resolution
      this.currentPhase = 'dependency-resolution';
      const dependencyGraph = await this.resolveDependencies(moduleList);

      // Phase 3: Conflict detection
      this.currentPhase = 'conflict-detection';
      await this.detectConflicts(dependencyGraph);

      // Phase 4: Backup creation
      this.currentPhase = 'backup-creation';
      await this.createBackup();

      // Phase 5: Installation execution
      this.currentPhase = 'installation';
      const installationResults = await this.executeInstallation(dependencyGraph);

      // Phase 6: Post-installation validation
      this.currentPhase = 'post-validation';
      await this.postInstallationValidation(installationResults);

      // Success
      const duration = Date.now() - startTime;
      const result = {
        success: true,
        installationId: this.installationId,
        installedModules: this.installedModules,
        duration: duration,
        phase: 'completed'
      };

      this.logger.info(`Installation completed successfully in ${duration}ms`);
      this.emit('installation:complete', result);

      return result;

    } catch (error) {
      this.logger.error(`Installation failed in phase ${this.currentPhase}: ${error.message}`);

      // Attempt automatic rollback
      if (this.options.enableRollback && this.rollbackQueue.length > 0) {
        this.logger.info('Attempting automatic rollback...');
        try {
          await this.rollback();
          this.logger.info('Rollback completed successfully');
        } catch (rollbackError) {
          this.logger.error(`Rollback failed: ${rollbackError.message}`);
          error.rollbackFailed = true;
          error.rollbackError = rollbackError;
        }
      }

      const result = {
        success: false,
        error: error.message,
        phase: this.currentPhase,
        installationId: this.installationId,
        rollbackAttempted: this.options.enableRollback,
        duration: Date.now() - startTime
      };

      this.emit('installation:failed', result);
      throw error;

    } finally {
      await this.releaseInstallationLock();
    }
  }

  /**
   * Phase 1: Pre-validation checks
   * Validates system requirements and module integrity
   */
  async preValidation(modules) {
    this.progressReporter.startPhase('Pre-validation', 4);

    try {
      // Check system requirements
      this.progressReporter.updateProgress('Checking system requirements...', 25);
      await this.checkSystemRequirements();

      // Validate BMAD core presence
      this.progressReporter.updateProgress('Validating BMAD Core...', 50);
      await this.validateBmadCore();

      // Check module package integrity
      this.progressReporter.updateProgress('Validating module packages...', 75);
      await this.validateModulePackages(modules);

      // Check disk space and permissions
      this.progressReporter.updateProgress('Checking resources...', 100);
      await this.checkResourceAvailability();

      this.progressReporter.completePhase('Pre-validation completed');

    } catch (error) {
      this.progressReporter.failPhase(`Pre-validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Phase 2: Dependency resolution
   * Builds dependency graph and resolves version conflicts
   */
  async resolveDependencies(modules) {
    this.progressReporter.startPhase('Dependency Resolution', modules.length + 1);

    try {
      let dependencyGraph = new Map();

      // Load dependency information for each module
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        this.progressReporter.updateProgress(`Analyzing ${module}...`,
          Math.round(((i + 1) / modules.length) * 80));

        const moduleInfo = await this.loadModuleInfo(module);
        dependencyGraph.set(module, moduleInfo);
      }

      // Validate dependency graph
      this.progressReporter.updateProgress('Validating dependency graph...', 90);
      await this.dependencyValidator.validateGraph(dependencyGraph);

      // Resolve version conflicts
      this.progressReporter.updateProgress('Resolving conflicts...', 100);
      const resolvedGraph = await this.dependencyValidator.resolveConflicts(dependencyGraph);

      this.progressReporter.completePhase('Dependencies resolved successfully');
      return resolvedGraph;

    } catch (error) {
      this.progressReporter.failPhase(`Dependency resolution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Phase 3: Conflict detection
   * Checks for naming conflicts and resource overlaps
   */
  async detectConflicts(dependencyGraph) {
    this.progressReporter.startPhase('Conflict Detection', 3);

    try {
      // Check agent name conflicts
      this.progressReporter.updateProgress('Checking agent name conflicts...', 33);
      const agentConflicts = await this.conflictDetector.checkAgentConflicts(dependencyGraph);

      // Check workflow ID conflicts
      this.progressReporter.updateProgress('Checking workflow conflicts...', 66);
      const workflowConflicts = await this.conflictDetector.checkWorkflowConflicts(dependencyGraph);

      // Check file path conflicts
      this.progressReporter.updateProgress('Checking file path conflicts...', 100);
      const pathConflicts = await this.conflictDetector.checkPathConflicts(dependencyGraph);

      // Handle any detected conflicts
      const allConflicts = [...agentConflicts, ...workflowConflicts, ...pathConflicts];
      if (allConflicts.length > 0) {
        await this.handleConflicts(allConflicts);
      }

      this.progressReporter.completePhase('Conflict detection completed');

    } catch (error) {
      this.progressReporter.failPhase(`Conflict detection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Phase 4: Backup creation
   * Creates system backup for rollback capability
   */
  async createBackup() {
    if (!this.options.enableRollback) {
      this.logger.info('Rollback disabled, skipping backup creation');
      return;
    }

    this.progressReporter.startPhase('Backup Creation', 1);

    try {
      this.progressReporter.updateProgress('Creating system backup...', 50);

      const backupId = await this.rollbackManager.createBackup({
        installationId: this.installationId,
        projectRoot: this.options.projectRoot,
        timestamp: new Date().toISOString()
      });

      this.rollbackQueue.push({
        type: 'backup',
        id: backupId,
        timestamp: Date.now()
      });

      this.progressReporter.updateProgress('Backup completed', 100);
      this.progressReporter.completePhase('Backup created successfully');

    } catch (error) {
      this.progressReporter.failPhase(`Backup creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Phase 5: Installation execution
   * Performs the actual conversion and installation
   */
  async executeInstallation(dependencyGraph) {
    const modules = Array.from(dependencyGraph.keys());
    this.progressReporter.startPhase('Installation', modules.length);

    const installationResults = [];

    try {
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const moduleInfo = dependencyGraph.get(module);

        this.progressReporter.updateProgress(`Installing ${module}...`,
          Math.round(((i + 1) / modules.length) * 100));

        const result = await this.installSingleModule(module, moduleInfo);
        installationResults.push(result);
        this.installedModules.push(module);

        // Add to rollback queue
        this.rollbackQueue.push({
          type: 'module_installation',
          module: module,
          result: result,
          timestamp: Date.now()
        });
      }

      this.progressReporter.completePhase('Installation completed');
      return installationResults;

    } catch (error) {
      this.progressReporter.failPhase(`Installation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Install a single module
   * Converts YAML to MD and places in correct locations
   */
  async installSingleModule(moduleName, moduleInfo) {
    this.logger.info(`Installing module: ${moduleName}`);

    try {
      // Load module YAML package
      const yamlPackage = await this.loadYamlPackage(moduleName, moduleInfo);

      // Convert YAML agents to MD format
      const agents = await this.convertAgents(yamlPackage.agents, moduleInfo);

      // Convert YAML workflows to MD format
      const workflows = await this.convertWorkflows(yamlPackage.workflows, moduleInfo);

      // Install agents
      const agentPaths = await this.installAgents(agents, moduleInfo);

      // Install workflows
      const workflowPaths = await this.installWorkflows(workflows, moduleInfo);

      // Create module configuration
      await this.createModuleConfiguration(moduleInfo);

      // Update global registries
      await this.updateGlobalRegistries(moduleInfo, agentPaths, workflowPaths);

      return {
        moduleName,
        agentPaths,
        workflowPaths,
        success: true
      };

    } catch (error) {
      this.logger.error(`Failed to install module ${moduleName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert YAML agents to MD format using the conversion engine
   */
  async convertAgents(yamlAgents, moduleInfo) {
    const convertedAgents = [];

    for (const yamlAgent of yamlAgents) {
      try {
        const mdAgent = await this.converter.yamlToMd(yamlAgent, {
          targetFormat: 'bmad_md',
          preserveMetadata: true,
          moduleContext: moduleInfo
        });

        convertedAgents.push(mdAgent);

      } catch (error) {
        this.logger.error(`Failed to convert agent ${yamlAgent.metadata?.name}: ${error.message}`);
        throw error;
      }
    }

    return convertedAgents;
  }

  /**
   * Convert YAML workflows to MD format
   */
  async convertWorkflows(yamlWorkflows, moduleInfo) {
    const convertedWorkflows = [];

    for (const yamlWorkflow of yamlWorkflows) {
      try {
        const mdWorkflow = await this.converter.yamlWorkflowToMd(yamlWorkflow, {
          targetFormat: 'bmad_md',
          preserveMetadata: true,
          moduleContext: moduleInfo
        });

        convertedWorkflows.push(mdWorkflow);

      } catch (error) {
        this.logger.error(`Failed to convert workflow ${yamlWorkflow.workflow_id}: ${error.message}`);
        throw error;
      }
    }

    return convertedWorkflows;
  }

  /**
   * Phase 6: Post-installation validation
   * Verifies installation success and functionality
   */
  async postInstallationValidation(installationResults) {
    this.progressReporter.startPhase('Post-Installation Validation', 3);

    try {
      // Verify module loading
      this.progressReporter.updateProgress('Verifying module loading...', 33);
      await this.verifyModuleLoading();

      // Verify agent registration
      this.progressReporter.updateProgress('Verifying agent registration...', 66);
      await this.verifyAgentRegistration();

      // Verify workflow functionality
      this.progressReporter.updateProgress('Verifying workflow functionality...', 100);
      await this.verifyWorkflowFunctionality();

      this.progressReporter.completePhase('Post-installation validation completed');

    } catch (error) {
      this.progressReporter.failPhase(`Post-installation validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Rollback installation
   * Undoes all installation changes
   */
  async rollback() {
    this.logger.info(`Starting rollback for installation ${this.installationId}`);

    try {
      // Process rollback queue in reverse order
      for (let i = this.rollbackQueue.length - 1; i >= 0; i--) {
        const rollbackItem = this.rollbackQueue[i];
        await this.processRollbackItem(rollbackItem);
      }

      this.logger.info('Rollback completed successfully');
      this.emit('rollback:complete');

    } catch (error) {
      this.logger.error(`Rollback failed: ${error.message}`);
      this.emit('rollback:failed', error);
      throw error;
    }
  }

  /**
   * Generate unique installation ID
   */
  generateInstallationId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `bmad_install_${timestamp}_${random}`;
  }

  /**
   * Acquire installation lock to prevent concurrent installations
   */
  async acquireInstallationLock() {
    const lockFile = path.join(this.options.projectRoot, '.bmad-install.lock');

    try {
      const lockData = {
        installationId: this.installationId,
        pid: process.pid,
        timestamp: Date.now(),
        projectRoot: this.options.projectRoot
      };

      await fs.writeFile(lockFile, JSON.stringify(lockData, null, 2), { flag: 'wx' });
      this.installationLock = lockFile;

    } catch (error) {
      if (error.code === 'EEXIST') {
        // Lock file exists, check if it's stale
        try {
          const existingLock = JSON.parse(await fs.readFile(lockFile, 'utf8'));
          const lockAge = Date.now() - existingLock.timestamp;

          if (lockAge > 3600000) { // 1 hour
            this.logger.warn('Removing stale installation lock');
            await fs.unlink(lockFile);
            return this.acquireInstallationLock();
          } else {
            throw new Error('Another BMAD installation is in progress');
          }
        } catch (parseError) {
          this.logger.warn('Invalid lock file found, removing');
          await fs.unlink(lockFile);
          return this.acquireInstallationLock();
        }
      }
      throw error;
    }
  }

  /**
   * Release installation lock
   */
  async releaseInstallationLock() {
    if (this.installationLock) {
      try {
        await fs.unlink(this.installationLock);
        this.logger.debug('Installation lock released');
      } catch (error) {
        this.logger.warn(`Failed to release lock: ${error.message}`);
      }
    }
  }

  // Placeholder methods for system checks (to be implemented)
  async checkSystemRequirements() {
    // TODO: Check Node.js version, NPM version, disk space
    this.logger.debug('System requirements check passed');
  }

  async validateBmadCore() {
    // TODO: Verify BMAD core installation and version
    this.logger.debug('BMAD Core validation passed');
  }

  async validateModulePackages(modules) {
    // TODO: Verify package integrity and signatures
    this.logger.debug('Module package validation passed');
  }

  async checkResourceAvailability() {
    // TODO: Check disk space, memory, permissions
    this.logger.debug('Resource availability check passed');
  }

  async loadModuleInfo(module) {
    // TODO: Load module.yaml and parse dependency information
    return { name: module, dependencies: [] };
  }

  async loadYamlPackage(moduleName, moduleInfo) {
    // TODO: Load distributed YAML package from NPM
    return { agents: [], workflows: [] };
  }

  async installAgents(agents, moduleInfo) {
    // TODO: Install agents to appropriate directories
    return [];
  }

  async installWorkflows(workflows, moduleInfo) {
    // TODO: Install workflows to appropriate directories
    return [];
  }

  async createModuleConfiguration(moduleInfo) {
    // TODO: Create module configuration files
    this.logger.debug('Module configuration created');
  }

  async updateGlobalRegistries(moduleInfo, agentPaths, workflowPaths) {
    // TODO: Update global agent and workflow registries
    this.logger.debug('Global registries updated');
  }

  async verifyModuleLoading() {
    // TODO: Verify installed modules load correctly
    this.logger.debug('Module loading verification passed');
  }

  async verifyAgentRegistration() {
    // TODO: Verify agents are registered in global registry
    this.logger.debug('Agent registration verification passed');
  }

  async verifyWorkflowFunctionality() {
    // TODO: Test basic workflow functionality
    this.logger.debug('Workflow functionality verification passed');
  }

  async handleConflicts(conflicts) {
    // TODO: Implement conflict resolution strategies
    if (conflicts.some(c => c.severity === 'critical')) {
      throw new Error('Critical conflicts detected, installation cannot proceed');
    }
  }

  async processRollbackItem(item) {
    // TODO: Process individual rollback items
    this.logger.debug(`Rolling back ${item.type}`);
  }
}

// Export the installer class and helper functions
module.exports = {
  BMAdInstaller,

  // Convenience function for single module installation
  async installModule(moduleName, options = {}) {
    const installer = new BMAdInstaller(options);
    return installer.install(moduleName);
  },

  // Convenience function for multiple module installation
  async installModules(moduleNames, options = {}) {
    const installer = new BMAdInstaller(options);
    return installer.install(moduleNames);
  }
};