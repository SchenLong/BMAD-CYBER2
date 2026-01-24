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
// Core Framework Exports
export * from './validators/index.js';
export * from './hooks/index.js';
export * from './scripts/index.js';
export * from './auth/index.js';
export * from './audit/index.js';
// Utility exports
export * from './exports/index.js';
// Version and metadata
export const FRAMEWORK_VERSION = '1.0.0';
export const FRAMEWORK_NAME = 'BMAD-CYBER2';
export function initializeFramework(config = {}) {
    const defaultConfig = {
        enableValidation: true,
        enableAuditLogging: true,
        enableRBAC: true,
        logLevel: 'info',
        outputPath: './bmad-output'
    };
    return { ...defaultConfig, ...config };
}
//# sourceMappingURL=index.js.map