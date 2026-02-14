/**
 * BMAD Guardrails: Log Archival System (SEC-003-3)
 * ================================================
 * Implements S3 log archival with immutable storage to meet NIST DE.CM-1 and ISO 27001 A.12.4.1 compliance.
 *
 * Features:
 * - Daily automated S3 export with object lock for immutability
 * - GPG signing for cryptographic integrity verification
 * - Configurable retention policies with automated cleanup
 * - Hash verification chain for tamper detection
 * - WORM (Write-Once-Read-Many) storage compliance
 * - Audit trail for all archival operations
 *
 * Security Design:
 * - Object Lock prevents modification/deletion during retention period
 * - GPG signatures provide non-repudiation
 * - SHA-256 hash chains detect tampering
 * - S3 server-side encryption (SSE-S3 or SSE-KMS)
 * - IAM roles with least-privilege access
 *
 * Configuration:
 *   BMAD_S3_ARCHIVE_BUCKET=<bucket-name> (required)
 *   BMAD_S3_ARCHIVE_PREFIX=<prefix> (default: bmad-audit-logs/)
 *   BMAD_S3_ARCHIVE_REGION=<region> (default: us-east-1)
 *   BMAD_LOG_RETENTION_DAYS=<days> (default: 2557, ~7 years)
 *   BMAD_GPG_SIGNING_KEY=<key-id> (optional, enables GPG signing)
 *   BMAD_ARCHIVE_SCHEDULE_CRON=<expression> (default: 0 2 * * *, daily at 2 AM)
 *
 * Compliance:
 *   - NIST DE.CM-1: Data-at-rest is protected
 *   - ISO 27001 A.12.4.1: Event logging
 *   - SOX 404: Records retention and integrity
 *   - GDPR Article 32: Security of processing
 */
export declare class ArchivalError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class S3ArchivalError extends ArchivalError {
    readonly awsError?: Error | undefined;
    constructor(message: string, awsError?: Error | undefined);
}
export declare class GPGSigningError extends ArchivalError {
    readonly gpgError?: Error | undefined;
    constructor(message: string, gpgError?: Error | undefined);
}
/**
 * Configuration interface for S3 archival.
 */
export interface ArchivalConfig {
    bucket: string;
    prefix?: string | undefined;
    region?: string | undefined;
    retentionDays?: number | undefined;
    gpgSigningKey?: string | undefined;
    scheduleExpression?: string | undefined;
    enableObjectLock?: boolean | undefined;
    encryptionType?: 'SSE-S3' | 'SSE-KMS' | undefined;
    kmsKeyId?: string | undefined;
}
/**
 * Archive metadata for tracking and verification.
 */
export interface ArchiveMetadata {
    archiveId: string;
    timestamp: string;
    logFileCount: number;
    totalSize: number;
    compressedSize: number;
    sha256Hash: string;
    previousArchiveHash?: string | undefined;
    gpgSignature?: string | undefined;
    s3ObjectKey: string;
    retentionUntil: string;
    encryptionEnabled: boolean;
    compressionRatio: number;
}
/**
 * Archive operation result.
 */
export interface ArchiveResult {
    success: boolean;
    archiveId: string;
    metadata: ArchiveMetadata;
    s3Location: string;
    error?: Error;
}
/**
 * S3 archival manager for audit logs.
 */
export declare class LogArchiver {
    private config;
    private s3Client;
    private isInitialized;
    constructor(config: ArchivalConfig);
    /**
     * Initialize the archiver (lazy-load AWS SDK).
     */
    private initialize;
    /**
     * Verify S3 bucket has object lock enabled.
     */
    private verifyObjectLockConfiguration;
    /**
     * Get configuration from environment variables.
     */
    static fromEnvironment(): LogArchiver;
    /**
     * Archive audit logs for a specific date range.
     */
    archiveLogs(startDate?: Date, // Yesterday
    endDate?: Date): Promise<ArchiveResult>;
    /**
     * Generate unique archive ID.
     */
    private generateArchiveId;
    /**
     * Get log files within date range.
     */
    private getLogFilesInRange;
    /**
     * Create compressed archive containing all log files.
     */
    private createCompressedArchive;
    /**
     * Get hash of the last archive for hash chaining.
     */
    private getLastArchiveHash;
    /**
     * Sign archive with GPG for non-repudiation.
     */
    private signWithGPG;
    /**
     * Upload archive to S3 with object lock.
     */
    private uploadToS3;
    /**
     * Generate S3 object key for archive.
     */
    private generateS3Key;
    /**
     * Store archive metadata locally.
     */
    private storeArchiveMetadata;
    /**
     * Clean up local log files older than retention period.
     */
    private cleanupOldLogFiles;
    /**
     * Create empty archive metadata for cases with no logs.
     */
    private createEmptyArchiveMetadata;
    /**
     * Verify archive integrity by downloading and checking hash.
     */
    verifyArchiveIntegrity(archiveId: string): Promise<{
        isValid: boolean;
        error?: string | undefined;
    }>;
    /**
     * List all archives with metadata.
     */
    listArchives(): Promise<ArchiveMetadata[]>;
    /**
     * Get configuration status for diagnostics.
     */
    getConfigurationStatus(): {
        configured: boolean;
        bucket?: string | undefined;
        region?: string | undefined;
        retentionDays?: number | undefined;
        objectLockEnabled?: boolean | undefined;
        gpgSigningEnabled?: boolean | undefined;
        issues?: string[] | undefined;
    };
    /**
     * Create S3 client (exposed for testing)
     */
    createS3Client: () => Promise<any>;
    /**
     * Override S3 client for testing (allows tests to inject failing clients)
     */
    setS3Client(client: any): void;
}
/**
 * Convenience function to create archiver from environment.
 */
export declare function createLogArchiver(): LogArchiver;
/**
 * Run daily archival job.
 */
export declare function runDailyArchival(): Promise<ArchiveResult>;
/**
 * Archive logs within a specific date range (convenience function).
 * Alias for archiver.archiveLogs() to match test expectations.
 */
export declare function archiveLogsInDateRange(startDate: Date, endDate?: Date): Promise<ArchiveResult>;
