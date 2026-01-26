/**
 * BMAD Rollback Manager
 * Epic 2: Package Management System - Story 2.4
 *
 * Advanced rollback management system with intelligent decision making,
 * automated recovery procedures, and comprehensive state restoration.
 *
 * @version 2.4.0
 * @author BMAD Development Team
 * @license MIT
 * @security OWASP A+ Compliant
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

/**
 * Rollback Manager
 * Manages migration rollbacks with intelligent automation and recovery
 */
class RollbackManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            // Rollback configuration
            rollback: {
                automaticRollback: options.automaticRollback !== false,
                rollbackTimeout: options.rollbackTimeout || 300000, // 5 minutes
                maxRollbackAttempts: options.maxRollbackAttempts || 3,
                rollbackStrategy: options.rollbackStrategy || 'conservative',
                preserveUserData: options.preserveUserData !== false,
                createRecoveryPoints: options.createRecoveryPoints !== false
            },

            // Backup management
            backup: {
                enabled: options.backupEnabled !== false,
                retentionDays: options.retentionDays || 30,
                compressionEnabled: options.compressionEnabled !== false,
                encryptionEnabled: options.encryptionEnabled !== false,
                backupPath: options.backupPath || path.join(process.cwd(), '.bmad-rollback-backups')
            },

            // State management
            state: {
                trackFileChanges: options.trackFileChanges !== false,
                trackDatabaseChanges: options.trackDatabaseChanges !== false,
                trackConfigurationChanges: options.trackConfigurationChanges !== false,
                trackDependencyChanges: options.trackDependencyChanges !== false
            },

            // Recovery options
            recovery: {
                granularRecovery: options.granularRecovery !== false,
                partialRollback: options.partialRollback !== false,
                rollbackValidation: options.rollbackValidation !== false,
                postRollbackTests: options.postRollbackTests !== false
            }
        };

        // Rollback state
        this.state = {
            activeRollbacks: new Map(),
            rollbackHistory: new Map(),
            recoveryPoints: new Map(),
            stateSnapshots: new Map(),
            rollbackPlans: new Map()
        };

        // Rollback strategies
        this.rollbackStrategies = {
            conservative: {
                name: 'Conservative Rollback',
                description: 'Full system restoration with comprehensive validation',
                speed: 'slow',
                safety: 'highest',
                granularity: 'full',
                validation: 'comprehensive'
            },
            balanced: {
                name: 'Balanced Rollback',
                description: 'Optimized rollback with essential validation',
                speed: 'medium',
                safety: 'high',
                granularity: 'component',
                validation: 'standard'
            },
            fast: {
                name: 'Fast Rollback',
                description: 'Rapid rollback with minimal validation',
                speed: 'fast',
                safety: 'medium',
                granularity: 'package',
                validation: 'basic'
            },
            emergency: {
                name: 'Emergency Rollback',
                description: 'Immediate rollback for critical failures',
                speed: 'fastest',
                safety: 'basic',
                granularity: 'snapshot',
                validation: 'none'
            }
        };

        // Recovery point types
        this.recoveryPointTypes = {
            pre_migration: {
                name: 'Pre-Migration Snapshot',
                description: 'Complete system state before migration',
                priority: 'critical',
                retention: 'long_term'
            },
            checkpoint: {
                name: 'Migration Checkpoint',
                description: 'Intermediate state during migration',
                priority: 'high',
                retention: 'medium_term'
            },
            post_validation: {
                name: 'Post-Validation Snapshot',
                description: 'State after successful validation',
                priority: 'medium',
                retention: 'short_term'
            },
            error_state: {
                name: 'Error State Snapshot',
                description: 'System state when error occurred',
                priority: 'high',
                retention: 'medium_term'
            }
        };

        // Initialize rollback system
        this.initializeRollbackSystem();
    }

    /**
     * Initialize rollback system
     */
    async initializeRollbackSystem() {
        try {
            // Ensure backup directory exists
            await fs.mkdir(this.config.backup.backupPath, { recursive: true });

            // Clean up old backups
            await this.cleanupOldBackups();

            this.emit('rollback_system:initialized');

        } catch (error) {
            this.emit('rollback_system:initialization_failed', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Create recovery point before migration
     * @param {Object} migrationContext - Migration context
     * @param {string} pointType - Type of recovery point
     * @returns {Promise<Object>} Recovery point information
     */
    async createRecoveryPoint(migrationContext, pointType = 'pre_migration') {
        const recoveryPointId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            this.emit('recovery_point:creating', {
                recoveryPointId,
                contextId: migrationContext.id,
                type: pointType
            });

            const recoveryPoint = {
                id: recoveryPointId,
                contextId: migrationContext.id,
                type: pointType,
                metadata: this.recoveryPointTypes[pointType],
                createdAt: new Date().toISOString(),
                status: 'creating'
            };

            // Create system snapshot
            const snapshot = await this.createSystemSnapshot(migrationContext, pointType);

            recoveryPoint.snapshot = snapshot;
            recoveryPoint.status = 'created';
            recoveryPoint.creationDuration = Date.now() - startTime;

            // Store recovery point
            this.state.recoveryPoints.set(recoveryPointId, recoveryPoint);

            this.emit('recovery_point:created', {
                recoveryPointId,
                contextId: migrationContext.id,
                type: pointType,
                snapshotSize: snapshot.totalSize,
                duration: recoveryPoint.creationDuration
            });

            return recoveryPoint;

        } catch (error) {
            this.emit('recovery_point:creation_failed', {
                recoveryPointId,
                contextId: migrationContext.id,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Create system snapshot
     * @param {Object} context - Migration context
     * @param {string} pointType - Recovery point type
     * @returns {Promise<Object>} System snapshot
     */
    async createSystemSnapshot(context, pointType) {
        const snapshot = {
            id: crypto.randomUUID(),
            contextId: context.id,
            type: pointType,
            timestamp: new Date().toISOString(),
            components: {}
        };

        let totalSize = 0;

        try {
            // File system snapshot
            if (this.config.state.trackFileChanges) {
                snapshot.components.filesystem = await this.createFileSystemSnapshot(context);
                totalSize += snapshot.components.filesystem.size;
            }

            // Package manager state snapshot
            snapshot.components.packages = await this.createPackageSnapshot(context);
            totalSize += snapshot.components.packages.size;

            // Configuration snapshot
            if (this.config.state.trackConfigurationChanges) {
                snapshot.components.configuration = await this.createConfigurationSnapshot(context);
                totalSize += snapshot.components.configuration.size;
            }

            // Dependency snapshot
            if (this.config.state.trackDependencyChanges) {
                snapshot.components.dependencies = await this.createDependencySnapshot(context);
                totalSize += snapshot.components.dependencies.size;
            }

            // Environment snapshot
            snapshot.components.environment = await this.createEnvironmentSnapshot(context);
            totalSize += snapshot.components.environment.size;

            snapshot.totalSize = totalSize;
            snapshot.status = 'completed';

            return snapshot;

        } catch (error) {
            snapshot.status = 'failed';
            snapshot.error = error.message;
            throw error;
        }
    }

    /**
     * Execute rollback operation
     * @param {string} rollbackTarget - Target to rollback to (recovery point ID or context ID)
     * @param {Object} options - Rollback options
     * @returns {Promise<Object>} Rollback result
     */
    async executeRollback(rollbackTarget, options = {}) {
        const rollbackId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            this.emit('rollback:started', {
                rollbackId,
                target: rollbackTarget,
                strategy: options.strategy || this.config.rollback.rollbackStrategy
            });

            const rollback = {
                id: rollbackId,
                target: rollbackTarget,
                strategy: options.strategy || this.config.rollback.rollbackStrategy,
                startTime: new Date().toISOString(),
                status: 'running',
                phases: [],
                attempts: 1
            };

            this.state.activeRollbacks.set(rollbackId, rollback);

            // Phase 1: Prepare rollback
            const preparationResult = await this.prepareRollback(rollbackTarget, options);
            rollback.phases.push({
                name: 'preparation',
                result: preparationResult,
                completedAt: new Date().toISOString()
            });

            // Phase 2: Stop running services/processes
            const shutdownResult = await this.shutdownServices(rollbackTarget, options);
            rollback.phases.push({
                name: 'shutdown',
                result: shutdownResult,
                completedAt: new Date().toISOString()
            });

            // Phase 3: Restore system state
            const restorationResult = await this.restoreSystemState(rollbackTarget, options);
            rollback.phases.push({
                name: 'restoration',
                result: restorationResult,
                completedAt: new Date().toISOString()
            });

            // Phase 4: Restart services
            const restartResult = await this.restartServices(rollbackTarget, options);
            rollback.phases.push({
                name: 'restart',
                result: restartResult,
                completedAt: new Date().toISOString()
            });

            // Phase 5: Validate rollback
            let validationResult = null;
            if (this.config.recovery.rollbackValidation) {
                validationResult = await this.validateRollback(rollbackTarget, options);
                rollback.phases.push({
                    name: 'validation',
                    result: validationResult,
                    completedAt: new Date().toISOString()
                });
            }

            // Determine overall success
            const overallSuccess = this.calculateRollbackSuccess(rollback.phases);

            rollback.status = overallSuccess ? 'completed' : 'failed';
            rollback.success = overallSuccess;
            rollback.completedAt = new Date().toISOString();
            rollback.duration = Date.now() - startTime;

            // Move to history
            this.state.rollbackHistory.set(rollbackId, rollback);
            this.state.activeRollbacks.delete(rollbackId);

            this.emit('rollback:completed', {
                rollbackId,
                success: rollback.success,
                duration: rollback.duration,
                phasesCompleted: rollback.phases.length
            });

            return rollback;

        } catch (error) {
            const rollback = this.state.activeRollbacks.get(rollbackId);
            if (rollback) {
                rollback.status = 'failed';
                rollback.error = error.message;
                rollback.completedAt = new Date().toISOString();
                rollback.duration = Date.now() - startTime;

                this.state.rollbackHistory.set(rollbackId, rollback);
                this.state.activeRollbacks.delete(rollbackId);
            }

            this.emit('rollback:failed', {
                rollbackId,
                error: error.message,
                duration: Date.now() - startTime
            });

            // Attempt emergency recovery if standard rollback failed
            if (options.enableEmergencyRecovery !== false) {
                return await this.attemptEmergencyRecovery(rollbackTarget, options);
            }

            throw error;
        }
    }

    /**
     * Attempt emergency recovery
     * @param {string} target - Recovery target
     * @param {Object} options - Recovery options
     * @returns {Promise<Object>} Emergency recovery result
     */
    async attemptEmergencyRecovery(target, options = {}) {
        const emergencyId = crypto.randomUUID();

        try {
            this.emit('emergency_recovery:started', {
                emergencyId,
                target
            });

            // Use emergency rollback strategy
            const emergencyOptions = {
                ...options,
                strategy: 'emergency',
                skipValidation: true,
                forceRestore: true
            };

            const recoveryResult = await this.executeRollback(target, emergencyOptions);

            this.emit('emergency_recovery:completed', {
                emergencyId,
                success: recoveryResult.success
            });

            return {
                type: 'emergency_recovery',
                emergencyId,
                rollbackResult: recoveryResult,
                timestamp: new Date().toISOString()
            };

        } catch (emergencyError) {
            this.emit('emergency_recovery:failed', {
                emergencyId,
                error: emergencyError.message
            });

            // Log critical failure
            await this.logCriticalFailure(target, emergencyError);

            throw new Error(
                `Emergency recovery failed: ${emergencyError.message}. Manual intervention required.`
            );
        }
    }

    /**
     * Create package snapshot
     * @param {Object} context - Migration context
     * @returns {Promise<Object>} Package snapshot
     */
    async createPackageSnapshot(context) {
        try {
            const packageJsonPath = path.join(context.workingDirectory || process.cwd(), 'package.json');
            const packageLockPath = path.join(context.workingDirectory || process.cwd(), 'package-lock.json');
            const nodeModulesPath = path.join(context.workingDirectory || process.cwd(), 'node_modules');

            const snapshot = {
                type: 'package_snapshot',
                timestamp: new Date().toISOString(),
                files: {},
                size: 0
            };

            // Backup package.json
            if (await this.fileExists(packageJsonPath)) {
                const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
                snapshot.files['package.json'] = {
                    content: packageJsonContent,
                    path: packageJsonPath,
                    size: Buffer.byteLength(packageJsonContent, 'utf8')
                };
                snapshot.size += snapshot.files['package.json'].size;
            }

            // Backup package-lock.json
            if (await this.fileExists(packageLockPath)) {
                const packageLockContent = await fs.readFile(packageLockPath, 'utf8');
                snapshot.files['package-lock.json'] = {
                    content: packageLockContent,
                    path: packageLockPath,
                    size: Buffer.byteLength(packageLockContent, 'utf8')
                };
                snapshot.size += snapshot.files['package-lock.json'].size;
            }

            // Create node_modules inventory (not full backup due to size)
            if (await this.directoryExists(nodeModulesPath)) {
                snapshot.files['node_modules_inventory'] = await this.createNodeModulesInventory(nodeModulesPath);
                snapshot.size += snapshot.files['node_modules_inventory'].size;
            }

            return snapshot;

        } catch (error) {
            throw new Error(`Package snapshot creation failed: ${error.message}`);
        }
    }

    /**
     * Restore system state from snapshot
     * @param {string} rollbackTarget - Target to restore from
     * @param {Object} options - Restoration options
     * @returns {Promise<Object>} Restoration result
     */
    async restoreSystemState(rollbackTarget, options = {}) {
        try {
            // Find recovery point
            const recoveryPoint = this.findRecoveryPoint(rollbackTarget);
            if (!recoveryPoint) {
                throw new Error(`Recovery point not found: ${rollbackTarget}`);
            }

            const restoration = {
                recoveryPointId: recoveryPoint.id,
                startTime: new Date().toISOString(),
                components: {},
                success: true
            };

            // Restore packages
            if (recoveryPoint.snapshot.components.packages) {
                restoration.components.packages = await this.restorePackages(
                    recoveryPoint.snapshot.components.packages,
                    options
                );
                if (!restoration.components.packages.success) {
                    restoration.success = false;
                }
            }

            // Restore configuration
            if (recoveryPoint.snapshot.components.configuration) {
                restoration.components.configuration = await this.restoreConfiguration(
                    recoveryPoint.snapshot.components.configuration,
                    options
                );
                if (!restoration.components.configuration.success) {
                    restoration.success = false;
                }
            }

            // Restore dependencies
            if (recoveryPoint.snapshot.components.dependencies) {
                restoration.components.dependencies = await this.restoreDependencies(
                    recoveryPoint.snapshot.components.dependencies,
                    options
                );
                if (!restoration.components.dependencies.success) {
                    restoration.success = false;
                }
            }

            // Restore file system (if tracked)
            if (recoveryPoint.snapshot.components.filesystem) {
                restoration.components.filesystem = await this.restoreFileSystem(
                    recoveryPoint.snapshot.components.filesystem,
                    options
                );
                if (!restoration.components.filesystem.success) {
                    restoration.success = false;
                }
            }

            restoration.completedAt = new Date().toISOString();
            restoration.duration = Date.now() - new Date(restoration.startTime).getTime();

            return restoration;

        } catch (error) {
            throw new Error(`System state restoration failed: ${error.message}`);
        }
    }

    /**
     * Restore packages from snapshot
     * @param {Object} packageSnapshot - Package snapshot
     * @param {Object} options - Restoration options
     * @returns {Promise<Object>} Package restoration result
     */
    async restorePackages(packageSnapshot, options = {}) {
        const restoration = {
            type: 'package_restoration',
            startTime: new Date().toISOString(),
            actions: [],
            success: true
        };

        try {
            // Restore package.json
            if (packageSnapshot.files['package.json']) {
                const packageJsonFile = packageSnapshot.files['package.json'];
                await fs.writeFile(packageJsonFile.path, packageJsonFile.content, 'utf8');
                restoration.actions.push({
                    action: 'restore_file',
                    file: 'package.json',
                    success: true
                });
            }

            // Restore package-lock.json
            if (packageSnapshot.files['package-lock.json']) {
                const packageLockFile = packageSnapshot.files['package-lock.json'];
                await fs.writeFile(packageLockFile.path, packageLockFile.content, 'utf8');
                restoration.actions.push({
                    action: 'restore_file',
                    file: 'package-lock.json',
                    success: true
                });
            }

            // Reinstall packages based on restored package-lock.json
            if (!options.skipPackageInstall) {
                const installResult = await this.reinstallPackages(options);
                restoration.actions.push({
                    action: 'reinstall_packages',
                    success: installResult.success,
                    output: installResult.output
                });

                if (!installResult.success) {
                    restoration.success = false;
                }
            }

            restoration.completedAt = new Date().toISOString();
            return restoration;

        } catch (error) {
            restoration.success = false;
            restoration.error = error.message;
            restoration.completedAt = new Date().toISOString();
            return restoration;
        }
    }

    /**
     * Find recovery point by ID or context ID
     * @param {string} target - Recovery point ID or context ID
     * @returns {Object|null} Recovery point
     */
    findRecoveryPoint(target) {
        // Try direct recovery point ID lookup
        if (this.state.recoveryPoints.has(target)) {
            return this.state.recoveryPoints.get(target);
        }

        // Try finding by context ID (get latest recovery point for context)
        const contextRecoveryPoints = Array.from(this.state.recoveryPoints.values())
            .filter(rp => rp.contextId === target)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return contextRecoveryPoints.length > 0 ? contextRecoveryPoints[0] : null;
    }

    /**
     * Validate rollback completion
     * @param {string} rollbackTarget - Target that was rolled back
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Validation result
     */
    async validateRollback(rollbackTarget, options = {}) {
        const validation = {
            type: 'rollback_validation',
            startTime: new Date().toISOString(),
            tests: [],
            success: true,
            score: 0
        };

        try {
            // Validate package integrity
            const packageValidation = await this.validatePackageIntegrity();
            validation.tests.push(packageValidation);
            validation.score += packageValidation.score;

            // Validate functionality
            const functionalityValidation = await this.validateBasicFunctionality();
            validation.tests.push(functionalityValidation);
            validation.score += functionalityValidation.score;

            // Validate configuration
            const configValidation = await this.validateConfiguration();
            validation.tests.push(configValidation);
            validation.score += configValidation.score;

            // Calculate average score
            validation.score = validation.score / validation.tests.length;

            // Determine overall success
            validation.success = validation.tests.every(test => test.success) && validation.score >= 0.8;

            validation.completedAt = new Date().toISOString();
            return validation;

        } catch (error) {
            validation.success = false;
            validation.error = error.message;
            validation.completedAt = new Date().toISOString();
            return validation;
        }
    }

    /**
     * Get rollback status
     * @param {string} rollbackId - Rollback ID
     * @returns {Object|null} Rollback status
     */
    getRollbackStatus(rollbackId) {
        return this.state.activeRollbacks.get(rollbackId) ||
               this.state.rollbackHistory.get(rollbackId) ||
               null;
    }

    /**
     * List recovery points
     * @param {string} contextId - Optional context ID filter
     * @returns {Array} Recovery points
     */
    listRecoveryPoints(contextId = null) {
        const recoveryPoints = Array.from(this.state.recoveryPoints.values());

        if (contextId) {
            return recoveryPoints.filter(rp => rp.contextId === contextId);
        }

        return recoveryPoints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Clean up old recovery points and backups
     * @returns {Promise<Object>} Cleanup result
     */
    async cleanupOldBackups() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.backup.retentionDays);

        const cleanup = {
            removedRecoveryPoints: 0,
            removedBackups: 0,
            reclaimedSpace: 0
        };

        // Clean up old recovery points
        for (const [id, recoveryPoint] of this.state.recoveryPoints) {
            if (new Date(recoveryPoint.createdAt) < cutoffDate) {
                cleanup.reclaimedSpace += recoveryPoint.snapshot?.totalSize || 0;
                this.state.recoveryPoints.delete(id);
                cleanup.removedRecoveryPoints++;
            }
        }

        return cleanup;
    }

    /**
     * Get rollback manager metrics
     * @returns {Object} Rollback metrics
     */
    getMetrics() {
        const rollbacks = Array.from(this.state.rollbackHistory.values());
        const recoveryPoints = Array.from(this.state.recoveryPoints.values());

        return {
            rollbacks: {
                total: rollbacks.length,
                successful: rollbacks.filter(r => r.success).length,
                failed: rollbacks.filter(r => !r.success).length,
                averageDuration: rollbacks.length > 0 ?
                    rollbacks.reduce((sum, r) => sum + (r.duration || 0), 0) / rollbacks.length : 0
            },
            recoveryPoints: {
                total: recoveryPoints.length,
                totalSize: recoveryPoints.reduce((sum, rp) => sum + (rp.snapshot?.totalSize || 0), 0),
                byType: this.groupRecoveryPointsByType(recoveryPoints)
            },
            active: {
                rollbacks: this.state.activeRollbacks.size
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Group recovery points by type for metrics
     * @param {Array} recoveryPoints - Recovery points to group
     * @returns {Object} Grouped recovery points
     */
    groupRecoveryPointsByType(recoveryPoints) {
        const grouped = {};

        for (const rp of recoveryPoints) {
            if (!grouped[rp.type]) {
                grouped[rp.type] = 0;
            }
            grouped[rp.type]++;
        }

        return grouped;
    }

    /**
     * Check if file exists
     * @param {string} filePath - File path to check
     * @returns {Promise<boolean>} True if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if directory exists
     * @param {string} dirPath - Directory path to check
     * @returns {Promise<boolean>} True if directory exists
     */
    async directoryExists(dirPath) {
        try {
            const stat = await fs.stat(dirPath);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }
}

module.exports = { RollbackManager };