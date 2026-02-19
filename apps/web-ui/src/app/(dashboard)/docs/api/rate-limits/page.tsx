/**
 * API Documentation - Rate Limiting
 * Story 8.4: API Documentation
 * Task 7: Rate Limit and Pagination Docs
 */

import { CodeBlock, InlineCode } from '@/components/docs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export default function RateLimitsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Rate Limiting</h1>
        <p className="text-lg text-muted-foreground">
          Understanding API rate limits and how to work within them
        </p>
      </div>

      {/* Overview */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Overview</CardTitle>
            <CardDescription>
              API requests are rate limited to ensure fair usage and system stability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The BMAD API implements tiered rate limiting based on your authentication method and role.
              Rate limits are applied per authenticated user or API key.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <Clock className="w-5 h-5 mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Per Minute</h4>
                <p className="text-sm text-muted-foreground">
                  Short burst limit for interactive use
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <Clock className="w-5 h-5 mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Per Hour</h4>
                <p className="text-sm text-muted-foreground">
                  Sustained usage limit over time
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <Gauge className="w-5 h-5 mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Sliding Window</h4>
                <p className="text-sm text-muted-foreground">
                  Limits reset dynamically, not on fixed intervals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rate Limit Tiers */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Tiers</CardTitle>
            <CardDescription>Different limits apply based on authentication method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Authentication</th>
                    <th className="text-left py-3 px-4 font-medium">Per Minute</th>
                    <th className="text-left py-3 px-4 font-medium">Per Hour</th>
                    <th className="text-left py-3 px-4 font-medium">Daily</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">API Key (Developer)</Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">60</td>
                    <td className="py-3 px-3 font-mono">1,000</td>
                    <td className="py-3 px-3 font-mono">10,000</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">API Key (Enterprise)</Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">200</td>
                    <td className="py-3 px-3 font-mono">5,000</td>
                    <td className="py-3 px-3 font-mono">50,000</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">Session Token</Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">100</td>
                    <td className="py-3 px-3 font-mono">2,000</td>
                    <td className="py-3 px-3 font-mono">20,000</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">Unauthenticated</Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">20</td>
                    <td className="py-3 px-3 font-mono">100</td>
                    <td className="py-3 px-3 font-mono">500</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Note:</strong> Enterprise API keys with higher rate limits are available for organizations
                with elevated usage requirements. Contact your account manager for details.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rate Limit Headers */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Headers</CardTitle>
            <CardDescription>
              Every API response includes rate limit information in headers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Check these headers to track your current rate limit status:
            </p>
            <div className="space-y-3">
              <RateLimitHeader
                name="X-RateLimit-Limit"
                description="Maximum requests allowed in the current window"
                example="60"
              />
              <RateLimitHeader
                name="X-RateLimit-Remaining"
                description="Requests remaining in the current window"
                example="45"
              />
              <RateLimitHeader
                name="X-RateLimit-Reset"
                description="Unix timestamp when the rate limit window resets"
                example="1704110400"
              />
              <RateLimitHeader
                name="Retry-After"
                description="Seconds to wait before retrying (only on 429 responses)"
                example="30"
              />
            </div>
            <CodeBlock
              code={`HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704110400

{"success": true, "data": {...}}`}
              language="bash"
            />
          </CardContent>
        </Card>
      </section>

      {/* Handling Rate Limits */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Handling Rate Limits</CardTitle>
            <CardDescription>Best practices for working within rate limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Check Headers Before Retry</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Always inspect rate limit headers to know when you can make your next request:
              </p>
              <CodeBlock
                code={`const response = await fetch(url, {
  headers: { 'Authorization': \`Bearer \${apiKey}\` }
});

const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

if (remaining === '0') {
  // Calculate wait time until reset
  const waitUntil = parseInt(reset) * 1000;
  const waitTime = waitUntil - Date.now();

  // Wait before making next request
  await new Promise(resolve => setTimeout(resolve, waitTime));
}`}
                language="javascript"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Implement Exponential Backoff</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When you receive a 429 response, implement exponential backoff:
              </p>
              <CodeBlock
                code={`async function fetchWithBackoff(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status !== 429) return response;

    // Exponential backoff: 1s, 2s, 4s...
    const waitTime = Math.pow(2, i) * 1000;
    const retryAfter = response.headers.get('Retry-After');
    const actualWait = retryAfter ? parseInt(retryAfter) * 1000 : waitTime;

    await new Promise(resolve => setTimeout(resolve, actualWait));
  }

  throw new Error('Max retries exceeded');
}`}
                language="javascript"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Use Pagination</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When fetching large datasets, use pagination to stay within rate limits:
              </p>
              <CodeBlock
                code={`async function fetchAllAgents() {
  let page = 1;
  const perPage = 50; // Maximize per page to reduce requests
  let allAgents = [];

  while (true) {
    const response = await fetch(
      \`/api/v1/agents?page=\${page}&perPage=\${perPage}\`
    );
    const data = await response.json();

    allAgents.push(...data.data.agents);

    if (!data.meta.pagination.hasNextPage) break;

    page++;
    // Add small delay to avoid hitting rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return allAgents;
}`}
                language="javascript"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pagination */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Pagination</CardTitle>
            <CardDescription>
              List endpoints support pagination for large result sets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Endpoints that return lists support these query parameters:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Parameter</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-left py-2 px-3 font-medium">Default</th>
                    <th className="text-left py-2 px-3 font-medium">Max</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted/50">
                    <td className="py-2 px-3 font-mono text-xs">page</td>
                    <td className="py-2 px-3">integer</td>
                    <td className="py-2 px-3">1</td>
                    <td className="py-2 px-3">-</td>
                    <td className="py-2 px-3 text-muted-foreground">Page number</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2 px-3 font-mono text-xs">perPage</td>
                    <td className="py-2 px-3">integer</td>
                    <td className="py-2 px-3">20</td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3 text-muted-foreground">Items per page</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Pagination Response Format</h4>
              <CodeBlock
                code={`{
  "success": true,
  "data": {
    "agents": [...]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "totalCount": 156,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}`}
                language="json"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Practices */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>Optimize your API usage to avoid rate limiting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <BestPracticeCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Monitor Usage"
                description="Track your rate limit consumption and implement client-side throttling"
              />
              <BestPracticeCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Batch Requests"
                description="Fetch as much data as possible per request using pagination and filtering"
              />
              <BestPracticeCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Use Webhooks"
                description="Configure webhooks for events instead of polling for status updates"
              />
              <BestPracticeCard
                icon={<AlertTriangle className="w-5 h-5" />}
                title="Graceful Degradation"
                description="Handle 429 responses gracefully with user-friendly error messages"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Increasing Limits */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Requesting Higher Limits</CardTitle>
            <CardDescription>Options for applications with higher API requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If your application requires higher rate limits, consider these options:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Enterprise API Keys</h4>
                  <p className="text-sm text-muted-foreground">
                    Request an Enterprise API key with 5x higher limits (200/min, 5,000/hour)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Dedicated Instances</h4>
                  <p className="text-sm text-muted-foreground">
                    For high-volume applications, inquire about dedicated instance deployments
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Caching Strategies</h4>
                  <p className="text-sm text-muted-foreground">
                    Implement client-side caching for reference data to reduce API calls
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function RateLimitHeader({
  name,
  description,
  example
}: {
  name: string;
  description: string;
  example: string;
}) {
  return (
    <div className="flex gap-3 border-b border-muted/50 pb-3 last:border-0 last:pb-0">
      <code className="text-sm font-mono min-w-[140px]">{name}</code>
      <div className="flex-1">
        <p className="text-sm">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">Example: {example}</p>
      </div>
    </div>
  );
}

function BestPracticeCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
