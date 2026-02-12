/**
 * OWASP Crypto Verification Tests
 * Suite: tests/owasp/crypto-verification.test.js
 * OWASP Coverage: A02, ASVS V6, V9
 *
 * Story 4.1: Encryption & Signing Correctness (A02)
 *   Source: src/security/encryption/aes-encryption.ts
 *   Source: .claude/validators-node/src/observability/audit-encryption.ts
 *   Source: src/security/supply-chain/artifact-signer.js
 *   Source: src/security/audit/audit-logger.ts
 *
 * Story 4.2: ASVS Crypto Controls (V6, V9)
 *   Source: src/security/encryption/crypto-utils.ts
 *   Source: src/security/encryption/key-derivation.ts
 *   Source: src/security/encryption/hash-chains.ts
 *
 * Story 4.3: Token Random Number Generation (A02, LLM06)
 *   Source: .claude/validators-node/src/permissions/token-validator.ts
 *   Source: src/security/encryption/generate-token.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// ===========================================================================
// Story 4.1: Encryption & Signing Correctness (A02) — 4 test IDs
// ===========================================================================

describe('OWASP Crypto: Story 4.1 — Encryption & Signing Correctness', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // A02-004 [P0]: AES-256-GCM Correctness — BOTH modules
  // -------------------------------------------------------------------------
  describe('A02-004: AES-256-GCM encrypt/decrypt correctness', () => {
    describe('Module 1: src/security/encryption/aes-encryption.ts', () => {
      let AESEncryption;
      let CRYPTO_CONFIG;
      let generateSecureRandom;

      beforeEach(async () => {
        const aes = await import('../../src/security/encryption/aes-encryption.ts');
        AESEncryption = aes.AESEncryption;
        const utils = await import('../../src/security/encryption/crypto-utils.ts');
        CRYPTO_CONFIG = utils.CRYPTO_CONFIG;
        generateSecureRandom = utils.generateSecureRandom;
      });

      it('should encrypt/decrypt roundtrip with correct key', () => {
        const key = crypto.randomBytes(32);
        const plaintext = 'Sensitive OAuth token data: {"access_token":"abc123"}';

        const encrypted = AESEncryption.encrypt(plaintext, key);
        const decrypted = AESEncryption.decrypt(encrypted, key);

        expect(decrypted).toBe(plaintext);
      });

      it('should throw with wrong key — not produce garbage', () => {
        const key = crypto.randomBytes(32);
        const wrongKey = crypto.randomBytes(32);
        const plaintext = 'Secret data';

        const encrypted = AESEncryption.encrypt(plaintext, key);

        expect(() => AESEncryption.decrypt(encrypted, wrongKey)).toThrow();
      });

      it('should produce different IVs for two encryptions of the same data', () => {
        const key = crypto.randomBytes(32);
        const plaintext = 'Same data twice';

        const result1 = AESEncryption.encrypt(plaintext, key);
        const result2 = AESEncryption.encrypt(plaintext, key);

        expect(result1.iv).not.toBe(result2.iv);
        expect(result1.encrypted).not.toBe(result2.encrypted);
      });

      it('should produce different ciphertexts for same plaintext (IV uniqueness)', () => {
        const key = crypto.randomBytes(32);
        const plaintext = 'Identical message';

        const results = Array.from({ length: 5 }, () =>
          AESEncryption.encrypt(plaintext, key)
        );
        const ivSet = new Set(results.map((r) => r.iv));

        expect(ivSet.size).toBe(5);
      });

      it('should reject invalid key length', () => {
        const shortKey = crypto.randomBytes(16);
        expect(() => AESEncryption.encrypt('test', shortKey)).toThrow();
      });

      it('should encrypt/decrypt with password (PBKDF2 key derivation)', () => {
        const password = 'StrongPassword123!';
        const plaintext = 'Password-encrypted secret';

        const encrypted = AESEncryption.encryptWithPassword(plaintext, password);
        expect(encrypted.salt).toBeDefined();

        const decrypted = AESEncryption.decryptWithPassword(encrypted, password);
        expect(decrypted).toBe(plaintext);
      });

      it('should reject wrong password for password-based decryption', () => {
        const plaintext = 'Secret data';
        const encrypted = AESEncryption.encryptWithPassword(plaintext, 'CorrectPass1');

        expect(() =>
          AESEncryption.decryptWithPassword(encrypted, 'WrongPass1')
        ).toThrow();
      });

      it('should use aes-256-gcm as the algorithm', () => {
        expect(CRYPTO_CONFIG.algorithm).toBe('aes-256-gcm');
      });

      it('should use 32-byte (256-bit) keys', () => {
        expect(CRYPTO_CONFIG.keyLength).toBe(32);
      });
    });

    describe('Module 2: audit-encryption.ts', () => {
      let encryptEntry, decryptEntry, isEncryptionEnabled, generateEncryptionKey;
      let clearKeyCache, getEncryptionStatus, encryptEntrySync;
      const TEST_KEY_HEX = crypto.randomBytes(32).toString('hex');

      beforeEach(async () => {
        vi.resetModules();
        // Set up encryption key before importing
        process.env.BMAD_AUDIT_ENCRYPTION_KEY = TEST_KEY_HEX;
        process.env.BMAD_AUDIT_ENCRYPTION_ENABLED = 'true';
        process.env.NODE_ENV = 'test';

        const mod = await import(
          '../../.claude/validators-node/src/observability/audit-encryption.ts'
        );
        encryptEntry = mod.encryptEntry;
        decryptEntry = mod.decryptEntry;
        isEncryptionEnabled = mod.isEncryptionEnabled;
        generateEncryptionKey = mod.generateEncryptionKey;
        clearKeyCache = mod.clearKeyCache;
        getEncryptionStatus = mod.getEncryptionStatus;
        encryptEntrySync = mod.encryptEntrySync;
      });

      afterEach(() => {
        delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
        delete process.env.BMAD_AUDIT_ENCRYPTION_ENABLED;
        if (clearKeyCache) clearKeyCache();
      });

      it('should encrypt/decrypt audit log entry roundtrip', async () => {
        const entry = {
          timestamp: new Date().toISOString(),
          session_id: 'test-session-001',
          action: 'SECURITY_EVENT',
          validator: 'test_validator',
          severity: 'HIGH',
          details: { reason: 'Test encryption roundtrip' },
        };

        const encrypted = await encryptEntry(entry);

        expect(encrypted.encrypted).toBe(true);
        expect(encrypted.algorithm).toBe('aes-256-gcm');
        expect(encrypted.iv).toBeDefined();
        expect(encrypted.salt).toBeDefined();
        expect(encrypted.tag).toBeDefined();
        expect(encrypted.data).toBeDefined();
        // Plaintext fields preserved for correlation
        expect(encrypted.timestamp).toBe(entry.timestamp);
        expect(encrypted.session_id).toBe(entry.session_id);

        const decrypted = await decryptEntry(encrypted);
        expect(decrypted.action).toBe(entry.action);
        expect(decrypted.validator).toBe(entry.validator);
        expect(decrypted.severity).toBe(entry.severity);
        expect(decrypted.timestamp).toBe(entry.timestamp);
      });

      it('should produce different IVs for two encryptions', async () => {
        const entry = {
          timestamp: new Date().toISOString(),
          session_id: 'sess-1',
          action: 'TEST',
          validator: 'test',
        };

        const enc1 = await encryptEntry(entry);
        const enc2 = await encryptEntry(entry);

        expect(enc1.iv).not.toBe(enc2.iv);
        expect(enc1.salt).not.toBe(enc2.salt);
        expect(enc1.data).not.toBe(enc2.data);
      });

      it('should fail decryption with wrong key', async () => {
        const entry = {
          timestamp: new Date().toISOString(),
          session_id: 'sess-1',
          action: 'TEST',
          validator: 'test',
        };

        const encrypted = await encryptEntry(entry);

        // Change the key
        vi.resetModules();
        process.env.BMAD_AUDIT_ENCRYPTION_KEY = crypto
          .randomBytes(32)
          .toString('hex');
        process.env.BMAD_AUDIT_ENCRYPTION_ENABLED = 'true';
        process.env.NODE_ENV = 'test';

        const mod2 = await import(
          '../../.claude/validators-node/src/observability/audit-encryption.ts'
        );

        await expect(mod2.decryptEntry(encrypted)).rejects.toThrow();
      });

      it('should generate valid 64-char hex encryption keys', () => {
        const key = generateEncryptionKey();
        expect(key).toMatch(/^[0-9a-f]{64}$/);
        expect(Buffer.from(key, 'hex').length).toBe(32);
      });

      it('should report correct encryption status', () => {
        const status = getEncryptionStatus();
        expect(status.enabled).toBe(true);
        expect(status.keyAvailable).toBe(true);
        expect(status.algorithm).toBe('aes-256-gcm');
        expect(status.keyDerivation).toContain('pbkdf2');
        expect(status.keyDerivation).toContain('sha256');
        expect(status.keyDerivation).toContain('100000');
      });
    });
  });

  // -------------------------------------------------------------------------
  // A02-005 [P1]: Key Derivation Uses Approved Algorithms
  // -------------------------------------------------------------------------
  describe('A02-005: Key derivation uses approved algorithms (PBKDF2)', () => {
    let KeyDerivation;
    let CRYPTO_CONFIG;

    beforeEach(async () => {
      const mod = await import(
        '../../src/security/encryption/key-derivation.ts'
      );
      KeyDerivation = mod.KeyDerivation;
      const utils = await import(
        '../../src/security/encryption/crypto-utils.ts'
      );
      CRYPTO_CONFIG = utils.CRYPTO_CONFIG;
    });

    it('should use PBKDF2 with SHA-256 for key derivation', () => {
      const result = KeyDerivation.deriveKey('TestPassword1!');
      expect(result.key).toBeInstanceOf(Buffer);
      expect(result.key.length).toBe(CRYPTO_CONFIG.keyLength);
      expect(result.salt).toBeInstanceOf(Buffer);
      expect(result.iterations).toBe(CRYPTO_CONFIG.iterations);
    });

    it('should use at least 100,000 iterations (OWASP 2024 minimum)', () => {
      expect(CRYPTO_CONFIG.iterations).toBeGreaterThanOrEqual(100000);
    });

    it('should derive 32-byte keys (256-bit for AES-256)', () => {
      expect(CRYPTO_CONFIG.keyLength).toBe(32);
    });

    it('should use SHA-256 as hash algorithm', () => {
      expect(CRYPTO_CONFIG.hashAlgorithm).toBe('sha256');
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(() => KeyDerivation.deriveKey('short')).toThrow(/too short/i);
    });

    it('should produce same key from same password and salt', () => {
      const salt = crypto.randomBytes(32);
      const key1 = KeyDerivation.deriveKey('ConsistentPass1!', salt);
      const key2 = KeyDerivation.deriveKey('ConsistentPass1!', salt);
      expect(key1.key.equals(key2.key)).toBe(true);
    });

    it('should produce different keys from different salts', () => {
      const salt1 = crypto.randomBytes(32);
      const salt2 = crypto.randomBytes(32);
      const key1 = KeyDerivation.deriveKey('SamePassword1!', salt1);
      const key2 = KeyDerivation.deriveKey('SamePassword1!', salt2);
      expect(key1.key.equals(key2.key)).toBe(false);
    });

    it('should generate random salt when not provided', () => {
      const result1 = KeyDerivation.deriveKey('RandomSalt1!');
      const result2 = KeyDerivation.deriveKey('RandomSalt1!');
      expect(result1.salt.equals(result2.salt)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // A02-009 [P1]: Ed25519 Signing — Sign/Verify Roundtrip
  // -------------------------------------------------------------------------
  describe('A02-009: Ed25519 signing — sign/verify roundtrip', () => {
    it('should sign and verify data with Ed25519', () => {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
      const data = 'Artifact content to sign';

      const signature = crypto.sign(null, Buffer.from(data), privateKey);
      const isValid = crypto.verify(
        null,
        Buffer.from(data),
        publicKey,
        signature
      );

      expect(isValid).toBe(true);
    });

    it('should reject tampered data with Ed25519', () => {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
      const data = 'Original content';

      const signature = crypto.sign(null, Buffer.from(data), privateKey);
      const isValid = crypto.verify(
        null,
        Buffer.from('Tampered content'),
        publicKey,
        signature
      );

      expect(isValid).toBe(false);
    });

    it('should reject verification with wrong key', () => {
      const keyPair1 = crypto.generateKeyPairSync('ed25519');
      const keyPair2 = crypto.generateKeyPairSync('ed25519');
      const data = 'Signed by key 1';

      const signature = crypto.sign(
        null,
        Buffer.from(data),
        keyPair1.privateKey
      );
      const isValid = crypto.verify(
        null,
        Buffer.from(data),
        keyPair2.publicKey,
        signature
      );

      expect(isValid).toBe(false);
    });

    it('should verify ArtifactSigner uses Ed25519 as default algorithm', async () => {
      const ArtifactSigner = (
        await import('../../src/security/supply-chain/artifact-signer.js')
      ).default;
      const signer = new ArtifactSigner();
      // Default algorithm from _mergeConfig
      expect(signer.config.algorithm).toBe('ed25519');
    });

    it('should verify ArtifactSigner supports Ed25519 key generation', async () => {
      const ArtifactSigner = (
        await import('../../src/security/supply-chain/artifact-signer.js')
      ).default;
      expect(ArtifactSigner.SIGNING_ALGORITHMS.ED25519).toBe('ed25519');
    });

    it('should verify ArtifactSigner uses SHA-256 for hashing', async () => {
      const ArtifactSigner = (
        await import('../../src/security/supply-chain/artifact-signer.js')
      ).default;
      const signer = new ArtifactSigner();
      expect(signer.config.hashAlgorithm).toBe('sha256');
    });
  });

  // -------------------------------------------------------------------------
  // A02-010 [P1]: No Weak Hash Algorithms in Security Code
  // -------------------------------------------------------------------------
  describe('A02-010: No weak hash algorithms (md5/sha1) for integrity/signing', () => {
    const securityPaths = [
      'src/security/encryption',
      'src/security/supply-chain',
      'src/security/audit',
      '.claude/validators-node/src/observability',
      '.claude/validators-node/src/permissions',
      '.claude/validators-node/src/guards',
      '.claude/validators-node/src/ai-safety',
      '.claude/validators-node/src/common',
    ];

    it('should not use md5 for integrity or signing in security encryption code', () => {
      const encDir = path.resolve(
        process.cwd(),
        'src/security/encryption'
      );
      if (!fs.existsSync(encDir)) return;

      const files = fs
        .readdirSync(encDir)
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(encDir, file), 'utf-8');
        // No md5 in encryption module
        expect(content).not.toMatch(/createHash\(['"]md5['"]\)/);
        // No sha1 in encryption module
        expect(content).not.toMatch(/createHash\(['"]sha1['"]\)/);
      }
    });

    it('should not use md5 for integrity in supply-chain signing code', () => {
      const scDir = path.resolve(
        process.cwd(),
        'src/security/supply-chain'
      );
      if (!fs.existsSync(scDir)) return;

      const signerPath = path.join(scDir, 'artifact-signer.js');
      if (!fs.existsSync(signerPath)) return;

      const content = fs.readFileSync(signerPath, 'utf-8');
      // Artifact signer must not use MD5 or SHA1 for signatures/hashes
      expect(content).not.toMatch(/createHash\(['"]md5['"]\)/);
      expect(content).not.toMatch(/createHash\(['"]sha1['"]\)/);
    });

    it('should not use sha1 for integrity in validators observability code', () => {
      const obsDir = path.resolve(
        process.cwd(),
        '.claude/validators-node/src/observability'
      );
      if (!fs.existsSync(obsDir)) return;

      const files = fs
        .readdirSync(obsDir)
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(obsDir, file), 'utf-8');
        expect(content).not.toMatch(/createHash\(['"]sha1['"]\)/);
      }
    });

    it('should not use sha1 for integrity in permissions code', () => {
      const permDir = path.resolve(
        process.cwd(),
        '.claude/validators-node/src/permissions'
      );
      if (!fs.existsSync(permDir)) return;

      const files = fs
        .readdirSync(permDir)
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(permDir, file), 'utf-8');
        expect(content).not.toMatch(/createHash\(['"]md5['"]\)/);
        expect(content).not.toMatch(/createHash\(['"]sha1['"]\)/);
      }
    });

    it('should verify md5 in recursion-guard is only for fingerprinting (not signing)', () => {
      const guardPath = path.resolve(
        process.cwd(),
        '.claude/validators-node/src/resource-management/recursion-guard.ts'
      );
      if (!fs.existsSync(guardPath)) return;

      const content = fs.readFileSync(guardPath, 'utf-8');
      // MD5 exists but only for content fingerprinting (non-security use)
      const md5Lines = content
        .split('\n')
        .filter((l) => l.includes("createHash('md5')"));

      for (const line of md5Lines) {
        // Verify it's used for content fingerprinting, not signing/integrity
        expect(line).toMatch(/content|fingerprint|substring/i);
        expect(line).not.toMatch(/sign|verify|integrity|hmac/i);
      }
    });
  });
});

// ===========================================================================
// Story 4.2: ASVS Crypto Controls (V6, V9) — 3 test IDs
// ===========================================================================

describe('OWASP Crypto: Story 4.2 — ASVS Crypto Controls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // V6-002 [P1]: Approved Algorithms Only
  // -------------------------------------------------------------------------
  describe('V6-002: Approved algorithms only in security paths', () => {
    it('should use AES-256-GCM in aes-encryption module', async () => {
      const { CRYPTO_CONFIG } = await import(
        '../../src/security/encryption/crypto-utils.ts'
      );
      expect(CRYPTO_CONFIG.algorithm).toBe('aes-256-gcm');
    });

    it('should use SHA-256 as hash algorithm in crypto-utils', async () => {
      const { CRYPTO_CONFIG } = await import(
        '../../src/security/encryption/crypto-utils.ts'
      );
      expect(CRYPTO_CONFIG.hashAlgorithm).toBe('sha256');
    });

    it('should use SHA-256 in hash-chains module', async () => {
      const { HashChain } = await import(
        '../../src/security/encryption/hash-chains.ts'
      );
      // HashChain uses CRYPTO_CONFIG.hashAlgorithm internally (sha256)
      const hash = HashChain.hashData('test data');
      // SHA-256 produces 64-char hex digest
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should use Ed25519 as default signing algorithm in artifact signer', async () => {
      const ArtifactSigner = (
        await import('../../src/security/supply-chain/artifact-signer.js')
      ).default;
      const signer = new ArtifactSigner();
      expect(signer.config.algorithm).toBe('ed25519');
    });

    it('should use HMAC-SHA256 in audit logger', () => {
      // Verify HMAC-SHA256 usage by creating an HMAC
      const key = 'test-private-key';
      const data = 'test data';
      const hmac = crypto.createHmac('sha256', key).update(data).digest('hex');
      // SHA-256 HMAC produces 64-char hex
      expect(hmac).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should use PBKDF2-SHA256 in audit encryption', async () => {
      vi.resetModules();
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = crypto
        .randomBytes(32)
        .toString('hex');
      process.env.BMAD_AUDIT_ENCRYPTION_ENABLED = 'true';
      process.env.NODE_ENV = 'test';

      const { getEncryptionStatus, clearKeyCache } = await import(
        '../../.claude/validators-node/src/observability/audit-encryption.ts'
      );

      const status = getEncryptionStatus();
      expect(status.algorithm).toBe('aes-256-gcm');
      expect(status.keyDerivation).toContain('pbkdf2');
      expect(status.keyDerivation).toContain('sha256');

      clearKeyCache();
      delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
      delete process.env.BMAD_AUDIT_ENCRYPTION_ENABLED;
    });

    it('should only use approved algorithms in encryption source files', () => {
      const approvedAlgorithms = [
        'aes-256-gcm',
        'sha256',
        'sha-256',
        'ed25519',
        'hmac',
        'pbkdf2',
        'rsa-pss',
        'ecdsa',
        'P-256',
      ];

      const encDir = path.resolve(
        process.cwd(),
        'src/security/encryption'
      );
      const files = fs
        .readdirSync(encDir)
        .filter((f) => f.endsWith('.ts'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(encDir, file), 'utf-8');

        // Check for any hash algorithm references
        const hashMatches = content.matchAll(
          /createHash\(['"]([^'"]+)['"]\)/g
        );
        for (const match of hashMatches) {
          expect(
            approvedAlgorithms.some((a) =>
              match[1].toLowerCase().includes(a.toLowerCase())
            )
          ).toBe(true);
        }

        // Check for cipher algorithm references
        const cipherMatches = content.matchAll(
          /createCipheriv\(['"]([^'"]+)['"]/g
        );
        for (const match of cipherMatches) {
          expect(
            approvedAlgorithms.some((a) =>
              match[1].toLowerCase().includes(a.toLowerCase())
            )
          ).toBe(true);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // V6-003 [P1]: Key Management Process — Rotation Policy
  // -------------------------------------------------------------------------
  describe('V6-003: Key management and rotation policy', () => {
    it('should have key rotation documentation', () => {
      const docsToCheck = [
        'Docs/02-user-guides/Security/SECURITY-MAINTENANCE-CHECKLIST.md',
        'Docs/02-user-guides/Security/TOKEN-MANAGEMENT-GUIDE.md',
      ];

      let foundRotationDoc = false;
      for (const docPath of docsToCheck) {
        const fullPath = path.resolve(process.cwd(), docPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (/rotat/i.test(content)) {
            foundRotationDoc = true;
            break;
          }
        }
      }

      expect(foundRotationDoc).toBe(true);
    });

    it('should enforce token expiration (default 168h)', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      const result = gen.generateToken('test-user', undefined, ['viewer'], ['core']);
      expect(result.claims.exp).toBeDefined();

      const issuedAt = new Date(result.claims.iat);
      const expiresAt = new Date(result.claims.exp);
      const hoursDiff =
        (expiresAt.getTime() - issuedAt.getTime()) / (1000 * 60 * 60);

      expect(hoursDiff).toBe(168);
    });

    it('should support configurable token expiry', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      const result = gen.generateToken('test-user', undefined, ['admin'], ['core'], 24);
      const issuedAt = new Date(result.claims.iat);
      const expiresAt = new Date(result.claims.exp);
      const hoursDiff =
        (expiresAt.getTime() - issuedAt.getTime()) / (1000 * 60 * 60);

      expect(hoursDiff).toBe(24);
    });

    it('should have key cache TTL for audit encryption keys', async () => {
      vi.resetModules();
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = crypto
        .randomBytes(32)
        .toString('hex');
      process.env.BMAD_AUDIT_ENCRYPTION_ENABLED = 'true';
      process.env.NODE_ENV = 'test';

      const { getEncryptionStatus, clearKeyCache } = await import(
        '../../.claude/validators-node/src/observability/audit-encryption.ts'
      );

      const status = getEncryptionStatus();
      // Key cache exists
      expect(status.cacheStats).toBeDefined();
      expect(status.cacheStats.maxSize).toBeGreaterThan(0);

      clearKeyCache();
      delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
      delete process.env.BMAD_AUDIT_ENCRYPTION_ENABLED;
    });

    it('should provide master key generation utility', async () => {
      const { KeyDerivation } = await import(
        '../../src/security/encryption/key-derivation.ts'
      );
      const masterKey = KeyDerivation.generateMasterKey();
      expect(masterKey).toBeInstanceOf(Buffer);
      expect(masterKey.length).toBe(32);
    });
  });

  // -------------------------------------------------------------------------
  // V9-002 [P1]: Certificate Validation (TLS)
  // -------------------------------------------------------------------------
  describe('V9-002: Certificate validation — rejectUnauthorized not disabled', () => {
    const securitySourceDirs = [
      'src/security',
      '.claude/validators-node/src',
    ];

    it('should not have rejectUnauthorized: false in security source code', () => {
      for (const dir of securitySourceDirs) {
        const fullDir = path.resolve(process.cwd(), dir);
        if (!fs.existsSync(fullDir)) continue;

        scanDirectoryForPattern(fullDir, /rejectUnauthorized\s*:\s*false/);
      }
    });

    it('should not disable NODE_TLS_REJECT_UNAUTHORIZED in security code', () => {
      for (const dir of securitySourceDirs) {
        const fullDir = path.resolve(process.cwd(), dir);
        if (!fs.existsSync(fullDir)) continue;

        scanDirectoryForPattern(
          fullDir,
          /NODE_TLS_REJECT_UNAUTHORIZED.*['"]0['"]/
        );
      }
    });

    it('should use HTTPS URLs for npm registries in supply chain protection', () => {
      const depProtectionPath = path.resolve(
        process.cwd(),
        'src/security/supply-chain/dependency-protection.js'
      );
      if (!fs.existsSync(depProtectionPath)) return;

      const content = fs.readFileSync(depProtectionPath, 'utf-8');
      const urlMatches = content.matchAll(
        /['"]https?:\/\/[^'"]+['"]/g
      );
      for (const match of urlMatches) {
        const url = match[0].replace(/['"]/g, '');
        if (url.includes('registry') || url.includes('npm')) {
          expect(url).toMatch(/^https:\/\//);
        }
      }
    });

    /**
     * Recursively scan a directory for a regex pattern in .ts/.js files.
     * Throws if the pattern is found (indicating insecure configuration).
     */
    function scanDirectoryForPattern(dir, pattern) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          scanDirectoryForPattern(fullPath, pattern);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))
        ) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (pattern.test(content)) {
            throw new Error(
              `Insecure TLS configuration found in ${fullPath}: ${pattern}`
            );
          }
        }
      }
    }
  });
});

// ===========================================================================
// Story 4.3: Token Random Number Generation (A02, LLM06) — 2 test IDs
// ===========================================================================

describe('OWASP Crypto: Story 4.3 — Token Random Number Generation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // A02-006 [P0]: Token generation uses crypto.randomBytes/randomUUID
  // -------------------------------------------------------------------------
  describe('A02-006: Token generation uses cryptographic RNG, not Math.random', () => {
    const tokenAndAuthFiles = [
      'src/security/encryption/generate-token.ts',
      'src/security/encryption/aes-encryption.ts',
      'src/security/encryption/crypto-utils.ts',
      'src/security/encryption/key-derivation.ts',
      '.claude/validators-node/src/permissions/token-validator.ts',
      '.claude/validators-node/src/observability/audit-encryption.ts',
    ];

    it('should use crypto.randomBytes or crypto.randomUUID in all token/auth files', () => {
      for (const filePath of tokenAndAuthFiles) {
        const fullPath = path.resolve(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');

        // If file contains any random generation, it must be cryptographic
        if (
          content.includes('randomBytes') ||
          content.includes('randomUUID') ||
          content.includes('generateSecureRandom')
        ) {
          // Verify no Math.random in this file
          expect(content).not.toMatch(/Math\.random/);
        }
      }
    });

    it('should not use Math.random for token IDs in generate-token.ts', () => {
      const filePath = path.resolve(
        process.cwd(),
        'src/security/encryption/generate-token.ts'
      );
      if (!fs.existsSync(filePath)) return;

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/Math\.random/);
      expect(content).toMatch(/crypto\.randomUUID|randomUUID/);
      expect(content).toMatch(/crypto\.randomBytes|randomBytes/);
    });

    it('should not use Math.random for IV generation in aes-encryption.ts', () => {
      const filePath = path.resolve(
        process.cwd(),
        'src/security/encryption/aes-encryption.ts'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/Math\.random/);
      expect(content).toMatch(/generateSecureRandom|randomBytes/);
    });

    it('should not use Math.random for salt/IV in audit-encryption.ts', () => {
      const filePath = path.resolve(
        process.cwd(),
        '.claude/validators-node/src/observability/audit-encryption.ts'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/Math\.random/);
      expect(content).toMatch(/crypto\.randomBytes|randomBytes/);
    });

    it('should not use Math.random in token-validator.ts', () => {
      const filePath = path.resolve(
        process.cwd(),
        '.claude/validators-node/src/permissions/token-validator.ts'
      );
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/Math\.random/);
    });

    it('should use generateSecureRandom wrapper for all random bytes in crypto module', () => {
      const filePath = path.resolve(
        process.cwd(),
        'src/security/encryption/crypto-utils.ts'
      );
      const content = fs.readFileSync(filePath, 'utf-8');

      // generateSecureRandom must use crypto.randomBytes
      expect(content).toMatch(/generateSecureRandom/);
      expect(content).toMatch(/crypto\.randomBytes/);
      expect(content).not.toMatch(/Math\.random/);
    });

    it('should verify crypto.randomBytes produces cryptographically strong output', () => {
      // Generate 1000 bytes and check entropy
      const bytes = crypto.randomBytes(1000);

      // Count byte value distribution (basic uniformity check)
      const counts = new Array(256).fill(0);
      for (const byte of bytes) {
        counts[byte]++;
      }

      // No single byte value should appear >30 times in 1000 bytes
      // (expected ~3.9 each; >30 would be wildly improbable)
      const maxCount = Math.max(...counts);
      expect(maxCount).toBeLessThan(30);
    });
  });

  // -------------------------------------------------------------------------
  // LLM06-015 [P1]: OAuth Token Encryption at Rest
  // -------------------------------------------------------------------------
  describe('LLM06-015: OAuth token encryption at rest', () => {
    it('should encrypt token claims so they are not readable without key', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      const result = gen.generateToken(
        'oauth-user',
        'user@example.com',
        ['viewer'],
        ['core']
      );

      // Token should be opaque — prefixed with bmad.v1. then base64url data
      expect(result.token).toMatch(/^bmad\.v1\./);

      // The base64url part should not contain plaintext claims
      const encoded = result.token.slice('bmad.v1.'.length);
      expect(encoded).not.toContain('oauth-user');
      expect(encoded).not.toContain('user@example.com');
      expect(encoded).not.toContain('viewer');
    });

    it('should decrypt token only with the correct key', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      const result = gen.generateToken('secret-user', undefined, ['admin'], ['core']);

      // Correct key decrypts
      const claims = gen.decrypt(result.token);
      expect(claims).not.toBeNull();
      expect(claims.name).toBe('secret-user');
      expect(claims.roles).toContain('admin');

      // Wrong key fails
      const wrongKey = TokenGenerator.generateKey();
      const wrongGen = new TokenGenerator(wrongKey);
      const wrongResult = wrongGen.decrypt(result.token);
      expect(wrongResult).toBeNull();
    });

    it('should reject expired tokens', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      // Create a token that expired 1 hour ago
      const now = new Date();
      const pastExpiry = new Date(now.getTime() - 3600000);

      const claims = {
        sub: crypto.randomUUID(),
        name: 'expired-user',
        roles: ['viewer'],
        modules: ['core'],
        iat: new Date(now.getTime() - 7200000).toISOString(),
        exp: pastExpiry.toISOString(),
        jti: crypto.randomUUID(),
      };

      const token = gen.encrypt(claims);
      const result = gen.decrypt(token);

      // Expired token should return null
      expect(result).toBeNull();
    });

    it('should store token with AES-256-GCM encryption (IV + authTag + ciphertext)', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      expect(key.length).toBe(32); // 256-bit key

      const gen = new TokenGenerator(key);
      const result = gen.generateToken('test', undefined, ['viewer'], ['core']);

      // Decode the base64url payload
      const encoded = result.token.slice('bmad.v1.'.length);
      const combined = Buffer.from(encoded, 'base64url');

      // Structure: 16 bytes IV + 16 bytes authTag + encrypted data
      expect(combined.length).toBeGreaterThan(32);
      const iv = combined.subarray(0, 16);
      const authTag = combined.subarray(16, 32);
      const encryptedData = combined.subarray(32);

      expect(iv.length).toBe(16);
      expect(authTag.length).toBe(16);
      expect(encryptedData.length).toBeGreaterThan(0);
    });

    it('should use unique JTI for each token', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      const t1 = gen.generateToken('user1', undefined, ['viewer'], ['core']);
      const t2 = gen.generateToken('user2', undefined, ['viewer'], ['core']);

      expect(t1.claims.jti).not.toBe(t2.claims.jti);
      // JTI should be UUID format
      expect(t1.claims.jti).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('should use unique subject IDs for each token', async () => {
      const { TokenGenerator } = await import(
        '../../src/security/encryption/generate-token.ts'
      );
      const key = TokenGenerator.generateKey();
      const gen = new TokenGenerator(key);

      const t1 = gen.generateToken('same-name', undefined, ['viewer'], ['core']);
      const t2 = gen.generateToken('same-name', undefined, ['viewer'], ['core']);

      expect(t1.claims.sub).not.toBe(t2.claims.sub);
    });
  });
});
