#!/usr/bin/env node
/**
 * BMAD Version Compatibility System Validation
 * Simple validation script without external dependencies
 */

const path = require('path');
const fs = require('fs');

// Test harness
class ValidationTest {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async run(name, testFn) {
        this.results.total++;
        try {
            await testFn();
            console.log(`✅ ${name}`);
            this.results.passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            this.results.failed++;
        }
    }

    summary() {
        console.log('\n📊 Validation Summary:');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);

        if (this.results.failed === 0) {
            console.log('\n🎉 All validations passed! System is ready for production.');
        } else {
            console.log('\n⚠️ Some validations failed. Please review and fix issues.');
        }
    }
}

async function validateSystem() {
    console.log('🔍 BMAD Version Compatibility System Validation\n');

    const test = new ValidationTest();

    // Test 1: Module loading
    await test.run('Module loading', async () => {
        const { createVersioningSystem, QuickSetup, Utils } = require('./index.js');
        if (!createVersioningSystem || !QuickSetup || !Utils) {
            throw new Error('Failed to load main exports');
        }
    });

    // Test 2: System initialization
    await test.run('System initialization', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();

        const initResult = await system.initialize();
        if (!initResult.success) {
            throw new Error('System initialization failed');
        }
    });

    // Test 3: Quick setup presets
    await test.run('Quick setup presets', async () => {
        const { QuickSetup } = require('./index.js');

        // Test enterprise setup
        const enterprise = QuickSetup.enterprise();
        await enterprise.initialize();

        // Test development setup
        const development = QuickSetup.development();
        await development.initialize();

        // Test basic setup
        const basic = QuickSetup.basic();
        await basic.initialize();
    });

    // Test 4: Compatibility analysis
    await test.run('Compatibility analysis', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();
        await system.initialize();

        const result = await system.analyzeCompatibility({
            sourcePackage: { name: 'test-package', version: '1.0.0' },
            targetPackage: { name: 'test-package', version: '2.0.0' },
            analysisType: 'comprehensive'
        });

        if (!result.compatibility) {
            throw new Error('Compatibility analysis failed');
        }
    });

    // Test 5: Migration planning
    await test.run('Migration planning', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();
        await system.initialize();

        const plan = await system.createMigrationPlan({
            sourcePackages: [{ name: 'test-package', version: '1.0.0' }],
            targetPackages: [{ name: 'test-package', version: '2.0.0' }],
            strategy: 'conservative'
        });

        if (!plan.planId || !plan.phases) {
            throw new Error('Migration planning failed');
        }
    });

    // Test 6: Matrix generation
    await test.run('Matrix generation', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();
        await system.initialize();

        const matrix = await system.generateMatrix({
            packages: [
                { name: 'package-a', version: '1.0.0' },
                { name: 'package-b', version: '2.0.0' }
            ],
            environments: ['node@18', 'node@20']
        });

        if (!matrix.matrixId || !matrix.compatibility) {
            throw new Error('Matrix generation failed');
        }
    });

    // Test 7: Visualization creation
    await test.run('Visualization creation', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();
        await system.initialize();

        // Generate a matrix first
        const matrix = await system.generateMatrix({
            packages: [
                { name: 'package-a', version: '1.0.0' },
                { name: 'package-b', version: '2.0.0' }
            ],
            environments: ['node@18', 'node@20']
        });

        const visualization = await system.createVisualization(matrix, {
            format: 'svg',
            theme: 'default'
        });

        if (!visualization.visualizations) {
            throw new Error('Visualization creation failed');
        }
    });

    // Test 8: Health check
    await test.run('Health check', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();
        await system.initialize();

        const health = await system.healthCheck();
        if (!health.overall || !health.components) {
            throw new Error('Health check failed');
        }
    });

    // Test 9: Metrics collection
    await test.run('Metrics collection', async () => {
        const { createVersioningSystem } = require('./index.js');
        const system = createVersioningSystem();
        await system.initialize();

        const metrics = system.getMetrics();
        if (!metrics.system || !metrics.compatibility) {
            throw new Error('Metrics collection failed');
        }
    });

    // Test 10: Utility functions
    await test.run('Utility functions', async () => {
        const { Utils } = require('./index.js');

        const quickCheck = await Utils.quickCompatibilityCheck(
            { name: 'test-package', version: '1.0.0' },
            { name: 'test-package', version: '1.1.0' }
        );

        if (!quickCheck.compatible) {
            throw new Error('Quick compatibility check failed');
        }
    });

    test.summary();
    return test.results.failed === 0;
}

// Run validation
if (require.main === module) {
    validateSystem()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Validation Error:', error.message);
            process.exit(1);
        });
}

module.exports = { validateSystem };