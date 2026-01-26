/**
 * Tests for Context Manager
 *
 * Security Note: Test strings use harmless patterns only.
 * See lessonlearned.md - NEVER use destructive commands in test strings.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  ContextManager,
  getContextManager,
  checkContextCapacity,
  estimateOperationCost,
} from '../../.claude/validators-node/src/resource-management/context-manager.js';
import { EXIT_CODES } from '../../.claude/validators-node/src/types/index.js';

// State files to clean up
const STATE_FILE = '.claude/.context_state.json';
const LOCK_FILE = '.claude/.context.lock';

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

describe('ContextManager', () => {
  let manager: ContextManager;

  beforeEach(() => {
    cleanupStateFiles();
    manager = new ContextManager();
  });

  afterEach(() => {
    cleanupStateFiles();
  });

  describe('estimateTokens', () => {
    it('should estimate tokens from text length', () => {
      const text = 'a'.repeat(100);
      const tokens = manager.estimateTokens(text);

      // 4 chars per token
      expect(tokens).toBe(25);
    });

    it('should return at least 1 token for non-empty text', () => {
      const tokens = manager.estimateTokens('ab');

      expect(tokens).toBe(1); // ceil(2/4) = 1
    });

    it('should return 0 for empty text', () => {
      const tokens = manager.estimateTokens('');

      expect(tokens).toBe(0);
    });
  });

  describe('estimateFileTokens', () => {
    const testFile = '.claude/.test_file_tokens.tmp';

    afterEach(() => {
      try {
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      } catch {
        // Ignore
      }
    });

    it('should estimate tokens based on file size', () => {
      fs.mkdirSync('.claude', { recursive: true });
      fs.writeFileSync(testFile, 'x'.repeat(1000));

      const estimate = manager.estimateFileTokens(testFile);

      // 3.5 bytes per token
      expect(estimate.tokens).toBeGreaterThan(200);
      expect(estimate.tokens).toBeLessThan(400);
      expect(estimate.source).toBe('file');
    });

    it('should apply file type multipliers', () => {
      const jsonFile = '.claude/.test_file.json';
      const txtFile = '.claude/.test_file.txt';

      fs.mkdirSync('.claude', { recursive: true });
      fs.writeFileSync(jsonFile, 'x'.repeat(1000));
      fs.writeFileSync(txtFile, 'x'.repeat(1000));

      try {
        const jsonEstimate = manager.estimateFileTokens(jsonFile);
        const txtEstimate = manager.estimateFileTokens(txtFile);

        // JSON has 1.2 multiplier, txt has 0.9
        expect(jsonEstimate.tokens).toBeGreaterThan(txtEstimate.tokens);
      } finally {
        fs.unlinkSync(jsonFile);
        fs.unlinkSync(txtFile);
      }
    });

    it('should return 0 for non-existent files', () => {
      const estimate = manager.estimateFileTokens('/nonexistent/file.txt');

      expect(estimate.tokens).toBe(0);
    });
  });

  describe('estimateOperationTokens', () => {
    it('should estimate read operation tokens', () => {
      const estimate = manager.estimateOperationTokens('read', {
        file_path: 'package.json',
      });

      expect(estimate.source).toBe('file');
      expect(estimate.tokens).toBeGreaterThan(500); // Base overhead
    });

    it('should estimate write operation tokens', () => {
      const content = 'x'.repeat(400);
      const estimate = manager.estimateOperationTokens('write', {
        file_path: 'test.txt',
        content,
      });

      expect(estimate.source).toBe('text');
      // 500 base + 100 content tokens
      expect(estimate.tokens).toBe(600);
    });

    it('should estimate bash operation tokens', () => {
      const estimate = manager.estimateOperationTokens('bash', {
        command: 'echo hello world',
      });

      expect(estimate.source).toBe('command');
      // 500 base + command tokens + 500 output estimate
      expect(estimate.tokens).toBeGreaterThan(1000);
    });

    it('should estimate task operation tokens', () => {
      const estimate = manager.estimateOperationTokens('task', {
        prompt: 'Do something complex',
      });

      expect(estimate.source).toBe('agent');
      // 500 base + prompt tokens + 5000 agent overhead
      expect(estimate.tokens).toBeGreaterThan(5500);
    });

    it('should estimate web operations tokens', () => {
      const estimate = manager.estimateOperationTokens('webfetch', {
        url: 'https://example.com',
      });

      expect(estimate.source).toBe('web');
      // 500 base + 2000 web content
      expect(estimate.tokens).toBe(2500);
    });

    it('should handle unknown operations', () => {
      const estimate = manager.estimateOperationTokens('unknown_tool', {});

      // 500 base + 500 default
      expect(estimate.tokens).toBe(1000);
    });
  });

  describe('recordOperation', () => {
    it('should track tokens used', () => {
      manager.recordOperation('read', 1000);

      const status = manager.checkCapacity();
      expect(status.tokensUsed).toBe(1000);
    });

    it('should accumulate tokens across operations', () => {
      manager.recordOperation('read', 1000);
      manager.recordOperation('write', 500);
      manager.recordOperation('bash', 2000);

      const status = manager.checkCapacity();
      expect(status.tokensUsed).toBe(3500);
    });

    it('should keep operation history', () => {
      for (let i = 0; i < 10; i++) {
        manager.recordOperation('read', 100);
      }

      const statusObj = manager.getStatus() as Record<string, unknown>;
      const recentOps = statusObj.recentOperations as Array<{ tool: string }>;
      expect(recentOps.length).toBe(10);
    });
  });

  describe('checkCapacity', () => {
    it('should return ok status when under threshold', () => {
      const status = manager.checkCapacity();

      expect(status.status).toBe('ok');
      expect(status.percentage).toBeLessThan(0.75);
    });

    it('should calculate correct remaining tokens', () => {
      manager.recordOperation('read', 50000);

      const status = manager.checkCapacity();
      expect(status.tokensRemaining).toBe(200000 - 50000);
    });

    it('should report warning status at threshold', () => {
      // Record 75% of capacity
      manager.recordOperation('read', 150000);

      const status = manager.checkCapacity();
      expect(status.status).toBe('warning');
      expect(status.message).toContain('Consider summarizing');
    });

    it('should report blocked status at block threshold', () => {
      // Record 95% of capacity
      manager.recordOperation('read', 190000);

      const status = manager.checkCapacity();
      expect(status.status).toBe('blocked');
      expect(status.message).toContain('Operations blocked');
    });
  });

  describe('canAccommodate', () => {
    it('should allow small operations', () => {
      const [canProceed, message] = manager.canAccommodate(1000);

      expect(canProceed).toBe(true);
      expect(message).toBe('');
    });

    it('should warn when approaching limit', () => {
      manager.recordOperation('read', 140000); // 70%

      // Adding 15000 would put us at 77.5%
      const [canProceed, message] = manager.canAccommodate(15000);

      expect(canProceed).toBe(true);
      expect(message).toContain('Warning');
    });

    it('should block when would exceed limit', () => {
      manager.recordOperation('read', 180000); // 90%

      // Adding 15000 would put us at 97.5%
      const [canProceed, message] = manager.canAccommodate(15000);

      expect(canProceed).toBe(false);
      expect(message).toContain('exceed context limit');
    });
  });

  describe('getStatus', () => {
    it('should return comprehensive status', () => {
      manager.recordOperation('read', 10000);

      const status = manager.getStatus() as Record<string, unknown>;

      expect(status.sessionId).toBeDefined();
      expect(status.tokensUsed).toBe(10000);
      expect(status.maxTokens).toBe(200000);
      expect(status.percentage).toBeCloseTo(0.05);
    });

    it('should include suggestions when approaching limit', () => {
      manager.recordOperation('read', 160000); // 80%

      const status = manager.getStatus() as Record<string, unknown>;
      const suggestions = status.suggestions as string[];

      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      manager.recordOperation('read', 50000);

      manager.reset();

      const status = manager.checkCapacity();
      expect(status.tokensUsed).toBe(0);
    });
  });

  describe('suggestActions', () => {
    it('should return helpful suggestions', () => {
      const suggestions = manager.suggestActions();

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('new conversation'))).toBe(true);
      expect(suggestions.some(s => s.includes('/compact'))).toBe(true);
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  describe('checkContextCapacity', () => {
    it('should return tuple with status info', () => {
      const [status, percentage, message] = checkContextCapacity();

      expect(status).toBe('ok');
      expect(percentage).toBeLessThan(1);
      expect(message).toBeUndefined();
    });
  });

  describe('estimateOperationCost', () => {
    it('should return tuple with token estimate', () => {
      const [tokens, description] = estimateOperationCost('read', {
        file_path: 'test.txt',
      });

      expect(tokens).toBeGreaterThan(0);
      expect(description).toContain('Estimated');
    });
  });
});

describe('State Persistence', () => {
  beforeEach(cleanupStateFiles);
  afterEach(cleanupStateFiles);

  it('should persist state across instances', () => {
    const manager1 = new ContextManager();
    manager1.recordOperation('read', 10000);

    // Create new instance
    const manager2 = new ContextManager();
    const status = manager2.checkCapacity();

    expect(status.tokensUsed).toBe(10000);
  });
});

describe('Operation History', () => {
  let manager: ContextManager;

  beforeEach(() => {
    cleanupStateFiles();
    manager = new ContextManager();
  });

  afterEach(cleanupStateFiles);

  it('should limit history to 100 operations', () => {
    for (let i = 0; i < 150; i++) {
      manager.recordOperation('read', 100);
    }

    const status = manager.getStatus() as Record<string, unknown>;
    // Only last 10 shown in recentOperations
    const recentOps = status.recentOperations as Array<unknown>;
    expect(recentOps.length).toBe(10);
  });
});

describe('Edge Cases', () => {
  let manager: ContextManager;

  beforeEach(() => {
    cleanupStateFiles();
    manager = new ContextManager();
  });

  afterEach(cleanupStateFiles);

  it('should handle zero token operations', () => {
    manager.recordOperation('read', 0);

    const status = manager.checkCapacity();
    expect(status.tokensUsed).toBe(0);
  });

  it('should handle empty tool input', () => {
    const estimate = manager.estimateOperationTokens('read', {});

    // Should still return base overhead + file estimate for empty path
    expect(estimate.tokens).toBeGreaterThan(0);
  });

  it('should handle undefined content in write', () => {
    const estimate = manager.estimateOperationTokens('write', {
      file_path: 'test.txt',
    });

    // Should return base overhead only
    expect(estimate.tokens).toBe(500);
  });
});
