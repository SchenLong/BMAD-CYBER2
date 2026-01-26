/**
 * BMAD AUTOMATION MODULE - EPIC 5 MAIN EXPORT
 * Centralized exports for all automation infrastructure components
 *
 * @module automation
 * @version 1.0.0
 * @epic Epic 5 - Automation & Build Infrastructure Export
 */

// Story 5.1: Build Orchestration
export { BuildOrchestrator } from './build-scripts/orchestrator/build';
export { DependencyManager } from './build-scripts/orchestrator/dependency-manager';
export { MultiLanguageCoordinator } from './build-scripts/orchestrator/multi-language-coordinator';

// Story 5.2: Deployment Automation
export { DeploymentInstaller } from './deployment/installer/install';

// Story 5.3: Configuration Management
export { ConfigurationManager } from './configuration/manager/bmad-configuration-manager';

// Story 5.4: Template Engine
export { TemplateValidator } from './templates/validator/template-validator';
export { BMADSecurity as TemplateSecurity } from './templates/security/template-security';

// Story 5.5: Installation Logging
export { InstallationLogger } from './logging/installer/installation-logger';
export { ProgressReporter } from './logging/progress/progress-reporter';

// Story 5.6: Validation & Quality Automation
export { QualityGateEnforcer } from './validation/core/quality-gate-enforcer';

// Story 5.7: Build Performance Optimization
export { BuildCacheManager } from './caching/build-cache-manager';
export { IncrementalBuilder } from './incremental/incremental-builder';
export { BuildTimeProfiler } from './build-time/build-time-profiler';
export { BuildMonitor } from './monitoring/build-monitor';
export { OptimizationEngine } from './optimization/optimization-engine';
export { ParallelCoordinator } from './parallel-builds/parallel-coordinator';
export { ResourceOptimizer } from './resource-optimization/resource-optimizer';

// Type exports
export interface AutomationConfig {
  buildOrchestrator?: {
    maxParallelBuilds?: number;
    buildTimeout?: number;
    retryLimit?: number;
    cacheEnabled?: boolean;
  };
  deployment?: {
    strategy?: 'blue-green' | 'rolling' | 'canary';
    healthCheckTimeout?: number;
    rollbackOnFailure?: boolean;
  };
  configuration?: {
    configDir?: string;
    schemaDir?: string;
    enableDriftDetection?: boolean;
  };
  templates?: {
    templateDir?: string;
    outputDir?: string;
    strictMode?: boolean;
  };
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    outputFormat?: 'json' | 'text';
  };
  performance?: {
    cacheEnabled?: boolean;
    incrementalEnabled?: boolean;
    parallelization?: number;
  };
}

/**
 * Initialize all automation components with unified configuration
 */
export async function initializeAutomation(config: AutomationConfig = {}): Promise<{
  buildOrchestrator: any;
  deploymentInstaller: any;
  configurationManager: any;
  templateValidator: any;
  installationLogger: any;
  qualityGateEnforcer: any;
  buildCacheManager: any;
}> {
  const { BuildOrchestrator } = await import('./build-scripts/orchestrator/build');
  const { DeploymentInstaller } = await import('./deployment/installer/install');
  const { ConfigurationManager } = await import('./configuration/manager/bmad-configuration-manager');
  const { TemplateValidator } = await import('./templates/validator/template-validator');
  const { InstallationLogger } = await import('./logging/installer/installation-logger');
  const { QualityGateEnforcer } = await import('./validation/core/quality-gate-enforcer');
  const { BuildCacheManager } = await import('./caching/build-cache-manager');

  const buildOrchestrator = new BuildOrchestrator(config.buildOrchestrator);
  const deploymentInstaller = new DeploymentInstaller(config.deployment);
  const configurationManager = new ConfigurationManager(config.configuration);
  const templateValidator = new TemplateValidator(config.templates);
  const installationLogger = new InstallationLogger(config.logging);
  const qualityGateEnforcer = new QualityGateEnforcer();
  const buildCacheManager = new BuildCacheManager(config.performance);

  // Initialize components
  await configurationManager.initialize();
  await templateValidator.initialize();

  return {
    buildOrchestrator,
    deploymentInstaller,
    configurationManager,
    templateValidator,
    installationLogger,
    qualityGateEnforcer,
    buildCacheManager
  };
}

/**
 * Health check for all automation components
 */
export async function performHealthCheck(components: any): Promise<{
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, any>;
}> {
  const results: Record<string, any> = {};
  let unhealthyCount = 0;

  for (const [name, component] of Object.entries(components)) {
    if (component && typeof (component as any).performHealthCheck === 'function') {
      try {
        results[name] = await (component as any).performHealthCheck();
      } catch (error) {
        results[name] = { status: 'unhealthy', error: (error as Error).message };
        unhealthyCount++;
      }
    }
  }

  return {
    overall: unhealthyCount === 0 ? 'healthy' : unhealthyCount < Object.keys(components).length / 2 ? 'degraded' : 'unhealthy',
    components: results
  };
}

/**
 * Graceful shutdown for all automation components
 */
export async function shutdownAutomation(components: any): Promise<void> {
  for (const [name, component] of Object.entries(components)) {
    if (component && typeof (component as any).shutdown === 'function') {
      try {
        await (component as any).shutdown();
        console.log(`[AUTOMATION] ${name} shutdown complete`);
      } catch (error) {
        console.error(`[AUTOMATION] ${name} shutdown error: ${(error as Error).message}`);
      }
    }
  }
}
