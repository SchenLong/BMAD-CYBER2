/**
 * BMAD INSTALLATION ORCHESTRATOR
 * Enterprise-grade installation management with progress tracking and hooks
 *
 * Orchestrates complex installation processes with parallel execution,
 * real-time progress tracking, rollback capabilities, and comprehensive error handling.
 *
 * Features:
 * - Parallel installation execution with dependency resolution
 * - Real-time progress tracking and reporting
 * - Flexible hook system for customization
 * - Enterprise-grade error handling and rollback
 * - Health monitoring and performance metrics
 * - Integration with Epic 1 security and dependency resolution
 *
 * @author BMAD Package Management Team
 * @version 2.3.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.3
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const path = require('path');
const fs = require('fs').promises;

// Import components
const ProgressTracker = require('../progress/progress-tracker');
const HookManager = require('../hooks/hook-manager');
const RollbackManager = require('./rollback-manager');
const InstallationHealthMonitor = require('./health-monitor');
const MetricsCollector = require('./metrics-collector');

/**
 * Installation orchestrator states
 */
const ORCHESTRATOR_STATES = {
    INITIALIZING: 'initializing',
    READY: 'ready',
    INSTALLING: 'installing',
    PAUSED: 'paused',
    ROLLING_BACK: 'rolling_back',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SHUTDOWN: 'shutdown'
};

/**
 * Installation execution modes
 */
const EXECUTION_MODES = {
    SEQUENTIAL: 'sequential',
    PARALLEL: 'parallel',
    MIXED: 'mixed',
    BATCH: 'batch'
};

/**
 * Priority levels for installations
 */
const PRIORITY_LEVELS = {
    CRITICAL: 0,    // System-critical packages
    HIGH: 1,        // Important dependencies
    NORMAL: 2,      // Standard packages
    LOW: 3,         // Optional packages
    BACKGROUND: 4   // Background/cache packages
};

/**
 * Main Installation Orchestrator Class
 */
class BMADInstallationOrchestrator extends EventEmitter {

    constructor(config = {}) {
        super();

        this.id = crypto.randomUUID();
        this.config = this._mergeConfig(config);
        this.state = ORCHESTRATOR_STATES.INITIALIZING;

        // Core components
        this.progressTracker = new ProgressTracker(this.config.progress);
        this.hookManager = new HookManager(this.config.hooks);
        this.rollbackManager = new RollbackManager(this.config.rollback);
        this.healthMonitor = new InstallationHealthMonitor(this.config.monitoring);
        this.metricsCollector = new MetricsCollector(this.config.metrics);

        // Installation queues by priority
        this.installationQueues = new Map();
        Object.values(PRIORITY_LEVELS).forEach(level => {
            this.installationQueues.set(level, []);
        });

        // Active installations tracking
        this.activeInstallations = new Map();
        this.completedInstallations = new Map();
        this.failedInstallations = new Map();

        // Runtime state
        this.isInitialized = false;
        this.isPaused = false;
        this.maxConcurrentInstallations = this.config.concurrency.max;
        this.currentConcurrentInstallations = 0;

        // Performance tracking
        this.performanceMetrics = {
            startTime: null,
            totalInstallations: 0,
            successfulInstallations: 0,
            failedInstallations: 0,
            averageInstallTime: 0,
            peakConcurrency: 0,
            totalDataTransferred: 0,
            cacheHitRate: 0
        };

        // Error handling
        this.errorThreshold = this.config.errorHandling.threshold;
        this.consecutiveErrors = 0;

        // Shutdown handling
        this.isShuttingDown = false;
        this.shutdownPromise = null;

        this._setupEventHandlers();
        this._setupCleanupHandlers();
    }

    /**
     * Initialize the orchestrator
     */
    async initialize() {
        try {
            console.log('🎬 Initializing BMAD Installation Orchestrator...');

            this.state = ORCHESTRATOR_STATES.INITIALIZING;
            this.emit('state.changed', { from: null, to: this.state });

            // Initialize components
            await this.progressTracker.initialize();
            await this.hookManager.initialize();
            await this.rollbackManager.initialize();
            await this.healthMonitor.initialize();
            await this.metricsCollector.initialize();

            // Execute pre-initialization hooks
            await this.hookManager.executeHook('pre:initialize', { orchestrator: this });

            // Setup dependency resolver integration
            if (this.config.integrations.dependencyResolver) {
                await this._setupDependencyResolverIntegration();
            }

            // Setup security integration
            if (this.config.integrations.security) {
                await this._setupSecurityIntegration();
            }

            // Start monitoring
            await this.healthMonitor.start();
            await this.metricsCollector.start();

            this.isInitialized = true;
            this.state = ORCHESTRATOR_STATES.READY;
            this.emit('state.changed', { from: ORCHESTRATOR_STATES.INITIALIZING, to: this.state });

            // Execute post-initialization hooks
            await this.hookManager.executeHook('post:initialize', { orchestrator: this });

            console.log('✅ BMAD Installation Orchestrator initialized successfully');
            this.emit('initialized', { orchestratorId: this.id });

            return this.id;

        } catch (error) {
            this.state = ORCHESTRATOR_STATES.FAILED;
            this.emit('state.changed', { from: ORCHESTRATOR_STATES.INITIALIZING, to: this.state });

            console.error('❌ Failed to initialize Installation Orchestrator:', error);
            this.emit('error', { type: 'initialization', error });
            throw error;
        }
    }

    /**
     * Queue installation for execution
     */
    async queueInstallation(installationRequest) {
        if (!this.isInitialized) {
            throw new Error('Orchestrator not initialized');
        }

        try {
            // Validate installation request
            const validatedRequest = await this._validateInstallationRequest(installationRequest);

            // Execute pre-queue hooks
            await this.hookManager.executeHook('pre:queue', {
                request: validatedRequest,
                orchestrator: this
            });

            // Create installation context
            const installation = await this._createInstallationContext(validatedRequest);

            // Determine priority and queue
            const priority = this._determinePriority(installation);
            const queue = this.installationQueues.get(priority);

            queue.push(installation);

            console.log(`📝 Queued installation: ${installation.id} (priority: ${priority})`);

            // Update progress tracker
            await this.progressTracker.addInstallation(installation);

            // Execute post-queue hooks
            await this.hookManager.executeHook('post:queue', {
                installation,
                priority,
                orchestrator: this
            });

            this.emit('installation.queued', {
                installationId: installation.id,
                priority,
                queueLength: queue.length
            });

            // Try to start execution if capacity available
            await this._processInstallationQueues();

            return installation.id;

        } catch (error) {
            console.error('❌ Failed to queue installation:', error);
            this.emit('error', { type: 'queue', error });
            throw error;
        }
    }

    /**
     * Start installation execution
     */
    async startExecution(options = {}) {
        if (this.state !== ORCHESTRATOR_STATES.READY && this.state !== ORCHESTRATOR_STATES.PAUSED) {
            throw new Error(`Cannot start execution from state: ${this.state}`);
        }

        try {
            console.log('🚀 Starting installation execution...');

            this.state = ORCHESTRATOR_STATES.INSTALLING;
            this.isPaused = false;
            this.performanceMetrics.startTime = Date.now();

            this.emit('state.changed', { from: ORCHESTRATOR_STATES.READY, to: this.state });

            // Execute pre-execution hooks
            await this.hookManager.executeHook('pre:execution', {
                orchestrator: this,
                options
            });

            // Start processing queues
            await this._processInstallationQueues();

            // Execute post-execution hooks
            await this.hookManager.executeHook('post:execution', {
                orchestrator: this,
                options
            });

            console.log('✅ Installation execution started');
            this.emit('execution.started', { orchestratorId: this.id });

        } catch (error) {
            this.state = ORCHESTRATOR_STATES.FAILED;
            this.emit('state.changed', { from: ORCHESTRATOR_STATES.INSTALLING, to: this.state });

            console.error('❌ Failed to start execution:', error);
            this.emit('error', { type: 'execution', error });
            throw error;
        }
    }

    /**
     * Pause installation execution
     */
    async pause() {
        if (this.state !== ORCHESTRATOR_STATES.INSTALLING) {
            throw new Error(`Cannot pause from state: ${this.state}`);
        }

        try {
            console.log('⏸️ Pausing installation execution...');

            this.isPaused = true;
            this.state = ORCHESTRATOR_STATES.PAUSED;
            this.emit('state.changed', { from: ORCHESTRATOR_STATES.INSTALLING, to: this.state });

            // Pause active installations gracefully
            for (const installation of this.activeInstallations.values()) {
                if (installation.pausable) {
                    await this._pauseInstallation(installation.id);
                }
            }

            console.log('⏸️ Installation execution paused');
            this.emit('execution.paused', { orchestratorId: this.id });

        } catch (error) {
            console.error('❌ Failed to pause execution:', error);
            this.emit('error', { type: 'pause', error });
            throw error;
        }
    }

    /**
     * Resume installation execution
     */
    async resume() {
        if (this.state !== ORCHESTRATOR_STATES.PAUSED) {
            throw new Error(`Cannot resume from state: ${this.state}`);
        }

        try {
            console.log('▶️ Resuming installation execution...');

            this.isPaused = false;
            this.state = ORCHESTRATOR_STATES.INSTALLING;
            this.emit('state.changed', { from: ORCHESTRATOR_STATES.PAUSED, to: this.state });

            // Resume paused installations
            for (const installation of this.activeInstallations.values()) {
                if (installation.paused) {
                    await this._resumeInstallation(installation.id);
                }
            }

            // Continue processing queues
            await this._processInstallationQueues();

            console.log('▶️ Installation execution resumed');
            this.emit('execution.resumed', { orchestratorId: this.id });

        } catch (error) {
            console.error('❌ Failed to resume execution:', error);
            this.emit('error', { type: 'resume', error });
            throw error;
        }
    }

    /**
     * Cancel specific installation
     */
    async cancelInstallation(installationId, reason = 'User requested') {
        try {
            console.log(`❌ Cancelling installation: ${installationId}`);

            const installation = this.activeInstallations.get(installationId) ||
                                  this._findInQueues(installationId);

            if (!installation) {
                throw new Error(`Installation not found: ${installationId}`);
            }

            // Execute pre-cancel hooks
            await this.hookManager.executeHook('pre:cancel', {
                installation,
                reason,
                orchestrator: this
            });

            if (this.activeInstallations.has(installationId)) {
                // Cancel active installation
                await this._cancelActiveInstallation(installationId, reason);
            } else {
                // Remove from queue
                this._removeFromQueues(installationId);
            }

            // Execute post-cancel hooks
            await this.hookManager.executeHook('post:cancel', {
                installation,
                reason,
                orchestrator: this
            });

            console.log(`✅ Installation cancelled: ${installationId}`);
            this.emit('installation.cancelled', {
                installationId,
                reason
            });

        } catch (error) {
            console.error(`❌ Failed to cancel installation ${installationId}:`, error);
            this.emit('error', { type: 'cancel', installationId, error });
            throw error;
        }
    }

    /**
     * Rollback installation
     */
    async rollback(installationId, options = {}) {
        try {
            console.log(`🔄 Rolling back installation: ${installationId}`);

            const installation = this.completedInstallations.get(installationId) ||
                                  this.failedInstallations.get(installationId);

            if (!installation) {
                throw new Error(`Installation not found for rollback: ${installationId}`);
            }

            // Execute pre-rollback hooks
            await this.hookManager.executeHook('pre:rollback', {
                installation,
                options,
                orchestrator: this
            });

            this.state = ORCHESTRATOR_STATES.ROLLING_BACK;
            this.emit('state.changed', { from: this.state, to: ORCHESTRATOR_STATES.ROLLING_BACK });

            // Perform rollback
            const rollbackResult = await this.rollbackManager.rollback(installation, options);

            // Update tracking
            installation.rolledBack = true;
            installation.rollbackResult = rollbackResult;

            // Execute post-rollback hooks
            await this.hookManager.executeHook('post:rollback', {
                installation,
                rollbackResult,
                orchestrator: this
            });

            this.state = this.activeInstallations.size > 0 ?
                         ORCHESTRATOR_STATES.INSTALLING :
                         ORCHESTRATOR_STATES.READY;

            console.log(`✅ Rollback completed: ${installationId}`);
            this.emit('installation.rolledback', {
                installationId,
                rollbackResult
            });

            return rollbackResult;

        } catch (error) {
            console.error(`❌ Failed to rollback installation ${installationId}:`, error);
            this.emit('error', { type: 'rollback', installationId, error });
            throw error;
        }
    }

    /**
     * Get orchestrator status
     */
    getStatus() {
        const queueSizes = {};
        for (const [priority, queue] of this.installationQueues.entries()) {
            queueSizes[priority] = queue.length;
        }

        return {
            id: this.id,
            state: this.state,
            initialized: this.isInitialized,
            paused: this.isPaused,
            shuttingDown: this.isShuttingDown,
            queues: queueSizes,
            active: {
                count: this.activeInstallations.size,
                installations: Array.from(this.activeInstallations.keys())
            },
            completed: {
                count: this.completedInstallations.size,
                installations: Array.from(this.completedInstallations.keys())
            },
            failed: {
                count: this.failedInstallations.size,
                installations: Array.from(this.failedInstallations.keys())
            },
            concurrency: {
                current: this.currentConcurrentInstallations,
                max: this.maxConcurrentInstallations
            },
            performance: { ...this.performanceMetrics },
            health: this.healthMonitor.getHealthStatus(),
            metrics: this.metricsCollector.getMetrics()
        };
    }

    /**
     * Get installation progress
     */
    getProgress(installationId = null) {
        if (installationId) {
            return this.progressTracker.getProgress(installationId);
        }
        return this.progressTracker.getOverallProgress();
    }

    /**
     * Shutdown orchestrator
     */
    async shutdown(force = false) {
        if (this.isShuttingDown) {
            return this.shutdownPromise;
        }

        this.isShuttingDown = true;

        this.shutdownPromise = (async () => {
            try {
                console.log('🛑 Shutting down Installation Orchestrator...');

                this.state = ORCHESTRATOR_STATES.SHUTDOWN;
                this.emit('state.changed', { from: this.state, to: ORCHESTRATOR_STATES.SHUTDOWN });

                // Execute pre-shutdown hooks
                await this.hookManager.executeHook('pre:shutdown', {
                    orchestrator: this,
                    force
                });

                if (force) {
                    // Force shutdown - cancel all active installations
                    console.log('⚠️ Force shutdown - cancelling active installations...');
                    for (const installationId of this.activeInstallations.keys()) {
                        await this.cancelInstallation(installationId, 'Force shutdown');
                    }
                } else {
                    // Graceful shutdown - wait for active installations
                    console.log('⏳ Graceful shutdown - waiting for active installations...');
                    while (this.activeInstallations.size > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                // Shutdown components
                await this.healthMonitor.shutdown();
                await this.metricsCollector.shutdown();
                await this.progressTracker.shutdown();
                await this.rollbackManager.shutdown();
                await this.hookManager.shutdown();

                // Execute post-shutdown hooks
                await this.hookManager.executeHook('post:shutdown', {
                    orchestrator: this,
                    force
                });

                console.log('✅ Installation Orchestrator shutdown complete');
                this.emit('shutdown', { orchestratorId: this.id, forced: force });

            } catch (error) {
                console.error('❌ Error during orchestrator shutdown:', error);
                this.emit('error', { type: 'shutdown', error });
                throw error;
            }
        })();

        return this.shutdownPromise;
    }

    // Private methods

    /**
     * Merge configuration with defaults
     */
    _mergeConfig(userConfig) {
        const defaultConfig = {
            concurrency: {
                max: 10,
                priorityWeights: {
                    [PRIORITY_LEVELS.CRITICAL]: 1.0,
                    [PRIORITY_LEVELS.HIGH]: 0.8,
                    [PRIORITY_LEVELS.NORMAL]: 0.6,
                    [PRIORITY_LEVELS.LOW]: 0.4,
                    [PRIORITY_LEVELS.BACKGROUND]: 0.2
                }
            },
            execution: {
                mode: EXECUTION_MODES.MIXED,
                batchSize: 5,
                retryAttempts: 3,
                retryDelay: 1000,
                timeout: 300000 // 5 minutes
            },
            errorHandling: {
                threshold: 5,
                strategy: 'pause',
                escalation: true
            },
            progress: {
                updateInterval: 1000,
                detailed: true,
                realTime: true
            },
            hooks: {
                enabled: true,
                timeout: 30000,
                parallel: false
            },
            rollback: {
                enabled: true,
                automatic: false,
                preserveData: true
            },
            monitoring: {
                enabled: true,
                interval: 5000,
                healthChecks: true
            },
            metrics: {
                enabled: true,
                collection: true,
                export: false
            },
            integrations: {
                dependencyResolver: true,
                security: true,
                registry: true
            }
        };

        return this._deepMerge(defaultConfig, userConfig);
    }

    /**
     * Deep merge objects
     */
    _deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Setup event handlers
     */
    _setupEventHandlers() {
        // Progress tracking events
        this.progressTracker.on('progress.updated', (data) => {
            this.emit('progress.updated', data);
        });

        // Health monitoring events
        this.healthMonitor.on('health.warning', (data) => {
            this.emit('health.warning', data);
        });

        this.healthMonitor.on('health.critical', (data) => {
            this.emit('health.critical', data);
            this._handleHealthCritical(data);
        });

        // Error handling
        this.on('error', (error) => {
            this.consecutiveErrors++;
            if (this.consecutiveErrors >= this.errorThreshold) {
                this._handleErrorThresholdExceeded();
            }
        });

        // Success handling
        this.on('installation.completed', () => {
            this.consecutiveErrors = 0;
        });
    }

    /**
     * Setup cleanup handlers
     */
    _setupCleanupHandlers() {
        const cleanup = async () => {
            if (!this.isShuttingDown) {
                await this.shutdown(false);
            }
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }

    /**
     * Validate installation request
     */
    async _validateInstallationRequest(request) {
        if (!request || typeof request !== 'object') {
            throw new Error('Invalid installation request');
        }

        const required = ['packageId', 'version'];
        for (const field of required) {
            if (!request[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Execute validation hooks
        await this.hookManager.executeHook('validate:request', {
            request,
            orchestrator: this
        });

        return {
            id: crypto.randomUUID(),
            packageId: request.packageId,
            version: request.version,
            options: request.options || {},
            priority: request.priority || PRIORITY_LEVELS.NORMAL,
            dependencies: request.dependencies || [],
            metadata: request.metadata || {},
            createdAt: new Date(),
            status: 'queued'
        };
    }

    /**
     * Create installation context
     */
    async _createInstallationContext(request) {
        const context = {
            ...request,
            orchestratorId: this.id,
            workingDirectory: path.join(this.config.workingDirectory || '/tmp', request.id),
            progressTracker: this.progressTracker,
            metrics: {
                startTime: null,
                endTime: null,
                duration: null,
                bytesDownloaded: 0,
                bytesInstalled: 0
            },
            hooks: [],
            rollbackData: {},
            pausable: true,
            paused: false,
            cancelled: false,
            rolledBack: false
        };

        // Create working directory
        await fs.mkdir(context.workingDirectory, { recursive: true });

        return context;
    }

    /**
     * Determine installation priority
     */
    _determinePriority(installation) {
        if (installation.priority !== undefined) {
            return installation.priority;
        }

        // Auto-determine priority based on package characteristics
        if (installation.metadata.critical) return PRIORITY_LEVELS.CRITICAL;
        if (installation.dependencies.length > 10) return PRIORITY_LEVELS.HIGH;
        if (installation.metadata.optional) return PRIORITY_LEVELS.LOW;

        return PRIORITY_LEVELS.NORMAL;
    }

    /**
     * Process installation queues
     */
    async _processInstallationQueues() {
        if (this.isPaused || this.isShuttingDown) {
            return;
        }

        // Calculate available capacity
        const availableCapacity = this.maxConcurrentInstallations - this.currentConcurrentInstallations;
        if (availableCapacity <= 0) {
            return;
        }

        // Process queues by priority
        for (const priority of Object.values(PRIORITY_LEVELS).sort()) {
            const queue = this.installationQueues.get(priority);

            if (queue.length === 0) continue;

            const capacity = Math.min(
                availableCapacity,
                Math.ceil(availableCapacity * this.config.concurrency.priorityWeights[priority])
            );

            for (let i = 0; i < capacity && queue.length > 0; i++) {
                const installation = queue.shift();
                await this._startInstallation(installation);

                if (this.currentConcurrentInstallations >= this.maxConcurrentInstallations) {
                    break;
                }
            }

            if (this.currentConcurrentInstallations >= this.maxConcurrentInstallations) {
                break;
            }
        }
    }

    /**
     * Start individual installation
     */
    async _startInstallation(installation) {
        try {
            console.log(`🚀 Starting installation: ${installation.id}`);

            this.activeInstallations.set(installation.id, installation);
            this.currentConcurrentInstallations++;

            installation.status = 'starting';
            installation.metrics.startTime = Date.now();

            // Update peak concurrency metric
            this.performanceMetrics.peakConcurrency = Math.max(
                this.performanceMetrics.peakConcurrency,
                this.currentConcurrentInstallations
            );

            // Execute pre-install hooks
            await this.hookManager.executeHook('pre:install', {
                installation,
                orchestrator: this
            });

            this.emit('installation.started', {
                installationId: installation.id,
                concurrency: this.currentConcurrentInstallations
            });

            // Start actual installation process
            this._executeInstallation(installation);

        } catch (error) {
            await this._handleInstallationError(installation, error);
        }
    }

    /**
     * Execute installation process
     */
    async _executeInstallation(installation) {
        try {
            installation.status = 'installing';

            // Update progress
            await this.progressTracker.updateProgress(installation.id, {
                phase: 'installing',
                percentage: 0,
                message: `Installing ${installation.packageId}@${installation.version}`
            });

            // Execute installation hooks and logic
            await this.hookManager.executeHook('during:install', {
                installation,
                orchestrator: this
            });

            // Simulate installation process (replace with actual installation logic)
            await this._performInstallation(installation);

            // Installation completed successfully
            await this._completeInstallation(installation);

        } catch (error) {
            await this._handleInstallationError(installation, error);
        }
    }

    /**
     * Perform actual installation
     */
    async _performInstallation(installation) {
        const steps = [
            { name: 'Downloading package', percentage: 25 },
            { name: 'Verifying integrity', percentage: 50 },
            { name: 'Installing files', percentage: 75 },
            { name: 'Configuring', percentage: 100 }
        ];

        for (const step of steps) {
            if (installation.cancelled || installation.paused) {
                return;
            }

            await this.progressTracker.updateProgress(installation.id, {
                phase: 'installing',
                percentage: step.percentage,
                message: step.name
            });

            // Simulate step execution
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Execute step hooks
            await this.hookManager.executeHook(`step:${step.name.toLowerCase().replace(/\s+/g, '_')}`, {
                installation,
                step,
                orchestrator: this
            });
        }
    }

    /**
     * Complete installation
     */
    async _completeInstallation(installation) {
        try {
            installation.status = 'completed';
            installation.metrics.endTime = Date.now();
            installation.metrics.duration = installation.metrics.endTime - installation.metrics.startTime;

            // Update progress to 100%
            await this.progressTracker.updateProgress(installation.id, {
                phase: 'completed',
                percentage: 100,
                message: `Successfully installed ${installation.packageId}@${installation.version}`
            });

            // Execute post-install hooks
            await this.hookManager.executeHook('post:install', {
                installation,
                orchestrator: this
            });

            // Move to completed installations
            this.activeInstallations.delete(installation.id);
            this.completedInstallations.set(installation.id, installation);
            this.currentConcurrentInstallations--;

            // Update metrics
            this.performanceMetrics.totalInstallations++;
            this.performanceMetrics.successfulInstallations++;
            this.performanceMetrics.averageInstallTime =
                (this.performanceMetrics.averageInstallTime + installation.metrics.duration) / 2;

            console.log(`✅ Installation completed: ${installation.id}`);
            this.emit('installation.completed', {
                installationId: installation.id,
                duration: installation.metrics.duration
            });

            // Check if all installations are complete
            await this._checkCompletionStatus();

            // Continue processing queues
            await this._processInstallationQueues();

        } catch (error) {
            console.error(`❌ Error completing installation ${installation.id}:`, error);
            await this._handleInstallationError(installation, error);
        }
    }

    /**
     * Handle installation error
     */
    async _handleInstallationError(installation, error) {
        try {
            installation.status = 'failed';
            installation.error = error;
            installation.metrics.endTime = Date.now();
            installation.metrics.duration = installation.metrics.endTime - installation.metrics.startTime;

            // Update progress
            await this.progressTracker.updateProgress(installation.id, {
                phase: 'failed',
                percentage: 0,
                message: `Failed to install ${installation.packageId}@${installation.version}: ${error.message}`,
                error: error
            });

            // Execute error hooks
            await this.hookManager.executeHook('on:error', {
                installation,
                error,
                orchestrator: this
            });

            // Move to failed installations
            this.activeInstallations.delete(installation.id);
            this.failedInstallations.set(installation.id, installation);
            this.currentConcurrentInstallations--;

            // Update metrics
            this.performanceMetrics.totalInstallations++;
            this.performanceMetrics.failedInstallations++;

            console.error(`❌ Installation failed: ${installation.id} - ${error.message}`);
            this.emit('installation.failed', {
                installationId: installation.id,
                error: error.message
            });

            // Handle automatic rollback if configured
            if (this.config.rollback.automatic) {
                await this.rollback(installation.id);
            }

            // Continue processing queues
            await this._processInstallationQueues();

        } catch (handlerError) {
            console.error(`❌ Error in installation error handler:`, handlerError);
            this.emit('error', { type: 'error_handler', error: handlerError });
        }
    }

    /**
     * Check completion status
     */
    async _checkCompletionStatus() {
        const totalQueued = Array.from(this.installationQueues.values())
            .reduce((sum, queue) => sum + queue.length, 0);

        if (totalQueued === 0 && this.activeInstallations.size === 0) {
            if (this.state === ORCHESTRATOR_STATES.INSTALLING) {
                this.state = ORCHESTRATOR_STATES.COMPLETED;
                this.emit('state.changed', { from: ORCHESTRATOR_STATES.INSTALLING, to: this.state });

                console.log('🎉 All installations completed');
                this.emit('execution.completed', {
                    orchestratorId: this.id,
                    total: this.performanceMetrics.totalInstallations,
                    successful: this.performanceMetrics.successfulInstallations,
                    failed: this.performanceMetrics.failedInstallations
                });
            }
        }
    }

    /**
     * Handle health critical event
     */
    async _handleHealthCritical(data) {
        console.warn('⚠️ Critical health issue detected:', data);

        if (this.config.errorHandling.strategy === 'pause') {
            await this.pause();
        } else if (this.config.errorHandling.strategy === 'shutdown') {
            await this.shutdown(false);
        }
    }

    /**
     * Handle error threshold exceeded
     */
    async _handleErrorThresholdExceeded() {
        console.error(`❌ Error threshold exceeded: ${this.consecutiveErrors}/${this.errorThreshold}`);

        this.emit('error.threshold.exceeded', {
            consecutiveErrors: this.consecutiveErrors,
            threshold: this.errorThreshold
        });

        if (this.config.errorHandling.strategy === 'pause') {
            await this.pause();
        }
    }

    /**
     * Setup dependency resolver integration
     */
    async _setupDependencyResolverIntegration() {
        console.log('🔗 Setting up dependency resolver integration...');
        // Integration with Story 2.2 dependency resolution
    }

    /**
     * Setup security integration
     */
    async _setupSecurityIntegration() {
        console.log('🔒 Setting up security integration...');
        // Integration with Epic 1 security infrastructure
    }

    /**
     * Find installation in queues
     */
    _findInQueues(installationId) {
        for (const queue of this.installationQueues.values()) {
            const installation = queue.find(inst => inst.id === installationId);
            if (installation) return installation;
        }
        return null;
    }

    /**
     * Remove installation from queues
     */
    _removeFromQueues(installationId) {
        for (const queue of this.installationQueues.values()) {
            const index = queue.findIndex(inst => inst.id === installationId);
            if (index !== -1) {
                return queue.splice(index, 1)[0];
            }
        }
        return null;
    }

    /**
     * Cancel active installation
     */
    async _cancelActiveInstallation(installationId, reason) {
        const installation = this.activeInstallations.get(installationId);
        installation.cancelled = true;
        installation.cancelReason = reason;

        // Let the installation process handle cancellation gracefully
        // The actual cleanup will happen in the installation execution flow
    }

    /**
     * Pause installation
     */
    async _pauseInstallation(installationId) {
        const installation = this.activeInstallations.get(installationId);
        if (installation && installation.pausable) {
            installation.paused = true;
        }
    }

    /**
     * Resume installation
     */
    async _resumeInstallation(installationId) {
        const installation = this.activeInstallations.get(installationId);
        if (installation && installation.paused) {
            installation.paused = false;
        }
    }
}

// Export constants
BMADInstallationOrchestrator.STATES = ORCHESTRATOR_STATES;
BMADInstallationOrchestrator.EXECUTION_MODES = EXECUTION_MODES;
BMADInstallationOrchestrator.PRIORITY_LEVELS = PRIORITY_LEVELS;

module.exports = BMADInstallationOrchestrator;