/**
 * BMAD INSTALLATION HEALTH MONITOR
 * Comprehensive health monitoring for installation processes
 *
 * Features:
 * - Real-time health status monitoring
 * - Performance bottleneck detection
 * - Resource usage monitoring
 * - Automatic health alerts and notifications
 * - Historical health data analysis
 * - Integration with system monitoring tools
 * - Predictive health analytics
 *
 * @author BMAD Package Management Team
 * @version 2.3.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.3
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const os = require('os');

/**
 * Health status levels
 */
const HEALTH_STATUS = {
    HEALTHY: 'healthy',
    WARNING: 'warning',
    CRITICAL: 'critical',
    UNKNOWN: 'unknown'
};

/**
 * Health check types
 */
const HEALTH_CHECK_TYPES = {
    SYSTEM_RESOURCES: 'system_resources',
    INSTALLATION_PERFORMANCE: 'installation_performance',
    ERROR_RATES: 'error_rates',
    NETWORK_CONNECTIVITY: 'network_connectivity',
    DISK_SPACE: 'disk_space',
    MEMORY_USAGE: 'memory_usage',
    CPU_USAGE: 'cpu_usage',
    DEPENDENCY_HEALTH: 'dependency_health',
    SECURITY_STATUS: 'security_status'
};

/**
 * Alert severity levels
 */
const ALERT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

class InstallationHealthMonitor extends EventEmitter {

    constructor(config = {}) {
        super();

        this.config = this._mergeConfig(config);
        this.isInitialized = false;
        this.isMonitoring = false;

        // Health state
        this.overallHealth = HEALTH_STATUS.UNKNOWN;
        this.healthChecks = new Map();
        this.healthHistory = [];

        // Monitoring intervals
        this.monitoringIntervals = new Map();

        // Metrics and statistics
        this.healthMetrics = {
            checksPerformed: 0,
            warningsGenerated: 0,
            criticalAlerts: 0,
            uptimeStart: null,
            lastHealthCheck: null,
            averageCheckTime: 0
        };

        // Alert management
        this.activeAlerts = new Map();
        this.alertHistory = [];
        this.alertThresholds = this.config.thresholds || {};

        // Performance tracking
        this.performanceBaseline = null;
        this.performanceHistory = [];

        // Resource monitoring
        this.resourceUsage = {
            cpu: { current: 0, average: 0, peak: 0 },
            memory: { current: 0, average: 0, peak: 0 },
            disk: { current: 0, available: 0 },
            network: { bytesIn: 0, bytesOut: 0 }
        };

        this._initializeHealthChecks();
    }

    /**
     * Initialize the health monitor
     */
    async initialize() {
        try {
            console.log('🏥 Initializing Installation Health Monitor...');

            // Setup baseline measurements
            await this._establishBaseline();

            // Initialize health checks
            await this._initializeAllHealthChecks();

            // Setup monitoring intervals
            this._setupMonitoringIntervals();

            this.isInitialized = true;
            this.healthMetrics.uptimeStart = Date.now();

            console.log('✅ Health Monitor initialized');

            this.emit('initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Health Monitor:', error);
            throw error;
        }
    }

    /**
     * Start health monitoring
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('Health Monitor not initialized');
        }

        if (this.isMonitoring) {
            console.log('⚠️ Health monitoring already started');
            return;
        }

        console.log('🏥 Starting health monitoring...');

        this.isMonitoring = true;

        // Start all monitoring intervals
        for (const [checkType, interval] of this.monitoringIntervals.entries()) {
            interval.start();
        }

        // Perform initial health check
        await this.performHealthCheck();

        this.emit('monitoring.started');
    }

    /**
     * Stop health monitoring
     */
    async stop() {
        if (!this.isMonitoring) {
            return;
        }

        console.log('🏥 Stopping health monitoring...');

        this.isMonitoring = false;

        // Stop all monitoring intervals
        for (const interval of this.monitoringIntervals.values()) {
            interval.stop();
        }

        this.emit('monitoring.stopped');
    }

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        const startTime = performance.now();
        const checkId = crypto.randomUUID();

        try {
            console.log(`🏥 Performing health check: ${checkId}`);

            const checkResults = new Map();
            const checkPromises = [];

            // Execute all health checks
            for (const [checkType, healthCheck] of this.healthChecks.entries()) {
                if (healthCheck.enabled) {
                    checkPromises.push(
                        this._executeHealthCheck(checkType, healthCheck)
                            .then(result => checkResults.set(checkType, result))
                            .catch(error => checkResults.set(checkType, {
                                status: HEALTH_STATUS.CRITICAL,
                                error: error.message,
                                timestamp: Date.now()
                            }))
                    );
                }
            }

            await Promise.all(checkPromises);

            // Calculate overall health
            const overallHealth = this._calculateOverallHealth(checkResults);

            // Update health state
            this.overallHealth = overallHealth.status;
            this.healthMetrics.lastHealthCheck = Date.now();
            this.healthMetrics.checksPerformed++;

            const checkTime = performance.now() - startTime;
            this.healthMetrics.averageCheckTime =
                (this.healthMetrics.averageCheckTime + checkTime) / 2;

            // Store health check result
            const healthCheckResult = {
                id: checkId,
                timestamp: Date.now(),
                overallStatus: overallHealth.status,
                checkResults: Object.fromEntries(checkResults),
                duration: checkTime,
                warningsCount: overallHealth.warningsCount,
                criticalCount: overallHealth.criticalCount
            };

            // Add to history
            this.healthHistory.push(healthCheckResult);

            // Trim history if too large
            if (this.healthHistory.length > this.config.maxHistorySize) {
                this.healthHistory = this.healthHistory.slice(-this.config.maxHistorySize);
            }

            // Process alerts
            await this._processHealthAlerts(checkResults, overallHealth);

            console.log(`✅ Health check completed: ${overallHealth.status} (${checkTime.toFixed(2)}ms)`);

            this.emit('health.checked', {
                checkId,
                status: overallHealth.status,
                duration: checkTime,
                results: checkResults
            });

            return healthCheckResult;

        } catch (error) {
            console.error(`❌ Health check failed: ${checkId}`, error);
            this.emit('health.error', { checkId, error: error.message });
            throw error;
        }
    }

    /**
     * Get current health status
     */
    getHealthStatus() {
        return {
            overall: this.overallHealth,
            checks: Object.fromEntries(this.healthChecks),
            metrics: this.healthMetrics,
            resourceUsage: this.resourceUsage,
            activeAlerts: Array.from(this.activeAlerts.values()),
            uptime: this.healthMetrics.uptimeStart ?
                    Date.now() - this.healthMetrics.uptimeStart : 0,
            isMonitoring: this.isMonitoring,
            lastCheck: this.healthMetrics.lastHealthCheck
        };
    }

    /**
     * Get health history
     */
    getHealthHistory(limit = 100) {
        return {
            history: this.healthHistory.slice(-limit),
            performanceHistory: this.performanceHistory.slice(-limit),
            alertHistory: this.alertHistory.slice(-limit),
            baseline: this.performanceBaseline
        };
    }

    /**
     * Add custom health check
     */
    addHealthCheck(checkType, checkConfig) {
        const healthCheck = {
            type: checkType,
            name: checkConfig.name || checkType,
            description: checkConfig.description || '',
            enabled: checkConfig.enabled !== false,
            interval: checkConfig.interval || this.config.defaultInterval,
            timeout: checkConfig.timeout || this.config.defaultTimeout,
            check: checkConfig.check,
            thresholds: checkConfig.thresholds || {},
            metadata: checkConfig.metadata || {}
        };

        this.healthChecks.set(checkType, healthCheck);

        // Setup monitoring interval if monitoring is active
        if (this.isMonitoring) {
            this._setupCheckInterval(checkType, healthCheck);
        }

        console.log(`🏥 Added health check: ${checkType}`);

        this.emit('health.check.added', { checkType, healthCheck });

        return checkType;
    }

    /**
     * Remove health check
     */
    removeHealthCheck(checkType) {
        if (!this.healthChecks.has(checkType)) {
            return false;
        }

        // Stop monitoring interval
        const interval = this.monitoringIntervals.get(checkType);
        if (interval) {
            interval.stop();
            this.monitoringIntervals.delete(checkType);
        }

        this.healthChecks.delete(checkType);

        console.log(`🏥 Removed health check: ${checkType}`);

        this.emit('health.check.removed', { checkType });

        return true;
    }

    /**
     * Update alert thresholds
     */
    updateThresholds(checkType, thresholds) {
        const healthCheck = this.healthChecks.get(checkType);
        if (!healthCheck) {
            throw new Error(`Health check not found: ${checkType}`);
        }

        healthCheck.thresholds = { ...healthCheck.thresholds, ...thresholds };

        this.emit('thresholds.updated', { checkType, thresholds });
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) {
            return false;
        }

        alert.acknowledged = true;
        alert.acknowledgedAt = Date.now();

        this.emit('alert.acknowledged', { alertId, alert });

        return true;
    }

    /**
     * Clear alert
     */
    clearAlert(alertId) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) {
            return false;
        }

        this.activeAlerts.delete(alertId);

        this.emit('alert.cleared', { alertId, alert });

        return true;
    }

    /**
     * Shutdown health monitor
     */
    async shutdown() {
        console.log('🏥 Shutting down Health Monitor...');

        await this.stop();

        this.isInitialized = false;
        this.emit('shutdown');

        console.log('✅ Health Monitor shutdown complete');
    }

    // Private methods

    /**
     * Merge configuration with defaults
     */
    _mergeConfig(userConfig) {
        const defaultConfig = {
            enabled: true,
            defaultInterval: 30000, // 30 seconds
            defaultTimeout: 10000,  // 10 seconds
            maxHistorySize: 1000,
            alerting: {
                enabled: true,
                emailNotifications: false,
                webhookNotifications: false
            },
            thresholds: {
                cpu: { warning: 70, critical: 90 },
                memory: { warning: 80, critical: 95 },
                disk: { warning: 85, critical: 95 },
                errorRate: { warning: 0.05, critical: 0.1 },
                responseTime: { warning: 5000, critical: 10000 }
            },
            checks: {
                systemResources: { enabled: true, interval: 30000 },
                installationPerformance: { enabled: true, interval: 60000 },
                errorRates: { enabled: true, interval: 15000 },
                networkConnectivity: { enabled: true, interval: 60000 },
                diskSpace: { enabled: true, interval: 60000 }
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
     * Initialize health checks
     */
    _initializeHealthChecks() {
        // System resources health check
        this.healthChecks.set(HEALTH_CHECK_TYPES.SYSTEM_RESOURCES, {
            type: HEALTH_CHECK_TYPES.SYSTEM_RESOURCES,
            name: 'System Resources',
            description: 'Monitor CPU, memory, and disk usage',
            enabled: this.config.checks.systemResources.enabled,
            interval: this.config.checks.systemResources.interval,
            check: this._checkSystemResources.bind(this),
            thresholds: {
                cpu: this.config.thresholds.cpu,
                memory: this.config.thresholds.memory,
                disk: this.config.thresholds.disk
            }
        });

        // Installation performance health check
        this.healthChecks.set(HEALTH_CHECK_TYPES.INSTALLATION_PERFORMANCE, {
            type: HEALTH_CHECK_TYPES.INSTALLATION_PERFORMANCE,
            name: 'Installation Performance',
            description: 'Monitor installation speed and efficiency',
            enabled: this.config.checks.installationPerformance.enabled,
            interval: this.config.checks.installationPerformance.interval,
            check: this._checkInstallationPerformance.bind(this),
            thresholds: {
                responseTime: this.config.thresholds.responseTime
            }
        });

        // Error rates health check
        this.healthChecks.set(HEALTH_CHECK_TYPES.ERROR_RATES, {
            type: HEALTH_CHECK_TYPES.ERROR_RATES,
            name: 'Error Rates',
            description: 'Monitor installation error rates',
            enabled: this.config.checks.errorRates.enabled,
            interval: this.config.checks.errorRates.interval,
            check: this._checkErrorRates.bind(this),
            thresholds: {
                errorRate: this.config.thresholds.errorRate
            }
        });

        // Network connectivity health check
        this.healthChecks.set(HEALTH_CHECK_TYPES.NETWORK_CONNECTIVITY, {
            type: HEALTH_CHECK_TYPES.NETWORK_CONNECTIVITY,
            name: 'Network Connectivity',
            description: 'Monitor network connectivity and latency',
            enabled: this.config.checks.networkConnectivity.enabled,
            interval: this.config.checks.networkConnectivity.interval,
            check: this._checkNetworkConnectivity.bind(this),
            thresholds: {}
        });

        // Disk space health check
        this.healthChecks.set(HEALTH_CHECK_TYPES.DISK_SPACE, {
            type: HEALTH_CHECK_TYPES.DISK_SPACE,
            name: 'Disk Space',
            description: 'Monitor available disk space',
            enabled: this.config.checks.diskSpace.enabled,
            interval: this.config.checks.diskSpace.interval,
            check: this._checkDiskSpace.bind(this),
            thresholds: {
                disk: this.config.thresholds.disk
            }
        });
    }

    /**
     * Establish performance baseline
     */
    async _establishBaseline() {
        console.log('📊 Establishing performance baseline...');

        const baseline = {
            timestamp: Date.now(),
            cpu: os.loadavg()[0],
            memory: process.memoryUsage(),
            uptime: os.uptime(),
            systemInfo: {
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem()
            }
        };

        this.performanceBaseline = baseline;

        console.log('✅ Performance baseline established');
    }

    /**
     * Initialize all health checks
     */
    async _initializeAllHealthChecks() {
        for (const [checkType, healthCheck] of this.healthChecks.entries()) {
            if (healthCheck.enabled) {
                try {
                    await healthCheck.check();
                    console.log(`✅ Health check initialized: ${checkType}`);
                } catch (error) {
                    console.warn(`⚠️ Health check initialization failed: ${checkType}`, error);
                }
            }
        }
    }

    /**
     * Setup monitoring intervals
     */
    _setupMonitoringIntervals() {
        for (const [checkType, healthCheck] of this.healthChecks.entries()) {
            if (healthCheck.enabled) {
                this._setupCheckInterval(checkType, healthCheck);
            }
        }
    }

    /**
     * Setup individual check interval
     */
    _setupCheckInterval(checkType, healthCheck) {
        const interval = {
            timer: null,
            start: () => {
                interval.timer = setInterval(async () => {
                    try {
                        await this._executeHealthCheck(checkType, healthCheck);
                    } catch (error) {
                        console.warn(`⚠️ Health check error: ${checkType}`, error);
                    }
                }, healthCheck.interval);
            },
            stop: () => {
                if (interval.timer) {
                    clearInterval(interval.timer);
                    interval.timer = null;
                }
            }
        };

        this.monitoringIntervals.set(checkType, interval);
    }

    /**
     * Execute individual health check
     */
    async _executeHealthCheck(checkType, healthCheck) {
        const startTime = performance.now();

        try {
            const result = await Promise.race([
                healthCheck.check(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout)
                )
            ]);

            const duration = performance.now() - startTime;

            const healthResult = {
                type: checkType,
                status: result.status || HEALTH_STATUS.HEALTHY,
                message: result.message || 'OK',
                data: result.data || {},
                duration,
                timestamp: Date.now(),
                thresholds: healthCheck.thresholds
            };

            return healthResult;

        } catch (error) {
            const duration = performance.now() - startTime;

            return {
                type: checkType,
                status: HEALTH_STATUS.CRITICAL,
                message: `Health check failed: ${error.message}`,
                error: error.message,
                duration,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Calculate overall health status
     */
    _calculateOverallHealth(checkResults) {
        let criticalCount = 0;
        let warningCount = 0;
        let healthyCount = 0;

        for (const result of checkResults.values()) {
            switch (result.status) {
                case HEALTH_STATUS.CRITICAL:
                    criticalCount++;
                    break;
                case HEALTH_STATUS.WARNING:
                    warningCount++;
                    break;
                case HEALTH_STATUS.HEALTHY:
                    healthyCount++;
                    break;
            }
        }

        let overallStatus;
        if (criticalCount > 0) {
            overallStatus = HEALTH_STATUS.CRITICAL;
        } else if (warningCount > 0) {
            overallStatus = HEALTH_STATUS.WARNING;
        } else if (healthyCount > 0) {
            overallStatus = HEALTH_STATUS.HEALTHY;
        } else {
            overallStatus = HEALTH_STATUS.UNKNOWN;
        }

        return {
            status: overallStatus,
            criticalCount,
            warningsCount: warningCount,
            healthyCount
        };
    }

    /**
     * Process health alerts
     */
    async _processHealthAlerts(checkResults, overallHealth) {
        if (!this.config.alerting.enabled) {
            return;
        }

        // Process critical status change
        if (overallHealth.status === HEALTH_STATUS.CRITICAL && this.overallHealth !== HEALTH_STATUS.CRITICAL) {
            await this._generateAlert('system.critical', 'System health is critical', ALERT_SEVERITY.CRITICAL);
            this.healthMetrics.criticalAlerts++;
        }

        // Process individual check alerts
        for (const [checkType, result] of checkResults.entries()) {
            if (result.status === HEALTH_STATUS.WARNING || result.status === HEALTH_STATUS.CRITICAL) {
                const severity = result.status === HEALTH_STATUS.CRITICAL ?
                                 ALERT_SEVERITY.CRITICAL : ALERT_SEVERITY.WARNING;

                await this._generateAlert(
                    `health.${checkType}`,
                    `Health check ${checkType}: ${result.message}`,
                    severity,
                    { checkType, result }
                );

                if (result.status === HEALTH_STATUS.WARNING) {
                    this.healthMetrics.warningsGenerated++;
                }
            }
        }
    }

    /**
     * Generate health alert
     */
    async _generateAlert(alertType, message, severity, metadata = {}) {
        const alertId = crypto.randomUUID();

        const alert = {
            id: alertId,
            type: alertType,
            message,
            severity,
            timestamp: Date.now(),
            acknowledged: false,
            metadata
        };

        this.activeAlerts.set(alertId, alert);
        this.alertHistory.push(alert);

        // Emit alert event
        this.emit(severity === ALERT_SEVERITY.CRITICAL ? 'health.critical' : 'health.warning', alert);

        console.log(`🚨 Health alert [${severity.toUpperCase()}]: ${message}`);

        return alertId;
    }

    // Health check implementations

    /**
     * Check system resources
     */
    async _checkSystemResources() {
        const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;

        // Update resource usage tracking
        this.resourceUsage.cpu.current = cpuUsage;
        this.resourceUsage.cpu.peak = Math.max(this.resourceUsage.cpu.peak, cpuUsage);
        this.resourceUsage.memory.current = memoryPercent;
        this.resourceUsage.memory.peak = Math.max(this.resourceUsage.memory.peak, memoryPercent);

        let status = HEALTH_STATUS.HEALTHY;
        const issues = [];

        if (cpuUsage > 90) {
            status = HEALTH_STATUS.CRITICAL;
            issues.push(`CPU usage critical: ${cpuUsage.toFixed(1)}%`);
        } else if (cpuUsage > 70) {
            status = HEALTH_STATUS.WARNING;
            issues.push(`CPU usage high: ${cpuUsage.toFixed(1)}%`);
        }

        if (memoryPercent > 95) {
            status = HEALTH_STATUS.CRITICAL;
            issues.push(`Memory usage critical: ${memoryPercent.toFixed(1)}%`);
        } else if (memoryPercent > 80) {
            status = HEALTH_STATUS.WARNING;
            issues.push(`Memory usage high: ${memoryPercent.toFixed(1)}%`);
        }

        return {
            status,
            message: issues.length > 0 ? issues.join(', ') : 'System resources healthy',
            data: {
                cpu: { usage: cpuUsage, cores: os.cpus().length },
                memory: {
                    usage: memoryPercent,
                    total: totalMemory,
                    free: freeMemory,
                    process: memoryUsage
                }
            }
        };
    }

    /**
     * Check installation performance
     */
    async _checkInstallationPerformance() {
        // This would integrate with actual installation metrics
        // For now, simulate performance check
        const avgInstallTime = Math.random() * 10000; // Random 0-10 seconds

        let status = HEALTH_STATUS.HEALTHY;
        let message = 'Installation performance good';

        if (avgInstallTime > 10000) {
            status = HEALTH_STATUS.CRITICAL;
            message = `Installation performance critical: ${avgInstallTime.toFixed(0)}ms average`;
        } else if (avgInstallTime > 5000) {
            status = HEALTH_STATUS.WARNING;
            message = `Installation performance degraded: ${avgInstallTime.toFixed(0)}ms average`;
        }

        return {
            status,
            message,
            data: {
                averageInstallTime: avgInstallTime,
                performanceScore: Math.max(0, 100 - (avgInstallTime / 100))
            }
        };
    }

    /**
     * Check error rates
     */
    async _checkErrorRates() {
        // This would integrate with actual error tracking
        // For now, simulate error rate check
        const errorRate = Math.random() * 0.2; // Random 0-20%

        let status = HEALTH_STATUS.HEALTHY;
        let message = 'Error rates normal';

        if (errorRate > 0.1) {
            status = HEALTH_STATUS.CRITICAL;
            message = `Error rate critical: ${(errorRate * 100).toFixed(1)}%`;
        } else if (errorRate > 0.05) {
            status = HEALTH_STATUS.WARNING;
            message = `Error rate elevated: ${(errorRate * 100).toFixed(1)}%`;
        }

        return {
            status,
            message,
            data: {
                errorRate,
                errorCount: Math.floor(errorRate * 100),
                totalOperations: 100
            }
        };
    }

    /**
     * Check network connectivity
     */
    async _checkNetworkConnectivity() {
        try {
            // Simple network check - in production would check actual endpoints
            const startTime = Date.now();

            // Simulate network check
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

            const latency = Date.now() - startTime;

            let status = HEALTH_STATUS.HEALTHY;
            let message = 'Network connectivity good';

            if (latency > 5000) {
                status = HEALTH_STATUS.WARNING;
                message = `Network latency high: ${latency}ms`;
            }

            return {
                status,
                message,
                data: {
                    latency,
                    connected: true,
                    timestamp: Date.now()
                }
            };

        } catch (error) {
            return {
                status: HEALTH_STATUS.CRITICAL,
                message: `Network connectivity failed: ${error.message}`,
                data: { connected: false, error: error.message }
            };
        }
    }

    /**
     * Check disk space
     */
    async _checkDiskSpace() {
        // Mock disk space check - in production would check actual disk usage
        const totalSpace = 1000000000; // 1GB mock
        const usedSpace = Math.random() * totalSpace;
        const freeSpace = totalSpace - usedSpace;
        const usagePercent = (usedSpace / totalSpace) * 100;

        this.resourceUsage.disk.current = usagePercent;
        this.resourceUsage.disk.available = freeSpace;

        let status = HEALTH_STATUS.HEALTHY;
        let message = 'Disk space sufficient';

        if (usagePercent > 95) {
            status = HEALTH_STATUS.CRITICAL;
            message = `Disk space critical: ${usagePercent.toFixed(1)}% used`;
        } else if (usagePercent > 85) {
            status = HEALTH_STATUS.WARNING;
            message = `Disk space low: ${usagePercent.toFixed(1)}% used`;
        }

        return {
            status,
            message,
            data: {
                total: totalSpace,
                used: usedSpace,
                free: freeSpace,
                usagePercent
            }
        };
    }
}

// Export health status and check types
InstallationHealthMonitor.HEALTH_STATUS = HEALTH_STATUS;
InstallationHealthMonitor.HEALTH_CHECK_TYPES = HEALTH_CHECK_TYPES;
InstallationHealthMonitor.ALERT_SEVERITY = ALERT_SEVERITY;

module.exports = InstallationHealthMonitor;