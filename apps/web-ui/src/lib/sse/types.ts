/**
 * SSE (Server-Sent Events) Types
 *
 * Defines the core types for SSE streaming infrastructure.
 */

/**
 * Standard SSE event types for agent progress streaming.
 */
export type SSEEventType =
  | 'connected'
  | 'step_start'
  | 'step_complete'
  | 'step_error'
  | 'message'
  | 'done'
  | 'error';

/**
 * Standard SSE event payload.
 */
export interface SSEEvent {
  type: SSEEventType;
  agentId?: string;
  agentName?: string;
  streamId?: string;
  step?: string;
  progress?: number; // 0-100
  estimatedRemaining?: number; // milliseconds
  data?: unknown;
  error?: string;
  recovery?: string;
  timestamp?: string;
  message?: string; // For message events
}

/**
 * Active connection tracking.
 */
export interface ActiveConnection {
  id: string;
  agentId: string;
  controller: ReadableStreamDefaultController;
  startTime: Date;
  lastActivity: Date;
}

/**
 * Connection manager statistics.
 */
export interface ConnectionStats {
  totalConnections: number;
  connectionsByAgent: Record<string, number>;
  oldestConnection?: Date;
  newestConnection?: Date;
}

/**
 * SSE response headers (immutable).
 */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
} as const;

/**
 * Keep-alive interval in milliseconds (default 30 seconds).
 */
export const KEEP_ALIVE_INTERVAL = 30000;
