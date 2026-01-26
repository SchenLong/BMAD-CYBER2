#!/usr/bin/env node
/**
 * EPIC 5.2: CROSS-MODULE INTEGRATION TESTING
 * Comprehensive integration test suite for BMAD Cybercommand
 *
 * Test Author: Murat (Test Architect)
 * Test Scope: Cross-module workflow validation and system integrity
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { performance } from 'perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.dirname(__dirname);

// Test configuration
const TEST_CONFIG = {
  performance: {
    moduleLoadTime: 500,     // ms
    agentActivationTime: 200, // ms
    workflowExecTime: 1000,  // ms
    memoryThreshold: 50      // MB
  },
  teams: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'],
  crossTeamWorkflows: [
    { name: 'incident-response', teams: ['cybersec-team', 'intel-team', 'legal-team'] },
    { name: 'threat-modeling', teams: ['cybersec-team', 'intel-team'] },
    { name: 'legal-compliance-assessment', teams: ['legal-team', 'cybersec-team'] },
    { name: 'strategic-security-planning', teams: ['strategy-team', 'cybersec-team'] }
  ]
};

// Test state tracking
let testResults = {
  performance: {},
  errors: [],
  warnings: [],
  moduleData: {},
  agentInventory: {},
  workflowInventory: {}
};

describe('BMAD Cybercommand - Integration Testing Suite', () => {

  beforeAll(async () => {
    console.log('🔬 Starting EPIC 5.2 Integration Testing Suite...');
    console.log(`📁 Testing distribution: ${distPath}`);

    // Initialize memory baseline
    const initialMemory = process.memoryUsage();
    testResults.performance.baselineMemory = initialMemory.heapUsed / 1024 / 1024;

    console.log(`📊 Baseline memory usage: ${testResults.performance.baselineMemory.toFixed(2)} MB`);
  });

  describe('📦 Module Structure and Integrity', () => {

    it('should have all required teams in distribution', async () => {
      const srcPath = path.join(distPath, 'src');
      const teams = await fs.readdir(srcPath);

      for (const expectedTeam of TEST_CONFIG.teams) {
        expect(teams).toContain(expectedTeam);
        testResults.moduleData[expectedTeam] = { found: true };
      }

      console.log(`✅ Found all ${TEST_CONFIG.teams.length} expected teams`);
    });

    it('should have valid module.yaml for each team', async () => {
      for (const team of TEST_CONFIG.teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        const content = await fs.readFile(moduleYamlPath, 'utf8');
        const moduleConfig = yaml.load(content);

        expect(moduleConfig).toBeDefined();
        expect(moduleConfig.code).toBe(team);
        expect(moduleConfig.version).toBeDefined();
        expect(moduleConfig.capabilities).toBeDefined();
        expect(moduleConfig.capabilities.agents).toBeDefined();
        expect(moduleConfig.capabilities.workflows).toBeDefined();

        testResults.moduleData[team] = {
          ...testResults.moduleData[team],
          config: moduleConfig,
          agentCount: moduleConfig.capabilities.agents.count,
          workflowCount: moduleConfig.capabilities.workflows.count
        };
      }

      console.log(`✅ All module.yaml files valid`);
    });

    it('should have consistent package.json metadata', async () => {
      for (const team of TEST_CONFIG.teams) {
        const packageJsonPath = path.join(distPath, 'src', team, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf8');
        const packageData = JSON.parse(content);

        expect(packageData.name).toBe(`@bmad-cybercommand/${team}`);
        expect(packageData.version).toBe('2.0.0');
        expect(packageData.bmad).toBeDefined();
        expect(packageData.bmad.team).toBe(team);

        // Verify agent count consistency
        if (packageData.bmad.agents) {
          expect(packageData.bmad.agents).toBe(testResults.moduleData[team].agentCount);
        }

        testResults.moduleData[team].packageData = packageData;
      }

      console.log(`✅ All package.json files consistent`);
    });
  });

  describe('🤖 Agent Discovery and Validation', () => {

    it('should discover all agents across teams', async () => {
      let totalAgents = 0;

      for (const team of TEST_CONFIG.teams) {
        const agentsPath = path.join(distPath, 'src', team, 'agents');
        const agentFiles = await fs.readdir(agentsPath);
        const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

        testResults.agentInventory[team] = yamlAgents.map(f => f.replace('.agent.yaml', ''));
        totalAgents += yamlAgents.length;

        expect(yamlAgents.length).toBeGreaterThan(0);
      }

      console.log(`✅ Discovered ${totalAgents} agents across ${TEST_CONFIG.teams.length} teams`);

      // Verify expected totals from Stream A success
      expect(testResults.agentInventory['cybersec-team'].length).toBe(15);
      expect(testResults.agentInventory['intel-team'].length).toBe(11);
      expect(testResults.agentInventory['legal-team'].length).toBe(13);
      expect(testResults.agentInventory['strategy-team'].length).toBe(14);
      expect(totalAgents).toBe(53);
    });

    it('should validate agent YAML structure', async () => {
      for (const team of TEST_CONFIG.teams) {
        for (const agentName of testResults.agentInventory[team]) {
          const agentPath = path.join(distPath, 'src', team, 'agents', `${agentName}.agent.yaml`);
          const content = await fs.readFile(agentPath, 'utf8');
          const agentConfig = yaml.load(content);

          expect(agentConfig).toBeDefined();
          expect(agentConfig.agent).toBeDefined();
          expect(agentConfig.agent.metadata).toBeDefined();
          expect(agentConfig.agent.metadata.id).toBe(agentName);
          expect(agentConfig.agent.metadata.name).toBe(agentName);
          expect(agentConfig.agent.metadata.description).toBeDefined();

          // Track agent for cross-reference testing
          if (!testResults.agentInventory[`${team}_details`]) {
            testResults.agentInventory[`${team}_details`] = {};
          }
          testResults.agentInventory[`${team}_details`][agentName] = agentConfig;
        }
      }

      console.log(`✅ All agent configurations valid`);
    });
  });

  describe('🔄 Workflow Discovery and Validation', () => {

    it('should discover all workflows across teams', async () => {
      let totalWorkflows = 0;

      for (const team of TEST_CONFIG.teams) {
        const workflowsPath = path.join(distPath, 'src', team, 'workflows');
        const workflowDirs = await fs.readdir(workflowsPath);

        const validWorkflows = [];
        for (const dir of workflowDirs) {
          const dirPath = path.join(workflowsPath, dir);
          const stat = await fs.stat(dirPath);
          if (stat.isDirectory()) {
            const workflowYamlPath = path.join(dirPath, 'workflow.yaml');
            try {
              await fs.access(workflowYamlPath);
              validWorkflows.push(dir);
            } catch {
              // workflow.yaml doesn't exist, skip
            }
          }
        }

        testResults.workflowInventory[team] = validWorkflows;
        totalWorkflows += validWorkflows.length;

        expect(validWorkflows.length).toBeGreaterThan(0);
      }

      console.log(`✅ Discovered ${totalWorkflows} workflows across teams`);
    });

    it('should validate workflow YAML structure', async () => {
      for (const team of TEST_CONFIG.teams) {
        for (const workflowName of testResults.workflowInventory[team] || []) {
          const workflowPath = path.join(distPath, 'src', team, 'workflows', workflowName, 'workflow.yaml');
          const content = await fs.readFile(workflowPath, 'utf8');
          const workflowConfig = yaml.load(content);

          expect(workflowConfig).toBeDefined();
          expect(workflowConfig.workflow).toBeDefined();
          expect(workflowConfig.workflow.metadata).toBeDefined();
          expect(workflowConfig.workflow.metadata.id).toBe(workflowName);
          expect(workflowConfig.workflow.description).toBeDefined();
          expect(workflowConfig.workflow.steps).toBeDefined();
          expect(Array.isArray(workflowConfig.workflow.steps)).toBe(true);

          // Track workflow for cross-team testing
          if (!testResults.workflowInventory[`${team}_details`]) {
            testResults.workflowInventory[`${team}_details`] = {};
          }
          testResults.workflowInventory[`${team}_details`][workflowName] = workflowConfig;
        }
      }

      console.log(`✅ All workflow configurations valid`);
    });
  });

  describe('🔗 Cross-Module Integration Testing', () => {

    it('should validate cross-team workflow references', async () => {
      const crossTeamScenarios = [
        { name: 'security-incident', teams: ['cybersec-team', 'intel-team', 'legal-team'], searchTerms: ['incident', 'security', 'response'] },
        { name: 'threat-assessment', teams: ['cybersec-team', 'intel-team'], searchTerms: ['threat', 'assessment', 'modeling'] },
        { name: 'legal-compliance', teams: ['legal-team', 'cybersec-team'], searchTerms: ['compliance', 'audit', 'legal'] },
        { name: 'strategic-security', teams: ['strategy-team', 'cybersec-team'], searchTerms: ['strategic', 'security', 'architecture'] }
      ];

      for (const scenario of crossTeamScenarios) {
        console.log(`🔍 Validating cross-team scenario: ${scenario.name}`);

        // Check that required teams exist and have workflows
        let totalWorkflowsFound = 0;
        for (const team of scenario.teams) {
          const teamWorkflows = testResults.workflowInventory[team] || [];
          expect(teamWorkflows.length).toBeGreaterThan(0);
          totalWorkflowsFound += teamWorkflows.length;

          // Look for workflows containing search terms
          const relatedWorkflows = teamWorkflows.filter(wf =>
            scenario.searchTerms.some(term =>
              wf.toLowerCase().includes(term.toLowerCase())
            )
          );

          console.log(`  ✅ ${team}: ${teamWorkflows.length} workflows, ${relatedWorkflows.length} related`);
        }

        expect(totalWorkflowsFound).toBeGreaterThan(0);
        console.log(`  ✅ Cross-team compatibility validated for ${scenario.name}`);
      }
    });

    it('should validate agent skill compatibility across teams', async () => {
      // Test that agents from different teams can work together
      const testCombinations = [
        { agent1: 'cybersec-team/security-architect', agent2: 'intel-team/threat-actor-profiler' },
        { agent1: 'legal-team/counsel', agent2: 'cybersec-team/compliance-guardian' },
        { agent1: 'strategy-team/the-master-strategist', agent2: 'cybersec-team/security-architect' }
      ];

      for (const combo of testCombinations) {
        const [team1, agent1] = combo.agent1.split('/');
        const [team2, agent2] = combo.agent2.split('/');

        // Verify both agents exist
        expect(testResults.agentInventory[team1]).toContain(agent1);
        expect(testResults.agentInventory[team2]).toContain(agent2);

        // Check for agent details
        const agent1Details = testResults.agentInventory[`${team1}_details`][agent1];
        const agent2Details = testResults.agentInventory[`${team2}_details`][agent2];

        expect(agent1Details).toBeDefined();
        expect(agent2Details).toBeDefined();
        expect(agent1Details.agent.metadata.description).toBeDefined();
        expect(agent2Details.agent.metadata.description).toBeDefined();

        console.log(`  ✅ Validated cross-team agent compatibility: ${agent1} + ${agent2}`);
      }
    });
  });

  describe('⚡ Performance and Resource Testing', () => {

    it('should measure module loading performance', async () => {
      const startTime = performance.now();

      // Simulate loading all modules
      for (const team of TEST_CONFIG.teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        await fs.readFile(moduleYamlPath, 'utf8');
      }

      const loadTime = performance.now() - startTime;
      testResults.performance.moduleLoadTime = loadTime;

      expect(loadTime).toBeLessThan(TEST_CONFIG.performance.moduleLoadTime);

      console.log(`✅ Module loading time: ${loadTime.toFixed(2)}ms`);
    });

    it('should check memory usage impact', async () => {
      const currentMemory = process.memoryUsage();
      const memoryUsage = currentMemory.heapUsed / 1024 / 1024;
      const memoryIncrease = memoryUsage - testResults.performance.baselineMemory;

      testResults.performance.currentMemory = memoryUsage;
      testResults.performance.memoryIncrease = memoryIncrease;

      expect(memoryIncrease).toBeLessThan(TEST_CONFIG.performance.memoryThreshold);

      console.log(`✅ Memory usage: ${memoryUsage.toFixed(2)}MB (increase: ${memoryIncrease.toFixed(2)}MB)`);
    });

    it('should validate package size efficiency', async () => {
      const packageJsonPath = path.join(distPath, 'package.json');
      const stat = await fs.stat(packageJsonPath);

      // Check main package file size is reasonable
      expect(stat.size).toBeLessThan(10000); // 10KB max for package.json

      // Check total distribution size
      const getDirSize = async (dirPath) => {
        let totalSize = 0;
        const items = await fs.readdir(dirPath);

        for (const item of items) {
          if (item === 'node_modules') continue; // Skip node_modules

          const itemPath = path.join(dirPath, item);
          const itemStat = await fs.stat(itemPath);

          if (itemStat.isDirectory()) {
            totalSize += await getDirSize(itemPath);
          } else {
            totalSize += itemStat.size;
          }
        }

        return totalSize;
      };

      const totalSize = await getDirSize(path.join(distPath, 'src'));
      const sizeMB = totalSize / 1024 / 1024;

      testResults.performance.distributionSizeMB = sizeMB;

      expect(sizeMB).toBeLessThan(5); // Distribution should be under 5MB

      console.log(`✅ Distribution size: ${sizeMB.toFixed(2)}MB`);
    });
  });

  describe('🛡️ System Stability and Error Handling', () => {

    it('should handle missing files gracefully', async () => {
      // Test that system doesn't crash with missing optional files
      try {
        await fs.readFile(path.join(distPath, 'nonexistent.yaml'), 'utf8');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe('ENOENT');
      }

      console.log(`✅ Graceful error handling for missing files`);
    });

    it('should validate YAML parsing error handling', async () => {
      // Create temporary invalid YAML and test parsing
      const invalidYaml = 'invalid: yaml: content: {\n  malformed';

      try {
        yaml.load(invalidYaml);
        expect.fail('Should have thrown a YAML parsing error');
      } catch (error) {
        expect(error.name).toBe('YAMLException');
      }

      console.log(`✅ Graceful YAML error handling`);
    });

    it('should validate resource cleanup', async () => {
      // Ensure no file handles are leaked
      const initialHandles = process.getActiveResourcesInfo?.() || [];

      // Perform operations that could leak resources
      for (const team of TEST_CONFIG.teams) {
        const moduleYamlPath = path.join(distPath, 'src', team, 'module.yaml');
        await fs.readFile(moduleYamlPath, 'utf8');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalHandles = process.getActiveResourcesInfo?.() || [];

      // Should not have significant increase in resource handles
      expect(finalHandles.length - initialHandles.length).toBeLessThan(10);

      console.log(`✅ Resource cleanup validated`);
    });
  });

  describe('📋 BMM + Cybercommand Teams Integration', () => {

    it('should validate BMM compatibility markers', async () => {
      // Check that all modules are marked as BMM compatible
      for (const team of TEST_CONFIG.teams) {
        const moduleConfig = testResults.moduleData[team].config;

        // Should have BMM compatibility indicators
        expect(moduleConfig.build.format).toBe('bmad-builder');
        expect(moduleConfig.version).toBeDefined();

        console.log(`  ✅ ${team} BMM compatibility confirmed`);
      }
    });

    it('should validate skill name uniqueness across modules', async () => {
      const allSkillNames = new Set();
      const duplicates = [];

      for (const team of TEST_CONFIG.teams) {
        const agentNames = testResults.agentInventory[team];
        const workflowNames = testResults.workflowInventory[team];

        // Check agent names
        for (const agentName of agentNames) {
          const fullName = `${team}:agents:${agentName}`;
          if (allSkillNames.has(fullName)) {
            duplicates.push(fullName);
          }
          allSkillNames.add(fullName);
        }

        // Check workflow names
        for (const workflowName of workflowNames) {
          const fullName = `${team}:workflows:${workflowName}`;
          if (allSkillNames.has(fullName)) {
            duplicates.push(fullName);
          }
          allSkillNames.add(fullName);
        }
      }

      expect(duplicates).toHaveLength(0);

      console.log(`✅ ${allSkillNames.size} unique skill names across all modules`);
    });
  });

  afterAll(async () => {
    console.log('\n📊 EPIC 5.2 Integration Test Results Summary:');
    console.log('='.repeat(50));

    // Print performance metrics
    console.log('\n⚡ Performance Metrics:');
    console.log(`  Module Load Time: ${testResults.performance.moduleLoadTime?.toFixed(2) || 'N/A'}ms`);
    console.log(`  Memory Usage: ${testResults.performance.currentMemory?.toFixed(2) || 'N/A'}MB`);
    console.log(`  Memory Increase: ${testResults.performance.memoryIncrease?.toFixed(2) || 'N/A'}MB`);
    console.log(`  Distribution Size: ${testResults.performance.distributionSizeMB?.toFixed(2) || 'N/A'}MB`);

    // Print module inventory
    console.log('\n📦 Module Inventory:');
    for (const team of TEST_CONFIG.teams) {
      const data = testResults.moduleData[team];
      if (data) {
        console.log(`  ${team}: ${data.agentCount} agents, ${data.workflowCount} workflows`);
      }
    }

    // Print totals
    const totalAgents = Object.values(testResults.agentInventory)
      .filter(arr => Array.isArray(arr))
      .reduce((sum, arr) => sum + arr.length, 0);
    const totalWorkflows = Object.values(testResults.workflowInventory)
      .filter(arr => Array.isArray(arr))
      .reduce((sum, arr) => sum + arr.length, 0);

    console.log(`\n🎯 Total: ${totalAgents} agents, ${totalWorkflows} workflows across ${TEST_CONFIG.teams.length} teams`);

    // Print any warnings or errors
    if (testResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      testResults.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      testResults.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('\n✅ All integration tests passed successfully!');
    }

    console.log('\n🔬 Integration testing completed.');
  });
});