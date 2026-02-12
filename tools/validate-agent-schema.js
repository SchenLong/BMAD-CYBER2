/**
 * validate-agent-schema.js
 *
 * Validates all agent definitions against Zod schemas.
 * - Loads agent-manifest.csv and validates each entry against agentManifestEntrySchema
 * - Checks that referenced agent .md files exist on disk
 * - Extracts YAML frontmatter from each .md file and validates against agentFrontmatterSchema
 * - Checks consistency between manifest name and frontmatter name
 *
 * Usage:
 *   node tools/validate-agent-schema.js
 *
 * Exit codes:
 *   0 = all validations passed
 *   1 = one or more validations failed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { safeYamlLoad } from '../src/utility/safe-yaml.js';
import { agentFrontmatterSchema, agentManifestEntrySchema } from './schema/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const MANIFEST_PATH = path.join(PROJECT_ROOT, '_bmad', '_config', 'agent-manifest.csv');

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

/**
 * Parse a single CSV line where fields are double-quoted.
 * Handles commas inside quoted fields and HTML entities within quotes.
 *
 * Expected format per line (after the header):
 *   "field1","field2","field3, with comma","field4"
 *
 * Strategy:
 *   1. Strip leading/trailing whitespace.
 *   2. Remove the leading `"` and trailing `"` of the whole line.
 *   3. Split on `","` — the quote-comma-quote boundary between fields.
 */
function parseCsvLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Remove outermost quotes
  let inner = trimmed;
  if (inner.startsWith('"') && inner.endsWith('"')) {
    inner = inner.slice(1, -1);
  }

  // Split on the field boundary: ","
  const fields = inner.split('","');
  return fields;
}

/**
 * Parse the full CSV file into an array of objects keyed by header columns.
 */
function parseManifestCsv(content) {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Header line is NOT quoted in this CSV — it's plain:
  // name,displayName,title,icon,role,identity,communicationStyle,principles,module,path
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
// YAML frontmatter extraction
// ---------------------------------------------------------------------------

/**
 * Extract YAML frontmatter from a markdown file.
 * Frontmatter sits between the first `---` and the second `---`.
 * Returns the parsed object, or null if no frontmatter found.
 */
function extractFrontmatter(content) {
  const lines = content.split('\n');
  if (lines.length === 0) return null;

  // First line must be `---`
  if (lines[0].trim() !== '---') return null;

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) return null;

  const yamlBlock = lines.slice(1, endIndex).join('\n');
  try {
    return safeYamlLoad(yamlBlock) || {};
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Validation logic
// ---------------------------------------------------------------------------

/**
 * Validate all agents from the manifest.
 *
 * @returns {{ total: number, passed: number, failed: number, errors: Array<{agent: string, field: string, message: string}> }}
 */
export async function validateAgents() {
  const errors = [];
  let total = 0;
  let passed = 0;
  let failed = 0;

  // 1. Load manifest
  if (!fs.existsSync(MANIFEST_PATH)) {
    return {
      total: 0,
      passed: 0,
      failed: 1,
      errors: [{ agent: '(manifest)', field: 'file', message: `Manifest not found: ${MANIFEST_PATH}` }],
    };
  }

  const csvContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const entries = parseManifestCsv(csvContent);

  for (const entry of entries) {
    const agentName = entry.name || '(unknown)';
    total++;
    let agentHasError = false;

    // 2. Validate manifest entry against schema
    const manifestResult = agentManifestEntrySchema.safeParse(entry);
    if (!manifestResult.success) {
      agentHasError = true;
      for (const issue of manifestResult.error.issues) {
        errors.push({
          agent: agentName,
          field: issue.path.join('.'),
          message: `Manifest validation: ${issue.message}`,
        });
      }
    }

    // 3. Check that the referenced file exists
    const agentFilePath = path.join(PROJECT_ROOT, entry.path || '');
    if (!entry.path || !fs.existsSync(agentFilePath)) {
      agentHasError = true;
      errors.push({
        agent: agentName,
        field: 'path',
        message: `Referenced file does not exist: ${entry.path || '(empty)'}`,
      });
    } else {
      // 4. Read and validate frontmatter
      const fileContent = fs.readFileSync(agentFilePath, 'utf-8');
      const frontmatter = extractFrontmatter(fileContent);

      if (frontmatter === null) {
        agentHasError = true;
        errors.push({
          agent: agentName,
          field: 'frontmatter',
          message: `No valid YAML frontmatter found in ${entry.path}`,
        });
      } else {
        const fmResult = agentFrontmatterSchema.safeParse(frontmatter);
        if (!fmResult.success) {
          agentHasError = true;
          for (const issue of fmResult.error.issues) {
            errors.push({
              agent: agentName,
              field: `frontmatter.${issue.path.join('.')}`,
              message: issue.message,
            });
          }
        }

        // 5. Consistency check: frontmatter name should match manifest name
        if (frontmatter.name !== undefined && entry.name !== undefined) {
          const fmName = String(frontmatter.name).trim().toLowerCase();
          const manifestName = String(entry.name).trim().toLowerCase();
          if (fmName !== manifestName) {
            agentHasError = true;
            errors.push({
              agent: agentName,
              field: 'name',
              message: `Name mismatch: manifest="${entry.name}" vs frontmatter="${frontmatter.name}"`,
            });
          }
        }
      }
    }

    if (agentHasError) {
      failed++;
    } else {
      passed++;
    }
  }

  return { total, passed, failed, errors };
}

// ---------------------------------------------------------------------------
// CLI runner
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Agent Schema Validation ===\n');
  console.log(`Manifest: ${MANIFEST_PATH}\n`);

  const result = await validateAgents();

  // Print errors
  if (result.errors.length > 0) {
    console.log('FAILURES:\n');
    for (const err of result.errors) {
      console.log(`  [${err.agent}] ${err.field}: ${err.message}`);
    }
    console.log('');
  }

  // Print summary
  console.log('--- Summary ---');
  console.log(`  Total agents:  ${result.total}`);
  console.log(`  Passed:        ${result.passed}`);
  console.log(`  Failed:        ${result.failed}`);
  console.log(`  Errors:        ${result.errors.length}`);

  if (result.failed > 0) {
    process.exit(1);
  } else {
    console.log('\nAll agent validations passed.');
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
