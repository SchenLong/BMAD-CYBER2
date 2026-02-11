/**
 * BMAD Guardrails: Token Validator
 * =================================
 * Validates authentication tokens at session start and optionally on each tool use.
 *
 * This validator enforces token-based authentication for BMAD sessions,
 * ensuring only authorized users can interact with the system.
 *
 * Exit Codes:
 * - 0: Token valid, session authorized
 * - 2: Token invalid or missing, block operation (HARD_BLOCK)
 *
 * Environment Variables:
 * - BMAD_AUTH_TOKEN: Token string (optional, uses file if not set)
 * - BMAD_TOKEN_REQUIRED: Set to 'false' to disable enforcement (default: true)
 * - CLAUDE_PROJECT_DIR: Project root directory
 *
 * Token File Locations:
 * - .bmad-token: Token file (600 permissions required)
 * - .bmad-key: Encryption key file (600 permissions required)
 */

import { spawnSync } from 'child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';
import { AuditLogger, getProjectDir, printBlockMessage } from '../common/index.js';
import { EXIT_CODES } from '../types/index.js';

// ============================================================================
// Constants
// ============================================================================

const VALIDATOR_NAME = 'token_validator';

/** Get paths based on project directory */
function getPaths() {
  const projectDir = getProjectDir();
  return {
    TOKEN_FILE: join(projectDir, '.bmad-token'),
    KEY_FILE: join(projectDir, '.bmad-key'),
    VALIDATION_SCRIPT: join(projectDir, 'src/core/security/validate-token.js'),
    SESSION_VALIDATED_FILE: join(projectDir, '.claude', '.session_validated'),
    SESSION_CLAIMS_FILE: join(projectDir, '.claude', '.session_claims.json'),
  };
}

/** Session validity duration in seconds (1 hour) */
const SESSION_VALIDITY_SECONDS = 3600;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Token claims extracted from validation script output.
 */
export interface TokenClaims {
  /** Subject/user ID */
  sub?: string;
  /** User display name */
  name?: string;
  /** User roles */
  roles?: string[];
  /** Accessible modules */
  modules?: string[];
  /** Token ID (JTI) */
  jti?: string;
  /** Whether enforcement is disabled */
  enforcement_disabled?: boolean;
  /** Additional claims */
  [key: string]: unknown;
}

/**
 * Result of token validation.
 */
export interface TokenValidationResult {
  /** Whether the token is valid */
  isValid: boolean;
  /** Error message if validation failed */
  errorMessage: string | null;
  /** Extracted claims from the token */
  claims: TokenClaims;
}

/**
 * Result of file permission check.
 */
export interface PermissionCheckResult {
  /** Whether permissions are OK */
  isOk: boolean;
  /** Message describing the check result */
  message: string;
}

/**
 * Result of RBAC validation.
 */
export interface RbacValidationResult {
  /** Whether the user is authorized */
  isAuthorized: boolean;
  /** Error message if not authorized */
  errorMessage: string | null;
}

// ============================================================================
// Session Caching Functions
// ============================================================================

/**
 * Check if session was validated recently (within validity window).
 *
 * @returns true if session was validated within SESSION_VALIDITY_SECONDS
 */
export function isSessionRecentlyValidated(): boolean {
  try {
    const { SESSION_VALIDATED_FILE } = getPaths();
    if (existsSync(SESSION_VALIDATED_FILE)) {
      const stats = statSync(SESSION_VALIDATED_FILE);
      const ageSeconds = (Date.now() - stats.mtimeMs) / 1000;
      if (ageSeconds < SESSION_VALIDITY_SECONDS) {
        return true;
      }
    }
  } catch {
    // Ignore errors - treat as not validated
  }
  return false;
}

/**
 * Mark current session as validated by touching the marker file.
 */
export function markSessionValidated(): void {
  try {
    const { SESSION_VALIDATED_FILE } = getPaths();
    mkdirSync(dirname(SESSION_VALIDATED_FILE), { recursive: true });
    // Touch the file (create or update mtime)
    const now = new Date();
    if (existsSync(SESSION_VALIDATED_FILE)) {
      utimesSync(SESSION_VALIDATED_FILE, now, now);
    } else {
      writeFileSync(SESSION_VALIDATED_FILE, '');
    }
  } catch {
    // Ignore errors - validation still succeeded
  }
}

/**
 * Get claims from cached session file.
 *
 * @returns Cached claims or null if not available
 */
export function getCachedClaims(): TokenClaims | null {
  try {
    const { SESSION_CLAIMS_FILE } = getPaths();
    if (existsSync(SESSION_CLAIMS_FILE)) {
      const content = readFileSync(SESSION_CLAIMS_FILE, 'utf-8');
      return JSON.parse(content) as TokenClaims;
    }
  } catch {
    // Ignore errors - treat as no cached claims
  }
  return null;
}

/**
 * Save claims for other validators to use.
 *
 * @param claims - Token claims to save
 */
export function saveSessionClaims(claims: TokenClaims): void {
  try {
    const { SESSION_CLAIMS_FILE } = getPaths();
    mkdirSync(dirname(SESSION_CLAIMS_FILE), { recursive: true });
    writeFileSync(SESSION_CLAIMS_FILE, JSON.stringify(claims), { mode: 0o600 });
    // Ensure permissions are correct
    chmodSync(SESSION_CLAIMS_FILE, 0o600);
  } catch {
    // Ignore errors - validation still succeeded
  }
}

// ============================================================================
// Permission Checking Functions
// ============================================================================

/**
 * Check that a security file has appropriate permissions (600 - owner only).
 *
 * @param filePath - Path to the file to check
 * @returns Result indicating if permissions are OK
 */
export function checkFilePermissions(filePath: string): PermissionCheckResult {
  try {
    const stats = statSync(filePath);
    const mode = stats.mode & 0o777;

    // Should be owner-only read/write (600) or at least not world-readable
    if ((mode & 0o077) !== 0) {
      // Group or world permissions are set
      return {
        isOk: false,
        message: `Insecure permissions ${mode.toString(8)} on ${filePath} - should be 600`,
      };
    }

    return {
      isOk: true,
      message: `Permissions OK: ${mode.toString(8)}`,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        isOk: false,
        message: `File not found: ${filePath}`,
      };
    }
    return {
      isOk: false,
      message: `Could not check permissions: ${e}`,
    };
  }
}

// ============================================================================
// Token Validation Functions
// ============================================================================

/**
 * Parse token claims from validation script output.
 *
 * Looks for "Token Details" section and parses key:value pairs.
 *
 * @param output - stdout from validation script
 * @returns Parsed claims
 */
export function parseClaimsFromOutput(output: string): TokenClaims {
  const claims: TokenClaims = {};
  const lines = output.split('\n');
  let inDetails = false;

  for (const line of lines) {
    if (line.includes('Token Details')) {
      inDetails = true;
      continue;
    }

    if (inDetails && line.includes(':')) {
      // Parse "  Key:       Value" format
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        let key = line.slice(0, colonIndex).trim().toLowerCase().replace(/ /g, '_');
        let value: string | string[] = line.slice(colonIndex + 1).trim();

        // Handle special cases
        if (key === 'roles' || key === 'modules') {
          value = value.split(',').map(v => v.trim());
        } else if (key === 'user_id') {
          key = 'sub';
        } else if (key === 'token_id') {
          key = 'jti';
        }

        if (value && value !== '(not set)') {
          claims[key] = value;
        }
      }
    }
  }

  return claims;
}

/**
 * Extract meaningful error message from script output.
 *
 * @param stdout - stdout from validation script
 * @param stderr - stderr from validation script
 * @returns Error message string
 */
export function extractErrorFromOutput(stdout: string, stderr: string): string {
  // Look for [FAIL] lines
  for (const line of stdout.split('\n')) {
    if (line.includes('[FAIL]')) {
      return line.replace('[FAIL]', '').trim();
    }
  }

  // Check stderr
  if (stderr.trim()) {
    return stderr.trim().slice(0, 200);
  }

  return 'Token validation failed (see output for details)';
}

/**
 * Validate token using the existing Node.js validation script.
 *
 * @returns Validation result with validity, error message, and claims
 */
export function validateTokenWithScript(): TokenValidationResult {
  const { VALIDATION_SCRIPT } = getPaths();
  const projectDir = getProjectDir();

  if (!existsSync(VALIDATION_SCRIPT)) {
    // Fail open if validation script missing (configurable behavior)
    AuditLogger.logSync(VALIDATOR_NAME, 'WARNING', {
      reason: 'Validation script not found',
      path: VALIDATION_SCRIPT,
    }, 'WARNING');
    return {
      isValid: true,
      errorMessage: null,
      claims: {},
    };
  }

  try {
    // Run validation script with 10-second timeout using secure spawn
    const result = spawnSync('node', [VALIDATION_SCRIPT], {
      cwd: projectDir,
      timeout: 10000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.status !== 0) {
      throw new Error(`Validation script failed with status ${result.status}: ${result.stderr?.toString()}`);
    }

    const output = result.stdout?.toString() || '';

    // Script outputs test results - check for "All validation tests passed"
    if (output.includes('All validation tests passed')) {
      const claims = parseClaimsFromOutput(output);
      return {
        isValid: true,
        errorMessage: null,
        claims,
      };
    } else {
      const errorMsg = extractErrorFromOutput(output, '');
      return {
        isValid: false,
        errorMessage: errorMsg,
        claims: {},
      };
    }
  } catch (e) {
    const error = e as Error & { killed?: boolean; stdout?: string; stderr?: string };

    if (error.killed) {
      return {
        isValid: false,
        errorMessage: 'Token validation timed out',
        claims: {},
      };
    }

    // execSync throws on non-zero exit - extract error from output
    const errorMsg = extractErrorFromOutput(error.stdout || '', error.stderr || '');
    return {
      isValid: false,
      errorMessage: errorMsg,
      claims: {},
    };
  }
}

/**
 * Validate the authentication token.
 *
 * Checks:
 * 1. Token enforcement setting
 * 2. Token file existence and permissions
 * 3. Key file existence and permissions
 * 4. Token validity via validation script
 *
 * @returns Validation result
 */
export function validateToken(): TokenValidationResult {
  const { TOKEN_FILE, KEY_FILE } = getPaths();

  // Check if token enforcement is disabled
  if (process.env['BMAD_TOKEN_REQUIRED']?.toLowerCase() === 'false') {
    AuditLogger.logSync(VALIDATOR_NAME, 'SKIPPED', {
      reason: 'Token enforcement disabled via BMAD_TOKEN_REQUIRED=false',
    }, 'WARNING');
    return {
      isValid: true,
      errorMessage: null,
      claims: { enforcement_disabled: true },
    };
  }

  // Check for token via environment variable
  let token = process.env['BMAD_AUTH_TOKEN'] || '';

  // If not in env, check token file
  if (!token) {
    if (!existsSync(TOKEN_FILE)) {
      return {
        isValid: false,
        errorMessage: `No token found. Expected at ${TOKEN_FILE} or BMAD_AUTH_TOKEN env var`,
        claims: {},
      };
    }

    // Check token file permissions
    const permsResult = checkFilePermissions(TOKEN_FILE);
    if (!permsResult.isOk) {
      AuditLogger.logSync(VALIDATOR_NAME, 'PERMISSION_WARNING', {
        file: TOKEN_FILE,
        message: permsResult.message,
      }, 'WARNING');
    }

    try {
      token = readFileSync(TOKEN_FILE, 'utf-8').trim();
    } catch (e) {
      return {
        isValid: false,
        errorMessage: `Could not read token file: ${e}`,
        claims: {},
      };
    }
  }

  if (!token) {
    return {
      isValid: false,
      errorMessage: 'Token file is empty',
      claims: {},
    };
  }

  // Check key file exists
  if (!existsSync(KEY_FILE)) {
    return {
      isValid: false,
      errorMessage: `Encryption key not found at ${KEY_FILE}`,
      claims: {},
    };
  }

  // Check key file permissions
  const keyPermsResult = checkFilePermissions(KEY_FILE);
  if (!keyPermsResult.isOk) {
    AuditLogger.logSync(VALIDATOR_NAME, 'PERMISSION_WARNING', {
      file: KEY_FILE,
      message: keyPermsResult.message,
    }, 'WARNING');
  }

  // Validate using the script
  return validateTokenWithScript();
}

// ============================================================================
// RBAC Validation
// ============================================================================

/**
 * Validate RBAC permissions from token claims.
 *
 * @param claims - Token claims dictionary
 * @param requiredRole - Optional role required for the operation
 * @returns Validation result
 */
export function validateRbac(
  claims: TokenClaims,
  requiredRole?: string | null
): RbacValidationResult {
  if (!requiredRole) {
    return { isAuthorized: true, errorMessage: null };
  }

  let userRoles = claims.roles || [];
  if (typeof userRoles === 'string') {
    userRoles = [userRoles];
  }

  // Admin always authorized
  if (userRoles.includes('admin')) {
    return { isAuthorized: true, errorMessage: null };
  }

  // security_lead has elevated access
  if (
    userRoles.includes('security_lead') &&
    ['security_analyst', 'intel_analyst', 'developer'].includes(requiredRole)
  ) {
    return { isAuthorized: true, errorMessage: null };
  }

  if (!userRoles.includes(requiredRole)) {
    return {
      isAuthorized: false,
      errorMessage: `Role "${requiredRole}" required, user has: ${userRoles.join(', ')}`,
    };
  }

  return { isAuthorized: true, errorMessage: null };
}

// ============================================================================
// Output Functions
// ============================================================================

/**
 * Print formatted authentication failure message.
 *
 * @param error - Error message to display
 */
export function printAuthFailure(error: string): void {
  printBlockMessage({
    title: 'AUTHENTICATION REQUIRED',
    message: error,
    target: 'Session authentication',
    isAbsolute: true,
    recommendations: [
      'Generate a token: node src/core/security/quick-token.cjs "YourName" "role" 168',
      'Or set environment variable: export BMAD_AUTH_TOKEN=<your-token>',
      'Validate your token: node src/core/security/validate-token.js',
      'To disable enforcement (NOT RECOMMENDED): export BMAD_TOKEN_REQUIRED=false',
    ],
  });
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Main entry point for SessionStart hook.
 */
export function main(): void {
  // Check if already validated recently (performance optimization)
  if (isSessionRecentlyValidated()) {
    const cachedClaims = getCachedClaims();
    if (cachedClaims) {
      AuditLogger.logSync(VALIDATOR_NAME, 'CACHED', {
        reason: 'Session recently validated',
        user: cachedClaims.name || 'unknown',
      }, 'INFO');
      process.exit(EXIT_CODES.ALLOW);
    }
  }

  // Validate token
  const { isValid, errorMessage, claims } = validateToken();

  if (!isValid) {
    AuditLogger.logBlocked(VALIDATOR_NAME, errorMessage || 'Unknown error', 'session_start', {
      action: 'authentication_failed',
    });
    printAuthFailure(errorMessage || 'Authentication failed');
    process.exit(EXIT_CODES.HARD_BLOCK);
  }

  // Check for enforcement disabled
  if (claims.enforcement_disabled) {
    console.error('  [!!] Token enforcement DISABLED - running without authentication');
    markSessionValidated();
    saveSessionClaims({ enforcement_disabled: true, roles: ['guest'] });
    process.exit(EXIT_CODES.ALLOW);
  }

  // Log successful authentication
  const userName = (claims.name as string) || 'unknown';
  let userRoles = claims.roles || [];
  if (typeof userRoles === 'string') {
    userRoles = [userRoles];
  }

  AuditLogger.logSync(VALIDATOR_NAME, 'AUTHENTICATED', {
    user: userName,
    roles: userRoles,
  }, 'INFO');

  // Mark session as validated and save claims
  markSessionValidated();
  saveSessionClaims(claims);

  console.error(`  [OK] Session authenticated: ${userName} (roles: ${userRoles.join(', ')})`);
  process.exit(EXIT_CODES.ALLOW);
}

// Run if executed directly
const isMain =
  process.argv[1]?.endsWith('token-validator.js') ||
  process.argv[1]?.endsWith('token-validator.ts');

if (isMain) {
  main();
}
