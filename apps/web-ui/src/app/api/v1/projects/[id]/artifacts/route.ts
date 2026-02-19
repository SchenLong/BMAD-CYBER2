/**
 * Project Artifacts API - v1
 * Story 8.1: RESTful API Implementation
 * Task 5: Project Endpoints
 *
 * GET /api/v1/projects/:id/artifacts - List project artifacts
 * POST /api/v1/projects/:id/artifacts - Upload artifact to project
 */

import { NextRequest } from 'next/server';
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
  apiForbidden,
} from '@/lib/api/response';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/projects/:id/artifacts
 * List all artifacts for a project
 */
async function listArtifacts(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  const projectId = params.id;

  // Verify project exists and user has access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!project) {
    return apiNotFound('Project');
  }

  const artifacts = await prisma.artifact.findMany({
    where: {
      projectId,
    },
    orderBy: { uploadedAt: 'desc' },
  });

  return apiSuccess({
    artifacts: artifacts.map(artifact => ({
      id: artifact.id,
      name: artifact.name,
      fileName: artifact.name,
      fileSize: artifact.fileSize,
      mimeType: artifact.mimeType,
      type: artifact.type,
      uploadedAt: artifact.uploadedAt,
      uploadedBy: artifact.uploadedById,
      path: artifact.filePath,
    })),
    count: artifacts.length,
  });
}

/**
 * POST /api/v1/projects/:id/artifacts
 * Upload an artifact to a project
 *
 * Note: This is a placeholder. Actual file upload handling
 * will be implemented with proper multipart form processing.
 */
async function uploadArtifact(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await validateSession();

  if (!session) {
    return apiUnauthorized();
  }

  const projectId = params.id;

  // Verify project exists and user has access
  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    return apiNotFound('Project');
  }

  // Placeholder for file upload
  return apiSuccess({
    message: 'Artifact upload endpoint - requires multipart form handling',
    projectId,
    note: 'File upload implementation pending',
  }, 501); // Not Implemented
}

/**
 * Export handlers
 */
export { listArtifacts as GET, uploadArtifact as POST };
