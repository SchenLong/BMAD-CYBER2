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

import * as fs from 'fs';
import * as path from 'path';
import {
  AuditLogger,
  getProjectDir,
  getToolInputFromStdinSync,
} from '../common/index.js';
import { analyzeContent } from './prompt-injection.js';
import { EXIT_CODES, type Severity } from '../types/index.js';

const VALIDATOR_NAME = 'context_integrity_scanner';

// Maximum bytes to read from a context file (performance limit)
const MAX_SCAN_BYTES = 64 * 1024; // 64KB

// =============================================================================
// CONTEXT FILE PATTERNS
// =============================================================================

/**
 * Path patterns that identify knowledge base / context files.
 * These files are loaded as trusted context and must be scanned.
 */
const CONTEXT_PATH_PATTERNS: RegExp[] = [
  /\/_memory\//,
  /\/memory\//,
  /\/.claude\/commands\//,
  /\/CLAUDE\.md$/,
  /\/src\/[^/]+\/agents\/[^/]+\.md$/,
  /\/src\/[^/]+\/workflows\/[^/]+\/workflow\.yaml$/,
  /\/_compact\//,
  /\/_config\//,
  /\/_bmad\/[^/]+\/agents\/[^/]+\.md$/,
  /\/_bmad\/[^/]+\/workflows\/[^/]+\/workflow\.yaml$/,
  /\/.claude\/settings\.json$/,
];

/**
 * Binary file extensions to skip (no injection risk in binary data).
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
  '.pdf', '.zip', '.gz', '.tar', '.7z', '.rar',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.exe', '.dll', '.so', '.dylib',
  '.bin', '.dat', '.db', '.sqlite',
]);

// =============================================================================
// CONTEXT FILE DETECTION
// =============================================================================

/**
 * Check if a file path matches a context file pattern.
 */
export function isContextFile(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') return false;
  const normalized = filePath.replace(/\\/g, '/');
  return CONTEXT_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Check if a file has a binary extension (skip scanning).
 */
export function isBinaryFile(filePath: string): boolean {
  if (!filePath) return false;
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

// =============================================================================
// FILE CONTENT READER (CRIT-1)
// =============================================================================

/**
 * Read file content independently (CRIT-1 fix).
 * PreToolUse receives only file_path — we read the file ourselves
 * before Claude sees it, so we can analyze it first.
 *
 * Returns null if file cannot be read (not found, permission denied, binary).
 */
export function readFileForScanning(filePath: string): string | null {
  if (!filePath || typeof filePath !== 'string') return null;
  if (isBinaryFile(filePath)) return null;

  try {
    if (!fs.existsSync(filePath)) return null;

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return null;

    // Read only first MAX_SCAN_BYTES for performance
    if (stats.size > MAX_SCAN_BYTES) {
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(MAX_SCAN_BYTES);
      fs.readSync(fd, buffer, 0, MAX_SCAN_BYTES, 0);
      fs.closeSync(fd);
      return buffer.toString('utf8');
    }

    return fs.readFileSync(filePath, 'utf8');
  } catch {
    // Cannot read file — skip silently (don't block reads of unreadable files)
    return null;
  }
}

// =============================================================================
// SEVERITY MAPPING
// =============================================================================

/**
 * Map analysis severity to exit code (P1-8 graduated).
 * Context files use elevated sensitivity:
 * - INFO → ALLOW (exit 0)
 * - WARNING → SOFT_BLOCK (exit 1) — user warned but not blocked
 * - CRITICAL → HARD_BLOCK (exit 2) — likely injection
 */
export function severityToExitCode(severity: Severity): number {
  switch (severity) {
    case 'CRITICAL':
      return EXIT_CODES.HARD_BLOCK;
    case 'WARNING':
    case 'BLOCKED':
      return EXIT_CODES.SOFT_BLOCK;
    case 'INFO':
    default:
      return EXIT_CODES.ALLOW;
  }
}

// =============================================================================
// MAIN VALIDATOR
// =============================================================================

/**
 * Scan a context file for injection payloads.
 * Exported for testing.
 */
export function scanContextFile(
  filePath: string,
): { exitCode: number; findingCount: number; severity: Severity } {
  // Not a context file — skip (AC3: no overhead on normal reads)
  if (!isContextFile(filePath)) {
    return { exitCode: EXIT_CODES.ALLOW, findingCount: 0, severity: 'INFO' };
  }

  // Binary file — skip
  if (isBinaryFile(filePath)) {
    return { exitCode: EXIT_CODES.ALLOW, findingCount: 0, severity: 'INFO' };
  }

  // Read file content independently (CRIT-1)
  const content = readFileForScanning(filePath);
  if (content === null) {
    return { exitCode: EXIT_CODES.ALLOW, findingCount: 0, severity: 'INFO' };
  }

  // Empty file — nothing to scan
  if (content.trim().length === 0) {
    return { exitCode: EXIT_CODES.ALLOW, findingCount: 0, severity: 'INFO' };
  }

  // Run injection analysis
  const result = analyzeContent(content);

  const totalFindings =
    result.findings.length +
    result.unicode_findings.length +
    result.base64_findings.length +
    result.html_findings.length +
    result.multi_layer_findings.length;

  if (totalFindings === 0) {
    return { exitCode: EXIT_CODES.ALLOW, findingCount: 0, severity: 'INFO' };
  }

  // Log findings (AC6: audit log records context file scan results)
  const relativePath = filePath.replace(getProjectDir() + '/', '');
  AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
    context_file: relativePath,
    finding_count: totalFindings,
    highest_severity: result.highest_severity,
    pattern_findings: result.findings.length,
    unicode_findings: result.unicode_findings.length,
    base64_findings: result.base64_findings.length,
    html_findings: result.html_findings.length,
    multi_layer_findings: result.multi_layer_findings.length,
    sample_findings: result.findings.slice(0, 3).map((f) => ({
      category: f.category,
      pattern: f.pattern_name,
      severity: f.severity,
    })),
  }, result.highest_severity);

  const exitCode = severityToExitCode(result.highest_severity);
  return { exitCode, findingCount: totalFindings, severity: result.highest_severity };
}

/**
 * Main entry point — called from bin/context-integrity.js.
 */
export function main(): void {
  try {
    const { tool_input } = getToolInputFromStdinSync();

    // Extract file_path from Read tool input
    const filePath = (tool_input as { file_path?: string }).file_path;
    if (!filePath || typeof filePath !== 'string') {
      // No file path — skip (not a Read operation we can scan)
      process.exit(EXIT_CODES.ALLOW);
    }

    const { exitCode, findingCount, severity } = scanContextFile(filePath);

    if (exitCode === EXIT_CODES.HARD_BLOCK) {
      AuditLogger.logBlocked(
        VALIDATOR_NAME,
        `CRITICAL injection detected in context file`,
        filePath,
        { finding_count: findingCount, severity },
      );
      process.stderr.write(
        `[BMAD] BLOCKED: CRITICAL injection pattern detected in context file: ${filePath}\n`,
      );
    } else if (exitCode === EXIT_CODES.SOFT_BLOCK) {
      process.stderr.write(
        `[BMAD] WARNING: Injection pattern detected in context file: ${filePath} (${findingCount} finding(s), severity: ${severity})\n`,
      );
    }

    process.exit(exitCode);
  } catch (err) {
    // Fail-closed: genuine errors exit(2) (P1-6)
    process.stderr.write(`[BMAD] context-integrity error: ${err}\n`);
    process.exit(EXIT_CODES.HARD_BLOCK);
  }
}
