export = DependencyValidator;
/**
 * Dependency Validation and Resolution Engine
 * Handles complex dependency graphs, version conflicts, and compatibility checks
 */
declare class DependencyValidator {
    constructor(options?: {});
    options: {
        strictValidation: boolean;
        allowPrerelease: any;
        compatibilityMatrixPath: any;
        coreModulePath: any;
    };
    compatibilityMatrix: any;
    installedModules: any[] | null;
    coreVersion: string | null;
    /**
     * Validate dependency graph for a set of modules
     * @param {Map} moduleGraph - Map of module names to module info
     * @returns {Promise<ValidationResult>} Validation result with any issues
     */
    validateGraph(moduleGraph: Map<any, any>): Promise<ValidationResult>;
    /**
     * Resolve version conflicts in dependency graph
     * @param {Map} moduleGraph - Module dependency graph
     * @returns {Promise<Map>} Resolved dependency graph
     */
    resolveConflicts(moduleGraph: Map<any, any>): Promise<Map<any, any>>;
    /**
     * Load dependency-related data
     */
    loadDependencyData(): Promise<void>;
    /**
     * Validate dependencies for a single module
     * @param {string} moduleName - Name of the module
     * @param {Object} moduleInfo - Module information
     * @param {Map} moduleGraph - Complete module graph for context
     * @returns {Promise<ValidationResult>} Module-specific validation result
     */
    validateModuleDependencies(moduleName: string, moduleInfo: Object, moduleGraph: Map<any, any>): Promise<ValidationResult>;
    /**
     * Validate BMAD core dependency
     */
    validateCoreDependency(moduleInfo: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Validate peer dependencies
     */
    validatePeerDependencies(moduleInfo: any, moduleGraph: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Validate against compatibility matrix
     */
    validateCompatibility(moduleName: any, moduleInfo: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Detect circular dependencies in module graph
     */
    detectCircularDependencies(moduleGraph: any): Promise<any[]>;
    /**
     * Calculate optimal installation order based on dependencies
     */
    calculateInstallationOrder(moduleGraph: any): Promise<any[]>;
    /**
     * Detect version conflicts between modules
     */
    detectVersionConflicts(moduleGraph: any): Promise<{
        type: string;
        requestingModule: any;
        dependencyModule: any;
        requiredVersion: any;
        actualVersion: any;
        severity: string;
    }[]>;
    /**
     * Resolve a version conflict
     */
    resolveVersionConflict(conflict: any, moduleGraph: any): Promise<{
        type: string;
        module: any;
        fromVersion: any;
        toVersion: any;
        reason: string;
        conflict?: never;
        alternatives?: never;
    } | {
        type: string;
        conflict: any;
        reason: string;
        module?: never;
        fromVersion?: never;
        toVersion?: never;
        alternatives?: never;
    } | {
        type: string;
        module: any;
        alternatives: any[];
        reason: string;
        fromVersion?: never;
        toVersion?: never;
        conflict?: never;
    } | null>;
    /**
     * Merge validation results
     */
    mergeValidationResults(target: any, source: any): void;
    loadCompatibilityMatrix(): Promise<null>;
    loadInstalledModules(): Promise<never[]>;
    getBmadCoreVersion(): Promise<string>;
    checkRequiredAgents(agents: any): Promise<never[]>;
    checkRequiredWorkflows(workflows: any): Promise<never[]>;
    evaluateCondition(condition: any, moduleGraph: any): Promise<boolean>;
    checkCompatibilityEntry(module1: any, version1: any, module2: any, version2: any, compatibility: any): Promise<{
        compatible: boolean;
        warnings: never[];
    }>;
    findCompatibleVersions(moduleName: any, moduleGraph: any): Promise<never[]>;
    canDowngradeConflict(conflict: any, moduleGraph: any): Promise<boolean>;
    findAlternativeVersions(moduleName: any): Promise<never[]>;
    applyResolution(moduleGraph: any, resolution: any): void;
}
//# sourceMappingURL=dependency-validator.d.ts.map