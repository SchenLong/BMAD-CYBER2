/**
 * Unit Tests for LLM Connectivity Checker - INST-021
 * Epic 4 - Post-Install Health Check
 *
 * @module health-check/llm-checker.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEFAULT_TIMEOUT,
  DEFAULT_CONFIG_PATH,
  PROVIDER_ENDPOINTS,
  PROVIDER_BASE_URLS,
  LOCAL_PROVIDERS,
  parseSimpleYaml,
  readLlmConfig,
  getApiKey,
  testProvider,
  testFallbackChain,
  getLocalModels,
  checkLlmConnectivity,
  formatCheckResult
} from './llm-checker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock fetch for testing
const createMockFetch = (response) => {
  return vi.fn(async () => {
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
      json: async () => response.data || {}
    };
  });
};

// Sample config for testing
const sampleConfig = `
version: "1.0"
active_provider: ollama
providers:
  claude:
    type: anthropic
    native: true
  ollama:
    type: ollama
    base_url: "http://localhost:11434"
    model: "llama2"
  openai:
    type: openai
    base_url: "https://api.openai.com/v1"
    model: "gpt-4"
    api_key_env: "OPENAI_API_KEY"
fallback_chain:
  - claude
`;

describe('LLM Connectivity Checker - INST-021', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should have DEFAULT_TIMEOUT of 5000ms (5 seconds)', () => {
      expect(DEFAULT_TIMEOUT).toBe(5000);
    });

    it('should have correct DEFAULT_CONFIG_PATH', () => {
      expect(DEFAULT_CONFIG_PATH).toBe('_bmad/_config/llm-config.yaml');
    });

    it('should have PROVIDER_ENDPOINTS for all providers', () => {
      expect(PROVIDER_ENDPOINTS.claude).toBeNull();
      expect(PROVIDER_ENDPOINTS.ollama).toBeDefined();
      expect(PROVIDER_ENDPOINTS.ollama.path).toBe('/api/tags');
      expect(PROVIDER_ENDPOINTS.vllm.path).toBe('/v1/models');
      expect(PROVIDER_ENDPOINTS.lmstudio.path).toBe('/v1/models');
      expect(PROVIDER_ENDPOINTS.llamacpp.path).toBe('/health');
      expect(PROVIDER_ENDPOINTS.openai.requiresAuth).toBe(true);
      expect(PROVIDER_ENDPOINTS.groq.requiresAuth).toBe(true);
      expect(PROVIDER_ENDPOINTS.together.requiresAuth).toBe(true);
    });

    it('should have PROVIDER_BASE_URLS for cloud providers', () => {
      expect(PROVIDER_BASE_URLS.openai).toBe('https://api.openai.com');
      expect(PROVIDER_BASE_URLS.groq).toBe('https://api.groq.com');
      expect(PROVIDER_BASE_URLS.together).toBe('https://api.together.xyz');
    });

    it('should have LOCAL_PROVIDERS list', () => {
      expect(LOCAL_PROVIDERS).toContain('ollama');
      expect(LOCAL_PROVIDERS).toContain('vllm');
      expect(LOCAL_PROVIDERS).toContain('lmstudio');
      expect(LOCAL_PROVIDERS).toContain('llamacpp');
      expect(LOCAL_PROVIDERS).toHaveLength(4);
    });
  });

  describe('parseSimpleYaml', () => {
    it('should parse active_provider', () => {
      const yaml = 'active_provider: ollama';
      const result = parseSimpleYaml(yaml);

      expect(result.active_provider).toBe('ollama');
    });

    it('should parse providers section', () => {
      const yaml = `
providers:
  ollama:
    type: ollama
    base_url: "http://localhost:11434"
    model: llama2
`;
      const result = parseSimpleYaml(yaml);

      expect(result.providers.ollama).toBeDefined();
      expect(result.providers.ollama.type).toBe('ollama');
      expect(result.providers.ollama.base_url).toBe('http://localhost:11434');
      expect(result.providers.ollama.model).toBe('llama2');
    });

    it('should parse fallback_chain', () => {
      const yaml = `
fallback_chain:
  - claude
  - ollama
`;
      const result = parseSimpleYaml(yaml);

      expect(result.fallback_chain).toEqual(['claude', 'ollama']);
    });

    it('should parse boolean values', () => {
      const yaml = `
providers:
  claude:
    native: true
    tool_use: false
`;
      const result = parseSimpleYaml(yaml);

      expect(result.providers.claude.native).toBe(true);
      expect(result.providers.claude.tool_use).toBe(false);
    });

    it('should skip comments', () => {
      const yaml = `
# This is a comment
active_provider: claude
# Another comment
`;
      const result = parseSimpleYaml(yaml);

      expect(result.active_provider).toBe('claude');
    });

    it('should handle quoted values', () => {
      const yaml = `
providers:
  openai:
    api_key_env: "OPENAI_API_KEY"
`;
      const result = parseSimpleYaml(yaml);

      expect(result.providers.openai.api_key_env).toBe('OPENAI_API_KEY');
    });
  });

  describe('readLlmConfig', () => {
    it('should return null if config file does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = readLlmConfig('/nonexistent/path');

      expect(result).toBeNull();
    });

    it('should parse valid YAML config', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(sampleConfig);

      const result = readLlmConfig('/test/config.yaml');

      expect(result).not.toBeNull();
      expect(result.active_provider).toBe('ollama');
      expect(result.providers.ollama.base_url).toBe('http://localhost:11434');
    });

    it('should return null for invalid YAML', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const result = readLlmConfig('/test/config.yaml');

      expect(result).toBeNull();
    });

    it('should use default path when not specified', () => {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      readLlmConfig(undefined, '/test/project');

      expect(existsSpy).toHaveBeenCalledWith(expect.stringContaining('_bmad/_config/llm-config.yaml'));
    });
  });

  describe('getApiKey', () => {
    it('should return null for null config', () => {
      expect(getApiKey(null)).toBeNull();
    });

    it('should return null if api_key_env not set', () => {
      expect(getApiKey({ type: 'openai' })).toBeNull();
    });

    it('should return null if env var not set', () => {
      expect(getApiKey({ api_key_env: 'NONEXISTENT_KEY' })).toBeNull();
    });

    it('should return API key from environment', () => {
      const originalEnv = process.env.TEST_API_KEY;
      process.env.TEST_API_KEY = 'test-api-key-123';

      const result = getApiKey({ api_key_env: 'TEST_API_KEY' });

      expect(result).toBe('test-api-key-123');

      if (originalEnv === undefined) {
        delete process.env.TEST_API_KEY;
      } else {
        process.env.TEST_API_KEY = originalEnv;
      }
    });
  });

  describe('testProvider', () => {
    it('should return connected for claude (native)', async () => {
      const result = await testProvider({ provider: 'claude' });

      expect(result.connected).toBe(true);
      expect(result.provider).toBe('claude');
      expect(result.responseTime).toBe(0);
      expect(result.model).toContain('claude');
    });

    it('should return error for unknown provider', async () => {
      const result = await testProvider({ provider: 'unknown-provider' });

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Unknown provider');
    });

    it('should return error if no base URL', async () => {
      const result = await testProvider({ provider: 'ollama' });

      expect(result.connected).toBe(false);
      expect(result.error).toContain('No base URL');
    });

    it('should return error if API key required but missing', async () => {
      const result = await testProvider({ provider: 'openai' });

      expect(result.connected).toBe(false);
      expect(result.error).toContain('API key required');
    });

    it('should test connection successfully', async () => {
      global.fetch = createMockFetch({ data: { models: [] } });

      const result = await testProvider({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama2'
      });

      expect(result.connected).toBe(true);
      expect(result.provider).toBe('ollama');
      expect(result.model).toBe('llama2');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle connection refused error', async () => {
      global.fetch = createMockFetch({
        error: 'Connection refused',
        errorCode: 'ECONNREFUSED'
      });

      const result = await testProvider({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434'
      });

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Connection refused');
    });

    it('should handle timeout error', async () => {
      global.fetch = createMockFetch({
        error: 'Aborted',
        errorName: 'AbortError'
      });

      const result = await testProvider({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        timeout: 100
      });

      expect(result.connected).toBe(false);
      expect(result.error).toContain('timed out');
    });

    it('should handle HTTP error response', async () => {
      global.fetch = createMockFetch({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await testProvider({
        provider: 'openai',
        apiKey: 'invalid-key'
      });

      expect(result.connected).toBe(false);
      expect(result.error).toContain('401');
    });

    it('should strip trailing slash from baseUrl', async () => {
      global.fetch = createMockFetch({ data: {} });

      await testProvider({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434/'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.any(Object)
      );
    });
  });

  describe('testFallbackChain', () => {
    it('should return empty array for empty chain', async () => {
      const result = await testFallbackChain([], {});

      expect(result).toEqual([]);
    });

    it('should return empty array for null chain', async () => {
      const result = await testFallbackChain(null, {});

      expect(result).toEqual([]);
    });

    it('should test each provider in chain', async () => {
      const providersConfig = {
        claude: { native: true },
        ollama: { base_url: 'http://localhost:11434', model: 'llama2' }
      };

      global.fetch = createMockFetch({ data: {} });

      const result = await testFallbackChain(['claude', 'ollama'], providersConfig);

      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('claude');
      expect(result[0].connected).toBe(true);
      expect(result[1].provider).toBe('ollama');
    });

    it('should handle unconfigured provider in chain', async () => {
      const result = await testFallbackChain(['unconfigured'], {});

      expect(result).toHaveLength(1);
      expect(result[0].connected).toBe(false);
      expect(result[0].error).toContain('not configured');
    });
  });

  describe('getLocalModels', () => {
    it('should return empty for non-local provider', async () => {
      const result = await getLocalModels('openai', 'http://api.openai.com');

      expect(result).toEqual([]);
    });

    it('should parse Ollama models response', async () => {
      global.fetch = createMockFetch({
        data: { models: [{ name: 'llama2' }, { name: 'mistral' }] }
      });

      const result = await getLocalModels('ollama', 'http://localhost:11434');

      expect(result).toEqual(['llama2', 'mistral']);
    });

    it('should parse vLLM/LM Studio models response', async () => {
      global.fetch = createMockFetch({
        data: { data: [{ id: 'model-1' }, { id: 'model-2' }] }
      });

      const result = await getLocalModels('vllm', 'http://localhost:8000');

      expect(result).toEqual(['model-1', 'model-2']);
    });

    it('should return ["default"] for llamacpp', async () => {
      global.fetch = createMockFetch({
        data: { status: 'ok' }
      });

      const result = await getLocalModels('llamacpp', 'http://localhost:8080');

      expect(result).toEqual(['default']);
    });

    it('should return empty array on fetch error', async () => {
      global.fetch = createMockFetch({ error: 'Connection refused' });

      const result = await getLocalModels('ollama', 'http://localhost:11434');

      expect(result).toEqual([]);
    });

    it('should return empty array for non-ok response', async () => {
      global.fetch = createMockFetch({ ok: false, status: 500 });

      const result = await getLocalModels('ollama', 'http://localhost:11434');

      expect(result).toEqual([]);
    });
  });

  describe('checkLlmConnectivity', () => {
    it('should return unconfigured if config not found', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await checkLlmConnectivity({ projectRoot: '/nonexistent' });

      expect(result.status).toBe('unconfigured');
      expect(result.warnings).toContain('LLM configuration file not found or invalid');
    });

    it('should return unconfigured if no active provider', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue('version: "1.0"\nproviders: {}');

      const result = await checkLlmConnectivity();

      expect(result.status).toBe('unconfigured');
      expect(result.warnings).toContain('No active provider configured');
    });

    it('should return connected for working primary provider', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(sampleConfig);
      global.fetch = createMockFetch({ data: { models: [{ name: 'llama2' }] } });

      const result = await checkLlmConnectivity();

      expect(result.status).toBe('connected');
      expect(result.primary.connected).toBe(true);
      expect(result.primary.provider).toBe('ollama');
    });

    it('should return fallback status when primary fails but fallback works', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(sampleConfig);
      global.fetch = createMockFetch({ error: 'Connection refused' });

      const result = await checkLlmConnectivity();

      expect(result.status).toBe('fallback');
      expect(result.primary.connected).toBe(false);
      expect(result.fallbacks.length).toBeGreaterThan(0);
      expect(result.fallbacks.some(f => f.connected)).toBe(true);
      expect(result.warnings.some(w => w.includes('available as fallback'))).toBe(true);
    });

    it('should return disconnected when all providers fail', async () => {
      const configNoFallback = `
version: "1.0"
active_provider: ollama
providers:
  ollama:
    type: ollama
    base_url: "http://localhost:11434"
fallback_chain: []
`;
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(configNoFallback);
      global.fetch = createMockFetch({ error: 'Connection refused' });

      const result = await checkLlmConnectivity();

      expect(result.status).toBe('disconnected');
      expect(result.primary.connected).toBe(false);
    });

    it('should include available models for local providers', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(sampleConfig);
      global.fetch = createMockFetch({
        data: { models: [{ name: 'llama2' }, { name: 'mistral' }] }
      });

      const result = await checkLlmConnectivity();

      expect(result.availableModels).toContain('llama2');
      expect(result.availableModels).toContain('mistral');
    });
  });

  describe('formatCheckResult', () => {
    it('should format connected status', () => {
      const result = {
        status: 'connected',
        primary: { provider: 'claude', model: 'claude (native)', connected: true, responseTime: 0 },
        fallbacks: [],
        availableModels: [],
        warnings: []
      };

      const output = formatCheckResult(result);

      expect(output).toContain('LLM Connectivity Check:');
      expect(output).toContain('[OK]');
      expect(output).toContain('Primary provider connected');
      expect(output).toContain('claude');
      expect(output).toContain('Connected');
    });

    it('should format fallback status', () => {
      const result = {
        status: 'fallback',
        primary: { provider: 'ollama', connected: false, error: 'Connection refused' },
        fallbacks: [{ provider: 'claude', connected: true, responseTime: 0 }],
        availableModels: [],
        warnings: ['Primary down but fallback available']
      };

      const output = formatCheckResult(result);

      expect(output).toContain('[WARN]');
      expect(output).toContain('Primary down, fallback available');
      expect(output).toContain('Fallback Providers:');
      expect(output).toContain('[OK] claude');
    });

    it('should format disconnected status', () => {
      const result = {
        status: 'disconnected',
        primary: { provider: 'ollama', connected: false, error: 'Connection refused' },
        fallbacks: [],
        availableModels: [],
        warnings: ['Primary provider error: Connection refused']
      };

      const output = formatCheckResult(result);

      expect(output).toContain('[FAIL]');
      expect(output).toContain('All providers disconnected');
      expect(output).toContain('Error:');
    });

    it('should format available models', () => {
      const result = {
        status: 'connected',
        primary: { provider: 'ollama', connected: true, responseTime: 50 },
        fallbacks: [],
        availableModels: ['llama2', 'mistral', 'codellama'],
        warnings: []
      };

      const output = formatCheckResult(result);

      expect(output).toContain('Available Models:');
      expect(output).toContain('- llama2');
      expect(output).toContain('- mistral');
    });

    it('should truncate long model lists', () => {
      const result = {
        status: 'connected',
        primary: { provider: 'ollama', connected: true },
        fallbacks: [],
        availableModels: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
        warnings: []
      };

      const output = formatCheckResult(result);

      expect(output).toContain('... and 2 more');
    });

    it('should format warnings', () => {
      const result = {
        status: 'disconnected',
        primary: undefined,
        fallbacks: [],
        availableModels: [],
        warnings: ['Warning 1', 'Warning 2']
      };

      const output = formatCheckResult(result);

      expect(output).toContain('Warnings:');
      expect(output).toContain('! Warning 1');
      expect(output).toContain('! Warning 2');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'llm-checker.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'llm-checker.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should have parseSimpleYaml function', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'llm-checker.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/export\s+function\s+parseSimpleYaml/);
    });
  });
});
