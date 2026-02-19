/**
 * Agent Event Emitter
 *
 * Emits structured progress events during agent execution.
 * Integrates with the SSE stream manager to broadcast events
 * to connected clients.
 */

import { streamManager } from '@/lib/sse';
import type { SSEEvent } from '@/lib/sse/types';
import type {
  AgentErrorEvent,
  AgentMessageEvent,
  AgentProgressEvent,
  AgentDoneEvent,
  AgentStep,
  AgentMetadata,
} from '@/types/events';
import { AgentEventType } from '@/types/events';
import { getRecoverySuggestion, sanitizeErrorMessage } from './recovery-suggestions';
import { calculateProgress, calculateStepProgress, formatDuration, createTimeEstimator } from './progress-calculator';
import { getStepsForAgentType } from './step-definitions';

/**
 * Agent execution context for tracking progress during execution.
 */
interface AgentExecutionContext {
  agentId: string;
  agentName: string;
  agentType: string;
  steps: readonly AgentStep[];
  currentStepIndex: number;
  startTime: number;
  timeEstimator: ReturnType<typeof createTimeEstimator>;
  totalWeight: number;
  accumulatedProgress: number;
}

/**
 * Active agent execution contexts.
 */
const activeExecutions = new Map<string, AgentExecutionContext>();

/**
 * AgentEventEmitter class for broadcasting agent progress events.
 */
export class AgentEventEmitter {
  /**
   * Initialize an agent execution context.
   *
   * @param agentId - Unique agent identifier
   * @param agentName - Human-readable agent name
   * @param agentType - Type of agent (determines step definitions)
   * @returns The execution context
   */
  initializeExecution(
    agentId: string,
    agentName: string,
    agentType: string
  ): AgentExecutionContext {
    const steps = getStepsForAgentType(agentType);
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);

    const context: AgentExecutionContext = {
      agentId,
      agentName,
      agentType,
      steps,
      currentStepIndex: 0,
      startTime: Date.now(),
      timeEstimator: createTimeEstimator(),
      totalWeight,
      accumulatedProgress: 0,
    };

    activeExecutions.set(agentId, context);
    return context;
  }

  /**
   * Emit a step_start event.
   *
   * @param agentId - Agent identifier
   * @param agentName - Human-readable agent name
   * @param step - Human-readable step description
   * @param stepNumber - Current step number (1-based)
   * @param totalSteps - Total number of steps
   * @param progress - Current progress (0-100)
   * @param estimatedRemaining - Estimated remaining time in milliseconds
   * @param data - Optional step-specific data
   */
  emitStepStart(
    agentId: string,
    agentName: string,
    step: string,
    stepNumber: number,
    totalSteps: number,
    progress: number,
    estimatedRemaining: number,
    data?: unknown
  ): void {
    const event: AgentProgressEvent = {
      type: AgentEventType.STEP_START,
      agentId,
      agentName,
      step,
      stepNumber,
      totalSteps,
      progress,
      estimatedRemaining,
      data,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(agentId, event);
  }

  /**
   * Emit a step_complete event.
   *
   * @param agentId - Agent identifier
   * @param agentName - Human-readable agent name
   * @param step - Human-readable step description
   * @param stepNumber - Completed step number (1-based)
   * @param totalSteps - Total number of steps
   * @param progress - Current progress (0-100)
   * @param estimatedRemaining - Estimated remaining time in milliseconds
   * @param data - Optional step-specific data
   */
  emitStepComplete(
    agentId: string,
    agentName: string,
    step: string,
    stepNumber: number,
    totalSteps: number,
    progress: number,
    estimatedRemaining: number,
    data?: unknown
  ): void {
    const event: AgentProgressEvent = {
      type: AgentEventType.STEP_COMPLETE,
      agentId,
      agentName,
      step,
      stepNumber,
      totalSteps,
      progress,
      estimatedRemaining,
      data,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(agentId, event);
  }

  /**
   * Emit a step_error event with recovery suggestion.
   *
   * @param agentId - Agent identifier
   * @param agentName - Human-readable agent name
   * @param step - Step that failed
   * @param error - The error that occurred
   * @param includeStack - Whether to include stack trace (dev mode)
   */
  emitError(
    agentId: string,
    agentName: string,
    step: string,
    error: Error,
    includeStack: boolean = false
  ): void {
    const errorType = error.constructor.name;
    const recoveryEntry = getRecoverySuggestion(errorType, error.message);

    const sanitizedMessage = sanitizeErrorMessage(error.message);

    const event: AgentErrorEvent = {
      type: AgentEventType.STEP_ERROR,
      agentId,
      agentName,
      step,
      error: sanitizedMessage,
      errorType,
      recovery: recoveryEntry.recovery,
      details: recoveryEntry.userMessage,
      stack: includeStack ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(agentId, event);
  }

  /**
   * Emit a message event for informational updates.
   *
   * @param agentId - Agent identifier
   * @param agentName - Human-readable agent name
   * @param message - The message to send
   * @param level - Message level (info, warning, success)
   * @param data - Optional additional data
   */
  emitMessage(
    agentId: string,
    agentName: string,
    message: string,
    level: 'info' | 'warning' | 'success' = 'info',
    data?: unknown
  ): void {
    const event: AgentMessageEvent = {
      type: AgentEventType.MESSAGE,
      agentId,
      agentName,
      message,
      level,
      data,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(agentId, event);
  }

  /**
   * Emit a done event when agent completes execution.
   *
   * @param agentId - Agent identifier
   * @param agentName - Human-readable agent name
   * @param duration - Total execution time in milliseconds
   * @param result - Optional result data
   */
  emitDone(agentId: string, agentName: string, duration: number, result?: unknown): void {
    const event: AgentDoneEvent = {
      type: AgentEventType.DONE,
      agentId,
      agentName,
      progress: 100,
      duration,
      result,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(agentId, event);

    // Clean up execution context
    activeExecutions.delete(agentId);
  }

  /**
   * Broadcast an event to all connected clients for an agent.
   *
   * @param agentId - Agent identifier
   * @param event - Event to broadcast
   */
  private broadcast(agentId: string, event: AgentProgressEvent | AgentErrorEvent | AgentMessageEvent | AgentDoneEvent): void {
    // The streamManager.broadcastToAgent expects an SSEEvent object
    // and handles the SSE formatting internally via sendEvent()
    const sseEvent: SSEEvent = {
      type: event.type as SSEEvent['type'],
      agentId: event.agentId,
      agentName: event.agentName,
      timestamp: event.timestamp,
    };

    // Add optional fields based on event type
    if ('step' in event) {
      sseEvent.step = event.step;
    }
    if ('progress' in event) {
      sseEvent.progress = event.progress;
    }
    if ('estimatedRemaining' in event) {
      sseEvent.estimatedRemaining = event.estimatedRemaining;
    }
    // Handle data field for progress events
    if ('data' in event && event.data) {
      sseEvent.data = (event as AgentProgressEvent).data;
    }
    if ('error' in event) {
      const errorEvent = event as AgentErrorEvent;
      sseEvent.error = errorEvent.error;
      // Include stack and recovery in data for error events
      // Only create data object if we have additional information
      const errorData: Record<string, unknown> = {};
      if (errorEvent.recovery) {
        errorData.recovery = errorEvent.recovery;
      }
      if (errorEvent.details) {
        errorData.details = errorEvent.details;
      }
      if (errorEvent.stack) {
        errorData.stack = errorEvent.stack;
      }
      // Only set data if we have something to add
      if (Object.keys(errorData).length > 0) {
        sseEvent.data = errorData;
      }
    }
    if ('recovery' in event) {
      sseEvent.recovery = event.recovery;
    }
    if ('message' in event) {
      const messageEvent = event as AgentMessageEvent;
      sseEvent.message = messageEvent.message;
      // Include level in data for message events
      sseEvent.data = {
        level: messageEvent.level,
        ...(messageEvent.data || {}),
      };
    }
    if ('result' in event) {
      sseEvent.data = (event as AgentDoneEvent).result;
    }

    // Broadcast to all clients watching this agent
    const sentCount = streamManager.broadcastToAgent(agentId, sseEvent);

    // Log for debugging
    if (sentCount === 0) {
      console.log(`[AgentEventEmitter] No active connections for agent ${agentId}, event not sent`);
    }
  }

  /**
   * Get or create an execution context for an agent.
   *
   * @param agentId - Agent identifier
   * @param agentName - Human-readable agent name
   * @param agentType - Type of agent
   * @returns The execution context
   */
  getOrCreateContext(
    agentId: string,
    agentName: string,
    agentType: string
  ): AgentExecutionContext {
    let context = activeExecutions.get(agentId);

    if (!context) {
      context = this.initializeExecution(agentId, agentName, agentType);
    }

    return context;
  }

  /**
   * Clean up an execution context.
   *
   * @param agentId - Agent identifier
   */
  cleanup(agentId: string): void {
    activeExecutions.delete(agentId);
  }

  /**
   * Get active execution contexts.
   *
   * @returns Map of active executions
   */
  getActiveExecutions(): Map<string, AgentExecutionContext> {
    return new Map(activeExecutions);
  }
}

/**
 * Reset method for testing - clears all active executions.
 * This is safe for tests where the execution contexts are mocked.
 */
export function resetAgentEventEmitter(): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    activeExecutions.clear();
  }
}

/**
 * Get the active executions map for testing purposes.
 */
export function getActiveExecutions(): Map<string, AgentExecutionContext> {
  return new Map(activeExecutions);
}

/**
 * Singleton instance of AgentEventEmitter.
 */
export const agentEventEmitter = new AgentEventEmitter();

/**
 * Helper function to execute an agent with automatic progress events.
 *
 * @param metadata - Agent metadata (id, name, type, steps)
 * @param executor - Async function that executes the agent logic
 * @returns Promise that resolves when execution completes
 */
export async function executeAgentWithEvents<T = unknown>(
  metadata: AgentMetadata,
  executor: (context: {
    emitMessage: (message: string, level?: 'info' | 'warning' | 'success', data?: unknown) => void;
    emitStepStart: (stepId: string) => void;
    emitStepComplete: (stepId: string, data?: unknown) => void;
  }) => Promise<T>
): Promise<T> {
  const { id: agentId, name: agentName, type: agentType, steps } = metadata;
  const startTime = Date.now();

  // Initialize execution context
  const context = agentEventEmitter.getOrCreateContext(agentId, agentName, agentType);

  try {
    // Emit initial step start
    if (steps.length > 0) {
      const firstStep = steps[0];
      const progress = calculateProgress(0, steps, true);
      agentEventEmitter.emitStepStart(
        agentId,
        agentName,
        firstStep.name,
        1,
        steps.length,
        progress,
        0
      );
    }

    // Define helper functions for the executor
    const stepStartMap = new Map<string, number>();

    const helpers = {
      emitMessage: (
        message: string,
        level: 'info' | 'warning' | 'success' = 'info',
        data?: unknown
      ) => {
        agentEventEmitter.emitMessage(agentId, agentName, message, level, data);
      },

      emitStepStart: (stepId: string) => {
        const stepIndex = steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1) return;

        // Update context current step index
        context.currentStepIndex = stepIndex;

        // Record step start in time estimator
        context.timeEstimator.recordStepStart(stepId);

        stepStartMap.set(stepId, Date.now());

        const progress = calculateProgress(stepIndex, steps, true);
        const remaining = context.timeEstimator.getSimpleEstimatedRemaining(
          steps.length,
          stepIndex
        );

        agentEventEmitter.emitStepStart(
          agentId,
          agentName,
          steps[stepIndex].name,
          stepIndex + 1,
          steps.length,
          progress,
          remaining
        );
      },

      emitStepComplete: (stepId: string, data?: unknown) => {
        const stepIndex = steps.findIndex((s) => s.id === stepId);
        if (stepIndex === -1) return;

        // Record step completion in time estimator
        context.timeEstimator.recordStepComplete(stepId);

        const progress = calculateStepProgress(stepIndex, steps);
        const remaining = context.timeEstimator.getSimpleEstimatedRemaining(
          steps.length,
          stepIndex + 1
        );

        agentEventEmitter.emitStepComplete(
          agentId,
          agentName,
          steps[stepIndex].name,
          stepIndex + 1,
          steps.length,
          progress,
          remaining,
          data
        );

        // Emit next step start if not last step
        if (stepIndex + 1 < steps.length) {
          const nextStep = steps[stepIndex + 1];
          const nextProgress = calculateProgress(stepIndex + 1, steps, true);

          // Update context for next step
          context.currentStepIndex = stepIndex + 1;

          agentEventEmitter.emitStepStart(
            agentId,
            agentName,
            nextStep.name,
            stepIndex + 2,
            steps.length,
            nextProgress,
            remaining
          );
        }
      },
    };

    // Execute the agent logic
    const result = await executor(helpers);

    // Emit done event
    const duration = Date.now() - startTime;
    agentEventEmitter.emitDone(agentId, agentName, duration, result);

    return result;

  } catch (error) {
    // Emit error event
    const currentStepIndex = Math.min(context.currentStepIndex, steps.length - 1);
    const step = steps[currentStepIndex]?.name || 'Unknown step';

    agentEventEmitter.emitError(
      agentId,
      agentName,
      step,
      error as Error,
      process.env.NODE_ENV === 'development'
    );

    throw error;
  } finally {
    // Clean up
    agentEventEmitter.cleanup(agentId);
  }
}

/**
 * Import alias for convenience
 */
export { calculateProgress, calculateStepProgress, formatDuration, createTimeEstimator };
