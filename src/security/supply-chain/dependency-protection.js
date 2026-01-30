/**
 * DEPENDENCY PROTECTION - Supply Chain Security (Story 106 - VAL-10-001)
 * Implements protection against dependency confusion and other supply chain attacks
 *
 * Fixes:
 * - GH-106-001: Dependency confusion attack prevention
 * - GH-106-003: Lock file tampering protection
 * - BA-106-001: Internal packages not scoped
 * - SE-106-001: SSDF dependency verification
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { EventEmitter } = require('events');

/**
 * Internal package scope
 */
const INTERNAL_SCOPE = '@bmad';

/**
 * Known malicious package patterns
 */
const MALICIOUS_PATTERNS = [
  /^@?[a-z]+-internal$/i,
  /^@?[a-z]+-private$/i,
  /^@?[a-z]+-staging$/i,
  /typosquat/i,
  /[-_]?test[-_]?package/i
];

/**
 * Allowed registries
 */
const ALLOWED_REGISTRIES = [
  'https://registry.npmjs.org',
  'https://npm.pkg.github.com'
];

class DependencyProtection extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = this._mergeConfig(config);
    this.internalPackages = new Set();
    this.trustedHashes = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize protection system
   */
  async initialize(options = {}) {
    console.log('🛡️ Initializing Dependency Protection...');

    // Load internal package registry
    if (options.internalPackagesPath) {
      await this._loadInternalPackages(options.internalPackagesPath);
    }

    // Load trusted lockfile hashes
    if (options.trustedHashesPath) {
      await this._loadTrustedHashes(options.trustedHashesPath);
    }

    this.isInitialized = true;
    console.log('✅ Dependency Protection initialized');

    this.emit('initialized', {
      internalPackages: this.internalPackages.size,
      trustedHashes: this.trustedHashes.size
    });

    return true;
  }

  /**
   * Validate a package against dependency confusion attacks
   * @param {object} packageInfo - Package information
   * @returns {object} Validation result
   */
  async validatePackage(packageInfo) {
    const { name, version, registry, resolved } = packageInfo;
    const issues = [];
    const warnings = [];

    // 1. Check if internal package is properly scoped
    if (this._isInternalPackage(name)) {
      if (!name.startsWith(`${INTERNAL_SCOPE}/`)) {
        issues.push({
          type: 'MISSING_SCOPE',
          severity: 'critical',
          message: `Internal package "${name}" must use ${INTERNAL_SCOPE}/ scope`,
          fix: `Rename to "${INTERNAL_SCOPE}/${name}"`
        });
      }
    }

    // 2. Check for typosquatting patterns
    const typosquatCheck = this._checkTyposquatting(name);
    if (typosquatCheck.suspicious) {
      issues.push({
        type: 'POSSIBLE_TYPOSQUAT',
        severity: 'high',
        message: `Package "${name}" may be a typosquat of "${typosquatCheck.similarTo}"`,
        fix: `Verify package authenticity before installation`
      });
    }

    // 3. Check registry source
    if (registry && !this._isAllowedRegistry(registry)) {
      issues.push({
        type: 'UNTRUSTED_REGISTRY',
        severity: 'high',
        message: `Package from untrusted registry: ${registry}`,
        fix: `Use only allowed registries: ${ALLOWED_REGISTRIES.join(', ')}`
      });
    }

    // 4. Check for malicious package patterns
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(name)) {
        warnings.push({
          type: 'SUSPICIOUS_NAME',
          severity: 'medium',
          message: `Package name matches suspicious pattern: ${name}`,
          pattern: pattern.toString()
        });
      }
    }

    // 5. Version validation
    if (version) {
      const versionCheck = this._validateVersion(version);
      if (!versionCheck.valid) {
        warnings.push({
          type: 'INVALID_VERSION',
          severity: 'low',
          message: versionCheck.message
        });
      }
    }

    const valid = issues.length === 0;

    this.emit('package-validated', {
      package: name,
      valid,
      issues: issues.length,
      warnings: warnings.length
    });

    return {
      valid,
      package: name,
      issues,
      warnings,
      recommendations: this._generateRecommendations(name, issues)
    };
  }

  /**
   * Validate lockfile integrity
   * @param {string} lockfilePath - Path to package-lock.json or yarn.lock
   * @returns {object} Validation result
   */
  async validateLockfile(lockfilePath) {
    console.log(`🔐 Validating lockfile: ${lockfilePath}`);

    try {
      // Read lockfile
      const content = await fs.readFile(lockfilePath, 'utf8');

      // Calculate hash
      const hash = crypto
        .createHash('sha256')
        .update(content)
        .digest('hex');

      // Check against trusted hashes
      const trustedHash = this.trustedHashes.get(lockfilePath);

      if (trustedHash && trustedHash !== hash) {
        console.warn(`⚠️ Lockfile has been modified: ${lockfilePath}`);

        return {
          valid: false,
          error: 'LOCKFILE_MODIFIED',
          message: 'Lockfile has been modified since last trusted state',
          currentHash: hash,
          trustedHash,
          recommendation: 'Review changes and update trusted hash if legitimate'
        };
      }

      // Parse and validate contents
      const lockfile = this._parseLockfile(lockfilePath, content);
      const contentValidation = await this._validateLockfileContents(lockfile);

      if (!contentValidation.valid) {
        return {
          valid: false,
          error: 'LOCKFILE_CONTENT_INVALID',
          issues: contentValidation.issues,
          hash
        };
      }

      console.log(`✅ Lockfile validated: ${lockfilePath}`);

      return {
        valid: true,
        hash,
        packages: lockfile.packages?.length || 0
      };

    } catch (error) {
      return {
        valid: false,
        error: 'LOCKFILE_READ_ERROR',
        message: error.message
      };
    }
  }

  /**
   * Trust a lockfile hash
   */
  async trustLockfile(lockfilePath) {
    const content = await fs.readFile(lockfilePath, 'utf8');
    const hash = crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');

    this.trustedHashes.set(lockfilePath, hash);

    console.log(`✅ Lockfile trusted: ${lockfilePath} (${hash.slice(0, 16)}...)`);

    this.emit('lockfile-trusted', {
      path: lockfilePath,
      hash
    });

    return hash;
  }

  /**
   * Validate all dependencies in package.json
   */
  async validatePackageJson(packageJsonPath) {
    console.log(`🔍 Validating dependencies in: ${packageJsonPath}`);

    const packageJson = await fs.readJson(packageJsonPath);
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
      ...packageJson.optionalDependencies
    };

    const results = {
      valid: true,
      packages: {},
      issues: [],
      warnings: []
    };

    for (const [name, version] of Object.entries(allDependencies)) {
      const validation = await this.validatePackage({ name, version });

      results.packages[name] = validation;

      if (!validation.valid) {
        results.valid = false;
        results.issues.push(...validation.issues);
      }

      results.warnings.push(...validation.warnings);
    }

    // Check for missing internal package scopes
    const unscopedInternal = Object.keys(allDependencies)
      .filter(name => this._isInternalPackage(name) && !name.startsWith(INTERNAL_SCOPE));

    if (unscopedInternal.length > 0) {
      results.issues.push({
        type: 'UNSCOPED_INTERNAL_PACKAGES',
        severity: 'critical',
        packages: unscopedInternal,
        message: `${unscopedInternal.length} internal packages are not scoped with ${INTERNAL_SCOPE}/`
      });
      results.valid = false;
    }

    console.log(`${results.valid ? '✅' : '❌'} Package.json validation: ${Object.keys(allDependencies).length} dependencies`);

    return results;
  }

  /**
   * Generate secure package.json with proper scoping
   */
  async enforceScoping(packageJsonPath, options = {}) {
    const packageJson = await fs.readJson(packageJsonPath);
    const changes = [];

    const processSection = (deps, sectionName) => {
      if (!deps) return deps;

      const newDeps = {};
      for (const [name, version] of Object.entries(deps)) {
        if (this._isInternalPackage(name) && !name.startsWith(INTERNAL_SCOPE)) {
          const newName = `${INTERNAL_SCOPE}/${name}`;
          newDeps[newName] = version;
          changes.push({
            section: sectionName,
            oldName: name,
            newName
          });
        } else {
          newDeps[name] = version;
        }
      }
      return newDeps;
    };

    const updatedPackageJson = {
      ...packageJson,
      dependencies: processSection(packageJson.dependencies, 'dependencies'),
      devDependencies: processSection(packageJson.devDependencies, 'devDependencies'),
      peerDependencies: processSection(packageJson.peerDependencies, 'peerDependencies'),
      optionalDependencies: processSection(packageJson.optionalDependencies, 'optionalDependencies')
    };

    if (changes.length > 0 && !options.dryRun) {
      // Backup original
      await fs.copy(packageJsonPath, `${packageJsonPath}.backup`);

      // Write updated package.json
      await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });

      console.log(`✅ Updated ${changes.length} package names with ${INTERNAL_SCOPE}/ scope`);
    }

    return {
      changes,
      updated: changes.length > 0 && !options.dryRun,
      dryRun: options.dryRun
    };
  }

  /**
   * Register an internal package
   */
  registerInternalPackage(packageName) {
    const baseName = packageName.replace(`${INTERNAL_SCOPE}/`, '');
    this.internalPackages.add(baseName);
    console.log(`📦 Registered internal package: ${baseName}`);
  }

  /**
   * Check if a package is internal
   */
  isInternalPackage(packageName) {
    return this._isInternalPackage(packageName);
  }

  // Private methods

  _mergeConfig(userConfig) {
    return {
      enforceScoping: true,
      blockUntrustedRegistries: true,
      typosquatProtection: true,
      lockfileIntegrity: true,
      ...userConfig
    };
  }

  async _loadInternalPackages(packagesPath) {
    try {
      const content = await fs.readJson(packagesPath);
      for (const pkg of content.packages || []) {
        this.internalPackages.add(pkg);
      }
      console.log(`📦 Loaded ${this.internalPackages.size} internal packages`);
    } catch (error) {
      console.warn(`⚠️ Could not load internal packages: ${error.message}`);
    }
  }

  async _loadTrustedHashes(hashesPath) {
    try {
      const content = await fs.readJson(hashesPath);
      for (const [path, hash] of Object.entries(content.hashes || {})) {
        this.trustedHashes.set(path, hash);
      }
      console.log(`🔐 Loaded ${this.trustedHashes.size} trusted hashes`);
    } catch (error) {
      console.warn(`⚠️ Could not load trusted hashes: ${error.message}`);
    }
  }

  _isInternalPackage(name) {
    const baseName = name.replace(`${INTERNAL_SCOPE}/`, '');

    // Check registered internal packages
    if (this.internalPackages.has(baseName)) {
      return true;
    }

    // Check for common internal package patterns
    const internalPatterns = [
      /^bmad-/,
      /^@bmad\//,
      /-internal$/,
      /-private$/,
      /-core$/
    ];

    return internalPatterns.some(pattern => pattern.test(name));
  }

  _isAllowedRegistry(registry) {
    if (!this.config.blockUntrustedRegistries) {
      return true;
    }

    return ALLOWED_REGISTRIES.some(allowed =>
      registry.startsWith(allowed)
    );
  }

  _checkTyposquatting(name) {
    if (!this.config.typosquatProtection) {
      return { suspicious: false };
    }

    // Common popular packages to check against
    const popularPackages = [
      'lodash', 'express', 'react', 'vue', 'angular',
      'axios', 'moment', 'webpack', 'babel', 'eslint',
      'typescript', 'jest', 'mocha', 'chai', 'request'
    ];

    // Check Levenshtein distance
    for (const popular of popularPackages) {
      const distance = this._levenshtein(name.toLowerCase(), popular);
      if (distance > 0 && distance <= 2) {
        return {
          suspicious: true,
          similarTo: popular,
          distance
        };
      }
    }

    return { suspicious: false };
  }

  _levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  _validateVersion(version) {
    // Basic semver validation
    const semverRegex = /^(\d+\.)?(\d+\.)?(\*|\d+)(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;

    if (version.startsWith('^') || version.startsWith('~')) {
      version = version.slice(1);
    }

    if (version === '*' || version === 'latest') {
      return {
        valid: true,
        warning: 'Using wildcard version is not recommended'
      };
    }

    return {
      valid: semverRegex.test(version)
    };
  }

  _parseLockfile(lockfilePath, content) {
    const filename = path.basename(lockfilePath);

    if (filename === 'package-lock.json') {
      return JSON.parse(content);
    }

    if (filename === 'yarn.lock') {
      // Basic yarn.lock parsing
      return { type: 'yarn', content };
    }

    if (filename === 'pnpm-lock.yaml') {
      // Would use yaml parser
      return { type: 'pnpm', content };
    }

    return { content };
  }

  async _validateLockfileContents(lockfile) {
    const issues = [];

    // For npm lockfiles
    if (lockfile.packages) {
      for (const [pkgPath, pkgInfo] of Object.entries(lockfile.packages)) {
        if (pkgPath === '') continue; // Root package

        // Check resolved URL
        if (pkgInfo.resolved && !this._isAllowedRegistry(pkgInfo.resolved)) {
          issues.push({
            type: 'UNTRUSTED_RESOLVED_URL',
            package: pkgPath,
            resolved: pkgInfo.resolved
          });
        }

        // Check integrity hash exists
        if (!pkgInfo.integrity && !pkgInfo.link) {
          issues.push({
            type: 'MISSING_INTEGRITY',
            package: pkgPath
          });
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  _generateRecommendations(packageName, issues) {
    const recommendations = [];

    for (const issue of issues) {
      switch (issue.type) {
        case 'MISSING_SCOPE':
          recommendations.push({
            action: 'RENAME_PACKAGE',
            from: packageName,
            to: `${INTERNAL_SCOPE}/${packageName}`,
            priority: 'high'
          });
          break;

        case 'POSSIBLE_TYPOSQUAT':
          recommendations.push({
            action: 'VERIFY_PACKAGE',
            package: packageName,
            checkUrl: `https://www.npmjs.com/package/${packageName}`,
            priority: 'critical'
          });
          break;

        case 'UNTRUSTED_REGISTRY':
          recommendations.push({
            action: 'CHANGE_REGISTRY',
            allowedRegistries: ALLOWED_REGISTRIES,
            priority: 'high'
          });
          break;
      }
    }

    return recommendations;
  }
}

// Export constants
DependencyProtection.INTERNAL_SCOPE = INTERNAL_SCOPE;
DependencyProtection.ALLOWED_REGISTRIES = ALLOWED_REGISTRIES;
DependencyProtection.MALICIOUS_PATTERNS = MALICIOUS_PATTERNS;

module.exports = DependencyProtection;
