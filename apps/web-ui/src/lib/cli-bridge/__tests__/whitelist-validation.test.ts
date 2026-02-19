/**
 * CLI Bridge Whitelist Validation Tests
 * Story 5.1: Command Whitelist System - Task 3
 */

// Mock prisma before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

import { describe, it, expect } from '@jest/globals';
import {
  validateCommandExists,
  validateCommandPermission,
  assertCommandWhitelisted,
  assertCommandAuthorized,
  validateCommandParameters,
  WhitelistError,
} from '@/middleware/cli-whitelist';
import { UserRole } from '@prisma/client';

describe('validateCommandExists', () => {
  it('should return found=true for whitelisted commands', () => {
    const result = validateCommandExists('mission.list');
    expect(result.found).toBe(true);
    expect(result.command).toBeDefined();
    expect(result.command?.id).toBe('mission.list');
  });

  it('should return found=false for non-whitelisted commands', () => {
    const result = validateCommandExists('malicious.command');
    expect(result.found).toBe(false);
    expect(result.error).toContain('not found in whitelist');
  });

  it('should include command metadata in response', () => {
    const result = validateCommandExists('mission.list');
    expect(result.command?.category).toBeDefined();
    expect(result.command?.allowedRoles).toBeDefined();
  });
});

describe('validateCommandPermission', () => {
  it('should allow ADMIN role for any command', () => {
    const result = validateCommandPermission({
      commandId: 'mission.delete',
      userRole: 'ADMIN' as UserRole,
    });
    expect(result.authorized).toBe(true);
  });

  it('should allow USER role for user-permitted commands', () => {
    const result = validateCommandPermission({
      commandId: 'mission.list',
      userRole: 'USER' as UserRole,
    });
    expect(result.authorized).toBe(true);
  });

  it('should deny READONLY role for privileged commands', () => {
    const result = validateCommandPermission({
      commandId: 'mission.delete',
      userRole: 'READONLY' as UserRole,
    });
    expect(result.authorized).toBe(false);
    expect(result.error).toContain('insufficient permissions');
  });

  it('should handle invalid roles gracefully', () => {
    const result = validateCommandPermission({
      commandId: 'mission.list',
      userRole: 'INVALID_ROLE' as UserRole,
    });
    expect(result.authorized).toBe(false);
  });
});

describe('assertCommandWhitelisted', () => {
  it('should not throw for whitelisted commands', () => {
    expect(() => {
      assertCommandWhitelisted('mission.list');
    }).not.toThrow();
  });

  it('should throw WhitelistError for non-whitelisted commands', () => {
    expect(() => {
      assertCommandWhitelisted('malicious.command');
    }).toThrow(WhitelistError);
  });

  it('should include error details in thrown error', () => {
    try {
      assertCommandWhitelisted('malicious.command');
      fail('Expected WhitelistError to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(WhitelistError);
      expect((error as WhitelistError).code).toBe('COMMAND_NOT_FOUND');
    }
  });
});

describe('assertCommandAuthorized', () => {
  it('should not throw for authorized requests', () => {
    expect(() => {
      assertCommandAuthorized({
        commandId: 'mission.list',
        userRole: 'USER' as UserRole,
      });
    }).not.toThrow();
  });

  it('should throw WhitelistError for unauthorized requests', () => {
    expect(() => {
      assertCommandAuthorized({
        commandId: 'mission.delete',
        userRole: 'READONLY' as UserRole,
      });
    }).toThrow(WhitelistError);
  });

  it('should include both command and role in error', () => {
    try {
      assertCommandAuthorized({
        commandId: 'mission.delete',
        userRole: 'READONLY' as UserRole,
      });
      fail('Expected WhitelistError to be thrown');
    } catch (error) {
      expect((error as WhitelistError).code).toBe('PERMISSION_DENIED');
    }
  });
});

describe('validateCommandParameters', () => {
  it('should accept valid parameters for commands with schema', () => {
    const result = validateCommandParameters({
      commandId: 'mission.create',
      parameters: {
        name: 'Test Mission',
        type: 'intel',
        priority: 'high',
      },
    });
    expect(result.valid).toBe(true);
  });

  it('should reject invalid parameters', () => {
    const result = validateCommandParameters({
      commandId: 'mission.create',
      parameters: {
        name: 'A', // Too short (min 3)
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should accept commands without parameter schema', () => {
    const result = validateCommandParameters({
      commandId: 'mission.list',
      parameters: {}, // No schema for this command
    });
    expect(result.valid).toBe(true);
  });

  it('should validate required fields', () => {
    const result = validateCommandParameters({
      commandId: 'mission.create',
      parameters: {
        // Missing required 'name' field
        type: 'intel',
      },
    });
    expect(result.valid).toBe(false);
  });
});

describe('WhitelistError', () => {
  it('should create error with code and message', () => {
    const error = new WhitelistError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
  });

  it('should be instance of Error', () => {
    const error = new WhitelistError('Test', 'TEST');
    expect(error instanceof Error).toBe(true);
  });
});
