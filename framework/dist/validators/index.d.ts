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
export * from '../../.claude/validators-node/src/index.js';
export { type ValidationResult, type SecurityConfig, type AuditEvent } from '../../.claude/validators-node/src/types/index.js';
export { BashSafetyValidator, PIIValidator, SecretDetector, ProductionGuard, EnvProtector } from '../../.claude/validators-node/src/guards/index.js';
export { JailbreakDetector, PromptInjectionGuard, SessionTracker } from '../../.claude/validators-node/src/ai-safety/index.js';
export { AuditLogger, TelemetryCollector, AnomalyDetector, ConfidenceTracker } from '../../.claude/validators-node/src/observability/index.js';
export { TokenValidator, PluginPermissionManager, SupplyChainValidator } from '../../.claude/validators-node/src/permissions/index.js';
export { RateLimiter, RecursionGuard, ResourceLimiter, ContextManager } from '../../.claude/validators-node/src/resource-management/index.js';
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
export declare function createValidatorSuite(config?: ValidatorSuiteConfig): {
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
//# sourceMappingURL=index.d.ts.map