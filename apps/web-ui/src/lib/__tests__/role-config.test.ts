/**
 * Role Config Tests
 * Story 2.2: Abdul Welcome Screen
 */

import {
  ROLE_GREETINGS,
  getTimeOfDay,
  getPersonalizedGreeting,
  getChatPlaceholder,
} from '../role-config';
import { UserRoleType } from '../types/onboarding';

describe('Role Config', () => {
  describe('ROLE_GREETINGS', () => {
    it('should have greetings for all roles', () => {
      const roles: UserRoleType[] = ['SOLO_OPERATOR', 'TEAM_LEAD', 'EXECUTIVE', 'DEVELOPER'];

      roles.forEach((role) => {
        expect(ROLE_GREETINGS[role]).toBeDefined();
        expect(ROLE_GREETINGS[role]).toHaveProperty('greeting');
        expect(ROLE_GREETINGS[role]).toHaveProperty('placeholder');
        expect(ROLE_GREETINGS[role]).toHaveProperty('timeBasedGreeting');
        expect(typeof ROLE_GREETINGS[role].timeBasedGreeting).toBe('function');
      });
    });

    it('should have distinct greetings per role', () => {
      const soloGreeting = ROLE_GREETINGS.SOLO_OPERATOR.greeting;
      const teamGreeting = ROLE_GREETINGS.TEAM_LEAD.greeting;
      const execGreeting = ROLE_GREETINGS.EXECUTIVE.greeting;
      const devGreeting = ROLE_GREETINGS.DEVELOPER.greeting;

      expect(soloGreeting).not.toEqual(teamGreeting);
      expect(soloGreeting).not.toEqual(execGreeting);
      expect(soloGreeting).not.toEqual(devGreeting);
      expect(teamGreeting).not.toEqual(execGreeting);
      expect(teamGreeting).not.toEqual(devGreeting);
      expect(execGreeting).not.toEqual(devGreeting);
    });
  });

  describe('getTimeOfDay', () => {
    let originalDate: typeof Date;

    beforeEach(() => {
      originalDate = global.Date;
    });

    afterEach(() => {
      global.Date = originalDate;
    });

    it('should return morning for hours before 12', () => {
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        getHours: () => 8,
      } as unknown as Date));

      expect(getTimeOfDay()).toBe('morning');
    });

    it('should return afternoon for hours 12-17', () => {
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        getHours: () => 14,
      } as unknown as Date));

      expect(getTimeOfDay()).toBe('afternoon');
    });

    it('should return evening for hours 18+', () => {
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        getHours: () => 20,
      } as unknown as Date));

      expect(getTimeOfDay()).toBe('evening');
    });
  });

  describe('getPersonalizedGreeting', () => {
    it('should return default greeting when no role', () => {
      const greeting = getPersonalizedGreeting(null);
      expect(greeting).toContain('Welcome');
      expect(greeting).toContain('What do you need today');
    });

    it('should include user name when provided', () => {
      const greeting = getPersonalizedGreeting('SOLO_OPERATOR', 'John');
      expect(greeting).toContain('John');
    });

    it('should return role-specific greeting', () => {
      const soloGreeting = getPersonalizedGreeting('SOLO_OPERATOR', 'Jane');
      expect(soloGreeting).toContain('working on');

      const devGreeting = getPersonalizedGreeting('DEVELOPER', 'Bob');
      expect(devGreeting).toContain('Ready to build');
    });
  });

  describe('getChatPlaceholder', () => {
    it('should return default placeholder when no role', () => {
      const placeholder = getChatPlaceholder(null);
      expect(placeholder).toBe('Type your message...');
    });

    it('should return role-specific placeholder', () => {
      const soloPlaceholder = getChatPlaceholder('SOLO_OPERATOR');
      expect(soloPlaceholder).toContain('need');

      const devPlaceholder = getChatPlaceholder('DEVELOPER');
      expect(devPlaceholder).toContain('CLI');
    });
  });
});
