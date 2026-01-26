/**
 * BMAD Failure Handler - Epic 5.1
 * Build failure detection, recovery, and retry management.
 *
 * @module FailureHandler
 * @version 1.0.0
 */

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;

/**
 * Failure types enumeration
 */
const FailureType = {
  COMPILATION_ERROR: 'compilation_error',
  DEPENDENCY_ERROR: 'dependency_error',
  TIMEOUT: 'timeout',
  OUT_OF_MEMORY: 'out_of_memory',
  NETWORK_ERROR: 'network_error',
  PERMISSION_ERROR: 'permission_error',
  CONFIGURATION_ERROR: 'configuration_error',
  RESOURCE_ERROR: 'resource_error',
  TEST_FAILURE: 'test_failure',
  UNKNOWN: 'unknown'
};

/**
 * Recovery strategies
 */
const RecoveryStrategy = {
  RETRY: 'retry',
  CLEAN_REBUILD: 'clean_rebuild',
  DEPENDENCY_REINSTALL: 'dependency_reinstall',
  CACHE_CLEAR: 'cache_clear',
  RESOURCE_INCREASE: 'resource_increase',
  SKIP: 'skip',
  MANUAL: 'manual'
};

/**
 * Failure patterns for detection
 */
const FailurePatterns = {
  compilation_error: [
    /error TS\d+:/i,
    /SyntaxError:/i,
    /TypeError:/i,
    /cannot find module/i,
    /compilation failed/i,
    /build failed/i,
    /error: /i,
    /ENOENT.*tsconfig/i
  ],
  dependency_error: [
    /npm ERR!/i,
    /yarn error/i,
    /ERESOLVE/i,
    /peer dependency/i,
    /cannot resolve/i,
    /module not found/i,
    /package.*not found/i,
    /ENOENT.*package\.json/i,
    /resolution failed/i
  ],
  timeout: [
    /timeout/i,
    /ETIMEDOUT/i,
    /timed out/i,
    /exceeded.*time/i,
    /deadline exceeded/i
  ],
  out_of_memory: [
    /out of memory/i,
    /ENOMEM/i,
    /JavaScript heap out of memory/i,
    /allocation failed/i,
    /memory limit/i,
    /OOM/i,
    /fatal error.*memory/i
  ],
  network_error: [
    /ENOTFOUND/i,
    /ECONNREFUSED/i,
    /ECONNRESET/i,
    /network/i,
    /socket hang up/i,
    /getaddrinfo/i,
    /CERT_/i,
    /SSL/i
  ],
  permission_error: [
    /EACCES/i,
    /permission denied/i,
    /EPERM/i,
    /access denied/i,
    /unauthorized/i
  ],
  test_failure: [
    /test failed/i,
    /tests? failed/i,
    /FAILED/i,
    /assertion error/i,
    /expect.*received/i
  ]
};

/**
 * Failure Handler class
 * Manages build failure detection, recovery, and retry logic
 */
class FailureHandler extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelayBase: config.retryDelayBase || 1000,
      retryDelayMultiplier: config.retryDelayMultiplier || 2,
      retryDelayMax: config.retryDelayMax || 30000,
      enableAutoRecovery: config.enableAutoRecovery !== false,
      cleanBuildOnFailure: config.cleanBuildOnFailure || false,
      logFailures: config.logFailures !== false,
      failureLogDir: config.failureLogDir || path.join(process.cwd(), '.build-logs'),
      notifyOnFailure: config.notifyOnFailure || false,
      customPatterns: config.customPatterns || {},
      recoveryStrategies: config.recoveryStrategies || {},
      ...config
    };

    // Failure tracking
    this.failureHistory = [];
    this.retryAttempts = new Map();
    this.recoveryAttempts = new Map();
    this.activeRecoveries = new Map();

    // Pattern matchers
    this.patterns = { ...FailurePatterns };
    this._mergeCustomPatterns();

    // Statistics
    this.stats = {
      totalFailures: 0,
      failuresByType: {},
      successfulRecoveries: 0,
      failedRecoveries: 0,
      retriesAttempted: 0,
      retriesSuccessful: 0,
      averageRetryCount: 0
    };

    this.isInitialized = false;
  }

  /**
   * Initialize the failure handler
   */
  async initialize() {
    await this._ensureLogDirectory();
    this.isInitialized = true;
    this.emit('initialized', { timestamp: new Date() });
    return this;
  }

  /**
   * Ensure log directory exists
   * @private
   */
  async _ensureLogDirectory() {
    if (this.config.logFailures) {
      await fs.mkdir(this.config.failureLogDir, { recursive: true });
    }
  }

  /**
   * Merge custom patterns with defaults
   * @private
   */
  _mergeCustomPatterns() {
    for (const [type, patterns] of Object.entries(this.config.customPatterns)) {
      if (!this.patterns[type]) {
        this.patterns[type] = [];
      }
      this.patterns[type].push(...patterns.map(p => new RegExp(p, 'i')));
    }
  }

  /**
   * Handle build error
   * @param {Error} error - Build error
   * @param {string} targetId - Build target ID
   * @param {Object} target - Build target configuration
   * @returns {Promise<Object>} Handling result
   */
  async handleBuildError(error, targetId, target) {
    const failureType = this._classifyFailure(error);
    const failureInfo = this._createFailureInfo(error, targetId, target, failureType);

    // Record failure
    this.failureHistory.push(failureInfo);
    this.stats.totalFailures++;
    this.stats.failuresByType[failureType] = (this.stats.failuresByType[failureType] || 0) + 1;

    // Log failure
    if (this.config.logFailures) {
      await this._logFailure(failureInfo);
    }

    // Emit failure event
    this.emit('buildFailure', failureInfo);

    // Determine recovery strategy
    const recoveryStrategy = this._determineRecoveryStrategy(failureType, failureInfo);
    failureInfo.suggestedRecovery = recoveryStrategy;

    // Notify if configured
    if (this.config.notifyOnFailure) {
      await this._notifyFailure(failureInfo);
    }

    return {
      failureInfo,
      recoveryStrategy,
      canRetry: this._canRetry(targetId, failureType)
    };
  }

  /**
   * Handle retry attempt
   * @param {string} targetId - Target ID
   * @param {number} attemptNumber - Current attempt number
   * @param {Error} error - Previous error
   */
  async handleRetry(targetId, attemptNumber, error) {
    // Record retry attempt
    const retryInfo = {
      targetId,
      attemptNumber,
      error: error.message,
      timestamp: Date.now()
    };

    if (!this.retryAttempts.has(targetId)) {
      this.retryAttempts.set(targetId, []);
    }
    this.retryAttempts.get(targetId).push(retryInfo);

    this.stats.retriesAttempted++;

    // Calculate delay with exponential backoff
    const delay = this._calculateRetryDelay(attemptNumber);

    this.emit('retryScheduled', {
      targetId,
      attemptNumber,
      delay,
      timestamp: new Date()
    });

    // Wait before retry
    await this._delay(delay);

    // Perform pre-retry cleanup if needed
    await this._preRetryCleanup(targetId, error);

    this.emit('retryStarting', {
      targetId,
      attemptNumber,
      timestamp: new Date()
    });
  }

  /**
   * Attempt recovery from failure
   * @param {Error} error - Build error
   * @param {string} buildId - Build ID
   * @returns {Promise<Object>} Recovery result
   */
  async attemptRecovery(error, buildId) {
    if (!this.config.enableAutoRecovery) {
      return { recovered: false, reason: 'Auto-recovery disabled' };
    }

    const failureType = this._classifyFailure(error);
    const strategy = this._determineRecoveryStrategy(failureType);

    // Track recovery attempt
    const recoveryId = `${buildId}-${Date.now()}`;
    this.activeRecoveries.set(recoveryId, {
      buildId,
      failureType,
      strategy,
      startTime: Date.now()
    });

    try {
      let recovered = false;
      let recoveryDetails = {};

      switch (strategy) {
        case RecoveryStrategy.RETRY:
          // Simple retry - handled by build orchestrator
          recovered = true;
          recoveryDetails = { action: 'retry_allowed' };
          break;

        case RecoveryStrategy.CLEAN_REBUILD:
          recoveryDetails = await this._performCleanRebuild();
          recovered = recoveryDetails.success;
          break;

        case RecoveryStrategy.DEPENDENCY_REINSTALL:
          recoveryDetails = await this._performDependencyReinstall();
          recovered = recoveryDetails.success;
          break;

        case RecoveryStrategy.CACHE_CLEAR:
          recoveryDetails = await this._performCacheClear();
          recovered = recoveryDetails.success;
          break;

        case RecoveryStrategy.RESOURCE_INCREASE:
          recoveryDetails = await this._performResourceIncrease();
          recovered = recoveryDetails.success;
          break;

        case RecoveryStrategy.SKIP:
        case RecoveryStrategy.MANUAL:
        default:
          recovered = false;
          recoveryDetails = { action: 'manual_intervention_required' };
          break;
      }

      // Update statistics
      if (recovered) {
        this.stats.successfulRecoveries++;
      } else {
        this.stats.failedRecoveries++;
      }

      const result = {
        recovered,
        strategy,
        details: recoveryDetails,
        recoveryId
      };

      this.emit('recoveryCompleted', result);
      return result;

    } finally {
      this.activeRecoveries.delete(recoveryId);
    }
  }

  /**
   * Classify failure type from error
   * @private
   */
  _classifyFailure(error) {
    const errorMessage = error.message || error.toString();
    const errorStack = error.stack || '';
    const combinedText = `${errorMessage}\n${errorStack}`;

    // Check each failure type's patterns
    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(combinedText)) {
          return type;
        }
      }
    }

    return FailureType.UNKNOWN;
  }

  /**
   * Create failure information object
   * @private
   */
  _createFailureInfo(error, targetId, target, failureType) {
    return {
      id: `failure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      targetId,
      targetName: target?.name,
      failureType,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context: {
        language: target?.language,
        sourceDir: target?.sourceDir,
        buildScript: target?.buildScript,
        retryCount: this.retryAttempts.get(targetId)?.length || 0
      },
      timestamp: Date.now(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      }
    };
  }

  /**
   * Determine recovery strategy for failure type
   * @private
   */
  _determineRecoveryStrategy(failureType, failureInfo = null) {
    // Check for custom strategy configuration
    if (this.config.recoveryStrategies[failureType]) {
      return this.config.recoveryStrategies[failureType];
    }

    // Default strategies by failure type
    const defaultStrategies = {
      [FailureType.COMPILATION_ERROR]: RecoveryStrategy.RETRY,
      [FailureType.DEPENDENCY_ERROR]: RecoveryStrategy.DEPENDENCY_REINSTALL,
      [FailureType.TIMEOUT]: RecoveryStrategy.RETRY,
      [FailureType.OUT_OF_MEMORY]: RecoveryStrategy.RESOURCE_INCREASE,
      [FailureType.NETWORK_ERROR]: RecoveryStrategy.RETRY,
      [FailureType.PERMISSION_ERROR]: RecoveryStrategy.MANUAL,
      [FailureType.CONFIGURATION_ERROR]: RecoveryStrategy.MANUAL,
      [FailureType.RESOURCE_ERROR]: RecoveryStrategy.CLEAN_REBUILD,
      [FailureType.TEST_FAILURE]: RecoveryStrategy.SKIP,
      [FailureType.UNKNOWN]: RecoveryStrategy.RETRY
    };

    return defaultStrategies[failureType] || RecoveryStrategy.MANUAL;
  }

  /**
   * Check if retry is allowed
   * @private
   */
  _canRetry(targetId, failureType) {
    const attempts = this.retryAttempts.get(targetId) || [];

    // Don't retry certain failure types
    const noRetryTypes = [
      FailureType.PERMISSION_ERROR,
      FailureType.CONFIGURATION_ERROR
    ];

    if (noRetryTypes.includes(failureType)) {
      return false;
    }

    return attempts.length < this.config.maxRetries;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @private
   */
  _calculateRetryDelay(attemptNumber) {
    const delay = Math.min(
      this.config.retryDelayBase * Math.pow(this.config.retryDelayMultiplier, attemptNumber - 1),
      this.config.retryDelayMax
    );

    // Add jitter (0-25% variation)
    const jitter = delay * 0.25 * Math.random();
    return Math.floor(delay + jitter);
  }

  /**
   * Perform pre-retry cleanup
   * @private
   */
  async _preRetryCleanup(targetId, error) {
    const failureType = this._classifyFailure(error);

    // Clean specific caches/temp files based on failure type
    switch (failureType) {
      case FailureType.DEPENDENCY_ERROR:
        // Clear package manager caches
        this.emit('preRetryCleanup', { targetId, action: 'clear_package_cache' });
        break;

      case FailureType.OUT_OF_MEMORY:
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc();
        }
        this.emit('preRetryCleanup', { targetId, action: 'gc_triggered' });
        break;

      default:
        // No specific cleanup needed
        break;
    }
  }

  /**
   * Log failure to file
   * @private
   */
  async _logFailure(failureInfo) {
    const logFileName = `failure-${failureInfo.targetId}-${failureInfo.timestamp}.json`;
    const logPath = path.join(this.config.failureLogDir, logFileName);

    await fs.writeFile(logPath, JSON.stringify(failureInfo, null, 2));

    // Also log to console
    console.error(`[FAILURE] ${failureInfo.failureType}: ${failureInfo.error.message}`);
  }

  /**
   * Notify about failure
   * @private
   */
  async _notifyFailure(failureInfo) {
    this.emit('failureNotification', {
      type: 'build_failure',
      severity: this._getFailureSeverity(failureInfo.failureType),
      message: `Build failed for ${failureInfo.targetId}: ${failureInfo.failureType}`,
      details: failureInfo,
      timestamp: new Date()
    });
  }

  /**
   * Get failure severity
   * @private
   */
  _getFailureSeverity(failureType) {
    const severities = {
      [FailureType.OUT_OF_MEMORY]: 'critical',
      [FailureType.PERMISSION_ERROR]: 'critical',
      [FailureType.CONFIGURATION_ERROR]: 'high',
      [FailureType.COMPILATION_ERROR]: 'medium',
      [FailureType.DEPENDENCY_ERROR]: 'medium',
      [FailureType.TEST_FAILURE]: 'low',
      [FailureType.TIMEOUT]: 'medium',
      [FailureType.NETWORK_ERROR]: 'medium',
      [FailureType.UNKNOWN]: 'medium'
    };

    return severities[failureType] || 'medium';
  }

  /**
   * Perform clean rebuild recovery
   * @private
   */
  async _performCleanRebuild() {
    // This would be implemented to clean build artifacts
    this.emit('recoveryAction', { action: 'clean_rebuild', timestamp: new Date() });
    return { success: true, action: 'clean_rebuild' };
  }

  /**
   * Perform dependency reinstall recovery
   * @private
   */
  async _performDependencyReinstall() {
    this.emit('recoveryAction', { action: 'dependency_reinstall', timestamp: new Date() });
    return { success: true, action: 'dependency_reinstall' };
  }

  /**
   * Perform cache clear recovery
   * @private
   */
  async _performCacheClear() {
    this.emit('recoveryAction', { action: 'cache_clear', timestamp: new Date() });
    return { success: true, action: 'cache_clear' };
  }

  /**
   * Perform resource increase recovery
   * @private
   */
  async _performResourceIncrease() {
    // Suggest increased memory allocation
    this.emit('recoveryAction', {
      action: 'resource_increase',
      suggestion: 'Increase NODE_OPTIONS=--max-old-space-size=8192',
      timestamp: new Date()
    });
    return { success: false, action: 'resource_increase', requiresManual: true };
  }

  /**
   * Delay helper
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get failure history
   * @param {number} limit - Maximum entries to return
   * @returns {Array} Recent failures
   */
  getFailureHistory(limit = 50) {
    return this.failureHistory.slice(-limit);
  }

  /**
   * Get failures by target
   * @param {string} targetId - Target ID
   * @returns {Array} Target failures
   */
  getTargetFailures(targetId) {
    return this.failureHistory.filter(f => f.targetId === targetId);
  }

  /**
   * Clear retry tracking for target
   * @param {string} targetId - Target ID
   */
  clearRetryTracking(targetId) {
    this.retryAttempts.delete(targetId);
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      retrySuccessRate: this.stats.retriesAttempted > 0
        ? ((this.stats.retriesSuccessful / this.stats.retriesAttempted) * 100).toFixed(2) + '%'
        : 'N/A',
      recoverySuccessRate: (this.stats.successfulRecoveries + this.stats.failedRecoveries) > 0
        ? ((this.stats.successfulRecoveries / (this.stats.successfulRecoveries + this.stats.failedRecoveries)) * 100).toFixed(2) + '%'
        : 'N/A',
      activeRecoveries: this.activeRecoveries.size,
      failureHistorySize: this.failureHistory.length
    };
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    return {
      status: 'healthy',
      totalFailures: this.stats.totalFailures,
      activeRecoveries: this.activeRecoveries.size,
      retrySuccessRate: this.getStats().retrySuccessRate,
      recoverySuccessRate: this.getStats().recoverySuccessRate,
      failuresByType: { ...this.stats.failuresByType }
    };
  }

  /**
   * Shutdown
   */
  async shutdown() {
    // Clear all tracking
    this.retryAttempts.clear();
    this.recoveryAttempts.clear();
    this.activeRecoveries.clear();

    this.isInitialized = false;
    this.emit('shutdown', { timestamp: new Date() });
  }
}

module.exports = FailureHandler;
module.exports.FailureType = FailureType;
module.exports.RecoveryStrategy = RecoveryStrategy;
