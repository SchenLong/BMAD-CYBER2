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
/**
 * Check if session was validated recently (within validity window).
 *
 * @returns true if session was validated within SESSION_VALIDITY_SECONDS
 */
export declare function isSessionRecentlyValidated(): boolean;
/**
 * Mark current session as validated by touching the marker file.
 */
export declare function markSessionValidated(): void;
/**
 * Get claims from cached session file.
 *
 * @returns Cached claims or null if not available
 */
export declare function getCachedClaims(): TokenClaims | null;
/**
 * Save claims for other validators to use.
 *
 * @param claims - Token claims to save
 */
export declare function saveSessionClaims(claims: TokenClaims): void;
/**
 * Check that a security file has appropriate permissions (600 - owner only).
 *
 * @param filePath - Path to the file to check
 * @returns Result indicating if permissions are OK
 */
export declare function checkFilePermissions(filePath: string): PermissionCheckResult;
/**
 * Parse token claims from validation script output.
 *
 * Looks for "Token Details" section and parses key:value pairs.
 *
 * @param output - stdout from validation script
 * @returns Parsed claims
 */
export declare function parseClaimsFromOutput(output: string): TokenClaims;
/**
 * Extract meaningful error message from script output.
 *
 * @param stdout - stdout from validation script
 * @param stderr - stderr from validation script
 * @returns Error message string
 */
export declare function extractErrorFromOutput(stdout: string, stderr: string): string;
/**
 * Validate token using the existing Node.js validation script.
 *
 * @returns Validation result with validity, error message, and claims
 */
export declare function validateTokenWithScript(): TokenValidationResult;
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
export declare function validateToken(): TokenValidationResult;
/**
 * Validate RBAC permissions from token claims.
 *
 * @param claims - Token claims dictionary
 * @param requiredRole - Optional role required for the operation
 * @returns Validation result
 */
export declare function validateRbac(claims: TokenClaims, requiredRole?: string | null): RbacValidationResult;
/**
 * Print formatted authentication failure message.
 *
 * @param error - Error message to display
 */
export declare function printAuthFailure(error: string): void;
/**
 * Main entry point for SessionStart hook.
 */
export declare function main(): void;
