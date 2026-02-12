/**
 * Unit Tests for LLM Setup Entry Point - INST-018
 * Epic 3, Story 8 - Main Orchestration
 *
 * @module llm-setup/index.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Note: The actual runLlmSetup function uses interactive prompts,
// so we test the helper functions and parseArgs primarily

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LLM Setup Entry Point - INST-018', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-setup-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('Module Imports', () => {
    it('should export WIZARD_VERSION', async () => {
      const module = await import('./index.js');
      expect(module.WIZARD_VERSION).toBeDefined();
      expect(typeof module.WIZARD_VERSION).toBe('string');
      expect(module.WIZARD_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should export runLlmSetup function', async () => {
      const module = await import('./index.js');
      expect(module.runLlmSetup).toBeDefined();
      expect(typeof module.runLlmSetup).toBe('function');
    });

    it('should export showCurrentLlmConfig function', async () => {
      const module = await import('./index.js');
      expect(module.showCurrentLlmConfig).toBeDefined();
      expect(typeof module.showCurrentLlmConfig).toBe('function');
    });

    it('should export detectAndShowLocalProviders function', async () => {
      const module = await import('./index.js');
      expect(module.detectAndShowLocalProviders).toBeDefined();
      expect(typeof module.detectAndShowLocalProviders).toBe('function');
    });
  });

  describe('WIZARD_VERSION', () => {
    it('should have version 2.0.0', async () => {
      const module = await import('./index.js');
      expect(module.WIZARD_VERSION).toBe('2.0.0');
    });

    it('should be a semantic version', async () => {
      const module = await import('./index.js');
      const parts = module.WIZARD_VERSION.split('.');
      expect(parts).toHaveLength(3);
      expect(parts.every(p => !isNaN(parseInt(p, 10)))).toBe(true);
    });
  });

  describe('showCurrentLlmConfig', () => {
    it('should handle missing config files', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Should not throw
      expect(() => module.showCurrentLlmConfig(tempDir)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should display existing config', async () => {
      const module = await import('./index.js');

      // Create config structure
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: ollama\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      module.showCurrentLlmConfig(tempDir);

      // Should have called console.log
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('detectAndShowLocalProviders', () => {
    it('should return array of providers', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.detectAndShowLocalProviders();

      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should log detection results', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await module.detectAndShowLocalProviders();

      expect(consoleSpy).toHaveBeenCalled();
      // Should include scanning message
      const calls = consoleSpy.mock.calls.flat();
      expect(calls.some(c => typeof c === 'string' && c.toLowerCase().includes('scan'))).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('runLlmSetup with showOnly', () => {
    it('should return success with showOnly option', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runLlmSetup({
        showOnly: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('show');

      consoleSpy.mockRestore();
    });
  });

  describe('runLlmSetup with detectOnly', () => {
    it('should return success with detectOnly option', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runLlmSetup({
        detectOnly: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('detect');
      expect(result.providers).toBeDefined();
      expect(Array.isArray(result.providers)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should include providers array in result', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runLlmSetup({
        detectOnly: true,
        projectRoot: tempDir,
        silent: true
      });

      expect(result.providers).toBeDefined();
      // Each provider should have expected properties
      for (const provider of result.providers) {
        expect(provider).toHaveProperty('code');
        expect(provider).toHaveProperty('name');
      }

      consoleSpy.mockRestore();
    });
  });

  describe('runLlmSetup with unknown provider', () => {
    it('should fail with unknown provider', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await module.runLlmSetup({
        provider: 'nonexistent-provider-xyz',
        projectRoot: tempDir,
        silent: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('runLlmSetup options', () => {
    it('should accept projectRoot option', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Just test showOnly to avoid interactive prompts
      const result = await module.runLlmSetup({
        showOnly: true,
        projectRoot: tempDir
      });

      expect(result.success).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should accept silent option', async () => {
      const module = await import('./index.js');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await module.runLlmSetup({
        showOnly: true,
        projectRoot: tempDir,
        silent: true
      });

      // With silent, banner should not be shown (but showCurrentLlmConfig still logs)
      const bannerCalls = consoleSpy.mock.calls.filter(c =>
        typeof c[0] === 'string' && c[0].includes('BMAD LLM Provider Setup Wizard')
      );
      expect(bannerCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should accept skipTest option', async () => {
      const module = await import('./index.js');

      // Just verify the option is accepted without error
      const result = await module.runLlmSetup({
        showOnly: true,
        projectRoot: tempDir,
        skipTest: true
      });

      expect(result).toBeDefined();
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import from local modules', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      // Multi-line imports with curly braces
      expect(moduleContent).toMatch(/from\s+['"]\.\/local-detector\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/config-sync\.js['"]/);
      expect(moduleContent).toMatch(/from\s+['"]\.\/provider-selection-ui\.js['"]/);
    });

    it('should import chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });

    it('should import prompts abstraction', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+\{.*\}\s+from\s+['"].*cli\/prompts\.js['"]/);
    });
  });

  describe('Module Structure', () => {
    it('should have displayBanner function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/function\s+displayBanner/);
    });

    it('should have parseArgs function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/function\s+parseArgs/);
    });

    it('should have showHelp function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/function\s+showHelp/);
    });

    it('should have ESM entry point detection', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.argv\[1\]\s*===\s*fileURLToPath\(import\.meta\.url\)/);
    });
  });

  describe('Command Line Argument Parsing', () => {
    it('should support --show flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/['"]--show['"]/);
      expect(moduleContent).toMatch(/['"]-s['"]/);
    });

    it('should support --detect flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/['"]--detect['"]/);
      expect(moduleContent).toMatch(/['"]-d['"]/);
    });

    it('should support --provider flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/['"]--provider['"]/);
      expect(moduleContent).toMatch(/['"]-p['"]/);
    });

    it('should support --help flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/['"]--help['"]/);
      expect(moduleContent).toMatch(/['"]-h['"]/);
    });

    it('should support --skip-test flag', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/['"]--skip-test['"]/);
    });
  });

  describe('Help Text', () => {
    it('should document cloud providers', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/claude/i);
      expect(moduleContent).toMatch(/openai/i);
      expect(moduleContent).toMatch(/groq/i);
    });

    it('should document local providers', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/ollama/i);
      expect(moduleContent).toMatch(/vllm/i);
      expect(moduleContent).toMatch(/lmstudio/i);
    });

    it('should include usage examples', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/Examples:/i);
      expect(moduleContent).toMatch(/npm run llm:setup/);
    });
  });

  describe('Integration with Other Modules', () => {
    it('should import detectLocalProviders', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/detectLocalProviders/);
    });

    it('should import ensureSynced', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/ensureSynced/);
    });

    it('should import showProviderSelector', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/showProviderSelector/);
    });

    it('should import showModelSelector', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/showModelSelector/);
    });

    it('should import showCustomEndpointFlow', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/showCustomEndpointFlow/);
    });

    it('should import writeConfigs', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/writeConfigs/);
    });
  });

  describe('Shebang and Entry Point', () => {
    it('should have shebang line', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    it('should exit with code 0 on success', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.exit\(0\)/);
    });

    it('should exit with code 1 on failure', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.exit\(1\)/);
    });
  });

  describe('Error Handling', () => {
    it('should catch and handle errors', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\.catch\(/);
    });

    it('should support DEBUG environment variable', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'index.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/process\.env\.DEBUG/);
    });
  });
});
