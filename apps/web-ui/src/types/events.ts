/**
 * Agent Progress Events
 *
 * Type definitions for agent execution progress events.
 * These events are emitted during agent execution and streamed
 * to clients via SSE for real-time progress visualization.
 */

/**
 * Agent event types for progress tracking.
 */
export enum AgentEventType {
  STEP_START = 'step_start',
  STEP_COMPLETE = 'step_complete',
  STEP_ERROR = 'step_error',
  MESSAGE = 'message',
  DONE = 'done',
}

/**
 * Base event interface - all agent events share these fields.
 */
export interface BaseAgentEvent {
  type: AgentEventType;
  agentId: string;
  agentName: string;
  timestamp: string;
}

/**
 * Progress event emitted when a step starts or completes.
 */
export interface AgentProgressEvent extends BaseAgentEvent {
  type: AgentEventType.STEP_START | AgentEventType.STEP_COMPLETE;
  step: string; // Human-readable step name
  stepNumber: number; // Current step number (1-based)
  totalSteps: number; // Total steps in workflow
  progress: number; // 0-100
  estimatedRemaining: number; // Milliseconds
  data?: unknown; // Optional step-specific data
}

/**
 * Error event emitted when a step fails.
 */
export interface AgentErrorEvent extends BaseAgentEvent {
  type: AgentEventType.STEP_ERROR;
  step: string;
  error: string; // User-friendly error message
  errorType: string; // Technical error type
  recovery: string; // Suggested recovery action
  details?: string; // Additional error details
  stack?: string; // Stack trace (dev only)
}

/**
 * Message event for informational updates.
 */
export interface AgentMessageEvent extends BaseAgentEvent {
  type: AgentEventType.MESSAGE;
  message: string;
  level: 'info' | 'warning' | 'success';
  data?: unknown;
}

/**
 * Done event emitted when agent completes execution.
 */
export interface AgentDoneEvent extends BaseAgentEvent {
  type: AgentEventType.DONE;
  progress: 100;
  duration: number; // Total execution time in ms
  result?: unknown; // Optional result data
}

/**
 * Union type of all agent events.
 */
export type AgentEvent =
  | AgentProgressEvent
  | AgentErrorEvent
  | AgentMessageEvent
  | AgentDoneEvent;

/**
 * Agent step definition with weight for progress calculation.
 */
export interface AgentStep {
  id: string;
  name: string;
  weight: number; // Weight for progress calculation (0-100)
}

/**
 * Agent type identifiers.
 */
export type AgentType = 'intel' | 'security' | 'ir' | 'legal' | 'strategy' | 'bmm' | 'bmgd' | 'custom';

/**
 * Agent metadata for event emission.
 */
export interface AgentMetadata {
  id: string;
  name: string;
  type: AgentType;
  steps: readonly AgentStep[];
}

/**
 * Error categories for recovery suggestions.
 */
export type ErrorCategory =
  | 'timeout'
  | 'connection'
  | 'validation'
  | 'execution'
  | 'authorization'
  | 'notfound'
  | 'unknown';

/**
 * Error recovery mapping entry.
 */
export interface ErrorRecoveryEntry {
  errorType: string;
  category: ErrorCategory;
  recovery: string;
  userMessage: string;
}
