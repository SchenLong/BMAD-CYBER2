/**
 * GET /api/teams
 * Story 2.4: Progressive Disclosure - Layer 3
 * Task 7: API Integration
 *
 * Returns all teams with their metadata
 * Supports optional filtering for primary teams only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllTeams, getPrimaryTeams } from '@/lib/data/teams-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const primaryOnly = searchParams.get('primary') === 'true';

    const teams = primaryOnly ? getPrimaryTeams() : getAllTeams();

    return NextResponse.json({
      teams,
      count: teams.length,
    });
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch teams',
      },
      { status: 500 }
    );
  }
}
