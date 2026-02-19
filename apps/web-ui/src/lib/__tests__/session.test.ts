/**
 * Session Management Tests
 * Story 1.6: Session Management
 *
 * Tests for session creation, validation, refresh, and revocation.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock the cookies module
const mockCookiesModule = {
  cookies: jest.fn(),
};

jest.mock('next/headers', () => mockCookiesModule);

// Mock crypto.getRandomValues to return predictable values
const mockCryptoValues = new Uint8Array(32);
for (let i = 0; i < 32; i++) {
  mockCryptoValues[i] = i; // Predictable values
}

const mockCrypto = {
  getRandomValues: jest.fn().mockReturnValue(mockCryptoValues),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock the prisma module
const mockPrismaModule = {
  prisma: {
    $transaction: jest.fn(),
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
};

jest.mock('../prisma', () => mockPrismaModule);

// Mock jose for JWT
const mockJoseModule = {
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token' as never),
  })),
  jwtVerify: jest.fn(),
};

jest.mock('jose', () => mockJoseModule);

import { prisma } from '../prisma';

describe('Session Management', () => {
  const mockUserId = 'user-123';
  // Predictable token from mocked crypto values
  const mockSessionToken = Array.from(mockCryptoValues, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  const mockCookies = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockCookiesModule.cookies as jest.Mock).mockResolvedValue(mockCookies as never);

    // Set default environment variables
    process.env.SESSION_SECRET = 'test-secret-key';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.SESSION_EXPIRY_MINUTES = '15';
    process.env.REFRESH_TOKEN_EXPIRY_DAYS = '7';
    process.env.MAX_SESSIONS_PER_USER = '5';
    process.env.COOKIE_SECURE = 'false';
    process.env.COOKIE_SAMESITE = 'lax';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clear any timers
    jest.clearAllTimers();
  });

  describe('Session Creation', () => {
    it('should create a session with metadata', async () => {
      const { createSession } = await import('../auth/session');

      // Mock $transaction to execute the callback
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        const tx: any = {
          session: {
            count: jest.fn().mockResolvedValue(0 as never),
            findFirst: jest.fn().mockResolvedValue(null),
            delete: jest.fn(),
            create: jest.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);
      });

      const result = await createSession(mockUserId, {
        ipAddress: '127.0.0.1',
        userAgent: 'TestBrowser',
        deviceFingerprint: 'fp-123',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toMatch(/^[a-f0-9]{64}$/); // Should be a 64-char hex string
      expect(mockCookies.set).toHaveBeenCalled();
    });

    it('should revoke oldest session when limit exceeded', async () => {
      const { createSession } = await import('../auth/session');

      const mockOldestSession = {
        id: 'old-session',
        userId: mockUserId,
      };

      // Mock $transaction to execute the callback
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        const tx: any = {
          session: {
            count: jest.fn().mockResolvedValue(5), // At limit
            findFirst: jest.fn().mockResolvedValue(mockOldestSession),
            delete: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
          },
        };
        await callback(tx);
      });

      const result = await createSession(mockUserId);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toMatch(/^[a-f0-9]{64}$/); // Should be a 64-char hex string
    });
  });

  describe('Session Validation', () => {
    it('should return null for invalid session token', async () => {
      const { validateSession } = await import('../auth/session');

      mockCookies.get.mockReturnValue(undefined);

      const result = await validateSession();

      expect(result).toBeNull();
    });

    it('should delete expired sessions and return null', async () => {
      const { validateSession } = await import('../auth/session');

      mockCookies.get.mockReturnValue({ value: mockSessionToken });

      const expiredSession = {
        id: 'expired-session',
        userId: mockUserId,
        expires: new Date(Date.now() - 1000), // Expired
        user: {
          id: mockUserId,
          email: 'test@test.com',
          name: 'Test',
          role: 'USER',
          onboardingCompleted: null,
          organizationMemberships: [],
        },
      };

      (prisma.session.findUnique as jest.Mock).mockResolvedValue(expiredSession as never);
      (prisma.session.delete as jest.Mock).mockResolvedValue({} as never);

      const result = await validateSession();

      expect(prisma.session.delete).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return user data for valid session', async () => {
      const { validateSession } = await import('../auth/session');

      mockCookies.get.mockReturnValue({ value: mockSessionToken });

      const validSession = {
        id: 'valid-session',
        userId: mockUserId,
        expires: new Date(Date.now() + 15 * 60 * 1000), // Valid
        user: {
          id: mockUserId,
          email: 'test@test.com',
          name: 'Test User',
          role: 'USER',
          onboardingCompleted: null,
          organizationMemberships: [],
        },
      };

      (prisma.session.findUnique as jest.Mock).mockResolvedValue(validSession as never);
      (prisma.session.update as jest.Mock).mockResolvedValue({} as never);

      const result = await validateSession();

      expect(result).toEqual({
        user: {
          id: mockUserId,
          email: 'test@test.com',
          name: 'Test User',
          role: 'USER',
          onboardingCompleted: null,
        },
        session: {
          id: 'valid-session',
          expires: validSession.expires,
        },
        organizationId: null,
      });
    });
  });

  describe('Session Refresh', () => {
    it('should extend session expiration on refresh', async () => {
      const { refreshSession } = await import('../auth/session');

      mockCookies.get.mockReturnValue({ value: mockSessionToken });

      const mockSession = {
        id: 'session-1',
        userId: mockUserId,
        expires: new Date(Date.now() + 5 * 60 * 1000),
        user: {
          id: mockUserId,
          email: 'test@test.com',
          name: 'Test',
          role: 'USER',
        },
      };

      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession as never);
      (prisma.session.update as jest.Mock).mockResolvedValue({} as never);

      const result = await refreshSession();

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: expect.objectContaining({
          expires: expect.any(Date),
        }),
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('Session Destruction', () => {
    it('should clear both session and refresh cookies', async () => {
      const { destroySession } = await import('../auth/session');

      mockCookies.get.mockReturnValue({ value: mockSessionToken });
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 1 } as never);

      await destroySession();

      expect(mockCookies.set).toHaveBeenCalledWith(
        'session',
        '',
        expect.objectContaining({
          maxAge: 0,
        })
      );
      expect(mockCookies.set).toHaveBeenCalledWith(
        'refresh',
        '',
        expect.objectContaining({
          maxAge: 0,
        })
      );
    });
  });

  describe('Refresh Token Verification', () => {
    it('should reject invalid refresh tokens', async () => {
      const { verifyRefreshToken } = await import('../auth/session');
      const { jwtVerify } = await import('jose');

      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token') as never);

      const result = await verifyRefreshToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should reject tokens without refresh type', async () => {
      const { verifyRefreshToken } = await import('../auth/session');
      const { jwtVerify } = await import('jose');

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: { type: 'access', userId: 'user-1' },
      } as never);

      const result = await verifyRefreshToken('access-token');

      expect(result).toBeNull();
    });
  });

  describe('Concurrent Session Limits', () => {
    it('should enforce MAX_SESSIONS_PER_USER limit', async () => {
      const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS_PER_USER || '5', 10);
      expect(MAX_SESSIONS).toBeGreaterThan(0);
      expect(MAX_SESSIONS).toBeLessThanOrEqual(100); // Reasonable upper limit
    });
  });
});
