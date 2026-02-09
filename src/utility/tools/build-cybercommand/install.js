#!/usr/bin/env node

/**
 * BMAD CYBERCOMMAND Multi-Module Installer
 * Handles installation of all 4 specialized team modules
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { normalizeLineEndings } from '../../normalize-line-endings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiModuleInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageRoot = path.dirname(__dirname);
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(this.packageRoot, 'bmad-multi-module.yaml');
    return yaml.load(normalizeLineEndings(fs.readFileSync(configPath, 'utf8')), { schema: yaml.CORE_SCHEMA });
  }

  async install() {
    console.log(chalk.cyan('🚀 BMAD CYBERCOMMAND Multi-Module Installer'));
    console.log(chalk.gray('Installing all 4 specialized team modules...\n'));

    try {
      // 1. Validate target BMAD environment
      await this.validateEnvironment();

      // 2. Create output directories
      await this.createOutputDirectories();

      // 3. Install each team module
      for (const teamName of ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team']) {
        await this.installTeamModule(teamName);
      }

      // 4. Configure cross-team coordination
      await this.setupCoordination();

      // 5. Verify installation
      await this.verifyInstallation();

      console.log(chalk.green('\n✅ Multi-module installation completed successfully!'));
      console.log(chalk.yellow(`Total installed: ${this.config.metadata.total_agents} agents, ${this.config.metadata.total_workflows} workflows`));

    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log(chalk.blue('Validating BMAD environment...'));

    const bmadPath = path.join(this.projectRoot, '_bmad');
    if (!fs.existsSync(bmadPath)) {
      throw new Error('BMAD environment not found. Please run from a valid BMAD project root.');
    }

    const corePath = path.join(bmadPath, 'core');
    if (!fs.existsSync(corePath)) {
      throw new Error('BMAD core module not found. Please ensure BMAD core is installed.');
    }

    console.log(chalk.green('✓ BMAD environment validated'));
  }

  async createOutputDirectories() {
    console.log(chalk.blue('Creating output directories...'));

    const outputPath = path.join(this.projectRoot, '_bmad-output', 'specialized-teams');
    await fs.ensureDir(outputPath);

    for (const [key, subdir] of Object.entries(this.config.computed_paths.output_subdirectories)) {
      const fullPath = path.join(this.projectRoot, subdir.replace('{output_folder}', '_bmad-output/specialized-teams'));
      await fs.ensureDir(fullPath);
    }

    console.log(chalk.green('✓ Output directories created'));
  }

  async installTeamModule(teamName) {
    console.log(chalk.blue(`Installing ${teamName} module...`));

    const sourcePath = path.join(this.packageRoot, 'src', teamName);
    const targetPath = path.join(this.projectRoot, '_bmad', teamName);

    // Copy agents
    const agentsSource = path.join(sourcePath, 'agents');
    const agentsTarget = path.join(targetPath, 'agents');
    await fs.ensureDir(agentsTarget);
    await fs.copy(agentsSource, agentsTarget);

    // Copy workflows
    const workflowsSource = path.join(sourcePath, 'workflows');
    const workflowsTarget = path.join(targetPath, 'workflows');
    await fs.ensureDir(workflowsTarget);
    await fs.copy(workflowsSource, workflowsTarget);

    // Copy configuration files
    const configFiles = ['config.yaml', 'module.yaml', 'manifest.yaml'];
    for (const configFile of configFiles) {
      const sourceFile = path.join(sourcePath, configFile);
      const targetFile = path.join(targetPath, configFile);
      if (fs.existsSync(sourceFile)) {
        await fs.copy(sourceFile, targetFile);
      }
    }

    console.log(chalk.green(`✓ ${teamName} module installed`));
  }

  async setupCoordination() {
    console.log(chalk.blue('Setting up cross-team coordination...'));

    // Create coordination configuration
    const coordinationConfig = {
      enabled: true,
      teams: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'],
      coordination_workflows: [
        'multi-team-consultation',
        'emergency-response',
        'strategic-assessment'
      ]
    };

    const configPath = path.join(this.projectRoot, '_bmad-output', 'specialized-teams', 'coordination', 'config.yaml');
    await fs.ensureDir(path.dirname(configPath));
    fs.writeFileSync(configPath, yaml.dump(coordinationConfig));

    console.log(chalk.green('✓ Cross-team coordination configured'));
  }

  async verifyInstallation() {
    console.log(chalk.blue('Verifying installation...'));

    const expectedTeams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let totalAgents = 0;
    let totalWorkflows = 0;

    for (const teamName of expectedTeams) {
      const teamPath = path.join(this.projectRoot, '_bmad', teamName);

      // Count agents
      const agentsPath = path.join(teamPath, 'agents');
      if (fs.existsSync(agentsPath)) {
        const agents = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));
        totalAgents += agents.length;
      }

      // Count workflows
      const workflowsPath = path.join(teamPath, 'workflows');
      if (fs.existsSync(workflowsPath)) {
        const workflows = fs.readdirSync(workflowsPath).filter(f =>
          fs.statSync(path.join(workflowsPath, f)).isDirectory()
        );
        totalWorkflows += workflows.length;
      }
    }

    if (totalAgents !== this.config.metadata.total_agents) {
      throw new Error(`Agent count mismatch. Expected ${this.config.metadata.total_agents}, found ${totalAgents}`);
    }

    if (totalWorkflows !== this.config.metadata.total_workflows) {
      throw new Error(`Workflow count mismatch. Expected ${this.config.metadata.total_workflows}, found ${totalWorkflows}`);
    }

    console.log(chalk.green('✓ Installation verification passed'));
    console.log(chalk.gray(`  Agents: ${totalAgents}`));
    console.log(chalk.gray(`  Workflows: ${totalWorkflows}`));
  }
}

// Run installer if called directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const installer = new MultiModuleInstaller();
  installer.install().catch(console.error);
}

export default MultiModuleInstaller;