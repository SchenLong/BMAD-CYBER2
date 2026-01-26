/**
 * EPIC 2 PACKAGE MANAGEMENT - DEPENDENCY RESOLUTION ENGINE EXPORTS
 * Master export file for the complete dependency resolution system
 *
 * @author Dependency Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

// Resolver exports
export * from './resolver';
export { DependencyResolver } from './resolver/dependency-resolver';

// Validator exports
export {
  BMADDependencyValidator,
  ValidationResult,
  ValidationConfig,
  createValidator,
  validateProject
} from './validator';

// Manager exports
export {
  BMADDependencyManager,
  OperationContext,
  OperationType,
  OperationState,
  DependencyManagerConfig,
  createManager,
  initializeManager
} from './manager';

// Type re-exports for complete type coverage
export type {
  // Resolution types
  ResolutionContext,
  ResolutionStrategy,
  ResolutionConstraints,
  ResolutionResult,
  ResolutionWarning,
  ResolutionError,
  ResolutionStats,
  ResolutionRecommendation,
  SecurityConstraints,
  CompatibilityConstraints,
  PerformanceConstraints,
  LicensingConstraints,
  GovernanceConstraints,
  ConflictResolutionPolicy,
  VersionSelectionPolicy,
  PruningPolicy,
  OptimizationPolicy,
  PlatformInfo,
  ResolutionCache,

  // Package types
  PackageIdentifier,
  PackageMetadata,
  DependencyDeclaration,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  DependencyConflict,
  DependencyCycle,
  VersionRange,
  SemverVersion
} from './resolver';

/**
 * BMAD Dependency Resolution Engine Factory
 * Creates a complete dependency management system with all components integrated
 */
export class DependencyEngine {
  private resolver: import('./resolver/dependency-resolver').DependencyResolver;
  private validator: any; // JavaScript validator
  private manager: any; // JavaScript manager

  constructor(projectRoot: string = process.cwd(), config: any = {}) {
    // Initialize TypeScript resolver
    this.resolver = new (require('./resolver/dependency-resolver').DependencyResolver)();

    // Initialize JavaScript validator
    const { BMADDependencyValidator } = require('./validator/dependency-validator');
    this.validator = new BMADDependencyValidator(projectRoot, config.validator);

    // Initialize JavaScript manager
    const { BMADDependencyManager } = require('./manager/bmad-dependency-manager');
    this.manager = new BMADDependencyManager(projectRoot, config.manager);
  }

  /**
   * Get the dependency resolver instance
   */
  getResolver() {
    return this.resolver;
  }

  /**
   * Get the dependency validator instance
   */
  getValidator() {
    return this.validator;
  }

  /**
   * Get the dependency manager instance
   */
  getManager() {
    return this.manager;
  }

  /**
   * Initialize the complete dependency engine
   */
  async initialize() {
    // Initialize manager (which initializes security integration)
    await this.manager.initializeSystem();

    // Run initial validation
    const validationResult = await this.validator.validateAll();

    if (validationResult.overall_status === 'fail') {
      const criticalErrors = validationResult.errors.filter((e: any) =>
        e.component === 'security-integration' || e.component === 'core-implementation'
      );

      if (criticalErrors.length > 0) {
        throw new Error(
          `Critical dependency engine initialization failures: ${
            criticalErrors.map((e: any) => e.message).join(', ')
          }`
        );
      }
    }

    return {
      status: 'ready',
      validation: validationResult,
      features: await this.manager.getStatus()
    };
  }

  /**
   * Comprehensive dependency resolution with validation and management
   */
  async resolveWithValidation(
    rootPackage: import('./resolver').PackageIdentifier,
    registry: any,
    options: Partial<import('./resolver').ResolutionStrategy> = {}
  ) {
    try {
      // Step 1: Resolve dependencies
      const resolutionResult = await this.resolver.resolve(rootPackage, registry, options);

      // Step 2: Validate resolution for security and compliance
      const validationContext = {
        type: 'resolution-validation',
        target: rootPackage,
        options: { ...options, resolutionResult }
      };

      // Step 3: Apply management policies
      const managedResult = await this.manager.executeOperation(validationContext);

      return {
        resolution: resolutionResult,
        validation: managedResult.validation,
        management: managedResult,
        recommendations: [
          ...(resolutionResult.recommendations || []),
          ...(managedResult.recommendations || [])
        ]
      };

    } catch (error) {
      throw new Error(`Comprehensive dependency resolution failed: ${error.message}`);
    }
  }

  /**
   * Install dependencies with full validation and security checks
   */
  async installDependencies(dependencies: any[], options: any = {}) {
    return await this.manager.install(dependencies, options);
  }

  /**
   * Update dependencies with comprehensive validation
   */
  async updateDependencies(target: string | string[], options: any = {}) {
    return await this.manager.update(target, options);
  }

  /**
   * Perform comprehensive security scan
   */
  async performSecurityScan(target?: string | string[], options: any = {}) {
    return await this.manager.securityScan(target, options);
  }

  /**
   * Get system status across all components
   */
  async getSystemStatus() {
    const [managerStatus, validationResult] = await Promise.all([
      this.manager.getStatus(),
      this.validator.validateAll()
    ]);

    return {
      overall: managerStatus.status === 'operational' && validationResult.overall_status !== 'fail'
        ? 'operational' : 'degraded',
      manager: managerStatus,
      validation: {
        status: validationResult.overall_status,
        errors: validationResult.errors.length,
        warnings: validationResult.warnings.length,
        lastRun: validationResult.timestamp
      },
      resolver: {
        status: 'operational',
        cacheStats: this.resolver['cache']?.size || 0
      }
    };
  }
}

/**
 * Factory function to create a complete dependency engine
 */
export function createDependencyEngine(projectRoot?: string, config?: any): DependencyEngine {
  return new DependencyEngine(projectRoot, config);
}

/**
 * Quick initialization function
 */
export async function initializeDependencyEngine(
  projectRoot?: string,
  config?: any
): Promise<DependencyEngine> {
  const engine = new DependencyEngine(projectRoot, config);
  await engine.initialize();
  return engine;
}