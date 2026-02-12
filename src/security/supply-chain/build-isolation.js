/**
 * BUILD ISOLATION - Network and Environment Isolation (Story 104 - VAL-09-007)
 * Implements network isolation and environment sandboxing during builds
 *
 * Fixes:
 * - GH-104-001: DNS exfiltration during build
 * - GH-104-002: Path traversal to read sensitive files
 * - BA-104-001: Network isolation during builds
 * - SE-104-001: NIST build environment security
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { EventEmitter } = require('events');

/**
 * Isolation levels
 */
const ISOLATION_LEVELS = {
  NONE: 'none',           // No isolation (development only)
  BASIC: 'basic',         // Path restrictions only
  STANDARD: 'standard',   // Path + limited network
  STRICT: 'strict',       // Full isolation (recommended for production)
  PARANOID: 'paranoid'    // Maximum isolation (may break some builds)
};

/**
 * Sensitive paths that should never be accessible
 */
const SENSITIVE_PATHS = [
  '/etc/passwd',
  '/etc/shadow',
  '/etc/sudoers',
  '~/.ssh',
  '~/.gnupg',
  '~/.aws',
  '~/.azure',
  '~/.gcloud',
  '~/.npmrc',
  '~/.yarnrc',
  '~/.config/gh',
  '.env',
  '.env.local',
  '.env.production',
  'credentials',
  'secrets'
];

/**
 * Allowed network destinations for standard mode
 */
const ALLOWED_HOSTS = [
  'registry.npmjs.org',
  'npm.pkg.github.com',
  'registry.yarnpkg.com',
  'github.com',
  'api.github.com'
];

class BuildIsolation extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = this._mergeConfig(config);
    this.activeBuildContexts = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the build isolation system
   */
  async initialize(options = {}) {
    console.log('🔒 Initializing Build Isolation System...');

    // Check platform capabilities
    this._checkPlatformCapabilities();

    // Create sandbox directory if needed
    await this._createSandboxDir();

    this.isInitialized = true;
    console.log('✅ Build Isolation System initialized');

    this.emit('initialized', {
      isolationLevel: this.config.isolationLevel,
      platform: process.platform
    });

    return true;
  }

  /**
   * Create an isolated build context
   * @param {string} buildId - Unique build identifier
   * @param {object} options - Build options
   */
  async createBuildContext(buildId, options = {}) {
    this._ensureInitialized();

    const context = {
      buildId,
      isolationLevel: options.isolationLevel || this.config.isolationLevel,
      workDir: options.workDir || path.join(this.config.sandboxDir, buildId),
      createdAt: Date.now(),
      allowedPaths: this._getAllowedPaths(options),
      allowedHosts: options.allowedHosts || [...ALLOWED_HOSTS],
      env: this._createIsolatedEnv(options.env),
      status: 'created'
    };

    // Create work directory
    await fs.ensureDir(context.workDir);

    this.activeBuildContexts.set(buildId, context);

    console.log(`🏗️ Build context created: ${buildId}`);

    this.emit('context-created', { buildId, isolationLevel: context.isolationLevel });

    return context;
  }

  /**
   * Execute a build command in isolated context
   * @param {string} buildId - Build context ID
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @param {object} options - Execution options
   */
  async executeBuild(buildId, command, args = [], options = {}) {
    const context = this.activeBuildContexts.get(buildId);
    if (!context) {
      throw new Error(`Build context not found: ${buildId}`);
    }

    context.status = 'running';

    try {
      console.log(`🔧 Executing build: ${command} ${args.join(' ')}`);

      // Validate command and args
      this._validateCommand(command, args, context);

      // Build environment with restrictions
      const env = this._buildRestrictedEnv(context, options.env);

      // Execute with isolation
      const result = await this._executeIsolated(
        command,
        args,
        context,
        { ...options, env }
      );

      context.status = 'completed';

      this.emit('build-completed', {
        buildId,
        command,
        success: result.success,
        duration: result.duration
      });

      return result;

    } catch (error) {
      context.status = 'failed';

      this.emit('build-failed', {
        buildId,
        command,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Validate a file path is allowed
   * @param {string} filePath - Path to validate
   * @param {string} buildId - Build context ID (optional)
   */
  validatePath(filePath, buildId = null) {
    const context = buildId ? this.activeBuildContexts.get(buildId) : null;
    const allowedPaths = context?.allowedPaths || this._getAllowedPaths({});

    // Resolve to absolute path
    const resolved = path.resolve(filePath);

    // Check against sensitive paths
    for (const sensitive of SENSITIVE_PATHS) {
      const expandedSensitive = sensitive.replace('~', os.homedir());
      if (resolved.includes(expandedSensitive)) {
        return {
          allowed: false,
          reason: `Path contains sensitive location: ${sensitive}`
        };
      }
    }

    // Check path traversal
    if (filePath.includes('..')) {
      const normalized = path.normalize(filePath);
      // If normalization changes the path significantly, it's suspicious
      if (normalized !== filePath && !normalized.startsWith(process.cwd())) {
        return {
          allowed: false,
          reason: 'Path traversal detected'
        };
      }
    }

    // Check against allowed paths (if strict mode)
    if (this.config.isolationLevel === ISOLATION_LEVELS.STRICT ||
        this.config.isolationLevel === ISOLATION_LEVELS.PARANOID) {
      const isAllowed = allowedPaths.some(allowed => {
        const expandedAllowed = allowed.replace('~', os.homedir());
        return resolved.startsWith(path.resolve(expandedAllowed));
      });

      if (!isAllowed) {
        return {
          allowed: false,
          reason: 'Path not in allowed list',
          allowedPaths
        };
      }
    }

    return { allowed: true, resolved };
  }

  /**
   * Check if a network host is allowed
   */
  isHostAllowed(hostname, buildId = null) {
    const context = buildId ? this.activeBuildContexts.get(buildId) : null;
    const allowedHosts = context?.allowedHosts || ALLOWED_HOSTS;

    // In strict/paranoid mode, only allow listed hosts
    if (this.config.isolationLevel === ISOLATION_LEVELS.STRICT ||
        this.config.isolationLevel === ISOLATION_LEVELS.PARANOID) {
      return allowedHosts.some(allowed => {
        if (allowed.startsWith('*.')) {
          return hostname.endsWith(allowed.slice(1));
        }
        return hostname === allowed || hostname.endsWith(`.${  allowed}`);
      });
    }

    // In standard mode, block known bad hosts
    const blockedHosts = [
      'localhost', '127.0.0.1', '0.0.0.0',
      'metadata.google.internal', // Cloud metadata
      '169.254.169.254'           // AWS/Azure metadata
    ];

    return !blockedHosts.includes(hostname);
  }

  /**
   * Destroy a build context
   */
  async destroyBuildContext(buildId) {
    const context = this.activeBuildContexts.get(buildId);
    if (!context) {
      return false;
    }

    try {
      // Clean up work directory
      if (await fs.pathExists(context.workDir)) {
        await fs.remove(context.workDir);
      }

      this.activeBuildContexts.delete(buildId);

      console.log(`🗑️ Build context destroyed: ${buildId}`);

      this.emit('context-destroyed', { buildId });

      return true;

    } catch (error) {
      console.error(`Failed to destroy context ${buildId}:`, error.message);
      return false;
    }
  }

  /**
   * Get build context statistics
   */
  getStatistics() {
    return {
      activeContexts: this.activeBuildContexts.size,
      isolationLevel: this.config.isolationLevel,
      platform: process.platform,
      sandboxDir: this.config.sandboxDir
    };
  }

  // Private methods

  _mergeConfig(userConfig) {
    return {
      isolationLevel: ISOLATION_LEVELS.STANDARD,
      sandboxDir: path.join(os.tmpdir(), 'bmad-build-sandbox'),
      timeout: 300000, // 5 minutes
      maxMemory: 2 * 1024 * 1024 * 1024, // 2GB
      ...userConfig
    };
  }

  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Build isolation system not initialized');
    }
  }

  _checkPlatformCapabilities() {
    // Check for Linux namespace support (for full isolation)
    if (process.platform === 'linux') {
      try {
        const result = require('child_process').execSync('unshare --version', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        this.hasNamespaceSupport = true;
      } catch {
        this.hasNamespaceSupport = false;
      }
    }

    // Check for Docker support
    try {
      require('child_process').execSync('docker --version', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      this.hasDockerSupport = true;
    } catch {
      this.hasDockerSupport = false;
    }

    console.log(`Platform capabilities: namespaces=${this.hasNamespaceSupport}, docker=${this.hasDockerSupport}`);
  }

  async _createSandboxDir() {
    await fs.ensureDir(this.config.sandboxDir);

    // Set restrictive permissions
    if (process.platform !== 'win32') {
      await fs.chmod(this.config.sandboxDir, 0o700);
    }
  }

  _getAllowedPaths(options) {
    const basePaths = [
      process.cwd(),
      os.tmpdir(),
      options.workDir || this.config.sandboxDir
    ];

    // Add node_modules for package resolution
    if (this.config.isolationLevel !== ISOLATION_LEVELS.PARANOID) {
      basePaths.push(
        path.join(process.cwd(), 'node_modules'),
        '/usr/local/lib/node_modules'
      );
    }

    return [...basePaths, ...(options.additionalPaths || [])];
  }

  _createIsolatedEnv(customEnv = {}) {
    const safeEnv = {};

    // Only copy safe environment variables
    const safeVars = [
      'PATH', 'NODE_ENV', 'HOME', 'USER', 'LANG', 'LC_ALL',
      'TERM', 'SHELL', 'NODE_PATH', 'NPM_CONFIG_CACHE'
    ];

    for (const varName of safeVars) {
      if (process.env[varName]) {
        safeEnv[varName] = process.env[varName];
      }
    }

    // Block network access in strict mode
    if (this.config.isolationLevel === ISOLATION_LEVELS.STRICT ||
        this.config.isolationLevel === ISOLATION_LEVELS.PARANOID) {
      safeEnv.http_proxy = 'http://localhost:0';
      safeEnv.https_proxy = 'http://localhost:0';
      safeEnv.no_proxy = '';
    }

    // Merge custom env (but filter sensitive vars)
    const sensitivePatterns = [
      /TOKEN/i, /SECRET/i, /KEY/i, /PASSWORD/i,
      /CREDENTIAL/i, /AUTH/i
    ];

    for (const [key, value] of Object.entries(customEnv)) {
      const isSensitive = sensitivePatterns.some(p => p.test(key));
      if (!isSensitive) {
        safeEnv[key] = value;
      }
    }

    return safeEnv;
  }

  _buildRestrictedEnv(context, customEnv = {}) {
    return {
      ...context.env,
      ...customEnv,
      BMAD_BUILD_ID: context.buildId,
      BMAD_ISOLATION_LEVEL: context.isolationLevel
    };
  }

  _validateCommand(command, args, context) {
    // Validate command doesn't contain dangerous patterns
    const dangerousPatterns = [
      /\bsudo\b/i,
      /\bcurl\b.*\|\s*sh/i,
      /\bwget\b.*\|\s*sh/i,
      /\beval\b/,
      /\bexec\b/
    ];

    const fullCommand = `${command} ${args.join(' ')}`;

    for (const pattern of dangerousPatterns) {
      if (pattern.test(fullCommand)) {
        throw new Error(`Dangerous command pattern detected: ${pattern}`);
      }
    }

    // Validate all path arguments
    for (const arg of args) {
      if (arg.startsWith('/') || arg.includes('..')) {
        const validation = this.validatePath(arg, context.buildId);
        if (!validation.allowed) {
          throw new Error(`Path not allowed: ${arg} - ${validation.reason}`);
        }
      }
    }
  }

  async _executeIsolated(command, args, context, options) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      // Configure spawn options
      const spawnOptions = {
        cwd: options.cwd || context.workDir,
        env: options.env,
        shell: false, // NEVER use shell
        timeout: options.timeout || this.config.timeout,
        stdio: options.stdio || ['pipe', 'pipe', 'pipe']
      };

      // On Linux, use unshare for network isolation if available
      let actualCommand = command;
      let actualArgs = args;

      if (this.hasNamespaceSupport &&
          (context.isolationLevel === ISOLATION_LEVELS.STRICT ||
           context.isolationLevel === ISOLATION_LEVELS.PARANOID)) {
        actualCommand = 'unshare';
        actualArgs = ['--net', '--', command, ...args];
      }

      const child = spawn(actualCommand, actualArgs, spawnOptions);

      let stdout = '';
      let stderr = '';

      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code, signal) => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          resolve({
            success: true,
            code,
            stdout,
            stderr,
            duration
          });
        } else {
          resolve({
            success: false,
            code,
            signal,
            stdout,
            stderr,
            duration
          });
        }
      });

      // Handle timeout
      if (options.timeout) {
        setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error(`Build timeout after ${options.timeout}ms`));
        }, options.timeout);
      }
    });
  }
}

// Export constants
BuildIsolation.ISOLATION_LEVELS = ISOLATION_LEVELS;
BuildIsolation.SENSITIVE_PATHS = SENSITIVE_PATHS;
BuildIsolation.ALLOWED_HOSTS = ALLOWED_HOSTS;

module.exports = BuildIsolation;
