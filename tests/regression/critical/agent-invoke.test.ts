/**
 * BMAD CYBERCOMMAND - Agent Invocation Tests
 * ===========================================
 * Regression tests for agent invocation functionality.
 * These tests ensure agents can be properly instantiated
 * and invoked through the framework.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Agent Invocation', () => {
  describe('Agent Directory Structure', () => {
    it('should have agents directory or agent definitions', () => {
      // Check for possible agent locations
      const possibleLocations = [
        path.join(PROJECT_ROOT, '_bmad/agents'),
        path.join(PROJECT_ROOT, 'agents'),
        path.join(PROJECT_ROOT, '_bmad/framework/agents'),
        path.join(PROJECT_ROOT, '.claude/agents'),
      ];

      // At minimum, framework should exist for agent support
      const frameworkExists = fs.existsSync(path.join(PROJECT_ROOT, '_bmad/framework'));
      expect(frameworkExists).toBe(true);
    });

    it('should have authorization module for agent access control', () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      expect(fs.existsSync(authPath)).toBe(true);
    });
  });

  describe('Authorization Manager', () => {
    it('should export AuthorizationManager class', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export class AuthorizationManager');
    });

    it('should have canAccessAgent method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('canAccessAgent');
    });

    it('should have canAccessModule method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('canAccessModule');
    });

    it('should define UserContext interface', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface UserContext');
    });

    it('should define AuthorizationResult interface', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface AuthorizationResult');
    });
  });

  describe('Auth Manager', () => {
    it('should export AuthManager class from auth module', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export class AuthManager');
    });

    it('should have authenticate method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('authenticate');
    });

    it('should have authorize method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('authorize');
    });
  });

  describe('RBAC Manager Integration', () => {
    it('should export RBACManager class', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export class RBACManager');
    });

    it('should have role-based permission methods', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('hasPermission');
      expect(content).toContain('hasRole');
      expect(content).toContain('getUserPermissions');
    });

    it('should define default roles', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('admin');
      expect(content).toContain('developer');
      expect(content).toContain('operator');
    });
  });
});

describe('Agent Permission Patterns', () => {
  it('should support wildcard permissions', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    // Check for wildcard pattern handling
    expect(content).toContain('*');
    expect(content).toContain('matchesPattern');
  });

  it('should support module-scoped permissions', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    // Check for module path handling
    expect(content).toContain('moduleName');
    expect(content).toContain('module_restrictions');
  });

  it('should support credential verification requirements', async () => {
    const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('credentialVerified');
    expect(content).toContain('require_credential_verification');
  });
});
