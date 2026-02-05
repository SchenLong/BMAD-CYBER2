/**
 * Incremental Builder
 * Epic 5.7 - Build Performance Optimization
 *
 * Intelligent incremental build system with dependency tracking,
 * file watching, and smart rebuilding strategies.
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BuildTarget {
  id: string;
  name: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  buildCommand: BuildCommand;
  options: BuildTargetOptions;
}

export interface BuildCommand {
  type: 'function' | 'shell' | 'task';
  handler?: (context: BuildContext) => Promise<BuildResult>;
  command?: string;
  args?: string[];
  cwd?: string;
}

export interface BuildTargetOptions {
  cache: boolean;
  parallel: boolean;
  timeout: number;
  retries: number;
  cleanOutputs: boolean;
  watchMode: boolean;
}

export interface BuildContext {
  target: BuildTarget;
  changedInputs: string[];
  allInputs: FileState[];
  previousBuild?: BuildRecord | undefined;
  environment: Record<string, string>;
  workspace: string;
}

export interface BuildResult {
  success: boolean;
  outputs: string[];
  duration: number;
  cached: boolean;
  error?: string | undefined;
  warnings: string[];
  logs: string[];
}

export interface FileState {
  path: string;
  hash: string;
  size: number;
  mtime: number;
  exists: boolean;
}

export interface BuildRecord {
  targetId: string;
  timestamp: number;
  inputHashes: Record<string, string>;
  outputHashes: Record<string, string>;
  duration: number;
  success: boolean;
  fromCache: boolean;
}

export interface DependencyNode {
  id: string;
  target: BuildTarget;
  dependencies: Set<string>;
  dependents: Set<string>;
  state: 'pending' | 'building' | 'completed' | 'failed' | 'skipped';
  buildOrder: number;
}

export interface IncrementalConfig {
  workspace: string;
  cacheDir: string;
  stateFile: string;
  watchDebounce: number;
  maxParallel: number;
  hashAlgorithm: 'md5' | 'sha1' | 'sha256';
  enableFileCaching: boolean;
  ignorePatterns: string[];
  forceRebuild: boolean;
}

export interface WatchEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: number;
}

export interface BuildPlan {
  targets: string[];
  order: string[];
  parallelGroups: string[][];
  skipped: string[];
  reason: Map<string, string>;
  estimatedDuration: number;
}

// ============================================================================
// Incremental Builder Implementation
// ============================================================================

export class IncrementalBuilder extends EventEmitter {
  private config: IncrementalConfig;
  private targets: Map<string, BuildTarget> = new Map();
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private buildHistory: Map<string, BuildRecord> = new Map();
  private fileStates: Map<string, FileState> = new Map();
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private watchQueue: WatchEvent[] = [];
  private watchTimer: NodeJS.Timeout | null = null;
  private isBuilding = false;
  // Reserved for future queued builds
  // private buildQueue: string[] = [];

  constructor(config: Partial<IncrementalConfig> = {}) {
    super();
    this.config = {
      workspace: process.cwd(),
      cacheDir: '.incremental-cache',
      stateFile: '.build-state.json',
      watchDebounce: 100,
      maxParallel: 4,
      hashAlgorithm: 'sha256',
      enableFileCaching: true,
      ignorePatterns: ['node_modules', '.git', '*.log'],
      forceRebuild: false,
      ...config
    };
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.ensureCacheDirectory();
    await this.loadBuildState();
    this.emit('initialized');
  }

  /**
   * Register a build target
   */
  public registerTarget(target: BuildTarget): void {
    this.targets.set(target.id, target);
    this.dependencyGraph.set(target.id, {
      id: target.id,
      target,
      dependencies: new Set(target.dependencies),
      dependents: new Set(),
      state: 'pending',
      buildOrder: -1
    });

    // Update dependent relationships
    for (const depId of target.dependencies) {
      const depNode = this.dependencyGraph.get(depId);
      if (depNode) {
        depNode.dependents.add(target.id);
      }
    }

    this.emit('target:registered', { targetId: target.id });
  }

  /**
   * Remove a build target
   */
  public unregisterTarget(targetId: string): boolean {
    if (!this.targets.has(targetId)) return false;

    this.targets.delete(targetId);
    const node = this.dependencyGraph.get(targetId);
    if (node) {
      for (const depId of node.dependencies) {
        const depNode = this.dependencyGraph.get(depId);
        if (depNode) depNode.dependents.delete(targetId);
      }
    }
    this.dependencyGraph.delete(targetId);

    return true;
  }

  /**
   * Build specific targets or all targets
   */
  public async build(targetIds?: string[]): Promise<Map<string, BuildResult>> {
    if (this.isBuilding) {
      throw new Error('Build already in progress');
    }

    this.isBuilding = true;
    const results = new Map<string, BuildResult>();

    try {
      const plan = await this.createBuildPlan(targetIds);
      this.emit('build:start', { plan });

      for (const group of plan.parallelGroups) {
        const groupResults = await this.buildParallelGroup(group);
        for (const [id, result] of groupResults) {
          results.set(id, result);
          if (!result.success) {
            const node = this.dependencyGraph.get(id);
            if (node) this.markDependentsFailed(node);
          }
        }
      }

      await this.saveBuildState();
      this.emit('build:complete', { results });
    } finally {
      this.isBuilding = false;
    }

    return results;
  }

  /**
   * Create an execution plan for the build
   */
  public async createBuildPlan(targetIds?: string[]): Promise<BuildPlan> {
    const targets = targetIds || Array.from(this.targets.keys());
    const plan: BuildPlan = {
      targets,
      order: [],
      parallelGroups: [],
      skipped: [],
      reason: new Map(),
      estimatedDuration: 0
    };

    // Reset node states
    for (const node of this.dependencyGraph.values()) {
      node.state = 'pending';
      node.buildOrder = -1;
    }

    // Compute file states
    await this.updateFileStates(targets);

    // Determine what needs rebuilding
    const needsRebuild = new Set<string>();
    for (const targetId of targets) {
      const node = this.dependencyGraph.get(targetId);
      if (!node) continue;

      const reason = await this.checkRebuildNeeded(node.target);
      if (reason) {
        needsRebuild.add(targetId);
        plan.reason.set(targetId, reason);
        // Add all dependents transitively
        this.addDependentsToRebuild(targetId, needsRebuild, plan.reason);
      } else {
        plan.skipped.push(targetId);
        plan.reason.set(targetId, 'up-to-date');
      }
    }

    // Topological sort with levels for parallelization
    const sorted = this.topologicalSort(Array.from(needsRebuild));
    plan.order = sorted;

    // Group by execution level
    plan.parallelGroups = this.computeParallelGroups(sorted);

    // Estimate duration
    for (const targetId of sorted) {
      const record = this.buildHistory.get(targetId);
      if (record) plan.estimatedDuration += record.duration;
      else plan.estimatedDuration += 5000; // Default estimate
    }

    return plan;
  }

  /**
   * Start watching for file changes
   */
  public startWatch(targetIds?: string[]): void {
    const targets = targetIds
      ? targetIds.map(id => this.targets.get(id)).filter(Boolean) as BuildTarget[]
      : Array.from(this.targets.values());

    const watchPaths = new Set<string>();
    for (const target of targets) {
      for (const input of target.inputs) {
        const resolved = path.resolve(this.config.workspace, input);
        if (input.includes('*')) {
          watchPaths.add(path.dirname(resolved));
        } else {
          watchPaths.add(resolved);
        }
      }
    }

    for (const watchPath of watchPaths) {
      if (this.watchers.has(watchPath)) continue;

      try {
        const watcher = fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (!filename || this.shouldIgnore(filename)) return;
          this.queueWatchEvent({
            type: eventType === 'rename' ? 'change' : 'change',
            path: path.join(watchPath, filename),
            timestamp: Date.now()
          });
        });

        this.watchers.set(watchPath, watcher);
        this.emit('watch:start', { path: watchPath });
      } catch (error) {
        this.emit('watch:error', { path: watchPath, error });
      }
    }
  }

  /**
   * Stop watching for file changes
   */
  public stopWatch(): void {
    for (const [watchPath, watcher] of this.watchers) {
      watcher.close();
      this.emit('watch:stop', { path: watchPath });
    }
    this.watchers.clear();

    if (this.watchTimer) {
      clearTimeout(this.watchTimer);
      this.watchTimer = null;
    }
  }

  /**
   * Get targets affected by specific files
   */
  public getAffectedTargets(files: string[]): string[] {
    const affected = new Set<string>();

    for (const [targetId, target] of this.targets) {
      for (const input of target.inputs) {
        const pattern = this.globToRegex(input);
        for (const file of files) {
          if (pattern.test(file)) {
            affected.add(targetId);
            // Add all dependents
            this.collectDependents(targetId, affected);
            break;
          }
        }
      }
    }

    return Array.from(affected);
  }

  /**
   * Force rebuild of specific targets
   */
  public async forceRebuild(targetIds: string[]): Promise<Map<string, BuildResult>> {
    // Clear build history for these targets
    for (const id of targetIds) {
      this.buildHistory.delete(id);
    }

    return this.build(targetIds);
  }

  /**
   * Get build status for all targets
   */
  public getStatus(): Map<string, { state: string; lastBuild?: BuildRecord | undefined }> {
    const status = new Map<string, { state: string; lastBuild?: BuildRecord | undefined }>();

    for (const [id, node] of this.dependencyGraph) {
      status.set(id, {
        state: node.state,
        lastBuild: this.buildHistory.get(id)
      });
    }

    return status;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async buildParallelGroup(targetIds: string[]): Promise<Map<string, BuildResult>> {
    const results = new Map<string, BuildResult>();
    const limitedTargets = targetIds.slice(0, this.config.maxParallel);

    const promises = limitedTargets.map(async (targetId) => {
      const result = await this.buildTarget(targetId);
      results.set(targetId, result);
    });

    await Promise.all(promises);

    // Handle remaining targets if any
    if (targetIds.length > this.config.maxParallel) {
      const remaining = await this.buildParallelGroup(targetIds.slice(this.config.maxParallel));
      for (const [id, result] of remaining) {
        results.set(id, result);
      }
    }

    return results;
  }

  private async buildTarget(targetId: string): Promise<BuildResult> {
    const target = this.targets.get(targetId);
    const node = this.dependencyGraph.get(targetId);

    if (!target || !node) {
      return { success: false, outputs: [], duration: 0, cached: false, error: 'Target not found', warnings: [], logs: [] };
    }

    // Check if dependencies failed
    for (const depId of node.dependencies) {
      const depNode = this.dependencyGraph.get(depId);
      if (depNode?.state === 'failed') {
        node.state = 'skipped';
        return { success: false, outputs: [], duration: 0, cached: false, error: 'Dependency failed', warnings: [], logs: [] };
      }
    }

    node.state = 'building';
    this.emit('target:start', { targetId });

    const startTime = Date.now();
    const changedInputs = await this.getChangedInputs(target);
    const allInputs = await this.getInputStates(target);

    const context: BuildContext = {
      target,
      changedInputs,
      allInputs,
      previousBuild: this.buildHistory.get(targetId),
      environment: process.env as Record<string, string>,
      workspace: this.config.workspace
    };

    let result: BuildResult;

    try {
      if (target.options.cleanOutputs) {
        await this.cleanOutputs(target);
      }

      result = await this.executeCommand(target.buildCommand, context);

      if (result.success) {
        node.state = 'completed';
        await this.recordBuild(target, result, allInputs);
      } else {
        node.state = 'failed';
      }
    } catch (error) {
      node.state = 'failed';
      result = {
        success: false,
        outputs: [],
        duration: Date.now() - startTime,
        cached: false,
        error: error instanceof Error ? error.message : String(error),
        warnings: [],
        logs: []
      };
    }

    result.duration = Date.now() - startTime;
    this.emit('target:complete', { targetId, result });

    return result;
  }

  private async executeCommand(command: BuildCommand, context: BuildContext): Promise<BuildResult> {
    const startTime = Date.now();

    if (command.type === 'function' && command.handler) {
      return command.handler(context);
    }

    if (command.type === 'shell' && command.command) {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        const args = command.args?.join(' ') || '';
        const fullCommand = `${command.command} ${args}`;
        const cwd = command.cwd || context.workspace;

        exec(fullCommand, { cwd, timeout: context.target.options.timeout }, (error: Error | null, stdout: string, stderr: string) => {
          resolve({
            success: !error,
            outputs: context.target.outputs,
            duration: Date.now() - startTime,
            cached: false,
            error: error?.message,
            warnings: stderr ? [stderr] : [],
            logs: stdout ? [stdout] : []
          });
        });
      });
    }

    return { success: false, outputs: [], duration: Date.now() - startTime, cached: false, error: 'Unknown command type', warnings: [], logs: [] };
  }

  private async checkRebuildNeeded(target: BuildTarget): Promise<string | null> {
    if (this.config.forceRebuild) return 'force rebuild';

    const record = this.buildHistory.get(target.id);
    if (!record) return 'no previous build';
    if (!record.success) return 'previous build failed';

    // Check input changes
    for (const input of target.inputs) {
      const files = await this.resolveGlob(input);
      for (const file of files) {
        const state = this.fileStates.get(file);
        const previousHash = record.inputHashes[file];
        if (!state?.exists) return `input deleted: ${file}`;
        if (!previousHash || state.hash !== previousHash) return `input changed: ${file}`;
      }
    }

    // Check output existence
    for (const output of target.outputs) {
      const resolved = path.resolve(this.config.workspace, output);
      try {
        await fs.promises.access(resolved);
      } catch {
        return `output missing: ${output}`;
      }
    }

    // Check dependency changes
    for (const depId of target.dependencies) {
      const depNode = this.dependencyGraph.get(depId);
      if (depNode?.state === 'completed') return `dependency rebuilt: ${depId}`;
    }

    return null;
  }

  private async getChangedInputs(target: BuildTarget): Promise<string[]> {
    const changed: string[] = [];
    const record = this.buildHistory.get(target.id);

    for (const input of target.inputs) {
      const files = await this.resolveGlob(input);
      for (const file of files) {
        const state = this.fileStates.get(file);
        const previousHash = record?.inputHashes[file];
        if (state && (!previousHash || state.hash !== previousHash)) {
          changed.push(file);
        }
      }
    }

    return changed;
  }

  private async getInputStates(target: BuildTarget): Promise<FileState[]> {
    const states: FileState[] = [];

    for (const input of target.inputs) {
      const files = await this.resolveGlob(input);
      for (const file of files) {
        const state = this.fileStates.get(file);
        if (state) states.push(state);
      }
    }

    return states;
  }

  private async updateFileStates(targetIds: string[]): Promise<void> {
    const filesToCheck = new Set<string>();

    for (const targetId of targetIds) {
      const target = this.targets.get(targetId);
      if (!target) continue;

      for (const input of target.inputs) {
        const files = await this.resolveGlob(input);
        files.forEach(f => filesToCheck.add(f));
      }
    }

    await Promise.all(
      Array.from(filesToCheck).map(async (file) => {
        const state = await this.computeFileState(file);
        this.fileStates.set(file, state);
      })
    );
  }

  private async computeFileState(filePath: string): Promise<FileState> {
    try {
      const stat = await fs.promises.stat(filePath);
      const content = await fs.promises.readFile(filePath);
      const hash = crypto.createHash(this.config.hashAlgorithm).update(content).digest('hex');

      return { path: filePath, hash, size: stat.size, mtime: stat.mtimeMs, exists: true };
    } catch {
      return { path: filePath, hash: '', size: 0, mtime: 0, exists: false };
    }
  }

  private async recordBuild(target: BuildTarget, result: BuildResult, inputs: FileState[]): Promise<void> {
    const inputHashes: Record<string, string> = {};
    for (const input of inputs) {
      inputHashes[input.path] = input.hash;
    }

    const outputHashes: Record<string, string> = {};
    for (const output of result.outputs) {
      const resolved = path.resolve(this.config.workspace, output);
      try {
        const content = await fs.promises.readFile(resolved);
        outputHashes[output] = crypto.createHash(this.config.hashAlgorithm).update(content).digest('hex');
      } catch {
        // Output might not exist
      }
    }

    this.buildHistory.set(target.id, {
      targetId: target.id,
      timestamp: Date.now(),
      inputHashes,
      outputHashes,
      duration: result.duration,
      success: result.success,
      fromCache: result.cached
    });
  }

  private async cleanOutputs(target: BuildTarget): Promise<void> {
    for (const output of target.outputs) {
      const resolved = path.resolve(this.config.workspace, output);
      try {
        await fs.promises.unlink(resolved);
      } catch {
        // File might not exist
      }
    }
  }

  private topologicalSort(targetIds: string[]): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      if (visiting.has(id)) throw new Error(`Circular dependency detected: ${id}`);

      visiting.add(id);
      const node = this.dependencyGraph.get(id);
      if (node) {
        for (const depId of node.dependencies) {
          if (targetIds.includes(depId)) visit(depId);
        }
      }
      visiting.delete(id);
      visited.add(id);
      result.push(id);
    };

    for (const id of targetIds) {
      visit(id);
    }

    return result;
  }

  private computeParallelGroups(sorted: string[]): string[][] {
    const groups: string[][] = [];
    const levels = new Map<string, number>();

    for (const id of sorted) {
      const node = this.dependencyGraph.get(id);
      let level = 0;

      if (node) {
        for (const depId of node.dependencies) {
          const depLevel = levels.get(depId);
          if (depLevel !== undefined) {
            level = Math.max(level, depLevel + 1);
          }
        }
      }

      levels.set(id, level);

      while (groups.length <= level) {
        groups.push([]);
      }
      const group = groups[level];
      if (group) {
        group.push(id);
      }
    }

    return groups;
  }

  private addDependentsToRebuild(targetId: string, needsRebuild: Set<string>, reasons: Map<string, string>): void {
    const node = this.dependencyGraph.get(targetId);
    if (!node) return;

    for (const depId of node.dependents) {
      if (!needsRebuild.has(depId)) {
        needsRebuild.add(depId);
        reasons.set(depId, `dependency changed: ${targetId}`);
        this.addDependentsToRebuild(depId, needsRebuild, reasons);
      }
    }
  }

  private collectDependents(targetId: string, collected: Set<string>): void {
    const node = this.dependencyGraph.get(targetId);
    if (!node) return;

    for (const depId of node.dependents) {
      if (!collected.has(depId)) {
        collected.add(depId);
        this.collectDependents(depId, collected);
      }
    }
  }

  private markDependentsFailed(node: DependencyNode): void {
    for (const depId of node.dependents) {
      const depNode = this.dependencyGraph.get(depId);
      if (depNode && depNode.state === 'pending') {
        depNode.state = 'skipped';
        this.markDependentsFailed(depNode);
      }
    }
  }

  private queueWatchEvent(event: WatchEvent): void {
    this.watchQueue.push(event);

    if (this.watchTimer) clearTimeout(this.watchTimer);
    this.watchTimer = setTimeout(async () => {
      const events = [...this.watchQueue];
      this.watchQueue = [];

      const files = [...new Set(events.map(e => e.path))];
      const affected = this.getAffectedTargets(files);

      if (affected.length > 0) {
        this.emit('watch:change', { files, affected });
        if (!this.isBuilding) {
          await this.build(affected);
        }
      }
    }, this.config.watchDebounce);
  }

  private shouldIgnore(filename: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      if (this.globToRegex(pattern).test(filename)) return true;
    }
    return false;
  }

  private globToRegex(glob: string): RegExp {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }

  private async resolveGlob(pattern: string): Promise<string[]> {
    const resolved = path.resolve(this.config.workspace, pattern);
    if (!pattern.includes('*')) return [resolved];

    const dir = path.dirname(resolved);
    const regex = this.globToRegex(path.basename(pattern));

    try {
      const files = await fs.promises.readdir(dir);
      return files.filter(f => regex.test(f)).map(f => path.join(dir, f));
    } catch {
      return [];
    }
  }

  private async ensureCacheDirectory(): Promise<void> {
    await fs.promises.mkdir(this.config.cacheDir, { recursive: true });
  }

  private async loadBuildState(): Promise<void> {
    try {
      const statePath = path.join(this.config.cacheDir, this.config.stateFile);
      const content = await fs.promises.readFile(statePath, 'utf-8');
      const state = JSON.parse(content);
      for (const [id, record] of Object.entries(state.buildHistory || {})) {
        this.buildHistory.set(id, record as BuildRecord);
      }
    } catch {
      // No previous state
    }
  }

  private async saveBuildState(): Promise<void> {
    const state = { buildHistory: Object.fromEntries(this.buildHistory) };
    const statePath = path.join(this.config.cacheDir, this.config.stateFile);
    await fs.promises.writeFile(statePath, JSON.stringify(state, null, 2));
  }

  public destroy(): void {
    this.stopWatch();
    this.emit('destroy');
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

let defaultBuilder: IncrementalBuilder | null = null;

export function getDefaultBuilder(config?: Partial<IncrementalConfig>): IncrementalBuilder {
  if (!defaultBuilder) defaultBuilder = new IncrementalBuilder(config);
  return defaultBuilder;
}

export function createBuilder(config?: Partial<IncrementalConfig>): IncrementalBuilder {
  return new IncrementalBuilder(config);
}

export default IncrementalBuilder;
