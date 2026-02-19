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
    // Get command first
    const lookupResult = validateCommandExists('mission.delete');
    const command = lookupResult.command!;

    // @ts-ignore - Test file with old API structure
    const result = validateCommandPermission(command, 'ADMIN' as UserRole);
    expect(result.allowed).toBe(true);
  });

  it('should allow USER role for user-permitted commands', () => {
    const lookupResult = validateCommandExists('mission.list');
    const command = lookupResult.command!;

    // @ts-expect-error - Test file with old API structure
    const result = validateCommandPermission(command, 'USER' as UserRole);
    expect(result.allowed).toBe(true);
  });

  it('should deny READONLY role for privileged commands', () => {
    const lookupResult = validateCommandExists('mission.delete');
    const command = lookupResult.command!;

    // @ts-expect-error - Test file with old API structure
    const result = validateCommandPermission(command, 'READONLY' as UserRole);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain('Insufficient permissions');
  });

  it('should handle invalid roles gracefully', () => {
    const lookupResult = validateCommandExists('mission.list');
    const command = lookupResult.command!;

    // @ts-expect-error - Test file with old API structure
    const result = validateCommandPermission(command, 'INVALID_ROLE' as UserRole);
    expect(result.allowed).toBe(false);
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
      assertCommandAuthorized('mission.list', 'USER' as UserRole);
    }).not.toThrow();
  });

  it('should throw WhitelistError for unauthorized requests', () => {
    expect(() => {
      assertCommandAuthorized('mission.delete', 'READONLY' as UserRole);
    }).toThrow(WhitelistError);
  });

  it('should include both command and role in error', () => {
    try {
      assertCommandAuthorized('mission.delete', 'READONLY' as UserRole);
      fail('Expected WhitelistError to be thrown');
    } catch (error) {
      expect((error as WhitelistError).code).toBe('FORBIDDEN');  // Changed from PERMISSION_DENIED
    }
  });
});

describe('validateCommandParameters', () => {
  it('should accept valid parameters for commands with schema', () => {
    const lookupResult = validateCommandExists('mission.create');
    const command = lookupResult.command!;

    // @ts-ignore - Updated API signature
    const result = validateCommandParameters(command, {
      name: 'Test Mission',
      type: 'intel',
      priority: 'high',
    });
    expect(result).toBeNull(); // Null means valid
  });

  it('should reject invalid parameters', () => {
    const lookupResult = validateCommandExists('mission.create');
    const command = lookupResult.command!;

    // @ts-ignore - Updated API signature
    const result = validateCommandParameters(command, {
      name: 'A', // Too short (min 3)
    });
    expect(result).not.toBeNull();
    expect(result?.length).toBeGreaterThan(0);
  });

  it('should accept commands without parameter schema', () => {
    const lookupResult = validateCommandExists('mission.list');
    const command = lookupResult.command!;

    // @ts-ignore - Updated API signature
    const result = validateCommandParameters(command, {}); // No schema for this command
    expect(result).toBeNull(); // Null means valid
  });

  it('should validate required fields', () => {
    const lookupResult = validateCommandExists('mission.create');
    const command = lookupResult.command!;

    // @ts-ignore - Updated API signature
    const result = validateCommandParameters(command, {
      // Missing required 'name' field
      type: 'intel',
    });
    expect(result).not.toBeNull();
  });
});

describe('WhitelistError', () => {
  it('should create error with code and message', () => {
    // @ts-ignore - Using valid code
    const error = new WhitelistError('Test error', 'NOT_FOUND');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should be instance of Error', () => {
    // @ts-ignore - Using valid code
    const error = new WhitelistError('Test', 'FORBIDDEN');
    expect(error instanceof Error).toBe(true);
  });
});
