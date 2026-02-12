/**
 * BMAD Guardrails: PII Patterns
 * ==============================
 * Pattern definitions for detecting PII in content.
 * Includes US, EU, and common international patterns.
 */

import * as validators from './validators.js';

// ============================================================================
// Types
// ============================================================================

export type Severity = 'critical' | 'warning' | 'info';

export interface PiiPattern {
  name: string;
  regex: RegExp;
  severity: Severity;
  validator?: (value: string) => boolean;
  contextRequired: boolean;
  redactionMask?: string;
}

// ============================================================================
// US Patterns
// ============================================================================

export const US_PATTERNS: PiiPattern[] = [
  {
    name: 'SSN',
    regex: /\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b/g,
    severity: 'critical',
    contextRequired: false,
    redactionMask: '***-**-****',
  },
  {
    name: 'US_Phone',
    regex: /\b(?:\+1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    severity: 'warning',
    contextRequired: true,
    redactionMask: '(***) ***-****',
  },
  {
    name: 'Drivers_License_CA',
    regex: /\b[A-Z]\d{7}\b/g,
    severity: 'warning',
    contextRequired: true,
  },
  {
    // SA-02 LOW: Tightened regex — old pattern /[A-Z]?\d{8,9}/ matched any 8-9 digit number.
    // US passports: letter prefix + exactly 8 digits (since 1981). Card passports: C + 8 digits.
    name: 'US_Passport',
    regex: /\b[A-Z]\d{8}\b/g,
    severity: 'critical',
    contextRequired: true,
  },
  {
    name: 'ABA_Routing',
    regex: /\b(?:0[1-9]|[1-2]\d|3[0-2])\d{7}\b/g,
    severity: 'critical',
    validator: validators.validateAbaRouting,
    contextRequired: true,
  },
  {
    name: 'Medicare_ID',
    regex: /\b[1-9][A-Z][A-Z0-9]\d-?[A-Z][A-Z0-9]\d-?[A-Z]{2}\d{2}\b/g,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'ITIN',
    regex: /\b9\d{2}[-\s]?[78]\d[-\s]?\d{4}\b/g,
    severity: 'critical',
    contextRequired: false,
  },
];

// ============================================================================
// EU Patterns
// ============================================================================

export const EU_PATTERNS: PiiPattern[] = [
  {
    name: 'IBAN',
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g,
    severity: 'critical',
    validator: validators.validateIban,
    contextRequired: false,
  },
  {
    name: 'BIC_SWIFT',
    regex: /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    severity: 'warning',
    contextRequired: true,
  },
  {
    name: 'UK_NINO',
    regex: /\b[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'UK_NHS',
    regex: /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/g,
    severity: 'critical',
    validator: validators.validateNhsNumber,
    contextRequired: true,
  },
  {
    name: 'German_Tax_ID',
    regex: /\b\d{11}\b/g,
    severity: 'critical',
    validator: validators.validateGermanTaxId,
    contextRequired: true,
  },
  {
    name: 'German_Social_Insurance',
    regex: /\b\d{2}[0-3]\d[0-1]\d{2}\d[A-Z]\d{3}\d\b/g,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'French_NIR',
    regex: /\b[12]\s?\d{2}\s?(?:0[1-9]|1[0-2]|[2-9]\d)\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'Spanish_DNI',
    regex: /\b\d{8}[A-Z]\b/gi,
    severity: 'critical',
    validator: validators.validateSpanishDni,
    contextRequired: false,
  },
  {
    name: 'Spanish_NIE',
    regex: /\b[XYZ]\d{7}[A-Z]\b/gi,
    severity: 'critical',
    validator: validators.validateSpanishNie,
    contextRequired: false,
  },
  {
    name: 'Italian_Codice_Fiscale',
    regex: /\b[A-Z]{6}\d{2}[A-EHLMPRST][0-3]\d[A-Z]\d{3}[A-Z]\b/gi,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'Dutch_BSN',
    regex: /\b\d{9}\b/g,
    severity: 'critical',
    validator: validators.validateDutchBsn,
    contextRequired: true,
  },
  {
    name: 'Belgian_National',
    regex: /\b\d{2}[.\s]?\d{2}[.\s]?\d{2}[-.\s]?\d{3}[-.\s]?\d{2}\b/g,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'Polish_PESEL',
    regex: /\b\d{11}\b/g,
    severity: 'critical',
    validator: validators.validatePolishPesel,
    contextRequired: true,
  },
  {
    name: 'Portuguese_NIF',
    regex: /\b[1-9]\d{8}\b/g,
    severity: 'critical',
    validator: validators.validatePortugueseNif,
    contextRequired: true,
  },
  {
    name: 'Austrian_Social_Insurance',
    regex: /\b\d{4}[0-3]\d[01]\d{2}\d\b/g,
    severity: 'critical',
    contextRequired: true,
  },
  {
    name: 'Swedish_Personnummer',
    regex: /\b\d{6}[-+]?\d{4}\b/g,
    severity: 'critical',
    validator: validators.validateSwedishPersonnummer,
    contextRequired: false,
  },
  {
    name: 'Finnish_HETU',
    regex: /\b\d{6}[-+A]\d{3}[0-9A-Y]\b/gi,
    severity: 'critical',
    contextRequired: false,
  },
  {
    name: 'EU_VAT',
    regex: /\b(?:ATU|BE0?|BG|CY|CZ|DE|DK|EE|EL|ES[A-Z]?|FI|FR[A-Z0-9]{2}|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)[0-9A-Z]{8,12}\b/g,
    severity: 'warning',
    contextRequired: true,
  },
];

// ============================================================================
// Common Patterns
// ============================================================================

export const COMMON_PATTERNS: PiiPattern[] = [
  {
    name: 'Credit_Card',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    severity: 'critical',
    validator: validators.validateLuhn,
    contextRequired: false,
    redactionMask: '**** **** **** ****',
  },
  {
    name: 'Email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    severity: 'info',
    contextRequired: true,
  },
  {
    name: 'IP_Address',
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    severity: 'info',
    contextRequired: true,
  },
  {
    name: 'DOB',
    regex: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g,
    severity: 'warning',
    contextRequired: true,
  },
  {
    name: 'MAC_Address',
    regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
    severity: 'info',
    contextRequired: true,
  },
];

// ============================================================================
// Combined Patterns
// ============================================================================

export const ALL_PATTERNS: PiiPattern[] = [
  ...US_PATTERNS,
  ...EU_PATTERNS,
  ...COMMON_PATTERNS,
];

// ============================================================================
// Context Detection Patterns
// ============================================================================

/** Patterns that indicate sensitive context */
export const SENSITIVE_CONTEXT_PATTERNS: RegExp[] = [
  /\b(?:personal|private|confidential|sensitive)\b/i,
  /(?:patient|client|customer|employee|user)\s+(?:data|info|record|detail)/i,
  /(?:medical|health|financial|banking)\s+(?:record|data|info)/i,
  /(?:ssn|social\s*security|tax\s*id|national\s*id)/i,
  /(?:passport|driver.?s?\s*licen[sc]e|birth\s*date|dob)\b/i,
  /(?:credit\s*card|bank\s*account|routing\s*number|iban)\b/i,
  /(?:address|phone|email|contact)\s+(?:info|detail|list)/i,
  /(?:gdpr|pii|hipaa|pci[-\s]?dss)\b/i,
];

/** Patterns that indicate fake/test data */
export const FAKE_DATA_INDICATORS: RegExp[] = [
  /\b(?:fake|test|mock|dummy|sample|example|placeholder)\b/i,
  /\b(?:john\s*doe|jane\s*doe|test\s*user)\b/i,
  /\b(?:xxx+|000-00-0000|123-45-6789)\b/i,
  /\b(?:your[-_]?(?:ssn|id|number))\b/i,
  /(?:<replace>|<your[-_]|insert[-_]here)/i,
];

/** Path indicators for test files */
export const TEST_FILE_INDICATORS: string[] = [
  'test_data',
  'mock_data',
  'sample_data',
  'fixtures',
  'seeds',
  '.example',
  '.sample',
  '.template',
  'fake_',
  '_fake',
  'dummy_',
  '_dummy',
];
