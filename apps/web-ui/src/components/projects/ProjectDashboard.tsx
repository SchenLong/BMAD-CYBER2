'use client';

/**
 * Project Dashboard Component
 * Epic 6: Project Management System
 * Story 6.4: Project Dashboard
 *
 * Displays project cards with metrics, filtering, and sorting
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, MoreVertical, Shield, AlertTriangle, Search as SearchIcon, Lightbulb, ClipboardCheck, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ProjectType, type ProjectStatus, PROJECT_TYPE_CONFIG } from '@/lib/types/projects';

const PROJECT_TYPE_ICONS: Record<ProjectType, any> = {
  'security-assessment': Shield,
  'incident-response': AlertTriangle,
  'investigation': SearchIcon,
  'advisory': Lightbulb,
  'compliance': ClipboardCheck,
  'training': GraduationCap,
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  phase: string;
  completionPercent: number;
  updatedAt: Date;
  members: Array<{ role: string }>;
  _count: {
    members: number;
    workflows: number;
    artifacts: number;
    deliverables: number;
  };
}

interface ProjectDashboardProps {
  onCreateProject?: () => void;
  onProjectClick?: (project: Project) => void;
}

export function ProjectDashboard({ onCreateProject, onProjectClick }: ProjectDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'status'>('recent');

  useEffect(() => {
    fetchProjects();
  }, [filterType, filterStatus, sortBy]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy === 'name') params.append('sort', 'name');

      const response = await fetch(`/api/projects?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setProjects(result.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.projectCode.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleTypeChange = (value: string) => {
    setFilterType(value);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your security assessments, incidents, and investigations
          </p>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Project Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(PROJECT_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No projects found</p>
              <Button onClick={onCreateProject} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create your first project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const Icon = PROJECT_TYPE_ICONS[project.projectType];
            return (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onProjectClick?.(project)}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-mono text-xs">{project.projectCode}</span>
                    <span>•</span>
                    <span>{PROJECT_TYPE_CONFIG[project.projectType].name}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{project.completionPercent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${project.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Status and badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={STATUS_COLORS[project.status]}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {project.phase}
                    </Badge>
                  </div>

                  {/* Counts */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{project._count.members} members</span>
                    <span>•</span>
                    <span>{project._count.workflows} workflows</span>
                    <span>•</span>
                    <span>{project._count.deliverables} deliverables</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
