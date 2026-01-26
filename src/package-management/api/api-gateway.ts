/**
 * EPIC 2 STORY 2.7 - API GATEWAY
 * Enterprise API Gateway with rate limiting, caching, monitoring, and orchestration
 * Central entry point for all package management API operations
 *
 * @author Epic 2 Package Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.7
 */

import express, { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import rateLimit from 'express-rate-limit';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { createProxyMiddleware, Options as ProxyOptions } from 'http-proxy-middleware';
import LRU from 'lru-cache';
import { PackageRegistryAPI, APIConfig } from './package-registry-api';
import { epic1Security } from '../../security/epic1-integration';

/**
 * API Gateway Configuration
 */
export interface GatewayConfig {
  port: number;
  host: string;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  cache: {
    enabled: boolean;
    ttl: number; // seconds
    maxSize: number; // number of items
    redisPrefix: string;
  };
  proxy: {
    enabled: boolean;
    changeOrigin: boolean;
    timeout: number;
    retries: number;
  };
  security: {
    enabled: boolean;
    corsOrigins: string[];
    helmet: boolean;
    compression: boolean;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      requestRate: number;
    };
  };
  circuitBreaker: {
    enabled: boolean;
    timeout: number;
    errorThreshold: number;
    resetTimeout: number;
  };
  loadBalancer: {
    enabled: boolean;
    strategy: 'round-robin' | 'least-connections' | 'random';
    healthCheck: {
      enabled: boolean;
      interval: number;
      timeout: number;
    };
  };
}

/**
 * Service Registry for Backend Services
 */
export interface ServiceInstance {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  lastHealthCheck: Date;
  connections: number;
  responseTime: number;
  errorCount: number;
}

export interface ServiceDefinition {
  name: string;
  path: string;
  instances: ServiceInstance[];
  healthCheckPath: string;
  timeout: number;
  retries: number;
}

/**
 * Gateway Metrics Interface
 */
export interface GatewayMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    rate: number; // requests per second
  };
  response: {
    averageTime: number;
    p95Time: number;
    p99Time: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    size: number;
  };
  circuit: {
    open: number;
    halfOpen: number;
    closed: number;
  };
  upstream: {
    healthy: number;
    unhealthy: number;
    totalConnections: number;
  };
  errors: ErrorMetrics[];
}

export interface ErrorMetrics {
  type: string;
  count: number;
  rate: number;
  lastOccurrence: Date;
}

/**
 * Circuit Breaker State
 */
type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreaker {
  state: CircuitState;
  errorCount: number;
  nextAttempt: number;
  timeout: number;
  errorThreshold: number;
  resetTimeout: number;
}

/**
 * API Gateway Class
 * Central orchestrator for all package management API traffic
 */
export class APIGateway {
  private app: express.Application;
  private config: GatewayConfig;
  private redis: Redis;
  private cache: LRU<string, any>;
  private rateLimiter: RateLimiterRedis;
  private services: Map<string, ServiceDefinition> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private metrics: GatewayMetrics;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<GatewayConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.app = express();
    this.metrics = this.initializeMetrics();
    this.initializeRedis();
    this.initializeCache();
    this.initializeRateLimiter();
  }

  /**
   * Initialize the API Gateway
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🌐 Initializing API Gateway...');

      // Setup middleware stack
      this.setupSecurityMiddleware();
      this.setupCacheMiddleware();
      this.setupRateLimitingMiddleware();
      this.setupMonitoringMiddleware();
      this.setupCircuitBreakerMiddleware();

      // Register services
      await this.registerServices();

      // Setup routing
      this.setupRouting();

      // Setup health monitoring
      if (this.config.loadBalancer.healthCheck.enabled) {
        this.startHealthChecking();
      }

      // Setup metrics collection
      if (this.config.monitoring.enabled) {
        this.startMetricsCollection();
      }

      this.isInitialized = true;
      console.log('✅ API Gateway initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize API Gateway:', error);
      throw new Error(`Gateway initialization failed: ${error.message}`);
    }
  }

  /**
   * Start the gateway server
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Gateway not initialized. Call initialize() first.');
    }

    return new Promise((resolve) => {
      this.app.listen(this.config.port, this.config.host, () => {
        console.log(`🚀 API Gateway listening on ${this.config.host}:${this.config.port}`);
        console.log(`📊 Monitoring enabled: ${this.config.monitoring.enabled}`);
        console.log(`🔄 Load balancer: ${this.config.loadBalancer.strategy}`);
        resolve();
      });
    });
  }

  /**
   * Stop the gateway server
   */
  public async stop(): Promise<void> {
    console.log('🛑 Stopping API Gateway...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await this.redis.quit();
    console.log('✅ API Gateway stopped');
  }

  /**
   * Get current gateway metrics
   */
  public getMetrics(): GatewayMetrics {
    return { ...this.metrics };
  }

  // Private Methods

  private initializeRedis(): void {
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3
    });

    this.redis.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
  }

  private initializeCache(): void {
    if (this.config.cache.enabled) {
      this.cache = new LRU<string, any>({
        max: this.config.cache.maxSize,
        ttl: this.config.cache.ttl * 1000, // Convert to milliseconds
        updateAgeOnGet: true,
        updateAgeOnHas: false
      });

      console.log('💾 In-memory cache initialized');
    }
  }

  private initializeRateLimiter(): void {
    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rl_gateway',
      points: this.config.rateLimit.max,
      duration: Math.floor(this.config.rateLimit.windowMs / 1000),
      blockDuration: 60 // Block for 60 seconds when limit exceeded
    });

    console.log('🚦 Rate limiter initialized');
  }

  private setupSecurityMiddleware(): void {
    if (this.config.security.helmet) {
      this.app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          }
        },
        crossOriginEmbedderPolicy: false
      }));
    }

    if (this.config.security.corsOrigins.length > 0) {
      this.app.use(cors({
        origin: this.config.security.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      }));
    }

    if (this.config.security.compression) {
      this.app.use(compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        }
      }));
    }

    console.log('🔒 Security middleware configured');
  }

  private setupCacheMiddleware(): void {
    if (!this.config.cache.enabled) return;

    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);

      try {
        // Check in-memory cache first
        let cachedResponse = this.cache.get(cacheKey);

        if (!cachedResponse) {
          // Check Redis cache
          const redisData = await this.redis.get(`${this.config.cache.redisPrefix}:${cacheKey}`);
          if (redisData) {
            cachedResponse = JSON.parse(redisData);
            // Store in memory cache for faster access
            this.cache.set(cacheKey, cachedResponse);
          }
        }

        if (cachedResponse) {
          this.metrics.cache.hitRate++;
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          return res.json(cachedResponse);
        }

        // Cache miss
        this.metrics.cache.missRate++;
        res.set('X-Cache', 'MISS');

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function(data: any) {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Store in both caches
            this.cache.set(cacheKey, data);
            this.redis.setex(
              `${this.config.cache.redisPrefix}:${cacheKey}`,
              this.config.cache.ttl,
              JSON.stringify(data)
            );
          }
          return originalJson.call(this, data);
        }.bind(this);

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    });

    console.log('💾 Cache middleware configured');
  }

  private setupRateLimitingMiddleware(): void {
    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.generateRateLimitKey(req);
        await this.rateLimiter.consume(key);
        next();
      } catch (rateLimiterRes) {
        const totalHits = rateLimiterRes.totalHits;
        const msBeforeNext = rateLimiterRes.msBeforeNext;

        res.set('X-RateLimit-Limit', this.config.rateLimit.max.toString());
        res.set('X-RateLimit-Remaining', Math.max(0, this.config.rateLimit.max - totalHits).toString());
        res.set('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext).toISOString());

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
            retryAfter: Math.ceil(msBeforeNext / 1000)
          }
        });
      }
    });

    console.log('🚦 Rate limiting middleware configured');
  }

  private setupMonitoringMiddleware(): void {
    if (!this.config.monitoring.enabled) return;

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      req.headers['x-request-id'] = requestId;

      // Track request
      this.metrics.requests.total++;

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;

        // Update metrics
        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.metrics.requests.successful++;
        } else {
          this.metrics.requests.failed++;
          this.recordError(req, res, responseTime);
        }

        this.updateResponseTimeMetrics(responseTime);

        // Log request details
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - ${requestId}`);
      });

      next();
    });

    console.log('📊 Monitoring middleware configured');
  }

  private setupCircuitBreakerMiddleware(): void {
    if (!this.config.circuitBreaker.enabled) return;

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const serviceName = this.getServiceNameFromPath(req.path);
      const circuitBreaker = this.getOrCreateCircuitBreaker(serviceName);

      // Check circuit breaker state
      if (circuitBreaker.state === 'open') {
        if (Date.now() < circuitBreaker.nextAttempt) {
          return res.status(503).json({
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Service temporarily unavailable due to high error rate'
            }
          });
        } else {
          // Try half-open state
          circuitBreaker.state = 'half-open';
        }
      }

      // Track response for circuit breaker
      res.on('finish', () => {
        this.updateCircuitBreaker(circuitBreaker, res.statusCode >= 500);
      });

      next();
    });

    console.log('🔄 Circuit breaker middleware configured');
  }

  private async registerServices(): Promise<void> {
    // Register core package management service
    this.services.set('packages', {
      name: 'packages',
      path: '/api/v1',
      instances: [
        {
          id: 'pkg-svc-1',
          url: 'http://localhost:3001',
          weight: 1,
          healthy: true,
          lastHealthCheck: new Date(),
          connections: 0,
          responseTime: 0,
          errorCount: 0
        }
      ],
      healthCheckPath: '/health',
      timeout: 30000,
      retries: 3
    });

    // Register analytics service
    this.services.set('analytics', {
      name: 'analytics',
      path: '/api/v1/analytics',
      instances: [
        {
          id: 'analytics-svc-1',
          url: 'http://localhost:3002',
          weight: 1,
          healthy: true,
          lastHealthCheck: new Date(),
          connections: 0,
          responseTime: 0,
          errorCount: 0
        }
      ],
      healthCheckPath: '/health',
      timeout: 15000,
      retries: 2
    });

    // Register discovery service
    this.services.set('discovery', {
      name: 'discovery',
      path: '/api/v1/discovery',
      instances: [
        {
          id: 'discovery-svc-1',
          url: 'http://localhost:3003',
          weight: 1,
          healthy: true,
          lastHealthCheck: new Date(),
          connections: 0,
          responseTime: 0,
          errorCount: 0
        }
      ],
      healthCheckPath: '/health',
      timeout: 20000,
      retries: 2
    });

    console.log('🗂️ Services registered:', Array.from(this.services.keys()));
  }

  private setupRouting(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: this.getServicesHealth(),
        metrics: this.metrics
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req: Request, res: Response) => {
      res.json(this.getMetrics());
    });

    // Cache management endpoints
    this.app.delete('/cache/:key', async (req: Request, res: Response) => {
      const { key } = req.params;
      this.cache.delete(key);
      await this.redis.del(`${this.config.cache.redisPrefix}:${key}`);
      res.json({ success: true, message: `Cache entry ${key} deleted` });
    });

    this.app.delete('/cache', async (req: Request, res: Response) => {
      this.cache.clear();
      await this.redis.flushdb();
      res.json({ success: true, message: 'All cache entries cleared' });
    });

    // Circuit breaker management
    this.app.post('/circuit/:service/reset', (req: Request, res: Response) => {
      const { service } = req.params;
      const circuitBreaker = this.circuitBreakers.get(service);
      if (circuitBreaker) {
        circuitBreaker.state = 'closed';
        circuitBreaker.errorCount = 0;
        circuitBreaker.nextAttempt = 0;
        res.json({ success: true, message: `Circuit breaker for ${service} reset` });
      } else {
        res.status(404).json({ success: false, error: 'Service not found' });
      }
    });

    // Setup proxy routes for each service
    for (const [serviceName, serviceConfig] of this.services) {
      this.setupServiceProxy(serviceName, serviceConfig);
    }

    console.log('🛣️ Gateway routing configured');
  }

  private setupServiceProxy(serviceName: string, serviceConfig: ServiceDefinition): void {
    const proxyOptions: ProxyOptions = {
      target: this.getServiceInstance(serviceName).url,
      changeOrigin: this.config.proxy.changeOrigin,
      timeout: serviceConfig.timeout,
      retries: serviceConfig.retries,
      pathRewrite: {
        [`^${serviceConfig.path}`]: ''
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add headers for downstream services
        proxyReq.setHeader('X-Forwarded-For', req.ip);
        proxyReq.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
        proxyReq.setHeader('X-Gateway-Version', '1.0.0');

        // Track connection
        const instance = this.getServiceInstance(serviceName);
        instance.connections++;
      },
      onProxyRes: (proxyRes, req, res) => {
        // Track completion
        const instance = this.getServiceInstance(serviceName);
        instance.connections = Math.max(0, instance.connections - 1);

        // Add gateway headers
        proxyRes.headers['X-Gateway'] = 'BMAD-API-Gateway';
        proxyRes.headers['X-Service'] = serviceName;
      },
      onError: (err, req, res) => {
        console.error(`Proxy error for ${serviceName}:`, err);
        this.recordServiceError(serviceName, err);

        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: `Service ${serviceName} is temporarily unavailable`
            }
          });
        }
      },
      router: (req) => {
        // Load balancing
        const instance = this.selectServiceInstance(serviceName);
        return instance ? instance.url : undefined;
      }
    };

    const proxy = createProxyMiddleware(proxyOptions);
    this.app.use(serviceConfig.path, proxy);

    console.log(`🔗 Proxy configured for ${serviceName} -> ${serviceConfig.path}`);
  }

  private selectServiceInstance(serviceName: string): ServiceInstance | null {
    const service = this.services.get(serviceName);
    if (!service) return null;

    const healthyInstances = service.instances.filter(instance => instance.healthy);
    if (healthyInstances.length === 0) return null;

    switch (this.config.loadBalancer.strategy) {
      case 'round-robin':
        return this.selectRoundRobin(healthyInstances);
      case 'least-connections':
        return this.selectLeastConnections(healthyInstances);
      case 'random':
        return this.selectRandom(healthyInstances);
      default:
        return healthyInstances[0];
    }
  }

  private selectRoundRobin(instances: ServiceInstance[]): ServiceInstance {
    // Simple round-robin implementation
    const index = Math.floor(Date.now() / 1000) % instances.length;
    return instances[index];
  }

  private selectLeastConnections(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) =>
      instance.connections < min.connections ? instance : min
    );
  }

  private selectRandom(instances: ServiceInstance[]): ServiceInstance {
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }

  private getServiceInstance(serviceName: string): ServiceInstance {
    const selected = this.selectServiceInstance(serviceName);
    if (!selected) {
      throw new Error(`No healthy instances for service: ${serviceName}`);
    }
    return selected;
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthChecks(),
      this.config.loadBalancer.healthCheck.interval
    );

    console.log('💓 Health checking started');
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, service] of this.services) {
      for (const instance of service.instances) {
        try {
          const startTime = Date.now();
          const response = await fetch(
            `${instance.url}${service.healthCheckPath}`,
            {
              method: 'GET',
              timeout: this.config.loadBalancer.healthCheck.timeout
            }
          );

          const responseTime = Date.now() - startTime;
          instance.responseTime = responseTime;
          instance.healthy = response.ok;
          instance.lastHealthCheck = new Date();

          if (response.ok) {
            instance.errorCount = 0;
          } else {
            instance.errorCount++;
          }

        } catch (error) {
          instance.healthy = false;
          instance.errorCount++;
          instance.lastHealthCheck = new Date();
          console.warn(`Health check failed for ${serviceName}:${instance.id}`, error.message);
        }
      }
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
    }, this.config.monitoring.metricsInterval);

    console.log('📊 Metrics collection started');
  }

  private updateMetrics(): void {
    // Calculate request rate
    const now = Date.now();
    const windowSize = 60000; // 1 minute window
    this.metrics.requests.rate = this.metrics.requests.total / (windowSize / 1000);

    // Update cache metrics
    if (this.cache) {
      this.metrics.cache.size = this.cache.size;
    }

    // Update upstream metrics
    let healthyCount = 0;
    let totalConnections = 0;

    for (const service of this.services.values()) {
      for (const instance of service.instances) {
        if (instance.healthy) healthyCount++;
        totalConnections += instance.connections;
      }
    }

    this.metrics.upstream.healthy = healthyCount;
    this.metrics.upstream.unhealthy = this.getTotalInstances() - healthyCount;
    this.metrics.upstream.totalConnections = totalConnections;

    // Update circuit breaker metrics
    let openCount = 0;
    let halfOpenCount = 0;
    let closedCount = 0;

    for (const cb of this.circuitBreakers.values()) {
      switch (cb.state) {
        case 'open': openCount++; break;
        case 'half-open': halfOpenCount++; break;
        case 'closed': closedCount++; break;
      }
    }

    this.metrics.circuit.open = openCount;
    this.metrics.circuit.halfOpen = halfOpenCount;
    this.metrics.circuit.closed = closedCount;
  }

  private getTotalInstances(): number {
    let total = 0;
    for (const service of this.services.values()) {
      total += service.instances.length;
    }
    return total;
  }

  private getServicesHealth(): any {
    const health: any = {};
    for (const [serviceName, service] of this.services) {
      health[serviceName] = {
        healthy: service.instances.filter(i => i.healthy).length,
        total: service.instances.length,
        instances: service.instances.map(i => ({
          id: i.id,
          healthy: i.healthy,
          responseTime: i.responseTime,
          connections: i.connections,
          errorCount: i.errorCount
        }))
      };
    }
    return health;
  }

  // Helper Methods

  private generateCacheKey(req: Request): string {
    const url = req.originalUrl || req.url;
    const method = req.method;
    const userId = req.headers['x-user-id'] || 'anonymous';
    return `${method}:${url}:${userId}`;
  }

  private generateRateLimitKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.headers['x-user-id'];
    return userId ? `user:${userId}` : `ip:${ip}`;
  }

  private generateRequestId(): string {
    return `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getServiceNameFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 3 && segments[0] === 'api' && segments[1] === 'v1') {
      return segments[2];
    }
    return 'unknown';
  }

  private getOrCreateCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, {
        state: 'closed',
        errorCount: 0,
        nextAttempt: 0,
        timeout: this.config.circuitBreaker.timeout,
        errorThreshold: this.config.circuitBreaker.errorThreshold,
        resetTimeout: this.config.circuitBreaker.resetTimeout
      });
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  private updateCircuitBreaker(circuitBreaker: CircuitBreaker, isError: boolean): void {
    if (isError) {
      circuitBreaker.errorCount++;

      if (circuitBreaker.state === 'closed' &&
          circuitBreaker.errorCount >= circuitBreaker.errorThreshold) {
        circuitBreaker.state = 'open';
        circuitBreaker.nextAttempt = Date.now() + circuitBreaker.resetTimeout;
      } else if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'open';
        circuitBreaker.nextAttempt = Date.now() + circuitBreaker.resetTimeout;
      }
    } else {
      if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'closed';
        circuitBreaker.errorCount = 0;
      } else if (circuitBreaker.state === 'closed') {
        circuitBreaker.errorCount = Math.max(0, circuitBreaker.errorCount - 1);
      }
    }
  }

  private updateResponseTimeMetrics(responseTime: number): void {
    // Simple moving average calculation
    const alpha = 0.1; // Smoothing factor
    this.metrics.response.averageTime =
      this.metrics.response.averageTime * (1 - alpha) + responseTime * alpha;

    // Update percentiles (simplified)
    this.metrics.response.p95Time = Math.max(this.metrics.response.p95Time, responseTime);
    this.metrics.response.p99Time = Math.max(this.metrics.response.p99Time, responseTime);
  }

  private recordError(req: Request, res: Response, responseTime: number): void {
    const errorType = this.categorizeError(res.statusCode);
    let errorMetric = this.metrics.errors.find(e => e.type === errorType);

    if (!errorMetric) {
      errorMetric = {
        type: errorType,
        count: 0,
        rate: 0,
        lastOccurrence: new Date()
      };
      this.metrics.errors.push(errorMetric);
    }

    errorMetric.count++;
    errorMetric.lastOccurrence = new Date();
    errorMetric.rate = errorMetric.count / (Date.now() / 1000); // Simple rate calculation
  }

  private recordServiceError(serviceName: string, error: Error): void {
    const service = this.services.get(serviceName);
    if (service) {
      for (const instance of service.instances) {
        instance.errorCount++;
        if (instance.errorCount > 5) {
          instance.healthy = false;
        }
      }
    }
  }

  private categorizeError(statusCode: number): string {
    if (statusCode >= 400 && statusCode < 500) return 'client_error';
    if (statusCode >= 500) return 'server_error';
    return 'unknown_error';
  }

  private initializeMetrics(): GatewayMetrics {
    return {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        rate: 0
      },
      response: {
        averageTime: 0,
        p95Time: 0,
        p99Time: 0
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        size: 0
      },
      circuit: {
        open: 0,
        halfOpen: 0,
        closed: 0
      },
      upstream: {
        healthy: 0,
        unhealthy: 0,
        totalConnections: 0
      },
      errors: []
    };
  }

  private mergeWithDefaults(config: Partial<GatewayConfig>): GatewayConfig {
    return {
      port: 8080,
      host: 'localhost',
      redis: {
        host: 'localhost',
        port: 6379,
        db: 0,
        ...config.redis
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        ...config.rateLimit
      },
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
        maxSize: 1000,
        redisPrefix: 'gateway_cache',
        ...config.cache
      },
      proxy: {
        enabled: true,
        changeOrigin: true,
        timeout: 30000,
        retries: 3,
        ...config.proxy
      },
      security: {
        enabled: true,
        corsOrigins: ['*'],
        helmet: true,
        compression: true,
        ...config.security
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000, // 30 seconds
        alertThresholds: {
          errorRate: 0.05, // 5%
          responseTime: 5000, // 5 seconds
          requestRate: 1000 // requests per minute
        },
        ...config.monitoring
      },
      circuitBreaker: {
        enabled: true,
        timeout: 60000, // 1 minute
        errorThreshold: 5,
        resetTimeout: 60000, // 1 minute
        ...config.circuitBreaker
      },
      loadBalancer: {
        enabled: true,
        strategy: 'round-robin',
        healthCheck: {
          enabled: true,
          interval: 30000, // 30 seconds
          timeout: 5000 // 5 seconds
        },
        ...config.loadBalancer
      }
    };
  }
}

/**
 * Create API Gateway instance
 */
export function createAPIGateway(config?: Partial<GatewayConfig>): APIGateway {
  return new APIGateway(config);
}

/**
 * Default gateway configuration
 */
export const defaultGatewayConfig: GatewayConfig = {
  port: 8080,
  host: 'localhost',
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  cache: {
    enabled: true,
    ttl: 300,
    maxSize: 1000,
    redisPrefix: 'gateway_cache'
  },
  proxy: {
    enabled: true,
    changeOrigin: true,
    timeout: 30000,
    retries: 3
  },
  security: {
    enabled: true,
    corsOrigins: ['*'],
    helmet: true,
    compression: true
  },
  monitoring: {
    enabled: true,
    metricsInterval: 30000,
    alertThresholds: {
      errorRate: 0.05,
      responseTime: 5000,
      requestRate: 1000
    }
  },
  circuitBreaker: {
    enabled: true,
    timeout: 60000,
    errorThreshold: 5,
    resetTimeout: 60000
  },
  loadBalancer: {
    enabled: true,
    strategy: 'round-robin',
    healthCheck: {
      enabled: true,
      interval: 30000,
      timeout: 5000
    }
  }
};

// Export types
export type {
  GatewayConfig,
  ServiceInstance,
  ServiceDefinition,
  GatewayMetrics,
  ErrorMetrics,
  CircuitBreaker
};