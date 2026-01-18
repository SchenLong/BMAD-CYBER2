/**
 * BMAD Validators - Type Definitions
 * ===================================
 * Common types used across all validators.
 */

/**
 * Tool input received from Claude Code via stdin.
 */
export interface ToolInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  cwd: string;
  raw: Record<string, unknown>;
}

/**
 * Bash tool input structure.
 */
export interface BashToolInput {
  command: string;
  timeout?: number;
}

/**
 * Write tool input structure.
 */
export interface WriteToolInput {
  file_path: string;
  content: string;
}

/**
 * Edit tool input structure.
 */
export interface EditToolInput {
  file_path: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

/**
 * Read tool input structure.
 */
export interface ReadToolInput {
  file_path: string;
  offset?: number;
  limit?: number;
}

/**
 * Validation result from a validator.
 */
export interface ValidationResult {
  allowed: boolean;
  reason: string;
  severity?: 'INFO' | 'WARNING' | 'BLOCKED' | 'CRITICAL';
  recommendations?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Audit log entry structure.
 */
export interface AuditLogEntry {
  timestamp: string;
  session_id: string;
  validator: string;
  severity: string;
  action: string;
  details: Record<string, unknown>;
  _chain_index?: number;
  _previous_hash?: string;
  _entry_hash?: string;
  _chain_error?: string;
  [key: string]: unknown; // Allow additional properties for extensibility
}

/**
 * Override token with consumption tracking (SEC-001-3).
 */
export interface OverrideTokenInfo {
  available: boolean;
  consumed_by?: string;  // Validator that consumed the token
  consumed_at?: number;  // Timestamp of consumption
}

/**
 * Override state stored in the override file.
 */
export interface OverrideState {
  overrides: Record<string, boolean>;
  created_at: Record<string, number>;
  consumed_by?: Record<string, OverrideTokenInfo>;  // SEC-001-3: Track which validator consumed each token
  last_update?: number;
}

/**
 * Override check result.
 */
export interface OverrideCheckResult {
  valid: boolean;
  reason: string;
}

/**
 * Override status for debugging/admin.
 */
export interface OverrideStatus {
  available: boolean;
  seconds_remaining: number;
  expired: boolean;
}

/**
 * Command substitution detection result.
 */
export interface CommandSubstitution {
  type: string;
  match: string;
}

/**
 * Severity levels for logging.
 */
export type Severity = 'INFO' | 'WARNING' | 'BLOCKED' | 'CRITICAL';

/**
 * Actions logged by validators.
 */
export type Action = 'ALLOWED' | 'BLOCKED' | 'WARNING' | 'OVERRIDE_USED' | 'ANOMALY_DETECTED';

/**
 * Exit codes for validators.
 * - 0: Allow the operation
 * - 1: Soft block (warning only)
 * - 2: Hard block (operation blocked)
 */
export const EXIT_CODES = {
  ALLOW: 0,
  SOFT_BLOCK: 1,
  HARD_BLOCK: 2,
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];
