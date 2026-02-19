/**
 * CLI Bridge Allowed Commands Tests
 * Story 5.1: Command Whitelist System
 */

import { describe, it, expect } from '@jest/globals';
import {
  ALLOWED_COMMANDS,
  getCommand,
  hasCommand,
  getEnabledCommands,
  getCommandsByCategory,
  getCommandsForRole,
  getCommandCategories,
  commandIdSchema,
} from '../allowed-commands';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

describe('ALLOWED_COMMANDS', () => {
  it('should have all required core commands', () => {
    // Core commands from acceptance criteria
    const requiredCommands = [
      'mission.list',
      'mission.create',
      'agent.invoke',
      'workflow.execute',
    ];

    for (const cmd of requiredCommands) {
      expect(ALLOWED_COMMANDS[cmd]).toBeDefined();
      expect(ALLOWED_COMMANDS[cmd].id).toBe(cmd);
    }
  });

  it('should have intel commands', () => {
    expect(ALLOWED_COMMANDS['intel.flash-assessment']).toBeDefined();
    expect(ALLOWED_COMMANDS['intel.attribution-chain']).toBeDefined();
    expect(ALLOWED_COMMANDS['intel.threat-constellation']).toBeDefined();
  });

  it('should have security commands', () => {
    expect(ALLOWED_COMMANDS['security.architecture-review']).toBeDefined();
    expect(ALLOWED_COMMANDS['security.threat-model']).toBeDefined();
    expect(ALLOWED_COMMANDS['security.vulnerability-scan']).toBeDefined();
    expect(ALLOWED_COMMANDS['security.incident-response']).toBeDefined();
    expect(ALLOWED_COMMANDS['security.compliance-audit']).toBeDefined();
  });

  it('should define required properties for all commands', () => {
    for (const [id, command] of Object.entries(ALLOWED_COMMANDS)) {
      expect(command.id).toBe(id);
      expect(command.command).toBeDefined();
      expect(command.args).toBeInstanceOf(Array);
      expect(command.timeout).toBeGreaterThan(0);
      expect(command.allowedRoles).toBeInstanceOf(Array);
      expect(command.allowedRoles.length).toBeGreaterThan(0);
      expect(command.description).toBeDefined();
      expect(command.category).toBeDefined();
    }
  });

  it('should not allow wildcard roles', () => {
    for (const command of Object.values(ALLOWED_COMMANDS)) {
      expect(command.allowedRoles).not.toContain('*');
      expect(command.allowedRoles).not.toContain('all' as UserRole);
    }
  });

  it('should specify timeout for all commands', () => {
    for (const command of Object.values(ALLOWED_COMMANDS)) {
      expect(command.timeout).toBeDefined();
      expect(command.timeout).toBeGreaterThan(0);
      expect(command.timeout).toBeLessThanOrEqual(3600000); // Max 1 hour
    }
  });

  it('should have mission.create with admin-only access', () => {
    const missionCreate = ALLOWED_COMMANDS['mission.create'];
    expect(missionCreate.allowedRoles).toEqual([UserRole.ADMIN, UserRole.SUPERADMIN]);
    expect(missionCreate.allowedRoles).not.toContain(UserRole.USER);
  });

  it('should have mission.list with user access', () => {
    const missionList = ALLOWED_COMMANDS['mission.list'];
    expect(missionList.allowedRoles).toContain(UserRole.USER);
    expect(missionList.allowedRoles).toContain(UserRole.ADMIN);
    expect(missionList.allowedRoles).toContain(UserRole.SUPERADMIN);
  });

  it('should have agent.invoke with user access', () => {
    const agentInvoke = ALLOWED_COMMANDS['agent.invoke'];
    expect(agentInvoke.allowedRoles).toContain(UserRole.USER);
    expect(agentInvoke.allowedRoles).toContain(UserRole.ADMIN);
    expect(agentInvoke.allowedRoles).toContain(UserRole.SUPERADMIN);
  });

  it('should have workflow.execute with user access', () => {
    const workflowExecute = ALLOWED_COMMANDS['workflow.execute'];
    expect(workflowExecute.allowedRoles).toContain(UserRole.USER);
    expect(workflowExecute.allowedRoles).toContain(UserRole.ADMIN);
    expect(workflowExecute.allowedRoles).toContain(UserRole.SUPERADMIN);
  });

  it('should have validation schema for commands with parameters', () => {
    // Commands with user input should have validation
    const missionCreate = ALLOWED_COMMANDS['mission.create'];
    expect(missionCreate.validation).toBeDefined();
    expect(typeof missionCreate.validation?.safeParse).toBe('function');

    const agentInvoke = ALLOWED_COMMANDS['agent.invoke'];
    expect(agentInvoke.validation).toBeDefined();
    expect(typeof agentInvoke.validation?.safeParse).toBe('function');

    const workflowExecute = ALLOWED_COMMANDS['workflow.execute'];
    expect(workflowExecute.validation).toBeDefined();
    expect(typeof workflowExecute.validation?.safeParse).toBe('function');
  });

  it('should have security commands with admin-only access', () => {
    const adminCommands = [
      'security.architecture-review',
      'security.threat-model',
      'security.vulnerability-scan',
      'security.incident-response',
      'security.compliance-audit',
    ];

    for (const cmdId of adminCommands) {
      const cmd = ALLOWED_COMMANDS[cmdId];
      expect(cmd.allowedRoles).toContain(UserRole.ADMIN);
      expect(cmd.allowedRoles).toContain(UserRole.SUPERADMIN);
    }
  });

  it('should have intel commands with user access', () => {
    const userAccessibleIntel = [
      'intel.flash-assessment',
      'intel.attribution-chain',
    ];

    for (const cmdId of userAccessibleIntel) {
      const cmd = ALLOWED_COMMANDS[cmdId];
      expect(cmd.allowedRoles).toContain(UserRole.USER);
    }
  });

  it('should have threat.constellation as admin-only', () => {
    const threatConstellation = ALLOWED_COMMANDS['intel.threat-constellation'];
    expect(threatConstellation.allowedRoles).not.toContain(UserRole.USER);
    expect(threatConstellation.allowedRoles).toContain(UserRole.ADMIN);
    expect(threatConstellation.allowedRoles).toContain(UserRole.SUPERADMIN);
  });
});

describe('getCommand', () => {
  it('should return command by ID', () => {
    const command = getCommand('mission.list');
    expect(command).toBeDefined();
    expect(command?.id).toBe('mission.list');
  });

  it('should return undefined for non-existent command', () => {
    const command = getCommand('nonexistent.command');
    expect(command).toBeUndefined();
  });
});

describe('hasCommand', () => {
  it('should return true for existing commands', () => {
    expect(hasCommand('mission.list')).toBe(true);
    expect(hasCommand('agent.invoke')).toBe(true);
  });

  it('should return false for non-existent commands', () => {
    expect(hasCommand('malicious.command')).toBe(false);
    expect(hasCommand('rm -rf')).toBe(false);
  });
});

describe('getEnabledCommands', () => {
  it('should return only enabled commands', () => {
    const enabled = getEnabledCommands();
    expect(enabled.length).toBeGreaterThan(0);

    // All returned commands should be enabled
    for (const cmd of enabled) {
      expect(cmd.enabled).not.toBe(false);
    }
  });
});

describe('getCommandsByCategory', () => {
  it('should return project commands', () => {
    const projectCommands = getCommandsByCategory('project');
    expect(projectCommands.length).toBeGreaterThan(0);

    for (const cmd of projectCommands) {
      expect(cmd.category).toBe('project');
    }
  });

  it('should return agent commands', () => {
    const agentCommands = getCommandsByCategory('agent');
    expect(agentCommands.length).toBeGreaterThan(0);

    for (const cmd of agentCommands) {
      expect(cmd.category).toBe('agent');
    }
  });

  it('should return workflow commands', () => {
    const workflowCommands = getCommandsByCategory('workflow');
    expect(workflowCommands.length).toBeGreaterThan(0);

    for (const cmd of workflowCommands) {
      expect(cmd.category).toBe('workflow');
    }
  });

  it('should return intel commands', () => {
    const intelCommands = getCommandsByCategory('intel');
    expect(intelCommands.length).toBeGreaterThan(0);

    for (const cmd of intelCommands) {
      expect(cmd.category).toBe('intel');
    }
  });

  it('should return security commands', () => {
    const securityCommands = getCommandsByCategory('security');
    expect(securityCommands.length).toBeGreaterThan(0);

    for (const cmd of securityCommands) {
      expect(cmd.category).toBe('security');
    }
  });
});

describe('getCommandsForRole', () => {
  it('should return admin commands for ADMIN role', () => {
    const adminCommands = getCommandsForRole(UserRole.ADMIN);
    expect(adminCommands.length).toBeGreaterThan(0);

    // All should have ADMIN in allowedRoles
    for (const cmd of adminCommands) {
      expect(cmd.allowedRoles).toContain(UserRole.ADMIN);
    }
  });

  it('should return user commands for USER role', () => {
    const userCommands = getCommandsForRole(UserRole.USER);
    expect(userCommands.length).toBeGreaterThan(0);

    // All should have USER in allowedRoles
    for (const cmd of userCommands) {
      expect(cmd.allowedRoles).toContain(UserRole.USER);
    }

    // Should NOT have admin-only commands
    const commandIds = userCommands.map((c) => c.id);
    expect(commandIds).not.toContain('intel.threat-constellation');
  });

  it('should return fewer commands for READONLY role', () => {
    const readonlyCommands = getCommandsForRole(UserRole.READONLY);
    const userCommands = getCommandsForRole(UserRole.USER);

    expect(readonlyCommands.length).toBeLessThan(userCommands.length);
  });

  it('should return empty array for unknown role', () => {
    // @ts-expect-error - Testing invalid role
    const commands = getCommandsForRole('UNKNOWN_ROLE');
    expect(commands).toEqual([]);
  });
});

describe('getCommandCategories', () => {
  it('should return all unique categories', () => {
    const categories = getCommandCategories();
    expect(categories).toContain('project');
    expect(categories).toContain('agent');
    expect(categories).toContain('workflow');
    expect(categories).toContain('intel');
    expect(categories).toContain('security');
  });

  it('should not have duplicates', () => {
    const categories = getCommandCategories();
    const uniqueCategories = new Set(categories);
    expect(categories.length).toBe(uniqueCategories.size);
  });
});

describe('commandIdSchema', () => {
  it('should validate valid command IDs', () => {
    const validIds = [
      'mission.list',
      'agent.invoke',
      'workflow.execute',
      'intel.flash-assessment',
      'security.threat-model',
    ];

    for (const id of validIds) {
      const result = commandIdSchema.safeParse(id);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid command IDs', () => {
    const invalidIds = [
      'invalid',
      'InvalidCaps',
      'Mission.List',
      '123.mission',
      'mission..list',
      'mission.list.extra',
      'rm -rf',
      '../../../etc/passwd',
    ];

    for (const id of invalidIds) {
      const result = commandIdSchema.safeParse(id);
      expect(result.success).toBe(false);
    }
  });

  it('should reject command injection attempts', () => {
    const maliciousAttempts = [
      'mission.list; rm -rf',
      'mission.list && malicious',
      'mission.list | malicious',
      '../../../etc/passwd',
      'bmad; malicious',
    ];

    for (const attempt of maliciousAttempts) {
      const result = commandIdSchema.safeParse(attempt);
      expect(result.success).toBe(false);
    }
  });
});

describe('Command validation schemas', () => {
  it('should validate mission.create parameters', () => {
    const missionCreate = ALLOWED_COMMANDS['mission.create'];

    if (missionCreate.validation) {
      // Valid parameters
      const validResult = missionCreate.validation.safeParse({
        name: 'Test Assessment',
        type: 'assessment',
      });
      expect(validResult.success).toBe(true);

      // Invalid parameters - name too short
      const invalidResult1 = missionCreate.validation.safeParse({
        name: 'ab',
        type: 'assessment',
      });
      expect(invalidResult1.success).toBe(false);

      // Invalid parameters - invalid type
      const invalidResult2 = missionCreate.validation.safeParse({
        name: 'Test Assessment',
        type: 'invalid_type',
      });
      expect(invalidResult2.success).toBe(false);
    }
  });

  it('should validate agent.invoke parameters', () => {
    const agentInvoke = ALLOWED_COMMANDS['agent.invoke'];

    if (agentInvoke.validation) {
      // Valid parameters
      const validResult = agentInvoke.validation.safeParse({
        agent: 'threat-analyst',
        message: 'Analyze this threat',
      });
      expect(validResult.success).toBe(true);

      // Invalid - message too long
      const invalidResult = agentInvoke.validation.safeParse({
        agent: 'threat-analyst',
        message: 'x'.repeat(10001), // Exceeds 10000 char limit
      });
      expect(invalidResult.success).toBe(false);
    }
  });

  it('should validate workflow.execute parameters', () => {
    const workflowExecute = ALLOWED_COMMANDS['workflow.execute'];

    if (workflowExecute.validation) {
      // Valid parameters
      const validResult = workflowExecute.validation.safeParse({
        workflow: 'create-prd',
      });
      expect(validResult.success).toBe(true);

      // Valid with yolo flag
      const validYolo = workflowExecute.validation.safeParse({
        workflow: 'create-prd',
        yolo: true,
      });
      expect(validYolo.success).toBe(true);
    }
  });
});
