/**
 * Prompt Security Tests - Expert Review Requirements
 *
 * Validates security aspects of the prompt migration from Inquirer to @clack/prompts:
 * 1. tier-change-auth.js timing model (challenge expiration, auth requirement logic)
 * 2. advanced-override.js essential feature enforcement (ESSENTIAL_FEATURES cannot be removed)
 * 3. Password masking (prompts abstraction exports password function, no raw inquirer imports)
 *
 * @see Docs/05-project-management/PHASE2-V6-UPGRADE-PLAN-REVIEW.md
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import {
  CHALLENGE_EXPIRATION_MS,
  generateChallenge,
  requiresAuthentication,
  verifyChallenge
} from '../../src/utility/tools/security-config/tier-change-auth.js';

import {
  buildFeatureChoices,
  ESSENTIAL_FEATURES,
  validateFeatureSelection
} from '../../src/utility/tools/security-config/advanced-override.js';

// ============================================================================
// tier-change-auth.js timing model
// ============================================================================

describe('Prompt Security - Expert Review Requirements', () => {

  describe('tier-change-auth.js timing model', () => {
    it('should have a 5-minute challenge expiration', () => {
      expect(CHALLENGE_EXPIRATION_MS).toBe(5 * 60 * 1000);
    });

    it('should generate unique challenges each time', () => {
      const c1 = generateChallenge();
      const c2 = generateChallenge();
      expect(c1.challenge).not.toBe(c2.challenge);
    });

    it('should generate challenges with correct structure', () => {
      const challenge = generateChallenge();
      expect(challenge).toHaveProperty('challenge');
      expect(challenge).toHaveProperty('expectedResponse');
      expect(challenge).toHaveProperty('expiresAt');
      expect(typeof challenge.challenge).toBe('string');
      expect(typeof challenge.expectedResponse).toBe('string');
      expect(typeof challenge.expiresAt).toBe('number');
      expect(challenge.challenge.length).toBe(8);
      expect(challenge.expectedResponse.length).toBe(8);
    });

    it('should set expiration in the future', () => {
      const before = Date.now();
      const challenge = generateChallenge();
      const after = Date.now();
      expect(challenge.expiresAt).toBeGreaterThanOrEqual(before + CHALLENGE_EXPIRATION_MS);
      expect(challenge.expiresAt).toBeLessThanOrEqual(after + CHALLENGE_EXPIRATION_MS);
    });

    it('should reject expired challenges', () => {
      const challenge = generateChallenge();
      // Manually set the expiration to the past
      challenge.expiresAt = Date.now() - 1000;
      expect(verifyChallenge(challenge, challenge.expectedResponse)).toBe(false);
    });

    it('should accept valid challenge response', () => {
      const challenge = generateChallenge();
      expect(verifyChallenge(challenge, challenge.expectedResponse)).toBe(true);
    });

    it('should accept valid challenge response case-insensitively', () => {
      const challenge = generateChallenge();
      expect(verifyChallenge(challenge, challenge.expectedResponse.toLowerCase())).toBe(true);
    });

    it('should reject invalid challenge response', () => {
      const challenge = generateChallenge();
      expect(verifyChallenge(challenge, 'INVALID1')).toBe(false);
    });

    it('should require auth for tier downgrades', () => {
      expect(requiresAuthentication('advanced', 'standard')).toBe(true);
      expect(requiresAuthentication('enterprise', 'essential')).toBe(true);
      expect(requiresAuthentication('enterprise', 'standard')).toBe(true);
      expect(requiresAuthentication('enterprise', 'advanced')).toBe(true);
      expect(requiresAuthentication('standard', 'essential')).toBe(true);
    });

    it('should NOT require auth for tier upgrades', () => {
      expect(requiresAuthentication('standard', 'advanced')).toBe(false);
      expect(requiresAuthentication('essential', 'enterprise')).toBe(false);
      expect(requiresAuthentication('essential', 'standard')).toBe(false);
      expect(requiresAuthentication('advanced', 'enterprise')).toBe(false);
    });

    it('should NOT require auth for initial config (null from tier)', () => {
      expect(requiresAuthentication(null, 'standard')).toBe(false);
      expect(requiresAuthentication(null, 'enterprise')).toBe(false);
      expect(requiresAuthentication(null, 'essential')).toBe(false);
      expect(requiresAuthentication(undefined, 'advanced')).toBe(false);
    });

    it('should NOT require auth for same tier', () => {
      expect(requiresAuthentication('standard', 'standard')).toBe(false);
      expect(requiresAuthentication('enterprise', 'enterprise')).toBe(false);
      expect(requiresAuthentication('essential', 'essential')).toBe(false);
    });
  });

  // ============================================================================
  // advanced-override.js essential feature enforcement
  // ============================================================================

  describe('advanced-override.js essential feature enforcement', () => {
    it('should define at least one essential feature', () => {
      expect(ESSENTIAL_FEATURES.length).toBeGreaterThan(0);
    });

    it('should define ESSENTIAL_FEATURES as an array of strings', () => {
      expect(Array.isArray(ESSENTIAL_FEATURES)).toBe(true);
      for (const feature of ESSENTIAL_FEATURES) {
        expect(typeof feature).toBe('string');
      }
    });

    it('should include auth as essential', () => {
      expect(ESSENTIAL_FEATURES).toContain('auth');
    });

    it('should reject selection missing essential features', () => {
      const result = validateFeatureSelection([], 'standard');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('auth'))).toBe(true);
    });

    it('should reject selection with non-essential features but missing essential', () => {
      const result = validateFeatureSelection(['rbac', 'session-management'], 'advanced');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('auth'))).toBe(true);
    });

    it('should accept selection including all essential features', () => {
      const result = validateFeatureSelection(['auth'], 'essential');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept selection with essential plus additional features', () => {
      const result = validateFeatureSelection(['auth', 'validators-6', 'rbac'], 'advanced');
      expect(result.valid).toBe(true);
    });

    it('should mark essential features as disabled/required in choices', () => {
      const choices = buildFeatureChoices(['auth']);
      // Filter out separator entries
      const featureChoices = choices.filter(c => c.type !== 'separator');
      const authChoice = featureChoices.find(c => c.value === 'auth');
      expect(authChoice).toBeDefined();
      expect(authChoice.disabled).toBeTruthy();
      expect(authChoice.checked).toBe(true);
    });

    it('should not mark non-essential features as disabled', () => {
      const choices = buildFeatureChoices(['rbac']);
      const featureChoices = choices.filter(c => c.type !== 'separator');
      const rbacChoice = featureChoices.find(c => c.value === 'rbac');
      expect(rbacChoice).toBeDefined();
      // Non-essential features should NOT have disabled set
      expect(rbacChoice.disabled).toBeFalsy();
    });
  });

  // ============================================================================
  // Password masking verification
  // ============================================================================

  describe('password masking verification', () => {
    it('should use prompts abstraction (not raw inquirer) in tier-change-auth.js', () => {
      const tierChangeAuthPath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../src/utility/tools/security-config/tier-change-auth.js'
      );
      const tierChangeAuth = fs.readFileSync(tierChangeAuthPath, 'utf8');
      expect(tierChangeAuth).not.toContain("from 'inquirer'");
      expect(tierChangeAuth).not.toContain('require(\'inquirer\')');
      expect(tierChangeAuth).toContain("from '../../cli/prompts.js'");
    });

    it('should use prompts abstraction (not raw inquirer) in advanced-override.js', () => {
      const advancedOverridePath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../src/utility/tools/security-config/advanced-override.js'
      );
      const advancedOverride = fs.readFileSync(advancedOverridePath, 'utf8');
      expect(advancedOverride).not.toContain("from 'inquirer'");
      expect(advancedOverride).not.toContain('require(\'inquirer\')');
      expect(advancedOverride).toContain("from '../../cli/prompts.js'");
    });

    it('should import text (not input) for challenge response in tier-change-auth.js', () => {
      const tierChangeAuthPath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../src/utility/tools/security-config/tier-change-auth.js'
      );
      const tierChangeAuth = fs.readFileSync(tierChangeAuthPath, 'utf8');
      // Verify it imports 'text' from prompts (clack style, not inquirer 'input')
      expect(tierChangeAuth).toMatch(/import\s*\{[^}]*\btext\b[^}]*\}\s*from\s*['"]\.\.\/\.\.\/cli\/prompts\.js['"]/);
    });

    it('should verify prompts abstraction exports password function', async () => {
      const prompts = await import('../../src/utility/cli/prompts.js');
      expect(typeof prompts.password).toBe('function');
    });

    it('should verify prompts abstraction exports text function', async () => {
      const prompts = await import('../../src/utility/cli/prompts.js');
      expect(typeof prompts.text).toBe('function');
    });

    it('should verify prompts abstraction exports confirm function', async () => {
      const prompts = await import('../../src/utility/cli/prompts.js');
      expect(typeof prompts.confirm).toBe('function');
    });

    it('should verify prompts abstraction exports select function', async () => {
      const prompts = await import('../../src/utility/cli/prompts.js');
      expect(typeof prompts.select).toBe('function');
    });

    it('should verify prompts abstraction exports multiselect function', async () => {
      const prompts = await import('../../src/utility/cli/prompts.js');
      expect(typeof prompts.multiselect).toBe('function');
    });
  });
});
