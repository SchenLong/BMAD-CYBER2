/**
 * Unit Tests for Tier Change Authentication - SEC-CFG-001
 * Epic 2, Security Enhancement
 *
 * Tests the tier-change-auth.js functionality for MFA/authentication
 * requirements on security tier changes.
 *
 * @module tier-change-auth.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  TIER_CHANGE_LOG_PATH,
  CHALLENGE_EXPIRATION_MS,
  generateChallenge,
  verifyChallenge,
  requiresAuthentication,
  logTierChangeAttempt,
  readTierChangeLog,
  authenticateTierChange
} from './tier-change-auth.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test fixtures
const MOCK_PROJECT_ROOT = path.join(__dirname, '__test_fixtures_auth__');
const MOCK_LOG_PATH = path.join(MOCK_PROJECT_ROOT, '_bmad/core/security');

// Setup and teardown
function setupTestFixtures() {
  cleanupTestFixtures();
  fs.mkdirSync(MOCK_LOG_PATH, { recursive: true });
}

function cleanupTestFixtures() {
  if (fs.existsSync(MOCK_PROJECT_ROOT)) {
    fs.rmSync(MOCK_PROJECT_ROOT, { recursive: true, force: true });
  }
}

describe('Tier Change Authentication - SEC-CFG-001', () => {
  beforeAll(() => {
    setupTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('Constants', () => {
    it('should have correct log path', () => {
      expect(TIER_CHANGE_LOG_PATH).toBe('_bmad/core/security/tier-change-log.json');
    });

    it('should have 5 minute challenge expiration', () => {
      expect(CHALLENGE_EXPIRATION_MS).toBe(5 * 60 * 1000);
    });
  });

  describe('generateChallenge()', () => {
    it('should generate a challenge object', () => {
      const challenge = generateChallenge();
      expect(challenge).toHaveProperty('challenge');
      expect(challenge).toHaveProperty('expectedResponse');
      expect(challenge).toHaveProperty('expiresAt');
    });

    it('should generate 8-character challenge', () => {
      const challenge = generateChallenge();
      expect(challenge.challenge).toHaveLength(8);
    });

    it('should generate 8-character expected response', () => {
      const challenge = generateChallenge();
      expect(challenge.expectedResponse).toHaveLength(8);
    });

    it('should generate uppercase challenge', () => {
      const challenge = generateChallenge();
      expect(challenge.challenge).toBe(challenge.challenge.toUpperCase());
    });

    it('should set expiration in the future', () => {
      const challenge = generateChallenge();
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should generate unique challenges', () => {
      const challenges = new Set();
      for (let i = 0; i < 10; i++) {
        challenges.add(generateChallenge().challenge);
      }
      // Should have at least 8 unique (allowing for rare collisions)
      expect(challenges.size).toBeGreaterThanOrEqual(8);
    });
  });

  describe('verifyChallenge()', () => {
    it('should verify correct response', () => {
      const challenge = generateChallenge();
      const result = verifyChallenge(challenge, challenge.expectedResponse);
      expect(result).toBe(true);
    });

    it('should be case-insensitive for response', () => {
      const challenge = generateChallenge();
      const result = verifyChallenge(challenge, challenge.expectedResponse.toLowerCase());
      expect(result).toBe(true);
    });

    it('should reject incorrect response', () => {
      const challenge = generateChallenge();
      const result = verifyChallenge(challenge, 'WRONGRES');
      expect(result).toBe(false);
    });

    it('should reject expired challenge', () => {
      const challenge = generateChallenge();
      // Set expiration to the past
      challenge.expiresAt = Date.now() - 1000;
      const result = verifyChallenge(challenge, challenge.expectedResponse);
      expect(result).toBe(false);
    });
  });

  describe('requiresAuthentication()', () => {
    it('should not require auth for initial configuration', () => {
      expect(requiresAuthentication(null, 'standard')).toBe(false);
      expect(requiresAuthentication(undefined, 'enterprise')).toBe(false);
    });

    it('should not require auth for same tier', () => {
      expect(requiresAuthentication('standard', 'standard')).toBe(false);
      expect(requiresAuthentication('enterprise', 'enterprise')).toBe(false);
    });

    it('should not require auth for upgrades', () => {
      expect(requiresAuthentication('essential', 'standard')).toBe(false);
      expect(requiresAuthentication('standard', 'advanced')).toBe(false);
      expect(requiresAuthentication('advanced', 'enterprise')).toBe(false);
      expect(requiresAuthentication('essential', 'enterprise')).toBe(false);
    });

    it('should require auth for downgrades', () => {
      expect(requiresAuthentication('standard', 'essential')).toBe(true);
      expect(requiresAuthentication('advanced', 'standard')).toBe(true);
      expect(requiresAuthentication('enterprise', 'advanced')).toBe(true);
      expect(requiresAuthentication('enterprise', 'essential')).toBe(true);
    });

    it('should require auth for beta to non-beta downgrade', () => {
      expect(requiresAuthentication('beta', 'enterprise')).toBe(true);
      expect(requiresAuthentication('beta', 'essential')).toBe(true);
    });
  });

  describe('logTierChangeAttempt()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should create log file if not exists', () => {
      const attempt = {
        timestamp: new Date().toISOString(),
        user: 'testuser',
        fromTier: 'enterprise',
        toTier: 'standard',
        success: false,
        reason: 'Test attempt'
      };

      logTierChangeAttempt(MOCK_PROJECT_ROOT, attempt);

      const logPath = path.join(MOCK_PROJECT_ROOT, TIER_CHANGE_LOG_PATH);
      expect(fs.existsSync(logPath)).toBe(true);
    });

    it('should append to existing log', () => {
      const attempt1 = {
        timestamp: new Date().toISOString(),
        user: 'user1',
        fromTier: 'enterprise',
        toTier: 'standard',
        success: false,
        reason: 'Attempt 1'
      };

      const attempt2 = {
        timestamp: new Date().toISOString(),
        user: 'user2',
        fromTier: 'advanced',
        toTier: 'essential',
        success: true,
        reason: 'Attempt 2'
      };

      logTierChangeAttempt(MOCK_PROJECT_ROOT, attempt1);
      logTierChangeAttempt(MOCK_PROJECT_ROOT, attempt2);

      const log = readTierChangeLog(MOCK_PROJECT_ROOT);
      expect(log).toHaveLength(2);
      expect(log[0].user).toBe('user1');
      expect(log[1].user).toBe('user2');
    });

    it('should limit log to 1000 entries', () => {
      // Write initial log with 999 entries
      const logPath = path.join(MOCK_PROJECT_ROOT, TIER_CHANGE_LOG_PATH);
      const initialLog = Array.from({ length: 999 }, (_, i) => ({
        timestamp: new Date().toISOString(),
        user: `user${i}`,
        fromTier: 'enterprise',
        toTier: 'standard',
        success: false,
        reason: `Entry ${i}`
      }));
      fs.writeFileSync(logPath, JSON.stringify(initialLog), 'utf8');

      // Add 5 more entries
      for (let i = 0; i < 5; i++) {
        logTierChangeAttempt(MOCK_PROJECT_ROOT, {
          timestamp: new Date().toISOString(),
          user: `newuser${i}`,
          fromTier: 'enterprise',
          toTier: 'standard',
          success: false,
          reason: `New entry ${i}`
        });
      }

      const log = readTierChangeLog(MOCK_PROJECT_ROOT);
      expect(log.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('readTierChangeLog()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should return empty array if log does not exist', () => {
      const log = readTierChangeLog(MOCK_PROJECT_ROOT);
      expect(log).toEqual([]);
    });

    it('should return logged attempts', () => {
      const attempt = {
        timestamp: new Date().toISOString(),
        user: 'testuser',
        fromTier: 'enterprise',
        toTier: 'standard',
        success: true,
        reason: 'Test'
      };

      logTierChangeAttempt(MOCK_PROJECT_ROOT, attempt);
      const log = readTierChangeLog(MOCK_PROJECT_ROOT);

      expect(log).toHaveLength(1);
      expect(log[0].user).toBe('testuser');
      expect(log[0].fromTier).toBe('enterprise');
      expect(log[0].toTier).toBe('standard');
    });

    it('should return empty array for malformed log', () => {
      const logPath = path.join(MOCK_PROJECT_ROOT, TIER_CHANGE_LOG_PATH);
      fs.writeFileSync(logPath, 'not valid json', 'utf8');

      const log = readTierChangeLog(MOCK_PROJECT_ROOT);
      expect(log).toEqual([]);
    });
  });

  describe('authenticateTierChange()', () => {
    beforeEach(() => {
      setupTestFixtures();
    });

    afterEach(() => {
      cleanupTestFixtures();
    });

    it('should allow initial configuration without auth', async () => {
      const result = await authenticateTierChange(null, 'enterprise', {
        projectRoot: MOCK_PROJECT_ROOT,
        skipPrompt: true
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('No authentication required');
    });

    it('should allow upgrades without auth', async () => {
      const result = await authenticateTierChange('standard', 'enterprise', {
        projectRoot: MOCK_PROJECT_ROOT,
        skipPrompt: true
      });

      expect(result.allowed).toBe(true);
    });

    it('should reject downgrades when skipping prompt', async () => {
      const result = await authenticateTierChange('enterprise', 'standard', {
        projectRoot: MOCK_PROJECT_ROOT,
        skipPrompt: true
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('failed or cancelled');
    });

    it('should log all tier change attempts', async () => {
      await authenticateTierChange('standard', 'enterprise', {
        projectRoot: MOCK_PROJECT_ROOT,
        skipPrompt: true
      });

      await authenticateTierChange('enterprise', 'standard', {
        projectRoot: MOCK_PROJECT_ROOT,
        skipPrompt: true
      });

      const log = readTierChangeLog(MOCK_PROJECT_ROOT);
      expect(log.length).toBeGreaterThanOrEqual(2);
    });
  });
});
