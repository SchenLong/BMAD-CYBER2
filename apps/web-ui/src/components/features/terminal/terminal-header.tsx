/**
 * TerminalHeader Component
 * Story 5.4: Terminal Emulator Component
 *
 * Terminal header with action buttons: Copy Command, Copy Output,
 * Download as Script, Clear, and status indicators.
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Download, Trash2, Minimize2, Maximize2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface TerminalHeaderProps {
  /** Command string (e.g., "bmad.invoke.intel-team.flash-assessment") */
  command: string;
  /** Command parameters */
  params?: Record<string, unknown>;
  /** Whether the connection is established */
  isConnected?: boolean;
  /** Whether currently streaming output */
  isStreaming?: boolean;
  /** Exit code when command completes */
  exitCode?: number | null;
  /** Callback when collapse is requested */
  onCollapse?: () => void;
  /** Callback when expand is requested */
  onExpand?: () => void;
  /** Callback when clear is requested */
  onClear?: () => void;
  /** Current variant */
  variant?: 'inline' | 'full' | 'compact';
  /** Whether currently collapsed */
  isCollapsed?: boolean;
  /** Terminal output text for copy */
  outputText?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format command for CLI display
 */
function formatCommand(command: string, params: Record<string, unknown> = {}): string {
  // Convert dot notation to CLI format
  let formatted = command.replace(/\./g, ' ');

  // Add parameters as flags
  const paramEntries = Object.entries(params).filter(([, value]) => value !== undefined);
  for (const [key, value] of paramEntries) {
    const flag = key.length === 1 ? `-${key}` : `--${key}`;
    if (typeof value === 'boolean') {
      formatted += ` ${flag}`;
    } else {
      formatted += ` ${flag} "${value}"`;
    }
  }

  return formatted;
}

/**
 * Get status text based on current state
 */
function getStatusText(
  isConnected: boolean,
  isStreaming: boolean,
  exitCode: number | null
): string {
  if (!isConnected) return 'Disconnected';
  if (isStreaming) return 'Running...';
  if (exitCode !== null) {
    return exitCode === 0 ? 'Success' : `Failed (exit: ${exitCode})`;
  }
  return 'Ready';
}

/**
 * Get status badge variant
 */
function getStatusVariant(
  isConnected: boolean,
  isStreaming: boolean,
  exitCode: number | null
): 'default' | 'destructive' | 'outline' | 'secondary' {
  if (!isConnected) return 'outline';
  if (isStreaming) return 'default';
  if (exitCode === 0) return 'secondary'; // Use secondary instead of success
  if (exitCode !== null && exitCode !== 0) return 'destructive';
  return 'outline';
}

export function TerminalHeader({
  command,
  params = {},
  isConnected = false,
  isStreaming = false,
  exitCode = null,
  onCollapse,
  onExpand,
  onClear,
  variant = 'inline',
  isCollapsed = false,
  outputText = '',
  className = '',
}: TerminalHeaderProps) {
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Refs for setTimeout cleanup
  const copiedCommandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copiedOutputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copiedCommandTimeoutRef.current) {
        clearTimeout(copiedCommandTimeoutRef.current);
      }
      if (copiedOutputTimeoutRef.current) {
        clearTimeout(copiedOutputTimeoutRef.current);
      }
    };
  }, []);

  const formattedCommand = formatCommand(command, params);
  const statusText = getStatusText(isConnected, isStreaming, exitCode);
  const statusVariant = getStatusVariant(isConnected, isStreaming, exitCode);

  // Copy command to clipboard
  const handleCopyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`bmad ${formattedCommand}`);
      setCopiedCommand(true);
      // Clear previous timeout if exists
      if (copiedCommandTimeoutRef.current) {
        clearTimeout(copiedCommandTimeoutRef.current);
      }
      copiedCommandTimeoutRef.current = setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  }, [formattedCommand]);

  // Copy output to clipboard
  const handleCopyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopiedOutput(true);
      // Clear previous timeout if exists
      if (copiedOutputTimeoutRef.current) {
        clearTimeout(copiedOutputTimeoutRef.current);
      }
      copiedOutputTimeoutRef.current = setTimeout(() => setCopiedOutput(false), 2000);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  }, [outputText]);

  // Download as shell script
  const handleDownloadScript = useCallback(() => {
    const scriptContent = `#!/bin/bash
# BMAD CLI Command
# Generated by BMAD Web Server
# Date: ${new Date().toISOString()}

bmad ${formattedCommand}
`;

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bmad-${command.replace(/\./g, '-')}.sh`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [command, formattedCommand]);

  // Handle collapse/expand toggle
  const handleToggleCollapse = useCallback(() => {
    if (isCollapsed && onExpand) {
      onExpand();
    } else if (!isCollapsed && onCollapse) {
      onCollapse();
    }
  }, [isCollapsed, onCollapse, onExpand]);

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: 'var(--terminal-header-bg, #1a1a1a)',
    borderBottom: '1px solid var(--terminal-border, #333)',
    borderRadius: '8px 8px 0 0',
  };

  const statusSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  };

  const actionsSectionStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  };

  return (
    <div className={`terminal-header ${className}`.trim()} style={headerStyle}>
      {/* Status Section */}
      <div style={statusSectionStyle}>
        {/* Connection status indicator */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected
              ? isStreaming
                ? 'var(--terminal-command, #10b981)'
                : 'var(--terminal-muted, #6b7280)'
              : 'var(--terminal-error, #ef4444)',
            animation: isStreaming ? 'pulse 2s ease-in-out infinite' : undefined,
          }}
        />

        {/* Status badge */}
        <Badge variant={statusVariant} style={{ fontSize: '11px', padding: '2px 8px' }}>
          {statusText}
        </Badge>

        {/* Command preview (truncated) */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--terminal-muted, #888)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          $ bmad {formattedCommand}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={actionsSectionStyle}>
        {/* Copy Command Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyCommand}
          title="Copy command to clipboard"
          aria-label="Copy command to clipboard"
          style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
        >
          {copiedCommand ? (
            <>
              <Check className="w-3 h-3 mr-1" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" aria-hidden="true" />
              Copy Command
            </>
          )}
        </Button>

        {/* Copy Output Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyOutput}
          title="Copy output to clipboard"
          aria-label="Copy terminal output to clipboard"
          disabled={!outputText}
          style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
        >
          {copiedOutput ? (
            <>
              <Check className="w-3 h-3 mr-1" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" aria-hidden="true" />
              Copy Output
            </>
          )}
        </Button>

        {/* Download as Script Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadScript}
          title="Download as shell script"
          aria-label="Download command as shell script"
          style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
        >
          <Download className="w-3 h-3 mr-1" aria-hidden="true" />
          Download
        </Button>

        {/* Clear Button */}
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            title="Clear terminal output"
            aria-label="Clear terminal output"
            style={{ height: '28px', padding: '0 8px' }}
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
          </Button>
        )}

        {/* Collapse/Expand Button */}
        {variant !== 'compact' && (onCollapse || onExpand) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            title={isCollapsed ? 'Expand terminal' : 'Minimize terminal'}
            aria-label={isCollapsed ? 'Expand terminal' : 'Minimize terminal'}
            style={{ height: '28px', padding: '0 8px' }}
          >
            {isCollapsed ? <Maximize2 className="w-4 h-4" aria-hidden="true" /> : <Minimize2 className="w-4 h-4" aria-hidden="true" />}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * CompactTerminalHeader for smaller/inline variants
 */
export interface CompactTerminalHeaderProps {
  /** Command string */
  command: string;
  /** Whether currently streaming */
  isStreaming?: boolean;
  /** Callback when expand is requested */
  onExpand?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function CompactTerminalHeader({
  command,
  isStreaming = false,
  onExpand,
  className = '',
}: CompactTerminalHeaderProps) {
  const handleClick = useCallback(() => {
    onExpand?.();
  }, [onExpand]);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--terminal-header-bg, #1a1a1a)',
    border: '1px solid var(--terminal-border, #333)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  return (
    <button
      className={`terminal-header-compact ${className}`.trim()}
      style={buttonStyle}
      onClick={handleClick}
      type="button"
      aria-label={`Expand terminal for command: ${command}`}
      aria-expanded={false}
    >
      {isStreaming && (
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--terminal-command, #10b981)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      )}
      <span style={{ fontSize: '12px', color: 'var(--terminal-fg, #e0e0e0)' }}>
        {command}
      </span>
      <span style={{ fontSize: '10px', color: 'var(--terminal-muted, #6b7280)' }} aria-hidden="true">
        ▼
      </span>
    </button>
  );
}
