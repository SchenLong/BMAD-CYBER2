/**
 * BMAD Guardrails: Secret Guard Validator
 * ========================================
 * Detects and blocks hardcoded secrets, API keys, and credentials.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation (secrets detected)
 *
 * Security Features:
 * - 30+ API key patterns for major providers
 * - Shannon entropy validation for generic secrets
 * - Example/placeholder content detection
 * - Single-use override tokens with 5-minute timeout
 */
type Confidence = 'critical' | 'high' | 'medium';
interface SecretDetection {
    secretType: string;
    match: string;
    line: string;
    lineNumber: number;
    confidence: Confidence;
}
/**
 * Calculate Shannon entropy of a string.
 * Higher entropy indicates more randomness (likely a real secret).
 */
export declare function calculateEntropy(s: string): number;
/**
 * Check if a value has high entropy (likely a real secret).
 */
export declare function isHighEntropy(value: string, threshold?: number): boolean;
/**
 * Check if the file is an expected secret file (example/template).
 */
export declare function isExpectedSecretFile(filePath: string): boolean;
/**
 * Check if content around a match indicates it's an example/placeholder.
 */
export declare function isExampleContent(content: string, line: string): boolean;
/**
 * Detect secrets in content.
 */
export declare function detectSecrets(content: string): SecretDetection[];
/**
 * Main validation function.
 */
export declare function validateSecretGuard(content: string, filePath: string): number;
/**
 * CLI entry point.
 */
export declare function main(): void;
export {};
