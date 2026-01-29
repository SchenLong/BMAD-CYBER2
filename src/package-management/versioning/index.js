/**
 * BMAD Version Compatibility System - Main Entry Point
 * Epic 2: Package Management System - Story 2.4
 *
 * Comprehensive version compatibility and migration system export.
 * Integrates compatibility analysis, migration planning, matrix generation,
 * and visualization with Epic 2 security and dependency management.
 *
 * @version 2.4.0
 * @author BlackUnicorn.Tech
 * @license MIT
 * @security OWASP A+ Compliant
 */

// Core Components
const { BMADVersionCompatibility } = require('./compatibility/bmad-version-compatibility');
const { VersionMigrationPlanner } = require('./migration/version-migration-planner');
const { MigrationExecutor } = require('./migration/migration-executor');
const { CompatibilityMatrixGenerator } = require('./matrix/compatibility-matrix-generator');
const { MatrixVisualization } = require('./matrix/matrix-visualization');

// Integration Layer
const { Epic2IntegrationController } = require('./integration/epic2-integration');

/**
 * BMAD Version Compatibility System Factory
 * Creates and manages complete version compatibility ecosystem
 */
class BMADVersioningSystem {
    constructor(options = {}) {
        this.config = {
            // System configuration
            system: {
                enableSecurityIntegration: options.enableSecurityIntegration !== false,
                enableDependencyIntegration: options.enableDependencyIntegration !== false,
                enableInstallationIntegration: options.enableInstallationIntegration !== false,
                enableVisualization: options.enableVisualization !== false,
                enableAuditLogging: options.enableAuditLogging !== false
            },

            // Component configurations
            compatibility: options.compatibility || {},
            migration: options.migration || {},
            matrix: options.matrix || {},
            visualization: options.visualization || {},
            integration: options.integration || {}
        };

        // Initialize integration controller
        this.integrationController = new Epic2IntegrationController({
            compatibility: this.config.compatibility,
            migration: this.config.migration,
            execution: this.config.execution,
            matrix: this.config.matrix,
            visualization: this.config.visualization,
            ...this.config.integration
        });

        // Component access
        this.components = this.integrationController.components;
    }

    /**
     * Initialize the complete versioning system
     * @returns {Promise<void>} Initialization result
     */
    async initialize() {
        try {
            await this.integrationController.initializeIntegrations();
            return {
                success: true,
                version: '2.4.0',
                timestamp: new Date().toISOString(),
                enabledComponents: this.integrationController.getActiveIntegrations()
            };
        } catch (error) {
            throw new Error(`BMAD Versioning System initialization failed: ${error.message}`);
        }
    }

    /**
     * Analyze package version compatibility
     * @param {Object} analysisRequest - Compatibility analysis request
     * @returns {Promise<Object>} Comprehensive compatibility analysis
     */
    async analyzeCompatibility(analysisRequest) {
        return await this.integrationController.performIntegratedCompatibilityAnalysis(analysisRequest);
    }

    /**
     * Create migration plan
     * @param {Object} migrationRequest - Migration planning request
     * @returns {Promise<Object>} Detailed migration plan
     */
    async createMigrationPlan(migrationRequest) {
        return await this.components.migrationPlanner.createMigrationPlan(migrationRequest);
    }

    /**
     * Execute migration plan
     * @param {string} planId - Migration plan ID
     * @param {Object} executionOptions - Execution configuration
     * @returns {Promise<Object>} Execution result
     */
    async executeMigration(planId, executionOptions = {}) {
        return await this.integrationController.executeIntegratedMigration(planId, executionOptions);
    }

    /**
     * Generate compatibility matrix
     * @param {Object} matrixRequest - Matrix generation request
     * @returns {Promise<Object>} Comprehensive compatibility matrix
     */
    async generateMatrix(matrixRequest) {
        return await this.integrationController.generateIntegratedCompatibilityMatrix(matrixRequest);
    }

    /**
     * Create visualization suite
     * @param {Object} matrixData - Matrix data for visualization
     * @param {Object} options - Visualization options
     * @returns {Promise<Object>} Complete visualization suite
     */
    async createVisualization(matrixData, options = {}) {
        return await this.components.visualization.generateVisualizationSuite(matrixData, options);
    }

    /**
     * Get system status
     * @returns {Object} Complete system status
     */
    getSystemStatus() {
        return this.integrationController.getIntegrationStatus();
    }

    /**
     * Perform system health check
     * @returns {Promise<Object>} Health check results
     */
    async healthCheck() {
        return await this.integrationController.performHealthCheck();
    }

    /**
     * Get system metrics
     * @returns {Object} System-wide metrics
     */
    getMetrics() {
        try {
            return {
                system: {
                    version: '2.4.0',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                },
                compatibility: this.components.compatibility?.getMetrics?.() || { error: 'getMetrics not available' },
                migration: this.components.migrationPlanner?.getMetrics?.() || { error: 'getMetrics not available' },
                execution: this.components.migrationExecutor?.getMetrics?.() || { error: 'getMetrics not available' },
                matrix: this.components.matrixGenerator?.getMetrics?.() || { error: 'getMetrics not available' },
                visualization: this.components.visualization?.getMetrics?.() || { error: 'getMetrics not available' },
                integration: this.integrationController.getIntegrationStatus()
            };
        } catch (error) {
            return {
                system: {
                    version: '2.4.0',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                },
                error: error.message
            };
        }
    }
}

/**
 * Factory function to create BMAD Versioning System
 * @param {Object} options - System configuration options
 * @returns {BMADVersioningSystem} Configured versioning system
 */
function createVersioningSystem(options = {}) {
    return new BMADVersioningSystem(options);
}

/**
 * Quick setup for common scenarios
 */
const QuickSetup = {
    /**
     * Enterprise setup with full security integration
     */
    enterprise: (options = {}) => {
        return new BMADVersioningSystem({
            enableSecurityIntegration: true,
            enableDependencyIntegration: true,
            enableInstallationIntegration: true,
            enableAuditLogging: true,
            compatibility: {
                strictMode: true,
                breakingChangeThreshold: 'minor',
                maxCompatibilityDistance: 2
            },
            migration: {
                defaultStrategy: 'conservative',
                autoRollbackOnFailure: true,
                requireManualApproval: true
            },
            ...options
        });
    },

    /**
     * Development setup with balanced features
     */
    development: (options = {}) => {
        return new BMADVersioningSystem({
            enableSecurityIntegration: true,
            enableDependencyIntegration: true,
            enableInstallationIntegration: false,
            enableVisualization: true,
            compatibility: {
                strictMode: false,
                includePrerelease: true
            },
            migration: {
                defaultStrategy: 'balanced',
                allowParallelMigrations: true
            },
            ...options
        });
    },

    /**
     * Lightweight setup for basic compatibility checking
     */
    basic: (options = {}) => {
        return new BMADVersioningSystem({
            enableSecurityIntegration: false,
            enableDependencyIntegration: false,
            enableInstallationIntegration: false,
            enableVisualization: false,
            enableAuditLogging: false,
            compatibility: {
                strictMode: false,
                cacheResults: false
            },
            migration: {
                defaultStrategy: 'conservative'
            },
            integration: {
                securityIntegrationEnabled: false,
                dependencyIntegrationEnabled: false,
                installationIntegrationEnabled: false,
                auditLoggingEnabled: false
            },
            ...options
        });
    }
};

/**
 * Utility functions for version compatibility
 */
const Utils = {
    /**
     * Quick compatibility check between two package versions
     * @param {Object} sourcePackage - Source package
     * @param {Object} targetPackage - Target package
     * @returns {Promise<Object>} Basic compatibility result
     */
    async quickCompatibilityCheck(sourcePackage, targetPackage) {
        const compatibility = new BMADVersionCompatibility();
        return await compatibility.analyzeCompatibility({
            sourcePackage,
            targetPackage,
            analysisType: 'basic'
        });
    },

    /**
     * Generate simple migration steps
     * @param {Object} sourcePackage - Source package
     * @param {Object} targetPackage - Target package
     * @returns {Promise<Array>} Basic migration steps
     */
    async generateSimpleMigrationSteps(sourcePackage, targetPackage) {
        const planner = new VersionMigrationPlanner();
        const plan = await planner.createMigrationPlan({
            sourcePackages: [sourcePackage],
            targetPackages: [targetPackage]
        });
        return plan.phases;
    },

    /**
     * Create basic compatibility matrix
     * @param {Array} packages - Packages to analyze
     * @param {Array} environments - Environments to test against
     * @returns {Promise<Object>} Basic matrix
     */
    async createBasicMatrix(packages, environments) {
        const generator = new CompatibilityMatrixGenerator();
        return await generator.generateMatrix({
            packages,
            environments
        });
    }
};

// Export all components and utilities
module.exports = {
    // Main system
    BMADVersioningSystem,
    createVersioningSystem,

    // Quick setup presets
    QuickSetup,

    // Utility functions
    Utils,

    // Individual components (for advanced usage)
    Components: {
        BMADVersionCompatibility,
        VersionMigrationPlanner,
        MigrationExecutor,
        CompatibilityMatrixGenerator,
        MatrixVisualization,
        Epic2IntegrationController
    },

    // Version and metadata
    VERSION: '2.4.0',
    BUILD_DATE: new Date().toISOString(),
    EPIC: 'Epic 2: Package Management System',
    STORY: 'Story 2.4: Version Compatibility System Export'
};

// Default export for ES6 modules
module.exports.default = BMADVersioningSystem;