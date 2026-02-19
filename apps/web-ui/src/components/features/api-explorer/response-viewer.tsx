/**
 * Response Viewer Component
 * Story 8.5: API Explorer
 * Task 5: Request Execution
 *
 * Displays API response with status, headers, and body
 */

"use client"

import React, { useState } from 'react';
import { useApiExplorerStore } from '@/stores/api-explorer-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return 'text-green-500';
  if (status >= 300 && status < 400) return 'text-blue-500';
  if (status >= 400 && status < 500) return 'text-yellow-500';
  return 'text-red-500';
};

const getStatusIcon = (status: number) => {
  if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4" />;
  if (status >= 300 && status < 400) return <AlertCircle className="w-4 h-4" />;
  if (status >= 400 && status < 500) return <XCircle className="w-4 h-4" />;
  return <XCircle className="w-4 h-4" />;
};

const getStatusLabel = (status: number) => {
  if (status >= 200 && status < 300) return 'Success';
  if (status >= 300 && status < 400) return 'Redirect';
  if (status === 400) return 'Bad Request';
  if (status === 401) return 'Unauthorized';
  if (status === 403) return 'Forbidden';
  if (status === 404) return 'Not Found';
  if (status >= 500) return 'Server Error';
  return status.toString();
};

export function ResponseViewer() {
  const { response, isLoading } = useApiExplorerStore();
  const [activeTab, setActiveTab] = useState('body');

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" />
          <p>Sending request...</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-center text-sm">
          Send a request to see the response here
        </p>
      </div>
    );
  }

  const { status, statusText, headers, body, duration } = response;

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <Badge
                variant="outline"
                className={getStatusColor(status)}
              >
                {status}
              </Badge>
              <span className="text-sm font-medium">{getStatusLabel(status)}</span>
              <span className="text-xs text-muted-foreground">({statusText})</span>
            </div>
            <span className="text-xs text-muted-foreground">{duration}ms</span>
          </div>
        </CardContent>
      </Card>

      {/* Response Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b">
          <div className="flex">
            <TabButton
              value="body"
              activeTab={activeTab}
              onClick={() => setActiveTab('body')}
            >
              Body
            </TabButton>
            <TabButton
              value="headers"
              activeTab={activeTab}
              onClick={() => setActiveTab('headers')}
            >
              Headers
            </TabButton>
          </div>
        </div>

        {activeTab === 'body' && (
          <ScrollArea className="flex-1">
            <div className="p-4">
              <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto">
                <code>{JSON.stringify(body, null, 2)}</code>
              </pre>
            </div>
          </ScrollArea>
        )}

        {activeTab === 'headers' && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="font-medium min-w-[120px] text-muted-foreground">
                    {key}:
                  </span>
                  <span className="font-mono text-xs break-all">{value}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

// Simple tabs implementation
function TabButton({
  value,
  activeTab,
  onClick,
  children
}: {
  value: string;
  activeTab: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        activeTab === value
          ? 'border-b-2 border-primary text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
