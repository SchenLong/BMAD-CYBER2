/**
 * BMAD Authentication & Authorization Framework
 * =============================================
 *
 * Exported authentication system providing token generation,
 * authorization checks, session management, and RBAC capabilities.
 */
export { generateToken } from '../../_bmad/core/security/generate-token.js';
export { validateToken } from '../../_bmad/core/security/validate-token.js';
export { checkAuthorization } from '../../_bmad/core/security/check-authorization.js';
export { SessionManager } from '../../_bmad/core/security/session-manager.js';
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
export declare class RBACManager {
    private roles;
    private userRoles;
    /**
     * Define a role with permissions
     */
    defineRole(role: Role): void;
    /**
     * Assign roles to a user
     */
    assignRoles(userId: string, roles: string[]): void;
    /**
     * Get all permissions for a user (including inherited)
     */
    getUserPermissions(userId: string): Permission[];
    /**
     * Check if user has specific permission
     */
    hasPermission(userId: string, resource: string, action: string): boolean;
    /**
     * Check if user has any of the specified roles
     */
    hasRole(userId: string, roles: string[]): boolean;
    /**
     * Get user roles
     */
    getUserRoles(userId: string): string[];
    /**
     * Remove role from user
     */
    removeUserRole(userId: string, role: string): void;
}
/**
 * Authentication Manager
 */
export declare class AuthManager {
    private config;
    private rbac;
    private sessions;
    constructor(config?: AuthConfig);
    private initializeDefaultRoles;
    /**
     * Authenticate user and create session
     */
    authenticate(credentials: UserCredentials): Promise<AuthToken | null>;
    /**
     * Validate token and return auth context
     */
    validateAuthToken(token: string): Promise<AuthContext | null>;
    /**
     * Check authorization for specific action
     */
    authorize(token: string, resource: string, action: string): Promise<boolean>;
    /**
     * Logout and invalidate session
     */
    logout(token: string): void;
    /**
     * Get RBAC manager for role management
     */
    getRBACManager(): RBACManager;
    /**
     * Get active sessions count
     */
    getActiveSessionsCount(): number;
}
/**
 * Authorization middleware for Express-like frameworks
 */
export declare function requireAuth(authManager: AuthManager): (req: any, res: any, next: any) => Promise<any>;
/**
 * Permission middleware for specific resource/action
 */
export declare function requirePermission(authManager: AuthManager, resource: string, action: string): (req: any, res: any, next: any) => Promise<any>;
/**
 * Convenience function to create auth manager with default configuration
 */
export declare function createAuthManager(config?: AuthConfig): AuthManager;
/**
 * Quick token generation for development/testing
 */
export declare function quickAuth(username: string, roles?: string[]): Promise<AuthToken | null>;
//# sourceMappingURL=index.d.ts.map