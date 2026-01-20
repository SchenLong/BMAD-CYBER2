/**
 * BMAD Validators - Observability Module
 * =======================================
 * Re-exports all observability utilities.
 */

export {
  TelemetryCollector,
  getTelemetryCollector,
  recordSecurityEvent,
  recordRateLimitMetrics,
  recordPermissionCheck,
  recordResourceUsage,
  recordSupplyChainVerification,
  recordConfidenceAnalysis,
  recordAnomalySignal,
} from './telemetry.js';

export type {
  SecurityEventParams,
  RateLimitMetricsParams,
  PermissionCheckParams,
  ResourceUsageParams,
  SupplyChainVerificationParams,
  ConfidenceAnalysisParams,
  AnomalySignalParams,
} from './telemetry.js';

export {
  HashChainManager,
  getChainManager,
  addChainFields,
  verifySecurityLog,
  getIntegrityStatus,
} from './audit-integrity.js';

export type { VerificationResult } from './audit-integrity.js';

export {
  AnomalyDetector,
  getAnomalyDetector,
  recordSecurityEventForAnomaly,
  checkAnomalies,
  getBaselineStatus,
  resetBaseline,
} from './anomaly-detector.js';

export type { AnomalySignal } from './anomaly-detector.js';

export {
  ConfidenceTracker,
  ConfidenceLevel,
  getConfidenceTracker,
  analyzeResponseConfidence,
  getConfidenceIndicator,
  analyzeToolOutput,
} from './confidence-tracker.js';

export type {
  UncertaintyMatch,
  SourceAttribution,
  ConfidenceResult,
} from './confidence-tracker.js';

// Log Archival exports (SEC-003-3)
export {
  LogArchiver,
  createLogArchiver,
  runDailyArchival,
  archiveLogsInDateRange,
  ArchivalError,
  S3ArchivalError,
  GPGSigningError,
} from './log-archiver.js';

export type {
  ArchivalConfig,
  ArchiveMetadata,
  ArchiveResult,
} from './log-archiver.js';

export {
  ArchivalConfigManager,
  createConfigManager,
  checkConfiguration,
} from './archival-config.js';

export type {
  ConfigValidationResult,
  S3BucketStatus,
  GPGKeyInfo,
  ScheduleValidation,
} from './archival-config.js';

export {
  ArchivalScheduler,
  getArchivalScheduler,
  initializeArchivalScheduling,
  triggerArchival,
  getArchivalStatus,
} from './archival-scheduler.js';

export type {
  ArchivalJobStatus,
  ArchivalJobResult,
  SchedulerConfig,
} from './archival-scheduler.js';

// Audit Encryption exports (already implemented)
export {
  encryptEntry,
  decryptEntry,
  processEntryForStorage,
  processLineForReading,
  isEncryptionEnabled,
  getEncryptionStatus,
  generateEncryptionKey,
  isEncryptedEntry,
  AuditEncryptionError,
  AuditDecryptionError,
} from './audit-encryption.js';

export type {
  EncryptedAuditEntry,
} from './audit-encryption.js';
