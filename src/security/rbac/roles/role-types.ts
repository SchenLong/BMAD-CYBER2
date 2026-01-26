/**
 * Role Types and Definitions
 * Defines enterprise role structure and hierarchy
 */

export enum RoleLevel {
  GUEST = 0,
  USER = 1,
  PREMIUM = 2,
  MODERATOR = 3,
  ADMIN = 4,
  SUPER_ADMIN = 5
}

export interface Role {
  id: string;
  name: string;
  level: RoleLevel;
  description: string;
  permissions: string[];
  inheritsFrom?: string[];
  isActive: boolean;
  created: Date;
}

export interface RoleHierarchy {
  role: string;
  parent?: string;
  children: string[];
  level: number;
}
