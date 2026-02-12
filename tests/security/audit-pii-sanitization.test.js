/**
 * SA-02: Audit Log PII Sanitization Tests
 * ========================================
 * Tests that PII (emails, SSNs, phone numbers, IPs, credit cards)
 * is redacted from audit log entries before hash computation.
 *
 * Risk: R-012 (CVSS 4.0)
 * Remediation: REM-005
 */

import { describe, expect, it } from 'vitest';
import crypto from 'crypto';

// PII patterns (must match audit-logger.ts PII_PATTERNS)
const PII_PATTERNS = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[REDACTED-EMAIL]' },
  { pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, replacement: '[REDACTED-SSN]' },
  { pattern: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[REDACTED-PHONE]' },
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[REDACTED-IP]' },
  { pattern: /\b[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){7}\b/g, replacement: '[REDACTED-IPV6]' },
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[REDACTED-CC]' },
];

/**
 * Mirror of TamperEvidentAuditLogger.sanitizePII()
 */
function sanitizePII(value) {
  if (!value || typeof value !== 'string') return value;
  let result = value;
  for (const { pattern, replacement } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Mirror of TamperEvidentAuditLogger.sanitizeObject()
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizePII(obj);
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = sanitizeObject(val);
  }
  return result;
}

/**
 * Deterministic JSON stringify (from SA-04)
 */
function deterministicStringify(obj) {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (obj instanceof Date) return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return `[${  obj.map(item => deterministicStringify(item)).join(',')  }]`;
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = deterministicStringify(obj[key]);
    return `${JSON.stringify(key)  }:${  value}`;
  });
  return `{${  pairs.join(',')  }}`;
}

describe('Audit Log PII Sanitization (SA-02)', () => {

  describe('Email redaction', () => {
    it('should redact email addresses', () => {
      const result = sanitizePII('User john.doe@example.com logged in');
      expect(result).toBe('User [REDACTED-EMAIL] logged in');
      expect(result).not.toContain('john.doe@example.com');
    });

    it('should redact multiple email addresses', () => {
      const result = sanitizePII('Sent from admin@corp.com to user@test.org');
      expect(result).not.toContain('admin@corp.com');
      expect(result).not.toContain('user@test.org');
      expect(result.match(/\[REDACTED-EMAIL\]/g)).toHaveLength(2);
    });

    it('should handle email with dots and plus signs', () => {
      const result = sanitizePII('Contact: first.last+tag@subdomain.example.co.uk');
      expect(result).toContain('[REDACTED-EMAIL]');
      expect(result).not.toContain('first.last');
    });
  });

  describe('SSN redaction', () => {
    it('should redact SSN with dashes', () => {
      const result = sanitizePII('SSN: 123-45-6789');
      expect(result).toContain('[REDACTED-SSN]');
      expect(result).not.toContain('123-45-6789');
    });

    it('should redact SSN without dashes', () => {
      const result = sanitizePII('SSN: 123456789');
      expect(result).toContain('[REDACTED-SSN]');
      expect(result).not.toContain('123456789');
    });
  });

  describe('Phone number redaction', () => {
    it('should redact US phone numbers', () => {
      const result = sanitizePII('Call 555-123-4567');
      expect(result).toContain('[REDACTED-PHONE]');
      expect(result).not.toContain('555-123-4567');
    });

    it('should redact phone with area code in parens', () => {
      const result = sanitizePII('Phone: (555) 123-4567');
      expect(result).toContain('[REDACTED-PHONE]');
      expect(result).not.toContain('555');
    });
  });

  describe('IP address redaction', () => {
    it('should redact IPv4 addresses', () => {
      const result = sanitizePII('Source IP: 192.168.1.100');
      expect(result).toContain('[REDACTED-IP]');
      expect(result).not.toContain('192.168.1.100');
    });

    it('should redact multiple IPv4 addresses', () => {
      const result = sanitizePII('From 10.0.0.1 to 10.0.0.2');
      expect(result.match(/\[REDACTED-IP\]/g).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Credit card redaction', () => {
    it('should redact credit card numbers with spaces', () => {
      const result = sanitizePII('Card: 4111 1111 1111 1111');
      expect(result).toContain('[REDACTED-CC]');
      expect(result).not.toContain('4111');
    });

    it('should redact credit card numbers with dashes', () => {
      const result = sanitizePII('Card: 4111-1111-1111-1111');
      expect(result).toContain('[REDACTED-CC]');
    });
  });

  describe('Object sanitization', () => {
    it('should sanitize string values in objects', () => {
      const obj = { userId: 'john@test.com', action: 'login' };
      const result = sanitizeObject(obj);
      expect(result.userId).toBe('[REDACTED-EMAIL]');
      expect(result.action).toBe('login');
    });

    it('should sanitize nested objects', () => {
      const obj = {
        action: 'data_access',
        details: {
          sourceIP: '192.168.1.1',
          targetUser: 'admin@corp.com'
        }
      };
      const result = sanitizeObject(obj);
      expect(result.details.sourceIP).toContain('[REDACTED-IP]');
      expect(result.details.targetUser).toBe('[REDACTED-EMAIL]');
    });

    it('should sanitize arrays of strings', () => {
      const obj = {
        emails: ['a@b.com', 'c@d.com'],
        count: 2
      };
      const result = sanitizeObject(obj);
      expect(result.emails[0]).toBe('[REDACTED-EMAIL]');
      expect(result.emails[1]).toBe('[REDACTED-EMAIL]');
      expect(result.count).toBe(2);
    });

    it('should preserve non-PII content', () => {
      const obj = {
        action: 'agent_access',
        resource: 'src/cybersec-team/agents/penetration-tester',
        outcome: 'success',
        details: { module: 'cybersec-team', role: 'admin' }
      };
      const result = sanitizeObject(obj);
      expect(result).toEqual(obj);
    });

    it('should handle null and undefined values', () => {
      const obj = { a: null, b: undefined, c: 'test' };
      const result = sanitizeObject(obj);
      expect(result.a).toBeNull();
      expect(result.b).toBeUndefined();
      expect(result.c).toBe('test');
    });

    it('should handle Date objects', () => {
      const date = new Date('2026-01-01');
      const result = sanitizeObject(date);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle numbers and booleans', () => {
      expect(sanitizeObject(42)).toBe(42);
      expect(sanitizeObject(true)).toBe(true);
      expect(sanitizeObject(false)).toBe(false);
    });
  });

  describe('Hash chain integrity after sanitization', () => {
    it('should produce valid hashes over sanitized data', () => {
      const TEST_KEY = 'test-key-at-least-32-chars-long!!!!!';
      const event = {
        action: 'login',
        resource: 'auth',
        outcome: 'success',
        details: { userId: 'john@example.com', ip: '192.168.1.1' }
      };

      // Sanitize first (as audit-logger.ts does)
      const sanitizedEvent = sanitizeObject(event);
      const entryData = {
        ...sanitizedEvent,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        blockIndex: 0
      };

      const dataToHash = `${deterministicStringify(entryData)  }`;
      const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
      const signature = crypto.createHmac('sha256', TEST_KEY).update(dataToHash).digest('hex');

      // Verify the hash is computed over sanitized data
      expect(entryData.details.userId).toBe('[REDACTED-EMAIL]');
      expect(entryData.details.ip).toContain('[REDACTED-IP]');

      // Verify hash is valid
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);

      // Verify recomputation matches
      const recomputed = crypto.createHash('sha256').update(dataToHash).digest('hex');
      expect(hash).toBe(recomputed);
    });

    it('should maintain chain integrity across multiple sanitized entries', () => {
      const TEST_KEY = 'test-key-at-least-32-chars-long!!!!!';
      const events = [
        { action: 'login', details: { email: 'a@b.com' } },
        { action: 'access', details: { ip: '10.0.0.1' } },
        { action: 'modify', details: { card: '4111 1111 1111 1111' } },
      ];

      const entries = [];
      let prevHash = '';

      for (let i = 0; i < events.length; i++) {
        const sanitized = sanitizeObject(events[i]);
        const entryData = {
          ...sanitized,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          blockIndex: i
        };

        const dataToHash = deterministicStringify(entryData) + prevHash;
        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
        const signature = crypto.createHmac('sha256', TEST_KEY).update(dataToHash).digest('hex');

        entries.push({
          ...entryData,
          hash,
          previousHash: prevHash,
          signature
        });
        prevHash = hash;
      }

      // Verify chain
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].previousHash).toBe(entries[i - 1].hash);
      }

      // Verify no PII in stored entries
      expect(JSON.stringify(entries)).not.toContain('a@b.com');
      expect(JSON.stringify(entries)).not.toContain('10.0.0.1');
      expect(JSON.stringify(entries)).not.toContain('4111');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(sanitizePII('')).toBe('');
    });

    it('should handle string with no PII', () => {
      const input = 'Normal log message with no sensitive data';
      expect(sanitizePII(input)).toBe(input);
    });

    it('should handle string with mixed PII types', () => {
      const input = 'User john@test.com from 192.168.1.1 with card 4111-1111-1111-1111';
      const result = sanitizePII(input);
      expect(result).toContain('[REDACTED-EMAIL]');
      expect(result).toContain('[REDACTED-IP]');
      expect(result).toContain('[REDACTED-CC]');
      expect(result).not.toContain('john@test.com');
      expect(result).not.toContain('192.168.1.1');
      expect(result).not.toContain('4111');
    });

    it('should not corrupt non-string values in sanitizeObject', () => {
      const obj = {
        count: 42,
        active: true,
        tags: [1, 2, 3],
        nested: { num: 99 }
      };
      const result = sanitizeObject(obj);
      expect(result).toEqual(obj);
    });
  });
});
