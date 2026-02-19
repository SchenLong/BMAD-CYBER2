/**
 * Agents Roster Page (Redirect)
 *
 * Redirects /agents/roster to /agents (team selection)
 * The actual roster is available at /agents/roster/[teamId]
 */

import { redirect } from 'next/navigation';

export default function AgentsRosterPage() {
  redirect('/agents');
}
