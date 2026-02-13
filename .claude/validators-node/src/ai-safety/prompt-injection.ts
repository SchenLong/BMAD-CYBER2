/**
 * BMAD Guardrails: Prompt Injection Guard
 * ========================================
 * Detects attempts to manipulate AI agent behavior through injected instructions.
 *
 * Exit Codes:
 * - 0: Allow the operation (info severity or override used)
 * - 2: Block the operation (warning/critical severity)
 *
 * Detection Layers:
 * 1. Pattern-based detection (20+ pattern categories)
 * 2. Unicode manipulation detection
 * 3. Base64 payload detection
 * 4. HTML comment injection detection
 *
 * Security Note: This validator uses harmless test patterns.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */

import {
  AuditLogger,
  getToolInputFromStdinSync,
  OverrideManager,
  printBlockMessage,
  printOverrideConsumed,
  printWarning,
} from '../common/index.js';
import type { EditToolInput, ReadToolInput, WriteToolInput, WebFetchToolInput, TaskToolInput, SkillToolInput, WebSearchToolInput } from '../types/index.js';
import { EXIT_CODES, type Severity } from '../types/index.js';
import { normalizeText, detectHiddenUnicode } from './text-normalizer.js';
import type { UnicodeFinding } from './text-normalizer.js';

// Pattern engine extracted to break circular deps (TPI-09, P1-3)
import {
  detectPatterns,
  CRITICAL_PATTERNS,
  SYSTEM_OVERRIDE_PATTERNS,
  INSTRUCTION_INJECTION_PATTERNS,
  type PatternFinding,
} from './pattern-engine.js';

// Reformulation detector — library module (TPI-09, P1-4)
import {
  detectCodeFormatInjection,
  detectCharacterLevelEncoding,
  detectContextOverload,
  detectMathLogicEncoding,
  type ReformulationFinding,
} from './reformulation-detector.js';

// Boundary detector — library module (TPI-14)
import {
  detectBoundaryManipulation,
  type BoundaryFinding,
} from './boundary-detector.js';

// Multilingual patterns — library module (TPI-15)
import {
  detectMultilingualInjection,
  type MultilingualFinding,
} from './multilingual-patterns.js';

// Re-export for backward compatibility
export { detectPatterns };
export type { PatternFinding };

const VALIDATOR_NAME = 'prompt_injection_guard';

// =============================================================================
// UNICODE NORMALIZATION — imported from text-normalizer.ts (TPI-PRE-1)
// Re-exported for backward compatibility (tests + barrel imports reference this module)
// =============================================================================
export { normalizeText, detectHiddenUnicode };
export type { UnicodeFinding };

// =============================================================================
// BASE64 PAYLOAD DETECTION
// =============================================================================

/**
 * Base64 finding.
 */
export interface Base64Finding {
  category: string;
  severity: Severity;
  match_preview: string;
  decoded_preview?: string;
  description: string;
  contains_injection: boolean;
}

// =============================================================================
// MULTI-LAYER ENCODING DETECTION (SEC-002-4)
// =============================================================================

/**
 * Multi-layer encoding finding.
 */
export interface MultiLayerEncodingFinding {
  category: string;
  severity: Severity;
  encoding_layers: string[];
  original_encoded: string;
  final_decoded: string;
  description: string;
  contains_injection: boolean;
  decode_depth: number;
}

/**
 * Maximum decoding depth to prevent infinite loops.
 */
const MAX_DECODE_DEPTH = 5;

/**
 * Minimum content length to attempt decoding.
 */
const MIN_DECODE_LENGTH = 20;

/**
 * Detect and iteratively decode multi-layer encoded content.
 */
export function detectMultiLayerEncoding(content: string): MultiLayerEncodingFinding[] {
  const findings: MultiLayerEncodingFinding[] = [];
  const processedInputs = new Set<string>(); // Loop detection

  // Find potential encoded strings
  const encodingPatterns = [
    { name: 'base64', pattern: /[A-Za-z0-9+/]{40,}={0,2}/g },
    { name: 'url_encoded', pattern: /%[0-9A-Fa-f]{2}(?:%[0-9A-Fa-f]{2}){10,}/g },
    { name: 'hex_encoded', pattern: /(?:0x)?[0-9A-Fa-f]{40,}/g },
    { name: 'unicode_escape', pattern: /(?:\\u[0-9A-Fa-f]{4}){10,}/g },
  ];

  for (const encodingPattern of encodingPatterns) {
    let match: RegExpExecArray | null;
    encodingPattern.pattern.lastIndex = 0; // Reset regex state

    while ((match = encodingPattern.pattern.exec(content)) !== null) {
      const encodedText = match[0];

      if (encodedText.length < MIN_DECODE_LENGTH) {
        continue;
      }

      // Try iterative decoding
      const result = iterativeDecode(encodedText, processedInputs);

      if (result.decodeLayers.length > 1) {
        // Check final decoded content for injection patterns
        let containsInjection = false;
        for (const patternDef of CRITICAL_PATTERNS) {
          if (patternDef.pattern.test(result.finalDecoded)) {
            containsInjection = true;
            break;
          }
        }

        findings.push({
          category: 'multi_layer_encoding',
          severity: containsInjection ? 'CRITICAL' : 'WARNING',
          encoding_layers: result.decodeLayers,
          original_encoded: encodedText.slice(0, 50) + (encodedText.length > 50 ? '...' : ''),
          final_decoded: result.finalDecoded.slice(0, 100) + (result.finalDecoded.length > 100 ? '...' : ''),
          description: `Multi-layer encoded content detected (${result.decodeLayers.length} layers: ${result.decodeLayers.join(' → ')})`,
          contains_injection: containsInjection,
          decode_depth: result.decodeLayers.length,
        });
      }
    }
  }

  return findings;
}

/**
 * Iteratively decode content with loop detection.
 */
function iterativeDecode(input: string, processedInputs: Set<string>): {
  decodeLayers: string[];
  finalDecoded: string;
} {
  const decodeLayers: string[] = [];
  let currentContent = input;
  let depth = 0;

  while (depth < MAX_DECODE_DEPTH) {
    // Loop detection - prevent infinite loops
    if (processedInputs.has(currentContent)) {
      decodeLayers.push('LOOP_DETECTED');
      break;
    }
    processedInputs.add(currentContent);

    const decoded = attemptDecode(currentContent);
    if (!decoded || decoded.result === currentContent) {
      break; // No further decoding possible
    }

    decodeLayers.push(decoded.method);
    currentContent = decoded.result;
    depth++;

    // If decoded content is not text-like, stop
    const printableRatio = (currentContent.match(/[\x20-\x7e\n\r\t]/g) || []).length / currentContent.length;
    if (printableRatio < 0.7) {
      break;
    }
  }

  return {
    decodeLayers,
    finalDecoded: currentContent,
  };
}

/**
 * Attempt to decode content using various methods.
 */
function attemptDecode(content: string): { method: string; result: string } | null {
  // Try Base64 decoding
  if (/^[A-Za-z0-9+/]+=*$/.test(content)) {
    try {
      const decoded = Buffer.from(content, 'base64').toString('utf-8');
      if (decoded !== content && decoded.length > 0) {
        return { method: 'base64', result: decoded };
      }
    } catch {
      // Not valid base64
    }
  }

  // Try URL decoding
  if (/%[0-9A-Fa-f]{2}/.test(content)) {
    try {
      const decoded = decodeURIComponent(content);
      if (decoded !== content) {
        return { method: 'url', result: decoded };
      }
    } catch {
      // Not valid URL encoding
    }
  }

  // Try hex decoding
  if (/^(?:0x)?[0-9A-Fa-f]+$/.test(content)) {
    try {
      const hexContent = content.replace(/^0x/, '');
      if (hexContent.length % 2 === 0) {
        const decoded = Buffer.from(hexContent, 'hex').toString('utf-8');
        if (decoded !== content && decoded.length > 0) {
          return { method: 'hex', result: decoded };
        }
      }
    } catch {
      // Not valid hex
    }
  }

  // Try Unicode escape sequence decoding
  if (/\\u[0-9A-Fa-f]{4}/.test(content)) {
    try {
      const decoded = content.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
      if (decoded !== content) {
        return { method: 'unicode_escape', result: decoded };
      }
    } catch {
      // Not valid unicode escapes
    }
  }

  // Try HTML entity decoding
  if (/&(?:#[0-9]+|#x[0-9A-Fa-f]+|[a-zA-Z][a-zA-Z0-9]*);/.test(content)) {
    const decoded = content
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');

    if (decoded !== content) {
      return { method: 'html_entity', result: decoded };
    }
  }

  return null;
}

/**
 * Detect base64 encoded payloads.
 */
export function detectBase64Payloads(text: string): Base64Finding[] {
  const findings: Base64Finding[] = [];

  // Match potential base64 strings (40+ characters)
  const base64Pattern = /[A-Za-z0-9+/]{40,}={0,2}/g;
  let match;

  while ((match = base64Pattern.exec(text)) !== null) {
    const potentialBase64 = match[0];

    try {
      // Attempt to decode
      const decoded = Buffer.from(potentialBase64, 'base64').toString('utf-8');

      // Check if decoded content looks like text (mostly printable)
      const printableRatio = (decoded.match(/[\x20-\x7e\n\r\t]/g) || []).length / decoded.length;
      if (printableRatio < 0.8) {
        continue; // Likely not meaningful text
      }

      // Check decoded content for injection patterns
      let containsInjection = false;
      for (const patternDef of CRITICAL_PATTERNS) {
        if (patternDef.pattern.test(decoded)) {
          containsInjection = true;
          break;
        }
      }

      findings.push({
        category: 'base64_payload',
        severity: containsInjection ? 'CRITICAL' : 'WARNING',
        match_preview: `${potentialBase64.slice(0, 30)  }...`,
        decoded_preview: decoded.slice(0, 50) + (decoded.length > 50 ? '...' : ''),
        description: containsInjection
          ? 'Base64 encoded content contains injection patterns'
          : 'Base64 encoded content detected',
        contains_injection: containsInjection,
      });
    } catch {
      // Not valid base64, ignore
    }
  }

  return findings;
}

// =============================================================================
// HTML COMMENT INJECTION DETECTION
// =============================================================================

/**
 * HTML comment finding.
 */
export interface HtmlCommentFinding {
  category: string;
  severity: Severity;
  comment_preview: string;
  description: string;
}

/**
 * Detect injection patterns in HTML comments.
 */
export function detectHtmlCommentInjection(text: string): HtmlCommentFinding[] {
  const findings: HtmlCommentFinding[] = [];

  // Match HTML comments (including multiline)
  const commentPattern = /<!--([\s\S]*?)-->/g;
  let match;

  while ((match = commentPattern.exec(text)) !== null) {
    const commentContent = match[1] || '';

    // Check comment content for injection patterns
    const checkPatterns = [...SYSTEM_OVERRIDE_PATTERNS, ...INSTRUCTION_INJECTION_PATTERNS];

    for (const patternDef of checkPatterns) {
      if (patternDef.pattern.test(commentContent)) {
        findings.push({
          category: 'html_comment_injection',
          severity: 'WARNING',
          comment_preview: commentContent.slice(0, 50) + (commentContent.length > 50 ? '...' : ''),
          description: `HTML comment contains ${patternDef.name} pattern`,
        });
        break; // Only report once per comment
      }
    }
  }

  return findings;
}

// =============================================================================
// MAIN ANALYSIS
// =============================================================================

/**
 * Complete analysis result.
 */
export interface AnalysisResult {
  findings: PatternFinding[];
  unicode_findings: UnicodeFinding[];
  base64_findings: Base64Finding[];
  html_findings: HtmlCommentFinding[];
  multi_layer_findings: MultiLayerEncodingFinding[];
  reformulation_findings: ReformulationFinding[];
  boundary_findings: BoundaryFinding[];
  multilingual_findings: MultilingualFinding[];
  highest_severity: Severity;
  should_block: boolean;
}

/**
 * Analyze content for prompt injection attempts.
 */
export function analyzeContent(content: string): AnalysisResult {
  // 1. Normalize text to defeat homoglyph attacks (SEC-002-3)
  const normalizedContent = normalizeText(content);
  const obfuscationDetected = normalizedContent.length < content.length * 0.9;

  // 2. Pattern-based detection on normalized content
  const findings = detectPatterns(normalizedContent);

  // Also run on original if significantly different
  if (obfuscationDetected) {
    const originalFindings = detectPatterns(content);
    // Merge unique findings
    const existingNames = new Set(findings.map((f) => f.pattern_name));
    for (const finding of originalFindings) {
      if (!existingNames.has(finding.pattern_name)) {
        findings.push(finding);
      }
    }

    // Add obfuscation finding
    findings.push({
      category: 'unicode_obfuscation',
      pattern_name: 'heavy_obfuscation',
      severity: 'WARNING',
      match: 'Heavy Unicode obfuscation detected',
      description: 'Heavy Unicode obfuscation detected - text was significantly altered during normalization',
      line_number: 1,
    });
  }

  // 3. Unicode manipulation detection
  const unicodeFindings = detectHiddenUnicode(content);

  // 4. Base64 payload detection
  const base64Findings = detectBase64Payloads(content);

  // 5. HTML comment injection detection
  const htmlFindings = detectHtmlCommentInjection(content);

  // 6. Multi-layer encoding detection (SEC-002-4)
  const multiLayerFindings = detectMultiLayerEncoding(content);

  // 7. Code-format injection detection (TPI-09)
  const codeFormatFindings = detectCodeFormatInjection(content);

  // 8. Character-level encoding detection (TPI-10)
  const charEncodingFindings = detectCharacterLevelEncoding(content);

  // 9. Context overload & many-shot detection (TPI-11)
  const contextOverloadFindings = detectContextOverload(content);

  // 10. Mathematical/logical encoding detection (TPI-13)
  const mathLogicFindings = detectMathLogicEncoding(content);

  // 11. Boundary manipulation detection (TPI-14) — pre+post normalization (P1-10)
  const boundaryFindings = detectBoundaryManipulation(content, normalizedContent);

  // 12. Multilingual injection detection (TPI-15) — run on raw content
  // Raw content preserves non-Latin scripts (Cyrillic, CJK, Arabic) that
  // normalizeText() would corrupt via confusable mapping (e.g., Cyrillic 'р'→'p')
  const multilingualFindings = detectMultilingualInjection(content);

  // Combine all reformulation findings
  const reformulationFindings: ReformulationFinding[] = [
    ...codeFormatFindings,
    ...charEncodingFindings,
    ...contextOverloadFindings,
    ...mathLogicFindings,
  ];

  // Determine highest severity
  const allSeverities: Severity[] = [
    ...findings.map((f) => f.severity),
    ...unicodeFindings.map((f) => f.severity),
    ...base64Findings.map((f) => f.severity),
    ...htmlFindings.map((f) => f.severity),
    ...multiLayerFindings.map((f) => f.severity),
    ...reformulationFindings.map((f) => f.severity),
    ...boundaryFindings.map((f) => f.severity),
    ...multilingualFindings.map((f) => f.severity),
  ];

  const severityOrder: Record<Severity, number> = {
    INFO: 0,
    WARNING: 1,
    BLOCKED: 2,
    CRITICAL: 3,
  };

  let highestSeverity: Severity = 'INFO';
  for (const severity of allSeverities) {
    if (severityOrder[severity] > severityOrder[highestSeverity]) {
      highestSeverity = severity;
    }
  }

  // Determine if we should block
  const shouldBlock = highestSeverity === 'WARNING' || highestSeverity === 'CRITICAL';

  return {
    findings,
    unicode_findings: unicodeFindings,
    base64_findings: base64Findings,
    html_findings: htmlFindings,
    multi_layer_findings: multiLayerFindings,
    reformulation_findings: reformulationFindings,
    boundary_findings: boundaryFindings,
    multilingual_findings: multilingualFindings,
    highest_severity: highestSeverity,
    should_block: shouldBlock,
  };
}

// =============================================================================
// MAIN VALIDATOR
// =============================================================================

/**
 * Get content to analyze based on tool type.
 */
function getContentToAnalyze(input: {
  tool_name: string;
  tool_input: Record<string, unknown>;
}): string {
  const { tool_name, tool_input } = input;

  switch (tool_name) {
    case 'Write': {
      const writeInput = tool_input as Partial<WriteToolInput>;
      return writeInput.content || '';
    }
    case 'Edit': {
      const editInput = tool_input as Partial<EditToolInput>;
      return editInput.new_string || '';
    }
    case 'Read': {
      const readInput = tool_input as Partial<ReadToolInput>;
      return readInput.file_path || '';
    }
    case 'UserPromptSubmit': {
      // User input is in the prompt field
      return (tool_input as { prompt?: string }).prompt || '';
    }
    case 'WebFetch': {
      const wfInput = tool_input as Partial<WebFetchToolInput>;
      return [wfInput.url, wfInput.prompt].filter(Boolean).join(' ');
    }
    case 'Task': {
      const taskInput = tool_input as Partial<TaskToolInput>;
      return taskInput.prompt || '';
    }
    case 'Skill': {
      const skillInput = tool_input as Partial<SkillToolInput>;
      return [skillInput.skill, skillInput.args].filter(Boolean).join(' ');
    }
    case 'WebSearch': {
      const wsInput = tool_input as Partial<WebSearchToolInput>;
      return wsInput.query || '';
    }
    default:
      // For unknown tools, check common content fields
      return (tool_input.content as string) ||
             (tool_input.prompt as string) ||
             (tool_input.text as string) ||
             JSON.stringify(tool_input);
  }
}

/**
 * Validate content for prompt injection.
 */
export function validatePromptInjection(
  content: string,
  toolName: string
): { exitCode: number; result: AnalysisResult } {
  if (!content || content.trim().length === 0) {
    return {
      exitCode: EXIT_CODES.ALLOW,
      result: {
        findings: [],
        unicode_findings: [],
        base64_findings: [],
        html_findings: [],
        multi_layer_findings: [],
        reformulation_findings: [],
        boundary_findings: [],
        multilingual_findings: [],
        highest_severity: 'INFO',
        should_block: false,
      },
    };
  }

  const result = analyzeContent(content);

  // Log all findings
  if (result.findings.length > 0 || result.unicode_findings.length > 0 ||
      result.base64_findings.length > 0 || result.html_findings.length > 0 ||
      result.multi_layer_findings.length > 0 || result.reformulation_findings.length > 0 ||
      result.boundary_findings.length > 0 || result.multilingual_findings.length > 0) {
    AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
      tool: toolName,
      findings_count: result.findings.length,
      unicode_findings_count: result.unicode_findings.length,
      base64_findings_count: result.base64_findings.length,
      html_findings_count: result.html_findings.length,
      multi_layer_findings_count: result.multi_layer_findings.length,
      reformulation_findings_count: result.reformulation_findings.length,
      highest_severity: result.highest_severity,
      sample_findings: result.findings.slice(0, 5),
    }, result.highest_severity);
  }

  // INFO severity - allow with logging
  if (result.highest_severity === 'INFO') {
    return { exitCode: EXIT_CODES.ALLOW, result };
  }

  // WARNING or CRITICAL - check for override
  if (result.should_block) {
    const overrideResult = OverrideManager.checkAndConsume('INJECTION_CONTENT');
    if (overrideResult.valid) {
      AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_INJECTION_CONTENT', content.slice(0, 200));
      printOverrideConsumed('Prompt injection patterns detected', 'BMAD_ALLOW_INJECTION_CONTENT');
      return { exitCode: EXIT_CODES.ALLOW, result };
    }

    // Block the operation
    AuditLogger.logBlocked(
      VALIDATOR_NAME,
      `Prompt injection detected: ${result.findings[0]?.description || 'suspicious content'}`,
      content.slice(0, 200),
      {
        severity: result.highest_severity,
        finding_categories: [...new Set(result.findings.map((f) => f.category))],
      }
    );

    return { exitCode: EXIT_CODES.HARD_BLOCK, result };
  }

  return { exitCode: EXIT_CODES.ALLOW, result };
}

/**
 * Format findings for user output.
 */
function formatFindings(result: AnalysisResult): string {
  const lines: string[] = [];

  if (result.findings.length > 0) {
    lines.push('Pattern matches:');
    for (const finding of result.findings.slice(0, 5)) {
      lines.push(`  - ${finding.description} (${finding.category})`);
      if (finding.match) {
        lines.push(`    Match: "${finding.match.slice(0, 60)}..."`);
      }
    }
    if (result.findings.length > 5) {
      lines.push(`  ... and ${result.findings.length - 5} more`);
    }
  }

  if (result.unicode_findings.length > 0) {
    lines.push('Unicode manipulation:');
    for (const finding of result.unicode_findings) {
      lines.push(`  - ${finding.description} (${finding.count} occurrences)`);
    }
  }

  if (result.base64_findings.length > 0) {
    lines.push('Base64 payloads:');
    for (const finding of result.base64_findings) {
      lines.push(`  - ${finding.description}`);
      if (finding.decoded_preview) {
        lines.push(`    Decoded: "${finding.decoded_preview}"`);
      }
    }
  }

  if (result.html_findings.length > 0) {
    lines.push('HTML comment injection:');
    for (const finding of result.html_findings) {
      lines.push(`  - ${finding.description}`);
    }
  }

  if (result.multi_layer_findings.length > 0) {
    lines.push('Multi-layer encoding:');
    for (const finding of result.multi_layer_findings) {
      lines.push(`  - ${finding.description}`);
      if (finding.final_decoded) {
        lines.push(`    Decoded: "${finding.final_decoded}"`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * CLI entry point.
 */
export function main(): void {
  const input = getToolInputFromStdinSync();
  const content = getContentToAnalyze({
    tool_name: input.tool_name,
    tool_input: input.tool_input,
  });

  const { exitCode, result } = validatePromptInjection(content, input.tool_name);

  if (exitCode === EXIT_CODES.HARD_BLOCK) {
    printBlockMessage({
      title: 'PROMPT INJECTION DETECTED',
      message: `Content contains patterns associated with prompt injection attacks.\n\n${formatFindings(result)}`,
      target: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      overrideVar: 'BMAD_ALLOW_INJECTION_CONTENT',
    });
  } else if (result.findings.length > 0 && result.highest_severity === 'INFO') {
    printWarning(
      `Minor injection-like patterns detected (${result.findings.length} findings). ` +
      'These appear benign but are logged for review.'
    );
  }

  process.exit(exitCode);
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith('prompt-injection.js') ||
               process.argv[1]?.endsWith('prompt-injection.ts');
if (isMain) {
  main();
}
