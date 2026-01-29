/**
 * Role-Based Module Recommendations - INST-003
 * Epic 1, Story 3 - Interactive Module Selection
 *
 * Provides role-based module recommendations for the BMAD installation wizard.
 * Maps organizational roles to recommended module sets and provides utilities
 * for filtering, sorting, and applying recommendations.
 *
 * @module role-recommendations
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';

/**
 * All available module codes in the BMAD ecosystem
 * @type {string[]}
 */
const ALL_MODULES = [
  'core',
  'bmm',
  'cybersec-team',
  'intel-team',
  'legal-team',
  'strategy-team',
  'cis',
  'bmgd',
  'bmb'
];

/**
 * Role to module mapping
 * Defines which modules are recommended for each organizational role
 * @type {Object.<string, string[]>}
 */
export const ROLE_MODULE_MAP = {
  admin: ALL_MODULES,
  security_lead: ['core', 'cybersec-team', 'intel-team', 'cis'],
  security_analyst: ['core', 'cybersec-team', 'cis'],
  intel_analyst: ['core', 'intel-team', 'cybersec-team'],
  developer: ['core', 'bmm', 'bmb', 'bmgd'],
  product_manager: ['core', 'bmm', 'cis'],
  viewer: ['core']
};

/**
 * Array of valid role strings
 * @type {string[]}
 */
export const VALID_ROLES = Object.keys(ROLE_MODULE_MAP);

/**
 * Default role used when an unknown role is provided
 * @type {string}
 */
const DEFAULT_ROLE = 'viewer';

/**
 * Returns array of module codes recommended for a given role
 * Defaults to 'viewer' recommendations for unknown roles
 *
 * @param {string} role - The organizational role
 * @returns {string[]} Array of recommended module codes
 * @example
 * getRecommendedModules('security_lead');
 * // Returns: ['core', 'cybersec-team', 'intel-team', 'cis']
 */
export function getRecommendedModules(role) {
  if (!role || typeof role !== 'string') {
    return ROLE_MODULE_MAP[DEFAULT_ROLE];
  }

  const normalizedRole = role.toLowerCase().trim();
  return ROLE_MODULE_MAP[normalizedRole] || ROLE_MODULE_MAP[DEFAULT_ROLE];
}

/**
 * Mutates module objects to set recommended: true flag based on role
 * Modules whose code appears in the role's recommended list will have
 * their `recommended` property set to true
 *
 * @param {Object[]} modules - Array of module objects with `code` property
 * @param {string} role - The organizational role
 * @returns {void} Mutates modules in place
 * @example
 * const modules = [{ code: 'core' }, { code: 'bmm' }];
 * applyRecommendations(modules, 'viewer');
 * // modules[0].recommended === true
 * // modules[1].recommended === false
 */
export function applyRecommendations(modules, role) {
  if (!Array.isArray(modules)) {
    return;
  }

  const recommendedCodes = getRecommendedModules(role);
  const recommendedSet = new Set(recommendedCodes);

  for (const module of modules) {
    if (module && typeof module === 'object' && module.code) {
      module.recommended = recommendedSet.has(module.code);
    }
  }
}

/**
 * Returns a new array sorted by recommendation priority:
 * 1. Required modules first
 * 2. Recommended modules second
 * 3. Optional (non-recommended) modules last
 *
 * Within each group, maintains original order
 *
 * @param {Object[]} modules - Array of module objects with `required` and `recommended` properties
 * @returns {Object[]} New sorted array (does not mutate original)
 * @example
 * const modules = [
 *   { code: 'bmm', required: false, recommended: false },
 *   { code: 'core', required: true, recommended: true },
 *   { code: 'cis', required: false, recommended: true }
 * ];
 * const sorted = sortModulesByRecommendation(modules);
 * // sorted: [{ code: 'core' }, { code: 'cis' }, { code: 'bmm' }]
 */
export function sortModulesByRecommendation(modules) {
  if (!Array.isArray(modules)) {
    return [];
  }

  // Create a shallow copy to avoid mutating the original
  return [...modules].sort((a, b) => {
    // Required modules first
    const aRequired = a?.required ?? false;
    const bRequired = b?.required ?? false;

    if (aRequired && !bRequired) return -1;
    if (!aRequired && bRequired) return 1;

    // Recommended modules second
    const aRecommended = a?.recommended ?? false;
    const bRecommended = b?.recommended ?? false;

    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;

    // Maintain original order within groups
    return 0;
  });
}

/**
 * Checks if a role string is valid
 *
 * @param {string} role - The role to validate
 * @returns {boolean} True if the role is valid, false otherwise
 * @example
 * isValidRole('admin');        // true
 * isValidRole('invalid_role'); // false
 * isValidRole(null);           // false
 */
export function isValidRole(role) {
  if (!role || typeof role !== 'string') {
    return false;
  }

  const normalizedRole = role.toLowerCase().trim();
  return VALID_ROLES.includes(normalizedRole);
}

/**
 * Gets a human-readable description of a role
 *
 * @param {string} role - The organizational role
 * @returns {string} Human-readable role description
 */
export function getRoleDescription(role) {
  const descriptions = {
    admin: 'Full system administrator with access to all modules',
    security_lead: 'Security team lead overseeing security operations',
    security_analyst: 'Security analyst focused on threat detection',
    intel_analyst: 'Intelligence analyst gathering and analyzing threat data',
    developer: 'Software developer building and maintaining systems',
    product_manager: 'Product manager overseeing product development',
    viewer: 'Read-only access to core functionality'
  };

  return descriptions[role] || 'Unknown role';
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('BMAD Role Recommendations - Self-Test\n');
  console.log('='.repeat(60));

  // Test 1: VALID_ROLES
  console.log('\n1. Valid Roles:');
  console.log(`   ${VALID_ROLES.join(', ')}`);

  // Test 2: ROLE_MODULE_MAP
  console.log('\n2. Role-Module Mapping:');
  for (const role of VALID_ROLES) {
    const modules = ROLE_MODULE_MAP[role];
    console.log(`   ${role.padEnd(20)} -> [${modules.join(', ')}]`);
  }

  // Test 3: getRecommendedModules
  console.log('\n3. getRecommendedModules() Tests:');
  const testCases = [
    'admin',
    'security_lead',
    'viewer',
    'invalid_role',
    '',
    null
  ];

  for (const testRole of testCases) {
    const result = getRecommendedModules(testRole);
    console.log(`   getRecommendedModules(${JSON.stringify(testRole)}) -> [${result.join(', ')}]`);
  }

  // Test 4: isValidRole
  console.log('\n4. isValidRole() Tests:');
  const validityTests = ['admin', 'ADMIN', 'invalid', '', null, 123];
  for (const testVal of validityTests) {
    const result = isValidRole(testVal);
    console.log(`   isValidRole(${JSON.stringify(testVal)}) -> ${result}`);
  }

  // Test 5: applyRecommendations
  console.log('\n5. applyRecommendations() Test:');
  const mockModules = [
    { code: 'core', name: 'Core' },
    { code: 'bmm', name: 'BMM' },
    { code: 'cybersec-team', name: 'Cybersec Team' },
    { code: 'cis', name: 'CIS' }
  ];

  console.log('   Before (security_analyst role):');
  mockModules.forEach(m => console.log(`     ${m.code}: recommended = ${m.recommended}`));

  applyRecommendations(mockModules, 'security_analyst');

  console.log('   After:');
  mockModules.forEach(m => console.log(`     ${m.code}: recommended = ${m.recommended}`));

  // Test 6: sortModulesByRecommendation
  console.log('\n6. sortModulesByRecommendation() Test:');
  const unsortedModules = [
    { code: 'bmm', required: false, recommended: false },
    { code: 'core', required: true, recommended: true },
    { code: 'cis', required: false, recommended: true },
    { code: 'legal-team', required: false, recommended: false }
  ];

  console.log('   Before:');
  unsortedModules.forEach((m, i) => {
    console.log(`     ${i}: ${m.code} (required: ${m.required}, recommended: ${m.recommended})`);
  });

  const sorted = sortModulesByRecommendation(unsortedModules);

  console.log('   After (required first, then recommended, then optional):');
  sorted.forEach((m, i) => {
    console.log(`     ${i}: ${m.code} (required: ${m.required}, recommended: ${m.recommended})`);
  });

  // Verify original was not mutated
  console.log('\n   Original array unchanged:', unsortedModules[0].code === 'bmm' ? 'PASS' : 'FAIL');

  console.log('\n' + '='.repeat(60));
  console.log('Self-test complete.');
}
