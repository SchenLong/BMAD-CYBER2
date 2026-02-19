/**
 * CLI Bridge Command Dispatcher
 * Story 5.2: Safe Process Spawning
 *
 * Executes whitelisted CLI commands safely using execa with shell: false.
 * This is the core execution engine for the CLI bridge.
 *
 * SECURITY: All commands must pass through the whitelist. This dispatcher
 * only executes commands that are already validated against ALLOWED_COMMANDS.
 */

import { execa, type ExecaError } from 'execa';
import type { CommandDefinition } from './types';
import type { CliResult, ProcessOptions } from './types';
import { ProcessError } from './process-error';

/**
 * Command Dispatcher Options
 * Additional options for command execution
 */
export interface DispatcherOptions extends ProcessOptions {
  /** Working directory override */
  cwd?: string;
  /** Custom environment variables (merged with safe defaults) */
  env?: Record<string, string>;
  /** Output size limit in bytes (default: 10MB) */
  maxOutputSize?: number;
}

/**
 * Default maximum output size (10MB)
 */
const DEFAULT_MAX_OUTPUT_SIZE = 10 * 1024 * 1024;

/**
 * Safe environment variables to pass to child processes
 * Never allow user-controlled environment variables
 */
function getSafeEnvironment(userProvidedEnv?: Record<string, string>): Record<string, string> {
  const safeEnv: Record<string, string> = {
    // Essential system paths
    PATH: process.env.PATH || '',
    HOME: process.env.HOME || '',
    USER: process.env.USER || '',
    // Language/locale
    LANG: process.env.LANG || 'en_US.UTF-8',
    LC_ALL: process.env.LC_ALL || 'en_US.UTF-8',
    // BMAD-specific configuration (from server env only, never user input)
    BMAD_OUTPUT_FORMAT: 'json',
  };

  // Only add BMAD_API_KEY if it exists in the server environment
  if (process.env.BMAD_API_KEY) {
    safeEnv.BMAD_API_KEY = process.env.BMAD_API_KEY;
  }

  // Merge user-provided env ONLY if explicitly whitelisted
  // This is an additional safety check
  const allowedEnvKeys = ['NODE_ENV', 'CI', 'DEBUG'];
  if (userProvidedEnv) {
    for (const key of allowedEnvKeys) {
      if (key in userProvidedEnv) {
        safeEnv[key] = userProvidedEnv[key];
      }
    }
  }

  return safeEnv;
}

/**
 * Truncate output to maximum size
 * Adds indicator if truncated
 */
function truncateOutput(output: string, maxSize: number): string {
  if (output.length > maxSize) {
    return output.slice(0, maxSize) + '\n\n... [output truncated due to size limit]';
  }
  return output;
}

/**
 * Command Dispatcher
 * Executes whitelisted CLI commands safely
 */
export class CommandDispatcher {
  private maxOutputSize: number;
  private defaultCwd: string;

  constructor(options?: { maxOutputSize?: number; cwd?: string }) {
    this.maxOutputSize = options?.maxOutputSize ?? DEFAULT_MAX_OUTPUT_SIZE;
    this.defaultCwd = options?.cwd ?? process.cwd();
  }

  /**
   * Execute a command by its definition
   * @param commandDef - Command definition from whitelist
   * @param parameters - Command parameters (will be validated against schema)
   * @param options - Execution options
   * @returns CliResult with execution results
   */
  async execute(
    commandDef: CommandDefinition,
    parameters: Record<string, unknown> = {},
    options: DispatcherOptions = {}
  ): Promise<CliResult> {
    const startTime = Date.now();
    const commandId = commandDef.id;

    // Validate parameters if schema is defined
    let validatedParams = parameters;
    if (commandDef.validation) {
      try {
        const parsed = commandDef.validation.parse(parameters);
        validatedParams = parsed as Record<string, unknown>;
      } catch (error) {
        throw new ProcessError(
          `Parameter validation failed for command ${commandId}`,
          {
            command: commandDef.command,
          }
        );
      }
    }

    // Build command arguments array
    // Start with base args from command definition
    const args = [...commandDef.args];

    // Add validated parameters as --key value pairs
    for (const [key, value] of Object.entries(validatedParams)) {
      // Skip undefined/null values
      if (value === undefined || value === null) {
        continue;
      }

      // Handle different parameter types
      if (typeof value === 'boolean') {
        // Boolean flags: add --flag if true, skip if false
        if (value) {
          args.push(`--${key}`);
        }
      } else if (typeof value === 'object') {
        // Objects/arrays: convert to JSON string
        args.push(`--${key}`, JSON.stringify(value));
      } else {
        // Primitives: add --key value
        args.push(`--${key}`, String(value));
      }
    }

    // Prepare execution options
    const execOptions = {
      // CRITICAL: shell: false is the default - never set to true
      // This prevents shell injection attacks
      timeout: options.timeout ?? commandDef.timeout,
      reject: false, // Don't throw on non-zero exit, handle manually
      cwd: options.cwd ?? this.defaultCwd,
      env: getSafeEnvironment(options.env),
      // Extend timeout for safety buffer (10% extra)
      extendTimeout: true,
    };

    try {
      // Execute the command using execa
      // execa defaults to shell: false which is CRITICAL for security
      const result = await execa(commandDef.command, args, execOptions);

      const duration = Date.now() - startTime;
      const truncated = result.stdout.length > this.maxOutputSize ||
                       result.stderr.length > this.maxOutputSize;

      return {
        stdout: truncateOutput(result.stdout, this.maxOutputSize),
        stderr: truncateOutput(result.stderr, this.maxOutputSize),
        exitCode: result.exitCode ?? 0,
        timedOut: result.timedOut ?? false,
        command: `${commandDef.command} ${args.join(' ')}`,
        duration,
        // Note: execa v9 doesn't expose pid in result, pid tracking is handled by ProcessManager
        truncated,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle ExecaError specifically
      if (this.isExecaError(error)) {
        const truncated = (error.stdout?.length ?? 0) > this.maxOutputSize ||
                         (error.stderr?.length ?? 0) > this.maxOutputSize;

        // Convert stdout/stderr to string (could be Uint8Array in execa v9)
        const stdoutStr = typeof error.stdout === 'string' ? error.stdout : '';
        const stderrStr = typeof error.stderr === 'string' ? error.stderr : '';

        return {
          stdout: truncateOutput(stdoutStr, this.maxOutputSize),
          stderr: truncateOutput(stderrStr, this.maxOutputSize),
          exitCode: error.exitCode ?? 1,
          timedOut: error.timedOut ?? false,
          command: `${commandDef.command} ${args.join(' ')}`,
          duration,
          error: error.message,
          truncated,
        };
      }

      // Handle unexpected errors
      throw new ProcessError(
        `Unexpected error executing command ${commandId}: ${error instanceof Error ? error.message : String(error)}`,
        {
          command: commandDef.command,
        }
      );
    }
  }

  /**
   * Execute a command by ID
   * Convenience method that looks up command from ALLOWED_COMMANDS
   * @param commandId - Command ID from whitelist
   * @param parameters - Command parameters
   * @param options - Execution options
   * @returns CliResult with execution results
   */
  async executeById(
    commandId: string,
    parameters: Record<string, unknown> = {},
    options: DispatcherOptions = {}
  ): Promise<CliResult> {
    // Dynamic import to avoid circular dependency
    const { ALLOWED_COMMANDS } = await import('./allowed-commands');
    const commandDef = ALLOWED_COMMANDS[commandId];

    if (!commandDef) {
      throw new ProcessError(
        `Command not found in whitelist: ${commandId}`,
        { command: commandId }
      );
    }

    if (commandDef.enabled === false) {
      throw new ProcessError(
        `Command is disabled: ${commandId}`,
        { command: commandId }
      );
    }

    return this.execute(commandDef, parameters, options);
  }

  /**
   * Type guard for ExecaError
   */
  private isExecaError(error: unknown): error is ExecaError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      ('exitCode' in error || 'timedOut' in error)
    );
  }

  /**
   * Get the current max output size
   */
  getMaxOutputSize(): number {
    return this.maxOutputSize;
  }

  /**
   * Update the max output size
   */
  setMaxOutputSize(size: number): void {
    this.maxOutputSize = Math.max(1024, size); // Minimum 1KB
  }
}

/**
 * Singleton instance for convenient import
 */
export const commandDispatcher = new CommandDispatcher();

/**
 * Default export for backward compatibility
 */
export default CommandDispatcher;
