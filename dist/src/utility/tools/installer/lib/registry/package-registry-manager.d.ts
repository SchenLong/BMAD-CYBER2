export = BMADPackageRegistryManager;
declare class BMADPackageRegistryManager {
    constructor(options?: {});
    options: {
        npmRegistry: string;
        cacheTimeout: number;
        securityAuditEnabled: boolean;
        strictCompatibility: boolean;
    };
    runtimeEnv: {
        node: {
            version: string;
            features: string[];
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
        };
        npm: {
            version: string;
            registry: string;
            config: {};
        };
        system: {
            os: NodeJS.Platform;
            memory: number;
            cpu: number;
        };
    } | null;
    registryCache: Map<any, any>;
    auditCache: Map<any, any>;
    compatibilityCache: Map<any, any>;
    /**
     * Initialize the package registry manager
     */
    initialize(): Promise<void>;
    /**
     * Detect current runtime environment
     */
    detectRuntimeEnvironment(): Promise<{
        node: {
            version: string;
            features: string[];
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
        };
        npm: {
            version: string;
            registry: string;
            config: {};
        };
        system: {
            os: NodeJS.Platform;
            memory: number;
            cpu: number;
        };
    }>;
    /**
     * Detect available Node.js features
     */
    detectNodeFeatures(): Promise<string[]>;
    /**
     * Verify Node.js compatibility for a package
     */
    verifyNodeCompatibility(packageInfo: any): Promise<any>;
    /**
     * Extract required Node.js features from package metadata
     */
    extractRequiredFeatures(packageInfo: any): string[];
    /**
     * Check for deprecated feature usage
     */
    checkDeprecatedFeatures(packageInfo: any): string[];
    /**
     * Check if package uses worker threads
     */
    hasWorkerThreadUsage(packageInfo: any): boolean;
    /**
     * Check if package uses crypto features
     */
    hasCryptoUsage(packageInfo: any): boolean;
    /**
     * Check if package uses fetch API
     */
    hasFetchUsage(packageInfo: any): boolean;
    /**
     * Check if a package is deprecated
     */
    isDeprecatedPackage(packageName: any): boolean;
    /**
     * Install NPM package with compatibility verification
     */
    installPackage(packageName: any, version: any, options?: {}): Promise<{
        success: boolean;
        output: string;
        error?: never;
    } | {
        success: boolean;
        error: any;
        output?: never;
    }>;
    /**
     * Build NPM install command
     */
    buildInstallCommand(packageName: any, version: any, options?: {}): string;
    /**
     * Get package information from NPM registry
     */
    getPackageInfo(packageName: any, version: any): Promise<any>;
    /**
     * Simulate package information (for testing)
     */
    simulatePackageInfo(packageName: any, version: any): {
        name: any;
        version: any;
        description: string;
        engines: {
            node: string;
            npm: string;
        };
    };
    /**
     * Get team agents for simulation
     */
    getTeamAgents(teamName: any): any;
    /**
     * Get team workflows for simulation
     */
    getTeamWorkflows(teamName: any): any;
    /**
     * Perform security audit on a package
     */
    auditPackageSecurity(packageName: any, version: any): Promise<any>;
    /**
     * Simulate audit results for testing
     */
    simulateAuditResults(packageName: any): {
        metadata: {
            vulnerabilities: {
                info: number;
                low: number;
                moderate: number;
                high: number;
                critical: number;
                total: number;
            };
        };
        advisories: {
            id: string;
            title: string;
            severity: string;
            module_name: string;
        }[];
    };
    /**
     * Validate package dependencies
     */
    validateDependencies(packageInfo: any): Promise<{
        valid: boolean;
        errors: never[];
        warnings: never[];
        missingDependencies: never[];
        conflictingVersions: never[];
    }>;
    /**
     * Generate comprehensive package report
     */
    generatePackageReport(packageInfo: any, compatibility: any, audit: any): {
        package: any;
        compatibility: any;
        security: any;
        recommendations: string[];
        riskLevel: string;
        installRecommended: boolean;
    };
    /**
     * Clean up cache and resources
     */
    cleanup(): void;
    /**
     * Get runtime environment information
     */
    getRuntimeEnvironment(): {
        node: {
            version: string;
            features: string[];
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
        };
        npm: {
            version: string;
            registry: string;
            config: {};
        };
        system: {
            os: NodeJS.Platform;
            memory: number;
            cpu: number;
        };
    } | null;
    /**
     * Get cache statistics
     */
    getCacheStatistics(): {
        registryCache: number;
        auditCache: number;
        compatibilityCache: number;
    };
}
//# sourceMappingURL=package-registry-manager.d.ts.map