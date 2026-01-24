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
/// <reference types="node" />
import { EventEmitter } from 'events';
import type { OrchestratorConfig, InstallationSession, InstallationResult, InstallationStep, InstallationStatistics } from './types.js';
import type { ITemplateEngine, IConfigurationManager, IConfigurationValidator, IDependencyManager, IPostInstallVerifier } from './interfaces.js';
/**
 * Result type for error handling without exceptions
 */
export declare class Result<T, E = Error> {
    private readonly _value?;
    private readonly _error?;
    private readonly _isOk;
    private constructor();
    static ok<T>(value: T): Result<T>;
    static error<E extends Error>(error: E): Result<never, E>;
    isOk(): this is {
        _value: T;
    };
    isError(): this is {
        _error: E;
    };
    unwrap(): T;
    unwrapOr(defaultValue: T): T;
    map<U>(fn: (value: T) => U): Result<U, E>;
    mapError<F extends Error>(fn: (error: E) => F): Result<T, F>;
    get error(): E | undefined;
    get value(): T | undefined;
}
/**
 * Installation step executor for clean separation of concerns
 */
export declare class InstallationStepExecutor {
    private readonly templateEngine;
    private readonly configManager;
    private readonly dependencyManager;
    constructor(templateEngine: ITemplateEngine, configManager: IConfigurationManager, dependencyManager: IDependencyManager);
    executeStep(step: InstallationStep, context: InstallationSession): Promise<Result<void>>;
    private executeValidation;
    private executeDependencyResolution;
    private executeTemplateProcessing;
    private executeFileGeneration;
}
/**
 * Installation progress tracker
 */
export declare class InstallationProgressTracker extends EventEmitter {
    private currentStep;
    private totalSteps;
    private startTime;
    initialize(totalSteps: number): void;
    nextStep(stepName: string): void;
    complete(): void;
    error(error: Error, stepName: string): void;
}
/**
 * Main orchestrator implementing clean architecture principles
 */
export declare class BMADInstallationOrchestrator extends EventEmitter {
    private readonly templateEngine;
    private readonly configManager;
    private readonly configValidator;
    private readonly dependencyManager;
    private readonly postInstallVerifier;
    private readonly config;
    private readonly stepExecutor;
    private readonly progressTracker;
    private readonly sessions;
    private readonly statistics;
    constructor(config: OrchestratorConfig, templateEngine: ITemplateEngine, configManager: IConfigurationManager, configValidator: IConfigurationValidator, dependencyManager: IDependencyManager, postInstallVerifier: IPostInstallVerifier);
    /**
     * Main installation entry point with comprehensive error handling
     */
    installModule(moduleName: string, moduleConfig: Record<string, unknown>): Promise<Result<InstallationResult>>;
    /**
     * Batch installation with concurrent processing
     */
    installMultipleModules(modules: Array<{
        name: string;
        config: Record<string, unknown>;
    }>, options?: {
        maxConcurrency?: number;
        failFast?: boolean;
    }): Promise<Result<InstallationResult[]>>;
    /**
     * Get installation statistics
     */
    getStatistics(): InstallationStatistics;
    /**
     * Health check for orchestrator
     */
    healthCheck(): Promise<{
        healthy: boolean;
        components: Record<string, boolean>;
        activeSessions: number;
    }>;
    private mergeWithDefaults;
    private createInstallationSession;
    private validateInstallation;
    private executeInstallationSteps;
    private verifyInstallation;
    private completeInstallation;
    private cleanupFailedInstallation;
    private generateSessionId;
    private generateInstallationSteps;
    private validateSystemRequirements;
    private updateStatistics;
    private initializeStatistics;
    private setupEventHandlers;
    private checkComponentHealth;
}
export default BMADInstallationOrchestrator;
//# sourceMappingURL=orchestrator.d.ts.map