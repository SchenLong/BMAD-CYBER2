/**
 * BMAD Validators - Alerting Module (SEC-002-1)
 * ==============================================
 * Real-time alerting for critical security events via webhooks.
 *
 * Features:
 * - Webhook-based alerting (Slack-compatible format)
 * - Configurable alert level threshold
 * - Fallback to console.error when webhook unavailable
 * - Rate limiting to prevent alert storms
 *
 * Environment Variables:
 * - BMAD_ALERT_WEBHOOK_URL: Webhook URL for alerts
 * - BMAD_ALERT_LEVEL: Minimum severity to trigger alerts (default: CRITICAL)
 */
import type { Severity } from '../types/index.js';
/**
 * Alert payload structure.
 */
export interface AlertPayload {
    severity: Severity;
    event_type: string;
    validator: string;
    message: string;
    details?: Record<string, unknown> | undefined;
    timestamp?: string | undefined;
}
/**
 * Check if an alert should be sent based on severity threshold.
 */
export declare function shouldAlert(severity: Severity): boolean;
/**
 * Send alert via webhook (async).
 */
export declare function sendAlert(payload: AlertPayload): Promise<boolean>;
/**
 * Send alert synchronously (best effort, non-blocking).
 * Uses fire-and-forget pattern for validators that can't await.
 */
export declare function sendAlertSync(payload: AlertPayload): void;
/**
 * Helper to create and send a critical alert.
 */
export declare function alertCritical(validator: string, eventType: string, message: string, details?: Record<string, unknown>): void;
/**
 * Helper to create and send a blocked alert.
 */
export declare function alertBlocked(validator: string, eventType: string, message: string, details?: Record<string, unknown>): void;
/**
 * Helper to create and send a warning alert.
 */
export declare function alertWarning(validator: string, eventType: string, message: string, details?: Record<string, unknown>): void;
