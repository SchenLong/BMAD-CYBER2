/**
 * Incident Timeline API
 * Story 6.6: Incident Response Workspace
 *
 * GET /api/projects/:id/incident/timeline - Get timeline events
 * POST /api/projects/:id/incident/timeline - Add timeline event
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const TimelineEventSchema = z.object({
  type: z.enum([
    'detection',
    'analysis',
    'containment_action',
    'eradication_action',
    'recovery_action',
    'phase_change',
    'evidence_added',
    'note',
    'external_update',
  ]),
  message: z.string().min(1).max(5000),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  details: z.record(z.string(), z.any()).optional(),
  attachmentIds: z.array(z.string()).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/:id/incident/timeline
 * Get timeline events for an incident
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const eventType = searchParams.get('type');

    // TODO: Implement actual database query
    // For now, return mock timeline events

    const mockEvents = [
      {
        id: '1',
        incidentId: params.id,
        type: 'detection' as const,
        timestamp: new Date(Date.now() - 7200000),
        userId: 'user-1',
        userName: 'SOC Analyst',
        message: 'Initial ransomware detection via EDR alerts',
        severity: 'critical' as const,
        details: {
          source: 'EDR',
          alertId: 'ALT-12345',
        },
      },
      {
        id: '2',
        incidentId: params.id,
        type: 'containment_action' as const,
        timestamp: new Date(Date.now() - 3600000),
        userId: 'user-2',
        userName: 'Incident Commander',
        message: 'Isolated affected systems from network',
        severity: 'high' as const,
        details: {
          systemsIsolated: 12,
          remainingAtRisk: 3,
        },
      },
      {
        id: '3',
        incidentId: params.id,
        type: 'note' as const,
        timestamp: new Date(Date.now() - 1800000),
        userId: 'user-3',
        userName: 'Forensic Analyst',
        message: 'Memory capture completed on primary server',
        details: {
          serverName: 'SRV-001',
          captureSize: '32GB',
        },
      },
    ];

    return NextResponse.json({
      events: mockEvents,
      total: mockEvents.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/:id/incident/timeline
 * Add a new timeline event
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const body = await req.json();
    const validated = TimelineEventSchema.parse(body);

    // TODO: Implement actual database insert
    // For now, return success

    const newEvent = {
      id: `evt-${Date.now()}`,
      incidentId: params.id,
      type: validated.type,
      message: validated.message,
      severity: validated.severity,
      details: validated.details,
      attachmentIds: validated.attachmentIds,
      timestamp: new Date(),
      userId: 'user-1', // TODO: Get from session
      userName: 'Current User', // TODO: Get from session
    };

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Timeline event added',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error adding timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to add timeline event' },
      { status: 500 }
    );
  }
}
