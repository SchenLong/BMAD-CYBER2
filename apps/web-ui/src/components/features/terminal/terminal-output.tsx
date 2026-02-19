/**
 * TerminalOutput Component
 * Story 5.4: Terminal Emulator Component
 *
 * Output display container with auto-scroll, line wrapping,
 * and performance optimizations for large output.
 */

'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { TerminalLine, TerminalCursor, injectTerminalStyles } from './terminal-line';

export interface OutputLine {
  /** Line content */
  text: string;
  /** Whether stdout or stderr */
  type: 'stdout' | 'stderr';
  /** Optional timestamp */
  timestamp?: string;
}

export interface TerminalOutputProps {
  /** Array of output lines to display */
  lines: OutputLine[];
  /** Whether currently streaming (shows cursor) */
  isStreaming?: boolean;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Maximum lines to keep in memory (for performance) */
  maxLines?: number;
  /** Whether to auto-scroll to bottom */
  autoScroll?: boolean;
  /** Custom height */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * TerminalOutput component for displaying CLI command output
 */
export function TerminalOutput({
  lines,
  isStreaming = false,
  showLineNumbers = false,
  maxLines = 10000,
  autoScroll = true,
  height = '400px',
  className = '',
  testId = 'terminal-output',
}: TerminalOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const lastLineCountRef = useRef(0);

  // Inject terminal styles on mount
  useEffect(() => {
    injectTerminalStyles();
  }, []);

  // Limit lines for performance
  const displayLines = useMemo(() => {
    if (lines.length <= maxLines) return lines;
    // Keep the most recent lines
    return lines.slice(-maxLines);
  }, [lines, maxLines]);

  // Auto-scroll to bottom when new lines arrive
  useEffect(() => {
    if (!scrollRef.current || !autoScroll) return;
    if (userScrolledRef.current) return; // Don't auto-scroll if user manually scrolled

    // Only scroll if new lines were added
    if (displayLines.length > lastLineCountRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      lastLineCountRef.current = displayLines.length;
    }
  }, [displayLines, autoScroll]);

  // Detect when user manually scrolls
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    userScrolledRef.current = !isAtBottom;

    // Reset if user scrolls back to bottom
    if (isAtBottom) {
      userScrolledRef.current = false;
    }
  }, []);

  // Note: For parent component access to scrollToBottom, forwardRef pattern should be used
  // This is a simplified implementation for Phase 1

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'var(--terminal-bg, #0a0a0a)',
    color: 'var(--terminal-fg, #e0e0e0)',
    fontFamily: 'var(--font-mono, "JetBrains Mono", "SF Mono", Monaco, monospace)',
    fontSize: '13px',
    padding: '16px',
    overflowY: 'auto',
    overflowX: 'auto',
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: '200px',
    borderRadius: '0 0 8px 8px',
  };

  // Empty state
  if (displayLines.length === 0 && !isStreaming) {
    return (
      <div
        ref={scrollRef}
        className={`terminal-output ${className}`.trim()}
        style={containerStyle}
        data-testid={testId}
      >
        <div
          style={{
            color: 'var(--terminal-muted, #6b7280)',
            fontStyle: 'italic',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          No output yet. Waiting for command execution...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={`terminal-output ${className}`.trim()}
      style={containerStyle}
      onScroll={handleScroll}
      data-testid={testId}
    >
      {displayLines.map((line, index) => (
        <TerminalLine
          key={`${index}-${line.text.slice(0, 20)}`}
          text={line.text}
          type={line.type}
          lineNumber={showLineNumbers ? index + 1 : undefined}
          showLineNumbers={showLineNumbers}
        />
      ))}

      {isStreaming && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--terminal-muted, #6b7280)', marginRight: '8px' }}>$</span>
          <TerminalCursor visible={isStreaming} />
        </div>
      )}
    </div>
  );
}

/**
 * Hook to access imperative methods of TerminalOutput
 * Note: For Phase 1, this is a simplified version. Use ref forwarding for advanced control.
 */
export function useTerminalScroll() {
  // In Phase 1, terminal auto-scrolls by default
  // For manual control, parent components can use their own refs
  return {
    scrollToBottom: () => {
      // Placeholder for future enhancement
    },
  };
}
