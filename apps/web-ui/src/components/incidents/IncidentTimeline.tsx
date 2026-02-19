/**
 * Incident Timeline Component
 * Story 6.6, Task 3: Timeline Visualization
 *
 * Displays:
 * - Chronological event log with timestamps
 * - Multi-contributor event entries with attribution
 * - Event filtering by severity and type
 * - Timeline search functionality
 * - Event attachment links
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  AlertTriangle,
  Shield,
  Bug,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  formatIncidentTime,
  type TimelineEvent,
  type TimelineEventType,
  type TimelineFilters,
} from '@/lib/types/incidents';

interface IncidentTimelineProps {
  events: TimelineEvent[];
  onAddEvent?: (message: string, type: TimelineEventType) => void;
  className?: string;
  editable?: boolean;
}

/**
 * Event type icon and color mapping
 */
const EVENT_TYPE_CONFIG: Record<
  TimelineEventType,
  { icon: React.ElementType; color: string; label: string }
> = {
  detection: {
    icon: AlertTriangle,
    color: 'rgb(234, 179, 8)',
    label: 'Detection',
  },
  analysis: {
    icon: Search,
    color: 'rgb(59, 130, 246)',
    label: 'Analysis',
  },
  containment_action: {
    icon: Shield,
    color: 'rgb(249, 115, 22)',
    label: 'Containment',
  },
  eradication_action: {
    icon: Bug,
    color: 'rgb(168, 85, 247)',
    label: 'Eradication',
  },
  recovery_action: {
    icon: Activity,
    color: 'rgb(34, 197, 94)',
    label: 'Recovery',
  },
  phase_change: {
    icon: CheckCircle,
    color: 'rgb(139, 92, 246)',
    label: 'Phase Change',
  },
  evidence_added: {
    icon: Paperclip,
    color: 'rgb(236, 72, 153)',
    label: 'Evidence',
  },
  note: {
    icon: FileText,
    color: 'rgb(107, 114, 128)',
    label: 'Note',
  },
  external_update: {
    icon: Activity,
    color: 'rgb(20, 184, 166)',
    label: 'External',
  },
};

/**
 * Event type badge component
 */
function EventTypeBadge({ type }: { type: TimelineEventType }) {
  const config = EVENT_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className="border-current/20 text-current gap-1.5"
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: `${config.color}30`,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Timeline event item component
 */
function TimelineEventItem({
  event,
  isExpanded,
  onToggle,
}: {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = EVENT_TYPE_CONFIG[event.type];
  const Icon = config.icon;
  const userName = event.userName || 'Unknown';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Timeline connecting line */}
      <div className="absolute left-0 top-8 bottom-0 w-px bg-border-subtle" />

      {/* Event dot */}
      <div
        className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background-base"
        style={{ backgroundColor: config.color }}
      />

      {/* Event content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <EventTypeBadge type={event.type} />
              <span className="text-xs text-text-muted">
                {formatIncidentTime(new Date(event.timestamp))}
              </span>
              {event.severity && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${
                      event.severity === 'critical'
                        ? 'rgb(239, 68, 68)'
                        : event.severity === 'high'
                        ? 'rgb(249, 115, 22)'
                        : event.severity === 'medium'
                        ? 'rgb(234, 179, 8)'
                        : 'rgb(59, 130, 246)'
                    }15`,
                    color:
                      event.severity === 'critical'
                        ? 'rgb(239, 68, 68)'
                        : event.severity === 'high'
                        ? 'rgb(249, 115, 22)'
                        : event.severity === 'medium'
                        ? 'rgb(234, 179, 8)'
                        : 'rgb(59, 130, 246)',
                  }}
                >
                  {event.severity}
                </Badge>
              )}
            </div>
            <p className="text-text-primary mt-2">{event.message}</p>
          </div>

          {/* User avatar */}
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="text-xs bg-background-hover text-text-secondary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Contributor attribution */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>by {userName}</span>
          <span>•</span>
          <span>{new Date(event.timestamp).toLocaleString()}</span>
        </div>

        {/* Expandable details */}
        {(event.details || event.attachmentIds) && (
          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show details
              </>
            )}
          </button>
        )}

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {/* Event details */}
            {event.details && (
              <div className="p-3 rounded-lg bg-background-hover border border-border-subtle">
                <div className="text-xs font-medium text-text-secondary mb-2">
                  Details
                </div>
                <pre className="text-xs text-text-tertiary overflow-x-auto">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </div>
            )}

            {/* Attachments */}
            {event.attachmentIds && event.attachmentIds.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Paperclip className="w-3 h-3" />
                <span>
                  {event.attachmentIds.length} attachment
                  {event.attachmentIds.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Timeline filter component
 */
function TimelineFilters({
  filters,
  onFiltersChange,
  availableTypes,
}: {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  availableTypes: TimelineEventType[];
}) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery || '');

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onFiltersChange({ ...filters, searchQuery: value || undefined });
  };

  const toggleEventType = (type: TimelineEventType) => {
    const current = filters.eventTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, eventTypes: updated.length > 0 ? updated : undefined });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.eventTypes?.length || filters.searchQuery;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search timeline..."
          className="pl-10 h-9"
        />
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-9">
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent-primary" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Event Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTypes.map((type) => {
            const config = EVENT_TYPE_CONFIG[type];
            const isSelected = filters.eventTypes?.includes(type);
            return (
              <DropdownMenuCheckboxItem
                key={type}
                checked={isSelected}
                onCheckedChange={() => toggleEventType(type)}
              >
                <div className="flex items-center gap-2">
                  <config.icon className="w-4 h-4" style={{ color: config.color }} />
                  {config.label}
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}
          <DropdownMenuSeparator />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full text-left px-2 py-1.5 text-sm text-accent-error hover:bg-accent-error/10 rounded"
            >
              Clear all filters
            </button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * New event input component
 */
function NewEventInput({
  onAdd,
  loading,
}: {
  onAdd: (message: string, type: TimelineEventType) => void;
  loading?: boolean;
}) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<TimelineEventType>('note');

  const handleSubmit = () => {
    if (message.trim()) {
      onAdd(message, type);
      setMessage('');
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border-subtle bg-background-hover">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Add Entry</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-7">
              {(() => {
                const config = EVENT_TYPE_CONFIG[type];
                const Icon = config.icon;
                return <Icon className="w-3.5 h-3.5" />;
              })()}
              {EVENT_TYPE_CONFIG[type].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setType(key as TimelineEventType)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-background-hover rounded"
              >
                <config.icon className="w-4 h-4" style={{ color: config.color }} />
                {config.label}
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what happened..."
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <Button onClick={handleSubmit} disabled={!message.trim() || loading} size="sm">
          Add
        </Button>
      </div>
    </div>
  );
}

/**
 * Main Incident Timeline Component
 */
export function IncidentTimeline({
  events,
  onAddEvent,
  className,
  editable = false,
}: IncidentTimelineProps) {
  const [filters, setFilters] = useState<TimelineFilters>({});
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const availableTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type));
    return Array.from(types) as TimelineEventType[];
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by event types
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      result = result.filter((e) => filters.eventTypes!.includes(e.type));
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.message.toLowerCase().includes(query) ||
          e.userName.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp descending (newest first)
    return result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events, filters]);

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Timeline
          </h2>
          <Badge variant="secondary" className="text-xs">
            {events.length} events
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <TimelineFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTypes={availableTypes}
      />

      {/* New Event Input */}
      {editable && (
        <NewEventInput
          onAdd={onAddEvent || (() => {})}
          loading={false}
        />
      )}

      {/* Timeline Events */}
      <div className="space-y-1">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No timeline events found</p>
            {filters.searchQuery || filters.eventTypes?.length ? (
              <p className="text-sm mt-1">Try adjusting your filters</p>
            ) : (
              <p className="text-sm mt-1">
                {editable ? 'Add an entry to get started' : 'Events will appear here'}
              </p>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              isExpanded={expandedEvents.has(event.id)}
              onToggle={() => toggleExpanded(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
