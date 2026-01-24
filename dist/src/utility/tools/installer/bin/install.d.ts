/**
 * Main Installation Framework Class
 * Orchestrates the entire installation pipeline
 */
export class BMAdInstaller extends EventEmitter<[never]> {
    constructor(options?: {});
    options: {
        projectRoot: any;
        validateDependencies: boolean;
        enableRollback: boolean;
        verbose: any;
        dryRun: any;
    };
    converter: YamlToMdConverter;
    dependencyValidator: DependencyValidator;
    conflictDetector: ConflictDetector;
    progressReporter: ProgressReporter;
    rollbackManager: RollbackManager;
    logger: InstallationLogger;
    installationId: string;
    currentPhase: string | null;
    installedModules: any[];
    rollbackQueue: any[];
    installationLock: string | null;
    /**
     * Main installation entry point
     * @param {string|Array} modules - Module names or package paths to install
     * @param {Object} options - Installation options
     * @returns {Promise<Object>} Installation result
     */
    install(modules: string | any[], options?: Object): Promise<Object>;
    /**
     * Phase 1: Pre-validation checks
     * Validates system requirements and module integrity
     */
    preValidation(modules: any): Promise<void>;
    /**
     * Phase 2: Dependency resolution
     * Builds dependency graph and resolves version conflicts
     */
    resolveDependencies(modules: any): Promise<Map<any, any>>;
    /**
     * Phase 3: Conflict detection
     * Checks for naming conflicts and resource overlaps
     */
    detectConflicts(dependencyGraph: any): Promise<void>;
    /**
     * Phase 4: Backup creation
     * Creates system backup for rollback capability
     */
    createBackup(): Promise<void>;
    /**
     * Phase 5: Installation execution
     * Performs the actual conversion and installation
     */
    executeInstallation(dependencyGraph: any): Promise<{
        moduleName: any;
        agentPaths: any[];
        workflowPaths: any[];
        success: boolean;
    }[]>;
    /**
     * Install a single module
     * Converts YAML to MD and places in correct locations
     */
    installSingleModule(moduleName: any, moduleInfo: any): Promise<{
        moduleName: any;
        agentPaths: any[];
        workflowPaths: any[];
        success: boolean;
    }>;
    /**
     * Convert YAML agents to MD format using the conversion engine
     */
    convertAgents(yamlAgents: any, moduleInfo: any): Promise<Object[]>;
    /**
     * Convert YAML workflows to MD format
     */
    convertWorkflows(yamlWorkflows: any, moduleInfo: any): Promise<Object[]>;
    /**
     * Phase 6: Post-installation validation
     * Verifies installation success and functionality
     */
    postInstallationValidation(installationResults: any): Promise<void>;
    /**
     * Rollback installation
     * Undoes all installation changes
     */
    rollback(): Promise<void>;
    /**
     * Generate unique installation ID
     */
    generateInstallationId(): string;
    /**
     * Acquire installation lock to prevent concurrent installations
     */
    acquireInstallationLock(): any;
    /**
     * Release installation lock
     */
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
}
import EventEmitter = require("events");
import YamlToMdConverter = require("../lib/core/yaml-to-md-converter");
import DependencyValidator = require("../lib/core/dependency-validator");
import ConflictDetector = require("../lib/core/conflict-detector");
import ProgressReporter = require("../lib/core/progress-reporter");
import RollbackManager = require("../lib/core/rollback-manager");
import InstallationLogger = require("../lib/core/installation-logger");
export declare function installModule(moduleName: any, options?: {}): Promise<Object>;
export declare function installModules(moduleNames: any, options?: {}): Promise<Object>;
//# sourceMappingURL=install.d.ts.map