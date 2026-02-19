/**
 * Team Data Configuration
 * Story 2.4: Progressive Disclosure - Layer 3
 *
 * Static team configuration with colors, descriptions, and capabilities
 */

import { Team } from '@/lib/types/agents';

/**
 * Team configuration data
 * Based on the BMAD framework teams and agent counts from agent-manifest.csv
 */
export const TEAMS: Team[] = [
  {
    id: 'intel',
    name: 'Intel Team',
    displayName: 'Intel Team',
    icon: 'search',
    description: [
      'OSINT investigations',
      'Threat intelligence',
      'Corporate research',
      'Digital forensics',
      'Social media analysis'
    ],
    agentCount: 11,
    capabilities: ['osint', 'threat-intel', 'research', 'forensics', 'humint', 'sigint'],
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500'
  },
  {
    id: 'security',
    name: 'Security Team',
    displayName: 'Security Team',
    icon: 'shield',
    description: [
      'Security assessments',
      'Penetration testing',
      'Vulnerability scans',
      'Incident response',
      'Compliance auditing'
    ],
    agentCount: 15,
    capabilities: ['assessment', 'pentest', 'vulnerability', 'incident-response', 'compliance'],
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500'
  },
  {
    id: 'strategic',
    name: 'Strategic Team',
    displayName: 'Strategic Team',
    icon: 'chess',
    description: [
      'Strategic planning',
      'Executive advisory',
      'Crisis response',
      'Board communications',
      'Policy analysis'
    ],
    agentCount: 14,
    capabilities: ['planning', 'advisory', 'crisis', 'communications', 'policy'],
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500'
  },
  {
    id: 'legal',
    name: 'Legal Team',
    displayName: 'Legal Team',
    icon: 'scale',
    description: [
      'Contract drafting',
      'Multi-jurisdictional law',
      'Corporate governance',
      'Tax planning',
      'Dispute resolution'
    ],
    agentCount: 13,
    capabilities: ['contracts', 'compliance', 'governance', 'tax', 'litigation'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500'
  },
  {
    id: 'bmm',
    name: 'BMM Team',
    displayName: 'Business Management',
    icon: 'briefcase',
    description: [
      'Requirements analysis',
      'Technical architecture',
      'Project management',
      'Quality assurance',
      'User experience'
    ],
    agentCount: 12,
    capabilities: ['analysis', 'architecture', 'management', 'qa', 'ux'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500'
  },
  {
    id: 'bmgd',
    name: 'BMGD Team',
    displayName: 'Game Development',
    icon: 'gamepad-2',
    description: [
      'Game architecture',
      'Game design',
      'Game development',
      'QA testing',
      'Project management'
    ],
    agentCount: 6,
    capabilities: ['architecture', 'design', 'development', 'qa', 'management'],
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500'
  },
  {
    id: 'cis',
    name: 'CIS Team',
    displayName: 'Creativity & Innovation',
    icon: 'lightbulb',
    description: [
      'Brainstorming',
      'Problem solving',
      'Design thinking',
      'Innovation strategy',
      'Presentation design'
    ],
    agentCount: 5,
    capabilities: ['brainstorming', 'problem-solving', 'design-thinking', 'innovation', 'presentation'],
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500'
  },
  {
    id: 'bmb',
    name: 'BMB Team',
    displayName: 'Builder',
    icon: 'hammer',
    description: [
      'Agent building',
      'Module creation',
      'Workflow construction',
      'System architecture'
    ],
    agentCount: 3,
    capabilities: ['agent-building', 'module-creation', 'workflow-building', 'architecture'],
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500'
  }
];

/**
 * Get team by ID
 */
export function getTeamById(teamId: string): Team | undefined {
  return TEAMS.find(team => team.id === teamId);
}

/**
 * Get teams for Layer 3 (primary teams first)
 */
export function getPrimaryTeams(): Team[] {
  return TEAMS.filter(team =>
    ['intel', 'security', 'strategic'].includes(team.id)
  );
}

/**
 * Get all teams sorted by agent count
 */
export function getAllTeams(): Team[] {
  return [...TEAMS].sort((a, b) => b.agentCount - a.agentCount);
}
