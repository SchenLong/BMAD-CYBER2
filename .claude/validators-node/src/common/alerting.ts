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

// Configuration
const ALERT_RATE_LIMIT_MS = 60000; // 1 minute between same-type alerts
const ALERT_TIMEOUT_MS = 5000; // 5 second timeout for webhook calls

/**
 * Alert severity levels in order of priority.
 */
const SEVERITY_ORDER: Record<Severity, number> = {
  INFO: 0,
  WARNING: 1,
  BLOCKED: 2,
  CRITICAL: 3,
};

/**
 * Track last alert times to prevent alert storms.
 */
const lastAlertTimes: Map<string, number> = new Map();

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
 * Slack-compatible message block structure.
 */
interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Get the configured alert level threshold.
 */
function getAlertLevel(): Severity {
  const level = (process.env.BMAD_ALERT_LEVEL || 'CRITICAL').toUpperCase();
  if (level in SEVERITY_ORDER) {
    return level as Severity;
  }
  return 'CRITICAL';
}

/**
 * Check if an alert should be sent based on severity threshold.
 */
export function shouldAlert(severity: Severity): boolean {
  const threshold = getAlertLevel();
  return SEVERITY_ORDER[severity] >= SEVERITY_ORDER[threshold];
}

/**
 * Check if rate limited for this alert type.
 */
function isRateLimited(alertKey: string): boolean {
  const lastTime = lastAlertTimes.get(alertKey);
  if (!lastTime) return false;
  return Date.now() - lastTime < ALERT_RATE_LIMIT_MS;
}

/**
 * Format alert as Slack-compatible message blocks.
 */
function formatSlackMessage(payload: AlertPayload): { blocks: SlackBlock[]; text: string } {
  const emoji = payload.severity === 'CRITICAL' ? ':rotating_light:' :
                payload.severity === 'BLOCKED' ? ':no_entry:' :
                payload.severity === 'WARNING' ? ':warning:' : ':information_source:';

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} BMAD Security Alert: ${payload.severity}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Event Type:*\n${payload.event_type}`,
        },
        {
          type: 'mrkdwn',
          text: `*Validator:*\n${payload.validator}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Message:*\n${payload.message}`,
      },
    },
  ];

  if (payload.details && Object.keys(payload.details).length > 0) {
    const detailsText = Object.entries(payload.details)
      .slice(0, 5) // Limit to 5 details
      .map(([key, value]) => `• *${key}:* ${JSON.stringify(value).slice(0, 100)}`)
      .join('\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Details:*\n${detailsText}`,
      },
    });
  }

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Timestamp:* ${payload.timestamp || new Date().toISOString()}`,
    },
  });

  return {
    blocks,
    text: `BMAD Security Alert: ${payload.severity} - ${payload.event_type} from ${payload.validator}`,
  };
}

/**
 * Send alert via webhook (async).
 */
export async function sendAlert(payload: AlertPayload): Promise<boolean> {
  const webhookUrl = process.env.BMAD_ALERT_WEBHOOK_URL;

  // Check if should alert based on severity
  if (!shouldAlert(payload.severity)) {
    return false;
  }

  // Check rate limiting
  const alertKey = `${payload.validator}:${payload.event_type}`;
  if (isRateLimited(alertKey)) {
    return false;
  }

  // Update rate limit tracker
  lastAlertTimes.set(alertKey, Date.now());

  // Add timestamp if not present
  if (!payload.timestamp) {
    payload.timestamp = new Date().toISOString();
  }

  // If no webhook URL, fallback to console
  if (!webhookUrl) {
    console.error(`[BMAD_ALERT] ${payload.severity}: ${payload.event_type} - ${payload.message}`);
    if (payload.details) {
      console.error(`[BMAD_ALERT] Details: ${JSON.stringify(payload.details)}`);
    }
    return true;
  }

  // Send webhook
  try {
    const slackMessage = formatSlackMessage(payload);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ALERT_TIMEOUT_MS);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[BMAD_ALERT] Webhook failed: ${response.status} ${response.statusText}`);
      // Fallback to console
      console.error(`[BMAD_ALERT] ${payload.severity}: ${payload.event_type} - ${payload.message}`);
      return false;
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[BMAD_ALERT] Webhook error: ${errorMessage}`);
    // Fallback to console
    console.error(`[BMAD_ALERT] ${payload.severity}: ${payload.event_type} - ${payload.message}`);
    return false;
  }
}

/**
 * Send alert synchronously (best effort, non-blocking).
 * Uses fire-and-forget pattern for validators that can't await.
 */
export function sendAlertSync(payload: AlertPayload): void {
  // Check if should alert based on severity
  if (!shouldAlert(payload.severity)) {
    return;
  }

  // Check rate limiting
  const alertKey = `${payload.validator}:${payload.event_type}`;
  if (isRateLimited(alertKey)) {
    return;
  }

  // Update rate limit tracker
  lastAlertTimes.set(alertKey, Date.now());

  // Add timestamp if not present
  if (!payload.timestamp) {
    payload.timestamp = new Date().toISOString();
  }

  const webhookUrl = process.env.BMAD_ALERT_WEBHOOK_URL;

  // If no webhook URL, fallback to console
  if (!webhookUrl) {
    console.error(`[BMAD_ALERT] ${payload.severity}: ${payload.event_type} - ${payload.message}`);
    if (payload.details) {
      console.error(`[BMAD_ALERT] Details: ${JSON.stringify(payload.details)}`);
    }
    return;
  }

  // Fire and forget - don't await
  sendAlert(payload).catch(() => {
    // Silently ignore errors in sync mode
  });
}

/**
 * Helper to create and send a critical alert.
 */
export function alertCritical(
  validator: string,
  eventType: string,
  message: string,
  details?: Record<string, unknown>
): void {
  sendAlertSync({
    severity: 'CRITICAL',
    event_type: eventType,
    validator,
    message,
    details,
  });
}

/**
 * Helper to create and send a blocked alert.
 */
export function alertBlocked(
  validator: string,
  eventType: string,
  message: string,
  details?: Record<string, unknown>
): void {
  sendAlertSync({
    severity: 'BLOCKED',
    event_type: eventType,
    validator,
    message,
    details,
  });
}

/**
 * Helper to create and send a warning alert.
 */
export function alertWarning(
  validator: string,
  eventType: string,
  message: string,
  details?: Record<string, unknown>
): void {
  sendAlertSync({
    severity: 'WARNING',
    event_type: eventType,
    validator,
    message,
    details,
  });
}
