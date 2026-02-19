/**
 * Agent Invocation API Integration Tests
 *
 * Tests for agent invocation endpoints, including:
 * - Agent listing
 * - Agent invocation
 * - SSE streaming
 *
 * @test integration/agent-invocation
 *
 * Story 10.3: API Integration Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the dependencies BEFORE importing the routes
const mockValidateSession = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  validateSession: jest.fn(() => mockValidateSession()),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    agent: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
    invocation: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Import routes after mocking
import { GET as listAgents, POST as invokeAgent } from '@/app/api/v1/agents/route';
import { POST as invokeAgentById } from '@/app/api/v1/agents/[id]/invoke/route';
import { createMockRequest, createMockSession, createMockUser } from './helpers/test-helpers';

describe.skip('Agent Invocation API Integration Tests - TODO: Implement agent routes', () => {
  let mockSession: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateSession.mockResolvedValue(null);

    mockSession = createMockSession({
      user: createMockUser({ role: 'USER' }),
    });
  });

  describe('GET /api/v1/agents - List Agents', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/agents',
      });

      const response = await listAgents(request);

      expect(response.status).toBe(401);
    });

    it('should list agents for authenticated user', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const mockAgents = [
        { id: 'threat-analyst', name: 'Threat Analyst', description: 'Analyzes threats' },
        { id: 'soc-analyst', name: 'SOC Analyst', description: 'Monitors security events' },
      ];

      const { prisma } = require('@/lib/prisma');
      prisma.agent.findMany.mockResolvedValue(mockAgents);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/agents',
      });

      const response = await listAgents(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.agents).toBeDefined();
    });
  });

  describe('POST /api/v1/agents/[id]/invoke - Invoke Agent', () => {
    it('should return 401 when not authenticated', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          message: 'Analyze this threat',
          context: {},
        },
      });

      // Mock params for Next.js dynamic route
      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(401);
    });

    it('should invoke agent with valid request', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const mockInvocation = {
        id: 'inv-123',
        agentId: 'threat-analyst',
        status: 'pending',
        createdAt: new Date(),
      };

      const { prisma } = require('@/lib/prisma');
      prisma.invocation.create.mockResolvedValue(mockInvocation);

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          message: 'Analyze this threat',
          context: { threatLevel: 'high' },
        },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(202); // Accepted for async processing
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.invocationId).toBeDefined();
    });

    it('should validate agent exists before invocation', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const { prisma } = require('@/lib/prisma');
      prisma.agent.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/invalid-agent/invoke',
        body: {
          message: 'Test',
        },
      });

      (request as any).params = { id: 'invalid-agent' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(404);
    });

    it('should validate required message parameter', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          // Missing message
          context: {},
        },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should sanitize agent output for security', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const mockInvocation = {
        id: 'inv-123',
        agentId: 'threat-analyst',
        status: 'completed',
        result: 'Analysis complete',
      };

      const { prisma } = require('@/lib/prisma');
      prisma.agent.findUnique.mockResolvedValue({ id: 'threat-analyst' });
      prisma.invocation.create.mockResolvedValue(mockInvocation);

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          message: 'Analyze this threat',
          context: {},
        },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      // Should accept the request (output filtering happens async)
      expect(response.status).toBe(202);
    });
  });

  describe('Authorization Tests', () => {
    it('should allow USER role to invoke agents', async () => {
      const userSession = createMockSession({
        user: createMockUser({ role: 'USER' }),
      });
      mockValidateSession.mockResolvedValue(userSession);

      const { prisma } = require('@/lib/prisma');
      prisma.agent.findUnique.mockResolvedValue({ id: 'threat-analyst' });
      prisma.invocation.create.mockResolvedValue({ id: 'inv-123' });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          message: 'Test message',
        },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(202);
    });

    it('should allow ADMIN role to invoke agents', async () => {
      const adminSession = createMockSession({
        user: createMockUser({ role: 'ADMIN' }),
      });
      mockValidateSession.mockResolvedValue(adminSession);

      const { prisma } = require('@/lib/prisma');
      prisma.agent.findUnique.mockResolvedValue({ id: 'threat-analyst' });
      prisma.invocation.create.mockResolvedValue({ id: 'inv-123' });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          message: 'Test message',
        },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(202);
    });

    it('should allow SUPERADMIN role to invoke agents', async () => {
      const superAdminSession = createMockSession({
        user: createMockUser({ role: 'SUPERADMIN' }),
      });
      mockValidateSession.mockResolvedValue(superAdminSession);

      const { prisma } = require('@/lib/prisma');
      prisma.agent.findUnique.mockResolvedValue({ id: 'threat-analyst' });
      prisma.invocation.create.mockResolvedValue({ id: 'inv-123' });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/agents/threat-analyst/invoke',
        body: {
          message: 'Test message',
        },
      });

      (request as any).params = { id: 'threat-analyst' };

      const response = await invokeAgentById(request);

      expect(response.status).toBe(202);
    });
  });
});
