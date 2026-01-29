/**
 * Security Event Monitoring and Telemetry System
 * Real-time security event collection and analysis
 * NIST CSF: Detect, Respond
 */

import { EventEmitter } from "events";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;
  severity: SeverityLevel;
  source: EventSource;
  actor?: string;
  target?: string;
  description: string;
  metadata: Record<string, any>;
  correlationId?: string;
  hash: string;
}

export enum SecurityEventType {
  // Authentication Events
  LOGIN_ATTEMPT = "login_attempt",
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  LOGOUT = "logout",
  SESSION_EXPIRED = "session_expired",
  MFA_CHALLENGE = "mfa_challenge",
  MFA_SUCCESS = "mfa_success",
  MFA_FAILURE = "mfa_failure",

  // Authorization Events
  ACCESS_GRANTED = "access_granted",
  ACCESS_DENIED = "access_denied",
  PRIVILEGE_ESCALATION = "privilege_escalation",
  ROLE_CHANGE = "role_change",

  // Data Access Events
  DATA_ACCESS = "data_access",
  DATA_MODIFICATION = "data_modification",
  DATA_DELETION = "data_deletion",
  DATA_EXPORT = "data_export",

  // Security Violations
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  SECURITY_VIOLATION = "security_violation",
  MALWARE_DETECTION = "malware_detection",
  INTRUSION_ATTEMPT = "intrusion_attempt",

  // System Events
  SYSTEM_START = "system_start",
  SYSTEM_SHUTDOWN = "system_shutdown",
  CONFIGURATION_CHANGE = "configuration_change",
  SOFTWARE_UPDATE = "software_update",

  // Network Events
  NETWORK_CONNECTION = "network_connection",
  NETWORK_DISCONNECTION = "network_disconnection",
  FIREWALL_BLOCK = "firewall_block",
  DDOS_DETECTION = "ddos_detection"
}
