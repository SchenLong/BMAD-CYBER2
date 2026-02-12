/**
 * SA-01-S3: Audit & Logging Architecture Review
 *
 * Security Assessment — Architecture Review Phase
 * Validates audit logging integrity: hash chains, tamper detection,
 * critical event persistence, log rotation continuity, append-only,
 * signature verification, and retention enforcement.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import { readFileSync } from 'fs';
import crypto from 'crypto';
import os from 'os';
import path, { resolve } from 'path';
import {
  DEFAULT_ROTATION_SIZE,
  RETENTION_DAYS,
  TamperEvidentAuditLogger,
} from '../../src/security/audit/audit-logger.ts';

const TEST_KEY = 'sa01-test-hmac-key-for-architecture-review-32ch';

// Helper: read entries from NDJSON log file
async function readEntriesFromLog(logPath) {
  try {
    const content = await fs.readFile(logPath, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

// Helper: write entries to NDJSON log file
async function writeEntriesToLog(logPath, entries) {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  const content = `${entries.map((e) => JSON.stringify(e)).join('\n')  }\n`;
  await fs.writeFile(logPath, content);
}

// Helper: create a chain of valid entries
function createChain(count, overrides = {}) {
  const entries = [];
  let previousHash = '';

  for (let i = 0; i < count; i++) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: overrides.timestamp || new Date().toISOString(),
      action: overrides.action || `test_action_${i}`,
      resource: overrides.resource || 'test_resource',
      outcome: overrides.outcome || 'success',
      severity: overrides.severity || 'low',
      category: overrides.category || 'default',
      details: overrides.details || { index: i },
      blockIndex: i,
      previousHash,
    };

    // Compute hash
    const dataToHash = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      action: entry.action,
      resource: entry.resource,
      outcome: entry.outcome,
      severity: entry.severity,
      category: entry.category,
      details: entry.details,
      blockIndex: entry.blockIndex,
      previousHash: entry.previousHash,
    }) + previousHash;
    entry.hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Sign
    const signData = JSON.stringify(entry.action) + entry.hash;
    entry.signature = crypto.createHmac('sha256', TEST_KEY).update(signData).digest('hex');

    previousHash = entry.hash;
    entries.push(entry);
  }

  return entries;
}

// ============================================================================
// CHECK 1: Hash chain integrity
// ============================================================================

describe('SA-01-S3 Check 1: Hash Chain Integrity', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk1-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should create entries with chained previousHash values', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        action: `chain_test_${i}`,
        resource: 'sa01_test',
        outcome: 'success',
        severity: 'critical', // critical = immediate flush
        details: { index: i },
        timestamp: new Date(),
      });
    }

    const entries = await readEntriesFromLog(logPath);
    expect(entries.length).toBe(5);

    // First entry should have empty previousHash
    expect(entries[0].previousHash).toBe('');

    // Each subsequent entry's previousHash must equal the prior entry's hash
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].previousHash).toBe(entries[i - 1].hash);
    }
  });

  it('should produce SHA-256 hashes (64 hex characters)', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    await logger.logEvent({
      action: 'hash_format_test',
      resource: 'sa01',
      outcome: 'success',
      severity: 'critical',
      details: {},
      timestamp: new Date(),
    });

    const entries = await readEntriesFromLog(logPath);
    expect(entries[0].hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should have monotonically incrementing blockIndex', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        action: `block_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    const entries = await readEntriesFromLog(logPath);
    for (let i = 0; i < entries.length; i++) {
      expect(entries[i].blockIndex).toBe(i);
    }
  });
});

// ============================================================================
// CHECK 2: Tamper detection via verifyIntegrity()
// ============================================================================

describe('SA-01-S3 Check 2: Tamper Detection', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk2-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should return true for untampered log', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 3; i++) {
      await logger.logEvent({
        action: `valid_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    const result = await logger.verifyIntegrity();
    expect(result).toBe(true);
  });

  it('should return false when entry content is modified', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 3; i++) {
      await logger.logEvent({
        action: `tamper_test_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    // Tamper: modify entry #2's action
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    const entry1 = JSON.parse(lines[1]);
    entry1.action = 'TAMPERED_ACTION';
    lines[1] = JSON.stringify(entry1);
    await fs.writeFile(logPath, `${lines.join('\n')  }\n`);

    // verifyIntegrity should detect the tamper
    const verifyLogger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));
    const result = await verifyLogger.verifyIntegrity();
    expect(result).toBe(false);
  });
});

// ============================================================================
// CHECK 3: Critical events cannot be suppressed
// ============================================================================

describe('SA-01-S3 Check 3: Critical Events Always Written', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk3-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should immediately flush critical events to disk', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    await logger.logEvent({
      action: 'security_violation',
      resource: 'critical_test',
      outcome: 'failure',
      severity: 'critical',
      details: { violation: 'unauthorized_access' },
      timestamp: new Date(),
    });

    // Should be on disk immediately (critical = auto-flush)
    const entries = await readEntriesFromLog(logPath);
    expect(entries.length).toBe(1);
    expect(entries[0].action).toBe('security_violation');
    expect(entries[0].severity).toBe('critical');
  });

  it('should have immediate flush for critical in source code', () => {
    const src = resolve(import.meta.dirname, '../../src/security/audit/audit-logger.ts');
    const content = readFileSync(src);
    // Verify that critical severity triggers immediate flush
    expect(content.toString()).toContain('severity === "critical"');
    expect(content.toString()).toContain('flushBuffer');
  });
});

// ============================================================================
// CHECK 4: Log rotation chain continuity
// ============================================================================

describe('SA-01-S3 Check 4: Log Rotation Chain Continuity', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk4-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should maintain hash chain across rotation boundary', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    // Log initial entries
    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        action: `pre_rotation_${i}`,
        resource: 'test',
        outcome: 'success',
        severity: 'critical',
        details: { i },
        timestamp: new Date(),
      });
    }

    const preRotationEntries = await readEntriesFromLog(logPath);
    const lastHashBefore = preRotationEntries[preRotationEntries.length - 1].hash;

    // Force rotation by setting tiny threshold
    logger.setRotationSizeThreshold(1);
    const result = await logger.rotateLog();
    expect(result.rotated).toBe(true);
    expect(result.lastHash).toBe(lastHashBefore);

    // Log a new entry after rotation
    await logger.logEvent({
      action: 'post_rotation_entry',
      resource: 'test',
      outcome: 'success',
      severity: 'critical',
      details: { postRotation: true },
      timestamp: new Date(),
    });

    // New entry's previousHash should chain from last pre-rotation hash
    const postEntries = await readEntriesFromLog(logPath);
    expect(postEntries.length).toBe(1);
    expect(postEntries[0].previousHash).toBe(lastHashBefore);
  });

  it('should not rotate when under size threshold', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    await logger.logEvent({
      action: 'small_entry',
      resource: 'test',
      outcome: 'success',
      severity: 'critical',
      details: {},
      timestamp: new Date(),
    });

    // Default 10MB threshold — single entry is well under
    const result = await logger.rotateLog();
    expect(result.rotated).toBe(false);
  });

  it('should create archive file on rotation', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 3; i++) {
      await logger.logEvent({
        action: `entry_${i}`,
        resource: 'test',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    logger.setRotationSizeThreshold(1);
    const result = await logger.rotateLog();
    expect(result.rotated).toBe(true);
    expect(result.archivePath).toBeDefined();

    const archiveExists = await fs.stat(result.archivePath).then(() => true).catch(() => false);
    expect(archiveExists).toBe(true);
  });
});

// ============================================================================
// CHECK 5: Append-only enforcement
// ============================================================================

describe('SA-01-S3 Check 5: Append-Only Log Enforcement', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk5-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('FINDING SA-01-F3: No OS-level immutable flag — direct modification possible', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    await logger.logEvent({
      action: 'original_entry',
      resource: 'test',
      outcome: 'success',
      severity: 'critical',
      details: {},
      timestamp: new Date(),
    });

    // Direct file overwrite bypasses the API (no OS-level protection)
    await fs.writeFile(logPath, 'TAMPERED CONTENT\n');
    const content = await fs.readFile(logPath, 'utf-8');
    expect(content).toContain('TAMPERED CONTENT');

    // Document: This is a MEDIUM finding — no OS-level append-only.
    // Mitigated by hash chain + verifyIntegrity() detection.
  });

  it('verifyIntegrity detects direct file modification', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        action: `integrity_${i}`,
        resource: 'test',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    // Tamper directly
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    const entry = JSON.parse(lines[1]);
    entry.action = 'DIRECTLY_MODIFIED';
    lines[1] = JSON.stringify(entry);
    await fs.writeFile(logPath, `${lines.join('\n')  }\n`);

    const verifier = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));
    const result = await verifier.verifyIntegrity();
    expect(result).toBe(false);
  });

  it('should use appendFile for normal operations (file grows monotonically)', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    await logger.logEvent({
      action: 'first',
      resource: 'test',
      outcome: 'success',
      severity: 'critical',
      details: {},
      timestamp: new Date(),
    });
    const size1 = (await fs.stat(logPath)).size;

    await logger.logEvent({
      action: 'second',
      resource: 'test',
      outcome: 'success',
      severity: 'critical',
      details: {},
      timestamp: new Date(),
    });
    const size2 = (await fs.stat(logPath)).size;

    expect(size2).toBeGreaterThan(size1);
  });
});

// ============================================================================
// CHECK 6: verifySignature() correctness
// ============================================================================

describe('SA-01-S3 Check 6: verifySignature() Validates Real HMAC Signatures', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk6-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should return true for valid entries (end-to-end)', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        action: `e2e_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: { i },
        timestamp: new Date(),
      });
    }

    const result = await logger.verifyIntegrity();
    expect(result).toBe(true);
  });

  it('should return false for tampered signature', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 3; i++) {
      await logger.logEvent({
        action: `sig_test_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    // Tamper the signature of entry #2
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    const entry = JSON.parse(lines[1]);
    entry.signature = crypto.createHmac('sha256', 'WRONG_KEY').update('wrong_data').digest('hex');
    lines[1] = JSON.stringify(entry);
    await fs.writeFile(logPath, `${lines.join('\n')  }\n`);

    const verifier = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));
    const result = await verifier.verifyIntegrity();
    expect(result).toBe(false);
  });

  it('should produce HMAC-SHA256 signatures (64 hex chars)', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    await logger.logEvent({
      action: 'sig_format',
      resource: 'sa01',
      outcome: 'success',
      severity: 'critical',
      details: {},
      timestamp: new Date(),
    });

    const entries = await readEntriesFromLog(logPath);
    expect(entries[0].signature).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should fail verification with wrong HMAC key', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 3; i++) {
      await logger.logEvent({
        action: `key_test_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    // Create a verifier with a DIFFERENT key
    const wrongKeyLogger = new TamperEvidentAuditLogger(logPath, 'completely-different-key-32-chars!!');
    await new Promise((r) => setTimeout(r, 100));
    const result = await wrongKeyLogger.verifyIntegrity();
    expect(result).toBe(false);
  });
});

// ============================================================================
// CHECK 7: Retention enforcement
// ============================================================================

describe('SA-01-S3 Check 7: Retention Enforcement', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-chk7-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should have correct RETENTION_DAYS constants', () => {
    expect(RETENTION_DAYS.security).toBe(2555);       // ~7 years
    expect(RETENTION_DAYS.test).toBe(1095);            // ~3 years
    expect(RETENTION_DAYS.authentication).toBe(365);   // 1 year
    expect(RETENTION_DAYS.authorization).toBe(365);    // 1 year
    expect(RETENTION_DAYS.configuration).toBe(365);    // 1 year
    expect(RETENTION_DAYS.data_access).toBe(365);      // 1 year
    expect(RETENTION_DAYS.default).toBe(90);           // 90 days
  });

  it('should have DEFAULT_ROTATION_SIZE of 10MB', () => {
    expect(DEFAULT_ROTATION_SIZE).toBe(10 * 1024 * 1024);
  });

  it('should have rotateLog and enforceRetention methods', () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    expect(typeof logger.rotateLog).toBe('function');
    expect(typeof logger.enforceRetention).toBe('function');
  });

  it('constructor should reject empty keys', () => {
    expect(() => new TamperEvidentAuditLogger(logPath, '')).toThrow('non-empty private key');
    expect(() => new TamperEvidentAuditLogger(logPath, '   ')).toThrow('non-empty private key');
  });

  it('constructor should reject null/undefined keys', () => {
    expect(() => new TamperEvidentAuditLogger(logPath, null)).toThrow();
    expect(() => new TamperEvidentAuditLogger(logPath, undefined)).toThrow();
  });
});

// ============================================================================
// Cross-Cutting Architectural Properties
// ============================================================================

describe('SA-01-S3 Cross-Cutting: Architectural Properties', () => {
  let tmpDir;
  let logPath;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sa01-arch-'));
    logPath = path.join(tmpDir, 'audit.log');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('should assign unique UUID ids to each entry', async () => {
    const logger = new TamperEvidentAuditLogger(logPath, TEST_KEY);
    await new Promise((r) => setTimeout(r, 100));

    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        action: `uuid_test_${i}`,
        resource: 'sa01',
        outcome: 'success',
        severity: 'critical',
        details: {},
        timestamp: new Date(),
      });
    }

    const entries = await readEntriesFromLog(logPath);
    const ids = entries.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
    for (const id of ids) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    }
  });

  it('should use HMAC-SHA256 for signatures (not RSA, not no-op)', () => {
    const src = readFileSync(resolve(import.meta.dirname, '../../src/security/audit/audit-logger.ts'));
    const content = src.toString();
    expect(content).toContain('createHmac("sha256"');
    expect(content).toContain('timingSafeEqual');
    // Should NOT contain RSA or the old no-op stub
    expect(content).not.toContain('return true; // TODO');
  });
});
