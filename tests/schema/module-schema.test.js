/**
 * Module Schema Validation Tests
 *
 * Tests for Zod schemas defined in tools/schema/module.js and
 * the full module validation pipeline in tools/validate-module-schema.js.
 *
 * @module tests/schema/module-schema
 */

import { describe, it, expect } from 'vitest';
import {
  moduleYamlSchema,
  staticConfigFieldSchema,
  interactiveConfigFieldSchema,
  configFieldSchema,
  moduleHelpEntrySchema,
  VALID_MODULES,
  REQUIRED_CONFIG_KEYS,
} from '../../tools/schema/module.js';
import { validateModules } from '../../tools/validate-module-schema.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a CSV line (double-quoted fields).
 */
function parseCsvLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let inner = trimmed;
  if (inner.startsWith('"') && inner.endsWith('"')) {
    inner = inner.slice(1, -1);
  }
  return inner.split('","');
}

/**
 * Check that a parsed module YAML has all required config keys.
 * Returns array of missing keys.
 */
function findMissingConfigKeys(parsed) {
  const missing = [];
  for (const key of REQUIRED_CONFIG_KEYS) {
    const val = parsed[key];
    if (val === undefined || typeof val !== 'object' || val === null || !val.result) {
      missing.push(key);
    }
  }
  return missing;
}

// ---------------------------------------------------------------------------
// 1. Module YAML Schema - Unit Tests
// ---------------------------------------------------------------------------

describe('Module YAML Schema', () => {
  const validModule = {
    code: 'test-module',
    name: 'Test Module Name',
    default_selected: false,
    prompt: ['Test Module Installation', 'A basic test module.'],
  };

  it('accepts valid module with all required fields', () => {
    const result = moduleYamlSchema.safeParse(validModule);
    expect(result.success).toBe(true);
  });

  it('accepts module with required=true', () => {
    const result = moduleYamlSchema.safeParse({
      ...validModule,
      required: true,
    });
    expect(result.success).toBe(true);
  });

  it('allows passthrough of additional fields', () => {
    const result = moduleYamlSchema.safeParse({
      ...validModule,
      module_code: { result: 'test-module' },
      extra_field: { result: 'value' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects module code with spaces', () => {
    const result = moduleYamlSchema.safeParse({
      ...validModule,
      code: 'bad module',
    });
    expect(result.success).toBe(false);
  });

  it('rejects module code with uppercase', () => {
    const result = moduleYamlSchema.safeParse({
      ...validModule,
      code: 'BadModule',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name: _, ...noName } = validModule;
    const result = moduleYamlSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('rejects missing default_selected', () => {
    const { default_selected: _, ...noDefault } = validModule;
    const result = moduleYamlSchema.safeParse(noDefault);
    expect(result.success).toBe(false);
  });

  it('rejects empty prompt array', () => {
    const result = moduleYamlSchema.safeParse({
      ...validModule,
      prompt: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing prompt', () => {
    const { prompt: _, ...noPrompt } = validModule;
    const result = moduleYamlSchema.safeParse(noPrompt);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Static Config Field Schema
// ---------------------------------------------------------------------------

describe('Static Config Field Schema', () => {
  it('accepts valid static field', () => {
    const result = staticConfigFieldSchema.safeParse({ result: 'some-value' });
    expect(result.success).toBe(true);
  });

  it('accepts static field with extra keys (passthrough)', () => {
    const result = staticConfigFieldSchema.safeParse({ result: 'value', extra: 'data' });
    expect(result.success).toBe(true);
  });

  it('rejects empty result', () => {
    const result = staticConfigFieldSchema.safeParse({ result: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing result', () => {
    const result = staticConfigFieldSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Interactive Config Field Schema
// ---------------------------------------------------------------------------

describe('Interactive Config Field Schema', () => {
  const validField = {
    prompt: 'Where should artifacts be saved?',
    default: '_bmad-output/test',
    result: '{project-root}/{value}',
  };

  it('accepts valid interactive field', () => {
    const result = interactiveConfigFieldSchema.safeParse(validField);
    expect(result.success).toBe(true);
  });

  it('accepts interactive field with single-select (passthrough)', () => {
    const result = interactiveConfigFieldSchema.safeParse({
      ...validField,
      'single-select': [{ value: 'opt1', label: 'Option 1' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing prompt', () => {
    const { prompt: _, ...noPrompt } = validField;
    const result = interactiveConfigFieldSchema.safeParse(noPrompt);
    expect(result.success).toBe(false);
  });

  it('rejects missing default', () => {
    const { default: _, ...noDefault } = validField;
    const result = interactiveConfigFieldSchema.safeParse(noDefault);
    expect(result.success).toBe(false);
  });

  it('rejects missing result', () => {
    const { result: _, ...noResult } = validField;
    const result = interactiveConfigFieldSchema.safeParse(noResult);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Generic Config Field Schema (union)
// ---------------------------------------------------------------------------

describe('Config Field Schema (union)', () => {
  it('accepts static field', () => {
    const result = configFieldSchema.safeParse({ result: 'value' });
    expect(result.success).toBe(true);
  });

  it('accepts interactive field', () => {
    const result = configFieldSchema.safeParse({
      prompt: 'Question?',
      default: 'val',
      result: '{value}',
    });
    expect(result.success).toBe(true);
  });

  it('rejects object without result', () => {
    const result = configFieldSchema.safeParse({ prompt: 'Q?', default: 'val' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Module Help Entry Schema
// ---------------------------------------------------------------------------

describe('Module Help Entry Schema', () => {
  const validEntry = {
    code: 'bmm',
    name: 'BMAD Method',
    version: '6.0.0',
    agents: 10,
    workflows: 33,
    domain: 'Software development lifecycle',
  };

  it('accepts valid help entry', () => {
    const result = moduleHelpEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('coerces string numbers to integers', () => {
    const result = moduleHelpEntrySchema.safeParse({
      ...validEntry,
      agents: '10',
      workflows: '33',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid module code', () => {
    const result = moduleHelpEntrySchema.safeParse({
      ...validEntry,
      code: 'invalid-module',
    });
    expect(result.success).toBe(false);
  });

  it('rejects bad version format', () => {
    const result = moduleHelpEntrySchema.safeParse({
      ...validEntry,
      version: 'abc',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Module Fixture Files - Valid
// ---------------------------------------------------------------------------

describe('Module Fixture Files - Valid', () => {
  const validDir = path.resolve(__dirname, '..', 'fixtures', 'module-schema', 'valid');

  it('validates all valid module fixtures', () => {
    const files = fs.readdirSync(validDir).filter((f) => f.endsWith('.yaml'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(validDir, file), 'utf-8');
      const parsed = yaml.load(content);
      expect(parsed, `YAML parse failed for ${file}`).not.toBeNull();

      const result = moduleYamlSchema.safeParse(parsed);
      expect(
        result.success,
        `Validation failed for valid fixture ${file}: ${JSON.stringify(result.error?.issues)}`,
      ).toBe(true);
    }
  });

  it('has at least 3 valid fixtures', () => {
    const files = fs.readdirSync(validDir).filter((f) => f.endsWith('.yaml'));
    expect(files.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 7. Module Fixture Files - Invalid
// ---------------------------------------------------------------------------

describe('Module Fixture Files - Invalid', () => {
  const invalidDir = path.resolve(__dirname, '..', 'fixtures', 'module-schema', 'invalid');

  it('rejects all invalid module fixtures', () => {
    const files = fs.readdirSync(invalidDir).filter((f) => f.endsWith('.yaml'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(invalidDir, file), 'utf-8');
      const parsed = yaml.load(content);

      if (parsed === null || parsed === undefined) continue;

      const result = moduleYamlSchema.safeParse(parsed);
      expect(
        result.success,
        `Expected validation to FAIL for invalid fixture ${file}`,
      ).toBe(false);
    }
  });

  it('has at least 3 invalid fixtures', () => {
    const files = fs.readdirSync(invalidDir).filter((f) => f.endsWith('.yaml'));
    expect(files.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 8. Required Config Keys Validation
// ---------------------------------------------------------------------------

describe('Required Config Keys Validation', () => {
  it('detects missing required config keys', () => {
    const parsed = {
      code: 'test',
      name: 'Test',
      default_selected: false,
      prompt: ['Test'],
      // missing module_code, module_version, agents_path, workflows_path
    };
    const missing = findMissingConfigKeys(parsed);
    expect(missing).toEqual(REQUIRED_CONFIG_KEYS);
  });

  it('passes when all required config keys present', () => {
    const parsed = {
      code: 'test',
      name: 'Test',
      default_selected: false,
      prompt: ['Test'],
      module_code: { result: 'test' },
      module_version: { result: '1.0.0' },
      agents_path: { result: '/path/to/agents' },
      workflows_path: { result: '/path/to/workflows' },
    };
    const missing = findMissingConfigKeys(parsed);
    expect(missing).toHaveLength(0);
  });

  it('detects config key without result', () => {
    const parsed = {
      code: 'test',
      name: 'Test',
      default_selected: false,
      prompt: ['Test'],
      module_code: { result: 'test' },
      module_version: { result: '1.0.0' },
      agents_path: 'not-an-object',
      workflows_path: { result: '/path' },
    };
    const missing = findMissingConfigKeys(parsed);
    expect(missing).toContain('agents_path');
  });

  it('REQUIRED_CONFIG_KEYS has 4 entries', () => {
    expect(REQUIRED_CONFIG_KEYS).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// 9. VALID_MODULES constant
// ---------------------------------------------------------------------------

describe('VALID_MODULES constant', () => {
  it('has exactly 9 modules', () => {
    expect(VALID_MODULES).toHaveLength(9);
  });

  it('includes all expected module codes', () => {
    const expected = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    for (const code of expected) {
      expect(VALID_MODULES).toContain(code);
    }
  });
});

// ---------------------------------------------------------------------------
// 10. Full Module Validation (integration)
// ---------------------------------------------------------------------------

describe('Full Module Validation (integration)', () => {
  it('validates all 9 modules from filesystem', async () => {
    const result = await validateModules();
    expect(result.total).toBe(9);
    expect(result.passed).toBe(9);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('returns proper result structure', async () => {
    const result = await validateModules();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('errors');
  });
});

// ---------------------------------------------------------------------------
// 11. Module-Help CSV Validation (integration)
// ---------------------------------------------------------------------------

describe('Module-Help CSV Validation (integration)', () => {
  const csvPath = path.join(PROJECT_ROOT, '_bmad', '_config', 'module-help.csv');

  it('module-help.csv exists', () => {
    expect(fs.existsSync(csvPath)).toBe(true);
  });

  it('module-help.csv has entries for all 9 modules', () => {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    // 1 header + 9 data rows
    expect(lines.length).toBe(10);
  });

  it('all module-help.csv entries pass schema validation', () => {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    const headers = lines[0].trim().split(',');

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (!fields) continue;

      const entry = {};
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = fields[j] !== undefined ? fields[j] : '';
      }

      const result = moduleHelpEntrySchema.safeParse(entry);
      expect(
        result.success,
        `CSV row ${i} (${entry.code}) failed: ${JSON.stringify(result.error?.issues)}`,
      ).toBe(true);
    }
  });

  it('module-help.csv codes match VALID_MODULES', () => {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    const headers = lines[0].trim().split(',');

    const csvCodes = new Set();
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (!fields) continue;
      const entry = {};
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = fields[j] !== undefined ? fields[j] : '';
      }
      csvCodes.add(entry.code);
    }

    for (const code of VALID_MODULES) {
      expect(csvCodes.has(code), `Module "${code}" missing from CSV`).toBe(true);
    }
  });
});
