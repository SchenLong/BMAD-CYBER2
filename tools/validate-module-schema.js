/**
 * validate-module-schema.js
 *
 * Validates all module definitions against Zod schemas.
 * - Discovers module.yaml files in _bmad/{module}/module.yaml
 * - Validates each against moduleYamlSchema
 * - Checks required configuration fields exist and have valid structure
 * - Checks consistency between code field and directory name
 * - Validates module-help.csv entries against moduleHelpEntrySchema
 *
 * Usage:
 *   node tools/validate-module-schema.js
 *
 * Exit codes:
 *   0 = all validations passed
 *   1 = one or more validations failed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { safeYamlLoad } from '../src/utility/safe-yaml.js';
import {
  configFieldSchema,
  moduleHelpEntrySchema,
  moduleYamlSchema,
  REQUIRED_CONFIG_KEYS,
  VALID_MODULES,
} from './schema/module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const BMAD_DIR = path.join(PROJECT_ROOT, '_bmad');
const MODULE_HELP_CSV = path.join(PROJECT_ROOT, '_bmad', '_config', 'module-help.csv');

/** Directories under _bmad/ that are NOT modules */
const EXCLUDED_DIRS = ['_compact', '_config', '_memory', 'framework'];

// ---------------------------------------------------------------------------
// Module discovery
// ---------------------------------------------------------------------------

/**
 * Discover all module.yaml files under _bmad/ and src/.
 * Post-migration, modules live in src/; _bmad/ kept for backward compatibility.
 * Returns array of { dir, yamlPath, dirName }.
 */
function discoverModules() {
  const modules = [];
  const seen = new Set();
  const SRC_DIR = path.join(PROJECT_ROOT, 'src');

  // Scan both _bmad/ and src/ directories
  for (const baseDir of [BMAD_DIR, SRC_DIR]) {
    if (!fs.existsSync(baseDir)) continue;

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (EXCLUDED_DIRS.includes(entry.name)) continue;
      if (entry.name.startsWith('_')) continue;
      if (seen.has(entry.name)) continue;

      const yamlPath = path.join(baseDir, entry.name, 'module.yaml');
      if (fs.existsSync(yamlPath)) {
        modules.push({
          dir: path.join(baseDir, entry.name),
          yamlPath,
          dirName: entry.name,
        });
        seen.add(entry.name);
      }
    }
  }

  return modules;
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

/**
 * Parse a single CSV line where fields are double-quoted.
 * Handles commas inside quoted fields.
 */
function parseCsvLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let inner = trimmed;
  if (inner.startsWith('"') && inner.endsWith('"')) {
    inner = inner.slice(1, -1);
  }

  const fields = inner.split('","');
  return fields;
}

/**
 * Parse the full CSV file into an array of objects keyed by header columns.
 */
function parseHelpCsv(content) {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headerLine = lines[0].trim();
  const headers = headerLine.split(',');

  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (!fields) continue;

    const entry = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = fields[j] !== undefined ? fields[j] : '';
    }
    entries.push(entry);
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Validation logic
// ---------------------------------------------------------------------------

/**
 * Validate all modules from the filesystem.
 *
 * @returns {{ total: number, passed: number, failed: number, errors: Array<{module: string, field: string, message: string}> }}
 */
export async function validateModules() {
  const errors = [];
  let total = 0;
  let passed = 0;
  let failed = 0;

  // 1. Discover modules
  const modules = discoverModules();

  for (const mod of modules) {
    const moduleName = mod.dirName;
    total++;
    let moduleHasError = false;

    // 2. Parse YAML
    let parsed;
    try {
      const content = fs.readFileSync(mod.yamlPath, 'utf-8');
      parsed = safeYamlLoad(content);
    } catch (err) {
      moduleHasError = true;
      errors.push({
        module: moduleName,
        field: 'yaml',
        message: `Failed to parse YAML: ${err.message}`,
      });
    }

    if (!parsed) {
      if (!moduleHasError) {
        moduleHasError = true;
        errors.push({
          module: moduleName,
          field: 'yaml',
          message: 'YAML parsed to null/undefined',
        });
      }
      failed++;
      continue;
    }

    // 3. Validate top-level schema
    const schemaResult = moduleYamlSchema.safeParse(parsed);
    if (!schemaResult.success) {
      moduleHasError = true;
      for (const issue of schemaResult.error.issues) {
        errors.push({
          module: moduleName,
          field: issue.path.join('.'),
          message: `Schema validation: ${issue.message}`,
        });
      }
    }

    // 4. Check required config keys
    for (const key of REQUIRED_CONFIG_KEYS) {
      const fieldValue = parsed[key];
      if (fieldValue === undefined) {
        moduleHasError = true;
        errors.push({
          module: moduleName,
          field: key,
          message: `Required configuration field "${key}" is missing`,
        });
      } else if (typeof fieldValue !== 'object' || fieldValue === null) {
        moduleHasError = true;
        errors.push({
          module: moduleName,
          field: key,
          message: `Configuration field "${key}" must be an object with a "result" key`,
        });
      } else {
        const cfgResult = configFieldSchema.safeParse(fieldValue);
        if (!cfgResult.success) {
          moduleHasError = true;
          errors.push({
            module: moduleName,
            field: `${key}.result`,
            message: `Config field validation: ${cfgResult.error.issues.map((i) => i.message).join(', ')}`,
          });
        }
      }
    }

    // 5. Consistency check: code matches directory name
    if (parsed.code !== undefined && parsed.code !== moduleName) {
      moduleHasError = true;
      errors.push({
        module: moduleName,
        field: 'code',
        message: `Code mismatch: code="${parsed.code}" vs directory="${moduleName}"`,
      });
    }

    // 6. Consistency check: module_code.result matches top-level code
    if (
      parsed.code !== undefined &&
      parsed.module_code !== undefined &&
      typeof parsed.module_code === 'object' &&
      parsed.module_code.result !== undefined
    ) {
      if (parsed.module_code.result !== parsed.code) {
        moduleHasError = true;
        errors.push({
          module: moduleName,
          field: 'module_code',
          message: `module_code.result="${parsed.module_code.result}" does not match code="${parsed.code}"`,
        });
      }
    }

    if (moduleHasError) {
      failed++;
    } else {
      passed++;
    }
  }

  // 7. Validate module-help.csv if it exists
  if (fs.existsSync(MODULE_HELP_CSV)) {
    const csvContent = fs.readFileSync(MODULE_HELP_CSV, 'utf-8');
    const csvEntries = parseHelpCsv(csvContent);

    for (const entry of csvEntries) {
      const entryCode = entry.code || '(unknown)';
      const csvResult = moduleHelpEntrySchema.safeParse(entry);
      if (!csvResult.success) {
        errors.push({
          module: `csv:${entryCode}`,
          field: 'module-help.csv',
          message: csvResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '),
        });
      }
    }

    // Check all VALID_MODULES have a CSV entry
    const csvCodes = new Set(csvEntries.map((e) => e.code));
    for (const code of VALID_MODULES) {
      if (!csvCodes.has(code)) {
        errors.push({
          module: `csv:${code}`,
          field: 'module-help.csv',
          message: `Module "${code}" missing from module-help.csv`,
        });
      }
    }
  }

  return { total, passed, failed, errors };
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Module Schema Validation ===\n');
  console.log(`Scanning: ${BMAD_DIR}\n`);

  const result = await validateModules();

  // Print errors
  if (result.errors.length > 0) {
    console.log('FAILURES:\n');
    for (const err of result.errors) {
      console.log(`  [${err.module}] ${err.field}: ${err.message}`);
    }
    console.log('');
  }

  // Print summary
  console.log('--- Summary ---');
  console.log(`  Total modules: ${result.total}`);
  console.log(`  Passed:        ${result.passed}`);
  console.log(`  Failed:        ${result.failed}`);
  console.log(`  Errors:        ${result.errors.length}`);

  if (result.failed > 0 || result.errors.length > 0) {
    process.exit(1);
  } else {
    console.log('\nAll module validations passed.');
    process.exit(0);
  }
}

// Run when executed directly
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
