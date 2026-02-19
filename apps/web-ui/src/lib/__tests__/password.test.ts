/**
 * Password Utilities Unit Tests
 * Story 1.2: Authentication System - Core
 */

import { describe, it, expect } from '@jest/globals';
import {
  hashPassword,
  verifyPassword,
  calculatePasswordEntropy,
  validatePasswordStrength,
  getPasswordStrengthScore,
  getPasswordStrengthLabel,
} from '../auth/password';

describe('hashPassword', () => {
  it('should hash a password with bcrypt', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('should generate different hashes for the same password', async () => {
    const password = 'TestPassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2); // bcrypt uses random salt
  });

  it('should include bcrypt version identifier', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt $2a$, $2b$, or $2y$
  });
});

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword('WrongPassword123!', hash);

    expect(isValid).toBe(false);
  });

  it('should return false for empty password', async () => {
    const hash = await hashPassword('TestPassword123!');
    const isValid = await verifyPassword('', hash);

    expect(isValid).toBe(false);
  });
});

describe('calculatePasswordEntropy', () => {
  it('should return 0 for empty password', () => {
    expect(calculatePasswordEntropy('')).toBe(0);
  });

  it('should calculate entropy for lowercase only', () => {
    const entropy = calculatePasswordEntropy('aaaa');
    expect(entropy).toBeCloseTo(4 * Math.log2(26), 0.1);
  });

  it('should calculate entropy for uppercase + lowercase', () => {
    const entropy = calculatePasswordEntropy('AaAa');
    expect(entropy).toBeCloseTo(4 * Math.log2(52), 0.1);
  });

  it('should calculate entropy for mixed characters', () => {
    const entropy = calculatePasswordEntropy('Aa1!');
    expect(entropy).toBeCloseTo(4 * Math.log2(94), 0.1);
  });

  it('should increase with password length', () => {
    const entropy1 = calculatePasswordEntropy('Test');
    const entropy2 = calculatePasswordEntropy('TestTest');
    expect(entropy2).toBeGreaterThan(entropy1);
  });
});

describe('validatePasswordStrength', () => {
  it('should reject passwords shorter than 12 characters', () => {
    const result = validatePasswordStrength('Short1!');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('at least 12 characters');
  });

  it('should reject passwords with low entropy', () => {
    const result = validatePasswordStrength('111111111111'); // 12 digits
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('too weak');
  });

  it('should accept strong passwords', () => {
    const result = validatePasswordStrength('StrongPass123!');
    expect(result.valid).toBe(true);
    expect(result.entropy).toBeGreaterThan(40);
  });

  it('should use custom entropy threshold', () => {
    const result = validatePasswordStrength('Test1234', 60);
    expect(result.valid).toBe(false); // entropy should be below 60
  });

  it('should return entropy in result', () => {
    const result = validatePasswordStrength('TestPassword123!');
    expect(result.entropy).toBeDefined();
    expect(result.entropy).toBeGreaterThan(0);
  });
});

describe('getPasswordStrengthScore', () => {
  it('should return 0 for empty password', () => {
    expect(getPasswordStrengthScore('')).toBe(0);
  });

  it('should return higher score for stronger passwords', () => {
    const weakScore = getPasswordStrengthScore('aaaaaaaaaaaa'); // 12 lowercase
    const strongScore = getPasswordStrengthScore('Aa1!Aa1!Aa1!Aa1!');

    expect(weakScore).toBeGreaterThan(0);
    expect(strongScore).toBeGreaterThan(weakScore);
  });

  it('should cap score at 100', () => {
    const score = getPasswordStrengthScore('Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!');
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getPasswordStrengthLabel', () => {
  it('should return "weak" for very low entropy', () => {
    // 3 chars: 3 * log2(26) ≈ 14.1 bits -> 'weak' (<30)
    expect(getPasswordStrengthLabel('aaa')).toBe('weak');
  });

  it('should return "fair" for low entropy', () => {
    // 7 lowercase chars: 7 * log2(26) ≈ 32.9 bits -> 'fair' (30-40)
    expect(getPasswordStrengthLabel('aaaaaaa')).toBe('fair');
  });

  it('should return "good" for moderate entropy', () => {
    // 11 lowercase chars: 11 * log2(26) ≈ 51.7 bits -> 'good' (40-55)
    expect(getPasswordStrengthLabel('aaaaaaaaaaa')).toBe('good');
  });

  it('should return "strong" for high entropy', () => {
    // 12 lowercase chars: 12 * log2(26) ≈ 56.4 bits -> 'strong' (55-70)
    expect(getPasswordStrengthLabel('aaaaaaaaaaaa')).toBe('strong');
  });

  it('should return "very-strong" for very high entropy', () => {
    // Mixed chars: 16 * log2(94) ≈ 104.3 bits -> 'very-strong' (>70)
    expect(getPasswordStrengthLabel('Aa1!Aa1!Aa1!Aa1!')).toBe('very-strong');
  });
});
