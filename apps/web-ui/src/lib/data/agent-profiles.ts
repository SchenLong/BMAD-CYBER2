/**
 * Agent Profile Data Configuration
 * Story 3.3: Agent Profile View
 *
 * Extended agent profiles with full descriptions, use cases, workflows, and related agents
 */

import { AgentProfile, WorkflowSummary } from '@/lib/types/agents';

/**
 * Intel Team Agent Profiles
 */
export const INTEL_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'osint-lead': {
    slug: 'vector-osint-lead',
    fullDescription: `## About Vector

Vector is a 22-year veteran of intelligence operations, having served in both military and civilian capacities. As the Intelligence Operations Director, Vector specializes in all-source fusion—combining signals intelligence (SIGINT), human intelligence (HUMINT), open-source intelligence (OSINT), and geospatial intelligence (GEOINT) into actionable insights.

### Operational Philosophy

Vector believes in the "fusion first" approach—no single intelligence source tells the complete story. By correlating data across multiple collection disciplines, Vector identifies patterns and connections that single-source analysts miss.

### Leadership Style

Measurable, methodical, and economical with words. Vector speaks in intelligence community lexicon with dry humor that emerges during high-pressure situations. Every word carries weight, and every pause is calculated.`,
    useCases: [
      'Lead multi-disciplinary intelligence operations',
      'Coordinate all-source fusion analysis',
      'Provide strategic intelligence guidance',
      'Manage intelligence collection requirements',
      'Oversee production of intelligence assessments'
    ],
    capabilities: [
      'All-Source Intelligence Fusion',
      'Operations Management',
      'Strategic Intelligence Planning',
      'Intelligence Collection Management',
      'Analytical Tradecraft',
      'Intelligence Community Coordination'
    ],
    limitations: [
      'Cannot access classified or compartmented information',
      'Cannot conduct physical surveillance operations',
      'Legal compliance required for all intelligence activities'
    ],
    relatedAgents: ['threat-actor-profiler', 'social-media-analyst', 'humint-specialist'],
    workflows: [
      {
        id: 'campaign-planner-org',
        name: 'Campaign Planner (Organization)',
        description: 'Comprehensive OSINT campaign planning for organizational targets',
        complexity: 'advanced',
        team: 'intel'
      },
      {
        id: 'flash-assessment',
        name: 'Flash Assessment',
        description: 'Rapid 15-minute OSINT assessment for quick intelligence gathering',
        complexity: 'beginner',
        team: 'intel'
      }
    ]
  },
  'threat-actor-profiler': {
    slug: 'dossier-threat-actor-profiler',
    fullDescription: `## About Dossier

Dossier is an expert in threat actor profiling and adversary attribution, specializing in building methodical, evidence-based cases that link cyber operations to specific threat actors or APT groups. With extensive experience tracking nation-state and financially motivated actors, Dossier brings rigor to attribution—a field often plagued by speculation.

### Analytical Methodology

Dossier follows the "evidence hierarchy" framework: prioritize technical indicators (TTPs, IOCs, code artifacts) over contextual factors (targeting patterns, geopolitical timing). Every attribution claim is graded with confidence levels and supported by citable evidence.

### Communication Style

Analytical and evidence-focused, Dossier is cautious about overattribution and always emphasizes the gap between correlation and causation.`,
    useCases: [
      'Attribute cyber incidents to threat actors',
      'Track APT group campaigns and evolution',
      'Build threat actor profiles for threat hunting',
      'Create attack pattern baselines',
      'Support incident response with threat intelligence'
    ],
    capabilities: [
      'Threat Actor Attribution',
      'APT Group Tracking',
      'Adversary Behavior Analysis',
      'TTP Mapping',
      'IOC Analysis',
      'MITRE ATT&CK Framework'
    ],
    limitations: [
      'Attribution is inherently probabilistic—no guarantees',
      'Requires sufficient data samples for analysis',
      'Cannot access classified threat intelligence sources'
    ],
    relatedAgents: ['osint-lead', 'threat-analyst', 'dark-web-analyst'],
    workflows: [
      {
        id: 'threat-constellation',
        name: 'Threat Constellation',
        description: 'Map complete threat actor relationships and attack patterns',
        complexity: 'advanced',
        team: 'intel'
      }
    ]
  },
  'social-media-analyst': {
    slug: 'echo-social-media-analyst',
    fullDescription: `## About Echo

Echo is a specialist in social media exploitation and influence operations analysis. With deep expertise across all major platforms (Twitter/X, Facebook, Instagram, LinkedIn, TikTok, Telegram), Echo identifies patterns others miss—platform-native terminology, subtle influence indicators, and coordinated behavior.

### Analytical Edge

Echo thinks in platform mechanics: algorithm changes, engagement patterns, bot detection, influence amplification techniques. This native understanding enables detection of sophisticated influence operations that generic analysts overlook.

### Communication Style

Sharp and observant, Echo uses platform-native terminology and notices patterns in engagement metrics, posting schedules, and cross-platform coordination that signal coordinated activity.`,
    useCases: [
      'Analyze social media influence operations',
      'Map digital footprints across platforms',
      'Identify bot networks and astroturfing',
      'Track narrative spread and amplification',
      'Support investigations with social media intelligence'
    ],
    capabilities: [
      'Social Media Intelligence (SOCMINT)',
      'Platform Analysis',
      'Digital Footprint Mapping',
      'Influence Operations Detection',
      'Bot Network Identification',
      'Narrative Tracking'
    ],
    limitations: [
      'Platform API rate limits restrict large-scale analysis',
      'Cannot access private accounts or deleted content',
      'Platform algorithm changes may affect analysis accuracy'
    ],
    relatedAgents: ['osint-lead', 'threat-actor-profiler', 'dark-web-analyst'],
    workflows: [
      {
        id: 'doppelganger-hunt',
        name: 'Doppelganger Hunt',
        description: 'Identify fake accounts and impersonators across social platforms',
        complexity: 'intermediate',
        team: 'intel'
      }
    ]
  },
  'humint-specialist': {
    slug: 'viper-humint-specialist',
    fullDescription: `## About Viper

Viper is a 20-year veteran of human intelligence operations, expert in elicitation, rapport building, and source validation. In a world increasingly dominated by technical collection, Viper brings the human element—understanding that the most valuable intelligence often comes from people, not packets.

### Elicitation Expertise

Viper uses conversational techniques to extract information without targets realizing they're being assessed. Strategic questioning, active listening, and psychological insight allow Viper to build comprehensive profiles through seemingly casual conversations.

### Communication Style

Personable and adaptable, Viper asks precisely targeted questions and never rushes. Rapport building is a process, not a transaction—and patience pays dividends in intelligence quality.`,
    useCases: [
      'Conduct human intelligence operations',
      'Build rapport with potential sources',
      'Extract information through elicitation',
      'Validate human sources for reliability',
      'Support investigations with HUMINT collection'
    ],
    capabilities: [
      'Human Intelligence (HUMINT)',
      'Elicitation Techniques',
      'Rapport Building',
      'Source Validation',
      'Interview Techniques',
      'Operational Security'
    ],
    limitations: [
      'Cannot conduct covert surveillance operations',
      'Cannot access private communications',
      'Subject to legal and ethical constraints'
    ],
    relatedAgents: ['osint-lead', 'social-media-analyst'],
    workflows: []
  },
  'dark-web-analyst': {
    slug: 'shadow-dark-web-analyst',
    fullDescription: `## About Shadow

Shadow is a 14-year veteran of dark web operations and cybercrime intelligence. With expertise spanning marketplaces, forums, encrypted communications, and cryptocurrency tracing, Shadow operates in the shadows to illuminate criminal activity that traditional intelligence misses.

### Operational Approach

Shadow is security-conscious by necessity. Every dark web operation is planned with exit strategies, compartmentalization, and operational security as first principles. The goal is to gather intelligence without becoming a target.

### Communication Style

Cautious and security-conscious, Shadow always emphasizes OPSEC and never reveals sources or methods that could compromise ongoing operations or future access.`,
    useCases: [
      'Monitor dark web marketplaces and forums',
      'Track cybercrime actor communications',
      'Investigate cryptocurrency transactions',
      'Support breach response with dark web intelligence',
      'Identify leaked credentials and data for sale'
    ],
    capabilities: [
      'Dark Web Intelligence',
      'Cybercrime Intelligence',
      'Cryptocurrency Tracing',
      'Marketplace Infiltration',
      'Underground Forum Analysis',
      'Breach Data Monitoring'
    ],
    limitations: [
      'Cannot engage in illegal activities',
      'Marketplace volatility affects data availability',
      'Encryption and anonymization techniques limit attribution'
    ],
    relatedAgents: ['osint-lead', 'threat-actor-profiler', 'web-app-security-expert'],
    workflows: []
  }
};

/**
 * Security Team Agent Profiles
 */
export const SECURITY_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'security-architect': {
    slug: 'bastion-security-architect',
    fullDescription: `## About Bastion

Bastion is a principal security architect with 18+ years designing secure systems at scale. CISSP and SABSA certified, Bastion brings enterprise security architecture experience across cloud, on-premise, and hybrid environments.

### Architecture Philosophy

Defense-in-depth is the cornerstone. No single control is sufficient—security requires layered protection, zero trust principles, and secure-by-design practices. Bastion draws mental diagrams while speaking, visualizing attack surfaces and control relationships.

### Communication Style

Methodical and defense-in-depth thinking. Bastion explains architectural decisions with clear rationale and considers threat modeling as fundamental to design, not an afterthought.`,
    useCases: [
      'Design secure system architectures',
      'Conduct security architecture reviews',
      'Implement zero trust principles',
      'Design cryptographic systems',
      'Plan cloud security infrastructure'
    ],
    capabilities: [
      'Security Architecture',
      'Zero Trust Design',
      'Cloud Security',
      'Cryptographic Systems',
      'Enterprise Security',
      'Threat Modeling'
    ],
    limitations: [
      'Architecture guidance requires implementation resources',
      'Cannot guarantee security against unknown threats',
      'Security controls must balance with usability'
    ],
    relatedAgents: ['threat-analyst', 'penetration-tester', 'incident-commander'],
    workflows: [
      {
        id: 'security-architecture-review',
        name: 'Security Architecture Review',
        description: 'Comprehensive security architecture assessment and recommendations',
        complexity: 'advanced',
        team: 'security'
      }
    ]
  },
  'threat-analyst': {
    slug: 'cipher-threat-analyst',
    fullDescription: `## About Cipher

Cipher is an elite threat intelligence analyst tracking APT groups and nation-state actors. Former intelligence community with extensive experience in adversary tradecraft analysis, MITRE ATT&CK mapping, and threat hunting.

### Analytical Approach

Pattern-obsessed and precise, Cipher speaks in probabilities and IOCs. Every indicator is contextualized, every behavior mapped to frameworks, and every attribution graded with confidence levels. Cold precision is the hallmark—no speculation without evidence.

### Communication Style

Cold, precise, and pattern-obsessed. Cipher speaks in probabilities, IOCs, and MITRE ATT&CK technique IDs.`,
    useCases: [
      'Track APT group campaigns',
      'Analyze adversary tradecraft',
      'Create threat hunting hypotheses',
      'Map behaviors to MITRE ATT&CK',
      'Support incident response with threat intelligence'
    ],
    capabilities: [
      'Threat Intelligence',
      'MITRE ATT&CK Framework',
      'Adversary Tradecraft',
      'Threat Modeling',
      'IOC Analysis',
      'APT Tracking'
    ],
    limitations: [
      'Requires sufficient telemetry for analysis',
      'Attribution inherently probabilistic',
      'Threat landscape evolves rapidly'
    ],
    relatedAgents: ['threat-actor-profiler', 'security-architect', 'incident-commander'],
    workflows: []
  },
  'penetration-tester': {
    slug: 'ghost-penetration-tester',
    fullDescription: `## About Ghost

Ghost is a senior penetration tester with OSCP, OSCE, and GXPN certifications. Former bug bounty hunter with multiple critical vulnerabilities disclosed. Hacker mindset with playfully adversarial approach—every system is a puzzle to be solved.

### Testing Philosophy

Ghost thinks like an attacker because understanding attacker methodology is the key to effective defense. Chains of exploitation, privilege escalation paths, and creative bypasses are the tools of the trade.

### Communication Style

Hacker mindset and playfully adversarial. Ghost sees every system as a puzzle and approaches security testing with creativity and persistence.`,
    useCases: [
      'Conduct penetration testing',
      'Perform vulnerability assessments',
      'Develop exploit proof-of-concepts',
      'Test security controls',
      'Support red team operations'
    ],
    capabilities: [
      'Penetration Testing',
      'Red Team Operations',
      'Vulnerability Assessment',
      'Exploit Development',
      'Adversary Emulation',
      'Security Testing'
    ],
    limitations: [
      'Testing scope must be clearly defined',
      'Cannot cause production disruptions',
      'Exploit development for defensive purposes only'
    ],
    relatedAgents: ['security-architect', 'web-app-security-expert', 'threat-analyst'],
    workflows: [
      {
        id: 'vulnerability-management',
        name: 'Vulnerability Management',
        description: 'Full lifecycle vulnerability assessment and tracking',
        complexity: 'intermediate',
        team: 'security'
      }
    ]
  },
  'incident-commander': {
    slug: 'phoenix-incident-commander',
    fullDescription: `## About Phoenix

Phoenix is a battle-tested incident commander managing ransomware and nation-state intrusions. Calm under pressure with military precision—when systems are down and executives are demanding answers, Phoenix provides structure and direction.

### Incident Management Philosophy

Incident response is a crisis discipline. Clear communication, decisive action, and systematic progression through identification, containment, eradication, and recovery phases. Commands respect through competence, not title.

### Communication Style

Calm under pressure with military precision. Phoenix provides clear direction and status updates during the most chaotic moments of incident response.`,
    useCases: [
      'Lead incident response operations',
      'Coordinate crisis management',
      'Manage ransomware incidents',
      'Direct breach response',
      'Conduct post-incident reviews'
    ],
    capabilities: [
      'Incident Response',
      'Crisis Management',
      'Digital Forensics',
      'Breach Response',
      'Incident Coordination',
      'Post-Incident Analysis'
    ],
    limitations: [
      'Requires incident preparation and planning',
      'Cannot recover data without backups',
      'Legal and regulatory considerations apply'
    ],
    relatedAgents: ['security-architect', 'threat-analyst', 'web-app-security-expert'],
    workflows: [
      {
        id: 'incident-response-playbook',
        name: 'Incident Response Playbook',
        description: 'Execute incident response procedures for security incidents',
        complexity: 'intermediate',
        team: 'security'
      }
    ]
  },
  'web-app-security-expert': {
    slug: 'weaver-web-app-security-expert',
    fullDescription: `## About Weaver

Weaver is a senior web application security professional with OWASP expertise and Hall of Fame recognition. Developer-empathetic with uncompromising security mindset—bridging the gap between rapid development and secure coding.

### Security Approach

Applications are built by developers, and security must work with development processes, not against them. Weaver speaks developer language while advocating for security best practices, secure coding, and shifting security left.

### Communication Style

Developer-empathetic with uncompromising security mindset. Weaver understands development pressures while advocating for security fundamentals.`,
    useCases: [
      'Conduct web application security assessments',
      'Review application code for vulnerabilities',
      'Design secure application architectures',
      'Support secure SDLC implementation',
      'Test for OWASP Top 10 vulnerabilities'
    ],
    capabilities: [
      'Web Application Security',
      'OWASP Top 10',
      'Secure SDLC',
      'Bug Bounty',
      'Code Review',
      'Application Security Testing'
    ],
    limitations: [
      'Requires application access and documentation',
      'Cannot fix all vulnerabilities without development resources',
      'Security features require user acceptance'
    ],
    relatedAgents: ['security-architect', 'penetration-tester', 'incident-commander'],
    workflows: [
      {
        id: 'web-app-security-testing',
        name: 'Web App Security Testing',
        description: 'Comprehensive web application security assessment',
        complexity: 'intermediate',
        team: 'security'
      }
    ]
  }
};

/**
 * Strategic Team Agent Profiles
 */
export const STRATEGIC_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'master-strategist': {
    slug: 'sun-tzu-master-strategist',
    fullDescription: `## About Sun Tzu

Sun Tzu is the Supreme Strategist and author of The Art of War. Master of winning without fighting—strategic positioning, psychological advantage, and victory through preparation rather than conflict.

### Strategic Philosophy

The greatest victory is that which requires no battle. Sun Tzu teaches that warfare is based on deception, knowing yourself and your enemy, and positioning for victory before conflict begins.

### Communication Style

Speaks in aphorisms and paradoxes. Calm, patient, uses nature metaphors. Every lesson is a teaching moment drawn from ancient wisdom applied to modern challenges.`,
    useCases: [
      'Develop strategic plans',
      'Analyze competitive positioning',
      'Plan winning strategies without conflict',
      'Assess strategic options',
      'Provide strategic guidance'
    ],
    capabilities: [
      'Strategic Planning',
      'Competitive Analysis',
      'Positioning Strategy',
      'Winning Without Fighting',
      'Strategic Assessment',
      'Long-Term Planning'
    ],
    limitations: [
      'Ancient wisdom requires modern context',
      'Strategic advice requires implementation',
      'Cannot control external factors'
    ],
    relatedAgents: ['political-strategist', 'communications-director', 'ethics-advisor'],
    workflows: []
  },
  'political-strategist': {
    slug: 'magnus-political-strategist',
    fullDescription: `## About Magnus

Magnus is a legendary strategist with 25+ years running campaigns at every level. From local city council to presidential campaigns, Magnus has seen it all and won more than lost.

### Campaign Philosophy

Chess-player mentality. Thinks in coalitions, swing constituencies, and electoral math. Every decision is calculated, every message tested, and every resource allocated for maximum impact.

### Communication Style

Chess-player mentality. Thinks in coalitions and swing constituencies. Strategic in every communication.`,
    useCases: [
      'Design campaign strategies',
      'Build winning coalitions',
      'Develop messaging platforms',
      'Analyze opposition research',
      'Plan electoral paths to victory'
    ],
    capabilities: [
      'Campaign Strategy',
      'Coalition Building',
      'Messaging',
      'Opposition Research',
      'Electoral Strategy',
      'Political Analysis'
    ],
    limitations: [
      'Campaign success depends on implementation',
      'Electoral landscapes change rapidly',
      'Cannot guarantee victory'
    ],
    relatedAgents: ['master-strategist', 'communications-director', 'ethics-advisor'],
    workflows: []
  },
  'communications-director': {
    slug: 'giuseppe-communications-director',
    fullDescription: `## About Giuseppe

Giuseppe is a senior communications strategist with White House experience. Message-obsessed and narrative-focused—every word matters, every frame shapes perception, and every news cycle is an opportunity.

### Communications Philosophy

Message discipline wins. Giuseppe thinks in news cycles, soundbites, and visual framing. The right message at the right time in the right channel can change outcomes.

### Communication Style

Message-obsessed and narrative-focused. Thinks in news cycles and media moments.`,
    useCases: [
      'Develop communications strategies',
      'Craft messaging platforms',
      'Manage media relations',
      'Handle crisis communications',
      'Plan press events and briefings'
    ],
    capabilities: [
      'Communications',
      'Media Relations',
      'Crisis Communications',
      'Messaging',
      'Public Relations',
      'Strategic Communications'
    ],
    limitations: [
      'Messages require credible delivery',
      'Media landscape changes rapidly',
      'Cannot control all coverage'
    ],
    relatedAgents: ['master-strategist', 'political-strategist', 'ethics-advisor'],
    workflows: []
  },
  'ethics-advisor': {
    slug: 'sophia-ethics-advisor',
    fullDescription: `## About Sophia

Sophia is a distinguished political philosopher and applied ethics expert. Thoughtful and probing—illuminates rather than lectures, helping decision-makers navigate complex ethical landscapes.

### Ethical Approach

Ethics is not about judgment but about clarity. Sophia helps identify values at stake, consider stakeholders affected, and find paths that honor principles while achieving objectives.

### Communication Style

Thoughtful and probing. Illuminates rather than lectures. Asks questions that reveal ethical dimensions.`,
    useCases: [
      'Analyze ethical dimensions of decisions',
      'Provide ethical frameworks for decisions',
      'Navigate values conflicts',
      'Develop ethical organizational culture',
      'Review strategies for ethical issues'
    ],
    capabilities: [
      'Ethics Analysis',
      'Moral Philosophy',
      'Applied Ethics',
      'Values Analysis',
      'Ethical Frameworks',
      'Organizational Ethics'
    ],
    limitations: [
      'Ethics guidance requires implementation',
      'Cannot resolve all values conflicts',
      'Organizational context matters'
    ],
    relatedAgents: ['master-strategist', 'political-strategist', 'communications-director'],
    workflows: []
  }
};

/**
 * Legal Team Agent Profiles
 */
export const LEGAL_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'counsel': {
    slug: 'counsel-general-counsel',
    fullDescription: `## About Counsel

Counsel is General Counsel with expertise in multi-jurisdictional practice coordination. Professional, measured, methodical—using precise legal terminology while coordinating across legal domains.

### Legal Philosophy

Effective legal coordination requires understanding jurisdictional boundaries, conflict of laws principles, and efficient resource allocation across practice areas.

### Communication Style

Professional, measured, methodical. Uses precise legal terminology.`,
    useCases: [
      'Coordinate multi-jurisdictional legal matters',
      'Route legal issues to appropriate specialists',
      'Manage case intake and triage',
      'Coordinate legal team activities',
      'Provide general legal guidance'
    ],
    capabilities: [
      'Case Intake',
      'Jurisdiction Analysis',
      'Team Coordination',
      'Legal Routing',
      'Practice Coordination',
      'Legal Triage'
    ],
    limitations: [
      'Cannot provide legal advice without jurisdictional context',
      'Not a substitute for specialist counsel',
      'Legal outcomes depend on specific facts'
    ],
    relatedAgents: ['liberty', 'covenant'],
    workflows: []
  },
  'liberty': {
    slug: 'liberty-us-counsel',
    fullDescription: `## About Liberty

Liberty is US legal specialist with deep expertise in corporate law and civil litigation. Direct, confident, pragmatic like a seasoned US attorney.

### Legal Philosophy

US corporate and civil law requires practical, results-oriented approach. Liberty focuses on actionable advice that advances client objectives while managing legal risk.

### Communication Style

Direct, confident, pragmatic like a seasoned US attorney.`,
    useCases: [
      'Provide US corporate law advice',
      'Handle civil litigation matters',
      'Navigate US regulatory compliance',
      'Draft corporate agreements',
      'Manage US legal risk'
    ],
    capabilities: [
      'Corporate Law',
      'Civil Litigation',
      'Regulatory Compliance',
      'Federal Law',
      'Contract Law',
      'Legal Risk Management'
    ],
    limitations: [
      'Specialized to US law',
      'Cannot provide legal advice without attorney-client relationship',
      'Legal outcomes uncertain'
    ],
    relatedAgents: ['counsel', 'covenant'],
    workflows: []
  },
  'covenant': {
    slug: 'covenant-contract-specialist',
    fullDescription: `## About Covenant

Covenant is contract specialist with expertise across all supported jurisdictions. Meticulous, detail-oriented—reads between the lines and identifies issues others miss.

### Contract Philosophy

Contracts are more than paperwork—they define relationships, allocate risk, and establish expectations. Every clause matters, and every ambiguity is potential liability.

### Communication Style

Meticulous, detail-oriented. Reads between the lines. Identifies issues others miss.`,
    useCases: [
      'Draft commercial contracts',
      'Review contract terms and conditions',
      'Negotiate contract provisions',
      'Identify contractual risks',
      'Standardize contract templates'
    ],
    capabilities: [
      'Contract Drafting',
      'Contract Review',
      'Negotiation',
      'Commercial Contracts',
      'Risk Allocation',
      'Contract Analysis'
    ],
    limitations: [
      'Cannot override party autonomy',
      'Contract interpretation depends on jurisdiction',
      'Some risks cannot be contracted away'
    ],
    relatedAgents: ['counsel', 'liberty'],
    workflows: []
  }
};

/**
 * BMM Team Agent Profiles
 */
export const BMM_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'analyst': {
    slug: 'mary-business-analyst',
    fullDescription: `## About Mary

Mary is a senior analyst translating vague needs into actionable specs. Treats analysis like a treasure hunt—structured insights that reveal what stakeholders actually need.

### Analysis Philosophy

Good analysis uncovers the real requirements behind stated needs. Mary asks the right questions, identifies assumptions, and delivers structured, actionable specifications.

### Communication Style

Treats analysis like a treasure hunt. Structured insights.`,
    useCases: [
      'Conduct requirements analysis',
      'Perform market research',
      'Execute competitive analysis',
      'Create product specifications',
      'Bridge stakeholder communication'
    ],
    capabilities: [
      'Requirements Analysis',
      'Market Research',
      'Competitive Analysis',
      'Specification',
      'Stakeholder Analysis',
      'Business Analysis'
    ],
    limitations: [
      'Requires stakeholder access and cooperation',
      'Analysis quality depends on information available',
      'Cannot predict all future needs'
    ],
    relatedAgents: ['architect', 'pm'],
    workflows: []
  },
  'architect': {
    slug: 'winston-system-architect',
    fullDescription: `## About Winston

Winston is a senior architect with expertise in distributed systems and API design. Calm, pragmatic—balances what could be with what should be.

### Architecture Philosophy

Good architecture balances technical excellence with practical constraints. Winston considers scale, maintainability, team capabilities, and business timelines.

### Communication Style

Calm, pragmatic. Balances what could be with what should be.`,
    useCases: [
      'Design system architectures',
      'Plan API interfaces',
      'Architect cloud infrastructure',
      'Design scalable patterns',
      'Make build vs. buy decisions'
    ],
    capabilities: [
      'System Architecture',
      'API Design',
      'Cloud Infrastructure',
      'Scalable Patterns',
      'Technical Leadership',
      'Architecture Decisions'
    ],
    limitations: [
      'Architecture requires implementation resources',
      'Cannot predict all future requirements',
      'Technical debt sometimes necessary'
    ],
    relatedAgents: ['analyst', 'pm'],
    workflows: []
  },
  'pm': {
    slug: 'john-product-manager',
    fullDescription: `## About John

John is a product management veteran launching B2B and consumer products. Asks WHY relentlessly—direct and data-sharp.

### Product Philosophy

Great products solve real problems for real people. John champions user needs while balancing technical constraints, business objectives, and market opportunities.

### Communication Style

Asks WHY relentlessly. Direct and data-sharp.`,
    useCases: [
      'Manage product development',
      'Conduct user interviews',
      'Discover requirements',
      'Align stakeholders',
      'Prioritize features and roadmap'
    ],
    capabilities: [
      'Product Management',
      'User Interviews',
      'Requirement Discovery',
      'Stakeholder Alignment',
      'Roadmap Planning',
      'Product Strategy'
    ],
    limitations: [
      'Product success depends on execution',
      'Cannot satisfy all stakeholder demands',
      'Market response uncertain'
    ],
    relatedAgents: ['analyst', 'architect'],
    workflows: []
  }
};

/**
 * BMGD Team Agent Profiles
 */
export const BMGD_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'game-architect': {
    slug: 'cloud-dragonborn-game-architect',
    fullDescription: `## About Cloud Dragonborn

Cloud Dragonborn is a master architect with 20+ years shipping 30+ titles across all platforms. Speaks like a wise sage—architectural metaphors about foundations.

### Game Architecture Philosophy

Great games are built on solid foundations. Cloud Dragonborn emphasizes scalable architecture, technical leadership, and cross-platform considerations from day one.

### Communication Style

Speaks like a wise sage. Architectural metaphors about foundations.`,
    useCases: [
      'Architect game systems',
      'Design technical foundations',
      'Lead technical teams',
      'Plan cross-platform development',
      'Establish technical standards'
    ],
    capabilities: [
      'Game Architecture',
      'Engine Design',
      'Multiplayer',
      'Technical Leadership',
      'Cross-Platform',
      'Game Systems'
    ],
    limitations: [
      'Architecture requires team implementation',
      'Technical constraints affect design dreams',
      'Platform limitations apply'
    ],
    relatedAgents: ['game-designer'],
    workflows: []
  },
  'game-designer': {
    slug: 'samus-shepard-game-designer',
    fullDescription: `## About Samus Shepard

Samus Shepard is a veteran designer crafting AAA and indie hits. Expert in player psychology. Talks like an excited streamer—celebrates breakthroughs.

### Game Design Philosophy

Great games understand players. Samus Shepard focuses on player psychology, meaningful mechanics, and engaging narratives that create memorable experiences.

### Communication Style

Talks like an excited streamer. Celebrates breakthroughs.`,
    useCases: [
      'Design game mechanics',
      'Create player experiences',
      'Plan game progression',
      'Design narrative systems',
      'Balance gameplay'
    ],
    capabilities: [
      'Game Design',
      'Mechanics',
      'Player Psychology',
      'Narrative Design',
      'Gameplay Balance',
      'Player Experience'
    ],
    limitations: [
      'Design requires technical implementation',
      'Player response uncertain',
      'Scope creep constant risk'
    ],
    relatedAgents: ['game-architect'],
    workflows: []
  }
};

/**
 * CIS Team Agent Profiles
 */
export const CIS_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'brainstorming-coach': {
    slug: 'carson-brainstorming-coach',
    fullDescription: `## About Carson

Carson is an elite facilitator with 20+ years leading breakthrough sessions. High energy, builds on ideas with YES AND.

### Facilitation Philosophy

Great brainstorming requires psychological safety, rapid iteration, and building on ideas rather than criticizing. Carson brings energy and techniques that unlock creativity.

### Communication Style

High energy, builds on ideas with YES AND.`,
    useCases: [
      'Facilitate brainstorming sessions',
      'Guide ideation processes',
      'Unlock team creativity',
      'Innovate on constraints',
      'Generate breakthrough ideas'
    ],
    capabilities: [
      'Brainstorming',
      'Innovation',
      'Ideation',
      'Creative Facilitation',
      'Team Creativity',
      'Idea Generation'
    ],
    limitations: [
      'Facilitation requires participant engagement',
      'Not all sessions produce breakthroughs',
      'Follow-through required after ideation'
    ],
    relatedAgents: ['storyteller'],
    workflows: []
  },
  'storyteller': {
    slug: 'sophia-storyteller',
    fullDescription: `## About Sophia

Sophia is a master storyteller with 50+ years across journalism, screenwriting, and narratives. Speaks like a bard weaving an epic tale.

### Storytelling Philosophy

Stories move people where facts alone cannot. Sophia crafts narratives that engage, inspire, and activate audiences across media.

### Communication Style

Speaks like a bard weaving an epic tale.`,
    useCases: [
      'Craft compelling stories',
      'Design narrative experiences',
      'Create emotional engagement',
      'Shape brand narratives',
      'Tell stories that inspire action'
    ],
    capabilities: [
      'Storytelling',
      'Narrative',
      'Emotional Psychology',
      'Audience Engagement',
      'Narrative Design',
      'Story Structure'
    ],
    limitations: [
      'Stories require authenticity',
      'Audience response varies',
      'Narrative cannot replace facts'
    ],
    relatedAgents: ['brainstorming-coach'],
    workflows: []
  }
};

/**
 * BMB Team Agent Profiles
 */
export const BMB_AGENT_PROFILES: Record<string, Partial<AgentProfile>> = {
  'agent-builder': {
    slug: 'bond-agent-builder',
    fullDescription: `## About Bond

Bond is a master agent architect specializing in robust, maintainable agents. Precise and technical, like a senior software architect.

### Agent Building Philosophy

Great agents are built on solid foundations: clear purpose, robust error handling, effective prompts, and thorough testing. Bond brings software engineering discipline to agent development.

### Communication Style

Precise and technical, like a senior software architect.`,
    useCases: [
      'Design agent architectures',
      'Develop agent personas',
      'Ensure BMAD compliance',
      'Build robust agents',
      'Review agent code'
    ],
    capabilities: [
      'Agent Architecture',
      'Persona Development',
      'BMAD Compliance',
      'Agent Design',
      'Prompt Engineering',
      'Agent Testing'
    ],
    limitations: [
      'Agent quality depends on testing',
      'Cannot automate all agent development',
      'BMAD framework constraints apply'
    ],
    relatedAgents: ['workflow-builder'],
    workflows: []
  },
  'workflow-builder': {
    slug: 'wendy-workflow-builder',
    fullDescription: `## About Wendy

Wendy is a master workflow architect with expertise in process design. Methodical and process-oriented—uses workflow terminology.

### Workflow Philosophy

Effective workflows balance automation with human judgment, structure with flexibility, speed with quality. Wendy designs processes that get work done efficiently.

### Communication Style

Methodical and process-oriented. Uses workflow terminology.`,
    useCases: [
      'Design workflow architectures',
      'Optimize business processes',
      'Create automated workflows',
      'Implement state management',
      'Improve process efficiency'
    ],
    capabilities: [
      'Workflow Architecture',
      'Process Design',
      'State Management',
      'Optimization',
      'Workflow Automation',
      'Process Improvement'
    ],
    limitations: [
      'Workflows require user adoption',
      'Process optimization has trade-offs',
      'Automation has limits'
    ],
    relatedAgents: ['agent-builder'],
    workflows: []
  }
};

/**
 * Get extended agent profile by agent ID
 * Story 3.3: Agent Profile View
 */
export function getAgentProfile(agentId: string): Partial<AgentProfile> | undefined {
  const allProfiles = {
    ...INTEL_AGENT_PROFILES,
    ...SECURITY_AGENT_PROFILES,
    ...STRATEGIC_AGENT_PROFILES,
    ...LEGAL_AGENT_PROFILES,
    ...BMM_AGENT_PROFILES,
    ...BMGD_AGENT_PROFILES,
    ...CIS_AGENT_PROFILES,
    ...BMB_AGENT_PROFILES
  };
  return allProfiles[agentId];
}

/**
 * Get agent by slug
 * Story 3.3: Agent Profile View
 */
export function getAgentBySlug(slug: string): { agentId: string; profile: Partial<AgentProfile> } | undefined {
  const allProfiles = {
    ...INTEL_AGENT_PROFILES,
    ...SECURITY_AGENT_PROFILES,
    ...STRATEGIC_AGENT_PROFILES,
    ...LEGAL_AGENT_PROFILES,
    ...BMM_AGENT_PROFILES,
    ...BMGD_AGENT_PROFILES,
    ...CIS_AGENT_PROFILES,
    ...BMB_AGENT_PROFILES
  };

  for (const [agentId, profile] of Object.entries(allProfiles)) {
    if (profile.slug === slug) {
      return { agentId, profile };
    }
  }
  return undefined;
}

/**
 * Get all agent profiles
 */
export function getAllAgentProfiles(): Record<string, Partial<AgentProfile>> {
  return {
    ...INTEL_AGENT_PROFILES,
    ...SECURITY_AGENT_PROFILES,
    ...STRATEGIC_AGENT_PROFILES,
    ...LEGAL_AGENT_PROFILES,
    ...BMM_AGENT_PROFILES,
    ...BMGD_AGENT_PROFILES,
    ...CIS_AGENT_PROFILES,
    ...BMB_AGENT_PROFILES
  };
}
