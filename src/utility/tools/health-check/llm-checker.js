/**
 * LLM Connectivity Checker - INST-021
 * Epic 4 - Post-Install Health Check
 *
 * Tests LLM provider connectivity based on llm-config.yaml.
 * Reports connection status, response times, and fallback availability.
 *
 * @module health-check/llm-checker
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @typedef {Object} ProviderResult
 * @property {string} provider - Provider code
 * @property {string} [model] - Configured model
 * @property {boolean} connected - Whether connection succeeded
 * @property {number} [responseTime] - Response time in milliseconds
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} LlmCheckResult
 * @property {'connected'|'fallback'|'disconnected'|'unconfigured'} status - Overall status
 * @property {ProviderResult} [primary] - Primary provider result
 * @property {ProviderResult[]} fallbacks - Fallback provider results
 * @property {string[]} availableModels - Available models (for local providers)
 * @property {string[]} warnings - Warning messages
 */

/**
 * Default timeout for connection tests (5 seconds per acceptance criteria)
 */
export const DEFAULT_TIMEOUT = 5000;

/**
 * Default config file path relative to project root
 */
export const DEFAULT_CONFIG_PATH = '_bmad/_config/llm-config.yaml';

/**
 * Provider test endpoints (mirrors connection-tester.js)
 */
export const PROVIDER_ENDPOINTS = {
  claude: null, // Native Claude Code, no test needed
  ollama: { path: '/api/tags', method: 'GET' },
  vllm: { path: '/v1/models', method: 'GET' },
  lmstudio: { path: '/v1/models', method: 'GET' },
  llamacpp: { path: '/health', method: 'GET' },
  openai: { path: '/v1/models', method: 'GET', requiresAuth: true },
  groq: { path: '/openai/v1/models', method: 'GET', requiresAuth: true },
  together: { path: '/v1/models', method: 'GET', requiresAuth: true },
  custom: { path: '', method: 'GET' }
};

/**
 * Provider base URLs for cloud providers
 */
export const PROVIDER_BASE_URLS = {
  openai: 'https://api.openai.com',
  groq: 'https://api.groq.com',
  together: 'https://api.together.xyz'
};

/**
 * Local provider codes (for model listing)
 */
export const LOCAL_PROVIDERS = ['ollama', 'vllm', 'lmstudio', 'llamacpp'];

/**
 * Simple YAML parser for LLM config (avoids external dependency)
 * Parses a limited subset of YAML needed for llm-config.yaml
 *
 * @param {string} content - YAML content string
 * @returns {Object} Parsed configuration object
 */
export function parseSimpleYaml(content) {
  const config = {
    active_provider: null,
    providers: {},
    fallback_chain: []
  };

  const lines = content.split('\n');
  let currentProvider = null;
  let inProviders = false;
  let inFallbackChain = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Check for active_provider
    const activeMatch = trimmed.match(/^active_provider:\s*["']?(\w+)["']?/);
    if (activeMatch) {
      config.active_provider = activeMatch[1];
      continue;
    }

    // Check for providers section
    if (trimmed === 'providers:') {
      inProviders = true;
      inFallbackChain = false;
      continue;
    }

    // Check for fallback_chain section
    if (trimmed === 'fallback_chain:') {
      inFallbackChain = true;
      inProviders = false;
      continue;
    }

    // Check for other top-level keys (exit providers/fallback sections)
    if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed.includes(':')) {
      inProviders = false;
      inFallbackChain = false;
      continue;
    }

    // Parse fallback chain items
    if (inFallbackChain && trimmed.startsWith('-')) {
      const providerMatch = trimmed.match(/^-\s*["']?(\w+)["']?/);
      if (providerMatch) {
        config.fallback_chain.push(providerMatch[1]);
      }
      continue;
    }

    // Parse providers section
    if (inProviders) {
      // Check for provider name (2-space indentation)
      const providerMatch = line.match(/^  (\w+):\s*$/);
      if (providerMatch) {
        currentProvider = providerMatch[1];
        config.providers[currentProvider] = {};
        continue;
      }

      // Parse provider properties (4-space indentation)
      if (currentProvider) {
        const propMatch = line.match(/^    (\w+):\s*(.+)?$/);
        if (propMatch) {
          const key = propMatch[1];
          let value = propMatch[2]?.trim() || '';

          // Remove quotes
          value = value.replace(/^["']|["']$/g, '');

          // Handle special values
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(value) && value !== '') value = Number(value);

          config.providers[currentProvider][key] = value;
        }
      }
    }
  }

  return config;
}

/**
 * Reads and parses the LLM configuration file
 *
 * @param {string} [configPath] - Path to config file (defaults to project _bmad/_config/llm-config.yaml)
 * @param {string} [projectRoot] - Project root directory
 * @returns {Object|null} Parsed config or null if not found/invalid
 */
export function readLlmConfig(configPath, projectRoot) {
  const root = projectRoot || process.cwd();
  const fullPath = configPath || path.join(root, DEFAULT_CONFIG_PATH);

  try {
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const config = parseSimpleYaml(content);

    return config;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the API key for a provider from environment variables
 *
 * @param {Object} providerConfig - Provider configuration
 * @returns {string|null} API key or null if not found
 */
export function getApiKey(providerConfig) {
  if (!providerConfig || !providerConfig.api_key_env) {
    return null;
  }

  return process.env[providerConfig.api_key_env] || null;
}

/**
 * Tests connectivity to a single provider
 *
 * @param {Object} config - Provider configuration
 * @param {string} config.provider - Provider code
 * @param {string} [config.baseUrl] - Base URL (for local/custom providers)
 * @param {string} [config.apiKey] - API key (for cloud providers)
 * @param {string} [config.model] - Configured model
 * @param {number} [config.timeout=DEFAULT_TIMEOUT] - Timeout in milliseconds
 * @returns {Promise<ProviderResult>} Test result
 */
export async function testProvider(config) {
  const {
    provider,
    baseUrl,
    apiKey,
    model,
    timeout = DEFAULT_TIMEOUT
  } = config;

  const startTime = Date.now();

  // Special case: Claude uses native integration
  if (provider === 'claude') {
    return {
      provider,
      model: model || 'claude (native)',
      connected: true,
      responseTime: 0
    };
  }

  // Get endpoint configuration
  const endpoint = PROVIDER_ENDPOINTS[provider];
  if (!endpoint) {
    return {
      provider,
      model,
      connected: false,
      responseTime: Date.now() - startTime,
      error: `Unknown provider: ${provider}`
    };
  }

  // Determine URL
  let url;
  if (baseUrl) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    url = cleanBaseUrl + endpoint.path;
  } else if (PROVIDER_BASE_URLS[provider]) {
    url = PROVIDER_BASE_URLS[provider] + endpoint.path;
  } else {
    return {
      provider,
      model,
      connected: false,
      responseTime: Date.now() - startTime,
      error: 'No base URL configured for provider'
    };
  }

  // Check API key requirement
  if (endpoint.requiresAuth && !apiKey) {
    return {
      provider,
      model,
      connected: false,
      responseTime: Date.now() - startTime,
      error: 'API key required but not configured'
    };
  }

  // Build headers
  const headers = { 'Accept': 'application/json' };
  if (endpoint.requiresAuth && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Make test request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        provider,
        model,
        connected: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return {
      provider,
      model,
      connected: true,
      responseTime
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    let errorMessage;
    if (error.name === 'AbortError') {
      errorMessage = 'Connection timed out';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - server not running';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Host not found';
    } else {
      errorMessage = error.message || 'Unknown error';
    }

    return {
      provider,
      model,
      connected: false,
      responseTime,
      error: errorMessage
    };
  }
}

/**
 * Tests the fallback chain of providers
 *
 * @param {string[]} fallbackChain - Array of provider codes
 * @param {Object} providersConfig - Providers configuration object
 * @param {number} [timeout=DEFAULT_TIMEOUT] - Timeout per provider
 * @returns {Promise<ProviderResult[]>} Array of test results
 */
export async function testFallbackChain(fallbackChain, providersConfig, timeout = DEFAULT_TIMEOUT) {
  if (!fallbackChain || fallbackChain.length === 0) {
    return [];
  }

  const results = [];

  for (const providerCode of fallbackChain) {
    const providerConfig = providersConfig?.[providerCode];
    if (!providerConfig) {
      results.push({
        provider: providerCode,
        connected: false,
        error: 'Provider not configured'
      });
      continue;
    }

    const result = await testProvider({
      provider: providerCode,
      baseUrl: providerConfig.base_url,
      apiKey: getApiKey(providerConfig),
      model: providerConfig.model,
      timeout
    });

    results.push(result);
  }

  return results;
}

/**
 * Gets available models from a local provider
 *
 * @param {string} provider - Provider code
 * @param {string} baseUrl - Provider base URL
 * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout
 * @returns {Promise<string[]>} Array of available model names
 */
export async function getLocalModels(provider, baseUrl, timeout = DEFAULT_TIMEOUT) {
  if (!LOCAL_PROVIDERS.includes(provider)) {
    return [];
  }

  const endpoint = PROVIDER_ENDPOINTS[provider];
  if (!endpoint) {
    return [];
  }

  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const url = cleanBaseUrl + endpoint.path;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Parse response based on provider format
    if (provider === 'ollama') {
      // Ollama returns { models: [{ name: '...' }] }
      if (data && Array.isArray(data.models)) {
        return data.models.map(m => m.name || m.model || '').filter(Boolean);
      }
    } else if (provider === 'vllm' || provider === 'lmstudio') {
      // OpenAI-compatible format: { data: [{ id: '...' }] }
      if (data && Array.isArray(data.data)) {
        return data.data.map(m => m.id || '').filter(Boolean);
      }
    } else if (provider === 'llamacpp') {
      // llama.cpp health endpoint doesn't list models
      if (data && (data.status === 'ok' || typeof data === 'object')) {
        return ['default'];
      }
    }

    return [];
  } catch (error) {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Main LLM connectivity check function
 *
 * @param {Object} [options] - Check options
 * @param {string} [options.configPath] - Path to config file
 * @param {string} [options.projectRoot] - Project root directory
 * @param {number} [options.timeout=DEFAULT_TIMEOUT] - Timeout per provider
 * @returns {Promise<LlmCheckResult>} Check result
 */
export async function checkLlmConnectivity(options = {}) {
  const { configPath, projectRoot, timeout = DEFAULT_TIMEOUT } = options;

  const warnings = [];

  // Read configuration
  const config = readLlmConfig(configPath, projectRoot);

  if (!config) {
    return {
      status: 'unconfigured',
      primary: undefined,
      fallbacks: [],
      availableModels: [],
      warnings: ['LLM configuration file not found or invalid']
    };
  }

  const activeProvider = config.active_provider;
  const providersConfig = config.providers || {};

  if (!activeProvider) {
    return {
      status: 'unconfigured',
      primary: undefined,
      fallbacks: [],
      availableModels: [],
      warnings: ['No active provider configured']
    };
  }

  // Test primary provider
  const primaryConfig = providersConfig[activeProvider];

  if (!primaryConfig) {
    return {
      status: 'unconfigured',
      primary: {
        provider: activeProvider,
        connected: false,
        error: 'Provider not found in configuration'
      },
      fallbacks: [],
      availableModels: [],
      warnings: [`Primary provider '${activeProvider}' not found in providers configuration`]
    };
  }

  const primaryResult = await testProvider({
    provider: activeProvider,
    baseUrl: primaryConfig.base_url,
    apiKey: getApiKey(primaryConfig),
    model: primaryConfig.model,
    timeout
  });

  // Get available models for local providers
  let availableModels = [];
  if (LOCAL_PROVIDERS.includes(activeProvider) && primaryResult.connected && primaryConfig.base_url) {
    availableModels = await getLocalModels(activeProvider, primaryConfig.base_url, timeout);
  }

  // Test fallback chain if primary failed
  const fallbackChain = config.fallback_chain || [];
  let fallbacks = [];

  if (!primaryResult.connected && fallbackChain.length > 0) {
    // Filter out the primary provider from fallback testing
    const fallbacksToTest = fallbackChain.filter(p => p !== activeProvider);
    fallbacks = await testFallbackChain(fallbacksToTest, providersConfig, timeout);

    // Check if any fallback is available
    const availableFallback = fallbacks.find(f => f.connected);
    if (availableFallback) {
      warnings.push(`Primary provider '${activeProvider}' is down, but '${availableFallback.provider}' is available as fallback`);
    }
  }

  // Determine overall status
  let status;
  if (primaryResult.connected) {
    status = 'connected';
  } else if (fallbacks.some(f => f.connected)) {
    status = 'fallback';
  } else {
    status = 'disconnected';
  }

  // Add warning if primary is disconnected
  if (!primaryResult.connected && primaryResult.error) {
    warnings.push(`Primary provider error: ${primaryResult.error}`);
  }

  return {
    status,
    primary: primaryResult,
    fallbacks,
    availableModels,
    warnings
  };
}

/**
 * Formats the check result for display
 *
 * @param {LlmCheckResult} result - Check result
 * @returns {string} Formatted output
 */
export function formatCheckResult(result) {
  const lines = ['LLM Connectivity Check:', ''];

  // Status indicator
  const statusIcons = {
    connected: '[OK]',
    fallback: '[WARN]',
    disconnected: '[FAIL]',
    unconfigured: '[--]'
  };

  const statusMessages = {
    connected: 'Primary provider connected',
    fallback: 'Primary down, fallback available',
    disconnected: 'All providers disconnected',
    unconfigured: 'LLM not configured'
  };

  lines.push(`Status: ${statusIcons[result.status]} ${statusMessages[result.status]}`);
  lines.push('');

  // Primary provider details
  if (result.primary) {
    lines.push('Primary Provider:');
    const p = result.primary;
    const connStatus = p.connected ? 'Connected' : 'Disconnected';
    const timeStr = p.responseTime !== undefined ? ` (${p.responseTime}ms)` : '';
    const modelStr = p.model ? ` - Model: ${p.model}` : '';
    lines.push(`  ${p.provider}: ${connStatus}${timeStr}${modelStr}`);
    if (p.error) {
      lines.push(`  Error: ${p.error}`);
    }
  }

  // Available models
  if (result.availableModels && result.availableModels.length > 0) {
    lines.push('');
    lines.push('Available Models:');
    const modelsToShow = result.availableModels.slice(0, 5);
    for (const model of modelsToShow) {
      lines.push(`  - ${model}`);
    }
    if (result.availableModels.length > 5) {
      lines.push(`  ... and ${result.availableModels.length - 5} more`);
    }
  }

  // Fallbacks
  if (result.fallbacks && result.fallbacks.length > 0) {
    lines.push('');
    lines.push('Fallback Providers:');
    for (const f of result.fallbacks) {
      const fStatus = f.connected ? '[OK]' : '[--]';
      const fTimeStr = f.responseTime !== undefined ? ` (${f.responseTime}ms)` : '';
      lines.push(`  ${fStatus} ${f.provider}${fTimeStr}`);
    }
  }

  // Warnings
  if (result.warnings && result.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const w of result.warnings) {
      lines.push(`  ! ${w}`);
    }
  }

  return lines.join('\n');
}

// ESM Entry point detection for testing
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  console.log('LLM Connectivity Checker - Standalone Test\n');

  checkLlmConnectivity()
    .then(result => {
      console.log(formatCheckResult(result));
      console.log('\nRaw Result:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
