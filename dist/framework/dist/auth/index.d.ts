/**
 * Authorization middleware for Express-like frameworks
 */
export function requireAuth(authManager: any): (req: any, res: any, next: any) => Promise<any>;
/**
 * Permission middleware for specific resource/action
 */
export function requirePermission(authManager: any, resource: any, action: any): (req: any, res: any, next: any) => Promise<any>;
/**
 * Convenience function to create auth manager with default configuration
 */
export function createAuthManager(config: any): AuthManager;
/**
 * Quick token generation for development/testing
 */
export function quickAuth(username: any, roles?: string[]): Promise<{
    accessToken: any;
    expiresIn: number;
    tokenType: string;
    scope: any;
} | null>;
/**
 * Role-Based Access Control (RBAC) Manager
 */
export class RBACManager {
    roles: Map<any, any>;
    userRoles: Map<any, any>;
    /**
     * Define a role with permissions
     */
    defineRole(role: any): void;
    /**
     * Assign roles to a user
     */
    assignRoles(userId: any, roles: any): void;
    /**
     * Get all permissions for a user (including inherited)
     */
    getUserPermissions(userId: any): any[];
    /**
     * Check if user has specific permission
     */
    hasPermission(userId: any, resource: any, action: any): boolean;
    /**
     * Check if user has any of the specified roles
     */
    hasRole(userId: any, roles: any): any;
    /**
     * Get user roles
     */
    getUserRoles(userId: any): any;
    /**
     * Remove role from user
     */
    removeUserRole(userId: any, role: any): void;
}
/**
 * Authentication Manager
 */
export class AuthManager {
    constructor(config?: {});
    config: {
        tokenExpiry: number;
        refreshTokenExpiry: number;
        enableRBAC: boolean;
        secretKey: string;
        algorithm: string;
        issuer: string;
    };
    rbac: RBACManager;
    sessions: Map<any, any>;
    initializeDefaultRoles(): void;
    /**
     * Authenticate user and create session
     */
    authenticate(credentials: any): Promise<{
        accessToken: any;
        expiresIn: number;
        tokenType: string;
        scope: any;
    } | null>;
    /**
     * Validate token and return auth context
     */
    validateAuthToken(token: any): Promise<any>;
    /**
     * Check authorization for specific action
     */
    authorize(token: any, resource: any, action: any): Promise<boolean>;
    /**
     * Logout and invalidate session
     */
    logout(token: any): void;
    /**
     * Get RBAC manager for role management
     */
    getRBACManager(): RBACManager;
    /**
     * Get active sessions count
     */
    getActiveSessionsCount(): number;
}
//# sourceMappingURL=index.d.ts.map