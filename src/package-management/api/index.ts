/**
 * EPIC 2 STORY 2.7 - API MAIN INDEX
 * Complete API system exports and initialization
 * Single entry point for all Epic 2 API components
 *
 * @author Epic 2 Package Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.7 (FINAL STORY)
 */

// Main API Components
export {
  PackageRegistryAPI,
  APIConfig,
  APIResponse,
  PaginationMeta,
  AuthenticatedRequest,
  createPackageRegistryAPI,
  defaultAPIConfig
} from './package-registry-api';

// SDK Generator
export {
  SDKGenerator,
  SDKConfig,
  SDKLanguage,
  GeneratedSDK,
  SDKFile,
  createSDKGenerator,
  generateAllSDKs
} from './sdk-generator';

// API Gateway
export {
  APIGateway,
  GatewayConfig,
  ServiceInstance,
  ServiceDefinition,
  GatewayMetrics,
  ErrorMetrics,
  CircuitBreaker,
  createAPIGateway,
  defaultGatewayConfig
} from './api-gateway';

// OpenAPI Specification
export {
  generateOpenAPISpec,
  generateVersionedSpec,
  generateSDKSpec,
  validateSpec,
  exportToYAML,
  exportToJSON,
  defaultOpenAPIConfig
} from './openapi-spec';

/**
 * Initialize complete API system
 */
export async function initializeAPISystem(config?: {
  api?: Partial<import('./package-registry-api').APIConfig>;
  gateway?: Partial<import('./api-gateway').GatewayConfig>;
  sdk?: Partial<import('./sdk-generator').SDKConfig>;
}): Promise<{
  api: import('./package-registry-api').PackageRegistryAPI;
  gateway: import('./api-gateway').APIGateway;
  sdkGenerator: import('./sdk-generator').SDKGenerator;
  spec: any;
}> {
  console.log('🚀 Initializing complete API system...');

  // Initialize API components
  const { createPackageRegistryAPI } = await import('./package-registry-api');
  const { createAPIGateway } = await import('./api-gateway');
  const { createSDKGenerator } = await import('./sdk-generator');
  const { generateOpenAPISpec } = await import('./openapi-spec');

  // Create instances
  const api = createPackageRegistryAPI(config?.api);
  const gateway = createAPIGateway(config?.gateway);
  const spec = generateOpenAPISpec();
  const sdkGenerator = createSDKGenerator(config?.sdk || {
    apiBaseUrl: 'http://localhost:3000',
    version: '1.0.0',
    packageName: 'bmad-packages',
    outputDir: './generated-sdks',
    languages: ['typescript', 'javascript', 'python', 'go'],
    includeAuth: true,
    includeTypes: true,
    includeExamples: true
  }, spec);

  // Initialize all components
  await api.initialize();
  await gateway.initialize();

  console.log('✅ Complete API system initialized');

  return {
    api,
    gateway,
    sdkGenerator,
    spec
  };
}

/**
 * Start complete API system
 */
export async function startAPISystem(config?: any): Promise<any> {
  const system = await initializeAPISystem(config);

  // Start services
  await system.gateway.start();
  await system.api.start();

  console.log('🌟 Complete API system started');
  console.log('📚 API Documentation: http://localhost:3000/docs');
  console.log('🚪 API Gateway: http://localhost:8080');
  console.log('📦 Package Registry: http://localhost:3000');

  return system;
}

/**
 * Quick start function for development
 */
export async function quickStart(): Promise<any> {
  console.log('🚀 Quick starting BMAD Package Registry API system...');

  const system = await startAPISystem({
    api: {
      port: 3000,
      host: 'localhost',
      security: { enabled: false } // Disable for quick start
    },
    gateway: {
      port: 8080,
      host: 'localhost',
      security: { enabled: false }
    }
  });

  console.log('\n🎉 BMAD Package Registry API is ready!');
  console.log('📖 Visit http://localhost:3000/docs for API documentation');
  console.log('🔍 Visit http://localhost:3000/health for system health');
  console.log('📊 Visit http://localhost:8080/metrics for gateway metrics');

  return system;
}

// Default export for convenience
export default {
  initializeAPISystem,
  startAPISystem,
  quickStart
};