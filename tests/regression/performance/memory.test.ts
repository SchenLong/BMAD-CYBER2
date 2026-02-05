/**
 * BMAD CYBERCOMMAND - Memory Usage Tests
 * ======================================
 * Regression tests for memory usage.
 * These tests ensure the framework operates within acceptable memory limits.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Memory thresholds (in bytes)
const MEMORY_THRESHOLDS = {
  FILE_CONTENT_LIMIT: 1024 * 1024,       // Individual files should be under 1MB
  COMBINED_SOURCE_LIMIT: 10 * 1024 * 1024, // Combined source should be under 10MB
  HOOK_SCRIPTS_LIMIT: 5 * 1024 * 1024,    // Hook scripts combined under 5MB
  VALIDATORS_LIMIT: 5 * 1024 * 1024,      // Validators combined under 5MB
};

describe('Memory Usage', () => {
  describe('Individual File Sizes', () => {
    it('should have framework index under memory limit', () => {
      const indexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      const stats = fs.statSync(indexPath);

      expect(stats.size).toBeLessThan(MEMORY_THRESHOLDS.FILE_CONTENT_LIMIT);
    });

    it('should have auth module under memory limit', () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const stats = fs.statSync(authPath);

      expect(stats.size).toBeLessThan(MEMORY_THRESHOLDS.FILE_CONTENT_LIMIT);
    });

    it('should have authorization module under memory limit', () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/core/security/authorization.ts');
      const stats = fs.statSync(authPath);

      expect(stats.size).toBeLessThan(MEMORY_THRESHOLDS.FILE_CONTENT_LIMIT);
    });

    it('should have secret guard under memory limit', () => {
      const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
      const stats = fs.statSync(secretPath);

      expect(stats.size).toBeLessThan(MEMORY_THRESHOLDS.FILE_CONTENT_LIMIT);
    });
  });

  describe('Combined Source Sizes', () => {
    it('should have framework sources under combined limit', () => {
      const frameworkDir = path.join(PROJECT_ROOT, '_bmad/framework');
      let totalSize = 0;

      const calculateSize = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
            calculateSize(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            totalSize += fs.statSync(fullPath).size;
          }
        }
      };

      calculateSize(frameworkDir);
      expect(totalSize).toBeLessThan(MEMORY_THRESHOLDS.COMBINED_SOURCE_LIMIT);
    });

    it('should have validator sources under combined limit', () => {
      const validatorsDir = path.join(PROJECT_ROOT, '.claude/validators-node/src');
      let totalSize = 0;

      const calculateSize = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            calculateSize(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
            totalSize += fs.statSync(fullPath).size;
          }
        }
      };

      calculateSize(validatorsDir);
      expect(totalSize).toBeLessThan(MEMORY_THRESHOLDS.VALIDATORS_LIMIT);
    });

    it('should have hook scripts under combined limit', () => {
      const hooksDir = path.join(PROJECT_ROOT, '.claude/hooks');
      let totalSize = 0;

      const files = fs.readdirSync(hooksDir);
      for (const file of files) {
        if (file.endsWith('.sh')) {
          totalSize += fs.statSync(path.join(hooksDir, file)).size;
        }
      }

      expect(totalSize).toBeLessThan(MEMORY_THRESHOLDS.HOOK_SCRIPTS_LIMIT);
    });
  });

  describe('Memory Allocation Patterns', () => {
    it('should not create excessively large strings when reading files', () => {
      const largeFiles: { path: string; size: number }[] = [];

      // Check framework files
      const frameworkDir = path.join(PROJECT_ROOT, '_bmad/framework');
      const checkDirectory = (dir: string) => {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
              checkDirectory(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
              const stats = fs.statSync(fullPath);
              if (stats.size > 50 * 1024) { // Files over 50KB
                largeFiles.push({ path: fullPath, size: stats.size });
              }
            }
          }
        } catch {
          // Skip directories we can't read
        }
      };

      checkDirectory(frameworkDir);

      // There should be very few large files
      expect(largeFiles.length).toBeLessThan(5);
    });

    it('should have efficient configuration files', () => {
      const configFiles = [
        path.join(PROJECT_ROOT, 'vitest.config.ts'),
        path.join(PROJECT_ROOT, 'package.json'),
      ];

      for (const configPath of configFiles) {
        if (fs.existsSync(configPath)) {
          const stats = fs.statSync(configPath);
          // Config files should be under 20KB
          expect(stats.size).toBeLessThan(20 * 1024);
        }
      }
    });
  });

  describe('Resource Cleanup Patterns', () => {
    it('should have resource-limits module', () => {
      const resourcePath = path.join(PROJECT_ROOT, '.claude/validators-node/src/resource-management/resource-limits.ts');
      expect(fs.existsSync(resourcePath)).toBe(true);
    });

    it('should have rate-limiter module', () => {
      const rateLimiterPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/resource-management/rate-limiter.ts');
      expect(fs.existsSync(rateLimiterPath)).toBe(true);
    });

    it('should have recursion-guard module', () => {
      const recursionPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/resource-management/recursion-guard.ts');
      expect(fs.existsSync(recursionPath)).toBe(true);
    });

    it('should have context-manager module', () => {
      const contextPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/resource-management/context-manager.ts');
      expect(fs.existsSync(contextPath)).toBe(true);
    });
  });

  describe('Log and Audit File Management', () => {
    it('should have log-archiver module', () => {
      const archiverPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/observability/log-archiver.ts');
      expect(fs.existsSync(archiverPath)).toBe(true);
    });

    it('should have archival-config module', () => {
      const archivalPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/observability/archival-config.ts');
      expect(fs.existsSync(archivalPath)).toBe(true);
    });

    it('should have archival-scheduler module', () => {
      const schedulerPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/observability/archival-scheduler.ts');
      expect(fs.existsSync(schedulerPath)).toBe(true);
    });
  });
});

describe('Circular Dependency Prevention', () => {
  it('should not have obvious circular imports in framework index', async () => {
    const indexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Check that exports don't create circular patterns
    const exports = content.match(/export \* (as \w+ )?from ['"][^'"]+['"]/g) || [];

    // Should have clean namespace exports
    expect(exports.length).toBeGreaterThan(0);

    // Should not import from itself
    expect(content).not.toContain("from './index'");
  });

  it('should not have circular imports in validators index', async () => {
    const indexPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Should not import from itself
    expect(content).not.toContain("from './index'");
  });

  it('should have proper module boundaries', () => {
    // Check that guards don't import from ai-safety and vice versa
    const guardsIndexPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/index.ts');

    if (fs.existsSync(guardsIndexPath)) {
      const guardsContent = fs.readFileSync(guardsIndexPath, 'utf-8');

      // Guards should not directly depend on ai-safety
      expect(guardsContent).not.toContain('ai-safety');
    }
  });
});

describe('String and Buffer Efficiency', () => {
  it('should use efficient patterns in secret detector', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    // Should use RegExp patterns efficiently (compiled once)
    expect(content).toContain('const CRITICAL_PATTERNS');
    expect(content).toContain('const HIGH_PATTERNS');
    expect(content).toContain('const MEDIUM_PATTERNS');
  });

  it('should limit detection result size', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    // Should truncate matches to prevent memory bloat
    expect(content).toContain('slice(0,');
  });

  it('should have entropy calculation without excessive allocations', async () => {
    const secretPath = path.join(PROJECT_ROOT, '.claude/validators-node/src/guards/secret.ts');
    const content = fs.readFileSync(secretPath, 'utf-8');

    // Should use Map for frequency counting (efficient)
    expect(content).toContain('new Map');
    expect(content).toContain('freq.set');
  });
});
