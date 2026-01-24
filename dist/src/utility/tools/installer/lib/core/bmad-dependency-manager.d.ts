export = BMADDependencyManager;
declare class BMADDependencyManager {
    constructor(options?: {});
    versionChecker: BMADVersionChecker;
    circularDetector: BMADCircularDetector;
    config: {
        bmadRoot: any;
        npmRegistry: any;
        maxRetries: any;
        timeout: any;
    };
    dependencyGraph: Map<any, any>;
    installationQueue: any[];
    resolvedDependencies: Map<any, any>;
    conflicts: any[];
    specializedTeams: Set<string>;
    packageInfoCache: Map<any, any>;
    resolutionCache: Map<any, any>;
    /**
     * Initialize the dependency manager
     */
    initialize(): Promise<boolean>;
    /**
     * Resolve dependencies for a module installation
     * @param {Object} moduleConfig - Module configuration with dependencies
     * @param {Object} installOptions - Installation options
     * @returns {Object} - Resolution result with installation plan
     */
    resolveDependencies(moduleConfig: Object, installOptions?: Object): Object;
    /**
     * Parse module configuration from various formats
     * @param {Object} moduleConfig - Raw module configuration
     * @returns {Object} - Standardized module configuration
     */
    parseModuleConfig(moduleConfig: Object): Object;
    /**
     * Extract BMAD core dependency requirements
     */
    extractBMADCoreDependency(config: any): {
        version: any;
        agents: any;
        workflows: any;
    };
    /**
     * Extract runtime dependencies (Node.js, NPM, etc.)
     */
    extractRuntimeDependencies(config: any): {
        node: {
            version: any;
            recommended: any;
        };
        npm: {
            version: any;
            recommended: any;
        };
    };
    /**
     * Extract NPM package dependencies
     */
    extractNPMDependencies(config: any): {
        production: any;
        development: any;
        optional: any;
    };
    /**
     * Extract cross-module dependencies
     */
    extractCrossModuleDependencies(config: any): {
        required: any;
        optional: any;
    };
    /**
     * Extract external system dependencies
     */
    extractExternalDependencies(config: any): {
        required: any;
        optional: any;
    };
    /**
     * Extract installation configuration
     */
    extractInstallationConfig(config: any): {
        phases: any;
        parallel: any;
        timeout: any;
    };
    /**
     * Build the complete dependency graph
     * @param {Object} parsedConfig - Parsed module configuration
     * @param {Object} options - Resolution options
     * @returns {Map} - Dependency graph
     */
    buildDependencyGraph(parsedConfig: Object, options?: Object): Map<any, any>;
    /**
     * Recursively build dependency graph
     */
    buildDependencyGraphRecursive(moduleConfig: any, graph: any, visited: any, processing: any, options: any): Promise<void>;
    /**
     * Create a standardized module ID
     */
    createModuleId(moduleName: any, version: any): string;
    /**
     * Load module configuration by name and version
     */
    loadModuleConfig(moduleName: any, version: any): Promise<any>;
    /**
     * Load module configuration from NPM registry
     */
    loadFromNPMRegistry(moduleName: any, version: any): Promise<{
        name: any;
        version: any;
        type: string;
        scope: string;
        bmadCore: {
            version: string;
            agents: string[];
            workflows: string[];
        };
        runtime: {
            node: {
                version: string;
            };
            npm: {
                version: string;
            };
        };
        npm: {
            production: never[];
            development: never[];
            optional: never[];
        };
        crossModule: {
            required: never[];
            optional: never[];
        };
        external: {
            required: never[];
            optional: never[];
        };
        installation: {
            phases: never[];
            parallel: boolean;
        };
        raw: {
            name: any;
            version: any;
        };
    } | null>;
    /**
     * Load module configuration from local cache
     */
    loadFromLocalCache(moduleName: any, version: any): Promise<Object | null>;
    /**
     * Load module configuration from BMAD registry
     */
    loadFromBMADRegistry(moduleName: any, version: any): Promise<null>;
    /**
     * Create mock configuration for specialized teams
     */
    createMockSpecializedTeamConfig(moduleName: any, version: any): {
        name: any;
        version: any;
        type: string;
        scope: string;
        bmadCore: {
            version: string;
            agents: string[];
            workflows: string[];
        };
        runtime: {
            node: {
                version: string;
            };
            npm: {
                version: string;
            };
        };
        npm: {
            production: never[];
            development: never[];
            optional: never[];
        };
        crossModule: {
            required: never[];
            optional: never[];
        };
        external: {
            required: never[];
            optional: never[];
        };
        installation: {
            phases: never[];
            parallel: boolean;
        };
        raw: {
            name: any;
            version: any;
        };
    };
    /**
     * Resolve version conflicts in the dependency graph
     */
    resolveVersionConflicts(dependencyGraph: any): Promise<Map<any, any>>;
    /**
     * Resolve a specific version conflict
     */
    resolveVersionConflict(moduleName: any, versions: any): {
        success: boolean;
        selectedNode: any;
        strategy: string;
        warning?: never;
        error?: never;
    } | {
        success: boolean;
        selectedNode: any;
        strategy: string;
        warning: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        selectedNode?: never;
        strategy?: never;
        warning?: never;
    };
    /**
     * Create installation plan with proper ordering
     */
    createInstallationPlan(dependencyGraph: any): {
        phases: never[];
        parallelGroups: never[];
        totalModules: any;
        estimatedTime: number;
    };
    /**
     * Create installation phases from sorted modules
     */
    createInstallationPhases(sortedModules: any, dependencyGraph: any): never[][];
    /**
     * Get human-readable phase label
     */
    getPhaseLabel(phaseIndex: any): string;
    /**
     * Check if a phase can run modules in parallel
     */
    canPhaseRunInParallel(phaseModules: any, dependencyGraph: any): boolean;
    /**
     * Estimate installation time for a phase
     */
    estimatePhaseTime(phaseModules: any): number;
    /**
     * Validate the complete installation plan
     */
    validateInstallationPlan(installationPlan: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
        checks: {
            dependencyOrder: boolean;
            versionCompatibility: boolean;
            circularDependencies: boolean;
            resourceRequirements: boolean;
        };
    }>;
    /**
     * Validate dependency ordering in installation plan
     */
    validateDependencyOrder(installationPlan: any): {
        valid: boolean;
        errors: never[];
    };
    /**
     * Validate version compatibility across all modules
     */
    validateVersionCompatibility(installationPlan: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
    }>;
    /**
     * Validate resource requirements
     */
    validateResourceRequirements(installationPlan: any): {
        valid: boolean;
        warnings: never[];
    };
    /**
     * Generate resolution statistics
     */
    generateResolutionStatistics(dependencyGraph: any): {
        totalModules: any;
        specializedTeams: number;
        coreModules: number;
        totalDependencies: number;
        averageDependenciesPerModule: number;
        conflictsResolved: number;
        circularDependencies: number;
    };
    /**
     * Execute the installation plan (integration with Amelia's framework)
     * @param {Object} installationPlan - The validated installation plan
     * @param {Object} options - Execution options
     * @returns {Object} - Execution result
     */
    executeInstallationPlan(installationPlan: Object, options?: Object): Object;
    /**
     * Execute a single installation phase
     */
    executePhase(phase: any, options?: {}): Promise<{
        success: boolean;
        installedModules: never[];
        failedModules: never[];
        warnings: never[];
    }>;
    /**
     * Install a single module (integration point with Amelia's installation framework)
     */
    installModule(moduleId: any, options?: {}): Promise<{
        success: boolean;
        installedPath: string;
        executionTime: number;
        error?: never;
    } | {
        success: boolean;
        error: any;
    }>;
    /**
     * Simulate module installation (placeholder for Amelia's integration)
     */
    simulateModuleInstallation(node: any, options?: {}): Promise<{
        success: boolean;
        error: string;
        installedPath?: never;
        executionTime?: never;
    } | {
        success: boolean;
        installedPath: string;
        executionTime: number;
        error?: never;
    }>;
    /**
     * Get dependency resolution summary
     */
    getResolutionSummary(): {
        dependencyGraph: Map<any, any>;
        conflicts: any[];
        resolvedDependencies: Map<any, any>;
        installationQueue: any[];
        cacheStats: {
            packageInfoCache: number;
            resolutionCache: number;
        };
    };
    /**
     * Clean up manager resources
     */
    cleanup(): void;
}
import BMADVersionChecker = require("./bmad-version-compatibility.js");
import BMADCircularDetector = require("./bmad-circular-detection.js");
//# sourceMappingURL=bmad-dependency-manager.d.ts.map