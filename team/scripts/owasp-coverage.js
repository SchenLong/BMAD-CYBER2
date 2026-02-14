/**
 * BMAD CYBERSEC - OWASP Coverage Calculator
 * ==========================================
 *
 * Calculates OWASP compliance coverage across three frameworks:
 * - OWASP Web Top 10 (2021)
 * - OWASP API Security Top 10 (2023)
 * - OWASP ASVS v4.0
 *
 * Usage:
 *   node scripts/owasp-coverage.js
 *   node scripts/owasp-coverage.js --json
 *   node scripts/owasp-coverage.js --verbose
 *
 * Exit codes:
 *   0 - Coverage calculation successful
 *   1 - Coverage below minimum threshold
 *   2 - Error during execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Default configuration
const MINIMUM_COVERAGE_PERCENT = 70;
const TEST_FILE_PATTERN = /^tests\/owasp\/.+\.test\.js$/;

// OWASP Control definitions
const FRAMEWORKS = {
  owasp_web_top_10: {
    name: 'OWASP Web Top 10 (2021)',
    short: 'Web',
    total_controls: 47,
    categories: ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10']
  },
  owasp_api_security_top_10: {
    name: 'OWASP API Security Top 10 (2023)',
    short: 'API',
    total_controls: 35,
    categories: ['API1', 'API2', 'API3', 'API4', 'API5', 'API6', 'API7', 'API8', 'API9', 'API10']
  },
  owasp_asvs: {
    name: 'OWASP ASVS v4.0',
    short: 'ASVS',
    total_controls: 47,
    categories: [
      'V1',
      'V2',
      'V3',
      'V4',
      'V5',
      'V6',
      'V7',
      'V8',
      'V9',
      'V10',
      'V11',
      'V12',
      'V13',
      'V14',
      'V15',
      'V16',
      'V17',
      'V18',
      'V19',
      'V20'
    ]
  },
  owasp_llm_top_10: {
    name: 'OWASP LLM Top 10 (2024)',
    short: 'LLM',
    total_controls: 48,
    categories: ['LLM01', 'LLM02', 'LLM03', 'LLM04', 'LLM05', 'LLM06', 'LLM07', 'LLM08', 'LLM09', 'LLM10']
  }
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    verbose: false,
    json: false,
    help: false,
    minimum: MINIMUM_COVERAGE_PERCENT,
    checkRegression: false,
    baselineFile: 'coverage/owasp-baseline.json'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      config.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--json' || arg === '-j') {
      config.json = true;
    } else if (arg === '--minimum' || arg === '-m') {
      const value = args[++i];
      config.minimum = parseFloat(value);
      if (isNaN(config.minimum) || config.minimum < 0 || config.minimum > 100) {
        console.error(`Error: Invalid minimum coverage value: ${value}`);
        process.exit(2);
      }
    } else if (arg === '--check-regression') {
      config.checkRegression = true;
    }
  }

  return config;
}

// Show help message
function showHelp() {
  console.log(`
BMAD CYBERSEC - OWASP Coverage Calculator

Usage:
  node scripts/owasp-coverage.js [options]

Options:
  -h, --help              Show this help message
  -v, --verbose           Show detailed output including all test IDs
  -j, --json              Output JSON format instead of human-readable
  -m, --minimum <PCT>     Set minimum coverage threshold (default: ${MINIMUM_COVERAGE_PERCENT})
  --check-regression      Check coverage has not decreased from baseline

Examples:
  node scripts/owasp-coverage.js
  node scripts/owasp-coverage.js --verbose
  node scripts/owasp-coverage.js --json
  node scripts/owasp-coverage.js --minimum 80
  node scripts/owasp-coverage.js --check-regression

Exit Codes:
  0 - Coverage calculation successful (or coverage >= minimum)
  1 - Coverage below minimum threshold or regression detected
  2 - Error during execution

The script reads test files from tests/owasp/ and control definitions from:
  Docs/04-operations/security/owasp-controls.yaml
`);
}

// Parse OWASP test IDs from a test file
function extractTestIds(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const testIds = new Set();

  // Pattern to match test IDs like A01-010, API1-004, V1-001, LLM01-010
  // Matches describe() blocks and comments
  const patterns = [
    /describe\(['"]([A-Z]+\d{1,2}-\d{3})/g,
    /\/\/\s*([A-Z]+\d{1,2}-\d{3})/g,
    /it\(['"]([A-Z]+\d{1,2}-\d{3})/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      testIds.add(match[1]);
    }
  }

  return Array.from(testIds);
}

// Scan OWASP test directory and extract all test IDs
function scanTestFiles() {
  const testDir = path.join(PROJECT_ROOT, 'tests/owasp');
  const results = {
    files: [],
    testIds: [],
    byFramework: {
      owasp_web_top_10: [],
      owasp_api_security_top_10: [],
      owasp_asvs: [],
      owasp_llm_top_10: []
    },
    byCategory: {}
  };

  if (!fs.existsSync(testDir)) {
    console.error(`Error: Test directory not found: ${testDir}`);
    process.exit(2);
  }

  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));

  for (const file of files) {
    const filePath = path.join(testDir, file);
    const testIds = extractTestIds(filePath);
    const relativePath = path.relative(PROJECT_ROOT, filePath);

    results.files.push({
      path: relativePath,
      testCount: testIds.length
    });

    for (const testId of testIds) {
      results.testIds.push(testId);

      // Determine framework and category
      const [category, num] = testId.split('-');

      // Categorize by framework
      if (category.startsWith('API')) {
        results.byFramework.owasp_api_security_top_10.push(testId);
      } else if (category.startsWith('V')) {
        results.byFramework.owasp_asvs.push(testId);
      } else if (category.startsWith('LLM')) {
        results.byFramework.owasp_llm_top_10.push(testId);
      } else if (/^A\d{2}$/.test(category)) {
        results.byFramework.owasp_web_top_10.push(testId);
      }

      // Group by category
      if (!results.byCategory[category]) {
        results.byCategory[category] = [];
      }
      if (!results.byCategory[category].includes(testId)) {
        results.byCategory[category].push(testId);
      }
    }
  }

  return results;
}

// Load controls from YAML file
function loadControls() {
  const controlsPath = path.join(PROJECT_ROOT, 'Docs/04-operations/security/owasp-controls.yaml');

  if (!fs.existsSync(controlsPath)) {
    console.error(`Warning: Controls file not found: ${controlsPath}`);
    console.error(`Using default control counts from framework definitions`);
    return null;
  }

  const content = fs.readFileSync(controlsPath, 'utf-8');

  // Parse YAML (simple parser for our format)
  const controls = {
    owasp_web_top_10: [],
    owasp_api_security_top_10: [],
    owasp_asvs: [],
    owasp_llm_top_10: []
  };

  const lines = content.split('\n');
  let currentFramework = null;
  let currentCategory = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match framework headers like "owasp_web_top_10:"
    if (/^owasp_\w+:$/.test(trimmed)) {
      currentFramework = trimmed.replace(/:$/, '');
      currentCategory = null;
      continue;
    }

    // Match category headers like "  A01:"
    if (/^\s{2}[A-Z]+\d{0,2}:$/.test(trimmed)) {
      currentCategory = trimmed.replace(/:\s*$/, '');
      continue;
    }

    // Match control_id lines
    const controlMatch = trimmed.match(/control_id:\s*["']?([A-Z]+\d{0,2}-\d{3})/);
    if (controlMatch) {
      const controlId = controlMatch[1];
      if (currentFramework && controls[currentFramework] !== undefined) {
        controls[currentFramework].push(controlId);
      }
    }
  }

  return controls;
}

// Calculate coverage statistics
function calculateCoverage(testData, controls = null) {
  const results = {
    frameworks: {},
    summary: {
      totalImplemented: 0,
      totalControls: 0,
      overallCoverage: 0
    },
    byCategory: {}
  };

  for (const [key, framework] of Object.entries(FRAMEWORKS)) {
    const implemented = testData.byFramework[key] || [];
    const uniqueImplemented = [...new Set(implemented)];
    const total = controls ? controls[key]?.length || framework.total_controls : framework.total_controls;

    const coverage = total > 0 ? (uniqueImplemented.length / total) * 100 : 0;

    results.frameworks[key] = {
      name: framework.name,
      short: framework.short,
      implemented: uniqueImplemented.length,
      total: total,
      coverage: coverage,
      testIds: uniqueImplemented.sort()
    };

    results.summary.totalImplemented += uniqueImplemented.length;
    results.summary.totalControls += total;
  }

  // Calculate overall coverage
  if (results.summary.totalControls > 0) {
    results.summary.overallCoverage = (results.summary.totalImplemented / results.summary.totalControls) * 100;
  }

  // Category breakdown
  for (const [category, testIds] of Object.entries(testData.byCategory)) {
    results.byCategory[category] = {
      implemented: testIds.length,
      testIds: testIds.sort()
    };
  }

  return results;
}

// Check for regression against baseline
function checkRegression(currentResults, baselinePath) {
  const fullBaselinePath = path.join(PROJECT_ROOT, baselinePath);

  if (!fs.existsSync(fullBaselinePath)) {
    console.log(`Warning: Baseline file not found: ${baselinePath}`);
    console.log(`Creating new baseline...`);
    return { regressed: false, created: true };
  }

  const baseline = JSON.parse(fs.readFileSync(fullBaselinePath, 'utf-8'));
  const regressions = [];

  for (const [key, framework] of Object.entries(currentResults.frameworks)) {
    const baselineFramework = baseline.frameworks?.[key];
    if (!baselineFramework) continue;

    // Check if coverage has decreased
    if (framework.coverage < baselineFramework.coverage - 0.1) {
      regressions.push({
        framework: framework.short,
        previous: baselineFramework.coverage.toFixed(1),
        current: framework.coverage.toFixed(1),
        delta: (framework.coverage - baselineFramework.coverage).toFixed(1)
      });
    }

    // Check for removed test IDs
    const baselineIds = new Set(baselineFramework.testIds || []);
    const currentIds = new Set(framework.testIds || []);
    const removed = [...baselineIds].filter(id => !currentIds.has(id));

    if (removed.length > 0) {
      regressions.push({
        framework: framework.short,
        type: 'removed_tests',
        removed: removed
      });
    }
  }

  return {
    regressed: regressions.length > 0,
    regressions,
    created: false
  };
}

// Save baseline
function saveBaseline(results, baselinePath) {
  const fullBaselinePath = path.join(PROJECT_ROOT, baselinePath);
  const dir = path.dirname(fullBaselinePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const baseline = {
    timestamp: new Date().toISOString(),
    frameworks: {}
  };

  for (const [key, framework] of Object.entries(results.frameworks)) {
    baseline.frameworks[key] = {
      name: framework.name,
      short: framework.short,
      implemented: framework.implemented,
      total: framework.total,
      coverage: framework.coverage,
      testIds: framework.testIds
    };
  }

  fs.writeFileSync(fullBaselinePath, JSON.stringify(baseline, null, 2));
  // Only log baseline save message if not in JSON mode
  if (!process.argv.includes('--json') && !process.argv.includes('-j')) {
    console.log(`Baseline saved to: ${baselinePath}`);
  }
}

// Format coverage bar
function formatCoverageBar(coverage, width = 30) {
  // Clamp coverage between 0-100 to prevent negative values
  const clampedCoverage = Math.max(0, Math.min(100, coverage));
  const filled = Math.round((clampedCoverage / 100) * width);
  const empty = width - filled;

  let bar = '';
  if (coverage >= 90) {
    bar += '\x1b[32m'; // Green
  } else if (coverage >= 70) {
    bar += '\x1b[33m'; // Yellow
  } else {
    bar += '\x1b[31m'; // Red
  }

  bar += '█'.repeat(Math.max(0, filled));
  bar += '\x1b[90m'; // Dark gray
  bar += '░'.repeat(Math.max(0, empty));
  bar += '\x1b[0m'; // Reset

  return bar;
}

// Display results
function displayResults(results, config) {
  console.log('');
  console.log('═'.repeat(70));
  console.log('  OWASP Compliance Coverage Report');
  console.log('═'.repeat(70));
  console.log(`  Generated: ${new Date().toISOString()}`);
  console.log('');

  // Framework breakdown
  console.log('  Framework Coverage');
  console.log('  ──────────────────────────────────────────────────────────────────────');

  for (const [key, framework] of Object.entries(results.frameworks)) {
    const bar = formatCoverageBar(framework.coverage);
    const status = framework.coverage >= 90 ? '✓' : framework.coverage >= config.minimum ? '~' : '✗';
    const color =
      framework.coverage >= 90 ? '\x1b[32m' : framework.coverage >= config.minimum ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(
      `  ${status} ${framework.short.padEnd(6)} ${bar} ${color}${framework.coverage.toFixed(1).padStart(5)}%${reset} (${framework.implemented}/${framework.total})`
    );

    if (config.verbose && framework.testIds.length > 0) {
      console.log(
        `       Tests: ${framework.testIds.slice(0, 10).join(', ')}${framework.testIds.length > 10 ? '...' : ''}`
      );
    }
  }

  console.log('');

  // Summary
  const summaryBar = formatCoverageBar(results.summary.overallCoverage);
  const status =
    results.summary.overallCoverage >= 90 ? '✓' : results.summary.overallCoverage >= config.minimum ? '~' : '✗';
  const color =
    results.summary.overallCoverage >= 90
      ? '\x1b[32m'
      : results.summary.overallCoverage >= config.minimum
        ? '\x1b[33m'
        : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log('  ──────────────────────────────────────────────────────────────────────');
  console.log(
    `  ${status} OVERALL ${summaryBar} ${color}${results.summary.overallCoverage.toFixed(1).padStart(5)}%${reset} (${results.summary.totalImplemented}/${results.summary.totalControls})`
  );
  console.log('═'.repeat(70));
  console.log('');

  // Category breakdown for Web Top 10
  if (config.verbose) {
    console.log('  Category Breakdown (OWASP Web Top 10)');
    console.log('  ──────────────────────────────────────────────────────────────────────');

    const webCategories = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10'];
    for (const cat of webCategories) {
      const catData = results.byCategory[cat];
      if (catData) {
        console.log(`  ${cat.padEnd(4)} ${catData.implemented.toString().padStart(3)} tests`);
      }
    }
    console.log('');
  }

  // Test file summary
  const testFiles = Object.keys(results.byCategory || {});
  console.log(`  Test files scanned: ${testFiles.length}`);
  console.log(`  Total test IDs found: ${results.summary.totalImplemented}`);
  console.log('');
}

// Display JSON output
function displayJson(results) {
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      overallCoverage: results.summary.overallCoverage,
      totalImplemented: results.summary.totalImplemented,
      totalControls: results.summary.totalControls,
      meetsMinimumThreshold: results.summary.overallCoverage >= MINIMUM_COVERAGE_PERCENT
    },
    frameworks: {}
  };

  for (const [key, framework] of Object.entries(results.frameworks)) {
    output.frameworks[key] = {
      name: framework.name,
      implemented: framework.implemented,
      total: framework.total,
      coverage: framework.coverage
    };
  }

  console.log(JSON.stringify(output, null, 2));
}

// Main execution
function main() {
  const config = parseArgs();

  if (config.help) {
    showHelp();
    process.exit(0);
  }

  try {
    // Scan test files
    const testData = scanTestFiles();

    // Load controls (optional, for accurate total counts)
    const controls = loadControls();

    // Calculate coverage
    const results = calculateCoverage(testData, controls);

    // Check for regression if requested
    if (config.checkRegression) {
      const regressionCheck = checkRegression(results, config.baselineFile);

      if (regressionCheck.regressed) {
        console.error('\x1b[31m[REGRESSION DETECTED]\x1b[0m');
        for (const reg of regressionCheck.regressions) {
          if (reg.removed) {
            console.error(`  ${reg.framework}: Removed tests: ${reg.removed.join(', ')}`);
          } else {
            console.error(`  ${reg.framework}: ${reg.previous}% → ${reg.current}% (${reg.delta})`);
          }
        }
        console.error('');
        process.exit(1);
      }

      if (regressionCheck.created) {
        saveBaseline(results, config.baselineFile);
      }
    }

    // Display results
    if (config.json) {
      displayJson(results);
    } else {
      displayResults(results, config);
    }

    // Save baseline if not checking regression
    if (!config.checkRegression) {
      saveBaseline(results, config.baselineFile);
    }

    // Exit with appropriate code
    const passed = results.summary.overallCoverage >= config.minimum;
    if (!config.json && !passed) {
      console.error(
        `\x1b[31m[FAILURE]\x1b[0m Coverage ${results.summary.overallCoverage.toFixed(1)}% is below minimum ${config.minimum}%`
      );
    } else if (!config.json && passed) {
      console.log(`\x1b[32m[PASS]\x1b[0m Coverage meets minimum threshold of ${config.minimum}%`);
    }

    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error('\x1b[31mError during coverage calculation:\x1b[0m');
    console.error(error.message);

    if (config.verbose) {
      console.error(error.stack);
    }

    process.exit(2);
  }
}

main();
