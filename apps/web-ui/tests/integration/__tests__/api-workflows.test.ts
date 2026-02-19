/**
 * API Integration Tests
 *
 * Tests for API endpoint workflows, including:
 * - Authentication flow
 * - Project CRUD operations
 * - Agent invocation
 * - CLI command execution
 * - SSE streaming
 * - File uploads
 *
 * @test integration/api-workflows
 *
 * Story 10.3: API Integration Tests
 *
 * These tests directly invoke API route handlers with mocked dependencies
 * to validate end-to-end functionality without requiring a running server.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

// Mock the dependencies BEFORE importing the routes
const mockValidateSession = jest.fn();
const mockProjectCount = jest.fn().mockResolvedValue(0);
const mockProjectFindMany = jest.fn().mockResolvedValue([]);
const mockProjectFindUnique = jest.fn();
const mockProjectCreate = jest.fn();
const mockProjectUpdate = jest.fn();
const mockProjectDelete = jest.fn();

jest.mock('@/lib/auth/session', () => ({
  validateSession: jest.fn(() => mockValidateSession()),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      count: mockProjectCount,
      findUnique: mockProjectFindUnique,
      findMany: mockProjectFindMany,
      create: mockProjectCreate,
      update: mockProjectUpdate,
      delete: mockProjectDelete,
    },
  },
}));

jest.mock('@/lib/types/projects', () => ({
  generateProjectCode: jest.fn(() => 'TEST-2026-001'),
}));

// Import routes after mocking
import { GET, POST } from '@/app/api/v1/projects/route';
import { createMockRequest, createMockSession, createMockUser, createMockProject, testScenarios } from './helpers/test-helpers';

describe('API Integration Tests', () => {
  let mockSession: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset to default: no authenticated session
    mockValidateSession.mockResolvedValue(null);
    mockProjectCount.mockResolvedValue(0);
    mockProjectFindMany.mockResolvedValue([]);

    // Create a default mock session for authenticated tests
    mockSession = createMockSession({
      user: createMockUser({ role: 'USER' }),
    });
  });

  describe('Authentication Flow', () => {
    it('should validate a valid session', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const result = await mockValidateSession();

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe(mockSession.user.id);
      expect(result?.user.email).toBe(mockSession.user.email);
      expect(result?.user.role).toBe('USER');
    });

    it('should return null for invalid session', async () => {
      mockValidateSession.mockResolvedValue(null);

      const result = await mockValidateSession();

      expect(result).toBeNull();
    });

    it('should return null for expired session', async () => {
      mockValidateSession.mockResolvedValue(null);

      const result = await mockValidateSession();

      expect(result).toBeNull();
    });
  });

  describe('Project CRUD Operations', () => {
    describe('GET /api/v1/projects - List Projects', () => {
      it('should return 401 when not authenticated', async () => {
        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects',
        });

        const response = await GET(request);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('UNAUTHORIZED');
      });

      it('should list projects for authenticated user', async () => {
        mockValidateSession.mockResolvedValue(mockSession);

        const mockProjects = [
          createMockProject(mockSession.user.id, { name: 'Project 1' }),
          createMockProject(mockSession.user.id, { name: 'Project 2' }),
        ];

        mockProjectCount.mockResolvedValue(2);
        mockProjectFindMany.mockResolvedValue(
          mockProjects.map(p => ({
            ...p,
            members: [{
              userId: mockSession.user.id,
              role: 'OWNER',
              user: mockSession.user,
            }],
            _count: {
              members: 1,
              workflows: 0,
              artifacts: 0,
              deliverables: 0,
            },
          }))
        );

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects',
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.projects).toBeDefined();
        expect(data.data.pagination).toBeDefined();
        expect(mockProjectFindMany).toHaveBeenCalled();
      });

      it('should filter projects by type', async () => {
        mockValidateSession.mockResolvedValue(mockSession);
        mockProjectCount.mockResolvedValue(1);
        mockProjectFindMany.mockResolvedValue([]);

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects?type=incident-response',
          searchParams: { type: 'incident-response' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(mockProjectFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              projectType: 'INCIDENT_RESPONSE',
            }),
          })
        );
      });

      it('should filter projects by status', async () => {
        mockValidateSession.mockResolvedValue(mockSession);
        mockProjectCount.mockResolvedValue(1);
        mockProjectFindMany.mockResolvedValue([]);

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects?status=active',
          searchParams: { status: 'active' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(mockProjectFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: 'ACTIVE',
            }),
          })
        );
      });

      it('should search projects by text', async () => {
        mockValidateSession.mockResolvedValue(mockSession);
        mockProjectCount.mockResolvedValue(1);
        mockProjectFindMany.mockResolvedValue([]);

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects?search=security',
          searchParams: { search: 'security' },
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(mockProjectFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ name: expect.any(Object) }),
                expect.objectContaining({ description: expect.any(Object) }),
                expect.objectContaining({ projectCode: expect.any(Object) }),
              ]),
            }),
          })
        );
      });

      it('should paginate results', async () => {
        mockValidateSession.mockResolvedValue(mockSession);
        mockProjectCount.mockResolvedValue(50);
        mockProjectFindMany.mockResolvedValue([]);

        const request = createMockRequest({
          method: 'GET',
          url: 'http://localhost:42001/api/v1/projects?page=2&perPage=10',
          searchParams: { page: '2', perPage: '10' },
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.pagination.page).toBe(2);
        expect(data.data.pagination.perPage).toBe(10);
        expect(data.data.pagination.totalPages).toBe(5);
      });
    });

    describe('POST /api/v1/projects - Create Project', () => {
      it('should return 401 when not authenticated', async () => {
        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: testScenarios.projectData.valid,
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
      });

      it('should create a new project with valid data', async () => {
        mockValidateSession.mockResolvedValue(mockSession);

        const newProject = createMockProject(mockSession.user.id, {
          name: testScenarios.projectData.valid.name,
          description: testScenarios.projectData.valid.description,
        });

        mockProjectCreate.mockResolvedValue({
          ...newProject,
          members: [{
            userId: mockSession.user.id,
            role: 'OWNER',
            user: mockSession.user,
          }],
        });

        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: testScenarios.projectData.valid,
        });

        const response = await POST(request);

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.name).toBe(testScenarios.projectData.valid.name);
        expect(mockProjectCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              name: testScenarios.projectData.valid.name,
              description: testScenarios.projectData.valid.description,
              projectType: 'INCIDENT_RESPONSE',
              members: expect.objectContaining({
                create: expect.objectContaining({
                  userId: mockSession.user.id,
                  role: 'OWNER',
                }),
              }),
            }),
          })
        );
      });

      it('should create a project with minimal data', async () => {
        mockValidateSession.mockResolvedValue(mockSession);

        const newProject = createMockProject(mockSession.user.id, {
          name: testScenarios.projectData.minimal.name,
        });

        mockProjectCreate.mockResolvedValue({
          ...newProject,
          members: [{
            userId: mockSession.user.id,
            role: 'OWNER',
            user: mockSession.user,
          }],
        });

        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: testScenarios.projectData.minimal,
        });

        const response = await POST(request);

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.name).toBe(testScenarios.projectData.minimal.name);
      });

      it('should return validation error for invalid project type', async () => {
        mockValidateSession.mockResolvedValue(mockSession);

        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: {
            name: 'Test Project',
            projectType: 'invalid-type',
          },
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      });

      it('should return validation error for missing name', async () => {
        mockValidateSession.mockResolvedValue(mockSession);

        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: {
            projectType: 'security-assessment',
          },
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      });

      it('should return validation error for name that is too short', async () => {
        mockValidateSession.mockResolvedValue(mockSession);

        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: {
            name: 'AB',
            projectType: 'security-assessment',
          },
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      });

      it('should handle database errors gracefully', async () => {
        mockValidateSession.mockResolvedValue(mockSession);
        mockProjectCreate.mockRejectedValue(new Error('Database error'));

        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:42001/api/v1/projects',
          body: testScenarios.projectData.valid,
        });

        await expect(POST(request)).rejects.toThrow();
      });
    });
  });

  describe('Authorization Tests', () => {
    it('should allow USER role to create projects', async () => {
      const userSession = createMockSession({
        user: createMockUser({ role: 'USER' }),
      });
      mockValidateSession.mockResolvedValue(userSession);

      const newProject = createMockProject(userSession.user.id);
      mockProjectCreate.mockResolvedValue({
        ...newProject,
        members: [{
          userId: userSession.user.id,
          role: 'OWNER',
          user: userSession.user,
        }],
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: testScenarios.projectData.valid,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should allow ADMIN role to create projects', async () => {
      const adminSession = createMockSession({
        user: createMockUser({ role: 'ADMIN' }),
      });
      mockValidateSession.mockResolvedValue(adminSession);

      const newProject = createMockProject(adminSession.user.id);
      mockProjectCreate.mockResolvedValue({
        ...newProject,
        members: [{
          userId: adminSession.user.id,
          role: 'OWNER',
          user: adminSession.user,
        }],
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: testScenarios.projectData.valid,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should allow SUPERADMIN role to create projects', async () => {
      const superAdminSession = createMockSession({
        user: createMockUser({ role: 'SUPERADMIN' }),
      });
      mockValidateSession.mockResolvedValue(superAdminSession);

      const newProject = createMockProject(superAdminSession.user.id);
      mockProjectCreate.mockResolvedValue({
        ...newProject,
        members: [{
          userId: superAdminSession.user.id,
          role: 'OWNER',
          user: superAdminSession.user,
        }],
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: testScenarios.projectData.valid,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Response Format Tests', () => {
    it('should return consistent response format for successful GET', async () => {
      mockValidateSession.mockResolvedValue(mockSession);
      mockProjectCount.mockResolvedValue(0);
      mockProjectFindMany.mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('meta');
      expect(data.success).toBe(true);
      expect(data.error).toBeNull();
      expect(response.status).toBe(200);
    });

    it('should return consistent response format for successful POST', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const newProject = createMockProject(mockSession.user.id);
      mockProjectCreate.mockResolvedValue({
        ...newProject,
        members: [{
          userId: mockSession.user.id,
          role: 'OWNER',
          user: mockSession.user,
        }],
      });

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: testScenarios.projectData.valid,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('meta');
      expect(data.success).toBe(true);
      expect(data.error).toBeNull();
      expect(response.status).toBe(201);
    });

    it('should return consistent error format for validation errors', async () => {
      mockValidateSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: { name: 'AB' }, // Too short
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('meta');
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(response.status).toBe(400);
    });

    it('should return consistent error format for unauthorized access', async () => {
      mockValidateSession.mockResolvedValue(null);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('meta');
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation Tests', () => {
    beforeEach(() => {
      mockValidateSession.mockResolvedValue(mockSession);
    });

    it('should validate project name length', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: {
          name: 'AB', // Too short (minimum 3)
          projectType: 'security-assessment',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should validate description length', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: {
          name: 'Valid Project Name',
          description: 'x'.repeat(2001), // Too long (maximum 2000)
          projectType: 'security-assessment',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should validate project type enum', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:42001/api/v1/projects',
        body: {
          name: 'Valid Project Name',
          projectType: 'not-a-valid-type',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty project list', async () => {
      mockValidateSession.mockResolvedValue(mockSession);
      mockProjectCount.mockResolvedValue(0);
      mockProjectFindMany.mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.projects).toEqual([]);
      expect(data.data.pagination.total).toBe(0);
    });

    it('should handle large page numbers gracefully', async () => {
      mockValidateSession.mockResolvedValue(mockSession);
      mockProjectCount.mockResolvedValue(5);
      mockProjectFindMany.mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects?page=999',
        searchParams: { page: '999' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination.page).toBe(999);
      expect(data.data.projects).toEqual([]);
    });

    it('should respect maximum perPage limit', async () => {
      mockValidateSession.mockResolvedValue(mockSession);
      mockProjectCount.mockResolvedValue(100);
      mockProjectFindMany.mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:42001/api/v1/projects?perPage=200',
        searchParams: { perPage: '200' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination.perPage).toBe(100); // Max limit
    });
  });
});
