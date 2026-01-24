/**
 * Quick Setup Functions
 */
/**
 * Create a complete BMAD framework instance with default configuration
 */
export function createBMADFramework(config: any): BMADFramework;
/**
 * Create a minimal BMAD framework for development
 */
export function createDevelopmentFramework(): BMADFramework;
/**
 * Create a production BMAD framework with security hardening
 */
export function createProductionFramework(): BMADFramework;
/**
 * Create a testing BMAD framework with minimal overhead
 */
export function createTestingFramework(): BMADFramework;
/**
 * BMAD Framework Bundle
 * Provides pre-configured instances of all framework components
 */
export class BMADFramework {
    constructor(config?: {});
    config: {};
    validators: {
        config: {
            enablePIIDetection: boolean;
            enableBashSafety: boolean;
            enableSecretDetection: boolean;
            enablePromptInjectionGuard: boolean;
            enableAuditLogging: boolean;
            enableRateLimiting: boolean;
            customRules?: Record<string, any>;
        };
        validators: {};
    };
    hooks: import("../index.js").BMADHookManager;
    scripts: import("../index.js").BMADScriptManager;
    auth: import("../index.js").AuthManager;
    audit: import("../index.js").BMADAuditLogger;
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
            details: {};
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
            details: {};
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
        validators: {
            enablePIIDetection: boolean;
            enableBashSafety: boolean;
            enableSecretDetection: boolean;
            enablePromptInjectionGuard: boolean;
            enableAuditLogging: boolean;
            enableRateLimiting: boolean;
            customRules?: Record<string, any>;
        };
        auth: {
            activeSessions: number;
        };
        scripts: {
            available: number;
        };
        audit: import("../index.js").AuditStatistics;
    }>;
}
export namespace FrameworkPresets {
    export { createDevelopmentFramework as development };
    export { createProductionFramework as production };
    export { createTestingFramework as testing };
    export { createBMADFramework as custom };
}
export { createValidatorSuite } from "../validators/index.js";
declare namespace _default {
    export { createBMADFramework as createFramework };
    export { FrameworkPresets as presets };
    export { BMADFramework };
}
export default _default;
export { initializeFramework, FRAMEWORK_VERSION, FRAMEWORK_NAME } from "../index.js";
export { createHookManager, HookRegistry } from "../hooks/index.js";
export { createScriptManager, compressAgents, compressManifest, buildModules } from "../scripts/index.js";
export { createAuthManager, RBACManager, quickAuth, requireAuth, requirePermission } from "../auth/index.js";
export { createAuditLogger, AuditEventBuilder, auditAuth, auditAccess, auditViolation } from "../audit/index.js";
//# sourceMappingURL=index.d.ts.map