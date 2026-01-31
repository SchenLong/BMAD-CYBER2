#!/usr/bin/env node

/**
 * BMAD CYBERCOMMAND Multi-Module Validator
 * Validates the complete extraction and conversion pipeline
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiModuleValidator {
  constructor() {
    this.packageRoot = path.dirname(__dirname);
    this.config = this.loadConfig();
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  loadConfig() {
    const configPath = path.join(this.packageRoot, 'bmad-multi-module.yaml');
    return yaml.load(fs.readFileSync(configPath, 'utf8'), { schema: yaml.CORE_SCHEMA });
  }

  async validate() {
    console.log(chalk.cyan('🔍 BMAD CYBERCOMMAND Multi-Module Validator'));
    console.log(chalk.gray('Validating complete extraction pipeline...\n'));

    try {
      // 1. Validate source structure
      await this.validateSourceStructure();

      // 2. Validate agent conversions
      await this.validateAgentConversions();

      // 3. Validate workflow conversions
      await this.validateWorkflowConversions();

      // 4. Validate metadata consistency
      await this.validateMetadata();

      // 5. Validate installation readiness
      await this.validateInstallationReadiness();

      // 6. Generate validation report
      this.generateReport();

    } catch (error) {
      console.error(chalk.red('❌ Validation failed:'), error.message);
      process.exit(1);
    }
  }

  async validateSourceStructure() {
    console.log(chalk.blue('Validating source structure...'));

    const expectedTeams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    const expectedCounts = {
      'cybersec-team': { agents: 15, workflows: 13 },
      'intel-team': { agents: 11, workflows: 19 },
      'legal-team': { agents: 13, workflows: 8 },
      'strategy-team': { agents: 14, workflows: 17 }
    };

    for (const teamName of expectedTeams) {
      const teamPath = path.join(this.packageRoot, 'src', teamName);

      if (!fs.existsSync(teamPath)) {
        this.addResult('failed', `Missing team directory: ${teamName}`);
        continue;
      }

      // Validate agents
      const agentsPath = path.join(teamPath, 'agents');
      const agentFiles = fs.existsSync(agentsPath) ?
        fs.readdirSync(agentsPath).filter(f => f.endsWith('.md')) : [];

      if (agentFiles.length !== expectedCounts[teamName].agents) {
        this.addResult('failed',
          `${teamName}: Expected ${expectedCounts[teamName].agents} agents, found ${agentFiles.length}`);
      } else {
        this.addResult('passed', `${teamName}: Agent count validated (${agentFiles.length})`);
      }

      // Validate workflows
      const workflowsPath = path.join(teamPath, 'workflows');
      const workflowDirs = fs.existsSync(workflowsPath) ?
        fs.readdirSync(workflowsPath).filter(f =>
          fs.statSync(path.join(workflowsPath, f)).isDirectory()) : [];

      if (workflowDirs.length !== expectedCounts[teamName].workflows) {
        this.addResult('failed',
          `${teamName}: Expected ${expectedCounts[teamName].workflows} workflows, found ${workflowDirs.length}`);
      } else {
        this.addResult('passed', `${teamName}: Workflow count validated (${workflowDirs.length})`);
      }
    }

    console.log(chalk.green('✓ Source structure validation completed'));
  }

  async validateAgentConversions() {
    console.log(chalk.blue('Validating agent conversions...'));

    const distPath = path.join(this.packageRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      this.addResult('failed', 'Distribution directory not found. Run build first.');
      return;
    }

    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let totalAgents = 0;
    let convertedAgents = 0;

    for (const teamName of teams) {
      const sourceAgentsPath = path.join(this.packageRoot, 'src', teamName, 'agents');
      const distAgentsPath = path.join(distPath, teamName, 'agents');

      if (!fs.existsSync(sourceAgentsPath) || !fs.existsSync(distAgentsPath)) {
        this.addResult('failed', `${teamName}: Missing agents directory`);
        continue;
      }

      const sourceAgents = fs.readdirSync(sourceAgentsPath).filter(f => f.endsWith('.md'));
      const distAgents = fs.readdirSync(distAgentsPath).filter(f => f.endsWith('.yaml'));

      totalAgents += sourceAgents.length;
      convertedAgents += distAgents.length;

      if (sourceAgents.length !== distAgents.length) {
        this.addResult('failed',
          `${teamName}: Agent conversion mismatch. Source: ${sourceAgents.length}, Converted: ${distAgents.length}`);
      } else {
        this.addResult('passed', `${teamName}: All ${sourceAgents.length} agents converted successfully`);
      }

      // Validate individual agent conversions
      for (const sourceAgent of sourceAgents) {
        const expectedYaml = sourceAgent.replace('.md', '.yaml');
        const yamlPath = path.join(distAgentsPath, expectedYaml);

        if (fs.existsSync(yamlPath)) {
          try {
            const agentYaml = yaml.load(fs.readFileSync(yamlPath, 'utf8'), { schema: yaml.CORE_SCHEMA });
            if (agentYaml.id && agentYaml.name && agentYaml.team) {
              this.addResult('passed', `${teamName}/${sourceAgent}: Valid YAML structure`);
            } else {
              this.addResult('failed', `${teamName}/${sourceAgent}: Invalid YAML structure`);
            }
          } catch (error) {
            this.addResult('failed', `${teamName}/${sourceAgent}: YAML parsing error`);
          }
        } else {
          this.addResult('failed', `${teamName}/${sourceAgent}: Missing YAML conversion`);
        }
      }
    }

    if (convertedAgents === this.config.metadata.total_agents) {
      this.addResult('passed', `Total agent conversion validated: ${convertedAgents}/${this.config.metadata.total_agents}`);
    } else {
      this.addResult('failed', `Total agent conversion mismatch: ${convertedAgents}/${this.config.metadata.total_agents}`);
    }

    console.log(chalk.green('✓ Agent conversion validation completed'));
  }

  async validateWorkflowConversions() {
    console.log(chalk.blue('Validating workflow conversions...'));

    const distPath = path.join(this.packageRoot, 'dist');
    const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    let totalWorkflows = 0;
    let convertedWorkflows = 0;

    for (const teamName of teams) {
      const sourceWorkflowsPath = path.join(this.packageRoot, 'src', teamName, 'workflows');
      const distWorkflowsPath = path.join(distPath, teamName, 'workflows');

      if (!fs.existsSync(sourceWorkflowsPath) || !fs.existsSync(distWorkflowsPath)) {
        this.addResult('failed', `${teamName}: Missing workflows directory`);
        continue;
      }

      const sourceWorkflows = fs.readdirSync(sourceWorkflowsPath).filter(f =>
        fs.statSync(path.join(sourceWorkflowsPath, f)).isDirectory());
      const distWorkflows = fs.readdirSync(distWorkflowsPath).filter(f =>
        fs.statSync(path.join(distWorkflowsPath, f)).isDirectory());

      totalWorkflows += sourceWorkflows.length;
      convertedWorkflows += distWorkflows.length;

      if (sourceWorkflows.length !== distWorkflows.length) {
        this.addResult('failed',
          `${teamName}: Workflow conversion mismatch. Source: ${sourceWorkflows.length}, Converted: ${distWorkflows.length}`);
      } else {
        this.addResult('passed', `${teamName}: All ${sourceWorkflows.length} workflows copied successfully`);
      }

      // Validate workflow structure
      for (const workflowName of sourceWorkflows) {
        const distWorkflowPath = path.join(distWorkflowsPath, workflowName);
        const workflowYamlPath = path.join(distWorkflowPath, 'workflow.yaml');

        if (fs.existsSync(workflowYamlPath)) {
          try {
            const workflowYaml = yaml.load(fs.readFileSync(workflowYamlPath, 'utf8'), { schema: yaml.CORE_SCHEMA });
            if (workflowYaml.id && workflowYaml.name) {
              this.addResult('passed', `${teamName}/${workflowName}: Valid workflow YAML`);
            } else {
              this.addResult('warning', `${teamName}/${workflowName}: Minimal workflow YAML structure`);
            }
          } catch (error) {
            this.addResult('warning', `${teamName}/${workflowName}: No workflow YAML found`);
          }
        }
      }
    }

    if (convertedWorkflows === this.config.metadata.total_workflows) {
      this.addResult('passed', `Total workflow conversion validated: ${convertedWorkflows}/${this.config.metadata.total_workflows}`);
    } else {
      this.addResult('failed', `Total workflow conversion mismatch: ${convertedWorkflows}/${this.config.metadata.total_workflows}`);
    }

    console.log(chalk.green('✓ Workflow conversion validation completed'));
  }

  async validateMetadata() {
    console.log(chalk.blue('Validating metadata consistency...'));

    // Validate main config
    if (!this.config.code || !this.config.version) {
      this.addResult('failed', 'Missing required metadata fields');
    } else {
      this.addResult('passed', 'Core metadata fields present');
    }

    // Validate agent list consistency
    if (this.config.agents.agent_list && this.config.agents.agent_list.length === this.config.agents.count) {
      this.addResult('passed', `Agent list consistency validated: ${this.config.agents.agent_list.length} agents`);
    } else {
      this.addResult('failed', 'Agent list count mismatch with declared agent count');
    }

    // Validate workflow list consistency
    if (this.config.workflows.workflow_list && this.config.workflows.workflow_list.length === this.config.workflows.count) {
      this.addResult('passed', `Workflow list consistency validated: ${this.config.workflows.workflow_list.length} workflows`);
    } else {
      this.addResult('failed', 'Workflow list count mismatch with declared workflow count');
    }

    // Validate module configurations
    for (const teamName of ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team']) {
      const modulePath = path.join(this.packageRoot, 'modules', `${teamName}.yaml`);
      if (fs.existsSync(modulePath)) {
        try {
          const moduleConfig = yaml.load(fs.readFileSync(modulePath, 'utf8'), { schema: yaml.CORE_SCHEMA });
          if (moduleConfig.code === teamName) {
            this.addResult('passed', `${teamName}: Module configuration valid`);
          } else {
            this.addResult('failed', `${teamName}: Module configuration code mismatch`);
          }
        } catch (error) {
          this.addResult('failed', `${teamName}: Module configuration parsing error`);
        }
      } else {
        this.addResult('failed', `${teamName}: Module configuration missing`);
      }
    }

    console.log(chalk.green('✓ Metadata validation completed'));
  }

  async validateInstallationReadiness() {
    console.log(chalk.blue('Validating installation readiness...'));

    // Check required scripts
    const requiredScripts = ['install.js', 'build.js', 'validate.js'];
    for (const script of requiredScripts) {
      const scriptPath = path.join(this.packageRoot, 'scripts', script);
      if (fs.existsSync(scriptPath)) {
        this.addResult('passed', `Required script present: ${script}`);
      } else {
        this.addResult('failed', `Missing required script: ${script}`);
      }
    }

    // Check package.json
    const packageJsonPath = path.join(this.packageRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name && packageJson.version && packageJson.scripts) {
          this.addResult('passed', 'Package.json is valid');
        } else {
          this.addResult('failed', 'Package.json missing required fields');
        }
      } catch (error) {
        this.addResult('failed', 'Package.json parsing error');
      }
    } else {
      this.addResult('failed', 'Package.json missing');
    }

    // Check distribution directory
    const distPath = path.join(this.packageRoot, 'dist');
    if (fs.existsSync(distPath)) {
      const manifestPath = path.join(distPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        this.addResult('passed', 'Installation manifest present');
      } else {
        this.addResult('warning', 'Installation manifest missing');
      }
    } else {
      this.addResult('warning', 'Distribution directory not built yet');
    }

    console.log(chalk.green('✓ Installation readiness validation completed'));
  }

  addResult(type, message) {
    this.validationResults[type]++;
    this.validationResults.details.push({ type, message });

    const icon = type === 'passed' ? '✓' :
                 type === 'warning' ? '⚠' : '✗';
    const color = type === 'passed' ? chalk.green :
                  type === 'warning' ? chalk.yellow : chalk.red;

    console.log(color(`  ${icon} ${message}`));
  }

  generateReport() {
    console.log(chalk.cyan('\n📊 Validation Report'));
    console.log(chalk.gray('========================'));

    console.log(chalk.green(`✓ Passed: ${this.validationResults.passed}`));
    if (this.validationResults.warnings > 0) {
      console.log(chalk.yellow(`⚠ Warnings: ${this.validationResults.warnings}`));
    }
    if (this.validationResults.failed > 0) {
      console.log(chalk.red(`✗ Failed: ${this.validationResults.failed}`));
    }

    const total = this.validationResults.passed + this.validationResults.warnings + this.validationResults.failed;
    const successRate = ((this.validationResults.passed / total) * 100).toFixed(1);

    console.log(chalk.blue(`\nOverall Success Rate: ${successRate}%`));

    if (this.validationResults.failed === 0) {
      console.log(chalk.green('\n🎉 Multi-module extraction pipeline validation PASSED!'));
      console.log(chalk.gray('Ready for production deployment.'));
    } else {
      console.log(chalk.red('\n❌ Multi-module extraction pipeline validation FAILED!'));
      console.log(chalk.gray('Please address the failed checks before deployment.'));
      process.exit(1);
    }

    // Save detailed report
    const reportPath = path.join(this.packageRoot, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.validationResults.passed,
        warnings: this.validationResults.warnings,
        failed: this.validationResults.failed,
        success_rate: successRate
      },
      details: this.validationResults.details
    }, null, 2));

    console.log(chalk.gray(`\nDetailed report saved to: ${reportPath}`));
  }
}

// Run validator if called directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const validator = new MultiModuleValidator();
  validator.validate().catch(console.error);
}

export default MultiModuleValidator;