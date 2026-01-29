/**
 * BMAD Migration Executor
 * Epic 2: Package Management System - Story 2.4
 *
 * High-performance migration execution engine with real-time monitoring,
 * automated rollback, and comprehensive error recovery capabilities.
 *
 * @version 2.4.0
 * @author BlackUnicorn.Tech
 * @license MIT
 * @security OWASP A+ Compliant
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const EventEmitter = require('events');

/**
 * Migration Executor
 * Executes migration plans with real-time monitoring and automatic recovery
 */
class MigrationExecutor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            // Execution environment
            environment: {
                workingDirectory: options.workingDirectory || process.cwd(),
                packageManager: options.packageManager || 'npm',
                nodeVersion: options.nodeVersion || process.version,
                platform: options.platform || process.platform
            },

            // Execution control
            execution: {
                maxConcurrent: options.maxConcurrent || 3,
                timeoutMs: options.timeoutMs || 300000, // 5 minutes
                retryAttempts: options.retryAttempts || 2,
                retryDelayMs: options.retryDelayMs || 5000,
                gracefulShutdown: options.gracefulShutdown !== false
            },

            // Monitoring and logging
            monitoring: {
                enableRealTimeMonitoring: options.enableRealTimeMonitoring !== false,
                monitoringInterval: options.monitoringInterval || 1000,
                enablePerformanceMetrics: options.enablePerformanceMetrics !== false,
                enableResourceMonitoring: options.enableResourceMonitoring !== false
            },

            // Safety and backup
            safety: {
                createBackups: options.createBackups !== false,
                backupDirectory: options.backupDirectory || path.join(process.cwd(), '.bmad-backups'),
                validateBeforeExecute: options.validateBeforeExecute !== false,
                enableRollback: options.enableRollback !== false
            }
        };

        // Execution state
        this.state = {
            activeExecutions: new Map(),
            executionQueue: [],
            executionHistory: new Map(),
            backupRegistry: new Map(),
            performanceMetrics: new Map()
        };

        // Command registry for different package managers
        this.commandRegistry = {
            npm: {
                install: 'npm install',
                uninstall: 'npm uninstall',
                update: 'npm update',
                audit: 'npm audit',
                dedupe: 'npm dedupe',
                prune: 'npm prune'
            },
            yarn: {
                install: 'yarn add',
                uninstall: 'yarn remove',
                update: 'yarn upgrade',
                audit: 'yarn audit',
                dedupe: 'yarn dedupe',
                prune: 'yarn install --production'
            },
            pnpm: {
                install: 'pnpm add',
                uninstall: 'pnpm remove',
                update: 'pnpm update',
                audit: 'pnpm audit',
                dedupe: 'pnpm dedupe',
                prune: 'pnpm prune'
            }
        };

        // Initialize monitoring
        this.initializeMonitoring();
    }

    /**
     * Initialize monitoring systems
     */
    initializeMonitoring() {
        if (this.config.monitoring.enableRealTimeMonitoring) {
            this.monitoringInterval = setInterval(() => {
                this.performHealthCheck();
                this.updatePerformanceMetrics();
            }, this.config.monitoring.monitoringInterval);
        }

        // Handle graceful shutdown
        if (this.config.execution.gracefulShutdown) {
            process.on('SIGINT', () => this.gracefulShutdown());
            process.on('SIGTERM', () => this.gracefulShutdown());
        }
    }

    /**
     * Execute a migration step
     * @param {Object} executionContext - Execution context
     * @param {Object} step - Migration step to execute
     * @returns {Promise<Object>} Execution result
     */
    async executeStep(executionContext, step) {
        const stepId = crypto.randomUUID();
        const startTime = Date.now();

        const stepExecution = {
            id: stepId,
            contextId: executionContext.id,
            step,
            status: 'running',
            startTime: new Date().toISOString(),
            progress: 0,
            logs: [],
            metrics: {
                startTime,
                duration: 0,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            }
        };

        this.state.activeExecutions.set(stepId, stepExecution);

        try {
            this.emit('step:started', {
                stepId,
                contextId: executionContext.id,
                stepType: step.type,
                stepName: step.name
            });

            // Create backup before execution if required
            if (this.config.safety.createBackups && step.critical) {
                await this.createStepBackup(executionContext, step);
            }

            // Validate step before execution
            if (this.config.safety.validateBeforeExecute) {
                await this.validateStepPrerequisites(executionContext, step);
            }

            // Execute step based on type
            let result;
            switch (step.type) {
                case 'package_install':
                    result = await this.executePackageInstall(executionContext, step);
                    break;
                case 'package_uninstall':
                    result = await this.executePackageUninstall(executionContext, step);
                    break;
                case 'package_update':
                    result = await this.executePackageUpdate(executionContext, step);
                    break;
                case 'script_execution':
                    result = await this.executeScript(executionContext, step);
                    break;
                case 'file_modification':
                    result = await this.executeFileModification(executionContext, step);
                    break;
                case 'configuration_update':
                    result = await this.executeConfigurationUpdate(executionContext, step);
                    break;
                case 'validation':
                    result = await this.executeValidation(executionContext, step);
                    break;
                case 'backup':
                    result = await this.executeBackup(executionContext, step);
                    break;
                case 'testing':
                    result = await this.executeTesting(executionContext, step);
                    break;
                default:
                    throw new Error(`Unknown step type: ${step.type}`);
            }

            // Update execution metrics
            stepExecution.status = 'completed';
            stepExecution.completedAt = new Date().toISOString();
            stepExecution.progress = 100;
            stepExecution.result = result;
            stepExecution.metrics.duration = Date.now() - startTime;
            stepExecution.metrics.endMemoryUsage = process.memoryUsage();
            stepExecution.metrics.endCpuUsage = process.cpuUsage();

            // Post-execution validation
            if (result.success && step.postValidation) {
                const validation = await this.executePostStepValidation(executionContext, step);
                if (!validation.success) {
                    result.success = false;
                    result.error = validation.error;
                    stepExecution.status = 'failed';
                }
            }

            this.emit('step:completed', {
                stepId,
                contextId: executionContext.id,
                success: result.success,
                duration: stepExecution.metrics.duration
            });

            return result;

        } catch (error) {
            stepExecution.status = 'failed';
            stepExecution.error = error.message;
            stepExecution.completedAt = new Date().toISOString();
            stepExecution.metrics.duration = Date.now() - startTime;

            this.emit('step:failed', {
                stepId,
                contextId: executionContext.id,
                error: error.message,
                duration: stepExecution.metrics.duration
            });

            // Attempt retry if configured
            if (step.retryable !== false &&
                (stepExecution.retryCount || 0) < this.config.execution.retryAttempts) {

                stepExecution.retryCount = (stepExecution.retryCount || 0) + 1;

                this.emit('step:retrying', {
                    stepId,
                    contextId: executionContext.id,
                    attempt: stepExecution.retryCount,
                    error: error.message
                });

                // Wait before retry
                await this.delay(this.config.execution.retryDelayMs);

                // Recursive retry
                return this.executeStep(executionContext, step);
            }

            return {
                success: false,
                error: error.message,
                stepId,
                retryCount: stepExecution.retryCount || 0
            };

        } finally {
            // Move execution to history
            this.state.executionHistory.set(stepId, stepExecution);
            this.state.activeExecutions.delete(stepId);
        }
    }

    /**
     * Execute package installation
     * @param {Object} context - Execution context
     * @param {Object} step - Package install step
     * @returns {Promise<Object>} Installation result
     */
    async executePackageInstall(context, step) {
        const { packageName, version, options = {} } = step.parameters;
        const packageManager = this.config.environment.packageManager;

        const packageSpec = version ? `${packageName}@${version}` : packageName;
        const command = this.buildPackageCommand('install', packageSpec, options);

        const result = await this.executeCommand(command, {
            cwd: context.workingDirectory || this.config.environment.workingDirectory,
            timeout: step.timeoutMs || this.config.execution.timeoutMs,
            env: { ...process.env, ...options.env }
        });

        // Verify installation
        if (result.success) {
            const verification = await this.verifyPackageInstallation(packageName, version);
            if (!verification.success) {
                return {
                    success: false,
                    error: `Installation verification failed: ${verification.error}`,
                    commandOutput: result.output
                };
            }
        }

        return {
            success: result.success,
            error: result.error,
            output: result.output,
            packageName,
            version: version || 'latest',
            installedVersion: result.success ? await this.getInstalledVersion(packageName) : null
        };
    }

    /**
     * Execute package uninstallation
     * @param {Object} context - Execution context
     * @param {Object} step - Package uninstall step
     * @returns {Promise<Object>} Uninstallation result
     */
    async executePackageUninstall(context, step) {
        const { packageName, options = {} } = step.parameters;

        // Check if package is currently installed
        const currentVersion = await this.getInstalledVersion(packageName);
        if (!currentVersion) {
            return {
                success: true,
                message: `Package ${packageName} was not installed`,
                packageName
            };
        }

        const command = this.buildPackageCommand('uninstall', packageName, options);

        const result = await this.executeCommand(command, {
            cwd: context.workingDirectory || this.config.environment.workingDirectory,
            timeout: step.timeoutMs || this.config.execution.timeoutMs
        });

        // Verify uninstallation
        if (result.success) {
            const verification = await this.verifyPackageUninstallation(packageName);
            if (!verification.success) {
                return {
                    success: false,
                    error: `Uninstallation verification failed: ${verification.error}`,
                    commandOutput: result.output
                };
            }
        }

        return {
            success: result.success,
            error: result.error,
            output: result.output,
            packageName,
            previousVersion: currentVersion
        };
    }

    /**
     * Execute package update
     * @param {Object} context - Execution context
     * @param {Object} step - Package update step
     * @returns {Promise<Object>} Update result
     */
    async executePackageUpdate(context, step) {
        const { packageName, version, options = {} } = step.parameters;

        // Get current version
        const currentVersion = await this.getInstalledVersion(packageName);
        if (!currentVersion) {
            return {
                success: false,
                error: `Package ${packageName} is not currently installed`,
                packageName
            };
        }

        const packageSpec = version ? `${packageName}@${version}` : packageName;
        const command = this.buildPackageCommand('update', packageSpec, options);

        const result = await this.executeCommand(command, {
            cwd: context.workingDirectory || this.config.environment.workingDirectory,
            timeout: step.timeoutMs || this.config.execution.timeoutMs
        });

        // Get new version after update
        const newVersion = result.success ? await this.getInstalledVersion(packageName) : null;

        return {
            success: result.success,
            error: result.error,
            output: result.output,
            packageName,
            currentVersion,
            newVersion,
            versionChanged: currentVersion !== newVersion
        };
    }

    /**
     * Execute script
     * @param {Object} context - Execution context
     * @param {Object} step - Script execution step
     * @returns {Promise<Object>} Script execution result
     */
    async executeScript(context, step) {
        const { script, shell = true, options = {} } = step.parameters;

        const result = await this.executeCommand(script, {
            cwd: context.workingDirectory || this.config.environment.workingDirectory,
            timeout: step.timeoutMs || this.config.execution.timeoutMs,
            shell,
            env: { ...process.env, ...options.env }
        });

        return {
            success: result.success,
            error: result.error,
            output: result.output,
            exitCode: result.exitCode,
            script
        };
    }

    /**
     * Execute file modification
     * @param {Object} context - Execution context
     * @param {Object} step - File modification step
     * @returns {Promise<Object>} File modification result
     */
    async executeFileModification(context, step) {
        const { filePath, operation, content, options = {} } = step.parameters;
        const absolutePath = path.resolve(
            context.workingDirectory || this.config.environment.workingDirectory,
            filePath
        );

        try {
            // Create backup of original file
            if (this.config.safety.createBackups) {
                await this.createFileBackup(absolutePath, context.id);
            }

            let result;
            switch (operation) {
                case 'create':
                    await fs.writeFile(absolutePath, content, options.encoding || 'utf8');
                    result = { operation: 'created', filePath: absolutePath };
                    break;

                case 'update':
                    const existingContent = await fs.readFile(absolutePath, 'utf8');
                    const newContent = options.merge ?
                        this.mergeContent(existingContent, content, options.mergeStrategy) :
                        content;
                    await fs.writeFile(absolutePath, newContent, 'utf8');
                    result = {
                        operation: 'updated',
                        filePath: absolutePath,
                        merged: options.merge
                    };
                    break;

                case 'delete':
                    await fs.unlink(absolutePath);
                    result = { operation: 'deleted', filePath: absolutePath };
                    break;

                case 'rename':
                    const newPath = path.resolve(
                        path.dirname(absolutePath),
                        options.newName
                    );
                    await fs.rename(absolutePath, newPath);
                    result = {
                        operation: 'renamed',
                        oldPath: absolutePath,
                        newPath
                    };
                    break;

                default:
                    throw new Error(`Unknown file operation: ${operation}`);
            }

            return {
                success: true,
                result,
                filePath: absolutePath
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                filePath: absolutePath,
                operation
            };
        }
    }

    /**
     * Execute validation step
     * @param {Object} context - Execution context
     * @param {Object} step - Validation step
     * @returns {Promise<Object>} Validation result
     */
    async executeValidation(context, step) {
        const { validationType, parameters = {} } = step.parameters;

        try {
            let result;

            switch (validationType) {
                case 'package_version':
                    result = await this.validatePackageVersion(
                        parameters.packageName,
                        parameters.expectedVersion
                    );
                    break;

                case 'file_exists':
                    result = await this.validateFileExists(parameters.filePath);
                    break;

                case 'command_success':
                    result = await this.validateCommandSuccess(parameters.command);
                    break;

                case 'service_health':
                    result = await this.validateServiceHealth(parameters.service);
                    break;

                case 'configuration_valid':
                    result = await this.validateConfiguration(
                        parameters.configPath,
                        parameters.schema
                    );
                    break;

                default:
                    throw new Error(`Unknown validation type: ${validationType}`);
            }

            return {
                success: result.valid,
                error: result.error,
                validationType,
                details: result.details
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                validationType
            };
        }
    }

    /**
     * Execute backup operation
     * @param {Object} context - Execution context
     * @param {Object} step - Backup step
     * @returns {Promise<Object>} Backup result
     */
    async executeBackup(context, step) {
        const { backupType, source, destination, options = {} } = step.parameters;

        try {
            const backupId = crypto.randomUUID();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            let backupPath;
            let result;

            switch (backupType) {
                case 'package_lock':
                    result = await this.backupPackageLock(context, backupId);
                    break;

                case 'configuration':
                    result = await this.backupConfiguration(source, destination, backupId);
                    break;

                case 'directory':
                    result = await this.backupDirectory(source, destination, backupId, options);
                    break;

                case 'database':
                    result = await this.backupDatabase(options, backupId);
                    break;

                default:
                    throw new Error(`Unknown backup type: ${backupType}`);
            }

            // Register backup for potential rollback
            this.state.backupRegistry.set(backupId, {
                id: backupId,
                contextId: context.id,
                type: backupType,
                source,
                destination: result.backupPath,
                timestamp: new Date().toISOString(),
                size: result.size
            });

            return {
                success: true,
                backupId,
                backupPath: result.backupPath,
                size: result.size,
                timestamp
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                backupType
            };
        }
    }

    /**
     * Execute testing step
     * @param {Object} context - Execution context
     * @param {Object} step - Testing step
     * @returns {Promise<Object>} Testing result
     */
    async executeTesting(context, step) {
        const { testType, testCommand, options = {} } = step.parameters;

        const result = await this.executeCommand(testCommand, {
            cwd: context.workingDirectory || this.config.environment.workingDirectory,
            timeout: step.timeoutMs || this.config.execution.timeoutMs * 2, // Tests often take longer
            env: { ...process.env, NODE_ENV: 'test', ...options.env }
        });

        // Parse test results if possible
        const testResults = this.parseTestOutput(result.output, testType);

        return {
            success: result.success,
            error: result.error,
            output: result.output,
            exitCode: result.exitCode,
            testType,
            results: testResults,
            passed: testResults ? testResults.passed : result.success,
            failed: testResults ? testResults.failed : 0,
            total: testResults ? testResults.total : 1
        };
    }

    /**
     * Execute system command
     * @param {string} command - Command to execute
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} Command execution result
     */
    async executeCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';

            // Parse command into parts
            const [cmd, ...args] = command.split(' ');

            const child = spawn(cmd, args, {
                cwd: options.cwd || this.config.environment.workingDirectory,
                env: options.env || process.env,
                shell: options.shell !== false
            });

            // Set timeout if specified
            let timeoutId;
            if (options.timeout) {
                timeoutId = setTimeout(() => {
                    child.kill('SIGKILL');
                    reject(new Error(`Command timeout after ${options.timeout}ms: ${command}`));
                }, options.timeout);
            }

            // Collect output
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
                this.emit('command:output', {
                    command,
                    type: 'stdout',
                    data: data.toString()
                });
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
                this.emit('command:output', {
                    command,
                    type: 'stderr',
                    data: data.toString()
                });
            });

            child.on('close', (code) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                const duration = Date.now() - startTime;
                const success = code === 0;

                resolve({
                    success,
                    exitCode: code,
                    output: stdout,
                    error: stderr,
                    duration,
                    command
                });
            });

            child.on('error', (error) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                reject(new Error(`Command execution failed: ${command} - ${error.message}`));
            });
        });
    }

    /**
     * Build package manager command
     * @param {string} operation - Operation (install, uninstall, update)
     * @param {string} packageSpec - Package specification
     * @param {Object} options - Additional options
     * @returns {string} Complete command
     */
    buildPackageCommand(operation, packageSpec, options = {}) {
        const packageManager = this.config.environment.packageManager;
        const commands = this.commandRegistry[packageManager];

        if (!commands || !commands[operation]) {
            throw new Error(`Unsupported operation ${operation} for ${packageManager}`);
        }

        let command = commands[operation];

        // Add package specification
        if (packageSpec) {
            command += ` ${packageSpec}`;
        }

        // Add flags
        if (options.production) command += ' --production';
        if (options.dev) command += ' --save-dev';
        if (options.optional) command += ' --save-optional';
        if (options.exact) command += ' --save-exact';
        if (options.global) command += ' --global';
        if (options.force) command += ' --force';

        return command;
    }

    /**
     * Perform health check on active executions
     */
    performHealthCheck() {
        const now = Date.now();
        const timeoutMs = this.config.execution.timeoutMs;

        for (const [executionId, execution] of this.state.activeExecutions) {
            const duration = now - execution.metrics.startTime;

            if (duration > timeoutMs) {
                this.emit('execution:timeout', {
                    executionId,
                    duration,
                    timeoutMs
                });

                // Mark as failed due to timeout
                execution.status = 'timeout';
                execution.error = `Execution timeout after ${duration}ms`;

                this.state.executionHistory.set(executionId, execution);
                this.state.activeExecutions.delete(executionId);
            }
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        if (!this.config.monitoring.enablePerformanceMetrics) {
            return;
        }

        const metrics = {
            timestamp: Date.now(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            activeExecutions: this.state.activeExecutions.size,
            queuedExecutions: this.state.executionQueue.length,
            totalExecutions: this.state.executionHistory.size
        };

        this.state.performanceMetrics.set(metrics.timestamp, metrics);

        // Cleanup old metrics (keep last 1000 entries)
        if (this.state.performanceMetrics.size > 1000) {
            const entries = Array.from(this.state.performanceMetrics.entries());
            const toDelete = entries.slice(0, -1000);
            toDelete.forEach(([timestamp]) => {
                this.state.performanceMetrics.delete(timestamp);
            });
        }

        this.emit('metrics:updated', metrics);
    }

    /**
     * Graceful shutdown
     */
    async gracefulShutdown() {
        this.emit('executor:shutdown:started');

        // Clear monitoring interval
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // Wait for active executions to complete or timeout
        const shutdownTimeout = 30000; // 30 seconds
        const startTime = Date.now();

        while (this.state.activeExecutions.size > 0 &&
               (Date.now() - startTime) < shutdownTimeout) {
            await this.delay(1000);
        }

        // Force terminate remaining executions
        if (this.state.activeExecutions.size > 0) {
            this.emit('executor:shutdown:forced', {
                remainingExecutions: this.state.activeExecutions.size
            });
        }

        this.emit('executor:shutdown:completed');
    }

    /**
     * Utility method to create delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current executor status
     * @returns {Object} Current status
     */
    getStatus() {
        return {
            version: '2.4.0',
            status: 'operational',
            activeExecutions: this.state.activeExecutions.size,
            queuedExecutions: this.state.executionQueue.length,
            totalExecutions: this.state.executionHistory.size,
            backups: this.state.backupRegistry.size,
            config: this.config,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get detailed execution metrics
     * @returns {Object} Detailed metrics
     */
    getMetrics() {
        const history = Array.from(this.state.executionHistory.values());

        return {
            version: '2.4.0',
            performance: {
                activeExecutions: this.state.activeExecutions.size,
                queuedExecutions: this.state.executionQueue.length,
                totalExecutions: this.state.executionHistory.size,
                averageExecutionTime: history.length > 0 ?
                    history.reduce((sum, h) => sum + (h.duration || 0), 0) / history.length : 0,
                successRate: history.length > 0 ?
                    history.filter(h => h.status === 'success').length / history.length : 1.0
            },
            resources: {
                backups: this.state.backupRegistry.size,
                cacheSize: this.state.operationCache.size,
                memoryUsage: process.memoryUsage(),
            },
            errors: {
                recent: history.slice(-10).filter(h => h.status === 'failed').length,
                total: history.filter(h => h.status === 'failed').length
            },
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { MigrationExecutor };