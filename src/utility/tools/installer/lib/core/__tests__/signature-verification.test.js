/**
 * Unit Tests for Signature Verification Module
 * Tests GPG and Sigstore signature verification
 *
 * INST-001: GPG signature verification
 *
 * @author BlackUnicorn.Tech
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

describe('SignatureVerification', () => {
  let SignatureVerification;
  let signatureVerification;
  let SIGNATURE_CONFIG;
  let GPG_TRUST_LEVELS;
  let tempDir;

  beforeEach(async () => {
    // Dynamic import (CommonJS module)
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const moduleExports = require('../signature-verification.js');
    SignatureVerification = moduleExports.SignatureVerification;
    SIGNATURE_CONFIG = moduleExports.SIGNATURE_CONFIG;
    GPG_TRUST_LEVELS = moduleExports.GPG_TRUST_LEVELS;
    signatureVerification = new SignatureVerification();

    // Create temp directory for test files
    tempDir = path.join(os.tmpdir(), `sig-verify-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const sv = new SignatureVerification();

      expect(sv.config.verificationRequired).toBe(true);
      expect(sv.config.allowUntrustedKeys).toBe(false);
      expect(sv.config.requiredTrustLevel).toBe('marginal');
      expect(sv.config.allowedSignatureTypes).toContain('gpg');
      expect(sv.config.allowedSignatureTypes).toContain('sigstore');
    });

    it('should allow custom configuration', () => {
      const sv = new SignatureVerification({
        verificationRequired: false,
        allowUntrustedKeys: true,
        requiredTrustLevel: 'full'
      });

      expect(sv.config.verificationRequired).toBe(false);
      expect(sv.config.allowUntrustedKeys).toBe(true);
      expect(sv.config.requiredTrustLevel).toBe('full');
    });

    it('should respect GPG_PATH environment variable', () => {
      const originalPath = process.env.GPG_PATH;
      process.env.GPG_PATH = '/custom/path/gpg';

      // Re-import to get new default config
      const { createRequire } = require('module');
      const localRequire = createRequire(import.meta.url);
      delete localRequire.cache[localRequire.resolve('../signature-verification.js')];
      const freshModule = localRequire('../signature-verification.js');

      expect(freshModule.SIGNATURE_CONFIG.gpgPath).toBe('/custom/path/gpg');

      process.env.GPG_PATH = originalPath;
    });
  });

  describe('Signature Type Detection', () => {
    it('should detect GPG signature from .sig extension', () => {
      expect(signatureVerification.detectSignatureType('/path/to/package.tgz.sig')).toBe('gpg');
    });

    it('should detect GPG signature from .asc extension', () => {
      expect(signatureVerification.detectSignatureType('/path/to/package.tgz.asc')).toBe('gpg');
    });

    it('should detect Sigstore signature from .bundle extension', () => {
      expect(signatureVerification.detectSignatureType('/path/to/package.tgz.bundle')).toBe('sigstore');
    });

    it('should return unknown for unrecognized extensions', () => {
      expect(signatureVerification.detectSignatureType('/path/to/package.tgz.xyz')).toBe('unknown');
    });
  });

  describe('Signature File Discovery', () => {
    it('should find .sig signature file', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');
      const sigPath = path.join(tempDir, 'package.tgz.sig');

      await fs.writeFile(packagePath, 'test package content');
      await fs.writeFile(sigPath, 'test signature');

      const found = await signatureVerification.findSignatureFile(packagePath);
      expect(found).toBe(sigPath);
    });

    it('should find .asc signature file', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');
      const ascPath = path.join(tempDir, 'package.tgz.asc');

      await fs.writeFile(packagePath, 'test package content');
      await fs.writeFile(ascPath, 'test signature');

      const found = await signatureVerification.findSignatureFile(packagePath);
      expect(found).toBe(ascPath);
    });

    it('should find .bundle signature file', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');
      const bundlePath = path.join(tempDir, 'package.tgz.bundle');

      await fs.writeFile(packagePath, 'test package content');
      await fs.writeFile(bundlePath, '{"test": "bundle"}');

      const found = await signatureVerification.findSignatureFile(packagePath);
      expect(found).toBe(bundlePath);
    });

    it('should return null when no signature file exists', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');
      await fs.writeFile(packagePath, 'test package content');

      const found = await signatureVerification.findSignatureFile(packagePath);
      expect(found).toBeNull();
    });

    it('should prefer .sig over .asc over .bundle', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');

      await fs.writeFile(packagePath, 'test package content');
      await fs.writeFile(path.join(tempDir, 'package.tgz.sig'), 'sig');
      await fs.writeFile(path.join(tempDir, 'package.tgz.asc'), 'asc');
      await fs.writeFile(path.join(tempDir, 'package.tgz.bundle'), 'bundle');

      const found = await signatureVerification.findSignatureFile(packagePath);
      expect(found).toBe(path.join(tempDir, 'package.tgz.sig'));
    });
  });

  describe('GPG Output Parsing', () => {
    it('should parse valid GPG signature output', () => {
      const stdout = `
[GNUPG:] GOODSIG 0123456789ABCDEF Test User <test@example.com>
[GNUPG:] VALIDSIG 0123456789ABCDEF0123456789ABCDEF01234567 2024-01-15 1705312800
[GNUPG:] TRUST_FULL
      `;

      const result = signatureVerification.parseGpgOutput(stdout, '');

      expect(result.valid).toBe(true);
      expect(result.keyId).toBe('0123456789ABCDEF');
      expect(result.signer).toBe('Test User <test@example.com>');
      expect(result.trustLevel).toBe('full');
      expect(result.fingerprint).toBe('0123456789ABCDEF0123456789ABCDEF01234567');
    });

    it('should parse bad signature output', () => {
      const stdout = `
[GNUPG:] BADSIG 0123456789ABCDEF Test User <test@example.com>
      `;

      const result = signatureVerification.parseGpgOutput(stdout, '');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('BAD_SIGNATURE');
    });

    it('should parse missing key output', () => {
      const stdout = `
[GNUPG:] NO_PUBKEY DEADBEEFCAFEBABE
      `;

      const result = signatureVerification.parseGpgOutput(stdout, '');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('KEY_NOT_FOUND');
      expect(result.keyId).toBe('DEADBEEFCAFEBABE');
    });

    it('should parse expired key output', () => {
      const stdout = `
[GNUPG:] EXPKEYSIG 0123456789ABCDEF Test User <test@example.com>
      `;

      const result = signatureVerification.parseGpgOutput(stdout, '');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('EXPIRED_KEY');
    });
  });

  describe('Cosign Output Parsing', () => {
    it('should parse valid cosign output', () => {
      const stdout = 'Verified OK';
      const stderr = `
Issuer: https://token.actions.githubusercontent.com
Subject: https://github.com/owner/repo/.github/workflows/release.yml@refs/heads/main
logIndex: 12345678
      `;

      const result = signatureVerification.parseCosignOutput(stdout, stderr);

      expect(result.valid).toBe(true);
      expect(result.issuer).toBe('https://token.actions.githubusercontent.com');
      expect(result.logIndex).toBe(12345678);
    });

    it('should parse invalid bundle error', () => {
      const stderr = 'error verifying bundle: invalid signature';

      const result = signatureVerification.parseCosignOutput('', stderr);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('INVALID_BUNDLE');
    });

    it('should parse expired certificate error', () => {
      const stderr = 'certificate has expired';

      const result = signatureVerification.parseCosignOutput('', stderr);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('EXPIRED_CERTIFICATE');
    });
  });

  describe('Trust Level Validation', () => {
    it('should accept equal trust level', () => {
      const sv = new SignatureVerification({ requiredTrustLevel: 'marginal' });
      expect(sv.validateTrustLevel('marginal')).toBe(true);
    });

    it('should accept higher trust level', () => {
      const sv = new SignatureVerification({ requiredTrustLevel: 'marginal' });
      expect(sv.validateTrustLevel('full')).toBe(true);
      expect(sv.validateTrustLevel('ultimate')).toBe(true);
    });

    it('should reject lower trust level', () => {
      const sv = new SignatureVerification({ requiredTrustLevel: 'full' });
      expect(sv.validateTrustLevel('marginal')).toBe(false);
      expect(sv.validateTrustLevel('unknown')).toBe(false);
    });

    it('should reject unknown trust levels', () => {
      const sv = new SignatureVerification({ requiredTrustLevel: 'marginal' });
      expect(sv.validateTrustLevel('invalid_trust_level')).toBe(false);
    });

    it('should have correct trust level ordering', () => {
      expect(GPG_TRUST_LEVELS).toEqual(['unknown', 'never', 'marginal', 'full', 'ultimate']);
    });
  });

  describe('Checksum Verification', () => {
    it('should verify matching checksum', async () => {
      const testFile = path.join(tempDir, 'test-file.txt');
      const content = 'test content for checksum';
      await fs.writeFile(testFile, content);

      // Pre-calculate the expected checksum
      const crypto = await import('crypto');
      const expectedChecksum = crypto.createHash('sha256').update(content).digest('hex');

      const result = await signatureVerification.verifyChecksum(testFile, expectedChecksum);

      expect(result.valid).toBe(true);
      expect(result.checksum).toBe(expectedChecksum);
    });

    it('should reject mismatched checksum', async () => {
      const testFile = path.join(tempDir, 'test-file.txt');
      await fs.writeFile(testFile, 'test content');

      const result = await signatureVerification.verifyChecksum(testFile, 'invalid_checksum');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('CHECKSUM_MISMATCH');
    });

    it('should handle missing file', async () => {
      const result = await signatureVerification.verifyChecksum(
        path.join(tempDir, 'nonexistent.txt'),
        'any_checksum'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('CHECKSUM_ERROR');
    });
  });

  describe('Package Verification', () => {
    it('should return error for missing package file', async () => {
      const result = await signatureVerification.verifyPackage('/nonexistent/package.tgz');

      expect(result.valid).toBe(false);
      // Error code may be ENOENT (file not found) or VERIFICATION_ERROR
      expect(['ENOENT', 'VERIFICATION_ERROR']).toContain(result.error);
    });

    it('should skip verification when not required and no signature found', async () => {
      const sv = new SignatureVerification({ verificationRequired: false });
      const packagePath = path.join(tempDir, 'package.tgz');
      await fs.writeFile(packagePath, 'test content');

      const result = await sv.verifyPackage(packagePath);

      expect(result.valid).toBe(true);
      expect(result.skipped).toBe(true);
    });

    it('should fail when required but no signature found', async () => {
      const sv = new SignatureVerification({ verificationRequired: true });
      const packagePath = path.join(tempDir, 'package.tgz');
      await fs.writeFile(packagePath, 'test content');

      const result = await sv.verifyPackage(packagePath);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('SIGNATURE_NOT_FOUND');
    });

    it('should reject unknown signature type', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');
      const sigPath = path.join(tempDir, 'package.tgz.xyz');

      await fs.writeFile(packagePath, 'test content');
      await fs.writeFile(sigPath, 'signature');

      const result = await signatureVerification.verifyPackage(packagePath, sigPath);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('UNKNOWN_SIGNATURE_TYPE');
    });
  });

  describe('GPG Availability Check', () => {
    it('should throw error when GPG is not available', async () => {
      const sv = new SignatureVerification({ gpgPath: '/nonexistent/gpg' });

      await expect(sv.checkGpgAvailable()).rejects.toThrow('GPG is not installed or not in PATH');
    });
  });

  describe('Cosign Availability Check', () => {
    it('should throw error when cosign is not available', async () => {
      const sv = new SignatureVerification({ cosignPath: '/nonexistent/cosign' });

      await expect(sv.checkCosignAvailable()).rejects.toThrow('cosign is not installed or not in PATH');
    });
  });

  describe('Status Reporting', () => {
    it('should report configuration status', () => {
      const sv = new SignatureVerification({
        verificationRequired: true,
        requiredTrustLevel: 'full'
      });

      const status = sv.getStatus();

      expect(status.config.verificationRequired).toBe(true);
      expect(status.config.requiredTrustLevel).toBe('full');
      expect(status.config.allowedTypes).toContain('gpg');
      expect(status.cachedResults).toBe(0);
    });

    it('should track cached verification results', async () => {
      const packagePath = path.join(tempDir, 'package.tgz');
      await fs.writeFile(packagePath, 'test content');

      // Run verification (will fail due to no signature, but result will be cached)
      await signatureVerification.verifyPackage(packagePath);

      const status = signatureVerification.getStatus();
      expect(status.cachedResults).toBe(1);
    });
  });

  describe('Result Creation', () => {
    it('should create valid result with all fields', () => {
      const result = signatureVerification.createResult(true, 'Verified', {
        packagePath: '/test/path',
        signatureType: 'gpg',
        keyId: '12345678'
      });

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Verified');
      expect(result.timestamp).toBeDefined();
      expect(result.packagePath).toBe('/test/path');
      expect(result.signatureType).toBe('gpg');
      expect(result.keyId).toBe('12345678');
    });

    it('should create invalid result with error details', () => {
      const result = signatureVerification.createResult(false, 'Failed', {
        error: 'INVALID_SIGNATURE',
        packagePath: '/test/path'
      });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Failed');
      expect(result.error).toBe('INVALID_SIGNATURE');
    });
  });
});
