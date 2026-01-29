#!/usr/bin/env node
/**
 * BMAD Module Packaging Orchestrator
 * Epic 4, Story 4.1 - Main orchestration script for Module Packaging Workflow Engine
 *
 * Coordinates the complete packaging workflow including validation, packaging,
 * version management, and testing for all BMAD specialized team modules.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');

// Import workflow components
const BMAdModulePackager = require('./bmad-module-packager');
const BMAdPackageValidator = require('./bmad-package-validator');
const BMAdVersionManager = require('./bmad-version-manager');
const BMAdPackagingWorkflowTest = require('./test-packaging-workflow');

/**
 * BMAD Module Packaging Orchestrator
 * Main workflow coordinator for the packaging system
 */
class BMAdPackagingOrchestrator {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      outputRoot: options.outputRoot || '/Users/paultinp/BMAD-CYBER2/_bmad-output/dist',
      validateOnly: options.validateOnly || false,
      skipTests: options.skipTests || false,
      bumpVersion: options.bumpVersion || null,
      createTags: options.createTags || false,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      ...options
    };

    this.workflowResults = {
      timestamp: new Date().toISOString(),
      orchestrator_version: '1.0.0',
      workflow_status: 'STARTING',
      steps_completed: [],
      validation_report: null,
      packaging_report: null,
      version_report: null,
      test_report: null,
      success: false
    };
  }

  /**
   * Execute complete packaging workflow
   */
  async executeWorkflow() {
    console.log('🚀 BMAD Module Packaging Orchestrator v1.0.0');
    console.log('='.repeat(55));
    console.log(`Timestamp: ${this.workflowResults.timestamp}`);
    console.log(`Mode: ${this.options.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
    console.log('='.repeat(55));

    try {
      // Step 1: Pre-flight validation
      await this.executeValidation();

      if (this.options.validateOnly) {
        return this.generateWorkflowReport();
      }

      // Step 2: Version management (if requested)
      if (this.options.bumpVersion) {
        await this.executeVersionBump();
      }

      // Step 3: Module packaging
      await this.executePackaging();

      // Step 4: Post-packaging validation
      await this.executePostValidation();

      // Step 5: Git tagging (if requested)
      if (this.options.createTags) {
        await this.executeTagging();
      }

      // Step 6: Workflow testing (unless skipped)
      if (!this.options.skipTests) {
        await this.executeWorkflowTesting();
      }

      // Step 7: Generate artifacts and reports
      await this.generateWorkflowArtifacts();

      this.workflowResults.workflow_status = 'COMPLETED';
      this.workflowResults.success = true;

      const report = this.generateWorkflowReport();
      console.log('\n🎉 BMAD Module Packaging Workflow Completed Successfully!');

      return report;

    } catch (error) {
      this.workflowResults.workflow_status = 'FAILED';
      this.workflowResults.error = error.message;
      this.workflowResults.success = false;

      console.error(`❌ Workflow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Step 1: Execute pre-flight validation
   */
  async executeValidation() {
    console.log('\n📋 Step 1: Pre-flight Source Validation');
    console.log('-'.repeat(50));

    try {
      const validator = new BMAdPackageValidator({
        sourceRoot: this.options.sourceRoot,
        verbose: this.options.verbose
      });

      this.workflowResults.validation_report = await validator.validate();

      if (this.workflowResults.validation_report.validation_summary.overall_status === 'FAILED') {
        throw new Error('Source validation failed. Cannot proceed with packaging.');
      }

      this.workflowResults.steps_completed.push({
        step: 'validation',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          modules_validated: this.workflowResults.validation_report.validation_summary.total_modules,
          validation_score: this.workflowResults.validation_report.validation_summary.validation_score
        }
      });

      console.log('✅ Pre-flight validation completed successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'validation',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Step 2: Execute version bump
   */
  async executeVersionBump() {
    console.log(`\n🏷️  Step 2: Version Management (${this.options.bumpVersion})`);
    console.log('-'.repeat(50));

    try {
      const versionManager = new BMAdVersionManager({
        sourceRoot: this.options.sourceRoot,
        outputRoot: this.options.outputRoot,
        verbose: this.options.verbose,
        dryRun: this.options.dryRun
      });

      await versionManager.initialize();

      // Bump all module versions
      const bumpResults = await versionManager.bumpAllVersions(
        this.options.bumpVersion,
        `Automated ${this.options.bumpVersion} version bump via packaging workflow`
      );

      // Save version artifacts
      await versionManager.saveVersionArtifacts();

      this.workflowResults.version_report = versionManager.generateVersionReport();

      this.workflowResults.steps_completed.push({
        step: 'version_bump',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          bump_type: this.options.bumpVersion,
          modules_updated: Object.keys(bumpResults).length,
          results: bumpResults
        }
      });

      console.log('✅ Version management completed successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'version_bump',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Step 3: Execute module packaging
   */
  async executePackaging() {
    console.log('\n📦 Step 3: Module Packaging');
    console.log('-'.repeat(50));

    try {
      const packager = new BMAdModulePackager({
        sourceRoot: this.options.sourceRoot,
        outputRoot: this.options.outputRoot,
        verbose: this.options.verbose
      });

      this.workflowResults.packaging_report = await packager.packageModules();

      this.workflowResults.steps_completed.push({
        step: 'packaging',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          teams_packaged: this.workflowResults.packaging_report.teams_packaged?.length || 0,
          output_location: this.workflowResults.packaging_report.output_location
        }
      });

      console.log('✅ Module packaging completed successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'packaging',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Step 4: Execute post-packaging validation
   */
  async executePostValidation() {
    console.log('\n🔍 Step 4: Post-packaging Validation');
    console.log('-'.repeat(50));

    try {
      // Validate the distribution structure
      await this.validateDistributionStructure();

      this.workflowResults.steps_completed.push({
        step: 'post_validation',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          structure_validated: true
        }
      });

      console.log('✅ Post-packaging validation completed successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'post_validation',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Step 5: Execute Git tagging
   */
  async executeTagging() {
    console.log('\n🏷️  Step 5: Git Release Tagging');
    console.log('-'.repeat(50));

    try {
      const versionManager = new BMAdVersionManager({
        sourceRoot: this.options.sourceRoot,
        outputRoot: this.options.outputRoot,
        verbose: this.options.verbose,
        dryRun: this.options.dryRun
      });

      await versionManager.initialize();
      await versionManager.createReleaseTags();

      this.workflowResults.steps_completed.push({
        step: 'tagging',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          tags_created: true
        }
      });

      console.log('✅ Git tagging completed successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'tagging',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Step 6: Execute workflow testing
   */
  async executeWorkflowTesting() {
    console.log('\n🧪 Step 6: Workflow Testing');
    console.log('-'.repeat(50));

    try {
      const testSuite = new BMAdPackagingWorkflowTest({
        sourceRoot: this.options.sourceRoot,
        outputRoot: path.join(this.options.outputRoot, '../test'),
        verbose: this.options.verbose,
        keepTestOutput: false
      });

      this.workflowResults.test_report = await testSuite.runTestSuite();

      if (this.workflowResults.test_report.overall_status === 'FAILED') {
        throw new Error('Workflow testing failed');
      }

      this.workflowResults.steps_completed.push({
        step: 'testing',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          tests_run: this.workflowResults.test_report.tests_run,
          tests_passed: this.workflowResults.test_report.tests_passed,
          success_rate: this.workflowResults.test_report.success_rate
        }
      });

      console.log('✅ Workflow testing completed successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'testing',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Step 7: Generate workflow artifacts
   */
  async generateWorkflowArtifacts() {
    console.log('\n📄 Step 7: Generating Workflow Artifacts');
    console.log('-'.repeat(50));

    try {
      // Generate comprehensive workflow report
      const workflowReport = this.generateWorkflowReport();
      const reportPath = path.join(this.options.outputRoot, 'workflow-report.json');
      await fs.writeFile(reportPath, JSON.stringify(workflowReport, null, 2), 'utf8');

      // Generate README for the distribution
      await this.generateDistributionReadme();

      // Generate installation guide
      await this.generateInstallationGuide();

      this.workflowResults.steps_completed.push({
        step: 'artifacts',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        details: {
          artifacts_generated: ['workflow-report.json', 'README.md', 'INSTALLATION.md']
        }
      });

      console.log('✅ Workflow artifacts generated successfully');

    } catch (error) {
      this.workflowResults.steps_completed.push({
        step: 'artifacts',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate distribution structure
   */
  async validateDistributionStructure() {
    const requiredPaths = [
      'src',
      'src/cybersec-team',
      'src/intel-team',
      'src/legal-team',
      'src/strategy-team',
      'package.json',
      'README.md'
    ];

    for (const requiredPath of requiredPaths) {
      const fullPath = path.join(this.options.outputRoot, requiredPath);
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error(`Required distribution path missing: ${requiredPath}`);
      }
    }
  }

  /**
   * Generate distribution README
   */
  async generateDistributionReadme() {
    // This would generate the comprehensive README for the distribution
    // For now, we'll create a placeholder
    const readmePath = path.join(this.options.outputRoot, 'README.md');

    const readmeContent = `# BMAD Specialized Teams Distribution

Generated by BMAD Module Packaging Workflow Engine v1.0.0
Generated at: ${new Date().toISOString()}

## Package Contents

This distribution contains the complete BMAD Specialized Teams multi-module package with:

- **cybersec-team**: Cybersecurity operations module
- **intel-team**: Intelligence operations module
- **legal-team**: Legal operations module
- **strategy-team**: Strategic operations module

## Installation

See INSTALLATION.md for detailed installation instructions.

## Workflow Report

- Validation Score: ${this.workflowResults.validation_report?.validation_summary?.validation_score || 'N/A'}
- Modules Packaged: ${this.workflowResults.packaging_report?.teams_packaged?.length || 0}
- Test Success Rate: ${this.workflowResults.test_report?.success_rate || 'N/A'}%

## Generated Artifacts

- Package structure following bmad-builder format
- Individual NPM packages for each team module
- Semantic versioning with automated changelog
- Git repository with CI/CD workflows
- Comprehensive test suite

---

*Generated by BMAD Module Packaging Orchestrator*
`;

    await fs.writeFile(readmePath, readmeContent, 'utf8');
  }

  /**
   * Generate installation guide
   */
  async generateInstallationGuide() {
    const installationPath = path.join(this.options.outputRoot, 'INSTALLATION.md');

    const installationContent = `# BMAD Specialized Teams Installation Guide

## Prerequisites

- BMAD v2.0+ installed
- Node.js 16+ for NPM packages
- Git for repository cloning

## Installation Methods

### Method 1: NPM Installation

\`\`\`bash
# Install complete package
npm install @bmad-cybercommand/meta-package

# Install to BMAD
bmad install node_modules/@bmad-cybercommand/meta-package
\`\`\`

### Method 2: Git Clone Installation

\`\`\`bash
# Clone repository
git clone <repository-url>

# Install to BMAD
bmad install ./bmad-specialized-teams
\`\`\`

### Method 3: Individual Module Installation

\`\`\`bash
# Install specific teams
npm install @bmad-cybercommand/cybersec-team
npm install @bmad-cybercommand/intel-team
bmad install node_modules/@bmad-cybercommand/cybersec-team
bmad install node_modules/@bmad-cybercommand/intel-team
\`\`\`

## Post-Installation

1. Verify installation: \`bmad status\`
2. Configure teams: Follow interactive setup prompts
3. Test functionality: \`bmad agent <team-agent>\`

## Troubleshooting

- Check BMAD compatibility version
- Verify all dependencies are satisfied
- Review installation logs for errors

---

*Generated at: ${new Date().toISOString()}*
`;

    await fs.writeFile(installationPath, installationContent, 'utf8');
  }

  /**
   * Generate comprehensive workflow report
   */
  generateWorkflowReport() {
    const report = {
      ...this.workflowResults,
      workflow_summary: {
        total_steps: this.workflowResults.steps_completed.length,
        completed_steps: this.workflowResults.steps_completed.filter(s => s.status === 'COMPLETED').length,
        failed_steps: this.workflowResults.steps_completed.filter(s => s.status === 'FAILED').length,
        execution_time: new Date().toISOString()
      },
      environment: {
        source_root: this.options.sourceRoot,
        output_root: this.options.outputRoot,
        dry_run: this.options.dryRun,
        node_version: process.version
      }
    };

    this.displayWorkflowSummary(report);
    return report;
  }

  /**
   * Display workflow summary
   */
  displayWorkflowSummary(report) {
    console.log('\n📊 BMAD Module Packaging Workflow Summary');
    console.log('='.repeat(55));
    console.log(`Status: ${report.workflow_status}`);
    console.log(`Steps: ${report.workflow_summary.completed_steps}/${report.workflow_summary.total_steps} completed`);

    if (report.validation_report) {
      console.log(`Validation Score: ${report.validation_report.validation_summary?.validation_score || 'N/A'}/100`);
    }

    if (report.packaging_report) {
      console.log(`Teams Packaged: ${report.packaging_report.teams_packaged?.length || 0}`);
    }

    if (report.test_report) {
      console.log(`Test Success Rate: ${report.test_report.success_rate || 0}%`);
    }

    console.log(`Output Location: ${this.options.outputRoot}`);
    console.log(`Generated: ${report.timestamp}`);

    if (report.workflow_summary.failed_steps > 0) {
      console.log('\n❌ Failed Steps:');
      const failedSteps = report.steps_completed.filter(s => s.status === 'FAILED');
      failedSteps.forEach(step => {
        console.log(`  - ${step.step}: ${step.error}`);
      });
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--validate-only':
        options.validateOnly = true;
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--bump-version':
        options.bumpVersion = args[++i];
        break;
      case '--create-tags':
        options.createTags = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--source':
      case '-s':
        options.sourceRoot = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputRoot = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
BMAD Module Packaging Orchestrator v1.0.0

Usage: node bmad-packaging-orchestrator.js [options]

Options:
      --validate-only       Only validate sources, don't package
      --skip-tests          Skip workflow testing
      --bump-version <type> Bump version (major|minor|patch)
      --create-tags         Create Git release tags
  -s, --source <path>       Source directory path
  -o, --output <path>       Output directory path
  -v, --verbose             Verbose output
      --dry-run             Show what would be done without changes
  -h, --help               Show help

Examples:
  node bmad-packaging-orchestrator.js                           # Full workflow
  node bmad-packaging-orchestrator.js --validate-only           # Validation only
  node bmad-packaging-orchestrator.js --bump-version patch      # With version bump
  node bmad-packaging-orchestrator.js --create-tags             # With Git tagging
  node bmad-packaging-orchestrator.js --dry-run                 # Dry run mode
`);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  // Validate bump-version option
  if (options.bumpVersion && !['major', 'minor', 'patch'].includes(options.bumpVersion)) {
    console.error('Error: --bump-version must be major, minor, or patch');
    process.exit(1);
  }

  // Run orchestrator
  const orchestrator = new BMAdPackagingOrchestrator(options);
  orchestrator.executeWorkflow()
    .then(report => {
      if (!report.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Orchestration failed:', error.message);
      process.exit(1);
    });
}

module.exports = BMAdPackagingOrchestrator;