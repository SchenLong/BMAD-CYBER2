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

/** WebFetch tool input — URL fetch with analysis prompt. */
export interface WebFetchToolInput {
  url: string;
  prompt: string;
}

/** Task tool input — subagent delegation. */
export interface TaskToolInput {
  prompt: string;
  subagent_type: string;
  description: string;
  model?: string;
}

/** Skill tool input — slash-command invocation. */
export interface SkillToolInput {
  skill: string;
  args?: string;
}

/** WebSearch tool input — web search query. */
export interface WebSearchToolInput {
  query: string;
  allowed_domains?: string[];
  blocked_domains?: string[];
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
 * Base interface for all security findings (TPI-PRE-3).
 * All validators producing findings should conform to this shape.
 */
export interface Finding {
  category: string;
  severity: Severity;
  description: string;
  source?: string;
  match_preview?: string;
}

// =============================================================================
// PostToolUse Types (TPI-00)
// =============================================================================

/**
 * Generic PostToolUse input — the full JSON Claude Code provides on stdin.
 */
export interface PostToolInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response: Record<string, unknown>;
  session_id?: string;
  cwd?: string;
  hook_event_name?: string;
  tool_use_id?: string;
}

/**
 * WebFetch tool output shape.
 */
export interface WebFetchToolOutput {
  url: string;
  response_body: string;
  status_code?: number;
}

/**
 * Task tool output shape.
 */
export interface TaskToolOutput {
  result: string;
  agent_type?: string;
  agent_id?: string;
}

/**
 * Skill tool output shape.
 */
export interface SkillToolOutput {
  skill_name: string;
  result: string;
}

/**
 * WebSearch tool output shape.
 */
export interface WebSearchToolOutput {
  query?: string;
  results?: string;
}

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
