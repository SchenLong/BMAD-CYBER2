/**
 * Onboarding Types
 * Story 2.1: Role-Based Onboarding Wizard
 */

import { OnboardingRole } from '@prisma/client';

export type UserRoleType = OnboardingRole;

export const ONBOARDING_ROLES: Record<UserRoleType, RoleDefinition> = {
  SOLO_OPERATOR: {
    id: 'SOLO_OPERATOR',
    name: 'Solo Operator',
    description: 'Individual investigations and hands-on work',
    useCase: 'PI, Consultant, Researcher',
    icon: 'User',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  TEAM_LEAD: {
    id: 'TEAM_LEAD',
    name: 'Team Lead',
    description: 'Managing teams and client deliverables',
    useCase: 'Agency Manager, Department Head',
    icon: 'Users',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  EXECUTIVE: {
    id: 'EXECUTIVE',
    name: 'Executive',
    description: 'High-level oversight and decision-making',
    useCase: 'C-Suite, Director',
    icon: 'Target',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  DEVELOPER: {
    id: 'DEVELOPER',
    name: 'Developer',
    description: 'API access, automation, and technical integration',
    useCase: 'Technical users, integrations',
    icon: 'Code',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
} as const;

export interface RoleDefinition {
  id: UserRoleType;
  name: string;
  description: string;
  useCase: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  action: string;
}

export const ROLE_QUICK_ACTIONS: Record<UserRoleType, QuickAction[]> = {
  SOLO_OPERATOR: [
    { icon: 'Search', label: 'Intel Team', action: 'investigate' },
    { icon: 'Shield', label: 'Security Team', action: 'secure' },
    { icon: 'Chess', label: 'Strategy Team', action: 'strategy' },
  ],
  TEAM_LEAD: [
    { icon: 'ClipboardList', label: 'View Projects', action: 'projects' },
    { icon: 'Users', label: 'Delegate Task', action: 'delegate' },
    { icon: 'FileText', label: 'Generate Report', action: 'report' },
  ],
  EXECUTIVE: [
    { icon: 'BarChart3', label: 'Executive Dashboard', action: 'dashboard' },
    { icon: 'AlertTriangle', label: 'Risk Summary', action: 'risks' },
    { icon: 'FileText', label: 'One-Page Briefs', action: 'briefs' },
  ],
  DEVELOPER: [
    { icon: 'Key', label: 'API Keys', action: 'api-keys' },
    { icon: 'Book', label: 'Documentation', action: 'docs' },
    { icon: 'Terminal', label: 'CLI Reference', action: 'cli' },
  ],
};

export const DEFAULT_ONBOARDING_ROLE: UserRoleType = 'SOLO_OPERATOR';
