/**
 * Authorization Error Boundary
 * Story 1.5: Role-Based Access Control (RBAC) - Code Review Fix
 *
 * Catches AuthorizationError and redirects to the forbidden page.
 * Used in admin pages to handle permission denials gracefully.
 */

'use client';

import { Component, ReactNode } from 'react';
import { redirect } from 'next/navigation';

interface AuthorizationError {
  name: string;
  code?: 'UNAUTHORIZED' | 'FORBIDDEN';
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary to catch authorization errors
 * and redirect to the appropriate page
 */
export class AuthorizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an AuthorizationError
    if (error.name === 'AuthorizationError') {
      return { hasError: true, error };
    }
    // Let other errors propagate
    return { hasError: false };
  }

  componentDidCatch(error: Error) {
    if (error.name === 'AuthorizationError') {
      const authError = error as unknown as AuthorizationError;

      if (authError.code === 'UNAUTHORIZED') {
        redirect('/login');
      } else {
        redirect('/forbidden');
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with authorization error boundary
 */
export function withAuthBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <AuthorizationErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AuthorizationErrorBoundary>
    );
  };
}
