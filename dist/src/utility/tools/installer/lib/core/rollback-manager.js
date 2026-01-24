"use strict";
/**
 * Rollback Manager
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Provides comprehensive rollback capabilities for failed installations.
 * Creates system backups and can restore to previous state.
 *
 * Author: Amelia (Developer)
 * Version: 1.0.0
 */
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
/**
 * Rollback Management System
 * Handles backup creation, state tracking, and restoration
 */
class RollbackManager {
    constructor(options = {}) {
        this.options = {
            backupDirectory: options.backupDirectory || '.bmad-backups',
            compressionEnabled: options.compressionEnabled !== false,
            maxBackups: options.maxBackups || 10,
            verifyBackups: options.verifyBackups !== false,
            retentionDays: options.retentionDays || 30,
            ...options
        };
        // State tracking
        this.activeBackups = new Map();
        this.rollbackHistory = [];
    }
    /**
     * Create a system backup before installation
     * @param {Object} backupConfig - Backup configuration
     * @returns {Promise<string>} Backup ID
     */
    async createBackup(backupConfig) {
        const backupId = this.generateBackupId(backupConfig.installationId);
        const backupPath = await this.getBackupPath(backupId);
        try {
            console.log(`Creating backup: ${backupId}`);
            // Create backup directory
            await fs.mkdir(backupPath, { recursive: true });
            // Create backup manifest
            const manifest = await this.createBackupManifest(backupConfig, backupId);
            await fs.writeFile(path.join(backupPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
            // Backup system state
            await this.backupSystemState(backupPath, backupConfig);
            // Backup module configurations
            await this.backupModuleConfigurations(backupPath, backupConfig);
            // Backup global registries
            await this.backupGlobalRegistries(backupPath, backupConfig);
            // Backup custom configurations
            await this.backupCustomConfigurations(backupPath, backupConfig);
            // Verify backup integrity
            if (this.options.verifyBackups) {
                await this.verifyBackupIntegrity(backupPath);
            }
            // Compress backup if enabled
            if (this.options.compressionEnabled) {
                await this.compressBackup(backupPath);
            }
            // Register backup
            this.activeBackups.set(backupId, {
                id: backupId,
                path: backupPath,
                manifest: manifest,
                created: new Date(),
                compressed: this.options.compressionEnabled,
                verified: this.options.verifyBackups
            });
            // Clean old backups
            await this.cleanOldBackups();
            console.log(`Backup created successfully: ${backupId}`);
            return backupId;
        }
        catch (error) {
            // Clean up partial backup
            try {
                await fs.rmdir(backupPath, { recursive: true });
            }
            catch (cleanupError) {
                console.warn(`Failed to clean up partial backup: ${cleanupError.message}`);
            }
            throw new Error(`Backup creation failed: ${error.message}`);
        }
    }
    /**
     * Restore system from backup
     * @param {string} backupId - Backup ID to restore from
     * @param {Object} restoreOptions - Restoration options
     * @returns {Promise<Object>} Restoration result
     */
    async restoreFromBackup(backupId, restoreOptions = {}) {
        const backup = this.activeBackups.get(backupId);
        if (!backup) {
            throw new Error(`Backup not found: ${backupId}`);
        }
        const restoreId = this.generateRestoreId();
        const startTime = Date.now();
        try {
            console.log(`Starting restoration from backup: ${backupId}`);
            // Load backup manifest
            const manifest = await this.loadBackupManifest(backup.path);
            // Validate backup integrity before restoration
            await this.validateBackupBeforeRestore(backup.path, manifest);
            // Create pre-restore snapshot (in case restoration fails)
            const preRestoreBackupId = await this.createPreRestoreSnapshot(restoreId);
            // Decompress backup if needed
            if (backup.compressed) {
                await this.decompressBackup(backup.path);
            }
            // Restore in phases
            const phases = [
                'stop_services',
                'restore_configurations',
                'restore_registries',
                'restore_modules',
                'restore_custom_files',
                'verify_restoration',
                'restart_services'
            ];
            const results = {
                restoreId: restoreId,
                backupId: backupId,
                phases: {},
                startTime: startTime,
                endTime: null,
                success: false,
                error: null
            };
            for (const phase of phases) {
                try {
                    console.log(`Restoration phase: ${phase}`);
                    const phaseStartTime = Date.now();
                    await this.executeRestorePhase(phase, backup.path, manifest, restoreOptions);
                    results.phases[phase] = {
                        success: true,
                        duration: Date.now() - phaseStartTime,
                        timestamp: new Date()
                    };
                }
                catch (phaseError) {
                    results.phases[phase] = {
                        success: false,
                        error: phaseError.message,
                        duration: Date.now() - phaseStartTime,
                        timestamp: new Date()
                    };
                    throw new Error(`Restoration failed in phase ${phase}: ${phaseError.message}`);
                }
            }
            results.success = true;
            results.endTime = Date.now();
            // Record successful restoration
            this.rollbackHistory.push({
                type: 'restoration',
                ...results
            });
            console.log(`Restoration completed successfully in ${results.endTime - results.startTime}ms`);
            return results;
        }
        catch (error) {
            const result = {
                restoreId: restoreId,
                backupId: backupId,
                success: false,
                error: error.message,
                startTime: startTime,
                endTime: Date.now()
            };
            // Record failed restoration
            this.rollbackHistory.push({
                type: 'restoration_failed',
                ...result
            });
            throw error;
        }
    }
    /**
     * Rollback specific installation changes
     * @param {Array} rollbackQueue - Queue of changes to rollback
     * @returns {Promise<Object>} Rollback result
     */
    async rollbackChanges(rollbackQueue) {
        const rollbackId = this.generateRollbackId();
        const startTime = Date.now();
        const results = {
            rollbackId: rollbackId,
            processedItems: [],
            errors: [],
            success: false
        };
        try {
            console.log(`Starting rollback of ${rollbackQueue.length} changes`);
            // Process rollback queue in reverse order (LIFO)
            for (let i = rollbackQueue.length - 1; i >= 0; i--) {
                const rollbackItem = rollbackQueue[i];
                try {
                    await this.processRollbackItem(rollbackItem, rollbackId);
                    results.processedItems.push({
                        item: rollbackItem,
                        success: true,
                        timestamp: new Date()
                    });
                }
                catch (itemError) {
                    const error = {
                        item: rollbackItem,
                        error: itemError.message,
                        timestamp: new Date()
                    };
                    results.errors.push(error);
                    // Decide whether to continue or abort
                    if (this.shouldAbortRollback(rollbackItem, itemError)) {
                        throw new Error(`Critical rollback failure: ${itemError.message}`);
                    }
                    console.warn(`Non-critical rollback error: ${itemError.message}`);
                }
            }
            results.success = results.errors.length === 0;
            results.endTime = Date.now();
            // Record rollback attempt
            this.rollbackHistory.push({
                type: 'rollback_changes',
                ...results
            });
            if (results.success) {
                console.log(`Rollback completed successfully`);
            }
            else {
                console.warn(`Rollback completed with ${results.errors.length} errors`);
            }
            return results;
        }
        catch (error) {
            results.success = false;
            results.error = error.message;
            results.endTime = Date.now();
            this.rollbackHistory.push({
                type: 'rollback_failed',
                ...results
            });
            throw error;
        }
    }
    /**
     * Create backup manifest
     */
    async createBackupManifest(backupConfig, backupId) {
        const manifest = {
            backupId: backupId,
            version: '1.0.0',
            created: new Date().toISOString(),
            installationId: backupConfig.installationId,
            projectRoot: backupConfig.projectRoot,
            bmadVersion: await this.getBmadVersion(),
            systemInfo: await this.getSystemInfo(),
            backupContents: {
                systemState: true,
                moduleConfigurations: true,
                globalRegistries: true,
                customConfigurations: true
            },
            checksums: {},
            fileList: []
        };
        return manifest;
    }
    /**
     * Backup system state
     */
    async backupSystemState(backupPath, config) {
        const systemStatePath = path.join(backupPath, 'system');
        await fs.mkdir(systemStatePath, { recursive: true });
        try {
            // Backup package.json files
            await this.backupPackageFiles(systemStatePath, config.projectRoot);
            // Backup BMAD configuration files
            await this.backupBmadConfig(systemStatePath, config.projectRoot);
            // Backup environment files
            await this.backupEnvironmentFiles(systemStatePath, config.projectRoot);
            // Backup lock files
            await this.backupLockFiles(systemStatePath, config.projectRoot);
        }
        catch (error) {
            throw new Error(`System state backup failed: ${error.message}`);
        }
    }
    /**
     * Backup module configurations
     */
    async backupModuleConfigurations(backupPath, config) {
        const modulesPath = path.join(backupPath, 'modules');
        await fs.mkdir(modulesPath, { recursive: true });
        try {
            const bmadPath = path.join(config.projectRoot, '_bmad');
            if (await this.pathExists(bmadPath)) {
                await this.copyDirectory(bmadPath, path.join(modulesPath, '_bmad'));
            }
        }
        catch (error) {
            throw new Error(`Module configuration backup failed: ${error.message}`);
        }
    }
    /**
     * Backup global registries
     */
    async backupGlobalRegistries(backupPath, config) {
        const registriesPath = path.join(backupPath, 'registries');
        await fs.mkdir(registriesPath, { recursive: true });
        try {
            // Backup agent registry
            await this.backupAgentRegistry(registriesPath, config.projectRoot);
            // Backup workflow registry
            await this.backupWorkflowRegistry(registriesPath, config.projectRoot);
            // Backup module registry
            await this.backupModuleRegistry(registriesPath, config.projectRoot);
        }
        catch (error) {
            throw new Error(`Registry backup failed: ${error.message}`);
        }
    }
    /**
     * Process individual rollback item
     */
    async processRollbackItem(rollbackItem, rollbackId) {
        console.log(`Processing rollback item: ${rollbackItem.type}`);
        switch (rollbackItem.type) {
            case 'module_installation':
                await this.rollbackModuleInstallation(rollbackItem, rollbackId);
                break;
            case 'file_creation':
                await this.rollbackFileCreation(rollbackItem, rollbackId);
                break;
            case 'directory_creation':
                await this.rollbackDirectoryCreation(rollbackItem, rollbackId);
                break;
            case 'configuration_change':
                await this.rollbackConfigurationChange(rollbackItem, rollbackId);
                break;
            case 'registry_update':
                await this.rollbackRegistryUpdate(rollbackItem, rollbackId);
                break;
            case 'backup':
                // Backups don't need to be rolled back
                console.log('Backup item - no rollback needed');
                break;
            default:
                console.warn(`Unknown rollback item type: ${rollbackItem.type}`);
        }
    }
    /**
     * Rollback module installation
     */
    async rollbackModuleInstallation(rollbackItem, rollbackId) {
        const module = rollbackItem.module;
        const installResult = rollbackItem.result;
        try {
            // Remove installed agents
            if (installResult.agentPaths) {
                for (const agentPath of installResult.agentPaths) {
                    if (await this.pathExists(agentPath)) {
                        await fs.unlink(agentPath);
                        console.log(`Removed agent: ${agentPath}`);
                    }
                }
            }
            // Remove installed workflows
            if (installResult.workflowPaths) {
                for (const workflowPath of installResult.workflowPaths) {
                    if (await this.pathExists(workflowPath)) {
                        await fs.unlink(workflowPath);
                        console.log(`Removed workflow: ${workflowPath}`);
                    }
                }
            }
            // Remove module configuration
            await this.removeModuleConfiguration(module);
            // Update global registries
            await this.removeFromGlobalRegistries(module);
            console.log(`Module ${module} installation rolled back`);
        }
        catch (error) {
            throw new Error(`Failed to rollback module installation: ${error.message}`);
        }
    }
    /**
     * Execute restore phase
     */
    async executeRestorePhase(phase, backupPath, manifest, options) {
        switch (phase) {
            case 'stop_services':
                await this.stopBmadServices();
                break;
            case 'restore_configurations':
                await this.restoreConfigurations(backupPath);
                break;
            case 'restore_registries':
                await this.restoreRegistries(backupPath);
                break;
            case 'restore_modules':
                await this.restoreModules(backupPath);
                break;
            case 'restore_custom_files':
                await this.restoreCustomFiles(backupPath);
                break;
            case 'verify_restoration':
                await this.verifyRestoration(backupPath, manifest);
                break;
            case 'restart_services':
                await this.restartBmadServices();
                break;
            default:
                throw new Error(`Unknown restore phase: ${phase}`);
        }
    }
    /**
     * Utility methods
     */
    generateBackupId(installationId) {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex');
        return `backup_${installationId}_${timestamp}_${random}`;
    }
    generateRestoreId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex');
        return `restore_${timestamp}_${random}`;
    }
    generateRollbackId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex');
        return `rollback_${timestamp}_${random}`;
    }
    async getBackupPath(backupId) {
        const backupDir = path.resolve(this.options.backupDirectory);
        return path.join(backupDir, backupId);
    }
    async pathExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async copyDirectory(source, destination) {
        await fs.mkdir(destination, { recursive: true });
        const files = await fs.readdir(source);
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const destPath = path.join(destination, file);
            const stat = await fs.stat(sourcePath);
            if (stat.isDirectory()) {
                await this.copyDirectory(sourcePath, destPath);
            }
            else {
                await fs.copyFile(sourcePath, destPath);
            }
        }
    }
    shouldAbortRollback(rollbackItem, error) {
        // Critical failures that should abort rollback
        const criticalTypes = ['registry_corruption', 'system_file_loss'];
        return criticalTypes.some(type => error.message.includes(type));
    }
    // Placeholder methods for actual implementation
    async getBmadVersion() { return '2.0.0'; }
    async getSystemInfo() { return { platform: process.platform, arch: process.arch }; }
    async loadBackupManifest(backupPath) { return {}; }
    async validateBackupBeforeRestore(backupPath, manifest) { return true; }
    async createPreRestoreSnapshot(restoreId) { return `pre_restore_${restoreId}`; }
    async decompressBackup(backupPath) { console.log('Decompressing backup...'); }
    async compressBackup(backupPath) { console.log('Compressing backup...'); }
    async verifyBackupIntegrity(backupPath) { console.log('Verifying backup integrity...'); }
    async cleanOldBackups() { console.log('Cleaning old backups...'); }
    async backupPackageFiles(systemStatePath, projectRoot) { console.log('Backing up package files...'); }
    async backupBmadConfig(systemStatePath, projectRoot) { console.log('Backing up BMAD config...'); }
    async backupEnvironmentFiles(systemStatePath, projectRoot) { console.log('Backing up environment files...'); }
    async backupLockFiles(systemStatePath, projectRoot) { console.log('Backing up lock files...'); }
    async backupAgentRegistry(registriesPath, projectRoot) { console.log('Backing up agent registry...'); }
    async backupWorkflowRegistry(registriesPath, projectRoot) { console.log('Backing up workflow registry...'); }
    async backupModuleRegistry(registriesPath, projectRoot) { console.log('Backing up module registry...'); }
    async backupCustomConfigurations(backupPath, config) { console.log('Backing up custom configurations...'); }
    async rollbackFileCreation(rollbackItem, rollbackId) { console.log('Rolling back file creation...'); }
    async rollbackDirectoryCreation(rollbackItem, rollbackId) { console.log('Rolling back directory creation...'); }
    async rollbackConfigurationChange(rollbackItem, rollbackId) { console.log('Rolling back configuration change...'); }
    async rollbackRegistryUpdate(rollbackItem, rollbackId) { console.log('Rolling back registry update...'); }
    async removeModuleConfiguration(module) { console.log(`Removing module configuration: ${module}`); }
    async removeFromGlobalRegistries(module) { console.log(`Removing from registries: ${module}`); }
    async stopBmadServices() { console.log('Stopping BMAD services...'); }
    async restoreConfigurations(backupPath) { console.log('Restoring configurations...'); }
    async restoreRegistries(backupPath) { console.log('Restoring registries...'); }
    async restoreModules(backupPath) { console.log('Restoring modules...'); }
    async restoreCustomFiles(backupPath) { console.log('Restoring custom files...'); }
    async verifyRestoration(backupPath, manifest) { console.log('Verifying restoration...'); }
    async restartBmadServices() { console.log('Restarting BMAD services...'); }
    /**
     * List available backups
     * @returns {Promise<Array>} List of available backups
     */
    async listBackups() {
        const backups = [];
        for (const [backupId, backup] of this.activeBackups) {
            backups.push({
                id: backupId,
                created: backup.created,
                size: await this.getBackupSize(backup.path),
                compressed: backup.compressed,
                verified: backup.verified
            });
        }
        return backups.sort((a, b) => b.created - a.created);
    }
    /**
     * Get backup size
     */
    async getBackupSize(backupPath) {
        try {
            const stats = await fs.stat(backupPath);
            return stats.size;
        }
        catch {
            return 0;
        }
    }
    /**
     * Get rollback history
     * @returns {Array} Rollback history
     */
    getRollbackHistory() {
        return [...this.rollbackHistory].sort((a, b) => b.startTime - a.startTime);
    }
}
module.exports = RollbackManager;
//# sourceMappingURL=rollback-manager.js.map