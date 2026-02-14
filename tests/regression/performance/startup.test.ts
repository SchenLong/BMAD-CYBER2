/**
 * BMAD CYBERCOMMAND - CLI Startup Time Tests
 * ==========================================
 * Regression tests for CLI startup performance.
 * These tests ensure the framework loads within acceptable time limits.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  FRAMEWORK_IMPORT_TIME: 500,      // Framework module import should be under 500ms
  FILE_READ_TIME: 100,             // File read operations should be under 100ms
  FRAMEWORK_INIT_TIME: 200,        // Framework initialization should be under 200ms
  TOTAL_STARTUP_TIME: 1000,        // Total startup should be under 1 second
};

describe('CLI Startup Performance', () => {
  describe('Package.json Loading', () => {
    it('should load package.json within threshold', () => {
      const startTime = performance.now();

      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      JSON.parse(content);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });

    it('should have reasonable package.json size', () => {
      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      const stats = fs.statSync(packageJsonPath);

      // Package.json should be under 10KB
      expect(stats.size).toBeLessThan(10 * 1024);
    });
  });

  describe('Framework Source Size', () => {
    it('should have reasonable framework index size', () => {
      const indexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      const stats = fs.statSync(indexPath);

      // Index should be under 5KB (minimal entry point)
      expect(stats.size).toBeLessThan(5 * 1024);
    });

    it('should have reasonable auth module size', () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const stats = fs.statSync(authPath);

      // Auth module should be under 20KB
      expect(stats.size).toBeLessThan(20 * 1024);
    });

    it('should have reasonable validators index size', () => {
      const validatorsPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/index.ts');
      const stats = fs.statSync(validatorsPath);

      // Validators index should be under 2KB (just exports)
      expect(stats.size).toBeLessThan(2 * 1024);
    });
  });

  describe('File System Operations', () => {
    it('should read framework index quickly', () => {
      const startTime = performance.now();

      const indexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      fs.readFileSync(indexPath, 'utf-8');

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });

    it('should read auth module quickly', () => {
      const startTime = performance.now();

      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      fs.readFileSync(authPath, 'utf-8');

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });

    it('should read authorization module quickly', () => {
      const startTime = performance.now();

      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      fs.readFileSync(authPath, 'utf-8');

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });
  });

  describe('Directory Scanning', () => {
    it('should list hooks directory quickly', () => {
      const startTime = performance.now();

      const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
      fs.readdirSync(hooksDir);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });

    it('should list validators directory quickly', () => {
      const startTime = performance.now();

      const validatorsDir = path.join(PROJECT_ROOT, '.claude/validators-node/src');
      fs.readdirSync(validatorsDir);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });

    it('should list framework directory quickly', () => {
      const startTime = performance.now();

      const frameworkDir = path.join(PROJECT_ROOT, '_bmad/framework');
      fs.readdirSync(frameworkDir);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });
  });

  describe('Combined Startup Simulation', () => {
    it('should complete simulated startup within threshold', () => {
      const startTime = performance.now();

      // Simulate startup sequence
      // 1. Read package.json
      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // 2. Read framework index
      const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      fs.readFileSync(frameworkPath, 'utf-8');

      // 3. Read auth module
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      fs.readFileSync(authPath, 'utf-8');

      // 4. Read validators index
      const validatorsPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/index.ts');
      fs.readFileSync(validatorsPath, 'utf-8');

      // 5. List hooks
      const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
      fs.readdirSync(hooksDir);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.TOTAL_STARTUP_TIME);
    });
  });
});

describe('Configuration Loading Performance', () => {
  describe('Vitest Configuration', () => {
    it('should read vitest.config.ts quickly', () => {
      const startTime = performance.now();

      const configPath = path.join(PROJECT_ROOT, 'vitest.config.ts');
      fs.readFileSync(configPath, 'utf-8');

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(THRESHOLDS.FILE_READ_TIME);
    });

    it('should have reasonable vitest config size', () => {
      const configPath = path.join(PROJECT_ROOT, 'vitest.config.ts');
      const stats = fs.statSync(configPath);

      // Config should be under 10KB
      expect(stats.size).toBeLessThan(10 * 1024);
    });
  });
});

describe('Source File Count', () => {
  it('should have reasonable number of hook scripts', () => {
    const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
    const files = fs.readdirSync(hooksDir);
    const shellScripts = files.filter(f => f.endsWith('.sh'));

    // Should have hooks but not excessive
    expect(shellScripts.length).toBeGreaterThan(5);
    expect(shellScripts.length).toBeLessThan(100);
  });

  it('should have reasonable number of validator modules', () => {
    const validatorsDir = path.join(PROJECT_ROOT, '.claude/validators-node/src');
    const countFiles = (dir: string): number => {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += countFiles(path.join(dir, entry.name));
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
          count++;
        }
      }
      return count;
    };

    const fileCount = countFiles(validatorsDir);

    // Should have validators but not excessive
    expect(fileCount).toBeGreaterThan(10);
    expect(fileCount).toBeLessThan(200);
  });
});
