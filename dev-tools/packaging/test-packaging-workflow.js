#!/usr/bin/env node
/**
 * BMAD Module Packaging Workflow Test Suite
 * Epic 4, Story 4.1 - Module Packaging Workflow Engine Testing
 *
 * Comprehensive testing of the packaging workflow for all 4 specialized team modules.
 * Validates the complete pipeline from source validation to distribution packaging.
 *
 * Author: Morgan (Module Builder)
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Import our packaging components
const BMAdModulePackager = require('./bmad-module-packager');
const BMAdPackageValidator = require('./bmad-package-validator');
const BMAdVersionManager = require('./bmad-version-manager');

/**
 * BMAD Packaging Workflow Test Suite
 * Tests the complete packaging workflow end-to-end
 */
class BMAdPackagingWorkflowTest {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      outputRoot: options.outputRoot || '/Users/paultinp/BMAD-CYBER2/_bmad-output/dist-test',
      verbose: options.verbose || false,
      keepTestOutput: options.keepTestOutput || false,
      ...options
    };

    this.testResults = {
      timestamp: new Date().toISOString(),
      tests_run: 0,
      tests_passed: 0,
      tests_failed: 0,
      test_cases: []
    };

    this.specializedTeams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
  }

  /**
   * Run complete test suite
   */
  async runTestSuite() {
    console.log('🧪 BMAD Module Packaging Workflow Test Suite v1.0.0');
    console.log('='.repeat(60));

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Test 1: Source validation
      await this.testSourceValidation();

      // Test 2: Individual module packaging
      await this.testIndividualModulePackaging();

      // Test 3: Complete workflow packaging
      await this.testCompleteWorkflowPackaging();

      // Test 4: NPM package generation
      await this.testNpmPackageGeneration();

      // Test 5: Git repository initialization
      await this.testGitRepositoryInitialization();

      // Test 6: Semantic versioning
      await this.testSemanticVersioning();

      // Test 7: Distribution structure validation
      await this.testDistributionStructureValidation();

      // Test 8: Cross-module integration
      await this.testCrossModuleIntegration();

      // Generate test report
      const report = this.generateTestReport();
      await this.saveTestReport(report);

      // Cleanup if not keeping test output
      if (!this.options.keepTestOutput) {
        await this.cleanupTestEnvironment();
      }

      return report;

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      throw error;
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log('\n🔧 Setting up test environment...');

    // Create test output directory
    await fs.mkdir(this.options.outputRoot, { recursive: true });

    // Verify source modules exist
    for (const team of this.specializedTeams) {
      const teamPath = path.join(this.options.sourceRoot, team);
      try {
        await fs.access(teamPath);
      } catch {
        throw new Error(`Source module not found: ${team} at ${teamPath}`);
      }
    }

    console.log('✅ Test environment setup complete');
  }

  /**
   * Test source validation functionality
   */
  async testSourceValidation() {
    console.log('\n🔍 Test 1: Source Validation');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'Source Validation',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const validator = new BMAdPackageValidator({
        sourceRoot: this.options.sourceRoot,
        verbose: this.options.verbose
      });

      // Test validation of all modules
      const validationReport = await validator.validate();

      // Verify validation results
      if (validationReport.validation_summary.overall_status !== 'PASSED') {
        testCase.warnings.push('Source validation found issues but did not fail completely');
      }

      // Check that all expected modules were validated
      const expectedModules = this.specializedTeams.length;
      const actualModules = validationReport.validation_summary.total_modules;

      if (actualModules !== expectedModules) {
        testCase.errors.push(
          `Expected ${expectedModules} modules, but validated ${actualModules}`
        );
      }

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';
      testCase.details = {
        modules_validated: actualModules,
        validation_score: validationReport.validation_summary.validation_score,
        total_agents: validationReport.validation_summary.total_agents,
        total_workflows: validationReport.validation_summary.total_workflows
      };

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`Validation error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Test individual module packaging
   */
  async testIndividualModulePackaging() {
    console.log('\n📦 Test 2: Individual Module Packaging');
    console.log('-'.repeat(40));

    for (const team of this.specializedTeams) {
      const testCase = {
        name: `Individual Packaging - ${team}`,
        status: 'RUNNING',
        startTime: new Date(),
        errors: [],
        warnings: []
      };

      try {
        const packager = new BMAdModulePackager({
          sourceRoot: this.options.sourceRoot,
          outputRoot: path.join(this.options.outputRoot, 'individual-test'),
          verbose: this.options.verbose
        });

        // Test packaging single team
        await packager.packageModules(team);

        // Verify output structure
        await this.verifyModuleOutput(team, path.join(this.options.outputRoot, 'individual-test'), testCase);

        testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';

      } catch (error) {
        testCase.status = 'FAILED';
        testCase.errors.push(`Packaging error: ${error.message}`);
      }

      testCase.endTime = new Date();
      testCase.duration = testCase.endTime - testCase.startTime;

      this.recordTestResult(testCase);
      console.log(`  ${team}: ${testCase.status}`);
    }
  }

  /**
   * Test complete workflow packaging
   */
  async testCompleteWorkflowPackaging() {
    console.log('\n🚀 Test 3: Complete Workflow Packaging');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'Complete Workflow Packaging',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const packager = new BMAdModulePackager({
        sourceRoot: this.options.sourceRoot,
        outputRoot: path.join(this.options.outputRoot, 'complete-test'),
        verbose: this.options.verbose
      });

      // Test packaging all teams
      const report = await packager.packageModules();

      // Verify all teams were packaged
      if (!report.success) {
        testCase.errors.push('Complete packaging workflow did not complete successfully');
      }

      // Verify all expected outputs exist
      await this.verifyCompleteOutput(path.join(this.options.outputRoot, 'complete-test'), testCase);

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';
      testCase.details = {
        teams_packaged: report.teams_packaged?.length || 0,
        output_location: report.output_location
      };

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`Complete packaging error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Test NPM package generation
   */
  async testNpmPackageGeneration() {
    console.log('\n📦 Test 4: NPM Package Generation');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'NPM Package Generation',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const testOutputPath = path.join(this.options.outputRoot, 'complete-test');

      // Check main package.json
      const mainPackageJson = path.join(testOutputPath, 'package.json');
      await this.verifyFileExists(mainPackageJson, testCase, 'Main package.json');

      if (testCase.errors.length === 0) {
        const packageContent = await fs.readFile(mainPackageJson, 'utf8');
        const packageData = JSON.parse(packageContent);

        // Verify required fields
        const requiredFields = ['name', 'version', 'description', 'keywords', 'license'];
        for (const field of requiredFields) {
          if (!packageData[field]) {
            testCase.errors.push(`package.json missing required field: ${field}`);
          }
        }

        // Verify bmad-specific fields
        if (!packageData.bmad) {
          testCase.errors.push('package.json missing bmad configuration');
        }
      }

      // Check individual team package.json files
      for (const team of this.specializedTeams) {
        const teamPackageJson = path.join(testOutputPath, 'src', team, 'package.json');
        await this.verifyFileExists(teamPackageJson, testCase, `${team} package.json`);
      }

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`NPM package generation error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Test Git repository initialization
   */
  async testGitRepositoryInitialization() {
    console.log('\n🔧 Test 5: Git Repository Initialization');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'Git Repository Initialization',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const testOutputPath = path.join(this.options.outputRoot, 'complete-test');

      // Check .git directory
      const gitDir = path.join(testOutputPath, '.git');
      await this.verifyFileExists(gitDir, testCase, '.git directory');

      // Check .gitignore
      const gitignore = path.join(testOutputPath, '.gitignore');
      await this.verifyFileExists(gitignore, testCase, '.gitignore file');

      // Check GitHub workflows
      const githubWorkflow = path.join(testOutputPath, '.github', 'workflows', 'ci.yml');
      await this.verifyFileExists(githubWorkflow, testCase, 'GitHub CI workflow');

      // Verify Git status (should be clean with initial commit)
      try {
        const gitStatus = execSync('git status --porcelain', {
          cwd: testOutputPath,
          encoding: 'utf8'
        });

        if (gitStatus.trim() !== '') {
          testCase.warnings.push('Git repository has uncommitted changes');
        }
      } catch (error) {
        testCase.errors.push(`Git status check failed: ${error.message}`);
      }

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`Git initialization error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Test semantic versioning functionality
   */
  async testSemanticVersioning() {
    console.log('\n🏷️  Test 6: Semantic Versioning');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'Semantic Versioning',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const versionManager = new BMAdVersionManager({
        sourceRoot: this.options.sourceRoot,
        outputRoot: path.join(this.options.outputRoot, 'complete-test'),
        dryRun: true, // Don't actually modify versions in test
        verbose: this.options.verbose
      });

      await versionManager.initialize();

      // Test version validation
      const isValid = versionManager.validateVersions();
      if (!isValid) {
        testCase.errors.push('Version validation failed');
      }

      // Test changelog generation
      const changelog = versionManager.generateChangelog();
      if (!changelog || changelog.length < 10) {
        testCase.warnings.push('Changelog generation produced minimal output');
      }

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';
      testCase.details = {
        versions_validated: Object.keys(versionManager.currentVersions).length,
        changelog_generated: !!changelog
      };

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`Semantic versioning error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Test distribution structure validation
   */
  async testDistributionStructureValidation() {
    console.log('\n🏗️  Test 7: Distribution Structure Validation');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'Distribution Structure Validation',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const testOutputPath = path.join(this.options.outputRoot, 'complete-test');

      // Verify bmad-builder structure
      const expectedStructure = [
        'src',
        'docs',
        'samples',
        'test',
        '.github',
        'README.md',
        'CONTRIBUTING.md',
        'SECURITY.md',
        'package.json'
      ];

      for (const item of expectedStructure) {
        const itemPath = path.join(testOutputPath, item);
        await this.verifyFileExists(itemPath, testCase, `Distribution structure: ${item}`);
      }

      // Verify each team module structure
      for (const team of this.specializedTeams) {
        const teamPath = path.join(testOutputPath, 'src', team);
        const expectedTeamStructure = ['agents', 'workflows', 'tools', 'module.yaml', 'package.json'];

        for (const item of expectedTeamStructure) {
          const itemPath = path.join(teamPath, item);
          await this.verifyFileExists(itemPath, testCase, `${team} structure: ${item}`);
        }
      }

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`Distribution structure validation error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Test cross-module integration
   */
  async testCrossModuleIntegration() {
    console.log('\n🔗 Test 8: Cross-Module Integration');
    console.log('-'.repeat(40));

    const testCase = {
      name: 'Cross-Module Integration',
      status: 'RUNNING',
      startTime: new Date(),
      errors: [],
      warnings: []
    };

    try {
      const testOutputPath = path.join(this.options.outputRoot, 'complete-test');

      // Verify that all teams reference each other correctly in dependencies
      for (const team of this.specializedTeams) {
        const moduleYamlPath = path.join(testOutputPath, 'src', team, 'module.yaml');

        if (await this.fileExists(moduleYamlPath)) {
          const content = await fs.readFile(moduleYamlPath, 'utf8');
          // Basic check for dependency structure
          if (!content.includes('dependencies')) {
            testCase.warnings.push(`${team} module.yaml missing dependencies section`);
          }
        }
      }

      // Verify meta-package references all teams
      const mainPackageJsonPath = path.join(testOutputPath, 'package.json');
      if (await this.fileExists(mainPackageJsonPath)) {
        const content = await fs.readFile(mainPackageJsonPath, 'utf8');
        const packageData = JSON.parse(content);

        if (packageData.bmad && packageData.bmad.modules) {
          const referencedModules = packageData.bmad.modules;
          for (const team of this.specializedTeams) {
            if (!referencedModules.includes(team)) {
              testCase.errors.push(`Meta-package missing reference to ${team}`);
            }
          }
        } else {
          testCase.warnings.push('Meta-package missing bmad.modules configuration');
        }
      }

      testCase.status = testCase.errors.length === 0 ? 'PASSED' : 'FAILED';

    } catch (error) {
      testCase.status = 'FAILED';
      testCase.errors.push(`Cross-module integration error: ${error.message}`);
    }

    testCase.endTime = new Date();
    testCase.duration = testCase.endTime - testCase.startTime;

    this.recordTestResult(testCase);
    console.log(`  Status: ${testCase.status}`);
  }

  /**
   * Verify module output structure
   */
  async verifyModuleOutput(team, outputRoot, testCase) {
    const teamPath = path.join(outputRoot, 'src', team);

    // Check team directory exists
    await this.verifyFileExists(teamPath, testCase, `${team} directory`);

    // Check required files and directories
    const requiredItems = ['agents', 'workflows', 'module.yaml'];
    for (const item of requiredItems) {
      const itemPath = path.join(teamPath, item);
      await this.verifyFileExists(itemPath, testCase, `${team} ${item}`);
    }

    // Check agents directory has .agent.yaml files
    const agentsPath = path.join(teamPath, 'agents');
    if (await this.fileExists(agentsPath)) {
      const agentFiles = await fs.readdir(agentsPath);
      const yamlAgents = agentFiles.filter(f => f.endsWith('.agent.yaml'));

      if (yamlAgents.length === 0) {
        testCase.errors.push(`${team} agents directory has no .agent.yaml files`);
      }
    }
  }

  /**
   * Verify complete output structure
   */
  async verifyCompleteOutput(outputRoot, testCase) {
    // Check main structure
    const mainItems = ['src', 'README.md', 'package.json'];
    for (const item of mainItems) {
      const itemPath = path.join(outputRoot, item);
      await this.verifyFileExists(itemPath, testCase, `Main ${item}`);
    }

    // Check all teams are present
    for (const team of this.specializedTeams) {
      const teamPath = path.join(outputRoot, 'src', team);
      await this.verifyFileExists(teamPath, testCase, `Team ${team}`);
    }
  }

  /**
   * Verify file exists
   */
  async verifyFileExists(filePath, testCase, description) {
    try {
      await fs.access(filePath);
    } catch {
      testCase.errors.push(`Missing: ${description} at ${filePath}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Record test result
   */
  recordTestResult(testCase) {
    this.testResults.tests_run++;

    if (testCase.status === 'PASSED') {
      this.testResults.tests_passed++;
    } else {
      this.testResults.tests_failed++;
    }

    this.testResults.test_cases.push(testCase);
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const report = {
      ...this.testResults,
      success_rate: this.testResults.tests_run > 0
        ? Math.round((this.testResults.tests_passed / this.testResults.tests_run) * 100)
        : 0,
      total_duration: this.testResults.test_cases.reduce((sum, tc) => sum + (tc.duration || 0), 0),
      overall_status: this.testResults.tests_failed === 0 ? 'PASSED' : 'FAILED',
      summary: {
        test_environment: {
          source_root: this.options.sourceRoot,
          output_root: this.options.outputRoot,
          specialized_teams: this.specializedTeams
        },
        test_coverage: [
          'Source Validation',
          'Individual Module Packaging',
          'Complete Workflow Packaging',
          'NPM Package Generation',
          'Git Repository Initialization',
          'Semantic Versioning',
          'Distribution Structure Validation',
          'Cross-Module Integration'
        ]
      }
    };

    this.displayTestReport(report);
    return report;
  }

  /**
   * Display test report
   */
  displayTestReport(report) {
    console.log('\n📊 BMAD Module Packaging Test Report');
    console.log('='.repeat(50));
    console.log(`Overall Status: ${report.overall_status}`);
    console.log(`Success Rate: ${report.success_rate}%`);
    console.log(`Tests Run: ${report.tests_run}`);
    console.log(`Tests Passed: ${report.tests_passed}`);
    console.log(`Tests Failed: ${report.tests_failed}`);
    console.log(`Total Duration: ${Math.round(report.total_duration / 1000)}s`);

    if (report.tests_failed > 0) {
      console.log('\n❌ Failed Tests:');
      const failedTests = report.test_cases.filter(tc => tc.status === 'FAILED');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}`);
        test.errors.forEach(error => console.log(`    Error: ${error}`));
      });
    }

    const warningTests = report.test_cases.filter(tc => tc.warnings?.length > 0);
    if (warningTests.length > 0) {
      console.log('\n⚠️  Tests with Warnings:');
      warningTests.forEach(test => {
        console.log(`  - ${test.name}`);
        test.warnings.forEach(warning => console.log(`    Warning: ${warning}`));
      });
    }

    console.log('\n✅ Test Coverage Validation:');
    report.summary.test_coverage.forEach(coverage => {
      const testCase = report.test_cases.find(tc => tc.name.includes(coverage.split(' ')[0]));
      const status = testCase ? testCase.status : 'NOT_RUN';
      console.log(`  - ${coverage}: ${status}`);
    });
  }

  /**
   * Save test report
   */
  async saveTestReport(report) {
    const reportPath = path.join(this.options.outputRoot, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

    const summaryPath = path.join(this.options.outputRoot, 'test-summary.md');
    const summaryContent = this.generateMarkdownSummary(report);
    await fs.writeFile(summaryPath, summaryContent, 'utf8');

    console.log(`\n💾 Test report saved to: ${reportPath}`);
    console.log(`📄 Test summary saved to: ${summaryPath}`);
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(report) {
    const summary = [
      '# BMAD Module Packaging Test Report',
      '',
      `**Generated**: ${new Date().toISOString()}`,
      `**Status**: ${report.overall_status}`,
      `**Success Rate**: ${report.success_rate}%`,
      '',
      '## Test Results',
      '',
      `- Tests Run: ${report.tests_run}`,
      `- Tests Passed: ${report.tests_passed}`,
      `- Tests Failed: ${report.tests_failed}`,
      `- Total Duration: ${Math.round(report.total_duration / 1000)}s`,
      ''
    ];

    // Add test details
    summary.push('## Test Cases');
    summary.push('');
    report.test_cases.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
      summary.push(`### ${status} ${test.name}`);
      summary.push(`- Status: ${test.status}`);
      summary.push(`- Duration: ${Math.round((test.duration || 0) / 1000)}s`);

      if (test.errors?.length > 0) {
        summary.push('- Errors:');
        test.errors.forEach(error => summary.push(`  - ${error}`));
      }

      if (test.warnings?.length > 0) {
        summary.push('- Warnings:');
        test.warnings.forEach(warning => summary.push(`  - ${warning}`));
      }

      summary.push('');
    });

    return summary.join('\n');
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment() {
    console.log('\n🧹 Cleaning up test environment...');

    try {
      // Remove test output directory
      await fs.rm(this.options.outputRoot, { recursive: true, force: true });
      console.log('✅ Test environment cleaned up');
    } catch (error) {
      console.warn(`⚠️  Cleanup warning: ${error.message}`);
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
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--keep-output':
      case '-k':
        options.keepTestOutput = true;
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
BMAD Module Packaging Workflow Test Suite v1.0.0

Usage: node test-packaging-workflow.js [options]

Options:
  -s, --source <path>       Source directory path
  -o, --output <path>       Test output directory path
  -v, --verbose             Verbose output
  -k, --keep-output         Keep test output after completion
  -h, --help               Show help

Examples:
  node test-packaging-workflow.js                # Run full test suite
  node test-packaging-workflow.js -v             # Verbose output
  node test-packaging-workflow.js -k             # Keep test files
`);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  // Run test suite
  const testSuite = new BMAdPackagingWorkflowTest(options);
  testSuite.runTestSuite()
    .then(report => {
      if (report.overall_status === 'FAILED') {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = BMAdPackagingWorkflowTest;