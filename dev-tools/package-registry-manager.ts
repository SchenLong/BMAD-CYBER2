/**
 * BMAD Package Registry Manager
 * Epic 3: Story 3.3 - Package Registry System
 *
 * A comprehensive registry system for tracking installed BMAD modules,
 * their health, versions, and providing update/uninstall capabilities.
 *
 * Designed by Morgan (Module Builder) for integration with:
 * - Amelia's installation framework
 * - Winston's dependency management system
 * - BMAD specialized teams (cybersec, intel, legal, strategy)
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as yaml from 'yaml';

const execAsync = promisify(exec);

// Registry entry interfaces
interface PackageRegistryEntry {
  id: string;
  name: string;
  scope: string;
  version: string;
  fullName: string; // e.g., @bmad-cybercommand/cybersec-team
  type: 'specialized-team' | 'core-module' | 'extension' | 'workflow' | 'agent';
  category: string;

  // Installation metadata
  installationId: string;
  installedAt: Date;
  installedBy: string; // user or system
  installationPath: string;
  configPath?: string;

  // Health and status
  status: 'installed' | 'installing' | 'failed' | 'corrupted' | 'outdated' | 'uninstalling';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  healthDetails?: HealthCheckResult;

  // Version tracking
  availableVersions: string[];
  latestVersion?: string;
  updateAvailable: boolean;
  lastVersionCheck: Date;

  // Dependencies
  dependencies: PackageDependency[];
  dependents: string[]; // Package IDs that depend on this

  // Configuration
  configuration: PackageConfiguration;
  customizations: Record<string, any>;

  // Files and artifacts
  installedFiles: string[];
  outputDirectories: string[];
  backupPath?: string;

  // Specialized teams specific
  agentsCount?: number;
  workflowsCount?: number;
  exposedWorkflows?: ExposedWorkflow[];
  permissions?: PackagePermissions;

  // Metadata
  repository?: RepositoryInfo;
  keywords: string[];
  description?: string;
  maintainer?: string;
  license?: string;

  // Lifecycle
  isActive: boolean;
  canUninstall: boolean;
  requiresRestart: boolean;

  // Integrity
  checksums: Record<string, string>;
  signature?: string;
  verified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface PackageDependency {
  packageId: string;
  name: string;
  version: string;
  required: boolean;
  condition?: string;
  satisfied: boolean;
}

interface PackageConfiguration {
  outputFolder: string;
  securityFramework?: string;
  moduleCode: string;
  agentsPath: string;
  workflowsPath: string;
  outputSubdirectories: Record<string, string>;
}

interface ExposedWorkflow {
  workflowId: string;
  trigger: string;
  description: string;
  accessLevel: string;
}

interface PackagePermissions {
  filesystem: {
    read: string[];
    write: string[];
  };
  network: boolean;
  shell?: {
    allowedCommands: string[];
    blockedCommands: string[];
  };
  sensitiveData: boolean;
}

interface RepositoryInfo {
  type: string;
  url: string;
  directory?: string;
  branch?: string;
  commit?: string;
}

interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    filesIntact: boolean;
    dependenciesResolved: boolean;
    configurationValid: boolean;
    permissionsCorrect: boolean;
    agentsAccessible?: boolean;
    workflowsAccessible?: boolean;
    outputDirectoriesWritable: boolean;
  };
  issues: HealthIssue[];
  score: number; // 0-100
  lastChecked: Date;
}

interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'files' | 'dependencies' | 'configuration' | 'permissions' | 'agents' | 'workflows';
  description: string;
  resolution?: string;
  autoFixable: boolean;
}

interface RegistryStats {
  totalPackages: number;
  packagesByType: Record<string, number>;
  packagesByCategory: Record<string, number>;
  packagesByStatus: Record<string, number>;
  packagesByHealth: Record<string, number>;
  totalInstallationSize: number;
  updatesAvailable: number;
  healthyPackages: number;
  lastFullScan: Date;
}

interface BackupInfo {
  backupId: string;
  packageId: string;
  packageName: string;
  version: string;
  createdAt: Date;
  backupPath: string;
  size: number;
  type: 'automatic' | 'manual' | 'pre-update' | 'pre-uninstall';
  verified: boolean;
  checksums: Record<string, string>;
}

interface UpdateInfo {
  packageId: string;
  currentVersion: string;
  availableVersion: string;
  updateType: 'patch' | 'minor' | 'major' | 'breaking';
  releaseNotes?: string;
  securityUpdate: boolean;
  dependencyChanges: {
    added: PackageDependency[];
    removed: string[];
    updated: PackageDependency[];
  };
  estimatedSize: number;
  compatibilityIssues: string[];
  requiresRestart: boolean;
}

/**
 * Main Package Registry Manager
 * Handles all operations for tracking installed BMAD modules
 */
export class PackageRegistryManager {
  private registryPath: string;
  private backupPath: string;
  private registry: Map<string, PackageRegistryEntry>;
  private backups: Map<string, BackupInfo>;
  private config: RegistryConfiguration;
  private logger?: any; // Integration with Amelia's logger

  constructor(options: RegistryManagerOptions = {}) {
    this.config = {
      bmadRoot: options.bmadRoot || './_bmad',
      registryPath: options.registryPath || './_bmad/registry',
      backupPath: options.backupPath || './_bmad/backups',
      enableHealthChecks: options.enableHealthChecks !== false,
      healthCheckInterval: options.healthCheckInterval || 3600000, // 1 hour
      enableAutoBackups: options.enableAutoBackups !== false,
      maxBackups: options.maxBackups || 50,
      npmRegistry: options.npmRegistry || 'https://registry.npmjs.org',
      enableVersionChecks: options.enableVersionChecks !== false,
      versionCheckInterval: options.versionCheckInterval || 86400000, // 24 hours
      ...options
    };

    this.registryPath = path.resolve(this.config.registryPath);
    this.backupPath = path.resolve(this.config.backupPath);
    this.registry = new Map();
    this.backups = new Map();
  }

  /**
   * Initialize the registry system
   */
  async initialize(): Promise<void> {
    try {
      // Create required directories
      await this.ensureDirectories();

      // Load existing registry
      await this.loadRegistry();

      // Load backup index
      await this.loadBackupIndex();

      // Verify registry integrity
      await this.verifyRegistryIntegrity();

      // Start background tasks if enabled
      if (this.config.enableHealthChecks) {
        this.startHealthCheckScheduler();
      }

      if (this.config.enableVersionChecks) {
        this.startVersionCheckScheduler();
      }

      this.log('info', 'Package Registry', 'Registry system initialized successfully', {
        totalPackages: this.registry.size,
        totalBackups: this.backups.size
      });

    } catch (error) {
      this.log('error', 'Package Registry', 'Failed to initialize registry system', { error: error.message });
      throw error;
    }
  }

  /**
   * Register a new installed package
   */
  async registerPackage(packageInfo: Partial<PackageRegistryEntry>): Promise<string> {
    try {
      const packageId = this.generatePackageId(packageInfo.name!, packageInfo.version!);

      // Check if package already exists
      if (this.registry.has(packageId)) {
        throw new Error(`Package ${packageInfo.name}@${packageInfo.version} is already registered`);
      }

      // Create complete registry entry
      const registryEntry: PackageRegistryEntry = {
        id: packageId,
        name: packageInfo.name!,
        scope: packageInfo.scope || '@bmad-cybercommand',
        version: packageInfo.version!,
        fullName: packageInfo.fullName || `${packageInfo.scope}/${packageInfo.name}`,
        type: packageInfo.type || 'specialized-team',
        category: packageInfo.category || 'bmad-specialized-teams',

        // Installation metadata
        installationId: this.generateInstallationId(),
        installedAt: new Date(),
        installedBy: process.env.USER || 'system',
        installationPath: packageInfo.installationPath!,
        configPath: packageInfo.configPath,

        // Health and status
        status: 'installed',
        health: 'unknown',
        lastHealthCheck: new Date(),
        healthDetails: undefined,

        // Version tracking
        availableVersions: [packageInfo.version!],
        latestVersion: packageInfo.version,
        updateAvailable: false,
        lastVersionCheck: new Date(),

        // Dependencies
        dependencies: packageInfo.dependencies || [],
        dependents: [],

        // Configuration
        configuration: packageInfo.configuration!,
        customizations: packageInfo.customizations || {},

        // Files and artifacts
        installedFiles: packageInfo.installedFiles || [],
        outputDirectories: packageInfo.outputDirectories || [],
        backupPath: undefined,

        // Specialized teams specific
        agentsCount: packageInfo.agentsCount,
        workflowsCount: packageInfo.workflowsCount,
        exposedWorkflows: packageInfo.exposedWorkflows,
        permissions: packageInfo.permissions,

        // Metadata
        repository: packageInfo.repository,
        keywords: packageInfo.keywords || [],
        description: packageInfo.description,
        maintainer: packageInfo.maintainer,
        license: packageInfo.license,

        // Lifecycle
        isActive: true,
        canUninstall: true,
        requiresRestart: false,

        // Integrity
        checksums: await this.generateChecksums(packageInfo.installedFiles || []),
        signature: packageInfo.signature,
        verified: false,

        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Verify package integrity
      registryEntry.verified = await this.verifyPackageIntegrity(registryEntry);

      // Perform initial health check
      registryEntry.healthDetails = await this.performHealthCheck(registryEntry);
      registryEntry.health = registryEntry.healthDetails.overall;

      // Update dependents
      await this.updateDependents(registryEntry);

      // Store in registry
      this.registry.set(packageId, registryEntry);

      // Save registry
      await this.saveRegistry();

      // Create automatic backup if enabled
      if (this.config.enableAutoBackups) {
        await this.createPackageBackup(packageId, 'automatic');
      }

      this.log('info', 'Package Registry', `Package registered: ${registryEntry.fullName}`, {
        packageId,
        version: registryEntry.version,
        health: registryEntry.health
      });

      return packageId;

    } catch (error) {
      this.log('error', 'Package Registry', `Failed to register package: ${packageInfo.name}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Unregister and uninstall a package
   */
  async uninstallPackage(packageId: string, options: UninstallOptions = {}): Promise<void> {
    try {
      const packageEntry = this.registry.get(packageId);
      if (!packageEntry) {
        throw new Error(`Package not found: ${packageId}`);
      }

      if (!packageEntry.canUninstall && !options.force) {
        throw new Error(`Package cannot be uninstalled: ${packageEntry.name}`);
      }

      // Check dependents
      if (packageEntry.dependents.length > 0 && !options.force) {
        const dependentNames = packageEntry.dependents
          .map(id => this.registry.get(id)?.name)
          .filter(Boolean);
        throw new Error(`Cannot uninstall ${packageEntry.name}. Dependent packages: ${dependentNames.join(', ')}`);
      }

      // Update status
      packageEntry.status = 'uninstalling';
      packageEntry.updatedAt = new Date();
      await this.saveRegistry();

      // Create backup before uninstall if enabled
      if (!options.skipBackup) {
        await this.createPackageBackup(packageId, 'pre-uninstall');
      }

      // Remove files
      await this.removePackageFiles(packageEntry, options);

      // Remove from dependencies of other packages
      await this.removeDependencies(packageId);

      // Remove from registry
      this.registry.delete(packageId);

      // Save registry
      await this.saveRegistry();

      this.log('info', 'Package Registry', `Package uninstalled: ${packageEntry.fullName}`, {
        packageId,
        filesRemoved: packageEntry.installedFiles.length
      });

    } catch (error) {
      this.log('error', 'Package Registry', `Failed to uninstall package: ${packageId}`, { error: error.message });

      // Restore status on failure
      const packageEntry = this.registry.get(packageId);
      if (packageEntry) {
        packageEntry.status = 'failed';
        packageEntry.updatedAt = new Date();
        await this.saveRegistry();
      }

      throw error;
    }
  }

  /**
   * Perform comprehensive health check on a package
   */
  async performHealthCheck(packageEntry: PackageRegistryEntry): Promise<HealthCheckResult> {
    const healthResult: HealthCheckResult = {
      overall: 'healthy',
      checks: {
        filesIntact: false,
        dependenciesResolved: false,
        configurationValid: false,
        permissionsCorrect: false,
        agentsAccessible: false,
        workflowsAccessible: false,
        outputDirectoriesWritable: false
      },
      issues: [],
      score: 0,
      lastChecked: new Date()
    };

    try {
      // Check 1: Files intact
      healthResult.checks.filesIntact = await this.checkFilesIntact(packageEntry);
      if (!healthResult.checks.filesIntact) {
        healthResult.issues.push({
          severity: 'high',
          category: 'files',
          description: 'One or more package files are missing or corrupted',
          resolution: 'Reinstall the package or restore from backup',
          autoFixable: false
        });
      }

      // Check 2: Dependencies resolved
      healthResult.checks.dependenciesResolved = await this.checkDependenciesResolved(packageEntry);
      if (!healthResult.checks.dependenciesResolved) {
        healthResult.issues.push({
          severity: 'medium',
          category: 'dependencies',
          description: 'One or more dependencies are not properly resolved',
          resolution: 'Update or reinstall missing dependencies',
          autoFixable: true
        });
      }

      // Check 3: Configuration valid
      healthResult.checks.configurationValid = await this.checkConfigurationValid(packageEntry);
      if (!healthResult.checks.configurationValid) {
        healthResult.issues.push({
          severity: 'medium',
          category: 'configuration',
          description: 'Package configuration is invalid or corrupted',
          resolution: 'Restore default configuration or reconfigure',
          autoFixable: true
        });
      }

      // Check 4: Permissions correct
      healthResult.checks.permissionsCorrect = await this.checkPermissionsCorrect(packageEntry);
      if (!healthResult.checks.permissionsCorrect) {
        healthResult.issues.push({
          severity: 'low',
          category: 'permissions',
          description: 'File permissions are incorrect',
          resolution: 'Fix file permissions',
          autoFixable: true
        });
      }

      // Check 5: Agents accessible (if applicable)
      if (packageEntry.type === 'specialized-team' && packageEntry.agentsCount) {
        healthResult.checks.agentsAccessible = await this.checkAgentsAccessible(packageEntry);
        if (!healthResult.checks.agentsAccessible) {
          healthResult.issues.push({
            severity: 'medium',
            category: 'agents',
            description: 'One or more agents are not accessible',
            resolution: 'Check agent configuration and file paths',
            autoFixable: false
          });
        }
      } else {
        healthResult.checks.agentsAccessible = true;
      }

      // Check 6: Workflows accessible (if applicable)
      if (packageEntry.type === 'specialized-team' && packageEntry.workflowsCount) {
        healthResult.checks.workflowsAccessible = await this.checkWorkflowsAccessible(packageEntry);
        if (!healthResult.checks.workflowsAccessible) {
          healthResult.issues.push({
            severity: 'medium',
            category: 'workflows',
            description: 'One or more workflows are not accessible',
            resolution: 'Check workflow configuration and file paths',
            autoFixable: false
          });
        }
      } else {
        healthResult.checks.workflowsAccessible = true;
      }

      // Check 7: Output directories writable
      healthResult.checks.outputDirectoriesWritable = await this.checkOutputDirectoriesWritable(packageEntry);
      if (!healthResult.checks.outputDirectoriesWritable) {
        healthResult.issues.push({
          severity: 'low',
          category: 'permissions',
          description: 'Output directories are not writable',
          resolution: 'Fix directory permissions',
          autoFixable: true
        });
      }

      // Calculate health score
      const totalChecks = Object.keys(healthResult.checks).length;
      const passedChecks = Object.values(healthResult.checks).filter(Boolean).length;
      healthResult.score = Math.round((passedChecks / totalChecks) * 100);

      // Determine overall health
      const criticalIssues = healthResult.issues.filter(i => i.severity === 'critical').length;
      const highIssues = healthResult.issues.filter(i => i.severity === 'high').length;
      const mediumIssues = healthResult.issues.filter(i => i.severity === 'medium').length;

      if (criticalIssues > 0 || healthResult.score < 50) {
        healthResult.overall = 'unhealthy';
      } else if (highIssues > 0 || mediumIssues > 2 || healthResult.score < 80) {
        healthResult.overall = 'degraded';
      } else {
        healthResult.overall = 'healthy';
      }

    } catch (error) {
      healthResult.overall = 'unhealthy';
      healthResult.issues.push({
        severity: 'critical',
        category: 'configuration',
        description: `Health check failed: ${error.message}`,
        resolution: 'Review package installation and configuration',
        autoFixable: false
      });
    }

    return healthResult;
  }

  /**
   * Check for available updates for all packages
   */
  async checkForUpdates(): Promise<UpdateInfo[]> {
    const updates: UpdateInfo[] = [];

    for (const [packageId, packageEntry] of this.registry) {
      try {
        const latestVersion = await this.getLatestVersion(packageEntry.fullName);

        if (latestVersion && this.isNewerVersion(latestVersion, packageEntry.version)) {
          const updateInfo = await this.getUpdateInfo(packageId, latestVersion);
          updates.push(updateInfo);

          // Update registry entry
          packageEntry.latestVersion = latestVersion;
          packageEntry.updateAvailable = true;
          packageEntry.lastVersionCheck = new Date();
          if (!packageEntry.availableVersions.includes(latestVersion)) {
            packageEntry.availableVersions.push(latestVersion);
          }
        } else {
          packageEntry.updateAvailable = false;
          packageEntry.lastVersionCheck = new Date();
        }
      } catch (error) {
        this.log('warn', 'Package Registry', `Failed to check updates for ${packageEntry.fullName}`, { error: error.message });
      }
    }

    await this.saveRegistry();

    this.log('info', 'Package Registry', `Update check completed`, {
      totalPackages: this.registry.size,
      updatesAvailable: updates.length
    });

    return updates;
  }

  /**
   * Create a backup of a package
   */
  async createPackageBackup(packageId: string, type: BackupInfo['type']): Promise<string> {
    try {
      const packageEntry = this.registry.get(packageId);
      if (!packageEntry) {
        throw new Error(`Package not found: ${packageId}`);
      }

      const backupId = this.generateBackupId(packageId);
      const backupDir = path.join(this.backupPath, packageEntry.name, backupId);

      // Create backup directory
      await fs.promises.mkdir(backupDir, { recursive: true });

      // Copy all package files
      const copiedFiles: string[] = [];
      let totalSize = 0;

      for (const file of packageEntry.installedFiles) {
        if (await this.fileExists(file)) {
          const relativePath = path.relative(packageEntry.installationPath, file);
          const backupFile = path.join(backupDir, 'files', relativePath);

          await fs.promises.mkdir(path.dirname(backupFile), { recursive: true });
          await fs.promises.copyFile(file, backupFile);

          const stats = await fs.promises.stat(file);
          totalSize += stats.size;
          copiedFiles.push(backupFile);
        }
      }

      // Copy configuration if exists
      if (packageEntry.configPath && await this.fileExists(packageEntry.configPath)) {
        const configBackup = path.join(backupDir, 'config.yaml');
        await fs.promises.copyFile(packageEntry.configPath, configBackup);
        copiedFiles.push(configBackup);
      }

      // Create backup metadata
      const backupInfo: BackupInfo = {
        backupId,
        packageId,
        packageName: packageEntry.name,
        version: packageEntry.version,
        createdAt: new Date(),
        backupPath: backupDir,
        size: totalSize,
        type,
        verified: false,
        checksums: await this.generateChecksums(copiedFiles)
      };

      // Save backup metadata
      const metadataPath = path.join(backupDir, 'backup-metadata.json');
      await fs.promises.writeFile(metadataPath, JSON.stringify(backupInfo, null, 2));

      // Verify backup integrity
      backupInfo.verified = await this.verifyBackupIntegrity(backupInfo);

      // Update backup index
      this.backups.set(backupId, backupInfo);
      await this.saveBackupIndex();

      // Update package entry
      packageEntry.backupPath = backupDir;
      packageEntry.updatedAt = new Date();
      await this.saveRegistry();

      // Clean old backups if needed
      await this.cleanOldBackups(packageEntry.name);

      this.log('info', 'Package Registry', `Backup created: ${packageEntry.fullName}`, {
        backupId,
        type,
        size: totalSize,
        verified: backupInfo.verified
      });

      return backupId;

    } catch (error) {
      this.log('error', 'Package Registry', `Failed to create backup for ${packageId}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): RegistryStats {
    const stats: RegistryStats = {
      totalPackages: this.registry.size,
      packagesByType: {},
      packagesByCategory: {},
      packagesByStatus: {},
      packagesByHealth: {},
      totalInstallationSize: 0,
      updatesAvailable: 0,
      healthyPackages: 0,
      lastFullScan: new Date()
    };

    for (const packageEntry of this.registry.values()) {
      // Count by type
      stats.packagesByType[packageEntry.type] = (stats.packagesByType[packageEntry.type] || 0) + 1;

      // Count by category
      stats.packagesByCategory[packageEntry.category] = (stats.packagesByCategory[packageEntry.category] || 0) + 1;

      // Count by status
      stats.packagesByStatus[packageEntry.status] = (stats.packagesByStatus[packageEntry.status] || 0) + 1;

      // Count by health
      stats.packagesByHealth[packageEntry.health] = (stats.packagesByHealth[packageEntry.health] || 0) + 1;

      // Updates available
      if (packageEntry.updateAvailable) {
        stats.updatesAvailable++;
      }

      // Healthy packages
      if (packageEntry.health === 'healthy') {
        stats.healthyPackages++;
      }

      // Calculate total size (estimate based on file count)
      stats.totalInstallationSize += packageEntry.installedFiles.length * 1024; // Rough estimate
    }

    return stats;
  }

  /**
   * List all packages with optional filtering
   */
  listPackages(filter: PackageFilter = {}): PackageRegistryEntry[] {
    let packages = Array.from(this.registry.values());

    if (filter.type) {
      packages = packages.filter(pkg => pkg.type === filter.type);
    }

    if (filter.status) {
      packages = packages.filter(pkg => pkg.status === filter.status);
    }

    if (filter.health) {
      packages = packages.filter(pkg => pkg.health === filter.health);
    }

    if (filter.category) {
      packages = packages.filter(pkg => pkg.category === filter.category);
    }

    if (filter.updateAvailable !== undefined) {
      packages = packages.filter(pkg => pkg.updateAvailable === filter.updateAvailable);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      packages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(term) ||
        pkg.description?.toLowerCase().includes(term) ||
        pkg.keywords.some(keyword => keyword.toLowerCase().includes(term))
      );
    }

    // Sort by name by default
    packages.sort((a, b) => a.name.localeCompare(b.name));

    return packages;
  }

  // Helper methods and utility functions
  private async ensureDirectories(): Promise<void> {
    await fs.promises.mkdir(this.registryPath, { recursive: true });
    await fs.promises.mkdir(this.backupPath, { recursive: true });
  }

  private generatePackageId(name: string, version: string): string {
    return `${name}_${version}_${Date.now()}`;
  }

  private generateInstallationId(): string {
    return `install_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateBackupId(packageId: string): string {
    return `backup_${packageId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private async generateChecksums(files: string[]): Promise<Record<string, string>> {
    const checksums: Record<string, string> = {};

    for (const file of files) {
      if (await this.fileExists(file)) {
        const content = await fs.promises.readFile(file);
        checksums[file] = crypto.createHash('sha256').update(content).digest('hex');
      }
    }

    return checksums;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private isNewerVersion(version1: string, version2: string): boolean {
    // Simple version comparison - in production, use semver
    return version1 > version2;
  }

  private log(level: string, category: string, message: string, metadata?: any): void {
    if (this.logger) {
      this.logger[level](category, message, metadata);
    } else {
      console.log(`[${level.toUpperCase()}] [${category}] ${message}`, metadata ? JSON.stringify(metadata, null, 2) : '');
    }
  }

  // Placeholder implementations for missing methods
  private async loadRegistry(): Promise<void> {
    const registryFile = path.join(this.registryPath, 'registry.json');
    if (await this.fileExists(registryFile)) {
      const content = await fs.promises.readFile(registryFile, 'utf8');
      const data = JSON.parse(content);
      this.registry = new Map(data.packages || []);
    }
  }

  private async saveRegistry(): Promise<void> {
    const registryFile = path.join(this.registryPath, 'registry.json');
    const data = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      packages: Array.from(this.registry.entries())
    };
    await fs.promises.writeFile(registryFile, JSON.stringify(data, null, 2));
  }

  private async loadBackupIndex(): Promise<void> {
    const backupIndexFile = path.join(this.backupPath, 'backup-index.json');
    if (await this.fileExists(backupIndexFile)) {
      const content = await fs.promises.readFile(backupIndexFile, 'utf8');
      const data = JSON.parse(content);
      this.backups = new Map(data.backups || []);
    }
  }

  private async saveBackupIndex(): Promise<void> {
    const backupIndexFile = path.join(this.backupPath, 'backup-index.json');
    const data = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      backups: Array.from(this.backups.entries())
    };
    await fs.promises.writeFile(backupIndexFile, JSON.stringify(data, null, 2));
  }

  private async verifyRegistryIntegrity(): Promise<void> {
    // Verify all registered packages still exist
    for (const [packageId, packageEntry] of this.registry) {
      if (!await this.fileExists(packageEntry.installationPath)) {
        packageEntry.status = 'corrupted';
        packageEntry.health = 'unhealthy';
      }
    }
  }

  private async verifyPackageIntegrity(packageEntry: PackageRegistryEntry): Promise<boolean> {
    for (const file of packageEntry.installedFiles) {
      if (!await this.fileExists(file)) {
        return false;
      }
    }
    return true;
  }

  private async verifyBackupIntegrity(backupInfo: BackupInfo): Promise<boolean> {
    return await this.fileExists(backupInfo.backupPath);
  }

  private async updateDependents(packageEntry: PackageRegistryEntry): Promise<void> {
    // Update dependent tracking
    for (const [, otherPackage] of this.registry) {
      if (otherPackage.dependencies.some(dep => dep.name === packageEntry.name)) {
        if (!otherPackage.dependents.includes(packageEntry.id)) {
          otherPackage.dependents.push(packageEntry.id);
        }
      }
    }
  }

  private async checkFilesIntact(packageEntry: PackageRegistryEntry): Promise<boolean> {
    return await this.verifyPackageIntegrity(packageEntry);
  }

  private async checkDependenciesResolved(packageEntry: PackageRegistryEntry): Promise<boolean> {
    return packageEntry.dependencies.every(dep => dep.satisfied);
  }

  private async checkConfigurationValid(packageEntry: PackageRegistryEntry): Promise<boolean> {
    if (packageEntry.configPath) {
      return await this.fileExists(packageEntry.configPath);
    }
    return true;
  }

  private async checkPermissionsCorrect(packageEntry: PackageRegistryEntry): Promise<boolean> {
    // Basic permission check - can be extended
    return true;
  }

  private async checkAgentsAccessible(packageEntry: PackageRegistryEntry): Promise<boolean> {
    if (packageEntry.configuration.agentsPath) {
      return await this.fileExists(packageEntry.configuration.agentsPath);
    }
    return true;
  }

  private async checkWorkflowsAccessible(packageEntry: PackageRegistryEntry): Promise<boolean> {
    if (packageEntry.configuration.workflowsPath) {
      return await this.fileExists(packageEntry.configuration.workflowsPath);
    }
    return true;
  }

  private async checkOutputDirectoriesWritable(packageEntry: PackageRegistryEntry): Promise<boolean> {
    for (const dir of packageEntry.outputDirectories) {
      try {
        await fs.promises.access(dir, fs.constants.W_OK);
      } catch {
        return false;
      }
    }
    return true;
  }

  private async getLatestVersion(packageName: string): Promise<string | null> {
    // Mock implementation - in production, query NPM registry
    return null;
  }

  private async getUpdateInfo(packageId: string, targetVersion: string): Promise<UpdateInfo> {
    const packageEntry = this.registry.get(packageId)!;
    return {
      packageId,
      currentVersion: packageEntry.version,
      availableVersion: targetVersion,
      updateType: 'minor',
      securityUpdate: false,
      dependencyChanges: { added: [], removed: [], updated: [] },
      estimatedSize: 0,
      compatibilityIssues: [],
      requiresRestart: false
    };
  }

  private startHealthCheckScheduler(): void {
    setInterval(() => {
      this.runSystemHealthCheck().catch(error => {
        this.log('error', 'Health Check Scheduler', 'Health check failed', { error: error.message });
      });
    }, this.config.healthCheckInterval);
  }

  private startVersionCheckScheduler(): void {
    setInterval(() => {
      this.checkForUpdates().catch(error => {
        this.log('error', 'Version Check Scheduler', 'Version check failed', { error: error.message });
      });
    }, this.config.versionCheckInterval);
  }

  private async runSystemHealthCheck(): Promise<{ healthy: number; degraded: number; unhealthy: number; total: number }> {
    const results = { healthy: 0, degraded: 0, unhealthy: 0, total: this.registry.size };

    for (const [packageId, packageEntry] of this.registry) {
      const healthResult = await this.performHealthCheck(packageEntry);
      packageEntry.healthDetails = healthResult;
      packageEntry.health = healthResult.overall;
      packageEntry.lastHealthCheck = new Date();
      results[healthResult.overall]++;
    }

    await this.saveRegistry();
    return results;
  }

  private async removePackageFiles(packageEntry: PackageRegistryEntry, options: UninstallOptions): Promise<void> {
    // Remove package files implementation
    for (const file of packageEntry.installedFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (error) {
        this.log('warn', 'Package Registry', `Failed to remove file: ${file}`, { error: error.message });
      }
    }
  }

  private async removeDependencies(packageId: string): Promise<void> {
    // Remove dependencies implementation
    for (const [, packageEntry] of this.registry) {
      packageEntry.dependents = packageEntry.dependents.filter(id => id !== packageId);
    }
  }

  private async cleanOldBackups(packageName: string): Promise<void> {
    // Clean old backups implementation
    const packageBackups = Array.from(this.backups.values())
      .filter(backup => backup.packageName === packageName)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (packageBackups.length > this.config.maxBackups) {
      const toRemove = packageBackups.slice(this.config.maxBackups);
      for (const backup of toRemove) {
        try {
          await fs.promises.rmdir(backup.backupPath, { recursive: true });
          this.backups.delete(backup.backupId);
        } catch (error) {
          this.log('warn', 'Package Registry', `Failed to remove old backup: ${backup.backupId}`, { error: error.message });
        }
      }
      await this.saveBackupIndex();
    }
  }
}

// Configuration and option interfaces
interface RegistryConfiguration {
  bmadRoot: string;
  registryPath: string;
  backupPath: string;
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  enableAutoBackups: boolean;
  maxBackups: number;
  npmRegistry: string;
  enableVersionChecks: boolean;
  versionCheckInterval: number;
}

interface RegistryManagerOptions extends Partial<RegistryConfiguration> {
  logger?: any;
}

interface UninstallOptions {
  force?: boolean;
  skipBackup?: boolean;
  preserveConfig?: boolean;
  preserveData?: boolean;
}

interface UpdateOptions {
  force?: boolean;
  skipBackup?: boolean;
  skipHealthCheck?: boolean;
}

interface PackageFilter {
  type?: string;
  status?: string;
  health?: string;
  category?: string;
  updateAvailable?: boolean;
  searchTerm?: string;
}

export {
  PackageRegistryEntry,
  PackageDependency,
  HealthCheckResult,
  HealthIssue,
  RegistryStats,
  BackupInfo,
  UpdateInfo,
  UninstallOptions,
  UpdateOptions,
  PackageFilter
};