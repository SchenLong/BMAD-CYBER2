/**
 * Session Validation Middleware
 * Story 1.6: Session Management - Security Enhancements
 *
 * Provides middleware functions for validating sessions and detecting suspicious activity.
 */

import { NextRequest } from 'next/server';
import { validateSession } from './session';
import { validateFingerprintChange } from './device-fingerprint';

export interface SessionValidationResult {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  sessionId?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  reason?: string;
}

/**
 * Validate session for API routes
 * Checks session validity and optionally validates device fingerprint
 */
export async function validateSessionForApi(
  request: NextRequest,
  options?: {
    /** Whether to validate device fingerprint */
    validateFingerprint?: boolean;
    /** Whether to update activity timestamp */
    updateActivity?: boolean;
  }
): Promise<SessionValidationResult> {
  const { validateFingerprint = false, updateActivity = true } = options || {};

  try {
    // Validate the session
    const sessionResult = await validateSession(updateActivity);

    if (!sessionResult) {
      return {
        isValid: false,
        riskLevel: 'high',
        reason: 'No valid session found',
      };
    }

    const { user, session } = sessionResult;

    // Validate device fingerprint if requested
    if (validateFingerprint) {
      const clientFingerprint = request.headers.get('x-device-fingerprint');
      const storedFingerprint = request.headers.get('x-stored-fingerprint');

      if (clientFingerprint && storedFingerprint) {
        const fingerprintValidation = validateFingerprintChange(
          clientFingerprint,
          storedFingerprint
        );

        if (!fingerprintValidation.isValid && fingerprintValidation.riskLevel === 'high') {
          return {
            isValid: false,
            riskLevel: 'high',
            reason: fingerprintValidation.reason,
          };
        }

        // Return medium risk but allow the session
        if (fingerprintValidation.riskLevel === 'medium') {
          return {
            isValid: true,
            user,
            sessionId: session.id,
            riskLevel: 'medium',
            reason: fingerprintValidation.reason,
          };
        }
      }
    }

    return {
      isValid: true,
      user,
      sessionId: session.id,
      riskLevel: 'low',
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      isValid: false,
      riskLevel: 'high',
      reason: 'Session validation failed',
    };
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 * Usage in route handlers:
 *
 * export async function GET(request: NextRequest) {
 *   const validation = await requireAuth(request);
 *   if (!validation.isValid) {
 *     return NextResponse.json({ error: validation.reason }, { status: 401 });
 *   }
 *   // ... proceed with request
 * }
 */
export async function requireAuth(
  request: NextRequest,
  options?: { validateFingerprint?: boolean }
): Promise<SessionValidationResult> {
  return validateSessionForApi(request, options);
}

/**
 * Check if request is from the same IP address as the session
 * Useful for detecting session hijacking attempts
 */
export function validateIpAddress(request: NextRequest, sessionIp: string | null): boolean {
  const currentIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // If no stored IP, skip validation
  if (!sessionIp) return true;

  // Exact match
  if (currentIp === sessionIp) return true;

  // Check for IPv4 subnet match (allow minor changes in last octet for proxy situations)
  if (sessionIp.includes('.') && currentIp.includes('.')) {
    const sessionParts = sessionIp.split('.');
    const currentParts = currentIp.split('.');
    if (sessionParts.length === 4 && currentParts.length === 4) {
      // Match first 3 octets
      return (
        sessionParts[0] === currentParts[0] &&
        sessionParts[1] === currentParts[1] &&
        sessionParts[2] === currentParts[2]
      );
    }
  }

  return false;
}

/**
 * Detect suspicious activity patterns
 */
export interface SuspiciousActivityResult {
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

export function detectSuspiciousActivity(
  request: NextRequest,
  sessionData: {
    ipAddress: string | null;
    userAgent: string | null;
    deviceFingerprint: string | null;
    createdAt: Date;
  }
): SuspiciousActivityResult {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Check IP address
  const currentIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (sessionData.ipAddress && currentIp !== sessionData.ipAddress) {
    reasons.push('IP address has changed since session creation');
    riskLevel = 'medium';
  }

  // Check user agent
  const currentUA = request.headers.get('user-agent');
  if (sessionData.userAgent && currentUA !== sessionData.userAgent) {
    reasons.push('Browser/User Agent has changed');
    riskLevel = 'medium';
  }

  // Check if session is very old (potential orphaned session)
  const sessionAge = Date.now() - sessionData.createdAt.getTime();
  const maxSessionAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  if (sessionAge > maxSessionAge) {
    reasons.push('Session is older than 7 days');
    riskLevel = 'high';
  }

  return {
    isSuspicious: reasons.length > 0,
    riskLevel,
    reasons,
  };
}
