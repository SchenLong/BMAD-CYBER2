/**
 * BMAD Session Manager
 *
 * Manages authenticated sessions for the BMAD framework.
 * Provides session creation, validation, and user context.
 */
export interface Session {
    id: string;
    userId: string;
    userName: string;
    email?: string;
    roles: string[];
    modules: string[];
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
}
export interface AuthenticationResult {
    success: boolean;
    session?: Session;
    error?: string;
    errorCode?: 'NO_KEY' | 'NO_TOKEN' | 'INVALID_TOKEN' | 'EXPIRED_TOKEN';
    requiresAction?: 'generate_token';
}
export interface UserContext {
    authenticated: boolean;
    userId?: string;
    userName?: string;
    email?: string;
    roles?: string[];
    modules?: string[];
    sessionId?: string;
}
export interface AuthStatus {
    keyExists: boolean;
    tokenExists: boolean;
    tokenValid: boolean;
    expiresAt?: Date;
    hoursUntilExpiry?: number;
    userName?: string;
}
export declare class SessionManager {
    private sessions;
    private tokenGenerator;
    private config;
    constructor(projectRoot: string);
    private initializeTokenGenerator;
    /**
     * Authenticate user from token file
     */
    authenticate(): AuthenticationResult;
    /**
     * Create a new session from validated claims
     */
    private createSession;
    /**
     * Get existing session by ID
     */
    getSession(sessionId: string): Session | null;
    /**
     * Get user context for current session
     */
    getUserContext(sessionId: string): UserContext;
    /**
     * Check if user has required role
     */
    hasRole(sessionId: string, requiredRole: string): boolean;
    /**
     * Check if user has any of the required roles
     */
    hasAnyRole(sessionId: string, requiredRoles: string[]): boolean;
    /**
     * Check if user has access to module
     */
    hasModuleAccess(sessionId: string, moduleName: string): boolean;
    /**
     * End session
     */
    endSession(sessionId: string): void;
    /**
     * End all sessions (e.g., on token regeneration)
     */
    endAllSessions(): void;
    /**
     * Get authentication status summary
     */
    getAuthStatus(): AuthStatus;
    /**
     * Get formatted auth status message for display
     */
    getAuthStatusMessage(): string;
    /**
     * Get active session count
     */
    getActiveSessionCount(): number;
}
export declare function getSessionManager(projectRoot?: string): SessionManager;
export declare function resetSessionManager(): void;
//# sourceMappingURL=session-manager.d.ts.map