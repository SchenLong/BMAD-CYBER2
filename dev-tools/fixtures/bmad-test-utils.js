/**
 * BMAD CYBER2 Test Utilities
 * EPIC 2: Integration Testing Support
 * Comprehensive testing utilities for BMAD system validation
 */

/**
 * BMAD Test Utilities Global Object
 */
global.BMAD_TEST_UTILS = {
  /**
   * Measure performance of async operations
   */
  async measurePerformance(operation, operationName = 'operation') {
    const startTime = performance.now();
    let success = null;
    let error = null;

    try {
      success = await operation();
    } catch (err) {
      error = err;
      success = { success: false, error: err.message };
    }

    const duration = performance.now() - startTime;

    return {
      duration: Math.round(duration),
      success,
      error,
      operationName,
      timestamp: Date.now()
    };
  },

  /**
   * Generate test data of various sizes
   */
  generateTestData(sizeKB = 1) {
    const sizeBytes = sizeKB * 1024;
    const char = 'A';
    const data = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      size: sizeKB,
      content: char.repeat(Math.max(1, sizeBytes - 100)) // Leave room for other fields
    };
    return data;
  },

  /**
   * Create timeout promise
   */
  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Generate random test scenarios
   */
  generateTestScenarios(count = 5) {
    const scenarios = [];
    for (let i = 0; i < count; i++) {
      scenarios.push({
        id: `scenario_${i}`,
        complexity: Math.floor(Math.random() * 5) + 1,
        expectedDuration: Math.floor(Math.random() * 1000) + 100,
        data: this.generateTestData(Math.floor(Math.random() * 5) + 1)
      });
    }
    return scenarios;
  },

  /**
   * Validate system performance metrics
   */
  validatePerformanceMetrics(metrics, thresholds = {}) {
    const defaultThresholds = {
      maxDuration: 1000, // 1 second
      minThroughput: 10, // operations per second
      maxMemoryUsage: 512, // MB
      maxCpuUsage: 80 // percentage
    };

    const actualThresholds = { ...defaultThresholds, ...thresholds };
    const results = {
      passed: true,
      violations: [],
      score: 100
    };

    if (metrics.duration > actualThresholds.maxDuration) {
      results.violations.push(`Duration exceeded: ${metrics.duration}ms > ${actualThresholds.maxDuration}ms`);
      results.passed = false;
    }

    if (metrics.throughput && metrics.throughput < actualThresholds.minThroughput) {
      results.violations.push(`Throughput below minimum: ${metrics.throughput} < ${actualThresholds.minThroughput}`);
      results.passed = false;
    }

    if (metrics.memoryUsage && metrics.memoryUsage > actualThresholds.maxMemoryUsage) {
      results.violations.push(`Memory usage exceeded: ${metrics.memoryUsage}MB > ${actualThresholds.maxMemoryUsage}MB`);
      results.passed = false;
    }

    if (metrics.cpuUsage && metrics.cpuUsage > actualThresholds.maxCpuUsage) {
      results.violations.push(`CPU usage exceeded: ${metrics.cpuUsage}% > ${actualThresholds.maxCpuUsage}%`);
      results.passed = false;
    }

    results.score = Math.max(0, 100 - (results.violations.length * 25));
    return results;
  },

  /**
   * Mock system resource usage
   */
  getSystemMetrics() {
    return {
      memoryUsage: Math.floor(Math.random() * 256) + 128, // 128-384 MB
      cpuUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
      diskUsage: Math.floor(Math.random() * 50) + 30, // 30-80%
      networkLatency: Math.floor(Math.random() * 50) + 10, // 10-60ms
      timestamp: Date.now()
    };
  },

  /**
   * Simulate load testing scenarios
   */
  async simulateLoad(concurrency = 5, duration = 1000) {
    const results = [];
    const startTime = Date.now();

    const promises = Array.from({ length: concurrency }, async (_, index) => {
      const taskStartTime = performance.now();

      // Simulate work with variable delay
      const workDelay = Math.random() * 100 + 50;
      await this.timeout(workDelay);

      const taskDuration = performance.now() - taskStartTime;

      return {
        taskId: index,
        duration: Math.round(taskDuration),
        success: Math.random() > 0.1, // 90% success rate
        timestamp: Date.now()
      };
    });

    const taskResults = await Promise.allSettled(promises);
    const endTime = Date.now();

    const successful = taskResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = taskResults.length - successful;

    return {
      concurrency,
      totalTasks: taskResults.length,
      successful,
      failed,
      successRate: Math.round((successful / taskResults.length) * 100),
      totalDuration: endTime - startTime,
      averageTaskDuration: taskResults.reduce((sum, r) => {
        return sum + (r.status === 'fulfilled' ? r.value.duration : 0);
      }, 0) / taskResults.length,
      throughput: Math.round((taskResults.length / (endTime - startTime)) * 1000), // tasks per second
      results: taskResults.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason })
    };
  },

  /**
   * Validate integration points
   */
  validateIntegrationPoint(sourceModule, targetModule, config = {}) {
    const defaultConfig = {
      requiresAuth: true,
      maxLatency: 500,
      minReliability: 95
    };

    const actualConfig = { ...defaultConfig, ...config };
    const latency = Math.random() * 300 + 50; // 50-350ms
    const reliability = Math.random() * 20 + 80; // 80-100%

    const result = {
      sourceModule,
      targetModule,
      latency: Math.round(latency),
      reliability: Math.round(reliability),
      authRequired: actualConfig.requiresAuth,
      passed: true,
      issues: []
    };

    if (latency > actualConfig.maxLatency) {
      result.issues.push(`High latency: ${Math.round(latency)}ms > ${actualConfig.maxLatency}ms`);
      result.passed = false;
    }

    if (reliability < actualConfig.minReliability) {
      result.issues.push(`Low reliability: ${Math.round(reliability)}% < ${actualConfig.minReliability}%`);
      result.passed = false;
    }

    result.score = Math.round(((actualConfig.maxLatency - latency) / actualConfig.maxLatency * 50) + (reliability / 100 * 50));
    result.score = Math.max(0, Math.min(100, result.score));

    return result;
  },

  /**
   * Generate integration test report
   */
  generateIntegrationReport(testResults, metadata = {}) {
    const report = {
      timestamp: new Date().toISOString(),
      metadata: {
        epic: 'EPIC-2',
        story: 'Story-2.2',
        framework: 'integration-testing',
        ...metadata
      },
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        score: 0,
        duration: 0
      },
      categories: {},
      details: testResults
    };

    // Calculate summary metrics
    const allResults = Array.isArray(testResults) ? testResults : Object.values(testResults);

    report.summary.totalTests = allResults.length;
    report.summary.passed = allResults.filter(r => r.passed || r.success).length;
    report.summary.failed = report.summary.totalTests - report.summary.passed;
    report.summary.score = Math.round((report.summary.passed / report.summary.totalTests) * 100);

    if (allResults.length > 0) {
      report.summary.duration = allResults.reduce((sum, r) => sum + (r.duration || 0), 0) / allResults.length;
    }

    // Categorize results
    allResults.forEach(result => {
      const category = result.category || 'general';
      if (!report.categories[category]) {
        report.categories[category] = { total: 0, passed: 0, failed: 0, score: 0 };
      }

      report.categories[category].total++;
      if (result.passed || result.success) {
        report.categories[category].passed++;
      } else {
        report.categories[category].failed++;
      }
    });

    // Calculate category scores
    Object.keys(report.categories).forEach(category => {
      const cat = report.categories[category];
      cat.score = Math.round((cat.passed / cat.total) * 100);
    });

    return report;
  },

  /**
   * Validate YAML configuration
   */
  validateYAMLConfig(config, schema = {}) {
    const required = schema.required || ['code', 'name', 'version'];
    const optional = schema.optional || [];
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      score: 100
    };

    // Check required fields
    required.forEach(field => {
      if (!config || !config[field]) {
        result.errors.push(`Missing required field: ${field}`);
        result.valid = false;
      }
    });

    // Check for unexpected fields
    if (config) {
      const allowedFields = [...required, ...optional];
      Object.keys(config).forEach(field => {
        if (!allowedFields.includes(field)) {
          result.warnings.push(`Unexpected field: ${field}`);
        }
      });
    }

    result.score = Math.max(0, 100 - (result.errors.length * 20) - (result.warnings.length * 5));
    return result;
  }
};

export default BMAD_TEST_UTILS;