import { describe, it, expect } from 'vitest';
import {
  workflowYamlSchema,
  workflowMdFrontmatterSchema,
  workflowManifestEntrySchema,
  VALID_MODULES,
} from '../../tools/schema/workflow.js';
import { validateWorkflows } from '../../tools/validate-workflow-schema.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Workflow YAML Schema', () => {
  it('accepts valid workflow YAML', () => {
    const result = workflowYamlSchema.safeParse({
      name: 'test-workflow',
      description: 'A valid workflow description',
    });
    expect(result.success).toBe(true);
  });

  it('accepts workflow with boolean template', () => {
    const result = workflowYamlSchema.safeParse({
      name: 'test-wf',
      description: 'Valid workflow desc',
      template: false,
      standalone: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects name with spaces', () => {
    const result = workflowYamlSchema.safeParse({
      name: 'Invalid Name',
      description: 'valid desc here',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const result = workflowYamlSchema.safeParse({
      name: 'test-workflow',
    });
    expect(result.success).toBe(false);
  });
});

describe('Workflow MD Frontmatter Schema', () => {
  it('accepts valid frontmatter', () => {
    const result = workflowMdFrontmatterSchema.safeParse({
      name: 'test-workflow',
      description: 'A valid description for testing',
    });
    expect(result.success).toBe(true);
  });

  it('accepts frontmatter with version and web_bundle', () => {
    const result = workflowMdFrontmatterSchema.safeParse({
      name: 'test-wf',
      description: 'Valid desc here',
      version: '1.0.0',
      web_bundle: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid semver version', () => {
    const result = workflowMdFrontmatterSchema.safeParse({
      name: 'test-wf',
      description: 'Valid desc here',
      version: 'not-a-version',
    });
    expect(result.success).toBe(false);
  });
});

describe('Workflow Manifest Entry Schema', () => {
  it('accepts valid manifest entry', () => {
    const result = workflowManifestEntrySchema.safeParse({
      name: 'test-workflow',
      description: 'A valid workflow description',
      module: 'cybersec-team',
      path: 'src/cybersec-team/workflows/test/workflow.md',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid module', () => {
    const result = workflowManifestEntrySchema.safeParse({
      name: 'test-workflow',
      description: 'A valid workflow description',
      module: 'nonexistent',
      path: 'src/cybersec-team/workflows/test/workflow.md',
    });
    expect(result.success).toBe(false);
  });

  it('rejects path not starting with _bmad/', () => {
    const result = workflowManifestEntrySchema.safeParse({
      name: 'test-workflow',
      description: 'A valid workflow description',
      module: 'cybersec-team',
      path: 'src/test.yaml',
    });
    expect(result.success).toBe(false);
  });
});

describe('VALID_MODULES constant', () => {
  it('exports all 9 valid module names', () => {
    const expectedModules = [
      'core',
      'bmm',
      'bmb',
      'bmgd',
      'cis',
      'cybersec-team',
      'intel-team',
      'legal-team',
      'strategy-team',
    ];
    expect(VALID_MODULES).toHaveLength(9);
    for (const mod of expectedModules) {
      expect(VALID_MODULES).toContain(mod);
    }
  });
});

describe('Full Workflow Validation (integration)', () => {
  it('validates all 139 workflows from manifest', async () => {
    const result = await validateWorkflows();
    expect(result.total).toBe(139);
    expect(result.passed).toBe(139);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('returns structured result object', async () => {
    const result = await validateWorkflows();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('errors');
  });
});
