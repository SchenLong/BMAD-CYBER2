/**
 * BMAD Validators - Rate Limiter
 * ==============================
 * Sliding window rate limiting for Claude Code operations.
 * Prevents resource exhaustion attacks (OWASP LLM04).
 *
 * Features:
 * - Per-operation rate limits (bash, write, read, etc.)
 * - Global rate limit across all operations
 * - Sliding window algorithm (60-second window)
 * - Exponential backoff on violations
 * - Whitelist bypass for critical operations
 * - Persistent state across validator invocations
 *
 * Session-Aware Rate Limiting (NEW):
 * - Rate limits are shared across all agents in a session
 * - Subagents count against the same session-level limits
 * - Configurable multiplier for parallel execution (BMAD_RATE_LIMIT_MULTIPLIER)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
import { AuditLogger } from '../common/audit-logger.js';
import { getToolInputFromStdinSync } from '../common/stdin-parser.js';
import { EXIT_CODES } from '../types/index.js';

// Try to import telemetry (graceful fallback)
let recordRateLimitMetrics: ((params: {
  operationType: string;
  requestsCount: number;
  limit: number;
  windowSeconds: number;
  windowRemainingS: number;
  backoffActive?: boolean;
  backoffRemainingS?: number;
  backoffMultiplier?: number;
}) => boolean) | null = null;

try {
  const telemetry = await import('../observability/telemetry.js');
  recordRateLimitMetrics = telemetry.recordRateLimitMetrics;
} catch {
  // Telemetry not available
}

// Configuration
const WINDOW_SECONDS = 60;
const CLEANUP_INTERVAL_SECONDS = 10;

// Exponential backoff configuration
const BACKOFF_BASE_SECONDS = 1;
const BACKOFF_MAX_SECONDS = 60;
const BACKOFF_MULTIPLIER = 2;
const BACKOFF_MAX_VIOLATIONS = 10;

// Rate limit multiplier for parallel/subagent execution
// Default is 10x to support parallel workloads with subagents
// Override with BMAD_RATE_LIMIT_MULTIPLIER env var if needed
const RATE_LIMIT_MULTIPLIER = parseFloat(process.env['BMAD_RATE_LIMIT_MULTIPLIER'] || '10');

// Base rate limits per minute (multiplied by RATE_LIMIT_MULTIPLIER)
const BASE_RATE_LIMITS: Record<string, number> = {
  global: 150,
  bash: 60,
  write: 100,
  edit: 100,
  read: 400,
  glob: 200,
  grep: 200,
  task: 40,
  webfetch: 30,
  websearch: 20,
  skill: 30,
};

// Apply multiplier to rate limits
const RATE_LIMITS: Record<string, number> = Object.fromEntries(
  Object.entries(BASE_RATE_LIMITS).map(([key, value]) => [
    key,
    Math.floor(value * RATE_LIMIT_MULTIPLIER),
  ])
);

// Whitelist - operations that bypass rate limiting
const WHITELIST: Record<string, string[]> = {
  read: [
    '.claude/settings.json',
    '.claude/validators/',
    'CLAUDE.md',
  ],
  bash: [
    'git status',
    'git log',
    'git diff',
  ],
};

// Tool name to operation mapping
const TOOL_MAPPING: Record<string, string> = {
  bash: 'bash',
  write: 'write',
  edit: 'edit',
  read: 'read',
  glob: 'glob',
  grep: 'grep',
  task: 'task',
  webfetch: 'webfetch',
  websearch: 'websearch',
  skill: 'skill',
};

// Interfaces
export interface RequestRecord {
  timestamp: number;
  target: string;
}

export interface RateLimitState {
  requests: Record<string, RequestRecord[]>;
  violations: Record<string, number>;
  backoff_until: Record<string, number>;
  last_cleanup: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason: string;
  operation: string;
  count: number;
  limit: number;
  retryAfter?: number;
}

export interface RateLimitStatus {
  operations: Record<string, {
    count: number;
    limit: number;
    percentage: number;
    backoffActive: boolean;
    backoffRemaining: number;
  }>;
  globalCount: number;
  globalLimit: number;
  globalPercentage: number;
}

/**
 * Rate limiter with sliding window algorithm.
 */
export class RateLimiter {
  private stateFile: string;

  constructor() {
    const projectDir = getProjectDir();
    const claudeDir = path.join(projectDir, '.claude');

    // Ensure directory exists
    fs.mkdirSync(claudeDir, { recursive: true });

    this.stateFile = path.join(claudeDir, '.rate_limit_state.json');
  }

  /**
   * Load state from file.
   */
  private loadState(): RateLimitState {
    try {
      if (fs.existsSync(this.stateFile)) {
        const content = fs.readFileSync(this.stateFile, 'utf-8');
        return JSON.parse(content) as RateLimitState;
      }
    } catch {
      // Return initial state on error
    }
    return this.initialState();
  }

  /**
   * Get initial empty state.
   */
  private initialState(): RateLimitState {
    return {
      requests: {},
      violations: {},
      backoff_until: {},
      last_cleanup: Date.now() / 1000,
    };
  }

  /**
   * Save state atomically.
   */
  private saveState(state: RateLimitState): void {
    const dir = path.dirname(this.stateFile);
    const tempFile = path.join(dir, `.rate_limit_${Date.now()}_${Math.random().toString(36).slice(2)}`);

    try {
      fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
      fs.renameSync(tempFile, this.stateFile);
    } catch (e) {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }
      throw e;
    }
  }

  /**
   * Clean up old requests outside the sliding window.
   */
  private cleanupOldRequests(state: RateLimitState, currentTime: number): RateLimitState {
    // Only cleanup every CLEANUP_INTERVAL_SECONDS
    if (currentTime - state.last_cleanup < CLEANUP_INTERVAL_SECONDS) {
      return state;
    }

    const windowStart = currentTime - WINDOW_SECONDS;

    for (const operation of Object.keys(state.requests)) {
      const opRequests = state.requests[operation];
      if (opRequests) {
        state.requests[operation] = opRequests.filter(
          req => req.timestamp > windowStart
        );

        // Remove empty arrays
        const updatedRequests = state.requests[operation];
        if (updatedRequests && updatedRequests.length === 0) {
          delete state.requests[operation];
        }
      }
    }

    state.last_cleanup = currentTime;
    return state;
  }

  /**
   * Count requests within the sliding window.
   */
  private getRequestsInWindow(state: RateLimitState, operation: string, currentTime: number): number {
    const windowStart = currentTime - WINDOW_SECONDS;
    const requests = state.requests[operation] || [];
    return requests.filter(r => r.timestamp > windowStart).length;
  }

  /**
   * Get total requests across all operations.
   */
  private getGlobalRequestsInWindow(state: RateLimitState, currentTime: number): number {
    const windowStart = currentTime - WINDOW_SECONDS;
    let total = 0;

    for (const requests of Object.values(state.requests)) {
      total += requests.filter(r => r.timestamp > windowStart).length;
    }

    return total;
  }

  /**
   * Check if operation/target is whitelisted.
   */
  private isWhitelisted(operation: string, target: string): boolean {
    const whitelist = WHITELIST[operation];
    if (!whitelist) {
      return false;
    }

    return whitelist.some(pattern => target.includes(pattern));
  }

  /**
   * Calculate exponential backoff duration.
   */
  private calculateBackoff(violations: number): number {
    const cappedViolations = Math.min(violations, BACKOFF_MAX_VIOLATIONS);
    const backoff = BACKOFF_BASE_SECONDS * Math.pow(BACKOFF_MULTIPLIER, cappedViolations);
    return Math.min(backoff, BACKOFF_MAX_SECONDS);
  }

  /**
   * Check if an operation is within rate limits.
   */
  checkLimit(operation: string, target: string = ''): RateLimitCheckResult {
    const currentTime = Date.now() / 1000;
    const globalLimitVal = RATE_LIMITS['global'] ?? 1500;

    // Check whitelist first
    if (this.isWhitelisted(operation, target)) {
      return {
        allowed: true,
        reason: 'Whitelisted operation',
        operation,
        count: 0,
        limit: RATE_LIMITS[operation] ?? globalLimitVal,
      };
    }

    let state = this.loadState();
    state = this.cleanupOldRequests(state, currentTime);

    // Check backoff
    const backoffUntil = state.backoff_until[operation] || 0;
    if (currentTime < backoffUntil) {
      const remaining = Math.ceil(backoffUntil - currentTime);
      return {
        allowed: false,
        reason: `Backoff active. Retry in ${remaining}s`,
        operation,
        count: this.getRequestsInWindow(state, operation, currentTime),
        limit: RATE_LIMITS[operation] ?? globalLimitVal,
        retryAfter: remaining,
      };
    }

    // Check global limit
    const globalCount = this.getGlobalRequestsInWindow(state, currentTime);
    const globalLimit = globalLimitVal;
    if (globalCount >= globalLimit) {
      this.handleViolation(state, 'global', currentTime);
      return {
        allowed: false,
        reason: `Global rate limit exceeded (${globalCount}/${globalLimit})`,
        operation: 'global',
        count: globalCount,
        limit: globalLimit,
        retryAfter: this.getRetryAfter('global', state, currentTime),
      };
    }

    // Check operation-specific limit
    const opLimit = RATE_LIMITS[operation] ?? globalLimitVal;
    const opCount = this.getRequestsInWindow(state, operation, currentTime);

    if (opCount >= opLimit) {
      this.handleViolation(state, operation, currentTime);
      return {
        allowed: false,
        reason: `Operation limit exceeded (${opCount}/${opLimit})`,
        operation,
        count: opCount,
        limit: opLimit,
        retryAfter: this.getRetryAfter(operation, state, currentTime),
      };
    }

    return {
      allowed: true,
      reason: 'Within limits',
      operation,
      count: opCount,
      limit: opLimit,
    };
  }

  /**
   * Handle a rate limit violation.
   */
  private handleViolation(state: RateLimitState, operation: string, currentTime: number): void {
    const violations = (state.violations[operation] || 0) + 1;
    state.violations[operation] = violations;

    const backoffDuration = this.calculateBackoff(violations);
    state.backoff_until[operation] = currentTime + backoffDuration;

    this.saveState(state);

    AuditLogger.logSync('rate_limiter', 'RATE_LIMIT_EXCEEDED', {
      operation,
      violations,
      backoff_seconds: backoffDuration,
    }, 'WARNING');
  }

  /**
   * Record a request for rate limiting.
   */
  recordRequest(operation: string, target: string = ''): void {
    const currentTime = Date.now() / 1000;
    let state = this.loadState();
    state = this.cleanupOldRequests(state, currentTime);

    if (!state.requests[operation]) {
      state.requests[operation] = [];
    }

    const opRequests = state.requests[operation];
    if (opRequests) {
      opRequests.push({
        timestamp: currentTime,
        target: target.slice(0, 200), // Truncate long targets
      });
    }

    this.saveState(state);

    // Record telemetry
    if (recordRateLimitMetrics) {
      const globalLimitVal = RATE_LIMITS['global'] ?? 1500;
      const limit = RATE_LIMITS[operation] ?? globalLimitVal;
      const count = this.getRequestsInWindow(state, operation, currentTime);
      const backoffUntil = state.backoff_until[operation] || 0;

      recordRateLimitMetrics({
        operationType: operation,
        requestsCount: count,
        limit,
        windowSeconds: WINDOW_SECONDS,
        windowRemainingS: Math.max(0, WINDOW_SECONDS - (currentTime - (state.last_cleanup || currentTime))),
        backoffActive: currentTime < backoffUntil,
        backoffRemainingS: Math.max(0, backoffUntil - currentTime),
        backoffMultiplier: state.violations[operation] || 0,
      });
    }
  }

  /**
   * Get seconds until rate limit resets.
   */
  getRetryAfter(operation: string, state?: RateLimitState, currentTime?: number): number {
    state = state || this.loadState();
    currentTime = currentTime || Date.now() / 1000;

    // Check backoff first
    const backoffUntil = state.backoff_until[operation] || 0;
    if (currentTime < backoffUntil) {
      return Math.ceil(backoffUntil - currentTime);
    }

    // Find oldest request in window
    const requests = state.requests[operation] || [];
    if (requests.length === 0) {
      return 0;
    }

    const windowStart = currentTime - WINDOW_SECONDS;
    const windowRequests = requests.filter(r => r.timestamp > windowStart);

    if (windowRequests.length === 0) {
      return 0;
    }

    const oldestTimestamp = Math.min(...windowRequests.map(r => r.timestamp));
    return Math.max(0, Math.ceil(oldestTimestamp + WINDOW_SECONDS - currentTime));
  }

  /**
   * Get current rate limit status.
   */
  getStatus(): RateLimitStatus {
    const currentTime = Date.now() / 1000;
    let state = this.loadState();
    state = this.cleanupOldRequests(state, currentTime);

    const operations: RateLimitStatus['operations'] = {};

    for (const [operation, limit] of Object.entries(RATE_LIMITS)) {
      if (operation === 'global') continue;

      const count = this.getRequestsInWindow(state, operation, currentTime);
      const backoffUntil = state.backoff_until[operation] || 0;

      operations[operation] = {
        count,
        limit,
        percentage: limit > 0 ? (count / limit) * 100 : 0,
        backoffActive: currentTime < backoffUntil,
        backoffRemaining: Math.max(0, backoffUntil - currentTime),
      };
    }

    const globalCount = this.getGlobalRequestsInWindow(state, currentTime);
    const globalLimitVal = RATE_LIMITS['global'] ?? 1500;

    return {
      operations,
      globalCount,
      globalLimit: globalLimitVal,
      globalPercentage: globalLimitVal > 0 ? (globalCount / globalLimitVal) * 100 : 0,
    };
  }

  /**
   * Reset rate limit state.
   */
  reset(operation?: string): void {
    if (operation) {
      const state = this.loadState();
      delete state.requests[operation];
      delete state.violations[operation];
      delete state.backoff_until[operation];
      this.saveState(state);
    } else {
      this.saveState(this.initialState());
    }

    AuditLogger.logSync('rate_limiter', 'RATE_LIMIT_RESET', {
      operation: operation || 'all',
    }, 'INFO');
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Get or create the singleton rate limiter instance.
 */
export function getRateLimiter(): RateLimiter {
  if (rateLimiterInstance === null) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Convenience function to check rate limit.
 */
export function checkRateLimit(operation: string, target: string = ''): [boolean, string | null] {
  const limiter = getRateLimiter();
  const result = limiter.checkLimit(operation, target);
  return [result.allowed, result.allowed ? null : result.reason];
}

/**
 * Convenience function to record an operation.
 */
export function recordOperation(operation: string, target: string = ''): void {
  getRateLimiter().recordRequest(operation, target);
}

/**
 * Convenience function to get rate limit status.
 */
export function getRateStatus(): RateLimitStatus {
  return getRateLimiter().getStatus();
}

/**
 * Print block message to stderr.
 */
function printBlockMessage(result: RateLimitCheckResult): void {
  console.error('');
  console.error('='.repeat(60));
  console.error('RATE LIMIT EXCEEDED');
  console.error('='.repeat(60));
  console.error(`Operation: ${result.operation}`);
  console.error(`Current: ${result.count}/${result.limit} requests in last 60s`);
  console.error(`Reason: ${result.reason}`);
  if (result.retryAfter) {
    console.error(`Retry after: ${result.retryAfter} seconds`);
  }
  console.error('='.repeat(60));
  console.error('');
}

/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates rate limits.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export function validateRateLimit(): number {
  try {
    // Read from stdin synchronously (prevents hang on EOF issues)
    const input = getToolInputFromStdinSync();

    if (!input.tool_name) {
      return EXIT_CODES.ALLOW;
    }

    const toolName = input.tool_name.toLowerCase();
    const toolInput = input.tool_input || {};

    // Map tool name to operation
    const operation = TOOL_MAPPING[toolName] || toolName;

    // Get target for whitelist checking
    let target = '';
    if (toolInput.command) {
      target = String(toolInput.command);
    } else if (toolInput.file_path) {
      target = String(toolInput.file_path);
    } else if (toolInput.path) {
      target = String(toolInput.path);
    } else if (toolInput.url) {
      target = String(toolInput.url);
    }

    const limiter = getRateLimiter();
    const result = limiter.checkLimit(operation, target);

    if (!result.allowed) {
      printBlockMessage(result);
      AuditLogger.logSync('rate_limiter', 'BLOCKED', {
        tool_name: toolName,
        operation,
        target: target.slice(0, 200),
        reason: result.reason,
        count: result.count,
        limit: result.limit,
      }, 'BLOCKED');
      return EXIT_CODES.SOFT_BLOCK;
    }

    // Record the request
    limiter.recordRequest(operation, target);

    return EXIT_CODES.ALLOW;
  } catch (e) {
    // On error, allow the operation (fail open for availability)
    console.error(`Rate limiter error: ${e}`);
    return EXIT_CODES.ALLOW;
  }
}

/**
 * CLI entry point for bin/ invocation.
 */
export function main(): void {
  process.exit(validateRateLimit());
}

// CLI entry point (direct execution)
if (process.argv[1]?.endsWith('rate-limiter.js') || process.argv[1]?.endsWith('rate-limiter.ts')) {
  main();
}
