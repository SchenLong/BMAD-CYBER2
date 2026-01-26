import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import {
  AuthManager,
  RBACManager,
  createAuthManager,
  quickAuth,
  requireAuth,
  requirePermission,
  type AuthConfig,
  type UserCredentials,
  type AuthToken,
  type AuthContext,
  type Permission,
  type Role
} from '../../_bmad/framework/auth/index.js';

// Mock crypto
vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof crypto>();
  return {
    ...actual,
    randomUUID: vi.fn(() => 'test-uuid-123')
  };
});

// Mock token generation/validation functions
let tokenCounter = 0;
vi.mock('../../_bmad/core/security/generate-token.js', () => ({
  generateToken: vi.fn(() => Promise.resolve(`mock-token-${++tokenCounter}`))
}));

vi.mock('../../_bmad/core/security/validate-token.js', () => ({
  validateToken: vi.fn(() => Promise.resolve(true))
}));

vi.mock('../../_bmad/core/security/check-authorization.js', () => ({
  checkAuthorization: vi.fn(() => Promise.resolve(true))
}));

vi.mock('../../_bmad/core/security/session-manager.js', () => ({
  SessionManager: vi.fn(() => ({
    authenticate: vi.fn(),
    getSession: vi.fn(),
    endSession: vi.fn()
  }))
}));

describe('RBACManager', () => {
  let rbacManager: RBACManager;

  beforeEach(() => {
    rbacManager = new RBACManager();
  });

  describe('Role Management', () => {
    test('should define and retrieve roles', () => {
      const role: Role = {
        name: 'admin',
        description: 'Administrator role',
        permissions: [{ resource: '*', action: '*' }]
      };

      rbacManager.defineRole(role);
      expect(rbacManager.getUserRoles('test-user')).toEqual([]);
    });

    test('should assign roles to users', () => {
      const role: Role = {
        name: 'developer',
        description: 'Developer role',
        permissions: [{ resource: 'modules', action: 'read' }]
      };

      rbacManager.defineRole(role);
      rbacManager.assignRoles('user1', ['developer']);

      expect(rbacManager.getUserRoles('user1')).toEqual(['developer']);
      expect(rbacManager.hasRole('user1', ['developer'])).toBe(true);
    });

    test('should remove user roles', () => {
      rbacManager.assignRoles('user1', ['admin', 'developer']);
      expect(rbacManager.getUserRoles('user1')).toEqual(['admin', 'developer']);

      rbacManager.removeUserRole('user1', 'admin');
      expect(rbacManager.getUserRoles('user1')).toEqual(['developer']);
    });

    test('should handle role inheritance', () => {
      const baseRole: Role = {
        name: 'base',
        description: 'Base role',
        permissions: [{ resource: 'logs', action: 'read' }]
      };

      const adminRole: Role = {
        name: 'admin',
        description: 'Admin role',
        permissions: [{ resource: 'modules', action: '*' }],
        inherits: ['base']
      };

      rbacManager.defineRole(baseRole);
      rbacManager.defineRole(adminRole);
      rbacManager.assignRoles('user1', ['admin']);

      const permissions = rbacManager.getUserPermissions('user1');
      expect(permissions).toHaveLength(2);
      expect(permissions).toContainEqual({ resource: 'logs', action: 'read' });
      expect(permissions).toContainEqual({ resource: 'modules', action: '*' });
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      const role: Role = {
        name: 'developer',
        description: 'Developer role',
        permissions: [
          { resource: 'modules', action: 'read' },
          { resource: 'modules', action: 'write' },
          { resource: 'tests', action: '*' }
        ]
      };
      rbacManager.defineRole(role);
      rbacManager.assignRoles('user1', ['developer']);
    });

    test('should check specific permissions', () => {
      expect(rbacManager.hasPermission('user1', 'modules', 'read')).toBe(true);
      expect(rbacManager.hasPermission('user1', 'modules', 'write')).toBe(true);
      expect(rbacManager.hasPermission('user1', 'modules', 'delete')).toBe(false);
    });

    test('should handle wildcard permissions', () => {
      expect(rbacManager.hasPermission('user1', 'tests', 'read')).toBe(true);
      expect(rbacManager.hasPermission('user1', 'tests', 'write')).toBe(true);
      expect(rbacManager.hasPermission('user1', 'tests', 'delete')).toBe(true);
    });

    test('should handle wildcard resources', () => {
      const adminRole: Role = {
        name: 'admin',
        description: 'Admin role',
        permissions: [{ resource: '*', action: '*' }]
      };
      rbacManager.defineRole(adminRole);
      rbacManager.assignRoles('user2', ['admin']);

      expect(rbacManager.hasPermission('user2', 'anything', 'everything')).toBe(true);
    });

    test('should return false for non-existent users', () => {
      expect(rbacManager.hasPermission('nonexistent', 'modules', 'read')).toBe(false);
    });
  });

  describe('Circular Inheritance Protection', () => {
    test('should handle circular inheritance gracefully', () => {
      const roleA: Role = {
        name: 'roleA',
        description: 'Role A',
        permissions: [{ resource: 'resourceA', action: 'read' }],
        inherits: ['roleB']
      };

      const roleB: Role = {
        name: 'roleB',
        description: 'Role B',
        permissions: [{ resource: 'resourceB', action: 'read' }],
        inherits: ['roleA']
      };

      rbacManager.defineRole(roleA);
      rbacManager.defineRole(roleB);
      rbacManager.assignRoles('user1', ['roleA']);

      // Should not cause infinite loop
      const permissions = rbacManager.getUserPermissions('user1');
      expect(permissions).toHaveLength(2);
    });
  });
});

describe('AuthManager', () => {
  let authManager: AuthManager;
  const mockConfig: AuthConfig = {
    tokenExpiry: 3600,
    secretKey: 'test-secret-key',
    enableRBAC: true
  };

  beforeEach(() => {
    authManager = new AuthManager(mockConfig);
    tokenCounter = 0; // Reset token counter for consistent tests
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default config', () => {
      const defaultAuthManager = new AuthManager();
      expect(defaultAuthManager.getActiveSessionsCount()).toBe(0);
    });

    test('should initialize with custom config', () => {
      const customConfig: AuthConfig = {
        tokenExpiry: 7200,
        algorithm: 'RS256',
        issuer: 'test-issuer'
      };
      const customAuthManager = new AuthManager(customConfig);
      expect(customAuthManager.getActiveSessionsCount()).toBe(0);
    });

    test('should have default roles defined', () => {
      const rbac = authManager.getRBACManager();
      rbac.assignRoles('test-user', ['admin']);
      expect(rbac.hasRole('test-user', ['admin'])).toBe(true);
    });
  });

  describe('Authentication', () => {
    const credentials: UserCredentials = {
      username: 'testuser',
      email: 'test@example.com',
      roles: ['developer']
    };

    test('should authenticate valid credentials', async () => {
      const token = await authManager.authenticate(credentials);

      expect(token).toBeDefined();
      expect(token?.accessToken).toBe('mock-token-1');
      expect(token?.tokenType).toBe('Bearer');
      expect(token?.expiresIn).toBe(3600);
      expect(token?.scope).toEqual(['developer']);
    });

    test('should handle authentication errors gracefully', async () => {
      const { generateToken } = await import('../../_bmad/core/security/generate-token.js');
      vi.mocked(generateToken).mockRejectedValueOnce(new Error('Token generation failed'));

      const token = await authManager.authenticate(credentials);
      expect(token).toBeNull();
    });

    test('should assign default guest role if no roles provided', async () => {
      const credentialsNoRoles: UserCredentials = {
        username: 'testuser'
      };

      const token = await authManager.authenticate(credentialsNoRoles);
      expect(token?.scope).toEqual(['guest']);
    });

    test('should create auth context in session', async () => {
      const token = await authManager.authenticate(credentials);
      expect(authManager.getActiveSessionsCount()).toBe(1);
    });
  });

  describe('Token Validation', () => {
    test('should validate valid tokens', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        roles: ['developer']
      };

      const token = await authManager.authenticate(credentials);
      const authContext = await authManager.validateAuthToken(token?.accessToken || '');

      expect(authContext).toBeDefined();
      expect(authContext?.username).toBe('testuser');
      expect(authContext?.roles).toEqual(['developer']);
      expect(authContext?.isAuthenticated).toBe(true);
    });

    test('should reject invalid tokens', async () => {
      const { validateToken } = await import('../../_bmad/core/security/validate-token.js');
      vi.mocked(validateToken).mockResolvedValueOnce(false);

      const authContext = await authManager.validateAuthToken('invalid-token');
      expect(authContext).toBeNull();
    });

    test('should handle validation errors', async () => {
      const { validateToken } = await import('../../_bmad/core/security/validate-token.js');
      vi.mocked(validateToken).mockRejectedValueOnce(new Error('Validation failed'));

      const authContext = await authManager.validateAuthToken('error-token');
      expect(authContext).toBeNull();
    });
  });

  describe('Authorization', () => {
    test('should authorize user with valid permissions', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        roles: ['developer']
      };

      const token = await authManager.authenticate(credentials);
      const isAuthorized = await authManager.authorize(token?.accessToken || '', 'modules', 'read');

      expect(isAuthorized).toBe(true);
    });

    test('should deny authorization for invalid tokens', async () => {
      const isAuthorized = await authManager.authorize('invalid-token', 'modules', 'read');
      expect(isAuthorized).toBe(false);
    });

    test('should deny authorization for insufficient permissions', async () => {
      const credentials: UserCredentials = {
        username: 'testuser',
        roles: ['guest']
      };

      await authManager.authenticate(credentials);
      const isAuthorized = await authManager.authorize('mock-token-123', 'admin', 'write');

      expect(isAuthorized).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should track active sessions', async () => {
      expect(authManager.getActiveSessionsCount()).toBe(0);

      await authManager.authenticate({ username: 'user1', roles: ['developer'] });
      expect(authManager.getActiveSessionsCount()).toBe(1);

      await authManager.authenticate({ username: 'user2', roles: ['admin'] });
      expect(authManager.getActiveSessionsCount()).toBe(2);
    });

    test('should logout and invalidate session', async () => {
      const token = await authManager.authenticate({ username: 'user1', roles: ['developer'] });
      expect(authManager.getActiveSessionsCount()).toBe(1);

      authManager.logout(token?.accessToken || '');
      expect(authManager.getActiveSessionsCount()).toBe(0);
    });

    test('should handle logout of non-existent session', () => {
      authManager.logout('non-existent-token');
      expect(authManager.getActiveSessionsCount()).toBe(0);
    });
  });
});

describe('Helper Functions', () => {
  describe('createAuthManager', () => {
    test('should create auth manager with default config', () => {
      const manager = createAuthManager();
      expect(manager).toBeInstanceOf(AuthManager);
      expect(manager.getActiveSessionsCount()).toBe(0);
    });

    test('should create auth manager with custom config', () => {
      const config: AuthConfig = {
        tokenExpiry: 7200,
        enableRBAC: false
      };
      const manager = createAuthManager(config);
      expect(manager).toBeInstanceOf(AuthManager);
    });
  });

  describe('quickAuth', () => {
    test('should generate quick auth token', async () => {
      const token = await quickAuth('testuser', ['admin']);

      expect(token).toBeDefined();
      expect(token?.accessToken).toBe('mock-token-1');
      expect(token?.scope).toEqual(['admin']);
    });

    test('should use default guest role', async () => {
      const token = await quickAuth('testuser');

      expect(token).toBeDefined();
      expect(token?.scope).toEqual(['guest']);
    });
  });
});

describe('Middleware Functions', () => {
  let authManager: AuthManager;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    tokenCounter = 0; // Reset token counter
    authManager = new AuthManager();
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('requireAuth middleware', () => {
    test('should pass with valid bearer token', async () => {
      // Mock successful authentication and get the actual token
      const token = await authManager.authenticate({ username: 'testuser', roles: ['developer'] });
      mockReq.headers.authorization = `Bearer ${token?.accessToken}`;

      const middleware = requireAuth(authManager);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.auth).toBeDefined();
    });

    test('should reject request without authorization header', async () => {
      const middleware = requireAuth(authManager);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No valid authorization token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with invalid bearer token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      const middleware = requireAuth(authManager);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with malformed authorization header', async () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      const middleware = requireAuth(authManager);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePermission middleware', () => {
    beforeEach(async () => {
      // Set up authenticated request
      const token = await authManager.authenticate({ username: 'testuser', roles: ['developer'] });
      mockReq.auth = {
        userId: 'testuser',
        username: 'testuser',
        roles: ['developer'],
        permissions: ['modules:read', 'modules:write', 'tests:*', 'logs:read'],
        sessionId: 'test-session-id',
        isAuthenticated: true
      };
      mockReq.headers.authorization = `Bearer ${token?.accessToken}`;
    });

    test('should pass with sufficient permissions', async () => {
      const middleware = requirePermission(authManager, 'modules', 'read');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject without auth context', async () => {
      delete mockReq.auth;

      const middleware = requirePermission(authManager, 'modules', 'read');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject with insufficient permissions', async () => {
      const middleware = requirePermission(authManager, 'admin', 'delete');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    tokenCounter = 0; // Reset token counter
    authManager = new AuthManager();
  });

  test('should handle undefined username in credentials', async () => {
    const credentials = {
      username: undefined as any,
      roles: ['guest']
    };

    const token = await authManager.authenticate(credentials);
    expect(token).toBeNull();
  });

  test('should handle empty roles array', async () => {
    const credentials: UserCredentials = {
      username: 'testuser',
      roles: []
    };

    const token = await authManager.authenticate(credentials);
    expect(token?.scope).toEqual(['guest']);
  });

  test('should handle concurrent authentication requests', async () => {
    const credentials1: UserCredentials = {
      username: 'user1',
      roles: ['developer']
    };
    const credentials2: UserCredentials = {
      username: 'user2',
      roles: ['admin']
    };

    const [token1, token2] = await Promise.all([
      authManager.authenticate(credentials1),
      authManager.authenticate(credentials2)
    ]);

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(authManager.getActiveSessionsCount()).toBe(2);
  });

  test('should handle role with empty permissions array', () => {
    const rbac = authManager.getRBACManager();
    const role: Role = {
      name: 'empty',
      description: 'Empty role',
      permissions: []
    };

    rbac.defineRole(role);
    rbac.assignRoles('user1', ['empty']);

    expect(rbac.hasPermission('user1', 'any', 'action')).toBe(false);
  });

  test('should handle deeply nested role inheritance', () => {
    const rbac = authManager.getRBACManager();

    const roles: Role[] = [
      {
        name: 'level1',
        description: 'Level 1',
        permissions: [{ resource: 'level1', action: 'read' }]
      },
      {
        name: 'level2',
        description: 'Level 2',
        permissions: [{ resource: 'level2', action: 'read' }],
        inherits: ['level1']
      },
      {
        name: 'level3',
        description: 'Level 3',
        permissions: [{ resource: 'level3', action: 'read' }],
        inherits: ['level2']
      }
    ];

    roles.forEach(role => rbac.defineRole(role));
    rbac.assignRoles('user1', ['level3']);

    const permissions = rbac.getUserPermissions('user1');
    expect(permissions).toHaveLength(3);
    expect(rbac.hasPermission('user1', 'level1', 'read')).toBe(true);
    expect(rbac.hasPermission('user1', 'level2', 'read')).toBe(true);
    expect(rbac.hasPermission('user1', 'level3', 'read')).toBe(true);
  });
});