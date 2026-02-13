/**
 * BMAD Guardrails: Bash Safety Validator
 * =======================================
 * Blocks dangerous bash commands that could cause irreversible damage.
 *
 * Exit Codes:
 * - 0: Allow the command
 * - 2: Block the command (with user override option for some)
 *
 * Blocking Levels:
 * - ABSOLUTE BLOCK: rm -rf outside repo (no override possible)
 * - STRICT BLOCK: Dangerous patterns (user can override via env var)
 *
 * Security Improvements (v2):
 * - Audit logging for all blocked/allowed operations
 * - Single-use override tokens with 5-minute timeout
 * - Command substitution detection
 * - Improved regex patterns for edge cases
 */
import { AuditLogger, getProjectDir, getToolInputFromStdinSync, isPathInRepo, OverrideManager, printBlockMessage, printOverrideConsumed, } from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';
const VALIDATOR_NAME = 'bash_safety';
/**
 * Safe environment variables for P0-1 fix.
 */
const SAFE_VARIABLES = new Set([
    '$HOME', '$USER', '$PWD', '$OLDPWD', '$PATH', '$SHELL',
    '$TERM', '$LANG', '$LC_ALL', '$TZ', '$HOSTNAME',
    '$LOGNAME', '$TMPDIR', '$XDG_CONFIG_HOME', '$XDG_DATA_HOME',
]);
/**
 * Detect command substitution patterns that could bypass path checks.
 *
 * @returns List of detected patterns for warning purposes
 */
export function detectCommandSubstitution(cmd) {
    const patterns = [
        [/\$\([^)]+\)/g, 'Command substitution $()'],
        [/`[^`]+`/g, 'Backtick command substitution'],
        [/\$\{[^}]+\}/g, 'Variable expansion ${}'],
        [/\$[A-Za-z_][A-Za-z0-9_]*/g, 'Variable reference'],
    ];
    const detected = [];
    for (const [pattern, description] of patterns) {
        const matches = cmd.match(pattern);
        if (matches) {
            for (const match of matches) {
                detected.push({
                    type: description,
                    match,
                });
            }
        }
    }
    return detected;
}
/**
 * Extract target paths from rm commands.
 */
export function extractRmTargets(cmd) {
    const parts = cmd.split(/\s+/);
    const targets = [];
    let skipNext = false;
    for (const part of parts) {
        if (skipNext) {
            skipNext = false;
            continue;
        }
        if (part === 'rm' || part === 'sudo') {
            continue;
        }
        if (part.startsWith('-')) {
            if (part === '-I' || part === '--interactive') {
                skipNext = true;
            }
            continue;
        }
        targets.push(part);
    }
    return targets;
}
/**
 * Check for dangerous rm commands.
 */
function checkVariableSafety(t) { const m = t.match(/^\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/); if (!m)
    return { isSafe: false, varName: t }; return { isSafe: SAFE_VARIABLES.has(`$${  m[1]}`), varName: `$${  m[1]}` }; }
export function checkDangerousRm(cmd, cwd) {
    // Improved patterns - handle command chaining and comments
    // Match dangerous rm even when followed by other commands
    const absoluteBlockPatterns = [
        /rm\s+(-[rfRF]+\s+)*[/~](\s|;|&|$|\|)/, // rm -rf / or rm -rf ~
        /rm\s+(-[rfRF]+\s+)*\/\s*(\s|;|&|$|\|)/, // rm -rf /
        /rm\s+(-[rfRF]+\s+)*~\s*(\s|;|&|$|\|)/, // rm -rf ~
        /rm\s+(-[rfRF]+\s+)*\/home\b/, // rm -rf /home
        /rm\s+(-[rfRF]+\s+)*\/Users\b/, // rm -rf /Users (macOS)
        /rm\s+(-[rfRF]+\s+)*\/root\b/, // rm -rf /root
        /rm\s+(-[rfRF]+\s+)*\$HOME\b/, // rm -rf $HOME
        /rm\s+(-[rfRF]+\s+)*\*\s*(\s|;|&|$|\|)/, // rm -rf *
    ];
    for (const pattern of absoluteBlockPatterns) {
        if (pattern.test(cmd)) {
            return {
                isDangerous: true,
                isAbsolute: true,
                message: 'ABSOLUTE BLOCK: Catastrophically dangerous rm command detected',
            };
        }
    }
    // Pattern 2: rm -rf outside repository (ABSOLUTE BLOCK)
    if (/\brm\b.*-[rfRF]/.test(cmd)) {
        const targets = extractRmTargets(cmd);
        for (const target of targets) {
            // Check variable references against safe allowlist (P0-1 fix)
            if (target.startsWith('$')) {
                const { isSafe, varName } = checkVariableSafety(target);
                if (!isSafe) {
                    return {
                        isDangerous: true,
                        isAbsolute: true,
                        message: `ABSOLUTE BLOCK: rm -rf uses unverified variable: ${  varName}`,
                    };
                }
                continue;
            }
            if (!isPathInRepo(target, cwd)) {
                return {
                    isDangerous: true,
                    isAbsolute: true,
                    message: `ABSOLUTE BLOCK: rm -rf targets path outside repository: ${target}`,
                };
            }
        }
    }
    // Pattern 3: rm without -rf but still outside repo (STRICT BLOCK - overrideable)
    if (/\brm\b/.test(cmd)) {
        const targets = extractRmTargets(cmd);
        for (const target of targets) {
            // Check variable references against safe allowlist (P0-1 fix)
            if (target.startsWith("$")) {
                const { isSafe, varName } = checkVariableSafety(target);
                if (!isSafe) {
                    return {
                        isDangerous: true,
                        isAbsolute: false,
                        message: `STRICT BLOCK: rm uses unverified variable: ${  varName}`,
                    };
                }
                continue;
            }
            if (!isPathInRepo(target, cwd)) {
                return {
                    isDangerous: true,
                    isAbsolute: false,
                    message: `STRICT BLOCK: rm targets path outside repository: ${target}`,
                };
            }
        }
    }
    return { isDangerous: false, isAbsolute: false, message: '' };
}
/**
 * Check for directory traversal attempts.
 */
export function checkDirectoryEscape(cmd, cwd) {
    // Check for cd to absolute path outside repo
    const cdMatch = cmd.match(/\bcd\s+([^\s;&|]+)/);
    if (cdMatch) {
        const target = cdMatch[1];
        if (target.startsWith('/') && !isPathInRepo(target, cwd)) {
            return {
                isEscape: true,
                message: `Directory escape attempt: cd to ${target} (outside repository)`,
            };
        }
    }
    // Check for excessive directory traversal
    if (/\.\.\//.test(cmd)) {
        const traversalCount = (cmd.match(/\.\.\//g) || []).length;
        if (traversalCount >= 5) {
            return {
                isEscape: true,
                message: `Suspicious directory traversal: ${traversalCount} levels of ../`,
            };
        }
    }
    return { isEscape: false, message: '' };
}
/**
 * Check for other dangerous patterns.
 */
export function checkDangerousPatterns(cmd) {
    const dangerousPatterns = [
        [/>\s*\/dev\/sd[a-z]/, 'Direct write to block device'],
        [/mkfs\./, 'Filesystem format command'],
        [/dd\s+.*of=\/dev\//, 'dd to device - potential disk wipe'],
        [/:\(\)\s*{\s*:\|:\s*&\s*};\s*:/, 'Fork bomb detected'],
        [/chmod\s+(-[rR]+\s+)*777\s+\//, 'Dangerous chmod 777 on system path'],
        [/chown\s+(-[rR]+\s+)*root/, 'Changing ownership to root'],
        // Additional patterns
        [/curl\s+.*\|\s*(sudo\s+)?bash/, 'Pipe curl to bash (dangerous)'],
        [/wget\s+.*\|\s*(sudo\s+)?bash/, 'Pipe wget to bash (dangerous)'],
        [/eval\s+.*\$/, 'Eval with variable expansion'],
    ];
    for (const [pattern, message] of dangerousPatterns) {
        if (pattern.test(cmd)) {
            return { isDangerous: true, message: `STRICT BLOCK: ${message}` };
        }
    }
    return { isDangerous: false, message: '' };
}
/**
 * Check for SQL Injection patterns (A03-101..105)
 *
 * OWASP Coverage:
 * - A03-101: UNION-based SQL injection detection
 * - A03-102: Boolean-blind SQL injection detection
 * - A03-103: Time-based SQL injection detection
 * - A03-104: Error-based SQL injection detection
 * - A03-105: Stacked query injection detection
 */
export function checkSQLInjection(cmd) {
    // A03-101: UNION-based SQL injection
    const unionPatterns = [
        /\bUNION\s+(ALL\s+)?SELECT\b/i,
        /\bSELECT\s+.+\s+UNION\b/i,
        /\bORDER\s+BY\s+\d+\s*--/i,
        /\bGROUP\s+BY\s+.+\s+HAVING\b/i,
    ];

    // A03-102: Boolean-blind SQL injection
    const booleanBlindPatterns = [
        /\bOR\s+\d+\s*=\s*\d+\b/i,
        /\bAND\s+\d+\s*=\s*\d+\b/i,
        /\bOR\s+['"].*['"]\s*=\s*['"].*['"]/i,
        /\bAND\s+['"].*['"]\s*=\s*['"].*['"]/i,
        /\bIF\s*\(\s*\d+\s*=\s*\d+/i,
        /\bCASE\s+WHEN\s+\d+\s*=\s*\d+/i,
    ];

    // A03-103: Time-based SQL injection
    const timeBasedPatterns = [
        /\bWAITFOR\s+DELAY\b/i,
        /\bSLEEP\s*\(/i,
        /\bBENCHMARK\s*\(/i,
        /\bPG_SLEEP\s*\(/i,
        /\bDBMS_PIPE\.RECEIVE_MESSAGE\b/i,
        /\bEXEC\s+master\.dbo\.sp_executesql\b/i,
    ];

    // A03-104: Error-based SQL injection
    const errorBasedPatterns = [
        /\bCAST\s*\(\s*\w+\s+AS\s+INT\b/i,
        /\bCONVERT\s*\(\s*INT\s*,/i,
        /\bCONVERT\s*\(\s*INT\s*,\s*GETDATE\b/i,
        /\bFLOOR\s*\(\s*RAND\s*\(/i,
        /\bCOUNT\s*\(\s*\*\)\s*\)/i,
        /\bCAST\s*\(\s*database\s*\(\s*\)\s+AS\s+INT\b/i,
    ];

    // A03-105: Stacked query injection
    const stackedQueryPatterns = [
        /;\s*DROP\s+TABLE\b/i,
        /;\s*DELETE\s+FROM\b/i,
        /;\s*INSERT\s+INTO\b/i,
        /;\s*UPDATE\s+\w+\s+SET\b/i,
        /;\s*EXEC\s+/i,
        /;\s*EXECUTE\s+/i,
        /;\s*TRUNCATE\s+TABLE\b/i,
    ];

    // Check UNION-based (A03-101)
    for (const pattern of unionPatterns) {
        if (pattern.test(cmd)) {
            return {
                isSQLi: true,
                subtype: 'UNION',
                testId: 'A03-101',
                message: 'SQL Injection detected: UNION-based pattern (A03-101)',
                severity: 'CRITICAL',
            };
        }
    }

    // Check Boolean-blind (A03-102)
    for (const pattern of booleanBlindPatterns) {
        if (pattern.test(cmd)) {
            return {
                isSQLi: true,
                subtype: 'BOOLEAN_BLIND',
                testId: 'A03-102',
                message: 'SQL Injection detected: Boolean-blind pattern (A03-102)',
                severity: 'CRITICAL',
            };
        }
    }

    // Check Time-based (A03-103)
    for (const pattern of timeBasedPatterns) {
        if (pattern.test(cmd)) {
            return {
                isSQLi: true,
                subtype: 'TIME_BASED',
                testId: 'A03-103',
                message: 'SQL Injection detected: Time-based pattern (A03-103)',
                severity: 'CRITICAL',
            };
        }
    }

    // Check Error-based (A03-104)
    for (const pattern of errorBasedPatterns) {
        if (pattern.test(cmd)) {
            return {
                isSQLi: true,
                subtype: 'ERROR_BASED',
                testId: 'A03-104',
                message: 'SQL Injection detected: Error-based pattern (A03-104)',
                severity: 'CRITICAL',
            };
        }
    }

    // Check Stacked queries (A03-105)
    for (const pattern of stackedQueryPatterns) {
        if (pattern.test(cmd)) {
            return {
                isSQLi: true,
                subtype: 'STACKED_QUERY',
                testId: 'A03-105',
                message: 'SQL Injection detected: Stacked query pattern (A03-105)',
                severity: 'CRITICAL',
            };
        }
    }

    // Additional common SQLi patterns (context-aware)
    // These trigger WARNING but may be legitimate in documentation or examples
    const contextualPatterns = [
        [/\bSELECT\s+\*\s+FROM\b/i, 'SELECT * FROM pattern'],
        [/\bSELECT\s+.+\s+WHERE\b/i, 'SELECT WHERE pattern'],
        [/\bINSERT\s+INTO\b/i, 'INSERT INTO pattern'],
        [/\bUPDATE\s+\w+\s+SET\b/i, 'UPDATE SET pattern'],
        [/\bDELETE\s+FROM\b/i, 'DELETE FROM pattern'],
        [/--['"]?\s*$/, 'SQL comment at end'],
        [/['"]\s+OR\s+/i, 'Quote followed by OR'],
        [/1\s*=\s*1/i, 'Always-true condition'],
        [/1\s*=\s*2/i, 'Always-false condition'],
    ];

    for (const [pattern, description] of contextualPatterns) {
        if (pattern.test(cmd)) {
            return {
                isSQLi: true,
                subtype: 'CONTEXTUAL',
                testId: 'A03-GENERAL',
                message: `SQL Injection pattern detected: ${description} (contextual)`,
                severity: 'WARNING',
            };
        }
    }

    return { isSQLi: false, message: '' };
}
/**
 * Main validator function.
 */
// Export checkSQLInjection for external use (Epic 1: OWASP-01)
export { checkSQLInjection };
/**
 * Main validator function.
 */
export function validateBashCommand(cmd, cwd) {
    if (!cmd) {
        return EXIT_CODES.ALLOW;
    }
    // Check for command substitution (warning)
    const substitutions = detectCommandSubstitution(cmd);
    if (substitutions.length > 0) {
        AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
            message: 'Command substitution detected',
            patterns: substitutions,
            command: cmd.slice(0, 200),
        }, 'WARNING');
    }
    // Check 1: Dangerous rm commands
    const rmCheck = checkDangerousRm(cmd, cwd);
    if (rmCheck.isDangerous) {
        if (rmCheck.isAbsolute) {
            // ABSOLUTE BLOCK - no override possible
            AuditLogger.logBlocked(VALIDATOR_NAME, rmCheck.message, cmd, { block_type: 'ABSOLUTE' });
            printBlockMessage({
                title: 'ABSOLUTE BLOCK',
                message: rmCheck.message,
                target: cmd,
                isAbsolute: true,
            });
            console.error('This protection exists to prevent catastrophic data loss.');
            return EXIT_CODES.HARD_BLOCK;
        }
        else {
            // STRICT BLOCK - check for override (single-use)
            const overrideResult = OverrideManager.checkAndConsume('DANGEROUS');
            if (overrideResult.valid) {
                AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_DANGEROUS', cmd);
                printOverrideConsumed(rmCheck.message, 'BMAD_ALLOW_DANGEROUS');
                return EXIT_CODES.ALLOW;
            }
            else {
                AuditLogger.logBlocked(VALIDATOR_NAME, rmCheck.message, cmd, { block_type: 'STRICT' });
                printBlockMessage({
                    title: 'STRICT BLOCK',
                    message: rmCheck.message,
                    target: cmd,
                    overrideVar: 'BMAD_ALLOW_DANGEROUS',
                });
                console.error('Note: Override will be consumed after one use.');
                return EXIT_CODES.HARD_BLOCK;
            }
        }
    }
    // Check 2: Directory escape
    const escapeCheck = checkDirectoryEscape(cmd, cwd);
    if (escapeCheck.isEscape) {
        const overrideResult = OverrideManager.checkAndConsume('ESCAPE');
        if (overrideResult.valid) {
            AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_ESCAPE', cmd);
            printOverrideConsumed(escapeCheck.message, 'BMAD_ALLOW_ESCAPE');
            return EXIT_CODES.ALLOW;
        }
        else {
            AuditLogger.logBlocked(VALIDATOR_NAME, escapeCheck.message, cmd, { block_type: 'DIRECTORY_ESCAPE' });
            printBlockMessage({
                title: 'DIRECTORY ESCAPE BLOCKED',
                message: escapeCheck.message,
                target: cmd,
                overrideVar: 'BMAD_ALLOW_ESCAPE',
            });
            return EXIT_CODES.HARD_BLOCK;
        }
    }
    // Check 3: Other dangerous patterns
    const patternCheck = checkDangerousPatterns(cmd);
    if (patternCheck.isDangerous) {
        const overrideResult = OverrideManager.checkAndConsume('DANGEROUS');
        if (overrideResult.valid) {
            AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_DANGEROUS', cmd);
            printOverrideConsumed(patternCheck.message, 'BMAD_ALLOW_DANGEROUS');
            return EXIT_CODES.ALLOW;
        }
        else {
            AuditLogger.logBlocked(VALIDATOR_NAME, patternCheck.message, cmd, { block_type: 'DANGEROUS_PATTERN' });
            printBlockMessage({
                title: 'DANGEROUS PATTERN BLOCKED',
                message: patternCheck.message,
                target: cmd,
                overrideVar: 'BMAD_ALLOW_DANGEROUS',
            });
            return EXIT_CODES.HARD_BLOCK;
        }
    }
    // Check 4: SQL Injection patterns (A03-101..105)
    const sqliCheck = checkSQLInjection(cmd);
    if (sqliCheck.isSQLi) {
        const severity = sqliCheck.severity || 'WARNING';
        if (severity === 'CRITICAL') {
            const overrideResult = OverrideManager.checkAndConsume('SQL_INJECTION');
            if (overrideResult.valid) {
                AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_SQLI', cmd);
                printOverrideConsumed(sqliCheck.message, 'BMAD_ALLOW_SQLI');
                return EXIT_CODES.ALLOW;
            }
            else {
                AuditLogger.logBlocked(VALIDATOR_NAME, sqliCheck.message, cmd, { block_type: 'SQL_INJECTION', test_id: sqliCheck.testId });
                printBlockMessage({
                    title: 'SQL INJECTION BLOCKED',
                    message: sqliCheck.message,
                    target: cmd,
                    overrideVar: 'BMAD_ALLOW_SQLI',
                });
                return EXIT_CODES.HARD_BLOCK;
            }
        }
        else {
            // WARNING level - log but allow
            AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
                message: sqliCheck.message,
                command: cmd.slice(0, 200),
                test_id: sqliCheck.testId,
            }, 'WARNING');
            // Still allow the command with warning
            return EXIT_CODES.ALLOW;
        }
    }
    // All checks passed
    return EXIT_CODES.ALLOW;
}
/**
 * CLI entry point.
 */
export function main() {
    const input = getToolInputFromStdinSync();
    const toolInput = input.tool_input;
    const cmd = toolInput.command || '';
    const cwd = input.cwd || getProjectDir();
    const exitCode = validateBashCommand(cmd, cwd);
    process.exit(exitCode);
}
// Run if executed directly
const isMain = process.argv[1]?.endsWith('bash-safety.js') ||
    process.argv[1]?.endsWith('bash-safety.ts');
if (isMain) {
    main();
}
//# sourceMappingURL=bash-safety.js.map
//# sourceMappingURL=bash-safety.js.map