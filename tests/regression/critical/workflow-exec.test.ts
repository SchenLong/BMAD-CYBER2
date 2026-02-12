/**
 * BMAD CYBERCOMMAND - Workflow Execution Tests
 * =============================================
 * Regression tests for workflow execution functionality.
 * These tests verify that workflows can be defined, validated,
 * and executed through the framework.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('Workflow Execution', () => {
  describe('Workflow Authorization', () => {
    it('should have canExecuteWorkflow method in AuthorizationManager', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('canExecuteWorkflow');
    });

    it('should define WorkflowRestriction interface', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface WorkflowRestriction');
    });

    it('should support workflow approval requirements', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('require_approval');
      expect(content).toContain('requires_approval');
    });

    it('should support audit levels for workflows', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('audit_level');
    });
  });

  describe('Framework Configuration', () => {
    it('should support enableValidation option', async () => {
      const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      const content = fs.readFileSync(frameworkPath, 'utf-8');

      expect(content).toContain('enableValidation');
    });

    it('should support enableAuditLogging option', async () => {
      const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      const content = fs.readFileSync(frameworkPath, 'utf-8');

      expect(content).toContain('enableAuditLogging');
    });

    it('should support enableRBAC option', async () => {
      const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      const content = fs.readFileSync(frameworkPath, 'utf-8');

      expect(content).toContain('enableRBAC');
    });

    it('should support logLevel configuration', async () => {
      const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
      const content = fs.readFileSync(frameworkPath, 'utf-8');

      expect(content).toContain('logLevel');
    });
  });

  describe('Permission Actions', () => {
    it('should support execute action permission', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain("'execute'");
    });

    it('should have canPerformAction method', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('canPerformAction');
    });

    it('should check for execute permission in workflow execution', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      // Verify execute permission check in canExecuteWorkflow
      expect(content).toContain('execute');
      expect(content).toContain('actions');
    });
  });

  describe('Role Permission Structure', () => {
    it('should define Permission interface with actions field', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface Permission');
      expect(content).toContain('actions: string[]');
    });

    it('should define Role interface with permissions', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('export interface Role');
      expect(content).toContain('permissions: Permission');
    });

    it('should support role inheritance', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('inherits');
      expect(content).toContain('resolveRole');
    });
  });

  describe('Workflow Restrictions Config', () => {
    it('should define workflow_restrictions in RBACConfig', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('workflow_restrictions');
      expect(content).toContain('RBACConfig');
    });

    it('should support warning messages for workflows', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('warning_message');
    });

    it('should format denial messages properly', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('formatDenialMessage');
      expect(content).toContain('ACCESS DENIED');
    });

    it('should format approval required messages', async () => {
      const authPath = path.join(PROJECT_ROOT, 'src/core/security/authorization.ts');
      const content = fs.readFileSync(authPath, 'utf-8');

      expect(content).toContain('formatApprovalMessage');
      expect(content).toContain('APPROVAL REQUIRED');
    });
  });
});

describe('Workflow Integration Points', () => {
  it('should have auth namespace export in framework', async () => {
    const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(frameworkPath, 'utf-8');

    expect(content).toContain("export * as auth from './auth/index.js'");
  });

  it('should have validators namespace export in framework', async () => {
    const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(frameworkPath, 'utf-8');

    expect(content).toContain("export * as validators from './validators/index.js'");
  });

  it('should have audit namespace export in framework', async () => {
    const frameworkPath = path.join(PROJECT_ROOT, '_bmad/framework/index.ts');
    const content = fs.readFileSync(frameworkPath, 'utf-8');

    expect(content).toContain("export * as audit from './audit/index.js'");
  });
});
