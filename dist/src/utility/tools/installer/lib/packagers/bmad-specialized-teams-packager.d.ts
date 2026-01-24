#!/usr/bin/env node
export = BMAdModulePackager;
/**
 * Main Module Packaging Engine
 * Handles automated packaging for any BMAD module following bmad-builder format
 */
declare class BMAdModulePackager {
    constructor(options?: {});
    options: {
        sourceRoot: any;
        outputRoot: any;
        verbose: any;
        validateOnly: any;
    };
    packageConfig: {
        name: string;
        version: string;
        description: string;
        keywords: string[];
        license: string;
        repository: {
            type: string;
            url: string;
        };
        author: string;
        maintainers: {
            name: string;
            email: string;
        }[];
    };
    specializedTeams: {
        'cybersec-team': {
            displayName: string;
            description: string;
            keywords: string[];
            expectedAgents: number;
            expectedWorkflows: number;
        };
        'intel-team': {
            displayName: string;
            description: string;
            keywords: string[];
            expectedAgents: number;
            expectedWorkflows: number;
        };
        'legal-team': {
            displayName: string;
            description: string;
            keywords: string[];
            expectedAgents: number;
            expectedWorkflows: number;
        };
        'strategy-team': {
            displayName: string;
            description: string;
            keywords: string[];
            expectedAgents: number;
            expectedWorkflows: number;
        };
    };
    validationResults: {
        errors: never[];
        warnings: never[];
        summary: {};
    };
    /**
     * Main packaging entry point
     * Packages all specialized team modules or a specific team
     */
    packageModules(teamFilter?: null): Promise<{
        timestamp: string;
        validation_results: {
            errors: never[];
            warnings: never[];
            summary: {};
        };
        teams_validated: string[];
        status: string;
    } | {
        timestamp: string;
        packager_version: string;
        teams_packaged: string[];
        output_location: any;
        validation: {
            errors: never[];
            warnings: never[];
            summary: {};
        };
        success: boolean;
    }>;
    /**
     * Validate source modules before packaging
     */
    validateSources(teamFilter?: null): Promise<void>;
    /**
     * Validate individual team source structure
     */
    validateTeamSource(teamCode: any): Promise<void>;
    /**
     * Validate module.yaml structure
     */
    validateModuleYaml(teamCode: any, teamPath: any): Promise<void>;
    /**
     * Validate agents directory and count
     */
    validateAgents(teamCode: any, teamPath: any, expectedCount: any): Promise<void>;
    /**
     * Validate individual agent file structure
     */
    validateAgentStructure(teamCode: any, agentFilePath: any): Promise<void>;
    /**
     * Validate workflows directory and count
     */
    validateWorkflows(teamCode: any, teamPath: any, expectedCount: any): Promise<void>;
    /**
     * Prepare distribution repository structure
     */
    prepareDistributionStructure(): Promise<void>;
    /**
     * Package individual team module
     */
    packageTeamModule(teamCode: any): Promise<void>;
    /**
     * Convert agents from MD to .agent.yaml format
     */
    convertAndCopyAgents(teamCode: any, sourcePath: any, targetPath: any): Promise<void>;
    /**
     * Convert single agent file from MD to YAML
     */
    convertAgentToYaml(sourceFile: any, targetFile: any, teamCode: any): Promise<void>;
    /**
     * Parse markdown agent file and extract structured data
     */
    parseMarkdownAgent(content: any, teamCode: any): {
        agent: {
            metadata: {
                id: any;
                name: any;
                title: any;
                description: any;
                icon: any;
                team: any;
                version: string;
                created: string;
                format_version: string;
            };
            persona: {
                identity: string | string[];
                role: string | string[];
                communication_style: string | string[];
                principles: string | string[];
            };
            activation: {
                critical: boolean;
                steps: {
                    number: number;
                    content: string;
                    critical: boolean;
                }[];
            };
            menu: {
                items: {
                    id: number;
                    name: string;
                    command: string;
                    description: string;
                }[];
            };
            menu_handlers: {
                handlers: {
                    exec: {
                        description: string;
                        pattern: string;
                        action: string;
                    };
                    workflow: {
                        description: string;
                        pattern: string;
                        action: string;
                    };
                    action: {
                        description: string;
                        pattern: string;
                        action: string;
                    };
                };
            };
            rules: {
                security: string[];
                operational: string[];
                communication: string[];
            };
            extraction: {
                source_format: string;
                source_file: string;
                conversion_date: string;
                bmad_builder_compatible: boolean;
            };
            config: {
                paths: {
                    config_file: string;
                    workflows_path: string;
                    output_folder: string;
                };
                variables: {
                    user_name: string;
                    communication_language: string;
                    output_folder: string;
                };
            };
        };
    };
    /**
     * Extract XML attribute value
     */
    extractXmlAttribute(xmlContent: any, attributeName: any): any;
    /**
     * Extract persona section from content
     */
    extractPersonaSection(content: any, sectionType: any): string[] | "Specialized team agent with expert knowledge and professional demeanor" | "Expert consultant and operational specialist" | "Clear, professional, and action-oriented communication style" | null;
    /**
     * Extract activation steps from XML content
     */
    extractActivationSteps(xmlContent: any): {
        number: number;
        content: string;
        critical: boolean;
    }[];
    /**
     * Extract menu items from content
     */
    extractMenuItems(content: any): {
        id: number;
        name: string;
        command: string;
        description: string;
    }[];
    /**
     * Extract menu handlers from XML content
     */
    extractMenuHandlers(xmlContent: any): {
        exec: {
            description: string;
            pattern: string;
            action: string;
        };
        workflow: {
            description: string;
            pattern: string;
            action: string;
        };
        action: {
            description: string;
            pattern: string;
            action: string;
        };
    };
    /**
     * Extract security rules from content
     */
    extractSecurityRules(content: any): string[];
    /**
     * Extract operational rules from content
     */
    extractOperationalRules(content: any): string[];
    /**
     * Extract communication rules from content
     */
    extractCommunicationRules(content: any): string[];
    /**
     * Convert and copy workflows
     */
    convertAndCopyWorkflows(teamCode: any, sourcePath: any, targetPath: any): Promise<void>;
    /**
     * Convert workflow MD to YAML format
     */
    convertWorkflowToYaml(workflowMdPath: any, targetWorkflowPath: any, teamCode: any): Promise<void>;
    /**
     * Copy team assets (tools, data, etc.)
     */
    copyTeamAssets(teamCode: any, sourcePath: any, targetPath: any): Promise<void>;
    /**
     * Copy directory recursively
     */
    copyDirectory(source: any, target: any): Promise<void>;
    /**
     * Generate distribution module.yaml for team
     */
    generateDistributionModuleYaml(teamCode: any, teamConfig: any, targetPath: any): Promise<void>;
    /**
     * Generate meta-package files
     */
    generateMetaPackageFiles(): Promise<void>;
    /**
     * Generate main README.md
     */
    generateReadme(): Promise<void>;
    /**
     * Generate CONTRIBUTING.md
     */
    generateContributing(): Promise<void>;
    /**
     * Generate SECURITY.md
     */
    generateSecurity(): Promise<void>;
    /**
     * Generate sample usage files
     */
    generateSamples(): Promise<void>;
    /**
     * Initialize Git repository for distribution
     */
    initializeGitRepository(): Promise<void>;
    /**
     * Generate .gitignore file
     */
    generateGitignore(): Promise<void>;
    /**
     * Generate GitHub workflow files
     */
    generateGitHubWorkflows(): Promise<void>;
    /**
     * Generate NPM package.json files
     */
    generatePackageJsonFiles(): Promise<void>;
    /**
     * Generate main package.json
     */
    generateMainPackageJson(): Promise<void>;
    /**
     * Generate individual team package.json
     */
    generateTeamPackageJson(teamCode: any): Promise<void>;
    /**
     * Generate validation report
     */
    generateValidationReport(): {
        timestamp: string;
        validation_results: {
            errors: never[];
            warnings: never[];
            summary: {};
        };
        teams_validated: string[];
        status: string;
    };
    /**
     * Generate completion report
     */
    generateCompletionReport(): {
        timestamp: string;
        packager_version: string;
        teams_packaged: string[];
        output_location: any;
        validation: {
            errors: never[];
            warnings: never[];
            summary: {};
        };
        success: boolean;
    };
}
//# sourceMappingURL=bmad-specialized-teams-packager.d.ts.map