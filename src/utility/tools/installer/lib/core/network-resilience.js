/**
 * Network Resilience Module
 * Provides retry logic, proxy handling, and offline support for BMAD installer
 *
 * Addresses:
 * - VAL-03-016: Retry logic with exponential backoff
 * - VAL-03-018: Proxy and corporate firewall handling
 * - VAL-03-008: Offline mode detection and handling
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Default configuration from installation-validation-logic.yaml
 */
const DEFAULT_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000,
  maxRetryDelay: 30000,
  backoffMultiplier: 2,
  timeout: 30000,
  offlineMode: false
};

/**
 * Retryable error codes that should trigger retry logic
 */
const RETRYABLE_ERROR_CODES = [
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPROTO'
];

/**
 * Retryable HTTP status codes
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Network Resilience Manager
 * Handles retry logic, proxy configuration, and offline mode
 */
class NetworkResilience {
  constructor(options = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...options
    };

    // Proxy configuration
    this.proxyConfig = this.detectProxyConfiguration();

    // Offline mode state
    this.offlineMode = options.offlineMode || false;
    this.lastConnectivityCheck = null;
    this.connectivityStatus = null;
  }

  /**
   * Execute an async operation with retry logic and exponential backoff
   * @param {Function} operation - Async function to execute
   * @param {Object} options - Retry options
   * @returns {Promise<any>} - Result of the operation
   */
  async withRetry(operation, options = {}) {
    const {
      retryAttempts = this.config.retryAttempts,
      retryDelay = this.config.retryDelay,
      maxRetryDelay = this.config.maxRetryDelay,
      backoffMultiplier = this.config.backoffMultiplier,
      onRetry = null,
      operationName = 'operation'
    } = options;

    let lastError = null;
    let currentDelay = retryDelay;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Check if we've exhausted retries
        if (attempt >= retryAttempts) {
          throw new Error(
            `${operationName} failed after ${retryAttempts} attempts: ${error.message}`
          );
        }

        // Calculate delay with jitter
        const jitter = Math.random() * 0.3 * currentDelay;
        const delayWithJitter = Math.min(currentDelay + jitter, maxRetryDelay);

        console.log(
          `[NetworkResilience] ${operationName} attempt ${attempt}/${retryAttempts} failed: ${error.message}. ` +
          `Retrying in ${Math.round(delayWithJitter)}ms...`
        );

        // Callback for retry notification
        if (onRetry) {
          onRetry({
            attempt,
            totalAttempts: retryAttempts,
            error,
            nextDelay: delayWithJitter
          });
        }

        // Wait before retry
        await this.sleep(delayWithJitter);

        // Exponential backoff
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxRetryDelay);
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} - Whether the error is retryable
   */
  isRetryableError(error) {
    // Check error code
    if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
      return true;
    }

    // Check HTTP status code
    if (error.statusCode && RETRYABLE_STATUS_CODES.includes(error.statusCode)) {
      return true;
    }

    // Check error message patterns
    const retryablePatterns = [
      /timeout/i,
      /ECONNRESET/i,
      /socket hang up/i,
      /network/i,
      /temporarily unavailable/i,
      /service unavailable/i,
      /rate limit/i
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Detect and configure proxy settings from environment
   * @returns {Object} - Proxy configuration
   */
  detectProxyConfiguration() {
    const config = {
      httpProxy: null,
      httpsProxy: null,
      noProxy: [],
      proxyAuth: null
    };

    // Check HTTP_PROXY / http_proxy
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    if (httpProxy) {
      config.httpProxy = this.parseProxyUrl(httpProxy);
    }

    // Check HTTPS_PROXY / https_proxy
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    if (httpsProxy) {
      config.httpsProxy = this.parseProxyUrl(httpsProxy);
    }

    // Check NO_PROXY / no_proxy
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
      config.noProxy = noProxy.split(',').map(host => host.trim().toLowerCase());
    }

    // Check NPM_CONFIG_PROXY for npm-specific proxy
    const npmProxy = process.env.NPM_CONFIG_PROXY || process.env.npm_config_proxy;
    if (npmProxy && !config.httpsProxy) {
      config.httpsProxy = this.parseProxyUrl(npmProxy);
    }

    // Check for proxy authentication
    const proxyAuth = process.env.PROXY_AUTH || process.env.proxy_auth;
    if (proxyAuth) {
      config.proxyAuth = proxyAuth;
    }

    return config;
  }

  /**
   * Parse a proxy URL into components
   * @param {string} proxyUrl - Proxy URL string
   * @returns {Object} - Parsed proxy configuration
   */
  parseProxyUrl(proxyUrl) {
    try {
      const url = new URL(proxyUrl);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        auth: url.username ? {
          username: decodeURIComponent(url.username),
          password: decodeURIComponent(url.password || '')
        } : null
      };
    } catch (error) {
      console.warn(`[NetworkResilience] Failed to parse proxy URL: ${proxyUrl}`);
      return null;
    }
  }

  /**
   * Check if a host should bypass the proxy
   * @param {string} hostname - The hostname to check
   * @returns {boolean} - Whether to bypass proxy
   */
  shouldBypassProxy(hostname) {
    if (!hostname) return false;

    const lowerHostname = hostname.toLowerCase();

    return this.proxyConfig.noProxy.some(pattern => {
      // Exact match
      if (lowerHostname === pattern) return true;

      // Wildcard match (e.g., *.example.com)
      if (pattern.startsWith('*.')) {
        const domain = pattern.slice(2);
        return lowerHostname.endsWith(domain) || lowerHostname === domain.slice(1);
      }

      // Suffix match (e.g., .example.com)
      if (pattern.startsWith('.')) {
        return lowerHostname.endsWith(pattern);
      }

      return false;
    });
  }

  /**
   * Get proxy agent options for a request
   * @param {string} targetUrl - The target URL
   * @returns {Object|null} - Proxy options or null
   */
  getProxyOptions(targetUrl) {
    try {
      const url = new URL(targetUrl);

      // Check if proxy should be bypassed
      if (this.shouldBypassProxy(url.hostname)) {
        return null;
      }

      // Get appropriate proxy config
      const proxyConfig = url.protocol === 'https:'
        ? this.proxyConfig.httpsProxy
        : this.proxyConfig.httpProxy;

      if (!proxyConfig) {
        return null;
      }

      const options = {
        host: proxyConfig.host,
        port: proxyConfig.port
      };

      // Add authentication if available
      if (proxyConfig.auth) {
        options.auth = `${proxyConfig.auth.username}:${proxyConfig.auth.password}`;
      } else if (this.proxyConfig.proxyAuth) {
        options.auth = this.proxyConfig.proxyAuth;
      }

      return options;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check network connectivity
   * @param {string} testUrl - URL to test connectivity
   * @returns {Promise<Object>} - Connectivity status
   */
  async checkConnectivity(testUrl = 'https://registry.npmjs.org/-/ping') {
    const result = {
      online: false,
      latency: null,
      error: null,
      timestamp: new Date().toISOString()
    };

    const startTime = Date.now();

    try {
      await this.withRetry(
        () => this.makeRequest(testUrl, { method: 'HEAD', timeout: 5000 }),
        { retryAttempts: 2, retryDelay: 500, operationName: 'connectivity-check' }
      );

      result.online = true;
      result.latency = Date.now() - startTime;
    } catch (error) {
      result.online = false;
      result.error = error.message;
    }

    this.lastConnectivityCheck = result.timestamp;
    this.connectivityStatus = result.online;

    return result;
  }

  /**
   * Make an HTTP/HTTPS request with proxy support
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response
   */
  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || this.config.timeout
      };

      // Add proxy options if configured
      const proxyOptions = this.getProxyOptions(url);
      if (proxyOptions && !isHttps) {
        // For HTTP through proxy
        requestOptions.hostname = proxyOptions.host;
        requestOptions.port = proxyOptions.port;
        requestOptions.path = url;
        if (proxyOptions.auth) {
          requestOptions.headers['Proxy-Authorization'] =
            'Basic ' + Buffer.from(proxyOptions.auth).toString('base64');
        }
      }

      const req = httpModule.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data, headers: res.headers });
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
            error.statusCode = res.statusCode;
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        const error = new Error('Request timed out');
        error.code = 'ETIMEDOUT';
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * Check if running in offline mode
   * @returns {boolean} - Whether offline mode is active
   */
  isOfflineMode() {
    // Explicit offline flag
    if (this.offlineMode) return true;

    // Check environment variable
    if (process.env.BMAD_OFFLINE === 'true' || process.env.npm_config_offline === 'true') {
      return true;
    }

    // Check connectivity status if available
    if (this.connectivityStatus === false) {
      return true;
    }

    return false;
  }

  /**
   * Enable offline mode
   */
  enableOfflineMode() {
    this.offlineMode = true;
    console.log('[NetworkResilience] Offline mode enabled');
  }

  /**
   * Disable offline mode
   */
  disableOfflineMode() {
    this.offlineMode = false;
    console.log('[NetworkResilience] Offline mode disabled');
  }

  /**
   * Get configuration summary for diagnostics
   * @returns {Object} - Configuration summary
   */
  getConfigSummary() {
    return {
      retryConfig: {
        attempts: this.config.retryAttempts,
        initialDelay: this.config.retryDelay,
        maxDelay: this.config.maxRetryDelay,
        backoffMultiplier: this.config.backoffMultiplier
      },
      proxyConfig: {
        httpProxy: this.proxyConfig.httpProxy ?
          `${this.proxyConfig.httpProxy.host}:${this.proxyConfig.httpProxy.port}` : null,
        httpsProxy: this.proxyConfig.httpsProxy ?
          `${this.proxyConfig.httpsProxy.host}:${this.proxyConfig.httpsProxy.port}` : null,
        noProxyCount: this.proxyConfig.noProxy.length,
        hasAuth: !!(this.proxyConfig.proxyAuth ||
          this.proxyConfig.httpProxy?.auth ||
          this.proxyConfig.httpsProxy?.auth)
      },
      offlineMode: this.isOfflineMode(),
      lastConnectivityCheck: this.lastConnectivityCheck,
      connectivityStatus: this.connectivityStatus
    };
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a preconfigured instance with default settings
 */
const createNetworkResilience = (options = {}) => {
  return new NetworkResilience(options);
};

module.exports = {
  NetworkResilience,
  createNetworkResilience,
  DEFAULT_CONFIG,
  RETRYABLE_ERROR_CODES,
  RETRYABLE_STATUS_CODES
};
