export = BMADPostInstallVerifier;
declare class BMADPostInstallVerifier {
    constructor(options?: {});
    config: {
        bmadRoot: any;
        timeoutPerCheck: any;
        maxConcurrentChecks: any;
        enableNetworkChecks: boolean;
        enableFileSystemChecks: boolean;
        enableIntegrationChecks: boolean;
        verboseOutput: any;
    };
    verificationChecks: Map<any, any>;
    systemChecks: Map<any, any>;
    integrationChecks: Map<any, any>;
    performanceChecks: Map<any, any>;
    verificationResults: Map<any, any>;
    verificationStats: {
        totalChecks: number;
        passedChecks: number;
        failedChecks: number;
        skippedChecks: number;
        warningChecks: number;
        startTime: null;
        endTime: null;
        duration: number;
    };
    teamVerificationSpecs: {
        'cybersec-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
        'intel-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
        'legal-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
        'strategy-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
    };
    /**
     * Initialize the verifier
     */
    initialize(): Promise<boolean>;
    /**
     * Run comprehensive post-install verification
     */
    runVerification(moduleConfig: any, context?: {}): Promise<{
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
    }>;
    /**
     * Verify installation integrity
     */
    verifyInstallation(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify configuration integrity
     */
    verifyConfiguration(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify dependencies
     */
    verifyDependencies(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify filesystem integrity
     */
    verifyFilesystem(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify permissions
     */
    verifyPermissions(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify agents accessibility and functionality
     */
    verifyAgents(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify workflows accessibility and functionality
     */
    verifyWorkflows(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify integration points
     */
    verifyIntegration(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify performance characteristics
     */
    verifyPerformance(moduleConfig: any, context: any, result: any): Promise<void>;
    /**
     * Verify security aspects
     */
    verifySecurity(moduleConfig: any, context: any, result: any): Promise<void>;
    checkPackageInstallation(moduleConfig: any, context: any): Promise<{
        name: string;
        status: string;
        message: string;
        details: {
            packagePath: any;
            expectedPath?: never;
        };
        severity?: never;
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details: {
            expectedPath: any;
            packagePath?: never;
        };
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details?: never;
    }>;
    checkNpmInstallation(moduleConfig: any, context: any): Promise<{
        name: string;
        status: string;
        message: string;
        details: {
            npmOutput: string;
        };
        severity?: never;
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details: {
            npmOutput: string;
        };
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details?: never;
    }>;
    checkVersionConsistency(moduleConfig: any, context: any): Promise<{
        name: string;
        status: string;
        message: string;
        details: {
            configVersion: any;
            packageVersion: any;
        };
        severity?: never;
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details: {
            configVersion: any;
            packageVersion: any;
        };
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details?: never;
    }>;
    checkInstallationCompleteness(moduleConfig: any, context: any): Promise<{
        name: string;
        status: string;
        message: string;
        details: {
            existingPaths: number;
            totalPaths: number;
            requiredPaths: any[];
        };
        severity?: never;
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details: {
            existingPaths: number;
            totalPaths: number;
            requiredPaths: any[];
        };
    } | {
        name: string;
        status: string;
        message: string;
        severity: string;
        details?: never;
    }>;
    /**
     * Determine overall status for a group of checks
     */
    determineCheckStatus(checkResults: any): "failed" | "warning" | "passed" | "partial";
    /**
     * Update verification statistics
     */
    updateStats(checkResult: any): void;
    /**
     * Finalize verification result
     */
    finalizeVerificationResult(result: any): void;
    /**
     * Generate recommendations based on verification results
     */
    generateRecommendations(result: any): {
        priority: string;
        category: string;
        message: string;
        actions: any;
    }[];
    /**
     * Generate verification report
     */
    generateVerificationReport(result: any, context: any): Promise<void>;
    /**
     * Generate human-readable report
     */
    generateReadableReport(result: any): string;
    /**
     * Initialize team-specific verification specs
     */
    initializeTeamSpecs(): {
        'cybersec-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
        'intel-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
        'legal-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
        'strategy-team': {
            requiredAgents: number;
            requiredWorkflows: number;
            securityLevel: string;
            networkRequired: boolean;
            specialChecks: string[];
        };
    };
    /**
     * Initialize verification checks
     */
    initializeVerificationChecks(): Promise<void>;
    /**
     * Initialize system checks
     */
    initializeSystemChecks(): Promise<void>;
    /**
     * Initialize integration checks
     */
    initializeIntegrationChecks(): Promise<void>;
    /**
     * Initialize performance checks
     */
    initializePerformanceChecks(): Promise<void>;
    /**
     * Generate unique verification ID
     */
    generateVerificationId(): string;
    /**
     * Get verifier status
     */
    getStatus(): {
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
    };
}
//# sourceMappingURL=bmad-post-install-verifier.d.ts.map