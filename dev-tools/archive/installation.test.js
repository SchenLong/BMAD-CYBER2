#!/usr/bin/env node
/**
 * EPIC 5.2: Installation and Distribution Testing
 * Tests BMM + CyberSec team installation scenarios
 *
 * Test Author: BlackUnicorn.Tech
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.dirname(__dirname);

describe('🚀 Installation and Distribution Testing', () => {

  beforeAll(() => {
    console.log('🔧 Testing installation scenarios...');
  });

  describe('📦 Package Installation Testing', () => {

    it('should have valid NPM package structure', async () => {
      const packageJsonPath = path.join(distPath, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageContent);

      expect(packageData.name).toBe('@bmad-cybercommand/meta-package');
      expect(packageData.version).toBe('2.1.0');
      expect(packageData.type).toBe('module');
      expect(packageData.bmad).toBeDefined();
      expect(packageData.bmad.modules).toContain('cybersec-team');

      console.log(`✅ Valid package structure for ${packageData.name}@${packageData.version}`);
    });

    it('should be installable via npm', async () => {
      // Create temporary test directory
      const tempDir = path.join('/tmp', 'bmad-install-test-' + Date.now());
      await fs.mkdir(tempDir, { recursive: true });

      try {
        // Create test package.json
        const testPackage = {
          name: 'bmad-install-test',
          version: '1.0.0',
          type: 'module'
        };
        await fs.writeFile(
          path.join(tempDir, 'package.json'),
          JSON.stringify(testPackage, null, 2)
        );

        // Test local installation
        const installCommand = `npm install ${distPath}`;

        console.log(`  📥 Testing: ${installCommand}`);

        const result = execSync(installCommand, {
          cwd: tempDir,
          encoding: 'utf8',
          timeout: 30000
        });

        // Verify installation
        const nodeModulesPath = path.join(tempDir, 'node_modules', '@bmad-cybercommand', 'meta-package');
        const installedPackage = await fs.readFile(path.join(nodeModulesPath, 'package.json'), 'utf8');
        const installedData = JSON.parse(installedPackage);

        expect(installedData.name).toBe('@bmad-cybercommand/meta-package');

        console.log('  ✅ Package installed successfully');

      } finally {
        // Cleanup
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    });

    it('should have correct file permissions', async () => {
      const scriptsPath = path.join(distPath, 'scripts');
      const files = await fs.readdir(scriptsPath);

      for (const file of files) {
        if (file.endsWith('.js')) {
          const filePath = path.join(scriptsPath, file);
          const stats = await fs.stat(filePath);

          // Should be readable
          expect(stats.mode & parseInt('400', 8)).toBeTruthy();

          console.log(`  ✅ ${file} has correct permissions`);
        }
      }
    });
  });

  describe('🧩 Module Loading Testing', () => {

    it('should load all team modules successfully', async () => {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const loadedModules = {};

      for (const team of teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');

        try {
          const content = await fs.readFile(moduleYamlPath, 'utf8');
          expect(content).toBeDefined();
          expect(content.length).toBeGreaterThan(0);

          loadedModules[team] = { loaded: true, size: content.length };
          console.log(`  ✅ ${team} loaded (${content.length} bytes)`);

        } catch (error) {
          loadedModules[team] = { loaded: false, error: error.message };
          throw new Error(`Failed to load ${team}: ${error.message}`);
        }
      }

      expect(Object.keys(loadedModules)).toHaveLength(4);
    });

    it('should validate ES module compatibility', async () => {
      // Test that the package works with ES modules
      const packageJsonPath = path.join(distPath, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageContent);

      expect(packageData.type).toBe('module');
      expect(packageData.engines.node).toMatch(/>=16/);

      console.log(`  ✅ ES module compatible (Node ${packageData.engines.node})`);
    });
  });

  describe('⚙️ Runtime Environment Testing', () => {

    it('should work in different Node.js environments', async () => {
      // Check Node.js version compatibility
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

      expect(majorVersion).toBeGreaterThanOrEqual(16);

      console.log(`  ✅ Compatible with Node.js ${nodeVersion}`);
    });

    it('should have minimal dependencies', async () => {
      const packageJsonPath = path.join(distPath, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageContent);

      // Check for bloated dependencies
      const devDeps = Object.keys(packageData.devDependencies || {});
      const prodDeps = Object.keys(packageData.dependencies || {});

      expect(devDeps.length).toBeLessThan(10);
      expect(prodDeps.length).toBe(0); // Should have no runtime dependencies

      console.log(`  ✅ Minimal dependencies: ${devDeps.length} dev, ${prodDeps.length} runtime`);
    });

    it('should validate script execution', async () => {
      // Test that included scripts can execute
      const validationScript = path.join(distPath, 'scripts', 'validate-modules.js');

      try {
        execSync(`node ${validationScript}`, {
          cwd: distPath,
          encoding: 'utf8',
          timeout: 10000
        });

        console.log('  ✅ Validation script executes successfully');

      } catch (error) {
        throw new Error(`Validation script failed: ${error.message}`);
      }
    });
  });

  describe('🔄 Update and Rollback Scenarios', () => {

    it('should support clean installation', async () => {
      // Verify package can be installed cleanly without conflicts
      const packageJsonPath = path.join(distPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(content);

      // Check for potential conflicts
      expect(packageData.name).toMatch(/^@bmad-cybercommand\//);
      expect(packageData.files).toBeDefined();
      expect(packageData.files).toContain('src/');

      console.log('  ✅ Clean installation supported');
    });

    it('should handle version updates gracefully', async () => {
      // Test version consistency across all modules
      const mainVersion = '2.0.0';
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      for (const team of teams) {
        const teamPackageJsonPath = path.join(distPath, 'src', team, 'package.json');
        const content = await fs.readFile(teamPackageJsonPath, 'utf8');
        const teamPackageData = JSON.parse(content);

        expect(teamPackageData.version).toBe(mainVersion);
      }

      console.log(`  ✅ Version consistency maintained (${mainVersion})`);
    });

    it('should support selective module installation', async () => {
      // Verify individual team modules can be referenced
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      for (const team of teams) {
        const teamPackageJsonPath = path.join(distPath, 'src', team, 'package.json');
        const exists = await fs.access(teamPackageJsonPath).then(() => true).catch(() => false);

        expect(exists).toBe(true);

        const content = await fs.readFile(teamPackageJsonPath, 'utf8');
        const teamPackageData = JSON.parse(content);

        expect(teamPackageData.name).toBe(`@bmad-cybercommand/${team}`);
      }

      console.log('  ✅ Selective module installation supported');
    });
  });

  describe('🎯 BMM Integration Points', () => {

    it('should have BMM-compatible skill definitions', async () => {
      // Verify that skills follow BMM naming conventions
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const skillPatterns = [];

      for (const team of teams) {
        const agentsPath = path.join(distPath, 'src', team, 'agents');
        const workflowsPath = path.join(distPath, 'src', team, 'workflows');

        const agentFiles = await fs.readdir(agentsPath);
        const workflowFiles = await fs.readdir(workflowsPath);

        // Check BMM skill naming format: team:type:name
        agentFiles.forEach(file => {
          if (file.endsWith('.agent.yaml')) {
            const agentName = file.replace('.agent.yaml', '');
            skillPatterns.push(`bmad:${team}:agents:${agentName}`);
          }
        });

        // Workflows are in directories, not files
        for (const dir of workflowFiles) {
          const dirPath = path.join(workflowsPath, dir);
          try {
            const stat = await fs.stat(dirPath);
            if (stat.isDirectory()) {
              const workflowYamlPath = path.join(dirPath, 'workflow.yaml');
              await fs.access(workflowYamlPath);
              skillPatterns.push(`bmad:${team}:workflows:${dir}`);
            }
          } catch {
            // Skip if not a valid workflow directory
          }
        }
      }

      expect(skillPatterns.length).toBeGreaterThan(50);

      console.log(`  ✅ ${skillPatterns.length} BMM-compatible skills identified`);
    });

    it('should validate BMM builder compatibility', async () => {
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      for (const team of teams) {
        const packageJsonPath = path.join(distPath, 'src', team, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf8');
        const packageData = JSON.parse(content);

        expect(packageData.bmad).toBeDefined();
        expect(packageData.bmad.format).toBe('bmad-builder');
        expect(packageData.bmad.version).toBe('2.0.0');
      }

      console.log('  ✅ BMM builder compatibility confirmed');
    });
  });
});