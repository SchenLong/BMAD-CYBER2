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

// Namespace exports to avoid conflicts
export * as validators from './validators/index.js';
export * as hooks from './hooks/index.js';
export * as scripts from './scripts/index.js';
export * as auth from './auth/index.js';
export * as audit from './audit/index.js';

// Utility exports (these have their own BMADFramework class)
export * from './exports/index.js';

// Version and metadata
export const FRAMEWORK_VERSION = '1.0.0';
export const FRAMEWORK_NAME = 'BMAD-CYBER2';

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

export function initializeFramework(config: FrameworkConfig = {}) {
  const defaultConfig: Required<FrameworkConfig> = {
    enableValidation: true,
    enableAuditLogging: true,
    enableRBAC: true,
    logLevel: 'info',
    outputPath: './bmad-output'
  };

  return { ...defaultConfig, ...config };
}