/**
 * BMAD Validators - Knowledge Base Integrity Scanner (TPI-04)
 * ============================================================
 * PreToolUse hook on Read — scans context files (memory, agents,
 * CLAUDE.md, commands, config) for injection payloads before they
 * enter the LLM context as trusted content.
 *
 * CRIT-1: PreToolUse receives file_path only, NOT file content.
 * The hook reads the file independently via fs.readFileSync().
 *
 * Exit Codes (P1-8 graduated):
 * - 0: ALLOW (no findings, or INFO-only findings)
 * - 1: SOFT_BLOCK / WARN (WARNING findings — user may have legitimate content)
 * - 2: HARD_BLOCK (CRITICAL findings — likely injection)
 *
 * Performance: Only first 64KB of file is scanned. Binary files skipped.
 *
 * Reference: TPI-CROWDSTRIKE Implementation Plan, Story TPI-04
 */
import { type Severity } from '../types/index.js';
/**
 * Check if a file path matches a context file pattern.
 */
export declare function isContextFile(filePath: string): boolean;
/**
 * Check if a file has a binary extension (skip scanning).
 */
export declare function isBinaryFile(filePath: string): boolean;
/**
 * Read file content independently (CRIT-1 fix).
 * PreToolUse receives only file_path — we read the file ourselves
 * before Claude sees it, so we can analyze it first.
 *
 * Returns null if file cannot be read (not found, permission denied, binary).
 */
export declare function readFileForScanning(filePath: string): string | null;
/**
 * Map analysis severity to exit code (P1-8 graduated).
 * Context files use elevated sensitivity:
 * - INFO → ALLOW (exit 0)
 * - WARNING → SOFT_BLOCK (exit 1) — user warned but not blocked
 * - CRITICAL → HARD_BLOCK (exit 2) — likely injection
 */
export declare function severityToExitCode(severity: Severity): number;
/**
 * Scan a context file for injection payloads.
 * Exported for testing.
 */
export declare function scanContextFile(filePath: string): {
    exitCode: number;
    findingCount: number;
    severity: Severity;
};
/**
 * Main entry point — called from bin/context-integrity.js.
 */
export declare function main(): void;
