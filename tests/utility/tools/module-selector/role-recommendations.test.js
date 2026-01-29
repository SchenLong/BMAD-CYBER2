/**
 * Unit Tests for Role-Based Module Recommendations - INST-003
 * Epic 1, Story 3 - Interactive Module Selection
 *
 * Tests the role-recommendations.js functionality for providing
 * role-based module recommendations in the BMAD installation wizard.
 *
 * @module role-recommendations.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ROLE_MODULE_MAP,
  VALID_ROLES,
  getRecommendedModules,
  applyRecommendations,
  sortModulesByRecommendation,
  isValidRole
} from './role-recommendations.js';

// ============================================================================
// Mock Data for Tests
// ============================================================================

/**
 * Creates a fresh copy of mock modules to prevent test pollution
 * @returns {Array} Fresh array of mock module objects
 */
function createMockModules() {
  return [
    { code: 'core', name: 'Core', required: true, recommended: false },
    { code: 'bmm', name: 'BMM', required: false, recommended: false },
    { code: 'cybersec-team', name: 'Cybersec', required: false, recommended: false },
    { code: 'intel-team', name: 'Intel', required: false, recommended: false },
    { code: 'legal-team', name: 'Legal', required: false, recommended: false },
    { code: 'strategy-team', name: 'Strategy', required: false, recommended: false },
    { code: 'cis', name: 'CIS', required: false, recommended: false },
    { code: 'bmgd', name: 'BMGD', required: false, recommended: false },
    { code: 'bmb', name: 'BMB', required: false, recommended: false }
  ];
}

// Expected role mappings (source of truth for tests)
const EXPECTED_ROLE_MAPPINGS = {
  admin: ['core', 'bmm', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team', 'cis', 'bmgd', 'bmb'],
  security_lead: ['core', 'cybersec-team', 'intel-team', 'cis'],
  security_analyst: ['core', 'cybersec-team', 'cis'],
  intel_analyst: ['core', 'intel-team', 'cybersec-team'],
  developer: ['core', 'bmm', 'bmb', 'bmgd'],
  product_manager: ['core', 'bmm', 'cis'],
  viewer: ['core']
};

// ============================================================================
// ROLE_MODULE_MAP Tests
// ============================================================================

describe('role-recommendations - INST-003', () => {

  describe('ROLE_MODULE_MAP', () => {
    it('should be a plain object', () => {
      expect(ROLE_MODULE_MAP).toBeDefined();
      expect(typeof ROLE_MODULE_MAP).toBe('object');
      expect(ROLE_MODULE_MAP).not.toBeNull();
      expect(Array.isArray(ROLE_MODULE_MAP)).toBe(false);
    });

    it('should contain all 7 valid roles as keys', () => {
      const expectedRoles = ['admin', 'security_lead', 'security_analyst', 'intel_analyst', 'developer', 'product_manager', 'viewer'];
      const mapKeys = Object.keys(ROLE_MODULE_MAP);

      expect(mapKeys).toHaveLength(7);
      for (const role of expectedRoles) {
        expect(mapKeys).toContain(role);
      }
    });

    it('should have arrays as values for all roles', () => {
      for (const role of Object.keys(ROLE_MODULE_MAP)) {
        expect(Array.isArray(ROLE_MODULE_MAP[role])).toBe(true);
      }
    });

    it('should include "core" module for all roles', () => {
      for (const role of Object.keys(ROLE_MODULE_MAP)) {
        expect(ROLE_MODULE_MAP[role]).toContain('core');
      }
    });

    it('admin role should recommend all 9 modules', () => {
      expect(ROLE_MODULE_MAP.admin).toHaveLength(9);
      expect(ROLE_MODULE_MAP.admin).toEqual(
        expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.admin)
      );
    });

    it('security_lead role should recommend security-focused modules', () => {
      expect(ROLE_MODULE_MAP.security_lead).toEqual(
        expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.security_lead)
      );
      expect(ROLE_MODULE_MAP.security_lead).toHaveLength(4);
    });

    it('security_analyst role should recommend core security modules', () => {
      expect(ROLE_MODULE_MAP.security_analyst).toEqual(
        expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.security_analyst)
      );
      expect(ROLE_MODULE_MAP.security_analyst).toHaveLength(3);
    });

    it('intel_analyst role should recommend intelligence modules', () => {
      expect(ROLE_MODULE_MAP.intel_analyst).toEqual(
        expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.intel_analyst)
      );
      expect(ROLE_MODULE_MAP.intel_analyst).toHaveLength(3);
    });

    it('developer role should recommend development modules', () => {
      expect(ROLE_MODULE_MAP.developer).toEqual(
        expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.developer)
      );
      expect(ROLE_MODULE_MAP.developer).toHaveLength(4);
    });

    it('product_manager role should recommend management modules', () => {
      expect(ROLE_MODULE_MAP.product_manager).toEqual(
        expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.product_manager)
      );
      expect(ROLE_MODULE_MAP.product_manager).toHaveLength(3);
    });

    it('viewer role should only recommend core module', () => {
      expect(ROLE_MODULE_MAP.viewer).toEqual(['core']);
      expect(ROLE_MODULE_MAP.viewer).toHaveLength(1);
    });

    it('should not have duplicate modules within any role', () => {
      for (const role of Object.keys(ROLE_MODULE_MAP)) {
        const modules = ROLE_MODULE_MAP[role];
        const uniqueModules = [...new Set(modules)];
        expect(modules).toHaveLength(uniqueModules.length);
      }
    });
  });

  // ============================================================================
  // VALID_ROLES Tests
  // ============================================================================

  describe('VALID_ROLES', () => {
    it('should be an array', () => {
      expect(Array.isArray(VALID_ROLES)).toBe(true);
    });

    it('should contain exactly 7 roles', () => {
      expect(VALID_ROLES).toHaveLength(7);
    });

    it('should contain all expected role identifiers', () => {
      const expectedRoles = ['admin', 'security_lead', 'security_analyst', 'intel_analyst', 'developer', 'product_manager', 'viewer'];
      expect(VALID_ROLES).toEqual(expect.arrayContaining(expectedRoles));
    });

    it('should match the keys in ROLE_MODULE_MAP', () => {
      const mapKeys = Object.keys(ROLE_MODULE_MAP);
      expect(VALID_ROLES).toEqual(expect.arrayContaining(mapKeys));
      expect(mapKeys).toEqual(expect.arrayContaining(VALID_ROLES));
    });

    it('should not contain duplicate roles', () => {
      const uniqueRoles = [...new Set(VALID_ROLES)];
      expect(VALID_ROLES).toHaveLength(uniqueRoles.length);
    });

    it('should only contain string values', () => {
      for (const role of VALID_ROLES) {
        expect(typeof role).toBe('string');
      }
    });
  });

  // ============================================================================
  // getRecommendedModules Tests
  // ============================================================================

  describe('getRecommendedModules', () => {
    it('should return correct modules for admin role', () => {
      const result = getRecommendedModules('admin');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.admin));
      expect(result).toHaveLength(9);
    });

    it('should return correct modules for security_lead role', () => {
      const result = getRecommendedModules('security_lead');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.security_lead));
    });

    it('should return correct modules for security_analyst role', () => {
      const result = getRecommendedModules('security_analyst');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.security_analyst));
    });

    it('should return correct modules for intel_analyst role', () => {
      const result = getRecommendedModules('intel_analyst');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.intel_analyst));
    });

    it('should return correct modules for developer role', () => {
      const result = getRecommendedModules('developer');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.developer));
    });

    it('should return correct modules for product_manager role', () => {
      const result = getRecommendedModules('product_manager');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.product_manager));
    });

    it('should return correct modules for viewer role', () => {
      const result = getRecommendedModules('viewer');
      expect(result).toEqual(['core']);
    });

    it('should return viewer modules for unknown role (fallback)', () => {
      const result = getRecommendedModules('unknown_role');
      expect(result).toEqual(['core']);
    });

    it('should return viewer modules for empty string role', () => {
      const result = getRecommendedModules('');
      expect(result).toEqual(['core']);
    });

    it('should return viewer modules for null role', () => {
      const result = getRecommendedModules(null);
      expect(result).toEqual(['core']);
    });

    it('should return viewer modules for undefined role', () => {
      const result = getRecommendedModules(undefined);
      expect(result).toEqual(['core']);
    });

    it('should handle uppercase roles by normalizing to lowercase', () => {
      const result = getRecommendedModules('ADMIN');
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.admin));
      expect(result).toHaveLength(9);
    });

    it('should return the same reference to internal map (for efficiency)', () => {
      const result1 = getRecommendedModules('admin');
      const result2 = getRecommendedModules('admin');
      // Implementation returns the same reference for efficiency
      expect(result1).toBe(result2);
      expect(result1).toEqual(result2);
    });

    it('should handle whitespace in role string by trimming', () => {
      const result = getRecommendedModules(' admin ');
      // Implementation trims whitespace for better UX
      expect(result).toEqual(expect.arrayContaining(EXPECTED_ROLE_MAPPINGS.admin));
      expect(result).toHaveLength(9);
    });
  });

  // ============================================================================
  // applyRecommendations Tests
  // ============================================================================

  describe('applyRecommendations', () => {
    let mockModules;

    beforeEach(() => {
      mockModules = createMockModules();
    });

    it('should set recommended flag for matching modules (admin)', () => {
      applyRecommendations(mockModules, 'admin');

      // All modules should be recommended for admin
      for (const mod of mockModules) {
        expect(mod.recommended).toBe(true);
      }
    });

    it('should set recommended flag only for role-specific modules (developer)', () => {
      applyRecommendations(mockModules, 'developer');

      const developerModules = ['core', 'bmm', 'bmb', 'bmgd'];
      for (const mod of mockModules) {
        if (developerModules.includes(mod.code)) {
          expect(mod.recommended).toBe(true);
        } else {
          expect(mod.recommended).toBe(false);
        }
      }
    });

    it('should set recommended flag only for viewer modules (viewer role)', () => {
      applyRecommendations(mockModules, 'viewer');

      for (const mod of mockModules) {
        if (mod.code === 'core') {
          expect(mod.recommended).toBe(true);
        } else {
          expect(mod.recommended).toBe(false);
        }
      }
    });

    it('should mutate modules in place (void return)', () => {
      const result = applyRecommendations(mockModules, 'admin');
      // Function returns void, mutations are in place
      expect(result).toBeUndefined();
      // But modules should be modified
      expect(mockModules[0].recommended).toBe(true);
    });

    it('should not mutate original module code values', () => {
      const originalCodes = mockModules.map(m => m.code);
      applyRecommendations(mockModules, 'admin');
      const newCodes = mockModules.map(m => m.code);
      expect(newCodes).toEqual(originalCodes);
    });

    it('should not mutate original module name values', () => {
      const originalNames = mockModules.map(m => m.name);
      applyRecommendations(mockModules, 'admin');
      const newNames = mockModules.map(m => m.name);
      expect(newNames).toEqual(originalNames);
    });

    it('should not mutate original module required values', () => {
      const originalRequired = mockModules.map(m => m.required);
      applyRecommendations(mockModules, 'admin');
      const newRequired = mockModules.map(m => m.required);
      expect(newRequired).toEqual(originalRequired);
    });

    it('should handle empty modules array', () => {
      const emptyArr = [];
      applyRecommendations(emptyArr, 'admin');
      expect(emptyArr).toEqual([]);
    });

    it('should handle modules with extra properties', () => {
      const modulesWithExtras = [
        { code: 'core', name: 'Core', required: true, recommended: false, customProp: 'test' }
      ];
      applyRecommendations(modulesWithExtras, 'viewer');
      expect(modulesWithExtras[0].customProp).toBe('test');
      expect(modulesWithExtras[0].recommended).toBe(true);
    });

    it('should use fallback for unknown role', () => {
      applyRecommendations(mockModules, 'unknown');

      // Only core should be recommended (viewer fallback)
      const recommended = mockModules.filter(m => m.recommended);
      expect(recommended).toHaveLength(1);
      expect(recommended[0].code).toBe('core');
    });

    it('should handle security_analyst role correctly', () => {
      applyRecommendations(mockModules, 'security_analyst');

      const expectedRecommended = ['core', 'cybersec-team', 'cis'];
      const recommended = mockModules.filter(m => m.recommended).map(m => m.code);

      expect(recommended).toEqual(expect.arrayContaining(expectedRecommended));
      expect(recommended).toHaveLength(3);
    });

    it('should handle intel_analyst role correctly', () => {
      applyRecommendations(mockModules, 'intel_analyst');

      const expectedRecommended = ['core', 'intel-team', 'cybersec-team'];
      const recommended = mockModules.filter(m => m.recommended).map(m => m.code);

      expect(recommended).toEqual(expect.arrayContaining(expectedRecommended));
      expect(recommended).toHaveLength(3);
    });

    it('should handle modules not in any role mapping gracefully', () => {
      const modulesWithUnknown = [
        ...createMockModules(),
        { code: 'unknown-module', name: 'Unknown', required: false, recommended: false }
      ];

      applyRecommendations(modulesWithUnknown, 'admin');

      // Admin recommends all known modules, unknown-module should not be recommended
      const unknownMod = modulesWithUnknown.find(m => m.code === 'unknown-module');
      expect(unknownMod.recommended).toBe(false);
    });
  });

  // ============================================================================
  // sortModulesByRecommendation Tests
  // ============================================================================

  describe('sortModulesByRecommendation', () => {
    let mockModules;

    beforeEach(() => {
      mockModules = createMockModules();
    });

    it('should place required modules first', () => {
      // Shuffle the modules to test sorting
      const shuffled = [
        { code: 'bmm', name: 'BMM', required: false, recommended: false },
        { code: 'core', name: 'Core', required: true, recommended: false },
        { code: 'intel-team', name: 'Intel', required: false, recommended: false }
      ];

      const result = sortModulesByRecommendation(shuffled);
      expect(result[0].required).toBe(true);
      expect(result[0].code).toBe('core');
    });

    it('should place recommended modules before optional (non-recommended)', () => {
      const modules = [
        { code: 'z-module', name: 'Z Module', required: false, recommended: false },
        { code: 'a-module', name: 'A Module', required: false, recommended: true },
        { code: 'core', name: 'Core', required: true, recommended: true }
      ];

      const result = sortModulesByRecommendation(modules);

      // First should be required
      expect(result[0].required).toBe(true);
      // Second should be recommended (but not required)
      expect(result[1].recommended).toBe(true);
      expect(result[1].required).toBe(false);
      // Last should be non-recommended
      expect(result[2].recommended).toBe(false);
    });

    it('should maintain original order within same priority tier (required)', () => {
      const modules = [
        { code: 'zebra', name: 'Zebra', required: true, recommended: true },
        { code: 'alpha', name: 'Alpha', required: true, recommended: true },
        { code: 'beta', name: 'Beta', required: true, recommended: true }
      ];

      const result = sortModulesByRecommendation(modules);
      // Original order preserved within tier
      expect(result[0].code).toBe('zebra');
      expect(result[1].code).toBe('alpha');
      expect(result[2].code).toBe('beta');
    });

    it('should maintain original order within same priority tier (recommended)', () => {
      const modules = [
        { code: 'zebra', name: 'Zebra', required: false, recommended: true },
        { code: 'alpha', name: 'Alpha', required: false, recommended: true },
        { code: 'beta', name: 'Beta', required: false, recommended: true }
      ];

      const result = sortModulesByRecommendation(modules);
      // Original order preserved within tier
      expect(result[0].code).toBe('zebra');
      expect(result[1].code).toBe('alpha');
      expect(result[2].code).toBe('beta');
    });

    it('should maintain original order within same priority tier (optional)', () => {
      const modules = [
        { code: 'zebra', name: 'Zebra', required: false, recommended: false },
        { code: 'alpha', name: 'Alpha', required: false, recommended: false },
        { code: 'beta', name: 'Beta', required: false, recommended: false }
      ];

      const result = sortModulesByRecommendation(modules);
      // Original order preserved within tier
      expect(result[0].code).toBe('zebra');
      expect(result[1].code).toBe('alpha');
      expect(result[2].code).toBe('beta');
    });

    it('should handle empty array', () => {
      const result = sortModulesByRecommendation([]);
      expect(result).toEqual([]);
    });

    it('should handle single module', () => {
      const single = [{ code: 'core', name: 'Core', required: true, recommended: true }];
      const result = sortModulesByRecommendation(single);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('core');
    });

    it('should return a new array (not mutate original)', () => {
      const original = [
        { code: 'b', name: 'B', required: false, recommended: false },
        { code: 'a', name: 'A', required: true, recommended: true }
      ];
      const originalCopy = JSON.parse(JSON.stringify(original));

      const result = sortModulesByRecommendation(original);

      // Original should be unchanged
      expect(original).toEqual(originalCopy);
      // Result should be different reference
      expect(result).not.toBe(original);
    });

    it('should correctly order: required > recommended > optional', () => {
      const modules = [
        { code: 'optional', name: 'Optional', required: false, recommended: false },
        { code: 'recommended', name: 'Recommended', required: false, recommended: true },
        { code: 'required', name: 'Required', required: true, recommended: false }
      ];

      const result = sortModulesByRecommendation(modules);

      expect(result[0].code).toBe('required');
      expect(result[1].code).toBe('recommended');
      expect(result[2].code).toBe('optional');
    });

    it('should handle modules with both required and recommended flags', () => {
      const modules = [
        { code: 'both', name: 'Both', required: true, recommended: true },
        { code: 'only-required', name: 'Only Required', required: true, recommended: false },
        { code: 'only-recommended', name: 'Only Recommended', required: false, recommended: true }
      ];

      const result = sortModulesByRecommendation(modules);

      // Required modules come first (both 'both' and 'only-required')
      expect(result[0].required).toBe(true);
      expect(result[1].required).toBe(true);
      // Then recommended (not required)
      expect(result[2].code).toBe('only-recommended');
    });

    it('should work correctly after applyRecommendations', () => {
      applyRecommendations(mockModules, 'developer');
      const result = sortModulesByRecommendation(mockModules);

      // Core should be first (required)
      expect(result[0].code).toBe('core');

      // Next should be recommended modules (developer: bmb, bmgd, bmm)
      const recommended = result.filter(m => m.recommended && !m.required);
      expect(recommended.length).toBe(3);
    });
  });

  // ============================================================================
  // isValidRole Tests
  // ============================================================================

  describe('isValidRole', () => {
    it('should return true for admin role', () => {
      expect(isValidRole('admin')).toBe(true);
    });

    it('should return true for security_lead role', () => {
      expect(isValidRole('security_lead')).toBe(true);
    });

    it('should return true for security_analyst role', () => {
      expect(isValidRole('security_analyst')).toBe(true);
    });

    it('should return true for intel_analyst role', () => {
      expect(isValidRole('intel_analyst')).toBe(true);
    });

    it('should return true for developer role', () => {
      expect(isValidRole('developer')).toBe(true);
    });

    it('should return true for product_manager role', () => {
      expect(isValidRole('product_manager')).toBe(true);
    });

    it('should return true for viewer role', () => {
      expect(isValidRole('viewer')).toBe(true);
    });

    it('should return false for unknown role', () => {
      expect(isValidRole('unknown')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidRole('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidRole(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidRole(undefined)).toBe(false);
    });

    it('should return false for number', () => {
      expect(isValidRole(123)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isValidRole({ role: 'admin' })).toBe(false);
    });

    it('should return false for array', () => {
      expect(isValidRole(['admin'])).toBe(false);
    });

    it('should handle uppercase roles by normalizing to lowercase', () => {
      expect(isValidRole('ADMIN')).toBe(true);
      expect(isValidRole('Admin')).toBe(true);
      expect(isValidRole('SECURITY_LEAD')).toBe(true);
    });

    it('should handle roles with extra whitespace by trimming', () => {
      expect(isValidRole(' admin')).toBe(true);
      expect(isValidRole('admin ')).toBe(true);
      expect(isValidRole(' admin ')).toBe(true);
    });

    it('should return false for similar but incorrect role names', () => {
      expect(isValidRole('administrator')).toBe(false);
      expect(isValidRole('securitylead')).toBe(false);
      expect(isValidRole('security-lead')).toBe(false);
      expect(isValidRole('intel-analyst')).toBe(false);
      expect(isValidRole('dev')).toBe(false);
      expect(isValidRole('pm')).toBe(false);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration - Full Workflow', () => {
    it('should correctly apply and sort recommendations for security_lead', () => {
      const modules = createMockModules();

      // Apply recommendations for security_lead
      applyRecommendations(modules, 'security_lead');

      // Sort by recommendation
      const sorted = sortModulesByRecommendation(modules);

      // Verify order: required first, then recommended, then optional
      expect(sorted[0].code).toBe('core');
      expect(sorted[0].required).toBe(true);

      // Next should be recommended modules for security_lead
      const recommendedModules = sorted.filter(m => m.recommended && !m.required);
      const recommendedCodes = recommendedModules.map(m => m.code);

      expect(recommendedCodes).toContain('cybersec-team');
      expect(recommendedCodes).toContain('intel-team');
      expect(recommendedCodes).toContain('cis');
    });

    it('should correctly validate role before applying recommendations', () => {
      const modules = createMockModules();
      const role = 'security_analyst';

      // First validate
      expect(isValidRole(role)).toBe(true);

      // Then get recommended modules
      const recommended = getRecommendedModules(role);
      expect(recommended).toContain('core');
      expect(recommended).toContain('cybersec-team');
      expect(recommended).toContain('cis');

      // Apply and verify
      applyRecommendations(modules, role);
      const recommendedModules = modules.filter(m => m.recommended);
      expect(recommendedModules).toHaveLength(3);
    });

    it('should handle full workflow with invalid role gracefully', () => {
      const modules = createMockModules();
      const role = 'invalid_role';

      // Validation should fail
      expect(isValidRole(role)).toBe(false);

      // But getRecommendedModules should return fallback
      const recommended = getRecommendedModules(role);
      expect(recommended).toEqual(['core']);

      // And applyRecommendations should still work with fallback
      applyRecommendations(modules, role);
      const recommendedModules = modules.filter(m => m.recommended);
      expect(recommendedModules).toHaveLength(1);
      expect(recommendedModules[0].code).toBe('core');
    });

    it('should preserve module integrity through full workflow', () => {
      const modules = createMockModules();
      const originalLength = modules.length;

      // Full workflow
      const validRole = isValidRole('developer');
      expect(validRole).toBe(true);

      applyRecommendations(modules, 'developer');
      const sorted = sortModulesByRecommendation(modules);

      // Same number of modules
      expect(sorted).toHaveLength(originalLength);

      // All original codes present
      const originalCodes = createMockModules().map(m => m.code);
      const sortedCodes = sorted.map(m => m.code);
      expect(sortedCodes).toEqual(expect.arrayContaining(originalCodes));
    });
  });
});
