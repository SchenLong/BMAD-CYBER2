/**
 * EPIC 2 PACKAGE MANAGEMENT - INTERFACES INDEX
 * Central export point for all package management interface definitions
 * Provides organized access to type definitions, interfaces, and abstractions
 *
 * @author Package Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.1
 */

// Core package type definitions
export * from './package-types';

// Registry interface definitions
export * from './registry-interfaces';

// Re-export commonly used types for convenience
export type {
  // Core package types
  PackageMetadata,
  PackageIdentifier,
  PackageIntegrity,
  PackageSecurity,
  DependencyDeclaration,
  DependencyGraph,
  SemverVersion,
  VersionRange,

  // Registry types
  PackageRegistry,
  PackageSearchQuery,
  PackageSearchResult,
  RegistryConfiguration,
  RegistryContext,
  InstallationContext,

  // Interface contracts
  IPackageRegistry,
  IRegistryBackend,
  IPackageIndex,
  IDependencyResolver,
  ISecurityScanner,
  ICacheManager,
  IAnalyticsCollector,

  // Request/Response types
  PackagePublishRequest,
  PackagePublishResult,
  PackageDownloadRequest,
  PackageDownloadResult,
  PackageDeleteRequest,
  PackageDeleteResult,

  // Security types
  SecurityVulnerability,
  SecurityRestriction,
  SecurityScanResult,
  VulnerabilityInfo,
  SecurityFinding,

  // Quality and metrics
  QualityMetrics,
  UsageMetrics,
  AnalyticsEvent,
  PerformanceMetrics,
  SecurityMetrics,

  // Configuration types
  BackendConfiguration,
  IndexConfiguration,
  ResolverConfiguration,
  CacheConfiguration,
  AnalyticsConfiguration,

  // Health and monitoring
  RegistryHealth,
  RegistryStatistics,
  ComponentHealth,
  HealthStatus,

  // Error types
  PackageError,
  PackageErrorCode,
  PublishError,
  ValidationError,

  // Platform and environment
  PlatformRequirements,
  OSRequirement,
  ArchitectureRequirement,
  RuntimeRequirement,
  EnvironmentConstraint,

  // Licensing and compliance
  LicenseInformation,
  LegalCompliance,
  LicenseConflict,
  ComplianceExemption,

  // Publication and distribution
  PublicationInfo,
  PublisherInfo,
  DistributionChannel,
  AccessPolicy,
  LifecycleInfo,
  DeprecationInfo,

  // Plugin and extension
  IRegistryPlugin,
  PluginCapability,
  RegistryExtensionPoints,

  // Factory interfaces
  IRegistryFactory,
  RegistryFactoryConfig,

  // Base classes
  BaseRegistry
} from './registry-interfaces';

// Constants and enums for external use
export {
  DEFAULT_REGISTRY_TYPES,
  DEPENDENCY_TYPES,
  LIFECYCLE_STAGES,
  SECURITY_SEVERITIES,
  PERMISSIONS
} from './package-types';

// Type utility functions
export {
  isPackageIdentifier,
  isValidSemver,
  compareSemver,
  parseVersion,
  satisfiesRange
} from './package-types';

// Common type unions for convenience
export type StorageBackendType = 'filesystem' | 's3' | 'gcs' | 'azure' | 'distributed' | 'memory';
export type IndexEngineType = 'elasticsearch' | 'solr' | 'sqlite' | 'postgresql' | 'mongodb' | 'memory';
export type SecurityScannerType = 'snyk' | 'sonatype' | 'blackduck' | 'veracode' | 'custom' | 'composite';
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'fifo' | 'lifo' | 'random';
export type ResolutionStrategy = 'latest' | 'oldest' | 'exact' | 'semver' | 'custom';
export type RegistryType = 'npm' | 'pypi' | 'maven' | 'nuget' | 'cargo' | 'github' | 'private' | 'federated';

// Validation utilities
export const ValidationUtils = {
  /**
   * Validate a package identifier
   */
  validatePackageIdentifier: (identifier: any): identifier is PackageIdentifier => {
    return identifier &&
           typeof identifier.name === 'string' &&
           typeof identifier.version === 'string' &&
           identifier.name.length > 0 &&
           identifier.version.length > 0;
  },

  /**
   * Validate semantic version string
   */
  validateSemver: (version: string): boolean => {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    return semverRegex.test(version);
  },

  /**
   * Validate package name format
   */
  validatePackageName: (name: string): boolean => {
    const nameRegex = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return nameRegex.test(name) && name.length >= 1 && name.length <= 214;
  },

  /**
   * Validate registry URL format
   */
  validateRegistryUrl: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Validate dependency version range
   */
  validateVersionRange: (range: string): boolean => {
    // Basic validation - could be extended with proper semver range parsing
    return typeof range === 'string' && range.length > 0;
  }
};

// Common error factory
export const PackageErrorFactory = {
  /**
   * Create a package not found error
   */
  packageNotFound: (packageId: string, version?: string): PackageError => {
    const error = new Error(`Package not found: ${packageId}${version ? `@${version}` : ''}`) as PackageError;
    error.code = 'PACKAGE_NOT_FOUND';
    error.packageId = packageId;
    error.version = version;
    error.severity = 'error';
    error.recoverable = false;
    error.timestamp = new Date();
    return error;
  },

  /**
   * Create a dependency conflict error
   */
  dependencyConflict: (packageId: string, conflicts: string[]): PackageError => {
    const error = new Error(`Dependency conflict for ${packageId}: ${conflicts.join(', ')}`) as PackageError;
    error.code = 'DEPENDENCY_CONFLICT';
    error.packageId = packageId;
    error.severity = 'error';
    error.recoverable = true;
    error.context = { conflicts };
    error.timestamp = new Date();
    return error;
  },

  /**
   * Create a security violation error
   */
  securityViolation: (packageId: string, violations: string[]): PackageError => {
    const error = new Error(`Security violations in ${packageId}: ${violations.join(', ')}`) as PackageError;
    error.code = 'SECURITY_VIOLATION';
    error.packageId = packageId;
    error.severity = 'fatal';
    error.recoverable = false;
    error.context = { violations };
    error.timestamp = new Date();
    return error;
  },

  /**
   * Create an integrity check failure error
   */
  integrityCheckFailed: (packageId: string, expected: string, actual: string): PackageError => {
    const error = new Error(`Integrity check failed for ${packageId}`) as PackageError;
    error.code = 'INTEGRITY_CHECK_FAILED';
    error.packageId = packageId;
    error.severity = 'fatal';
    error.recoverable = false;
    error.context = { expected, actual };
    error.timestamp = new Date();
    return error;
  }
};

// Common configuration defaults
export const DefaultConfigurations = {
  /**
   * Default registry configuration
   */
  registry: {
    storageBackend: 'filesystem' as const,
    storagePath: './package-storage',
    indexingEngine: 'sqlite' as const,
    indexPath: './package-index',
    caching: {
      enabled: true,
      ttl: 3600000, // 1 hour
      maxSize: 1000,
      strategy: 'lru' as const
    },
    security: {
      enableAuditLogging: true,
      enableIntegrityChecks: true,
      enableVulnerabilityScanning: true,
      quarantinePolicy: 'moderate' as const,
      allowedFileTypes: ['.tar.gz', '.tgz', '.zip', '.jar', '.war'],
      maxPackageSize: 100 * 1024 * 1024, // 100MB
      encryptionAtRest: true,
      encryptionInTransit: true
    },
    performance: {
      maxConcurrentDownloads: 10,
      downloadTimeout: 30000,
      indexRebuildInterval: 86400000, // 24 hours
      gcInterval: 3600000, // 1 hour
      healthCheckInterval: 30000 // 30 seconds
    }
  } as RegistryConfiguration,

  /**
   * Default cache configuration
   */
  cache: {
    strategy: 'lru' as const,
    maxSize: 1000,
    ttl: 3600000, // 1 hour
    evictionPolicy: 'lru' as const,
    serialization: {
      format: 'json' as const,
      compression: true,
      encryption: false
    }
  } as CacheConfiguration,

  /**
   * Default analytics configuration
   */
  analytics: {
    enabled: true,
    batchSize: 100,
    flushInterval: 30000, // 30 seconds
    sampling: {
      rate: 1.0, // 100% sampling by default
      strategy: 'random' as const
    },
    privacy: {
      anonymizeUsers: false,
      anonymizeIPs: true,
      dataRetention: 90, // 90 days
      gdprCompliant: true
    }
  } as AnalyticsConfiguration,

  /**
   * Default security scanner configuration
   */
  security: {
    rules: [],
    thresholds: [
      { metric: 'vulnerability_count', threshold: 0, action: 'warn' as const },
      { metric: 'critical_vulnerabilities', threshold: 0, action: 'block' as const },
      { metric: 'license_issues', threshold: 0, action: 'warn' as const }
    ],
    exclusions: [],
    reporting: {
      formats: ['json'],
      includeMetadata: true,
      includeRecommendations: true
    }
  } as ScannerConfiguration
};

// Utility functions for working with package data
export const PackageUtils = {
  /**
   * Create a package identifier from name and version
   */
  createIdentifier: (name: string, version: string, scope?: string): PackageIdentifier => {
    return {
      name: scope ? `@${scope}/${name}` : name,
      version,
      scope
    };
  },

  /**
   * Parse a package identifier string
   */
  parseIdentifier: (identifier: string): PackageIdentifier => {
    const match = identifier.match(/^(?:@([^/]+)\/)?([^@]+)@(.+)$/);
    if (!match) {
      throw new Error(`Invalid package identifier: ${identifier}`);
    }

    const [, scope, name, version] = match;
    return {
      name: scope ? `@${scope}/${name}` : name,
      version,
      scope
    };
  },

  /**
   * Generate a package storage key
   */
  generateStorageKey: (identifier: PackageIdentifier): string => {
    const safeName = identifier.name.replace(/[/@]/g, '_');
    const safeVersion = identifier.version.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${safeName}_${safeVersion}`;
  },

  /**
   * Calculate package risk score based on various factors
   */
  calculateRiskScore: (metadata: PackageMetadata): number => {
    let score = 0;

    // Security vulnerabilities
    const vulns = metadata.security.vulnerabilities;
    score += vulns.filter(v => v.severity === 'critical').length * 10;
    score += vulns.filter(v => v.severity === 'high').length * 5;
    score += vulns.filter(v => v.severity === 'medium').length * 2;
    score += vulns.filter(v => v.severity === 'low').length * 1;

    // Age and maintenance
    const daysSinceUpdate = (Date.now() - metadata.lastModified.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 365) score += 5; // Not updated in a year
    if (daysSinceUpdate > 730) score += 10; // Not updated in two years

    // Download popularity (inverse risk)
    if (metadata.downloadCount < 1000) score += 3;
    if (metadata.downloadCount < 100) score += 7;
    if (metadata.downloadCount < 10) score += 15;

    // Normalize to 0-100 scale
    return Math.min(100, score);
  },

  /**
   * Format package size in human-readable format
   */
  formatSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  },

  /**
   * Compare two package versions
   */
  compareVersions: (a: string, b: string): number => {
    try {
      const versionA = parseVersion(a);
      const versionB = parseVersion(b);
      return compareSemver(versionA, versionB);
    } catch {
      return a.localeCompare(b); // Fallback to string comparison
    }
  },

  /**
   * Check if a package version satisfies a range
   */
  satisfies: (version: string, range: string): boolean => {
    try {
      const semverVersion = parseVersion(version);
      const versionRange: VersionRange = {
        expression: range,
        min: parseVersion(range) // Simplified - would need proper range parsing
      };
      return satisfiesRange(semverVersion, versionRange);
    } catch {
      return false;
    }
  }
};

// Type assertion helpers
export const TypeGuards = {
  isPackageMetadata: (obj: any): obj is PackageMetadata => {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.name === 'string' &&
           typeof obj.version === 'string' &&
           obj.publishedAt instanceof Date &&
           obj.integrity &&
           obj.security;
  },

  isPackageRegistry: (obj: any): obj is PackageRegistry => {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.name === 'string' &&
           typeof obj.url === 'string' &&
           typeof obj.type === 'string' &&
           typeof obj.enabled === 'boolean';
  },

  isSecurityVulnerability: (obj: any): obj is SecurityVulnerability => {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.severity === 'string' &&
           typeof obj.title === 'string' &&
           Array.isArray(obj.affectedVersions);
  },

  isDependencyGraph: (obj: any): obj is DependencyGraph => {
    return obj &&
           obj.root &&
           obj.nodes instanceof Map &&
           Array.isArray(obj.edges) &&
           typeof obj.resolved === 'boolean';
  }
};

// Export version information
export const VERSION = '1.0.0';
export const EPIC = 'Epic 2 - Package Management System';
export const STORY = 'Story 2.1 - Core Package Registry Export';

/**
 * Main interface aggregator for easy import
 * Provides a single point of access to all major interfaces
 */
export interface PackageManagementInterfaces {
  // Core interfaces
  IPackageRegistry: typeof IPackageRegistry;
  IRegistryBackend: typeof IRegistryBackend;
  IPackageIndex: typeof IPackageIndex;
  IDependencyResolver: typeof IDependencyResolver;
  ISecurityScanner: typeof ISecurityScanner;
  ICacheManager: typeof ICacheManager;
  IAnalyticsCollector: typeof IAnalyticsCollector;

  // Factory interfaces
  IRegistryFactory: typeof IRegistryFactory;
  IRegistryPlugin: typeof IRegistryPlugin;

  // Base classes
  BaseRegistry: typeof BaseRegistry;

  // Utilities
  ValidationUtils: typeof ValidationUtils;
  PackageErrorFactory: typeof PackageErrorFactory;
  PackageUtils: typeof PackageUtils;
  TypeGuards: typeof TypeGuards;

  // Configuration defaults
  DefaultConfigurations: typeof DefaultConfigurations;
}

/**
 * Export a consolidated interface object for convenience
 */
export const PackageManagement: PackageManagementInterfaces = {
  IPackageRegistry,
  IRegistryBackend,
  IPackageIndex,
  IDependencyResolver,
  ISecurityScanner,
  ICacheManager,
  IAnalyticsCollector,
  IRegistryFactory,
  IRegistryPlugin,
  BaseRegistry,
  ValidationUtils,
  PackageErrorFactory,
  PackageUtils,
  TypeGuards,
  DefaultConfigurations
};