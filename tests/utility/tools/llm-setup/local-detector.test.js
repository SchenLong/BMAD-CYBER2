/**
 * Unit Tests for Local LLM Provider Detector - INST-012
 * Epic 3, Story 1 - Local Provider Auto-Detection
 *
 * @module llm-setup/local-detector.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEFAULT_PROBE_TIMEOUT,
  detectLocalProviders,
  detectProvider,
  formatDetectedProviders,
  getProviderByCode,
  getRunningProviders,
  hasLocalProvider,
  LOCAL_PROVIDERS,
  probeEndpoint
} from './local-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock fetch for testing
const createMockFetch = (responses) => {
  let callCount = 0;
  return vi.fn(async (url, options) => {
    const response = responses[callCount] || responses[0];
    callCount++;

    if (response.error) {
      const error = new Error(response.error);
      if (response.errorCode) error.code = response.errorCode;
      if (response.errorName) error.name = response.errorName;
      throw error;
    }

    return {
      ok: response.ok !== false,
      status: response.status || 200,
      statusText: response.statusText || 'OK',
      json: async () => response.data
    };
  });
};

describe('Local LLM Provider Detector - INST-012', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('LOCAL_PROVIDERS constant', () => {
    it('should define Ollama provider', () => {
      const ollama = LOCAL_PROVIDERS.find(p => p.code === 'ollama');
      expect(ollama).toBeDefined();
      expect(ollama.name).toBe('Ollama');
      expect(ollama.endpoint).toBe('http://localhost:11434');
      expect(ollama.path).toBe('/api/tags');
    });

    it('should define vLLM provider', () => {
      const vllm = LOCAL_PROVIDERS.find(p => p.code === 'vllm');
      expect(vllm).toBeDefined();
      expect(vllm.name).toBe('vLLM');
      expect(vllm.endpoint).toBe('http://localhost:8000');
      expect(vllm.path).toBe('/v1/models');
    });

    it('should define LM Studio provider', () => {
      const lmstudio = LOCAL_PROVIDERS.find(p => p.code === 'lmstudio');
      expect(lmstudio).toBeDefined();
      expect(lmstudio.name).toBe('LM Studio');
      expect(lmstudio.endpoint).toBe('http://localhost:1234');
      expect(lmstudio.path).toBe('/v1/models');
    });

    it('should define llama.cpp provider', () => {
      const llamacpp = LOCAL_PROVIDERS.find(p => p.code === 'llamacpp');
      expect(llamacpp).toBeDefined();
      expect(llamacpp.name).toBe('llama.cpp');
      expect(llamacpp.endpoint).toBe('http://localhost:8080');
      expect(llamacpp.path).toBe('/health');
    });

    it('should have 4 providers defined', () => {
      expect(LOCAL_PROVIDERS).toHaveLength(4);
    });

    it('should have parseModels function for each provider', () => {
      for (const provider of LOCAL_PROVIDERS) {
        expect(typeof provider.parseModels).toBe('function');
      }
    });
  });

  describe('DEFAULT_PROBE_TIMEOUT', () => {
    it('should be 2000ms (2 seconds)', () => {
      expect(DEFAULT_PROBE_TIMEOUT).toBe(2000);
    });
  });

  describe('Ollama parseModels', () => {
    const ollama = LOCAL_PROVIDERS.find(p => p.code === 'ollama');

    it('should parse models array from response', () => {
      const response = {
        models: [
          { name: 'llama2:7b' },
          { name: 'codellama:13b' },
          { model: 'mistral:7b' }
        ]
      };
      const models = ollama.parseModels(response);
      expect(models).toEqual(['llama2:7b', 'codellama:13b', 'mistral:7b']);
    });

    it('should return empty array for null response', () => {
      expect(ollama.parseModels(null)).toEqual([]);
    });

    it('should return empty array for missing models', () => {
      expect(ollama.parseModels({})).toEqual([]);
    });

    it('should filter out empty names', () => {
      const response = {
        models: [{ name: 'llama2' }, { name: '' }, { name: 'mistral' }]
      };
      const models = ollama.parseModels(response);
      expect(models).toEqual(['llama2', 'mistral']);
    });
  });

  describe('vLLM parseModels', () => {
    const vllm = LOCAL_PROVIDERS.find(p => p.code === 'vllm');

    it('should parse data array with id field', () => {
      const response = {
        data: [
          { id: 'meta-llama/Llama-3.1-70B' },
          { id: 'mistralai/Mixtral-8x7B' }
        ]
      };
      const models = vllm.parseModels(response);
      expect(models).toEqual(['meta-llama/Llama-3.1-70B', 'mistralai/Mixtral-8x7B']);
    });

    it('should return empty array for missing data', () => {
      expect(vllm.parseModels({})).toEqual([]);
    });
  });

  describe('LM Studio parseModels', () => {
    const lmstudio = LOCAL_PROVIDERS.find(p => p.code === 'lmstudio');

    it('should parse data array with id field', () => {
      const response = {
        data: [{ id: 'local-model' }]
      };
      const models = lmstudio.parseModels(response);
      expect(models).toEqual(['local-model']);
    });
  });

  describe('llama.cpp parseModels', () => {
    const llamacpp = LOCAL_PROVIDERS.find(p => p.code === 'llamacpp');

    it('should return ["default"] for status ok', () => {
      const models = llamacpp.parseModels({ status: 'ok' });
      expect(models).toEqual(['default']);
    });

    it('should return ["default"] for loading status', () => {
      const models = llamacpp.parseModels({ status: 'loading model' });
      expect(models).toEqual(['default']);
    });

    it('should return ["default"] for any object response', () => {
      const models = llamacpp.parseModels({ any: 'value' });
      expect(models).toEqual(['default']);
    });

    it('should return empty array for null', () => {
      expect(llamacpp.parseModels(null)).toEqual([]);
    });
  });

  describe('probeEndpoint', () => {
    it('should return success for valid response', async () => {
      global.fetch = createMockFetch([{ data: { status: 'ok' } }]);

      const result = await probeEndpoint('http://localhost:8080/health');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ status: 'ok' });
    });

    it('should return error for non-ok HTTP response', async () => {
      global.fetch = createMockFetch([{ ok: false, status: 404, statusText: 'Not Found' }]);

      const result = await probeEndpoint('http://localhost:8080/health');

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should return error for connection timeout', async () => {
      global.fetch = createMockFetch([{ error: 'Aborted', errorName: 'AbortError' }]);

      const result = await probeEndpoint('http://localhost:8080/health', 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should return error for connection refused', async () => {
      global.fetch = createMockFetch([{ error: 'Connection refused', errorCode: 'ECONNREFUSED' }]);

      const result = await probeEndpoint('http://localhost:8080/health');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
    });

    it('should handle non-JSON response gracefully', async () => {
      global.fetch = vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); }
      }));

      const result = await probeEndpoint('http://localhost:8080/health');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ status: 'ok' });
    });

    it('should use default timeout', async () => {
      global.fetch = createMockFetch([{ data: { status: 'ok' } }]);

      await probeEndpoint('http://localhost:8080/health');

      // Verify fetch was called (timeout is internal)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('detectProvider', () => {
    it('should return running provider with models', async () => {
      const provider = LOCAL_PROVIDERS.find(p => p.code === 'ollama');
      global.fetch = createMockFetch([{
        data: { models: [{ name: 'llama2' }, { name: 'mistral' }] }
      }]);

      const result = await detectProvider(provider);

      expect(result.running).toBe(true);
      expect(result.name).toBe('Ollama');
      expect(result.code).toBe('ollama');
      expect(result.models).toEqual(['llama2', 'mistral']);
      expect(result.error).toBeUndefined();
    });

    it('should return not running provider with error', async () => {
      const provider = LOCAL_PROVIDERS.find(p => p.code === 'ollama');
      global.fetch = createMockFetch([{ error: 'Connection refused', errorCode: 'ECONNREFUSED' }]);

      const result = await detectProvider(provider);

      expect(result.running).toBe(false);
      expect(result.models).toEqual([]);
      expect(result.error).toBeDefined();
    });

    it('should use custom timeout', async () => {
      const provider = LOCAL_PROVIDERS.find(p => p.code === 'ollama');
      global.fetch = createMockFetch([{ data: { models: [] } }]);

      await detectProvider(provider, 5000);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('detectLocalProviders', () => {
    it('should detect all providers in parallel', async () => {
      global.fetch = createMockFetch([
        { data: { models: [{ name: 'llama2' }] } },
        { data: { data: [{ id: 'vllm-model' }] } },
        { data: { data: [{ id: 'lmstudio-model' }] } },
        { data: { status: 'ok' } }
      ]);

      const results = await detectLocalProviders();

      expect(results).toHaveLength(4);
      expect(results.every(r => r.running === true)).toBe(true);
    });

    it('should handle mixed running/stopped providers', async () => {
      global.fetch = vi.fn(async (url) => {
        if (url.includes('11434')) {
          return { ok: true, json: async () => ({ models: [{ name: 'llama2' }] }) };
        }
        throw new Error('Connection refused');
      });

      const results = await detectLocalProviders();

      const running = results.filter(r => r.running);
      const stopped = results.filter(r => !r.running);

      expect(running.length).toBeGreaterThan(0);
      expect(stopped.length).toBeGreaterThan(0);
    });

    it('should use custom timeout', async () => {
      global.fetch = createMockFetch([{ data: { models: [] } }]);

      await detectLocalProviders({ timeout: 5000 });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle all failed detections', async () => {
      global.fetch = createMockFetch([{ error: 'Network error' }]);

      const results = await detectLocalProviders();

      expect(results).toHaveLength(4);
      expect(results.every(r => r.running === false)).toBe(true);
    });
  });

  describe('getRunningProviders', () => {
    it('should return only running providers', async () => {
      global.fetch = vi.fn(async (url) => {
        if (url.includes('11434')) {
          return { ok: true, json: async () => ({ models: [{ name: 'llama2' }] }) };
        }
        throw new Error('Connection refused');
      });

      const running = await getRunningProviders();

      expect(running.length).toBe(1);
      expect(running[0].code).toBe('ollama');
    });

    it('should return empty array if none running', async () => {
      global.fetch = createMockFetch([{ error: 'Connection refused' }]);

      const running = await getRunningProviders();

      expect(running).toEqual([]);
    });
  });

  describe('hasLocalProvider', () => {
    it('should return true if provider running', async () => {
      global.fetch = vi.fn(async (url) => {
        if (url.includes('11434')) {
          return { ok: true, json: async () => ({ models: [] }) };
        }
        throw new Error('Connection refused');
      });

      const result = await hasLocalProvider();

      expect(result).toBe(true);
    });

    it('should return false if no providers running', async () => {
      global.fetch = createMockFetch([{ error: 'Connection refused' }]);

      const result = await hasLocalProvider();

      expect(result).toBe(false);
    });
  });

  describe('getProviderByCode', () => {
    it('should return provider info for valid code', async () => {
      global.fetch = createMockFetch([{
        data: { models: [{ name: 'llama2' }] }
      }]);

      const result = await getProviderByCode('ollama');

      expect(result).not.toBeNull();
      expect(result.code).toBe('ollama');
    });

    it('should return null for invalid code', async () => {
      const result = await getProviderByCode('invalid-provider');

      expect(result).toBeNull();
    });

    it('should use custom timeout', async () => {
      global.fetch = createMockFetch([{ data: { models: [] } }]);

      await getProviderByCode('ollama', { timeout: 5000 });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('formatDetectedProviders', () => {
    it('should format running providers', () => {
      const providers = [
        { name: 'Ollama', code: 'ollama', endpoint: 'http://localhost:11434', models: ['llama2', 'mistral'], running: true }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('Local LLM Providers:');
      expect(output).toContain('Running:');
      expect(output).toContain('[OK] Ollama');
      expect(output).toContain('2 models');
    });

    it('should format stopped providers', () => {
      const providers = [
        { name: 'vLLM', code: 'vllm', endpoint: 'http://localhost:8000', models: [], running: false }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('Not Running:');
      expect(output).toContain('[--] vLLM');
    });

    it('should show no providers message when all stopped', () => {
      const providers = [
        { name: 'Ollama', code: 'ollama', endpoint: 'http://localhost:11434', models: [], running: false }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('No local providers detected');
    });

    it('should handle mixed running and stopped', () => {
      const providers = [
        { name: 'Ollama', code: 'ollama', endpoint: 'http://localhost:11434', models: ['llama2'], running: true },
        { name: 'vLLM', code: 'vllm', endpoint: 'http://localhost:8000', models: [], running: false }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('Running:');
      expect(output).toContain('Not Running:');
      expect(output).toContain('[OK] Ollama');
      expect(output).toContain('[--] vLLM');
    });

    it('should show models for running providers', () => {
      const providers = [
        { name: 'Ollama', code: 'ollama', endpoint: 'http://localhost:11434', models: ['llama2', 'mistral', 'codellama'], running: true }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('Models: llama2, mistral, codellama');
    });

    it('should truncate long model lists', () => {
      const providers = [
        { name: 'Ollama', code: 'ollama', endpoint: 'http://localhost:11434', models: ['m1', 'm2', 'm3', 'm4', 'm5'], running: true }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('...');
    });

    it('should not show models for default llama.cpp', () => {
      const providers = [
        { name: 'llama.cpp', code: 'llamacpp', endpoint: 'http://localhost:8080', models: ['default'], running: true }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).not.toContain('Models:');
    });

    it('should handle singular model count', () => {
      const providers = [
        { name: 'Ollama', code: 'ollama', endpoint: 'http://localhost:11434', models: ['llama2'], running: true }
      ];

      const output = formatDetectedProviders(providers);

      expect(output).toContain('1 model)');
      expect(output).not.toContain('1 models');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'local-detector.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'local-detector.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should use native ESM imports', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'local-detector.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+.*from\s+['"]url['"]/);
    });
  });
});
