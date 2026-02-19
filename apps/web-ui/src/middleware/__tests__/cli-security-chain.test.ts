/**
 * CLI Security Chain Tests
 * Story 5.5: CLI Bridge Security Middleware - Task 11
 */

import { applyCLISecurity, applySecurityHeaders } from '../cli-security-chain';
import { NextResponse } from 'next/server';

// Mock all the middleware
jest.mock('../cli-auth', () => ({
  cliAuthMiddleware: jest.fn(),
  isAuthError: jest.fn((result: any) => result instanceof NextResponse),
}));

jest.mock('../cli-rate-limit', () => ({
  cliRateLimitMiddleware: jest.fn(),
}));

jest.mock('../cli-authorization', () => ({
  cliAuthorizationMiddleware: jest.fn(),
}));

jest.mock('@/lib/cli-bridge/security-audit-logger', () => ({
  logAuthSuccess: jest.fn(),
  logAuthFailure: jest.fn(),
  logRateLimitExceeded: jest.fn(),
  logAuthzSuccess: jest.fn(),
  logAuthzFailure: jest.fn(),
}));

import { cliAuthMiddleware, isAuthError } from '../cli-auth';
import { cliRateLimitMiddleware } from '../cli-rate-limit';
import { cliAuthorizationMiddleware } from '../cli-authorization';
import {
  logAuthSuccess,
  logAuthFailure,
  logRateLimitExceeded,
  logAuthzSuccess,
  logAuthzFailure,
} from '@/lib/cli-bridge/security-audit-logger';
import type { AuthContext } from '@/types/cli-security';

describe('cli-security-chain', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock request
    mockRequest = {
      headers: new Headers(),
      nextUrl: { pathname: '/api/cli/execute' },
    };
  });

  describe('applyCLISecurity', () => {
    const mockAuthContext: AuthContext = {
      userId: 'test-user-id',
      email: 'test@example.com',
      roles: ['USER'],
      ip: '192.168.1.1',
      userAgent: 'TestAgent/1.0',
    };

    it('should return auth error response when authentication fails', async () => {
      const authErrorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(authErrorResponse);
      (isAuthError as jest.Mock).mockReturnValue(true);

      const result = await applyCLISecurity(mockRequest, 'workflow.execute');

      expect('response' in result).toBe(true);
      expect((result as any).response.status).toBe(401);
      expect(logAuthFailure).toHaveBeenCalled();
      expect(logAuthSuccess).not.toHaveBeenCalled();
    });

    it('should return rate limit error response when rate limited', async () => {
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(mockAuthContext);
      (isAuthError as jest.Mock).mockReturnValue(false);
      const rateLimitResponse = NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      (cliRateLimitMiddleware as jest.Mock).mockResolvedValue(rateLimitResponse);

      const result = await applyCLISecurity(mockRequest, 'workflow.execute');

      expect('response' in result).toBe(true);
      expect((result as any).response.status).toBe(429);
      expect(logAuthSuccess).toHaveBeenCalled();
      expect(logRateLimitExceeded).toHaveBeenCalled();
    });

    it('should return authorization error response when unauthorized', async () => {
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(mockAuthContext);
      (isAuthError as jest.Mock).mockReturnValue(false);
      (cliRateLimitMiddleware as jest.Mock).mockResolvedValue(null);
      const authzResponse = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      (cliAuthorizationMiddleware as jest.Mock).mockResolvedValue(authzResponse);

      const result = await applyCLISecurity(mockRequest, 'workflow.execute');

      expect('response' in result).toBe(true);
      expect((result as any).response.status).toBe(403);
      expect(logAuthSuccess).toHaveBeenCalled();
      expect(logAuthzFailure).toHaveBeenCalled();
    });

    it('should return auth context when all checks pass', async () => {
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(mockAuthContext);
      (isAuthError as jest.Mock).mockReturnValue(false);
      (cliRateLimitMiddleware as jest.Mock).mockResolvedValue(null);
      (cliAuthorizationMiddleware as jest.Mock).mockResolvedValue(null);

      const result = await applyCLISecurity(mockRequest, 'workflow.execute');

      expect('authContext' in result).toBe(true);
      expect((result as any).authContext).toEqual(mockAuthContext);
      expect(logAuthSuccess).toHaveBeenCalled();
      expect(logAuthzSuccess).toHaveBeenCalled();
    });

    it('should skip authorization when no command specified', async () => {
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(mockAuthContext);
      (isAuthError as jest.Mock).mockReturnValue(false);
      (cliRateLimitMiddleware as jest.Mock).mockResolvedValue(null);

      const result = await applyCLISecurity(mockRequest);

      expect('authContext' in result).toBe(true);
      expect(cliAuthorizationMiddleware).not.toHaveBeenCalled();
      expect(logAuthzSuccess).not.toHaveBeenCalled();
    });

    it('should handle authentication errors correctly', async () => {
      const authErrorResponse = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(authErrorResponse);
      (isAuthError as jest.Mock).mockReturnValue(true);

      mockRequest.headers.set('x-forwarded-for', '10.0.0.1');
      mockRequest.headers.set('user-agent', 'BadActor/1.0');

      const result = await applyCLISecurity(mockRequest, 'test.command');

      expect('response' in result).toBe(true);
      expect(logAuthFailure).toHaveBeenCalledWith(
        '10.0.0.1',
        'BadActor/1.0',
        'Invalid or missing token'
      );
    });

    it('should pass command to all middleware', async () => {
      (cliAuthMiddleware as jest.Mock).mockResolvedValue(mockAuthContext);
      (isAuthError as jest.Mock).mockReturnValue(false);
      (cliRateLimitMiddleware as jest.Mock).mockResolvedValue(null);
      (cliAuthorizationMiddleware as jest.Mock).mockResolvedValue(null);

      await applyCLISecurity(mockRequest, 'mission.create');

      expect(cliRateLimitMiddleware).toHaveBeenCalledWith(
        mockRequest,
        mockAuthContext,
        'mission.create'
      );
      expect(cliAuthorizationMiddleware).toHaveBeenCalledWith(
        mockRequest,
        mockAuthContext,
        'mission.create'
      );
    });
  });

  describe('applySecurityHeaders', () => {
    it('should add security headers to response', () => {
      const response = NextResponse.json({ data: 'OK' }, { status: 200 });
      const result = applySecurityHeaders(response);

      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should add HSTS header in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = NextResponse.json({ data: 'OK' }, { status: 200 });
      const result = applySecurityHeaders(response);

      expect(result.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not override existing headers', () => {
      const response = NextResponse.json({ data: 'OK' }, { status: 200 });
      response.headers.set('X-Content-Type-Options', 'custom');

      const result = applySecurityHeaders(response);

      expect(result.headers.get('X-Content-Type-Options')).toBe('custom');
    });
  });
});
