/**
 * BMAD CYBERCOMMAND - Installation Verification Tests
 * ====================================================
 * Regression tests to verify core installation functionality.
 * These tests ensure the framework installs correctly and all
 * required components are accessible.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Installation Verification', () => {
  describe('Package Structure', () => {
    it('should have package.json with correct name', () => {
      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.name).toBe('bmad-cybersec');
    });

    it('should have required dependencies defined', () => {
      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.zod).toBeDefined();
      expect(packageJson.dependencies.chalk).toBeDefined();
      expect(packageJson.dependencies.commander).toBeDefined();
    });

    it('should have correct exports configuration', () => {
      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports['.']).toBeDefined();
      expect(packageJson.exports['./framework']).toBeDefined();
      expect(packageJson.exports['./validators']).toBeDefined();
    });
  });

  describe('Core Directories', () => {
    it('should have _bmad/framework directory', () => {
      const frameworkDir = path.join(PROJECT_ROOT, '_bmad/framework');
      expect(fs.existsSync(frameworkDir)).toBe(true);
    });

    it('should have src/core directory (migrated from _bmad/core)', () => {
      const coreDir = path.join(PROJECT_ROOT, 'src/core');
      expect(fs.existsSync(coreDir)).toBe(true);
    });

    it('should have .claude/validators-node directory', () => {
      const validatorsDir = path.join(PROJECT_ROOT, '.claude/validators-node');
      expect(fs.existsSync(validatorsDir)).toBe(true);
    });

    it('should have dev-tools/config directory', () => {
      const configDir = path.join(PROJECT_ROOT, 'dev-tools/config');
      expect(fs.existsSync(configDir)).toBe(true);
    });
  });

  describe('Framework Source Files', () => {
    it('should have framework index.ts entry point', () => {
      const indexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should have auth module', () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      expect(fs.existsSync(authPath)).toBe(true);
    });

    it('should have validators module', () => {
      const validatorsPath = path.join(PROJECT_ROOT, '_bmad/framework/validators/index.ts');
      expect(fs.existsSync(validatorsPath)).toBe(true);
    });
  });

  describe('Configuration Files', () => {
    it('should have vitest.config.ts', () => {
      const configPath = path.join(PROJECT_ROOT, 'vitest.config.ts');
      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should have tsconfig.json or TypeScript configuration', () => {
      const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
      const frameworkTsconfigPath = path.join(PROJECT_ROOT, '_bmad/framework/tsconfig.json');

      const hasConfig = fs.existsSync(tsconfigPath) || fs.existsSync(frameworkTsconfigPath);
      expect(hasConfig).toBe(true);
    });

    it('should have vitest configuration files in dev-tools/config', () => {
      const configDir = path.join(PROJECT_ROOT, 'dev-tools/config');
      const configs = fs.readdirSync(configDir);

      expect(configs.some(f => f.startsWith('vitest.config'))).toBe(true);
    });
  });
});

describe('Module Import Verification', () => {
  it('should be able to import framework types', async () => {
    // This tests that the TypeScript types are accessible
    const frameworkIndexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(frameworkIndexPath, 'utf-8');

    expect(content).toContain('export');
    expect(content).toContain('FRAMEWORK_VERSION');
  });

  it('should have initializeFramework function exported', async () => {
    const frameworkIndexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(frameworkIndexPath, 'utf-8');

    expect(content).toContain('export function initializeFramework');
  });

  it('should have FrameworkConfig interface defined', async () => {
    const frameworkIndexPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(frameworkIndexPath, 'utf-8');

    expect(content).toContain('export interface FrameworkConfig');
  });
});
