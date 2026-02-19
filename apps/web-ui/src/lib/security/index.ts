/**
 * Security Module - Barrel Export
 *
 * Central exports for all security-related functionality.
 *
 * @module security
 */

// Types
export type {
  DetectionResult,
  PatternMatch,
  DetectionConfig,
  InjectionPatternCategory,
  InjectionPatterns,
  HeuristicPatterns,
  SanitizeOptions,
  SeverityLevel,
  CategoryScoreMap,
} from './types'

// Pattern library
export {
  INJECTION_PATTERNS,
  HEURISTIC_PATTERNS,
  CATEGORY_BASE_SCORES,
  DEFAULT_CONFIG,
  STRICT_CONFIG,
} from './prompt-injection-detector'

// Detection engine
export {
  PromptInjectionDetector,
  detector,
  detectPromptInjection,
  isInputSafe,
  analyzeInput,
  createStrictDetector,
  createDetector,
} from './prompt-injection-engine'

// Output filter (Story 9.3)
export {
  OutputFilter,
  outputFilter,
  filterOutput,
  wrapFilteredResponse,
  reviewQueue,
} from './output-filter'
export type {
  FilterResult,
  FilteredResponse,
} from './output-filter'

// Output filter patterns
export {
  OUTPUT_PATTERNS,
  CATEGORY_SEVERITY,
  DEFAULT_FILTER_CONFIG,
  SEVERITY_THRESHOLDS,
} from './patterns/output-patterns'

// Security headers (existing)
export {
  applySecurityHeaders,
  createSecureResponse,
  createSecureJSONResponse,
  createSecureErrorResponse,
  CSPolicies,
  applyRateLimitHeaders,
  getAllSecurityHeaders,
} from './security-headers'
export type { SecurityHeadersConfig } from './security-headers'

// OWASP Top 10 validators (Story 10.2)
export {
  // A01: Broken Access Control
  checkResourceAccess,
  checkRoleAccess,
  verifyProjectOwnership,
  checkCORSPolicy,
  // A02: Cryptographic Failures
  hashPassword,
  verifyPassword,
  getSecurityConfig,
  sanitizeForLogging,
  encryptField,
  decryptField,
  // A03: Injection
  sanitizeUserInput,
  sanitizeForDisplay,
  validateQueryObject,
  checkCommandWhitelist,
  validateLDAPInput,
  // A04: Insecure Design
  checkRateLimit,
  isRateLimited,
  checkAccountLockout,
  validateApproval,
  // A05: Security Misconfiguration
  getSecurityHeaders as getSecurityConfigHeaders,
  formatErrorResponse,
  getAppConfig,
  getCORSConfig,
  // A06: Vulnerable Components
  checkDependencyVulnerabilities,
  checkOutdatedDependencies,
  validateThirdPartyInput,
  // A07: Authentication Failures
  validatePassword,
  validateSessionTimeout,
  logout,
  validateSession,
  checkMFARequirement,
  generatePasswordResetToken,
  // A08: Data Integrity Failures
  signData,
  verifySignature,
  calculateHash,
  calculateChecksum,
  signAPIRequest,
  validateAPIRequest,
  // A09: Logging Failures
  logAuthAttempt,
  getRecentLogs,
  logAuthzFailure,
  createLogEntry,
  logEvent,
  hashLogEntry,
  verifyLogHash,
  // A10: SSRF
  validateURL,
  getTrustedDomains,
  addTrustedDomain,
} from './owasp-validator'
export type {
  User,
  AccessCheckResult,
  QueryValidationResult,
  LDAPValidationResult,
  RateLimitResult,
  VulnerabilityResult,
  ThirdPartyValidationResult,
  SignatureResult,
  LogEntry,
} from './owasp-validator'
