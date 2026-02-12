/**
 * Unit Tests for Config Sync Service - INST-038
 * Epic 3, Story 2 - Configuration Synchronization
 *
 * @module llm-setup/config-sync.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import {
  CONFIG_PATHS,
  detectDrift,
  ensureSynced,
  formatConfigStatus,
  getConfigStatus,
  getEffectiveProvider,
  isValidProvider,
  readTxtProvider,
  readYamlProvider,
  syncToProvider,
  writeTxtProvider,
  writeYamlProvider
} from './config-sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Config Sync Service - INST-038', () => {
  let tempDir;

  beforeEach(() => {
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-sync-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('CONFIG_PATHS', () => {
    it('should define yaml config path', () => {
      expect(CONFIG_PATHS.yamlConfig).toBe('_bmad/_config/llm-config.yaml');
    });

    it('should define txt config path', () => {
      expect(CONFIG_PATHS.txtConfig).toBe('.claude/llm-provider.txt');
    });
  });

  describe('readYamlProvider', () => {
    it('should read active_provider from yaml file', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(
        path.join(yamlDir, 'llm-config.yaml'),
        'version: "1.0"\nactive_provider: ollama\n'
      );

      const result = readYamlProvider(tempDir);

      expect(result).toBe('ollama');
    });

    it('should handle quoted provider names', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(
        path.join(yamlDir, 'llm-config.yaml'),
        'active_provider: "claude"\n'
      );

      const result = readYamlProvider(tempDir);

      expect(result).toBe('claude');
    });

    it('should return null for missing file', () => {
      const result = readYamlProvider(tempDir);
      expect(result).toBeNull();
    });

    it('should return null for file without active_provider', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(
        path.join(yamlDir, 'llm-config.yaml'),
        'version: "1.0"\n'
      );

      const result = readYamlProvider(tempDir);

      expect(result).toBeNull();
    });
  });

  describe('readTxtProvider', () => {
    it('should read provider from txt file', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const result = readTxtProvider(tempDir);

      expect(result).toBe('ollama');
    });

    it('should trim whitespace', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), '  claude  \n');

      const result = readTxtProvider(tempDir);

      expect(result).toBe('claude');
    });

    it('should return null for missing file', () => {
      const result = readTxtProvider(tempDir);
      expect(result).toBeNull();
    });

    it('should return null for empty file', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), '');

      const result = readTxtProvider(tempDir);

      expect(result).toBeNull();
    });

    it('should return null for invalid content', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'not a valid provider name!');

      const result = readTxtProvider(tempDir);

      expect(result).toBeNull();
    });
  });

  describe('writeYamlProvider', () => {
    it('should create yaml file with provider', () => {
      const result = writeYamlProvider(tempDir, 'groq');

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(tempDir, '_bmad/_config/llm-config.yaml'),
        'utf8'
      );
      expect(content).toContain('active_provider: groq');
    });

    it('should update existing yaml file', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(
        path.join(yamlDir, 'llm-config.yaml'),
        'version: "1.0"\nactive_provider: claude\nother: value\n'
      );

      const result = writeYamlProvider(tempDir, 'ollama');

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(yamlDir, 'llm-config.yaml'),
        'utf8'
      );
      expect(content).toContain('active_provider: ollama');
      expect(content).toContain('version: "1.0"');
      expect(content).toContain('other: value');
    });

    it('should create directory structure if missing', () => {
      const result = writeYamlProvider(tempDir, 'vllm');

      expect(result).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '_bmad/_config'))).toBe(true);
    });
  });

  describe('writeTxtProvider', () => {
    it('should create txt file with provider', () => {
      const result = writeTxtProvider(tempDir, 'ollama');

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(tempDir, '.claude/llm-provider.txt'),
        'utf8'
      );
      expect(content.trim()).toBe('ollama');
    });

    it('should overwrite existing txt file', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'old-provider\n');

      const result = writeTxtProvider(tempDir, 'new-provider');

      expect(result).toBe(true);

      const content = fs.readFileSync(
        path.join(txtDir, 'llm-provider.txt'),
        'utf8'
      );
      expect(content.trim()).toBe('new-provider');
    });

    it('should create directory structure if missing', () => {
      const result = writeTxtProvider(tempDir, 'claude');

      expect(result).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.claude'))).toBe(true);
    });
  });

  describe('detectDrift', () => {
    it('should detect synced configs', () => {
      // Create both files with same provider
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'claude\n');

      const state = detectDrift(tempDir);

      expect(state.synced).toBe(true);
      expect(state.yamlProvider).toBe('claude');
      expect(state.txtProvider).toBe('claude');
      expect(state.drift).toBeNull();
    });

    it('should detect mismatched configs', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const state = detectDrift(tempDir);

      expect(state.synced).toBe(false);
      expect(state.yamlProvider).toBe('claude');
      expect(state.txtProvider).toBe('ollama');
      expect(state.drift).toContain('mismatch');
    });

    it('should detect missing yaml', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const state = detectDrift(tempDir);

      expect(state.synced).toBe(false);
      expect(state.yamlExists).toBe(false);
      expect(state.txtExists).toBe(true);
      expect(state.drift).toContain('yaml');
      expect(state.drift).toContain('missing');
    });

    it('should detect missing txt', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');

      const state = detectDrift(tempDir);

      expect(state.synced).toBe(false);
      expect(state.yamlExists).toBe(true);
      expect(state.txtExists).toBe(false);
      expect(state.drift).toContain('txt');
      expect(state.drift).toContain('missing');
    });

    it('should treat both missing as synced', () => {
      const state = detectDrift(tempDir);

      expect(state.synced).toBe(true);
      expect(state.yamlExists).toBe(false);
      expect(state.txtExists).toBe(false);
    });
  });

  describe('getEffectiveProvider', () => {
    it('should prefer txt over yaml', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const result = getEffectiveProvider(tempDir);

      expect(result).toBe('ollama');
    });

    it('should fall back to yaml if txt missing', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: groq\n');

      const result = getEffectiveProvider(tempDir);

      expect(result).toBe('groq');
    });

    it('should default to claude if both missing', () => {
      const result = getEffectiveProvider(tempDir);
      expect(result).toBe('claude');
    });
  });

  describe('syncToProvider', () => {
    it('should sync both files to provider', () => {
      const result = syncToProvider('vllm', tempDir);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('vllm');

      expect(readYamlProvider(tempDir)).toBe('vllm');
      expect(readTxtProvider(tempDir)).toBe('vllm');
    });

    it('should include action description', () => {
      const result = syncToProvider('ollama', tempDir);

      expect(result.action).toContain('ollama');
    });
  });

  describe('ensureSynced', () => {
    it('should return success for already synced configs', async () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'claude\n');

      const result = await ensureSynced({ projectRoot: tempDir });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('claude');
    });

    it('should auto-resolve with txt taking precedence', async () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const result = await ensureSynced({ projectRoot: tempDir, autoResolve: true });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('ollama');
      expect(readYamlProvider(tempDir)).toBe('ollama');
    });

    it('should use promptUser function for resolution', async () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const promptUser = vi.fn().mockResolvedValue('groq');

      const result = await ensureSynced({ projectRoot: tempDir, promptUser });

      expect(promptUser).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('groq');
    });

    it('should handle cancelled user prompt', async () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const promptUser = vi.fn().mockResolvedValue(null);

      const result = await ensureSynced({ projectRoot: tempDir, promptUser });

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelled');
    });

    it('should return drift info when no resolution method', async () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const result = await ensureSynced({ projectRoot: tempDir });

      expect(result.success).toBe(false);
      expect(result.error).toContain('mismatch');
    });
  });

  describe('isValidProvider', () => {
    it('should accept valid provider names', () => {
      expect(isValidProvider('claude')).toBe(true);
      expect(isValidProvider('ollama')).toBe(true);
      expect(isValidProvider('vllm')).toBe(true);
      expect(isValidProvider('lmstudio')).toBe(true);
      expect(isValidProvider('llamacpp')).toBe(true);
      expect(isValidProvider('openai')).toBe(true);
      expect(isValidProvider('groq')).toBe(true);
      expect(isValidProvider('together')).toBe(true);
      expect(isValidProvider('custom')).toBe(true);
    });

    it('should reject invalid provider names', () => {
      expect(isValidProvider('invalid')).toBe(false);
      expect(isValidProvider('gpt4')).toBe(false);
      expect(isValidProvider('')).toBe(false);
    });
  });

  describe('getConfigStatus', () => {
    it('should return complete status object', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'claude\n');

      const status = getConfigStatus(tempDir);

      expect(status.effective).toBe('claude');
      expect(status.yamlConfig.exists).toBe(true);
      expect(status.yamlConfig.provider).toBe('claude');
      expect(status.txtConfig.exists).toBe(true);
      expect(status.txtConfig.provider).toBe('claude');
      expect(status.synced).toBe(true);
    });

    it('should include drift info when not synced', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const status = getConfigStatus(tempDir);

      expect(status.synced).toBe(false);
      expect(status.drift).toBeDefined();
    });
  });

  describe('formatConfigStatus', () => {
    it('should format synced status', () => {
      const status = {
        effective: 'claude',
        yamlConfig: { exists: true, provider: 'claude', path: CONFIG_PATHS.yamlConfig },
        txtConfig: { exists: true, provider: 'claude', path: CONFIG_PATHS.txtConfig },
        synced: true,
        drift: null
      };

      const output = formatConfigStatus(status);

      expect(output).toContain('LLM Configuration Status');
      expect(output).toContain('Active Provider: claude');
      expect(output).toContain('Status: Synced');
    });

    it('should format drift status', () => {
      const status = {
        effective: 'ollama',
        yamlConfig: { exists: true, provider: 'claude', path: CONFIG_PATHS.yamlConfig },
        txtConfig: { exists: true, provider: 'ollama', path: CONFIG_PATHS.txtConfig },
        synced: false,
        drift: 'Configuration mismatch'
      };

      const output = formatConfigStatus(status);

      expect(output).toContain('DRIFT DETECTED');
      expect(output).toContain('Configuration mismatch');
    });

    it('should show missing files', () => {
      const status = {
        effective: 'claude',
        yamlConfig: { exists: false, provider: null, path: CONFIG_PATHS.yamlConfig },
        txtConfig: { exists: true, provider: 'claude', path: CONFIG_PATHS.txtConfig },
        synced: false,
        drift: 'yaml missing'
      };

      const output = formatConfigStatus(status);

      expect(output).toContain('(missing)');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'config-sync.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'config-sync.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });
  });
});
