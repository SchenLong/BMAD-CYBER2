/**
 * BMAD Version Compatibility System - Integration Tests
 * Epic 2: Package Management System - Story 2.4
 *
 * Comprehensive integration tests validating the complete system
 * with all components working together.
 *
 * @version 2.4.0
 * @author BMAD Development Team
 * @license MIT
 * @security OWASP A+ Compliant
 */

const { describe, it, beforeEach, afterEach, expect } = require('jest');
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

describe('BMAD Version Compatibility System - Integration Tests', () => {
    let system;
    let testContext;

    beforeEach(async () => {
        // Create test system with minimal external dependencies
        system = createVersioningSystem({
            enableSecurityIntegration: false, // Disable for testing
            enableDependencyIntegration: false,
            enableInstallationIntegration: false,
            enableAuditLogging: false,
            compatibility: {
                cacheResults: false, // Disable caching for consistent test results
                strictMode: true
            },
            migration: {
                defaultStrategy: 'conservative',
                autoRollbackOnFailure: false // Manual control in tests
            }
        });

        await system.initialize();

        testContext = {
            packages: {
                simple: {
                    source: { name: 'lodash', version: '4.17.20' },
                    target: { name: 'lodash', version: '4.17.21' }
                },
                complex: {
                    source: {
                        name: 'express',
                        version: '4.17.1',
                        dependencies: { 'body-parser': '^1.19.0' }
                    },
                    target: {
                        name: 'express',
                        version: '4.18.2',
                        dependencies: { 'body-parser': '^1.20.0' }
                    }
                },
                breaking: {
                    source: { name: 'react', version: '17.0.2' },
                    target: { name: 'react', version: '18.2.0' }
                }
            }
        };
    });

    afterEach(async () => {
        if (system && system.integrationController) {
            // Cleanup any active operations
            system.integrationController.state.activeOperations.clear();
            system.integrationController.components.migrationPlanner.state.activeMigrations.clear();
        }
    });

    describe('Core System Integration', () => {
        it('should initialize system with all components', async () => {
            const status = system.getSystemStatus();

            expect(status).toBeDefined();
            expect(status.version).toBe('2.4.0');
            expect(status.components).toBeDefined();
        });

        it('should provide health check for all components', async () => {
            const health = await system.healthCheck();

            expect(health.overall).toMatch(/healthy|degraded/);
            expect(health.components).toBeDefined();
            expect(health.components.compatibility).toBeDefined();
            expect(health.components.migrationPlanner).toBeDefined();
            expect(health.components.migrationExecutor).toBeDefined();
            expect(health.components.matrixGenerator).toBeDefined();
            expect(health.components.visualization).toBeDefined();
        });

        it('should collect comprehensive metrics', () => {
            const metrics = system.getMetrics();

            expect(metrics.system).toBeDefined();
            expect(metrics.system.version).toBe('2.4.0');
            expect(metrics.compatibility).toBeDefined();
            expect(metrics.migration).toBeDefined();
            expect(metrics.execution).toBeDefined();
            expect(metrics.matrix).toBeDefined();
            expect(metrics.visualization).toBeDefined();
        });
    });

    describe('Compatibility Analysis Integration', () => {
        it('should analyze simple package compatibility', async () => {
            const result = await system.analyzeCompatibility(testContext.packages.simple);

            expect(result).toBeDefined();
            expect(result.compatibility).toBeDefined();
            expect(result.compatibility.overall.compatible).toBe(true);
            expect(result.scores.overall).toBeGreaterThan(0.5);
            expect(result.metadata.analysisVersion).toBe('2.4.0');
        });

        it('should analyze complex package with dependencies', async () => {
            const result = await system.analyzeCompatibility(testContext.packages.complex);

            expect(result).toBeDefined();
            expect(result.compatibility.dependencies).toBeDefined();
            expect(result.compatibility.dependencies.compatible).toBeDefined();
            expect(result.migrationPath).toBeDefined();
            expect(result.riskAssessment).toBeDefined();
        });

        it('should detect breaking changes in major version upgrades', async () => {
            const result = await system.analyzeCompatibility(testContext.packages.breaking);

            expect(result).toBeDefined();
            expect(result.breakingChanges).toBeDefined();
            expect(result.breakingChanges.hasBreakingChanges).toBe(true);
            expect(result.riskAssessment.overallRisk).toMatch(/medium|high/);
        });

        it('should generate consistent recommendations', async () => {
            const result = await system.analyzeCompatibility(testContext.packages.complex);

            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations.package) ||
                   result.recommendations.package instanceof Map).toBe(true);
        });
    });

    describe('Migration Planning Integration', () => {
        it('should create migration plan for simple upgrade', async () => {
            const plan = await system.createMigrationPlan({
                sourcePackages: [testContext.packages.simple.source],
                targetPackages: [testContext.packages.simple.target]
            });

            expect(plan).toBeDefined();
            expect(plan.id).toBeDefined();
            expect(plan.phases).toBeDefined();
            expect(plan.phases.length).toBeGreaterThan(0);
            expect(plan.timeline).toBeDefined();
            expect(plan.risks).toBeDefined();
            expect(plan.metadata.complexity).toBeDefined();
        });

        it('should create migration plan for complex multi-package upgrade', async () => {
            const plan = await system.createMigrationPlan({
                sourcePackages: [
                    testContext.packages.simple.source,
                    testContext.packages.complex.source
                ],
                targetPackages: [
                    testContext.packages.simple.target,
                    testContext.packages.complex.target
                ]
            });

            expect(plan).toBeDefined();
            expect(plan.phases.length).toBeGreaterThan(2); // Should have multiple phases
            expect(plan.metadata.complexity).toMatch(/low|medium|high/);
            expect(plan.timeline.estimatedDuration).toBeDefined();
        });

        it('should assess risks appropriately for different migration types', async () => {
            const simplePlan = await system.createMigrationPlan({
                sourcePackages: [testContext.packages.simple.source],
                targetPackages: [testContext.packages.simple.target]
            });

            const breakingPlan = await system.createMigrationPlan({
                sourcePackages: [testContext.packages.breaking.source],
                targetPackages: [testContext.packages.breaking.target]
            });

            expect(simplePlan.risks.overallRisk).toMatch(/low|medium/);
            expect(breakingPlan.risks.overallRisk).toMatch(/medium|high/);
            expect(breakingPlan.risks.riskFactors.length).toBeGreaterThan(
                simplePlan.risks.riskFactors.length
            );
        });
    });

    describe('Matrix Generation Integration', () => {
        it('should generate compatibility matrix', async () => {
            const matrix = await system.generateMatrix({
                packages: [
                    { name: 'lodash', versions: ['4.17.20', '4.17.21'] },
                    { name: 'express', versions: ['4.17.1', '4.18.2'] }
                ],
                environments: [
                    { name: 'development', node: 'v18.x' },
                    { name: 'production', node: 'v18.x' }
                ]
            });

            expect(matrix).toBeDefined();
            expect(matrix.baseMatrix).toBeDefined();
            expect(matrix.baseMatrix.analysis.totalCombinations).toBeGreaterThan(0);
            expect(matrix.baseMatrix.analysis.compatibleCombinations).toBeGreaterThan(0);
        });

        it('should include visualization data when requested', async () => {
            const matrix = await system.generateMatrix({
                packages: [
                    { name: 'lodash', versions: ['4.17.20', '4.17.21'] }
                ],
                environments: [
                    { name: 'test', node: 'v18.x' }
                ],
                visualizationOptions: {
                    includeSecurityData: false,
                    includeDependencyData: false
                }
            });

            expect(matrix.visualization).toBeDefined();
            expect(matrix.visualization.heatmap).toBeDefined();
            expect(matrix.visualization.charts).toBeDefined();
        });
    });

    describe('Visualization Integration', () => {
        it('should create visualization suite for matrix data', async () => {
            const matrix = await system.generateMatrix({
                packages: [
                    { name: 'react', versions: ['17.0.2', '18.2.0'] }
                ],
                environments: [
                    { name: 'test', node: 'v18.x' }
                ]
            });

            const visualization = await system.createVisualization(matrix.baseMatrix, {
                theme: 'professional',
                includeInteractive: false // Simplify for testing
            });

            expect(visualization).toBeDefined();
            expect(visualization.heatmap).toBeDefined();
            expect(visualization.charts).toBeDefined();
            expect(visualization.metadata.chartCount).toBeGreaterThan(0);
        });
    });

    describe('End-to-End Migration Workflow', () => {
        it('should complete full migration workflow without errors', async () => {
            // Step 1: Analyze compatibility
            const analysis = await system.analyzeCompatibility(testContext.packages.simple);
            expect(analysis.compatibility.overall.compatible).toBe(true);

            // Step 2: Create migration plan
            const plan = await system.createMigrationPlan({
                sourcePackages: [testContext.packages.simple.source],
                targetPackages: [testContext.packages.simple.target]
            });
            expect(plan.id).toBeDefined();

            // Step 3: Validate plan structure
            expect(plan.phases).toBeDefined();
            expect(plan.phases.length).toBeGreaterThan(0);
            expect(plan.risks).toBeDefined();
            expect(plan.timeline).toBeDefined();

            // Step 4: Check migration feasibility
            expect(plan.analysis.compatibility.environmentCompatible).toBe(true);
            expect(plan.metadata.complexity).toMatch(/low|medium|high/);

            // Note: We don't execute the migration in tests to avoid side effects
            // but we validate the plan structure is complete
            console.log(`Migration plan created: ${plan.phases.length} phases, ${plan.timeline.estimatedDuration}`);
        });

        it('should handle complex multi-package migration workflow', async () => {
            // Create complex migration scenario
            const packages = [
                testContext.packages.simple,
                testContext.packages.complex
            ];

            // Analyze each package
            const analyses = [];
            for (const pkg of packages) {
                const analysis = await system.analyzeCompatibility(pkg);
                analyses.push(analysis);
                expect(analysis).toBeDefined();
            }

            // Create comprehensive migration plan
            const plan = await system.createMigrationPlan({
                sourcePackages: packages.map(p => p.source),
                targetPackages: packages.map(p => p.target),
                environment: {
                    node: 'v18.x',
                    os: 'linux'
                }
            });

            expect(plan).toBeDefined();
            expect(plan.phases.length).toBeGreaterThanOrEqual(3); // prep, migration, validation
            expect(plan.analysis.scope.packageCount).toBe(packages.length);

            // Validate risk assessment considers all packages
            expect(plan.risks.riskFactors.length).toBeGreaterThan(0);
            expect(plan.risks.mitigationStrategies.length).toBeGreaterThan(0);

            console.log(`Complex migration: ${packages.length} packages, ${plan.phases.length} phases`);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle invalid package specifications gracefully', async () => {
            await expect(system.analyzeCompatibility({
                sourcePackage: { name: '', version: 'invalid' },
                targetPackage: { name: 'test', version: 'also-invalid' }
            })).rejects.toThrow();
        });

        it('should handle missing package data gracefully', async () => {
            await expect(system.analyzeCompatibility({
                sourcePackage: null,
                targetPackage: { name: 'test', version: '1.0.0' }
            })).rejects.toThrow();
        });

        it('should validate migration plan requirements', async () => {
            await expect(system.createMigrationPlan({
                sourcePackages: [],
                targetPackages: []
            })).rejects.toThrow();
        });

        it('should handle matrix generation with invalid parameters', async () => {
            await expect(system.generateMatrix({
                packages: [],
                environments: []
            })).rejects.toThrow();
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle multiple concurrent compatibility analyses', async () => {
            const analysisPromises = [];
            const testCases = [
                testContext.packages.simple,
                testContext.packages.complex,
                testContext.packages.breaking
            ];

            for (const testCase of testCases) {
                analysisPromises.push(system.analyzeCompatibility(testCase));
            }

            const results = await Promise.all(analysisPromises);

            expect(results).toHaveLength(testCases.length);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.compatibility).toBeDefined();
            });
        });

        it('should maintain performance within acceptable limits', async () => {
            const startTime = Date.now();

            const result = await system.analyzeCompatibility(testContext.packages.complex);

            const duration = Date.now() - startTime;

            expect(result).toBeDefined();
            expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

            console.log(`Analysis completed in ${duration}ms`);
        });
    });

    describe('Component Isolation and Independence', () => {
        it('should allow individual component usage', async () => {
            const compatibility = new BMADVersionCompatibility();
            const result = await compatibility.analyzeCompatibility(testContext.packages.simple);

            expect(result).toBeDefined();
            expect(result.compatibility.overall.compatible).toBe(true);
        });

        it('should allow migration planner standalone usage', async () => {
            const planner = new VersionMigrationPlanner();
            const plan = await planner.createMigrationPlan({
                sourcePackages: [testContext.packages.simple.source],
                targetPackages: [testContext.packages.simple.target]
            });

            expect(plan).toBeDefined();
            expect(plan.phases.length).toBeGreaterThan(0);
        });

        it('should allow matrix generator standalone usage', async () => {
            const generator = new CompatibilityMatrixGenerator();
            const matrix = await generator.generateMatrix({
                packages: [
                    { name: 'test', versions: ['1.0.0', '2.0.0'] }
                ],
                environments: [
                    { name: 'test', node: 'v18.x' }
                ]
            });

            expect(matrix).toBeDefined();
            expect(matrix.analysis.totalCombinations).toBeGreaterThan(0);
        });
    });

    describe('Configuration and Customization', () => {
        it('should respect configuration options', async () => {
            const customSystem = createVersioningSystem({
                compatibility: {
                    strictMode: false,
                    includePrerelease: true
                },
                migration: {
                    defaultStrategy: 'aggressive'
                }
            });

            await customSystem.initialize();

            const status = customSystem.getSystemStatus();
            expect(status).toBeDefined();

            // Test that the system works with custom config
            const result = await customSystem.analyzeCompatibility(testContext.packages.simple);
            expect(result).toBeDefined();
        });

        it('should support quick setup presets', async () => {
            const enterpriseSystem = QuickSetup.enterprise({
                enableSecurityIntegration: false // Disable for testing
            });

            await enterpriseSystem.initialize();

            const devSystem = QuickSetup.development({
                enableSecurityIntegration: false // Disable for testing
            });

            await devSystem.initialize();

            const basicSystem = QuickSetup.basic();
            await basicSystem.initialize();

            // All systems should be functional
            expect(enterpriseSystem.getSystemStatus()).toBeDefined();
            expect(devSystem.getSystemStatus()).toBeDefined();
            expect(basicSystem.getSystemStatus()).toBeDefined();
        });
    });
});

describe('Utility Functions Integration', () => {
    it('should provide working utility functions', async () => {
        const quickResult = await Utils.quickCompatibilityCheck(
            { name: 'lodash', version: '4.17.20' },
            { name: 'lodash', version: '4.17.21' }
        );

        expect(quickResult).toBeDefined();
        expect(quickResult.compatibility.overall.compatible).toBe(true);
    });

    it('should generate simple migration steps', async () => {
        const steps = await Utils.generateSimpleMigrationSteps(
            { name: 'lodash', version: '4.17.20' },
            { name: 'lodash', version: '4.17.21' }
        );

        expect(Array.isArray(steps)).toBe(true);
        expect(steps.length).toBeGreaterThan(0);
    });

    it('should create basic compatibility matrix', async () => {
        const matrix = await Utils.createBasicMatrix(
            [{ name: 'test', versions: ['1.0.0'] }],
            [{ name: 'test-env', node: 'v18.x' }]
        );

        expect(matrix).toBeDefined();
        expect(matrix.analysis.totalCombinations).toBeGreaterThan(0);
    });
});