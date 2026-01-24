/**
 * Initialize complete validator suite with unified configuration
 */
export function createValidatorSuite(config?: {}): {
    config: {
        enablePIIDetection: boolean;
        enableBashSafety: boolean;
        enableSecretDetection: boolean;
        enablePromptInjectionGuard: boolean;
        enableAuditLogging: boolean;
        enableRateLimiting: boolean;
    };
    validators: {};
};
//# sourceMappingURL=index.d.ts.map