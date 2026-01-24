export = BMADInstallationOrchestrator;
declare class BMADInstallationOrchestrator {
    constructor(options?: {});
    config: {
        bmadRoot: any;
        outputPath: any;
        enableValidation: boolean;
        enableVerification: boolean;
        enableBackup: boolean;
        strictMode: any;
    };
    templateEngine: BMADTemplateEngine | null;
    configurationManager: BMADConfigurationManager | null;
    configurationValidator: BMADConfigurationValidator | null;
    postInstallVerifier: BMADPostInstallVerifier | null;
    dependencyManager: BMADDependencyManager | null;
    installationSessions: Map<any, any>;
    installationStats: {
        totalInstallations: number;
        successfulInstallations: number;
        failedInstallations: number;
        averageInstallationTime: number;
    };
    /**
     * Initialize all components
     */
    initialize(): Promise<boolean>;
    /**
     * Orchestrate complete installation process for a team module
     */
    installTeamModule(teamCode: any, options?: {}): Promise<null>;
    /**
     * Execute a single installation step
     */
    executeStep(session: any, stepName: any, stepFunction: any): Promise<void>;
    /**
     * Generate available team configurations
     */
    generateAllTeamConfigurations(options?: {}): Promise<{}>;
    /**
     * Validate existing installation
     */
    validateInstallation(teamCode: any, options?: {}): Promise<{
        success: boolean;
        teamCode: any;
        validation: {
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
        };
        verification: {
            verificationId: string;
            success: boolean;
            moduleInfo: {
                name: any;
                version: any;
                teamCode: any;
                installationPath: any;
            };
            checks: {
                installation: {
                    status: string;
                    results: never[];
                };
                configuration: {
                    status: string;
                    results: never[];
                };
                dependencies: {
                    status: string;
                    results: never[];
                };
                filesystem: {
                    status: string;
                    results: never[];
                };
                permissions: {
                    status: string;
                    results: never[];
                };
                agents: {
                    status: string;
                    results: never[];
                };
                workflows: {
                    status: string;
                    results: never[];
                };
                integration: {
                    status: string;
                    results: never[];
                };
                performance: {
                    status: string;
                    results: never[];
                };
                security: {
                    status: string;
                    results: never[];
                };
            };
            summary: {
                totalChecks: number;
                passedChecks: number;
                failedChecks: number;
                warningChecks: number;
                skippedChecks: number;
            };
            issues: never[];
            recommendations: never[];
            metadata: {
                verificationTime: number;
                verifier: string;
                environment: any;
            };
        };
        overall: boolean;
        error?: never;
    } | {
        success: boolean;
        teamCode: any;
        error: any;
        validation?: never;
        verification?: never;
        overall?: never;
    }>;
    /**
     * Get installation session status
     */
    getSessionStatus(sessionId: any): any;
    /**
     * List all active sessions
     */
    getActiveSessions(): {
        sessionId: any;
        teamCode: any;
        currentStep: any;
        startTime: any;
        duration: number;
    }[];
    /**
     * Get orchestrator status and statistics
     */
    getStatus(): {
        initialized: boolean;
        components: {
            templateEngine: {
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
            } | null;
            configurationManager: {
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
            } | null;
            configurationValidator: {
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
            } | null;
            postInstallVerifier: {
                initialized: boolean;
                verificationChecks: number;
                systemChecks: number;
                integrationChecks: number;
                performanceChecks: number;
                teamSpecs: string[];
                statistics: {
                    totalChecks: number;
                    passedChecks: number;
                    failedChecks: number;
                    skippedChecks: number;
                    warningChecks: number;
                    startTime: null;
                    endTime: null;
                    duration: number;
                };
                config: {
                    bmadRoot: any;
                    timeoutPerCheck: any;
                    maxConcurrentChecks: any;
                    enableNetworkChecks: boolean;
                    enableFileSystemChecks: boolean;
                    enableIntegrationChecks: boolean;
                    verboseOutput: any;
                };
            } | null;
            dependencyManager: string | null;
        };
        statistics: {
            totalInstallations: number;
            successfulInstallations: number;
            failedInstallations: number;
            averageInstallationTime: number;
        };
        activeSessions: number;
        totalSessions: number;
        config: {
            bmadRoot: any;
            outputPath: any;
            enableValidation: boolean;
            enableVerification: boolean;
            enableBackup: boolean;
            strictMode: any;
        };
    };
    /**
     * Generate example configurations for documentation
     */
    generateExampleConfigurations(): Promise<{
        development: {};
        production: {};
        testing: {};
    }>;
    /**
     * Clean up old sessions and temporary files
     */
    cleanup(options?: {}): Promise<{
        cleanedSessions: number;
    }>;
    /**
     * Generate session ID
     */
    generateSessionId(): string;
    /**
     * Update installation statistics
     */
    updateStats(session: any, success: any): void;
    /**
     * Export configurations for external use
     */
    exportConfigurations(outputPath: any, format?: string): Promise<void>;
}
import BMADTemplateEngine = require("./bmad-template-engine");
import BMADConfigurationManager = require("./bmad-configuration-manager");
import BMADConfigurationValidator = require("../validators/bmad-configuration-validator");
import BMADPostInstallVerifier = require("./bmad-post-install-verifier");
import BMADDependencyManager = require("./bmad-dependency-manager");
//# sourceMappingURL=bmad-installation-orchestrator.d.ts.map