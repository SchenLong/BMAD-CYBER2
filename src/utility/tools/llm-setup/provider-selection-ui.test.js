/**
 * Unit Tests for Provider Selection UI - INST-013
 * Epic 3, Story 3 - Interactive Provider Selection
 *
 * @module llm-setup/provider-selection-ui.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  CLOUD_PROVIDERS,
  LOCAL_PROVIDER_DEFS,
  CUSTOM_PROVIDER,
  enhanceLocalProviders,
  buildProviderChoices,
  getProviderByCode,
  requiresApiKey,
  getProviderGroup
} from './provider-selection-ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Provider Selection UI - INST-013', () => {
  describe('CLOUD_PROVIDERS constant', () => {
    it('should include Claude as first and recommended', () => {
      const claude = CLOUD_PROVIDERS[0];
      expect(claude.code).toBe('claude');
      expect(claude.recommended).toBe(true);
    });

    it('should include OpenAI', () => {
      const openai = CLOUD_PROVIDERS.find(p => p.code === 'openai');
      expect(openai).toBeDefined();
      expect(openai.name).toBe('OpenAI');
      expect(openai.group).toBe('cloud');
    });

    it('should include Groq', () => {
      const groq = CLOUD_PROVIDERS.find(p => p.code === 'groq');
      expect(groq).toBeDefined();
      expect(groq.name).toBe('Groq');
    });

    it('should include Together AI', () => {
      const together = CLOUD_PROVIDERS.find(p => p.code === 'together');
      expect(together).toBeDefined();
      expect(together.name).toBe('Together AI');
    });

    it('should have 4 cloud providers', () => {
      expect(CLOUD_PROVIDERS).toHaveLength(4);
    });

    it('should have descriptions for all cloud providers', () => {
      for (const provider of CLOUD_PROVIDERS) {
        expect(provider.description).toBeDefined();
        expect(provider.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('LOCAL_PROVIDER_DEFS constant', () => {
    it('should include Ollama', () => {
      const ollama = LOCAL_PROVIDER_DEFS.find(p => p.code === 'ollama');
      expect(ollama).toBeDefined();
      expect(ollama.name).toBe('Ollama');
      expect(ollama.group).toBe('local');
    });

    it('should include vLLM', () => {
      const vllm = LOCAL_PROVIDER_DEFS.find(p => p.code === 'vllm');
      expect(vllm).toBeDefined();
      expect(vllm.name).toBe('vLLM');
    });

    it('should include LM Studio', () => {
      const lmstudio = LOCAL_PROVIDER_DEFS.find(p => p.code === 'lmstudio');
      expect(lmstudio).toBeDefined();
      expect(lmstudio.name).toBe('LM Studio');
    });

    it('should include llama.cpp', () => {
      const llamacpp = LOCAL_PROVIDER_DEFS.find(p => p.code === 'llamacpp');
      expect(llamacpp).toBeDefined();
      expect(llamacpp.name).toBe('llama.cpp');
    });

    it('should have 4 local providers', () => {
      expect(LOCAL_PROVIDER_DEFS).toHaveLength(4);
    });
  });

  describe('CUSTOM_PROVIDER constant', () => {
    it('should have custom code', () => {
      expect(CUSTOM_PROVIDER.code).toBe('custom');
    });

    it('should have custom group', () => {
      expect(CUSTOM_PROVIDER.group).toBe('custom');
    });

    it('should have name and description', () => {
      expect(CUSTOM_PROVIDER.name).toBe('Custom Endpoint');
      expect(CUSTOM_PROVIDER.description).toBeDefined();
    });
  });

  describe('enhanceLocalProviders', () => {
    it('should mark running providers as detected', () => {
      const detected = [
        { code: 'ollama', running: true, models: ['llama2'] },
        { code: 'vllm', running: false, models: [] }
      ];

      const enhanced = enhanceLocalProviders(detected);

      const ollama = enhanced.find(p => p.code === 'ollama');
      const vllm = enhanced.find(p => p.code === 'vllm');

      expect(ollama.detected).toBe(true);
      expect(ollama.models).toEqual(['llama2']);
      expect(vllm.detected).toBe(false);
    });

    it('should handle empty detected array', () => {
      const enhanced = enhanceLocalProviders([]);

      expect(enhanced).toHaveLength(4);
      expect(enhanced.every(p => p.detected === false)).toBe(true);
    });

    it('should preserve provider definitions', () => {
      const enhanced = enhanceLocalProviders([]);

      for (const provider of enhanced) {
        expect(provider.name).toBeDefined();
        expect(provider.description).toBeDefined();
        expect(provider.group).toBe('local');
      }
    });

    it('should add models from detected providers', () => {
      const detected = [
        { code: 'ollama', running: true, models: ['model1', 'model2', 'model3'] }
      ];

      const enhanced = enhanceLocalProviders(detected);
      const ollama = enhanced.find(p => p.code === 'ollama');

      expect(ollama.models).toHaveLength(3);
    });
  });

  describe('buildProviderChoices', () => {
    it('should include cloud providers section', () => {
      const choices = buildProviderChoices();

      const hasSeparator = choices.some(
        c => c.type === 'separator' && c.separator?.includes('CLOUD')
      );
      expect(hasSeparator).toBe(true);
    });

    it('should include local providers section', () => {
      const choices = buildProviderChoices();

      const hasSeparator = choices.some(
        c => c.type === 'separator' && c.separator?.includes('LOCAL')
      );
      expect(hasSeparator).toBe(true);
    });

    it('should include custom section', () => {
      const choices = buildProviderChoices();

      const hasSeparator = choices.some(
        c => c.type === 'separator' && c.separator?.includes('CUSTOM')
      );
      expect(hasSeparator).toBe(true);
    });

    it('should include all cloud provider values', () => {
      const choices = buildProviderChoices();
      const values = choices.filter(c => c.value).map(c => c.value);

      expect(values).toContain('claude');
      expect(values).toContain('openai');
      expect(values).toContain('groq');
      expect(values).toContain('together');
    });

    it('should include all local provider values', () => {
      const choices = buildProviderChoices();
      const values = choices.filter(c => c.value).map(c => c.value);

      expect(values).toContain('ollama');
      expect(values).toContain('vllm');
      expect(values).toContain('lmstudio');
      expect(values).toContain('llamacpp');
    });

    it('should include custom provider value', () => {
      const choices = buildProviderChoices();
      const values = choices.filter(c => c.value).map(c => c.value);

      expect(values).toContain('custom');
    });

    it('should show detected providers with badge', () => {
      const detected = [
        { code: 'ollama', running: true, models: ['llama2'] }
      ];

      const choices = buildProviderChoices({ detectedProviders: detected });
      const ollamaChoice = choices.find(c => c.value === 'ollama');

      expect(ollamaChoice.name).toContain('Detected');
      expect(ollamaChoice.name).toContain('Running');
    });

    it('should show recommended badge for Claude', () => {
      const choices = buildProviderChoices();
      const claudeChoice = choices.find(c => c.value === 'claude');

      expect(claudeChoice.name).toContain('Recommended');
    });

    it('should mark current provider', () => {
      const choices = buildProviderChoices({ currentProvider: 'openai' });
      const openaiChoice = choices.find(c => c.value === 'openai');

      expect(openaiChoice.name).toContain('*');
    });

    it('should include descriptions in choice names', () => {
      const choices = buildProviderChoices();
      const claudeChoice = choices.find(c => c.value === 'claude');

      expect(claudeChoice.name).toContain(CLOUD_PROVIDERS[0].description);
    });
  });

  describe('getProviderByCode', () => {
    it('should find cloud providers', () => {
      const claude = getProviderByCode('claude');
      expect(claude).not.toBeNull();
      expect(claude.name).toBe('Claude');
    });

    it('should find local providers', () => {
      const ollama = getProviderByCode('ollama');
      expect(ollama).not.toBeNull();
      expect(ollama.name).toBe('Ollama');
    });

    it('should find custom provider', () => {
      const custom = getProviderByCode('custom');
      expect(custom).not.toBeNull();
      expect(custom.name).toBe('Custom Endpoint');
    });

    it('should return null for unknown code', () => {
      const result = getProviderByCode('unknown-provider');
      expect(result).toBeNull();
    });
  });

  describe('requiresApiKey', () => {
    it('should return false for Claude', () => {
      expect(requiresApiKey('claude')).toBe(false);
    });

    it('should return true for OpenAI', () => {
      expect(requiresApiKey('openai')).toBe(true);
    });

    it('should return true for Groq', () => {
      expect(requiresApiKey('groq')).toBe(true);
    });

    it('should return true for Together AI', () => {
      expect(requiresApiKey('together')).toBe(true);
    });

    it('should return false for local providers', () => {
      expect(requiresApiKey('ollama')).toBe(false);
      expect(requiresApiKey('vllm')).toBe(false);
      expect(requiresApiKey('lmstudio')).toBe(false);
      expect(requiresApiKey('llamacpp')).toBe(false);
    });

    it('should return false for custom', () => {
      expect(requiresApiKey('custom')).toBe(false);
    });
  });

  describe('getProviderGroup', () => {
    it('should return cloud for cloud providers', () => {
      expect(getProviderGroup('claude')).toBe('cloud');
      expect(getProviderGroup('openai')).toBe('cloud');
      expect(getProviderGroup('groq')).toBe('cloud');
      expect(getProviderGroup('together')).toBe('cloud');
    });

    it('should return local for local providers', () => {
      expect(getProviderGroup('ollama')).toBe('local');
      expect(getProviderGroup('vllm')).toBe('local');
      expect(getProviderGroup('lmstudio')).toBe('local');
      expect(getProviderGroup('llamacpp')).toBe('local');
    });

    it('should return custom for custom provider', () => {
      expect(getProviderGroup('custom')).toBe('custom');
    });

    it('should return unknown for unknown provider', () => {
      expect(getProviderGroup('unknown')).toBe('unknown');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'provider-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'provider-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import inquirer and chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'provider-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+inquirer\s+from\s+['"]inquirer['"]/);
      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });
  });

  describe('Choice structure', () => {
    it('should have valid inquirer choice format', () => {
      const choices = buildProviderChoices();
      const providerChoices = choices.filter(c => c.value);

      for (const choice of providerChoices) {
        expect(choice.name).toBeDefined();
        expect(choice.value).toBeDefined();
        expect(choice.short).toBeDefined();
      }
    });

    it('should have short names for all providers', () => {
      const choices = buildProviderChoices();
      const providerChoices = choices.filter(c => c.value);

      for (const choice of providerChoices) {
        // Short name should be clean (no chalk codes)
        expect(choice.short).not.toContain('\x1b');
      }
    });
  });
});
