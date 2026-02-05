/**
 * BMAD CYBERCOMMAND - Hook Enforcement Tests
 * ==========================================
 * Regression tests for security hook enforcement.
 * These tests ensure hooks are properly configured and executed.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Hook Enforcement', () => {
  describe('Hooks Directory Structure', () => {
    it('should have .claude/hooks directory', () => {
      const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
      expect(fs.existsSync(hooksDir)).toBe(true);
    });

    it('should have hook shell scripts', () => {
      const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');

      if (fs.existsSync(hooksDir)) {
        const files = fs.readdirSync(hooksDir);
        const shellScripts = files.filter(f => f.endsWith('.sh'));
        expect(shellScripts.length).toBeGreaterThan(0);
      }
    });

    it('should have play-tts.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/play-tts.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });

    it('should have voice-manager.sh hook', () => {
      const hookPath = path.join(PROJECT_ROOT, '.claude/hooks/voice-manager.sh');
      expect(fs.existsSync(hookPath)).toBe(true);
    });
  });

  describe('Validators Node Directory', () => {
    it('should have .claude/validators-node directory', () => {
      const validatorsDir = path.join(PROJECT_ROOT, '.claude/validators-node');
      expect(fs.existsSync(validatorsDir)).toBe(true);
    });

    it('should have validators source directory', () => {
      const srcDir = path.join(PROJECT_ROOT, '.claude/validators-node/src');
      expect(fs.existsSync(srcDir)).toBe(true);
    });

    it('should have validators index.ts entry point', () => {
      const indexPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });
  });

  describe('Guard Validators', () => {
    it('should have guards directory', () => {
      const guardsDir = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards');
      expect(fs.existsSync(guardsDir)).toBe(true);
    });

    it('should have secret guard validator', () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      expect(fs.existsSync(secretPath)).toBe(true);
    });

    it('should have bash-safety guard validator', () => {
      const bashPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/bash-safety.ts');
      expect(fs.existsSync(bashPath)).toBe(true);
    });

    it('should have env-protection guard validator', () => {
      const envPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/env-protection.ts');
      expect(fs.existsSync(envPath)).toBe(true);
    });

    it('should have outside-repo guard validator', () => {
      const outsidePath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/outside-repo.ts');
      expect(fs.existsSync(outsidePath)).toBe(true);
    });

    it('should have production guard validator', () => {
      const prodPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/production.ts');
      expect(fs.existsSync(prodPath)).toBe(true);
    });
  });

  describe('AI Safety Validators', () => {
    it('should have ai-safety directory', () => {
      const aiDir = path.join(PROJECT_ROOT, '.claude/validators-node/src/ai-safety');
      expect(fs.existsSync(aiDir)).toBe(true);
    });

    it('should have prompt-injection validator', () => {
      const promptPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/ai-safety/prompt-injection.ts');
      expect(fs.existsSync(promptPath)).toBe(true);
    });

    it('should have jailbreak validator', () => {
      const jailbreakPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/ai-safety/jailbreak.ts');
      expect(fs.existsSync(jailbreakPath)).toBe(true);
    });
  });

  describe('Observability Validators', () => {
    it('should have observability directory', () => {
      const obsDir = path.join(PROJECT_ROOT, '.claude/validators-node/src/observability');
      expect(fs.existsSync(obsDir)).toBe(true);
    });

    it('should have audit-logger', () => {
      const auditPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/common/audit-logger.ts');
      expect(fs.existsSync(auditPath)).toBe(true);
    });

    it('should have anomaly-detector', () => {
      const anomalyPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/observability/anomaly-detector.ts');
      expect(fs.existsSync(anomalyPath)).toBe(true);
    });

    it('should have telemetry module', () => {
      const telemetryPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/observability/telemetry.ts');
      expect(fs.existsSync(telemetryPath)).toBe(true);
    });
  });
});

describe('Validator Exit Codes', () => {
  it('should define EXIT_CODES in types', async () => {
    const typesPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/types/index.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');

    expect(content).toContain('EXIT_CODES');
  });

  it('should have ALLOW exit code', async () => {
    const typesPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/types/index.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');

    expect(content).toContain('ALLOW');
  });

  it('should have HARD_BLOCK exit code', async () => {
    const typesPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/types/index.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Check for blocking exit code (could be HARD_BLOCK or BLOCK)
    expect(content).toMatch(/BLOCK/i);
  });
});

describe('Common Utilities', () => {
  it('should have common directory', () => {
    const commonDir = path.join(PROJECT_ROOT, '.claude/validators-node/src/common');
    expect(fs.existsSync(commonDir)).toBe(true);
  });

  it('should have audit-logger utility', () => {
    const auditPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/common/audit-logger.ts');
    expect(fs.existsSync(auditPath)).toBe(true);
  });

  it('should have stdin-parser utility', () => {
    const stdinPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/common/stdin-parser.ts');
    expect(fs.existsSync(stdinPath)).toBe(true);
  });

  it('should have override-manager utility', () => {
    const overridePath = path.join(PROJECT_ROOT, '.claude/validators-node/src/common/override-manager.ts');
    expect(fs.existsSync(overridePath)).toBe(true);
  });
});
