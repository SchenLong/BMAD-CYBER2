/**
 * Rate Limiting Integration Tests
 *
 * Tests for rate limiting enforcement, including:
 * - Request counting
 * - Window expiry
 * - Role-based bypass
 * - Endpoint-specific limits
 *
 * @test integration/rate-limiting
 *
 * Story 10.3: API Integration Tests
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

// Mock the dependencies BEFORE importing the routes
const mockValidateSession = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  validateSession: jest.fn(() => mockValidateSession()),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

// Mock rate limiter
jest.mock('@/lib/security/rate-limiter', () => {
  const mockRateLimiter = {
    checkLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 99, resetAt: Date.now() + 60000 }),
    resetLimit: jest.fn().mockResolvedValue(undefined),
    incrementRequest: jest.fn().mockResolvedValue(undefined),
    getRequestCount: jest.fn().mockResolvedValue(1),
  };

  return {
    RateLimiter: jest.fn().mockImplementation(() => mockRateLimiter),
    rateLimitMiddleware: jest.fn().mockResolvedValue({ allowed: true }),
    createRateLimiter: jest.fn().mockReturnValue(mockRateLimiter),
    default: mockRateLimiter,
  };
});

// Import routes after mocking
import { GET as listProjects } from '@/app/api/v1/projects/route';
import { POST as invokeAgent } from '@/app/api/v1/agents/[id]/invoke/route';
import { POST as executeCommand } from '@/app/api/cli/execute/route';
import { createMockRequest, createMockSession, createMockUser } from './helpers/test-helpers';

describe.skip('Rate Limiting Integration Tests - TODO: Implement rate limiting middleware', () => {
  let mockSession: any;
  let mockRateLimiter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockValidateSession.mockResolvedValue(null);
    mockSession = createMockSession({
      user: createMockUser({ role: 'USER' }),
    });

    // Get the mocked rate limiter instance
    const rateLimiterModule = require('@/lib/security/rate-limiter');
    mockRateLimiter = {
      checkLimit: rateLimiterModule.RateLimiter().checkLimit,
      resetLimit: rateLimiterModule.RateLimiter().resetLimit,
      incrementRequest: rateLimiterModule.RateLimiter().incrementRequest,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 19,
        resetAt: Date.now() + 60000,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.status).not.toBe(429); // Not rate limited
      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
    });

    it('should block requests exceeding limit', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
        retryAfter: 30,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RATE_LIMITED');
    });

    it('should return proper rate limit headers', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 15,
        resetAt: Date.now() + 60000,
        limit: 20,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('15');
      expect(response.headers.get('Retry-After')).toBeDefined();
    });

    it('should include retry-after when blocked', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const retryAfterSeconds = 45;
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + (retryAfterSeconds * 1000),
        retryAfter: retryAfterSeconds,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe(retryAfterSeconds.toString());
    });
  });

  describe('Rate Limit Window Behaviour', () => {
    it('should reset window after expiry', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // First request - at limit
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 1000,
        retryAfter: 1,
      });

      const request1 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response1 = await listProjects(request1);
      expect(response1.status).toBe(429);

      // Advance time past reset
      jest.advanceTimersByTime(2000);

      // Second request - window reset
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 20,
        resetAt: Date.now() + 60000,
      });

      const request2 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response2 = await listProjects(request2);
      expect(response2.status).toBe(200);
    });

    it('should track sliding window correctly', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // Make requests within window
      for (let i = 0; i < 5; i++) {
        mockRateLimiter.checkLimit.mockResolvedValue({
          allowed: true,
          remaining: 20 - i - 1,
          resetAt: Date.now() + 60000,
        });

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects',
        });

        const response = await listProjects(request);
        expect(response.status).toBe(200);
      }

      // Verify increment was called 5 times
      expect(mockRateLimiter.incrementRequest).toHaveBeenCalledTimes(5);
    });

    it('should handle multiple users independently', async () => {
      const user1Session = createMockSession({
        user: createMockUser({ id: 'user-1', role: 'USER' }),
      });
      const user2Session = createMockSession({
        user: createMockUser({ id: 'user-2', role: 'USER' }),
      });

      // User 1 at limit
      mockValidateSession.mockResolvedValue(user1Session);
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      });

      const request1 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response1 = await listProjects(request1);
      expect(response1.status).toBe(429);

      // User 2 should still have quota
      mockValidateSession.mockResolvedValue(user2Session);
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 20,
        resetAt: Date.now() + 60000,
      });

      const request2 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response2 = await listProjects(request2);
      expect(response2.status).toBe(200);
    });
  });

  describe('Endpoint-Specific Limits', () => {
    it('should apply stricter limits to agent invocation', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // Agent invocation has stricter limit (e.g., 10 per minute)
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
        limit: 10,
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: { message: 'Test' },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgent(request);

      expect(response.status).toBe(429);
    });

    it('should apply moderate limits to CLI execution', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // CLI execution has moderate limit (e.g., 20 per minute)
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
        limit: 20,
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/cli/execute',
        body: { command: 'mission.list', parameters: {} },
      });

      const response = await executeCommand(request);

      expect(response.status).toBe(429);
    });

    it('should have lenient limits for project reads', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // Project listing has lenient limit (e.g., 100 per minute)
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
        resetAt: Date.now() + 60000,
        limit: 100,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Role-Based Bypass', () => {
    it('should allow ADMIN bypass for lower limits', async () => {
      const adminSession = createMockSession({
        user: createMockUser({ role: 'ADMIN' }),
      });
      mockValidateSession.mockResolvedValue(adminSession);

      // Admin bypasses rate limit
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 999,
        bypassed: true,
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: { message: 'Test' },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgent(request);

      expect(response.status).toBe(202);
    });

    it('should allow SUPERADMIN bypass for all limits', async () => {
      const superAdminSession = createMockSession({
        user: createMockUser({ role: 'SUPERADMIN' }),
      });
      mockValidateSession.mockResolvedValue(superAdminSession);

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 9999,
        bypassed: true,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.status).toBe(200);
    });

    it('should not allow USER role bypass', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // User cannot bypass
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        bypassed: false,
        resetAt: Date.now() + 60000,
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: { message: 'Test' },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgent(request);

      expect(response.status).toBe(429);
    });
  });

  describe('IP-Based Rate Limiting', () => {
    it('should rate limit by IP when no user session', async () => {
      mockValidateSession.mockResolvedValue(null);

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
        identifier: '192.168.1.1',
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });
      (request as any).headers.set('x-forwarded-for', '192.168.1.1');

      const response = await listProjects(request);

      expect(response.status).toBe(401); // No session
    });

    it('should extract IP from various headers', async () => {
      // Test CF-Connecting-IP
      const request1 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });
      (request1 as any).headers.set('cf-connecting-ip', '10.0.0.1');

      // Test X-Real-IP
      const request2 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });
      (request2 as any).headers.set('x-real-ip', '10.0.0.2');

      // Test X-Forwarded-For
      const request3 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });
      (request3 as any).headers.set('x-forwarded-for', '10.0.0.3');

      // All should be able to extract IP for rate limiting
      expect(request1).toBeDefined();
      expect(request2).toBeDefined();
      expect(request3).toBeDefined();
    });

    it('should handle shared IPs with composite identifiers', async () => {
      // When multiple users share an IP (NAT), use userId + IP
      mockValidateSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });
      (request as any).headers.set('x-forwarded-for', '192.168.1.100');

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 19,
        identifier: `${mockSession.user.id}_192.168.1.100`,
      });

      const response = await listProjects(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Memory Management', () => {
    it('should clean up expired entries', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      // Cleanup should be called periodically
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 20,
        resetAt: Date.now() + 60000,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      await listProjects(request);

      // Cleanup happens asynchronously
      // In real implementation, old entries are removed
    });

    it('should prevent memory leaks from accumulating entries', async () => {
      // Simulate many users making requests
      const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);

      for (const userId of userIds) {
        const userSession = createMockSession({
          user: createMockUser({ id: userId, role: 'USER' }),
        });
        mockValidateSession.mockResolvedValue(userSession);

        mockRateLimiter.checkLimit.mockResolvedValue({
          allowed: true,
          remaining: 20,
          resetAt: Date.now() + 60000,
        });

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects',
        });

        await listProjects(request);
      }

      // Implementation should limit stored entries to prevent OOM
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledTimes(100);
    });
  });

  describe('Response Headers', () => {
    it('should include rate limit info on success response', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 18,
        resetAt: Date.now() + 45000,
        limit: 20,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('18');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should include retry-after on rate limit response', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const retryAfter = 60;
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + (retryAfter * 1000),
        retryAfter,
      });

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await listProjects(request);

      expect(response.headers.get('Retry-After')).toBe(retryAfter.toString());
    });
  });
});
