/**
 * API Documentation - Templates Endpoints
 * Story 8.4: API Documentation
 * Task 2: Endpoint Documentation - Templates
 */

import { EndpointCard } from '@/components/docs';

export default function TemplatesEndpointsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Templates API</h1>
        <p className="text-lg text-muted-foreground">
          Endpoints for accessing report templates
        </p>
      </div>

      {/* List Templates */}
      <EndpointCard
        method="GET"
        path="/v1/templates"
        description="Get a list of all available report templates"
        authenticated={true}
        responses={[
          {
            status: 200,
            description: 'Templates retrieved successfully',
            example: {
              success: true,
              data: {
                templates: [
                  {
                    id: 'executive-brief',
                    name: 'Executive Brief',
                    category: 'executive',
                    description: 'High-level executive summary template',
                  },
                  {
                    id: 'technical-report',
                    name: 'Technical Report',
                    category: 'technical',
                    description: 'Detailed technical findings report',
                  },
                ],
              },
            },
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/templates" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
          {
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch(
  'https://api.bmad.security/v1/templates',
  {
    headers: { 'Authorization': 'Bearer ' + apiKey }
  }
);
const data = await response.json();
console.log(data.data.templates);`,
          },
        ]}
      />

      {/* Get Template Details */}
      <EndpointCard
        method="GET"
        path="/v1/templates/{templateId}"
        description="Get detailed information about a specific template"
        authenticated={true}
        parameters={[
          {
            name: 'templateId',
            in: 'path',
            type: 'string',
            required: true,
            description: 'Template ID',
          },
        ]}
        responses={[
          {
            status: 200,
            description: 'Template details retrieved successfully',
            example: {
              success: true,
              data: {
                template: {
                  id: 'executive-brief',
                  name: 'Executive Brief',
                  category: 'executive',
                  description: 'High-level executive summary template',
                  sections: ['summary', 'key-findings', 'recommendations'],
                  variables: [
                    { name: 'title', type: 'string', required: true },
                    { name: 'date', type: 'date', required: true },
                  ],
                },
              },
            },
          },
          {
            status: 404,
            description: 'Template not found',
          },
        ]}
        examples={[
          {
            language: 'curl',
            label: 'cURL',
            code: `curl -X GET "https://api.bmad.security/v1/templates/executive-brief" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`,
          },
        ]}
      />
    </div>
  );
}
