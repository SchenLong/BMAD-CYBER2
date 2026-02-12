/**
 * Validator Integrity Verifier
 * Verifies SHA256 checksums of validator files against the baseline manifest.
 * Usage: node src/security/verify-validators.js
 * Exit codes: 0 = all files verified, 1 = tampering detected or error
 */
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '../..');
const MANIFEST_FILE = join(__dirname, 'validator-checksums.json');

function calculateSHA256(filePath) {
  const fileBuffer = readFileSync(filePath);
  const hashSum = createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function verifyIntegrity() {
  console.log('Validator Integrity Verification');
  console.log('================================');
  console.log('');

  if (!existsSync(MANIFEST_FILE)) {
    console.error(`ERROR: Manifest file not found: ${  MANIFEST_FILE}`);
    console.error('Run generate-validator-checksums.js first to create baseline.');
    return { success: false, verified: 0, missing: [], modified: [] };
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
  } catch (e) {
    console.error(`ERROR: Failed to parse manifest file: ${  e.message}`);
    return { success: false, verified: 0, missing: [], modified: [] };
  }

  console.log(`Manifest generated: ${  manifest.generated}`);
  console.log(`Algorithm: ${  manifest.algorithm}`);
  console.log(`Files in baseline: ${  manifest.fileCount}`);
  console.log('');

  const results = {
    success: true,
    verified: 0,
    missing: [],
    modified: []
  };

  const files = manifest.files;
  const filePaths = Object.keys(files);
  
  for (const relativePath of filePaths) {
    const expectedHash = files[relativePath];
    const fullPath = join(PROJECT_ROOT, relativePath);

    if (!existsSync(fullPath)) {
      results.missing.push(relativePath);
      results.success = false;
    } else {
      const actualHash = calculateSHA256(fullPath);
      if (actualHash !== expectedHash) {
        results.modified.push({
          file: relativePath,
          expected: expectedHash,
          actual: actualHash
        });
        results.success = false;
      } else {
        results.verified++;
      }
    }
  }

  return results;
}

function printResults(results) {
  if (results.verified > 0) {
    console.log(`VERIFIED: ${  results.verified  } file(s) match baseline`);
  }

  if (results.missing.length > 0) {
    console.log('');
    console.log(`MISSING FILES (${  results.missing.length  }):`);
    for (const file of results.missing) {
      console.log(`  - ${  file}`);
    }
  }

  if (results.modified.length > 0) {
    console.log('');
    console.log(`MODIFIED FILES (${  results.modified.length  }):`);
    for (const mod of results.modified) {
      console.log(`  - ${  mod.file}`);
      console.log(`    Expected: ${  mod.expected}`);
      console.log(`    Actual:   ${  mod.actual}`);
    }
  }

  console.log('');
  if (results.success) {
    console.log('STATUS: PASS - All validator files verified');
  } else {
    console.log('STATUS: FAIL - Integrity check failed!');
    console.log('');
    console.log('SECURITY ALERT: Validator tampering detected.');
    console.log('Review the changes above and investigate the cause.');
    console.log('If changes are legitimate, regenerate the baseline with:');
    console.log('  node src/security/generate-validator-checksums.js');
  }
}

// Export for testing
export { verifyIntegrity, printResults };

// Only run main when executed directly (not imported by tests)
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) {
  const results = verifyIntegrity();
  printResults(results);
  process.exit(results.success ? 0 : 1);
}
