#!/usr/bin/env node
/**
 * BMAD Agent YAML Format Validator
 * Specialized validation system for agent YAML format compliance
 *
 * Validates agent YAML files against bmad-agent schema and ensures
 * proper conversion from MD to YAML format while preserving functionality.
 *
 * Author: Murat (Test Architect)
 * Version: 1.0.0
 * Epic: 4 - Packaging & Distribution Automation
 * Story: 4.3 - Quality Assurance for Distribution Packages
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * BMAD Agent YAML Format Validator
 * Comprehensive validation for agent YAML format compliance
 */
class BMAdAgentYAMLValidator {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      schemaFile: options.schemaFile || '/Users/paultinp/BMAD-CYBER2/bmad-agent-schema.yaml',
      strictMode: options.strictMode || false,
      verbose: options.verbose || false,
      ...options
    };

    this.validationResults = {
      passed: [],
      failed: [],
      warnings: [],
      statistics: {
        total_agents: 0,
        valid_agents: 0,
        invalid_agents: 0,
        warning_agents: 0
      }
    };

    this.agentSchema = this.initializeAgentSchema();
    this.teamMappings = this.initializeTeamMappings();
  }

  /**
   * Initialize agent schema validation rules
   */
  initializeAgentSchema() {
    return {
      required_fields: [
        'name',
        'role',
        'team',
        'capabilities',
        'configuration',
        'prompts'
      ],
      optional_fields: [
        'description',
        'version',
        'author',
        'dependencies',
        'tools',
        'examples',
        'metadata'
      ],
      structure_validation: {
        capabilities: {
          required_subfields: ['core', 'specialized'],
          core_capabilities: [
            'analysis', 'research', 'documentation', 'communication',
            'problem_solving', 'strategic_thinking', 'technical_implementation'
          ]
        },
        configuration: {
          required_subfields: ['model', 'temperature', 'max_tokens'],
          optional_subfields: ['system_prompt', 'tools_config', 'constraints']
        },
        prompts: {
          required_subfields: ['system_prompt', 'user_prompt_template'],
          optional_subfields: ['examples', 'context_templates', 'response_format']
        }
      }
    };
  }

  /**
   * Initialize team-specific validation mappings
   */
  initializeTeamMappings() {
    return {
      'cybersec-team': {
        expected_roles: [
          'Security Operations Specialist', 'Penetration Testing Expert', 'Incident Response Coordinator',
          'Threat Hunter', 'Digital Forensics Analyst', 'Vulnerability Assessment Specialist',
          'Security Architecture Consultant', 'Malware Analysis Expert', 'Network Security Analyst',
          'Compliance and Audit Specialist', 'Security Engineering Manager', 'Red Team Operator',
          'Blue Team Defender', 'Threat Intelligence Analyst', 'Security Automation Engineer'
        ],
        expected_capabilities: ['security_analysis', 'threat_detection', 'incident_response', 'vulnerability_assessment']
      },
      'intel-team': {
        expected_roles: [
          'Intelligence Operations Director', 'Dark Web Intelligence Analyst', 'Geospatial Intelligence Analyst',
          'Signals Intelligence Specialist', 'Human Intelligence Specialist', 'Technical Intelligence Researcher',
          'Field Operations Specialist', 'Social Media Intelligence Analyst', 'Corporate Intelligence Specialist',
          'Domain Intelligence Specialist', 'Threat Actor Profiler'
        ],
        expected_capabilities: ['intelligence_gathering', 'data_analysis', 'pattern_recognition', 'investigation']
      },
      'legal-team': {
        expected_roles: [
          'General Counsel', 'US Corporate Law Specialist', 'Spanish Law Specialist', 'Estonian Law Specialist',
          'EU Law Specialist', 'IP Law Specialist', 'Real Estate Law Specialist', 'Tax Law Specialist',
          'Litigation Specialist', 'Contract Specialist', 'Corporate Governance Specialist', 'Employment Law Specialist'
        ],
        expected_capabilities: ['legal_analysis', 'contract_drafting', 'compliance_review', 'risk_assessment']
      },
      'strategy-team': {
        expected_roles: [
          'Strategic Advisor', 'Conservative Strategist', 'Revolutionary Thinker', 'Master Strategist',
          'Realist Advisor', 'Principled Commander', 'Policy Analyst', 'Political Strategist',
          'Technocrat Advisor', 'Ethics Advisor', 'Warrior Strategist', 'Liberation Strategist',
          'Communications Director', 'Stakeholder Mediator'
        ],
        expected_capabilities: ['strategic_planning', 'decision_making', 'stakeholder_management', 'communication']
      }
    };
  }

  /**
   * Main validation entry point
   */
  async validateAllAgents(teamFilter = null) {
    console.log('🤖 BMAD Agent YAML Format Validator v1.0.0');
    console.log('='.repeat(50));

    try {
      // Load agent schema if available
      await this.loadAgentSchema();

      // Determine teams to validate
      const teamsToValidate = teamFilter ? [teamFilter] : Object.keys(this.teamMappings);

      // Validate each team's agents
      for (const team of teamsToValidate) {
        await this.validateTeamAgents(team);
      }

      // Generate validation report
      const report = await this.generateValidationReport();

      console.log('');
      console.log(`✅ Agent YAML validation completed`);
      console.log(`📊 Results: ${this.validationResults.statistics.valid_agents}/${this.validationResults.statistics.total_agents} agents valid`);
      console.log(`⚠️  Warnings: ${this.validationResults.statistics.warning_agents} agents with warnings`);

      return report;

    } catch (error) {
      console.error('❌ Agent YAML validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Load agent schema from file if available
   */
  async loadAgentSchema() {
    try {
      const schemaExists = await fs.access(this.options.schemaFile).then(() => true).catch(() => false);
      if (schemaExists) {
        const schemaContent = await fs.readFile(this.options.schemaFile, 'utf8');
        const loadedSchema = yaml.load(schemaContent);

        // Merge with default schema
        this.agentSchema = { ...this.agentSchema, ...loadedSchema };

        if (this.options.verbose) {
          console.log(`📋 Loaded agent schema from ${this.options.schemaFile}`);
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️  Could not load agent schema: ${error.message}, using defaults`);
      }
    }
  }

  /**
   * Validate all agents for a specific team
   */
  async validateTeamAgents(teamName) {
    console.log(`🔍 Validating ${teamName} agents...`);

    const teamPath = path.join(this.options.sourceRoot, teamName);
    const agentsPath = path.join(teamPath, 'agents');

    try {
      const agentFiles = await fs.readdir(agentsPath);
      let teamValidAgents = 0;
      let teamTotalAgents = 0;

      for (const agentFile of agentFiles) {
        if (agentFile.endsWith('.md') || agentFile.endsWith('.agent.yaml') || agentFile.endsWith('.yaml')) {
          teamTotalAgents++;
          this.validationResults.statistics.total_agents++;

          const agentPath = path.join(agentsPath, agentFile);
          const isValid = await this.validateSingleAgent(agentPath, teamName, agentFile);

          if (isValid) {
            teamValidAgents++;
            this.validationResults.statistics.valid_agents++;
          } else {
            this.validationResults.statistics.invalid_agents++;
          }
        }
      }

      console.log(`  📊 ${teamName}: ${teamValidAgents}/${teamTotalAgents} agents valid`);

    } catch (error) {
      this.validationResults.failed.push({
        test: `team_agents_access_${teamName}`,
        agent_file: `${teamName}/agents/`,
        error: `Cannot access agents directory: ${error.message}`,
        severity: 'critical'
      });

      console.error(`❌ Cannot access ${teamName} agents: ${error.message}`);
    }
  }

  /**
   * Validate a single agent file
   */
  async validateSingleAgent(agentPath, teamName, agentFile) {
    try {
      const agentContent = await fs.readFile(agentPath, 'utf8');
      let agentData;
      let isMarkdown = agentFile.endsWith('.md');

      // Parse agent data based on format
      if (isMarkdown) {
        agentData = await this.parseMarkdownAgent(agentContent);
      } else {
        agentData = yaml.load(agentContent);
      }

      // Validate agent data
      const validationResult = await this.validateAgentStructure(agentData, teamName, agentFile);

      // Record validation result
      if (validationResult.isValid) {
        this.validationResults.passed.push({
          test: `agent_validation_${teamName}_${agentFile}`,
          agent_file: `${teamName}/agents/${agentFile}`,
          agent_name: agentData.name || agentFile,
          status: 'passed',
          format: isMarkdown ? 'markdown' : 'yaml'
        });

        // Check for warnings
        if (validationResult.warnings.length > 0) {
          this.validationResults.statistics.warning_agents++;
          validationResult.warnings.forEach(warning => {
            this.validationResults.warnings.push({
              test: `agent_warning_${teamName}_${agentFile}`,
              agent_file: `${teamName}/agents/${agentFile}`,
              warning: warning,
              severity: 'warning'
            });
          });
        }

        return true;
      } else {
        this.validationResults.failed.push({
          test: `agent_validation_${teamName}_${agentFile}`,
          agent_file: `${teamName}/agents/${agentFile}`,
          agent_name: agentData.name || agentFile,
          error: validationResult.errors.join(', '),
          severity: 'critical'
        });
        return false;
      }

    } catch (error) {
      this.validationResults.failed.push({
        test: `agent_parsing_${teamName}_${agentFile}`,
        agent_file: `${teamName}/agents/${agentFile}`,
        error: `Agent parsing failed: ${error.message}`,
        severity: 'critical'
      });
      return false;
    }
  }

  /**
   * Parse markdown agent file to extract YAML-compatible data
   */
  async parseMarkdownAgent(content) {
    const agentData = {
      name: '',
      role: '',
      team: '',
      capabilities: {},
      configuration: {},
      prompts: {}
    };

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
    if (frontmatterMatch) {
      const frontmatter = yaml.load(frontmatterMatch[1]);
      Object.assign(agentData, frontmatter);
    }

    // Extract XML configuration if present
    const xmlMatch = content.match(/<agent-config>(.*?)<\/agent-config>/s);
    if (xmlMatch) {
      // Parse XML-like configuration (simplified)
      const xmlContent = xmlMatch[1];

      const nameMatch = xmlContent.match(/<name>(.*?)<\/name>/s);
      if (nameMatch) agentData.name = nameMatch[1].trim();

      const roleMatch = xmlContent.match(/<role>(.*?)<\/role>/s);
      if (roleMatch) agentData.role = roleMatch[1].trim();

      const teamMatch = xmlContent.match(/<team>(.*?)<\/team>/s);
      if (teamMatch) agentData.team = teamMatch[1].trim();
    }

    // Extract capabilities from content sections
    const capabilitiesMatch = content.match(/## Capabilities?\s*\n(.*?)(?=\n##|\n<|\n$)/s);
    if (capabilitiesMatch) {
      const capText = capabilitiesMatch[1];
      agentData.capabilities.core = this.extractListFromText(capText);
    }

    // Extract prompts from content
    const promptMatch = content.match(/## (?:System Prompt|Prompt)\s*\n(.*?)(?=\n##|\n<|\n$)/s);
    if (promptMatch) {
      agentData.prompts.system_prompt = promptMatch[1].trim();
    }

    return agentData;
  }

  /**
   * Extract list items from markdown text
   */
  extractListFromText(text) {
    const listItems = text.match(/^[-*+]\s+(.+)$/gm) || [];
    return listItems.map(item => item.replace(/^[-*+]\s+/, '').trim());
  }

  /**
   * Validate agent structure against schema
   */
  async validateAgentStructure(agentData, teamName, agentFile) {
    const errors = [];
    const warnings = [];
    let isValid = true;

    // Check required fields
    for (const field of this.agentSchema.required_fields) {
      if (!agentData[field]) {
        errors.push(`Missing required field: ${field}`);
        isValid = false;
      }
    }

    // Validate team alignment
    if (agentData.team && agentData.team !== teamName) {
      warnings.push(`Agent team '${agentData.team}' doesn't match directory '${teamName}'`);
    }

    // Validate role against expected roles
    if (agentData.role && this.teamMappings[teamName]) {
      const expectedRoles = this.teamMappings[teamName].expected_roles;
      if (!expectedRoles.includes(agentData.role)) {
        warnings.push(`Role '${agentData.role}' not in expected roles for ${teamName}`);
      }
    }

    // Validate capabilities structure
    if (agentData.capabilities) {
      const capValidation = this.validateCapabilities(agentData.capabilities, teamName);
      if (!capValidation.isValid) {
        errors.push(...capValidation.errors);
        isValid = false;
      }
      warnings.push(...capValidation.warnings);
    } else {
      errors.push('Missing capabilities section');
      isValid = false;
    }

    // Validate configuration structure
    if (agentData.configuration) {
      const configValidation = this.validateConfiguration(agentData.configuration);
      if (!configValidation.isValid) {
        errors.push(...configValidation.errors);
        isValid = false;
      }
      warnings.push(...configValidation.warnings);
    } else {
      errors.push('Missing configuration section');
      isValid = false;
    }

    // Validate prompts structure
    if (agentData.prompts) {
      const promptValidation = this.validatePrompts(agentData.prompts);
      if (!promptValidation.isValid) {
        errors.push(...promptValidation.errors);
        isValid = false;
      }
      warnings.push(...promptValidation.warnings);
    } else {
      errors.push('Missing prompts section');
      isValid = false;
    }

    // Additional validations for strict mode
    if (this.options.strictMode) {
      const strictValidation = this.validateStrictMode(agentData, teamName);
      errors.push(...strictValidation.errors);
      warnings.push(...strictValidation.warnings);
      if (strictValidation.errors.length > 0) {
        isValid = false;
      }
    }

    return { isValid, errors, warnings };
  }

  /**
   * Validate capabilities structure
   */
  validateCapabilities(capabilities, teamName) {
    const errors = [];
    const warnings = [];
    let isValid = true;

    // Check if capabilities is an object
    if (typeof capabilities !== 'object') {
      errors.push('Capabilities must be an object');
      return { isValid: false, errors, warnings };
    }

    // Check required capability subfields
    const requiredSubfields = this.agentSchema.structure_validation.capabilities.required_subfields;
    for (const field of requiredSubfields) {
      if (!capabilities[field]) {
        errors.push(`Missing required capabilities field: ${field}`);
        isValid = false;
      }
    }

    // Validate core capabilities
    if (capabilities.core && Array.isArray(capabilities.core)) {
      const coreCapabilities = this.agentSchema.structure_validation.capabilities.core_capabilities;
      const hasValidCoreCapabilities = capabilities.core.some(cap =>
        coreCapabilities.some(core => cap.toLowerCase().includes(core.toLowerCase().replace('_', ' ')))
      );

      if (!hasValidCoreCapabilities) {
        warnings.push('Core capabilities may not align with standard BMAD capabilities');
      }
    } else {
      errors.push('Core capabilities must be an array');
      isValid = false;
    }

    // Check team-specific capabilities
    if (this.teamMappings[teamName] && this.teamMappings[teamName].expected_capabilities) {
      const expectedCapabilities = this.teamMappings[teamName].expected_capabilities;
      const hasTeamCapabilities = capabilities.specialized && Array.isArray(capabilities.specialized) &&
        capabilities.specialized.some(cap =>
          expectedCapabilities.some(expected => cap.toLowerCase().includes(expected.toLowerCase().replace('_', ' ')))
        );

      if (!hasTeamCapabilities) {
        warnings.push(`Agent may be missing team-specific capabilities for ${teamName}`);
      }
    }

    return { isValid, errors, warnings };
  }

  /**
   * Validate configuration structure
   */
  validateConfiguration(configuration) {
    const errors = [];
    const warnings = [];
    let isValid = true;

    // Check if configuration is an object
    if (typeof configuration !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors, warnings };
    }

    // Check required configuration fields
    const requiredFields = this.agentSchema.structure_validation.configuration.required_subfields;
    for (const field of requiredFields) {
      if (!configuration[field]) {
        errors.push(`Missing required configuration field: ${field}`);
        isValid = false;
      }
    }

    // Validate specific configuration values
    if (configuration.model && typeof configuration.model !== 'string') {
      errors.push('Model must be a string');
      isValid = false;
    }

    if (configuration.temperature !== undefined) {
      const temp = parseFloat(configuration.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        warnings.push('Temperature should be between 0 and 2');
      }
    }

    if (configuration.max_tokens !== undefined) {
      const tokens = parseInt(configuration.max_tokens);
      if (isNaN(tokens) || tokens < 1 || tokens > 32000) {
        warnings.push('Max tokens should be between 1 and 32000');
      }
    }

    return { isValid, errors, warnings };
  }

  /**
   * Validate prompts structure
   */
  validatePrompts(prompts) {
    const errors = [];
    const warnings = [];
    let isValid = true;

    // Check if prompts is an object
    if (typeof prompts !== 'object') {
      errors.push('Prompts must be an object');
      return { isValid: false, errors, warnings };
    }

    // Check required prompt fields
    const requiredFields = this.agentSchema.structure_validation.prompts.required_subfields;
    for (const field of requiredFields) {
      if (!prompts[field]) {
        errors.push(`Missing required prompts field: ${field}`);
        isValid = false;
      }
    }

    // Validate prompt content
    if (prompts.system_prompt) {
      if (typeof prompts.system_prompt !== 'string') {
        errors.push('System prompt must be a string');
        isValid = false;
      } else if (prompts.system_prompt.length < 50) {
        warnings.push('System prompt seems very short');
      }
    }

    if (prompts.user_prompt_template) {
      if (typeof prompts.user_prompt_template !== 'string') {
        errors.push('User prompt template must be a string');
        isValid = false;
      }
    }

    return { isValid, errors, warnings };
  }

  /**
   * Additional validations for strict mode
   */
  validateStrictMode(agentData, teamName) {
    const errors = [];
    const warnings = [];

    // Check for all optional fields in strict mode
    const optionalFields = this.agentSchema.optional_fields;
    for (const field of optionalFields) {
      if (!agentData[field]) {
        warnings.push(`Missing optional field in strict mode: ${field}`);
      }
    }

    // Validate metadata if present
    if (agentData.metadata) {
      if (!agentData.metadata.version) {
        warnings.push('Missing version in metadata');
      }
      if (!agentData.metadata.author) {
        warnings.push('Missing author in metadata');
      }
    } else {
      warnings.push('Missing metadata section in strict mode');
    }

    // Validate examples if present
    if (agentData.examples && !Array.isArray(agentData.examples)) {
      errors.push('Examples must be an array');
    }

    return { errors, warnings };
  }

  /**
   * Generate comprehensive validation report
   */
  async generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      validator_version: '1.0.0',
      validation_summary: {
        total_agents: this.validationResults.statistics.total_agents,
        valid_agents: this.validationResults.statistics.valid_agents,
        invalid_agents: this.validationResults.statistics.invalid_agents,
        warning_agents: this.validationResults.statistics.warning_agents,
        success_rate: this.calculateSuccessRate(),
        overall_status: this.calculateOverallStatus()
      },
      team_breakdown: this.calculateTeamBreakdown(),
      validation_details: {
        passed_tests: this.validationResults.passed,
        failed_tests: this.validationResults.failed,
        warnings: this.validationResults.warnings
      },
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = path.join(this.options.planningArtifacts || '/Users/paultinp/BMAD-CYBER2/_bmad-output/planning-artifacts', 'AGENT-YAML-VALIDATION-REPORT.md');
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile(reportPath, markdownReport);

    if (this.options.verbose) {
      console.log(`📄 Agent YAML validation report saved: ${reportPath}`);
    }

    return report;
  }

  /**
   * Calculate success rate percentage
   */
  calculateSuccessRate() {
    if (this.validationResults.statistics.total_agents === 0) return 100;
    return Math.round((this.validationResults.statistics.valid_agents / this.validationResults.statistics.total_agents) * 100);
  }

  /**
   * Calculate overall validation status
   */
  calculateOverallStatus() {
    const successRate = this.calculateSuccessRate();
    if (successRate >= 95) return 'excellent';
    if (successRate >= 85) return 'good';
    if (successRate >= 70) return 'fair';
    return 'needs_improvement';
  }

  /**
   * Calculate team-specific breakdown
   */
  calculateTeamBreakdown() {
    const teamStats = {};

    // Initialize team stats
    Object.keys(this.teamMappings).forEach(team => {
      teamStats[team] = {
        total: 0,
        valid: 0,
        invalid: 0,
        warnings: 0,
        success_rate: 0
      };
    });

    // Count passed tests by team
    this.validationResults.passed.forEach(result => {
      const teamMatch = result.agent_file.match(/^([^\/]+)/);
      if (teamMatch) {
        const team = teamMatch[1];
        if (teamStats[team]) {
          teamStats[team].total++;
          teamStats[team].valid++;
        }
      }
    });

    // Count failed tests by team
    this.validationResults.failed.forEach(result => {
      const teamMatch = result.agent_file.match(/^([^\/]+)/);
      if (teamMatch) {
        const team = teamMatch[1];
        if (teamStats[team]) {
          teamStats[team].total++;
          teamStats[team].invalid++;
        }
      }
    });

    // Count warnings by team
    this.validationResults.warnings.forEach(result => {
      const teamMatch = result.agent_file.match(/^([^\/]+)/);
      if (teamMatch) {
        const team = teamMatch[1];
        if (teamStats[team]) {
          teamStats[team].warnings++;
        }
      }
    });

    // Calculate success rates
    Object.keys(teamStats).forEach(team => {
      if (teamStats[team].total > 0) {
        teamStats[team].success_rate = Math.round((teamStats[team].valid / teamStats[team].total) * 100);
      } else {
        teamStats[team].success_rate = 100;
      }
    });

    return teamStats;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    const recommendations = [];
    const successRate = this.calculateSuccessRate();

    if (successRate < 70) {
      recommendations.push({
        priority: 'critical',
        category: 'overall',
        issue: 'Low agent validation success rate',
        suggestion: 'Review and fix critical YAML format issues across all teams',
        affected_agents: this.validationResults.statistics.invalid_agents
      });
    }

    // Team-specific recommendations
    const teamBreakdown = this.calculateTeamBreakdown();
    Object.entries(teamBreakdown).forEach(([team, stats]) => {
      if (stats.success_rate < 80 && stats.total > 0) {
        recommendations.push({
          priority: 'high',
          category: 'team',
          team: team,
          issue: `${team} has low agent validation success rate (${stats.success_rate}%)`,
          suggestion: `Review and fix YAML format issues in ${team} agents`,
          affected_agents: stats.invalid
        });
      }

      if (stats.warnings > stats.total * 0.5) {
        recommendations.push({
          priority: 'medium',
          category: 'team',
          team: team,
          issue: `${team} has many validation warnings`,
          suggestion: `Address validation warnings to improve ${team} agent quality`,
          affected_agents: stats.warnings
        });
      }
    });

    // Common error pattern recommendations
    const commonErrors = this.analyzeCommonErrors();
    commonErrors.forEach(error => {
      recommendations.push({
        priority: 'medium',
        category: 'pattern',
        issue: `Common validation error: ${error.pattern}`,
        suggestion: error.suggestion,
        affected_agents: error.count
      });
    });

    return recommendations;
  }

  /**
   * Analyze common error patterns
   */
  analyzeCommonErrors() {
    const errorCounts = {};

    this.validationResults.failed.forEach(failure => {
      const error = failure.error;
      if (errorCounts[error]) {
        errorCounts[error]++;
      } else {
        errorCounts[error] = 1;
      }
    });

    const commonErrors = Object.entries(errorCounts)
      .filter(([error, count]) => count > 1)
      .map(([error, count]) => ({
        pattern: error,
        count,
        suggestion: this.getErrorSuggestion(error)
      }))
      .sort((a, b) => b.count - a.count);

    return commonErrors;
  }

  /**
   * Get suggestion for common error patterns
   */
  getErrorSuggestion(error) {
    if (error.includes('Missing required field')) {
      return 'Ensure all required fields are present in agent YAML files';
    }
    if (error.includes('capabilities')) {
      return 'Review capabilities structure and ensure proper format';
    }
    if (error.includes('configuration')) {
      return 'Check configuration section for required fields and proper values';
    }
    if (error.includes('prompts')) {
      return 'Verify prompts section has required system_prompt and user_prompt_template';
    }
    if (error.includes('parsing failed')) {
      return 'Check YAML syntax and ensure proper formatting';
    }
    return 'Review agent structure and ensure compliance with BMAD agent schema';
  }

  /**
   * Generate markdown validation report
   */
  generateMarkdownReport(report) {
    return `# BMAD Agent YAML Format Validation Report

**Generated**: ${new Date(report.timestamp).toLocaleString()}
**Validator Version**: ${report.validator_version}
**Author**: Murat (Test Architect)

## Validation Summary

- **Total Agents**: ${report.validation_summary.total_agents}
- **Valid Agents**: ${report.validation_summary.valid_agents}
- **Invalid Agents**: ${report.validation_summary.invalid_agents}
- **Agents with Warnings**: ${report.validation_summary.warning_agents}
- **Success Rate**: ${report.validation_summary.success_rate}%
- **Overall Status**: ${report.validation_summary.overall_status.toUpperCase()}

## Team Breakdown

| Team | Total | Valid | Invalid | Warnings | Success Rate |
|------|-------|-------|---------|----------|--------------|
${Object.entries(report.team_breakdown).map(([team, stats]) =>
  `| ${team} | ${stats.total} | ${stats.valid} | ${stats.invalid} | ${stats.warnings} | ${stats.success_rate}% |`
).join('\n')}

## Validation Results

### ✅ Passed Validations (${report.validation_details.passed_tests.length})

${report.validation_details.passed_tests.length === 0 ? 'No successful validations.' : report.validation_details.passed_tests.map(test =>
  `- **${test.agent_name || test.agent_file}**: ${test.status} (${test.format || 'unknown'} format)`
).join('\n')}

### ❌ Failed Validations (${report.validation_details.failed_tests.length})

${report.validation_details.failed_tests.length === 0 ? 'No validation failures.' : report.validation_details.failed_tests.map(test =>
  `- **${test.agent_name || test.agent_file}**: ${test.error} (${test.severity})`
).join('\n')}

### ⚠️  Warnings (${report.validation_details.warnings.length})

${report.validation_details.warnings.length === 0 ? 'No validation warnings.' : report.validation_details.warnings.map(warning =>
  `- **${warning.agent_file}**: ${warning.warning} (${warning.severity})`
).join('\n')}

## Recommendations

${report.recommendations.length === 0 ? 'No specific recommendations. All agents meet validation standards.' : report.recommendations.map(rec => `
### ${rec.priority.toUpperCase()} Priority${rec.team ? ` - ${rec.team}` : ''}: ${rec.issue}

- **Category**: ${rec.category}
- **Affected Agents**: ${rec.affected_agents}
- **Suggestion**: ${rec.suggestion}
`).join('')}

## Validation Standards

This validator checks the following YAML format requirements:

### Required Fields
- **name**: Agent display name
- **role**: Agent role/specialization
- **team**: Team assignment (must match directory)
- **capabilities**: Core and specialized capabilities
- **configuration**: Model and parameter configuration
- **prompts**: System prompt and user prompt templates

### Structure Validation
- **Capabilities**: Must include 'core' and 'specialized' arrays
- **Configuration**: Must include 'model', 'temperature', 'max_tokens'
- **Prompts**: Must include 'system_prompt' and 'user_prompt_template'

### Team Alignment
- Agent team field must match directory structure
- Role should align with expected team roles
- Capabilities should include team-appropriate specializations

## Next Steps

${report.validation_summary.overall_status === 'excellent' ?
`✅ **All agents meet validation standards!** The YAML format validation is excellent and agents are ready for distribution.

Recommended actions:
1. Proceed with distribution package generation
2. Continue monitoring for format consistency
3. Consider implementing automated validation in CI/CD` :

report.validation_summary.overall_status === 'good' ?
`✅ **Most agents meet validation standards.** Minor issues should be addressed.

Recommended actions:
1. Address validation warnings to improve quality
2. Fix any failed validations before distribution
3. Review team-specific issues` :

`❌ **Validation issues need attention.** Agents require fixes before distribution.

Required actions:
1. Fix all failed validations (${report.validation_summary.invalid_agents} agents)
2. Address critical format issues
3. Re-run validation after fixes
4. Ensure all agents pass before proceeding`}

---

**Validation Pipeline**: BMAD Agent YAML Format Validator v${report.validator_version}
**Story**: 4.3 - Quality Assurance for Distribution Packages
**Epic**: 4 - Packaging & Distribution Automation
`;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--verbose':
        options.verbose = true;
        break;
      case '--strict':
        options.strictMode = true;
        break;
      case '--team':
        options.teamFilter = args[++i];
        break;
      case '--schema':
        options.schemaFile = args[++i];
        break;
      case '--help':
        console.log(`
BMAD Agent YAML Format Validator v1.0.0

Usage: node bmad-agent-yaml-validator.js [options]

Options:
  --verbose     Enable verbose output
  --strict      Enable strict validation mode
  --team        Validate specific team only
  --schema      Custom schema file path
  --help        Show this help message

Examples:
  node bmad-agent-yaml-validator.js
  node bmad-agent-yaml-validator.js --verbose --strict
  node bmad-agent-yaml-validator.js --team cybersec-team
  node bmad-agent-yaml-validator.js --schema custom-schema.yaml
`);
        process.exit(0);
        break;
    }
  }

  try {
    const validator = new BMAdAgentYAMLValidator(options);
    const report = await validator.validateAllAgents(options.teamFilter);

    const successRate = report.validation_summary.success_rate;
    process.exit(successRate >= 80 ? 0 : 1); // Exit with error if success rate < 80%
  } catch (error) {
    console.error('❌ Agent YAML validation failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = BMAdAgentYAMLValidator;

// Run CLI if executed directly
if (require.main === module) {
  main();
}