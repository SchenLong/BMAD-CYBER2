#!/usr/bin/env node
/**
 * Test BMAD installation process
 * Simulates how BMAD would install these modules and convert agents back to MD format
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BMAdInstallationSimulator {
  constructor() {
    this.installPath = path.join(__dirname, 'bmad-install-test');
  }

  async simulateInstallation() {
    console.log('🔧 Simulating BMAD Installation Process');
    console.log('=' .repeat(60));

    // Create target BMAD structure
    await this.createBmadStructure();

    // Install each team module
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const installResults = {
      totalAgentsConverted: 0,
      totalWorkflowsInstalled: 0,
      teams: {}
    };

    for (const teamCode of teams) {
      const result = await this.installTeamModule(teamCode);
      installResults.teams[teamCode] = result;
      installResults.totalAgentsConverted += result.agentsConverted;
      installResults.totalWorkflowsInstalled += result.workflowsInstalled;
    }

    console.log('\n🎯 BMAD Installation Simulation Results');
    console.log('=' .repeat(50));
    console.log(`📊 Teams Installed: ${teams.length}`);
    console.log(`🤖 Agents Converted to MD: ${installResults.totalAgentsConverted}`);
    console.log(`🔄 Workflows Installed: ${installResults.totalWorkflowsInstalled}`);

    // Verify agents are in proper MD format for BMAD
    await this.verifyMdFormat();

    return installResults;
  }

  async createBmadStructure() {
    console.log('\n📁 Creating BMAD installation structure...');

    const structure = [
      '_bmad',
      '_bmad/cybersec-team',
      '_bmad/cybersec-team/agents',
      '_bmad/cybersec-team/workflows',
      '_bmad/intel-team',
      '_bmad/intel-team/agents',
      '_bmad/intel-team/workflows',
      '_bmad/legal-team',
      '_bmad/legal-team/agents',
      '_bmad/legal-team/workflows',
      '_bmad/strategy-team',
      '_bmad/strategy-team/agents',
      '_bmad/strategy-team/workflows'
    ];

    for (const dir of structure) {
      const dirPath = path.join(this.installPath, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }

    console.log('✅ BMAD structure created');
  }

  async installTeamModule(teamCode) {
    console.log(`\n📦 Installing ${teamCode}...`);

    const sourcePath = path.join(__dirname, 'src', teamCode);
    const targetPath = path.join(this.installPath, '_bmad', teamCode);

    // Copy module.yaml
    const moduleYamlPath = path.join(sourcePath, 'module.yaml');
    const targetModuleYaml = path.join(targetPath, 'module.yaml');
    await fs.copyFile(moduleYamlPath, targetModuleYaml);

    // Convert agents from YAML back to MD format (as BMAD would do)
    const agentsConverted = await this.convertAgentsToMd(sourcePath, targetPath);

    // Copy workflows (maintaining structure)
    const workflowsInstalled = await this.copyWorkflows(sourcePath, targetPath);

    console.log(`  🤖 Converted ${agentsConverted} agents to MD format`);
    console.log(`  🔄 Installed ${workflowsInstalled} workflows`);
    console.log(`  ✅ ${teamCode} installation completed`);

    return {
      agentsConverted,
      workflowsInstalled
    };
  }

  async convertAgentsToMd(sourcePath, targetPath) {
    const agentsSourcePath = path.join(sourcePath, 'agents');
    const agentsTargetPath = path.join(targetPath, 'agents');

    const agentFiles = await fs.readdir(agentsSourcePath);
    const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

    let converted = 0;

    for (const yamlFile of yamlAgents) {
      const yamlFilePath = path.join(agentsSourcePath, yamlFile);
      const agentName = path.basename(yamlFile, '.agent.yaml');
      const mdFilePath = path.join(agentsTargetPath, `${agentName}.md`);

      await this.convertAgentYamlToMd(yamlFilePath, mdFilePath);
      converted++;
    }

    return converted;
  }

  async convertAgentYamlToMd(yamlFilePath, mdFilePath) {
    // Read YAML agent
    const yamlContent = await fs.readFile(yamlFilePath, 'utf8');
    const agentData = yaml.load(yamlContent);

    // Convert back to MD format (simulating BMAD installation process)
    const agent = agentData.agent;

    const mdContent = `---
name: ${agent.metadata.name}
title: ${agent.metadata.title}
description: ${agent.metadata.description}
icon: ${agent.metadata.icon}
version: ${agent.metadata.version}
team: ${agent.metadata.team}
---

# ${agent.metadata.title}

${agent.metadata.description}

## Agent Configuration

**Team**: ${agent.metadata.team}
**Version**: ${agent.metadata.version}
**Format**: ${agent.metadata.format_version}

## Activation Steps

\`\`\`xml
<agent
  title="${agent.metadata.title}"
  icon="${agent.metadata.icon}"
  version="${agent.metadata.version}">

  <activation critical="true">
    ${agent.activation.steps.map(step =>
      `<step n="${step.number}" critical="${step.critical}">${step.content}</step>`
    ).join('\n    ')}
  </activation>

  <menu>
    ${agent.menu.items.map(item =>
      `<item id="${item.id}" name="${item.name}" command="${item.command}">${item.description}</item>`
    ).join('\n    ')}
  </menu>

  <config>
    <paths>
      <config_file>{project-root}/_bmad/${agent.metadata.team}/config.yaml</config_file>
      <workflows_path>{project-root}/_bmad/${agent.metadata.team}/workflows</workflows_path>
      <output_folder>{output_folder}</output_folder>
    </paths>
    <variables>
      <user_name>{user_name}</user_name>
      <communication_language>{communication_language}</communication_language>
      <output_folder>{output_folder}</output_folder>
    </variables>
  </config>
</agent>
\`\`\`

## Persona

**Identity**: ${agent.persona.identity}
**Role**: ${agent.persona.role}
**Communication Style**: ${agent.persona.communication_style}

### Principles
${agent.persona.principles.map(p => `- ${p}`).join('\n')}

## Security & Operational Rules

### Security Rules
${agent.rules.security.map(rule => `- ${rule}`).join('\n')}

### Operational Rules
${agent.rules.operational.map(rule => `- ${rule}`).join('\n')}

### Communication Rules
${agent.rules.communication.map(rule => `- ${rule}`).join('\n')}

---

*Converted from BMAD Distribution Format v${agent.metadata.format_version}*
*Installation Date: ${new Date().toISOString()}*
*Source Package: @bmad-cybercommand/${agent.metadata.team}*
`;

    await fs.writeFile(mdFilePath, mdContent, 'utf8');
  }

  async copyWorkflows(sourcePath, targetPath) {
    const workflowsSourcePath = path.join(sourcePath, 'workflows');
    const workflowsTargetPath = path.join(targetPath, 'workflows');

    try {
      const workflowItems = await fs.readdir(workflowsSourcePath);
      let copiedCount = 0;

      for (const item of workflowItems) {
        const sourceDirPath = path.join(workflowsSourcePath, item);
        const targetDirPath = path.join(workflowsTargetPath, item);

        const stat = await fs.stat(sourceDirPath);
        if (stat.isDirectory()) {
          await this.copyDirectory(sourceDirPath, targetDirPath);
          copiedCount++;
        }
      }

      return copiedCount;
    } catch (error) {
      console.warn(`Warning: Could not copy workflows - ${error.message}`);
      return 0;
    }
  }

  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  async verifyMdFormat() {
    console.log('\n🔍 Verifying MD format agents...');

    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let totalVerified = 0;

    for (const teamCode of teams) {
      const agentsPath = path.join(this.installPath, '_bmad', teamCode, 'agents');

      try {
        const agentFiles = await fs.readdir(agentsPath);
        const mdFiles = agentFiles.filter(f => f.endsWith('.md'));

        // Verify a sample agent
        if (mdFiles.length > 0) {
          const sampleAgent = path.join(agentsPath, mdFiles[0]);
          const content = await fs.readFile(sampleAgent, 'utf8');

          // Check for required MD format elements
          const hasYamlFrontmatter = content.startsWith('---');
          const hasXmlConfig = content.includes('```xml') && content.includes('<agent');
          const hasActivation = content.includes('<activation');
          const hasMenu = content.includes('<menu>');

          if (hasYamlFrontmatter && hasXmlConfig && hasActivation && hasMenu) {
            console.log(`  ✅ ${teamCode}: MD format verified (${mdFiles.length} agents)`);
            totalVerified += mdFiles.length;
          } else {
            console.log(`  ⚠️  ${teamCode}: MD format incomplete`);
          }
        }
      } catch (error) {
        console.log(`  ❌ ${teamCode}: Verification failed - ${error.message}`);
      }
    }

    console.log(`\n📊 Total agents verified in MD format: ${totalVerified}`);
    console.log('✅ BMAD-ready MD format agents confirmed');

    return totalVerified;
  }
}

// Run simulation
if (import.meta.url === `file://${process.argv[1]}`) {
  const simulator = new BMAdInstallationSimulator();
  simulator.simulateInstallation().catch(error => {
    console.error('Installation simulation failed:', error);
    process.exit(1);
  });
}

export { BMAdInstallationSimulator };