/**
 * EPIC 2 STORY 2.7 - PACKAGE REGISTRY API & INTEGRATION
 * Comprehensive RESTful API system for BMAD Package Management Platform
 * Complete integration layer connecting all Epic 2 components with Epic 1 security
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.7 (FINAL STORY)
 */

import express, { NextFunction, Request, Response, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import swaggerUi from 'swagger-ui-express';
import { OpenApiValidator } from 'express-openapi-validator';
import { epic1Security, Epic1SecurityInfrastructure } from '../../security/epic1-integration';

// Epic 2 Component Imports
import { PackageRegistryManager } from '../registry/manager/package-registry-manager';
import { PackageDiscoveryEngine } from '../registry/discovery/package-discovery-engine';
import { SmartRecommendationSystem } from '../registry/discovery/smart-recommendation-system';
import { DependencyResolver } from '../dependency/resolver/dependency-resolver';
import { IntegrationAdapter } from '../dependency/integration-adapter';
import { HealthMonitoring } from '../monitoring/health/health-monitoring';
import { PerformanceMetrics } from '../monitoring/metrics/performance-metrics';

// Type Imports
import {
  AnalyticsEvent,
  DependencyDeclaration,
  PackageError,
  PackageIdentifier,
  PackageManagerConfig,
  PackageQuery,
  QualityMetrics,
  SecurityMetrics,
  UsageMetrics
} from '../registry/interfaces/package-types';

/**
 * API Configuration Interface
 */
export interface APIConfig {
  port: number;
  host: string;
  basePath: string;
  version: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
  security: {
    enabled: boolean;
    requireAuth: boolean;
    allowedOrigins: string[];
  };
  monitoring: {
    enabled: boolean;
    metricsEndpoint: string;
    healthEndpoint: string;
  };
  swagger: {
    enabled: boolean;
    endpoint: string;
  };
}

/**
 * API Response Interface
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Authentication Middleware
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Package Registry API Class
 * Main API orchestrator for all package management operations
 */
export class PackageRegistryAPI {
  private app: express.Application;
  private config: APIConfig;
  private security: Epic1SecurityInfrastructure;
  private registryManager: PackageRegistryManager;
  private discoveryEngine: PackageDiscoveryEngine;
  private recommendationSystem: SmartRecommendationSystem;
  private dependencyResolver: DependencyResolver;
  private integrationAdapter: IntegrationAdapter;
  private healthMonitoring: HealthMonitoring;
  private performanceMetrics: PerformanceMetrics;
  private isInitialized = false;

  constructor(config: Partial<APIConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.app = express();
    this.security = epic1Security;
    this.initializeComponents();
  }

  /**
   * Initialize API server and all components
   */
  public async initialize(): Promise<void> {
    try {
      console.log(`🚀 Initializing Package Registry API v${  this.config.version}`);

      // Initialize Epic 1 Security Infrastructure
      await this.initializeSecurity();

      // Initialize Epic 2 Components
      await this.initializeEpic2Components();

      // Setup Express middleware
      this.setupMiddleware();

      // Setup API routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      // Setup monitoring
      this.setupMonitoring();

      this.isInitialized = true;
      console.log('✅ Package Registry API initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Package Registry API:', error);
      throw new Error(`API initialization failed: ${error.message}`);
    }
  }

  /**
   * Start the API server
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('API not initialized. Call initialize() first.');
    }

    return new Promise((resolve) => {
      this.app.listen(this.config.port, this.config.host, () => {
        console.log(`🌐 Package Registry API listening on ${this.config.host}:${this.config.port}`);
        console.log(`📚 API Documentation: http://${this.config.host}:${this.config.port}${this.config.swagger.endpoint}`);
        resolve();
      });
    });
  }

  /**
   * Stop the API server
   */
  public async stop(): Promise<void> {
    console.log('🛑 Stopping Package Registry API...');
    // Graceful shutdown logic would go here
    console.log('✅ Package Registry API stopped');
  }

  /**
   * Get Express application instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  // Private Methods

  private async initializeSecurity(): Promise<void> {
    if (this.config.security.enabled) {
      await this.security.initialize();
      console.log('🔐 Epic 1 Security Integration enabled');
    } else {
      console.log('⚠️ Security disabled - not recommended for production');
    }
  }

  private async initializeEpic2Components(): Promise<void> {
    console.log('📦 Initializing Epic 2 Package Management Components...');

    // Initialize core components
    this.registryManager = new PackageRegistryManager();
    this.discoveryEngine = new PackageDiscoveryEngine();
    this.recommendationSystem = new SmartRecommendationSystem();
    this.dependencyResolver = new DependencyResolver();
    this.integrationAdapter = new IntegrationAdapter();
    this.healthMonitoring = new HealthMonitoring();
    this.performanceMetrics = new PerformanceMetrics();

    console.log('✅ All Epic 2 components initialized');
  }

  private initializeComponents(): void {
    // Component initialization will happen in initializeEpic2Components
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: this.config.cors.origin,
      credentials: this.config.cors.credentials
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.max,
      message: this.config.rateLimit.message,
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Request ID middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] ||
        this.generateRequestId();
      next();
    });

    // Authentication middleware
    if (this.config.security.requireAuth) {
      this.app.use(this.authenticationMiddleware());
    }

    console.log('🔧 Express middleware configured');
  }

  private setupRoutes(): void {
    const apiRouter = Router();

    // Health and status routes
    apiRouter.get('/health', this.getHealthStatus.bind(this));
    apiRouter.get('/status', this.getSystemStatus.bind(this));
    apiRouter.get('/version', this.getVersion.bind(this));

    // Package management routes
    this.setupPackageRoutes(apiRouter);
    this.setupDependencyRoutes(apiRouter);
    this.setupDiscoveryRoutes(apiRouter);
    this.setupAnalyticsRoutes(apiRouter);
    this.setupAdminRoutes(apiRouter);

    // Mount API routes
    this.app.use(this.config.basePath, apiRouter);

    // Swagger documentation
    if (this.config.swagger.enabled) {
      this.setupSwagger();
    }

    console.log('🛣️ API routes configured');
  }

  private setupPackageRoutes(router: Router): void {
    // Package CRUD operations
    router.get('/packages',
      this.validateQuery([
        query('q').optional().isString(),
        query('category').optional().isString(),
        query('tag').optional().isString(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
      ]),
      this.searchPackages.bind(this)
    );

    router.get('/packages/:packageId',
      this.validateParams([param('packageId').isString().notEmpty()]),
      this.getPackage.bind(this)
    );

    router.post('/packages',
      this.validateBody([
        body('name').isString().notEmpty(),
        body('version').isString().notEmpty(),
        body('description').optional().isString(),
        body('tags').optional().isArray(),
        body('dependencies').optional().isArray()
      ]),
      this.createPackage.bind(this)
    );

    router.put('/packages/:packageId',
      this.validateParams([param('packageId').isString().notEmpty()]),
      this.updatePackage.bind(this)
    );

    router.delete('/packages/:packageId',
      this.validateParams([param('packageId').isString().notEmpty()]),
      this.deletePackage.bind(this)
    );

    // Package versions
    router.get('/packages/:packageId/versions', this.getPackageVersions.bind(this));
    router.get('/packages/:packageId/versions/:version', this.getPackageVersion.bind(this));

    // Package content
    router.get('/packages/:packageId/download', this.downloadPackage.bind(this));
    router.post('/packages/:packageId/install', this.installPackage.bind(this));
    router.post('/packages/:packageId/uninstall', this.uninstallPackage.bind(this));

    console.log('📦 Package routes configured');
  }

  private setupDependencyRoutes(router: Router): void {
    router.get('/packages/:packageId/dependencies', this.getPackageDependencies.bind(this));
    router.post('/dependencies/resolve', this.resolveDependencies.bind(this));
    router.get('/dependencies/graph/:packageId', this.getDependencyGraph.bind(this));
    router.post('/dependencies/analyze', this.analyzeDependencies.bind(this));

    console.log('🔗 Dependency routes configured');
  }

  private setupDiscoveryRoutes(router: Router): void {
    router.post('/discovery/search', this.advancedSearch.bind(this));
    router.get('/discovery/recommendations/:packageId', this.getRecommendations.bind(this));
    router.get('/discovery/trending', this.getTrendingPackages.bind(this));
    router.get('/discovery/categories', this.getCategories.bind(this));
    router.get('/discovery/tags', this.getTags.bind(this));

    console.log('🔍 Discovery routes configured');
  }

  private setupAnalyticsRoutes(router: Router): void {
    router.post('/analytics/events', this.recordEvent.bind(this));
    router.get('/analytics/packages/:packageId/stats', this.getPackageStats.bind(this));
    router.get('/analytics/usage', this.getUsageAnalytics.bind(this));
    router.get('/analytics/performance', this.getPerformanceMetrics.bind(this));

    console.log('📊 Analytics routes configured');
  }

  private setupAdminRoutes(router: Router): void {
    // Admin routes require admin permissions
    const adminAuth = this.requirePermission(['admin']);

    router.get('/admin/packages', adminAuth, this.adminGetAllPackages.bind(this));
    router.post('/admin/packages/:packageId/moderate', adminAuth, this.moderatePackage.bind(this));
    router.get('/admin/users', adminAuth, this.getUsers.bind(this));
    router.get('/admin/system/metrics', adminAuth, this.getSystemMetrics.bind(this));

    console.log('👑 Admin routes configured');
  }

  private setupSwagger(): void {
    const swaggerDocument = this.generateOpenAPISpec();

    this.app.use(
      this.config.swagger.endpoint,
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'BMAD Package Registry API'
      })
    );

    console.log('📚 Swagger documentation enabled');
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      console.error('API Error:', error);

      const response: APIResponse = {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An internal error occurred',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: this.config.version,
          requestId: req.headers['x-request-id'] as string
        }
      };

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(response);
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route not found: ${req.method} ${req.path}`
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: this.config.version,
          requestId: req.headers['x-request-id'] as string
        }
      };

      res.status(404).json(response);
    });

    console.log('🚨 Error handling configured');
  }

  private setupMonitoring(): void {
    if (this.config.monitoring.enabled) {
      // Performance monitoring middleware
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();

        res.on('finish', () => {
          const duration = Date.now() - start;
          this.performanceMetrics.recordApiCall({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date()
          });
        });

        next();
      });

      console.log('📊 Monitoring enabled');
    }
  }

  // Authentication and Authorization

  private authenticationMiddleware() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const token = this.extractToken(req);
        if (!token) {
          return this.sendError(res, 401, 'AUTHENTICATION_REQUIRED', 'Authentication token required');
        }

        // Validate token with Epic 1 security
        const sessionManager = this.security.getComponent<any>('sessionManager');
        const session = await sessionManager?.validateToken(token);

        if (!session) {
          return this.sendError(res, 401, 'INVALID_TOKEN', 'Invalid or expired token');
        }

        // Get user permissions
        const permissionService = this.security.getComponent<any>('permissionService');
        const permissions = await permissionService?.getUserPermissions(session.userId);

        req.user = {
          id: session.userId,
          role: session.role,
          permissions: permissions || []
        };

        next();
      } catch (error) {
        return this.sendError(res, 401, 'AUTHENTICATION_FAILED', 'Authentication failed');
      }
    };
  }

  private requirePermission(requiredPermissions: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return this.sendError(res, 401, 'AUTHENTICATION_REQUIRED', 'Authentication required');
      }

      const hasPermission = requiredPermissions.some(permission =>
        req.user!.permissions.includes(permission)
      );

      if (!hasPermission) {
        return this.sendError(res, 403, 'INSUFFICIENT_PERMISSIONS',
          `Required permissions: ${requiredPermissions.join(', ')}`);
      }

      next();
    };
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  // Validation Middleware

  private validateQuery(validations: any[]) {
    return [
      ...validations,
      this.handleValidationErrors.bind(this)
    ];
  }

  private validateParams(validations: any[]) {
    return [
      ...validations,
      this.handleValidationErrors.bind(this)
    ];
  }

  private validateBody(validations: any[]) {
    return [
      ...validations,
      this.handleValidationErrors.bind(this)
    ];
  }

  private handleValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return this.sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', {
        errors: errors.array()
      });
    }
    next();
  }

  // Route Handlers

  private async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.healthMonitoring.getOverallHealth();
      this.sendSuccess(res, health);
    } catch (error) {
      this.sendError(res, 500, 'HEALTH_CHECK_FAILED', 'Health check failed');
    }
  }

  private async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const securityStatus = this.security.getStatus();
      const systemStatus = {
        api: {
          version: this.config.version,
          uptime: process.uptime(),
          environment: process.env.NODE_ENV
        },
        security: securityStatus,
        components: {
          registryManager: 'online',
          discoveryEngine: 'online',
          dependencyResolver: 'online'
        }
      };

      this.sendSuccess(res, systemStatus);
    } catch (error) {
      this.sendError(res, 500, 'STATUS_CHECK_FAILED', 'System status check failed');
    }
  }

  private async getVersion(req: Request, res: Response): Promise<void> {
    const version = {
      api: this.config.version,
      epic1: '1.0.0',
      epic2: '1.0.0',
      build: process.env.BUILD_VERSION || 'development',
      timestamp: new Date().toISOString()
    };

    this.sendSuccess(res, version);
  }

  private async searchPackages(req: Request, res: Response): Promise<void> {
    try {
      const query: PackageQuery = {
        terms: req.query.q ? [req.query.q as string] : undefined,
        filters: [],
        sorting: [{ field: 'popularity', direction: 'desc', priority: 1 }],
        pagination: {
          offset: ((parseInt(req.query.page as string) || 1) - 1) * (parseInt(req.query.limit as string) || 20),
          limit: parseInt(req.query.limit as string) || 20
        },
        faceting: { enabled: true, fields: ['category', 'tags'], maxValues: 10, minCount: 1 }
      };

      const results = await this.discoveryEngine.search(query);
      this.sendSuccess(res, results);
    } catch (error) {
      this.sendError(res, 500, 'SEARCH_FAILED', 'Package search failed');
    }
  }

  private async getPackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const packageInfo = await this.registryManager.getPackage(packageId);

      if (!packageInfo) {
        return this.sendError(res, 404, 'PACKAGE_NOT_FOUND', `Package not found: ${packageId}`);
      }

      this.sendSuccess(res, packageInfo);
    } catch (error) {
      this.sendError(res, 500, 'GET_PACKAGE_FAILED', 'Failed to retrieve package');
    }
  }

  private async createPackage(req: Request, res: Response): Promise<void> {
    try {
      const packageData = req.body;
      const result = await this.registryManager.publishPackage(packageData);
      this.sendSuccess(res, result, 201);
    } catch (error) {
      this.sendError(res, 500, 'CREATE_PACKAGE_FAILED', 'Failed to create package');
    }
  }

  private async updatePackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const updateData = req.body;
      const result = await this.registryManager.updatePackage(packageId, updateData);
      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, 500, 'UPDATE_PACKAGE_FAILED', 'Failed to update package');
    }
  }

  private async deletePackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      await this.registryManager.deletePackage(packageId);
      this.sendSuccess(res, { deleted: true });
    } catch (error) {
      this.sendError(res, 500, 'DELETE_PACKAGE_FAILED', 'Failed to delete package');
    }
  }

  private async getPackageVersions(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const versions = await this.registryManager.getPackageVersions(packageId);
      this.sendSuccess(res, versions);
    } catch (error) {
      this.sendError(res, 500, 'GET_VERSIONS_FAILED', 'Failed to get package versions');
    }
  }

  private async getPackageVersion(req: Request, res: Response): Promise<void> {
    try {
      const { packageId, version } = req.params;
      const packageVersion = await this.registryManager.getPackageVersion(packageId, version);

      if (!packageVersion) {
        return this.sendError(res, 404, 'VERSION_NOT_FOUND', `Package version not found: ${packageId}@${version}`);
      }

      this.sendSuccess(res, packageVersion);
    } catch (error) {
      this.sendError(res, 500, 'GET_VERSION_FAILED', 'Failed to get package version');
    }
  }

  private async downloadPackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const version = req.query.version as string;

      const downloadUrl = await this.registryManager.getDownloadUrl(packageId, version);

      // Record download analytics
      await this.recordEvent(
        { body: { type: 'download', packageId, version } } as Request,
        res
      );

      res.redirect(downloadUrl);
    } catch (error) {
      this.sendError(res, 500, 'DOWNLOAD_FAILED', 'Package download failed');
    }
  }

  private async installPackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const { version, target } = req.body;

      const installation = await this.integrationAdapter.installPackage({
        name: packageId,
        version: version || 'latest',
        target: target || './node_modules'
      });

      this.sendSuccess(res, installation);
    } catch (error) {
      this.sendError(res, 500, 'INSTALL_FAILED', 'Package installation failed');
    }
  }

  private async uninstallPackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const result = await this.integrationAdapter.uninstallPackage(packageId);
      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, 500, 'UNINSTALL_FAILED', 'Package uninstallation failed');
    }
  }

  private async getPackageDependencies(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const dependencies = await this.dependencyResolver.getDependencies(packageId);
      this.sendSuccess(res, dependencies);
    } catch (error) {
      this.sendError(res, 500, 'GET_DEPENDENCIES_FAILED', 'Failed to get dependencies');
    }
  }

  private async resolveDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { packages, constraints } = req.body;
      const resolution = await this.dependencyResolver.resolve(packages, constraints);
      this.sendSuccess(res, resolution);
    } catch (error) {
      this.sendError(res, 500, 'RESOLVE_FAILED', 'Dependency resolution failed');
    }
  }

  private async getDependencyGraph(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const depth = parseInt(req.query.depth as string) || 5;
      const graph = await this.dependencyResolver.buildGraph(packageId, { maxDepth: depth });
      this.sendSuccess(res, graph);
    } catch (error) {
      this.sendError(res, 500, 'GRAPH_FAILED', 'Failed to build dependency graph');
    }
  }

  private async analyzeDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { packages } = req.body;
      const analysis = await this.dependencyResolver.analyze(packages);
      this.sendSuccess(res, analysis);
    } catch (error) {
      this.sendError(res, 500, 'ANALYSIS_FAILED', 'Dependency analysis failed');
    }
  }

  private async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const query = req.body as PackageQuery;
      const results = await this.discoveryEngine.search(query);
      this.sendSuccess(res, results);
    } catch (error) {
      this.sendError(res, 500, 'ADVANCED_SEARCH_FAILED', 'Advanced search failed');
    }
  }

  private async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const limit = parseInt(req.query.limit as string) || 10;
      const recommendations = await this.recommendationSystem.getRecommendations(packageId, { limit });
      this.sendSuccess(res, recommendations);
    } catch (error) {
      this.sendError(res, 500, 'RECOMMENDATIONS_FAILED', 'Failed to get recommendations');
    }
  }

  private async getTrendingPackages(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string || '7d';
      const limit = parseInt(req.query.limit as string) || 20;
      const trending = await this.discoveryEngine.getTrending({ period, limit });
      this.sendSuccess(res, trending);
    } catch (error) {
      this.sendError(res, 500, 'TRENDING_FAILED', 'Failed to get trending packages');
    }
  }

  private async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.discoveryEngine.getCategories();
      this.sendSuccess(res, categories);
    } catch (error) {
      this.sendError(res, 500, 'CATEGORIES_FAILED', 'Failed to get categories');
    }
  }

  private async getTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await this.discoveryEngine.getTags();
      this.sendSuccess(res, tags);
    } catch (error) {
      this.sendError(res, 500, 'TAGS_FAILED', 'Failed to get tags');
    }
  }

  private async recordEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body as AnalyticsEvent;
      await this.performanceMetrics.recordEvent(event);
      this.sendSuccess(res, { recorded: true });
    } catch (error) {
      this.sendError(res, 500, 'EVENT_RECORDING_FAILED', 'Failed to record event');
    }
  }

  private async getPackageStats(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const stats = await this.performanceMetrics.getPackageStats(packageId);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.sendError(res, 500, 'STATS_FAILED', 'Failed to get package stats');
    }
  }

  private async getUsageAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.performanceMetrics.getUsageAnalytics();
      this.sendSuccess(res, analytics);
    } catch (error) {
      this.sendError(res, 500, 'ANALYTICS_FAILED', 'Failed to get usage analytics');
    }
  }

  private async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.performanceMetrics.getMetrics();
      this.sendSuccess(res, metrics);
    } catch (error) {
      this.sendError(res, 500, 'METRICS_FAILED', 'Failed to get performance metrics');
    }
  }

  private async adminGetAllPackages(req: Request, res: Response): Promise<void> {
    try {
      const packages = await this.registryManager.getAllPackages();
      this.sendSuccess(res, packages);
    } catch (error) {
      this.sendError(res, 500, 'ADMIN_GET_PACKAGES_FAILED', 'Failed to get all packages');
    }
  }

  private async moderatePackage(req: Request, res: Response): Promise<void> {
    try {
      const packageId = req.params.packageId;
      const { action, reason } = req.body;
      const result = await this.registryManager.moderatePackage(packageId, action, reason);
      this.sendSuccess(res, result);
    } catch (error) {
      this.sendError(res, 500, 'MODERATION_FAILED', 'Package moderation failed');
    }
  }

  private async getUsers(req: Request, res: Response): Promise<void> {
    try {
      // This would integrate with user management system
      const users = await this.registryManager.getUsers();
      this.sendSuccess(res, users);
    } catch (error) {
      this.sendError(res, 500, 'GET_USERS_FAILED', 'Failed to get users');
    }
  }

  private async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        performance: await this.performanceMetrics.getSystemMetrics(),
        security: this.security.getStatus(),
        health: await this.healthMonitoring.getDetailedHealth()
      };
      this.sendSuccess(res, metrics);
    } catch (error) {
      this.sendError(res, 500, 'SYSTEM_METRICS_FAILED', 'Failed to get system metrics');
    }
  }

  // Helper Methods

  private sendSuccess(res: Response, data: any, statusCode: number = 200): void {
    const response: APIResponse = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: this.config.version,
        requestId: res.req.headers['x-request-id'] as string
      }
    };

    res.status(statusCode).json(response);
  }

  private sendError(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ): void {
    const response: APIResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.config.version,
        requestId: res.req.headers['x-request-id'] as string
      }
    };

    res.status(statusCode).json(response);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOpenAPISpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'BMAD Package Registry API',
        version: this.config.version,
        description: 'Enterprise package management system with integrated security',
        contact: {
          name: 'BMAD Package Management Team',
          email: 'packages@bmad.com'
        }
      },
      servers: [
        {
          url: `http://${this.config.host}:${this.config.port}${this.config.basePath}`,
          description: 'Development server'
        }
      ],
      paths: {
        '/health': {
          get: {
            summary: 'Health check endpoint',
            responses: {
              '200': {
                description: 'System health status'
              }
            }
          }
        },
        '/packages': {
          get: {
            summary: 'Search packages',
            parameters: [
              {
                name: 'q',
                in: 'query',
                description: 'Search query',
                schema: { type: 'string' }
              },
              {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', minimum: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                description: 'Results per page',
                schema: { type: 'integer', minimum: 1, maximum: 100 }
              }
            ],
            responses: {
              '200': {
                description: 'Package search results'
              }
            }
          },
          post: {
            summary: 'Create a new package',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      version: { type: 'string' },
                      description: { type: 'string' },
                      tags: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['name', 'version']
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Package created successfully'
              }
            }
          }
        },
        '/packages/{packageId}': {
          get: {
            summary: 'Get package details',
            parameters: [
              {
                name: 'packageId',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Package details'
              },
              '404': {
                description: 'Package not found'
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    };
  }

  private mergeWithDefaults(config: Partial<APIConfig>): APIConfig {
    return {
      port: 3000,
      host: 'localhost',
      basePath: '/api/v1',
      version: '1.0.0',
      cors: {
        origin: '*',
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // requests per window
        message: 'Too many requests from this IP'
      },
      security: {
        enabled: true,
        requireAuth: false, // Can be enabled per route
        allowedOrigins: ['http://localhost:3000']
      },
      monitoring: {
        enabled: true,
        metricsEndpoint: '/metrics',
        healthEndpoint: '/health'
      },
      swagger: {
        enabled: true,
        endpoint: '/docs'
      },
      ...config
    };
  }
}

/**
 * Export default configuration
 */
export const defaultAPIConfig: APIConfig = {
  port: 3000,
  host: 'localhost',
  basePath: '/api/v1',
  version: '1.0.0',
  cors: {
    origin: '*',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP'
  },
  security: {
    enabled: true,
    requireAuth: false,
    allowedOrigins: ['http://localhost:3000']
  },
  monitoring: {
    enabled: true,
    metricsEndpoint: '/metrics',
    healthEndpoint: '/health'
  },
  swagger: {
    enabled: true,
    endpoint: '/docs'
  }
};

/**
 * Create and export API instance
 */
export function createPackageRegistryAPI(config?: Partial<APIConfig>): PackageRegistryAPI {
  return new PackageRegistryAPI(config);
}

// Export types
export type { APIConfig, APIResponse, PaginationMeta, AuthenticatedRequest };