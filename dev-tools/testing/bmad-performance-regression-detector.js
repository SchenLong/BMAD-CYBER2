#!/usr/bin/env node
/**
 * BMAD Performance Regression Detection System
 * Technical Intelligence Researcher: Probe
 * 
 * Purpose: Continuous performance monitoring and regression detection
 * Focus: Detect performance degradation before production deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import yaml from 'js-yaml';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PerformanceRegressionDetector {
  constructor() {
    this.projectRoot = '/Users/paultinp/BMAD-CYBER2';
    this.benchmarkHistory = [];
    this.thresholds = {
      loadTimeRegression: 50, // 50% increase is a regression
      memoryRegression: 30,   // 30% increase is a regression
      throughputRegression: 20, // 20% decrease is a regression
      integrationLatencyRegression: 100 // 100% increase is critical
    };
    
    this.currentBenchmark = {
      timestamp: new Date().toISOString(),
      system: this.getSystemInfo(),
      metrics: {}
    };
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      nodeVersion: process.version,
      cpuCores: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024)
    };
  }

  async detectRegressions() {
    console.log('🕵️ BMAD Performance Regression Detection');
    console.log('═'.repeat(60));
    console.log(`⏰ Timestamp: ${this.currentBenchmark.timestamp}`);
    console.log(`🖥️ System: ${this.currentBenchmark.system.platform} ${this.currentBenchmark.system.architecture}`);

    try {
      // Load historical benchmarks
      await this.loadBenchmarkHistory();

      // Run current performance tests
      await this.runCurrentBenchmarks();

      // Detect regressions
      const regressions = await this.analyzeRegressions();

      // Generate regression report
      await this.generateRegressionReport(regressions);

      return { regressions, currentMetrics: this.currentBenchmark.metrics };

    } catch (error) {
      console.error('💥 Regression detection failed:', error);
      throw error;
    }
  }

  async loadBenchmarkHistory() {
    console.log('\n📚 Loading benchmark history...');

    const historyFile = path.join(this.projectRoot, 'bmad-performance-history.json');
    
    try {
      const historyContent = await fs.readFile(historyFile, 'utf8');
      this.benchmarkHistory = JSON.parse(historyContent);
      console.log(`  📊 Loaded ${this.benchmarkHistory.length} historical benchmarks`);
    } catch (error) {
      console.log('  📝 No previous benchmark history found - creating baseline');
      this.benchmarkHistory = [];
    }
  }

  async runCurrentBenchmarks() {
    console.log('\n⚡ Running current performance benchmarks...');

    // Test 1: Agent Loading Performance
    const agentMetrics = await this.benchmarkAgentLoading();
    this.currentBenchmark.metrics.agentLoading = agentMetrics;
    console.log(`  🤖 Agent loading: ${agentMetrics.averageLoadTime}ms avg`);

    // Test 2: Memory Utilization
    const memoryMetrics = await this.benchmarkMemoryUsage();
    this.currentBenchmark.metrics.memory = memoryMetrics;
    console.log(`  💾 Memory usage: ${memoryMetrics.peakHeapMB}MB peak`);

    // Test 3: Integration Latency
    const integrationMetrics = await this.benchmarkIntegrationLatency();
    this.currentBenchmark.metrics.integration = integrationMetrics;
    console.log(`  🔗 Integration latency: ${integrationMetrics.averageLatency}ms avg`);

    // Test 4: Throughput Performance
    const throughputMetrics = await this.benchmarkThroughput();
    this.currentBenchmark.metrics.throughput = throughputMetrics;
    console.log(`  🚀 Throughput: ${throughputMetrics.operationsPerSecond} ops/sec`);

    // Test 5: File System Performance
    const fileSystemMetrics = await this.benchmarkFileSystem();
    this.currentBenchmark.metrics.fileSystem = fileSystemMetrics;
    console.log(`  💾 File I/O: ${fileSystemMetrics.filesPerSecond} files/sec`);
  }

  async benchmarkAgentLoading() {
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const loadTimes = [];
    let totalAgents = 0;

    for (const team of teams) {
      const teamPath = path.join(this.projectRoot, 'test-installation', 'src', team, 'agents');
      
      try {
        const agentFiles = await fs.readdir(teamPath);
        const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

        for (const agentFile of yamlAgents) {
          const loadStart = performance.now();
          
          try {
            const agentPath = path.join(teamPath, agentFile);
            const content = await fs.readFile(agentPath, 'utf8');
            yaml.load(content);
            totalAgents++;
          } catch (error) {
            // Agent load failed - still count the time
          }
          
          const loadEnd = performance.now();
          loadTimes.push(loadEnd - loadStart);
        }
      } catch (error) {
        // Team directory doesn't exist
      }
    }

    return {
      totalAgents,
      averageLoadTime: loadTimes.length > 0 ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : 0,
      maxLoadTime: loadTimes.length > 0 ? Math.round(Math.max(...loadTimes)) : 0,
      minLoadTime: loadTimes.length > 0 ? Math.round(Math.min(...loadTimes)) : 0
    };
  }

  async benchmarkMemoryUsage() {
    const initialMemory = process.memoryUsage();

    // Simulate agent loading into memory
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const loadedAgents = [];

    for (const team of teams) {
      const teamPath = path.join(this.projectRoot, 'test-installation', 'src', team, 'agents');
      
      try {
        const agentFiles = await fs.readdir(teamPath);
        const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

        for (const agentFile of yamlAgents) {
          try {
            const agentPath = path.join(teamPath, agentFile);
            const content = await fs.readFile(agentPath, 'utf8');
            const agentConfig = yaml.load(content);
            loadedAgents.push(agentConfig);
          } catch (error) {
            // Skip failed loads
          }
        }
      } catch (error) {
        // Team directory doesn't exist
      }
    }

    const finalMemory = process.memoryUsage();

    return {
      initialHeapMB: Math.round(initialMemory.heapUsed / 1024 / 1024),
      peakHeapMB: Math.round(finalMemory.heapUsed / 1024 / 1024),
      memoryGrowthMB: Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024),
      agentsLoaded: loadedAgents.length,
      memoryPerAgentKB: loadedAgents.length > 0 ? 
        Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / loadedAgents.length / 1024) : 0
    };
  }

  async benchmarkIntegrationLatency() {
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const latencies = [];

    // Test pairwise integration latencies
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const latencyStart = performance.now();
        
        // Simulate integration test
        await this.simulateIntegrationTest(teams[i], teams[j]);
        
        const latencyEnd = performance.now();
        latencies.push(latencyEnd - latencyStart);
      }
    }

    return {
      averageLatency: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
      maxLatency: latencies.length > 0 ? Math.round(Math.max(...latencies)) : 0,
      minLatency: latencies.length > 0 ? Math.round(Math.min(...latencies)) : 0,
      totalTests: latencies.length
    };
  }

  async simulateIntegrationTest(teamA, teamB) {
    // Simulate data exchange between teams
    const exchangeDelay = Math.random() * 5 + 2; // 2-7ms simulated network latency
    await new Promise(resolve => setTimeout(resolve, exchangeDelay));

    // Simulate processing
    const processingData = { teamA, teamB, timestamp: Date.now() };
    JSON.stringify(processingData);
    JSON.parse(JSON.stringify(processingData));
  }

  async benchmarkThroughput() {
    const iterations = 100;
    const startTime = performance.now();

    // Simulate agent processing operations
    for (let i = 0; i < iterations; i++) {
      await this.simulateAgentOperation();
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    return {
      totalOperations: iterations,
      totalTimeMs: Math.round(totalTime),
      operationsPerSecond: Math.round((iterations / totalTime) * 1000),
      averageOperationTime: Math.round(totalTime / iterations)
    };
  }

  async simulateAgentOperation() {
    // Simulate typical agent operation
    const data = {
      id: Math.random(),
      timestamp: Date.now(),
      payload: Array.from({length: 10}, () => Math.random())
    };

    // Simulate processing
    JSON.stringify(data);
    data.payload.sort();
    data.payload.filter(x => x > 0.5);

    // Small async delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2));
  }

  async benchmarkFileSystem() {
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let totalFiles = 0;
    
    const startTime = performance.now();

    for (const team of teams) {
      const teamPath = path.join(this.projectRoot, 'test-installation', 'src', team, 'agents');
      
      try {
        const agentFiles = await fs.readdir(teamPath);
        const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

        for (const agentFile of yamlAgents) {
          try {
            const agentPath = path.join(teamPath, agentFile);
            await fs.readFile(agentPath, 'utf8');
            totalFiles++;
          } catch (error) {
            // File read failed
          }
        }
      } catch (error) {
        // Directory doesn't exist
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    return {
      totalFiles,
      totalTimeMs: Math.round(totalTime),
      filesPerSecond: totalFiles > 0 && totalTime > 0 ? Math.round((totalFiles / totalTime) * 1000) : 0,
      averageReadTime: totalFiles > 0 ? Math.round(totalTime / totalFiles) : 0
    };
  }

  async analyzeRegressions() {
    console.log('\n🔍 Analyzing performance regressions...');

    if (this.benchmarkHistory.length === 0) {
      console.log('  📝 No historical data - establishing baseline');
      return [];
    }

    const regressions = [];
    const previousBenchmark = this.benchmarkHistory[this.benchmarkHistory.length - 1];

    // Check agent loading regression
    if (this.isRegression(
      previousBenchmark.metrics?.agentLoading?.averageLoadTime || 0,
      this.currentBenchmark.metrics.agentLoading.averageLoadTime,
      this.thresholds.loadTimeRegression
    )) {
      regressions.push({
        type: 'Agent Loading',
        severity: 'HIGH',
        previousValue: previousBenchmark.metrics.agentLoading.averageLoadTime,
        currentValue: this.currentBenchmark.metrics.agentLoading.averageLoadTime,
        changePercent: this.calculateChangePercent(
          previousBenchmark.metrics.agentLoading.averageLoadTime,
          this.currentBenchmark.metrics.agentLoading.averageLoadTime
        ),
        impact: 'Agent initialization performance degraded'
      });
    }

    // Check memory regression
    if (this.isRegression(
      previousBenchmark.metrics?.memory?.memoryPerAgentKB || 0,
      this.currentBenchmark.metrics.memory.memoryPerAgentKB,
      this.thresholds.memoryRegression
    )) {
      regressions.push({
        type: 'Memory Usage',
        severity: 'MEDIUM',
        previousValue: previousBenchmark.metrics.memory.memoryPerAgentKB,
        currentValue: this.currentBenchmark.metrics.memory.memoryPerAgentKB,
        changePercent: this.calculateChangePercent(
          previousBenchmark.metrics.memory.memoryPerAgentKB,
          this.currentBenchmark.metrics.memory.memoryPerAgentKB
        ),
        impact: 'Memory consumption per agent increased significantly'
      });
    }

    // Check throughput regression
    if (this.isThroughputRegression(
      previousBenchmark.metrics?.throughput?.operationsPerSecond || 0,
      this.currentBenchmark.metrics.throughput.operationsPerSecond,
      this.thresholds.throughputRegression
    )) {
      regressions.push({
        type: 'Throughput Performance',
        severity: 'HIGH',
        previousValue: previousBenchmark.metrics.throughput.operationsPerSecond,
        currentValue: this.currentBenchmark.metrics.throughput.operationsPerSecond,
        changePercent: this.calculateChangePercent(
          previousBenchmark.metrics.throughput.operationsPerSecond,
          this.currentBenchmark.metrics.throughput.operationsPerSecond
        ),
        impact: 'System throughput decreased significantly'
      });
    }

    // Check integration latency regression
    if (this.isRegression(
      previousBenchmark.metrics?.integration?.averageLatency || 0,
      this.currentBenchmark.metrics.integration.averageLatency,
      this.thresholds.integrationLatencyRegression
    )) {
      regressions.push({
        type: 'Integration Latency',
        severity: 'CRITICAL',
        previousValue: previousBenchmark.metrics.integration.averageLatency,
        currentValue: this.currentBenchmark.metrics.integration.averageLatency,
        changePercent: this.calculateChangePercent(
          previousBenchmark.metrics.integration.averageLatency,
          this.currentBenchmark.metrics.integration.averageLatency
        ),
        impact: 'Cross-module integration performance severely degraded'
      });
    }

    return regressions;
  }

  isRegression(previousValue, currentValue, thresholdPercent) {
    if (previousValue === 0) return false;
    const changePercent = Math.abs(((currentValue - previousValue) / previousValue) * 100);
    return currentValue > previousValue && changePercent > thresholdPercent;
  }

  isThroughputRegression(previousValue, currentValue, thresholdPercent) {
    if (previousValue === 0) return false;
    const changePercent = Math.abs(((previousValue - currentValue) / previousValue) * 100);
    return currentValue < previousValue && changePercent > thresholdPercent;
  }

  calculateChangePercent(previousValue, currentValue) {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  }

  async generateRegressionReport(regressions) {
    console.log('\n📋 Performance Regression Analysis Report');
    console.log('═'.repeat(60));

    if (regressions.length === 0) {
      console.log('✅ No performance regressions detected');
      console.log('🎉 System performance is stable or improved');
    } else {
      console.log(`🚨 ${regressions.length} performance regression(s) detected:`);
      
      regressions.forEach((regression, index) => {
        const icon = regression.severity === 'CRITICAL' ? '🔴' : 
                    regression.severity === 'HIGH' ? '🟠' : '🟡';
        
        console.log(`\n  ${icon} ${index + 1}. ${regression.type} (${regression.severity})`);
        console.log(`     📉 Change: ${regression.previousValue} → ${regression.currentValue} (${regression.changePercent > 0 ? '+' : ''}${regression.changePercent}%)`);
        console.log(`     💥 Impact: ${regression.impact}`);
      });
    }

    // Current metrics summary
    console.log('\n📊 Current Performance Metrics:');
    console.log(`  🤖 Agent loading: ${this.currentBenchmark.metrics.agentLoading.averageLoadTime}ms avg`);
    console.log(`  💾 Memory usage: ${this.currentBenchmark.metrics.memory.memoryPerAgentKB}KB/agent`);
    console.log(`  🔗 Integration latency: ${this.currentBenchmark.metrics.integration.averageLatency}ms avg`);
    console.log(`  🚀 Throughput: ${this.currentBenchmark.metrics.throughput.operationsPerSecond} ops/sec`);
    console.log(`  💾 File I/O: ${this.currentBenchmark.metrics.fileSystem.filesPerSecond} files/sec`);

    // Save current benchmark to history
    this.benchmarkHistory.push(this.currentBenchmark);
    
    // Keep only last 50 benchmarks to prevent history file from growing too large
    if (this.benchmarkHistory.length > 50) {
      this.benchmarkHistory = this.benchmarkHistory.slice(-50);
    }

    const historyFile = path.join(this.projectRoot, 'bmad-performance-history.json');
    await fs.writeFile(historyFile, JSON.stringify(this.benchmarkHistory, null, 2), 'utf8');

    // Save detailed regression report
    const reportData = {
      timestamp: this.currentBenchmark.timestamp,
      regressions,
      currentMetrics: this.currentBenchmark.metrics,
      system: this.currentBenchmark.system,
      thresholds: this.thresholds,
      conclusion: regressions.length === 0 ? 'PERFORMANCE_STABLE' : 'REGRESSION_DETECTED'
    };

    const reportFile = path.join(this.projectRoot, 'BMAD-PERFORMANCE-REGRESSION-REPORT.json');
    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2), 'utf8');
    
    console.log(`\n📄 Regression report saved: ${reportFile}`);
    console.log(`📚 Performance history saved: ${historyFile}`);

    return reportData;
  }
}

// Execute regression detection if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new PerformanceRegressionDetector();
  detector.detectRegressions().catch(error => {
    console.error('Regression detection failed:', error);
    process.exit(1);
  });
}

export { PerformanceRegressionDetector };
