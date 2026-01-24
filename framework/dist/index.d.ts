/**
 * BMAD Framework - Standardized Export Hub
 * ========================================
 *
 * Central export point for all BMAD framework features.
 * This module provides standardized access to validators, hooks,
 * scripts, authentication, and audit logging components.
 *
 * @version 1.0.0
 * @author Amelia (Dev) - Code Quality & Structure Specialist
 */
export * from './validators/index.js';
export * from './hooks/index.js';
export * from './scripts/index.js';
export * from './auth/index.js';
export * from './audit/index.js';
export * from './exports/index.js';
export declare const FRAMEWORK_VERSION = "1.0.0";
export declare const FRAMEWORK_NAME = "BMAD-CYBER2";
/**
 * Framework initialization function
 * Provides centralized configuration and setup
 */
export interface FrameworkConfig {
    enableValidation?: boolean;
    enableAuditLogging?: boolean;
    enableRBAC?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    outputPath?: string;
}
export declare function initializeFramework(config?: FrameworkConfig): {
    enableValidation: boolean;
    enableAuditLogging: boolean;
    enableRBAC: boolean;
    logLevel: "warn" | "info" | "error" | "debug";
    outputPath: string;
};
//# sourceMappingURL=index.d.ts.map