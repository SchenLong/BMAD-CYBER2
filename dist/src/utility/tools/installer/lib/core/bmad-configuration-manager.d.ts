export = BMADConfigurationManager;
declare class BMADConfigurationManager {
    constructor(options?: {});
    config: {
        bmadRoot: any;
        environmentsPath: any;
        configCachePath: any;
        enableCache: boolean;
        cacheTimeout: any;
    };
    contextLayers: Map<string, Map<any, any>>;
    environments: Map<any, any>;
    configCache: Map<any, any>;
    variableResolvers: Map<any, any>;
    mergeStrategies: Map<any, any>;
    /**
     * Initialize the configuration manager
     */
    initialize(): Promise<boolean>;
    /**
     * Process configuration with full variable substitution and environment handling
     */
    processConfiguration(config: any, context?: {}): Promise<{
        success: boolean;
        configuration: any;
        processingContext: any;
        processingTime: number;
        cacheUsed: boolean;
        error?: never;
    } | {
        success: boolean;
        error: any;
        processingTime: number;
        configuration?: never;
        processingContext?: never;
        cacheUsed?: never;
    }>;
    /**
     * Prepare comprehensive processing context
     */
    prepareProcessingContext(inputContext: any): Promise<any>;
    /**
     * Load variables into the context hierarchy
     */
    loadContextVariables(context: any): Promise<void>;
    /**
     * Load project-specific variables from package.json
     */
    loadProjectVariables(projectVars: any, projectRoot: any): Promise<void>;
    /**
     * Load user-specific variables
     */
    loadUserVariables(userVars: any, username: any): Promise<void>;
    /**
     * Resolve variable context by merging hierarchy layers
     */
    resolveVariableContext(processingContext: any): Promise<any>;
    /**
     * Apply environment-specific configuration
     */
    applyEnvironmentConfiguration(config: any, context: any): Promise<any>;
    /**
     * Perform advanced variable substitution with support for:
     * - Simple variables: {VAR}
     * - Nested variables: {PARENT.CHILD}
     * - Function calls: {function(args)}
     * - Conditional expressions: {VAR ? value1 : value2}
     * - Default values: {VAR || default}
     */
    performAdvancedSubstitution(config: any, context: any): Promise<any>;
    /**
     * Recursive substitution with cycle detection
     */
    recursiveSubstitution(obj: any, context: any): any;
    /**
     * Advanced string substitution with multiple pattern support
     */
    substituteString(str: any, context: any): any;
    /**
     * Resolve nested variable paths like PARENT.CHILD
     */
    resolveNestedVariable(path: any, context: any): any;
    /**
     * Parse function arguments
     */
    parseArguments(argsString: any, context: any): any[];
    /**
     * Get substitution functions
     */
    getSubstitutionFunctions(context: any): Map<any, any>;
    /**
     * Evaluate simple conditions
     */
    evaluateSimpleCondition(condition: any, context: any): boolean;
    /**
     * Apply conditional configuration blocks
     */
    applyConditionalConfigurations(config: any, context: any): Promise<any>;
    /**
     * Evaluate complex conditions
     */
    evaluateCondition(condition: any, context: any): Promise<boolean>;
    /**
     * Finalize configuration with validation and cleanup
     */
    finalizeConfiguration(config: any, context: any): Promise<any>;
    /**
     * Initialize built-in variable resolvers
     */
    initializeBuiltinResolvers(): void;
    /**
     * Initialize merge strategies
     */
    initializeMergeStrategies(): void;
    /**
     * Smart merge that preserves user customizations
     */
    smartMerge(existing: any, incoming: any): any;
    /**
     * Additive merge - only adds new fields
     */
    additiveMerge(existing: any, incoming: any): any;
    /**
     * Deep merge utility
     */
    deepMerge(target: any, source: any): any;
    /**
     * Load system variables
     */
    loadSystemVariables(): Promise<void>;
    /**
     * Load environment configurations
     */
    loadEnvironmentConfigurations(): Promise<void>;
    /**
     * Validate final configuration
     */
    validateFinalConfiguration(config: any, context: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Cache processed configuration
     */
    cacheConfiguration(config: any, context: any): Promise<void>;
    /**
     * Load configuration cache
     */
    loadConfigurationCache(): Promise<void>;
    /**
     * Generate cache key for context
     */
    generateCacheKey(context: any): string;
    /**
     * Ensure required directories exist
     */
    ensureDirectories(): Promise<void>;
    /**
     * Get configuration manager status
     */
    getStatus(): {
        initialized: boolean;
        environments: any[];
        variableResolvers: any[];
        mergeStrategies: any[];
        cacheSize: number;
        config: {
            bmadRoot: any;
            environmentsPath: any;
            configCachePath: any;
            enableCache: boolean;
            cacheTimeout: any;
        };
    };
    /**
     * Clear configuration cache
     */
    clearCache(): Promise<void>;
}
//# sourceMappingURL=bmad-configuration-manager.d.ts.map