/**
 * Unit Tests for Welcome Screen - INST-030
 * Epic Installation Wizard Enhancement - Welcome Screen and User Profile
 *
 * @module installer/lib/welcome-screen.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  CYBER_BANNER,
  WELCOME_MESSAGE,
  formatRoleName,
  validateEmail,
  validateName,
  displayWelcome,
  buildRoleChoices,
  displayProfileSummary
} from './welcome-screen.js';

import { VALID_ROLES } from '../../module-selector/role-recommendations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Welcome Screen - INST-030', () => {
  // Mock console methods
  let consoleClearSpy;
  let consoleLogSpy;

  beforeEach(() => {
    consoleClearSpy = vi.spyOn(console, 'clear').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CYBER_BANNER constant', () => {
    it('should be a non-empty string', () => {
      expect(typeof CYBER_BANNER).toBe('string');
      expect(CYBER_BANNER.length).toBeGreaterThan(0);
    });

    it('should contain ASCII art characters', () => {
      // Check for box drawing characters or unicode block characters
      expect(CYBER_BANNER).toMatch(/[█╗╔═║╚╝╩]/);
    });

    it('should contain CYBER text pattern', () => {
      // The banner should spell out CYBER
      expect(CYBER_BANNER).toContain('██');
    });

    it('should be multi-line', () => {
      const lines = CYBER_BANNER.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('WELCOME_MESSAGE constant', () => {
    it('should be a non-empty string', () => {
      expect(typeof WELCOME_MESSAGE).toBe('string');
      expect(WELCOME_MESSAGE.length).toBeGreaterThan(0);
    });

    it('should contain welcome text', () => {
      expect(WELCOME_MESSAGE.toLowerCase()).toContain('welcome');
    });

    it('should contain BMAD-CYBER', () => {
      expect(WELCOME_MESSAGE).toContain('BMAD-CYBER');
    });

    it('should mention setup', () => {
      expect(WELCOME_MESSAGE.toLowerCase()).toContain('set up');
    });
  });

  describe('formatRoleName', () => {
    it('should convert single word to title case', () => {
      expect(formatRoleName('admin')).toBe('Admin');
    });

    it('should convert snake_case to Title Case with spaces', () => {
      expect(formatRoleName('security_lead')).toBe('Security Lead');
    });

    it('should handle multiple underscores', () => {
      expect(formatRoleName('intel_analyst')).toBe('Intel Analyst');
    });

    it('should return empty string for null input', () => {
      expect(formatRoleName(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(formatRoleName(undefined)).toBe('');
    });

    it('should return empty string for empty string input', () => {
      expect(formatRoleName('')).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(formatRoleName(123)).toBe('');
      expect(formatRoleName({})).toBe('');
      expect(formatRoleName([])).toBe('');
    });

    it('should handle all VALID_ROLES correctly', () => {
      for (const role of VALID_ROLES) {
        const formatted = formatRoleName(role);
        expect(formatted.length).toBeGreaterThan(0);
        // First character should be uppercase
        expect(formatted[0]).toBe(formatted[0].toUpperCase());
      }
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should return true for email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('should return true for empty string (optional field)', () => {
      expect(validateEmail('')).toBe(true);
    });

    it('should return true for null (optional field)', () => {
      expect(validateEmail(null)).toBe(true);
    });

    it('should return true for undefined (optional field)', () => {
      expect(validateEmail(undefined)).toBe(true);
    });

    it('should return true for whitespace only (treated as empty)', () => {
      expect(validateEmail('   ')).toBe(true);
    });

    it('should return error message for invalid email without @', () => {
      const result = validateEmail('invalid-email');
      expect(typeof result).toBe('string');
      expect(result).toContain('valid email');
    });

    it('should return error message for invalid email without domain', () => {
      const result = validateEmail('user@');
      expect(typeof result).toBe('string');
    });

    it('should return error message for invalid email without local part', () => {
      const result = validateEmail('@example.com');
      expect(typeof result).toBe('string');
    });

    it('should return error message for email with spaces', () => {
      const result = validateEmail('user @example.com');
      expect(typeof result).toBe('string');
    });

    it('should handle email with trimmed whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('validateName', () => {
    it('should return true for valid name', () => {
      expect(validateName('John Doe')).toBe(true);
    });

    it('should return true for name with exactly 2 characters', () => {
      expect(validateName('Jo')).toBe(true);
    });

    it('should return error for empty string', () => {
      const result = validateName('');
      expect(typeof result).toBe('string');
      expect(result).toContain('required');
    });

    it('should return error for null', () => {
      const result = validateName(null);
      expect(typeof result).toBe('string');
    });

    it('should return error for undefined', () => {
      const result = validateName(undefined);
      expect(typeof result).toBe('string');
    });

    it('should return error for whitespace only', () => {
      const result = validateName('   ');
      expect(typeof result).toBe('string');
      expect(result).toContain('required');
    });

    it('should return error for single character', () => {
      const result = validateName('J');
      expect(typeof result).toBe('string');
      expect(result).toContain('2 characters');
    });

    it('should return error for name over 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = validateName(longName);
      expect(typeof result).toBe('string');
      expect(result).toContain('100 characters');
    });

    it('should return true for name with exactly 100 characters', () => {
      const name = 'A'.repeat(100);
      expect(validateName(name)).toBe(true);
    });

    it('should handle name with leading/trailing whitespace', () => {
      expect(validateName('  John  ')).toBe(true);
    });

    it('should return error for non-string input', () => {
      expect(typeof validateName(123)).toBe('string');
      expect(typeof validateName({})).toBe('string');
    });
  });

  describe('displayWelcome', () => {
    it('should clear console by default', () => {
      displayWelcome();
      expect(consoleClearSpy).toHaveBeenCalled();
    });

    it('should not clear console when clearConsole is false', () => {
      displayWelcome({ clearConsole: false });
      expect(consoleClearSpy).not.toHaveBeenCalled();
    });

    it('should log the banner', () => {
      displayWelcome({ clearConsole: false });
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      // The banner contains box drawing characters
      expect(allOutput).toMatch(/[█╗╔═║╚╝]/);
    });

    it('should log welcome message content', () => {
      displayWelcome({ clearConsole: false });
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      expect(allOutput.toLowerCase()).toContain('welcome');
    });

    it('should accept empty options object', () => {
      expect(() => displayWelcome({})).not.toThrow();
    });

    it('should work with no arguments', () => {
      expect(() => displayWelcome()).not.toThrow();
    });
  });

  describe('buildRoleChoices', () => {
    it('should return an array', () => {
      const choices = buildRoleChoices();
      expect(Array.isArray(choices)).toBe(true);
    });

    it('should return same number of choices as VALID_ROLES', () => {
      const choices = buildRoleChoices();
      expect(choices.length).toBe(VALID_ROLES.length);
    });

    it('should have name property for each choice', () => {
      const choices = buildRoleChoices();
      for (const choice of choices) {
        expect(choice.name).toBeDefined();
        expect(typeof choice.name).toBe('string');
      }
    });

    it('should have value property matching role identifier', () => {
      const choices = buildRoleChoices();
      for (const choice of choices) {
        expect(choice.value).toBeDefined();
        expect(VALID_ROLES).toContain(choice.value);
      }
    });

    it('should have short property for each choice', () => {
      const choices = buildRoleChoices();
      for (const choice of choices) {
        expect(choice.short).toBeDefined();
        expect(typeof choice.short).toBe('string');
      }
    });

    it('should format names as Title Case', () => {
      const choices = buildRoleChoices();
      for (const choice of choices) {
        // First character should be uppercase
        expect(choice.name[0]).toBe(choice.name[0].toUpperCase());
      }
    });

    it('should include admin role', () => {
      const choices = buildRoleChoices();
      const adminChoice = choices.find(c => c.value === 'admin');
      expect(adminChoice).toBeDefined();
      expect(adminChoice.name).toBe('Admin');
    });

    it('should include security_lead role', () => {
      const choices = buildRoleChoices();
      const securityLeadChoice = choices.find(c => c.value === 'security_lead');
      expect(securityLeadChoice).toBeDefined();
      expect(securityLeadChoice.name).toBe('Security Lead');
    });

    it('should include developer role', () => {
      const choices = buildRoleChoices();
      const developerChoice = choices.find(c => c.value === 'developer');
      expect(developerChoice).toBeDefined();
      expect(developerChoice.name).toBe('Developer');
    });
  });

  describe('displayProfileSummary', () => {
    it('should display name', () => {
      const profile = { name: 'John Doe', email: '', role: 'admin', organization: '' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      expect(allOutput).toContain('John Doe');
    });

    it('should display email when provided', () => {
      const profile = { name: 'John', email: 'john@example.com', role: 'admin', organization: '' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      expect(allOutput).toContain('john@example.com');
    });

    it('should not display email label when email is empty', () => {
      const profile = { name: 'John', email: '', role: 'admin', organization: '' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const outputWithEmail = calls.filter(c => c.join(' ').toLowerCase().includes('email:'));
      expect(outputWithEmail.length).toBe(0);
    });

    it('should display formatted role', () => {
      const profile = { name: 'John', email: '', role: 'security_lead', organization: '' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      expect(allOutput).toContain('Security Lead');
    });

    it('should display organization when provided', () => {
      const profile = { name: 'John', email: '', role: 'admin', organization: 'ACME Corp' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      expect(allOutput).toContain('ACME Corp');
    });

    it('should not display organization when empty', () => {
      const profile = { name: 'John', email: '', role: 'admin', organization: '' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const outputWithOrg = calls.filter(c => c.join(' ').toLowerCase().includes('organization:'));
      expect(outputWithOrg.length).toBe(0);
    });

    it('should display Profile Summary header', () => {
      const profile = { name: 'John', email: '', role: 'admin', organization: '' };
      displayProfileSummary(profile);
      const calls = consoleLogSpy.mock.calls;
      const allOutput = calls.map(c => c.join(' ')).join('');
      expect(allOutput).toContain('Profile Summary');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'welcome-screen.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'welcome-screen.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should import inquirer and chalk', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'welcome-screen.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+inquirer\s+from\s+['"]inquirer['"]/);
      expect(moduleContent).toMatch(/import\s+chalk\s+from\s+['"]chalk['"]/);
    });

    it('should import VALID_ROLES from role-recommendations', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'welcome-screen.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import.*VALID_ROLES.*from.*role-recommendations/);
    });
  });

  describe('UserProfile structure', () => {
    it('should define profile with required fields', () => {
      // Test that the module exports describe the expected structure
      // This is a documentation/contract test
      const expectedFields = ['name', 'email', 'role', 'organization'];
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'welcome-screen.js'),
        'utf8'
      );

      for (const field of expectedFields) {
        expect(moduleContent).toContain(`@property {string} ${field}`);
      }
    });
  });

  describe('Integration with VALID_ROLES', () => {
    it('should produce choices for all valid roles', () => {
      const choices = buildRoleChoices();
      const choiceValues = choices.map(c => c.value);

      for (const role of VALID_ROLES) {
        expect(choiceValues).toContain(role);
      }
    });

    it('should not include any roles not in VALID_ROLES', () => {
      const choices = buildRoleChoices();

      for (const choice of choices) {
        expect(VALID_ROLES).toContain(choice.value);
      }
    });
  });
});
