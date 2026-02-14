/**
 * BMAD Guardrails: PII Patterns
 * ==============================
 * Pattern definitions for detecting PII in content.
 * Includes US, EU, and common international patterns.
 */
export type Severity = 'critical' | 'warning' | 'info';
export interface PiiPattern {
    name: string;
    regex: RegExp;
    severity: Severity;
    validator?: (value: string) => boolean;
    contextRequired: boolean;
    redactionMask?: string;
}
export declare const US_PATTERNS: PiiPattern[];
export declare const EU_PATTERNS: PiiPattern[];
export declare const COMMON_PATTERNS: PiiPattern[];
export declare const ALL_PATTERNS: PiiPattern[];
/** Patterns that indicate sensitive context */
export declare const SENSITIVE_CONTEXT_PATTERNS: RegExp[];
/** Patterns that indicate fake/test data */
export declare const FAKE_DATA_INDICATORS: RegExp[];
/** Path indicators for test files */
export declare const TEST_FILE_INDICATORS: string[];
