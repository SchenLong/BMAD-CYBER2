/**
 * Request Builder Component
 * Story 8.5: API Explorer
 * Task 3: Request Builder Interface
 *
 * Form for building and previewing API requests
 */

"use client"

import { useApiExplorerStore, type EndpointMetadata } from '@/stores/api-explorer-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, FileText } from 'lucide-react';

interface RequestBuilderProps {
  endpoint: EndpointMetadata;
}

export function RequestBuilder({ endpoint }: RequestBuilderProps) {
  const {
    pathParams,
    queryParams,
    headers,
    body,
    setPathParam,
    setQueryParam,
    setBody,
  } = useApiExplorerStore();

  // Build the displayed URL with path params
  const displayPath = endpoint.path.replace(/\{([^}]+)\}/g, (match) => {
    const value = pathParams[match.slice(1, -1)] || match;
    return value;
  });

  // Check if endpoint has body
  const hasBody = ['post', 'put', 'patch'].includes(endpoint.method);

  return (
    <div className="space-y-6">
      {/* Endpoint Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              {endpoint.method.toUpperCase()}
            </Badge>
            <code className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              /v1{displayPath}
            </code>
          </div>
          <CardTitle className="text-base">{endpoint.description}</CardTitle>
        </CardHeader>
      </Card>

      {/* Parameters */}
      {(endpoint.parameters?.path?.length || 0) > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            Path Parameters
          </h3>
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-3">
              {endpoint.parameters.path?.map((param) => (
                <div key={param.name}>
                  <Label htmlFor={`path-${param.name}`} className="text-xs">
                    {param.name}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={`path-${param.name}`}
                    value={pathParams[param.name] || ''}
                    onChange={(e) => setPathParam(param.name, e.target.value)}
                    placeholder={param.type}
                    className="h-8"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {(endpoint.parameters?.query?.length || 0) > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            Query Parameters
          </h3>
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-3">
              {endpoint.parameters.query?.map((param) => (
                <div key={param.name}>
                  <Label htmlFor={`query-${param.name}`} className="text-xs">
                    {param.name}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {param.enum ? (
                    <select
                      id={`query-${param.name}`}
                      value={queryParams[param.name] || ''}
                      onChange={(e) => setQueryParam(param.name, e.target.value)}
                      className="w-full h-8 px-2 text-sm bg-background border rounded-md"
                    >
                      <option value="">Select...</option>
                      {param.enum.map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={`query-${param.name}`}
                      value={queryParams[param.name] || ''}
                      onChange={(e) => setQueryParam(param.name, e.target.value)}
                      placeholder={param.type}
                      className="h-8"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Body */}
      {hasBody && endpoint.requestBody && (
        <div>
          <h3 className="text font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Request Body
          </h3>
          <Card>
            <CardContent className="pt-4">
              <Tabs defaultValue="body">
                <TabsList>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="mt-2">
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={JSON.stringify(
                      Object.fromEntries(
                        Object.entries(endpoint.requestBody.schema).map(([k, v]) => [
                          k,
                          v.type,
                        ])
                      ),
                      null,
                      2
                    )}
                    className="font-mono text-sm min-h-[120px]"
                  />
                </TabsContent>
                <TabsContent value="schema" className="mt-2">
                  <div className="space-y-2">
                    {Object.entries(endpoint.requestBody.schema).map(([field, info]) => (
                      <div key={field} className="flex items-center gap-2 text-sm">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{field}</code>
                        <span className="text-muted-foreground">({info.type})</span>
                        {info.required !== false && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Headers */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          Headers
        </h3>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 space-y-3">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key}>
                <Label htmlFor={`header-${key}`} className="text-xs">
                  {key}
                </Label>
                <Input
                  id={`header-${key}`}
                  value={value}
                  onChange={(e) => {
                    // Headers are handled differently in the store
                    useApiExplorerStore.getState().setHeader(key, e.target.value);
                  }}
                  className="h-8 font-mono text-xs"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
