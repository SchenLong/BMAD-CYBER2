export = PackageRegistryIntegration;
declare class PackageRegistryIntegration {
    constructor(options?: {});
    config: {
        bmadRoot: any;
        registryPath: any;
        enableIntegrationLogging: boolean;
        autoRegisterInstalls: boolean;
    };
    logger: InstallationLogger;
    registry: any;
    dependencyManager: BMADDependencyManager;
    installationHooks: Map<any, any>;
    updateHooks: Map<any, any>;
    uninstallHooks: Map<any, any>;
    /**
     * Initialize the integration system
     */
    initialize(): Promise<void>;
    /**
     * Hook into Amelia's installation framework
     */
    setupInstallationHooks(): void;
    /**
     * Setup dependency management integration hooks
     */
    setupDependencyHooks(): void;
    /**
     * Install a specialized team module with full integration
     */
    installSpecializedTeamModule(moduleName: any, options?: {}): Promise<{
        success: boolean;
        packageId: any;
        installResult: {
            success: boolean;
            installationPath: string;
            configPath: string;
            installedFiles: never[];
            outputDirectories: any[];
        };
        validationResult: {
            valid: boolean;
            issues: never[];
        };
    }>;
    /**
     * Update a package with registry integration
     */
    updatePackage(packageId: any, targetVersion: any, options?: {}): Promise<{
        success: boolean;
        updatedPackage: any;
        validationResult: {
            valid: boolean;
            issues: never[];
        };
    }>;
    /**
     * Uninstall package with dependency management
     */
    uninstallPackage(packageId: any, options?: {}): Promise<{
        success: boolean;
        uninstalledPackage: any;
        dependentsAffected: any;
    }>;
    /**
     * Perform system-wide health check with integration validation
     */
    performSystemHealthCheck(): Promise<{
        registry: any;
        dependencies: {
            healthy: number;
            total: any;
            issues: {
                package: any;
                issue: string;
                severity: string;
            }[];
            score: number;
        };
        integration: {
            registryAccessible: boolean;
            dependencyManagerAccessible: boolean;
            loggingFunctional: boolean;
            hooksRegistered: boolean;
            score: number;
        };
        specializedTeams: {
            total: any;
            healthy: number;
            degraded: number;
            unhealthy: number;
            teams: {};
        };
        overall: string;
    }>;
    /**
     * Load module configuration from various sources
     */
    loadModuleConfiguration(moduleName: any): Promise<{
        name: any;
        version: any;
        type: any;
        category: any;
        scope: any;
        fullName: any;
        repository: any;
        keywords: any;
        description: any;
        agentsCount: any;
        workflowsCount: any;
        exposedWorkflows: any;
        permissions: any;
        dependencies: any[];
        configuration: {
            outputFolder: any;
            securityFramework: any;
            moduleCode: any;
            agentsPath: any;
            workflowsPath: any;
            outputSubdirectories: any;
        };
        raw: any;
    } | null>;
    /**
     * Normalize module configuration to standard format
     */
    normalizeModuleConfig(rawConfig: any): {
        name: any;
        version: any;
        type: any;
        category: any;
        scope: any;
        fullName: any;
        repository: any;
        keywords: any;
        description: any;
        agentsCount: any;
        workflowsCount: any;
        exposedWorkflows: any;
        permissions: any;
        dependencies: any[];
        configuration: {
            outputFolder: any;
            securityFramework: any;
            moduleCode: any;
            agentsPath: any;
            workflowsPath: any;
            outputSubdirectories: any;
        };
        raw: any;
    };
    /**
     * Normalize dependencies from module config
     */
    normalizeDependencies(dependencies?: {}): any[];
    /**
     * Create registry entry from installation result
     */
    createRegistryEntryFromInstallResult(moduleConfig: any, installResult: any, installOptions: any): {
        name: any;
        version: any;
        type: any;
        category: any;
        scope: any;
        fullName: any;
        installationPath: any;
        configPath: any;
        configuration: any;
        installedFiles: any;
        outputDirectories: any;
        agentsCount: any;
        workflowsCount: any;
        exposedWorkflows: any;
        permissions: any;
        dependencies: any;
        repository: any;
        keywords: any;
        description: any;
    };
    /**
     * Execute installation hooks
     */
    executeHook(hookName: any, ...args: any[]): Promise<any>;
    /**
     * Validate installation after completion
     */
    validateInstallation(moduleConfig: any, installResult: any): Promise<{
        valid: boolean;
        issues: never[];
    }>;
    /**
     * Check dependency consistency across the system
     */
    checkDependencyConsistency(): Promise<{
        healthy: number;
        total: any;
        issues: {
            package: any;
            issue: string;
            severity: string;
        }[];
        score: number;
    }>;
    /**
     * Check integration health
     */
    checkIntegrationHealth(): Promise<{
        registryAccessible: boolean;
        dependencyManagerAccessible: boolean;
        loggingFunctional: boolean;
        hooksRegistered: boolean;
        score: number;
    }>;
    /**
     * Check specialized teams health
     */
    checkSpecializedTeamsHealth(): Promise<{
        total: any;
        healthy: number;
        degraded: number;
        unhealthy: number;
        teams: {};
    }>;
    fileExists(filePath: any): Promise<boolean>;
    calculateOverallHealth(healthChecks: any): "healthy" | "degraded" | "unhealthy";
    validateTeamAgents(team: any): Promise<boolean>;
    validateTeamWorkflows(team: any): Promise<boolean>;
    validateTeamOutputDirectories(team: any): Promise<boolean>;
    performModuleInstallation(moduleConfig: any, options: any): Promise<{
        success: boolean;
        installationPath: string;
        configPath: string;
        installedFiles: never[];
        outputDirectories: any[];
    }>;
    installDependencies(installationPlan: any, options: any): Promise<{
        success: boolean;
    }>;
    validateUpdateDependencies(packageEntry: any, targetVersion: any): Promise<{
        valid: boolean;
        issues: never[];
        compatibilityIssues: never[];
    }>;
    checkDependentPackages(packageId: any): Promise<{
        hasBlockingDependents: boolean;
        dependents: any;
    }>;
    updateDependencyTracking(): Promise<void>;
    validateSpecializedTeamAgents(moduleConfig: any, installResult: any): Promise<boolean>;
    validateSpecializedTeamWorkflows(moduleConfig: any, installResult: any): Promise<boolean>;
    validatePackageIntegration(packageEntry: any): Promise<{
        valid: boolean;
        issues: never[];
    }>;
    preparePreliminaryRegistryEntry(moduleConfig: any, installOptions: any): {
        name: any;
        version: any;
        preliminary: boolean;
    };
}
import InstallationLogger = require("../core/installation-logger");
import BMADDependencyManager = require("../core/bmad-dependency-manager");
//# sourceMappingURL=package-registry-integration.d.ts.map