/**
 * CLI Commands List API Endpoint
 * Story 5.1: Command Whitelist System - Task 6
 *
 * GET /api/cli/commands
 *
 * Returns list of whitelisted commands that the authenticated user
 * has permission to execute. Results are filtered by user role and
 * include command metadata (timeout, description, required roles).
 *
 * Response is cached for 5 minutes to reduce load.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/../auth';
import { UserRole } from '@prisma/client';
import {
  getCommandsForRole,
  type CommandDefinition,
  type CommandListEntry,
} from '@/lib/cli-bridge';

/**
 * Cache duration in seconds
 */
const CACHE_TTL = 300; // 5 minutes

/**
 * Convert CommandDefinition to CommandListEntry for API response
 */
function toListEntry(command: CommandDefinition): CommandListEntry {
  return {
    id: command.id,
    description: command.description,
    category: command.category,
    timeout: command.timeout,
    example: command.example,
    hasPermission: true, // Already filtered by role
  };
}

/**
 * GET /api/cli/commands
 *
 * Returns whitelisted commands filtered by user role
 *
 * Query Parameters:
 * - category: Optional filter by category
 * - includeDisabled: Include disabled commands (admin only)
 *
 * Response:
 * {
 *   "commands": CommandListEntry[],
 *   "categories": string[],
 *   "total": number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    const userRole = session.user.role as UserRole;
    const { searchParams } = request.nextUrl;

    // Get query parameters
    const categoryFilter = searchParams.get('category');
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    // Get commands for user's role
    let commands = getCommandsForRole(userRole);

    // Only admins can see disabled commands
    if (includeDisabled && (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN)) {
      const allCommands = await import('@/lib/cli-bridge').then((m) => m.getEnabledCommands());
      commands = allCommands;
    }

    // Filter by category if specified
    if (categoryFilter) {
      commands = commands.filter((cmd) => cmd.category === categoryFilter);
    }

    // Convert to list entries (excludes sensitive data)
    const commandEntries: CommandListEntry[] = commands.map(toListEntry);

    // Get unique categories
    const categories = Array.from(
      new Set(commandEntries.map((cmd) => cmd.category))
    ).sort();

    // Build response with cache headers
    const response = NextResponse.json({
      commands: commandEntries,
      categories,
      total: commandEntries.length,
      userRole,
    });

    // Set cache headers
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
    response.headers.set('CDN-Cache-Control', `public, max-age=${CACHE_TTL}`);
    response.headers.set('Vary', 'Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching CLI commands:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/cli/commands
 *
 * Returns allowed methods for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
