/**
 * BMAD CYBERCOMMAND - Bundle Size Checker
 * =======================================
 *
 * Checks the size of dist bundles and fails if they exceed thresholds.
 *
 * Usage:
 *   node scripts/check-bundle-size.js
 *   node scripts/check-bundle-size.js --threshold 50
 *   node scripts/check-bundle-size.js --verbose
 *
 * Exit codes:
 *   0 - All bundles within thresholds
 *   1 - One or more bundles exceed threshold
 *   2 - Error during execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Default configuration
const DEFAULT_THRESHOLD_MB = 50;
const WARNING_THRESHOLD_PERCENT = 80; // Warn at 80% of threshold

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    threshold: DEFAULT_THRESHOLD_MB,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      config.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--threshold' || arg === '-t') {
      const value = args[++i];
      config.threshold = parseFloat(value);
      if (isNaN(config.threshold) || config.threshold <= 0) {
        console.error(`Error: Invalid threshold value: ${value}`);
        process.exit(2);
      }
    }
  }

  return config;
}

// Show help message
function showHelp() {
  console.log(`
BMAD CYBERCOMMAND - Bundle Size Checker

Usage:
  node scripts/check-bundle-size.js [options]

Options:
  -h, --help              Show this help message
  -v, --verbose           Show detailed output
  -t, --threshold <MB>    Set size threshold in MB (default: ${DEFAULT_THRESHOLD_MB})

Examples:
  node scripts/check-bundle-size.js
  node scripts/check-bundle-size.js --threshold 100
  node scripts/check-bundle-size.js --verbose

Exit Codes:
  0 - All bundles within thresholds
  1 - One or more bundles exceed threshold
  2 - Error during execution
`);
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

// Get directory size recursively
function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = [];

  function walkDir(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walkDir(itemPath);
      } else {
        totalSize += stat.size;
        files.push({
          path: itemPath,
          size: stat.size,
          relativePath: path.relative(PROJECT_ROOT, itemPath)
        });
      }
    }
  }

  walkDir(dirPath);

  return { totalSize, files };
}

// Get file size
function getFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stat = fs.statSync(filePath);
  return stat.size;
}

// Check bundle sizes
function checkBundleSizes(config) {
  const results = {
    bundles: [],
    totalSize: 0,
    passed: true,
    warnings: [],
    errors: []
  };

  // Directories to check
  const bundleDirs = [
    { name: 'Framework Dist', path: '_bmad/framework/dist' },
    { name: 'Validators Dist', path: '.claude/validators-node/dist' }
  ];

  // Individual files to check
  const bundleFiles = [
    { name: 'Package Lock', path: 'package-lock.json', maxSize: 5 } // 5MB max for lock file
  ];

  console.log('='.repeat(60));
  console.log('BMAD CYBERCOMMAND - Bundle Size Check');
  console.log('='.repeat(60));
  console.log(`Threshold: ${config.threshold} MB`);
  console.log(`Warning at: ${WARNING_THRESHOLD_PERCENT}% of threshold`);
  console.log('');

  // Check directories
  console.log('Checking bundle directories...');
  console.log('-'.repeat(40));

  for (const bundle of bundleDirs) {
    const fullPath = path.join(PROJECT_ROOT, bundle.path);

    if (!fs.existsSync(fullPath)) {
      console.log(`  [SKIP] ${bundle.name} - Directory not found: ${bundle.path}`);
      continue;
    }

    const { totalSize, files } = getDirectorySize(fullPath);
    const sizeMB = totalSize / (1024 * 1024);
    const percentOfThreshold = (sizeMB / config.threshold) * 100;

    results.bundles.push({
      name: bundle.name,
      path: bundle.path,
      size: totalSize,
      sizeMB: sizeMB,
      fileCount: files.length,
      percentOfThreshold
    });

    results.totalSize += totalSize;

    // Determine status
    let status = 'PASS';
    let statusColor = '\x1b[32m'; // Green

    if (sizeMB > config.threshold) {
      status = 'FAIL';
      statusColor = '\x1b[31m'; // Red
      results.passed = false;
      results.errors.push(`${bundle.name} exceeds threshold: ${formatBytes(totalSize)} > ${config.threshold} MB`);
    } else if (percentOfThreshold >= WARNING_THRESHOLD_PERCENT) {
      status = 'WARN';
      statusColor = '\x1b[33m'; // Yellow
      results.warnings.push(
        `${bundle.name} approaching threshold: ${formatBytes(totalSize)} (${percentOfThreshold.toFixed(1)}%)`
      );
    }

    console.log(`  ${statusColor}[${status}]\x1b[0m ${bundle.name}`);
    console.log(`         Size: ${formatBytes(totalSize)} (${sizeMB.toFixed(2)} MB)`);
    console.log(`         Files: ${files.length}`);
    console.log(`         Threshold usage: ${percentOfThreshold.toFixed(1)}%`);

    // Show largest files in verbose mode
    if (config.verbose && files.length > 0) {
      const topFiles = files.sort((a, b) => b.size - a.size).slice(0, 5);

      console.log('         Largest files:');
      for (const file of topFiles) {
        console.log(`           - ${formatBytes(file.size).padStart(10)} ${file.relativePath}`);
      }
    }

    console.log('');
  }

  // Check individual files
  console.log('Checking individual files...');
  console.log('-'.repeat(40));

  for (const file of bundleFiles) {
    const fullPath = path.join(PROJECT_ROOT, file.path);
    const size = getFileSize(fullPath);

    if (size === null) {
      console.log(`  [SKIP] ${file.name} - File not found: ${file.path}`);
      continue;
    }

    const sizeMB = size / (1024 * 1024);
    const maxSize = file.maxSize || config.threshold;
    const percentOfThreshold = (sizeMB / maxSize) * 100;

    let status = 'PASS';
    let statusColor = '\x1b[32m';

    if (sizeMB > maxSize) {
      status = 'FAIL';
      statusColor = '\x1b[31m';
      results.passed = false;
      results.errors.push(`${file.name} exceeds threshold: ${formatBytes(size)} > ${maxSize} MB`);
    } else if (percentOfThreshold >= WARNING_THRESHOLD_PERCENT) {
      status = 'WARN';
      statusColor = '\x1b[33m';
      results.warnings.push(`${file.name} approaching threshold: ${formatBytes(size)}`);
    }

    console.log(`  ${statusColor}[${status}]\x1b[0m ${file.name}`);
    console.log(`         Size: ${formatBytes(size)} (${sizeMB.toFixed(2)} MB)`);
    console.log(`         Max allowed: ${maxSize} MB`);
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(
    `Total bundle size: ${formatBytes(results.totalSize)} (${(results.totalSize / (1024 * 1024)).toFixed(2)} MB)`
  );
  console.log(`Bundles checked: ${results.bundles.length}`);

  if (results.warnings.length > 0) {
    console.log(`\n\x1b[33mWarnings (${results.warnings.length}):\x1b[0m`);
    results.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (results.errors.length > 0) {
    console.log(`\n\x1b[31mErrors (${results.errors.length}):\x1b[0m`);
    results.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log('');

  if (results.passed) {
    console.log('\x1b[32m[SUCCESS]\x1b[0m All bundles within size thresholds');
  } else {
    console.log('\x1b[31m[FAILURE]\x1b[0m One or more bundles exceed size thresholds');
  }

  console.log('='.repeat(60));

  return results;
}

// Output JSON report
function writeReport(results) {
  const reportPath = path.join(PROJECT_ROOT, 'coverage/bundle-size-report.json');
  const reportDir = path.dirname(reportPath);

  // Ensure directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    passed: results.passed,
    totalSize: results.totalSize,
    totalSizeMB: results.totalSize / (1024 * 1024),
    bundles: results.bundles,
    warnings: results.warnings,
    errors: results.errors
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${reportPath}`);
}

// Main execution
function main() {
  const config = parseArgs();

  if (config.help) {
    showHelp();
    process.exit(0);
  }

  try {
    const results = checkBundleSizes(config);
    writeReport(results);

    process.exit(results.passed ? 0 : 1);
  } catch (error) {
    console.error('\x1b[31mError during bundle size check:\x1b[0m');
    console.error(error.message);

    if (config.verbose) {
      console.error(error.stack);
    }

    process.exit(2);
  }
}

main();
