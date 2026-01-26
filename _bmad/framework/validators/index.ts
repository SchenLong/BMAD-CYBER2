/**
 * BMAD Validators - Security & Validation Framework
 * =================================================
 *
 * Exported validation suite providing comprehensive security checks,
 * data validation, and integrity monitoring for BMAD applications.
 *
 * This module exports the production-ready TypeScript validators
 * from .claude/validators-node with standardized interfaces.
 */

// Re-export all validator functionality
export * from '../../../.claude/validators-node/src/index.js';

// Additional standardized exports for framework integration
export {
  // Types
  type ValidationResult,
  type SecurityConfig,
  type AuditEvent
} from '../../../.claude/validators-node/src/types/index.js';

// Core validator classes
export {
  // Security Guards
  BashSafetyValidator,
  PIIValidator,
  SecretDetector,
  ProductionGuard,
  EnvProtector
} from '../../../.claude/validators-node/src/guards/index.js';

export {
  // AI Safety
  JailbreakDetector,
  PromptInjectionGuard,
  SessionTracker
} from '../../../.claude/validators-node/src/ai-safety/index.js';

export {
  // Observability
  AuditLogger,
  TelemetryCollector,
  AnomalyDetector,
  ConfidenceTracker
} from '../../../.claude/validators-node/src/observability/index.js';

export {
  // Permissions & RBAC
  TokenValidator,
  PluginPermissionManager,
  SupplyChainValidator
} from '../../../.claude/validators-node/src/permissions/index.js';

export {
  // Resource Management
  RateLimiter,
  RecursionGuard,
  ResourceLimiter,
  ContextManager
} from '../../../.claude/validators-node/src/resource-management/index.js';

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