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
import { type Severity } from '../types/index.js';
import { normalizeText, detectHiddenUnicode } from './text-normalizer.js';
import type { UnicodeFinding } from './text-normalizer.js';
import { detectPatterns, type PatternFinding } from './pattern-engine.js';
import { type ReformulationFinding } from './reformulation-detector.js';
import { type BoundaryFinding } from './boundary-detector.js';
import { type MultilingualFinding } from './multilingual-patterns.js';
export { detectPatterns };
export type { PatternFinding };
export { normalizeText, detectHiddenUnicode };
export type { UnicodeFinding };
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
 * Detect and iteratively decode multi-layer encoded content.
 */
export declare function detectMultiLayerEncoding(content: string): MultiLayerEncodingFinding[];
/**
 * Detect base64 encoded payloads.
 */
export declare function detectBase64Payloads(text: string): Base64Finding[];
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
export declare function detectHtmlCommentInjection(text: string): HtmlCommentFinding[];
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
export declare function analyzeContent(content: string): AnalysisResult;
/**
 * Validate content for prompt injection.
 */
export declare function validatePromptInjection(content: string, toolName: string): {
    exitCode: number;
    result: AnalysisResult;
};
/**
 * CLI entry point.
 */
export declare function main(): void;
