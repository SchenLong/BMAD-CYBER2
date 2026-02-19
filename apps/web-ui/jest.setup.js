// Jest setup file
// Set required environment variables for tests

process.env.JWT_SECRET = 'test-secret-key-for-jest-testing';
process.env.SESSION_SECRET = 'test-session-secret-for-jest';
process.env.COOKIE_SECRET = 'test-cookie-secret-for-jest';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.AUTH_SECRET = 'test-auth-secret-for-jest-testing';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

// Set test-specific flags
process.env.NODE_ENV = 'test';

// Mock next-auth at the top level before any imports
const mockNextAuth = jest.fn(() => ({
  handlers: {},
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next-auth', () => ({
  default: mockNextAuth,
  NextAuth: mockNextAuth,
}));

// Mock OAuth providers
const createMockProvider = () => jest.fn(() => ({ id: 'mock-provider' }));

jest.mock('next-auth/providers/google', () => {
  const mockFn = createMockProvider();
  return {
    default: mockFn,
    Google: mockFn,
  };
});

jest.mock('next-auth/providers/github', () => {
  const mockFn = createMockProvider();
  return {
    default: mockFn,
    GitHub: mockFn,
  };
});

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

// Mock jose library for JWT operations
// Provide comprehensive mocks for all commonly used jose functions
jest.mock('jose', () => {
  const mockSignJWT = jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setNotBefore: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  }));

  const mockJwtVerify = jest.fn().mockResolvedValue({
    payload: {
      userId: 'test-user-id',
      type: 'session',
    },
    protectedHeader: {
      alg: 'HS256',
    },
  });

  return {
    SignJWT: mockSignJWT,
    jwtVerify: mockJwtVerify,
    // Add other jose exports as needed
    importJWK: jest.fn(),
    importPKCS8: jest.fn(),
    importSPKI: jest.fn(),
    importKey: jest.fn(),
    calculateJwkThumbprint: jest.fn(),
  };
});
