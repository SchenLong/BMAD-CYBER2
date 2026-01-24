export = ConflictDetector;
/**
 * Conflict Detection Engine
 * Identifies and categorizes conflicts across multiple domains
 */
declare class ConflictDetector {
    constructor(options?: {});
    options: {
        strictMode: boolean;
        caseSensitive: any;
        checkAgentNames: boolean;
        checkWorkflowIds: boolean;
        checkFilePaths: boolean;
        checkPartyModePresets: boolean;
    };
    globalAgentRegistry: Map<any, any> | null;
    globalWorkflowRegistry: Map<any, any> | null;
    existingFilePaths: any[] | null;
    partyModePresets: any[] | null;
    /**
     * Check for agent name conflicts
     * @param {Map} moduleGraph - Dependency graph with module information
     * @returns {Promise<Array>} Array of agent name conflicts
     */
    checkAgentConflicts(moduleGraph: Map<any, any>): Promise<any[]>;
    /**
     * Check for workflow ID conflicts
     * @param {Map} moduleGraph - Dependency graph with module information
     * @returns {Promise<Array>} Array of workflow conflicts
     */
    checkWorkflowConflicts(moduleGraph: Map<any, any>): Promise<any[]>;
    /**
     * Check for file path conflicts
     * @param {Map} moduleGraph - Dependency graph with module information
     * @returns {Promise<Array>} Array of path conflicts
     */
    checkPathConflicts(moduleGraph: Map<any, any>): Promise<any[]>;
    /**
     * Check party mode preset conflicts
     * @param {Map} moduleGraph - Dependency graph with module information
     * @returns {Promise<Array>} Array of preset conflicts
     */
    checkPartyModeConflicts(moduleGraph: Map<any, any>): Promise<any[]>;
    /**
     * Normalize agent name for comparison
     */
    normalizeAgentName(name: any): any;
    /**
     * Validate workflow namespace
     */
    validateWorkflowNamespace(workflowId: any, moduleName: any): {
        valid: boolean;
        message: string;
    } | {
        valid: boolean;
        message?: never;
    };
    /**
     * Normalize file path for comparison
     */
    normalizePath(filePath: any): string;
    /**
     * Determine path conflict type
     */
    determinePathConflictType(newPath: any, existingPath: any): "exact_match" | "parent_child" | "child_parent" | "same_directory" | "no_conflict";
    /**
     * Get path conflict severity
     */
    getPathConflictSeverity(conflictType: any): "critical" | "error" | "warning" | "info";
    /**
     * Get path resolution options
     */
    getPathResolutionOptions(conflictType: any): string[];
    loadGlobalRegistries(): Promise<void>;
    loadFilePaths(): Promise<void>;
    loadPartyModePresets(): Promise<void>;
    loadGlobalAgentRegistry(): Promise<Map<any, any>>;
    loadGlobalWorkflowRegistry(): Promise<Map<any, any>>;
    loadExistingFilePaths(): Promise<never[]>;
    loadPartyModePresetData(): Promise<never[]>;
    extractModulePaths(moduleInfo: any): Promise<{
        path: any;
        type: string;
    }[]>;
    extractRequiredAgents(preset: any): any;
    moduleAffectsPreset(moduleInfo: any, preset: any): boolean;
}
//# sourceMappingURL=conflict-detector.d.ts.map