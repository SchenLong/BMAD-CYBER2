/**
 * Tests for Recursion Guard
 *
 * Security Note: Test strings use harmless patterns only.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  RecursionGuard,
  getRecursionGuard,
  checkRecursionLimit,
  checkCircularReference,
} from '../../src/resource-management/recursion-guard.js';
import { EXIT_CODES } from '../../src/types/index.js';

// State files to clean up
const STATE_FILE = '.claude/.recursion_state.json';
const LOCK_FILE = '.claude/.recursion.lock';

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

describe('RecursionGuard', () => {
  let guard: RecursionGuard;

  beforeEach(() => {
    cleanupStateFiles();
    guard = new RecursionGuard();
  });

  afterEach(() => {
    cleanupStateFiles();
  });

  describe('checkDepth', () => {
    it('should allow depth within limit', () => {
      const result = guard.checkDepth('directoryTraversal', 5, '/some/path');

      expect(result.allowed).toBe(true);
      expect(result.currentDepth).toBe(5);
      expect(result.maxDepth).toBe(10); // Default limit
    });

    it('should block depth exceeding limit', () => {
      const result = guard.checkDepth('directoryTraversal', 15, '/very/deep/path');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('depth limit exceeded');
      expect(result.currentDepth).toBe(15);
    });

    it('should use correct limit for each type', () => {
      const dirResult = guard.checkDepth('directoryTraversal', 5, '/path');
      expect(dirResult.maxDepth).toBe(10);

      const callResult = guard.checkDepth('nestedCalls', 5, 'func');
      expect(callResult.maxDepth).toBe(20);

      const taskResult = guard.checkDepth('taskDepth', 3, 'task');
      expect(taskResult.maxDepth).toBe(5);
    });
  });

  describe('checkCircular', () => {
    it('should allow first occurrence of operation', () => {
      const result = guard.checkCircular('read', '/path/to/file.txt');

      expect(result.allowed).toBe(true);
      expect(result.isCircular).toBe(false);
    });

    it('should detect repeated operations (frequency-based)', () => {
      // Repeat same operation many times
      for (let i = 0; i < 6; i++) {
        guard.checkCircular('read', '/same/file.txt');
      }

      // Should detect as circular after frequency threshold
      const result = guard.checkCircular('read', '/same/file.txt');

      // The 7th occurrence should trigger frequency detection
      // (5+ times in last 20)
      expect(result.isCircular).toBe(true);
      expect(result.allowed).toBe(false);
    });

    it('should not flag different operations as circular', () => {
      for (let i = 0; i < 10; i++) {
        const result = guard.checkCircular('read', `/path/to/file${i}.txt`);
        expect(result.allowed).toBe(true);
      }
    });
  });

  describe('pushCall / popCall', () => {
    it('should push calls to stack', () => {
      const result = guard.pushCall('call_1');

      expect(result.allowed).toBe(true);
      expect(result.currentDepth).toBe(1);
    });

    it('should detect circular calls', () => {
      guard.pushCall('call_1');
      guard.pushCall('call_2');

      // Try to push same call again
      const result = guard.pushCall('call_1');

      expect(result.allowed).toBe(false);
      expect(result.isCircular).toBe(true);
      expect(result.reason).toContain('Circular call detected');
    });

    it('should block when stack depth exceeded', () => {
      // Push up to limit
      for (let i = 0; i < 20; i++) {
        guard.pushCall(`call_${i}`);
      }

      // Try to push one more
      const result = guard.pushCall('call_overflow');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('depth limit exceeded');
    });

    it('should pop calls from stack', () => {
      guard.pushCall('call_1');
      guard.pushCall('call_2');
      guard.popCall('call_1');

      // Can now push call_1 again
      const result = guard.pushCall('call_1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkDirectoryDepth', () => {
    it('should calculate depth from project root', () => {
      const result = guard.checkDirectoryDepth('src/components/Button.tsx');

      expect(result.allowed).toBe(true);
      expect(result.currentDepth).toBe(3); // src, components, Button.tsx
    });

    it('should handle absolute paths', () => {
      const absPath = path.resolve('src/deep/nested/path/file.txt');
      const result = guard.checkDirectoryDepth(absPath);

      expect(result.recursionType).toBe('directoryTraversal');
      expect(result.allowed).toBe(true);
    });

    it('should reset depth for parent directory traversal', () => {
      const result = guard.checkDirectoryDepth('../outside/path');

      expect(result.currentDepth).toBe(0);
      expect(result.recursionType).toBe('directory_traversal');
      expect(result.allowed).toBe(true);
    });

    it('should block very deep paths', () => {
      const deepPath = 'a/b/c/d/e/f/g/h/i/j/k/l/m.txt';
      const result = guard.checkDirectoryDepth(deepPath);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('depth limit exceeded');
    });
  });

  describe('checkSymlinkDepth', () => {
    it('should return ok for non-symlinks', () => {
      // Create a regular file for testing
      const testFile = '.claude/.test_regular_file.tmp';
      fs.mkdirSync('.claude', { recursive: true });
      fs.writeFileSync(testFile, 'test');

      try {
        const result = guard.checkSymlinkDepth(testFile);
        expect(result.allowed).toBe(true);
        expect(result.reason).toBe('Not a symlink');
      } finally {
        fs.unlinkSync(testFile);
      }
    });

    it('should handle non-existent files gracefully', () => {
      const result = guard.checkSymlinkDepth('/nonexistent/path/file.txt');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Could not check symlink');
    });
  });

  describe('getStatus', () => {
    it('should return current status', () => {
      guard.pushCall('call_1');
      guard.checkCircular('read', '/path/file.txt');

      const status = guard.getStatus();

      expect(status.callStackDepth).toBe(1);
      expect(status.pathHistoryLength).toBe(1);
      expect(status.limits).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      guard.pushCall('call_1');
      guard.checkCircular('read', '/path/file.txt');

      guard.reset();

      const status = guard.getStatus();
      expect(status.callStackDepth).toBe(0);
      expect(status.pathHistoryLength).toBe(0);
      expect(status.circularRefsDetected).toBe(0);
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  describe('checkRecursionLimit', () => {
    it('should return tuple with allowed status', () => {
      const [allowed, reason] = checkRecursionLimit('directoryTraversal', 5, '/path');

      expect(allowed).toBe(true);
      expect(reason).toBe('Within depth limits');
    });

    it('should block when limit exceeded', () => {
      const [allowed, reason] = checkRecursionLimit('directoryTraversal', 15, '/deep/path');

      expect(allowed).toBe(false);
      expect(reason).toContain('depth limit exceeded');
    });
  });

  describe('checkCircularReference', () => {
    it('should return tuple with allowed status', () => {
      const [allowed, reason] = checkCircularReference('read', '/path/file.txt');

      expect(allowed).toBe(true);
    });
  });
});

describe('Custom Limits', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  it('should accept custom limits', () => {
    const guard = new RecursionGuard({
      directoryTraversal: 5,
      nestedCalls: 10,
      taskDepth: 3,
    });

    const dirResult = guard.checkDepth('directoryTraversal', 6, '/path');
    expect(dirResult.allowed).toBe(false);

    const callResult = guard.checkDepth('nestedCalls', 11, 'call');
    expect(callResult.allowed).toBe(false);
  });
});

describe('State Persistence', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  it('should persist state across instances', () => {
    const guard1 = new RecursionGuard();
    guard1.pushCall('call_1');
    guard1.checkCircular('read', '/path/file.txt');

    // Create new instance
    const guard2 = new RecursionGuard();
    const status = guard2.getStatus();

    expect(status.callStackDepth).toBe(1);
    expect(status.pathHistoryLength).toBe(1);
  });
});

describe('Pattern Detection', () => {
  let guard: RecursionGuard;

  beforeEach(() => {
    cleanupStateFiles();
    guard = new RecursionGuard();
  });

  afterEach(cleanupStateFiles);

  it('should detect repeating patterns', () => {
    // Create a pattern: A -> B -> A -> B
    guard.checkCircular('read', '/file_a.txt');
    guard.checkCircular('read', '/file_b.txt');
    guard.checkCircular('read', '/file_a.txt');
    guard.checkCircular('read', '/file_b.txt');

    // Continue pattern
    guard.checkCircular('read', '/file_a.txt');
    const result = guard.checkCircular('read', '/file_b.txt');

    // Should detect the repeating A-B pattern
    // This depends on the exact detection algorithm
    expect(result.recursionType).toBe('circular');
  });
});

describe('Edge Cases', () => {
  let guard: RecursionGuard;

  beforeEach(() => {
    cleanupStateFiles();
    guard = new RecursionGuard();
  });

  afterEach(cleanupStateFiles);

  it('should handle empty call ID', () => {
    const result = guard.pushCall('');

    expect(result.allowed).toBe(true);
  });

  it('should handle very long targets', () => {
    const longTarget = 'x'.repeat(10000);
    const result = guard.checkCircular('read', longTarget);

    expect(result.allowed).toBe(true);
  });

  it('should handle special characters in paths', () => {
    const result = guard.checkDirectoryDepth('/path/with spaces/and-dashes/file.txt');

    expect(result.recursionType).toBe('directory_traversal');
  });

  it('should handle unicode in paths', () => {
    const result = guard.checkDirectoryDepth('/path/日本語/文件.txt');

    expect(result.recursionType).toBe('directory_traversal');
    expect(result.allowed).toBe(true);
  });
});
