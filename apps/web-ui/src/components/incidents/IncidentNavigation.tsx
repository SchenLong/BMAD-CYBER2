/**
 * Incident-Specific Navigation Component
 * Story 6.6, Task 7: Incident-Specific Navigation
 *
 * Implements:
 * - Incident-specific tabs to project layout
 * - Incident dashboard view
 * - Incident quick actions menu
 * - Incident-specific breadcrumbs
 * - Incident status notification system
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  LayoutDashboard,
  Clock,
  FolderOpen,
  Users,
  FileText,
  Settings,
  Bell,
  MoreHorizontal,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { IncidentProject, IncidentSeverity } from '@/lib/types/incidents';
import { SEVERITY_COLORS } from '@/lib/types/incidents';

interface IncidentNavigationProps {
  incident: IncidentProject;
  basePath: string;
  unreadNotifications?: number;
  className?: string;
}

/**
 * Incident-specific tab configuration
 */
const INCIDENT_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: Clock,
    href: '/timeline',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    icon: FolderOpen,
    href: '/evidence',
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    href: '/team',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    href: '/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
] as const;

/**
 * Incident quick actions
 */
const QUICK_ACTIONS = [
  { id: 'add-note', label: 'Add Timeline Note', icon: FileText },
  { id: 'upload-evidence', label: 'Upload Evidence', icon: FolderOpen },
  { id: 'notify-stakeholders', label: 'Notify Stakeholders', icon: Bell },
  { id: 'assign-task', label: 'Assign Task', icon: Users },
] as const;

type QuickActionId = (typeof QUICK_ACTIONS)[number]['id'];

/**
 * Incident breadcrumbs component
 */
export function IncidentBreadcrumbs({
  incident,
  currentTab,
}: {
  incident: IncidentProject;
  currentTab?: string;
}) {
  const tabConfig = INCIDENT_TABS.find((t) => t.id === currentTab);

  return (
    <Breadcrumb className="text-sm">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="w-4 h-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="w-4 h-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/projects/${incident.id}`}>
            {incident.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {currentTab && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{tabConfig?.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Incident status notification indicator
 */
export function IncidentNotificationIndicator({
  incident,
  unreadCount = 0,
  onClick,
}: {
  incident: IncidentProject;
  unreadCount?: number;
  onClick?: () => void;
}) {
  const hasNotifications = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-background-hover transition-colors"
    >
      <Bell className="w-5 h-5 text-text-secondary" />
      {hasNotifications && (
        <>
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-error rounded-full text-[10px] font-semibold text-text-primary flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </>
      )}
    </button>
  );
}

/**
 * Incident quick actions menu
 */
export function IncidentQuickActions({
  incident,
  onAction,
  disabled,
}: {
  incident: IncidentProject;
  onAction?: (action: QuickActionId) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          Quick Actions
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {incident.name}
          <Badge
            variant="outline"
            className="ml-2"
            style={{
              backgroundColor: `${SEVERITY_COLORS[incident.severity]}15`,
              color: SEVERITY_COLORS[incident.severity],
            }}
          >
            {incident.severity}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => onAction?.(action.id)}
              disabled={disabled}
            >
              <Icon className="w-4 h-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={`/projects/${incident.id}/settings`}
            className="flex items-center w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Incident Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Main Incident Navigation Component with Tabs
 */
export function IncidentNavigation({
  incident,
  basePath,
  unreadNotifications = 0,
  className,
}: IncidentNavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine active tab from pathname
  const activeTab = INCIDENT_TABS.find((tab) =>
    pathname === `${basePath}${tab.href}` ||
    (tab.href && pathname.startsWith(`${basePath}${tab.href}`))
  )?.id || INCIDENT_TABS[0].id;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      <IncidentBreadcrumbs incident={incident} currentTab={activeTab} />

      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${SEVERITY_COLORS[incident.severity]}20` }}
          >
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: SEVERITY_COLORS[incident.severity] }}
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              {incident.name}
            </h1>
            <p className="text-sm text-text-secondary font-mono">
              {incident.incidentId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IncidentNotificationIndicator
            incident={incident}
            unreadCount={unreadNotifications}
          />
          <IncidentQuickActions incident={incident} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
        {/* Desktop horizontal tabs */}
        <TabsList className="hidden md:flex w-full justify-start bg-transparent border-b border-border-subtle rounded-none p-0 gap-6">
          {INCIDENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const href = `${basePath}${tab.href}`;
            const isActive = activeTab === tab.id;

            return (
              <Link key={tab.id} href={href}>
                <TabsTrigger
                  value={tab.id}
                  className={cn(
                    'relative data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 border-b-2 rounded-none',
                    'data-[state=active]:border-accent-primary data-[state=active]:text-text-primary',
                    'data-[state=inactive]:border-transparent data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-text-primary',
                    'transition-colors gap-2'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              </Link>
            );
          })}
        </TabsList>

        {/* Mobile dropdown menu */}
        <div className="md:hidden">
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  {(() => {
                    const activeTabConfig = INCIDENT_TABS.find((t) => t.id === activeTab);
                    return activeTabConfig?.icon ? (
                      <activeTabConfig.icon className="w-4 h-4" />
                    ) : null;
                  })()}
                  {INCIDENT_TABS.find((t) => t.id === activeTab)?.label}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full">
              {INCIDENT_TABS.map((tab) => {
                const Icon = tab.icon;
                const href = `${basePath}${tab.href}`;
                const isActive = activeTab === tab.id;

                return (
                  <DropdownMenuItem key={tab.id} asChild>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-2 w-full',
                        isActive && 'bg-accent-primary/10'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tab Contents (rendered by each page) */}
        <TabsContent value={activeTab} className="mt-0">
          {/* Content is rendered by the page component */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Incident status banner for important notifications
 */
export function IncidentStatusBanner({
  incident,
  onDismiss,
}: {
  incident: IncidentProject;
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isCritical = incident.severity === 'critical';
  const needsAttention = incident.phase === 'identification' && isCritical;

  if (!needsAttention) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        isCritical
          ? 'bg-accent-error/10 border-accent-error/30'
          : 'bg-accent-warning/10 border-accent-warning/30'
      )}
    >
      <AlertTriangle
        className={cn(
          'w-5 h-5 shrink-0 mt-0.5',
          isCritical ? 'text-accent-error' : 'text-accent-warning'
        )}
      />
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            isCritical ? 'text-accent-error' : 'text-accent-warning'
          )}
        >
          {isCritical
            ? 'Critical incident requires immediate attention'
            : 'Incident needs attention'}
        </p>
        <p className="text-sm text-text-secondary mt-1">
          Ensure all team members are notified and response actions are
          documented.
        </p>
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="text-text-muted hover:text-text-primary transition-colors"
      >
        ×
      </button>
    </div>
  );
}
