#!/usr/bin/env node

/**
 * sync-version.js - Synchronize package.json version with release tag
 *
 * Usage: node sync-version.js <version>
 *
 * This script is used by the npm-publish workflow to ensure the package.json
 * version matches the GitHub release tag before publishing to npm.
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagePath = join(__dirname, '..', 'package.json');

const version = process.argv[2];

if (!version) {
  console.error('Usage: sync-version.js <version>');
  console.error('Example: sync-version.js 2.0.1');
  console.error('Example: sync-version.js v2.0.1-beta.1');
  process.exit(1);
}

// Remove 'v' prefix if present
const cleanVersion = version.replace(/^v/, '');

// Validate semver format (basic check)
const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
if (!semverRegex.test(cleanVersion)) {
  console.error(`Invalid version format: ${cleanVersion}`);
  console.error('Expected semver format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]');
  process.exit(1);
}

try {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
  const oldVersion = pkg.version;
  pkg.version = cleanVersion;

  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)  }\n`);
  console.log(`Version updated: ${oldVersion} -> ${pkg.version}`);
} catch (error) {
  console.error(`Failed to update version: ${error.message}`);
  process.exit(1);
}
