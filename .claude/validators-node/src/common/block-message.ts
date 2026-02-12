/**
 * BMAD Validators - Block Message Utilities
 * ==========================================
 * Standardized block message formatting for security validators.
 */

import { sanitizeErrorMessage, sanitizePath } from './path-utils.js';

/**
 * Options for printing a block message.
 */
export interface BlockMessageOptions {
  /** Block type title (e.g., "ABSOLUTE BLOCK", "STRICT BLOCK") */
  title: string;
  /** Main message explaining what was blocked */
  message: string;
  /** The command or file that was blocked */
  target: string;
  /** Environment variable for override (if applicable) */
  overrideVar?: string | undefined;
  /** List of recommendation strings */
  recommendations?: string[] | undefined;
  /** If true, indicates no override is possible */
  isAbsolute?: boolean | undefined;
}

/**
 * Print a standardized block message to stderr.
 *
 * @param options - Block message configuration
 */
export function printBlockMessage(options: BlockMessageOptions): void {
  const {
    title,
    message,
    target,
    overrideVar,
    recommendations,
    isAbsolute = false,
  } = options;

  const separator = '='.repeat(60);

  console.error(`\n${separator}`);
  console.error(`BMAD GUARDRAIL: ${title}`);
  console.error(separator);
  console.error(`\n${sanitizeErrorMessage(message)}`);
  console.error(`\nTarget: ${sanitizePath(target).slice(0, 200)}`);

  if (recommendations && recommendations.length > 0) {
    console.error(`\n${separator}`);
    console.error('RECOMMENDATIONS:');
    for (const rec of recommendations) {
      console.error(`  - ${sanitizeErrorMessage(rec)}`);
    }
  }

  if (isAbsolute) {
    console.error('\nThis operation is BLOCKED and cannot be overridden.');
  } else if (overrideVar) {
    console.error('\nTo override (single-use, expires in 5 minutes):');
    console.error(`  export ${overrideVar}=true`);
    console.error('\nNote: Override must be set again for each operation.');
  }

  console.error(`${separator}\n`);
}

/**
 * Print a simple warning message to stderr.
 *
 * @param message - Warning message
 * @param target - Optional target (command, file, etc.)
 */
export function printWarning(message: string, target?: string): void {
  console.error(`WARNING: ${sanitizeErrorMessage(message)}`);
  if (target) {
    console.error(`  Target: ${sanitizePath(target).slice(0, 200)}`);
  }
}

/**
 * Print override consumed message.
 *
 * @param message - Warning message
 * @param overrideVar - The override environment variable that was consumed
 */
export function printOverrideConsumed(message: string, overrideVar: string): void {
  console.error(`WARNING: ${sanitizeErrorMessage(message)} - ALLOWED via single-use override`);
  console.error(`  Override consumed. Set ${overrideVar}=true again for next operation.`);
}
