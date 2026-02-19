/**
 * Token Type Definitions
 * Story 8.3: API Authentication
 *
 * Type definitions for JWT tokens used in API authentication.
 * Re-exports from jwt-service.ts to avoid duplication.
 */

// Re-export TokenType and JWT types from jwt-service to avoid duplication
export { TokenType, type JwtPayload } from './jwt-service';

// Re-export ApiRequestContext from api-auth-middleware for convenience
export type { ApiRequestContext } from './api-auth-middleware';

// Re-export Permission enum from permission-service
export { Permission } from './permission-service';
