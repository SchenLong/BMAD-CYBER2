/**
 * API Documentation - Error Codes
 * Story 8.4: API Documentation
 * Task 5: Error Documentation
 */

import { CodeBlock, InlineCode } from '@/components/docs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ServerIcon, ShieldAlert, Fingerprint } from 'lucide-react';

export default function ErrorsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Codes</h1>
        <p className="text-lg text-muted-foreground">
          Understanding API error responses and troubleshooting
        </p>
      </div>

      {/* Error Response Format */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Error Response Structure</CardTitle>
            <CardDescription>All errors follow a consistent format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When an error occurs, the API returns a JSON response with error details:
            </p>
            <CodeBlock
              code={`{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input format",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "meta": {
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}`}
              language="json"
            />
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Error Fields</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><InlineCode>code</InlineCode>: Machine-readable identifier</li>
                  <li><InlineCode>message</InlineCode>: Human-readable description</li>
                  <li><InlineCode>details</InlineCode>: Additional context (optional)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Meta Fields</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><InlineCode>requestId</InlineCode>: Unique request identifier</li>
                  <li><InlineCode>timestamp</InlineCode>: When the error occurred</li>
                  <li><InlineCode>version</InlineCode>: API version</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Debugging Tip</h4>
                <p className="text-muted-foreground">
                  Include the requestId when contacting support for faster resolution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* HTTP Status Codes */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>HTTP Status Codes</CardTitle>
            <CardDescription>Standard HTTP status codes indicate request outcome</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 2xx Success */}
            <StatusCodeRange
              code="2xx"
              title="Success"
              description="The request was successful"
              color="green"
              codes={[
                { code: '200', desc: 'OK - Request succeeded' },
                { code: '201', desc: 'Created - Resource created successfully' },
                { code: '202', desc: 'Accepted - Request accepted for processing' },
                { code: '204', desc: 'No Content - Request succeeded with no return data' },
              ]}
            />

            {/* 4xx Client Errors */}
            <StatusCodeRange
              code="4xx"
              title="Client Error"
              description="The request was invalid or cannot be served"
              color="yellow"
              codes={[
                { code: '400', desc: 'Bad Request - Invalid request format' },
                { code: '401', desc: 'Unauthorized - Authentication required' },
                { code: '403', desc: 'Forbidden - Insufficient permissions' },
                { code: '404', desc: 'Not Found - Resource does not exist' },
                { code: '409', desc: 'Conflict - Resource conflict' },
                { code: '422', desc: 'Unprocessable Entity - Validation failed' },
                { code: '429', desc: 'Too Many Requests - Rate limit exceeded' },
              ]}
            />

            {/* 5xx Server Errors */}
            <StatusCodeRange
              code="5xx"
              title="Server Error"
              description="Something went wrong on the server"
              color="red"
              codes={[
                { code: '500', desc: 'Internal Server Error' },
                { code: '502', desc: 'Bad Gateway' },
                { code: '503', desc: 'Service Unavailable' },
                { code: '504', desc: 'Gateway Timeout' },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      {/* Error Codes Reference */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Error Code Reference</CardTitle>
            <CardDescription>Detailed list of all error codes</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Validation Errors */}
            <ErrorSection
              icon={<Fingerprint className="w-5 h-5" />}
              title="Validation Errors (400-422)"
              errors={[
                { code: 'VALIDATION_ERROR', message: 'Request validation failed' },
                { code: 'INVALID_INPUT', message: 'Invalid input provided' },
                { code: 'MISSING_REQUIRED_FIELD', message: 'Required field is missing' },
                { code: 'INVALID_FORMAT', message: 'Input format is invalid' },
              ]}
            />

            {/* Authentication Errors */}
            <ErrorSection
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Authentication Errors (401)"
              errors={[
                { code: 'UNAUTHORIZED', message: 'Authentication required' },
                { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' },
                { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' },
                { code: 'TOKEN_INVALID', message: 'Authentication token is invalid' },
                { code: 'SESSION_EXPIRED', message: 'User session has expired' },
              ]}
            />

            {/* Authorization Errors */}
            <ErrorSection
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Authorization Errors (403)"
              errors={[
                { code: 'FORBIDDEN', message: 'Insufficient permissions' },
                { code: 'INSUFFICIENT_PERMISSIONS', message: 'Your account lacks required permissions' },
              ]}
            />

            {/* Not Found Errors */}
            <ErrorSection
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Not Found Errors (404)"
              errors={[
                { code: 'NOT_FOUND', message: 'Resource not found' },
                { code: 'RESOURCE_NOT_FOUND', message: 'Requested resource does not exist' },
                { code: 'ENDPOINT_NOT_FOUND', message: 'API endpoint not found' },
              ]}
            />

            {/* Rate Limiting */}
            <ErrorSection
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Rate Limiting (429)"
              errors={[
                { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
              ]}
            />

            {/* Server Errors */}
            <ErrorSection
              icon={<ServerIcon className="w-5 h-5" />}
              title="Server Errors (500)"
              errors={[
                { code: 'INTERNAL_ERROR', message: 'An internal server error occurred' },
                { code: 'DATABASE_ERROR', message: 'Database operation failed' },
                { code: 'EXTERNAL_SERVICE_ERROR', message: 'External service unavailable' },
              ]}
            />

            {/* Business Logic Errors */}
            <ErrorSection
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Business Logic Errors"
              errors={[
                { code: 'CONFLICT', message: 'Resource conflict (e.g., duplicate entry)' },
                { code: 'OPERATION_FAILED', message: 'Requested operation could not be completed' },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      {/* Common Error Scenarios */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Common Error Scenarios</CardTitle>
            <CardDescription>Solutions for frequently encountered errors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorScenario
              title="Invalid API Key"
              code="401 UNAUTHORIZED"
              cause="The API key is missing, incorrect, or has been revoked."
              solutions={[
                'Verify the API key is copied correctly (no extra spaces)',
                'Check the key hasn\'t been revoked in Settings → API Keys',
                'Ensure the Authorization header uses "Bearer YOUR_KEY" format',
              ]}
            />
            <ErrorScenario
              title="Rate Limit Exceeded"
              code="429 RATE_LIMITED"
              cause="Too many requests were made within the rate limit window."
              solutions={[
                'Implement exponential backoff in your client',
                'Check X-RateLimit-Reset header for retry time',
                'Consider upgrading to Enterprise for higher limits',
              ]}
            />
            <ErrorScenario
              title="Invalid Request Format"
              code="400 VALIDATION_ERROR"
              cause="The request body or query parameters are invalid."
              solutions={[
                'Check the request body matches the expected schema',
                'Ensure required fields are included',
                'Verify data types (strings, numbers, booleans) are correct',
              ]}
            />
            <ErrorScenario
              title="Resource Not Found"
              code="404 NOT_FOUND"
              cause="The requested resource doesn't exist or you don't have access."
              solutions={[
                'Verify the resource ID is correct',
                'Check your API key has permission to access the resource',
                'Ensure the resource hasn\'t been deleted',
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatusCodeRange({
  code,
  title,
  description,
  color,
  codes
}: {
  code: string;
  title: string;
  description: string;
  color: string;
  codes: { code: string; desc: string }[];
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Badge className={colorClasses[color]}>{code}</Badge>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="grid md:grid-cols-2 gap-2">
        {codes.map((item) => (
          <div key={item.code} className="border rounded-lg p-3">
            <code className="text-sm font-mono">{item.code}</code>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorSection({
  icon,
  title,
  errors
}: {
  icon: React.ReactNode;
  title: string;
  errors: { code: string; message: string }[];
}) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-medium">Code</th>
              <th className="text-left py-2 px-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error) => (
              <tr key={error.code} className="border-b border-muted/50">
                <td className="py-2 px-3 font-mono text-xs">{error.code}</td>
                <td className="py-2 px-3 text-muted-foreground">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ErrorScenario({
  title,
  code,
  cause,
  solutions
}: {
  title: string;
  code: string;
  cause: string;
  solutions: string[];
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline">{code}</Badge>
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        <strong>Cause:</strong> {cause}
      </p>
      <p className="text-sm font-medium mb-2">Solutions:</p>
      <ul className="text-sm text-muted-foreground space-y-1">
        {solutions.map((solution, i) => (
          <li key={i} className="flex gap-2">
            <span>•</span>
            <span>{solution}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
