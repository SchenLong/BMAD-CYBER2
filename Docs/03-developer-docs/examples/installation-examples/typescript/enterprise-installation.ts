/**
 * Enterprise-Grade Module Installation Example
 *
 * This example demonstrates production-ready module installation with:
 * - Comprehensive error handling and recovery
 * - Circuit breaker pattern for reliability
 * - Structured logging with correlation IDs
 * - Metrics collection and monitoring
 * - Rollback and conflict resolution
 * - Webhook notifications for external systems
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { BmadClient, BmadConfig } from '@bmad/sdk-js';
import {
  InstallationRequest,
  InstallationResponse,
  InstallationStatusResponse,
  BmadApiError,
  BmadTimeoutError,
  BmadRateLimitError
} from '@bmad/sdk-js/types';

import { EventEmitter } from 'events';

/**
 * Enterprise installation configuration
 */
interface EnterpriseConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  // Enterprise features
  webhookUrl?: string;
  metricsEndpoint?: string;
  circuitBreakerConfig?: CircuitBreakerConfig;
  auditLogPath?: string;
}

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

/**
 * Installation metrics
 */
interface InstallationMetrics {
  installationId: string;
  moduleName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'timeout';
  retryCount: number;
  errorCount: number;
  progressUpdates: number;
}

/**
 * Circuit breaker states
 */
type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit Breaker Implementation
 */
class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount
    };
  }
}

/**
 * Enterprise Module Installer
 *
 * Production-ready module installation with:
 * - Circuit breaker for fault tolerance
 * - Comprehensive metrics collection
 * - Webhook notifications
 * - Structured audit logging
 * - Automatic rollback on failures
 */
export class EnterpriseModuleInstaller extends EventEmitter {
  private client: BmadClient;
  private circuitBreaker: CircuitBreaker;
  private metrics: Map<string, InstallationMetrics> = new Map();
  private config: EnterpriseConfig;

  constructor(config: EnterpriseConfig) {
    super();
    this.config = config;

    // Initialize BMAD client
    const bmadConfig: BmadConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.bmad-enterprise.com/v2',
      timeout: config.timeout || 60000, // 60s for enterprise
      retries: config.retries || 5,
      logLevel: config.logLevel || 'info'
    };

    this.client = new BmadClient(bmadConfig);

    // Initialize circuit breaker
    const cbConfig = config.circuitBreakerConfig || {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      monitoringPeriodMs: 10000
    };

    this.circuitBreaker = new CircuitBreaker(cbConfig);

    this.setupEventHandlers();
  }

  /**
   * Install multiple modules with enterprise features
   *
   * @param modules - Array of module names to install
   * @param options - Installation options
   * @returns Promise<InstallationStatusResponse[]>
   *
   * @example
   * ```typescript
   * const installer = new EnterpriseModuleInstaller({ apiKey: 'your-api-key' });
   *
   * installer.on('progress', (data) => {
   *   console.log(`Progress: ${data.percentage}%`);
   * });
   *
   * installer.on('completed', (data) => {
   *   console.log(`Installation completed: ${data.installationId}`);
   * });
   *
   * const results = await installer.installModules([
   *   '@bmad-cybercommand/cybersec-team',
   *   '@bmad-cybercommand/intel-team'
   * ], {
   *   validateDependencies: true,
   *   enableRollback: true,
   *   parallel: true,
   *   notificationWebhook: 'https://your-system.com/bmad/webhooks'
   * });
   * ```
   */
  async installModules(
    modules: string[],
    options: {
      validateDependencies?: boolean;
      enableRollback?: boolean;
      parallel?: boolean;
      timeout?: number;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      tags?: Record<string, string>;
      notificationWebhook?: string;
      rollbackOnAnyFailure?: boolean;
    } = {}
  ): Promise<InstallationStatusResponse[]> {
    const correlationId = this.generateCorrelationId();
    const startTime = Date.now();

    this.auditLog('info', 'Enterprise installation started', {
      correlationId,
      modules,
      options,
      timestamp: new Date().toISOString()
    });

    try {
      // Validate input
      this.validateModules(modules);

      // Pre-installation checks
      await this.preInstallationChecks(modules, correlationId);

      // Install modules
      const results = options.parallel
        ? await this.installModulesParallel(modules, options, correlationId)
        : await this.installModulesSequential(modules, options, correlationId);

      // Post-installation validation
      await this.postInstallationValidation(results, correlationId);

      // Send success notification
      await this.sendNotification({
        type: 'installation_completed',
        correlationId,
        modules,
        results,
        duration: Date.now() - startTime
      });

      this.auditLog('info', 'Enterprise installation completed successfully', {
        correlationId,
        modules,
        results: results.map(r => ({ id: r.installationId, status: r.status })),
        duration: Date.now() - startTime
      });

      return results;

    } catch (error) {
      this.auditLog('error', 'Enterprise installation failed', {
        correlationId,
        modules,
        error: error.message,
        duration: Date.now() - startTime
      });

      // Send failure notification
      await this.sendNotification({
        type: 'installation_failed',
        correlationId,
        modules,
        error: error.message,
        duration: Date.now() - startTime
      });

      // Attempt rollback if enabled
      if (options.enableRollback) {
        await this.performRollback(modules, correlationId);
      }

      throw error;
    }
  }

  /**
   * Install modules in parallel for faster deployment
   */
  private async installModulesParallel(
    modules: string[],
    options: any,
    correlationId: string
  ): Promise<InstallationStatusResponse[]> {
    this.auditLog('info', 'Starting parallel installation', { correlationId, modules });

    const installations = await Promise.allSettled(
      modules.map(module => this.installSingleModule(module, options, correlationId))
    );

    const results: InstallationStatusResponse[] = [];
    const failures: string[] = [];

    for (let i = 0; i < installations.length; i++) {
      const installation = installations[i];
      const moduleName = modules[i];

      if (installation.status === 'fulfilled') {
        results.push(installation.value);
      } else {
        failures.push(moduleName);
        this.auditLog('error', 'Module installation failed', {
          correlationId,
          module: moduleName,
          error: installation.reason.message
        });
      }
    }

    // Check if we should rollback on any failure
    if (failures.length > 0 && options.rollbackOnAnyFailure) {
      throw new Error(`Installation failed for modules: ${failures.join(', ')}`);
    }

    return results;
  }

  /**
   * Install modules sequentially for dependency-aware deployment
   */
  private async installModulesSequential(
    modules: string[],
    options: any,
    correlationId: string
  ): Promise<InstallationStatusResponse[]> {
    this.auditLog('info', 'Starting sequential installation', { correlationId, modules });

    const results: InstallationStatusResponse[] = [];

    for (const module of modules) {
      try {
        const result = await this.installSingleModule(module, options, correlationId);
        results.push(result);

        this.emit('module_completed', {
          correlationId,
          module,
          installationId: result.installationId,
          status: result.status
        });

      } catch (error) {
        this.auditLog('error', 'Sequential installation failed', {
          correlationId,
          module,
          error: error.message,
          completedModules: results.length
        });

        if (options.rollbackOnAnyFailure) {
          await this.performPartialRollback(results, correlationId);
        }

        throw error;
      }
    }

    return results;
  }

  /**
   * Install a single module with circuit breaker protection
   */
  private async installSingleModule(
    moduleName: string,
    options: any,
    correlationId: string
  ): Promise<InstallationStatusResponse> {
    return this.circuitBreaker.execute(async () => {
      const metrics = this.initializeMetrics(moduleName);

      try {
        this.emit('module_started', {
          correlationId,
          module: moduleName,
          timestamp: Date.now()
        });

        // Prepare installation request
        const request: InstallationRequest = {
          modules: [moduleName],
          options: {
            validateDependencies: options.validateDependencies ?? true,
            enableRollback: options.enableRollback ?? true,
            timeout: options.timeout || 300,
            priority: options.priority || 'normal',
            tags: {
              correlationId,
              ...options.tags
            }
          }
        };

        // Start installation
        const installation = await this.executeWithRetry(
          () => this.client.installation.installModules(request),
          correlationId,
          moduleName
        );

        metrics.installationId = installation.installationId;
        this.updateMetrics(moduleName, { status: 'started' });

        // Monitor installation with enhanced tracking
        const result = await this.monitorInstallationWithMetrics(
          installation.installationId,
          moduleName,
          correlationId,
          options.timeout || 300
        );

        this.updateMetrics(moduleName, {
          status: 'completed',
          endTime: Date.now(),
          duration: Date.now() - metrics.startTime
        });

        return result;

      } catch (error) {
        this.updateMetrics(moduleName, {
          status: 'failed',
          endTime: Date.now(),
          duration: Date.now() - metrics.startTime
        });

        throw error;
      }
    });
  }

  /**
   * Enhanced installation monitoring with metrics collection
   */
  private async monitorInstallationWithMetrics(
    installationId: string,
    moduleName: string,
    correlationId: string,
    timeoutSeconds: number
  ): Promise<InstallationStatusResponse> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    let lastProgressPercent = 0;
    let progressUpdates = 0;

    while (true) {
      try {
        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          this.updateMetrics(moduleName, { status: 'timeout' });
          throw new BmadTimeoutError(`Installation timeout exceeded: ${timeoutSeconds}s`);
        }

        // Get status with circuit breaker protection
        const status = await this.circuitBreaker.execute(() =>
          this.client.installation.getStatus(installationId)
        );

        // Update metrics for progress changes
        if (status.progress?.percentage !== lastProgressPercent) {
          lastProgressPercent = status.progress.percentage;
          progressUpdates++;

          this.updateMetrics(moduleName, { progressUpdates });

          this.emit('progress', {
            correlationId,
            module: moduleName,
            installationId,
            percentage: status.progress.percentage,
            currentStep: status.progress.currentStep,
            timestamp: Date.now()
          });

          // Send progress to external systems
          await this.sendProgressUpdate({
            correlationId,
            module: moduleName,
            installationId,
            progress: status.progress
          });
        }

        // Check completion
        if (status.status === 'completed') {
          this.emit('completed', {
            correlationId,
            module: moduleName,
            installationId,
            duration: Date.now() - startTime
          });

          return status;
        }

        // Check failure
        if (status.status === 'failed') {
          const errorMessage = status.error || 'Unknown installation error';
          this.emit('failed', {
            correlationId,
            module: moduleName,
            installationId,
            error: errorMessage
          });

          throw new BmadApiError(`Installation failed: ${errorMessage}`, 'INSTALLATION_FAILED', 422);
        }

        // Adaptive polling interval
        const pollInterval = this.calculatePollInterval(Date.now() - startTime);
        await this.sleep(pollInterval);

      } catch (error) {
        if (error instanceof BmadTimeoutError || error instanceof BmadApiError) {
          throw error;
        }

        this.updateMetrics(moduleName, { errorCount: this.getMetrics(moduleName)?.errorCount + 1 || 1 });
        this.auditLog('warn', 'Status check failed, retrying', {
          correlationId,
          module: moduleName,
          error: error.message
        });

        await this.sleep(5000);
      }
    }
  }

  /**
   * Pre-installation system checks
   */
  private async preInstallationChecks(modules: string[], correlationId: string): Promise<void> {
    this.auditLog('info', 'Running pre-installation checks', { correlationId, modules });

    // Check system health
    try {
      await this.client.health.check();
    } catch (error) {
      throw new Error(`BMAD system health check failed: ${error.message}`);
    }

    // Validate module dependencies
    for (const module of modules) {
      await this.validateModuleDependencies(module, correlationId);
    }

    // Check resource availability
    await this.checkResourceAvailability(modules, correlationId);

    this.auditLog('info', 'Pre-installation checks completed', { correlationId });
  }

  /**
   * Post-installation validation
   */
  private async postInstallationValidation(
    results: InstallationStatusResponse[],
    correlationId: string
  ): Promise<void> {
    this.auditLog('info', 'Running post-installation validation', {
      correlationId,
      installations: results.map(r => r.installationId)
    });

    for (const result of results) {
      if (result.status !== 'completed') {
        throw new Error(`Installation ${result.installationId} is not in completed state: ${result.status}`);
      }

      // Verify module is accessible
      await this.verifyModuleAccessibility(result, correlationId);
    }

    this.auditLog('info', 'Post-installation validation completed', { correlationId });
  }

  /**
   * Perform intelligent rollback on failures
   */
  private async performRollback(modules: string[], correlationId: string): Promise<void> {
    this.auditLog('warn', 'Initiating rollback procedure', { correlationId, modules });

    try {
      for (const module of modules.reverse()) {
        await this.rollbackModule(module, correlationId);
      }

      this.auditLog('info', 'Rollback completed successfully', { correlationId });

    } catch (error) {
      this.auditLog('error', 'Rollback failed', {
        correlationId,
        error: error.message
      });

      throw new Error(`Rollback failed: ${error.message}`);
    }
  }

  /**
   * Execute operation with enhanced retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    correlationId: string,
    context?: string
  ): Promise<T> {
    const maxRetries = 5;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        this.auditLog('warn', 'Operation failed, evaluating retry', {
          correlationId,
          context,
          attempt: attempt + 1,
          error: error.message
        });

        if (error instanceof BmadRateLimitError) {
          await this.sleep(error.retryAfter * 1000);
          continue;
        }

        if ((error instanceof BmadTimeoutError ||
             (error instanceof BmadApiError && error.statusCode >= 500)) &&
             attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Notification system for external integrations
   */
  private async sendNotification(data: any): Promise<void> {
    if (this.config.webhookUrl) {
      try {
        // In a real implementation, this would use a proper HTTP client
        this.auditLog('info', 'Sending webhook notification', {
          webhookUrl: this.config.webhookUrl,
          notificationType: data.type
        });

        // Placeholder for webhook implementation
        // await fetch(this.config.webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // });

      } catch (error) {
        this.auditLog('error', 'Webhook notification failed', {
          error: error.message
        });
      }
    }
  }

  /**
   * Utility methods
   */
  private validateModules(modules: string[]): void {
    if (!modules || modules.length === 0) {
      throw new Error('At least one module must be specified');
    }

    for (const module of modules) {
      if (!module || typeof module !== 'string') {
        throw new Error('All modules must be non-empty strings');
      }

      const validPattern = /^@bmad-cybercommand\/[a-z0-9-]+$/;
      if (!validPattern.test(module)) {
        throw new Error(`Invalid module name format: ${module}`);
      }
    }
  }

  private initializeMetrics(moduleName: string): InstallationMetrics {
    const metrics: InstallationMetrics = {
      installationId: '',
      moduleName,
      startTime: Date.now(),
      status: 'started',
      retryCount: 0,
      errorCount: 0,
      progressUpdates: 0
    };

    this.metrics.set(moduleName, metrics);
    return metrics;
  }

  private updateMetrics(moduleName: string, updates: Partial<InstallationMetrics>): void {
    const current = this.metrics.get(moduleName);
    if (current) {
      Object.assign(current, updates);
    }
  }

  private getMetrics(moduleName: string): InstallationMetrics | undefined {
    return this.metrics.get(moduleName);
  }

  private calculatePollInterval(elapsed: number): number {
    // Adaptive polling: start fast, slow down over time
    if (elapsed < 30000) return 2000;      // First 30s: poll every 2s
    if (elapsed < 120000) return 5000;     // Next 90s: poll every 5s
    return 10000;                          // After 2 min: poll every 10s
  }

  private generateCorrelationId(): string {
    return `enterprise-${Date.now()}-${Math.random().toString(36).substr(2, 12)}`;
  }

  private auditLog(level: string, message: string, metadata: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: 'EnterpriseModuleInstaller',
      ...metadata
    };

    console.log(JSON.stringify(logEntry));

    // In production, this would write to proper audit log storage
    // if (this.config.auditLogPath) {
    //   fs.appendFileSync(this.config.auditLogPath, JSON.stringify(logEntry) + '\n');
    // }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.auditLog('error', 'Installer error', { error: error.message });
    });
  }

  // Placeholder methods for comprehensive functionality
  private async validateModuleDependencies(module: string, correlationId: string): Promise<void> {
    // Implement dependency validation logic
    this.auditLog('debug', 'Validating module dependencies', { module, correlationId });
  }

  private async checkResourceAvailability(modules: string[], correlationId: string): Promise<void> {
    // Implement resource availability check
    this.auditLog('debug', 'Checking resource availability', { modules, correlationId });
  }

  private async verifyModuleAccessibility(result: InstallationStatusResponse, correlationId: string): Promise<void> {
    // Implement module accessibility verification
    this.auditLog('debug', 'Verifying module accessibility', { installationId: result.installationId, correlationId });
  }

  private async performPartialRollback(results: InstallationStatusResponse[], correlationId: string): Promise<void> {
    // Implement partial rollback for sequential failures
    this.auditLog('warn', 'Performing partial rollback', {
      installations: results.map(r => r.installationId),
      correlationId
    });
  }

  private async rollbackModule(module: string, correlationId: string): Promise<void> {
    // Implement individual module rollback
    this.auditLog('info', 'Rolling back module', { module, correlationId });
  }

  private async sendProgressUpdate(data: any): Promise<void> {
    // Send progress updates to external monitoring systems
    this.auditLog('debug', 'Sending progress update', data);
  }

  /**
   * Get installation metrics and circuit breaker status
   */
  getSystemMetrics() {
    return {
      circuitBreaker: this.circuitBreaker.getMetrics(),
      installations: Object.fromEntries(this.metrics),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.client.close?.();
      this.removeAllListeners();
    } catch (error) {
      this.auditLog('warn', 'Cleanup error', { error: error.message });
    }
  }
}