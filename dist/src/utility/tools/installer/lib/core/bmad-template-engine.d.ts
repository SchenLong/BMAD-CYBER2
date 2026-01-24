export = BMADTemplateEngine;
declare class BMADTemplateEngine {
    constructor(options?: {});
    config: {
        bmadRoot: any;
        templatesPath: any;
        outputPath: any;
        enableBackup: boolean;
        enableValidation: boolean;
        mergeStrategy: any;
    };
    templates: Map<any, any>;
    environments: Map<any, any>;
    substitutionRules: Map<any, any>;
    validators: Map<any, any>;
    generationContext: {
        timestamp: Date;
        bmadVersion: string;
        templateVersion: string;
        environment: string;
        variables: Map<any, any>;
        computedValues: Map<any, any>;
    };
    specializedTeams: {
        'cybersec-team': {
            displayName: string;
            type: string;
            agentCount: number;
            workflowCount: number;
            keywords: string[];
            permissions: {
                network: boolean;
                shell: string[];
                sensitiveData: boolean;
            };
            outputTypes: string[];
        };
        'intel-team': {
            displayName: string;
            type: string;
            agentCount: number;
            workflowCount: number;
            keywords: string[];
            permissions: {
                network: boolean;
                shell: string[];
                sensitiveData: boolean;
            };
            outputTypes: string[];
        };
        'legal-team': {
            displayName: string;
            type: string;
            agentCount: number;
            workflowCount: number;
            keywords: string[];
            permissions: {
                network: boolean;
                shell: string[];
                sensitiveData: boolean;
            };
            outputTypes: string[];
        };
        'strategy-team': {
            displayName: string;
            type: string;
            agentCount: number;
            workflowCount: number;
            keywords: string[];
            permissions: {
                network: boolean;
                shell: string[];
                sensitiveData: boolean;
            };
            outputTypes: string[];
        };
    };
    /**
     * Initialize the template engine
     */
    initialize(): Promise<boolean>;
    /**
     * Generate configuration for a specialized team module
     */
    generateTeamConfiguration(teamCode: any, options?: {}): Promise<{
        success: boolean;
        teamCode: any;
        configuration: any;
        outputFiles: {
            path: string;
            type: string;
        }[];
        generationTime: number;
        context: {
            teamCode: any;
            teamConfig: any;
            options: any;
            timestamp: Date;
            variables: Map<any, any>;
            bmadVersion: string;
            templateVersion: string;
            environment: string;
            computedValues: Map<any, any>;
        };
        validation: {
            valid: boolean;
            errors: never[];
            warnings: never[];
            checks: {
                required_fields: boolean;
                team_specific_config: boolean;
                dependencies_valid: boolean;
                permissions_secure: boolean;
                paths_valid: boolean;
            };
            score: number;
        } | null;
        error?: never;
    } | {
        success: boolean;
        teamCode: any;
        error: any;
        generationTime: number;
        configuration?: never;
        outputFiles?: never;
        context?: never;
        validation?: never;
    }>;
    /**
     * Prepare generation context with team and environment variables
     */
    prepareGenerationContext(teamCode: any, options: any): {
        teamCode: any;
        teamConfig: any;
        options: any;
        timestamp: Date;
        variables: Map<any, any>;
        bmadVersion: string;
        templateVersion: string;
        environment: string;
        computedValues: Map<any, any>;
    };
    /**
     * Apply team-specific customizations to base template
     */
    applyTeamCustomizations(baseTemplate: any, teamCode: any, context: any): any;
    /**
     * Generate team-specific dependencies
     */
    generateTeamDependencies(teamCode: any): {
        core: {
            module: string;
            version: string;
            required: boolean;
            agents: string[];
            workflows: string[];
        }[];
        peer_dependencies: never[];
    };
    /**
     * Generate team-specific integration points
     */
    generateTeamIntegration(teamCode: any): any;
    /**
     * Generate installation prompts for team
     */
    generateInstallationPrompts(teamCode: any, teamConfig: any): any[];
    /**
     * Get team-specific agent lists
     */
    getTeamAgentLists(teamCode: any): any;
    /**
     * Get additional team information
     */
    getAdditionalTeamInfo(teamCode: any): any;
    /**
     * Perform variable substitution on template
     */
    performVariableSubstitution(template: any, context: any): any;
    /**
     * Substitute variables in a string
     */
    substituteString(str: any, variables: any, computedValues: any): any;
    /**
     * Compute derived values from context
     */
    computeDerivedValues(context: any): Map<any, any>;
    /**
     * Apply environment-specific configurations
     */
    applyEnvironmentConfig(template: any, environmentName?: string): any;
    /**
     * Handle configuration merging with existing configs
     */
    handleConfigurationMerging(newConfig: any, teamCode: any, mergeStrategy?: string): Promise<any>;
    /**
     * Smart merge strategy that preserves user customizations
     */
    smartMerge(existing: any, incoming: any): any;
    /**
     * Detect changes between configurations
     */
    detectChanges(oldConfig: any, newConfig: any): {
        type: string;
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    /**
     * Deep merge two objects
     */
    deepMerge(target: any, source: any): any;
    /**
     * Generate output files for configuration
     */
    generateOutputFiles(config: any, teamCode: any, options: any): Promise<{
        files: {
            path: string;
            type: string;
        }[];
        outputDir: string;
    }>;
    /**
     * Validate generated configuration
     */
    validateConfiguration(config: any, teamCode: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
        checks: {
            required_fields: boolean;
            team_specific_config: boolean;
            dependencies_valid: boolean;
            permissions_secure: boolean;
            paths_valid: boolean;
        };
        score: number;
    }>;
    /**
     * Create backup of current configuration
     */
    createConfigurationBackup(teamCode: any, config: any): Promise<string>;
    /**
     * Load built-in templates
     */
    loadBuiltInTemplates(): Promise<void>;
    /**
     * Create minimal base template as fallback
     */
    createMinimalBaseTemplate(): {
        code: string;
        name: string;
        version: string;
        default_selected: boolean;
        type: string;
        category: string;
        npm: {
            scope: string;
            package_name: string;
            full_name: string;
        };
        agents: {
            count: string;
            conversion_format: string;
            source_path: string;
            target_path: string;
        };
        workflows: {
            count: string;
            conversion_format: string;
            source_path: string;
            target_path: string;
        };
        output_folder: {
            prompt: string;
            default: string;
            result: string;
        };
        module_code: {
            result: string;
        };
    };
    /**
     * Load environment configurations
     */
    loadEnvironmentConfigs(): Promise<void>;
    /**
     * Initialize substitution rules
     */
    initializeSubstitutionRules(): void;
    /**
     * Initialize validators
     */
    initializeValidators(): void;
    /**
     * Validate permissions for security
     */
    validatePermissions(permissions: any, teamCode: any): boolean;
    /**
     * Validate configuration paths
     */
    validatePaths(config: any): boolean;
    /**
     * Generate installation script
     */
    generateInstallationScript(config: any, teamCode: any): string;
    /**
     * Ensure required directories exist
     */
    ensureDirectories(): Promise<void>;
    /**
     * Generate unique ID
     */
    generateId(): string;
    /**
     * Get template engine status
     */
    getStatus(): {
        initialized: boolean;
        templatesLoaded: number;
        environmentsLoaded: number;
        specializedTeams: string[];
        config: {
            bmadRoot: any;
            templatesPath: any;
            outputPath: any;
            enableBackup: boolean;
            enableValidation: boolean;
            mergeStrategy: any;
        };
    };
}
//# sourceMappingURL=bmad-template-engine.d.ts.map