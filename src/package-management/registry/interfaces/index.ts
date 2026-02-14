/**
 * EPIC 2 PACKAGE MANAGEMENT - INTERFACES INDEX
 * Central export point for all package management interface definitions
 * Provides organized access to type definitions, interfaces, and abstractions
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.1
 */

// Re-export everything from package-types (these are the core types)
export * from './package-types';

// Import from registry-interfaces but use 'export type' to avoid runtime conflicts
// Note: Some types like ClientInfo, PerformanceConfig, PublisherInfo, SecurityConfig
// exist in both files - we use the versions from package-types
export type {
  IPackageRegistry,
  IRegistryBackend,
  IPackageIndex,
  IDependencyResolver,
  ISecurityScanner,
  ICacheManager,
  IAnalyticsCollector,
  PackagePublishRequest,
  PackagePublishResult,
  PackageDownloadRequest,
  PackageDownloadResult,
  PackageDeleteRequest,
  PackageDeleteResult,
  BackendConfiguration,
  IndexConfiguration,
  ResolverConfiguration,
  CacheConfiguration,
  ScannerConfiguration,
  AnalyticsConfiguration,
  RegistryHealth,
  RegistryStatistics,
  ComponentHealth,
  HealthStatus,
  PublishError,
  ValidationError,
  SecurityScanResult,
  VulnerabilityInfo,
  SecurityFinding,
  IRegistryPlugin,
  PluginCapability,
  RegistryExtensionPoints,
  IRegistryFactory,
  RegistryFactoryConfig
} from './registry-interfaces';

// Also export the non-conflicting exports
export { BaseRegistry } from './registry-interfaces';

// Common type unions for convenience
export type StorageBackendType = 'filesystem' | 's3' | 'gcs' | 'azure' | 'distributed' | 'memory';
export type IndexEngineType = 'elasticsearch' | 'solr' | 'sqlite' | 'postgresql' | 'mongodb' | 'memory';
export type SecurityScannerType = 'snyk' | 'sonatype' | 'blackduck' | 'veracode' | 'custom' | 'composite';
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'fifo' | 'lifo' | 'random';
export type ResolutionStrategy = 'latest' | 'oldest' | 'exact' | 'semver' | 'custom';
export type RegistryType = 'npm' | 'pypi' | 'maven' | 'nuget' | 'cargo' | 'github' | 'private' | 'federated';
