export = BMADConfigurationValidator;
declare class BMADConfigurationValidator {
    constructor(options?: {});
    config: {
        bmadRoot: any;
        validationRulesPath: any;
        strictMode: boolean;
        enableSecurityChecks: boolean;
        enablePerformanceChecks: boolean;
        maxValidationTime: any;
    };
    validationRules: Map<any, any>;
    customValidators: Map<any, any>;
    securityRules: Map<any, any>;
    performanceRules: Map<any, any>;
    teamValidationRules: Map<any, any>;
    validationContext: {
        startTime: null;
        currentRule: null;
        depth: number;
        maxDepth: number;
    };
    validationStats: {
        totalValidations: number;
        passedValidations: number;
        failedValidations: number;
        averageValidationTime: number;
        commonErrors: Map<any, any>;
    };
    /**
     * Initialize the validator
     */
    initialize(): Promise<boolean>;
    /**
     * Validate configuration comprehensively
     */
    validateConfiguration(config: any, context?: {}): Promise<{
        valid: boolean;
        score: number;
        errors: never[];
        warnings: never[];
        info: never[];
        checks: {
            structure: {
                passed: number;
                total: number;
                issues: never[];
            };
            content: {
                passed: number;
                total: number;
                issues: never[];
            };
            security: {
                passed: number;
                total: number;
                issues: never[];
            };
            performance: {
                passed: number;
                total: number;
                issues: never[];
            };
            compliance: {
                passed: number;
                total: number;
                issues: never[];
            };
            teamSpecific: {
                passed: number;
                total: number;
                issues: never[];
            };
        };
        metadata: {
            validatedAt: string;
            validationTime: number;
            validator: string;
            context: {};
        };
    }>;
    /**
     * Validate configuration structure
     */
    validateStructure(config: any, result: any, context: any): Promise<void>;
    /**
     * Validate configuration content
     */
    validateContent(config: any, result: any, context: any): Promise<void>;
    /**
     * Validate security aspects
     */
    validateSecurity(config: any, result: any, context: any): Promise<void>;
    /**
     * Validate performance aspects
     */
    validatePerformance(config: any, result: any, context: any): Promise<void>;
    /**
     * Validate compliance aspects
     */
    validateCompliance(config: any, result: any, context: any): Promise<void>;
    /**
     * Validate team-specific requirements
     */
    validateTeamSpecific(config: any, result: any, context: any): Promise<void>;
    /**
     * Calculate overall validation score
     */
    calculateValidationScore(result: any): void;
    /**
     * Finalize validation result
     */
    finalizeValidationResult(result: any): void;
    /**
     * Update validation statistics
     */
    updateValidationStatistics(result: any, startTime: any): void;
    /**
     * Load validation rules from file
     */
    loadValidationRules(): Promise<void>;
    /**
     * Initialize built-in validators
     */
    initializeBuiltinValidators(): Promise<void>;
    /**
     * Initialize security validators
     */
    initializeSecurityValidators(): Promise<void>;
    /**
     * Initialize performance validators
     */
    initializePerformanceValidators(): Promise<void>;
    /**
     * Initialize team-specific validators
     */
    initializeTeamSpecificValidators(): Promise<void>;
    /**
     * Validate team permissions against requirements
     */
    validateTeamPermissions(actualPermissions: any, requiredPermissions: any): boolean;
    /**
     * Validate a requirement against a value
     */
    validateRequirement(value: any, requirement: any): boolean;
    /**
     * Check if a path is valid
     */
    isValidPath(pathValue: any): boolean;
    /**
     * Check if a path is secure (not in system directories)
     */
    isSecurePath(pathValue: any): boolean;
    /**
     * Get nested value from object using dot notation
     */
    getNestedValue(obj: any, path: any): any;
    /**
     * Get validation statistics
     */
    getValidationStatistics(): {
        commonErrors: [any, any][];
        totalValidations: number;
        passedValidations: number;
        failedValidations: number;
        averageValidationTime: number;
    };
    /**
     * Get validator status
     */
    getStatus(): {
        initialized: boolean;
        validationRules: number;
        customValidators: number;
        securityRules: number;
        performanceRules: number;
        teamValidationRules: number;
        statistics: {
            commonErrors: [any, any][];
            totalValidations: number;
            passedValidations: number;
            failedValidations: number;
            averageValidationTime: number;
        };
        config: {
            bmadRoot: any;
            validationRulesPath: any;
            strictMode: boolean;
            enableSecurityChecks: boolean;
            enablePerformanceChecks: boolean;
            maxValidationTime: any;
        };
    };
}
//# sourceMappingURL=bmad-configuration-validator.d.ts.map