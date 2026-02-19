/**
 * CLI Bridge Process Error
 * Story 5.2: Safe Process Spawning
 *
 * Custom error class for process-specific errors.
 * Provides structured error information for debugging and logging.
 */

import type { CliResult } from './types';

/**
 * Process Error Types
 */
export enum ProcessErrorType {
  /** Command not found in whitelist */
  NOT_FOUND = 'NOT_FOUND',
  /** Command is disabled */
  DISABLED = 'DISABLED',
  /** Parameter validation failed */
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  /** Process timed out */
  TIMEOUT = 'TIMEOUT',
  /** Process exited with non-zero code */
  NON_ZERO_EXIT = 'NON_ZERO_EXIT',
  /** Process was killed */
  KILLED = 'KILLED',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Process-specific error
 * Thrown when process execution fails
 */
export class ProcessError extends Error {
  /** Process exit code */
  public readonly exitCode?: number;

  /** Whether process timed out */
  public readonly timedOut: boolean;

  /** Command that failed */
  public readonly command: string;

  /** Standard error output */
  public readonly stderr?: string;

  /** Error type for categorization */
  public readonly errorType: ProcessErrorType;

  /** Process ID if available */
  public readonly pid?: number;

  constructor(
    message: string,
    options: {
      exitCode?: number;
      timedOut?: boolean;
      command?: string;
      stderr?: string;
      errorType?: ProcessErrorType;
      pid?: number;
    } = {}
  ) {
    super(message);
    this.name = 'ProcessError';
    this.exitCode = options.exitCode;
    this.timedOut = options.timedOut ?? false;
    this.command = options.command ?? 'unknown';
    this.stderr = options.stderr;
    this.errorType = options.errorType ?? this.inferErrorType();
    this.pid = options.pid;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProcessError);
    }
  }

  /**
   * Infer error type from available information
   */
  private inferErrorType(): ProcessErrorType {
    if (this.timedOut) {
      return ProcessErrorType.TIMEOUT;
    }
    if (this.exitCode !== undefined && this.exitCode !== 0) {
      return ProcessErrorType.NON_ZERO_EXIT;
    }
    return ProcessErrorType.UNKNOWN;
  }

  /**
   * Create a ProcessError from a CliResult
   */
  static fromCliResult(result: CliResult): ProcessError {
    let errorType = ProcessErrorType.UNKNOWN;

    if (result.timedOut) {
      errorType = ProcessErrorType.TIMEOUT;
    } else if (result.exitCode !== 0) {
      errorType = ProcessErrorType.NON_ZERO_EXIT;
    }

    return new ProcessError(
      result.error || `Command failed with exit code ${result.exitCode}`,
      {
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        command: result.command,
        stderr: result.stderr,
        errorType,
        pid: result.pid,
      }
    );
  }

  /**
   * Create a ProcessError from an execa error
   */
  static fromExecaError(error: {
    exitCode?: number;
    timedOut?: boolean;
    command?: string;
    stderr?: string;
    message: string;
    pid?: number;
    killed?: boolean;
  }): ProcessError {
    let errorType = ProcessErrorType.UNKNOWN;

    if (error.killed) {
      errorType = ProcessErrorType.KILLED;
    } else if (error.timedOut) {
      errorType = ProcessErrorType.TIMEOUT;
    } else if (error.exitCode !== undefined && error.exitCode !== 0) {
      errorType = ProcessErrorType.NON_ZERO_EXIT;
    }

    return new ProcessError(error.message, {
      exitCode: error.exitCode,
      timedOut: error.timedOut ?? false,
      command: error.command,
      stderr: error.stderr,
      errorType,
      pid: error.pid,
    });
  }

  /**
   * Create a validation error
   */
  static validationFailed(commandId: string, reason: string): ProcessError {
    return new ProcessError(
      `Parameter validation failed for command ${commandId}: ${reason}`,
      {
        command: commandId,
        errorType: ProcessErrorType.VALIDATION_FAILED,
      }
    );
  }

  /**
   * Create a "command not found" error
   */
  static notFound(commandId: string): ProcessError {
    return new ProcessError(
      `Command not found in whitelist: ${commandId}`,
      {
        command: commandId,
        errorType: ProcessErrorType.NOT_FOUND,
      }
    );
  }

  /**
   * Create a "command disabled" error
   */
  static disabled(commandId: string): ProcessError {
    return new ProcessError(
      `Command is disabled: ${commandId}`,
      {
        command: commandId,
        errorType: ProcessErrorType.DISABLED,
      }
    );
  }

  /**
   * Check if error is due to timeout
   */
  isTimeout(): boolean {
    return this.errorType === ProcessErrorType.TIMEOUT;
  }

  /**
   * Check if error is due to non-zero exit
   */
  isExitCodeError(): boolean {
    return this.errorType === ProcessErrorType.NON_ZERO_EXIT;
  }

  /**
   * Check if error is due to validation failure
   */
  isValidationError(): boolean {
    return this.errorType === ProcessErrorType.VALIDATION_FAILED;
  }

  /**
   * Check if error is due to command not found
   */
  isNotFoundError(): boolean {
    return this.errorType === ProcessErrorType.NOT_FOUND;
  }

  /**
   * Check if error is due to command being disabled
   */
  isDisabledError(): boolean {
    return this.errorType === ProcessErrorType.DISABLED;
  }

  /**
   * Check if error is due to process being killed
   */
  isKilledError(): boolean {
    return this.errorType === ProcessErrorType.KILLED;
  }

  /**
   * Convert error to plain object for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      errorType: this.errorType,
      command: this.command,
      exitCode: this.exitCode,
      timedOut: this.timedOut,
      pid: this.pid,
      stderr: this.stderr?.substring(0, 500), // Truncate for logs
    };
  }
}

export default ProcessError;
