export = RollbackManager;
/**
 * Rollback Management System
 * Handles backup creation, state tracking, and restoration
 */
declare class RollbackManager {
    constructor(options?: {});
    options: {
        backupDirectory: any;
        compressionEnabled: boolean;
        maxBackups: any;
        verifyBackups: boolean;
        retentionDays: any;
    };
    activeBackups: Map<any, any>;
    rollbackHistory: any[];
    /**
     * Create a system backup before installation
     * @param {Object} backupConfig - Backup configuration
     * @returns {Promise<string>} Backup ID
     */
    createBackup(backupConfig: Object): Promise<string>;
    /**
     * Restore system from backup
     * @param {string} backupId - Backup ID to restore from
     * @param {Object} restoreOptions - Restoration options
     * @returns {Promise<Object>} Restoration result
     */
    restoreFromBackup(backupId: string, restoreOptions?: Object): Promise<Object>;
    /**
     * Rollback specific installation changes
     * @param {Array} rollbackQueue - Queue of changes to rollback
     * @returns {Promise<Object>} Rollback result
     */
    rollbackChanges(rollbackQueue: any[]): Promise<Object>;
    /**
     * Create backup manifest
     */
    createBackupManifest(backupConfig: any, backupId: any): Promise<{
        backupId: any;
        version: string;
        created: string;
        installationId: any;
        projectRoot: any;
        bmadVersion: string;
        systemInfo: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
        };
        backupContents: {
            systemState: boolean;
            moduleConfigurations: boolean;
            globalRegistries: boolean;
            customConfigurations: boolean;
        };
        checksums: {};
        fileList: never[];
    }>;
    /**
     * Backup system state
     */
    backupSystemState(backupPath: any, config: any): Promise<void>;
    /**
     * Backup module configurations
     */
    backupModuleConfigurations(backupPath: any, config: any): Promise<void>;
    /**
     * Backup global registries
     */
    backupGlobalRegistries(backupPath: any, config: any): Promise<void>;
    /**
     * Process individual rollback item
     */
    processRollbackItem(rollbackItem: any, rollbackId: any): Promise<void>;
    /**
     * Rollback module installation
     */
    rollbackModuleInstallation(rollbackItem: any, rollbackId: any): Promise<void>;
    /**
     * Execute restore phase
     */
    executeRestorePhase(phase: any, backupPath: any, manifest: any, options: any): Promise<void>;
    /**
     * Utility methods
     */
    generateBackupId(installationId: any): string;
    generateRestoreId(): string;
    generateRollbackId(): string;
    getBackupPath(backupId: any): Promise<string>;
    pathExists(filePath: any): Promise<boolean>;
    copyDirectory(source: any, destination: any): Promise<void>;
    shouldAbortRollback(rollbackItem: any, error: any): boolean;
    getBmadVersion(): Promise<string>;
    getSystemInfo(): Promise<{
        platform: NodeJS.Platform;
        arch: NodeJS.Architecture;
    }>;
    loadBackupManifest(backupPath: any): Promise<{}>;
    validateBackupBeforeRestore(backupPath: any, manifest: any): Promise<boolean>;
    createPreRestoreSnapshot(restoreId: any): Promise<string>;
    decompressBackup(backupPath: any): Promise<void>;
    compressBackup(backupPath: any): Promise<void>;
    verifyBackupIntegrity(backupPath: any): Promise<void>;
    cleanOldBackups(): Promise<void>;
    backupPackageFiles(systemStatePath: any, projectRoot: any): Promise<void>;
    backupBmadConfig(systemStatePath: any, projectRoot: any): Promise<void>;
    backupEnvironmentFiles(systemStatePath: any, projectRoot: any): Promise<void>;
    backupLockFiles(systemStatePath: any, projectRoot: any): Promise<void>;
    backupAgentRegistry(registriesPath: any, projectRoot: any): Promise<void>;
    backupWorkflowRegistry(registriesPath: any, projectRoot: any): Promise<void>;
    backupModuleRegistry(registriesPath: any, projectRoot: any): Promise<void>;
    backupCustomConfigurations(backupPath: any, config: any): Promise<void>;
    rollbackFileCreation(rollbackItem: any, rollbackId: any): Promise<void>;
    rollbackDirectoryCreation(rollbackItem: any, rollbackId: any): Promise<void>;
    rollbackConfigurationChange(rollbackItem: any, rollbackId: any): Promise<void>;
    rollbackRegistryUpdate(rollbackItem: any, rollbackId: any): Promise<void>;
    removeModuleConfiguration(module: any): Promise<void>;
    removeFromGlobalRegistries(module: any): Promise<void>;
    stopBmadServices(): Promise<void>;
    restoreConfigurations(backupPath: any): Promise<void>;
    restoreRegistries(backupPath: any): Promise<void>;
    restoreModules(backupPath: any): Promise<void>;
    restoreCustomFiles(backupPath: any): Promise<void>;
    verifyRestoration(backupPath: any, manifest: any): Promise<void>;
    restartBmadServices(): Promise<void>;
    /**
     * List available backups
     * @returns {Promise<Array>} List of available backups
     */
    listBackups(): Promise<any[]>;
    /**
     * Get backup size
     */
    getBackupSize(backupPath: any): Promise<number>;
    /**
     * Get rollback history
     * @returns {Array} Rollback history
     */
    getRollbackHistory(): any[];
}
//# sourceMappingURL=rollback-manager.d.ts.map