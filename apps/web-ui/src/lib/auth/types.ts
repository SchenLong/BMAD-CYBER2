/**
 * Authentication Types
 * Story 1.6: Session Management
 *
 * Type definitions for authentication and session management
 */

/**
 * Request metadata for session creation
 * Used to capture information about the client when creating sessions
 */
export interface RequestMetadata {
  /** Client IP address */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Device fingerprint for session tracking */
  deviceFingerprint?: string;
}

/**
 * Session information for display
 */
export interface SessionInfo {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  expires: Date;
  ipAddress: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
  isCurrent: boolean;
}

/**
 * Device information parsed from user agent
 */
export interface DeviceInfo {
  /** Browser name (Chrome, Firefox, Safari, etc.) */
  browser: string;
  /** Browser version */
  browserVersion: string;
  /** Operating system */
  os: string;
  /** OS version */
  osVersion: string;
  /** Device type (desktop, mobile, tablet) */
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  /** Formatted display string */
  display: string;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  userId: string;
  sessionToken: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

/**
 * Session validation result
 * Story 2.1: Extended with onboarding status
 */
export interface SessionValidationResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    onboardingCompleted: Date | null; // Story 2.1: Include onboarding status (DateTime from DB)
  };
  session: {
    id: string;
    expires: Date;
  };
}

/**
 * Session refresh result
 */
export interface SessionRefreshResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  accessToken?: string;
}
