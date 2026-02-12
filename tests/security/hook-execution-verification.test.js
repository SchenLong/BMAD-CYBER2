/**
 * SC-01: Hook Execution Verification Tests
 * ==========================================
 * Tests for HMAC-signed hook execution receipts (R-010).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { verifyReceipt } from '../../scripts/verify-hook-execution.js';

const TEST_DIR = path.join(process.cwd(), '.test-hook-receipts');
const RECEIPT_PATH = path.join(TEST_DIR, 'hook-execution-receipt.json');
const SIGNING_KEY = 'test-signing-key-for-verification';

function createValidReceipt(overrides = {}) {
  const receiptData = {
    hookName: 'session-security-init',
    sessionId: 'test-session-123',
    executedAt: new Date().toISOString(),
    status: 'ACTIVE',
    validatorCount: 10,
    issuesFound: 0,
    ...overrides,
  };

  // Remove hmac from overrides if present — we compute it fresh
  const { hmac: _ignored, ...dataToSign } = receiptData;
  const computedHmac = crypto.createHmac('sha256', SIGNING_KEY).update(JSON.stringify(dataToSign)).digest('hex');

  return { ...dataToSign, hmac: computedHmac };
}

function writeReceipt(receipt) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2));
}

describe('Hook Execution Verification (SC-01)', () => {
  beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('Receipt Creation', () => {
    it('should verify a valid receipt', () => {
      const receipt = createValidReceipt();
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(true);
      expect(result.receipt.hookName).toBe('session-security-init');
      expect(result.receipt.status).toBe('ACTIVE');
    });

    it('should include all required fields in receipt', () => {
      const receipt = createValidReceipt();
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(true);
      expect(result.receipt).toHaveProperty('hookName');
      expect(result.receipt).toHaveProperty('sessionId');
      expect(result.receipt).toHaveProperty('executedAt');
      expect(result.receipt).toHaveProperty('status');
      expect(result.receipt).toHaveProperty('validatorCount');
      expect(result.receipt).toHaveProperty('issuesFound');
      expect(result.receipt).toHaveProperty('hmac');
    });

    it('should verify receipt with DEGRADED status', () => {
      const receipt = createValidReceipt({ status: 'DEGRADED', issuesFound: 2 });
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(true);
      expect(result.receipt.status).toBe('DEGRADED');
      expect(result.receipt.issuesFound).toBe(2);
    });

    it('should verify receipt with ACTIVE_WITH_WARNINGS status', () => {
      const receipt = createValidReceipt({ status: 'ACTIVE_WITH_WARNINGS' });
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(true);
      expect(result.receipt.status).toBe('ACTIVE_WITH_WARNINGS');
    });
  });

  describe('HMAC Verification', () => {
    it('should reject receipt with tampered hookName', () => {
      const receipt = createValidReceipt();
      receipt.hookName = 'malicious-hook';
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });

    it('should reject receipt with tampered status', () => {
      const receipt = createValidReceipt({ status: 'DEGRADED' });
      receipt.status = 'ACTIVE';
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });

    it('should reject receipt with tampered validatorCount', () => {
      const receipt = createValidReceipt();
      receipt.validatorCount = 100;
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });

    it('should reject receipt with tampered issuesFound', () => {
      const receipt = createValidReceipt({ issuesFound: 5 });
      receipt.issuesFound = 0;
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });

    it('should reject receipt with wrong signing key', () => {
      const receipt = createValidReceipt();
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, 'wrong-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });

    it('should reject receipt with forged HMAC', () => {
      const receipt = createValidReceipt();
      receipt.hmac = 'a'.repeat(64);
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });
  });

  describe('Recency Check', () => {
    it('should accept a recent receipt (within max age)', () => {
      const receipt = createValidReceipt();
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY, 60);
      expect(result.valid).toBe(true);
      expect(parseFloat(result.ageMinutes)).toBeLessThan(1);
    });

    it('should reject an old receipt (exceeds max age)', () => {
      const oldDate = new Date(Date.now() - 120 * 60 * 1000); // 2 hours ago
      const receipt = createValidReceipt({ executedAt: oldDate.toISOString() });
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY, 60);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('minutes old');
    });

    it('should respect custom max age parameter', () => {
      const recentDate = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes ago
      const receipt = createValidReceipt({ executedAt: recentDate.toISOString() });
      writeReceipt(receipt);

      // 5 minutes max → should pass
      const result1 = verifyReceipt(RECEIPT_PATH, SIGNING_KEY, 5);
      expect(result1.valid).toBe(true);

      // 1 minute max → should fail
      const result2 = verifyReceipt(RECEIPT_PATH, SIGNING_KEY, 1);
      expect(result2.valid).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing receipt file', () => {
      const result = verifyReceipt('/nonexistent/path/receipt.json', SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle corrupt JSON', () => {
      fs.writeFileSync(RECEIPT_PATH, 'not valid json{{{');

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not valid JSON');
    });

    it('should handle missing required fields', () => {
      fs.writeFileSync(RECEIPT_PATH, JSON.stringify({ hookName: 'test' }));

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required field');
    });

    it('should handle empty receipt file', () => {
      fs.writeFileSync(RECEIPT_PATH, '');

      const result = verifyReceipt(RECEIPT_PATH, SIGNING_KEY);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not valid JSON');
    });
  });

  describe('Session Security Init Integration', () => {
    it('should verify receipt format matches session-security-init output', () => {
      // Simulate what session-security-init.ts writes
      const signingKey = 'bmad-default-hook-key';
      const receiptData = {
        hookName: 'session-security-init',
        sessionId: 'unknown',
        executedAt: new Date().toISOString(),
        status: 'ACTIVE',
        validatorCount: 10,
        issuesFound: 0,
      };

      const dataToSign = JSON.stringify(receiptData);
      const hmac = crypto.createHmac('sha256', signingKey).update(dataToSign).digest('hex');
      const receipt = { ...receiptData, hmac };
      writeReceipt(receipt);

      const result = verifyReceipt(RECEIPT_PATH, signingKey);
      expect(result.valid).toBe(true);
    });

    it('should detect if receipt was created with different key than verification key', () => {
      const receipt = createValidReceipt();
      writeReceipt(receipt);

      // Verify with a different key
      const result = verifyReceipt(RECEIPT_PATH, 'different-key-entirely');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HMAC verification failed');
    });
  });
});
