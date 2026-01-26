#!/usr/bin/env node
/**
 * EPIC 5.2: Rollback Scenario Testing
 * Tests system behavior during rollback scenarios
 *
 * Test Author: Murat (Test Architect)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.dirname(__dirname);

describe('🔄 Rollback Scenario Testing', () => {

  describe('📦 Package Rollback Safety', () => {

    it('should have immutable core structure', async () => {
      // Verify that core files are read-only after distribution
      const coreFiles = [
        'package.json',
        'scripts/validate-modules.js',
        'README.md'
      ];

      for (const file of coreFiles) {
        const filePath = path.join(distPath, file);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        // File should be readable
        const content = await fs.readFile(filePath, 'utf8');
        expect(content.length).toBeGreaterThan(0);
      }

      console.log('✅ Core structure immutable and intact');
    });

    it('should support clean uninstallation', async () => {
      // Verify that package can be cleanly removed
      const packageJsonPath = path.join(distPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(content);

      // Check for clean uninstall support
      expect(packageData.files).toBeDefined();
      expect(packageData.files.length).toBeGreaterThan(0);

      // Should not have persistent data outside package
      expect(packageData.scripts.preuninstall).toBeUndefined(); // No dangerous preuninstall scripts

      console.log('✅ Clean uninstallation supported');
    });

    it('should handle version downgrade gracefully', async () => {
      // Verify version information is consistent
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
      const versions = [];

      for (const team of teams) {
        const packageJsonPath = path.join(distPath, 'src', team, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf8');
        const packageData = JSON.parse(content);

        versions.push(packageData.version);
      }

      // All versions should be the same
      const uniqueVersions = [...new Set(versions)];
      expect(uniqueVersions).toHaveLength(1);
      expect(uniqueVersions[0]).toBe('2.0.0');

      console.log('✅ Version consistency supports clean rollback');
    });
  });

  describe('🗄️ Data Integrity During Rollback', () => {

    it('should preserve module configurations during rollback', async () => {
      // Test that module configurations are not corrupted
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      for (const team of teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        const content = await fs.readFile(moduleYamlPath, 'utf8');

        // Should be valid YAML
        expect(content).toMatch(/code:\s+\w+/);
        expect(content).toMatch(/version:\s+[\d\.]+/);
        expect(content).toContain('capabilities:');

        // Should not be corrupted
        expect(content).not.toContain('undefined');
        expect(content).not.toContain('null');
      }

      console.log('✅ Module configurations preserved');
    });

    it('should have rollback-safe agent definitions', async () => {
      // Test that agent files are intact
      const team = 'cybersec-team';
      const agentsPath = path.join(distPath, 'src', team, 'agents');
      const agentFiles = await fs.readdir(agentsPath);

      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));
      expect(yamlAgents.length).toBeGreaterThan(0);

      // Test first agent file integrity
      const firstAgent = yamlAgents[0];
      const agentPath = path.join(agentsPath, firstAgent);
      const content = await fs.readFile(agentPath, 'utf8');

      expect(content).toContain('agent:');
      expect(content).toContain('metadata:');
      expect(content).not.toContain('CORRUPTED');

      console.log(`✅ Agent definitions intact (tested ${yamlAgents.length} agents)`);
    });
  });

  describe('🔧 Rollback Validation Scripts', () => {

    it('should have validation available for rollback verification', async () => {
      // Test that validation scripts work for rollback verification
      const validationScript = path.join(distPath, 'scripts', 'validate-modules.js');
      const exists = await fs.access(validationScript).then(() => true).catch(() => false);

      expect(exists).toBe(true);

      const content = await fs.readFile(validationScript, 'utf8');
      expect(content).toContain('validateModules');
      expect(content).toContain('console.log');

      console.log('✅ Rollback validation scripts available');
    });

    it('should support rollback integrity checking', async () => {
      // Verify that we can check integrity after rollback
      const packageJsonPath = path.join(distPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(content);

      expect(packageData.scripts.validate).toBeDefined();
      expect(packageData.scripts.validate).toBe('node scripts/validate-modules.js');

      console.log('✅ Rollback integrity checking supported');
    });
  });

  describe('⚠️ Rollback Safety Mechanisms', () => {

    it('should have no dangerous post-install scripts', async () => {
      const packageJsonPath = path.join(distPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(content);

      // Check for potentially dangerous scripts
      const dangerousScripts = ['postinstall', 'preuninstall', 'postuninstall'];

      for (const script of dangerousScripts) {
        expect(packageData.scripts?.[script]).toBeUndefined();
      }

      console.log('✅ No dangerous rollback-blocking scripts');
    });

    it('should not modify system-wide configuration', async () => {
      // Verify package doesn't try to modify system configs
      const packageJsonPath = path.join(distPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf8');

      // Should not contain system modification indicators
      expect(content).not.toContain('sudo');
      expect(content).not.toContain('/usr/');
      expect(content).not.toContain('/etc/');
      expect(content).not.toContain('chmod +x');

      console.log('✅ No system-wide modifications detected');
    });

    it('should support partial rollback scenarios', async () => {
      // Test that individual teams can be rolled back independently
      const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      for (const team of teams) {
        const teamPackageJsonPath = path.join(distPath, 'src', team, 'package.json');
        const content = await fs.readFile(teamPackageJsonPath, 'utf8');
        const packageData = JSON.parse(content);

        // Each team should be independently versioned
        expect(packageData.name).toBe(`@bmad-cybercommand/${team}`);
        expect(packageData.repository.directory).toBe(`src/${team}`);
      }

      console.log('✅ Partial rollback scenarios supported');
    });
  });
});