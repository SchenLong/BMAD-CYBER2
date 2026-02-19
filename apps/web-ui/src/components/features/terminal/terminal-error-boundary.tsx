/**
 * TerminalErrorBoundary Component
 * Story 5.4: Terminal Emulator Component
 *
 * Error boundary for catching and displaying errors in terminal components.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface TerminalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface TerminalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary class component for terminal components
 */
export class TerminalErrorBoundary extends Component<
  TerminalErrorBoundaryProps,
  TerminalErrorBoundaryState
> {
  constructor(props: TerminalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TerminalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('[TerminalErrorBoundary] Caught error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.handleRetry);
        }
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--terminal-bg, #0a0a0a)',
            color: 'var(--terminal-error, #ef4444)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '13px',
            border: '1px solid var(--terminal-error, #ef4444)',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Terminal Error
          </div>
          <div style={{ marginBottom: '12px' }}>
            {this.state.error?.message || 'An unknown error occurred'}
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '4px 12px',
              backgroundColor: 'var(--terminal-command, #10b981)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components (wraps class component)
 */
export function useTerminalErrorBoundary() {
  return { TerminalErrorBoundary };
}
