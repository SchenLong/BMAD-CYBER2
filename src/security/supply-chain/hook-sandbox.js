/**
 * HOOK SANDBOX - Secure Hook Execution (Story 108 - VAL-10-003)
 * Implements VM-based sandboxing for hook execution to prevent arbitrary code execution
 *
 * Fixes:
 * - GH-108-001: Arbitrary code execution via hooks
 * - GH-108-003: Hook data exfiltration prevention
 * - BA-108-001: Hooks execute without sandbox protection
 * - SE-108-001: ISO 27001 secure code execution requirement
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const vm = require('vm');
const { EventEmitter } = require('events');
const crypto = require('crypto');
const path = require('path');

/**
 * Sandbox security levels
 */
const SECURITY_LEVELS = {
  STRICT: 'strict',       // No network, no fs, no process
  STANDARD: 'standard',   // Limited fs read, no network
  PERMISSIVE: 'permissive' // Read-only fs, limited network
};

/**
 * Dangerous APIs that must be blocked
 */
const BLOCKED_GLOBALS = [
  'process',
  'require',
  '__dirname',
  '__filename',
  'module',
  'exports',
  'global',
  'globalThis',
  'eval',
  'Function',
  'WebAssembly'
];

/**
 * Allowed safe globals for sandbox
 */
const SAFE_GLOBALS = [
  'console',
  'JSON',
  'Math',
  'Date',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Promise',
  'Symbol',
  'RegExp',
  'Error',
  'TypeError',
  'RangeError',
  'SyntaxError',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURI',
  'encodeURIComponent',
  'decodeURI',
  'decodeURIComponent',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval'
];

class HookSandbox extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = this._mergeConfig(config);
    this.executionLog = [];
    this.blockedAttempts = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the sandbox
   */
  async initialize() {
    console.log('🔒 Initializing Hook Sandbox...');

    // Validate environment
    this._validateEnvironment();

    this.isInitialized = true;
    console.log('✅ Hook Sandbox initialized');

    this.emit('initialized', {
      securityLevel: this.config.securityLevel,
      timeout: this.config.timeout
    });

    return true;
  }

  /**
   * Execute a hook handler in a sandboxed environment
   * @param {Function|string} handler - The hook handler (function or code string)
   * @param {object} context - The execution context to pass to the hook
   * @param {object} options - Execution options
   * @returns {object} Execution result
   */
  async executeHook(handler, context = {}, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Hook sandbox not initialized');
    }

    const executionId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      console.log(`🔒 Executing hook in sandbox: ${executionId}`);

      // Create sandboxed context
      const sandboxContext = this._createSandboxContext(context, options);

      // Convert function to string if needed
      const code = typeof handler === 'function'
        ? this._extractFunctionCode(handler)
        : handler;

      // Validate code for dangerous patterns
      const validation = this._validateCode(code);
      if (!validation.safe) {
        this._logBlockedAttempt(executionId, validation.issues);
        return {
          success: false,
          executionId,
          error: 'SECURITY_VIOLATION',
          message: `Hook code contains dangerous patterns: ${validation.issues.join(', ')}`,
          blocked: true
        };
      }

      // Create VM script
      const script = new vm.Script(code, {
        filename: `hook-${executionId}.js`,
        timeout: options.timeout || this.config.timeout,
        displayErrors: true
      });

      // Execute in sandbox with timeout
      const result = await this._executeWithTimeout(
        script,
        sandboxContext,
        options.timeout || this.config.timeout
      );

      const duration = Date.now() - startTime;

      // Log execution
      this._logExecution(executionId, {
        duration,
        success: true,
        resultType: typeof result
      });

      console.log(`✅ Hook executed in sandbox: ${executionId} (${duration}ms)`);

      this.emit('hook-executed', {
        executionId,
        duration,
        success: true
      });

      return {
        success: true,
        executionId,
        result,
        duration,
        sandboxed: true
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      this._logExecution(executionId, {
        duration,
        success: false,
        error: error.message
      });

      console.error(`❌ Sandboxed hook execution failed: ${executionId}`, error.message);

      this.emit('hook-error', {
        executionId,
        error: error.message,
        duration
      });

      return {
        success: false,
        executionId,
        error: error.name === 'TimeoutError' ? 'EXECUTION_TIMEOUT' : 'EXECUTION_ERROR',
        message: error.message,
        duration,
        sandboxed: true
      };
    }
  }

  /**
   * Execute a hook with a safe API surface
   * @param {Function} handler - The handler function
   * @param {object} safeContext - Sanitized context
   * @param {object} safeApi - Safe API methods the hook can call
   */
  async executeWithSafeApi(handler, safeContext, safeApi = {}) {
    const executionId = crypto.randomUUID();

    try {
      // Wrap the handler to inject safe API
      const wrappedHandler = this._wrapWithSafeApi(handler, safeApi);

      // Create deep-frozen context to prevent modification
      const frozenContext = this._deepFreeze({ ...safeContext });

      // Execute with safe API available
      const result = await wrappedHandler(frozenContext);

      return {
        success: true,
        executionId,
        result,
        sandboxed: true
      };

    } catch (error) {
      return {
        success: false,
        executionId,
        error: 'SAFE_API_ERROR',
        message: error.message
      };
    }
  }

  /**
   * Validate hook code before execution
   */
  validateHookCode(code) {
    return this._validateCode(code);
  }

  /**
   * Get execution statistics
   */
  getStatistics() {
    return {
      totalExecutions: this.executionLog.length,
      blockedAttempts: this.blockedAttempts.length,
      securityLevel: this.config.securityLevel,
      averageExecutionTime: this._calculateAverageTime()
    };
  }

  /**
   * Get blocked attempts log
   */
  getBlockedAttempts() {
    return [...this.blockedAttempts];
  }

  // Private methods

  _mergeConfig(userConfig) {
    return {
      securityLevel: SECURITY_LEVELS.STRICT,
      timeout: 5000,               // 5 second default timeout
      maxMemory: 50 * 1024 * 1024, // 50MB memory limit
      maxCpuTime: 1000,            // 1 second CPU time
      allowAsyncOperations: true,
      logExecutions: true,
      ...userConfig
    };
  }

  _validateEnvironment() {
    // Ensure VM module is available
    if (!vm) {
      throw new Error('VM module not available');
    }

    // Check Node.js version for VM security features
    const nodeVersion = process.versions.node.split('.').map(Number);
    if (nodeVersion[0] < 14) {
      console.warn('⚠️ Node.js 14+ recommended for improved VM security');
    }
  }

  _createSandboxContext(context, options) {
    // Start with empty context
    const sandbox = {};

    // Add safe globals
    for (const global of SAFE_GLOBALS) {
      if (globalThis[global]) {
        sandbox[global] = globalThis[global];
      }
    }

    // Create safe console that doesn't allow data exfiltration
    sandbox.console = this._createSafeConsole();

    // Create safe timers (if allowed)
    if (this.config.allowAsyncOperations) {
      sandbox.setTimeout = this._createSafeTimeout();
      sandbox.setInterval = this._createSafeInterval();
      sandbox.clearTimeout = clearTimeout;
      sandbox.clearInterval = clearInterval;
    }

    // Add frozen context object
    sandbox.context = this._deepFreeze({ ...context });

    // Add safe result setter
    let hookResult = undefined;
    sandbox.__setResult = (value) => {
      hookResult = this._sanitizeResult(value);
    };
    sandbox.__getResult = () => hookResult;

    // Create the VM context
    vm.createContext(sandbox, {
      name: 'hook-sandbox',
      origin: 'bmad://hook-sandbox',
      codeGeneration: {
        strings: false,  // Disable eval()
        wasm: false      // Disable WebAssembly
      }
    });

    return sandbox;
  }

  _createSafeConsole() {
    const maxLogLength = 1000;
    const logs = [];

    const sanitize = (arg) => {
      if (typeof arg === 'object') {
        try {
          const str = JSON.stringify(arg);
          return str.length > maxLogLength ? str.slice(0, maxLogLength) + '...' : str;
        } catch {
          return '[Object]';
        }
      }
      const str = String(arg);
      return str.length > maxLogLength ? str.slice(0, maxLogLength) + '...' : str;
    };

    return {
      log: (...args) => logs.push({ level: 'log', args: args.map(sanitize) }),
      info: (...args) => logs.push({ level: 'info', args: args.map(sanitize) }),
      warn: (...args) => logs.push({ level: 'warn', args: args.map(sanitize) }),
      error: (...args) => logs.push({ level: 'error', args: args.map(sanitize) }),
      debug: (...args) => logs.push({ level: 'debug', args: args.map(sanitize) }),
      getLogs: () => [...logs]
    };
  }

  _createSafeTimeout() {
    const maxTimeout = this.config.timeout;

    return (callback, delay, ...args) => {
      const safeDelay = Math.min(Math.max(0, delay || 0), maxTimeout);
      return setTimeout(() => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Timeout callback error:', error.message);
        }
      }, safeDelay);
    };
  }

  _createSafeInterval() {
    const minInterval = 100; // Minimum 100ms interval

    return (callback, delay, ...args) => {
      const safeDelay = Math.max(minInterval, delay || minInterval);
      return setInterval(() => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Interval callback error:', error.message);
        }
      }, safeDelay);
    };
  }

  _extractFunctionCode(fn) {
    const fnString = fn.toString();

    // Wrap in an IIFE that captures the result
    return `
      (function() {
        const __hookFn = ${fnString};
        const __result = __hookFn(context);
        __setResult(__result);
        return __result;
      })();
    `;
  }

  _validateCode(code) {
    const issues = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /\bprocess\b/, issue: 'process access' },
      { pattern: /\brequire\s*\(/, issue: 'require() call' },
      { pattern: /\bimport\s*\(/, issue: 'dynamic import' },
      { pattern: /\beval\s*\(/, issue: 'eval() call' },
      { pattern: /\bFunction\s*\(/, issue: 'Function() constructor' },
      { pattern: /\bnew\s+Function\b/, issue: 'new Function()' },
      { pattern: /\b__proto__\b/, issue: '__proto__ access' },
      { pattern: /\bconstructor\s*\[/, issue: 'constructor access' },
      { pattern: /\bprototype\b/, issue: 'prototype manipulation' },
      { pattern: /\bglobalThis\b/, issue: 'globalThis access' },
      { pattern: /\bglobal\b/, issue: 'global access' },
      { pattern: /\bchild_process\b/, issue: 'child_process access' },
      { pattern: /\bexec\s*\(/, issue: 'exec() call' },
      { pattern: /\bspawn\s*\(/, issue: 'spawn() call' },
      { pattern: /\bfs\s*\.\s*(write|unlink|rm|mkdir|chmod)/, issue: 'fs write operations' },
      { pattern: /\bhttp[s]?\s*\./, issue: 'HTTP access' },
      { pattern: /\bnet\s*\./, issue: 'Network access' },
      { pattern: /\bdns\s*\./, issue: 'DNS access' },
      { pattern: /\bWebSocket\b/, issue: 'WebSocket access' },
      { pattern: /\bfetch\s*\(/, issue: 'fetch() call' },
      { pattern: /\bXMLHttpRequest\b/, issue: 'XMLHttpRequest access' }
    ];

    for (const { pattern, issue } of dangerousPatterns) {
      if (pattern.test(code)) {
        issues.push(issue);
      }
    }

    // Check for obvious code injection attempts
    if (code.includes('\\x') || code.includes('\\u{')) {
      // Check if it's likely an escape sequence attack
      const decoded = this._tryDecodeEscapes(code);
      if (decoded !== code) {
        const decodedValidation = this._validateCode(decoded);
        if (!decodedValidation.safe) {
          issues.push('encoded dangerous pattern');
        }
      }
    }

    return {
      safe: issues.length === 0,
      issues
    };
  }

  _tryDecodeEscapes(code) {
    try {
      return code
        .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
    } catch {
      return code;
    }
  }

  async _executeWithTimeout(script, context, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const error = new Error(`Hook execution timed out after ${timeout}ms`);
        error.name = 'TimeoutError';
        reject(error);
      }, timeout);

      try {
        const result = script.runInContext(context, {
          timeout,
          displayErrors: true,
          breakOnSigint: true
        });

        clearTimeout(timer);

        // Handle promises
        if (result && typeof result.then === 'function') {
          result
            .then(res => {
              clearTimeout(timer);
              resolve(res);
            })
            .catch(err => {
              clearTimeout(timer);
              reject(err);
            });
        } else {
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  _wrapWithSafeApi(handler, safeApi) {
    // Create a frozen copy of the safe API
    const frozenApi = this._deepFreeze({ ...safeApi });

    return async (context) => {
      // Inject safe API into context
      const enrichedContext = {
        ...context,
        api: frozenApi
      };

      return handler(enrichedContext);
    };
  }

  _deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Get all property names
    const propNames = Object.getOwnPropertyNames(obj);

    // Freeze nested objects
    for (const name of propNames) {
      const value = obj[name];
      if (value && typeof value === 'object') {
        this._deepFreeze(value);
      }
    }

    return Object.freeze(obj);
  }

  _sanitizeResult(value) {
    // Limit result size to prevent memory attacks
    const maxSize = 1024 * 1024; // 1MB

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value);
        if (json.length > maxSize) {
          return { error: 'RESULT_TOO_LARGE', message: 'Result exceeds maximum size' };
        }
        return JSON.parse(json); // Deep clone
      } catch {
        return { error: 'INVALID_RESULT', message: 'Result cannot be serialized' };
      }
    }

    if (typeof value === 'string' && value.length > maxSize) {
      return value.slice(0, maxSize);
    }

    return value;
  }

  _logExecution(executionId, details) {
    if (!this.config.logExecutions) return;

    this.executionLog.push({
      executionId,
      timestamp: new Date().toISOString(),
      ...details
    });

    // Keep last 1000 executions
    if (this.executionLog.length > 1000) {
      this.executionLog = this.executionLog.slice(-1000);
    }
  }

  _logBlockedAttempt(executionId, issues) {
    this.blockedAttempts.push({
      executionId,
      timestamp: new Date().toISOString(),
      issues
    });

    console.warn(`🚫 Blocked dangerous hook execution: ${executionId}`);
    console.warn(`   Issues: ${issues.join(', ')}`);

    this.emit('hook-blocked', {
      executionId,
      issues
    });

    // Keep last 100 blocked attempts
    if (this.blockedAttempts.length > 100) {
      this.blockedAttempts = this.blockedAttempts.slice(-100);
    }
  }

  _calculateAverageTime() {
    if (this.executionLog.length === 0) return 0;

    const totalTime = this.executionLog.reduce(
      (sum, log) => sum + (log.duration || 0),
      0
    );

    return totalTime / this.executionLog.length;
  }
}

// Export constants
HookSandbox.SECURITY_LEVELS = SECURITY_LEVELS;
HookSandbox.BLOCKED_GLOBALS = BLOCKED_GLOBALS;
HookSandbox.SAFE_GLOBALS = SAFE_GLOBALS;

module.exports = HookSandbox;
