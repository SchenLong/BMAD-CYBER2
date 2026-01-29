/**
 * BMAD Installation Interfaces
 * ============================
 *
 * Interface definitions for dependency injection and clean architecture.
 * These interfaces define contracts for all installation system components.
 */

import type {
  ValidationResult,
  DependencyInfo,
  DependencyGraph,
  TemplateData,
  FileGenerationResult,
  InstallationSession,
  HealthCheckResult
} from './types.js';

/**
 * Template Engine Interface
 * Handles template processing and file generation from templates
 */
export interface ITemplateEngine {
  /**
   * Process a single template with provided data
   */
  processTemplate(templatePath: string, data: TemplateData): Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;

  /**
   * Process multiple templates in batch
   */
  processTemplates(templates: Array<{
    templatePath: string;
    outputPath: string;
    data: TemplateData;
  }>): Promise<FileGenerationResult[]>;

  /**
   * Validate template syntax
   */
  validateTemplate(templatePath: string): Promise<ValidationResult>;

  /**
   * Get available template functions/helpers
   */
  getAvailableHelpers(): Record<string, Function>;

  /**
   * Register custom template helper
   */
  registerHelper(name: string, helper: Function): void;

  /**
   * Health check for template engine
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Configuration Manager Interface
 * Manages module configurations and template data preparation
 */
export interface IConfigurationManager {
  /**
   * Load configuration from various sources
   */
  loadConfiguration(configPath: string): Promise<{
    success: boolean;
    config?: Record<string, unknown>;
    error?: string;
  }>;

  /**
   * Save configuration to file
   */
  saveConfiguration(
    configPath: string,
    config: Record<string, unknown>
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Merge multiple configuration objects
   */
  mergeConfigurations(
    baseConfig: Record<string, unknown>,
    ...configs: Record<string, unknown>[]
  ): Record<string, unknown>;

  /**
   * Prepare template data from configuration
   */
  prepareTemplateData(config: Record<string, unknown>): Promise<TemplateData>;

  /**
   * Validate configuration against schema
   */
  validateConfiguration(config: Record<string, unknown>): Promise<ValidationResult>;

  /**
   * Get default configuration for a module type
   */
  getDefaultConfiguration(moduleType: string): Promise<Record<string, unknown>>;

  /**
   * Health check for configuration manager
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Configuration Validator Interface
 * Validates configurations against schemas and business rules
 */
export interface IConfigurationValidator {
  /**
   * Validate configuration object
   */
  validate(config: Record<string, unknown>): Promise<ValidationResult>;

  /**
   * Validate against specific schema
   */
  validateAgainstSchema(
    config: Record<string, unknown>,
    schema: Record<string, unknown>
  ): Promise<ValidationResult>;

  /**
   * Get validation schema for module type
   */
  getSchema(moduleType: string): Promise<Record<string, unknown> | null>;

  /**
   * Register custom validation rule
   */
  registerValidationRule(
    name: string,
    rule: (value: unknown, context: Record<string, unknown>) => boolean | string
  ): void;

  /**
   * Health check for validator
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Dependency Manager Interface
 * Handles dependency analysis, resolution, and installation
 */
export interface IDependencyManager {
  /**
   * Analyze dependencies for a module
   */
  analyzeDependencies(moduleName: string): Promise<DependencyInfo[]>;

  /**
   * Resolve dependency graph
   */
  resolveDependencies(dependencies: DependencyInfo[]): Promise<{
    success: boolean;
    graph?: DependencyGraph;
    error?: string;
  }>;

  /**
   * Check if dependencies are satisfied
   */
  validateDependencies(dependencies: DependencyInfo[]): Promise<{
    success: boolean;
    unsatisfied?: DependencyInfo[];
    error?: string;
  }>;

  /**
   * Install missing dependencies
   */
  installDependencies(dependencies: DependencyInfo[]): Promise<{
    success: boolean;
    installed?: string[];
    failed?: Array<{ name: string; error: string }>;
  }>;

  /**
   * Check for circular dependencies
   */
  detectCircularDependencies(dependencies: DependencyInfo[]): Promise<{
    hasCycles: boolean;
    cycles?: string[][];
  }>;

  /**
   * Get installed version of a dependency
   */
  getInstalledVersion(dependencyName: string): Promise<string | null>;

  /**
   * Health check for dependency manager
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Post Install Verifier Interface
 * Verifies successful installation and system integrity
 */
export interface IPostInstallVerifier {
  /**
   * Verify successful installation
   */
  verify(session: InstallationSession): Promise<{
    success: boolean;
    issues?: string[];
    error?: string;
  }>;

  /**
   * Verify file integrity
   */
  verifyFileIntegrity(filePaths: string[]): Promise<{
    success: boolean;
    corruptedFiles?: string[];
    error?: string;
  }>;

  /**
   * Verify system requirements are met
   */
  verifySystemRequirements(requirements: Record<string, unknown>): Promise<{
    success: boolean;
    unmetRequirements?: string[];
    error?: string;
  }>;

  /**
   * Run custom verification scripts
   */
  runVerificationScript(scriptPath: string): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }>;

  /**
   * Health check for verifier
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * File System Interface
 * Abstracts file system operations for testability
 */
export interface IFileSystem {
  /**
   * Read file contents
   */
  readFile(path: string): Promise<string>;

  /**
   * Write file contents
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Check if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Create directory
   */
  mkdir(path: string, recursive?: boolean): Promise<void>;

  /**
   * Remove file or directory
   */
  remove(path: string): Promise<void>;

  /**
   * Copy file or directory
   */
  copy(source: string, destination: string): Promise<void>;

  /**
   * List directory contents
   */
  readdir(path: string): Promise<string[]>;

  /**
   * Get file stats
   */
  stat(path: string): Promise<{
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    mtime: Date;
  }>;
}

/**
 * Logger Interface
 * Provides structured logging capabilities
 */
export interface ILogger {
  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): ILogger;
}

/**
 * Event Emitter Interface
 * Type-safe event emission and handling
 */
export interface IEventEmitter<TEvents extends Record<string, any>> {
  /**
   * Emit an event
   */
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): boolean;

  /**
   * Listen for an event
   */
  on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): this;

  /**
   * Listen for an event once
   */
  once<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): this;

  /**
   * Remove event listener
   */
  off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): this;

  /**
   * Remove all listeners for an event
   */
  removeAllListeners<K extends keyof TEvents>(event?: K): this;
}

/**
 * Cache Interface
 * Provides caching capabilities for performance optimization
 */
export interface ICache<K, V> {
  /**
   * Get value from cache
   */
  get(key: K): Promise<V | undefined>;

  /**
   * Set value in cache
   */
  set(key: K, value: V, ttlMs?: number): Promise<void>;

  /**
   * Check if key exists in cache
   */
  has(key: K): Promise<boolean>;

  /**
   * Delete value from cache
   */
  delete(key: K): Promise<boolean>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  }>;
}

/**
 * Module Registry Interface
 * Manages module registration and discovery
 */
export interface IModuleRegistry {
  /**
   * Register a module
   */
  register(
    name: string,
    manifest: Record<string, unknown>
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Unregister a module
   */
  unregister(name: string): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Get module manifest
   */
  getManifest(name: string): Promise<Record<string, unknown> | null>;

  /**
   * List all registered modules
   */
  listModules(): Promise<string[]>;

  /**
   * Check if module is registered
   */
  isRegistered(name: string): Promise<boolean>;

  /**
   * Search modules by criteria
   */
  search(criteria: Record<string, unknown>): Promise<string[]>;
}

/**
 * Backup Manager Interface
 * Manages backup and restore operations
 */
export interface IBackupManager {
  /**
   * Create backup of files
   */
  createBackup(
    files: string[],
    backupName?: string
  ): Promise<{
    success: boolean;
    backupId?: string;
    error?: string;
  }>;

  /**
   * Restore from backup
   */
  restoreBackup(backupId: string): Promise<{
    success: boolean;
    restoredFiles?: string[];
    error?: string;
  }>;

  /**
   * List available backups
   */
  listBackups(): Promise<Array<{
    id: string;
    name: string;
    timestamp: number;
    files: string[];
  }>>;

  /**
   * Delete backup
   */
  deleteBackup(backupId: string): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Verify backup integrity
   */
  verifyBackup(backupId: string): Promise<{
    valid: boolean;
    issues?: string[];
  }>;
}

/**
 * Security Validator Interface
 * Validates security aspects of installations
 */
export interface ISecurityValidator {
  /**
   * Validate file permissions
   */
  validatePermissions(filePaths: string[]): Promise<ValidationResult>;

  /**
   * Scan for security vulnerabilities
   */
  scanForVulnerabilities(modulePath: string): Promise<{
    safe: boolean;
    vulnerabilities?: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      file?: string;
      line?: number;
    }>;
  }>;

  /**
   * Validate digital signatures
   */
  validateSignature(filePath: string, signature: string): Promise<{
    valid: boolean;
    signer?: string;
    error?: string;
  }>;

  /**
   * Check file integrity hashes
   */
  verifyChecksums(files: Array<{ path: string; expectedHash: string }>): Promise<{
    valid: boolean;
    invalidFiles?: string[];
  }>;
}

// Factory interfaces for dependency injection

/**
 * Component Factory Interface
 * Creates instances of various components
 */
export interface IComponentFactory {
  createTemplateEngine(): ITemplateEngine;
  createConfigurationManager(): IConfigurationManager;
  createConfigurationValidator(): IConfigurationValidator;
  createDependencyManager(): IDependencyManager;
  createPostInstallVerifier(): IPostInstallVerifier;
  createFileSystem(): IFileSystem;
  createLogger(): ILogger;
  createCache<K, V>(): ICache<K, V>;
  createModuleRegistry(): IModuleRegistry;
  createBackupManager(): IBackupManager;
  createSecurityValidator(): ISecurityValidator;
}

/**
 * Service Locator Interface
 * Provides service discovery and dependency resolution
 */
export interface IServiceLocator {
  register<T>(token: string, instance: T): void;
  register<T>(token: string, factory: () => T): void;
  resolve<T>(token: string): T;
  isRegistered(token: string): boolean;
}

// Utility type for component health checks
export type ComponentHealthCheck = () => Promise<HealthCheckResult>;

// Utility type for component initialization
export type ComponentInitializer<T> = () => Promise<T>;

// Service tokens for dependency injection
export const ServiceTokens = {
  TEMPLATE_ENGINE: 'ITemplateEngine',
  CONFIGURATION_MANAGER: 'IConfigurationManager',
  CONFIGURATION_VALIDATOR: 'IConfigurationValidator',
  DEPENDENCY_MANAGER: 'IDependencyManager',
  POST_INSTALL_VERIFIER: 'IPostInstallVerifier',
  FILE_SYSTEM: 'IFileSystem',
  LOGGER: 'ILogger',
  CACHE: 'ICache',
  MODULE_REGISTRY: 'IModuleRegistry',
  BACKUP_MANAGER: 'IBackupManager',
  SECURITY_VALIDATOR: 'ISecurityValidator'
} as const;