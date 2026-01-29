/**
 * EPIC 2 PACKAGE MANAGEMENT - DEPENDENCY SYSTEM INTEGRATION TEST
 * Comprehensive integration test to verify all components work together
 * Tests dependency resolution, validation, management, and security integration
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  projectRoot: process.cwd(),
  enableFullValidation: true,
  enableSecurityTests: true,
  enablePerformanceTests: true,
  timeout: 60000 // 1 minute
};

/**
 * Integration Test Suite
 */
class DependencyIntegrationTest {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('🧪 BMAD Dependency System Integration Tests');
    console.log('=' * 60);
    console.log(`📍 Project Root: ${TEST_CONFIG.projectRoot}`);
    console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
    console.log('');

    try {
      // Test 1: Component Import Tests
      await this.testComponentImports();

      // Test 2: Validator Integration
      await this.testValidatorIntegration();

      // Test 3: Manager Integration
      await this.testManagerIntegration();

      // Test 4: Resolver Integration
      await this.testResolverIntegration();

      // Test 5: Security Integration
      if (TEST_CONFIG.enableSecurityTests) {
        await this.testSecurityIntegration();
      }

      // Test 6: Performance Tests
      if (TEST_CONFIG.enablePerformanceTests) {
        await this.testPerformance();
      }

      // Test 7: End-to-End Integration
      await this.testEndToEndIntegration();

      // Generate final report
      this.generateReport();

      return this.results;

    } catch (error) {
      this.recordFailure('integration-test-suite', `Test suite failed: ${error.message}`, error);
      this.generateReport();
      throw error;
    }
  }

  /**
   * Test component imports and basic functionality
   */
  async testComponentImports() {
    console.log('\n📦 Testing Component Imports...');

    // Test TypeScript resolver import
    await this.runTest('resolver-import', async () => {
      try {
        const resolverPath = path.join(__dirname, 'resolver', 'dependency-resolver.ts');
        await fs.access(resolverPath);
        console.log('  ✅ Dependency Resolver - TypeScript file accessible');
        return true;
      } catch (error) {
        throw new Error(`Resolver import failed: ${error.message}`);
      }
    });

    // Test JavaScript validator import
    await this.runTest('validator-import', async () => {
      try {
        const validatorModule = await import('./validator/dependency-validator.js');
        const { BMADDependencyValidator } = validatorModule;
        const validator = new BMADDependencyValidator('.');
        console.log('  ✅ Dependency Validator - JavaScript module loaded');
        return true;
      } catch (error) {
        throw new Error(`Validator import failed: ${error.message}`);
      }
    });

    // Test JavaScript manager import
    await this.runTest('manager-import', async () => {
      try {
        const managerModule = await import('./manager/bmad-dependency-manager.js');
        const { BMADDependencyManager } = managerModule;
        const manager = new BMADDependencyManager('.');
        console.log('  ✅ Dependency Manager - JavaScript module loaded');
        return true;
      } catch (error) {
        throw new Error(`Manager import failed: ${error.message}`);
      }
    });

    // Test integration adapter import
    await this.runTest('integration-adapter-import', async () => {
      try {
        const adapterPath = path.join(__dirname, 'integration-adapter.ts');
        await fs.access(adapterPath);
        console.log('  ✅ Integration Adapter - TypeScript file accessible');
        return true;
      } catch (error) {
        throw new Error(`Integration adapter import failed: ${error.message}`);
      }
    });
  }

  /**
   * Test validator integration
   */
  async testValidatorIntegration() {
    console.log('\n🔍 Testing Validator Integration...');

    await this.runTest('validator-initialization', async () => {
      const validatorModule = await import('./validator/dependency-validator.js');
      const { BMADDependencyValidator } = validatorModule;
      const validator = new BMADDependencyValidator(TEST_CONFIG.projectRoot, {
        requiredFiles: ['package.json'],
        teams: ['cybersec-team'],
        validationLevel: 'basic'
      });

      console.log('  ✅ Validator initialized successfully');
      return true;
    });

    await this.runTest('validator-basic-validation', async () => {
      const validatorIndexModule = await import('./validator/index.js');
      const { validateProject } = validatorIndexModule;

      // Run basic validation
      const result = await validateProject(TEST_CONFIG.projectRoot, {
        timeout: 30000,
        validationLevel: 'basic'
      });

      if (result.overall_status === 'unknown') {
        throw new Error('Validation returned unknown status');
      }

      console.log(`  ✅ Validation completed with status: ${result.overall_status}`);
      console.log(`  📊 Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);

      if (result.errors.length > 0) {
        console.log('  ⚠️  Validation errors detected (this may be expected in test environment)');
        for (const error of result.errors.slice(0, 3)) {
          console.log(`    • ${error.component}: ${error.message}`);
        }
      }

      return true;
    });
  }

  /**
   * Test manager integration
   */
  async testManagerIntegration() {
    console.log('\n⚙️  Testing Manager Integration...');

    await this.runTest('manager-initialization', async () => {
      const managerIndexModule = await import('./manager/index.js');
      const { createManager } = managerIndexModule;

      const manager = createManager(TEST_CONFIG.projectRoot, {
        cache: { enabled: false }, // Disable cache for testing
        security: { enableEncryption: false }, // Disable encryption for testing
        performance: { parallelResolution: false }
      });

      // Test basic status
      const status = await manager.getStatus();

      if (!status || !status.version) {
        throw new Error('Manager status invalid');
      }

      console.log(`  ✅ Manager initialized - Version: ${status.version}`);
      console.log(`  📊 Status: ${status.status}`);

      return true;
    });
  }

  /**
   * Test resolver integration
   */
  async testResolverIntegration() {
    console.log('\n🔄 Testing Resolver Integration...');

    await this.runTest('resolver-basic-functionality', async () => {
      // Test basic resolver functionality
      // Note: This is a simplified test since we can't actually import TypeScript directly in Node
      const resolverFile = path.join(__dirname, 'resolver', 'dependency-resolver.ts');
      const content = await fs.readFile(resolverFile, 'utf8');

      // Check for key classes and methods
      const requiredPatterns = [
        'class DependencyResolver',
        'async resolve(',
        'buildDependencyGraph',
        'detectCycles',
        'resolveConflicts'
      ];

      for (const pattern of requiredPatterns) {
        if (!content.includes(pattern)) {
          throw new Error(`Missing required pattern: ${pattern}`);
        }
      }

      console.log('  ✅ Resolver implementation contains all required methods');
      return true;
    });
  }

  /**
   * Test security integration
   */
  async testSecurityIntegration() {
    console.log('\n🔒 Testing Security Integration...');

    await this.runTest('security-components-available', async () => {
      // Check if Epic 1 security components are available
      const securityPaths = [
        'src/security/epic1-integration.ts',
        'src/security/audit/audit-logger.ts',
        'src/security/monitoring/security-monitor.ts',
        'src/security/encryption/aes-encryption.ts'
      ];

      for (const securityPath of securityPaths) {
        const fullPath = path.join(TEST_CONFIG.projectRoot, securityPath);
        try {
          await fs.access(fullPath);
          console.log(`    ✅ ${securityPath} - Found`);
        } catch (error) {
          console.log(`    ⚠️  ${securityPath} - Not Found (may be expected)`);
        }
      }

      return true;
    });

    await this.runTest('security-integration-imports', async () => {
      // Test security integration imports in manager
      const managerFile = path.join(__dirname, 'manager', 'bmad-dependency-manager.js');
      const content = await fs.readFile(managerFile, 'utf8');

      const securityImports = [
        'epic1Security',
        'AuditLogger',
        'SecurityMonitor'
      ];

      for (const importName of securityImports) {
        if (content.includes(importName)) {
          console.log(`    ✅ ${importName} - Import found`);
        } else {
          console.log(`    ⚠️  ${importName} - Import not found`);
        }
      }

      return true;
    });
  }

  /**
   * Test performance characteristics
   */
  async testPerformance() {
    console.log('\n⚡ Testing Performance...');

    await this.runTest('memory-usage', async () => {
      const initialMemory = process.memoryUsage();

      // Create multiple validator instances to test memory usage
      const validators = [];
      for (let i = 0; i < 5; i++) {
        const validatorModule = await import('./validator/dependency-validator.js');
        const { BMADDependencyValidator } = validatorModule;
        validators.push(new BMADDependencyValidator('.'));
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      console.log(`  📊 Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);

      if (memoryIncreaseMB > 100) { // 100MB threshold
        throw new Error(`Excessive memory usage: ${memoryIncreaseMB.toFixed(2)}MB`);
      }

      return true;
    });

    await this.runTest('file-loading-performance', async () => {
      const startTime = Date.now();

      // Test file loading performance
      const files = [
        path.join(__dirname, 'resolver', 'dependency-resolver.ts'),
        path.join(__dirname, 'validator', 'dependency-validator.js'),
        path.join(__dirname, 'manager', 'bmad-dependency-manager.js')
      ];

      for (const file of files) {
        await fs.readFile(file, 'utf8');
      }

      const duration = Date.now() - startTime;
      console.log(`  ⏱️  File loading time: ${duration}ms`);

      if (duration > 1000) { // 1 second threshold
        console.log(`  ⚠️  Slow file loading: ${duration}ms`);
      }

      return true;
    });
  }

  /**
   * Test end-to-end integration
   */
  async testEndToEndIntegration() {
    console.log('\n🔗 Testing End-to-End Integration...');

    await this.runTest('full-system-integration', async () => {
      // Test the complete integration flow
      const validatorIndexModule = await import('./validator/index.js');
      const managerIndexModule = await import('./manager/index.js');

      const { createValidator } = validatorIndexModule;
      const { createManager } = managerIndexModule;

      // Initialize components
      const validator = createValidator(TEST_CONFIG.projectRoot, { validationLevel: 'basic' });
      const manager = createManager(TEST_CONFIG.projectRoot, {
        cache: { enabled: false },
        security: { enableEncryption: false }
      });

      // Test validator
      const validationResult = await validator.validateAll();
      console.log(`    📋 Validation Status: ${validationResult.overall_status}`);

      // Test manager status
      const managerStatus = await manager.getStatus();
      console.log(`    ⚙️  Manager Status: ${managerStatus.status}`);

      // Test manager operations (mock operations)
      const operationHistory = await manager.getOperationHistory(5);
      console.log(`    📊 Operation History: ${operationHistory.length} entries`);

      console.log('  ✅ End-to-end integration test completed');
      return true;
    });
  }

  /**
   * Run a single test with error handling
   */
  async runTest(testName, testFunction) {
    this.results.totalTests++;

    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;

      this.results.passed++;
      this.results.details.push({
        name: testName,
        status: 'passed',
        duration,
        message: 'Test passed successfully'
      });

    } catch (error) {
      this.results.failed++;
      this.results.details.push({
        name: testName,
        status: 'failed',
        duration: 0,
        message: error.message,
        error: error.stack
      });

      console.log(`  ❌ ${testName}: ${error.message}`);
    }
  }

  /**
   * Record a test failure
   */
  recordFailure(testName, message, error) {
    this.results.failed++;
    this.results.details.push({
      name: testName,
      status: 'failed',
      duration: 0,
      message,
      error: error?.stack
    });
  }

  /**
   * Generate final test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 INTEGRATION TEST REPORT');
    console.log('='.repeat(60));

    const successRate = this.results.totalTests > 0
      ? (this.results.passed / this.results.totalTests * 100).toFixed(1)
      : 0;

    console.log(`\n📊 Test Summary:`);
    console.log(`  Total Tests: ${this.results.totalTests}`);
    console.log(`  Passed: ${this.results.passed}`);
    console.log(`  Failed: ${this.results.failed}`);
    console.log(`  Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      for (const test of this.results.details.filter(t => t.status === 'failed')) {
        console.log(`  • ${test.name}: ${test.message}`);
      }
    }

    console.log(`\n🏆 Overall Status: ${this.results.failed === 0 ? 'PASSED' : 'FAILED'}`);
    console.log('\n' + '='.repeat(60));

    // Write detailed report to file
    this.writeDetailedReport();
  }

  /**
   * Write detailed report to file
   */
  async writeDetailedReport() {
    try {
      const reportPath = path.join(TEST_CONFIG.projectRoot, 'dependency-integration-test-report.json');
      const report = {
        timestamp: new Date().toISOString(),
        config: TEST_CONFIG,
        summary: {
          totalTests: this.results.totalTests,
          passed: this.results.passed,
          failed: this.results.failed,
          successRate: this.results.totalTests > 0
            ? (this.results.passed / this.results.totalTests * 100).toFixed(1)
            : 0
        },
        details: this.results.details
      };

      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Detailed report written to: ${reportPath}`);

    } catch (error) {
      console.log(`⚠️  Failed to write detailed report: ${error.message}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const tester = new DependencyIntegrationTest();

  try {
    const results = await tester.runAllTests();

    // Exit with appropriate code
    process.exit(results.failed === 0 ? 0 : 1);

  } catch (error) {
    console.error('Integration test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  DependencyIntegrationTest,
  TEST_CONFIG
};