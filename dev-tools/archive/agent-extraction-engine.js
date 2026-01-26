#!/usr/bin/env node

/**
 * BMAD Agent Extraction Engine
 * Story 2.1: MD-to-.agent.yaml Extraction Engine
 *
 * Converts source .md files from specialized team modules to bmad-builder .agent.yaml format
 *
 * Author: Abdul (Master Project Manager) & Amelia (Developer)
 * Epic: 2 - Agent Extraction & Conversion Pipeline
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class AgentExtractionEngine {
  constructor() {
    this.sourceRoot = path.join(process.cwd(), '_bmad');
    this.targetRoot = path.join(process.cwd(), '_bmad-output', 'extraction-output', 'specialized-teams');
    this.teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    this.extractedCount = 0;
    this.errors = [];
  }

  /**
   * Main extraction method
   */
  async extractAllTeams() {
    console.log('🚀 BMAD Agent Extraction Engine - Epic 2 Story 2.1');
    console.log('================================================');

    // Create target directory structure
    this.ensureDirectoryStructure();

    // Extract each team
    for (const team of this.teams) {
      console.log(`\n🔧 Processing ${team}...`);
      await this.extractTeam(team);
    }

    this.reportResults();
  }

  /**
   * Extract all agents from a specific team
   */
  async extractTeam(teamName) {
    const sourcePath = path.join(this.sourceRoot, teamName, 'agents');
    const targetPath = path.join(this.targetRoot, 'src', teamName, 'agents');

    if (!fs.existsSync(sourcePath)) {
      this.errors.push(`Source path not found: ${sourcePath}`);
      return;
    }

    // Create target directory
    fs.mkdirSync(targetPath, { recursive: true });

    // Get all .md files
    const agentFiles = fs.readdirSync(sourcePath).filter(file => file.endsWith('.md'));

    console.log(`  Found ${agentFiles.length} agents in ${teamName}`);

    for (const agentFile of agentFiles) {
      try {
        await this.extractSingleAgent(teamName, agentFile, sourcePath, targetPath);
      } catch (error) {
        this.errors.push(`Error processing ${teamName}/${agentFile}: ${error.message}`);
        console.error(`  ❌ Failed to extract ${agentFile}: ${error.message}`);
      }
    }
  }

  /**
   * Extract a single agent from MD to YAML
   */
  async extractSingleAgent(teamName, agentFile, sourcePath, targetPath) {
    const sourceFilePath = path.join(sourcePath, agentFile);
    const content = fs.readFileSync(sourceFilePath, 'utf8');

    // Parse the MD file
    const agentData = this.parseMDFile(content, agentFile, teamName);

    // Convert to bmad-builder YAML format
    const yamlContent = this.convertToYAML(agentData);

    // Write to target location
    const targetFileName = agentFile.replace('.md', '.agent.yaml');
    const targetFilePath = path.join(targetPath, targetFileName);

    fs.writeFileSync(targetFilePath, yamlContent);

    console.log(`  ✅ Extracted: ${agentFile} → ${targetFileName}`);
    this.extractedCount++;
  }

  /**
   * Parse MD file and extract agent configuration
   */
  parseMDFile(content, fileName, teamName) {
    try {
      // Extract YAML front matter
      const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      let frontMatter = {};

      if (frontMatterMatch) {
        frontMatter = yaml.load(frontMatterMatch[1]);
      }

      // Extract XML configuration
      const xmlMatch = content.match(/```xml\s*\n([\s\S]*?)\n```/);
      if (!xmlMatch) {
        throw new Error('No XML configuration found');
      }

      const xmlContent = xmlMatch[1];
      const agentConfig = this.parseXMLAgent(xmlContent);

      return {
        frontMatter,
        agentConfig,
        teamName,
        sourceFileName: fileName
      };
    } catch (error) {
      throw new Error(`Failed to parse MD file: ${error.message}`);
    }
  }

  /**
   * Parse XML agent configuration
   */
  parseXMLAgent(xmlContent) {
    const agent = {};

    // Extract agent attributes from opening tag
    const agentTagMatch = xmlContent.match(/<agent\s+([^>]+)>/);
    if (agentTagMatch) {
      const attributes = this.parseAttributes(agentTagMatch[1]);
      agent.metadata = {
        id: attributes.id,
        name: attributes.name,
        title: attributes.title,
        icon: attributes.icon
      };
    }

    // Extract activation steps
    agent.activation = this.extractActivation(xmlContent);

    // Extract persona
    agent.persona = this.extractPersona(xmlContent);

    // Extract menu items
    agent.menu = this.extractMenu(xmlContent);

    // Extract rules
    agent.rules = this.extractRules(xmlContent);

    // Extract menu handlers
    agent.menuHandlers = this.extractMenuHandlers(xmlContent);

    return agent;
  }

  /**
   * Extract activation configuration
   */
  extractActivation(xmlContent) {
    const activation = { critical: false, steps: [] };

    // Check for critical attribute
    const activationMatch = xmlContent.match(/<activation([^>]*)>/);
    if (activationMatch) {
      const attrs = this.parseAttributes(activationMatch[1]);
      activation.critical = attrs.critical === 'MANDATORY';
    }

    // Extract step elements
    const stepMatches = xmlContent.match(/<step n="(\d+)"[^>]*>([\s\S]*?)<\/step>/g);
    if (stepMatches) {
      activation.steps = stepMatches.map(stepMatch => {
        const stepContent = stepMatch.match(/<step n="(\d+)"[^>]*>([\s\S]*?)<\/step>/);
        return {
          number: parseInt(stepContent[1]),
          content: stepContent[2].trim()
        };
      });
    }

    return activation;
  }

  /**
   * Extract persona configuration
   */
  extractPersona(xmlContent) {
    const persona = {};

    const personaMatch = xmlContent.match(/<persona>([\s\S]*?)<\/persona>/);
    if (personaMatch) {
      const personaContent = personaMatch[1];

      // Extract role
      const roleMatch = personaContent.match(/<role>([\s\S]*?)<\/role>/);
      if (roleMatch) persona.role = roleMatch[1].trim();

      // Extract identity
      const identityMatch = personaContent.match(/<identity>([\s\S]*?)<\/identity>/);
      if (identityMatch) persona.identity = identityMatch[1].trim();

      // Extract communication_style
      const commStyleMatch = personaContent.match(/<communication_style>([\s\S]*?)<\/communication_style>/);
      if (commStyleMatch) persona.communication_style = commStyleMatch[1].trim();

      // Extract principles
      const principlesMatch = personaContent.match(/<principles>([\s\S]*?)<\/principles>/);
      if (principlesMatch) persona.principles = principlesMatch[1].trim();
    }

    return persona;
  }

  /**
   * Extract menu items
   */
  extractMenu(xmlContent) {
    const menuItems = [];

    const menuMatch = xmlContent.match(/<menu>([\s\S]*?)<\/menu>/);
    if (menuMatch) {
      const menuContent = menuMatch[1];

      // Extract item elements
      const itemMatches = menuContent.match(/<item[^>]*>([^<]*)<\/item>/g);
      if (itemMatches) {
        menuItems.push(...itemMatches.map(itemMatch => {
          const itemContent = itemMatch.match(/<item([^>]*)>([^<]*)<\/item>/);
          const attributes = this.parseAttributes(itemContent[1]);
          return {
            trigger: attributes.cmd,
            description: itemContent[2].trim(),
            action: attributes.action,
            exec: attributes.exec,
            workflow: attributes.workflow,
            data: attributes.data
          };
        }));
      }
    }

    return menuItems;
  }

  /**
   * Extract rules
   */
  extractRules(xmlContent) {
    const rules = [];

    const rulesMatch = xmlContent.match(/<rules>([\s\S]*?)<\/rules>/);
    if (rulesMatch) {
      const rulesContent = rulesMatch[1];

      // Extract individual rule elements
      const ruleMatches = rulesContent.match(/<r[^>]*>([\s\S]*?)<\/r>/g);
      if (ruleMatches) {
        rules.push(...ruleMatches.map(ruleMatch => {
          const ruleContent = ruleMatch.match(/<r([^>]*)>([\s\S]*?)<\/r>/);
          const attributes = this.parseAttributes(ruleContent[1]);
          return {
            content: ruleContent[2].trim(),
            critical: attributes.critical || false
          };
        }));
      }
    }

    return rules;
  }

  /**
   * Extract menu handlers
   */
  extractMenuHandlers(xmlContent) {
    const handlers = [];

    const handlersMatch = xmlContent.match(/<menu-handlers>([\s\S]*?)<\/menu-handlers>/);
    if (handlersMatch) {
      const handlersContent = handlersMatch[1];

      const handlerMatches = handlersContent.match(/<handler[^>]*>([\s\S]*?)<\/handler>/g);
      if (handlerMatches) {
        handlers.push(...handlerMatches.map(handlerMatch => {
          const handlerContent = handlerMatch.match(/<handler([^>]*)>([\s\S]*?)<\/handler>/);
          const attributes = this.parseAttributes(handlerContent[1]);
          return {
            type: attributes.type,
            content: handlerContent[2].trim()
          };
        }));
      }
    }

    return handlers;
  }

  /**
   * Parse XML attributes from a string
   */
  parseAttributes(attributeString) {
    const attributes = {};
    if (!attributeString) return attributes;

    const attributeRegex = /(\w+)="([^"]*)"/g;
    let match;
    while ((match = attributeRegex.exec(attributeString)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  /**
   * Convert parsed agent data to bmad-builder YAML format
   */
  convertToYAML(agentData) {
    const yamlOutput = {
      // Metadata from XML and front matter
      agent: {
        metadata: {
          name: agentData.agentConfig.metadata.name,
          id: agentData.agentConfig.metadata.id,
          title: agentData.agentConfig.metadata.title,
          icon: agentData.agentConfig.metadata.icon,
          team: agentData.teamName,
          description: agentData.frontMatter.description,
          source_file: agentData.sourceFileName
        }
      },

      // Persona configuration
      persona: agentData.agentConfig.persona,

      // Activation configuration
      activation: agentData.agentConfig.activation,

      // Menu items
      menu: agentData.agentConfig.menu,

      // Rules
      rules: agentData.agentConfig.rules,

      // Menu handlers
      menu_handlers: agentData.agentConfig.menuHandlers,

      // Metadata for extraction tracking
      extraction: {
        converted_at: new Date().toISOString(),
        engine_version: '2.1.0',
        source_format: 'md_xml',
        target_format: 'bmad_builder_yaml'
      }
    };

    return yaml.dump(yamlOutput, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
  }

  /**
   * Ensure target directory structure exists
   */
  ensureDirectoryStructure() {
    const baseDir = this.targetRoot;
    fs.mkdirSync(baseDir, { recursive: true });

    for (const team of this.teams) {
      const teamDir = path.join(baseDir, 'src', team);
      fs.mkdirSync(path.join(teamDir, 'agents'), { recursive: true });
      fs.mkdirSync(path.join(teamDir, 'workflows'), { recursive: true });
    }

    console.log(`✅ Created directory structure at ${baseDir}`);
  }

  /**
   * Report extraction results
   */
  reportResults() {
    console.log('\n📊 EXTRACTION RESULTS');
    console.log('=====================');
    console.log(`✅ Successfully extracted: ${this.extractedCount} agents`);

    if (this.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log(`\n📂 Output location: ${this.targetRoot}`);
    console.log('\n🎯 Epic 2 Story 2.1 - Extraction Engine COMPLETE');
  }
}

// CLI execution
if (require.main === module) {
  const engine = new AgentExtractionEngine();

  // Check if js-yaml is available
  try {
    require('js-yaml');
  } catch (e) {
    console.error('❌ Missing dependency: js-yaml');
    console.error('Please install with: npm install js-yaml');
    process.exit(1);
  }

  engine.extractAllTeams().catch(error => {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  });
}

module.exports = AgentExtractionEngine;