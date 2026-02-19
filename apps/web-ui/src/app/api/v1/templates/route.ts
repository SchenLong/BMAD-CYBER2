/**
 * Templates API - v1
 * Story 8.1: RESTful API Implementation
 * Task 6: Template Endpoints
 *
 * GET /api/v1/templates - List available templates
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
} from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getBuiltinTemplates } from '@/lib/templates';

/**
 * GET /api/v1/templates
 * List all available templates (built-in and custom)
 */
export async function GET(request: NextRequest) {
  const session = await validateSession();
  const { searchParams } = new URL(request.url);

  const includeShared = searchParams.get('includeShared') === 'true';
  const category = searchParams.get('category');

  // Get built-in templates
  const builtinTemplates = getBuiltinTemplates();

  // Format built-in templates
  const formattedBuiltin = builtinTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    category: 'built-in' as const,
    isBuiltIn: true,
    sections: template.sections.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      required: s.required,
    })),
  }));

  // If no session, return only built-in templates
  if (!session) {
    return apiSuccess({
      templates: formattedBuiltin,
      count: formattedBuiltin.length,
      note: 'Login to see custom templates',
    });
  }

  // Get user's custom templates
  const customTemplates = await prisma.customTemplate.findMany({
    where: {
      userId: session.user.id,
      ...(includeShared && {
        OR: [
          { isPublic: true },
          { organizationId: session.organizationId || null },
        ],
      }),
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Format custom templates
  const formattedCustom = customTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.organizationId ? 'enterprise' : 'custom',
    isBuiltIn: false,
    version: template.version,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }));

  // Combine templates
  const allTemplates = [...formattedBuiltin, ...formattedCustom];

  // Filter by category if specified
  const filteredTemplates = category
    ? allTemplates.filter(t => t.category === category)
    : allTemplates;

  return apiSuccess({
    templates: filteredTemplates,
    count: filteredTemplates.length,
  });
}
