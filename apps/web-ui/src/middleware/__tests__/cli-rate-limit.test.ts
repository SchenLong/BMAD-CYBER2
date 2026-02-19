/**
 * CLI Rate Limiting Middleware Tests
 * Story 5.5: CLI Bridge Security Middleware - Task 11
 */

import { cliRateLimitMiddleware, COMMAND_RATE_LIMITS, DEFAULT_RATE_LIMIT, __test__ } from '../cli-rate-limit';
import type { AuthContext } from '@/types/cli-security';

describe('cli-rate-limit', () => {
  let mockRequest: any;
  let authContext: AuthContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear the global store before each test
    __test__.store.clear();

    // Default mock request
    mockRequest = {
      headers: new Headers(),
    };

    // Default auth context
    authContext = {
      userId: 'test-user-id',
      email: 'test@example.com',
      roles: ['USER'],
      ip: '192.168.1.1',
      userAgent: 'TestAgent/1.0',
    };
  });

  describe('cliRateLimitMiddleware', () => {
    it('should allow request when under limit', async () => {
      const result = await cliRateLimitMiddleware(mockRequest, authContext);

      expect(result).toBeNull(); // null means allowed
      expect(mockRequest.headers.get('X-RateLimit-Limit')).toBe(DEFAULT_RATE_LIMIT.limit.toString());
      expect(parseInt(mockRequest.headers.get('X-RateLimit-Remaining') || '0', 10)).toBeLessThan(DEFAULT_RATE_LIMIT.limit);
    });

    it('should return 429 when limit exceeded', async () => {
      const limit = 3;
      const customAuth = { ...authContext, userId: 'limited-user' };

      // Use workflow.execute which has limit of 3
      for (let i = 0; i < limit; i++) {
        const result = await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
        expect(result).toBeNull();
      }

      // Next request should be rate limited
      const result = await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it('should include Retry-After header when rate limited', async () => {
      const limit = 3;
      const customAuth = { ...authContext, userId: 'retry-user' };

      // Exceed limit for workflow.execute
      for (let i = 0; i < limit + 1; i++) {
        const result = await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
        if (i >= limit) {
          expect(result).not.toBeNull();
          expect(result?.headers.get('Retry-After')).toBeTruthy();
          expect(parseInt(result?.headers.get('Retry-After') || '0', 10)).toBeGreaterThan(0);
        }
      }
    });

    it('should use per-command rate limits when specified', async () => {
      const workflowLimit = COMMAND_RATE_LIMITS['workflow.execute']?.limit || 3;
      const customAuth = { ...authContext, userId: 'workflow-user' };

      // Make requests up to workflow.execute limit
      for (let i = 0; i < workflowLimit; i++) {
        const result = await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
        expect(result).toBeNull();
      }

      // Next request should be rate limited
      const result = await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it('should track rate limits separately for different commands', async () => {
      const customAuth = { ...authContext, userId: 'multi-cmd-user' };

      // Execute workflow.execute (low limit of 3)
      for (let i = 0; i < 3; i++) {
        await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
      }

      // Should still be able to execute agent.invoke (limit of 10)
      const result = await cliRateLimitMiddleware(mockRequest, customAuth, 'agent.invoke');
      expect(result).toBeNull();
    });

    it('should track rate limits separately for different users', async () => {
      const user1 = { ...authContext, userId: 'user1' };
      const user2 = { ...authContext, userId: 'user2' };

      // User 1 uses up workflow.execute limit (3)
      for (let i = 0; i < 3; i++) {
        await cliRateLimitMiddleware(mockRequest, user1, 'workflow.execute');
      }

      // User 1 should be rate limited for workflow.execute
      const result1 = await cliRateLimitMiddleware(mockRequest, user1, 'workflow.execute');
      expect(result1).not.toBeNull();

      // User 2 should not be affected
      const result2 = await cliRateLimitMiddleware(mockRequest, user2, 'workflow.execute');
      expect(result2).toBeNull();
    });

    it('should reset window after expiration', async () => {
      const customAuth = { ...authContext, userId: 'window-user' };

      // Use up workflow.execute limit (3)
      for (let i = 0; i < 3; i++) {
        await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
      }

      // Should be rate limited
      const result1 = await cliRateLimitMiddleware(mockRequest, customAuth, 'workflow.execute');
      expect(result1).not.toBeNull();

      // TODO: Test window reset by advancing time
      // This requires jasmine.useFakeTimers() or similar
    });
  });

  describe('COMMAND_RATE_LIMITS', () => {
    it('should have workflow.execute limit of 3 per 5 minutes', () => {
      const limit = COMMAND_RATE_LIMITS['workflow.execute'];
      expect(limit).toBeDefined();
      expect(limit?.limit).toBe(3);
      expect(limit?.windowMs).toBe(5 * 60 * 1000);
    });

    it('should have agent.invoke limit of 10 per minute', () => {
      const limit = COMMAND_RATE_LIMITS['agent.invoke'];
      expect(limit).toBeDefined();
      expect(limit?.limit).toBe(10);
      expect(limit?.windowMs).toBe(60 * 1000);
    });

    it('should have intel.flash-assessment limit of 5 per minute', () => {
      const limit = COMMAND_RATE_LIMITS['intel.flash-assessment'];
      expect(limit).toBeDefined();
      expect(limit?.limit).toBe(5);
      expect(limit?.windowMs).toBe(60 * 1000);
    });
  });

  describe('DEFAULT_RATE_LIMIT', () => {
    it('should be 20 per minute', () => {
      expect(DEFAULT_RATE_LIMIT.limit).toBe(20);
      expect(DEFAULT_RATE_LIMIT.windowMs).toBe(60 * 1000);
    });
  });
});
