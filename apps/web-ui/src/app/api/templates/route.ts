/**
 * Templates API Route
 * Epic 7: Enterprise Templates
 * Story 7.4: Custom Template Builder
 *
 * GET    /api/templates - List user's templates
 * POST   /api/templates - Create a new custom template (Enterprise only)
 *
 * Security:
 * - Authentication required for all operations
 * - TEMPLATE_CUSTOMIZE permission required for creating custom templates (Enterprise/SUPERADMIN/ADMIN)
 * - Organization scoping: Users can only access templates from their organization
 * - Templates marked as isPublic are shared within the organization, not globally
 */

import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/middleware/authorization';
import { Permission } from '@/lib/auth/permissions';
import { z } from 'zod';

/**
 * Validation schema for creating a custom template
 */
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
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
  ).min(1, 'Template must have at least one section'),
  sectionOrder: z.array(z.string()).min(1),
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
  }).default({
    headerColor: '#1e40af',
    font: 'inter',
  }),
  settings: z.object({
    onePage: z.boolean().optional(),
    includeToc: z.boolean().optional(),
    includePageNumbers: z.boolean().optional(),
  }).default({}),
  isPublic: z.boolean().default(false),
});

/**
 * GET /api/templates
 * List user's templates with organization scoping
 *
 * Organization scoping rules:
 * - Users can always see their own templates
 * - If includeShared is true, users see templates shared within their organization
 */
export async function GET(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeShared = searchParams.get('includeShared') === 'true';

    // Build where clause with organization scoping
    const where: any = {
      userId: session.user.id,
    };

    // If includeShared and user has an organization, include organization-shared templates
    if (includeShared && session.organizationId) {
      where.OR = [
        { userId: session.user.id }, // Own templates
        {
          AND: [
            { organizationId: session.organizationId }, // Same organization
            { isPublic: true }, // Shared within organization
            { userId: { not: session.user.id } }, // Not own templates
          ],
        },
      ];
    }

    // Get templates
    const templates = await prisma.customTemplate.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
        branding: true,
        settings: true,
        isPublic: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sections: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new custom template (Enterprise feature)
 *
 * Organization scoping:
 * - Templates are automatically associated with the user's organization
 * - Shared templates are visible to all organization members
 */
export async function POST(request: Request) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check for template customization permission (Enterprise only)
    const authCheck = await checkPermission(Permission.TEMPLATE_CUSTOMIZE);

    if (!authCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Custom template creation requires an Enterprise plan',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = createTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check for duplicate section names
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

    // Create template with sections and organization association
    const template = await prisma.customTemplate.create({
      data: {
        userId: session.user.id,
        organizationId: session.organizationId, // Associate with user's organization
        name: data.name,
        description: data.description,
        sectionOrder: JSON.stringify(data.sectionOrder),
        branding: JSON.stringify(data.branding),
        settings: JSON.stringify(data.settings),
        isPublic: data.isPublic,
        sections: {
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
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
      },
    });

    // Create initial version
    await prisma.customTemplateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        name: template.name,
        description: template.description,
        snapshot: JSON.stringify({
          ...template,
          sections: template.sections,
        }),
        changedBy: session.user.id,
        changeNotes: 'Initial version',
      },
    });

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

    return NextResponse.json({ template: formattedTemplate }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
