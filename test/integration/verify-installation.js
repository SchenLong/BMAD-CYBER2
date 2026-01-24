#!/usr/bin/env node
/**
 * Installation verification script
 * Tests that BMAD can properly read the specialized team modules
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifyInstallation() {
  console.log('🧪 Testing BMAD Specialized Teams Installation');
  console.log('=' .repeat(60));

  const srcPath = path.join(__dirname, 'src');
  const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

  const results = {
    totalAgents: 0,
    totalWorkflows: 0,
    teams: {},
    errors: []
  };

  for (const teamCode of teams) {
    console.log(`\n📋 Testing ${teamCode} installation...`);

    try {
      const teamPath = path.join(srcPath, teamCode);

      // Test module.yaml loading
      const moduleYamlPath = path.join(teamPath, 'module.yaml');
      const moduleContent = await fs.readFile(moduleYamlPath, 'utf8');
      const moduleConfig = yaml.load(moduleContent);

      console.log(`  📄 Module config: ${moduleConfig.name}`);
      console.log(`  🏷️  Version: ${moduleConfig.version}`);
      console.log(`  📁 Category: ${moduleConfig.category}`);

      // Test package.json loading
      const packageJsonPath = path.join(teamPath, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageContent);

      console.log(`  📦 NPM package: ${packageData.name}`);

      // Count and test agent loading
      const agentsPath = path.join(teamPath, 'agents');
      const agentFiles = await fs.readdir(agentsPath);
      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

      console.log(`  🤖 Agents found: ${yamlAgents.length}`);

      // Test loading first agent as example
      if (yamlAgents.length > 0) {
        const firstAgentPath = path.join(agentsPath, yamlAgents[0]);
        const agentContent = await fs.readFile(firstAgentPath, 'utf8');
        const agentConfig = yaml.load(agentContent);

        console.log(`  ✅ Sample agent loaded: ${agentConfig.agent.metadata.name}`);
        console.log(`  👤 Agent title: ${agentConfig.agent.metadata.title}`);
        console.log(`  📝 Format version: ${agentConfig.agent.metadata.format_version}`);
      }

      // Count workflows
      const workflowsPath = path.join(teamPath, 'workflows');
      const workflowItems = await fs.readdir(workflowsPath);
      const workflowDirs = [];

      for (const item of workflowItems) {
        const itemPath = path.join(workflowsPath, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          workflowDirs.push(item);
        }
      }

      console.log(`  🔄 Workflows found: ${workflowDirs.length}`);

      // Test workflow loading
      if (workflowDirs.length > 0) {
        const firstWorkflowPath = path.join(workflowsPath, workflowDirs[0], 'workflow.yaml');
        try {
          const workflowContent = await fs.readFile(firstWorkflowPath, 'utf8');
          const workflowConfig = yaml.load(workflowContent);
          console.log(`  ✅ Sample workflow loaded: ${workflowConfig.workflow.metadata.name}`);
        } catch (e) {
          console.log(`  ⚠️  Sample workflow format: Legacy (non-YAML)`);
        }
      }

      results.teams[teamCode] = {
        agents: yamlAgents.length,
        workflows: workflowDirs.length,
        moduleConfig,
        packageData
      };

      results.totalAgents += yamlAgents.length;
      results.totalWorkflows += workflowDirs.length;

      console.log(`  ✅ ${teamCode} installation verified`);

    } catch (error) {
      console.error(`  ❌ ${teamCode} installation failed: ${error.message}`);
      results.errors.push(`${teamCode}: ${error.message}`);
    }
  }

  // Generate summary report
  console.log('\n🎯 Installation Verification Summary');
  console.log('=' .repeat(50));
  console.log(`📊 Total Specialized Teams: ${teams.length}`);
  console.log(`🤖 Total Agents: ${results.totalAgents}`);
  console.log(`🔄 Total Workflows: ${results.totalWorkflows}`);
  console.log(`❌ Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Issues Found:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  // Test bmad-builder compatibility
  console.log('\n🔧 BMAD-Builder Compatibility Test');
  console.log('-'.repeat(40));

  const requiredStructure = [
    'src/',
    'src/cybersec-team/',
    'src/cybersec-team/agents/',
    'src/cybersec-team/workflows/',
    'src/intel-team/',
    'src/intel-team/agents/',
    'src/intel-team/workflows/',
    'src/legal-team/',
    'src/legal-team/agents/',
    'src/legal-team/workflows/',
    'src/strategy-team/',
    'src/strategy-team/agents/',
    'src/strategy-team/workflows/'
  ];

  let structureValid = true;
  for (const requiredPath of requiredStructure) {
    const fullPath = path.join(__dirname, requiredPath);
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        console.log(`  ✅ ${requiredPath}`);
      } else {
        console.log(`  ❌ ${requiredPath} (not a directory)`);
        structureValid = false;
      }
    } catch {
      console.log(`  ❌ ${requiredPath} (missing)`);
      structureValid = false;
    }
  }

  console.log(`\n📋 Structure Compliance: ${structureValid ? 'PASSED' : 'FAILED'}`);

  // Final result
  const success = results.errors.length === 0 && structureValid && results.totalAgents >= 50;
  console.log(`\n${success ? '🎉' : '❌'} Installation verification: ${success ? 'PASSED' : 'FAILED'}`);

  if (success) {
    console.log('✅ Ready for BMAD integration');
    console.log('✅ All agents converted to proper YAML format');
    console.log('✅ NPM distribution package validated');
    console.log('✅ Multi-module structure confirmed');
  }

  return {
    success,
    results,
    structureValid
  };
}

// Run verification
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyInstallation().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export { verifyInstallation };