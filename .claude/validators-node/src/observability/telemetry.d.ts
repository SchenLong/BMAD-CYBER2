/**
 * BMAD Security Telemetry Collector
 * ==================================
 * Centralized telemetry collection for security validators.
 * Writes JSONL telemetry data for external analysis.
 *
 * Telemetry Types:
 * - Security events (all validator actions)
 * - Rate limit metrics
 * - Permission audit trail
 * - Resource usage snapshots
 * - Supply chain verification results
 * - Confidence analysis (optional)
 * - Anomaly signals
 *
 * Output Location:
 *   docs/TestingLogs/security/AuditLogs/telemetry/
 *
 * Configuration:
 *   BMAD_TELEMETRY_ENABLED=true|false (default: true)
 *   BMAD_TELEMETRY_DIR=<path> (default: docs/TestingLogs/security/AuditLogs/telemetry)
 *   BMAD_TELEMETRY_ROTATE_MB=<size> (default: 50)
 */
/**
 * Security event parameters.
 */
export interface SecurityEventParams {
    validator: string;
    action: string;
    severity: string;
    target: string;
    reason: string;
    latencyMs?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Rate limit metrics parameters.
 */
export interface RateLimitMetricsParams {
    operationType: string;
    requestsCount: number;
    limit: number;
    windowSeconds: number;
    windowRemainingS: number;
    backoffActive?: boolean;
    backoffRemainingS?: number;
    backoffMultiplier?: number;
}
/**
 * Permission check parameters.
 */
export interface PermissionCheckParams {
    pluginName: string;
    capability: string;
    requestedResource: string;
    decision: 'GRANTED' | 'DENIED';
    reason: string;
    manifestVersion?: string;
    rbacRole?: string;
    matchedPattern?: string;
}
/**
 * Resource usage parameters.
 */
export interface ResourceUsageParams {
    contextTokensUsed: number;
    contextTokensMax: number;
    contextStatus: 'ok' | 'warning' | 'critical' | 'blocked';
    memoryMb?: number;
    memoryLimitMb?: number;
    recursionDepth?: number;
    recursionLimit?: number;
    symlinkFollows?: number;
    symlinkLimit?: number;
    childProcesses?: number;
    childProcessLimit?: number;
}
/**
 * Supply chain verification parameters.
 */
export interface SupplyChainVerificationParams {
    verificationType: 'file' | 'skill' | 'plugin' | 'manifest';
    filePath: string;
    verificationResult: 'VALID' | 'MISMATCH' | 'MISSING' | 'UNTRACKED' | 'ERROR';
    verificationMode: 'strict' | 'warn' | 'disabled';
    hashMatch: boolean;
    skillName?: string;
    expectedHash?: string;
    actualHash?: string;
    gpgSignatureChecked?: boolean;
    gpgSignatureValid?: boolean;
    gpgKeyId?: string;
    cached?: boolean;
    latencyMs?: number;
}
/**
 * Confidence analysis parameters.
 */
export interface ConfidenceAnalysisParams {
    responseLength: number;
    uncertaintyMarkers: {
        high: number;
        medium: number;
        low: number;
    };
    confidenceScore: number;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
    hedgingPhrases?: string[];
    codeWarnings?: Record<string, number>;
    attributions?: Record<string, number>;
    notes?: string[];
}
/**
 * Anomaly signal parameters.
 */
export interface AnomalySignalParams {
    anomalyType: 'volume_spike' | 'volume_drop' | 'unusual_operation' | 'time_anomaly';
    metricName: string;
    baselineValue: number;
    observedValue: number;
    deviationStd: number;
    anomalyScore: number;
    alertTriggered?: boolean;
    alertSeverity?: 'INFO' | 'WARNING' | 'CRITICAL';
    context?: Record<string, unknown>;
}
/**
 * Centralized telemetry writer for BMAD security validators.
 *
 * Writes JSONL format for easy parsing and streaming.
 * Supports file rotation and atomic writes.
 */
export declare class TelemetryCollector {
    private telemetryDir;
    private enabled;
    constructor(telemetryDir?: string);
    private ensureDir;
    private getFilePath;
    private rotateIfNeeded;
    private writeEntry;
    private baseEntry;
    /**
     * Record a security event from any validator.
     */
    recordSecurityEvent(params: SecurityEventParams): boolean;
    /**
     * Record rate limiter state snapshot.
     */
    recordRateLimitMetrics(params: RateLimitMetricsParams): boolean;
    /**
     * Record a plugin permission check.
     */
    recordPermissionCheck(params: PermissionCheckParams): boolean;
    /**
     * Record resource usage snapshot.
     */
    recordResourceUsage(params: ResourceUsageParams): boolean;
    /**
     * Record supply chain verification result.
     */
    recordSupplyChainVerification(params: SupplyChainVerificationParams): boolean;
    /**
     * Record confidence analysis result.
     */
    recordConfidenceAnalysis(params: ConfidenceAnalysisParams): boolean;
    /**
     * Record detected anomaly signal.
     */
    recordAnomalySignal(params: AnomalySignalParams): boolean;
}
/**
 * Get or create the global telemetry collector instance.
 */
export declare function getTelemetryCollector(): TelemetryCollector;
export declare function recordSecurityEvent(params: SecurityEventParams): boolean;
export declare function recordRateLimitMetrics(params: RateLimitMetricsParams): boolean;
export declare function recordPermissionCheck(params: PermissionCheckParams): boolean;
export declare function recordResourceUsage(params: ResourceUsageParams): boolean;
export declare function recordSupplyChainVerification(params: SupplyChainVerificationParams): boolean;
export declare function recordConfidenceAnalysis(params: ConfidenceAnalysisParams): boolean;
export declare function recordAnomalySignal(params: AnomalySignalParams): boolean;
/**
 * CLI main function.
 */
export declare function main(): void;
