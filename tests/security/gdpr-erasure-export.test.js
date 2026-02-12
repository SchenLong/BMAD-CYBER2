/**
 * SC-02: GDPR Data Erasure + Export Tests
 * =========================================
 * Tests for purgeUserData() and exportUserData() (R-019).
 * Closes GAP-GDPR-01 (right to erasure) and GAP-GDPR-02 (right to portability).
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  createDSRHandler,
  DataSubjectRequestHandler,
  DSRStatus,
  DSRType
} from '../../src/security/gdpr-compliance.js';

const TEST_DIR = path.join(process.cwd(), '.test-gdpr-erasure');
const LOG_DIR = path.join(TEST_DIR, 'logs');
const DSR_DIR = path.join(TEST_DIR, 'dsr');

function createTestLogEntries(logFile, entries) {
  const dir = path.dirname(logFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const lines = `${entries.map(e => JSON.stringify(e)).join('\n')  }\n`;
  fs.writeFileSync(logFile, lines);
}

function readLogEntries(logFile) {
  if (!fs.existsSync(logFile)) return [];
  return fs.readFileSync(logFile, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

describe('GDPR Data Erasure + Export (SC-02)', () => {
  let handler;

  beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.mkdirSync(DSR_DIR, { recursive: true });
    handler = new DataSubjectRequestHandler(DSR_DIR);
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('purgeUserData()', () => {
    it('should remove entries matching subjectId from a log file', () => {
      const logFile = path.join(LOG_DIR, 'audit.log');
      createTestLogEntries(logFile, [
        { userId: 'user-001', action: 'login', timestamp: '2026-01-01T00:00:00Z' },
        { userId: 'user-002', action: 'login', timestamp: '2026-01-01T00:01:00Z' },
        { userId: 'user-001', action: 'data_access', timestamp: '2026-01-01T00:02:00Z' },
        { userId: 'user-003', action: 'logout', timestamp: '2026-01-01T00:03:00Z' },
      ]);

      const result = handler.purgeUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(2);

      const remaining = readLogEntries(logFile);
      expect(remaining).toHaveLength(2);
      expect(remaining.every(e => e.userId !== 'user-001')).toBe(true);
    });

    it('should handle multiple log files', () => {
      const logFile1 = path.join(LOG_DIR, 'security.log');
      const logFile2 = path.join(LOG_DIR, 'rbac-decisions.log');

      createTestLogEntries(logFile1, [
        { userId: 'user-A', action: 'auth', timestamp: '2026-01-01T00:00:00Z' },
        { userId: 'user-B', action: 'auth', timestamp: '2026-01-01T00:01:00Z' },
      ]);
      createTestLogEntries(logFile2, [
        { userId: 'user-A', resource: 'agent-1', allowed: true },
        { userId: 'user-A', resource: 'agent-2', allowed: false },
        { userId: 'user-C', resource: 'agent-1', allowed: true },
      ]);

      const result = handler.purgeUserData('user-A', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(3);
      expect(result.filesProcessed).toBe(2);

      expect(readLogEntries(logFile1)).toHaveLength(1);
      expect(readLogEntries(logFile2)).toHaveLength(1);
    });

    it('should return zero purged when no matching entries', () => {
      const logFile = path.join(LOG_DIR, 'audit.log');
      createTestLogEntries(logFile, [
        { userId: 'user-X', action: 'test', timestamp: '2026-01-01T00:00:00Z' },
      ]);

      const result = handler.purgeUserData('nonexistent-user', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(0);
    });

    it('should also match sessionId field for purge', () => {
      const logFile = path.join(LOG_DIR, 'session.log');
      createTestLogEntries(logFile, [
        { sessionId: 'user-001', action: 'start', timestamp: '2026-01-01T00:00:00Z' },
        { userId: 'user-001', action: 'login', timestamp: '2026-01-01T00:01:00Z' },
        { userId: 'other', sessionId: 'other-session', action: 'test' },
      ]);

      const result = handler.purgeUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(2);
    });

    it('should handle empty log files gracefully', () => {
      const logFile = path.join(LOG_DIR, 'empty.log');
      fs.writeFileSync(logFile, '');

      const result = handler.purgeUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(0);
    });

    it('should handle non-JSON lines gracefully', () => {
      const logFile = path.join(LOG_DIR, 'mixed.log');
      fs.writeFileSync(logFile, `${[
        JSON.stringify({ userId: 'user-001', action: 'test' }),
        'not json at all',
        JSON.stringify({ userId: 'user-002', action: 'test' }),
      ].join('\n')  }\n`);

      const result = handler.purgeUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(1);

      // Non-JSON line and user-002 entry should remain
      const remaining = fs.readFileSync(logFile, 'utf-8').trim().split('\n').filter(Boolean);
      expect(remaining).toHaveLength(2);
    });

    it('should handle missing log directory gracefully', () => {
      const result = handler.purgeUserData('user-001', { logDirs: ['/nonexistent/path'] });
      expect(result.success).toBe(true);
      expect(result.entriesPurged).toBe(0);
    });

    it('should also purge from DSR store', () => {
      // Create a DSR request for the subject
      handler.createErasureRequest({
        subjectId: 'user-001',
        email: 'user@test.com',
        reason: 'withdrawal',
      });

      const before = handler.getSubjectRequests('user-001');
      expect(before).toHaveLength(1);

      const result = handler.purgeUserData('user-001', { logDirs: [LOG_DIR], purgeDsrRecords: true });
      expect(result.success).toBe(true);
      expect(result.dsrRecordsPurged).toBeGreaterThanOrEqual(1);
    });
  });

  describe('exportUserData()', () => {
    it('should collect all entries for a given subjectId', () => {
      const logFile = path.join(LOG_DIR, 'audit.log');
      createTestLogEntries(logFile, [
        { userId: 'user-001', action: 'login', timestamp: '2026-01-01T00:00:00Z' },
        { userId: 'user-002', action: 'login', timestamp: '2026-01-01T00:01:00Z' },
        { userId: 'user-001', action: 'data_access', timestamp: '2026-01-01T00:02:00Z' },
      ]);

      const result = handler.exportUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesExported).toBe(2);
      expect(result.data.auditEntries).toHaveLength(2);
      expect(result.data.auditEntries.every(e => e.userId === 'user-001')).toBe(true);
    });

    it('should include entries from multiple log files', () => {
      createTestLogEntries(path.join(LOG_DIR, 'security.log'), [
        { userId: 'user-A', action: 'auth' },
      ]);
      createTestLogEntries(path.join(LOG_DIR, 'rbac.log'), [
        { userId: 'user-A', resource: 'agent-1' },
      ]);

      const result = handler.exportUserData('user-A', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesExported).toBe(2);
    });

    it('should include DSR requests in export', () => {
      handler.createAccessRequest({
        subjectId: 'user-001',
        email: 'user@test.com',
        name: 'Test User',
        verificationMethod: 'email',
      });

      const result = handler.exportUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.data.dsrRequests).toHaveLength(1);
      expect(result.data.dsrRequests[0].type).toBe(DSRType.ACCESS);
    });

    it('should return structured JSON format', () => {
      const logFile = path.join(LOG_DIR, 'audit.log');
      createTestLogEntries(logFile, [
        { userId: 'user-001', action: 'login' },
      ]);

      const result = handler.exportUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.data).toHaveProperty('subjectId', 'user-001');
      expect(result.data).toHaveProperty('exportedAt');
      expect(result.data).toHaveProperty('auditEntries');
      expect(result.data).toHaveProperty('dsrRequests');
      expect(result.data).toHaveProperty('format', 'JSON');
    });

    it('should return empty arrays when no data exists', () => {
      const result = handler.exportUserData('nonexistent-user', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesExported).toBe(0);
      expect(result.data.auditEntries).toHaveLength(0);
      expect(result.data.dsrRequests).toHaveLength(0);
    });

    it('should also match sessionId field for export', () => {
      const logFile = path.join(LOG_DIR, 'session.log');
      createTestLogEntries(logFile, [
        { sessionId: 'user-001', action: 'start' },
        { userId: 'user-001', action: 'login' },
        { userId: 'other', sessionId: 'other', action: 'test' },
      ]);

      const result = handler.exportUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesExported).toBe(2);
    });

    it('should handle non-JSON lines gracefully', () => {
      const logFile = path.join(LOG_DIR, 'mixed.log');
      fs.writeFileSync(logFile, `${[
        JSON.stringify({ userId: 'user-001', action: 'test' }),
        'not json',
        JSON.stringify({ userId: 'user-001', action: 'test2' }),
      ].join('\n')  }\n`);

      const result = handler.exportUserData('user-001', { logDirs: [LOG_DIR] });
      expect(result.success).toBe(true);
      expect(result.entriesExported).toBe(2);
    });
  });

  describe('DSR Integration', () => {
    it('should wire erasure request to purgeUserData', async () => {
      const logFile = path.join(LOG_DIR, 'audit.log');
      createTestLogEntries(logFile, [
        { userId: 'user-001', action: 'login', timestamp: '2026-01-01T00:00:00Z' },
        { userId: 'user-002', action: 'login', timestamp: '2026-01-01T00:01:00Z' },
      ]);

      const request = handler.createErasureRequest({
        subjectId: 'user-001',
        email: 'user@test.com',
        reason: 'consent_withdrawal',
        scope: 'ALL',
      });

      // Set log dirs for processing
      handler.setLogDirs([LOG_DIR]);

      const result = await handler.processRequest(request.requestId);
      expect(result.success).toBe(true);
      expect(result.erasedAt).toBeDefined();

      // Verify entries were actually purged
      const remaining = readLogEntries(logFile);
      expect(remaining.every(e => e.userId !== 'user-001')).toBe(true);
    });

    it('should wire portability request to exportUserData', async () => {
      const logFile = path.join(LOG_DIR, 'audit.log');
      createTestLogEntries(logFile, [
        { userId: 'user-001', action: 'login', timestamp: '2026-01-01T00:00:00Z' },
      ]);

      const request = handler.createPortabilityRequest({
        subjectId: 'user-001',
        email: 'user@test.com',
        format: 'JSON',
        deliveryMethod: 'DOWNLOAD',
      });

      handler.setLogDirs([LOG_DIR]);

      const result = await handler.processRequest(request.requestId);
      expect(result.success).toBe(true);
      expect(result.exportPath).toBeDefined();

      // Verify export file contains user data
      const exportContent = JSON.parse(fs.readFileSync(result.exportPath, 'utf-8'));
      expect(exportContent.subjectId).toBe('user-001');
      expect(exportContent.auditEntries).toBeDefined();
    });

    it('should handle erasure exemptions correctly', async () => {
      const request = handler.createErasureRequest({
        subjectId: 'user-001',
        email: 'user@test.com',
        reason: 'consent_withdrawal',
      });

      handler.setLogDirs([LOG_DIR]);

      // Default: no exemptions → should proceed
      const result = await handler.processRequest(request.requestId);
      expect(result.success).toBe(true);
    });
  });

  describe('createDSRHandler factory', () => {
    it('should create a handler with custom storage path', () => {
      const customHandler = createDSRHandler(DSR_DIR);
      expect(customHandler).toBeInstanceOf(DataSubjectRequestHandler);
    });
  });
});
