/**
 * Agent Profile Page
 * Story 3.3: Agent Profile View
 * Tasks 1, 9: Create Agent Profile Page route and Navigation Elements
 *
 * Route: /agents/[agentId]
 * Displays full agent profile with details, expertise, use cases, workflows, and related agents
 * Supports both agentId (legacy) and slug-based routing
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAgentById, getAgentsByTeam } from '@/lib/data/agents-data';
import { getAgentProfile, getAgentBySlug } from '@/lib/data/agent-profiles';
import { getTeamById } from '@/lib/data/teams-data';
import { ProfileHeader } from '@/components/agents/profile/profile-header';
import { ProfileDetails } from '@/components/agents/profile/profile-details';
import { RelatedAgents } from '@/components/agents/profile/related-agents';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentPageProps {
  params: {
    agentId: string;
  };
}

/**
 * Generate static params for all agents
 * Enables static generation of agent profile pages
 */
export async function generateStaticParams() {
  const agents = getAgentsByTeam('intel')
    .concat(getAgentsByTeam('security'))
    .concat(getAgentsByTeam('strategic'))
    .concat(getAgentsByTeam('legal'))
    .concat(getAgentsByTeam('bmm'))
    .concat(getAgentsByTeam('bmgd'))
    .concat(getAgentsByTeam('cis'))
    .concat(getAgentsByTeam('bmb'));

  return agents.map((agent) => ({
    agentId: agent.id,
  }));
}

export default function AgentPage({ params }: AgentPageProps) {
  // Try to find agent by slug first, then by ID
  const slugMatch = getAgentBySlug(params.agentId);
  const agent = slugMatch
    ? getAgentById(slugMatch.agentId)
    : getAgentById(params.agentId);

  if (!agent) {
    notFound();
  }

  // Get extended profile data
  const profileData = getAgentProfile(agent.id);

  // Merge agent base data with extended profile
  const extendedAgent = {
    ...agent,
    ...profileData
  };

  // Get team information
  const team = getTeamById(agent.team);

  // Get related agents from the same team
  const relatedAgentIds = profileData?.relatedAgents || [];
  const relatedAgents = relatedAgentIds
    .map((id) => getAgentById(id))
    .filter((a): a is Exclude<typeof a, undefined> => a !== undefined);

  // Fallback to team-based related agents if no explicit related agents
  const fallbackRelatedAgents = relatedAgentIds.length === 0
    ? getAgentsByTeam(agent.team)
        .filter((a) => a.id !== agent.id)
        .slice(0, 5)
    : [];

  const allRelatedAgents = relatedAgents.length > 0 ? relatedAgents : fallbackRelatedAgents;

  // Handlers for conversation/workflow actions
  // TODO: Integrate with actual conversation and workflow execution systems
  const handleStartConversation = (agentId: string) => {
    // In a real implementation, this would initiate a conversation session
    // For now, the ProfileHeader's "Start Conversation" button is visual only
  };

  const handleStartWorkflow = (workflowId: string) => {
    // In a real implementation, this would start the workflow execution
    // For now, workflows are accessed through the workflow selection interface
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      {/* TODO: Refactor to use a reusable Breadcrumb component */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link
          href="/agents"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="size-4" />
          Agents
        </Link>
        {team && (
          <>
            <ChevronRight className="size-4" />
            <Link
              href={`/teams/${team.id}`}
              className="hover:text-foreground transition-colors"
            >
              {team.displayName}
            </Link>
          </>
        )}
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">{agent.displayName}</span>
      </nav>

      {/* Two-column layout: Header (left) + Details (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Header */}
        <div className="lg:col-span-1">
          <ProfileHeader
            agent={extendedAgent}
            team={team}
            onStartConversation={handleStartConversation}
          />
        </div>

        {/* Right Column: Profile Details */}
        <div className="lg:col-span-2">
          <ProfileDetails
            agent={extendedAgent}
            onStartWorkflow={handleStartWorkflow}
          />
        </div>
      </div>

      {/* Related Agents Section */}
      {allRelatedAgents.length > 0 && (
        <RelatedAgents
          relatedAgents={allRelatedAgents}
          team={team}
          teamLinkHref={team ? `/teams/${team.id}` : undefined}
          maxDisplay={5}
        />
      )}
    </div>
  );
}

/**
 * Generate metadata for the agent profile page
 */
export async function generateMetadata({ params }: AgentPageProps) {
  const slugMatch = getAgentBySlug(params.agentId);
  const agent = slugMatch
    ? getAgentById(slugMatch.agentId)
    : getAgentById(params.agentId);

  if (!agent) {
    return {
      title: 'Agent Not Found'
    };
  }

  return {
    title: `${agent.displayName} - ${agent.title}`,
    description: agent.description,
  };
}
