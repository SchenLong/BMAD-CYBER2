/**
 * CLI Bridge Process Manager
 * Story 5.2: Safe Process Spawning
 *
 * Manages active process lifecycle, tracking, and cleanup.
 * Emits events for process state changes for real-time monitoring.
 *
 * SECURITY: All process tracking includes user attribution for audit trails.
 */

import { EventEmitter } from 'events';
import { kill } from 'process';
import type { ActiveProcess, ProcessStatus, ProcessEvent, CliResult } from './types';
import { ProcessError } from './process-error';

/**
 * Process Manager Events
 */
export interface ProcessManagerEvents {
  /** Process started */
  'process:started': (data: { processId: string; command: string; userId?: string }) => void;
  /** Process updated */
  'process:updated': (data: { processId: string; process: ActiveProcess }) => void;
  /** Process completed successfully */
  'process:completed': (data: { processId: string; process: ActiveProcess; result: CliResult }) => void;
  /** Process failed */
  'process:failed': (data: { processId: string; process: ActiveProcess; error: string }) => void;
  /** Process was killed */
  'process:killed': (data: { processId: string; process: ActiveProcess }) => void;
  /** Process output received */
  'process:output': (data: { processId: string; data: string; stream: 'stdout' | 'stderr' }) => void;
  /** Process timed out */
  'process:timedOut': (data: { processId: string; process: ActiveProcess }) => void;
}

/**
 * Process Manager Configuration
 */
export interface ProcessManagerConfig {
  /** How long to keep completed process data (default: 60 seconds) */
  retentionTimeMs?: number;
  /** Maximum number of active processes per user */
  maxProcessesPerUser?: number;
  /** Maximum total active processes */
  maxTotalProcesses?: number;
}

/**
 * Process Manager
 * Tracks and manages the lifecycle of executing CLI commands
 */
export class ProcessManager extends EventEmitter {
  private activeProcesses = new Map<string, ActiveProcess>();
  private retentionTimeMs: number;
  private maxProcessesPerUser: number;
  private maxTotalProcesses: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: ProcessManagerConfig = {}) {
    super();
    this.retentionTimeMs = config.retentionTimeMs ?? 60000; // 1 minute default
    this.maxProcessesPerUser = config.maxProcessesPerUser ?? 5;
    this.maxTotalProcesses = config.maxTotalProcesses ?? 50;

    // Set up automatic cleanup interval
    this.setupCleanupInterval();
  }

  /**
   * Start tracking a new process
   * @param id - Unique process identifier
   * @param command - Command being executed
   * @param args - Command arguments
   * @param userId - User who initiated the process
   * @param commandId - Command ID from whitelist
   * @returns The created ActiveProcess
   */
  startProcess(
    id: string,
    command: string,
    args: string[],
    userId?: string,
    commandId?: string
  ): ActiveProcess {
    // Check total process limit
    if (this.activeProcesses.size >= this.maxTotalProcesses) {
      throw new ProcessError(
        `Maximum total processes limit reached: ${this.maxTotalProcesses}`,
        { command }
      );
    }

    // Check per-user process limit
    if (userId) {
      const userProcessCount = this.getUserProcessCount(userId);
      if (userProcessCount >= this.maxProcessesPerUser) {
        throw new ProcessError(
          `Maximum processes per user limit reached: ${this.maxProcessesPerUser}`,
          { command }
        );
      }
    }

    const process: ActiveProcess = {
      id,
      command,
      args,
      status: 'starting',
      startTime: new Date(),
      output: [],
      userId,
      commandId,
    };

    this.activeProcesses.set(id, process);

    this.emit('process:started', {
      processId: id,
      command: `${command} ${args.join(' ')}`,
      userId,
    });

    return process;
  }

  /**
   * Update process status and/or PID
   * @param id - Process identifier
   * @param updates - Fields to update
   */
  updateProcess(id: string, updates: Partial<ActiveProcess>): void {
    const process = this.activeProcesses.get(id);
    if (!process) {
      return;
    }

    // Create snapshot for emit before mutation
    const snapshot = { ...process, ...updates };

    // Apply updates to original
    Object.assign(process, updates);

    this.emit('process:updated', {
      processId: id,
      process: snapshot,
    });
  }

  /**
   * Mark process as running and set PID
   * @param id - Process identifier
   * @param pid - Process ID from OS
   */
  markRunning(id: string, pid: number): void {
    this.updateProcess(id, {
      status: 'running',
      pid,
    });
  }

  /**
   * Append output to process
   * @param id - Process identifier
   * @param data - Output data
   * @param stream - Output stream (stdout or stderr)
   */
  appendOutput(id: string, data: string, stream: 'stdout' | 'stderr'): void {
    const process = this.activeProcesses.get(id);
    if (!process) {
      return;
    }

    process.output.push(data);

    this.emit('process:output', {
      processId: id,
      data,
      stream,
    });
  }

  /**
   * Mark process as completed
   * @param id - Process identifier
   * @param exitCode - Process exit code
   * @param result - Full execution result
   */
  completeProcess(id: string, exitCode: number, result: CliResult): void {
    const process = this.activeProcesses.get(id);
    if (!process) {
      return;
    }

    const status: ProcessStatus = exitCode === 0 ? 'completed' : 'failed';

    process.status = status;
    process.endTime = new Date();
    process.exitCode = exitCode;

    // Store stdout/stderr in output for quick access
    if (result.stdout) {
      process.output.push(result.stdout);
    }

    if (status === 'completed') {
      this.emit('process:completed', {
        processId: id,
        process: { ...process },
        result,
      });
    } else {
      this.emit('process:failed', {
        processId: id,
        process: { ...process },
        error: result.stderr || result.error || `Exit code ${exitCode}`,
      });
    }

    // Schedule cleanup
    this.scheduleCleanup(id);
  }

  /**
   * Mark process as timed out
   * @param id - Process identifier
   */
  markTimedOut(id: string): void {
    const process = this.activeProcesses.get(id);
    if (!process) {
      return;
    }

    process.status = 'timedOut';
    process.endTime = new Date();

    this.emit('process:timedOut', {
      processId: id,
      process: { ...process },
    });

    this.scheduleCleanup(id);
  }

  /**
   * Kill a running process
   * @param id - Process identifier
   * @returns true if kill signal was sent
   */
  killProcess(id: string): boolean {
    const process = this.activeProcesses.get(id);
    if (!process) {
      return false;
    }

    if (process.pid && (process.status === 'running' || process.status === 'starting')) {
      try {
        // Use Node.js process.kill() to send signal to the process by PID
        kill(process.pid, 'SIGTERM');

        // Update process state
        process.killed = true;
        process.status = 'killed';
        process.endTime = new Date();

        this.emit('process:killed', {
          processId: id,
          process: { ...process },
        });

        this.scheduleCleanup(id);
        return true;
      } catch (error) {
        // Process may have already exited
        return false;
      }
    }

    return false;
  }

  /**
   * Get process by ID
   * @param id - Process identifier
   * @returns Process or undefined
   */
  getProcess(id: string): ActiveProcess | undefined {
    return this.activeProcesses.get(id);
  }

  /**
   * Get all processes for a user
   * @param userId - User identifier
   * @returns Array of processes
   */
  getUserProcesses(userId: string): ActiveProcess[] {
    return Array.from(this.activeProcesses.values()).filter(
      (p) => p.userId === userId
    );
  }

  /**
   * Get all active (running) processes
   * @returns Array of active processes
   */
  getActiveProcesses(): ActiveProcess[] {
    return Array.from(this.activeProcesses.values()).filter(
      (p) => p.status === 'running' || p.status === 'starting'
    );
  }

  /**
   * Get count of active processes for a user
   * @param userId - User identifier
   * @returns Process count
   */
  getUserProcessCount(userId: string): number {
    return Array.from(this.activeProcesses.values()).filter(
      (p) => p.userId === userId &&
           (p.status === 'running' || p.status === 'starting')
    ).length;
  }

  /**
   * Get all processes
   * @returns Array of all processes
   */
  getAllProcesses(): ActiveProcess[] {
    return Array.from(this.activeProcesses.values());
  }

  /**
   * Schedule cleanup for a completed process
   * @param id - Process identifier
   */
  private scheduleCleanup(id: string): void {
    setTimeout(() => {
      this.cleanup(id);
    }, this.retentionTimeMs);
  }

  /**
   * Remove process from tracking
   * @param id - Process identifier
   */
  cleanup(id: string): void {
    this.activeProcesses.delete(id);
  }

  /**
   * Force cleanup all processes (for shutdown)
   */
  cleanupAll(): void {
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Try to kill any running processes
    for (const [id, process] of this.activeProcesses.entries()) {
      if (process.status === 'running' || process.status === 'starting') {
        try {
          if (process.pid) {
            kill(process.pid, 'SIGTERM');
          }
        } catch {
          // Ignore errors during shutdown cleanup
        }
      }
    }
    this.activeProcesses.clear();
  }

  /**
   * Set up automatic cleanup interval
   * Runs every 5 minutes to clean up stale processes
   */
  private setupCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, process] of this.activeProcesses.entries()) {
        // Clean up processes that have been completed for > retention time
        if (process.endTime) {
          const age = now - process.endTime.getTime();
          if (age > this.retentionTimeMs) {
            this.cleanup(id);
          }
        }
        // Clean up orphaned processes (running for > 1 hour without completion)
        else if (process.startTime) {
          const age = now - process.startTime.getTime();
          if (age > 3600000) { // 1 hour
            this.cleanup(id);
          }
        }
      }
    }, 300000); // 5 minutes

    // Don't prevent process exit
    this.cleanupInterval.unref();
  }

  /**
   * Get process statistics
   */
  getStats(): {
    total: number;
    byStatus: Record<ProcessStatus, number>;
    byUser: Record<string, number>;
  } {
    const byStatus: Record<string, number> = {
      starting: 0,
      running: 0,
      completed: 0,
      failed: 0,
      killed: 0,
      timedOut: 0,
    };
    const byUser: Record<string, number> = {};

    for (const process of this.activeProcesses.values()) {
      byStatus[process.status]++;
      if (process.userId) {
        byUser[process.userId] = (byUser[process.userId] || 0) + 1;
      }
    }

    return {
      total: this.activeProcesses.size,
      byStatus: byStatus as Record<ProcessStatus, number>,
      byUser,
    };
  }
}

/**
 * Singleton instance for convenient import
 */
export const processManager = new ProcessManager();

/**
 * Default export
 */
export default ProcessManager;
