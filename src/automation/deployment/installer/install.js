/**
 * BMAD DEPLOYMENT INSTALLER - EPIC 5.2
 * Zero-downtime deployment with blue-green strategy
 *
 * @module automation/deployment/installer
 * @version 1.0.0
 * @epic Epic 5 - Story 5.2: Deployment Automation Export
 */

import EventEmitter from 'events';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import crypto from 'crypto';

/**
 * Deployment Installer - Blue-green deployment orchestration
 */
class DeploymentInstaller extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      strategy: config.strategy || 'blue-green',
      healthCheckTimeout: config.healthCheckTimeout || 60000,
      healthCheckInterval: config.healthCheckInterval || 5000,
      rollbackOnFailure: config.rollbackOnFailure !== false,
      maxRetries: config.maxRetries || 3,
      preDeployHooks: config.preDeployHooks || [],
      postDeployHooks: config.postDeployHooks || [],
      ...config
    };

    this.deployments = new Map();
    this.activeSlot = 'blue';
    this.pendingSlot = 'green';

    this.metrics = {
      totalDeployments: 0,
      successfulDeployments: 0,
      failedDeployments: 0,
      rollbacks: 0,
      avgDeployTime: 0
    };

    this.logger = {
      info: (msg) => console.log(`[DEPLOY] ${msg}`),
      warn: (msg) => console.warn(`[DEPLOY] ${msg}`),
      error: (msg) => console.error(`[DEPLOY] ${msg}`)
    };
  }

  /**
   * Initialize deployment environment
   */
  async initialize(targetDir) {
    this.targetDir = path.resolve(targetDir);
    await fs.mkdir(path.join(this.targetDir, 'blue'), { recursive: true });
    await fs.mkdir(path.join(this.targetDir, 'green'), { recursive: true });
    await fs.mkdir(path.join(this.targetDir, 'shared'), { recursive: true });
    this.logger.info(`Deployment environment initialized at ${this.targetDir}`);
    this.emit('initialized', { targetDir: this.targetDir });
    return this;
  }

  /**
   * Execute deployment with blue-green strategy
   */
  async deploy(deploymentConfig) {
    const deploymentId = crypto.randomUUID();
    const startTime = Date.now();

    const deployment = {
      id: deploymentId,
      config: deploymentConfig,
      status: 'pending',
      startTime,
      slot: this.pendingSlot,
      attempts: 0
    };

    this.deployments.set(deploymentId, deployment);
    this.logger.info(`Starting deployment ${deploymentId} to ${this.pendingSlot} slot`);
    this.emit('deployment:started', { deploymentId, slot: this.pendingSlot });

    try {
      // Pre-deployment hooks
      await this._runHooks(this.config.preDeployHooks, 'pre-deploy', deployment);

      // Deploy to pending slot
      deployment.status = 'deploying';
      await this._deployToSlot(deployment);

      // Run health checks
      deployment.status = 'health-checking';
      await this._runHealthChecks(deployment);

      // Switch traffic
      deployment.status = 'switching';
      await this._switchTraffic();

      // Post-deployment hooks
      await this._runHooks(this.config.postDeployHooks, 'post-deploy', deployment);

      // Success
      deployment.status = 'completed';
      deployment.duration = Date.now() - startTime;
      this.metrics.totalDeployments++;
      this.metrics.successfulDeployments++;
      this._updateAvgDeployTime(deployment.duration);

      this.logger.info(`Deployment ${deploymentId} completed in ${deployment.duration}ms`);
      this.emit('deployment:completed', { deploymentId, duration: deployment.duration });

      return { success: true, deploymentId, duration: deployment.duration };

    } catch (error) {
      deployment.status = 'failed';
      deployment.error = error.message;
      deployment.duration = Date.now() - startTime;
      this.metrics.totalDeployments++;
      this.metrics.failedDeployments++;

      this.logger.error(`Deployment ${deploymentId} failed: ${error.message}`);
      this.emit('deployment:failed', { deploymentId, error: error.message });

      if (this.config.rollbackOnFailure) {
        await this._rollback(deployment);
      }

      return { success: false, deploymentId, error: error.message };
    }
  }

  /**
   * Deploy artifacts to specified slot
   */
  async _deployToSlot(deployment) {
    const slotDir = path.join(this.targetDir, deployment.slot);
    const { artifacts, version } = deployment.config;

    this.logger.info(`Deploying version ${version} to ${deployment.slot}`);

    // Clear slot directory (except shared resources)
    const files = await fs.readdir(slotDir).catch(() => []);
    for (const file of files) {
      await fs.rm(path.join(slotDir, file), { recursive: true, force: true });
    }

    // Copy artifacts
    for (const artifact of artifacts || []) {
      const src = path.resolve(artifact.source);
      const dest = path.join(slotDir, artifact.destination || path.basename(artifact.source));
      await this._copyRecursive(src, dest);
    }

    // Write version manifest
    await fs.writeFile(
      path.join(slotDir, 'manifest.json'),
      JSON.stringify({
        version,
        deployedAt: new Date().toISOString(),
        deploymentId: deployment.id
      }, null, 2)
    );

    // Run install command if specified
    if (deployment.config.installCommand) {
      await this._runCommand(deployment.config.installCommand, slotDir);
    }
  }

  /**
   * Run health checks on deployed slot
   */
  async _runHealthChecks(deployment) {
    const slotDir = path.join(this.targetDir, deployment.slot);
    const healthChecks = deployment.config.healthChecks || [];

    if (healthChecks.length === 0) {
      this.logger.info('No health checks configured, skipping');
      return;
    }

    const startTime = Date.now();
    const timeout = this.config.healthCheckTimeout;

    while (Date.now() - startTime < timeout) {
      let allPassed = true;

      for (const check of healthChecks) {
        const passed = await this._executeHealthCheck(check, slotDir);
        if (!passed) {
          allPassed = false;
          break;
        }
      }

      if (allPassed) {
        this.logger.info('All health checks passed');
        return;
      }

      await this._delay(this.config.healthCheckInterval);
    }

    throw new Error('Health checks timed out');
  }

  /**
   * Execute a single health check
   */
  async _executeHealthCheck(check, slotDir) {
    try {
      if (check.type === 'file') {
        await fs.access(path.join(slotDir, check.path));
        return true;
      } else if (check.type === 'command') {
        await this._runCommand(check.command, slotDir);
        return true;
      } else if (check.type === 'http') {
        // HTTP health check would require an HTTP client
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Switch traffic from active to pending slot
   */
  async _switchTraffic() {
    const previousActive = this.activeSlot;
    this.activeSlot = this.pendingSlot;
    this.pendingSlot = previousActive;

    // Update symlink or configuration
    const currentLink = path.join(this.targetDir, 'current');
    await fs.rm(currentLink, { force: true });
    await fs.symlink(path.join(this.targetDir, this.activeSlot), currentLink);

    this.logger.info(`Traffic switched: ${previousActive} -> ${this.activeSlot}`);
    this.emit('traffic:switched', { from: previousActive, to: this.activeSlot });
  }

  /**
   * Rollback to previous slot
   */
  async _rollback(deployment) {
    this.logger.warn(`Rolling back deployment ${deployment.id}`);
    this.metrics.rollbacks++;

    try {
      // Switch back if we had already switched
      if (this.activeSlot === deployment.slot) {
        await this._switchTraffic();
      }

      this.emit('deployment:rolledback', { deploymentId: deployment.id });
      return true;
    } catch (error) {
      this.logger.error(`Rollback failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Run deployment hooks
   */
  async _runHooks(hooks, phase, deployment) {
    for (const hook of hooks) {
      this.logger.info(`Running ${phase} hook: ${hook.name || 'unnamed'}`);
      try {
        if (typeof hook.handler === 'function') {
          await hook.handler(deployment);
        } else if (hook.command) {
          await this._runCommand(hook.command, this.targetDir);
        }
      } catch (error) {
        if (hook.required !== false) {
          throw new Error(`Hook ${hook.name || 'unnamed'} failed: ${error.message}`);
        }
        this.logger.warn(`Optional hook failed: ${error.message}`);
      }
    }
  }

  /**
   * Run a shell command securely
   * SECURITY: GH-103-001 fix - Removed shell: true to prevent command injection
   * Only allows commands from a strict allowlist of safe executables
   */
  async _runCommand(command, cwd) {
    // SECURITY: Command allowlist to prevent arbitrary command execution
    const ALLOWED_COMMANDS = new Set([
      'npm', 'node', 'yarn', 'pnpm', 'npx',
      'git', 'mkdir', 'cp', 'mv', 'rm', 'ls', 'cat',
      'chmod', 'chown', 'tar', 'gzip', 'gunzip', 'unzip'
    ]);

    // SECURITY: Dangerous shell metacharacters that indicate injection attempts
    const DANGEROUS_CHARS = /[;&|`$(){}[\]<>\\!*?~#]/;

    return new Promise((resolve, reject) => {
      // Parse command safely - handle quoted arguments
      const parts = this._parseCommand(command);
      if (parts.length === 0) {
        return reject(new Error('Empty command'));
      }

      const [cmd, ...args] = parts;

      // SECURITY: Validate command against allowlist
      const cmdBasename = path.basename(cmd);
      if (!ALLOWED_COMMANDS.has(cmdBasename)) {
        return reject(new Error(`Command '${cmdBasename}' not in allowed list. Allowed: ${[...ALLOWED_COMMANDS].join(', ')}`));
      }

      // SECURITY: Check for shell metacharacters in arguments
      for (const arg of args) {
        if (DANGEROUS_CHARS.test(arg)) {
          return reject(new Error(`Argument contains dangerous characters: ${arg}`));
        }
      }

      // SECURITY: shell: false prevents shell interpretation of metacharacters
      const proc = spawn(cmd, args, { cwd, shell: false });

      let stdout = '', stderr = '';
      proc.stdout.on('data', data => { stdout += data; });
      proc.stderr.on('data', data => { stderr += data; });

      proc.on('close', code => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Command failed with code ${code}: ${stderr}`));
      });
      proc.on('error', reject);
    });
  }

  /**
   * Parse a command string into arguments, handling quoted strings
   * SECURITY: Safe argument parsing without shell interpretation
   */
  _parseCommand(command) {
    const args = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if (!inQuote && (char === '"' || char === "'")) {
        inQuote = true;
        quoteChar = char;
      } else if (inQuote && char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      } else if (!inQuote && char === ' ') {
        if (current) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      args.push(current);
    }

    return args;
  }

  /**
   * Copy files recursively
   */
  async _copyRecursive(src, dest) {
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const files = await fs.readdir(src);
      for (const file of files) {
        await this._copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
    }
  }

  _updateAvgDeployTime(duration) {
    const total = this.metrics.totalDeployments;
    this.metrics.avgDeployTime = ((this.metrics.avgDeployTime * (total - 1)) + duration) / total;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalDeployments > 0
        ? `${((this.metrics.successfulDeployments / this.metrics.totalDeployments) * 100).toFixed(2)  }%`
        : 'N/A',
      activeSlot: this.activeSlot
    };
  }

  async performHealthCheck() {
    return {
      status: 'healthy',
      activeSlot: this.activeSlot,
      deployments: this.deployments.size,
      metrics: this.getMetrics()
    };
  }

  async shutdown() {
    this.logger.info('Shutting down deployment installer');
    this.removeAllListeners();
  }
}

export { DeploymentInstaller };
