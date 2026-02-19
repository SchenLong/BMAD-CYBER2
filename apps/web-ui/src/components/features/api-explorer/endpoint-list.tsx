/**
 * Endpoint List Component
 * Story 8.5: API Explorer
 * Task 2: Endpoint Discovery
 *
 * Sidebar with grouped endpoints
 */

"use client"

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EndpointMetadata } from '@/stores/api-explorer-store';

interface EndpointListProps {
  selectedEndpoint: EndpointMetadata | null;
  onEndpointSelect: (endpoint: EndpointMetadata) => void;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
  POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
  PUT: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
  PATCH: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20',
};

export function EndpointList({ selectedEndpoint, onEndpointSelect }: EndpointListProps) {
  const [searchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['agents', 'workflows']));

  const groupedEndpoints = (window.apiExplorerEndpoints || []).map((group) => ({
    ...group,
    endpoints: group.endpoints.filter((e) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        e.path.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }),
  }));

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isSelected = (endpoint: EndpointMetadata) =>
    selectedEndpoint?.id === endpoint.id;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groupedEndpoints.map((group) => {
            const isExpanded = expandedCategories.has(group.id);
            const hasEndpoints = group.endpoints.length > 0;

            if (!hasEndpoints && searchQuery) {
              return null;
            }

            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleCategory(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded hover:bg-muted/50 transition-colors",
                    isExpanded && "bg-muted/30"
                  )}
                >
                  <span>{group.category}</span>
                  <span className="text-xs text-muted-foreground">
                    {group.endpoints.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-0.5">
                    {group.endpoints.map((endpoint) => (
                      <button
                        key={endpoint.id}
                        onClick={() => onEndpointSelect(endpoint)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-muted/50 transition-colors text-left",
                          isSelected(endpoint) && "bg-muted",
                          isSelected(endpoint) && "font-medium"
                        )}
                      >
                        <Badge className={cn('text-xs px-1 py-0', methodColors[endpoint.method])}>
                          {endpoint.method}
                        </Badge>
                        <span className="flex-1 truncate text-xs">
                          {endpoint.path
                            .replace(/\/v1\//, '')
                            .replace(/\{[^}]+\}/g, (match) => match)
                            .split('/')
                            .pop()}
                        </span>
                        {isSelected(endpoint) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
