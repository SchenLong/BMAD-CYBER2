/**
 * API Documentation - Workflows Endpoints
 * Story 8.4: API Documentation
 * Task 2: Endpoint Documentation - Workflows
 */

import { EndpointCard } from '@/components/docs';

export default function WorkflowsEndpointsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Workflows API</h1>
        <p className="text-lg text-muted-foreground">
          Endpoints for managing and executing BMAD workflows
        </p>
      </div>

      {/* List Workflows */}
      <EndpointCard
        method="GET"
        path="/v1/workflows"
        description="Retrieve a list of all available workflows with optional filtering"
        authenticated={true}
        parameters={[
          {
            name: 'category',
            in: 'query',
            type: 'string',
            required: false,
            description: 'Filter workflows by category',
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            required: false,
            description: 'Search query for workflows',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'List of workflows retrieved successfully',
            example: {
              success: true,
              data: {
                workflows: [
                  {
                    id: 'incident-response',
                    name: 'Incident Response',
                    category: 'cybersec',
                    description: 'Guided incident response workflow',
                    complexity: 'advanced',
                    estimatedDuration: '30-60 minutes',
                  },
                ],
                count: 45,
              },
            },
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/workflows" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/workflows',
  {
    headers: { 'Authorization': 'Bearer ' + apiKey }
  }
);
const data = await response.json();`,
          },
        ]}
      />

      {/* Get Workflow Details */}
      <EndpointCard
        method="GET"
        path="/v1/workflows/{id}"
        description="Get detailed information about a specific workflow"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Workflow ID',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Workflow details retrieved successfully',
          },
          {
            status: 404,
            description: 'Workflow not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/workflows/incident-response" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
        ]}
      />

      {/* Execute Workflow */}
      <EndpointCard
        method="POST"
        path="/v1/workflows/{id}/execute"
        description="Execute a workflow with provided parameters"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Workflow ID to execute',
          },
        ]}
        requestBody={{
          contentType: 'application/json',
          schema: {
            parameters: { type: 'object', description: 'Workflow parameters' },
            context: { type: 'object', description: 'Additional context data' },
          },
          required: true,
          description: 'Workflow execution parameters',
        }}
        responses={[
          {
            status: 202,
            description: 'Workflow execution started',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X POST "https://api.bmad.security/v1/workflows/incident-response/execute" \\
  -H "Authorization: Bearer bmad_sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "parameters": {
      "incidentType": "malware",
      "severity": "high"
    }
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
    'parameters': {
        'incidentType': 'malware',
        'severity': 'high'
    }
}

response = requests.post(
    'https://api.bmad.security/v1/workflows/incident-response/execute',
    headers=headers,
    json=payload
)
result = response.json()`,
          },
        ]}
      />
    </div>
  );
}
