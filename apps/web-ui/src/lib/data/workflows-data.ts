/**
 * Workflow Data Configuration
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 *
 * Workflow registry with categories, teams, and execution metadata
 */

import { Workflow, WorkflowCategory, WorkflowCategoryGroup, WorkflowComplexity } from '@/lib/types/workflows';

/**
 * Intel Team Workflows
 * Note: File input types (when present in other workflows) are validated at the API boundary.
 * Client-side validation is intentionally deferred to allow flexible file handling.
 */
const INTEL_WORKFLOWS: Workflow[] = [
  {
    id: 'flash-assessment',
    name: 'flash-assessment',
    displayName: 'Flash Assessment',
    description: 'Rapid 15-minute OSINT assessment for quick intelligence gathering',
    category: 'intel',
    team: 'intel-team',
    requiredAgents: ['osint-lead', 'social-media-analyst'],
    estimatedDuration: 15,
    inputs: [
      { name: 'target', type: 'string', required: true, description: 'Target domain or URL' },
      { name: 'outputFormat', type: 'string', required: false, defaultValue: 'markdown', options: ['markdown', 'json'] }
    ],
    outputs: ['assessment_report'],
    tags: ['osint', 'quick', 'reconnaissance'],
    complexity: 'beginner',
    useCases: [
      'Quick reconnaissance of target domain',
      'Initial intelligence gathering',
      'Rapid assessment before deep dive'
    ]
  },
  {
    id: 'doppelganger-hunt',
    name: 'doppelganger-hunt',
    displayName: 'Doppelganger Hunt',
    description: 'Identify fake accounts and impersonators across social platforms',
    category: 'intel',
    team: 'intel-team',
    requiredAgents: ['social-media-analyst', 'dark-web-analyst'],
    estimatedDuration: 30,
    inputs: [
      { name: 'target', type: 'string', required: true, description: 'Target person or entity name' },
      { name: 'platforms', type: 'array', required: false, description: 'Social platforms to search' }
    ],
    outputs: ['impersonation_report'],
    tags: ['osint', 'social-media', 'impersonation'],
    complexity: 'intermediate',
    useCases: [
      'Detect brand impersonation',
      'Identify fake executive profiles',
      'Protect against social engineering'
    ]
  },
  {
    id: 'threat-constellation',
    name: 'threat-constellation',
    displayName: 'Threat Constellation',
    description: 'Map complete threat actor relationships and attack patterns',
    category: 'intel',
    team: 'intel-team',
    requiredAgents: ['threat-actor-profiler', 'osint-lead'],
    estimatedDuration: 45,
    inputs: [
      { name: 'threatActor', type: 'string', required: true, description: 'Threat actor identifier or APT group' },
      { name: 'depth', type: 'string', required: false, defaultValue: 'standard', options: ['basic', 'standard', 'comprehensive'] }
    ],
    outputs: ['threat_map', 'attribution_report'],
    tags: ['threat-intel', 'apt', 'attribution'],
    complexity: 'advanced',
    useCases: [
      'Understand threat actor relationships',
      'Map attack patterns to threat groups',
      'Comprehensive threat intelligence'
    ]
  },
  {
    id: 'campaign-planner',
    name: 'campaign-planner-org',
    displayName: 'Campaign Planner (Organization)',
    description: 'Comprehensive OSINT campaign planning for organizational targets',
    category: 'intel',
    team: 'intel-team',
    requiredAgents: ['osint-lead', 'threat-actor-profiler'],
    estimatedDuration: 60,
    inputs: [
      { name: 'organization', type: 'string', required: true, description: 'Target organization' },
      { name: 'objectives', type: 'array', required: true, description: 'Campaign objectives' }
    ],
    outputs: ['campaign_plan', 'intelligence_requirements'],
    tags: ['osint', 'planning', 'corporate'],
    complexity: 'advanced',
    useCases: [
      'Plan comprehensive OSINT campaigns',
      'Organize multi-target intelligence gathering',
      'Structure long-term surveillance operations'
    ]
  }
];

/**
 * Security Team Workflows
 */
const SECURITY_WORKFLOWS: Workflow[] = [
  {
    id: 'vulnerability-management',
    name: 'vulnerability-management',
    displayName: 'Vulnerability Management',
    description: 'Full lifecycle vulnerability assessment and tracking',
    category: 'security',
    team: 'cybersec-team',
    requiredAgents: ['penetration-tester', 'web-app-security-expert'],
    estimatedDuration: 90,
    inputs: [
      { name: 'target', type: 'string', required: true, description: 'Target system or application' },
      { name: 'scanType', type: 'string', required: false, defaultValue: 'full', options: ['quick', 'full', 'deep'] }
    ],
    outputs: ['vulnerability_report', 'remediation_plan'],
    tags: ['security', 'vulnerability', 'assessment'],
    complexity: 'intermediate',
    useCases: [
      'Identify security vulnerabilities',
      'Track remediation progress',
      'Pre-exploitation security assessment'
    ]
  },
  {
    id: 'threat-modeling',
    name: 'threat-modeling',
    displayName: 'Threat Modeling',
    description: 'STRIDE-based threat model for system design review',
    category: 'security',
    team: 'cybersec-team',
    requiredAgents: ['security-architect', 'threat-analyst'],
    estimatedDuration: 60,
    inputs: [
      { name: 'systemDescription', type: 'string', required: true, description: 'System architecture description' },
      { name: 'assets', type: 'array', required: true, description: 'Critical assets to protect' }
    ],
    outputs: ['threat_model', 'mitigation_strategies'],
    tags: ['security', 'threat-model', 'architecture'],
    complexity: 'intermediate',
    useCases: [
      'Design secure systems from the start',
      'Identify threats in architecture',
      'Create mitigation strategies'
    ]
  },
  {
    id: 'incident-response-playbook',
    name: 'incident-response-playbook',
    displayName: 'Incident Response Playbook',
    description: 'Coordinated multi-team incident response workflow',
    category: 'security',
    team: 'cybersec-team',
    requiredAgents: ['incident-commander', 'threat-analyst', 'penetration-tester'],
    estimatedDuration: 120,
    inputs: [
      { name: 'incidentType', type: 'string', required: true, description: 'Type of security incident' },
      { name: 'severity', type: 'string', required: true, options: ['low', 'medium', 'high', 'critical'] }
    ],
    outputs: ['incident_report', 'timeline', 'lessons_learned'],
    tags: ['incident-response', 'security', 'forensics'],
    complexity: 'advanced',
    useCases: [
      'Respond to active security incidents',
      'Contain and remediate breaches',
      'Post-incident analysis and prevention'
    ]
  },
  {
    id: 'security-architecture-review',
    name: 'security-architecture-review',
    displayName: 'Security Architecture Review',
    description: 'Comprehensive security architecture assessment',
    category: 'security',
    team: 'cybersec-team',
    requiredAgents: ['security-architect', 'web-app-security-expert'],
    estimatedDuration: 90,
    inputs: [
      { name: 'architectureDocs', type: 'string', required: true, description: 'Path to architecture documentation' },
      { name: 'scope', type: 'string', required: false, defaultValue: 'full' }
    ],
    outputs: ['security_assessment', 'recommendations'],
    tags: ['security', 'architecture', 'review'],
    complexity: 'advanced',
    useCases: [
      'Assess security architecture',
      'Review cloud infrastructure security',
      'Validate security controls'
    ]
  }
];

/**
 * Strategic Team Workflows
 */
const STRATEGIC_WORKFLOWS: Workflow[] = [
  {
    id: 'strategic-decision-workshop',
    name: 'strategic-decision-workshop',
    displayName: 'Strategic Decision Workshop',
    description: 'Multi-perspective strategic analysis for complex decisions',
    category: 'strategic',
    team: 'strategy-team',
    requiredAgents: ['master-strategist', 'political-strategist', 'ethics-advisor'],
    estimatedDuration: 45,
    inputs: [
      { name: 'decision', type: 'string', required: true, description: 'Decision to be made' },
      { name: 'context', type: 'string', required: true, description: 'Background context' }
    ],
    outputs: ['decision_analysis', 'recommendations'],
    tags: ['strategy', 'decision-making', 'analysis'],
    complexity: 'intermediate',
    useCases: [
      'Complex business decisions',
      'Multi-stakeholder alignment',
      'Strategic option evaluation'
    ]
  },
  {
    id: 'crisis-response-planning',
    name: 'crisis-response-planning',
    displayName: 'Crisis Response Planning',
    description: 'Develop crisis communication and response strategies',
    category: 'strategic',
    team: 'strategy-team',
    requiredAgents: ['communications-director', 'master-strategist'],
    estimatedDuration: 60,
    inputs: [
      { name: 'crisisScenario', type: 'string', required: true, description: 'Crisis scenario to plan for' },
      { name: 'stakeholders', type: 'array', required: true, description: 'Key stakeholders' }
    ],
    outputs: ['crisis_plan', 'messaging_matrix'],
    tags: ['crisis', 'communications', 'planning'],
    complexity: 'advanced',
    useCases: [
      'Prepare for potential crises',
      'Develop communication strategies',
      'Protect organizational reputation'
    ]
  },
  {
    id: 'board-presentation-prep',
    name: 'board-presentation-prep',
    displayName: 'Board Presentation Prep',
    description: 'Prepare compelling board presentations with strategic messaging',
    category: 'strategic',
    team: 'strategy-team',
    requiredAgents: ['communications-director', 'ethics-advisor'],
    estimatedDuration: 45,
    inputs: [
      { name: 'topic', type: 'string', required: true, description: 'Presentation topic' },
      { name: 'audience', type: 'string', required: true, description: 'Board composition and concerns' }
    ],
    outputs: ['presentation_deck', 'speaking_notes'],
    tags: ['board', 'presentation', 'strategy'],
    complexity: 'intermediate',
    useCases: [
      'Prepare for board meetings',
      'Communicate strategic initiatives',
      'Present to executive leadership'
    ]
  }
];

/**
 * Legal Team Workflows
 */
const LEGAL_WORKFLOWS: Workflow[] = [
  {
    id: 'contract-drafting',
    name: 'contract-drafting',
    displayName: 'Contract Drafting',
    description: 'Create jurisdiction-appropriate contracts',
    category: 'legal',
    team: 'legal-team',
    requiredAgents: ['counsel', 'covenant'],
    estimatedDuration: 60,
    inputs: [
      { name: 'contractType', type: 'string', required: true, description: 'Type of contract' },
      { name: 'jurisdiction', type: 'string', required: true, description: 'Governing jurisdiction' },
      { name: 'parties', type: 'array', required: true, description: 'Contracting parties' }
    ],
    outputs: ['contract_draft', 'clause_explanations'],
    tags: ['legal', 'contract', 'drafting'],
    complexity: 'intermediate',
    useCases: [
      'Draft new contracts',
      'Create jurisdiction-specific agreements',
      'Generate contract clauses'
    ]
  },
  {
    id: 'contract-review',
    name: 'contract-review',
    displayName: 'Comprehensive Contract Review',
    description: 'Full contract review with risk assessment and recommendations',
    category: 'legal',
    team: 'legal-team',
    requiredAgents: ['counsel', 'liberty'],
    estimatedDuration: 45,
    inputs: [
      { name: 'contractPath', type: 'string', required: true, description: 'Path to contract document' },
      { name: 'focusAreas', type: 'array', required: false, description: 'Specific clauses to review' }
    ],
    outputs: ['review_memo', 'risk_assessment', 'redlines'],
    tags: ['legal', 'contract', 'review'],
    complexity: 'intermediate',
    useCases: [
      'Review contracts before signing',
      'Identify legal risks',
      'Get contract redlining recommendations'
    ]
  },
  {
    id: 'corporate-formation',
    name: 'corporate-formation',
    displayName: 'Corporate Formation',
    description: 'Multi-jurisdictional corporate entity formation planning',
    category: 'legal',
    team: 'legal-team',
    requiredAgents: ['counsel', 'covenant', 'liberty'],
    estimatedDuration: 90,
    inputs: [
      { name: 'businessType', type: 'string', required: true, description: 'Type of business' },
      { name: 'jurisdictions', type: 'array', required: true, description: 'Target jurisdictions' }
    ],
    outputs: ['formation_plan', 'compliance_checklist'],
    tags: ['legal', 'corporate', 'formation'],
    complexity: 'advanced',
    useCases: [
      'Plan corporate entity formation',
      'Multi-jurisdictional setup',
      'Compliance planning'
    ]
  }
];

/**
 * BMM (Business Modeling) Team Workflows
 */
const BMM_WORKFLOWS: Workflow[] = [
  {
    id: 'create-prd',
    name: 'create-prd',
    displayName: 'Create PRD',
    description: 'Creates a comprehensive product requirements document',
    category: 'bmm',
    team: 'bmm',
    requiredAgents: ['analyst', 'pm'],
    estimatedDuration: 60,
    inputs: [
      { name: 'productConcept', type: 'string', required: true, description: 'Product concept description' },
      { name: 'targetMarket', type: 'string', required: true, description: 'Target market' }
    ],
    outputs: ['prd_document'],
    tags: ['product', 'requirements', 'planning'],
    complexity: 'beginner',
    useCases: [
      'Define product requirements',
      'Document product vision',
      'Create development roadmap'
    ]
  },
  {
    id: 'create-architecture',
    name: 'create-architecture',
    displayName: 'Create Architecture',
    description: 'Collaborative architecture design and documentation',
    category: 'bmm',
    team: 'bmm',
    requiredAgents: ['architect', 'analyst'],
    estimatedDuration: 75,
    inputs: [
      { name: 'requirements', type: 'string', required: true, description: 'Product or system requirements' },
      { name: 'constraints', type: 'array', required: false, description: 'Technical or business constraints' }
    ],
    outputs: ['architecture_doc', 'diagrams'],
    tags: ['architecture', 'design', 'technical'],
    complexity: 'intermediate',
    useCases: [
      'Design system architecture',
      'Plan technical implementation',
      'Create architecture diagrams'
    ]
  },
  {
    id: 'create-story',
    name: 'create-story',
    displayName: 'Create User Story',
    description: 'Create the next user story from backlog',
    category: 'bmm',
    team: 'bmm',
    requiredAgents: ['pm', 'analyst'],
    estimatedDuration: 30,
    inputs: [
      { name: 'epicId', type: 'string', required: true, description: 'Epic identifier' },
      { name: 'context', type: 'string', required: false, description: 'Additional context' }
    ],
    outputs: ['story_document'],
    tags: ['agile', 'story', 'planning'],
    complexity: 'beginner',
    useCases: [
      'Break down epics into stories',
      'Create user stories',
      'Plan development work'
    ]
  },
  {
    id: 'sprint-planning',
    name: 'sprint-planning',
    displayName: 'Sprint Planning',
    description: 'Generate and manage sprint plans with story selection',
    category: 'bmm',
    team: 'bmm',
    requiredAgents: ['pm', 'analyst', 'architect'],
    estimatedDuration: 60,
    inputs: [
      { name: 'velocity', type: 'number', required: true, description: 'Team velocity' },
      { name: 'capacity', type: 'number', required: true, description: 'Team capacity' }
    ],
    outputs: ['sprint_plan', 'story_assignments'],
    tags: ['agile', 'sprint', 'planning'],
    complexity: 'intermediate',
    useCases: [
      'Plan upcoming sprints',
      'Assign stories to team',
      'Estimate story points'
    ]
  },
  {
    id: 'dev-story',
    name: 'dev-story',
    displayName: 'Execute Story',
    description: 'Execute a story by implementing tasks/subtasks with testing',
    category: 'bmm',
    team: 'bmm',
    requiredAgents: ['architect'],
    estimatedDuration: 120,
    inputs: [
      { name: 'storyPath', type: 'string', required: true, description: 'Path to story file' }
    ],
    outputs: ['implementation', 'tests'],
    tags: ['development', 'implementation', 'agile'],
    complexity: 'advanced',
    useCases: [
      'Implement user stories',
      'Write tests for features',
      'Complete development tasks'
    ]
  }
];

/**
 * BMGD (Game Development) Team Workflows
 */
const BMGD_WORKFLOWS: Workflow[] = [
  {
    id: 'brainstorm-game',
    name: 'brainstorm-game',
    displayName: 'Game Brainstorming',
    description: 'Facilitate interactive game concept brainstorming',
    category: 'bmgd',
    team: 'bmgd',
    requiredAgents: ['game-designer', 'game-architect'],
    estimatedDuration: 45,
    inputs: [
      { name: 'genre', type: 'string', required: false, description: 'Game genre preference' },
      { name: 'inspiration', type: 'array', required: false, description: 'Inspiration games' }
    ],
    outputs: ['game_concept', 'mechanics'],
    tags: ['game-design', 'brainstorming', 'concept'],
    complexity: 'beginner',
    useCases: [
      'Brainstorm game concepts',
      'Explore game mechanics',
      'Generate creative game ideas'
    ]
  },
  {
    id: 'game-architecture',
    name: 'game-architecture',
    displayName: 'Game Architecture',
    description: 'Collaborative game architecture design',
    category: 'bmgd',
    team: 'bmgd',
    requiredAgents: ['game-architect', 'game-designer'],
    estimatedDuration: 60,
    inputs: [
      { name: 'concept', type: 'string', required: true, description: 'Game concept' },
      { name: 'platform', type: 'string', required: true, description: 'Target platform' }
    ],
    outputs: ['architecture_doc', 'tech_stack'],
    tags: ['game-design', 'architecture', 'technical'],
    complexity: 'intermediate',
    useCases: [
      'Design game architecture',
      'Plan technical implementation',
      'Select game tech stack'
    ]
  },
  {
    id: 'create-gdd',
    name: 'create-gdd',
    displayName: 'Create Game Design Document',
    description: 'Creates a comprehensive game design document',
    category: 'bmgd',
    team: 'bmgd',
    requiredAgents: ['game-designer', 'brainstorming-coach'],
    estimatedDuration: 90,
    inputs: [
      { name: 'concept', type: 'string', required: true, description: 'Game concept' }
    ],
    outputs: ['gdd_document'],
    tags: ['game-design', 'documentation', 'planning'],
    complexity: 'intermediate',
    useCases: [
      'Document game design',
      'Create comprehensive GDD',
      'Plan game features'
    ]
  }
];

/**
 * CIS (Creative & Innovation) Team Workflows
 */
const CIS_WORKFLOWS: Workflow[] = [
  {
    id: 'design-thinking',
    name: 'design-thinking',
    displayName: 'Design Thinking',
    description: 'Guide human-centered design thinking process',
    category: 'cis',
    team: 'cis',
    requiredAgents: ['design-thinking-coach'],
    estimatedDuration: 60,
    inputs: [
      { name: 'challenge', type: 'string', required: true, description: 'Design challenge' }
    ],
    outputs: ['design_solution', 'prototype_ideas'],
    tags: ['design', 'innovation', 'human-centered'],
    complexity: 'intermediate',
    useCases: [
      'Human-centered design',
      'Innovation workshops',
      'Creative problem solving'
    ]
  },
  {
    id: 'brainstorming',
    name: 'brainstorming',
    displayName: 'Brainstorming Session',
    description: 'Facilitate interactive brainstorming sessions',
    category: 'cis',
    team: 'cis',
    requiredAgents: ['brainstorming-coach'],
    estimatedDuration: 30,
    inputs: [
      { name: 'topic', type: 'string', required: true, description: 'Brainstorming topic' },
      { name: 'constraints', type: 'array', required: false, description: 'Any constraints' }
    ],
    outputs: ['ideas_list', 'top_picks'],
    tags: ['brainstorming', 'innovation', 'ideation'],
    complexity: 'beginner',
    useCases: [
      'Generate creative ideas',
      'Team ideation sessions',
      'Innovation workshops'
    ]
  },
  {
    id: 'storytelling',
    name: 'storytelling',
    displayName: 'Storytelling Workshop',
    description: 'Craft compelling narratives for presentations and content',
    category: 'cis',
    team: 'cis',
    requiredAgents: ['storyteller'],
    estimatedDuration: 45,
    inputs: [
      { name: 'message', type: 'string', required: true, description: 'Core message' },
      { name: 'audience', type: 'string', required: true, description: 'Target audience' }
    ],
    outputs: ['narrative', 'story_framework'],
    tags: ['storytelling', 'narrative', 'communication'],
    complexity: 'beginner',
    useCases: [
      'Create compelling presentations',
      'Craft brand narratives',
      'Improve communication skills'
    ]
  }
];

/**
 * BMB (BMAD Builder) Team Workflows
 */
const BMB_WORKFLOWS: Workflow[] = [
  {
    id: 'create-module',
    name: 'create-module',
    displayName: 'Create Module',
    description: 'Interactive workflow for creating new BMAD modules',
    category: 'bmb',
    team: 'bmb',
    requiredAgents: ['agent-builder', 'workflow-builder'],
    estimatedDuration: 90,
    inputs: [
      { name: 'moduleName', type: 'string', required: true, description: 'Module name' },
      { name: 'moduleType', type: 'string', required: true, description: 'Type of module' }
    ],
    outputs: ['module_structure', 'workflows'],
    tags: ['bmad', 'module', 'development'],
    complexity: 'advanced',
    useCases: [
      'Create new BMAD modules',
      'Extend BMAD framework',
      'Build custom capabilities'
    ]
  },
  {
    id: 'create-workflow',
    name: 'create-workflow',
    displayName: 'Create Workflow',
    description: 'Create structured state-machine workflows with YOLO safety',
    category: 'bmb',
    team: 'bmb',
    requiredAgents: ['workflow-builder'],
    estimatedDuration: 60,
    inputs: [
      { name: 'workflowName', type: 'string', required: true, description: 'Workflow name' },
      { name: 'steps', type: 'array', required: true, description: 'Workflow steps' }
    ],
    outputs: ['workflow_yaml', 'instructions_xml'],
    tags: ['bmad', 'workflow', 'development'],
    complexity: 'intermediate',
    useCases: [
      'Create custom workflows',
      'Automate processes',
      'Build workflow templates'
    ]
  }
];

/**
 * All workflows by category
 */
export const WORKFLOWS_BY_CATEGORY: Record<WorkflowCategory, Workflow[]> = {
  intel: INTEL_WORKFLOWS,
  security: SECURITY_WORKFLOWS,
  strategic: STRATEGIC_WORKFLOWS,
  legal: LEGAL_WORKFLOWS,
  bmm: BMM_WORKFLOWS,
  bmgd: BMGD_WORKFLOWS,
  cis: CIS_WORKFLOWS,
  bmb: BMB_WORKFLOWS
};

/**
 * Category metadata for display
 */
export const WORKFLOW_CATEGORY_METADATA: Record<WorkflowCategory, { name: string; displayName: string; icon: string; color: string }> = {
  intel: { name: 'intel', displayName: 'Intelligence', icon: 'target', color: 'text-red-500' },
  security: { name: 'security', displayName: 'Security', icon: 'shield', color: 'text-orange-500' },
  strategic: { name: 'strategic', displayName: 'Strategic', icon: 'crosshair', color: 'text-purple-500' },
  legal: { name: 'legal', displayName: 'Legal', icon: 'gavel', color: 'text-blue-500' },
  bmm: { name: 'bmm', displayName: 'Business', icon: 'briefcase', color: 'text-green-500' },
  bmgd: { name: 'bmgd', displayName: 'Games', icon: 'gamepad-2', color: 'text-pink-500' },
  cis: { name: 'cis', displayName: 'Creative', icon: 'lightbulb', color: 'text-yellow-500' },
  bmb: { name: 'bmb', displayName: 'Builder', icon: 'bot', color: 'text-cyan-500' }
};

/**
 * Get all workflows as flat array
 */
export function getAllWorkflows(): Workflow[] {
  return Object.values(WORKFLOWS_BY_CATEGORY).flat();
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: WorkflowCategory): Workflow[] {
  return WORKFLOWS_BY_CATEGORY[category] || [];
}

/**
 * Get workflow by ID
 */
export function getWorkflowById(workflowId: string): Workflow | undefined {
  return getAllWorkflows().find(workflow => workflow.id === workflowId);
}

/**
 * Get workflows grouped by category for UI display
 */
export function getWorkflowCategoryGroups(): WorkflowCategoryGroup[] {
  return (Object.keys(WORKFLOWS_BY_CATEGORY) as WorkflowCategory[]).map(category => ({
    category,
    name: category,
    displayName: WORKFLOW_CATEGORY_METADATA[category].displayName,
    icon: WORKFLOW_CATEGORY_METADATA[category].icon,
    color: WORKFLOW_CATEGORY_METADATA[category].color,
    workflows: WORKFLOWS_BY_CATEGORY[category]
  }));
}

/**
 * Search workflows by name, description, or tags
 */
export function searchWorkflows(query: string): Workflow[] {
  const lowerQuery = query.toLowerCase();
  return getAllWorkflows().filter(workflow =>
    workflow.name.toLowerCase().includes(lowerQuery) ||
    workflow.displayName.toLowerCase().includes(lowerQuery) ||
    workflow.description.toLowerCase().includes(lowerQuery) ||
    workflow.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get workflows by team ID
 * Maps team IDs to their workflow categories
 */
export function getWorkflowsByTeam(teamId: string): Workflow[] {
  // Map team IDs to workflow categories
  const teamToCategoryMap: Record<string, WorkflowCategory> = {
    'intel': 'intel',
    'security': 'security',
    'strategic': 'strategic',
    'legal': 'legal',
    'bmm': 'bmm',
    'bmgd': 'bmgd',
    'cis': 'cis',
    'bmb': 'bmb',
    // Handle team name variants
    'intel-team': 'intel',
    'cybersec-team': 'security',
    'strategy-team': 'strategic',
    'legal-team': 'legal'
  };

  const category = teamToCategoryMap[teamId];
  if (category) {
    return getWorkflowsByCategory(category);
  }

  // If no direct mapping, filter by team field
  return getAllWorkflows().filter(workflow => workflow.team === teamId);
}

/**
 * Get workflows by complexity level
 */
export function getWorkflowsByComplexity(complexity: WorkflowComplexity): Workflow[] {
  return getAllWorkflows().filter(workflow => workflow.complexity === complexity);
}

/**
 * Filter workflows by multiple criteria
 */
export interface WorkflowFilterOptions {
  teamId?: string;
  complexity?: WorkflowComplexity[];
  searchQuery?: string;
}

export function filterWorkflows(options: WorkflowFilterOptions): Workflow[] {
  let workflows = options.teamId
    ? getWorkflowsByTeam(options.teamId)
    : getAllWorkflows();

  // Filter by complexity
  if (options.complexity && options.complexity.length > 0) {
    workflows = workflows.filter(workflow =>
      workflow.complexity && options.complexity!.includes(workflow.complexity)
    );
  }

  // Filter by search query
  if (options.searchQuery && options.searchQuery.trim()) {
    const query = options.searchQuery.toLowerCase();
    workflows = workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(query) ||
      workflow.displayName.toLowerCase().includes(query) ||
      workflow.description.toLowerCase().includes(query) ||
      workflow.useCases?.some(useCase => useCase.toLowerCase().includes(query)) ||
      workflow.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return workflows;
}

/**
 * Get all available complexity levels
 */
export function getComplexityLevels(): WorkflowComplexity[] {
  return ['beginner', 'intermediate', 'advanced'];
}

/**
 * CLI command equivalents for web actions
 */
export const ACTION_TO_CLI: Record<string, string> = {
  'workflow:execute': 'bmad invoke {team} {workflow} {options}',
  'agent:invoke': 'bmad agent {agentId} --message "{message}"',
  'project:create': 'bmad project create --name "{name}"',
  'report:generate': 'bmad report generate --template {template}'
};
