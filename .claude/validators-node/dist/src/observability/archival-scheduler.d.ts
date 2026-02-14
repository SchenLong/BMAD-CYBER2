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
/**
 * Archival job status.
 */
export interface ArchivalJobStatus {
    lastRun?: string;
    lastSuccess?: string;
    lastFailure?: string;
    nextScheduled?: string;
    isRunning: boolean;
    consecutiveFailures: number;
    totalRuns: number;
    totalSuccess: number;
    totalFailures: number;
}
/**
 * Archival job result.
 */
export interface ArchivalJobResult {
    success: boolean;
    startTime: string;
    endTime: string;
    duration: number;
    archiveId?: string;
    filesArchived?: number;
    bytesArchived?: number;
    error?: string;
}
/**
 * Scheduler configuration.
 */
export interface SchedulerConfig {
    enabled: boolean;
    cronExpression: string;
    maxRetries: number;
    retryDelayMinutes: number;
    healthCheckIntervalMinutes: number;
    alertOnFailure: boolean;
}
/**
 * Archive scheduler for automating log archival operations.
 */
export declare class ArchivalScheduler {
    private configManager;
    private statusFile;
    private logFile;
    private isInitialized;
    private currentJob;
    constructor();
    /**
     * Initialize the scheduler.
     */
    initialize(): Promise<void>;
    /**
     * Run archival job manually.
     */
    runArchivalJob(): Promise<ArchivalJobResult>;
    /**
     * Execute the actual archival job.
     */
    private executeArchivalJob;
    /**
     * Get current scheduler status.
     */
    getStatus(): Promise<ArchivalJobStatus>;
    /**
     * Save scheduler status.
     */
    private saveStatus;
    /**
     * Log job result to dedicated archival log.
     */
    private logJobResult;
    /**
     * Send failure alert after multiple consecutive failures.
     */
    private sendFailureAlert;
    /**
     * Perform health check on archival system.
     */
    healthCheck(): Promise<{
        healthy: boolean;
        issues: string[];
        recommendations: string[];
        lastArchival?: string | undefined;
        nextArchival?: string | undefined;
    }>;
    /**
     * Calculate next archival time based on schedule.
     */
    private calculateNextArchivalTime;
    /**
     * Get archival job history.
     */
    getJobHistory(limit?: number): Promise<ArchivalJobResult[]>;
    /**
     * Clear old job history to prevent log file growth.
     */
    cleanupJobHistory(retainDays?: number): Promise<void>;
    /**
     * Cancel running archival job.
     */
    cancelRunningJob(): Promise<boolean>;
}
/**
 * Get or create the global scheduler instance.
 */
export declare function getArchivalScheduler(): ArchivalScheduler;
/**
 * Initialize archival scheduling for the audit logger system.
 * This should be called once during application startup.
 */
export declare function initializeArchivalScheduling(): Promise<void>;
/**
 * Manual trigger for archival job.
 */
export declare function triggerArchival(): Promise<ArchivalJobResult>;
/**
 * Get archival system status.
 */
export declare function getArchivalStatus(): Promise<{
    status: ArchivalJobStatus;
    health: Awaited<ReturnType<ArchivalScheduler['healthCheck']>>;
    recentJobs: ArchivalJobResult[];
}>;
