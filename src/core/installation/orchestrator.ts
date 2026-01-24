/**
 * BMAD Installation Orchestrator - Refactored TypeScript Implementation
 * ===================================================================
 *
 * Clean, type-safe orchestrator implementing SOLID principles
 * and modern TypeScript patterns.
 *
 * @author Amelia (Dev) - Refactored from original implementation
 * @version 2.0.0
 */

import { EventEmitter } from 'events';
import type {
  OrchestratorConfig,
  InstallationSession,
  InstallationResult,
  InstallationStep,
  InstallationStatistics,
  DependencyGraph,
  ValidationResult
} from './types.js';
import type {
  ITemplateEngine,
  IConfigurationManager,
  IConfigurationValidator,
  IDependencyManager,
  IPostInstallVerifier
} from './interfaces.js';

/**
 * Result type for error handling without exceptions
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _isOk: boolean = true
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(value, undefined, true);
  }

  static error<E extends Error>(error: E): Result<never, E> {
    return new Result(undefined, error, false);
  }

  isOk(): this is { _value: T } {
    return this._isOk && this._error === undefined;
  }

  isError(): this is { _error: E } {
    return !this._isOk && this._error !== undefined;
  }

  unwrap(): T {
    if (!this.isOk()) {
      throw this._error || new Error('Result contains an error');
    }
    return this._value!;
  }

  unwrapOr(defaultValue: T): T {
    return this.isOk() ? this._value! : defaultValue;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isOk() ? Result.ok(fn(this._value!)) : Result.error(this._error!);
  }

  mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    return this.isError() ? Result.error(fn(this._error!)) : Result.ok(this._value!);
  }

  get error(): E | undefined {
    return this._error;
  }

  get value(): T | undefined {
    return this._value;
  }
}

/**
 * Installation step executor for clean separation of concerns
 */
export class InstallationStepExecutor {
  constructor(
    private readonly templateEngine: ITemplateEngine,
    private readonly configManager: IConfigurationManager,
    private readonly dependencyManager: IDependencyManager
  ) {}

  async executeStep(step: InstallationStep, context: InstallationSession): Promise<Result<void>> {
    try {
      switch (step.type) {
        case 'validation':
          return await this.executeValidation(step, context);
        case 'dependency_resolution':
          return await this.executeDependencyResolution(step, context);
        case 'template_processing':
          return await this.executeTemplateProcessing(step, context);
        case 'file_generation':
          return await this.executeFileGeneration(step, context);
        default:
          return Result.error(new Error(`Unknown step type: ${step.type}`));
      }
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private async executeValidation(
    step: InstallationStep,
    context: InstallationSession
  ): Promise<Result<void>> {
    const validationResult = await this.configManager.validateConfiguration(context.config);
    return validationResult.isValid
      ? Result.ok(undefined)
      : Result.error(new Error(`Validation failed: ${validationResult.errors.join(', ')}`));
  }

  private async executeDependencyResolution(
    step: InstallationStep,
    context: InstallationSession
  ): Promise<Result<void>> {
    const resolutionResult = await this.dependencyManager.resolveDependencies(context.dependencies);
    return resolutionResult.success
      ? Result.ok(undefined)
      : Result.error(new Error(`Dependency resolution failed: ${resolutionResult.error}`));
  }

  private async executeTemplateProcessing(
    step: InstallationStep,
    context: InstallationSession
  ): Promise<Result<void>> {
    const templates = step.metadata?.templates as string[] || [];
    for (const template of templates) {
      const result = await this.templateEngine.processTemplate(template, context.templateData);
      if (!result.success) {
        return Result.error(new Error(`Template processing failed: ${result.error}`));
      }
    }
    return Result.ok(undefined);
  }

  private async executeFileGeneration(
    step: InstallationStep,
    context: InstallationSession
  ): Promise<Result<void>> {
    // File generation logic would go here
    return Result.ok(undefined);
  }
}

/**
 * Installation progress tracker
 */
export class InstallationProgressTracker extends EventEmitter {
  private currentStep = 0;
  private totalSteps = 0;
  private startTime = Date.now();

  initialize(totalSteps: number): void {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    this.startTime = Date.now();
    this.emit('progress', { current: 0, total: totalSteps, percentage: 0 });
  }

  nextStep(stepName: string): void {
    this.currentStep++;
    const percentage = Math.round((this.currentStep / this.totalSteps) * 100);
    this.emit('progress', {
      current: this.currentStep,
      total: this.totalSteps,
      percentage,
      stepName,
      elapsed: Date.now() - this.startTime
    });
  }

  complete(): void {
    const elapsed = Date.now() - this.startTime;
    this.emit('complete', { elapsed, totalSteps: this.totalSteps });
  }

  error(error: Error, stepName: string): void {
    const elapsed = Date.now() - this.startTime;
    this.emit('error', { error, stepName, elapsed, step: this.currentStep });
  }
}

/**
 * Main orchestrator implementing clean architecture principles
 */
export class BMADInstallationOrchestrator extends EventEmitter {
  private readonly config: Required<OrchestratorConfig>;
  private readonly stepExecutor: InstallationStepExecutor;
  private readonly progressTracker: InstallationProgressTracker;
  private readonly sessions = new Map<string, InstallationSession>();
  private readonly statistics: InstallationStatistics;

  constructor(
    config: OrchestratorConfig,
    private readonly templateEngine: ITemplateEngine,
    private readonly configManager: IConfigurationManager,
    private readonly configValidator: IConfigurationValidator,
    private readonly dependencyManager: IDependencyManager,
    private readonly postInstallVerifier: IPostInstallVerifier
  ) {
    super();
    this.config = this.mergeWithDefaults(config);
    this.stepExecutor = new InstallationStepExecutor(
      templateEngine,
      configManager,
      dependencyManager
    );
    this.progressTracker = new InstallationProgressTracker();
    this.statistics = this.initializeStatistics();
    this.setupEventHandlers();
  }

  /**
   * Main installation entry point with comprehensive error handling
   */
  async installModule(
    moduleName: string,
    moduleConfig: Record<string, unknown>
  ): Promise<Result<InstallationResult>> {
    const sessionId = this.generateSessionId();
    const startTime = Date.now();

    try {
      // Create installation session
      const session = await this.createInstallationSession(sessionId, moduleName, moduleConfig);
      if (session.isError()) {
        return session;
      }

      // Pre-installation validation
      const validationResult = await this.validateInstallation(session.unwrap());
      if (validationResult.isError()) {
        await this.cleanupFailedInstallation(sessionId);
        return validationResult;
      }

      // Execute installation steps
      const installationResult = await this.executeInstallationSteps(session.unwrap());
      if (installationResult.isError()) {
        await this.cleanupFailedInstallation(sessionId);
        return installationResult;
      }

      // Post-installation verification
      const verificationResult = await this.verifyInstallation(session.unwrap());
      if (verificationResult.isError()) {
        await this.cleanupFailedInstallation(sessionId);
        return verificationResult;
      }

      // Complete installation
      const result = await this.completeInstallation(session.unwrap(), startTime);
      this.updateStatistics(true, Date.now() - startTime);
      return result;

    } catch (error) {
      await this.cleanupFailedInstallation(sessionId);
      this.updateStatistics(false, Date.now() - startTime);
      return Result.error(error instanceof Error ? error : new Error('Unknown installation error'));
    } finally {
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Batch installation with concurrent processing
   */
  async installMultipleModules(
    modules: Array<{ name: string; config: Record<string, unknown> }>,
    options: { maxConcurrency?: number; failFast?: boolean } = {}
  ): Promise<Result<InstallationResult[]>> {
    const { maxConcurrency = 3, failFast = false } = options;
    const results: InstallationResult[] = [];
    const errors: Error[] = [];

    // Process modules in batches
    for (let i = 0; i < modules.length; i += maxConcurrency) {
      const batch = modules.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(module =>
        this.installModule(module.name, module.config)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      for (const batchResult of batchResults) {
        if (batchResult.status === 'fulfilled' && batchResult.value.isOk()) {
          results.push(batchResult.value.unwrap());
        } else {
          const error = batchResult.status === 'rejected'
            ? new Error(batchResult.reason)
            : batchResult.value.error!;
          errors.push(error);

          if (failFast) {
            return Result.error(error);
          }
        }
      }
    }

    return errors.length === 0
      ? Result.ok(results)
      : Result.error(new Error(`${errors.length} installations failed`));
  }

  /**
   * Get installation statistics
   */
  getStatistics(): InstallationStatistics {
    return { ...this.statistics };
  }

  /**
   * Health check for orchestrator
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    components: Record<string, boolean>;
    activeSessions: number;
  }> {
    const components = {
      templateEngine: await this.checkComponentHealth(() =>
        this.templateEngine.healthCheck?.()
      ),
      configManager: await this.checkComponentHealth(() =>
        this.configManager.healthCheck?.()
      ),
      dependencyManager: await this.checkComponentHealth(() =>
        this.dependencyManager.healthCheck?.()
      ),
      postInstallVerifier: await this.checkComponentHealth(() =>
        this.postInstallVerifier.healthCheck?.()
      )
    };

    const healthy = Object.values(components).every(Boolean);

    return {
      healthy,
      components,
      activeSessions: this.sessions.size
    };
  }

  // Private methods

  private mergeWithDefaults(config: OrchestratorConfig): Required<OrchestratorConfig> {
    return {
      bmadRoot: './_bmad',
      outputPath: './generated',
      enableValidation: true,
      enableVerification: true,
      enableBackup: true,
      strictMode: false,
      maxConcurrentInstallations: 3,
      timeoutMs: 300000, // 5 minutes
      ...config
    };
  }

  private async createInstallationSession(
    sessionId: string,
    moduleName: string,
    moduleConfig: Record<string, unknown>
  ): Promise<Result<InstallationSession>> {
    try {
      const session: InstallationSession = {
        id: sessionId,
        moduleName,
        config: moduleConfig,
        steps: await this.generateInstallationSteps(moduleName, moduleConfig),
        dependencies: await this.dependencyManager.analyzeDependencies(moduleName),
        templateData: await this.configManager.prepareTemplateData(moduleConfig),
        startTime: Date.now(),
        status: 'initializing'
      };

      this.sessions.set(sessionId, session);
      this.emit('session:created', { sessionId, moduleName });
      return Result.ok(session);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Session creation failed'));
    }
  }

  private async validateInstallation(session: InstallationSession): Promise<Result<ValidationResult>> {
    try {
      // Validate configuration
      const configValidation = await this.configValidator.validate(session.config);
      if (!configValidation.isValid) {
        return Result.error(new Error(`Configuration validation failed: ${configValidation.errors.join(', ')}`));
      }

      // Validate dependencies
      const dependencyValidation = await this.dependencyManager.validateDependencies(session.dependencies);
      if (!dependencyValidation.success) {
        return Result.error(new Error(`Dependency validation failed: ${dependencyValidation.error}`));
      }

      // Validate system requirements
      if (this.config.strictMode) {
        const systemValidation = await this.validateSystemRequirements(session);
        if (systemValidation.isError()) {
          return systemValidation;
        }
      }

      return Result.ok({ isValid: true, errors: [] });
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Validation failed'));
    }
  }

  private async executeInstallationSteps(session: InstallationSession): Promise<Result<void>> {
    this.progressTracker.initialize(session.steps.length);
    session.status = 'installing';

    for (const step of session.steps) {
      this.progressTracker.nextStep(step.name);
      this.emit('step:start', { sessionId: session.id, step: step.name });

      const stepResult = await this.stepExecutor.executeStep(step, session);
      if (stepResult.isError()) {
        this.progressTracker.error(stepResult.error!, step.name);
        this.emit('step:error', { sessionId: session.id, step: step.name, error: stepResult.error });
        return stepResult;
      }

      this.emit('step:complete', { sessionId: session.id, step: step.name });
    }

    this.progressTracker.complete();
    return Result.ok(undefined);
  }

  private async verifyInstallation(session: InstallationSession): Promise<Result<void>> {
    if (!this.config.enableVerification) {
      return Result.ok(undefined);
    }

    try {
      const verificationResult = await this.postInstallVerifier.verify(session);
      return verificationResult.success
        ? Result.ok(undefined)
        : Result.error(new Error(`Installation verification failed: ${verificationResult.error}`));
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Verification failed'));
    }
  }

  private async completeInstallation(
    session: InstallationSession,
    startTime: number
  ): Promise<Result<InstallationResult>> {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const result: InstallationResult = {
      sessionId: session.id,
      moduleName: session.moduleName,
      success: true,
      duration,
      installedFiles: [], // Would be populated by actual installation steps
      generatedConfigs: [], // Would be populated by configuration generation
      warnings: [],
      metadata: {
        version: '1.0.0',
        installedAt: new Date(endTime).toISOString(),
        orchestratorVersion: '2.0.0'
      }
    };

    session.status = 'completed';
    this.emit('installation:complete', result);
    return Result.ok(result);
  }

  private async cleanupFailedInstallation(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'failed';
      this.emit('installation:failed', { sessionId, moduleName: session.moduleName });
    }
    // Additional cleanup logic would go here
  }

  private generateSessionId(): string {
    return `install-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateInstallationSteps(
    moduleName: string,
    config: Record<string, unknown>
  ): Promise<InstallationStep[]> {
    // This would be implemented based on module requirements
    return [
      { name: 'Validate Configuration', type: 'validation', order: 1 },
      { name: 'Resolve Dependencies', type: 'dependency_resolution', order: 2 },
      { name: 'Process Templates', type: 'template_processing', order: 3 },
      { name: 'Generate Files', type: 'file_generation', order: 4 }
    ];
  }

  private async validateSystemRequirements(session: InstallationSession): Promise<Result<void>> {
    // System requirements validation logic
    return Result.ok(undefined);
  }

  private updateStatistics(success: boolean, duration: number): void {
    this.statistics.totalInstallations++;
    if (success) {
      this.statistics.successfulInstallations++;
    } else {
      this.statistics.failedInstallations++;
    }

    // Update average installation time
    const totalTime = this.statistics.averageInstallationTime * (this.statistics.totalInstallations - 1) + duration;
    this.statistics.averageInstallationTime = totalTime / this.statistics.totalInstallations;
  }

  private initializeStatistics(): InstallationStatistics {
    return {
      totalInstallations: 0,
      successfulInstallations: 0,
      failedInstallations: 0,
      averageInstallationTime: 0
    };
  }

  private setupEventHandlers(): void {
    this.progressTracker.on('progress', progress => {
      this.emit('progress', progress);
    });

    this.progressTracker.on('error', errorInfo => {
      this.emit('step:error', errorInfo);
    });
  }

  private async checkComponentHealth(healthCheckFn?: () => Promise<boolean> | boolean): Promise<boolean> {
    try {
      return healthCheckFn ? await healthCheckFn() : true;
    } catch {
      return false;
    }
  }
}

export default BMADInstallationOrchestrator;