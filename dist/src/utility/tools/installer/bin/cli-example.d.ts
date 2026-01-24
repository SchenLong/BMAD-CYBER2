#!/usr/bin/env node
/// <reference types="node" />
export = BMAdInstallationCLI;
/**
 * CLI Implementation Example
 */
declare class BMAdInstallationCLI {
    installer: {
        options: {
            projectRoot: any;
            validateDependencies: boolean;
            enableRollback: boolean;
            verbose: any;
            dryRun: any;
        };
        converter: import("../lib/core/yaml-to-md-converter");
        dependencyValidator: import("../lib/core/dependency-validator");
        conflictDetector: import("../lib/core/conflict-detector");
        progressReporter: import("../lib/core/progress-reporter");
        rollbackManager: import("../lib/core/rollback-manager");
        logger: import("../lib/core/installation-logger");
        installationId: string;
        currentPhase: string | null;
        installedModules: any[];
        rollbackQueue: any[];
        installationLock: string | null;
        install(modules: string | any[], options?: Object): Promise<Object>;
        preValidation(modules: any): Promise<void>;
        resolveDependencies(modules: any): Promise<Map<any, any>>;
        detectConflicts(dependencyGraph: any): Promise<void>;
        createBackup(): Promise<void>;
        executeInstallation(dependencyGraph: any): Promise<{
            moduleName: any;
            agentPaths: any[];
            workflowPaths: any[];
            success: boolean;
        }[]>;
        installSingleModule(moduleName: any, moduleInfo: any): Promise<{
            moduleName: any;
            agentPaths: any[];
            workflowPaths: any[];
            success: boolean;
        }>;
        convertAgents(yamlAgents: any, moduleInfo: any): Promise<Object[]>;
        convertWorkflows(yamlWorkflows: any, moduleInfo: any): Promise<Object[]>;
        postInstallationValidation(installationResults: any): Promise<void>;
        rollback(): Promise<void>;
        generateInstallationId(): string;
        acquireInstallationLock(): any;
        releaseInstallationLock(): Promise<void>;
        checkSystemRequirements(): Promise<void>;
        validateBmadCore(): Promise<void>;
        validateModulePackages(modules: any): Promise<void>;
        checkResourceAvailability(): Promise<void>;
        loadModuleInfo(module: any): Promise<{
            name: any;
            dependencies: never[];
        }>;
        loadYamlPackage(moduleName: any, moduleInfo: any): Promise<{
            agents: never[];
            workflows: never[];
        }>;
        installAgents(agents: any, moduleInfo: any): Promise<never[]>;
        installWorkflows(workflows: any, moduleInfo: any): Promise<never[]>;
        createModuleConfiguration(moduleInfo: any): Promise<void>;
        updateGlobalRegistries(moduleInfo: any, agentPaths: any, workflowPaths: any): Promise<void>;
        verifyModuleLoading(): Promise<void>;
        verifyAgentRegistration(): Promise<void>;
        verifyWorkflowFunctionality(): Promise<void>;
        handleConflicts(conflicts: any): Promise<void>;
        processRollbackItem(item: any): Promise<void>;
        [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void;
        addListener<K_1>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        on<K_2>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        once<K_3>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        removeListener<K_4>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        off<K_5>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(eventName?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners<K_6>(eventName: string | symbol): Function[];
        rawListeners<K_7>(eventName: string | symbol): Function[];
        emit<K_8>(eventName: string | symbol, ...args: any[]): boolean;
        listenerCount<K_9>(eventName: string | symbol, listener?: Function | undefined): number;
        prependListener<K_10>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener<K_11>(eventName: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    } | null;
    /**
     * Main CLI entry point
     */
    main(): Promise<void>;
    /**
     * Handle install command
     */
    handleInstallCommand(args: any): Promise<void>;
    /**
     * Handle rollback command
     */
    handleRollbackCommand(args: any): Promise<void>;
    /**
     * Handle list command
     */
    handleListCommand(args: any): Promise<void>;
    /**
     * Handle validate command
     */
    handleValidateCommand(args: any): Promise<void>;
    /**
     * Parse install command options
     */
    parseInstallOptions(args: any): {
        modules: never[];
        projectRoot: string;
        validateDependencies: boolean;
        enableRollback: boolean;
        verbose: boolean;
        dryRun: boolean;
    } | undefined;
    /**
     * Set up event listeners for installation feedback
     */
    setupEventListeners(): void;
    /**
     * List installed modules
     */
    listInstalledModules(): Promise<void>;
    /**
     * List backups
     */
    listBackups(): Promise<void>;
    /**
     * Show help information
     */
    showHelp(): void;
    /**
     * Show install command help
     */
    showInstallHelp(): void;
}
//# sourceMappingURL=cli-example.d.ts.map