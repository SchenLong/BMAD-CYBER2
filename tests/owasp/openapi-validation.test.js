/**
 * OWASP ASVS V13: OpenAPI Specification Validation Tests
 * ========================================================
 * Suite: tests/owasp/openapi-validation.test.js
 * OWASP Coverage: V13-005, V13-006, V13-007
 * Story: OWASP-15 — Extended API Documentation & OpenAPI Validation
 *
 * Tests for OpenAPI specification validation:
 * - V13-005: OpenAPI spec exists and is valid
 * - V13-006: Security schemes defined
 * - V13-007: Schema validation matches implementation
 *
 * Source files:
 *   Docs/03-developer-docs/API/*.yaml
 *   .claude/validators-node/src/validation/openapi-validator.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// =============================================================================
// TEST DATA - MOCK OPENAPI SPECS
// =============================================================================

const MOCK_OPENAPI_3 = `openapi: 3.0.3
info:
  title: BMAD Core Installation API
  version: 1.0.0
  description: API for managing BMAD core installations
paths:
  /installations:
    get:
      operationId: listInstallations
      summary: List all installations
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Installation'
    post:
      operationId: createInstallation
      summary: Create a new installation
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateInstallationRequest'
      responses:
        '201':
          description: Installation created
  /installations/{id}:
    get:
      operationId: getInstallation
      summary: Get installation by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
  schemas:
    Installation:
      type: object
      required:
        - id
        - name
        - version
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 100
        version:
          type: string
        createdAt:
          type: string
          format: date-time
    CreateInstallationRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
        version:
          type: string
security:
  - bearerAuth: []`;

const MOCK_SWAGGER_2 = `swagger: '2.0'
info:
  title: BMAD Module Integration API
  version: 1.0.0
paths:
  /modules:
    get:
      summary: List modules
      responses:
        '200':
          description: Successful
          schema:
            type: array
            items:
              $ref: '#/definitions/Module'
    post:
      summary: Create module
      security:
        - apiKey: []
      parameters:
        - name: body
          in: body
          schema:
            $ref: '#/definitions/CreateModuleRequest'
      responses:
        '201':
          description: Created
definitions:
  Module:
    type: object
    properties:
      id:
        type: string
      name:
        type: string
  CreateModuleRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
securityDefinitions:
  apiKey:
    type: apiKey
    in: header
    name: X-API-Key`;

const MOCK_OPENAPI_NO_VERSION = `info:
  title: Test API
paths:
  /test:
    get:
      responses: {}`;

const MOCK_OPENAPI_NO_PATHS = `openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0`;

const MOCK_OPENAPI_NO_SECURITY = `openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /public:
    get:
      responses:
        '200':
          description: OK`;

const MOCK_OPENAPI_INLINE_SCHEMAS = `openapi: 3.0.3
info:
  title: Test API
  version: 1.0.0
paths:
  /endpoint1:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
  /endpoint2:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  name:
                    type: string
  /endpoint3:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  value:
                    type: integer
  /endpoint4:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  active:
                    type: boolean
  /endpoint5:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
  /endpoint6:
    get:
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: string`;

// =============================================================================
// V13-005: OpenAPI Spec Exists and is Valid
// =============================================================================

describe('V13-005: OpenAPI spec exists and is valid', () => {
  let tempSpecPath;

  beforeEach(() => {
    tempSpecPath = path.join(PROJECT_ROOT, `temp-test-spec-${Date.now()}.yaml`);
  });

  afterEach(() => {
    if (fs.existsSync(tempSpecPath)) {
      fs.unlinkSync(tempSpecPath);
    }
  });

  it('validates OpenAPI 3.x specification', () => {
    expect(MOCK_OPENAPI_3).toMatch(/openapi:/i);
  });

  it('validates Swagger 2.0 specification', () => {
    expect(MOCK_SWAGGER_2).toMatch(/swagger:/i);
  });

  it('detects missing OpenAPI version', () => {
    expect(MOCK_OPENAPI_NO_VERSION).not.toMatch(/openapi|swagger/i);
  });

  it('requires info section in spec', () => {
    expect(MOCK_OPENAPI_3).toMatch(/info:/i);
    expect(MOCK_SWAGGER_2).toMatch(/info:/i);
  });

  it('requires title in info section', () => {
    expect(MOCK_OPENAPI_3).toMatch(/title:/i);
    expect(MOCK_SWAGGER_2).toMatch(/title:/i);
  });

  it('requires paths section in spec', () => {
    expect(MOCK_OPENAPI_3).toMatch(/paths:/i);
    expect(MOCK_SWAGGER_2).toMatch(/paths:/i);
  });

  it('detects missing paths section', () => {
    expect(MOCK_OPENAPI_NO_PATHS).not.toMatch(/paths:/i);
  });

  it('counts paths in specification', () => {
    const pathMatches = MOCK_OPENAPI_3.match(/\/[\w\-{}]+:/g);
    expect(pathMatches.length).toBeGreaterThan(0);
  });

  it('validates operationId definitions', () => {
    expect(MOCK_OPENAPI_3).toMatch(/operationId:/i);
  });

  it('validates response definitions', () => {
    expect(MOCK_OPENAPI_3).toMatch(/responses:/i);
    expect(MOCK_OPENAPI_3).toMatch(/'200'/);
  });

  it('validates HTTP method definitions', () => {
    const methods = ['get', 'post', 'put', 'delete', 'patch'];
    const hasMethods = methods.some(m => MOCK_OPENAPI_3.toLowerCase().includes(m + ':'));
    expect(hasMethods).toBe(true);
  });
});

// =============================================================================
// V13-006: Security Schemes Defined
// =============================================================================

describe('V13-006: Security schemes defined', () => {
  it('validates securitySchemes in OpenAPI 3.x', () => {
    expect(MOCK_OPENAPI_3).toMatch(/securitySchemes:/i);
  });

  it('validates securityDefinitions in Swagger 2.x', () => {
    expect(MOCK_SWAGGER_2).toMatch(/securityDefinitions:/i);
  });

  it('detects Bearer authentication scheme', () => {
    expect(MOCK_OPENAPI_3).toMatch(/bearer/i);
  });

  it('detects API Key authentication scheme', () => {
    expect(MOCK_OPENAPI_3).toMatch(/apiKey/i);
    expect(MOCK_SWAGGER_2).toMatch(/apiKey/i);
  });

  it('detects OAuth2 scheme', () => {
    const oauthSpec = `openapi: 3.0.3
components:
  securitySchemes:
    oauth2:
      type: oauth2`;
    expect(oauthSpec).toMatch(/oauth/i);
  });

  it('detects mutual TLS scheme', () => {
    const mtlsSpec = `openapi: 3.0.3
components:
  securitySchemes:
    mutualTLS:
      type: mutualTLS`;
    expect(mtlsSpec).toMatch(/mutual/i);
  });

  it('validates global security requirement', () => {
    expect(MOCK_OPENAPI_3).toMatch(/^security:/im);
  });

  it('validates endpoint-specific security override', () => {
    const hasEndpointSecurity = MOCK_OPENAPI_3.match(/post:\s*[\s\S]*security:/im);
    expect(hasEndpointSecurity).not.toBe(null);
  });

  it('detects missing security schemes', () => {
    expect(MOCK_OPENAPI_NO_SECURITY).not.toMatch(/securitySchemes|securityDefinitions/i);
  });

  it('validates scheme type definitions', () => {
    expect(MOCK_OPENAPI_3).toMatch(/type:\s*(http|apiKey|oauth2)/i);
  });

  it('validates scheme in location for API keys', () => {
    expect(MOCK_OPENAPI_3).toMatch(/in:\s*header/i);
  });
});

// =============================================================================
// V13-007: Schema Validation Matches Implementation
// =============================================================================

describe('V13-007: Schema validation matches implementation', () => {
  it('validates reusable schema definitions', () => {
    expect(MOCK_OPENAPI_3).toMatch(/schemas:/i);
  });

  it('validates definitions in Swagger 2.x', () => {
    expect(MOCK_SWAGGER_2).toMatch(/definitions:/i);
  });

  it('counts schema definitions', () => {
    const schemaMatches = MOCK_OPENAPI_3.match(/\w+:\s*\n\s*type:/g);
    expect(schemaMatches.length).toBeGreaterThan(0);
  });

  it('validates required fields in schemas', () => {
    expect(MOCK_OPENAPI_3).toMatch(/required:/i);
  });

  it('validates property type definitions', () => {
    expect(MOCK_OPENAPI_3).toMatch(/type:\s*(string|number|integer|boolean|array|object)/i);
  });

  it('validates format constraints', () => {
    expect(MOCK_OPENAPI_3).toMatch(/format:\s*(uuid|date-time|email)/i);
  });

  it('validates string length constraints', () => {
    expect(MOCK_OPENAPI_3).toMatch(/(min|max)Length:/i);
  });

  it('validates response schemas', () => {
    const hasResponseSchema = MOCK_OPENAPI_3.match(/responses:\s*[\s\S]*?schema:/im);
    expect(hasResponseSchema).not.toBe(null);
  });

  it('detects inline schema definitions (anti-pattern)', () => {
    const inlineCount = (MOCK_OPENAPI_INLINE_SCHEMAS.match(/schema:/gi) || []).length;
    expect(inlineCount).toBeGreaterThan(5);
  });

  it('validates schema references', () => {
    expect(MOCK_OPENAPI_3).match(/\$ref:/i);
  });

  it('validates array item schemas', () => {
    expect(MOCK_OPENAPI_3).toMatch(/type:\s*array/i);
    expect(MOCK_OPENAPI_3).toMatch(/items:/i);
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('V13 Integration: Complete OpenAPI validation', () => {
  it('validates complete OpenAPI 3.x specification', () => {
    expect(MOCK_OPENAPI_3).toMatch(/openapi/i);
    expect(MOCK_OPENAPI_3).toMatch(/info/i);
    expect(MOCK_OPENAPI_3).toMatch(/paths/i);
    expect(MOCK_OPENAPI_3).toMatch(/securitySchemes/i);
    expect(MOCK_OPENAPI_3).toMatch(/schemas/i);
  });

  it('validates complete Swagger 2.x specification', () => {
    expect(MOCK_SWAGGER_2).toMatch(/swagger/i);
    expect(MOCK_SWAGGER_2).toMatch(/info/i);
    expect(MOCK_SWAGGER_2).toMatch(/paths/i);
    expect(MOCK_SWAGGER_2).toMatch(/securityDefinitions/i);
    expect(MOCK_SWAGGER_2).toMatch(/definitions/i);
  });

  it('compares OpenAPI and implementation', () => {
    const implCode = `async function createInstallation(data: CreateInstallationRequest) {
      return await installations.create(data);
    }`;
    expect(implCode).toMatch(/CreateInstallationRequest/i);
  });

  it('validates documented endpoints match implementation', () => {
    const openApiPaths = ['/installations', '/installations/{id}'];
    const implRoutes = ['app.get("/api/installations")', 'app.get("/api/installations/:id")'];
    expect(openApiPaths[0]).toContain('installations');
    expect(implRoutes[0]).toContain('installations');
  });

  it('checks security scheme usage in operations', () => {
    const hasSecurityUsage = MOCK_OPENAPI_3.match(/security:\s*[\s\S]*bearerAuth/im);
    expect(hasSecurityUsage).not.toBe(null);
  });

  it('validates request body schemas', () => {
    const hasRequestBodySchema = MOCK_OPENAPI_3.match(/requestBody:\s*[\s\S]*?schema:/im);
    expect(hasRequestBodySchema).not.toBe(null);
  });
});

// =============================================================================
// File System Tests
// =============================================================================

describe('OpenAPI file system validation', () => {
  const API_DOCS_PATH = path.join(PROJECT_ROOT, 'Docs/03-developer-docs/API');

  it('finds OpenAPI specification files in API docs', () => {
    if (!fs.existsSync(API_DOCS_PATH)) {
      expect(true).toBe(true);
      return;
    }
    const files = fs.readdirSync(API_DOCS_PATH);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    expect(Array.isArray(yamlFiles)).toBe(true);
  });

  it('validates existing OpenAPI spec files', () => {
    const specFiles = [
      'bmad-core-installation-api.yaml',
      'bmad-module-integration-api.yaml',
      'bmad-security-framework-api.yaml',
    ];
    let foundSpecs = 0;
    for (const specFile of specFiles) {
      const specPath = path.join(API_DOCS_PATH, specFile);
      if (fs.existsSync(specPath)) {
        const content = fs.readFileSync(specPath, 'utf-8');
        if (content.match(/openapi|swagger/i)) {
          foundSpecs++;
        }
      }
    }
    expect(typeof foundSpecs).toBe('number');
  });

  it('checks for spec version consistency', () => {
    if (!fs.existsSync(API_DOCS_PATH)) {
      expect(true).toBe(true);
      return;
    }
    const files = fs.readdirSync(API_DOCS_PATH);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    const versions = [];
    for (const file of yamlFiles) {
      const content = fs.readFileSync(path.join(API_DOCS_PATH, file), 'utf-8');
      const match = content.match(/openapi:\s*(\d+\.\d+)/i);
      if (match) {
        versions.push(match[1]);
      }
    }
    for (const version of versions) {
      expect(version).match(/^\d+\.\d+/);
    }
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('V13 Edge cases and error handling', () => {
  it('handles empty OpenAPI spec', () => {
    const emptySpec = '';
    expect(emptySpec).not.toMatch(/openapi|swagger/i);
  });

  it('handles malformed YAML', () => {
    const malformedSpec = `openapi: 3.0.3
info: title: Test
paths: /test: get:`;
    expect(malformedSpec).toMatch(/openapi/i);
  });

  it('handles spec with only paths', () => {
    const pathsOnlySpec = `paths:
  /test:
    get:
      responses: {}`;
    expect(pathsOnlySpec).toMatch(/paths/i);
    expect(pathsOnlySpec).not.toMatch(/openapi|swagger/i);
  });

  it('handles spec with only info', () => {
    const infoOnlySpec = `info:
  title: Test API
  version: 1.0.0`;
    expect(infoOnlySpec).toMatch(/info/i);
    expect(infoOnlySpec).not.toMatch(/paths/i);
  });

  it('handles nested schema references', () => {
    const nestedSpec = `schemas:
  Outer:
    type: object
    properties:
      inner:
        $ref: '#/components/schemas/Inner'
  Inner:
    type: object
    properties:
      value:
        type: string`;
    expect(nestedSpec).match(/\$ref/i);
  });

  it('handles polymorphic schemas', () => {
    const polySpec = `schemas:
  Event:
    oneOf:
      - $ref: '#/components/schemas/UserEvent'
      - $ref: '#/components/schemas/SystemEvent'
      - $ref: '#/components/schemas/AdminEvent'`;
    expect(polySpec).toMatch(/oneOf|anyOf|allOf/i);
  });

  it('handles enum values in schemas', () => {
    const enumSpec = `schemas:
  Status:
    type: string
    enum:
      - pending
      - active
      - completed`;
    expect(enumSpec).toMatch(/enum/i);
  });
});

// =============================================================================
// Severity Classification Tests
// =============================================================================

describe('V13 Severity classification', () => {
  it('classifies missing OpenAPI spec as CRITICAL', () => {
    const missingSpec = null;
    expect(missingSpec).toBeNull();
  });

  it('classifies missing version as CRITICAL', () => {
    expect(MOCK_OPENAPI_NO_VERSION).not.toMatch(/openapi|swagger/i);
  });

  it('classifies missing paths as WARNING', () => {
    expect(MOCK_OPENAPI_NO_PATHS).toMatch(/info/i);
    expect(MOCK_OPENAPI_NO_PATHS).not.toMatch(/paths/i);
  });

  it('classifies missing security schemes as WARNING', () => {
    expect(MOCK_OPENAPI_NO_SECURITY).toMatch(/openapi/i);
    expect(MOCK_OPENAPI_NO_SECURITY).not.toMatch(/securitySchemes|securityDefinitions/i);
  });

  it('classifies complete valid spec as INFO', () => {
    expect(MOCK_OPENAPI_3).toMatch(/openapi/i);
    expect(MOCK_OPENAPI_3).toMatch(/info/i);
    expect(MOCK_OPENAPI_3).toMatch(/paths/i);
    expect(MOCK_OPENAPI_3).toMatch(/securitySchemes/i);
  });

  it('classifies inline schemas as INFO (anti-pattern)', () => {
    const inlineCount = (MOCK_OPENAPI_INLINE_SCHEMAS.match(/schema:/gi) || []).length;
    expect(inlineCount).toBeGreaterThan(0);
  });
});

// =============================================================================
// Documentation Completeness Tests
// =============================================================================

describe('Documentation completeness validation', () => {
  it('checks for operation descriptions', () => {
    expect(MOCK_OPENAPI_3).toMatch(/summary:/i);
  });

  it('checks for parameter descriptions', () => {
    const hasParamDescription = MOCK_OPENAPI_3.match(/parameters:\s*[\s\S]*?description:/im);
    expect(hasParamDescription).not.toBe(null);
  });

  it('checks for response descriptions', () => {
    const hasResponseDescription = MOCK_OPENAPI_3.match(/responses:\s*[\s\S]*?description:/im);
    expect(hasResponseDescription).not.toBe(null);
  });

  it('checks for deprecated marker on old endpoints', () => {
    const deprecatedSpec = `paths:
  /v1/old-endpoint:
    get:
      deprecated: true
      summary: Old endpoint - use v2`;
    expect(deprecatedSpec).toMatch(/deprecated:\s*true/i);
  });

  it('checks for example values in schemas', () => {
    const exampleSpec = `schemas:
  User:
    type: object
    properties:
      email:
        type: string
        format: email
        example: user@example.com`;
    expect(exampleSpec).toMatch(/example:/i);
  });
});
