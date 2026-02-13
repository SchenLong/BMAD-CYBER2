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
import type { CommandSubstitution } from '../types/index.js';
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
export function detectCommandSubstitution(cmd: string): CommandSubstitution[] {
    const patterns: [RegExp, string][] = [
        [/\$\([^)]+\)/g, 'Command substitution $()'],
        [/`[^`]+`/g, 'Backtick command substitution'],
        [/\$\{[^}]+\}/g, 'Variable expansion ${}'],
        [/\$[A-Za-z_][A-Za-z0-9_]*/g, 'Variable reference'],
    ];
    const detected: CommandSubstitution[] = [];
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
 * Split a command string into individual pipeline/chain segments.
 * SA-02 LOW: Commands like "echo foo | rm -rf /" need each segment analyzed independently.
 */
export function splitCommandSegments(cmd: string): string[] {
    // Split on pipe and chain operators: |, &&, ||, ;
    // This is a simplified split — doesn't handle quoted strings containing operators,
    // but sufficient for the rm/dangerous pattern checks where quoting is unlikely.
    return cmd.split(/\s*(?:\|\||&&|[|;])\s*/).map(s => s.trim()).filter(Boolean);
}

/**
 * Shell operators that terminate an rm command's argument list.
 * SA-02 LOW: Without this, operators like |, &&, ; were treated as rm targets.
 */
const SHELL_OPERATORS = new Set(['|', '||', '&&', ';', '>', '>>', '2>', '2>>', '&>', '<']);

// =============================================================================
// SQL Injection Detection (A03-101..105)
// =============================================================================

/**
 * Result type for SQL injection detection
 */
export interface SQLInjectionResult {
  isSQLi: boolean;
  testId?: string;
  subtype?: string;
  severity: string;
}

/**
 * Detect SQL injection patterns in a command string
 *
 * A03-101: UNION-based SQL injection
 * A03-102: Boolean-blind SQL injection
 * A03-103: Time-based SQL injection
 * A03-104: Error-based SQL injection
 * A03-105: Stacked query injection
 */
export function checkSQLInjection(cmd: string): SQLInjectionResult {
  if (!cmd || typeof cmd !== 'string') {
    return {
      isSQLi: false,
      severity: 'INFO',
    };
  }

  const upperCmd = cmd.toUpperCase();

  // A03-101: UNION-based SQL injection
  if (/\bUNION\s+(?:ALL\s+)?SELECT/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-101',
      subtype: 'UNION',
      severity: 'CRITICAL',
    };
  }

  // A03-101: ORDER BY with comment (SQLi fingerprinting)
  if (/\bORDER\s+BY\s+\d+\s*--/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-101',
      subtype: 'UNION',
      severity: 'CRITICAL',
    };
  }

  // A03-101: HAVING 1=1 pattern (SQLi fingerprinting)
  if (/\bHAVING\s+1\s*=\s*1/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-101',
      subtype: 'UNION',
      severity: 'CRITICAL',
    };
  }

  // A03-102: Boolean-blind SQL injection (OR 1=1, AND 1=2)
  if (/\bOR\s+1\s*=\s*1\b/i.test(upperCmd) || /\bAND\s+1\s*=\s*2\b/i.test(upperCmd)) {
    return {
      isSQLi: true,
      testId: 'A03-102',
      subtype: 'BOOLEAN_BLIND',
      severity: 'CRITICAL',
    };
  }

  // A03-102: OR 'a'='a pattern
  if (/\bOR\s+['"]?[a-z]['"]?\s*=\s*['"]?[a-z]['"]?/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-102',
      subtype: 'BOOLEAN_BLIND',
      severity: 'CRITICAL',
    };
  }

  // A03-102: IF statement pattern (allow = between parens)
  if (/\bIF\s*\([^)]*\=[^)]*\)/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-102',
      subtype: 'BOOLEAN_BLIND',
      severity: 'CRITICAL',
    };
  }

  // A03-103: Time-based SQL injection (SLEEP, WAITFOR DELAY, BENCHMARK)
  if (/\bSLEEP\s*\(/i.test(cmd) || /\bWAITFOR\s+DELAY/i.test(cmd) || /\bBENCHMARK\s*\(/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-103',
      subtype: 'TIME_BASED',
      severity: 'CRITICAL',
    };
  }

  if (/\bPG_SLEEP\s*\(/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-103',
      subtype: 'TIME_BASED',
      severity: 'CRITICAL',
    };
  }

  // A03-104: Error-based SQL injection (CAST, CONVERT, FLOOR RAND)
  if (/\bCAST\s*\(/i.test(cmd) && /\bAS\s+INT/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-104',
      subtype: 'ERROR_BASED',
      severity: 'CRITICAL',
    };
  }

  if (/\bCONVERT\s*\(/i.test(cmd) && /\bINT\b/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-104',
      subtype: 'ERROR_BASED',
      severity: 'CRITICAL',
    };
  }

  if (/\bFLOOR\s*\(\s*RAND\s*\(/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-104',
      subtype: 'ERROR_BASED',
      severity: 'CRITICAL',
    };
  }

  if (/\bCOUNT\s*\([^)]*CONCAT/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-104',
      subtype: 'ERROR_BASED',
      severity: 'CRITICAL',
    };
  }

  // A03-105: Stacked query injection (DROP, INSERT, UPDATE, EXEC, TRUNCATE after semicolon)
  if (/;.*\bDROP\s+TABLE/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-105',
      subtype: 'STACKED_QUERY',
      severity: 'CRITICAL',
    };
  }

  if (/;.*\bINSERT\s+INTO/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-105',
      subtype: 'STACKED_QUERY',
      severity: 'CRITICAL',
    };
  }

  if (/;.*\bUPDATE\b/i.test(cmd) && /\bSET\b/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-105',
      subtype: 'STACKED_QUERY',
      severity: 'CRITICAL',
    };
  }

  if (/;.*\bEXEC\b/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-105',
      subtype: 'STACKED_QUERY',
      severity: 'CRITICAL',
    };
  }

  if (/;.*\bTRUNCATE\s+TABLE/i.test(cmd)) {
    return {
      isSQLi: true,
      testId: 'A03-105',
      subtype: 'STACKED_QUERY',
      severity: 'CRITICAL',
    };
  }

  // General SQL patterns (WARNING level)
  if (/\bSELECT\s+\*\s+FROM\b/i.test(cmd) || /\bWHERE\s+1\s*=\s*1\b/i.test(cmd)) {
    return {
      isSQLi: true,
      severity: 'WARNING',
    };
  }

  if (/\bOR\b/i.test(cmd) && /\b1\s*=\s*1\b/i.test(cmd)) {
    return {
      isSQLi: true,
      severity: 'WARNING',
    };
  }

  if (cmd.trim().endsWith('--')) {
    return {
      isSQLi: true,
      severity: 'WARNING',
    };
  }

  return {
    isSQLi: false,
    severity: 'INFO',
  };
}

/**
 * Extract target paths from rm commands.
 */
export function extractRmTargets(cmd: string): string[] {
    // SA-02 LOW: Split into segments first so pipe/chain operators aren't treated as targets
    const segments = splitCommandSegments(cmd);
    const targets: string[] = [];

    for (const segment of segments) {
        const parts = segment.split(/\s+/);
        let foundRm = false;
        let skipNext = false;

        for (const part of parts) {
            if (skipNext) {
                skipNext = false;
                continue;
            }
            if (part === 'rm' || part === 'sudo') {
                if (part === 'rm') foundRm = true;
                continue;
            }
            if (!foundRm) continue;
            // Stop at shell operators (defense-in-depth — splitCommandSegments handles most)
            if (SHELL_OPERATORS.has(part)) break;
            if (part.startsWith('-')) {
                if (part === '-I' || part === '--interactive') {
                    skipNext = true;
                }
                continue;
            }
            targets.push(part);
        }
    }
    return targets;
}
/**
 * Check for dangerous rm commands.
 */
function checkVariableSafety(t: string): { isSafe: boolean; varName: string } {const m=t.match(/^\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/);if(!m)return{isSafe:false,varName:t};return{isSafe:SAFE_VARIABLES.has(`$${m[1]}`),varName:`$${m[1]}`};}
export function checkDangerousRm(cmd: string, cwd: string): { isDangerous: boolean; isAbsolute: boolean; message: string } {
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
export function checkDirectoryEscape(cmd: string, cwd: string): { isEscape: boolean; message: string } {
    // Check for cd to absolute path outside repo
    const cdMatch = cmd.match(/\bcd\s+([^\s;&|]+)/);
    if (cdMatch) {
        const target = cdMatch[1];
        if (target !== undefined && target.startsWith('/') && !isPathInRepo(target, cwd)) {
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
export function checkDangerousPatterns(cmd: string): { isDangerous: boolean; message: string } {
    const dangerousPatterns: [RegExp, string][] = [
        [/>\s*\/dev\/sd[a-z]/, 'Direct write to block device'],
        [/mkfs\./, 'Filesystem format command'],
        [/dd\s+.*of=\/dev\//, 'dd to device - potential disk wipe'],
        [/:\(\)\s*{\s*:\|:\s*&\s*};\s*:/, 'Fork bomb detected'],
        [/chmod\s+(-[rR]+\s+)*777\s+\//, 'Dangerous chmod 777 on system path'],
        [/chown\s+(-[rR]+\s+)*root/, 'Changing ownership to root'],
        // Additional patterns — these check the FULL command (need to see | for pipe-to-bash)
        [/curl\s+.*\|\s*(sudo\s+)?bash/, 'Pipe curl to bash (dangerous)'],
        [/wget\s+.*\|\s*(sudo\s+)?bash/, 'Pipe wget to bash (dangerous)'],
        [/eval\s+.*\$/, 'Eval with variable expansion'],
    ];
    // SA-02 LOW: Check full command first (needed for pipe-spanning patterns like curl|bash)
    for (const [pattern, message] of dangerousPatterns) {
        if (pattern.test(cmd)) {
            return { isDangerous: true, message: `STRICT BLOCK: ${message}` };
        }
    }
    // SA-02 LOW: Also check each chain segment independently (catches "safe && dd if=... of=/dev/sda")
    const segments = splitCommandSegments(cmd);
    if (segments.length > 1) {
        for (const segment of segments) {
            for (const [pattern, message] of dangerousPatterns) {
                if (pattern.test(segment)) {
                    return { isDangerous: true, message: `STRICT BLOCK: ${message} (in chained command)` };
                }
            }
        }
    }
    return { isDangerous: false, message: '' };
}
/**
 * Main validator function.
 */
export function validateBashCommand(cmd: string, cwd: string): number {
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
    // All checks passed
    return EXIT_CODES.ALLOW;
}
/**
 * CLI entry point.
 */
export function main() {
    const input = getToolInputFromStdinSync();
    const toolInput = input.tool_input as { command?: string };
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