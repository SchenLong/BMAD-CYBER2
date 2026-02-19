/**
 * Navigation Configuration
 * Story 2.6: Role-Configured Navigation
 *
 * Role-based navigation items with icons, routes, and permissions
 */

import { UserRoleType } from '@/lib/types/onboarding';

/**
 * Navigation Item Interface
 */
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  roles: UserRoleType[];
  children?: NavItem[];
  badge?: number | string;
  disabled?: boolean;
}

/**
 * Navigation item with special 'ALL' role designation for items available to all users
 */
export type NavItemWithAllRoles = NavItem | Omit<NavItem, 'roles'> & { roles: (UserRoleType | 'ALL')[] };

/**
 * Secondary Navigation Item Interface
 */
export interface SecondaryNavItem {
  id: string;
  label: string;
  route: string;
}

/**
 * Secondary Navigation Context
 */
export type SecondaryNavContext =
  | 'team-selection'
  | 'agent-conversation'
  | 'project-view'
  | 'none';

/**
 * SOLO_OPERATOR Navigation Configuration
 * 5 items: Home, Projects, Templates, CLI, Settings
 */
export const SOLO_OPERATOR_NAV: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'Home',
    route: '/dashboard',
    roles: ['SOLO_OPERATOR'],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderOpen',
    route: '/dashboard/projects',
    roles: ['SOLO_OPERATOR', 'TEAM_LEAD'],
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: 'FileText',
    route: '/dashboard/workflows',
    roles: ['SOLO_OPERATOR', 'TEAM_LEAD'],
  },
  {
    id: 'cli',
    label: 'CLI',
    icon: 'Terminal',
    route: '/dashboard/advanced',
    roles: ['SOLO_OPERATOR', 'DEVELOPER'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings/security',
    roles: ['SOLO_OPERATOR', 'TEAM_LEAD', 'EXECUTIVE', 'DEVELOPER'] as UserRoleType[], // ALL roles
  },
];

/**
 * TEAM_LEAD Navigation Configuration
 * 6 items: Dashboard, Projects, Team, Reports, Templates, Settings
 */
export const TEAM_LEAD_NAV: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard/dashboard',
    roles: ['TEAM_LEAD', 'EXECUTIVE'],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderOpen',
    route: '/dashboard/projects',
    roles: ['TEAM_LEAD', 'SOLO_OPERATOR'],
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'Users',
    route: '/dashboard/agents',
    roles: ['TEAM_LEAD'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    route: '/dashboard/settings/sessions',
    roles: ['TEAM_LEAD', 'EXECUTIVE'],
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: 'FileText',
    route: '/dashboard/workflows',
    roles: ['TEAM_LEAD', 'SOLO_OPERATOR'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings/security',
    roles: ['SOLO_OPERATOR', 'TEAM_LEAD', 'EXECUTIVE', 'DEVELOPER'] as UserRoleType[], // ALL roles
  },
];

/**
 * EXECUTIVE Navigation Configuration
 * 4 items: Executive Summary, Briefs, Risks, Settings
 */
export const EXECUTIVE_NAV: NavItem[] = [
  {
    id: 'executive-summary',
    label: 'Executive Summary',
    icon: 'LayoutDashboard',
    route: '/dashboard/dashboard',
    roles: ['EXECUTIVE'],
  },
  {
    id: 'briefs',
    label: 'Briefs',
    icon: 'FileText',
    route: '/dashboard/projects',
    roles: ['EXECUTIVE'],
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: 'AlertTriangle',
    route: '/dashboard/agents',
    roles: ['EXECUTIVE'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings/security',
    roles: ['SOLO_OPERATOR', 'TEAM_LEAD', 'EXECUTIVE', 'DEVELOPER'] as UserRoleType[], // ALL roles
  },
];

/**
 * DEVELOPER Navigation Configuration
 * 5 items: API Docs, API Keys, Explorer, CLI, Webhooks
 */
export const DEVELOPER_NAV: NavItem[] = [
  {
    id: 'api-docs',
    label: 'API Docs',
    icon: 'BookOpen',
    route: '/dashboard/docs/api',
    roles: ['DEVELOPER'],
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: 'Key',
    route: '/dashboard/settings/api-keys',
    roles: ['DEVELOPER'],
  },
  {
    id: 'explorer',
    label: 'Explorer',
    icon: 'Search',
    route: '/dashboard/api-explorer',
    roles: ['DEVELOPER'],
  },
  {
    id: 'cli',
    label: 'CLI',
    icon: 'Terminal',
    route: '/dashboard/advanced',
    roles: ['DEVELOPER', 'SOLO_OPERATOR'],
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    icon: 'Webhook',
    route: '/dashboard/workflows',
    roles: ['DEVELOPER'],
  },
];

/**
 * Navigation Configuration by Role
 */
export const NAVIGATION_CONFIG: Record<UserRoleType, NavItem[]> = {
  SOLO_OPERATOR: SOLO_OPERATOR_NAV,
  TEAM_LEAD: TEAM_LEAD_NAV,
  EXECUTIVE: EXECUTIVE_NAV,
  DEVELOPER: DEVELOPER_NAV,
};

/**
 * Secondary Navigation Configuration by Context
 */

/**
 * Team Selection Context Secondary Nav
 */
export const TEAM_SELECTION_SECONDARY: SecondaryNavItem[] = [
  { id: 'agents', label: 'Agents', route: '/dashboard/agents' },
  { id: 'workflows', label: 'Workflows', route: '/dashboard/workflows' },
  { id: 'projects', label: 'Projects', route: '/dashboard/projects' },
];

/**
 * Agent Conversation Context Secondary Nav
 */
export const AGENT_CONVERSATION_SECONDARY: SecondaryNavItem[] = [
  { id: 'profile', label: 'Profile', route: '/dashboard/agents' },
  { id: 'related', label: 'Related Agents', route: '/dashboard/agents/roster' },
  { id: 'docs', label: 'Documentation', route: '/dashboard/dashboard' },
];

/**
 * Project View Context Secondary Nav
 */
export const PROJECT_VIEW_SECONDARY: SecondaryNavItem[] = [
  { id: 'overview', label: 'Overview', route: '/dashboard/projects' },
  { id: 'workflows', label: 'Workflows', route: '/dashboard/workflows' },
  { id: 'output', label: 'Output', route: '/dashboard/dashboard' },
  { id: 'history', label: 'History', route: '/dashboard/settings/sessions' },
];

/**
 * Secondary Navigation Configuration by Context
 */
export const SECONDARY_NAV_CONFIG: Record<
  Exclude<SecondaryNavContext, 'none'>,
  SecondaryNavItem[]
> = {
  'team-selection': TEAM_SELECTION_SECONDARY,
  'agent-conversation': AGENT_CONVERSATION_SECONDARY,
  'project-view': PROJECT_VIEW_SECONDARY,
};

/**
 * Get navigation items for a specific role
 * Filters items by role and handles 'ALL' role designation
 */
export function getNavigationForRole(role: UserRoleType | null): NavItem[] {
  if (!role) {
    return SOLO_OPERATOR_NAV; // Default to solo operator
  }

  const roleNav = NAVIGATION_CONFIG[role];
  if (!roleNav) {
    return SOLO_OPERATOR_NAV; // Default fallback
  }

  // Filter items that either:
  // 1. Include the user's role in their roles array
  // 2. Have all roles (items accessible to everyone)
  return roleNav.filter((item) =>
    item.roles.includes(role) || item.roles.length === 4
  );
}

/**
 * Get secondary navigation items for a context
 */
export function getSecondaryNavForContext(
  context: SecondaryNavContext
): SecondaryNavItem[] {
  if (context === 'none') return [];
  return SECONDARY_NAV_CONFIG[context] || [];
}

/**
 * Check if a nav item is active based on current route
 */
export function isNavActive(
  item: NavItem,
  currentRoute: string,
  exact: boolean = false
): boolean {
  if (exact) {
    return item.route === currentRoute;
  }
  // Check if current route starts with the nav item route
  return (
    currentRoute === item.route ||
    currentRoute.startsWith(`${item.route}/`) ||
    (item.route !== '/' && currentRoute.startsWith(item.route))
  );
}

/**
 * Find a nav item by its ID
 */
export function findNavItemById(
  id: string,
  role: UserRoleType | null
): NavItem | undefined {
  const navItems = getNavigationForRole(role);
  return navItems.find((item) => item.id === id);
}
