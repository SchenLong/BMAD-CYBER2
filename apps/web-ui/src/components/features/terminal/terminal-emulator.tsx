/**
 * TerminalEmulator Component
 * Story 5.4: Terminal Emulator Component
 *
 * Main terminal emulator component for displaying CLI command execution.
 * Read-only terminal (Phase 1) with real-time output streaming via SSE.
 *
 * Features:
 * - Displays CLI commands being executed
 * - Streams output in real-time
 * - Dark theme with monospace font
 * - Copy command/output buttons
 * - Download as script functionality
 * - Multiple variants (inline, full, compact)
 * - Collapsible and resizable options
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { TerminalHeader } from './terminal-header';
import { TerminalOutput } from './terminal-output';
import { TerminalErrorBoundary } from './terminal-error-boundary';
import { useCommandStream } from '@/hooks/use-command-stream';

export interface TerminalEmulatorProps {
  /** Command to execute (e.g., "intel-team.flash-assessment") */
  command: string;
  /** Command parameters */
  params?: Record<string, unknown>;
  /** Display variant */
  variant?: 'inline' | 'full' | 'compact';
  /** Whether to auto-start the stream on mount */
  autoStart?: boolean;
  /** Maximum height of terminal (in px or CSS value) */
  maxHeight?: string | number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Whether to allow collapse */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Callback when command completes */
  onComplete?: (exitCode: number) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * TerminalEmulator - Main component for displaying CLI command execution
 */
export function TerminalEmulator({
  command,
  params = {},
  variant = 'inline',
  autoStart = true,
  maxHeight = '400px',
  showLineNumbers = false,
  collapsible = true,
  defaultCollapsed = false,
  onComplete,
  onError,
  className = '',
  testId = 'terminal-emulator',
}: TerminalEmulatorProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Use the command stream hook
  const {
    isConnected,
    isStreaming,
    lines,
    exitCode,
    clearLines,
  } = useCommandStream({
    command,
    params,
    enabled: autoStart,
    onDone: useCallback(
      (code: number) => {
        onComplete?.(code);
      },
      [onComplete]
    ),
    onError: useCallback(
      (err: string) => {
        onError?.(err);
      },
      [onError]
    ),
  });

  // Compute output text from lines (using useMemo to avoid setState in useEffect)
  const outputText = useMemo(() => {
    return lines
      .filter((l) => l.type !== 'system')
      .map((l) => l.text)
      .join('\n');
  }, [lines]);

  // Handle collapse toggle
  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    clearLines();
  }, [clearLines]);

  // Convert lines to TerminalOutput format
  const outputLines: Array<{ text: string; type: 'stdout' | 'stderr' }> = useMemo(
    () =>
      lines
        .filter((line) => line.type !== 'system' || line.text.startsWith('$'))
        .map((line) => ({
          text: line.text,
          type: line.type === 'system' ? 'stdout' : line.type,
        })),
    [lines]
  );

  // Compact variant - just show expand button when collapsed
  if (variant === 'compact' && isCollapsed) {
    return (
      <div
        className={`terminal-emulator terminal-emulator-compact ${className}`.trim()}
        data-testid={testId}
      >
        <TerminalHeader
          command={command}
          params={params}
          isConnected={isConnected}
          isStreaming={isStreaming}
          exitCode={exitCode}
          onExpand={handleExpand}
          variant={variant}
          isCollapsed={true}
        />
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    border: '1px solid var(--terminal-border, #333)',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'var(--terminal-bg, #0a0a0a)',
  };

  return (
    <div
      className={`terminal-emulator terminal-emulator-${variant} ${className}`.trim()}
      style={containerStyle}
      data-testid={testId}
    >
      <TerminalErrorBoundary
        onError={(error) => {
          console.error('[TerminalEmulator] Error:', error);
          onError?.(error.message);
        }}
      >
        <TerminalHeader
          command={command}
          params={params}
          isConnected={isConnected}
          isStreaming={isStreaming}
          exitCode={exitCode}
          onCollapse={collapsible ? handleCollapse : undefined}
          onExpand={handleExpand}
          onClear={handleClear}
          variant={variant}
          isCollapsed={isCollapsed}
          outputText={outputText}
        />

        {!isCollapsed && (
          <TerminalOutput
            lines={outputLines}
            isStreaming={isStreaming}
            showLineNumbers={showLineNumbers}
            height={maxHeight}
            autoScroll={true}
          />
        )}
      </TerminalErrorBoundary>
    </div>
  );
}

/**
 * Hook for managing multiple terminals
 */
export interface TerminalInstance {
  id: string;
  command: string;
  params: Record<string, unknown>;
  isActive: boolean;
}

export function useMultiTerminal() {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addTerminal = useCallback((command: string, params: Record<string, unknown> = {}) => {
    const id = `terminal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const instance: TerminalInstance = {
      id,
      command,
      params,
      isActive: true,
    };

    setTerminals((prev) => [...prev, instance]);
    setActiveId(id);
    return id;
  }, []);

  const removeTerminal = useCallback((id: string) => {
    setTerminals((prev) => prev.filter((t) => t.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const setActiveTerminal = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const clearTerminals = useCallback(() => {
    setTerminals([]);
    setActiveId(null);
  }, []);

  return {
    terminals,
    activeId,
    activeTerminal: terminals.find((t) => t.id === activeId) || null,
    addTerminal,
    removeTerminal,
    setActiveTerminal,
    clearTerminals,
  };
}

/**
 * TerminalPanel for displaying multiple terminals in tabs
 */
export interface TerminalPanelProps {
  /** Terminal instances to display */
  terminals: Array<{
    id: string;
    command: string;
    params?: Record<string, unknown>;
  }>;
  /** Currently active terminal ID */
  activeId: string | null;
  /** Callback when tab is clicked */
  onTabClick?: (id: string) => void;
  /** Callback when tab is closed */
  onTabClose?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export function TerminalPanel({
  terminals,
  activeId,
  onTabClick,
  onTabClose,
  className = '',
}: TerminalPanelProps) {
  if (terminals.length === 0) {
    return (
      <div
        className={`terminal-panel empty ${className}`.trim()}
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--terminal-muted, #6b7280)',
        }}
      >
        <p>No active terminals.</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>
          Execute a command to see output here.
        </p>
      </div>
    );
  }

  const activeTerminal = terminals.find((t) => t.id === activeId);

  return (
    <div className={`terminal-panel ${className}`.trim()}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--terminal-border, #333)',
          backgroundColor: 'var(--terminal-header-bg, #1a1a1a)',
        }}
      >
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              color: terminal.id === activeId ? 'var(--terminal-fg, #e0e0e0)' : 'var(--terminal-muted, #6b7280)',
              borderBottom: terminal.id === activeId ? '2px solid var(--terminal-command, #10b981)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={() => onTabClick?.(terminal.id)}
          >
            <span>{terminal.command}</span>
            {onTabClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(terminal.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active terminal */}
      {activeTerminal && (
        <TerminalEmulator
          key={activeTerminal.id}
          command={activeTerminal.command}
          params={activeTerminal.params}
          variant="full"
        />
      )}
    </div>
  );
}

// Export components
export default TerminalEmulator;
