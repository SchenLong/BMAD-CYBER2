/**
 * BMAD Validators - Permissions Module
 * =====================================
 * Token validation, RBAC permission checking, and supply chain verification.
 */
export { type TokenClaims, type TokenValidationResult, type PermissionCheckResult, type RbacValidationResult, isSessionRecentlyValidated, markSessionValidated, getCachedClaims, saveSessionClaims, checkFilePermissions, parseClaimsFromOutput, extractErrorFromOutput, validateTokenWithScript, validateToken, validateRbac, printAuthFailure, main, } from './token-validator.js';
export { type VerificationResult as SupplyChainVerificationResult, type ManifestEntry, type VerificationStatus, SupplyChainVerifier, getVerifier, verifySkillIntegrity, verifyFileIntegrity, generateManifest, addTrustedKey, validateSupplyChain, main as supplyChainMain, } from './supply-chain.js';
export { type PluginManifest, type PermissionCheck, type PluginInfo, type PluginPermissions, type FilesystemPermissions, type ShellPermissions, type RBACPermissions, type CapabilityDefinition, CAPABILITIES, DEFAULT_PERMISSIONS, RBAC_PERMISSIONS, DANGEROUS_COMMANDS, CAPABILITY_MAPPING, PluginPermissionChecker, getPermissionChecker, checkPluginPermission, detectPluginFromPath, generateManifestTemplate, generateAllManifests, validatePluginPermission, main as pluginPermissionsMain, } from './plugin-permissions.js';
