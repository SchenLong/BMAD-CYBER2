/**
 * Endpoint Card Component
 * Story 8.4: API Documentation
 * Task 2-3: Endpoint Documentation with Examples
 *
 * Displays API endpoint information with method badge, path, and description
 */

import { CodeBlock } from './code-block';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface EndpointCardProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authenticated?: boolean;
  parameters?: ParameterDoc[];
  requestBody?: RequestBodyDoc;
  responses: ResponseDoc[];
  examples?: CodeExampleDoc[];
}

interface ParameterDoc {
  name: string;
  in: 'query' | 'path' | 'header';
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  default?: string | number;
}

interface RequestBodyDoc {
  contentType: string;
  schema: Record<string, { type: string; description: string; required?: boolean }>;
  required: boolean;
  description: string;
}

interface ResponseDoc {
  status: number;
  description: string;
  example?: Record<string, unknown>;
}

interface CodeExampleDoc {
  language: 'javascript' | 'python' | 'curl';
  label: string;
  code: string;
}

/**
 * Method badge color mapping
 */
const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-500 border-green-500/20',
  POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PUT: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
  PATCH: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function EndpointCard({
  method,
  path,
  description,
  authenticated = true,
  parameters = [],
  requestBody,
  responses,
  examples = [],
}: EndpointCardProps) {
  return (
    <Card className="my-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge className={cn('font-mono text-sm px-2.5 py-1', methodColors[method])}>
            {method}
          </Badge>
          <code className="text-sm font-mono text-muted-foreground">{path}</code>
          {authenticated && (
            <Badge variant="outline" className="text-xs">
              Auth Required
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{description}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parameters */}
        {parameters.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Parameters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-left py-2 px-3 font-medium">In</th>
                    <th className="text-left py-2 px-3 font-medium">Required</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param) => (
                    <tr key={param.name} className="border-b border-muted/50">
                      <td className="py-2 px-3 font-mono text-xs">{param.name}</td>
                      <td className="py-2 px-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{param.type}</code>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-xs">{param.in}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        {param.required ? (
                          <span className="text-red-500">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {param.description}
                        {param.enum && (
                          <span className="block text-xs mt-1">
                            Enum: {param.enum.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Body */}
        {requestBody && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Request Body</h4>
            <CardDescription className="mb-3">{requestBody.description}</CardDescription>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Field</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-left py-2 px-3 font-medium">Required</th>
                    <th className="text-left py-2 px-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(requestBody.schema).map(([field, info]) => (
                    <tr key={field} className="border-b border-muted/50">
                      <td className="py-2 px-3 font-mono text-xs">{field}</td>
                      <td className="py-2 px-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{info.type}</code>
                      </td>
                      <td className="py-2 px-3">
                        {info.required !== false ? (
                          <span className="text-red-500">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{info.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Responses */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Responses</h4>
          <div className="space-y-3">
            {responses.map((response) => (
              <div key={response.status} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={response.status < 300 ? 'default' : response.status < 400 ? 'default' : 'destructive'}
                    className="font-mono"
                  >
                    {response.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{response.description}</span>
                </div>
                {response.example && (
                  <CodeBlock
                    code={JSON.stringify(response.example, null, 2)}
                    language="json"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples */}
        {examples.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Examples</h4>
            <Tabs defaultValue={examples[0]?.language}>
              <TabsList>
                {examples.map((example) => (
                  <TabsTrigger key={example.language} value={example.language}>
                    {example.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {examples.map((example) => (
                <TabsContent key={example.language} value={example.language}>
                  <CodeBlock code={example.code} language={example.language} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
