/**
 * BMAD Guardrails: XSS (Cross-Site Scripting) Safety Validator
 * ==============================================================
 * Detects XSS patterns in content to prevent cross-site scripting attacks.
 *
 * OWASP Coverage (A03-201..208):
 * - A03-201: Reflected XSS detection
 * - A03-202: Stored XSS detection
 * - A03-203: DOM-based XSS detection
 * - A03-204: Event handler XSS detection
 * - A03-205: Polyglot XSS detection
 * - A03-206: CSS expression XSS detection
 * - A03-207: SVG XSS detection
 * - A03-208: JavaScript URI XSS detection
 *
 * Severity Levels:
 * - CRITICAL: Definitive XSS payload (block)
 * - HIGH: Strong XSS indicator (block with override)
 * - WARNING: Suspicious pattern (log and warn)
 * - INFO: Informational (context-dependent, allow)
 */
import type { XSSDetectionResult } from '../types/xss-types.js';
/**
 * Context-aware patterns that may be legitimate in certain contexts
 */
declare const CONTEXTUAL_PATTERNS: RegExp[];
/**
 * Known safe HTML elements and attributes
 */
declare const SAFE_HTML_PATTERNS: RegExp[];
export { CONTEXTUAL_PATTERNS, SAFE_HTML_PATTERNS };
/**
 * Detect XSS patterns in content
 *
 * @param content - The content to check
 * @param context - Optional context (filename, content type)
 * @returns XSS detection result
 */
export declare function detectXSS(content: string, context?: string): XSSDetectionResult;
/**
 * Validate content for XSS - strict mode (blocks on any match)
 */
export declare function validateXSSStrict(content: string, context?: string): {
    allowed: boolean;
    result: XSSDetectionResult;
};
/**
 * Validate content for XSS - permissive mode (warns on suspicious)
 */
export declare function validateXSSPermissive(content: string, context?: string): {
    allowed: boolean;
    result: XSSDetectionResult;
};
/**
 * Get detailed report of XSS findings
 */
export declare function getXSSReport(content: string, context?: string): string;
