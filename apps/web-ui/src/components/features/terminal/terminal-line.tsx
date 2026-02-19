/**
 * TerminalLine Component
 * Story 5.4: Terminal Emulator Component
 *
 * Individual line renderer for terminal output with syntax highlighting
 * and support for stdout/stderr differentiation.
 */

'use client';

import React from 'react';

export interface TerminalLineProps {
  /** Line content to display */
  text: string;
  /** Whether this is stdout or stderr output */
  type: 'stdout' | 'stderr';
  /** Optional line number */
  lineNumber?: number;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Check if a line appears to be a shell command (starts with $)
 */
function isCommandLine(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith('$');
}

/**
 * Parse ANSI color codes for basic terminal colors
 * This implementation renders colored spans for ANSI codes
 */
function parseAnsiColors(text: string): React.ReactNode {
  // Basic ANSI color code patterns
  const ansiPattern = /\x1b\[(\d+)(;?(\d+))?m/g;

  const segments: Array<{ text: string; color?: string; bold?: boolean }> = [];
  let lastIndex = 0;
  let match;

  // Reset to default styling
  let currentColor: string | undefined;
  let currentBold = false;

  while ((match = ansiPattern.exec(text)) !== null) {
    // Add text before the ANSI code
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        color: currentColor,
        bold: currentBold,
      });
    }

    // Parse the color code
    const code = parseInt(match[1], 10);

    // Handle reset code
    if (code === 0) {
      currentColor = undefined;
      currentBold = false;
    }
    // Handle bold
    else if (code === 1) {
      currentBold = true;
    }
    // Handle foreground colors (30-37, 90-97)
    else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
      const colorMap: Record<number, string> = {
        30: '#666666',   // Black/dark gray
        31: '#ef4444',   // Red
        32: '#10b981',   // Green
        33: '#f59e0b',   // Yellow
        34: '#3b82f6',   // Blue
        35: '#a855f7',   // Magenta
        36: '#06b6d4',   // Cyan
        37: '#e0e0e0',   // White
        90: '#6b7280',   // Bright black (gray)
        91: '#f87171',   // Bright red
        92: '#4ade80',   // Bright green
        93: '#fbbf24',   // Bright yellow
        94: '#60a5fa',   // Bright blue
        95: '#c084fc',   // Bright magenta
        96: '#22d3ee',   // Bright cyan
        97: '#ffffff',   // Bright white
      };
      currentColor = colorMap[code];
    }

    lastIndex = ansiPattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      color: currentColor,
      bold: currentBold,
    });
  }

  // If no ANSI codes found, return plain text
  if (segments.length === 0) {
    return text;
  }

  // Render segments with appropriate styling
  return segments.map((segment, index) => {
    const style: React.CSSProperties = {};
    if (segment.color) {
      style.color = segment.color;
    }
    if (segment.bold) {
      style.fontWeight = 'bold';
    }
    return (
      <span key={index} style={style}>
        {segment.text}
      </span>
    );
  });
}

export function TerminalLine({
  text,
  type,
  lineNumber,
  showLineNumbers = false,
  className = '',
}: TerminalLineProps) {
  const isCommand = isCommandLine(text);

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono, "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace)',
    fontSize: '13px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    padding: '2px 0',
  };

  const lineStyle: React.CSSProperties = {
    ...baseStyle,
    color: isCommand
      ? 'var(--terminal-command, #10b981)'
      : type === 'stderr'
        ? 'var(--terminal-error, #ef4444)'
        : 'var(--terminal-fg, #e0e0e0)',
  };

  const lineNumberStyle: React.CSSProperties = {
    ...baseStyle,
    display: 'inline-block',
    width: '40px',
    textAlign: 'right',
    marginRight: '16px',
    color: 'var(--terminal-muted, #6b7280)',
    userSelect: 'none',
    flexShrink: 0,
  };

  return (
    <div
      className={`terminal-line terminal-line-${type} ${isCommand ? 'terminal-command' : ''} ${className}`.trim()}
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      {showLineNumbers && lineNumber !== undefined && (
        <span style={lineNumberStyle}>{lineNumber}</span>
      )}
      <span style={lineStyle}>{parseAnsiColors(text)}</span>
    </div>
  );
}

/**
 * TerminalCursor component for showing the blinking cursor
 */
export interface TerminalCursorProps {
  /** Whether cursor should be visible */
  visible?: boolean;
  /** Cursor character */
  character?: string;
  /** Additional CSS classes */
  className?: string;
}

export function TerminalCursor({
  visible = true,
  character = '▊',
  className = '',
}: TerminalCursorProps) {
  if (!visible) return null;

  return (
    <span
      className={`terminal-cursor ${className}`.trim()}
      style={{
        display: 'inline-block',
        animation: 'terminal-blink 1s step-end infinite',
        color: 'var(--terminal-fg, #e0e0e0)',
        marginLeft: '2px',
      }}
    >
      {character}
    </span>
  );
}

/**
 * Injects terminal animation keyframes into the document
 * Call this once in your app or component
 */
export function injectTerminalStyles() {
  if (typeof document === 'undefined') return;

  const styleId = 'terminal-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes terminal-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .terminal-line {
      transition: background-color 0.15s ease;
    }

    .terminal-line:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }

    .terminal-command {
      font-weight: 500;
    }

    /* Custom scrollbar for terminal output */
    .terminal-output::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .terminal-output::-webkit-scrollbar-track {
      background: var(--terminal-bg, #0a0a0a);
    }

    .terminal-output::-webkit-scrollbar-thumb {
      background: var(--terminal-border, #333);
      border-radius: 4px;
    }

    .terminal-output::-webkit-scrollbar-thumb:hover {
      background: var(--terminal-muted, #555);
    }
  `;
  document.head.appendChild(style);
}
