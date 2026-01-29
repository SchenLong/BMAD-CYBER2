#!/usr/bin/env node

/**
 * BMAD CYBERCOMMAND Multi-Module Builder
 * Converts all agents and workflows to distribution format
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class MultiModuleBuilder {
  constructor() {
    this.packageRoot = path.dirname(__dirname);
    this.distPath = path.join(this.packageRoot, 'dist');
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(this.packageRoot, 'bmad-multi-module.yaml');
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
  }

  async build() {
    console.log(chalk.cyan('🔨 BMAD CYBERCOMMAND Multi-Module Builder'));
    console.log(chalk.gray('Building distribution packages...\n'));

    try {
      // 1. Clean dist directory
      await fs.remove(this.distPath);
      await fs.ensureDir(this.distPath);

      // 2. Build each team module
      for (const teamName of ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team']) {
        await this.buildTeamModule(teamName);
      }

      // 3. Generate consolidated metadata
      await this.generateMetadata();

      // 4. Create installation manifest
      await this.createManifest();

      console.log(chalk.green('\n✅ Multi-module build completed successfully!'));
      console.log(chalk.yellow(`Built: ${this.config.metadata.total_agents} agents, ${this.config.metadata.total_workflows} workflows`));

    } catch (error) {
      console.error(chalk.red('❌ Build failed:'), error.message);
      process.exit(1);
    }
  }

  async buildTeamModule(teamName) {
    console.log(chalk.blue(`Building ${teamName} module...`));

    const sourcePath = path.join(this.packageRoot, 'src', teamName);
    const distTeamPath = path.join(this.distPath, teamName);

    // Create team dist directories
    await fs.ensureDir(path.join(distTeamPath, 'agents'));
    await fs.ensureDir(path.join(distTeamPath, 'workflows'));

    // Convert agents from MD to YAML
    const agentsPath = path.join(sourcePath, 'agents');
    const agentFiles = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));

    for (const agentFile of agentFiles) {
      const agentPath = path.join(agentsPath, agentFile);
      const agentContent = fs.readFileSync(agentPath, 'utf8');

      // Convert to YAML format (simplified conversion)
      const agentYaml = this.convertAgentToYaml(agentContent, agentFile);
      const yamlPath = path.join(distTeamPath, 'agents', agentFile.replace('.md', '.yaml'));
      fs.writeFileSync(yamlPath, yaml.dump(agentYaml));
    }

    // Convert workflows
    const workflowsPath = path.join(sourcePath, 'workflows');
    if (fs.existsSync(workflowsPath)) {
      const workflowDirs = fs.readdirSync(workflowsPath).filter(f =>
        fs.statSync(path.join(workflowsPath, f)).isDirectory()
      );

      for (const workflowDir of workflowDirs) {
        const workflowSrcPath = path.join(workflowsPath, workflowDir);
        const workflowDistPath = path.join(distTeamPath, 'workflows', workflowDir);

        await fs.copy(workflowSrcPath, workflowDistPath);

        // Convert instructions.md to workflow.yaml if it exists
        const instructionsPath = path.join(workflowDistPath, 'instructions.md');
        if (fs.existsSync(instructionsPath)) {
          const instructions = fs.readFileSync(instructionsPath, 'utf8');
          const workflowYaml = this.convertWorkflowToYaml(instructions, workflowDir);
          const yamlPath = path.join(workflowDistPath, 'workflow.yaml');
          fs.writeFileSync(yamlPath, yaml.dump(workflowYaml));
        }
      }
    }

    console.log(chalk.green(`✓ ${teamName} module built`));
  }

  convertAgentToYaml(content, filename) {
    // Extract agent metadata from markdown content
    const agentId = filename.replace('.md', '');

    // Basic YAML structure for agent
    return {
      id: agentId,
      name: this.extractTitle(content) || agentId,
      team: this.extractTeam(content),
      description: this.extractDescription(content),
      specialization: this.extractSpecialization(content),
      capabilities: this.extractCapabilities(content),
      source_format: 'markdown',
      source_path: `agents/${filename}`,
      converted_at: new Date().toISOString()
    };
  }

  convertWorkflowToYaml(content, workflowId) {
    return {
      id: workflowId,
      name: this.extractTitle(content) || workflowId,
      description: this.extractDescription(content),
      steps: this.extractSteps(content),
      source_format: 'markdown',
      source_path: `workflows/${workflowId}/instructions.md`,
      converted_at: new Date().toISOString()
    };
  }

  extractTitle(content) {
    const match = content.match(/^# (.+)$/m);
    return match ? match[1] : null;
  }

  extractDescription(content) {
    // Extract first paragraph after title
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ') && i + 1 < lines.length) {
        let desc = '';
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('#'); j++) {
          if (lines[j].trim()) desc += lines[j] + ' ';
        }
        return desc.trim();
      }
    }
    return 'No description available';
  }

  extractTeam(content) {
    // Extract team from content or filename pattern
    if (content.includes('cybersec') || content.includes('security')) return 'cybersec-team';
    if (content.includes('intel') || content.includes('intelligence')) return 'intel-team';
    if (content.includes('legal') || content.includes('law')) return 'legal-team';
    if (content.includes('strategy') || content.includes('strategic')) return 'strategy-team';
    return 'unknown';
  }

  extractSpecialization(content) {
    const match = content.match(/specialization[:\s]+([^\n]+)/i);
    return match ? match[1].trim() : 'General';
  }

  extractCapabilities(content) {
    // Extract capabilities from markdown lists
    const capabilities = [];
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.match(/^[-*]\s+(.+)/)) {
        capabilities.push(line.replace(/^[-*]\s+/, '').trim());
      }
    }
    return capabilities.slice(0, 10); // Limit to top 10
  }

  extractSteps(content) {
    const steps = [];
    const lines = content.split('\n');
    let currentStep = null;

    for (const line of lines) {
      if (line.match(/^\d+\.\s+(.+)/)) {
        if (currentStep) steps.push(currentStep);
        currentStep = {
          order: steps.length + 1,
          title: line.replace(/^\d+\.\s+/, '').trim(),
          description: ''
        };
      } else if (currentStep && line.trim() && !line.startsWith('#')) {
        currentStep.description += line + ' ';
      }
    }

    if (currentStep) steps.push(currentStep);
    return steps;
  }

  async generateMetadata() {
    console.log(chalk.blue('Generating consolidated metadata...'));

    const metadata = {
      package: this.config.code,
      version: this.config.version,
      built_at: new Date().toISOString(),
      modules: {},
      totals: {
        agents: 0,
        workflows: 0
      }
    };

    // Generate metadata for each team
    for (const teamName of ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team']) {
      const distTeamPath = path.join(this.distPath, teamName);

      const agentCount = fs.readdirSync(path.join(distTeamPath, 'agents')).length;
      const workflowCount = fs.readdirSync(path.join(distTeamPath, 'workflows')).length;

      metadata.modules[teamName] = {
        agents: agentCount,
        workflows: workflowCount,
        built: true
      };

      metadata.totals.agents += agentCount;
      metadata.totals.workflows += workflowCount;
    }

    fs.writeFileSync(path.join(this.distPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
    console.log(chalk.green('✓ Metadata generated'));
  }

  async createManifest() {
    console.log(chalk.blue('Creating installation manifest...'));

    const manifest = {
      package_name: this.config.npm.full_name,
      version: this.config.version,
      type: 'multi-module',
      modules: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'],
      installation_steps: [
        'validate_environment',
        'create_directories',
        'install_modules',
        'setup_coordination',
        'verify_installation'
      ],
      dependencies: this.config.dependencies,
      created_at: new Date().toISOString()
    };

    fs.writeFileSync(path.join(this.distPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(chalk.green('✓ Installation manifest created'));
  }
}

// Run builder if called directly
if (require.main === module) {
  const builder = new MultiModuleBuilder();
  builder.build().catch(console.error);
}

module.exports = MultiModuleBuilder;