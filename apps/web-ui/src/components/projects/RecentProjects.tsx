/**
 * Recent Projects Component
 * Story 2.2: Abdul Welcome Screen
 *
 * Displays up to 3 most recent projects for quick resume
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface RecentProject {
  id: string;
  name: string;
  team?: string | null;
  lastEdited: Date | string;
  status: 'active' | 'paused' | 'completed';
}

interface RecentProjectsProps {
  projects: RecentProject[];
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

export function RecentProjects({ projects, onProjectClick, className = '' }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Recent Projects
        </h2>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            No recent projects. Start a new project to see it here.
          </p>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: RecentProject['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'paused':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: RecentProject['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Recent Projects
      </h2>
      <div className="space-y-2">
        {projects.slice(0, 3).map((project) => {
          const lastEdited = typeof project.lastEdited === 'string'
            ? new Date(project.lastEdited)
            : project.lastEdited;

          return (
            <Card
              key={project.id}
              className="p-4 hover:bg-accent hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => onProjectClick?.(project.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{project.name}</h3>
                    <span
                      className={`size-2 rounded-full ${getStatusColor(project.status)}`}
                      aria-label={`${getStatusLabel(project.status)} project`}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project.team && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3" aria-hidden="true" />
                        <span className="truncate max-w-[100px]">{project.team}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" aria-hidden="true" />
                      <span>{formatDistanceToNow(lastEdited, { addSuffix: true })}</span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Open ${project.name}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
