/**
 * BMAD Framework Exports
 * ======================
 *
 * Convenience exports and utility functions for easy framework consumption.
 * This module provides pre-configured instances and simplified APIs.
 */
import { initializeFramework } from '../index.js';
import { createValidatorSuite } from '../validators/index.js';
import { createHookManager } from '../hooks/index.js';
import { createScriptManager } from '../scripts/index.js';
import { createAuthManager } from '../auth/index.js';
import { createAuditLogger, initializeGlobalAuditLogger } from '../audit/index.js';
/**
 * BMAD Framework Bundle
 * Provides pre-configured instances of all framework components
 */
export class BMADFramework {
    config;
    validators;
    hooks;
    scripts;
    auth;
    audit;
    constructor(config = {}) {
        this.config = config;
        // Initialize framework core
        const frameworkConfig = initializeFramework(config.framework);
        // Initialize all components
        this.validators = createValidatorSuite(config.validators);
        this.hooks = createHookManager(config.hooks);
        this.scripts = createScriptManager(config.scripts);
        this.auth = createAuthManager(config.auth);
        this.audit = createAuditLogger(config.audit);
        // Initialize global audit logger
        initializeGlobalAuditLogger(config.audit);
    }
    /**
     * Get framework version and metadata
     */
    getInfo() {
        return {
            name: 'BMAD-CYBER2 Framework',
            version: '1.0.0',
            components: {
                validators: 'Security validation suite',
                hooks: 'Session and event management',
                scripts: 'Utility and automation tools',
                auth: 'Authentication and RBAC',
                audit: 'Comprehensive audit logging'
            },
            initialized: new Date().toISOString()
        };
    }
    /**
     * Validate framework health
     */
    async healthCheck() {
        const results = {
            framework: true,
            validators: true,
            hooks: true,
            scripts: true,
            auth: true,
            audit: true,
            details: {}
        };
        try {
            // Test validators
            if (this.validators) {
                results.details.validators = 'OK';
            }
            // Test hooks
            if (this.hooks) {
                results.details.hooks = 'OK';
            }
            // Test scripts
            if (this.scripts) {
                const scriptList = this.scripts.listScripts();
                results.details.scripts = `${scriptList.length} scripts available`;
            }
            // Test auth
            if (this.auth) {
                const sessionCount = this.auth.getActiveSessionsCount();
                results.details.auth = `${sessionCount} active sessions`;
            }
            // Test audit
            if (this.audit) {
                results.details.audit = 'Audit logging enabled';
            }
            return {
                healthy: true,
                timestamp: new Date().toISOString(),
                results
            };
        }
        catch (error) {
            return {
                healthy: false,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                results
            };
        }
    }
    /**
     * Get framework statistics
     */
    async getStatistics() {
        return {
            framework: this.getInfo(),
            validators: this.validators?.config || {},
            auth: {
                activeSessions: this.auth?.getActiveSessionsCount() || 0
            },
            scripts: {
                available: this.scripts?.listScripts()?.length || 0
            },
            audit: await this.audit?.getStatistics() || {}
        };
    }
}
/**
 * Quick Setup Functions
 */
/**
 * Create a complete BMAD framework instance with default configuration
 */
export function createBMADFramework(config) {
    return new BMADFramework(config);
}
/**
 * Create a minimal BMAD framework for development
 */
export function createDevelopmentFramework() {
    return new BMADFramework({
        framework: {
            enableValidation: true,
            enableAuditLogging: true,
            enableRBAC: false,
            logLevel: 'debug'
        },
        validators: {
            enablePIIDetection: true,
            enableBashSafety: true,
            enableSecretDetection: false
        },
        auth: {
            enableRBAC: false,
            tokenExpiry: 3600
        },
        audit: {
            enableEncryption: false,
            enableArchival: false
        }
    });
}
/**
 * Create a production BMAD framework with security hardening
 */
export function createProductionFramework() {
    return new BMADFramework({
        framework: {
            enableValidation: true,
            enableAuditLogging: true,
            enableRBAC: true,
            logLevel: 'warn'
        },
        validators: {
            enablePIIDetection: true,
            enableBashSafety: true,
            enableSecretDetection: true,
            enablePromptInjectionGuard: true,
            enableAuditLogging: true,
            enableRateLimiting: true
        },
        auth: {
            enableRBAC: true,
            tokenExpiry: 900, // 15 minutes
            algorithm: 'RS256'
        },
        audit: {
            enableEncryption: true,
            enableArchival: true,
            retentionPeriod: 365,
            compressionLevel: 'high'
        }
    });
}
/**
 * Create a testing BMAD framework with minimal overhead
 */
export function createTestingFramework() {
    return new BMADFramework({
        framework: {
            enableValidation: false,
            enableAuditLogging: false,
            enableRBAC: false,
            logLevel: 'error'
        },
        validators: {
            enablePIIDetection: false,
            enableBashSafety: false,
            enableSecretDetection: false
        },
        auth: {
            enableRBAC: false,
            tokenExpiry: 86400 // 24 hours for testing
        },
        audit: {
            enableEncryption: false,
            enableArchival: false
        }
    });
}
/**
 * Framework presets for different use cases
 */
export const FrameworkPresets = {
    development: createDevelopmentFramework,
    production: createProductionFramework,
    testing: createTestingFramework,
    custom: createBMADFramework
};
/**
 * Export all framework components for direct access
 */
export { 
// Core framework
initializeFramework, FRAMEWORK_VERSION, FRAMEWORK_NAME } from '../index.js';
export { 
// Validators
createValidatorSuite } from '../validators/index.js';
export { 
// Hooks
createHookManager, HookRegistry } from '../hooks/index.js';
export { 
// Scripts
createScriptManager, compressAgents, compressManifest, buildModules } from '../scripts/index.js';
export { 
// Authentication
createAuthManager, RBACManager, quickAuth, requireAuth, requirePermission } from '../auth/index.js';
export { 
// Audit
createAuditLogger, AuditEventBuilder, auditAuth, auditAccess, auditViolation } from '../audit/index.js';
/**
 * Default export for convenience
 */
export default {
    createFramework: createBMADFramework,
    presets: FrameworkPresets,
    BMADFramework
};
//# sourceMappingURL=index.js.map