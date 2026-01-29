/**
 * Security Tier Definitions - INST-007
 * Epic 2, Story 1 - Security Tier Configuration
 *
 * Defines 5 security tiers with feature mappings and validator paths.
 * Essential, Standard, Advanced, Enterprise, and Beta tiers provide
 * progressively more comprehensive security configurations.
 *
 * @module tier-definitions
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';

/**
 * Mapping of feature codes to validator file paths
 * @type {Object<string, string|string[]>}
 */
export const FEATURE_TO_VALIDATOR = {
  'auth': '_bmad/core/security/authorization.js',
  'validators-6': [
    '.claude/validators-node/src/guards/bash-safety.js',
    '.claude/validators-node/src/guards/env-protection.js',
    '.claude/validators-node/src/guards/outside-repo.js',
    '.claude/validators-node/src/guards/production.js',
    '.claude/validators-node/src/guards/secret.js',
    '.claude/validators-node/src/guards/pii/index.js'
  ],
  'bash-safety': '.claude/validators-node/src/guards/bash-safety.js',
  'env-protection': '.claude/validators-node/src/guards/env-protection.js',
  'outside-repo': '.claude/validators-node/src/guards/outside-repo.js',
  'production-guard': '.claude/validators-node/src/guards/production.js',
  'secret-detection': '.claude/validators-node/src/guards/secret.js',
  'pii-protection': '.claude/validators-node/src/guards/pii/index.js',
  'rbac': '_bmad/core/security/rbac-config.yaml',
  'session-management': '_bmad/core/security/session-manager.js',
  'token-management': [
    '_bmad/core/security/generate-token.js',
    '_bmad/core/security/validate-token.js',
    '_bmad/core/security/check-authorization.js'
  ],
  'audit-logging': '_bmad/framework/dist/audit/index.js',
  'integrity-verification': [
    '_bmad/core/security/verify-integrity.sh',
    '_bmad/core/security/MANIFEST.sha256',
    '_bmad/core/security/sign-manifest.sh'
  ],
  'pii-advanced': [
    '.claude/validators-node/src/guards/pii/patterns.js',
    '.claude/validators-node/src/guards/pii/validators.js'
  ],
  'threat-modeling': '_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md',
  'plugin-isolation': '_bmad/core/security/PLUGIN-ISOLATION-RESEARCH.md',
  'owasp-remediation': '_bmad/core/security/OWASP-REMEDIATION-PLAN.md'
};

/**
 * Detailed information about each security feature
 * @type {Object<string, FeatureDetail>}
 */
export const FEATURE_DETAILS = {
  'auth': {
    name: 'Core Authorization',
    description: 'Basic authorization checks for API and resource access',
    tier: 'essential',
    category: 'Authorization'
  },
  'validators-6': {
    name: 'Standard Validators Bundle',
    description: 'All 6 standard security validators',
    tier: 'standard',
    category: 'Validators'
  },
  'bash-safety': {
    name: 'Bash Safety Guard',
    description: 'Prevents dangerous bash command execution',
    tier: 'standard',
    category: 'Validators'
  },
  'env-protection': {
    name: 'Environment Protection',
    description: 'Guards against environment variable leakage',
    tier: 'standard',
    category: 'Validators'
  },
  'outside-repo': {
    name: 'Repository Boundary Guard',
    description: 'Prevents operations outside the project repository',
    tier: 'standard',
    category: 'Validators'
  },
  'production-guard': {
    name: 'Production Environment Guard',
    description: 'Extra safeguards for production environments',
    tier: 'standard',
    category: 'Validators'
  },
  'secret-detection': {
    name: 'Secret Detection',
    description: 'Detects and prevents secret/credential exposure',
    tier: 'standard',
    category: 'Validators'
  },
  'pii-protection': {
    name: 'PII Protection',
    description: 'Basic personally identifiable information protection',
    tier: 'standard',
    category: 'Validators'
  },
  'rbac': {
    name: 'Role-Based Access Control',
    description: 'Fine-grained role-based permission management',
    tier: 'advanced',
    category: 'Access Control'
  },
  'session-management': {
    name: 'Session Management',
    description: 'Secure session handling with timeout and refresh',
    tier: 'advanced',
    category: 'Session'
  },
  'token-management': {
    name: 'Token Management',
    description: 'JWT token generation, validation, and authorization checks',
    tier: 'advanced',
    category: 'Authentication'
  },
  'audit-logging': {
    name: 'Audit Logging',
    description: 'Comprehensive security event logging and audit trail',
    tier: 'enterprise',
    category: 'Compliance'
  },
  'integrity-verification': {
    name: 'Integrity Verification',
    description: 'Cryptographic verification of file and manifest integrity',
    tier: 'enterprise',
    category: 'Compliance'
  },
  'pii-advanced': {
    name: 'Advanced PII Protection',
    description: 'Extended PII patterns and custom validators',
    tier: 'enterprise',
    category: 'Validators'
  },
  'threat-modeling': {
    name: 'OWASP Threat Modeling',
    description: 'AI security threat modeling based on OWASP guidelines',
    tier: 'beta',
    category: 'Experimental'
  },
  'plugin-isolation': {
    name: 'Plugin Isolation',
    description: 'Experimental sandboxing for plugin execution',
    tier: 'beta',
    category: 'Experimental'
  },
  'owasp-remediation': {
    name: 'OWASP Remediation',
    description: 'Automated security remediation suggestions',
    tier: 'beta',
    category: 'Experimental'
  }
};

/**
 * Security tier definitions ordered from minimal to maximum
 * @type {SecurityTier[]}
 */
export const SECURITY_TIERS = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Minimal security - core authorization only. For development/testing.',
    features: ['auth'],
    isDefault: false,
    isBeta: false,
    order: 1
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Recommended baseline - includes all 6 standard validators.',
    features: ['auth', 'validators-6'],
    isDefault: true,
    isBeta: false,
    order: 2
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Full security suite - adds RBAC, session, and token management.',
    features: ['auth', 'validators-6', 'rbac', 'session-management', 'token-management'],
    isDefault: false,
    isBeta: false,
    order: 3
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Maximum protection - adds audit logging and integrity verification.',
    features: [
      'auth', 'validators-6', 'rbac', 'session-management', 'token-management',
      'audit-logging', 'integrity-verification', 'pii-advanced'
    ],
    isDefault: false,
    isBeta: false,
    order: 4
  },
  {
    id: 'beta',
    name: 'Beta',
    description: 'Experimental features - includes all plus beta/experimental security features.',
    features: [
      'auth', 'validators-6', 'rbac', 'session-management', 'token-management',
      'audit-logging', 'integrity-verification', 'pii-advanced',
      'threat-modeling', 'plugin-isolation', 'owasp-remediation'
    ],
    isDefault: false,
    isBeta: true,
    order: 5
  }
];

/**
 * Gets a security tier by its ID
 * @param {string} tierId - Tier identifier
 * @returns {SecurityTier|undefined}
 */
export function getTierById(tierId) {
  if (!tierId || typeof tierId !== 'string') return undefined;
  return SECURITY_TIERS.find(tier => tier.id === tierId.toLowerCase());
}

/**
 * Gets the default security tier
 * @returns {SecurityTier}
 */
export function getDefaultTier() {
  return SECURITY_TIERS.find(tier => tier.isDefault) || SECURITY_TIERS[1];
}

/**
 * Gets all features included in a specific tier
 * @param {string} tierId - Tier identifier
 * @returns {string[]}
 */
export function getTierFeatures(tierId) {
  const tier = getTierById(tierId);
  return tier ? [...tier.features] : [];
}

/**
 * Gets all features at or below a specific tier level
 * @param {string} tierId - Tier identifier
 * @returns {string[]}
 */
export function getAllFeaturesUpToTier(tierId) {
  const tier = getTierById(tierId);
  if (!tier) return [];
  const features = new Set();
  for (const t of SECURITY_TIERS) {
    if (t.order <= tier.order) {
      for (const feature of t.features) features.add(feature);
    }
  }
  return Array.from(features);
}

/**
 * Gets validator file paths for a feature
 * @param {string} featureCode - Feature code
 * @returns {string[]}
 */
export function getValidatorPaths(featureCode) {
  const paths = FEATURE_TO_VALIDATOR[featureCode];
  if (!paths) return [];
  return Array.isArray(paths) ? [...paths] : [paths];
}

/**
 * Gets all validator paths for a tier
 * @param {string} tierId - Tier identifier
 * @returns {string[]}
 */
export function getTierValidatorPaths(tierId) {
  const features = getTierFeatures(tierId);
  const paths = new Set();
  for (const feature of features) {
    for (const p of getValidatorPaths(feature)) paths.add(p);
  }
  return Array.from(paths);
}

/**
 * Compares two tiers and returns the comparison result
 * @param {string} tierA - First tier ID
 * @param {string} tierB - Second tier ID
 * @returns {number} -1 if A < B, 0 if equal, 1 if A > B
 */
export function compareTiers(tierA, tierB) {
  const a = getTierById(tierA);
  const b = getTierById(tierB);
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  if (a.order < b.order) return -1;
  if (a.order > b.order) return 1;
  return 0;
}

/**
 * Checks if a feature is included in a tier
 * @param {string} tierId - Tier identifier
 * @param {string} featureCode - Feature code
 * @returns {boolean}
 */
export function tierIncludesFeature(tierId, featureCode) {
  return getTierFeatures(tierId).includes(featureCode);
}

/**
 * Gets the minimum tier required for a feature
 * @param {string} featureCode - Feature code
 * @returns {string|undefined}
 */
export function getMinimumTierForFeature(featureCode) {
  const detail = FEATURE_DETAILS[featureCode];
  return detail ? detail.tier : undefined;
}

/**
 * Gets feature details by code
 * @param {string} featureCode - Feature code
 * @returns {FeatureDetail|undefined}
 */
export function getFeatureDetails(featureCode) {
  return FEATURE_DETAILS[featureCode];
}

/**
 * Gets all features grouped by their minimum tier
 * @returns {Object<string, string[]>}
 */
export function getFeaturesByTier() {
  const grouped = { essential: [], standard: [], advanced: [], enterprise: [], beta: [] };
  for (const [code, detail] of Object.entries(FEATURE_DETAILS)) {
    if (grouped[detail.tier]) grouped[detail.tier].push(code);
  }
  return grouped;
}

/**
 * Gets all features grouped by category
 * @returns {Object<string, string[]>}
 */
export function getFeaturesByCategory() {
  const grouped = {};
  for (const [code, detail] of Object.entries(FEATURE_DETAILS)) {
    if (!grouped[detail.category]) grouped[detail.category] = [];
    grouped[detail.category].push(code);
  }
  return grouped;
}

/**
 * Validates that a tier ID is valid
 * @param {string} tierId - Tier ID
 * @returns {boolean}
 */
export function isValidTierId(tierId) {
  return getTierById(tierId) !== undefined;
}

/**
 * Gets all valid tier IDs
 * @returns {string[]}
 */
export function getAllTierIds() {
  return SECURITY_TIERS.map(tier => tier.id);
}

/**
 * Gets tier display information for UI
 * @param {string} tierId - Tier ID
 * @returns {Object|undefined}
 */
export function getTierDisplayInfo(tierId) {
  const tier = getTierById(tierId);
  if (!tier) return undefined;
  return {
    id: tier.id,
    name: tier.name,
    description: tier.description,
    featureCount: tier.features.length,
    isDefault: tier.isDefault,
    isBeta: tier.isBeta,
    order: tier.order
  };
}

// ESM Entry point detection for testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Security Tier Definitions - Self-Test\n');
  console.log('='.repeat(60));
  for (const tier of SECURITY_TIERS) {
    const tags = (tier.isDefault ? ' [DEFAULT]' : '') + (tier.isBeta ? ' [BETA]' : '');
    console.log(`\n${tier.order}. ${tier.name}${tags}`);
    console.log(`   Features: ${tier.features.length}`);
    console.log(`   ${tier.description}`);
  }
  console.log('\n' + '='.repeat(60));
}
