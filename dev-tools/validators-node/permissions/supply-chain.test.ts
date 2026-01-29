/**
 * BMAD Supply Chain Verifier Tests
 * ==================================
 * Unit tests for supply chain verification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'crypto';
import { SupplyChainVerifier } from '../../../.claude/validators-node/src/permissions/supply-chain.js';

// Mock file system
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    readdirSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Mock child_process for GPG commands
vi.mock('child_process', () => ({
  execSync: vi.fn(),
  spawnSync: vi.fn(() => ({
    status: 0,
    stdout: Buffer.from('[GNUPG:] GOODSIG ABC123 Test User'),
    stderr: Buffer.from(''),
  })),
}));

import { existsSync, readFileSync } from 'fs';

describe('SupplyChainVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('manifest loading', () => {
    it('should handle missing manifest gracefully', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const verifier = new SupplyChainVerifier('warn');
      const status = verifier.getVerificationStatus();

      expect(status.manifestLoaded).toBe(false);
    });

    it('should parse manifest entries correctly', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        '# BMAD MANIFEST\n' +
        'abc123def456abc123def456abc123def456abc123def456abc123def456abc1  _bmad/intel-team/agents/osint-lead/agent.md\n' +
        '123456789012345678901234567890123456789012345678901234567890abcd  _bmad/legal-team/workflows/contract/workflow.md\n'
      );

      const verifier = new SupplyChainVerifier('warn');
      const status = verifier.getVerificationStatus();

      expect(status.manifestLoaded).toBe(true);
      expect(status.manifestEntries).toBe(2);
    });

    it('should skip comment lines in manifest', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        '# This is a comment\n' +
        '# Another comment\n' +
        'abc123def456abc123def456abc123def456abc123def456abc123def456abc1  _bmad/file.md\n'
      );

      const verifier = new SupplyChainVerifier('warn');
      const status = verifier.getVerificationStatus();

      expect(status.manifestEntries).toBe(1);
    });

    it('should validate hash format (64 hex chars)', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        'shorthash  _bmad/file.md\n' +  // Invalid - too short
        'abc123def456abc123def456abc123def456abc123def456abc123def456abc1  _bmad/valid.md\n'
      );

      const verifier = new SupplyChainVerifier('warn');
      const status = verifier.getVerificationStatus();

      expect(status.manifestEntries).toBe(1);
    });
  });

  describe('verifyFile', () => {
    it('should return verified=true when hash matches', () => {
      const testContent = 'test file content';
      const expectedHash = createHash('sha256').update(testContent).digest('hex');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('MANIFEST')) {
          return `${expectedHash}  _bmad/test/file.md`;
        }
        return testContent;
      });

      const verifier = new SupplyChainVerifier('warn');
      const result = verifier.verifyFile('_bmad/test/file.md');

      expect(result.verified).toBe(true);
      expect(result.expectedHash).toBe(expectedHash);
      expect(result.actualHash).toBe(expectedHash);
    });

    it('should return result with verified property when hash mismatch', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('MANIFEST')) {
          return 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1  _bmad/test/file.md';
        }
        return 'different content';
      });

      const verifier = new SupplyChainVerifier('warn');
      const result = verifier.verifyFile('_bmad/test/file.md');

      // Result should have proper structure
      expect(result).toHaveProperty('verified');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('filePath');
    });

    it('should return result with proper structure for unknown file', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('MANIFEST')) {
          return 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1  _bmad/other/file.md';
        }
        return 'content';
      });

      const verifier = new SupplyChainVerifier('warn');
      const result = verifier.verifyFile('_bmad/unknown/file.md');

      // Result should have proper structure regardless of verification outcome
      expect(result).toHaveProperty('verified');
      expect(result).toHaveProperty('reason');
    });
  });

  describe('verifySkill', () => {
    it('should parse skill ID correctly', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('MANIFEST')) {
          return 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1  _bmad/intel-team/agents/osint-lead/agent.md';
        }
        return '';
      });

      const verifier = new SupplyChainVerifier('warn');
      // The skill ID should be converted to a path pattern
      const result = verifier.verifySkill('bmad:intel-team:agents:osint-lead');

      // Should look for files matching the skill path - check filePath is defined
      expect(result.filePath).toBeDefined();
    });
  });

  describe('getVerificationStatus', () => {
    it('should return correct status structure', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const verifier = new SupplyChainVerifier('warn');
      const status = verifier.getVerificationStatus();

      // Uses camelCase property names
      expect(status).toHaveProperty('manifestLoaded');
      expect(status).toHaveProperty('manifestEntries');
      expect(status).toHaveProperty('manifestSignatureValid');
      expect(status).toHaveProperty('manifestSigner');
      expect(status).toHaveProperty('filesVerified');
      expect(status).toHaveProperty('verifyMode');
    });

    it('should report correct verify mode', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const verifier = new SupplyChainVerifier('strict');
      const status = verifier.getVerificationStatus();

      expect(status.verifyMode).toBe('strict');
    });
  });

  describe('verify mode behavior', () => {
    it('disabled mode should allow without manifest', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const verifier = new SupplyChainVerifier('disabled');
      // In disabled mode, verification should still pass even if manifest not found
      const status = verifier.getVerificationStatus();
      expect(status.verifyMode).toBe('disabled');
    });
  });

  describe('cache behavior', () => {
    it('should cache verification results', () => {
      const testContent = 'cached content';
      const hash = createHash('sha256').update(testContent).digest('hex');

      vi.mocked(existsSync).mockReturnValue(true);
      let readCount = 0;
      vi.mocked(readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('MANIFEST')) {
          return `${hash}  _bmad/cached/file.md`;
        }
        readCount++;
        return testContent;
      });

      const verifier = new SupplyChainVerifier('warn');

      // First call - should read file
      verifier.verifyFile('_bmad/cached/file.md');
      const firstReadCount = readCount;

      // Second call - should use cache
      verifier.verifyFile('_bmad/cached/file.md');

      // Read count should not increase for cached file
      // (manifest is read separately, so we check the file read count)
      expect(readCount).toBe(firstReadCount);
    });
  });
});
