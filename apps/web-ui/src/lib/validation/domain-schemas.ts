/**
 * Domain-Specific Validation Schemas
 * Story 9.6: Input Validation Layer
 *
 * Zod schemas for specific domains: projects, workflows, agents, users, CLI.
 */

import { z } from 'zod';
import {
  titleSchema,
  descriptionSchema,
  nameSchema,
  emailSchema,
  uuidSchema,
  slugSchema,
  apiKeySchema,
  createStrictSchema,
  metadataFieldSchema,
  nonEmptyArraySchema,
} from './schemas';

/**
 * ============================================
 * PROJECT SCHEMAS
 * ============================================
 */

/**
 * Project creation schema
 */
export const createProjectSchema = createStrictSchema({
  name: titleSchema,
  description: descriptionSchema,
  type: z.enum([
    'security-assessment',
    'incident-response',
    'investigation',
    'advisory',
    'compliance',
    'training',
    'penetration-test',
  ]),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'archived']).default('planning'),
  metadata: metadataFieldSchema,
});

/**
 * Project update schema (all fields optional)
 */
export const updateProjectSchema = createStrictSchema({
  name: titleSchema.optional(),
  description: descriptionSchema.optional(),
  type: z.enum([
    'security-assessment',
    'incident-response',
    'investigation',
    'advisory',
    'compliance',
    'training',
    'penetration-test',
  ]).optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'archived']).optional(),
  metadata: metadataFieldSchema,
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

/**
 * ============================================
 * WORKFLOW SCHEMAS
 * ============================================
 */

/**
 * Workflow parameter definition schema
 */
export const workflowParameterSchema = createStrictSchema({
  name: z.string().min(1).max(100),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  description: z.string().max(500).optional(),
  enum: z.array(z.string()).optional(),
});

/**
 * Workflow execution schema
 */
export const executeWorkflowSchema = createStrictSchema({
  workflowId: uuidSchema,
  parameters: z.record(z.unknown()).optional(),
  context: z.object({
    projectId: uuidSchema.optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

/**
 * ============================================
 * AGENT SCHEMAS
 * ============================================
 */

/**
 * Agent invocation schema
 */
export const invokeAgentSchema = createStrictSchema({
  agentId: z.string().min(1, 'Agent ID is required'),
  message: z.string().min(1, 'Message is required').max(50000, 'Message is too long (max 50000 characters)'),
  context: z.record(z.unknown()).optional(),
  parameters: z.record(z.unknown()).optional(),
  stream: z.boolean().default(false),
});

/**
 * Agent batch invocation schema
 */
export const batchInvokeAgentSchema = createStrictSchema({
  agentId: z.string().min(1, 'Agent ID is required'),
  messages: nonEmptyArraySchema(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(50000),
    })
  ),
  context: z.record(z.unknown()).optional(),
  parameters: z.record(z.unknown()).optional(),
});

/**
 * ============================================
 * USER SCHEMAS
 * ============================================
 */

/**
 * User creation schema (admin only)
 */
export const createUserSchema = createStrictSchema({
  email: emailSchema,
  name: nameSchema.optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'USER', 'READONLY', 'API']),
  password: z.string().min(12, 'Password must be at least 12 characters').max(128),
});

/**
 * User update schema
 */
export const updateUserSchema = createStrictSchema({
  name: nameSchema.optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'USER', 'READONLY', 'API']).optional(),
  active: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

/**
 * ============================================
 * CLI COMMAND SCHEMAS
 * ============================================
 */

/**
 * CLI command execution schema
 */
export const cliCommandSchema = createStrictSchema({
  command: z.string().min(1, 'Command is required').max(1000, 'Command is too long'),
  args: z.array(z.string().max(500)).max(20, 'Too many arguments (max 20)').default([]),
  options: z.record(z.unknown()).optional(),
  workingDirectory: z.string().max(500).optional(),
});

/**
 * CLI whitelist entry schema
 */
export const cliWhitelistEntrySchema = createStrictSchema({
  command: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  allowedArgs: z.array(z.string()).optional(),
  requireConfirmation: z.boolean().default(false),
});

/**
 * ============================================
 * TEMPLATE SCHEMAS
 * ============================================
 */

/**
 * Template creation schema
 */
export const createTemplateSchema = createStrictSchema({
  name: titleSchema,
  type: z.enum(['executive-brief', 'technical-report', 'custom']),
  description: descriptionSchema,
  content: z.string().min(1, 'Template content is required'),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })).optional(),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    fontFamily: z.string().optional(),
    logo: z.string().url().optional(),
  }).optional(),
});

/**
 * ============================================
 * API KEY SCHEMAS
 * ============================================
 */

/**
 * API key creation schema
 */
export const createApiKeySchema = createStrictSchema({
  name: z.string().min(1).max(100, 'Name is required'),
  scopes: z.array(z.enum([
    'read:projects',
    'write:projects',
    'read:workflows',
    'execute:workflows',
    'read:agents',
    'invoke:agents',
    'read:users',
    'write:users',
    'admin:all',
  ])).min(1, 'At least one scope is required'),
  expiresIn: z.number().positive().optional(),
});

/**
 * ============================================
 * FILE UPLOAD SCHEMAS
 * ============================================
 */

/**
 * File upload metadata schema
 */
export const fileUploadSchema = createStrictSchema({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z.number().positive().max(100 * 1024 * 1024), // Max 100MB
  checksum: z.string().length(64, 64).optional(), // SHA-256 hash
});

/**
 * ============================================
 * SEARCH AND FILTER SCHEMAS
 * ============================================
 */

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(500).optional(),
  filters: z.record(z.unknown()).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Date range filter schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'End date must be after start date' }
);

/**
 * ============================================
 * EXPORTS
 * ============================================
 */

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ExecuteWorkflowInput = z.infer<typeof executeWorkflowSchema>;
export type InvokeAgentInput = z.infer<typeof invokeAgentSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CliCommandInput = z.infer<typeof cliCommandSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
