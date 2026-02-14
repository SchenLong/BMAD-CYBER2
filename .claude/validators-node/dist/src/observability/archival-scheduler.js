/**
 * BMAD Guardrails: Archival Scheduler Integration
 * ==============================================
 * Integrates log archival with audit logger for automated daily archival.
 *
 * Features:
 * - Cron-based scheduling for automated archival
 * - Integration with existing audit logging system
 * - Progress tracking and status reporting
 * - Error handling with retry logic
 * - Health checks and monitoring hooks
 * - Manual archival triggers
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { getProjectDir } from '../common/path-utils.js';
import { AuditLogger } from '../common/audit-logger.js';
import { ArchivalError, runDailyArchival } from './log-archiver.js';
import { ArchivalConfigManager } from './archival-config.js';
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
/**
 * Archive scheduler for automating log archival operations.
 */
export class ArchivalScheduler {
    configManager;
    statusFile;
    logFile;
    isInitialized = false;
    currentJob = null;
    constructor() {
        this.configManager = new ArchivalConfigManager();
        this.statusFile = path.join(getProjectDir(), '.claude', 'archival-status.json');
        this.logFile = path.join(getProjectDir(), '.claude', 'logs', 'archival.log');
    }
    /**
     * Initialize the scheduler.
     */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Ensure directories exist
            await mkdir(path.dirname(this.statusFile), { recursive: true });
            await mkdir(path.dirname(this.logFile), { recursive: true });
            // Initialize status file if it doesn't exist
            try {
                await access(this.statusFile);
            }
            catch {
                await this.saveStatus({
                    isRunning: false,
                    consecutiveFailures: 0,
                    totalRuns: 0,
                    totalSuccess: 0,
                    totalFailures: 0,
                });
            }
            this.isInitialized = true;
            await AuditLogger.log('archival_scheduler', 'INITIALIZED', { statusFile: this.statusFile, logFile: this.logFile }, 'INFO');
        }
        catch (error) {
            throw new ArchivalError(`Failed to initialize scheduler: ${error instanceof Error ? error.message : String(error)}`, 'SCHEDULER_INIT_ERROR');
        }
    }
    /**
     * Run archival job manually.
     */
    async runArchivalJob() {
        await this.initialize();
        // Check if job is already running
        const status = await this.getStatus();
        if (status.isRunning) {
            throw new ArchivalError('Archival job is already running', 'JOB_ALREADY_RUNNING');
        }
        // Start the job
        this.currentJob = this.executeArchivalJob();
        return await this.currentJob;
    }
    /**
     * Execute the actual archival job.
     */
    async executeArchivalJob() {
        const startTime = new Date().toISOString();
        const startTimestamp = Date.now();
        // Update status to running
        let status = await this.getStatus();
        status.isRunning = true;
        status.lastRun = startTime;
        await this.saveStatus(status);
        try {
            await AuditLogger.log('archival_scheduler', 'JOB_STARTED', { startTime }, 'INFO');
            // Validate configuration before running
            const configValidation = await this.configManager.loadConfiguration();
            if (!configValidation.isValid) {
                throw new ArchivalError(`Configuration invalid: ${configValidation.errors.join(', ')}`, 'INVALID_CONFIG');
            }
            // Run the archival
            const archiveResult = await runDailyArchival();
            const endTime = new Date().toISOString();
            const duration = Date.now() - startTimestamp;
            // Update status with success
            status = await this.getStatus();
            status.isRunning = false;
            status.lastSuccess = endTime;
            status.consecutiveFailures = 0; // Reset failure count
            status.totalRuns++;
            status.totalSuccess++;
            await this.saveStatus(status);
            const result = {
                success: true,
                startTime,
                endTime,
                duration,
                archiveId: archiveResult.archiveId,
                filesArchived: archiveResult.metadata.logFileCount,
                bytesArchived: archiveResult.metadata.compressedSize,
            };
            await this.logJobResult(result);
            await AuditLogger.log('archival_scheduler', 'JOB_COMPLETED', {
                duration: `${duration}ms`,
                archiveId: result.archiveId,
                filesArchived: result.filesArchived,
                bytesArchived: result.bytesArchived,
            }, 'INFO');
            return result;
        }
        catch (error) {
            const endTime = new Date().toISOString();
            const duration = Date.now() - startTimestamp;
            // Update status with failure
            status = await this.getStatus();
            status.isRunning = false;
            status.lastFailure = endTime;
            status.consecutiveFailures++;
            status.totalRuns++;
            status.totalFailures++;
            await this.saveStatus(status);
            const result = {
                success: false,
                startTime,
                endTime,
                duration,
                error: error instanceof Error ? error.message : String(error),
            };
            await this.logJobResult(result);
            await AuditLogger.log('archival_scheduler', 'JOB_FAILED', {
                duration: `${duration}ms`,
                error: result.error,
                consecutiveFailures: status.consecutiveFailures,
            }, 'BLOCKED');
            // Alert on failure if configured
            if (status.consecutiveFailures >= 3) {
                await this.sendFailureAlert(status, result);
            }
            throw error;
        }
        finally {
            this.currentJob = null;
        }
    }
    /**
     * Get current scheduler status.
     */
    async getStatus() {
        try {
            const content = await readFile(this.statusFile, 'utf8');
            return JSON.parse(content);
        }
        catch {
            // Return default status if file doesn't exist or is corrupted
            return {
                isRunning: false,
                consecutiveFailures: 0,
                totalRuns: 0,
                totalSuccess: 0,
                totalFailures: 0,
            };
        }
    }
    /**
     * Save scheduler status.
     */
    async saveStatus(status) {
        await writeFile(this.statusFile, JSON.stringify(status, null, 2), 'utf8');
    }
    /**
     * Log job result to dedicated archival log.
     */
    async logJobResult(result) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                type: 'archival_job',
                ...result,
            };
            await writeFile(this.logFile, `${JSON.stringify(logEntry)}\n`, { flag: 'a' });
        }
        catch (error) {
            // Don't fail the job if logging fails
            console.warn(`Failed to log archival job result: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Send failure alert after multiple consecutive failures.
     */
    async sendFailureAlert(status, result) {
        await AuditLogger.log('archival_scheduler', 'ALERT_FAILURE', {
            consecutiveFailures: status.consecutiveFailures,
            lastError: result.error,
            totalFailureRate: `${((status.totalFailures / status.totalRuns) * 100).toFixed(1)}%`,
            recommendation: 'Check S3 configuration, network connectivity, and AWS credentials',
        }, 'CRITICAL');
        // Attempt to write alert to a dedicated alert file for external monitoring
        try {
            const alertFile = path.join(getProjectDir(), '.claude', 'alerts', 'archival-failure.alert');
            await mkdir(path.dirname(alertFile), { recursive: true });
            const alert = {
                timestamp: new Date().toISOString(),
                type: 'ARCHIVAL_FAILURE',
                severity: 'CRITICAL',
                consecutiveFailures: status.consecutiveFailures,
                lastError: result.error,
                actionRequired: 'Investigate archival configuration and resolve issues',
            };
            await writeFile(alertFile, JSON.stringify(alert, null, 2), 'utf8');
        }
        catch (alertError) {
            console.error(`Failed to write failure alert: ${alertError instanceof Error ? alertError.message : String(alertError)}`);
        }
    }
    /**
     * Perform health check on archival system.
     */
    async healthCheck() {
        const issues = [];
        const recommendations = [];
        try {
            // Check configuration
            const configValidation = await this.configManager.loadConfiguration();
            if (!configValidation.isValid) {
                issues.push(...configValidation.errors);
                recommendations.push(...configValidation.recommendations);
            }
            // Check scheduler status
            const status = await this.getStatus();
            // Check if archival is overdue
            const now = new Date();
            if (status.lastSuccess) {
                const lastSuccess = new Date(status.lastSuccess);
                const hoursSinceLastSuccess = (now.getTime() - lastSuccess.getTime()) / (1000 * 60 * 60);
                if (hoursSinceLastSuccess > 36) { // More than 1.5 days
                    issues.push(`Last successful archival was ${Math.floor(hoursSinceLastSuccess)} hours ago`);
                    recommendations.push('Run manual archival or check scheduled job configuration');
                }
            }
            else {
                issues.push('No successful archival recorded');
                recommendations.push('Run initial archival to establish baseline');
            }
            // Check failure rate
            if (status.totalRuns > 0) {
                const failureRate = status.totalFailures / status.totalRuns;
                if (failureRate > 0.2) { // More than 20% failure rate
                    issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
                    recommendations.push('Review archival logs and fix recurring issues');
                }
            }
            // Check for consecutive failures
            if (status.consecutiveFailures > 1) {
                issues.push(`${status.consecutiveFailures} consecutive failures`);
                recommendations.push('Check S3 credentials and connectivity');
            }
            // Check disk space for logs
            try {
                const logDir = path.join(getProjectDir(), '.claude', 'logs');
                const files = await fs.promises.readdir(logDir);
                let totalSize = 0;
                for (const file of files) {
                    const filePath = path.join(logDir, file);
                    const stat = await fs.promises.stat(filePath);
                    totalSize += stat.size;
                }
                const totalSizeMB = totalSize / (1024 * 1024);
                if (totalSizeMB > 500) { // More than 500MB of logs
                    issues.push(`Large log directory: ${totalSizeMB.toFixed(1)}MB`);
                    recommendations.push('Run archival to reduce local log storage');
                }
            }
            catch {
                // Ignore disk check errors
            }
            return {
                healthy: issues.length === 0,
                issues,
                recommendations,
                lastArchival: status.lastSuccess,
                nextArchival: this.calculateNextArchivalTime(),
            };
        }
        catch (error) {
            return {
                healthy: false,
                issues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                recommendations: ['Check scheduler configuration and permissions'],
            };
        }
    }
    /**
     * Calculate next archival time based on schedule.
     */
    calculateNextArchivalTime() {
        // For daily archival at 2 AM, calculate next occurrence
        const now = new Date();
        const tomorrow2AM = new Date(now);
        tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
        tomorrow2AM.setHours(2, 0, 0, 0);
        return tomorrow2AM.toISOString();
    }
    /**
     * Get archival job history.
     */
    async getJobHistory(limit = 10) {
        try {
            const content = await readFile(this.logFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            const jobs = lines
                .map(line => {
                try {
                    const entry = JSON.parse(line);
                    return entry.type === 'archival_job' ? entry : null;
                }
                catch {
                    return null;
                }
            })
                .filter((entry) => entry !== null)
                .reverse() // Most recent first
                .slice(0, limit);
            return jobs;
        }
        catch {
            return []; // Return empty array if log file doesn't exist
        }
    }
    /**
     * Clear old job history to prevent log file growth.
     */
    async cleanupJobHistory(retainDays = 30) {
        try {
            const cutoffDate = new Date(Date.now() - retainDays * 24 * 60 * 60 * 1000);
            const content = await readFile(this.logFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            const retainedLines = lines.filter(line => {
                try {
                    const entry = JSON.parse(line);
                    const entryDate = new Date(entry.timestamp);
                    return entryDate >= cutoffDate;
                }
                catch {
                    return false; // Remove malformed entries
                }
            });
            if (retainedLines.length < lines.length) {
                await writeFile(this.logFile, `${retainedLines.join('\n')}\n`, 'utf8');
                await AuditLogger.log('archival_scheduler', 'HISTORY_CLEANED', {
                    removedEntries: lines.length - retainedLines.length,
                    retainedEntries: retainedLines.length,
                    retainDays,
                }, 'INFO');
            }
        }
        catch (error) {
            await AuditLogger.log('archival_scheduler', 'CLEANUP_FAILED', { error: error instanceof Error ? error.message : String(error) }, 'WARNING');
        }
    }
    /**
     * Cancel running archival job.
     */
    async cancelRunningJob() {
        const status = await this.getStatus();
        if (!status.isRunning || !this.currentJob) {
            return false; // No job running
        }
        try {
            // Mark as not running (the job should check this and abort)
            status.isRunning = false;
            await this.saveStatus(status);
            await AuditLogger.log('archival_scheduler', 'JOB_CANCELLED', { timestamp: new Date().toISOString() }, 'WARNING');
            return true;
        }
        catch (error) {
            await AuditLogger.log('archival_scheduler', 'CANCEL_FAILED', { error: error instanceof Error ? error.message : String(error) }, 'BLOCKED');
            return false;
        }
    }
}
/**
 * Global scheduler instance.
 */
let globalScheduler = null;
/**
 * Get or create the global scheduler instance.
 */
export function getArchivalScheduler() {
    if (!globalScheduler) {
        globalScheduler = new ArchivalScheduler();
    }
    return globalScheduler;
}
/**
 * Initialize archival scheduling for the audit logger system.
 * This should be called once during application startup.
 */
export async function initializeArchivalScheduling() {
    try {
        const scheduler = getArchivalScheduler();
        await scheduler.initialize();
        // Run initial health check
        const health = await scheduler.healthCheck();
        await AuditLogger.log('archival_scheduler', 'SYSTEM_INITIALIZED', {
            healthy: health.healthy,
            issuesCount: health.issues.length,
            nextArchival: health.nextArchival,
        }, health.healthy ? 'INFO' : 'WARNING');
        // Schedule cleanup of old job history
        setInterval(async () => {
            try {
                await scheduler.cleanupJobHistory();
            }
            catch (error) {
                console.warn(`Archival history cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, 24 * 60 * 60 * 1000); // Daily cleanup
    }
    catch (error) {
        await AuditLogger.log('archival_scheduler', 'INIT_FAILED', { error: error instanceof Error ? error.message : String(error) }, 'CRITICAL');
        throw new ArchivalError(`Failed to initialize archival scheduling: ${error instanceof Error ? error.message : String(error)}`, 'SCHEDULER_INIT_FAILED');
    }
}
/**
 * Manual trigger for archival job.
 */
export async function triggerArchival() {
    const scheduler = getArchivalScheduler();
    return await scheduler.runArchivalJob();
}
/**
 * Get archival system status.
 */
export async function getArchivalStatus() {
    const scheduler = getArchivalScheduler();
    const [status, health, recentJobs] = await Promise.all([
        scheduler.getStatus(),
        scheduler.healthCheck(),
        scheduler.getJobHistory(5),
    ]);
    return { status, health, recentJobs };
}
//# sourceMappingURL=archival-scheduler.js.map