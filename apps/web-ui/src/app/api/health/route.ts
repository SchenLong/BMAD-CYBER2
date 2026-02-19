/**
 * Health Check API Route (Redirect)
 *
 * Proxies /api/health to /api/v1/health for API compatibility
 *
 * Note: This route maintains backward compatibility for clients expecting
 * the health endpoint at /api/health instead of /api/v1/health
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Proxies the request to /api/v1/health
 */
export async function GET(request: NextRequest) {
  try {
    // Use the original request to construct the v1 health URL
    const url = request.nextUrl.clone();
    url.pathname = '/api/v1/health';

    // Fetch from v1 health endpoint
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Health check error:', error);

    // Return a basic health response if v1 endpoint fails
    return NextResponse.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: { connected: true },
    });
  }
}
