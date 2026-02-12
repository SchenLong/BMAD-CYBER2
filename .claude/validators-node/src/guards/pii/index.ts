/**
 * BMAD Guardrails: PII Guard Validator
 * =====================================
 * Detects and blocks Personally Identifiable Information (PII) in content.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation (PII detected)
 *
 * Security Features:
 * - US patterns: SSN, phone, driver's license, passport, Medicare, ITIN
 * - EU patterns: IBAN, NINO, NHS, tax IDs, national IDs (18 countries)
 * - Common patterns: Credit cards, email, IP, DOB, MAC address
 * - Algorithmic validators: Luhn, IBAN MOD-97, NHS MOD-11, etc.
 * - Context detection for reducing false positives
 * - Test file and fake data exclusion
 * - Single-use override tokens with 5-minute timeout
 */

import {
  AuditLogger,
  getToolInputFromStdinSync,
  OverrideManager,
  printBlockMessage,
  printOverrideConsumed,
} from '../../common/index.js';
import type { EditToolInput, WriteToolInput } from '../../types/index.js';
import { EXIT_CODES } from '../../types/index.js';
import {
  ALL_PATTERNS,
  FAKE_DATA_INDICATORS,
  SENSITIVE_CONTEXT_PATTERNS,
  type Severity,
  TEST_FILE_INDICATORS,
} from './patterns.js';

const VALIDATOR_NAME = 'pii_guard';

// ============================================================================
// Types
// ============================================================================

export interface PiiDetection {
  patternName: string;
  match: string;
  line: string;
  lineNumber: number;
  severity: Severity;
}

// ============================================================================
// Context Detection
// ============================================================================

/**
 * Check if a file path indicates a test/mock data file.
 */
export function isTestFile(filePath: string): boolean {
  if (!filePath) return false;

  const pathLower = filePath.toLowerCase();
  return TEST_FILE_INDICATORS.some(indicator => pathLower.includes(indicator));
}

/**
 * Check if the content/line is in a sensitive context.
 * Used for patterns that have contextRequired: true.
 */
export function isSensitiveContext(content: string, line: string): boolean {
  // Check the line itself
  for (const pattern of SENSITIVE_CONTEXT_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  // Check surrounding context (5 lines before and after)
  const lines = content.split('\n');
  const lineIndex = lines.findIndex(l => l.includes(line.trim()));

  if (lineIndex !== -1) {
    const start = Math.max(0, lineIndex - 5);
    const end = Math.min(lines.length, lineIndex + 6);
    const context = lines.slice(start, end).join('\n');

    for (const pattern of SENSITIVE_CONTEXT_PATTERNS) {
      if (pattern.test(context)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if content around a match indicates fake/test data.
 */
export function isFakeData(content: string, line: string): boolean {
  // Check the line itself
  for (const pattern of FAKE_DATA_INDICATORS) {
    if (pattern.test(line)) {
      return true;
    }
  }

  // Check surrounding context (3 lines before and after)
  const lines = content.split('\n');
  const lineIndex = lines.findIndex(l => l.includes(line.trim()));

  if (lineIndex !== -1) {
    const start = Math.max(0, lineIndex - 3);
    const end = Math.min(lines.length, lineIndex + 4);
    const context = lines.slice(start, end).join('\n');

    for (const pattern of FAKE_DATA_INDICATORS) {
      if (pattern.test(context)) {
        return true;
      }
    }
  }

  return false;
}

// ============================================================================
// PII Detection
// ============================================================================

/**
 * Detect PII in content.
 */
export function detectPii(content: string): PiiDetection[] {
  const detections: PiiDetection[] = [];
  const lines = content.split('\n');

  for (const piiPattern of ALL_PATTERNS) {
    // Reset regex state
    piiPattern.regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = piiPattern.regex.exec(content)) !== null) {
      const matchText = match[0];

      // Find which line this match is on
      let charCount = 0;
      let lineNumber = 0;
      let matchLine = '';

      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i]!.length + 1; // +1 for newline
        if (charCount + lineLength > match.index) {
          lineNumber = i + 1;
          matchLine = lines[i]!;
          break;
        }
        charCount += lineLength;
      }

      // Run validator if one exists
      if (piiPattern.validator) {
        if (!piiPattern.validator(matchText)) {
          continue; // Skip invalid matches
        }
      }

      // Check context requirement
      if (piiPattern.contextRequired) {
        if (!isSensitiveContext(content, matchLine)) {
          continue; // Skip matches not in sensitive context
        }
      }

      // Check for fake/test data
      if (isFakeData(content, matchLine)) {
        continue; // Skip fake data
      }

      detections.push({
        patternName: piiPattern.name,
        match: matchText.slice(0, 20) + (matchText.length > 20 ? '...' : ''),
        line: matchLine.trim().slice(0, 80),
        lineNumber,
        severity: piiPattern.severity,
      });
    }
  }

  return detections;
}

// ============================================================================
// Main Validation
// ============================================================================

/**
 * Main validation function.
 */
export function validatePiiGuard(content: string, filePath: string): number {
  if (!content) {
    return EXIT_CODES.ALLOW;
  }

  // Check if this is a test file
  if (isTestFile(filePath)) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'Test/mock data file', { file: filePath });
    return EXIT_CODES.ALLOW;
  }

  // Detect PII
  const detections = detectPii(content);

  if (detections.length === 0) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'No PII detected', { file: filePath });
    return EXIT_CODES.ALLOW;
  }

  // Separate by severity
  const criticalPii = detections.filter(d => d.severity === 'critical');
  const warningPii = detections.filter(d => d.severity === 'warning');
  const infoPii = detections.filter(d => d.severity === 'info');

  // If only info-level PII, allow with log
  if (criticalPii.length === 0 && warningPii.length === 0) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'Only info-level PII detected', {
      file: filePath,
      info_count: infoPii.length,
    });
    return EXIT_CODES.ALLOW;
  }

  // Check for override
  const overrideResult = OverrideManager.checkAndConsume('PII');

  if (overrideResult.valid) {
    AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_PII', filePath);
    printOverrideConsumed(
      `${detections.length} PII pattern(s) detected`,
      'BMAD_ALLOW_PII'
    );
    return EXIT_CODES.ALLOW;
  }

  // Block the operation
  const piiSummary = detections
    .filter(d => d.severity !== 'info')
    .slice(0, 5)
    .map(d => `- ${d.patternName} (${d.severity}) at line ${d.lineNumber}: "${d.match}"`)
    .join('\n');

  AuditLogger.logBlocked(VALIDATOR_NAME, `PII detected: ${detections.length}`, filePath, {
    critical_count: criticalPii.length,
    warning_count: warningPii.length,
    info_count: infoPii.length,
    detections: detections.slice(0, 10).map(d => ({
      pattern: d.patternName,
      severity: d.severity,
      line: d.lineNumber,
    })),
  });

  printBlockMessage({
    title: 'PII DETECTED - DATA PROTECTION BLOCK',
    message: `Found ${criticalPii.length + warningPii.length} sensitive PII pattern(s):\n${piiSummary}${ 
      detections.length > 5 ? `\n  ... and ${detections.length - 5} more` : ''}`,
    target: filePath,
    overrideVar: 'BMAD_ALLOW_PII',
    recommendations: [
      'Remove or redact PII before committing',
      'Use anonymized or synthetic data for testing',
      'Store real PII in secure, encrypted storage',
      'Ensure GDPR/CCPA compliance for personal data',
      'If this is test data, use test_data/ or fixtures/ directory',
    ],
  });

  return EXIT_CODES.HARD_BLOCK;
}

/**
 * CLI entry point.
 */
export function main(): void {
  const input = getToolInputFromStdinSync();
  const toolInput = input.tool_input as Partial<WriteToolInput & EditToolInput>;

  const content = toolInput.content || toolInput.new_string || '';
  const filePath = toolInput.file_path || '';

  const exitCode = validatePiiGuard(content, filePath);
  process.exit(exitCode);
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith('pii/index.js') ||
               process.argv[1]?.endsWith('pii/index.ts') ||
               process.argv[1]?.endsWith('pii.js');
if (isMain) {
  main();
}

// Re-export for external use
export * from './validators.js';
export * from './patterns.js';
