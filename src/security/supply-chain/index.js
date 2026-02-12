/**
 * SUPPLY CHAIN SECURITY MODULE
 * Comprehensive security suite for Stories 101-110 (VAL-09-004 to VAL-11-001)
 *
 * This module provides:
 * - Artifact Signing (Story 105 - VAL-09-008)
 * - Hook Sandboxing (Story 108 - VAL-10-003)
 * - Dependency Protection (Story 106 - VAL-10-001)
 * - Atomic Operations (Story 107 - VAL-10-002)
 * - Safe CLI Execution (Story 110 - VAL-11-001)
 * - Cache Integrity (Story 103 - VAL-09-006)
 * - Build Isolation (Story 104 - VAL-09-007)
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

const ArtifactSigner = require('./artifact-signer');
const HookSandbox = require('./hook-sandbox');
const DependencyProtection = require('./dependency-protection');
const AtomicOperations = require('./atomic-operations');
const SafeCLI = require('./safe-cli');
const CacheIntegrity = require('./cache-integrity');
const BuildIsolation = require('./build-isolation');

/**
 * Supply Chain Security Manager
 * Orchestrates all security components for a comprehensive supply chain security posture
 */
class SupplyChainSecurity {
  constructor(config = {}) {
    this.config = config;
    this.isInitialized = false;

    // Initialize components
    this.artifactSigner = new ArtifactSigner(config.signing);
    this.hookSandbox = new HookSandbox(config.sandbox);
    this.dependencyProtection = new DependencyProtection(config.dependencies);
    this.atomicOperations = new AtomicOperations(config.atomic);
    this.safeCLI = new SafeCLI(config.cli);
    this.cacheIntegrity = new CacheIntegrity(config.cache);
    this.buildIsolation = new BuildIsolation(config.isolation);
  }

  /**
   * Initialize all security components
   */
  async initialize(options = {}) {
    console.log('🔐 Initializing Supply Chain Security Suite...');

    try {
      // Initialize all components in parallel where possible
      await Promise.all([
        this.artifactSigner.initialize(options.signing),
        this.hookSandbox.initialize(options.sandbox),
        this.dependencyProtection.initialize(options.dependencies),
        this.atomicOperations.initialize(options.atomic),
        this.safeCLI.initialize(options.cli),
        this.cacheIntegrity.initialize(options.cache),
        this.buildIsolation.initialize(options.isolation)
      ]);

      this.isInitialized = true;
      console.log('✅ Supply Chain Security Suite initialized');

      return {
        success: true,
        components: {
          artifactSigner: true,
          hookSandbox: true,
          dependencyProtection: true,
          atomicOperations: true,
          safeCLI: true,
          cacheIntegrity: true,
          buildIsolation: true
        }
      };

    } catch (error) {
      console.error('❌ Supply Chain Security initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute a secure build with all protections enabled
   */
  async secureBuild(buildConfig) {
    if (!this.isInitialized) {
      throw new Error('Supply Chain Security not initialized');
    }

    const buildId = buildConfig.buildId || Date.now().toString(36);
    const results = {
      buildId,
      startedAt: new Date().toISOString(),
      steps: []
    };

    try {
      // 1. Create isolated build context
      const context = await this.buildIsolation.createBuildContext(buildId, {
        workDir: buildConfig.workDir,
        isolationLevel: buildConfig.isolationLevel
      });
      results.steps.push({ step: 'create-context', success: true });

      // 2. Validate dependencies
      if (buildConfig.packageJson) {
        const depValidation = await this.dependencyProtection.validatePackageJson(
          buildConfig.packageJson
        );
        results.steps.push({
          step: 'validate-dependencies',
          success: depValidation.valid,
          issues: depValidation.issues
        });

        if (!depValidation.valid && buildConfig.strict) {
          throw new Error('Dependency validation failed');
        }
      }

      // 3. Validate lockfile integrity
      if (buildConfig.lockfile) {
        const lockValidation = await this.dependencyProtection.validateLockfile(
          buildConfig.lockfile
        );
        results.steps.push({
          step: 'validate-lockfile',
          success: lockValidation.valid,
          hash: lockValidation.hash
        });

        if (!lockValidation.valid && buildConfig.strict) {
          throw new Error('Lockfile validation failed');
        }
      }

      // 4. Execute build commands
      for (const cmd of (buildConfig.commands || [])) {
        const cmdResult = await this.buildIsolation.executeBuild(
          buildId,
          cmd.command,
          cmd.args,
          cmd.options
        );
        results.steps.push({
          step: `execute-${cmd.command}`,
          success: cmdResult.success,
          duration: cmdResult.duration
        });

        if (!cmdResult.success && buildConfig.strict) {
          throw new Error(`Build command failed: ${cmd.command}`);
        }
      }

      // 5. Sign artifacts
      if (buildConfig.sign && buildConfig.artifacts) {
        for (const artifact of buildConfig.artifacts) {
          const signResult = await this.artifactSigner.signArtifact(
            artifact,
            { buildId }
          );
          results.steps.push({
            step: `sign-${artifact}`,
            success: true,
            hash: signResult.artifact.hash
          });
        }
      }

      // 6. Cache build outputs
      if (buildConfig.cache && buildConfig.outputs) {
        for (const output of buildConfig.outputs) {
          await this.cacheIntegrity.cacheItem(
            `${buildId}:${output.key}`,
            output.content,
            { buildId }
          );
        }
        results.steps.push({ step: 'cache-outputs', success: true });
      }

      results.success = true;
      results.completedAt = new Date().toISOString();

      // Clean up build context
      await this.buildIsolation.destroyBuildContext(buildId);

      return results;

    } catch (error) {
      results.success = false;
      results.error = error.message;
      results.completedAt = new Date().toISOString();

      // Attempt cleanup
      try {
        await this.buildIsolation.destroyBuildContext(buildId);
      } catch {
        // intentionally empty — best-effort cleanup
      }

      return results;
    }
  }

  /**
   * Execute a hook securely
   */
  async executeSecureHook(hookType, handler, context, options = {}) {
    return this.hookSandbox.executeHook(handler, context, options);
  }

  /**
   * Execute a CLI command securely
   */
  async executeSecureCommand(command, args, options = {}) {
    return this.safeCLI.execute(command, args, options);
  }

  /**
   * Perform atomic file write
   */
  async atomicWrite(filePath, content, options = {}) {
    return this.atomicOperations.atomicWrite(filePath, content, options);
  }

  /**
   * Sign an artifact
   */
  async signArtifact(artifactPath, metadata = {}) {
    return this.artifactSigner.signArtifact(artifactPath, metadata);
  }

  /**
   * Verify an artifact
   */
  async verifyArtifact(artifactPath, signaturePath = null) {
    return this.artifactSigner.verifyArtifact(artifactPath, signaturePath);
  }

  /**
   * Validate a package
   */
  async validatePackage(packageInfo) {
    return this.dependencyProtection.validatePackage(packageInfo);
  }

  /**
   * Get comprehensive security status
   */
  getSecurityStatus() {
    return {
      initialized: this.isInitialized,
      components: {
        artifactSigner: this.artifactSigner.isInitialized,
        hookSandbox: this.hookSandbox.isInitialized,
        dependencyProtection: this.dependencyProtection.isInitialized,
        atomicOperations: this.atomicOperations.isInitialized,
        safeCLI: this.safeCLI.isInitialized,
        cacheIntegrity: this.cacheIntegrity.isInitialized,
        buildIsolation: this.buildIsolation.isInitialized
      },
      statistics: {
        hooks: this.hookSandbox.getStatistics(),
        cli: this.safeCLI.getStatistics(),
        cache: this.cacheIntegrity.getStatistics(),
        build: this.buildIsolation.getStatistics()
      }
    };
  }
}

// Export all components
module.exports = {
  SupplyChainSecurity,
  ArtifactSigner,
  HookSandbox,
  DependencyProtection,
  AtomicOperations,
  SafeCLI,
  CacheIntegrity,
  BuildIsolation
};
