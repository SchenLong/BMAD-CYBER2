/**
 * Incident Project API Routes
 * Story 6.6: Incident Response Workspace
 *
 * GET /api/projects/:id/incident - Get incident details
 * PATCH /api/projects/:id/incident - Update incident
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for incident updates
const UpdateIncidentSchema = z.object({
  phase: z.enum(['identification', 'containment', 'eradication', 'recovery', 'closed']).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  affectedSystems: z.number().min(0).optional(),
  containedSystems: z.number().min(0).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/:id/incident
 * Get incident project details
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;

    // TODO: Implement actual database lookup
    // For now, return mock data

    const mockIncident = {
      id: params.id,
      projectCode: `INC-${new Date().getFullYear()}-001`,
      name: 'Ransomware Response - ACME Corp',
      description: 'Active ransomware incident affecting critical systems',
      type: 'incident-response' as const,
      incidentId: `INC-${new Date().getFullYear()}-001`,
      severity: 'critical' as const,
      phase: 'containment' as const,
      affectedSystems: 15,
      containedSystems: 8,
      phaseHistory: [
        {
          from: 'identification' as const,
          to: 'containment' as const,
          timestamp: new Date(),
          userId: 'user-1',
          userName: 'Incident Commander',
          notes: 'Initial containment achieved',
        },
      ],
      ownerId: 'user-1',
      status: 'active' as const,
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(),
    };

    return NextResponse.json(mockIncident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/:id/incident
 * Update incident project
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const body = await req.json();
    const validated = UpdateIncidentSchema.parse(body);

    // TODO: Implement actual database update
    // For now, return success with updated data

    const updated = {
      ...validated,
      updatedAt: new Date(),
    };

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
