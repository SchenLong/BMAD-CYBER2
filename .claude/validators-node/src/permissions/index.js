/**
 * BMAD Validators - Permissions Module
 * =====================================
 * Token validation, RBAC permission checking, and supply chain verification.
 */
export { 
// Session caching functions
isSessionRecentlyValidated, markSessionValidated, getCachedClaims, saveSessionClaims, 
// Permission checking
checkFilePermissions, 
// Token validation
parseClaimsFromOutput, extractErrorFromOutput, validateTokenWithScript, validateToken, 
// RBAC
validateRbac, 
// Output
printAuthFailure, 
// Main
main, } from './token-validator.js';
export { 
// Class
SupplyChainVerifier, 
// Functions
getVerifier, verifySkillIntegrity, verifyFileIntegrity, generateManifest, addTrustedKey, validateSupplyChain, 
// Main entry point (aliased to avoid conflict)
main as supplyChainMain, } from './supply-chain.js';
export { 
// Constants
CAPABILITIES, DEFAULT_PERMISSIONS, RBAC_PERMISSIONS, DANGEROUS_COMMANDS, CAPABILITY_MAPPING, 
// Classes
PluginPermissionChecker, 
// Functions
getPermissionChecker, checkPluginPermission, detectPluginFromPath, generateManifestTemplate, generateAllManifests, validatePluginPermission, 
// Main entry point (aliased to avoid conflict)
main as pluginPermissionsMain, } from './plugin-permissions.js';
//# sourceMappingURL=index.js.map