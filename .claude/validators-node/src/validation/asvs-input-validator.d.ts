/**
 * BMAD Security: ASVS Input Validation
 * =====================================
 *
 * OWASP ASVS v4.0 - V5: Input Validation Verification
 *
 * Provides comprehensive input validation functions implementing:
 * - V5-001: Required field validation
 * - V5-002: Numeric range validation
 * - V5-003: String length validation
 * - V5-004: File type validation
 * - V5-005: JSON schema validation
 * - V5-006: Unicode normalization
 *
 * @module asvs-input-validator
 */
/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    error: string | null;
    metadata?: Record<string, unknown>;
}
/**
 * Configuration for input validation
 */
export interface ValidationConfig {
    strictMode?: boolean;
    normalizeUnicode?: boolean;
    maxFileSize?: number;
    allowedMimeTypes?: string[];
}
/**
 * Validates required field presence
 *
 * @param input - The input to validate
 * @param trimWhitespace - Whether to trim whitespace before checking (default: true)
 * @returns ValidationResult indicating success or failure
 */
export declare function validateRequiredField(input: unknown, trimWhitespace?: boolean): ValidationResult;
/**
 * Validates numeric value within specified range
 *
 * @param value - The value to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns ValidationResult indicating success or failure
 */
export declare function validateNumericRange(value: unknown, min: number, max: number): ValidationResult;
/**
 * Validates string length within specified bounds
 *
 * @param str - The string to validate
 * @param min - Minimum allowed length (inclusive, default: 0)
 * @param max - Maximum allowed length (inclusive, required)
 * @returns ValidationResult indicating success or failure
 */
export declare function validateStringLength(str: unknown, min: number | undefined, max: number): ValidationResult;
/**
 * Validates file type against allowed extensions
 *
 * @param filename - The filename to validate
 * @param allowedTypes - Array of allowed extensions (e.g., ['.txt', '.pdf'])
 * @returns ValidationResult indicating success or failure
 */
export declare function validateFileType(filename: string, allowedTypes?: string[]): ValidationResult;
/**
 * Validates JSON object against a schema
 *
 * Note: This is a simplified schema validator. For production use,
 * consider using a full JSON Schema validator library.
 *
 * @param json - The JSON object to validate
 * @param schema - The schema definition
 * @returns ValidationResult indicating success or failure
 */
export declare function validateJsonSchema(json: unknown, schema: JsonSchema): ValidationResult;
/**
 * Simple JSON Schema interface
 */
interface JsonSchema {
    type?: 'object' | 'array';
    properties?: Record<string, JsonPropertySchema>;
    required?: string[];
    items?: JsonPropertySchema;
}
interface JsonPropertySchema {
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';
    properties?: Record<string, JsonPropertySchema>;
    required?: string[];
    items?: JsonPropertySchema;
}
/**
 * Validates Unicode normalization
 *
 * @param str - The string to validate
 * @param targetForm - Target normalization form (default: 'NFC')
 * @returns ValidationResult indicating success or failure
 */
export declare function validateUnicodeNormalization(str: unknown, targetForm?: UnicodeNormalizationForm): ValidationResult;
/**
 * Unicode normalization forms
 */
type UnicodeNormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';
/**
 * Validates input for SQL injection patterns
 *
 * @param input - The input to validate
 * @param context - Optional context (e.g., 'code', 'documentation')
 * @returns ValidationResult indicating success or failure
 */
export declare function validateSqlInjection(input: string, context?: string): ValidationResult;
/**
 * Validates input for XSS patterns
 *
 * @param input - The input to validate
 * @param context - Optional context (e.g., 'html', 'code')
 * @returns ValidationResult indicating success or failure
 */
export declare function validateXss(input: string, context?: string): ValidationResult;
/**
 * Validates input for command injection patterns
 *
 * @param input - The input to validate
 * @param context - Optional context
 * @returns ValidationResult indicating success or failure
 */
export declare function validateCommandInjection(input: string, context?: string): ValidationResult;
/**
 * Comprehensive input validation combining all checks
 *
 * @param input - The input to validate
 * @param rules - Validation rules to apply
 * @returns ValidationResult indicating success or failure
 */
export declare function validateInput(input: unknown, rules: ValidationRules): ValidationResult;
/**
 * Validation rules interface
 */
export interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    schema?: JsonSchema;
    context?: string;
    checkSqlInjection?: boolean;
    checkXss?: boolean;
    checkCommandInjection?: boolean;
    normalizeUnicode?: boolean;
}
/**
 * Export all validation functions
 */
declare const _default: {
    validateRequiredField: typeof validateRequiredField;
    validateNumericRange: typeof validateNumericRange;
    validateStringLength: typeof validateStringLength;
    validateFileType: typeof validateFileType;
    validateJsonSchema: typeof validateJsonSchema;
    validateUnicodeNormalization: typeof validateUnicodeNormalization;
    validateSqlInjection: typeof validateSqlInjection;
    validateXss: typeof validateXss;
    validateCommandInjection: typeof validateCommandInjection;
    validateInput: typeof validateInput;
};
export default _default;
