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
  try {
    const spec = generateOpenAPISpec();

    // Get origin from request headers
    const headersList = await headers();
    const origin = headersList.get('origin');

    // Build headers object
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    };

    // Only set Access-Control-Allow-Origin if the origin is allowed
    if (origin && isAllowedOrigin(origin)) {
      responseHeaders['Access-Control-Allow-Origin'] = origin;
    }

    const response = NextResponse.json(spec, {
      headers: responseHeaders,
    });

    return response;
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate OpenAPI specification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  const headersList = await headers();
  const origin = headersList.get('origin');

  const responseHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (origin && isAllowedOrigin(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
  }

  return new NextResponse(null, {
    status: 204,
    headers: responseHeaders,
  });
}
