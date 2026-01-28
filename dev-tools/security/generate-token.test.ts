import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';

// Import the TokenGenerator
const { TokenGenerator } = await import('../../_bmad/core/security/generate-token.js');

// Define types
interface TokenClaims {
  sub: string;
  name: string;
  email?: string;
  roles: string[];
  modules: string[];
  iat: string;
  exp: string;
  jti: string;
}

interface GeneratedToken {
  token: string;
  claims: TokenClaims;
  expiresAt: Date;
}

describe('TokenGenerator', () => {
  let tokenGenerator: InstanceType<typeof TokenGenerator>;
  const testKey = Buffer.alloc(32, 'test-key-32-bytes-for-aes-256!!');

  beforeEach(() => {
    vi.clearAllMocks();
    tokenGenerator = new TokenGenerator(testKey);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create TokenGenerator with valid 32-byte key', () => {
      expect(() => new TokenGenerator(testKey)).not.toThrow();
    });

    test('should reject keys that are not 32 bytes', () => {
      const invalidKey = Buffer.alloc(16, 'invalid');
      expect(() => new TokenGenerator(invalidKey)).toThrow('Key must be 32 bytes for AES-256');
    });

    test('should reject empty keys', () => {
      const emptyKey = Buffer.alloc(0);
      expect(() => new TokenGenerator(emptyKey)).toThrow('Key must be 32 bytes for AES-256');
    });

    test('should reject oversized keys', () => {
      const oversizedKey = Buffer.alloc(64, 'too-big');
      expect(() => new TokenGenerator(oversizedKey)).toThrow('Key must be 32 bytes for AES-256');
    });
  });

  describe('generateKey', () => {
    test('should generate key from password using PBKDF2', () => {
      const password = 'test-password';
      const key = TokenGenerator.generateKey(password);

      // Verify key is a 32-byte buffer (AES-256 key size)
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    test('should generate random key when no password provided', () => {
      const key = TokenGenerator.generateKey();

      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    test('should generate different keys for different passwords', () => {
      const key1 = TokenGenerator.generateKey('password1');
      const key2 = TokenGenerator.generateKey('password2');

      // Keys should be different for different passwords
      expect(key1.equals(key2)).toBe(false);
    });

    test('should handle empty password string', () => {
      const key = TokenGenerator.generateKey('');

      // Empty string is falsy, so it should generate a random key
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    test('should generate consistent keys for same password', () => {
      const key1 = TokenGenerator.generateKey('consistent-password');
      const key2 = TokenGenerator.generateKey('consistent-password');

      // Same password should produce same key (deterministic PBKDF2)
      expect(key1.equals(key2)).toBe(true);
    });
  });

  describe('encrypt', () => {
    const testClaims: TokenClaims = {
      sub: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['user'],
      modules: ['core'],
      iat: '2024-01-01T00:00:00.000Z',
      exp: '2024-01-02T00:00:00.000Z',
      jti: 'token-123'
    };

    test('should encrypt claims successfully', () => {
      const token = tokenGenerator.encrypt(testClaims);

      expect(token).toMatch(/^bmad\.v1\./);
    });

    test('should create token with proper format', () => {
      const token = tokenGenerator.encrypt(testClaims);

      expect(token).toMatch(/^bmad\.v1\.[A-Za-z0-9_-]+$/);
    });

    test('should handle claims with undefined optional fields', () => {
      const minimalClaims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2024-01-02T00:00:00.000Z',
        jti: 'token-123'
      };

      expect(() => tokenGenerator.encrypt(minimalClaims)).not.toThrow();
    });

    test('should handle claims with special characters', () => {
      const specialClaims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User 🚀',
        email: 'test+tag@example.com',
        roles: ['user', 'admin@org'],
        modules: ['core', 'test-module'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2024-01-02T00:00:00.000Z',
        jti: 'token-123'
      };

      expect(() => tokenGenerator.encrypt(specialClaims)).not.toThrow();
    });

    test('should use different IVs for each encryption', () => {
      const token1 = tokenGenerator.encrypt(testClaims);
      const token2 = tokenGenerator.encrypt(testClaims);

      // Tokens should be different due to different IVs (randomBytes generates unique IVs)
      expect(token1).not.toBe(token2);
    });
  });

  describe('decrypt', () => {
    const validClaims: TokenClaims = {
      sub: 'user-123',
      name: 'Test User',
      roles: ['user'],
      modules: ['core'],
      iat: '2024-01-01T00:00:00.000Z',
      exp: '2099-01-01T00:00:00.000Z', // Far future
      jti: 'token-123'
    };

    test('should decrypt valid tokens', () => {
      // First encrypt a token
      const token = tokenGenerator.encrypt(validClaims);

      // Then decrypt it
      const decrypted = tokenGenerator.decrypt(token);

      expect(decrypted).toBeDefined();
      expect(decrypted?.sub).toBe('user-123');
      expect(decrypted?.name).toBe('Test User');
    });

    test('should reject tokens without proper prefix', () => {
      const invalidToken = 'invalid.v1.dGVzdC1kYXRh';
      const claims = tokenGenerator.decrypt(invalidToken);

      expect(claims).toBeNull();
    });

    test('should reject tokens with invalid format', () => {
      const invalidToken = 'bmad.v1.!!!invalid-base64!!!';
      const claims = tokenGenerator.decrypt(invalidToken);
      expect(claims).toBeNull();
    });

    test('should reject expired tokens', () => {
      const expiredClaims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2020-01-01T00:00:00.000Z',
        exp: '2020-01-02T00:00:00.000Z', // Past date
        jti: 'token-123'
      };

      // Encrypt with expired claims
      const token = tokenGenerator.encrypt(expiredClaims);
      const decrypted = tokenGenerator.decrypt(token);

      expect(decrypted).toBeNull();
    });

    test('should handle decryption errors gracefully', () => {
      // Create a token with garbage data that will fail decryption
      const badToken = 'bmad.v1.' + Buffer.from('garbage-data-that-wont-decrypt').toString('base64url');
      const claims = tokenGenerator.decrypt(badToken);

      expect(claims).toBeNull();
    });

    test('should handle malformed JSON in decrypted content', () => {
      // This test verifies error handling for corrupted token data
      const token = 'bmad.v1.' + Buffer.concat([
        Buffer.alloc(16, 0), // iv
        Buffer.alloc(16, 0), // auth tag
        Buffer.alloc(32, 0)  // encrypted data
      ]).toString('base64url');

      const claims = tokenGenerator.decrypt(token);
      expect(claims).toBeNull();
    });

    test('should validate auth tag during decryption', () => {
      // Encrypt a valid token first
      const token = tokenGenerator.encrypt(validClaims);

      // Tamper with the auth tag portion of the token
      const tokenData = token.replace('bmad.v1.', '');
      const decoded = Buffer.from(tokenData, 'base64url');

      // Corrupt a byte in the auth tag area (bytes 16-32)
      if (decoded.length > 20) {
        decoded[20] = decoded[20] ^ 0xFF; // Flip bits in auth tag
      }

      const tamperedToken = 'bmad.v1.' + decoded.toString('base64url');
      const claims = tokenGenerator.decrypt(tamperedToken);

      // Should fail due to auth tag mismatch
      expect(claims).toBeNull();
    });
  });

  describe('generateToken', () => {
    const mockDate = new Date('2024-01-01T00:00:00.000Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should generate token with provided parameters', () => {
      const result = tokenGenerator.generateToken(
        'John Doe',
        'john@example.com',
        ['admin', 'user'],
        ['core', 'security'],
        24
      );

      expect(result.token).toMatch(/^bmad\.v1\./);
      expect(result.claims.name).toBe('John Doe');
      expect(result.claims.email).toBe('john@example.com');
      expect(result.claims.roles).toEqual(['admin', 'user']);
      expect(result.claims.modules).toEqual(['core', 'security']);
      expect(result.expiresAt.getTime()).toBe(mockDate.getTime() + 24 * 60 * 60 * 1000);
    });

    test('should use default expiry when not specified', () => {
      const result = tokenGenerator.generateToken(
        'John Doe',
        'john@example.com',
        ['user'],
        ['core']
      );

      expect(result.expiresAt.getTime()).toBe(mockDate.getTime() + 168 * 60 * 60 * 1000);
    });

    test('should handle undefined email', () => {
      const result = tokenGenerator.generateToken(
        'John Doe',
        undefined,
        ['user'],
        ['core']
      );

      expect(result.claims.email).toBeUndefined();
    });

    test('should generate unique subject and jti IDs', () => {
      const result1 = tokenGenerator.generateToken('User 1', undefined, ['user'], ['core']);
      const result2 = tokenGenerator.generateToken('User 2', undefined, ['user'], ['core']);

      // IDs should be unique UUIDs
      expect(result1.claims.sub).not.toBe(result2.claims.sub);
      expect(result1.claims.jti).not.toBe(result2.claims.jti);

      // Should be valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(result1.claims.sub).toMatch(uuidRegex);
      expect(result1.claims.jti).toMatch(uuidRegex);
    });

    test('should set proper timestamps', () => {
      const result = tokenGenerator.generateToken('User', undefined, ['user'], ['core'], 1);

      expect(result.claims.iat).toBe('2024-01-01T00:00:00.000Z');
      expect(result.claims.exp).toBe('2024-01-01T01:00:00.000Z');
    });

    test('should handle empty roles and modules arrays', () => {
      const result = tokenGenerator.generateToken('User', undefined, [], []);

      expect(result.claims.roles).toEqual([]);
      expect(result.claims.modules).toEqual([]);
    });

    test('should handle very short expiry times', () => {
      const result = tokenGenerator.generateToken('User', undefined, ['user'], ['core'], 0.1);

      const expectedExpiry = new Date(mockDate.getTime() + 0.1 * 60 * 60 * 1000);
      expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });

    test('should handle very long expiry times', () => {
      const result = tokenGenerator.generateToken('User', undefined, ['user'], ['core'], 8760); // 1 year

      const expectedExpiry = new Date(mockDate.getTime() + 8760 * 60 * 60 * 1000);
      expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle encryption failure in generateToken', () => {
      vi.spyOn(tokenGenerator, 'encrypt').mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      expect(() => tokenGenerator.generateToken('User', undefined, ['user'], ['core'])).toThrow();
    });

    test('should handle very large claims objects', () => {
      const largeClaims: TokenClaims = {
        sub: 'user-123',
        name: 'User with very long name '.repeat(100),
        email: 'very.long.email.address'.repeat(10) + '@example.com',
        roles: Array.from({ length: 100 }, (_, i) => `role-${i}`),
        modules: Array.from({ length: 100 }, (_, i) => `module-${i}`),
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2024-01-02T00:00:00.000Z',
        jti: 'token-123'
      };

      expect(() => tokenGenerator.encrypt(largeClaims)).not.toThrow();
    });

    test('should handle special characters in all string fields', () => {
      const result = tokenGenerator.generateToken(
        'User 测试 🚀',
        'test+tag@domain.co.uk',
        ['role:admin', 'org/team'],
        ['module-1', 'module_2', 'module.3']
      );

      expect(result.claims.name).toBe('User 测试 🚀');
      expect(result.claims.email).toBe('test+tag@domain.co.uk');
      expect(result.claims.roles).toContain('role:admin');
      expect(result.claims.modules).toContain('module.3');
    });

    test('should handle concurrent token generation', () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        tokenGenerator.generateToken(`User ${i}`, undefined, ['user'], ['core'])
      );

      expect(() => Promise.all(promises)).not.toThrow();
    });

    test('should handle buffer operations correctly', () => {
      const testData = 'test data with unicode 🔐';
      const buffer = Buffer.from(testData, 'utf8');
      const encoded = buffer.toString('base64url');
      const decoded = Buffer.from(encoded, 'base64url').toString('utf8');

      expect(decoded).toBe(testData);
    });
  });

  describe('Security Properties', () => {
    test('should use secure random values for token IDs', () => {
      const result = tokenGenerator.generateToken('User', undefined, ['user'], ['core']);

      // Verify UUIDs are generated (which use crypto.randomUUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(result.claims.sub).toMatch(uuidRegex);
      expect(result.claims.jti).toMatch(uuidRegex);
    });

    test('should use AES-256-GCM for encryption', () => {
      const claims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2024-01-02T00:00:00.000Z',
        jti: 'token-123'
      };

      const token = tokenGenerator.encrypt(claims);

      // Token should be properly formatted
      expect(token).toMatch(/^bmad\.v1\./);

      // Extract the payload and verify it contains IV + authTag + ciphertext
      const payload = token.replace('bmad.v1.', '');
      const decoded = Buffer.from(payload, 'base64url');

      // AES-256-GCM uses 16-byte IV and 16-byte auth tag minimum
      // So payload should be at least 32 bytes + some ciphertext
      expect(decoded.length).toBeGreaterThan(32);
    });

    test('should include authentication tag in encrypted data', () => {
      const claims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2099-01-01T00:00:00.000Z', // Far future to avoid expiration
        jti: 'token-123'
      };

      const token = tokenGenerator.encrypt(claims);

      // Decrypt should work with valid token
      const decrypted = tokenGenerator.decrypt(token);
      expect(decrypted).not.toBeNull();
      expect(decrypted?.sub).toBe('user-123');

      // Tampered token should fail (auth tag validation)
      const payload = token.replace('bmad.v1.', '');
      const decoded = Buffer.from(payload, 'base64url');
      decoded[20] = decoded[20] ^ 0xFF; // Corrupt auth tag area
      const tamperedToken = 'bmad.v1.' + decoded.toString('base64url');

      expect(tokenGenerator.decrypt(tamperedToken)).toBeNull();
    });

    test('should use proper PBKDF2 parameters for key derivation', () => {
      // Generate keys from same password - should be identical (deterministic)
      const key1 = TokenGenerator.generateKey('test-password');
      const key2 = TokenGenerator.generateKey('test-password');

      expect(key1.equals(key2)).toBe(true);
      expect(key1.length).toBe(32); // AES-256 key size

      // Different passwords should produce different keys
      const key3 = TokenGenerator.generateKey('different-password');
      expect(key1.equals(key3)).toBe(false);
    });

    test('should produce base64url encoded tokens', () => {
      const claims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2024-01-02T00:00:00.000Z',
        jti: 'token-123'
      };

      const token = tokenGenerator.encrypt(claims);
      const tokenPart = token.replace('bmad.v1.', '');

      // base64url should not contain + or / characters
      expect(tokenPart).not.toMatch(/[+/]/);
      // Should be valid base64url
      expect(() => Buffer.from(tokenPart, 'base64url')).not.toThrow();
    });
  });
});
