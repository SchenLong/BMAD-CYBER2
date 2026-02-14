/**
 * BMAD Guardrails: Security Anomaly Detection
 * ============================================
 * Pattern detection for unusual security activity.
 *
 * Detection Types:
 * - Volume anomalies: Unusual request rates (spikes or drops)
 * - Type anomalies: Unusual operation types for time/context
 * - Time anomalies: Activity at unusual times
 * - Sequence anomalies: Unusual patterns of operations
 *
 * Baseline Computation:
 * - Rolling window baseline (configurable, default 24h)
 * - Per-operation-type statistics
 * - Per-hour-of-day statistics
 * - Automatic baseline updates
 *
 * Configuration:
 *   BMAD_ANOMALY_DETECTION=true|false (default: true)
 *   BMAD_ANOMALY_THRESHOLD_STD=<float> (default: 3.0 standard deviations)
 *   BMAD_ANOMALY_BASELINE_HOURS=<int> (default: 24)
 *   BMAD_ANOMALY_ALERT_LEVEL=INFO|WARNING|CRITICAL (default: WARNING)
 */
/**
 * Represents a detected anomaly.
 */
export interface AnomalySignal {
    anomalyType: 'volume_spike' | 'volume_drop' | 'unusual_operation' | 'time_anomaly';
    metricName: string;
    baselineValue: number;
    observedValue: number;
    deviationStd: number;
    anomalyScore: number;
    alertSeverity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
}
/**
 * Anomaly Detector class.
 *
 * Detects anomalies in security event patterns using rolling window
 * statistics to establish baselines and detect deviations.
 */
export declare class AnomalyDetector {
    private enabled;
    private thresholdStd;
    private operationCounts;
    private hourlyCounts;
    private validatorCounts;
    private blockedRatio;
    private currentWindowStart;
    private currentWindowOperations;
    private currentWindowValidators;
    private currentWindowBlocked;
    private currentWindowTotal;
    constructor();
    private loadBaseline;
    private saveBaseline;
    private getWindowKey;
    private finalizeWindow;
    /**
     * Record a security event and check for anomalies.
     *
     * @returns List of detected anomaly signals (may be empty)
     */
    recordEvent(operationType: string, validator: string, action: string, _severity: string): AnomalySignal[];
    private checkAnomalies;
    private createAnomaly;
    private emitAnomaly;
    /**
     * Force check all anomaly types (useful for testing).
     */
    checkAllAnomalies(): AnomalySignal[];
    /**
     * Get current baseline statistics status.
     */
    getBaselineStatus(): Record<string, unknown>;
    /**
     * Reset all baseline statistics.
     */
    resetBaseline(): void;
}
/**
 * Get or create the global anomaly detector instance.
 */
export declare function getAnomalyDetector(): AnomalyDetector;
/**
 * Record event and check for anomalies.
 */
export declare function recordSecurityEventForAnomaly(operationType: string, validator: string, action: string, severity: string): AnomalySignal[];
/**
 * Force check all anomaly types.
 */
export declare function checkAnomalies(): AnomalySignal[];
/**
 * Get baseline status.
 */
export declare function getBaselineStatus(): Record<string, unknown>;
/**
 * Reset baseline statistics.
 */
export declare function resetBaseline(): void;
/**
 * CLI main function.
 */
export declare function main(): void;
