/**
 * Unit Tests for Model Selection UI - INST-014
 * Epic 3, Story 4 - Interactive Model Selection
 *
 * @module llm-setup/model-selection-ui.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  COMMON_MODEL_DESCRIPTIONS,
  getModelDescription,
  buildModelChoices,
  categorizeModels
} from './model-selection-ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Model Selection UI - INST-014', () => {
  describe('COMMON_MODEL_DESCRIPTIONS', () => {
    it('should have descriptions for Llama models', () => {
      expect(COMMON_MODEL_DESCRIPTIONS['llama2']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['llama3']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['llama3.1']).toBeDefined();
    });

    it('should have descriptions for code models', () => {
      expect(COMMON_MODEL_DESCRIPTIONS['codellama']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['deepseek-coder']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['starcoder2']).toBeDefined();
    });

    it('should have descriptions for Mistral models', () => {
      expect(COMMON_MODEL_DESCRIPTIONS['mistral']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['mixtral']).toBeDefined();
    });

    it('should have descriptions for Qwen models', () => {
      expect(COMMON_MODEL_DESCRIPTIONS['qwen']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['qwen2']).toBeDefined();
      expect(COMMON_MODEL_DESCRIPTIONS['qwen2.5']).toBeDefined();
    });

    it('should have description for default model', () => {
      expect(COMMON_MODEL_DESCRIPTIONS['default']).toBeDefined();
    });

    it('should have at least 30 model descriptions', () => {
      const count = Object.keys(COMMON_MODEL_DESCRIPTIONS).length;
      expect(count).toBeGreaterThanOrEqual(30);
    });
  });

  describe('getModelDescription', () => {
    it('should return description for exact match', () => {
      const desc = getModelDescription('llama2');
      expect(desc).toBe(COMMON_MODEL_DESCRIPTIONS['llama2']);
    });

    it('should return description for versioned model', () => {
      const desc = getModelDescription('llama2:7b');
      expect(desc).toBeDefined();
      expect(desc.length).toBeGreaterThan(0);
    });

    it('should return base model description for unknown version', () => {
      const desc = getModelDescription('llama2:unknown');
      expect(desc).toBe(COMMON_MODEL_DESCRIPTIONS['llama2']);
    });

    it('should handle case insensitivity', () => {
      const desc = getModelDescription('LLAMA2');
      // Should find llama2 (lowercase in descriptions)
      expect(desc).toBeDefined();
    });

    it('should return empty string for unknown model', () => {
      const desc = getModelDescription('completely-unknown-model');
      expect(desc).toBe('');
    });

    it('should handle model names with slashes', () => {
      const desc = getModelDescription('meta-llama/Llama-3.1-70B');
      // May or may not find, but should not throw
      expect(typeof desc).toBe('string');
    });
  });

  describe('buildModelChoices', () => {
    it('should build choices from models array', () => {
      const models = ['llama2', 'mistral'];
      const choices = buildModelChoices(models);

      const values = choices.filter(c => c.value).map(c => c.value);
      expect(values).toContain('llama2');
      expect(values).toContain('mistral');
    });

    it('should include custom option by default', () => {
      const models = ['llama2'];
      const choices = buildModelChoices(models);

      const hasCustom = choices.some(c => c.value === '__custom__');
      expect(hasCustom).toBe(true);
    });

    it('should exclude custom option when disabled', () => {
      const models = ['llama2'];
      const choices = buildModelChoices(models, { allowCustom: false });

      const hasCustom = choices.some(c => c.value === '__custom__');
      expect(hasCustom).toBe(false);
    });

    it('should mark current model', () => {
      const models = ['llama2', 'mistral'];
      const choices = buildModelChoices(models, { currentModel: 'mistral' });

      const mistralChoice = choices.find(c => c.value === 'mistral');
      expect(mistralChoice.name).toContain('*');
    });

    it('should handle empty models array', () => {
      const choices = buildModelChoices([]);

      // Should still have custom option
      const hasCustom = choices.some(c => c.value === '__custom__');
      expect(hasCustom).toBe(true);

      // Should have separator about no models
      const hasSeparator = choices.some(
        c => c.type === 'separator' && c.separator?.includes('No models')
      );
      expect(hasSeparator).toBe(true);
    });

    it('should include model descriptions', () => {
      const models = ['llama2'];
      const choices = buildModelChoices(models);

      const llamaChoice = choices.find(c => c.value === 'llama2');
      expect(llamaChoice.name).toContain(COMMON_MODEL_DESCRIPTIONS['llama2']);
    });

    it('should include model count in separator', () => {
      const models = ['m1', 'm2', 'm3'];
      const choices = buildModelChoices(models);

      const hasSeparator = choices.some(
        c => c.type === 'separator' && c.separator?.includes('3')
      );
      expect(hasSeparator).toBe(true);
    });

    it('should have short name for each model choice', () => {
      const models = ['llama2', 'mistral'];
      const choices = buildModelChoices(models);

      const modelChoices = choices.filter(c => c.value && c.value !== '__custom__');
      for (const choice of modelChoices) {
        expect(choice.short).toBeDefined();
        expect(choice.short).toBe(choice.value);
      }
    });
  });

  describe('categorizeModels', () => {
    it('should categorize code models', () => {
      const models = ['codellama', 'starcoder2', 'deepseek-coder-v2'];
      const categories = categorizeModels(models);

      expect(categories.code).toContain('codellama');
      expect(categories.code).toContain('starcoder2');
      expect(categories.code).toContain('deepseek-coder-v2');
    });

    it('should categorize general models', () => {
      const models = ['llama2', 'mistral', 'mixtral', 'phi3', 'gemma'];
      const categories = categorizeModels(models);

      expect(categories.general).toContain('llama2');
      expect(categories.general).toContain('mistral');
      expect(categories.general).toContain('mixtral');
      expect(categories.general).toContain('phi3');
      expect(categories.general).toContain('gemma');
    });

    it('should categorize multilingual models', () => {
      const models = ['qwen2', 'yi'];
      const categories = categorizeModels(models);

      expect(categories.multilingual).toContain('qwen2');
      expect(categories.multilingual).toContain('yi');
    });

    it('should put unknown models in other', () => {
      const models = ['custom-model', 'unknown-v1'];
      const categories = categorizeModels(models);

      expect(categories.other).toContain('custom-model');
      expect(categories.other).toContain('unknown-v1');
    });

    it('should handle empty array', () => {
      const categories = categorizeModels([]);

      expect(categories.code).toEqual([]);
      expect(categories.general).toEqual([]);
      expect(categories.multilingual).toEqual([]);
      expect(categories.other).toEqual([]);
    });

    it('should handle mixed models', () => {
      const models = ['llama2', 'codellama', 'qwen', 'random-model'];
      const categories = categorizeModels(models);

      expect(categories.general).toContain('llama2');
      expect(categories.code).toContain('codellama');
      expect(categories.multilingual).toContain('qwen');
      expect(categories.other).toContain('random-model');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'model-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'model-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import inquirer and chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'model-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+inquirer\s+from\s+['"]inquirer['"]/);
      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });
  });
});
