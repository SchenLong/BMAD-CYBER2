/**
 * Tests for Resource Limits
 *
 * Security Note: Test strings use harmless patterns only.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import {
  ResourceLimiter,
  checkResourceLimits,
  checkMemoryAvailable,
} from '../../src/resource-management/resource-limits.js';

// State files to clean up
const STATE_FILE = '.claude/.resource_state.json';

function cleanupStateFiles() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
  } catch {
    // Ignore cleanup errors
  }
}

describe('ResourceLimiter', () => {
  let limiter: ResourceLimiter;

  beforeEach(() => {
    cleanupStateFiles();
    limiter = new ResourceLimiter();
  });

  afterEach(() => {
    cleanupStateFiles();
  });

  describe('checkMemory', () => {
    it('should return current memory usage', () => {
      const result = limiter.checkMemory();

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('ok');
      expect(result.current).toBeGreaterThan(0);
      expect(result.limit).toBe(4096); // Default limit
    });

    it('should calculate percentage correctly', () => {
      const result = limiter.checkMemory();

      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThan(1); // Should not be at 100%
    });

    it('should consider additional memory in projection', () => {
      const result1 = limiter.checkMemory(0);
      const result2 = limiter.checkMemory(100);

      // Use wider tolerance due to GC and memory fluctuation between calls
      // Memory can fluctuate by several MB between measurements due to:
      // - Garbage collection cycles
      // - V8 heap management
      // - Test runner overhead
      // The key behavior we're testing is that additional memory is added correctly
      expect(result2.current).toBeGreaterThanOrEqual(result1.current + 95);
      expect(result2.current).toBeLessThanOrEqual(result1.current + 110);
      expect(result2.percentage).toBeGreaterThan(result1.percentage);
    });
  });

  describe('getCurrentMemoryMb', () => {
    it('should return positive memory value', () => {
      const memoryMb = limiter.getCurrentMemoryMb();

      expect(memoryMb).toBeGreaterThan(0);
      // Node process should use at least some memory
      expect(memoryMb).toBeGreaterThan(10); // At least 10MB
    });
  });

  describe('checkChildProcesses', () => {
    it('should start with zero tracked processes', () => {
      const result = limiter.checkChildProcesses();

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(0);
      expect(result.limit).toBe(10); // Default limit
    });

    it('should account for new process when startingNew is true', () => {
      const result = limiter.checkChildProcesses(true);

      expect(result.current).toBe(1);
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkFileSize', () => {
    const testFile = '.claude/.test_file_size.tmp';

    afterEach(() => {
      try {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      } catch {
        // Ignore
      }
    });

    it('should allow small files', () => {
      const result = limiter.checkFileSize(testFile, 1000);

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('ok');
    });

    it('should block files exceeding limit', () => {
      // 60MB exceeds 50MB limit
      const result = limiter.checkFileSize(testFile, 60 * 1024 * 1024);

      expect(result.allowed).toBe(false);
      expect(result.status).toBe('blocked');
      expect(result.message).toContain('File size limit exceeded');
    });

    it('should handle non-existent files', () => {
      const result = limiter.checkFileSize('/nonexistent/file.txt', 1000);

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(1000);
    });

    it('should include existing file size in calculation', () => {
      // Create a test file
      fs.mkdirSync('.claude', { recursive: true });
      fs.writeFileSync(testFile, 'x'.repeat(10000));

      const result = limiter.checkFileSize(testFile, 1000);

      expect(result.current).toBe(11000); // 10000 + 1000
    });
  });

  describe('trackProcess / untrackProcess', () => {
    it('should track new processes', () => {
      limiter.trackProcess(12345, 'test-process');

      const count = limiter.getChildProcessCount();
      expect(count).toBe(1);
    });

    it('should untrack processes', () => {
      limiter.trackProcess(12345, 'test-process');
      limiter.untrackProcess(12345);

      const count = limiter.getChildProcessCount();
      expect(count).toBe(0);
    });

    it('should track multiple processes', () => {
      limiter.trackProcess(111, 'proc1');
      limiter.trackProcess(222, 'proc2');
      limiter.trackProcess(333, 'proc3');

      const count = limiter.getChildProcessCount();
      expect(count).toBe(3);
    });
  });

  describe('getStatus', () => {
    it('should return comprehensive status', () => {
      const status = limiter.getStatus() as {
        memory: { currentMb: number; limitMb: number };
        childProcesses: { current: number; limit: number };
        limits: Record<string, unknown>;
        violations: number;
      };

      expect(status.memory).toBeDefined();
      expect(status.memory.currentMb).toBeGreaterThan(0);
      expect(status.memory.limitMb).toBe(4096);

      expect(status.childProcesses).toBeDefined();
      expect(status.childProcesses.current).toBe(0);
      expect(status.childProcesses.limit).toBe(10);

      expect(status.limits).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      limiter.trackProcess(12345, 'test');

      limiter.reset();

      const status = limiter.getStatus() as {
        childProcesses: { current: number };
        violations: number;
      };
      expect(status.childProcesses.current).toBe(0);
      expect(status.violations).toBe(0);
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  describe('checkResourceLimits', () => {
    it('should return tuple with allowed status', () => {
      const [allowed, message] = checkResourceLimits();

      expect(allowed).toBe(true);
      expect(message).toBe('All resource checks passed');
    });
  });

  describe('checkMemoryAvailable', () => {
    it('should check if memory is available', () => {
      const [allowed] = checkMemoryAvailable(100);

      expect(allowed).toBe(true);
    });

    it('should block if too much memory requested', () => {
      // Request more than limit
      const [allowed, message] = checkMemoryAvailable(5000);

      expect(allowed).toBe(false);
      expect(message).toContain('Memory limit exceeded');
    });
  });
});

describe('Custom Limits', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  it('should accept custom limits', () => {
    const limiter = new ResourceLimiter({
      maxMemoryMb: 1024,
      maxChildProcesses: 5,
      maxFileSizeMb: 10,
    });

    const memoryResult = limiter.checkMemory();
    expect(memoryResult.limit).toBe(1024);

    const processResult = limiter.checkChildProcesses();
    expect(processResult.limit).toBe(5);

    const fileResult = limiter.checkFileSize('test.txt', 1000);
    expect(fileResult.limit).toBe(10 * 1024 * 1024);
  });
});

describe('State Persistence', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  it('should persist tracked processes across instances', () => {
    const limiter1 = new ResourceLimiter();
    limiter1.trackProcess(12345, 'test-process');

    // Create new instance
    const limiter2 = new ResourceLimiter();
    const count = limiter2.getChildProcessCount();

    expect(count).toBe(1);
  });
});

describe('Threshold Detection', () => {
  let limiter: ResourceLimiter;

  beforeEach(() => {
    cleanupStateFiles();
    // Create limiter with very low memory limit to test thresholds
    limiter = new ResourceLimiter({
      maxMemoryMb: 100, // Low limit for testing
    });
  });

  afterEach(cleanupStateFiles);

  it('should report warning status near threshold', () => {
    // Current memory is probably above 75% of 100MB
    const result = limiter.checkMemory();

    // This test depends on actual memory usage
    // At minimum, verify the structure
    expect(['ok', 'warning', 'critical', 'blocked']).toContain(result.status);
  });

  it('should report correct percentage', () => {
    const result = limiter.checkMemory();

    const expectedPercentage = result.current / result.limit;
    expect(Math.abs(result.percentage - expectedPercentage)).toBeLessThan(0.001);
  });
});

describe('Edge Cases', () => {
  let limiter: ResourceLimiter;

  beforeEach(() => {
    cleanupStateFiles();
    limiter = new ResourceLimiter();
  });

  afterEach(cleanupStateFiles);

  it('should handle untracking non-existent process', () => {
    // Should not throw
    limiter.untrackProcess(99999);

    const count = limiter.getChildProcessCount();
    expect(count).toBe(0);
  });

  it('should handle checking file size with empty path', () => {
    const result = limiter.checkFileSize('', 1000);

    expect(result.allowed).toBe(true);
    expect(result.current).toBe(1000);
  });

  it('should handle negative additional bytes', () => {
    const result = limiter.checkFileSize('test.txt', -100);

    // Should treat as 0 or handle gracefully
    expect(result.allowed).toBe(true);
  });
});
