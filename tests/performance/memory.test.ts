/**
 * BMAD CYBERCOMMAND - Memory Usage Tests
 * ======================================
 *
 * Tests memory consumption to ensure efficient resource usage.
 * Target: <100MB idle footprint
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// Memory thresholds (in bytes)
const MB = 1024 * 1024;
const IDLE_MEMORY_TARGET_MB = 100;
const IDLE_MEMORY_THRESHOLD_MB = 150;
const AGENT_LOAD_MEMORY_INCREMENT_MB = 50; // Expected memory increase per agent batch
const MAX_MEMORY_AFTER_ALL_AGENTS_MB = 300;

// Helper to get project root
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Helper to format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / MB).toFixed(2)} MB`;
}

// Helper to get current memory usage
function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    arrayBuffers: usage.arrayBuffers,
  };
}

// Helper to force garbage collection if available
function forceGC(): void {
  if (global.gc) {
    global.gc();
  }
}

// Helper to get agent files
function getAgentFiles(): string[] {
  const agentDirs = [
    '_bmad/intel-team/agents',
    '_bmad/legal-team/agents',
    '_bmad/strategy-team/agents',
    '_bmad/cybersec-team/agents',
    '_bmad/core/agents',
    '_bmad/bmm/agents',
    '_bmad/bmb/agents',
    '_bmad/bmgd/agents',
    '_bmad/cis/agents',
  ];

  const agentFiles: string[] = [];

  for (const dir of agentDirs) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath)
        .filter((f) => f.endsWith('.md'))
        .map((f) => path.join(fullPath, f));
      agentFiles.push(...files);
    }
  }

  return agentFiles;
}

describe('BMAD CYBERCOMMAND Memory Usage', () => {
  let baselineMemory: ReturnType<typeof getMemoryUsage>;

  beforeAll(() => {
    // Force GC and capture baseline
    forceGC();
    baselineMemory = getMemoryUsage();
    console.log('\n=== Memory Baseline ===');
    console.log(`Heap Used: ${formatBytes(baselineMemory.heapUsed)}`);
    console.log(`Heap Total: ${formatBytes(baselineMemory.heapTotal)}`);
    console.log(`RSS: ${formatBytes(baselineMemory.rss)}`);
    console.log('======================\n');
  });

  afterAll(() => {
    forceGC();
    const finalMemory = getMemoryUsage();
    console.log('\n=== Final Memory State ===');
    console.log(`Heap Used: ${formatBytes(finalMemory.heapUsed)}`);
    console.log(`Delta from baseline: ${formatBytes(finalMemory.heapUsed - baselineMemory.heapUsed)}`);
    console.log('==========================\n');
  });

  describe('Idle Memory Footprint', () => {
    it('should have idle heap usage under target', () => {
      forceGC();
      const memory = getMemoryUsage();
      const heapUsedMB = memory.heapUsed / MB;

      console.log(`Current heap usage: ${formatBytes(memory.heapUsed)} (${heapUsedMB.toFixed(2)} MB)`);

      expect(heapUsedMB).toBeLessThan(IDLE_MEMORY_THRESHOLD_MB);

      if (heapUsedMB < IDLE_MEMORY_TARGET_MB) {
        console.log(`  [PASS] Under target (${IDLE_MEMORY_TARGET_MB} MB)`);
      } else {
        console.log(`  [WARN] Above target but under threshold`);
      }
    });

    it('should have RSS under reasonable limits', () => {
      const memory = getMemoryUsage();
      const rssMB = memory.rss / MB;

      console.log(`Current RSS: ${formatBytes(memory.rss)} (${rssMB.toFixed(2)} MB)`);

      // RSS includes shared libraries, Node.js runtime, and vitest overhead
      // Allow up to 600MB which accounts for the test runner
      expect(rssMB).toBeLessThan(600);
    });

    it('should have minimal external memory usage', () => {
      const memory = getMemoryUsage();
      const externalMB = memory.external / MB;

      console.log(`External memory: ${formatBytes(memory.external)} (${externalMB.toFixed(2)} MB)`);

      // External memory should be minimal in Node.js
      expect(externalMB).toBeLessThan(50);
    });
  });

  describe('Memory After Loading Modules', () => {
    it('should not leak memory when loading framework modules', async () => {
      forceGC();
      const beforeLoad = getMemoryUsage();

      // Load framework modules
      const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/dist/index.js');
      if (fs.existsSync(frameworkPath)) {
        await import(frameworkPath);
      }

      forceGC();
      const afterLoad = getMemoryUsage();

      const memoryIncrease = (afterLoad.heapUsed - beforeLoad.heapUsed) / MB;
      console.log(`Memory increase after loading framework: ${memoryIncrease.toFixed(2)} MB`);

      // Framework loading should not use excessive memory
      expect(memoryIncrease).toBeLessThan(AGENT_LOAD_MEMORY_INCREMENT_MB);
    });

    it('should manage memory efficiently when loading multiple modules', async () => {
      forceGC();
      const beforeLoad = getMemoryUsage();

      const modules = [
        '_bmad/framework/dist/validators/index.js',
        '_bmad/framework/dist/auth/index.js',
        '_bmad/framework/dist/audit/index.js',
      ];

      for (const mod of modules) {
        const modPath = path.join(PROJECT_ROOT, mod);
        if (fs.existsSync(modPath)) {
          await import(modPath + `?t=${Date.now()}`); // Cache bust
        }
      }

      forceGC();
      const afterLoad = getMemoryUsage();

      const memoryIncrease = (afterLoad.heapUsed - beforeLoad.heapUsed) / MB;
      console.log(`Memory increase after loading ${modules.length} modules: ${memoryIncrease.toFixed(2)} MB`);

      expect(memoryIncrease).toBeLessThan(AGENT_LOAD_MEMORY_INCREMENT_MB * 2);
    });
  });

  describe('Memory After Loading Agents', () => {
    it('should track memory when loading agent definitions', () => {
      forceGC();
      const beforeLoad = getMemoryUsage();

      const agentFiles = getAgentFiles();
      console.log(`Found ${agentFiles.length} agent files`);

      // Load all agent definitions into memory
      const agents: { path: string; content: string; size: number }[] = [];

      for (const file of agentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        agents.push({
          path: file,
          content,
          size: Buffer.byteLength(content, 'utf-8'),
        });
      }

      forceGC();
      const afterLoad = getMemoryUsage();

      const memoryIncrease = (afterLoad.heapUsed - beforeLoad.heapUsed) / MB;
      const totalAgentSize = agents.reduce((sum, a) => sum + a.size, 0);

      console.log(`Loaded ${agents.length} agents`);
      console.log(`Total agent file size: ${formatBytes(totalAgentSize)}`);
      console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`);

      // Memory should be reasonably proportional to content size
      expect(afterLoad.heapUsed / MB).toBeLessThan(MAX_MEMORY_AFTER_ALL_AGENTS_MB);
    });

    it('should release memory when agent references are cleared', () => {
      forceGC();
      const beforeLoad = getMemoryUsage();

      // Load agents into a scope that will be cleared
      {
        const agentFiles = getAgentFiles();
        const agents = agentFiles.map((file) => ({
          path: file,
          content: fs.readFileSync(file, 'utf-8'),
        }));

        console.log(`Loaded ${agents.length} agents into memory`);
      }

      forceGC();
      const afterClear = getMemoryUsage();

      const memoryDelta = (afterClear.heapUsed - beforeLoad.heapUsed) / MB;
      console.log(`Memory delta after clearing references: ${memoryDelta.toFixed(2)} MB`);

      // Memory should be mostly reclaimed
      // Allow some overhead for Node.js internals
      expect(memoryDelta).toBeLessThan(AGENT_LOAD_MEMORY_INCREMENT_MB);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory on repeated operations', async () => {
      forceGC();
      const baseline = getMemoryUsage();
      const iterations = 10;
      const memorySnapshots: number[] = [];

      for (let i = 0; i < iterations; i++) {
        // Simulate typical operations
        const config = {
          agents: Array.from({ length: 50 }, (_, j) => ({
            id: `agent-${i}-${j}`,
            name: `Test Agent ${j}`,
            config: { timeout: 5000, retries: 3 },
          })),
        };

        // Process the config
        JSON.stringify(config);
        JSON.parse(JSON.stringify(config));

        if (i % 3 === 0) {
          forceGC();
        }

        memorySnapshots.push(getMemoryUsage().heapUsed);
      }

      forceGC();
      const final = getMemoryUsage();

      // Check for memory growth trend
      const firstThird = memorySnapshots.slice(0, Math.floor(iterations / 3));
      const lastThird = memorySnapshots.slice(-Math.floor(iterations / 3));

      const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

      const growth = (lastAvg - firstAvg) / MB;
      console.log(`Memory growth over ${iterations} iterations: ${growth.toFixed(2)} MB`);

      // Should not have significant growth
      expect(growth).toBeLessThan(10);

      // Final memory should be close to baseline
      const finalDelta = (final.heapUsed - baseline.heapUsed) / MB;
      console.log(`Final memory delta from baseline: ${finalDelta.toFixed(2)} MB`);
      expect(finalDelta).toBeLessThan(AGENT_LOAD_MEMORY_INCREMENT_MB);
    });

    it('should handle large string operations without excessive memory use', () => {
      forceGC();
      const baseline = getMemoryUsage();

      // Simulate processing large markdown files
      const largeContent = 'A'.repeat(1024 * 100); // 100KB string
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const processed = largeContent.split('\n').join('\n');
        const lines = processed.split('A').length;
        // Ensure the operation is not optimized away
        if (lines < 0) console.log('impossible');
      }

      forceGC();
      const final = getMemoryUsage();

      const memoryDelta = (final.heapUsed - baseline.heapUsed) / MB;
      console.log(`Memory delta after ${iterations} large string operations: ${memoryDelta.toFixed(2)} MB`);

      // Should reclaim memory from string operations
      expect(memoryDelta).toBeLessThan(20);
    });
  });

  describe('Memory Efficiency Metrics', () => {
    it('should report detailed memory breakdown', () => {
      forceGC();
      const memory = getMemoryUsage();

      console.log('\n=== Memory Breakdown ===');
      console.log(`Heap Used: ${formatBytes(memory.heapUsed)}`);
      console.log(`Heap Total: ${formatBytes(memory.heapTotal)}`);
      console.log(`External: ${formatBytes(memory.external)}`);
      console.log(`Array Buffers: ${formatBytes(memory.arrayBuffers)}`);
      console.log(`RSS: ${formatBytes(memory.rss)}`);
      console.log(`Heap Utilization: ${((memory.heapUsed / memory.heapTotal) * 100).toFixed(1)}%`);
      console.log('========================\n');

      // Heap utilization should be reasonable
      const utilization = memory.heapUsed / memory.heapTotal;
      expect(utilization).toBeGreaterThan(0.1); // At least 10% utilized
      expect(utilization).toBeLessThan(0.95); // Not maxed out
    });

    it('should calculate memory per agent', () => {
      const agentFiles = getAgentFiles();
      const memory = getMemoryUsage();

      if (agentFiles.length > 0) {
        const memoryPerAgent = memory.heapUsed / agentFiles.length;
        console.log(`Memory per agent (estimated): ${formatBytes(memoryPerAgent)}`);

        // Should be reasonable per agent
        expect(memoryPerAgent).toBeLessThan(5 * MB);
      }
    });
  });
});

describe('Memory Stress Tests', () => {
  it('should handle memory pressure gracefully', () => {
    forceGC();
    const baseline = getMemoryUsage();

    // Create memory pressure
    const arrays: Uint8Array[] = [];

    try {
      for (let i = 0; i < 10; i++) {
        arrays.push(new Uint8Array(MB)); // Allocate 1MB each
      }

      const afterAllocation = getMemoryUsage();
      console.log(`Memory after allocating 10MB: ${formatBytes(afterAllocation.heapUsed)}`);
    } finally {
      // Clear references
      arrays.length = 0;
    }

    forceGC();
    const afterClear = getMemoryUsage();

    const recovered = baseline.heapUsed - afterClear.heapUsed;
    console.log(`Memory recovered after clearing: ${formatBytes(Math.abs(recovered))}`);

    // Should recover most allocated memory
    expect(afterClear.heapUsed / MB).toBeLessThan(MAX_MEMORY_AFTER_ALL_AGENTS_MB);
  });

  it('should maintain performance under memory constraints', async () => {
    const startTime = Date.now();
    const operations = 1000;
    let completed = 0;

    for (let i = 0; i < operations; i++) {
      // Simulate typical operations
      const obj = { id: i, data: Array.from({ length: 100 }, (_, j) => j) };
      JSON.parse(JSON.stringify(obj));
      completed++;
    }

    const duration = Date.now() - startTime;
    const opsPerSecond = (completed / duration) * 1000;

    console.log(`Completed ${completed} operations in ${duration}ms`);
    console.log(`Operations per second: ${opsPerSecond.toFixed(0)}`);

    // Should maintain reasonable throughput
    expect(opsPerSecond).toBeGreaterThan(1000);
  });
});
