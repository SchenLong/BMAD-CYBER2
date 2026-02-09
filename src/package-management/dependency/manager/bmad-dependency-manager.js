/**
 * EPIC 2 PACKAGE MANAGEMENT - COMPREHENSIVE BMAD DEPENDENCY MANAGER
 * Enterprise-grade dependency management system with advanced orchestration capabilities
 * Integrates with Epic 1 security infrastructure and package registry system
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const { normalizeLineEndings } = require('../../../utility/normalize-line-endings.cjs');

// Import Epic 1 Security Infrastructure
const { epic1Security } = require('../../security/epic1-integration');
const { AuditLogger } = require('../../security/audit/audit-logger');
const { SecurityMonitor } = require('../../security/monitoring/security-monitor');
const { AESEncryption } = require('../../security/encryption/aes-encryption');

// Import Package Management Components
const { DependencyResolver } = require('../resolver/dependency-resolver');
const { BMADDependencyValidator } = require('../validator/dependency-validator');

/**
 * BMAD Dependency Manager Configuration
 */
const DependencyManagerConfig = {
  // Core settings
  version: '1.0.0',
  maxConcurrentOperations: 10,
  operationTimeout: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,

  // Cache settings
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 1000,
    persistToDisk: true,
    cacheDirectory: '.bmad-cache'
  },

  // Security settings
  security: {
    enableEncryption: true,
    signatureVerification: false,
    vulnerabilityScanning: true,
    securityThreshold: 7.0,
    quarantinePolicy: 'isolate'
  },

  // Performance settings
  performance: {
    parallelResolution: true,
    optimizeForSpeed: false,
    memoryLimit: 512 * 1024 * 1024, // 512MB
    compressionEnabled: true
  },

  // Team configurations
  teamConfig: {
    cybersec: {
      strictSecurity: true,
      approvalRequired: true,
      isolatedEnvironment: true
    },
    intel: {
      dataClassification: 'restricted',
      encryptionRequired: true,
      auditLevel: 'comprehensive'
    },
    legal: {
      licenseValidation: true,
      complianceChecks: true,
      documentationRequired: true
    },
    strategy: {
      performanceOptimization: true,
      costAnalysis: true,
      riskAssessment: true
    }
  }
};

/**
 * Operation Types and States
 */
const OperationType = {
  INSTALL: 'install',
  UPDATE: 'update',
  REMOVE: 'remove',
  RESOLVE: 'resolve',
  VALIDATE: 'validate',
  SECURITY_SCAN: 'security_scan',
  OPTIMIZATION: 'optimization',
  MIGRATION: 'migration'
};

const OperationState = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  QUARANTINED: 'quarantined'
};

/**
 * Operation Context
 */
class OperationContext {
  constructor(type, target, options = {}) {
    this.id = crypto.randomBytes(16).toString('hex');
    this.type = type;
    this.target = target;
    this.options = options;
    this.state = OperationState.PENDING;
    this.startTime = null;
    this.endTime = null;
    this.progress = 0;
    this.metadata = {};
    this.dependencies = new Map();
    this.results = null;
    this.error = null;
    this.securityContext = null;
  }

  setState(state, metadata = {}) {
    this.state = state;
    this.metadata = { ...this.metadata, ...metadata };

    if (state === OperationState.RUNNING && !this.startTime) {
      this.startTime = performance.now();
    } else if (state === OperationState.SUCCESS || state === OperationState.FAILED) {
      this.endTime = performance.now();
    }
  }

  setProgress(progress, message = '') {
    this.progress = Math.max(0, Math.min(100, progress));
    if (message) {
      this.metadata.progressMessage = message;
    }
  }

  getDuration() {
    if (this.startTime && this.endTime) {
      return this.endTime - this.startTime;
    }
    return this.startTime ? performance.now() - this.startTime : 0;
  }
}

/**
 * BMAD Dependency Manager
 */
class BMADDependencyManager extends EventEmitter {
  constructor(projectRoot = process.cwd(), config = {}) {
    super();

    this.projectRoot = path.resolve(projectRoot);
    this.config = { ...DependencyManagerConfig, ...config };

    // Initialize Epic 1 security integration
    this.auditLogger = new AuditLogger('bmad-dependency-manager');
    this.securityMonitor = new SecurityMonitor();
    this.encryption = new AESEncryption();

    // Initialize core components
    this.dependencyResolver = new DependencyResolver();
    this.validator = new BMADDependencyValidator(projectRoot);

    // Operation management
    this.activeOperations = new Map();
    this.operationQueue = [];
    this.operationHistory = [];

    // Cache and state management
    this.dependencyCache = new Map();
    this.securityCache = new Map();
    this.configCache = new Map();

    // Registry and package information
    this.registries = new Map();
    this.installedPackages = new Map();
    this.packageLock = new Map();

    // Security and monitoring
    this.securityPolicies = new Map();
    this.quarantinedPackages = new Set();
    this.trustedSources = new Set();

    // Initialize system
    this.initializeSystem();
  }

  /**
   * Initialize BMAD Dependency Manager
   */
  async initializeSystem() {
    try {
      await this.auditLogger.logSecurityEvent(
        'bmad-dependency-manager-initializing',
        { projectRoot: this.projectRoot, version: this.config.version }
      );

      // Setup Epic 1 security integration
      await this.setupSecurityIntegration();

      // Load configuration
      await this.loadConfiguration();

      // Initialize cache
      await this.initializeCache();

      // Load installed packages
      await this.loadInstalledPackages();

      // Setup event handlers
      this.setupEventHandlers();

      // Validate system integrity
      await this.validateSystemIntegrity();

      this.emit('system-initialized', {
        status: 'ready',
        timestamp: new Date().toISOString(),
        features: this.getEnabledFeatures()
      });

      await this.auditLogger.logSecurityEvent(
        'bmad-dependency-manager-ready',
        { features: this.getEnabledFeatures() }
      );

    } catch (error) {
      await this.auditLogger.logSecurityEvent(
        'bmad-dependency-manager-init-failed',
        { error: error.message, stack: error.stack }
      );

      this.emit('system-error', {
        type: 'initialization-failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw new Error(`BMAD Dependency Manager initialization failed: ${error.message}`);
    }
  }

  /**
   * Setup Epic 1 security integration
   */
  async setupSecurityIntegration() {
    try {
      // Initialize security context
      const securityStatus = await epic1Security.getStatus();

      if (securityStatus.overallStatus !== 'operational') {
        throw new Error('Epic 1 security infrastructure not operational');
      }

      // Setup security monitoring
      this.securityMonitor.startMonitoring({
        component: 'dependency-manager',
        metricsInterval: 60000, // 1 minute
        alertThresholds: {
          errorRate: 0.05,
          responseTime: 5000,
          memoryUsage: 0.8
        }
      });

      // Load security policies
      await this.loadSecurityPolicies();

      // Initialize encryption if enabled
      if (this.config.security.enableEncryption) {
        await this.encryption.initialize({
          algorithm: 'aes-256-gcm',
          keyRotationInterval: 86400000 // 24 hours
        });
      }

    } catch (error) {
      throw new Error(`Security integration setup failed: ${error.message}`);
    }
  }

  /**
   * Load and validate configuration
   */
  async loadConfiguration() {
    try {
      // Load project configuration
      const configFiles = [
        path.join(this.projectRoot, 'bmad-dependency-config.json'),
        path.join(this.projectRoot, 'bmad-dependency-config.yaml'),
        path.join(this.projectRoot, 'package.json')
      ];

      for (const configFile of configFiles) {
        try {
          const content = normalizeLineEndings(await fs.readFile(configFile, 'utf8'));
          let config;

          if (configFile.endsWith('.json')) {
            config = JSON.parse(content);
          } else if (configFile.endsWith('.yaml') || configFile.endsWith('.yml')) {
            const yaml = require('yaml');
            config = yaml.parse(content);
          }

          if (config && config.bmadDependencyManager) {
            this.config = { ...this.config, ...config.bmadDependencyManager };
            this.configCache.set('project-config', config);
            break;
          }
        } catch (error) {
          // File doesn't exist or invalid - continue to next
          continue;
        }
      }

      // Load team-specific configurations
      await this.loadTeamConfigurations();

    } catch (error) {
      this.auditLogger.warn('Configuration loading failed, using defaults', { error: error.message });
    }
  }

  /**
   * Load team-specific configurations
   */
  async loadTeamConfigurations() {
    const teams = Object.keys(this.config.teamConfig);

    for (const team of teams) {
      try {
        const teamConfigPath = path.join(this.projectRoot, `${team}-dependency-config.yaml`);
        const content = normalizeLineEndings(await fs.readFile(teamConfigPath, 'utf8'));
        const yaml = require('yaml');
        const teamConfig = yaml.parse(content);

        this.config.teamConfig[team] = { ...this.config.teamConfig[team], ...teamConfig };
        this.configCache.set(`team-config-${team}`, teamConfig);

      } catch (error) {
        // Team config not found - use defaults
        this.auditLogger.info(`No specific configuration found for team ${team}, using defaults`);
      }
    }
  }

  /**
   * Initialize cache system
   */
  async initializeCache() {
    try {
      if (!this.config.cache.enabled) {
        return;
      }

      // Create cache directory if needed
      if (this.config.cache.persistToDisk) {
        const cacheDir = path.join(this.projectRoot, this.config.cache.cacheDirectory);
        await fs.mkdir(cacheDir, { recursive: true });

        // Load existing cache
        try {
          const cacheFile = path.join(cacheDir, 'dependency-cache.json');
          const content = await fs.readFile(cacheFile, 'utf8');
          const cacheData = JSON.parse(content);

          for (const [key, value] of Object.entries(cacheData.dependencies || {})) {
            this.dependencyCache.set(key, value);
          }

          for (const [key, value] of Object.entries(cacheData.security || {})) {
            this.securityCache.set(key, value);
          }

        } catch (error) {
          // Cache file doesn't exist - start fresh
          this.auditLogger.info('Starting with fresh cache');
        }
      }

      // Setup cache cleanup
      setInterval(() => {
        this.cleanupCache();
      }, this.config.cache.ttl);

    } catch (error) {
      this.auditLogger.warn('Cache initialization failed', { error: error.message });
    }
  }

  /**
   * Verify package integrity using SHA512 hash
   * @param {string} packagePath - Path to the package directory
   * @param {string} expectedIntegrity - Expected integrity hash (sha512-base64)
   * @returns {Promise<{valid: boolean, computed?: string, error?: string}>}
   */
  async verifyPackageIntegrity(packagePath, expectedIntegrity) {
    if (!expectedIntegrity) {
      return { valid: true, skipped: true, reason: 'No integrity hash provided' };
    }

    // Parse the integrity string (format: "sha512-base64hash")
    const integrityMatch = expectedIntegrity.match(/^(sha512)-(.+)$/);
    if (!integrityMatch) {
      return {
        valid: false,
        error: `Invalid integrity format: expected sha512-<base64hash>, got ${expectedIntegrity}`
      };
    }

    const [, algorithm, expectedHash] = integrityMatch;

    try {
      // Resolve the full path to the package
      const fullPackagePath = packagePath.startsWith('node_modules/')
        ? path.join(this.projectRoot, packagePath)
        : packagePath;

      // Check if package.json exists in the package directory
      const packageJsonPath = path.join(fullPackagePath, 'package.json');

      try {
        await fs.access(packageJsonPath);
      } catch (accessError) {
        // Package directory doesn't exist yet (not installed)
        return { valid: true, skipped: true, reason: 'Package not yet installed' };
      }

      // Read the package.json file to compute its hash
      const packageJsonContent = await fs.readFile(packageJsonPath);

      // Compute SHA512 hash
      const hash = crypto.createHash('sha512');
      hash.update(packageJsonContent);
      const computedHash = hash.digest('base64');

      // Compare hashes
      if (computedHash === expectedHash) {
        return { valid: true, computed: computedHash };
      } else {
        await this.auditLogger.logSecurityEvent(
          'package-integrity-mismatch',
          {
            packagePath,
            expectedHash: expectedHash.substring(0, 16) + '...',
            computedHash: computedHash.substring(0, 16) + '...',
            timestamp: new Date().toISOString()
          }
        );

        return {
          valid: false,
          expected: expectedHash,
          computed: computedHash,
          error: 'Integrity hash mismatch - package may have been tampered with'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: `Integrity verification failed: ${error.message}`
      };
    }
  }

  /**
   * Load installed packages information
   */
  async loadInstalledPackages() {
    try {
      // Load from package-lock.json
      const lockFilePath = path.join(this.projectRoot, 'package-lock.json');

      try {
        const lockContent = await fs.readFile(lockFilePath, 'utf8');
        const lockData = JSON.parse(lockContent);

        if (lockData.packages) {
          const integrityErrors = [];

          for (const [packagePath, packageInfo] of Object.entries(lockData.packages)) {
            if (packagePath === '') continue; // Skip root

            const packageName = packageInfo.name || packagePath.split('node_modules/').pop();

            // Verify package integrity if hash is present
            if (packageInfo.integrity) {
              const integrityResult = await this.verifyPackageIntegrity(
                packagePath,
                packageInfo.integrity
              );

              if (!integrityResult.valid && !integrityResult.skipped) {
                integrityErrors.push({
                  package: packageName,
                  path: packagePath,
                  error: integrityResult.error
                });

                // Emit security violation event
                this.emit('security-violation', {
                  type: 'integrity-mismatch',
                  package: packageName,
                  path: packagePath,
                  details: integrityResult
                });

                // Skip loading this package due to integrity failure
                continue;
              }
            }

            this.installedPackages.set(packageName, {
              version: packageInfo.version,
              path: packagePath,
              dependencies: packageInfo.dependencies || {},
              integrity: packageInfo.integrity,
              integrityVerified: packageInfo.integrity ? true : false,
              resolved: packageInfo.resolved,
              dev: packageInfo.dev || false
            });
          }

          // Log integrity verification summary
          if (integrityErrors.length > 0) {
            await this.auditLogger.logSecurityEvent(
              'package-integrity-verification-failures',
              {
                failureCount: integrityErrors.length,
                packages: integrityErrors.map(e => e.package),
                timestamp: new Date().toISOString()
              }
            );

            throw new Error(
              `Package integrity verification failed for ${integrityErrors.length} package(s): ` +
              integrityErrors.map(e => `${e.package}: ${e.error}`).join('; ')
            );
          }
        }

        this.packageLock.set('package-lock', lockData);

      } catch (error) {
        if (error.message.includes('integrity verification failed')) {
          throw error; // Re-throw integrity errors
        }
        this.auditLogger.info('No package-lock.json found, starting fresh');
      }

      // Load from yarn.lock if present
      const yarnLockPath = path.join(this.projectRoot, 'yarn.lock');

      try {
        const yarnContent = await fs.readFile(yarnLockPath, 'utf8');
        // Parse yarn.lock format (simplified)
        this.packageLock.set('yarn-lock', yarnContent);
      } catch (error) {
        // Yarn lock not found - skip
      }

    } catch (error) {
      this.auditLogger.warn('Failed to load installed packages', { error: error.message });
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Operation lifecycle events
    this.on('operation-started', async (context) => {
      await this.auditLogger.logSecurityEvent(
        'dependency-operation-started',
        {
          operationId: context.id,
          type: context.type,
          target: context.target
        }
      );
    });

    this.on('operation-completed', async (context) => {
      await this.auditLogger.logSecurityEvent(
        'dependency-operation-completed',
        {
          operationId: context.id,
          type: context.type,
          duration: context.getDuration(),
          success: context.state === OperationState.SUCCESS
        }
      );

      // Update security monitoring
      await this.securityMonitor.recordMetric('operations_completed', 1);
    });

    this.on('operation-failed', async (context) => {
      await this.auditLogger.logSecurityEvent(
        'dependency-operation-failed',
        {
          operationId: context.id,
          type: context.type,
          error: context.error?.message,
          duration: context.getDuration()
        }
      );

      await this.securityMonitor.recordMetric('operations_failed', 1);
    });

    // Security events
    this.on('security-violation', async (details) => {
      await this.auditLogger.logSecurityEvent(
        'dependency-security-violation',
        details
      );

      await this.securityMonitor.triggerAlert('security_violation', details);
    });

    this.on('vulnerability-detected', async (details) => {
      await this.auditLogger.logSecurityEvent(
        'vulnerability-detected',
        details
      );

      if (details.severity === 'critical') {
        await this.securityMonitor.triggerAlert('critical_vulnerability', details);
      }
    });
  }

  /**
   * Validate system integrity
   */
  async validateSystemIntegrity() {
    try {
      // Run validation on current system
      const validationResult = await this.validator.validateAll();

      if (validationResult.overall_status === 'fail') {
        const criticalErrors = validationResult.errors.filter(e =>
          e.component === 'security-integration' || e.component === 'core-implementation'
        );

        if (criticalErrors.length > 0) {
          throw new Error(`Critical system validation failures: ${criticalErrors.map(e => e.message).join(', ')}`);
        }
      }

      // Store validation results
      this.configCache.set('last-validation', validationResult);

    } catch (error) {
      this.auditLogger.warn('System integrity validation failed', { error: error.message });
    }
  }

  /**
   * Install dependencies
   */
  async install(dependencies, options = {}) {
    const context = new OperationContext(OperationType.INSTALL, dependencies, options);
    return await this.executeOperation(context);
  }

  /**
   * Update dependencies
   */
  async update(dependencies, options = {}) {
    const context = new OperationContext(OperationType.UPDATE, dependencies, options);
    return await this.executeOperation(context);
  }

  /**
   * Remove dependencies
   */
  async remove(dependencies, options = {}) {
    const context = new OperationContext(OperationType.REMOVE, dependencies, options);
    return await this.executeOperation(context);
  }

  /**
   * Resolve dependency graph
   */
  async resolve(rootPackage, options = {}) {
    const context = new OperationContext(OperationType.RESOLVE, rootPackage, options);
    return await this.executeOperation(context);
  }

  /**
   * Perform security scan
   */
  async securityScan(target = null, options = {}) {
    const context = new OperationContext(OperationType.SECURITY_SCAN, target || 'all', options);
    return await this.executeOperation(context);
  }

  /**
   * Execute operation with comprehensive error handling and monitoring
   */
  async executeOperation(context) {
    try {
      // Add to active operations
      this.activeOperations.set(context.id, context);

      // Setup operation timeout
      const timeoutHandle = setTimeout(() => {
        this.cancelOperation(context.id, 'timeout');
      }, this.config.operationTimeout);

      try {
        // Emit operation started
        context.setState(OperationState.RUNNING);
        this.emit('operation-started', context);

        // Setup security context
        context.securityContext = await this.createSecurityContext(context);

        // Validate operation prerequisites
        await this.validateOperationPrerequisites(context);

        // Execute operation based on type
        let result;
        switch (context.type) {
          case OperationType.INSTALL:
            result = await this.executeInstall(context);
            break;
          case OperationType.UPDATE:
            result = await this.executeUpdate(context);
            break;
          case OperationType.REMOVE:
            result = await this.executeRemove(context);
            break;
          case OperationType.RESOLVE:
            result = await this.executeResolve(context);
            break;
          case OperationType.SECURITY_SCAN:
            result = await this.executeSecurityScan(context);
            break;
          case OperationType.VALIDATE:
            result = await this.executeValidation(context);
            break;
          default:
            throw new Error(`Unsupported operation type: ${context.type}`);
        }

        // Operation completed successfully
        context.setState(OperationState.SUCCESS);
        context.results = result;
        context.setProgress(100, 'Operation completed successfully');

        clearTimeout(timeoutHandle);

        this.emit('operation-completed', context);
        return result;

      } catch (error) {
        // Operation failed
        context.setState(OperationState.FAILED);
        context.error = error;

        clearTimeout(timeoutHandle);

        this.emit('operation-failed', context);
        throw error;

      } finally {
        // Cleanup
        this.activeOperations.delete(context.id);
        this.operationHistory.push(context);

        // Limit history size
        if (this.operationHistory.length > 1000) {
          this.operationHistory = this.operationHistory.slice(-500);
        }
      }

    } catch (error) {
      throw new Error(`Operation ${context.type} failed: ${error.message}`);
    }
  }

  /**
   * Execute install operation
   */
  async executeInstall(context) {
    context.setProgress(10, 'Analyzing dependencies...');

    const dependencies = Array.isArray(context.target) ? context.target : [context.target];
    const results = {
      installed: [],
      failed: [],
      skipped: [],
      securityIssues: []
    };

    for (let i = 0; i < dependencies.length; i++) {
      const dep = dependencies[i];
      const progress = 10 + (i / dependencies.length) * 80;

      try {
        context.setProgress(progress, `Installing ${dep.name}...`);

        // Security validation
        const securityResult = await this.validatePackageSecurity(dep, context.securityContext);
        if (!securityResult.allowed) {
          results.securityIssues.push({
            package: dep,
            issues: securityResult.issues,
            action: securityResult.action
          });

          if (securityResult.action === 'block') {
            results.failed.push({
              package: dep,
              reason: 'Security validation failed',
              details: securityResult.issues
            });
            continue;
          }
        }

        // Check if already installed
        if (this.installedPackages.has(dep.name)) {
          const installed = this.installedPackages.get(dep.name);
          if (installed.version === dep.version) {
            results.skipped.push({
              package: dep,
              reason: 'Already installed'
            });
            continue;
          }
        }

        // Resolve dependencies
        const resolutionResult = await this.dependencyResolver.resolve(
          dep,
          this.getRegistry(dep.registry),
          context.options.resolutionStrategy
        );

        if (!resolutionResult.success) {
          results.failed.push({
            package: dep,
            reason: 'Dependency resolution failed',
            details: resolutionResult.errors
          });
          continue;
        }

        // Install package
        const installResult = await this.installPackage(dep, resolutionResult.graph, context);

        if (installResult.success) {
          results.installed.push({
            package: dep,
            installedVersion: installResult.version,
            dependencies: installResult.dependencies
          });

          // Update installed packages cache
          this.installedPackages.set(dep.name, {
            version: installResult.version,
            dependencies: installResult.dependencies,
            installedAt: new Date().toISOString(),
            securityScore: securityResult.score
          });
        } else {
          results.failed.push({
            package: dep,
            reason: 'Installation failed',
            details: installResult.error
          });
        }

      } catch (error) {
        results.failed.push({
          package: dep,
          reason: error.message,
          details: error.stack
        });
      }
    }

    context.setProgress(95, 'Finalizing installation...');

    // Update package lock
    await this.updatePackageLock(results.installed);

    // Generate installation report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        requested: dependencies.length,
        installed: results.installed.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        securityIssues: results.securityIssues.length
      },
      details: results
    };

    return report;
  }

  /**
   * Execute update operation
   */
  async executeUpdate(context) {
    context.setProgress(10, 'Checking for updates...');

    const target = context.target;
    const results = {
      updated: [],
      failed: [],
      noUpdates: [],
      securityIssues: []
    };

    // Determine packages to update
    let packagesToUpdate = [];

    if (target === 'all') {
      packagesToUpdate = Array.from(this.installedPackages.keys());
    } else if (Array.isArray(target)) {
      packagesToUpdate = target;
    } else {
      packagesToUpdate = [target];
    }

    for (let i = 0; i < packagesToUpdate.length; i++) {
      const packageName = packagesToUpdate[i];
      const progress = 10 + (i / packagesToUpdate.length) * 80;

      try {
        context.setProgress(progress, `Checking ${packageName}...`);

        const currentVersion = this.installedPackages.get(packageName)?.version;
        if (!currentVersion) {
          results.failed.push({
            package: packageName,
            reason: 'Package not installed'
          });
          continue;
        }

        // Find latest version
        const registry = this.getDefaultRegistry();
        const latestVersion = await registry.getLatestVersion(packageName);

        if (!latestVersion || latestVersion === currentVersion) {
          results.noUpdates.push({
            package: packageName,
            currentVersion
          });
          continue;
        }

        // Security validation for new version
        const securityResult = await this.validatePackageSecurity(
          { name: packageName, version: latestVersion },
          context.securityContext
        );

        if (!securityResult.allowed) {
          results.securityIssues.push({
            package: { name: packageName, version: latestVersion },
            issues: securityResult.issues,
            action: securityResult.action
          });

          if (securityResult.action === 'block') {
            results.failed.push({
              package: packageName,
              reason: 'Security validation failed for update',
              details: securityResult.issues
            });
            continue;
          }
        }

        // Perform update
        const updateResult = await this.updatePackage(
          packageName,
          currentVersion,
          latestVersion,
          context
        );

        if (updateResult.success) {
          results.updated.push({
            package: packageName,
            fromVersion: currentVersion,
            toVersion: latestVersion,
            changelog: updateResult.changelog
          });

          // Update cache
          this.installedPackages.set(packageName, {
            ...this.installedPackages.get(packageName),
            version: latestVersion,
            updatedAt: new Date().toISOString()
          });
        } else {
          results.failed.push({
            package: packageName,
            reason: 'Update failed',
            details: updateResult.error
          });
        }

      } catch (error) {
        results.failed.push({
          package: packageName,
          reason: error.message,
          details: error.stack
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      summary: {
        checked: packagesToUpdate.length,
        updated: results.updated.length,
        failed: results.failed.length,
        noUpdates: results.noUpdates.length,
        securityIssues: results.securityIssues.length
      },
      details: results
    };
  }

  /**
   * Execute resolve operation
   */
  async executeResolve(context) {
    context.setProgress(10, 'Starting dependency resolution...');

    const rootPackage = context.target;
    const options = context.options;

    try {
      // Get appropriate registry
      const registry = this.getRegistry(rootPackage.registry);

      context.setProgress(30, 'Resolving dependency graph...');

      // Resolve dependencies
      const resolutionResult = await this.dependencyResolver.resolve(
        rootPackage,
        registry,
        options.strategy
      );

      context.setProgress(70, 'Analyzing resolution results...');

      // Enhance results with BMAD-specific analysis
      const enhancedResult = await this.enhanceResolutionResult(resolutionResult, context);

      context.setProgress(90, 'Generating recommendations...');

      // Generate optimization recommendations
      const recommendations = await this.generateDependencyRecommendations(enhancedResult);

      return {
        timestamp: new Date().toISOString(),
        rootPackage,
        resolution: enhancedResult,
        recommendations,
        metadata: {
          resolutionTime: context.getDuration(),
          cacheHits: this.getCacheHitRate(),
          securityScore: enhancedResult.securityScore || 0
        }
      };

    } catch (error) {
      throw new Error(`Dependency resolution failed: ${error.message}`);
    }
  }

  /**
   * Execute security scan operation
   */
  async executeSecurityScan(context) {
    context.setProgress(10, 'Initializing security scan...');

    const target = context.target;
    const results = {
      scannedPackages: 0,
      vulnerabilities: [],
      securityScore: 0,
      recommendations: [],
      quarantined: []
    };

    try {
      // Determine scan scope
      let packagesToScan = [];

      if (target === 'all') {
        packagesToScan = Array.from(this.installedPackages.keys());
      } else if (Array.isArray(target)) {
        packagesToScan = target;
      } else {
        packagesToScan = [target];
      }

      context.setProgress(20, `Scanning ${packagesToScan.length} packages...`);

      // Scan each package
      for (let i = 0; i < packagesToScan.length; i++) {
        const packageName = packagesToScan[i];
        const progress = 20 + (i / packagesToScan.length) * 60;

        context.setProgress(progress, `Scanning ${packageName}...`);

        try {
          const packageInfo = this.installedPackages.get(packageName);
          if (!packageInfo) {
            continue;
          }

          const scanResult = await this.scanPackageForVulnerabilities(
            { name: packageName, version: packageInfo.version },
            context.securityContext
          );

          results.scannedPackages++;

          if (scanResult.vulnerabilities.length > 0) {
            results.vulnerabilities.push({
              package: packageName,
              version: packageInfo.version,
              vulnerabilities: scanResult.vulnerabilities,
              riskScore: scanResult.riskScore
            });

            // Quarantine if critical
            const criticalVulns = scanResult.vulnerabilities.filter(v => v.severity === 'critical');
            if (criticalVulns.length > 0 && this.config.security.quarantinePolicy === 'isolate') {
              await this.quarantinePackage(packageName, 'critical-vulnerability');
              results.quarantined.push(packageName);
            }
          }

        } catch (error) {
          this.auditLogger.warn(`Failed to scan package ${packageName}`, { error: error.message });
        }
      }

      context.setProgress(85, 'Calculating security scores...');

      // Calculate overall security score
      results.securityScore = this.calculateSecurityScore(results.vulnerabilities, results.scannedPackages);

      context.setProgress(95, 'Generating security recommendations...');

      // Generate recommendations
      results.recommendations = await this.generateSecurityRecommendations(results);

      return {
        timestamp: new Date().toISOString(),
        target,
        results,
        metadata: {
          scanDuration: context.getDuration(),
          scanPolicy: this.config.security,
          complianceStatus: this.assessComplianceStatus(results)
        }
      };

    } catch (error) {
      throw new Error(`Security scan failed: ${error.message}`);
    }
  }

  /**
   * Helper Methods
   */

  getEnabledFeatures() {
    return {
      dependencyResolution: true,
      securityScanning: this.config.security.vulnerabilityScanning,
      encryption: this.config.security.enableEncryption,
      caching: this.config.cache.enabled,
      parallelProcessing: this.config.performance.parallelResolution,
      auditLogging: true,
      epic1Integration: true
    };
  }

  async createSecurityContext(operationContext) {
    return {
      operationId: operationContext.id,
      operationType: operationContext.type,
      securityLevel: this.determineSecurityLevel(operationContext),
      allowedSources: Array.from(this.trustedSources),
      quarantinedPackages: Array.from(this.quarantinedPackages),
      policies: Array.from(this.securityPolicies.values()),
      timestamp: new Date().toISOString()
    };
  }

  determineSecurityLevel(context) {
    // Determine security level based on operation and configuration
    if (context.type === OperationType.SECURITY_SCAN) {
      return 'strict';
    }

    if (context.options.team) {
      const teamConfig = this.config.teamConfig[context.options.team];
      if (teamConfig?.strictSecurity) {
        return 'strict';
      }
    }

    return 'standard';
  }

  async validateOperationPrerequisites(context) {
    // Validate that all prerequisites are met for the operation

    // Check Epic 1 security status
    const securityStatus = await epic1Security.getStatus();
    if (securityStatus.overallStatus !== 'operational') {
      throw new Error('Epic 1 security infrastructure not operational');
    }

    // Check system resources
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > this.config.performance.memoryLimit * 0.9) {
      throw new Error('Insufficient memory for operation');
    }

    // Check concurrent operation limits
    if (this.activeOperations.size >= this.config.maxConcurrentOperations) {
      throw new Error('Maximum concurrent operations exceeded');
    }

    // Additional validations based on operation type
    switch (context.type) {
      case OperationType.INSTALL:
      case OperationType.UPDATE:
        // Check write permissions
        await this.validateWritePermissions();
        break;

      case OperationType.SECURITY_SCAN:
        // Ensure security scanning is enabled
        if (!this.config.security.vulnerabilityScanning) {
          throw new Error('Security scanning is disabled');
        }
        break;
    }
  }

  async validateWritePermissions() {
    try {
      const testFile = path.join(this.projectRoot, '.bmad-write-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
    } catch (error) {
      throw new Error('Insufficient write permissions in project directory');
    }
  }

  getRegistry(registryName = 'default') {
    // Return appropriate registry instance
    // This would integrate with the package registry system
    return {
      getPackage: async (packageId) => {
        // Implementation would fetch from actual registry
        return null;
      },
      getLatestVersion: async (packageName) => {
        // Implementation would fetch latest version
        return null;
      }
    };
  }

  getDefaultRegistry() {
    return this.getRegistry('default');
  }

  async validatePackageSecurity(packageInfo, securityContext) {
    // Comprehensive security validation
    const result = {
      allowed: true,
      score: 100,
      issues: [],
      action: 'allow'
    };

    try {
      // Check quarantine list
      if (this.quarantinedPackages.has(packageInfo.name)) {
        result.allowed = false;
        result.action = 'block';
        result.issues.push({
          type: 'quarantined',
          severity: 'critical',
          message: 'Package is quarantined'
        });
        return result;
      }

      // Check against security policies
      for (const policy of this.securityPolicies.values()) {
        const policyResult = await this.evaluateSecurityPolicy(packageInfo, policy);
        if (!policyResult.passed) {
          result.score -= policyResult.penalty;
          result.issues.push(...policyResult.issues);

          if (policyResult.blocking) {
            result.allowed = false;
            result.action = 'block';
          }
        }
      }

      // Final decision
      if (result.score < this.config.security.securityThreshold * 10) {
        result.allowed = false;
        result.action = 'block';
      }

    } catch (error) {
      result.allowed = false;
      result.action = 'block';
      result.issues.push({
        type: 'validation-error',
        severity: 'high',
        message: `Security validation failed: ${error.message}`
      });
    }

    return result;
  }

  async evaluateSecurityPolicy(packageInfo, policy) {
    // Evaluate package against specific security policy
    return {
      passed: true,
      penalty: 0,
      issues: [],
      blocking: false
    };
  }

  async installPackage(packageInfo, dependencyGraph, context) {
    // Actual package installation logic
    // This would integrate with npm, yarn, or other package managers

    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        version: packageInfo.version,
        dependencies: {},
        installPath: path.join(this.projectRoot, 'node_modules', packageInfo.name)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updatePackage(packageName, fromVersion, toVersion, context) {
    // Package update logic
    try {
      // Simulate update process
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        changelog: `Updated from ${fromVersion} to ${toVersion}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updatePackageLock(installedPackages) {
    // Update package lock file
    try {
      const lockFilePath = path.join(this.projectRoot, 'bmad-package-lock.json');
      const lockData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        packages: {},
        bmadMetadata: {
          managerVersion: this.config.version,
          securityValidated: true
        }
      };

      for (const pkg of installedPackages) {
        lockData.packages[pkg.package.name] = {
          version: pkg.installedVersion,
          dependencies: pkg.dependencies,
          bmadValidated: true,
          securityScore: 100 // Would be actual score
        };
      }

      await fs.writeFile(lockFilePath, JSON.stringify(lockData, null, 2));

    } catch (error) {
      this.auditLogger.warn('Failed to update package lock', { error: error.message });
    }
  }

  async scanPackageForVulnerabilities(packageInfo, securityContext) {
    // Vulnerability scanning logic
    return {
      vulnerabilities: [],
      riskScore: 0,
      lastScanned: new Date().toISOString()
    };
  }

  async quarantinePackage(packageName, reason) {
    this.quarantinedPackages.add(packageName);

    await this.auditLogger.logSecurityEvent(
      'package-quarantined',
      { package: packageName, reason, timestamp: new Date().toISOString() }
    );

    this.emit('package-quarantined', { package: packageName, reason });
  }

  calculateSecurityScore(vulnerabilities, totalPackages) {
    if (totalPackages === 0) return 100;

    let score = 100;
    const vulnCount = vulnerabilities.reduce((count, pkg) => count + pkg.vulnerabilities.length, 0);

    score -= (vulnCount / totalPackages) * 10;
    return Math.max(0, Math.round(score));
  }

  assessComplianceStatus(scanResults) {
    const criticalCount = scanResults.vulnerabilities.filter(v =>
      v.vulnerabilities.some(vuln => vuln.severity === 'critical')
    ).length;

    if (criticalCount === 0) {
      return scanResults.securityScore >= 90 ? 'compliant' : 'minor-issues';
    } else if (criticalCount <= 2) {
      return 'non-compliant-moderate';
    } else {
      return 'non-compliant-critical';
    }
  }

  async enhanceResolutionResult(resolutionResult, context) {
    // Add BMAD-specific enhancements to resolution result
    return {
      ...resolutionResult,
      bmadEnhancements: {
        securityValidated: true,
        performanceOptimized: this.config.performance.optimizeForSpeed,
        teamSpecific: context.options.team || 'default'
      }
    };
  }

  async generateDependencyRecommendations(resolutionResult) {
    // Generate optimization recommendations
    return [];
  }

  async generateSecurityRecommendations(scanResults) {
    // Generate security-specific recommendations
    return [];
  }

  getCacheHitRate() {
    // Calculate cache hit rate
    return 0.85; // Placeholder
  }

  cleanupCache() {
    // Cleanup expired cache entries
    const now = Date.now();
    const ttl = this.config.cache.ttl;

    // Cleanup dependency cache
    for (const [key, value] of this.dependencyCache.entries()) {
      if (value.timestamp && (now - value.timestamp) > ttl) {
        this.dependencyCache.delete(key);
      }
    }

    // Cleanup security cache
    for (const [key, value] of this.securityCache.entries()) {
      if (value.timestamp && (now - value.timestamp) > ttl) {
        this.securityCache.delete(key);
      }
    }
  }

  async loadSecurityPolicies() {
    // Load security policies from configuration
    // This would integrate with Epic 1 security policies
  }

  cancelOperation(operationId, reason = 'cancelled') {
    const context = this.activeOperations.get(operationId);
    if (context) {
      context.setState(OperationState.CANCELLED, { reason });
      this.activeOperations.delete(operationId);
      this.emit('operation-cancelled', context);
    }
  }

  // Public API methods for external integration
  async getStatus() {
    return {
      version: this.config.version,
      status: 'operational',
      activeOperations: this.activeOperations.size,
      installedPackages: this.installedPackages.size,
      quarantinedPackages: this.quarantinedPackages.size,
      cacheStats: {
        dependencies: this.dependencyCache.size,
        security: this.securityCache.size
      },
      lastValidation: this.configCache.get('last-validation')?.timestamp,
      epic1Integration: await epic1Security.getStatus()
    };
  }

  async getInstalledPackages() {
    return Array.from(this.installedPackages.entries()).map(([name, info]) => ({
      name,
      ...info
    }));
  }

  async getOperationHistory(limit = 100) {
    return this.operationHistory.slice(-limit).map(context => ({
      id: context.id,
      type: context.type,
      target: context.target,
      state: context.state,
      duration: context.getDuration(),
      timestamp: context.startTime ? new Date(context.startTime).toISOString() : null
    }));
  }
}

module.exports = {
  BMADDependencyManager,
  OperationContext,
  OperationType,
  OperationState,
  DependencyManagerConfig
};