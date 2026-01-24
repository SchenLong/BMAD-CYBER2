/**
 * BMAD Authentication & Authorization Framework
 * =============================================
 *
 * Exported authentication system providing token generation,
 * authorization checks, session management, and RBAC capabilities.
 */
// Re-export security modules
export { generateToken } from '../../_bmad/core/security/generate-token.js';
export { validateToken } from '../../_bmad/core/security/validate-token.js';
export { checkAuthorization } from '../../_bmad/core/security/check-authorization.js';
export { SessionManager } from '../../_bmad/core/security/session-manager.js';
/**
 * Role-Based Access Control (RBAC) Manager
 */
export class RBACManager {
    roles = new Map();
    userRoles = new Map();
    /**
     * Define a role with permissions
     */
    defineRole(role) {
        this.roles.set(role.name, role);
    }
    /**
     * Assign roles to a user
     */
    assignRoles(userId, roles) {
        this.userRoles.set(userId, roles);
    }
    /**
     * Get all permissions for a user (including inherited)
     */
    getUserPermissions(userId) {
        const userRoles = this.userRoles.get(userId) || [];
        const permissions = [];
        const visitedRoles = new Set();
        const collectPermissions = (roleName) => {
            if (visitedRoles.has(roleName))
                return;
            visitedRoles.add(roleName);
            const role = this.roles.get(roleName);
            if (!role)
                return;
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
    hasPermission(userId, resource, action) {
        const permissions = this.getUserPermissions(userId);
        return permissions.some(p => (p.resource === resource || p.resource === '*') &&
            (p.action === action || p.action === '*'));
    }
    /**
     * Check if user has any of the specified roles
     */
    hasRole(userId, roles) {
        const userRoles = this.userRoles.get(userId) || [];
        return roles.some(role => userRoles.includes(role));
    }
    /**
     * Get user roles
     */
    getUserRoles(userId) {
        return this.userRoles.get(userId) || [];
    }
    /**
     * Remove role from user
     */
    removeUserRole(userId, role) {
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
    config;
    rbac;
    sessions = new Map();
    constructor(config = {}) {
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
    initializeDefaultRoles() {
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
    async authenticate(credentials) {
        // In real implementation, validate credentials against user store
        // For now, we'll create a basic token
        try {
            const userId = credentials.username; // Simplified for demo
            const roles = credentials.roles || ['guest'];
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
            const authContext = {
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
        }
        catch (error) {
            console.error('Authentication failed:', error);
            return null;
        }
    }
    /**
     * Validate token and return auth context
     */
    async validateAuthToken(token) {
        try {
            const isValid = await validateToken(token);
            if (!isValid)
                return null;
            return this.sessions.get(token) || null;
        }
        catch (error) {
            console.error('Token validation failed:', error);
            return null;
        }
    }
    /**
     * Check authorization for specific action
     */
    async authorize(token, resource, action) {
        const authContext = await this.validateAuthToken(token);
        if (!authContext)
            return false;
        return this.rbac.hasPermission(authContext.userId, resource, action);
    }
    /**
     * Logout and invalidate session
     */
    logout(token) {
        this.sessions.delete(token);
    }
    /**
     * Get RBAC manager for role management
     */
    getRBACManager() {
        return this.rbac;
    }
    /**
     * Get active sessions count
     */
    getActiveSessionsCount() {
        return this.sessions.size;
    }
}
/**
 * Authorization middleware for Express-like frameworks
 */
export function requireAuth(authManager) {
    return async (req, res, next) => {
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
export function requirePermission(authManager, resource, action) {
    return async (req, res, next) => {
        if (!req.auth) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const hasPermission = await authManager.authorize(req.headers.authorization.substring(7), resource, action);
        if (!hasPermission) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}
/**
 * Convenience function to create auth manager with default configuration
 */
export function createAuthManager(config) {
    return new AuthManager(config);
}
/**
 * Quick token generation for development/testing
 */
export async function quickAuth(username, roles = ['guest']) {
    const authManager = createAuthManager();
    return await authManager.authenticate({ username, roles });
}
//# sourceMappingURL=index.js.map