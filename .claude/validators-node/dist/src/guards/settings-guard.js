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
import * as path from 'path';
import { AuditLogger, getToolInputFromStdinSync, printBlockMessage, } from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';
const VALIDATOR_NAME = 'settings_guard';
/**
 * Protected settings file patterns (basenames).
 * These must NEVER be writable via Claude Code tools.
 */
const PROTECTED_BASENAMES = [
    'settings.json',
    'settings.local.json',
];
/**
 * Required parent directory component for protected files.
 */
const REQUIRED_PARENT = '.claude';
/**
 * Check if a file path targets a protected settings file.
 * Handles path traversal, relative paths, and case variations.
 *
 * @param filePath - The file path to check
 * @returns [isProtected, reason] tuple
 */
export function isProtectedSettingsFile(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        return [false, null];
    }
    // Normalize the path to resolve traversal attempts (../../.claude/settings.json)
    const normalized = path.normalize(filePath);
    // Split into segments for analysis
    const segments = normalized.split(path.sep);
    // Check if any segment is .claude and the final segment matches protected basenames
    const basename = segments[segments.length - 1];
    if (!basename) {
        return [false, null];
    }
    // Check basename against protected list
    const basenameLower = basename.toLowerCase();
    const matchedProtected = PROTECTED_BASENAMES.find((p) => p.toLowerCase() === basenameLower);
    if (!matchedProtected) {
        return [false, null];
    }
    // Verify .claude is in the path (prevents false positives on unrelated settings.json files)
    const hasClaudeParent = segments.some((seg) => seg === REQUIRED_PARENT);
    if (hasClaudeParent) {
        return [true, `Write/Edit to ${matchedProtected} is blocked — this file controls ALL security hooks`];
    }
    return [false, null];
}
/**
 * Validate whether a Write/Edit operation should be blocked.
 * NO override is possible for settings file protection.
 *
 * @param filePath - The target file path
 * @returns Exit code (0 = allow, 2 = hard block)
 */
export function validateSettingsGuard(filePath) {
    const [isProtected, reason] = isProtectedSettingsFile(filePath);
    if (!isProtected) {
        AuditLogger.logAllowed(VALIDATOR_NAME, 'Not a protected settings file', {
            file_path: filePath,
        });
        return EXIT_CODES.ALLOW;
    }
    // HARD BLOCK — no override available for this guard
    const blockReason = reason ?? 'Protected settings file';
    printBlockMessage({
        title: 'ABSOLUTE BLOCK — Settings Protection',
        message: blockReason,
        target: filePath,
        isAbsolute: true,
        recommendations: [
            'Edit .claude/settings.json manually if changes are needed.',
            'This file controls ALL security hooks and cannot be modified via Claude Code tools.',
        ],
    });
    AuditLogger.logBlocked(VALIDATOR_NAME, blockReason, filePath, {
        override_available: false,
    });
    return EXIT_CODES.HARD_BLOCK;
}
/**
 * CLI entry point — reads tool input from stdin and validates.
 */
export function main() {
    try {
        const input = getToolInputFromStdinSync();
        if (!input) {
            // No input — allow (fail-open for missing stdin only)
            process.exit(EXIT_CODES.ALLOW);
        }
        // Extract file_path from Write or Edit tool input
        const toolInput = input.tool_input;
        const filePath = toolInput?.file_path;
        if (!filePath) {
            // No file path in input — not a Write/Edit or malformed, allow
            process.exit(EXIT_CODES.ALLOW);
        }
        const exitCode = validateSettingsGuard(filePath);
        process.exit(exitCode);
    }
    catch (error) {
        // Fail-closed on any error
        console.error(`[${VALIDATOR_NAME}] Error:`, error);
        process.exit(EXIT_CODES.HARD_BLOCK);
    }
}
// Direct execution guard
const scriptName = 'settings-guard';
if (process.argv[1] && (process.argv[1].endsWith(`${scriptName}.js`) ||
    process.argv[1].endsWith(`${scriptName}.ts`))) {
    main();
}
//# sourceMappingURL=settings-guard.js.map