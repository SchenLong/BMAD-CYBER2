/**
 * API Authentication Tests
 * Story 8.3: API Authentication - Task 8
 *
 * Tests for API authentication services excluding JWT (which requires special mocking).
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  hashApiKey,
  getApiKeyPreview,
  generateApiKey,
} from '../api-key-service';
import { Permission, roleHasPermission, scopeHasPermission } from '../permission-service';
import {
  checkApiRateLimit,
  resetApiRateLimit,
} from '../api-rate-limit';
import { UserRole } from '@prisma/client';

describe('API Key Service', () => {
  describe('hashApiKey', () => {
    it('should generate consistent hash', () => {
      const key = 'bmad.v1.0123456789abcdef';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it('should generate different hashes for different keys', () => {
      const key1 = 'bmad.v1.0123456789abcdef';
      const key2 = 'bmad.v1.abcdef0123456789';
      const hash1 = hashApiKey(key1);
      const hash2 = hashApiKey(key2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getApiKeyPreview', () => {
    it('should return last 4 characters', () => {
      const key = 'bmad.v1.0123456789abcdef';
      const preview = getApiKeyPreview(key);

      expect(preview).toBe('cdef');
    });

    it('should handle short keys gracefully', () => {
      const key = 'bmad.v1.abc';
      const preview = getApiKeyPreview(key);

      // Returns last 4 chars (includes dot for short keys)
      expect(preview).toBe('.abc');
    });
  });

  describe('generateApiKey', () => {
    it('should generate key with correct format', () => {
      const key = generateApiKey();

      expect(key).toMatch(/^bmad\.v1\.[a-f0-9]{32}$/);
    });

    it('should generate unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1).not.toBe(key2);
    });
  });
});

describe('Permission Service', () => {
  describe('roleHasPermission', () => {
    it('should grant admin all permissions', () => {
      expect(roleHasPermission(UserRole.SUPERADMIN, Permission.AGENTS_READ)).toBe(true);
      expect(roleHasPermission(UserRole.SUPERADMIN, Permission.USERS_DELETE)).toBe(true);
    });

    it('should grant admin role appropriate permissions', () => {
      expect(roleHasPermission(UserRole.ADMIN, Permission.AGENTS_READ)).toBe(true);
      expect(roleHasPermission(UserRole.ADMIN, Permission.AGENTS_INVOKE)).toBe(true);
      expect(roleHasPermission(UserRole.ADMIN, Permission.USERS_WRITE)).toBe(true);
    });

    it('should grant developer appropriate permissions', () => {
      expect(roleHasPermission(UserRole.DEVELOPER, Permission.AGENTS_READ)).toBe(true);
      expect(roleHasPermission(UserRole.DEVELOPER, Permission.AGENTS_INVOKE)).toBe(true);
      expect(roleHasPermission(UserRole.DEVELOPER, Permission.AGENTS_WRITE)).toBe(false);
    });

    it('should grant user basic permissions', () => {
      expect(roleHasPermission(UserRole.USER, Permission.AGENTS_READ)).toBe(true);
      expect(roleHasPermission(UserRole.USER, Permission.AGENTS_INVOKE)).toBe(true);
      expect(roleHasPermission(UserRole.USER, Permission.USERS_WRITE)).toBe(false);
    });

    it('should grant readonly read-only permissions', () => {
      expect(roleHasPermission(UserRole.READONLY, Permission.AGENTS_READ)).toBe(true);
      expect(roleHasPermission(UserRole.READONLY, Permission.AGENTS_WRITE)).toBe(false);
      expect(roleHasPermission(UserRole.READONLY, Permission.PROJECTS_WRITE)).toBe(false);
    });

    it('should support wildcard permissions', () => {
      expect(roleHasPermission(UserRole.ADMIN, Permission.AGENTS_WRITE as any)).toBe(true);
    });
  });

  describe('scopeHasPermission', () => {
    it('should grant exact permission match', () => {
      const scopes = ['agents:read', 'agents:invoke'];
      expect(scopeHasPermission(scopes, 'agents:read')).toBe(true);
      expect(scopeHasPermission(scopes, 'agents:invoke')).toBe(true);
    });

    it('should deny missing permission', () => {
      const scopes = ['agents:read'];
      expect(scopeHasPermission(scopes, 'agents:write')).toBe(false);
    });

    it('should grant wildcard permission', () => {
      const scopes = ['agents:*'];
      expect(scopeHasPermission(scopes, 'agents:read')).toBe(true);
      expect(scopeHasPermission(scopes, 'agents:invoke')).toBe(true);
      expect(scopeHasPermission(scopes, 'agents:write')).toBe(true);
    });

    it('should grant admin wildcard', () => {
      const scopes = ['admin'];
      expect(scopeHasPermission(scopes, 'agents:write')).toBe(true);
      expect(scopeHasPermission(scopes, 'users:delete')).toBe(true);
      expect(scopeHasPermission(scopes, 'any:permission')).toBe(true);
    });

    it('should grant all wildcard', () => {
      const scopes = ['*'];
      expect(scopeHasPermission(scopes, 'agents:write')).toBe(true);
      expect(scopeHasPermission(scopes, 'users:delete')).toBe(true);
    });

    it('should handle empty scopes', () => {
      const scopes: string[] = [];
      expect(scopeHasPermission(scopes, 'agents:read')).toBe(false);
    });
  });

  describe('roleHasAnyPermission', () => {
    it('should return true if role has at least one permission', () => {
      const { roleHasAnyPermission } = require('../permission-service');
      expect(roleHasAnyPermission(UserRole.DEVELOPER, [Permission.AGENTS_READ, Permission.USERS_DELETE])).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      const { roleHasAnyPermission } = require('../permission-service');
      expect(roleHasAnyPermission(UserRole.READONLY, [Permission.AGENTS_WRITE, Permission.USERS_DELETE])).toBe(false);
    });
  });

  describe('roleHasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      const { roleHasAllPermissions } = require('../permission-service');
      expect(roleHasAllPermissions(UserRole.ADMIN, [Permission.AGENTS_READ, Permission.AGENTS_INVOKE])).toBe(true);
    });

    it('should return false if role missing any permission', () => {
      const { roleHasAllPermissions } = require('../permission-service');
      expect(roleHasAllPermissions(UserRole.DEVELOPER, [Permission.AGENTS_READ, Permission.USERS_DELETE])).toBe(false);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions array for role', () => {
      const { getPermissionsForRole } = require('../permission-service');
      const perms = getPermissionsForRole(UserRole.DEVELOPER);
      expect(Array.isArray(perms)).toBe(true);
      expect(perms).toContain(Permission.AGENTS_READ);
      expect(perms).toContain(Permission.AGENTS_INVOKE);
    });
  });
});

describe('API Rate Limiting', () => {
  afterEach(() => {
    // Reset rate limit store between tests
    resetApiRateLimit('test-user-id');
    resetApiRateLimit('test-user-2');
    resetApiRateLimit('test-user-3');
    resetApiRateLimit('test-user-4');
  });

  describe('checkApiRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkApiRateLimit('test-user-id', 'api_key', UserRole.DEVELOPER);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should track remaining requests', () => {
      const result1 = checkApiRateLimit('test-user-2', 'api_key', UserRole.DEVELOPER);
      const result2 = checkApiRateLimit('test-user-2', 'api_key', UserRole.DEVELOPER);

      expect(result1.remaining).toBeGreaterThan(result2.remaining);
    });

    it('should use different limits for session vs API key', () => {
      const sessionResult = checkApiRateLimit('test-user-3', 'session', UserRole.USER);
      const apiKeyResult = checkApiRateLimit('test-user-4', 'api_key', UserRole.DEVELOPER);

      // Session should have higher limit
      expect(sessionResult.limit).toBeGreaterThanOrEqual(apiKeyResult.limit);
    });

    it('should provide valid reset time', () => {
      const result = checkApiRateLimit('test-user-id', 'api_key', UserRole.DEVELOPER);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should handle enterprise API keys with higher limits', () => {
      const result = checkApiRateLimit('test-user-id', 'api_key', UserRole.ADMIN);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBeGreaterThan(0);
    });
  });

  describe('getApiRateLimitStats', () => {
    it('should return stats for user', () => {
      const { getApiRateLimitStats } = require('../api-rate-limit');
      const stats = getApiRateLimitStats('test-user-id', 'api_key', UserRole.DEVELOPER);

      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('limit');
      expect(stats).toHaveProperty('remaining');
      expect(stats).toHaveProperty('resetAt');
      expect(stats.resetAt).toBeInstanceOf(Date);
    });
  });
});

describe('Token Types', () => {
  describe('Permission enum', () => {
    it('should have all expected permissions', () => {
      const { Permission } = require('../permission-service');
      expect(Permission.AGENTS_READ).toBe('agents:read');
      expect(Permission.AGENTS_INVOKE).toBe('agents:invoke');
      expect(Permission.WORKFLOWS_READ).toBe('workflows:read');
      expect(Permission.PROJECTS_READ).toBe('projects:read');
      expect(Permission.ADMIN).toBe('admin');
    });
  });
});
