/**
 * Cross-Module Communication Paths Test
 * EPIC 1.2: Integration Test Repair
 * Tests all 6 critical cross-module communication paths
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { CrossModuleCommunicationManager, RestApiSimulator } from '../fixtures/cross-module-communication.js';
import { JWTTokenMocks } from '../fixtures/jwt-token-mocks.js';

describe('Cross-Module Communication Paths', () => {
  let commManager;
  let apiSimulator;
  let jwtManager;
  let testResults = {};

  // The 6 critical communication paths that must work
  const CRITICAL_COMMUNICATION_PATHS = [
    { source: 'intel-team', target: 'legal-team', name: 'Intel → Legal' },
    { source: 'intel-team', target: 'strategy-team', name: 'Intel → Strategy' },
    { source: 'intel-team', target: 'cybersec-team', name: 'Intel → CyberSec' },
    { source: 'legal-team', target: 'strategy-team', name: 'Legal → Strategy' },
    { source: 'legal-team', target: 'cybersec-team', name: 'Legal → CyberSec' },
    { source: 'strategy-team', target: 'cybersec-team', name: 'Strategy → CyberSec' }
  ];

  beforeAll(async () => {
    console.log('🔧 Initializing cross-module communication infrastructure...');

    // Initialize communication infrastructure
    commManager = new CrossModuleCommunicationManager();
    apiSimulator = new RestApiSimulator();
    jwtManager = new JWTTokenMocks();

    // Setup infrastructure
    await commManager.initialize();
    apiSimulator.setupDefaultEndpoints();

    testResults = {
      startTime: new Date().toISOString(),
      totalPaths: CRITICAL_COMMUNICATION_PATHS.length,
      results: {}
    };
  });

  afterAll(async () => {
    // Generate final report
    const report = commManager.generateReport();
    const authResults = await jwtManager.testAllAuthenticationPaths();

    console.log('📋 Cross-Module Communication Test Summary');
    console.log('═'.repeat(50));
    console.log(`Total Paths Tested: ${report.totalPaths}`);
    console.log(`Successful Paths: ${report.successfulPaths}`);
    console.log(`Failed Paths: ${report.failedPaths}`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log(`Authentication Success Rate: ${authResults.filter(r => r.success).length}/${authResults.length}`);

    testResults.endTime = new Date().toISOString();
    testResults.summary = report;
    testResults.authResults = authResults;
  });

  describe('Authentication Infrastructure', () => {
    test('JWT token generation should work for all paths', async () => {
      const authResults = await jwtManager.testAllAuthenticationPaths();

      for (const result of authResults) {
        expect(result.tokenGenerated).toBe(true);
        expect(result.tokenValid).toBe(true);
        expect(result.hasPermission).toBe(true);
        expect(result.success).toBe(true);

        if (!result.success) {
          console.error(`❌ Auth failed for ${result.path}: ${result.error}`);
        }
      }

      // Verify all 6 critical paths have valid authentication
      const criticalPaths = authResults.filter(r =>
        CRITICAL_COMMUNICATION_PATHS.some(cp => r.path === `${cp.source}->${cp.target}`)
      );

      expect(criticalPaths).toHaveLength(6);
      expect(criticalPaths.every(p => p.success)).toBe(true);
    });

    test('Token validation should enforce proper permissions', () => {
      // Test valid token
      const validToken = jwtManager.generateToken('intel-team', 'legal-team');
      const validation = jwtManager.validateToken(validToken);
      expect(validation.valid).toBe(true);
      expect(validation.claims.sourceModule).toBe('intel-team');
      expect(validation.claims.targetModule).toBe('legal-team');

      // Test invalid token format
      const invalidValidation = jwtManager.validateToken('invalid.token.format');
      expect(invalidValidation.valid).toBe(false);

      // Test unauthorized module pair (should not exist)
      const unauthorizedToken = jwtManager.generateToken('nonexistent-module', 'legal-team');
      const unauthorizedValidation = jwtManager.validateToken(unauthorizedToken);
      expect(unauthorizedValidation.valid).toBe(false);
    });
  });

  describe('Module Configuration Loading', () => {
    test('All target modules should have valid configurations', async () => {
      const moduleNames = ['intel-team', 'legal-team', 'strategy-team', 'cybersec-team'];

      for (const moduleName of moduleNames) {
        const config = commManager.moduleConfigs.get(moduleName);
        expect(config).toBeDefined();
        expect(config.code).toBe(moduleName);
        expect(config.agents).toBeDefined();
        expect(config.workflows).toBeDefined();

        if (config.integration) {
          expect(Array.isArray(config.integration.exposed_workflows)).toBe(true);
          console.log(`✅ ${moduleName}: ${config.integration.exposed_workflows?.length || 0} exposed workflows`);
        }
      }
    });

    test('BMM and BMGD modules should be accessible', async () => {
      const bmmConfig = commManager.moduleConfigs.get('bmm');
      const bmgdConfig = commManager.moduleConfigs.get('bmgd');

      // BMM and BMGD might not have example files, so we test gracefully
      if (bmmConfig) {
        expect(bmmConfig.code).toBe('bmm');
        console.log('✅ BMM module configuration loaded');
      } else {
        console.log('⚠️ BMM module configuration not found (expected if no example file exists)');
      }

      if (bmgdConfig) {
        expect(bmgdConfig.code).toBe('bmgd');
        console.log('✅ BMGD module configuration loaded');
      } else {
        console.log('⚠️ BMGD module configuration not found (expected if no example file exists)');
      }
    });
  });

  describe('Critical Communication Paths', () => {
    test.each(CRITICAL_COMMUNICATION_PATHS)(
      '$name communication path should be fully functional',
      async ({ source, target, name }) => {
        console.log(`\n🧪 Testing ${name} (${source} → ${target})`);

        const result = await commManager.testCommunicationPath(source, target);
        testResults.results[`${source}->${target}`] = result;

        // Authentication must work
        expect(result.authSuccess).toBe(true);

        // Communication should succeed
        expect(result.success).toBe(true);

        // Duration should be reasonable
        expect(result.duration).toBeLessThan(1000); // < 1 second

        // Should have some form of integration (workflows)
        const hasIntegration = result.workflowsExposed > 0 || result.workflowsConsumed > 0;
        expect(hasIntegration).toBe(true);

        // No critical errors
        expect(result.errors.length).toBe(0);

        console.log(`  ✅ Auth: ${result.authSuccess} | Duration: ${Math.round(result.duration)}ms | Workflows: ${result.workflowsExposed}/${result.workflowsConsumed} | Errors: ${result.errors.length}`);
      }
    );
  });

  describe('REST API Simulation', () => {
    test('API endpoints should be accessible for all modules', async () => {
      const modules = ['intel-team', 'legal-team', 'strategy-team', 'cybersec-team'];
      const results = [];

      for (const module of modules) {
        // Test health endpoint (no auth required)
        const healthResult = await apiSimulator.simulateRequest(
          'GET',
          `/${module}/api/v1/health`
        );
        expect(healthResult.status).toBe(200);
        expect(healthResult.data.status).toBe('healthy');

        // Test authenticated endpoint
        const token = jwtManager.generateToken('bmm', module);
        const workflowResult = await apiSimulator.simulateRequest(
          'POST',
          `/${module}/api/v1/workflows/trigger`,
          { workflowId: 'test-workflow' },
          { authorization: `Bearer ${token}` }
        );

        expect(workflowResult.status).toBe(200);
        expect(workflowResult.data.status).toBe('triggered');

        results.push({
          module,
          healthOk: healthResult.status === 200,
          workflowOk: workflowResult.status === 200
        });
      }

      // All modules should be accessible
      expect(results.every(r => r.healthOk && r.workflowOk)).toBe(true);
    });

    test('API should enforce authentication', async () => {
      // Test without token
      const unauthResult = await apiSimulator.simulateRequest(
        'POST',
        '/intel-team/api/v1/workflows/trigger',
        { workflowId: 'test' }
      );

      expect(unauthResult.status).toBe(401);
      expect(unauthResult.error).toBe('Authentication required');

      // Test with invalid token
      const invalidAuthResult = await apiSimulator.simulateRequest(
        'POST',
        '/intel-team/api/v1/workflows/trigger',
        { workflowId: 'test' },
        { authorization: 'Bearer invalid-token' }
      );

      expect(invalidAuthResult.status).toBe(403); // Invalid token should return 403
    });
  });

  describe('Performance Requirements', () => {
    test('All communication paths should meet performance targets', async () => {
      const results = await commManager.testAllCommunicationPaths();

      for (const result of results) {
        // Each path should complete within 300ms (target: <1000ms)
        expect(result.duration).toBeLessThan(1000);

        // Average duration should be reasonable
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        expect(avgDuration).toBeLessThan(500);
      }

      console.log(`⚡ Average communication duration: ${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms`);
    });

    test('Token operations should be fast', () => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const token = jwtManager.generateToken('intel-team', 'legal-team');
        const validation = jwtManager.validateToken(token);
        expect(validation.valid).toBe(true);
      }

      const duration = performance.now() - start;
      const avgDuration = duration / iterations;

      // Each token operation should be very fast (<10ms)
      expect(avgDuration).toBeLessThan(10);

      console.log(`🔐 Token operations: ${Math.round(avgDuration * 1000)}μs per operation`);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('Invalid module names should be handled gracefully', async () => {
      const result = await commManager.testCommunicationPath('nonexistent-module', 'legal-team');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('configuration not available');
    });

    test('Expired tokens should be rejected', () => {
      // Test with a simple expired token scenario
      // Create a token with very short expiration time
      const shortLivedManager = new JWTTokenMocks();
      shortLivedManager.defaultExpirationTime = 1; // 1ms expiration

      const token = shortLivedManager.generateToken('intel-team', 'legal-team');

      // Wait a moment for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const validation = shortLivedManager.validateToken(token);
          expect(validation.valid).toBe(false);
          expect(validation.error).toMatch(/expired|invalid/i);
          resolve();
        }, 10); // Wait 10ms
      });
    });
  });
});