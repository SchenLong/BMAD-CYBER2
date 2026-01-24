#!/usr/bin/env node
/**
 * BMAD Agent Communication Validator
 * Validates specific agent communication across specialized team modules
 *
 * Focus: Testing agent metadata, activation steps, and cross-module communication readiness
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AgentCommunicationValidator {
  constructor() {
    this.distributionPath = path.join(__dirname, '_bmad-output/dist');
    this.testResults = {
      totalAgents: 0,
      validAgents: 0,
      invalidAgents: 0,
      teams: {},
      communicationReadiness: {},
      errors: []
    };

    // Expected agent counts based on Epic 5.1 completion summary
    this.expectedAgentCounts = {
      'cybersec-team': 15,
      'intel-team': 11,
      'legal-team': 13,
      'strategy-team': 14
    };
  }

  async validateAllAgents() {
    console.log('🤖 BMAD Agent Communication Validation');
    console.log('═'.repeat(60));

    const teams = Object.keys(this.expectedAgentCounts);

    for (const team of teams) {
      console.log(`\n📋 Validating ${team} agents...`);
      await this.validateTeamAgents(team);
    }

    await this.validateCrossModuleCommunication();
    this.generateValidationReport();

    return this.testResults;
  }

  async validateTeamAgents(team) {
    const agentsPath = path.join(this.distributionPath, 'src', team, 'agents');

    try {
      const agentFiles = await fs.readdir(agentsPath);
      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

      this.testResults.teams[team] = {
        expectedCount: this.expectedAgentCounts[team],
        actualCount: yamlAgents.length,
        agents: [],
        validAgents: 0,
        invalidAgents: 0
      };

      console.log(`  📊 Expected: ${this.expectedAgentCounts[team]}, Found: ${yamlAgents.length}`);

      if (yamlAgents.length !== this.expectedAgentCounts[team]) {
        console.log(`  ⚠️  Agent count mismatch for ${team}`);
      }

      for (const agentFile of yamlAgents) {
        const agentPath = path.join(agentsPath, agentFile);
        const validation = await this.validateSingleAgent(agentPath, team);

        this.testResults.teams[team].agents.push(validation);

        if (validation.isValid) {
          this.testResults.teams[team].validAgents++;
          this.testResults.validAgents++;
        } else {
          this.testResults.teams[team].invalidAgents++;
          this.testResults.invalidAgents++;
        }

        this.testResults.totalAgents++;
      }

      console.log(`  ✅ Valid agents: ${this.testResults.teams[team].validAgents}`);
      console.log(`  ❌ Invalid agents: ${this.testResults.teams[team].invalidAgents}`);

    } catch (error) {
      console.error(`  💥 Error validating ${team}:`, error.message);
      this.testResults.errors.push({
        team,
        context: 'Team validation',
        error: error.message
      });
    }
  }

  async validateSingleAgent(agentPath, team) {
    const agentName = path.basename(agentPath, '.agent.yaml');

    try {
      const content = await fs.readFile(agentPath, 'utf8');
      const agentConfig = yaml.load(content);

      const validation = {
        name: agentName,
        path: agentPath,
        isValid: true,
        errors: [],
        warnings: [],
        metadata: null,
        communicationReadiness: false
      };

      // Validate root structure
      if (!agentConfig.agent) {
        validation.errors.push('Missing root "agent" key');
        validation.isValid = false;
      } else {
        const agent = agentConfig.agent;

        // Validate metadata
        validation.metadata = this.validateAgentMetadata(agent.metadata, validation);

        // Validate activation
        this.validateAgentActivation(agent.activation, validation);

        // Validate menu
        this.validateAgentMenu(agent.menu, validation);

        // Validate persona
        this.validateAgentPersona(agent.persona, validation);

        // Validate rules
        this.validateAgentRules(agent.rules, validation);

        // Check communication readiness
        validation.communicationReadiness = this.assessCommunicationReadiness(agent, validation);
      }

      if (validation.errors.length === 0) {
        console.log(`    ✅ ${agentName}`);
      } else {
        console.log(`    ❌ ${agentName}: ${validation.errors.length} errors`);
        validation.isValid = false;
      }

      return validation;

    } catch (error) {
      console.log(`    💥 ${agentName}: Parse error - ${error.message}`);
      return {
        name: agentName,
        path: agentPath,
        isValid: false,
        errors: [`Parse error: ${error.message}`],
        warnings: [],
        metadata: null,
        communicationReadiness: false
      };
    }
  }

  validateAgentMetadata(metadata, validation) {
    if (!metadata) {
      validation.errors.push('Missing metadata');
      return null;
    }

    const requiredFields = ['name', 'title', 'description', 'icon', 'version', 'team', 'format_version'];
    const missingFields = requiredFields.filter(field => !metadata[field]);

    if (missingFields.length > 0) {
      validation.errors.push(`Missing metadata fields: ${missingFields.join(', ')}`);
    }

    // Validate specific field formats
    if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      validation.warnings.push('Version format should be semantic versioning (x.y.z)');
    }

    if (metadata.format_version && metadata.format_version !== '1.0.0') {
      validation.warnings.push(`Unexpected format version: ${metadata.format_version}`);
    }

    return metadata;
  }

  validateAgentActivation(activation, validation) {
    if (!activation) {
      validation.errors.push('Missing activation');
      return;
    }

    if (!activation.steps || !Array.isArray(activation.steps)) {
      validation.errors.push('Missing or invalid activation steps');
      return;
    }

    activation.steps.forEach((step, index) => {
      if (typeof step.number !== 'number') {
        validation.errors.push(`Step ${index}: Missing or invalid step number`);
      }

      if (!step.content || typeof step.content !== 'string') {
        validation.errors.push(`Step ${index}: Missing or invalid content`);
      }

      if (typeof step.critical !== 'boolean') {
        validation.warnings.push(`Step ${index}: Missing critical flag`);
      }
    });
  }

  validateAgentMenu(menu, validation) {
    if (!menu) {
      validation.errors.push('Missing menu');
      return;
    }

    if (!menu.items || !Array.isArray(menu.items)) {
      validation.errors.push('Missing or invalid menu items');
      return;
    }

    menu.items.forEach((item, index) => {
      const requiredFields = ['id', 'name', 'command', 'description'];
      const missingFields = requiredFields.filter(field => !item[field]);

      if (missingFields.length > 0) {
        validation.errors.push(`Menu item ${index}: Missing fields: ${missingFields.join(', ')}`);
      }
    });
  }

  validateAgentPersona(persona, validation) {
    if (!persona) {
      validation.errors.push('Missing persona');
      return;
    }

    const requiredFields = ['identity', 'role', 'communication_style'];
    const missingFields = requiredFields.filter(field => !persona[field]);

    if (missingFields.length > 0) {
      validation.errors.push(`Missing persona fields: ${missingFields.join(', ')}`);
    }

    if (!persona.principles || !Array.isArray(persona.principles)) {
      validation.errors.push('Missing or invalid persona principles');
    }
  }

  validateAgentRules(rules, validation) {
    if (!rules) {
      validation.errors.push('Missing rules');
      return;
    }

    const requiredRuleCategories = ['security', 'operational', 'communication'];
    const missingCategories = requiredRuleCategories.filter(category =>
      !rules[category] || !Array.isArray(rules[category])
    );

    if (missingCategories.length > 0) {
      validation.errors.push(`Missing rule categories: ${missingCategories.join(', ')}`);
    }
  }

  assessCommunicationReadiness(agent, validation) {
    // Agent is communication-ready if it has:
    // 1. Valid metadata
    // 2. Proper activation steps
    // 3. Menu items for interaction
    // 4. Clear communication style
    // 5. No critical errors

    const hasValidMetadata = agent.metadata &&
                           agent.metadata.name &&
                           agent.metadata.title;

    const hasActivation = agent.activation &&
                         agent.activation.steps &&
                         agent.activation.steps.length > 0;

    const hasMenu = agent.menu &&
                   agent.menu.items &&
                   agent.menu.items.length > 0;

    const hasCommunicationStyle = agent.persona &&
                                 agent.persona.communication_style;

    const noCriticalErrors = validation.errors.length === 0;

    return hasValidMetadata && hasActivation && hasMenu && hasCommunicationStyle && noCriticalErrors;
  }

  async validateCrossModuleCommunication() {
    console.log('\n🔗 Validating Cross-Module Communication...');

    // Test potential communication pathways between teams
    const communicationPathways = [
      {
        from: 'cybersec-team',
        to: 'intel-team',
        scenario: 'Threat intelligence sharing'
      },
      {
        from: 'intel-team',
        to: 'legal-team',
        scenario: 'Evidence collection and legal review'
      },
      {
        from: 'legal-team',
        to: 'strategy-team',
        scenario: 'Legal risk assessment for strategic decisions'
      },
      {
        from: 'cybersec-team',
        to: 'strategy-team',
        scenario: 'Security considerations for strategic planning'
      }
    ];

    this.testResults.communicationReadiness = {
      pathways: [],
      readyForCrossCommunication: true
    };

    for (const pathway of communicationPathways) {
      const fromTeam = this.testResults.teams[pathway.from];
      const toTeam = this.testResults.teams[pathway.to];

      const pathwayResult = {
        ...pathway,
        fromTeamReady: fromTeam && fromTeam.validAgents > 0,
        toTeamReady: toTeam && toTeam.validAgents > 0,
        isReady: false
      };

      pathwayResult.isReady = pathwayResult.fromTeamReady && pathwayResult.toTeamReady;

      if (!pathwayResult.isReady) {
        this.testResults.communicationReadiness.readyForCrossCommunication = false;
      }

      this.testResults.communicationReadiness.pathways.push(pathwayResult);

      console.log(`  ${pathwayResult.isReady ? '✅' : '❌'} ${pathway.from} ↔ ${pathway.to}: ${pathway.scenario}`);
    }

    const readyCount = this.testResults.communicationReadiness.pathways.filter(p => p.isReady).length;
    console.log(`\n  📊 Communication pathways ready: ${readyCount}/${communicationPathways.length}`);
  }

  generateValidationReport() {
    console.log('\n📋 Agent Communication Validation Summary');
    console.log('═'.repeat(50));

    const totalExpected = Object.values(this.expectedAgentCounts).reduce((sum, count) => sum + count, 0);

    console.log(`📊 Total Agents Expected: ${totalExpected}`);
    console.log(`📊 Total Agents Found: ${this.testResults.totalAgents}`);
    console.log(`✅ Valid Agents: ${this.testResults.validAgents}`);
    console.log(`❌ Invalid Agents: ${this.testResults.invalidAgents}`);
    console.log(`💥 Errors: ${this.testResults.errors.length}`);

    const validationRate = this.testResults.totalAgents > 0 ?
      (this.testResults.validAgents / this.testResults.totalAgents * 100).toFixed(2) : 0;

    console.log(`📈 Validation Success Rate: ${validationRate}%`);

    // Team-by-team summary
    console.log('\n📋 Team Summary:');
    Object.entries(this.testResults.teams).forEach(([team, data]) => {
      const completeness = data.expectedCount > 0 ?
        (data.actualCount / data.expectedCount * 100).toFixed(1) : 0;
      const validationRate = data.actualCount > 0 ?
        (data.validAgents / data.actualCount * 100).toFixed(1) : 0;

      console.log(`  ${team}:`);
      console.log(`    📊 Completeness: ${completeness}% (${data.actualCount}/${data.expectedCount})`);
      console.log(`    ✅ Valid: ${validationRate}% (${data.validAgents}/${data.actualCount})`);
    });

    // Cross-module communication readiness
    console.log('\n🔗 Cross-Module Communication Readiness:');
    console.log(`  Status: ${this.testResults.communicationReadiness.readyForCrossCommunication ? '✅ READY' : '❌ NOT READY'}`);

    this.testResults.communicationReadiness.pathways.forEach(pathway => {
      console.log(`  ${pathway.isReady ? '✅' : '❌'} ${pathway.from} ↔ ${pathway.to}`);
    });

    // Overall assessment
    const overallReady = this.testResults.invalidAgents === 0 &&
                        this.testResults.errors.length === 0 &&
                        this.testResults.totalAgents === totalExpected &&
                        this.testResults.communicationReadiness.readyForCrossCommunication;

    console.log(`\n${overallReady ? '🎉' : '❌'} Overall Assessment: ${overallReady ? 'READY FOR DEPLOYMENT' : 'REQUIRES ATTENTION'}`);

    return this.testResults;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new AgentCommunicationValidator();
  validator.validateAllAgents().catch(error => {
    console.error('Agent validation failed:', error);
    process.exit(1);
  });
}

export { AgentCommunicationValidator };