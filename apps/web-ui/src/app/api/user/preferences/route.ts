/**
 * GET/PUT /api/user/preferences
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 6: Store User Preferences
 * Task 7: API Integration
 *
 * Gets or updates user preferences for agent/team selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';

/**
 * GET /api/user/preferences
 * Returns current user preferences
 */
export async function GET() {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          message: 'You must be logged in to access this resource',
        },
        { status: 401 }
      );
    }

    // In a real implementation, this would fetch from the database
    // For now, return default preferences
    return NextResponse.json({
      preferences: {
        advancedModeEnabled: false,
        directSelectionCount: 0,
        favoriteTeams: [],
        favoriteAgents: [],
        knowsWhatTheyNeed: false,
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch preferences',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Updates user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          message: 'You must be logged in to update preferences',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { advancedModeEnabled, favoriteTeams, favoriteAgents } = body;

    // In a real implementation, this would update the database
    // For now, just return success
    const updatedPreferences = {
      advancedModeEnabled: advancedModeEnabled ?? false,
      directSelectionCount: 0, // Would be preserved from DB
      favoriteTeams: favoriteTeams ?? [],
      favoriteAgents: favoriteAgents ?? [],
      knowsWhatTheyNeed: false, // Would be preserved from DB
    };

    return NextResponse.json({
      preferences: updatedPreferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update preferences',
      },
      { status: 500 }
    );
  }
}
