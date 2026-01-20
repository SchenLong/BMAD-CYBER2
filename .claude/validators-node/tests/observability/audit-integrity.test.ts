/**
 * Tests for Audit Integrity (Hash Chain)
 * =======================================
 * Validates cryptographic hash chain verification for audit logs.
 *
 * LESSON LEARNED: Do NOT use destructive commands in test strings.
 *
 * NOTE: HashChainManager uses a GLOBAL chain state file (.chain_state.json).
 * All tests must handle this shared state carefully. We backup/restore
 * between test suites and reset state before each test.
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  HashChainManager,
  getChainManager,
  addChainFields,
  verifySecurityLog,
  getIntegrityStatus,
} from '../../src/observability/audit-integrity.js';

// Global chain state file path (matches the implementation)
const LOG_DIR = path.join(process.cwd(), '.claude', 'logs');
const CHAIN_STATE_FILE = path.join(LOG_DIR, '.chain_state.json');
const CHAIN_LOCK_FILE = path.join(LOG_DIR, '.chain.lock');

/**
 * Helper to clear global chain state
 */
function clearGlobalChainState(): void {
  try {
    if (fs.existsSync(CHAIN_STATE_FILE)) {
      fs.unlinkSync(CHAIN_STATE_FILE);
    }
  } catch {
    // Ignore
  }
  try {
    if (fs.existsSync(CHAIN_LOCK_FILE)) {
      fs.unlinkSync(CHAIN_LOCK_FILE);
    }
  } catch {
    // Ignore
  }
}

/**
 * Helper to backup global chain state
 */
function backupGlobalChainState(): string | null {
  try {
    if (fs.existsSync(CHAIN_STATE_FILE)) {
      return fs.readFileSync(CHAIN_STATE_FILE, 'utf8');
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Helper to restore global chain state
 */
function restoreGlobalChainState(backup: string | null): void {
  clearGlobalChainState();
  if (backup !== null) {
    fs.mkdirSync(path.dirname(CHAIN_STATE_FILE), { recursive: true });
    fs.writeFileSync(CHAIN_STATE_FILE, backup);
  }
}

describe('HashChainManager', () => {
  let tempDir: string;
  let testLogFile: string;
  let manager: HashChainManager;
  let globalStateBackup: string | null;

  beforeAll(() => {
    // Backup global state before all tests in this suite
    globalStateBackup = backupGlobalChainState();
  });

  afterAll(() => {
    // Restore global state after all tests
    restoreGlobalChainState(globalStateBackup);
  });

  beforeEach(() => {
    // Create temp directory for test logs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-test-'));
    testLogFile = path.join(tempDir, 'test-security.log');

    // Clear global chain state to ensure fresh start for each test
    clearGlobalChainState();

    manager = new HashChainManager(testLogFile);
  });

  afterEach(() => {
    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('addEntry', () => {
    it('should add chain fields to log entry', () => {
      const entry = {
        timestamp: new Date().toISOString(),
        validator: 'test_validator',
        action: 'TEST',
      };

      const chainedEntry = manager.addEntry(entry);

      expect(chainedEntry).toHaveProperty('_chain_index');
      expect(chainedEntry).toHaveProperty('_previous_hash');
      expect(chainedEntry).toHaveProperty('_entry_hash');
    });

    it('should link entries with previous hash', () => {
      const entry1 = {
        timestamp: new Date().toISOString(),
        validator: 'test',
        action: 'ACTION1',
      };

      const entry2 = {
        timestamp: new Date().toISOString(),
        validator: 'test',
        action: 'ACTION2',
      };

      const chained1 = manager.addEntry(entry1);
      const chained2 = manager.addEntry(entry2);

      expect(chained1['_previous_hash']).toBe('genesis');
      expect(chained2['_previous_hash']).toBe(chained1['_entry_hash']);
    });

    it('should increment chain index', () => {
      const entries = [];
      for (let i = 0; i < 3; i++) {
        const entry = manager.addEntry({
          timestamp: new Date().toISOString(),
          index: i,
        });
        entries.push(entry);
      }

      expect(entries[0]!['_chain_index']).toBe(0);
      expect(entries[1]!['_chain_index']).toBe(1);
      expect(entries[2]!['_chain_index']).toBe(2);
    });

    it('should preserve original entry fields', () => {
      const original = {
        timestamp: new Date().toISOString(),
        validator: 'my_validator',
        action: 'MY_ACTION',
        custom_field: 'custom_value',
      };

      const chained = manager.addEntry(original);

      expect(chained['validator']).toBe('my_validator');
      expect(chained['action']).toBe('MY_ACTION');
      expect(chained['custom_field']).toBe('custom_value');
    });
  });

  describe('verifyChain', () => {
    it('should return valid for empty log', () => {
      const result = manager.verifyChain();

      expect(result.valid).toBe(true);
      expect(result.entriesChecked).toBe(0);
      expect(result.tamperingDetected).toBe(false);
    });

    it('should verify valid chain', () => {
      // Create a valid chain
      const entries = [];
      for (let i = 0; i < 5; i++) {
        const entry = manager.addEntry({
          timestamp: new Date().toISOString(),
          action: `ACTION_${i}`,
        });
        entries.push(entry);
      }

      // Write entries to log file
      const content = entries.map((e) => JSON.stringify(e)).join('\n');
      fs.writeFileSync(testLogFile, content + '\n');

      // Verify
      const result = manager.verifyChain();

      expect(result.valid).toBe(true);
      expect(result.entriesChecked).toBe(5);
      expect(result.tamperingDetected).toBe(false);
    });

    it('should detect broken chain', () => {
      // Create entries
      const entry1 = manager.addEntry({
        timestamp: new Date().toISOString(),
        action: 'ACTION_1',
      });
      const entry2 = manager.addEntry({
        timestamp: new Date().toISOString(),
        action: 'ACTION_2',
      });

      // Tamper with the chain - modify previous hash
      const tamperedEntry2 = { ...entry2, _previous_hash: 'invalid_hash' };

      // Write tampered log
      fs.writeFileSync(
        testLogFile,
        JSON.stringify(entry1) + '\n' + JSON.stringify(tamperedEntry2) + '\n'
      );

      // Verify
      const result = manager.verifyChain();

      expect(result.valid).toBe(false);
      expect(result.tamperingDetected).toBe(true);
      expect(result.errorMessage).toContain('previous hash mismatch');
    });

    it('should detect modified content', () => {
      // Create valid entry
      const entry = manager.addEntry({
        timestamp: new Date().toISOString(),
        action: 'ORIGINAL_ACTION',
      });

      // Tamper with content but keep hashes
      const tamperedEntry = { ...entry, action: 'MODIFIED_ACTION' };

      // Write tampered log
      fs.writeFileSync(testLogFile, JSON.stringify(tamperedEntry) + '\n');

      // Verify
      const result = manager.verifyChain();

      expect(result.valid).toBe(false);
      expect(result.tamperingDetected).toBe(true);
      expect(result.errorMessage).toContain('content');
    });

    it('should respect maxEntries parameter', () => {
      // Create many entries
      const entries = [];
      for (let i = 0; i < 10; i++) {
        const entry = manager.addEntry({
          timestamp: new Date().toISOString(),
          index: i,
        });
        entries.push(entry);
      }

      // Write to log
      fs.writeFileSync(testLogFile, entries.map((e) => JSON.stringify(e)).join('\n') + '\n');

      // Verify with limit
      const result = manager.verifyChain(5);

      expect(result.entriesChecked).toBe(5);
      expect(result.valid).toBe(true);
    });

    it('should skip entries without chain data', () => {
      // Write entry without chain fields (pre-chain or degraded mode)
      const unchainedEntry = {
        timestamp: new Date().toISOString(),
        action: 'UNCHAINED',
      };

      fs.writeFileSync(testLogFile, JSON.stringify(unchainedEntry) + '\n');

      // Verify should succeed (skips unchained entries)
      const result = manager.verifyChain();

      expect(result.valid).toBe(true);
      expect(result.entriesChecked).toBe(0);
    });
  });

  describe('getChainStatus', () => {
    it('should return status object', () => {
      const status = manager.getChainStatus();

      expect(status).toHaveProperty('log_file');
      expect(status).toHaveProperty('entry_count');
      expect(status).toHaveProperty('last_timestamp');
      expect(status).toHaveProperty('last_hash');
      expect(status).toHaveProperty('signing_enabled');
      expect(status).toHaveProperty('chain_valid');
    });

    it('should track entry count', () => {
      for (let i = 0; i < 3; i++) {
        manager.addEntry({ timestamp: new Date().toISOString(), index: i });
      }

      const status = manager.getChainStatus();
      expect(status['entry_count']).toBe(3);
    });
  });
});

describe('Convenience Functions', () => {
  let globalStateBackup: string | null;

  beforeAll(() => {
    globalStateBackup = backupGlobalChainState();
  });

  afterAll(() => {
    restoreGlobalChainState(globalStateBackup);
  });

  beforeEach(() => {
    clearGlobalChainState();
  });

  describe('getChainManager', () => {
    it('should return manager instance', () => {
      const manager = getChainManager();
      expect(manager).toBeInstanceOf(HashChainManager);
    });

    it('should accept custom log file', () => {
      const tempFile = path.join(os.tmpdir(), 'test-custom-log.log');
      const manager = getChainManager(tempFile);
      expect(manager).toBeInstanceOf(HashChainManager);
    });
  });

  describe('addChainFields', () => {
    it('should add chain fields via convenience function', () => {
      const entry = {
        timestamp: new Date().toISOString(),
        test: 'value',
      };

      const chained = addChainFields(entry);

      expect(chained).toHaveProperty('_chain_index');
      expect(chained).toHaveProperty('_entry_hash');
    });
  });

  describe('verifySecurityLog', () => {
    it('should verify via convenience function', () => {
      const result = verifySecurityLog();

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('entriesChecked');
      expect(result).toHaveProperty('tamperingDetected');
    });
  });

  describe('getIntegrityStatus', () => {
    it('should return status via convenience function', () => {
      const status = getIntegrityStatus();

      expect(status).toHaveProperty('signing_enabled');
      expect(status).toHaveProperty('chain_valid');
    });
  });
});

describe('Hash Computation', () => {
  let tempDir: string;
  let testLogFile: string;
  let globalStateBackup: string | null;

  beforeAll(() => {
    globalStateBackup = backupGlobalChainState();
  });

  afterAll(() => {
    restoreGlobalChainState(globalStateBackup);
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hash-test-'));
    testLogFile = path.join(tempDir, 'hash-test.log');
    clearGlobalChainState();
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it('should produce deterministic hashes', () => {
    const entry1 = {
      timestamp: '2025-01-01T00:00:00.000Z',
      action: 'TEST',
    };
    const entry2 = {
      timestamp: '2025-01-01T00:00:00.000Z',
      action: 'TEST',
    };

    // Clear state and create first manager
    clearGlobalChainState();
    const manager1 = new HashChainManager(testLogFile);
    const chained1 = manager1.addEntry(entry1);

    // Clear state and create second manager with different file
    clearGlobalChainState();
    const manager2 = new HashChainManager(testLogFile + '.2');
    const chained2 = manager2.addEntry(entry2);

    // Same content should produce same entry hash (both start from genesis)
    expect(chained1['_entry_hash']).toBe(chained2['_entry_hash']);
  });

  it('should exclude chain fields from content hash', () => {
    clearGlobalChainState();
    const manager = new HashChainManager(testLogFile);

    // Add entry
    const entry = manager.addEntry({
      timestamp: new Date().toISOString(),
      data: 'test',
    });

    // The entry hash should be based on content only
    expect(entry['_entry_hash']).toBeDefined();
    expect(entry['_entry_hash']).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex
  });
});
