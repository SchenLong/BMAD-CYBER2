/**
 * SAFE CLI - Shell Injection Prevention (Story 110 - VAL-11-001)
 * Implements secure command execution without shell interpretation
 *
 * Fixes:
 * - GH-110-001: Shell injection via CLI arguments
 * - GH-110-002: Environment variable leakage
 * - BA-110-001: shell:true in spawn() calls
 * - SE-110-001: NIST input validation requirements
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const { spawn, execFile } = require('child_process');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Dangerous shell metacharacters that indicate injection attempts
 */
const DANGEROUS_CHARS = [
  ';', '|', '&', '$', '`', '>', '<', '\n', '\r',
  '(', ')', '{', '}', '[', ']', '!', '\\',
  '"', "'", '*', '?', '~', '#'
];

/**
 * Allowed commands (whitelist)
 */
const ALLOWED_COMMANDS = [
  'npm', 'npx', 'node', 'git', 'tar', 'gzip', 'gunzip',
  'mkdir', 'rm', 'cp', 'mv', 'chmod', 'ls', 'cat', 'echo',
  'curl', 'wget', 'sha256sum', 'md5sum'
];

/**
 * Environment variables that should never be exposed
 */
const SENSITIVE_ENV_VARS = [
  'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'NPM_TOKEN', 'NODE_AUTH_TOKEN', 'GITHUB_TOKEN',
  'DATABASE_URL', 'DATABASE_PASSWORD', 'DB_PASSWORD',
  'API_KEY', 'API_SECRET', 'SECRET_KEY', 'PRIVATE_KEY',
  'PASSWORD', 'PASSWD', 'CREDENTIALS',
  'ENCRYPTION_KEY', 'SIGNING_KEY', 'JWT_SECRET'
];

class SafeCLI extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = this._mergeConfig(config);
    this.executionLog = [];
    this.blockedExecutions = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the safe CLI executor
   */
  async initialize(options = {}) {
    console.log('🔐 Initializing Safe CLI Executor...');

    // Load allowed commands
    if (options.additionalCommands) {
      this.config.allowedCommands.push(...options.additionalCommands);
    }

    this.isInitialized = true;
    console.log('✅ Safe CLI Executor initialized');

    this.emit('initialized', {
      allowedCommands: this.config.allowedCommands.length
    });

    return true;
  }

  /**
   * Execute a command safely without shell interpretation
   * @param {string} command - The command to execute
   * @param {string[]} args - Array of arguments (NOT a string!)
   * @param {object} options - Execution options
   * @returns {Promise<object>} Execution result
   */
  async execute(command, args = [], options = {}) {
    const executionId = Date.now().toString(36) + Math.random().toString(36).slice(2);

    try {
      // 1. Validate command
      const commandValidation = this._validateCommand(command);
      if (!commandValidation.valid) {
        return this._handleBlockedExecution(executionId, command, args, commandValidation.reason);
      }

      // 2. Validate arguments (must be array, never string)
      if (!Array.isArray(args)) {
        return this._handleBlockedExecution(executionId, command, args, 'Arguments must be an array');
      }

      // 3. Sanitize and validate each argument
      const sanitizedArgs = [];
      for (const arg of args) {
        const validation = this._validateArgument(arg);
        if (!validation.valid) {
          return this._handleBlockedExecution(
            executionId, command, args,
            `Dangerous argument: ${validation.reason}`
          );
        }
        sanitizedArgs.push(validation.sanitized);
      }

      // 4. Create safe environment (filter sensitive vars)
      const safeEnv = this._createSafeEnvironment(options.env);

      // 5. Resolve command path
      const commandPath = this._resolveCommandPath(command);

      console.log(`🔧 Executing: ${command} ${sanitizedArgs.join(' ')}`);

      // 6. Execute using execFile (NOT spawn with shell: true)
      const result = await this._executeSecure(
        commandPath,
        sanitizedArgs,
        {
          ...options,
          env: safeEnv,
          shell: false,  // CRITICAL: Never use shell
          timeout: options.timeout || this.config.defaultTimeout
        }
      );

      // 7. Log successful execution
      this._logExecution(executionId, command, sanitizedArgs, result, true);

      return {
        success: true,
        executionId,
        command,
        args: sanitizedArgs,
        ...result
      };

    } catch (error) {
      this._logExecution(executionId, command, args, { error: error.message }, false);

      return {
        success: false,
        executionId,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Execute npm command safely
   */
  async npm(args, options = {}) {
    return this.execute('npm', args, options);
  }

  /**
   * Execute npx command safely
   */
  async npx(args, options = {}) {
    return this.execute('npx', args, options);
  }

  /**
   * Execute node command safely
   */
  async node(args, options = {}) {
    return this.execute('node', args, options);
  }

  /**
   * Execute git command safely
   */
  async git(args, options = {}) {
    return this.execute('git', args, options);
  }

  /**
   * Validate a command string (for user input validation)
   */
  validateCommand(command) {
    return this._validateCommand(command);
  }

  /**
   * Validate an argument (for user input validation)
   */
  validateArgument(arg) {
    return this._validateArgument(arg);
  }

  /**
   * Get execution statistics
   */
  getStatistics() {
    return {
      totalExecutions: this.executionLog.length,
      blockedExecutions: this.blockedExecutions.length,
      allowedCommands: this.config.allowedCommands.length
    };
  }

  /**
   * Get blocked execution log
   */
  getBlockedExecutions() {
    return [...this.blockedExecutions];
  }

  // Private methods

  _mergeConfig(userConfig) {
    return {
      allowedCommands: [...ALLOWED_COMMANDS],
      strictMode: true,
      defaultTimeout: 60000,    // 1 minute
      maxArgumentLength: 4096,
      logExecutions: true,
      ...userConfig
    };
  }

  _validateCommand(command) {
    // Check if command is a string
    if (typeof command !== 'string') {
      return { valid: false, reason: 'Command must be a string' };
    }

    // Check for empty command
    if (!command.trim()) {
      return { valid: false, reason: 'Command cannot be empty' };
    }

    // Check for path traversal in command
    if (command.includes('..') || command.includes('/')) {
      // If it's a full path, extract just the command name
      const cmdName = path.basename(command);
      command = cmdName;
    }

    // Check against whitelist
    if (this.config.strictMode && !this.config.allowedCommands.includes(command)) {
      return {
        valid: false,
        reason: `Command not in allowed list: ${command}`,
        allowedCommands: this.config.allowedCommands
      };
    }

    // Check for dangerous characters in command name
    for (const char of DANGEROUS_CHARS) {
      if (command.includes(char)) {
        return {
          valid: false,
          reason: `Dangerous character in command: ${char}`
        };
      }
    }

    return { valid: true, command };
  }

  _validateArgument(arg) {
    // Argument must be a string
    if (typeof arg !== 'string') {
      // Convert numbers, but reject objects/arrays
      if (typeof arg === 'number') {
        return { valid: true, sanitized: String(arg) };
      }
      return { valid: false, reason: `Invalid argument type: ${typeof arg}` };
    }

    // Check length
    if (arg.length > this.config.maxArgumentLength) {
      return { valid: false, reason: 'Argument too long' };
    }

    // Check for shell metacharacters that indicate injection
    const foundDangerous = [];
    for (const char of DANGEROUS_CHARS) {
      if (arg.includes(char)) {
        foundDangerous.push(char);
      }
    }

    if (foundDangerous.length > 0) {
      // Check if it's a legitimate use (e.g., file path with spaces)
      if (this._isLikelyLegitimate(arg, foundDangerous)) {
        // Sanitize but allow
        return {
          valid: true,
          sanitized: arg,
          warning: 'Contains special characters but appears legitimate'
        };
      }

      return {
        valid: false,
        reason: `Shell metacharacters detected: ${foundDangerous.join(', ')}`,
        characters: foundDangerous
      };
    }

    // Check for null bytes
    if (arg.includes('\0')) {
      return { valid: false, reason: 'Null byte in argument' };
    }

    // Check for common injection patterns
    const injectionPatterns = [
      /\$\(.*\)/,           // $(command)
      /`.*`/,               // `command`
      /\|\s*\w+/,           // | command
      /;\s*\w+/,            // ; command
      /&&\s*\w+/,           // && command
      /\|\|\s*\w+/,         // || command
      />\s*\/\w+/,          // > /file (redirect)
      /<\s*\/\w+/,          // < /file (input redirect)
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(arg)) {
        return {
          valid: false,
          reason: 'Injection pattern detected',
          pattern: pattern.toString()
        };
      }
    }

    return { valid: true, sanitized: arg };
  }

  _isLikelyLegitimate(arg, dangerousChars) {
    // File paths can contain some special characters legitimately
    if (dangerousChars.length === 1) {
      const char = dangerousChars[0];

      // Quoted strings are somewhat common
      if ((char === '"' || char === "'") && this._isBalancedQuotes(arg, char)) {
        return true;
      }

      // Single dash for flags
      if (char === '-' && arg.startsWith('-')) {
        return true;
      }
    }

    // URLs can have special characters
    if (arg.startsWith('http://') || arg.startsWith('https://')) {
      return true;
    }

    return false;
  }

  _isBalancedQuotes(str, quote) {
    let count = 0;
    for (const char of str) {
      if (char === quote) count++;
    }
    return count % 2 === 0;
  }

  _createSafeEnvironment(customEnv = {}) {
    const safeEnv = { ...process.env, ...customEnv };

    // Remove sensitive environment variables
    for (const key of Object.keys(safeEnv)) {
      const upperKey = key.toUpperCase();

      // Check against sensitive var list
      if (SENSITIVE_ENV_VARS.some(sensitive => upperKey.includes(sensitive))) {
        delete safeEnv[key];
        continue;
      }

      // Also remove anything that looks like a secret
      if (upperKey.includes('SECRET') ||
          upperKey.includes('TOKEN') ||
          upperKey.includes('KEY') ||
          upperKey.includes('PASSWORD') ||
          upperKey.includes('CREDENTIAL')) {
        delete safeEnv[key];
      }
    }

    return safeEnv;
  }

  _resolveCommandPath(command) {
    // For security, we don't resolve paths ourselves
    // Let the system find the command in PATH
    return command;
  }

  _executeSecure(command, args, options) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const stdout = '';
      const stderr = '';

      // Use execFile which doesn't use shell
      const child = execFile(command, args, {
        cwd: options.cwd,
        env: options.env,
        timeout: options.timeout,
        maxBuffer: options.maxBuffer || 10 * 1024 * 1024, // 10MB
        shell: false  // CRITICAL: Never use shell
      }, (error, stdoutData, stderrData) => {
        const duration = Date.now() - startTime;

        if (error) {
          // Check for specific error types
          if (error.killed) {
            reject(new Error(`Process killed (timeout or signal): ${command}`));
          } else if (error.code === 'ENOENT') {
            reject(new Error(`Command not found: ${command}`));
          } else {
            const err = new Error(error.message);
            err.code = error.code;
            err.signal = error.signal;
            reject(err);
          }
          return;
        }

        resolve({
          stdout: stdoutData,
          stderr: stderrData,
          duration,
          exitCode: 0
        });
      });

      // Handle process events
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  _handleBlockedExecution(executionId, command, args, reason) {
    console.warn(`🚫 Blocked execution: ${command}`);
    console.warn(`   Reason: ${reason}`);

    const record = {
      executionId,
      command,
      args: Array.isArray(args) ? args.slice(0, 10) : '[invalid]',
      reason,
      timestamp: new Date().toISOString()
    };

    this.blockedExecutions.push(record);

    // Limit blocked log size
    if (this.blockedExecutions.length > 100) {
      this.blockedExecutions = this.blockedExecutions.slice(-100);
    }

    this.emit('execution-blocked', record);

    return {
      success: false,
      blocked: true,
      executionId,
      reason
    };
  }

  _logExecution(executionId, command, args, result, success) {
    if (!this.config.logExecutions) return;

    this.executionLog.push({
      executionId,
      command,
      args: args.slice(0, 10), // Limit logged args
      success,
      duration: result.duration,
      timestamp: new Date().toISOString()
    });

    // Limit log size
    if (this.executionLog.length > 1000) {
      this.executionLog = this.executionLog.slice(-1000);
    }
  }
}

// Export constants
SafeCLI.DANGEROUS_CHARS = DANGEROUS_CHARS;
SafeCLI.ALLOWED_COMMANDS = ALLOWED_COMMANDS;
SafeCLI.SENSITIVE_ENV_VARS = SENSITIVE_ENV_VARS;

module.exports = SafeCLI;
