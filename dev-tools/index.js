#!/usr/bin/env node
/**
 * BMAD CYBER2 Test Suite Entry Point
 * Main entry point for running all test categories
 */

const { spawn } = require('child_process');
const path = require('path');
const { TEST_CONFIG, initializeTestEnvironment } = require('./config');

// Initialize test environment
initializeTestEnvironment();

class BMadTestRunner {
  constructor() {
    this.results = {
      unit: { status: 'pending', output: '' },
      integration: { status: 'pending', output: '' },
      benchmarks: { status: 'pending', output: '' },
      validators: { status: 'pending', output: '' }
    };
  }

  async runAllTests() {
    console.log('🧪 BMAD CYBER2 Comprehensive Test Suite');
    console.log('═'.repeat(60));
    console.log('Running all test categories in sequence...\n');

    try {
      // Run unit tests
      console.log('📋 Running Unit Tests...');
      await this.runTestCategory('unit');

      // Run integration tests
      console.log('\n🔗 Running Integration Tests...');
      await this.runTestCategory('integration');

      // Run benchmarks
      console.log('\n⚡ Running Performance Benchmarks...');
      await this.runTestCategory('benchmarks');

      // Run validators
      console.log('\n✅ Running Validation Tests...');
      await this.runTestCategory('validators');

      // Generate summary
      this.generateTestSummary();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runTestCategory(category) {
    return new Promise((resolve, reject) => {
      let command, args;

      switch (category) {
        case 'unit':
          command = 'npm';
          args = ['run', 'test:unit'];
          break;
        case 'integration':
          command = 'npm';
          args = ['run', 'test:integration'];
          break;
        case 'benchmarks':
          command = 'npm';
          args = ['run', 'test:benchmarks'];
          break;
        case 'validators':
          command = 'npm';
          args = ['run', 'test:validators'];
          break;
        default:
          reject(new Error(`Unknown test category: ${category}`));
          return;
      }

      const testProcess = spawn(command, args, {
        stdio: 'pipe',
        cwd: TEST_CONFIG.ROOT_PATH
      });

      let output = '';

      testProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        process.stdout.write(chunk);
      });

      testProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        process.stderr.write(chunk);
      });

      testProcess.on('close', (code) => {
        this.results[category] = {
          status: code === 0 ? 'passed' : 'failed',
          output: output,
          exitCode: code
        };

        if (code === 0) {
          console.log(`✅ ${category} tests completed successfully`);
          resolve();
        } else {
          console.log(`❌ ${category} tests failed with exit code ${code}`);
          resolve(); // Continue with other tests even if one fails
        }
      });

      testProcess.on('error', (error) => {
        this.results[category] = {
          status: 'error',
          output: error.message,
          error: error
        };
        console.log(`❌ ${category} tests encountered error: ${error.message}`);
        resolve(); // Continue with other tests
      });
    });
  }

  generateTestSummary() {
    console.log('\n📊 TEST SUITE SUMMARY');
    console.log('═'.repeat(40));

    const categories = Object.keys(this.results);
    const passed = categories.filter(cat => this.results[cat].status === 'passed');
    const failed = categories.filter(cat => this.results[cat].status === 'failed');
    const errors = categories.filter(cat => this.results[cat].status === 'error');

    categories.forEach(category => {
      const result = this.results[category];
      const icon = result.status === 'passed' ? '✅' :
                   result.status === 'failed' ? '❌' : '⚠️';
      console.log(`${icon} ${category.padEnd(15)} ${result.status.toUpperCase()}`);
    });

    console.log('\n📈 Results:');
    console.log(`   Passed: ${passed.length}/${categories.length}`);
    console.log(`   Failed: ${failed.length}/${categories.length}`);
    console.log(`   Errors: ${errors.length}/${categories.length}`);

    const overallSuccess = failed.length === 0 && errors.length === 0;
    console.log(`\n${overallSuccess ? '✅' : '❌'} Overall: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    const runner = new BMadTestRunner();
    runner.runAllTests().catch(console.error);
  } else {
    console.log('Usage: node test/index.js');
    console.log('Use npm run test:* commands for specific test categories');
  }
}

module.exports = BMadTestRunner;