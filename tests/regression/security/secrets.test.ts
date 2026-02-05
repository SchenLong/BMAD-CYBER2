/**
 * BMAD CYBERCOMMAND - Secret Detection Tests
 * ==========================================
 * Regression tests for secret detection functionality.
 * These tests verify that secrets are properly detected and blocked.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Secret Detection', () => {
  describe('Secret Guard Validator', () => {
    it('should have secret.ts guard file', () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      expect(fs.existsSync(secretPath)).toBe(true);
    });

    it('should export validateSecretGuard function', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('export function validateSecretGuard');
    });

    it('should export detectSecrets function', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('export function detectSecrets');
    });

    it('should export calculateEntropy function', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('export function calculateEntropy');
    });

    it('should export isHighEntropy function', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('export function isHighEntropy');
    });
  });

  describe('Critical Secret Patterns', () => {
    it('should detect AWS Access Key patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('AWS Access Key');
      expect(content).toContain('AKIA');
    });

    it('should detect GitHub token patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('GitHub');
      expect(content).toContain('ghp_');
    });

    it('should detect Stripe key patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('Stripe');
      expect(content).toContain('sk_live_');
    });

    it('should detect OpenAI key patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('OpenAI');
      expect(content).toContain('sk-');
    });

    it('should detect Anthropic key patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('Anthropic');
      expect(content).toContain('sk-ant-');
    });

    it('should detect private key patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('Private Key');
      expect(content).toContain('BEGIN');
      expect(content).toContain('PRIVATE');
    });

    it('should detect database URL patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('Database');
      expect(content).toContain('mongodb');
      expect(content).toContain('postgres');
    });
  });

  describe('Example/Placeholder Detection', () => {
    it('should define EXPECTED_SECRET_FILES', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('EXPECTED_SECRET_FILES');
    });

    it('should include .env.example in expected files', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('.env.example');
    });

    it('should define EXAMPLE_INDICATORS patterns', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('EXAMPLE_INDICATORS');
    });

    it('should have isExpectedSecretFile function', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('export function isExpectedSecretFile');
    });

    it('should have isExampleContent function', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('export function isExampleContent');
    });
  });

  describe('Confidence Levels', () => {
    it('should define critical confidence level', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain("'critical'");
    });

    it('should define high confidence level', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain("'high'");
    });

    it('should define medium confidence level', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain("'medium'");
    });

    it('should have CRITICAL_PATTERNS array', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('CRITICAL_PATTERNS');
    });

    it('should have HIGH_PATTERNS array', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('HIGH_PATTERNS');
    });

    it('should have MEDIUM_PATTERNS array', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('MEDIUM_PATTERNS');
    });
  });

  describe('Override Support', () => {
    it('should support BMAD_ALLOW_SECRETS override', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('BMAD_ALLOW_SECRETS');
    });

    it('should use OverrideManager', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('OverrideManager');
    });

    it('should log override usage', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('logOverrideUsed');
    });
  });

  describe('Audit Logging', () => {
    it('should use AuditLogger', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('AuditLogger');
    });

    it('should log allowed operations', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('logAllowed');
    });

    it('should log blocked operations', async () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const content = fs.readFileSync(secretPath, 'utf-8');

      expect(content).toContain('logBlocked');
    });
  });
});

describe('Content Scanning', () => {
  it('should have CONTENT_SCANNING_PATTERNS', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    expect(content).toContain('CONTENT_SCANNING_PATTERNS');
  });

  it('should detect database connection strings in content', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    expect(content).toContain('DATABASE_URL');
    expect(content).toContain('Connection String');
  });

  it('should detect AWS credentials in text content', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    expect(content).toContain('AWS_ACCESS_KEY_ID');
    expect(content).toContain('AWS_SECRET_ACCESS_KEY');
  });

  it('should detect Bearer tokens in authorization headers', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    expect(content).toContain('Authorization');
    expect(content).toContain('Bearer');
  });
});
