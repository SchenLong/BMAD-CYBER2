/**
 * YAML to Markdown Converter Engine
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Converts distributed YAML agent and workflow packages back to BMB-compliant MD format
 * during installation in target BMAD installations.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const yaml = require('js-yaml');
const path = require('path');

/**
 * YAML to MD Conversion Engine
 * Handles bidirectional conversion between YAML distribution format and MD runtime format
 */
class YamlToMdConverter {
  constructor(options = {}) {
    this.options = {
      preserveComments: options.preserveComments !== false,
      validateOutput: options.validateOutput !== false,
      addMetadata: options.addMetadata !== false,
      ...options
    };

    // Template engines for different conversion types
    this.templates = {
      agent: this.getAgentTemplate(),
      workflow: this.getWorkflowTemplate()
    };
  }

  /**
   * Convert YAML agent to MD format
   * @param {Object|string} yamlAgent - YAML agent data or string
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Converted MD agent structure
   */
  async yamlToMd(yamlAgent, options = {}) {
    try {
      // Parse YAML if string
      const agentData = typeof yamlAgent === 'string'
        ? yaml.load(yamlAgent)
        : yamlAgent;

      // Validate YAML structure
      this.validateYamlAgent(agentData);

      // Extract components
      const metadata = this.extractMetadata(agentData.agent);
      const frontmatter = this.buildFrontmatter(metadata);
      const content = this.buildAgentContent(agentData.agent);
      const xmlBlock = this.buildAgentXml(agentData.agent);

      // Assemble MD structure
      const mdAgent = {
        fileName: this.generateMdFileName(metadata),
        frontmatter: frontmatter,
        content: content,
        xmlBlock: xmlBlock,
        fullContent: this.assembleMdContent(frontmatter, content, xmlBlock),
        metadata: metadata,
        conversionInfo: {
          convertedAt: new Date().toISOString(),
          sourceFormat: 'yaml',
          targetFormat: 'md',
          converterVersion: '1.0.0'
        }
      };

      // Validate output if required
      if (this.options.validateOutput) {
        this.validateMdOutput(mdAgent);
      }

      return mdAgent;

    } catch (error) {
      throw new Error(`YAML to MD conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert YAML workflow to MD format
   * @param {Object|string} yamlWorkflow - YAML workflow data or string
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Converted MD workflow structure
   */
  async yamlWorkflowToMd(yamlWorkflow, options = {}) {
    try {
      // Parse YAML if string
      const workflowData = typeof yamlWorkflow === 'string'
        ? yaml.load(yamlWorkflow)
        : yamlWorkflow;

      // Validate YAML structure
      this.validateYamlWorkflow(workflowData);

      // Extract workflow components
      const metadata = this.extractWorkflowMetadata(workflowData);
      const frontmatter = this.buildWorkflowFrontmatter(metadata, workflowData);
      const content = this.buildWorkflowContent(workflowData);

      // Assemble MD workflow structure
      const mdWorkflow = {
        fileName: this.generateWorkflowFileName(metadata),
        frontmatter: frontmatter,
        content: content,
        fullContent: this.assembleWorkflowMdContent(frontmatter, content),
        metadata: metadata,
        conversionInfo: {
          convertedAt: new Date().toISOString(),
          sourceFormat: 'yaml',
          targetFormat: 'md',
          converterVersion: '1.0.0'
        }
      };

      // Validate output if required
      if (this.options.validateOutput) {
        this.validateWorkflowMdOutput(mdWorkflow);
      }

      return mdWorkflow;

    } catch (error) {
      throw new Error(`YAML workflow to MD conversion failed: ${error.message}`);
    }
  }

  /**
   * Extract metadata from YAML agent
   */
  extractMetadata(agentData) {
    const metadata = agentData.metadata || {};

    return {
      name: metadata.name,
      title: metadata.title,
      description: metadata.description,
      icon: metadata.icon,
      team: metadata.team,
      version: metadata.version,
      author: metadata.author,
      created_date: metadata.created_date,
      last_updated: metadata.last_updated || new Date().toISOString().split('T')[0],
      tags: metadata.tags || [],
      difficulty: metadata.difficulty,
      requires_external_tools: metadata.requires_external_tools || false,
      source_file: metadata.source_file
    };
  }

  /**
   * Build YAML frontmatter for MD agent
   */
  buildFrontmatter(metadata) {
    const frontmatter = {
      name: metadata.name,
      title: metadata.title,
      description: metadata.description,
      icon: metadata.icon,
      team: metadata.team
    };

    // Add optional fields if present
    if (metadata.version) frontmatter.version = metadata.version;
    if (metadata.author) frontmatter.author = metadata.author;
    if (metadata.created_date) frontmatter.created_date = metadata.created_date;
    if (metadata.last_updated) frontmatter.last_updated = metadata.last_updated;
    if (metadata.tags && metadata.tags.length > 0) frontmatter.tags = metadata.tags;
    if (metadata.difficulty) frontmatter.difficulty = metadata.difficulty;

    return frontmatter;
  }

  /**
   * Build agent content section
   */
  buildAgentContent(agentData) {
    let content = [];

    // Add persona information
    if (agentData.persona) {
      content.push('## Agent Profile\n');
      content.push(`**Role:** ${agentData.persona.role}\n`);
      content.push(`**Identity:** ${agentData.persona.identity}\n`);
      content.push(`**Communication Style:** ${agentData.persona.communication_style}\n`);
      content.push(`**Principles:** ${agentData.persona.principles}\n`);

      if (agentData.persona.specialties && agentData.persona.specialties.length > 0) {
        content.push(`**Specialties:**\n`);
        agentData.persona.specialties.forEach(specialty => {
          content.push(`- ${specialty}\n`);
        });
      }
      content.push('\n');
    }

    // Add capabilities information
    if (agentData.capabilities) {
      content.push('## Capabilities\n');

      if (agentData.capabilities.workflows && agentData.capabilities.workflows.length > 0) {
        content.push('**Available Workflows:**\n');
        agentData.capabilities.workflows.forEach(workflow => {
          content.push(`- ${workflow}\n`);
        });
      }

      if (agentData.capabilities.integrations && agentData.capabilities.integrations.length > 0) {
        content.push('\n**Integrations:**\n');
        agentData.capabilities.integrations.forEach(integration => {
          content.push(`- ${integration}\n`);
        });
      }

      if (agentData.capabilities.tools && agentData.capabilities.tools.length > 0) {
        content.push('\n**Required Tools:**\n');
        agentData.capabilities.tools.forEach(tool => {
          content.push(`- ${tool}\n`);
        });
      }
      content.push('\n');
    }

    // Add menu section
    if (agentData.menu && agentData.menu.length > 0) {
      content.push('## Menu Options\n');
      agentData.menu.forEach((menuItem, index) => {
        content.push(`### ${index + 1}. ${menuItem.trigger}\n`);
        content.push(`${menuItem.description}\n`);

        if (menuItem.workflow) {
          content.push(`*Workflow:* ${menuItem.workflow}\n`);
        }
        if (menuItem.exec) {
          content.push(`*Execute:* ${menuItem.exec}\n`);
        }
        if (menuItem.danger_level && menuItem.danger_level !== 'safe') {
          content.push(`*Danger Level:* ${menuItem.danger_level}\n`);
        }
        content.push('\n');
      });
    }

    return content.join('');
  }

  /**
   * Build agent XML block for BMAD runtime
   */
  buildAgentXml(agentData) {
    let xml = [];

    xml.push('<agent>\n');

    // Basic agent info
    xml.push(`  <title>${this.escapeXml(agentData.metadata.title)}</title>\n`);
    xml.push(`  <name>${this.escapeXml(agentData.metadata.name)}</name>\n`);
    xml.push(`  <icon>${this.escapeXml(agentData.metadata.icon)}</icon>\n`);

    // Activation steps
    if (agentData.activation && agentData.activation.steps) {
      xml.push('  <activation>\n');
      agentData.activation.steps.forEach((step, index) => {
        xml.push(`    <step number="${step.number || index + 1}">\n`);
        xml.push(`      ${this.escapeXml(step.content)}\n`);
        xml.push('    </step>\n');
      });
      xml.push('  </activation>\n');
    }

    // Rules
    if (agentData.rules && agentData.rules.length > 0) {
      xml.push('  <rules>\n');
      agentData.rules.forEach(rule => {
        const criticalAttr = rule.critical ? ` critical="${rule.critical}"` : '';
        const scopeAttr = rule.scope ? ` scope="${rule.scope}"` : '';
        xml.push(`    <rule${criticalAttr}${scopeAttr}>\n`);
        xml.push(`      ${this.escapeXml(rule.content)}\n`);
        xml.push('    </rule>\n');
      });
      xml.push('  </rules>\n');
    }

    // Menu handlers
    if (agentData.menu_handlers && agentData.menu_handlers.length > 0) {
      xml.push('  <menu-handlers>\n');
      agentData.menu_handlers.forEach(handler => {
        const typeAttr = handler.type ? ` type="${handler.type}"` : '';
        xml.push(`    <handler${typeAttr}>\n`);
        xml.push(`      ${this.escapeXml(handler.content)}\n`);
        xml.push('    </handler>\n');
      });
      xml.push('  </menu-handlers>\n');
    }

    xml.push('</agent>');

    return xml.join('');
  }

  /**
   * Assemble full MD content
   */
  assembleMdContent(frontmatter, content, xmlBlock) {
    let fullContent = [];

    // Add frontmatter
    fullContent.push('---\n');
    fullContent.push(yaml.dump(frontmatter));
    fullContent.push('---\n\n');

    // Add content
    fullContent.push(content);

    // Add XML block
    fullContent.push('```xml\n');
    fullContent.push(xmlBlock);
    fullContent.push('\n```\n');

    return fullContent.join('');
  }

  /**
   * Extract workflow metadata
   */
  extractWorkflowMetadata(workflowData) {
    return {
      workflow_id: workflowData.workflow_id,
      name: workflowData.name,
      description: workflowData.description,
      module: workflowData.module,
      version: workflowData.version,
      primary_agent: workflowData.primary_agent,
      parallel_agents: workflowData.parallel_agents || [],
      execution_mode: workflowData.execution_mode || 'sequential',
      estimated_duration: workflowData.estimated_duration
    };
  }

  /**
   * Build workflow frontmatter
   */
  buildWorkflowFrontmatter(metadata, workflowData) {
    const frontmatter = {
      workflow_id: metadata.workflow_id,
      name: metadata.name,
      description: metadata.description,
      module: metadata.module,
      version: metadata.version,
      primary_agent: metadata.primary_agent,
      execution_mode: metadata.execution_mode,
      estimated_duration: metadata.estimated_duration
    };

    // Add steps information
    if (workflowData.steps && workflowData.steps.length > 0) {
      frontmatter.steps = workflowData.steps.map(step => ({
        number: step.number,
        name: step.name,
        agent: step.agent,
        action: step.action
      }));
    }

    // Add parallel agents if present
    if (metadata.parallel_agents && metadata.parallel_agents.length > 0) {
      frontmatter.parallel_agents = metadata.parallel_agents;
    }

    return frontmatter;
  }

  /**
   * Build workflow content
   */
  buildWorkflowContent(workflowData) {
    let content = [];

    // Add workflow overview
    content.push('## Workflow Overview\n');
    content.push(`${workflowData.description}\n\n`);

    if (workflowData.estimated_duration) {
      content.push(`**Estimated Duration:** ${workflowData.estimated_duration}\n`);
    }

    if (workflowData.execution_mode) {
      content.push(`**Execution Mode:** ${workflowData.execution_mode}\n`);
    }
    content.push('\n');

    // Add step details
    if (workflowData.steps && workflowData.steps.length > 0) {
      content.push('## Workflow Steps\n');

      workflowData.steps.forEach((step, index) => {
        content.push(`### Step ${step.number || index + 1}: ${step.name}\n`);

        if (step.agent) {
          content.push(`**Agent:** ${step.agent}\n`);
        }

        if (step.description) {
          content.push(`**Description:** ${step.description}\n`);
        }

        if (step.action) {
          content.push(`**Action:** ${step.action}\n`);
        }

        if (step.expected_output) {
          content.push(`**Expected Output:** ${step.expected_output}\n`);
        }

        if (step.validation_criteria) {
          content.push('**Validation Criteria:**\n');
          step.validation_criteria.forEach(criteria => {
            content.push(`- ${criteria}\n`);
          });
        }

        content.push('\n');
      });
    }

    return content.join('');
  }

  /**
   * Assemble workflow MD content
   */
  assembleWorkflowMdContent(frontmatter, content) {
    let fullContent = [];

    // Add frontmatter
    fullContent.push('---\n');
    fullContent.push(yaml.dump(frontmatter));
    fullContent.push('---\n\n');

    // Add content
    fullContent.push(content);

    return fullContent.join('');
  }

  /**
   * Generate MD filename from metadata
   */
  generateMdFileName(metadata) {
    const baseName = metadata.name
      ? metadata.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'unknown-agent';

    return `${baseName}.md`;
  }

  /**
   * Generate workflow filename from metadata
   */
  generateWorkflowFileName(metadata) {
    const baseName = metadata.workflow_id
      ? metadata.workflow_id.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'unknown-workflow';

    return `${baseName}.md`;
  }

  /**
   * Validate YAML agent structure
   */
  validateYamlAgent(agentData) {
    if (!agentData || typeof agentData !== 'object') {
      throw new Error('Invalid agent data: must be an object');
    }

    if (!agentData.agent) {
      throw new Error('Invalid agent data: missing agent root');
    }

    const agent = agentData.agent;

    if (!agent.metadata) {
      throw new Error('Invalid agent: missing metadata');
    }

    const requiredMetadata = ['name', 'title', 'description', 'icon', 'team'];
    for (const field of requiredMetadata) {
      if (!agent.metadata[field]) {
        throw new Error(`Invalid agent metadata: missing required field '${field}'`);
      }
    }

    if (!agent.menu || !Array.isArray(agent.menu) || agent.menu.length === 0) {
      throw new Error('Invalid agent: must have at least one menu item');
    }

    if (!agent.rules || !Array.isArray(agent.rules) || agent.rules.length === 0) {
      throw new Error('Invalid agent: must have at least one rule');
    }
  }

  /**
   * Validate YAML workflow structure
   */
  validateYamlWorkflow(workflowData) {
    if (!workflowData || typeof workflowData !== 'object') {
      throw new Error('Invalid workflow data: must be an object');
    }

    const requiredFields = ['workflow_id', 'name', 'description', 'module'];
    for (const field of requiredFields) {
      if (!workflowData[field]) {
        throw new Error(`Invalid workflow: missing required field '${field}'`);
      }
    }
  }

  /**
   * Validate MD output
   */
  validateMdOutput(mdAgent) {
    if (!mdAgent.fileName) {
      throw new Error('MD validation failed: missing fileName');
    }

    if (!mdAgent.frontmatter) {
      throw new Error('MD validation failed: missing frontmatter');
    }

    if (!mdAgent.content) {
      throw new Error('MD validation failed: missing content');
    }

    if (!mdAgent.fullContent) {
      throw new Error('MD validation failed: missing fullContent');
    }
  }

  /**
   * Validate workflow MD output
   */
  validateWorkflowMdOutput(mdWorkflow) {
    if (!mdWorkflow.fileName) {
      throw new Error('MD workflow validation failed: missing fileName');
    }

    if (!mdWorkflow.frontmatter) {
      throw new Error('MD workflow validation failed: missing frontmatter');
    }

    if (!mdWorkflow.content) {
      throw new Error('MD workflow validation failed: missing content');
    }
  }

  /**
   * Escape XML special characters
   */
  escapeXml(text) {
    if (typeof text !== 'string') return text;

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Get agent template (placeholder for future enhancement)
   */
  getAgentTemplate() {
    return {
      frontmatter: {},
      contentSections: ['profile', 'capabilities', 'menu'],
      xmlSections: ['title', 'name', 'icon', 'activation', 'rules', 'menu-handlers']
    };
  }

  /**
   * Get workflow template (placeholder for future enhancement)
   */
  getWorkflowTemplate() {
    return {
      frontmatter: {},
      contentSections: ['overview', 'steps'],
      requiredFields: ['workflow_id', 'name', 'description']
    };
  }

  /**
   * Convert batch of YAML agents
   * @param {Array} yamlAgents - Array of YAML agents
   * @param {Object} options - Conversion options
   * @returns {Promise<Array>} Array of converted MD agents
   */
  async convertAgentBatch(yamlAgents, options = {}) {
    const convertedAgents = [];
    const errors = [];

    for (let i = 0; i < yamlAgents.length; i++) {
      try {
        const mdAgent = await this.yamlToMd(yamlAgents[i], options);
        convertedAgents.push(mdAgent);
      } catch (error) {
        errors.push({
          index: i,
          agent: yamlAgents[i]?.agent?.metadata?.name || `Agent ${i}`,
          error: error.message
        });
      }
    }

    return {
      successful: convertedAgents,
      errors: errors,
      totalProcessed: yamlAgents.length,
      successCount: convertedAgents.length,
      errorCount: errors.length
    };
  }

  /**
   * Convert batch of YAML workflows
   * @param {Array} yamlWorkflows - Array of YAML workflows
   * @param {Object} options - Conversion options
   * @returns {Promise<Array>} Array of converted MD workflows
   */
  async convertWorkflowBatch(yamlWorkflows, options = {}) {
    const convertedWorkflows = [];
    const errors = [];

    for (let i = 0; i < yamlWorkflows.length; i++) {
      try {
        const mdWorkflow = await this.yamlWorkflowToMd(yamlWorkflows[i], options);
        convertedWorkflows.push(mdWorkflow);
      } catch (error) {
        errors.push({
          index: i,
          workflow: yamlWorkflows[i]?.workflow_id || `Workflow ${i}`,
          error: error.message
        });
      }
    }

    return {
      successful: convertedWorkflows,
      errors: errors,
      totalProcessed: yamlWorkflows.length,
      successCount: convertedWorkflows.length,
      errorCount: errors.length
    };
  }
}

module.exports = YamlToMdConverter;