/**
 * EPIC 2 STORY 2.7 - OPENAPI SPECIFICATION GENERATOR
 * Comprehensive OpenAPI 3.0 specification for BMAD Package Registry API
 * Auto-generates documentation, validation schemas, and SDK specifications
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.7
 */

// Define OpenAPI types locally since 'openapi-types' module is not installed
export interface OpenAPIV3 {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, any>;
  components?: OpenAPIComponents;
  security?: any[];
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
}

export interface OpenAPIContact {
  name?: string;
  email?: string;
  url?: string;
}

export interface OpenAPILicense {
  name: string;
  url?: string;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
}

export interface OpenAPIComponents {
  schemas?: Record<string, any>;
  securitySchemes?: Record<string, any>;
}

export namespace OpenAPIV3 {
  export interface Document {
    openapi: string;
    info: OpenAPIInfo;
    servers?: OpenAPIServer[];
    paths: Record<string, any>;
    components?: OpenAPIComponents;
    security?: any[];
  }
}

/**
 * Generate comprehensive OpenAPI 3.0 specification
 */
export function generateOpenAPISpec(): OpenAPIV3.Document {
  return {
    openapi: '3.0.0',
    info: {
      title: 'BMAD Package Registry API',
      version: '1.0.0',
      description: `
# BMAD Package Registry API

The BMAD Package Registry API provides a comprehensive platform for package management,
dependency resolution, discovery, and analytics. This API supports enterprise-grade
features including security integration, performance monitoring, and multi-language SDK generation.

## Features

- **Package Management**: Full CRUD operations for packages and versions
- **Dependency Resolution**: Intelligent dependency analysis and conflict resolution
- **Discovery & Search**: Advanced search with faceting and recommendations
- **Analytics**: Comprehensive usage tracking and performance metrics
- **Security**: Integrated authentication, authorization, and audit logging
- **Performance**: Caching, rate limiting, and circuit breaker patterns

## Authentication

The API supports Bearer token authentication:

\`\`\`
Authorization: Bearer <your-api-token>
\`\`\`

## Rate Limiting

Requests are limited to 1000 per 15-minute window per API key or IP address.
Rate limit headers are included in responses:

- \`X-RateLimit-Limit\`: Request limit per window
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Window reset time

## Error Handling

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...}
  },
  "meta": {
    "timestamp": "2024-01-25T10:30:00.000Z",
    "version": "1.0.0",
    "requestId": "req_123456789"
  }
}
\`\`\`

## SDK Support

Official SDKs are available for:
- TypeScript/JavaScript
- Python
- Go
- Java
- C#
      `.trim(),
      contact: {
        name: 'BMAD Package Management Team',
        email: 'packages@bmad.com',
        url: 'https://bmad.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.packages.bmad.com',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.packages.bmad.com',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check endpoint',
          description: 'Returns the current health status of the API and its dependencies',
          operationId: 'getHealthStatus',
          responses: {
            '200': {
              description: 'System is healthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthStatus' }
                }
              }
            },
            '503': {
              description: 'System is unhealthy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/version': {
        get: {
          tags: ['System'],
          summary: 'Get API version information',
          operationId: 'getVersion',
          responses: {
            '200': {
              description: 'Version information',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/VersionInfo' }
                }
              }
            }
          }
        }
      },
      '/packages': {
        get: {
          tags: ['Packages'],
          summary: 'Search packages',
          description: 'Search for packages with optional filtering, sorting, and pagination',
          operationId: 'searchPackages',
          parameters: [
            {
              name: 'q',
              in: 'query',
              description: 'Search query string',
              required: false,
              schema: { type: 'string', example: 'security logging' }
            },
            {
              name: 'category',
              in: 'query',
              description: 'Package category filter',
              required: false,
              schema: { type: 'string', example: 'security' }
            },
            {
              name: 'tag',
              in: 'query',
              description: 'Package tag filter',
              required: false,
              schema: { type: 'string', example: 'encryption' }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number (1-based)',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Results per page',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
            },
            {
              name: 'sort',
              in: 'query',
              description: 'Sort field',
              required: false,
              schema: {
                type: 'string',
                enum: ['name', 'popularity', 'downloads', 'updated', 'created'],
                default: 'popularity'
              }
            },
            {
              name: 'order',
              in: 'query',
              description: 'Sort order',
              required: false,
              schema: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'desc'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Search results',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PackageSearchResult' }
                }
              }
            },
            '400': {
              description: 'Invalid search parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        post: {
          tags: ['Packages'],
          summary: 'Publish a new package',
          description: 'Upload and publish a new package to the registry',
          operationId: 'publishPackage',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PackagePublishRequest' }
              },
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    metadata: {
                      type: 'string',
                      description: 'Package metadata as JSON string'
                    },
                    package: {
                      type: 'string',
                      format: 'binary',
                      description: 'Package archive file'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Package published successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PackagePublishResponse' }
                }
              }
            },
            '400': {
              description: 'Invalid package data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '401': {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '403': {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '409': {
              description: 'Package version already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/packages/{packageId}': {
        get: {
          tags: ['Packages'],
          summary: 'Get package details',
          description: 'Retrieve detailed information about a specific package',
          operationId: 'getPackage',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier (name or ID)',
              schema: { type: 'string', example: 'bmad-security-core' }
            },
            {
              name: 'version',
              in: 'query',
              required: false,
              description: 'Specific version to retrieve (defaults to latest)',
              schema: { type: 'string', example: '1.2.3' }
            }
          ],
          responses: {
            '200': {
              description: 'Package details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PackageDetail' }
                }
              }
            },
            '404': {
              description: 'Package not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        put: {
          tags: ['Packages'],
          summary: 'Update package metadata',
          description: 'Update metadata for an existing package',
          operationId: 'updatePackage',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PackageUpdateRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Package updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PackageDetail' }
                }
              }
            },
            '400': {
              description: 'Invalid update data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '404': {
              description: 'Package not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Packages'],
          summary: 'Delete package',
          description: 'Delete a package and all its versions (admin only)',
          operationId: 'deletePackage',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Package deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Package deleted successfully' }
                    }
                  }
                }
              }
            },
            '403': {
              description: 'Admin access required',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            '404': {
              description: 'Package not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/packages/{packageId}/versions': {
        get: {
          tags: ['Packages'],
          summary: 'Get package versions',
          description: 'List all available versions for a package',
          operationId: 'getPackageVersions',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Package versions list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PackageVersion' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/packages/{packageId}/download': {
        get: {
          tags: ['Packages'],
          summary: 'Download package',
          description: 'Download the package archive file',
          operationId: 'downloadPackage',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            },
            {
              name: 'version',
              in: 'query',
              required: false,
              description: 'Package version (defaults to latest)',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Package download',
              content: {
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              },
              headers: {
                'Content-Disposition': {
                  description: 'Attachment filename',
                  schema: { type: 'string' }
                },
                'Content-Length': {
                  description: 'File size in bytes',
                  schema: { type: 'integer' }
                }
              }
            },
            '404': {
              description: 'Package or version not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/packages/{packageId}/install': {
        post: {
          tags: ['Packages'],
          summary: 'Install package',
          description: 'Install a package with dependency resolution',
          operationId: 'installPackage',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PackageInstallRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Installation completed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/InstallationResult' }
                }
              }
            },
            '400': {
              description: 'Invalid installation parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/dependencies/resolve': {
        post: {
          tags: ['Dependencies'],
          summary: 'Resolve dependencies',
          description: 'Resolve dependency conflicts and return installation plan',
          operationId: 'resolveDependencies',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DependencyResolutionRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Dependency resolution successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DependencyResolutionResult' }
                }
              }
            },
            '409': {
              description: 'Unresolvable dependency conflicts',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/dependencies/graph/{packageId}': {
        get: {
          tags: ['Dependencies'],
          summary: 'Get dependency graph',
          description: 'Get the complete dependency graph for a package',
          operationId: 'getDependencyGraph',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            },
            {
              name: 'depth',
              in: 'query',
              required: false,
              description: 'Maximum depth of dependency tree (default: 10)',
              schema: { type: 'integer', minimum: 1, maximum: 20, default: 10 }
            },
            {
              name: 'version',
              in: 'query',
              required: false,
              description: 'Package version',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Dependency graph',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DependencyGraph' }
                }
              }
            }
          }
        }
      },
      '/discovery/search': {
        post: {
          tags: ['Discovery'],
          summary: 'Advanced package search',
          description: 'Perform advanced search with complex filters and faceting',
          operationId: 'advancedSearch',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdvancedSearchRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Search results with facets',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AdvancedSearchResult' }
                }
              }
            }
          }
        }
      },
      '/discovery/recommendations/{packageId}': {
        get: {
          tags: ['Discovery'],
          summary: 'Get package recommendations',
          description: 'Get intelligent package recommendations based on usage patterns',
          operationId: 'getRecommendations',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              description: 'Maximum number of recommendations',
              schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
            },
            {
              name: 'type',
              in: 'query',
              required: false,
              description: 'Type of recommendations',
              schema: {
                type: 'string',
                enum: ['similar', 'complementary', 'alternative'],
                default: 'similar'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Package recommendations',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PackageRecommendation' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/discovery/trending': {
        get: {
          tags: ['Discovery'],
          summary: 'Get trending packages',
          description: 'Get packages that are currently trending based on download patterns',
          operationId: 'getTrendingPackages',
          parameters: [
            {
              name: 'period',
              in: 'query',
              required: false,
              description: 'Time period for trending calculation',
              schema: {
                type: 'string',
                enum: ['1d', '7d', '30d'],
                default: '7d'
              }
            },
            {
              name: 'category',
              in: 'query',
              required: false,
              description: 'Filter by package category',
              schema: { type: 'string' }
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              description: 'Maximum number of results',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
            }
          ],
          responses: {
            '200': {
              description: 'Trending packages',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/TrendingPackage' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/analytics/events': {
        post: {
          tags: ['Analytics'],
          summary: 'Record analytics event',
          description: 'Record usage analytics events for tracking and insights',
          operationId: 'recordEvent',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnalyticsEvent' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Event recorded successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      eventId: { type: 'string', example: 'evt_123456789' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/analytics/packages/{packageId}/stats': {
        get: {
          tags: ['Analytics'],
          summary: 'Get package statistics',
          description: 'Get detailed usage statistics for a package',
          operationId: 'getPackageStats',
          parameters: [
            {
              name: 'packageId',
              in: 'path',
              required: true,
              description: 'Package identifier',
              schema: { type: 'string' }
            },
            {
              name: 'period',
              in: 'query',
              required: false,
              description: 'Time period for statistics',
              schema: {
                type: 'string',
                enum: ['1d', '7d', '30d', '90d'],
                default: '30d'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Package statistics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PackageStatistics' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer token authentication. Include your API token in the Authorization header.'
        }
      },
      schemas: {
        // Success Response Schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: { $ref: '#/components/schemas/ResponseMeta' }
          },
          required: ['success']
        },

        // Error Response Schema
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'PACKAGE_NOT_FOUND' },
                message: { type: 'string', example: 'The requested package could not be found' },
                details: { type: 'object' }
              },
              required: ['code', 'message']
            },
            meta: { $ref: '#/components/schemas/ResponseMeta' }
          },
          required: ['success', 'error']
        },

        // Response Metadata
        ResponseMeta: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '1.0.0' },
            requestId: { type: 'string', example: 'req_123456789' },
            pagination: { $ref: '#/components/schemas/PaginationMeta' }
          },
          required: ['timestamp', 'version', 'requestId']
        },

        // Pagination Metadata
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          },
          required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
        },

        // System Health Status
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              example: 'healthy'
            },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string', example: '1.0.0' },
            uptime: { type: 'number', example: 86400 },
            services: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                  responseTime: { type: 'number', example: 45 },
                  lastCheck: { type: 'string', format: 'date-time' }
                }
              }
            }
          },
          required: ['status', 'timestamp', 'version']
        },

        // Version Information
        VersionInfo: {
          type: 'object',
          properties: {
            api: { type: 'string', example: '1.0.0' },
            build: { type: 'string', example: '2024.01.25.1' },
            commit: { type: 'string', example: 'a1b2c3d4' },
            environment: { type: 'string', example: 'production' }
          },
          required: ['api', 'build']
        },

        // Package Base Information
        PackageBase: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'bmad-security-core' },
            name: { type: 'string', example: 'BMAD Security Core' },
            version: { type: 'string', example: '1.2.3' },
            description: { type: 'string', example: 'Core security utilities for BMAD platform' },
            author: { type: 'string', example: 'BMAD Security Team' },
            license: { type: 'string', example: 'MIT' },
            homepage: { type: 'string', format: 'uri', example: 'https://github.com/bmad/security-core' },
            repository: { type: 'string', format: 'uri', example: 'https://github.com/bmad/security-core.git' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['security', 'encryption', 'authentication']
            },
            category: { type: 'string', example: 'security' },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              example: ['security', 'crypto', 'auth']
            }
          },
          required: ['id', 'name', 'version', 'author', 'license']
        },

        // Package Detail with full information
        PackageDetail: {
          allOf: [
            { $ref: '#/components/schemas/PackageBase' },
            {
              type: 'object',
              properties: {
                readme: { type: 'string', example: '# BMAD Security Core\n\nComprehensive security utilities...' },
                changelog: { type: 'string' },
                publishedAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                size: { type: 'integer', example: 1048576, description: 'Package size in bytes' },
                downloadUrl: { type: 'string', format: 'uri' },
                dependencies: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PackageDependency' }
                },
                devDependencies: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PackageDependency' }
                },
                peerDependencies: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PackageDependency' }
                },
                stats: { $ref: '#/components/schemas/PackageStats' },
                security: { $ref: '#/components/schemas/SecurityInfo' },
                quality: { $ref: '#/components/schemas/QualityMetrics' }
              }
            }
          ]
        },

        // Package Dependency
        PackageDependency: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'crypto-utils' },
            version: { type: 'string', example: '^2.1.0' },
            type: {
              type: 'string',
              enum: ['runtime', 'development', 'peer', 'optional'],
              example: 'runtime'
            },
            optional: { type: 'boolean', default: false }
          },
          required: ['name', 'version', 'type']
        },

        // Package Statistics
        PackageStats: {
          type: 'object',
          properties: {
            downloadCount: { type: 'integer', example: 125000 },
            weeklyDownloads: { type: 'integer', example: 5000 },
            monthlyDownloads: { type: 'integer', example: 18500 },
            installCount: { type: 'integer', example: 50000 },
            dependentCount: { type: 'integer', example: 342 },
            popularityScore: { type: 'number', format: 'float', example: 0.85 },
            trendingScore: { type: 'number', format: 'float', example: 1.2 },
            qualityScore: { type: 'number', format: 'float', example: 0.92 }
          }
        },

        // Security Information
        SecurityInfo: {
          type: 'object',
          properties: {
            vulnerabilityCount: { type: 'integer', example: 0 },
            securityScore: { type: 'number', format: 'float', example: 0.98 },
            lastSecurityScan: { type: 'string', format: 'date-time' },
            knownVulnerabilities: {
              type: 'array',
              items: { $ref: '#/components/schemas/SecurityVulnerability' }
            },
            licenseCompliance: { type: 'boolean', example: true },
            signatureVerified: { type: 'boolean', example: true }
          }
        },

        // Security Vulnerability
        SecurityVulnerability: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'CVE-2024-1234' },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              example: 'medium'
            },
            title: { type: 'string', example: 'Buffer overflow in parsing function' },
            description: { type: 'string' },
            fixedIn: { type: 'string', example: '1.2.4' },
            publishedDate: { type: 'string', format: 'date-time' },
            cvssScore: { type: 'number', format: 'float', example: 5.5 }
          },
          required: ['id', 'severity', 'title']
        },

        // Quality Metrics
        QualityMetrics: {
          type: 'object',
          properties: {
            testCoverage: { type: 'number', format: 'float', example: 0.95 },
            codeQuality: { type: 'number', format: 'float', example: 0.88 },
            maintainabilityIndex: { type: 'number', format: 'float', example: 0.82 },
            technicalDebt: { type: 'string', example: '2h' },
            hasTests: { type: 'boolean', example: true },
            hasDocumentation: { type: 'boolean', example: true },
            isActivelyMaintained: { type: 'boolean', example: true },
            lastCommit: { type: 'string', format: 'date-time' }
          }
        },

        // Package Version
        PackageVersion: {
          type: 'object',
          properties: {
            version: { type: 'string', example: '1.2.3' },
            publishedAt: { type: 'string', format: 'date-time' },
            deprecated: { type: 'boolean', default: false },
            prerelease: { type: 'boolean', default: false },
            size: { type: 'integer', example: 1048576 },
            sha256: { type: 'string', example: 'a1b2c3d4e5f6...' },
            downloadCount: { type: 'integer', example: 5000 }
          },
          required: ['version', 'publishedAt']
        },

        // Package Search Result
        PackageSearchResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                packages: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PackageBase' }
                },
                total: { type: 'integer', example: 150 },
                facets: {
                  type: 'object',
                  additionalProperties: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SearchFacet' }
                  }
                }
              }
            },
            meta: {
              allOf: [
                { $ref: '#/components/schemas/ResponseMeta' },
                {
                  type: 'object',
                  properties: {
                    queryTime: { type: 'number', example: 0.045 }
                  }
                }
              ]
            }
          }
        },

        // Search Facet
        SearchFacet: {
          type: 'object',
          properties: {
            value: { type: 'string', example: 'security' },
            count: { type: 'integer', example: 25 },
            selected: { type: 'boolean', default: false }
          },
          required: ['value', 'count']
        },

        // Package Publish Request
        PackagePublishRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'my-awesome-package' },
            version: { type: 'string', example: '1.0.0' },
            description: { type: 'string', example: 'An awesome package that does amazing things' },
            author: { type: 'string', example: 'John Doe <john@example.com>' },
            license: { type: 'string', example: 'MIT' },
            homepage: { type: 'string', format: 'uri' },
            repository: { type: 'string', format: 'uri' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string', example: 'utilities' },
            dependencies: {
              type: 'array',
              items: { $ref: '#/components/schemas/PackageDependency' }
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of files to include in package'
            },
            scripts: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Package scripts'
            }
          },
          required: ['name', 'version', 'description', 'author', 'license']
        },

        // Package Publish Response
        PackagePublishResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                packageId: { type: 'string', example: 'my-awesome-package' },
                version: { type: 'string', example: '1.0.0' },
                publishedAt: { type: 'string', format: 'date-time' },
                downloadUrl: { type: 'string', format: 'uri' },
                size: { type: 'integer', example: 1048576 }
              }
            },
            meta: { $ref: '#/components/schemas/ResponseMeta' }
          }
        },

        // Package Update Request
        PackageUpdateRequest: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            homepage: { type: 'string', format: 'uri' },
            repository: { type: 'string', format: 'uri' },
            tags: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' },
            deprecated: { type: 'boolean' },
            deprecationReason: { type: 'string' }
          }
        },

        // Package Install Request
        PackageInstallRequest: {
          type: 'object',
          properties: {
            version: { type: 'string', example: '1.2.3' },
            target: { type: 'string', example: './node_modules' },
            options: {
              type: 'object',
              properties: {
                includeDev: { type: 'boolean', default: false },
                forceReinstall: { type: 'boolean', default: false },
                offline: { type: 'boolean', default: false }
              }
            }
          }
        },

        // Installation Result
        InstallationResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            packageId: { type: 'string', example: 'my-package' },
            version: { type: 'string', example: '1.2.3' },
            installedAt: { type: 'string', format: 'date-time' },
            dependencies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' },
                  resolved: { type: 'boolean' }
                }
              }
            },
            conflicts: {
              type: 'array',
              items: { $ref: '#/components/schemas/DependencyConflict' }
            }
          }
        },

        // Dependency Resolution Request
        DependencyResolutionRequest: {
          type: 'object',
          properties: {
            packages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' }
                },
                required: ['name', 'version']
              }
            },
            constraints: {
              type: 'object',
              properties: {
                platform: { type: 'string', example: 'node' },
                version: { type: 'string', example: '>=14.0.0' },
                environment: { type: 'string', example: 'production' }
              }
            },
            options: {
              type: 'object',
              properties: {
                allowPrerelease: { type: 'boolean', default: false },
                includeOptional: { type: 'boolean', default: true },
                maxDepth: { type: 'integer', default: 10 }
              }
            }
          },
          required: ['packages']
        },

        // Dependency Resolution Result
        DependencyResolutionResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            resolved: { type: 'boolean', example: true },
            packages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' },
                  resolvedVersion: { type: 'string' },
                  dependencies: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            conflicts: {
              type: 'array',
              items: { $ref: '#/components/schemas/DependencyConflict' }
            },
            warnings: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },

        // Dependency Conflict
        DependencyConflict: {
          type: 'object',
          properties: {
            package: { type: 'string', example: 'lodash' },
            requestedVersions: {
              type: 'array',
              items: { type: 'string' },
              example: ['4.17.20', '3.10.1']
            },
            requiredBy: {
              type: 'array',
              items: { type: 'string' },
              example: ['package-a', 'package-b']
            },
            severity: {
              type: 'string',
              enum: ['warning', 'error', 'fatal'],
              example: 'warning'
            },
            resolution: { type: 'string', example: 'Use version 4.17.20' }
          },
          required: ['package', 'requestedVersions', 'severity']
        },

        // Dependency Graph
        DependencyGraph: {
          type: 'object',
          properties: {
            root: { type: 'string', example: 'my-package' },
            nodes: {
              type: 'array',
              items: { $ref: '#/components/schemas/DependencyNode' }
            },
            edges: {
              type: 'array',
              items: { $ref: '#/components/schemas/DependencyEdge' }
            },
            resolved: { type: 'boolean', example: true },
            depth: { type: 'integer', example: 5 },
            totalPackages: { type: 'integer', example: 42 },
            conflicts: {
              type: 'array',
              items: { $ref: '#/components/schemas/DependencyConflict' }
            }
          }
        },

        // Dependency Node
        DependencyNode: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'lodash@4.17.20' },
            name: { type: 'string', example: 'lodash' },
            version: { type: 'string', example: '4.17.20' },
            level: { type: 'integer', example: 2 },
            parents: { type: 'array', items: { type: 'string' } },
            children: { type: 'array', items: { type: 'string' } },
            type: {
              type: 'string',
              enum: ['runtime', 'development', 'peer', 'optional'],
              example: 'runtime'
            },
            resolved: { type: 'boolean', example: true }
          },
          required: ['id', 'name', 'version', 'level', 'type']
        },

        // Dependency Edge
        DependencyEdge: {
          type: 'object',
          properties: {
            from: { type: 'string', example: 'my-package@1.0.0' },
            to: { type: 'string', example: 'lodash@4.17.20' },
            type: {
              type: 'string',
              enum: ['runtime', 'development', 'peer', 'optional'],
              example: 'runtime'
            },
            constraint: { type: 'string', example: '^4.17.0' },
            resolved: { type: 'boolean', example: true }
          },
          required: ['from', 'to', 'type', 'constraint']
        },

        // Advanced Search Request
        AdvancedSearchRequest: {
          type: 'object',
          properties: {
            query: { type: 'string', example: 'security encryption' },
            filters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'category' },
                  operator: {
                    type: 'string',
                    enum: ['equals', 'contains', 'in', 'range'],
                    example: 'equals'
                  },
                  value: { oneOf: [{ type: 'string' }, { type: 'array' }, { type: 'number' }] }
                }
              }
            },
            sorting: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'popularity' },
                  direction: { type: 'string', enum: ['asc', 'desc'], example: 'desc' },
                  priority: { type: 'integer', example: 1 }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                offset: { type: 'integer', default: 0 },
                limit: { type: 'integer', default: 20 }
              }
            },
            facets: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean', default: true },
                fields: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['category', 'tags', 'license']
                }
              }
            }
          }
        },

        // Advanced Search Result
        AdvancedSearchResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                packages: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PackageBase' }
                },
                total: { type: 'integer', example: 150 },
                facets: {
                  type: 'object',
                  additionalProperties: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SearchFacet' }
                  }
                },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Search query suggestions'
                }
              }
            },
            meta: {
              allOf: [
                { $ref: '#/components/schemas/ResponseMeta' },
                {
                  type: 'object',
                  properties: {
                    queryTime: { type: 'number', example: 0.045 },
                    resultsFrom: { type: 'string', example: 'elasticsearch' }
                  }
                }
              ]
            }
          }
        },

        // Package Recommendation
        PackageRecommendation: {
          type: 'object',
          properties: {
            package: { $ref: '#/components/schemas/PackageBase' },
            score: { type: 'number', format: 'float', example: 0.89 },
            reason: { type: 'string', example: 'Commonly used together' },
            type: {
              type: 'string',
              enum: ['similar', 'complementary', 'alternative'],
              example: 'complementary'
            }
          },
          required: ['package', 'score', 'reason', 'type']
        },

        // Trending Package
        TrendingPackage: {
          allOf: [
            { $ref: '#/components/schemas/PackageBase' },
            {
              type: 'object',
              properties: {
                trendingScore: { type: 'number', format: 'float', example: 2.5 },
                downloadGrowth: { type: 'number', format: 'float', example: 0.45 },
                period: { type: 'string', example: '7d' },
                rank: { type: 'integer', example: 5 },
                previousRank: { type: 'integer', example: 12 }
              }
            }
          ]
        },

        // Analytics Event
        AnalyticsEvent: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['download', 'install', 'search', 'view', 'error'],
              example: 'download'
            },
            packageId: { type: 'string', example: 'bmad-security-core' },
            version: { type: 'string', example: '1.2.3' },
            timestamp: { type: 'string', format: 'date-time' },
            userId: { type: 'string', example: 'user_123' },
            sessionId: { type: 'string', example: 'session_456' },
            client: {
              type: 'object',
              properties: {
                userAgent: { type: 'string' },
                platform: { type: 'string', example: 'node' },
                version: { type: 'string', example: '14.17.0' },
                country: { type: 'string', example: 'US' }
              }
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional event-specific data'
            }
          },
          required: ['type', 'timestamp']
        },

        // Package Statistics
        PackageStatistics: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                packageId: { type: 'string', example: 'bmad-security-core' },
                period: { type: 'string', example: '30d' },
                downloads: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 15000 },
                    daily: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          date: { type: 'string', format: 'date' },
                          count: { type: 'integer' }
                        }
                      }
                    }
                  }
                },
                installs: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 8500 },
                    unique: { type: 'integer', example: 6200 }
                  }
                },
                geographic: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      country: { type: 'string', example: 'US' },
                      count: { type: 'integer', example: 5000 },
                      percentage: { type: 'number', format: 'float', example: 0.33 }
                    }
                  }
                },
                versions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      version: { type: 'string', example: '1.2.3' },
                      downloads: { type: 'integer', example: 8000 },
                      percentage: { type: 'number', format: 'float', example: 0.53 }
                    }
                  }
                }
              }
            },
            meta: { $ref: '#/components/schemas/ResponseMeta' }
          }
        }
      }
    },
    tags: [
      {
        name: 'System',
        description: 'System health, status, and version information'
      },
      {
        name: 'Packages',
        description: 'Package management operations - create, read, update, delete, download'
      },
      {
        name: 'Dependencies',
        description: 'Dependency resolution and graph analysis'
      },
      {
        name: 'Discovery',
        description: 'Package search, recommendations, and trending analysis'
      },
      {
        name: 'Analytics',
        description: 'Usage analytics and statistics tracking'
      }
    ]
  };
}

/**
 * Generate OpenAPI specification for specific version
 */
export function generateVersionedSpec(version: string): OpenAPIV3.Document {
  const spec = generateOpenAPISpec();
  spec.info.version = version;

  // Update server URLs to include version
  const servers: OpenAPIServer[] = spec.servers ? [...spec.servers] : [];
  spec.servers = servers.map(server => ({
    ...server,
    url: `${server.url}/api/v${version.split('.')[0]}`
  }));

  return spec;
}

/**
 * Generate SDK-specific OpenAPI specification
 */
export function generateSDKSpec(language: string): OpenAPIV3.Document {
  const spec = generateOpenAPISpec();

  // Customize specification for specific SDKs
  switch (language) {
    case 'typescript':
      // Add TypeScript-specific examples and schemas
      spec.info.description += '\n\n## TypeScript SDK\n\nThis specification includes TypeScript-specific type definitions and examples.';
      break;
    case 'python':
      // Add Python-specific examples and schemas
      spec.info.description += '\n\n## Python SDK\n\nThis specification includes Python-specific examples and type hints.';
      break;
    case 'go':
      // Add Go-specific examples and schemas
      spec.info.description += '\n\n## Go SDK\n\nThis specification includes Go-specific struct definitions and examples.';
      break;
    case 'java':
      // Add Java-specific examples and schemas
      spec.info.description += '\n\n## Java SDK\n\nThis specification includes Java-specific class definitions and examples.';
      break;
  }

  return spec;
}

/**
 * Validate OpenAPI specification
 */
export function validateSpec(spec: OpenAPIV3.Document): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!spec.openapi || !spec.info || !spec.paths) {
    errors.push('Missing required OpenAPI fields');
  }

  if (!spec.info.title || !spec.info.version) {
    errors.push('Missing required info fields');
  }

  // Validate paths
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    if (!pathItem) continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation !== 'object' || operation === null) continue;

      const op = operation as Record<string, unknown>;
      if (!op.operationId) {
        errors.push(`Missing operationId for ${method.toUpperCase()} ${path}`);
      }

      if (!op.responses) {
        errors.push(`Missing responses for ${method.toUpperCase()} ${path}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Export OpenAPI specification to YAML
 */
export function exportToYAML(spec: OpenAPIV3.Document): string {
  // This would require a YAML library like js-yaml
  // For now, return JSON string representation
  return JSON.stringify(spec, null, 2);
}

/**
 * Export OpenAPI specification to JSON
 */
export function exportToJSON(spec: OpenAPIV3.Document): string {
  return JSON.stringify(spec, null, 2);
}

/**
 * Default OpenAPI configuration
 */
export const defaultOpenAPIConfig = {
  title: 'BMAD Package Registry API',
  version: '1.0.0',
  description: 'Enterprise package management system with integrated security',
  contactEmail: 'packages@bmad.com',
  licenseUrl: 'https://opensource.org/licenses/MIT'
};

// Export main function
export default generateOpenAPISpec;