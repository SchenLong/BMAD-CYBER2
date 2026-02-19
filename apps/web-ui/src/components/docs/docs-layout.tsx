/**
 * Documentation Layout Component
 * Story 8.4: API Documentation
 * Task 1: Documentation Structure
 *
 * Provides layout with sidebar navigation for API documentation pages
 */

"use client"

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, BookOpen, Shield, Key, FolderOpen, FileText, Activity, AlertTriangle } from 'lucide-react';

/**
 * Documentation navigation item
 */
interface DocNavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: DocNavItem[];
}

/**
 * Documentation navigation structure
 */
const docNavItems: DocNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard/docs/api',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: 'authentication',
    label: 'Authentication',
    href: '/dashboard/docs/api/authentication',
    icon: <Key className="w-4 h-4" />,
  },
  {
    id: 'endpoints',
    label: 'API Endpoints',
    href: '/dashboard/docs/api/endpoints',
    icon: <Activity className="w-4 h-4" />,
    children: [
      {
        id: 'agents',
        label: 'Agents',
        href: '/dashboard/docs/api/endpoints/agents',
      },
      {
        id: 'workflows',
        label: 'Workflows',
        href: '/dashboard/docs/api/endpoints/workflows',
      },
      {
        id: 'projects',
        label: 'Projects',
        href: '/dashboard/docs/api/endpoints/projects',
      },
      {
        id: 'templates',
        label: 'Templates',
        href: '/dashboard/docs/api/endpoints/templates',
      },
      {
        id: 'api-keys',
        label: 'API Keys',
        href: '/dashboard/docs/api/endpoints/api-keys',
      },
    ],
  },
  {
    id: 'errors',
    label: 'Error Codes',
    href: '/dashboard/docs/api/errors',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    id: 'rate-limits',
    label: 'Rate Limiting',
    href: '/dashboard/docs/api/rate-limits',
    icon: <Shield className="w-4 h-4" />,
  },
];

/**
 * Check if a nav item is active
 */
function isActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Recursive nav item component
 */
function NavItem({ item, pathname, level = 0 }: { item: DocNavItem; pathname: string; level?: number }) {
  const active = isActive(item.href, pathname);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div key={item.id}>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
          'hover:bg-muted/50',
          active && 'bg-muted font-medium text-foreground',
          !active && 'text-muted-foreground',
          level > 0 && 'ml-4'
        )}
      >
        {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {hasChildren && (
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              active && 'rotate-90'
            )}
          />
        )}
      </Link>
      {hasChildren && active && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavItem key={child.id} item={child} pathname={pathname} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocsLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-muted/10 p-4 hidden md:block">
        <div className="sticky top-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">API Documentation</h2>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          </div>
          <nav className="space-y-1">
            {docNavItems.map((item) => (
              <NavItem key={item.id} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* Table of Contents (desktop) */}
      <aside className="w-64 border-l hidden xl:block p-4">
        <div className="sticky top-4">
          <h3 className="text-sm font-semibold mb-4">On This Page</h3>
          <div id="toc-content" className="space-y-2 text-sm text-muted-foreground">
            {/* TOC will be populated by client-side script */}
          </div>
        </div>
      </aside>
    </div>
  );
}
