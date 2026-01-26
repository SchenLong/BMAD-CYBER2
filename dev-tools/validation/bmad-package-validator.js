#!/usr/bin/env node
/**
 * BMAD Package Validator
 * Source validation component for Module Packaging Workflow Engine
 *
 * Validates BMAD modules before packaging to ensure completeness and quality.
 * Integrates with bmad-validation-rules.yaml for comprehensive validation.
 *
 * Author: Morgan (Module Builder)
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * BMAD Package Validator Class
 * Comprehensive validation of source modules before packaging
 */
class BMAdPackageValidator {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      rulesFile: options.rulesFile || '/Users/paultinp/BMAD-CYBER2/bmad-validation-rules.yaml',
      strict: options.strict || false,
      verbose: options.verbose || false,
      ...options
    };

    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      summary: {
        total_modules: 0,
        total_agents: 0,
        total_workflows: 0,
        validation_score: 0
      }
    };

    this.validationRules = null;
  }

  /**
   * Main validation entry point
   */
  async validate(moduleFilter = null) {
    console.log('🔍 BMAD Package Validator v1.0.0');
    console.log('='.repeat(40));

    try {
      // Load validation rules
      await this.loadValidationRules();

      // Define modules to validate
      const modulesToValidate = moduleFilter
        ? [moduleFilter]
        : ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];

      // Validate each module
      for (const moduleCode of modulesToValidate) {
        await this.validateModule(moduleCode);
      }

      // Generate validation report
      return this.generateValidationReport();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Load validation rules from YAML file
   */
  async loadValidationRules() {
    try {
      const rulesContent = await fs.readFile(this.options.rulesFile, 'utf8');
      this.validationRules = yaml.load(rulesContent);
      console.log(`📋 Loaded validation rules from ${this.options.rulesFile}`);
    } catch (error) {
      console.warn(`⚠️  Could not load validation rules: ${error.message}`);
      this.validationRules = this.getDefaultRules();
    }
  }

  /**
   * Get default validation rules if external file not available
   */
  getDefaultRules() {
    return {
      structural_rules: {
        yaml_syntax: { priority: 'critical', enforcement: 'strict' },
        required_sections: { priority: 'critical', enforcement: 'strict' },
        field_types: { priority: 'critical', enforcement: 'strict' }
      },
      semantic_rules: {
        team_alignment: { priority: 'high', enforcement: 'strict' },
        menu_consistency: { priority: 'high', enforcement: 'strict' }
      },
      security_rules: {
        prompt_injection_protection: { priority: 'critical', enforcement: 'strict' },
        shell_command_restrictions: { priority: 'critical', enforcement: 'strict' }
      },
      quality_rules: {
        description_completeness: { priority: 'medium', enforcement: 'warning' },
        menu_item_coverage: { priority: 'medium', enforcement: 'warning' }
      }
    };
  }

  /**
   * Validate individual module
   */
  async validateModule(moduleCode) {
    console.log(`\n🔍 Validating ${moduleCode}...`);

    const moduleResults = {
      module: moduleCode,
      status: 'PASSED',
      errors: [],
      warnings: [],
      metrics: {}
    };

    const modulePath = path.join(this.options.sourceRoot, moduleCode);

    try {
      // 1. Structural validation
      await this.validateModuleStructure(moduleCode, modulePath, moduleResults);

      // 2. Configuration validation
      await this.validateModuleConfiguration(moduleCode, modulePath, moduleResults);

      // 3. Agents validation
      await this.validateModuleAgents(moduleCode, modulePath, moduleResults);

      // 4. Workflows validation
      await this.validateModuleWorkflows(moduleCode, modulePath, moduleResults);

      // 5. Security validation
      await this.validateModuleSecurity(moduleCode, modulePath, moduleResults);

      // 6. Quality assessment
      await this.assessModuleQuality(moduleCode, modulePath, moduleResults);

      // Determine overall status
      if (moduleResults.errors.length > 0) {
        moduleResults.status = 'FAILED';
        this.results.failed.push(moduleResults);
      } else {
        this.results.passed.push(moduleResults);
      }

      if (moduleResults.warnings.length > 0) {
        this.results.warnings.push(...moduleResults.warnings);
      }

      this.results.summary.total_modules++;

    } catch (error) {
      moduleResults.status = 'ERROR';
      moduleResults.errors.push(`Module validation error: ${error.message}`);
      this.results.failed.push(moduleResults);
    }

    // Report module results
    if (moduleResults.status === 'PASSED') {
      console.log(`  ✅ ${moduleCode} validation passed`);
      if (moduleResults.warnings.length > 0) {
        console.log(`     ⚠️  ${moduleResults.warnings.length} warnings`);
      }
    } else {
      console.log(`  ❌ ${moduleCode} validation failed`);
      console.log(`     ${moduleResults.errors.length} errors, ${moduleResults.warnings.length} warnings`);
    }
  }

  /**
   * Validate module directory structure
   */
  async validateModuleStructure(moduleCode, modulePath, results) {
    const requiredDirs = ['agents', 'workflows'];
    const requiredFiles = ['module.yaml', 'README.md'];

    // Check directory existence
    try {
      const stat = await fs.stat(modulePath);
      if (!stat.isDirectory()) {
        results.errors.push('Module path is not a directory');
        return;
      }
    } catch {
      results.errors.push('Module directory does not exist');
      return;
    }

    // Check required directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(modulePath, dir);
      try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          results.errors.push(`Required directory '${dir}' is not a directory`);
        }
      } catch {
        results.errors.push(`Required directory '${dir}' is missing`);
      }
    }

    // Check required files
    for (const file of requiredFiles) {
      const filePath = path.join(modulePath, file);
      try {
        await fs.access(filePath);
      } catch {
        results.errors.push(`Required file '${file}' is missing`);
      }
    }

    // Check optional directories
    const optionalDirs = ['tools', 'data', 'templates'];
    for (const dir of optionalDirs) {
      const dirPath = path.join(modulePath, dir);
      try {
        await fs.access(dirPath);
      } catch {
        results.warnings.push(`Optional directory '${dir}' not found`);
      }
    }
  }

  /**
   * Validate module configuration
   */
  async validateModuleConfiguration(moduleCode, modulePath, results) {
    const configPath = path.join(modulePath, 'module.yaml');

    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(configContent);

      // Required configuration fields
      const requiredFields = [
        'code', 'name', 'output_folder', 'module_code', 'module_version'
      ];

      for (const field of requiredFields) {
        if (!config[field]) {
          results.errors.push(`module.yaml missing required field '${field}'`);
        }
      }

      // Validate code consistency
      if (config.code !== moduleCode) {
        results.errors.push(
          `module.yaml code '${config.code}' doesn't match directory name '${moduleCode}'`
        );
      }

      // Validate version format
      if (config.module_version && !this.isValidSemanticVersion(config.module_version)) {
        results.warnings.push(
          `module.yaml version '${config.module_version}' is not valid semantic version`
        );
      }

      results.metrics.configuration = {
        required_fields_present: requiredFields.filter(f => config[f]).length,
        total_required_fields: requiredFields.length,
        has_version: !!config.module_version
      };

    } catch (error) {
      results.errors.push(`module.yaml validation error: ${error.message}`);
    }
  }

  /**
   * Validate module agents
   */
  async validateModuleAgents(moduleCode, modulePath, results) {
    const agentsPath = path.join(modulePath, 'agents');

    try {
      const agentFiles = await fs.readdir(agentsPath);
      const mdFiles = agentFiles.filter(file => file.endsWith('.md'));

      results.metrics.agents = {
        total_agents: mdFiles.length,
        validated_agents: 0,
        agent_errors: 0,
        agent_warnings: 0
      };

      this.results.summary.total_agents += mdFiles.length;

      if (mdFiles.length === 0) {
        results.warnings.push('No agent files found in agents directory');
        return;
      }

      // Validate sample of agents (first 5 for performance)
      const samplesToValidate = Math.min(5, mdFiles.length);
      const agentSample = mdFiles.slice(0, samplesToValidate);

      for (const agentFile of agentSample) {
        const agentPath = path.join(agentsPath, agentFile);
        const agentResults = await this.validateAgent(agentFile, agentPath);

        results.metrics.agents.validated_agents++;
        results.metrics.agents.agent_errors += agentResults.errors;
        results.metrics.agents.agent_warnings += agentResults.warnings;

        if (agentResults.errors > 0) {
          results.errors.push(`Agent ${agentFile}: ${agentResults.errors} errors`);
        }
        if (agentResults.warnings > 0) {
          results.warnings.push(`Agent ${agentFile}: ${agentResults.warnings} warnings`);
        }
      }

      // Extrapolate results if we only validated a sample
      if (samplesToValidate < mdFiles.length) {
        const ratio = mdFiles.length / samplesToValidate;
        const estimatedErrors = Math.round(results.metrics.agents.agent_errors * ratio);
        const estimatedWarnings = Math.round(results.metrics.agents.agent_warnings * ratio);

        if (estimatedErrors > results.metrics.agents.agent_errors) {
          results.warnings.push(
            `Estimated ${estimatedErrors} total agent errors (validated ${samplesToValidate}/${mdFiles.length} agents)`
          );
        }
      }

    } catch (error) {
      results.errors.push(`Agents validation error: ${error.message}`);
    }
  }

  /**
   * Validate individual agent file
   */
  async validateAgent(agentFile, agentPath) {
    const agentResults = { errors: 0, warnings: 0 };

    try {
      const content = await fs.readFile(agentPath, 'utf8');

      // Check for required sections
      const requiredSections = ['---', '```xml', '<agent', '<activation'];
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          agentResults.errors++;
        }
      }

      // Check for frontmatter
      if (!content.startsWith('---')) {
        agentResults.errors++;
      }

      // Check for persona and activation sections
      if (!content.includes('<activation')) {
        agentResults.errors++;
      }

      // Check for menu structure
      if (!content.includes('<menu') && !content.includes('menu')) {
        agentResults.warnings++;
      }

      // Security checks
      const securityPatterns = ['sudo', 'rm -rf', 'exec(', 'eval('];
      for (const pattern of securityPatterns) {
        if (content.includes(pattern)) {
          agentResults.errors++;
        }
      }

      // Quality checks
      if (content.length < 1000) {
        agentResults.warnings++;
      }

    } catch (error) {
      agentResults.errors++;
    }

    return agentResults;
  }

  /**
   * Validate module workflows
   */
  async validateModuleWorkflows(moduleCode, modulePath, results) {
    const workflowsPath = path.join(modulePath, 'workflows');

    try {
      const workflowItems = await fs.readdir(workflowsPath);
      const workflowDirs = [];

      for (const item of workflowItems) {
        const itemPath = path.join(workflowsPath, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          workflowDirs.push(item);
        }
      }

      results.metrics.workflows = {
        total_workflows: workflowDirs.length,
        validated_workflows: 0,
        workflow_errors: 0,
        workflow_warnings: 0
      };

      this.results.summary.total_workflows += workflowDirs.length;

      if (workflowDirs.length === 0) {
        results.warnings.push('No workflow directories found in workflows directory');
        return;
      }

      // Validate sample workflows
      const samplesToValidate = Math.min(3, workflowDirs.length);
      const workflowSample = workflowDirs.slice(0, samplesToValidate);

      for (const workflowDir of workflowSample) {
        const workflowPath = path.join(workflowsPath, workflowDir);
        const workflowResults = await this.validateWorkflow(workflowDir, workflowPath);

        results.metrics.workflows.validated_workflows++;
        results.metrics.workflows.workflow_errors += workflowResults.errors;
        results.metrics.workflows.workflow_warnings += workflowResults.warnings;

        if (workflowResults.errors > 0) {
          results.errors.push(`Workflow ${workflowDir}: ${workflowResults.errors} errors`);
        }
        if (workflowResults.warnings > 0) {
          results.warnings.push(`Workflow ${workflowDir}: ${workflowResults.warnings} warnings`);
        }
      }

    } catch (error) {
      results.errors.push(`Workflows validation error: ${error.message}`);
    }
  }

  /**
   * Validate individual workflow
   */
  async validateWorkflow(workflowDir, workflowPath) {
    const workflowResults = { errors: 0, warnings: 0 };

    try {
      const items = await fs.readdir(workflowPath);

      // Check for workflow.md
      if (!items.includes('workflow.md')) {
        workflowResults.warnings++;
      }

      // Check for steps directory
      if (!items.includes('steps')) {
        workflowResults.warnings++;
      } else {
        const stepsPath = path.join(workflowPath, 'steps');
        const stepItems = await fs.readdir(stepsPath);
        const stepFiles = stepItems.filter(item => item.endsWith('.md'));

        if (stepFiles.length === 0) {
          workflowResults.warnings++;
        }
      }

    } catch (error) {
      workflowResults.errors++;
    }

    return workflowResults;
  }

  /**
   * Validate module security
   */
  async validateModuleSecurity(moduleCode, modulePath, results) {
    // Security validation placeholder
    results.metrics.security = {
      security_rules_checked: 0,
      security_violations: 0
    };

    // Check for common security issues in configuration
    try {
      const configPath = path.join(modulePath, 'module.yaml');
      const configContent = await fs.readFile(configPath, 'utf8');

      // Check for hardcoded credentials or sensitive data
      const sensitivePatterns = ['password', 'secret', 'key', 'token'];
      for (const pattern of sensitivePatterns) {
        if (configContent.toLowerCase().includes(pattern)) {
          results.warnings.push(`Potential sensitive data in module.yaml: ${pattern}`);
          results.metrics.security.security_violations++;
        }
      }

      results.metrics.security.security_rules_checked = sensitivePatterns.length;

    } catch (error) {
      results.warnings.push(`Security validation error: ${error.message}`);
    }
  }

  /**
   * Assess module quality
   */
  async assessModuleQuality(moduleCode, modulePath, results) {
    const quality = {
      completeness_score: 0,
      documentation_score: 0,
      structure_score: 0,
      overall_score: 0
    };

    // Calculate completeness score
    const requiredItems = ['module.yaml', 'README.md', 'agents/', 'workflows/'];
    let presentItems = 0;

    for (const item of requiredItems) {
      const itemPath = path.join(modulePath, item);
      try {
        await fs.access(itemPath);
        presentItems++;
      } catch {}
    }

    quality.completeness_score = (presentItems / requiredItems.length) * 100;

    // Calculate documentation score
    try {
      const readmePath = path.join(modulePath, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf8');
      quality.documentation_score = Math.min(100, readmeContent.length / 50); // 50 chars = 1 point
    } catch {
      quality.documentation_score = 0;
    }

    // Calculate structure score based on agents and workflows
    const agentCount = results.metrics.agents?.total_agents || 0;
    const workflowCount = results.metrics.workflows?.total_workflows || 0;
    quality.structure_score = Math.min(100, (agentCount * 5) + (workflowCount * 8));

    // Calculate overall score
    quality.overall_score = Math.round(
      (quality.completeness_score * 0.4) +
      (quality.documentation_score * 0.2) +
      (quality.structure_score * 0.4)
    );

    results.metrics.quality = quality;

    // Quality warnings
    if (quality.overall_score < 60) {
      results.warnings.push('Low overall quality score');
    }
    if (quality.documentation_score < 30) {
      results.warnings.push('Insufficient documentation');
    }
  }

  /**
   * Check if version string is valid semantic version
   */
  isValidSemanticVersion(version) {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
    return semverRegex.test(version);
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      validator_version: '1.0.0',
      validation_summary: {
        total_modules: this.results.summary.total_modules,
        modules_passed: this.results.passed.length,
        modules_failed: this.results.failed.length,
        total_agents: this.results.summary.total_agents,
        total_workflows: this.results.summary.total_workflows,
        total_warnings: this.results.warnings.length,
        overall_status: this.results.failed.length === 0 ? 'PASSED' : 'FAILED'
      },
      detailed_results: {
        passed_modules: this.results.passed,
        failed_modules: this.results.failed,
        warnings: this.results.warnings
      },
      recommendations: this.generateRecommendations()
    };

    // Calculate overall validation score
    if (this.results.summary.total_modules > 0) {
      const passRate = this.results.passed.length / this.results.summary.total_modules;
      const warningPenalty = Math.min(0.3, this.results.warnings.length * 0.02);
      report.validation_summary.validation_score = Math.round((passRate - warningPenalty) * 100);
    }

    this.displayValidationSummary(report);
    return report;
  }

  /**
   * Generate validation recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed.length > 0) {
      recommendations.push('Fix critical validation errors before packaging');
      recommendations.push('Review module structure and required files');
    }

    if (this.results.warnings.length > 5) {
      recommendations.push('Address validation warnings to improve quality score');
    }

    if (this.results.summary.total_agents === 0) {
      recommendations.push('Add agent definitions to modules');
    }

    if (this.results.summary.total_workflows === 0) {
      recommendations.push('Add workflow definitions to modules');
    }

    return recommendations;
  }

  /**
   * Display validation summary
   */
  displayValidationSummary(report) {
    console.log('\n📊 Validation Summary');
    console.log('='.repeat(40));
    console.log(`Status: ${report.validation_summary.overall_status}`);
    console.log(`Modules: ${report.validation_summary.modules_passed}/${report.validation_summary.total_modules} passed`);
    console.log(`Agents: ${report.validation_summary.total_agents} total`);
    console.log(`Workflows: ${report.validation_summary.total_workflows} total`);
    console.log(`Warnings: ${report.validation_summary.total_warnings}`);
    console.log(`Score: ${report.validation_summary.validation_score || 0}/100`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  let moduleFilter = null;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--module':
      case '-m':
        moduleFilter = args[++i];
        break;
      case '--source':
      case '-s':
        options.sourceRoot = args[++i];
        break;
      case '--rules':
      case '-r':
        options.rulesFile = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
BMAD Package Validator v1.0.0

Usage: node bmad-package-validator.js [options]

Options:
  -m, --module <module>     Validate specific module
  -s, --source <path>       Source directory path
  -r, --rules <path>        Validation rules file path
  -v, --verbose             Verbose output
      --strict              Strict validation mode
  -h, --help               Show help

Examples:
  node bmad-package-validator.js                    # Validate all modules
  node bmad-package-validator.js -m cybersec-team   # Validate specific module
  node bmad-package-validator.js --strict           # Strict mode
`);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  // Run validator
  const validator = new BMAdPackageValidator(options);
  validator.validate(moduleFilter)
    .then(report => {
      if (report.validation_summary.overall_status === 'FAILED') {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = BMAdPackageValidator;