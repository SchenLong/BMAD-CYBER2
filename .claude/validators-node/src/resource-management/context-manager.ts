/**
 * BMAD Validators - Context Manager
 * ==================================
 * Context window tracking and management for Claude Code.
 * Prevents context overflow (OWASP LLM04).
 *
 * Features:
 * - Token estimation for operations
 * - Context usage tracking
 * - Warning/block thresholds
 * - Actionable suggestions when approaching limits
 * - Persistent state across validator invocations
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getProjectDir } from '../common/path-utils.js';
import { AuditLogger } from '../common/audit-logger.js';
import { getToolInputFromStdinSync } from '../common/stdin-parser.js';
import { EXIT_CODES } from '../types/index.js';

// Try to import telemetry (graceful fallback)
let recordResourceUsage: ((params: {
  contextTokensUsed: number;
  contextTokensMax: number;
  contextStatus: 'ok' | 'warning' | 'critical' | 'blocked';
}) => boolean) | null = null;

try {
  const telemetry = await import('../observability/telemetry.js');
  recordResourceUsage = telemetry.recordResourceUsage;
} catch {
  // Telemetry not available
}

// Configuration from environment
const MAX_CONTEXT_TOKENS = parseInt(process.env['BMAD_MAX_CONTEXT_TOKENS'] || '200000', 10);
const WARNING_THRESHOLD = parseFloat(process.env['BMAD_CONTEXT_WARNING'] || '0.75');
const BLOCK_THRESHOLD = parseFloat(process.env['BMAD_CONTEXT_BLOCK'] || '0.95');

// Token estimation constants
const CHARS_PER_TOKEN = 4;
const BYTES_PER_TOKEN = 3.5;
const BASE_OVERHEAD_TOKENS = 500;
const MAX_OPERATIONS_HISTORY = 100;

// State reset after inactivity
const STATE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

// File type multipliers for token estimation
const FILE_TYPE_MULTIPLIERS: Record<string, number> = {
  '.json': 1.2,
  '.xml': 1.3,
  '.yaml': 1.0,
  '.yml': 1.0,
  '.py': 1.0,
  '.js': 1.0,
  '.ts': 1.0,
  '.tsx': 1.0,
  '.jsx': 1.0,
  '.md': 0.9,
  '.txt': 0.9,
  '.css': 1.1,
  '.html': 1.2,
  '.scss': 1.1,
  '.less': 1.1,
};

// Interfaces
export interface TokenEstimate {
  tokens: number;
  source: 'file' | 'text' | 'command' | 'web' | 'agent';
  path?: string;
  truncated: boolean;
  originalTokens?: number;
}

export interface ContextStatus {
  status: 'ok' | 'warning' | 'critical' | 'blocked';
  percentage: number;
  tokensUsed: number;
  tokensRemaining: number;
  maxTokens: number;
  message?: string | undefined;
}

export interface OperationRecord {
  tool: string;
  tokens: number;
  timestamp: number;
}

export interface ContextState {
  sessionId: string;
  tokensUsed: number;
  operations: OperationRecord[];
  warningsIssued: number;
  lastUpdate: number;
  createdAt: number;
}

/**
 * Context manager for tracking and managing context window usage.
 */
export class ContextManager {
  private stateFile: string;
  private projectDir: string;

  constructor() {
    this.projectDir = getProjectDir();
    const claudeDir = path.join(this.projectDir, '.claude');

    // Ensure directory exists
    fs.mkdirSync(claudeDir, { recursive: true });

    this.stateFile = path.join(claudeDir, '.context_state.json');
  }

  /**
   * Load state from file.
   */
  private loadState(): ContextState {
    try {
      if (fs.existsSync(this.stateFile)) {
        const content = fs.readFileSync(this.stateFile, 'utf-8');
        const state = JSON.parse(content) as ContextState;

        // Auto-reset if state is too old
        if (Date.now() - state.lastUpdate > STATE_TIMEOUT_MS) {
          return this.initialState();
        }

        return state;
      }
    } catch {
      // Return initial state on error
    }
    return this.initialState();
  }

  /**
   * Get initial empty state.
   */
  private initialState(): ContextState {
    const now = Date.now();
    return {
      sessionId: process.env['CLAUDE_SESSION_ID'] || String(now),
      tokensUsed: 0,
      operations: [],
      warningsIssued: 0,
      lastUpdate: now,
      createdAt: now,
    };
  }

  /**
   * Save state atomically.
   */
  private saveState(state: ContextState): void {
    state.lastUpdate = Date.now();

    const dir = path.dirname(this.stateFile);
    const tempFile = path.join(dir, `.context_${Date.now()}_${Math.random().toString(36).slice(2)}`);

    try {
      fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
      fs.renameSync(tempFile, this.stateFile);
    } catch (e) {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }
      throw e;
    }
  }

  /**
   * Estimate tokens from text.
   */
  estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN));
  }

  /**
   * Estimate tokens for a file.
   */
  estimateFileTokens(filePath: string): TokenEstimate {
    try {
      const absPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.projectDir, filePath);

      if (!fs.existsSync(absPath)) {
        return {
          tokens: 0,
          source: 'file',
          path: filePath,
          truncated: false,
        };
      }

      const stats = fs.statSync(absPath);
      const ext = path.extname(filePath).toLowerCase();
      const multiplier = FILE_TYPE_MULTIPLIERS[ext] || 1.0;

      const tokens = Math.ceil((stats.size / BYTES_PER_TOKEN) * multiplier);

      return {
        tokens,
        source: 'file',
        path: filePath,
        truncated: false,
      };
    } catch {
      return {
        tokens: 0,
        source: 'file',
        path: filePath,
        truncated: false,
      };
    }
  }

  /**
   * Estimate tokens for a tool operation.
   */
  estimateOperationTokens(toolName: string, toolInput: Record<string, unknown>): TokenEstimate {
    let tokens = BASE_OVERHEAD_TOKENS;
    let source: TokenEstimate['source'] = 'text';

    switch (toolName.toLowerCase()) {
      case 'read': {
        const filePath = (toolInput.file_path as string) || '';
        const fileEstimate = this.estimateFileTokens(filePath);
        tokens += fileEstimate.tokens;
        source = 'file';
        return {
          tokens,
          source,
          path: filePath,
          truncated: false,
        };
      }

      case 'write':
      case 'edit': {
        const content = (toolInput.content as string) || (toolInput.new_string as string) || '';
        tokens += this.estimateTokens(content);
        source = 'text';
        break;
      }

      case 'bash': {
        const command = (toolInput.command as string) || '';
        tokens += this.estimateTokens(command);
        tokens += 500; // Estimated output
        source = 'command';
        break;
      }

      case 'glob':
      case 'grep': {
        tokens += 1000; // Conservative result estimate
        source = 'text';
        break;
      }

      case 'webfetch':
      case 'websearch': {
        tokens += 2000; // Web content tends to be large
        source = 'web';
        break;
      }

      case 'task': {
        const prompt = (toolInput.prompt as string) || '';
        tokens += this.estimateTokens(prompt);
        tokens += 5000; // Agent overhead
        source = 'agent';
        break;
      }

      default: {
        tokens += 500;
        break;
      }
    }

    return {
      tokens,
      source,
      truncated: false,
    };
  }

  /**
   * Record an operation.
   */
  recordOperation(toolName: string, tokens: number): void {
    const state = this.loadState();

    state.tokensUsed += tokens;
    state.operations.push({
      tool: toolName,
      tokens,
      timestamp: Date.now(),
    });

    // Keep only last MAX_OPERATIONS_HISTORY operations
    if (state.operations.length > MAX_OPERATIONS_HISTORY) {
      state.operations = state.operations.slice(-MAX_OPERATIONS_HISTORY);
    }

    this.saveState(state);
  }

  /**
   * Check current context capacity.
   */
  checkCapacity(): ContextStatus {
    const state = this.loadState();
    const tokensUsed = state.tokensUsed;
    const percentage = tokensUsed / MAX_CONTEXT_TOKENS;
    const tokensRemaining = MAX_CONTEXT_TOKENS - tokensUsed;

    let status: ContextStatus['status'] = 'ok';
    let message: string | undefined;

    if (percentage >= BLOCK_THRESHOLD) {
      status = 'blocked';
      message = `Context window at ${(percentage * 100).toFixed(1)}% capacity. Operations blocked.`;
    } else if (percentage >= WARNING_THRESHOLD) {
      status = 'warning';
      message = `Context window at ${(percentage * 100).toFixed(1)}% capacity. Consider summarizing.`;

      // Track warnings
      state.warningsIssued += 1;
      this.saveState(state);
    }

    // Record telemetry
    if (recordResourceUsage) {
      recordResourceUsage({
        contextTokensUsed: tokensUsed,
        contextTokensMax: MAX_CONTEXT_TOKENS,
        contextStatus: status,
      });
    }

    return {
      status,
      percentage,
      tokensUsed,
      tokensRemaining,
      maxTokens: MAX_CONTEXT_TOKENS,
      message,
    };
  }

  /**
   * Check if operation can be accommodated.
   */
  canAccommodate(estimatedTokens: number): [boolean, string] {
    const state = this.loadState();
    const projectedTokens = state.tokensUsed + estimatedTokens;
    const projectedPercentage = projectedTokens / MAX_CONTEXT_TOKENS;

    if (projectedPercentage >= BLOCK_THRESHOLD) {
      return [
        false,
        `Operation would exceed context limit (${(projectedPercentage * 100).toFixed(1)}% of ${MAX_CONTEXT_TOKENS} tokens)`,
      ];
    }

    if (projectedPercentage >= WARNING_THRESHOLD) {
      return [
        true,
        `Warning: Operation will bring context to ${(projectedPercentage * 100).toFixed(1)}% capacity`,
      ];
    }

    return [true, ''];
  }

  /**
   * Get current context status.
   */
  getStatus(): Record<string, unknown> {
    const state = this.loadState();
    const status = this.checkCapacity();

    return {
      sessionId: state.sessionId,
      tokensUsed: state.tokensUsed,
      tokensRemaining: status.tokensRemaining,
      maxTokens: MAX_CONTEXT_TOKENS,
      percentage: status.percentage,
      status: status.status,
      warningsIssued: state.warningsIssued,
      recentOperations: state.operations.slice(-10),
      suggestions: status.status !== 'ok' ? this.suggestActions() : [],
    };
  }

  /**
   * Reset context tracking.
   */
  reset(): void {
    this.saveState(this.initialState());

    AuditLogger.logSync('context_manager', 'CONTEXT_RESET', {}, 'INFO');
  }

  /**
   * Get actionable suggestions when approaching limits.
   */
  suggestActions(): string[] {
    return [
      'Start a new conversation to reset context',
      'Use /compact to summarize conversation',
      'Avoid reading large files - use grep/glob for specific content',
      'Break complex tasks into smaller subtasks',
      'Be specific in requests to reduce back-and-forth',
      'Use targeted searches instead of broad exploration',
    ];
  }
}

// Singleton instance
let contextManagerInstance: ContextManager | null = null;

/**
 * Get or create the singleton context manager instance.
 */
export function getContextManager(): ContextManager {
  if (contextManagerInstance === null) {
    contextManagerInstance = new ContextManager();
  }
  return contextManagerInstance;
}

/**
 * Convenience function to check context capacity.
 */
export function checkContextCapacity(): [string, number, string | undefined] {
  const manager = getContextManager();
  const status = manager.checkCapacity();
  return [status.status, status.percentage, status.message];
}

/**
 * Convenience function to estimate operation cost.
 */
export function estimateOperationCost(toolName: string, toolInput: Record<string, unknown>): [number, string] {
  const manager = getContextManager();
  const estimate = manager.estimateOperationTokens(toolName, toolInput);
  return [estimate.tokens, `Estimated ${estimate.tokens} tokens from ${estimate.source}`];
}

/**
 * Print block message to stderr.
 */
function printBlockMessage(status: ContextStatus, suggestions: string[]): void {
  console.error('');
  console.error('='.repeat(60));
  console.error('CONTEXT LIMIT EXCEEDED');
  console.error('='.repeat(60));
  console.error(`Status: ${status.status.toUpperCase()}`);
  console.error(`Usage: ${status.tokensUsed.toLocaleString()} / ${status.maxTokens.toLocaleString()} tokens`);
  console.error(`Percentage: ${(status.percentage * 100).toFixed(1)}%`);
  console.error(`Remaining: ${status.tokensRemaining.toLocaleString()} tokens`);
  if (status.message) {
    console.error(`Reason: ${status.message}`);
  }
  console.error('');
  console.error('Suggestions:');
  for (const suggestion of suggestions) {
    console.error(`  - ${suggestion}`);
  }
  console.error('='.repeat(60));
  console.error('');
}

/**
 * Pre-tool hook validator entry point.
 * Reads tool input from stdin (sync) and validates context capacity.
 *
 * NOTE: Uses synchronous stdin reading to prevent hangs in hook execution.
 * The async `for await (process.stdin)` pattern can hang indefinitely if
 * stdin doesn't properly close/send EOF.
 */
export function validateContextCapacity(): number {
  try {
    // Read from stdin synchronously (prevents hang on EOF issues)
    const input = getToolInputFromStdinSync();

    if (!input.tool_name) {
      return EXIT_CODES.ALLOW;
    }

    const toolName = input.tool_name.toLowerCase();
    const toolInput = input.tool_input || {};

    const manager = getContextManager();

    // Estimate operation tokens
    const estimate = manager.estimateOperationTokens(toolName, toolInput);

    // Check if can accommodate
    const [canProceed, message] = manager.canAccommodate(estimate.tokens);

    if (!canProceed) {
      const status = manager.checkCapacity();
      const suggestions = manager.suggestActions();
      printBlockMessage(status, suggestions);

      AuditLogger.logSync('context_manager', 'BLOCKED', {
        tool_name: toolName,
        estimated_tokens: estimate.tokens,
        reason: message,
      }, 'BLOCKED');

      return EXIT_CODES.SOFT_BLOCK;
    }

    // Record the operation
    manager.recordOperation(toolName, estimate.tokens);

    // Log warning if approaching limit
    if (message) {
      console.error(`WARNING: ${message}`);
    }

    return EXIT_CODES.ALLOW;
  } catch (e) {
    // On error, allow the operation (fail open for availability)
    console.error(`Context manager error: ${e}`);
    return EXIT_CODES.ALLOW;
  }
}

/**
 * CLI entry point for bin/ invocation.
 */
export function main(): void {
  process.exit(validateContextCapacity());
}

// CLI entry point (direct execution)
if (process.argv[1]?.endsWith('context-manager.js') || process.argv[1]?.endsWith('context-manager.ts')) {
  main();
}
