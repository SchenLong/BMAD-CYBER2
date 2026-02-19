# API Authentication Guide

Story 8.3: API Authentication

## Overview

The BMAD Web Server API provides secure authentication using Bearer tokens (JWT). API clients can authenticate using either:

1. **Session JWT** - For web clients with active sessions
2. **API Key JWT** - For programmatic access with API keys

## Authentication Flow

```
1. Client sends request with Authorization header
   Authorization: Bearer <token>

2. Middleware extracts and validates JWT

3. For API key tokens:
   - Verify key exists and is active
   - Check expiration
   - Update usage statistics

4. Extract user context and permissions

5. Check rate limits

6. Attach user context to request

7. Proceed to route handler or return error
```

## Token Types

### Session JWT

Issued to users after web login. Contains:

```json
{
  "sub": "user_uuid",
  "type": "session",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234570490
}
```

### API Key JWT

Issued from API keys for programmatic access. Contains:

```json
{
  "sub": "user_uuid",
  "type": "api_key",
  "key_id": "api_key_uuid",
  "role": "developer",
  "scopes": ["agents:read", "agents:invoke", "projects:read"],
  "iat": 1234567890,
  "exp": 1234570490
}
```

## Using the API

### Authentication Header

All API requests must include the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Example Requests

#### Get Agents List

```bash
curl -X GET https://api.bmad.example.com/api/v1/agents \
  -H "Authorization: Bearer <token>"
```

#### Invoke Agent

```bash
curl -X POST https://api.bmad.example.com/api/v1/agents/agent-id/invoke \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"input": "Analyze this security event"}'
```

#### Create Project

```bash
curl -X POST https://api.bmad.example.com/api/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Assessment",
    "description": "Penetration testing project",
    "projectType": "SECURITY_ASSESSMENT"
  }'
```

## Error Responses

### 401 Unauthorized

Invalid or missing authentication token.

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please provide a valid Bearer token."
  },
  "meta": {
    "requestId": "req_1234567890_abc12345",
    "timestamp": "2026-02-18T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 401 Invalid Token

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "The provided authentication token is invalid or expired."
  },
  "meta": {
    "requestId": "req_1234567890_abc12345",
    "timestamp": "2026-02-18T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 403 Forbidden

Insufficient permissions for the requested resource.

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Your role does not have permission to access this resource."
  },
  "meta": {
    "requestId": "req_1234567890_abc12345",
    "timestamp": "2026-02-18T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 429 Rate Limited

Too many requests.

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry later.",
    "retryAfter": 60
  },
  "meta": {
    "requestId": "req_1234567890_abc12345",
    "timestamp": "2026-02-18T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## Rate Limiting

API requests are rate limited based on authentication type and user role.

### Rate Limit Tiers

| Auth Type | Per Minute | Per Hour |
|-----------|------------|----------|
| Session | 100 | 2,000 |
| API Key (Standard) | 60 | 1,000 |
| API Key (Enterprise) | 200 | 5,000 |

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
Retry-After: 15
```

## Permissions

API key tokens include scopes that define granted permissions.

### Available Scopes

| Scope | Description |
|-------|-------------|
| `agents:read` | List and view agents |
| `agents:invoke` | Execute agent workflows |
| `agents:write` | Create/modify agents |
| `workflows:read` | List and view workflows |
| `workflows:execute` | Execute workflows |
| `workflows:write` | Create/modify workflows |
| `projects:read` | List and view projects |
| `projects:write` | Create/modify projects |
| `projects:delete` | Delete projects |
| `api_keys:read` | List API keys |
| `api_keys:write` | Create/modify API keys |
| `api_keys:delete` | Delete API keys |
| `cli:execute` | Execute CLI commands |

### Wildcard Scopes

- `resource:*` - All permissions for a resource (e.g., `agents:*`)
- `admin` - Full access to all resources
- `*` - Unlimited access

## Implementation Example

### Protected API Route

```typescript
import { withApiAuth } from '@/lib/auth/api-auth-middleware';
import { Permission } from '@/lib/auth/permission-service';
import { apiSuccess } from '@/lib/api/response';
import { NextRequest } from 'next/server';

export const GET = withApiAuth(
  async (context) => {
    // context.user is available here
    const agents = await getAgentsForUser(context.user.id);

    return apiSuccess(agents);
  },
  {
    requiredPermissions: [Permission.AGENTS_READ],
  }
);
```

### Manual Authentication

```typescript
import { authenticateApiRequest } from '@/lib/auth/api-auth-middleware';
import { apiUnauthorized } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.success) {
    return apiUnauthorized();
  }

  const context = authResult.context!;
  // Use context.user and context.apiKey
}
```

## Security Considerations

1. **Token Storage**: Store tokens securely (HTTP-only cookies or secure storage)
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiration**: Tokens expire after 1 hour by default
4. **Key Rotation**: Rotate signing keys periodically
5. **Audit Logging**: All API requests are logged for security monitoring
6. **Rate Limiting**: Strict rate limits prevent abuse

## Testing

Use the provided test utilities for development:

```bash
npm test -- api-auth.test.ts
```

## Support

For issues or questions about API authentication, see:
- [Architecture Documentation](../02-architecture-security.md)
- [API Implementation](../06-technical-implementation.md)
- [Security Deep Dive](../11-security-deepive.md)
