/**
 * Unit Tests for Health Check Summary Display - INST-023
 * Epic 4 - Post-Install Health Check
 *
 * Tests the summary-display.js functionality for displaying
 * comprehensive health check results.
 *
 * @module health-check/summary-display.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  STATUS_ICONS,
  COLORS,
  OVERALL_STATUS,
  colorize,
  getStatusColor,
  getStatusIcon,
  generateBanner,
  formatCoreServicesSection,
  formatAuthenticationSection,
  formatLLMProviderSection,
  formatSecuritySection,
  generateRecommendations,
  formatRecommendationsSection,
  calculateOverallStatus,
  formatOverallStatus,
  calculateExitCode,
  displaySummary,
  formatJsonOutput
} from './summary-display.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Test Fixtures
// ============================================================================

const healthyModulesResult = {
  status: 'healthy',
  totalModules: 3,
  totalAgents: 27,
  totalWorkflows: 35,
  modules: [
    { name: 'core', status: 'healthy', agentCount: 4, workflowCount: 8 },
    { name: 'intel-team', status: 'healthy', agentCount: 11, workflowCount: 12 },
    { name: 'bmm', status: 'healthy', agentCount: 12, workflowCount: 15 }
  ],
  issues: []
};

const degradedModulesResult = {
  status: 'degraded',
  totalModules: 3,
  totalAgents: 24,
  totalWorkflows: 30,
  modules: [
    { name: 'core', status: 'healthy', agentCount: 4, workflowCount: 8, issues: [] },
    { name: 'intel-team', status: 'degraded', agentCount: 11, workflowCount: 10, issues: ['Missing 2 workflows'] },
    { name: 'bmm', status: 'healthy', agentCount: 12, workflowCount: 15, issues: [] }
  ],
  issues: ['intel-team: Missing 2 workflows']
};

const unhealthyModulesResult = {
  status: 'unhealthy',
  error: 'Manifest not found',
  totalModules: 0,
  totalAgents: 0,
  totalWorkflows: 0,
  modules: [],
  issues: ['Manifest file missing']
};

const validTokenResult = {
  status: 'valid',
  role: 'developer',
  userId: 'user-123',
  expiresIn: '6 days 23 hours',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  warnings: [],
  error: null
};

const expiredTokenResult = {
  status: 'expired',
  role: 'developer',
  userId: 'user-123',
  expiresIn: null,
  expiresAt: new Date(Date.now() - 1000),
  warnings: ['Token has expired'],
  error: null
};

const missingTokenResult = {
  status: 'missing',
  role: null,
  userId: null,
  expiresIn: null,
  expiresAt: null,
  warnings: [],
  error: 'Token file missing'
};

const healthyLLMResult = {
  status: 'healthy',
  providers: [
    { name: 'Claude', status: 'healthy', isPrimary: true, model: 'claude-3-opus' },
    { name: 'Ollama', status: 'healthy', isPrimary: false }
  ]
};

const degradedLLMResult = {
  status: 'degraded',
  providers: [
    { name: 'Claude', status: 'healthy', isPrimary: true, model: 'claude-3-opus' },
    { name: 'Ollama', status: 'unhealthy', isPrimary: false, error: 'Connection refused' }
  ]
};

const unhealthyLLMResult = {
  status: 'unhealthy',
  error: 'No providers available',
  providers: []
};

const healthySecurityResult = {
  status: 'healthy',
  validatorsEnabled: 6,
  guardsEnabled: 4,
  auditLogging: true,
  warnings: []
};

const degradedSecurityResult = {
  status: 'degraded',
  validatorsEnabled: 4,
  guardsEnabled: 2,
  auditLogging: false,
  warnings: ['Audit logging disabled']
};

const unhealthySecurityResult = {
  status: 'unhealthy',
  error: 'Security config not found',
  validatorsEnabled: 0,
  guardsEnabled: 0,
  auditLogging: false,
  warnings: []
};

// ============================================================================
// Tests: Constants
// ============================================================================

describe('Summary Display - INST-023', () => {
  describe('Constants', () => {
    it('should have all status icons', () => {
      expect(STATUS_ICONS.healthy).toBe('✓');
      expect(STATUS_ICONS.degraded).toBe('⚠');
      expect(STATUS_ICONS.unhealthy).toBe('✗');
      expect(STATUS_ICONS.valid).toBe('✓');
      expect(STATUS_ICONS.expired).toBe('✗');
      expect(STATUS_ICONS.invalid).toBe('✗');
      expect(STATUS_ICONS.missing).toBe('✗');
    });

    it('should have all color codes', () => {
      expect(COLORS.reset).toBeDefined();
      expect(COLORS.green).toBeDefined();
      expect(COLORS.yellow).toBeDefined();
      expect(COLORS.red).toBeDefined();
      expect(COLORS.cyan).toBeDefined();
    });

    it('should have all overall statuses', () => {
      expect(OVERALL_STATUS.HEALTHY).toBe('HEALTHY');
      expect(OVERALL_STATUS.DEGRADED).toBe('DEGRADED');
      expect(OVERALL_STATUS.UNHEALTHY).toBe('UNHEALTHY');
    });
  });

  // ============================================================================
  // Tests: Color Utilities
  // ============================================================================

  describe('colorize()', () => {
    it('should wrap text with color codes', () => {
      const result = colorize('test', 'green');
      expect(result).toContain(COLORS.green);
      expect(result).toContain('test');
      expect(result).toContain(COLORS.reset);
    });

    it('should use reset for unknown colors', () => {
      const result = colorize('test', 'unknown');
      expect(result).toContain(COLORS.reset);
    });
  });

  describe('getStatusColor()', () => {
    it('should return green for healthy/valid', () => {
      expect(getStatusColor('healthy')).toBe('green');
      expect(getStatusColor('valid')).toBe('green');
    });

    it('should return yellow for degraded', () => {
      expect(getStatusColor('degraded')).toBe('yellow');
    });

    it('should return red for other statuses', () => {
      expect(getStatusColor('unhealthy')).toBe('red');
      expect(getStatusColor('expired')).toBe('red');
      expect(getStatusColor('invalid')).toBe('red');
    });

    it('should handle case insensitivity', () => {
      expect(getStatusColor('HEALTHY')).toBe('green');
      expect(getStatusColor('Degraded')).toBe('yellow');
    });

    it('should handle null/undefined', () => {
      expect(getStatusColor(null)).toBe('red');
      expect(getStatusColor(undefined)).toBe('red');
    });
  });

  describe('getStatusIcon()', () => {
    it('should return correct icons', () => {
      expect(getStatusIcon('healthy')).toBe('✓');
      expect(getStatusIcon('degraded')).toBe('⚠');
      expect(getStatusIcon('unhealthy')).toBe('✗');
    });

    it('should return ? for unknown status', () => {
      expect(getStatusIcon('unknown')).toBe('?');
    });
  });

  // ============================================================================
  // Tests: Banner
  // ============================================================================

  describe('generateBanner()', () => {
    it('should include BMAD-CYBER Health Check title', () => {
      const banner = generateBanner();
      expect(banner).toContain('BMAD-CYBER Health Check');
    });

    it('should include decorative lines', () => {
      const banner = generateBanner();
      expect(banner).toContain('═');
    });
  });

  // ============================================================================
  // Tests: Section Formatters
  // ============================================================================

  describe('formatCoreServicesSection()', () => {
    it('should format healthy modules', () => {
      const output = formatCoreServicesSection(healthyModulesResult);
      expect(output).toContain('Core Services:');
      expect(output).toContain('Framework loaded');
      expect(output).toContain('3 modules active');
      expect(output).toContain('27 agents');
      expect(output).toContain('35 workflows');
    });

    it('should format degraded modules with issues', () => {
      const output = formatCoreServicesSection(degradedModulesResult);
      expect(output).toContain('Core Services:');
      expect(output).toContain('intel-team');
      expect(output).toContain('Missing');
    });

    it('should format unhealthy modules', () => {
      const output = formatCoreServicesSection(unhealthyModulesResult);
      expect(output).toContain('Core Services:');
      expect(output).toContain('Manifest not found');
    });
  });

  describe('formatAuthenticationSection()', () => {
    it('should format valid token', () => {
      const output = formatAuthenticationSection(validTokenResult);
      expect(output).toContain('Authentication:');
      expect(output).toContain('Token valid');
      expect(output).toContain('6 days');
      expect(output).toContain('developer');
    });

    it('should format expired token with regeneration hint', () => {
      const output = formatAuthenticationSection(expiredTokenResult);
      expect(output).toContain('Token expired');
      expect(output).toContain('token:generate');
    });

    it('should format missing token with setup hint', () => {
      const output = formatAuthenticationSection(missingTokenResult);
      expect(output).toContain('not configured');
      expect(output).toContain('setup');
    });
  });

  describe('formatLLMProviderSection()', () => {
    it('should format healthy LLM with primary provider', () => {
      const output = formatLLMProviderSection(healthyLLMResult);
      expect(output).toContain('LLM Provider:');
      expect(output).toContain('Claude connected');
      expect(output).toContain('claude-3-opus');
      expect(output).toContain('Ollama');
    });

    it('should format degraded LLM with failing fallback', () => {
      const output = formatLLMProviderSection(degradedLLMResult);
      expect(output).toContain('Claude');
      expect(output).toContain('Ollama');
      expect(output).toContain('not available');
    });

    it('should format unhealthy LLM with setup hint', () => {
      const output = formatLLMProviderSection(unhealthyLLMResult);
      expect(output).toContain('No LLM providers');
      expect(output).toContain('llm:setup');
    });
  });

  describe('formatSecuritySection()', () => {
    it('should format healthy security', () => {
      const output = formatSecuritySection(healthySecurityResult);
      expect(output).toContain('Security:');
      expect(output).toContain('6 validators');
      expect(output).toContain('Audit logging enabled');
      expect(output).toContain('4 guards');
    });

    it('should format degraded security with warnings', () => {
      const output = formatSecuritySection(degradedSecurityResult);
      expect(output).toContain('4 validators');
      expect(output).toContain('Audit logging disabled');
    });

    it('should format unhealthy security with setup hint', () => {
      const output = formatSecuritySection(unhealthySecurityResult);
      expect(output).toContain('not found');
      expect(output).toContain('security:setup');
    });
  });

  // ============================================================================
  // Tests: Recommendations
  // ============================================================================

  describe('generateRecommendations()', () => {
    it('should return empty for all healthy', () => {
      const results = {
        modules: healthyModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      const recs = generateRecommendations(results);
      expect(recs.length).toBe(0);
    });

    it('should recommend token regeneration for expired', () => {
      const results = {
        modules: healthyModulesResult,
        token: expiredTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      const recs = generateRecommendations(results);
      expect(recs.some(r => r.includes('token:generate'))).toBe(true);
    });

    it('should recommend setup for missing token', () => {
      const results = {
        modules: healthyModulesResult,
        token: missingTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      const recs = generateRecommendations(results);
      expect(recs.some(r => r.includes('setup'))).toBe(true);
    });

    it('should recommend LLM setup for unhealthy', () => {
      const results = {
        modules: healthyModulesResult,
        token: validTokenResult,
        llm: unhealthyLLMResult,
        security: healthySecurityResult
      };
      const recs = generateRecommendations(results);
      expect(recs.some(r => r.includes('llm:setup'))).toBe(true);
    });
  });

  describe('formatRecommendationsSection()', () => {
    it('should return empty string for no recommendations', () => {
      const output = formatRecommendationsSection([]);
      expect(output).toBe('');
    });

    it('should format recommendations with arrows', () => {
      const output = formatRecommendationsSection(['First recommendation', 'Second recommendation']);
      expect(output).toContain('Recommendations:');
      expect(output).toContain('→');
      expect(output).toContain('First recommendation');
      expect(output).toContain('Second recommendation');
    });
  });

  // ============================================================================
  // Tests: Overall Status
  // ============================================================================

  describe('calculateOverallStatus()', () => {
    it('should return HEALTHY when all healthy/valid', () => {
      const results = {
        modules: healthyModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      expect(calculateOverallStatus(results)).toBe('HEALTHY');
    });

    it('should return DEGRADED when any degraded', () => {
      const results = {
        modules: degradedModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      expect(calculateOverallStatus(results)).toBe('DEGRADED');
    });

    it('should return UNHEALTHY when critical components fail', () => {
      const results = {
        modules: unhealthyModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      expect(calculateOverallStatus(results)).toBe('UNHEALTHY');
    });

    it('should return DEGRADED when only token is missing', () => {
      const results = {
        modules: healthyModulesResult,
        token: missingTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      expect(calculateOverallStatus(results)).toBe('DEGRADED');
    });
  });

  describe('formatOverallStatus()', () => {
    it('should format HEALTHY in green', () => {
      const output = formatOverallStatus('HEALTHY');
      expect(output).toContain('Overall Status:');
      expect(output).toContain('HEALTHY');
    });

    it('should format DEGRADED in yellow', () => {
      const output = formatOverallStatus('DEGRADED');
      expect(output).toContain('DEGRADED');
    });

    it('should format UNHEALTHY in red', () => {
      const output = formatOverallStatus('UNHEALTHY');
      expect(output).toContain('UNHEALTHY');
    });
  });

  describe('calculateExitCode()', () => {
    it('should return 0 for HEALTHY', () => {
      expect(calculateExitCode('HEALTHY')).toBe(0);
    });

    it('should return 1 for DEGRADED', () => {
      expect(calculateExitCode('DEGRADED')).toBe(1);
    });

    it('should return 2 for UNHEALTHY', () => {
      expect(calculateExitCode('UNHEALTHY')).toBe(2);
    });
  });

  // ============================================================================
  // Tests: Main Display Function
  // ============================================================================

  describe('displaySummary()', () => {
    it('should return exit code and formatted output', () => {
      const results = {
        modules: healthyModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      const { exitCode, formattedOutput, overallStatus } = displaySummary(results);
      expect(exitCode).toBe(0);
      expect(overallStatus).toBe('HEALTHY');
      expect(formattedOutput).toContain('BMAD-CYBER Health Check');
      expect(formattedOutput).toContain('Core Services:');
      expect(formattedOutput).toContain('Authentication:');
      expect(formattedOutput).toContain('LLM Provider:');
      expect(formattedOutput).toContain('Security:');
    });

    it('should handle missing results gracefully', () => {
      const results = {};
      const { exitCode, formattedOutput } = displaySummary(results);
      expect(exitCode).toBeGreaterThan(0);
      expect(formattedOutput).toContain('BMAD-CYBER Health Check');
    });

    it('should support noColor option', () => {
      const results = {
        modules: healthyModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      // Note: noColor modifies COLORS in place for this test
      const { formattedOutput } = displaySummary(results, { noColor: true });
      expect(formattedOutput).toBeDefined();
    });
  });

  // ============================================================================
  // Tests: JSON Output
  // ============================================================================

  describe('formatJsonOutput()', () => {
    it('should return structured JSON object', () => {
      const results = {
        modules: healthyModulesResult,
        token: validTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      const json = formatJsonOutput(results);

      expect(json.timestamp).toBeDefined();
      expect(json.overallStatus).toBe('HEALTHY');
      expect(json.exitCode).toBe(0);
      expect(json.checks.modules).toEqual(healthyModulesResult);
      expect(json.checks.token).toEqual(validTokenResult);
      expect(json.checks.llm).toEqual(healthyLLMResult);
      expect(json.checks.security).toEqual(healthySecurityResult);
      expect(json.recommendations).toEqual([]);
    });

    it('should include recommendations for issues', () => {
      const results = {
        modules: healthyModulesResult,
        token: expiredTokenResult,
        llm: healthyLLMResult,
        security: healthySecurityResult
      };
      const json = formatJsonOutput(results);

      expect(json.recommendations.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Tests: ESM Compatibility
  // ============================================================================

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax (no CommonJS require)', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'summary-display.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/module\.exports/);
      expect(moduleContent).not.toMatch(/require\s*\(/);
    });

    it('should use export statements', () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'summary-display.js'),
        'utf8'
      );

      expect(moduleContent.includes('export ')).toBe(true);
    });
  });
});
