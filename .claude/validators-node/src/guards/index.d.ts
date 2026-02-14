/**
 * BMAD Validators - Guards Module
 * ================================
 * Re-exports all security guard validators.
 */
export { validateBashCommand, detectCommandSubstitution, extractRmTargets, checkDangerousRm, checkDirectoryEscape, checkDangerousPatterns, main as bashSafetyMain, } from './bash-safety.js';
export { validateEnvProtection, isProtectedFile, isAllowedPattern, main as envProtectionMain, } from './env-protection.js';
export { validateOutsideRepo, extractPathsFromCommand, detectUnsafeSubstitutions, checkBashCommand, checkFilePath, main as outsideRepoMain, } from './outside-repo.js';
export { validateProductionGuard, isDocumentationFile, isSafeContext, isCriticalDeployCommand, detectProductionIndicators, main as productionGuardMain, } from './production.js';
export { validateSecretGuard, detectSecrets, calculateEntropy, isHighEntropy, isExpectedSecretFile, isExampleContent, main as secretGuardMain, } from './secret.js';
export { validatePiiGuard, detectPii, isTestFile, isSensitiveContext, isFakeData, main as piiGuardMain, } from './pii/index.js';
export * as piiValidators from './pii/validators.js';
export { US_PATTERNS, EU_PATTERNS, COMMON_PATTERNS, ALL_PATTERNS, SENSITIVE_CONTEXT_PATTERNS, FAKE_DATA_INDICATORS, TEST_FILE_INDICATORS, } from './pii/patterns.js';
export type { PiiPattern, Severity as PiiSeverity } from './pii/patterns.js';
export type { PiiDetection } from './pii/index.js';
