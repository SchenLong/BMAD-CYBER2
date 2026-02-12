/**
 * Unit Tests for Custom Endpoint UI - INST-015
 * Epic 3, Story 5 - Custom Endpoint Configuration
 *
 * @module llm-setup/custom-endpoint-ui.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  API_FORMATS,
  parseEndpointUrl,
  suggestApiFormat,
  validateEndpointUrl,
  validateModelName
} from './custom-endpoint-ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Custom Endpoint UI - INST-015', () => {
  describe('validateEndpointUrl', () => {
    it('should accept valid HTTPS URL', () => {
      const result = validateEndpointUrl('https://api.example.com/v1');
      expect(result).toBe(true);
    });

    it('should accept HTTP for localhost', () => {
      expect(validateEndpointUrl('http://localhost:8080')).toBe(true);
      expect(validateEndpointUrl('http://127.0.0.1:8000/v1')).toBe(true);
    });

    it('should accept HTTP for local network (192.168.x.x)', () => {
      expect(validateEndpointUrl('http://192.168.1.100:8080')).toBe(true);
    });

    it('should accept HTTP for local network (10.x.x.x)', () => {
      expect(validateEndpointUrl('http://10.0.0.5:8000')).toBe(true);
    });

    it('should reject HTTP for remote hosts', () => {
      const result = validateEndpointUrl('http://api.example.com/v1');
      expect(result).not.toBe(true);
      expect(result).toContain('HTTPS');
    });

    it('should reject URL without protocol', () => {
      const result = validateEndpointUrl('api.example.com/v1');
      expect(result).not.toBe(true);
      expect(result).toContain('http');
    });

    it('should reject empty URL', () => {
      expect(validateEndpointUrl('')).not.toBe(true);
      expect(validateEndpointUrl('   ')).not.toBe(true);
    });

    it('should reject null/undefined', () => {
      expect(validateEndpointUrl(null)).not.toBe(true);
      expect(validateEndpointUrl(undefined)).not.toBe(true);
    });

    it('should reject invalid URL format', () => {
      const result = validateEndpointUrl('https://');
      expect(result).not.toBe(true);
    });

    it('should accept URL with path', () => {
      expect(validateEndpointUrl('https://api.example.com/v1/chat/completions')).toBe(true);
    });

    it('should accept URL with port', () => {
      expect(validateEndpointUrl('https://api.example.com:8443/v1')).toBe(true);
    });
  });

  describe('validateModelName', () => {
    it('should accept simple model names', () => {
      expect(validateModelName('llama2')).toBe(true);
      expect(validateModelName('gpt-4')).toBe(true);
      expect(validateModelName('claude-3-opus')).toBe(true);
    });

    it('should accept model names with version tags', () => {
      expect(validateModelName('llama2:7b')).toBe(true);
      expect(validateModelName('mistral:latest')).toBe(true);
    });

    it('should accept model names with slashes', () => {
      expect(validateModelName('meta-llama/Llama-3.1-70B')).toBe(true);
      expect(validateModelName('mistralai/Mixtral-8x7B')).toBe(true);
    });

    it('should accept model names with dots', () => {
      expect(validateModelName('llama3.1')).toBe(true);
      expect(validateModelName('qwen2.5')).toBe(true);
    });

    it('should reject empty model name', () => {
      expect(validateModelName('')).not.toBe(true);
      expect(validateModelName('   ')).not.toBe(true);
    });

    it('should reject null/undefined', () => {
      expect(validateModelName(null)).not.toBe(true);
      expect(validateModelName(undefined)).not.toBe(true);
    });

    it('should reject names with special characters', () => {
      expect(validateModelName('model@name')).not.toBe(true);
      expect(validateModelName('model name')).not.toBe(true);
      expect(validateModelName('model$name')).not.toBe(true);
    });

    it('should reject very long names', () => {
      const longName = 'a'.repeat(201);
      expect(validateModelName(longName)).not.toBe(true);
    });

    it('should accept names up to 200 characters', () => {
      const longName = 'a'.repeat(200);
      expect(validateModelName(longName)).toBe(true);
    });
  });

  describe('API_FORMATS', () => {
    it('should include OpenAI format', () => {
      const openai = API_FORMATS.find(f => f.value === 'openai');
      expect(openai).toBeDefined();
      expect(openai.name).toBe('OpenAI Compatible');
    });

    it('should include Anthropic format', () => {
      const anthropic = API_FORMATS.find(f => f.value === 'anthropic');
      expect(anthropic).toBeDefined();
      expect(anthropic.name).toBe('Anthropic Compatible');
    });

    it('should include Ollama format', () => {
      const ollama = API_FORMATS.find(f => f.value === 'ollama');
      expect(ollama).toBeDefined();
      expect(ollama.name).toBe('Ollama Compatible');
    });

    it('should include Custom format', () => {
      const custom = API_FORMATS.find(f => f.value === 'custom');
      expect(custom).toBeDefined();
    });

    it('should have descriptions for all formats', () => {
      for (const format of API_FORMATS) {
        expect(format.description).toBeDefined();
        expect(format.description.length).toBeGreaterThan(0);
      }
    });

    it('should have 4 formats', () => {
      expect(API_FORMATS).toHaveLength(4);
    });
  });

  describe('parseEndpointUrl', () => {
    it('should parse HTTPS URL', () => {
      const result = parseEndpointUrl('https://api.example.com/v1');

      expect(result.protocol).toBe('https:');
      expect(result.hostname).toBe('api.example.com');
      expect(result.port).toBe('443');
      expect(result.pathname).toBe('/v1');
      expect(result.isLocal).toBe(false);
    });

    it('should parse HTTP localhost URL', () => {
      const result = parseEndpointUrl('http://localhost:8080/api');

      expect(result.protocol).toBe('http:');
      expect(result.hostname).toBe('localhost');
      expect(result.port).toBe('8080');
      expect(result.pathname).toBe('/api');
      expect(result.isLocal).toBe(true);
    });

    it('should detect 127.0.0.1 as local', () => {
      const result = parseEndpointUrl('http://127.0.0.1:8000');
      expect(result.isLocal).toBe(true);
    });

    it('should detect 192.168.x.x as local', () => {
      const result = parseEndpointUrl('http://192.168.1.100:8080');
      expect(result.isLocal).toBe(true);
    });

    it('should detect 10.x.x.x as local', () => {
      const result = parseEndpointUrl('http://10.0.0.5:8000');
      expect(result.isLocal).toBe(true);
    });

    it('should extract base URL', () => {
      const result = parseEndpointUrl('https://api.example.com:8443/v1/chat');
      expect(result.baseUrl).toBe('https://api.example.com:8443');
    });

    it('should return null for invalid URL', () => {
      const result = parseEndpointUrl('not a url');
      expect(result).toBeNull();
    });

    it('should use default ports', () => {
      const https = parseEndpointUrl('https://api.example.com/v1');
      expect(https.port).toBe('443');

      const http = parseEndpointUrl('http://localhost/api');
      expect(http.port).toBe('80');
    });
  });

  describe('suggestApiFormat', () => {
    it('should suggest ollama for port 11434', () => {
      expect(suggestApiFormat('http://localhost:11434')).toBe('ollama');
    });

    it('should suggest ollama for ollama in URL', () => {
      expect(suggestApiFormat('http://ollama-server:8080')).toBe('ollama');
    });

    it('should suggest anthropic for anthropic in URL', () => {
      expect(suggestApiFormat('https://api.anthropic.com/v1')).toBe('anthropic');
    });

    it('should default to openai', () => {
      expect(suggestApiFormat('http://localhost:8000/v1')).toBe('openai');
      expect(suggestApiFormat('https://api.example.com')).toBe('openai');
    });

    it('should be case insensitive', () => {
      expect(suggestApiFormat('http://OLLAMA:8080')).toBe('ollama');
      expect(suggestApiFormat('https://api.ANTHROPIC.com')).toBe('anthropic');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'custom-endpoint-ui.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'custom-endpoint-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import prompts abstraction and chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'custom-endpoint-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+\{.*\}\s+from\s+['"].*cli\/prompts\.js['"]/);
      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });
  });
});
