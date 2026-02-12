/**
 * BMAD Validators - Override Manager
 * ====================================
 * Manages single-use override tokens with timeout and TOCTOU protection.
 *
 * Instead of allowing global environment variables to persist indefinitely,
 * this manager creates time-limited, single-use override tokens.
 *
 * Override workflow:
 * 1. User sets BMAD_ALLOW_<TYPE>=true
 * 2. First validator to check consumes the override (atomic)
 * 3. Override becomes invalid after use OR after timeout
 *
 * Security Note:
 *   Uses atomic file operations to prevent race conditions where multiple
 *   processes could consume the same override.
 *
 * Session Context Integration (NEW):
 *   When BMAD_SESSION_PERMISSIONS=true, overrides are session-scoped:
 *   - Permissions granted to parent session apply to all subagents
 *   - Subagents inherit permissions without consuming them
 *   - Session permissions persist for the session duration (not single-use)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { OverrideCheckResult, OverrideState, OverrideStatus, OverrideTokenInfo } from '../types/index.js';
import { getProjectDir } from './path-utils.js';
import { checkSessionPermission, SessionContext } from './session-context.js';

// Configuration
const OVERRIDE_TIMEOUT_SECONDS = 300; // 5 minutes
const LOCK_TIMEOUT_MS = 10000; // 10 seconds (extended for SEC-001-3)
const LOCK_RETRY_INTERVAL_MS = 50;

/**
 * Get the override state file path.
 */
function getOverrideFile(): string {
  return path.join(getProjectDir(), '.claude', '.override_state.json');
}

/**
 * Get the override lock file path.
 */
function getLockFile(): string {
  return path.join(getProjectDir(), '.claude', '.override.lock');
}

/**
 * Acquire an exclusive lock using a lock file.
 * Uses a simple retry mechanism with file creation.
 *
 * @param timeout - Maximum time to wait for lock in ms
 * @returns Lock file descriptor or null if timeout
 */
function acquireLock(timeout: number = LOCK_TIMEOUT_MS): number | null {
  const lockFile = getLockFile();
  const dir = path.dirname(lockFile);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });

  const startTime = Date.now();

  while (true) {
    try {
      // Try to create lock file exclusively (O_EXCL)
      const fd = fs.openSync(lockFile, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_RDWR);
      return fd;
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'EEXIST') {
        // Lock file exists, check for stale lock
        try {
          const stats = fs.statSync(lockFile);
          const age = Date.now() - stats.mtimeMs;
          // If lock is older than 30 seconds, consider it stale
          if (age > 30000) {
            fs.unlinkSync(lockFile);
            continue;
          }
        } catch {
          // Lock file may have been removed, retry
        }

        if (Date.now() - startTime > timeout) {
          return null;
        }

        // Wait and retry
        const sleepMs = LOCK_RETRY_INTERVAL_MS;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sleepMs);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Release the lock and close file descriptor.
 */
function releaseLock(fd: number): void {
  try {
    fs.closeSync(fd);
  } catch {
    // Ignore close errors
  }

  try {
    fs.unlinkSync(getLockFile());
  } catch {
    // Ignore unlink errors
  }
}

/**
 * Load override state from file.
 */
function loadState(): OverrideState {
  try {
    const overrideFile = getOverrideFile();
    if (fs.existsSync(overrideFile)) {
      const content = fs.readFileSync(overrideFile, 'utf8');
      return JSON.parse(content) as OverrideState;
    }
  } catch {
    // Return default state on error
  }

  return {
    overrides: {},
    created_at: {},
  };
}

/**
 * Save state atomically using temp file + rename.
 * This ensures partial writes never corrupt the state file.
 */
function saveStateAtomic(state: OverrideState): void {
  const overrideFile = getOverrideFile();
  const dir = path.dirname(overrideFile);

  fs.mkdirSync(dir, { recursive: true });

  // Create temp file in same directory for atomic rename
  const tempFile = path.join(dir, `.override_${process.pid}_${Date.now()}.tmp`);

  const stateWithTimestamp = {
    ...state,
    last_update: Date.now() / 1000,
  };

  fs.writeFileSync(tempFile, JSON.stringify(stateWithTimestamp, null, 2));

  // Atomic rename (POSIX guarantees atomicity on same filesystem)
  fs.renameSync(tempFile, overrideFile);
}

/**
 * Remove expired overrides from state.
 */
function cleanupExpired(state: OverrideState): OverrideState {
  const currentTime = Date.now() / 1000;
  const expired: string[] = [];

  for (const key of Object.keys(state.created_at)) {
    const createdAt = state.created_at[key];
    if (createdAt !== undefined && currentTime - createdAt > OVERRIDE_TIMEOUT_SECONDS) {
      expired.push(key);
    }
  }

  for (const key of expired) {
    delete state.overrides[key];
    delete state.created_at[key];
  }

  return state;
}

/**
 * Override Manager class for managing single-use override tokens.
 */
export class OverrideManager {
  /**
   * Register an override from environment variable.
   * Called when env var is detected but not yet consumed.
   *
   * @param overrideType - The type of override (e.g., 'DANGEROUS', 'SECRETS')
   */
  static register(overrideType: string): void {
    const lockFd = acquireLock();
    if (lockFd === null) {
      // Log warning but don't fail
      console.error(`[override_manager] LOCK_TIMEOUT: Could not acquire lock to register ${overrideType}`);
      return;
    }

    try {
      let state = loadState();
      state = cleanupExpired(state);

      state.overrides[overrideType] = true;
      state.created_at[overrideType] = Date.now() / 1000;

      saveStateAtomic(state);
    } finally {
      releaseLock(lockFd);
    }
  }

  /**
   * Check if override is available and consume it atomically.
   * Uses validator identification to prevent race conditions (SEC-001-3).
   *
   * NEW: Session-scoped permissions
   *   When BMAD_SESSION_PERMISSIONS=true (default), permissions are session-scoped:
   *   - First check session context for inherited permissions
   *   - If not in session, fall back to single-use override behavior
   *   - Subagents automatically inherit parent session permissions
   *
   * @param overrideType - The type of override to check
   * @param validatorName - Optional name of the validator consuming the token
   * @returns Result with validity and reason
   */
  static checkAndConsume(overrideType: string, validatorName?: string): OverrideCheckResult {
    // Check if session-scoped permissions are enabled (default: true)
    const sessionPermEnv = process.env['BMAD_SESSION_PERMISSIONS'];
    const useSessionPermissions = sessionPermEnv !== 'false';

    // DEBUG logging (can be removed after testing)
    if (process.env['DEBUG_SESSION']) {
      console.error(`[DEBUG] BMAD_SESSION_PERMISSIONS env: '${sessionPermEnv}', useSessionPermissions: ${useSessionPermissions}`);
    }

    if (useSessionPermissions) {
      // Check session context for inherited permissions first
      const sessionResult = checkSessionPermission(overrideType, validatorName);

      if (process.env['DEBUG_SESSION']) {
        console.error(`[DEBUG] checkSessionPermission result:`, JSON.stringify(sessionResult));
      }

      if (sessionResult.allowed) {
        return {
          valid: true,
          reason: sessionResult.reason + (sessionResult.inherited ? ' [inherited from session]' : ''),
        };
      }

      // If session exists but permission not granted, provide helpful message
      if (sessionResult.sessionId !== 'unknown') {
        // Continue to check env var below - it might grant the permission
      }
    }

    // Check environment variable
    const envVar = `BMAD_ALLOW_${overrideType.toUpperCase()}`;
    const envValue = (process.env[envVar] || '').toLowerCase();

    if (process.env['DEBUG_SESSION']) {
      console.error(`[DEBUG] envVar: ${envVar}, envValue: '${envValue}'`);
    }

    if (envValue !== 'true') {
      // If using session permissions, provide a more helpful message
      if (useSessionPermissions) {
        return {
          valid: false,
          reason: `Override ${envVar} not set. Set it to grant permission to this session and all subagents.`,
        };
      }
      return { valid: false, reason: 'Override not set' };
    }

    // Environment variable is set - grant to session if using session permissions
    if (useSessionPermissions) {
      if (process.env['DEBUG_SESSION']) {
        console.error(`[DEBUG] Granting to session context...`);
      }
      // Grant permission to session context so subagents inherit it
      SessionContext.grantPermission(overrideType, {
        consumable: false,  // Session-wide, not single-use
        reason: `Granted via ${envVar} environment variable`,
      });

      return {
        valid: true,
        reason: `Override ${envVar} granted to session (subagents will inherit this permission)`,
      };
    }

    const lockFd = acquireLock();
    if (lockFd === null) {
      // Log warning with extended timeout info
      console.error(`[override_manager] LOCK_TIMEOUT (10s): Could not acquire lock for ${overrideType}`);
      return { valid: false, reason: 'Override system busy (lock timeout after 10s), please retry' };
    }

    try {
      let state = loadState();
      state = cleanupExpired(state);

      // Initialize consumed_by tracking if not present
      if (!state.consumed_by) {
        state.consumed_by = {};
      }

      // Check if this is a new override (from env) or existing token
      if (!(overrideType in state.overrides)) {
        // New override from environment - register and consume atomically
        const token: OverrideTokenInfo = {
          available: false,
          consumed_by: validatorName || 'unknown',
          consumed_at: Date.now(),
        };
        state.overrides[overrideType] = false; // Mark as consumed
        state.created_at[overrideType] = Date.now() / 1000;
        state.consumed_by[overrideType] = token;
        saveStateAtomic(state);
        return { valid: true, reason: `Override ${envVar} consumed by ${validatorName || 'validator'} (single-use)` };
      }

      // Check if already consumed - provide details about who consumed it
      if (!state.overrides[overrideType]) {
        const consumedBy = state.consumed_by?.[overrideType];
        const consumedByInfo = consumedBy?.consumed_by ? ` by ${consumedBy.consumed_by}` : '';
        return {
          valid: false,
          reason: `Override ${envVar} already consumed${consumedByInfo} - set again for new operation`,
        };
      }

      // Consume the override atomically with validator tracking
      state.overrides[overrideType] = false;
      state.consumed_by[overrideType] = {
        available: false,
        consumed_by: validatorName || 'unknown',
        consumed_at: Date.now(),
      };
      saveStateAtomic(state);

      return { valid: true, reason: `Override ${envVar} consumed by ${validatorName || 'validator'} (single-use)` };
    } finally {
      releaseLock(lockFd);
    }
  }

  /**
   * Get current status of all overrides (for debugging/admin).
   */
  static getStatus(): Record<string, OverrideStatus> | { error: string } {
    const lockFd = acquireLock(1000); // Short timeout for status check
    if (lockFd === null) {
      return { error: 'Could not acquire lock for status check' };
    }

    try {
      let state = loadState();
      state = cleanupExpired(state);

      const status: Record<string, OverrideStatus> = {};
      const currentTime = Date.now() / 1000;

      for (const key of Object.keys(state.overrides)) {
        const createdAt = state.created_at[key] || 0;
        const remaining = Math.max(0, OVERRIDE_TIMEOUT_SECONDS - (currentTime - createdAt));

        status[key] = {
          available: state.overrides[key] ?? false,
          seconds_remaining: Math.floor(remaining),
          expired: remaining === 0,
        };
      }

      return status;
    } finally {
      releaseLock(lockFd);
    }
  }
}
