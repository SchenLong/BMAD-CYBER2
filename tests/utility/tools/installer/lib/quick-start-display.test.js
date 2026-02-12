/**
 * Unit Tests for Quick Start Guide Display - INST-033
 * Epic 5 - Installation Wizard Enhancement
 *
 * Tests the quick-start-display.js functionality for displaying
 * comprehensive quick start guide after installation.
 *
 * @module installer/lib/quick-start-display.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ATTRIBUTION,
  centerText,
  createSeparator,
  displayAttribution,
  displayDocumentationLinks,
  displayInstallationBanner,
  displayModuleSummary,
  displayQuickStart,
  displayQuickStartCommands,
  displaySecuritySummary,
  DOCUMENTATION_LINKS,
  formatFeatureName,
  MODULE_COMMANDS,
  padString,
  stripAnsi
} from './quick-start-display.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Test Fixtures
// ============================================================================

const sampleModules = {
  core: { name: 'Core Module', agents: 2, workflows: 19 },
  'cybersec-team': { name: 'Cybersecurity Team', agents: 15, workflows: 13 },
  'intel-team': { name: 'Intelligence Team', agents: 11, workflows: 19 }
};

const sampleFeatures = {
  inputValidation: true,
  outputSanitization: true,
  auditLogging: true,
  rbacEnabled: false,
  encryptionAtRest: true,
  rateLimiting: false
};

const fullInstallationResult = {
  enabledModules: ['core', 'cybersec-team', 'intel-team'],
  securityTier: 'Standard',
  features: sampleFeatures,
  allModules: sampleModules
};

const minimalInstallationResult = {
  enabledModules: ['core'],
  securityTier: 'Minimal',
  features: {},
  allModules: { core: { agents: 2, workflows: 19 } }
};

// ============================================================================
// Tests: Constants
// ============================================================================

describe('Quick Start Display - INST-033', () => {
  describe('Constants', () => {
    it('should have MODULE_COMMANDS for all supported modules', () => {
      expect(MODULE_COMMANDS).toBeDefined();
      expect(MODULE_COMMANDS.core).toBeDefined();
      expect(MODULE_COMMANDS['cybersec-team']).toBeDefined();
      expect(MODULE_COMMANDS['intel-team']).toBeDefined();
      expect(MODULE_COMMANDS['legal-team']).toBeDefined();
      expect(MODULE_COMMANDS['strategy-team']).toBeDefined();
      expect(MODULE_COMMANDS.bmm).toBeDefined();
    });

    it('should have commands array for each module', () => {
      for (const [key, module] of Object.entries(MODULE_COMMANDS)) {
        expect(module.commands).toBeInstanceOf(Array);
        expect(module.commands.length).toBeGreaterThan(0);
        expect(module.commands[0].description).toBeDefined();
        expect(module.commands[0].command).toBeDefined();
      }
    });

    it('should have DOCUMENTATION_LINKS defined', () => {
      expect(DOCUMENTATION_LINKS).toBeDefined();
      expect(DOCUMENTATION_LINKS.bmadMethod).toBeDefined();
      expect(DOCUMENTATION_LINKS.bmadCyber).toBeDefined();
    });

    it('should have proper URL format in documentation links', () => {
      for (const [key, link] of Object.entries(DOCUMENTATION_LINKS)) {
        expect(link.name).toBeDefined();
        expect(link.url).toMatch(/^https:\/\//);
      }
    });

    it('should have ATTRIBUTION defined', () => {
      expect(ATTRIBUTION).toBe('Vibecoded with Claude by blackunicorn.tech');
    });
  });

  // ============================================================================
  // Tests: Helper Functions
  // ============================================================================

  describe('padString()', () => {
    it('should pad string to specified width', () => {
      const result = padString('test', 10);
      expect(result).toBe('test      ');
      expect(result.length).toBe(10);
    });

    it('should return original string if already at width', () => {
      const result = padString('test', 4);
      expect(result).toBe('test');
    });

    it('should return original string if exceeds width', () => {
      const result = padString('testing', 4);
      expect(result).toBe('testing');
    });

    it('should handle empty string', () => {
      const result = padString('', 5);
      expect(result).toBe('     ');
    });
  });

  describe('stripAnsi()', () => {
    it('should remove ANSI escape codes', () => {
      const coloredText = '\x1b[32mgreen\x1b[0m';
      const result = stripAnsi(coloredText);
      expect(result).toBe('green');
    });

    it('should handle multiple ANSI codes', () => {
      const text = '\x1b[1m\x1b[32mbold green\x1b[0m';
      const result = stripAnsi(text);
      expect(result).toBe('bold green');
    });

    it('should return plain text unchanged', () => {
      const text = 'plain text';
      const result = stripAnsi(text);
      expect(result).toBe('plain text');
    });
  });

  describe('centerText()', () => {
    it('should center text in given width', () => {
      const result = centerText('test', 10);
      expect(result).toBe('   test   ');
      expect(result.length).toBe(10);
    });

    it('should handle odd width', () => {
      const result = centerText('ab', 7);
      expect(result.length).toBe(7);
      expect(result.trim()).toBe('ab');
    });

    it('should return text if equals or exceeds width', () => {
      const result = centerText('testing', 4);
      expect(result).toBe('testing');
    });
  });

  describe('createSeparator()', () => {
    it('should create separator of specified width', () => {
      const result = createSeparator(10);
      expect(result.length).toBe(10);
      expect(result).toBe('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    });

    it('should use custom character', () => {
      const result = createSeparator(5, '=');
      expect(result).toBe('=====');
    });
  });

  describe('formatFeatureName()', () => {
    it('should convert camelCase to readable format', () => {
      expect(formatFeatureName('inputValidation')).toBe('Input Validation');
      expect(formatFeatureName('auditLogging')).toBe('Audit Logging');
    });

    it('should handle single word', () => {
      expect(formatFeatureName('encryption')).toBe('Encryption');
    });

    it('should handle multiple capitals', () => {
      expect(formatFeatureName('rbacEnabled')).toBe('Rbac Enabled');
    });
  });

  // ============================================================================
  // Tests: Display Functions
  // ============================================================================

  describe('displayModuleSummary()', () => {
    it('should return formatted table with modules', () => {
      const result = displayModuleSummary(['core', 'cybersec-team'], sampleModules);
      expect(result).toContain('Installed Modules');
      expect(result).toContain('Module');
      expect(result).toContain('Agents');
      expect(result).toContain('Workflows');
      expect(result).toContain('Status');
    });

    it('should include module codes', () => {
      const result = displayModuleSummary(['core', 'intel-team'], sampleModules);
      expect(result).toContain('core');
      expect(result).toContain('intel-team');
    });

    it('should display agent and workflow counts', () => {
      const plainResult = stripAnsi(displayModuleSummary(['core'], sampleModules));
      expect(plainResult).toContain('2');
      expect(plainResult).toContain('19');
    });

    it('should handle missing module info gracefully', () => {
      const result = displayModuleSummary(['unknown-module'], {});
      expect(result).toContain('unknown-module');
      expect(stripAnsi(result)).toContain('0');
    });

    it('should include table borders', () => {
      const result = displayModuleSummary(['core'], sampleModules);
      expect(result).toContain('\u250C'); // top-left corner
      expect(result).toContain('\u2514'); // bottom-left corner
    });
  });

  describe('displaySecuritySummary()', () => {
    it('should display security tier', () => {
      const result = displaySecuritySummary('Standard', sampleFeatures);
      expect(result).toContain('Security');
      expect(result).toContain('Standard');
    });

    it('should count enabled features correctly', () => {
      const result = displaySecuritySummary('Standard', sampleFeatures);
      expect(result).toContain('4 features enabled');
    });

    it('should handle singular feature', () => {
      const result = displaySecuritySummary('Minimal', { inputValidation: true });
      expect(result).toContain('1 feature enabled');
    });

    it('should handle zero features', () => {
      const result = displaySecuritySummary('None', {});
      expect(result).toContain('0 features enabled');
    });

    it('should list feature names', () => {
      const result = displaySecuritySummary('Standard', { auditLogging: true });
      expect(result).toContain('Audit Logging');
    });

    it('should use default tier when none provided', () => {
      const result = displaySecuritySummary(null, {});
      expect(result).toContain('Standard');
    });
  });

  describe('displayQuickStartCommands()', () => {
    it('should include Quick Start header', () => {
      const result = displayQuickStartCommands(['core']);
      expect(result).toContain('Quick Start');
    });

    it('should show core commands when core enabled', () => {
      const result = displayQuickStartCommands(['core']);
      expect(result).toContain('Abdul');
      expect(result).toContain('/bmad:core:agents:abdul');
    });

    it('should show module-specific commands', () => {
      const result = displayQuickStartCommands(['intel-team']);
      expect(result).toContain('OSINT');
      expect(result).toContain('/bmad:intel-team:agents:osint-lead');
    });

    it('should show Party Mode when multiple teams enabled', () => {
      const result = displayQuickStartCommands(['core', 'cybersec-team', 'intel-team']);
      expect(result).toContain('Party Mode');
      expect(result).toContain('/bmad:core:workflows:party-mode');
    });

    it('should not show Party Mode with single team', () => {
      const result = displayQuickStartCommands(['core', 'cybersec-team']);
      expect(result).not.toContain('multi-agent Party Mode');
    });

    it('should handle unknown modules gracefully', () => {
      const result = displayQuickStartCommands(['unknown-module']);
      expect(result).toContain('Quick Start');
    });
  });

  describe('displayDocumentationLinks()', () => {
    it('should include Documentation header', () => {
      const result = displayDocumentationLinks();
      expect(result).toContain('Documentation');
    });

    it('should include BMAD Method link', () => {
      const result = displayDocumentationLinks();
      expect(result).toContain('BMAD Method');
      expect(result).toContain('https://github.com/bmad-project/bmad-method');
    });

    it('should include BMAD-CYBER link', () => {
      const result = displayDocumentationLinks();
      expect(result).toContain('BMAD-CYBER');
      expect(result).toContain('https://github.com/bmad-project/bmad-cyber');
    });

    it('should format links with bullet points', () => {
      const result = displayDocumentationLinks();
      expect(result).toContain('\u2022');
    });
  });

  describe('displayAttribution()', () => {
    it('should include attribution text', () => {
      const result = displayAttribution();
      expect(result).toContain('Vibecoded with Claude by blackunicorn.tech');
    });

    it('should include separators', () => {
      const result = displayAttribution();
      expect(result).toContain('\u2500');
    });

    it('should center the attribution text', () => {
      const result = displayAttribution();
      const lines = result.split('\n');
      const attributionLine = lines.find(l => l.includes('blackunicorn'));
      expect(stripAnsi(attributionLine).trim()).toBe(ATTRIBUTION);
    });
  });

  describe('displayInstallationBanner()', () => {
    it('should include Installation Complete message', () => {
      const result = displayInstallationBanner();
      expect(result).toContain('Installation Complete');
    });

    it('should include box drawing characters', () => {
      const result = displayInstallationBanner();
      expect(result).toContain('\u2554'); // top-left double
      expect(result).toContain('\u255D'); // bottom-right double
    });

    it('should be 3 lines', () => {
      const result = displayInstallationBanner();
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
    });
  });

  // ============================================================================
  // Tests: Main Display Function
  // ============================================================================

  describe('displayQuickStart()', () => {
    it('should return object with formattedOutput', () => {
      const result = displayQuickStart(fullInstallationResult);
      expect(result.formattedOutput).toBeDefined();
      expect(typeof result.formattedOutput).toBe('string');
    });

    it('should include all sections', () => {
      const result = displayQuickStart(fullInstallationResult);
      expect(result.formattedOutput).toContain('Installation Complete');
      expect(result.formattedOutput).toContain('Installed Modules');
      expect(result.formattedOutput).toContain('Security');
      expect(result.formattedOutput).toContain('Quick Start');
      expect(result.formattedOutput).toContain('Documentation');
      expect(result.formattedOutput).toContain('blackunicorn.tech');
    });

    it('should return enabledModules in result', () => {
      const result = displayQuickStart(fullInstallationResult);
      expect(result.enabledModules).toEqual(['core', 'cybersec-team', 'intel-team']);
    });

    it('should return securityTier in result', () => {
      const result = displayQuickStart(fullInstallationResult);
      expect(result.securityTier).toBe('Standard');
    });

    it('should return featureCount in result', () => {
      const result = displayQuickStart(fullInstallationResult);
      expect(result.featureCount).toBe(4);
    });

    it('should handle null installationResults', () => {
      const result = displayQuickStart(null);
      expect(result.formattedOutput).toBeDefined();
      expect(result.enabledModules).toEqual([]);
    });

    it('should handle empty installationResults', () => {
      const result = displayQuickStart({});
      expect(result.formattedOutput).toBeDefined();
      expect(result.securityTier).toBe('Standard');
    });

    it('should handle minimal installation', () => {
      const result = displayQuickStart(minimalInstallationResult);
      expect(result.formattedOutput).toContain('core');
      expect(result.featureCount).toBe(0);
    });

    it('should skip module summary when no modules', () => {
      const result = displayQuickStart({ enabledModules: [] });
      expect(result.formattedOutput).not.toContain('Installed Modules');
    });

    it('should skip quick start commands when no modules', () => {
      const result = displayQuickStart({ enabledModules: [] });
      const plainOutput = stripAnsi(result.formattedOutput);
      expect(plainOutput).not.toContain('/bmad:');
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no CommonJS require)', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'quick-start-display.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/module\.exports/);
      expect(moduleContent).not.toMatch(/require\s*\(/);
    });

    it('should use export statements', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'quick-start-display.js'),
        'utf8'
      );

      expect(moduleContent.includes('export ')).toBe(true);
      expect(moduleContent.includes('export default')).toBe(true);
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle all teams enabled', () => {
      const allTeams = {
        enabledModules: ['core', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team', 'bmm'],
        securityTier: 'Enterprise',
        features: sampleFeatures,
        allModules: sampleModules
      };
      const result = displayQuickStart(allTeams);
      expect(result.formattedOutput).toContain('Party Mode');
    });

    it('should handle special characters in module names', () => {
      const result = displayModuleSummary(['cybersec-team'], sampleModules);
      expect(result).toContain('cybersec-team');
    });

    it('should handle very long tier names', () => {
      const result = displaySecuritySummary('Ultra High Security Enterprise Plus', {});
      expect(result).toContain('Ultra High Security Enterprise Plus');
    });

    it('should handle many features', () => {
      const manyFeatures = {
        feature1: true,
        feature2: true,
        feature3: true,
        feature4: true,
        feature5: true,
        feature6: true,
        feature7: true,
        feature8: true
      };
      const result = displaySecuritySummary('Custom', manyFeatures);
      expect(result).toContain('8 features enabled');
    });
  });
});
