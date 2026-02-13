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
 * Default validation configuration
 */
const DEFAULT_CONFIG: ValidationConfig = {
  strictMode: true,
  normalizeUnicode: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['.txt', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.json'],
};

/**
 * Dangerous file extensions that should always be blocked
 */
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.sh', '.bash', '.zsh', '.ps1', '.psm1', '.psd1', '.dll', '.sys',
  '.drv', '.cpl', '.msi', '.msp', '.msm', '.app', '.deb', '.rpm',
  '.dmg', '.pkg', '.run', '.bin', '.elf', '.ocx', '.vxd', '.wsc',
  '.wsf', '.jsp', '.php', '.php3', '.php4', '.php5', '.phtml', '.cgi',
]);

/**
 * SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\bunion\s+(all\s+)?select\b)/i,
  /(\bselect\s+.*\s+from\s+)/i,
  /(\binsert\s+into\b)/i,
  /(\bupdate\s+\w+\s+set\b)/i,
  /(\bdelete\s+from\b)/i,
  /(\bdrop\s+(table|database|index)\b)/i,
  /(\bexec\s*\(|\bexecute\s*\()/i,
  /(\'\s*;\s*\w+)/i, // ' OR 1=1 style
  /(\'\s*or\s+\'?\w+\'?\s*=\s*\'?\w+\'?)/i, // 'or'1'='1'
  /(\'\s*and\s+\d+\s*=\s*\d+)/i,
  /(--|\#)/, // SQL comments
];

/**
 * XSS patterns
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /<embed[^>]*>/gi,
  /<object[^>]*>/gi,
];

/**
 * Command injection patterns
 */
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$()]/, // Command separators
  /\>\//, // Path traversal in command
  /\/etc\//, // Unix system paths
  /\\windows\\/, // Windows system paths
];

/**
 * Zero-width and invisible Unicode characters
 */
const INVISIBLE_CHAR_PATTERNS = [
  '\u200B', // Zero-width space
  '\u200C', // Zero-width non-joiner
  '\u200D', // Zero-width joiner
  '\uFEFF', // Zero-width no-break space
  '\u00AD', // Soft hyphen
  '\u2060', // Word joiner
];

/**
 * Unicode homograph character mappings
 */
const HOMOGRAPHS: Record<string, string[]> = {
  'a': ['\u0430', '\u0250'], // Cyrillic a, Latin alpha
  'e': ['\u0435', '\u0454'], // Cyrillic e, Ukrainian e
  'o': ['\u043E', '\u03BF'], // Cyrillic o, Greek omicron
  'p': ['\u0440'], // Cyrillic r
  'i': ['\u0456', '\u0131'], // Ukrainian i, dotless i
  'l': ['\u043B', '\u0142'], // Cyrillic l, l with stroke
  'c': ['\u0441'], // Cyrillic s (looks like c)
  'y': ['\u0443'], // Cyrillic u
  'x': ['\u0445'], // Cyrillic kh
  'v': ['\u0432'], // Cyrillic v
};

/**
 * Validates required field presence
 *
 * @param input - The input to validate
 * @param trimWhitespace - Whether to trim whitespace before checking (default: true)
 * @returns ValidationResult indicating success or failure
 */
export function validateRequiredField(
  input: unknown,
  trimWhitespace = true
): ValidationResult {
  if (input === null || input === undefined) {
    return {
      valid: false,
      error: 'Field is required but received null or undefined',
    };
  }

  if (typeof input !== 'string') {
    // For non-string types (number, boolean, object), presence is enough
    return {
      valid: true,
      error: null,
    };
  }

  const value = trimWhitespace ? input.trim() : input;

  if (value === '') {
    return {
      valid: false,
      error: 'Field is required but received empty string',
      metadata: { originalLength: input.length, trimmed: trimWhitespace },
    };
  }

  // Check for whitespace-only strings (after trim)
  if (value.length === 0) {
    return {
      valid: false,
      error: 'Field is required but received whitespace only',
      metadata: { originalLength: input.length },
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates numeric value within specified range
 *
 * @param value - The value to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns ValidationResult indicating success or failure
 */
export function validateNumericRange(
  value: unknown,
  min: number,
  max: number
): ValidationResult {
  // Type validation
  if (typeof value !== 'number') {
    return {
      valid: false,
      error: `Expected number but received ${typeof value}`,
      metadata: { receivedType: typeof value, receivedValue: value },
    };
  }

  // NaN check
  if (Number.isNaN(value)) {
    return {
      valid: false,
      error: 'Received NaN (Not a Number)',
    };
  }

  // Infinity check
  if (!Number.isFinite(value)) {
    return {
      valid: false,
      error: 'Received infinite value',
      metadata: { value: String(value) },
    };
  }

  // Range validation
  if (value < min) {
    return {
      valid: false,
      error: `Value ${value} is below minimum ${min}`,
      metadata: { value, min, max },
    };
  }

  if (value > max) {
    return {
      valid: false,
      error: `Value ${value} exceeds maximum ${max}`,
      metadata: { value, min, max },
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates string length within specified bounds
 *
 * @param str - The string to validate
 * @param min - Minimum allowed length (inclusive, default: 0)
 * @param max - Maximum allowed length (inclusive, required)
 * @returns ValidationResult indicating success or failure
 */
export function validateStringLength(
  str: unknown,
  min = 0,
  max: number
): ValidationResult {
  // Type validation
  if (typeof str !== 'string') {
    return {
      valid: false,
      error: `Expected string but received ${typeof str}`,
      metadata: { receivedType: typeof str },
    };
  }

  // Count characters using spread operator for Unicode support
  // Note: spread operator counts UTF-16 code units, not full grapheme clusters
  // For emoji like 👋, this counts as 1 UTF-16 code unit
  // For combining sequences, they may be counted separately
  const length = Array.from(str).length;

  if (length < min) {
    return {
      valid: false,
      error: `String length ${length} is below minimum ${min}`,
      metadata: { length, min, max },
    };
  }

  if (length > max) {
    return {
      valid: false,
      error: `String length ${length} exceeds maximum ${max}`,
      metadata: { length, min, max },
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates file type against allowed extensions
 *
 * @param filename - The filename to validate
 * @param allowedTypes - Array of allowed extensions (e.g., ['.txt', '.pdf'])
 * @returns ValidationResult indicating success or failure
 */
export function validateFileType(
  filename: string,
  allowedTypes: string[] = DEFAULT_CONFIG.allowedMimeTypes!
): ValidationResult {
  if (!filename || typeof filename !== 'string') {
    return {
      valid: false,
      error: 'Invalid filename',
    };
  }

  // Extract extension (handle double extensions like .tar.gz)
  const parts = filename.toLowerCase().split('.');
  if (parts.length < 2) {
    return {
      valid: false,
      error: 'File has no extension',
      metadata: { filename },
    };
  }

  // Get the last extension (primary file type)
  const primaryExt = '.' + parts[parts.length - 1];

  // Check if extension is dangerous regardless of allowed list
  if (DANGEROUS_EXTENSIONS.has(primaryExt)) {
    return {
      valid: false,
      error: `Dangerous file type not allowed: ${primaryExt}`,
      metadata: { extension: primaryExt, reason: 'Executable or script file' },
    };
  }

  // Normalize allowed types for case-insensitive comparison
  const allowedNormalized = new Set(allowedTypes.map((t) => t.toLowerCase()));

  if (!allowedNormalized.has(primaryExt)) {
    return {
      valid: false,
      error: `File type ${primaryExt} not in allowed list`,
      metadata: {
        extension: primaryExt,
        allowed: Array.from(allowedNormalized),
      },
    };
  }

  // Check for double-extension attacks (file.jpg.exe)
  if (parts.length > 2) {
    const secondExt = '.' + parts[parts.length - 2];
    if (DANGEROUS_EXTENSIONS.has(secondExt)) {
      return {
        valid: false,
        error: `Potential double-extension attack detected: ${secondExt}${primaryExt}`,
        metadata: { fullExtension: `${secondExt}${primaryExt}` },
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}

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
export function validateJsonSchema(
  json: unknown,
  schema: JsonSchema
): ValidationResult {
  // Type validation
  if (typeof json !== 'object' || json === null) {
    return {
      valid: false,
      error: `Expected object but received ${typeof json}`,
      metadata: { received: String(json) },
    };
  }

  // Check required properties
  if (schema.required && Array.isArray(schema.required)) {
    for (const prop of schema.required) {
      if (!(prop in json)) {
        return {
          valid: false,
          error: `Missing required property: ${prop}`,
          metadata: { required: schema.required },
        };
      }
    }
  }

  // If no required properties specified, but object is empty and schema has properties
  if (schema.properties && Object.keys(json).length === 0 && schema.required?.length === 0) {
    // Empty object might be valid, continue
  }

  // Validate properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propName in json) {
        const value = (json as Record<string, unknown>)[propName];
        const propResult = validateValueAgainstSchema(value, propSchema);
        if (!propResult.valid) {
          return {
            valid: false,
            error: `Property '${propName}' validation failed: ${propResult.error}`,
            metadata: { property: propName, value },
          };
        }
      }
    }
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates a value against a property schema
 */
function validateValueAgainstSchema(value: unknown, schema: JsonPropertySchema): ValidationResult {
  // Type validation
  if (schema.type) {
    const expectedType = schema.type;
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (actualType !== expectedType) {
      // Allow number/integer coercion
      if (expectedType === 'integer' && actualType === 'number') {
        if (!Number.isInteger(value)) {
          return {
            valid: false,
            error: `Expected integer but received float`,
            metadata: { value },
          };
        }
      } else {
        return {
          valid: false,
          error: `Expected ${expectedType} but received ${actualType}`,
          metadata: { value },
        };
      }
    }
  }

  // Array item validation
  if (schema.type === 'array' && schema.items && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const itemResult = validateValueAgainstSchema(value[i], schema.items!);
      if (!itemResult.valid) {
        return {
          valid: false,
          error: `Array item ${i} validation failed: ${itemResult.error}`,
          metadata: { index: i, value: value[i] },
        };
      }
    }
  }

  // Nested object validation
  if (schema.type === 'object' && schema.properties && typeof value === 'object' && value !== null) {
    const nestedResult = validateJsonSchema(value, schema as JsonSchema);
    if (!nestedResult.valid) {
      return nestedResult;
    }
  }

  return {
    valid: true,
    error: null,
  };
}

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
export function validateUnicodeNormalization(
  str: unknown,
  targetForm: UnicodeNormalizationForm = 'NFC'
): ValidationResult {
  if (typeof str !== 'string') {
    return {
      valid: false,
      error: `Expected string but received ${typeof str}`,
    };
  }

  // Check if already normalized
  const normalized = str.normalize(targetForm);
  if (str !== normalized) {
    return {
      valid: false,
      error: `String is not normalized to ${targetForm}`,
      metadata: {
        original: str,
        normalized,
        form: targetForm,
      },
    };
  }

  // Check for invisible characters
  for (const invisibleChar of INVISIBLE_CHAR_PATTERNS) {
    if (str.includes(invisibleChar)) {
      return {
        valid: false,
        error: `Contains invisible/zero-width character: U+${invisibleChar.codePointAt(0)?.toString(16).toUpperCase()}`,
        metadata: { character: invisibleChar },
      };
    }
  }

  // Check for potential homograph attacks
  const homographCheck = detectUnicodeHomographs(str);
  if (homographCheck.hasHomographs) {
    return {
      valid: false,
      error: 'Contains potentially misleading Unicode homograph characters',
      metadata: { detected: homographCheck.detected },
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Unicode normalization forms
 */
type UnicodeNormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

/**
 * Detects Unicode homograph characters that could be used for spoofing
 */
function detectUnicodeHomographs(str: string): {
  hasHomographs: boolean;
  detected: Array<{ char: string; looksLike: string; codePoint: string }>;
} {
  const detected: Array<{ char: string; looksLike: string; codePoint: string }> = [];

  for (const char of str) {
    const codePoint = char.codePointAt(0)?.toString(16).toUpperCase() ?? '';

    for (const [looksLike, alternatives] of Object.entries(HOMOGRAPHS)) {
      if (alternatives.includes(char)) {
        detected.push({ char, looksLike, codePoint });
        break;
      }
    }
  }

  return {
    hasHomographs: detected.length > 0,
    detected,
  };
}

/**
 * Validates input for SQL injection patterns
 *
 * @param input - The input to validate
 * @param context - Optional context (e.g., 'code', 'documentation')
 * @returns ValidationResult indicating success or failure
 */
export function validateSqlInjection(input: string, context?: string): ValidationResult {
  if (context === 'code' || context === 'documentation') {
    // Allow SQL keywords in code/documentation context
    return { valid: true, error: null };
  }

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Potential SQL injection detected',
        metadata: { pattern: pattern.source },
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates input for XSS patterns
 *
 * @param input - The input to validate
 * @param context - Optional context (e.g., 'html', 'code')
 * @returns ValidationResult indicating success or failure
 */
export function validateXss(input: string, context?: string): ValidationResult {
  if (context === 'code' || context === 'documentation') {
    // Allow script tags in code context
    return { valid: true, error: null };
  }

  for (const pattern of XSS_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      return {
        valid: false,
        error: 'Potential XSS payload detected',
        metadata: { match: matches[0] },
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validates input for command injection patterns
 *
 * @param input - The input to validate
 * @param context - Optional context
 * @returns ValidationResult indicating success or failure
 */
export function validateCommandInjection(input: string, context?: string): ValidationResult {
  if (context === 'code' || context === 'documentation') {
    return { valid: true, error: null };
  }

  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'Potential command injection detected',
        metadata: { pattern: pattern.source },
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Comprehensive input validation combining all checks
 *
 * @param input - The input to validate
 * @param rules - Validation rules to apply
 * @returns ValidationResult indicating success or failure
 */
export function validateInput(
  input: unknown,
  rules: ValidationRules
): ValidationResult {
  const errors: string[] = [];

  // Required field check
  if (rules.required) {
    const requiredResult = validateRequiredField(input);
    if (!requiredResult.valid) {
      errors.push(`Required: ${requiredResult.error}`);
    }
  }

  // Only continue validation if input exists
  if (input === null || input === undefined || input === '') {
    if (errors.length > 0) {
      return { valid: false, error: errors.join('; ') };
    }
    return { valid: true, error: null };
  }

  // Type-specific validation
  if (typeof input === 'string') {
    // String length
    if (rules.minLength !== undefined || rules.maxLength !== undefined) {
      const lengthResult = validateStringLength(
        input,
        rules.minLength ?? 0,
        rules.maxLength ?? Number.MAX_SAFE_INTEGER
      );
      if (!lengthResult.valid) {
        errors.push(lengthResult.error!);
      }
    }

    // Pattern matching
    if (rules.pattern && !rules.pattern.test(input)) {
      errors.push(`Does not match required pattern: ${rules.pattern.source}`);
    }

    // SQL injection check
    if (rules.checkSqlInjection) {
      const sqlResult = validateSqlInjection(input, rules.context);
      if (!sqlResult.valid) {
        errors.push(sqlResult.error!);
      }
    }

    // XSS check
    if (rules.checkXss) {
      const xssResult = validateXss(input, rules.context);
      if (!xssResult.valid) {
        errors.push(xssResult.error!);
      }
    }

    // Command injection check
    if (rules.checkCommandInjection) {
      const cmdResult = validateCommandInjection(input, rules.context);
      if (!cmdResult.valid) {
        errors.push(cmdResult.error!);
      }
    }

    // Unicode normalization
    if (rules.normalizeUnicode) {
      const unicodeResult = validateUnicodeNormalization(input);
      if (!unicodeResult.valid) {
        errors.push(unicodeResult.error!);
      }
    }
  }

  if (typeof input === 'number') {
    // Numeric range
    if (rules.min !== undefined || rules.max !== undefined) {
      const rangeResult = validateNumericRange(
        input,
        rules.min ?? Number.MIN_SAFE_INTEGER,
        rules.max ?? Number.MAX_SAFE_INTEGER
      );
      if (!rangeResult.valid) {
        errors.push(rangeResult.error!);
      }
    }
  }

  if (typeof input === 'object' && input !== null) {
    // JSON schema validation
    if (rules.schema) {
      const schemaResult = validateJsonSchema(input, rules.schema);
      if (!schemaResult.valid) {
        errors.push(schemaResult.error!);
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
      metadata: { errors },
    };
  }

  return {
    valid: true,
    error: null,
  };
}

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
export default {
  validateRequiredField,
  validateNumericRange,
  validateStringLength,
  validateFileType,
  validateJsonSchema,
  validateUnicodeNormalization,
  validateSqlInjection,
  validateXss,
  validateCommandInjection,
  validateInput,
};
