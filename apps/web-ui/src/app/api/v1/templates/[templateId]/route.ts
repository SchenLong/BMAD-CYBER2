/**
 * Template Details API - v1
 * Story 8.1: RESTful API Implementation
 * Task 6: Template Endpoints
 *
 * GET /api/v1/templates/:templateId - Get template details
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
} from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getBuiltinTemplates } from '@/lib/templates';

/**
 * GET /api/v1/templates/:templateId
 * Get detailed template information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const templateId = params.templateId;

  // Check if it's a built-in template
  const builtinTemplates = getBuiltinTemplates();
  const builtinTemplate = builtinTemplates.find(t => t.id === templateId);

  if (builtinTemplate) {
    return apiSuccess({
      id: builtinTemplate.id,
      name: builtinTemplate.name,
      description: builtinTemplate.description,
      category: 'built-in',
      isBuiltIn: true,
      sections: builtinTemplate.sections,
    });
  }

  // Check for custom template (requires auth)
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized('Authentication required for custom templates');
  }

  const customTemplate = await prisma.customTemplate.findUnique({
    where: { id: templateId },
    include: {
      sections: {
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!customTemplate) {
    return apiNotFound('Template');
  }

  // Check access permissions
  const hasAccess =
    customTemplate.userId === session.user.id ||
    customTemplate.isPublic ||
    customTemplate.organizationId === session.organizationId;

  if (!hasAccess) {
    return apiNotFound('Template');
  }

  return apiSuccess({
    id: customTemplate.id,
    name: customTemplate.name,
    description: customTemplate.description,
    category: customTemplate.organizationId ? 'enterprise' : 'custom',
    isBuiltIn: false,
    version: customTemplate.version,
    sectionOrder: customTemplate.sectionOrder,
    branding: customTemplate.branding,
    settings: customTemplate.settings,
    sections: customTemplate.sections,
    createdAt: customTemplate.createdAt,
    updatedAt: customTemplate.updatedAt,
  });
}
