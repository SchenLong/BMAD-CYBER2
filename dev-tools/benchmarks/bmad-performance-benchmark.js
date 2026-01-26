#!/usr/bin/env node
/**
 * BMAD Performance Benchmark Suite
 * Measures installation time, memory usage, agent loading performance
 *
 * Focus: Performance impact assessment of specialized teams distribution
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PerformanceBenchmark {
  constructor() {
    this.distributionPath = path.join(__dirname, '_bmad-output/dist');
    this.testInstallPath = path.join(__dirname, 'test-installation');
    this.benchmarkResults = {
      timestamp: new Date().toISOString(),
      system: this.getSystemInfo(),
      installation: {},
      agentLoading: {},
      memoryUsage: {},
      fileSystem: {},
      concurrency: {},
      recommendations: []
    };
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      nodeVersion: process.version,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
      availableMemory: Math.round(os.freemem() / 1024 / 1024), // MB
      cpuCores: os.cpus().length
    };
  }

  async runBenchmarks() {
    console.log('⏱️ BMAD Performance Benchmark Suite');
    console.log('═'.repeat(60));
    console.log(`🖥️  System: ${this.benchmarkResults.system.platform} ${this.benchmarkResults.system.architecture}`);
    console.log(`💾 Memory: ${this.benchmarkResults.system.availableMemory}MB / ${this.benchmarkResults.system.totalMemory}MB`);
    console.log(`🔧 Node.js: ${this.benchmarkResults.system.nodeVersion}`);
    console.log(`⚙️ CPU Cores: ${this.benchmarkResults.system.cpuCores}`);

    try {
      // Benchmark 1: Installation Performance
      await this.benchmarkInstallation();

      // Benchmark 2: Agent Loading Performance
      await this.benchmarkAgentLoading();

      // Benchmark 3: Memory Usage Analysis
      await this.benchmarkMemoryUsage();

      // Benchmark 4: File System Performance
      await this.benchmarkFileSystemPerformance();

      // Benchmark 5: Concurrent Access Performance
      await this.benchmarkConcurrentAccess();

      // Generate performance report
      await this.generatePerformanceReport();

    } catch (error) {
      console.error('💥 Benchmark suite failed:', error);
      throw error;
    }

    return this.benchmarkResults;
  }

  async benchmarkInstallation() {
    console.log('\n📦 BENCHMARK 1: Installation Performance');
    console.log('-'.repeat(50));

    try {
      // Measure package extraction time
      const extractionStart = performance.now();

      // Simulate package extraction by reading all module files
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      let totalFiles = 0;
      let totalSize = 0;

      for (const team of teams) {
        const teamPath = path.join(this.distributionPath, 'src', team);
        const stats = await this.getDirectoryStats(teamPath);
        totalFiles += stats.fileCount;
        totalSize += stats.totalSize;
      }

      const extractionEnd = performance.now();
      const extractionTime = extractionEnd - extractionStart;

      // Measure dependency installation simulation
      const depInstallStart = performance.now();

      // Simulate npm install by reading package.json files
      for (const team of teams) {
        const packageJsonPath = path.join(this.distributionPath, 'src', team, 'package.json');
        try {
          const packageContent = await fs.readFile(packageJsonPath, 'utf8');
          JSON.parse(packageContent);
        } catch (error) {
          // Package.json might not exist for all teams
        }
      }

      const depInstallEnd = performance.now();
      const dependencyInstallTime = depInstallEnd - depInstallStart;

      // Measure module validation time
      const validationStart = performance.now();

      for (const team of teams) {
        await this.validateTeamModule(team);
      }

      const validationEnd = performance.now();
      const validationTime = validationEnd - validationStart;

      this.benchmarkResults.installation = {
        extractionTime: Math.round(extractionTime),
        dependencyInstallTime: Math.round(dependencyInstallTime),
        validationTime: Math.round(validationTime),
        totalInstallTime: Math.round(extractionTime + dependencyInstallTime + validationTime),
        totalFiles,
        totalSize: Math.round(totalSize / 1024), // KB
        throughput: Math.round((totalSize / 1024) / (extractionTime / 1000)) // KB/s
      };

      console.log(`  📁 Files processed: ${totalFiles}`);
      console.log(`  💾 Total size: ${this.benchmarkResults.installation.totalSize}KB`);
      console.log(`  ⏱️ Extraction time: ${this.benchmarkResults.installation.extractionTime}ms`);
      console.log(`  📦 Dependency install: ${this.benchmarkResults.installation.dependencyInstallTime}ms`);
      console.log(`  ✅ Validation time: ${this.benchmarkResults.installation.validationTime}ms`);
      console.log(`  🎯 Total install time: ${this.benchmarkResults.installation.totalInstallTime}ms`);
      console.log(`  🚀 Throughput: ${this.benchmarkResults.installation.throughput}KB/s`);

      // Performance assessment
      if (this.benchmarkResults.installation.totalInstallTime < 5000) {
        this.benchmarkResults.recommendations.push('✅ Installation performance is excellent');
      } else if (this.benchmarkResults.installation.totalInstallTime < 10000) {
        this.benchmarkResults.recommendations.push('⚠️ Installation performance is acceptable');
      } else {
        this.benchmarkResults.recommendations.push('❌ Installation performance needs optimization');
      }

    } catch (error) {
      console.error('❌ Installation benchmark failed:', error.message);
      this.benchmarkResults.installation.error = error.message;
    }
  }

  async benchmarkAgentLoading() {
    console.log('\n🤖 BENCHMARK 2: Agent Loading Performance');
    console.log('-'.repeat(50));

    try {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const loadingResults = {};
      let totalAgents = 0;
      let totalLoadTime = 0;

      for (const team of teams) {
        const teamStart = performance.now();
        const agentResults = await this.benchmarkTeamAgentLoading(team);
        const teamEnd = performance.now();

        loadingResults[team] = {
          ...agentResults,
          loadTime: Math.round(teamEnd - teamStart)
        };

        totalAgents += agentResults.agentCount;
        totalLoadTime += loadingResults[team].loadTime;

        console.log(`  ${team}: ${agentResults.agentCount} agents in ${loadingResults[team].loadTime}ms`);
      }

      // Calculate overall metrics
      const avgLoadTimePerAgent = totalAgents > 0 ? Math.round(totalLoadTime / totalAgents) : 0;
      const agentsPerSecond = totalLoadTime > 0 ? Math.round((totalAgents / totalLoadTime) * 1000) : 0;

      this.benchmarkResults.agentLoading = {
        totalAgents,
        totalLoadTime,
        avgLoadTimePerAgent,
        agentsPerSecond,
        teamResults: loadingResults
      };

      console.log(`  📊 Total agents: ${totalAgents}`);
      console.log(`  ⏱️ Total load time: ${totalLoadTime}ms`);
      console.log(`  📈 Average per agent: ${avgLoadTimePerAgent}ms`);
      console.log(`  🚀 Agents per second: ${agentsPerSecond}`);

      // Performance assessment
      if (avgLoadTimePerAgent < 50) {
        this.benchmarkResults.recommendations.push('✅ Agent loading performance is excellent');
      } else if (avgLoadTimePerAgent < 100) {
        this.benchmarkResults.recommendations.push('⚠️ Agent loading performance is acceptable');
      } else {
        this.benchmarkResults.recommendations.push('❌ Agent loading performance needs optimization');
      }

    } catch (error) {
      console.error('❌ Agent loading benchmark failed:', error.message);
      this.benchmarkResults.agentLoading.error = error.message;
    }
  }

  async benchmarkTeamAgentLoading(team) {
    const agentsPath = path.join(this.distributionPath, 'src', team, 'agents');

    try {
      const agentFiles = await fs.readdir(agentsPath);
      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

      let successfulLoads = 0;
      let failedLoads = 0;
      const loadTimes = [];

      for (const agentFile of yamlAgents) {
        const agentPath = path.join(agentsPath, agentFile);

        const loadStart = performance.now();
        try {
          const content = await fs.readFile(agentPath, 'utf8');
          const agentConfig = yaml.load(content);

          // Validate basic structure
          if (agentConfig.agent && agentConfig.agent.metadata) {
            successfulLoads++;
          } else {
            failedLoads++;
          }
        } catch (error) {
          failedLoads++;
        }
        const loadEnd = performance.now();

        loadTimes.push(loadEnd - loadStart);
      }

      return {
        agentCount: yamlAgents.length,
        successfulLoads,
        failedLoads,
        avgLoadTime: loadTimes.length > 0 ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : 0,
        maxLoadTime: loadTimes.length > 0 ? Math.round(Math.max(...loadTimes)) : 0,
        minLoadTime: loadTimes.length > 0 ? Math.round(Math.min(...loadTimes)) : 0
      };

    } catch (error) {
      return {
        agentCount: 0,
        successfulLoads: 0,
        failedLoads: 0,
        error: error.message
      };
    }
  }

  async benchmarkMemoryUsage() {
    console.log('\n💾 BENCHMARK 3: Memory Usage Analysis');
    console.log('-'.repeat(50));

    try {
      const initialMemory = process.memoryUsage();

      // Load all agents into memory to simulate real usage
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const loadedAgents = [];

      for (const team of teams) {
        const agentsPath = path.join(this.distributionPath, 'src', team, 'agents');
        const agentFiles = await fs.readdir(agentsPath);
        const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

        for (const agentFile of yamlAgents) {
          const agentPath = path.join(agentsPath, agentFile);
          try {
            const content = await fs.readFile(agentPath, 'utf8');
            const agentConfig = yaml.load(content);
            loadedAgents.push(agentConfig);
          } catch (error) {
            // Skip failed loads
          }
        }
      }

      const peakMemory = process.memoryUsage();

      // Force garbage collection if possible
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();

      this.benchmarkResults.memoryUsage = {
        initial: {
          heapUsed: Math.round(initialMemory.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(initialMemory.heapTotal / 1024 / 1024),
          rss: Math.round(initialMemory.rss / 1024 / 1024)
        },
        peak: {
          heapUsed: Math.round(peakMemory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(peakMemory.heapTotal / 1024 / 1024),
          rss: Math.round(peakMemory.rss / 1024 / 1024)
        },
        final: {
          heapUsed: Math.round(finalMemory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(finalMemory.heapTotal / 1024 / 1024),
          rss: Math.round(finalMemory.rss / 1024 / 1024)
        },
        agentsLoaded: loadedAgents.length,
        memoryPerAgent: loadedAgents.length > 0 ?
          Math.round((peakMemory.heapUsed - initialMemory.heapUsed) / loadedAgents.length / 1024) : 0 // KB
      };

      console.log(`  🔢 Agents loaded: ${this.benchmarkResults.memoryUsage.agentsLoaded}`);
      console.log(`  📊 Initial heap: ${this.benchmarkResults.memoryUsage.initial.heapUsed}MB`);
      console.log(`  📈 Peak heap: ${this.benchmarkResults.memoryUsage.peak.heapUsed}MB`);
      console.log(`  📉 Final heap: ${this.benchmarkResults.memoryUsage.final.heapUsed}MB`);
      console.log(`  🤖 Memory per agent: ${this.benchmarkResults.memoryUsage.memoryPerAgent}KB`);

      // Memory efficiency assessment
      if (this.benchmarkResults.memoryUsage.memoryPerAgent < 50) {
        this.benchmarkResults.recommendations.push('✅ Memory efficiency is excellent');
      } else if (this.benchmarkResults.memoryUsage.memoryPerAgent < 100) {
        this.benchmarkResults.recommendations.push('⚠️ Memory efficiency is acceptable');
      } else {
        this.benchmarkResults.recommendations.push('❌ Memory efficiency needs optimization');
      }

    } catch (error) {
      console.error('❌ Memory usage benchmark failed:', error.message);
      this.benchmarkResults.memoryUsage.error = error.message;
    }
  }

  async benchmarkFileSystemPerformance() {
    console.log('\n💾 BENCHMARK 4: File System Performance');
    console.log('-'.repeat(50));

    try {
      // Measure sequential file reading
      const sequentialStart = performance.now();
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      let totalFilesRead = 0;

      for (const team of teams) {
        const agentsPath = path.join(this.distributionPath, 'src', team, 'agents');
        const agentFiles = await fs.readdir(agentsPath);

        for (const agentFile of agentFiles.filter(f => f.endsWith('.agent.yaml'))) {
          const agentPath = path.join(agentsPath, agentFile);
          await fs.readFile(agentPath, 'utf8');
          totalFilesRead++;
        }
      }

      const sequentialEnd = performance.now();
      const sequentialTime = sequentialEnd - sequentialStart;

      // Measure concurrent file reading
      const concurrentStart = performance.now();
      const readPromises = [];

      for (const team of teams) {
        const agentsPath = path.join(this.distributionPath, 'src', team, 'agents');
        const agentFiles = await fs.readdir(agentsPath);

        for (const agentFile of agentFiles.filter(f => f.endsWith('.agent.yaml'))) {
          const agentPath = path.join(agentsPath, agentFile);
          readPromises.push(fs.readFile(agentPath, 'utf8'));
        }
      }

      await Promise.all(readPromises);
      const concurrentEnd = performance.now();
      const concurrentTime = concurrentEnd - concurrentStart;

      this.benchmarkResults.fileSystem = {
        totalFiles: totalFilesRead,
        sequentialTime: Math.round(sequentialTime),
        concurrentTime: Math.round(concurrentTime),
        sequentialThroughput: Math.round(totalFilesRead / (sequentialTime / 1000)), // files/sec
        concurrentThroughput: Math.round(totalFilesRead / (concurrentTime / 1000)), // files/sec
        concurrentSpeedup: Math.round((sequentialTime / concurrentTime) * 100) / 100
      };

      console.log(`  📁 Total files: ${totalFilesRead}`);
      console.log(`  ⏱️ Sequential time: ${this.benchmarkResults.fileSystem.sequentialTime}ms`);
      console.log(`  🚀 Concurrent time: ${this.benchmarkResults.fileSystem.concurrentTime}ms`);
      console.log(`  📈 Sequential throughput: ${this.benchmarkResults.fileSystem.sequentialThroughput} files/sec`);
      console.log(`  💨 Concurrent throughput: ${this.benchmarkResults.fileSystem.concurrentThroughput} files/sec`);
      console.log(`  🎯 Speedup: ${this.benchmarkResults.fileSystem.concurrentSpeedup}x`);

      // File system performance assessment
      if (this.benchmarkResults.fileSystem.concurrentSpeedup > 2) {
        this.benchmarkResults.recommendations.push('✅ File system concurrency is excellent');
      } else if (this.benchmarkResults.fileSystem.concurrentSpeedup > 1.5) {
        this.benchmarkResults.recommendations.push('⚠️ File system concurrency is acceptable');
      } else {
        this.benchmarkResults.recommendations.push('❌ File system concurrency needs improvement');
      }

    } catch (error) {
      console.error('❌ File system benchmark failed:', error.message);
      this.benchmarkResults.fileSystem.error = error.message;
    }
  }

  async benchmarkConcurrentAccess() {
    console.log('\n👥 BENCHMARK 5: Concurrent Access Performance');
    console.log('-'.repeat(50));

    try {
      const concurrencyLevels = [1, 5, 10, 20];
      const results = {};

      for (const concurrency of concurrencyLevels) {
        console.log(`  🔄 Testing ${concurrency} concurrent operations...`);

        const start = performance.now();
        const promises = [];

        for (let i = 0; i < concurrency; i++) {
          promises.push(this.simulateConcurrentAgentLoad());
        }

        await Promise.all(promises);
        const end = performance.now();

        results[concurrency] = {
          time: Math.round(end - start),
          throughput: Math.round(concurrency / ((end - start) / 1000))
        };

        console.log(`    ⏱️ ${results[concurrency].time}ms (${results[concurrency].throughput} ops/sec)`);
      }

      this.benchmarkResults.concurrency = results;

      // Find optimal concurrency level
      const throughputs = Object.entries(results).map(([level, data]) => ({
        level: parseInt(level),
        throughput: data.throughput
      }));

      const maxThroughput = Math.max(...throughputs.map(t => t.throughput));
      const optimalLevel = throughputs.find(t => t.throughput === maxThroughput).level;

      console.log(`  🎯 Optimal concurrency: ${optimalLevel} (${maxThroughput} ops/sec)`);

      this.benchmarkResults.concurrency.optimal = {
        level: optimalLevel,
        throughput: maxThroughput
      };

    } catch (error) {
      console.error('❌ Concurrent access benchmark failed:', error.message);
      this.benchmarkResults.concurrency.error = error.message;
    }
  }

  async simulateConcurrentAgentLoad() {
    // Simulate loading a random agent
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const randomTeam = teams[Math.floor(Math.random() * teams.length)];

    const agentsPath = path.join(this.distributionPath, 'src', randomTeam, 'agents');

    try {
      const agentFiles = await fs.readdir(agentsPath);
      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

      if (yamlAgents.length > 0) {
        const randomAgent = yamlAgents[Math.floor(Math.random() * yamlAgents.length)];
        const agentPath = path.join(agentsPath, randomAgent);
        const content = await fs.readFile(agentPath, 'utf8');
        yaml.load(content);
      }
    } catch (error) {
      // Ignore errors in simulation
    }
  }

  async getDirectoryStats(dirPath) {
    let fileCount = 0;
    let totalSize = 0;

    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          const subStats = await this.getDirectoryStats(itemPath);
          fileCount += subStats.fileCount;
          totalSize += subStats.totalSize;
        } else {
          const stats = await fs.stat(itemPath);
          fileCount++;
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return { fileCount, totalSize };
  }

  async validateTeamModule(team) {
    const teamPath = path.join(this.distributionPath, 'src', team);

    try {
      // Check module.yaml exists and is valid
      const moduleYamlPath = path.join(teamPath, 'module.yaml');
      const moduleContent = await fs.readFile(moduleYamlPath, 'utf8');
      yaml.load(moduleContent);

      // Check agents directory exists
      await fs.access(path.join(teamPath, 'agents'));

      // Check workflows directory exists
      await fs.access(path.join(teamPath, 'workflows'));

      return true;
    } catch (error) {
      return false;
    }
  }

  async generatePerformanceReport() {
    console.log('\n📋 Performance Benchmark Summary');
    console.log('═'.repeat(50));

    // Overall performance score
    let performanceScore = 100;

    if (this.benchmarkResults.installation.totalInstallTime > 5000) performanceScore -= 20;
    if (this.benchmarkResults.agentLoading.avgLoadTimePerAgent > 100) performanceScore -= 20;
    if (this.benchmarkResults.memoryUsage.memoryPerAgent > 100) performanceScore -= 15;
    if (this.benchmarkResults.fileSystem.concurrentSpeedup < 2) performanceScore -= 15;

    this.benchmarkResults.overallScore = Math.max(0, performanceScore);

    console.log(`🎯 Overall Performance Score: ${this.benchmarkResults.overallScore}/100`);
    console.log('');

    // Key metrics summary
    console.log('🔑 Key Performance Metrics:');
    console.log(`  📦 Total install time: ${this.benchmarkResults.installation.totalInstallTime}ms`);
    console.log(`  🤖 Agent load time: ${this.benchmarkResults.agentLoading.avgLoadTimePerAgent}ms/agent`);
    console.log(`  💾 Memory per agent: ${this.benchmarkResults.memoryUsage.memoryPerAgent}KB`);
    console.log(`  💾 File system speedup: ${this.benchmarkResults.fileSystem.concurrentSpeedup}x`);
    console.log(`  👥 Optimal concurrency: ${this.benchmarkResults.concurrency.optimal?.level || 'N/A'}`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    this.benchmarkResults.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });

    // Performance classification
    let classification;
    if (this.benchmarkResults.overallScore >= 90) {
      classification = '🎉 EXCELLENT - Ready for high-scale deployment';
    } else if (this.benchmarkResults.overallScore >= 75) {
      classification = '✅ GOOD - Ready for production deployment';
    } else if (this.benchmarkResults.overallScore >= 60) {
      classification = '⚠️ ACCEPTABLE - Monitor performance in production';
    } else {
      classification = '❌ NEEDS OPTIMIZATION - Address performance issues before deployment';
    }

    console.log(`\n${classification}`);

    // Save detailed report
    const reportPath = path.join(__dirname, 'BMAD-PERFORMANCE-BENCHMARK-REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(this.benchmarkResults, null, 2), 'utf8');
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

    return this.benchmarkResults;
  }
}

// Run benchmarks if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runBenchmarks().catch(error => {
    console.error('Performance benchmark failed:', error);
    process.exit(1);
  });
}

export { PerformanceBenchmark };