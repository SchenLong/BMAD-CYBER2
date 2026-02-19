/**
 * CLI Bridge Allowed Commands Configuration
 * Story 5.1: Command Whitelist System
 *
 * Defines the whitelist of commands that can be executed through the CLI bridge.
 * This is a security-critical file - only explicitly listed commands may be executed.
 *
 * SECURITY: All commands must specify timeout, allowedRoles, and validation schemas.
 * Never add commands without proper security review.
 */

import { z } from 'zod';
import type { CommandDefinition } from './types';
import { UserRole } from '@prisma/client';

/**
 * Allowed Commands Whitelist
 * Maps command IDs to their definitions
 *
 * Command ID format: <category>.<action>
 * Example: mission.list, agent.invoke, workflow.execute
 */
export const ALLOWED_COMMANDS: Record<string, CommandDefinition> = {
  // ============================================
  // PROJECT / MISSION COMMANDS
  // ============================================

  'mission.list': {
    id: 'mission.list',
    command: 'bmad',
    args: ['list', 'missions'],
    timeout: 30000, // 30 seconds
    allowedRoles: [UserRole.READONLY, UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'List all available missions',
    category: 'project',
    example: 'mission.list',
    enabled: true,
  },

  'mission.create': {
    id: 'mission.create',
    command: 'bmad',
    args: ['mission', 'create'],
    timeout: 60000, // 60 seconds
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Create a new mission',
    category: 'project',
    example: 'mission.create {name:"Assessment",type:"assessment"}',
    enabled: true,
    validation: z.object({
      name: z.string().min(3).max(100),
      type: z.enum(['assessment', 'investigation', 'response', 'audit']),
      description: z.string().max(500).optional(),
    }),
  },

  'mission.status': {
    id: 'mission.status',
    command: 'bmad',
    args: ['mission', 'status'],
    timeout: 15000, // 15 seconds
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Get status of a mission',
    category: 'project',
    example: 'mission.status {missionId:"123"}',
    enabled: true,
    validation: z.object({
      missionId: z.string().min(1),
    }),
  },

  // ============================================
  // AGENT COMMANDS
  // ============================================

  'agent.invoke': {
    id: 'agent.invoke',
    command: 'bmad',
    args: ['invoke'],
    timeout: 300000, // 5 minutes
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Invoke a BMAD agent',
    category: 'agent',
    example: 'agent.invoke {agent:"threat-analyst",message:"Analyze this"}',
    enabled: true,
    validation: z.object({
      agent: z.string().min(1).max(100),
      message: z.string().min(1).max(10000),
      context: z.record(z.string(), z.unknown()).optional(),
    }),
  },

  'agent.list': {
    id: 'agent.list',
    command: 'bmad',
    args: ['list', 'agents'],
    timeout: 15000, // 15 seconds
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.READONLY],
    description: 'List all available agents',
    category: 'agent',
    example: 'agent.list',
    enabled: true,
  },

  // ============================================
  // WORKFLOW COMMANDS
  // ============================================

  'workflow.execute': {
    id: 'workflow.execute',
    command: 'bmad',
    args: ['workflow', 'execute'],
    timeout: 600000, // 10 minutes
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Execute a workflow',
    category: 'workflow',
    example: 'workflow.execute {workflow:"create-prd"}',
    enabled: true,
    validation: z.object({
      workflow: z.string().min(1).max(100),
      parameters: z.record(z.string(), z.unknown()).optional(),
      yolo: z.boolean().optional().default(false),
    }),
  },

  'workflow.list': {
    id: 'workflow.list',
    command: 'bmad',
    args: ['list', 'workflows'],
    timeout: 15000, // 15 seconds
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.READONLY],
    description: 'List all available workflows',
    category: 'workflow',
    example: 'workflow.list',
    enabled: true,
  },

  'workflow.status': {
    id: 'workflow.status',
    command: 'bmad',
    args: ['workflow', 'status'],
    timeout: 15000, // 15 seconds
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Get status of a running workflow',
    category: 'workflow',
    example: 'workflow.status {workflowId:"123"}',
    enabled: true,
    validation: z.object({
      workflowId: z.string().min(1),
    }),
  },

  // ============================================
  // INTEL TEAM COMMANDS
  // ============================================

  'intel.flash-assessment': {
    id: 'intel.flash-assessment',
    command: 'bmad',
    args: ['intel', 'flash-assessment'],
    timeout: 900000, // 15 minutes - intel operations can take longer
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Execute rapid 15-minute OSINT assessment',
    category: 'intel',
    example: 'intel.flash-assessment {target:"example.com"}',
    enabled: true,
    validation: z.object({
      target: z.string().min(1).max(500),
      type: z.enum(['domain', 'email', 'phone', 'username', 'ip']).optional(),
    }),
  },

  'intel.attribution-chain': {
    id: 'intel.attribution-chain',
    command: 'bmad',
    args: ['intel', 'attribution-chain'],
    timeout: 1200000, // 20 minutes
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Build evidence-based attribution chain',
    category: 'intel',
    example: 'intel.attribution-chain {targetId:"123"}',
    enabled: true,
    validation: z.object({
      targetId: z.string().min(1),
      depth: z.number().min(1).max(5).optional().default(3),
    }),
  },

  'intel.threat-constellation': {
    id: 'intel.threat-constellation',
    command: 'bmad',
    args: ['intel', 'threat-constellation'],
    timeout: 1800000, // 30 minutes
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Map complete threat actor network',
    category: 'intel',
    example: 'intel.threat-constellation {actor:"APT-28"}',
    enabled: true,
    validation: z.object({
      actor: z.string().min(1).max(100),
      includeAssociates: z.boolean().optional().default(true),
    }),
  },

  // ============================================
  // SECURITY TEAM COMMANDS
  // ============================================

  'security.architecture-review': {
    id: 'security.architecture-review',
    command: 'bmad',
    args: ['security', 'architecture-review'],
    timeout: 1200000, // 20 minutes
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Conduct comprehensive security architecture review',
    category: 'security',
    example: 'security.architecture-review {target:"./src"}',
    enabled: true,
    validation: z.object({
      target: z.string().min(1),
      depth: z.enum(['quick', 'standard', 'comprehensive']).optional().default('standard'),
    }),
  },

  'security.threat-model': {
    id: 'security.threat-model',
    command: 'bmad',
    args: ['security', 'threat-model'],
    timeout: 1800000, // 30 minutes
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Generate STRIDE-based threat model',
    category: 'security',
    example: 'security.threat-model {system:"PaymentAPI"}',
    enabled: true,
    validation: z.object({
      system: z.string().min(1).max(100),
      includeDataFlow: z.boolean().optional().default(true),
    }),
  },

  'security.vulnerability-scan': {
    id: 'security.vulnerability-scan',
    command: 'bmad',
    args: ['security', 'vulnerability-scan'],
    timeout: 2400000, // 40 minutes
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Run vulnerability scan against target',
    category: 'security',
    example: 'security.vulnerability-scan {target:"https://example.com"}',
    enabled: true,
    validation: z.object({
      target: z.string().min(1).url().or(z.string().min(1)),
      scanType: z.enum(['quick', 'full', 'compliance']).optional().default('quick'),
    }),
  },

  'security.incident-response': {
    id: 'security.incident-response',
    command: 'bmad',
    args: ['security', 'incident-response'],
    timeout: 3600000, // 60 minutes - incident response can be extensive
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Execute incident response playbook',
    category: 'security',
    example: 'security.incident-response {incidentId:"INC-123",playbook:"ransomware"}',
    enabled: true,
    validation: z.object({
      incidentId: z.string().min(1),
      playbook: z.string().min(1).max(100),
      phase: z.enum(['containment', 'eradication', 'recovery', 'lessons-learned']).optional(),
    }),
  },

  'security.compliance-audit': {
    id: 'security.compliance-audit',
    command: 'bmad',
    args: ['security', 'compliance-audit'],
    timeout: 1800000, // 30 minutes
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Run compliance audit (SOC 2, ISO 27001, HIPAA, GDPR)',
    category: 'security',
    example: 'security.compliance-audit {framework:"SOC2"}',
    enabled: true,
    validation: z.object({
      framework: z.enum(['SOC2', 'ISO27001', 'HIPAA', 'GDPR', 'PCI-DSS']),
      scope: z.string().optional(),
    }),
  },
};

/**
 * Get command definition by ID
 * Returns undefined if command not found in whitelist
 */
export function getCommand(commandId: string): CommandDefinition | undefined {
  return ALLOWED_COMMANDS[commandId];
}

/**
 * Check if a command exists in the whitelist
 */
export function hasCommand(commandId: string): boolean {
  return commandId in ALLOWED_COMMANDS;
}

/**
 * Get all enabled commands
 */
export function getEnabledCommands(): CommandDefinition[] {
  return Object.values(ALLOWED_COMMANDS).filter((cmd) => cmd.enabled !== false);
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: string): CommandDefinition[] {
  return getEnabledCommands().filter((cmd) => cmd.category === category);
}

/**
 * Get commands allowed for a specific role
 */
export function getCommandsForRole(role: UserRole): CommandDefinition[] {
  return getEnabledCommands().filter((cmd) =>
    cmd.allowedRoles.includes(role)
  );
}

/**
 * Get all command categories
 */
export function getCommandCategories(): string[] {
  const categories = new Set(Object.values(ALLOWED_COMMANDS).map((cmd) => cmd.category));
  return Array.from(categories);
}

/**
 * Command ID validation schema for API requests
 */
export const commandIdSchema = z.string()
  .min(1)
  .max(100)
  .regex(
    /^[a-z][a-z0-9]*\.[a-z][a-z0-9-]*$/,
    'Command ID must match format: category.action (e.g., mission.list, intel.flash-assessment)'
  );
