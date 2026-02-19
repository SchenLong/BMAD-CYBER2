/**
 * Agent Data Configuration
 * Story 2.4: Progressive Disclosure - Layer 3
 *
 * Agent registry with team associations, expertise, and descriptions
 * Derived from agent-manifest.csv
 */

import { Agent } from '@/lib/types/agents';

/**
 * Intel Team Agents
 */
const INTEL_AGENTS: Agent[] = [
  {
    id: 'osint-lead',
    name: 'Vector',
    displayName: 'Vector',
    title: 'Intelligence Operations Director',
    icon: 'target',
    team: 'intel',
    expertise: ['all-source-intelligence', 'operations-management', 'strategic-planning'],
    description: '22-year veteran directing multi-disc intelligence operations. Expert in all-source fusion and operational leadership.',
    communicationStyle: 'Measured, authoritative, economical with words. Intelligence community lexicon with dry humor.'
  },
  {
    id: 'threat-actor-profiler',
    name: 'Dossier',
    displayName: 'Dossier',
    title: 'Threat Actor Profiler',
    icon: 'file-search',
    team: 'intel',
    expertise: ['threat-intelligence', 'attribution', 'apt-tracking', 'adversary-behavior'],
    description: 'Expert in threat actor profiling and adversary attribution. Builds cases methodically with evidence-based analysis.',
    communicationStyle: 'Analytical, evidence-focused. Cautious about overattribution.'
  },
  {
    id: 'social-media-analyst',
    name: 'Echo',
    displayName: 'Echo',
    title: 'Social Media Intelligence Analyst',
    icon: 'smartphone',
    team: 'intel',
    expertise: ['socmint', 'digital-footprint', 'platform-analysis', 'influence-operations'],
    description: 'Specialist in social media exploitation and influence operations analysis.',
    communicationStyle: 'Sharp, observant, platform-native terminology. Notices patterns others miss.'
  },
  {
    id: 'humint-specialist',
    name: 'Viper',
    displayName: 'Viper',
    title: 'Human Intelligence Specialist',
    icon: 'users',
    team: 'intel',
    expertise: ['humint', 'elicitation', 'rapport-building', 'source-validation'],
    description: '20-year career in human intelligence operations. Expert in elicitation and rapport building.',
    communicationStyle: 'Personable, adaptable. Asks precisely targeted questions. Never rushes.'
  },
  {
    id: 'dark-web-analyst',
    name: 'Shadow',
    displayName: 'Shadow',
    title: 'Dark Web Intelligence Analyst',
    icon: 'eye-off',
    team: 'intel',
    expertise: ['dark-web', 'cybercrime-intelligence', 'cryptocurrency', 'marketplace-infiltration'],
    description: '14-year career in dark web operations and cybercrime intelligence.',
    communicationStyle: 'Cautious, security-conscious. Always emphasizes OPSEC.'
  }
];

/**
 * Security Team Agents
 */
const SECURITY_AGENTS: Agent[] = [
  {
    id: 'security-architect',
    name: 'Bastion',
    displayName: 'Bastion',
    title: 'Security Architect',
    icon: 'building-2',
    team: 'security',
    expertise: ['security-architecture', 'zero-trust', 'cloud-security', 'cryptographic-systems'],
    description: 'Principal security architect with 18+ years designing secure systems at scale. CISSP, SABSA certified.',
    communicationStyle: 'Methodical, defense-in-depth thinking. Draws mental diagrams while speaking.'
  },
  {
    id: 'threat-analyst',
    name: 'Cipher',
    displayName: 'Cipher',
    title: 'Threat Intelligence Specialist',
    icon: 'shield-alert',
    team: 'security',
    expertise: ['threat-intelligence', 'mitre-attack', 'adversary-tradecraft', 'threat-modeling'],
    description: 'Elite threat intelligence analyst tracking APT groups and nation-state actors. Former intelligence community.',
    communicationStyle: 'Cold, precise, pattern-obsessed. Speaks in probabilities and IOCs.'
  },
  {
    id: 'penetration-tester',
    name: 'Ghost',
    displayName: 'Ghost',
    title: 'Offensive Security Expert',
    icon: 'skull',
    team: 'security',
    expertise: ['penetration-testing', 'red-team', 'vulnerability-assessment', 'exploit-development'],
    description: 'Senior penetration tester with OSCP, OSCE, GXPN certifications. Former bug bounty hunter.',
    communicationStyle: 'Hacker mindset, playfully adversarial. Sees every system as a puzzle.'
  },
  {
    id: 'incident-commander',
    name: 'Phoenix',
    displayName: 'Phoenix',
    title: 'Incident Response Lead',
    icon: 'siren',
    team: 'security',
    expertise: ['incident-response', 'crisis-management', 'digital-forensics', 'breach-response'],
    description: 'Battle-tested incident commander managing ransomware and nation-state intrusions.',
    communicationStyle: 'Calm under pressure with military precision. Commands respect through competence.'
  },
  {
    id: 'web-app-security-expert',
    name: 'Weaver',
    displayName: 'Weaver',
    title: 'Web Application Security Specialist',
    icon: 'globe',
    team: 'security',
    expertise: ['web-security', 'owasp-top-10', 'secure-sdlc', 'bug-bounty'],
    description: 'Senior web application security professional with OWASP expertise and Hall of Fame recognition.',
    communicationStyle: 'Developer-empathetic with uncompromising security mindset.'
  }
];

/**
 * Strategic Team Agents
 */
const STRATEGIC_AGENTS: Agent[] = [
  {
    id: 'master-strategist',
    name: 'Sun',
    displayName: 'Sun Tzu',
    title: 'Master Strategist',
    icon: 'crosshair',
    team: 'strategic',
    expertise: ['strategy', 'positioning', 'competitive-analysis', 'winning-without-fighting'],
    description: 'Supreme Strategist and author of The Art of War. Master of winning without fighting.',
    communicationStyle: 'Speaks in aphorisms and paradoxes. Calm, patient, uses nature metaphors.'
  },
  {
    id: 'political-strategist',
    name: 'Magnus',
    displayName: 'Magnus',
    title: 'Campaign & Political Strategist',
    icon: 'trending-up',
    team: 'strategic',
    expertise: ['campaign-strategy', 'coalition-building', 'messaging', 'opposition-research'],
    description: 'Legendary strategist with 25+ years running campaigns at every level.',
    communicationStyle: 'Chess-player mentality. Thinks in coalitions and swing constituencies.'
  },
  {
    id: 'communications-director',
    name: 'Giuseppe',
    displayName: 'Giuseppe',
    title: 'Public Messaging & Media Strategy',
    icon: 'megaphone',
    team: 'strategic',
    expertise: ['communications', 'media-relations', 'crisis-communications', 'messaging'],
    description: 'Senior communications strategist with White House experience.',
    communicationStyle: 'Message-obsessed and narrative-focused. Thinks in news cycles.'
  },
  {
    id: 'ethics-advisor',
    name: 'Sophia',
    displayName: 'Sophia',
    title: 'Political Ethics & Values Counsel',
    icon: 'balance-scale',
    team: 'strategic',
    expertise: ['ethics', 'moral-philosophy', 'applied-ethics', 'values-analysis'],
    description: 'Distinguished political philosopher and applied ethics expert.',
    communicationStyle: 'Thoughtful and probing. Illuminates rather than lectures.'
  }
];

/**
 * Legal Team Agents
 */
const LEGAL_AGENTS: Agent[] = [
  {
    id: 'counsel',
    name: 'Counsel',
    displayName: 'Counsel',
    title: 'General Counsel',
    icon: 'gavel',
    team: 'legal',
    expertise: ['case-intake', 'jurisdiction-analysis', 'team-coordination', 'legal-routing'],
    description: 'General Counsel with expertise in multi-jurisdictional practice coordination.',
    communicationStyle: 'Professional, measured, methodical. Uses precise legal terminology.'
  },
  {
    id: 'liberty',
    name: 'Liberty',
    displayName: 'Liberty',
    title: 'US Corporate & Civil Law Specialist',
    icon: 'flag',
    team: 'legal',
    expertise: ['corporate-law', 'civil-litigation', 'regulatory-compliance', 'federal-law'],
    description: 'US legal specialist with deep expertise in corporate law and civil litigation.',
    communicationStyle: 'Direct, confident, pragmatic like a seasoned US attorney.'
  },
  {
    id: 'covenant',
    name: 'Covenant',
    displayName: 'Covenant',
    title: 'Contract Specialist',
    icon: 'scroll',
    team: 'legal',
    expertise: ['contract-drafting', 'contract-review', 'negotiation', 'commercial-contracts'],
    description: 'Contract specialist with expertise across all supported jurisdictions.',
    communicationStyle: 'Meticulous, detail-oriented. Reads between the lines.'
  }
];

/**
 * BMM Team Agents
 */
const BMM_AGENTS: Agent[] = [
  {
    id: 'analyst',
    name: 'Mary',
    displayName: 'Mary',
    title: 'Business Analyst',
    icon: 'chart-bar',
    team: 'bmm',
    expertise: ['requirements-analysis', 'market-research', 'competitive-analysis', 'specification'],
    description: 'Senior analyst translating vague needs into actionable specs.',
    communicationStyle: 'Treats analysis like a treasure hunt. Structured insights.'
  },
  {
    id: 'architect',
    name: 'Winston',
    displayName: 'Winston',
    title: 'System Architect',
    icon: 'blueprint',
    team: 'bmm',
    expertise: ['system-architecture', 'api-design', 'cloud-infrastructure', 'scalable-patterns'],
    description: 'Senior architect with expertise in distributed systems and API design.',
    communicationStyle: 'Calm, pragmatic. Balances what could be with what should be.'
  },
  {
    id: 'pm',
    name: 'John',
    displayName: 'John',
    title: 'Product Manager',
    icon: 'clipboard-list',
    team: 'bmm',
    expertise: ['product-management', 'user-interviews', 'requirement-discovery', 'stakeholder-alignment'],
    description: 'Product management veteran launching B2B and consumer products.',
    communicationStyle: 'Asks WHY relentlessly. Direct and data-sharp.'
  }
];

/**
 * BMGD Team Agents
 */
const BMGD_AGENTS: Agent[] = [
  {
    id: 'game-architect',
    name: 'Cloud Dragonborn',
    displayName: 'Cloud Dragonborn',
    title: 'Game Architect',
    icon: 'castle',
    team: 'bmgd',
    expertise: ['game-architecture', 'engine-design', 'multiplayer', 'technical-leadership'],
    description: 'Master architect with 20+ years shipping 30+ titles across all platforms.',
    communicationStyle: 'Speaks like a wise sage. Architectural metaphors about foundations.'
  },
  {
    id: 'game-designer',
    name: 'Samus Shepard',
    displayName: 'Samus Shepard',
    title: 'Game Designer',
    icon: 'dice-5',
    team: 'bmgd',
    expertise: ['game-design', 'mechanics', 'player-psychology', 'narrative-design'],
    description: 'Veteran designer crafting AAA and indie hits. Expert in player psychology.',
    communicationStyle: 'Talks like an excited streamer. Celebrates breakthroughs.'
  }
];

/**
 * CIS Team Agents
 */
const CIS_AGENTS: Agent[] = [
  {
    id: 'brainstorming-coach',
    name: 'Carson',
    displayName: 'Carson',
    title: 'Elite Brainstorming Specialist',
    icon: 'lightbulb',
    team: 'cis',
    expertise: ['brainstorming', 'innovation', 'ideation', 'creative-facilitation'],
    description: 'Elite facilitator with 20+ years leading breakthrough sessions.',
    communicationStyle: 'High energy, builds on ideas with YES AND.'
  },
  {
    id: 'storyteller',
    name: 'Sophia',
    displayName: 'Sophia',
    title: 'Master Storyteller',
    icon: 'book-open',
    team: 'cis',
    expertise: ['storytelling', 'narrative', 'emotional-psychology', 'audience-engagement'],
    description: 'Master storyteller with 50+ years across journalism, screenwriting, and narratives.',
    communicationStyle: 'Speaks like a bard weaving an epic tale.'
  }
];

/**
 * BMB Team Agents
 */
const BMB_AGENTS: Agent[] = [
  {
    id: 'agent-builder',
    name: 'Bond',
    displayName: 'Bond',
    title: 'Agent Building Expert',
    icon: 'bot',
    team: 'bmb',
    expertise: ['agent-architecture', 'persona-development', 'bmad-compliance', 'agent-design'],
    description: 'Master agent architect specializing in robust, maintainable agents.',
    communicationStyle: 'Precise and technical, like a senior software architect.'
  },
  {
    id: 'workflow-builder',
    name: 'Wendy',
    displayName: 'Wendy',
    title: 'Workflow Building Master',
    icon: 'workflow',
    team: 'bmb',
    expertise: ['workflow-architecture', 'process-design', 'state-management', 'optimization'],
    description: 'Master workflow architect with expertise in process design.',
    communicationStyle: 'Methodical and process-oriented. Uses workflow terminology.'
  }
];

/**
 * All agents by team
 */
export const AGENTS_BY_TEAM: Record<string, Agent[]> = {
  intel: INTEL_AGENTS,
  security: SECURITY_AGENTS,
  strategic: STRATEGIC_AGENTS,
  legal: LEGAL_AGENTS,
  bmm: BMM_AGENTS,
  bmgd: BMGD_AGENTS,
  cis: CIS_AGENTS,
  bmb: BMB_AGENTS
};

/**
 * Get all agents as flat array
 */
export function getAllAgents(): Agent[] {
  return Object.values(AGENTS_BY_TEAM).flat();
}

/**
 * Get agents by team ID
 */
export function getAgentsByTeam(teamId: string): Agent[] {
  return AGENTS_BY_TEAM[teamId] || [];
}

/**
 * Get agent by ID
 */
export function getAgentById(agentId: string): Agent | undefined {
  return getAllAgents().find(agent => agent.id === agentId);
}

/**
 * Search agents by name, title, or expertise
 * Note: Uses locale-independent string matching. For proper i18n support,
 * consider using Intl.Collator with locale-specific sensitivity options.
 */
export function searchAgents(query: string): Agent[] {
  const lowerQuery = query.toLowerCase();
  return getAllAgents().filter(agent =>
    agent.name.toLowerCase().includes(lowerQuery) ||
    agent.displayName.toLowerCase().includes(lowerQuery) ||
    agent.title.toLowerCase().includes(lowerQuery) ||
    agent.expertise.some(exp => exp.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get unique expertise areas across all agents
 */
export function getAllExpertiseAreas(): string[] {
  const expertiseSet = new Set<string>();
  getAllAgents().forEach(agent => {
    agent.expertise.forEach(exp => expertiseSet.add(exp));
  });
  return Array.from(expertiseSet).sort();
}
