/**
 * API Explorer Main Component
 * Story 8.5: API Explorer
 * Task 1: Explorer UI Structure
 *
 * Main container for the interactive API explorer
 */

"use client"

import { useEffect } from 'react';
import { useApiExplorerStore, EndpointMetadata } from '@/stores/api-explorer-store';
import { getAllEndpoints, type ParameterDef } from '@/lib/openapi/spec';
import { EndpointList } from './endpoint-list';
import { RequestBuilder } from './request-builder';
import { ResponseViewer } from './response-viewer';
import { CodeSnippet } from './code-snippet';
import { HistoryPanel } from './history-panel';
import { AuthSelector } from './auth-selector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ApiExplorer() {
  const {
    selectedEndpoint,
    response,
    isLoading,
    sendRequest,
    clearResponse,
    setSelectedEndpoint,
  } = useApiExplorerStore();

  // Convert OpenAPI endpoints to our format
  useEffect(() => {
    const openApiEndpoints = getAllEndpoints();
    const categories = ['Health', 'Agents', 'Workflows', 'Projects', 'Templates', 'API Keys'];

    // Group by category
    const groupedEndpoints = categories.map((category) => ({
      id: category.toLowerCase().replace(/\s+/g, '-'),
      category,
      endpoints: openApiEndpoints
        .filter((e) => e.tags.includes(category))
        .map((e) => ({
          id: `${e.method}-${e.path}`,
          method: e.method,
          path: e.path,
          category,
          description: e.summary,
          parameters: {
            query: (e.parameters?.filter((p) => p.in === 'query') ?? []) as ParameterDef[],
            path: (e.parameters?.filter((p) => p.in === 'path') ?? []) as ParameterDef[],
          },
          requestBody: e.requestBody
            ? {
                contentType: e.requestBody.contentType,
                schema: e.requestBody.schema,
                description: e.requestBody.description,
              }
            : undefined,
        })),
    }));

    // Store endpoints for the list component
    window.apiExplorerEndpoints = groupedEndpoints;
  }, []);

  const handleSendRequest = () => {
    sendRequest();
  };

  const handleEndpointSelect = (endpoint: EndpointMetadata) => {
    setSelectedEndpoint(endpoint);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">API Explorer</h2>
            <p className="text-sm text-muted-foreground">
              Test API endpoints directly from your browser
            </p>
          </div>
          <AuthSelector />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Endpoints */}
        <div className="w-72 border-r flex flex-col">
          <div className="p-3 border-b">
            <Input
              placeholder="Search endpoints..."
              className="h-9"
            />
          </div>
          <EndpointList
            selectedEndpoint={selectedEndpoint}
            onEndpointSelect={handleEndpointSelect}
          />
        </div>

        {/* Center - Request Builder */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEndpoint ? (
            <>
              <div className="flex-1 overflow-auto p-4">
                <RequestBuilder endpoint={selectedEndpoint} />
              </div>

              {/* Send Request Button */}
              <div className="border-t p-4 flex gap-2">
                <Button
                  onClick={handleSendRequest}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
                {response && (
                  <Button
                    variant="outline"
                    onClick={clearResponse}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-center">
                Select an endpoint from the list to get started
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Response & Code */}
        <div className="w-96 border-l flex flex-col">
          {/* Response */}
          <div className="flex-1 overflow-hidden">
            <ResponseViewer />
          </div>

          {/* Code Snippets */}
          {response && (
            <div className="border-t max-h-64">
              <CodeSnippet />
            </div>
          )}
        </div>

        {/* Far Right - History (collapsible on smaller screens) */}
        <div className="w-64 border-l hidden lg:block">
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

// Extend window type for our endpoint storage
declare global {
  interface Window {
    apiExplorerEndpoints?: {
      id: string;
      category: string;
      endpoints: EndpointMetadata[];
    }[];
  }
}
