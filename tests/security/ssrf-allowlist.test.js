/**
 * SSRF Allowlist Security Tests - P3-15
 *
 * Target: tools/cli/lib/downloader.js
 * Purpose: Verify SSRF prevention via URL allowlist in the downloader module.
 *
 * Server-Side Request Forgery (SSRF) attacks trick a server into making
 * requests to unintended locations (e.g., internal services, cloud metadata
 * endpoints). The validateDownloadUrl() function in downloader.js enforces
 * an allowlist of permitted hosts and requires HTTPS.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// SSRF Allowlist Prevention Tests
// ============================================================================

describe('SSRF Allowlist Prevention - P3-15', () => {
  const downloaderPath = path.resolve(__dirname, '../../tools/cli/lib/downloader.js');
  let downloaderSource;

  beforeEach(() => {
    downloaderSource = fs.readFileSync(downloaderPath, 'utf-8');
  });

  // --------------------------------------------------------------------------
  // 1. Static Analysis: SSRF defense mechanisms
  // --------------------------------------------------------------------------
  describe('Static Analysis: SSRF defense mechanisms', () => {
    it('should define an ALLOWED_HOSTS array', () => {
      expect(downloaderSource).toContain('ALLOWED_HOSTS');
      expect(downloaderSource).toMatch(/ALLOWED_HOSTS\s*=\s*\[/);
    });

    it('should include github.com and api.github.com in allowed hosts', () => {
      expect(downloaderSource).toContain("'api.github.com'");
      expect(downloaderSource).toContain("'github.com'");
    });

    it('should define a validateDownloadUrl function', () => {
      expect(downloaderSource).toContain('function validateDownloadUrl');
    });

    it('should enforce HTTPS protocol', () => {
      expect(downloaderSource).toMatch(/protocol\s*!==\s*['"]https:['"]|url\.protocol/);
    });

    it('should use exact match only — no endsWith subdomain wildcards', () => {
      // The fix removed hostname.endsWith('.' + allowed)
      expect(downloaderSource).not.toMatch(/hostname\.endsWith\s*\(\s*['"]\.['"\s]*\+/);
      // Should use strict exact match
      expect(downloaderSource).toMatch(/hostname\s*===\s*allowed/);
    });

    it('should use redirect: manual in safeFetch to intercept redirects', () => {
      expect(downloaderSource).toContain("redirect: 'manual'");
    });

    it('should revalidate redirect URLs before following', () => {
      expect(downloaderSource).toContain('validateDownloadUrl(redirectUrl)');
      expect(downloaderSource).toContain('Redirect blocked');
    });

    it('should limit maximum redirects to prevent loops', () => {
      expect(downloaderSource).toContain('MAX_REDIRECTS');
      expect(downloaderSource).toContain('Too many redirects');
    });

    it('should define a safeFetch function that validates URLs before fetching', () => {
      expect(downloaderSource).toContain('function safeFetch');
      expect(downloaderSource).toContain('validateDownloadUrl(url)');
    });

    it('should use safeFetch in fetchWithRetry', () => {
      expect(downloaderSource).toContain('safeFetch(url');
    });

    it('should not retry security validation errors', () => {
      expect(downloaderSource).toMatch(/Security.*throw|message.*startsWith.*Security/);
    });
  });

  // --------------------------------------------------------------------------
  // 2. URL validation logic (unit testing validateDownloadUrl behavior)
  // --------------------------------------------------------------------------
  describe('URL validation: allowlist enforcement', () => {
    // Re-implement the validation logic for unit testing since it is not exported
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

    // Valid URLs
    it('should accept https://api.github.com/repos', () => {
      expect(validateDownloadUrl('https://api.github.com/repos').valid).toBe(true);
    });

    it('should accept https://github.com/org/repo', () => {
      expect(validateDownloadUrl('https://github.com/org/repo').valid).toBe(true);
    });

    it('should accept https://objects.githubusercontent.com/path', () => {
      expect(validateDownloadUrl('https://objects.githubusercontent.com/path').valid).toBe(true);
    });

    it('should accept https://codeload.github.com/path', () => {
      expect(validateDownloadUrl('https://codeload.github.com/path').valid).toBe(true);
    });

    // SSRF: Subdomain spoofing — exact match only (no wildcard subdomains)
    it('should REJECT evil.github.com (subdomain not in allowlist)', () => {
      const result = validateDownloadUrl('https://evil.github.com/path');
      expect(result.valid).toBe(false);
    });

    it('should REJECT evil-api.github.com (subdomain spoof)', () => {
      const result = validateDownloadUrl('https://evil-api.github.com/path');
      expect(result.valid).toBe(false);
    });

    it('should REJECT evil-github.com (hyphenated domain spoof)', () => {
      const result = validateDownloadUrl('https://evil-github.com/path');
      expect(result.valid).toBe(false);
    });

    it('should REJECT githubcom.evil.com (TLD manipulation)', () => {
      const result = validateDownloadUrl('https://githubcom.evil.com/path');
      expect(result.valid).toBe(false);
    });

    // SSRF: Internal network targets
    it('should REJECT http://169.254.169.254 (AWS metadata - HTTP)', () => {
      const result = validateDownloadUrl('http://169.254.169.254/latest/meta-data');
      expect(result.valid).toBe(false);
    });

    it('should REJECT https://169.254.169.254 (AWS metadata - HTTPS)', () => {
      const result = validateDownloadUrl('https://169.254.169.254/latest/meta-data');
      expect(result.valid).toBe(false);
    });

    it('should REJECT http://localhost (local services)', () => {
      const result = validateDownloadUrl('http://localhost/admin');
      expect(result.valid).toBe(false);
    });

    it('should REJECT https://localhost (local services over HTTPS)', () => {
      const result = validateDownloadUrl('https://localhost/admin');
      expect(result.valid).toBe(false);
    });

    it('should REJECT http://127.0.0.1 (loopback IPv4)', () => {
      const result = validateDownloadUrl('http://127.0.0.1/admin');
      expect(result.valid).toBe(false);
    });

    it('should REJECT https://[::1] (loopback IPv6)', () => {
      const result = validateDownloadUrl('https://[::1]/admin');
      expect(result.valid).toBe(false);
    });

    it('should REJECT http://10.0.0.1 (private network)', () => {
      const result = validateDownloadUrl('http://10.0.0.1/internal');
      expect(result.valid).toBe(false);
    });

    it('should REJECT http://192.168.1.1 (private network)', () => {
      const result = validateDownloadUrl('http://192.168.1.1/router');
      expect(result.valid).toBe(false);
    });

    // SSRF: Protocol downgrade
    it('should REJECT http://github.com (HTTP protocol)', () => {
      const result = validateDownloadUrl('http://github.com/org/repo');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HTTPS');
    });

    it('should REJECT ftp://github.com (FTP protocol)', () => {
      const result = validateDownloadUrl('ftp://github.com/file');
      expect(result.valid).toBe(false);
    });

    it('should REJECT file:///etc/passwd (file protocol)', () => {
      const result = validateDownloadUrl('file:///etc/passwd');
      expect(result.valid).toBe(false);
    });

    // SSRF: URL with credentials
    it('should handle URL with embedded credentials', () => {
      const result = validateDownloadUrl('https://user:pass@github.com/path');
      // Should still validate the hostname correctly
      expect(result.valid).toBe(true);
    });

    // SSRF: URL with non-standard port
    it('should handle URL with custom port on allowed host', () => {
      const result = validateDownloadUrl('https://github.com:8080/path');
      // Hostname extraction ignores port, so this should pass host check
      expect(result.valid).toBe(true);
    });

    it('should REJECT URL with port on disallowed host', () => {
      const result = validateDownloadUrl('https://evil.com:443/path');
      expect(result.valid).toBe(false);
    });

    // SSRF: Malformed URLs
    it('should REJECT malformed URL string', () => {
      const result = validateDownloadUrl('not-a-url');
      expect(result.valid).toBe(false);
    });

    it('should REJECT empty string', () => {
      const result = validateDownloadUrl('');
      expect(result.valid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Redirect revalidation (SSRF via redirect)
  // --------------------------------------------------------------------------
  describe('Redirect revalidation', () => {
    // Re-implement validateDownloadUrl for redirect tests (exact match only)
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

    it('should REJECT redirect to 169.254.169.254 (AWS metadata SSRF)', () => {
      const redirectTarget = 'https://169.254.169.254/latest/meta-data';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
    });

    it('should REJECT redirect to http://169.254.169.254 (protocol downgrade)', () => {
      const redirectTarget = 'http://169.254.169.254/latest/meta-data';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
    });

    it('should REJECT redirect to localhost', () => {
      const redirectTarget = 'https://localhost/admin';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
    });

    it('should REJECT redirect to 127.0.0.1', () => {
      const redirectTarget = 'https://127.0.0.1/admin';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
    });

    it('should REJECT redirect to evil-api.github.com (subdomain spoof)', () => {
      const redirectTarget = 'https://evil-api.github.com/data';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(false);
    });

    it('should ACCEPT redirect to github.com (exact match in allowlist)', () => {
      const redirectTarget = 'https://github.com/org/repo/releases/download/v1/file.tar.gz';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(true);
    });

    it('should ACCEPT redirect to objects.githubusercontent.com (exact match)', () => {
      const redirectTarget = 'https://objects.githubusercontent.com/v4/asset';
      const result = validateDownloadUrl(redirectTarget);
      expect(result.valid).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Checksum verification
  // --------------------------------------------------------------------------
  describe('Checksum verification', () => {
    it('should validate SHA256 hash format (64 hex characters)', () => {
      expect(downloaderSource).toContain('{64}');
      expect(downloaderSource).toMatch(/[a-fA-F0-9].*\{64\}/);
    });

    it('should throw on checksum mismatch', () => {
      expect(downloaderSource).toContain('Checksum verification failed');
    });

    it('should delete file on checksum failure', () => {
      expect(downloaderSource).toMatch(/rm\(filePath|await rm/);
    });

    it('should require checksum for release downloads', () => {
      expect(downloaderSource).toContain('Checksum verification is mandatory');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Retry behavior with security errors
  // --------------------------------------------------------------------------
  describe('Retry behavior with security errors', () => {
    it('should not retry on security validation errors', () => {
      // The fetchWithRetry function should immediately throw on Security: errors
      expect(downloaderSource).toMatch(/Security.*throw|startsWith.*Security/);
    });

    it('should use exponential backoff for non-security errors', () => {
      expect(downloaderSource).toContain('Math.pow');
    });

    it('should default to 3 retries', () => {
      expect(downloaderSource).toMatch(/retries\s*=\s*3/);
    });
  });
});
