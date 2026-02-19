/**
 * API Documentation - Agents Endpoints
 * Story 8.4: API Documentation
 * Task 2: Endpoint Documentation - Agents
 */

import { EndpointCard } from '@/components/docs';

export default function AgentsEndpointsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Agents API</h1>
        <p className="text-lg text-muted-foreground">
          Endpoints for managing and invoking BMAD agents
        </p>
      </div>

      {/* List Agents */}
      <EndpointCard
        method="GET"
        path="/v1/agents"
        description="Retrieve a list of all available BMAD agents with optional filtering by team or search query"
        authenticated={true}
        parameters={[
          {
            name: 'team',
            in: 'query',
            type: 'string',
            required: false,
            description: 'Filter agents by team',
            enum: ['intel', 'security', 'strategic', 'legal', 'bmm', 'bmgd', 'cis', 'bmb'],
          },
          {
            name: 'search',
            in: 'query',
            type: 'string',
            required: false,
            description: 'Search query to filter agents by name, title, or expertise',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'List of agents retrieved successfully',
            example: {
              success: true,
              data: {
                agents: [
                  {
                    id: 'scanner',
                    name: 'scanner',
                    displayName: 'Network Scanner',
                    title: 'Vulnerability Assessment Specialist',
                    team: 'security',
                    expertise: ['Network Scanning', 'Vulnerability Assessment', 'Penetration Testing'],
                    description: 'Specializes in network reconnaissance and vulnerability identification...',
                    status: 'available',
                  },
                ],
                count: 56,
              },
              error: null,
              meta: {
                requestId: 'req_1234567890_abc123',
                timestamp: '2024-01-01T00:00:00.000Z',
                version: '1.0.0',
              },
            },
          },
          {
            status: 401,
            description: 'Authentication required',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/agents?team=security" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/agents?team=security',
  {
    headers: {
      'Authorization': 'Bearer ' + apiKey
    }
  }
);
const data = await response.json();
console.log(data.data.agents);`,
          },
          {
            language: 'python',
            label: 'Python',
            code: `import requests

headers = {'Authorization': f'Bearer {api_key}'}
params = {'team': 'security'}

response = requests.get(
    'https://api.bmad.security/v1/agents',
    headers=headers,
    params=params
)
data = response.json()
print(data['data']['agents'])`,
          },
        ]}
      />

      {/* Get Agent Details */}
      <EndpointCard
        method="GET"
        path="/v1/agents/{id}"
        description="Get detailed information about a specific agent including capabilities, configuration, and usage"
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Agent ID (e.g., "scanner", "analyst", "threat-hunter")',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Agent details retrieved successfully',
            example: {
              success: true,
              data: {
                agent: {
                  id: 'scanner',
                  name: 'scanner',
                  displayName: 'Network Scanner',
                  title: 'Vulnerability Assessment Specialist',
                  team: 'security',
                  expertise: ['Network Scanning', 'Vulnerability Assessment', 'Penetration Testing'],
                  description: 'Specializes in network reconnaissance and vulnerability identification...',
                  status: 'available',
                  capabilities: {
                    maxConcurrentTasks: 5,
                    supportedInputFormats: ['text', 'json', 'xml'],
                    outputFormats: ['json', 'markdown', 'html'],
                  },
                },
              },
              error: null,
              meta: {
                requestId: 'req_1234567890_abc123',
                timestamp: '2024-01-01T00:00:00.000Z',
                version: '1.0.0',
              },
            },
          },
          {
            status: 404,
            description: 'Agent not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/agents/scanner" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/agents/scanner',
  {
    headers: {
      'Authorization': 'Bearer ' + apiKey
    }
  }
);
const agent = await response.json();
console.log(agent.data.agent);`,
          },
        ]}
      />

      {/* Invoke Agent */}
      <EndpointCard
        method="POST"
        path="/v1/agents/{id}/invoke"
        description="Execute an agent with provided input. Returns the agent ID and invocation status."
        authenticated={true}
        parameters={[
          {
            name: 'id',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Agent ID to invoke',
          },
        ]}
        requestBody={{
          contentType: 'application/json',
          schema: {
            input: { type: 'string', description: 'The input prompt or task for the agent', required: true },
            context: { type: 'object', description: 'Additional context data (optional)' },
            stream: { type: 'boolean', description: 'Enable streaming response (default: false)' },
            sessionId: { type: 'string', description: 'Resume existing session (optional)' },
          },
          required: true,
          description: 'Agent invocation parameters',
        }}
        responses={[
          {
            status: 202,
            description: 'Agent invocation accepted and queued for processing',
            example: {
              success: true,
              data: {
                invocationId: 'inv_1704110400000_abc123',
                agentId: 'scanner',
                status: 'pending',
                message: 'Agent invocation queued for processing',
              },
              error: null,
              meta: {
                requestId: 'req_1234567890_abc123',
                timestamp: '2024-01-01T00:00:00.000Z',
                version: '1.0.0',
              },
            },
          },
          {
            status: 400,
            description: 'Invalid input format',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X POST "https://api.bmad.security/v1/agents/scanner/invoke" \\
  -H "Authorization: Bearer bmad_sk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Scan 192.168.1.0/24 for open ports",
    "stream": true
  }'`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/agents/scanner/invoke',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: 'Scan 192.168.1.0/24 for open ports',
      stream: true
    })
  }
);
const result = await response.json();
console.log(result.data.invocationId);`,
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
    'input': 'Scan 192.168.1.0/24 for open ports',
    'stream': True
}

response = requests.post(
    'https://api.bmad.security/v1/agents/scanner/invoke',
    headers=headers,
    json=payload
)
result = response.json()
print(result['data']['invocationId'])`,
          },
        ]}
      />
    </div>
  );
}
