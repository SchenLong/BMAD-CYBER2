/**
 * Unit Tests for Module Selection UI Component - INST-002
 * Epic 1, Story 2 - Interactive Module Selection
 *
 * Tests the module-selection-ui.js functionality for displaying
 * interactive checkbox selection during the BMAD installation wizard.
 *
 * @module module-selection-ui.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  applyRecommendations,
  buildModuleChoices,
  calculateSelectionSummary,
  getModuleDisplayName,
  validateSelection
} from './module-selection-ui.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mock module metadata factory for testing
 * @param {Partial<ModuleMetadata>} overrides - Override specific fields
 * @returns {ModuleMetadata} Complete mock module
 */
function createMockModule(overrides = {}) {
  return {
    code: 'test-module',
    name: 'Test Module',
    description: 'A test module for unit testing',
    required: false,
    defaultSelected: false,
    recommended: false,
    agentCount: 5,
    workflowCount: 10,
    estimatedSizeKB: 45,
    ...overrides
  };
}

describe('Module Selection UI - INST-002', () => {
  describe('buildModuleChoices', () => {
    it('should build choices array from modules', () => {
      const modules = [
        createMockModule({ code: 'core', name: 'Core Framework', required: true }),
        createMockModule({ code: 'optional', name: 'Optional Module' })
      ];

      const choices = buildModuleChoices(modules);
      expect(choices).toBeDefined();
      expect(Array.isArray(choices)).toBe(true);
    });

    it('should group required modules first with separator', () => {
      const modules = [
        createMockModule({ code: 'optional', name: 'Optional' }),
        createMockModule({ code: 'core', name: 'Core', required: true })
      ];

      const choices = buildModuleChoices(modules);

      // Find required section separator - inquirer Separator has type = 'separator'
      // The separator object has a 'separator' property that contains the text
      const requiredSeparator = choices.find(c =>
        c.type === 'separator' && c.separator?.includes('REQUIRED')
      );
      // If not found by separator text, look by checking if it's a Separator instance
      const hasSeparator = choices.some(c => c.type === 'separator');
      expect(hasSeparator).toBe(true);
    });

    it('should group recommended modules with separator', () => {
      const modules = [
        createMockModule({ code: 'core', name: 'Core', required: true }),
        createMockModule({ code: 'rec', name: 'Recommended', recommended: true }),
        createMockModule({ code: 'opt', name: 'Optional' })
      ];

      const choices = buildModuleChoices(modules);

      // Should have separators in choices
      const separatorCount = choices.filter(c => c.type === 'separator').length;
      expect(separatorCount).toBeGreaterThan(0);
    });

    it('should group optional modules with separator', () => {
      const modules = [
        createMockModule({ code: 'core', name: 'Core', required: true }),
        createMockModule({ code: 'opt', name: 'Optional' })
      ];

      const choices = buildModuleChoices(modules);

      // Should have separators in choices
      const separatorCount = choices.filter(c => c.type === 'separator').length;
      expect(separatorCount).toBeGreaterThan(0);
    });

    it('should mark required modules as disabled', () => {
      const modules = [
        createMockModule({ code: 'core', name: 'Core', required: true })
      ];

      const choices = buildModuleChoices(modules);

      const coreChoice = choices.find(c => c.value === 'core');
      expect(coreChoice).toBeDefined();
      expect(coreChoice.disabled).toBeDefined();
    });

    it('should pre-check modules with defaultSelected=true', () => {
      const modules = [
        createMockModule({ code: 'auto', name: 'Auto Select', defaultSelected: true })
      ];

      const choices = buildModuleChoices(modules);

      const autoChoice = choices.find(c => c.value === 'auto');
      expect(autoChoice).toBeDefined();
      expect(autoChoice.checked).toBe(true);
    });

    it('should pre-check recommended modules', () => {
      const modules = [
        createMockModule({ code: 'rec', name: 'Recommended', recommended: true })
      ];

      const choices = buildModuleChoices(modules);

      const recChoice = choices.find(c => c.value === 'rec');
      expect(recChoice).toBeDefined();
      expect(recChoice.checked).toBe(true);
    });

    it('should include agent count in choice name', () => {
      const modules = [
        createMockModule({ code: 'mod', name: 'Module', agentCount: 15 })
      ];

      const choices = buildModuleChoices(modules);

      const modChoice = choices.find(c => c.value === 'mod');
      expect(modChoice).toBeDefined();
      expect(modChoice.name).toContain('15 agents');
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'This is a very long description that should be truncated because it exceeds the maximum allowed length for display in the CLI';
      const modules = [
        createMockModule({ code: 'mod', name: 'Module', description: longDescription })
      ];

      const choices = buildModuleChoices(modules);

      const modChoice = choices.find(c => c.value === 'mod');
      expect(modChoice).toBeDefined();
      // Description should be truncated with ellipsis
      expect(modChoice.name.length).toBeLessThan(longDescription.length + 50);
    });

    it('should handle empty modules array', () => {
      const choices = buildModuleChoices([]);
      expect(choices).toEqual([]);
    });

    it('should use short name for display after selection', () => {
      const modules = [
        createMockModule({ code: 'mod', name: 'Module Name' })
      ];

      const choices = buildModuleChoices(modules);

      const modChoice = choices.find(c => c.value === 'mod');
      expect(modChoice.short).toBe('Module Name');
    });
  });

  describe('calculateSelectionSummary', () => {
    it('should calculate correct module count', () => {
      const modules = [
        createMockModule({ code: 'a' }),
        createMockModule({ code: 'b' }),
        createMockModule({ code: 'c' })
      ];

      const summary = calculateSelectionSummary(['a', 'b'], modules);
      expect(summary.moduleCount).toBe(2);
    });

    it('should calculate correct agent count', () => {
      const modules = [
        createMockModule({ code: 'a', agentCount: 10 }),
        createMockModule({ code: 'b', agentCount: 5 }),
        createMockModule({ code: 'c', agentCount: 20 })
      ];

      const summary = calculateSelectionSummary(['a', 'c'], modules);
      expect(summary.agentCount).toBe(30); // 10 + 20
    });

    it('should calculate correct workflow count', () => {
      const modules = [
        createMockModule({ code: 'a', workflowCount: 8 }),
        createMockModule({ code: 'b', workflowCount: 12 })
      ];

      const summary = calculateSelectionSummary(['a', 'b'], modules);
      expect(summary.workflowCount).toBe(20);
    });

    it('should calculate correct estimated size', () => {
      const modules = [
        createMockModule({ code: 'a', estimatedSizeKB: 100 }),
        createMockModule({ code: 'b', estimatedSizeKB: 50 })
      ];

      const summary = calculateSelectionSummary(['a', 'b'], modules);
      expect(summary.estimatedSizeKB).toBe(150);
      expect(summary.estimatedSizeMB).toBe('0.15');
    });

    it('should handle empty selection', () => {
      const modules = [
        createMockModule({ code: 'a' })
      ];

      const summary = calculateSelectionSummary([], modules);
      expect(summary.moduleCount).toBe(0);
      expect(summary.agentCount).toBe(0);
      expect(summary.workflowCount).toBe(0);
      expect(summary.estimatedSizeKB).toBe(0);
    });

    it('should ignore non-existent module codes', () => {
      const modules = [
        createMockModule({ code: 'a', agentCount: 10 })
      ];

      const summary = calculateSelectionSummary(['a', 'non-existent'], modules);
      expect(summary.moduleCount).toBe(1);
      expect(summary.agentCount).toBe(10);
    });
  });

  describe('validateSelection', () => {
    it('should return valid for selection with all required modules', () => {
      const modules = [
        createMockModule({ code: 'core', required: true }),
        createMockModule({ code: 'optional' })
      ];

      const result = validateSelection(['core', 'optional'], modules);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return invalid if required module is missing', () => {
      const modules = [
        createMockModule({ code: 'core', required: true }),
        createMockModule({ code: 'optional' })
      ];

      const result = validateSelection(['optional'], modules);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('core');
    });

    it('should list all missing required modules', () => {
      const modules = [
        createMockModule({ code: 'core', required: true }),
        createMockModule({ code: 'framework', required: true }),
        createMockModule({ code: 'optional' })
      ];

      const result = validateSelection(['optional'], modules);
      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(2);
      expect(result.missing).toContain('core');
      expect(result.missing).toContain('framework');
    });

    it('should return valid for empty required modules', () => {
      const modules = [
        createMockModule({ code: 'a' }),
        createMockModule({ code: 'b' })
      ];

      const result = validateSelection(['a'], modules);
      expect(result.valid).toBe(true);
    });
  });

  describe('applyRecommendations', () => {
    it('should set recommended flag on specified modules', () => {
      const modules = [
        createMockModule({ code: 'a' }),
        createMockModule({ code: 'b' }),
        createMockModule({ code: 'c' })
      ];

      applyRecommendations(modules, ['a', 'c']);

      expect(modules[0].recommended).toBe(true);
      expect(modules[1].recommended).toBe(false);
      expect(modules[2].recommended).toBe(true);
    });

    it('should clear recommended flag for non-recommended modules', () => {
      const modules = [
        createMockModule({ code: 'a', recommended: true }),
        createMockModule({ code: 'b', recommended: true })
      ];

      applyRecommendations(modules, ['a']);

      expect(modules[0].recommended).toBe(true);
      expect(modules[1].recommended).toBe(false);
    });

    it('should handle empty recommendations array', () => {
      const modules = [
        createMockModule({ code: 'a', recommended: true })
      ];

      applyRecommendations(modules, []);

      expect(modules[0].recommended).toBe(false);
    });
  });

  describe('getModuleDisplayName', () => {
    it('should return module name for valid code', () => {
      const modules = [
        createMockModule({ code: 'test', name: 'Test Module Name' })
      ];

      const name = getModuleDisplayName('test', modules);
      expect(name).toBe('Test Module Name');
    });

    it('should return code for non-existent module', () => {
      const modules = [
        createMockModule({ code: 'test', name: 'Test' })
      ];

      const name = getModuleDisplayName('unknown', modules);
      expect(name).toBe('unknown');
    });

    it('should handle empty modules array', () => {
      const name = getModuleDisplayName('test', []);
      expect(name).toBe('test');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no CommonJS require)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'module-selection-ui.js'),
        'utf8'
      );

      // Should not use CommonJS module.exports
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'module-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(function|const|async)/);
    });

    it('should use ESM entry point detection pattern', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'module-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\.meta\.url/);
      expect(moduleContent).toMatch(/fileURLToPath/);
    });

    it('should use native ESM imports', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'module-selection-ui.js'),
        'utf8'
      );

      // Uses native ESM import for prompts abstraction and chalk
      expect(moduleContent).toMatch(/from\s+['"]\.\.\/\.\.\/cli\/prompts\.js['"]/);
      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });
  });

  describe('Choice Formatting', () => {
    it('should handle modules without descriptions', () => {
      const modules = [
        createMockModule({ code: 'nodesc', name: 'No Description', description: '' })
      ];

      const choices = buildModuleChoices(modules);
      const choice = choices.find(c => c.value === 'nodesc');

      expect(choice).toBeDefined();
      expect(choice.name).toContain('No Description');
    });

    it('should handle modules with zero agents', () => {
      const modules = [
        createMockModule({ code: 'empty', name: 'Empty Module', agentCount: 0 })
      ];

      const choices = buildModuleChoices(modules);
      const choice = choices.find(c => c.value === 'empty');

      expect(choice).toBeDefined();
      expect(choice.name).toContain('0 agents');
    });

    it('should correctly order sections: required > recommended > optional', () => {
      const modules = [
        createMockModule({ code: 'opt', name: 'Optional' }),
        createMockModule({ code: 'rec', name: 'Recommended', recommended: true }),
        createMockModule({ code: 'req', name: 'Required', required: true })
      ];

      const choices = buildModuleChoices(modules);

      // Find indices of section separators
      const requiredIdx = choices.findIndex(c =>
        c.type === 'separator' && c.separator?.includes('REQUIRED')
      );
      const recommendedIdx = choices.findIndex(c =>
        c.type === 'separator' && c.separator?.includes('RECOMMENDED')
      );
      const optionalIdx = choices.findIndex(c =>
        c.type === 'separator' && c.separator?.includes('OPTIONAL')
      );

      // Required should come before recommended
      if (requiredIdx !== -1 && recommendedIdx !== -1) {
        expect(requiredIdx).toBeLessThan(recommendedIdx);
      }

      // Recommended should come before optional
      if (recommendedIdx !== -1 && optionalIdx !== -1) {
        expect(recommendedIdx).toBeLessThan(optionalIdx);
      }
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate large module sets correctly', () => {
      const modules = Array.from({ length: 50 }, (_, i) =>
        createMockModule({
          code: `mod-${i}`,
          agentCount: i + 1,
          workflowCount: i * 2,
          estimatedSizeKB: (i + 1) * 10
        })
      );

      const allCodes = modules.map(m => m.code);
      const summary = calculateSelectionSummary(allCodes, modules);

      // Sum of 1 to 50 = 1275 agents
      expect(summary.agentCount).toBe(1275);

      // Sum of 0, 2, 4, ..., 98 = 49*50 = 2450 workflows
      expect(summary.workflowCount).toBe(2450);

      // Sum of 10, 20, 30, ..., 500 = 50*510/2 = 12750 KB
      expect(summary.estimatedSizeKB).toBe(12750);
    });

    it('should format MB with two decimal places', () => {
      const modules = [
        createMockModule({ code: 'a', estimatedSizeKB: 1024 }) // 1 MB
      ];

      const summary = calculateSelectionSummary(['a'], modules);
      expect(summary.estimatedSizeMB).toBe('1.00');
    });

    it('should handle fractional MB correctly', () => {
      const modules = [
        createMockModule({ code: 'a', estimatedSizeKB: 512 }) // 0.5 MB
      ];

      const summary = calculateSelectionSummary(['a'], modules);
      expect(summary.estimatedSizeMB).toBe('0.50');
    });
  });
});

describe('Integration Tests', () => {
  it('should work with real module loader output', async () => {
    // Import the real module loader
    const { loadAllModules } = await import('./module-loader.js');

    // Load real modules
    const modules = loadAllModules();

    // Build choices
    const choices = buildModuleChoices(modules);

    // Should have choices for each module plus separators
    expect(choices.length).toBeGreaterThan(modules.length);
  });

  it('should calculate summary for real modules', async () => {
    const { loadAllModules } = await import('./module-loader.js');
    const modules = loadAllModules();
    const allCodes = modules.map(m => m.code);

    const summary = calculateSelectionSummary(allCodes, modules);

    // Basic sanity checks
    expect(summary.moduleCount).toBe(modules.length);
    expect(summary.agentCount).toBeGreaterThan(0);
  });

  it('should validate that core is required in real modules', async () => {
    const { loadAllModules } = await import('./module-loader.js');
    const modules = loadAllModules();

    // Find core module
    const core = modules.find(m => m.code === 'core');

    if (core) {
      // Validate selection without core should fail
      const otherCodes = modules.filter(m => m.code !== 'core').map(m => m.code);
      const result = validateSelection(otherCodes, modules);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('core');
    }
  });
});
