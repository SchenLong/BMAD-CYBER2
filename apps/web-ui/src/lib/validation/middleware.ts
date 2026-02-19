/**
 * Validation Middleware
 * Story 9.6: Input Validation Layer
 *
 * Middleware factories for validating request body, query, and params.
 */

import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { badRequest, createInvalidJSONResponse, validateRequestBody } from './errors';

/**
 * Attach validated data to a request (using a WeakMap for type safety)
 */
const validatedDataStore = new WeakMap<NextRequest, unknown>();

/**
 * Store validated data on request for downstream handlers
 */
export function setValidatedData<T>(request: NextRequest, key: string, data: T): void {
  const existing = validatedDataStore.get(request) || {};
  validatedDataStore.set(request, { ...existing, [key]: data });
}

/**
 * Get validated data from request
 */
export function getValidatedData<T>(request: NextRequest, key: string): T | undefined {
  const data = validatedDataStore.get(request);
  return data?.[key] as T | undefined;
}

/**
 * Validate request body against a Zod schema
 *
 * Usage in API routes:
 * ```ts
 * import { validateBody } from '@/lib/validation/middleware'
 * import { createProjectSchema } from '@/lib/validation/domain-schemas'
 *
 * export async function POST(req: NextRequest) {
 *   const result = await validateBody(req, createProjectSchema)
 *   if (!result.success) return result.response
 *
 *   const data = result.data // Fully typed
 *   // ...proceed with handler
 * }
 * ```
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: ReturnType<typeof badRequest> }
> {
  const result = await validateRequestBody(request, schema);
  if (!result.success) {
    return result as { success: false; response: ReturnType<typeof badRequest> };
  }

  // Store validated data for later use
  setValidatedData(request, 'body', result.data);

  return {
    success: true,
    data: result.data as z.infer<T>,
  };
}

/**
 * Validate request query parameters against a Zod schema
 *
 * @param request - Next.js Request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error response
 */
export function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: ReturnType<typeof badRequest> } {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const result = schema.safeParse(queryParams);
    if (!result.success) {
      return {
        success: false,
        response: badRequest(result.error.issues),
      };
    }

    // Store validated data for later use
    setValidatedData(request, 'query', result.data);

    return {
      success: true,
      data: result.data as z.infer<T>,
    };
  } catch {
    return {
      success: false,
      response: createInvalidJSONResponse(),
    };
  }
}

/**
 * Validate route parameters against a Zod schema
 *
 * @param params - Route parameters object
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error response
 */
export function validateParams<T extends z.ZodType>(
  params: Record<string, string | string[] | undefined>,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: ReturnType<typeof badRequest> } {
  const result = schema.safeParse(params);
  if (!result.success) {
    return {
      success: false,
      response: badRequest(result.error.issues),
    };
  }

  return {
    success: true,
    data: result.data as z.infer<T>,
  };
}

/**
 * Create a middleware that validates the request body
 *
 * Usage:
 * ```ts
 * import { withBodyValidation } from '@/lib/validation/middleware'
 * import { createProjectSchema } from '@/lib/validation/domain-schemas'
 *
 * export const POST = withBodyValidation(createProjectSchema, async (req, data) => {
 *   // data is fully typed
 *   return Response.json({ success: true })
 * })
 * ```
 */
export function withBodyValidation<T extends z.ZodType>(
  schema: T,
  handler: (req: NextRequest, data: z.infer<T>) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    const result = await validateBody(req, schema);
    if (!result.success) {
      return Response.json(result.response.body, { status: result.response.statusCode });
    }
    return handler(req, result.data);
  };
}

/**
 * Create a middleware that validates query parameters
 *
 * Usage:
 * ```ts
 * import { withQueryValidation } from '@/lib/validation/middleware'
 * import { searchQuerySchema } from '@/lib/validation/schemas'
 *
 * export const GET = withQueryValidation(searchQuerySchema, async (req, query) => {
 *   // query is fully typed
 *   return Response.json({ results: [] })
 * })
 * ```
 */
export function withQueryValidation<T extends z.ZodType>(
  schema: T,
  handler: (req: NextRequest, data: z.infer<T>) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    const result = validateQuery(req, schema);
    if (!result.success) {
      return Response.json(result.response.body, { status: result.response.statusCode });
    }
    return handler(req, result.data);
  };
}

/**
 * Validate both body and query parameters
 */
export async function validateBodyAndQuery<
  TBody extends z.ZodType,
  TQuery extends z.ZodType
>(
  request: NextRequest,
  bodySchema: TBody,
  querySchema: TQuery
): Promise<
  | { success: true; body: z.infer<TBody>; query: z.infer<TQuery> }
  | { success: false; response: ReturnType<typeof badRequest> }
> {
  // Validate body
  const bodyResult = await validateBody(request, bodySchema);
  if (!bodyResult.success) {
    return bodyResult as { success: false; response: ReturnType<typeof badRequest> };
  }

  // Validate query
  const queryResult = validateQuery(request, querySchema);
  if (!queryResult.success) {
    return queryResult;
  }

  return {
    success: true,
    body: bodyResult.data,
    query: queryResult.data,
  };
}

/**
 * Create a middleware that validates body and query
 */
export function withBodyAndQueryValidation<
  TBody extends z.ZodType,
  TQuery extends z.ZodType
>(
  bodySchema: TBody,
  querySchema: TQuery,
  handler: (
    req: NextRequest,
    body: z.infer<TBody>,
    query: z.infer<TQuery>
  ) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    const result = await validateBodyAndQuery(req, bodySchema, querySchema);
    if (!result.success) {
      return Response.json(result.response.body, { status: result.response.statusCode });
    }
    return handler(req, result.body, result.query);
  };
}
