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
import { type Severity } from './patterns.js';
export interface PiiDetection {
    patternName: string;
    match: string;
    line: string;
    lineNumber: number;
    severity: Severity;
}
/**
 * Check if a file path indicates a test/mock data file.
 */
export declare function isTestFile(filePath: string): boolean;
/**
 * Check if the content/line is in a sensitive context.
 * Used for patterns that have contextRequired: true.
 */
export declare function isSensitiveContext(content: string, line: string): boolean;
/**
 * Check if content around a match indicates fake/test data.
 */
export declare function isFakeData(content: string, line: string): boolean;
/**
 * Detect PII in content.
 */
export declare function detectPii(content: string): PiiDetection[];
/**
 * Main validation function.
 */
export declare function validatePiiGuard(content: string, filePath: string): number;
/**
 * CLI entry point.
 */
export declare function main(): void;
export * from './validators.js';
export * from './patterns.js';
