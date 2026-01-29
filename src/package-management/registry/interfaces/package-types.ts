/**
 * EPIC 2 PACKAGE MANAGEMENT - COMPREHENSIVE TYPE DEFINITIONS
 * Complete type system for package management with enterprise security integration
 * Provides type safety across all package management operations
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.1
 */

/**
 * Core Package Type Definitions
 */

// Package identification and versioning
export interface PackageIdentifier {
  readonly name: string;
  readonly version: string;
  readonly scope?: string;
  readonly namespace?: string;
  readonly registry?: string;
}

export interface SemverVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease?: string[];
  readonly build?: string[];
  readonly raw: string;
}

export interface VersionRange {
  readonly min?: SemverVersion;
  readonly max?: SemverVersion;
  readonly exact?: SemverVersion;
  readonly expression: string;
  readonly excludes?: SemverVersion[];
}

// Package content and structure
export interface PackageContent {
  readonly files: PackageFile[];
  readonly entrypoint: string;
  readonly size: number;
  readonly checksum: string;
  readonly encoding: 'utf8' | 'base64' | 'binary';
  readonly compression?: 'gzip' | 'brotli' | 'none';
}

export interface PackageFile {
  readonly path: string;
  readonly size: number;
  readonly checksum: string;
  readonly lastModified: Date;
  readonly permissions: number;
  readonly type: 'file' | 'directory' | 'symlink';
  readonly content?: Buffer | string;
}

// Package dependencies and relationships
export interface DependencyDeclaration {
  readonly name: string;
  readonly versionRange: VersionRange;
  readonly type: DependencyType;
  readonly optional: boolean;
  readonly bundled: boolean;
  readonly dev: boolean;
  readonly peer: boolean;
  readonly conditions?: string[];
  readonly platform?: string[];
  readonly architecture?: string[];
}

export type DependencyType =
  | 'runtime'     // Required at runtime
  | 'development' // Required only during development
  | 'peer'        // Expected to be provided by parent package
  | 'optional'    // Optional enhancement
  | 'bundled'     // Included in package bundle
  | 'system'      // System-level dependency
  | 'tool';       // Build/development tool

export interface DependencyGraph {
  readonly root: PackageIdentifier;
  readonly nodes: Map<string, DependencyNode>;
  readonly edges: DependencyEdge[];
  readonly resolved: boolean;
  readonly conflicts: DependencyConflict[];
  readonly depth: number;
  readonly cycles: DependencyCycle[];
}

export interface DependencyNode {
  readonly package: PackageIdentifier;
  readonly dependencies: DependencyDeclaration[];
  readonly resolved: boolean;
  readonly level: number;
  readonly parent?: string;
  readonly children: string[];
}

export interface DependencyEdge {
  readonly from: string;
  readonly to: string;
  readonly type: DependencyType;
  readonly constraint: VersionRange;
  readonly resolved: SemverVersion;
  readonly optional: boolean;
}

export interface DependencyConflict {
  readonly package: string;
  readonly conflictingVersions: Array<{
    version: SemverVersion;
    requiredBy: string[];
    constraint: VersionRange;
  }>;
  readonly resolutionStrategy: ConflictResolutionStrategy;
  readonly severity: 'warning' | 'error' | 'fatal';
}

export interface DependencyCycle {
  readonly path: string[];
  readonly length: number;
  readonly severity: 'warning' | 'error';
  readonly breakable: boolean;
  readonly suggestedBreakpoints: string[];
}

export type ConflictResolutionStrategy =
  | 'latest'        // Use latest compatible version
  | 'oldest'        // Use oldest compatible version
  | 'explicit'      // Require explicit resolution
  | 'peer'          // Delegate to peer dependency
  | 'optional'      // Make dependency optional
  | 'exclude'       // Exclude conflicting package
  | 'override';     // Force specific version

// License and legal information
export interface LicenseInformation {
  readonly spdxId: string;
  readonly name: string;
  readonly url?: string;
  readonly text?: string;
  readonly compatible: boolean;
  readonly commercial: boolean;
  readonly copyleft: boolean;
  readonly permissive: boolean;
  readonly restrictions: string[];
  readonly obligations: string[];
}

export interface LegalCompliance {
  readonly licenses: LicenseInformation[];
  readonly copyrightNotices: string[];
  readonly attributionRequired: boolean;
  readonly licenseConflicts: LicenseConflict[];
  readonly complianceLevel: 'compliant' | 'warning' | 'violation';
  readonly auditDate: Date;
  readonly exemptions: ComplianceExemption[];
}

export interface LicenseConflict {
  readonly conflictingLicenses: string[];
  readonly conflictType: 'incompatible' | 'copyleft_viral' | 'commercial_restricted';
  readonly severity: 'warning' | 'error' | 'blocking';
  readonly resolution?: string;
}

export interface ComplianceExemption {
  readonly licenseId: string;
  readonly reason: string;
  readonly approvedBy: string;
  readonly expiresAt?: Date;
  readonly conditions: string[];
}

// Platform and environment requirements
export interface PlatformRequirements {
  readonly operatingSystems: OSRequirement[];
  readonly architectures: ArchitectureRequirement[];
  readonly runtimes: RuntimeRequirement[];
  readonly environments: EnvironmentConstraint[];
  readonly capabilities: RequiredCapability[];
}

export interface OSRequirement {
  readonly family: 'windows' | 'macos' | 'linux' | 'unix' | 'any';
  readonly versions: string[];
  readonly minimum?: string;
  readonly maximum?: string;
  readonly excluded: string[];
}

export interface ArchitectureRequirement {
  readonly arch: 'x64' | 'x86' | 'arm64' | 'arm' | 'ppc64' | 'mips' | 'any';
  readonly endianness?: 'little' | 'big' | 'any';
  readonly wordSize?: 32 | 64 | 'any';
}

export interface RuntimeRequirement {
  readonly runtime: string;
  readonly version: VersionRange;
  readonly features?: string[];
  readonly flags?: string[];
}

export interface EnvironmentConstraint {
  readonly type: 'development' | 'staging' | 'production' | 'testing';
  readonly variables: Record<string, string>;
  readonly resources: ResourceRequirement[];
}

export interface RequiredCapability {
  readonly capability: string;
  readonly version?: string;
  readonly optional: boolean;
  readonly fallback?: string;
}

export interface ResourceRequirement {
  readonly resource: 'memory' | 'cpu' | 'disk' | 'network' | 'gpu';
  readonly minimum: number;
  readonly recommended: number;
  readonly unit: string;
}

// Quality and testing information
export interface QualityMetrics {
  readonly testCoverage?: CoverageMetrics;
  readonly codeQuality?: CodeQualityMetrics;
  readonly performance?: PerformanceMetrics;
  readonly security?: SecurityMetrics;
  readonly maintainability?: MaintainabilityMetrics;
  readonly reliability?: ReliabilityMetrics;
}

export interface CoverageMetrics {
  readonly lines: number;
  readonly statements: number;
  readonly branches: number;
  readonly functions: number;
  readonly threshold: number;
  readonly reportUrl?: string;
}

export interface CodeQualityMetrics {
  readonly complexity: number;
  readonly maintainabilityIndex: number;
  readonly technicalDebt: string;
  readonly codeSmells: number;
  readonly duplicatedLines: number;
  readonly violations: QualityViolation[];
}

export interface QualityViolation {
  readonly rule: string;
  readonly severity: 'info' | 'minor' | 'major' | 'critical' | 'blocker';
  readonly message: string;
  readonly file?: string;
  readonly line?: number;
}

export interface PerformanceMetrics {
  readonly bundleSize: number;
  readonly loadTime: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly benchmarks: PerformanceBenchmark[];
}

export interface PerformanceBenchmark {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly baseline?: number;
  readonly threshold: number;
  readonly status: 'pass' | 'warning' | 'fail';
}

export interface SecurityMetrics {
  readonly vulnerabilityCount: number;
  readonly highSeverityCount: number;
  readonly lastScanDate: Date;
  readonly scannerVersion: string;
  readonly riskScore: number;
  readonly complianceScore: number;
  readonly findings: SecurityFinding[];
}

export interface SecurityFinding {
  readonly id: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly recommendation: string;
  readonly references: string[];
  readonly cwe?: string;
  readonly cvss?: number;
}

export interface MaintainabilityMetrics {
  readonly commitFrequency: number;
  readonly issueResolutionTime: number;
  readonly contributerCount: number;
  readonly lastCommit: Date;
  readonly documentationCoverage: number;
  readonly apiStability: number;
}

export interface ReliabilityMetrics {
  readonly uptime: number;
  readonly errorRate: number;
  readonly mtbf: number; // Mean Time Between Failures
  readonly mttr: number; // Mean Time To Recovery
  readonly slaCompliance: number;
  readonly incidents: ReliabilityIncident[];
}

export interface ReliabilityIncident {
  readonly id: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration?: number;
  readonly impact: string;
  readonly resolution?: string;
}

// Publication and distribution
export interface PublicationInfo {
  readonly publisher: PublisherInfo;
  readonly publishedAt: Date;
  readonly channels: DistributionChannel[];
  readonly access: AccessPolicy;
  readonly lifecycle: LifecycleInfo;
  readonly deprecation?: DeprecationInfo;
}

export interface PublisherInfo {
  readonly name: string;
  readonly email: string;
  readonly organization?: string;
  readonly verified: boolean;
  readonly reputation: number;
  readonly publicKey: string;
  readonly website?: string;
}

export interface DistributionChannel {
  readonly name: string;
  readonly type: 'registry' | 'cdn' | 'mirror' | 'p2p';
  readonly url: string;
  readonly priority: number;
  readonly regions: string[];
  readonly authenticated: boolean;
}

export interface AccessPolicy {
  readonly visibility: 'public' | 'private' | 'internal' | 'restricted';
  readonly authentication: 'none' | 'token' | 'certificate' | 'oauth';
  readonly authorization: AuthorizationRule[];
  readonly restrictions: AccessRestriction[];
  readonly audit: boolean;
}

export interface AuthorizationRule {
  readonly principal: string;
  readonly permissions: Permission[];
  readonly conditions?: string[];
  readonly expiry?: Date;
}

export type Permission = 'read' | 'write' | 'delete' | 'admin' | 'publish' | 'deprecate';

export interface AccessRestriction {
  readonly type: 'ip' | 'geography' | 'time' | 'rate' | 'concurrent';
  readonly rule: string;
  readonly message?: string;
}

export interface LifecycleInfo {
  readonly stage: LifecycleStage;
  readonly stability: 'experimental' | 'unstable' | 'stable' | 'mature' | 'deprecated';
  readonly supportLevel: 'none' | 'community' | 'commercial' | 'enterprise';
  readonly endOfLife?: Date;
  readonly migrationPath?: string[];
}

export type LifecycleStage =
  | 'alpha'       // Early development
  | 'beta'        // Feature complete, testing
  | 'rc'          // Release candidate
  | 'stable'      // Production ready
  | 'maintenance' // Bug fixes only
  | 'deprecated'  // No longer recommended
  | 'retired';    // No longer supported

export interface DeprecationInfo {
  readonly reason: string;
  readonly deprecatedAt: Date;
  readonly endOfLife: Date;
  readonly migrationGuide?: string;
  readonly replacementPackages: PackageIdentifier[];
  readonly severity: 'notice' | 'warning' | 'critical';
}

// Registry and installation context
export interface RegistryContext {
  readonly registryId: string;
  readonly registryUrl: string;
  readonly registryType: 'npm' | 'pypi' | 'maven' | 'nuget' | 'cargo' | 'github' | 'private';
  readonly namespace?: string;
  readonly mirror?: boolean;
  readonly credentials?: CredentialReference;
}

export interface CredentialReference {
  readonly type: 'token' | 'basic' | 'oauth' | 'certificate';
  readonly reference: string; // Reference to credential store
  readonly scope: string[];
}

export interface InstallationContext {
  readonly targetPath: string;
  readonly installMode: InstallMode;
  readonly environment: string;
  readonly preferences: InstallationPreferences;
  readonly constraints: InstallationConstraint[];
  readonly hooks: InstallationHook[];
}

export type InstallMode =
  | 'development' // Install including dev dependencies
  | 'production'  // Production dependencies only
  | 'optional'    // Include optional dependencies
  | 'peer'        // Install peer dependencies
  | 'bundled'     // Use bundled dependencies
  | 'minimal';    // Minimal dependency set

export interface InstallationPreferences {
  readonly preferOffline: boolean;
  readonly preferLatest: boolean;
  readonly allowPrerelease: boolean;
  readonly strictSSL: boolean;
  readonly timeout: number;
  readonly retryCount: number;
  readonly parallelism: number;
  readonly cacheStrategy: 'aggressive' | 'moderate' | 'minimal' | 'none';
}

export interface InstallationConstraint {
  readonly type: 'version' | 'license' | 'security' | 'size' | 'platform';
  readonly rule: string;
  readonly enforcement: 'strict' | 'warn' | 'advisory';
  readonly exemptions: string[];
}

export interface InstallationHook {
  readonly phase: HookPhase;
  readonly script: string;
  readonly condition?: string;
  readonly timeout?: number;
  readonly failureAction: 'abort' | 'warn' | 'continue';
}

export type HookPhase =
  | 'pre-install'   // Before installation starts
  | 'post-install'  // After successful installation
  | 'pre-uninstall' // Before uninstallation
  | 'post-uninstall' // After uninstallation
  | 'pre-update'    // Before update
  | 'post-update'   // After update
  | 'on-error';     // On installation error

// Search and discovery
export interface PackageQuery {
  readonly terms?: string[];
  readonly filters: QueryFilter[];
  readonly sorting: SortCriteria[];
  readonly pagination: PaginationOptions;
  readonly faceting: FacetingOptions;
  readonly highlighting?: HighlightingOptions;
}

export interface QueryFilter {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: any;
  readonly boost?: number;
}

export type FilterOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'greater_than' | 'less_than'
  | 'between' | 'in' | 'not_in'
  | 'exists' | 'not_exists'
  | 'regex' | 'fuzzy';

export interface SortCriteria {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
  readonly priority: number;
}

export interface PaginationOptions {
  readonly offset: number;
  readonly limit: number;
  readonly cursor?: string;
}

export interface FacetingOptions {
  readonly enabled: boolean;
  readonly fields: string[];
  readonly maxValues: number;
  readonly minCount: number;
}

export interface HighlightingOptions {
  readonly enabled: boolean;
  readonly fields: string[];
  readonly preTag: string;
  readonly postTag: string;
  readonly maxFragments: number;
  readonly fragmentSize: number;
}

// Analytics and usage tracking
export interface UsageMetrics {
  readonly downloadCount: number;
  readonly installCount: number;
  readonly activeInstalls: number;
  readonly popularityScore: number;
  readonly trendingScore: number;
  readonly geographicDistribution: Record<string, number>;
  readonly versionAdoption: Record<string, number>;
  readonly dependentPackages: number;
}

export interface AnalyticsEvent {
  readonly type: AnalyticsEventType;
  readonly timestamp: Date;
  readonly packageId: string;
  readonly version?: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly clientInfo: ClientInfo;
  readonly context: Record<string, any>;
}

export type AnalyticsEventType =
  | 'download'    // Package downloaded
  | 'install'     // Package installed
  | 'uninstall'   // Package uninstalled
  | 'update'      // Package updated
  | 'search'      // Package searched
  | 'view'        // Package metadata viewed
  | 'error';      // Error during operation

export interface ClientInfo {
  readonly userAgent: string;
  readonly platform: string;
  readonly architecture: string;
  readonly runtime?: string;
  readonly country?: string;
  readonly region?: string;
}

// Error handling and diagnostics
export interface PackageError extends Error {
  readonly code: PackageErrorCode;
  readonly packageId?: string;
  readonly version?: string;
  readonly severity: 'info' | 'warning' | 'error' | 'fatal';
  readonly recoverable: boolean;
  readonly context?: Record<string, any>;
  readonly cause?: Error;
  readonly timestamp: Date;
}

export type PackageErrorCode =
  | 'PACKAGE_NOT_FOUND'
  | 'VERSION_NOT_FOUND'
  | 'DEPENDENCY_CONFLICT'
  | 'CIRCULAR_DEPENDENCY'
  | 'INTEGRITY_CHECK_FAILED'
  | 'SECURITY_VIOLATION'
  | 'LICENSE_CONFLICT'
  | 'PLATFORM_INCOMPATIBLE'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

// Configuration and settings
export interface PackageManagerConfig {
  readonly registries: RegistryConfig[];
  readonly installation: InstallationConfig;
  readonly security: SecurityConfig;
  readonly performance: PerformanceConfig;
  readonly analytics: AnalyticsConfig;
  readonly ui: UIConfig;
}

export interface RegistryConfig {
  readonly id: string;
  readonly url: string;
  readonly priority: number;
  readonly authentication?: AuthenticationConfig;
  readonly caching: CachingConfig;
  readonly mirroring: MirroringConfig;
}

export interface AuthenticationConfig {
  readonly type: 'none' | 'token' | 'basic' | 'oauth' | 'certificate';
  readonly credentials: CredentialReference;
  readonly scope: string[];
}

export interface CachingConfig {
  readonly enabled: boolean;
  readonly ttl: number;
  readonly maxSize: number;
  readonly strategy: 'lru' | 'lfu' | 'ttl' | 'none';
  readonly compression: boolean;
}

export interface MirroringConfig {
  readonly enabled: boolean;
  readonly strategy: 'eager' | 'lazy' | 'on-demand';
  readonly syncInterval: number;
  readonly filterRules: string[];
}

export interface InstallationConfig {
  readonly defaultMode: InstallMode;
  readonly parallelism: number;
  readonly timeout: number;
  readonly retries: number;
  readonly checksums: boolean;
  readonly signatures: boolean;
  readonly hooks: boolean;
}

export interface SecurityConfig {
  readonly vulnerabilityScanning: boolean;
  readonly licenseChecking: boolean;
  readonly integrityVerification: boolean;
  readonly quarantinePolicy: 'strict' | 'moderate' | 'permissive';
  readonly allowedSources: string[];
  readonly blockedPackages: string[];
}

export interface PerformanceConfig {
  readonly maxConcurrentDownloads: number;
  readonly maxConcurrentInstalls: number;
  readonly networkTimeout: number;
  readonly cacheSize: number;
  readonly compressionLevel: number;
  readonly keepAliveTimeout: number;
}

export interface AnalyticsConfig {
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly sampling: number;
  readonly retention: number;
  readonly anonymization: boolean;
  readonly includeUsage: boolean;
}

export interface UIConfig {
  readonly verbosity: 'silent' | 'error' | 'warn' | 'info' | 'verbose' | 'debug';
  readonly colors: boolean;
  readonly unicode: boolean;
  readonly progressBars: boolean;
  readonly interactive: boolean;
  readonly updateNotifier: boolean;
}

// Type guards and utilities
export function isPackageIdentifier(obj: any): obj is PackageIdentifier {
  return obj && typeof obj.name === 'string' && typeof obj.version === 'string';
}

export function isValidSemver(version: string): boolean {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semverRegex.test(version);
}

export function compareSemver(a: SemverVersion, b: SemverVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;

  // Handle prerelease versions
  if (a.prerelease && !b.prerelease) return -1;
  if (!a.prerelease && b.prerelease) return 1;
  if (!a.prerelease && !b.prerelease) return 0;

  // Compare prerelease identifiers
  const minLength = Math.min(a.prerelease!.length, b.prerelease!.length);
  for (let i = 0; i < minLength; i++) {
    const aPart = a.prerelease![i];
    const bPart = b.prerelease![i];

    if (aPart === bPart) continue;

    const aIsNum = /^\d+$/.test(aPart);
    const bIsNum = /^\d+$/.test(bPart);

    if (aIsNum && bIsNum) {
      return parseInt(aPart) - parseInt(bPart);
    } else if (aIsNum && !bIsNum) {
      return -1;
    } else if (!aIsNum && bIsNum) {
      return 1;
    } else {
      return aPart.localeCompare(bPart);
    }
  }

  return a.prerelease!.length - b.prerelease!.length;
}

export function parseVersion(versionString: string): SemverVersion {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
  if (!match) {
    throw new Error(`Invalid semantic version: ${versionString}`);
  }

  const [, major, minor, patch, prerelease, build] = match;

  return {
    major: parseInt(major),
    minor: parseInt(minor),
    patch: parseInt(patch),
    prerelease: prerelease ? prerelease.split('.') : undefined,
    build: build ? build.split('.') : undefined,
    raw: versionString
  };
}

export function satisfiesRange(version: SemverVersion, range: VersionRange): boolean {
  if (range.exact) {
    return compareSemver(version, range.exact) === 0;
  }

  if (range.min && compareSemver(version, range.min) < 0) {
    return false;
  }

  if (range.max && compareSemver(version, range.max) > 0) {
    return false;
  }

  if (range.excludes) {
    return !range.excludes.some(excluded => compareSemver(version, excluded) === 0);
  }

  return true;
}

// Constants for commonly used values
export const DEFAULT_REGISTRY_TYPES = [
  'npm', 'pypi', 'maven', 'nuget', 'cargo', 'github', 'private'
] as const;

export const DEPENDENCY_TYPES = [
  'runtime', 'development', 'peer', 'optional', 'bundled', 'system', 'tool'
] as const;

export const LIFECYCLE_STAGES = [
  'alpha', 'beta', 'rc', 'stable', 'maintenance', 'deprecated', 'retired'
] as const;

export const SECURITY_SEVERITIES = [
  'low', 'medium', 'high', 'critical'
] as const;

export const PERMISSIONS = [
  'read', 'write', 'delete', 'admin', 'publish', 'deprecate'
] as const;