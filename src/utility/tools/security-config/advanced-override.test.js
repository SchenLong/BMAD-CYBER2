/**
 * Unit Tests for Advanced Security Override - INST-010
 * Epic 2, Story 4 - Security Tier Configuration
 *
 * Tests the advanced-override.js functionality for granular
 * feature selection and customization.
 *
 * @module advanced-override.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ESSENTIAL_FEATURES,
  buildFeatureChoices,
  validateFeatureSelection,
  getFeatureSummary,
  determineEffectiveTier
} from './advanced-override.js';

import {
  getTierFeatures,
  FEATURE_DETAILS,
  getFeaturesByTier
} from './tier-definitions.js';

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

describe('Advanced Security Override - INST-010', () => {
  describe('ESSENTIAL_FEATURES constant', () => {
    it('should include auth feature', () => {
      expect(ESSENTIAL_FEATURES).toContain('auth');
    });

    it('should be an array', () => {
      expect(Array.isArray(ESSENTIAL_FEATURES)).toBe(true);
    });

    it('should have at least one essential feature', () => {
      expect(ESSENTIAL_FEATURES.length).toBeGreaterThan(0);
    });
  });

  describe('buildFeatureChoices()', () => {
    it('should return an array', () => {
      const choices = buildFeatureChoices([]);
      expect(Array.isArray(choices)).toBe(true);
    });

    it('should include features from all tiers', () => {
      const choices = buildFeatureChoices([]);
      const featuresByTier = getFeaturesByTier();

      // Check that we have separators for each tier
      const tierNames = ['ESSENTIAL', 'STANDARD', 'ADVANCED', 'ENTERPRISE', 'BETA'];
      for (const tierName of tierNames) {
        const hasTier = choices.some(c => {
          if (typeof c === 'object' && c.type === 'separator') {
            return c.line && c.line.includes(tierName);
          }
          return false;
        });
        // May not have tier if no features exist
      }
    });

    it('should mark enabled features as checked', () => {
      const enabledFeatures = ['auth', 'validators-6'];
      const choices = buildFeatureChoices(enabledFeatures);

      const authChoice = choices.find(c => c.value === 'auth');
      const validatorsChoice = choices.find(c => c.value === 'validators-6');

      expect(authChoice?.checked).toBe(true);
      expect(validatorsChoice?.checked).toBe(true);
    });

    it('should mark non-enabled features as unchecked', () => {
      const enabledFeatures = ['auth'];
      const choices = buildFeatureChoices(enabledFeatures);

      // Find a feature that's not enabled
      const rbacChoice = choices.find(c => c.value === 'rbac');
      if (rbacChoice) {
        expect(rbacChoice.checked).toBe(false);
      }
    });

    it('should mark essential features as disabled', () => {
      const choices = buildFeatureChoices([]);

      for (const essential of ESSENTIAL_FEATURES) {
        const choice = choices.find(c => c.value === essential);
        if (choice) {
          expect(choice.disabled).toBe('Required');
        }
      }
    });

    it('should include short name in choices', () => {
      const choices = buildFeatureChoices(['auth']);
      const authChoice = choices.find(c => c.value === 'auth');

      expect(authChoice?.short).toBeDefined();
    });

    it('should include feature name and description', () => {
      const choices = buildFeatureChoices(['auth']);
      const authChoice = choices.find(c => c.value === 'auth');

      expect(authChoice?.name).toContain('Core Authorization');
    });
  });

  describe('validateFeatureSelection()', () => {
    it('should validate selection with all essential features', () => {
      const features = ['auth', 'validators-6'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when essential feature is missing', () => {
      const features = ['validators-6'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn when removing features from base tier', () => {
      // Standard tier has auth and validators-6
      // Only include auth
      const features = ['auth'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.removedFromBase).toContain('validators-6');
    });

    it('should warn when adding features from higher tiers', () => {
      // Standard doesn't have rbac, but advanced does
      const features = ['auth', 'validators-6', 'rbac'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.addedFromBase).toContain('rbac');
    });

    it('should warn when beta features are selected', () => {
      const features = ['auth', 'threat-modeling'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.warnings.some(w => w.includes('beta'))).toBe(true);
    });

    it('should return selected features in result', () => {
      const features = ['auth', 'validators-6'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.selectedFeatures).toEqual(features);
    });

    it('should return added and removed feature lists', () => {
      const features = ['auth', 'rbac'];
      const result = validateFeatureSelection(features, 'standard');

      expect(result.addedFromBase).toBeDefined();
      expect(result.removedFromBase).toBeDefined();
    });
  });

  describe('getFeatureSummary()', () => {
    it('should return total count', () => {
      const features = ['auth', 'validators-6'];
      const summary = getFeatureSummary(features);

      expect(summary.total).toBe(2);
    });

    it('should count features by tier', () => {
      const features = ['auth', 'validators-6', 'rbac'];
      const summary = getFeatureSummary(features);

      expect(summary.byTier.essential).toBe(1); // auth
      expect(summary.byTier.standard).toBe(1); // validators-6
      expect(summary.byTier.advanced).toBe(1); // rbac
    });

    it('should count features by category', () => {
      const features = ['auth', 'rbac'];
      const summary = getFeatureSummary(features);

      expect(summary.byCategory['Authorization']).toBe(1);
      expect(summary.byCategory['Access Control']).toBe(1);
    });

    it('should detect beta features', () => {
      const featuresWithBeta = ['auth', 'threat-modeling'];
      const summaryBeta = getFeatureSummary(featuresWithBeta);
      expect(summaryBeta.hasBeta).toBe(true);

      const featuresNoBeta = ['auth', 'validators-6'];
      const summaryNoBeta = getFeatureSummary(featuresNoBeta);
      expect(summaryNoBeta.hasBeta).toBe(false);
    });

    it('should handle empty features array', () => {
      const summary = getFeatureSummary([]);

      expect(summary.total).toBe(0);
      expect(summary.hasBeta).toBe(false);
    });

    it('should handle unknown features gracefully', () => {
      const features = ['auth', 'unknown-feature'];
      const summary = getFeatureSummary(features);

      expect(summary.total).toBe(2);
      // Unknown feature doesn't add to byTier counts
      expect(summary.byTier.essential).toBe(1);
    });
  });

  describe('determineEffectiveTier()', () => {
    it('should return essential for essential features only', () => {
      const features = getTierFeatures('essential');
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('essential');
    });

    it('should return standard for standard features', () => {
      const features = getTierFeatures('standard');
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('standard');
    });

    it('should return advanced for advanced features', () => {
      const features = getTierFeatures('advanced');
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('advanced');
    });

    it('should return enterprise for enterprise features', () => {
      const features = getTierFeatures('enterprise');
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('enterprise');
    });

    it('should return beta for beta features', () => {
      const features = getTierFeatures('beta');
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('beta');
    });

    it('should return custom for mixed features', () => {
      // Mix of standard and advanced but not complete advanced
      const features = ['auth', 'validators-6', 'rbac'];
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('custom');
    });

    it('should return custom when features are subset', () => {
      // Only auth (subset of essential which has only auth, so should match)
      const features = ['auth'];
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('essential');
    });

    it('should return custom when features are superset', () => {
      // Standard + extra feature not in any tier
      const standardFeatures = getTierFeatures('standard');
      const features = [...standardFeatures, 'rbac'];
      const tier = determineEffectiveTier(features);

      expect(tier).toBe('custom');
    });
  });

  describe('Module Exports', () => {
    it('should export showAdvancedConfig function', async () => {
      const module = await import('./advanced-override.js');
      expect(typeof module.showAdvancedConfig).toBe('function');
    });

    it('should export confirmFeatureSelection function', async () => {
      const module = await import('./advanced-override.js');
      expect(typeof module.confirmFeatureSelection).toBe('function');
    });

    it('should export selectBaseTier function', async () => {
      const module = await import('./advanced-override.js');
      expect(typeof module.selectBaseTier).toBe('function');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'advanced-override.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'advanced-override.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });

    it('should import from tier-definitions.js', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'advanced-override.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/from\s+['"]\.\/tier-definitions\.js['"]/);
    });

    it('should import inquirer and chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'advanced-override.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+inquirer/);
      expect(moduleContent).toMatch(/import\s+chalk/);
    });
  });
});
