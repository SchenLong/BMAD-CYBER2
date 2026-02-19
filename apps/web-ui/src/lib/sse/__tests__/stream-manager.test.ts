/**
 * SSE Stream Manager Unit Tests
 * Story 4.1: SSE Infrastructure - Task 7 Verification
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { StreamManager, streamManager, resetStreamManager } from '../stream-manager';
import type { ActiveConnection, SSEEvent } from '../types';

// Mock controller
class MockController {
  private chunks: Uint8Array[] = [];
  closed = false;
  private shouldFail = false;

  enqueue(chunk: Uint8Array): void {
    if (this.closed || this.shouldFail) {
      throw new Error('Controller closed');
    }
    this.chunks.push(chunk);
  }

  close(): void {
    this.closed = true;
  }

  fail(): void {
    this.shouldFail = true;
  }

  reset(): void {
    this.chunks = [];
    this.closed = false;
    this.shouldFail = false;
  }
}

describe('StreamManager', () => {
  let manager: StreamManager;
  let mockControllers: MockController[];

  beforeEach(() => {
    manager = new StreamManager();
    mockControllers = [];
  });

  afterEach(() => {
    // Clean up any connections created during tests
    manager.closeAll();
  });

  const createMockController = (): MockController => {
    const controller = new MockController();
    mockControllers.push(controller);
    return controller;
  };

  describe('add', () => {
    it('should add connection and return it', () => {
      const controller = createMockController();
      const connection = manager.add('conn-1', 'agent-1', controller as any);

      expect(connection.id).toBe('conn-1');
      expect(connection.agentId).toBe('agent-1');
      expect(connection.controller).toBe(controller);
      expect(connection.startTime).toBeInstanceOf(Date);
      expect(connection.lastActivity).toBeInstanceOf(Date);
    });

    it('should track connection count', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);
      manager.add('conn-2', 'agent-1', controller as any);

      expect(manager.size).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove existing connection', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);

      const removed = manager.remove('conn-1');
      expect(removed).toBe(true);
      expect(manager.size).toBe(0);
    });

    it('should return false for non-existent connection', () => {
      const removed = manager.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve existing connection', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);

      const connection = manager.get('conn-1');
      expect(connection).toBeDefined();
      expect(connection!.id).toBe('conn-1');
    });

    it('should return undefined for non-existent connection', () => {
      const connection = manager.get('non-existent');
      expect(connection).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing connection', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);

      expect(manager.has('conn-1')).toBe(true);
    });

    it('should return false for non-existent connection', () => {
      expect(manager.has('non-existent')).toBe(false);
    });
  });

  describe('getConnectionsByAgent', () => {
    it('should return all connections for an agent', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);
      manager.add('conn-2', 'agent-1', controller as any);
      manager.add('conn-3', 'agent-2', controller as any);

      const agent1Connections = manager.getConnectionsByAgent('agent-1');
      expect(agent1Connections).toHaveLength(2);
      expect(agent1Connections.every(c => c.agentId === 'agent-1')).toBe(true);
    });

    it('should return empty array for agent with no connections', () => {
      const connections = manager.getConnectionsByAgent('non-existent');
      expect(connections).toEqual([]);
    });
  });

  describe('sendTo', () => {
    it('should send event to specific connection', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);

      const event: SSEEvent = { type: 'message', data: 'test' };
      const result = manager.sendTo('conn-1', event);

      expect(result).toBe(true);
    });

    it('should update lastActivity on successful send', async () => {
      const controller = createMockController();
      const connection = manager.add('conn-1', 'agent-1', controller as any);
      const originalActivity = connection.lastActivity;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const event: SSEEvent = { type: 'message' };
      manager.sendTo('conn-1', event);

      expect(connection.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
    });

    it('should return false for non-existent connection', () => {
      const event: SSEEvent = { type: 'message' };
      const result = manager.sendTo('non-existent', event);
      expect(result).toBe(false);
    });
  });

  describe('broadcastToAgent', () => {
    it('should broadcast to all agent connections', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);
      manager.add('conn-2', 'agent-1', controller as any);
      manager.add('conn-3', 'agent-2', controller as any);

      const event: SSEEvent = { type: 'message' };
      const sentCount = manager.broadcastToAgent('agent-1', event);

      expect(sentCount).toBe(2);
    });
  });

  describe('broadcast', () => {
    it('should broadcast to all connections', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);
      manager.add('conn-2', 'agent-2', controller as any);
      manager.add('conn-3', 'agent-1', controller as any);

      const event: SSEEvent = { type: 'done' };
      const sentCount = manager.broadcast(event);

      expect(sentCount).toBe(3);
    });
  });

  describe('getStats', () => {
    it('should return connection statistics', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);
      manager.add('conn-2', 'agent-1', controller as any);
      manager.add('conn-3', 'agent-2', controller as any);

      const stats = manager.getStats();

      expect(stats.totalConnections).toBe(3);
      expect(stats.connectionsByAgent['agent-1']).toBe(2);
      expect(stats.connectionsByAgent['agent-2']).toBe(1);
      expect(stats.oldestConnection).toBeInstanceOf(Date);
      expect(stats.newestConnection).toBeInstanceOf(Date);
    });

    it('should handle empty manager', () => {
      const stats = manager.getStats();

      expect(stats.totalConnections).toBe(0);
      expect(stats.connectionsByAgent).toEqual({});
      expect(stats.oldestConnection).toBeUndefined();
      expect(stats.newestConnection).toBeUndefined();
    });
  });

  describe('closeAgentConnections', () => {
    it('should close all connections for an agent', () => {
      const controller1 = createMockController();
      const controller2 = createMockController();
      const controller3 = createMockController();

      manager.add('conn-1', 'agent-1', controller1 as any);
      manager.add('conn-2', 'agent-1', controller2 as any);
      manager.add('conn-3', 'agent-2', controller3 as any);

      const closedCount = manager.closeAgentConnections('agent-1');

      expect(closedCount).toBe(2);
      expect(controller1.closed).toBe(true);
      expect(controller2.closed).toBe(true);
      expect(controller3.closed).toBe(false);
      expect(manager.size).toBe(1);
    });
  });

  describe('closeAll', () => {
    it('should close all connections', () => {
      const controller1 = createMockController();
      const controller2 = createMockController();

      manager.add('conn-1', 'agent-1', controller1 as any);
      manager.add('conn-2', 'agent-2', controller2 as any);

      const closedCount = manager.closeAll();

      expect(closedCount).toBe(2);
      expect(controller1.closed).toBe(true);
      expect(controller2.closed).toBe(true);
      expect(manager.size).toBe(0);
    });
  });

  describe('cleanupStale', () => {
    it('should remove stale connections', () => {
      const controller = createMockController();
      const connection = manager.add('conn-1', 'agent-1', controller as any);

      // Set lastActivity to 2 hours ago
      connection.lastActivity = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const cleaned = manager.cleanupStale(60 * 60 * 1000); // 1 hour threshold

      expect(cleaned).toBe(1);
      expect(manager.size).toBe(0);
    });

    it('should not remove active connections', () => {
      const controller = createMockController();
      manager.add('conn-1', 'agent-1', controller as any);

      const cleaned = manager.cleanupStale(60 * 60 * 1000); // 1 hour threshold

      expect(cleaned).toBe(0);
      expect(manager.size).toBe(1);
    });
  });

  describe('size', () => {
    it('should return connection count', () => {
      const controller = createMockController();
      expect(manager.size).toBe(0);

      manager.add('conn-1', 'agent-1', controller as any);
      expect(manager.size).toBe(1);

      manager.remove('conn-1');
      expect(manager.size).toBe(0);
    });
  });
});

describe('Singleton streamManager', () => {
  afterEach(() => {
    // Reset the singleton after each test to prevent state leakage
    resetStreamManager();
  });

  it('should export singleton instance', () => {
    expect(streamManager).toBeInstanceOf(StreamManager);
  });

  it('should be the same instance across imports', async () => {
    const { streamManager: sm1 } = await import('../stream-manager');
    const { streamManager: sm2 } = await import('../stream-manager');
    expect(sm1).toBe(sm2);
  });

  it('should reset cleanly between tests', () => {
    const controller = new MockController();
    streamManager.add('test-conn', 'test-agent', controller as any);
    expect(streamManager.size).toBe(1);

    resetStreamManager();
    expect(streamManager.size).toBe(0);
  });
});
