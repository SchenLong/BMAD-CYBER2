import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SessionManager,
  getSessionManager,
  resetSessionManager,
  type Session,
  type AuthenticationResult,
  type UserContext,
  type AuthStatus
} from '../../_bmad/core/security/session-manager.js';
import { TokenGenerator, type TokenClaims } from '../../_bmad/core/security/generate-token.js';

// Mock dependencies
vi.mock('fs');
vi.mock('path');
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'mock-uuid-123')
}));

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

// Mock TokenGenerator
vi.mock('../../_bmad/core/security/generate-token.js', () => ({
  TokenGenerator: vi.fn(() => ({
    decrypt: vi.fn(),
    encrypt: vi.fn()
  }))
}));

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const projectRoot = '/test/project';
  const mockTokenPath = '/test/project/.bmad-token';
  const mockKeyPath = '/test/project/.bmad-key';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock path.join
    mockPath.join.mockImplementation((...args) => args.join('/'));

    sessionManager = new SessionManager(projectRoot);
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with correct paths', () => {
      expect(mockPath.join).toHaveBeenCalledWith(projectRoot, '.bmad-token');
      expect(mockPath.join).toHaveBeenCalledWith(projectRoot, '.bmad-key');
    });

    test('should set default configuration values', () => {
      expect(sessionManager.getActiveSessionCount()).toBe(0);
    });

    test('should initialize TokenGenerator if key exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(Buffer.alloc(32, 'test-key'));

      const newSessionManager = new SessionManager(projectRoot);

      expect(mockFs.existsSync).toHaveBeenCalledWith(mockKeyPath);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(mockKeyPath);
    });

    test('should handle key reading errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      expect(() => new SessionManager(projectRoot)).not.toThrow();
    });
  });

  describe('Authentication', () => {
    beforeEach(() => {
      // Mock successful authentication setup
      mockFs.existsSync.mockImplementation((path) => {
        return path === mockKeyPath || path === mockTokenPath;
      });
      mockFs.readFileSync.mockImplementation((path) => {
        if (path === mockKeyPath) return Buffer.alloc(32, 'test-key');
        if (path === mockTokenPath) return 'mock-token-123';
        return Buffer.alloc(0);
      });

      // Mock TokenGenerator
      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue({
          sub: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['developer'],
          modules: ['core'],
          iat: '2024-01-01T00:00:00.000Z',
          exp: '2099-01-01T00:00:00.000Z', // Far future
          jti: 'token-123'
        })
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);
    });

    test('should authenticate successfully with valid token', () => {
      const result = sessionManager.authenticate();

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.userName).toBe('Test User');
      expect(result.session?.userId).toBe('user-123');
      expect(result.session?.roles).toEqual(['developer']);
      expect(result.session?.modules).toEqual(['core']);
    });

    test('should fail when key file does not exist', () => {
      mockFs.existsSync.mockImplementation((path) => path !== mockKeyPath);

      const result = sessionManager.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NO_KEY');
      expect(result.requiresAction).toBe('generate_token');
      expect(result.error).toContain('Authentication key not found');
    });

    test('should fail when token file does not exist', () => {
      mockFs.existsSync.mockImplementation((path) => path === mockKeyPath);

      const result = sessionManager.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NO_TOKEN');
      expect(result.requiresAction).toBe('generate_token');
      expect(result.error).toContain('Authentication token not found');
    });

    test('should fail when token file cannot be read', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path === mockKeyPath) return Buffer.alloc(32, 'test-key');
        if (path === mockTokenPath) throw new Error('Cannot read token');
        return Buffer.alloc(0);
      });

      const result = sessionManager.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_TOKEN');
      expect(result.requiresAction).toBe('generate_token');
    });

    test('should fail when token is invalid or expired', () => {
      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue(null)
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      // Set up conditions for TokenGenerator to be created
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('token-content');

      // Create a new SessionManager to pick up the new mock
      const testSessionManager = new SessionManager(projectRoot);
      const result = testSessionManager.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('EXPIRED_TOKEN');
      expect(result.requiresAction).toBe('generate_token');
      expect(result.error).toContain('Token is invalid or expired');
    });

    test('should warn about token expiration', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const nearExpirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue({
          sub: 'user-123',
          name: 'Test User',
          roles: ['developer'],
          modules: ['core'],
          exp: nearExpirationTime.getTime(), // Use timestamp, not ISO string
          iat: '2024-01-01T00:00:00.000Z',
          jti: 'token-123'
        })
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      // Set up conditions for TokenGenerator to be created
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('token-content');

      // Create a new SessionManager to pick up the new mock
      const testSessionManager = new SessionManager(projectRoot);
      testSessionManager.authenticate();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARNING')
      );
      consoleSpy.mockRestore();
    });

    test('should handle TokenGenerator initialization failure', () => {
      mockFs.existsSync.mockImplementation((path) => {
        if (path === mockKeyPath) return false; // Key file doesn't exist
        return true; // Token file exists
      });

      // Create a new SessionManager with the key file missing
      const testSessionManager = new SessionManager(projectRoot);
      const result = testSessionManager.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NO_KEY');
    });
  });

  describe('Session Management', () => {
    let mockSession: Session;

    beforeEach(() => {
      mockSession = {
        id: 'session-123',
        userId: 'user-123',
        userName: 'Test User',
        email: 'test@example.com',
        roles: ['developer'],
        modules: ['core'],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        lastActivity: new Date('2024-01-01T00:30:00.000Z'),
        expiresAt: new Date('2024-01-01T08:00:00.000Z')
      };
    });

    test('should create session with proper structure', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((path) => {
        if (path === mockKeyPath) return Buffer.alloc(32, 'test-key');
        if (path === mockTokenPath) return 'mock-token-123';
        return Buffer.alloc(0);
      });

      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue({
          sub: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['developer'],
          modules: ['core'],
          iat: '2024-01-01T00:00:00.000Z',
          exp: '2099-01-01T00:00:00.000Z',
          jti: 'token-123'
        })
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      const result = sessionManager.authenticate();

      expect(result.session).toBeDefined();
      expect(result.session?.id).toBeDefined();
      expect(result.session?.userId).toBe('user-123');
      expect(result.session?.userName).toBe('Test User');
      expect(result.session?.roles).toEqual(['developer']);
      expect(result.session?.modules).toEqual(['core']);
      expect(result.session?.createdAt).toBeInstanceOf(Date);
      expect(result.session?.lastActivity).toBeInstanceOf(Date);
      expect(result.session?.expiresAt).toBeInstanceOf(Date);
    });

    test('should retrieve existing session', () => {
      // Simulate existing session
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T01:00:00.000Z'));

      // First create a session
      sessionManager.authenticate = vi.fn().mockReturnValue({
        success: true,
        session: mockSession
      });

      // Manually add session to internal state
      (sessionManager as any).sessions.set(mockSession.id, mockSession);

      const retrievedSession = sessionManager.getSession(mockSession.id);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(mockSession.id);
      expect(retrievedSession?.lastActivity).toBeInstanceOf(Date);

      vi.useRealTimers();
    });

    test('should return null for non-existent session', () => {
      const session = sessionManager.getSession('non-existent');
      expect(session).toBeNull();
    });

    test('should remove expired sessions', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T10:00:00.000Z')); // After session expiry

      const expiredSession = {
        ...mockSession,
        expiresAt: new Date('2024-01-01T08:00:00.000Z') // Already expired
      };

      (sessionManager as any).sessions.set(expiredSession.id, expiredSession);

      const retrievedSession = sessionManager.getSession(expiredSession.id);
      expect(retrievedSession).toBeNull();

      vi.useRealTimers();
    });

    test('should check session max lifetime', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-02T01:00:00.000Z')); // 25 hours later

      const oldSession = {
        ...mockSession,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        expiresAt: new Date('2024-01-02T08:00:00.000Z') // Still valid
      };

      (sessionManager as any).sessions.set(oldSession.id, oldSession);

      const retrievedSession = sessionManager.getSession(oldSession.id);
      expect(retrievedSession).toBeNull(); // Should be null due to max lifetime

      vi.useRealTimers();
    });

    test('should update last activity on session access', () => {
      vi.useFakeTimers();
      const initialTime = new Date('2024-01-01T01:00:00.000Z');
      vi.setSystemTime(initialTime);

      (sessionManager as any).sessions.set(mockSession.id, { ...mockSession });

      const laterTime = new Date('2024-01-01T02:00:00.000Z');
      vi.setSystemTime(laterTime);

      const retrievedSession = sessionManager.getSession(mockSession.id);

      expect(retrievedSession?.lastActivity.getTime()).toBe(laterTime.getTime());

      vi.useRealTimers();
    });

    test('should extend session expiration on access', () => {
      vi.useFakeTimers();
      const accessTime = new Date('2024-01-01T02:00:00.000Z');
      vi.setSystemTime(accessTime);

      (sessionManager as any).sessions.set(mockSession.id, { ...mockSession });

      const retrievedSession = sessionManager.getSession(mockSession.id);

      // Should be extended by timeout minutes (480 minutes = 8 hours)
      const expectedExpiry = new Date(accessTime.getTime() + 480 * 60 * 1000);
      expect(retrievedSession?.expiresAt.getTime()).toBe(expectedExpiry.getTime());

      vi.useRealTimers();
    });
  });

  describe('User Context and Permissions', () => {
    let mockSession: Session;

    beforeEach(() => {
      mockSession = {
        id: 'session-123',
        userId: 'user-123',
        userName: 'Test User',
        email: 'test@example.com',
        roles: ['developer', 'tester'],
        modules: ['core', 'security'],
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
      };

      (sessionManager as any).sessions.set(mockSession.id, mockSession);
    });

    test('should return user context for valid session', () => {
      const context = sessionManager.getUserContext(mockSession.id);

      expect(context.authenticated).toBe(true);
      expect(context.userId).toBe('user-123');
      expect(context.userName).toBe('Test User');
      expect(context.email).toBe('test@example.com');
      expect(context.roles).toEqual(['developer', 'tester']);
      expect(context.modules).toEqual(['core', 'security']);
      expect(context.sessionId).toBe('session-123');
    });

    test('should return unauthenticated context for invalid session', () => {
      const context = sessionManager.getUserContext('invalid-session');

      expect(context.authenticated).toBe(false);
      expect(context.userId).toBeUndefined();
      expect(context.userName).toBeUndefined();
      expect(context.roles).toBeUndefined();
    });

    test('should check user roles correctly', () => {
      expect(sessionManager.hasRole(mockSession.id, 'developer')).toBe(true);
      expect(sessionManager.hasRole(mockSession.id, 'tester')).toBe(true);
      expect(sessionManager.hasRole(mockSession.id, 'admin')).toBe(false);
    });

    test('should grant admin role all permissions', () => {
      const adminSession = {
        ...mockSession,
        roles: ['admin']
      };
      (sessionManager as any).sessions.set('admin-session', adminSession);

      expect(sessionManager.hasRole('admin-session', 'any-role')).toBe(true);
    });

    test('should check multiple roles with hasAnyRole', () => {
      expect(sessionManager.hasAnyRole(mockSession.id, ['developer', 'admin'])).toBe(true);
      expect(sessionManager.hasAnyRole(mockSession.id, ['admin', 'manager'])).toBe(false);
      expect(sessionManager.hasAnyRole(mockSession.id, ['tester'])).toBe(true);
    });

    test('should return false for role checks on invalid session', () => {
      expect(sessionManager.hasRole('invalid-session', 'developer')).toBe(false);
      expect(sessionManager.hasAnyRole('invalid-session', ['developer'])).toBe(false);
    });

    test('should check module access correctly', () => {
      expect(sessionManager.hasModuleAccess(mockSession.id, 'core')).toBe(true);
      expect(sessionManager.hasModuleAccess(mockSession.id, 'security')).toBe(true);
      expect(sessionManager.hasModuleAccess(mockSession.id, 'admin')).toBe(false);
    });

    test('should grant wildcard module access', () => {
      const wildcardSession = {
        ...mockSession,
        modules: ['*']
      };
      (sessionManager as any).sessions.set('wildcard-session', wildcardSession);

      expect(sessionManager.hasModuleAccess('wildcard-session', 'any-module')).toBe(true);
    });

    test('should return false for module access on invalid session', () => {
      expect(sessionManager.hasModuleAccess('invalid-session', 'core')).toBe(false);
    });
  });

  describe('Session Termination', () => {
    test('should end individual sessions', () => {
      const mockSession: Session = {
        id: 'session-123',
        userId: 'user-123',
        userName: 'Test User',
        roles: ['developer'],
        modules: ['core'],
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
      };

      (sessionManager as any).sessions.set(mockSession.id, mockSession);
      expect(sessionManager.getActiveSessionCount()).toBe(1);

      sessionManager.endSession(mockSession.id);
      expect(sessionManager.getActiveSessionCount()).toBe(0);
    });

    test('should handle ending non-existent sessions gracefully', () => {
      expect(() => sessionManager.endSession('non-existent')).not.toThrow();
    });

    test('should end all sessions', () => {
      const session1 = { id: 'session-1', userId: 'user-1', userName: 'User 1', roles: ['user'], modules: ['core'], createdAt: new Date(), lastActivity: new Date(), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) };
      const session2 = { id: 'session-2', userId: 'user-2', userName: 'User 2', roles: ['user'], modules: ['core'], createdAt: new Date(), lastActivity: new Date(), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) };

      (sessionManager as any).sessions.set(session1.id, session1);
      (sessionManager as any).sessions.set(session2.id, session2);

      expect(sessionManager.getActiveSessionCount()).toBe(2);

      sessionManager.endAllSessions();
      expect(sessionManager.getActiveSessionCount()).toBe(0);
    });
  });

  describe('Authentication Status', () => {
    test('should return auth status when key and token exist and are valid', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((path) => {
        if (path === mockKeyPath) return Buffer.alloc(32, 'test-key');
        if (path === mockTokenPath) return 'mock-token-123';
        return Buffer.alloc(0);
      });

      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue({
          sub: 'user-123',
          name: 'Test User',
          exp: '2099-01-01T00:00:00.000Z'
        })
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      const status = sessionManager.getAuthStatus();

      expect(status.keyExists).toBe(true);
      expect(status.tokenExists).toBe(true);
      expect(status.tokenValid).toBe(true);
      expect(status.userName).toBe('Test User');
      expect(status.expiresAt).toBeInstanceOf(Date);
      expect(status.hoursUntilExpiry).toBeGreaterThan(0);
    });

    test('should return auth status when files do not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const status = sessionManager.getAuthStatus();

      expect(status.keyExists).toBe(false);
      expect(status.tokenExists).toBe(false);
      expect(status.tokenValid).toBe(false);
      expect(status.userName).toBeUndefined();
    });

    test('should return auth status when token is invalid', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('mock-token');

      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue(null)
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      const status = sessionManager.getAuthStatus();

      expect(status.keyExists).toBe(true);
      expect(status.tokenExists).toBe(true);
      expect(status.tokenValid).toBe(false);
    });

    test('should handle token reading errors in status check', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Cannot read token');
      });

      const status = sessionManager.getAuthStatus();

      expect(status.tokenValid).toBe(false);
    });
  });

  describe('Status Messages', () => {
    test('should return setup message when no key or token exists', () => {
      mockFs.existsSync.mockReturnValue(false);

      const message = sessionManager.getAuthStatusMessage();

      expect(message).toContain('Authentication Required');
      expect(message).toContain('No authentication token found');
      expect(message).toContain('npx ts-node _bmad/core/security/generate-token.ts');
    });

    test('should return expiry message when token is invalid', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid-token');

      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue(null)
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      const message = sessionManager.getAuthStatusMessage();

      expect(message).toContain('Token Expired');
      expect(message).toContain('Your authentication token has expired');
    });

    test('should return empty message when token is valid', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('valid-token');

      const mockTokenGenerator = {
        decrypt: vi.fn().mockReturnValue({
          sub: 'user-123',
          name: 'Test User',
          exp: new Date('2099-01-01T00:00:00.000Z').getTime() // Use timestamp instead of string
        })
      };
      vi.mocked(TokenGenerator).mockReturnValue(mockTokenGenerator as any);

      // Create a new SessionManager to pick up the new mock
      const testSessionManager = new SessionManager(projectRoot);
      const message = testSessionManager.getAuthStatusMessage();

      expect(message).toBe('');
    });
  });

  describe('Active Session Count', () => {
    test('should return correct active session count', () => {
      expect(sessionManager.getActiveSessionCount()).toBe(0);

      // Add sessions manually to test
      const session1 = { id: 'session-1', userId: 'user-1', userName: 'User 1', roles: ['user'], modules: ['core'], createdAt: new Date(), lastActivity: new Date(), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) };
      const session2 = { id: 'session-2', userId: 'user-2', userName: 'User 2', roles: ['user'], modules: ['core'], createdAt: new Date(), lastActivity: new Date(), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) };

      (sessionManager as any).sessions.set(session1.id, session1);
      (sessionManager as any).sessions.set(session2.id, session2);

      expect(sessionManager.getActiveSessionCount()).toBe(2);
    });

    test('should clean expired sessions before counting', () => {
      vi.useFakeTimers();
      const currentTime = new Date('2024-01-01T10:00:00.000Z');
      vi.setSystemTime(currentTime);

      const expiredSession = {
        id: 'expired-session',
        userId: 'user-1',
        userName: 'User 1',
        roles: ['user'],
        modules: ['core'],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        lastActivity: new Date('2024-01-01T01:00:00.000Z'),
        expiresAt: new Date('2024-01-01T08:00:00.000Z') // Already expired
      };

      const validSession = {
        id: 'valid-session',
        userId: 'user-2',
        userName: 'User 2',
        roles: ['user'],
        modules: ['core'],
        createdAt: new Date('2024-01-01T09:00:00.000Z'),
        lastActivity: new Date('2024-01-01T09:30:00.000Z'),
        expiresAt: new Date('2024-01-01T17:00:00.000Z') // Still valid
      };

      (sessionManager as any).sessions.set(expiredSession.id, expiredSession);
      (sessionManager as any).sessions.set(validSession.id, validSession);

      const count = sessionManager.getActiveSessionCount();
      expect(count).toBe(1); // Only the valid session

      vi.useRealTimers();
    });
  });
});

describe('Singleton Functions', () => {
  afterEach(() => {
    resetSessionManager();
  });

  describe('getSessionManager', () => {
    test('should create and return session manager instance', () => {
      const manager = getSessionManager('/test/root');

      expect(manager).toBeInstanceOf(SessionManager);
    });

    test('should return same instance on subsequent calls', () => {
      const manager1 = getSessionManager('/test/root');
      const manager2 = getSessionManager();

      expect(manager1).toBe(manager2);
    });

    test('should throw error if called without projectRoot when not initialized', () => {
      expect(() => getSessionManager()).toThrow('SessionManager not initialized');
    });

    test('should not require projectRoot if already initialized', () => {
      getSessionManager('/test/root');
      expect(() => getSessionManager()).not.toThrow();
    });
  });

  describe('resetSessionManager', () => {
    test('should reset session manager and clear sessions', () => {
      const manager = getSessionManager('/test/root');

      // Add a mock session
      (manager as any).sessions.set('test-session', {
        id: 'test-session',
        userId: 'user-1',
        userName: 'User 1',
        roles: ['user'],
        modules: ['core'],
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
      });

      expect(manager.getActiveSessionCount()).toBe(1);

      resetSessionManager();

      expect(() => getSessionManager()).toThrow('SessionManager not initialized');
    });

    test('should handle reset when no session manager exists', () => {
      expect(() => resetSessionManager()).not.toThrow();
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPath.join.mockImplementation((...args) => args.join('/'));
    sessionManager = new SessionManager('/test/project');
  });

  test('should handle concurrent session operations', () => {
    const session = {
      id: 'concurrent-session',
      userId: 'user-1',
      userName: 'User 1',
      roles: ['user'],
      modules: ['core'],
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
    };

    (sessionManager as any).sessions.set(session.id, session);

    // Simulate concurrent access
    const promises = Array.from({ length: 10 }, () =>
      Promise.resolve(sessionManager.getSession(session.id))
    );

    return Promise.all(promises).then(results => {
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result?.id).toBe(session.id);
      });
    });
  });

  test('should handle missing optional session fields', () => {
    const minimalSession = {
      id: 'minimal-session',
      userId: 'user-1',
      userName: 'User 1',
      roles: ['user'],
      modules: ['core'],
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
      // email is optional and missing
    };

    (sessionManager as any).sessions.set(minimalSession.id, minimalSession);

    const context = sessionManager.getUserContext(minimalSession.id);

    expect(context.authenticated).toBe(true);
    expect(context.email).toBeUndefined();
  });

  test('should handle extremely large session counts', () => {
    // Add many sessions
    for (let i = 0; i < 1000; i++) {
      const session = {
        id: `session-${i}`,
        userId: `user-${i}`,
        userName: `User ${i}`,
        roles: ['user'],
        modules: ['core'],
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
      };
      (sessionManager as any).sessions.set(session.id, session);
    }

    const count = sessionManager.getActiveSessionCount();
    expect(count).toBe(1000);

    sessionManager.endAllSessions();
    expect(sessionManager.getActiveSessionCount()).toBe(0);
  });

  test('should handle invalid session IDs gracefully', () => {
    const invalidIds = [null, undefined, '', '   ', 'invalid-id'];

    invalidIds.forEach(id => {
      expect(sessionManager.getSession(id as string)).toBeNull();
      expect(sessionManager.getUserContext(id as string).authenticated).toBe(false);
      expect(sessionManager.hasRole(id as string, 'user')).toBe(false);
      expect(sessionManager.hasModuleAccess(id as string, 'core')).toBe(false);
    });
  });

  test('should handle system time changes gracefully', () => {
    vi.useFakeTimers();

    const baseTime = new Date('2024-01-01T12:00:00.000Z');
    vi.setSystemTime(baseTime);

    const session = {
      id: 'time-test-session',
      userId: 'user-1',
      userName: 'User 1',
      roles: ['user'],
      modules: ['core'],
      createdAt: baseTime,
      lastActivity: baseTime,
      expiresAt: new Date(baseTime.getTime() + 8 * 60 * 60 * 1000)
    };

    (sessionManager as any).sessions.set(session.id, session);

    // Jump forward in time past expiration (expires at 20:00, jump to 20:01)
    vi.setSystemTime(new Date('2024-01-01T20:01:00.000Z'));

    const retrievedSession = sessionManager.getSession(session.id);
    expect(retrievedSession).toBeNull(); // Should be expired

    vi.useRealTimers();
  });

  test('should handle role and module arrays with special characters', () => {
    const session = {
      id: 'special-chars-session',
      userId: 'user-1',
      userName: 'User 1',
      roles: ['role:admin', 'team/lead', 'org@domain.com'],
      modules: ['module-1', 'module_2', 'module.3', 'module with spaces'],
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
    };

    (sessionManager as any).sessions.set(session.id, session);

    expect(sessionManager.hasRole(session.id, 'role:admin')).toBe(true);
    expect(sessionManager.hasRole(session.id, 'team/lead')).toBe(true);
    expect(sessionManager.hasRole(session.id, 'org@domain.com')).toBe(true);

    expect(sessionManager.hasModuleAccess(session.id, 'module-1')).toBe(true);
    expect(sessionManager.hasModuleAccess(session.id, 'module_2')).toBe(true);
    expect(sessionManager.hasModuleAccess(session.id, 'module.3')).toBe(true);
    expect(sessionManager.hasModuleAccess(session.id, 'module with spaces')).toBe(true);
  });
});