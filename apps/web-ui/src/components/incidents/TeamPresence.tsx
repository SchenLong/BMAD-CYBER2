/**
 * Team Presence Component
 * Story 6.6, Task 5: Team Presence Display
 *
 * Displays:
 * - Active team members with online status
 * - Current task assignment for each member
 * - Real-time presence updates
 * - Member quick-action buttons (message, assign)
 * - Last activity timestamp
 */

'use client';

import React from 'react';
import {
  Users,
  MessageSquare,
  UserPlus,
  Clock,
  Circle,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { TeamPresence, PresenceStatus } from '@/lib/types/incidents';
import { formatIncidentTime } from '@/lib/types/incidents';

interface TeamPresenceProps {
  members: TeamPresence[];
  onMessage?: (userId: string) => void;
  onAssign?: (userId: string) => void;
  className?: string;
  editable?: boolean;
}

/**
 * Status indicator with pulse animation for online users
 */
function StatusIndicator({ status }: { status: PresenceStatus }) {
  const isOnline = status === 'online';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isOnline && 'animate-pulse-subtle'
      )}
    >
      <Circle
        className={cn(
          'w-2.5 h-2.5',
          status === 'online' && 'fill-accent-success text-accent-success',
          status === 'away' && 'fill-accent-warning text-accent-warning',
          status === 'offline' && 'fill-text-muted text-text-muted'
        )}
      />
    </div>
  );
}

/**
 * Team member card component
 */
function TeamMemberCard({
  member,
  onMessage,
  onAssign,
  editable,
}: {
  member: TeamPresence;
  onMessage?: (userId: string) => void;
  onAssign?: (userId: string) => void;
  editable?: boolean;
}) {
  const initials = member.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-background-hover hover:border-border-default transition-colors">
      {/* Avatar with status indicator */}
      <div className="relative">
        <Avatar className="w-10 h-10">
          {member.avatar ? (
            <img src={member.avatar} alt={member.userName} />
          ) : (
            <AvatarFallback className="text-xs bg-background-base text-text-secondary">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusIndicator status={member.status} />
        </div>
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-text-primary truncate">
            {member.userName}
          </h4>
          <Badge variant="outline" className="text-xs">
            {member.role}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {member.currentTask ? (
            <span className="text-sm text-text-secondary truncate">
              {member.currentTask}
            </span>
          ) : (
            <span className="text-sm text-text-muted italic">
              No active task
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted">
          <Clock className="w-3 h-3" />
          <span>Active {formatIncidentTime(new Date(member.lastActivity))}</span>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onMessage?.(member.userId)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </DropdownMenuItem>
          {editable && (
            <DropdownMenuItem onClick={() => onAssign?.(member.userId)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Task
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Status filter component
 */
function StatusFilter({
  currentFilter,
  onFilterChange,
  counts,
}: {
  currentFilter: PresenceStatus | 'all';
  onFilterChange: (filter: PresenceStatus | 'all') => void;
  counts: Record<PresenceStatus | 'all', number>;
}) {
  const filters: Array<{ value: PresenceStatus | 'all'; label: string; color: string }> =
    [
      { value: 'all', label: 'All', color: 'text-text-secondary' },
      { value: 'online', label: 'Online', color: 'text-accent-success' },
      { value: 'away', label: 'Away', color: 'text-accent-warning' },
      { value: 'offline', label: 'Offline', color: 'text-text-muted' },
    ];

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            'hover:bg-background-hover',
            currentFilter === filter.value
              ? 'bg-background-elevated border border-border-subtle'
              : 'text-text-muted'
          )}
        >
          <span className={cn(filter.color)}>
            {filter.label}
          </span>
          <span className="ml-1.5 text-xs text-text-muted">
            ({counts[filter.value]})
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Compact team presence indicator for header
 */
export function TeamPresenceIndicator({
  members,
  className,
}: {
  members: TeamPresence[];
  className?: string;
}) {
  const onlineCount = members.filter((m) => m.status === 'online').length;
  const totalCount = members.length;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex -space-x-2">
        {members.slice(0, 3).map((member, index) => {
          const initials = member.userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <Avatar
              key={member.userId}
              className="w-7 h-7 border-2 border-background-base"
            >
              <AvatarFallback className="text-[10px] bg-background-elevated">
                {initials}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {totalCount > 3 && (
          <div className="w-7 h-7 rounded-full bg-background-elevated border-2 border-background-base flex items-center justify-center text-xs text-text-secondary">
            +{totalCount - 3}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Circle className="w-2 h-2 fill-accent-success text-accent-success" />
        <span className="text-sm text-text-secondary">
          {onlineCount}/{totalCount} online
        </span>
      </div>
    </div>
  );
}

/**
 * Main Team Presence Component
 */
export function TeamPresence({
  members,
  onMessage,
  onAssign,
  className,
  editable = false,
}: TeamPresenceProps) {
  const [statusFilter, setStatusFilter] = React.useState<PresenceStatus | 'all'>('all');

  const filteredMembers = React.useMemo(() => {
    if (statusFilter === 'all') return members;
    return members.filter((m) => m.status === statusFilter);
  }, [members, statusFilter]);

  const counts = React.useMemo(() => {
    return {
      all: members.length,
      online: members.filter((m) => m.status === 'online').length,
      away: members.filter((m) => m.status === 'away').length,
      offline: members.filter((m) => m.status === 'offline').length,
    };
  }, [members]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Team Presence
          </h2>
          <Badge variant="secondary" className="text-xs">
            {members.length} members
          </Badge>
          {counts.online > 0 && (
            <Badge variant="outline" className="text-xs text-accent-success border-accent-success/30">
              <Circle className="w-3 h-3 mr-1 fill-current" />
              {counts.online} online
            </Badge>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <StatusFilter
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        counts={counts}
      />

      {/* Team Members List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No team members found</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all'
                ? 'Try a different status filter'
                : 'Team members will appear here'}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.userId}
              member={member}
              onMessage={onMessage}
              onAssign={onAssign}
              editable={editable}
            />
          ))
        )}
      </div>
    </div>
  );
}
