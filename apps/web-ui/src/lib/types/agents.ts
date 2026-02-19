/**
 * Agent and Team Types
 * Story 2.4: Progressive Disclosure - Layer 3
 *
 * Type definitions for teams, agents, and related data structures
 */

/**
 * Team identifier type
 */
export type TeamId = 'intel' | 'security' | 'strategic' | 'legal' | 'bmm' | 'bmgd' | 'cis' | 'bmb';

/**
 * Agent status
 */
export type AgentStatus = 'available' | 'busy' | 'offline';

/**
 * Team interface
 */
export interface Team {
  id: TeamId;
  name: string;
  displayName: string;
  icon: string;
  description: string[];
  agentCount: number;
  capabilities: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Agent interface
 */
export interface Agent {
  id: string;
  name: string;
  displayName: string;
  title: string;
  icon: string;
  team: TeamId;
  expertise: string[];
  description: string;
  principles?: string[];
  communicationStyle?: string;
  status?: AgentStatus;
}

/**
 * User preferences for agent/team selection
 */
export interface AgentUserPreferences {
  advancedModeEnabled: boolean;
  directSelectionCount: number;
  favoriteTeams: TeamId[];
  favoriteAgents: string[];
  lastSelectedTeam?: TeamId;
  lastSelectedAgent?: string;
  knowsWhatTheyNeed: boolean; // Track if user prefers direct selection
}

/**
 * Search/filter options for agent roster
 */
export interface AgentFilterOptions {
  search: string;
  expertise?: string;
  status?: AgentStatus;
  team?: TeamId;
}

/**
 * Workflow complexity levels
 */
export type WorkflowComplexity = 'beginner' | 'intermediate' | 'advanced';

/**
 * Workflow summary for agent profiles
 * Story 3.3: Agent Profile View
 */
export interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  complexity: WorkflowComplexity;
  team: TeamId;
}

/**
 * Extended agent profile with detailed information
 * Story 3.3: Agent Profile View
 */
export interface AgentProfile extends Agent {
  fullDescription?: string;
  useCases?: string[];
  capabilities?: string[];
  limitations?: string[];
  relatedAgents?: string[]; // Agent IDs
  workflows?: WorkflowSummary[];
  slug?: string; // URL-friendly identifier
}
