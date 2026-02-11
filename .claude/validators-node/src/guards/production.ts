/**
 * BMAD Guardrails: Production Guard Validator
 * ============================================
 * Blocks commands and content targeting production environments.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation
 *
 * Blocking Levels:
 * - ABSOLUTE BLOCK: Force push to main/master, deploy commands (no override)
 * - STRICT BLOCK: Other production indicators (user can override)
 *
 * Security Features:
 * - 18+ production keyword patterns
 * - Safe context detection (comments, documentation)
 * - Documentation file bypass
 * - Single-use override tokens with 5-minute timeout
 */

import {
  AuditLogger,
  getToolInputFromStdinSync,
  OverrideManager,
  printBlockMessage,
  printOverrideConsumed,
} from '../common/index.js';
import type { BashToolInput, EditToolInput, WriteToolInput } from '../types/index.js';
import { EXIT_CODES } from '../types/index.js';

const VALIDATOR_NAME = 'production_guard';

// ============================================================================
// Pattern Definitions
// ============================================================================

interface ProductionIndicator {
  pattern: string;
  match: string;
  context: string;
}

/** Production keyword patterns */
const PRODUCTION_PATTERNS: Array<[RegExp, string]> = [
  // Explicit keywords
  [/\bprod\b/i, 'Explicit "prod" keyword'],
  [/\bproduction\b/i, 'Explicit "production" keyword'],
  [/\bprd\b/i, 'Explicit "prd" abbreviation'],

  // Hostname/URL patterns
  [/prod\./i, 'Production hostname prefix'],
  [/production\./i, 'Production hostname prefix'],
  [/-prod\./i, 'Production hostname suffix'],
  [/-production\./i, 'Production hostname suffix'],
  [/\.prod\./i, 'Production subdomain'],

  // Environment variables
  [/NODE_ENV\s*=\s*["']?production/i, 'Node.js production environment'],
  [/RAILS_ENV\s*=\s*["']?production/i, 'Rails production environment'],
  [/FLASK_ENV\s*=\s*["']?production/i, 'Flask production environment'],
  [/APP_ENV\s*=\s*["']?production/i, 'App production environment'],
  [/ENVIRONMENT\s*=\s*["']?prod/i, 'Environment variable set to prod'],

  // Database indicators
  [/prod[-_]?db/i, 'Production database reference'],
  [/database[-_]?prod/i, 'Production database reference'],
  [/production[-_]?database/i, 'Production database reference'],

  // Cloud provider indicators
  [/aws[-_]?prod/i, 'AWS production reference'],
  [/gcp[-_]?prod/i, 'GCP production reference'],
  [/azure[-_]?prod/i, 'Azure production reference'],
];

/** Critical deployment commands - ABSOLUTE BLOCK, no override */
const CRITICAL_PATTERNS: Array<[RegExp, string]> = [
  [/git\s+push\s+.*--force.*\s+(main|master)/i, 'Force push to main/master'],
  [/git\s+push\s+-f\s+.*(main|master)/i, 'Force push to main/master'],
  [/deploy\s+.*prod/i, 'Deploy to production'],
  [/kubectl\s+.*prod/i, 'Kubernetes in production context'],
  [/helm\s+.*prod/i, 'Helm in production context'],
  [/\blive\b.*deploy/i, 'Deploy to live'],
  [/\brelease\b.*deploy/i, 'Release deployment'],
];

/** Safe patterns that prevent false positives */
const SAFE_PATTERNS: RegExp[] = [
  /reproduce/i,
  /product(?!ion)/i,          // "product" but not "production"
  /productivity/i,
  /productive/i,
  /prod[-_]?test/i,
  /test[-_]?prod/i,
  /non[-_]?prod/i,
  /pre[-_]?prod/i,
  /#.*\bprod\b/i,             // Comment containing prod
  /\/\/.*\bprod\b/i,          // Line comment
  /\/\*.*\bprod\b/i,          // Block comment start
  /production[-_]?ready/i,
  /production[-_]?quality/i,
  /production[-_]?grade/i,
  /for\s+production/i,
  /in\s+production/i,
];

/** Documentation file patterns */
const DOCUMENTATION_PATTERNS: RegExp[] = [
  /\.md$/i,
  /README/i,
  /CHANGELOG/i,
  /CONTRIBUTING/i,
  /LICENSE/i,
  /\.txt$/i,
  /\.rst$/i,
  /\.adoc$/i,
  /\/docs\//i,
  /\/documentation\//i,
];

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a file path is a documentation file.
 */
export function isDocumentationFile(filePath: string | null): boolean {
  if (!filePath) {
    return false;
  }

  return DOCUMENTATION_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if text is in a safe context (comments, safe words).
 */
export function isSafeContext(text: string): boolean {
  return SAFE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check for critical deployment commands that cannot be overridden.
 */
export function isCriticalDeployCommand(text: string): { isCritical: boolean; message: string } {
  for (const [pattern, description] of CRITICAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        isCritical: true,
        message: `Critical production operation: ${description}`,
      };
    }
  }

  return { isCritical: false, message: '' };
}

/**
 * Detect production indicators in text.
 */
export function detectProductionIndicators(text: string): ProductionIndicator[] {
  const indicators: ProductionIndicator[] = [];
  const lines = text.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]!;

    // Skip if the entire line is a safe context
    if (isSafeContext(line)) {
      continue;
    }

    for (const [pattern, description] of PRODUCTION_PATTERNS) {
      const match = line.match(pattern);
      if (match && !isSafeContext(match[0])) {
        indicators.push({
          pattern: description,
          match: match[0],
          context: line.trim().slice(0, 100),
        });
      }
    }
  }

  return indicators;
}

/**
 * Main validation function.
 */
export function validateProductionGuard(content: string, filePath: string | null): number {
  if (!content) {
    return EXIT_CODES.ALLOW;
  }

  // Skip documentation files
  if (isDocumentationFile(filePath)) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'Documentation file', { file: filePath });
    return EXIT_CODES.ALLOW;
  }

  // Check for critical deployment commands first (ABSOLUTE BLOCK)
  const criticalCheck = isCriticalDeployCommand(content);
  if (criticalCheck.isCritical) {
    AuditLogger.logBlocked(VALIDATOR_NAME, criticalCheck.message, content.slice(0, 500), {
      block_type: 'ABSOLUTE',
    });

    printBlockMessage({
      title: 'ABSOLUTE BLOCK - CRITICAL PRODUCTION OPERATION',
      message: criticalCheck.message,
      target: content.slice(0, 200),
      isAbsolute: true,
      recommendations: [
        'Never force push to main/master branches',
        'Use pull requests for production deployments',
        'Ensure proper CI/CD pipelines are in place',
      ],
    });

    return EXIT_CODES.HARD_BLOCK;
  }

  // Detect production indicators
  const indicators = detectProductionIndicators(content);

  if (indicators.length === 0) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'No production indicators found');
    return EXIT_CODES.ALLOW;
  }

  // Production indicators found - check for override
  const overrideResult = OverrideManager.checkAndConsume('PRODUCTION');

  if (overrideResult.valid) {
    AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_PRODUCTION', content.slice(0, 200));
    printOverrideConsumed(
      `Production targeting detected: ${indicators.length} indicator(s) found`,
      'BMAD_ALLOW_PRODUCTION'
    );
    return EXIT_CODES.ALLOW;
  }

  // Block the operation
  const indicatorSummary = indicators.slice(0, 3).map(i => `${i.pattern}: "${i.match}"`).join(', ');
  AuditLogger.logBlocked(VALIDATOR_NAME, `Production indicators: ${indicatorSummary}`, content.slice(0, 500), {
    indicator_count: indicators.length,
    indicators: indicators.slice(0, 5),
  });

  printBlockMessage({
    title: 'PRODUCTION TARGETING BLOCKED',
    message: `Detected ${indicators.length} production indicator(s):\n${ 
      indicators.slice(0, 3).map(i => `  - ${i.pattern}: "${i.match}"`).join('\n')}`,
    target: content.slice(0, 200),
    overrideVar: 'BMAD_ALLOW_PRODUCTION',
    recommendations: [
      'Use staging/development environments for testing',
      'Review the content to ensure it does not affect production',
      'If intentional, use the override with caution',
    ],
  });

  return EXIT_CODES.HARD_BLOCK;
}

/**
 * CLI entry point.
 */
export function main(): void {
  const input = getToolInputFromStdinSync();
  const toolInput = input.tool_input as Partial<BashToolInput & WriteToolInput & EditToolInput>;

  // Get content from command (Bash) or content/new_string (Write/Edit)
  const content = toolInput.command || toolInput.content || toolInput.new_string || '';
  const filePath = toolInput.file_path || null;

  const exitCode = validateProductionGuard(content, filePath);
  process.exit(exitCode);
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith('production.js') ||
               process.argv[1]?.endsWith('production.ts');
if (isMain) {
  main();
}
