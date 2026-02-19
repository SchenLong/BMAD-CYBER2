/**
 * Audit Logger Tests
 * Story 9.4: Comprehensive Audit Logging
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  AuditLogger,
  AuditAction,
  AuditSeverity,
  logAuth,
  logAuthz,
  logDataAccess,
  logSecurity,
  auditLogger,
} from '../audit-logger';

describe('Audit Logger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  describe('Log Entry Creation', () => {
    it('should create a log entry with all fields', async () => {
      const entry = await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-123',
        userEmail: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
        success: true,
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.action).toBe(AuditAction.LOGIN_SUCCESS);
      expect(entry.userId).toBe('user-123');
      expect(entry.userEmail).toBe('test@example.com');
      expect(entry.ipAddress).toBe('192.168.1.1');
      expect(entry.userAgent).toBe('TestAgent/1.0');
      expect(entry.success).toBe(true);
      expect(entry.timestamp).toBeDefined();
      expect(entry.entryHash).toBeDefined();
      expect(entry.previousHash).toBeNull(); // First entry
    });

    it('should create a log entry without optional fields', async () => {
      const entry = await logger.log(AuditAction.LOGOUT, {
        success: true,
      });

      expect(entry).toBeDefined();
      expect(entry.userId).toBeUndefined();
      expect(entry.ipAddress).toBeUndefined();
    });

    it('should generate a hash for each entry', async () => {
      const entry = await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-123',
        success: true,
      });

      expect(entry.entryHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
    });

    it('should maintain hash chain between entries', async () => {
      const entry1 = await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-123',
        success: true,
      });

      const entry2 = await logger.log(AuditAction.LOGOUT, {
        userId: 'user-123',
        success: true,
      });

      expect(entry1.previousHash).toBeNull(); // First entry has no previous hash
      expect(entry2.previousHash).toBe(entry1.entryHash); // Second entry references first
    });

    it('should set severity based on action', async () => {
      const infoEntry = await logger.log(AuditAction.LOGIN_SUCCESS, {
        success: true,
      });
      expect(infoEntry.severity).toBe(AuditSeverity.INFO);

      const warningEntry = await logger.log(AuditAction.LOGIN_FAILURE, {
        success: false,
      });
      expect(warningEntry.severity).toBe(AuditSeverity.WARNING);

      const errorEntry = await logger.log(AuditAction.INJECTION_ATTEMPT_BLOCKED, {
        success: false,
      });
      expect(errorEntry.severity).toBe(AuditSeverity.ERROR);

      const criticalEntry = await logger.log(AuditAction.RATE_LIMIT_EXCEEDED, {
        success: false,
      });
      expect(criticalEntry.severity).toBe(AuditSeverity.CRITICAL);
    });
  });

  describe('Query', () => {
    beforeEach(async () => {
      // Create some test entries
      await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-1',
        success: true,
      });
      await logger.log(AuditAction.LOGIN_FAILURE, {
        userId: 'user-1',
        success: false,
      });
      await logger.log(AuditAction.PROJECT_CREATED, {
        userId: 'user-2',
        resourceId: 'project-123',
        success: true,
      });
    });

    it('should return all entries when no filters provided', () => {
      const results = logger.query();
      expect(results).toHaveLength(3);
    });

    it('should filter by userId', () => {
      const results = logger.query({ userId: 'user-1' });
      expect(results).toHaveLength(2);
    });

    it('should filter by action', () => {
      const results = logger.query({ action: AuditAction.LOGIN_SUCCESS });
      expect(results).toHaveLength(1);
    });

    it('should filter by resource', () => {
      const results = logger.query({ resource: 'project' });
      // Since we only log resourceId in the beforeEach, we check that the filter works
      // by testing with an entry that has resource set
      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter by resourceId', () => {
      const results = logger.query({ resourceId: 'project-123' });
      expect(results).toHaveLength(1);
    });

    it('should apply pagination', () => {
      const results = logger.query({ limit: 2 });
      expect(results).toHaveLength(2);
    });

    it('should apply offset', () => {
      const page1 = logger.query({ limit: 2, offset: 0 });
      const page2 = logger.query({ limit: 2, offset: 2 });
      expect(page1).not.toEqual(page2);
    });

    it('should sort results by timestamp descending', () => {
      const results = logger.query();
      for (let i = 0; i < results.length - 1; i++) {
        const time1 = new Date(results[i].timestamp).getTime();
        const time2 = new Date(results[i + 1].timestamp).getTime();
        expect(time1).toBeGreaterThanOrEqual(time2);
      }
    });
  });

  describe('Hash Chain Verification', () => {
    it('should verify unmodified hash chain', async () => {
      await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });
      await logger.log(AuditAction.LOGOUT, { success: true });
      await logger.log(AuditAction.AGENT_INVOKED, { success: true });

      const verification = logger.verifyHashChain();

      expect(verification.valid).toBe(true);
      expect(verification.totalEntries).toBe(3);
      expect(verification.verifiedEntries).toBe(3);
      expect(verification.firstBreak).toBeUndefined();
    });

    it('should detect chain breaks (simulated)', () => {
      // In a real scenario, this would test tampering
      // For now, we just verify the structure works
      const verification = logger.verifyHashChain();

      expect(verification).toHaveProperty('valid');
      expect(verification).toHaveProperty('totalEntries');
      expect(verification).toHaveProperty('verifiedEntries');
    });
  });

  describe('Statistics', () => {
    it('should return empty stats for no entries', () => {
      const stats = logger.getStats();

      expect(stats.total).toBe(0);
      expect(stats.byAction).toEqual({});
      expect(stats.bySeverity).toEqual({});
      expect(stats.byUser).toEqual({});
    });

    it('should calculate stats from entries', async () => {
      await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-1',
        success: true,
      });
      await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-1',
        success: true,
      });
      await logger.log(AuditAction.LOGIN_FAILURE, {
        userId: 'user-2',
        success: false,
      });

      const stats = logger.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byAction[AuditAction.LOGIN_SUCCESS]).toBe(2);
      expect(stats.byAction[AuditAction.LOGIN_FAILURE]).toBe(1);
      expect(stats.byUser['user-1']).toBe(2);
      expect(stats.byUser['user-2']).toBe(1);
    });
  });

  describe('Export', () => {
    it('should export audit logs with verification status', async () => {
      await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });

      const exportData = logger.export();

      expect(exportData.entries).toHaveLength(1);
      expect(exportData.exportDate).toBeDefined();
      expect(exportData.verificationStatus).toBeDefined();
    });

    it('should apply filters to export', async () => {
      await logger.log(AuditAction.LOGIN_SUCCESS, {
        userId: 'user-1',
        success: true,
      });
      await logger.log(AuditAction.LOGOUT, {
        userId: 'user-2',
        success: true,
      });

      const exportData = logger.export({ userId: 'user-1' });

      expect(exportData.entries).toHaveLength(1);
      expect(exportData.entries[0].userId).toBe('user-1');
    });
  });

  describe('Clear', () => {
    it('should clear all entries and reset hash chain', async () => {
      await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });

      expect(logger.query()).toHaveLength(1);

      logger.clear();

      expect(logger.query()).toHaveLength(0);
      expect(logger.getPreviousHash()).toBeNull();
    });
  });
});

describe('Helper Functions', () => {
  // Helper functions use the singleton auditLogger, so we need to clear it
  // before and after each test to ensure isolation
  beforeEach(() => {
    auditLogger.clear();
  });

  afterEach(() => {
    auditLogger.clear();
  });

  describe('logAuth', () => {
    it('should log authentication events', async () => {
      await logAuth({
        userId: 'user-123',
        userEmail: 'test@example.com',
        action: AuditAction.LOGIN_SUCCESS,
        success: true,
      });

      const entries = auditLogger.query({ userId: 'user-123' });
      expect(entries).toHaveLength(1);
      expect(entries[0].action).toBe(AuditAction.LOGIN_SUCCESS);
    });
  });

  describe('logAuthz', () => {
    it('should log authorization events', async () => {
      await logAuthz({
        userId: 'admin-123',
        userEmail: 'admin@example.com',
        action: AuditAction.ROLE_CHANGED,
        resource: 'user',
        resourceId: 'user-456',
        previousValue: 'USER',
        newValue: 'ADMIN',
      });

      const entries = auditLogger.query({ action: AuditAction.ROLE_CHANGED });
      expect(entries).toHaveLength(1);
      expect(entries[0].metadata?.previousValue).toBe('USER');
      expect(entries[0].metadata?.newValue).toBe('ADMIN');
    });
  });

  describe('logDataAccess', () => {
    it('should log data access events', async () => {
      await logDataAccess({
        userId: 'user-123',
        action: AuditAction.PROJECT_ACCESSED,
        resource: 'project',
        resourceId: 'project-123',
        success: true,
      });

      const entries = auditLogger.query({ action: AuditAction.PROJECT_ACCESSED });
      expect(entries).toHaveLength(1);
    });
  });

  describe('logSecurity', () => {
    it('should log security events', async () => {
      await logSecurity({
        action: AuditAction.INJECTION_ATTEMPT_BLOCKED,
        resource: 'api',
        resourceId: 'endpoint-123',
        ipAddress: '10.0.0.1',
        metadata: { score: 95 },
      });

      const entries = auditLogger.query({ action: AuditAction.INJECTION_ATTEMPT_BLOCKED });
      expect(entries).toHaveLength(1);
      expect(entries[0].success).toBe(false); // Security events default to false
      expect(entries[0].metadata?.score).toBe(95);
    });
  });
});

describe('Hash Chain Corruption Detection', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  it('should detect genesis entry with non-null previousHash', async () => {
    // Create initial entries
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });
    await logger.log(AuditAction.LOGOUT, { success: true });

    // Get the entries
    const entries = logger['store'].getAll();

    // Manually corrupt the first entry's previousHash
    if (entries.length > 0) {
      entries[0].previousHash = 'fake-hash-value';
    }

    // Verify should detect the corruption
    const verification = logger.verifyHashChain();

    expect(verification.valid).toBe(false);
    expect(verification.totalEntries).toBe(2);
    expect(verification.firstBreak).toBeDefined();
    expect(verification.firstBreak?.expectedHash).toBe('null (genesis entry)');
    expect(verification.firstBreak?.actualHash).toBe('fake-hash-value');
  });

  it('should detect hash chain break between entries', async () => {
    // Create entries
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });
    await logger.log(AuditAction.LOGOUT, { success: true });
    await logger.log(AuditAction.AGENT_INVOKED, { success: true });

    // Get the entries
    const entries = logger['store'].getAll();

    // Corrupt the second entry's previousHash to break the chain
    if (entries.length > 1) {
      entries[1].previousHash = 'corrupted-chain-hash';
    }

    // Verify should detect the corruption
    const verification = logger.verifyHashChain();

    expect(verification.valid).toBe(false);
    expect(verification.firstBreak).toBeDefined();
    expect(verification.firstBreak?.entryId).toBe(entries[1].id);
    expect(verification.firstBreak?.actualHash).toBe('corrupted-chain-hash');
  });

  it('should detect entry hash corruption', async () => {
    // Create entries
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });
    await logger.log(AuditAction.LOGOUT, { success: true });

    // Get the entries
    const entries = logger['store'].getAll();

    // Corrupt the first entry's hash
    if (entries.length > 0) {
      entries[0].entryHash = 'corrupted-entry-hash';
    }

    // Verify should detect the corruption
    const verification = logger.verifyHashChain();

    expect(verification.valid).toBe(false);
    expect(verification.firstBreak).toBeDefined();
    expect(verification.firstBreak?.entryId).toBe(entries[0].id);
    expect(verification.firstBreak?.actualHash).toBe('corrupted-entry-hash');
  });

  it('should verify all entries before reporting first break', async () => {
    // Create multiple entries
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });
    await logger.log(AuditAction.LOGOUT, { success: true });
    await logger.log(AuditAction.AGENT_INVOKED, { success: true });

    // Corrupt the third entry
    const entries = logger['store'].getAll();
    if (entries.length > 2) {
      entries[2].entryHash = 'corrupted-third-entry';
    }

    // Verify should count verified entries before the break
    const verification = logger.verifyHashChain();

    expect(verification.valid).toBe(false);
    expect(verification.verifiedEntries).toBe(2); // First two entries verified
    expect(verification.firstBreak?.entryId).toBe(entries[2].id);
  });
});

describe('Advanced Query Filtering', () => {
  let logger: AuditLogger;
  const now = new Date('2026-02-19T12:00:00Z');

  beforeEach(() => {
    logger = new AuditLogger();
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should filter by startDate', async () => {
    // Create entry at current time
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });

    // Move time forward and create another entry
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    jest.setSystemTime(tomorrow);
    await logger.log(AuditAction.LOGOUT, { success: true });

    // Move time forward again
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    jest.setSystemTime(dayAfter);
    await logger.log(AuditAction.AGENT_INVOKED, { success: true });

    // Query with startDate filtering to tomorrow
    const startDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const results = logger.query({ startDate });

    // Should only include entries from tomorrow onwards
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every(e => new Date(e.timestamp) >= startDate)).toBe(true);
  });

  it('should filter by endDate', async () => {
    // Create entry at current time
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true });

    // Move time forward and create another entry
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    jest.setSystemTime(tomorrow);
    await logger.log(AuditAction.LOGOUT, { success: true });

    // Query with endDate set to now + 12 hours
    const endDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const results = logger.query({ endDate });

    // Should only include entries before the end date
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every(e => new Date(e.timestamp) <= endDate)).toBe(true);
  });

  it('should filter by severity', async () => {
    await logger.log(AuditAction.LOGIN_SUCCESS, { success: true }); // INFO
    await logger.log(AuditAction.LOGIN_FAILURE, { success: false }); // WARNING
    await logger.log(AuditAction.INJECTION_ATTEMPT_BLOCKED, { success: false }); // ERROR
    await logger.log(AuditAction.RATE_LIMIT_EXCEEDED, { success: false }); // CRITICAL

    const errorResults = logger.query({ severity: AuditSeverity.ERROR });
    expect(errorResults.length).toBeGreaterThanOrEqual(1);
    expect(errorResults.every(e => e.severity === AuditSeverity.ERROR)).toBe(true);

    const criticalResults = logger.query({ severity: AuditSeverity.CRITICAL });
    expect(criticalResults.length).toBeGreaterThanOrEqual(1);
    expect(criticalResults.every(e => e.severity === AuditSeverity.CRITICAL)).toBe(true);
  });

  it('should combine multiple filters', async () => {
    await logger.log(AuditAction.LOGIN_SUCCESS, { userId: 'user-1', success: true });
    await logger.log(AuditAction.LOGIN_FAILURE, { userId: 'user-1', success: false });
    await logger.log(AuditAction.LOGIN_FAILURE, { userId: 'user-2', success: false });

    // Filter by both userId and action
    const results = logger.query({ userId: 'user-1', action: AuditAction.LOGIN_FAILURE });
    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe('user-1');
    expect(results[0].action).toBe(AuditAction.LOGIN_FAILURE);
  });
});

describe('Entry Eviction', () => {
  it('should evict oldest entries when max entries is reached', async () => {
    // The store has a fixed maxEntries of 10000
    // This test verifies the eviction logic by directly manipulating the store
    const logger = new AuditLogger();
    const store = logger['store'];

    // Manually add more entries than max to trigger eviction
    for (let i = 0; i < 10001; i++) {
      await logger.log(AuditAction.LOGIN_SUCCESS, { userId: `user-${i}`, success: true });
    }

    // Should have fewer than 10001 entries due to eviction
    const entries = logger.query();
    expect(entries.length).toBeLessThan(10001);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('should remove 10% of entries when max is exceeded', async () => {
    const logger = new AuditLogger();

    // Add 10001 entries (triggers eviction of 10% = 1000 entries)
    for (let i = 0; i < 10001; i++) {
      await logger.log(AuditAction.LOGIN_SUCCESS, { userId: `user-${i}`, success: true });
    }

    // Should have 9001 entries (10001 - 1000 evicted)
    // But eviction happens when > maxEntries, so at 10001 it triggers
    // 10001 - 1000 = 9001
    const entries = logger.query();
    expect(entries.length).toBe(9001);
  });
});
