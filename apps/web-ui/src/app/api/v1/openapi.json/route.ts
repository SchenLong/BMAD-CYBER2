/**
 * OpenAPI Spec Route
 * Story 8.4: API Documentation
 * Task 9: OpenAPI/Swagger Integration
 *
 * Serves the OpenAPI 3.0 specification at /api/v1/openapi.json
 */

import { NextResponse } from 'next/server';
import { generateOpenAPISpec } from '@/lib/openapi/spec';
import { headers } from 'next/headers';

/**
 * Allowed origins for CORS
 * In production, this should be configured via environment variables
 */
const ALLOWED_ORIGINS = [
  'http://localhost:42001',
  'http://localhost:42002',
  process.env.NEXT_PUBLIC_APP_URL || '',
].filter(Boolean);

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * GET /api/v1/openapi.json
 * Returns the OpenAPI 3.0 specification for BMAD API
 */
export async function GET() {
  const spec = generateOpenAPISpec();

  // Get origin from request headers
  const headersList = headers();
  const origin = headersList.get('origin');

  // Set CORS headers with origin validation
  const response = NextResponse.json(spec, {
    headers: {
      ...(isAllowedOrigin(origin) && {
        'Access-Control-Allow-Origin': origin,
      }),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });

  return response;
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  const headersList = headers();
  const origin = headersList.get('origin');

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...(isAllowedOrigin(origin) && {
        'Access-Control-Allow-Origin': origin,
      }),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
