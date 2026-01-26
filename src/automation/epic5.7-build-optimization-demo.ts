/**
 * BMAD EPIC 5.7 BUILD OPTIMIZATION DEMO
 * Demonstration of build performance optimization capabilities
 *
 * @module automation/epic5.7-demo
 * @version 1.0.0
 * @epic Epic 5 - Story 5.7: Build Performance Optimization
 */

import { BuildCacheManager } from './caching/build-cache-manager';
import { IncrementalBuilder } from './incremental/incremental-builder';
import { BuildTimeProfiler } from './build-time/build-time-profiler';
import { BuildMonitor } from './monitoring/build-monitor';
import { OptimizationEngine } from './optimization/optimization-engine';
import { ParallelCoordinator, BuildTask } from './parallel-builds/parallel-coordinator';
import { ResourceOptimizer } from './resource-optimization/resource-optimizer';

/**
 * Epic 5.7 Integration Demo
 * Demonstrates all build optimization components working together
 */
export async function runOptimizationDemo(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BMAD EPIC 5.7: BUILD PERFORMANCE OPTIMIZATION DEMO');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Initialize all components
  const cacheManager = new BuildCacheManager({
    maxCacheSize: 500 * 1024 * 1024, // 500MB
    ttl: 3600000 // 1 hour
  });

  const incrementalBuilder = new IncrementalBuilder({
    sourceDir: './src',
    outputDir: './dist',
    enableFileWatching: false
  });

  const profiler = new BuildTimeProfiler();

  const monitor = new BuildMonitor({
    alertThresholds: {
      buildDuration: 60000,
      memoryUsage: 0.8,
      cpuUsage: 0.9
    }
  });

  const optimizer = new OptimizationEngine({
    enableAutoOptimization: true,
    minSampleSize: 3
  });

  const coordinator = new ParallelCoordinator({
    maxWorkers: 4,
    schedulingStrategy: 'priority',
    enableLoadBalancing: true
  });

  const resourceOptimizer = new ResourceOptimizer({
    maxCpuPercent: 80,
    maxMemoryPercent: 75,
    autoScale: true
  });

  // Start monitoring
  monitor.start();
  resourceOptimizer.start();

  console.log('1. CACHE MANAGER DEMO');
  console.log('─────────────────────');

  // Demo cache operations
  const cacheKey = 'demo-build-target-v1';
  const cachedResult = {
    success: true,
    artifacts: ['dist/bundle.js', 'dist/bundle.css'],
    duration: 5000
  };

  await cacheManager.set(cacheKey, cachedResult);
  console.log(`   ✓ Cached build result for: ${cacheKey}`);

  const retrieved = await cacheManager.get(cacheKey);
  console.log(`   ✓ Retrieved from cache: ${retrieved ? 'HIT' : 'MISS'}`);
  console.log(`   ✓ Cache stats: ${JSON.stringify(cacheManager.getStats())}\n`);

  console.log('2. BUILD PROFILER DEMO');
  console.log('──────────────────────');

  // Demo profiling
  profiler.startSession('demo-build');
  profiler.startPhase('initialization');
  await simulateWork(100);
  profiler.endPhase('initialization');

  profiler.startPhase('compilation');
  await simulateWork(200);
  profiler.endPhase('compilation');

  profiler.startPhase('bundling');
  await simulateWork(150);
  profiler.endPhase('bundling');

  const profile = profiler.endSession();
  console.log(`   ✓ Build session profiled`);
  console.log(`   ✓ Total duration: ${profile.totalDuration}ms`);
  console.log(`   ✓ Phases: ${profile.phases.map(p => `${p.name}(${p.duration}ms)`).join(', ')}\n`);

  console.log('3. OPTIMIZATION ENGINE DEMO');
  console.log('───────────────────────────');

  // Record some builds for optimization analysis
  optimizer.recordBuild('target-a', 5000, { cached: false, dependencies: 5 });
  optimizer.recordBuild('target-a', 4800, { cached: false, dependencies: 5 });
  optimizer.recordBuild('target-a', 5200, { cached: false, dependencies: 5 });
  optimizer.recordBuild('target-b', 12000, { cached: true, dependencies: 2 });
  optimizer.recordBuild('target-b', 2000, { cached: true, dependencies: 2 });

  const recommendations = optimizer.analyzeAll();
  console.log(`   ✓ Analyzed build patterns`);
  console.log(`   ✓ Recommendations generated: ${recommendations.length}`);
  for (const rec of recommendations.slice(0, 3)) {
    console.log(`     - [${rec.priority.toUpperCase()}] ${rec.title}`);
  }
  console.log();

  console.log('4. PARALLEL COORDINATOR DEMO');
  console.log('────────────────────────────');

  // Create demo tasks
  const tasks: BuildTask[] = [
    createDemoTask('task-1', 'Build Core', [], 100),
    createDemoTask('task-2', 'Build Utils', ['task-1'], 80),
    createDemoTask('task-3', 'Build Components', ['task-1'], 120),
    createDemoTask('task-4', 'Build Tests', ['task-2', 'task-3'], 90),
    createDemoTask('task-5', 'Bundle All', ['task-4'], 60)
  ];

  coordinator.addTasks(tasks);
  const plan = coordinator.createExecutionPlan(tasks.map(t => t.id));

  console.log(`   ✓ Tasks added: ${tasks.length}`);
  console.log(`   ✓ Execution phases: ${plan.phases.length}`);
  console.log(`   ✓ Critical path: ${plan.criticalPath.join(' → ')}`);
  console.log(`   ✓ Estimated duration: ${plan.estimatedDuration}ms`);
  console.log(`   ✓ Max parallelism: ${plan.parallelism}\n`);

  console.log('5. RESOURCE OPTIMIZER DEMO');
  console.log('──────────────────────────');

  // Demo resource allocation
  const alloc1 = resourceOptimizer.allocate({
    processId: 'build-process-1',
    cpuCores: 2,
    memoryMB: 512,
    priority: 8
  });

  const alloc2 = resourceOptimizer.allocate({
    processId: 'build-process-2',
    cpuCores: 1,
    memoryMB: 256,
    priority: 5
  });

  console.log(`   ✓ Allocated resources for 2 processes`);
  console.log(`   ✓ Available resources: ${JSON.stringify(resourceOptimizer.getAvailableResources())}`);

  const suggestions = resourceOptimizer.getSuggestions();
  console.log(`   ✓ Optimization suggestions: ${suggestions.length}`);

  // Release allocations
  if (alloc1) resourceOptimizer.release(alloc1.id);
  if (alloc2) resourceOptimizer.release(alloc2.id);
  console.log();

  console.log('6. BUILD MONITOR STATUS');
  console.log('───────────────────────');

  monitor.recordBuildStart('demo-build-1');
  await simulateWork(50);
  monitor.recordBuildEnd('demo-build-1', true);

  const monitorStats = monitor.getStats();
  console.log(`   ✓ Monitor active: true`);
  console.log(`   ✓ Active builds: ${monitorStats.activeBuilds}`);
  console.log(`   ✓ Alerts triggered: ${monitorStats.totalAlerts}`);
  console.log();

  // Cleanup
  monitor.shutdown();
  resourceOptimizer.shutdown();
  optimizer.shutdown();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  EPIC 5.7 DEMO COMPLETE - All components operational');
  console.log('═══════════════════════════════════════════════════════════════');
}

function createDemoTask(id: string, name: string, deps: string[], duration: number): BuildTask {
  return {
    id,
    name,
    priority: 5,
    dependencies: deps,
    estimatedDuration: duration,
    resourceRequirements: {
      cpuCores: 1,
      memoryMB: 256,
      diskMB: 100,
      gpuRequired: false,
      networkRequired: false,
      exclusiveResources: []
    },
    executor: {
      type: 'inline',
      handler: async () => {
        await simulateWork(duration);
        return {
          success: true,
          outputs: {},
          duration,
          logs: [`${name} completed`],
          metrics: { cpuTime: duration, memoryPeak: 256, ioOperations: 10, networkTransferred: 0 }
        };
      }
    },
    metadata: {},
    retryCount: 0,
    maxRetries: 2
  };
}

function simulateWork(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for programmatic usage
export {
  BuildCacheManager,
  IncrementalBuilder,
  BuildTimeProfiler,
  BuildMonitor,
  OptimizationEngine,
  ParallelCoordinator,
  ResourceOptimizer
};

// Run demo if executed directly
if (require.main === module) {
  runOptimizationDemo().catch(console.error);
}
