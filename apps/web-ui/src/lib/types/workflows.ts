/**
 * Workflow Types
 * Story 2.5: Progressive Disclosure - Layer 4 (Power User)
 *
 * Type definitions for workflows, workflow execution, and related data structures
 */

/**
 * Workflow category identifiers
 */
export type WorkflowCategory =
  | 'intel'
  | 'security'
  | 'strategic'
  | 'legal'
  | 'bmm'
  | 'bmgd'
  | 'cis'
  | 'bmb';

/**
 * Workflow execution status
 */
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Workflow complexity levels
 */
export type WorkflowComplexity = 'beginner' | 'intermediate' | 'advanced';

/**
 * Workflow interface
 */
export interface Workflow {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: WorkflowCategory;
  team: string;
  requiredAgents: string[];
  estimatedDuration: number; // in minutes
  inputs?: WorkflowInput[];
  outputs?: string[];
  tags?: string[];
  complexity?: WorkflowComplexity;
  useCases?: string[];
}

/**
 * Workflow input parameter
 */
export interface WorkflowInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
  required: boolean;
  description?: string;
  defaultValue?: unknown;
  options?: string[]; // For enum-like selections
}

/**
 * Workflow execution request
 */
export interface WorkflowExecutionRequest {
  workflowId: string;
  inputs: Record<string, unknown>;
  options?: {
    yolo?: boolean;
    priority?: 'low' | 'normal' | 'high';
  };
}

/**
 * Workflow execution response
 */
export interface WorkflowExecutionResponse {
  executionId: string;
  workflowId: string;
  status: WorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  output?: string;
  error?: string;
  outputFile?: string;
}

/**
 * Workflow category group for UI display
 */
export interface WorkflowCategoryGroup {
  category: WorkflowCategory;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  workflows: Workflow[];
}
