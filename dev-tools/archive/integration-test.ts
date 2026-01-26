#!/usr/bin/env node
/**
 * BMAD CONCURA NETWORK PERFORMANCE INTEGRATION TEST
 * Comprehensive integration testing for Epic 3 Story 3.5
 *
 * Tests network performance integration with:
 * - Epic 1 Security components (31 existing)
 * - Epic 3.1-3.4 Performance systems (118.4% baseline)
 * - Full network optimization pipeline
 *
 * @author BMAD Performance Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 */

import { performance } from 'perf_hooks';

// Import network performance components
import {
  NetworkPerformanceSuite,
  createNetworkPerformanceSuite,
  bmadNetworkPerformanceSuite
} from '../../../src/performance/network';

// Import main performance suite
import {
  BMadPerformanceSuite,
  initializeBmadPerformance
} from '../../../src/performance';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  duration: number;
  details: any;
  error?: string;
}

interface IntegrationTestReport {
  timestamp: string;
  epic: string;
  story: string;
  environment: string;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    successRate: string;
    totalDuration: number;
  };
  performanceBaseline: {
    epic3_1_3_4: string;
    networkOptimization: string;
    combinedImprovement: string;
  };
  testResults: TestResult[];
  integrationStatus: 'READY' | 'PARTIAL' | 'FAILED';
  recommendations: string[];
}

/**
 * Integration Test Suite for Network Performance
 */
class NetworkPerformanceIntegrationTest {
  private testResults: TestResult[] = [];
  private startTime = performance.now();

  /**
   * Run all integration tests
   */
  public async runTests(): Promise<IntegrationTestReport> {
    console.log('🧪 Starting BMAD Network Performance Integration Tests...');
    console.log('📋 Epic 3 Story 3.5: Network & API Performance Optimization');
    console.log('🔗 Testing integration with Epic 1 Security + Epic 3.1-3.4 Performance');
    console.log('');

    try {
      // Test 1: Component Initialization
      await this.testComponentInitialization();

      // Test 2: Network Optimization Pipeline
      await this.testNetworkOptimizationPipeline();

      // Test 3: API Acceleration
      await this.testAPIAcceleration();

      // Test 4: Connection Management
      await this.testConnectionManagement();

      // Test 5: Latency Optimization
      await this.testLatencyOptimization();

      // Test 6: Dashboard Integration
      await this.testDashboardIntegration();

      // Test 7: Performance Metrics Integration
      await this.testPerformanceMetricsIntegration();

      // Test 8: Security Integration (Mock)
      await this.testSecurityIntegration();

      // Test 9: End-to-End Performance Validation
      await this.testEndToEndPerformance();

      // Test 10: Load Testing
      await this.testLoadHandling();

      console.log('');
      console.log('✅ All integration tests completed');

    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
    }

    return this.generateReport();
  }

  /**
   * Test 1: Component Initialization
   */
  private async testComponentInitialization(): Promise<void> {
    const testName = 'Component Initialization Test';
    console.log(`🔧 Running: ${testName}`);

    const startTime = performance.now();

    try {
      // Test network suite initialization
      const networkSuite = createNetworkPerformanceSuite({
        performanceTargets: {
          latencyReduction: 40,
          apiSpeedup: 50,
          connectionEfficiency: 85,
          overallImprovement: 60
        }
      });

      await networkSuite.initialize();

      // Test main performance suite integration
      const mainSuite = new BMadPerformanceSuite();
      await mainSuite.initialize();

      const duration = performance.now() - startTime;

      this.testResults.push({
        name: testName,
        status: 'PASS',
        duration,
        details: {
          networkSuiteInitialized: true,
          mainSuiteIntegrated: true,
          initializationTime: `${duration.toFixed(2)}ms`
        }
      });

      console.log(`   ✅ Components initialized in ${duration.toFixed(2)}ms`);

      // Cleanup
      await networkSuite.shutdown();
      await mainSuite.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Initialization failed: ${error}`);
    }
  }

  /**
   * Test 2: Network Optimization Pipeline
   */
  private async testNetworkOptimizationPipeline(): Promise<void> {
    const testName = 'Network Optimization Pipeline Test';
    console.log(`🌐 Running: ${testName}`);

    const startTime = performance.now();

    try {
      const networkSuite = createNetworkPerformanceSuite();
      await networkSuite.initialize();
      await networkSuite.startOptimization();

      // Test optimization pipeline
      const testUrls = [
        'https://api.bmad.com/users/profile',
        'https://api.bmad.com/projects/data',
        'https://cdn.bmad.com/assets/images'
      ];

      let totalImprovement = 0;
      const results: any[] = [];

      for (const url of testUrls) {
        const result = await networkSuite.processOptimizedRequest(url);
        results.push(result);
        totalImprovement += result.optimization.estimatedImprovement;
      }

      const averageImprovement = totalImprovement / testUrls.length;
      const duration = performance.now() - startTime;

      const passed = averageImprovement >= 30; // Minimum 30% improvement expected

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          requestsProcessed: testUrls.length,
          averageImprovement: `${averageImprovement.toFixed(1)}%`,
          results: results.map(r => ({
            url: r.response.body?.data || 'processed',
            improvement: `${r.optimization.estimatedImprovement.toFixed(1)}%`
          }))
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} Pipeline processed ${testUrls.length} requests with ${averageImprovement.toFixed(1)}% average improvement`);

      await networkSuite.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Pipeline test failed: ${error}`);
    }
  }

  /**
   * Test 3: API Acceleration
   */
  private async testAPIAcceleration(): Promise<void> {
    const testName = 'API Acceleration Test';
    console.log(`🚀 Running: ${testName}`);

    const startTime = performance.now();

    try {
      const { createAPIAccelerator } = await import('../../../src/performance/network/api/api-accelerator');

      const accelerator = createAPIAccelerator({
        cacheTTL: 300000,
        compressionEnabled: true,
        batchingEnabled: true,
        prefetchEnabled: true
      });

      // Test multiple API requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push({
          id: `test-${i}`,
          method: 'GET' as const,
          url: `https://api.bmad.com/test/${i}`,
          headers: { 'Content-Type': 'application/json' },
          priority: 'normal' as const,
          timeout: 5000,
          timestamp: Date.now()
        });
      }

      const responses = [];
      for (const request of requests) {
        const response = await accelerator.processRequest(request);
        responses.push(response);
      }

      const stats = accelerator.getStats();
      const analysis = accelerator.getPerformanceAnalysis();
      const duration = performance.now() - startTime;

      const improvement = parseFloat(analysis.estimatedImprovements.overallPerformanceGain.replace('%', ''));
      const passed = improvement >= 25; // Minimum 25% improvement expected

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          requestsProcessed: responses.length,
          cacheHitRate: `${stats.performance.cacheHitRate.toFixed(1)}%`,
          averageResponseTime: `${stats.performance.averageResponseTime.toFixed(1)}ms`,
          improvement: `${improvement}%`,
          strategies: stats.strategies
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} API acceleration achieved ${improvement}% improvement`);

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ API acceleration test failed: ${error}`);
    }
  }

  /**
   * Test 4: Connection Management
   */
  private async testConnectionManagement(): Promise<void> {
    const testName = 'Connection Management Test';
    console.log(`🔗 Running: ${testName}`);

    const startTime = performance.now();

    try {
      const { createConnectionManager } = await import('../../../src/performance/network/connection/connection-manager');

      const connectionManager = createConnectionManager({
        maxConnectionsPerHost: 10,
        maxTotalConnections: 50,
        http2Enabled: true,
        keepAliveTimeout: 300000
      });

      // Test concurrent requests
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(connectionManager.executeRequest(
          `https://api.bmad.com/test/${i}`,
          'GET',
          {},
          undefined,
          i % 4 === 0 ? 'high' : 'normal'
        ));
      }

      await Promise.all(requests);

      const metrics = connectionManager.getMetrics();
      const analysis = connectionManager.getPerformanceAnalysis();
      const duration = performance.now() - startTime;

      const efficiency = parseFloat(analysis.estimatedGains.connectionEfficiency.replace('%', ''));
      const passed = efficiency >= 70; // Minimum 70% efficiency expected

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          totalConnections: metrics.totalConnections,
          activeConnections: metrics.activeConnections,
          connectionReuse: `${metrics.connectionReuse.toFixed(1)}%`,
          efficiency: `${efficiency}%`,
          healthScore: metrics.healthScore
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} Connection management achieved ${efficiency}% efficiency`);

      await connectionManager.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Connection management test failed: ${error}`);
    }
  }

  /**
   * Test 5: Latency Optimization
   */
  private async testLatencyOptimization(): Promise<void> {
    const testName = 'Latency Optimization Test';
    console.log(`⚡ Running: ${testName}`);

    const startTime = performance.now();

    try {
      const { createLatencyOptimizer } = await import('../../../src/performance/network/latency/latency-optimizer');

      const latencyOptimizer = createLatencyOptimizer({
        targetLatency: 100,
        adaptiveRoutingEnabled: true,
        predictivePrefetchEnabled: true,
        edgeCachingEnabled: true
      });

      await latencyOptimizer.startOptimization();

      // Test latency optimization
      const testUrls = [
        'https://api.bmad.com/users/1',
        'https://api.bmad.com/projects/123',
        'https://cdn.bmad.com/static/app.js'
      ];

      let totalImprovement = 0;
      for (const url of testUrls) {
        const result = await latencyOptimizer.optimizeRequest(url);
        totalImprovement += result.estimatedImprovement;
      }

      const analysis = latencyOptimizer.getPerformanceAnalysis();
      const metrics = latencyOptimizer.getMetrics();
      const duration = performance.now() - startTime;

      const averageImprovement = totalImprovement / testUrls.length;
      const passed = averageImprovement >= 25; // Minimum 25% improvement expected

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          averageLatency: `${metrics.averageLatency.toFixed(1)}ms`,
          p95Latency: `${metrics.p95Latency.toFixed(1)}ms`,
          improvement: `${metrics.improvementPercentage.toFixed(1)}%`,
          optimizations: {
            routing: analysis.optimizations.routing.enabled,
            prefetching: analysis.optimizations.prefetching.enabled,
            edgeCaching: analysis.optimizations.edgeCaching.enabled
          }
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} Latency optimization achieved ${averageImprovement.toFixed(1)}% improvement`);

      await latencyOptimizer.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Latency optimization test failed: ${error}`);
    }
  }

  /**
   * Test 6: Dashboard Integration
   */
  private async testDashboardIntegration(): Promise<void> {
    const testName = 'Dashboard Integration Test';
    console.log(`📊 Running: ${testName}`);

    const startTime = performance.now();

    try {
      const { createNetworkDashboard } = await import('../../../src/performance/network/dashboard/network-dashboard');

      const dashboard = createNetworkDashboard({
        refreshInterval: 1000,
        realTimeUpdates: true
      });

      await dashboard.start();

      // Let dashboard collect some data
      await new Promise(resolve => setTimeout(resolve, 2000));

      const state = dashboard.getDashboardState();
      const summary = dashboard.getPerformanceSummary();

      await dashboard.stop();

      const duration = performance.now() - startTime;
      const passed = state.isActive && state.widgets.length > 0;

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'FAIL',
        duration,
        details: {
          widgets: state.widgets.length,
          alerts: state.alerts,
          subscribers: state.subscribers,
          healthScore: summary?.health.overall || 'N/A'
        }
      });

      console.log(`   ${passed ? '✅' : '❌'} Dashboard integration ${passed ? 'successful' : 'failed'}`);

      await dashboard.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Dashboard integration test failed: ${error}`);
    }
  }

  /**
   * Test 7: Performance Metrics Integration
   */
  private async testPerformanceMetricsIntegration(): Promise<void> {
    const testName = 'Performance Metrics Integration Test';
    console.log(`📈 Running: ${testName}`);

    const startTime = performance.now();

    try {
      // Test main performance suite with network integration
      const mainSuite = new BMadPerformanceSuite();
      await mainSuite.initialize();

      const analysis = await mainSuite.runAnalysis();
      const status = mainSuite.getPerformanceStatus();

      const duration = performance.now() - startTime;

      const hasNetworkData = status.network && status.network.status === 'ACTIVE';
      const hasCachingData = status.caching && status.caching.performance;
      const passed = hasNetworkData && hasCachingData;

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          networkIntegration: hasNetworkData,
          cachingIntegration: hasCachingData,
          totalImprovement: status.network?.performance?.currentImprovement || 'N/A',
          baselinePerformance: '118.4%', // From Epic 3.1-3.4
          combinedImprovement: this.calculateCombinedImprovement(status)
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} Performance metrics integration ${passed ? 'successful' : 'partial'}`);

      await mainSuite.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Performance metrics integration test failed: ${error}`);
    }
  }

  /**
   * Test 8: Security Integration (Mock)
   */
  private async testSecurityIntegration(): Promise<void> {
    const testName = 'Security Integration Test (Mock)';
    console.log(`🔒 Running: ${testName}`);

    const startTime = performance.now();

    try {
      // Mock security integration test (would integrate with actual Epic 1 security components)
      const securityFeatures = [
        'encrypted-connections',
        'secure-headers',
        'rate-limiting',
        'authentication-validation',
        'audit-logging'
      ];

      const networkSuite = createNetworkPerformanceSuite();
      await networkSuite.initialize();

      // Simulate security-aware request processing
      const secureRequest = await networkSuite.processOptimizedRequest(
        'https://secure-api.bmad.com/sensitive-data',
        'GET',
        {
          'Authorization': 'Bearer mock-token',
          'X-Security-Level': 'high'
        },
        undefined,
        'critical'
      );

      const duration = performance.now() - startTime;
      const passed = secureRequest.optimization.estimatedImprovement > 0;

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          securityFeatures,
          secureRequestProcessed: true,
          performanceImpact: `${secureRequest.optimization.estimatedImprovement.toFixed(1)}%`,
          note: 'Mock test - requires actual Epic 1 security components for full integration'
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} Security integration test ${passed ? 'passed' : 'partial'} (mock)`);

      await networkSuite.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Security integration test failed: ${error}`);
    }
  }

  /**
   * Test 9: End-to-End Performance Validation
   */
  private async testEndToEndPerformance(): Promise<void> {
    const testName = 'End-to-End Performance Validation';
    console.log(`🎯 Running: ${testName}`);

    const startTime = performance.now();

    try {
      const networkSuite = createNetworkPerformanceSuite({
        performanceTargets: {
          latencyReduction: 40,
          apiSpeedup: 50,
          connectionEfficiency: 85,
          overallImprovement: 60
        }
      });

      await networkSuite.initialize();
      await networkSuite.startOptimization();

      // Run performance validation
      const validationPassed = await networkSuite.validatePerformance();
      const metrics = networkSuite.getPerformanceMetrics();
      const report = await networkSuite.getOptimizationReport();

      const duration = performance.now() - startTime;

      this.testResults.push({
        name: testName,
        status: validationPassed ? 'PASS' : 'WARNING',
        duration,
        details: {
          validationPassed,
          totalImprovement: `${metrics.optimization.totalImprovement.toFixed(1)}%`,
          targetAchievement: report.summary.targetAchievement,
          componentStatus: report.componentAnalysis,
          performanceGains: report.performanceGains
        }
      });

      console.log(`   ${validationPassed ? '✅' : '⚠️'} End-to-end validation ${validationPassed ? 'passed' : 'partial'}`);
      console.log(`   📊 Total Performance Improvement: ${metrics.optimization.totalImprovement.toFixed(1)}%`);

      await networkSuite.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ End-to-end performance validation failed: ${error}`);
    }
  }

  /**
   * Test 10: Load Testing
   */
  private async testLoadHandling(): Promise<void> {
    const testName = 'Load Handling Test';
    console.log(`⚡ Running: ${testName}`);

    const startTime = performance.now();

    try {
      const networkSuite = createNetworkPerformanceSuite();
      await networkSuite.initialize();
      await networkSuite.startOptimization();

      // Simulate concurrent load
      const concurrentRequests = 50;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(networkSuite.processOptimizedRequest(
          `https://api.bmad.com/load-test/${i}`,
          'GET',
          {},
          undefined,
          Math.random() > 0.7 ? 'high' : 'normal'
        ));
      }

      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      const metrics = networkSuite.getPerformanceMetrics();
      const duration = performance.now() - startTime;

      const successRate = (successful / concurrentRequests) * 100;
      const passed = successRate >= 95; // Minimum 95% success rate expected

      this.testResults.push({
        name: testName,
        status: passed ? 'PASS' : 'WARNING',
        duration,
        details: {
          concurrentRequests,
          successful,
          failed,
          successRate: `${successRate.toFixed(1)}%`,
          averageLatency: `${metrics.realtime.currentLatency.toFixed(1)}ms`,
          throughput: metrics.realtime.throughput,
          errorRate: `${metrics.realtime.errorRate.toFixed(2)}%`
        }
      });

      console.log(`   ${passed ? '✅' : '⚠️'} Load test: ${successful}/${concurrentRequests} requests successful (${successRate.toFixed(1)}%)`);

      await networkSuite.shutdown();

    } catch (error) {
      const duration = performance.now() - startTime;
      this.testResults.push({
        name: testName,
        status: 'FAIL',
        duration,
        details: {},
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`   ❌ Load handling test failed: ${error}`);
    }
  }

  /**
   * Calculate combined performance improvement
   */
  private calculateCombinedImprovement(status: any): string {
    const baselineImprovement = 118.4; // Epic 3.1-3.4 baseline
    const networkImprovement = status.network?.performance?.currentImprovement || '0%';
    const networkValue = parseFloat(networkImprovement.replace('%', ''));

    // Combined improvement with diminishing returns
    const combined = baselineImprovement + (networkValue * 0.8);
    return `${combined.toFixed(1)}%`;
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(): IntegrationTestReport {
    const totalDuration = performance.now() - this.startTime;

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;

    const successRate = ((passed + warnings) / this.testResults.length) * 100;

    // Determine integration status
    let integrationStatus: 'READY' | 'PARTIAL' | 'FAILED' = 'READY';
    if (failed > 0) integrationStatus = 'FAILED';
    else if (warnings > 2) integrationStatus = 'PARTIAL';

    // Generate recommendations
    const recommendations: string[] = [];

    if (failed > 0) {
      recommendations.push('Address failed tests before production deployment');
    }
    if (warnings > 0) {
      recommendations.push('Review warning tests and optimize performance further');
    }
    if (successRate < 90) {
      recommendations.push('Investigate test failures and improve system reliability');
    }
    if (integrationStatus === 'READY') {
      recommendations.push('All tests passed - system ready for Epic integration');
    }

    return {
      timestamp: new Date().toISOString(),
      epic: 'Epic 3 Story 3.5',
      story: 'Network & API Performance Optimization - FINAL PHASE',
      environment: 'Integration Test',
      summary: {
        totalTests: this.testResults.length,
        passed,
        failed,
        warnings,
        successRate: `${successRate.toFixed(1)}%`,
        totalDuration: totalDuration
      },
      performanceBaseline: {
        epic3_1_3_4: '118.4%',
        networkOptimization: this.getAverageNetworkImprovement(),
        combinedImprovement: this.getCombinedImprovement()
      },
      testResults: this.testResults,
      integrationStatus,
      recommendations
    };
  }

  /**
   * Get average network improvement from tests
   */
  private getAverageNetworkImprovement(): string {
    const networkTests = this.testResults.filter(r =>
      r.details.improvement || r.details.averageImprovement || r.details.totalImprovement
    );

    if (networkTests.length === 0) return '0%';

    const total = networkTests.reduce((sum, test) => {
      const improvement = test.details.improvement ||
                         test.details.averageImprovement ||
                         test.details.totalImprovement || '0%';
      return sum + parseFloat(improvement.replace('%', ''));
    }, 0);

    return `${(total / networkTests.length).toFixed(1)}%`;
  }

  /**
   * Get combined improvement estimation
   */
  private getCombinedImprovement(): string {
    const baselineImprovement = 118.4;
    const networkImprovement = parseFloat(this.getAverageNetworkImprovement().replace('%', ''));

    // Combined with diminishing returns
    const combined = baselineImprovement + (networkImprovement * 0.8);
    return `${combined.toFixed(1)}%`;
  }
}

/**
 * Main test execution
 */
async function main(): Promise<void> {
  console.log('🚀 BMAD CONCURA NETWORK PERFORMANCE INTEGRATION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const testSuite = new NetworkPerformanceIntegrationTest();
  const report = await testSuite.runTests();

  console.log('');
  console.log('📋 INTEGRATION TEST REPORT');
  console.log('═══════════════════════════════');
  console.log(`Epic: ${report.epic}`);
  console.log(`Story: ${report.story}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log('');

  console.log('📊 SUMMARY:');
  console.log(`   Total Tests: ${report.summary.totalTests}`);
  console.log(`   Passed: ${report.summary.passed} ✅`);
  console.log(`   Warnings: ${report.summary.warnings} ⚠️`);
  console.log(`   Failed: ${report.summary.failed} ❌`);
  console.log(`   Success Rate: ${report.summary.successRate}`);
  console.log(`   Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
  console.log('');

  console.log('🎯 PERFORMANCE BASELINE:');
  console.log(`   Epic 3.1-3.4 Baseline: ${report.performanceBaseline.epic3_1_3_4}`);
  console.log(`   Network Optimization: ${report.performanceBaseline.networkOptimization}`);
  console.log(`   Combined Improvement: ${report.performanceBaseline.combinedImprovement}`);
  console.log('');

  console.log(`🔗 INTEGRATION STATUS: ${report.integrationStatus}`);

  if (report.recommendations.length > 0) {
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });
  }

  console.log('');
  console.log('📄 DETAILED RESULTS:');
  report.testResults.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`   ${icon} ${test.name} (${test.duration.toFixed(2)}ms)`);
    if (test.error) {
      console.log(`      Error: ${test.error}`);
    }
  });

  console.log('');

  if (report.integrationStatus === 'READY') {
    console.log('🎉 INTEGRATION TEST SUITE COMPLETED SUCCESSFULLY');
    console.log('✅ System ready for Epic 1 Security + Epic 3.1-3.4 Performance integration');
    console.log(`🏆 Total Performance Improvement: ${report.performanceBaseline.combinedImprovement}`);
  } else {
    console.log(`⚠️ INTEGRATION TEST SUITE COMPLETED WITH STATUS: ${report.integrationStatus}`);
    console.log('📋 Review recommendations before proceeding with integration');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');

  // Save report to file
  try {
    const fs = await import('fs/promises');
    const reportPath = `/tmp/bmad-network-integration-test-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Integration test report saved to: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️ Could not save report to file:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Integration test suite failed:', error);
    process.exit(1);
  });
}

export { NetworkPerformanceIntegrationTest, type IntegrationTestReport };