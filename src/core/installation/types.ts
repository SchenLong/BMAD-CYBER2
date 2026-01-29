/**
 * BMAD Installation Types
 * =======================
 *
 * TypeScript type definitions for the installation system.
 * Provides strong typing for all installation-related operations.
 */

export interface OrchestratorConfig {
  /** Root directory for BMAD modules */
  bmadRoot?: string;
  /** Output path for generated files */
  outputPath?: string;
  /** Enable pre-installation validation */
  enableValidation?: boolean;
  /** Enable post-installation verification */
  enableVerification?: boolean;
  /** Enable backup of existing files */
  enableBackup?: boolean;
  /** Enable strict mode with additional validations */
  strictMode?: boolean;
  /** Maximum number of concurrent installations */
  maxConcurrentInstallations?: number;
  /** Installation timeout in milliseconds */
  timeoutMs?: number;
}

export interface InstallationStep {
  /** Human-readable step name */
  name: string;
  /** Step type for execution routing */
  type: 'validation' | 'dependency_resolution' | 'template_processing' | 'file_generation' | 'custom';
  /** Execution order (lower numbers execute first) */
  order: number;
  /** Optional step metadata */
  metadata?: Record<string, unknown>;
  /** Step dependencies (other step names) */
  dependencies?: string[];
  /** Estimated duration in milliseconds */
  estimatedDuration?: number;
}

export interface InstallationSession {
  /** Unique session identifier */
  id: string;
  /** Name of the module being installed */
  moduleName: string;
  /** Module configuration */
  config: Record<string, unknown>;
  /** Installation steps to execute */
  steps: InstallationStep[];
  /** Resolved dependencies */
  dependencies: DependencyInfo[];
  /** Template data for processing */
  templateData: Record<string, unknown>;
  /** Session start time */
  startTime: number;
  /** Current session status */
  status: 'initializing' | 'installing' | 'completed' | 'failed' | 'cancelled';
  /** Current step being executed */
  currentStep?: number;
  /** Session metadata */
  metadata?: Record<string, unknown>;
}

export interface InstallationResult {
  /** Session ID that generated this result */
  sessionId: string;
  /** Module name that was installed */
  moduleName: string;
  /** Installation success status */
  success: boolean;
  /** Installation duration in milliseconds */
  duration: number;
  /** List of files that were installed/created */
  installedFiles: string[];
  /** Generated configuration files */
  generatedConfigs: string[];
  /** Non-fatal warnings during installation */
  warnings: string[];
  /** Installation error (if success is false) */
  error?: string;
  /** Additional installation metadata */
  metadata?: {
    version?: string;
    installedAt?: string;
    orchestratorVersion?: string;
    [key: string]: unknown;
  };
}

export interface InstallationStatistics {
  /** Total number of installation attempts */
  totalInstallations: number;
  /** Number of successful installations */
  successfulInstallations: number;
  /** Number of failed installations */
  failedInstallations: number;
  /** Average installation time in milliseconds */
  averageInstallationTime: number;
  /** Installation history (optional) */
  recentInstallations?: Array<{
    moduleName: string;
    success: boolean;
    duration: number;
    timestamp: number;
  }>;
}

export interface DependencyInfo {
  /** Dependency name */
  name: string;
  /** Required version or version range */
  version: string;
  /** Dependency type */
  type: 'required' | 'optional' | 'development';
  /** Whether dependency is currently installed */
  installed: boolean;
  /** Installed version (if installed) */
  installedVersion?: string;
  /** Dependency source/registry */
  source?: string;
  /** Nested dependencies */
  dependencies?: DependencyInfo[];
}

export interface DependencyGraph {
  /** Root node representing the main module */
  root: DependencyNode;
  /** All nodes in the dependency graph */
  nodes: Map<string, DependencyNode>;
  /** Resolved installation order */
  installationOrder: string[];
  /** Circular dependency detection */
  hasCycles: boolean;
  /** Detected cycles (if any) */
  cycles?: string[][];
}

export interface DependencyNode {
  /** Node identifier (usually module name) */
  id: string;
  /** Module information */
  module: DependencyInfo;
  /** Direct dependencies */
  dependencies: string[];
  /** Modules that depend on this one */
  dependents: string[];
  /** Installation depth from root */
  depth: number;
}

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors (if any) */
  errors: string[];
  /** Non-fatal validation warnings */
  warnings?: string[];
  /** Validation metadata */
  metadata?: Record<string, unknown>;
}

export interface TemplateData {
  /** Module-specific variables */
  module: Record<string, unknown>;
  /** Global configuration variables */
  global: Record<string, unknown>;
  /** Environment variables */
  environment: Record<string, string>;
  /** Utility functions for templates */
  utils: Record<string, Function>;
}

export interface FileGenerationResult {
  /** Generated file path */
  filePath: string;
  /** Generation success status */
  success: boolean;
  /** File content hash for verification */
  contentHash?: string;
  /** File size in bytes */
  size?: number;
  /** Generation error (if success is false) */
  error?: string;
}

export interface BackupInfo {
  /** Original file path */
  originalPath: string;
  /** Backup file path */
  backupPath: string;
  /** Backup timestamp */
  timestamp: number;
  /** File hash for integrity verification */
  hash: string;
}

export interface SystemRequirements {
  /** Minimum Node.js version */
  nodeVersion?: string;
  /** Required operating system */
  os?: 'windows' | 'darwin' | 'linux' | 'any';
  /** Minimum available memory in MB */
  memoryMB?: number;
  /** Required disk space in MB */
  diskSpaceMB?: number;
  /** Required system packages */
  systemPackages?: string[];
  /** Required environment variables */
  environmentVariables?: string[];
}

export interface ModuleManifest {
  /** Module name */
  name: string;
  /** Module version */
  version: string;
  /** Module description */
  description?: string;
  /** Module author */
  author?: string;
  /** Module dependencies */
  dependencies?: Record<string, string>;
  /** System requirements */
  systemRequirements?: SystemRequirements;
  /** Installation scripts */
  scripts?: {
    preInstall?: string;
    postInstall?: string;
    preUninstall?: string;
    postUninstall?: string;
  };
  /** Template files to process */
  templates?: string[];
  /** Files to copy during installation */
  files?: Array<{
    source: string;
    destination: string;
    template?: boolean;
  }>;
  /** Configuration schema */
  configSchema?: Record<string, unknown>;
  /** Module metadata */
  metadata?: Record<string, unknown>;
}

export interface InstallationContext {
  /** Current session */
  session: InstallationSession;
  /** Module manifest */
  manifest: ModuleManifest;
  /** Resolved file paths */
  paths: {
    moduleRoot: string;
    outputRoot: string;
    templatesDir: string;
    configDir: string;
    backupDir: string;
  };
  /** Installation environment */
  environment: {
    nodeVersion: string;
    platform: string;
    architecture: string;
    environmentVariables: Record<string, string>;
  };
}

export interface ProgressInfo {
  /** Current step number */
  current: number;
  /** Total number of steps */
  total: number;
  /** Completion percentage (0-100) */
  percentage: number;
  /** Current step name */
  stepName?: string;
  /** Elapsed time in milliseconds */
  elapsed?: number;
  /** Estimated time remaining in milliseconds */
  estimatedRemaining?: number;
}

export interface HealthCheckResult {
  /** Component health status */
  healthy: boolean;
  /** Health check timestamp */
  timestamp: number;
  /** Component version */
  version?: string;
  /** Additional health information */
  details?: Record<string, unknown>;
  /** Health check error (if unhealthy) */
  error?: string;
}

// Event types for type-safe event handling
export interface OrchestratorEvents {
  'session:created': { sessionId: string; moduleName: string };
  'session:destroyed': { sessionId: string; moduleName: string };
  'installation:start': { sessionId: string; moduleName: string };
  'installation:complete': InstallationResult;
  'installation:failed': { sessionId: string; moduleName: string; error: Error };
  'step:start': { sessionId: string; step: string };
  'step:complete': { sessionId: string; step: string };
  'step:error': { sessionId: string; step: string; error: Error };
  'progress': ProgressInfo;
  'warning': { sessionId: string; warning: string };
}

// Utility types
export type EventName = keyof OrchestratorEvents;
export type EventHandler<T extends EventName> = (data: OrchestratorEvents[T]) => void;

export type InstallationStatus = InstallationSession['status'];
export type StepType = InstallationStep['type'];
export type DependencyType = DependencyInfo['type'];

// Type guards
export function isValidationStep(step: InstallationStep): step is InstallationStep & { type: 'validation' } {
  return step.type === 'validation';
}

export function isDependencyResolutionStep(
  step: InstallationStep
): step is InstallationStep & { type: 'dependency_resolution' } {
  return step.type === 'dependency_resolution';
}

export function isTemplateProcessingStep(
  step: InstallationStep
): step is InstallationStep & { type: 'template_processing' } {
  return step.type === 'template_processing';
}

export function isFileGenerationStep(
  step: InstallationStep
): step is InstallationStep & { type: 'file_generation' } {
  return step.type === 'file_generation';
}

export function isSuccessfulResult(result: InstallationResult): result is InstallationResult & { success: true } {
  return result.success === true;
}

export function isFailedResult(result: InstallationResult): result is InstallationResult & { success: false; error: string } {
  return result.success === false;
}

// Configuration validation helpers
export function validateOrchestratorConfig(config: OrchestratorConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.maxConcurrentInstallations && config.maxConcurrentInstallations < 1) {
    errors.push('maxConcurrentInstallations must be at least 1');
  }

  if (config.timeoutMs && config.timeoutMs < 1000) {
    warnings.push('timeoutMs less than 1 second may cause premature timeouts');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}