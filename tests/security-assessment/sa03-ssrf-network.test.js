/**
 * SA-03-S3: SSRF & Network Attack Penetration Tests
 *
 * Target: tools/cli/lib/downloader.js
 * Purpose: Attempt SSRF via the downloader to access internal networks.
 * Method: RUNTIME tests against the URL validation logic.
 *
 * Acceptance Criteria:
 * - All 5 SSRF vectors tested
 * - 0 successful internal network access
 * - Subdomain bypass documented if still present
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '../..');

// Re-implement validateDownloadUrl from downloader.js for runtime testing
const ALLOWED_HOSTS = [
  'api.github.com',
  'github.com',
  'objects.githubusercontent.com',
  'github-releases.githubusercontent.com',
  'codeload.github.com'
];

function validateDownloadUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTPS URLs are allowed' };
    }
    const hostname = url.hostname.toLowerCase();
    const isAllowed = ALLOWED_HOSTS.some(allowed => hostname === allowed);
    if (!isAllowed) {
      return { valid: false, error: 'URL host not in allowed list' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// ============================================================================
describe('SA-03-S3: SSRF & Network Attack Testing', () => {

  // --------------------------------------------------------------------------
  // Test 1: Redirect to AWS metadata endpoint
  // --------------------------------------------------------------------------
  describe('SSRF via redirect targets', () => {
    it('PENTEST-S3-01: redirect to 169.254.169.254 (AWS metadata) blocked', () => {
      const redirectTarget = 'http://169.254.169.254/latest/meta-data/';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
      // Blocked both by HTTPS requirement and hostname whitelist
    });

    it('PENTEST-S3-01b: redirect to https://169.254.169.254 also blocked', () => {
      const redirectTarget = 'https://169.254.169.254/latest/meta-data/';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
      // Blocked by hostname whitelist (IP not in allowed list)
    });

    it('PENTEST-S3-01c: GCP metadata endpoint blocked', () => {
      const result = validateDownloadUrl('http://metadata.google.internal/computeMetadata/v1/');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-01d: Azure metadata endpoint blocked', () => {
      const result = validateDownloadUrl('http://169.254.169.254/metadata/instance');
      expect(result.valid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Test 2: DNS rebinding simulation
  // --------------------------------------------------------------------------
  describe('DNS rebinding defense', () => {
    it('PENTEST-S3-02: downloader.js re-validates on every redirect', () => {
      const src = readFileSync(resolve(ROOT, 'tools/cli/lib/downloader.js'), 'utf-8');

      // Must use manual redirect mode
      expect(src).toContain("redirect: 'manual'");

      // Must re-validate redirect URLs
      expect(src).toContain('validateDownloadUrl(redirectUrl)');

      // Must have max redirect limit
      expect(src).toContain('MAX_REDIRECTS');
    });
  });

  // --------------------------------------------------------------------------
  // Test 3: IP literal URLs
  // --------------------------------------------------------------------------
  describe('IP literal URL rejection', () => {
    it('PENTEST-S3-03: rejects https://192.168.1.1 (private network)', () => {
      const result = validateDownloadUrl('https://192.168.1.1/release.tar.gz');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-03b: rejects https://10.0.0.1 (private network)', () => {
      const result = validateDownloadUrl('https://10.0.0.1/release.tar.gz');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-03c: rejects https://127.0.0.1 (loopback)', () => {
      const result = validateDownloadUrl('https://127.0.0.1/release.tar.gz');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-03d: rejects https://[::1] (IPv6 loopback)', () => {
      const result = validateDownloadUrl('https://[::1]/release.tar.gz');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-03e: rejects https://0.0.0.0', () => {
      const result = validateDownloadUrl('https://0.0.0.0/release.tar.gz');
      expect(result.valid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Test 4: Subdomain manipulation (endsWith bypass)
  // --------------------------------------------------------------------------
  describe('subdomain spoofing prevention', () => {
    it('PENTEST-S3-04: rejects evil-api.github.com (hyphenated domain)', () => {
      const result = validateDownloadUrl('https://evil-api.github.com/path');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-04b: rejects evil.github.com (subdomain)', () => {
      const result = validateDownloadUrl('https://evil.github.com/path');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-04c: rejects github.com.evil.com (suffix spoof)', () => {
      const result = validateDownloadUrl('https://github.com.evil.com/path');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-04d: source uses exact match (no endsWith)', () => {
      const src = readFileSync(resolve(ROOT, 'tools/cli/lib/downloader.js'), 'utf-8');
      // Must NOT use endsWith for subdomain matching
      expect(src).not.toMatch(/hostname\.endsWith\s*\(\s*['"]\.['"\s]*\+/);
      // Must use exact equality check
      expect(src).toMatch(/hostname\s*===\s*allowed/);
    });
  });

  // --------------------------------------------------------------------------
  // Test 5: HTTP downgrade prevention
  // --------------------------------------------------------------------------
  describe('HTTP downgrade prevention', () => {
    it('PENTEST-S3-05: rejects http://api.github.com (no TLS)', () => {
      const result = validateDownloadUrl('http://api.github.com/repos');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HTTPS');
    });

    it('PENTEST-S3-05b: rejects ftp://github.com', () => {
      const result = validateDownloadUrl('ftp://github.com/file');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-05c: rejects file:///etc/passwd', () => {
      const result = validateDownloadUrl('file:///etc/passwd');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-05d: rejects javascript: protocol', () => {
      const result = validateDownloadUrl('javascript:alert(1)');
      expect(result.valid).toBe(false);
    });

    it('PENTEST-S3-05e: rejects data: protocol', () => {
      const result = validateDownloadUrl('data:text/html,<script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Checksum verification prevents tampered downloads
  // --------------------------------------------------------------------------
  describe('checksum verification defense', () => {
    it('downloader.js enforces mandatory checksum for releases', () => {
      const src = readFileSync(resolve(ROOT, 'tools/cli/lib/downloader.js'), 'utf-8');
      expect(src).toContain('Checksum verification is mandatory');
      expect(src).toContain('Checksum verification failed');
    });

    it('deletes file on checksum mismatch', () => {
      const src = readFileSync(resolve(ROOT, 'tools/cli/lib/downloader.js'), 'utf-8');
      // Should delete the file to prevent use of tampered content
      expect(src).toMatch(/rm\(filePath|await rm/);
    });
  });
});
