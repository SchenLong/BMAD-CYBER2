/**
 * Type definitions for XSS Safety Validator
 */

export interface XSSDetectionResult {
  hasXSS: boolean;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  patterns: Array<{
    pattern: string;
    category: string;
    testId: string;
    line?: number;
  }>;
  message: string;
}

export type Severity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
