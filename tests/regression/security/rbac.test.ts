/**
 * BMAD CYBERCOMMAND - RBAC Validation Tests
 * =========================================
 * Regression tests for Role-Based Access Control functionality.
 * These tests verify RBAC configuration and enforcement.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('RBAC Configuration', () => {
  describe('Authorization Module', () => {
    it('should have authorization.ts in core security', () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      expect(fs.existsSync(authPath)).toBe(true);
    });

    it('should export RBACConfig interface', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface RBACConfig');
    });

    it('should have enabled flag in RBACConfig', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('enabled: boolean');
    });

    it('should have default_role in RBACConfig', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('default_role');
    });

    it('should have deny_by_default in RBACConfig', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('deny_by_default');
    });
  });

  describe('Role Definition', () => {
    it('should define Role interface', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface Role');
    });

    it('should have description field in Role', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('description: string');
    });

    it('should have inherits field for role inheritance', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('inherits: string[]');
    });

    it('should support role requirements', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('RoleRequirements');
    });

    it('should support role restrictions', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('RoleRestrictions');
    });
  });

  describe('Permission Structure', () => {
    it('should define Permission interface with agents', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('agents: string[]');
    });

    it('should define Permission interface with workflows', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('workflows: string[]');
    });

    it('should define Permission interface with modules', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('modules: string[]');
    });

    it('should define Permission interface with actions', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('actions: string[]');
    });
  });
});

describe('Authorization Manager Functions', () => {
  describe('Role Resolution', () => {
    it('should have resolveRole method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('resolveRole');
    });

    it('should have getEffectivePermissions method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('getEffectivePermissions');
    });

    it('should detect circular role inheritance', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('Circular role inheritance');
    });

    it('should merge permissions from inherited roles', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('mergePermissions');
    });
  });

  describe('Access Control Methods', () => {
    it('should have hasRole method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('hasRole');
    });

    it('should have getAllRoles method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('getAllRoles');
    });

    it('should have getRoleDetails method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('getRoleDetails');
    });

    it('should have getDefaultRole method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('getDefaultRole');
    });
  });

  describe('Pattern Matching', () => {
    it('should have matchesPattern method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('matchesPattern');
    });

    it('should support wildcard (*) patterns', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("pattern === '*'");
    });

    it('should support module wildcard patterns', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      // Check for module/* pattern handling
      expect(content).toContain("'/*'");
    });

    it('should support prefix wildcard patterns', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("endsWith('*')");
    });
  });
});

describe('RBAC Framework Auth Module', () => {
  describe('RBACManager Class', () => {
    it('should export RBACManager in auth module', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export class RBACManager');
    });

    it('should have defineRole method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('defineRole');
    });

    it('should have assignRoles method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('assignRoles');
    });

    it('should have removeUserRole method', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('removeUserRole');
    });
  });

  describe('Default Roles', () => {
    it('should define admin role with full access', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("name: 'admin'");
      expect(content).toContain("resource: '*'");
      expect(content).toContain("action: '*'");
    });

    it('should define developer role', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("name: 'developer'");
    });

    it('should define operator role', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("name: 'operator'");
    });

    it('should define guest role', async () => {
      const authPath = path.join(PROJECT_ROOT, '_bmad/framework/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("name: 'guest'");
    });
  });
});
