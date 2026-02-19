/**
 * Template Detail API Route
 * Epic 7: Enterprise Templates
 * Story 7.4: Custom Template Builder
 *
 * GET    /api/templates/[templateId] - Get a specific template
 * PUT    /api/templates/[templateId] - Update a template
 * DELETE /api/templates/[templateId] - Delete a template
 *
 * Security:
 * - Organization scoping: Users can view templates from their organization
 * - Shared templates (isPublic: true) are visible to all organization members
 * - Only template owners can update/delete
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/middleware/authorization';
import { Permission } from '@/lib/auth/permissions';
import { z } from 'zod';

/**
 * Validation schema for updating a custom template
 */
const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['built-in', 'custom']),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      required: z.boolean().default(false),
      builtInType: z.string().optional(),
      fields: z.array(
        z.object({
          id: z.string(),
          label: z.string().min(1).max(100),
          type: z.enum(['text', 'textarea', 'number', 'date', 'list', 'code', 'rich-text']),
          required: z.boolean().default(false),
          defaultValue: z.union([z.string(), z.number(), z.array(z.string())]).optional(),
          validation: z.object({
            minLength: z.number().optional(),
            maxLength: z.number().optional(),
            pattern: z.string().optional(),
            min: z.number().optional(),
            max: z.number().optional(),
          }).optional(),
        })
      ).default([]),
    })
  ).min(1).optional(),
  sectionOrder: z.array(z.string()).min(1).optional(),
  branding: z.object({
    logoUrl: z.string().max(500).refine(
      (val) => !val || /^(\/uploads\/templates\/[a-zA-Z0-9/-]+\.(png|jpg|jpeg|svg)|https?:\/\/.+)$/.test(val),
      { message: 'Logo URL must be a valid upload path or external URL' }
    ).optional(),
    headerColor: z.regex(/^#[0-9A-Fa-f]{6}$/),
    font: z.enum(['inter', 'roboto', 'open-sans', 'lato']),
    coverImage: z.string().max(500).refine(
      (val) => !val || /^(\/uploads\/templates\/[a-zA-Z0-9/-]+\.(png|jpg|jpeg)|https?:\/\/.+)$/.test(val),
      { message: 'Cover image URL must be a valid upload path or external URL' }
    ).optional(),
    footerText: z.string().max(500).optional(),
  }).optional(),
  settings: z.object({
    onePage: z.boolean().optional(),
    includeToc: z.boolean().optional(),
    includePageNumbers: z.boolean().optional(),
  }).optional(),
  isPublic: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ templateId: string }>;
};

/**
 * GET /api/templates/[templateId]
 * Get a specific template with organization scoping
 *
 * Organization scoping rules:
 * - Users can view their own templates
 * - Users can view templates shared within their organization (isPublic: true + same organizationId)
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { templateId } = await context.params;

    // Build organization-scoped where clause
    const whereClause: any = {
      id: templateId,
      OR: [
        { userId: session.user.id }, // Own templates
      ],
    };

    // If user has an organization, also include organization-shared templates
    if (session.organizationId) {
      whereClause.OR.push({
        AND: [
          { organizationId: session.organizationId }, // Same organization
          { isPublic: true }, // Shared within organization
        ],
      });
    }

    // Get template with authorization check
    const template = await prisma.customTemplate.findFirst({
      where: whereClause,
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedTemplate = {
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      sectionOrder: JSON.parse(template.sectionOrder),
      branding: JSON.parse(template.branding),
      settings: JSON.parse(template.settings),
      isPublic: template.isPublic,
      organizationId: template.organizationId,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      user: template.user,
      sections: template.sections.map((section) => ({
        id: section.id,
        type: section.type.toLowerCase() as 'built-in' | 'custom',
        name: section.name,
        description: section.description,
        required: section.required,
        position: section.position,
        builtInType: section.builtInType,
        fields: JSON.parse(section.fieldDefinitions),
      })),
    };

    return NextResponse.json({ template: formattedTemplate });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[templateId]
 * Update a template (owner only)
 *
 * Organization scoping:
 * - Only the template owner can update
 * - Updates maintain the organization association
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { templateId } = await context.params;

    // Check if user owns the template
    const existingTemplate = await prisma.customTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only edit your own templates' },
        { status: 403 }
      );
    }

    // Check for template customization permission
    const authCheck = await checkPermission(Permission.TEMPLATE_CUSTOMIZE);

    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Template editing requires an Enterprise plan' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check for duplicate section names if updating sections
    if (data.sections) {
      const sectionNames = new Set<string>();
      for (const section of data.sections) {
        if (sectionNames.has(section.name)) {
          return NextResponse.json(
            { error: `Section "${section.name}" is duplicated` },
            { status: 400 }
          );
        }
        sectionNames.add(section.name);
      }
    }

    // Increment version
    const newVersion = existingTemplate.version + 1;

    // Update template (maintains organization association)
    const updatedTemplate = await prisma.customTemplate.update({
      where: { id: templateId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sectionOrder && { sectionOrder: JSON.stringify(data.sectionOrder) }),
        ...(data.branding && { branding: JSON.stringify(data.branding) }),
        ...(data.settings && { settings: JSON.stringify(data.settings) }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        version: newVersion,
        // Update sections if provided
        ...(data.sections && {
          sections: {
            deleteMany: {},
            create: data.sections.map((section, idx) => ({
              type: section.type === 'built-in' ? 'BUILT_IN' : 'CUSTOM',
              name: section.name,
              description: section.description,
              required: section.required,
              position: idx,
              builtInType: section.builtInType,
              fieldDefinitions: JSON.stringify(section.fields),
            })),
          },
        }),
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
      },
    });

    // Create version history entry
    await prisma.customTemplateVersion.create({
      data: {
        templateId: templateId,
        version: newVersion,
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        snapshot: JSON.stringify({
          ...updatedTemplate,
          sections: updatedTemplate.sections,
        }),
        changedBy: session.user.id,
        changeNotes: body.changeNotes || `Updated to version ${newVersion}`,
      },
    });

    // Format response
    const formattedTemplate = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      version: updatedTemplate.version,
      sectionOrder: JSON.parse(updatedTemplate.sectionOrder),
      branding: JSON.parse(updatedTemplate.branding),
      settings: JSON.parse(updatedTemplate.settings),
      isPublic: updatedTemplate.isPublic,
      organizationId: updatedTemplate.organizationId,
      createdAt: updatedTemplate.createdAt,
      updatedAt: updatedTemplate.updatedAt,
      sections: updatedTemplate.sections.map((section) => ({
        id: section.id,
        type: section.type.toLowerCase() as 'built-in' | 'custom',
        name: section.name,
        description: section.description,
        required: section.required,
        position: section.position,
        builtInType: section.builtInType,
        fields: JSON.parse(section.fieldDefinitions),
      })),
    };

    return NextResponse.json({ template: formattedTemplate });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[templateId]
 * Delete a template (owner only)
 *
 * Organization scoping:
 * - Only the template owner can delete
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { templateId } = await context.params;

    // Check if user owns the template
    const template = await prisma.customTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You can only delete your own templates' },
        { status: 403 }
      );
    }

    // Check for template customization permission
    const authCheck = await checkPermission(Permission.TEMPLATE_CUSTOMIZE);

    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Template deletion requires an Enterprise plan' },
        { status: 403 }
      );
    }

    // Delete template (cascade will delete sections and versions)
    await prisma.customTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
