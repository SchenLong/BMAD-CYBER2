/**
 * BMAD Framework Exports
 * ======================
 *
 * Convenience exports and utility functions for easy framework consumption.
 * This module provides pre-configured instances and simplified APIs.
 */
import { type FrameworkConfig } from '../index.js';
import { type ValidatorSuiteConfig } from '../validators/index.js';
import { type HookConfig } from '../hooks/index.js';
import { type ScriptConfig } from '../scripts/index.js';
import { type AuthConfig } from '../auth/index.js';
import { type AuditConfig } from '../audit/index.js';
/**
 * Complete Framework Configuration
 */
export interface CompleteFrameworkConfig {
    framework?: FrameworkConfig;
    validators?: ValidatorSuiteConfig;
    hooks?: HookConfig;
    scripts?: ScriptConfig;
    auth?: AuthConfig;
    audit?: AuditConfig;
}
/**
 * BMAD Framework Bundle
 * Provides pre-configured instances of all framework components
 */
export declare class BMADFramework {
    readonly config: CompleteFrameworkConfig;
    readonly validators: any;
    readonly hooks: any;
    readonly scripts: any;
    readonly auth: any;
    readonly audit: any;
    constructor(config?: CompleteFrameworkConfig);
    /**
     * Get framework version and metadata
     */
    getInfo(): {
        name: string;
        version: string;
        components: {
            validators: string;
            hooks: string;
            scripts: string;
            auth: string;
            audit: string;
        };
        initialized: string;
    };
    /**
     * Validate framework health
     */
    healthCheck(): Promise<{
        healthy: boolean;
        timestamp: string;
        results: {
            framework: boolean;
            validators: boolean;
            hooks: boolean;
            scripts: boolean;
            auth: boolean;
            audit: boolean;
            details: Record<string, any>;
        };
        error?: never;
    } | {
        healthy: boolean;
        timestamp: string;
        error: string;
        results: {
            framework: boolean;
            validators: boolean;
            hooks: boolean;
            scripts: boolean;
            auth: boolean;
            audit: boolean;
            details: Record<string, any>;
        };
    }>;
    /**
     * Get framework statistics
     */
    getStatistics(): Promise<{
        framework: {
            name: string;
            version: string;
            components: {
                validators: string;
                hooks: string;
                scripts: string;
                auth: string;
                audit: string;
            };
            initialized: string;
        };
        validators: any;
        auth: {
            activeSessions: any;
        };
        scripts: {
            available: any;
        };
        audit: any;
    }>;
}
/**
 * Quick Setup Functions
 */
/**
 * Create a complete BMAD framework instance with default configuration
 */
export declare function createBMADFramework(config?: CompleteFrameworkConfig): BMADFramework;
/**
 * Create a minimal BMAD framework for development
 */
export declare function createDevelopmentFramework(): BMADFramework;
/**
 * Create a production BMAD framework with security hardening
 */
export declare function createProductionFramework(): BMADFramework;
/**
 * Create a testing BMAD framework with minimal overhead
 */
export declare function createTestingFramework(): BMADFramework;
/**
 * Framework presets for different use cases
 */
export declare const FrameworkPresets: {
    development: typeof createDevelopmentFramework;
    production: typeof createProductionFramework;
    testing: typeof createTestingFramework;
    custom: typeof createBMADFramework;
};
/**
 * Export all framework components for direct access
 */
export { initializeFramework, FRAMEWORK_VERSION, FRAMEWORK_NAME } from '../index.js';
export { createValidatorSuite } from '../validators/index.js';
export { createHookManager, HookRegistry } from '../hooks/index.js';
export { createScriptManager, compressAgents, compressManifest, buildModules } from '../scripts/index.js';
export { createAuthManager, RBACManager, quickAuth, requireAuth, requirePermission } from '../auth/index.js';
export { createAuditLogger, AuditEventBuilder, auditAuth, auditAccess, auditViolation } from '../audit/index.js';
/**
 * Types for external consumption
 */
export type { FrameworkConfig, ValidatorSuiteConfig, HookConfig, ScriptConfig, AuthConfig, AuditConfig, CompleteFrameworkConfig };
/**
 * Default export for convenience
 */
declare const _default: {
    createFramework: typeof createBMADFramework;
    presets: {
        development: typeof createDevelopmentFramework;
        production: typeof createProductionFramework;
        testing: typeof createTestingFramework;
        custom: typeof createBMADFramework;
    };
    BMADFramework: typeof BMADFramework;
};
export default _default;
//# sourceMappingURL=index.d.ts.map