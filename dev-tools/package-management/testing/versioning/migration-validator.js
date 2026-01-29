/**
 * BMAD Migration Validator
 * Epic 2: Package Management System - Story 2.4
 *
 * Comprehensive migration testing and validation system with automated rollback,
 * pre/post migration validation, and continuous monitoring capabilities.
 *
 * @version 2.4.0
 * @author BlackUnicorn.Tech
 * @license MIT
 * @security OWASP A+ Compliant
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

/**
 * Migration Validator
 * Validates migration plans and executions with comprehensive testing
 */
class MigrationValidator extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            // Validation configuration
            validation: {
                strictMode: options.strictMode !== false,
                enablePreMigrationTests: options.enablePreMigrationTests !== false,
                enablePostMigrationTests: options.enablePostMigrationTests !== false,
                enableRollbackTests: options.enableRollbackTests !== false,
                enableContinuousValidation: options.enableContinuousValidation !== false,
                validationTimeout: options.validationTimeout || 300000 // 5 minutes
            },

            // Testing configuration
            testing: {
                testSuiteTypes: options.testSuiteTypes || [
                    'functionality',
                    'performance',
                    'security',
                    'integration',
                    'regression'
                ],
                parallelTesting: options.parallelTesting !== false,
                maxConcurrentTests: options.maxConcurrentTests || 5,
                retryAttempts: options.retryAttempts || 2,
                retryDelayMs: options.retryDelayMs || 5000
            },

            // Rollback configuration
            rollback: {
                automaticRollback: options.automaticRollback !== false,
                rollbackTriggers: options.rollbackTriggers || [
                    'validation_failure',
                    'test_failure',
                    'performance_degradation',
                    'security_violation'
                ],
                rollbackTimeout: options.rollbackTimeout || 180000, // 3 minutes
                preserveData: options.preserveData !== false
            },

            // Performance thresholds
            performance: {
                maxLatencyIncrease: options.maxLatencyIncrease || 0.2, // 20% increase
                maxMemoryIncrease: options.maxMemoryIncrease || 0.3, // 30% increase
                minSuccessRate: options.minSuccessRate || 0.95, // 95% success rate
                maxErrorRate: options.maxErrorRate || 0.05 // 5% error rate
            }
        };

        // Validation state
        this.state = {
            activeValidations: new Map(),
            validationHistory: new Map(),
            testResults: new Map(),
            performanceBaselines: new Map(),
            rollbackHistory: new Map()
        };

        // Test suite definitions
        this.testSuites = {
            functionality: {
                name: 'Functionality Tests',
                description: 'Core application functionality validation',
                priority: 'critical',
                tests: []
            },
            performance: {
                name: 'Performance Tests',
                description: 'Application performance and resource usage validation',
                priority: 'high',
                tests: []
            },
            security: {
                name: 'Security Tests',
                description: 'Security posture and vulnerability validation',
                priority: 'critical',
                tests: []
            },
            integration: {
                name: 'Integration Tests',
                description: 'Inter-component and external service integration validation',
                priority: 'high',
                tests: []
            },
            regression: {
                name: 'Regression Tests',
                description: 'Existing functionality preservation validation',
                priority: 'medium',
                tests: []
            }
        };

        // Initialize test suites
        this.initializeTestSuites();
    }

    /**
     * Initialize test suite definitions
     */
    initializeTestSuites() {
        // Functionality test templates
        this.testSuites.functionality.tests = [
            {
                id: 'package_import',
                name: 'Package Import Test',
                description: 'Verify packages can be imported successfully',
                type: 'unit',
                timeout: 30000
            },
            {
                id: 'api_endpoints',
                name: 'API Endpoint Test',
                description: 'Verify API endpoints respond correctly',
                type: 'integration',
                timeout: 60000
            },
            {
                id: 'data_persistence',
                name: 'Data Persistence Test',
                description: 'Verify data operations work correctly',
                type: 'integration',
                timeout: 45000
            },
            {
                id: 'error_handling',
                name: 'Error Handling Test',
                description: 'Verify error conditions are handled properly',
                type: 'unit',
                timeout: 30000
            }
        ];

        // Performance test templates
        this.testSuites.performance.tests = [
            {
                id: 'response_time',
                name: 'Response Time Test',
                description: 'Measure API response times',
                type: 'load',
                timeout: 120000
            },
            {
                id: 'memory_usage',
                name: 'Memory Usage Test',
                description: 'Monitor memory consumption patterns',
                type: 'resource',
                timeout: 180000
            },
            {
                id: 'cpu_utilization',
                name: 'CPU Utilization Test',
                description: 'Monitor CPU usage during operations',
                type: 'resource',
                timeout: 180000
            },
            {
                id: 'throughput',
                name: 'Throughput Test',
                description: 'Measure request processing throughput',
                type: 'load',
                timeout: 240000
            }
        ];

        // Security test templates
        this.testSuites.security.tests = [
            {
                id: 'vulnerability_scan',
                name: 'Vulnerability Scan',
                description: 'Scan for known security vulnerabilities',
                type: 'security',
                timeout: 300000
            },
            {
                id: 'authentication_test',
                name: 'Authentication Test',
                description: 'Verify authentication mechanisms',
                type: 'security',
                timeout: 60000
            },
            {
                id: 'authorization_test',
                name: 'Authorization Test',
                description: 'Verify authorization controls',
                type: 'security',
                timeout: 60000
            },
            {
                id: 'data_encryption',
                name: 'Data Encryption Test',
                description: 'Verify data encryption in transit and at rest',
                type: 'security',
                timeout: 90000
            }
        ];

        // Integration test templates
        this.testSuites.integration.tests = [
            {
                id: 'database_connectivity',
                name: 'Database Connectivity Test',
                description: 'Verify database connections work correctly',
                type: 'integration',
                timeout: 60000
            },
            {
                id: 'external_services',
                name: 'External Services Test',
                description: 'Verify external service integrations',
                type: 'integration',
                timeout: 120000
            },
            {
                id: 'inter_component',
                name: 'Inter-Component Test',
                description: 'Verify component interactions',
                type: 'integration',
                timeout: 90000
            }
        ];

        // Regression test templates
        this.testSuites.regression.tests = [
            {
                id: 'existing_functionality',
                name: 'Existing Functionality Test',
                description: 'Verify existing functionality remains intact',
                type: 'regression',
                timeout: 180000
            },
            {
                id: 'backwards_compatibility',
                name: 'Backwards Compatibility Test',
                description: 'Verify backwards compatibility is maintained',
                type: 'regression',
                timeout: 120000
            }
        ];
    }

    /**
     * Validate migration plan before execution
     * @param {Object} migrationPlan - Migration plan to validate
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Validation result
     */
    async validateMigrationPlan(migrationPlan, options = {}) {
        const validationId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            this.emit('validation:started', {
                validationId,
                planId: migrationPlan.id,
                type: 'pre_migration'
            });

            const validation = {
                id: validationId,
                planId: migrationPlan.id,
                type: 'pre_migration',
                startTime: new Date().toISOString(),
                status: 'running',
                results: {}
            };

            this.state.activeValidations.set(validationId, validation);

            // Phase 1: Plan structure validation
            validation.results.structure = await this.validatePlanStructure(migrationPlan);

            // Phase 2: Dependencies validation
            validation.results.dependencies = await this.validateDependencies(migrationPlan);

            // Phase 3: Risk assessment validation
            validation.results.risks = await this.validateRiskAssessment(migrationPlan);

            // Phase 4: Resource requirements validation
            validation.results.resources = await this.validateResourceRequirements(migrationPlan);

            // Phase 5: Security policy validation
            validation.results.security = await this.validateSecurityCompliance(migrationPlan);

            // Phase 6: Test suite validation
            validation.results.testSuites = await this.validateTestSuites(migrationPlan);

            // Calculate overall validation result
            const overallValid = this.calculateOverallValidation(validation.results);

            validation.status = 'completed';
            validation.valid = overallValid.valid;
            validation.score = overallValid.score;
            validation.issues = overallValid.issues;
            validation.recommendations = overallValid.recommendations;
            validation.completedAt = new Date().toISOString();
            validation.duration = Date.now() - startTime;

            // Store validation result
            this.state.validationHistory.set(validationId, validation);
            this.state.activeValidations.delete(validationId);

            this.emit('validation:completed', {
                validationId,
                planId: migrationPlan.id,
                valid: validation.valid,
                score: validation.score,
                duration: validation.duration
            });

            return validation;

        } catch (error) {
            const validation = this.state.activeValidations.get(validationId);
            if (validation) {
                validation.status = 'failed';
                validation.error = error.message;
                validation.completedAt = new Date().toISOString();
                validation.duration = Date.now() - startTime;
            }

            this.emit('validation:failed', {
                validationId,
                planId: migrationPlan.id,
                error: error.message,
                duration: Date.now() - startTime
            });

            throw error;
        }
    }

    /**
     * Execute pre-migration validation tests
     * @param {Object} migrationContext - Migration execution context
     * @returns {Promise<Object>} Pre-migration test results
     */
    async executePreMigrationTests(migrationContext) {
        if (!this.config.validation.enablePreMigrationTests) {
            return { skipped: true, reason: 'Pre-migration tests disabled' };
        }

        const testId = crypto.randomUUID();

        try {
            this.emit('tests:started', {
                testId,
                type: 'pre_migration',
                contextId: migrationContext.id
            });

            // Establish performance baselines
            const baselines = await this.establishPerformanceBaselines(migrationContext);
            this.state.performanceBaselines.set(migrationContext.id, baselines);

            // Execute test suites
            const testResults = await this.executeTestSuites(
                migrationContext,
                'pre_migration',
                { establishBaseline: true }
            );

            // Validate environment readiness
            const environmentValidation = await this.validateEnvironmentReadiness(migrationContext);

            const results = {
                id: testId,
                type: 'pre_migration',
                contextId: migrationContext.id,
                baselines,
                testResults,
                environmentValidation,
                overall: this.calculateOverallTestResult([testResults, environmentValidation]),
                timestamp: new Date().toISOString()
            };

            this.state.testResults.set(testId, results);

            this.emit('tests:completed', {
                testId,
                type: 'pre_migration',
                success: results.overall.success,
                score: results.overall.score
            });

            return results;

        } catch (error) {
            this.emit('tests:failed', {
                testId,
                type: 'pre_migration',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Execute post-migration validation tests
     * @param {Object} migrationContext - Migration execution context
     * @param {Object} migrationResult - Migration execution result
     * @returns {Promise<Object>} Post-migration test results
     */
    async executePostMigrationTests(migrationContext, migrationResult) {
        if (!this.config.validation.enablePostMigrationTests) {
            return { skipped: true, reason: 'Post-migration tests disabled' };
        }

        const testId = crypto.randomUUID();

        try {
            this.emit('tests:started', {
                testId,
                type: 'post_migration',
                contextId: migrationContext.id
            });

            // Execute comprehensive test suites
            const testResults = await this.executeTestSuites(
                migrationContext,
                'post_migration',
                { compareToBaseline: true }
            );

            // Performance comparison
            const performanceComparison = await this.comparePerformanceToBaseline(
                migrationContext.id,
                testResults.performance
            );

            // Functionality validation
            const functionalityValidation = await this.validatePostMigrationFunctionality(
                migrationContext,
                migrationResult
            );

            // Data integrity validation
            const dataIntegrityValidation = await this.validateDataIntegrity(migrationContext);

            // Security posture validation
            const securityValidation = await this.validateSecurityPosture(migrationContext);

            const results = {
                id: testId,
                type: 'post_migration',
                contextId: migrationContext.id,
                testResults,
                performanceComparison,
                functionalityValidation,
                dataIntegrityValidation,
                securityValidation,
                overall: this.calculateOverallTestResult([
                    testResults,
                    performanceComparison,
                    functionalityValidation,
                    dataIntegrityValidation,
                    securityValidation
                ]),
                rollbackRecommended: false, // Will be determined
                timestamp: new Date().toISOString()
            };

            // Determine if rollback is recommended
            results.rollbackRecommended = this.shouldRecommendRollback(results);

            this.state.testResults.set(testId, results);

            this.emit('tests:completed', {
                testId,
                type: 'post_migration',
                success: results.overall.success,
                score: results.overall.score,
                rollbackRecommended: results.rollbackRecommended
            });

            // Auto-trigger rollback if configured and recommended
            if (results.rollbackRecommended && this.config.rollback.automaticRollback) {
                this.emit('rollback:triggered', {
                    testId,
                    contextId: migrationContext.id,
                    reason: 'Post-migration validation failure',
                    trigger: 'automatic'
                });
            }

            return results;

        } catch (error) {
            this.emit('tests:failed', {
                testId,
                type: 'post_migration',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Execute rollback validation tests
     * @param {Object} rollbackContext - Rollback execution context
     * @returns {Promise<Object>} Rollback validation results
     */
    async executeRollbackValidationTests(rollbackContext) {
        if (!this.config.validation.enableRollbackTests) {
            return { skipped: true, reason: 'Rollback tests disabled' };
        }

        const testId = crypto.randomUUID();

        try {
            this.emit('tests:started', {
                testId,
                type: 'rollback_validation',
                contextId: rollbackContext.id
            });

            // Verify rollback completion
            const rollbackCompletionValidation = await this.validateRollbackCompletion(rollbackContext);

            // Validate system restoration
            const systemRestorationValidation = await this.validateSystemRestoration(rollbackContext);

            // Data restoration validation
            const dataRestorationValidation = await this.validateDataRestoration(rollbackContext);

            // Functionality restoration
            const functionalityRestorationValidation = await this.validateFunctionalityRestoration(rollbackContext);

            const results = {
                id: testId,
                type: 'rollback_validation',
                contextId: rollbackContext.id,
                rollbackCompletionValidation,
                systemRestorationValidation,
                dataRestorationValidation,
                functionalityRestorationValidation,
                overall: this.calculateOverallTestResult([
                    rollbackCompletionValidation,
                    systemRestorationValidation,
                    dataRestorationValidation,
                    functionalityRestorationValidation
                ]),
                timestamp: new Date().toISOString()
            };

            this.state.testResults.set(testId, results);

            this.emit('tests:completed', {
                testId,
                type: 'rollback_validation',
                success: results.overall.success,
                score: results.overall.score
            });

            return results;

        } catch (error) {
            this.emit('tests:failed', {
                testId,
                type: 'rollback_validation',
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Execute test suites
     * @param {Object} context - Execution context
     * @param {string} phase - Test phase (pre_migration, post_migration, etc.)
     * @param {Object} options - Test execution options
     * @returns {Promise<Object>} Test suite results
     */
    async executeTestSuites(context, phase, options = {}) {
        const results = {};
        const testPromises = [];

        for (const suiteType of this.config.testing.testSuiteTypes) {
            const suite = this.testSuites[suiteType];

            if (this.config.testing.parallelTesting) {
                testPromises.push(
                    this.executeTestSuite(suite, context, phase, options)
                        .then(result => ({ suiteType, result }))
                        .catch(error => ({ suiteType, error: error.message }))
                );
            } else {
                try {
                    results[suiteType] = await this.executeTestSuite(suite, context, phase, options);
                } catch (error) {
                    results[suiteType] = {
                        success: false,
                        error: error.message,
                        tests: []
                    };
                }
            }
        }

        // Wait for parallel tests to complete
        if (this.config.testing.parallelTesting) {
            const parallelResults = await Promise.allSettled(testPromises);

            for (const promiseResult of parallelResults) {
                if (promiseResult.status === 'fulfilled') {
                    const { suiteType, result, error } = promiseResult.value;
                    results[suiteType] = error ? { success: false, error, tests: [] } : result;
                } else {
                    // Handle rejected promise
                    results['unknown'] = {
                        success: false,
                        error: promiseResult.reason.message,
                        tests: []
                    };
                }
            }
        }

        return results;
    }

    /**
     * Execute individual test suite
     * @param {Object} suite - Test suite definition
     * @param {Object} context - Execution context
     * @param {string} phase - Test phase
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} Test suite result
     */
    async executeTestSuite(suite, context, phase, options = {}) {
        const suiteResult = {
            name: suite.name,
            description: suite.description,
            priority: suite.priority,
            phase,
            startTime: new Date().toISOString(),
            tests: [],
            success: true,
            score: 0,
            duration: 0
        };

        const startTime = Date.now();

        try {
            for (const test of suite.tests) {
                const testResult = await this.executeTest(test, context, phase, options);
                suiteResult.tests.push(testResult);

                if (!testResult.success) {
                    suiteResult.success = false;
                }

                suiteResult.score += testResult.score || 0;
            }

            // Calculate average score
            if (suiteResult.tests.length > 0) {
                suiteResult.score = suiteResult.score / suiteResult.tests.length;
            }

            suiteResult.duration = Date.now() - startTime;
            suiteResult.completedAt = new Date().toISOString();

            return suiteResult;

        } catch (error) {
            suiteResult.success = false;
            suiteResult.error = error.message;
            suiteResult.duration = Date.now() - startTime;
            suiteResult.completedAt = new Date().toISOString();

            throw error;
        }
    }

    /**
     * Execute individual test
     * @param {Object} test - Test definition
     * @param {Object} context - Execution context
     * @param {string} phase - Test phase
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} Test result
     */
    async executeTest(test, context, phase, options = {}) {
        const testResult = {
            id: test.id,
            name: test.name,
            description: test.description,
            type: test.type,
            phase,
            startTime: new Date().toISOString(),
            success: false,
            score: 0,
            duration: 0,
            retryAttempts: 0
        };

        const maxRetries = this.config.testing.retryAttempts;
        let attempt = 0;

        while (attempt <= maxRetries) {
            const attemptStartTime = Date.now();

            try {
                // Execute test based on type
                const result = await this.executeTestByType(test, context, phase, options);

                testResult.success = result.success;
                testResult.score = result.score;
                testResult.result = result.data;
                testResult.duration = Date.now() - attemptStartTime;
                testResult.completedAt = new Date().toISOString();
                testResult.retryAttempts = attempt;

                break; // Success, exit retry loop

            } catch (error) {
                testResult.retryAttempts = attempt;

                if (attempt >= maxRetries) {
                    testResult.success = false;
                    testResult.error = error.message;
                    testResult.duration = Date.now() - attemptStartTime;
                    testResult.completedAt = new Date().toISOString();
                    break;
                } else {
                    // Wait before retry
                    await this.delay(this.config.testing.retryDelayMs);
                }
            }

            attempt++;
        }

        return testResult;
    }

    /**
     * Determine if rollback should be recommended
     * @param {Object} testResults - Test results
     * @returns {boolean} True if rollback is recommended
     */
    shouldRecommendRollback(testResults) {
        const { overall, performanceComparison, functionalityValidation, securityValidation } = testResults;

        // Check overall test success
        if (!overall.success) {
            return true;
        }

        // Check performance degradation
        if (performanceComparison && !performanceComparison.acceptable) {
            return true;
        }

        // Check functionality validation
        if (functionalityValidation && !functionalityValidation.success) {
            return true;
        }

        // Check security validation
        if (securityValidation && !securityValidation.success) {
            return true;
        }

        // Check overall score threshold
        if (overall.score < 0.7) { // Below 70% success rate
            return true;
        }

        return false;
    }

    /**
     * Get validation status
     * @param {string} validationId - Validation ID
     * @returns {Object|null} Validation status
     */
    getValidationStatus(validationId) {
        return this.state.activeValidations.get(validationId) ||
               this.state.validationHistory.get(validationId) ||
               null;
    }

    /**
     * Get test results
     * @param {string} testId - Test ID
     * @returns {Object|null} Test results
     */
    getTestResults(testId) {
        return this.state.testResults.get(testId) || null;
    }

    /**
     * Get validator metrics
     * @returns {Object} Validator metrics
     */
    getMetrics() {
        const validations = Array.from(this.state.validationHistory.values());
        const tests = Array.from(this.state.testResults.values());

        return {
            validations: {
                total: validations.length,
                successful: validations.filter(v => v.valid).length,
                failed: validations.filter(v => !v.valid).length,
                averageScore: validations.length > 0 ?
                    validations.reduce((sum, v) => sum + (v.score || 0), 0) / validations.length : 0
            },
            tests: {
                total: tests.length,
                successful: tests.filter(t => t.overall.success).length,
                failed: tests.filter(t => !t.overall.success).length,
                rollbacksRecommended: tests.filter(t => t.rollbackRecommended).length
            },
            performance: {
                baselines: this.state.performanceBaselines.size,
                averageTestDuration: tests.length > 0 ?
                    tests.reduce((sum, t) => sum + (t.duration || 0), 0) / tests.length : 0
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Utility method for delays
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { MigrationValidator };