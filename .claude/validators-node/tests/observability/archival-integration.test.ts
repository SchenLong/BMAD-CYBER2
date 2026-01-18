/**
 * BMAD Guardrails: Archival Integration Tests (SEC-003-3)
 * ========================================================
 * Integration tests for log archival system without external dependencies.
 *
 * Tests the complete archival workflow:
 * 1. Configuration validation and loading
 * 2. Local log file processing
 * 3. Archive metadata management
 * 4. Scheduler integration
 * 5. Audit logger integration
 * 6. Error handling and recovery
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { promisify } from 'node:util';
import type { AuditLogEntry } from '../../src/types/index.js';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

describe('Archival System Integration', () => {
  let tempDir: string;
  let originalEnv: Record<string, string | undefined>;

  beforeEach(async () => {
    // Create temp directory
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bmad-archival-integration-'));

    // Save original environment
    originalEnv = { ...process.env };

    // Clear AWS SDK mocks
    vi.clearAllMocks();
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

  describe('Configuration System', () => {
    test('should validate configuration requirements', async () => {
      const { ArchivalConfigManager } = await import('../../src/observability/archival-config.js');
      const configManager = new ArchivalConfigManager();

      // Test without required bucket
      const result1 = await configManager.loadConfiguration();
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('S3 bucket name is required');

      // Test with valid bucket
      process.env.BMAD_S3_ARCHIVE_BUCKET = 'test-bucket';
      const result2 = await configManager.loadConfiguration();
      expect(result2.config?.bucket).toBe('test-bucket');
    });

    test('should generate example configuration', async () => {
      const { ArchivalConfigManager } = await import('../../src/observability/archival-config.js');
      const configManager = new ArchivalConfigManager();

      const example = configManager.generateExampleConfig();
      expect(example.bucket).toBeDefined();
      expect(example.retentionDays).toBe(2557); // 7 years
      expect(example.enableObjectLock).toBe(true);
      expect(example.scheduleExpression).toBe('0 2 * * *');
    });

    test('should validate cron expressions', async () => {
      const { ArchivalConfigManager } = await import('../../src/observability/archival-config.js');
      const configManager = new ArchivalConfigManager();

      // Test private method through type assertion
      const validateCron = (configManager as any).validateCronExpression.bind(configManager);

      const validCron = validateCron('0 2 * * *');
      expect(validCron.valid).toBe(true);
      expect(validCron.description).toBe('Daily at 2:00 AM');

      const invalidCron = validateCron('invalid-cron');
      expect(invalidCron.valid).toBe(false);
    });
  });

  describe('Archive Metadata Management', () => {
    test('should create and store archive metadata', async () => {
      // Mock path utils to use temp directory
      vi.doMock('../../src/common/path-utils.js', () => ({
        getProjectDir: () => tempDir,
      }));

      const { LogArchiver } = await import('../../src/observability/log-archiver.js');

      const archiver = new LogArchiver({
        bucket: 'test-bucket',
        enableObjectLock: false,
      });

      // Create metadata directory
      const metadataDir = path.join(tempDir, '.claude', 'archive-metadata');
      await mkdir(metadataDir, { recursive: true });

      // Test listing empty archives
      const emptyList = await archiver.listArchives();
      expect(emptyList).toHaveLength(0);

      // Create test metadata
      const metadata = {
        archiveId: 'test-archive-123',
        timestamp: new Date().toISOString(),
        logFileCount: 5,
        totalSize: 1024,
        compressedSize: 512,
        sha256Hash: 'test-hash',
        s3ObjectKey: 'test/archive.gz',
        retentionUntil: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        encryptionEnabled: false,
        compressionRatio: 0.5,
      };

      await writeFile(
        path.join(metadataDir, 'test-archive-123.json'),
        JSON.stringify(metadata)
      );

      // Test listing with metadata
      const listWithData = await archiver.listArchives();
      expect(listWithData).toHaveLength(1);
      expect(listWithData[0].archiveId).toBe('test-archive-123');
    });

    test('should handle corrupt metadata gracefully', async () => {
      vi.doMock('../../src/common/path-utils.js', () => ({
        getProjectDir: () => tempDir,
      }));

      const { LogArchiver } = await import('../../src/observability/log-archiver.js');

      const archiver = new LogArchiver({
        bucket: 'test-bucket',
        enableObjectLock: false,
      });

      // Create metadata directory with corrupt file
      const metadataDir = path.join(tempDir, '.claude', 'archive-metadata');
      await mkdir(metadataDir, { recursive: true });

      await writeFile(path.join(metadataDir, 'corrupt.json'), 'invalid json');

      // Should handle corrupt metadata gracefully
      const archives = await archiver.listArchives();
      expect(archives).toHaveLength(0); // Corrupt file should be ignored
    });
  });

  describe('Local Archive Processing', () => {
    test('should process audit log entries', async () => {
      vi.doMock('../../src/common/path-utils.js', () => ({
        getProjectDir: () => tempDir,
      }));

      // Mock encryption module
      vi.doMock('../../src/observability/audit-encryption.js', () => ({
        processLineForReading: vi.fn((line) => JSON.parse(line)),
        isEncryptionEnabled: vi.fn(() => false),
      }));

      const { LogArchiver } = await import('../../src/observability/log-archiver.js');

      // Create log directory and files
      const logDir = path.join(tempDir, '.claude', 'logs');
      await mkdir(logDir, { recursive: true });

      const auditEntries: AuditLogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          session_id: 'test-session-1',
          validator: 'bash_safety',
          severity: 'BLOCKED',
          action: 'BLOCKED',
          details: { command: 'rm -rf /', reason: 'dangerous command' },
        },
        {
          timestamp: new Date().toISOString(),
          session_id: 'test-session-2',
          validator: 'jailbreak_guard',
          severity: 'WARNING',
          action: 'DETECTED',
          details: { pattern: 'DAN mode', confidence: 0.95 },
        },
      ];

      const logContent = auditEntries.map(entry => JSON.stringify(entry)).join('\n');
      await writeFile(path.join(logDir, 'security.log'), logContent);

      // Set file modification time to ensure it's in range
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await fs.promises.utimes(
        path.join(logDir, 'security.log'),
        yesterday.getTime() / 1000,
        yesterday.getTime() / 1000
      );

      const archiver = new LogArchiver({
        bucket: 'test-bucket',
        enableObjectLock: false,
      });

      // Access private method for testing
      const getLogFilesInRange = (archiver as any).getLogFilesInRange.bind(archiver);

      const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const logFiles = await getLogFilesInRange(startDate, endDate);
      expect(logFiles.length).toBeGreaterThan(0);

      // Test archive creation (without S3 upload)
      const createCompressedArchive = (archiver as any).createCompressedArchive.bind(archiver);
      const archiveBuffer = await createCompressedArchive(logFiles);

      expect(archiveBuffer).toBeInstanceOf(Buffer);
      expect(archiveBuffer.length).toBeGreaterThan(0);
    });

    test('should handle empty log directory', async () => {
      vi.doMock('../../src/common/path-utils.js', () => ({
        getProjectDir: () => tempDir,
      }));

      const { LogArchiver } = await import('../../src/observability/log-archiver.js');

      const archiver = new LogArchiver({
        bucket: 'test-bucket',
        enableObjectLock: false,
      });

      const metadataDir = path.join(tempDir, '.claude', 'archive-metadata');
      await mkdir(metadataDir, { recursive: true });

      // Test empty archive metadata creation
      const createEmptyMetadata = (archiver as any).createEmptyArchiveMetadata.bind(archiver);
      const metadata = createEmptyMetadata('empty-test', new Date(), new Date());

      expect(metadata.archiveId).toBe('empty-test');
      expect(metadata.logFileCount).toBe(0);
      expect(metadata.totalSize).toBe(0);
      expect(metadata.compressedSize).toBe(0);
    });
  });

  describe('Scheduler Integration', () => {
    test('should initialize scheduler and track status', async () => {
      vi.doMock('../../src/common/path-utils.js', () => ({
        getProjectDir: () => tempDir,
      }));

      const { ArchivalScheduler } = await import('../../src/observability/archival-scheduler.js');

      const scheduler = new ArchivalScheduler();
      await scheduler.initialize();

      const status = await scheduler.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.totalRuns).toBe(0);
      expect(status.consecutiveFailures).toBe(0);

      // Test health check
      const health = await scheduler.healthCheck();
      expect(health).toBeDefined();
      expect(health.healthy).toBeDefined();
      expect(Array.isArray(health.issues)).toBe(true);
      expect(Array.isArray(health.recommendations)).toBe(true);
    });

    test('should handle scheduler configuration issues', async () => {
      const { getArchivalStatus } = await import('../../src/observability/archival-scheduler.js');

      // Without S3 bucket configured, should identify issues
      const status = await getArchivalStatus();

      expect(status.health.healthy).toBe(false);
      expect(status.health.issues.length).toBeGreaterThan(0);
      expect(status.health.issues).toContain('S3 bucket name is required');
    });
  });

  describe('Audit Logger Integration', () => {
    test('should provide archival functions in audit logger', async () => {
      const { AuditLogger } = await import('../../src/common/audit-logger.js');

      // Test that archival functions are available
      expect(typeof AuditLogger.initializeArchival).toBe('function');
      expect(typeof AuditLogger.triggerArchival).toBe('function');
      expect(typeof AuditLogger.getArchivalStatus).toBe('function');

      // Test archival status (should work even without S3 config)
      const status = await AuditLogger.getArchivalStatus();
      expect(status).toBeDefined();
      expect(status.error || status.health).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing configuration gracefully', async () => {
      // Clear all archival environment variables
      delete process.env.BMAD_S3_ARCHIVE_BUCKET;
      delete process.env.BMAD_S3_ARCHIVE_REGION;

      const { LogArchiver } = await import('../../src/observability/log-archiver.js');

      expect(() => LogArchiver.fromEnvironment()).toThrow('BMAD_S3_ARCHIVE_BUCKET environment variable is required');
    });

    test('should validate archival configuration options', async () => {
      const { LogArchiver } = await import('../../src/observability/log-archiver.js');

      // Test invalid configurations
      expect(() => new LogArchiver({})).toThrow('S3 bucket name is required');

      const archiver = new LogArchiver({
        bucket: 'test-bucket',
        retentionDays: -1, // Invalid
      });

      const status = archiver.getConfigurationStatus();
      expect(status.configured).toBe(false);
    });
  });

  describe('Compliance Features', () => {
    test('should support compliance requirements', async () => {
      const { ArchivalConfigManager } = await import('../../src/observability/archival-config.js');

      const configManager = new ArchivalConfigManager();
      const example = configManager.generateExampleConfig();

      // NIST DE.CM-1, ISO 27001 A.12.4.1 compliance features
      expect(example.retentionDays).toBe(2557); // ~7 years for regulatory compliance
      expect(example.enableObjectLock).toBe(true); // Immutable storage
      expect(example.encryptionType).toBe('SSE-S3'); // Encryption at rest

      // Verify compliance recommendations
      process.env.BMAD_S3_ARCHIVE_BUCKET = 'test-bucket';
      process.env.BMAD_LOG_RETENTION_DAYS = '30'; // Short retention

      const validation = await configManager.loadConfiguration();
      expect(validation.warnings).toContain(
        expect.stringContaining('below regulatory recommendation')
      );
      expect(validation.recommendations).toContain(
        'Consider extending retention to 2557 days for regulatory compliance'
      );
    });

    test('should provide setup instructions for compliance', async () => {
      const { ArchivalConfigManager } = await import('../../src/observability/archival-config.js');

      const configManager = new ArchivalConfigManager();
      const instructions = configManager.generateSetupInstructions();

      // Verify compliance guidance is included
      expect(instructions).toContain('Object Lock');
      expect(instructions).toContain('encryption');
      expect(instructions).toContain('2557'); // 7 years retention
      expect(instructions).toContain('COMPLIANCE');
      expect(instructions).toContain('GPG');
    });
  });
});

describe('Archival System Status Verification', () => {
  test('should report comprehensive system status', async () => {
    const { getArchivalStatus } = await import('../../src/observability/archival-scheduler.js');

    const status = await getArchivalStatus();

    // Verify status structure
    expect(status.status).toBeDefined();
    expect(status.health).toBeDefined();
    expect(status.recentJobs).toBeDefined();

    // Status should contain job information
    expect(typeof status.status.isRunning).toBe('boolean');
    expect(typeof status.status.totalRuns).toBe('number');
    expect(typeof status.status.consecutiveFailures).toBe('number');

    // Health should contain diagnostic information
    expect(typeof status.health.healthy).toBe('boolean');
    expect(Array.isArray(status.health.issues)).toBe(true);
    expect(Array.isArray(status.health.recommendations)).toBe(true);

    // Recent jobs should be an array
    expect(Array.isArray(status.recentJobs)).toBe(true);
  });

  test('should identify required configuration', async () => {
    const { getArchivalStatus } = await import('../../src/observability/archival-scheduler.js');

    // Without S3 bucket configured
    delete process.env.BMAD_S3_ARCHIVE_BUCKET;

    const status = await getArchivalStatus();

    expect(status.health.healthy).toBe(false);
    expect(status.health.issues).toContain('S3 bucket name is required');
    expect(status.health.recommendations.length).toBeGreaterThan(0);
  });
});