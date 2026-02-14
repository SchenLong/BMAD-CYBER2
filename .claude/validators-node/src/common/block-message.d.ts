/**
 * BMAD Validators - Block Message Utilities
 * ==========================================
 * Standardized block message formatting for security validators.
 */
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
export declare function printBlockMessage(options: BlockMessageOptions): void;
/**
 * Print a simple warning message to stderr.
 *
 * @param message - Warning message
 * @param target - Optional target (command, file, etc.)
 */
export declare function printWarning(message: string, target?: string): void;
/**
 * Print override consumed message.
 *
 * @param message - Warning message
 * @param overrideVar - The override environment variable that was consumed
 */
export declare function printOverrideConsumed(message: string, overrideVar: string): void;
