/**
 * API Documentation - Overview
 * Story 8.4: API Documentation
 * Task 1 & 8: Overview and Getting Started Guide
 */

import { CodeBlock, InlineCode } from '@/components/docs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Key, Zap, Globe, Code, CheckCircle } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">BMAD API Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the BMAD Cybersecurity Platform API. Build powerful integrations with our comprehensive REST API.
        </p>
      </div>

      {/* Quick Start */}
      <section id="quick-start">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Start
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Get Started in 3 Steps</CardTitle>
            <CardDescription>Make your first API call in under 5 minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold">Get Your API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate to Settings → API Keys and generate a new API key. Copy it securely—you won&apos;t see it again.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold">Make a Test Request</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use your API key to authenticate a request to the health endpoint:
                </p>
                <CodeBlock
                  code={`curl -X GET "https://api.bmad.security/v1/health" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`}
                  language="curl"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold">Explore the API</h4>
                <p className="text-sm text-muted-foreground">
                  Check out the endpoints below to start integrating agents, workflows, and projects into your application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Base URL */}
      <section id="base-url">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Base URL
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">All API endpoints are prefixed with:</p>
            <code className="block px-4 py-3 bg-muted rounded-lg text-sm">
              https://api.bmad.security/v1
            </code>
            <p className="text-sm text-muted-foreground mt-3">
              For local development, use: <InlineCode>http://localhost:42001/api/v1</InlineCode>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Authentication */}
      <section id="authentication">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Authentication
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>API Key Authentication</CardTitle>
            <CardDescription>Secure your requests with Bearer token authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Include your API key in the <InlineCode>Authorization</InlineCode> header using the Bearer scheme:
            </p>
            <CodeBlock
              code={`Authorization: Bearer bmad_sk_your_api_key_here`}
              language="bash"
            />
            <p className="text-sm text-muted-foreground">
              Alternatively, use the <InlineCode>X-API-Key</InlineCode> header:
            </p>
            <CodeBlock
              code={`X-API-Key: bmad_sk_your_api_key_here`}
              language="bash"
            />
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                <strong>Security Note:</strong> Never share your API key publicly or commit it to version control.
                Use environment variables to store keys in your applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Response Format */}
      <section id="response-format">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Response Format
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Standard API Response Structure</CardTitle>
            <CardDescription>All responses follow a consistent format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock
              code={`{
  "success": true,
  "data": {
    // Your response data here
  },
  "error": null,
  "meta": {
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}`}
              language="json"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Success Response</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <InlineCode>success</InlineCode>: Always true for successful requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <InlineCode>data</InlineCode>: Contains the response payload
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <InlineCode>meta</InlineCode>: Request metadata (ID, timestamp, version)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Error Response</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <InlineCode>success</InlineCode>: Always false
                  </li>
                  <li className="flex items-center gap-2">
                    <InlineCode>error.code</InlineCode>: Machine-readable error code
                  </li>
                  <li className="flex items-center gap-2">
                    <InlineCode>error.message</InlineCode>: Human-readable description
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rate Limits */}
      <section id="rate-limits">
        <h2 className="text-2xl font-semibold mb-4">Rate Limiting</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              API requests are rate limited based on your authentication method:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Role / Method</th>
                    <th className="text-left py-2 px-3 font-medium">Per Minute</th>
                    <th className="text-left py-2 px-3 font-medium">Per Hour</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted/50">
                    <td className="py-2 px-3">
                      <Badge variant="outline">API Key (Developer)</Badge>
                    </td>
                    <td className="py-2 px-3">60</td>
                    <td className="py-2 px-3">1,000</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2 px-3">
                      <Badge variant="outline">API Key (Enterprise)</Badge>
                    </td>
                    <td className="py-2 px-3">200</td>
                    <td className="py-2 px-3">5,000</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2 px-3">
                      <Badge variant="outline">Session Token</Badge>
                    </td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3">2,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Rate limit headers are included in every response:
            </p>
            <CodeBlock
              code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704110400`}
              language="bash"
            />
          </CardContent>
        </Card>
      </section>

      {/* SDKs and Libraries */}
      <section id="sdks">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          SDKs & Libraries
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              While we don&apos;t currently provide official SDKs, integrating with BMAD is straightforward using standard HTTP libraries:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">JavaScript</h4>
                <CodeBlock
                  code={`const response = await fetch(
  'https://api.bmad.security/v1/agents',
  {
    headers: {
      'Authorization': 'Bearer ' + apiKey
    }
  }
);
const data = await response.json();`}
                  language="javascript"
                />
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Python</h4>
                <CodeBlock
                  code={`import requests

headers = {
    'Authorization': f'Bearer {api_key}'
}

response = requests.get(
    'https://api.bmad.security/v1/agents',
    headers=headers
)
data = response.json()`}
                  language="python"
                />
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">cURL</h4>
                <CodeBlock
                  code={`curl -X GET \\
  "https://api.bmad.security/v1/agents" \\
  -H "Authorization: Bearer $API_KEY"`}
                  language="curl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <section id="next-steps">
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Explore all available endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/dashboard/docs/api/endpoints" className="text-sm text-primary hover:underline">
                View endpoints →
              </a>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Authentication Guide</CardTitle>
              <CardDescription>Deep dive into authentication methods</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/dashboard/docs/api/authentication" className="text-sm text-primary hover:underline">
                Learn more →
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
