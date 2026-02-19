/**
 * Incident Phase Transition API
 * Story 6.6: Incident Response Workspace
 *
 * POST /api/projects/:id/incident/phase - Transition incident phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const PhaseTransitionSchema = z.object({
  phase: z.enum(['identification', 'containment', 'eradication', 'recovery', 'closed']),
  notes: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/projects/:id/incident/phase
 * Transition incident to a new phase with audit logging
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const body = await req.json();
    const validated = PhaseTransitionSchema.parse(body);

    // TODO: Implement actual phase transition with:
    // 1. Validate transition is allowed
    // 2. Record in phase history
    // 3. Audit log the transition
    // 4. Broadcast to team via SSE
    // 5. Update project phase

    const transition = {
      from: 'containment', // TODO: Get current phase
      to: validated.phase,
      timestamp: new Date(),
      userId: 'user-1', // TODO: Get from session
      userName: 'Current User', // TODO: Get from session
      notes: validated.notes,
    };

    return NextResponse.json({
      success: true,
      transition,
      message: `Phase transitioned to ${validated.phase}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Error transitioning phase:', error);
    return NextResponse.json(
      { error: 'Failed to transition phase' },
      { status: 500 }
    );
  }
}
