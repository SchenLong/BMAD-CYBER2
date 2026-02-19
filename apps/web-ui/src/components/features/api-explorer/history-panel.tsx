/**
 * History Panel Component
 * Story 8.5: API Explorer
 * Task 5: Request History
 *
 * Displays recent API requests and allows replaying them
 */

"use client"

import { useApiExplorerStore } from '@/stores/api-explorer-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  status?: number;
  success: boolean;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-500 border-green-500/20',
  POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PUT: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
  PATCH: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function HistoryPanel() {
  const { history, clearHistory, replayRequest } = useApiExplorerStore();

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No requests yet. Send a request to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          History ({history.length})
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-7 px-2 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {history.map((item) => (
              <HistoryEntry
                key={item.id}
                item={item}
                onReplay={() => replayRequest(item.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function HistoryEntry({ item, onReplay }: { item: HistoryItem; onReplay: () => void }) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={onReplay}
      className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Badge
          className={cn('font-mono text-xs px-1.5 py-0', methodColors[item.method])}
        >
          {item.method}
        </Badge>
        <span className="text-xs font-mono truncate flex-1">{item.path}</span>
        {item.status && (
          <Badge
            variant={item.status < 400 ? 'default' : 'destructive'}
            className="text-xs"
          >
            {item.status}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</span>
      </div>
    </button>
  );
}
