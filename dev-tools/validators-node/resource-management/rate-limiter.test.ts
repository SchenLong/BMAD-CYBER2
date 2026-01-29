/**
 * Tests for Rate Limiter
 *
 * Security Note: Test strings use harmless patterns only.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  RateLimiter,
  checkRateLimit,
  recordOperation,
  getRateStatus,
} from '../../../.claude/validators-node/src/resource-management/rate-limiter.js';
import { EXIT_CODES } from '../../../.claude/validators-node/src/types/index.js';

// State files to clean up
const STATE_FILE = '.claude/.rate_limit_state.json';
const LOCK_FILE = '.claude/.rate_limit.lock';

function cleanupStateFiles() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch {
    // Ignore cleanup errors
  }
}

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    cleanupStateFiles();
    limiter = new RateLimiter();
  });

  afterEach(() => {
    cleanupStateFiles();
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const result = limiter.checkLimit('bash', 'echo hello');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Within limits');
    });

    it('should track request counts correctly', () => {
      // Record some requests
      for (let i = 0; i < 5; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      const result = limiter.checkLimit('bash', 'echo test');
      expect(result.allowed).toBe(true);
      expect(result.count).toBe(5);
    });

    it('should block when operation limit exceeded', () => {
      // Fill up bash limit (60)
      for (let i = 0; i < 60; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      const result = limiter.checkLimit('bash', 'echo blocked');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Operation limit exceeded');
    });

    it('should enforce global limit across operations', () => {
      // Fill up global limit (150) with reads (which have higher per-op limit)
      for (let i = 0; i < 150; i++) {
        limiter.recordRequest('read', `/path/to/file${i}.txt`);
      }

      // Try a different operation
      const result = limiter.checkLimit('bash', 'echo test');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Global rate limit exceeded');
    });
  });

  describe('whitelist', () => {
    it('should bypass limits for whitelisted read operations', () => {
      // Fill up read limit
      for (let i = 0; i < 400; i++) {
        limiter.recordRequest('read', `/path/to/file${i}.txt`);
      }

      // Whitelisted file should still work
      const result = limiter.checkLimit('read', '.claude/settings.json');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Whitelisted operation');
    });

    it('should bypass limits for whitelisted bash operations', () => {
      // Fill up bash limit
      for (let i = 0; i < 60; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      // Whitelisted command should still work
      const result = limiter.checkLimit('bash', 'git status');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Whitelisted operation');
    });

    it('should not whitelist non-matching operations', () => {
      // Fill up bash limit
      for (let i = 0; i < 60; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      // Non-whitelisted command should be blocked
      const result = limiter.checkLimit('bash', 'ls -la');
      expect(result.allowed).toBe(false);
    });
  });

  describe('exponential backoff', () => {
    it('should apply backoff after violation', () => {
      // Exceed limit
      for (let i = 0; i < 61; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      // First check triggers backoff
      const result1 = limiter.checkLimit('bash', 'echo test');
      expect(result1.allowed).toBe(false);

      // Immediate retry should be blocked by backoff
      const result2 = limiter.checkLimit('bash', 'echo test2');
      expect(result2.allowed).toBe(false);
      expect(result2.reason).toContain('Backoff active');
    });
  });

  describe('recordRequest', () => {
    it('should record requests with timestamp', () => {
      limiter.recordRequest('bash', 'echo hello');

      const status = limiter.getStatus();
      expect(status.operations['bash'].count).toBe(1);
    });

    it('should track multiple operations independently', () => {
      limiter.recordRequest('bash', 'echo hello');
      limiter.recordRequest('read', '/path/to/file.txt');
      limiter.recordRequest('read', '/path/to/other.txt');

      const status = limiter.getStatus();
      expect(status.operations['bash'].count).toBe(1);
      expect(status.operations['read'].count).toBe(2);
    });
  });

  describe('getRetryAfter', () => {
    it('should return 0 when no requests', () => {
      const retryAfter = limiter.getRetryAfter('bash');
      expect(retryAfter).toBe(0);
    });

    it('should return time until oldest request expires', () => {
      // Record requests
      limiter.recordRequest('bash', 'echo test');

      const retryAfter = limiter.getRetryAfter('bash');
      // Should be close to 60 seconds (window size)
      expect(retryAfter).toBeGreaterThan(55);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });
  });

  describe('getStatus', () => {
    it('should return status for all operations', () => {
      const status = limiter.getStatus();

      expect(status.operations).toBeDefined();
      expect(status.operations['bash']).toBeDefined();
      expect(status.operations['read']).toBeDefined();
      expect(status.globalCount).toBe(0);
      expect(status.globalLimit).toBe(150);
    });

    it('should calculate percentages correctly', () => {
      for (let i = 0; i < 30; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      const status = limiter.getStatus();
      expect(status.operations['bash'].percentage).toBe(50); // 30/60 = 50%
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      for (let i = 0; i < 10; i++) {
        limiter.recordRequest('bash', `echo ${i}`);
      }

      limiter.reset();

      const status = limiter.getStatus();
      expect(status.operations['bash'].count).toBe(0);
      expect(status.globalCount).toBe(0);
    });

    it('should reset specific operation only', () => {
      limiter.recordRequest('bash', 'echo test');
      limiter.recordRequest('read', '/path/file.txt');

      limiter.reset('bash');

      const status = limiter.getStatus();
      expect(status.operations['bash'].count).toBe(0);
      expect(status.operations['read'].count).toBe(1);
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  describe('checkRateLimit', () => {
    it('should return tuple with allowed status', () => {
      const [allowed, message] = checkRateLimit('bash', 'echo hello');
      expect(allowed).toBe(true);
      expect(message).toBeNull();
    });
  });

  describe('recordOperation', () => {
    it('should record operations', () => {
      recordOperation('bash', 'echo hello');
      const status = getRateStatus();
      expect(status.operations['bash'].count).toBe(1);
    });
  });

  describe('getRateStatus', () => {
    it('should return current status', () => {
      const status = getRateStatus();
      expect(status.globalCount).toBeDefined();
      expect(status.globalLimit).toBeDefined();
      expect(status.operations).toBeDefined();
    });
  });
});

describe('State Persistence', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  it('should persist state across instances', () => {
    const limiter1 = new RateLimiter();
    limiter1.recordRequest('bash', 'echo test');

    // Create new instance
    const limiter2 = new RateLimiter();
    const status = limiter2.getStatus();
    expect(status.operations['bash'].count).toBe(1);
  });
});

describe('Edge Cases', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    cleanupStateFiles();
    limiter = new RateLimiter();
  });

  afterEach(cleanupStateFiles);

  it('should handle empty target', () => {
    const result = limiter.checkLimit('bash', '');
    expect(result.allowed).toBe(true);
  });

  it('should handle unknown operation type', () => {
    const result = limiter.checkLimit('unknown_operation', 'test');
    expect(result.allowed).toBe(true);
    // Should use global limit
    expect(result.limit).toBe(150);
  });

  it('should handle very long targets', () => {
    const longTarget = 'x'.repeat(10000);
    const result = limiter.checkLimit('bash', longTarget);
    expect(result.allowed).toBe(true);

    limiter.recordRequest('bash', longTarget);
    // Should truncate internally
    const status = limiter.getStatus();
    expect(status.operations['bash'].count).toBe(1);
  });
});
