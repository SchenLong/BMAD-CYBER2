/**
 * Unit Tests for Connection Tester - INST-016
 * Epic 3, Story 6 - Provider Connection Testing
 *
 * @module llm-setup/connection-tester.test
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEFAULT_TEST_TIMEOUT,
  TEST_ENDPOINTS,
  PROVIDER_BASE_URLS,
  ERROR_CODES,
  HTTP_ERROR_MESSAGES,
  parseError,
  testConnection,
  testMultipleConnections,
  formatTestResults
} from './connection-tester.js';

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

describe('Connection Tester - INST-016', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('DEFAULT_TEST_TIMEOUT', () => {
    it('should be 10 seconds', () => {
      expect(DEFAULT_TEST_TIMEOUT).toBe(10000);
    });
  });

  describe('TEST_ENDPOINTS', () => {
    it('should have null for claude (native)', () => {
      expect(TEST_ENDPOINTS.claude).toBeNull();
    });

    it('should have endpoints for ollama', () => {
      expect(TEST_ENDPOINTS.ollama).toBeDefined();
      expect(TEST_ENDPOINTS.ollama.path).toBe('/api/tags');
      expect(TEST_ENDPOINTS.ollama.method).toBe('GET');
    });

    it('should have endpoints for vllm', () => {
      expect(TEST_ENDPOINTS.vllm).toBeDefined();
      expect(TEST_ENDPOINTS.vllm.path).toBe('/v1/models');
    });

    it('should have endpoints for lmstudio', () => {
      expect(TEST_ENDPOINTS.lmstudio).toBeDefined();
      expect(TEST_ENDPOINTS.lmstudio.path).toBe('/v1/models');
    });

    it('should have endpoints for llamacpp', () => {
      expect(TEST_ENDPOINTS.llamacpp).toBeDefined();
      expect(TEST_ENDPOINTS.llamacpp.path).toBe('/health');
    });

    it('should have endpoints for cloud providers with auth headers', () => {
      expect(TEST_ENDPOINTS.openai.headers.Authorization).toContain('{apiKey}');
      expect(TEST_ENDPOINTS.groq.headers.Authorization).toContain('{apiKey}');
      expect(TEST_ENDPOINTS.together.headers.Authorization).toContain('{apiKey}');
    });
  });

  describe('PROVIDER_BASE_URLS', () => {
    it('should have OpenAI URL', () => {
      expect(PROVIDER_BASE_URLS.openai).toBe('https://api.openai.com');
    });

    it('should have Groq URL', () => {
      expect(PROVIDER_BASE_URLS.groq).toBe('https://api.groq.com');
    });

    it('should have Together AI URL', () => {
      expect(PROVIDER_BASE_URLS.together).toBe('https://api.together.xyz');
    });
  });

  describe('ERROR_CODES', () => {
    it('should map ECONNREFUSED', () => {
      expect(ERROR_CODES.ECONNREFUSED).toBe('CONNECTION_REFUSED');
    });

    it('should map ENOTFOUND', () => {
      expect(ERROR_CODES.ENOTFOUND).toBe('HOST_NOT_FOUND');
    });

    it('should map ETIMEDOUT', () => {
      expect(ERROR_CODES.ETIMEDOUT).toBe('TIMEOUT');
    });

    it('should map AbortError', () => {
      expect(ERROR_CODES.AbortError).toBe('TIMEOUT');
    });
  });

  describe('HTTP_ERROR_MESSAGES', () => {
    it('should have message for 401', () => {
      expect(HTTP_ERROR_MESSAGES[401]).toContain('Authentication');
    });

    it('should have message for 403', () => {
      expect(HTTP_ERROR_MESSAGES[403]).toContain('forbidden');
    });

    it('should have message for 404', () => {
      expect(HTTP_ERROR_MESSAGES[404]).toContain('not found');
    });

    it('should have message for 429', () => {
      expect(HTTP_ERROR_MESSAGES[429]).toContain('Rate limit');
    });

    it('should have message for 500', () => {
      expect(HTTP_ERROR_MESSAGES[500]).toContain('Server error');
    });
  });

  describe('parseError', () => {
    it('should parse AbortError as timeout', () => {
      const error = new Error('Aborted');
      error.name = 'AbortError';

      const result = parseError(error);

      expect(result.code).toBe('TIMEOUT');
      expect(result.message).toContain('timed out');
    });

    it('should parse ECONNREFUSED', () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';

      const result = parseError(error);

      expect(result.code).toBe('CONNECTION_REFUSED');
      expect(result.message).toContain('not running');
    });

    it('should parse ENOTFOUND', () => {
      const error = new Error('Host not found');
      error.code = 'ENOTFOUND';

      const result = parseError(error);

      expect(result.code).toBe('HOST_NOT_FOUND');
      expect(result.message).toContain('not found');
    });

    it('should parse HTTP 401', () => {
      const result = parseError({ status: 401 });

      expect(result.code).toBe('HTTP_401');
      expect(result.message).toContain('Authentication');
    });

    it('should parse HTTP 429', () => {
      const result = parseError({ status: 429 });

      expect(result.code).toBe('HTTP_429');
      expect(result.message).toContain('Rate limit');
    });

    it('should handle unknown errors', () => {
      const result = parseError(new Error('Something went wrong'));

      expect(result.code).toBe('UNKNOWN');
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle empty error', () => {
      const result = parseError({});

      expect(result.code).toBe('UNKNOWN');
    });
  });

  describe('testConnection', () => {
    it('should return success for claude (native)', async () => {
      const result = await testConnection({ provider: 'claude', silent: true });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('claude');
      expect(result.model).toContain('claude');
    });

    it('should test connection successfully', async () => {
      global.fetch = createMockFetch({
        data: { models: [{ name: 'llama2' }] }
      });

      const result = await testConnection({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        silent: true
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('ollama');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should extract model from response', async () => {
      global.fetch = createMockFetch({
        data: { models: [{ name: 'mistral:7b' }] }
      });

      const result = await testConnection({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        silent: true
      });

      expect(result.model).toBe('mistral:7b');
    });

    it('should handle OpenAI-style model response', async () => {
      global.fetch = createMockFetch({
        data: { data: [{ id: 'gpt-4-turbo' }] }
      });

      const result = await testConnection({
        provider: 'vllm',
        baseUrl: 'http://localhost:8000',
        silent: true
      });

      expect(result.model).toBe('gpt-4-turbo');
    });

    it('should fail for unknown provider', async () => {
      const result = await testConnection({
        provider: 'unknown-provider',
        baseUrl: 'http://localhost:8000',
        silent: true
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('UNKNOWN_PROVIDER');
    });

    it('should fail when API key required but missing', async () => {
      const result = await testConnection({
        provider: 'openai',
        silent: true
        // No apiKey provided
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('MISSING_API_KEY');
    });

    it('should handle connection refused', async () => {
      global.fetch = createMockFetch({
        error: 'Connection refused',
        errorCode: 'ECONNREFUSED'
      });

      const result = await testConnection({
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        silent: true
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CONNECTION_REFUSED');
    });

    it('should handle HTTP 401', async () => {
      global.fetch = createMockFetch({
        ok: false,
        status: 401
      });

      const result = await testConnection({
        provider: 'openai',
        apiKey: 'invalid-key',
        silent: true
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('HTTP_401');
      expect(result.error).toContain('Authentication');
    });

    it('should use custom baseUrl', async () => {
      global.fetch = createMockFetch({ data: {} });

      await testConnection({
        provider: 'ollama',
        baseUrl: 'http://custom-host:8080',
        silent: true
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('custom-host:8080'),
        expect.any(Object)
      );
    });

    it('should use default cloud provider URLs', async () => {
      global.fetch = createMockFetch({ data: {} });

      await testConnection({
        provider: 'openai',
        apiKey: 'test-key',
        silent: true
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.openai.com'),
        expect.any(Object)
      );
    });
  });

  describe('testMultipleConnections', () => {
    it('should test multiple providers sequentially', async () => {
      global.fetch = createMockFetch({ data: {} });

      const providers = [
        { provider: 'ollama', baseUrl: 'http://localhost:11434' },
        { provider: 'vllm', baseUrl: 'http://localhost:8000' }
      ];

      const results = await testMultipleConnections(providers, { silent: true });

      expect(results).toHaveLength(2);
    });

    it('should test multiple providers in parallel', async () => {
      global.fetch = createMockFetch({ data: {} });

      const providers = [
        { provider: 'ollama', baseUrl: 'http://localhost:11434' },
        { provider: 'vllm', baseUrl: 'http://localhost:8000' }
      ];

      const results = await testMultipleConnections(providers, {
        parallel: true,
        silent: true
      });

      expect(results).toHaveLength(2);
    });

    it('should return mixed results', async () => {
      let callCount = 0;
      global.fetch = vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          return { ok: true, json: async () => ({}) };
        }
        throw Object.assign(new Error('Connection refused'), { code: 'ECONNREFUSED' });
      });

      const providers = [
        { provider: 'ollama', baseUrl: 'http://localhost:11434' },
        { provider: 'vllm', baseUrl: 'http://localhost:8000' }
      ];

      const results = await testMultipleConnections(providers, { silent: true });

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('formatTestResults', () => {
    it('should format successful results', () => {
      const results = [
        { success: true, provider: 'ollama', responseTime: 100, model: 'llama2' }
      ];

      const output = formatTestResults(results);

      expect(output).toContain('Successful');
      expect(output).toContain('ollama');
      expect(output).toContain('llama2');
      expect(output).toContain('100ms');
    });

    it('should format failed results', () => {
      const results = [
        { success: false, provider: 'vllm', responseTime: 50, error: 'Connection refused' }
      ];

      const output = formatTestResults(results);

      expect(output).toContain('Failed');
      expect(output).toContain('vllm');
      expect(output).toContain('Connection refused');
    });

    it('should format mixed results', () => {
      const results = [
        { success: true, provider: 'ollama', responseTime: 100 },
        { success: false, provider: 'vllm', responseTime: 50, error: 'Connection refused' }
      ];

      const output = formatTestResults(results);

      expect(output).toContain('Successful');
      expect(output).toContain('Failed');
    });

    it('should handle empty results', () => {
      const output = formatTestResults([]);

      expect(output).toContain('Connection Test Results');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'connection-tester.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'connection-tester.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'connection-tester.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });
  });
});
