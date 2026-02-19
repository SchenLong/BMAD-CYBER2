/**
 * Onboarding Types and Role Configuration Tests
 * Story 2.1: Role-Based Onboarding Wizard
 */

import {
  ONBOARDING_ROLES,
  ROLE_QUICK_ACTIONS,
  DEFAULT_ONBOARDING_ROLE,
} from '../types/onboarding';
import type { UserRoleType, RoleDefinition, QuickAction } from '../types/onboarding';

describe('Onboarding Types', () => {
  describe('ONBOARDING_ROLES', () => {
    it('should have exactly 4 roles defined', () => {
      const roles = Object.keys(ONBOARDING_ROLES);
      expect(roles).toHaveLength(4);
    });

    it('should include all required roles', () => {
      const roles = Object.keys(ONBOARDING_ROLES);
      expect(roles).toContain('SOLO_OPERATOR');
      expect(roles).toContain('TEAM_LEAD');
      expect(roles).toContain('EXECUTIVE');
      expect(roles).toContain('DEVELOPER');
    });

    it('should have all required properties for each role', () => {
      Object.values(ONBOARDING_ROLES).forEach((role: RoleDefinition) => {
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('description');
        expect(role).toHaveProperty('useCase');
        expect(role).toHaveProperty('icon');
        expect(role).toHaveProperty('color');
        expect(role).toHaveProperty('bgColor');
        expect(role).toHaveProperty('borderColor');
      });
    });

    it('should have valid icon names from lucide-react', () => {
      const validIcons = ['User', 'Users', 'Target', 'Code'];
      Object.values(ONBOARDING_ROLES).forEach((role: RoleDefinition) => {
        expect(validIcons).toContain(role.icon);
      });
    });
  });

  describe('ROLE_QUICK_ACTIONS', () => {
    it('should have quick actions defined for each role', () => {
      const roles = Object.keys(ROLE_QUICK_ACTIONS);
      expect(roles).toHaveLength(4);
    });

    it('should have exactly 3 quick actions per role', () => {
      Object.values(ROLE_QUICK_ACTIONS).forEach((actions: QuickAction[]) => {
        expect(actions).toHaveLength(3);
      });
    });

    it('should have required properties for each quick action', () => {
      Object.values(ROLE_QUICK_ACTIONS).forEach((actions: QuickAction[]) => {
        actions.forEach((action) => {
          expect(action).toHaveProperty('icon');
          expect(action).toHaveProperty('label');
          expect(action).toHaveProperty('action');
        });
      });
    });

    describe('Solo Operator quick actions', () => {
      it('should have Intel Team action', () => {
        const soloActions = ROLE_QUICK_ACTIONS.SOLO_OPERATOR;
        const intelAction = soloActions.find((a) => a.action === 'investigate');
        expect(intelAction).toBeDefined();
        expect(intelAction?.label).toBe('Intel Team');
      });

      it('should have Security Team action', () => {
        const soloActions = ROLE_QUICK_ACTIONS.SOLO_OPERATOR;
        const securityAction = soloActions.find((a) => a.action === 'secure');
        expect(securityAction).toBeDefined();
        expect(securityAction?.label).toBe('Security Team');
      });

      it('should have Strategy Team action', () => {
        const soloActions = ROLE_QUICK_ACTIONS.SOLO_OPERATOR;
        const strategyAction = soloActions.find((a) => a.action === 'strategy');
        expect(strategyAction).toBeDefined();
        expect(strategyAction?.label).toBe('Strategy Team');
      });
    });

    describe('Team Lead quick actions', () => {
      it('should have View Projects action', () => {
        const leadActions = ROLE_QUICK_ACTIONS.TEAM_LEAD;
        const projectsAction = leadActions.find((a) => a.action === 'projects');
        expect(projectsAction).toBeDefined();
        expect(projectsAction?.label).toBe('View Projects');
      });

      it('should have Delegate Task action', () => {
        const leadActions = ROLE_QUICK_ACTIONS.TEAM_LEAD;
        const delegateAction = leadActions.find((a) => a.action === 'delegate');
        expect(delegateAction).toBeDefined();
        expect(delegateAction?.label).toBe('Delegate Task');
      });

      it('should have Generate Report action', () => {
        const leadActions = ROLE_QUICK_ACTIONS.TEAM_LEAD;
        const reportAction = leadActions.find((a) => a.action === 'report');
        expect(reportAction).toBeDefined();
        expect(reportAction?.label).toBe('Generate Report');
      });
    });

    describe('Executive quick actions', () => {
      it('should have Executive Dashboard action', () => {
        const execActions = ROLE_QUICK_ACTIONS.EXECUTIVE;
        const dashboardAction = execActions.find((a) => a.action === 'dashboard');
        expect(dashboardAction).toBeDefined();
        expect(dashboardAction?.label).toBe('Executive Dashboard');
      });

      it('should have Risk Summary action', () => {
        const execActions = ROLE_QUICK_ACTIONS.EXECUTIVE;
        const riskAction = execActions.find((a) => a.action === 'risks');
        expect(riskAction).toBeDefined();
        expect(riskAction?.label).toBe('Risk Summary');
      });

      it('should have One-Page Briefs action', () => {
        const execActions = ROLE_QUICK_ACTIONS.EXECUTIVE;
        const briefsAction = execActions.find((a) => a.action === 'briefs');
        expect(briefsAction).toBeDefined();
        expect(briefsAction?.label).toBe('One-Page Briefs');
      });
    });

    describe('Developer quick actions', () => {
      it('should have API Keys action', () => {
        const devActions = ROLE_QUICK_ACTIONS.DEVELOPER;
        const keysAction = devActions.find((a) => a.action === 'api-keys');
        expect(keysAction).toBeDefined();
        expect(keysAction?.label).toBe('API Keys');
      });

      it('should have Documentation action', () => {
        const devActions = ROLE_QUICK_ACTIONS.DEVELOPER;
        const docsAction = devActions.find((a) => a.action === 'docs');
        expect(docsAction).toBeDefined();
        expect(docsAction?.label).toBe('Documentation');
      });

      it('should have CLI Reference action', () => {
        const devActions = ROLE_QUICK_ACTIONS.DEVELOPER;
        const cliAction = devActions.find((a) => a.action === 'cli');
        expect(cliAction).toBeDefined();
        expect(cliAction?.label).toBe('CLI Reference');
      });
    });
  });

  describe('DEFAULT_ONBOARDING_ROLE', () => {
    it('should be set to SOLO_OPERATOR', () => {
      expect(DEFAULT_ONBOARDING_ROLE).toBe('SOLO_OPERATOR');
    });

    it('should be a valid onboarding role', () => {
      expect(ONBOARDING_ROLES).toHaveProperty(DEFAULT_ONBOARDING_ROLE);
    });
  });

  describe('Role type safety', () => {
    it('should allow all valid role types', () => {
      const validRoles: UserRoleType[] = [
        'SOLO_OPERATOR',
        'TEAM_LEAD',
        'EXECUTIVE',
        'DEVELOPER',
      ];
      expect(validRoles).toHaveLength(4);
    });
  });
});
