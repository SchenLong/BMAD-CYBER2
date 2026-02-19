/**
 * Test Helpers for API Integration Tests
 *
 * Provides utilities for testing API routes directly without
 * needing a running server. This allows us to test the actual
 * route handlers with mocked dependencies.
 *
 * Story 10.3: API Integration Tests
 */

import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

/**
 * Mock user data for testing
 */
export interface MockUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  onboardingCompleted: Date | null;
}

/**
 * Mock session data for testing
 */
export interface MockSession {
  user: MockUser;
  session: {
    id: string;
    expires: Date;
  };
  organizationId?: string | null;
}

/**
 * Create a mock user with the specified role
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    id: `user-${timestamp}-${random}`,
    email: `test-${timestamp}@example.com`,
    name: 'Test User',
    role: 'USER',
    onboardingCompleted: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock session for testing
 */
export function createMockSession(overrides: Partial<MockSession> = {}): MockSession {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const user = createMockUser(overrides.user);
  return {
    user,
    session: {
      id: `session-${timestamp}-${random}`,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    },
    organizationId: null,
    ...overrides,
  };
}

/**
 * Create a mock NextRequest with the specified method, body, and headers
 */
export function createMockRequest(options: {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:42001/api/test',
    body,
    headers = {},
    cookies = {},
    searchParams = {},
  } = options;

  // Build URL with search params
  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Create a mock request
  const mockRequest = {
    method,
    url: urlObj.toString(),
    headers: new Headers(headers),
    json: async () => body,
    text: async () => JSON.stringify(body),
    formData: async () => {
      const formData = new FormData();
      if (body) {
        Object.entries(body).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach(v => formData.append(key, v as string));
          } else {
            formData.append(key, String(value));
          }
        });
      }
      return formData;
    },
    cookies: {
      get: (name: string) => ({
        name,
        value: cookies[name] || '',
      }),
      set: jest.fn(),
    },
  } as unknown as NextRequest;

  return mockRequest;
}

/**
 * Create a test session token (for use in Authorization headers)
 */
export function createTestToken(userId: string): string {
  return `test-token-${userId}-${Date.now()}`;
}

/**
 * Mock project data for testing
 */
export interface MockProject {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  projectType: string;
  status: string;
  phase: string;
  completionPercent: number;
  startDate?: Date;
  targetEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Create a mock project for testing
 */
export function createMockProject(userId: string, overrides: Partial<MockProject> = {}): MockProject {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    id: `project-${timestamp}-${random}`,
    projectCode: `TEST-${new Date().getFullYear()}-001`,
    name: 'Test Project',
    projectType: 'security_assessment',
    status: 'planning',
    phase: 'initiation',
    completionPercent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
    ...overrides,
  };
}

/**
 * Extract response data from an API response
 */
export async function getResponseData(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/**
 * Common test scenarios
 */
export const testScenarios = {
  projectData: {
    valid: {
      name: 'Integration Test Project',
      description: 'A project for integration testing',
      // Use kebab-case as the API's Zod schema converts it to snake_case
      projectType: 'incident-response',
    },
    minimal: {
      name: 'Minimal Project',
      // Use kebab-case as the API's Zod schema converts it to snake_case
      projectType: 'security-assessment',
    },
    invalid: {
      name: 'X', // Too short
      projectType: 'invalid-type',
    },
  },

  agentInvocation: {
    valid: {
      agentId: 'threat-analyst',
      projectId: 'test-project-id',
      message: 'Analyze this security incident',
      context: {
        incidentType: 'ransomware',
      },
    },
    invalid: {
      agentId: '',
      projectId: '',
      message: '',
    },
  },

  cliCommand: {
    whitelisted: {
      command: 'mission.list',
      projectId: 'test-project-id',
      parameters: {},
    },
    notWhitelisted: {
      command: 'malicious.command',
      projectId: 'test-project-id',
      parameters: {},
    },
  },
};
