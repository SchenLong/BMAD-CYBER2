export = BMADCircularDetector;
declare class BMADCircularDetector {
    dependencyGraph: Map<any, any>;
    visited: Set<any>;
    recursionStack: Set<any>;
    cycles: any[];
    stronglyConnectedComponents: any[];
    resolutionStrategies: any[];
    maxDepth: number;
    enableTarjanAlgorithm: boolean;
    enableResolutionSuggestions: boolean;
    /**
     * Initialize the circular detector
     */
    initialize(): void;
    /**
     * Detect circular dependencies in a dependency graph
     * @param {Map} dependencyGraph - Map of module dependencies
     * @returns {Object} - Detection result with cycles and resolution suggestions
     */
    detectCircularDependencies(dependencyGraph: Map<any, any>): Object;
    /**
     * Detect cycles using Depth-First Search
     * @param {string} moduleId - Current module ID
     * @param {Array} path - Current path in the graph
     * @param {number} depth - Current recursion depth
     */
    detectCyclesDFS(moduleId: string, path: any[], depth?: number): void;
    /**
     * Find strongly connected components using Tarjan's algorithm
     */
    findStronglyConnectedComponents(): void;
    /**
     * Calculate the severity of a cycle
     * @param {Array} cycle - Array of module IDs in the cycle
     * @returns {string} - Severity level
     */
    calculateCycleSeverity(cycle: any[]): string;
    /**
     * Check if a module is critical (core BMAD modules)
     * @param {string} moduleId - Module identifier
     * @returns {boolean} - True if module is critical
     */
    isCriticalModule(moduleId: string): boolean;
    /**
     * Generate resolution strategies for detected cycles
     * @returns {Array} - Array of resolution strategies
     */
    generateResolutionStrategies(): any[];
    /**
     * Generate resolution strategies for a specific cycle
     * @param {Object} cycle - Cycle information
     * @returns {Array} - Array of strategies for this cycle
     */
    generateCycleResolutionStrategies(cycle: Object): any[];
    /**
     * Find optional dependencies in a cycle
     * @param {Object} cycle - Cycle information
     * @returns {Array} - Array of potentially optional dependencies
     */
    findOptionalDependencies(cycle: Object): any[];
    /**
     * Find large modules in a cycle that could benefit from splitting
     * @param {Object} cycle - Cycle information
     * @returns {Array} - Array of large modules
     */
    findLargeModulesInCycle(cycle: Object): any[];
    /**
     * Check if a cycle can benefit from event-driven architecture
     * @param {Object} cycle - Cycle information
     * @returns {boolean} - True if event-driven approach is suitable
     */
    canUseEventDriven(cycle: Object): boolean;
    /**
     * Validate an installation plan for circular dependencies
     * @param {Object} installationPlan - Installation plan to validate
     * @returns {Object} - Validation result
     */
    validateInstallationPlan(installationPlan: Object): Object;
    /**
     * Build dependency graph from installation plan
     * @param {Object} installationPlan - Installation plan
     * @returns {Map} - Dependency graph
     */
    buildGraphFromInstallationPlan(installationPlan: Object): Map<any, any>;
    /**
     * Detect conflicts within a single installation phase
     * @param {Object} phase - Installation phase
     * @param {Map} planGraph - Installation plan dependency graph
     * @returns {Array} - Array of conflicts
     */
    detectPhaseConflicts(phase: Object, planGraph: Map<any, any>): any[];
    /**
     * Detect dependency ordering violations in installation plan
     * @param {Object} installationPlan - Installation plan
     * @param {Map} planGraph - Installation plan dependency graph
     * @returns {Array} - Array of violations
     */
    detectOrderingViolations(installationPlan: Object, planGraph: Map<any, any>): any[];
    /**
     * Generate graph statistics
     * @returns {Object} - Graph statistics
     */
    generateGraphStatistics(): Object;
    /**
     * Log detected cycles to console
     */
    logCycles(): void;
    /**
     * Export detected cycles to a file
     * @param {string} outputPath - Output file path
     * @param {string} format - Export format ('json' or 'yaml')
     */
    exportCycles(outputPath: string, format?: string): Promise<void>;
    /**
     * Clear internal state
     */
    reset(): void;
    /**
     * Get detection summary
     * @returns {Object} - Summary of detection results
     */
    getSummary(): Object;
    /**
     * Get severity breakdown of detected cycles
     * @returns {Object} - Count of cycles by severity
     */
    getSeverityBreakdown(): Object;
}
//# sourceMappingURL=bmad-circular-detection.d.ts.map