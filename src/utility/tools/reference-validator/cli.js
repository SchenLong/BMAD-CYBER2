#!/usr/bin/env node
/**
 * Cross-File Reference Validator CLI
 * Task 0.2 - Command-line interface for the reference validator
 *
 * Usage: node src/utility/tools/reference-validator/cli.js [--json]
 *        npm run validate:refs
 *
 * Flags:
 *   --json  Output results as JSON for machine consumption
 *
 * Exit codes:
 *   0 - All references valid
 *   1 - Broken references found
 *
 * @module reference-validator/cli
 * @version 1.0.0
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateReferences, VERSION } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve project root (4 levels up from src/utility/tools/reference-validator/)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// ============================================================================
// Output formatting
// ============================================================================

/**
 * Prints a colored header line to stdout.
 * @param {string} text - The header text
 */
function printHeader(text) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${text}`);
  console.log(`${'='.repeat(70)}`);
}

/**
 * Prints the validation summary.
 * @param {import('./index.js').ValidatorResult} result - The validation result
 */
function printSummary(result) {
  printHeader(`Cross-File Reference Validator v${VERSION}`);

  console.log(`\n  Files scanned:      ${result.totalFiles}`);
  console.log(`  Total references:   ${result.totalReferences}`);
  console.log(`  Valid references:   ${result.validReferences}`);
  console.log(`  Broken references:  ${result.brokenReferences}`);

  if (result.errors.length > 0) {
    console.log(`  Read errors:        ${result.errors.length}`);
  }
}

/**
 * Prints details of broken references.
 * @param {import('./index.js').BrokenReference[]} broken - Array of broken references
 */
function printBrokenDetails(broken) {
  if (broken.length === 0) return;

  console.log('\n  Broken References:');
  console.log(`  ${'-'.repeat(66)}`);

  for (const item of broken) {
    console.log(`\n  File: ${item.sourceFile}:${item.line}`);
    console.log(`    Type: ${item.type}`);
    console.log(`    Ref:  ${item.ref}`);
    console.log(`    Expected at: ${item.resolvedPath}`);
  }
}

/**
 * Prints file read errors, if any.
 * @param {string[]} errors - Array of error messages
 */
function printErrors(errors) {
  if (errors.length === 0) return;

  console.log('\n  File Read Errors:');
  console.log(`  ${'-'.repeat(66)}`);
  for (const err of errors) {
    console.log(`    ${err}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const jsonMode = process.argv.includes('--json');

  try {
    const result = await validateReferences(PROJECT_ROOT);

    if (jsonMode) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printSummary(result);
      printBrokenDetails(result.broken);
      printErrors(result.errors);

      if (result.brokenReferences > 0) {
        console.log(`\n  FAIL: ${result.brokenReferences} broken reference(s) found.\n`);
      } else {
        console.log('\n  OK: All references are valid.\n');
      }
    }

    process.exit(result.brokenReferences > 0 ? 1 : 0);
  } catch (err) {
    if (jsonMode) {
      console.log(JSON.stringify({ error: err.message }));
    } else {
      console.error('Reference validator failed:', err.message);
    }
    process.exit(2);
  }
}

main();
