/**
 * BMAD Validators - Permissions Module
 * =====================================
 * Token validation, RBAC permission checking, and supply chain verification.
 */

export {
  // Types
  type TokenClaims,
  type TokenValidationResult,
  type PermissionCheckResult,
  type RbacValidationResult,
  // Session caching functions
  isSessionRecentlyValidated,
  markSessionValidated,
  getCachedClaims,
  saveSessionClaims,
  // Permission checking
  checkFilePermissions,
  // Token validation
  parseClaimsFromOutput,
  extractErrorFromOutput,
  validateTokenWithScript,
  validateToken,
  // RBAC
  validateRbac,
  // Output
  printAuthFailure,
  // Main
  main,
} from './token-validator.js';

export {
  // Types - aliased to avoid conflict with observability/audit-integrity.ts
  type VerificationResult as SupplyChainVerificationResult,
  type ManifestEntry,
  type VerificationStatus,
  // Class
  SupplyChainVerifier,
  // Functions
  getVerifier,
  verifySkillIntegrity,
  verifyFileIntegrity,
  generateManifest,
  addTrustedKey,
  validateSupplyChain,
  // Main entry point (aliased to avoid conflict)
  main as supplyChainMain,
} from './supply-chain.js';

export {
  // Types
  type PluginManifest,
  type PermissionCheck,
  type PluginInfo,
  type PluginPermissions,
  type FilesystemPermissions,
  type ShellPermissions,
  type RBACPermissions,
  type CapabilityDefinition,
  // Constants
  CAPABILITIES,
  DEFAULT_PERMISSIONS,
  RBAC_PERMISSIONS,
  DANGEROUS_COMMANDS,
  CAPABILITY_MAPPING,
  // Classes
  PluginPermissionChecker,
  // Functions
  getPermissionChecker,
  checkPluginPermission,
  detectPluginFromPath,
  generateManifestTemplate,
  generateAllManifests,
  validatePluginPermission,
  // Main entry point (aliased to avoid conflict)
  main as pluginPermissionsMain,
} from './plugin-permissions.js';
