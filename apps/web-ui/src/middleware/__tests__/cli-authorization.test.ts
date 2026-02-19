/**
 * CLI Authorization Middleware Tests
 * Story 5.5: CLI Bridge Security Middleware - Task 11
 */

import {
  cliAuthorizationMiddleware,
  hasRequiredRole,
  hasAnyRole,
  commandExists,
  getCommandDefinition,
  checkAuthorization,
} from '../cli-authorization';
import { ROLE_HIERARCHY_LEVELS } from '@/lib/auth/permissions';
import type { AuthContext } from '@/types/cli-security';

// Mock the allowed commands
jest.mock('@/lib/cli-bridge/allowed-commands', () => ({
  ALLOWED_COMMANDS: {
    'mission.list': {
      id: 'mission.list',
      command: 'bmad',
      args: ['list', 'missions'],
      timeout: 30000,
      allowedRoles: ['READONLY', 'USER', 'ADMIN', 'SUPERADMIN'],
      description: 'List all available missions',
      category: 'project',
      enabled: true,
    },
    'mission.create': {
      id: 'mission.create',
      command: 'bmad',
      args: ['mission', 'create'],
      timeout: 60000,
      allowedRoles: ['ADMIN', 'SUPERADMIN'],
      description: 'Create a new mission',
      category: 'project',
      enabled: true,
    },
    'workflow.execute': {
      id: 'workflow.execute',
      command: 'bmad',
      args: ['workflow', 'execute'],
      timeout: 300000,
      allowedRoles: ['USER', 'ADMIN', 'SUPERADMIN'],
      description: 'Execute a workflow',
      category: 'workflow',
      enabled: true,
    },
    'disabled.command': {
      id: 'disabled.command',
      command: 'bmad',
      args: ['disabled'],
      timeout: 10000,
      allowedRoles: ['ADMIN'],
      description: 'A disabled command',
      category: 'test',
      enabled: false,
    },
  },
}));

describe('cli-authorization', () => {
  let mockRequest: any;
  let authContext: AuthContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock request
    mockRequest = {
      headers: new Headers(),
    };

    // Default auth context (USER role)
    authContext = {
      userId: 'test-user-id',
      email: 'test@example.com',
      roles: ['USER'],
      ip: '192.168.1.1',
      userAgent: 'TestAgent/1.0',
    };
  });

  describe('cliAuthorizationMiddleware', () => {
    it('should return 404 for non-existent command', async () => {
      const result = await cliAuthorizationMiddleware(mockRequest, authContext, 'nonexistent.command');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(404);
    });

    it('should return 403 when user lacks required role', async () => {
      const result = await cliAuthorizationMiddleware(mockRequest, authContext, 'mission.create');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it('should return 503 for disabled command', async () => {
      const adminAuth = { ...authContext, roles: ['ADMIN'] };
      const result = await cliAuthorizationMiddleware(mockRequest, adminAuth, 'disabled.command');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(503);
    });

    it('should return null when user has required role', async () => {
      const result = await cliAuthorizationMiddleware(mockRequest, authContext, 'mission.list');

      expect(result).toBeNull(); // null means authorized
    });

    it('should allow ADMIN to execute ADMIN-only commands', async () => {
      const adminAuth = { ...authContext, roles: ['ADMIN'] };
      const result = await cliAuthorizationMiddleware(mockRequest, adminAuth, 'mission.create');

      expect(result).toBeNull(); // authorized
    });

    it('should allow SUPERADMIN to execute any command', async () => {
      const superAdminAuth = { ...authContext, roles: ['SUPERADMIN'] };
      const result = await cliAuthorizationMiddleware(mockRequest, superAdminAuth, 'mission.create');

      expect(result).toBeNull(); // authorized
    });

    it('should allow READONLY user to read-only commands', async () => {
      const readonlyAuth = { ...authContext, roles: ['READONLY'] };
      const result = await cliAuthorizationMiddleware(mockRequest, readonlyAuth, 'mission.list');

      expect(result).toBeNull(); // authorized
    });
  });

  describe('hasRequiredRole', () => {
    it('should return true when user role level meets or exceeds required', () => {
      // USER (50) >= USER (50)
      expect(hasRequiredRole(['USER'], ['USER'])).toBe(true);
      // ADMIN (75) >= USER (50)
      expect(hasRequiredRole(['ADMIN'], ['USER'])).toBe(true);
      // SUPERADMIN (100) >= ADMIN (75)
      expect(hasRequiredRole(['SUPERADMIN'], ['ADMIN'])).toBe(true);
    });

    it('should return false when user role level is below required', () => {
      // READONLY (25) < USER (50)
      expect(hasRequiredRole(['READONLY'], ['USER'])).toBe(false);
      // USER (50) < ADMIN (75)
      expect(hasRequiredRole(['USER'], ['ADMIN'])).toBe(false);
    });

    it('should use maximum user role level', () => {
      // User has both USER and ADMIN, should use ADMIN (75)
      expect(hasRequiredRole(['USER', 'ADMIN'], ['ADMIN'])).toBe(true);
    });

    it('should use minimum required role level', () => {
      // Command allows USER or ADMIN, should use USER (50)
      expect(hasRequiredRole(['ADMIN'], ['USER', 'ADMIN'])).toBe(true);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has at least one required role', () => {
      expect(hasAnyRole(['USER'], ['USER', 'ADMIN'])).toBe(true);
      expect(hasAnyRole(['ADMIN'], ['USER', 'ADMIN'])).toBe(true);
      expect(hasAnyRole(['USER'], ['USER'])).toBe(true);
    });

    it('should return false when user has none of the required roles', () => {
      expect(hasAnyRole(['USER'], ['ADMIN', 'SUPERADMIN'])).toBe(false);
      expect(hasAnyRole(['READONLY'], ['USER', 'ADMIN'])).toBe(false);
    });
  });

  describe('commandExists', () => {
    it('should return true for existing commands', () => {
      expect(commandExists('mission.list')).toBe(true);
      expect(commandExists('workflow.execute')).toBe(true);
    });

    it('should return false for non-existent commands', () => {
      expect(commandExists('nonexistent.command')).toBe(false);
      expect(commandExists('')).toBe(false);
    });
  });

  describe('getCommandDefinition', () => {
    it('should return command definition for existing command', () => {
      const def = getCommandDefinition('mission.list');
      expect(def).toBeDefined();
      expect(def?.id).toBe('mission.list');
      expect(def?.category).toBe('project');
    });

    it('should return undefined for non-existent command', () => {
      const def = getCommandDefinition('nonexistent.command');
      expect(def).toBeUndefined();
    });
  });

  describe('checkAuthorization', () => {
    it('should return authorized: true for authorized user', () => {
      const result = checkAuthorization(authContext, 'mission.list');
      expect(result.authorized).toBe(true);
      expect('command' in result).toBe(true);
    });

    it('should return authorized: false with not_found reason for nonexistent command', () => {
      const result = checkAuthorization(authContext, 'nonexistent.command');
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('should return authorized: false with insufficient_permissions reason', () => {
      const result = checkAuthorization(authContext, 'mission.create');
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.reason).toBe('insufficient_permissions');
        expect(result.requiredRoles).toEqual(['ADMIN', 'SUPERADMIN']);
        expect(result.userRoles).toEqual(['USER']);
      }
    });

    it('should return authorized: false with disabled reason for disabled command', () => {
      const adminAuth = { ...authContext, roles: ['ADMIN'] };
      const result = checkAuthorization(adminAuth, 'disabled.command');
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.reason).toBe('disabled');
      }
    });
  });

  describe('SUPERADMIN role bypass', () => {
    it('should allow SUPERADMIN for commands requiring ADMIN', () => {
      const superAdminAuth = { ...authContext, roles: ['SUPERADMIN'] };
      const result = checkAuthorization(superAdminAuth, 'mission.create');
      expect(result.authorized).toBe(true);
    });

    it('should allow SUPERADMIN for all commands', () => {
      const superAdminAuth = { ...authContext, roles: ['SUPERADMIN'] };
      const result = checkAuthorization(superAdminAuth, 'workflow.execute');
      expect(result.authorized).toBe(true);
    });
  });

  describe('ADMIN role bypass', () => {
    it('should allow ADMIN to access USER commands', () => {
      const adminAuth = { ...authContext, roles: ['ADMIN'] };
      const result = checkAuthorization(adminAuth, 'workflow.execute');
      expect(result.authorized).toBe(true);
    });
  });
});
