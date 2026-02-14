/**
 * Unit Tests for Provider Config Writer - INST-017
 * Epic 3, Story 7 - Configuration File Writer
 *
 * @module llm-setup/provider-config.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import {
  API_KEY_ENV_VARS,
  backupConfigs,
  cleanupOldBackups,
  getApiKeyEnvVar,
  updateProviderSettings,
  validateConfig,
  writeConfigs
} from './provider-config.js';

import { CONFIG_PATHS, readTxtProvider, readYamlProvider } from './config-sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Provider Config Writer - INST-017', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'provider-config-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('API_KEY_ENV_VARS', () => {
    it('should have OpenAI env var', () => {
      expect(API_KEY_ENV_VARS.openai).toBe('OPENAI_API_KEY');
    });

    it('should have Groq env var', () => {
      expect(API_KEY_ENV_VARS.groq).toBe('GROQ_API_KEY');
    });

    it('should have Together AI env var', () => {
      expect(API_KEY_ENV_VARS.together).toBe('TOGETHER_API_KEY');
    });

    it('should have custom env var', () => {
      expect(API_KEY_ENV_VARS.custom).toBe('CUSTOM_LLM_API_KEY');
    });
  });

  describe('getApiKeyEnvVar', () => {
    it('should return env var for known provider', () => {
      expect(getApiKeyEnvVar('openai')).toBe('OPENAI_API_KEY');
      expect(getApiKeyEnvVar('groq')).toBe('GROQ_API_KEY');
    });

    it('should return null for unknown provider', () => {
      expect(getApiKeyEnvVar('ollama')).toBeNull();
      expect(getApiKeyEnvVar('unknown')).toBeNull();
    });
  });

  describe('backupConfigs', () => {
    it('should create backup of yaml config', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');

      const backups = backupConfigs(tempDir);

      expect(backups.yaml).toBeDefined();
      expect(fs.existsSync(backups.yaml)).toBe(true);
    });

    it('should create backup of txt config', () => {
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'claude\n');

      const backups = backupConfigs(tempDir);

      expect(backups.txt).toBeDefined();
      expect(fs.existsSync(backups.txt)).toBe(true);
    });

    it('should handle missing files gracefully', () => {
      const backups = backupConfigs(tempDir);

      expect(backups.yaml).toBeUndefined();
      expect(backups.txt).toBeUndefined();
    });

    it('should include timestamp in backup name', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'test\n');

      const backups = backupConfigs(tempDir);

      expect(backups.yaml).toContain('backup-');
    });

    it('should skip backup if content unchanged (deduplication)', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      const yamlPath = path.join(yamlDir, 'llm-config.yaml');
      const content = 'active_provider: claude\n';
      fs.writeFileSync(yamlPath, content);

      // First backup should create
      const first = backupConfigs(tempDir);
      expect(first.yaml).toBeDefined();
      expect(first.skipped?.yaml).toBe(false);

      // Second backup with same content should skip
      const second = backupConfigs(tempDir);
      expect(second.yaml).toBeUndefined();
      expect(second.skipped?.yaml).toBe(true);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should keep only the specified number of backups', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      const yamlPath = path.join(yamlDir, 'llm-config.yaml');
      const content = 'active_provider: claude\n';
      fs.writeFileSync(yamlPath, content);

      // Create multiple backups with different timestamps
      const timestamps = [
        '2026-02-14T20-21-41-800Z',
        '2026-02-14T20-22-19-000Z',
        '2026-02-14T20-22-19-100Z',
        '2026-02-14T20-22-19-200Z',
        '2026-02-14T20-22-19-300Z'
      ];

      timestamps.forEach(ts => {
        fs.copyFileSync(yamlPath, `${yamlPath}.backup-${ts}`);
      });

      // Keep only 2 most recent
      const result = cleanupOldBackups(tempDir, 2);

      expect(result.yaml).toBe(3); // Should remove 3 backups
      const remaining = fs.readdirSync(yamlDir)
        .filter(f => f.startsWith('llm-config.yaml.backup-'));
      expect(remaining.length).toBe(2);
    });

    it('should not fail when no backups exist', () => {
      const result = cleanupOldBackups(tempDir, 3);
      expect(result.yaml).toBe(0);
      expect(result.txt).toBe(0);
    });
  });

  describe('updateProviderSettings', () => {
    it('should create config file if missing', () => {
      const result = updateProviderSettings(tempDir, 'ollama', {
        model: 'llama2'
      });

      expect(result).toBe(true);
      const content = fs.readFileSync(
        path.join(tempDir, CONFIG_PATHS.yamlConfig),
        'utf8'
      );
      expect(content).toContain('active_provider: ollama');
    });

    it('should update model in existing config', () => {
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(
        path.join(yamlDir, 'llm-config.yaml'),
        'active_provider: ollama\nproviders:\n  ollama:\n    model: old-model\n'
      );

      const result = updateProviderSettings(tempDir, 'ollama', {
        model: 'new-model'
      });

      expect(result).toBe(true);
    });
  });

  describe('writeConfigs', () => {
    it('should write to both config files', () => {
      const result = writeConfigs(
        { provider: 'ollama' },
        { projectRoot: tempDir, createBackup: false }
      );

      expect(result.success).toBe(true);
      expect(result.filesWritten).toContain(CONFIG_PATHS.yamlConfig);
      expect(result.filesWritten).toContain(CONFIG_PATHS.txtConfig);
    });

    it('should set provider correctly', () => {
      writeConfigs(
        { provider: 'groq' },
        { projectRoot: tempDir, createBackup: false }
      );

      expect(readYamlProvider(tempDir)).toBe('groq');
      expect(readTxtProvider(tempDir)).toBe('groq');
    });

    it('should create backup when option enabled', () => {
      // Create existing config
      const yamlDir = path.join(tempDir, '_bmad/_config');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');

      writeConfigs(
        { provider: 'ollama' },
        { projectRoot: tempDir, createBackup: true }
      );

      // Check backup exists
      const files = fs.readdirSync(yamlDir);
      const backupFiles = files.filter(f => f.includes('backup'));
      expect(backupFiles.length).toBeGreaterThan(0);
    });

    it('should detect and resolve drift', () => {
      // Create mismatched configs
      const yamlDir = path.join(tempDir, '_bmad/_config');
      const txtDir = path.join(tempDir, '.claude');
      fs.mkdirSync(yamlDir, { recursive: true });
      fs.mkdirSync(txtDir, { recursive: true });
      fs.writeFileSync(path.join(yamlDir, 'llm-config.yaml'), 'active_provider: claude\n');
      fs.writeFileSync(path.join(txtDir, 'llm-provider.txt'), 'ollama\n');

      const result = writeConfigs(
        { provider: 'groq' },
        { projectRoot: tempDir, createBackup: false, checkDrift: true }
      );

      expect(result.driftResolved).toBe(true);
      expect(readYamlProvider(tempDir)).toBe('groq');
      expect(readTxtProvider(tempDir)).toBe('groq');
    });

    it('should handle write errors gracefully', () => {
      // Create read-only directory scenario by using invalid path
      const result = writeConfigs(
        { provider: 'ollama' },
        { projectRoot: '/nonexistent/path/that/should/fail', createBackup: false }
      );

      expect(result.success).toBe(false);
    });
  });

  describe('validateConfig', () => {
    it('should accept valid config', () => {
      const result = validateConfig({
        provider: 'ollama',
        model: 'llama2',
        baseUrl: 'http://localhost:11434'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require provider', () => {
      const result = validateConfig({});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Provider is required');
    });

    it('should validate baseUrl format', () => {
      const result = validateConfig({
        provider: 'ollama',
        baseUrl: 'not-a-valid-url'
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('URL'))).toBe(true);
    });

    it('should accept config without optional fields', () => {
      const result = validateConfig({
        provider: 'claude'
      });

      expect(result.valid).toBe(true);
    });

    it('should validate model is string', () => {
      const result = validateConfig({
        provider: 'ollama',
        model: 123
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Model'))).toBe(true);
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'provider-config.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'provider-config.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import from config-sync', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'provider-config.js'),
        'utf8'
      );

      // The import can be multi-line so we need to use s flag or check differently
      expect(moduleContent).toMatch(/import\s+[\s\S]*from\s+['"]\.\/config-sync\.js['"]/);
    });
  });
});
