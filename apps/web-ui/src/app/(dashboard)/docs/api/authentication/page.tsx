/**
 * API Documentation - Authentication
 * Story 8.4: API Documentation
 * Task 4: Authentication Documentation
 */

import { CodeBlock, InlineCode } from '@/components/docs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AuthenticationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Authentication</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to authenticate your API requests with BMAD
        </p>
      </div>

      {/* Overview */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Methods</CardTitle>
            <CardDescription>
              BMAD supports two authentication methods for API access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4" />
                <h3 className="font-semibold">API Key (Recommended for Production)</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                API keys provide secure, programmatic access to the API. They can be scoped with specific permissions
                and are ideal for server-side integrations.
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Long-lived tokens (configurable expiration)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Scoped permissions (agents, workflows, projects, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Revocable at any time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Usage tracking and audit logging
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <h3 className="font-semibold">Session Token</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Session tokens are used by the web UI and can be used for API calls from authenticated sessions.
                They are short-lived and tied to user sessions.
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Automatically managed by the web application
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Inherits user permissions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Short-lived (1 hour default)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Key Format */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>API Key Format</CardTitle>
            <CardDescription>Understanding the structure of BMAD API keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              BMAD API keys follow this format:
            </p>
            <CodeBlock
              code={`bmad_sk_<64-character-random-string>`}
              language="bash"
            />
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="border rounded-lg p-3">
                <code className="text-xs font-mono">bmad</code>
                <p className="text-muted-foreground mt-1">Product identifier</p>
              </div>
              <div className="border rounded-lg p-3">
                <code className="text-xs font-mono">sk</code>
                <p className="text-muted-foreground mt-1">Secret key type</p>
              </div>
              <div className="border rounded-lg p-3">
                <code className="text-xs font-mono">64-char string</code>
                <p className="text-muted-foreground mt-1">Cryptographically random</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Using API Keys */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Using Your API Key</CardTitle>
            <CardDescription>Include your API key in requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bearer Token Method */}
            <div>
              <h3 className="font-semibold mb-3">Bearer Token (Recommended)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Include the API key in the Authorization header using the Bearer scheme:
              </p>
              <CodeBlock
                code={`curl -X GET "https://api.bmad.security/v1/agents" \\
  -H "Authorization: Bearer bmad_sk_your_key_here"`}
                language="curl"
              />
            </div>

            {/* X-API-Key Header */}
            <div>
              <h3 className="font-semibold mb-3">X-API-Key Header</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Alternatively, use the X-API-Key header:
              </p>
              <CodeBlock
                code={`curl -X GET "https://api.bmad.security/v1/agents" \\
  -H "X-API-Key: bmad_sk_your_key_here"`}
                language="curl"
              />
            </div>

            {/* JavaScript Example */}
            <div>
              <h3 className="font-semibold mb-3">JavaScript Example</h3>
              <CodeBlock
                code={`const apiKey = 'bmad_sk_your_key_here';

const response = await fetch('https://api.bmad.security/v1/agents', {
  headers: {
    'Authorization': \`Bearer \${apiKey}\`
  }
});

const data = await response.json();
console.log(data);`}
                language="javascript"
              />
            </div>

            {/* Python Example */}
            <div>
              <h3 className="font-semibold mb-3">Python Example</h3>
              <CodeBlock
                code={`import requests

api_key = 'bmad_sk_your_key_here'

headers = {
    'Authorization': f'Bearer {api_key}'
}

response = requests.get(
    'https://api.bmad.security/v1/agents',
    headers=headers
)

data = response.json()
print(data)`}
                language="python"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Generating API Keys */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Generating an API Key</CardTitle>
            <CardDescription>Create and manage your API keys through the web UI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Navigate to API Keys</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → API Keys in the BMAD web interface
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Create New Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Click &quot;Generate API Key&quot; and provide a name for identification
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Configure Permissions (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Scope the key to specific resources (e.g., agents:read, workflows:execute)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Copy Your Key</h4>
                  <p className="text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 inline-block text-yellow-500 mr-1" />
                    The full key is shown only once. Store it securely in environment variables.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Permissions Scoping */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>API Key Permissions</CardTitle>
            <CardDescription>Scope your API keys for principle of least privilege</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When creating an API key, you can specify which resources it can access. Available permissions:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <PermissionBadge permission="agents:read" description="View agent information" />
              <PermissionBadge permission="agents:execute" description="Invoke agents" />
              <PermissionBadge permission="workflows:read" description="View workflow information" />
              <PermissionBadge permission="workflows:execute" description="Execute workflows" />
              <PermissionBadge permission="projects:read" description="View projects" />
              <PermissionBadge permission="projects:write" description="Create and edit projects" />
              <PermissionBadge permission="templates:read" description="View templates" />
              <PermissionBadge permission="*" description="Full access (admin only)" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Token Refresh */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Token Refresh</CardTitle>
            <CardDescription>Session tokens can be refreshed before expiration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Session tokens expire after 1 hour. To maintain an active session, you can refresh your token:
            </p>
            <CodeBlock
              code={`curl -X POST "https://api.bmad.security/auth/refresh" \\
  -H "Content-Type: application/json" \\
  -c cookies.txt

# Response
{
  "success": true,
  "data": {
    "session": "new_session_token",
    "expiresAt": "2024-01-01T01:00:00.000Z"
  }
}`}
              language="curl"
            />
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Note:</strong> API keys do not need to be refreshed. They remain valid until revoked or expired.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Troubleshooting */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Common authentication issues and solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TroubleshootingItem
                code="401"
                title="Unauthorized"
                solution="Check that your API key is correct and hasn't been revoked. Ensure the Authorization header format is 'Bearer YOUR_KEY'."
              />
              <TroubleshootingItem
                code="403"
                title="Forbidden"
                solution="Your API key lacks the required permissions. Check the key's permissions in Settings → API Keys."
              />
              <TroubleshootingItem
                code="429"
                title="Rate Limited"
                solution="You've exceeded the rate limit. Check the X-RateLimit-Reset header for when to retry."
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PermissionBadge({
  permission,
  description
}: {
  permission: string;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-3">
      <code className="text-sm font-mono">{permission}</code>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function TroubleshootingItem({
  code,
  title,
  solution
}: {
  code: string;
  title: string;
  solution: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline">{code}</Badge>
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{solution}</p>
    </div>
  );
}
