/**
 * useCommandStream Hook
 * Story 5.4: Terminal Emulator Component
 *
 * Wrapper hook around use-cli-stream that provides a simplified API
 * for terminal components. Handles SSE connection lifecycle and
 * output line management.
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useCliStream, type UseCliStreamOptions } from './use-cli-stream';

/**
 * Command line output type
 */
export type OutputLineType = 'stdout' | 'stderr' | 'system';

/**
 * Single output line for terminal display
 */
export interface CommandOutputLine {
  /** Line content */
  text: string;
  /** Output type */
  type: OutputLineType;
  /** Timestamp when this line was received */
  timestamp: string;
}

/**
 * Configuration options for useCommandStream
 */
export interface UseCommandStreamOptions {
  /** Command to execute (e.g., "intel-team.flash-assessment") */
  command: string;
  /** Command parameters */
  params?: Record<string, unknown>;
  /** Whether to automatically connect on mount */
  enabled?: boolean;
  /** Maximum lines to keep in buffer */
  maxLines?: number;
  /** Callback when a new line arrives */
  onLine?: (line: string, type: 'stdout' | 'stderr') => void;
  /** Callback when progress updates */
  onProgress?: (progress: number) => void;
  /** Callback when command completes */
  onDone?: (exitCode: number) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Callback when connection is established */
  onConnect?: () => void;
  /** Callback when connection is closed */
  onDisconnect?: () => void;
}

/**
 * Stream state returned by the hook
 */
export interface CommandStreamState {
  /** Whether currently connected to SSE */
  isConnected: boolean;
  /** Whether currently streaming output */
  isStreaming: boolean;
  /** All output lines */
  lines: CommandOutputLine[];
  /** Current progress percentage (0-100) */
  progress: number;
  /** Exit code when completed (null if still running) */
  exitCode: number | null;
  /** Error message if any */
  error: string | null;
  /** Command duration in milliseconds */
  duration: number | null;
}

/**
 * Stream controls returned by the hook
 */
export interface CommandStreamControls {
  /** Manually connect to the stream */
  connect: () => void;
  /** Disconnect from the stream */
  disconnect: () => void;
  /** Cancel the running command */
  cancel: () => void;
  /** Clear all stored lines */
  clearLines: () => void;
  /** Reconnect to the stream */
  reconnect: () => void;
}

/**
 * Result type combining state and controls
 */
export type UseCommandStreamResult = CommandStreamState & CommandStreamControls;

/**
 * Process CLI stream events into output lines
 */
function processEventToLine(
  event: ReturnType<typeof useCliStream>['events'][number]
): CommandOutputLine | null {
  const timestamp = new Date().toISOString();

  switch (event.type) {
    case 'started':
      return {
        text: `$ bmad ${event.command.replace(/\./g, ' ')}`,
        type: 'system',
        timestamp,
      };

    case 'output':
      return {
        text: event.message || '',
        type: 'stdout',
        timestamp: event.timestamp || timestamp,
      };

    case 'raw':
      return {
        text: event.line || '',
        type: 'stdout',
        timestamp: event.timestamp || timestamp,
      };

    case 'error':
      return {
        text: `Error: ${event.error}`,
        type: 'stderr',
        timestamp,
      };

    case 'completed':
      return {
        text: `Process complete. Exit code: ${event.exitCode}. Duration: ${event.duration}ms`,
        type: event.exitCode === 0 ? 'system' : 'stderr',
        timestamp,
      };

    case 'progress':
    case 'step':
      // These don't produce output lines
      return null;

    default:
      return null;
  }
}

/**
 * Hook for streaming CLI command output to terminal components
 *
 * @param options - Configuration options
 * @returns Stream state and controls
 *
 * @example
 * ```tsx
 * const { lines, isStreaming, exitCode, cancel } = useCommandStream({
 *   command: 'intel-team.flash-assessment',
 *   params: { target: 'example.com' },
 *   enabled: true,
 *   onDone: (code) => console.log('Done with exit code:', code),
 * });
 * ```
 */
export function useCommandStream(options: UseCommandStreamOptions): UseCommandStreamResult {
  const {
    command,
    params = {},
    enabled = true,
    maxLines = 10000,
    onLine,
    onProgress,
    onDone,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  // Convert command format: "intel-team.flash-assessment" -> "intel-team:flash-assessment"
  const normalizedCommand = useMemo(() => {
    const parts = command.split('.');
    if (parts.length >= 2) {
      const team = parts[0];
      const workflow = parts.slice(1).join('.');
      return `${team}:${workflow}`;
    }
    return command;
  }, [command]);

  // Create CLI stream options
  const cliStreamOptions: UseCliStreamOptions = useMemo(
    () => ({
      command: normalizedCommand,
      params,
      enabled,
      onEvent: (event) => {
        // Handle progress updates
        if (event.type === 'progress') {
          onProgress?.(event.progress);
        } else if (event.type === 'step') {
          onProgress?.(event.progress);
        }

        // Handle completion
        if (event.type === 'completed') {
          onDone?.(event.exitCode);
        }

        // Handle errors
        if (event.type === 'error') {
          onError?.(event.error);
        }
      },
      onConnect,
      onDisconnect,
      onError,
      onComplete: onDone,
    }),
    [normalizedCommand, params, enabled, onProgress, onDone, onError, onConnect, onDisconnect]
  );

  // Use the underlying CLI stream hook
  const cliStream = useCliStream(cliStreamOptions);

  // Convert CLI events to output lines
  const lines = useMemo(() => {
    const result: CommandOutputLine[] = [];

    for (const event of cliStream.events) {
      const line = processEventToLine(event);
      if (line && line.text) {
        result.push(line);
      }
    }

    // Apply max lines limit (keep most recent)
    if (result.length > maxLines) {
      return result.slice(-maxLines);
    }

    return result;
  }, [cliStream.events, maxLines]);

  // Call onLine callback when new lines arrive
  useEffect(() => {
    if (lines.length > 0 && onLine) {
      const lastLine = lines[lines.length - 1];
      if (lastLine.type !== 'system') {
        onLine(lastLine.text, lastLine.type === 'stderr' ? 'stderr' : 'stdout');
      }
    }
  }, [lines, onLine]);

  // Clear lines helper
  const clearLines = useCallback(() => {
    cliStream.clearEvents();
  }, [cliStream]);

  return {
    // State
    isConnected: cliStream.isConnected,
    isStreaming: cliStream.isStreaming,
    lines,
    progress: cliStream.progress,
    exitCode: cliStream.exitCode,
    error: cliStream.error,
    duration: cliStream.duration,
    // Controls
    connect: cliStream.connect,
    disconnect: cliStream.disconnect,
    cancel: cliStream.cancel,
    clearLines,
    reconnect: cliStream.reconnect,
  };
}

/**
 * Hook variant that connects to a predefined command
 */
export function useTerminalCommand(
  command: string,
  params?: Record<string, unknown>,
  autoStart = true
): UseCommandStreamResult {
  return useCommandStream({
    command,
    params,
    enabled: autoStart,
  });
}
