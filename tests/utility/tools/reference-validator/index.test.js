/**
 * Unit Tests for Cross-File Reference Validator - Task 0.2
 *
 * Tests reference extraction, URL filtering, and validation logic.
 *
 * @module reference-validator/index.test
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  extractReferences,
  isUrlOrAnchor,
  isLocalFileRef,
  findFiles,
  validateReferences,
  resolveReference,
} from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 4 levels up from tests/utility/tools/reference-validator/
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// ============================================================================
// Tests: isUrlOrAnchor
// ============================================================================

describe('Cross-File Reference Validator - Task 0.2', () => {
  describe('isUrlOrAnchor', () => {
    it('should identify HTTP URLs', () => {
      expect(isUrlOrAnchor('http://example.com')).toBe(true);
      expect(isUrlOrAnchor('https://example.com/path/file.md')).toBe(true);
      expect(isUrlOrAnchor('https://github.com/org/repo/blob/main/README.md')).toBe(true);
    });

    it('should identify anchor-only links', () => {
      expect(isUrlOrAnchor('#section')).toBe(true);
      expect(isUrlOrAnchor('#overview')).toBe(true);
      expect(isUrlOrAnchor('#')).toBe(true);
    });

    it('should identify mailto links', () => {
      expect(isUrlOrAnchor('mailto:test@example.com')).toBe(true);
    });

    it('should identify data URIs', () => {
      expect(isUrlOrAnchor('data:image/png;base64,abc')).toBe(true);
    });

    it('should NOT flag relative file paths', () => {
      expect(isUrlOrAnchor('./file.md')).toBe(false);
      expect(isUrlOrAnchor('../other/file.md')).toBe(false);
      expect(isUrlOrAnchor('docs/README.md')).toBe(false);
      expect(isUrlOrAnchor('workflow.md')).toBe(false);
    });

    it('should handle null/undefined/empty gracefully', () => {
      expect(isUrlOrAnchor(null)).toBe(true);
      expect(isUrlOrAnchor(undefined)).toBe(true);
      expect(isUrlOrAnchor('')).toBe(true);
    });
  });

  // ============================================================================
  // Tests: isLocalFileRef
  // ============================================================================

  describe('isLocalFileRef', () => {
    it('should accept relative .md file paths', () => {
      expect(isLocalFileRef('./file.md')).toBe(true);
      expect(isLocalFileRef('../other/file.md')).toBe(true);
      expect(isLocalFileRef('docs/README.md')).toBe(true);
    });

    it('should accept .yaml and .yml file paths', () => {
      expect(isLocalFileRef('./config.yaml')).toBe(true);
      expect(isLocalFileRef('settings.yml')).toBe(true);
    });

    it('should reject URLs', () => {
      expect(isLocalFileRef('https://example.com/file.md')).toBe(false);
      expect(isLocalFileRef('http://example.com/doc.yaml')).toBe(false);
    });

    it('should reject anchor-only links', () => {
      expect(isLocalFileRef('#section-name')).toBe(false);
    });

    it('should reject non-md/yaml files', () => {
      expect(isLocalFileRef('./image.png')).toBe(false);
      expect(isLocalFileRef('./script.js')).toBe(false);
      expect(isLocalFileRef('./data.json')).toBe(false);
    });

    it('should handle paths with anchors (strip anchor, keep file)', () => {
      expect(isLocalFileRef('file.md#section')).toBe(true);
      expect(isLocalFileRef('./doc.md#heading')).toBe(true);
    });
  });

  // ============================================================================
  // Tests: extractReferences
  // ============================================================================

  describe('extractReferences', () => {
    it('should extract workflow: references', () => {
      const content = 'workflow: path/to/workflow.md\n';
      const refs = extractReferences(content, 'test.yaml');
      expect(refs).toHaveLength(1);
      expect(refs[0]).toEqual({
        ref: 'path/to/workflow.md',
        type: 'workflow',
        line: 1,
      });
    });

    it('should extract agent: references', () => {
      const content = 'agent: agents/dev-agent.md\n';
      const refs = extractReferences(content, 'test.yaml');
      expect(refs).toHaveLength(1);
      expect(refs[0]).toEqual({
        ref: 'agents/dev-agent.md',
        type: 'agent',
        line: 1,
      });
    });

    it('should extract quoted workflow/agent references', () => {
      const content = `workflow: "path/to/workflow.md"\nagent: 'agents/dev.md'\n`;
      const refs = extractReferences(content, 'test.yaml');
      expect(refs).toHaveLength(2);
      expect(refs[0].ref).toBe('path/to/workflow.md');
      expect(refs[1].ref).toBe('agents/dev.md');
    });

    it('should extract markdown link references to local files', () => {
      const content = 'See [the guide](./docs/guide.md) for details.\n';
      const refs = extractReferences(content, 'README.md');
      expect(refs).toHaveLength(1);
      expect(refs[0]).toEqual({
        ref: './docs/guide.md',
        type: 'markdown-link',
        line: 1,
      });
    });

    it('should NOT extract markdown links to URLs', () => {
      const content = 'See [GitHub](https://github.com/org/repo) for source.\n';
      const refs = extractReferences(content, 'README.md');
      expect(refs).toHaveLength(0);
    });

    it('should NOT extract anchor-only markdown links', () => {
      const content = 'See [Section](#overview) above.\n';
      const refs = extractReferences(content, 'README.md');
      expect(refs).toHaveLength(0);
    });

    it('should NOT extract markdown links to non-md/yaml files', () => {
      const content = 'See [image](./logo.png) and [script](./app.js).\n';
      const refs = extractReferences(content, 'README.md');
      expect(refs).toHaveLength(0);
    });

    it('should strip anchors from markdown link file paths', () => {
      const content = 'See [section](./guide.md#section-2) here.\n';
      const refs = extractReferences(content, 'README.md');
      expect(refs).toHaveLength(1);
      expect(refs[0].ref).toBe('./guide.md');
    });

    it('should extract multiple references from one file', () => {
      const content = [
        'workflow: workflow-a.md',
        'agent: agent-b.md',
        'See [docs](./docs/help.md) and [config](./config.yaml).',
        'Also see [GitHub](https://github.com) and [section](#foo).',
      ].join('\n');
      const refs = extractReferences(content, 'test.md');
      expect(refs).toHaveLength(4);
      const types = refs.map((r) => r.type);
      expect(types).toContain('workflow');
      expect(types).toContain('agent');
      expect(types).toContain('markdown-link');
    });

    it('should report correct line numbers', () => {
      const content = 'line 1\nworkflow: test.md\nline 3\nagent: other.md\n';
      const refs = extractReferences(content, 'test.yaml');
      expect(refs[0].line).toBe(2);
      expect(refs[1].line).toBe(4);
    });

    it('should return empty array for content with no references', () => {
      const content = 'Just some plain text.\nNo references here.\n';
      const refs = extractReferences(content, 'test.md');
      expect(refs).toHaveLength(0);
    });
  });

  // ============================================================================
  // Tests: findFiles
  // ============================================================================

  describe('findFiles', () => {
    it('should find markdown and yaml files in the project', () => {
      const files = findFiles(PROJECT_ROOT);
      expect(files.length).toBeGreaterThan(0);

      const hasMarkdown = files.some((f) => f.endsWith('.md'));
      expect(hasMarkdown).toBe(true);
    });

    it('should not include files from node_modules', () => {
      const files = findFiles(PROJECT_ROOT);
      const inNodeModules = files.filter((f) => f.includes('node_modules'));
      expect(inNodeModules).toHaveLength(0);
    });

    it('should not include files from .git directory', () => {
      const files = findFiles(PROJECT_ROOT);
      const inGit = files.filter((f) => f.includes('/.git/'));
      expect(inGit).toHaveLength(0);
    });

    it('should return absolute paths', () => {
      const files = findFiles(PROJECT_ROOT);
      for (const f of files) {
        expect(path.isAbsolute(f)).toBe(true);
      }
    });
  });

  // ============================================================================
  // Tests: resolveReference
  // ============================================================================

  describe('resolveReference', () => {
    it('should resolve a relative reference that exists', async () => {
      // package.json exists at project root; reference it relatively
      // from a file also at project root
      const sourceFile = path.join(PROJECT_ROOT, 'README.md');
      const result = await resolveReference('package.json', sourceFile, PROJECT_ROOT);
      // package.json is not .md or .yaml, but resolveReference doesn't filter by extension
      expect(result.resolved).toBe(path.join(PROJECT_ROOT, 'package.json'));
      expect(result.exists).toBe(true);
    });

    it('should report non-existent reference as not existing', async () => {
      const sourceFile = path.join(PROJECT_ROOT, 'README.md');
      const result = await resolveReference('nonexistent-file-xyz.md', sourceFile, PROJECT_ROOT);
      expect(result.exists).toBe(false);
    });
  });

  // ============================================================================
  // Tests: validateReferences (integration)
  // ============================================================================

  describe('validateReferences', () => {
    it('should run on the actual codebase without crashing', async () => {
      const result = await validateReferences(PROJECT_ROOT);

      expect(result).toBeDefined();
      expect(typeof result.totalFiles).toBe('number');
      expect(typeof result.totalReferences).toBe('number');
      expect(typeof result.validReferences).toBe('number');
      expect(typeof result.brokenReferences).toBe('number');
      expect(Array.isArray(result.broken)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);

      // Sanity checks
      expect(result.totalFiles).toBeGreaterThan(0);
      expect(result.validReferences + result.brokenReferences).toBe(result.totalReferences);
    }, 30000);

    it('should produce broken references with correct structure', async () => {
      const result = await validateReferences(PROJECT_ROOT);

      for (const item of result.broken) {
        expect(item).toHaveProperty('sourceFile');
        expect(item).toHaveProperty('ref');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('line');
        expect(item).toHaveProperty('resolvedPath');
        expect(typeof item.line).toBe('number');
        expect(item.line).toBeGreaterThan(0);
        expect(['workflow', 'agent', 'markdown-link']).toContain(item.type);
      }
    }, 30000);
  });
});
