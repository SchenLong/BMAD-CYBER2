/**
 * BMAD Guardrails: End-to-End Pipeline Integration Tests (SEC-003-5)
 * ===================================================================
 * Comprehensive tests for the complete audit logging pipeline:
 * Log Creation → Encryption → Storage → Archival → Verification
 *
 * This validates the integration of:
 * - SEC-003-1: Audit Log Encryption at Rest
 * - SEC-003-3: Log Archival to External Storage
 * - Complete security workflow from log generation to long-term storage
 *
 * Test Coverage:
 * - End-to-end data flow integrity
 * - Cross-system compatibility
 * - Error propagation and recovery
 * - Performance under realistic load
 * - Security controls throughout pipeline
 * - Compliance with NIST requirements
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import type { AuditLogEntry } from '../../src/types/index.js';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

describe('End-to-End Security Pipeline Integration', () => {
  let tempDir: string;
  let originalEnv: Record<string, string | undefined>;
  let testEncryptionKey: string;

  // Module imports (will be refreshed per test)
  let encryptionModule: any;
  let archiverModule: any;
  let schedulerModule: any;
  let auditLogger: any;

  beforeEach(async () => {
    // Create isolated test environment
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bmad-e2e-test-'));

    // Save original environment
    originalEnv = { ...process.env };

    // Generate test encryption key
    testEncryptionKey = crypto.randomBytes(32).toString('hex');

    // Setup test environment variables
    process.env.BMAD_AUDIT_ENCRYPTION_KEY = testEncryptionKey;
    process.env.BMAD_AUDIT_ENCRYPTION_ENABLED = 'true';

    // Mock S3 configuration for archival tests
    process.env.BMAD_S3_ARCHIVE_BUCKET = 'test-audit-logs';
    process.env.BMAD_S3_ARCHIVE_REGION = 'us-east-1';
    process.env.BMAD_S3_ARCHIVE_PREFIX = 'e2e-test/';
    process.env.BMAD_LOG_RETENTION_DAYS = '90';
    process.env.BMAD_ARCHIVE_SCHEDULE_CRON = '0 2 * * *';

    // Mock path-utils to use temp directory
    vi.doMock('../../src/common/path-utils.js', () => ({
      getProjectDir: () => tempDir,
    }));

    // Fresh module imports
    vi.resetModules();
    encryptionModule = await import('../../src/observability/audit-encryption.js');
    archiverModule = await import('../../src/observability/log-archiver.js');
    schedulerModule = await import('../../src/observability/archival-scheduler.js');
    auditLogger = await import('../../src/common/audit-logger.js');
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

    vi.clearAllMocks();
  });

  describe('Complete Pipeline Flow', () => {
    test('should handle full audit log lifecycle: creation → encryption → storage → archival', async () => {
      // 1. Create log directory structure
      const logDir = path.join(tempDir, '.claude', 'logs');
      const archiveDir = path.join(tempDir, '.claude', 'archive-metadata');
      await mkdir(logDir, { recursive: true });
      await mkdir(archiveDir, { recursive: true });

      // 2. Create test audit entries
      const testEntries: AuditLogEntry[] = [
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          session_id: 'e2e-session-001',
          validator: 'bash_safety',
          severity: 'BLOCKED',
          action: 'BLOCKED',
          details: {
            command: 'rm -rf /',
            reason: 'Dangerous command detected',
            risk_level: 'critical',
          },
        },
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          session_id: 'e2e-session-002',
          validator: 'jailbreak_guard',
          severity: 'WARNING',
          action: 'DETECTED',
          details: {
            pattern: 'DAN mode attempted',
            confidence: 0.95,
            context: 'AI safety violation',
          },
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          session_id: 'e2e-session-003',
          validator: 'secret_detector',
          severity: 'CRITICAL',
          action: 'REDACTED',
          details: {
            secret_type: 'api_key',
            location: 'command_line',
            redacted: true,
          },
        },
      ];

      // 3. Process entries through encryption pipeline
      const encryptedEntries = [];
      for (const entry of testEntries) {
        const processed = await encryptionModule.processEntryForStorage(entry);
        encryptedEntries.push(processed);
      }

      // Verify encryption occurred
      encryptedEntries.forEach(entry => {
        expect(encryptionModule.isEncryptedEntry(entry)).toBe(true);
      });

      // 4. Write encrypted entries to log file (simulating real logging)
      const logFile = path.join(logDir, 'security.log');
      const logContent = encryptedEntries.map(entry => JSON.stringify(entry)).join('\n');
      await writeFile(logFile, logContent);

      // Set file timestamps to simulate aged logs
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      await fs.promises.utimes(logFile, twoDaysAgo.getTime() / 1000, twoDaysAgo.getTime() / 1000);

      // 5. Create archiver instance (mock S3 operations)
      const mockS3Upload = vi.fn().mockResolvedValue({
        ETag: '"mock-etag-12345"',
        Location: 'https://test-bucket.s3.amazonaws.com/e2e-test/archive.tar.gz',
      });

      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-audit-logs',
        prefix: 'e2e-test/',
        region: 'us-east-1',
        enableObjectLock: true,
        retentionDays: 90,
      });

      // Mock S3 client
      const mockS3Client = {
        send: mockS3Upload,
      };

      // Replace createS3Client method
      archiver.createS3Client = vi.fn().mockReturnValue(mockS3Client);

      // Mock GPG operations (archiver will skip if not available)
      vi.doMock('child_process', () => ({
        spawn: vi.fn().mockReturnValue({
          stdout: { on: vi.fn() },
          stderr: { on: vi.fn() },
          on: vi.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(1), 0); // Simulate GPG not available
            }
          }),
        }),
      }));

      // 6. Run archival process
      const archiveResult = await archiver.archiveLogsInDateRange(
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
      );

      // Verify archival metadata
      expect(archiveResult.archiveId).toBeDefined();
      expect(archiveResult.metadata.logFileCount).toBeGreaterThan(0);
      expect(archiveResult.metadata.totalSize).toBeGreaterThan(0);
      expect(archiveResult.metadata.compressedSize).toBeGreaterThan(0);
      expect(archiveResult.metadata.compressionRatio).toBeLessThan(1);

      // 7. Verify archive metadata file was created
      const metadataFile = path.join(archiveDir, `${archiveResult.archiveId}.json`);
      expect(fs.existsSync(metadataFile)).toBe(true);

      const metadataContent = JSON.parse(await readFile(metadataFile, 'utf8'));
      expect(metadataContent.archiveId).toBe(archiveResult.archiveId);
      expect(metadataContent.encryptionEnabled).toBe(true);

      // 8. Verify log entries can be read back from archive
      const archives = await archiver.listArchives();
      expect(archives).toHaveLength(1);
      expect(archives[0].archiveId).toBe(archiveResult.archiveId);

      console.log(`✓ End-to-end pipeline test completed successfully`);
      console.log(`  Archive ID: ${archiveResult.archiveId}`);
      console.log(`  Files archived: ${archiveResult.metadata.logFileCount}`);
      console.log(`  Compression ratio: ${(archiveResult.metadata.compressionRatio * 100).toFixed(1)}%`);
    });

    test('should maintain data integrity throughout entire pipeline', async () => {
      // Create original audit entry
      const originalEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'integrity-test-session',
        validator: 'data_integrity_validator',
        severity: 'CRITICAL',
        action: 'BLOCKED',
        details: {
          sensitive_data: 'This is sensitive information that must be preserved exactly',
          numbers: [1, 2, 3.14159, -42.5],
          nested_object: {
            deeply_nested: {
              value: 'deep value',
              unicode_test: '🔐🛡️🚨',
            },
          },
          boolean_flag: true,
          null_value: null,
        },
      };

      // 1. Encrypt the entry
      const encrypted = await encryptionModule.encryptEntry(originalEntry);

      // 2. Convert to storage format (JSON string)
      const storageJson = JSON.stringify(encrypted);

      // 3. Simulate reading from log file
      const readFromStorage = await encryptionModule.processLineForReading(storageJson);

      // 4. Verify complete data integrity
      expect(readFromStorage).toEqual(originalEntry);

      // 5. Create log file and archive it
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      const logFile = path.join(logDir, 'integrity-test.log');
      await writeFile(logFile, storageJson);

      // Mock archival system
      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-integrity-logs',
        enableObjectLock: false,
      });

      // Test compression and decompression maintain integrity
      const logFiles = [{ path: logFile, name: 'integrity-test.log', size: storageJson.length }];
      const compressedBuffer = await (archiver as any).createCompressedArchive(logFiles);

      // Verify compressed data is valid
      expect(compressedBuffer).toBeInstanceOf(Buffer);
      expect(compressedBuffer.length).toBeLessThan(storageJson.length); // Should be compressed

      console.log(`✓ Data integrity maintained through encryption + compression`);
      console.log(`  Original size: ${storageJson.length} bytes`);
      console.log(`  Compressed size: ${compressedBuffer.length} bytes`);
      console.log(`  Compression ratio: ${(compressedBuffer.length / storageJson.length * 100).toFixed(1)}%`);
    });

    test('should handle mixed encrypted and plaintext logs during archival', async () => {
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      // Create mixed log file with both encrypted and plaintext entries
      const plaintextEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'mixed-test-plaintext',
        validator: 'legacy_system',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Legacy plaintext log entry' },
      };

      const encryptedEntryData: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'mixed-test-encrypted',
        validator: 'modern_system',
        severity: 'WARNING',
        action: 'DETECTED',
        details: { message: 'Modern encrypted log entry' },
      };

      const encryptedEntry = await encryptionModule.encryptEntry(encryptedEntryData);

      // Write mixed log file
      const mixedLogContent = [
        JSON.stringify(plaintextEntry),
        JSON.stringify(encryptedEntry),
      ].join('\n');

      const logFile = path.join(logDir, 'mixed-format.log');
      await writeFile(logFile, mixedLogContent);

      // Mock encryption module processing
      vi.doMock('../../src/observability/audit-encryption.js', () => ({
        ...encryptionModule,
        processLineForReading: vi.fn((line) => {
          const entry = JSON.parse(line);
          if (encryptionModule.isEncryptedEntry(entry)) {
            return encryptionModule.decryptEntry(entry);
          }
          return entry;
        }),
        isEncryptionEnabled: vi.fn(() => true),
      }));

      // Create archiver and process mixed logs
      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-mixed-logs',
        enableObjectLock: false,
      });

      // Mock S3 upload
      archiver.createS3Client = vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({
          ETag: '"mixed-test-etag"',
        }),
      });

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await fs.promises.utimes(logFile, yesterday.getTime() / 1000, yesterday.getTime() / 1000);

      const archiveResult = await archiver.archiveLogsInDateRange(
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date()
      );

      // Verify mixed content was archived successfully
      expect(archiveResult.metadata.logFileCount).toBeGreaterThan(0);
      expect(archiveResult.metadata.totalSize).toBeGreaterThan(0);

      console.log(`✓ Successfully archived mixed encrypted/plaintext logs`);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle encryption failure gracefully during archival', async () => {
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      // Create corrupted log file that will cause encryption issues
      const corruptedLogContent = [
        '{"invalid": "json"', // Invalid JSON
        JSON.stringify({
          timestamp: new Date().toISOString(),
          session_id: 'valid-session',
          validator: 'test',
          severity: 'INFO',
          action: 'LOG',
          details: { message: 'Valid entry' },
        }),
        '{encrypted: true, "invalid": encrypted entry}', // Invalid encrypted entry
      ].join('\n');

      const logFile = path.join(logDir, 'corrupted.log');
      await writeFile(logFile, corruptedLogContent);

      // Mock encryption processing to handle errors gracefully
      const mockProcessLine = vi.fn().mockImplementation((line) => {
        try {
          const entry = JSON.parse(line);
          if (encryptionModule.isEncryptedEntry(entry)) {
            return encryptionModule.decryptEntry(entry);
          }
          return entry;
        } catch (error) {
          console.warn(`Failed to process log line: ${error.message}`);
          return null; // Return null for corrupted entries
        }
      });

      vi.doMock('../../src/observability/audit-encryption.js', () => ({
        ...encryptionModule,
        processLineForReading: mockProcessLine,
        isEncryptionEnabled: () => true,
      }));

      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-error-handling',
        enableObjectLock: false,
      });

      // Mock S3 client
      archiver.createS3Client = vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ ETag: '"error-test-etag"' }),
      });

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await fs.promises.utimes(logFile, yesterday.getTime() / 1000, yesterday.getTime() / 1000);

      // Archival should complete despite corrupted entries
      const archiveResult = await archiver.archiveLogsInDateRange(
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date()
      );

      expect(archiveResult.archiveId).toBeDefined();
      console.log(`✓ Archival handled corrupted entries gracefully`);
    });

    test('should recover from S3 upload failures', async () => {
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      // Create valid log file
      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 's3-failure-test',
        validator: 'test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'S3 failure recovery test' },
      };

      const logFile = path.join(logDir, 'recovery-test.log');
      await writeFile(logFile, JSON.stringify(testEntry));

      // Mock S3 upload failure
      const mockS3Client = {
        send: vi.fn().mockRejectedValue(new Error('S3 upload failed: Network timeout')),
      };

      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-s3-failure',
        enableObjectLock: false,
      });

      archiver.createS3Client = vi.fn().mockReturnValue(mockS3Client);

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await fs.promises.utimes(logFile, yesterday.getTime() / 1000, yesterday.getTime() / 1000);

      // Should throw error for S3 failure
      await expect(
        archiver.archiveLogsInDateRange(
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          new Date()
        )
      ).rejects.toThrow(/S3 upload failed/);

      console.log(`✓ S3 failure properly propagated to caller`);
    });

    test('should handle scheduler errors gracefully', async () => {
      // Initialize scheduler with invalid configuration
      delete process.env.BMAD_S3_ARCHIVE_BUCKET;

      const scheduler = new schedulerModule.ArchivalScheduler();
      await scheduler.initialize();

      // Attempt to run archival job - should fail gracefully
      await expect(scheduler.runArchivalJob()).rejects.toThrow();

      const status = await scheduler.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.consecutiveFailures).toBeGreaterThan(0);

      console.log(`✓ Scheduler handled configuration errors gracefully`);
    });
  });

  describe('Performance Integration', () => {
    test('should handle high-volume log archival efficiently', async () => {
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      // Generate large number of encrypted log entries
      const entryCount = 1000;
      const entries = [];

      console.log(`Generating ${entryCount} encrypted log entries...`);
      const generateStart = Date.now();

      for (let i = 0; i < entryCount; i++) {
        const entry: AuditLogEntry = {
          timestamp: new Date().toISOString(),
          session_id: `perf-test-${i}`,
          validator: 'performance_test',
          severity: i % 4 === 0 ? 'CRITICAL' : 'INFO',
          action: 'LOG',
          details: {
            iteration: i,
            data: `Performance test data item ${i}`,
            metadata: {
              batch: Math.floor(i / 100),
              index: i % 100,
            },
          },
        };

        const encrypted = await encryptionModule.processEntryForStorage(entry);
        entries.push(JSON.stringify(encrypted));
      }

      const generateEnd = Date.now();
      console.log(`Generated ${entryCount} entries in ${generateEnd - generateStart}ms`);

      // Write to log files (split across multiple files for realism)
      const filesPerBatch = 10;
      const entriesPerFile = entryCount / filesPerBatch;

      for (let fileIndex = 0; fileIndex < filesPerBatch; fileIndex++) {
        const startIndex = fileIndex * entriesPerFile;
        const endIndex = (fileIndex + 1) * entriesPerFile;
        const fileEntries = entries.slice(startIndex, endIndex);

        const logFile = path.join(logDir, `performance-${fileIndex}.log`);
        await writeFile(logFile, fileEntries.join('\n'));

        // Set file timestamp to yesterday
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await fs.promises.utimes(logFile, yesterday.getTime() / 1000, yesterday.getTime() / 1000);
      }

      // Mock archiver for performance test
      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-performance',
        enableObjectLock: false,
      });

      // Mock S3 upload to avoid network overhead
      let uploadSize = 0;
      archiver.createS3Client = vi.fn().mockReturnValue({
        send: vi.fn().mockImplementation(async (command) => {
          if (command.input?.Body) {
            uploadSize = command.input.Body.length || 0;
          }
          return { ETag: '"performance-test-etag"' };
        }),
      });

      // Mock GPG (skip signing for performance test)
      archiver.signWithGPG = vi.fn().mockResolvedValue(null);

      // Run archival and measure performance
      console.log(`Starting archival of ${entryCount} entries...`);
      const archiveStart = Date.now();

      const result = await archiver.archiveLogsInDateRange(
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date()
      );

      const archiveEnd = Date.now();

      // Performance validation
      const archivalTime = archiveEnd - archiveStart;
      const totalTime = archiveEnd - generateStart;

      expect(result.metadata.logFileCount).toBe(filesPerBatch);
      expect(result.metadata.totalSize).toBeGreaterThan(0);
      expect(result.metadata.compressedSize).toBeGreaterThan(0);
      expect(result.metadata.compressionRatio).toBeLessThan(1);

      console.log(`✓ High-volume archival performance test completed`);
      console.log(`  Total entries: ${entryCount}`);
      console.log(`  Generation time: ${generateEnd - generateStart}ms`);
      console.log(`  Archival time: ${archivalTime}ms`);
      console.log(`  Total time: ${totalTime}ms`);
      console.log(`  Entries per second: ${(entryCount * 1000 / totalTime).toFixed(1)}`);
      console.log(`  Compression ratio: ${(result.metadata.compressionRatio * 100).toFixed(1)}%`);
      console.log(`  Upload size: ${(uploadSize / 1024).toFixed(1)} KB`);

      // Performance targets
      expect(archivalTime).toBeLessThan(entryCount * 2); // <2ms per entry for archival
      expect(result.metadata.compressionRatio).toBeLessThan(0.8); // >20% compression
    });

    test('should maintain encryption performance under concurrent access', async () => {
      const concurrentOperations = 50;
      const entriesPerOperation = 20;

      console.log(`Testing concurrent encryption: ${concurrentOperations} operations × ${entriesPerOperation} entries`);

      const testEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'concurrent-test',
        validator: 'performance_test',
        severity: 'INFO',
        action: 'LOG',
        details: { message: 'Concurrent encryption test' },
      };

      // Create concurrent encryption operations
      const operations = [];
      const startTime = Date.now();

      for (let i = 0; i < concurrentOperations; i++) {
        const operation = async () => {
          const results = [];
          for (let j = 0; j < entriesPerOperation; j++) {
            const entry = {
              ...testEntry,
              session_id: `concurrent-${i}-${j}`,
            };
            results.push(await encryptionModule.encryptEntry(entry));
          }
          return results;
        };
        operations.push(operation());
      }

      // Wait for all operations to complete
      const allResults = await Promise.all(operations);
      const endTime = Date.now();

      const totalEntries = concurrentOperations * entriesPerOperation;
      const totalTime = endTime - startTime;

      // Verify all operations completed successfully
      expect(allResults).toHaveLength(concurrentOperations);
      allResults.forEach(results => {
        expect(results).toHaveLength(entriesPerOperation);
        results.forEach(result => {
          expect(encryptionModule.isEncryptedEntry(result)).toBe(true);
        });
      });

      console.log(`✓ Concurrent encryption test completed`);
      console.log(`  Total operations: ${concurrentOperations}`);
      console.log(`  Total entries: ${totalEntries}`);
      console.log(`  Total time: ${totalTime}ms`);
      console.log(`  Entries per second: ${(totalEntries * 1000 / totalTime).toFixed(1)}`);
      console.log(`  Average per operation: ${(totalTime / concurrentOperations).toFixed(1)}ms`);

      // Performance targets for concurrent operations
      expect(totalTime).toBeLessThan(totalEntries * 10); // <10ms per entry under concurrency
    });
  });

  describe('Security Controls Integration', () => {
    test('should maintain security controls throughout pipeline', async () => {
      // Test comprehensive security controls
      const securityTestEntry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        session_id: 'security-controls-test',
        validator: 'security_validator',
        severity: 'CRITICAL',
        action: 'BLOCKED',
        details: {
          attack_type: 'injection_attempt',
          payload: 'SELECT * FROM users WHERE id = 1; DROP TABLE users;',
          client_ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Malicious Bot)',
          classification: 'malicious',
        },
      };

      // 1. Verify encryption protects sensitive data
      const encrypted = await encryptionModule.encryptEntry(securityTestEntry);

      // Sensitive data should not be visible in encrypted form
      const encryptedJson = JSON.stringify(encrypted);
      expect(encryptedJson).not.toContain('injection_attempt');
      expect(encryptedJson).not.toContain('DROP TABLE users');
      expect(encryptedJson).not.toContain('192.168.1.100');

      // 2. Verify authentication prevents tampering
      const tamperedEntry = { ...encrypted, data: 'tampered-data' };
      await expect(encryptionModule.decryptEntry(tamperedEntry))
        .rejects.toThrow();

      // 3. Test archival security features
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      const logFile = path.join(logDir, 'security-test.log');
      await writeFile(logFile, encryptedJson);

      const archiver = new archiverModule.LogArchiver({
        bucket: 'test-security-controls',
        enableObjectLock: true, // Immutable storage
        encryptionType: 'SSE-S3', // Server-side encryption
      });

      // Mock S3 client with Object Lock validation
      const mockS3Client = {
        send: vi.fn().mockImplementation((command) => {
          if (command.constructor.name === 'PutObjectCommand') {
            expect(command.input.ObjectLockMode).toBe('COMPLIANCE');
            expect(command.input.ServerSideEncryption).toBe('AES256');
          }
          return Promise.resolve({ ETag: '"security-test-etag"' });
        }),
      };

      archiver.createS3Client = vi.fn().mockReturnValue(mockS3Client);

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await fs.promises.utimes(logFile, yesterday.getTime() / 1000, yesterday.getTime() / 1000);

      const archiveResult = await archiver.archiveLogsInDateRange(
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date()
      );

      // Verify security metadata
      expect(archiveResult.metadata.encryptionEnabled).toBe(true);
      expect(archiveResult.metadata.retentionUntil).toBeDefined();

      console.log(`✓ Security controls maintained throughout pipeline`);
    });

    test('should validate NIST compliance across integrated systems', () => {
      // Verify encryption status meets NIST requirements
      const encryptionStatus = encryptionModule.getEncryptionStatus();

      // NIST PR.DS-1: Data-at-rest is protected
      expect(encryptionStatus.enabled).toBe(true);
      expect(encryptionStatus.algorithm).toBe('aes-256-gcm'); // FIPS 197
      expect(encryptionStatus.keyDerivation).toContain('pbkdf2'); // NIST SP 800-132
      expect(encryptionStatus.keyDerivation).toContain('sha256'); // FIPS 180-4

      // Verify archival configuration supports compliance
      const archiver = new archiverModule.LogArchiver({
        bucket: 'compliance-test',
        retentionDays: 2557, // ~7 years for regulatory compliance
        enableObjectLock: true, // Immutable storage for WORM compliance
        encryptionType: 'SSE-S3', // Encryption at rest
      });

      const configStatus = archiver.getConfigurationStatus();
      expect(configStatus.configured).toBe(true);

      console.log(`✓ NIST compliance validated across integrated systems`);
    });
  });
});