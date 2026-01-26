/**
 * BMAD Validators - Security & Validation Framework
 * =================================================
 *
 * Exported validation suite providing comprehensive security checks,
 * data validation, and integrity monitoring for BMAD applications.
 *
 * This module re-exports the production-ready TypeScript validators
 * from @bmad/validators with standardized interfaces.
 */

// Re-export all validator functionality from the @bmad/validators package
export * from '@bmad/validators';

/**
 * Validator Suite Configuration
 * Provides unified configuration for all validators
 */
export interface ValidatorSuiteConfig {
  enablePIIDetection?: boolean;
  enableBashSafety?: boolean;
  enableSecretDetection?: boolean;
  enablePromptInjectionGuard?: boolean;
  enableAuditLogging?: boolean;
  enableRateLimiting?: boolean;
  customRules?: Record<string, any>;
}

/**
 * Initialize complete validator suite with unified configuration
 */
export function createValidatorSuite(config: ValidatorSuiteConfig = {}) {
  return {
    config: {
      enablePIIDetection: true,
      enableBashSafety: true,
      enableSecretDetection: true,
      enablePromptInjectionGuard: true,
      enableAuditLogging: true,
      enableRateLimiting: true,
      ...config
    },
    validators: {
      // Initialize validators based on config
      // Implementation would create configured instances
    }
  };
}