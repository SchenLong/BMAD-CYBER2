/**
 * BMAD Validators - Settings.json Write Protection Guard (TPI-PRE-4)
 * ===================================================================
 * Prevents any Write/Edit operation targeting .claude/settings.json or
 * .claude/settings.local.json. This is the single most critical guard —
 * an attacker who can modify settings.json can disable ALL hooks.
 *
 * Exit Codes:
 * - 0: ALLOW (not targeting settings files)
 * - 2: HARD_BLOCK (targeting settings files — NO override possible)
 *
 * Reference: TPI-CROWDSTRIKE PenTest BYPASS-1, HIGH-6
 */
/**
 * Check if a file path targets a protected settings file.
 * Handles path traversal, relative paths, and case variations.
 *
 * @param filePath - The file path to check
 * @returns [isProtected, reason] tuple
 */
export declare function isProtectedSettingsFile(filePath: string): [boolean, string | null];
/**
 * Validate whether a Write/Edit operation should be blocked.
 * NO override is possible for settings file protection.
 *
 * @param filePath - The target file path
 * @returns Exit code (0 = allow, 2 = hard block)
 */
export declare function validateSettingsGuard(filePath: string): number;
/**
 * CLI entry point — reads tool input from stdin and validates.
 */
export declare function main(): void;
