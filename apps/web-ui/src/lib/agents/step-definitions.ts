/**
 * Agent Step Definitions
 *
 * Defines the steps for each agent type with human-readable names
 * and weights for progress calculation.
 */

import type { AgentStep } from '@/types/events';

/**
 * Intel Agent steps for intelligence gathering workflows.
 */
export const INTEL_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing intelligence gathering', weight: 10 },
  { id: 'osint', name: 'Collecting OSINT data', weight: 30 },
  { id: 'dns', name: 'Enumerating DNS records', weight: 15 },
  { id: 'subdomains', name: 'Discovering subdomains', weight: 15 },
  { id: 'analysis', name: 'Analyzing findings', weight: 20 },
  { id: 'report', name: 'Generating intelligence report', weight: 10 },
] as const;

/**
 * Security Agent steps for security assessment workflows.
 */
export const SECURITY_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing security assessment', weight: 10 },
  { id: 'recon', name: 'Performing reconnaissance', weight: 20 },
  { id: 'scan', name: 'Running vulnerability scan', weight: 30 },
  { id: 'analysis', name: 'Analyzing security findings', weight: 25 },
  { id: 'report', name: 'Generating security report', weight: 15 },
] as const;

/**
 * Incident Response Agent steps for IR workflows.
 */
export const IR_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'triage', name: 'Triaging incident', weight: 15 },
  { id: 'containment', name: 'Implementing containment measures', weight: 25 },
  { id: 'investigation', name: 'Investigating root cause', weight: 30 },
  { id: 'eradication', name: 'Eradicating threat', weight: 15 },
  { id: 'recovery', name: 'Implementing recovery actions', weight: 15 },
] as const;

/**
 * Legal Agent steps for legal workflows.
 */
export const LEGAL_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing legal analysis', weight: 10 },
  { id: 'research', name: 'Researching legal precedents', weight: 25 },
  { id: 'analysis', name: 'Analyzing legal implications', weight: 30 },
  { id: 'drafting', name: 'Drafting legal documents', weight: 25 },
  { id: 'review', name: 'Finalizing legal review', weight: 10 },
] as const;

/**
 * Strategy Agent steps for strategic planning workflows.
 */
export const STRATEGY_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing strategic planning', weight: 10 },
  { id: 'assessment', name: 'Assessing current situation', weight: 20 },
  { id: 'options', name: 'Identifying strategic options', weight: 25 },
  { id: 'analysis', name: 'Analyzing options and risks', weight: 25 },
  { id: 'recommendations', name: 'Formulating recommendations', weight: 20 },
] as const;

/**
 * BMM (Business Model Maker) Agent steps for product development workflows.
 */
export const BMM_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing product analysis', weight: 10 },
  { id: 'requirements', name: 'Gathering requirements', weight: 20 },
  { id: 'design', name: 'Designing solution', weight: 25 },
  { id: 'implementation', name: 'Planning implementation', weight: 25 },
  { id: 'validation', name: 'Validating approach', weight: 20 },
] as const;

/**
 * BMGD (Game Development) Agent steps for game development workflows.
 */
export const BMGD_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing game analysis', weight: 10 },
  { id: 'mechanics', name: 'Defining game mechanics', weight: 20 },
  { id: 'design', name: 'Designing game systems', weight: 25 },
  { id: 'balancing', name: 'Balancing gameplay', weight: 25 },
  { id: 'documentation', name: 'Creating game documentation', weight: 20 },
] as const;

/**
 * Generic agent steps for custom/unknown agent types.
 */
export const GENERIC_AGENT_STEPS: readonly AgentStep[] = [
  { id: 'init', name: 'Initializing', weight: 10 },
  { id: 'processing', name: 'Processing request', weight: 60 },
  { id: 'completion', name: 'Finalizing results', weight: 30 },
] as const;

/**
 * Get step definitions for a given agent type.
 *
 * @param agentType - The type of agent
 * @returns Array of step definitions for the agent
 */
export function getStepsForAgentType(agentType: string): readonly AgentStep[] {
  if (!agentType || typeof agentType !== 'string') {
    return GENERIC_AGENT_STEPS;
  }

  switch (agentType.toLowerCase()) {
    case 'intel':
    case 'osint-lead':
    case 'domain-intel-specialist':
    case 'social-media-analyst':
    case 'dark-web-analyst':
      return INTEL_AGENT_STEPS;

    case 'security':
    case 'threat-analyst':
    case 'security-architect':
    case 'penetration-tester':
    case 'web-app-security-expert':
    case 'api-security-expert':
    case 'mobile-security-expert':
    case 'blockchain-security-expert':
    case 'cloud-security-specialist':
      return SECURITY_AGENT_STEPS;

    case 'ir':
    case 'incident-commander':
    case 'forensic-investigator':
    case 'blue-team-lead':
      return IR_AGENT_STEPS;

    case 'legal':
    case 'liberty':
    case 'tribute':
    case 'iberia':
    case 'charter':
    case 'insignia':
    case 'deed':
    case 'gremio':
    case 'covenant':
    case 'counsel':
    case 'advocate':
    case 'baltic':
    case 'castile':
    case 'europa':
      return LEGAL_AGENT_STEPS;

    case 'strategy':
    case 'stakeholder-mediator':
    case 'communications-director':
    case 'the-conservative':
    case 'the-revolutionary':
    case 'the-master-strategist':
    case 'the-realist':
    case 'the-principled-commander':
    case 'policy-analyst':
    case 'political-strategist':
    case 'the-technocrat':
    case 'ethics-advisor':
    case 'the-strategist-warrior':
    case 'the-liberator':
      return STRATEGY_AGENT_STEPS;

    case 'bmm':
    case 'pm':
    case 'sm':
    case 'architect':
    case 'analyst':
    case 'ux-designer':
    case 'dev':
    case 'tea':
    case 'tech-writer':
      return BMM_AGENT_STEPS;

    case 'bmgd':
    case 'game-architect':
    case 'game-designer':
    case 'game-dev':
    case 'game-qa':
    case 'game-scrum-master':
    case 'game-solo-dev':
      return BMGD_AGENT_STEPS;

    default:
      return GENERIC_AGENT_STEPS;
  }
}

/**
 * Get the step definition by ID from a step array.
 *
 * @param steps - Array of step definitions
 * @param stepId - The step ID to find
 * @returns The step definition or undefined if not found
 */
export function getStepById(
  steps: readonly AgentStep[],
  stepId: string
): AgentStep | undefined {
  return steps.find((step) => step.id === stepId);
}

/**
 * Get the index of a step by ID.
 *
 * @param steps - Array of step definitions
 * @param stepId - The step ID to find
 * @returns The index of the step or -1 if not found
 */
export function getStepIndex(
  steps: readonly AgentStep[],
  stepId: string
): number {
  return steps.findIndex((step) => step.id === stepId);
}
