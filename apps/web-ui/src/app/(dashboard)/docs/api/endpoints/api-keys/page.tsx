/**
 * API Documentation - API Keys Endpoints
 * Story 8.4: API Documentation
 * Task 2: Endpoint Documentation - API Keys
 */

import { EndpointCard } from '@/components/docs';

export default function ApiKeysEndpointsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">API Keys API</h1>
        <p className="text-lg text-muted-foreground">
          Endpoints for managing your API keys
        </p>
      </div>

      {/* List API Keys */}
      <EndpointCard
        method="GET"
        path="/v1/api-keys"
        description="Get a list of all API keys associated with your account"
        authenticated={true}
        responses={[
          {
            status: 200,
            description: 'API keys retrieved successfully',
            example: {
              success: true,
              data: {
                apiKeys: [
                  {
                    id: 'key_123',
                    name: 'Production Integration',
                    role: 'developer',
                    isActive: true,
                    lastUsedAt: '2024-01-01T00:00:00.000Z',
                    createdAt: '2023-12-01T00:00:00.000Z',
                  },
                ],
              },
            },
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/api-keys" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
        ]}
      />

      {/* Create API Key */}
      <EndpointCard
        method="POST"
        path="/v1/api-keys"
        description="Generate a new API key. Returns the full key which is shown only once."
        authenticated={true}
        requestBody={{
          contentType: 'application/json',
          schema: {
            name: { type: 'string', description: 'Friendly name for the API key', required: true },
            permissions: { type: 'array', description: 'Specific permissions (optional, defaults to full access)' },
            expiresAt: { type: 'string', description: 'Expiration date as ISO string (optional)' },
          },
          required: true,
          description: 'API key creation data',
        }}
        responses={[
          {
            status: 201,
            description: 'API key created successfully',
            example: {
              success: true,
              data: {
                apiKey: {
                  id: 'key_456',
                  name: 'Test Key',
                  key: 'bmad_sk_abc123...xyz789',
                  role: 'developer',
                  isActive: true,
                  createdAt: '2024-01-01T00:00:00.000Z',
                },
              },
            },
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X POST "https://api.bmad.security/v1/api-keys" \\
  -H "Authorization: Bearer bmad_sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Integration",
    "permissions": ["agents:read", "agents:execute"]
  }'`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/api-keys',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Production Integration',
      permissions: ['agents:read', 'agents:execute']
    })
  }
);
const result = await response.json();
// Store result.data.apiKey.key securely - it won't be shown again!
console.log(result.data.apiKey.key);`,
          },
        ]}
      />

      {/* Revoke API Key */}
      <EndpointCard
        method="DELETE"
        path="/v1/api-keys/{id}"
        description="Revoke (delete) an API key. This action cannot be undone."
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'API Key ID (not the key itself)',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'API key revoked successfully',
            example: {
              success: true,
              data: {
                message: 'API key revoked successfully',
              },
            },
          },
          {
            status: 404,
            description: 'API key not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X DELETE "https://api.bmad.security/v1/api-keys/key_123" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/api-keys/key_123',
  {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    }
  }
);
const result = await response.json();
console.log(result.data.message);`,
          },
        ]}
      />
    </div>
  );
}
