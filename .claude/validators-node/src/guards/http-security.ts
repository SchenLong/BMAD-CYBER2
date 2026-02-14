/**
 * BMAD Guardrails: HTTP Security Validator
 * ==========================================
 * Detects HTTP security misconfigurations including IDOR patterns,
 * missing security headers, default credentials, debug flags, and CORS issues.
 *
 * OWASP Coverage:
 * - A01-101..103: IDOR Detection
 * - A05-101..105: HTTP Security Headers
 * - API8-001: CORS validation
 *
 * Severity Levels:
 * - CRITICAL: Definitive security issue (block)
 * - HIGH: Strong security indicator (block with override)
 * - WARNING: Suspicious pattern (log and warn)
 * - INFO: Informational (context-dependent, allow)
 */

// Type definitions
export interface IDORDetectionResult {
  testId: string;
  subtype: string;
  confidence: number;
}

export interface SecurityHeadersResult {
  isSecure: boolean;
  severity?: string;
  findings: Array<{
    testId: string;
    severity: string;
    message: string;
  }>;
}

export interface DefaultCredsResult {
  isDefault: boolean;
  pattern: string;
  severity: string;
}

export interface DebugFlagsResult {
  hasDebug: boolean;
  findings: Array<{
    testId: string;
    severity: string;
    message: string;
  }>;
}

export interface CORSHeadersResult {
  isSecure: boolean;
  findings: Array<{
    severity: string;
    message: string;
  }>;
}

// =============================================================================
// IDOR Detection (A01-101..103)
// =============================================================================

/**
 * Detect IDOR (Insecure Direct Object Reference) patterns in paths
 *
 * A01-101: Sequential ID enumeration
 * A01-102: GUID/UUID manipulation
 * A01-103: Parameter tampering
 */
export function detectIDOR(
  currentPath: string,
  previousPaths?: string[]
): IDORDetectionResult | null {
  if (!currentPath || typeof currentPath !== 'string') {
    return null;
  }

  // A01-101: Sequential ID enumeration
  if (previousPaths && previousPaths.length > 0) {
    const prevPath = previousPaths[previousPaths.length - 1];

    // Extract numeric IDs from paths
    const currentIdMatch = currentPath.match(/\/(\d+)(?:\/|$)/);
    const prevIdMatch = prevPath?.match(/\/(\d+)(?:\/|$)/);

    if (currentIdMatch && prevIdMatch) {
      const currentId = parseInt(currentIdMatch[1] || '0', 10);
      const prevId = parseInt(prevIdMatch[1] || '0', 10);

      // Check for sequential pattern (difference of 1)
      if (Math.abs(currentId - prevId) === 1) {
        return {
          testId: 'A01-101',
          subtype: 'SEQUENTIAL_ENUMERATION',
          confidence: 0.9,
        };
      }
    }

    // A01-102: UUID manipulation detection
    const currentUuidMatch = currentPath.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i);
    const prevUuidMatch = prevPath?.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i);

    if (currentUuidMatch && prevUuidMatch) {
      const currentUuid = currentUuidMatch[1] ?? '';
      const prevUuid = prevUuidMatch[1] ?? '';

      // Check if UUIDs are similar (only differ by a few hex characters)
      let diffCount = 0;
      for (let i = 0; i < currentUuid.length; i++) {
        const currentChar = currentUuid[i] ?? '';
        const prevChar = prevUuid[i] ?? '';
        if (currentChar && currentChar !== prevChar && currentChar !== '-') {
          diffCount++;
        }
      }

      if (diffCount <= 2) {
        return {
          testId: 'A01-102',
          subtype: 'UUID_MANIPULATION',
          confidence: 0.85,
        };
      }

      // Check for incremented hex pattern
      const currentHex = currentUuid.replace(/-/g, '').slice(-8);
      const prevHex = prevUuid.replace(/-/g, '').slice(-8);
      const currentNum = parseInt(currentHex, 16);
      const prevNum = parseInt(prevHex, 16);

      if (!isNaN(currentNum) && !isNaN(prevNum) && Math.abs(currentNum - prevNum) <= 100) {
        return {
          testId: 'A01-102',
          subtype: 'UUID_MANIPULATION',
          confidence: 0.8,
        };
      }
    }
  }

  // A01-103: Parameter tampering detection (query string with id parameters)
  const queryMatch = currentPath.match(/[?&](id|user_id|target_user_id|resource_id|account_id|customer_id)=/i);
  if (queryMatch) {
    return {
      testId: 'A01-103',
      subtype: 'PARAMETER_TAMPERING',
      confidence: 0.75,
    };
  }

  return null;
}

// =============================================================================
// Security Headers Validation (A05-101..105)
// =============================================================================

/**
 * Validate HTTP security headers
 *
 * A05-101: Content-Security-Policy
 * A05-102: X-Frame-Options
 * A05-103: X-Content-Type-Options
 */
export function validateSecurityHeaders(
  headers: Record<string, string>
): SecurityHeadersResult {
  const findings: Array<{
    testId: string;
    severity: string;
    message: string;
  }> = [];

  if (!headers || typeof headers !== 'object') {
    return {
      isSecure: false,
      findings: [{
        testId: 'A05-GENERIC',
        severity: 'CRITICAL',
        message: 'No headers provided',
      }],
    };
  }

  // A05-101: Content-Security-Policy
  const csp = headers['Content-Security-Policy'] || headers['content-security-policy'];
  if (!csp) {
    findings.push({
      testId: 'A05-101',
      severity: 'CRITICAL',
      message: 'Content-Security-Policy header missing',
    });
  } else {
    // Check for unsafe-inline without nonce
    if (csp.includes("'unsafe-inline'") && !csp.includes("'nonce-")) {
      findings.push({
        testId: 'A05-101',
        severity: 'WARNING',
        message: 'CSP uses unsafe-inline without nonce',
      });
    }
    // Check for wildcard
    if (csp.includes("default-src *") || csp.includes("default-src '*'")) {
      findings.push({
        testId: 'A05-101',
        severity: 'WARNING',
        message: 'CSP uses wildcard source',
      });
    }
  }

  // A05-102: X-Frame-Options
  const xFrameOptions = headers['X-Frame-Options'] || headers['x-frame-options'];
  if (!xFrameOptions) {
    findings.push({
      testId: 'A05-102',
      severity: 'WARNING',
      message: 'X-Frame-Options header missing (clickjacking risk)',
    });
  } else {
    const value = xFrameOptions.toLowerCase();
    if (value !== 'deny' && value !== 'sameorigin' && !value.startsWith('allow-from')) {
      findings.push({
        testId: 'A05-102',
        severity: 'INFO',
        message: 'X-Frame-Options has non-standard value',
      });
    }
    // ALLOW-FROM is deprecated
    if (value.startsWith('allow-from')) {
      findings.push({
        testId: 'A05-102',
        severity: 'INFO',
        message: 'X-Frame-Options ALLOW-FROM is deprecated',
      });
    }
  }

  // A05-103: X-Content-Type-Options
  const xContentTypeOptions = headers['X-Content-Type-Options'] || headers['x-content-type-options'];
  if (!xContentTypeOptions) {
    findings.push({
      testId: 'A05-103',
      severity: 'INFO',
      message: 'X-Content-Type-Options header missing',
    });
  } else if (xContentTypeOptions.toLowerCase() !== 'nosniff') {
    findings.push({
      testId: 'A05-103',
      severity: 'WARNING',
      message: 'X-Content-Type-Options has incorrect value',
    });
  }

  // A05-104: Strict-Transport-Security
  const hsts = headers['Strict-Transport-Security'] || headers['strict-transport-security'];
  if (!hsts) {
    findings.push({
      testId: 'A05-104',
      severity: 'WARNING',
      message: 'Strict-Transport-Security header missing',
    });
  }

  // A05-105: Permissions-Policy
  const permissionsPolicy = headers['Permissions-Policy'] || headers['permissions-policy'];
  if (!permissionsPolicy) {
    findings.push({
      testId: 'A05-105',
      severity: 'INFO',
      message: 'Permissions-Policy header missing',
    });
  }

  // Determine overall severity from findings
  let overallSeverity = 'INFO';
  if (findings.some(f => f.severity === 'CRITICAL')) {
    overallSeverity = 'CRITICAL';
  } else if (findings.some(f => f.severity === 'WARNING')) {
    overallSeverity = 'WARNING';
  }

  return {
    isSecure: findings.filter(f => f.severity === 'CRITICAL').length === 0,
    severity: overallSeverity,
    findings,
  };
}

// =============================================================================
// Default Credentials Detection (A05-104)
// =============================================================================

/**
 * Check for default credentials in strings
 */
export function checkDefaultCredentials(input: string): DefaultCredsResult {
  if (!input || typeof input !== 'string') {
    return { isDefault: false, pattern: '', severity: 'INFO' };
  }

  const defaultPatterns = [
    { pattern: /admin\s*[:=]\s*admin/i, severity: 'CRITICAL', name: 'admin:admin' },
    { pattern: /admin\s*[:=]\s*password/i, severity: 'CRITICAL', name: 'admin:password' },
    { pattern: /root\s*[:=]\s*root/i, severity: 'CRITICAL', name: 'root:root' },
    { pattern: /root\s*[:=]\s*password/i, severity: 'CRITICAL', name: 'root:password' },
    { pattern: /admin\s*[:=]\s*123456/i, severity: 'CRITICAL', name: 'admin:123456' },
    { pattern: /username\s*=\s*admin\s*&\s*password\s*=\s*password/i, severity: 'CRITICAL', name: 'username=admin&password=password' },
    { pattern: /user\s*[:=]\s*admin\s*&\s*pass\s*[:=]\s*admin/i, severity: 'CRITICAL', name: 'user=admin&pass=admin' },
  ];

  for (const { pattern, severity, name } of defaultPatterns) {
    if (pattern.test(input)) {
      return {
        isDefault: true,
        pattern: name,
        severity,
      };
    }
  }

  return {
    isDefault: false,
    pattern: '',
    severity: 'INFO',
  };
}

// =============================================================================
// Debug Flags Detection (A05-105)
// =============================================================================

/**
 * Check for debug/development configuration flags
 */
export function checkDebugFlags(input: string): DebugFlagsResult {
  if (!input || typeof input !== 'string') {
    return { hasDebug: false, findings: [] };
  }

  const findings: Array<{ testId: string; severity: string; message: string }> = [];

  const debugPatterns = [
    { pattern: /DEBUG\s*=\s*true/i, testId: 'A05-105', severity: 'CRITICAL', message: 'DEBUG=true enabled' },
    { pattern: /NODE_ENV\s*=\s*development/i, testId: 'A05-105', severity: 'WARNING', message: 'NODE_ENV=development' },
    { pattern: /APP_ENV\s*=\s*development/i, testId: 'A05-105', severity: 'WARNING', message: 'APP_ENV=development' },
    { pattern: /RAILS_ENV\s*=\s*development/i, testId: 'A05-105', severity: 'WARNING', message: 'RAILS_ENV=development' },
    { pattern: /FLASK_ENV\s*=\s*development/i, testId: 'A05-105', severity: 'WARNING', message: 'FLASK_ENV=development' },
    { pattern: /XDEBUG_SESSION|XDEBUG_PROFILE/i, testId: 'A05-105', severity: 'CRITICAL', message: 'Xdebug session detected' },
    { pattern: /PHP_IDE_CONFIG/i, testId: 'A05-105', severity: 'CRITICAL', message: 'PHP IDE config detected' },
    { pattern: /WP_DEBUG\s*=\s*true/i, testId: 'A05-105', severity: 'CRITICAL', message: 'WordPress debug enabled' },
    { pattern: /display_errors\s*=\s*[1on]/i, testId: 'A05-105', severity: 'CRITICAL', message: 'PHP display_errors enabled' },
    { pattern: /error_reporting\s*=\s*E_ALL/i, testId: 'A05-105', severity: 'WARNING', message: 'PHP error_reporting set to E_ALL' },
  ];

  for (const { pattern, testId, severity, message } of debugPatterns) {
    if (pattern.test(input)) {
      findings.push({ testId, severity, message });
    }
  }

  return {
    hasDebug: findings.length > 0,
    findings,
  };
}

// =============================================================================
// CORS Headers Validation (API8-001)
// =============================================================================

/**
 * Validate CORS headers
 *
 * API8-001: CORS wildcard origin detection
 */
export function validateCORSHeaders(
  headers: Record<string, string>
): CORSHeadersResult {
  const findings: Array<{ severity: string; message: string }> = [];

  if (!headers || typeof headers !== 'object') {
    return {
      isSecure: false,
      findings: [{ severity: 'CRITICAL', message: 'No headers provided' }],
    };
  }

  const allowOrigin = headers['Access-Control-Allow-Origin'] || headers['access-control-allow-origin'];
  const allowCredentials = headers['Access-Control-Allow-Credentials'] || headers['access-control-allow-credentials'];

  // Check for wildcard origin
  if (allowOrigin === '*') {
    findings.push({
      severity: 'WARNING',
      message: 'CORS allows wildcard origin (*)',
    });

    // CRITICAL: Wildcard with credentials is explicitly insecure
    if (allowCredentials === 'true' || allowCredentials === '1') {
      findings.push({
        severity: 'CRITICAL',
        message: 'CORS wildcard (*) with credentials=true is insecure',
      });
    }
  }

  // Check for null origin (potentially malicious)
  if (allowOrigin === 'null') {
    findings.push({
      severity: 'CRITICAL',
      message: 'CORS allows null origin (potential reverse proxy attack)',
    });
  }

  // Any findings means not fully secure
  return {
    isSecure: findings.length === 0,
    findings,
  };
}

// =============================================================================
// Export all functions
// =============================================================================

export default {
  detectIDOR,
  validateSecurityHeaders,
  checkDefaultCredentials,
  checkDebugFlags,
  validateCORSHeaders,
};
