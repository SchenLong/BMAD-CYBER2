/**
 * Agent Schema Validation Tests
 *
 * Tests for Zod schemas defined in tools/schema/agent.js and
 * the full agent validation pipeline in tools/validate-agent-schema.js.
 *
 * @module tests/schema/agent-schema
 */

import { describe, it, expect } from 'vitest';
import { agentFrontmatterSchema, agentManifestEntrySchema, agentCustomizeSchema } from '../../tools/schema/agent.js';
import { validateAgents } from '../../tools/validate-agent-schema.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract YAML frontmatter from markdown content.
 * Returns the parsed object or null if no frontmatter found.
 */
function extractFrontmatter(content) {
  const lines = content.split('\n');
  if (lines.length === 0 || lines[0].trim() !== '---') return null;

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
    return yaml.load(yamlBlock) || {};
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Agent Frontmatter Schema
// ---------------------------------------------------------------------------

describe('Agent Frontmatter Schema', () => {
  it('accepts valid kebab-case agent name', () => {
    const result = agentFrontmatterSchema.safeParse({
      name: 'test-agent',
      description: 'A valid test agent description',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name with spaces', () => {
    const result = agentFrontmatterSchema.safeParse({
      name: 'invalid agent',
      description: 'valid desc here',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name with uppercase', () => {
    const result = agentFrontmatterSchema.safeParse({
      name: 'InvalidAgent',
      description: 'valid desc here',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const result = agentFrontmatterSchema.safeParse({
      name: 'test-agent',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short description', () => {
    const result = agentFrontmatterSchema.safeParse({
      name: 'test',
      description: 'Hi',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Agent Manifest Entry Schema
// ---------------------------------------------------------------------------

describe('Agent Manifest Entry Schema', () => {
  const validEntry = {
    name: 'test-agent',
    displayName: 'Tester',
    title: 'Test Agent Title',
    icon: '\u{1F9EA}',
    role: 'Test Role Specialist',
    identity: 'A comprehensive test identity description',
    communicationStyle: 'Direct and clear communication',
    principles: '- Always test thoroughly - Verify all results',
    module: 'bmm',
    path: 'src/bmm/agents/test-agent.md',
  };

  it('accepts valid manifest entry', () => {
    const result = agentManifestEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('rejects invalid module name', () => {
    const result = agentManifestEntrySchema.safeParse({
      ...validEntry,
      module: 'invalid-module',
    });
    expect(result.success).toBe(false);
  });

  it('rejects path not starting with _bmad/', () => {
    const result = agentManifestEntrySchema.safeParse({
      ...validEntry,
      path: 'src/agents/test.md',
    });
    expect(result.success).toBe(false);
  });

  it('rejects path not ending with .md', () => {
    const result = agentManifestEntrySchema.safeParse({
      ...validEntry,
      path: 'src/bmm/agents/test.yaml',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = agentManifestEntrySchema.safeParse({
      name: 'test',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Agent Customize Schema
// ---------------------------------------------------------------------------

describe('Agent Customize Schema', () => {
  it('accepts empty object (all optional)', () => {
    const result = agentCustomizeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid customize with persona', () => {
    const result = agentCustomizeSchema.safeParse({
      persona: {
        role: 'Custom Role',
        identity: 'Custom identity',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts customize with menu items', () => {
    const result = agentCustomizeSchema.safeParse({
      menu: [
        {
          trigger: 'test-cmd',
          workflow: 'path/to/workflow.yaml',
          description: 'Test workflow',
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Agent Fixture Files - Valid
// ---------------------------------------------------------------------------

describe('Agent Fixture Files - Valid', () => {
  const validDir = path.resolve(__dirname, '..', 'fixtures', 'agent-schema', 'valid');

  it('validates all valid agent fixtures', () => {
    const files = fs.readdirSync(validDir).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(validDir, file), 'utf-8');
      const frontmatter = extractFrontmatter(content);
      expect(frontmatter, `Frontmatter extraction failed for ${file}`).not.toBeNull();

      const result = agentFrontmatterSchema.safeParse(frontmatter);
      expect(result.success, `Validation failed for valid fixture ${file}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });

  it('has at least 5 valid fixtures', () => {
    const files = fs.readdirSync(validDir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// 5. Agent Fixture Files - Invalid
// ---------------------------------------------------------------------------

describe('Agent Fixture Files - Invalid', () => {
  const invalidDir = path.resolve(__dirname, '..', 'fixtures', 'agent-schema', 'invalid');

  it('rejects all invalid agent fixtures', () => {
    const files = fs.readdirSync(invalidDir).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(invalidDir, file), 'utf-8');
      const frontmatter = extractFrontmatter(content);

      // If frontmatter extraction itself fails, that counts as invalid
      if (frontmatter === null) continue;

      const result = agentFrontmatterSchema.safeParse(frontmatter);
      expect(result.success, `Expected validation to FAIL for invalid fixture ${file}`).toBe(false);
    }
  });

  it('has at least 5 invalid fixtures', () => {
    const files = fs.readdirSync(invalidDir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// 6. Full Agent Validation (integration)
// ---------------------------------------------------------------------------

describe('Full Agent Validation (integration)', () => {
  it('validates all 80 agents from manifest', async () => {
    const result = await validateAgents();
    expect(result.total).toBe(80);
    expect(result.passed).toBe(80);
    expect(result.failed).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors array for tracking', async () => {
    const result = await validateAgents();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('errors');
  });
});
