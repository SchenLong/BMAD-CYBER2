/**
 * API Key JWT Generator
 * Story 8.2: API Key Management
 * Task 7: API Role in JWT
 *
 * Generates JWT tokens when authenticating via API key
 * Includes role claim and distinguishes from session auth
 */

import { SignJWT } from 'jose';
import { UserRole } from '@prisma/client';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * JWT payload for API key authentication
 */
export interface APIKeyJWTPayload {
  sub: string; // user_id
  type: 'api_key';
  key_id: string; // api_key_id
  role: UserRole;
  scopes: string[];
  iat: number;
  exp: number;
}

/**
 * Default scopes for each role
 */
const ROLE_SCOPES: Record<UserRole, string[]> = {
  [UserRole.SUPERADMIN]: [
    'agents:read', 'agents:invoke',
    'workflows:read', 'workflows:execute',
    'projects:read', 'projects:write', 'projects:delete',
    'templates:read', 'templates:write',
    'cli:execute',
    'admin:all',
  ],
  [UserRole.ADMIN]: [
    'agents:read', 'agents:invoke',
    'workflows:read', 'workflows:execute',
    'projects:read', 'projects:write',
    'templates:read', 'templates:write',
    'cli:execute',
  ],
  [UserRole.DEVELOPER]: [
    'agents:read', 'agents:invoke',
    'workflows:read', 'workflows:execute',
    'projects:read', 'projects:write',
    'templates:read',
  ],
  [UserRole.USER]: [
    'agents:read',
    'workflows:read',
    'projects:read',
    'templates:read',
  ],
  [UserRole.READONLY]: [
    'agents:read',
    'workflows:read',
    'projects:read',
    'templates:read',
  ],
  [UserRole.API]: [
    'agents:read', 'agents:invoke',
    'workflows:read', 'workflows:execute',
    'projects:read', 'projects:write',
    'cli:execute',
  ],
};

/**
 * Generate a JWT token for API key authentication
 *
 * @param userId - The user ID
 * @param apiKeyId - The API key ID
 * @param role - The user role
 * @param expiresIn - Token expiration time (default: '1h')
 * @returns A promise that resolves to the JWT token
 */
export async function generateAPIKeyJWT(
  userId: string,
  apiKeyId: string,
  role: UserRole,
  expiresIn: string = '1h'
): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  // Get scopes based on role
  const scopes = ROLE_SCOPES[role] || ROLE_SCOPES[UserRole.API];

  return new SignJWT({
    sub: userId,
    type: 'api_key',
    key_id: apiKeyId,
    role,
    scopes,
    iat: undefined,
    exp: undefined,
  } as APIKeyJWTPayload & Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Get scopes for a given role
 *
 * @param role - The user role
 * @returns Array of scope strings
 */
export function getScopesForRole(role: UserRole): string[] {
  return ROLE_SCOPES[role] || ROLE_SCOPES[UserRole.API];
}

/**
 * Check if a role has a specific scope
 *
 * @param role - The user role
 * @param scope - The scope to check
 * @returns True if the role has the scope
 */
export function roleHasScope(role: UserRole, scope: string): boolean {
  const scopes = ROLE_SCOPES[role] || ROLE_SCOPES[UserRole.API];
  return scopes.includes(scope);
}
