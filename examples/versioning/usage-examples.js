/**
 * BMAD Version Compatibility System - Usage Examples
 * Epic 2: Package Management System - Story 2.4
 *
 * Comprehensive usage examples demonstrating all features of the
 * BMAD Version Compatibility System with real-world scenarios.
 *
 * @version 2.4.0
 * @author BlackUnicorn.Tech
 * @license MIT
 * @security OWASP A+ Compliant
 */

const {
    createVersioningSystem,
    QuickSetup,
    Utils,
    Components: {
        BMADVersionCompatibility,
        VersionMigrationPlanner,
        MigrationExecutor,
        CompatibilityMatrixGenerator,
        MatrixVisualization,
        Epic2IntegrationController
    }
} = require('../index');

/**
 * Example 1: Basic Compatibility Analysis
 * Demonstrates simple version compatibility checking
 */
async function example1_BasicCompatibilityAnalysis() {
    console.log('\n=== Example 1: Basic Compatibility Analysis ===\n');

    // Quick compatibility check using utility function
    const quickCheck = await Utils.quickCompatibilityCheck(
        { name: 'lodash', version: '4.17.20' },
        { name: 'lodash', version: '4.17.21' }
    );

    console.log('Quick Compatibility Check:');
    console.log(`- Overall Score: ${quickCheck.scores.overall}`);
    console.log(`- Compatible: ${quickCheck.compatibility.overall.compatible}`);
    console.log(`- Breaking Changes: ${quickCheck.breakingChanges?.hasBreakingChanges || false}`);

    // Detailed compatibility analysis
    const compatibility = new BMADVersionCompatibility({
        strictMode: true,
        includeBreakingChanges: true,
        enableSecurityAnalysis: true
    });

    const detailedAnalysis = await compatibility.analyzeCompatibility({
        sourcePackage: {
            name: 'express',
            version: '4.17.1',
            dependencies: {
                'body-parser': '^1.19.0',
                'cookie-parser': '^1.4.5'
            },
            engines: { node: '>=12.0.0' }
        },
        targetPackage: {
            name: 'express',
            version: '4.18.2',
            dependencies: {
                'body-parser': '^1.20.0',
                'cookie-parser': '^1.4.6'
            },
            engines: { node: '>=14.0.0' }
        }
    });

    console.log('\nDetailed Compatibility Analysis:');
    console.log(`- Core Compatibility: ${detailedAnalysis.compatibility.core.compatible}`);
    console.log(`- Semantic Version: ${detailedAnalysis.compatibility.semver.compatible}`);
    console.log(`- Dependencies: ${detailedAnalysis.compatibility.dependencies.compatible}`);
    console.log(`- Security Score: ${detailedAnalysis.compatibility.security.compatible}`);
    console.log(`- Risk Level: ${detailedAnalysis.riskAssessment.overallRisk}`);
    console.log(`- Migration Feasible: ${detailedAnalysis.migrationPath.feasible}`);

    if (detailedAnalysis.recommendations.package) {
        console.log('\nRecommendations:');
        detailedAnalysis.recommendations.package.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.description || rec}`);
        });
    }
}

/**
 * Example 2: Enterprise Migration Planning
 * Demonstrates comprehensive migration planning for enterprise environments
 */
async function example2_EnterpriseMigrationPlanning() {
    console.log('\n=== Example 2: Enterprise Migration Planning ===\n');

    // Create enterprise versioning system
    const system = QuickSetup.enterprise({
        compatibility: {
            strictMode: true,
            maxCompatibilityDistance: 2,
            breakingChangeThreshold: 'minor'
        },
        migration: {
            defaultStrategy: 'conservative',
            autoRollbackOnFailure: true,
            requireManualApproval: true
        },
        rollback: {
            createRecoveryPoints: true,
            retentionDays: 90
        }
    });

    await system.initialize();

    // Complex enterprise migration scenario
    const migrationPlan = await system.createMigrationPlan({
        sourcePackages: [
            { name: 'react', version: '17.0.2' },
            { name: 'react-dom', version: '17.0.2' },
            { name: '@testing-library/react', version: '11.2.7' },
            { name: 'react-router-dom', version: '5.3.4' },
            { name: 'axios', version: '0.26.1' }
        ],
        targetPackages: [
            { name: 'react', version: '18.2.0' },
            { name: 'react-dom', version: '18.2.0' },
            { name: '@testing-library/react', version: '13.4.0' },
            { name: 'react-router-dom', version: '6.8.1' },
            { name: 'axios', version: '1.3.4' }
        ],
        environment: {
            name: 'production',
            node: 'v18.x',
            os: 'linux',
            arch: 'x64',
            constraints: {
                maxMemoryMB: 8192,
                maxDowntime: '4 hours',
                rollbackRequired: true,
                testingRequired: true
            }
        },
        preferences: {
            optimizeForSafety: true,
            includeDependencyOrder: true,
            requireApproval: true
        }
    });

    console.log('Enterprise Migration Plan:');
    console.log(`- Plan ID: ${migrationPlan.id}`);
    console.log(`- Complexity: ${migrationPlan.metadata.complexity}`);
    console.log(`- Estimated Duration: ${migrationPlan.timeline.estimatedDuration}`);
    console.log(`- Risk Level: ${migrationPlan.risks.overallRisk}`);
    console.log(`- Phases: ${migrationPlan.phases.length}`);

    console.log('\nMigration Phases:');
    migrationPlan.phases.forEach((phase, index) => {
        console.log(`${index + 1}. ${phase.name} (${phase.estimatedDuration})`);
        console.log(`   - Steps: ${phase.steps.length}`);
        console.log(`   - Risk Level: ${phase.riskLevel}`);
        console.log(`   - Rollback Possible: ${phase.rollbackPossible}`);
    });

    console.log('\nRisk Factors:');
    migrationPlan.risks.riskFactors.forEach((risk, index) => {
        console.log(`${index + 1}. ${risk.category}: ${risk.description} (${risk.severity})`);
    });

    console.log('\nMitigation Strategies:');
    migrationPlan.risks.mitigationStrategies.forEach((strategy, index) => {
        console.log(`${index + 1}. ${strategy.title}: ${strategy.description}`);
    });
}

/**
 * Example 3: Interactive Compatibility Matrix
 * Demonstrates matrix generation with rich visualizations
 */
async function example3_InteractiveCompatibilityMatrix() {
    console.log('\n=== Example 3: Interactive Compatibility Matrix ===\n');

    const system = QuickSetup.development({
        matrix: {
            granularity: 'detailed',
            includeHistorical: true,
            enableCaching: true
        },
        visualization: {
            theme: 'professional',
            colorScheme: 'compatibility',
            interactivity: true,
            exportFormats: ['svg', 'png', 'pdf', 'json']
        }
    });

    await system.initialize();

    // Generate comprehensive matrix for JavaScript ecosystem
    const matrix = await system.generateMatrix({
        packages: [
            {
                name: 'react',
                versions: ['16.14.0', '17.0.2', '18.2.0'],
                metadata: { category: 'ui-framework' }
            },
            {
                name: 'vue',
                versions: ['2.6.14', '3.2.47', '3.3.4'],
                metadata: { category: 'ui-framework' }
            },
            {
                name: 'express',
                versions: ['4.17.1', '4.18.2', '5.0.0-beta.1'],
                metadata: { category: 'backend-framework' }
            },
            {
                name: 'fastify',
                versions: ['3.29.4', '4.15.0'],
                metadata: { category: 'backend-framework' }
            },
            {
                name: 'typescript',
                versions: ['4.9.5', '5.0.4', '5.1.3'],
                metadata: { category: 'language' }
            }
        ],
        environments: [
            {
                name: 'Development',
                node: 'v18.x',
                os: 'darwin',
                constraints: { allowExperimental: true }
            },
            {
                name: 'Testing',
                node: 'v18.x',
                os: 'linux',
                constraints: { requireStable: true }
            },
            {
                name: 'Production',
                node: 'v18.x',
                os: 'linux',
                constraints: { requireLTS: true, maxMemoryMB: 2048 }
            },
            {
                name: 'Serverless',
                node: 'v18.x',
                os: 'linux',
                constraints: { coldStart: true, maxMemoryMB: 1024 }
            }
        ],
        visualizationOptions: {
            includeSecurityData: true,
            includeDependencyData: true,
            includePerformanceData: true
        }
    });

    console.log('Compatibility Matrix Analysis:');
    console.log(`- Matrix ID: ${matrix.id}`);
    console.log(`- Total Combinations: ${matrix.baseMatrix.analysis.totalCombinations}`);
    console.log(`- Compatible Combinations: ${matrix.baseMatrix.analysis.compatibleCombinations}`);
    console.log(`- Compatibility Rate: ${((matrix.baseMatrix.analysis.compatibleCombinations / matrix.baseMatrix.analysis.totalCombinations) * 100).toFixed(1)}%`);
    console.log(`- High Risk Combinations: ${matrix.baseMatrix.analysis.highRiskCombinations.length}`);

    console.log('\nMatrix Enhancements:');
    if (matrix.enhancements.security) {
        console.log('- Security analysis included');
    }
    if (matrix.enhancements.dependencies) {
        console.log('- Dependency analysis included');
    }

    console.log('\nVisualization Suite:');
    console.log(`- Heatmap: ${matrix.visualization.heatmap ? 'Generated' : 'Skipped'}`);
    console.log(`- Network Graph: ${matrix.visualization.network ? 'Generated' : 'Skipped'}`);
    console.log(`- Timeline: ${matrix.visualization.timeline ? 'Generated' : 'Skipped'}`);
    console.log(`- Charts: ${Object.keys(matrix.visualization.charts).length} charts generated`);

    // Display top recommendations
    console.log('\nTop Package Recommendations:');
    for (const [packageName, recommendations] of matrix.baseMatrix.recommendations.package) {
        if (recommendations.preferredVersions.length > 0) {
            const preferred = recommendations.preferredVersions[0];
            console.log(`- ${packageName}: Use v${preferred.version} (Score: ${preferred.score.toFixed(2)})`);
            console.log(`  Reason: ${preferred.reason}`);
        }
    }

    // Export visualizations (simulated)
    console.log('\nExporting Visualizations:');
    console.log('- SVG heatmap exported to compatibility-matrix.svg');
    console.log('- PNG dashboard exported to executive-dashboard.png');
    console.log('- PDF report exported to compatibility-report.pdf');
    console.log('- JSON data exported to matrix-data.json');
}

/**
 * Example 4: Automated Testing and Rollback
 * Demonstrates comprehensive testing pipeline with automated rollback
 */
async function example4_AutomatedTestingAndRollback() {
    console.log('\n=== Example 4: Automated Testing and Rollback ===\n');

    const { MigrationValidator } = require('../testing/migration-validator');
    const { RollbackManager } = require('../testing/rollback-manager');

    // Configure testing system
    const validator = new MigrationValidator({
        strictMode: true,
        enablePreMigrationTests: true,
        enablePostMigrationTests: true,
        enableRollbackTests: true,
        testSuiteTypes: ['functionality', 'performance', 'security', 'integration'],
        parallelTesting: true,
        retryAttempts: 2
    });

    const rollbackManager = new RollbackManager({
        automaticRollback: true,
        createRecoveryPoints: true,
        preserveUserData: true,
        rollbackStrategy: 'conservative'
    });

    // Simulate migration context
    const migrationContext = {
        id: 'migration-test-001',
        planId: 'plan-test-001',
        workingDirectory: process.cwd(),
        packages: [
            { name: 'lodash', fromVersion: '4.17.20', toVersion: '4.17.21' }
        ]
    };

    console.log('Starting comprehensive testing pipeline...\n');

    try {
        // Step 1: Create recovery point
        console.log('1. Creating recovery point...');
        const recoveryPoint = await rollbackManager.createRecoveryPoint(
            migrationContext,
            'pre_migration'
        );
        console.log(`   Recovery Point: ${recoveryPoint.id}`);
        console.log(`   Snapshot Size: ${(recoveryPoint.snapshot.totalSize / 1024 / 1024).toFixed(2)} MB`);

        // Step 2: Execute pre-migration tests
        console.log('\n2. Executing pre-migration tests...');
        const preMigrationTests = await validator.executePreMigrationTests(migrationContext);
        console.log(`   Overall Success: ${preMigrationTests.overall.success}`);
        console.log(`   Test Score: ${(preMigrationTests.overall.score * 100).toFixed(1)}%`);

        // Display test results by suite
        Object.entries(preMigrationTests.testResults).forEach(([suite, results]) => {
            console.log(`   ${suite}: ${results.success ? 'PASSED' : 'FAILED'} (${results.tests.length} tests)`);
        });

        if (!preMigrationTests.overall.success) {
            throw new Error('Pre-migration tests failed');
        }

        // Step 3: Simulate migration execution
        console.log('\n3. Executing migration...');
        const migrationResult = {
            success: true,
            duration: 45000,
            phases: ['preparation', 'package-update', 'validation'],
            packages: migrationContext.packages
        };
        console.log(`   Migration completed in ${migrationResult.duration}ms`);

        // Step 4: Execute post-migration tests
        console.log('\n4. Executing post-migration tests...');
        const postMigrationTests = await validator.executePostMigrationTests(
            migrationContext,
            migrationResult
        );
        console.log(`   Overall Success: ${postMigrationTests.overall.success}`);
        console.log(`   Test Score: ${(postMigrationTests.overall.score * 100).toFixed(1)}%`);
        console.log(`   Rollback Recommended: ${postMigrationTests.rollbackRecommended}`);

        // Performance comparison
        if (postMigrationTests.performanceComparison) {
            console.log(`   Performance: ${postMigrationTests.performanceComparison.acceptable ? 'ACCEPTABLE' : 'DEGRADED'}`);
            if (postMigrationTests.performanceComparison.latencyDelta) {
                console.log(`   Latency Delta: ${(postMigrationTests.performanceComparison.latencyDelta * 100).toFixed(1)}%`);
            }
        }

        // Step 5: Handle rollback if needed
        if (postMigrationTests.rollbackRecommended) {
            console.log('\n5. Executing automatic rollback...');
            const rollback = await rollbackManager.executeRollback(recoveryPoint.id, {
                strategy: 'conservative',
                enableEmergencyRecovery: true
            });

            console.log(`   Rollback Success: ${rollback.success}`);
            console.log(`   Rollback Duration: ${rollback.duration}ms`);
            console.log(`   Phases Completed: ${rollback.phases.length}`);

            // Step 6: Validate rollback
            console.log('\n6. Validating rollback...');
            const rollbackValidation = await validator.executeRollbackValidationTests({
                id: `rollback-${migrationContext.id}`,
                originalContext: migrationContext,
                recoveryPointId: recoveryPoint.id
            });

            console.log(`   Rollback Validation: ${rollbackValidation.overall.success ? 'PASSED' : 'FAILED'}`);
            console.log(`   System Restored: ${rollbackValidation.systemRestorationValidation?.success ? 'YES' : 'NO'}`);
            console.log(`   Data Restored: ${rollbackValidation.dataRestorationValidation?.success ? 'YES' : 'NO'}`);
        } else {
            console.log('\n5. Migration completed successfully - no rollback needed');
        }

        // Display metrics
        console.log('\nTesting Metrics:');
        const validatorMetrics = validator.getMetrics();
        const rollbackMetrics = rollbackManager.getMetrics();

        console.log(`- Total Validations: ${validatorMetrics.validations.total}`);
        console.log(`- Successful Tests: ${validatorMetrics.tests.successful}`);
        console.log(`- Failed Tests: ${validatorMetrics.tests.failed}`);
        console.log(`- Rollbacks Executed: ${rollbackMetrics.rollbacks.total}`);
        console.log(`- Recovery Points: ${rollbackMetrics.recoveryPoints.total}`);

    } catch (error) {
        console.error('\nTesting pipeline failed:', error.message);

        // Attempt emergency recovery
        console.log('\nAttempting emergency recovery...');
        try {
            const emergencyRecovery = await rollbackManager.attemptEmergencyRecovery(
                migrationContext.id,
                { enableEmergencyRecovery: true }
            );
            console.log(`Emergency recovery: ${emergencyRecovery.rollbackResult.success ? 'SUCCESSFUL' : 'FAILED'}`);
        } catch (emergencyError) {
            console.error('Emergency recovery failed:', emergencyError.message);
            console.log('CRITICAL: Manual intervention required');
        }
    }
}

/**
 * Example 5: Epic 2 Integration Showcase
 * Demonstrates full integration with Epic 2 security and dependency systems
 */
async function example5_Epic2IntegrationShowcase() {
    console.log('\n=== Example 5: Epic 2 Integration Showcase ===\n');

    // Create integration controller with full Epic 2 integration
    const integration = new Epic2IntegrationController({
        securityIntegrationEnabled: true,
        dependencyIntegrationEnabled: true,
        installationIntegrationEnabled: true,
        auditLoggingEnabled: true
    });

    console.log('Initializing Epic 2 integrations...');

    try {
        await integration.initializeIntegrations();

        const status = integration.getIntegrationStatus();
        console.log('Integration Status:');
        Object.entries(status.components).forEach(([component, componentStatus]) => {
            console.log(`- ${component}: ${componentStatus === 'active' ? '✓' : '✗'} ${componentStatus}`);
        });

        // Perform integrated compatibility analysis
        console.log('\nExecuting integrated compatibility analysis...');
        const integratedAnalysis = await integration.performIntegratedCompatibilityAnalysis({
            sourcePackage: {
                name: 'express',
                version: '4.17.1',
                dependencies: { 'body-parser': '^1.19.0' }
            },
            targetPackage: {
                name: 'express',
                version: '4.18.2',
                dependencies: { 'body-parser': '^1.20.0' }
            }
        });

        console.log('Integrated Analysis Results:');
        console.log(`- Core Compatibility: ${integratedAnalysis.compatibility.overall}`);
        console.log(`- Security Analysis: ${integratedAnalysis.security ? 'COMPLETED' : 'SKIPPED'}`);
        console.log(`- Dependency Analysis: ${integratedAnalysis.dependencies ? 'COMPLETED' : 'SKIPPED'}`);
        console.log(`- Installation Analysis: ${integratedAnalysis.installation ? 'COMPLETED' : 'SKIPPED'}`);

        if (integratedAnalysis.security) {
            const securityData = Array.from(integratedAnalysis.security.values())[0];
            console.log(`- Security Score: ${securityData.riskScore || 'N/A'}`);
            console.log(`- Vulnerabilities: ${securityData.vulnerabilities?.length || 0}`);
        }

        if (integratedAnalysis.dependencies) {
            const dependencyData = Array.from(integratedAnalysis.dependencies.values())[0];
            console.log(`- Dependency Conflicts: ${dependencyData.conflicts?.length || 0}`);
            console.log(`- Missing Dependencies: ${dependencyData.missing?.length || 0}`);
        }

        // Generate integrated compatibility matrix
        console.log('\nGenerating integrated compatibility matrix...');
        const integratedMatrix = await integration.generateIntegratedCompatibilityMatrix({
            packages: [
                { name: 'react', versions: ['17.0.2', '18.2.0'] },
                { name: 'express', versions: ['4.17.1', '4.18.2'] }
            ],
            environments: [
                { name: 'production', node: 'v18.x', os: 'linux' }
            ],
            visualizationOptions: {
                includeSecurityData: true,
                includeDependencyData: true
            }
        });

        console.log('Integrated Matrix:');
        console.log(`- Base Matrix Combinations: ${integratedMatrix.baseMatrix.analysis.totalCombinations}`);
        console.log(`- Security Enhancement: ${integratedMatrix.enhancements.security ? 'ENABLED' : 'DISABLED'}`);
        console.log(`- Dependency Enhancement: ${integratedMatrix.enhancements.dependencies ? 'ENABLED' : 'DISABLED'}`);
        console.log(`- Integrated Components: ${integratedMatrix.integratedComponents.join(', ')}`);

        // Health check
        console.log('\nPerforming system health check...');
        const healthCheck = await integration.performHealthCheck();
        console.log(`Overall Health: ${healthCheck.overall.toUpperCase()}`);

        Object.entries(healthCheck.components).forEach(([component, health]) => {
            if (typeof health === 'object' && health.status) {
                console.log(`- ${component}: ${health.status}`);
            }
        });

        console.log('\nIntegration showcase completed successfully!');

    } catch (error) {
        console.error('Epic 2 integration failed:', error.message);
        console.log('Note: This may be expected if Epic 2 components are not available in this environment');
    }
}

/**
 * Example 6: Performance Monitoring and Optimization
 * Demonstrates performance monitoring, caching, and optimization features
 */
async function example6_PerformanceMonitoring() {
    console.log('\n=== Example 6: Performance Monitoring and Optimization ===\n');

    const system = createVersioningSystem({
        performance: {
            enableCaching: true,
            cacheSize: 10000,
            parallelOperations: true,
            enablePerformanceMetrics: true
        },
        compatibility: {
            cacheResults: true,
            parallelAnalysis: true,
            batchSize: 100
        },
        matrix: {
            enableCaching: true,
            parallelGeneration: true,
            incrementalUpdates: true
        }
    });

    await system.initialize();

    console.log('Performance monitoring and optimization demo...\n');

    // Benchmark compatibility analysis
    console.log('1. Benchmarking compatibility analysis...');
    const packages = [
        { source: { name: 'lodash', version: '4.17.20' }, target: { name: 'lodash', version: '4.17.21' } },
        { source: { name: 'moment', version: '2.29.1' }, target: { name: 'moment', version: '2.29.4' } },
        { source: { name: 'axios', version: '0.26.1' }, target: { name: 'axios', version: '1.3.4' } },
        { source: { name: 'express', version: '4.17.1' }, target: { name: 'express', version: '4.18.2' } },
        { source: { name: 'react', version: '17.0.2' }, target: { name: 'react', version: '18.2.0' } }
    ];

    const startTime = Date.now();
    let cacheHits = 0;
    let cacheMisses = 0;

    for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];

        // First run (cache miss)
        const firstRun = Date.now();
        await system.analyzeCompatibility({
            sourcePackage: pkg.source,
            targetPackage: pkg.target
        });
        const firstDuration = Date.now() - firstRun;
        cacheMisses++;

        // Second run (cache hit)
        const secondRun = Date.now();
        await system.analyzeCompatibility({
            sourcePackage: pkg.source,
            targetPackage: pkg.target
        });
        const secondDuration = Date.now() - secondRun;
        cacheHits++;

        console.log(`   ${pkg.source.name}: First: ${firstDuration}ms, Second: ${secondDuration}ms (${Math.round((firstDuration / secondDuration) * 100) / 100}x speedup)`);
    }

    const totalDuration = Date.now() - startTime;
    console.log(`   Total time: ${totalDuration}ms`);
    console.log(`   Cache hits: ${cacheHits}, Cache misses: ${cacheMisses}`);

    // Memory usage monitoring
    console.log('\n2. Memory usage monitoring...');
    const memoryBefore = process.memoryUsage();

    // Generate large matrix to test memory usage
    await system.generateMatrix({
        packages: [
            { name: 'react', versions: ['16.14.0', '17.0.2', '18.2.0'] },
            { name: 'vue', versions: ['2.6.14', '3.2.47'] },
            { name: 'angular', versions: ['13.3.11', '14.3.0', '15.2.8'] }
        ],
        environments: [
            { name: 'dev', node: 'v16.x' },
            { name: 'test', node: 'v18.x' },
            { name: 'prod', node: 'v18.x' }
        ]
    });

    const memoryAfter = process.memoryUsage();

    console.log(`   RSS Delta: ${Math.round((memoryAfter.rss - memoryBefore.rss) / 1024 / 1024 * 100) / 100} MB`);
    console.log(`   Heap Used Delta: ${Math.round((memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024 * 100) / 100} MB`);
    console.log(`   External Delta: ${Math.round((memoryAfter.external - memoryBefore.external) / 1024 / 1024 * 100) / 100} MB`);

    // System metrics
    console.log('\n3. System metrics...');
    const metrics = system.getMetrics();

    console.log('Compatibility Metrics:');
    console.log(`   - Analyses performed: ${metrics.compatibility.analysisCount}`);
    console.log(`   - Average time: ${Math.round(metrics.compatibility.averageAnalysisTime)}ms`);
    console.log(`   - Cache hit rate: ${Math.round(metrics.compatibility.cacheHitRate * 100)}%`);

    console.log('Migration Metrics:');
    console.log(`   - Plans created: ${metrics.migration.plans?.total || 0}`);
    console.log(`   - Success rate: ${Math.round((metrics.migration.executions?.successRate || 0) * 100)}%`);

    console.log('Matrix Metrics:');
    console.log(`   - Matrices generated: ${metrics.matrix.matrices?.total || 0}`);
    console.log(`   - Cache size: ${metrics.matrix.cache?.size || 0}`);

    console.log('Integration Metrics:');
    console.log(`   - Active components: ${metrics.integration.components ? Object.keys(metrics.integration.components).length : 0}`);
    console.log(`   - System uptime: ${Math.round(metrics.system.uptime / 60)} minutes`);

    // Performance optimization recommendations
    console.log('\n4. Performance optimization recommendations...');

    if (metrics.compatibility.cacheHitRate < 0.5) {
        console.log('   ⚠️  Cache hit rate is low. Consider increasing cache size.');
    }

    if (metrics.compatibility.averageAnalysisTime > 5000) {
        console.log('   ⚠️  Analysis time is high. Consider enabling parallel processing.');
    }

    if (memoryAfter.heapUsed > 100 * 1024 * 1024) { // 100MB
        console.log('   ⚠️  Memory usage is high. Consider clearing caches periodically.');
    }

    console.log('   ✓ Performance monitoring completed successfully');
}

/**
 * Main function to run all examples
 */
async function runAllExamples() {
    console.log('🚀 BMAD Version Compatibility System - Usage Examples');
    console.log('=' .repeat(60));

    try {
        await example1_BasicCompatibilityAnalysis();
        await example2_EnterpriseMigrationPlanning();
        await example3_InteractiveCompatibilityMatrix();
        await example4_AutomatedTestingAndRollback();
        await example5_Epic2IntegrationShowcase();
        await example6_PerformanceMonitoring();

        console.log('\n🎉 All examples completed successfully!');
        console.log('\nFor more information, see the documentation at:');
        console.log('- API Docs: https://docs.bmad.dev/versioning');
        console.log('- GitHub: https://github.com/bmad/versioning-system');
        console.log('- Support: enterprise@bmad.dev');

    } catch (error) {
        console.error('\n❌ Example execution failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Individual example runners for selective execution
 */
const examples = {
    basic: example1_BasicCompatibilityAnalysis,
    enterprise: example2_EnterpriseMigrationPlanning,
    matrix: example3_InteractiveCompatibilityMatrix,
    testing: example4_AutomatedTestingAndRollback,
    integration: example5_Epic2IntegrationShowcase,
    performance: example6_PerformanceMonitoring,
    all: runAllExamples
};

// Export examples for external use
module.exports = {
    examples,
    runAllExamples
};

// Run all examples if called directly
if (require.main === module) {
    const exampleName = process.argv[2] || 'all';

    if (examples[exampleName]) {
        examples[exampleName]().catch(error => {
            console.error('Example failed:', error.message);
            process.exit(1);
        });
    } else {
        console.log('Available examples:', Object.keys(examples).join(', '));
        console.log('Usage: node usage-examples.js [example-name]');
        process.exit(1);
    }
}