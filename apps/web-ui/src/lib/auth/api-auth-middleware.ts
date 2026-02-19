/**
 * API Authentication Middleware
 * Story 8.3: API Authentication - Task 1 & 5
 *
 * Provides comprehensive authentication middleware for API routes.
 * Supports both Bearer token (JWT) and API key authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiUnauthorized, apiForbidden, ErrorCode } from '@/lib/api/response';
import {
  verifyApiToken,
  isApiKeyToken,
  isSessionToken,
  type JwtPayload,
  TokenType,
} from './jwt-service';
import {
  validateApiKey,
  updateApiKeyUsage,
  getApiKeyOwner,
} from './api-key-service';
import {
  Permission,
  checkScopePermissions,
  scopeHasPermission,
  roleHasPermission,
} from './permission-service';
import {
  checkApiRateLimit,
  createApiRateLimitResponse,
  setApiRateLimitHeaders,
} from './api-rate-limit';
import {
  logApiAuthEvent,
  logRateLimitEvent,
  logPermissionDeniedEvent,
  generateRequestId,
} from './api-audit-log';
import { UserRole } from '@prisma/client';

/**
 * API request context attached to authenticated requests
 */
export interface ApiRequestContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  apiKey?: {
    id: string;
    name: string;
    lastUsedAt: Date;
  };
  tokenType: 'session' | 'api_key';
  scopes: string[];
  requestId: string;
}

/**
 * Authentication result
 */
interface AuthResult {
  success: boolean;
  context?: ApiRequestContext;
  error?: {
    code: ErrorCode;
    message: string;
  };
  statusCode?: number;
}

/**
 * Extract authentication token from request
 * Checks both Authorization: Bearer header and x-api-key header
 * Returns the token value and the auth method used
 */
function extractAuthToken(request: NextRequest): { token: string | null; method: 'bearer' | 'x-api-key' | null } {
  // First check Authorization: Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return { token: parts[1], method: 'bearer' };
    }
  }

  // Then check x-api-key header
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return { token: apiKey, method: 'x-api-key' };
  }

  return { token: null, method: null };
}

/**
 * Extract Authorization header from request (legacy, for backward compatibility)
 */
function extractAuthHeader(request: NextRequest): string | null {
  const { token } = extractAuthToken(request);
  return token;
}

/**
 * Authenticate via Bearer token (JWT)
 */
async function authenticateBearerToken(token: string): Promise<AuthResult> {
  const payload = await verifyApiToken(token);

  if (!payload) {
    await logApiAuthEvent({
      eventType: 'api_auth_failure' as any,
      tokenType: 'api_key',
      errorMessage: 'Invalid or expired token',
    });
    return {
      success: false,
      error: {
        code: ErrorCode.TOKEN_INVALID,
        message: 'The provided authentication token is invalid or expired.',
      },
      statusCode: 401,
    };
  }

  // Determine token type
  const isApiKey = payload.type === TokenType.API_KEY;
  const tokenType = isApiKey ? 'api_key' : 'session';

  if (isApiKey) {
    return await authenticateApiKeyToken(token, payload as any);
  }

  // Session token - load user from database
  return await authenticateSessionToken(payload as any);
}

/**
 * Authenticate via API key token (with database validation)
 */
async function authenticateApiKeyToken(
  token: string,
  payload: JwtPayload & { type: TokenType.API_KEY }
): Promise<AuthResult> {
  // For API key tokens, we need to validate the key still exists and is active
  const keyId = (payload as any).key_id;

  // Get user info from API key
  const user = await getApiKeyOwner(keyId);

  if (!user) {
    await logApiAuthEvent({
      eventType: 'api_auth_revoked' as any,
      tokenType: 'api_key',
      apiKeyId: keyId,
      errorMessage: 'API key not found or user deleted',
    });
    return {
      success: false,
      error: {
        code: ErrorCode.TOKEN_INVALID,
        message: 'The API key associated with this token has been revoked.',
      },
      statusCode: 401,
    };
  }

  // Update usage statistics
  await updateApiKeyUsage(keyId);

  const scopes = (payload as any).scopes || [];

  return {
    success: true,
    context: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      apiKey: {
        id: keyId,
        name: 'API Key',
        lastUsedAt: new Date(),
      },
      tokenType: 'api_key',
      scopes,
      requestId: generateRequestId(),
    },
  };
}

/**
 * Authenticate via session token
 */
async function authenticateSessionToken(
  payload: JwtPayload & { type: TokenType.SESSION }
): Promise<AuthResult> {
  // For session tokens, load user from database
  // This ensures we have current user data
  const { prisma } = await import('@/lib/prisma');

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    await logApiAuthEvent({
      eventType: 'api_auth_failure' as any,
      tokenType: 'session',
      userId: payload.sub,
      errorMessage: 'User not found',
    });
    return {
      success: false,
      error: {
        code: ErrorCode.TOKEN_INVALID,
        message: 'User associated with this token no longer exists.',
      },
      statusCode: 401,
    };
  }

  return {
    success: true,
    context: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokenType: 'session',
      scopes: [],
      requestId: generateRequestId(),
    },
  };
}

/**
 * Check rate limit for authenticated request
 */
async function checkRateLimit(
  context: ApiRequestContext
): Promise<NextResponse | null> {
  const identifier = context.apiKey
    ? `apikey:${context.apiKey.id}`
    : `user:${context.user.id}`;

  const rateLimitResult = checkApiRateLimit(
    identifier,
    context.tokenType,
    context.user.role as UserRole
  );

  if (!rateLimitResult.allowed) {
    await logRateLimitEvent({
      userId: context.user.id,
      apiKeyId: context.apiKey?.id,
      tokenType: context.tokenType,
      endpoint: 'api',
    });

    return createApiRateLimitResponse(rateLimitResult);
  }

  return null;
}

/**
 * Check permissions for authenticated request
 */
function checkPermissions(
  context: ApiRequestContext,
  requiredPermissions?: Permission[]
): NextResponse | null {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return null;
  }

  // For session tokens, check role-based permissions
  if (context.tokenType === 'session') {
    const userRole = context.user.role as UserRole;

    // Admin/Superadmin bypass
    if (userRole === UserRole.SUPERADMIN || userRole === UserRole.ADMIN) {
      return null;
    }

    // Check role has all required permissions
    for (const permission of requiredPermissions) {
      if (!roleHasPermission(userRole, permission)) {
        logPermissionDeniedEvent({
          userId: context.user.id,
          tokenType: context.tokenType,
          endpoint: 'api',
          method: 'API',
          requiredPermission: permission,
        }).catch(() => {});

        return apiForbidden(
          `Your role (${userRole}) does not have permission to access this resource.`
        );
      }
    }

    return null;
  }

  // For API key tokens, check scopes
  const userRole = context.user.role as UserRole;

  // Admin/Superadmin bypass
  if (userRole === UserRole.SUPERADMIN || userRole === UserRole.ADMIN) {
    return null;
  }

  // Check scopes against required permissions
  for (const permission of requiredPermissions) {
    if (!scopeHasPermission(context.scopes, permission)) {
      logPermissionDeniedEvent({
        userId: context.user.id,
        apiKeyId: context.apiKey?.id,
        tokenType: context.tokenType,
        endpoint: 'api',
        method: 'API',
        requiredPermission: permission,
      }).catch(() => {});

      return apiForbidden(
        'Your API key does not have permission to access this resource.'
      );
    }
  }

  return null;
}

/**
 * Authenticate an API request
 * @param request - Next.js request
 * @returns Authentication result
 */
export async function authenticateApiRequest(request: NextRequest): Promise<AuthResult> {
  // Extract authentication token (Bearer or x-api-key)
  const { token, method } = extractAuthToken(request);

  if (!token) {
    await logApiAuthEvent({
      eventType: 'api_auth_failure' as any,
      tokenType: 'session',
      errorMessage: 'Missing Authorization header or x-api-key header',
    });
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required. Please provide a valid Bearer token or x-api-key header.',
      },
      statusCode: 401,
    };
  }

  // If x-api-key header, authenticate via API key validation
  if (method === 'x-api-key') {
    return await authenticateViaApiKeyRaw(token);
  }

  // Otherwise authenticate via Bearer token (JWT)
  return await authenticateBearerToken(token);
}

/**
 * Authenticate via raw API key (from x-api-key header)
 */
async function authenticateViaApiKeyRaw(rawKey: string): Promise<AuthResult> {
  const validationResult = await validateApiKey(rawKey);

  if (!validationResult.isValid) {
    await logApiAuthEvent({
      eventType: 'api_auth_failure' as any,
      tokenType: 'api_key',
      errorMessage: validationResult.error,
    });
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: validationResult.error || 'Invalid API key',
      },
      statusCode: 401,
    };
  }

  const apiKeyData = validationResult.apiKey!;

  // Get user info
  const user = await getApiKeyOwner(apiKeyData.id);

  if (!user) {
    await logApiAuthEvent({
      eventType: 'api_auth_revoked' as any,
      tokenType: 'api_key',
      apiKeyId: apiKeyData.id,
      errorMessage: 'User not found for this API key',
    });
    return {
      success: false,
      error: {
        code: ErrorCode.TOKEN_INVALID,
        message: 'User not found for this API key.',
      },
      statusCode: 401,
    };
  }

  // Update usage
  await updateApiKeyUsage(apiKeyData.id);

  return {
    success: true,
    context: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      apiKey: {
        id: apiKeyData.id,
        name: apiKeyData.name,
        lastUsedAt: apiKeyData.lastUsedAt || new Date(),
      },
      tokenType: 'api_key',
      scopes: apiKeyData.permissions,
      requestId: generateRequestId(),
    },
  };
}

/**
 * Create API authentication middleware
 * @param options - Middleware options
 * @returns Middleware function
 */
export function createApiAuthMiddleware(options?: {
  requiredPermissions?: Permission[];
  allowSessionToken?: boolean;
}) {
  return async (
    request: NextRequest,
    handler: (context: ApiRequestContext) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    // Authenticate request
    const authResult = await authenticateApiRequest(request);

    if (!authResult.success || !authResult.context) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.statusCode || 401 }
      );
    }

    const context = authResult.context;

    // Check rate limits
    const rateLimitResponse = await checkRateLimit(context);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check permissions
    const permissionResponse = checkPermissions(context, options?.requiredPermissions);
    if (permissionResponse) {
      return permissionResponse;
    }

    // Call handler with context
    const response = await handler(context);

    // Add rate limit headers to response
    const identifier = context.apiKey
      ? `apikey:${context.apiKey.id}`
      : `user:${context.user.id}`;

    const rateLimitResult = checkApiRateLimit(
      identifier,
      context.tokenType,
      context.user.role as UserRole
    );

    setApiRateLimitHeaders(response, rateLimitResult);

    // Add request ID header
    response.headers.set('X-Request-ID', context.requestId);

    return response;
  };
}

/**
 * Higher-order function to wrap API route handlers with authentication
 * @param handler - Route handler function
 * @param options - Authentication options
 * @returns Wrapped handler
 */
export function withApiAuth(
  handler: (context: ApiRequestContext) => Promise<NextResponse>,
  options?: {
    requiredPermissions?: Permission[];
    allowSessionToken?: boolean;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const middleware = createApiAuthMiddleware(options);
    return middleware(request, handler);
  };
}

/**
 * Extract API context from request (for use in handlers)
 * This is a helper for when you need to manually extract context
 */
export async function getApiContext(request: NextRequest): Promise<ApiRequestContext | null> {
  const authResult = await authenticateApiRequest(request);
  return authResult.success ? authResult.context || null : null;
}

/**
 * Verify API key from x-api-key header (alternative auth method)
 * This is for backward compatibility with existing API key auth
 */
export async function authenticateViaApiKeyHeader(
  request: NextRequest
): Promise<AuthResult> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'API key required. Provide via x-api-key header or Authorization: Bearer header.',
      },
      statusCode: 401,
    };
  }

  // Validate API key
  const validationResult = await validateApiKey(apiKey);

  if (!validationResult.isValid) {
    await logApiAuthEvent({
      eventType: 'api_auth_failure' as any,
      tokenType: 'api_key',
      errorMessage: validationResult.error,
    });
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: validationResult.error || 'Invalid API key',
      },
      statusCode: 401,
    };
  }

  const apiKeyData = validationResult.apiKey!;

  // Get user info
  const user = await getApiKeyOwner(apiKeyData.id);

  if (!user) {
    return {
      success: false,
      error: {
        code: ErrorCode.TOKEN_INVALID,
        message: 'User not found for this API key.',
      },
      statusCode: 401,
    };
  }

  // Update usage
  await updateApiKeyUsage(apiKeyData.id);

  // Parse scopes from permissions
  const scopes = apiKeyData.permissions;

  return {
    success: true,
    context: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      apiKey: {
        id: apiKeyData.id,
        name: apiKeyData.name,
        lastUsedAt: apiKeyData.lastUsedAt || new Date(),
      },
      tokenType: 'api_key',
      scopes,
      requestId: generateRequestId(),
    },
  };
}
