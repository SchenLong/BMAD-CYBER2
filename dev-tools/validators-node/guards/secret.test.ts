/**
 * Tests for secret guard
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEntropy,
  isHighEntropy,
  isExpectedSecretFile,
  isExampleContent,
  detectSecrets,
  validateSecretGuard,
} from '../../../.claude/validators-node/src/guards/secret.js';
import { EXIT_CODES } from '../../../.claude/validators-node/src/types/index.js';

describe('calculateEntropy', () => {
  it('should return 0 for empty string', () => {
    expect(calculateEntropy('')).toBe(0);
  });

  it('should return 0 for single character repeated', () => {
    expect(calculateEntropy('aaaaaaaaaa')).toBe(0);
  });

  it('should return low entropy for simple patterns', () => {
    const entropy = calculateEntropy('abababab');
    expect(entropy).toBeLessThan(2);
  });

  it('should return high entropy for random strings', () => {
    const entropy = calculateEntropy('aB3$dF7!hJ9@kL2#');
    expect(entropy).toBeGreaterThan(3);
  });
});

describe('isHighEntropy', () => {
  it('should return false for low entropy strings', () => {
    expect(isHighEntropy('password123')).toBe(false);
    expect(isHighEntropy('abcdefghij')).toBe(false);
  });

  it('should return true for high entropy strings', () => {
    expect(isHighEntropy('aB3$dF7!hJ9@kL2#mN5%')).toBe(true);
    expect(isHighEntropy('Xk9#mP2$vL7@nQ4!')).toBe(true);
  });

  it('should use custom threshold', () => {
    const value = 'abcdefghijklmnop'; // moderate entropy
    expect(isHighEntropy(value, 2.0)).toBe(true);
    expect(isHighEntropy(value, 5.0)).toBe(false);
  });
});

describe('isExpectedSecretFile', () => {
  it('should identify example env files', () => {
    expect(isExpectedSecretFile('.env.example')).toBe(true);
    expect(isExpectedSecretFile('.env.template')).toBe(true);
    expect(isExpectedSecretFile('.env.sample')).toBe(true);
    expect(isExpectedSecretFile('example.env')).toBe(true);
    expect(isExpectedSecretFile('template.env')).toBe(true);
  });

  it('should not identify actual env files', () => {
    expect(isExpectedSecretFile('.env')).toBe(false);
    expect(isExpectedSecretFile('.env.local')).toBe(false);
    expect(isExpectedSecretFile('.env.production')).toBe(false);
  });

  it('should handle empty path', () => {
    expect(isExpectedSecretFile('')).toBe(false);
  });
});

describe('isExampleContent', () => {
  it('should detect placeholder in context', () => {
    const content = 'API_KEY=your_api_key_here';
    expect(isExampleContent(content, 'API_KEY=your_api_key_here')).toBe(true);
  });

  it('should detect xxx patterns', () => {
    const content = 'PASSWORD=xxxxxxxx';
    expect(isExampleContent(content, 'PASSWORD=xxxxxxxx')).toBe(true);
  });

  it('should not flag real secrets without indicators', () => {
    const content = 'API_KEY="sk-abc123def456ghi789jkl"';
    expect(isExampleContent(content, 'API_KEY="sk-abc123def456ghi789jkl"')).toBe(false);
  });
});

describe('detectSecrets', () => {
  describe('AWS secrets', () => {
    it('should detect AWS Access Key ID', () => {
      const content = 'aws_access_key_id = AKIAIOSFODNN7EXAMPLE';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'AWS Access Key ID')).toBe(true);
    });

    it('should detect AWS Secret Access Key', () => {
      const content = 'aws_secret_access_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'AWS Secret Access Key')).toBe(true);
    });
  });

  describe('GitHub tokens', () => {
    it('should detect GitHub PAT', () => {
      const content = 'GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'GitHub Personal Access Token')).toBe(true);
    });

    it('should detect GitHub OAuth token', () => {
      const content = 'token=gho_1234567890abcdefghijklmnopqrstuvwxyz';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'GitHub OAuth Token')).toBe(true);
    });
  });

  describe('Stripe keys', () => {
    it('should detect Stripe secret key with sufficient length', () => {
      // Stripe keys need at least 24 chars after sk_live_
      const content = 'STRIPE_SECRET_KEY=sk_test_FAKEKEYFFORTESTING123456789012';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'Stripe Secret Key')).toBe(true);
    });
  });

  describe('Private keys', () => {
    it('should detect RSA private key', () => {
      const content = '-----BEGIN RSA PRIVATE KEY-----\nMIIE...';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'Private Key')).toBe(true);
    });

    it('should detect generic private key', () => {
      const content = '-----BEGIN PRIVATE KEY-----\nMIIE...';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'Private Key')).toBe(true);
    });

    it('should detect PGP private key', () => {
      const content = '-----BEGIN PGP PRIVATE KEY BLOCK-----\nVersion...';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'PGP Private Key')).toBe(true);
    });
  });

  describe('Database URLs', () => {
    it('should detect MongoDB connection string', () => {
      const content = 'MONGO_URI=mongodb://user:password@localhost:27017/db';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'Database Connection URL')).toBe(true);
    });

    it('should detect PostgreSQL connection string', () => {
      const content = 'DATABASE_URL=postgres://user:pass@host:5432/db';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'Database Connection URL')).toBe(true);
    });
  });

  describe('JWT tokens', () => {
    it('should detect JWT', () => {
      const content = 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const secrets = detectSecrets(content);
      expect(secrets.some(s => s.secretType === 'JWT Token')).toBe(true);
    });
  });

  describe('example content filtering', () => {
    it('should not detect example secrets with your_api_key', () => {
      const content = 'API_KEY=your_api_key_here';
      const secrets = detectSecrets(content);
      // Generic patterns require 20+ chars, so this won't match anyway
      expect(secrets.length).toBe(0);
    });
  });
});

describe('validateSecretGuard', () => {
  it('should allow empty content', () => {
    expect(validateSecretGuard('', 'file.txt')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow example files', () => {
    const content = 'API_KEY=sk_test_FAKEKEYFFORTESTING123456789012';
    expect(validateSecretGuard(content, '.env.example')).toBe(EXIT_CODES.ALLOW);
  });

  it('should allow content without secrets', () => {
    const content = 'const message = "Hello World";';
    expect(validateSecretGuard(content, 'app.js')).toBe(EXIT_CODES.ALLOW);
  });

  it('should block content with Stripe secrets', () => {
    const content = 'STRIPE_KEY=sk_test_FAKEKEYFFORTESTING123456789012';
    expect(validateSecretGuard(content, 'config.js')).toBe(EXIT_CODES.HARD_BLOCK);
  });

  it('should block private keys', () => {
    const content = '-----BEGIN RSA PRIVATE KEY-----\nMIIEp...';
    expect(validateSecretGuard(content, 'key.pem')).toBe(EXIT_CODES.HARD_BLOCK);
  });
});
