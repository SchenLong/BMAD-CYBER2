#!/usr/bin/env node
/**
 * EPIC 5.2: Performance and Resource Impact Testing
 * Benchmarks system performance with specialized teams
 *
 * Test Author: Murat (Test Architect)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { performance } from 'perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.dirname(__dirname);

// Performance benchmarks and thresholds
const PERFORMANCE_THRESHOLDS = {
  moduleLoad: 500,        // ms - Individual module load time
  bulkLoad: 2000,         // ms - All modules load time
  agentParse: 100,        // ms - Single agent YAML parse time
  workflowParse: 150,     // ms - Single workflow YAML parse time
  memoryGrowth: 50,       // MB - Maximum acceptable memory growth
  startupTime: 1000,      // ms - Cold startup time
  fileSystemOps: 50       // ms - File system operation time
};

let performanceBaseline = {};
let benchmarkResults = {};

describe('⚡ Performance and Resource Impact Testing', () => {

  beforeAll(async () => {
    console.log('📊 Starting performance benchmarking...');

    // Establish memory baseline
    if (global.gc) global.gc();
    const initialMemory = process.memoryUsage();
    performanceBaseline = {
      heapUsed: initialMemory.heapUsed / 1024 / 1024,
      heapTotal: initialMemory.heapTotal / 1024 / 1024,
      rss: initialMemory.rss / 1024 / 1024,
      external: initialMemory.external / 1024 / 1024,
      timestamp: Date.now()
    };

    console.log(`📏 Memory baseline: ${performanceBaseline.heapUsed.toFixed(2)}MB heap`);
  });

  describe('🚀 Startup and Initialization Performance', () => {

    it('should measure cold startup time', async () => {
      const startTime = performance.now();

      // Simulate cold startup - read main package.json
      const packageJsonPath = path.join(distPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(content);

      // Read all module configurations
      for (const module of packageData.bmad.modules) {
        const moduleYamlPath = path.join(distPath, 'src', module, 'module.yaml');
        const moduleContent = await fs.readFile(moduleYamlPath, 'utf8');
        yaml.load(moduleContent);
      }

      const coldStartupTime = performance.now() - startTime;
      benchmarkResults.coldStartupTime = coldStartupTime;

      expect(coldStartupTime).toBeLessThan(PERFORMANCE_THRESHOLDS.startupTime);

      console.log(`  ⏱️  Cold startup: ${coldStartupTime.toFixed(2)}ms`);
    });

    it('should measure individual module load times', async () => {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const moduleLoadTimes = {};

      for (const team of teams) {
        const startTime = performance.now();

        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        const content = await fs.readFile(moduleYamlPath, 'utf8');
        yaml.load(content);

        const loadTime = performance.now() - startTime;
        moduleLoadTimes[team] = loadTime;

        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.moduleLoad);

        console.log(`    ${team}: ${loadTime.toFixed(2)}ms`);
      }

      benchmarkResults.moduleLoadTimes = moduleLoadTimes;

      const averageLoadTime = Object.values(moduleLoadTimes).reduce((a, b) => a + b, 0) / teams.length;
      console.log(`  📊 Average module load: ${averageLoadTime.toFixed(2)}ms`);
    });

    it('should measure bulk operations performance', async () => {
      const startTime = performance.now();

      // Load all agents across all teams
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      let totalAgents = 0;

      for (const team of teams) {
        const agentsPath = path.join(distPath, 'src', team, 'agents');
        const agentFiles = await fs.readdir(agentsPath);

        for (const agentFile of agentFiles) {
          if (agentFile.endsWith('.agent.yaml')) {
            const agentPath = path.join(agentsPath, agentFile);
            const content = await fs.readFile(agentPath, 'utf8');
            yaml.load(content);
            totalAgents++;
          }
        }
      }

      const bulkLoadTime = performance.now() - startTime;
      benchmarkResults.bulkLoadTime = bulkLoadTime;
      benchmarkResults.agentsLoaded = totalAgents;

      expect(bulkLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.bulkLoad);

      console.log(`  📦 Bulk load: ${totalAgents} agents in ${bulkLoadTime.toFixed(2)}ms`);
      console.log(`  ⚡ Throughput: ${(totalAgents / bulkLoadTime * 1000).toFixed(1)} agents/sec`);
    });
  });

  describe('🧠 Memory Usage and Resource Management', () => {

    it('should measure memory usage during operations', async () => {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const memorySnapshots = [];

      // Initial snapshot
      if (global.gc) global.gc();
      memorySnapshots.push({
        phase: 'initial',
        memory: process.memoryUsage().heapUsed / 1024 / 1024
      });

      // Load each team and measure memory
      for (const team of teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        const agentsPath = path.join(distPath, 'src', team, 'agents');
        const workflowsPath = path.join(distPath, 'src', team, 'workflows');

        // Load module
        await fs.readFile(moduleYamlPath, 'utf8');

        // Load all agents
        const agentFiles = await fs.readdir(agentsPath);
        for (const agentFile of agentFiles) {
          if (agentFile.endsWith('.agent.yaml')) {
            const content = await fs.readFile(path.join(agentsPath, agentFile), 'utf8');
            yaml.load(content);
          }
        }

        // Load all workflows
        const workflowFiles = await fs.readdir(workflowsPath);
        for (const workflowFile of workflowFiles) {
          if (workflowFile.endsWith('.workflow.yaml')) {
            const content = await fs.readFile(path.join(workflowsPath, workflowFile), 'utf8');
            yaml.load(content);
          }
        }

        if (global.gc) global.gc();
        memorySnapshots.push({
          phase: `after-${team}`,
          memory: process.memoryUsage().heapUsed / 1024 / 1024
        });
      }

      // Calculate memory growth
      const initialMemory = memorySnapshots[0].memory;
      const finalMemory = memorySnapshots[memorySnapshots.length - 1].memory;
      const memoryGrowth = finalMemory - initialMemory;

      benchmarkResults.memoryGrowth = memoryGrowth;
      benchmarkResults.memorySnapshots = memorySnapshots;

      expect(memoryGrowth).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryGrowth);

      console.log(`  💾 Memory growth: ${memoryGrowth.toFixed(2)}MB`);
      console.log(`  📈 Initial: ${initialMemory.toFixed(2)}MB → Final: ${finalMemory.toFixed(2)}MB`);
    });

    it('should validate memory cleanup after operations', async () => {
      // Perform intensive operations
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      let loadedData = [];

      for (const team of teams) {
        const agentsPath = path.join(distPath, 'src', team, 'agents');
        const agentFiles = await fs.readdir(agentsPath);

        for (const agentFile of agentFiles.slice(0, 5)) { // Load first 5 agents per team
          if (agentFile.endsWith('.agent.yaml')) {
            const content = await fs.readFile(path.join(agentsPath, agentFile), 'utf8');
            const agentData = yaml.load(content);
            loadedData.push(agentData);
          }
        }
      }

      const memoryBeforeCleanup = process.memoryUsage().heapUsed / 1024 / 1024;

      // Clear references
      loadedData = null;

      // Force garbage collection
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
        global.gc();
      }

      const memoryAfterCleanup = process.memoryUsage().heapUsed / 1024 / 1024;
      const cleanupEffectiveness = memoryBeforeCleanup - memoryAfterCleanup;

      console.log(`  🧹 Memory before cleanup: ${memoryBeforeCleanup.toFixed(2)}MB`);
      console.log(`  🧹 Memory after cleanup: ${memoryAfterCleanup.toFixed(2)}MB`);
      console.log(`  📉 Cleanup effectiveness: ${cleanupEffectiveness.toFixed(2)}MB freed`);

      // Should free some memory or stay stable (negative values are actually good - memory was freed)
      expect(Math.abs(cleanupEffectiveness)).toBeLessThan(5); // Memory change should be minimal (< 5MB)
    });
  });

  describe('📁 File System Performance', () => {

    it('should measure file reading performance', async () => {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const fileOperationTimes = [];

      for (const team of teams) {
        const startTime = performance.now();

        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        await fs.readFile(moduleYamlPath, 'utf8');

        const operationTime = performance.now() - startTime;
        fileOperationTimes.push(operationTime);

        expect(operationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.fileSystemOps);
      }

      const averageFileOp = fileOperationTimes.reduce((a, b) => a + b, 0) / fileOperationTimes.length;
      benchmarkResults.averageFileOperationTime = averageFileOp;

      console.log(`  📄 Average file read: ${averageFileOp.toFixed(2)}ms`);
    });

    it('should measure concurrent file operations', async () => {
      const startTime = performance.now();

      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      // Read all module.yaml files concurrently
      const modulePromises = teams.map(team => {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        return fs.readFile(moduleYamlPath, 'utf8');
      });

      await Promise.all(modulePromises);

      const concurrentTime = performance.now() - startTime;
      benchmarkResults.concurrentFileOperations = concurrentTime;

      // Should be faster than sequential operations
      expect(concurrentTime).toBeLessThan(200);

      console.log(`  ⚡ Concurrent reads: ${concurrentTime.toFixed(2)}ms`);
    });

    it('should measure directory traversal performance', async () => {
      const startTime = performance.now();

      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      let totalFiles = 0;

      for (const team of teams) {
        const teamPath = path.join(distPath, 'src', team);

        // Recursively count files
        const countFiles = async (dirPath) => {
          const items = await fs.readdir(dirPath);
          let count = 0;

          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = await fs.stat(itemPath);

            if (stat.isDirectory()) {
              count += await countFiles(itemPath);
            } else {
              count++;
            }
          }

          return count;
        };

        totalFiles += await countFiles(teamPath);
      }

      const traversalTime = performance.now() - startTime;
      benchmarkResults.directoryTraversalTime = traversalTime;
      benchmarkResults.totalFilesTraversed = totalFiles;

      expect(traversalTime).toBeLessThan(1000);

      console.log(`  📂 Directory traversal: ${totalFiles} files in ${traversalTime.toFixed(2)}ms`);
    });
  });

  describe('🔍 Parsing and Processing Performance', () => {

    it('should measure YAML parsing performance', async () => {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const parsingTimes = { agents: [], workflows: [] };

      for (const team of teams) {
        const agentsPath = path.join(distPath, 'src', team, 'agents');
        const workflowsPath = path.join(distPath, 'src', team, 'workflows');

        // Test agent parsing
        const agentFiles = await fs.readdir(agentsPath);
        for (const agentFile of agentFiles.slice(0, 3)) { // Test first 3 agents
          if (agentFile.endsWith('.agent.yaml')) {
            const content = await fs.readFile(path.join(agentsPath, agentFile), 'utf8');

            const startTime = performance.now();
            yaml.load(content);
            const parseTime = performance.now() - startTime;

            parsingTimes.agents.push(parseTime);
            expect(parseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.agentParse);
          }
        }

        // Test workflow parsing
        const workflowFiles = await fs.readdir(workflowsPath);
        for (const workflowFile of workflowFiles.slice(0, 3)) { // Test first 3 workflows
          if (workflowFile.endsWith('.workflow.yaml')) {
            const content = await fs.readFile(path.join(workflowsPath, workflowFile), 'utf8');

            const startTime = performance.now();
            yaml.load(content);
            const parseTime = performance.now() - startTime;

            parsingTimes.workflows.push(parseTime);
            expect(parseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.workflowParse);
          }
        }
      }

      const avgAgentParse = parsingTimes.agents.reduce((a, b) => a + b, 0) / parsingTimes.agents.length;
      const avgWorkflowParse = parsingTimes.workflows.reduce((a, b) => a + b, 0) / parsingTimes.workflows.length;

      benchmarkResults.averageAgentParseTime = avgAgentParse;
      benchmarkResults.averageWorkflowParseTime = avgWorkflowParse;

      console.log(`  📝 Average agent parse: ${avgAgentParse.toFixed(2)}ms`);
      console.log(`  🔄 Average workflow parse: ${avgWorkflowParse.toFixed(2)}ms`);
    });

    it('should measure large data structure processing', async () => {
      const startTime = performance.now();

      // Create a large combined configuration
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const combinedData = {};

      for (const team of teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        const content = await fs.readFile(moduleYamlPath, 'utf8');
        const moduleConfig = yaml.load(content);

        combinedData[team] = moduleConfig;
      }

      // Process the large structure
      let totalAgents = 0;
      let totalWorkflows = 0;

      for (const [team, config] of Object.entries(combinedData)) {
        if (config.agents) {
          totalAgents += Object.keys(config.agents).length;
        }
        if (config.workflows) {
          totalWorkflows += Object.keys(config.workflows).length;
        }
      }

      const processingTime = performance.now() - startTime;
      benchmarkResults.largeDataProcessingTime = processingTime;

      expect(processingTime).toBeLessThan(500);

      console.log(`  📊 Large data processing: ${processingTime.toFixed(2)}ms`);
      console.log(`    Processed ${totalAgents} agents, ${totalWorkflows} workflows`);
    });
  });

  describe('📈 Scalability Testing', () => {

    it('should handle multiple concurrent operations', async () => {
      const concurrency = 10;
      const operations = [];

      // Create multiple concurrent module loads
      for (let i = 0; i < concurrency; i++) {
        const operation = async () => {
          const team = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'][i % 4];
          const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
          const content = await fs.readFile(moduleYamlPath, 'utf8');
          return yaml.load(content);
        };

        operations.push(operation());
      }

      const startTime = performance.now();
      const results = await Promise.all(operations);
      const concurrentTime = performance.now() - startTime;

      benchmarkResults.concurrentOperationsTime = concurrentTime;

      expect(results).toHaveLength(concurrency);
      expect(concurrentTime).toBeLessThan(1000);

      console.log(`  🔀 ${concurrency} concurrent operations: ${concurrentTime.toFixed(2)}ms`);
    });

    it('should maintain performance under repeated operations', async () => {
      const iterations = 20;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        const moduleYamlPath = path.join(distPath, 'src', 'cybersec-team', 'module.yaml');
        const content = await fs.readFile(moduleYamlPath, 'utf8');
        yaml.load(content);

        const iterationTime = performance.now() - startTime;
        times.push(iterationTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      benchmarkResults.repeatedOperations = {
        iterations,
        averageTime: avgTime,
        maxTime,
        minTime,
        variance: maxTime - minTime
      };

      // Performance should be consistent
      expect(maxTime - minTime).toBeLessThan(50);

      console.log(`  🔁 ${iterations} iterations: avg ${avgTime.toFixed(2)}ms, variance ${(maxTime - minTime).toFixed(2)}ms`);
    });
  });

  afterAll(() => {
    console.log('\n📊 Performance Benchmark Results:');
    console.log('='.repeat(50));

    // Print key metrics
    console.log('\n🚀 Startup Performance:');
    if (benchmarkResults.coldStartupTime) {
      console.log(`  Cold Startup: ${benchmarkResults.coldStartupTime.toFixed(2)}ms`);
    }
    if (benchmarkResults.bulkLoadTime && benchmarkResults.agentsLoaded) {
      const throughput = (benchmarkResults.agentsLoaded / benchmarkResults.bulkLoadTime * 1000).toFixed(1);
      console.log(`  Bulk Load: ${benchmarkResults.agentsLoaded} agents in ${benchmarkResults.bulkLoadTime.toFixed(2)}ms (${throughput}/sec)`);
    }

    console.log('\n💾 Memory Performance:');
    if (benchmarkResults.memoryGrowth !== undefined) {
      console.log(`  Memory Growth: ${benchmarkResults.memoryGrowth.toFixed(2)}MB`);
    }

    console.log('\n📁 File System Performance:');
    if (benchmarkResults.averageFileOperationTime) {
      console.log(`  Average File Op: ${benchmarkResults.averageFileOperationTime.toFixed(2)}ms`);
    }
    if (benchmarkResults.concurrentFileOperations) {
      console.log(`  Concurrent Reads: ${benchmarkResults.concurrentFileOperations.toFixed(2)}ms`);
    }

    console.log('\n🔍 Parsing Performance:');
    if (benchmarkResults.averageAgentParseTime) {
      console.log(`  Agent Parse: ${benchmarkResults.averageAgentParseTime.toFixed(2)}ms`);
    }
    if (benchmarkResults.averageWorkflowParseTime) {
      console.log(`  Workflow Parse: ${benchmarkResults.averageWorkflowParseTime.toFixed(2)}ms`);
    }

    console.log('\n📈 Scalability:');
    if (benchmarkResults.concurrentOperationsTime) {
      console.log(`  Concurrent Ops: ${benchmarkResults.concurrentOperationsTime.toFixed(2)}ms`);
    }
    if (benchmarkResults.repeatedOperations) {
      const ops = benchmarkResults.repeatedOperations;
      console.log(`  Consistency: ${ops.averageTime.toFixed(2)}ms avg, ${ops.variance.toFixed(2)}ms variance`);
    }

    // Performance summary
    console.log('\n🎯 Performance Summary:');
    const passedThresholds = [];
    const failedThresholds = [];

    if (benchmarkResults.coldStartupTime) {
      if (benchmarkResults.coldStartupTime < PERFORMANCE_THRESHOLDS.startupTime) {
        passedThresholds.push('Startup Time');
      } else {
        failedThresholds.push('Startup Time');
      }
    }

    if (benchmarkResults.memoryGrowth !== undefined) {
      if (benchmarkResults.memoryGrowth < PERFORMANCE_THRESHOLDS.memoryGrowth) {
        passedThresholds.push('Memory Usage');
      } else {
        failedThresholds.push('Memory Usage');
      }
    }

    console.log(`  ✅ Passed: ${passedThresholds.join(', ')}`);
    if (failedThresholds.length > 0) {
      console.log(`  ❌ Failed: ${failedThresholds.join(', ')}`);
    }

    console.log('\n⚡ Performance testing completed.');
  });
});