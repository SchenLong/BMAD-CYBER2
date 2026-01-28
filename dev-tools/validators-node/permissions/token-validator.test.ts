/**
 * BMAD Token Validator Tests
 * ===========================
 * Unit tests for token validation and RBAC.
 */

import { describe, it, expect } from 'vitest';
import {
  parseClaimsFromOutput,
  extractErrorFromOutput,
  validateRbac,
} from '../../../.claude/validators-node/src/permissions/token-validator.js';

describe('parseClaimsFromOutput', () => {
  it('should parse claims from Token Details section', () => {
    const output = `
Validating token...
[PASS] Token signature valid

Token Details
-------------
User ID: user-123
Name: Test User
Roles: admin,developer
Modules: intel-team,legal-team
Token ID: jwt-456
    `;
    const claims = parseClaimsFromOutput(output);
    expect(claims.sub).toBe('user-123');
    expect(claims.name).toBe('Test User');
    expect(claims.jti).toBe('jwt-456');
  });

  it('should handle roles as comma-separated list', () => {
    const output = `
Token Details
-------------
Roles: admin, developer, analyst
    `;
    const claims = parseClaimsFromOutput(output);
    expect(claims.roles).toEqual(['admin', 'developer', 'analyst']);
  });

  it('should handle modules as comma-separated list', () => {
    const output = `
Token Details
-------------
Modules: intel-team, legal-team, strategy-team
    `;
    const claims = parseClaimsFromOutput(output);
    expect(claims.modules).toEqual(['intel-team', 'legal-team', 'strategy-team']);
  });

  it('should rename user_id to sub', () => {
    const output = `
Token Details
-------------
User ID: user-abc
    `;
    const claims = parseClaimsFromOutput(output);
    expect(claims.sub).toBe('user-abc');
    expect(claims.user_id).toBeUndefined();
  });

  it('should rename token_id to jti', () => {
    const output = `
Token Details
-------------
Token ID: token-xyz
    `;
    const claims = parseClaimsFromOutput(output);
    expect(claims.jti).toBe('token-xyz');
    expect(claims.token_id).toBeUndefined();
  });

  it('should skip (not set) values', () => {
    const output = `
Token Details
-------------
Name: Test User
Email: (not set)
Phone: (not set)
    `;
    const claims = parseClaimsFromOutput(output);
    expect(claims.name).toBe('Test User');
    expect(claims.email).toBeUndefined();
    expect(claims.phone).toBeUndefined();
  });

  it('should return empty object for output without Token Details', () => {
    const output = 'Some random output without token details';
    const claims = parseClaimsFromOutput(output);
    expect(Object.keys(claims).length).toBe(0);
  });
});

describe('extractErrorFromOutput', () => {
  it('should extract [FAIL] lines from stdout', () => {
    const stdout = `
[PASS] Token format valid
[FAIL] Token signature verification failed
[PASS] Token not expired
    `;
    const error = extractErrorFromOutput(stdout, '');
    expect(error).toContain('Token signature verification failed');
  });

  it('should use stderr if no [FAIL] found in stdout', () => {
    const stdout = '[PASS] All checks passed';
    const stderr = 'Error: Could not read token file';
    const error = extractErrorFromOutput(stdout, stderr);
    expect(error).toContain('Could not read token file');
  });

  it('should return default message if neither available', () => {
    const error = extractErrorFromOutput('', '');
    expect(error).toContain('Token validation failed');
  });

  it('should truncate long stderr messages', () => {
    const stdout = '';
    const stderr = 'A'.repeat(500);
    const error = extractErrorFromOutput(stdout, stderr);
    expect(error.length).toBeLessThanOrEqual(250);
  });
});

describe('validateRbac', () => {
  it('should allow admin role for any required role', () => {
    const claims = { roles: ['admin'] };

    const result1 = validateRbac(claims, 'developer');
    expect(result1.isAuthorized).toBe(true);

    const result2 = validateRbac(claims, 'security_analyst');
    expect(result2.isAuthorized).toBe(true);

    const result3 = validateRbac(claims, 'viewer');
    expect(result3.isAuthorized).toBe(true);
  });

  it('should allow security_lead for security_analyst, intel_analyst, developer', () => {
    const claims = { roles: ['security_lead'] };

    const result1 = validateRbac(claims, 'security_analyst');
    expect(result1.isAuthorized).toBe(true);

    const result2 = validateRbac(claims, 'intel_analyst');
    expect(result2.isAuthorized).toBe(true);

    const result3 = validateRbac(claims, 'developer');
    expect(result3.isAuthorized).toBe(true);
  });

  it('should deny security_lead for admin role', () => {
    const claims = { roles: ['security_lead'] };
    const result = validateRbac(claims, 'admin');
    expect(result.isAuthorized).toBe(false);
    expect(result.errorMessage).toContain('admin');
  });

  it('should allow user with matching role', () => {
    const claims = { roles: ['developer', 'analyst'] };

    const result1 = validateRbac(claims, 'developer');
    expect(result1.isAuthorized).toBe(true);

    const result2 = validateRbac(claims, 'analyst');
    expect(result2.isAuthorized).toBe(true);
  });

  it('should deny user without matching role', () => {
    const claims = { roles: ['viewer'] };
    const result = validateRbac(claims, 'admin');
    expect(result.isAuthorized).toBe(false);
    expect(result.errorMessage).not.toBeNull();
  });

  it('should allow when no required role specified', () => {
    const claims = { roles: ['viewer'] };
    const result = validateRbac(claims);
    expect(result.isAuthorized).toBe(true);
  });

  it('should allow when required role is undefined', () => {
    const claims = { roles: ['developer'] };
    const result = validateRbac(claims, undefined);
    expect(result.isAuthorized).toBe(true);
  });

  it('should handle empty roles array', () => {
    const claims = { roles: [] as string[] };
    const result = validateRbac(claims, 'developer');
    expect(result.isAuthorized).toBe(false);
    expect(result.errorMessage).not.toBeNull();
  });

  it('should handle missing roles in claims', () => {
    const claims = {} as { roles?: string[] };
    const result = validateRbac(claims, 'developer');
    expect(result.isAuthorized).toBe(false);
    expect(result.errorMessage).not.toBeNull();
  });
});
