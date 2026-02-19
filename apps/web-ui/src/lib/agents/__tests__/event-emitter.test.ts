/**
 * Tests for Agent Event Emitter
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AgentEventEmitter, executeAgentWithEvents, resetAgentEventEmitter } from '../event-emitter';
import { AgentEventType } from '@/types/events';
import { streamManager } from '@/lib/sse/stream-manager';

// Mock the stream manager
jest.mock('@/lib/sse/stream-manager');

describe('AgentEventEmitter', () => {
  let emitter: AgentEventEmitter;
  let broadcastMock: jest.Mock;

  beforeEach(() => {
    emitter = new AgentEventEmitter();
    broadcastMock = jest.fn();
    (streamManager.broadcastToAgent as jest.Mock) = broadcastMock.mockReturnValue(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetAgentEventEmitter();
  });

  describe('emitStepStart', () => {
    it('should emit a step_start event with correct fields', () => {
      emitter.emitStepStart(
        'agent-1',
        'Test Agent',
        'Initializing',
        1,
        5,
        10,
        5000
      );

      expect(broadcastMock).toHaveBeenCalledTimes(1);
      expect(broadcastMock).toHaveBeenCalledWith('agent-1', expect.any(Object));

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent).toEqual(expect.objectContaining({
        type: AgentEventType.STEP_START,
        agentId: 'agent-1',
        agentName: 'Test Agent',
        step: 'Initializing',
        progress: 10,
        estimatedRemaining: 5000,
      }));
    });

    it('should include optional data field', () => {
      emitter.emitStepStart(
        'agent-1',
        'Test Agent',
        'Initializing',
        1,
        5,
        10,
        5000,
        { foo: 'bar' }
      );

      // The broadcast function is called with agentId and event object
      expect(broadcastMock).toHaveBeenCalledWith('agent-1', expect.any(Object));

      // The event object should contain the data field
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent.data).toEqual({ foo: 'bar' });
    });
  });

  describe('emitStepComplete', () => {
    it('should emit a step_complete event with correct fields', () => {
      emitter.emitStepComplete(
        'agent-1',
        'Test Agent',
        'Initializing',
        1,
        5,
        20,
        4000
      );

      expect(broadcastMock).toHaveBeenCalledTimes(1);
      expect(broadcastMock).toHaveBeenCalledWith('agent-1', expect.any(Object));

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent).toEqual(expect.objectContaining({
        type: AgentEventType.STEP_COMPLETE,
        agentId: 'agent-1',
        agentName: 'Test Agent',
        step: 'Initializing',
        progress: 20,
        estimatedRemaining: 4000,
      }));
    });
  });

  describe('emitError', () => {
    it('should emit a step_error event with recovery suggestion', () => {
      const error = new Error('Connection failed');
      (error as NodeJS.ErrnoException).code = 'ECONNREFUSED';

      emitter.emitError(
        'agent-1',
        'Test Agent',
        'Connecting',
        error,
        false
      );

      expect(broadcastMock).toHaveBeenCalledTimes(1);
      expect(broadcastMock).toHaveBeenCalledWith('agent-1', expect.any(Object));

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent).toEqual(expect.objectContaining({
        type: AgentEventType.STEP_ERROR,
        agentId: 'agent-1',
        agentName: 'Test Agent',
        step: 'Connecting',
        error: 'Connection failed',
        recovery: expect.any(String),
      }));
    });

    it('should include stack trace in development mode', () => {
      const error = new Error('Test error');
      const stack = 'Error: Test error\n    at test.js:10:15';

      // Create an error with a stack
      Object.defineProperty(error, 'stack', {
        value: stack,
        configurable: true,
        writable: true,
      });

      emitter.emitError(
        'agent-1',
        'Test Agent',
        'Testing',
        error,
        true
      );

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent.data).toEqual(expect.objectContaining({
        stack: expect.stringContaining('Test error'),
      }));
    });

    it('should not include stack trace in production mode', () => {
      const error = new Error('Test error');

      emitter.emitError(
        'agent-1',
        'Test Agent',
        'Testing',
        error,
        false
      );

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      // Data should contain recovery and details, but not stack
      expect(broadcastedEvent.data).toBeDefined();
      expect(broadcastedEvent.data?.stack).toBeUndefined();
    });
  });

  describe('emitMessage', () => {
    it('should emit a message event with info level by default', () => {
      emitter.emitMessage(
        'agent-1',
        'Test Agent',
        'Processing complete'
      );

      expect(broadcastMock).toHaveBeenCalledWith('agent-1', expect.any(Object));

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent).toEqual(expect.objectContaining({
        type: AgentEventType.MESSAGE,
        agentId: 'agent-1',
        agentName: 'Test Agent',
        message: 'Processing complete',
      }));
    });

    it('should emit a message event with warning level', () => {
      emitter.emitMessage(
        'agent-1',
        'Test Agent',
        'Low memory',
        'warning'
      );

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent.data).toEqual(expect.objectContaining({
        level: 'warning',
      }));
    });

    it('should emit a message event with success level', () => {
      emitter.emitMessage(
        'agent-1',
        'Test Agent',
        'Task completed',
        'success'
      );

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent.data).toEqual(expect.objectContaining({
        level: 'success',
      }));
    });
  });

  describe('emitDone', () => {
    it('should emit a done event with 100% progress', () => {
      emitter.emitDone(
        'agent-1',
        'Test Agent',
        15000,
        { result: 'success' }
      );

      // The broadcast function is called with agentId and SSEEvent object
      const broadcastedEvent = broadcastMock.mock.calls[0][1];

      expect(broadcastedEvent).toEqual(expect.objectContaining({
        type: AgentEventType.DONE,
        agentId: 'agent-1',
        agentName: 'Test Agent',
        progress: 100,
      }));
      expect(broadcastedEvent.data).toEqual({ result: 'success' });
    });

    it('should clean up execution context after emitting done', () => {
      emitter.initializeExecution('agent-1', 'Test Agent', 'intel');
      emitter.emitDone('agent-1', 'Test Agent', 1000);

      const context = emitter.getOrCreateContext('agent-1', 'New Name', 'intel');
      expect(context).toBeDefined();
    });
  });

  describe('initializeExecution', () => {
    it('should create execution context with steps', () => {
      const context = emitter.initializeExecution(
        'agent-1',
        'Test Agent',
        'intel'
      );

      expect(context).toBeDefined();
      expect(context.agentId).toBe('agent-1');
      expect(context.agentName).toBe('Test Agent');
      expect(context.agentType).toBe('intel');
      expect(context.steps.length).toBeGreaterThan(0);
      expect(context.currentStepIndex).toBe(0);
    });
  });

  describe('getOrCreateContext', () => {
    it('should return existing context if available', () => {
      emitter.initializeExecution('agent-1', 'Test Agent', 'intel');
      const context = emitter.getOrCreateContext('agent-1', 'Different Name', 'security');

      expect(context.agentId).toBe('agent-1');
      expect(context.agentName).toBe('Test Agent'); // Should keep original name
    });

    it('should create new context if not exists', () => {
      const context = emitter.getOrCreateContext('agent-2', 'New Agent', 'security');

      expect(context.agentId).toBe('agent-2');
      expect(context.agentName).toBe('New Agent');
      expect(context.agentType).toBe('security');
    });
  });

  describe('cleanup', () => {
    it('should remove execution context', () => {
      emitter.initializeExecution('agent-1', 'Test Agent', 'intel');
      emitter.cleanup('agent-1');

      const activeExecutions = emitter.getActiveExecutions();
      expect(activeExecutions.has('agent-1')).toBe(false);
    });
  });
});

describe('executeAgentWithEvents', () => {
  let broadcastMock: jest.Mock;

  beforeEach(() => {
    broadcastMock = jest.fn();
    (streamManager.broadcastToAgent as jest.Mock) = broadcastMock.mockReturnValue(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetAgentEventEmitter();
  });

  it('should execute agent and emit events', async () => {
    const metadata = {
      id: 'agent-1',
      name: 'Test Agent',
      type: 'intel' as const,
      steps: [
        { id: 'init', name: 'Initializing', weight: 10 },
        { id: 'process', name: 'Processing', weight: 90 },
      ],
    };

    const result = await executeAgentWithEvents(metadata, async ({ emitStepStart, emitStepComplete }) => {
      emitStepStart('init');
      await new Promise(resolve => setTimeout(resolve, 10));
      emitStepComplete('init');
      emitStepStart('process');
      emitStepComplete('process');
      return { success: true };
    });

    expect(result).toEqual({ success: true });
    expect(broadcastMock).toHaveBeenCalled();
  });

  it('should emit error event on execution failure', async () => {
    const metadata = {
      id: 'agent-1',
      name: 'Test Agent',
      type: 'intel' as const,
      steps: [
        { id: 'init', name: 'Initializing', weight: 10 },
        { id: 'process', name: 'Processing', weight: 90 },
      ],
    };

    await expect(executeAgentWithEvents(metadata, async () => {
      throw new Error('Execution failed');
    })).rejects.toThrow('Execution failed');

    // Should have broadcast an error event
    const errorCalls = broadcastMock.mock.calls.filter(call =>
      call[1]?.type === 'step_error'
    );
    expect(errorCalls.length).toBeGreaterThan(0);
  });

  it('should emit done event on successful completion', async () => {
    const metadata = {
      id: 'agent-1',
      name: 'Test Agent',
      type: 'intel' as const,
      steps: [
        { id: 'init', name: 'Initializing', weight: 10 },
        { id: 'process', name: 'Processing', weight: 90 },
      ],
    };

    await executeAgentWithEvents(metadata, async () => {
      return { result: 'done' };
    });

    // Should have broadcast a done event
    const doneCalls = broadcastMock.mock.calls.filter(call =>
      call[1]?.type === 'done'
    );
    expect(doneCalls.length).toBeGreaterThan(0);
    expect(doneCalls[0][1].progress).toBe(100);
  });
});
