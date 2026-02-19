/**
 * Project Management Validation Schemas
 * Epic 6: Project Management System
 * Stories 6.1-6.7
 *
 * Zod schemas for input validation on all project management endpoints.
 * Provides both client and server-side validation.
 */

import { z } from 'zod';

/**
 * Project type enumeration
 */
export const projectTypeEnum = z.enum([
  'security-assessment',
  'incident-response',
  'investigation',
  'advisory',
  'compliance',
  'training',
] as const);

/**
 * Project status enumeration
 */
export const projectStatusEnum = z.enum([
  'planning',
  'active',
  'on-hold',
  'completed',
  'archived',
] as const);

/**
 * Project phase enumeration
 */
export const projectPhaseEnum = z.enum([
  'initiation',
  'discovery',
  'analysis',
  'remediation',
  'reporting',
  'review',
  'closed',
] as const);

/**
 * Member role enumeration
 */
export const memberRoleEnum = z.enum(['owner', 'lead', 'member', 'viewer'] as const);

/**
 * Assessment type enumeration
 */
export const assessmentTypeEnum = z.enum([
  'penetration-test',
  'vulnerability-scan',
  'red-team',
  'blue-team',
] as const);

/**
 * Finding severity enumeration
 */
export const findingSeverityEnum = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info',
] as const);

/**
 * Finding status enumeration
 */
export const findingStatusEnum = z.enum([
  'pending',
  'fixing',
  'testing',
  'verified',
  'false-positive',
  'risk-accepted',
] as const);

/**
 * Pentest phase enumeration
 */
export const pentestPhaseEnum = z.enum([
  'reconnaissance',
  'enumeration',
  'exploitation',
  'post-exploitation',
  'reporting',
] as const);

/**
 * Deliverable status enumeration
 */
export const deliverableStatusEnum = z.enum([
  'pending',
  'in-progress',
  'review',
  'complete',
  'cancelled',
] as const);

/**
 * Artifact type enumeration
 */
export const artifactTypeEnum = z.enum([
  'finding',
  'evidence',
  'report',
  'screenshot',
  'log',
  'code',
  'config',
  'other',
] as const);

/**
 * Incident severity enumeration (Story 6.6)
 */
export const incidentSeverityEnum = z.enum(['critical', 'high', 'medium', 'low'] as const);

/**
 * Incident phase enumeration (Story 6.6)
 */
export const incidentPhaseEnum = z.enum([
  'identification',
  'containment',
  'eradication',
  'recovery',
  'closed',
] as const);

/**
 * Project scope schema
 */
export const projectScopeSchema = z.object({
  inScope: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
});

/**
 * Phase progress schema
 */
export const phaseProgressSchema = z.object({
  name: pentestPhaseEnum,
  status: z.enum(['not-started', 'in-progress', 'complete']),
  progress: z.number().min(0).max(100),
});

/**
 * CVSS breakdown schema
 */
export const cvssBreakdownSchema = z.object({
  attackVector: z.enum(['network', 'adjacent', 'local', 'physical']),
  attackComplexity: z.enum(['low', 'high']),
  privilegesRequired: z.enum(['none', 'low', 'high']),
  userInteraction: z.enum(['none', 'required']),
  scope: z.enum(['unchanged', 'changed']),
  confidentiality: z.enum(['high', 'low', 'none']),
  integrity: z.enum(['high', 'low', 'none']),
  availability: z.enum(['high', 'low', 'none']),
});

/**
 * ============================================================================
 * Story 6.1: Project Data Model - Base Project Schemas
 * ============================================================================
 */

/**
 * Create project schema
 */
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(200, 'Project name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  projectType: projectTypeEnum,
  startDate: z.coerce.date().optional(),
  targetEndDate: z.coerce.date().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Update project schema
 */
export const updateProjectSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: projectStatusEnum.optional(),
  phase: projectPhaseEnum.optional(),
  completionPercent: z.number().min(0).max(100).optional(),
  targetEndDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * ============================================================================
 * Story 6.2: Project CRUD API - Extended Schemas
 * ============================================================================
 */

/**
 * Security assessment project schema (extended)
 */
export const createSecurityAssessmentProjectSchema = createProjectSchema.extend({
  projectType: z.literal('security-assessment'),
  assessmentType: assessmentTypeEnum,
  scope: projectScopeSchema.optional(),
});

export type CreateSecurityAssessmentProjectInput = z.infer<typeof createSecurityAssessmentProjectSchema>;

/**
 * Incident response project schema (extended)
 */
export const createIncidentResponseProjectSchema = createProjectSchema.extend({
  projectType: z.literal('incident-response'),
  incidentSeverity: incidentSeverityEnum.optional(),
  affectedSystems: z.number().min(0).optional(),
});

export type CreateIncidentResponseProjectInput = z.infer<typeof createIncidentResponseProjectSchema>;

/**
 * Update incident project schema
 */
export const updateIncidentProjectSchema = z.object({
  phase: incidentPhaseEnum.optional(),
  severity: incidentSeverityEnum.optional(),
  affectedSystems: z.number().min(0).optional(),
  containedSystems: z.number().min(0).optional(),
});

export type UpdateIncidentProjectInput = z.infer<typeof updateIncidentProjectSchema>;

/**
 * ============================================================================
 * Story 6.7: Pentest Tracker Schemas
 * ============================================================================
 */

/**
 * Update pentest project schema
 */
export const updatePentestProjectSchema = z.object({
  weekNumber: z.number().min(1).max(52).optional(),
  scope: projectScopeSchema.optional(),
  phaseProgress: z.array(phaseProgressSchema).optional(),
});

export type UpdatePentestProjectInput = z.infer<typeof updatePentestProjectSchema>;

/**
 * Create finding schema
 */
export const createFindingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  severity: findingSeverityEnum,
  cvssScore: z.number().min(0).max(10).optional(),
  cvssVector: z.string().regex(/^CVSS:3.[01]/, 'Invalid CVSS vector format').optional(),
  cvssBreakdown: cvssBreakdownSchema.optional(),
  affectedSystems: z.array(z.string()).default([]),
  owaspCategory: z.string().optional(),
  cweId: z.string().optional(),
  remediation: z.string().max(5000).optional(),
  assignee: z.string().optional(),
  phase: pentestPhaseEnum.optional(),
});

export type CreateFindingInput = z.infer<typeof createFindingSchema>;

/**
 * Update finding schema
 */
export const updateFindingSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  severity: findingSeverityEnum.optional(),
  status: findingStatusEnum.optional(),
  cvssScore: z.number().min(0).max(10).optional(),
  cvssVector: z.string().optional(),
  cvssBreakdown: cvssBreakdownSchema.optional(),
  affectedSystems: z.array(z.string()).optional(),
  owaspCategory: z.string().optional(),
  cweId: z.string().optional(),
  remediation: z.string().max(5000).optional(),
  assignee: z.string().optional(),
});

export type UpdateFindingInput = z.infer<typeof updateFindingSchema>;

/**
 * Update finding status schema (for quick status changes)
 */
export const updateFindingStatusSchema = z.object({
  status: findingStatusEnum,
  notes: z.string().max(1000).optional(),
});

export type UpdateFindingStatusInput = z.infer<typeof updateFindingStatusSchema>;

/**
 * ============================================================================
 * Story 6.2: Project Member Schemas
 * ============================================================================
 */

/**
 * Add project member schema
 */
export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: memberRoleEnum.default('member'),
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;

/**
 * Update project member role schema
 */
export const updateProjectMemberSchema = z.object({
  role: memberRoleEnum,
});

export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema>;

/**
 * ============================================================================
 * Story 6.10: Deliverable Schemas
 * ============================================================================
 */

/**
 * Create deliverable schema
 */
export const createDeliverableSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  status: deliverableStatusEnum.default('pending'),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;

/**
 * Update deliverable schema
 */
export const updateDeliverableSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: deliverableStatusEnum.optional(),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>;

/**
 * ============================================================================
 * Story 6.6: Incident Timeline Schemas
 * ============================================================================
 */

/**
 * Create timeline event schema
 */
export const createTimelineEventSchema = z.object({
  phase: incidentPhaseEnum,
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  severity: incidentSeverityEnum.optional(),
});

export type CreateTimelineEventInput = z.infer<typeof createTimelineEventSchema>;

/**
 * ============================================================================
 * Query/Filter Schemas
 * ============================================================================
 */

/**
 * Project list query schema
 */
export const projectListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: projectTypeEnum.optional(),
  status: projectStatusEnum.optional(),
  search: z.string().max(100).optional(),
});

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

/**
 * Finding list query schema
 */
export const findingListQuerySchema = z.object({
  severity: findingSeverityEnum.optional(),
  status: findingStatusEnum.optional(),
  assignee: z.string().optional(),
  search: z.string().max(100).optional(),
});

export type FindingListQuery = z.infer<typeof findingListQuerySchema>;

/**
 * Timeline event query schema
 */
export const timelineEventQuerySchema = z.object({
  phase: incidentPhaseEnum.optional(),
  severity: incidentSeverityEnum.optional(),
  search: z.string().max(100).optional(),
});

export type TimelineEventQuery = z.infer<typeof timelineEventQuerySchema>;

/**
 * ============================================================================
 * Response Schemas
 * ============================================================================
 */

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  issues: z.array(z.object({
    path: z.union([z.string(), z.array(z.string())]),
    message: z.string(),
  })).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
