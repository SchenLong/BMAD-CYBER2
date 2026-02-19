/**
 * CLI Authentication Middleware Tests
 * Story 5.5: CLI Bridge Security Middleware - Task 11
 */

import { cliAuthMiddleware, isAuthError, extractTokenFromHeader } from '../cli-auth';
import { AuthenticationError } from '@/types/cli-security';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

describe('cli-auth', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock request
    mockRequest = {
      headers: new Headers(),
    };

    // Mock successful JWT verification with all required claims
    const now = Math.floor(Date.now() / 1000);
    (jwtVerify as jest.Mock).mockResolvedValue({
      payload: {
        userId: 'test-user-id',
        sub: 'test-user-id',
        exp: now + 3600,
        iat: now,
      },
    });

    // Mock user from database
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'USER',
    });
  });

  describe('cliAuthMiddleware', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when Authorization header does not start with Bearer', async () => {
      mockRequest.headers.set('authorization', 'InvalidToken');

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers.set('authorization', 'Bearer invalid-token');
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when token is expired', async () => {
      mockRequest.headers.set('authorization', 'Bearer expired-token');
      const expiredError = new Error('JWT_EXPIRED') as any;
      expiredError.code = 'ERR_JWT_EXPIRED';
      (jwtVerify as jest.Mock).mockRejectedValue(expiredError);

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when user is not found in database', async () => {
      mockRequest.headers.set('authorization', 'Bearer valid-token');
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return auth context when token is valid', async () => {
      mockRequest.headers.set('authorization', 'Bearer valid-token');
      mockRequest.headers.set('x-vercel-forwarded-for', '192.168.1.1');
      mockRequest.headers.set('user-agent', 'TestAgent/1.0');

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(false);
      expect(result).toEqual({
        userId: 'test-user-id',
        email: 'test@example.com',
        roles: ['USER'],
        ip: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
        exp: expect.any(Number),
      });
    });

    it('should extract IP from x-real-ip header when trusted proxy is configured', async () => {
      // Set trusted proxy for this test
      process.env.TRUSTED_PROXY_CIDRS = '10.0.0.0/8';

      mockRequest.headers.set('authorization', 'Bearer valid-token');
      mockRequest.headers.set('x-real-ip', '10.0.0.1');

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(false);
      expect((result as any).ip).toBe('10.0.0.1');

      // Clean up
      delete process.env.TRUSTED_PROXY_CIDRS;
    });

    it('should extract IP from cf-connecting-ip header', async () => {
      mockRequest.headers.set('authorization', 'Bearer valid-token');
      mockRequest.headers.set('cf-connecting-ip', '172.16.0.1');

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(false);
      expect((result as any).ip).toBe('172.16.0.1');
    });

    it('should default to unknown for IP when no headers present', async () => {
      mockRequest.headers.set('authorization', 'Bearer valid-token');

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(false);
      expect((result as any).ip).toBe('unknown');
    });

    it('should reject token with invalid userId format', async () => {
      mockRequest.headers.set('authorization', 'Bearer invalid-user-token');
      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 'x', // Too short
          sub: 'x',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should reject token issued in the future (clock skew)', async () => {
      mockRequest.headers.set('authorization', 'Bearer future-token');
      const futureTime = Math.floor(Date.now() / 1000) + 1000; // 1000 seconds in future
      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 'test-user-id',
          sub: 'test-user-id',
          exp: futureTime + 3600,
          iat: futureTime,
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });
  });

  describe('isAuthError', () => {
    it('should return true for NextResponse', () => {
      // Create a mock NextResponse-like object
      const { NextResponse } = require('next/server');
      const response = new NextResponse('Unauthorized', { status: 401 });
      expect(isAuthError(response)).toBe(true);
    });

    it('should return false for AuthContext', () => {
      const authContext = {
        userId: 'test',
        email: 'test@example.com',
        roles: ['USER'],
        ip: '127.0.0.1',
      };
      expect(isAuthError(authContext)).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const result = extractTokenFromHeader('Bearer my-token');
      expect(result).toBe('my-token');
    });

    it('should return null for missing header', () => {
      const result = extractTokenFromHeader(null);
      expect(result).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const result = extractTokenFromHeader('Basic abc123');
      expect(result).toBeNull();
    });

    it('should return null for Bearer without token', () => {
      const result = extractTokenFromHeader('Bearer ');
      expect(result).toBe('');
    });
  });

  describe('JWT Claim Validation', () => {
    it('should return 401 when userId claim is missing', async () => {
      mockRequest.headers.set('authorization', 'Bearer token-without-userid');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          sub: 'test-user-id',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when userId claim has wrong type', async () => {
      mockRequest.headers.set('authorization', 'Bearer token-with-invalid-userid');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 123, // Number instead of string
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when exp claim is missing', async () => {
      mockRequest.headers.set('authorization', 'Bearer token-without-exp');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 'test-user-id',
          sub: 'test-user-id',
          iat: Math.floor(Date.now() / 1000),
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when iat claim is missing', async () => {
      mockRequest.headers.set('authorization', 'Bearer token-without-iat');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 'test-user-id',
          sub: 'test-user-id',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when issuer does not match', async () => {
      mockRequest.headers.set('authorization', 'Bearer token-with-wrong-issuer');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 'test-user-id',
          sub: 'test-user-id',
          iss: 'https://wrong-issuer.com',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });

    it('should return 401 when subject does not match userId', async () => {
      mockRequest.headers.set('authorization', 'Bearer token-with-mismatched-sub');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: 'test-user-id',
          sub: 'different-user-id',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        },
      });

      const result = await cliAuthMiddleware(mockRequest);

      expect(isAuthError(result)).toBe(true);
      expect((result as Response).status).toBe(401);
    });
  });

  describe('createAuthErrorResponse utility', () => {
    it('should create error response with default values', () => {
      const { createAuthErrorResponse } = require('../cli-auth');
      const response = createAuthErrorResponse();

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(401);

      return response.json().then((data: any) => {
        expect(data.error).toBe('Authentication required');
        expect(data.code).toBe('INVALID_TOKEN');
      });
    });

    it('should create error response with custom values', () => {
      const { createAuthErrorResponse } = require('../cli-auth');
      const response = createAuthErrorResponse('Custom error', 'CUSTOM_CODE');

      expect(response.status).toBe(401);

      return response.json().then((data: any) => {
        expect(data.error).toBe('Custom error');
        expect(data.code).toBe('CUSTOM_CODE');
      });
    });
  });

  describe('isAuthContext utility', () => {
    it('should return false for NextResponse', () => {
      const { isAuthContext } = require('../cli-auth');
      const { NextResponse } = require('next/server');
      const response = new NextResponse('Unauthorized', { status: 401 });
      expect(isAuthContext(response)).toBe(false);
    });

    it('should return true for AuthContext', () => {
      const { isAuthContext } = require('../cli-auth');
      const authContext = {
        userId: 'test',
        email: 'test@example.com',
        roles: ['USER'],
        ip: '127.0.0.1',
      };
      expect(isAuthContext(authContext)).toBe(true);
    });
  });
});
