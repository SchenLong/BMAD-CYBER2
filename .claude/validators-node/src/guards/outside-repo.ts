/**
 * BMAD Guardrails: Outside Repository Guard
 * ==========================================
 * Prevents file operations targeting paths outside the repository.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation
 *
 * Blocking Levels:
 * - ABSOLUTE BLOCK: rm commands outside repo (no override)
 * - STRICT BLOCK: Other operations outside repo (BMAD_ALLOW_OUTSIDE_REPO)
 * - SUBSTITUTION BLOCK: Unsafe command substitutions (BMAD_ALLOW_SUBSTITUTION)
 *
 * Supported Tools:
 * - Bash: Extracts paths from various commands
 * - Write/Edit: Checks file_path
 * - Read: Checks file_path
 * - Glob/Grep: Checks path if provided
 */

import {
  AuditLogger,
  getProjectDir,
  getToolInputFromStdinSync,
  isPathInRepo,
  OverrideManager,
  printBlockMessage,
  printOverrideConsumed,
} from '../common/index.js';
import type { BashToolInput, EditToolInput, ReadToolInput, ToolInput, WriteToolInput } from '../types/index.js';
import { EXIT_CODES } from '../types/index.js';

const VALIDATOR_NAME = 'outside_repo_guard';

// ============================================================================
// Types
// ============================================================================

interface PathExtraction {
  path: string;
  operation: 'read' | 'write' | 'delete' | 'navigate' | 'modify' | 'copy' | 'move' | 'link' | 'append' | 'create' | 'edit';
}

interface BashCheckResult {
  isViolation: boolean;
  isAbsolute: boolean;
  message: string;
  paths: PathExtraction[];
  substitutions: string[];
}

interface FileCheckResult {
  isViolation: boolean;
  message: string;
}

// ============================================================================
// Path Extraction Patterns
// ============================================================================

/** Patterns for extracting paths from bash commands */
const PATH_PATTERNS: Array<[RegExp, string, number[]]> = [
  // File read operations
  [/\bcat\s+([^\s|;&>]+)/g, 'read', [1]],
  [/\bhead\s+(?:-[n0-9]+\s+)?([^\s|;&>]+)/g, 'read', [1]],
  [/\btail\s+(?:-[n0-9]+\s+)?([^\s|;&>]+)/g, 'read', [1]],
  [/\bless\s+([^\s|;&>]+)/g, 'read', [1]],
  [/\bmore\s+([^\s|;&>]+)/g, 'read', [1]],

  // File modification operations
  [/\bcp\s+(?:-[rRfv]+\s+)*([^\s]+)\s+([^\s|;&>]+)/g, 'copy', [1, 2]],
  [/\bmv\s+(?:-[fv]+\s+)*([^\s]+)\s+([^\s|;&>]+)/g, 'move', [1, 2]],
  [/\brm\s+(?:-[rRfv]+\s+)*([^\s|;&>]+)/g, 'delete', [1]],
  [/\bmkdir\s+(?:-[pv]+\s+)*([^\s|;&>]+)/g, 'create', [1]],
  [/\btouch\s+([^\s|;&>]+)/g, 'create', [1]],

  // Directory navigation
  [/\bcd\s+([^\s|;&>]+)/g, 'navigate', [1]],

  // Editor operations
  [/\bvim?\s+([^\s|;&>]+)/g, 'edit', [1]],
  [/\bnano\s+([^\s|;&>]+)/g, 'edit', [1]],
  [/\bemacs\s+([^\s|;&>]+)/g, 'edit', [1]],

  // I/O redirection
  [/>\s*([^\s|;&]+)/g, 'write', [1]],
  [/>>\s*([^\s|;&]+)/g, 'append', [1]],

  // File permissions/links
  [/\bchmod\s+(?:[0-7]+|[ugoa]+[+-=][rwxXst]+)\s+([^\s|;&>]+)/g, 'modify', [1]],
  [/\bchown\s+[^\s]+\s+([^\s|;&>]+)/g, 'modify', [1]],
  [/\bln\s+(?:-[sf]+\s+)*([^\s]+)/g, 'link', [1]],
];

/** Safe command substitutions that don't need blocking */
const SAFE_SUBSTITUTIONS: RegExp[] = [
  /^\$\(date\)$/i,
  /^\$\(pwd\)$/i,
  /^\$\(whoami\)$/i,
  /^\$\(hostname\)$/i,
  /^\$\(uname[^)]*\)$/i,
  /^\$\{PWD\}$/,
  /^\$\{USER\}$/,
  /^\$\{HOSTNAME\}$/,
  /^\$\{SHELL\}$/,
  /^\$\{TERM\}$/,
  /^\$\{HOME\}$/,
  /^\$HOME$/,
  /^\$PWD$/,
  /^\$USER$/,
];

// ============================================================================
// Extraction Functions
// ============================================================================

/**
 * Extract paths from a bash command.
 */
export function extractPathsFromCommand(cmd: string): PathExtraction[] {
  const paths: PathExtraction[] = [];
  const seen = new Set<string>();

  for (const [pattern, operation, groups] of PATH_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(cmd)) !== null) {
      for (const groupIdx of groups) {
        const extracted = match[groupIdx];
        if (!extracted) continue;

        // Skip flags (start with -)
        if (extracted.startsWith('-')) continue;

        // Skip command substitutions and variables (handled separately)
        if (extracted.startsWith('$') || extracted.startsWith('`')) continue;

        // Deduplicate
        const key = `${extracted}:${operation}`;
        if (seen.has(key)) continue;
        seen.add(key);

        paths.push({
          path: extracted,
          operation: operation as PathExtraction['operation'],
        });
      }
    }
  }

  return paths;
}

/**
 * Detect unsafe command substitutions.
 */
export function detectUnsafeSubstitutions(cmd: string): string[] {
  const unsafe: string[] = [];

  // Pattern for $(...) command substitution
  const dollarParenPattern = /\$\([^)]+\)/g;
  let match: RegExpExecArray | null;

  while ((match = dollarParenPattern.exec(cmd)) !== null) {
    const sub = match[0];
    if (!SAFE_SUBSTITUTIONS.some(safe => safe.test(sub))) {
      unsafe.push(sub);
    }
  }

  // Pattern for backtick substitution
  const backtickPattern = /`[^`]+`/g;
  while ((match = backtickPattern.exec(cmd)) !== null) {
    unsafe.push(match[0]);
  }

  // Pattern for ${...} variable expansion (complex ones only)
  const varExpansionPattern = /\$\{[^}]+[:#%/][^}]*\}/g;
  while ((match = varExpansionPattern.exec(cmd)) !== null) {
    unsafe.push(match[0]);
  }

  return unsafe;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check a bash command for outside-repo violations.
 */
export function checkBashCommand(cmd: string, cwd: string): BashCheckResult {
  const projectDir = getProjectDir();

  // Check for unsafe substitutions first
  const substitutions = detectUnsafeSubstitutions(cmd);
  if (substitutions.length > 0) {
    return {
      isViolation: true,
      isAbsolute: false,
      message: `Unsafe command substitution detected: ${substitutions[0]}`,
      paths: [],
      substitutions,
    };
  }

  // Extract paths from command
  const paths = extractPathsFromCommand(cmd);
  const violations: PathExtraction[] = [];

  for (const extraction of paths) {
    if (!isPathInRepo(extraction.path, cwd, projectDir)) {
      violations.push(extraction);
    }
  }

  if (violations.length === 0) {
    return {
      isViolation: false,
      isAbsolute: false,
      message: '',
      paths,
      substitutions: [],
    };
  }

  // Check if any violations are delete operations (ABSOLUTE BLOCK)
  const deleteViolations = violations.filter(v => v.operation === 'delete');
  if (deleteViolations.length > 0) {
    return {
      isViolation: true,
      isAbsolute: true,
      message: `ABSOLUTE BLOCK: rm targets path outside repository: ${deleteViolations[0]!.path}`,
      paths: violations,
      substitutions: [],
    };
  }

  // Other violations (STRICT BLOCK)
  const firstViolation = violations[0]!;
  return {
    isViolation: true,
    isAbsolute: false,
    message: `Operation '${firstViolation.operation}' targets path outside repository: ${firstViolation.path}`,
    paths: violations,
    substitutions: [],
  };
}

/**
 * Check a single file path for outside-repo violation.
 */
export function checkFilePath(filePath: string, cwd: string): FileCheckResult {
  const projectDir = getProjectDir();

  if (!filePath) {
    return { isViolation: false, message: '' };
  }

  if (!isPathInRepo(filePath, cwd, projectDir)) {
    return {
      isViolation: true,
      message: `File path is outside repository: ${filePath}`,
    };
  }

  return { isViolation: false, message: '' };
}

/**
 * Main validation function for all tool types.
 */
export function validateOutsideRepo(input: ToolInput): number {
  const toolName = input.tool_name;
  const toolInput = input.tool_input;
  const cwd = input.cwd || getProjectDir();

  // Handle Bash tool
  if (toolName === 'Bash') {
    const bashInput = toolInput as Partial<BashToolInput>;
    const cmd = bashInput.command || '';

    if (!cmd) {
      return EXIT_CODES.ALLOW;
    }

    const result = checkBashCommand(cmd, cwd);

    if (!result.isViolation) {
      AuditLogger.logAllowed(VALIDATOR_NAME, 'All paths within repository', { command: cmd.slice(0, 200) });
      return EXIT_CODES.ALLOW;
    }

    // Handle substitution violations
    if (result.substitutions.length > 0) {
      const overrideResult = OverrideManager.checkAndConsume('SUBSTITUTION');
      if (overrideResult.valid) {
        AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_SUBSTITUTION', cmd);
        printOverrideConsumed(result.message, 'BMAD_ALLOW_SUBSTITUTION');
        return EXIT_CODES.ALLOW;
      }

      AuditLogger.logBlocked(VALIDATOR_NAME, result.message, cmd, {
        block_type: 'SUBSTITUTION',
        substitutions: result.substitutions,
      });

      printBlockMessage({
        title: 'COMMAND SUBSTITUTION BLOCKED',
        message: result.message,
        target: cmd.slice(0, 200),
        overrideVar: 'BMAD_ALLOW_SUBSTITUTION',
        recommendations: [
          'Avoid dynamic command substitution in file paths',
          'Use explicit paths instead of computed paths',
          'If necessary, run the substitution separately first',
        ],
      });

      return EXIT_CODES.HARD_BLOCK;
    }

    // Handle absolute block (rm outside repo)
    if (result.isAbsolute) {
      AuditLogger.logBlocked(VALIDATOR_NAME, result.message, cmd, {
        block_type: 'ABSOLUTE',
        violations: result.paths,
      });

      printBlockMessage({
        title: 'ABSOLUTE BLOCK',
        message: result.message,
        target: cmd.slice(0, 200),
        isAbsolute: true,
        recommendations: [
          'Delete commands outside the repository are never allowed',
          'This protects against accidental data loss',
        ],
      });

      return EXIT_CODES.HARD_BLOCK;
    }

    // Handle strict block (other operations outside repo)
    const overrideResult = OverrideManager.checkAndConsume('OUTSIDE_REPO');
    if (overrideResult.valid) {
      AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', cmd);
      printOverrideConsumed(result.message, 'BMAD_ALLOW_OUTSIDE_REPO');
      return EXIT_CODES.ALLOW;
    }

    AuditLogger.logBlocked(VALIDATOR_NAME, result.message, cmd, {
      block_type: 'STRICT',
      violations: result.paths,
    });

    printBlockMessage({
      title: 'OUTSIDE REPOSITORY BLOCKED',
      message: result.message,
      target: cmd.slice(0, 200),
      overrideVar: 'BMAD_ALLOW_OUTSIDE_REPO',
      recommendations: [
        'Ensure all file operations target paths within the repository',
        'Use relative paths when possible',
        'If accessing external paths is intentional, use the override',
      ],
    });

    return EXIT_CODES.HARD_BLOCK;
  }

  // Handle Write/Edit tools
  if (toolName === 'Write' || toolName === 'Edit') {
    const fileInput = toolInput as Partial<WriteToolInput | EditToolInput>;
    const filePath = fileInput.file_path || '';

    const result = checkFilePath(filePath, cwd);

    if (!result.isViolation) {
      AuditLogger.logAllowed(VALIDATOR_NAME, 'File within repository', { file: filePath });
      return EXIT_CODES.ALLOW;
    }

    const overrideResult = OverrideManager.checkAndConsume('OUTSIDE_REPO');
    if (overrideResult.valid) {
      AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', filePath);
      printOverrideConsumed(result.message, 'BMAD_ALLOW_OUTSIDE_REPO');
      return EXIT_CODES.ALLOW;
    }

    AuditLogger.logBlocked(VALIDATOR_NAME, result.message, filePath);

    printBlockMessage({
      title: 'OUTSIDE REPOSITORY BLOCKED',
      message: result.message,
      target: filePath,
      overrideVar: 'BMAD_ALLOW_OUTSIDE_REPO',
    });

    return EXIT_CODES.HARD_BLOCK;
  }

  // Handle Read tool
  if (toolName === 'Read') {
    const readInput = toolInput as Partial<ReadToolInput>;
    const filePath = readInput.file_path || '';

    const result = checkFilePath(filePath, cwd);

    if (!result.isViolation) {
      AuditLogger.logAllowed(VALIDATOR_NAME, 'File within repository', { file: filePath });
      return EXIT_CODES.ALLOW;
    }

    const overrideResult = OverrideManager.checkAndConsume('OUTSIDE_REPO');
    if (overrideResult.valid) {
      AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', filePath);
      printOverrideConsumed(result.message, 'BMAD_ALLOW_OUTSIDE_REPO');
      return EXIT_CODES.ALLOW;
    }

    AuditLogger.logBlocked(VALIDATOR_NAME, result.message, filePath);

    printBlockMessage({
      title: 'OUTSIDE REPOSITORY BLOCKED',
      message: result.message,
      target: filePath,
      overrideVar: 'BMAD_ALLOW_OUTSIDE_REPO',
    });

    return EXIT_CODES.HARD_BLOCK;
  }

  // Handle Glob/Grep tools
  if (toolName === 'Glob' || toolName === 'Grep') {
    const pathInput = toolInput as { path?: string };
    const searchPath = pathInput.path || '';

    // If no path specified, it defaults to cwd which is in repo
    if (!searchPath) {
      return EXIT_CODES.ALLOW;
    }

    const result = checkFilePath(searchPath, cwd);

    if (!result.isViolation) {
      AuditLogger.logAllowed(VALIDATOR_NAME, 'Search path within repository', { path: searchPath });
      return EXIT_CODES.ALLOW;
    }

    const overrideResult = OverrideManager.checkAndConsume('OUTSIDE_REPO');
    if (overrideResult.valid) {
      AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_OUTSIDE_REPO', searchPath);
      printOverrideConsumed(result.message, 'BMAD_ALLOW_OUTSIDE_REPO');
      return EXIT_CODES.ALLOW;
    }

    AuditLogger.logBlocked(VALIDATOR_NAME, result.message, searchPath);

    printBlockMessage({
      title: 'OUTSIDE REPOSITORY BLOCKED',
      message: result.message,
      target: searchPath,
      overrideVar: 'BMAD_ALLOW_OUTSIDE_REPO',
    });

    return EXIT_CODES.HARD_BLOCK;
  }

  // Unknown tool type - allow by default
  return EXIT_CODES.ALLOW;
}

/**
 * CLI entry point.
 */
export function main(): void {
  const input = getToolInputFromStdinSync();
  const exitCode = validateOutsideRepo(input);
  process.exit(exitCode);
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith('outside-repo.js') ||
               process.argv[1]?.endsWith('outside-repo.ts');
if (isMain) {
  main();
}
