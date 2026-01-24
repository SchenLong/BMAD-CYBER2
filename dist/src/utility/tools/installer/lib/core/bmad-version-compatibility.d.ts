export = BMADVersionChecker;
declare class BMADVersionChecker {
    compatibilityMatrix: Map<any, any>;
    loadedModules: Map<any, any>;
    coreVersion: string | null;
    validationCache: Map<any, any>;
    /**
     * Initialize the version checker with current BMAD installation
     * @param {string} bmadRootPath - Path to BMAD installation root
     */
    initialize(bmadRootPath?: string): Promise<boolean>;
    /**
     * Detect the current BMAD core version
     * @param {string} bmadRootPath - Path to BMAD installation
     * @returns {string} - BMAD core version
     */
    detectBMADCoreVersion(bmadRootPath: string): string;
    /**
     * Load compatibility matrix from various sources
     */
    loadCompatibilityMatrix(): Promise<void>;
    /**
     * Scan for installed modules and their versions
     * @param {string} bmadRootPath - Path to BMAD installation
     */
    scanInstalledModules(bmadRootPath: string): Promise<void>;
    /**
     * Get module information from its configuration
     * @param {string} modulePath - Path to module directory
     * @returns {Object} - Module information
     */
    getModuleInfo(modulePath: string): Object;
    /**
     * Validate if a module version is compatible with current BMAD core
     * @param {string} moduleName - Name of the module
     * @param {string} moduleVersion - Version of the module
     * @param {Object} moduleDependencies - Module dependency requirements
     * @returns {Object} - Validation result
     */
    validateModuleCompatibility(moduleName: string, moduleVersion: string, moduleDependencies?: Object): Object;
    /**
     * Check if the current BMAD core version is compatible
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Compatibility result
     */
    checkCoreVersionCompatibility(moduleDependencies: Object): Object;
    /**
     * Check if required agents are available
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Agent availability result
     */
    checkRequiredAgents(moduleDependencies: Object): Object;
    /**
     * Check if required workflows are available
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Workflow availability result
     */
    checkRequiredWorkflows(moduleDependencies: Object): Object;
    /**
     * Check peer dependencies resolution
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Peer dependencies result
     */
    checkPeerDependencies(moduleDependencies: Object): Object;
    /**
     * Extract module name from full module identifier
     * @param {string} moduleIdentifier - Full module name (e.g., @bmad-cybercommand/cybersec-team)
     * @returns {string} - Clean module name
     */
    extractModuleName(moduleIdentifier: string): string;
    /**
     * Validate an entire dependency tree
     * @param {Object} dependencyTree - Dependency configuration
     * @returns {Object} - Comprehensive validation result
     */
    validateDependencyTree(dependencyTree: Object): Object;
    /**
     * Generate a detailed compatibility report
     * @returns {Object} - Comprehensive compatibility report
     */
    generateCompatibilityReport(): Object;
    /**
     * Check if a module can be safely upgraded
     * @param {string} moduleName - Name of the module
     * @param {string} targetVersion - Target version
     * @returns {Object} - Upgrade safety check result
     */
    checkUpgradeSafety(moduleName: string, targetVersion: string): Object;
}
//# sourceMappingURL=bmad-version-compatibility.d.ts.map