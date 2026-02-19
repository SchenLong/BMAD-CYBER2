/**
 * Health Check Endpoint
 * Story 8.1: RESTful API Implementation
 * Task 2: Public Endpoints - Health Check
 *
 * GET /api/v1/health - Public health check endpoint
 * Returns service status and version information
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

/**
 * Health check response data
 */
interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'up' | 'down';
    cache?: 'up' | 'down';
  };
}

/**
 * GET /api/v1/health
 * Public health check endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  let dbStatus: 'up' | 'down' = 'up';

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Health check: Database connection failed', error);
    dbStatus = 'down';
  }

  // Determine overall status
  const overallStatus: HealthData['status'] =
    dbStatus === 'up' ? 'healthy' : 'unhealthy';

  const healthData: HealthData = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
    },
  };

  // Calculate response time
  const responseTime = Date.now() - startTime;

  return apiSuccess(healthData, 200);
}

/**
 * OPTIONS /api/v1/health
 * Return allowed methods for CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
