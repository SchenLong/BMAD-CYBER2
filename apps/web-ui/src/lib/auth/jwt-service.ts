/**
 * JWT Service for API Authentication
 * Story 8.3: API Authentication - Task 7
 *
 * Handles JWT signing and verification for API key authentication.
 * Supports both session JWTs and API key JWTs with different claims.
 */

import { SignJWT, jwtVerify } from 'jose';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Token type enumeration
 */
export enum TokenType {
  SESSION = 'session',
  API_KEY = 'api_key',
}

/**
 * JWT payload for API key tokens
 */
export interface ApiKeyJwtPayload {
  sub: string;           // User UUID
  type: TokenType.API_KEY;
  key_id: string;        // API Key UUID
  role: string;          // User role
  scopes: string[];      // Granted scopes
  iat: number;           // Issued at
  exp: number;           // Expiration
}

/**
 * JWT payload for session tokens
 */
export interface SessionJwtPayload {
  sub: string;           // User UUID
  type: TokenType.SESSION;
  role: string;          // User role
  iat: number;           // Issued at
  exp: number;           // Expiration
}

/**
 * Combined JWT payload type
 */
export type JwtPayload = ApiKeyJwtPayload | SessionJwtPayload;

/**
 * API key token creation options
 */
export interface CreateApiKeyTokenOptions {
  userId: string;
  keyId: string;
  role: string;
  scopes: string[];
  expirationMinutes?: number;
}

/**
 * Session token creation options
 */
export interface CreateSessionTokenOptions {
  userId: string;
  role: string;
  expirationMinutes?: number;
}

// Default token expiration (1 hour for API keys)
const DEFAULT_API_KEY_EXPIRATION_MINUTES = 60;
const DEFAULT_SESSION_TOKEN_EXPIRATION_MINUTES = 60;

/**
 * Create a JWT for API key authentication
 * @param options - Token creation options
 * @returns Signed JWT token
 */
export async function createApiKeyToken(options: CreateApiKeyTokenOptions): Promise<string> {
  const {
    userId,
    keyId,
    role,
    scopes,
    expirationMinutes = DEFAULT_API_KEY_EXPIRATION_MINUTES,
  } = options;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + expirationMinutes * 60;

  return new SignJWT({
    sub: userId,
    type: TokenType.API_KEY,
    key_id: keyId,
    role,
    scopes,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * Create a JWT for session-based API authentication
 * @param options - Token creation options
 * @returns Signed JWT token
 */
export async function createSessionApiToken(options: CreateSessionTokenOptions): Promise<string> {
  const {
    userId,
    role,
    expirationMinutes = DEFAULT_SESSION_TOKEN_EXPIRATION_MINUTES,
  } = options;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + expirationMinutes * 60;

  return new SignJWT({
    sub: userId,
    type: TokenType.SESSION,
    role,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * Verify a JWT token and return the payload
 * @param token - The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export async function verifyApiToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    // Validate required fields
    if (!payload.sub || !payload.type) {
      return null;
    }

    // Ensure type is valid
    if (payload.type !== TokenType.SESSION && payload.type !== TokenType.API_KEY) {
      return null;
    }

    return payload as JwtPayload;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Extract user ID from JWT token
 * @param token - The JWT token
 * @returns User ID or null if invalid
 */
export async function extractUserIdFromToken(token: string): Promise<string | null> {
  const payload = await verifyApiToken(token);
  return payload?.sub || null;
}

/**
 * Check if token is an API key token
 * @param token - The JWT token
 * @returns True if API key token, false otherwise
 */
export async function isApiKeyToken(token: string): Promise<boolean> {
  const payload = await verifyApiToken(token);
  return payload?.type === TokenType.API_KEY;
}

/**
 * Check if token is a session token
 * @param token - The JWT token
 * @returns True if session token, false otherwise
 */
export async function isSessionToken(token: string): Promise<boolean> {
  const payload = await verifyApiToken(token);
  return payload?.type === TokenType.SESSION;
}

/**
 * Get token expiration time
 * @param token - The JWT token
 * @returns Expiration timestamp or null if invalid
 */
export async function getTokenExpiration(token: string): Promise<number | null> {
  const payload = await verifyApiToken(token);
  return payload?.exp || null;
}

/**
 * Check if token is expired
 * @param token - The JWT token
 * @returns True if expired, false otherwise
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  const exp = await getTokenExpiration(token);
  if (!exp) {
    return true; // Invalid token is considered expired
  }

  const now = Math.floor(Date.now() / 1000);
  return exp < now;
}

/**
 * Get time until token expires (in seconds)
 * @param token - The JWT token
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export async function getTokenTimeToExpiry(token: string): Promise<number> {
  const exp = await getTokenExpiration(token);
  if (!exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, exp - now);
}
