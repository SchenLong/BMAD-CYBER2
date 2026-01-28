/**
 * Local LLM Provider Detector - INST-012
 * Epic 3, Story 1 - Local Provider Auto-Detection
 *
 * Detects running local LLM providers (Ollama, vLLM, LM Studio, llama.cpp)
 * by probing their standard API endpoints.
 *
 * @module llm-setup/local-detector
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';

/**
 * Local provider definitions with their standard endpoints
 * @type {Array}
 */
export const LOCAL_PROVIDERS = [
  {
    name: 'Ollama',
    code: 'ollama',
    endpoint: 'http://localhost:11434',
    path: '/api/tags',
    parseModels: (response) => {
      if (response && Array.isArray(response.models)) {
        return response.models.map(m => m.name || m.model || '').filter(Boolean);
      }
      return [];
    },
    description: 'Local LLM via Ollama'
  },
  {
    name: 'vLLM',
    code: 'vllm',
    endpoint: 'http://localhost:8000',
    path: '/v1/models',
    parseModels: (response) => {
      if (response && Array.isArray(response.data)) {
        return response.data.map(m => m.id || '').filter(Boolean);
      }
      return [];
    },
    description: 'High-performance local serving via vLLM'
  },
  {
    name: 'LM Studio',
    code: 'lmstudio',
    endpoint: 'http://localhost:1234',
    path: '/v1/models',
    parseModels: (response) => {
      if (response && Array.isArray(response.data)) {
        return response.data.map(m => m.id || '').filter(Boolean);
      }
      return [];
    },
    description: 'Local LLM via LM Studio'
  },
  {
    name: 'llama.cpp',
    code: 'llamacpp',
    endpoint: 'http://localhost:8080',
    path: '/health',
    parseModels: (response) => {
      if (response && (response.status === 'ok' || response.status === 'loading model' || typeof response === 'object')) {
        return ['default'];
      }
      return [];
    },
    description: 'Direct llama.cpp server'
  }
];

/**
 * Default timeout for endpoint probes (milliseconds)
 */
export const DEFAULT_PROBE_TIMEOUT = 2000;

/**
 * Probes a single endpoint to check if it's available
 *
 * @param {string} url - Full URL to probe
 * @param {number} [timeout=DEFAULT_PROBE_TIMEOUT] - Timeout in milliseconds
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Probe result
 */
export async function probeEndpoint(url, timeout = DEFAULT_PROBE_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: 'HTTP ' + response.status + ': ' + response.statusText };
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { status: 'ok' };
    }

    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return { success: false, error: 'Connection timeout' };
    }
    if (error.code === 'ECONNREFUSED') {
      return { success: false, error: 'Connection refused - server not running' };
    }
    if (error.code === 'ENOTFOUND') {
      return { success: false, error: 'Host not found' };
    }

    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Detects a single local provider
 *
 * @param {Object} provider - Provider definition
 * @param {number} [timeout=DEFAULT_PROBE_TIMEOUT] - Probe timeout
 * @returns {Promise<Object>} Detection result
 */
export async function detectProvider(provider, timeout = DEFAULT_PROBE_TIMEOUT) {
  const url = provider.endpoint + provider.path;
  const result = await probeEndpoint(url, timeout);

  if (!result.success) {
    return {
      name: provider.name,
      code: provider.code,
      endpoint: provider.endpoint,
      models: [],
      running: false,
      error: result.error
    };
  }

  const models = provider.parseModels(result.data);

  return {
    name: provider.name,
    code: provider.code,
    endpoint: provider.endpoint,
    models,
    running: true
  };
}

/**
 * Detects all local LLM providers in parallel
 *
 * @param {Object} [options] - Detection options
 * @param {number} [options.timeout=DEFAULT_PROBE_TIMEOUT] - Probe timeout per provider
 * @param {Array} [options.providers=LOCAL_PROVIDERS] - Providers to detect
 * @returns {Promise<Array>} Array of detection results
 */
export async function detectLocalProviders(options = {}) {
  const { timeout = DEFAULT_PROBE_TIMEOUT, providers = LOCAL_PROVIDERS } = options;

  const probePromises = providers.map(provider => detectProvider(provider, timeout));
  const results = await Promise.allSettled(probePromises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      name: providers[index].name,
      code: providers[index].code,
      endpoint: providers[index].endpoint,
      models: [],
      running: false,
      error: result.reason?.message || 'Detection failed'
    };
  });
}

/**
 * Gets only running local providers
 *
 * @param {Object} [options] - Detection options
 * @returns {Promise<Array>} Array of running providers
 */
export async function getRunningProviders(options = {}) {
  const all = await detectLocalProviders(options);
  return all.filter(p => p.running);
}

/**
 * Checks if any local provider is running
 *
 * @param {Object} [options] - Detection options
 * @returns {Promise<boolean>} True if at least one provider is running
 */
export async function hasLocalProvider(options = {}) {
  const running = await getRunningProviders(options);
  return running.length > 0;
}

/**
 * Gets a specific provider by code
 *
 * @param {string} code - Provider code (e.g., 'ollama')
 * @param {Object} [options] - Detection options
 * @returns {Promise<Object|null>} Provider info or null if not found
 */
export async function getProviderByCode(code, options = {}) {
  const provider = LOCAL_PROVIDERS.find(p => p.code === code);
  if (!provider) return null;
  return detectProvider(provider, options.timeout || DEFAULT_PROBE_TIMEOUT);
}

/**
 * Formats detected providers for display
 *
 * @param {Array} providers - Detected providers
 * @returns {string} Formatted string for display
 */
export function formatDetectedProviders(providers) {
  const lines = ['Local LLM Providers:'];
  const running = providers.filter(p => p.running);
  const stopped = providers.filter(p => !p.running);

  if (running.length > 0) {
    lines.push('');
    lines.push('  Running:');
    for (const p of running) {
      const modelCount = p.models.length;
      const modelInfo = modelCount > 0 ? ' (' + modelCount + ' model' + (modelCount !== 1 ? 's' : '') + ')' : '';
      lines.push('    [OK] ' + p.name + ' at ' + p.endpoint + modelInfo);
      if (p.models.length > 0 && p.models[0] !== 'default') {
        lines.push('         Models: ' + p.models.slice(0, 3).join(', ') + (p.models.length > 3 ? '...' : ''));
      }
    }
  }

  if (stopped.length > 0) {
    lines.push('');
    lines.push('  Not Running:');
    for (const p of stopped) {
      lines.push('    [--] ' + p.name + ' at ' + p.endpoint);
    }
  }

  if (running.length === 0) {
    lines.push('');
    lines.push('  No local providers detected.');
  }

  return lines.join('\n');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Local LLM Provider Detector - Standalone Test\n');
  detectLocalProviders()
    .then(providers => console.log(formatDetectedProviders(providers)))
    .catch(error => console.error('Detection failed:', error.message));
}
