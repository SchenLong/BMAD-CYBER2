/**
 * BMAD Multi-Language Coordinator - Epic 5.1
 * Coordinates builds across TypeScript, JavaScript, Python, and other languages.
 *
 * @module MultiLanguageCoordinator
 * @version 1.0.0
 */

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const { spawn, exec } = require('child_process');
const os = require('os');

/**
 * Supported languages enumeration
 */
const SupportedLanguages = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  GO: 'go',
  RUST: 'rust',
  JAVA: 'java',
  CSHARP: 'csharp',
  CPP: 'cpp',
  SHELL: 'shell'
};

/**
 * Language configuration defaults
 */
const LanguageDefaults = {
  typescript: {
    extensions: ['.ts', '.tsx'],
    configFiles: ['tsconfig.json'],
    buildCommands: {
      default: 'npx tsc',
      npm: 'npm run build',
      yarn: 'yarn build',
      pnpm: 'pnpm build'
    },
    packageManagers: ['npm', 'yarn', 'pnpm'],
    runtimeCheck: 'node --version',
    compilerCheck: 'npx tsc --version',
    outputExtensions: ['.js', '.d.ts', '.js.map']
  },
  javascript: {
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    configFiles: ['package.json', '.babelrc', 'babel.config.js'],
    buildCommands: {
      default: 'npm run build',
      npm: 'npm run build',
      yarn: 'yarn build',
      pnpm: 'pnpm build'
    },
    packageManagers: ['npm', 'yarn', 'pnpm'],
    runtimeCheck: 'node --version',
    outputExtensions: ['.js', '.mjs']
  },
  python: {
    extensions: ['.py', '.pyw', '.pyx'],
    configFiles: ['setup.py', 'pyproject.toml', 'setup.cfg', 'requirements.txt'],
    buildCommands: {
      default: 'python -m build',
      pip: 'pip install -e .',
      poetry: 'poetry build',
      setuptools: 'python setup.py build'
    },
    packageManagers: ['pip', 'poetry', 'conda', 'pipenv'],
    runtimeCheck: 'python --version',
    outputExtensions: ['.pyc', '.pyo', '.whl', '.egg']
  },
  go: {
    extensions: ['.go'],
    configFiles: ['go.mod', 'go.sum'],
    buildCommands: {
      default: 'go build',
      test: 'go test ./...',
      install: 'go install'
    },
    packageManagers: ['go'],
    runtimeCheck: 'go version',
    outputExtensions: ['', '.exe']
  },
  rust: {
    extensions: ['.rs'],
    configFiles: ['Cargo.toml', 'Cargo.lock'],
    buildCommands: {
      default: 'cargo build --release',
      debug: 'cargo build',
      test: 'cargo test'
    },
    packageManagers: ['cargo'],
    runtimeCheck: 'rustc --version',
    outputExtensions: ['', '.exe', '.rlib', '.so', '.dylib']
  },
  java: {
    extensions: ['.java'],
    configFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    buildCommands: {
      maven: 'mvn package',
      gradle: './gradlew build',
      default: 'javac'
    },
    packageManagers: ['maven', 'gradle'],
    runtimeCheck: 'java -version',
    compilerCheck: 'javac -version',
    outputExtensions: ['.class', '.jar', '.war']
  },
  csharp: {
    extensions: ['.cs'],
    configFiles: ['*.csproj', '*.sln'],
    buildCommands: {
      default: 'dotnet build',
      release: 'dotnet build -c Release',
      publish: 'dotnet publish -c Release'
    },
    packageManagers: ['nuget', 'dotnet'],
    runtimeCheck: 'dotnet --version',
    outputExtensions: ['.dll', '.exe']
  },
  cpp: {
    extensions: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
    configFiles: ['CMakeLists.txt', 'Makefile', 'meson.build'],
    buildCommands: {
      cmake: 'cmake --build .',
      make: 'make',
      default: 'make'
    },
    packageManagers: ['conan', 'vcpkg'],
    runtimeCheck: 'g++ --version',
    outputExtensions: ['', '.o', '.a', '.so', '.dylib', '.exe']
  },
  shell: {
    extensions: ['.sh', '.bash', '.zsh'],
    configFiles: [],
    buildCommands: {
      default: 'bash',
      test: 'shellcheck'
    },
    packageManagers: [],
    runtimeCheck: 'bash --version',
    outputExtensions: ['.sh']
  }
};

/**
 * Multi-Language Coordinator class
 * Manages build processes across different programming languages
 */
class MultiLanguageCoordinator extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      defaultLanguage: config.defaultLanguage || 'javascript',
      autoDetect: config.autoDetect !== false,
      strictVersions: config.strictVersions || false,
      parallelLanguageBuilds: config.parallelLanguageBuilds !== false,
      workspaceRoot: config.workspaceRoot || process.cwd(),
      customLanguages: config.customLanguages || {},
      preferredPackageManagers: config.preferredPackageManagers || {},
      ...config
    };

    // Language configurations
    this.languages = new Map();
    this.registeredLanguages = new Set();

    // Runtime environment cache
    this.runtimeCache = new Map();
    this.versionCache = new Map();

    // Build command templates
    this.commandTemplates = new Map();

    // Statistics
    this.stats = {
      totalBuilds: 0,
      buildsByLanguage: {},
      successByLanguage: {},
      failureByLanguage: {},
      averageBuildTime: {}
    };

    this.isInitialized = false;
  }

  /**
   * Initialize the coordinator
   */
  async initialize() {
    // Load default language configurations
    for (const [lang, config] of Object.entries(LanguageDefaults)) {
      this.languages.set(lang, { ...config });
    }

    // Merge custom language configurations
    for (const [lang, config] of Object.entries(this.config.customLanguages)) {
      if (this.languages.has(lang)) {
        const existing = this.languages.get(lang);
        this.languages.set(lang, { ...existing, ...config });
      } else {
        this.languages.set(lang, config);
      }
    }

    // Detect available runtimes
    await this._detectRuntimes();

    this.isInitialized = true;
    this.emit('initialized', {
      languages: Array.from(this.languages.keys()),
      timestamp: new Date()
    });

    return this;
  }

  /**
   * Register a language for use
   * @param {string} language - Language identifier
   */
  registerLanguage(language) {
    const normalized = language.toLowerCase();

    if (!this.languages.has(normalized)) {
      console.warn(`Unknown language: ${language}, using default JavaScript configuration`);
      return;
    }

    this.registeredLanguages.add(normalized);

    if (!this.stats.buildsByLanguage[normalized]) {
      this.stats.buildsByLanguage[normalized] = 0;
      this.stats.successByLanguage[normalized] = 0;
      this.stats.failureByLanguage[normalized] = 0;
      this.stats.averageBuildTime[normalized] = 0;
    }

    this.emit('languageRegistered', { language: normalized, timestamp: new Date() });
  }

  /**
   * Get build command for a target
   * @param {Object} target - Build target
   * @returns {Promise<Object>} Build command configuration
   */
  async getBuildCommand(target) {
    const language = (target.language || this.config.defaultLanguage).toLowerCase();
    const langConfig = this.languages.get(language);

    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // If target has explicit build script, use it
    if (target.buildScript && !target.buildScript.includes('npm run build')) {
      return {
        script: target.buildScript,
        shell: this._getShell(),
        language,
        env: await this._getLanguageEnv(language, target)
      };
    }

    // Detect package manager and appropriate build command
    const packageManager = await this._detectPackageManager(target.sourceDir, language);
    const buildCommand = await this._resolveBuildCommand(langConfig, packageManager, target);

    return {
      script: buildCommand,
      shell: this._getShell(),
      language,
      packageManager,
      env: await this._getLanguageEnv(language, target)
    };
  }

  /**
   * Detect programming language from source directory
   * @param {string} sourceDir - Source directory path
   * @returns {Promise<string>} Detected language
   */
  async detectLanguage(sourceDir) {
    try {
      const files = await fs.readdir(sourceDir);
      const fileSet = new Set(files.map(f => f.toLowerCase()));

      // Check config files first (more reliable)
      for (const [lang, config] of this.languages) {
        for (const configFile of config.configFiles || []) {
          if (configFile.includes('*')) {
            const pattern = configFile.replace('*', '');
            if (files.some(f => f.endsWith(pattern))) {
              return lang;
            }
          } else if (fileSet.has(configFile.toLowerCase())) {
            return lang;
          }
        }
      }

      // Check source file extensions
      const extensionCounts = new Map();
      const allFiles = await this._listFilesRecursive(sourceDir, 3);

      for (const file of allFiles) {
        const ext = path.extname(file).toLowerCase();
        for (const [lang, config] of this.languages) {
          if (config.extensions?.includes(ext)) {
            extensionCounts.set(lang, (extensionCounts.get(lang) || 0) + 1);
          }
        }
      }

      // Return language with most files
      let maxCount = 0;
      let detectedLang = this.config.defaultLanguage;

      for (const [lang, count] of extensionCounts) {
        if (count > maxCount) {
          maxCount = count;
          detectedLang = lang;
        }
      }

      return detectedLang;

    } catch (error) {
      return this.config.defaultLanguage;
    }
  }

  /**
   * Detect package manager for a language
   * @private
   */
  async _detectPackageManager(sourceDir, language) {
    const langConfig = this.languages.get(language);
    if (!langConfig?.packageManagers?.length) {
      return 'default';
    }

    // Check for preferred package manager
    if (this.config.preferredPackageManagers[language]) {
      return this.config.preferredPackageManagers[language];
    }

    try {
      const files = await fs.readdir(sourceDir);
      const fileSet = new Set(files.map(f => f.toLowerCase()));

      // Language-specific detection
      switch (language) {
        case 'typescript':
        case 'javascript':
          if (fileSet.has('pnpm-lock.yaml')) return 'pnpm';
          if (fileSet.has('yarn.lock')) return 'yarn';
          if (fileSet.has('package-lock.json')) return 'npm';
          return 'npm';

        case 'python':
          if (fileSet.has('poetry.lock')) return 'poetry';
          if (fileSet.has('pipfile.lock')) return 'pipenv';
          if (fileSet.has('environment.yml')) return 'conda';
          if (fileSet.has('pyproject.toml')) return 'pip';
          return 'pip';

        case 'java':
          if (fileSet.has('pom.xml')) return 'maven';
          if (files.some(f => f.startsWith('build.gradle'))) return 'gradle';
          return 'maven';

        case 'rust':
          return 'cargo';

        case 'go':
          return 'go';

        case 'csharp':
          return 'dotnet';

        default:
          return 'default';
      }
    } catch {
      return 'default';
    }
  }

  /**
   * Resolve build command for language and package manager
   * @private
   */
  async _resolveBuildCommand(langConfig, packageManager, target) {
    const commands = langConfig.buildCommands || {};

    // Check for custom build script in package.json for Node.js projects
    if (['typescript', 'javascript'].includes(target.language?.toLowerCase())) {
      try {
        const pkgPath = path.join(target.sourceDir, 'package.json');
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));

        if (pkg.scripts?.build) {
          const pmCommands = {
            npm: 'npm run build',
            yarn: 'yarn build',
            pnpm: 'pnpm build'
          };
          return pmCommands[packageManager] || 'npm run build';
        }
      } catch {
        // No package.json or no build script
      }
    }

    // Return command for detected package manager
    return commands[packageManager] || commands.default || 'echo "No build command configured"';
  }

  /**
   * Get environment variables for language
   * @private
   */
  async _getLanguageEnv(language, target) {
    const baseEnv = { ...target.env };

    switch (language) {
      case 'typescript':
      case 'javascript':
        return {
          ...baseEnv,
          NODE_ENV: baseEnv.NODE_ENV || 'production',
          NODE_OPTIONS: baseEnv.NODE_OPTIONS || '--max-old-space-size=4096'
        };

      case 'python':
        return {
          ...baseEnv,
          PYTHONDONTWRITEBYTECODE: '1',
          PYTHONUNBUFFERED: '1',
          PIP_DISABLE_PIP_VERSION_CHECK: '1'
        };

      case 'go':
        return {
          ...baseEnv,
          CGO_ENABLED: baseEnv.CGO_ENABLED || '0',
          GOOS: baseEnv.GOOS || process.platform,
          GOARCH: baseEnv.GOARCH || process.arch
        };

      case 'rust':
        return {
          ...baseEnv,
          CARGO_TERM_COLOR: 'always',
          RUSTFLAGS: baseEnv.RUSTFLAGS || '-C target-cpu=native'
        };

      case 'java':
        return {
          ...baseEnv,
          JAVA_TOOL_OPTIONS: baseEnv.JAVA_TOOL_OPTIONS || '-Xmx2g'
        };

      default:
        return baseEnv;
    }
  }

  /**
   * Get shell for current platform
   * @private
   */
  _getShell() {
    if (process.platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/sh';
  }

  /**
   * Detect available runtimes
   * @private
   */
  async _detectRuntimes() {
    const detectionPromises = [];

    for (const [lang, config] of this.languages) {
      if (config.runtimeCheck) {
        detectionPromises.push(
          this._checkRuntime(lang, config.runtimeCheck)
        );
      }
    }

    await Promise.allSettled(detectionPromises);
  }

  /**
   * Check if runtime is available
   * @private
   */
  async _checkRuntime(language, command) {
    return new Promise((resolve) => {
      exec(command, { timeout: 5000 }, (error, stdout) => {
        if (!error) {
          const version = this._parseVersion(stdout);
          this.runtimeCache.set(language, { available: true, version });
          this.versionCache.set(language, version);
        } else {
          this.runtimeCache.set(language, { available: false, version: null });
        }
        resolve();
      });
    });
  }

  /**
   * Parse version from command output
   * @private
   */
  _parseVersion(output) {
    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : 'unknown';
  }

  /**
   * List files recursively with depth limit
   * @private
   */
  async _listFilesRecursive(dir, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth) return [];

    const results = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this._listFilesRecursive(fullPath, maxDepth, currentDepth + 1);
          results.push(...subFiles);
        } else if (entry.isFile()) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore permission errors
    }

    return results;
  }

  /**
   * Get language configuration
   * @param {string} language - Language identifier
   * @returns {Object|null} Language configuration
   */
  getLanguageConfig(language) {
    return this.languages.get(language.toLowerCase()) || null;
  }

  /**
   * Check if language is supported
   * @param {string} language - Language identifier
   * @returns {boolean} True if supported
   */
  isLanguageSupported(language) {
    return this.languages.has(language.toLowerCase());
  }

  /**
   * Check if runtime is available
   * @param {string} language - Language identifier
   * @returns {boolean} True if runtime is available
   */
  isRuntimeAvailable(language) {
    const cache = this.runtimeCache.get(language.toLowerCase());
    return cache?.available || false;
  }

  /**
   * Get runtime version
   * @param {string} language - Language identifier
   * @returns {string|null} Runtime version
   */
  getRuntimeVersion(language) {
    return this.versionCache.get(language.toLowerCase()) || null;
  }

  /**
   * Record build statistics
   * @param {string} language - Language identifier
   * @param {boolean} success - Build success status
   * @param {number} duration - Build duration in ms
   */
  recordBuildStats(language, success, duration) {
    const lang = language.toLowerCase();

    this.stats.totalBuilds++;
    this.stats.buildsByLanguage[lang] = (this.stats.buildsByLanguage[lang] || 0) + 1;

    if (success) {
      this.stats.successByLanguage[lang] = (this.stats.successByLanguage[lang] || 0) + 1;
    } else {
      this.stats.failureByLanguage[lang] = (this.stats.failureByLanguage[lang] || 0) + 1;
    }

    // Update average build time
    const currentAvg = this.stats.averageBuildTime[lang] || 0;
    const buildCount = this.stats.buildsByLanguage[lang];
    this.stats.averageBuildTime[lang] = ((currentAvg * (buildCount - 1)) + duration) / buildCount;
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get available languages
   * @returns {Array<string>} List of available languages
   */
  getAvailableLanguages() {
    return Array.from(this.languages.keys()).filter(lang =>
      this.isRuntimeAvailable(lang)
    );
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const availableRuntimes = [];
    const unavailableRuntimes = [];

    for (const [lang, cache] of this.runtimeCache) {
      if (cache.available) {
        availableRuntimes.push({ language: lang, version: cache.version });
      } else {
        unavailableRuntimes.push(lang);
      }
    }

    return {
      status: availableRuntimes.length > 0 ? 'healthy' : 'warning',
      registeredLanguages: this.registeredLanguages.size,
      availableRuntimes: availableRuntimes.length,
      unavailableRuntimes: unavailableRuntimes.length,
      runtimes: availableRuntimes,
      totalBuilds: this.stats.totalBuilds
    };
  }

  /**
   * Shutdown
   */
  async shutdown() {
    this.runtimeCache.clear();
    this.versionCache.clear();
    this.registeredLanguages.clear();
    this.isInitialized = false;
    this.emit('shutdown', { timestamp: new Date() });
  }
}

module.exports = MultiLanguageCoordinator;
module.exports.SupportedLanguages = SupportedLanguages;
module.exports.LanguageDefaults = LanguageDefaults;
