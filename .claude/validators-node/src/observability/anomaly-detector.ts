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

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
import { recordAnomalySignal, recordSecurityEvent } from './telemetry.js';

// Configuration
const LOG_DIR = path.join(getProjectDir(), '.claude', 'logs');
const BASELINE_FILE = path.join(LOG_DIR, '.anomaly_baseline.json');
const BASELINE_LOCK_FILE = path.join(LOG_DIR, '.anomaly.lock');

const ANOMALY_ENABLED = (process.env['BMAD_ANOMALY_DETECTION'] || 'true').toLowerCase() === 'true';
const THRESHOLD_STD = parseFloat(process.env['BMAD_ANOMALY_THRESHOLD_STD'] || '3.0');
const MIN_SAMPLES_FOR_BASELINE = 10;
const LOCK_TIMEOUT_MS = 2000;
const LOCK_RETRY_MS = 10;

/**
 * Represents a detected anomaly.
 */
export interface AnomalySignal {
  anomalyType: 'volume_spike' | 'volume_drop' | 'unusual_operation' | 'time_anomaly';
  metricName: string;
  baselineValue: number;
  observedValue: number;
  deviationStd: number;
  anomalyScore: number; // 0.0 to 1.0
  alertSeverity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
}

/**
 * Serialized window data.
 */
interface WindowData {
  values: number[];
  window_size: number;
}

/**
 * Baseline state stored on disk.
 */
interface BaselineState {
  operation_counts: Record<string, WindowData>;
  hourly_counts: Record<string, WindowData>;
  validator_counts: Record<string, WindowData>;
  blocked_ratio: WindowData;
  updated_at?: string;
}

/**
 * Rolling window statistics calculator.
 */
class StatisticsWindow {
  private windowSize: number;
  private values: number[];

  constructor(windowSize: number = 100) {
    this.windowSize = windowSize;
    this.values = [];
  }

  add(value: number): void {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }

  mean(): number {
    if (this.values.length === 0) return 0;
    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }

  stdDev(): number {
    if (this.values.length < 2) return 0;
    const m = this.mean();
    const variance = this.values.reduce((sum, x) => sum + (x - m) ** 2, 0) / this.values.length;
    return Math.sqrt(variance);
  }

  zScore(value: number): number {
    const std = this.stdDev();
    if (std === 0) return 0;
    return (value - this.mean()) / std;
  }

  count(): number {
    return this.values.length;
  }

  toDict(): WindowData {
    return {
      values: this.values.slice(-this.windowSize),
      window_size: this.windowSize,
    };
  }

  static fromDict(data: WindowData): StatisticsWindow {
    const window = new StatisticsWindow(data.window_size);
    window.values = data.values || [];
    return window;
  }
}

/**
 * Acquire a simple lock.
 */
function acquireLock(timeout: number = LOCK_TIMEOUT_MS): boolean {
  fs.mkdirSync(path.dirname(BASELINE_LOCK_FILE), { recursive: true });

  const startTime = Date.now();
  while (true) {
    try {
      fs.writeFileSync(BASELINE_LOCK_FILE, String(process.pid), { flag: 'wx' });
      return true;
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'EEXIST') {
        try {
          const stats = fs.statSync(BASELINE_LOCK_FILE);
          if (Date.now() - stats.mtimeMs > 30000) {
            fs.unlinkSync(BASELINE_LOCK_FILE);
            continue;
          }
        } catch {
          // Lock may have been removed
        }

        if (Date.now() - startTime > timeout) {
          return false;
        }

        // Busy wait (small spin) - avoid SharedArrayBuffer/Atomics which is problematic
        const sleepUntil = Date.now() + LOCK_RETRY_MS;
        while (Date.now() < sleepUntil) {
          /* spin */
        }
        continue;
      }
      throw err;
    }
  }
}

/**
 * Release the lock.
 */
function releaseLock(): void {
  try {
    fs.unlinkSync(BASELINE_LOCK_FILE);
  } catch {
    // Ignore errors
  }
}

/**
 * Anomaly Detector class.
 *
 * Detects anomalies in security event patterns using rolling window
 * statistics to establish baselines and detect deviations.
 */
export class AnomalyDetector {
  private enabled: boolean;
  private thresholdStd: number;

  // Statistics windows for different metrics
  private operationCounts: Map<string, StatisticsWindow> = new Map();
  private hourlyCounts: Map<number, StatisticsWindow> = new Map();
  private validatorCounts: Map<string, StatisticsWindow> = new Map();
  private blockedRatio: StatisticsWindow = new StatisticsWindow();

  // Current window tracking
  private currentWindowStart: Date | null = null;
  private currentWindowOperations: Map<string, number> = new Map();
  private currentWindowValidators: Map<string, number> = new Map();
  private currentWindowBlocked: number = 0;
  private currentWindowTotal: number = 0;

  constructor() {
    this.enabled = ANOMALY_ENABLED;
    this.thresholdStd = THRESHOLD_STD;
    this.loadBaseline();
  }

  private loadBaseline(): void {
    try {
      if (fs.existsSync(BASELINE_FILE)) {
        const content = fs.readFileSync(BASELINE_FILE, 'utf8');
        const data = JSON.parse(content) as BaselineState;

        // Restore operation counts
        for (const [op, stats] of Object.entries(data.operation_counts || {})) {
          this.operationCounts.set(op, StatisticsWindow.fromDict(stats));
        }

        // Restore hourly counts
        for (const [hourStr, stats] of Object.entries(data.hourly_counts || {})) {
          this.hourlyCounts.set(parseInt(hourStr, 10), StatisticsWindow.fromDict(stats));
        }

        // Restore validator counts
        for (const [validator, stats] of Object.entries(data.validator_counts || {})) {
          this.validatorCounts.set(validator, StatisticsWindow.fromDict(stats));
        }

        // Restore blocked ratio
        if (data.blocked_ratio) {
          this.blockedRatio = StatisticsWindow.fromDict(data.blocked_ratio);
        }
      }
    } catch {
      // Start fresh if baseline corrupted
    }
  }

  private saveBaseline(): void {
    if (!acquireLock()) {
      return; // Non-critical
    }

    try {
      const data: BaselineState = {
        operation_counts: Object.fromEntries(
          Array.from(this.operationCounts.entries()).map(([k, v]) => [k, v.toDict()])
        ),
        hourly_counts: Object.fromEntries(
          Array.from(this.hourlyCounts.entries()).map(([k, v]) => [String(k), v.toDict()])
        ),
        validator_counts: Object.fromEntries(
          Array.from(this.validatorCounts.entries()).map(([k, v]) => [k, v.toDict()])
        ),
        blocked_ratio: this.blockedRatio.toDict(),
        updated_at: new Date().toISOString(),
      };

      fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
      const tempFile = `${BASELINE_FILE  }.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
      fs.renameSync(tempFile, BASELINE_FILE);
    } finally {
      releaseLock();
    }
  }

  private getWindowKey(): Date {
    const now = new Date();
    // Round down to nearest 5 minutes
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minutes, 0, 0);
  }

  private finalizeWindow(): void {
    if (this.currentWindowStart === null) {
      return;
    }

    // Update operation counts baseline
    for (const [op, count] of this.currentWindowOperations) {
      let stats = this.operationCounts.get(op);
      if (!stats) {
        stats = new StatisticsWindow();
        this.operationCounts.set(op, stats);
      }
      stats.add(count);
    }

    // Update hourly counts baseline
    const hour = this.currentWindowStart.getHours();
    let hourlyStats = this.hourlyCounts.get(hour);
    if (!hourlyStats) {
      hourlyStats = new StatisticsWindow();
      this.hourlyCounts.set(hour, hourlyStats);
    }
    const total = Array.from(this.currentWindowOperations.values()).reduce((a, b) => a + b, 0);
    hourlyStats.add(total);

    // Update validator counts baseline
    for (const [validator, count] of this.currentWindowValidators) {
      let stats = this.validatorCounts.get(validator);
      if (!stats) {
        stats = new StatisticsWindow();
        this.validatorCounts.set(validator, stats);
      }
      stats.add(count);
    }

    // Update blocked ratio baseline
    if (this.currentWindowTotal > 0) {
      const ratio = this.currentWindowBlocked / this.currentWindowTotal;
      this.blockedRatio.add(ratio);
    }

    // Save baseline periodically
    this.saveBaseline();

    // Reset current window
    this.currentWindowOperations.clear();
    this.currentWindowValidators.clear();
    this.currentWindowBlocked = 0;
    this.currentWindowTotal = 0;
  }

  /**
   * Record a security event and check for anomalies.
   *
   * @returns List of detected anomaly signals (may be empty)
   */
  recordEvent(
    operationType: string,
    validator: string,
    action: string,
    _severity: string
  ): AnomalySignal[] {
    if (!this.enabled) {
      return [];
    }

    const anomalies: AnomalySignal[] = [];
    const windowKey = this.getWindowKey();

    // Check if we need to finalize the previous window
    if (this.currentWindowStart !== null &&
        windowKey.getTime() !== this.currentWindowStart.getTime()) {
      this.finalizeWindow();
      anomalies.push(...this.checkAnomalies());
    }

    // Initialize new window if needed
    if (this.currentWindowStart === null ||
        windowKey.getTime() !== this.currentWindowStart.getTime()) {
      this.currentWindowStart = windowKey;
    }

    // Update current window counts
    this.currentWindowOperations.set(
      operationType,
      (this.currentWindowOperations.get(operationType) || 0) + 1
    );
    this.currentWindowValidators.set(
      validator,
      (this.currentWindowValidators.get(validator) || 0) + 1
    );
    this.currentWindowTotal += 1;

    if (action === 'BLOCKED') {
      this.currentWindowBlocked += 1;
    }

    return anomalies;
  }

  private checkAnomalies(): AnomalySignal[] {
    const anomalies: AnomalySignal[] = [];

    // Check volume anomalies per operation type
    for (const [op, count] of this.currentWindowOperations) {
      const stats = this.operationCounts.get(op);
      if (stats && stats.count() >= MIN_SAMPLES_FOR_BASELINE) {
        const z = stats.zScore(count);
        if (Math.abs(z) > this.thresholdStd) {
          const anomalyType = z > 0 ? 'volume_spike' : 'volume_drop';
          const anomaly = this.createAnomaly(
            anomalyType,
            `operation_count.${op}`,
            stats.mean(),
            count,
            Math.abs(z),
            `Operation ${op} count ${count} is ${Math.abs(z).toFixed(1)} std devs from mean ${stats.mean().toFixed(1)}`
          );
          anomalies.push(anomaly);
          this.emitAnomaly(anomaly);
        }
      }
    }

    // Check hourly volume anomaly
    const hour = new Date().getHours();
    const totalOps = Array.from(this.currentWindowOperations.values()).reduce((a, b) => a + b, 0);
    const hourlyStats = this.hourlyCounts.get(hour);
    if (hourlyStats && hourlyStats.count() >= MIN_SAMPLES_FOR_BASELINE) {
      const z = hourlyStats.zScore(totalOps);
      if (Math.abs(z) > this.thresholdStd) {
        const anomalyType = z > 0 ? 'volume_spike' : 'volume_drop';
        const anomaly = this.createAnomaly(
          anomalyType,
          `hourly_volume.hour_${hour}`,
          hourlyStats.mean(),
          totalOps,
          Math.abs(z),
          `Activity at hour ${hour} (${totalOps} ops) is ${Math.abs(z).toFixed(1)} std devs from normal`
        );
        anomalies.push(anomaly);
        this.emitAnomaly(anomaly);
      }
    }

    // Check blocked ratio anomaly
    if (this.currentWindowTotal > 0 && this.blockedRatio.count() >= MIN_SAMPLES_FOR_BASELINE) {
      const ratio = this.currentWindowBlocked / this.currentWindowTotal;
      const z = this.blockedRatio.zScore(ratio);
      if (z > this.thresholdStd) { // Only alert on high block rate
        const anomaly = this.createAnomaly(
          'unusual_operation',
          'blocked_ratio',
          this.blockedRatio.mean(),
          ratio,
          z,
          `Block rate ${(ratio * 100).toFixed(1)}% is ${z.toFixed(1)} std devs above normal ${(this.blockedRatio.mean() * 100).toFixed(1)}%`
        );
        anomalies.push(anomaly);
        this.emitAnomaly(anomaly);
      }
    }

    // Check for unusual operation types (new or rarely seen)
    for (const op of this.currentWindowOperations.keys()) {
      const stats = this.operationCounts.get(op);
      if (!stats || stats.count() < 3) {
        // This is a rarely seen operation type
        const count = this.currentWindowOperations.get(op) || 0;
        const anomaly: AnomalySignal = {
          anomalyType: 'unusual_operation',
          metricName: `rare_operation.${op}`,
          baselineValue: 0,
          observedValue: count,
          deviationStd: 0,
          anomalyScore: 0.3, // Lower score for rare ops
          alertSeverity: 'INFO',
          description: `Rare or new operation type '${op}' detected (${count} times)`,
        };
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  private createAnomaly(
    anomalyType: 'volume_spike' | 'volume_drop' | 'unusual_operation' | 'time_anomaly',
    metricName: string,
    baselineValue: number,
    observedValue: number,
    deviationStd: number,
    description: string
  ): AnomalySignal {
    // Calculate anomaly score (0.0 to 1.0) based on deviation
    // Use sigmoid-like function: score approaches 1.0 as std devs increase
    let score: number;
    if (deviationStd > 0) {
      score = 1 - (1 / (1 + deviationStd / 3));
    } else {
      score = 0.3; // Default score for anomalies without std calculation
    }

    // Determine severity based on score
    let severity: 'INFO' | 'WARNING' | 'CRITICAL';
    if (score > 0.8) {
      severity = 'CRITICAL';
    } else if (score > 0.6) {
      severity = 'WARNING';
    } else {
      severity = 'INFO';
    }

    return {
      anomalyType,
      metricName,
      baselineValue,
      observedValue,
      deviationStd,
      anomalyScore: score,
      alertSeverity: severity,
      description,
    };
  }

  private emitAnomaly(anomaly: AnomalySignal): void {
    recordAnomalySignal({
      anomalyType: anomaly.anomalyType,
      metricName: anomaly.metricName,
      baselineValue: anomaly.baselineValue,
      observedValue: anomaly.observedValue,
      deviationStd: anomaly.deviationStd,
      anomalyScore: anomaly.anomalyScore,
      alertTriggered: anomaly.anomalyScore > 0.5,
      alertSeverity: anomaly.alertSeverity,
      context: { description: anomaly.description },
    });

    // Also emit as security event
    if (anomaly.anomalyScore > 0.5) {
      recordSecurityEvent({
        validator: 'anomaly_detector',
        action: 'ANOMALY_DETECTED',
        severity: anomaly.alertSeverity,
        target: anomaly.metricName,
        reason: anomaly.description,
        metadata: {
          anomaly_type: anomaly.anomalyType,
          anomaly_score: anomaly.anomalyScore,
          deviation_std: anomaly.deviationStd,
        },
      });
    }

    // Print alert for significant anomalies
    if (anomaly.alertSeverity === 'WARNING' || anomaly.alertSeverity === 'CRITICAL') {
      console.error(`[ANOMALY ${anomaly.alertSeverity}] ${anomaly.description}`);
    }
  }

  /**
   * Force check all anomaly types (useful for testing).
   */
  checkAllAnomalies(): AnomalySignal[] {
    return this.checkAnomalies();
  }

  /**
   * Get current baseline statistics status.
   */
  getBaselineStatus(): Record<string, unknown> {
    const statistics: Record<string, { mean: number; std: number; samples: number }> = {};
    for (const [op, stats] of this.operationCounts) {
      statistics[op] = {
        mean: stats.mean(),
        std: stats.stdDev(),
        samples: stats.count(),
      };
    }

    return {
      enabled: this.enabled,
      threshold_std: this.thresholdStd,
      operation_types_tracked: this.operationCounts.size,
      hours_tracked: this.hourlyCounts.size,
      validators_tracked: this.validatorCounts.size,
      blocked_ratio_samples: this.blockedRatio.count(),
      baseline_ready: Array.from(this.operationCounts.values()).some(
        stats => stats.count() >= MIN_SAMPLES_FOR_BASELINE
      ),
      statistics,
    };
  }

  /**
   * Reset all baseline statistics.
   */
  resetBaseline(): void {
    this.operationCounts.clear();
    this.hourlyCounts.clear();
    this.validatorCounts.clear();
    this.blockedRatio = new StatisticsWindow();
    this.currentWindowStart = null;
    this.currentWindowOperations.clear();
    this.currentWindowValidators.clear();
    this.currentWindowBlocked = 0;
    this.currentWindowTotal = 0;

    try {
      if (fs.existsSync(BASELINE_FILE)) {
        fs.unlinkSync(BASELINE_FILE);
      }
    } catch {
      // Non-critical
    }
  }
}

// Global singleton instance
let detector: AnomalyDetector | null = null;

/**
 * Get or create the global anomaly detector instance.
 */
export function getAnomalyDetector(): AnomalyDetector {
  if (detector === null) {
    detector = new AnomalyDetector();
  }
  return detector;
}

/**
 * Record event and check for anomalies.
 */
export function recordSecurityEventForAnomaly(
  operationType: string,
  validator: string,
  action: string,
  severity: string
): AnomalySignal[] {
  return getAnomalyDetector().recordEvent(operationType, validator, action, severity);
}

/**
 * Force check all anomaly types.
 */
export function checkAnomalies(): AnomalySignal[] {
  return getAnomalyDetector().checkAllAnomalies();
}

/**
 * Get baseline status.
 */
export function getBaselineStatus(): Record<string, unknown> {
  return getAnomalyDetector().getBaselineStatus();
}

/**
 * Reset baseline statistics.
 */
export function resetBaseline(): void {
  return getAnomalyDetector().resetBaseline();
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Format number for display.
 */
function formatNumber(n: number, decimals: number = 2): string {
  return n.toFixed(decimals);
}

/**
 * CLI main function.
 */
export function main(): void {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json') || args.includes('-j');
  const filteredArgs = args.filter((a) => a !== '--json' && a !== '-j');
  const command = filteredArgs[0] || 'status';

  if (command === 'status') {
    const status = getBaselineStatus();
    if (jsonOutput) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log('=== Anomaly Detector Status ===');
      console.log(`Enabled: ${status['enabled']}`);
      console.log(`Threshold (std devs): ${status['threshold_std']}`);
      console.log(`Operation types tracked: ${status['operation_types_tracked']}`);
      console.log(`Hours tracked: ${status['hours_tracked']}`);
      console.log(`Validators tracked: ${status['validators_tracked']}`);
      console.log(`Blocked ratio samples: ${status['blocked_ratio_samples']}`);
      console.log(`Baseline ready: ${status['baseline_ready']}`);

      const stats = status['statistics'] as Record<
        string,
        { mean: number; std: number; samples: number }
      >;
      if (stats && Object.keys(stats).length > 0) {
        console.log('\nOperation Statistics:');
        for (const [op, s] of Object.entries(stats)) {
          console.log(`  ${op}: mean=${formatNumber(s.mean)}, std=${formatNumber(s.std)}, samples=${s.samples}`);
        }
      }
    }
  } else if (command === 'check') {
    const anomalies = checkAnomalies();
    if (jsonOutput) {
      console.log(JSON.stringify(anomalies, null, 2));
    } else {
      if (anomalies.length === 0) {
        console.log('No anomalies detected.');
      } else {
        console.log(`Detected ${anomalies.length} anomaly(ies):`);
        for (const a of anomalies) {
          console.log(`  [${a.alertSeverity}] ${a.anomalyType}: ${a.description}`);
          console.log(`    Score: ${formatNumber(a.anomalyScore)}, Deviation: ${formatNumber(a.deviationStd)} std`);
        }
      }
    }
  } else if (command === 'reset') {
    resetBaseline();
    if (jsonOutput) {
      console.log(JSON.stringify({ status: 'reset', success: true }));
    } else {
      console.log('Anomaly baseline reset successfully.');
    }
  } else if (command === 'simulate') {
    // Generate test events for validation
    console.log('Simulating security events...');
    const detector = getAnomalyDetector();

    const operations = ['Bash', 'Write', 'Edit', 'Read', 'Task'];
    const validators = ['bash_safety', 'env_protection', 'secret_guard'];
    const actions = ['ALLOWED', 'BLOCKED', 'WARNING'];

    for (let i = 0; i < 20; i++) {
      const op = operations[Math.floor(Math.random() * operations.length)]!;
      const validator = validators[Math.floor(Math.random() * validators.length)]!;
      const action = actions[Math.floor(Math.random() * actions.length)]!;
      detector.recordEvent(op, validator, action, 'INFO');
    }

    const status = detector.getBaselineStatus();
    if (jsonOutput) {
      console.log(JSON.stringify({ status: 'simulated', events: 20, baseline: status }));
    } else {
      console.log('Simulated 20 events.');
      console.log(`Operation types tracked: ${status['operation_types_tracked']}`);
      console.log(`Baseline ready: ${status['baseline_ready']}`);
    }
  } else {
    console.error('Usage: anomaly-detector [status|check|reset|simulate] [--json]');
    process.exit(1);
  }
}

// Run CLI if executed directly
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith('anomaly-detector.js') ||
    process.argv[1].endsWith('anomaly-detector.ts'));

if (isMainModule) {
  main();
}
