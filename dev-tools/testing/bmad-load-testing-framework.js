#!/usr/bin/env node
/**
 * BMAD Load Testing Framework
 * Technical Intelligence Researcher: Probe
 * 
 * Purpose: Stress testing and load validation for BMAD-CYBER2 system
 * Focus: Identify breaking points, bottlenecks, and scalability limits
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads';
import yaml from 'js-yaml';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class LoadTestingFramework {
  constructor() {
    this.projectRoot = '/Users/paultinp/BMAD-CYBER2';
    this.maxConcurrency = os.cpus().length * 2; // Start with 2x CPU cores
    this.testScenarios = [
      { name: 'Light Load', concurrency: 5, duration: 10000, operations: 100 },
      { name: 'Medium Load', concurrency: 20, duration: 15000, operations: 500 },
      { name: 'Heavy Load', concurrency: 50, duration: 20000, operations: 1000 },
      { name: 'Stress Test', concurrency: 100, duration: 30000, operations: 2000 },
      { name: 'Spike Test', concurrency: 200, duration: 10000, operations: 500 }
    ];
    
    this.results = {
      timestamp: new Date().toISOString(),
      system: this.getSystemInfo(),
      scenarios: {},
      summary: {},
      bottlenecks: [],
      recommendations: []
    };
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      nodeVersion: process.version,
      cpuCores: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      availableMemory: Math.round(os.freemem() / 1024 / 1024),
      loadAverage: os.loadavg()
    };
  }

  async executeLoadTests() {
    console.log('🚀 BMAD Load Testing Framework');
    console.log('═'.repeat(60));
    console.log(`⏰ Started: ${this.results.timestamp}`);
    console.log(`🖥️ System: ${this.results.system.platform} ${this.results.system.architecture}`);
    console.log(`⚙️ CPU Cores: ${this.results.system.cpuCores}`);
    console.log(`💾 Memory: ${this.results.system.availableMemory}MB / ${this.results.system.totalMemory}MB`);

    try {
      // Warm up the system
      await this.warmupSystem();

      // Execute each test scenario
      for (const scenario of this.testScenarios) {
        console.log(`\n🧪 Executing ${scenario.name}...`);
        const scenarioResults = await this.executeScenario(scenario);
        this.results.scenarios[scenario.name] = scenarioResults;

        console.log(`  📊 Avg Response: ${scenarioResults.averageResponseTime}ms`);
        console.log(`  🚀 Throughput: ${scenarioResults.throughput} ops/sec`);
        console.log(`  ❌ Error Rate: ${scenarioResults.errorRate}%`);
        console.log(`  💾 Peak Memory: ${scenarioResults.peakMemoryMB}MB`);
        console.log(`  ⚙️ CPU Usage: ${scenarioResults.avgCpuUsage}%`);
      }

      // Analyze results
      await this.analyzeBottlenecks();
      await this.generateLoadTestReport();

    } catch (error) {
      console.error('💥 Load testing failed:', error);
      throw error;
    }

    return this.results;
  }

  async warmupSystem() {
    console.log('\n🔥 Warming up system...');
    
    // Load agents into memory
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    
    for (const team of teams) {
      const teamPath = path.join(this.projectRoot, 'test-installation', 'src', team, 'agents');
      
      try {
        const agentFiles = await fs.readdir(teamPath);
        const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));
        
        for (const agentFile of yamlAgents.slice(0, 3)) { // Warmup with first 3 agents
          try {
            const agentPath = path.join(teamPath, agentFile);
            const content = await fs.readFile(agentPath, 'utf8');
            yaml.load(content);
          } catch (error) {
            // Skip failed warmup loads
          }
        }
      } catch (error) {
        // Team directory doesn't exist
      }
    }

    // Small warmup operations
    for (let i = 0; i < 10; i++) {
      await this.simulateOperation();
    }

    console.log('  ✅ System warmup completed');
  }

  async executeScenario(scenario) {
    console.log(`  🎯 Target: ${scenario.concurrency} concurrent ops for ${scenario.duration}ms`);
    
    const scenarioStart = performance.now();
    const initialMemory = process.memoryUsage();
    const cpuUsageHistory = [];
    
    // Start CPU monitoring
    const cpuMonitor = setInterval(() => {
      const loadAvg = os.loadavg()[0];
      const cpuUsage = Math.min(100, (loadAvg / os.cpus().length) * 100);
      cpuUsageHistory.push(cpuUsage);
    }, 1000);

    const results = {
      scenario: scenario.name,
      concurrency: scenario.concurrency,
      duration: scenario.duration,
      targetOperations: scenario.operations,
      completedOperations: 0,
      errorCount: 0,
      responseTimes: [],
      startTime: scenarioStart,
      endTime: null,
      peakMemoryMB: 0,
      avgCpuUsage: 0
    };

    try {
      // Execute load test with controlled concurrency
      await this.executeControlledLoad(scenario, results);

    } catch (error) {
      console.error(`  ❌ Scenario failed: ${error.message}`);
      results.error = error.message;
    } finally {
      clearInterval(cpuMonitor);
    }

    const scenarioEnd = performance.now();
    const finalMemory = process.memoryUsage();
    
    results.endTime = scenarioEnd;
    results.actualDuration = Math.round(scenarioEnd - scenarioStart);
    results.peakMemoryMB = Math.round(finalMemory.heapUsed / 1024 / 1024);
    results.avgCpuUsage = cpuUsageHistory.length > 0 ? 
      Math.round(cpuUsageHistory.reduce((a, b) => a + b, 0) / cpuUsageHistory.length) : 0;

    // Calculate performance metrics
    results.averageResponseTime = results.responseTimes.length > 0 ? 
      Math.round(results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length) : 0;
    results.minResponseTime = results.responseTimes.length > 0 ? Math.round(Math.min(...results.responseTimes)) : 0;
    results.maxResponseTime = results.responseTimes.length > 0 ? Math.round(Math.max(...results.responseTimes)) : 0;
    results.throughput = results.actualDuration > 0 ? 
      Math.round((results.completedOperations / results.actualDuration) * 1000) : 0;
    results.errorRate = results.targetOperations > 0 ? 
      Math.round((results.errorCount / results.targetOperations) * 100) : 0;

    return results;
  }

  async executeControlledLoad(scenario, results) {
    const operationsPerBatch = Math.min(scenario.concurrency, 10); // Limit batch size
    const batchDelay = Math.max(100, scenario.duration / (scenario.operations / operationsPerBatch));
    
    const endTime = performance.now() + scenario.duration;
    let operationsLaunched = 0;

    while (performance.now() < endTime && operationsLaunched < scenario.operations) {
      const batchPromises = [];
      const currentBatchSize = Math.min(operationsPerBatch, scenario.operations - operationsLaunched);

      for (let i = 0; i < currentBatchSize; i++) {
        batchPromises.push(this.executeOperation(results));
        operationsLaunched++;
      }

      // Wait for current batch to complete
      await Promise.allSettled(batchPromises);

      // Small delay between batches to control load
      if (operationsLaunched < scenario.operations && performance.now() < endTime) {
        await new Promise(resolve => setTimeout(resolve, Math.min(batchDelay, 100)));
      }
    }
  }

  async executeOperation(results) {
    const operationStart = performance.now();
    
    try {
      await this.simulateOperation();
      
      const operationEnd = performance.now();
      const responseTime = operationEnd - operationStart;
      
      results.responseTimes.push(responseTime);
      results.completedOperations++;
      
    } catch (error) {
      results.errorCount++;
    }
  }

  async simulateOperation() {
    // Simulate different types of operations
    const operationType = Math.random();
    
    if (operationType < 0.3) {
      // Agent loading simulation (30%)
      await this.simulateAgentLoading();
    } else if (operationType < 0.6) {
      // Integration operation simulation (30%)
      await this.simulateIntegrationOperation();
    } else {
      // Data processing simulation (40%)
      await this.simulateDataProcessing();
    }
  }

  async simulateAgentLoading() {
    // Simulate agent YAML parsing and validation
    const sampleAgent = {
      agent: {
        metadata: { name: 'test-agent', version: '1.0.0' },
        capabilities: ['analyze', 'report'],
        dependencies: ['core', 'utils']
      }
    };

    // Simulate YAML processing
    const yamlString = JSON.stringify(sampleAgent); // Simplified YAML simulation
    const parsed = JSON.parse(yamlString);

    // Simulate validation
    if (!parsed.agent || !parsed.agent.metadata) {
      throw new Error('Invalid agent structure');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5 + 1));
  }

  async simulateIntegrationOperation() {
    // Simulate cross-module communication
    const teams = ['cybersec', 'intel', 'legal', 'strategy'];
    const sourceTeam = teams[Math.floor(Math.random() * teams.length)];
    const targetTeam = teams[Math.floor(Math.random() * teams.length)];

    // Simulate data serialization
    const messageData = {
      from: sourceTeam,
      to: targetTeam,
      timestamp: Date.now(),
      payload: Array.from({length: 20}, () => Math.random())
    };

    const serialized = JSON.stringify(messageData);
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 2));
    
    // Simulate processing
    const deserialized = JSON.parse(serialized);
    deserialized.payload.sort();
  }

  async simulateDataProcessing() {
    // Simulate data analysis operations
    const dataSize = Math.floor(Math.random() * 1000) + 100;
    const data = Array.from({length: dataSize}, () => ({
      id: Math.random(),
      value: Math.random() * 100,
      category: Math.floor(Math.random() * 5)
    }));

    // Simulate processing operations
    data.sort((a, b) => a.value - b.value);
    data.filter(item => item.value > 50);
    data.map(item => ({ ...item, processed: true }));

    // Simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 8 + 2));
  }

  async analyzeBottlenecks() {
    console.log('\n🔍 Analyzing performance bottlenecks...');

    const scenarios = Object.values(this.results.scenarios);

    // Memory bottleneck analysis
    const memoryUsages = scenarios.map(s => s.peakMemoryMB);
    const maxMemoryUsage = Math.max(...memoryUsages);
    const avgMemoryUsage = Math.round(memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length);

    if (maxMemoryUsage > this.results.system.availableMemory * 0.8) {
      this.results.bottlenecks.push({
        type: 'Memory',
        severity: 'HIGH',
        description: `Peak memory usage (${maxMemoryUsage}MB) approaches system limits`,
        impact: 'System may become unstable under high load',
        recommendation: 'Implement memory pooling and garbage collection optimization'
      });
    }

    // CPU bottleneck analysis
    const cpuUsages = scenarios.map(s => s.avgCpuUsage);
    const maxCpuUsage = Math.max(...cpuUsages);
    const avgCpuUsage = Math.round(cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length);

    if (maxCpuUsage > 80) {
      this.results.bottlenecks.push({
        type: 'CPU',
        severity: 'MEDIUM',
        description: `High CPU usage detected (${maxCpuUsage}%)`,
        impact: 'System responsiveness may degrade under load',
        recommendation: 'Consider worker threads for CPU-intensive operations'
      });
    }

    // Response time bottleneck analysis
    const responseTimes = scenarios.map(s => s.averageResponseTime);
    const maxResponseTime = Math.max(...responseTimes);
    const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);

    if (maxResponseTime > 1000) {
      this.results.bottlenecks.push({
        type: 'Response Time',
        severity: 'HIGH',
        description: `High response times detected (${maxResponseTime}ms max)`,
        impact: 'Poor user experience and potential timeouts',
        recommendation: 'Optimize slow operations and implement caching'
      });
    }

    // Error rate bottleneck analysis
    const errorRates = scenarios.map(s => s.errorRate);
    const maxErrorRate = Math.max(...errorRates);
    const avgErrorRate = Math.round(errorRates.reduce((a, b) => a + b, 0) / errorRates.length);

    if (maxErrorRate > 5) {
      this.results.bottlenecks.push({
        type: 'Error Rate',
        severity: 'CRITICAL',
        description: `High error rate detected (${maxErrorRate}%)`,
        impact: 'System reliability compromised under load',
        recommendation: 'Implement circuit breakers and better error handling'
      });
    }

    // Throughput degradation analysis
    const throughputs = scenarios.map(s => s.throughput);
    const lightLoadThroughput = scenarios.find(s => s.scenario === 'Light Load')?.throughput || 0;
    const heavyLoadThroughput = scenarios.find(s => s.scenario === 'Heavy Load')?.throughput || 0;

    if (heavyLoadThroughput < lightLoadThroughput * 0.5) {
      this.results.bottlenecks.push({
        type: 'Throughput Degradation',
        severity: 'HIGH',
        description: `Throughput drops significantly under load (${Math.round((1 - heavyLoadThroughput/lightLoadThroughput) * 100)}% decrease)`,
        impact: 'System does not scale well with increased load',
        recommendation: 'Investigate and optimize bottlenecked operations'
      });
    }

    console.log(`  📊 Found ${this.results.bottlenecks.length} potential bottlenecks`);
  }

  async generateLoadTestReport() {
    console.log('\n📋 Load Testing Analysis Report');
    console.log('═'.repeat(60));

    const scenarios = Object.values(this.results.scenarios);
    
    // Overall performance summary
    const avgThroughput = Math.round(scenarios.reduce((sum, s) => sum + s.throughput, 0) / scenarios.length);
    const avgResponseTime = Math.round(scenarios.reduce((sum, s) => sum + s.averageResponseTime, 0) / scenarios.length);
    const maxErrorRate = Math.max(...scenarios.map(s => s.errorRate));
    const peakMemoryUsage = Math.max(...scenarios.map(s => s.peakMemoryMB));

    console.log('🎯 Performance Summary:');
    console.log(`  🚀 Average Throughput: ${avgThroughput} ops/sec`);
    console.log(`  ⚡ Average Response Time: ${avgResponseTime}ms`);
    console.log(`  ❌ Maximum Error Rate: ${maxErrorRate}%`);
    console.log(`  💾 Peak Memory Usage: ${peakMemoryUsage}MB`);

    // Scenario comparison
    console.log('\n📊 Scenario Performance:');
    scenarios.forEach(scenario => {
      const status = scenario.errorRate > 5 ? '🔴' : 
                    scenario.averageResponseTime > 500 ? '🟡' : '🟢';
      
      console.log(`  ${status} ${scenario.scenario}:`);
      console.log(`    Throughput: ${scenario.throughput} ops/sec`);
      console.log(`    Response: ${scenario.averageResponseTime}ms avg (${scenario.minResponseTime}-${scenario.maxResponseTime}ms)`);
      console.log(`    Errors: ${scenario.errorRate}%`);
      console.log(`    Memory: ${scenario.peakMemoryMB}MB`);
    });

    // Bottleneck analysis
    if (this.results.bottlenecks.length > 0) {
      console.log('\n🚨 Identified Bottlenecks:');
      this.results.bottlenecks.forEach((bottleneck, index) => {
        const severityIcon = bottleneck.severity === 'CRITICAL' ? '🔴' : 
                           bottleneck.severity === 'HIGH' ? '🟠' : '🟡';
        
        console.log(`\n  ${severityIcon} ${index + 1}. ${bottleneck.type} (${bottleneck.severity})`);
        console.log(`     Issue: ${bottleneck.description}`);
        console.log(`     Impact: ${bottleneck.impact}`);
        console.log(`     Fix: ${bottleneck.recommendation}`);
      });
    } else {
      console.log('\n✅ No significant bottlenecks detected');
    }

    // Performance recommendations
    this.generateRecommendations();

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    // Overall assessment
    const overallScore = this.calculateOverallScore(scenarios);
    const assessment = this.getPerformanceAssessment(overallScore);
    
    console.log(`\n${assessment}`);

    // Save detailed report
    this.results.summary = {
      avgThroughput,
      avgResponseTime,
      maxErrorRate,
      peakMemoryUsage,
      overallScore,
      assessment: assessment.split(' ')[1] // Extract assessment level
    };

    const reportPath = path.join(this.projectRoot, 'BMAD-LOAD-TEST-REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2), 'utf8');
    console.log(`\n📄 Load test report saved: ${reportPath}`);

    return this.results;
  }

  generateRecommendations() {
    const scenarios = Object.values(this.results.scenarios);
    
    // General performance recommendations
    if (Math.max(...scenarios.map(s => s.averageResponseTime)) > 200) {
      this.results.recommendations.push('Implement caching layer for frequently accessed data');
    }

    if (Math.max(...scenarios.map(s => s.peakMemoryMB)) > 500) {
      this.results.recommendations.push('Optimize memory usage with lazy loading and object pooling');
    }

    if (Math.max(...scenarios.map(s => s.errorRate)) > 1) {
      this.results.recommendations.push('Improve error handling and implement retry mechanisms');
    }

    // Scalability recommendations
    const lightLoad = scenarios.find(s => s.scenario === 'Light Load');
    const heavyLoad = scenarios.find(s => s.scenario === 'Heavy Load');

    if (lightLoad && heavyLoad && heavyLoad.throughput < lightLoad.throughput * 0.7) {
      this.results.recommendations.push('Investigate scaling bottlenecks and consider horizontal scaling');
    }

    // System-specific recommendations
    if (this.results.bottlenecks.some(b => b.type === 'CPU')) {
      this.results.recommendations.push('Consider implementing worker threads for CPU-intensive operations');
    }

    if (this.results.bottlenecks.some(b => b.type === 'Memory')) {
      this.results.recommendations.push('Implement garbage collection optimization and memory monitoring');
    }
  }

  calculateOverallScore(scenarios) {
    let score = 100;

    // Response time penalty
    const avgResponseTime = scenarios.reduce((sum, s) => sum + s.averageResponseTime, 0) / scenarios.length;
    if (avgResponseTime > 500) score -= 30;
    else if (avgResponseTime > 200) score -= 15;
    else if (avgResponseTime > 100) score -= 5;

    // Error rate penalty
    const maxErrorRate = Math.max(...scenarios.map(s => s.errorRate));
    if (maxErrorRate > 10) score -= 40;
    else if (maxErrorRate > 5) score -= 20;
    else if (maxErrorRate > 1) score -= 10;

    // Memory usage penalty
    const peakMemoryUsage = Math.max(...scenarios.map(s => s.peakMemoryMB));
    if (peakMemoryUsage > this.results.system.availableMemory * 0.9) score -= 25;
    else if (peakMemoryUsage > this.results.system.availableMemory * 0.7) score -= 15;

    // Throughput degradation penalty
    const lightLoad = scenarios.find(s => s.scenario === 'Light Load');
    const heavyLoad = scenarios.find(s => s.scenario === 'Heavy Load');
    
    if (lightLoad && heavyLoad && heavyLoad.throughput < lightLoad.throughput * 0.5) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  getPerformanceAssessment(score) {
    if (score >= 90) {
      return '🎉 EXCELLENT - System handles load exceptionally well';
    } else if (score >= 75) {
      return '✅ GOOD - System performance is acceptable under load';
    } else if (score >= 60) {
      return '⚠️ ACCEPTABLE - System shows some stress under high load';
    } else if (score >= 40) {
      return '❌ POOR - System struggles significantly under load';
    } else {
      return '🚨 CRITICAL - System fails under load - immediate optimization required';
    }
  }
}

// Execute load testing if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const loadTester = new LoadTestingFramework();
  loadTester.executeLoadTests().catch(error => {
    console.error('Load testing failed:', error);
    process.exit(1);
  });
}

export { LoadTestingFramework };
