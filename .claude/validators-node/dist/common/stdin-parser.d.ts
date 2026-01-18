/**
 * BMAD Validators - Stdin Parser
 * ===============================
 * Parses tool input from stdin in JSON format from Claude Code.
 */
import type { ToolInput } from '../types/index.js';
/**
 * Read and parse tool input from stdin.
 *
 * Claude Code passes tool inputs as JSON via stdin with the structure:
 * {
 *   "tool_name": "Bash",
 *   "tool_input": { "command": "ls -la" },
 *   "cwd": "/path/to/project"
 * }
 *
 * @returns Parsed tool input with defaults for missing fields
 */
export declare function getToolInputFromStdin(): Promise<ToolInput>;
/**
 * Synchronous version of getToolInputFromStdin for simpler validators.
 *
 * Note: This reads stdin synchronously which may block. Use the async
 * version when possible.
 *
 * @returns Parsed tool input with defaults for missing fields
 */
export declare function getToolInputFromStdinSync(): ToolInput;
