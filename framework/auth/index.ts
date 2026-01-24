/**
 * BMAD Authentication & Authorization Framework
 * =============================================
 *
 * Exported authentication system providing token generation,
 * authorization checks, session management, and RBAC capabilities.
 */

// Import security modules for internal use and re-export
import crypto from 'crypto';
import { generateToken } from '../../_bmad/core/security/generate-token.js';
import { validateToken } from '../../_bmad/core/security/validate-token.js';
import { checkAuthorization } from '../../_bmad/core/security/check-authorization.js';
import { SessionManager } from '../../_bmad/core/security/session-manager.js';

// Re-export security modules
export { generateToken, validateToken, checkAuthorization, SessionManager };

/**
 * Authentication Types and Interfaces
 */
export interface AuthConfig {
  tokenExpiry?: number;
  refreshTokenExpiry?: number;
  enableRBAC?: boolean;
  secretKey?: string;
  algorithm?: 'HS256' | 'RS256';
  issuer?: string;
}

export interface UserCredentials {
  username: string;
  password?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope?: string[];
}

export interface AuthContext {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  isAuthenticated: boolean;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[];
}

/**
 * Role-Based Access Control (RBAC) Manager
 */
export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, string[]> = new Map();

  /**
   * Define a role with permissions
   */
  defineRole(role: Role): void {
    this.roles.set(role.name, role);
  }

  /**
   * Assign roles to a user
   */
  assignRoles(userId: string, roles: string[]): void {
    this.userRoles.set(userId, roles);
  }

  /**
   * Get all permissions for a user (including inherited)
   */
  getUserPermissions(userId: string): Permission[] {
    const userRoles = this.userRoles.get(userId) || [];
    const permissions: Permission[] = [];
    const visitedRoles = new Set<string>();

    const collectPermissions = (roleName: string) => {
      if (visitedRoles.has(roleName)) return;
      visitedRoles.add(roleName);

      const role = this.roles.get(roleName);
      if (!role) return;

      permissions.push(...role.permissions);

      // Collect inherited permissions
      if (role.inherits) {
        role.inherits.forEach(inheritedRole => {
          collectPermissions(inheritedRole);
        });
      }
    };

    userRoles.forEach(collectPermissions);
    return permissions;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(userId: string, resource: string, action: string): boolean {
    const permissions = this.getUserPermissions(userId);
    return permissions.some(p =>
      (p.resource === resource || p.resource === '*') &&
      (p.action === action || p.action === '*')
    );
  }

  /**
   * Check if user has any of the specified roles
   */
  hasRole(userId: string, roles: string[]): boolean {
    const userRoles = this.userRoles.get(userId) || [];
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): string[] {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Remove role from user
   */
  removeUserRole(userId: string, role: string): void {
    const userRoles = this.userRoles.get(userId) || [];
    const index = userRoles.indexOf(role);
    if (index !== -1) {
      userRoles.splice(index, 1);
      this.userRoles.set(userId, userRoles);
    }
  }
}

/**
 * Authentication Manager
 */
export class AuthManager {
  private config: Required<AuthConfig>;
  private rbac: RBACManager;
  private sessions: Map<string, AuthContext> = new Map();

  constructor(config: AuthConfig = {}) {
    this.config = {
      tokenExpiry: 3600, // 1 hour
      refreshTokenExpiry: 86400 * 7, // 7 days
      enableRBAC: true,
      secretKey: 'default-secret-key',
      algorithm: 'HS256',
      issuer: 'bmad-auth',
      ...config
    };
    this.rbac = new RBACManager();
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    // Define default BMAD roles
    this.rbac.defineRole({
      name: 'admin',
      description: 'Full system access',
      permissions: [
        { resource: '*', action: '*' }
      ]
    });

    this.rbac.defineRole({
      name: 'developer',
      description: 'Development and testing access',
      permissions: [
        { resource: 'modules', action: 'read' },
        { resource: 'modules', action: 'write' },
        { resource: 'tests', action: '*' },
        { resource: 'logs', action: 'read' }
      ]
    });

    this.rbac.defineRole({
      name: 'operator',
      description: 'Operational monitoring access',
      permissions: [
        { resource: 'modules', action: 'read' },
        { resource: 'logs', action: 'read' },
        { resource: 'metrics', action: 'read' }
      ]
    });

    this.rbac.defineRole({
      name: 'guest',
      description: 'Limited read-only access',
      permissions: [
        { resource: 'public', action: 'read' }
      ]
    });
  }

  /**
   * Authenticate user and create session
   */
  async authenticate(credentials: UserCredentials): Promise<AuthToken | null> {
    // In real implementation, validate credentials against user store
    // For now, we'll create a basic token

    try {
      // Validate username
      if (!credentials.username || credentials.username === undefined) {
        return null;
      }

      const userId = credentials.username; // Simplified for demo
      let roles = credentials.roles || [];

      // Handle empty roles array - default to guest
      if (roles.length === 0) {
        roles = ['guest'];
      }

      // Assign roles to user
      this.rbac.assignRoles(userId, roles);

      // Generate tokens
      const accessToken = await generateToken({
        userId,
        username: credentials.username,
        roles,
        sessionId: crypto.randomUUID()
      });

      // Create auth context
      const authContext: AuthContext = {
        userId,
        username: credentials.username,
        roles,
        permissions: this.rbac.getUserPermissions(userId).map(p => `${p.resource}:${p.action}`),
        sessionId: crypto.randomUUID(),
        isAuthenticated: true
      };

      this.sessions.set(accessToken, authContext);

      return {
        accessToken,
        expiresIn: this.config.tokenExpiry,
        tokenType: 'Bearer',
        scope: roles
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  }

  /**
   * Validate token and return auth context
   */
  async validateAuthToken(token: string): Promise<AuthContext | null> {
    try {
      const isValid = await validateToken(token);
      if (!isValid) return null;

      return this.sessions.get(token) || null;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  /**
   * Check authorization for specific action
   */
  async authorize(token: string, resource: string, action: string): Promise<boolean> {
    const authContext = await this.validateAuthToken(token);
    if (!authContext) return false;

    return this.rbac.hasPermission(authContext.userId, resource, action);
  }

  /**
   * Logout and invalidate session
   */
  logout(token: string): void {
    this.sessions.delete(token);
  }

  /**
   * Get RBAC manager for role management
   */
  getRBACManager(): RBACManager {
    return this.rbac;
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }
}

/**
 * Authorization middleware for Express-like frameworks
 */
export function requireAuth(authManager: AuthManager) {
  return async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token' });
    }

    const token = authHeader.substring(7);
    const authContext = await authManager.validateAuthToken(token);

    if (!authContext) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.auth = authContext;
    next();
  };
}

/**
 * Permission middleware for specific resource/action
 */
export function requirePermission(authManager: AuthManager, resource: string, action: string) {
  return async (req: any, res: any, next: any) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await authManager.authorize(
      req.headers.authorization.substring(7),
      resource,
      action
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

/**
 * Convenience function to create auth manager with default configuration
 */
export function createAuthManager(config?: AuthConfig): AuthManager {
  return new AuthManager(config);
}

/**
 * Quick token generation for development/testing
 */
export async function quickAuth(username: string, roles: string[] = ['guest']): Promise<AuthToken | null> {
  const authManager = createAuthManager();
  return await authManager.authenticate({ username, roles });
}