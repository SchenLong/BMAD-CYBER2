/**
 * BMAD Validators - Resource Management Module
 * =============================================
 * Re-exports all resource management validators.
 */

// Rate Limiter
export {
  RateLimiter,
  getRateLimiter,
  checkRateLimit,
  recordOperation,
  getRateStatus,
  validateRateLimit,
  type RateLimitState,
  type RateLimitCheckResult,
  type RateLimitStatus,
  type RequestRecord,
} from './rate-limiter.js';

// Resource Limits
export {
  ResourceLimiter,
  getResourceLimiter,
  checkResourceLimits,
  checkMemoryAvailable,
  validateResourceLimits,
  type ResourceLimits,
  type ResourceCheckResult,
  type TrackedProcess,
  type ResourceState,
} from './resource-limits.js';

// Recursion Guard
export {
  RecursionGuard,
  getRecursionGuard,
  checkRecursionLimit,
  checkCircularReference,
  validateRecursion,
  type RecursionLimits,
  type RecursionState,
  type RecursionCheckResult,
} from './recursion-guard.js';

// Context Manager
export {
  ContextManager,
  getContextManager,
  checkContextCapacity,
  estimateOperationCost,
  validateContextCapacity,
  type TokenEstimate,
  type ContextStatus,
  type ContextState,
} from './context-manager.js';
