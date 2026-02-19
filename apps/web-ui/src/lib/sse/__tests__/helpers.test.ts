/**
 * SSE Helpers Unit Tests
 * Story 4.1: SSE Infrastructure - Task 7 Verification
 */

import { formatSSEEvent, formatKeepAlive, sendEvent, createEvent, isValidSSEEvent } from '../helpers';

// Mock controller
class MockController {
  private chunks: Uint8Array[] = [];
  closed = false;
  errored = false;

  enqueue(chunk: Uint8Array): void {
    if (this.closed || this.errored) {
      throw new Error('Controller closed or errored');
    }
    this.chunks.push(chunk);
  }

  close(): void {
    this.closed = true;
  }

  error(err: Error): void {
    this.errored = true;
    throw err;
  }

  getChunks(): string[] {
    return this.chunks.map(chunk => new TextDecoder().decode(chunk));
  }
}

describe('SSE Helpers', () => {
  describe('formatSSEEvent', () => {
    it('should format event data correctly', () => {
      const data = { type: 'connected', agentId: 'test' };
      const result = formatSSEEvent(data);
      expect(result).toBe('data: {"type":"connected","agentId":"test"}\n\n');
    });

    it('should handle complex nested objects', () => {
      const data = { type: 'message', data: { nested: { value: 123 } } };
      const result = formatSSEEvent(data);
      expect(result).toContain('data: ');
      expect(result).toContain('\n\n');
    });

    it('should handle null and undefined values', () => {
      expect(formatSSEEvent(null)).toBe('data: null\n\n');
      expect(formatSSEEvent(undefined)).toBe('data: undefined\n\n');
    });
  });

  describe('formatKeepAlive', () => {
    it('should format keep-alive comment correctly', () => {
      const result = formatKeepAlive();
      const decoded = new TextDecoder().decode(result);
      expect(decoded).toBe(':keep-alive\n\n');
    });

    it('should return Uint8Array', () => {
      const result = formatKeepAlive();
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('sendEvent', () => {
    it('should send event to controller successfully', () => {
      const controller = new MockController();
      const data = { type: 'connected' };
      const result = sendEvent(controller as any, data);
      expect(result).toBe(true);
      expect(controller.getChunks()).toHaveLength(1);
      expect(controller.getChunks()[0]).toContain('data: ');
    });

    it('should return false when controller is closed', () => {
      const controller = new MockController();
      controller.close();
      const result = sendEvent(controller as any, { type: 'test' });
      expect(result).toBe(false);
    });

    it('should handle malformed data gracefully', () => {
      const controller = new MockController();
      // Circular reference that can't be stringified
      const circular: any = { a: 1 };
      circular.self = circular;

      const result = sendEvent(controller as any, circular);
      // JSON.stringify will throw, but sendEvent catches and returns false
      expect(result).toBe(false);
    });
  });

  describe('createEvent', () => {
    it('should create event with timestamp', () => {
      const event = createEvent('connected');
      expect(event.type).toBe('connected');
      expect(event.timestamp).toBeDefined();
      expect(new Date(event.timestamp!)).toBeInstanceOf(Date);
    });

    it('should merge extra data', () => {
      const event = createEvent('message', { agentId: 'test', progress: 50 });
      expect(event.type).toBe('message');
      expect(event.agentId).toBe('test');
      expect(event.progress).toBe(50);
      expect(event.timestamp).toBeDefined();
    });

    it('should allow type to be overridden via extra data (document current behavior)', () => {
      // Note: The current implementation uses spread after type, so extraData can override
      // This is actually useful for flexibility in creating events
      const event = createEvent('connected', { type: 'message' as any });
      expect(event.type).toBe('message');
    });
  });

  describe('isValidSSEEvent', () => {
    it('should validate correct event types', () => {
      const validTypes = ['connected', 'step_start', 'step_complete', 'step_error', 'message', 'done', 'error'] as const;
      validTypes.forEach(type => {
        expect(isValidSSEEvent({ type })).toBe(true);
      });
    });

    it('should reject invalid event types', () => {
      expect(isValidSSEEvent({ type: 'invalid' as any })).toBe(false);
    });

    it('should reject non-objects', () => {
      expect(isValidSSEEvent(null)).toBe(false);
      expect(isValidSSEEvent(undefined)).toBe(false);
      expect(isValidSSEEvent('string')).toBe(false);
      expect(isValidSSEEvent(123)).toBe(false);
    });

    it('should reject objects without type', () => {
      expect(isValidSSEEvent({ data: 'test' })).toBe(false);
    });
  });
});
