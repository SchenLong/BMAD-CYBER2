/**
 * OpenAPI Types
 * Story 8.4: API Documentation
 * Task 9: OpenAPI/Swagger Integration
 *
 * Type definitions for OpenAPI 3.0 specification
 */

/**
 * OpenAPI 3.0 Specification Document
 */
export interface OpenAPIDocument {
  openapi: string;
  info: OpenAPIInfo;
  servers: OpenAPIServer[];
  paths: OpenAPIPaths;
  components?: OpenAPIComponents;
  tags?: OpenAPITag[];
  externalDocs?: OpenAPIExternalDocumentation;
}

/**
 * OpenAPI Info Object
 */
export interface OpenAPIInfo {
  title: string;
  description?: string;
  version: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
  termsOfService?: string;
}

/**
 * OpenAPI Contact Object
 */
export interface OpenAPIContact {
  name?: string;
  url?: string;
  email?: string;
}

/**
 * OpenAPI License Object
 */
export interface OpenAPILicense {
  name: string;
  url?: string;
}

/**
 * OpenAPI Server Object
 */
export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIServerVariable>;
}

/**
 * OpenAPI Server Variable Object
 */
export interface OpenAPIServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

/**
 * OpenAPI Paths Object
 */
export interface OpenAPIPaths {
  [path: string]: OpenAPIPathItem;
}

/**
 * OpenAPI Path Item Object
 */
export interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  put?: OpenAPIOperation;
  post?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  trace?: OpenAPIOperation;
  parameters?: OpenAPIParameter[];
  summary?: string;
  description?: string;
}

/**
 * OpenAPI Operation Object
 */
export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: OpenAPIResponses;
  callbacks?: Record<string, OpenAPICallback>;
  deprecated?: boolean;
  security?: OpenAPISecurityRequirement[];
  servers?: OpenAPIServer[];
}

/**
 * OpenAPI External Documentation Object
 */
export interface OpenAPIExternalDocumentation {
  description?: string;
  url: string;
}

/**
 * OpenAPI Parameter Object
 */
export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema: OpenAPISchema;
  example?: unknown;
  examples?: Record<string, OpenAPIExample>;
}

/**
 * OpenAPI Schema Object
 */
export interface OpenAPISchema {
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: unknown[];
  type?: string | string[];
  allOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
  oneOf?: OpenAPISchema[];
  not?: OpenAPISchema;
  items?: OpenAPISchema;
  properties?: Record<string, OpenAPISchema>;
  additionalProperties?: OpenAPISchema | boolean;
  discriminator?: OpenAPIDiscriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: OpenAPIXML;
  externalDocs?: OpenAPIExternalDocumentation;
  example?: unknown;
  $ref?: string;
  nullable?: boolean; // OpenAPI 3.0 nullable property
  status?: string; // For response status codes
}

/**
 * OpenAPI XML Object
 */
export interface OpenAPIXML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

/**
 * OpenAPI Discriminator Object
 */
export interface OpenAPIDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

/**
 * OpenAPI Request Body Object
 */
export interface OpenAPIRequestBody {
  description?: string;
  content: Record<string, OpenAPIMediaType>;
  required?: boolean;
}

/**
 * OpenAPI Media Type Object
 */
export interface OpenAPIMediaType {
  schema?: OpenAPISchema;
  example?: unknown;
  examples?: Record<string, OpenAPIExample>;
  encoding?: Record<string, OpenAPIEncoding>;
}

/**
 * OpenAPI Example Object
 */
export interface OpenAPIExample {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}

/**
 * OpenAPI Encoding Object
 */
export interface OpenAPIEncoding {
  contentType?: string;
  headers?: Record<string, OpenAPIHeader>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

/**
 * OpenAPI Responses Object
 */
export interface OpenAPIResponses {
  [code: string]: OpenAPIResponse;
}

/**
 * OpenAPI Response Object
 */
export interface OpenAPIResponse {
  description: string;
  headers?: Record<string, OpenAPIHeader>;
  content?: Record<string, OpenAPIMediaType>;
  links?: Record<string, OpenAPILink>;
}

/**
 * OpenAPI Header Object
 */
export interface OpenAPIHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema: OpenAPISchema;
  example?: unknown;
  examples?: Record<string, OpenAPIExample>;
}

/**
 * OpenAPI Link Object
 */
export interface OpenAPILink {
  operationId?: string;
  operationRef?: string;
  parameters?: Record<string, unknown>;
  requestBody?: unknown;
  description?: string;
  server?: OpenAPIServer;
}

/**
 * OpenAPI Callback Object
 */
export interface OpenAPICallback {
  [expression: string]: OpenAPIPathItem;
}

/**
 * OpenAPI Security Requirement Object
 */
export interface OpenAPISecurityRequirement {
  [name: string]: string[];
}

/**
 * OpenAPI Components Object
 */
export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchema>;
  responses?: Record<string, OpenAPIResponse>;
  parameters?: Record<string, OpenAPIParameter>;
  examples?: Record<string, OpenAPIExample>;
  requestBodies?: Record<string, OpenAPIRequestBody>;
  headers?: Record<string, OpenAPIHeader>;
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
  links?: Record<string, OpenAPILink>;
  callbacks?: Record<string, OpenAPICallback>;
}

/**
 * OpenAPI Security Scheme Object
 */
export interface OpenAPISecurityScheme {
  type: string;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OpenAPIOAuthFlows;
  openIdConnectUrl?: string;
  $ref?: string;
}

/**
 * OpenAPI OAuth Flows Object
 */
export interface OpenAPIOAuthFlows {
  implicit?: OpenAPIOAuthFlow;
  password?: OpenAPIOAuthFlow;
  clientCredentials?: OpenAPIOAuthFlow;
  authorizationCode?: OpenAPIOAuthFlow;
}

/**
 * OpenAPI OAuth Flow Object
 */
export interface OpenAPIOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

/**
 * OpenAPI Tag Object
 */
export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocumentation;
}

/**
 * HTTP Method Types
 */
export type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace';

/**
 * Rate Limit Configuration for API Documentation
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

/**
 * Endpoint Documentation Metadata
 */
export interface EndpointDoc {
  method: HTTPMethod;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  authenticated: boolean;
  rateLimit?: RateLimitConfig;
  parameters?: EndpointParameter[];
  requestBody?: EndpointRequestBody;
  responses: EndpointResponse[];
  codeExamples: CodeExample[];
}

/**
 * Endpoint Parameter
 */
export interface EndpointParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  default?: string | number;
}

/**
 * Request Body Documentation
 */
export interface EndpointRequestBody {
  contentType: string;
  schema: unknown;
  required: boolean;
  description: string;
  example: unknown;
}

/**
 * Response Documentation
 */
export interface EndpointResponse {
  status: number;
  description: string;
  example?: unknown;
}

/**
 * Code Example
 */
export interface CodeExample {
  language: 'javascript' | 'python' | 'curl' | 'typescript';
  label: string;
  code: string;
}
