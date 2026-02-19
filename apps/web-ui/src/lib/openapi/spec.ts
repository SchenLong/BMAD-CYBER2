/**
 * OpenAPI Specification Generator
 * Story 8.4: API Documentation
 * Task 9: OpenAPI/Swagger Integration
 *
 * Generates OpenAPI 3.0 specification for BMAD API endpoints
 */

import { OpenAPIDocument, OpenAPISchema, HTTPMethod, OpenAPIOperation } from './types';

/**
 * API endpoint metadata for documentation
 */
export interface EndpointMetadata {
  method: HTTPMethod;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  authenticated: boolean;
  parameters?: ParameterDef[];
  requestBody?: RequestBodyDef;
  responses: ResponseDef[];
}

export interface ParameterDef {
  name: string;
  in: 'query' | 'path' | 'header';
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  default?: string | number;
}

export interface RequestBodyDef {
  contentType: string;
  schema: Record<string, unknown>;
  required: boolean;
  description: string;
}

interface ResponseDef {
  status: number;
  description: string;
  schema?: OpenAPISchema;
}

/**
 * Standard API response schema
 */
const standardResponseSchema: OpenAPISchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: { type: 'object', description: 'Response data', nullable: true },
    error: {
      type: 'object',
      nullable: true,
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object' },
      },
    },
    meta: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            perPage: { type: 'integer' },
            totalCount: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
      },
    },
  },
};

/**
 * Error response schema
 */
const errorSchema: OpenAPISchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    data: { type: 'object', nullable: true },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object' },
      },
    },
    meta: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
      },
    },
  },
};

/**
 * All documented API endpoints
 */
const API_ENDPOINTS: EndpointMetadata[] = [
  // Health Endpoint
  {
    method: 'get',
    path: '/v1/health',
    summary: 'Health Check',
    description: 'Check API health and connectivity status',
    tags: ['Health'],
    authenticated: false,
    responses: [
      {
        status: 200,
        description: 'API is healthy',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            version: { type: 'string', example: '1.0.0' },
            timestamp: { type: 'string', format: 'date-time' },
            database: {
              type: 'object',
              properties: {
                connected: { type: 'boolean' },
              },
            },
          },
        },
      },
    ],
  },

  // Agents Endpoints
  {
    method: 'get',
    path: '/v1/agents',
    summary: 'List Agents',
    description: 'Get a list of all available BMAD agents with optional filtering',
    tags: ['Agents'],
    authenticated: true,
    parameters: [
      {
        name: 'team',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Filter agents by team',
        enum: ['intel', 'security', 'strategic', 'legal', 'bmm', 'bmgd', 'cis', 'bmb'],
      },
      {
        name: 'search',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Search query to filter agents by name or expertise',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'List of agents',
      },
      {
        status: 401,
        description: 'Authentication required',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'get',
    path: '/v1/agents/{id}',
    summary: 'Get Agent Details',
    description: 'Get detailed information about a specific agent',
    tags: ['Agents'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Agent ID (e.g., "scanner", "analyst")',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Agent details',
      },
      {
        status: 404,
        description: 'Agent not found',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'post',
    path: '/v1/agents/{id}/invoke',
    summary: 'Invoke Agent',
    description: 'Execute an agent with provided input',
    tags: ['Agents'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Agent ID to invoke',
      },
    ],
    requestBody: {
      contentType: 'application/json',
      schema: {
        input: 'string',
        context: 'object (optional)',
        stream: 'boolean (optional)',
        sessionId: 'string (optional)',
      },
      required: true,
      description: 'Agent invocation parameters',
    },
    responses: [
      {
        status: 202,
        description: 'Agent invocation accepted',
      },
      {
        status: 400,
        description: 'Invalid input',
        schema: errorSchema,
      },
    ],
  },

  // Workflows Endpoints
  {
    method: 'get',
    path: '/v1/workflows',
    summary: 'List Workflows',
    description: 'Get a list of all available workflows',
    tags: ['Workflows'],
    authenticated: true,
    parameters: [
      {
        name: 'category',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Filter workflows by category',
      },
      {
        name: 'search',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Search query for workflows',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'List of workflows',
      },
    ],
  },
  {
    method: 'get',
    path: '/v1/workflows/{id}',
    summary: 'Get Workflow Details',
    description: 'Get detailed information about a specific workflow',
    tags: ['Workflows'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Workflow ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Workflow details',
      },
      {
        status: 404,
        description: 'Workflow not found',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'post',
    path: '/v1/workflows/{id}/execute',
    summary: 'Execute Workflow',
    description: 'Execute a workflow with provided parameters',
    tags: ['Workflows'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Workflow ID to execute',
      },
    ],
    requestBody: {
      contentType: 'application/json',
      schema: {
        parameters: 'object',
        context: 'object (optional)',
      },
      required: true,
      description: 'Workflow execution parameters',
    },
    responses: [
      {
        status: 202,
        description: 'Workflow execution started',
      },
    ],
  },

  // Projects Endpoints
  {
    method: 'get',
    path: '/v1/projects',
    summary: 'List Projects',
    description: 'Get a paginated list of user projects',
    tags: ['Projects'],
    authenticated: true,
    parameters: [
      {
        name: 'page',
        in: 'query',
        type: 'integer',
        required: false,
        default: 1,
        description: 'Page number for pagination',
      },
      {
        name: 'perPage',
        in: 'query',
        type: 'integer',
        required: false,
        default: 20,
        description: 'Items per page (max 100)',
      },
      {
        name: 'status',
        in: 'query',
        type: 'string',
        required: false,
        description: 'Filter by project status',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Paginated list of projects',
      },
    ],
  },
  {
    method: 'post',
    path: '/v1/projects',
    summary: 'Create Project',
    description: 'Create a new project',
    tags: ['Projects'],
    authenticated: true,
    requestBody: {
      contentType: 'application/json',
      schema: {
        name: 'string (required)',
        description: 'string (optional)',
        type: 'string (optional)',
      },
      required: true,
      description: 'Project creation data',
    },
    responses: [
      {
        status: 201,
        description: 'Project created successfully',
      },
      {
        status: 400,
        description: 'Validation error',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'get',
    path: '/v1/projects/{id}',
    summary: 'Get Project Details',
    description: 'Get detailed information about a specific project',
    tags: ['Projects'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Project ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Project details',
      },
      {
        status: 404,
        description: 'Project not found',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'put',
    path: '/v1/projects/{id}',
    summary: 'Update Project',
    description: 'Update an existing project',
    tags: ['Projects'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Project ID',
      },
    ],
    requestBody: {
      contentType: 'application/json',
      schema: {
        name: 'string (optional)',
        description: 'string (optional)',
        status: 'string (optional)',
      },
      required: true,
      description: 'Project update data',
    },
    responses: [
      {
        status: 200,
        description: 'Project updated successfully',
      },
      {
        status: 404,
        description: 'Project not found',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'delete',
    path: '/v1/projects/{id}',
    summary: 'Delete Project',
    description: 'Delete a project',
    tags: ['Projects'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Project ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Project deleted successfully',
      },
      {
        status: 404,
        description: 'Project not found',
        schema: errorSchema,
      },
    ],
  },
  {
    method: 'get',
    path: '/v1/projects/{id}/artifacts',
    summary: 'List Project Artifacts',
    description: 'Get artifacts associated with a project',
    tags: ['Projects'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Project ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'List of project artifacts',
      },
    ],
  },

  // Templates Endpoints
  {
    method: 'get',
    path: '/v1/templates',
    summary: 'List Templates',
    description: 'Get a list of available report templates',
    tags: ['Templates'],
    authenticated: true,
    responses: [
      {
        status: 200,
        description: 'List of templates',
      },
    ],
  },
  {
    method: 'get',
    path: '/v1/templates/{templateId}',
    summary: 'Get Template Details',
    description: 'Get detailed information about a specific template',
    tags: ['Templates'],
    authenticated: true,
    parameters: [
      {
        name: 'templateId',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Template ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Template details',
      },
      {
        status: 404,
        description: 'Template not found',
        schema: errorSchema,
      },
    ],
  },

  // API Keys Endpoints
  {
    method: 'get',
    path: '/v1/api-keys',
    summary: 'List API Keys',
    description: 'Get a list of user API keys',
    tags: ['API Keys'],
    authenticated: true,
    responses: [
      {
        status: 200,
        description: 'List of API keys',
      },
    ],
  },
  {
    method: 'post',
    path: '/v1/api-keys',
    summary: 'Create API Key',
    description: 'Generate a new API key',
    tags: ['API Keys'],
    authenticated: true,
    requestBody: {
      contentType: 'application/json',
      schema: {
        name: 'string (required)',
        permissions: 'array of strings (optional)',
        expiresAt: 'ISO date string (optional)',
      },
      required: true,
      description: 'API key creation data',
    },
    responses: [
      {
        status: 201,
        description: 'API key created',
      },
    ],
  },
  {
    method: 'delete',
    path: '/v1/api-keys/{id}',
    summary: 'Revoke API Key',
    description: 'Revoke an API key',
    tags: ['API Keys'],
    authenticated: true,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'API Key ID',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'API key revoked',
      },
    ],
  },
];

/**
 * Convert endpoint metadata to OpenAPI operation
 */
function endpointToOperation(endpoint: EndpointMetadata): OpenAPIOperation {
  const operation: OpenAPIOperation = {
    summary: endpoint.summary,
    description: endpoint.description,
    tags: endpoint.tags,
    responses: {},
  };

  // Add parameters
  if (endpoint.parameters) {
    operation.parameters = endpoint.parameters.map((param) => ({
      name: param.name,
      in: param.in,
      required: param.required,
      description: param.description,
      schema: { type: param.type, enum: param.enum },
    }));
  }

  // Add request body
  if (endpoint.requestBody) {
    operation.requestBody = {
      description: endpoint.requestBody.description,
      required: endpoint.requestBody.required,
      content: {
        [endpoint.requestBody.contentType]: {
          schema: {
            type: 'object',
            properties: endpoint.requestBody.schema as Record<string, OpenAPISchema>,
          },
        },
      },
    };
  }

  // Add responses
  for (const response of endpoint.responses) {
    operation.responses[response.status] = {
      description: response.description,
      content: response.schema
        ? {
            'application/json': {
              schema: response.schema,
            },
          }
        : undefined,
    };
  }

  // Add security requirement for authenticated endpoints
  if (endpoint.authenticated) {
    operation.security = [{ BearerAuth: [] }];
  }

  return operation;
}

/**
 * Generate OpenAPI specification
 */
export function generateOpenAPISpec(): OpenAPIDocument {
  const spec: OpenAPIDocument = {
    openapi: '3.0.0',
    info: {
      title: 'BMAD API',
      version: '1.0.0',
      description: `# BMAD Cybersecurity Platform API

The BMAD API provides programmatic access to the BMAD cybersecurity platform capabilities, including agent invocation, workflow execution, project management, and more.

## Authentication

The BMAD API supports two authentication methods:

1. **Session Token**: For web clients with active browser sessions
2. **API Key**: For programmatic access

### Using API Keys

Include your API key in the Authorization header:

\`\`\`http
Authorization: Bearer bmad_sk_your_key_here
\`\`\`

Or use the X-API-Key header:

\`\`\`http
X-API-Key: bmad_sk_your_key_here
\`\`\`

## Rate Limiting

API requests are rate limited based on your authentication method and role:

| Role | Requests/Minute | Requests/Hour |
|------|----------------|---------------|
| API Key (Developer) | 60 | 1,000 |
| API Key (Enterprise) | 200 | 5,000 |
| Session Token | 100 | 2,000 |

Rate limit headers are included in every response:

- \`X-RateLimit-Limit\`: Request limit per time window
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Unix timestamp when limit resets

## Errors

The API uses standard HTTP status codes and returns error responses in the following format:

\`\`\`json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
\`\`\`

See the [Errors](#section/Errors) section for a list of error codes.`,
      contact: {
        name: 'BMAD Support',
        url: 'https://bmad.security/support',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'https://api.bmad.security',
        description: 'Production API',
      },
      {
        url: 'http://localhost:42001',
        description: 'Local development',
      },
    ],
    paths: {},
    tags: [
      {
        name: 'Health',
        description: 'Health check and status endpoints',
      },
      {
        name: 'Agents',
        description: 'Agent management and invocation endpoints',
      },
      {
        name: 'Workflows',
        description: 'Workflow management and execution endpoints',
      },
      {
        name: 'Projects',
        description: 'Project CRUD operations',
      },
      {
        name: 'Templates',
        description: 'Report template endpoints',
      },
      {
        name: 'API Keys',
        description: 'API key management endpoints',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'API key authentication using Bearer token format',
        },
      },
      schemas: {
        StandardResponse: standardResponseSchema,
        ErrorResponse: errorSchema,
      },
    },
  };

  // Build paths from endpoints
  for (const endpoint of API_ENDPOINTS) {
    if (!spec.paths[endpoint.path]) {
      spec.paths[endpoint.path] = {};
    }
    const pathItem = spec.paths[endpoint.path];
    (pathItem as Record<string, unknown>)[endpoint.method] = endpointToOperation(endpoint);
  }

  return spec;
}

/**
 * Get all endpoints for documentation
 */
export function getAllEndpoints(): EndpointMetadata[] {
  return API_ENDPOINTS;
}

/**
 * Get endpoints by tag
 */
export function getEndpointsByTag(tag: string): EndpointMetadata[] {
  return API_ENDPOINTS.filter((e) => e.tags.includes(tag));
}

/**
 * Get endpoint by path and method
 */
export function getEndpoint(path: string, method: HTTPMethod): EndpointMetadata | undefined {
  return API_ENDPOINTS.find((e) => e.path === path && e.method === method);
}
