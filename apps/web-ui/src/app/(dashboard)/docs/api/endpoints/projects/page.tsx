/**
 * API Documentation - Projects Endpoints
 * Story 8.4: API Documentation
 * Task 2: Endpoint Documentation - Projects
 */

import { EndpointCard } from '@/components/docs';

export default function ProjectsEndpointsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Projects API</h1>
        <p className="text-lg text-muted-foreground">
          CRUD operations for managing projects
        </p>
      </div>

      {/* List Projects */}
      <EndpointCard
        method="GET"
        path="/v1/projects"
        description="Get a paginated list of user projects with optional filtering"
        authenticated={true}
        parameters={[
          {
            name: 'page',
            in: 'query',
            type: 'integer',
            required: false,
            default: 1,
            description: 'Page number for pagination',
          },
          {
            name: 'perPage',
            in: 'query',
            type: 'integer',
            required: false,
            default: 20,
            description: 'Items per page (max 100)',
          },
          {
            name: 'status',
            in: 'query',
            type: 'string',
            required: false,
            description: 'Filter by project status (active, completed, archived)',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Projects retrieved successfully',
            example: {
              success: true,
              data: {
                projects: [
                  {
                    id: 'proj_123',
                    name: 'Security Assessment',
                    description: 'Network security assessment',
                    type: 'penetration-test',
                    status: 'active',
                    createdAt: '2024-01-01T00:00:00.000Z',
                  },
                ],
              },
              meta: {
                pagination: {
                  page: 1,
                  perPage: 20,
                  totalCount: 45,
                  totalPages: 3,
                  hasNextPage: true,
                  hasPreviousPage: false,
                },
              },
            },
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/projects?page=1&perPage=20" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/projects?page=1&perPage=20',
  {
    headers: { 'Authorization': 'Bearer ' + apiKey }
  }
);
const data = await response.json();
console.log(data.data.projects);`,
          },
        ]}
      />

      {/* Create Project */}
      <EndpointCard
        method="POST"
        path="/v1/projects"
        description="Create a new project with the provided details"
        authenticated={true}
        requestBody={{
          contentType: 'application/json',
          schema: {
            name: { type: 'string', description: 'Project name', required: true },
            description: { type: 'string', description: 'Project description' },
            type: { type: 'string', description: 'Project type (e.g., penetration-test, assessment)' },
          },
          required: true,
          description: 'Project creation data',
        }}
        responses={[
          {
            status: 201,
            description: 'Project created successfully',
            example: {
              success: true,
              data: {
                project: {
                  id: 'proj_456',
                  name: 'New Security Assessment',
                  description: 'Network security assessment',
                  type: 'assessment',
                  status: 'active',
                  createdAt: '2024-01-01T00:00:00.000Z',
                },
              },
            },
          },
          {
            status: 400,
            description: 'Validation error - invalid input',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X POST "https://api.bmad.security/v1/projects" \\
  -H "Authorization: Bearer bmad_sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Security Assessment",
    "description": "Network security assessment",
    "type": "penetration-test"
  }'`,
          },
          {
            language: 'python',
            label: 'Python',
            code: `import requests

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

payload = {
    'name': 'Security Assessment',
    'description': 'Network security assessment',
    'type': 'penetration-test'
}

response = requests.post(
    'https://api.bmad.security/v1/projects',
    headers=headers,
    json=payload
)
project = response.json()
print(project['data']['project'])`,
          },
        ]}
      />

      {/* Get Project Details */}
      <EndpointCard
        method="GET"
        path="/v1/projects/{id}"
        description="Get detailed information about a specific project"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Project ID',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Project details retrieved successfully',
          },
          {
            status: 404,
            description: 'Project not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/projects/proj_123" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
        ]}
      />

      {/* Update Project */}
      <EndpointCard
        method="PUT"
        path="/v1/projects/{id}"
        description="Update an existing project"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Project ID',
          },
        ]}
        requestBody={{
          contentType: 'application/json',
          schema: {
            name: { type: 'string', description: 'Updated project name' },
            description: { type: 'string', description: 'Updated project description' },
            status: { type: 'string', description: 'Updated project status' },
          },
          required: true,
          description: 'Project update data',
        }}
        responses={[
          {
            status: 200,
            description: 'Project updated successfully',
          },
          {
            status: 404,
            description: 'Project not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X PUT "https://api.bmad.security/v1/projects/proj_123" \\
  -H "Authorization: Bearer bmad_sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Project Name",
    "status": "completed"
  }'`,
          },
        ]}
      />

      {/* Delete Project */}
      <EndpointCard
        method="DELETE"
        path="/v1/projects/{id}"
        description="Delete a project and all associated data"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Project ID',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Project deleted successfully',
          },
          {
            status: 404,
            description: 'Project not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X DELETE "https://api.bmad.security/v1/projects/proj_123" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
        ]}
      />

      {/* List Project Artifacts */}
      <EndpointCard
        method="GET"
        path="/v1/projects/{id}/artifacts"
        description="Get artifacts associated with a project"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Project ID',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Project artifacts retrieved successfully',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/projects/proj_123/artifacts" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
        ]}
      />
    </div>
  );
}
