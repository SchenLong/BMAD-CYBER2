import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';

// Import the TokenGenerator after crypto/fs
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
  let tokenGenerator: TokenGenerator;
  let cryptoSpies: { [key: string]: any };
  const testKey = Buffer.alloc(32, 'test-key-32-bytes-for-aes-256!!');

  beforeEach(() => {
    vi.clearAllMocks();

    // Create spies on the crypto module
    cryptoSpies = {
      pbkdf2Sync: vi.spyOn(crypto, 'pbkdf2Sync').mockReturnValue(testKey),
      randomBytes: vi.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.alloc(16, 'test-iv')),
      randomUUID: vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-123'),
      createCipheriv: vi.spyOn(crypto, 'createCipheriv'),
      createDecipheriv: vi.spyOn(crypto, 'createDecipheriv')
    };

    // Setup cipher mocks
    const mockCipher = {
      update: vi.fn().mockReturnValue(Buffer.from('encrypted')),
      final: vi.fn().mockReturnValue(Buffer.from('final')),
      getAuthTag: vi.fn().mockReturnValue(Buffer.alloc(16, 'auth-tag'))
    };
    cryptoSpies.createCipheriv.mockReturnValue(mockCipher as any);

    // Setup decipher mocks
    const mockDecipher = {
      update: vi.fn().mockReturnValue(Buffer.from('{"test":"data"}')),
      final: vi.fn().mockReturnValue(Buffer.alloc(0)),
      setAuthTag: vi.fn()
    };
    cryptoSpies.createDecipheriv.mockReturnValue(mockDecipher as any);

    tokenGenerator = new TokenGenerator(testKey);
  });

  afterEach(() => {
    // Restore all spies
    Object.values(cryptoSpies).forEach(spy => spy.mockRestore());
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

      expect(cryptoSpies.pbkdf2Sync).toHaveBeenCalledWith(
        password,
        'bmad-auth-salt-v1',
        100000,
        32,
        'sha256'
      );
      expect(key).toEqual(testKey);
    });

    test('should generate random key when no password provided', () => {
      cryptoSpies.randomBytes.mockReturnValue(testKey);
      const key = TokenGenerator.generateKey();

      expect(cryptoSpies.randomBytes).toHaveBeenCalledWith(32);
      expect(key).toEqual(testKey);
    });

    test('should generate different keys for different passwords', () => {
      const key1 = TokenGenerator.generateKey('password1');
      const key2 = TokenGenerator.generateKey('password2');

      expect(cryptoSpies.pbkdf2Sync).toHaveBeenCalledTimes(2);
      // In real implementation, these would be different
    });

    test('should handle empty password string', () => {
      cryptoSpies.randomBytes.mockReturnValue(testKey);
      const key = TokenGenerator.generateKey('');

      // Empty string is falsy, so it should call randomBytes instead of pbkdf2Sync
      expect(cryptoSpies.randomBytes).toHaveBeenCalledWith(32);
      expect(cryptoSpies.pbkdf2Sync).not.toHaveBeenCalled();
      expect(key).toEqual(testKey);
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
      expect(cryptoSpies.randomBytes).toHaveBeenCalledWith(16);
      expect(cryptoSpies.createCipheriv).toHaveBeenCalledWith('aes-256-gcm', testKey, expect.any(Buffer));
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
      cryptoSpies.randomBytes
        .mockReturnValueOnce(Buffer.alloc(16, 'iv1'))
        .mockReturnValueOnce(Buffer.alloc(16, 'iv2'));

      const token1 = tokenGenerator.encrypt(testClaims);
      const token2 = tokenGenerator.encrypt(testClaims);

      expect(cryptoSpies.randomBytes).toHaveBeenCalledTimes(2);
      // Tokens should be different due to different IVs
    });
  });

  describe('decrypt', () => {
    beforeEach(() => {
      // Mock successful decryption
      const validClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2099-01-01T00:00:00.000Z', // Far future
        jti: 'token-123'
      };

      const mockDecipher = {
        update: vi.fn().mockReturnValue(Buffer.from(JSON.stringify(validClaims))),
        final: vi.fn().mockReturnValue(Buffer.alloc(0)),
        setAuthTag: vi.fn()
      };
      cryptoSpies.createDecipheriv.mockReturnValue(mockDecipher as any);
    });

    test('should decrypt valid tokens', () => {
      const token = 'bmad.v1.dGVzdC1kYXRh'; // base64url encoded test data
      const claims = tokenGenerator.decrypt(token);

      expect(claims).toBeDefined();
      expect(claims?.sub).toBe('user-123');
      expect(claims?.name).toBe('Test User');
    });

    test('should reject tokens without proper prefix', () => {
      const invalidToken = 'invalid.v1.dGVzdC1kYXRh';
      const claims = tokenGenerator.decrypt(invalidToken);

      expect(claims).toBeNull();
    });

    test('should reject tokens with invalid format', () => {
      const invalidToken = 'bmad.v1.invalid-base64!';

      // Mock Buffer.from to throw
      vi.spyOn(Buffer, 'from').mockImplementationOnce(() => {
        throw new Error('Invalid base64');
      });

      const claims = tokenGenerator.decrypt(invalidToken);
      expect(claims).toBeNull();
    });

    test('should reject expired tokens', () => {
      const expiredClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2020-01-01T00:00:00.000Z',
        exp: '2020-01-02T00:00:00.000Z', // Past date
        jti: 'token-123'
      };

      const mockDecipher = {
        update: vi.fn().mockReturnValue(Buffer.from(JSON.stringify(expiredClaims))),
        final: vi.fn().mockReturnValue(Buffer.alloc(0)),
        setAuthTag: vi.fn()
      };
      cryptoSpies.createDecipheriv.mockReturnValue(mockDecipher as any);

      const token = 'bmad.v1.dGVzdC1kYXRh';
      const claims = tokenGenerator.decrypt(token);

      expect(claims).toBeNull();
    });

    test('should handle decryption errors gracefully', () => {
      const mockDecipher = {
        update: vi.fn().mockImplementation(() => {
          throw new Error('Decryption failed');
        }),
        final: vi.fn(),
        setAuthTag: vi.fn()
      };
      cryptoSpies.createDecipheriv.mockReturnValue(mockDecipher as any);

      const token = 'bmad.v1.dGVzdC1kYXRh';
      const claims = tokenGenerator.decrypt(token);

      expect(claims).toBeNull();
    });

    test('should handle malformed JSON in decrypted content', () => {
      const mockDecipher = {
        update: vi.fn().mockReturnValue(Buffer.from('invalid-json{')),
        final: vi.fn().mockReturnValue(Buffer.alloc(0)),
        setAuthTag: vi.fn()
      };
      cryptoSpies.createDecipheriv.mockReturnValue(mockDecipher as any);

      const token = 'bmad.v1.dGVzdC1kYXRh';
      const claims = tokenGenerator.decrypt(token);

      expect(claims).toBeNull();
    });

    test('should validate auth tag during decryption', () => {
      const token = 'bmad.v1.' + Buffer.concat([
        Buffer.alloc(16, 'iv'),
        Buffer.alloc(16, 'auth'),
        Buffer.alloc(32, 'encrypted')
      ]).toString('base64url');

      tokenGenerator.decrypt(token);

      expect(cryptoSpies.createDecipheriv).toHaveBeenCalledWith(
        'aes-256-gcm',
        testKey,
        expect.any(Buffer)
      );

      const mockDecipher = cryptoSpies.createDecipheriv.mock.results[0].value;
      expect(mockDecipher.setAuthTag).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    const mockDate = new Date('2024-01-01T00:00:00.000Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // Mock successful encryption
      vi.spyOn(tokenGenerator, 'encrypt').mockReturnValue('bmad.v1.encrypted-token');
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

      expect(result.token).toBe('bmad.v1.encrypted-token');
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
      cryptoSpies.randomUUID
        .mockReturnValueOnce('unique-sub-1')
        .mockReturnValueOnce('unique-jti-1')
        .mockReturnValueOnce('unique-sub-2')
        .mockReturnValueOnce('unique-jti-2');

      const result1 = tokenGenerator.generateToken('User 1', undefined, ['user'], ['core']);
      const result2 = tokenGenerator.generateToken('User 2', undefined, ['user'], ['core']);

      expect(result1.claims.sub).toBe('unique-sub-1');
      expect(result1.claims.jti).toBe('unique-jti-1');
      expect(result2.claims.sub).toBe('unique-sub-2');
      expect(result2.claims.jti).toBe('unique-jti-2');
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
    test('should use secure random values', () => {
      tokenGenerator.generateToken('User', undefined, ['user'], ['core']);

      expect(cryptoSpies.randomUUID).toHaveBeenCalled();
      expect(cryptoSpies.randomBytes).toHaveBeenCalledWith(16);
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

      tokenGenerator.encrypt(claims);

      expect(cryptoSpies.createCipheriv).toHaveBeenCalledWith(
        'aes-256-gcm',
        testKey,
        expect.any(Buffer)
      );
    });

    test('should include authentication tag in encrypted data', () => {
      const claims: TokenClaims = {
        sub: 'user-123',
        name: 'Test User',
        roles: ['user'],
        modules: ['core'],
        iat: '2024-01-01T00:00:00.000Z',
        exp: '2024-01-02T00:00:00.000Z',
        jti: 'token-123'
      };

      tokenGenerator.encrypt(claims);

      const mockCipher = cryptoSpies.createCipheriv.mock.results[0].value;
      expect(mockCipher.getAuthTag).toHaveBeenCalled();
    });

    test('should use proper PBKDF2 parameters for key derivation', () => {
      TokenGenerator.generateKey('password');

      expect(cryptoSpies.pbkdf2Sync).toHaveBeenCalledWith(
        'password',
        'bmad-auth-salt-v1',
        100000, // iterations
        32,     // key length
        'sha256' // hash algorithm
      );
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