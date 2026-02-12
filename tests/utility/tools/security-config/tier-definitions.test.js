/**
 * Unit Tests for Security Tier Definitions - INST-007
 * Epic 2, Story 1 - Security Tier Configuration
 *
 * Tests the tier-definitions.js functionality for defining and
 * managing security tier configurations.
 *
 * @module tier-definitions.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  compareTiers,
  FEATURE_DETAILS,
  FEATURE_TO_VALIDATOR,
  getAllFeaturesUpToTier,
  getAllTierIds,
  getDefaultTier,
  getDowngradeWarning,
  getFeatureDetails,
  getFeaturesByCategory,
  getFeaturesByTier,
  getMinimumTierForFeature,
  getMostRestrictiveTier,
  getTierById,
  getTierDisplayInfo,
  getTierFeatures,
  getTierValidatorPaths,
  getValidatorPaths,
  isSecurityDowngrade,
  isValidTierId,
  SECURITY_TIERS,
  tierIncludesFeature
} from './tier-definitions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Security Tier Definitions - INST-007', () => {
  describe('SECURITY_TIERS constant', () => {
    it('should have exactly 5 tiers', () => {
      expect(SECURITY_TIERS).toHaveLength(5);
    });

    it('should have tiers in correct order', () => {
      expect(SECURITY_TIERS[0].id).toBe('essential');
      expect(SECURITY_TIERS[1].id).toBe('standard');
      expect(SECURITY_TIERS[2].id).toBe('advanced');
      expect(SECURITY_TIERS[3].id).toBe('enterprise');
      expect(SECURITY_TIERS[4].id).toBe('beta');
    });

    it('should have exactly one default tier (enterprise - most restrictive stable)', () => {
      const defaults = SECURITY_TIERS.filter(t => t.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].id).toBe('enterprise');
    });

    it('should have exactly one beta tier', () => {
      const betas = SECURITY_TIERS.filter(t => t.isBeta);
      expect(betas).toHaveLength(1);
      expect(betas[0].id).toBe('beta');
    });

    it('should have sequential order values', () => {
      const orders = SECURITY_TIERS.map(t => t.order);
      expect(orders).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have all required properties for each tier', () => {
      for (const tier of SECURITY_TIERS) {
        expect(tier).toHaveProperty('id');
        expect(tier).toHaveProperty('name');
        expect(tier).toHaveProperty('description');
        expect(tier).toHaveProperty('features');
        expect(tier).toHaveProperty('isDefault');
        expect(tier).toHaveProperty('isBeta');
        expect(tier).toHaveProperty('order');
        expect(Array.isArray(tier.features)).toBe(true);
      }
    });

    it('should have non-empty features array for each tier', () => {
      for (const tier of SECURITY_TIERS) {
        expect(tier.features.length).toBeGreaterThan(0);
      }
    });
  });

  describe('FEATURE_TO_VALIDATOR mapping', () => {
    it('should have auth feature', () => {
      expect(FEATURE_TO_VALIDATOR['auth']).toBeDefined();
    });

    it('should have validators-6 as an array of 6 paths', () => {
      const validators6 = FEATURE_TO_VALIDATOR['validators-6'];
      expect(Array.isArray(validators6)).toBe(true);
      expect(validators6).toHaveLength(6);
    });

    it('should have all individual validator features', () => {
      expect(FEATURE_TO_VALIDATOR['bash-safety']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['env-protection']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['outside-repo']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['production-guard']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['secret-detection']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['pii-protection']).toBeDefined();
    });

    it('should have all advanced tier features', () => {
      expect(FEATURE_TO_VALIDATOR['rbac']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['session-management']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['token-management']).toBeDefined();
    });

    it('should have all enterprise tier features', () => {
      expect(FEATURE_TO_VALIDATOR['audit-logging']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['integrity-verification']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['pii-advanced']).toBeDefined();
    });

    it('should have all beta tier features', () => {
      expect(FEATURE_TO_VALIDATOR['threat-modeling']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['plugin-isolation']).toBeDefined();
      expect(FEATURE_TO_VALIDATOR['owasp-remediation']).toBeDefined();
    });

    it('should have valid path formats', () => {
      for (const [key, value] of Object.entries(FEATURE_TO_VALIDATOR)) {
        if (Array.isArray(value)) {
          for (const path of value) {
            expect(typeof path).toBe('string');
            expect(path.length).toBeGreaterThan(0);
          }
        } else {
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('FEATURE_DETAILS mapping', () => {
    it('should have details for all features in FEATURE_TO_VALIDATOR', () => {
      // Not all features in FEATURE_TO_VALIDATOR have details (some are aliases)
      const detailKeys = Object.keys(FEATURE_DETAILS);
      expect(detailKeys.length).toBeGreaterThan(10);
    });

    it('should have required properties for each feature detail', () => {
      for (const [code, detail] of Object.entries(FEATURE_DETAILS)) {
        expect(detail).toHaveProperty('name');
        expect(detail).toHaveProperty('description');
        expect(detail).toHaveProperty('tier');
        expect(detail).toHaveProperty('category');
        expect(typeof detail.name).toBe('string');
        expect(typeof detail.description).toBe('string');
        expect(typeof detail.tier).toBe('string');
        expect(typeof detail.category).toBe('string');
      }
    });

    it('should have valid tier values', () => {
      const validTiers = ['essential', 'standard', 'advanced', 'enterprise', 'beta'];
      for (const detail of Object.values(FEATURE_DETAILS)) {
        expect(validTiers).toContain(detail.tier);
      }
    });
  });

  describe('getTierById()', () => {
    it('should return tier for valid ID', () => {
      const tier = getTierById('standard');
      expect(tier).toBeDefined();
      expect(tier.id).toBe('standard');
      expect(tier.name).toBe('Standard');
    });

    it('should be case-insensitive', () => {
      expect(getTierById('STANDARD')).toBeDefined();
      expect(getTierById('Standard')).toBeDefined();
      expect(getTierById('ESSENTIAL')).toBeDefined();
    });

    it('should return undefined for invalid ID', () => {
      expect(getTierById('invalid')).toBeUndefined();
      expect(getTierById('super-enterprise')).toBeUndefined();
    });

    it('should return undefined for null/empty input', () => {
      expect(getTierById(null)).toBeUndefined();
      expect(getTierById('')).toBeUndefined();
      expect(getTierById(undefined)).toBeUndefined();
    });

    it('should return undefined for non-string input', () => {
      expect(getTierById(123)).toBeUndefined();
      expect(getTierById({})).toBeUndefined();
      expect(getTierById([])).toBeUndefined();
    });
  });

  describe('getDefaultTier()', () => {
    it('should return the enterprise tier (most restrictive stable)', () => {
      const defaultTier = getDefaultTier();
      expect(defaultTier).toBeDefined();
      expect(defaultTier.id).toBe('enterprise');
      expect(defaultTier.isDefault).toBe(true);
    });
  });

  describe('getTierFeatures()', () => {
    it('should return features for valid tier', () => {
      const features = getTierFeatures('essential');
      expect(Array.isArray(features)).toBe(true);
      expect(features).toContain('auth');
    });

    it('should return copy of features array', () => {
      const features1 = getTierFeatures('standard');
      const features2 = getTierFeatures('standard');
      expect(features1).not.toBe(features2);
      expect(features1).toEqual(features2);
    });

    it('should return empty array for invalid tier', () => {
      const features = getTierFeatures('invalid');
      expect(Array.isArray(features)).toBe(true);
      expect(features).toHaveLength(0);
    });

    it('should return correct features for each tier', () => {
      expect(getTierFeatures('essential')).toContain('auth');
      expect(getTierFeatures('standard')).toContain('validators-6');
      expect(getTierFeatures('advanced')).toContain('rbac');
      expect(getTierFeatures('enterprise')).toContain('audit-logging');
      expect(getTierFeatures('beta')).toContain('threat-modeling');
    });
  });

  describe('getAllFeaturesUpToTier()', () => {
    it('should return empty array for invalid tier', () => {
      expect(getAllFeaturesUpToTier('invalid')).toEqual([]);
    });

    it('should return only auth for essential tier', () => {
      const features = getAllFeaturesUpToTier('essential');
      expect(features).toContain('auth');
    });

    it('should include lower tier features', () => {
      const standardFeatures = getAllFeaturesUpToTier('standard');
      expect(standardFeatures).toContain('auth');
      expect(standardFeatures).toContain('validators-6');

      const advancedFeatures = getAllFeaturesUpToTier('advanced');
      expect(advancedFeatures).toContain('auth');
      expect(advancedFeatures).toContain('validators-6');
      expect(advancedFeatures).toContain('rbac');
    });

    it('should have more features as tier increases', () => {
      const essential = getAllFeaturesUpToTier('essential');
      const standard = getAllFeaturesUpToTier('standard');
      const advanced = getAllFeaturesUpToTier('advanced');
      const enterprise = getAllFeaturesUpToTier('enterprise');
      const beta = getAllFeaturesUpToTier('beta');

      expect(standard.length).toBeGreaterThanOrEqual(essential.length);
      expect(advanced.length).toBeGreaterThanOrEqual(standard.length);
      expect(enterprise.length).toBeGreaterThanOrEqual(advanced.length);
      expect(beta.length).toBeGreaterThanOrEqual(enterprise.length);
    });
  });

  describe('getValidatorPaths()', () => {
    it('should return array for single path feature', () => {
      const paths = getValidatorPaths('auth');
      expect(Array.isArray(paths)).toBe(true);
      expect(paths).toHaveLength(1);
      expect(paths[0]).toBe('src/core/security/authorization.js');
    });

    it('should return array for multi-path feature', () => {
      const paths = getValidatorPaths('validators-6');
      expect(Array.isArray(paths)).toBe(true);
      expect(paths).toHaveLength(6);
    });

    it('should return empty array for invalid feature', () => {
      const paths = getValidatorPaths('invalid-feature');
      expect(Array.isArray(paths)).toBe(true);
      expect(paths).toHaveLength(0);
    });

    it('should return copy of paths array', () => {
      const paths1 = getValidatorPaths('validators-6');
      const paths2 = getValidatorPaths('validators-6');
      expect(paths1).not.toBe(paths2);
      expect(paths1).toEqual(paths2);
    });
  });

  describe('getTierValidatorPaths()', () => {
    it('should return paths for valid tier', () => {
      const paths = getTierValidatorPaths('essential');
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid tier', () => {
      const paths = getTierValidatorPaths('invalid');
      expect(Array.isArray(paths)).toBe(true);
      expect(paths).toHaveLength(0);
    });

    it('should return unique paths (no duplicates)', () => {
      const paths = getTierValidatorPaths('enterprise');
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });
  });

  describe('compareTiers()', () => {
    it('should return -1 when first tier is lower', () => {
      expect(compareTiers('essential', 'standard')).toBe(-1);
      expect(compareTiers('standard', 'advanced')).toBe(-1);
      expect(compareTiers('essential', 'enterprise')).toBe(-1);
    });

    it('should return 1 when first tier is higher', () => {
      expect(compareTiers('standard', 'essential')).toBe(1);
      expect(compareTiers('enterprise', 'standard')).toBe(1);
      expect(compareTiers('beta', 'essential')).toBe(1);
    });

    it('should return 0 when tiers are equal', () => {
      expect(compareTiers('standard', 'standard')).toBe(0);
      expect(compareTiers('enterprise', 'enterprise')).toBe(0);
    });

    it('should return -1 when first tier is invalid', () => {
      expect(compareTiers('invalid', 'standard')).toBe(-1);
    });

    it('should return 1 when second tier is invalid', () => {
      expect(compareTiers('standard', 'invalid')).toBe(1);
    });

    it('should return 0 when both tiers are invalid', () => {
      expect(compareTiers('invalid1', 'invalid2')).toBe(0);
    });
  });

  describe('tierIncludesFeature()', () => {
    it('should return true for included feature', () => {
      expect(tierIncludesFeature('essential', 'auth')).toBe(true);
      expect(tierIncludesFeature('standard', 'validators-6')).toBe(true);
    });

    it('should return false for non-included feature', () => {
      expect(tierIncludesFeature('essential', 'validators-6')).toBe(false);
      expect(tierIncludesFeature('standard', 'rbac')).toBe(false);
    });

    it('should return false for invalid tier', () => {
      expect(tierIncludesFeature('invalid', 'auth')).toBe(false);
    });
  });

  describe('getMinimumTierForFeature()', () => {
    it('should return correct tier for each feature', () => {
      expect(getMinimumTierForFeature('auth')).toBe('essential');
      expect(getMinimumTierForFeature('validators-6')).toBe('standard');
      expect(getMinimumTierForFeature('rbac')).toBe('advanced');
      expect(getMinimumTierForFeature('audit-logging')).toBe('enterprise');
      expect(getMinimumTierForFeature('threat-modeling')).toBe('beta');
    });

    it('should return undefined for invalid feature', () => {
      expect(getMinimumTierForFeature('invalid')).toBeUndefined();
    });
  });

  describe('getFeatureDetails()', () => {
    it('should return details for valid feature', () => {
      const details = getFeatureDetails('auth');
      expect(details).toBeDefined();
      expect(details.name).toBe('Core Authorization');
      expect(details.tier).toBe('essential');
    });

    it('should return undefined for invalid feature', () => {
      expect(getFeatureDetails('invalid')).toBeUndefined();
    });
  });

  describe('getFeaturesByTier()', () => {
    it('should return object with all tier keys', () => {
      const grouped = getFeaturesByTier();
      expect(grouped).toHaveProperty('essential');
      expect(grouped).toHaveProperty('standard');
      expect(grouped).toHaveProperty('advanced');
      expect(grouped).toHaveProperty('enterprise');
      expect(grouped).toHaveProperty('beta');
    });

    it('should have auth in essential tier', () => {
      const grouped = getFeaturesByTier();
      expect(grouped.essential).toContain('auth');
    });

    it('should have arrays for each tier', () => {
      const grouped = getFeaturesByTier();
      for (const features of Object.values(grouped)) {
        expect(Array.isArray(features)).toBe(true);
      }
    });
  });

  describe('getFeaturesByCategory()', () => {
    it('should return grouped features by category', () => {
      const grouped = getFeaturesByCategory();
      expect(grouped).toHaveProperty('Authorization');
      expect(grouped).toHaveProperty('Validators');
    });

    it('should have auth in Authorization category', () => {
      const grouped = getFeaturesByCategory();
      expect(grouped['Authorization']).toContain('auth');
    });

    it('should have arrays for each category', () => {
      const grouped = getFeaturesByCategory();
      for (const features of Object.values(grouped)) {
        expect(Array.isArray(features)).toBe(true);
      }
    });
  });

  describe('isValidTierId()', () => {
    it('should return true for valid tier IDs', () => {
      expect(isValidTierId('essential')).toBe(true);
      expect(isValidTierId('standard')).toBe(true);
      expect(isValidTierId('advanced')).toBe(true);
      expect(isValidTierId('enterprise')).toBe(true);
      expect(isValidTierId('beta')).toBe(true);
    });

    it('should return false for invalid tier IDs', () => {
      expect(isValidTierId('invalid')).toBe(false);
      expect(isValidTierId('')).toBe(false);
      expect(isValidTierId(null)).toBe(false);
    });
  });

  describe('getAllTierIds()', () => {
    it('should return all 5 tier IDs', () => {
      const ids = getAllTierIds();
      expect(ids).toHaveLength(5);
      expect(ids).toContain('essential');
      expect(ids).toContain('standard');
      expect(ids).toContain('advanced');
      expect(ids).toContain('enterprise');
      expect(ids).toContain('beta');
    });
  });

  describe('getTierDisplayInfo()', () => {
    it('should return display info for valid tier', () => {
      const info = getTierDisplayInfo('enterprise');
      expect(info).toBeDefined();
      expect(info.id).toBe('enterprise');
      expect(info.name).toBe('Enterprise');
      expect(info.featureCount).toBe(8);
      expect(info.isDefault).toBe(true);
      expect(info.isBeta).toBe(false);
    });

    it('should return display info for non-default tier', () => {
      const info = getTierDisplayInfo('standard');
      expect(info).toBeDefined();
      expect(info.id).toBe('standard');
      expect(info.name).toBe('Standard');
      expect(info.featureCount).toBe(2);
      expect(info.isDefault).toBe(false);
      expect(info.isBeta).toBe(false);
    });

    it('should return undefined for invalid tier', () => {
      expect(getTierDisplayInfo('invalid')).toBeUndefined();
    });

    it('should include order in display info', () => {
      const info = getTierDisplayInfo('advanced');
      expect(info.order).toBe(3);
    });
  });

  describe('isSecurityDowngrade()', () => {
    it('should return true for downgrade', () => {
      expect(isSecurityDowngrade('enterprise', 'standard')).toBe(true);
      expect(isSecurityDowngrade('advanced', 'essential')).toBe(true);
      expect(isSecurityDowngrade('standard', 'essential')).toBe(true);
    });

    it('should return false for upgrade', () => {
      expect(isSecurityDowngrade('standard', 'enterprise')).toBe(false);
      expect(isSecurityDowngrade('essential', 'advanced')).toBe(false);
    });

    it('should return false for same tier', () => {
      expect(isSecurityDowngrade('standard', 'standard')).toBe(false);
      expect(isSecurityDowngrade('enterprise', 'enterprise')).toBe(false);
    });

    it('should return false for initial configuration', () => {
      expect(isSecurityDowngrade(null, 'standard')).toBe(false);
      expect(isSecurityDowngrade(undefined, 'enterprise')).toBe(false);
    });
  });

  describe('getDowngradeWarning()', () => {
    it('should return warning for downgrade', () => {
      const warning = getDowngradeWarning('enterprise', 'standard');
      expect(warning).not.toBeNull();
      expect(warning).toContain('WARNING');
      expect(warning).toContain('Lowering security tier');
      expect(warning).toContain('Enterprise');
      expect(warning).toContain('Standard');
    });

    it('should mention number of features being disabled', () => {
      const warning = getDowngradeWarning('enterprise', 'essential');
      expect(warning).toContain('feature(s)');
    });

    it('should return null for upgrade', () => {
      const warning = getDowngradeWarning('standard', 'enterprise');
      expect(warning).toBeNull();
    });

    it('should return null for same tier', () => {
      const warning = getDowngradeWarning('standard', 'standard');
      expect(warning).toBeNull();
    });

    it('should return null for invalid tiers', () => {
      const warning = getDowngradeWarning('invalid1', 'invalid2');
      expect(warning).toBeNull();
    });
  });

  describe('getMostRestrictiveTier()', () => {
    it('should return enterprise tier', () => {
      const tier = getMostRestrictiveTier();
      expect(tier).toBeDefined();
      expect(tier.id).toBe('enterprise');
    });

    it('should not return beta tier (experimental/unstable)', () => {
      const tier = getMostRestrictiveTier();
      expect(tier.id).not.toBe('beta');
      expect(tier.isBeta).toBe(false);
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no require calls)', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'tier-definitions.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
    });

    it('should use import statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'tier-definitions.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bimport\s+/);
      expect(moduleContent).toMatch(/\bexport\s+/);
    });
  });
});
