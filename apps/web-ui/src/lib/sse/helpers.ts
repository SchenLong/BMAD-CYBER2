/**
 * SSE (Server-Sent Events) Helpers
 *
 * Utility functions for formatting and sending SSE events.
 */

import type { SSEEvent } from './types';
import { KEEP_ALIVE_INTERVAL } from './types';
import type { AgentEvent } from '@/types/events';

// TextEncoder for encoding SSE messages (singleton for efficiency)
const encoder = new TextEncoder();

/**
 * Formats an SSE event as a string.
 * SSE format: `data: ${JSON.stringify(data)}\n\n`
 *
 * @param data - The event data to format
 * @returns Formatted SSE event string
 */
export function formatSSEEvent(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Formats a keep-alive comment.
 * Keep-alive comments are prefixed with ':' and ignored by clients.
 *
 * @returns Formatted keep-alive comment string
 */
export function formatKeepAlive(): Uint8Array {
  return encoder.encode(':keep-alive\n\n');
}

/**
 * Sends an SSE event through a ReadableStream controller.
 *
 * @param controller - The ReadableStream controller to send through
 * @param data - The event data to send
 * @returns true if the event was enqueued successfully, false otherwise
 */
export function sendEvent(
  controller: ReadableStreamDefaultController,
  data: SSEEvent | unknown
): boolean {
  try {
    const message = formatSSEEvent(data);
    controller.enqueue(encoder.encode(message));
    return true;
  } catch (error) {
    // Controller may be closed or errored
    console.error('[SSE] Failed to send event:', error);
    return false;
  }
}

/**
 * Sends a keep-alive comment through a ReadableStream controller.
 *
 * @param controller - The ReadableStream controller to send through
 * @returns true if the keep-alive was enqueued successfully, false otherwise
 */
export function sendKeepAlive(
  controller: ReadableStreamDefaultController
): boolean {
  try {
    controller.enqueue(formatKeepAlive());
    return true;
  } catch (error) {
    console.error('[SSE] Failed to send keep-alive:', error);
    return false;
  }
}

/**
 * Creates a keep-alive interval for a connection.
 * Returns a function that can be called to clear the interval.
 *
 * @param controller - The ReadableStream controller for the connection
 * @param intervalMs - Interval in milliseconds (defaults to KEEP_ALIVE_INTERVAL)
 * @returns A function to clear the interval
 */
export function startKeepAlive(
  controller: ReadableStreamDefaultController,
  intervalMs: number = KEEP_ALIVE_INTERVAL
): () => void {
  const intervalId = setInterval(() => {
    sendKeepAlive(controller);
  }, intervalMs);

  return () => clearInterval(intervalId);
}

/**
 * Creates an SSE event with timestamp.
 *
 * @param type - The event type
 * @param extraData - Additional event data
 * @returns A complete SSEEvent object
 */
export function createEvent(
  type: SSEEvent['type'],
  extraData?: Partial<Omit<SSEEvent, 'type' | 'timestamp'>>
): SSEEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    ...extraData,
  };
}

/**
 * Validates if an object is a valid SSEEvent.
 *
 * @param data - The object to validate
 * @returns true if the object is a valid SSEEvent
 */
export function isValidSSEEvent(data: unknown): data is SSEEvent {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const event = data as Partial<SSEEvent>;
  const validTypes: SSEEvent['type'][] = [
    'connected',
    'step_start',
    'step_complete',
    'step_error',
    'message',
    'done',
    'error',
  ];

  return typeof event.type === 'string' && validTypes.includes(event.type as SSEEvent['type']);
}

/**
 * Formats an agent event as an SSE data line.
 * Handles special characters and ensures proper SSE formatting.
 *
 * @param event - The agent event to format
 * @returns Formatted SSE event string with proper line endings
 */
export function formatAgentEvent(event: AgentEvent): string {
  // Sanitize the event for SSE (handle newlines in data)
  const json = JSON.stringify(event);

  // SSE format requires:
  // - Each line starts with a field name (e.g., "data:")
  // - Lines end with \n
  // - Messages end with an extra \n (blank line)
  // - Newlines within JSON must be handled

  return `data: ${json}\n\n`;
}

/**
 * Validates if an object is a valid AgentEvent.
 *
 * @param data - The object to validate
 * @returns true if the object is a valid AgentEvent
 */
export function isValidAgentEvent(data: unknown): data is AgentEvent {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const event = data as Partial<AgentEvent>;

  // Check required base fields
  if (typeof event.type !== 'string' || typeof event.agentId !== 'string') {
    return false;
  }

  // Validate based on type
  const validTypes = ['step_start', 'step_complete', 'step_error', 'message', 'done'];
  if (!validTypes.includes(event.type)) {
    return false;
  }

  return true;
}

/**
 * Sends an agent event through a ReadableStream controller.
 *
 * @param controller - The ReadableStream controller to send through
 * @param event - The agent event to send
 * @returns true if the event was enqueued successfully, false otherwise
 */
export function sendAgentEvent(
  controller: ReadableStreamDefaultController,
  event: AgentEvent
): boolean {
  try {
    const message = formatAgentEvent(event);
    controller.enqueue(encoder.encode(message));
    return true;
  } catch (error) {
    console.error('[SSE] Failed to send agent event:', error);
    return false;
  }
}

/**
 * Creates an agent event with common fields populated.
 *
 * @param type - The event type
 * @param agentId - Agent identifier
 * @param agentName - Human-readable agent name
 * @param extraData - Additional event data
 * @returns A complete AgentEvent object
 */
export function createAgentEvent(
  type: AgentEvent['type'],
  agentId: string,
  agentName: string,
  extraData?: Partial<Omit<AgentEvent, 'type' | 'agentId' | 'agentName' | 'timestamp'>>
): AgentEvent {
  const baseEvent = {
    type,
    agentId,
    agentName,
    timestamp: new Date().toISOString(),
  };

  return { ...baseEvent, ...extraData } as AgentEvent;
}
