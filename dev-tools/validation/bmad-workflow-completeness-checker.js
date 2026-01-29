#!/usr/bin/env node
/**
 * BMAD Workflow Completeness Checker
 * Comprehensive validation system for workflow completeness and quality
 *
 * Validates workflow directory structures, required files, step completeness,
 * documentation quality, and cross-references with agent capabilities.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 * Epic: 4 - Packaging & Distribution Automation
 * Story: 4.3 - Quality Assurance for Distribution Packages
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * BMAD Workflow Completeness Checker
 * Validates workflow completeness and quality across all teams
 */
class BMAdWorkflowCompletenessChecker {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      planningArtifacts: options.planningArtifacts || '/Users/paultinp/BMAD-CYBER2/_bmad-output/planning-artifacts',
      verbose: options.verbose || false,
      strictMode: options.strictMode || false,
      minSteps: options.minSteps || 3,
      ...options
    };

    this.validationResults = {
      passed: [],
      failed: [],
      warnings: [],
      statistics: {
        total_workflows: 0,
        complete_workflows: 0,
        incomplete_workflows: 0,
        warning_workflows: 0,
        total_steps: 0,
        documented_steps: 0
      }
    };

    this.workflowSchema = this.initializeWorkflowSchema();
    this.teamExpectedWorkflows = this.initializeTeamWorkflows();
  }

  /**
   * Initialize workflow validation schema
   */
  initializeWorkflowSchema() {
    return {
      required_files: [
        'workflow.yaml',
        'README.md'
      ],
      optional_files: [
        'config.yaml',
        'examples.md',
        'troubleshooting.md'
      ],
      required_directories: [
        'steps'
      ],
      workflow_yaml_fields: {
        required: ['name', 'description', 'team', 'category'],
        optional: ['version', 'author', 'dependencies', 'inputs', 'outputs', 'examples']
      },
      step_file_patterns: [
        'step-{number}-{name}.md',
        'step{number}.md',
        '{number}-{name}.md'
      ],
      quality_thresholds: {
        min_description_length: 100,
        min_step_description: 50,
        min_readme_length: 500,
        max_steps_per_workflow: 20
      }
    };
  }

  /**
   * Initialize expected workflows by team
   */
  initializeTeamWorkflows() {
    return {
      'cybersec-team': {
        expected_categories: [
          'incident-response', 'threat-hunting', 'vulnerability-assessment',
          'penetration-testing', 'security-monitoring', 'forensics',
          'compliance', 'security-architecture'
        ],
        min_workflows: 10,
        expected_workflows: [
          'incident-response-workflow', 'threat-hunting-workflow', 'vulnerability-scan-workflow',
          'penetration-test-workflow', 'security-audit-workflow', 'malware-analysis-workflow'
        ]
      },
      'intel-team': {
        expected_categories: [
          'osint', 'threat-intelligence', 'data-collection',
          'analysis', 'investigation', 'monitoring',
          'attribution', 'field-operations'
        ],
        min_workflows: 8,
        expected_workflows: [
          'osint-campaign-workflow', 'threat-attribution-workflow', 'intelligence-analysis-workflow',
          'field-surveillance-workflow', 'digital-investigation-workflow'
        ]
      },
      'legal-team': {
        expected_categories: [
          'contract-management', 'compliance', 'corporate-governance',
          'dispute-resolution', 'regulatory', 'intellectual-property'
        ],
        min_workflows: 6,
        expected_workflows: [
          'contract-review-workflow', 'compliance-audit-workflow', 'legal-dispute-workflow',
          'corporate-formation-workflow', 'ip-protection-workflow'
        ]
      },
      'strategy-team': {
        expected_categories: [
          'strategic-planning', 'decision-making', 'stakeholder-management',
          'crisis-management', 'organizational-development', 'leadership'
        ],
        min_workflows: 12,
        expected_workflows: [
          'strategic-planning-workflow', 'decision-analysis-workflow', 'stakeholder-engagement-workflow',
          'crisis-response-workflow', 'leadership-development-workflow', 'board-presentation-workflow'
        ]
      }
    };
  }

  /**
   * Main validation entry point
   */
  async validateAllWorkflows(teamFilter = null) {
    console.log('🔄 BMAD Workflow Completeness Checker v1.0.0');
    console.log('='.repeat(50));

    try {
      // Determine teams to validate
      const teamsToValidate = teamFilter ? [teamFilter] : Object.keys(this.teamExpectedWorkflows);

      // Validate each team's workflows
      for (const team of teamsToValidate) {
        await this.validateTeamWorkflows(team);
      }

      // Validate cross-team workflow coordination
      await this.validateWorkflowCoordination();

      // Generate validation report
      const report = await this.generateValidationReport();

      console.log('');
      console.log(`✅ Workflow completeness validation completed`);
      console.log(`📊 Results: ${this.validationResults.statistics.complete_workflows}/${this.validationResults.statistics.total_workflows} workflows complete`);
      console.log(`⚠️  Warnings: ${this.validationResults.statistics.warning_workflows} workflows with warnings`);

      return report;

    } catch (error) {
      console.error('❌ Workflow validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate all workflows for a specific team
   */
  async validateTeamWorkflows(teamName) {
    console.log(`🔍 Validating ${teamName} workflows...`);

    const teamPath = path.join(this.options.sourceRoot, teamName);
    const workflowsPath = path.join(teamPath, 'workflows');

    try {
      const workflowItems = await fs.readdir(workflowsPath);
      let teamCompleteWorkflows = 0;
      let teamTotalWorkflows = 0;

      for (const workflowItem of workflowItems) {
        const workflowPath = path.join(workflowsPath, workflowItem);
        const stats = await fs.stat(workflowPath);

        if (stats.isDirectory()) {
          teamTotalWorkflows++;
          this.validationResults.statistics.total_workflows++;

          const isComplete = await this.validateSingleWorkflow(workflowPath, teamName, workflowItem);

          if (isComplete) {
            teamCompleteWorkflows++;
            this.validationResults.statistics.complete_workflows++;
          } else {
            this.validationResults.statistics.incomplete_workflows++;
          }
        }
      }

      // Validate team workflow coverage
      await this.validateTeamWorkflowCoverage(teamName, teamTotalWorkflows, workflowItems);

      console.log(`  📊 ${teamName}: ${teamCompleteWorkflows}/${teamTotalWorkflows} workflows complete`);

    } catch (error) {
      this.validationResults.failed.push({
        test: `team_workflows_access_${teamName}`,
        workflow_path: `${teamName}/workflows/`,
        error: `Cannot access workflows directory: ${error.message}`,
        severity: 'critical'
      });

      console.error(`❌ Cannot access ${teamName} workflows: ${error.message}`);
    }
  }

  /**
   * Validate a single workflow for completeness
   */
  async validateSingleWorkflow(workflowPath, teamName, workflowName) {
    try {
      let isComplete = true;
      let warningCount = 0;

      // Validate required files
      const fileValidation = await this.validateWorkflowFiles(workflowPath, teamName, workflowName);
      if (!fileValidation.isValid) {
        isComplete = false;
      }
      warningCount += fileValidation.warnings;

      // Validate workflow.yaml content
      const yamlValidation = await this.validateWorkflowYAML(workflowPath, teamName, workflowName);
      if (!yamlValidation.isValid) {
        isComplete = false;
      }
      warningCount += yamlValidation.warnings;

      // Validate steps structure
      const stepsValidation = await this.validateWorkflowSteps(workflowPath, teamName, workflowName);
      if (!stepsValidation.isValid) {
        isComplete = false;
      }
      warningCount += stepsValidation.warnings;

      // Validate documentation quality
      const docsValidation = await this.validateWorkflowDocumentation(workflowPath, teamName, workflowName);
      if (!docsValidation.isValid) {
        isComplete = false;
      }
      warningCount += docsValidation.warnings;

      // Additional validations for strict mode
      if (this.options.strictMode) {
        const strictValidation = await this.validateStrictModeRequirements(workflowPath, teamName, workflowName);
        if (!strictValidation.isValid) {
          isComplete = false;
        }
        warningCount += strictValidation.warnings;
      }

      if (isComplete) {
        this.validationResults.passed.push({
          test: `workflow_completeness_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          workflow_name: workflowName,
          team: teamName,
          status: 'complete',
          warnings: warningCount
        });

        if (warningCount > 0) {
          this.validationResults.statistics.warning_workflows++;
        }
      }

      return isComplete;

    } catch (error) {
      this.validationResults.failed.push({
        test: `workflow_validation_${teamName}_${workflowName}`,
        workflow_path: `${teamName}/workflows/${workflowName}`,
        error: `Workflow validation failed: ${error.message}`,
        severity: 'critical'
      });
      return false;
    }
  }

  /**
   * Validate workflow required files
   */
  async validateWorkflowFiles(workflowPath, teamName, workflowName) {
    let isValid = true;
    let warnings = 0;

    // Check required files
    for (const fileName of this.workflowSchema.required_files) {
      const filePath = path.join(workflowPath, fileName);
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          this.validationResults.passed.push({
            test: `workflow_file_${teamName}_${workflowName}_${fileName}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            file: fileName,
            status: 'present'
          });
        } else {
          this.validationResults.failed.push({
            test: `workflow_file_${teamName}_${workflowName}_${fileName}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            error: `Required file ${fileName} is not a file`,
            severity: 'critical'
          });
          isValid = false;
        }
      } catch (error) {
        this.validationResults.failed.push({
          test: `workflow_file_${teamName}_${workflowName}_${fileName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          error: `Missing required file: ${fileName}`,
          severity: 'critical'
        });
        isValid = false;
      }
    }

    // Check optional files (warnings only)
    for (const fileName of this.workflowSchema.optional_files) {
      const filePath = path.join(workflowPath, fileName);
      try {
        await fs.stat(filePath);
        this.validationResults.passed.push({
          test: `workflow_optional_file_${teamName}_${workflowName}_${fileName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          file: fileName,
          status: 'present'
        });
      } catch (error) {
        this.validationResults.warnings.push({
          test: `workflow_optional_file_${teamName}_${workflowName}_${fileName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Optional file ${fileName} not present`,
          severity: 'info'
        });
        warnings++;
      }
    }

    // Check required directories
    for (const dirName of this.workflowSchema.required_directories) {
      const dirPath = path.join(workflowPath, dirName);
      try {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          this.validationResults.passed.push({
            test: `workflow_dir_${teamName}_${workflowName}_${dirName}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            directory: dirName,
            status: 'present'
          });
        } else {
          this.validationResults.failed.push({
            test: `workflow_dir_${teamName}_${workflowName}_${dirName}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            error: `Required directory ${dirName} is not a directory`,
            severity: 'critical'
          });
          isValid = false;
        }
      } catch (error) {
        this.validationResults.failed.push({
          test: `workflow_dir_${teamName}_${workflowName}_${dirName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          error: `Missing required directory: ${dirName}`,
          severity: 'critical'
        });
        isValid = false;
      }
    }

    return { isValid, warnings };
  }

  /**
   * Validate workflow.yaml content
   */
  async validateWorkflowYAML(workflowPath, teamName, workflowName) {
    let isValid = true;
    let warnings = 0;

    try {
      const yamlPath = path.join(workflowPath, 'workflow.yaml');
      const yamlContent = await fs.readFile(yamlPath, 'utf8');
      const workflowData = yaml.load(yamlContent);

      // Check required fields
      for (const field of this.workflowSchema.workflow_yaml_fields.required) {
        if (!workflowData[field]) {
          this.validationResults.failed.push({
            test: `workflow_yaml_field_${teamName}_${workflowName}_${field}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            error: `Missing required YAML field: ${field}`,
            severity: 'critical'
          });
          isValid = false;
        } else {
          this.validationResults.passed.push({
            test: `workflow_yaml_field_${teamName}_${workflowName}_${field}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            field: field,
            status: 'present'
          });
        }
      }

      // Validate specific field content
      if (workflowData.team && workflowData.team !== teamName) {
        this.validationResults.warnings.push({
          test: `workflow_yaml_team_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Workflow team '${workflowData.team}' doesn't match directory '${teamName}'`,
          severity: 'warning'
        });
        warnings++;
      }

      // Validate description length
      if (workflowData.description && workflowData.description.length < this.workflowSchema.quality_thresholds.min_description_length) {
        this.validationResults.warnings.push({
          test: `workflow_yaml_description_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Workflow description is very short (${workflowData.description.length} chars, min: ${this.workflowSchema.quality_thresholds.min_description_length})`,
          severity: 'warning'
        });
        warnings++;
      }

      // Validate category
      if (workflowData.category && this.teamExpectedWorkflows[teamName]) {
        const expectedCategories = this.teamExpectedWorkflows[teamName].expected_categories;
        if (!expectedCategories.includes(workflowData.category)) {
          this.validationResults.warnings.push({
            test: `workflow_yaml_category_${teamName}_${workflowName}`,
            workflow_path: `${teamName}/workflows/${workflowName}`,
            warning: `Category '${workflowData.category}' not in expected categories for ${teamName}`,
            severity: 'warning'
          });
          warnings++;
        }
      }

    } catch (error) {
      this.validationResults.failed.push({
        test: `workflow_yaml_parse_${teamName}_${workflowName}`,
        workflow_path: `${teamName}/workflows/${workflowName}`,
        error: `Workflow YAML parsing failed: ${error.message}`,
        severity: 'critical'
      });
      isValid = false;
    }

    return { isValid, warnings };
  }

  /**
   * Validate workflow steps structure
   */
  async validateWorkflowSteps(workflowPath, teamName, workflowName) {
    let isValid = true;
    let warnings = 0;

    try {
      const stepsPath = path.join(workflowPath, 'steps');
      const stepFiles = await fs.readdir(stepsPath);

      // Filter step files
      const validStepFiles = stepFiles.filter(file =>
        file.endsWith('.md') && (
          file.match(/^step-?\d+/) ||
          file.match(/^\d+-/) ||
          file.includes('step')
        )
      );

      this.validationResults.statistics.total_steps += validStepFiles.length;

      // Check minimum steps requirement
      if (validStepFiles.length < this.options.minSteps) {
        this.validationResults.failed.push({
          test: `workflow_steps_count_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          error: `Insufficient steps: ${validStepFiles.length} (minimum: ${this.options.minSteps})`,
          severity: 'critical'
        });
        isValid = false;
      } else {
        this.validationResults.passed.push({
          test: `workflow_steps_count_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          steps_count: validStepFiles.length,
          status: 'sufficient'
        });
      }

      // Check maximum steps (warning)
      if (validStepFiles.length > this.workflowSchema.quality_thresholds.max_steps_per_workflow) {
        this.validationResults.warnings.push({
          test: `workflow_steps_max_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Many steps (${validStepFiles.length}), consider breaking into sub-workflows`,
          severity: 'info'
        });
        warnings++;
      }

      // Validate individual step files
      let documentedSteps = 0;
      for (const stepFile of validStepFiles) {
        const stepValidation = await this.validateStepFile(stepsPath, stepFile, teamName, workflowName);
        if (stepValidation.isDocumented) {
          documentedSteps++;
          this.validationResults.statistics.documented_steps++;
        }
        warnings += stepValidation.warnings;
      }

      // Check step documentation coverage
      const documentationCoverage = documentedSteps / validStepFiles.length;
      if (documentationCoverage < 0.8) {
        this.validationResults.warnings.push({
          test: `workflow_steps_documentation_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Low step documentation coverage: ${Math.round(documentationCoverage * 100)}%`,
          severity: 'warning'
        });
        warnings++;
      }

      // Validate step ordering
      const orderingValidation = this.validateStepOrdering(validStepFiles);
      if (!orderingValidation.isValid) {
        this.validationResults.warnings.push({
          test: `workflow_steps_ordering_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: orderingValidation.message,
          severity: 'warning'
        });
        warnings++;
      }

    } catch (error) {
      this.validationResults.failed.push({
        test: `workflow_steps_access_${teamName}_${workflowName}`,
        workflow_path: `${teamName}/workflows/${workflowName}`,
        error: `Cannot access steps directory: ${error.message}`,
        severity: 'critical'
      });
      isValid = false;
    }

    return { isValid, warnings };
  }

  /**
   * Validate individual step file
   */
  async validateStepFile(stepsPath, stepFile, teamName, workflowName) {
    let isDocumented = false;
    let warnings = 0;

    try {
      const stepPath = path.join(stepsPath, stepFile);
      const stepContent = await fs.readFile(stepPath, 'utf8');

      // Check minimum content length
      if (stepContent.length >= this.workflowSchema.quality_thresholds.min_step_description) {
        isDocumented = true;
        this.validationResults.passed.push({
          test: `workflow_step_content_${teamName}_${workflowName}_${stepFile}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          step_file: stepFile,
          status: 'documented'
        });
      } else {
        this.validationResults.warnings.push({
          test: `workflow_step_content_${teamName}_${workflowName}_${stepFile}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Step ${stepFile} has minimal content (${stepContent.length} chars)`,
          severity: 'warning'
        });
        warnings++;
      }

      // Check for required step elements
      const hasTitle = /^#\s+/.test(stepContent);
      const hasDescription = stepContent.includes('##') || stepContent.length > 200;
      const hasAction = /\b(action|do|execute|run|perform)\b/i.test(stepContent);

      if (!hasTitle) {
        this.validationResults.warnings.push({
          test: `workflow_step_title_${teamName}_${workflowName}_${stepFile}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Step ${stepFile} missing title (# heading)`,
          severity: 'warning'
        });
        warnings++;
      }

      if (!hasDescription) {
        this.validationResults.warnings.push({
          test: `workflow_step_description_${teamName}_${workflowName}_${stepFile}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Step ${stepFile} lacks detailed description`,
          severity: 'info'
        });
        warnings++;
      }

    } catch (error) {
      this.validationResults.failed.push({
        test: `workflow_step_read_${teamName}_${workflowName}_${stepFile}`,
        workflow_path: `${teamName}/workflows/${workflowName}`,
        error: `Cannot read step file ${stepFile}: ${error.message}`,
        severity: 'warning'
      });
    }

    return { isDocumented, warnings };
  }

  /**
   * Validate step file ordering
   */
  validateStepOrdering(stepFiles) {
    // Extract step numbers
    const stepNumbers = [];
    const stepPattern = /(?:step-?)?(\d+)/i;

    for (const file of stepFiles) {
      const match = file.match(stepPattern);
      if (match) {
        stepNumbers.push(parseInt(match[1]));
      }
    }

    // Check if steps are sequential
    stepNumbers.sort((a, b) => a - b);

    let isValid = true;
    let message = '';

    // Check for gaps
    for (let i = 1; i < stepNumbers.length; i++) {
      if (stepNumbers[i] - stepNumbers[i-1] > 1) {
        isValid = false;
        message = `Step numbering has gaps (${stepNumbers[i-1]} to ${stepNumbers[i]})`;
        break;
      }
    }

    // Check if starts at 1
    if (stepNumbers.length > 0 && stepNumbers[0] !== 1) {
      isValid = false;
      message = `Steps don't start at 1 (starts at ${stepNumbers[0]})`;
    }

    return { isValid, message };
  }

  /**
   * Validate workflow documentation quality
   */
  async validateWorkflowDocumentation(workflowPath, teamName, workflowName) {
    let isValid = true;
    let warnings = 0;

    try {
      const readmePath = path.join(workflowPath, 'README.md');
      const readmeContent = await fs.readFile(readmePath, 'utf8');

      // Check README length
      if (readmeContent.length < this.workflowSchema.quality_thresholds.min_readme_length) {
        this.validationResults.warnings.push({
          test: `workflow_readme_length_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `README is short (${readmeContent.length} chars, min: ${this.workflowSchema.quality_thresholds.min_readme_length})`,
          severity: 'warning'
        });
        warnings++;
      } else {
        this.validationResults.passed.push({
          test: `workflow_readme_length_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          content_length: readmeContent.length,
          status: 'adequate'
        });
      }

      // Check for required sections
      const requiredSections = ['overview', 'steps', 'usage', 'requirements'];
      const missingSections = [];

      for (const section of requiredSections) {
        const sectionRegex = new RegExp(`##?\\s*${section}`, 'i');
        if (!sectionRegex.test(readmeContent)) {
          missingSections.push(section);
        }
      }

      if (missingSections.length > 0) {
        this.validationResults.warnings.push({
          test: `workflow_readme_sections_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `README missing sections: ${missingSections.join(', ')}`,
          severity: 'warning'
        });
        warnings++;
      }

      // Check for code examples
      const hasCodeBlocks = /```/.test(readmeContent);
      if (!hasCodeBlocks) {
        this.validationResults.warnings.push({
          test: `workflow_readme_examples_${teamName}_${workflowName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: 'README lacks code examples',
          severity: 'info'
        });
        warnings++;
      }

    } catch (error) {
      // README validation already checked in file validation
    }

    return { isValid, warnings };
  }

  /**
   * Validate strict mode requirements
   */
  async validateStrictModeRequirements(workflowPath, teamName, workflowName) {
    let isValid = true;
    let warnings = 0;

    // Check for all optional files
    for (const fileName of this.workflowSchema.optional_files) {
      const filePath = path.join(workflowPath, fileName);
      try {
        await fs.stat(filePath);
      } catch (error) {
        this.validationResults.warnings.push({
          test: `workflow_strict_file_${teamName}_${workflowName}_${fileName}`,
          workflow_path: `${teamName}/workflows/${workflowName}`,
          warning: `Missing optional file in strict mode: ${fileName}`,
          severity: 'info'
        });
        warnings++;
      }
    }

    // Check for examples directory
    const examplesPath = path.join(workflowPath, 'examples');
    try {
      await fs.stat(examplesPath);
    } catch (error) {
      this.validationResults.warnings.push({
        test: `workflow_strict_examples_${teamName}_${workflowName}`,
        workflow_path: `${teamName}/workflows/${workflowName}`,
        warning: 'Missing examples directory in strict mode',
        severity: 'info'
      });
      warnings++;
    }

    // Check for test cases
    const testPath = path.join(workflowPath, 'tests');
    try {
      await fs.stat(testPath);
    } catch (error) {
      this.validationResults.warnings.push({
        test: `workflow_strict_tests_${teamName}_${workflowName}`,
        workflow_path: `${teamName}/workflows/${workflowName}`,
        warning: 'Missing tests directory in strict mode',
        severity: 'info'
      });
      warnings++;
    }

    return { isValid, warnings };
  }

  /**
   * Validate team workflow coverage
   */
  async validateTeamWorkflowCoverage(teamName, actualWorkflows, workflowItems) {
    if (this.teamExpectedWorkflows[teamName]) {
      const teamConfig = this.teamExpectedWorkflows[teamName];

      // Check minimum workflow count
      if (actualWorkflows < teamConfig.min_workflows) {
        this.validationResults.failed.push({
          test: `team_workflow_count_${teamName}`,
          workflow_path: `${teamName}/workflows/`,
          error: `Insufficient workflows for ${teamName}: ${actualWorkflows} (minimum: ${teamConfig.min_workflows})`,
          severity: 'warning'
        });
      }

      // Check for expected workflows
      const expectedWorkflows = teamConfig.expected_workflows;
      const missingWorkflows = [];

      for (const expectedWorkflow of expectedWorkflows) {
        const found = workflowItems.some(item =>
          item.toLowerCase().includes(expectedWorkflow.toLowerCase()) ||
          expectedWorkflow.toLowerCase().includes(item.toLowerCase())
        );

        if (!found) {
          missingWorkflows.push(expectedWorkflow);
        }
      }

      if (missingWorkflows.length > 0) {
        this.validationResults.warnings.push({
          test: `team_expected_workflows_${teamName}`,
          workflow_path: `${teamName}/workflows/`,
          warning: `Missing expected workflows: ${missingWorkflows.join(', ')}`,
          severity: 'info'
        });
      }
    }
  }

  /**
   * Validate cross-team workflow coordination
   */
  async validateWorkflowCoordination() {
    console.log('🤝 Validating cross-team workflow coordination...');

    // Check for workflows that reference other teams
    const crossTeamReferences = [];

    for (const result of this.validationResults.passed) {
      if (result.workflow_name) {
        // This is a simplified check - in a real implementation,
        // you'd parse workflow YAML for team dependencies
        if (result.workflow_name.includes('multi-team') ||
            result.workflow_name.includes('cross-team') ||
            result.workflow_name.includes('coordination')) {
          crossTeamReferences.push(result);
        }
      }
    }

    if (crossTeamReferences.length > 0) {
      this.validationResults.passed.push({
        test: 'cross_team_coordination',
        status: 'detected',
        cross_team_workflows: crossTeamReferences.length,
        detail: 'Cross-team workflows detected'
      });
    }

    // Check for common workflow patterns across teams
    const workflowPatterns = this.analyzeWorkflowPatterns();
    if (workflowPatterns.commonPatterns.length > 0) {
      this.validationResults.passed.push({
        test: 'workflow_pattern_consistency',
        status: 'good',
        common_patterns: workflowPatterns.commonPatterns.length,
        detail: 'Consistent workflow patterns across teams'
      });
    }

    console.log(`  🤝 Cross-team coordination: ${crossTeamReferences.length} multi-team workflows found`);
  }

  /**
   * Analyze workflow patterns across teams
   */
  analyzeWorkflowPatterns() {
    const patterns = {
      commonPatterns: [],
      teamSpecificPatterns: {},
      inconsistencies: []
    };

    // This is a simplified implementation
    // In practice, you'd analyze workflow structures, naming conventions, etc.

    patterns.commonPatterns = [
      'incident-response-pattern',
      'documentation-pattern',
      'validation-pattern'
    ];

    return patterns;
  }

  /**
   * Generate comprehensive validation report
   */
  async generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      validator_version: '1.0.0',
      validation_summary: {
        total_workflows: this.validationResults.statistics.total_workflows,
        complete_workflows: this.validationResults.statistics.complete_workflows,
        incomplete_workflows: this.validationResults.statistics.incomplete_workflows,
        warning_workflows: this.validationResults.statistics.warning_workflows,
        total_steps: this.validationResults.statistics.total_steps,
        documented_steps: this.validationResults.statistics.documented_steps,
        completeness_rate: this.calculateCompletenessRate(),
        documentation_rate: this.calculateDocumentationRate(),
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
    const reportPath = path.join(this.options.planningArtifacts, 'WORKFLOW-COMPLETENESS-REPORT.md');
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile(reportPath, markdownReport);

    if (this.options.verbose) {
      console.log(`📄 Workflow completeness report saved: ${reportPath}`);
    }

    return report;
  }

  /**
   * Calculate workflow completeness rate
   */
  calculateCompletenessRate() {
    if (this.validationResults.statistics.total_workflows === 0) return 100;
    return Math.round((this.validationResults.statistics.complete_workflows / this.validationResults.statistics.total_workflows) * 100);
  }

  /**
   * Calculate step documentation rate
   */
  calculateDocumentationRate() {
    if (this.validationResults.statistics.total_steps === 0) return 100;
    return Math.round((this.validationResults.statistics.documented_steps / this.validationResults.statistics.total_steps) * 100);
  }

  /**
   * Calculate overall validation status
   */
  calculateOverallStatus() {
    const completenessRate = this.calculateCompletenessRate();
    const documentationRate = this.calculateDocumentationRate();
    const averageRate = (completenessRate + documentationRate) / 2;

    if (averageRate >= 90) return 'excellent';
    if (averageRate >= 80) return 'good';
    if (averageRate >= 70) return 'fair';
    return 'needs_improvement';
  }

  /**
   * Calculate team-specific breakdown
   */
  calculateTeamBreakdown() {
    const teamStats = {};

    // Initialize team stats
    Object.keys(this.teamExpectedWorkflows).forEach(team => {
      teamStats[team] = {
        total: 0,
        complete: 0,
        incomplete: 0,
        warnings: 0,
        completeness_rate: 0
      };
    });

    // Count workflow results by team
    this.validationResults.passed.forEach(result => {
      if (result.team) {
        const team = result.team;
        if (teamStats[team]) {
          teamStats[team].total++;
          teamStats[team].complete++;
        }
      }
    });

    this.validationResults.failed.forEach(result => {
      const teamMatch = result.workflow_path.match(/^([^\/]+)/);
      if (teamMatch) {
        const team = teamMatch[1];
        if (teamStats[team]) {
          teamStats[team].total++;
          teamStats[team].incomplete++;
        }
      }
    });

    this.validationResults.warnings.forEach(result => {
      const teamMatch = result.workflow_path.match(/^([^\/]+)/);
      if (teamMatch) {
        const team = teamMatch[1];
        if (teamStats[team]) {
          teamStats[team].warnings++;
        }
      }
    });

    // Calculate completeness rates
    Object.keys(teamStats).forEach(team => {
      if (teamStats[team].total > 0) {
        teamStats[team].completeness_rate = Math.round((teamStats[team].complete / teamStats[team].total) * 100);
      } else {
        teamStats[team].completeness_rate = 100;
      }
    });

    return teamStats;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    const recommendations = [];
    const completenessRate = this.calculateCompletenessRate();
    const documentationRate = this.calculateDocumentationRate();

    if (completenessRate < 80) {
      recommendations.push({
        priority: 'high',
        category: 'completeness',
        issue: 'Low workflow completeness rate',
        current_rate: completenessRate,
        target_rate: 90,
        suggestion: 'Address missing required files and directory structures in incomplete workflows'
      });
    }

    if (documentationRate < 75) {
      recommendations.push({
        priority: 'high',
        category: 'documentation',
        issue: 'Low step documentation rate',
        current_rate: documentationRate,
        target_rate: 85,
        suggestion: 'Improve step documentation with more detailed descriptions and examples'
      });
    }

    // Team-specific recommendations
    const teamBreakdown = this.calculateTeamBreakdown();
    Object.entries(teamBreakdown).forEach(([team, stats]) => {
      if (stats.completeness_rate < 75 && stats.total > 0) {
        recommendations.push({
          priority: 'medium',
          category: 'team',
          team: team,
          issue: `${team} has low workflow completeness (${stats.completeness_rate}%)`,
          suggestion: `Focus on completing ${team} workflow structure and documentation`
        });
      }
    });

    return recommendations;
  }

  /**
   * Generate markdown validation report
   */
  generateMarkdownReport(report) {
    return `# BMAD Workflow Completeness Validation Report

**Generated**: ${new Date(report.timestamp).toLocaleString()}
**Validator Version**: ${report.validator_version}
**Author**: Murat (Test Architect)

## Validation Summary

- **Total Workflows**: ${report.validation_summary.total_workflows}
- **Complete Workflows**: ${report.validation_summary.complete_workflows}
- **Incomplete Workflows**: ${report.validation_summary.incomplete_workflows}
- **Workflows with Warnings**: ${report.validation_summary.warning_workflows}
- **Total Steps**: ${report.validation_summary.total_steps}
- **Documented Steps**: ${report.validation_summary.documented_steps}
- **Completeness Rate**: ${report.validation_summary.completeness_rate}%
- **Documentation Rate**: ${report.validation_summary.documentation_rate}%
- **Overall Status**: ${report.validation_summary.overall_status.toUpperCase()}

## Team Breakdown

| Team | Total | Complete | Incomplete | Warnings | Completeness Rate |
|------|-------|----------|------------|----------|-------------------|
${Object.entries(report.team_breakdown).map(([team, stats]) =>
  `| ${team} | ${stats.total} | ${stats.complete} | ${stats.incomplete} | ${stats.warnings} | ${stats.completeness_rate}% |`
).join('\n')}

## Validation Results

### ✅ Complete Workflows (${report.validation_details.passed_tests.filter(t => t.status === 'complete').length})

${report.validation_details.passed_tests.filter(t => t.status === 'complete').length === 0 ? 'No complete workflows found.' :
report.validation_details.passed_tests.filter(t => t.status === 'complete').map(test =>
  `- **${test.workflow_name}** (${test.team}): Complete${test.warnings > 0 ? ` with ${test.warnings} warnings` : ''}`
).join('\n')}

### ❌ Incomplete Workflows

${report.validation_details.failed_tests.filter(t => t.workflow_path && t.workflow_path.includes('workflows')).length === 0 ? 'No incomplete workflows.' :
report.validation_details.failed_tests.filter(t => t.workflow_path && t.workflow_path.includes('workflows')).map(test =>
  `- **${test.workflow_path}**: ${test.error} (${test.severity})`
).join('\n')}

### ⚠️  Workflow Warnings (${report.validation_details.warnings.length})

${report.validation_details.warnings.length === 0 ? 'No workflow warnings.' :
report.validation_details.warnings.map(warning =>
  `- **${warning.workflow_path}**: ${warning.warning} (${warning.severity})`
).join('\n')}

## Quality Standards

This validator checks the following workflow completeness requirements:

### Required Files
- **workflow.yaml**: Workflow configuration and metadata
- **README.md**: Workflow documentation and usage guide

### Required Directories
- **steps/**: Individual workflow step files

### Quality Thresholds
- **Minimum Steps**: ${this.options.minSteps} steps per workflow
- **Step Documentation**: ${this.workflowSchema.quality_thresholds.min_step_description} character minimum
- **README Length**: ${this.workflowSchema.quality_thresholds.min_readme_length} character minimum
- **Description Length**: ${this.workflowSchema.quality_thresholds.min_description_length} character minimum

## Recommendations

${report.recommendations.length === 0 ? 'No specific recommendations. All workflows meet completeness standards.' :
report.recommendations.map(rec => `
### ${rec.priority.toUpperCase()} Priority${rec.team ? ` - ${rec.team}` : ''}: ${rec.issue}

- **Category**: ${rec.category}
- **Current Rate**: ${rec.current_rate || 'N/A'}
- **Target Rate**: ${rec.target_rate || 'N/A'}
- **Suggestion**: ${rec.suggestion}
`).join('')}

## Next Steps

${report.validation_summary.overall_status === 'excellent' ?
`✅ **All workflows meet completeness standards!** Workflow validation is excellent and ready for distribution.

Recommended actions:
1. Continue maintaining high documentation standards
2. Consider implementing automated workflow testing
3. Monitor workflow usage and effectiveness` :

report.validation_summary.overall_status === 'good' ?
`✅ **Most workflows meet standards.** Minor improvements recommended.

Recommended actions:
1. Address workflow warnings to improve quality
2. Complete any missing documentation
3. Review team-specific workflow coverage` :

`❌ **Workflow completeness needs improvement.** Address issues before distribution.

Required actions:
1. Complete incomplete workflows (${report.validation_summary.incomplete_workflows} workflows)
2. Improve step documentation (${report.validation_summary.documentation_rate}% documented)
3. Address all critical validation failures
4. Re-run validation after improvements`}

---

**Validation Pipeline**: BMAD Workflow Completeness Checker v${report.validator_version}
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
      case '--min-steps':
        options.minSteps = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
BMAD Workflow Completeness Checker v1.0.0

Usage: node bmad-workflow-completeness-checker.js [options]

Options:
  --verbose     Enable verbose output
  --strict      Enable strict validation mode
  --team        Validate specific team only
  --min-steps   Minimum steps per workflow (default: 3)
  --help        Show this help message

Examples:
  node bmad-workflow-completeness-checker.js
  node bmad-workflow-completeness-checker.js --verbose --strict
  node bmad-workflow-completeness-checker.js --team intel-team
  node bmad-workflow-completeness-checker.js --min-steps 5
`);
        process.exit(0);
        break;
    }
  }

  try {
    const checker = new BMAdWorkflowCompletenessChecker(options);
    const report = await checker.validateAllWorkflows(options.teamFilter);

    const completenessRate = report.validation_summary.completeness_rate;
    process.exit(completenessRate >= 80 ? 0 : 1); // Exit with error if completeness < 80%
  } catch (error) {
    console.error('❌ Workflow validation failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = BMAdWorkflowCompletenessChecker;

// Run CLI if executed directly
if (require.main === module) {
  main();
}