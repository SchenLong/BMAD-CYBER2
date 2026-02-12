/**
 * Parallel Build Coordinator
 * Epic 5.7 - Build Performance Optimization
 *
 * Orchestrates parallel build execution with intelligent work distribution,
 * resource management, and dependency-aware scheduling.
 */

import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import * as os from 'os';
import * as crypto from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BuildTask {
  id: string;
  name: string;
  priority: number;
  dependencies: string[];
  estimatedDuration: number;
  resourceRequirements: ResourceRequirements;
  executor: TaskExecutor;
  metadata: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
}

export interface ResourceRequirements {
  cpuCores: number;
  memoryMB: number;
  diskMB: number;
  gpuRequired: boolean;
  networkRequired: boolean;
  exclusiveResources: string[];
}

export interface TaskExecutor {
  type: 'inline' | 'worker' | 'process' | 'remote';
  handler?: (context: TaskContext) => Promise<TaskResult>;
  workerScript?: string;
  processCommand?: string;
  remoteEndpoint?: string;
}

export interface TaskContext {
  taskId: string;
  workerId: string;
  inputs: Record<string, unknown>;
  environment: Record<string, string>;
  workspace: string;
  timeout: number;
  signal: AbortSignal;
}

export interface TaskResult {
  success: boolean;
  outputs: Record<string, unknown>;
  duration: number;
  error?: string;
  logs: string[];
  metrics: TaskMetrics;
}

export interface TaskMetrics {
  cpuTime: number;
  memoryPeak: number;
  ioOperations: number;
  networkTransferred: number;
}

export interface WorkerState {
  id: string;
  status: 'idle' | 'busy' | 'error' | 'terminated';
  currentTask: string | null;
  tasksCompleted: number;
  totalDuration: number;
  worker: Worker | null;
  resources: ResourceUsage;
  lastHeartbeat: number;
}

export interface ResourceUsage {
  cpuPercent: number;
  memoryUsed: number;
  diskUsed: number;
}

export interface SchedulerState {
  pending: string[];
  running: Map<string, { taskId: string; workerId: string; startTime: number }>;
  completed: Map<string, TaskResult>;
  failed: Map<string, TaskResult>;
  blocked: Set<string>;
}

export interface CoordinatorConfig {
  maxWorkers: number;
  maxConcurrentTasks: number;
  taskTimeout: number;
  workerIdleTimeout: number;
  enableLoadBalancing: boolean;
  schedulingStrategy: 'fifo' | 'priority' | 'shortest-first' | 'critical-path';
  enableWorkStealing: boolean;
  healthCheckInterval: number;
  resourceLimits: ResourceRequirements;
  enableMetrics: boolean;
}

export interface CoordinatorStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeWorkers: number;
  averageTaskDuration: number;
  throughput: number;
  resourceUtilization: number;
  queueDepth: number;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  criticalPath: string[];
  estimatedDuration: number;
  parallelism: number;
}

export interface ExecutionPhase {
  id: string;
  tasks: string[];
  dependencies: string[];
  estimatedDuration: number;
}

// ============================================================================
// Parallel Coordinator Implementation
// ============================================================================

export class ParallelCoordinator extends EventEmitter {
  private config: CoordinatorConfig;
  private tasks: Map<string, BuildTask> = new Map();
  private workers: Map<string, WorkerState> = new Map();
  private state: SchedulerState;
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private reverseDependencyGraph: Map<string, Set<string>> = new Map();
  private abortController: AbortController | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private stats: CoordinatorStats;
  private isRunning = false;

  constructor(config: Partial<CoordinatorConfig> = {}) {
    super();
    this.config = {
      maxWorkers: Math.max(1, os.cpus().length - 1),
      maxConcurrentTasks: os.cpus().length * 2,
      taskTimeout: 300000, // 5 minutes
      workerIdleTimeout: 60000, // 1 minute
      enableLoadBalancing: true,
      schedulingStrategy: 'priority',
      enableWorkStealing: true,
      healthCheckInterval: 5000,
      resourceLimits: {
        cpuCores: os.cpus().length,
        memoryMB: Math.floor(os.totalmem() / (1024 * 1024) * 0.8),
        diskMB: 10000,
        gpuRequired: false,
        networkRequired: false,
        exclusiveResources: []
      },
      enableMetrics: true,
      ...config
    };
    this.state = this.createInitialState();
    this.stats = this.createEmptyStats();
  }

  /**
   * Add a task to the coordinator
   */
  public addTask(task: BuildTask): void {
    this.tasks.set(task.id, task);
    this.dependencyGraph.set(task.id, new Set(task.dependencies));

    for (const depId of task.dependencies) {
      if (!this.reverseDependencyGraph.has(depId)) {
        this.reverseDependencyGraph.set(depId, new Set());
      }
      this.reverseDependencyGraph.get(depId)!.add(task.id);
    }

    this.emit('task:added', { taskId: task.id });
  }

  /**
   * Add multiple tasks
   */
  public addTasks(tasks: BuildTask[]): void {
    for (const task of tasks) {
      this.addTask(task);
    }
  }

  /**
   * Remove a task
   */
  public removeTask(taskId: string): boolean {
    if (!this.tasks.has(taskId)) return false;

    const task = this.tasks.get(taskId)!;
    this.tasks.delete(taskId);
    this.dependencyGraph.delete(taskId);

    for (const depId of task.dependencies) {
      this.reverseDependencyGraph.get(depId)?.delete(taskId);
    }

    return true;
  }

  /**
   * Start parallel execution
   */
  public async execute(taskIds?: string[]): Promise<Map<string, TaskResult>> {
    if (this.isRunning) {
      throw new Error('Execution already in progress');
    }

    this.isRunning = true;
    this.abortController = new AbortController();
    this.state = this.createInitialState();

    try {
      // Initialize workers
      await this.initializeWorkers();

      // Build execution plan
      const tasksToRun = taskIds || Array.from(this.tasks.keys());
      const plan = this.createExecutionPlan(tasksToRun);
      this.emit('execution:start', { plan, taskCount: tasksToRun.length });

      // Initialize pending queue
      this.state.pending = this.sortTasks(tasksToRun);
      this.stats.totalTasks = tasksToRun.length;

      // Start health monitoring
      this.startHealthCheck();

      // Main execution loop
      await this.runExecutionLoop();

      // Collect results
      const results = new Map<string, TaskResult>();
      for (const [id, result] of this.state.completed) {
        results.set(id, result);
      }
      for (const [id, result] of this.state.failed) {
        results.set(id, result);
      }

      this.emit('execution:complete', { results, stats: this.stats });
      return results;
    } finally {
      this.isRunning = false;
      this.stopHealthCheck();
      await this.terminateWorkers();
    }
  }

  /**
   * Cancel execution
   */
  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.emit('execution:cancelled');
    }
  }

  /**
   * Create execution plan
   */
  public createExecutionPlan(taskIds: string[]): ExecutionPlan {
    const phases: ExecutionPhase[] = [];
    const processed = new Set<string>();
    const criticalPath: string[] = [];
    let totalDuration = 0;

    // Group tasks by dependency level
    let currentLevel: string[] = [];
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (!task) continue;

      const deps = task.dependencies.filter(d => taskIds.includes(d));
      if (deps.length === 0) {
        currentLevel.push(taskId);
      }
    }

    let phaseNum = 0;
    while (currentLevel.length > 0 || processed.size < taskIds.length) {
      if (currentLevel.length > 0) {
        const phaseDuration = Math.max(
          ...currentLevel.map(id => this.tasks.get(id)?.estimatedDuration || 0)
        );
        totalDuration += phaseDuration;

        phases.push({
          id: `phase_${phaseNum++}`,
          tasks: [...currentLevel],
          dependencies: phases.length > 0 ? [phases[phases.length - 1]!.id] : [],
          estimatedDuration: phaseDuration
        });

        currentLevel.forEach(id => processed.add(id));
      }

      // Find next level
      const nextLevel: string[] = [];
      for (const taskId of taskIds) {
        if (processed.has(taskId)) continue;

        const task = this.tasks.get(taskId);
        if (!task) continue;

        const deps = task.dependencies.filter(d => taskIds.includes(d));
        if (deps.every(d => processed.has(d))) {
          nextLevel.push(taskId);
        }
      }

      currentLevel = nextLevel;
    }

    // Find critical path
    const pathDurations = new Map<string, number>();
    for (const phase of phases.reverse()) {
      for (const taskId of phase.tasks) {
        const task = this.tasks.get(taskId)!;
        const dependentDurations = Array.from(this.reverseDependencyGraph.get(taskId) || [])
          .map(d => pathDurations.get(d) || 0);
        pathDurations.set(taskId, task.estimatedDuration + Math.max(0, ...dependentDurations));
      }
    }

    // Trace back critical path
    let current = Array.from(pathDurations.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    while (current) {
      criticalPath.unshift(current);
      const deps = this.dependencyGraph.get(current) || new Set();
      current = Array.from(deps)
        .map(d => [d, pathDurations.get(d) || 0] as [string, number])
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    return {
      phases: phases.reverse(),
      criticalPath,
      estimatedDuration: totalDuration,
      parallelism: Math.max(...phases.map(p => p.tasks.length))
    };
  }

  /**
   * Get coordinator statistics
   */
  public getStats(): CoordinatorStats {
    return { ...this.stats };
  }

  /**
   * Get task status
   */
  public getTaskStatus(taskId: string): 'pending' | 'running' | 'completed' | 'failed' | 'blocked' | 'unknown' {
    if (this.state.completed.has(taskId)) return 'completed';
    if (this.state.failed.has(taskId)) return 'failed';
    if (this.state.running.has(taskId)) return 'running';
    if (this.state.blocked.has(taskId)) return 'blocked';
    if (this.state.pending.includes(taskId)) return 'pending';
    return 'unknown';
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async initializeWorkers(): Promise<void> {
    const workerCount = Math.min(this.config.maxWorkers, this.tasks.size);

    for (let i = 0; i < workerCount; i++) {
      const workerId = `worker_${crypto.randomBytes(4).toString('hex')}`;
      const workerState: WorkerState = {
        id: workerId,
        status: 'idle',
        currentTask: null,
        tasksCompleted: 0,
        totalDuration: 0,
        worker: null,
        resources: { cpuPercent: 0, memoryUsed: 0, diskUsed: 0 },
        lastHeartbeat: Date.now()
      };

      this.workers.set(workerId, workerState);
      this.emit('worker:created', { workerId });
    }

    this.stats.activeWorkers = workerCount;
  }

  private async terminateWorkers(): Promise<void> {
    for (const [_workerId, state] of this.workers) {
      if (state.worker) {
        state.worker.terminate();
      }
      state.status = 'terminated';
    }
    this.workers.clear();
    this.stats.activeWorkers = 0;
  }

  private async runExecutionLoop(): Promise<void> {
    while (!this.isExecutionComplete() && !this.abortController?.signal.aborted) {
      // Schedule ready tasks to available workers
      await this.scheduleReadyTasks();

      // Wait for any task to complete or timeout
      await this.waitForProgress();
    }
  }

  private isExecutionComplete(): boolean {
    return this.state.pending.length === 0 &&
           this.state.running.size === 0 &&
           this.state.blocked.size === 0;
  }

  private async scheduleReadyTasks(): Promise<void> {
    const readyTasks = this.getReadyTasks();
    const availableWorkers = this.getAvailableWorkers();

    for (const taskId of readyTasks) {
      if (availableWorkers.length === 0) break;

      const task = this.tasks.get(taskId)!;
      const worker = this.selectWorker(availableWorkers, task);

      if (worker && this.canAllocateResources(task.resourceRequirements)) {
        await this.assignTaskToWorker(taskId, worker.id);
        availableWorkers.splice(availableWorkers.indexOf(worker), 1);
      }
    }
  }

  private getReadyTasks(): string[] {
    const ready: string[] = [];

    for (const taskId of this.state.pending) {
      const deps = this.dependencyGraph.get(taskId) || new Set();
      const allDepsComplete = Array.from(deps).every(
        d => this.state.completed.has(d) || !this.tasks.has(d)
      );

      if (allDepsComplete) {
        ready.push(taskId);
      } else {
        // Check if any dependency failed
        const anyDepFailed = Array.from(deps).some(d => this.state.failed.has(d));
        if (anyDepFailed) {
          this.state.blocked.add(taskId);
          this.state.pending = this.state.pending.filter(id => id !== taskId);
        }
      }
    }

    return ready;
  }

  private getAvailableWorkers(): WorkerState[] {
    return Array.from(this.workers.values()).filter(w => w.status === 'idle');
  }

  private selectWorker(available: WorkerState[], _task: BuildTask): WorkerState | null {
    if (available.length === 0) return null;

    if (this.config.enableLoadBalancing) {
      // Select worker with lowest total duration (least loaded)
      return available.sort((a, b) => a.totalDuration - b.totalDuration)[0] ?? null;
    }

    return available[0] ?? null;
  }

  private canAllocateResources(requirements: ResourceRequirements): boolean {
    const currentUsage = this.calculateCurrentResourceUsage();

    return (
      currentUsage.cpuPercent + (requirements.cpuCores / this.config.resourceLimits.cpuCores * 100) <= 100 &&
      currentUsage.memoryUsed + requirements.memoryMB <= this.config.resourceLimits.memoryMB
    );
  }

  private calculateCurrentResourceUsage(): ResourceUsage {
    let totalCpu = 0;
    let totalMemory = 0;

    for (const worker of this.workers.values()) {
      if (worker.status === 'busy') {
        totalCpu += worker.resources.cpuPercent;
        totalMemory += worker.resources.memoryUsed;
      }
    }

    return { cpuPercent: totalCpu, memoryUsed: totalMemory, diskUsed: 0 };
  }

  private async assignTaskToWorker(taskId: string, workerId: string): Promise<void> {
    const worker = this.workers.get(workerId)!;

    // Update state
    this.state.pending = this.state.pending.filter(id => id !== taskId);
    this.state.running.set(taskId, {
      taskId,
      workerId,
      startTime: Date.now()
    });
    worker.status = 'busy';
    worker.currentTask = taskId;

    this.emit('task:start', { taskId, workerId });

    // Execute task asynchronously
    this.executeTask(taskId, workerId).catch(error => {
      this.handleTaskError(taskId, workerId, error);
    });
  }

  private async executeTask(taskId: string, workerId: string): Promise<void> {
    const task = this.tasks.get(taskId)!;
    const startTime = Date.now();

    const context: TaskContext = {
      taskId,
      workerId,
      inputs: task.metadata,
      environment: process.env as Record<string, string>,
      workspace: process.cwd(),
      timeout: this.config.taskTimeout,
      signal: this.abortController!.signal
    };

    let result: TaskResult;

    try {
      if (task.executor.type === 'inline' && task.executor.handler) {
        result = await Promise.race([
          task.executor.handler(context),
          this.createTimeoutPromise(this.config.taskTimeout, taskId)
        ]);
      } else if (task.executor.type === 'worker' && task.executor.workerScript) {
        result = await this.executeInWorker(task, context);
      } else {
        result = await this.executeDefault(task, context);
      }
    } catch (error) {
      result = {
        success: false,
        outputs: {},
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        logs: [],
        metrics: { cpuTime: 0, memoryPeak: 0, ioOperations: 0, networkTransferred: 0 }
      };
    }

    this.handleTaskComplete(taskId, workerId, result);
  }

  private async executeInWorker(task: BuildTask, context: TaskContext): Promise<TaskResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(task.executor.workerScript!, {
        workerData: { task, context }
      });

      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Worker timeout'));
      }, this.config.taskTimeout);

      worker.on('message', (result: TaskResult) => {
        clearTimeout(timeout);
        resolve(result);
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      worker.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`Worker exited with code ${code}`));
        }
      });
    });
  }

  private async executeDefault(task: BuildTask, _context: TaskContext): Promise<TaskResult> {
    const startTime = Date.now();
    return {
      success: true,
      outputs: {},
      duration: Date.now() - startTime,
      logs: [`Task ${task.id} executed with default handler`],
      metrics: { cpuTime: 0, memoryPeak: 0, ioOperations: 0, networkTransferred: 0 }
    };
  }

  private createTimeoutPromise(timeout: number, taskId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Task ${taskId} timed out`)), timeout);
    });
  }

  private handleTaskComplete(taskId: string, workerId: string, result: TaskResult): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.status = 'idle';
      worker.currentTask = null;
      worker.tasksCompleted++;
      worker.totalDuration += result.duration;
    }

    this.state.running.delete(taskId);

    if (result.success) {
      this.state.completed.set(taskId, result);
      this.stats.completedTasks++;
      this.emit('task:complete', { taskId, workerId, result });
    } else {
      const task = this.tasks.get(taskId);
      if (task && task.retryCount < task.maxRetries) {
        task.retryCount++;
        this.state.pending.push(taskId);
        this.emit('task:retry', { taskId, attempt: task.retryCount });
      } else {
        this.state.failed.set(taskId, result);
        this.stats.failedTasks++;
        this.markDependentsBlocked(taskId);
        this.emit('task:failed', { taskId, workerId, result });
      }
    }

    this.updateStats(result.duration);
  }

  private handleTaskError(taskId: string, workerId: string, error: Error): void {
    const result: TaskResult = {
      success: false,
      outputs: {},
      duration: 0,
      error: error.message,
      logs: [],
      metrics: { cpuTime: 0, memoryPeak: 0, ioOperations: 0, networkTransferred: 0 }
    };
    this.handleTaskComplete(taskId, workerId, result);
  }

  private markDependentsBlocked(taskId: string): void {
    const dependents = this.reverseDependencyGraph.get(taskId) || new Set();
    for (const depId of dependents) {
      if (this.state.pending.includes(depId)) {
        this.state.pending = this.state.pending.filter(id => id !== depId);
        this.state.blocked.add(depId);
        this.markDependentsBlocked(depId);
      }
    }
  }

  private async waitForProgress(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  private sortTasks(taskIds: string[]): string[] {
    switch (this.config.schedulingStrategy) {
      case 'priority':
        return taskIds.sort((a, b) => {
          const taskA = this.tasks.get(a);
          const taskB = this.tasks.get(b);
          return (taskB?.priority || 0) - (taskA?.priority || 0);
        });
      case 'shortest-first':
        return taskIds.sort((a, b) => {
          const taskA = this.tasks.get(a);
          const taskB = this.tasks.get(b);
          return (taskA?.estimatedDuration || 0) - (taskB?.estimatedDuration || 0);
        });
      case 'critical-path': {
        const plan = this.createExecutionPlan(taskIds);
        return plan.phases.flatMap(p => p.tasks);
      }
      default:
        return taskIds;
    }
  }

  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private performHealthCheck(): void {
    const now = Date.now();

    for (const [workerId, worker] of this.workers) {
      if (worker.status === 'busy' && now - worker.lastHeartbeat > this.config.taskTimeout) {
        worker.status = 'error';
        this.emit('worker:timeout', { workerId });

        if (worker.currentTask) {
          this.handleTaskError(worker.currentTask, workerId, new Error('Worker timeout'));
        }
      }
    }
  }

  private updateStats(duration: number): void {
    const total = this.stats.completedTasks + this.stats.failedTasks;
    this.stats.averageTaskDuration = (
      (this.stats.averageTaskDuration * (total - 1) + duration) / total
    );
    this.stats.throughput = total / ((Date.now() - (this.state.running.values().next().value?.startTime || Date.now())) / 1000);
    this.stats.queueDepth = this.state.pending.length;
    this.stats.resourceUtilization = this.calculateCurrentResourceUsage().cpuPercent;
  }

  private createInitialState(): SchedulerState {
    return { pending: [], running: new Map(), completed: new Map(), failed: new Map(), blocked: new Set() };
  }

  private createEmptyStats(): CoordinatorStats {
    return { totalTasks: 0, completedTasks: 0, failedTasks: 0, activeWorkers: 0, averageTaskDuration: 0, throughput: 0, resourceUtilization: 0, queueDepth: 0 };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

let defaultCoordinator: ParallelCoordinator | null = null;

export function getDefaultCoordinator(config?: Partial<CoordinatorConfig>): ParallelCoordinator {
  if (!defaultCoordinator) defaultCoordinator = new ParallelCoordinator(config);
  return defaultCoordinator;
}

export function createCoordinator(config?: Partial<CoordinatorConfig>): ParallelCoordinator {
  return new ParallelCoordinator(config);
}

export default ParallelCoordinator;
