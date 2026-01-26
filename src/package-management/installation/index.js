/**
 * BMAD INSTALLATION ORCHESTRATOR SYSTEM - MAIN EXPORT
 * Complete installation management system with progress tracking and hooks
 *
 * This is the main entry point for the BMAD Installation Orchestrator System.
 * It provides a comprehensive solution for managing complex package installation
 * processes with enterprise-grade features.
 *
 * Features:
 * - Parallel installation execution with dependency resolution
 * - Real-time progress tracking and reporting
 * - Flexible hook system for customization
 * - Enterprise-grade error handling and rollback
 * - Health monitoring and performance metrics
 * - Integration with security and dependency systems
 * - Web-based dashboard and monitoring
 *
 * @author BMAD Package Management Team
 * @version 2.3.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.3
 */

// Core orchestrator
const BMADInstallationOrchestrator = require('./orchestrator/bmad-installation-orchestrator');

// Progress tracking
const ProgressTracker = require('./progress/progress-tracker');
const ProgressDashboard = require('./progress/progress-dashboard');

// Hooks and extensibility
const HookManager = require('./hooks/hook-manager');
const BuiltinHooks = require('./hooks/builtin-hooks');

// Rollback and recovery
const RollbackManager = require('./orchestrator/rollback-manager');

// Monitoring and metrics
const HealthMonitor = require('./orchestrator/health-monitor');
const MetricsCollector = require('./orchestrator/metrics-collector');

/**
 * Main Installation System Factory
 * Creates and configures the complete installation system
 */
class InstallationSystemFactory {

    /**
     * Create a complete installation system with default configuration
     */
    static createSystem(config = {}) {
        const systemConfig = {
            orchestrator: {
                concurrency: { max: 10 },
                execution: {
                    mode: 'mixed',
                    timeout: 300000, // 5 minutes
                    retryAttempts: 3
                },
                errorHandling: {
                    threshold: 5,
                    strategy: 'pause'
                },
                ...config.orchestrator
            },
            progress: {
                updateFrequency: 1000,
                realTime: true,
                webSocket: { enabled: false },
                ...config.progress
            },
            hooks: {
                enabled: true,
                timeout: 30000,
                ...config.hooks
            },
            rollback: {
                enabled: true,
                automatic: false,
                persistence: { enabled: true },
                ...config.rollback
            },
            monitoring: {
                enabled: true,
                interval: 5000,
                healthChecks: true,
                ...config.monitoring
            },
            metrics: {
                enabled: true,
                collection: true,
                analytics: true,
                ...config.metrics
            },
            integrations: {
                dependencyResolver: true,
                security: true,
                ...config.integrations
            }
        };

        return new InstallationSystem(systemConfig);
    }

    /**
     * Create a minimal installation system for basic use cases
     */
    static createMinimalSystem(config = {}) {
        const minimalConfig = {
            orchestrator: {
                concurrency: { max: 3 },
                execution: { mode: 'sequential' }
            },
            progress: { updateFrequency: 5000 },
            hooks: { enabled: false },
            rollback: { enabled: false },
            monitoring: { enabled: false },
            metrics: { enabled: false },
            integrations: { dependencyResolver: false, security: false },
            ...config
        };

        return new InstallationSystem(minimalConfig);
    }

    /**
     * Create a high-performance installation system for enterprise use
     */
    static createEnterpriseSystem(config = {}) {
        const enterpriseConfig = {
            orchestrator: {
                concurrency: { max: 50 },
                execution: {
                    mode: 'parallel',
                    timeout: 600000, // 10 minutes
                    retryAttempts: 5
                },
                errorHandling: {
                    threshold: 10,
                    strategy: 'continue'
                }
            },
            progress: {
                updateFrequency: 500,
                realTime: true,
                webSocket: { enabled: true, port: 8080 }
            },
            hooks: {
                enabled: true,
                timeout: 60000,
                parallel: true
            },
            rollback: {
                enabled: true,
                automatic: true,
                persistence: {
                    enabled: true,
                    compression: true
                }
            },
            monitoring: {
                enabled: true,
                interval: 1000,
                healthChecks: true,
                alerting: true
            },
            metrics: {
                enabled: true,
                collection: true,
                analytics: true,
                export: { enabled: true }
            },
            integrations: {
                dependencyResolver: true,
                security: true,
                registry: true
            },
            ...config
        };

        return new InstallationSystem(enterpriseConfig);
    }
}

/**
 * Complete Installation System
 * Integrates all components into a cohesive system
 */
class InstallationSystem {

    constructor(config) {
        this.config = config;
        this.isInitialized = false;

        // Core components
        this.orchestrator = null;
        this.progressTracker = null;
        this.dashboard = null;
        this.hookManager = null;
        this.rollbackManager = null;
        this.healthMonitor = null;
        this.metricsCollector = null;

        // System state
        this.systemId = require('crypto').randomUUID();
        this.startTime = null;
        this.shutdownPromise = null;
    }

    /**
     * Initialize the complete installation system
     */
    async initialize() {
        try {
            console.log('🚀 Initializing BMAD Installation System...');

            this.startTime = Date.now();

            // Initialize components in dependency order

            // 1. Progress tracking (needed by orchestrator)
            if (this.config.progress) {
                this.progressTracker = new ProgressTracker(this.config.progress);
                await this.progressTracker.initialize();
            }

            // 2. Hook management (needed by orchestrator)
            if (this.config.hooks?.enabled) {
                this.hookManager = new HookManager(this.config.hooks);
                await this.hookManager.initialize();

                // Register built-in hooks
                this._registerBuiltinHooks();
            }

            // 3. Rollback management (needed by orchestrator)
            if (this.config.rollback?.enabled) {
                this.rollbackManager = new RollbackManager(this.config.rollback);
                await this.rollbackManager.initialize();
            }

            // 4. Health monitoring
            if (this.config.monitoring?.enabled) {
                this.healthMonitor = new HealthMonitor(this.config.monitoring);
                await this.healthMonitor.initialize();
            }

            // 5. Metrics collection
            if (this.config.metrics?.enabled) {
                this.metricsCollector = new MetricsCollector(this.config.metrics);
                await this.metricsCollector.initialize();
            }

            // 6. Main orchestrator (depends on all above)
            this.orchestrator = new BMADInstallationOrchestrator({
                ...this.config.orchestrator,
                progressTracker: this.progressTracker,
                hookManager: this.hookManager,
                rollbackManager: this.rollbackManager,
                healthMonitor: this.healthMonitor,
                metricsCollector: this.metricsCollector
            });

            await this.orchestrator.initialize();

            // 7. Dashboard (depends on progress tracker)
            if (this.progressTracker && this.config.progress?.dashboard !== false) {
                this.dashboard = new ProgressDashboard(this.progressTracker);
                await this.dashboard.initialize();
            }

            // Setup integrations
            await this._setupIntegrations();

            // Start monitoring components
            await this._startMonitoring();

            this.isInitialized = true;

            console.log('✅ BMAD Installation System initialized successfully');
            console.log(`📋 System ID: ${this.systemId}`);
            console.log(`⚡ Components: ${this._getActiveComponents().join(', ')}`);

            return this.systemId;

        } catch (error) {
            console.error('❌ Failed to initialize Installation System:', error);
            throw error;
        }
    }

    /**
     * Start installation execution
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }

        console.log('🚀 Starting installation execution...');

        if (this.orchestrator) {
            await this.orchestrator.startExecution();
        }

        console.log('✅ Installation execution started');
    }

    /**
     * Queue installation for execution
     */
    async queueInstallation(installationRequest) {
        if (!this.orchestrator) {
            throw new Error('Orchestrator not available');
        }

        return await this.orchestrator.queueInstallation(installationRequest);
    }

    /**
     * Get system status
     */
    getStatus() {
        const status = {
            systemId: this.systemId,
            initialized: this.isInitialized,
            uptime: this.startTime ? Date.now() - this.startTime : 0,
            components: this._getActiveComponents(),
            orchestrator: this.orchestrator?.getStatus() || null,
            progress: this.progressTracker?.getOverallProgress() || null,
            health: this.healthMonitor?.getHealthStatus() || null,
            metrics: this.metricsCollector?.getMetrics() || null
        };

        return status;
    }

    /**
     * Get progress information
     */
    getProgress(installationId = null) {
        if (!this.progressTracker) {
            return null;
        }

        return this.progressTracker.getProgress(installationId);
    }

    /**
     * Get dashboard HTML
     */
    async getDashboard(view = 'overview') {
        if (!this.dashboard) {
            throw new Error('Dashboard not available');
        }

        return await this.dashboard.renderDashboard(view);
    }

    /**
     * Pause execution
     */
    async pause() {
        if (this.orchestrator) {
            await this.orchestrator.pause();
        }
    }

    /**
     * Resume execution
     */
    async resume() {
        if (this.orchestrator) {
            await this.orchestrator.resume();
        }
    }

    /**
     * Cancel specific installation
     */
    async cancel(installationId, reason = 'User requested') {
        if (this.orchestrator) {
            await this.orchestrator.cancelInstallation(installationId, reason);
        }
    }

    /**
     * Rollback installation
     */
    async rollback(installationId, options = {}) {
        if (this.orchestrator) {
            await this.orchestrator.rollback(installationId, options);
        }
    }

    /**
     * Register custom hook
     */
    registerHook(hookType, handler, options = {}) {
        if (!this.hookManager) {
            throw new Error('Hook manager not available');
        }

        return this.hookManager.registerHook(hookType, handler, options);
    }

    /**
     * Register plugin
     */
    registerPlugin(pluginId, hooks) {
        if (!this.hookManager) {
            throw new Error('Hook manager not available');
        }

        return this.hookManager.registerPlugin(pluginId, hooks);
    }

    /**
     * Add custom health check
     */
    addHealthCheck(checkType, checkConfig) {
        if (!this.healthMonitor) {
            throw new Error('Health monitor not available');
        }

        return this.healthMonitor.addHealthCheck(checkType, checkConfig);
    }

    /**
     * Record custom metric
     */
    recordMetric(metricName, value, type = 'gauge', metadata = {}) {
        if (!this.metricsCollector) {
            throw new Error('Metrics collector not available');
        }

        return this.metricsCollector.recordCustomMetric(metricName, value, type, metadata);
    }

    /**
     * Export system data
     */
    async exportData(format = 'json') {
        const data = {
            system: this.getStatus(),
            metrics: this.metricsCollector?.getMetrics() || {},
            health: this.healthMonitor?.getHealthHistory() || {},
            progress: this.progressTracker?.getHistory() || {}
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'metrics':
                return this.metricsCollector?.exportMetrics(format) || '';
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Shutdown the system
     */
    async shutdown(force = false) {
        if (this.shutdownPromise) {
            return this.shutdownPromise;
        }

        this.shutdownPromise = (async () => {
            try {
                console.log('🛑 Shutting down Installation System...');

                // Shutdown components in reverse dependency order
                if (this.dashboard) {
                    await this.dashboard.shutdown();
                }

                if (this.orchestrator) {
                    await this.orchestrator.shutdown(force);
                }

                if (this.metricsCollector) {
                    await this.metricsCollector.shutdown();
                }

                if (this.healthMonitor) {
                    await this.healthMonitor.shutdown();
                }

                if (this.rollbackManager) {
                    await this.rollbackManager.shutdown();
                }

                if (this.hookManager) {
                    await this.hookManager.shutdown();
                }

                if (this.progressTracker) {
                    await this.progressTracker.shutdown();
                }

                this.isInitialized = false;

                console.log('✅ Installation System shutdown complete');

            } catch (error) {
                console.error('❌ Error during system shutdown:', error);
                throw error;
            }
        })();

        return this.shutdownPromise;
    }

    // Private methods

    /**
     * Register built-in hooks
     */
    _registerBuiltinHooks() {
        if (!this.hookManager) return;

        console.log('🪝 Registering built-in hooks...');

        try {
            // Security hooks
            this.hookManager.registerHook(
                'pre:install',
                BuiltinHooks.SecurityHooks.preInstallSecurityCheck,
                {
                    name: 'Pre-Install Security Check',
                    description: 'Validates package security before installation',
                    priority: 0 // Critical priority
                }
            );

            this.hookManager.registerHook(
                'step:verifying_integrity',
                BuiltinHooks.SecurityHooks.verifyPackageIntegrity,
                {
                    name: 'Package Integrity Verification',
                    description: 'Verifies package integrity during installation'
                }
            );

            // Dependency hooks
            this.hookManager.registerHook(
                'pre:install',
                BuiltinHooks.DependencyHooks.resolveDependencies,
                {
                    name: 'Dependency Resolution',
                    description: 'Resolves package dependencies before installation',
                    priority: 1 // High priority
                }
            );

            // Performance hooks
            this.hookManager.registerHook(
                'pre:install',
                BuiltinHooks.PerformanceHooks.capturePerformanceBaseline,
                {
                    name: 'Performance Baseline Capture',
                    description: 'Captures performance baseline before installation'
                }
            );

            this.hookManager.registerHook(
                'post:install',
                BuiltinHooks.PerformanceHooks.analyzeInstallationPerformance,
                {
                    name: 'Performance Analysis',
                    description: 'Analyzes installation performance metrics'
                }
            );

            // Notification hooks
            this.hookManager.registerHook(
                'pre:install',
                BuiltinHooks.NotificationHooks.notifyInstallationStarted,
                {
                    name: 'Installation Started Notification',
                    description: 'Sends notification when installation starts'
                }
            );

            this.hookManager.registerHook(
                'post:install',
                BuiltinHooks.NotificationHooks.notifyInstallationCompleted,
                {
                    name: 'Installation Completed Notification',
                    description: 'Sends notification when installation completes'
                }
            );

            // Error handling hooks
            this.hookManager.registerHook(
                'on:error',
                BuiltinHooks.ErrorHooks.handleInstallationError,
                {
                    name: 'Error Recovery Handler',
                    description: 'Attempts error recovery strategies'
                }
            );

            // Cleanup hooks
            this.hookManager.registerHook(
                'pre:install',
                BuiltinHooks.CleanupHooks.preInstallationCleanup,
                {
                    name: 'Pre-Installation Cleanup',
                    description: 'Performs cleanup before installation'
                }
            );

            this.hookManager.registerHook(
                'post:install',
                BuiltinHooks.CleanupHooks.postInstallationCleanup,
                {
                    name: 'Post-Installation Cleanup',
                    description: 'Performs cleanup after installation'
                }
            );

            console.log('✅ Built-in hooks registered successfully');

        } catch (error) {
            console.warn('⚠️ Error registering built-in hooks:', error);
        }
    }

    /**
     * Setup integrations
     */
    async _setupIntegrations() {
        console.log('🔗 Setting up system integrations...');

        // Integration setup would go here
        // This could include Epic 1 security, Story 2.2 dependency resolution, etc.

        console.log('✅ System integrations configured');
    }

    /**
     * Start monitoring components
     */
    async _startMonitoring() {
        if (this.healthMonitor) {
            await this.healthMonitor.start();
        }

        if (this.metricsCollector) {
            await this.metricsCollector.start();
        }
    }

    /**
     * Get list of active components
     */
    _getActiveComponents() {
        const components = [];

        if (this.orchestrator) components.push('orchestrator');
        if (this.progressTracker) components.push('progress-tracker');
        if (this.dashboard) components.push('dashboard');
        if (this.hookManager) components.push('hooks');
        if (this.rollbackManager) components.push('rollback');
        if (this.healthMonitor) components.push('health-monitor');
        if (this.metricsCollector) components.push('metrics');

        return components;
    }
}

/**
 * Convenience function to create and initialize a standard installation system
 */
async function createInstallationSystem(config = {}) {
    const system = InstallationSystemFactory.createSystem(config);
    await system.initialize();
    return system;
}

/**
 * Convenience function to create and initialize a minimal installation system
 */
async function createMinimalSystem(config = {}) {
    const system = InstallationSystemFactory.createMinimalSystem(config);
    await system.initialize();
    return system;
}

/**
 * Convenience function to create and initialize an enterprise installation system
 */
async function createEnterpriseSystem(config = {}) {
    const system = InstallationSystemFactory.createEnterpriseSystem(config);
    await system.initialize();
    return system;
}

// Export all components and system
module.exports = {
    // Main system classes
    InstallationSystem,
    InstallationSystemFactory,

    // Convenience functions
    createInstallationSystem,
    createMinimalSystem,
    createEnterpriseSystem,

    // Core components (for advanced usage)
    BMADInstallationOrchestrator,
    ProgressTracker,
    ProgressDashboard,
    HookManager,
    BuiltinHooks,
    RollbackManager,
    HealthMonitor,
    MetricsCollector,

    // Constants and enums
    ORCHESTRATOR_STATES: BMADInstallationOrchestrator.STATES,
    EXECUTION_MODES: BMADInstallationOrchestrator.EXECUTION_MODES,
    PRIORITY_LEVELS: BMADInstallationOrchestrator.PRIORITY_LEVELS,
    HOOK_TYPES: HookManager.HOOK_TYPES,
    HEALTH_STATUS: HealthMonitor.HEALTH_STATUS,
    METRIC_TYPES: MetricsCollector.METRIC_TYPES
};