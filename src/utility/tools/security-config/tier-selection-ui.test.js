/**
 * Unit Tests for Tier Selection UI - INST-008
 * Epic 2, Story 2 - Security Tier Configuration
 *
 * Tests the tier-selection-ui.js functionality for interactive
 * security tier selection.
 *
 * @module tier-selection-ui.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  formatTierChoice,
  buildTierChoices,
  getDefaultTierIndex,
  showCurrentConfig,
  showSelectionSummary,
  showTierComparison
} from './tier-selection-ui.js';

import { SECURITY_TIERS, getTierById, getDefaultTier } from './tier-definitions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock console.log for output tests
let consoleOutput = [];
const originalLog = console.log;

function mockConsole() {
  consoleOutput = [];
  console.log = (...args) => {
    consoleOutput.push(args.join(' '));
  };
}

function restoreConsole() {
  console.log = originalLog;
}

describe('Tier Selection UI - INST-008', () => {
  describe('formatTierChoice()', () => {
    it('should format tier name in bold', () => {
      const tier = getTierById('standard');
      const formatted = formatTierChoice(tier);
      expect(formatted).toContain('Standard');
    });

    it('should include feature count', () => {
      const tier = getTierById('standard');
      const formatted = formatTierChoice(tier);
      expect(formatted).toContain('2 features');
    });

    it('should mark default tier as RECOMMENDED', () => {
      const defaultTier = getDefaultTier();
      const formatted = formatTierChoice(defaultTier);
      expect(formatted).toContain('RECOMMENDED');
    });

    it('should mark beta tier with BETA label', () => {
      const betaTier = getTierById('beta');
      const formatted = formatTierChoice(betaTier);
      expect(formatted).toContain('BETA');
    });

    it('should include tier description', () => {
      const tier = getTierById('essential');
      const formatted = formatTierChoice(tier);
      expect(formatted).toContain(tier.description);
    });

    it('should include beta warning for beta tier', () => {
      const betaTier = getTierById('beta');
      const formatted = formatTierChoice(betaTier);
      expect(formatted).toContain('experimental');
    });

    it('should not include RECOMMENDED for non-default tiers', () => {
      const tier = getTierById('essential');
      const formatted = formatTierChoice(tier);
      expect(formatted).not.toContain('RECOMMENDED');
    });

    it('should not include BETA for non-beta tiers', () => {
      const tier = getTierById('standard');
      const formatted = formatTierChoice(tier);
      expect(formatted).not.toContain('BETA');
    });

    it('should handle singular feature correctly', () => {
      const tier = getTierById('essential');
      const formatted = formatTierChoice(tier);
      expect(formatted).toContain('1 feature');
    });
  });

  describe('buildTierChoices()', () => {
    it('should return array of 5 choices', () => {
      const choices = buildTierChoices();
      expect(choices).toHaveLength(5);
    });

    it('should have name, value, and short for each choice', () => {
      const choices = buildTierChoices();
      for (const choice of choices) {
        expect(choice).toHaveProperty('name');
        expect(choice).toHaveProperty('value');
        expect(choice).toHaveProperty('short');
      }
    });

    it('should have tier IDs as values', () => {
      const choices = buildTierChoices();
      const values = choices.map(c => c.value);
      expect(values).toContain('essential');
      expect(values).toContain('standard');
      expect(values).toContain('advanced');
      expect(values).toContain('enterprise');
      expect(values).toContain('beta');
    });

    it('should have tier names as short values', () => {
      const choices = buildTierChoices();
      const shorts = choices.map(c => c.short);
      expect(shorts).toContain('Essential');
      expect(shorts).toContain('Standard');
      expect(shorts).toContain('Advanced');
      expect(shorts).toContain('Enterprise');
      expect(shorts).toContain('Beta');
    });

    it('should maintain tier order', () => {
      const choices = buildTierChoices();
      expect(choices[0].value).toBe('essential');
      expect(choices[1].value).toBe('standard');
      expect(choices[2].value).toBe('advanced');
      expect(choices[3].value).toBe('enterprise');
      expect(choices[4].value).toBe('beta');
    });
  });

  describe('getDefaultTierIndex()', () => {
    it('should return index of standard tier', () => {
      const index = getDefaultTierIndex();
      expect(index).toBe(1); // standard is the second tier (index 1)
    });

    it('should match the default tier in SECURITY_TIERS', () => {
      const index = getDefaultTierIndex();
      expect(SECURITY_TIERS[index].isDefault).toBe(true);
    });

    it('should return valid index within bounds', () => {
      const index = getDefaultTierIndex();
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(SECURITY_TIERS.length);
    });
  });

  describe('showCurrentConfig()', () => {
    beforeEach(() => {
      mockConsole();
    });

    afterEach(() => {
      restoreConsole();
    });

    it('should output tier name for valid tier', () => {
      showCurrentConfig('standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain('Standard');
    });

    it('should output feature count', () => {
      showCurrentConfig('standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain('2');
    });

    it('should output tier description', () => {
      const tier = getTierById('standard');
      showCurrentConfig('standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain(tier.description);
    });

    it('should show warning for invalid tier', () => {
      showCurrentConfig('invalid');
      const output = consoleOutput.join('\n');
      expect(output).toContain('No security tier configured');
    });

    it('should show BETA label for beta tier', () => {
      showCurrentConfig('beta');
      const output = consoleOutput.join('\n');
      expect(output).toContain('BETA');
    });
  });

  describe('showSelectionSummary()', () => {
    beforeEach(() => {
      mockConsole();
    });

    afterEach(() => {
      restoreConsole();
    });

    it('should output selected tier name', () => {
      showSelectionSummary('advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('Advanced');
    });

    it('should output feature count', () => {
      showSelectionSummary('advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('5 features');
    });

    it('should show beta warning for beta tier', () => {
      showSelectionSummary('beta');
      const output = consoleOutput.join('\n');
      expect(output).toContain('experimental');
    });

    it('should not show beta warning for non-beta tier', () => {
      showSelectionSummary('standard');
      const output = consoleOutput.join('\n');
      expect(output).not.toContain('experimental');
    });

    it('should handle invalid tier silently', () => {
      showSelectionSummary('invalid');
      // Should not throw, just return
      expect(consoleOutput.length).toBe(0);
    });
  });

  describe('showTierComparison()', () => {
    beforeEach(() => {
      mockConsole();
    });

    afterEach(() => {
      restoreConsole();
    });

    it('should show comparison header', () => {
      showTierComparison('standard', 'advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('TIER COMPARISON');
    });

    it('should show current and new tier names', () => {
      showTierComparison('standard', 'advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('Standard');
      expect(output).toContain('Advanced');
    });

    it('should show features being added when upgrading', () => {
      showTierComparison('standard', 'advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('ADDED');
    });

    it('should show features being removed when downgrading', () => {
      showTierComparison('advanced', 'standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain('REMOVED');
    });

    it('should show unchanged features', () => {
      showTierComparison('standard', 'advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('UNCHANGED');
    });

    it('should show upgrade message when going to higher tier', () => {
      showTierComparison('standard', 'advanced');
      const output = consoleOutput.join('\n');
      expect(output).toContain('Upgrading');
    });

    it('should show downgrade message when going to lower tier', () => {
      showTierComparison('advanced', 'standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain('Downgrading');
    });

    it('should show no change message for same tier', () => {
      showTierComparison('standard', 'standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain('No change');
    });

    it('should handle invalid current tier', () => {
      showTierComparison('invalid', 'standard');
      const output = consoleOutput.join('\n');
      expect(output).toContain('invalid');
    });

    it('should handle invalid new tier', () => {
      showTierComparison('standard', 'invalid');
      const output = consoleOutput.join('\n');
      expect(output).toContain('invalid');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'tier-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'tier-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });

    it('should import from tier-definitions.js', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'tier-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/from\s+['"]\.\/tier-definitions\.js['"]/);
    });

    it('should import inquirer and chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'tier-selection-ui.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+inquirer/);
      expect(moduleContent).toMatch(/import\s+chalk/);
    });
  });

  describe('Inquirer Integration', () => {
    it('should export showTierSelector function', async () => {
      const module = await import('./tier-selection-ui.js');
      expect(typeof module.showTierSelector).toBe('function');
    });

    it('should export showFeatureConfirmation function', async () => {
      const module = await import('./tier-selection-ui.js');
      expect(typeof module.showFeatureConfirmation).toBe('function');
    });

    it('should export promptAdvancedCustomization function', async () => {
      const module = await import('./tier-selection-ui.js');
      expect(typeof module.promptAdvancedCustomization).toBe('function');
    });
  });
});
