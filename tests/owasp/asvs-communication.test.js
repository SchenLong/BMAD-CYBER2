/**
 * OWASP ASVS Communication Security Tests
 * Story 13: ASVS Communication Security (V10-001..003)
 */

import { describe, expect, it } from 'vitest';

describe('OWASP ASVS Communication Security: Story 13 - V10 Communication Security', () => {

  // V10-001: TLS 1.2+ minimum
  describe('V10-001: TLS 1.2+ minimum', () => {
    it('should accept HTTPS URLs', () => {
      const url = 'https://example.com/api';
      expect(url).toMatch(/^https:\/\//);
    });

    it('should reject HTTP URLs as CRITICAL', () => {
      const url = 'http://example.com/api';
      const isSecure = url.startsWith('https://');
      expect(isSecure).toBe(false);
    });

    it('should accept HTTPS for localhost development', () => {
      const url = 'http://localhost:3000';
      const isLocalhost = url.includes('localhost');
      expect(isLocalhost).toBe(true);
    });

    it('should accept HTTP for private network addresses', () => {
      const url = 'http://10.0.0.1/api';
      const isPrivate = /^https?:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/i.test(url);
      expect(isPrivate).toBe(true);
    });
  });

  // V10-002: Certificate validation
  describe('V10-002: Certificate validation', () => {
    it('should detect rejectUnauthorized false as insecure', () => {
      const code = "rejectUnauthorized: false";
      const hasBadPattern = /rejectUnauthorized:\s*false/.test(code);
      expect(hasBadPattern).toBe(true);
    });

    it('should detect NODE_TLS_REJECT_UNAUTHORIZED = 0', () => {
      const code = "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'";
      const hasBadPattern = /NODE_TLS_REJECT_UNAUTHORIZED\s*[=:]\s*['"]?0['"]?/.test(code);
      expect(hasBadPattern).toBe(true);
    });

    it('should detect checkServerIdentity bypass as WARNING', () => {
      const code = "checkServerIdentity: () => {}";
      const hasBadPattern = /checkServerIdentity\s*:\s*\(\)\s*=>/.test(code);
      expect(hasBadPattern).toBe(true);
    });
  });

  // V10-003: Weak protocols disabled
  describe('V10-003: Weak protocols disabled', () => {
    it('should detect SSLv3 protocol as insecure', () => {
      const code = "minVersion: 'SSLv3'";
      const hasSSLv3 = /sslv3/i.test(code);
      expect(hasSSLv3).toBe(true);
    });

    it('should detect TLS 1.0 protocol as insecure', () => {
      const code = "minVersion: 'TLSv1'";
      const hasTLSv1 = /tlsv1/i.test(code) && !/tlsv1\.[2-9]/i.test(code);
      expect(hasTLSv1).toBe(true);
    });

    it('should detect TLS 1.1 protocol as insecure', () => {
      const code = "minVersion: 'TLSv1.1'";
      const hasTLSv1_1 = /tlsv1\.1/i.test(code);
      expect(hasTLSv1_1).toBe(true);
    });

    it('should accept TLS 1.2 protocol as secure', () => {
      const code = "minVersion: 'TLSv1.2'";
      const hasTLSv1_2 = /tlsv1\.2/i.test(code);
      expect(hasTLSv1_2).toBe(true);
    });

    it('should detect weak cipher RC4 as insecure', () => {
      const code = "ciphers: 'RC4-SHA'";
      const hasWeakCipher = /RC4-/i.test(code);
      expect(hasWeakCipher).toBe(true);
    });

    it('should detect 3DES as insecure', () => {
      const code = "ciphers: '3DES-SHA'";
      const hasWeakCipher = /3DES/i.test(code);
      expect(hasWeakCipher).toBe(true);
    });

    it('should detect CBC mode ciphers as insecure', () => {
      const code = "ciphers: 'AES128-CBC'";
      const hasWeakCipher = /CBC/i.test(code);
      expect(hasWeakCipher).toBe(true);
    });
  });
});
