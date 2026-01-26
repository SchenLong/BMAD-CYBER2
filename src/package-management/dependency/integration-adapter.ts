/**
 * EPIC 2 PACKAGE MANAGEMENT - DEPENDENCY SYSTEM INTEGRATION ADAPTER
 * Ensures seamless integration between dependency resolution engine and existing systems
 * Bridges Epic 1 security infrastructure with Epic 2 package management
 *
 * @author Integration Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Epic 1 Security Infrastructure imports
import {
  epic1Security,
  Epic1SecurityInfrastructure,
  SecurityStatus,
  ComponentStatus
} from '../security/epic1-integration';
import { AuditLogger } from '../security/audit/audit-logger';
import { SecurityMonitor } from '../security/monitoring/security-monitor';
import { AESEncryption } from '../security/encryption/aes-encryption';
import { PermissionService } from '../security/rbac/permissions/permission-service';

// Package Management imports
import { PackageRegistry } from '../registry/interfaces/registry-interfaces';
import { PackageRegistryManager } from '../registry/manager/package-registry-manager';
import { PackageDiscoveryEngine } from '../registry/discovery/package-discovery-engine';

// Dependency Engine imports
import { DependencyEngine } from './index';
import { DependencyResolver } from './resolver/dependency-resolver';
const { BMADDependencyManager } = require('./manager/bmad-dependency-manager');
const { BMADDependencyValidator } = require('./validator/dependency-validator');

/**
 * Integration Configuration
 */
export interface IntegrationConfig {
  readonly enableSecurity: boolean;
  readonly enableRegistry: boolean;
  readonly enableMonitoring: boolean;
  readonly enableEncryption: boolean;
  readonly enableAuditLogging: boolean;
  readonly enablePermissions: boolean;
  readonly autoInitialize: boolean;
  readonly validationLevel: 'basic' | 'enhanced' | 'strict';
  readonly securityThreshold: number;
  readonly integrationTimeout: number;
}

export const DefaultIntegrationConfig: IntegrationConfig = {
  enableSecurity: true,
  enableRegistry: true,
  enableMonitoring: true,
  enableEncryption: true,
  enableAuditLogging: true,
  enablePermissions: true,
  autoInitialize: true,
  validationLevel: 'enhanced',
  securityThreshold: 8.0,
  integrationTimeout: 30000
};

/**
 * Integration Status
 */
export interface IntegrationStatus {
  readonly overall: 'operational' | 'degraded' | 'failed';
  readonly components: {
    security: ComponentStatus;
    registry: ComponentStatus;
    dependency: ComponentStatus;
    monitoring: ComponentStatus;
  };
  readonly lastHealthCheck: Date;
  readonly metrics: IntegrationMetrics;
}

export interface IntegrationMetrics {
  readonly operationsCompleted: number;
  readonly operationsFailed: number;
  readonly averageResponseTime: number;
  readonly securityViolations: number;
  readonly cacheHitRate: number;
  readonly systemLoad: number;
}

/**
 * BMAD Dependency Integration Adapter
 */
export class DependencyIntegrationAdapter extends EventEmitter {
  private static instance: DependencyIntegrationAdapter;

  private readonly config: IntegrationConfig;
  private readonly auditLogger: AuditLogger;
  private readonly securityMonitor: SecurityMonitor;
  private readonly encryption: AESEncryption;
  private readonly permissionService: PermissionService;

  private dependencyEngine: DependencyEngine | null = null;
  private registryManager: PackageRegistryManager | null = null;
  private discoveryEngine: PackageDiscoveryEngine | null = null;

  private integrationStatus: IntegrationStatus;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsCollectionInterval: NodeJS.Timeout | null = null;

  private operationMetrics = {
    completed: 0,
    failed: 0,
    totalResponseTime: 0,
    securityViolations: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  constructor(config: Partial<IntegrationConfig> = {}) {
    super();

    this.config = { ...DefaultIntegrationConfig, ...config };

    // Initialize Epic 1 security components
    this.auditLogger = new AuditLogger('dependency-integration-adapter');
    this.securityMonitor = new SecurityMonitor();
    this.encryption = new AESEncryption();
    this.permissionService = new PermissionService();

    this.integrationStatus = {
      overall: 'failed',
      components: {
        security: { status: 'unknown', lastCheck: new Date() },
        registry: { status: 'unknown', lastCheck: new Date() },
        dependency: { status: 'unknown', lastCheck: new Date() },
        monitoring: { status: 'unknown', lastCheck: new Date() }
      },
      lastHealthCheck: new Date(),
      metrics: {
        operationsCompleted: 0,
        operationsFailed: 0,
        averageResponseTime: 0,
        securityViolations: 0,
        cacheHitRate: 0,
        systemLoad: 0
      }
    };

    this.setupEventHandlers();
  }

  /**
   * Singleton access
   */
  public static getInstance(config?: Partial<IntegrationConfig>): DependencyIntegrationAdapter {
    if (!DependencyIntegrationAdapter.instance) {
      DependencyIntegrationAdapter.instance = new DependencyIntegrationAdapter(config);
    }
    return DependencyIntegrationAdapter.instance;
  }

  /**
   * Initialize the integration adapter
   */
  async initialize(projectRoot: string = process.cwd()): Promise<IntegrationStatus> {
    const startTime = performance.now();

    try {
      await this.auditLogger.logSecurityEvent(
        'dependency-integration-initializing',
        {
          projectRoot,
          config: this.config,
          timestamp: new Date().toISOString()
        }
      );

      // Step 1: Initialize Epic 1 security infrastructure
      if (this.config.enableSecurity) {
        await this.initializeSecurityInfrastructure();
      }

      // Step 2: Initialize package registry system
      if (this.config.enableRegistry) {
        await this.initializeRegistrySystem(projectRoot);
      }

      // Step 3: Initialize dependency engine
      await this.initializeDependencyEngine(projectRoot);

      // Step 4: Setup monitoring and health checks
      if (this.config.enableMonitoring) {
        await this.initializeMonitoring();
      }

      // Step 5: Validate integration
      await this.validateIntegration();

      // Step 6: Start health monitoring
      this.startHealthMonitoring();

      const duration = performance.now() - startTime;

      await this.auditLogger.logSecurityEvent(
        'dependency-integration-initialized',
        {
          duration,
          status: this.integrationStatus.overall,
          components: this.integrationStatus.components
        }
      );

      this.emit('integration-ready', this.integrationStatus);

      return this.integrationStatus;

    } catch (error) {
      const duration = performance.now() - startTime;

      await this.auditLogger.logSecurityEvent(
        'dependency-integration-failed',
        {
          duration,
          error: error.message,
          stack: error.stack
        }
      );

      this.integrationStatus.overall = 'failed';
      this.emit('integration-failed', { error: error.message });

      throw new Error(`Dependency integration initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize Epic 1 security infrastructure
   */
  private async initializeSecurityInfrastructure(): Promise<void> {
    try {
      // Check Epic 1 security status
      const securityStatus = await epic1Security.getStatus();

      if (securityStatus.overallStatus !== 'operational') {
        throw new Error('Epic 1 security infrastructure not operational');
      }

      // Initialize encryption if enabled
      if (this.config.enableEncryption) {
        await this.encryption.initialize({
          algorithm: 'aes-256-gcm',
          keyRotationInterval: 86400000, // 24 hours
          validateKeys: true
        });
      }

      // Initialize permission service if enabled
      if (this.config.enablePermissions) {
        await this.permissionService.initialize();
      }

      // Start security monitoring if enabled
      if (this.config.enableMonitoring) {
        this.securityMonitor.startMonitoring({
          component: 'dependency-integration',
          metricsInterval: 60000, // 1 minute
          alertThresholds: {
            errorRate: 0.05,
            responseTime: this.config.integrationTimeout,
            memoryUsage: 0.8
          }
        });
      }

      this.integrationStatus.components.security = {
        status: 'operational',
        lastCheck: new Date()
      };

    } catch (error) {
      this.integrationStatus.components.security = {
        status: 'failed',
        lastCheck: new Date(),
        error: error.message
      };
      throw new Error(`Security infrastructure initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize package registry system
   */
  private async initializeRegistrySystem(projectRoot: string): Promise<void> {
    try {
      // Initialize registry manager
      this.registryManager = new PackageRegistryManager({
        enableCaching: true,
        cacheTTL: 3600000, // 1 hour
        enableSecurity: this.config.enableSecurity,
        securityThreshold: this.config.securityThreshold
      });

      await this.registryManager.initialize();

      // Initialize discovery engine
      this.discoveryEngine = new PackageDiscoveryEngine({
        enableIntelligentRecommendations: true,
        enableSecurityScanning: this.config.enableSecurity,
        maxRecommendations: 10
      });

      await this.discoveryEngine.initialize();

      this.integrationStatus.components.registry = {
        status: 'operational',
        lastCheck: new Date()
      };

    } catch (error) {
      this.integrationStatus.components.registry = {
        status: 'failed',
        lastCheck: new Date(),
        error: error.message
      };
      throw new Error(`Registry system initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize dependency engine
   */
  private async initializeDependencyEngine(projectRoot: string): Promise<void> {
    try {
      // Create dependency engine with integration-specific configuration
      const dependencyConfig = {
        manager: {
          security: {
            enableEncryption: this.config.enableEncryption,
            vulnerabilityScanning: this.config.enableSecurity,
            securityThreshold: this.config.securityThreshold
          },
          performance: {
            parallelResolution: true,
            optimizeForSpeed: false,
            memoryLimit: 512 * 1024 * 1024 // 512MB
          }
        },
        validator: {
          validationLevel: this.config.validationLevel,
          timeout: this.config.integrationTimeout
        }
      };

      this.dependencyEngine = new DependencyEngine(projectRoot, dependencyConfig);

      // Initialize the dependency engine
      const initResult = await this.dependencyEngine.initialize();

      if (initResult.status !== 'ready') {
        throw new Error('Dependency engine initialization failed');
      }

      this.integrationStatus.components.dependency = {
        status: 'operational',
        lastCheck: new Date()
      };

    } catch (error) {
      this.integrationStatus.components.dependency = {
        status: 'failed',
        lastCheck: new Date(),
        error: error.message
      };
      throw new Error(`Dependency engine initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize monitoring systems
   */
  private async initializeMonitoring(): Promise<void> {
    try {
      // Setup metrics collection
      this.metricsCollectionInterval = setInterval(() => {
        this.collectMetrics();
      }, 60000); // Collect metrics every minute

      this.integrationStatus.components.monitoring = {
        status: 'operational',
        lastCheck: new Date()
      };

    } catch (error) {
      this.integrationStatus.components.monitoring = {
        status: 'failed',
        lastCheck: new Date(),
        error: error.message
      };
      throw new Error(`Monitoring initialization failed: ${error.message}`);
    }
  }

  /**
   * Validate the complete integration
   */
  private async validateIntegration(): Promise<void> {
    try {
      // Validate security integration
      if (this.config.enableSecurity) {
        const securityStatus = await epic1Security.getStatus();
        if (securityStatus.overallStatus !== 'operational') {
          throw new Error('Security integration validation failed');
        }
      }

      // Validate dependency engine
      if (!this.dependencyEngine) {
        throw new Error('Dependency engine not initialized');
      }

      const systemStatus = await this.dependencyEngine.getSystemStatus();
      if (systemStatus.overall !== 'operational') {
        throw new Error('Dependency engine validation failed');
      }

      // Validate registry system
      if (this.config.enableRegistry) {
        if (!this.registryManager || !this.discoveryEngine) {
          throw new Error('Registry system not initialized');
        }

        const registryStatus = await this.registryManager.getStatus();
        if (registryStatus.status !== 'operational') {
          throw new Error('Registry system validation failed');
        }
      }

      // All validations passed
      this.integrationStatus.overall = 'operational';

    } catch (error) {
      this.integrationStatus.overall = 'degraded';
      throw error;
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 300000); // Health check every 5 minutes
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const healthCheckResults = {
        security: 'unknown' as 'operational' | 'degraded' | 'failed' | 'unknown',
        registry: 'unknown' as 'operational' | 'degraded' | 'failed' | 'unknown',
        dependency: 'unknown' as 'operational' | 'degraded' | 'failed' | 'unknown',
        monitoring: 'unknown' as 'operational' | 'degraded' | 'failed' | 'unknown'
      };

      // Check security infrastructure
      if (this.config.enableSecurity) {
        try {
          const securityStatus = await epic1Security.getStatus();
          healthCheckResults.security = securityStatus.overallStatus === 'operational'
            ? 'operational' : 'degraded';
        } catch (error) {
          healthCheckResults.security = 'failed';
        }
      } else {
        healthCheckResults.security = 'operational';
      }

      // Check registry system
      if (this.config.enableRegistry && this.registryManager) {
        try {
          const registryStatus = await this.registryManager.getStatus();
          healthCheckResults.registry = registryStatus.status === 'operational'
            ? 'operational' : 'degraded';
        } catch (error) {
          healthCheckResults.registry = 'failed';
        }
      } else {
        healthCheckResults.registry = 'operational';
      }

      // Check dependency engine
      if (this.dependencyEngine) {
        try {
          const systemStatus = await this.dependencyEngine.getSystemStatus();
          healthCheckResults.dependency = systemStatus.overall === 'operational'
            ? 'operational' : 'degraded';
        } catch (error) {
          healthCheckResults.dependency = 'failed';
        }
      } else {
        healthCheckResults.dependency = 'failed';
      }

      // Check monitoring
      healthCheckResults.monitoring = this.config.enableMonitoring ? 'operational' : 'operational';

      // Update integration status
      this.integrationStatus.components = {
        security: { status: healthCheckResults.security, lastCheck: new Date() },
        registry: { status: healthCheckResults.registry, lastCheck: new Date() },
        dependency: { status: healthCheckResults.dependency, lastCheck: new Date() },
        monitoring: { status: healthCheckResults.monitoring, lastCheck: new Date() }
      };

      // Determine overall status
      const componentStatuses = Object.values(healthCheckResults);
      if (componentStatuses.every(s => s === 'operational')) {
        this.integrationStatus.overall = 'operational';
      } else if (componentStatuses.some(s => s === 'failed')) {
        this.integrationStatus.overall = 'failed';
      } else {
        this.integrationStatus.overall = 'degraded';
      }

      this.integrationStatus.lastHealthCheck = new Date();

      this.emit('health-check-completed', this.integrationStatus);

    } catch (error) {
      this.integrationStatus.overall = 'failed';
      await this.auditLogger.logSecurityEvent(
        'health-check-failed',
        { error: error.message }
      );

      this.emit('health-check-failed', { error: error.message });
    }
  }

  /**
   * Collect integration metrics
   */
  private collectMetrics(): void {
    try {
      const metrics: IntegrationMetrics = {
        operationsCompleted: this.operationMetrics.completed,
        operationsFailed: this.operationMetrics.failed,
        averageResponseTime: this.operationMetrics.completed > 0
          ? this.operationMetrics.totalResponseTime / this.operationMetrics.completed
          : 0,
        securityViolations: this.operationMetrics.securityViolations,
        cacheHitRate: (this.operationMetrics.cacheHits + this.operationMetrics.cacheMisses) > 0
          ? this.operationMetrics.cacheHits / (this.operationMetrics.cacheHits + this.operationMetrics.cacheMisses)
          : 0,
        systemLoad: process.memoryUsage().heapUsed / (1024 * 1024 * 1024) // GB
      };

      this.integrationStatus.metrics = metrics;

      this.emit('metrics-collected', metrics);

    } catch (error) {
      this.auditLogger.warn('Metrics collection failed', { error: error.message });
    }
  }

  /**
   * Setup event handlers for monitoring and logging
   */
  private setupEventHandlers(): void {
    this.on('operation-started', async (operationId: string, type: string) => {
      await this.auditLogger.logSecurityEvent(
        'integrated-operation-started',
        { operationId, type, timestamp: new Date().toISOString() }
      );
    });

    this.on('operation-completed', async (operationId: string, type: string, duration: number) => {
      this.operationMetrics.completed++;
      this.operationMetrics.totalResponseTime += duration;

      await this.auditLogger.logSecurityEvent(
        'integrated-operation-completed',
        { operationId, type, duration, timestamp: new Date().toISOString() }
      );

      await this.securityMonitor.recordMetric('integrated_operations_completed', 1);
    });

    this.on('operation-failed', async (operationId: string, type: string, error: string) => {
      this.operationMetrics.failed++;

      await this.auditLogger.logSecurityEvent(
        'integrated-operation-failed',
        { operationId, type, error, timestamp: new Date().toISOString() }
      );

      await this.securityMonitor.recordMetric('integrated_operations_failed', 1);
    });

    this.on('security-violation', async (details: any) => {
      this.operationMetrics.securityViolations++;

      await this.auditLogger.logSecurityEvent(
        'integrated-security-violation',
        { ...details, timestamp: new Date().toISOString() }
      );

      await this.securityMonitor.triggerAlert('integrated_security_violation', details);
    });
  }

  /**
   * Public API - Get dependency engine
   */
  getDependencyEngine(): DependencyEngine {
    if (!this.dependencyEngine) {
      throw new Error('Dependency engine not initialized. Call initialize() first.');
    }
    return this.dependencyEngine;
  }

  /**
   * Public API - Get registry manager
   */
  getRegistryManager(): PackageRegistryManager {
    if (!this.registryManager) {
      throw new Error('Registry manager not initialized. Call initialize() first.');
    }
    return this.registryManager;
  }

  /**
   * Public API - Get discovery engine
   */
  getDiscoveryEngine(): PackageDiscoveryEngine {
    if (!this.discoveryEngine) {
      throw new Error('Discovery engine not initialized. Call initialize() first.');
    }
    return this.discoveryEngine;
  }

  /**
   * Public API - Get integration status
   */
  getIntegrationStatus(): IntegrationStatus {
    return { ...this.integrationStatus };
  }

  /**
   * Public API - Perform integrated dependency operation
   */
  async performIntegratedOperation<T>(
    operationType: string,
    operationData: any,
    options: any = {}
  ): Promise<T> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();

    try {
      this.emit('operation-started', operationId, operationType);

      // Validate security permissions if enabled
      if (this.config.enablePermissions) {
        const hasPermission = await this.permissionService.checkPermission(
          options.userId || 'system',
          `dependency:${operationType}`,
          operationData
        );

        if (!hasPermission) {
          this.emit('security-violation', {
            operationId,
            type: 'permission-denied',
            operation: operationType,
            userId: options.userId || 'system'
          });
          throw new Error('Insufficient permissions for operation');
        }
      }

      // Execute operation through dependency engine
      let result: T;

      switch (operationType) {
        case 'resolve':
          result = await this.dependencyEngine!.resolveWithValidation(
            operationData.rootPackage,
            this.registryManager!,
            operationData.options
          ) as T;
          break;

        case 'install':
          result = await this.dependencyEngine!.installDependencies(
            operationData.dependencies,
            operationData.options
          ) as T;
          break;

        case 'update':
          result = await this.dependencyEngine!.updateDependencies(
            operationData.target,
            operationData.options
          ) as T;
          break;

        case 'security-scan':
          result = await this.dependencyEngine!.performSecurityScan(
            operationData.target,
            operationData.options
          ) as T;
          break;

        default:
          throw new Error(`Unsupported operation type: ${operationType}`);
      }

      const duration = performance.now() - startTime;
      this.emit('operation-completed', operationId, operationType, duration);

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      this.emit('operation-failed', operationId, operationType, error.message);
      throw error;
    }
  }

  /**
   * Shutdown the integration adapter
   */
  async shutdown(): Promise<void> {
    try {
      // Clear intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.metricsCollectionInterval) {
        clearInterval(this.metricsCollectionInterval);
      }

      // Stop monitoring
      if (this.config.enableMonitoring) {
        this.securityMonitor.stopMonitoring();
      }

      // Log shutdown
      await this.auditLogger.logSecurityEvent(
        'dependency-integration-shutdown',
        { timestamp: new Date().toISOString() }
      );

      this.emit('integration-shutdown');

    } catch (error) {
      await this.auditLogger.logSecurityEvent(
        'dependency-integration-shutdown-failed',
        { error: error.message }
      );
      throw error;
    }
  }
}

/**
 * Factory function for creating integration adapter
 */
export function createIntegrationAdapter(config?: Partial<IntegrationConfig>): DependencyIntegrationAdapter {
  return DependencyIntegrationAdapter.getInstance(config);
}

/**
 * Quick initialization function
 */
export async function initializeIntegration(
  projectRoot?: string,
  config?: Partial<IntegrationConfig>
): Promise<DependencyIntegrationAdapter> {
  const adapter = createIntegrationAdapter(config);
  await adapter.initialize(projectRoot);
  return adapter;
}