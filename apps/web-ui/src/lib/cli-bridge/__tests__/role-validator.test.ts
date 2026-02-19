/**
 * CLI Bridge Role Validator Tests
 * Story 5.1: Command Whitelist System - Task 4
 */

import { describe, it, expect } from '@jest/globals';
import {
  meetsMinimumRole,
  canExecuteCommand,
  findMinimumRequiredRole,
  canTargetRole,
  hasAnyRole,
  assertCanExecute,
  assertMinimumRole,
  filterCommandsByRole,
  getExecutableCommands,
  apiRoleCanExecute,
  isValidHierarchy,
  getRoleDisplayName,
  getAllowedRolesForCommand,
  isAdminRole,
  canPerformAdminActions,
  ROLE_CATEGORIES,
} from '../role-validator';
import { UserRole } from '@prisma/client';
import type { CommandDefinition } from '../types';

describe('meetsMinimumRole', () => {
  it('should return true when user role equals required', () => {
    expect(meetsMinimumRole(UserRole.USER, UserRole.USER)).toBe(true);
    expect(meetsMinimumRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
  });

  it('should return true when user role is higher than required', () => {
    expect(meetsMinimumRole(UserRole.ADMIN, UserRole.USER)).toBe(true);
    expect(meetsMinimumRole(UserRole.SUPERADMIN, UserRole.ADMIN)).toBe(true);
    expect(meetsMinimumRole(UserRole.SUPERADMIN, UserRole.USER)).toBe(true);
  });

  it('should return false when user role is lower than required', () => {
    expect(meetsMinimumRole(UserRole.USER, UserRole.ADMIN)).toBe(false);
    expect(meetsMinimumRole(UserRole.READONLY, UserRole.USER)).toBe(false);
  });
});

describe('canExecuteCommand', () => {
  const mockCommand: CommandDefinition = {
    id: 'test.command',
    command: 'test',
    args: [],
    timeout: 30000,
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Test command',
    category: 'project',
  };

  const adminOnlyCommand: CommandDefinition = {
    id: 'admin.command',
    command: 'admin',
    args: [],
    timeout: 30000,
    allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Admin only command',
    category: 'security',
  };

  it('should allow user with matching role', () => {
    const result = canExecuteCommand(mockCommand, UserRole.USER);
    expect(result.allowed).toBe(true);
    expect(result.userRole).toBe(UserRole.USER);
  });

  it('should allow admin with user-level command', () => {
    const result = canExecuteCommand(mockCommand, UserRole.ADMIN);
    expect(result.allowed).toBe(true);
  });

  it('should deny user for admin-only command', () => {
    const result = canExecuteCommand(adminOnlyCommand, UserRole.USER);
    expect(result.allowed).toBe(false);
    expect(result.requiredRole).toBeDefined();
    expect(result.error).toContain('requires role');
    expect(result.error).toContain('ADMIN');
  });

  it('should deny readonly user for user-level command', () => {
    const result = canExecuteCommand(mockCommand, UserRole.READONLY);
    expect(result.allowed).toBe(false);
  });
});

describe('findMinimumRequiredRole', () => {
  it('should return lowest role from list', () => {
    const roles = [UserRole.ADMIN, UserRole.USER, UserRole.SUPERADMIN];
    const minRole = findMinimumRequiredRole(roles);
    expect(minRole).toBe(UserRole.USER);
  });

  it('should handle single role', () => {
    const roles = [UserRole.ADMIN];
    const minRole = findMinimumRequiredRole(roles);
    expect(minRole).toBe(UserRole.ADMIN);
  });

  it('should return READONLY for empty array', () => {
    const minRole = findMinimumRequiredRole([]);
    expect(minRole).toBe(UserRole.READONLY);
  });
});

describe('canTargetRole', () => {
  it('should allow targeting lower role', () => {
    expect(canTargetRole(UserRole.ADMIN, UserRole.USER)).toBe(true);
    expect(canTargetRole(UserRole.SUPERADMIN, UserRole.ADMIN)).toBe(true);
  });

  it('should deny targeting same or higher role', () => {
    expect(canTargetRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(false);
    expect(canTargetRole(UserRole.USER, UserRole.ADMIN)).toBe(false);
  });
});

describe('hasAnyRole', () => {
  it('should return true when role is in allowed list', () => {
    expect(hasAnyRole(UserRole.USER, [UserRole.USER, UserRole.ADMIN])).toBe(true);
    expect(hasAnyRole(UserRole.ADMIN, [UserRole.USER, UserRole.ADMIN])).toBe(true);
  });

  it('should return false when role is not in allowed list', () => {
    expect(hasAnyRole(UserRole.READONLY, [UserRole.USER, UserRole.ADMIN])).toBe(false);
  });
});

describe('assertCanExecute', () => {
  const mockCommand: CommandDefinition = {
    id: 'test.command',
    command: 'test',
    args: [],
    timeout: 30000,
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN],
    description: 'Test command',
    category: 'project',
  };

  it('should not throw when user has permission', () => {
    expect(() => assertCanExecute(mockCommand, UserRole.USER)).not.toThrow();
  });

  it('should throw when user lacks permission', () => {
    expect(() => assertCanExecute(mockCommand, UserRole.READONLY)).toThrow();
  });
});

describe('assertMinimumRole', () => {
  it('should not throw when user meets requirement', () => {
    expect(() => assertMinimumRole(UserRole.ADMIN, UserRole.USER)).not.toThrow();
    expect(() => assertMinimumRole(UserRole.ADMIN, UserRole.ADMIN)).not.toThrow();
  });

  it('should throw when user does not meet requirement', () => {
    expect(() => assertMinimumRole(UserRole.USER, UserRole.ADMIN)).toThrow();
  });
});

describe('filterCommandsByRole', () => {
  const commands: CommandDefinition[] = [
    {
      id: 'user.command',
      command: 'user',
      args: [],
      timeout: 30000,
      allowedRoles: [UserRole.USER, UserRole.ADMIN],
      description: 'User command',
      category: 'project',
    },
    {
      id: 'admin.command',
      command: 'admin',
      args: [],
      timeout: 30000,
      allowedRoles: [UserRole.ADMIN, UserRole.SUPERADMIN],
      description: 'Admin command',
      category: 'security',
    },
    {
      id: 'readonly.command',
      command: 'readonly',
      args: [],
      timeout: 30000,
      allowedRoles: [UserRole.READONLY, UserRole.USER, UserRole.ADMIN],
      description: 'Readonly command',
      category: 'project',
    },
  ];

  it('should filter commands for USER role', () => {
    const filtered = filterCommandsByRole(commands, UserRole.USER);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(['user.command', 'readonly.command']);
  });

  it('should filter commands for ADMIN role', () => {
    const filtered = filterCommandsByRole(commands, UserRole.ADMIN);
    expect(filtered).toHaveLength(3);
  });

  it('should filter commands for READONLY role', () => {
    const filtered = filterCommandsByRole(commands, UserRole.READONLY);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('readonly.command');
  });
});

describe('getExecutableCommands', () => {
  const commands: CommandDefinition[] = [
    {
      id: 'user.command',
      command: 'user',
      args: [],
      timeout: 30000,
      allowedRoles: [UserRole.USER, UserRole.ADMIN],
      description: 'User command',
      category: 'project',
    },
    {
      id: 'admin.command',
      command: 'admin',
      args: [],
      timeout: 30000,
      allowedRoles: [UserRole.ADMIN],
      description: 'Admin command',
      category: 'security',
    },
  ];

  it('should return only commands user can execute', () => {
    const executable = getExecutableCommands(UserRole.USER, commands);
    expect(executable).toHaveLength(1);
    expect(executable[0].id).toBe('user.command');
  });
});

describe('apiRoleCanExecute', () => {
  const apiCommand: CommandDefinition = {
    id: 'api.command',
    command: 'api',
    args: [],
    timeout: 30000,
    allowedRoles: [UserRole.API, UserRole.USER],
    description: 'API command',
    category: 'project',
  };

  const userCommand: CommandDefinition = {
    id: 'user.command',
    command: 'user',
    args: [],
    timeout: 30000,
    allowedRoles: [UserRole.USER],
    description: 'User command',
    category: 'project',
  };

  it('should return true when API role is allowed', () => {
    expect(apiRoleCanExecute(apiCommand)).toBe(true);
  });

  it('should return false when API role is not allowed', () => {
    expect(apiRoleCanExecute(userCommand)).toBe(false);
  });
});

describe('isValidHierarchy', () => {
  it('should return true for valid hierarchy', () => {
    expect(isValidHierarchy(UserRole.SUPERADMIN, UserRole.ADMIN)).toBe(true);
    expect(isValidHierarchy(UserRole.ADMIN, UserRole.USER)).toBe(true);
  });

  it('should return false for invalid hierarchy', () => {
    expect(isValidHierarchy(UserRole.USER, UserRole.ADMIN)).toBe(false);
    expect(isValidHierarchy(UserRole.ADMIN, UserRole.SUPERADMIN)).toBe(false);
  });
});

describe('getRoleDisplayName', () => {
  it('should return display names for all roles', () => {
    expect(getRoleDisplayName(UserRole.SUPERADMIN)).toBe('Super Administrator');
    expect(getRoleDisplayName(UserRole.ADMIN)).toBe('Administrator');
    expect(getRoleDisplayName(UserRole.USER)).toBe('User');
    expect(getRoleDisplayName(UserRole.READONLY)).toBe('Read Only');
    expect(getRoleDisplayName(UserRole.API)).toBe('API Key');
  });
});

describe('getAllowedRolesForCommand', () => {
  const mockCommand: CommandDefinition = {
    id: 'test.command',
    command: 'test',
    args: [],
    timeout: 30000,
    allowedRoles: [UserRole.USER, UserRole.ADMIN],
    description: 'Test command',
    category: 'project',
  };

  it('should return display names for allowed roles', () => {
    const roleNames = getAllowedRolesForCommand(mockCommand);
    expect(roleNames).toContain('User');
    expect(roleNames).toContain('Administrator');
    expect(roleNames).toHaveLength(2);
  });
});

describe('isAdminRole', () => {
  it('should return true for admin roles', () => {
    expect(isAdminRole(UserRole.ADMIN)).toBe(true);
    expect(isAdminRole(UserRole.SUPERADMIN)).toBe(true);
  });

  it('should return false for non-admin roles', () => {
    expect(isAdminRole(UserRole.USER)).toBe(false);
    expect(isAdminRole(UserRole.READONLY)).toBe(false);
    expect(isAdminRole(UserRole.API)).toBe(false);
  });
});

describe('canPerformAdminActions', () => {
  it('should return true for admin roles', () => {
    expect(canPerformAdminActions(UserRole.ADMIN)).toBe(true);
    expect(canPerformAdminActions(UserRole.SUPERADMIN)).toBe(true);
  });

  it('should return false for non-admin roles', () => {
    expect(canPerformAdminActions(UserRole.USER)).toBe(false);
    expect(canPerformAdminActions(UserRole.READONLY)).toBe(false);
  });
});

describe('ROLE_CATEGORIES', () => {
  it('should have categories for all roles', () => {
    expect(ROLE_CATEGORIES).toHaveProperty(UserRole.SUPERADMIN);
    expect(ROLE_CATEGORIES).toHaveProperty(UserRole.ADMIN);
    expect(ROLE_CATEGORIES).toHaveProperty(UserRole.USER);
    expect(ROLE_CATEGORIES).toHaveProperty(UserRole.READONLY);
    expect(ROLE_CATEGORIES).toHaveProperty(UserRole.API);
  });

  it('should have more categories for SUPERADMIN than READONLY', () => {
    const superadminCategories = ROLE_CATEGORIES[UserRole.SUPERADMIN];
    const readonlyCategories = ROLE_CATEGORIES[UserRole.READONLY];

    expect(superadminCategories.length).toBeGreaterThan(readonlyCategories.length);
  });

  it('should include security category for admin roles', () => {
    expect(ROLE_CATEGORIES[UserRole.SUPERADMIN]).toContain('security');
    expect(ROLE_CATEGORIES[UserRole.ADMIN]).toContain('security');
  });

  it('should not include security category for user role', () => {
    expect(ROLE_CATEGORIES[UserRole.USER]).not.toContain('security');
  });
});
