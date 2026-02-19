/**
 * Mock Setup for API Integration Tests
 *
 * Provides mocked versions of external dependencies like Prisma,
 * session validation, and other services.
 *
 * Story 10.3: API Integration Tests
 */

import { jest } from '@jest/globals';
import type { MockSession, MockUser } from './test-helpers';

/**
 * Setup mock for validateSession function
 *
 * This allows tests to control the session returned by validateSession
 * without needing actual authentication.
 */
export function setupSessionMock() {
  let currentSession: MockSession | null = null;

  const mockValidateSession = jest.fn(async () => currentSession);

  return {
    mockValidateSession,
    setSession: (session: MockSession | null) => {
      currentSession = session;
    },
    clearSession: () => {
      currentSession = null;
    },
  };
}

/**
 * Setup mock for Prisma client
 *
 * Provides a basic mock that can be extended for specific tests.
 */
export function setupPrismaMock() {
  const mockData = {
    users: [] as any[],
    projects: [] as any[],
    sessions: [] as any[],
    projectMembers: [] as any[],
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    projectMember: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => {
      // Execute transaction callback directly
      return callback(mockPrisma);
    }),
  };

  return {
    mockPrisma,
    mockData,
    // Helper to reset all mocks
    resetMocks: () => {
      Object.values(mockPrisma).forEach((model: any) => {
        if (typeof model === 'object') {
          Object.values(model).forEach((method: any) => {
            if (typeof method === 'function' && typeof method.mockClear === 'function') {
              method.mockClear();
            }
          });
        }
      });
      mockData.users = [];
      mockData.projects = [];
      mockData.sessions = [];
      mockData.projectMembers = [];
    },
  };
}

/**
 * Setup complete test environment with all mocks
 *
 * This is the main entry point for setting up integration tests.
 */
export function setupTestEnvironment() {
  const { mockValidateSession, setSession, clearSession } = setupSessionMock();
  const { mockPrisma, mockData, resetMocks } = setupPrismaMock();

  return {
    // Session control
    mockValidateSession,
    setSession,
    clearSession,

    // Prisma control
    mockPrisma,
    mockData,
    resetMocks,

    // Cleanup
    cleanup: async () => {
      resetMocks();
      clearSession();
      jest.clearAllMocks();
    },
  };
}

/**
 * Create a mock response helper
 *
 * Standard API response shapes used across the application.
 */
export const mockResponses = {
  success: (data: any, status = 200) => ({
    success: true,
    data,
    statusCode: status,
  }),

  unauthorized: () => ({
    success: false,
    error: 'Unauthorized',
    statusCode: 401,
  }),

  forbidden: () => ({
    success: false,
    error: 'Forbidden',
    statusCode: 403,
  }),

  notFound: (resource = 'Resource') => ({
    success: false,
    error: `${resource} not found`,
    statusCode: 404,
  }),

  validationError: (message = 'Validation failed', details?: any) => ({
    success: false,
    error: message,
    details,
    statusCode: 400,
  }),

  serverError: (message = 'Internal server error') => ({
    success: false,
    error: message,
    statusCode: 500,
  }),
};
