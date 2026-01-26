/**
 * EPIC 2 PACKAGE MANAGEMENT - REGISTRY INTERFACE DEFINITIONS
 * Comprehensive interface definitions for package registry operations
 * Provides contracts for all registry-level operations and abstractions
 *
 * @author Package Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.1
 */

import { EventEmitter } from 'events';
import {
  PackageMetadata,
  PackageIdentifier,
  PackageSearchQuery,
  PackageSearchResult,
  DependencyGraph,
  RegistryContext,
  InstallationContext,
  QualityMetrics,
  UsageMetrics,
  AnalyticsEvent,
  PackageError,
  SemverVersion,
  VersionRange
} from './package-types';

/**
 * Core Registry Service Interfaces
 */

/**
 * IPackageRegistry - Main interface for package registry operations
 * Defines the contract for all package registry implementations
 */
export interface IPackageRegistry {
  readonly id: string;
  readonly name: string;
  readonly type: RegistryType;
  readonly url: string;
  readonly version: string;

  // Core package operations
  publish(packageData: PackagePublishRequest): Promise<PackagePublishResult>;
  download(request: PackageDownloadRequest): Promise<PackageDownloadResult>;
  delete(request: PackageDeleteRequest): Promise<PackageDeleteResult>;
  deprecate(request: PackageDeprecateRequest): Promise<PackageDeprecateResult>;

  // Metadata operations
  getMetadata(identifier: PackageIdentifier): Promise<PackageMetadata | null>;
  updateMetadata(identifier: PackageIdentifier, metadata: Partial<PackageMetadata>): Promise<void>;
  listVersions(packageName: string): Promise<SemverVersion[]>;
  getLatestVersion(packageName: string): Promise<SemverVersion | null>;

  // Search and discovery
  search(query: PackageSearchQuery): Promise<PackageSearchResult>;
  suggest(partial: string, maxResults?: number): Promise<string[]>;
  browse(category?: string, pagination?: PaginationRequest): Promise<PackageBrowseResult>;

  // Registry management
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getHealth(): Promise<RegistryHealth>;
  getStatistics(): Promise<RegistryStatistics>;
}

/**
 * IRegistryBackend - Storage backend interface
 * Abstracts different storage implementations (filesystem, S3, etc.)
 */
export interface IRegistryBackend {
  readonly type: StorageBackendType;
  readonly configuration: BackendConfiguration;

  // Package storage operations
  store(packageId: string, data: Buffer, metadata: PackageMetadata): Promise<StorageResult>;
  retrieve(packageId: string): Promise<StorageRetrievalResult>;
  exists(packageId: string): Promise<boolean>;
  remove(packageId: string): Promise<void>;

  // Batch operations
  storeBatch(packages: Array<{ id: string; data: Buffer; metadata: PackageMetadata }>): Promise<BatchStorageResult>;
  retrieveBatch(packageIds: string[]): Promise<BatchRetrievalResult>;

  // Storage management
  getStorageInfo(): Promise<StorageInfo>;
  cleanup(olderThan?: Date): Promise<CleanupResult>;
  backup(destination: string): Promise<BackupResult>;
  restore(source: string): Promise<RestoreResult>;

  // Health and monitoring
  validateIntegrity(): Promise<IntegrityCheckResult>;
  getHealthStatus(): Promise<BackendHealth>;
}

/**
 * IPackageIndex - Search and indexing interface
 * Abstracts different search implementations (Elasticsearch, SQL, etc.)
 */
export interface IPackageIndex {
  readonly type: IndexEngineType;
  readonly configuration: IndexConfiguration;

  // Indexing operations
  index(metadata: PackageMetadata): Promise<IndexResult>;
  reindex(packageId?: string): Promise<ReindexResult>;
  remove(packageId: string): Promise<void>;

  // Search operations
  search(query: PackageSearchQuery): Promise<PackageSearchResult>;
  suggest(query: SuggestionQuery): Promise<SuggestionResult>;
  aggregate(aggregation: AggregationQuery): Promise<AggregationResult>;

  // Index management
  createIndex(schema: IndexSchema): Promise<void>;
  updateSchema(schema: Partial<IndexSchema>): Promise<void>;
  optimizeIndex(): Promise<OptimizationResult>;
  getIndexStats(): Promise<IndexStatistics>;
}

/**
 * IDependencyResolver - Dependency resolution interface
 * Handles complex dependency graph resolution and conflict resolution
 */
export interface IDependencyResolver {
  readonly strategy: ResolutionStrategy;
  readonly configuration: ResolverConfiguration;

  // Resolution operations
  resolve(rootPackage: PackageIdentifier, context: ResolutionContext): Promise<DependencyGraph>;
  validateGraph(graph: DependencyGraph): Promise<ValidationResult>;
  optimizeGraph(graph: DependencyGraph): Promise<DependencyGraph>;

  // Conflict resolution
  detectConflicts(graph: DependencyGraph): Promise<ConflictDetectionResult>;
  resolveConflicts(conflicts: ConflictDetectionResult): Promise<ConflictResolutionResult>;

  // Analysis
  analyzeImpact(packageId: string, newVersion: SemverVersion): Promise<ImpactAnalysis>;
  findAlternatives(packageId: string): Promise<PackageAlternative[]>;
}

/**
 * ISecurityScanner - Security scanning interface
 * Handles vulnerability detection and security analysis
 */
export interface ISecurityScanner {
  readonly scannerType: SecurityScannerType;
  readonly version: string;
  readonly capabilities: SecurityCapability[];

  // Scanning operations
  scanPackage(packageData: Buffer, metadata: PackageMetadata): Promise<SecurityScanResult>;
  scanDependencyGraph(graph: DependencyGraph): Promise<GraphSecurityResult>;
  quickScan(packageId: string): Promise<QuickScanResult>;

  // Vulnerability management
  getVulnerabilities(packageId: string, version?: string): Promise<VulnerabilityInfo[]>;
  checkForUpdates(): Promise<SecurityUpdateInfo>;
  generateReport(scanResult: SecurityScanResult): Promise<SecurityReport>;

  // Configuration
  updateRules(rules: SecurityRule[]): Promise<void>;
  getConfiguration(): Promise<ScannerConfiguration>;
}

/**
 * ICacheManager - Caching interface
 * Handles various caching strategies for performance optimization
 */
export interface ICacheManager {
  readonly strategy: CacheStrategy;
  readonly configuration: CacheConfiguration;

  // Cache operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;

  // Batch operations
  getBatch<T>(keys: string[]): Promise<Map<string, T>>;
  setBatch<T>(entries: Map<string, T>, ttl?: number): Promise<void>;
  deleteBatch(keys: string[]): Promise<number>;

  // Cache management
  clear(): Promise<void>;
  getStats(): Promise<CacheStatistics>;
  optimize(): Promise<OptimizationResult>;
}

/**
 * IAnalyticsCollector - Analytics and metrics collection interface
 */
export interface IAnalyticsCollector {
  readonly configuration: AnalyticsConfiguration;

  // Event collection
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackBatch(events: AnalyticsEvent[]): Promise<BatchTrackingResult>;

  // Metrics collection
  recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
  incrementCounter(name: string, tags?: Record<string, string>): Promise<void>;
  recordTiming(name: string, duration: number, tags?: Record<string, string>): Promise<void>;

  // Reporting
  getUsageMetrics(packageId: string, timeRange: TimeRange): Promise<UsageMetrics>;
  generateReport(query: AnalyticsQuery): Promise<AnalyticsReport>;
  exportData(query: AnalyticsQuery): Promise<ExportResult>;

  // Configuration
  updateConfiguration(config: Partial<AnalyticsConfiguration>): Promise<void>;
  flush(): Promise<void>;
}

/**
 * Supporting Types and Interfaces
 */

export type RegistryType = 'npm' | 'pypi' | 'maven' | 'nuget' | 'cargo' | 'github' | 'private' | 'federated';

export type StorageBackendType = 'filesystem' | 's3' | 'gcs' | 'azure' | 'distributed' | 'memory';

export type IndexEngineType = 'elasticsearch' | 'solr' | 'sqlite' | 'postgresql' | 'mongodb' | 'memory';

export type SecurityScannerType = 'snyk' | 'sonatype' | 'blackduck' | 'veracode' | 'custom' | 'composite';

export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'fifo' | 'lifo' | 'random';

export type ResolutionStrategy = 'latest' | 'oldest' | 'exact' | 'semver' | 'custom';

// Request/Response types
export interface PackagePublishRequest {
  readonly metadata: Omit<PackageMetadata, 'id' | 'publishedAt'>;
  readonly packageData: Buffer;
  readonly signature?: string;
  readonly publisherInfo: PublisherInfo;
  readonly registryContext: RegistryContext;
}

export interface PackagePublishResult {
  readonly success: boolean;
  readonly packageId: string;
  readonly version: string;
  readonly publishedAt: Date;
  readonly errors?: PublishError[];
  readonly warnings?: string[];
}

export interface PackageDownloadRequest {
  readonly identifier: PackageIdentifier;
  readonly registryContext: RegistryContext;
  readonly includeMetadata?: boolean;
  readonly verifyIntegrity?: boolean;
  readonly downloadContext?: DownloadContext;
}

export interface PackageDownloadResult {
  readonly success: boolean;
  readonly packageData: Buffer;
  readonly metadata: PackageMetadata;
  readonly downloadTime: number;
  readonly source: string;
  readonly cached: boolean;
}

export interface PackageDeleteRequest {
  readonly identifier: PackageIdentifier;
  readonly reason: string;
  readonly force?: boolean;
  readonly dryRun?: boolean;
  readonly requester: RequesterInfo;
}

export interface PackageDeleteResult {
  readonly success: boolean;
  readonly deletedAt: Date;
  readonly affectedVersions: string[];
  readonly dependentPackages?: string[];
  readonly warnings?: string[];
}

export interface PackageDeprecateRequest {
  readonly identifier: PackageIdentifier;
  readonly reason: string;
  readonly migrationGuide?: string;
  readonly alternativePackages?: PackageIdentifier[];
  readonly requester: RequesterInfo;
}

export interface PackageDeprecateResult {
  readonly success: boolean;
  readonly deprecatedAt: Date;
  readonly affectedVersions: string[];
  readonly notificationsSent: number;
}

export interface PaginationRequest {
  readonly offset: number;
  readonly limit: number;
  readonly cursor?: string;
}

export interface PackageBrowseResult {
  readonly packages: PackageMetadata[];
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly categories: string[];
  readonly pagination: PaginationInfo;
}

// Configuration types
export interface BackendConfiguration {
  readonly connection: ConnectionConfig;
  readonly performance: PerformanceConfig;
  readonly security: SecurityConfig;
  readonly monitoring: MonitoringConfig;
}

export interface IndexConfiguration {
  readonly connection: ConnectionConfig;
  readonly schema: IndexSchema;
  readonly analysis: AnalysisConfig;
  readonly performance: PerformanceConfig;
}

export interface ResolverConfiguration {
  readonly strategy: ResolutionStrategy;
  readonly constraints: ResolutionConstraint[];
  readonly preferences: ResolutionPreference[];
  readonly timeout: number;
  readonly maxDepth: number;
}

export interface CacheConfiguration {
  readonly strategy: CacheStrategy;
  readonly maxSize: number;
  readonly ttl: number;
  readonly evictionPolicy: EvictionPolicy;
  readonly serialization: SerializationConfig;
}

export interface AnalyticsConfiguration {
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly batchSize: number;
  readonly flushInterval: number;
  readonly sampling: SamplingConfig;
  readonly privacy: PrivacyConfig;
}

// Result types
export interface StorageResult {
  readonly success: boolean;
  readonly storageId: string;
  readonly size: number;
  readonly checksum: string;
  readonly location: string;
}

export interface StorageRetrievalResult {
  readonly success: boolean;
  readonly data: Buffer;
  readonly metadata: PackageMetadata;
  readonly retrieved: Date;
  readonly source: string;
}

export interface BatchStorageResult {
  readonly success: boolean;
  readonly results: Map<string, StorageResult>;
  readonly errors: Map<string, Error>;
  readonly totalTime: number;
}

export interface BatchRetrievalResult {
  readonly success: boolean;
  readonly results: Map<string, StorageRetrievalResult>;
  readonly errors: Map<string, Error>;
  readonly cacheHits: number;
  readonly totalTime: number;
}

export interface IndexResult {
  readonly success: boolean;
  readonly indexed: boolean;
  readonly updated: boolean;
  readonly indexTime: number;
  readonly documentId: string;
}

export interface ReindexResult {
  readonly success: boolean;
  readonly packagesReindexed: number;
  readonly totalTime: number;
  readonly errors: ReindexError[];
}

export interface SuggestionQuery {
  readonly query: string;
  readonly maxResults: number;
  readonly field?: string;
  readonly fuzzy?: boolean;
}

export interface SuggestionResult {
  readonly suggestions: Suggestion[];
  readonly totalCount: number;
  readonly responseTime: number;
}

export interface Suggestion {
  readonly text: string;
  readonly score: number;
  readonly highlight?: string;
  readonly metadata?: Record<string, any>;
}

export interface AggregationQuery {
  readonly field: string;
  readonly type: AggregationType;
  readonly size?: number;
  readonly filter?: QueryFilter[];
}

export interface AggregationResult {
  readonly buckets: AggregationBucket[];
  readonly totalCount: number;
  readonly otherCount?: number;
}

export interface AggregationBucket {
  readonly key: string;
  readonly count: number;
  readonly percentage: number;
}

export type AggregationType = 'terms' | 'date_histogram' | 'range' | 'stats' | 'percentiles';

// Health and monitoring types
export interface RegistryHealth {
  readonly overall: HealthStatus;
  readonly components: ComponentHealth[];
  readonly lastCheck: Date;
  readonly uptime: number;
  readonly version: string;
}

export interface ComponentHealth {
  readonly name: string;
  readonly status: HealthStatus;
  readonly responseTime?: number;
  readonly errorRate?: number;
  readonly lastCheck: Date;
  readonly details?: Record<string, any>;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface RegistryStatistics {
  readonly totalPackages: number;
  readonly totalVersions: number;
  readonly totalDownloads: number;
  readonly storageUsed: number;
  readonly indexSize: number;
  readonly averageResponseTime: number;
  readonly errorRate: number;
  readonly topPackages: TopPackageInfo[];
  readonly recentActivity: ActivitySummary[];
}

export interface TopPackageInfo {
  readonly name: string;
  readonly downloads: number;
  readonly versions: number;
  readonly lastUpdate: Date;
}

export interface ActivitySummary {
  readonly date: Date;
  readonly downloads: number;
  readonly uploads: number;
  readonly searches: number;
}

// Security types
export interface SecurityCapability {
  readonly type: SecurityCapabilityType;
  readonly description: string;
  readonly version?: string;
}

export type SecurityCapabilityType =
  | 'vulnerability_scanning'
  | 'malware_detection'
  | 'license_analysis'
  | 'dependency_analysis'
  | 'code_analysis'
  | 'behavioral_analysis';

export interface SecurityScanResult {
  readonly packageId: string;
  readonly scanId: string;
  readonly scanTime: Date;
  readonly riskLevel: RiskLevel;
  readonly findings: SecurityFinding[];
  readonly recommendations: string[];
  readonly compliance: ComplianceStatus[];
  readonly metadata: ScanMetadata;
}

export interface GraphSecurityResult {
  readonly graphId: string;
  readonly scanTime: Date;
  readonly overallRisk: RiskLevel;
  readonly packageResults: Map<string, SecurityScanResult>;
  readonly transitiveRisks: TransitiveRisk[];
  readonly mitigations: string[];
}

export interface QuickScanResult {
  readonly packageId: string;
  readonly riskLevel: RiskLevel;
  readonly knownVulnerabilities: number;
  readonly licenseIssues: number;
  readonly scanTime: Date;
  readonly needsFullScan: boolean;
}

export interface VulnerabilityInfo {
  readonly id: string;
  readonly severity: SeverityLevel;
  readonly title: string;
  readonly description: string;
  readonly affectedVersions: VersionRange[];
  readonly patchedVersion?: string;
  readonly publishedAt: Date;
  readonly references: string[];
}

export interface SecurityUpdateInfo {
  readonly hasUpdates: boolean;
  readonly lastUpdate: Date;
  readonly newRules: number;
  readonly updatedRules: number;
  readonly nextCheck: Date;
}

export interface SecurityReport {
  readonly format: 'json' | 'html' | 'pdf' | 'sarif';
  readonly content: Buffer;
  readonly generatedAt: Date;
  readonly summary: SecuritySummary;
}

export interface SecurityRule {
  readonly id: string;
  readonly type: SecurityRuleType;
  readonly pattern: string;
  readonly severity: SeverityLevel;
  readonly description: string;
  readonly enabled: boolean;
}

export type SecurityRuleType = 'vulnerability' | 'malware' | 'license' | 'content' | 'behavioral';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface ScannerConfiguration {
  readonly rules: SecurityRule[];
  readonly thresholds: SecurityThreshold[];
  readonly exclusions: ScanExclusion[];
  readonly reporting: ReportingConfig;
}

export interface SecurityThreshold {
  readonly metric: string;
  readonly threshold: number;
  readonly action: 'allow' | 'warn' | 'block';
}

export interface ScanExclusion {
  readonly type: 'package' | 'vulnerability' | 'rule';
  readonly pattern: string;
  readonly reason: string;
  readonly expiresAt?: Date;
}

// Cache types
export interface CacheStatistics {
  readonly hitRate: number;
  readonly missRate: number;
  readonly evictions: number;
  readonly size: number;
  readonly maxSize: number;
  readonly avgGetTime: number;
  readonly avgSetTime: number;
}

export type EvictionPolicy = 'lru' | 'lfu' | 'ttl' | 'size' | 'manual';

export interface SerializationConfig {
  readonly format: 'json' | 'msgpack' | 'protobuf' | 'binary';
  readonly compression: boolean;
  readonly encryption: boolean;
}

// Analytics types
export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}

export interface AnalyticsQuery {
  readonly timeRange: TimeRange;
  readonly filters: QueryFilter[];
  readonly groupBy?: string[];
  readonly aggregations?: AggregationQuery[];
  readonly limit?: number;
}

export interface AnalyticsReport {
  readonly query: AnalyticsQuery;
  readonly generatedAt: Date;
  readonly data: AnalyticsDataPoint[];
  readonly summary: AnalyticsSummary;
  readonly metadata: ReportMetadata;
}

export interface AnalyticsDataPoint {
  readonly timestamp: Date;
  readonly dimensions: Record<string, string>;
  readonly metrics: Record<string, number>;
}

export interface AnalyticsSummary {
  readonly totalEvents: number;
  readonly uniquePackages: number;
  readonly timeRange: TimeRange;
  readonly topMetrics: TopMetric[];
}

export interface TopMetric {
  readonly name: string;
  readonly value: number;
  readonly change?: number;
  readonly trend?: 'up' | 'down' | 'stable';
}

export interface BatchTrackingResult {
  readonly success: boolean;
  readonly processed: number;
  readonly errors: TrackingError[];
  readonly processingTime: number;
}

export interface ExportResult {
  readonly format: 'csv' | 'json' | 'parquet' | 'avro';
  readonly location: string;
  readonly size: number;
  readonly rowCount: number;
  readonly exportedAt: Date;
}

export interface SamplingConfig {
  readonly rate: number;
  readonly strategy: 'random' | 'systematic' | 'stratified';
  readonly seed?: number;
}

export interface PrivacyConfig {
  readonly anonymizeUsers: boolean;
  readonly anonymizeIPs: boolean;
  readonly dataRetention: number;
  readonly gdprCompliant: boolean;
}

// Error types
export interface PublishError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly severity: 'warning' | 'error' | 'fatal';
}

export interface ReindexError {
  readonly packageId: string;
  readonly error: string;
  readonly severity: 'warning' | 'error';
}

export interface TrackingError {
  readonly eventId?: string;
  readonly error: string;
  readonly recoverable: boolean;
}

// Information types
export interface PublisherInfo {
  readonly name: string;
  readonly email: string;
  readonly verified: boolean;
  readonly organizationId?: string;
}

export interface RequesterInfo {
  readonly userId: string;
  readonly permissions: string[];
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface DownloadContext {
  readonly purpose: 'install' | 'cache' | 'analysis' | 'mirror';
  readonly clientInfo: ClientInfo;
  readonly preferences: DownloadPreferences;
}

export interface ClientInfo {
  readonly name: string;
  readonly version: string;
  readonly platform: string;
  readonly architecture: string;
}

export interface DownloadPreferences {
  readonly acceptCompression: boolean;
  readonly verifySignature: boolean;
  readonly includeMetadata: boolean;
  readonly timeout: number;
}

// Additional supporting types
export interface StorageInfo {
  readonly type: StorageBackendType;
  readonly totalSpace: number;
  readonly usedSpace: number;
  readonly availableSpace: number;
  readonly fileCount: number;
  readonly lastBackup?: Date;
}

export interface CleanupResult {
  readonly filesRemoved: number;
  readonly spaceFreed: number;
  readonly duration: number;
  readonly errors: string[];
}

export interface BackupResult {
  readonly success: boolean;
  readonly backupSize: number;
  readonly duration: number;
  readonly location: string;
  readonly checksum: string;
}

export interface RestoreResult {
  readonly success: boolean;
  readonly filesRestored: number;
  readonly duration: number;
  readonly verification: boolean;
}

export interface IntegrityCheckResult {
  readonly totalFiles: number;
  readonly corruptedFiles: string[];
  readonly missingFiles: string[];
  readonly overallIntegrity: number;
}

export interface BackendHealth {
  readonly status: HealthStatus;
  readonly responseTime: number;
  readonly errorRate: number;
  readonly lastError?: string;
  readonly capacity: number;
}

export interface IndexStatistics {
  readonly documentCount: number;
  readonly indexSize: number;
  readonly searchTime: number;
  readonly indexingRate: number;
  readonly lastOptimization: Date;
}

export interface OptimizationResult {
  readonly success: boolean;
  readonly duration: number;
  readonly spaceReclaimed: number;
  readonly performanceImprovement: number;
}

export interface IndexSchema {
  readonly fields: IndexField[];
  readonly settings: IndexSettings;
  readonly mappings: FieldMappings;
}

export interface IndexField {
  readonly name: string;
  readonly type: FieldType;
  readonly indexed: boolean;
  readonly stored: boolean;
  readonly analyzed: boolean;
}

export type FieldType = 'text' | 'keyword' | 'integer' | 'float' | 'date' | 'boolean' | 'object' | 'nested';

export interface IndexSettings {
  readonly shards: number;
  readonly replicas: number;
  readonly refreshInterval: string;
  readonly maxResultWindow: number;
}

export interface FieldMappings {
  readonly properties: Record<string, FieldMapping>;
  readonly dynamic: boolean;
}

export interface FieldMapping {
  readonly type: FieldType;
  readonly analyzer?: string;
  readonly format?: string;
  readonly properties?: Record<string, FieldMapping>;
}

export interface AnalysisConfig {
  readonly analyzers: Record<string, Analyzer>;
  readonly tokenizers: Record<string, Tokenizer>;
  readonly filters: Record<string, Filter>;
}

export interface Analyzer {
  readonly tokenizer: string;
  readonly filters: string[];
}

export interface Tokenizer {
  readonly type: string;
  readonly options: Record<string, any>;
}

export interface Filter {
  readonly type: string;
  readonly options: Record<string, any>;
}

export interface PaginationInfo {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly cursor?: string;
}

// Resolution types
export interface ResolutionContext {
  readonly installationContext: InstallationContext;
  readonly constraints: ResolutionConstraint[];
  readonly preferences: ResolutionPreference[];
  readonly overrides: VersionOverride[];
}

export interface ResolutionConstraint {
  readonly type: ConstraintType;
  readonly packagePattern: string;
  readonly versionConstraint: VersionRange;
  readonly required: boolean;
}

export type ConstraintType = 'require' | 'exclude' | 'prefer' | 'avoid';

export interface ResolutionPreference {
  readonly type: PreferenceType;
  readonly weight: number;
  readonly condition?: string;
}

export type PreferenceType = 'latest' | 'stable' | 'security' | 'performance' | 'size' | 'compatibility';

export interface VersionOverride {
  readonly packageName: string;
  readonly version: string;
  readonly reason: string;
  readonly scope?: string[];
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly packageId: string;
  readonly severity: 'error' | 'fatal';
}

export interface ValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly packageId: string;
  readonly recommendation?: string;
}

export interface ValidationSuggestion {
  readonly type: 'optimization' | 'alternative' | 'upgrade';
  readonly message: string;
  readonly packageId: string;
  readonly benefit: string;
}

export interface ConflictDetectionResult {
  readonly hasConflicts: boolean;
  readonly conflicts: DependencyConflictDetail[];
  readonly suggestions: ConflictSuggestion[];
}

export interface DependencyConflictDetail {
  readonly packageName: string;
  readonly conflictingVersions: ConflictingVersion[];
  readonly impactedPackages: string[];
  readonly resolvable: boolean;
}

export interface ConflictingVersion {
  readonly version: string;
  readonly requiredBy: string[];
  readonly constraints: string[];
}

export interface ConflictSuggestion {
  readonly type: 'upgrade' | 'downgrade' | 'exclude' | 'override';
  readonly packageName: string;
  readonly suggestedVersion?: string;
  readonly reason: string;
}

export interface ConflictResolutionResult {
  readonly resolved: boolean;
  readonly resolutions: PackageResolution[];
  readonly remainingConflicts: DependencyConflictDetail[];
  readonly appliedStrategies: string[];
}

export interface PackageResolution {
  readonly packageName: string;
  readonly resolvedVersion: string;
  readonly strategy: string;
  readonly confidence: number;
}

export interface ImpactAnalysis {
  readonly targetPackage: PackageIdentifier;
  readonly newVersion: SemverVersion;
  readonly affectedPackages: ImpactedPackage[];
  readonly breakingChanges: BreakingChange[];
  readonly migrationEffort: MigrationEffort;
  readonly riskAssessment: RiskAssessment;
}

export interface ImpactedPackage {
  readonly name: string;
  readonly currentVersion: string;
  readonly relationship: 'direct' | 'transitive';
  readonly impactLevel: 'low' | 'medium' | 'high' | 'breaking';
  readonly migrationRequired: boolean;
}

export interface BreakingChange {
  readonly type: 'api' | 'behavior' | 'dependency' | 'config';
  readonly description: string;
  readonly affectedComponents: string[];
  readonly migrationPath?: string;
}

export interface MigrationEffort {
  readonly effort: 'trivial' | 'low' | 'medium' | 'high' | 'extensive';
  readonly estimatedTime: number; // hours
  readonly automatable: boolean;
  readonly toolsRequired: string[];
}

export interface RiskAssessment {
  readonly overall: 'low' | 'medium' | 'high' | 'critical';
  readonly factors: RiskFactor[];
  readonly mitigations: string[];
  readonly recommendedAction: 'proceed' | 'caution' | 'defer' | 'abort';
}

export interface RiskFactor {
  readonly factor: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly likelihood: number; // 0-1
}

export interface PackageAlternative {
  readonly name: string;
  readonly description: string;
  readonly compatibility: number; // 0-1
  readonly migrationComplexity: 'simple' | 'moderate' | 'complex';
  readonly advantages: string[];
  readonly disadvantages: string[];
  readonly communityScore: number;
}

// Additional security types
export interface ComplianceStatus {
  readonly framework: string;
  readonly compliant: boolean;
  readonly score: number;
  readonly issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  readonly rule: string;
  readonly severity: SeverityLevel;
  readonly description: string;
  readonly remediation: string;
}

export interface ScanMetadata {
  readonly scannerVersion: string;
  readonly rulesVersion: string;
  readonly duration: number;
  readonly coverage: number;
}

export interface TransitiveRisk {
  readonly path: string[];
  readonly riskLevel: RiskLevel;
  readonly vulnerability: string;
  readonly mitigationAvailable: boolean;
}

export interface SecuritySummary {
  readonly totalFindings: number;
  readonly criticalFindings: number;
  readonly highFindings: number;
  readonly overallRisk: RiskLevel;
  readonly compliance: Record<string, boolean>;
}

// Connection and configuration types
export interface ConnectionConfig {
  readonly host: string;
  readonly port: number;
  readonly database?: string;
  readonly username?: string;
  readonly password?: string;
  readonly ssl?: boolean;
  readonly timeout: number;
  readonly poolSize: number;
}

export interface PerformanceConfig {
  readonly maxConnections: number;
  readonly connectionTimeout: number;
  readonly requestTimeout: number;
  readonly retryAttempts: number;
  readonly backoffMultiplier: number;
}

export interface SecurityConfig {
  readonly encryption: boolean;
  readonly authentication: boolean;
  readonly authorization: boolean;
  readonly auditLogging: boolean;
}

export interface MonitoringConfig {
  readonly enabled: boolean;
  readonly metricsInterval: number;
  readonly healthCheckInterval: number;
  readonly alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  readonly errorRate: number;
  readonly responseTime: number;
  readonly queueSize: number;
  readonly diskUsage: number;
}

export interface ReportingConfig {
  readonly formats: string[];
  readonly includeMetadata: boolean;
  readonly includeRecommendations: boolean;
  readonly template?: string;
}

export interface ReportMetadata {
  readonly reportId: string;
  readonly generatedBy: string;
  readonly executionTime: number;
  readonly dataSource: string[];
  readonly filters: Record<string, any>;
}

/**
 * Abstract base classes for registry implementations
 */

export abstract class BaseRegistry extends EventEmitter implements IPackageRegistry {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: RegistryType;
  abstract readonly url: string;
  abstract readonly version: string;

  abstract publish(packageData: PackagePublishRequest): Promise<PackagePublishResult>;
  abstract download(request: PackageDownloadRequest): Promise<PackageDownloadResult>;
  abstract delete(request: PackageDeleteRequest): Promise<PackageDeleteResult>;
  abstract deprecate(request: PackageDeprecateRequest): Promise<PackageDeprecateResult>;
  abstract getMetadata(identifier: PackageIdentifier): Promise<PackageMetadata | null>;
  abstract updateMetadata(identifier: PackageIdentifier, metadata: Partial<PackageMetadata>): Promise<void>;
  abstract listVersions(packageName: string): Promise<SemverVersion[]>;
  abstract getLatestVersion(packageName: string): Promise<SemverVersion | null>;
  abstract search(query: PackageSearchQuery): Promise<PackageSearchResult>;
  abstract suggest(partial: string, maxResults?: number): Promise<string[]>;
  abstract browse(category?: string, pagination?: PaginationRequest): Promise<PackageBrowseResult>;
  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;
  abstract getHealth(): Promise<RegistryHealth>;
  abstract getStatistics(): Promise<RegistryStatistics>;

  // Common utility methods that can be implemented once
  protected validatePackageIdentifier(identifier: PackageIdentifier): void {
    if (!identifier.name || !identifier.version) {
      throw new Error('Invalid package identifier: name and version are required');
    }
  }

  protected sanitizePackageName(name: string): string {
    return name.toLowerCase().trim();
  }

  protected normalizeVersion(version: string): string {
    // Basic version normalization - can be extended
    return version.trim();
  }
}

/**
 * Factory interfaces for creating registry implementations
 */

export interface IRegistryFactory {
  createRegistry(type: RegistryType, configuration: RegistryFactoryConfig): Promise<IPackageRegistry>;
  createBackend(type: StorageBackendType, configuration: BackendConfiguration): Promise<IRegistryBackend>;
  createIndex(type: IndexEngineType, configuration: IndexConfiguration): Promise<IPackageIndex>;
  createResolver(strategy: ResolutionStrategy, configuration: ResolverConfiguration): Promise<IDependencyResolver>;
  createScanner(type: SecurityScannerType, configuration: ScannerConfiguration): Promise<ISecurityScanner>;
  createCache(strategy: CacheStrategy, configuration: CacheConfiguration): Promise<ICacheManager>;
  createAnalytics(configuration: AnalyticsConfiguration): Promise<IAnalyticsCollector>;
}

export interface RegistryFactoryConfig {
  readonly type: RegistryType;
  readonly name: string;
  readonly url: string;
  readonly backend: BackendConfiguration;
  readonly index: IndexConfiguration;
  readonly security: ScannerConfiguration;
  readonly cache?: CacheConfiguration;
  readonly analytics?: AnalyticsConfiguration;
}

/**
 * Plugin interface for extending registry functionality
 */

export interface IRegistryPlugin {
  readonly name: string;
  readonly version: string;
  readonly dependencies: string[];

  initialize(registry: IPackageRegistry): Promise<void>;
  shutdown(): Promise<void>;
  getCapabilities(): PluginCapability[];
}

export interface PluginCapability {
  readonly name: string;
  readonly type: PluginCapabilityType;
  readonly description: string;
  readonly version: string;
}

export type PluginCapabilityType =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'transformation'
  | 'notification'
  | 'analytics'
  | 'caching'
  | 'security';

/**
 * Registry extension points for customization
 */

export interface RegistryExtensionPoints {
  readonly prePublish: PrePublishHook[];
  readonly postPublish: PostPublishHook[];
  readonly preDownload: PreDownloadHook[];
  readonly postDownload: PostDownloadHook[];
  readonly preSearch: PreSearchHook[];
  readonly postSearch: PostSearchHook[];
}

export type PrePublishHook = (request: PackagePublishRequest) => Promise<PackagePublishRequest>;
export type PostPublishHook = (result: PackagePublishResult) => Promise<void>;
export type PreDownloadHook = (request: PackageDownloadRequest) => Promise<PackageDownloadRequest>;
export type PostDownloadHook = (result: PackageDownloadResult) => Promise<void>;
export type PreSearchHook = (query: PackageSearchQuery) => Promise<PackageSearchQuery>;
export type PostSearchHook = (result: PackageSearchResult) => Promise<PackageSearchResult>;

// Export all types for external use
export * from './package-types';