/**
 * Connection Tester - INST-016
 * Epic 3, Story 6 - Provider Connection Testing
 *
 * Tests LLM provider connections with spinner feedback.
 * Parses common errors for user-friendly messages.
 *
 * @module llm-setup/connection-tester
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import chalk from 'chalk';

/**
 * @typedef {Object} TestResult
 * @property {boolean} success - Whether connection succeeded
 * @property {string} provider - Provider code tested
 * @property {number} responseTime - Response time in milliseconds
 * @property {string} [model] - Model that responded (if available)
 * @property {string} [error] - Error message if failed
 * @property {string} [errorCode] - Error code for programmatic handling
 */

/**
 * Default test timeout (milliseconds)
 */
export const DEFAULT_TEST_TIMEOUT = 10000;

/**
 * Provider test endpoints
 */
export const TEST_ENDPOINTS = {
  claude: null, // Native Claude Code, no test needed
  ollama: { path: '/api/tags', method: 'GET' },
  vllm: { path: '/v1/models', method: 'GET' },
  lmstudio: { path: '/v1/models', method: 'GET' },
  llamacpp: { path: '/health', method: 'GET' },
  openai: { path: '/v1/models', method: 'GET', headers: { 'Authorization': 'Bearer {apiKey}' } },
  groq: { path: '/openai/v1/models', method: 'GET', headers: { 'Authorization': 'Bearer {apiKey}' } },
  together: { path: '/v1/models', method: 'GET', headers: { 'Authorization': 'Bearer {apiKey}' } },
  custom: { path: '', method: 'GET' }
};

/**
 * Base URLs for cloud providers
 */
export const PROVIDER_BASE_URLS = {
  openai: 'https://api.openai.com',
  groq: 'https://api.groq.com',
  together: 'https://api.together.xyz'
};

/**
 * Error code mappings
 */
export const ERROR_CODES = {
  ECONNREFUSED: 'CONNECTION_REFUSED',
  ENOTFOUND: 'HOST_NOT_FOUND',
  ETIMEDOUT: 'TIMEOUT',
  ECONNRESET: 'CONNECTION_RESET',
  ERR_INVALID_URL: 'INVALID_URL',
  AbortError: 'TIMEOUT'
};

/**
 * HTTP status error messages
 */
export const HTTP_ERROR_MESSAGES = {
  401: 'Authentication failed - check your API key',
  403: 'Access forbidden - API key may not have required permissions',
  404: 'Endpoint not found - check the URL',
  429: 'Rate limit exceeded - too many requests',
  500: 'Server error - provider is having issues',
  502: 'Bad gateway - provider service is unavailable',
  503: 'Service unavailable - provider is overloaded',
  504: 'Gateway timeout - provider is not responding'
};

/**
 * Parses an error into a user-friendly message
 *
 * @param {Error|Object} error - Error object
 * @returns {{ message: string, code: string }} Parsed error
 */
export function parseError(error) {
  // Handle AbortError (timeout)
  if (error.name === 'AbortError') {
    return {
      message: 'Connection timed out - server did not respond in time',
      code: 'TIMEOUT'
    };
  }

  // Handle Node.js network errors
  if (error.code && ERROR_CODES[error.code]) {
    const code = ERROR_CODES[error.code];
    const messages = {
      CONNECTION_REFUSED: 'Connection refused - server is not running or not accepting connections',
      HOST_NOT_FOUND: 'Host not found - check the URL or network connection',
      TIMEOUT: 'Connection timed out - server is not responding',
      CONNECTION_RESET: 'Connection was reset - server closed the connection unexpectedly',
      INVALID_URL: 'Invalid URL format'
    };
    return {
      message: messages[code] || error.message,
      code
    };
  }

  // Handle HTTP errors
  if (error.status && HTTP_ERROR_MESSAGES[error.status]) {
    return {
      message: HTTP_ERROR_MESSAGES[error.status],
      code: `HTTP_${error.status}`
    };
  }

  // Default error
  return {
    message: error.message || 'Unknown error occurred',
    code: 'UNKNOWN'
  };
}

/**
 * Creates a spinner-like progress indicator (simple version)
 *
 * @param {string} text - Text to display
 * @returns {Object} Spinner controller with start, stop, succeed, fail methods
 */
export function createSpinner(text) {
  const frames = ['|', '/', '-', '\\'];
  let frameIndex = 0;
  let intervalId = null;
  let currentText = text;

  const clearLine = () => {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
  };

  return {
    start() {
      process.stdout.write(`${chalk.cyan(frames[0])} ${currentText}`);
      intervalId = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        process.stdout.write(`\r${chalk.cyan(frames[frameIndex])} ${currentText}`);
      }, 100);
      return this;
    },
    text(newText) {
      currentText = newText;
      return this;
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      clearLine();
      return this;
    },
    succeed(text) {
      this.stop();
      console.log(`${chalk.green('✓')} ${text || currentText}`);
      return this;
    },
    fail(text) {
      this.stop();
      console.log(`${chalk.red('✗')} ${text || currentText}`);
      return this;
    },
    warn(text) {
      this.stop();
      console.log(`${chalk.yellow('!')} ${text || currentText}`);
      return this;
    }
  };
}

/**
 * Tests a connection to an LLM provider
 *
 * @param {Object} options - Test options
 * @param {string} options.provider - Provider code
 * @param {string} [options.baseUrl] - Base URL (for local/custom providers)
 * @param {string} [options.apiKey] - API key (for cloud providers)
 * @param {number} [options.timeout=DEFAULT_TEST_TIMEOUT] - Timeout in ms
 * @param {boolean} [options.silent=false] - Suppress spinner output
 * @returns {Promise<TestResult>} Test result
 */
export async function testConnection(options) {
  const {
    provider,
    baseUrl,
    apiKey,
    timeout = DEFAULT_TEST_TIMEOUT,
    silent = false
  } = options;

  const startTime = Date.now();
  let spinner = null;

  if (!silent) {
    spinner = createSpinner(`Testing ${provider} connection...`);
    spinner.start();
  }

  // Special case: Claude uses native integration
  if (provider === 'claude') {
    if (!silent && spinner) {
      spinner.succeed('Claude - Using native Claude Code integration');
    }
    return {
      success: true,
      provider,
      responseTime: 0,
      model: 'claude (native)'
    };
  }

  // Get test endpoint configuration
  const testConfig = TEST_ENDPOINTS[provider];
  if (!testConfig) {
    if (!silent && spinner) {
      spinner.fail(`Unknown provider: ${provider}`);
    }
    return {
      success: false,
      provider,
      responseTime: Date.now() - startTime,
      error: `Unknown provider: ${provider}`,
      errorCode: 'UNKNOWN_PROVIDER'
    };
  }

  // Determine URL
  let url;
  if (baseUrl) {
    url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    url += testConfig.path;
  } else if (PROVIDER_BASE_URLS[provider]) {
    url = PROVIDER_BASE_URLS[provider] + testConfig.path;
  } else {
    if (!silent && spinner) {
      spinner.fail('No base URL provided for provider');
    }
    return {
      success: false,
      provider,
      responseTime: Date.now() - startTime,
      error: 'Base URL is required for this provider',
      errorCode: 'MISSING_URL'
    };
  }

  // Build headers
  const headers = { 'Accept': 'application/json' };
  if (testConfig.headers) {
    for (const [key, value] of Object.entries(testConfig.headers)) {
      if (value.includes('{apiKey}')) {
        if (!apiKey) {
          if (!silent && spinner) {
            spinner.fail('API key required but not provided');
          }
          return {
            success: false,
            provider,
            responseTime: Date.now() - startTime,
            error: 'API key is required for this provider',
            errorCode: 'MISSING_API_KEY'
          };
        }
        headers[key] = value.replace('{apiKey}', apiKey);
      } else {
        headers[key] = value;
      }
    }
  }

  // Make test request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: testConfig.method,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const parsed = parseError({ status: response.status });
      if (!silent && spinner) {
        spinner.fail(`${provider}: ${parsed.message}`);
      }
      return {
        success: false,
        provider,
        responseTime,
        error: parsed.message,
        errorCode: parsed.code
      };
    }

    // Try to extract model info
    let model = null;
    try {
      const data = await response.json();
      if (data.models && data.models.length > 0) {
        model = data.models[0].name || data.models[0].id;
      } else if (data.data && data.data.length > 0) {
        model = data.data[0].id;
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }

    if (!silent && spinner) {
      const timeStr = `${responseTime}ms`;
      const modelStr = model ? ` (${model})` : '';
      spinner.succeed(`${provider}: Connected${modelStr} [${timeStr}]`);
    }

    return {
      success: true,
      provider,
      responseTime,
      model
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const parsed = parseError(error);

    if (!silent && spinner) {
      spinner.fail(`${provider}: ${parsed.message}`);
    }

    return {
      success: false,
      provider,
      responseTime,
      error: parsed.message,
      errorCode: parsed.code
    };
  }
}

/**
 * Tests multiple providers
 *
 * @param {Array<Object>} providers - Array of provider configs to test
 * @param {Object} [options] - Options
 * @param {number} [options.timeout] - Timeout per test
 * @param {boolean} [options.parallel=false] - Run tests in parallel
 * @returns {Promise<TestResult[]>} Array of test results
 */
export async function testMultipleConnections(providers, options = {}) {
  const { parallel = false, ...testOptions } = options;

  if (parallel) {
    return Promise.all(
      providers.map(p => testConnection({ ...testOptions, ...p }))
    );
  }

  const results = [];
  for (const provider of providers) {
    const result = await testConnection({ ...testOptions, ...provider });
    results.push(result);
  }
  return results;
}

/**
 * Formats test results for display
 *
 * @param {TestResult[]} results - Test results
 * @returns {string} Formatted output
 */
export function formatTestResults(results) {
  const lines = ['Connection Test Results:', ''];

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful.length > 0) {
    lines.push(chalk.green('Successful:'));
    for (const r of successful) {
      const modelInfo = r.model ? ` (${r.model})` : '';
      lines.push(`  ${chalk.green('✓')} ${r.provider}${modelInfo} [${r.responseTime}ms]`);
    }
  }

  if (failed.length > 0) {
    if (successful.length > 0) lines.push('');
    lines.push(chalk.red('Failed:'));
    for (const r of failed) {
      lines.push(`  ${chalk.red('✗')} ${r.provider}: ${r.error}`);
    }
  }

  return lines.join('\n');
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Connection Tester - Standalone Test\n');

  testConnection({ provider: 'ollama', baseUrl: 'http://localhost:11434' })
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
