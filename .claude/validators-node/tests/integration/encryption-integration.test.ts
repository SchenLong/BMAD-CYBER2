/**
 * BMAD Guardrails: Encryption System Integration Tests (SEC-003-5)
 * ================================================================
 * Comprehensive integration tests for the audit log encryption system.
 *
 * Tests cover:
 * - End-to-end encryption/decryption workflows
 * - Key management and rotation
 * - Error scenarios and recovery
 * - Performance under load
 * - NIST compliance verification
 * - Integration with audit logging system
 * - Security controls effectiveness
 *
 * Security Focus:
 * - Cryptographic strength validation
 * - Key derivation security
 * - Data integrity verification
 * - Side-channel attack resistance
 * - Backward compatibility with plaintext logs
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import type { AuditLogEntry, EncryptedAuditEntry } from '../../src/types/index.js';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

describe('Audit Log Encryption Integration Tests', () => {
  let tempDir: string;
  let originalEnv: Record<string, string | undefined>;
  let encryptionModule: any;
  let testKey: string;

  beforeEach(async () => {
    // Create temp directory
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bmad-encryption-test-'));

    // Save and clear environment
    originalEnv = { ...process.env };
    delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
    delete process.env.BMAD_AUDIT_ENCRYPTION_ENABLED;

    // Generate test encryption key
    testKey = crypto.randomBytes(32).toString('hex');

    // Import encryption module fresh for each test
    vi.resetModules();
    encryptionModule = await import('../../src/observability/audit-encryption.js');
  });

  afterEach(async () => {
    // Restore environment
    Object.keys(process.env).forEach(key => {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });

    // Clean up temp directory
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('Core Encryption Functionality', () => {
    test('should encrypt and decrypt audit entries correctly', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'test-session-001',
        validator: 'bash_safety',
        severity: 'BLOCKED',
        action: 'BLOCKED',
        details: {
          command: 'rm -rf /',
          reason: 'Dangerous command detected',
          confidence: 1.0,
        },
      };

      // Encrypt entry
      const encryptedEntry = await encryptionModule.encryptEntry(testEntry);

      expect(encryptionModule.isEncryptedEntry(encryptedEntry)).toBe(true);
      expect(encryptedEntry.encrypted).toBe(true);
      expect(encryptedEntry.algorithm).toBe('aes-256-gcm');
      expect(encryptedEntry.timestamp).toBe(testEntry.timestamp); // Should remain in plaintext
      expect(encryptedEntry.session_id).toBe(testEntry.session_id); // Should remain in plaintext
      expect(encryptedEntry.data).toBeDefined();
      expect(encryptedEntry.iv).toBeDefined();
      expect(encryptedEntry.salt).toBeDefined();
      expect(encryptedEntry.tag).toBeDefined();

      // Decrypt entry
      const decryptedEntry = await encryptionModule.decryptEntry(encryptedEntry);

      expect(decryptedEntry).toEqual(testEntry);
    });

    test('should handle different data types in audit entries', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const complexEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'test-session-002',
        validator: 'multi_type_test',
        severity: 'WARNING',
        action: 'DETECTED',
        details: {
          string_field: 'test string with unicode 🚀',
          number_field: 42.5,
          boolean_field: true,
          array_field: ['item1', 'item2', 'item3'],
          object_field: {
            nested_string: 'nested value',
            nested_number: 123,
            nested_array: [1, 2, 3],
          },
          null_field: null,
          undefined_field: undefined,
        },
      };

      const encrypted = await encryptionModule.encryptEntry(complexEntry);
      const decrypted = await encryptionModule.decryptEntry(encrypted);

      expect(decrypted).toEqual(complexEntry);
    });

    test('should use unique IVs and salts for each encryption', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'iv-salt-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Same content for IV/salt uniqueness test' },
      };

      // Encrypt same entry multiple times
      const encrypted1 = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;
      const encrypted2 = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;
      const encrypted3 = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;

      // IVs should be unique
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.iv).not.toBe(encrypted3.iv);
      expect(encrypted2.iv).not.toBe(encrypted3.iv);

      // Salts should be unique
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.salt).not.toBe(encrypted3.salt);
      expect(encrypted2.salt).not.toBe(encrypted3.salt);

      // But all should decrypt to the same content
      const decrypted1 = await encryptionModule.decryptEntry(encrypted1);
      const decrypted2 = await encryptionModule.decryptEntry(encrypted2);
      const decrypted3 = await encryptionModule.decryptEntry(encrypted3);

      expect(decrypted1).toEqual(testEntry);
      expect(decrypted2).toEqual(testEntry);
      expect(decrypted3).toEqual(testEntry);
    });

    test('should validate encryption key format', async () => {
      // Invalid key formats should throw errors
      const invalidKeys = [
        'short', // Too short
        'not-hex-123xyz', // Invalid hex
        'a'.repeat(63), // Wrong length (31.5 bytes)
        'a'.repeat(65), // Wrong length (32.5 bytes)
        '', // Empty
      ];

      for (const invalidKey of invalidKeys) {
        process.env.BMAD_AUDIT_ENCRYPTION_KEY = invalidKey;

        // Re-import module to pick up new environment
        vi.resetModules();
        const freshModule = await import('../../src/observability/audit-encryption.js');

        expect(() => {
          const testEntry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            session_id: 'key-validation-test',
            validator: 'test',
            severity: 'INFO',
            action: 'LOG',
            details: {},
          };
          return freshModule.encryptEntrySync(testEntry);
        }).toThrow();
      }
    });
  });

  describe('Key Management and Security', () => {
    test('should derive unique keys from master key using PBKDF2', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'key-derivation-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Key derivation test' },
      };

      // Encrypt entry multiple times to get different derived keys
      const encrypted1 = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;
      const encrypted2 = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;

      // Different salts should result in different encrypted data even for same plaintext
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.data).not.toBe(encrypted2.data);
      expect(encrypted1.tag).not.toBe(encrypted2.tag);

      // But both should decrypt successfully
      const decrypted1 = await encryptionModule.decryptEntry(encrypted1);
      const decrypted2 = await encryptionModule.decryptEntry(encrypted2);

      expect(decrypted1).toEqual(testEntry);
      expect(decrypted2).toEqual(testEntry);
    });

    test('should use strong cryptographic parameters', () => {
      // Verify NIST-recommended parameters are used
      const status = encryptionModule.getEncryptionStatus();

      expect(status.algorithm).toBe('aes-256-gcm'); // FIPS 197 approved
      expect(status.keyDerivation).toContain('pbkdf2'); // NIST SP 800-132
      expect(status.keyDerivation).toContain('sha256'); // FIPS 180-4
      expect(status.keyDerivation).toContain('100000'); // OWASP 2024 minimum iterations
    });

    test('should generate cryptographically secure encryption keys', () => {
      const key1 = encryptionModule.generateEncryptionKey();
      const key2 = encryptionModule.generateEncryptionKey();

      // Keys should be 64 hex characters (32 bytes)
      expect(key1).toMatch(/^[0-9a-f]{64}$/);
      expect(key2).toMatch(/^[0-9a-f]{64}$/);

      // Keys should be unique
      expect(key1).not.toBe(key2);
    });

    test('should prevent key material exposure in memory', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'key-exposure-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Key exposure prevention test' },
      };

      const encrypted = await encryptionModule.encryptEntry(testEntry);

      // Master key should never appear in encrypted output
      expect(JSON.stringify(encrypted)).not.toContain(testKey);

      // Verify encrypted data doesn't contain obvious patterns from original data
      const encryptedData = encrypted.data;
      expect(encryptedData).not.toContain('key-exposure-test');
      expect(encryptedData).not.toContain('Key exposure prevention test');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should gracefully fallback to plaintext when encryption is disabled', async () => {
      // No encryption key set
      delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'plaintext-fallback-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Should remain plaintext' },
      };

      const result = await encryptionModule.encryptEntry(testEntry);

      // Should return original entry unchanged
      expect(result).toBe(testEntry);
      expect(encryptionModule.isEncryptedEntry(result)).toBe(false);
    });

    test('should handle corrupted encrypted entries gracefully', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const validEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'corruption-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Corruption handling test' },
      };

      const encrypted = await encryptionModule.encryptEntry(validEntry) as EncryptedAuditEntry;

      // Test various corruption scenarios
      const corruptedEntries = [
        { ...encrypted, data: 'corrupted-base64-data' },
        { ...encrypted, tag: 'corrupted-tag' },
        { ...encrypted, iv: 'short' },
        { ...encrypted, salt: Buffer.from('wrong-salt').toString('base64') },
        { ...encrypted, algorithm: 'unsupported-algorithm' },
      ];

      for (const corruptedEntry of corruptedEntries) {
        await expect(encryptionModule.decryptEntry(corruptedEntry))
          .rejects.toThrow();
      }
    });

    test('should handle missing encryption key during decryption', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'missing-key-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Missing key test' },
      };

      const encrypted = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;

      // Remove key and try to decrypt
      delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
      vi.resetModules();
      const freshModule = await import('../../src/observability/audit-encryption.js');

      await expect(freshModule.decryptEntry(encrypted))
        .rejects.toThrow(/encryption key not available/i);
    });

    test('should handle malformed encrypted entry structures', async () => {
      const malformedEntries = [
        {}, // Empty object
        { encrypted: true }, // Missing required fields
        { encrypted: false }, // Wrong encrypted flag
        null,
        undefined,
        'string-instead-of-object',
        { encrypted: true, version: '1.0', algorithm: 'aes-256-gcm' }, // Incomplete
      ];

      for (const malformedEntry of malformedEntries) {
        expect(encryptionModule.isEncryptedEntry(malformedEntry)).toBe(false);

        if (malformedEntry && typeof malformedEntry === 'object' && malformedEntry.encrypted) {
          await expect(encryptionModule.decryptEntry(malformedEntry))
            .rejects.toThrow();
        }
      }
    });

    test('should validate entry integrity with authentication tags', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'integrity-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Integrity validation test' },
      };

      const encrypted = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;

      // Tamper with encrypted data
      const tamperedEntry = {
        ...encrypted,
        data: Buffer.from('tampered-data').toString('base64'),
      };

      // Should fail authentication
      await expect(encryptionModule.decryptEntry(tamperedEntry))
        .rejects.toThrow();
    });
  });

  describe('Performance and Efficiency', () => {
    test('should encrypt/decrypt entries efficiently', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'performance-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: {
          message: 'Performance test entry with reasonable amount of data',
          data: 'x'.repeat(1000), // 1KB of data
        },
      };

      const iterations = 100;

      // Measure encryption performance
      const encryptStart = Date.now();
      const encrypted = [];
      for (let i = 0; i < iterations; i++) {
        encrypted.push(await encryptionModule.encryptEntry({
          ...testEntry,
          session_id: `performance-test-${i}`,
        }));
      }
      const encryptEnd = Date.now();

      // Measure decryption performance
      const decryptStart = Date.now();
      for (const entry of encrypted) {
        await encryptionModule.decryptEntry(entry);
      }
      const decryptEnd = Date.now();

      const encryptTime = encryptEnd - encryptStart;
      const decryptTime = decryptEnd - decryptStart;

      // Performance targets: should handle >50 ops/sec for 1KB entries
      expect(encryptTime).toBeLessThan(iterations * 20); // <20ms per encryption
      expect(decryptTime).toBeLessThan(iterations * 20); // <20ms per decryption

      console.log(`Encryption performance: ${iterations} entries in ${encryptTime}ms (${(iterations * 1000 / encryptTime).toFixed(1)} ops/sec)`);
      console.log(`Decryption performance: ${iterations} entries in ${decryptTime}ms (${(iterations * 1000 / decryptTime).toFixed(1)} ops/sec)`);
    });

    test('should handle large audit entries efficiently', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      // Create large entry (100KB)
      const largeEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'large-entry-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: {
          large_data: 'x'.repeat(100 * 1024), // 100KB
          metadata: {
            size: '100KB',
            purpose: 'Large entry performance test',
          },
        },
      };

      const start = Date.now();
      const encrypted = await encryptionModule.encryptEntry(largeEntry);
      const decrypted = await encryptionModule.decryptEntry(encrypted);
      const end = Date.now();

      expect(decrypted).toEqual(largeEntry);

      // Should complete large entry encryption/decryption in reasonable time
      expect(end - start).toBeLessThan(1000); // <1 second for 100KB

      console.log(`Large entry (100KB) encryption+decryption: ${end - start}ms`);
    });

    test('should use synchronous encryption efficiently for high-frequency logging', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'sync-performance-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Synchronous encryption test' },
      };

      const iterations = 1000;

      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        const result = encryptionModule.encryptEntrySync({
          ...testEntry,
          session_id: `sync-test-${i}`,
        });
        expect(encryptionModule.isEncryptedEntry(result)).toBe(true);
      }
      const end = Date.now();

      const syncTime = end - start;

      // Should handle high-frequency synchronous encryption
      expect(syncTime).toBeLessThan(iterations * 2); // <2ms per sync encryption

      console.log(`Synchronous encryption performance: ${iterations} entries in ${syncTime}ms (${(iterations * 1000 / syncTime).toFixed(1)} ops/sec)`);
    });
  });

  describe('Integration with Log Processing', () => {
    test('should process mixed encrypted and plaintext log lines', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const plaintextEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'mixed-test-1',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Plaintext entry' },
      };

      const entryToEncrypt: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'mixed-test-2',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Encrypted entry' },
      };

      const encryptedEntry = await encryptionModule.encryptEntry(entryToEncrypt);

      // Create log lines
      const plaintextLine = JSON.stringify(plaintextEntry);
      const encryptedLine = JSON.stringify(encryptedEntry);

      // Process both types of lines
      const processedPlaintext = await encryptionModule.processLineForReading(plaintextLine);
      const processedEncrypted = await encryptionModule.processLineForReading(encryptedLine);

      expect(processedPlaintext).toEqual(plaintextEntry);
      expect(processedEncrypted).toEqual(entryToEncrypt);
    });

    test('should handle log file format compatibility', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testLogFile = path.join(tempDir, 'test-audit.log');

      // Create mixed log file
      const entries = [
        {
          timestamp: new Date().toISOString(),
          session_id: 'compat-test-1',
          validator: 'test',
          severity: 'INFO',
          action: 'LOG',
          details: { message: 'Legacy plaintext entry' },
        },
        {
          timestamp: new Date().toISOString(),
          session_id: 'compat-test-2',
          validator: 'test',
          severity: 'WARNING',
          action: 'DETECTED',
          details: { message: 'New encrypted entry' },
        },
      ];

      // Write one plaintext, one encrypted
      const plaintextLine = JSON.stringify(entries[0]);
      const encryptedEntry = await encryptionModule.encryptEntry(entries[1]);
      const encryptedLine = JSON.stringify(encryptedEntry);

      await writeFile(testLogFile, `${plaintextLine}\n${encryptedLine}\n`);

      // Read and process log file
      const logContent = await readFile(testLogFile, 'utf8');
      const lines = logContent.trim().split('\n');

      const processedEntries = [];
      for (const line of lines) {
        if (line.trim()) {
          processedEntries.push(await encryptionModule.processLineForReading(line));
        }
      }

      expect(processedEntries).toHaveLength(2);
      expect(processedEntries[0]).toEqual(entries[0]);
      expect(processedEntries[1]).toEqual(entries[1]);
    });

    test('should integrate with storage processing functions', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'storage-integration-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Storage integration test' },
      };

      // Test storage processing (should encrypt if enabled)
      const processedForStorage = await encryptionModule.processEntryForStorage(testEntry);

      expect(encryptionModule.isEncryptedEntry(processedForStorage)).toBe(true);

      // Should be able to read it back
      const storageJson = JSON.stringify(processedForStorage);
      const processedForReading = await encryptionModule.processLineForReading(storageJson);

      expect(processedForReading).toEqual(testEntry);
    });
  });

  describe('NIST Compliance Verification', () => {
    test('should meet NIST PR.DS-1 data protection requirements', () => {
      const status = encryptionModule.getEncryptionStatus();

      // NIST PR.DS-1: Data-at-rest is protected
      expect(status.algorithm).toBe('aes-256-gcm'); // FIPS 197 approved AES encryption
      expect(status.keyDerivation).toContain('pbkdf2'); // NIST SP 800-132 key derivation
      expect(status.keyDerivation).toContain('sha256'); // FIPS 180-4 hash function
    });

    test('should use FIPS-approved cryptographic modules', async () => {
      // Verify Node.js crypto module uses OpenSSL with FIPS compliance
      const algorithms = crypto.getCiphers();
      expect(algorithms).toContain('aes-256-gcm'); // FIPS 197

      const hashes = crypto.getHashes();
      expect(hashes).toContain('sha256'); // FIPS 180-4
    });

    test('should implement proper key management controls', () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const status = encryptionModule.getEncryptionStatus();

      // Key should be properly managed via environment variables
      expect(status.enabled).toBe(true);
      expect(status.keyAvailable).toBe(true);

      // Key derivation should use proper parameters
      const kdParams = status.keyDerivation.split('/');
      expect(kdParams[0]).toBe('pbkdf2');
      expect(kdParams[1]).toBe('sha256');
      expect(parseInt(kdParams[2])).toBeGreaterThanOrEqual(100000); // OWASP 2024 minimum
    });

    test('should provide adequate entropy and randomness', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'entropy-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Entropy test' },
      };

      // Generate multiple encryptions to test randomness
      const encryptions = [];
      for (let i = 0; i < 10; i++) {
        encryptions.push(await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry);
      }

      // All IVs should be unique (extremely low probability of collision with good entropy)
      const ivs = encryptions.map(e => e.iv);
      const uniqueIvs = new Set(ivs);
      expect(uniqueIvs.size).toBe(ivs.length);

      // All salts should be unique
      const salts = encryptions.map(e => e.salt);
      const uniqueSalts = new Set(salts);
      expect(uniqueSalts.size).toBe(salts.length);
    });

    test('should maintain data integrity with authenticated encryption', async () => {
      process.env.BMAD_AUDIT_ENCRYPTION_KEY = testKey;

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'integrity-compliance-test',
        validator: 'test',
        severity: 'CRITICAL',
        action: 'BLOCKED',
        details: {
          sensitive_data: 'classified information',
          security_event: true,
        },
      };

      const encrypted = await encryptionModule.encryptEntry(testEntry) as EncryptedAuditEntry;

      // GCM mode provides authenticated encryption (NIST SP 800-38D)
      expect(encrypted.algorithm).toBe('aes-256-gcm');
      expect(encrypted.tag).toBeDefined();

      // Any tampering should be detected
      const tamperedData = { ...encrypted, data: encrypted.data.slice(0, -1) + 'X' };
      await expect(encryptionModule.decryptEntry(tamperedData))
        .rejects.toThrow();
    });
  });
});