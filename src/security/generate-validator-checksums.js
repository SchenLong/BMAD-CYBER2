#!/usr/bin/env node
/**
 * Validator Checksum Generator
 * Generates SHA256 checksums for all validator files to establish an integrity baseline.
 * Usage: node src/security/generate-validator-checksums.js
 */
import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { resolve, relative, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '../..');
const OUTPUT_FILE = join(__dirname, 'validator-checksums.json');

const VALIDATOR_PATHS = [
  '.claude/validators-node/bin',
  '.claude/validators-node/src',
  'src/security/validators',
  'src/automation/templates/validator',
  'src/package-management/dependency/validator',
  'src/utility/tools/installer/lib/validators',
  'src/utility/tools/installer/lib/core/dependency-validator.js',
];

function calculateSHA256(filePath) {
  const fileBuffer = readFileSync(filePath);
  const hashSum = createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function findJSFiles(dirPath, files = []) {
  if (!existsSync(dirPath)) return files;
  const stat = statSync(dirPath);
  if (stat.isFile()) {
    if (dirPath.endsWith('.js') || dirPath.endsWith('.mjs')) files.push(dirPath);
    return files;
  }
  if (!stat.isDirectory()) return files;
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const fullPath = join(dirPath, entry);
    const entryStat = statSync(fullPath);
    if (entryStat.isDirectory()) {
      findJSFiles(fullPath, files);
    } else if (entryStat.isFile() && (entry.endsWith('.js') || entry.endsWith('.mjs'))) {
      files.push(fullPath);
    }
  }
  return files;
}

function generateChecksums() {
  const files = {};
  let totalFiles = 0;
  for (const validatorPath of VALIDATOR_PATHS) {
    const fullPath = join(PROJECT_ROOT, validatorPath);
    const jsFiles = findJSFiles(fullPath, []);
    for (const file of jsFiles) {
      const relativePath = relative(PROJECT_ROOT, file);
      const hash = calculateSHA256(file);
      files[relativePath] = hash;
      totalFiles++;
    }
  }
  const sortedFiles = {};
  Object.keys(files).sort().forEach(key => {
    sortedFiles[key] = files[key];
  });
  return {
    generated: new Date().toISOString(),
    algorithm: 'sha256',
    version: '1.0.0',
    description: 'Integrity baseline for validator files',
    fileCount: totalFiles,
    files: sortedFiles
  };
}

console.log('Generating validator checksums...');
console.log('Project root: ' + PROJECT_ROOT);
const manifest = generateChecksums();
writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log('Generated checksums for ' + manifest.fileCount + ' validator files');
console.log('Manifest written to: ' + OUTPUT_FILE);
