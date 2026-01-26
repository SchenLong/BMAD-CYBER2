/**
 * EPIC 2 PACKAGE MANAGEMENT - DEPENDENCY RESOLVER EXPORTS
 * Central export point for dependency resolution components
 *
 * @author Dependency Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

export { DependencyResolver } from './dependency-resolver';
export type {
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
  ResolutionCache
} from './dependency-resolver';

// Re-export types from package management interfaces
export type {
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
} from '../interfaces/package-types';