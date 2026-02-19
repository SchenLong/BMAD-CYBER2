/**
 * CLI Bridge Command Types
 * Story 5.1: Command Whitelist System
 *
 * Type definitions for command whitelisting and execution.
 * These types define the security boundary for CLI command execution.
 */

import { UserRole } from '@prisma/client';
import { z } from 'zod';

/**
 * Command category for grouping and UI organization
 */
export type CommandCategory =
  | 'project'
  | 'agent'
  | 'workflow'
  | 'intel'
  | 'security';

/**
 * Command whitelist entry definition
 * Defines all metadata and security constraints for an executable command
 */
export interface CommandDefinition {
  /** Unique identifier for this command (e.g., 'mission.list') */
  id: string;
  /** Executable command name (e.g., 'bmad') */
  command: string;
  /** Base arguments for the command */
  args: string[];
  /** Maximum execution time in milliseconds */
  timeout: number;
  /** Roles allowed to execute this command */
  allowedRoles: UserRole[];
  /** Runtime parameter validation schema (optional) */
  validation?: z.ZodSchema;
  /** Human-readable description for UI display */
  description: string;
  /** Command category for grouping */
  category: CommandCategory;
  /** Example usage for help text */
  example?: string;
  /** Whether this command is enabled (for feature flags) */
  enabled?: boolean;
}

/**
 * CLI command execution result
 * Returned after command execution completes
 */
export interface CliResult {
  /** Standard output from command */
  stdout: string;
  /** Standard error from command */
  stderr: string;
  /** Process exit code */
  exitCode: number;
  /** Whether execution timed out */
  timedOut: boolean;
  /** Full command that was executed */
  command: string;
  /** Execution time in milliseconds */
  duration?: number;
  /** PID of the executed process */
  pid?: number;
  /** Error message if execution failed */
  error?: string;
  /** Whether output was truncated due to size limit */
  truncated?: boolean;
}

/**
 * Audit log entry for CLI command attempts
 * Logged for all command attempts (allowed and blocked)
 */
export interface CliAuditEntry {
  /** ISO-8601 timestamp */
  timestamp: string;
  /** User ID who attempted the command */
  userId: string;
  /** User's role at time of execution */
  userRole: UserRole;
  /** Command ID that was attempted */
  commandId: string;
  /** Parameters passed to command */
  parameters: Record<string, unknown>;
  /** Whether the command was allowed to execute */
  allowed: boolean;
  /** Reason if blocked (e.g., 'not_found', 'forbidden', 'timeout') */
  reason?: string;
  /** Client IP address */
  ipAddress: string;
  /** Client user agent */
  userAgent: string;
  /** Execution result (if allowed) */
  result?: CliResult;
  /** SHA-256 hash of this entry for tamper evidence */
  hash?: string;
  /** Previous hash in chain for integrity verification */
  prevHash?: string;
}

/**
 * Command execution request
 * Input format for executing commands through the CLI bridge
 */
export interface CommandExecutionRequest {
  /** Command ID to execute */
  commandId: string;
  /** Parameters for the command */
  parameters?: Record<string, unknown>;
  /** Optional timeout override (must be <= command's max timeout) */
  timeout?: number;
}

/**
 * Command execution response
 * Response format for command execution results
 */
export interface CommandExecutionResponse {
  /** Whether execution succeeded */
  success: boolean;
  /** Execution result if successful */
  result?: CliResult;
  /** Error message if failed */
  error?: string;
  /** Validation errors if parameters invalid */
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Command list entry for API responses
 * Filtered based on user's role
 */
export interface CommandListEntry {
  /** Command ID */
  id: string;
  /** Command description */
  description: string;
  /** Command category */
  category: CommandCategory;
  /** Maximum timeout in milliseconds */
  timeout: number;
  /** Example usage */
  example?: string;
  /** Whether user has permission */
  hasPermission: boolean;
}

/**
 * Whitelist validation result
 * Result of checking if a command is in the whitelist
 */
export interface WhitelistValidationResult {
  /** Whether command is in whitelist */
  found: boolean;
  /** Command definition if found */
  command?: CommandDefinition;
  /** Error message if not found */
  error?: string;
}

/**
 * Role validation result
 * Result of checking if a user has permission to execute a command
 */
export interface RoleValidationResult {
  /** Whether user has permission */
  allowed: boolean;
  /** Required role if not allowed */
  requiredRole?: UserRole;
  /** User's current role */
  userRole?: UserRole;
  /** Error message if not allowed */
  error?: string;
}

// ============================================================================
// Story 5.2: Safe Process Spawning Types
// ============================================================================

/**
 * Process execution options
 * Configuration for spawning child processes
 */
export interface ProcessOptions {
  /** Working directory for the process (default: process.cwd()) */
  cwd?: string;
  /** Environment variables for the process (only safe vars allowed) */
  env?: Record<string, string>;
  /** Maximum execution time in milliseconds */
  timeout?: number;
  /** Maximum output size in bytes (default: 10MB) */
  maxOutputSize?: number;
  /** Whether to reject on non-zero exit code */
  reject?: boolean;
}

/**
 * Active process tracking state
 */
export type ProcessStatus =
  | 'starting'
  | 'running'
  | 'completed'
  | 'failed'
  | 'killed'
  | 'timedOut';

/**
 * Active process information
 * Tracks currently running processes
 */
export interface ActiveProcess {
  /** Unique process identifier */
  id: string;
  /** Command being executed */
  command: string;
  /** Command arguments */
  args: string[];
  /** Current process status */
  status: ProcessStatus;
  /** Process start time */
  startTime: Date;
  /** Process end time (if completed) */
  endTime?: Date;
  /** Process ID from OS */
  pid?: number;
  /** Collected output lines */
  output: string[];
  /** Exit code (if completed) */
  exitCode?: number;
  /** User who initiated the process */
  userId?: string;
  /** Command ID being executed */
  commandId?: string;
  /** Whether process was killed */
  killed?: boolean;
}

/**
 * Process event types for event emission
 */
export type ProcessEvent =
  | { type: 'started'; processId: string; command: string }
  | { type: 'updated'; processId: string; status: ProcessStatus }
  | { type: 'completed'; processId: string; exitCode: number; duration: number }
  | { type: 'failed'; processId: string; error: string; exitCode?: number }
  | { type: 'killed'; processId: string }
  | { type: 'output'; processId: string; data: string; stream: 'stdout' | 'stderr' };
