/**
 * Unit Tests for Network Resilience Module
 * Tests retry logic, proxy handling, and offline support
 *
 * Validates fixes for:
 * - VAL-03-016: Retry logic with exponential backoff
 * - VAL-03-018: Proxy and corporate firewall handling
 * - VAL-03-008: Offline mode detection
 *
 * @author BlackUnicorn.Tech
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock modules before import
vi.mock('https', () => ({
  request: vi.fn()
}));
vi.mock('http', () => ({
  request: vi.fn()
}));

describe('NetworkResilience', () => {
  let NetworkResilience;
  let networkResilience;
  let originalEnv;

  beforeEach(async () => {
    // Save original env
    originalEnv = { ...process.env };

    // Clear any proxy env vars
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    delete process.env.no_proxy;
    delete process.env.NPM_CONFIG_PROXY;
    delete process.env.BMAD_OFFLINE;

    // Dynamic import after env setup (CommonJS module)
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const moduleExports = require('../network-resilience.js');
    NetworkResilience = moduleExports.NetworkResilience;
    networkResilience = new NetworkResilience();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('VAL-03-016: Retry Logic', () => {
    it('should successfully execute operation on first try', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');

      const result = await networkResilience.withRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error and succeed', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET', message: 'Connection reset' })
        .mockResolvedValue('success');

      const result = await networkResilience.withRetry(mockOperation, {
        retryDelay: 10 // Short delay for testing
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should respect max retry attempts', async () => {
      const error = { code: 'ETIMEDOUT', message: 'Timeout' };
      const mockOperation = vi.fn().mockRejectedValue(error);

      await expect(
        networkResilience.withRetry(mockOperation, {
          retryAttempts: 3,
          retryDelay: 10
        })
      ).rejects.toThrow(/failed after 3 attempts/);

      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const error = new Error('Permission denied');
      const mockOperation = vi.fn().mockRejectedValue(error);

      await expect(
        networkResilience.withRetry(mockOperation)
      ).rejects.toThrow('Permission denied');

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff', async () => {
      const sleepSpy = vi.spyOn(networkResilience, 'sleep').mockResolvedValue();
      const mockOperation = vi.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockRejectedValueOnce({ code: 'ECONNRESET' })
        .mockResolvedValue('success');

      await networkResilience.withRetry(mockOperation, {
        retryDelay: 100,
        backoffMultiplier: 2,
        retryAttempts: 3
      });

      // First retry delay should be around 100ms
      expect(sleepSpy.mock.calls[0][0]).toBeGreaterThanOrEqual(100);
      expect(sleepSpy.mock.calls[0][0]).toBeLessThan(150); // With jitter

      // Second retry delay should be around 200ms (exponential)
      expect(sleepSpy.mock.calls[1][0]).toBeGreaterThanOrEqual(200);
      expect(sleepSpy.mock.calls[1][0]).toBeLessThan(300); // With jitter
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const mockOperation = vi.fn()
        .mockRejectedValueOnce({ code: 'ECONNRESET', message: 'Reset' })
        .mockResolvedValue('success');

      await networkResilience.withRetry(mockOperation, {
        retryDelay: 10,
        onRetry
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.objectContaining({
          attempt: 1,
          totalAttempts: 3
        })
      );
    });

    it('should identify retryable error codes', () => {
      expect(networkResilience.isRetryableError({ code: 'ECONNRESET' })).toBe(true);
      expect(networkResilience.isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
      expect(networkResilience.isRetryableError({ code: 'ENOTFOUND' })).toBe(true);
      expect(networkResilience.isRetryableError({ statusCode: 503 })).toBe(true);
      expect(networkResilience.isRetryableError({ statusCode: 429 })).toBe(true);
      expect(networkResilience.isRetryableError({ code: 'EPERM' })).toBe(false);
    });
  });

  describe('VAL-03-018: Proxy Handling', () => {
    it('should detect HTTP_PROXY environment variable', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080';

      const nr = new NetworkResilience();

      expect(nr.proxyConfig.httpProxy).toEqual({
        protocol: 'http',
        host: 'proxy.example.com',
        port: 8080,
        auth: null
      });
    });

    it('should detect HTTPS_PROXY environment variable', () => {
      process.env.HTTPS_PROXY = 'https://secure-proxy.example.com:443';

      const nr = new NetworkResilience();

      expect(nr.proxyConfig.httpsProxy).toEqual({
        protocol: 'https',
        host: 'secure-proxy.example.com',
        port: 443,
        auth: null
      });
    });

    it('should parse proxy authentication', () => {
      process.env.HTTP_PROXY = 'http://user:pass@proxy.example.com:8080';

      const nr = new NetworkResilience();

      expect(nr.proxyConfig.httpProxy.auth).toEqual({
        username: 'user',
        password: 'pass'
      });
    });

    it('should handle NO_PROXY list', () => {
      process.env.NO_PROXY = 'localhost,.local,*.internal.com';

      const nr = new NetworkResilience();

      expect(nr.proxyConfig.noProxy).toEqual([
        'localhost',
        '.local',
        '*.internal.com'
      ]);
    });

    it('should bypass proxy for NO_PROXY hosts', () => {
      process.env.NO_PROXY = 'localhost,.example.com,*.internal.net';

      const nr = new NetworkResilience();

      expect(nr.shouldBypassProxy('localhost')).toBe(true);
      expect(nr.shouldBypassProxy('api.example.com')).toBe(true);
      expect(nr.shouldBypassProxy('test.internal.net')).toBe(true);
      expect(nr.shouldBypassProxy('external.com')).toBe(false);
    });

    it('should detect NPM_CONFIG_PROXY fallback', () => {
      process.env.NPM_CONFIG_PROXY = 'http://npm-proxy.example.com:3128';

      const nr = new NetworkResilience();

      expect(nr.proxyConfig.httpsProxy).toEqual({
        protocol: 'http',
        host: 'npm-proxy.example.com',
        port: 3128,
        auth: null
      });
    });

    it('should get proxy options for URL', () => {
      process.env.HTTP_PROXY = 'http://proxy:8080';
      process.env.HTTPS_PROXY = 'http://proxy:8080';

      const nr = new NetworkResilience();

      const httpOptions = nr.getProxyOptions('http://example.com/api');
      expect(httpOptions).toEqual({ host: 'proxy', port: 8080 });

      const httpsOptions = nr.getProxyOptions('https://secure.com/api');
      expect(httpsOptions).toEqual({ host: 'proxy', port: 8080 });
    });
  });

  describe('VAL-03-008: Offline Mode', () => {
    it('should detect offline mode from explicit flag', () => {
      const nr = new NetworkResilience({ offlineMode: true });
      expect(nr.isOfflineMode()).toBe(true);
    });

    it('should detect offline mode from BMAD_OFFLINE env var', () => {
      process.env.BMAD_OFFLINE = 'true';
      const nr = new NetworkResilience();
      expect(nr.isOfflineMode()).toBe(true);
    });

    it('should detect offline mode from npm_config_offline', () => {
      process.env.npm_config_offline = 'true';
      const nr = new NetworkResilience();
      expect(nr.isOfflineMode()).toBe(true);
    });

    it('should enable offline mode programmatically', () => {
      const nr = new NetworkResilience();
      expect(nr.isOfflineMode()).toBe(false);

      nr.enableOfflineMode();
      expect(nr.isOfflineMode()).toBe(true);
    });

    it('should disable offline mode programmatically', () => {
      const nr = new NetworkResilience({ offlineMode: true });
      expect(nr.isOfflineMode()).toBe(true);

      nr.disableOfflineMode();
      expect(nr.isOfflineMode()).toBe(false);
    });

    it('should get configuration summary', () => {
      process.env.HTTP_PROXY = 'http://proxy:8080';

      const nr = new NetworkResilience({
        retryAttempts: 5,
        retryDelay: 2000,
        offlineMode: true
      });

      const summary = nr.getConfigSummary();

      expect(summary.retryConfig.attempts).toBe(5);
      expect(summary.retryConfig.initialDelay).toBe(2000);
      expect(summary.proxyConfig.httpProxy).toBe('proxy:8080');
      expect(summary.offlineMode).toBe(true);
    });
  });

  describe('Default Configuration', () => {
    it('should use default retry configuration', () => {
      const nr = new NetworkResilience();

      expect(nr.config.retryAttempts).toBe(3);
      expect(nr.config.retryDelay).toBe(1000);
      expect(nr.config.maxRetryDelay).toBe(30000);
      expect(nr.config.backoffMultiplier).toBe(2);
    });

    it('should allow custom configuration', () => {
      const nr = new NetworkResilience({
        retryAttempts: 5,
        retryDelay: 500,
        timeout: 60000
      });

      expect(nr.config.retryAttempts).toBe(5);
      expect(nr.config.retryDelay).toBe(500);
      expect(nr.config.timeout).toBe(60000);
    });
  });
});

describe('OfflineSupport', () => {
  let OfflineSupport;
  let isOfflineFlagSet;

  beforeEach(async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const moduleExports = require('../offline-support.js');
    OfflineSupport = moduleExports.OfflineSupport;
    isOfflineFlagSet = moduleExports.isOfflineFlagSet;
  });

  describe('isOfflineFlagSet', () => {
    it('should detect --offline in process.argv', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--offline'];

      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      // Force re-evaluation by clearing cache
      delete require.cache[require.resolve('../offline-support.js')];
      const module = require('../offline-support.js');
      expect(module.isOfflineFlagSet()).toBe(true);

      process.argv = originalArgv;
    });
  });
});
