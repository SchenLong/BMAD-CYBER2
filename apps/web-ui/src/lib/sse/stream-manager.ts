/**
 * SSE Stream Manager
 *
 * Manages active SSE connections with connection tracking,
 * cleanup, and broadcast capabilities.
 */

import type { ActiveConnection, ConnectionStats, SSEEvent } from './types';
import { sendEvent, createEvent } from './helpers';

/**
 * StreamManager class for managing active SSE connections.
 *
 * Tracks all active SSE connections, provides utilities for
 * adding, removing, and broadcasting to connections.
 */
export class StreamManager {
  private connections = new Map<string, ActiveConnection>();

  /**
   * Add a new connection to the manager.
   *
   * @param id - Unique connection ID
   * @param agentId - Agent ID this connection is observing
   * @param controller - ReadableStream controller for sending events
   * @returns The created ActiveConnection
   */
  add(
    id: string,
    agentId: string,
    controller: ReadableStreamDefaultController
  ): ActiveConnection {
    const connection: ActiveConnection = {
      id,
      agentId,
      controller,
      startTime: new Date(),
      lastActivity: new Date(),
    };

    this.connections.set(id, connection);
    console.log(`[SSE] Connection added: ${id} for agent ${agentId}`);

    return connection;
  }

  /**
   * Remove a connection from the manager.
   *
   * @param id - Connection ID to remove
   * @returns true if connection was found and removed, false otherwise
   */
  remove(id: string): boolean {
    const connection = this.connections.get(id);
    if (connection) {
      this.connections.delete(id);
      console.log(`[SSE] Connection removed: ${id} for agent ${connection.agentId}`);
      return true;
    }
    return false;
  }

  /**
   * Get a connection by ID.
   *
   * @param id - Connection ID
   * @returns The ActiveConnection or undefined if not found
   */
  get(id: string): ActiveConnection | undefined {
    return this.connections.get(id);
  }

  /**
   * Check if a connection exists.
   *
   * @param id - Connection ID
   * @returns true if connection exists
   */
  has(id: string): boolean {
    return this.connections.has(id);
  }

  /**
   * Get all connections for a specific agent.
   *
   * @param agentId - Agent ID
   * @returns Array of ActiveConnections for the agent
   */
  getConnectionsByAgent(agentId: string): ActiveConnection[] {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.agentId === agentId
    );
  }

  /**
   * Send an event to a specific connection.
   *
   * @param id - Connection ID
   * @param event - SSE event to send
   * @returns true if event was sent successfully
   */
  sendTo(id: string, event: SSEEvent): boolean {
    const connection = this.connections.get(id);
    if (!connection) {
      return false;
    }

    const success = sendEvent(connection.controller, event);
    if (success) {
      connection.lastActivity = new Date();
    }
    return success;
  }

  /**
   * Broadcast an event to all connections for a specific agent.
   *
   * @param agentId - Agent ID
   * @param event - SSE event to broadcast
   * @returns Number of connections the event was sent to
   */
  broadcastToAgent(agentId: string, event: SSEEvent): number {
    const agentConnections = this.getConnectionsByAgent(agentId);
    let sentCount = 0;

    for (const connection of agentConnections) {
      if (sendEvent(connection.controller, event)) {
        sentCount++;
        connection.lastActivity = new Date();
      }
    }

    return sentCount;
  }

  /**
   * Broadcast an event to all active connections.
   *
   * @param event - SSE event to broadcast
   * @returns Number of connections the event was sent to
   */
  broadcast(event: SSEEvent): number {
    let sentCount = 0;

    for (const connection of this.connections.values()) {
      if (sendEvent(connection.controller, event)) {
        sentCount++;
        connection.lastActivity = new Date();
      }
    }

    return sentCount;
  }

  /**
   * Get statistics about current connections.
   *
   * @returns ConnectionStats object
   */
  getStats(): ConnectionStats {
    const connectionsByAgent: Record<string, number> = {};
    let oldestConnection: Date | undefined;
    let newestConnection: Date | undefined;

    for (const connection of this.connections.values()) {
      // Count by agent
      connectionsByAgent[connection.agentId] =
        (connectionsByAgent[connection.agentId] || 0) + 1;

      // Track oldest/newest
      if (!oldestConnection || connection.startTime < oldestConnection) {
        oldestConnection = connection.startTime;
      }
      if (!newestConnection || connection.startTime > newestConnection) {
        newestConnection = connection.startTime;
      }
    }

    return {
      totalConnections: this.connections.size,
      connectionsByAgent,
      oldestConnection,
      newestConnection,
    };
  }

  /**
   * Close all connections for a specific agent.
   *
   * @param agentId - Agent ID
   * @returns Number of connections closed
   */
  closeAgentConnections(agentId: string): number {
    const agentConnections = this.getConnectionsByAgent(agentId);
    let closedCount = 0;

    for (const connection of agentConnections) {
      try {
        connection.controller.close();
        this.connections.delete(connection.id);
        closedCount++;
      } catch (error) {
        console.error(`[SSE] Error closing connection ${connection.id}:`, error);
      }
    }

    if (closedCount > 0) {
      console.log(`[SSE] Closed ${closedCount} connection(s) for agent ${agentId}`);
    }

    return closedCount;
  }

  /**
   * Close all active connections.
   *
   * @returns Number of connections closed
   */
  closeAll(): number {
    let closedCount = 0;

    for (const connection of this.connections.values()) {
      try {
        connection.controller.close();
        closedCount++;
      } catch (error) {
        console.error(`[SSE] Error closing connection ${connection.id}:`, error);
      }
    }

    this.connections.clear();
    console.log(`[SSE] Closed all ${closedCount} connection(s)`);

    return closedCount;
  }

  /**
   * Get the number of active connections.
   */
  get size(): number {
    return this.connections.size;
  }

  /**
   * Clean up stale connections (inactive for longer than specified duration).
   *
   * @param maxInactiveMs - Maximum inactive time in milliseconds
   * @returns Number of connections cleaned up
   */
  cleanupStale(maxInactiveMs: number): number {
    const now = new Date();
    const staleIds: string[] = [];

    for (const [id, connection] of this.connections.entries()) {
      const inactiveTime = now.getTime() - connection.lastActivity.getTime();
      if (inactiveTime > maxInactiveMs) {
        staleIds.push(id);
      }
    }

    for (const id of staleIds) {
      try {
        const connection = this.connections.get(id);
        if (connection) {
          connection.controller.close();
        }
        this.connections.delete(id);
      } catch (error) {
        console.error(`[SSE] Error cleaning up stale connection ${id}:`, error);
      }
    }

    if (staleIds.length > 0) {
      console.log(`[SSE] Cleaned up ${staleIds.length} stale connection(s)`);
    }

    return staleIds.length;
  }
}

/**
 * Reset method for testing - clears all connections without closing them.
 * This is safe for tests where the controllers are mocked.
 */
export function resetStreamManager(): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    (streamManager as unknown as { connections: Map<string, ActiveConnection> }).connections.clear();
  }
}

/**
 * Get the internal connections map for testing purposes.
 */
export function getStreamManagerConnections(): Map<string, ActiveConnection> {
  return (streamManager as unknown as { connections: Map<string, ActiveConnection> }).connections;
}

/**
 * Singleton instance of StreamManager for use across the application.
 */
export const streamManager = new StreamManager();
