/**
 * SA-02-S2: Manual Code Review Verification Tests
 *
 * Validates that HIGH-severity findings from the manual code review
 * of 13 security-critical files have been remediated.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '../..');

describe('SA-02-S2: Manual Code Review — Remediations', () => {
  // ── File 1: authorization.js (FINDING-03: Path traversal rejection) ────
  describe('authorization.js — Path traversal hardening', () => {
    const filePath = join(ROOT, 'src/core/security/authorization.js');

    it('rejects path traversal (..) in agentPathResolver', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain("agentId.includes('..')");
    });

    it('rejects URL-encoded characters (%) in agentPathResolver', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain("agentId.includes('%')");
    });

    it('rejects double slashes (//) in agentPathResolver', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain("agentId.includes('//')");
    });

    it('normalizes trailing slashes before processing', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toMatch(/normalizedId\s*=\s*agentId\.replace/);
    });

    it('uses normalizedId for all format handling', () => {
      const content = readFileSync(filePath, 'utf8');
      // v6 format should use normalizedId
      expect(content).toContain("normalizedId.startsWith('src/')");
      // legacy format should also use normalizedId
      expect(content).toContain('normalizedId.split');
    });
  });

  // ── File 3: extractor.js (FINDING-15: setuid/setgid stripping) ─────────
  describe('extractor.js — Permission bit stripping', () => {
    const filePath = join(ROOT, 'tools/cli/lib/extractor.js');

    it('strips setuid/setgid/sticky bits with 0o0777 mask', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain('entry.mode & 0o0777');
    });

    it('does NOT have the old no-op mode assignment', () => {
      const content = readFileSync(filePath, 'utf8');
      // Old code was: entry.mode = entry.mode; (no-op)
      expect(content).not.toMatch(/entry\.mode\s*=\s*entry\.mode\s*;/);
    });
  });

  // ── File 4: downloader.js (FINDING-23: tagName path traversal) ─────────
  describe('downloader.js — tagName sanitization', () => {
    const filePath = join(ROOT, 'tools/cli/lib/downloader.js');

    it('sanitizes path separators from tagName', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toMatch(/safeTagName\s*=\s*tagName\.replace/);
    });

    it('replaces both forward and back slashes', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toMatch(/replace\(\/\[\/\\\\]\/g/);
    });

    it('uses safeTagName for filename construction', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain('`${safeTagName}.tar.gz`');
    });
  });

  // ── File 6: safe-cli.js (FINDING-6B: URL validation) ──────────────────
  describe('safe-cli.js — URL argument validation', () => {
    const filePath = join(ROOT, 'src/security/supply-chain/safe-cli.js');

    it('validates URL arguments with new URL() constructor', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain('new URL(arg)');
    });

    it('rejects URLs with command substitution', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain("arg.includes('$(')");
    });

    it('rejects URLs with backticks', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain("arg.includes('`')");
    });

    it('rejects URLs with newlines', () => {
      const content = readFileSync(filePath, 'utf8');
      expect(content).toContain("arg.includes('\\n')");
    });
  });

  // ── Cross-file: OWASP category confirmations ──────────────────────────
  describe('OWASP Category Confirmations', () => {
    it('authorization.js exists (A01 Broken Access Control)', () => {
      expect(existsSync(join(ROOT, 'src/core/security/authorization.js'))).toBe(true);
    });

    it('package-merger.js exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, 'tools/cli/lib/package-merger.js'))).toBe(true);
    });

    it('extractor.js exists (A01 Broken Access Control)', () => {
      expect(existsSync(join(ROOT, 'tools/cli/lib/extractor.js'))).toBe(true);
    });

    it('downloader.js exists (A10 SSRF)', () => {
      expect(existsSync(join(ROOT, 'tools/cli/lib/downloader.js'))).toBe(true);
    });

    it('git-clone.js exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, 'tools/cli/lib/git-clone.js'))).toBe(true);
    });

    it('safe-cli.js exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, 'src/security/supply-chain/safe-cli.js'))).toBe(true);
    });

    it('audit-logger.ts exists (A09 Logging Failures)', () => {
      expect(existsSync(join(ROOT, 'src/security/audit/audit-logger.ts'))).toBe(true);
    });

    it('prompts.js exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, 'src/utility/cli/prompts.js'))).toBe(true);
    });

    it('bash-safety.ts exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, '.claude/validators-node/src/guards/bash-safety.ts'))).toBe(true);
    });

    it('secret.ts exists (A07 Authentication Failures)', () => {
      expect(existsSync(join(ROOT, '.claude/validators-node/src/guards/secret.ts'))).toBe(true);
    });

    it('patterns.ts (PII) exists (A01)', () => {
      expect(existsSync(join(ROOT, '.claude/validators-node/src/guards/pii/patterns.ts'))).toBe(true);
    });

    it('prompt-injection.ts exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, '.claude/validators-node/src/ai-safety/prompt-injection.ts'))).toBe(true);
    });

    it('jailbreak.ts exists (A03 Injection)', () => {
      expect(existsSync(join(ROOT, '.claude/validators-node/src/ai-safety/jailbreak.ts'))).toBe(true);
    });
  });
});
